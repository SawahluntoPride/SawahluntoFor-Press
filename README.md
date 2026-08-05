# Kerja Sama Pers Sawahlunto

Portal layanan pengajuan dan pengelolaan kerja sama publikasi antara **Pemerintah Kota Sawahlunto** dan perusahaan media pers.

Aplikasi ini mereplikasi alur administrasi dari situs layanan publik: informasi, panduan, unggah berkas, verifikasi, pelacakan status, serta akses akun media.

## Fitur

- **Beranda** — ringkasan layanan, tiga tahap kemitraan, dan kontak Dinas Kominfo
- **Panduan administrasi** — persiapan dokumen sebelum pengajuan
- **Ajukan kerja sama** — daftar dokumen wajib (Akta Notaris, Dewan Pers, NIB, dll.)
- **Verifikasi berkas** — unggah PDF (maks. 4 MB) per dokumen
- **Status pengajuan** — lacak pengajuan dengan nomor referensi
- **Masuk / Daftar** — akses akun perusahaan pers

## Tech stack

| Layer | Teknologi |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| UI | React 19, CSS custom (token Framer) |
| Fonts | Young Serif, Google Sans Flex, Inter (`next/font`) |
| Auth | JWT session (`jose`) + bcrypt |
| Database | SQLite via [Prisma](https://www.prisma.io) |
| Validasi | Zod |

## Halaman

| Route | Deskripsi |
| --- | --- |
| `/` | Landing page layanan |
| `/panduan` | Panduan administrasi |
| `/ajukan` | Langkah 01 — dokumen wajib |
| `/verifikasi-berkas` | Langkah 02 — unggah berkas |
| `/status` | Langkah 03 — lacak nomor pengajuan |
| `/masuk` | Login akun media |
| `/daftar` | Informasi pendaftaran media |

## Prasyarat

- Node.js 20+ (disarankan)
- npm 10+

## Memulai

```bash
# 1. Clone repositori
git clone https://github.com/raven1zed/aplikasi-penawaran-kerjasama-antara-pemerintah-dan-media-pers.git
cd aplikasi-penawaran-kerjasama-antara-pemerintah-dan-media-pers

# 2. Install dependensi
npm install

# 3. Siapkan environment
cp .env.example .env

# 4. Generate Prisma Client & migrasi database
npx prisma generate
npx prisma db push

# 5. Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Seed data (opsional)

```bash
curl http://localhost:3000/api/seed
```

Endpoint seed hanya aktif di development.

## Environment variables

Salin `.env.example` menjadi `.env` lalu sesuaikan:

| Variabel | Keterangan |
| --- | --- |
| `DATABASE_URL` | Koneksi Prisma, contoh: `file:./dev.db` |
| `SESSION_SECRET` | Secret untuk menandatangani cookie sesi (string acak panjang) |

Jangan commit file `.env` — sudah diabaikan di `.gitignore`.

## Scripts

```bash
npm run dev        # development server
npm run build      # production build
npm run start      # jalankan build production
npm run lint       # ESLint
npm run typecheck  # TypeScript tanpa emit
```

## Struktur proyek

```
src/
  app/                 # App Router pages & API
  components/          # UI & layout
  lib/
    auth/              # login, session, DAL
    fonts.ts           # Young Serif, Google Sans Flex, Inter
    generated/prisma/  # Prisma Client output
prisma/
  schema.prisma        # model User, Organization, Proposal, …
public/
  logo.png
  fonts/
```

## Desain

Palet dan tipografi mengikuti identitas portal layanan:

- Latar: `#f5f1e8`
- Teks: `#1d1c19` / muted `#706e68`
- Aksen: `#ff6a1a`
- Heading: **Young Serif**
- Body / UI: **Google Sans Flex**
- Fallback teks: **Inter**

## Lisensi

Private — Pemerintah Kota Sawahlunto / proyek internal.
