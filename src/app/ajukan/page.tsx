import Link from "next/link";

const docs = [
  { name: "Akta Notaris", tag: "Wajib" },
  { name: "Bukti Terverifikasi Dewan Pers", tag: "Wajib" },
  { name: "NIB — Nomor Induk Berusaha", tag: "Wajib" },
  { name: "Sertifikat Redaktur", tag: "Wajib" },
  { name: "NPWP Perusahaan", tag: "Wajib" },
];

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
        {docs.map((doc, i) => (
          <div
            key={doc.name}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              padding: "20px 22px",
              borderBottom: i < docs.length - 1 ? "1px solid var(--color-line)" : "none",
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
