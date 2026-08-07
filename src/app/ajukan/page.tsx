import Link from "next/link";
import { REQUIRED_DOCS, DOC_TAGS } from "@/lib/documents";

// The checklist on this page follows the Framer reference: "Surat Permohonan
// Kerjasama" is the page title (the main submission document), so it is
// excluded from the supporting-document checklist below. The uploader on
// /verifikasi-berkas still accepts ALL required docs (REQUIRED_DOCS).
const checklistDocs = REQUIRED_DOCS.filter(
  (name) => name !== "Surat Permohonan Kerjasama",
).map((name) => ({
  name,
  tag: DOC_TAGS[name] ?? "Wajib",
}));

export const metadata = {
  title: "Ajukan Kerja Sama",
  description:
    "Portal layanan pengajuan dan pengelolaan kerja sama publikasi antara Pemerintah Kota Sawahlunto dan media pers.",
};

export default function AjukanPage() {
  return (
    <div className="page-shell reveal">
      <p className="eyebrow" style={{ width: "100%" }}>
        Langkah 01 / Unggah Dokumen
      </p>
      <h1 className="section-h2" style={{ width: "100%" }}>
        Surat Permohonan Kerjasama
      </h1>
      <p className="lede" style={{ width: "100%" }}>
        Unggah dokumen pendukung dalam format PDF. Pastikan setiap berkas terbaca jelas dan
        menggunakan data perusahaan pers yang sama.
      </p>
      <div className="panel" style={{ width: "100%", display: "flex", flexDirection: "column" }}>
        {checklistDocs.map((doc, i) => (
          <div
            key={doc.name}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              padding: "20px 22px",
              borderBottom: i < checklistDocs.length - 1 ? "1px solid var(--color-line)" : "none",
            }}
          >
            <p style={{ fontSize: 15, fontWeight: 500, color: "var(--color-ink)" }}>{doc.name}</p>
            <span className="eyebrow">{doc.tag}</span>
          </div>
        ))}
      </div>
      <Link href="/verifikasi-berkas" className="btn-primary">
        Lanjut ke verifikasi berkas
        <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
          arrow_forward
        </span>
      </Link>
    </div>
  );
}
