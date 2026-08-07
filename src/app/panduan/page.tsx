import Link from "next/link";

export const metadata = {
  title: "Panduan Kemitraan",
  description:
    "Portal layanan pengajuan dan pengelolaan kerja sama publikasi antara Pemerintah Kota Sawahlunto dan media pers.",
};

export default function PanduanPage() {
  return (
    <div className="page-shell reveal">
      <p className="eyebrow" style={{ width: "100%" }}>
        Panduan Administrasi
      </p>
      <h1 className="section-h2" style={{ width: "100%" }}>
        Mulai dengan dokumen yang tepat.
      </h1>
      <p className="lede" style={{ width: "100%" }}>
        Pastikan perusahaan pers memiliki identitas yang jelas, proposal dengan ruang lingkup
        terukur, serta satu kontak penanggung jawab yang dapat dihubungi.
      </p>
      <Link href="/ajukan" className="btn-primary">
        Lanjut ke pengajuan kerja sama
        <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
          arrow_forward
        </span>
      </Link>
    </div>
  );
}
