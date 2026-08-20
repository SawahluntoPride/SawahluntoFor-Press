"use client";

import Link from "next/link";
import Image from "next/image";

export function HeaderNav() {
  return (
    <nav className="site-header">
      <Link href="/" aria-label="Kerja Sama Pers Sawahlunto">
        <Image
          src="/logo.png"
          alt="Sawahlunto For PRESS - by Kominfo & Sawahlunto"
          width={180}
          height={39}
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
