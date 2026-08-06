import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { REQUIRED_DOCS } from "@/lib/documents";

const docs = REQUIRED_DOCS as readonly string[];

export const metadata = {
  title: "Verifikasi Berkas",
  description:
    "Portal layanan pengajuan dan pengelolaan kerja sama publikasi antara Pemerintah Kota Sawahlunto dan media pers.",
};

export default async function VerifikasiBerkasPage() {
  const user = await getCurrentUser();

  // Authenticated users go straight to their dashboard where uploads happen.
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="page-shell reveal">
      <p className="eyebrow" style={{ width: "100%" }}>
        Langkah 02 / Verifikasi Berkas
      </p>
      <h1 className="section-h2" style={{ width: "100%" }}>
        Unggah berkas untuk diverifikasi.
      </h1>
      <p className="lede" style={{ width: "100%" }}>
        Tarik dan lepas setiap dokumen ke area yang sesuai, atau klik untuk membuka folder perangkat
        Anda. Setiap dokumen dibatasi hingga 4 MB dan harus berformat PDF.
      </p>

      {/* ── Document checklist ── */}
      <div className="panel" style={{ width: "100%", display: "flex", flexDirection: "column" }}>
        {docs.map((doc, i) => (
          <div
            key={doc}
            style={{
              padding: "16px 18px",
              borderBottom: i < docs.length - 1 ? "1px solid var(--color-line)" : "none",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              className="material-symbols-rounded"
              style={{ fontSize: 20, color: "var(--color-accent)" }}
            >
              picture_as_pdf
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: "var(--color-ink)" }}>{doc}</p>
              <p style={{ fontSize: 12, color: "var(--color-muted-foreground)" }}>Wajib • PDF maksimal 4 MB</p>
            </div>
          </div>
        ))}
      </div>

      <p className="lede" style={{ width: "100%" }}>
        Pastikan seluruh berkas menggunakan data perusahaan yang sama sebelum melanjutkan.
      </p>

      {/* ── Login call-to-action ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          width: "100%",
          alignItems: "stretch",
        }}
      >
        <Link
          href="/masuk"
          className="btn-primary"
          style={{ height: 48, width: "100%" }}
        >
          Masuk untuk unggah berkas
          <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
            arrow_forward
          </span>
        </Link>

        <Link
          href="/status"
          className="nav-link"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            fontSize: 14,
            fontWeight: 500,
            padding: "12px 14px",
            border: "1px solid var(--color-line)",
            borderRadius: 2,
            background: "var(--color-panel)",
          }}
        >
          <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
            visibility
          </span>
          Lacak status pengajuan
        </Link>
      </div>
    </div>
  );
}

