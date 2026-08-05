import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Masuk",
  description:
    "Portal layanan pengajuan dan pengelolaan kerja sama publikasi antara Pemerintah Kota Sawahlunto dan media pers.",
};

export default function MasukLayout({ children }: { children: React.ReactNode }) {
  return children;
}
