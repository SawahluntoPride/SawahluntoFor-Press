import Link from "next/link";
import { TopoBackground } from "@/components/ui/topo-background";

const steps = [
  {
    n: "01",
    t: "Pendaftaran media",
    d: "Kirim identitas perusahaan pers dan kanal publikasi yang dikelola.",
  },
  {
    n: "02",
    t: "Verifikasi dokumen",
    d: "Pengelola layanan memeriksa kelengkapan dan kesesuaian administrasi.",
  },
  {
    n: "03",
    t: "Kesepakatan kerja",
    d: "Ruang lingkup, keluaran, dan ketentuan kerja sama dibahas bersama.",
  },
];

export default function HomePage() {
  return (
    <div>
      <section>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "92px 48px 80px",
          }}
          className="home-hero"
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(50px, 1fr))",
              gap: 72,
              width: "100%",
            }}
            className="home-hero-grid reveal"
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 26,
              }}
            >
              <p className="eyebrow">Layanan Kolaborasi Publik</p>
              <h1 className="hero-h1">
                Ruang kerja yang jernih untuk kemitraan pers yang bertanggung jawab.
              </h1>
              <p className="lede">
                Portal ini memusatkan informasi, pengajuan, dan komunikasi awal kerja sama publikasi
                antara Pemerintah Kota Sawahlunto dengan perusahaan pers yang memenuhi ketentuan.
              </p>
              <span className="accent-rule" />
            </div>

            <div
              className="panel reveal reveal-delay-1"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 14,
                width: "100%",
                maxWidth: 420,
                justifySelf: "end",
                padding: 32,
              }}
            >
              <p className="eyebrow">Akses Layanan</p>
              <h2 className="card-h2">Mulai dari informasi yang tepat.</h2>
              <p className="lede">
                Siapkan profil perusahaan pers, proposal publikasi, serta dokumen pendukung sebelum
                menghubungi pengelola layanan.
              </p>
              <Link href="/ajukan" className="btn-primary">
                Ajukan kerja sama
                <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
                  arrow_forward
                </span>
              </Link>
              <div style={{ height: 1, width: "100%", backgroundColor: "var(--color-line)" }} />
              <a href="mailto:kominfo@sawahluntokota.go.id" className="link-row">
                <span
                  className="material-symbols-rounded"
                  style={{ fontSize: 20, color: "var(--color-accent)" }}
                >
                  arrow_forward
                </span>
                Perlu bantuan? Hubungi pengelola layanan.
              </a>
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          borderTop: "1px solid var(--color-line)",
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 38,
          padding: "76px 48px",
        }}
        className="home-steps reveal reveal-delay-2"
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 18,
          }}
          className="home-steps-head"
        >
          <h2 className="section-h2">Tiga tahap untuk memulai.</h2>
          <p className="eyebrow" style={{ textAlign: "right" }}>
            Tertib, terdokumentasi, dan dapat ditelusuri.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(50px, 1fr))",
            gap: 28,
            width: "100%",
          }}
          className="home-steps-grid"
        >
          {steps.map((s) => (
            <div
              key={s.n}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <p className="eyebrow-accent">{s.n}</p>
              <h3 className="step-h3">{s.t}</h3>
              <p className="lede">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          position: "relative",
          overflow: "hidden",
          backgroundColor: "var(--color-ink)",
          minHeight: 520,
          display: "flex",
          flexDirection: "column",
          gap: 34,
          padding: "56px 48px",
        }}
        className="home-contact"
      >
        <TopoBackground />
        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 1200,
            width: "100%",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <p
            className="eyebrow"
            style={{ color: "var(--color-on-dark)", letterSpacing: "1.2px", fontSize: 11 }}
          >
            Hubungi Pengelola Layanan
          </p>
          <h2
            className="font-heading"
            style={{
              fontSize: 38,
              lineHeight: 1.08,
              letterSpacing: "-0.5px",
              color: "var(--color-white)",
            }}
          >
            Dinas Komunikasi dan Informatika Kota Sawahlunto
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.5, color: "var(--color-on-dark)" }}>
            Senin–Jumat, 08.00–16.00 WIB
          </p>
        </div>
        <a
          href="mailto:kominfo@sawahluntokota.go.id"
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 1200,
            width: "100%",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "6px 0 0",
            fontSize: 15,
            fontWeight: 500,
            lineHeight: 1.4,
            color: "var(--color-white)",
            textDecoration: "underline",
            textDecorationColor: "var(--color-danger)",
            textUnderlineOffset: 5,
          }}
        >
          kominfo@sawahluntokota.go.id
        </a>
        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 1200,
            width: "100%",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(50px, 1fr))",
            gap: 72,
          }}
          className="home-contact-grid"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p
              className="eyebrow"
              style={{ color: "var(--color-white)", letterSpacing: "1.2px", fontSize: 11 }}
            >
              Layanan
            </p>
            <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Link href="/panduan" style={{ fontSize: 15, lineHeight: 1.45, color: "var(--color-on-dark)" }}>
                Panduan administrasi
              </Link>
              <Link href="/ajukan" style={{ fontSize: 15, lineHeight: 1.45, color: "var(--color-on-dark)" }}>
                Ajukan kerja sama
              </Link>
              <Link href="/status" style={{ fontSize: 15, lineHeight: 1.45, color: "var(--color-on-dark)" }}>
                Status pengajuan
              </Link>
            </nav>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p
              className="eyebrow"
              style={{ color: "var(--color-white)", letterSpacing: "1.2px", fontSize: 11 }}
            >
              Bantuan
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.5, color: "var(--color-on-dark)" }}>
              Untuk pertanyaan administratif, hubungi pengelola layanan pada hari dan jam kerja.
            </p>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 1199px) and (min-width: 810px) {
          .home-hero { padding: 72px 32px 64px !important; }
          .home-hero-grid { gap: 42px !important; }
          .home-steps { padding: 62px 32px !important; }
          .home-contact { padding: 48px 32px !important; }
        }
        @media (max-width: 809px) {
          .home-hero { padding: 54px 22px 48px !important; }
          .home-hero-grid {
            grid-template-columns: 1fr !important;
            gap: 38px !important;
          }
          .home-hero-grid .panel {
            max-width: none !important;
            justify-self: stretch !important;
            padding: 24px !important;
          }
          .home-steps { padding: 48px 22px !important; gap: 30px !important; }
          .home-steps-head { flex-direction: column !important; align-items: flex-start !important; gap: 14px !important; }
          .home-steps-head .eyebrow { text-align: left !important; }
          .home-steps-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
          .home-contact { padding: 48px 22px !important; min-height: 560px !important; gap: 30px !important; }
          .home-contact-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
          .home-contact h2 { font-size: 32px !important; }
        }
      `}</style>
    </div>
  );
}
