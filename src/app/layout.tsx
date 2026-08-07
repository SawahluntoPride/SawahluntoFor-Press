import "./globals.css";
import type { Metadata } from "next";
import { ConditionalHeader } from "@/components/layout/conditional-header";
import { youngSerif, googleSansFlex, inter } from "@/lib/fonts";

export const metadata: Metadata = {
  title: {
    default: "Kerja Sama Pers Sawahlunto",
    template: "%s — Kerja Sama Pers Sawahlunto",
  },
  description:
    "Portal layanan pengajuan dan pengelolaan kerja sama publikasi antara Pemerintah Kota Sawahlunto dan media pers.",
  keywords: ["sawahlunto", "kerjasama", "media pers", "pemerintah", "proposal"],
  openGraph: {
    title: "Kerja Sama Pers Sawahlunto",
    description:
      "Portal layanan pengajuan dan pengelolaan kerja sama publikasi antara Pemerintah Kota Sawahlunto dan media pers.",
    type: "website",
  },
  icons: { icon: "/logo.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      dir="ltr"
      className={`${youngSerif.variable} ${googleSansFlex.variable} ${inter.variable}`}
    >
      <body>
        <ConditionalHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}
