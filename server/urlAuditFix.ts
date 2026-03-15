/**
 * URL Audit & Fix — IDEASMART
 * 
 * Livello 1: Fix immediato delle notizie esistenti nel DB
 * - Legge tutte le notizie con sourceUrl che non sono homepage
 * - Verifica HTTP reale (HEAD request)
 * - Se 404/NOT FOUND → sostituisce con homepage del dominio
 * - Se il dominio non risponde → usa fallback di sezione dalla whitelist
 * 
 * Livello 2: Audit automatico post-scraping
 * - Verifica ogni sourceUrl appena salvato
 * - Corregge automaticamente prima che l'utente veda la notizia
 */

import { getDb } from "./db";
import { newsItems } from "../drizzle/schema";
import { eq, like, or, not } from "drizzle-orm";
import { verifyUrl, sanitizeSourceUrl } from "./rssScraperNew";
import { getHomepageForUrl, SECTION_FALLBACKS } from "./rssSources";

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
 * Fix immediato: corregge tutti i sourceUrl nel DB che non sono homepage.
 * Processa in batch per non sovraccaricare il server.
 */
export async function fixAllSourceUrls(options: {
  section?: "ai" | "music" | "startup";
  batchSize?: number;
  delayMs?: number;
} = {}): Promise<AuditResult> {
  const { section, batchSize = 10, delayMs = 500 } = options;
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

  // Recupera tutte le notizie (o solo la sezione specificata)
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

  // Processa in batch
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);

    await Promise.all(batch.map(async (row) => {
      const url = row.sourceUrl || "";
      const sec = row.section as "ai" | "music" | "startup";

      // Se è già una homepage valida, skip
      if (url && isHomepageUrl(url)) {
        const ok = await verifyUrl(url, 5000);
        if (ok) {
          result.alreadyOk++;
          result.checked++;
          return;
        }
        // Homepage non raggiungibile → usa fallback di sezione
        const fallback = SECTION_FALLBACKS[sec];
        try {
          await db.update(newsItems)
            .set({ sourceUrl: fallback })
            .where(eq(newsItems.id, row.id));
          result.fixed++;
          console.log(`[UrlAuditFix] Fix homepage irraggiungibile: ${url} → ${fallback} (ID: ${row.id})`);
        } catch (err) {
          result.failed++;
          result.errors.push(`ID ${row.id}: ${(err as Error).message}`);
        }
        result.checked++;
        return;
      }

      // URL con path specifico → prendi la homepage
      result.checked++;
      try {
        const fixedUrl = await sanitizeSourceUrl(url, sec);
        if (fixedUrl !== url) {
          await db.update(newsItems)
            .set({ sourceUrl: fixedUrl })
            .where(eq(newsItems.id, row.id));
          result.fixed++;
          console.log(`[UrlAuditFix] Fix: ${url.slice(0, 60)}... → ${fixedUrl} (ID: ${row.id})`);
        } else {
          result.alreadyOk++;
        }
      } catch (err) {
        result.failed++;
        result.errors.push(`ID ${row.id}: ${(err as Error).message}`);
        // Fallback di emergenza
        try {
          await db.update(newsItems)
            .set({ sourceUrl: SECTION_FALLBACKS[sec] })
            .where(eq(newsItems.id, row.id));
        } catch {
          // ignora
        }
      }
    }));

    // Delay tra batch per non sovraccaricare
    if (i + batchSize < rows.length) {
      await new Promise(r => setTimeout(r, delayMs));
    }

    const progress = Math.min(i + batchSize, rows.length);
    if (progress % 50 === 0 || progress === rows.length) {
      console.log(`[UrlAuditFix] Progresso: ${progress}/${result.total} (fix: ${result.fixed}, ok: ${result.alreadyOk})`);
    }
  }

  console.log(`[UrlAuditFix] ✅ Audit completato: ${result.total} totali, ${result.fixed} corretti, ${result.alreadyOk} già ok, ${result.failed} falliti`);
  return result;
}

/**
 * Audit rapido post-scraping: verifica solo le notizie appena inserite.
 * Più veloce del fix completo, usato dopo ogni aggiornamento RSS.
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
  })
    .from(newsItems)
    .where(eq(newsItems.section, section))
    .limit(limit);

  let fixed = 0, ok = 0, failed = 0;

  await Promise.all(rows.map(async (row) => {
    const url = row.sourceUrl || "";
    if (!url || url === "#") {
      // URL mancante → usa fallback
      try {
        await db.update(newsItems)
          .set({ sourceUrl: SECTION_FALLBACKS[section] })
          .where(eq(newsItems.id, row.id));
        fixed++;
      } catch { failed++; }
      return;
    }

    if (isHomepageUrl(url)) {
      ok++;
      return; // Homepage → già corretto
    }

    // URL con path → correggi
    try {
      const fixedUrl = await sanitizeSourceUrl(url, section);
      if (fixedUrl !== url) {
        await db.update(newsItems)
          .set({ sourceUrl: fixedUrl })
          .where(eq(newsItems.id, row.id));
        fixed++;
      } else {
        ok++;
      }
    } catch {
      failed++;
    }
  }));

  return { fixed, ok, failed };
}
