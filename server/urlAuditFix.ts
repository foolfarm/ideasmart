/**
 * URL Audit & Fix — IDEASMART
 * 
 * PRINCIPIO FONDAMENTALE (v3 — definitivo):
 * - sourceUrl = URL dell'articolo originale (link diretto all'articolo su fonte reale)
 * - L'audit PRESERVA SEMPRE gli URL con path (= URL articolo specifico)
 * - L'audit corregge SOLO:
 *   1. URL completamente mancanti, "#" o troppo corti (< 15 char)
 *   2. URL senza path (= homepage) → usa homepage della fonte corretta
 * 
 * COSA NON FA:
 * - NON fa whitelist per dominio (molti articoli hanno CDN/redirect con dominio diverso)
 * - NON sostituisce URL di articoli reali (con path) con homepage
 * - NON fa verifica HTTP bloccante (molti siti bloccano HEAD da server)
 * 
 * La verifica HTTP avviene nel nightlyAuditScheduler (02:00 CET) che sostituisce
 * gli URL non raggiungibili con notizie fresche da RSS.
 */

import { getDb } from "./db";
import { newsItems } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { SECTION_FALLBACKS } from "./rssSources";

export interface AuditResult {
  total: number;
  checked: number;
  fixed: number;
  alreadyOk: number;
  failed: number;
  errors: string[];
}

/**
 * Verifica se un URL è una homepage (nessun path significativo).
 * Un URL con path (es. /2026/03/article-title) è un articolo specifico → PRESERVARE.
 */
function isHomepageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname;
    return path === "/" || path === "" || path === "//" || path.length <= 1;
  } catch {
    return false;
  }
}

/**
 * Verifica se un URL è valido (ha schema http/https e un hostname).
 */
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (parsed.protocol === "http:" || parsed.protocol === "https:") && parsed.hostname.length > 3;
  } catch {
    return false;
  }
}

/**
 * Audit rapido post-scraping: verifica solo le notizie appena inserite.
 * PRESERVA gli URL con path (articoli specifici).
 * Corregge SOLO URL mancanti o homepage.
 */
export async function auditRecentNews(
  section: "ai" | "music" | "startup" | "finance" | "health" | "sport" | "luxury" | "news" | "motori" | "tennis" | "basket" | "gossip" | "cybersecurity" | "sondaggi",
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
    
    // Caso 1: URL mancante, placeholder o troppo corto → usa fallback di sezione
    if (!url || url === "#" || url.length < 15 || !isValidUrl(url)) {
      try {
        await db.update(newsItems)
          .set({ sourceUrl: SECTION_FALLBACKS[section] })
          .where(eq(newsItems.id, row.id));
        fixed++;
        console.log(`[UrlAuditFix] Fix URL non valido → ${SECTION_FALLBACKS[section]} (ID: ${row.id})`);
      } catch { failed++; }
      return;
    }

    // Caso 2: URL con path (articolo specifico) → PRESERVA SEMPRE
    // Non importa il dominio: CDN, feedburner, redirect sono tutti validi
    if (!isHomepageUrl(url)) {
      ok++;
      return;
    }

    // Caso 3: URL è una homepage (nessun path) → usa homepage della fonte
    // Questo può succedere se il feed RSS non include l'URL dell'articolo
    try {
      await db.update(newsItems)
        .set({ sourceUrl: SECTION_FALLBACKS[section] })
        .where(eq(newsItems.id, row.id));
      fixed++;
      console.log(`[UrlAuditFix] Fix homepage URL → ${SECTION_FALLBACKS[section]} (ID: ${row.id})`);
    } catch { failed++; }
  }));

  return { fixed, ok, failed };
}

/**
 * Fix completo di tutte le notizie nel DB.
 * PRESERVA gli URL con path (articoli specifici).
 * Corregge SOLO URL mancanti o homepage.
 */
export async function fixAllSourceUrls(options: {
  section?: "ai" | "music" | "startup" | "finance" | "health" | "sport" | "luxury" | "news" | "motori" | "tennis" | "basket" | "gossip" | "cybersecurity" | "sondaggi";
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
      const sec = row.section as "ai" | "music" | "startup" | "finance" | "health" | "sport" | "luxury" | "news" | "motori" | "tennis" | "basket" | "gossip" | "cybersecurity" | "sondaggi";
      result.checked++;

      // URL non valido o troppo corto → usa fallback
      if (!url || url === "#" || url.length < 15 || !isValidUrl(url)) {
        try {
          await db.update(newsItems)
            .set({ sourceUrl: SECTION_FALLBACKS[sec] })
            .where(eq(newsItems.id, row.id));
          result.fixed++;
          console.log(`[UrlAuditFix] Fix URL non valido: "${url.slice(0, 40)}" → ${SECTION_FALLBACKS[sec]} (ID: ${row.id})`);
        } catch (err) {
          result.failed++;
          result.errors.push(`ID ${row.id}: ${(err as Error).message}`);
        }
        return;
      }

      // URL con path (articolo specifico) → PRESERVA SEMPRE
      if (!isHomepageUrl(url)) {
        result.alreadyOk++;
        return;
      }

      // URL è una homepage → usa fallback
      try {
        await db.update(newsItems)
          .set({ sourceUrl: SECTION_FALLBACKS[sec] })
          .where(eq(newsItems.id, row.id));
        result.fixed++;
        console.log(`[UrlAuditFix] Fix homepage URL: "${url.slice(0, 60)}" → ${SECTION_FALLBACKS[sec]} (ID: ${row.id})`);
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
