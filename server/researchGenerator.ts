/**
 * Proof Press Research Generator
 * Ogni giorno genera 20 ricerche su Startup, Venture Capital e AI Trends
 * attingendo da fonti specializzate come Gartner, CB Insights, Statista.
 */
import { invokeLLM, stripJsonBackticks } from "./_core/llm";
import { getDb } from "./db";
import { researchReports } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

// ── Fonti specializzate ──────────────────────────────────────────────────────
// ITALIA FIRST: 70% fonti italiane/europee, 30% internazionali
const RESEARCH_SOURCES_ITALY = [
  // Università e centri di ricerca italiani
  "Politecnico di Milano – Osservatorio Startup",
  "Politecnico di Milano – Osservatorio Intelligenza Artificiale",
  "Politecnico di Milano – Osservatorio Digital Innovation",
  "Politecnico di Milano – Osservatorio eCommerce B2c",
  "Università Bocconi – CERIF (Centro di Ricerca sull'Innovazione e la Finanza)",
  "Università Bocconi – Laboratorio di Economia dell'Innovazione",
  "LUISS Guido Carli – LUISS Enlabs Research",
  "Università La Sapienza – Dipartimento di Informatica",
  "CNR – Consiglio Nazionale delle Ricerche",
  "IIT – Istituto Italiano di Tecnologia",
  "ENEA – Agenzia nazionale per le nuove tecnologie",
  "Fondazione Bruno Kessler (FBK)",
  "Scuola Superiore Sant'Anna – Istituto di Management",
  // Think tank e istituti italiani
  "Confindustria – Centro Studi",
  "Assintel – Associazione Nazionale Imprese ICT",
  "Assolombarda – Centro Studi",
  "Fondazione Symbola",
  "The European House – Ambrosetti",
  "Osservatorio Nazionale Startup (MISE/MIMIT)",
  "CDP Venture Capital – Rapporto Annuale",
  "Fondo Nazionale Innovazione – Report",
  "Italia Startup – Ecosystem Report",
  "BeBeez – Private Capital Report Italia",
  "Startupbusiness – Italian Startup Ecosystem Report",
  "Economyup – Ricerca Ecosistema Digitale Italiano",
  "Digital360 Research",
  "Corriere Comunicazioni – Ricerche di Mercato",
  "ICT4Executive – Osservatorio Digitale",
  "Wired Italia – Tech Trends Report",
  // Fonti europee con focus Italia
  "European Investment Fund – Italian Venture Report",
  "Atomico – State of European Tech (Italy Chapter)",
  "Dealroom – Italy Startup Ecosystem",
  "Sifted – Southern Europe Report",
  "Tech.eu – Italy Focus",
  "European Commission – Digital Economy and Society Index (DESI) Italy",
  "EIF – European Investment Fund Research",
  "Invest Europe – Southern Europe VC Report",
];

const RESEARCH_SOURCES_GLOBAL = [
  "Gartner",
  "CB Insights",
  "Statista",
  "McKinsey Global Institute",
  "PitchBook",
  "Crunchbase",
  "KPMG Venture Pulse",
  "EY Startup Barometer",
  "Boston Consulting Group",
  "Sequoia Capital",
  "a16z (Andreessen Horowitz)",
  "World Economic Forum",
  "OECD",
  "Bain & Company",
  "Forrester Research",
  "IDC",
  "Bloomberg Intelligence",
];

// Pool combinato: 70% italiane/europee, 30% globali
const RESEARCH_SOURCES = [...RESEARCH_SOURCES_ITALY, ...RESEARCH_SOURCES_GLOBAL];

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
    // Nuove immagini startup (team, pitch, innovation lab, coworking)
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80",
  ],
  venture_capital: [
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=800&q=80",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80",
    // Nuove immagini VC (deal, handshake, trading floor, boardroom)
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
    "https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=800&q=80",
    "https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
  ],
  ai_trends: [
    "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80",
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80",
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
    // Nuove immagini AI (neural network, data center, robot, chip)
    "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80",
    "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800&q=80",
    "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&q=80",
    "https://images.unsplash.com/photo-1507146153580-69a1fe6d8aa1?w=800&q=80",
  ],
  technology: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
    // Nuove immagini technology (server, code, circuit, digital)
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
    "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80",
    "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&q=80",
    "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80",
  ],
  market: [
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    "https://images.unsplash.com/photo-1642790551116-18e150f248e3?w=800&q=80",
    "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=800&q=80",
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80",
    // Nuove immagini market (stock chart, economy, finance, growth)
    "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80",
    "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80",
    "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
  ],
};

// Seed giornaliero basato sulla data (YYYYMMDD) per garantire rotazione immagini ogni giorno
function getDailySeed(): number {
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Rome" }); // YYYY-MM-DD
  // Somma dei codici ASCII delle cifre della data (es. "2026-04-17" → somma univoca per ogni giorno)
  return today.replace(/-/g, "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

function getImageForCategory(category: string, index: number): string {
  const imgs = CATEGORY_IMAGES[category] ?? CATEGORY_IMAGES["ai_trends"];
  // Combina seed giornaliero + index: garantisce (1) immagine diversa ogni giorno, (2) immagini diverse tra articoli dello stesso giorno
  const dailySeed = getDailySeed();
  return imgs[(dailySeed + index) % imgs.length];
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
export async function generateDailyResearch(force = false): Promise<{
  generated: number;
  error?: string;
}> {
  const db = await getDb();
  if (!db) return { generated: 0, error: "DB non disponibile" };

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  try {
    // Controlla se le ricerche di oggi sono già state generate (skip se force=true)
    if (!force) {
      const existing = await db
        .select({ id: researchReports.id })
        .from(researchReports)
        .where(eq(researchReports.dateLabel, today))
        .limit(1);

      if (existing.length > 0) {
        console.log(`[Research] Ricerche del ${today} già presenti, skip`);
        return { generated: 0 };
      }
    } else {
      // Force: elimina le ricerche di oggi e rigenera
      console.log(`[Research] Force=true: elimino ricerche del ${today} e rigenero...`);
      await db.delete(researchReports).where(eq(researchReports.dateLabel, today));
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
          content: `Sei un senior research analyst di Proof Press, specializzato in Startup, Venture Capital e AI Trends con focus sull'ecosistema italiano ed europeo.
Il tuo compito è generare 10 ricerche originali e approfondite per la sezione "Proof Press Research".

🇮🇹 REGOLA EDITORIALE FONDAMENTALE — ITALIA FIRST 70/30:
- ALMENO 7 ricerche su 10 DEVONO riguardare il mercato italiano o europeo (regione: "italy" o "europe")
- Al massimo 3 ricerche su 10 possono avere focus globale (regione: "global")
- Priorità assoluta a fonti italiane: Politecnico di Milano Osservatori, Bocconi, CNR, IIT, CDP Venture, BeBeez, Confindustria, Ambrosetti, MIMIT
- Le ricerche globali devono sempre includere un paragrafo "Impatto sull'Italia" con dati specifici

Ogni ricerca deve:
1. Essere basata su dati reali e aggiornati di fonti autorevoli italiane ed europee in primis
2. Fornire insight concreti e actionable per investitori, founder e manager italiani
3. Coprire diversi ambiti: startup ecosistemi, VC, AI trends, mercati tecnologici
4. Includere dati numerici, percentuali e trend specifici (es. "Il mercato italiano dell'AI vale X miliardi")
5. Essere scritta in italiano con terminologia tecnica appropriata

La prima ricerca (indice 0) deve essere la "Ricerca del Giorno": la più importante e approfondita, con isResearchOfDay: true, e DEVE avere focus italiano o europeo.

Fonti disponibili (privilegia quelle italiane/europee):
- ITALIANE/EUROPEE (70%): ${RESEARCH_SOURCES_ITALY.join(", ")}
- GLOBALI (30% max): ${RESEARCH_SOURCES_GLOBAL.join(", ")}

Categorie: startup, venture_capital, ai_trends, technology, market
Regioni: global, europe, italy — DISTRIBUZIONE OBBLIGATORIA: almeno 4 "italy", almeno 3 "europe", max 3 "global"

Genera ricerche diverse ogni giorno — oggi è ${dateFormatted}.`,
        },
        {
          role: "user",
          content: `Genera 10 ricerche originali per Proof Press Research di oggi (${today}).

🇮🇹 DISTRIBUZIONE OBBLIGATORIA ITALIA FIRST 70/30:
- 4 ricerche con regione "italy" (es. ecosistema startup italiano, VC italiano, AI adozione in Italia, mercato digitale italiano)
- 3 ricerche con regione "europe" (es. European Tech, EIF report, Atomico, Invest Europe)
- Max 3 ricerche con regione "global" (sempre con paragrafo "Impatto sull'Italia")

Mix tematico: 3-4 ricerche AI Trends, 2-3 Venture Capital/Startup, 2 Mercati, 1-2 Tecnologia.
La prima deve essere la "Ricerca del Giorno" più importante con focus italiano o europeo.
Ogni ricerca deve avere dati numerici concreti (%, miliardi, CAGR) e insight actionable per investitori e founder italiani.

Fonti prioritarie italiane da usare: Politecnico di Milano Osservatori, Bocconi CERIF, CNR, IIT, CDP Venture Capital, BeBeez, Confindustria, Ambrosetti, MIMIT/MISE, Startupbusiness, Economyup, Digital360.

IMPORTANTE: per ogni ricerca, il campo sourceUrl DEVE contenere un URL reale e plausibile alla pagina della fonte originale (es. https://www.osservatori.net/it/ricerche/..., https://bebeez.it/..., https://www.cdpventure.it/..., https://www.gartner.com/en/newsroom/...). Non lasciare mai sourceUrl vuoto.`,
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

    // Parser JSON robusto: gestisce caratteri speciali e newline non escaped
    let parsed: LLMResearchResponse;
    const tryParseResearch = (text: string): LLMResearchResponse | null => {
      // Tentativo 1: parse diretto
      try { return JSON.parse(stripJsonBackticks(text)); } catch {}
      // Tentativo 2: pulizia caratteri di controllo
      const c1 = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
      try { return JSON.parse(stripJsonBackticks(c1)); } catch {}
      // Tentativo 3: estrai il blocco JSON con regex (cerca { ... })
      const jsonMatch = text.match(/\{[\s\S]*"researches"[\s\S]*\}/m);
      if (jsonMatch) {
        const c2 = jsonMatch[0].replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
        try { return JSON.parse(c2); } catch {}
      }
      // Tentativo 4: estrai array researches direttamente
      const arrMatch = text.match(/"researches"\s*:\s*(\[[\s\S]*\])/m);
      if (arrMatch) {
        try {
          const arr = JSON.parse(arrMatch[1].replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ""));
          return { researches: arr };
        } catch {}
      }
      return null;
    };
    const result = tryParseResearch(content);
    if (!result) {
      console.error("[Research] ❌ JSON parse fallito dopo tutti i tentativi. Primi 500 char:", content.slice(0, 500));
      return { generated: 0, error: "JSON parse error: tutti i tentativi falliti" };
    }
    parsed = result;
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
 * Recupera la "Ricerca del Giorno" con rotazione oraria.
 * Ogni ora viene mostrata una research diversa tra quelle del giorno,
 * dando priorità a quelle con isResearchOfDay=true.
 * La rotazione è deterministica: stessa ora = stessa research per tutti gli utenti.
 */
export async function getResearchOfDay(): Promise<typeof researchReports.$inferSelect | null> {
  const db = await getDb();
  if (!db) return null;

  // Usa il timezone CET per allineare la rotazione all'orario italiano
  const nowCET = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Rome' }));
  const today = nowCET.toISOString().split('T')[0];
  const currentHour = nowCET.getHours(); // 0-23, cambia ogni ora

  // Recupera tutte le research di oggi, prima quelle isResearchOfDay=true poi le altre
  const allToday = await db
    .select()
    .from(researchReports)
    .where(eq(researchReports.dateLabel, today))
    .orderBy(desc(researchReports.isResearchOfDay), researchReports.id);

  if (allToday.length === 0) {
    // Fallback: ieri
    const yesterday = new Date(nowCET.getTime() - 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];
    const fallbackYesterday = await db
      .select()
      .from(researchReports)
      .where(eq(researchReports.dateLabel, yesterday))
      .orderBy(desc(researchReports.isResearchOfDay), researchReports.id)
      .limit(10);
    if (fallbackYesterday.length === 0) return null;
    const idxYesterday = currentHour % fallbackYesterday.length;
    return fallbackYesterday[idxYesterday];
  }

  // Rotazione deterministica: ora corrente % numero di research disponibili
  const idx = currentHour % allToday.length;
  return allToday[idx];
}
