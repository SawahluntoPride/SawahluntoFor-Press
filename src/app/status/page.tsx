"use client";

import { useState } from "react";

export default function StatusPage() {
  const [ref, setRef] = useState("");

  return (
    <div className="page-shell page-shell-narrow reveal">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 8,
          width: "100%",
        }}
      >
        <p className="eyebrow">Langkah 03 / Status Pengajuan</p>
        <h1 className="section-h2" style={{ width: "100%" }}>
          Lacak pengajuan dengan nomor Anda.
        </h1>
        <p className="lede" style={{ width: "100%" }}>
          Setelah berkas terverifikasi, Anda akan menerima Nomor Pengajuan. Masukkan nomor tersebut
          di bawah untuk melihat posisi dan pembaruan pengajuan Anda.
        </p>
      </div>
      <form
        className="panel"
        style={{
          display: "flex",
          width: "100%",
          flexDirection: "column",
          gap: 18,
          padding: 28,
        }}
        onSubmit={(e) => e.preventDefault()}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span className="eyebrow">Nomor Pengajuan</span>
          <input
            className="field-input"
            type="text"
            name="reference"
            placeholder="Contoh: SKP-2026-00127"
            required
            value={ref}
            onChange={(e) => setRef(e.target.value)}
          />
        </label>
        <button type="submit" className="btn-primary" style={{ height: 48, padding: "0 24px" }}>
          Lihat status pengajuan
        </button>
      </form>
    </div>
  );
}
