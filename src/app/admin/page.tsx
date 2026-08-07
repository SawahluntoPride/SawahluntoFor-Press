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
    <div className="admin-section">
      {/* ── Page header ── */}
      <div className="admin-page-header reveal">
        <p className="eyebrow">Admin Panel</p>
        <h1 className="admin-page-title">Dashboard Verifikasi Dokumen</h1>
        <p className="lede">
          Kelola semua berkas unggahan perusahaan pers. Verifikasi dokumen dan Nomor Pengajuan
          akan otomatis terbentuk saat semua berkas lengkap dan terverifikasi.
        </p>
      </div>

      {/* ── Summary stat cards ── */}
      <div className="admin-stats reveal reveal-delay-1">
        <div className="admin-stat-card">
          <p className="admin-stat-label">Total Pengajuan</p>
          <p className="admin-stat-value">{total}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label accent">Menunggu Verifikasi</p>
          <p className="admin-stat-value accent">{pending}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Dalam Review</p>
          <p className="admin-stat-value">{inReview}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Terverifikasi</p>
          <p className="admin-stat-value">{approved}</p>
        </div>
      </div>

      {/* ── All uploaded documents — consolidated verification view ── */}
      <div className="reveal reveal-delay-2 admin-section">

        <div className="admin-sub-section">
          <div className="admin-section-header-row">
            <p className="eyebrow">Semua Berkas</p>
            <p className="lede">
              {filteredDocs.length} berkas ditampilkan · {unverifiedCount} belum terverifikasi ·{" "}
              {verifiedCount} sudah terverifikasi · {docsWithRef.length} total
            </p>
          </div>

          {/* Filter tabs */}
          <div className="admin-filter-tabs">
            {DOC_FILTERS.map((f) => {
              const active = docFilter === f.value;
              return (
                <Link
                  key={f.value}
                  href={`/admin?docFilter=${f.value}`}
                  className={`admin-filter-tab ${active ? "active" : ""}`}
                >
                  {f.label}
                </Link>
              );
            })}
          </div>

          <h2 className="admin-section-subheading">Berkas yang Perlu Diverifikasi</h2>
        </div>

        {filteredDocs.length === 0 ? (
          <div className="admin-empty-state">
            <span className="admin-empty-icon material-symbols-rounded">
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
          <div className="admin-documents-section">
            {filteredDocs.map((doc) => {
              const icon = docIcon(doc.name);
              return (
                <div key={doc.id} className="admin-doc-card">
                  <div className="admin-doc-card-left">
                    <span className="admin-doc-thumb material-symbols-rounded">
                      {doc.verified ? "verified" : icon}
                    </span>
                    <div className="admin-doc-info">
                      <span className="admin-doc-title">{doc.name}</span>
                      <div className="admin-doc-meta-row">
                        {doc.proposal?.org?.name && (
                          <span className="admin-doc-org">{doc.proposal.org.name}</span>
                        )}
                        <span className="admin-doc-date">Diunggah {formatDateTime(doc.uploadedAt)}</span>
                        <span className="admin-doc-date">{formatFileSize(doc.size)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="admin-doc-right">
                    {/* Reference number prominently displayed */}
                    {doc.refNumber ? (
                      <span className="ref-number ref-number-generated">{doc.refNumber}</span>
                    ) : (
                      <span className="admin-badge admin-badge-pending-docs small">
                        <span className="material-symbols-rounded">schedule</span>
                        Belum ada nomor
                      </span>
                    )}

                    {/* Verification status + action */}
                    <div
                      className={`admin-doc-status ${doc.verified ? "admin-doc-status-verified" : "admin-doc-status-pending"}`}
                    >
                      <span className="admin-doc-status-small">
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
      <div className="reveal reveal-delay-3 admin-section">
        <div className="admin-sub-section">
          <div className="admin-section-header-row">
            <p className="eyebrow">Daftar Pengajuan</p>
            <p className="lede">
              Total {total} pengajuan · {pending} menunggu · {inReview} dalam review · {approved} disetujui
            </p>
          </div>

          <h2 className="admin-section-subheading">Ringkasan Pengajuan</h2>
        </div>

        {typed.length === 0 ? (
          <div className="admin-empty-state">
            <span className="admin-empty-icon material-symbols-rounded">
              inbox
            </span>
            <p className="lede">Belum ada pengajuan yang perlu diverifikasi.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th className="col-num">#</th>
                <th>Organisasi</th>
                <th>Agenda / Proposal</th>
                <th>Tanggal</th>
                <th>Dokumen</th>
                <th className="col-verified">Status</th>
                <th className="col-ref">Nomor Pengajuan</th>
                <th className="col-num">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {typed.map((p, i) => {
                const prog = getDocProgress(p);
                return (
                  <tr key={p.id}>
                    <td className="col-num">{i + 1}</td>
                    <td>
                      <Link href={`/admin/proposals/${p.id}`}>
                        {p.org?.name ?? "—"}
                      </Link>
                    </td>
                    <td className="col-title">{p.title}</td>
                    <td className="col-date">{formatDate(p.createdAt)}</td>
                    <td>
                      <div className="admin-progress">
                        <span className="admin-progress-count">{prog.verified}/{prog.total}</span>
                        <div className="admin-progress-bar">
                          <div
                            className="admin-progress-fill"
                            style={{ width: `${Math.max((prog.verified / prog.total) * 100, 2)}%` }}
                          />
                        </div>
                      </div>
                      <p className="admin-progress-note">
                        {prog.uploaded}/{prog.total} terunggah
                      </p>
                    </td>
                    <td className="col-verified">
                      <span className={`admin-badge ${STATUS_CLASSES[p.status] ?? ""}`}>
                        {STATUS_LABELS[p.status] ?? p.status}
                      </span>
                    </td>
                    <td className="col-ref">
                      {p.referenceNumber ? (
                        <span className="ref-number ref-number-generated">{p.referenceNumber}</span>
                      ) : (
                        <span className="ref-number">Belum dibuat</span>
                      )}
                    </td>
                    <td className="col-num">
                      <Link
                        href={`/admin/proposals/${p.id}`}
                        className="action-link"
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
        )}
      </div>
    </div>
  );
}
