import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth/dal";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata = {
  title: "Admin Dashboard",
  description:
    "Portal layanan pengajuan dan pengelolaan kerja sama publikasi antara Pemerintah Kota Sawahlunto dan media pers.",
};

/**
 * The admin layout wraps every route under /admin/.
 *
 * It fetches the current session and renders the admin chrome (header +
 * sidebar) only when the user is an admin/apparatus.  On the login page
 * (/admin/masuk) no user is present so the chrome is hidden and the
 * login form is rendered full-width.
 *
 * Individual protected pages additionally call requireAdmin() to enforce
 * the auth gate and redirect unauthenticated users.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "ADMIN" || user?.role === "APPARATUS";

  // Login page — no admin chrome, just the form centred on the page.
  if (!isAdmin) {
    return (
      <div className="admin-layout admin-login-page">
        <main className="admin-main">
          <div className="admin-content">{children}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminHeader user={user} />
      <div className="admin-inner">
        <AdminSidebar />
        <main className="admin-main">
          <div className="admin-content">{children}</div>
        </main>
      </div>
    </div>
  );
}
