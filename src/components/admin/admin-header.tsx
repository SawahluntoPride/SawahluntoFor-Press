"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  organizationId: string | null;
  organization: { name: string } | null;
};

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/proposals", label: "Pengajuan" },
  { href: "/admin/documents", label: "Dokumen" },
];

export function AdminHeader({ user }: { user: User | null }) {
  const pathname = usePathname();

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
        {ADMIN_NAV.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                fontSize: 14,
                fontWeight: 500,
                lineHeight: "1em",
                color: isActive ? "var(--color-accent)" : "var(--color-ink)",
                textDecoration: "none",
                transition: "color 0.2s ease",
              }}
            >
              {item.label}
            </Link>
          );
        })}
        {user && (
          <Link
            href="/keluar"
            style={{
              fontSize: 14,
              fontWeight: 500,
              lineHeight: "1em",
              color: "var(--color-danger)",
              textDecoration: "none",
              transition: "color 0.2s ease",
            }}
          >
            Keluar
          </Link>
        )}
      </div>
    </nav>
  );
}