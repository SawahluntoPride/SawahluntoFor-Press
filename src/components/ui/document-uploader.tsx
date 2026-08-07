"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { REQUIRED_DOCS } from "@/lib/documents";

type UploadedInfo = {
  id: string;
  filename: string;
  url: string;
  size: number | null;
  uploadedAt: string;
};

type DocStatus = {
  uploaded: boolean;
  uploading: boolean;
  info: UploadedInfo | null;
  error: string | null;
};

type ExistingDocument = {
  id: string;
  name: string;
  filename: string;
  url: string;
  size: number | null;
  uploadedAt: string;
  verified: boolean;
};

export function DocumentUploader({
  proposalId,
  initialDocs = [],
  initialReferenceNumber = null,
}: {
  proposalId: string;
  initialDocs?: ExistingDocument[];
  initialReferenceNumber?: string | null;
}) {
  const [docs, setDocs] = useState<Record<string, DocStatus>>(() => {
    const initial: Record<string, DocStatus> = {};
    for (const d of REQUIRED_DOCS) {
      const existing = initialDocs.find((doc) => doc.name === d);
      if (existing) {
        initial[d] = {
          uploaded: true,
          uploading: false,
          info: {
            id: existing.id,
            filename: existing.filename,
            url: existing.url,
            size: existing.size,
            uploadedAt: existing.uploadedAt,
          },
          error: null,
        };
      } else {
        initial[d] = { uploaded: false, uploading: false, info: null, error: null };
      }
    }
    return initial;
  });
  const [referenceNumber, setReferenceNumber] = useState<string | null>(initialReferenceNumber);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const allUploaded = Object.values(docs).every((d) => d.uploaded);

  function updateDoc(name: string, patch: Partial<DocStatus>) {
    setDocs((prev) => ({
      ...prev,
      [name]: { ...prev[name], ...patch },
    }));
  }

  async function handleUpload(name: string, file: File) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      updateDoc(name, { uploading: false, error: "Hanya file PDF yang didukung." });
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      updateDoc(name, { uploading: false, error: "Ukuran berkas maksimal 4 MB." });
      return;
    }

    updateDoc(name, { uploading: true, error: null });

    const form = new FormData();
    form.append("file", file);
    form.append("proposalId", proposalId);
    form.append("name", name);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        updateDoc(name, {
          uploaded: true,
          uploading: false,
          info: {
            id: data.document.id,
            filename: data.document.filename,
            url: data.document.url,
            size: data.document.size,
            uploadedAt: data.document.uploadedAt,
          },
          error: null,
        });

        if (data.allUploaded && data.referenceNumber) {
          setReferenceNumber(data.referenceNumber);
        }
      } else {
        updateDoc(name, { uploading: false, error: data.error ?? "Gagal mengunggah berkas." });
      }
    } catch {
      updateDoc(name, { uploading: false, error: "Koneksi gagal. Coba lagi." });
    }
  }

  function onFileChange(name: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUpload(name, file);
  }

  function onDrop(name: string, e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(name, file);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, width: "100%" }}>
      <div className="panel" style={{ width: "100%", display: "flex", flexDirection: "column" }}>
        {REQUIRED_DOCS.map((doc, i) => {
          const state = docs[doc];
          return (
            <div
              key={doc}
              style={{
                padding: "16px 18px",
                borderBottom: i < REQUIRED_DOCS.length - 1 ? "1px solid var(--color-line)" : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  width: "100%",
                }}
              >
                <p style={{ fontSize: 15, fontWeight: 500, color: "var(--color-ink)" }}>{doc}</p>
                <div
                  className={`upload-zone${state.uploading ? " is-dragging" : ""}`}
                  onClick={() => inputRefs.current[doc]?.click()}
                  onDragEnter={(e) => { e.preventDefault(); }}
                  onDragOver={(e) => { e.preventDefault(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    onDrop(doc, e);
                  }}
                >
                  <span
                    className="material-symbols-rounded"
                    style={{ fontSize: 20, color: "var(--color-accent)" }}
                  >
                    {state.uploaded ? "picture_as_pdf" : "upload_file"}
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", textAlign: "left", gap: 2 }}>
                    {state.uploading ? (
                      <p style={{ fontSize: 13, color: "var(--color-muted-foreground)" }}>Mengunggah…</p>
                    ) : state.uploaded && state.info ? (
                      <>
                        <a
                          href={state.info.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: 13,
                            color: "var(--color-ink)",
                            fontWeight: 500,
                            textDecoration: "underline",
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {state.info.filename}
                        </a>
                        <p style={{ fontSize: 12, color: "var(--color-muted-foreground)" }}>
          {((state.info.size ?? 0) / 1024 / 1024).toFixed(2)} MB • PDF
                        </p>
                      </>
                    ) : (
                      <>
                        <p style={{ fontSize: 13, color: "var(--color-muted-foreground)" }}>
                          Tarik &amp; lepas PDF di sini, atau klik untuk memilih
                        </p>
                        <p style={{ fontSize: 12, color: "var(--color-muted-foreground)" }}>
                          Maksimum 4 MB • PDF saja
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    ref={(el) => { inputRefs.current[doc] = el; }}
                    type="file"
                    accept="application/pdf"
                    hidden
                    onChange={(e) => onFileChange(doc, e)}
                    disabled={state.uploading}
                  />
                </div>
                {state.uploaded && state.info && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 12,
                      color: "var(--color-accent)",
                      fontWeight: 600,
                    }}
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: 16 }}>
                      check_circle
                    </span>
                    Terunggah
                  </div>
                )}
                {state.error && (
                  <p style={{ fontSize: 11, color: "var(--color-danger)" }}>{state.error}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* â”€â”€ Reference number auto-generated when all docs uploaded â”€â”€ */}
      {referenceNumber && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "18px 22px",
            border: "1px solid var(--color-accent)",
            borderRadius: 2,
            background: "rgba(255,106,26,0.06)",
          }}
        >
          <span className="material-symbols-rounded" style={{ fontSize: 28, color: "var(--color-accent)" }}>
            auto_awesome
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-accent)" }}>
              Nomor Pengajuan dibuat otomatis
            </p>
            <p className="lede">
              Semua berkas telah lengkap. Catat Nomor Pengajuan Anda untuk melacak status.
            </p>
            <span className="ref-number ref-number-generated">{referenceNumber}</span>
          </div>
        </div>
      )}

      {/* â”€â”€ All uploaded but no reference number yet â”€â”€ */}
      {allUploaded && !referenceNumber && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "18px 22px",
            border: "1px solid var(--color-accent)",
            borderRadius: 2,
            background: "rgba(255,106,26,0.06)",
          }}
        >
          <span className="material-symbols-rounded" style={{ fontSize: 28, color: "var(--color-accent)" }}>
            auto_awesome
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-accent)" }}>
              Semua berkas lengkap!
            </p>
            <p className="lede">
              Nomor Pengajuan sedang dibuat otomatis. Refresh halaman untuk melihat nomor Anda.
            </p>
          </div>
        </div>
      )}

      {/* â”€â”€ Submit to status page â”€â”€ */}
      {allUploaded && (
        <Link
          href="/status"
          className="btn-primary"
          style={{ width: "auto", alignSelf: "flex-start" }}
        >
          Lanjut ke status pengajuan
          <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
            arrow_forward
          </span>
        </Link>
      )}
    </div>
  );
}

