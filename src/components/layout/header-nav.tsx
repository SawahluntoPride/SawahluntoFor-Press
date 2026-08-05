"use client";

import Link from "next/link";
import Image from "next/image";

export function HeaderNav() {
  return (
    <nav className="site-header">
      <Link href="/" aria-label="Kerja Sama Pers Sawahlunto">
        <Image
          src="/logo.png"
          alt="Kerja Sama Pers Sawahlunto"
          width={120}
          height={57}
          className="site-logo"
          priority
        />
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <Link href="/panduan">Panduan</Link>
        <Link href="/masuk">Masuk</Link>
      </div>
    </nav>
  );
}
