"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";

async function adminLoginAction(prevState: unknown, formData: FormData) {
  const { adminLogin } = await import("@/lib/auth/actions");
  return adminLogin(prevState, formData);
}

export default function AdminMasukPage() {
  const [state, action, pending] = useActionState(adminLoginAction, undefined);
  const [showPassword, setShowPassword] = useState(false);

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
        <p className="eyebrow">Admin Panel</p>
        <h1 className="section-h2" style={{ width: "100%" }}>
          Masuk ke ruang kerja admin
        </h1>
        <p className="lede" style={{ width: "100%" }}>
          Gunakan kredensial resmi Dinas Komunikasi dan Informatika Kota Sawahlunto
          untuk mengakses panel verifikasi dan pengelolaan pengajuan.
        </p>
      </div>
      <form
        action={action}
        className="panel"
        style={{
          display: "flex",
          width: "100%",
          flexDirection: "column",
          gap: 20,
          padding: 28,
        }}
      >
        <FormField label="Email resmi" name="email" error={state?.errors?.email}>
          <Input
            id="admin-email"
            name="email"
            type="email"
            placeholder="humas@sawahlunto.go.id"
            required
            disabled={pending}
          />
        </FormField>

        <FormField label="Kata sandi" name="password" error={state?.errors?.password}>
          <div style={{ position: "relative" }}>
            <Input
              id="admin-password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan kata sandi"
              required
              disabled={pending}
              style={{ paddingRight: 56 }}
            />
            <button
              type="button"
              tabIndex={-1}
              style={{
                position: "absolute",
                right: 12,
                top: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                padding: 0,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--color-muted-foreground)",
                transition: "color 0.2s ease"
              }}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            >
              <span className="material-symbols-rounded">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
        </FormField>
                name="email"
                type="email"
                placeholder="humas@sawahlunto.go.id"
                required
                disabled={pending}
              />
            </FormField>

            <FormField label="Kata sandi" name="password" error={state?.errors?.password}>
              <div style={{ position: "relative" }}>
                <Input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan kata sandi"
                  required
                  disabled={pending}
                  style={{ paddingRight: 56 }}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 32,
                    padding: 0,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--color-muted-foreground)",
                    transition: "color 0.2s ease"
                  }}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  <span className="material-symbols-rounded">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </FormField>

            {state?.message && (
              <p style={{
                padding: "12px 16px",
                fontSize: 13,
                fontWeight: 500,
                color: "var(--color-danger)",
                background: "var(--color-danger-50)",
                borderRadius: 2,
                border: "1px solid var(--color-danger-200)"
              }}>
                {state.message}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "14px 24px",
                fontSize: 14,
                fontWeight: 600,
                color: "var(--color-white)",
                background: "var(--color-accent)",
                border: "none",
                borderRadius: 2,
                cursor: pending ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                opacity: pending ? 0.7 : 1
              }}
            >
              {pending ? (
                <>
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>sync</span>
                  Memverifikasi...
                </>
              ) : (
                <>
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>login</span>
                  Masuk ke panel admin
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: "center" }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 500,
                color: "var(--color-ink)",
                textDecoration: "none",
                transition: "color 0.2s ease"
              }}
            >
              <span className="material-symbols-rounded">arrow_back</span>
              Kembali ke situs publik
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}