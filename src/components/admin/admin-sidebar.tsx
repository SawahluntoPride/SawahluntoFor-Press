"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth/actions";

const links = [
  { href: "/admin", label: "Dashboard Verifikasi", icon: "dashboard" },
  { href: "/admin/proposals", label: "Daftar Pengajuan", icon: "description" },
  { href: "/admin/documents", label: "Semua Berkas", icon: "folder" },
  { href: "/status", label: "Lacak Pengajuan", icon: "visibility" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      {links.map((link) => {
        const active = pathname === link.href || pathname?.startsWith(link.href + "/");
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`nav-link${active ? " active" : ""}`}
          >
            <span className="nav-icon material-symbols-rounded">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        );
      })}

      <div className="admin-sidebar-divider" />

      <form action={logout}>
        <button type="submit" className="nav-link nav-link-logout">
          <span className="nav-icon material-symbols-rounded">logout</span>
          <span>Keluar</span>
        </button>
      </form>
    </aside>
  );
}
