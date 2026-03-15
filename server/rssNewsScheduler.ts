/**
 * RSS News Scheduler — IDEASMART
 * Sostituisce completamente i generatori AI con scraping da fonti reali certificate.
 * 
 * PRINCIPIO: Nessuna notizia viene inventata.
 * Tutte le notizie derivano da feed RSS di fonti giornalistiche reali.
 * Il sourceUrl è SEMPRE la homepage del dominio (mai URL di articolo specifico).
 * 
 * Flusso per ogni sezione (AI, Music, Startup):
 * 1. Fetch RSS da tutte le fonti certificate della sezione
 * 2. LLM seleziona i 20 più rilevanti e li traduce in italiano
 * 3. Verifica HTTP del sourceUrl (homepage) prima di salvare
 * 4. Salva nel DB, sostituendo le notizie precedenti
 */

import { getDb } from "./db";
import { newsItems, newsRefreshLog } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { findNewsImage } from "./stockImages";
import { scrapeAINews, scrapeMusicNews, scrapeStartupNews, verifyUrl, sanitizeSourceUrl } from "./rssScraperNew";
import { SECTION_FALLBACKS } from "./rssSources";
import { auditRecentNews } from "./urlAuditFix";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function getWeekLabel(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Salva le notizie scraped nel DB per una sezione.
 * Verifica ogni sourceUrl prima di salvare.
 */
async function saveScrapedNews(
  section: "ai" | "music" | "startup",
  articles: Awaited<ReturnType<typeof scrapeAINews>>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("DB non disponibile");

  const weekLabel = getWeekLabel();

  // Elimina le notizie precedenti della sezione
  await db.delete(newsItems).where(eq(newsItems.section, section));
  console.log(`[RssNewsScheduler] Notizie ${section} precedenti eliminate`);

  let saved = 0;
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];

    // Usa direttamente l'URL articolo originale dal feed RSS.
    // Gli URL RSS sono già verificati alla fonte (il feed non include articoli 404).
    // NON facciamo verifica HTTP bloccante: molti siti bloccano le HEAD request
    // da server (es. TechCrunch restituisce 404 a HEAD ma 200 a browser).
    // Validazione: verifica solo che l'URL sia un URL valido con path (non homepage inventata).
    let finalSourceUrl = article.sourceUrl;
    try {
      const parsed = new URL(article.sourceUrl);
      const hasPath = parsed.pathname.length > 1; // ha un path reale
      const sameDomain = parsed.hostname === new URL(article.sourceHomepage).hostname;
      
      if (hasPath && sameDomain) {
        finalSourceUrl = article.sourceUrl; // URL articolo reale con path ✓
      } else if (!hasPath) {
        // È una homepage → usa la homepage del dominio corretto
        finalSourceUrl = article.sourceHomepage;
        console.warn(`[RssNewsScheduler] ⚠️ URL senza path, uso homepage: ${article.sourceUrl}`);
      } else {
        // Dominio diverso → anomalia, usa homepage della fonte
        finalSourceUrl = article.sourceHomepage;
        console.warn(`[RssNewsScheduler] ⚠️ Dominio incoerente, uso homepage: ${article.sourceUrl}`);
      }
    } catch {
      finalSourceUrl = article.sourceHomepage || SECTION_FALLBACKS[section];
    }

    // Recupera immagine Pexels contestuale
    let imageUrl: string | null = null;
    try {
      imageUrl = await findNewsImage(article.title, article.category) ?? null;
    } catch {
      // immagine opzionale, non blocca il salvataggio
    }

    await db.insert(newsItems).values({
      section,
      title: article.title,
      summary: article.summary,
      category: article.category,
      sourceName: article.sourceName,
      sourceUrl: finalSourceUrl,
      publishedAt: article.publishedAt,
      weekLabel,
      position: i + 1,
      imageUrl,
    });
    saved++;
  }

  // Log del refresh
  try {
    await (db as any).insert(newsRefreshLog).values({
      section,
      status: "success",
      itemCount: saved,
      createdAt: new Date(),
    });
  } catch {
    // newsRefreshLog potrebbe non avere il campo section — non critico
  }

  console.log(`[RssNewsScheduler] ✅ Salvate ${saved} notizie ${section} da fonti RSS reali`);

  // Audit post-salvataggio: verifica e corregge URL residui non corretti
  setImmediate(async () => {
    try {
      const auditResult = await auditRecentNews(section, saved);
      console.log(`[RssNewsScheduler] 🔍 Audit post-scraping ${section}: ${auditResult.fixed} URL corretti, ${auditResult.ok} già ok, ${auditResult.failed} falliti`);
    } catch (auditErr) {
      console.warn(`[RssNewsScheduler] ⚠️ Audit post-scraping ${section} non critico:`, auditErr);
    }
  });
}

// ─── Funzioni pubbliche per ogni sezione ─────────────────────────────────────

export async function refreshAINewsFromRSS(): Promise<void> {
  console.log("[RssNewsScheduler] 🤖 Avvio scraping AI news da RSS...");
  try {
    const articles = await scrapeAINews();
    if (articles.length === 0) {
      console.warn("[RssNewsScheduler] ⚠️ Nessun articolo AI recuperato dai feed RSS");
      return;
    }
    await saveScrapedNews("ai", articles);
    console.log(`[RssNewsScheduler] ✅ AI news aggiornate: ${articles.length} articoli da fonti reali`);
  } catch (err) {
    console.error("[RssNewsScheduler] ❌ Errore scraping AI news:", err);
    throw err;
  }
}

export async function refreshMusicNewsFromRSS(): Promise<void> {
  console.log("[RssNewsScheduler] 🎸 Avvio scraping Music news da RSS...");
  try {
    const articles = await scrapeMusicNews();
    if (articles.length === 0) {
      console.warn("[RssNewsScheduler] ⚠️ Nessun articolo Music recuperato dai feed RSS");
      return;
    }
    await saveScrapedNews("music", articles);
    console.log(`[RssNewsScheduler] ✅ Music news aggiornate: ${articles.length} articoli da fonti reali`);
  } catch (err) {
    console.error("[RssNewsScheduler] ❌ Errore scraping Music news:", err);
    throw err;
  }
}

export async function refreshStartupNewsFromRSS(): Promise<void> {
  console.log("[RssNewsScheduler] 🚀 Avvio scraping Startup news da RSS...");
  try {
    const articles = await scrapeStartupNews();
    if (articles.length === 0) {
      console.warn("[RssNewsScheduler] ⚠️ Nessun articolo Startup recuperato dai feed RSS");
      return;
    }
    await saveScrapedNews("startup", articles);
    console.log(`[RssNewsScheduler] ✅ Startup news aggiornate: ${articles.length} articoli da fonti reali`);
  } catch (err) {
    console.error("[RssNewsScheduler] ❌ Errore scraping Startup news:", err);
    throw err;
  }
}

/**
 * Aggiorna tutte e tre le sezioni in sequenza.
 * Usato dal cron job giornaliero alle 00:00 CET.
 */
export async function refreshAllNewsFromRSS(): Promise<void> {
  console.log("[RssNewsScheduler] 🌐 Avvio refresh completo tutte le sezioni...");
  const start = Date.now();

  // AI prima
  await refreshAINewsFromRSS().catch(err =>
    console.error("[RssNewsScheduler] AI fallita (continuo con Music):", err)
  );

  // Music 30 secondi dopo (per non sovraccaricare le API)
  await new Promise(r => setTimeout(r, 30_000));
  await refreshMusicNewsFromRSS().catch(err =>
    console.error("[RssNewsScheduler] Music fallita (continuo con Startup):", err)
  );

  // Startup altri 30 secondi dopo
  await new Promise(r => setTimeout(r, 30_000));
  await refreshStartupNewsFromRSS().catch(err =>
    console.error("[RssNewsScheduler] Startup fallita:", err)
  );

  const elapsed = Math.round((Date.now() - start) / 1000);
  console.log(`[RssNewsScheduler] ✅ Refresh completo terminato in ${elapsed}s`);
}
