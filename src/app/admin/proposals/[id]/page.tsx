import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { REQUIRED_DOCS } from "@/lib/documents";
import { requireAdmin } from "@/lib/auth/dal";
import { VerifyDocumentButton } from "@/components/admin/verify-document-button";
import { formatDateTime } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
  PRESS_RELEASE: "Rilis Pers",
  PRESS_CONFERENCE: "Konferensi Pers",
  MEDIA_VISIT: "Kunjungan Pers",
  INTERVIEW: "Wawancara",
  EVENT_PARTNERSHIP: "Kemitraan Acara",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Diserahkan",
  IN_REVIEW: "Dalam Review",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

export const metadata = {
  title: "Detail Pengajuan",
  description:
    "Portal layanan pengajuan dan pengelolaan kerja sama publikasi antara Pemerintah Kota Sawahlunto dan media pers.",
};

type Document = {
  id: string;
  name: string;
  filename: string;
  url: string;
  size: number | null;
  uploadedAt: Date;
  verified: boolean;
  verifiedAt: Date | null;
  verifiedBy: string | null;
};

type ProposalDetail = {
  id: string;
  title: string;
  slug: string;
  status: string;
  type: string | null;
  scheduledAt: Date | null;
  location: string | null;
  budget: number | null;
  description: string | null;
  statusNote: string | null;
  referenceNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
  org: { name: string; slug: string; type: string } | null;
  category: { id: string; name: string } | null;
  author: { id: string; name: string | null; email: string } | null;
  documents: Document[];
};

function formatFileSize(size: number | null) {
  if (!size) return "";
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

export default async function AdminProposalDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const proposal = (await prisma.proposal.findUnique({
    where: { id },
    include: {
      org: { select: { name: true, slug: true, type: true } },
      category: { select: { id: true, name: true } },
      author: { select: { id: true, name: true, email: true } },
      documents: { orderBy: { uploadedAt: "desc" } },
    },
  })) as ProposalDetail | null;

  if (!proposal) redirect("/admin");

  const docStatus = REQUIRED_DOCS.map((docName) => {
    const doc = proposal.documents.find((d) => d.name === docName);
    return {
      name: docName,
      uploaded: !!doc,
      verified: doc?.verified ?? false,
      document: doc ?? null,
    };
  });

  const uploadedCount = docStatus.filter((d) => d.uploaded).length;
  const verifiedCount = docStatus.filter((d) => d.verified).length;
  const allVerified = uploadedCount === REQUIRED_DOCS.length && verifiedCount === REQUIRED_DOCS.length;

  return (
    <div className="page-shell" style={{ padding: "76px 48px", gap: 32 }}>
      {/* ── Page header + reference number ── */}
      <div className="reveal" style={{ width: "100%", textAlign: "left" }}>
        <p className="eyebrow">Admin Panel</p>
        <h1 className="section-h2">{proposal.title}</h1>
        <p className="lede">
          Dari {proposal.org?.name ?? "—"} · {formatDateTime(proposal.createdAt)}
        </p>

        <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 24 }}>
          {proposal.referenceNumber ? (
            <div>
              <p className="eyebrow-accent">Nomor Pengajuan</p>
              <span style={{
                display: "inline-block",
                padding: "4px 10px",
                fontSize: 18,
                fontWeight: 600,
                borderRadius: 2,
                background: "var(--color-orange-100)",
                color: "var(--color-accent)",
                marginTop: 4
              }}>
                {proposal.referenceNumber}
              </span>
            </div>
          ) : (
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              fontSize: 14,
              fontWeight: 500,
              borderRadius: 2,
              background: "var(--color-slate-200)",
              color: "var(--color-slate-600)"
            }}>
              <span className="material-symbols-rounded">schedule</span>
              Menunggu dokumen lengkap
            </span>
          )}

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              fontSize: 12,
              fontWeight: 500,
              borderRadius: 2,
              background: allVerified
                ? "var(--color-orange-100)"
                : proposal.status === "IN_REVIEW"
                  ? "var(--color-slate-200)"
                  : "var(--color-orange-200)",
              color: allVerified
                ? "var(--color-accent)"
                : proposal.status === "IN_REVIEW"
                  ? "var(--color-slate-700)"
                  : "var(--color-orange-800)"
            }}
          >
            {STATUS_LABELS[proposal.status] ?? proposal.status}
          </span>
        </div>

        {/* Verification progress */}
        <div style={{ marginTop: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-muted-foreground)" }}>
                  {verifiedCount}/{REQUIRED_DOCS.length} terverifikasi
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-muted-foreground)" }}>
                  {uploadedCount}/{REQUIRED_DOCS.length} terunggah
                </span>
              </div>
              <div style={{ height: 6, background: "var(--color-slate-200)", borderRadius: 2, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    background: "var(--color-accent)",
                    borderRadius: 2,
                    width: `${(verifiedCount / REQUIRED_DOCS.length) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Proposal details ── */}
      <div className="reveal reveal-delay-1" style={{ width: "100%" }}>
        <div className="panel" style={{ padding: 24 }}>
          <p className="eyebrow">Informasi Proposal</p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            marginTop: 20
          }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--color-muted-foreground)", marginBottom: 4 }}>Organisasi</p>
              <p style={{ fontSize: 14, color: "var(--color-ink)" }}>{proposal.org?.name ?? "—"}</p>
            </div>

            <div>
              <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--color-muted-foreground)", marginBottom: 4 }}>Kategori</p>
              <p style={{ fontSize: 14, color: "var(--color-ink)" }}>{proposal.category?.name ?? "Tanpa kategori"}</p>
            </div>

            <div>
              <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--color-muted-foreground)", marginBottom: 4 }}>Jenis</p>
              <p style={{ fontSize: 14, color: "var(--color-ink)" }}>
                {proposal.type ? TYPE_LABELS[proposal.type] ?? proposal.type : "—"}
              </p>
            </div>

            <div>
              <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--color-muted-foreground)", marginBottom: 4 }}>Penulis</p>
              <p style={{ fontSize: 14, color: "var(--color-ink)" }}>
                {proposal.author ? proposal.author.name ?? proposal.author.email : "—"}
              </p>
            </div>

            <div>
              <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--color-muted-foreground)", marginBottom: 4 }}>Jadwal</p>
              <p style={{ fontSize: 14, color: "var(--color-ink)" }}>
                {proposal.scheduledAt ? formatDateTime(proposal.scheduledAt) : "—"}
              </p>
            </div>

            <div>
              <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--color-muted-foreground)", marginBottom: 4 }}>Lokasi</p>
              <p style={{ fontSize: 14, color: "var(--color-ink)" }}>{proposal.location ?? "—"}</p>
            </div>

            <div>
              <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--color-muted-foreground)", marginBottom: 4 }}>Anggaran</p>
              <p style={{ fontSize: 14, color: "var(--color-ink)" }}>
                {proposal.budget != null ? `Rp ${proposal.budget.toLocaleString("id-ID")}` : "—"}
              </p>
            </div>
          </div>

          {proposal.description && (
            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--color-muted-foreground)", marginBottom: 8 }}>Deskripsi</p>
              <p style={{ fontSize: 14, lineHeight: 1.5, color: "var(--color-ink)" }}>{proposal.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Documents ── */}
      <div className="reveal reveal-delay-2" style={{ width: "100%" }}>
        <div style={{ marginBottom: 24 }}>
          <p className="eyebrow">Berita Acara Dokumen ({REQUIRED_DOCS.length} wajib)</p>
          <h2 className="step-h3" style={{ marginTop: 8 }}>Verifikasi Berkas</h2>
          <p className="lede" style={{ marginTop: 8 }}>
            Periksa setiap berkas yang diunggah. Dokumen yang terverifikasi akan
            otomatis menghasilkan Nomor Pengajuan ketika semua berkas lengkap dan diverifikasi.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {docStatus.map((doc) => {
            const uploaded = proposal.documents.find((d) => d.name === doc.name);
            return (
              <div key={doc.name} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
                borderRadius: 2,
                border: "1px solid var(--color-line)",
                background: "var(--color-panel)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
                  <span className="material-symbols-rounded" style={{
                    fontSize: 20,
                    color: doc.verified ? "var(--color-accent)" : uploaded ? "var(--color-muted-foreground)" : "var(--color-danger)"
                  }}>
                    {doc.verified ? "verified" : uploaded ? "pending_actions" : "upload_2"}
                  </span>
                  <div style={{ flex: 1 }}>
                    <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--color-ink)" }}>
                      {doc.name}
                    </span>
                    {uploaded ? (
                      <span style={{ fontSize: 12, color: "var(--color-muted-foreground)" }}>
                        Diunggah {formatDateTime(uploaded.uploadedAt)} · {formatFileSize(uploaded.size)}
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, color: "var(--color-danger)" }}>
                        Belum diunggah
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  {uploaded && (
                    <a
                      href={uploaded.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 12px",
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--color-ink)",
                        background: "var(--color-panel)",
                        border: "1px solid var(--color-line)",
                        borderRadius: 2,
                        textDecoration: "none",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <span className="material-symbols-rounded">visibility</span>
                      Praverifikasi
                    </a>
                  )}
                  {uploaded && (
                    <VerifyDocumentButton
                      documentId={uploaded.id}
                      verified={doc.verified}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* All verified banner */}
        {allVerified && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: 20,
            marginTop: 24,
            borderRadius: 2,
            border: "1px solid var(--color-line)",
            background: "var(--color-orange-50)"
          }}>
            <span className="material-symbols-rounded" style={{ fontSize: 24, color: "var(--color-accent)" }}>
              auto_awesome
            </span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-ink)", marginBottom: 4 }}>
                Semua dokumen telah terverifikasi.
              </p>
              <p className="lede">
                Nomor Pengajuan <strong>{proposal.referenceNumber}</strong> telah
                berhasil dibuat dan tersedia di dashboard.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Back link ── */}
      <div className="reveal reveal-delay-3" style={{ width: "100%" }}>
        <Link
          href="/admin"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 14,
            fontWeight: 500,
            color: "var(--color-ink)",
            textDecoration: "none",
            transition: "color 0.2s ease"
          }}
        >
          <span className="material-symbols-rounded">arrow_back</span>
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}