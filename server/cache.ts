/**
 * IDEASMART — In-Memory Cache Layer
 *
 * Provides a simple TTL-based in-memory cache to avoid repeated database
 * queries for public, read-heavy content (news, editorials, reportage, etc.).
 *
 * Strategy:
 *  - All public read procedures use this cache with a 10-minute TTL.
 *  - On server start, the cache is pre-warmed so the first visitor never waits.
 *  - When the news scheduler runs (daily refresh), it invalidates the cache so
 *    the next request fetches fresh data and re-populates the cache.
 *  - Stale-while-revalidate: if the cached entry is expired, the stale value is
 *    returned immediately while a background refresh is triggered.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  refreshing: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const store = new Map<string, CacheEntry<any>>();

const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes
const EDITORIAL_TTL_MS = 15 * 60 * 1000; // 15 minutes for slower-changing content

/**
 * Get a value from cache or compute it if missing/expired.
 * Uses stale-while-revalidate: returns stale data immediately and refreshes in background.
 */
export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<T> {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  const now = Date.now();

  if (entry) {
    if (now < entry.expiresAt) {
      // Fresh — return immediately
      return entry.value;
    }

    // Stale — return immediately and refresh in background
    if (!entry.refreshing) {
      entry.refreshing = true;
      fn()
        .then((value) => {
          store.set(key, { value, expiresAt: Date.now() + ttlMs, refreshing: false });
        })
        .catch((err) => {
          console.error(`[Cache] Background refresh failed for "${key}":`, err);
          entry.refreshing = false;
        });
    }
    return entry.value;
  }

  // Cache miss — fetch synchronously
  const value = await fn();
  store.set(key, { value, expiresAt: now + ttlMs, refreshing: false });
  return value;
}

/**
 * Invalidate one or more cache keys (supports prefix wildcards ending with "*").
 * Call this after any content refresh to ensure next request gets fresh data.
 */
export function invalidateCache(pattern: string): void {
  if (pattern.endsWith('*')) {
    const prefix = pattern.slice(0, -1);
    for (const key of Array.from(store.keys())) {
      if (key.startsWith(prefix)) {
        store.delete(key);
      }
    }
    console.log(`[Cache] Invalidated all keys matching "${pattern}"`);
  } else {
    store.delete(pattern);
    console.log(`[Cache] Invalidated key "${pattern}"`);
  }
}

/**
 * Invalidate ALL cached entries (e.g. after a full content refresh).
 */
export function invalidateAll(): void {
  const count = store.size;
  store.clear();
  console.log(`[Cache] Cleared all ${count} cached entries`);
}

/**
 * Return current cache statistics for monitoring.
 */
export function getCacheStats(): { keys: string[]; size: number; fresh: number; stale: number } {
  const now = Date.now();
  const keys = Array.from(store.keys());
  const fresh = keys.filter((k) => (store.get(k)?.expiresAt ?? 0) > now).length;
  return { keys, size: keys.length, fresh, stale: keys.length - fresh };
}

// ─── Cache key constants ──────────────────────────────────────────────────────

export const CACHE_KEYS = {
  HOME_DATA: 'news:homeData',
  NEWS_LATEST: (section: string, limit: number) => `news:latest:${section}:${limit}`,
  NEWS_RELATED: (id: number) => `news:related:${id}`,
  EDITORIAL_LATEST: (section?: string) => `editorial:latest:${section ?? 'all'}`,
  STARTUP_LATEST: (section?: string) => `startup:latest:${section ?? 'all'}`,
  REPORTAGE_LATEST: (section?: string) => `reportage:latest:${section ?? 'all'}`,
  MARKET_LATEST: (section?: string) => `market:latest:${section ?? 'all'}`,
  PUNTO_DEL_GIORNO: 'sistema:puntoDelGiorno',
  BAROMETRO: 'sistema:barometro',
  THREAT_ALERT: 'sistema:threatAlert',
} as const;

export { DEFAULT_TTL_MS, EDITORIAL_TTL_MS };
