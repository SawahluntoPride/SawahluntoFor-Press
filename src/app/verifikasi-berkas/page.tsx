"use client";

import Link from "next/link";
import { UploadZone } from "@/components/ui/upload-zone";

const docs = [
  "Surat Permohonan Kerjasama",
  "Akta Notaris",
  "Bukti Terverifikasi Dewan Pers",
  "NIB — Nomor Induk Berusaha",
  "Sertifikat Redaktur",
  "NPWP Perusahaan",
];

export default function VerifikasiBerkasPage() {
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
      <div className="panel" style={{ width: "100%", display: "flex", flexDirection: "column" }}>
        {docs.map((doc, i) => (
          <div
            key={doc}
            style={{
              padding: "16px 18px",
              borderBottom: i < docs.length - 1 ? "1px solid var(--color-line)" : "none",
            }}
          >
            <UploadZone label={doc} />
          </div>
        ))}
      </div>
      <p className="lede" style={{ width: "100%" }}>
        Pastikan seluruh berkas menggunakan data perusahaan yang sama sebelum melanjutkan.
      </p>
      <Link href="/status" className="btn-primary">
        Lanjut ke status pengajuan
        <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
          arrow_forward
        </span>
      </Link>
    </div>
  );
}
