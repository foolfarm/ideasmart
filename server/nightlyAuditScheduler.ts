/**
 * nightlyAuditScheduler.ts — Audit Notturno IDEASMART
 * ─────────────────────────────────────────────────────────────────────────────
 * Eseguito ogni notte alle 02:00 CET (dopo che tutti i contenuti sono stati
 * generati da 00:00 a 01:30 CET).
 *
 * Flusso per ogni sezione (AI, Music, Startup):
 * 1. Controlla ogni notizia nel DB: verifica che l'URL sia raggiungibile (HTTP 200)
 * 2. Le notizie con URL non raggiungibile (4xx, 5xx, timeout) vengono eliminate
 * 3. Le notizie eliminate vengono sostituite con notizie fresche da RSS
 * 4. Notifica l'owner con il report dell'audit
 *
 * PRINCIPIO: Nessuna notizia inventata. Le sostituzioni vengono sempre da RSS reali.
 */

import { getDb } from "./db";
import { newsItems } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { scrapeAINews, scrapeMusicNews, scrapeStartupNews } from "./rssScraperNew";
import { SECTION_FALLBACKS } from "./rssSources";
import { notifyOwner } from "./_core/notification";
import { findNewsImage } from "./stockImages";

const FETCH_TIMEOUT_MS = 8_000;
const USER_AGENT = "Mozilla/5.0 (compatible; IDEASMART-AuditBot/1.0; +https://www.ideasmart.ai)";

// ─── Verifica raggiungibilità URL ─────────────────────────────────────────────

async function checkUrl(url: string): Promise<{ ok: boolean; status: number; reason: string }> {
  if (!url || url.length < 10 || url === "#") {
    return { ok: false, status: 0, reason: "URL mancante o placeholder" };
  }

  try {
    const parsed = new URL(url);
    // URL senza path (homepage pura) = notizia senza fonte specifica → non valida
    if (parsed.pathname === "/" || parsed.pathname === "") {
      return { ok: false, status: 0, reason: "URL è homepage senza path articolo" };
    }
  } catch {
    return { ok: false, status: 0, reason: "URL malformato" };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
      },
      redirect: "follow",
    });

    clearTimeout(timeoutId);

    // Alcuni siti bloccano HEAD ma rispondono a GET → considera 405 come "forse ok"
    if (response.status === 405) {
      return { ok: true, status: 405, reason: "HEAD non supportato (sito probabilmente ok)" };
    }

    // 2xx e 3xx = ok
    if (response.status >= 200 && response.status < 400) {
      return { ok: true, status: response.status, reason: "OK" };
    }

    return { ok: false, status: response.status, reason: `HTTP ${response.status}` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("abort") || msg.includes("timeout")) {
      return { ok: false, status: 0, reason: "Timeout" };
    }
    return { ok: false, status: 0, reason: `Errore rete: ${msg.slice(0, 60)}` };
  }
}

// ─── Tipo articolo RSS ────────────────────────────────────────────────────────

type RssArticle = Awaited<ReturnType<typeof scrapeAINews>>[number];

// ─── Audit e sostituzione per sezione ────────────────────────────────────────

async function auditAndReplaceSection(
  section: "ai" | "music" | "startup" | "finance" | "health" | "sport" | "luxury"
): Promise<{
  checked: number;
  invalid: number;
  replaced: number;
  failed: number;
}> {
  const db = await getDb();
  if (!db) return { checked: 0, invalid: 0, replaced: 0, failed: 0 };

  const sectionLabel = section.toUpperCase();
  console.log(`[NightlyAudit] 🔍 Avvio audit sezione ${sectionLabel}...`);

  // 1. Recupera tutte le notizie della sezione
  const rows = await db.select({
    id: newsItems.id,
    title: newsItems.title,
    sourceUrl: newsItems.sourceUrl,
    sourceName: newsItems.sourceName,
  })
    .from(newsItems)
    .where(eq(newsItems.section, section));

  let checked = 0, invalid = 0, replaced = 0, failed = 0;
  const invalidIds: number[] = [];

  // 2. Verifica ogni URL in parallelo (max 5 alla volta per non sovraccaricare)
  const BATCH = 5;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map(async (row) => {
        const check = await checkUrl(row.sourceUrl || "");
        checked++;
        if (!check.ok) {
          console.log(`[NightlyAudit] ❌ URL non valido (${check.reason}): ${(row.sourceUrl || "").slice(0, 80)} — "${row.title?.slice(0, 50)}"`);
          invalid++;
          invalidIds.push(row.id);
        }
        return { id: row.id, ok: check.ok };
      })
    );
    // Piccola pausa tra i batch per non sovraccaricare i server esterni
    if (i + BATCH < rows.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  console.log(`[NightlyAudit] ${sectionLabel}: ${checked} verificate, ${invalid} non valide`);

  if (invalidIds.length === 0) {
    console.log(`[NightlyAudit] ✅ ${sectionLabel}: tutte le notizie hanno URL validi`);
    return { checked, invalid, replaced, failed };
  }

  // 3. Scraping RSS fresco per ottenere notizie sostitutive
  console.log(`[NightlyAudit] 🔄 ${sectionLabel}: scarico ${invalidIds.length} notizie sostitutive da RSS...`);
  let freshArticles: RssArticle[] = [];
  try {
    if (section === "ai") freshArticles = await scrapeAINews();
    else if (section === "music") freshArticles = await scrapeMusicNews();
    else freshArticles = await scrapeStartupNews();
  } catch (err) {
    console.error(`[NightlyAudit] ❌ ${sectionLabel}: errore scraping RSS sostitutivo:`, err);
    failed = invalidIds.length;
    return { checked, invalid, replaced, failed };
  }

  // Filtra gli articoli freschi: usa solo quelli con URL articolo valido (con path)
  const validFresh = freshArticles.filter(a => {
    try {
      const u = new URL(a.sourceUrl);
      return u.pathname.length > 1;
    } catch { return false; }
  });

  console.log(`[NightlyAudit] ${sectionLabel}: ${validFresh.length} articoli freschi disponibili per sostituzione`);

  // 4. Sostituisce le notizie non valide con quelle fresche
  const weekLabel = new Date().toISOString().split("T")[0];

  for (let i = 0; i < invalidIds.length; i++) {
    const id = invalidIds[i];
    const fresh = validFresh[i % validFresh.length]; // cicla se ne abbiamo meno delle invalid

    if (!fresh) {
      // Nessun articolo fresco disponibile → usa fallback di sezione
      try {
        await db.update(newsItems)
          .set({ sourceUrl: SECTION_FALLBACKS[section] })
          .where(and(eq(newsItems.id, id), eq(newsItems.section, section)));
        replaced++;
      } catch { failed++; }
      continue;
    }

    // Recupera immagine contestuale (opzionale)
    let imageUrl: string | null = null;
    try {
      imageUrl = await findNewsImage(fresh.title, fresh.category) ?? null;
    } catch { /* non critico */ }

    try {
      await db.update(newsItems)
        .set({
          title: fresh.title,
          summary: fresh.summary,
          category: fresh.category,
          sourceName: fresh.sourceName,
          sourceUrl: fresh.sourceUrl,
          publishedAt: fresh.publishedAt,
          weekLabel,
          imageUrl,
        })
        .where(and(eq(newsItems.id, id), eq(newsItems.section, section)));
      replaced++;
      console.log(`[NightlyAudit] ✅ ${sectionLabel}: sostituita notizia ID ${id} con "${fresh.title.slice(0, 60)}"`);
    } catch (err) {
      failed++;
      console.error(`[NightlyAudit] ❌ ${sectionLabel}: errore sostituzione ID ${id}:`, err);
    }
  }

  console.log(`[NightlyAudit] ✅ ${sectionLabel}: ${replaced} sostituite, ${failed} fallite`);
  return { checked, invalid, replaced, failed };
}

// ─── Funzione principale di audit notturno ────────────────────────────────────

export async function runNightlyAudit(): Promise<void> {
  const startTime = Date.now();
  console.log("[NightlyAudit] 🌙 Avvio audit notturno completo (02:00 CET)...");

  const results = {
    ai: { checked: 0, invalid: 0, replaced: 0, failed: 0 },
    music: { checked: 0, invalid: 0, replaced: 0, failed: 0 },
    startup: { checked: 0, invalid: 0, replaced: 0, failed: 0 },
  };

  // Audit AI
  try {
    results.ai = await auditAndReplaceSection("ai");
  } catch (err) {
    console.error("[NightlyAudit] ❌ Errore audit AI:", err);
  }

  // Pausa 30 secondi tra sezioni per non sovraccaricare
  await new Promise(r => setTimeout(r, 30_000));

  // Audit Music
  try {
    results.music = await auditAndReplaceSection("music");
  } catch (err) {
    console.error("[NightlyAudit] ❌ Errore audit Music:", err);
  }

  await new Promise(r => setTimeout(r, 30_000));

  // Audit Startup
  try {
    results.startup = await auditAndReplaceSection("startup");
  } catch (err) {
    console.error("[NightlyAudit] ❌ Errore audit Startup:", err);
  }

  const elapsed = Math.round((Date.now() - startTime) / 1000);
  const totalInvalid = results.ai.invalid + results.music.invalid + results.startup.invalid;
  const totalReplaced = results.ai.replaced + results.music.replaced + results.startup.replaced;
  const totalChecked = results.ai.checked + results.music.checked + results.startup.checked;

  console.log(`[NightlyAudit] ✅ Audit notturno completato in ${elapsed}s`);
  console.log(`[NightlyAudit]   AI:      ${results.ai.checked} verificate, ${results.ai.invalid} non valide, ${results.ai.replaced} sostituite`);
  console.log(`[NightlyAudit]   Music:   ${results.music.checked} verificate, ${results.music.invalid} non valide, ${results.music.replaced} sostituite`);
  console.log(`[NightlyAudit]   Startup: ${results.startup.checked} verificate, ${results.startup.invalid} non valide, ${results.startup.replaced} sostituite`);

  // Notifica owner
  try {
    await notifyOwner({
      title: `🌙 Audit notturno completato — ${new Date().toLocaleDateString("it-IT")}`,
      content: `Audit notturno IDEASMART completato in ${elapsed}s.\n\n` +
        `📊 Riepilogo:\n` +
        `• AI: ${results.ai.checked} verificate, ${results.ai.invalid} non valide → ${results.ai.replaced} sostituite\n` +
        `• Music: ${results.music.checked} verificate, ${results.music.invalid} non valide → ${results.music.replaced} sostituite\n` +
        `• Startup: ${results.startup.checked} verificate, ${results.startup.invalid} non valide → ${results.startup.replaced} sostituite\n\n` +
        `Totale: ${totalChecked} notizie verificate, ${totalInvalid} non valide, ${totalReplaced} sostituite con notizie RSS fresche.`,
    });
  } catch (err) {
    console.warn("[NightlyAudit] Notifica owner fallita (non critico):", err);
  }
}
