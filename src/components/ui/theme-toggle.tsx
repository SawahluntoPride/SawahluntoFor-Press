"use client";
import { useEffect, useState } from "react";
function readTheme(): boolean {
  if (typeof window === "undefined") return false;
  const t = localStorage.getItem("theme");
  const m = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return t === "dark" || (!t || t === "system") && m;
}
export function ThemeToggle() {
  const [dark, setDark] = useState(readTheme);
  useEffect(() => { document.documentElement.classList.toggle("dark", dark); }, [dark]);
  const toggle = () => { const n = !dark; setDark(n); localStorage.setItem("theme", n ? "dark" : "light"); };
  return (
    <button type="button" aria-label="Ganti tema" onClick={toggle} className="flex h-9 w-9 items-center justify-center rounded-[0.5rem] border border-border bg-card text-foreground transition-colors hover:bg-muted cursor-pointer">
      <span className="material-symbols-rounded text-lg">{dark ? "light_mode" : "dark_mode"}</span>
    </button>
  );
}
