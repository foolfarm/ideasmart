/**
 * IDEASMART — Daily Content Scheduler
 * Genera ogni 24 ore:
 *  1. Editoriale AI giornaliero sui trend dell'intelligenza artificiale
 *  2. Startup del Giorno: una startup AI emergente identificata via LLM + ricerca web
 *  3. 20 Ricerche IdeaSmart Research su Startup, Venture Capital e AI Trends
 */

import { invokeLLM } from "./_core/llm";
import {
  getTodayEditorial,
  saveEditorial,
  getTodayStartup,
  saveStartupOfDay,
} from "./db";
import { findEditorialImage, findStartupImage } from "./stockImages";
import { generateDailyResearch } from "./researchGenerator";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTodayLabel(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function getItalianDate(): string {
  return new Date().toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ── Editoriale Giornaliero ────────────────────────────────────────────────────

export async function generateDailyEditorial() {
  const today = getTodayLabel();
  const italianDate = getItalianDate();

  const prompt = `Sei il direttore editoriale di IDEASMART, la principale rivista italiana sull'AI per il business.
Oggi è ${italianDate}.

Scrivi un editoriale giornaliero di alta qualità sui trend più rilevanti dell'intelligenza artificiale di oggi.
L'editoriale deve essere scritto in italiano, con tono autorevole e giornalistico, rivolto a CEO, manager e investitori italiani.

Restituisci un JSON con questa struttura esatta:
{
  "title": "Titolo dell'editoriale (max 80 caratteri, incisivo e diretto)",
  "subtitle": "Sottotitolo esplicativo (max 120 caratteri)",
  "keyTrend": "Il trend AI principale del giorno (max 60 caratteri)",
  "body": "Corpo dell'editoriale (3-4 paragrafi, circa 350-450 parole totali). Deve analizzare i trend AI più recenti, il loro impatto sul business italiano, e offrire una prospettiva editoriale originale. Usa dati, esempi concreti e un punto di vista netto.",
  "authorNote": "Nota finale del direttore (1-2 frasi, max 150 caratteri, riflessione personale sul tema)"
}

Temi da considerare per oggi: modelli generativi, agenti AI autonomi, automazione del lavoro, AI per le PMI italiane, regolamentazione europea, investimenti in AI, startup AI emergenti, impatto sull'occupazione, AI nella produzione industriale.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "Sei il direttore editoriale di IDEASMART. Rispondi sempre con JSON valido." },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "daily_editorial",
        strict: true,
        schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            subtitle: { type: "string" },
            keyTrend: { type: "string" },
            body: { type: "string" },
            authorNote: { type: "string" },
          },
          required: ["title", "subtitle", "keyTrend", "body", "authorNote"],
          additionalProperties: false,
        },
      },
    },
  });

  const raw = response.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(typeof raw === "string" ? raw : JSON.stringify(raw));

  return {
    section: 'ai' as const,
    dateLabel: today,
    title: parsed.title ?? "L'AI italiana non è un fenomeno di nicchia",
    subtitle: parsed.subtitle ?? "Sta cambiando le regole del gioco",
    keyTrend: parsed.keyTrend ?? "AI Generativa",
    body: parsed.body ?? "",
    authorNote: parsed.authorNote ?? "",
  };
}

// ── Startup del Giorno ────────────────────────────────────────────────────────

export async function generateStartupOfDay() {
  const today = getTodayLabel();
  const italianDate = getItalianDate();

  const prompt = `Sei un analista di IDEASMART, specializzato nell'identificare startup AI emergenti.
Oggi è ${italianDate}.

Identifica UNA startup AI che sta emergendo in questo momento — può essere italiana o internazionale ma con rilevanza per il mercato business italiano.
Deve essere una startup reale, recentemente attiva, con prodotto concreto e trazione visibile (funding, clienti, crescita).

Criteri di selezione:
- Startup fondata negli ultimi 3-5 anni
- Prodotto AI applicato al business (non consumer)
- Trazione recente: round di finanziamento, partnership, lancio prodotto, crescita utenti
- Rilevante per CEO e manager italiani
- Non già ampiamente coperta dai media mainstream italiani

Restituisci un JSON con questa struttura esatta:
{
  "name": "Nome della startup",
  "tagline": "Tagline descrittiva (max 100 caratteri)",
  "description": "Descrizione approfondita (200-300 parole): cosa fa, come funziona la tecnologia AI, perché è innovativa, chi sono i fondatori, quali clienti serve",
  "category": "Categoria (es: AI per HR, AI per Finance, AI per Legal, AI per Manufacturing, AI per Marketing, AI per Healthcare, AI per Logistics, AI per Sales)",
  "country": "Paese di origine (es: Italia, USA, UK, Francia, Germania)",
  "foundedYear": "Anno di fondazione (es: 2022)",
  "funding": "Finanziamento raccolto (es: Seed — $2M, Series A — €8M, Bootstrapped)",
  "whyToday": "Perché è rilevante OGGI (2-3 frasi): evento recente, trend che cavalca, problema urgente che risolve",
  "websiteUrl": "URL del sito web (https://...)",
  "linkedinUrl": "URL LinkedIn della startup (https://linkedin.com/company/...)",
  "aiScore": numero intero da 0 a 100 che rappresenta il potenziale AI della startup
}`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "Sei un analista di startup AI. Rispondi sempre con JSON valido. Identifica startup reali e verificabili." },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "startup_of_day",
        strict: true,
        schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            tagline: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            country: { type: "string" },
            foundedYear: { type: "string" },
            funding: { type: "string" },
            whyToday: { type: "string" },
            websiteUrl: { type: "string" },
            linkedinUrl: { type: "string" },
            aiScore: { type: "integer" },
          },
          required: ["name", "tagline", "description", "category", "country", "foundedYear", "funding", "whyToday", "websiteUrl", "linkedinUrl", "aiScore"],
          additionalProperties: false,
        },
      },
    },
  });

  const raw = response.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(typeof raw === "string" ? raw : JSON.stringify(raw));

  return {
    section: 'ai' as const,
    dateLabel: today,
    name: parsed.name ?? "Startup AI del Giorno",
    tagline: parsed.tagline ?? "",
    description: parsed.description ?? "",
    category: parsed.category ?? "AI per Business",
    country: parsed.country ?? "Italia",
    foundedYear: parsed.foundedYear ?? "",
    funding: parsed.funding ?? "",
    whyToday: parsed.whyToday ?? "",
    websiteUrl: parsed.websiteUrl ?? "",
    linkedinUrl: parsed.linkedinUrl ?? "",
    aiScore: parsed.aiScore ?? 75,
  };
}

// ── Scheduler principale ──────────────────────────────────────────────────────

let _dailyContentTimer: NodeJS.Timeout | null = null;

async function runDailyContentRefresh() {
  const today = getTodayLabel();
  console.log(`[DailyContent] Checking content for ${today}...`);

  try {
    // 1. Editoriale
    const existingEditorial = await getTodayEditorial(today);
    if (!existingEditorial) {
      console.log("[DailyContent] Generating editorial...");
      const editorial = await generateDailyEditorial();
      // Cerca immagine stock Pexels coerente (zero costi)
      const editorialImageUrl = await findEditorialImage(editorial.title, editorial.keyTrend ?? "AI Innovation");
      if (editorialImageUrl) {
        console.log(`[DailyContent] Editorial stock image found: ${editorial.title.slice(0, 40)}...`);
      }
      await saveEditorial({ ...editorial, imageUrl: editorialImageUrl ?? undefined });
      console.log(`[DailyContent] Editorial saved: "${editorial.title}"`);
    } else {
      console.log("[DailyContent] Editorial already exists for today, skipping.");
    }

    // 2. Startup del Giorno
    const existingStartup = await getTodayStartup(today);
    if (!existingStartup) {
      console.log("[DailyContent] Generating startup of the day...");
      const startup = await generateStartupOfDay();
      // Cerca immagine stock Pexels coerente (zero costi)
      const startupImageUrl = await findStartupImage(startup.name, startup.category, startup.tagline);
      if (startupImageUrl) {
        console.log(`[DailyContent] Startup stock image found: ${startup.name}`);
      }
      await saveStartupOfDay({ ...startup, imageUrl: startupImageUrl ?? undefined });
      console.log(`[DailyContent] Startup saved: "${startup.name}"`);
    } else {
      console.log("[DailyContent] Startup of the day already exists for today, skipping.");
    }
    // 3. Ricerche IdeaSmart Research (20 ricerche giornaliere)
    console.log("[DailyContent] Generating daily research reports...");
    try {
      const researchResult = await generateDailyResearch();
      if (researchResult.generated > 0) {
        console.log(`[DailyContent] Research: ${researchResult.generated} reports generated.`);
      } else if (researchResult.error) {
        console.error(`[DailyContent] Research error: ${researchResult.error}`);
      } else {
        console.log("[DailyContent] Research already exists for today, skipping.");
      }
    } catch (researchErr) {
      console.error("[DailyContent] Research generation failed:", researchErr);
    }
  } catch (err) {
    console.error("[DailyContent] Refresh failed:", err);
  }
}

export function startDailyContentScheduler() {
  // Esegui subito all'avvio
  runDailyContentRefresh();

  // Poi controlla ogni 6 ore (rigenera solo se non esiste per oggi)
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  _dailyContentTimer = setInterval(runDailyContentRefresh, SIX_HOURS);

  console.log("[DailyContent] Started — checks every 6h, refreshes daily");
}

export function stopDailyContentScheduler() {
  if (_dailyContentTimer) {
    clearInterval(_dailyContentTimer);
    _dailyContentTimer = null;
  }
}

// Export per trigger manuale dall'admin
export { runDailyContentRefresh };
