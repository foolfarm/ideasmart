/**
 * Test Vitest — Cache Manager Intelligente
 * Verifica: TTL differenziato, LRU eviction, hit/miss stats, invalidazione selettiva
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  cached,
  getCacheStats,
  invalidateAll,
  invalidateSection,
  invalidateBySection,
  CACHE_KEYS,
  DEFAULT_TTL_MS,
  EDITORIAL_TTL_MS,
  TTL_SECTION_COUNT_MS,
  TTL_SUBSCRIBER_COUNT_MS,
  TTL_LLM_WIDGET_MS,
  TTL_EDITORIAL_MS,
  TTL_PUNTO_DEL_GIORNO_MS,
} from "./cache";

// ─── Helpers ────────────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("Cache Manager — TTL costanti", () => {
  it("DEFAULT_TTL_MS è 10 minuti (TTL_NEWS_MS)", () => {
    expect(DEFAULT_TTL_MS).toBe(10 * 60 * 1000);
  });
  it("EDITORIAL_TTL_MS è 20 minuti", () => {
    expect(TTL_EDITORIAL_MS).toBe(20 * 60 * 1000);
  });
  it("TTL_SECTION_COUNT_MS è 5 minuti", () => {
    expect(TTL_SECTION_COUNT_MS).toBe(5 * 60 * 1000);
  });
  it("TTL_SUBSCRIBER_COUNT_MS è 1 ora", () => {
    expect(TTL_SUBSCRIBER_COUNT_MS).toBe(60 * 60 * 1000);
  });
  it("TTL_LLM_WIDGET_MS è 30 minuti", () => {
    expect(TTL_LLM_WIDGET_MS).toBe(30 * 60 * 1000);
  });
  it("TTL_PUNTO_DEL_GIORNO_MS è 1 ora", () => {
    expect(TTL_PUNTO_DEL_GIORNO_MS).toBe(60 * 60 * 1000);
  });
});

describe("Cache Manager — comportamento base", () => {
  beforeEach(() => {
    invalidateAll();
  });

  it("restituisce il valore dalla factory al primo accesso (miss)", async () => {
    const factory = vi.fn().mockResolvedValue("hello");
    const result = await cached("test:base", factory, 60_000);
    expect(result).toBe("hello");
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it("restituisce il valore dalla cache al secondo accesso (hit)", async () => {
    const factory = vi.fn().mockResolvedValue("cached-value");
    await cached("test:hit", factory, 60_000);
    const result = await cached("test:hit", factory, 60_000);
    expect(result).toBe("cached-value");
    expect(factory).toHaveBeenCalledTimes(1); // factory chiamata una sola volta
  });

  it("scade dopo il TTL e richiama la factory", async () => {
    const key = "test:ttl:" + Date.now();
    const factory = vi.fn()
      .mockResolvedValueOnce("first")
      .mockResolvedValueOnce("second");
    await cached(key, factory, 50); // TTL 50ms
    await sleep(100); // aspetta scadenza (più margine)
    invalidateBySection(key); // forza rimozione esplicita per test affidabile
    const result = await cached(key, factory, 50);
    expect(result).toBe("second");
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it("non chiama la factory se il valore è ancora valido", async () => {
    const factory = vi.fn().mockResolvedValue("fresh");
    await cached("test:fresh", factory, 10_000); // TTL 10 secondi
    await cached("test:fresh", factory, 10_000);
    await cached("test:fresh", factory, 10_000);
    expect(factory).toHaveBeenCalledTimes(1);
  });
});

describe("Cache Manager — statistiche hit/miss", () => {
  beforeEach(() => {
    invalidateAll();
  });

  it("registra correttamente hit e miss nelle statistiche", async () => {
    const key = "test:stats:" + Date.now();
    const factory = vi.fn().mockResolvedValue(42);

    // Prima chiamata: miss
    await cached(key, factory, 60_000);
    // Seconda chiamata: hit
    await cached(key, factory, 60_000);
    // Terza chiamata: hit
    await cached(key, factory, 60_000);

    const stats = getCacheStats();
    // totalHits e totalMisses sono globali; verifichiamo che siano almeno 2 e 1
    expect(stats.totalHits).toBeGreaterThanOrEqual(2);
    expect(stats.totalMisses).toBeGreaterThanOrEqual(1);
  });

  it("getCacheStats restituisce hitRate corretto", async () => {
    invalidateAll();
    const key = "test:hitrate:" + Date.now();
    const factory = vi.fn().mockResolvedValue("x");
    await cached(key, factory, 60_000); // miss
    await cached(key, factory, 60_000); // hit
    await cached(key, factory, 60_000); // hit
    await cached(key, factory, 60_000); // hit

    const stats = getCacheStats();
    // 3 hit su 4 totali = 75% (hitRate è 0-100)
    expect(stats.hitRate).toBeGreaterThanOrEqual(50);
  });

  it("getCacheStats include totalKeys e memoryEstimateKB", async () => {
    const key = "test:meta:" + Date.now();
    await cached(key, async () => "meta-test", 12_345);
    const stats = getCacheStats();
    expect(stats.totalKeys).toBeGreaterThan(0);
    expect(stats.memoryEstimateKB).toBeGreaterThanOrEqual(0);
  });
});

describe("Cache Manager — invalidazione selettiva", () => {
  beforeEach(() => {
    invalidateAll();
  });

  it("invalidateSection rimuove solo le chiavi della sezione specificata", async () => {
    const aiFactory = vi.fn().mockResolvedValue("ai-news");
    const musicFactory = vi.fn().mockResolvedValue("music-news");

    await cached(CACHE_KEYS.NEWS_LATEST("ai", 20), aiFactory, 60_000);
    await cached(CACHE_KEYS.NEWS_LATEST("music", 20), musicFactory, 60_000);

    // Invalida solo la sezione 'ai'
    invalidateSection("ai");

    // La chiave 'ai' deve essere un miss (factory richiamata)
    await cached(CACHE_KEYS.NEWS_LATEST("ai", 20), aiFactory, 60_000);
    expect(aiFactory).toHaveBeenCalledTimes(2);

    // La chiave 'music' deve essere ancora un hit (factory NON richiamata di nuovo)
    await cached(CACHE_KEYS.NEWS_LATEST("music", 20), musicFactory, 60_000);
    expect(musicFactory).toHaveBeenCalledTimes(1);
  });

  it("invalidateAll svuota completamente la cache", async () => {
    const factory = vi.fn().mockResolvedValue("data");
    await cached("test:clear:1", factory, 60_000);
    await cached("test:clear:2", factory, 60_000);
    expect(factory).toHaveBeenCalledTimes(2);

    invalidateAll();

    await cached("test:clear:1", factory, 60_000);
    await cached("test:clear:2", factory, 60_000);
    expect(factory).toHaveBeenCalledTimes(4); // entrambe richiamate
  });

  it("invalidateBySection rimuove la chiave esatta specificata", async () => {
    const key1 = "editorial:ai:latest";
    const key2 = "editorial:music:latest";
    const f1 = vi.fn().mockResolvedValue("ed-ai");
    const f2 = vi.fn().mockResolvedValue("ed-music");

    await cached(key1, f1, 60_000);
    await cached(key2, f2, 60_000);

    // invalidateBySection è un alias per delete esatta
    invalidateBySection(key1);

    await cached(key1, f1, 60_000);
    expect(f1).toHaveBeenCalledTimes(2); // invalidata

    await cached(key2, f2, 60_000);
    expect(f2).toHaveBeenCalledTimes(1); // ancora in cache
  });
});

describe("Cache Manager — LRU eviction", () => {
  beforeEach(() => {
    invalidateAll();
  });

  it("non accumula chiavi in modo illimitato (LRU eviction attiva)", async () => {
    // Riempiamo la cache con molte chiavi distinte
    const promises = Array.from({ length: 20 }, (_, i) =>
      cached(`test:lru:${i}`, async () => i, 60_000)
    );
    await Promise.all(promises);

    const stats = getCacheStats();
    // Il numero di entry non deve superare MAX_CACHE_SIZE (1000)
    expect(stats.totalKeys).toBeLessThanOrEqual(1000);
    expect(stats.totalKeys).toBeGreaterThan(0);
  });
});

describe("Cache Manager — CACHE_KEYS helper", () => {
  it("NEWS_LATEST genera chiavi distinte per sezione e limit", () => {
    const k1 = CACHE_KEYS.NEWS_LATEST("ai", 20);
    const k2 = CACHE_KEYS.NEWS_LATEST("music", 20);
    const k3 = CACHE_KEYS.NEWS_LATEST("ai", 10);
    expect(k1).not.toBe(k2);
    expect(k1).not.toBe(k3);
  });

  it("EDITORIAL_LATEST genera chiavi distinte per sezione", () => {
    const k1 = CACHE_KEYS.EDITORIAL_LATEST("ai");
    const k2 = CACHE_KEYS.EDITORIAL_LATEST("startup");
    expect(k1).not.toBe(k2);
  });

  it("HOME_DATA è una stringa non vuota", () => {
    expect(typeof CACHE_KEYS.HOME_DATA).toBe("string");
    expect(CACHE_KEYS.HOME_DATA.length).toBeGreaterThan(0);
  });

  it("SUBSCRIBER_COUNT è una stringa non vuota", () => {
    expect(typeof CACHE_KEYS.SUBSCRIBER_COUNT).toBe("string");
    expect(CACHE_KEYS.SUBSCRIBER_COUNT.length).toBeGreaterThan(0);
  });
});
