"use client";

import Link from "next/link";
import Image from "next/image";
import { UserMenu } from "@/components/ui/user-menu";
import { type UserSession } from "@/lib/auth/dal";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrator",
  APPARATUS: "Aparatur",
  MEDIA: "Media",
};

export function AdminHeader({ user }: { user: UserSession }) {
  const roleLabel = ROLE_LABELS[user.role] ?? user.role;

  return (
    <nav className="admin-header">
      <Link href="/admin" aria-label="Kerja Sama Pers Sawahlunto — Admin">
        <Image
          src="/logo.png"
          alt="Kerja Sama Pers Sawahlunto"
          width={110}
          height={57}
          className="admin-logo"
          priority
        />
      </Link>
      <div className="admin-header-actions">
        <Link href="/admin" className="admin-header-link">
          Dashboard
        </Link>
        <Link href="/admin/documents" className="admin-header-link">
          Berkas
        </Link>
        <div
          className={`admin-role-badge ${user.role.toLowerCase()}`}
          title={`Peran: ${roleLabel}`}
        >
          <span className="material-symbols-rounded">
            {user.role === "ADMIN" ? "shield" : "badge"}
          </span>
          {roleLabel}
        </div>
        <UserMenu user={user} />
      </div>
    </nav>
  );
}
