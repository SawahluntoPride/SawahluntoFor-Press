import { redirect } from "next/navigation";

/**
 * The dashboard at /admin already shows the complete submission table.
 * This route exists so the sidebar navigation target resolves cleanly.
 */
export default function AdminProposalsRedirect() {
  redirect("/admin");
}
