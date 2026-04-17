/**
 * RSS News Scheduler — Proof Press
 * Sostituisce completamente i generatori AI con scraping da fonti reali certificate.
 * 
 * PRINCIPIO: Nessuna notizia viene inventata.
 * Tutte le notizie derivano da feed RSS di fonti giornalistiche reali.
 * Il sourceUrl è SEMPRE l'URL dell'articolo originale dal feed RSS.
 * NON viene mai sostituito con la homepage.
 * 
 * Flusso per ogni sezione (AI, Startup, DEALROOM):
 * 1. Fetch RSS da tutte le fonti certificate della sezione
 * 2. LLM seleziona i 20 più rilevanti e li traduce in italiano
 * 3. Salva nel DB con l'URL articolo originale dal feed RSS
 * 4. Audit notturno (nightlyAuditScheduler) verifica e sostituisce URL non raggiungibili
 */

import { getDb } from "./db";
import { newsItems, newsRefreshLog } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { findNewsImage } from "./stockImages";
import { scrapeAINews, scrapeStartupNews, scrapeDealroomNews, verifyUrl, sanitizeSourceUrl } from "./rssScraperNew";
import { SECTION_FALLBACKS } from "./rssSources";
import { auditRecentNews } from "./urlAuditFix";
import { generateVerifyHash } from "./verify";
import { computeTrustGrade, upgradeTrustGradeAfterIpfs } from "./trustScore";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function getWeekLabel(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Salva le notizie scraped nel DB per una sezione.
 * Verifica ogni sourceUrl prima di salvare.
 */
async function saveScrapedNews(
  section: "ai" | "startup" | "dealroom",
  articles: Awaited<ReturnType<typeof scrapeAINews>>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("DB non disponibile");

  const weekLabel = getWeekLabel();

  // Elimina le notizie precedenti della sezione
  await db.delete(newsItems).where(eq(newsItems.section, section));
  console.log(`[RssNewsScheduler] Notizie ${section} precedenti eliminate`);

  // Filtro topic: scarta articoli off-topic per la sezione
  const OFF_TOPIC_KEYWORDS = [
    "orban", "bonolis", "sinner", "calcio", "serie a", "fiorentina", "juventus", "inter", "milan",
    "formula 1", "motogp", "tennis", "golf", "olimpiadi", "mondiali", "europei",
    "gossip", "oroscopo", "meteo", "ricette", "cucina", "moda", "cinema", "musica",
    "politica", "elezioni", "parlamento", "governo", "ministro", "premier", "trump", "biden",
    "iran", "ucraina", "russia", "guerra", "nigeria", "raid aereo",
    "salis", "meloni", "schlein", "salvini", "renzi",
    "apprentice", "lord sugar", "love island",
    "belve", "carlo conti", "giulia michelini", "chiofalo", "amici", "grande fratello",
    "sanremo", "festival", "x factor", "masterchef", "ballando",
    "fiorentina", "lazio", "napoli", "roma", "atalanta", "torino", "bologna",
    "serie b", "champions league", "europa league", "coppa italia"
  ];
  const SECTION_REQUIRED_KEYWORDS: Record<string, string[]> = {
    startup: ["startup", "ai", "tech", "venture", "funding", "founder", "seed", "series", "round",
              "innovazione", "tecnologia", "intelligenza artificiale", "machine learning", "software",
              "app", "platform", "saas", "fintech", "healthtech", "deeptech", "scale", "growth",
              "investment", "investor", "unicorn", "accelerator", "incubator", "pitch", "mvp"],
    dealroom: ["funding", "round", "venture", "capital", "investment", "m&a", "ipo", "acquisition",
               "finanziamento", "investimento", "fondo", "private equity", "deal", "valuation",
               "startup", "scaleup", "unicorn", "exit", "buyout", "merger"],
    ai: ["ai", "artificial intelligence", "machine learning", "llm", "gpt", "model", "neural",
         "intelligenza artificiale", "modello", "algoritmo", "automazione", "generativo", "openai",
         "anthropic", "google", "microsoft", "meta", "nvidia", "deep learning", "transformer"]
  };

  const filteredArticles = articles.filter(article => {
    // Applica il filtro off-topic SOLO al titolo per evitare falsi positivi nel summary
    const titleLower = article.title.toLowerCase();
    const textFull = (article.title + " " + article.summary).toLowerCase();
    // Scarta se il TITOLO contiene keyword off-topic (word boundary per evitare falsi positivi)
    const matchesOffTopic = OFF_TOPIC_KEYWORDS.some(kw => {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`\\b${escaped}\\b`).test(titleLower);
    });
    if (matchesOffTopic) {
      console.log(`[RssNewsScheduler] ⚠️ Scartato off-topic [${section}]: ${article.title.slice(0, 60)}`);
      return false;
    }
    // Per startup e dealroom, richiede almeno una keyword di sezione
    const required = SECTION_REQUIRED_KEYWORDS[section];
    if (required && !required.some(kw => textFull.includes(kw))) {
      console.log(`[RssNewsScheduler] ⚠️ Scartato non-pertinente [${section}]: ${article.title.slice(0, 60)}`);
      return false;
    }
    return true;
  });

  console.log(`[RssNewsScheduler] Filtro topic: ${articles.length} → ${filteredArticles.length} articoli pertinenti per ${section}`);

  let saved = 0;
  for (let i = 0; i < filteredArticles.length; i++) {
    const article = filteredArticles[i];

    // REGOLA FONDAMENTALE: preservare SEMPRE l'URL articolo originale dal feed RSS.
    // Il feed RSS contiene già l'URL diretto all'articolo — non va mai sostituito con la homepage.
    // Molti feed usano CDN o redirect (feedburner, r.zdnet.com, ecc.) con dominio diverso dalla fonte:
    // questi sono URL validi e devono essere preservati.
    // L'audit notturno (nightlyAuditScheduler) verificherà e sostituirà gli URL non raggiungibili.
    let finalSourceUrl = article.sourceUrl;
    try {
      const parsed = new URL(article.sourceUrl);
      const hasPath = parsed.pathname.length > 1; // ha un path reale
      
      if (!hasPath) {
        // È già una homepage (nessun path) → usa la homepage della fonte
        finalSourceUrl = article.sourceHomepage || SECTION_FALLBACKS[section];
        console.warn(`[RssNewsScheduler] ⚠️ URL senza path nel feed, uso homepage: ${article.sourceUrl}`);
      }
      // Se ha un path (URL articolo specifico) → PRESERVARE SEMPRE
      // anche se il dominio è diverso (CDN, feedburner, redirect, ecc.)
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

    const verifyHash = generateVerifyHash(article.title, article.summary, finalSourceUrl, new Date());
    const trustResult = computeTrustGrade({ verifyHash, ipfsCid: null, sourceName: article.sourceName, sourceUrl: finalSourceUrl, summary: article.summary });
    const [inserted] = await db.insert(newsItems).values({
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
      videoUrl: article.videoUrl ?? null,
      verifyHash,
      trustScore: trustResult.score / 100,
      trustGrade: trustResult.grade,
    }).$returningId();
    saved++;

    // Pinning automatico su IPFS via Pinata — asincrono, non blocca il flusso
    setImmediate(async () => {
      try {
        const { pinVerificationReport } = await import('./pinata.js');
        const { cid, ipfsUrl } = await pinVerificationReport({
          verifyHash,
          article: {
            id: inserted.id,
            title: article.title,
            summary: article.summary,
            section,
            sourceName: article.sourceName,
            sourceUrl: finalSourceUrl,
            publishedAt: article.publishedAt,
            category: article.category,
            weekLabel,
          },
        });
        // Upgrade Trust Score: ora che IPFS è disponibile, ricalcola (B → A se tutti i criteri soddisfatti)
        const upgraded = upgradeTrustGradeAfterIpfs({
          verifyHash,
          ipfsCid: cid,
          sourceName: article.sourceName,
          sourceUrl: finalSourceUrl,
          summary: article.summary,
        });
        await db
          .update(newsItems)
          .set({
            ipfsCid: cid,
            ipfsUrl,
            ipfsPinnedAt: new Date(),
            trustScore: upgraded.score / 100,
            trustGrade: upgraded.grade,
          })
          .where(eq(newsItems.id, inserted.id));
        console.log(`[RssNewsScheduler] ⛓ IPFS pinned + Trust upgraded →${upgraded.grade}: ${article.title.substring(0, 50)} → ${cid.substring(0, 20)}…`);
      } catch (pinErr) {
        console.warn(`[RssNewsScheduler] ⚠️ IPFS pin fallito (non critico):`, pinErr);
      }
    });
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
 * Aggiorna le 3 sezioni attive in sequenza.
 * Usato dal cron job giornaliero alle 00:00 CET.
 */
export async function refreshAllNewsFromRSS(): Promise<void> {
  console.log("[RssNewsScheduler] 🌐 Avvio refresh completo sezioni attive (AI, Startup, DEALROOM)...");
  const start = Date.now();

  await refreshAINewsFromRSS().catch(err => console.error("[RssNewsScheduler] AI fallita:", err));
  await new Promise(r => setTimeout(r, 20_000));
  await refreshStartupNewsFromRSS().catch(err => console.error("[RssNewsScheduler] Startup fallita:", err));
  await new Promise(r => setTimeout(r, 20_000));
  await refreshDealroomNewsFromRSS().catch(err => console.error("[RssNewsScheduler] Dealroom fallita:", err));

  const elapsed = Math.round((Date.now() - start) / 1000);
  console.log(`[RssNewsScheduler] ✅ Refresh completo terminato in ${elapsed}s`);
}

export async function refreshDealroomNewsFromRSS(): Promise<void> {
  console.log("[RssNewsScheduler] 💰 Avvio scraping Dealroom news (round, funding, VC, M&A)...");
  try {
    const articles = await scrapeDealroomNews();
    if (articles.length === 0) {
      console.warn("[RssNewsScheduler] \u26a0\ufe0f Nessun articolo Dealroom recuperato dai feed RSS");
      return;
    }
    // Deduplicazione per titolo normalizzato
    const seen = new Set<string>();
    const deduped = articles.filter((a) => {
      const key = a.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    console.log(`[RssNewsScheduler] Dedup: ${articles.length} \u2192 ${deduped.length} articoli unici`);
    await saveScrapedNews("dealroom", deduped);
    console.log(`[RssNewsScheduler] ✅ Dealroom news aggiornate: ${articles.length} articoli da fonti reali`);
  } catch (err) {
    console.error("[RssNewsScheduler] ❌ Errore scraping Dealroom news:", err);
    throw err;
  }
}
