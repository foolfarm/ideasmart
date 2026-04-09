/**
 * Proof Press — Intelligent In-Memory Cache Layer v2
 *
 * Miglioramenti rispetto alla v1:
 *
 * 1. **TTL differenziato per tipo di dato**
 *    - News (cambiano ogni giorno):          10 min
 *    - Editoriali / Startup / Reportage:     20 min
 *    - Widget LLM (Barometro, ThreatAlert):  30 min
 *    - Contatori sezione (badge nav):        5 min
 *    - Contatore iscritti (social proof):    60 min
 *    - Punto del giorno (LinkedIn post):     60 min
 *    - Homepage aggregata:                   10 min
 *
 * 2. **LRU eviction** — il cache ha un limite massimo di MAX_ENTRIES chiavi.
 *    Quando viene superato, le chiavi meno recentemente usate vengono rimosse.
 *    Questo previene memory leak con chiavi dinamiche (es. news:related:ID).
 *
 * 3. **Statistiche hit/miss per chiave** — ogni chiave tiene traccia di:
 *    - hits: quante volte è stata servita dalla cache
 *    - misses: quante volte ha richiesto una query DB
 *    - lastAccess: timestamp ultimo accesso
 *    Utili per monitoraggio e ottimizzazione futura.
 *
 * 4. **Stale-while-revalidate** — se la cache è scaduta, restituisce il valore
 *    stale immediatamente e aggiorna in background (come nella v1).
 *
 * 5. **Invalidazione selettiva per sezione** — invalidateSection(section) rimuove
 *    solo le chiavi relative a quella sezione, senza toccare le altre.
 *    Usato dai cron job dopo ogni refresh per evitare invalidazioni globali.
 *
 * 6. **getCacheStats()** — restituisce statistiche complete per il monitoraggio
 *    tramite l'endpoint /api/cache-stats.
 */

// ─── Tipi ────────────────────────────────────────────────────────────────────

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  refreshing: boolean;
  hits: number;
  misses: number;
  lastAccess: number;
  createdAt: number;
}

export interface CacheStats {
  totalKeys: number;
  freshKeys: number;
  staleKeys: number;
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  memoryEstimateKB: number;
  topKeys: Array<{
    key: string;
    hits: number;
    misses: number;
    hitRate: number;
    fresh: boolean;
    ttlRemainingMs: number;
  }>;
}

// ─── Configurazione ───────────────────────────────────────────────────────────

const MAX_ENTRIES = 500;

// ─── TTL per tipo di dato ─────────────────────────────────────────────────────

/** Notizie: cambiano ogni giorno, freschezza entro 10 min */
export const TTL_NEWS_MS = 10 * 60 * 1000;
/** Editoriali, startup del giorno, reportage, analisi di mercato */
export const TTL_EDITORIAL_MS = 20 * 60 * 1000;
/** Widget LLM: costosi da ricalcolare */
export const TTL_LLM_WIDGET_MS = 30 * 60 * 1000;
/** Contatori sezione (badge nav): leggeri, aggiornati ogni 5 min */
export const TTL_SECTION_COUNT_MS = 5 * 60 * 1000;
/** Contatore iscritti (social proof): stabile, aggiornato ogni ora */
export const TTL_SUBSCRIBER_COUNT_MS = 60 * 60 * 1000;
/** Homepage aggregata: mix di news + editoriale */
export const TTL_HOME_MS = 10 * 60 * 1000;
/** Punto del giorno (LinkedIn post): cambia una volta al giorno */
export const TTL_PUNTO_DEL_GIORNO_MS = 60 * 60 * 1000;

// Alias per compatibilità con il codice esistente
export const DEFAULT_TTL_MS = TTL_NEWS_MS;
export const EDITORIAL_TTL_MS = TTL_EDITORIAL_MS;

// ─── Store interno (LRU-aware) ────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const store = new Map<string, CacheEntry<any>>();

/** Sposta la chiave in fondo alla Map (= più recentemente usata per LRU). */
function _touch(key: string): void {
  const entry = store.get(key);
  if (!entry) return;
  store.delete(key);
  store.set(key, entry);
}

/** Rimuove le chiavi più vecchie (LRU) se il limite MAX_ENTRIES è superato. */
function _evictIfNeeded(): void {
  while (store.size > MAX_ENTRIES) {
    const oldestKey = store.keys().next().value;
    if (oldestKey) {
      store.delete(oldestKey);
    }
  }
}

// ─── API pubblica ─────────────────────────────────────────────────────────────

/**
 * Ottieni un valore dalla cache o calcolalo se mancante/scaduto.
 * Usa stale-while-revalidate: restituisce dati stale immediatamente e aggiorna in background.
 */
export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<T> {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  const now = Date.now();

  if (entry) {
    entry.lastAccess = now;
    _touch(key);

    if (now < entry.expiresAt) {
      // Fresh hit
      entry.hits++;
      return entry.value;
    }

    // Stale: restituisci immediatamente e aggiorna in background
    entry.hits++;
    if (!entry.refreshing) {
      entry.refreshing = true;
      fn()
        .then((value) => {
          const existing = store.get(key);
          if (existing) {
            existing.value = value;
            existing.expiresAt = Date.now() + ttlMs;
            existing.refreshing = false;
            _touch(key);
          } else {
            store.set(key, {
              value, expiresAt: Date.now() + ttlMs,
              refreshing: false, hits: 0, misses: 0,
              lastAccess: Date.now(), createdAt: Date.now()
            });
          }
        })
        .catch((err) => {
          console.error(`[Cache] Background refresh failed for "${key}":`, err);
          const existing = store.get(key);
          if (existing) existing.refreshing = false;
        });
    }
    return entry.value;
  }

  // Cache miss — fetch sincrono
  const value = await fn();
  const newEntry: CacheEntry<T> = {
    value,
    expiresAt: now + ttlMs,
    refreshing: false,
    hits: 0,
    misses: 1,
    lastAccess: now,
    createdAt: now
  };
  store.set(key, newEntry);
  _evictIfNeeded();
  return value;
}

/**
 * Invalida le chiavi relative a una specifica sezione editoriale.
 * Rimuove solo le chiavi per quella sezione senza toccare le altre.
 * Usato dai cron job dopo ogni refresh per invalidazione chirurgica.
 */
export function invalidateSection(section: string): void {
  const prefixes = [
    `news:latest:${section}:`,
    `news:section_counts`,
    `editorial:latest:${section}`,
    `startup:latest:${section}`,
    `reportage:latest:${section}`,
    `market:latest:${section}`,
    `news:homeData`, // la homepage aggrega tutte le sezioni
  ];
  let count = 0;
  for (const key of Array.from(store.keys())) {
    if (prefixes.some(p => key === p || key.startsWith(p))) {
      store.delete(key);
      count++;
    }
  }
  console.log(`[Cache] Invalidated ${count} keys for section "${section}"`);
}

/**
 * Invalida una o più chiavi con supporto wildcard (pattern che finisce con "*").
 */
export function invalidateCache(pattern: string): void {
  if (pattern.endsWith('*')) {
    const prefix = pattern.slice(0, -1);
    let count = 0;
    for (const key of Array.from(store.keys())) {
      if (key.startsWith(prefix)) {
        store.delete(key);
        count++;
      }
    }
    console.log(`[Cache] Invalidated ${count} keys matching "${pattern}"`);
  } else {
    store.delete(pattern);
    console.log(`[Cache] Invalidated key "${pattern}"`);
  }
}

/**
 * Invalida TUTTE le chiavi in cache (es. dopo un refresh completo).
 */
export function invalidateAll(): void {
  const count = store.size;
  store.clear();
  console.log(`[Cache] Cleared all ${count} cached entries`);
}

/**
 * Invalida una singola chiave per corrispondenza esatta.
 * Alias per compatibilità con il codice esistente.
 */
export function invalidateBySection(key: string): void {
  store.delete(key);
  console.log(`[Cache] Invalidated key "${key}"`);
}

/**
 * Restituisce statistiche complete della cache per monitoraggio.
 * Usato dall'endpoint /api/cache-stats.
 */
export function getCacheStats(): CacheStats {
  const now = Date.now();
  const keys = Array.from(store.keys());

  let totalHits = 0;
  let totalMisses = 0;
  let freshKeys = 0;

  const keyDetails = keys.map(key => {
    const entry = store.get(key)!;
    const fresh = now < entry.expiresAt;
    if (fresh) freshKeys++;
    totalHits += entry.hits;
    totalMisses += entry.misses;
    return {
      key,
      hits: entry.hits,
      misses: entry.misses,
      hitRate: entry.hits + entry.misses > 0
        ? Math.round((entry.hits / (entry.hits + entry.misses)) * 100)
        : 0,
      fresh,
      ttlRemainingMs: Math.max(0, entry.expiresAt - now)
    };
  });

  const topKeys = keyDetails
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 10);

  const totalRequests = totalHits + totalMisses;
  const hitRate = totalRequests > 0
    ? Math.round((totalHits / totalRequests) * 100)
    : 0;

  const memoryEstimateKB = Math.round(
    (store.size * 200 + keys.reduce((acc, k) => acc + k.length * 50, 0)) / 1024
  );

  return {
    totalKeys: keys.length,
    freshKeys,
    staleKeys: keys.length - freshKeys,
    totalHits,
    totalMisses,
    hitRate,
    memoryEstimateKB,
    topKeys
  };
}

// ─── Costanti chiavi cache ────────────────────────────────────────────────────

export const CACHE_KEYS = {
  HOME_DATA: 'news:homeData',
  NEWS_LATEST: (section: string, limit: number) => `news:latest:${section}:${limit}`,
  NEWS_RELATED: (id: number) => `news:related:${id}`,
  NEWS_SECTION_COUNTS: 'news:section_counts',
  EDITORIAL_LATEST: (section?: string) => `editorial:latest:${section ?? 'all'}`,
  STARTUP_LATEST: (section?: string) => `startup:latest:${section ?? 'all'}`,
  REPORTAGE_LATEST: (section?: string) => `reportage:latest:${section ?? 'all'}`,
  MARKET_LATEST: (section?: string) => `market:latest:${section ?? 'all'}`,
  PUNTO_DEL_GIORNO: 'sistema:puntoDelGiorno',
  THREAT_ALERT: 'sistema:threatAlert',
  SUBSCRIBER_COUNT: 'sistema:subscriberCount'
} as const;
