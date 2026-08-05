export const metadata = {
  title: "Daftar Media",
  description:
    "Portal layanan pengajuan dan pengelolaan kerja sama publikasi antara Pemerintah Kota Sawahlunto dan media pers.",
};

const prep = [
  "Nama badan usaha, alamat redaksi, dan kanal publikasi aktif.",
  "Nomor kontak penanggung jawab serta alamat email resmi perusahaan.",
  "Dokumen legalitas yang relevan dengan status perusahaan pers.",
];

export default function DaftarPage() {
  return (
    <div className="page-shell reveal">
      <p className="eyebrow" style={{ width: "100%" }}>
        Pendaftaran Perusahaan Pers
      </p>
      <h1 className="section-h2" style={{ width: "100%" }}>
        Daftarkan identitas media Anda.
      </h1>
      <p className="lede" style={{ width: "100%" }}>
        Data ini digunakan untuk verifikasi awal sebelum perusahaan pers dapat mengajukan kerja
        sama publikasi.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
        <h2 className="step-h3" style={{ fontSize: 28 }}>
          Data yang perlu disiapkan
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {prep.map((item) => (
            <p key={item} className="lede">
              {item}
            </p>
          ))}
        </div>
      </div>
      <a
        href="mailto:kominfo@sawahluntokota.go.id?subject=Pendaftaran%20Perusahaan%20Pers"
        className="btn-primary"
        style={{ width: "auto", alignSelf: "flex-start" }}
      >
        Hubungi pengelola untuk pendaftaran
        <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
          arrow_forward
        </span>
      </a>
    </div>
  );
}
