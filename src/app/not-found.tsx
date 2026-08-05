import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="page-shell reveal" style={{ minHeight: "70vh", justifyContent: "center" }}>
      <h1 className="hero-h1">404</h1>
      <p className="lede">Halaman yang Anda cari tidak tersedia.</p>
      <Link href="/" className="btn-primary" style={{ width: "auto" }}>
        Kembali ke Beranda
      </Link>
    </div>
  );
}
