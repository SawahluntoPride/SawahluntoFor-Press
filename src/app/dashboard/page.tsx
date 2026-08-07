import { requireUser } from "@/lib/auth/dal";
import { getOrCreateSubmission, getAllDocumentsByProposal } from "@/lib/db/queries";
import { DocumentUploader } from "@/components/ui/document-uploader";
import { SubmitToReviewButton } from "@/components/submit-to-review-button";

type ExistingDocument = {
  id: string;
  name: string;
  filename: string;
  url: string;
  size: number | null;
  uploadedAt: string;
  verified: boolean;
};

export const metadata = {
  title: "Dashboard",
  description:
    "Dashboard pengguna untuk mengelola pengajuan kerja sama publikasi.",
};

export default async function DashboardPage() {
  const user = await requireUser();

  const proposal = await getOrCreateSubmission(user.id, user.organizationId!);

  // Fetch existing uploaded documents so DocumentUploader shows the
  // correct initial state on page load / revalidation.
  const dbDocs = await getAllDocumentsByProposal(proposal.id);
  const initialDocs: ExistingDocument[] = dbDocs.map((d) => ({
    id: d.id,
    name: d.name,
    filename: d.filename,
    url: d.url,
    size: d.size,
    uploadedAt: d.uploadedAt.toISOString(),
    verified: d.verified,
  }));

  const uploadedCount = initialDocs.length;
  const allUploaded = uploadedCount >= 6; // REQUIRED_DOCS.length

  return (
    <div className="page-shell" style={{ padding: "76px 48px", gap: 32 }}>
      {/* ── Header ── */}
      <div className="reveal" style={{ width: "100%", textAlign: "left" }}>
        <p className="eyebrow">Dashboard</p>
        <h1 className="hero-h1" style={{ fontSize: 36, textAlign: "left" }}>
          {user.organization?.name ?? "Organisasi Anda"}
        </h1>
        <p className="lede" style={{ maxWidth: 640, marginTop: 8 }}>
          Unggah dokumen yang diperlukan untuk pengajuan kerja sama publikasi
          antara {user.organization?.name ?? "organisasi Anda"} dan Pemerintah Kota Sawahlunto.
        </p>
      </div>

      {/* ── Proposal info panel ── */}
      <div className="reveal reveal-delay-1 panel" style={{ width: "100%", padding: 24 }}>
        <p className="eyebrow" style={{ marginBottom: 8 }}>
          Proposal: {proposal.title}
        </p>
        <p className="lede">
          Status:{" "}
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color:
                proposal.status === "APPROVED"
                  ? "var(--color-accent)"
                  : proposal.status === "IN_REVIEW"
                    ? "var(--color-accent)"
                    : "var(--color-ink)",
            }}
          >
            {proposal.status === "SUBMITTED"
              ? "Diserahkan"
              : proposal.status === "IN_REVIEW"
                ? "Dalam Review"
                : proposal.status === "APPROVED"
                  ? "Disetujui"
                  : "Draft"}
          </span>
        </p>

        {proposal.referenceNumber && (
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <span className="material-symbols-rounded" style={{ fontSize: 18, color: "var(--color-accent)" }}>
              confirmation_number
            </span>
            <span className="ref-number ref-number-generated">{proposal.referenceNumber}</span>
          </div>
        )}

        {!allUploaded && proposal.status === "DRAFT" && (
          <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
            <SubmitToReviewButton id={proposal.id} />
          </div>
        )}
      </div>

      {/* ── Document uploader ── */}
      <div className="reveal reveal-delay-2" style={{ width: "100%" }}>
        <p className="eyebrow">Dokumen Wajib</p>
        <h2 className="admin-page-title" style={{ fontSize: 26, letterSpacing: "-0.2px" }}>
          Unggah Berkas
        </h2>
        <p className="lede">
          Pastikan semua dokumen lengkap dan valid. Nomor Pengajuan akan otomatis
          terbentuk saat semua berkas berhasil diunggah.
        </p>
      </div>

      <div className="reveal reveal-delay-3" style={{ width: "100%" }}>
        <DocumentUploader
          proposalId={proposal.id}
          initialDocs={initialDocs}
          initialReferenceNumber={proposal.referenceNumber}
        />
      </div>
    </div>
  );
}
