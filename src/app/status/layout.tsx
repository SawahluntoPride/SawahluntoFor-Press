import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Status Pengajuan",
  description:
    "Portal layanan pengajuan dan pengelolaan kerja sama publikasi antara Pemerintah Kota Sawahlunto dan media pers.",
};

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return children;
}
