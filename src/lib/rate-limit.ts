import "server-only";

/**
 * Rate limiter in-memory sederhana per key (misal per IP atau per email).
 * Cukup buat skala kecil (satu instance server). Kalau nanti deploy multi-
 * instance / serverless, ganti ke Redis atau storage eksternal.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Bersihin entri lama tiap 10 menit biar Map nggak membengkak terus.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}, 10 * 60 * 1000);

export function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 5 * 60 * 1000, // 5 menit
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= maxAttempts) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}