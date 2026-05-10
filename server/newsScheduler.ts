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
// generateVerifyHash e computeTrustGrade rimossi: la certificazione avviene solo via API PPV esterna
import { certifyWithPpv } from "./proofpressVerifyClient";

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
- title: titolo giornalistico incisivo IN ITALIANO (max 80 caratteri) — OBBLIGATORIO in italiano, mai in inglese
- summary: articolo giornalistico completo IN ITALIANO (5-8 frasi, 600-900 caratteri) — OBBLIGATORIO in italiano, mai in inglese
- category: una tra [${NEWS_CATEGORIES.join(", ")}]
- sourceName: nome della fonte (es. "VentureBeat", "TechCrunch", "Il Sole 24 Ore", "MIT Sloan", ecc.)
- sourceUrl: URL homepage del sito sorgente (es. https://techcrunch.com, https://www.wired.com) — NON inventare URL di articoli specifici
- publishedAt: data di pubblicazione in formato YYYY-MM-DD (es. "2026-03-12")

REGOLE FONDAMENTALI PER IL CAMPO summary — STILE GIORNALISTICO PROFESSIONALE:
Scrivi ogni summary come un articolo giornalistico completo, con il tono del Corriere della Sera o del Financial Times. NON descrivere la notizia dall'esterno: RACCONTA il fatto direttamente.

VIETATO iniziare con: "L'articolo", "Questo articolo", "Il pezzo", "Lo studio", "La ricerca", "Il report", "Il documento", "La notizia riguarda".

STRUTTURA OBBLIGATORIA di ogni summary:
1. APERTURA (1-2 frasi): il fatto chiave con soggetto, verbo, numeri concreti.
2. CONTESTO (1-2 frasi): perché questo fatto è rilevante ora, cosa lo ha preceduto.
3. IMPATTO BUSINESS (1-2 frasi): cosa cambia per aziende, investitori, professionisti — con dati o nomi specifici.
4. PROSPETTIVA (1 frase): una domanda aperta, un rischio, un'opportunità o una previsione credibile.

VARIA gli incipit tra questi pattern:
- Soggetto + azione: "OpenAI ha chiuso un round da 40 miliardi...", "Il Parlamento Europeo ha approvato..."
- Dato numerico: "Quaranta miliardi di dollari in un solo round.", "Il 73% dei manager italiani..."
- Contesto di mercato: "Mentre il settore AI attraversa...", "In un mercato che vale già..."
- Paradosso o tensione: "Più potente, ma anche più costoso.", "La promessa è ambiziosa."
- Nome del protagonista: "Elon Musk torna a scommettere su...", "Anthropic ha scelto..."

Criteri editoriali:
1. Privilegia notizie con impatto concreto sul business e sull'ecosistema startup
2. Includi almeno 4 notizie sull'ecosistema italiano/europeo
3. Includi almeno 2 notizie su finanziamenti o acquisizioni AI
4. Includi almeno 2 notizie su nuovi modelli o aggiornamenti AI
5. Includi almeno 1 notizia su AI & Salute e 1 su AI & Finanza
6. Includi almeno 1 notizia su regolamentazione AI (EU AI Act, normative)
7. Il tono deve essere editoriale, non promozionale
8. Distribuisci le categorie in modo equilibrato tra le 20 notizie
9. LINGUA OBBLIGATORIA: tutti i titoli e i summary DEVONO essere in ITALIANO. Non usare mai l'inglese, anche se la fonte è in inglese. Traduci sempre.

Rispondi SOLO con un JSON object con chiave "items" contenente l'array.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Sei un giornalista senior italiano con 20 anni di esperienza al Corriere della Sera e al Financial Times. Scrivi notizie dirette, concrete, con fatti e numeri. Non descrivi mai le notizie dall'esterno: racconti i fatti. Il tuo stile è autorevole, preciso, mai burocratico. Rispondi sempre con JSON valido. IMPORTANTE: tutti i titoli e i summary devono essere scritti in ITALIANO, mai in inglese."
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
      // Nessun hash interno: l'articolo viene inserito senza hash/trust grade.
      // La certificazione avviene in modo asincrono tramite API PPV esterna (proofpressverify.com).
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
        verifyHash: null,
        trustScore: null,
        trustGrade: null,
      }).$returningId();

      // Certificazione ProofPress Verify (API esterna) + Pinning IPFS — asincrono, non blocca il flusso
      setImmediate(async () => {
        try {
          // Step A: Certificazione con ProofPress Verify API esterna
          const ppvResult = await certifyWithPpv({
            title: item.title,
            content: item.summary,
            sourceUrl: item.sourceUrl,
            productType: 'news_verify',
          });

          if (ppvResult) {
            // Aggiorna subito con i dati PPV (hash, IPFS, trust score)
            await db
              .update(newsItems)
              .set({
                verifyHash: ppvResult.hash,
                ipfsCid: ppvResult.ipfs_cid,
                ipfsUrl: ppvResult.ipfs_url,
                ipfsPinnedAt: new Date(),
                trustScore: ppvResult.trust_score,
                trustGrade: ppvResult.trust_grade,
                verifyReport: ppvResult.report as unknown as Record<string, unknown>,
              })
              .where(eq(newsItems.id, insertedAI.id));
            console.log(`[NewsScheduler] ✅ PPV certificato: grade=${ppvResult.trust_grade} score=${ppvResult.trust_score.toFixed(2)} | ${item.title.substring(0, 50)}`);
          } else {
            // PPV non disponibile: l'articolo resta senza hash/certificazione.
            // Nessun fallback interno — solo PPV è autorizzata a certificare.
            console.warn(`[NewsScheduler] ⚠️ PPV non disponibile, articolo senza certificazione: ${item.title.substring(0, 50)}`);
          }
        } catch (certErr) {
          console.warn(`[NewsScheduler] ⚠️ Certificazione fallita (non critico):`, certErr);
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
    // Traduzione automatica EN in background (non blocca il flusso principale)
    setImmediate(async () => {
      try {
        const { translatePendingNewsTitles } = await import('./articleTranslator');
        const result = await translatePendingNewsTitles(30);
        console.log(`[NewsScheduler] 🇬🇧 Traduzione EN: ${result.success} titoli tradotti, ${result.failed} falliti`);
      } catch (transErr) {
        console.warn('[NewsScheduler] Traduzione EN fallita (non critica):', transErr);
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
