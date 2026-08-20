import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { REQUIRED_DOCS } from "@/lib/documents";
import { getAdminAllDocuments, type PaginatedResult } from "@/lib/db/queries";
import { requireAdmin } from "@/lib/auth/dal";
import { VerifyDocumentButton } from "@/components/admin/verify-document-button";

type ProposalWithDocs = {
  id: string;
  slug: string;
  title: string;
  status: string;
  referenceNumber: string | null;
  createdAt: Date;
  org: { name: string; slug: string } | null;
  documents: {
    id: string;
    name: string;
    verified: boolean;
  }[];
};

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

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Diserahkan",
  IN_REVIEW: "Dalam Review",
  APPROVED: "Disetujui",
};

const STATUS_CLASSES: Record<string, string> = {
  SUBMITTED: "admin-badge-submitted",
  IN_REVIEW: "admin-badge-in-review",
  APPROVED: "admin-badge-approved",
};

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("id-ID", {
    dateStyle: "medium",
  });
}

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

const DOC_FILTERS = [
  { value: "all", label: "Semua" },
  { value: "unverified", label: "Perlu Diverifikasi" },
  { value: "verified", label: "Terverifikasi" },
] as const;

export const metadata = {
  title: "Dashboard Admin",
  description:
    "Portal layanan pengajuan dan pengelolaan kerja sama publikasi antara Pemerintah Kota Sawahlunto dan media pers.",
};

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ docFilter?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const docFilter = params?.docFilter ?? "all";

  const [submissions, allDocuments] = await Promise.all([
    prisma.proposal.findMany({
      where: {
        status: { in: ["SUBMITTED", "IN_REVIEW", "APPROVED"] },
      },
      include: {
        org: { select: { name: true, slug: true } },
        documents: { select: { id: true, name: true, verified: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    getAdminAllDocuments(1, 1000),
  ]);

  const typed = submissions as ProposalWithDocs[];
  const docsResult = allDocuments as PaginatedResult<unknown>;
  const docs = docsResult.data as AllDocument[];

  const total = typed.length;
  const pending = typed.filter((p) => p.status === "SUBMITTED").length;
  const inReview = typed.filter((p) => p.status === "IN_REVIEW").length;
  const approved = typed.filter((p) => p.status === "APPROVED").length;

  const getDocProgress = (p: ProposalWithDocs) => {
    const required = REQUIRED_DOCS;
    const uploaded = required.filter((d) =>
      p.documents.some((doc) => doc.name === d),
    );
    const verified = uploaded.filter((d) =>
      p.documents.some((doc) => doc.name === d && doc.verified),
    );
    return { uploaded: uploaded.length, total: required.length, verified: verified.length };
  };

  // ── Group documents by proposal for the consolidated view ──
  const docsWithRef = docs.map((d) => ({
    ...d,
    refNumber: d.proposal?.referenceNumber ?? null,
  }));

  // Apply document filter
  const filteredDocs =
    docFilter === "unverified"
      ? docsWithRef.filter((d) => !d.verified)
      : docFilter === "verified"
        ? docsWithRef.filter((d) => d.verified)
        : docsWithRef;

  const unverifiedCount = docsWithRef.filter((d) => !d.verified).length;
  const verifiedCount = docsWithRef.filter((d) => d.verified).length;

  return (
    <div className="page-shell" style={{ padding: "76px 48px", gap: 32 }}>
      {/* ── Page header ── */}
      <div className="reveal" style={{ width: "100%", textAlign: "left" }}>
        <p className="eyebrow">Admin Panel</p>
        <h1 className="section-h2">Dashboard Verifikasi Dokumen</h1>
        <p className="lede" style={{ maxWidth: 680 }}>
          Kelola semua berkas unggahan perusahaan pers. Verifikasi dokumen dan Nomor Pengajuan
          akan otomatis terbentuk saat semua berkas lengkap dan terverifikasi.
        </p>
      </div>

      {/* ── Summary stat cards ── */}
      <div className="reveal reveal-delay-1" style={{ width: "100%" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 20,
          marginBottom: 32
        }}>
          <div className="panel" style={{ padding: 24 }}>
            <p className="eyebrow" style={{ marginBottom: 8 }}>Total Pengajuan</p>
            <p className="font-heading" style={{ fontSize: 32, lineHeight: 1, color: "var(--color-ink)" }}>
              {total}
            </p>
          </div>
          <div className="panel" style={{ padding: 24 }}>
            <p className="eyebrow" style={{ marginBottom: 8, color: "var(--color-accent)" }}>Menunggu Verifikasi</p>
            <p className="font-heading" style={{ fontSize: 32, lineHeight: 1, color: "var(--color-accent)" }}>
              {pending}
            </p>
          </div>
          <div className="panel" style={{ padding: 24 }}>
            <p className="eyebrow" style={{ marginBottom: 8 }}>Dalam Review</p>
            <p className="font-heading" style={{ fontSize: 32, lineHeight: 1, color: "var(--color-ink)" }}>
              {inReview}
            </p>
          </div>
          <div className="panel" style={{ padding: 24 }}>
            <p className="eyebrow" style={{ marginBottom: 8 }}>Terverifikasi</p>
            <p className="font-heading" style={{ fontSize: 32, lineHeight: 1, color: "var(--color-ink)" }}>
              {approved}
            </p>
          </div>
        </div>
      </div>

      {/* ── All uploaded documents — consolidated verification view ── */}
      <div className="reveal reveal-delay-2" style={{ width: "100%" }}>
        <div style={{ marginBottom: 24 }}>
          <p className="eyebrow">Semua Berkas</p>
          <p className="lede" style={{ marginTop: 8 }}>
            {filteredDocs.length} berkas ditampilkan · {unverifiedCount} belum terverifikasi ·{" "}
            {verifiedCount} sudah terverifikasi · {docsWithRef.length} total
          </p>
        </div>

        {/* Filter tabs */}
        <div style={{
          display: "flex",
          gap: 8,
          marginBottom: 24,
          flexWrap: "wrap"
        }}>
          {DOC_FILTERS.map((f) => {
            const active = docFilter === f.value;
            return (
              <Link
                key={f.value}
                href={`/admin?docFilter=${f.value}`}
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

        <h2 className="step-h3" style={{ marginBottom: 20 }}>Berkas yang Perlu Diverifikasi</h2>

        {filteredDocs.length === 0 ? (
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
              {docFilter === "unverified"
                ? "Tidak ada berkas yang perlu diverifikasi."
                : docFilter === "verified"
                  ? "Tidak ada berkas yang terverifikasi."
                  : "Belum ada berkas yang diunggah."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredDocs.map((doc) => {
              const icon = docIcon(doc.name);
              return (
                <div key={doc.id} style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 16,
                  borderRadius: 2,
                  border: "1px solid var(--color-line)",
                  background: "var(--color-panel)",
                  transition: "border-color 0.2s ease"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0 }}>
                    <span className="material-symbols-rounded" style={{
                      fontSize: 20,
                      color: doc.verified ? "var(--color-accent)" : "var(--color-muted-foreground)"
                    }}>
                      {doc.verified ? "verified" : icon}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--color-ink)", marginBottom: 4 }}>
                        {doc.name}
                      </span>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                        {doc.proposal?.org?.name && (
                          <span style={{ fontSize: 13, color: "var(--color-ink)", fontWeight: 500 }}>
                            {doc.proposal.org.name}
                          </span>
                        )}
                        <span style={{ fontSize: 12, color: "var(--color-muted-foreground)" }}>
                          Diunggah {formatDateTime(doc.uploadedAt)}
                        </span>
                        <span style={{ fontSize: 12, color: "var(--color-muted-foreground)" }}>
                          {formatFileSize(doc.size)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                    {/* Reference number prominently displayed */}
                    {doc.refNumber ? (
                      <span style={{
                        display: "inline-block",
                        padding: "4px 10px",
                        fontSize: 12,
                        fontWeight: 600,
                        borderRadius: 2,
                        background: "var(--color-orange-100)",
                        color: "var(--color-accent)"
                      }}>
                        {doc.refNumber}
                      </span>
                    ) : (
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "2px 6px",
                        fontSize: 11,
                        fontWeight: 500,
                        borderRadius: 2,
                        background: "var(--color-slate-200)",
                        color: "var(--color-slate-600)"
                      }}>
                        <span className="material-symbols-rounded" style={{ fontSize: 14 }}>schedule</span>
                        Belum ada nomor
                      </span>
                    )}

                    {/* Verification status + action */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{
                        fontSize: 12,
                        fontWeight: 500,
                        padding: "4px 8px",
                        borderRadius: 2,
                        background: doc.verified ? "var(--color-orange-100)" : "var(--color-slate-200)",
                        color: doc.verified ? "var(--color-accent)" : "var(--color-slate-700)"
                      }}>
                        {doc.verified ? "Terverifikasi" : "Butuh Verifikasi"}
                      </span>
                      {!doc.verified && (
                        <VerifyDocumentButton documentId={doc.id} verified={doc.verified} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Submission table (overview of proposals) ── */}
      <div className="reveal reveal-delay-3" style={{ width: "100%" }}>
        <div style={{ marginBottom: 24 }}>
          <p className="eyebrow">Daftar Pengajuan</p>
          <p className="lede" style={{ marginTop: 8 }}>
            Total {total} pengajuan · {pending} menunggu · {inReview} dalam review · {approved} disetujui
          </p>
        </div>

        <h2 className="step-h3" style={{ marginBottom: 20 }}>Ringkasan Pengajuan</h2>

        {typed.length === 0 ? (
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
            <p className="lede">Belum ada pengajuan yang perlu diverifikasi.</p>
          </div>
        ) : (
          <div className="table-container">
            <table style={{
              width: "100%",
              borderCollapse: "collapse"
            }}>
              <thead>
                <tr>
                  <th style={{
                    padding: "14px 16px",
                    textAlign: "left",
                    borderBottom: "1px solid var(--color-line)",
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    color: "var(--color-muted-foreground)",
                    background: "var(--color-panel)"
                  }}>#</th>
                  <th style={{
                    padding: "14px 16px",
                    textAlign: "left",
                    borderBottom: "1px solid var(--color-line)",
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    color: "var(--color-muted-foreground)",
                    background: "var(--color-panel)"
                  }}>Organisasi</th>
                  <th style={{
                    padding: "14px 16px",
                    textAlign: "left",
                    borderBottom: "1px solid var(--color-line)",
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    color: "var(--color-muted-foreground)",
                    background: "var(--color-panel)"
                  }}>Agenda / Proposal</th>
                  <th style={{
                    padding: "14px 16px",
                    textAlign: "left",
                    borderBottom: "1px solid var(--color-line)",
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    color: "var(--color-muted-foreground)",
                    background: "var(--color-panel)"
                  }}>Tanggal</th>
                  <th style={{
                    padding: "14px 16px",
                    textAlign: "left",
                    borderBottom: "1px solid var(--color-line)",
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    color: "var(--color-muted-foreground)",
                    background: "var(--color-panel)"
                  }}>Dokumen</th>
                  <th style={{
                    padding: "14px 16px",
                    textAlign: "left",
                    borderBottom: "1px solid var(--color-line)",
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    color: "var(--color-muted-foreground)",
                    background: "var(--color-panel)"
                  }}>Status</th>
                  <th style={{
                    padding: "14px 16px",
                    textAlign: "left",
                    borderBottom: "1px solid var(--color-line)",
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    color: "var(--color-muted-foreground)",
                    background: "var(--color-panel)"
                  }}>Nomor Pengajuan</th>
                  <th style={{
                    padding: "14px 16px",
                    textAlign: "left",
                    borderBottom: "1px solid var(--color-line)",
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    color: "var(--color-muted-foreground)",
                    background: "var(--color-panel)"
                  }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {typed.map((p, i) => {
                  const prog = getDocProgress(p);
                  return (
                    <tr key={p.id} style={{ borderBottom: "1px solid var(--color-line)" }}>
                      <td style={{ padding: "14px 16px", width: 48, textAlign: "center" }}>{i + 1}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <Link href={`/admin/proposals/${p.id}`} style={{ color: "var(--color-ink)", textDecoration: "none" }}>
                          {p.org?.name ?? "—"}
                        </Link>
                      </td>
                      <td style={{ padding: "14px 16px", maxWidth: 300, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {p.title}
                      </td>
                      <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>{formatDate(p.createdAt)}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)", minWidth: 40 }}>
                            {prog.verified}/{prog.total}
                          </span>
                          <div style={{ flex: 1, height: 6, background: "var(--color-slate-200)", borderRadius: 2, overflow: "hidden" }}>
                            <div style={{
                              height: "100%",
                              background: "var(--color-accent)",
                              borderRadius: 2,
                              width: `${Math.max((prog.verified / prog.total) * 100, 2)}%`
                            }} />
                          </div>
                        </div>
                        <p style={{ fontSize: 11, color: "var(--color-muted-foreground)", marginTop: 4 }}>
                          {prog.uploaded}/{prog.total} terunggah
                        </p>
                      </td>
                      <td style={{ padding: "14px 16px", width: 120 }}>
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "4px 10px",
                          fontSize: 12,
                          fontWeight: 500,
                          borderRadius: 2,
                          background: STATUS_CLASSES[p.status] ? "var(--color-orange-100)" : "var(--color-slate-200)",
                          color: STATUS_CLASSES[p.status] ? "var(--color-accent)" : "var(--color-slate-700)"
                        }}>
                          {STATUS_LABELS[p.status] ?? p.status}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", width: 160 }}>
                        {p.referenceNumber ? (
                          <span style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            fontSize: 12,
                            fontWeight: 600,
                            borderRadius: 2,
                            background: "var(--color-orange-100)",
                            color: "var(--color-accent)"
                          }}>
                            {p.referenceNumber}
                          </span>
                        ) : (
                          <span style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            fontSize: 12,
                            fontWeight: 600,
                            borderRadius: 2,
                            background: "var(--color-slate-100)",
                            color: "var(--color-slate-800)"
                          }}>
                            Belum dibuat
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "14px 16px", width: 48 }}>
                        <Link
                          href={`/admin/proposals/${p.id}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 13,
                            fontWeight: 500,
                            color: "var(--color-ink)",
                            textDecoration: "none",
                            transition: "color 0.2s ease"
                          }}
                        >
                          <span className="material-symbols-rounded">visibility</span>
                          Detail
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}