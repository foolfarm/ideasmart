/**
 * Breaking News Generator
 * Ogni ora analizza le ultime 100 notizie da tutti i canali e seleziona
 * le 3-5 più urgenti/straordinarie usando l'AI.
 * Le breaking news vengono archiviate dopo 6 ore (isActive = false).
 */
import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { newsItems as newsItemsTable, breakingNews as breakingNewsTable } from "../drizzle/schema";
import { desc, eq, gte, and } from "drizzle-orm";

// ── Tipi ────────────────────────────────────────────────────────────────────

interface BreakingCandidate {
  id: number;
  title: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  section: string;
  publishedAt: string;
}

interface BreakingSelection {
  newsItemId: number;
  title: string;
  summary: string;
  breakingReason: string;
  urgencyScore: number;
}

interface LLMBreakingResponse {
  breaking: BreakingSelection[];
}

// ── Funzione principale ──────────────────────────────────────────────────────

/**
 * Seleziona le breaking news dalle ultime notizie usando l'AI.
 * Archivia le breaking precedenti (> 6 ore) e salva le nuove.
 */
export async function generateBreakingNews(): Promise<{
  selected: number;
  archived: number;
  error?: string;
}> {
  const db = await getDb();
  if (!db) return { selected: 0, archived: 0, error: "DB non disponibile" };

  try {
    // 1. Archivia le breaking news più vecchie di 6 ore
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    let archived = 0;
    try {
      const oldBreaking = await db
        .select({ id: breakingNewsTable.id, createdAt: breakingNewsTable.createdAt })
        .from(breakingNewsTable)
        .where(eq(breakingNewsTable.isActive, true));
      // Archivia SOLO quelle create più di 6 ore fa
      for (const item of oldBreaking) {
        if (item.createdAt < sixHoursAgo) {
          await db
            .update(breakingNewsTable)
            .set({ isActive: false })
            .where(eq(breakingNewsTable.id, item.id));
          archived++;
        }
      }
    } catch {
      // Non critico
    }

    // 2. Prendi le ultime 100 notizie da tutti i canali (ultime 2 ore)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    let candidates: BreakingCandidate[] = await db
      .select({
        id: newsItemsTable.id,
        title: newsItemsTable.title,
        summary: newsItemsTable.summary,
        sourceUrl: newsItemsTable.sourceUrl,
        sourceName: newsItemsTable.sourceName,
        section: newsItemsTable.section,
        publishedAt: newsItemsTable.publishedAt
      })
      .from(newsItemsTable)
      .where(gte(newsItemsTable.createdAt, twoHoursAgo))
      .orderBy(desc(newsItemsTable.createdAt))
      .limit(100) as BreakingCandidate[];

    // Fallback 1: se ci sono meno di 20 notizie nelle ultime 2 ore, prendi le ultime 6 ore
    if (candidates.length < 20) {
      const sixHoursAgoFallback = new Date(Date.now() - 6 * 60 * 60 * 1000);
      candidates = await db
        .select({
          id: newsItemsTable.id,
          title: newsItemsTable.title,
          summary: newsItemsTable.summary,
          sourceUrl: newsItemsTable.sourceUrl,
          sourceName: newsItemsTable.sourceName,
          section: newsItemsTable.section,
          publishedAt: newsItemsTable.publishedAt
        })
        .from(newsItemsTable)
        .where(gte(newsItemsTable.createdAt, sixHoursAgoFallback))
        .orderBy(desc(newsItemsTable.createdAt))
        .limit(100) as BreakingCandidate[];
    }
    // Fallback 2: se ancora meno di 10, prendi le ultime 24 ore
    if (candidates.length < 10) {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      candidates = await db
        .select({
          id: newsItemsTable.id,
          title: newsItemsTable.title,
          summary: newsItemsTable.summary,
          sourceUrl: newsItemsTable.sourceUrl,
          sourceName: newsItemsTable.sourceName,
          section: newsItemsTable.section,
          publishedAt: newsItemsTable.publishedAt
        })
        .from(newsItemsTable)
        .where(gte(newsItemsTable.createdAt, twentyFourHoursAgo))
        .orderBy(desc(newsItemsTable.createdAt))
        .limit(100) as BreakingCandidate[];
    }

    if (candidates.length === 0) {
      console.log("[BreakingNews] Nessuna notizia recente trovata");
      return { selected: 0, archived };
    }

    // 3. Verifica se ci sono già breaking news attive recenti (ultime 50 min)
    // per evitare di rigenerare troppo spesso
    const fiftyMinAgo = new Date(Date.now() - 50 * 60 * 1000);
    const recentBreaking = await db
      .select({ id: breakingNewsTable.id })
      .from(breakingNewsTable)
      .where(
        and(
          eq(breakingNewsTable.isActive, true),
          gte(breakingNewsTable.createdAt, fiftyMinAgo)
        )
      )
      .limit(1);

    if (recentBreaking.length > 0) {
      console.log("[BreakingNews] Breaking news recenti già presenti, skip");
      return { selected: 0, archived };
    }

    // 4. Chiedi all'AI di selezionare le breaking news
    const newsText = candidates
      .map(
        (n, i) =>
          `[${i + 1}] ID:${n.id} | SEZIONE:${n.section} | FONTE:${n.sourceName ?? "N/D"}\nTITOLO: ${n.title}\nSOMMARIO: ${n.summary?.slice(0, 200) ?? ""}`
      )
      .join("\n\n---\n\n");

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Sei il caporedattore di Proof Press, la prima testata giornalistica AI italiana. 
Il tuo compito è identificare le notizie BREAKING NEWS dalle ultime notizie pubblicate.

Una BREAKING NEWS deve soddisfare ALMENO UNO di questi criteri:
- Evento improvviso e inaspettato di portata nazionale o internazionale
- Decisione politica/economica/tecnologica di grande impatto immediato
- Catastrofe naturale, incidente grave, attentato
- Annuncio straordinario di un'azienda tech/AI di primo piano (acquisizione miliardaria, lancio rivoluzionario, nuovo modello AI importante)
- Crollo o rally significativo di mercati finanziari (>2%)
- Scoperta scientifica o medica rilevante
- Evento economico di grande rilievo (acquisizione, IPO, round di investimento)
- Notizia di forte impatto sull'ecosistema startup, VC o AI italiano/europeo
- Trend o sviluppo tecnologico di rilievo che sta cambiando il mercato
- Lancio di prodotto o servizio significativo nel mondo tech/AI/startup

NON sono breaking news:
- Notizie di routine senza impatto significativo
- Gossip o notizie di entertainment a basso impatto

Seleziona le 3-5 notizie più rilevanti e di impatto. Se le notizie disponibili sono di routine, scegli comunque le più interessanti e significative tra quelle presenti.
Massimo 5 breaking news, ordinate per urgenza/rilevanza decrescente.`
        },
        {
          role: "user",
          content: `Analizza queste ${candidates.length} notizie recenti e seleziona le BREAKING NEWS:\n\n${newsText}\n\nRestituisci SOLO le notizie che meritano il badge BREAKING NEWS.`
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "breaking_news_selection",
          strict: true,
          schema: {
            type: "object",
            properties: {
              breaking: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    newsItemId: {
                      type: "integer",
                      description: "ID della notizia (campo ID: nel testo)"
                    },
                    title: {
                      type: "string",
                      description:
                        "Titolo riformulato per enfatizzare l'urgenza (max 120 char)"
                    },
                    summary: {
                      type: "string",
                      description:
                        "Sommario breaking: 1-2 frasi che spiegano perché è urgente (max 250 char)"
                    },
                    breakingReason: {
                      type: "string",
                      description:
                        "Motivo breve per cui è breaking (max 100 char)"
                    },
                    urgencyScore: {
                      type: "integer",
                      description: "Punteggio urgenza 1-10 (10 = massima)"
                    }
                  },
                  required: [
                    "newsItemId",
                    "title",
                    "summary",
                    "breakingReason",
                    "urgencyScore"
                  ],
                  additionalProperties: false
                }
              }
            },
            required: ["breaking"],
            additionalProperties: false
          }
        }
      }
    });

    const rawContent = response?.choices?.[0]?.message?.content;
    const content = typeof rawContent === 'string' ? rawContent : null;
    if (!content) {
      return { selected: 0, archived, error: "LLM non ha risposto" };
    }

    const parsed: LLMBreakingResponse = JSON.parse(content);
    const selected = parsed.breaking ?? [];

    if (selected.length === 0) {
      console.log("[BreakingNews] Nessuna breaking news selezionata dall'AI");
      return { selected: 0, archived };
    }

    // 5. Salva le breaking news nel DB
    let savedCount = 0;
    for (const item of selected) {
      // Trova l'articolo originale per recuperare section e sourceUrl
      const original = candidates.find((c) => c.id === item.newsItemId);
      if (!original) continue;

      try {
        await db.insert(breakingNewsTable).values({
          title: item.title.slice(0, 499),
          summary: item.summary.slice(0, 999),
          sourceUrl: original.sourceUrl ?? "#",
          sourceName: original.sourceName ?? "Proof Press",
          section: original.section as any,
          urgencyScore: Math.min(10, Math.max(1, item.urgencyScore)),
          breakingReason: item.breakingReason?.slice(0, 499),
          publishedAt: original.publishedAt ?? "",
          isActive: true,
          newsItemId: item.newsItemId
        });
        savedCount++;
      } catch (e) {
        console.error("[BreakingNews] Errore salvataggio:", e);
      }
    }

    console.log(
      `[BreakingNews] ✅ Selezionate e salvate ${savedCount} breaking news (archiviate ${archived} vecchie)`
    );
    return { selected: savedCount, archived };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[BreakingNews] ❌ Errore:", msg);
    return { selected: 0, archived: 0, error: msg };
  }
}

/**
 * Recupera le breaking news attive correnti (max 5, ordinate per urgenza)
 */
export async function getActiveBreakingNews() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(breakingNewsTable)
    .where(eq(breakingNewsTable.isActive, true))
    .orderBy(desc(breakingNewsTable.urgencyScore), desc(breakingNewsTable.createdAt))
    .limit(5);
}
