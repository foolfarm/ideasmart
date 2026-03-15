/**
 * URL Audit & Fix — IDEASMART
 * 
 * PRINCIPIO FONDAMENTALE (aggiornato):
 * - sourceUrl = URL dell'articolo originale (link diretto all'articolo su fonte reale)
 * - L'audit NON deve mai sostituire URL di articoli reali con homepage
 * - L'audit corregge SOLO:
 *   1. URL completamente mancanti o "#" → usa homepage della fonte
 *   2. URL di domini non nella whitelist → usa homepage della fonte corretta
 *   3. URL inventati (non provenienti da feed RSS) → usa homepage della fonte
 * 
 * COSA NON FA:
 * - NON sostituisce URL di articoli reali (con path) con homepage
 * - NON fa verifica HTTP bloccante (molti siti bloccano HEAD da server)
 */

import { getDb } from "./db";
import { newsItems } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { SECTION_FALLBACKS, AI_SOURCES, MUSIC_SOURCES, STARTUP_SOURCES } from "./rssSources";
import type { RssSource } from "./rssSources";

export interface AuditResult {
  total: number;
  checked: number;
  fixed: number;
  alreadyOk: number;
  failed: number;
  errors: string[];
}

/**
 * Verifica se un URL è una homepage (nessun path significativo)
 */
function isHomepageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.pathname === "/" || parsed.pathname === "" || parsed.pathname === "//";
  } catch {
    return false;
  }
}

/**
 * Verifica se un URL appartiene a un dominio nella whitelist della sezione.
 * Se sì, l'URL è considerato valido (proviene da un feed RSS certificato).
 */
function isWhitelistedDomain(url: string, section: "ai" | "music" | "startup"): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, "");
    
    const sources: RssSource[] = section === "ai" ? AI_SOURCES : section === "music" ? MUSIC_SOURCES : STARTUP_SOURCES;
    return sources.some(s => {
      try {
        const srcHostname = new URL(s.homepage).hostname.replace(/^www\./, "");
        return hostname === srcHostname || hostname.endsWith("." + srcHostname);
      } catch { return false; }
    });
  } catch {
    return false;
  }
}

/**
 * Audit rapido post-scraping: verifica solo le notizie appena inserite.
 * Corregge SOLO URL mancanti o di domini non in whitelist.
 * PRESERVA gli URL di articoli reali provenienti da feed RSS certificati.
 */
export async function auditRecentNews(
  section: "ai" | "music" | "startup",
  limit = 25
): Promise<{ fixed: number; ok: number; failed: number }> {
  const db = await getDb();
  if (!db) return { fixed: 0, ok: 0, failed: 0 };

  const rows = await db.select({
    id: newsItems.id,
    sourceUrl: newsItems.sourceUrl,
    sourceName: newsItems.sourceName,
  })
    .from(newsItems)
    .where(eq(newsItems.section, section))
    .limit(limit);

  let fixed = 0, ok = 0, failed = 0;

  await Promise.all(rows.map(async (row) => {
    const url = row.sourceUrl || "";
    
    // Caso 1: URL mancante o placeholder → usa fallback di sezione
    if (!url || url === "#" || url.length < 10) {
      try {
        await db.update(newsItems)
          .set({ sourceUrl: SECTION_FALLBACKS[section] })
          .where(eq(newsItems.id, row.id));
        fixed++;
        console.log(`[UrlAuditFix] Fix URL mancante → ${SECTION_FALLBACKS[section]} (ID: ${row.id})`);
      } catch { failed++; }
      return;
    }

    // Caso 2: URL di dominio in whitelist → PRESERVA (è un articolo reale da RSS)
    if (isWhitelistedDomain(url, section)) {
      ok++;
      return;
    }

    // Caso 3: URL di dominio NON in whitelist → potrebbe essere inventato
    // Usa il fallback di sezione come sicurezza
    try {
      await db.update(newsItems)
        .set({ sourceUrl: SECTION_FALLBACKS[section] })
        .where(eq(newsItems.id, row.id));
      fixed++;
      console.log(`[UrlAuditFix] Fix dominio non in whitelist: ${url.slice(0, 60)} → ${SECTION_FALLBACKS[section]} (ID: ${row.id})`);
    } catch { failed++; }
  }));

  return { fixed, ok, failed };
}

/**
 * Fix completo di tutte le notizie nel DB.
 * Corregge SOLO URL mancanti o di domini non in whitelist.
 * PRESERVA gli URL di articoli reali provenienti da feed RSS certificati.
 */
export async function fixAllSourceUrls(options: {
  section?: "ai" | "music" | "startup";
  batchSize?: number;
  delayMs?: number;
} = {}): Promise<AuditResult> {
  const { section, batchSize = 20, delayMs = 200 } = options;
  const db = await getDb();
  if (!db) throw new Error("DB non disponibile");

  const result: AuditResult = {
    total: 0,
    checked: 0,
    fixed: 0,
    alreadyOk: 0,
    failed: 0,
    errors: [],
  };

  const query = db.select({
    id: newsItems.id,
    section: newsItems.section,
    sourceUrl: newsItems.sourceUrl,
    sourceName: newsItems.sourceName,
    title: newsItems.title,
  }).from(newsItems);

  const rows = section
    ? await query.where(eq(newsItems.section, section))
    : await query;

  result.total = rows.length;
  console.log(`[UrlAuditFix] Inizio audit di ${result.total} notizie${section ? ` (sezione: ${section})` : ""}...`);

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);

    await Promise.all(batch.map(async (row) => {
      const url = row.sourceUrl || "";
      const sec = row.section as "ai" | "music" | "startup";
      result.checked++;

      // URL mancante → usa fallback
      if (!url || url === "#" || url.length < 10) {
        try {
          await db.update(newsItems)
            .set({ sourceUrl: SECTION_FALLBACKS[sec] })
            .where(eq(newsItems.id, row.id));
          result.fixed++;
        } catch (err) {
          result.failed++;
          result.errors.push(`ID ${row.id}: ${(err as Error).message}`);
        }
        return;
      }

      // URL di dominio in whitelist → PRESERVA
      if (isWhitelistedDomain(url, sec)) {
        result.alreadyOk++;
        return;
      }

      // URL di dominio NON in whitelist → usa fallback
      try {
        await db.update(newsItems)
          .set({ sourceUrl: SECTION_FALLBACKS[sec] })
          .where(eq(newsItems.id, row.id));
        result.fixed++;
        console.log(`[UrlAuditFix] Fix dominio non in whitelist: ${url.slice(0, 60)} → ${SECTION_FALLBACKS[sec]} (ID: ${row.id})`);
      } catch (err) {
        result.failed++;
        result.errors.push(`ID ${row.id}: ${(err as Error).message}`);
      }
    }));

    if (i + batchSize < rows.length) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }

  console.log(`[UrlAuditFix] ✅ Audit completato: ${result.total} totali, ${result.fixed} corretti, ${result.alreadyOk} già ok, ${result.failed} falliti`);
  return result;
}
