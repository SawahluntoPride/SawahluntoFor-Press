import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border">
      <div className="mx-auto flex w-full max-w-[1200px] items-start justify-between px-[clamp(2rem,1.08rem+3.92vw,3rem)] py-[56px]">
        <div className="flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.06875rem] text-muted-foreground">Layanan</p>
          <nav className="flex flex-col gap-3">
            <Link href="/panduan" className="text-sm text-foreground transition-colors hover:text-accent">Panduan administrasi</Link>
            <Link href="/ajukan" className="text-sm text-foreground transition-colors hover:text-accent">Ajukan kerja sama</Link>
            <Link href="/status" className="text-sm text-foreground transition-colors hover:text-accent">Status pengajuan</Link>
          </nav>
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.06875rem] text-muted-foreground">Bantuan</p>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">Untuk pertanyaan administratif, hubungi pengelola layanan pada hari dan jam kerja.</p>
        </div>
      </div>
    </footer>
  );
}
