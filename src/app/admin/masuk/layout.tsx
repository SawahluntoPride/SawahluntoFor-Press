import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Masuk Admin",
  description:
    "Akses panel administrasi untuk kelola kerja sama pers Pemerintah Kota Sawahlunto.",
};

export default function AdminMasukLayout({ children }: { children: React.ReactNode }) {
  return children;
}
