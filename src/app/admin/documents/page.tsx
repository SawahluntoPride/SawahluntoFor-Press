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
    <div className="admin-section">
      {/* ── Page header ── */}
      <div className="admin-page-header reveal">
        <p className="eyebrow">Admin Panel</p>
        <h1 className="admin-page-title">Semua Berkas</h1>
        <p className="lede admin-lede-wide">
          Kelola seluruh berkas unggahan dari perusahaan pers. Verifikasi dokumen dan Nomor
          Pengajuan akan otomatis terbentuk saat semua berkas lengkap dan terverifikasi.
        </p>
      </div>

      {/* ── Summary stat cards ── */}
      <div className="admin-stats reveal reveal-delay-1">
        <div className="admin-stat-card">
          <p className="admin-stat-label">Total Berkas</p>
          <p className="admin-stat-value">{allDocuments.length}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Perlu Diverifikasi</p>
          <p className="admin-stat-value accent">{unverifiedCount}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Terverifikasi</p>
          <p className="admin-stat-value">{verifiedCount}</p>
        </div>
      </div>

      {/* ── Filter tabs ── */}
      <div className="reveal reveal-delay-2 admin-documents-toolbar">
        <div className="admin-filter-tabs">
          {FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <Link
                key={f.value}
               href={`/admin/documents?filter=${f.value}`}
                className={`admin-filter-tab ${active ? "active" : ""}`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Documents grid ── */}
      <div className="reveal reveal-delay-3 admin-section">
        {filtered.length === 0 ? (
          <div className="admin-empty-state">
            <span className="admin-empty-icon material-symbols-rounded">
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
          <div className="admin-documents-grid">
            {filtered.map((doc) => {
              const icon = docIcon(doc.name);
              return (
                <div key={doc.id} className="admin-doc-item-card panel">
                  <div className="admin-doc-card-header">
                    <span className="admin-doc-thumb material-symbols-rounded">
                      {doc.verified ? "verified" : icon}
                    </span>
                    <div className="admin-doc-card-info">
                      <span className="admin-doc-title">{doc.name}</span>
                      {doc.proposal?.org?.name && (
                        <span className="admin-doc-meta">{doc.proposal.org.name}</span>
                      )}
                      <span className="admin-doc-meta">
                        Diunggah {formatDateTime(doc.uploadedAt)} • {formatFileSize(doc.size)}
                      </span>
                      {doc.proposal?.referenceNumber ? (
                        <span className="admin-doc-ref">
                          {doc.proposal.referenceNumber}
                        </span>
                      ) : (
                        <span className="admin-doc-meta danger">
                          Belum ada nomor
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="admin-doc-card-actions">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-action-link"
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
