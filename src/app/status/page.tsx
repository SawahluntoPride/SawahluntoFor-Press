"use client";

import { useActionState } from "react";
import { checkStatus } from "@/lib/status/actions";

export default function StatusPage() {
  const [state, action, pending] = useActionState(checkStatus, undefined);

  return (
    <div className="page-shell page-shell-narrow reveal">
      {/* ...bagian header tetap sama... */}
      <form action={action} className="panel" style={{ display: "flex", width: "100%", flexDirection: "column", gap: 18, padding: 28 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span className="eyebrow">Nomor Pengajuan</span>
          <input className="field-input" type="text" name="reference" placeholder="Contoh: SKP-2026-00127" required disabled={pending} />
        </label>
        <button type="submit" disabled={pending} className="btn-primary" style={{ height: 48, padding: "0 24px" }}>
          {pending ? "Mencari..." : "Lihat status pengajuan"}
        </button>

        {state && "error" in state && (
          <p style={{ fontSize: 14, color: "var(--color-danger)" }}>{state.error}</p>
        )}

        {state && "ok" in state && state.ok && (
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
            <p className="lede"><strong>{state.data.orgName}</strong></p>
            <p className="lede">Status: {state.data.status}</p>
            {state.data.statusNote && <p className="lede">Catatan: {state.data.statusNote}</p>}
            <p className="lede">
              Dokumen terverifikasi: {state.data.documents.filter((d) => d.verified).length}/{state.data.documents.length}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}