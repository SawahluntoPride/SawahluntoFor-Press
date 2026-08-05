"use client";
import Link from "next/link";
import { logout } from "@/lib/auth/actions";
import { UserSession } from "@/lib/auth/dal";
import { useRef, useState, useEffect } from "react";

export function UserMenu({ user }: { user: UserSession }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  return (
    <div ref={ref} className="relative inline-block">
      <button type="button" onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-[2px] border border-border bg-card px-3.5 py-2 text-sm text-foreground transition-colors hover:bg-muted cursor-pointer">
        <span className="material-symbols-rounded text-lg">account_circle</span>
        <span className="hidden sm:inline">{user.name ?? user.email}</span>
        <span className="material-symbols-rounded text-xs">{open ? "expand_less" : "expand_more"}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-[2px] border border-border bg-card p-1.5 shadow-lg z-50">
          <Link href="/status" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-[2px] px-3 py-2.5 text-sm transition-colors hover:bg-muted"><span className="material-symbols-rounded text-base">dashboard</span>Status Pengajuan</Link>
          <div className="my-1 border-t border-border" />
          <form action={logout}>
            <button type="submit" className="flex w-full items-center gap-2 rounded-[2px] px-3 py-2.5 text-sm transition-colors hover:bg-muted cursor-pointer"><span className="material-symbols-rounded text-base">logout</span>Keluar</button>
          </form>
        </div>
      )}
    </div>
  );
}
