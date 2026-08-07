/**
 * Daftar dokumen wajib yang harus diunggah oleh perusahaan pers
 * sebelum pengajuan dapat diverifikasi oleh admin.
 *
 * Urutan dan nama ini harus konsisten di seluruh aplikasi
 * (halaman ajukan, verifikasi-berkas, dan admin dashboard).
 */
export const REQUIRED_DOCS: ReadonlyArray<string> = [
  "Surat Permohonan Kerjasama",
  "Akta Notaris",
  "Bukti Terverifikasi Dewan Pers",
  "NIB — Nomor Induk Berusaha",
  "Sertifikat Redaktur",
  "NPWP Perusahaan",
];

/** Mapping dari nama dokumen ke tag badge status. */
export const DOC_TAGS: Record<string, string> = {
  "Surat Permohonan Kerjasama": "Wajib",
  "Akta Notaris": "Wajib",
  "Bukti Terverifikasi Dewan Pers": "Wajib",
  "NIB — Nomor Induk Berusaha": "Wajib",
  "Sertifikat Redaktur": "Wajib",
  "NPWP Perusahaan": "Wajib",
};
