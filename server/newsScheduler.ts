/**
 * Proof Press News Scheduler
 * Aggiorna automaticamente le 20 notizie AI ogni giorno
 * usando l'AI per cercare e selezionare i nuovi eventi più significativi
 */

import { invokeLLM, stripJsonBackticks } from "./_core/llm";
import { getDb } from "./db";
import { newsItems, newsRefreshLog } from "../drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { findNewsImage } from "./stockImages";
import { runBatchAudit } from "./auditContent";
import { generateVerifyHash } from "./verify";
import { computeTrustGrade, upgradeTrustGradeAfterIpfs } from "./trustScore";

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
  "AI & Finanza"
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
  "Festival & Concerti"
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

  const prompt = `Sei il redattore capo di Proof Press, la newsletter italiana di tecnologia e innovazione AI per il business.

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
          content: "Sei un redattore AI esperto di tecnologia e innovazione. Rispondi sempre con JSON valido."
        },
        { role: "user", content: prompt }
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
                    publishedAt: { type: "string" }
                  },
                  required: ["title", "summary", "category", "sourceName", "sourceUrl", "publishedAt"],
                  additionalProperties: false
                }
              }
            },
            required: ["items"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content as string;
    const parsed = JSON.parse(stripJsonBackticks(content));
    const items: NewsItemData[] = (parsed.items || []).slice(0, 20).map((item: any) => ({
      title: item.title,
      summary: item.summary,
      category: item.category,
      sourceName: item.sourceName,
      sourceUrl: item.sourceUrl,
      publishedAt: item.publishedAt
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
      const verifyHash = generateVerifyHash(item.title, item.summary, item.sourceUrl, new Date());
      // Trust Score calcolato al momento dell'insert (ipfsCid non ancora disponibile → aggiornato dopo IPFS pin)
      const trustResult = computeTrustGrade({ verifyHash, ipfsCid: null, sourceName: item.sourceName, sourceUrl: item.sourceUrl, summary: item.summary });
      const [insertedAI] = await db.insert(newsItems).values({
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
        verifyHash,
        trustScore: trustResult.score / 100,
        trustGrade: trustResult.grade,
      }).$returningId();

      // Pinning automatico su IPFS via Pinata — asincrono, non blocca il flusso
      setImmediate(async () => {
        try {
          const { pinVerificationReport } = await import('./pinata.js');
          const { cid, ipfsUrl } = await pinVerificationReport({
            verifyHash,
            article: {
              id: insertedAI.id,
              title: item.title,
              summary: item.summary,
              section: 'ai',
              sourceName: item.sourceName,
              sourceUrl: item.sourceUrl,
              publishedAt: item.publishedAt,
              category: item.category,
              weekLabel: dayLabel,
            },
          });
          // Upgrade Trust Score: ora che IPFS è disponibile, ricalcola (B → A se tutti i criteri soddisfatti)
          const upgraded = upgradeTrustGradeAfterIpfs({
            verifyHash,
            ipfsCid: cid,
            sourceName: item.sourceName,
            sourceUrl: item.sourceUrl,
            summary: item.summary,
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
            .where(eq(newsItems.id, insertedAI.id));
          console.log(`[NewsScheduler] ⛓ IPFS pinned + Trust upgraded ${trustResult.grade}→${upgraded.grade}: ${item.title.substring(0, 50)} → ${cid.substring(0, 20)}…`);
        } catch (pinErr) {
          console.warn(`[NewsScheduler] ⚠️ IPFS pin fallito (non critico):`, pinErr);
        }
      });
    }

    // Registra il refresh con successo
    await db.insert(newsRefreshLog).values({
      weekLabel: dayLabel,
      itemCount: items.length,
      status: "success"
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
          error: String(error)
        });
      }
    } catch {}

    throw error;
  }
}

/**
 * Salva le notizie Music nel database (sostituisce SOLO le notizie Music, non tocca AI)
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
    publishedAt: row.publishedAt || new Date().toISOString().split("T")[0]
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

export function startNewsScheduler(): void {
  // Scheduler disabilitato - le news vengono aggiornate via RSS scraper
  console.log("[NewsScheduler] AI news scheduler registrato (gestito da schedulerManager)");
}
