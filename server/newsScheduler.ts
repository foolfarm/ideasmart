/**
 * IDEASMART News Scheduler
 * Aggiorna automaticamente le 20 notizie AI ogni giorno
 * usando l'AI per cercare e selezionare i nuovi eventi più significativi
 */

import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { newsItems, newsRefreshLog } from "../drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { genImageForNews } from "./imageAutoGen";

// Intervallo: 24 ore in millisecondi
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Categorie editoriali per le news
const NEWS_CATEGORIES = [
  "Modelli Generativi",
  "AI Agentiva",
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
- sourceUrl: URL reale e verificabile dell'articolo originale
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
    console.error("[NewsScheduler] Error generating news:", error);
    throw error;
  }
}

/**
 * Salva le notizie nel database e registra il refresh
 */
export async function saveNewsToDb(items: NewsItemData[]): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[NewsScheduler] Database not available");
    return;
  }

  const dayLabel = getDayLabel();

  try {
    // Cancella le notizie precedenti
    await db.delete(newsItems);

    // Inserisce le nuove notizie con generazione immagine AI automatica
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      // Genera immagine AI in parallelo (non blocca se fallisce)
      const imageUrl = await genImageForNews(item.title, item.category);
      if (imageUrl) {
        console.log(`[NewsScheduler] Image generated for news ${i + 1}: ${item.title.slice(0, 40)}...`);
      }
      await db.insert(newsItems).values({
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

    console.log(`[NewsScheduler] Saved ${items.length} news items to DB (${dayLabel})`);
  } catch (error) {
    console.error("[NewsScheduler] Error saving news to DB:", error);

    // Registra il fallimento
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
 * Controlla se le notizie devono essere aggiornate (ogni 24 ore)
 */
export async function shouldRefreshNews(): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  // Controlla quante notizie ci sono nel DB
  const existing = await db.select().from(newsItems).limit(1);
  if (existing.length === 0) return true; // Nessuna notizia: aggiorna subito

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
 * Esegue il refresh delle notizie se necessario
 */
export async function refreshNewsIfNeeded(): Promise<void> {
  try {
    const needed = await shouldRefreshNews();
    if (!needed) {
      console.log("[NewsScheduler] News are up to date, skipping refresh");
      return;
    }

    console.log("[NewsScheduler] Refreshing news...");
    const items = await generateLatestAINews();
    await saveNewsToDb(items);
    console.log("[NewsScheduler] News refreshed successfully");
  } catch (error) {
    console.error("[NewsScheduler] Refresh failed:", error);
  }
}

/**
 * Avvia il cron job giornaliero
 * - Controlla ogni 6 ore se è necessario aggiornare
 * - Aggiorna solo se sono passate 24 ore dall'ultimo refresh
 */
export function startNewsScheduler(): void {
  // Esegui subito al primo avvio (se necessario)
  setTimeout(() => {
    refreshNewsIfNeeded().catch(console.error);
  }, 5000); // Attendi 5 secondi dopo l'avvio del server

  // Poi controlla ogni 6 ore
  const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
  setInterval(() => {
    refreshNewsIfNeeded().catch(console.error);
  }, SIX_HOURS_MS);

  console.log("[NewsScheduler] Started — checks every 6h, refreshes every 24h");
}
