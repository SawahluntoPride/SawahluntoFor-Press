"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
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
    <div className="admin-login-page reveal">
      <div className="admin-login-shell">
        <div className="admin-login-card panel">
          <div className="admin-login-header">
            <span className="material-symbols-rounded admin-login-icon">
              shield_lock
            </span>
            <p className="eyebrow">Admin Panel</p>
            <h1 className="admin-login-title">Masuk ke ruang kerja admin.</h1>
            <p className="lede">
              Gunakan kredensial resmi Dinas Komunikasi dan Informatika Kota Sawahlunto
              untuk mengakses panel verifikasi dan pengelolaan pengajuan.
            </p>
          </div>

          <form action={action} className="admin-login-form">
            <FormField label="Email resmi" name="email" error={state?.errors?.email}>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="humas@sawahlunto.go.id"
                required
                disabled={pending}
              />
            </FormField>

            <FormField label="Kata sandi" name="password" error={state?.errors?.password}>
              <div className="admin-password-wrapper">
                <Input
                  id="password"
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
                  className="admin-password-toggle"
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
              <p className="admin-login-error">{state.message}</p>
            )}

            <button type="submit" disabled={pending} className="btn-primary admin-login-submit">
              {pending ? "Memverifikasi..." : "Masuk ke panel admin"}
            </button>
          </form>

          <div className="admin-login-footer">
            <Link href="/" className="nav-link">
              <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
                arrow_back
              </span>
              Kembali ke situs publik
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}