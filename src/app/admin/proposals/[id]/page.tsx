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
    <div className="admin-section">
      {/* ── Page header + reference number ── */}
      <div className="reveal admin-sub-section">

        <div className="admin-proposal-header">
          <div className="admin-proposal-title-group">
            <p className="eyebrow">Admin Panel</p>
            <h1 className="admin-page-title">{proposal.title}</h1>
            <p className="lede">
              Dari {proposal.org?.name ?? "—"} · {formatDateTime(proposal.createdAt)}
            </p>
          </div>
          {proposal.referenceNumber ? (
            <div className="admin-ref-row">
              <div className="admin-ref-label-group">
                <p className="eyebrow-accent">Nomor Pengajuan</p>
                <span className="ref-number ref-number-generated">{proposal.referenceNumber}</span>
              </div>
              <Link
                href="/status"
                className="admin-tracker-link"
              >
                Cek di pelacak
              </Link>
            </div>
          ) : (
            <div className="admin-badge admin-badge-pending-docs admin-badge-inline">
              <span className="material-symbols-rounded">schedule</span>
              Menunggu dokumen lengkap
            </div>
          )}
        </div>

        {/* Verification progress */}
        <div className="admin-toolbar admin-toolbar-progress">
          <div className="admin-progress">
            <div className="admin-progress-labels">
              <span>{verifiedCount}/{REQUIRED_DOCS.length} terverifikasi</span>
              <span>{uploadedCount}/{REQUIRED_DOCS.length} terunggah</span>
            </div>
            <div className="admin-progress-bar elevated">
              <div
                className="admin-progress-fill"
                style={{
                  width: `${(verifiedCount / REQUIRED_DOCS.length) * 100}%`,
                }}
              />
            </div>
          </div>
          <span
            className={`admin-badge ${
              allVerified
                ? "admin-badge-approved"
                : proposal.status === "IN_REVIEW"
                  ? "admin-badge-in-review"
                  : "admin-badge-submitted"
            }`}
          >
            {STATUS_LABELS[proposal.status] ?? proposal.status}
          </span>
        </div>
      </div>

      {/* ── Proposal details ── */}
      <div className="reveal reveal-delay-1 admin-section">
        <div className="panel admin-detail-panel">
          <p className="eyebrow">Informasi Proposal</p>

          <div className="admin-proposal-grid">
            <p className="admin-field-label">Organisasi</p>
            <p className="admin-field-value">{proposal.org?.name ?? "—"}</p>

            <p className="admin-field-label">Kategori</p>
            <p className="admin-field-value">{proposal.category?.name ?? "Tanpa kategori"}</p>

            <p className="admin-field-label">Jenis</p>
            <p className="admin-field-value">
              {proposal.type ? TYPE_LABELS[proposal.type] ?? proposal.type : "—"}
            </p>

            <p className="admin-field-label">Penulis</p>
            <p className="admin-field-value">
              {proposal.author ? proposal.author.name ?? proposal.author.email : "—"}
            </p>

            <p className="admin-field-label">Jadwal</p>
            <p className="admin-field-value">
              {proposal.scheduledAt ? formatDateTime(proposal.scheduledAt) : "—"}
            </p>

            <p className="admin-field-label">Lokasi</p>
            <p className="admin-field-value">{proposal.location ?? "—"}</p>

            <p className="admin-field-label">Anggaran</p>
            <p className="admin-field-value">
              {proposal.budget != null ? `Rp ${proposal.budget.toLocaleString("id-ID")}` : "—"}
            </p>
          </div>

          {proposal.description && (
            <>
              <p className="admin-field-label">Deskripsi</p>
              <p className="admin-field-value desc">{proposal.description}</p>
            </>
          )}
        </div>
      </div>

      {/* ── Documents ── */}
      <div className="reveal reveal-delay-2 admin-section">
        <div className="admin-sub-section">
          <p className="eyebrow">Berita Acara Dokumen ({REQUIRED_DOCS.length} wajib)</p>
          <h2 className="admin-section-subheading">Verifikasi Berkas</h2>
          <p className="lede">
            Periksa setiap berkas yang diunggah. Dokumen yang terverifikasi akan
            otomatis menghasilkan Nomor Pengajuan ketika semua berkas lengkap dan diverifikasi.
          </p>
        </div>

        <div className="admin-doc-list">
          {docStatus.map((doc) => {
            const uploaded = proposal.documents.find((d) => d.name === doc.name);
            return (
              <div key={doc.name} className="admin-doc-item">
                <div className="admin-doc-item-header">
                  <span className="admin-doc-icon material-symbols-rounded">
                    {doc.verified ? "picture_as_pdf" : uploaded ? "pending_actions" : "upload_2"}
                  </span>
                  <div className="admin-doc-info-col">
                    <span className="admin-doc-name">{doc.name}</span>
                    {uploaded ? (
                      <span className="admin-doc-meta">
                        Diunggah {formatDateTime(uploaded.uploadedAt)} ·{" "}
                        {formatFileSize(uploaded.size)}
                      </span>
                    ) : (
                      <span className="admin-doc-meta danger">
                        Belum diunggah
                      </span>
                    )}
                  </div>
                </div>

                <div className="admin-doc-actions">
                  {uploaded && (
                    <a
                      href={`/api/documents/${uploaded.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-action-link small"
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
          <div className="admin-verified-banner">
            <span className="material-symbols-rounded">
              auto_awesome
            </span>
            <div className="admin-verified-banner-text">
              <p className="admin-verified-subtitle">
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
      <div className="reveal reveal-delay-3">
        <Link href="/admin" className="admin-back-link">
          <span className="material-symbols-rounded">arrow_back</span>
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
