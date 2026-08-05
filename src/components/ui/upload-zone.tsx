"use client";

import { useRef, useState } from "react";

type Props = {
  label: string;
};

export function UploadZone({ label }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function acceptFile(file: File | undefined) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Hanya file PDF yang diterima.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError("Ukuran maksimal 4 MB.");
      return;
    }
    setError(null);
    setFileName(file.name);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 14,
        width: "100%",
      }}
    >
      <p style={{ fontSize: 15, fontWeight: 500, color: "var(--color-ink)" }}>{label}</p>
      <button
        type="button"
        className={`upload-zone${dragging ? " is-dragging" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          acceptFile(e.dataTransfer.files?.[0]);
        }}
      >
        <span
          className="material-symbols-rounded"
          style={{ fontSize: 20, color: "var(--color-accent)" }}
        >
          upload_file
        </span>
        <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
          <p style={{ fontSize: 13, color: "var(--color-muted)" }}>
            {fileName
              ? fileName
              : "Tarik & lepas PDF di sini, atau klik untuk memilih"}
          </p>
          <p style={{ fontSize: 12, color: "var(--color-muted)" }}>
            Maksimum 4 MB • PDF saja
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          hidden
          onChange={(e) => acceptFile(e.target.files?.[0])}
        />
      </button>
      {error && <p style={{ fontSize: 12, color: "var(--color-danger)" }}>{error}</p>}
    </div>
  );
}
