"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";

async function loginAction(prevState: unknown, formData: FormData) {
  const { login } = await import("@/lib/auth/actions");
  return login(prevState, formData);
}

export default function MasukPage() {
  const [state, action, pending] = useActionState(loginAction, undefined);

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
        <p className="eyebrow">Akses Media</p>
        <h1 className="section-h2" style={{ width: "100%" }}>
          Masuk ke ruang kerja media.
        </h1>
        <p className="lede" style={{ width: "100%" }}>
          Gunakan alamat email dan kata sandi yang terhubung dengan akun perusahaan pers Anda.
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
        <FormField label="Email terdaftar" name="email" error={state?.errors?.email}>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="nama@media.co.id"
            required
            disabled={pending}
          />
        </FormField>
        <FormField label="Kata sandi" name="password" error={state?.errors?.password}>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Masukkan kata sandi"
            required
            disabled={pending}
          />
        </FormField>
        {state?.message && (
          <p style={{ fontSize: 14, color: "var(--color-danger)" }}>{state.message}</p>
        )}
        <button type="submit" disabled={pending} className="btn-primary" style={{ height: 48 }}>
          {pending ? "Memproses..." : "Masuk ke akun media"}
        </button>
      </form>
      <p className="lede" style={{ width: "100%" }}>
        Belum memiliki akun media?{" "}
        <Link
          href="/daftar"
          style={{
            color: "var(--color-ink)",
            textDecoration: "underline",
            textUnderlineOffset: "0.2em",
            textDecorationThickness: 1,
            fontWeight: 500,
          }}
        >
          Daftarkan perusahaan pers Anda.
        </Link>
      </p>
    </div>
  );
}
