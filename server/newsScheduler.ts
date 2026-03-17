/**
 * IDEASMART News Scheduler
 * Aggiorna automaticamente le 20 notizie AI e 20 notizie Music ogni giorno
 * usando l'AI per cercare e selezionare i nuovi eventi più significativi
 */

import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { newsItems, newsRefreshLog } from "../drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { findNewsImage } from "./stockImages";
import { runBatchAudit } from "./auditContent";

// Intervallo: 24 ore in millisecondi
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Categorie editoriali per le news AI
const NEWS_CATEGORIES = [
  "Modelli Generativi",
  "Agenti AI Autonomi",
  "Big Tech",
  "Startup & Funding",
  "AI & Hardware",
  "Robot & AI Fisica",
  "AI & Startup Italiane",
  "Ricerca & Innovazione",
  "AI & Lavoro",
  "AI & Sicurezza",
  "AI & Difesa",
  "Regolamentazione AI",
  "Internazionalizzazione",
  "AI & Salute",
  "AI & Finanza",
];

// Categorie editoriali per le news Music
const MUSIC_CATEGORIES = [
  "Rock & Indie",
  "AI Music",
  "Industria Musicale",
  "Tour & Live",
  "Artisti Emergenti",
  "Streaming & Digital",
  "Vinile & Fisico",
  "Produzione Musicale",
  "Diritti & Copyright",
  "Festival & Concerti",
];

export interface NewsItemData {
  title: string;
  summary: string;
  category: string;
  sourceName: string;
  sourceUrl: string;
  publishedAt: string;
}

function getDayLabel(): string {
  const now = new Date();
  return now.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * Genera 20 notizie AI aggiornate usando l'LLM
 */
export async function generateLatestAINews(): Promise<NewsItemData[]> {
  const dayStr = getDayLabel();

  const prompt = `Sei il redattore capo di IDEASMART, la newsletter italiana di tecnologia e innovazione AI per il business.

Genera esattamente 20 notizie AI reali e verificabili di oggi (${dayStr}).
Le notizie devono riguardare eventi, annunci, ricerche e sviluppi REALI nel mondo dell'intelligenza artificiale.

Per ogni notizia fornisci:
- title: titolo giornalistico incisivo (max 80 caratteri)
- summary: riassunto editoriale (2-3 frasi, max 250 caratteri)
- category: una tra [${NEWS_CATEGORIES.join(", ")}]
- sourceName: nome della fonte (es. "VentureBeat", "TechCrunch", "Il Sole 24 Ore", "MIT Sloan", ecc.)
- sourceUrl: URL homepage del sito sorgente (es. https://techcrunch.com, https://www.wired.com) — NON inventare URL di articoli specifici
- publishedAt: data di pubblicazione in formato YYYY-MM-DD (es. "2026-03-12")

Criteri editoriali:
1. Privilegia notizie con impatto concreto sul business e sull'ecosistema startup
2. Includi almeno 4 notizie sull'ecosistema italiano/europeo
3. Includi almeno 2 notizie su finanziamenti o acquisizioni AI
4. Includi almeno 2 notizie su nuovi modelli o aggiornamenti AI
5. Includi almeno 1 notizia su AI & Salute e 1 su AI & Finanza
6. Includi almeno 1 notizia su regolamentazione AI (EU AI Act, normative)
7. Il tono deve essere editoriale, non promozionale
8. Distribuisci le categorie in modo equilibrato tra le 20 notizie

Rispondi SOLO con un JSON object con chiave "items" contenente l'array.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Sei un redattore AI esperto di tecnologia e innovazione. Rispondi sempre con JSON valido.",
        },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "news_items",
          strict: true,
          schema: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    summary: { type: "string" },
                    category: { type: "string" },
                    sourceName: { type: "string" },
                    sourceUrl: { type: "string" },
                    publishedAt: { type: "string" },
                  },
                  required: ["title", "summary", "category", "sourceName", "sourceUrl", "publishedAt"],
                  additionalProperties: false,
                },
              },
            },
            required: ["items"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content as string;
    const parsed = JSON.parse(content);
    const items: NewsItemData[] = (parsed.items || []).slice(0, 20).map((item: any) => ({
      title: item.title,
      summary: item.summary,
      category: item.category,
      sourceName: item.sourceName,
      sourceUrl: item.sourceUrl,
      publishedAt: item.publishedAt,
    }));

    return items;
  } catch (error) {
    console.error("[NewsScheduler] Error generating AI news:", error);
    throw error;
  }
}

/**
 * Genera 20 notizie ITsMusic aggiornate usando l'LLM
 */
export async function generateLatestMusicNews(): Promise<NewsItemData[]> {
  const dayStr = getDayLabel();

  const prompt = `Sei il redattore capo di ITsMusic, il canale musicale di IDEASMART dedicato a rock, indie e industria musicale italiana e internazionale.

Genera esattamente 20 notizie musicali reali e verificabili di oggi (${dayStr}).
Le notizie devono riguardare eventi, annunci, uscite discografiche e sviluppi REALI nel mondo della musica.

Per ogni notizia fornisci:
- title: titolo giornalistico incisivo (max 80 caratteri)
- summary: riassunto editoriale (2-3 frasi, max 250 caratteri)
- category: una tra [${MUSIC_CATEGORIES.join(", ")}]
- sourceName: nome della fonte (es. "Rolling Stone", "Billboard", "NME", "Rockol", "Il Manifesto", ecc.)
- sourceUrl: URL homepage del sito sorgente (es. https://techcrunch.com, https://www.wired.com) — NON inventare URL di articoli specifici
- publishedAt: data di pubblicazione in formato YYYY-MM-DD

Criteri editoriali:
1. Includi almeno 4 notizie su artisti italiani (Maneskin, Calcutta, Gazzelle, Salmo, Cosmo, Frah Quintale, Subsonica, ecc.)
2. Includi almeno 2 notizie su AI e musica (generazione musicale, diritti, Suno, Udio, ecc.)
3. Includi almeno 2 notizie su tour e concerti
4. Includi almeno 1 notizia su vinile e mercato fisico
5. Includi almeno 1 notizia su streaming e piattaforme (Spotify, Apple Music, ecc.)
6. Il tono deve essere editoriale, appassionato ma professionale
7. Distribuisci le categorie in modo equilibrato

Rispondi SOLO con un JSON object con chiave "items" contenente l'array.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Sei un giornalista musicale esperto di rock, indie e industria musicale. Rispondi sempre con JSON valido.",
        },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "music_news_items",
          strict: true,
          schema: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    summary: { type: "string" },
                    category: { type: "string" },
                    sourceName: { type: "string" },
                    sourceUrl: { type: "string" },
                    publishedAt: { type: "string" },
                  },
                  required: ["title", "summary", "category", "sourceName", "sourceUrl", "publishedAt"],
                  additionalProperties: false,
                },
              },
            },
            required: ["items"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content as string;
    const parsed = JSON.parse(content);
    const items: NewsItemData[] = (parsed.items || []).slice(0, 20).map((item: any) => ({
      title: item.title,
      summary: item.summary,
      category: item.category,
      sourceName: item.sourceName,
      sourceUrl: item.sourceUrl,
      publishedAt: item.publishedAt,
    }));

    return items;
  } catch (error) {
    console.error("[NewsScheduler] Error generating music news:", error);
    throw error;
  }
}

/**
 * Salva le notizie AI nel database (sostituisce SOLO le notizie AI, non tocca Music)
 */
export async function saveNewsToDb(items: NewsItemData[]): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[NewsScheduler] Database not available");
    return;
  }

  const dayLabel = getDayLabel();

  try {
    // Cancella solo le notizie AI precedenti (non tocca Music)
    await db.delete(newsItems).where(eq(newsItems.section, 'ai'));

    // Inserisce le nuove notizie AI con immagini Pexels
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const imageUrl = await findNewsImage(item.title, item.category);
      if (imageUrl) {
        console.log(`[NewsScheduler] Stock image found for AI news ${i + 1}: ${item.title.slice(0, 40)}...`);
      }
      await db.insert(newsItems).values({
        section: 'ai',
        title: item.title,
        summary: item.summary,
        category: item.category,
        sourceName: item.sourceName,
        sourceUrl: item.sourceUrl,
        publishedAt: item.publishedAt,
        weekLabel: dayLabel,
        position: i + 1,
        imageUrl: imageUrl ?? null,
      });
    }

    // Registra il refresh con successo
    await db.insert(newsRefreshLog).values({
      weekLabel: dayLabel,
      itemCount: items.length,
      status: "success",
    });

    console.log(`[NewsScheduler] Saved ${items.length} AI news items to DB (${dayLabel})`);

    // Audit automatico in background
    setImmediate(async () => {
      try {
        console.log(`[NewsScheduler] Starting automatic content audit for ${Math.min(items.length, 20)} AI news items...`);
        const auditResults = await runBatchAudit({ section: 'ai', contentType: 'news', limit: Math.min(items.length, 20) });
        console.log(`[NewsScheduler] Audit completed: OK=${auditResults.ok}, Warning=${auditResults.warning}, Error=${auditResults.error}, Unreachable=${auditResults.unreachable}`);
        if (auditResults.error > 0 || auditResults.warning > 2) {
          console.warn(`[NewsScheduler] ⚠ Audit alert: ${auditResults.error} notizie non coerenti, ${auditResults.warning} parziali. Verifica /admin/audit`);
        }
      } catch (auditErr) {
        console.warn('[NewsScheduler] Audit post-inserimento fallito (non critico):', auditErr);
      }
    });

  } catch (error) {
    console.error("[NewsScheduler] Error saving AI news to DB:", error);

    try {
      const db2 = await getDb();
      if (db2) {
        await db2.insert(newsRefreshLog).values({
          weekLabel: dayLabel,
          itemCount: 0,
          status: "failed",
          error: String(error),
        });
      }
    } catch {}

    throw error;
  }
}

/**
 * Salva le notizie Music nel database (sostituisce SOLO le notizie Music, non tocca AI)
 */
export async function saveMusicNewsToDb(items: NewsItemData[]): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[NewsScheduler] Database not available");
    return;
  }

  const dayLabel = getDayLabel();

  try {
    // Cancella solo le notizie Music precedenti (non tocca AI)
    await db.delete(newsItems).where(eq(newsItems.section, 'music'));

    // Inserisce le nuove notizie Music con immagini Pexels
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const imageUrl = await findNewsImage(item.title, item.category);
      if (imageUrl) {
        console.log(`[NewsScheduler] Stock image found for Music news ${i + 1}: ${item.title.slice(0, 40)}...`);
      }
      await db.insert(newsItems).values({
        section: 'music',
        title: item.title,
        summary: item.summary,
        category: item.category,
        sourceName: item.sourceName,
        sourceUrl: item.sourceUrl,
        publishedAt: item.publishedAt,
        weekLabel: dayLabel,
        position: i + 1,
        imageUrl: imageUrl ?? null,
      });
    }

    console.log(`[NewsScheduler] Saved ${items.length} Music news items to DB (${dayLabel})`);

    // Audit automatico Music in background
    setImmediate(async () => {
      try {
        const auditResults = await runBatchAudit({ section: 'music', contentType: 'news', limit: Math.min(items.length, 20) });
        console.log(`[NewsScheduler] Music audit: OK=${auditResults.ok}, Warning=${auditResults.warning}, Error=${auditResults.error}`);
      } catch (auditErr) {
        console.warn('[NewsScheduler] Music audit post-inserimento fallito (non critico):', auditErr);
      }
    });

  } catch (error) {
    console.error("[NewsScheduler] Error saving Music news to DB:", error);
    throw error;
  }
}

/**
 * Recupera le notizie dal DB (usato dal frontend via tRPC)
 */
export async function getNewsFromDb(): Promise<NewsItemData[]> {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select()
    .from(newsItems)
    .orderBy(newsItems.position);

  return rows.map(row => ({
    title: row.title,
    summary: row.summary,
    category: row.category,
    sourceName: row.sourceName || "",
    sourceUrl: row.sourceUrl || "#",
    publishedAt: row.publishedAt || new Date().toISOString().split("T")[0],
  }));
}

/**
 * Controlla se le notizie AI devono essere aggiornate (ogni 24 ore)
 */
export async function shouldRefreshNews(): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  // Controlla quante notizie AI ci sono nel DB
  const existing = await db.select().from(newsItems).where(eq(newsItems.section, 'ai')).limit(1);
  if (existing.length === 0) return true;

  // Controlla l'ultimo refresh con successo
  const lastRefresh = await db
    .select()
    .from(newsRefreshLog)
    .where(eq(newsRefreshLog.status, "success"))
    .orderBy(desc(newsRefreshLog.createdAt))
    .limit(1);

  if (lastRefresh.length === 0) return true;

  const lastRefreshTime = lastRefresh[0].createdAt?.getTime() || 0;
  const now = Date.now();

  return (now - lastRefreshTime) > ONE_DAY_MS;
}

/**
 * Controlla se le notizie Music devono essere aggiornate (ogni 24 ore)
 */
export async function shouldRefreshMusicNews(): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const existing = await db.select().from(newsItems).where(eq(newsItems.section, 'music')).limit(1);
  if (existing.length === 0) return true;

  // Usa lo stesso timestamp dell'ultimo refresh generale come riferimento
  const lastRefresh = await db
    .select()
    .from(newsRefreshLog)
    .where(eq(newsRefreshLog.status, "success"))
    .orderBy(desc(newsRefreshLog.createdAt))
    .limit(1);

  if (lastRefresh.length === 0) return true;

  const lastRefreshTime = lastRefresh[0].createdAt?.getTime() || 0;
  const now = Date.now();

  return (now - lastRefreshTime) > ONE_DAY_MS;
}

/**
 * Esegue il refresh delle notizie AI se necessario
 */
export async function refreshNewsIfNeeded(): Promise<void> {
  try {
    const needed = await shouldRefreshNews();
    if (!needed) {
      console.log("[NewsScheduler] AI news are up to date, skipping refresh");
      return;
    }

    console.log("[NewsScheduler] Refreshing AI news...");
    const items = await generateLatestAINews();
    await saveNewsToDb(items);
    console.log("[NewsScheduler] AI news refreshed successfully");
  } catch (error) {
    console.error("[NewsScheduler] AI refresh failed:", error);
  }
}

/**
 * Esegue il refresh delle notizie Music se necessario
 */
export async function refreshMusicNewsIfNeeded(): Promise<void> {
  try {
    const needed = await shouldRefreshMusicNews();
    if (!needed) {
      console.log("[NewsScheduler] Music news are up to date, skipping refresh");
      return;
    }

    console.log("[NewsScheduler] Refreshing Music news...");
    const items = await generateLatestMusicNews();
    await saveMusicNewsToDb(items);
    console.log("[NewsScheduler] Music news refreshed successfully");
  } catch (error) {
    console.error("[NewsScheduler] Music refresh failed:", error);
  }
}

/**
 * Avvia il cron job giornaliero per AI e Music
 * - Controlla ogni 6 ore se è necessario aggiornare
 * - Aggiorna solo se sono passate 24 ore dall'ultimo refresh
 */
export function startNewsScheduler(): void {
  // Esegui subito al primo avvio (se necessario) — AI prima, Music 2 minuti dopo
  setTimeout(() => {
    refreshNewsIfNeeded().catch(console.error);
  }, 5000); // 5 secondi dopo l'avvio

  setTimeout(() => {
    refreshMusicNewsIfNeeded().catch(console.error);
  }, 2 * 60 * 1000); // 2 minuti dopo l'avvio (per non sovraccaricare il server)

  // Poi controlla ogni 6 ore
  const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
  setInterval(() => {
    refreshNewsIfNeeded().catch(console.error);
  }, SIX_HOURS_MS);

  setInterval(() => {
    refreshMusicNewsIfNeeded().catch(console.error);
  }, SIX_HOURS_MS + 5 * 60 * 1000); // Sfasato di 5 minuti rispetto all'AI

  console.log("[NewsScheduler] Started — AI + Music, checks every 6h, refreshes every 24h");
}
