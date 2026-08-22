// ponytail: in-memory Map — resets on restart and isn't shared across instances/regions.
// Fine for a single-instance milestone; swap for Redis/Upstash when scaling horizontally.
const buckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Returns true if the action identified by `key` is still within its limit
 * (and records the attempt), false if the caller should be rejected.
 */
export function rateLimit(key: string, limit = 5, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;

  bucket.count += 1;
  return true;
}
