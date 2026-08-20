import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/dal";
import { VerifyDocumentButton } from "@/components/admin/verify-document-button";

type AllDocument = {
  id: string;
  name: string;
  filename: string;
  url: string;
  size: number | null;
  uploadedAt: Date;
  verified: boolean;
  verifiedAt: Date | null;
  proposal: {
    id: string;
    title: string;
    slug: string;
    status: string;
    referenceNumber: string | null;
    org: { name: string } | null;
  } | null;
};

function formatDateTime(d: Date) {
  return new Date(d).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatFileSize(size: number | null) {
  if (!size) return "—";
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

const DOC_ICONS: Record<string, string> = {
  "Surat Permohonan Kerjasama": "request_page",
  "Akta Notaris": "description",
  "Bukti Terverifikasi Dewan Pers": "fact_check",
  "NIB — Nomor Induk Berusaha": "pin",
  "Sertifikat Redaktur": "badge",
  "NPWP Perusahaan": "receipt_long",
};

function docIcon(name: string): string {
  return DOC_ICONS[name] ?? "picture_as_pdf";
}

const FILTERS = [
  { value: "all", label: "Semua" },
  { value: "unverified", label: "Perlu Diverifikasi" },
  { value: "verified", label: "Terverifikasi" },
] as const;

export const metadata = {
  title: "Semua Berkas",
  description:
    "Portal layanan pengajuan dan pengelolaan kerja sama publikasi antara Pemerintah Kota Sawahlunto dan media pers.",
};

export default async function AdminDocumentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ filter?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const filter = params?.filter ?? "all";

  const allDocuments = (await prisma.document.findMany({
    include: {
      proposal: {
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          referenceNumber: true,
          org: { select: { name: true } },
        },
      },
    },
    orderBy: { uploadedAt: "desc" },
  })) as AllDocument[];

  const filtered =
    filter === "unverified"
      ? allDocuments.filter((d) => !d.verified)
      : filter === "verified"
        ? allDocuments.filter((d) => d.verified)
        : allDocuments;

  const unverifiedCount = allDocuments.filter((d) => !d.verified).length;
  const verifiedCount = allDocuments.filter((d) => d.verified).length;

  return (
    <div className="page-shell" style={{ padding: "76px 48px", gap: 32 }}>
      {/* ── Page header ── */}
      <div className="reveal" style={{ width: "100%", textAlign: "left" }}>
        <p className="eyebrow">Admin Panel</p>
        <h1 className="section-h2">Semua Berkas</h1>
        <p className="lede" style={{ maxWidth: 680 }}>
          Kelola seluruh berkas unggahan dari perusahaan pers. Verifikasi dokumen dan Nomor
          Pengajuan akan otomatis terbentuk saat semua berkas lengkap dan terverifikasi.
        </p>
      </div>

      {/* ── Summary stat cards ── */}
      <div className="reveal reveal-delay-1" style={{ width: "100%" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
          marginBottom: 32
        }}>
          <div className="panel" style={{ padding: 24 }}>
            <p className="eyebrow" style={{ marginBottom: 8 }}>Total Berkas</p>
            <p className="font-heading" style={{ fontSize: 32, lineHeight: 1, color: "var(--color-ink)" }}>
              {allDocuments.length}
            </p>
          </div>
          <div className="panel" style={{ padding: 24 }}>
            <p className="eyebrow" style={{ marginBottom: 8, color: "var(--color-accent)" }}>Perlu Diverifikasi</p>
            <p className="font-heading" style={{ fontSize: 32, lineHeight: 1, color: "var(--color-accent)" }}>
              {unverifiedCount}
            </p>
          </div>
          <div className="panel" style={{ padding: 24 }}>
            <p className="eyebrow" style={{ marginBottom: 8 }}>Terverifikasi</p>
            <p className="font-heading" style={{ fontSize: 32, lineHeight: 1, color: "var(--color-ink)" }}>
              {verifiedCount}
            </p>
          </div>
        </div>
      </div>

      {/* ── Filter tabs ── */}
      <div className="reveal reveal-delay-2" style={{ width: "100%", marginBottom: 24 }}>
        <div style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap"
        }}>
          {FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <Link
                key={f.value}
                href={`/admin/documents?filter=${f.value}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  fontSize: 13,
                  fontWeight: 500,
                  color: active ? "var(--color-white)" : "var(--color-muted-foreground)",
                  borderRadius: 2,
                  border: "1px solid var(--color-line)",
                  background: active ? "var(--color-accent)" : "var(--color-panel)",
                  textDecoration: "none",
                  transition: "all 0.2s ease"
                }}
              >
                {f.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Documents grid ── */}
      <div className="reveal reveal-delay-3" style={{ width: "100%" }}>
        {filtered.length === 0 ? (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 24px",
            textAlign: "center"
          }}>
            <span className="material-symbols-rounded" style={{
              fontSize: 48,
              color: "var(--color-muted-foreground)",
              marginBottom: 16
            }}>
              inbox
            </span>
            <p className="lede">
              {filter === "unverified"
                ? "Tidak ada berkas yang perlu diverifikasi."
                : filter === "verified"
                  ? "Tidak ada berkas yang terverifikasi."
                  : "Belum ada berkas yang diunggah."}
            </p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 20
          }}>
            {filtered.map((doc) => {
              const icon = docIcon(doc.name);
              return (
                <div key={doc.id} className="panel" style={{ borderRadius: 2, border: "1px solid var(--color-line)", background: "var(--color-panel)", overflow: "hidden" }}>
                  <div style={{ padding: 20, borderBottom: "1px solid var(--color-line)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <span className="material-symbols-rounded" style={{
                        fontSize: 20,
                        color: doc.verified ? "var(--color-accent)" : "var(--color-muted-foreground)"
                      }}>
                        {doc.verified ? "verified" : icon}
                      </span>
                      <div style={{ flex: 1 }}>
                        <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--color-ink)", marginBottom: 4 }}>
                          {doc.name}
                        </span>
                        {doc.proposal?.org?.name && (
                          <span style={{ display: "block", fontSize: 13, color: "var(--color-ink)", fontWeight: 500, marginBottom: 4 }}>
                            {doc.proposal.org.name}
                          </span>
                        )}
                        <span style={{ fontSize: 12, color: "var(--color-muted-foreground)" }}>
                          Diunggah {formatDateTime(doc.uploadedAt)} • {formatFileSize(doc.size)}
                        </span>
                        {doc.proposal?.referenceNumber ? (
                          <span style={{
                            display: "inline-block",
                            marginTop: 8,
                            padding: "4px 10px",
                            fontSize: 12,
                            fontWeight: 600,
                            borderRadius: 2,
                            background: "var(--color-orange-100)",
                            color: "var(--color-accent)"
                          }}>
                            {doc.proposal.referenceNumber}
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: "var(--color-danger)", marginTop: 8, display: "block" }}>
                            Belum ada nomor
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, padding: 16, background: "var(--color-slate-50)" }}>
                    <a
                      href={doc.url}
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
                    {!doc.verified && (
                      <VerifyDocumentButton
                        documentId={doc.id}
                        verified={doc.verified}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}