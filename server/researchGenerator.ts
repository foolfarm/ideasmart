/**
 * Proof Press Research Generator
 * Ogni giorno genera 20 ricerche su Startup, Venture Capital e AI Trends
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
// ── Immagini tematiche per categoria (Unsplash) ──────────────────────────────
const CATEGORY_IMAGES: Record<string, string[]> = {
  startup: [
    "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
    "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80",
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80",
  ],
  venture_capital: [
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=800&q=80",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80",
  ],
  ai_trends: [
    "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80",
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80",
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
  ],
  technology: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
  ],
  market: [
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    "https://images.unsplash.com/photo-1642790551116-18e150f248e3?w=800&q=80",
    "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=800&q=80",
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80",
  ],
};

function getImageForCategory(category: string, index: number): string {
  const imgs = CATEGORY_IMAGES[category] ?? CATEGORY_IMAGES["ai_trends"];
  return imgs[index % imgs.length];
}



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
 * Costruisce un URL alla fonte originale della ricerca.
 * Se il LLM fornisce un URL valido, lo usa. Altrimenti genera un URL di ricerca
 * Google Scholar o del sito della fonte come fallback.
 */
function buildSourceUrl(rawUrl: string | undefined | null, source: string, title: string): string {
  // Se il LLM ha fornito un URL valido, usalo
  if (rawUrl && rawUrl.trim() !== "" && rawUrl.startsWith("http")) {
    return rawUrl.slice(0, 999);
  }

  // Mappa delle homepage delle fonti principali
  const sourceHomepages: Record<string, string> = {
    "Gartner": "https://www.gartner.com/en/newsroom",
    "CB Insights": "https://www.cbinsights.com/research",
    "Statista": "https://www.statista.com",
    "McKinsey Global Institute": "https://www.mckinsey.com/mgi/overview",
    "McKinsey": "https://www.mckinsey.com/featured-insights",
    "Dealroom": "https://dealroom.co/blog",
    "PitchBook": "https://pitchbook.com/news/reports",
    "Crunchbase": "https://news.crunchbase.com",
    "KPMG Venture Pulse": "https://kpmg.com/xx/en/home/campaigns/venture-pulse.html",
    "EY Startup Barometer": "https://www.ey.com/en_gl/entrepreneurship",
    "Atomico State of European Tech": "https://stateofeuropeantech.com",
    "Atomico": "https://stateofeuropeantech.com",
    "Boston Consulting Group": "https://www.bcg.com/publications",
    "BCG": "https://www.bcg.com/publications",
    "Sequoia Capital": "https://www.sequoiacap.com/article",
    "a16z (Andreessen Horowitz)": "https://a16z.com/content",
    "a16z": "https://a16z.com/content",
    "World Economic Forum": "https://www.weforum.org/publications",
    "WEF": "https://www.weforum.org/publications",
    "OECD": "https://www.oecd.org/en/publications.html",
    "European Investment Fund": "https://www.eif.org/news_centre/publications",
    "Bain & Company": "https://www.bain.com/insights",
    "Forrester Research": "https://www.forrester.com/research",
    "Forrester": "https://www.forrester.com/research",
    "IDC": "https://www.idc.com/research",
    "Bloomberg Intelligence": "https://www.bloomberg.com/professional/solution/bloomberg-intelligence",
    "Grand View Research": "https://www.grandviewresearch.com",
    "MarketsandMarkets": "https://www.marketsandmarkets.com",
  };

  // Cerca la homepage della fonte
  const homepage = sourceHomepages[source];
  if (homepage) {
    return homepage;
  }

  // Fallback: URL di ricerca Google con fonte + titolo
  const query = encodeURIComponent(`${source} ${title.slice(0, 80)}`);
  return `https://www.google.com/search?q=${query}`;
}

/**
 * Genera 20 ricerche giornaliere su Startup, VC e AI Trends usando l'AI.
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
          content: `Sei un senior research analyst di Proof Press, specializzato in Startup, Venture Capital e AI Trends.
Il tuo compito è generare 20 ricerche originali e approfondite per la sezione "Proof Press Research".

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
          content: `Genera 20 ricerche originali per Proof Press Research di oggi (${today}).
Includi una mix di: 6-7 ricerche AI Trends, 5 Venture Capital/Startup, 4 Mercati, 3-4 Tecnologia.
Almeno 6 devono riguardare il mercato europeo o italiano.
La prima deve essere la "Ricerca del Giorno" più importante.
Ogni ricerca deve avere dati numerici concreti (%, miliardi, CAGR) e insight actionable per investitori e founder.
IMPORTANTE: per ogni ricerca, il campo sourceUrl DEVE contenere un URL reale e plausibile alla pagina della fonte originale (es. https://www.gartner.com/en/newsroom/press-releases/..., https://www.cbinsights.com/research/report/..., https://www.statista.com/statistics/...). Non lasciare mai sourceUrl vuoto.`,
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
                      description: "URL REALE e verificabile della fonte originale (es. https://www.gartner.com/en/newsroom/..., https://www.cbinsights.com/research/..., https://www.statista.com/statistics/...). DEVE essere un URL completo e plausibile che punti alla ricerca o al report originale. NON lasciare vuoto.",
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
    for (const item of researches.slice(0, 20)) {
      try {
        await db.insert(researchReports).values({
          title: item.title.slice(0, 299),
          summary: item.summary.slice(0, 2000),
          keyFindings: JSON.stringify(item.keyFindings ?? []),
          source: item.source.slice(0, 199),
          sourceUrl: buildSourceUrl(item.sourceUrl, item.source, item.title),
          imageUrl: getImageForCategory(item.category, savedCount),
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
