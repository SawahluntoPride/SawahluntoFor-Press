"use client";

import { usePathname } from "next/navigation";
import { HeaderNav } from "@/components/layout/header-nav";

/**
 * Renders the standard public site header on regular routes.
 * On /admin* routes it returns null — the admin layout provides its own
 * header so the two never overlap.
 */
export function ConditionalHeader() {
  const pathname = usePathname();
  if (pathname && (pathname === "/admin" || pathname.startsWith("/admin/"))) {
    return null;
  }
  return <HeaderNav />;
}
