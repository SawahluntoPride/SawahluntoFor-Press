"use client";
import { type ReactNode } from "react";

export function FormField({
  label,
  name,
  error,
  description,
  children,
}: {
  label: string;
  name: string;
  error?: string | string[];
  description?: string;
  children: ReactNode;
}) {
  const message = error ? (Array.isArray(error) ? error[0] : error) : null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label
        htmlFor={name}
        style={{
          fontSize: 12,
          fontWeight: 600,
          textTransform: "uppercase" as const,
          letterSpacing: "1.1px",
          lineHeight: 1.2,
          color: "var(--color-muted)",
        }}
      >
        {label}
      </label>
      {children}
      {description && <p style={{ fontSize: 12, color: "var(--color-muted)" }}>{description}</p>}
      {message && <span style={{ fontSize: 12, color: "var(--color-danger)" }}>{message}</span>}
    </div>
  );
}
