/**
 * IDEASMART Research Generator
 * Ogni giorno genera 10 ricerche su Startup, Venture Capital e AI Trends
 * attingendo da fonti specializzate come Gartner, CB Insights, Statista.
 */
import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { researchReports } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

// ── Fonti specializzate ──────────────────────────────────────────────────────
const RESEARCH_SOURCES = [
  "Gartner",
  "CB Insights",
  "Statista",
  "McKinsey Global Institute",
  "Dealroom",
  "PitchBook",
  "Crunchbase",
  "KPMG Venture Pulse",
  "EY Startup Barometer",
  "Atomico State of European Tech",
  "Boston Consulting Group",
  "Sequoia Capital",
  "a16z (Andreessen Horowitz)",
  "World Economic Forum",
  "OECD",
  "European Investment Fund",
  "Bain & Company",
  "Forrester Research",
  "IDC",
  "Bloomberg Intelligence",
];

// ── Categorie di ricerca ─────────────────────────────────────────────────────
const RESEARCH_CATEGORIES = [
  { id: "startup", label: "Startup & Ecosistemi" },
  { id: "venture_capital", label: "Venture Capital" },
  { id: "ai_trends", label: "AI Trends" },
  { id: "technology", label: "Tecnologia & Innovazione" },
  { id: "market", label: "Mercati & Investimenti" },
];

// ── Regioni ──────────────────────────────────────────────────────────────────
const REGIONS = ["global", "europe", "italy"];

interface ResearchItem {
  title: string;
  summary: string;
  keyFindings: string[];
  source: string;
  sourceUrl?: string;
  category: string;
  region: string;
  isResearchOfDay: boolean;
}

interface LLMResearchResponse {
  researches: ResearchItem[];
}

/**
 * Genera 10 ricerche giornaliere su Startup, VC e AI Trends usando l'AI.
 */
export async function generateDailyResearch(): Promise<{
  generated: number;
  error?: string;
}> {
  const db = await getDb();
  if (!db) return { generated: 0, error: "DB non disponibile" };

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  try {
    // Controlla se le ricerche di oggi sono già state generate
    const existing = await db
      .select({ id: researchReports.id })
      .from(researchReports)
      .where(eq(researchReports.dateLabel, today))
      .limit(1);

    if (existing.length > 0) {
      console.log(`[Research] Ricerche del ${today} già presenti, skip`);
      return { generated: 0 };
    }

    // Genera la data corrente in formato leggibile
    const dateFormatted = new Date().toLocaleDateString("it-IT", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Sei un senior research analyst di IDEASMART, specializzato in Startup, Venture Capital e AI Trends.
Il tuo compito è generare 10 ricerche originali e approfondite per la sezione "IDEASMART Research".

Ogni ricerca deve:
1. Essere basata su dati reali e aggiornati di fonti autorevoli (Gartner, CB Insights, Statista, McKinsey, Dealroom, PitchBook, ecc.)
2. Fornire insight concreti e actionable per investitori, founder e manager
3. Coprire diversi ambiti: startup ecosistemi, VC, AI trends, mercati tecnologici
4. Includere dati numerici, percentuali e trend specifici
5. Essere rilevante per il mercato italiano ed europeo (almeno 3-4 ricerche)
6. Essere scritta in italiano con terminologia tecnica appropriata

La prima ricerca (indice 0) deve essere la "Ricerca del Giorno": la più importante e approfondita, con isResearchOfDay: true.

Fonti disponibili: ${RESEARCH_SOURCES.join(", ")}
Categorie: startup, venture_capital, ai_trends, technology, market
Regioni: global, europe, italy

Genera ricerche diverse ogni giorno — oggi è ${dateFormatted}.`,
        },
        {
          role: "user",
          content: `Genera 10 ricerche originali per IDEASMART Research di oggi (${today}).
Includi una mix di: 3-4 ricerche AI Trends, 3 Venture Capital/Startup, 2 Mercati, 1-2 Tecnologia.
Almeno 3 devono riguardare il mercato europeo o italiano.
La prima deve essere la "Ricerca del Giorno" più importante.`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "research_generation",
          strict: true,
          schema: {
            type: "object",
            properties: {
              researches: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: {
                      type: "string",
                      description: "Titolo della ricerca (max 200 char)",
                    },
                    summary: {
                      type: "string",
                      description: "Sommario della ricerca con dati chiave (max 500 char)",
                    },
                    keyFindings: {
                      type: "array",
                      items: { type: "string" },
                      description: "3-5 key findings numerici e specifici",
                    },
                    source: {
                      type: "string",
                      description: "Nome della fonte principale (es. Gartner, CB Insights)",
                    },
                    sourceUrl: {
                      type: "string",
                      description: "URL della fonte (se disponibile, altrimenti stringa vuota)",
                    },
                    category: {
                      type: "string",
                      enum: ["startup", "venture_capital", "ai_trends", "technology", "market"],
                      description: "Categoria della ricerca",
                    },
                    region: {
                      type: "string",
                      enum: ["global", "europe", "italy"],
                      description: "Regione di riferimento",
                    },
                    isResearchOfDay: {
                      type: "boolean",
                      description: "true solo per la prima ricerca (Ricerca del Giorno)",
                    },
                  },
                  required: [
                    "title",
                    "summary",
                    "keyFindings",
                    "source",
                    "sourceUrl",
                    "category",
                    "region",
                    "isResearchOfDay",
                  ],
                  additionalProperties: false,
                },
              },
            },
            required: ["researches"],
            additionalProperties: false,
          },
        },
      },
    });

    const rawContent = response?.choices?.[0]?.message?.content;
    const content = typeof rawContent === "string" ? rawContent : null;
    if (!content) {
      return { generated: 0, error: "LLM non ha risposto" };
    }

    const parsed: LLMResearchResponse = JSON.parse(content);
    const researches = parsed.researches ?? [];

    if (researches.length === 0) {
      return { generated: 0, error: "Nessuna ricerca generata" };
    }

    // Salva le ricerche nel DB
    let savedCount = 0;
    for (const item of researches.slice(0, 10)) {
      try {
        await db.insert(researchReports).values({
          title: item.title.slice(0, 299),
          summary: item.summary.slice(0, 2000),
          keyFindings: JSON.stringify(item.keyFindings ?? []),
          source: item.source.slice(0, 199),
          sourceUrl: item.sourceUrl?.slice(0, 999) || null,
          category: item.category,
          region: item.region,
          dateLabel: today,
          isResearchOfDay: item.isResearchOfDay === true && savedCount === 0,
          viewCount: 0,
        });
        savedCount++;
      } catch (e) {
        console.error("[Research] Errore salvataggio:", e);
      }
    }

    console.log(`[Research] ✅ Generate e salvate ${savedCount} ricerche per il ${today}`);
    return { generated: savedCount };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[Research] ❌ Errore:", msg);
    return { generated: 0, error: msg };
  }
}

/**
 * Recupera le ricerche di oggi (o dell'ultimo giorno disponibile).
 */
export async function getTodayResearch(): Promise<typeof researchReports.$inferSelect[]> {
  const db = await getDb();
  if (!db) return [];

  const today = new Date().toISOString().split("T")[0];

  // Prima prova oggi
  let results = await db
    .select()
    .from(researchReports)
    .where(eq(researchReports.dateLabel, today))
    .orderBy(researchReports.isResearchOfDay, researchReports.id);

  // Fallback: ieri
  if (results.length === 0) {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    results = await db
      .select()
      .from(researchReports)
      .where(eq(researchReports.dateLabel, yesterday))
      .orderBy(researchReports.isResearchOfDay, researchReports.id);
  }

  return results;
}

/**
 * Recupera la "Ricerca del Giorno".
 */
export async function getResearchOfDay(): Promise<typeof researchReports.$inferSelect | null> {
  const db = await getDb();
  if (!db) return null;

  const today = new Date().toISOString().split("T")[0];

  const results = await db
    .select()
    .from(researchReports)
    .where(
      and(
        eq(researchReports.dateLabel, today),
        eq(researchReports.isResearchOfDay, true)
      )
    )
    .limit(1);

  if (results.length > 0) return results[0];

  // Fallback: prima ricerca di oggi
  const fallback = await db
    .select()
    .from(researchReports)
    .where(eq(researchReports.dateLabel, today))
    .limit(1);

  return fallback[0] ?? null;
}
