/**
 * Cek signature (magic bytes) file PDF asli, bukan cuma percaya
 * Content-Type yang dikirim client (gampang dipalsukan).
 */
export function isPdfBuffer(buffer: Buffer): boolean {
  const signature = buffer.subarray(0, 5).toString("ascii");
  return signature === "%PDF-";
}