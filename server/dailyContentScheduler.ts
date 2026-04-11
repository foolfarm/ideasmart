/**
 * Proof Press — Daily Content Scheduler
 * Genera ogni 24 ore:
 *  1. Editoriale AI giornaliero sui trend dell'intelligenza artificiale
 *  2. Startup del Giorno: una startup AI emergente identificata via LLM + ricerca web
 *  3. 20 Ricerche Proof Press Research su Startup, Venture Capital e AI Trends
 */

import { invokeLLM } from "./_core/llm";
import { logAlert } from "./alertLogger";
import {
  getTodayEditorial,
  saveEditorial,
  getTodayStartup,
  saveStartupOfDay,
} from "./db";
import { findEditorialImage, findStartupImage } from "./stockImages";
import { generateDailyResearch } from "./researchGenerator";
import { getDb } from "./db";
import { dailyEditorial, systemSettings } from "../drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";

// ── Recupera titoli editoriali recenti per anti-ripetitività ─────────────────
async function getRecentEditorialTitles(limit = 14): Promise<string[]> {
  try {
    const db = await getDb();
    if (!db) return [];
    const rows = await db.select({ title: dailyEditorial.title, dateLabel: dailyEditorial.dateLabel })
      .from(dailyEditorial)
      .orderBy(desc(dailyEditorial.createdAt))
      .limit(limit);
    return rows.map((r: { dateLabel: string; title: string }) => `[${r.dateLabel}] ${r.title}`);
  } catch {
    return [];
  }
}

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

  // Recupera titoli recenti per evitare ripetizioni
  const recentTitles = await getRecentEditorialTitles(14);
  const recentTitlesBlock = recentTitles.length > 0
    ? `\n\n⚠️ TITOLI GIÀ PUBBLICATI NEGLI ULTIMI 14 GIORNI (NON ripetere questi temi/titoli):\n${recentTitles.map(t => `- ${t}`).join("\n")}\n\nREGOLE ANTI-RIPETITIVITÀ:\n- Il titolo DEVE essere completamente diverso da quelli sopra elencati\n- NON usare le formule: "Nuova Frontiera", "Rivoluzione Silenziosa", "Ridefinisce il Business", "Ridisegna il Lavoro"\n- NON ripetere lo stesso tema per più di 2 giorni consecutivi\n- Varia lo stile del titolo: alterna domande, dati numerici, nomi di aziende, provocazioni\n- Ogni editoriale deve avere un ANGOLO UNICO: un caso studio specifico, un dato sorprendente, un'azienda concreta`
    : "";

  // Rotazione tematica: scegli un tema diverso ogni giorno
  const EDITORIAL_THEMES = [
    "AI applicata alla supply chain e logistica: casi concreti di aziende italiane",
    "AI e cybersecurity: le nuove minacce e le difese enterprise",
    "AI nel settore legale: contratti, compliance, due diligence automatizzata",
    "AI per il marketing B2B: personalizzazione, lead scoring, content generation",
    "Regolamentazione AI in Europa: AI Act, impatti su PMI e grandi aziende",
    "AI nella manifattura italiana: robotica, quality control, manutenzione predittiva",
    "AI e risorse umane: recruiting, talent retention, workforce planning",
    "AI nel settore finanziario: trading algoritmico, risk assessment, antifrode",
    "AI e sostenibilità: ottimizzazione energetica, ESG reporting, carbon tracking",
    "AI per il customer service: chatbot enterprise, voice AI, sentiment analysis",
    "AI e healthcare: diagnostica, drug discovery, telemedicina in Italia",
    "Startup AI italiane: chi sta emergendo e perché gli investitori scommettono",
    "AI open source vs proprietary: strategie enterprise e costi reali",
    "AI e formazione: come le aziende italiane stanno upskillando i dipendenti",
    "AI multimodale: visione, linguaggio e audio combinati per il business",
    "AI edge computing: inferenza locale, privacy e latenza zero",
    "AI e retail: personalizzazione, inventory management, pricing dinamico",
    "AI nel real estate: valutazioni automatiche, smart building, proptech",
    "AI e media: generazione contenuti, fact-checking automatico, newsroom AI",
    "AI e agricoltura: precision farming, droni, previsioni meteo avanzate",
    "AI e automotive: guida autonoma, connected car, produzione intelligente",
  ];
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const themeIndex = dayOfYear % EDITORIAL_THEMES.length;
  const suggestedTheme = EDITORIAL_THEMES[themeIndex];

  const prompt = `Sei il direttore editoriale di Proof Press, la principale rivista italiana sull'AI per il business.
Oggi è ${italianDate}.

TEMA SUGGERITO PER OGGI: ${suggestedTheme}
(Puoi seguire questo tema o sceglierne uno affine, ma DEVE essere diverso dagli editoriali recenti)

Scrivi un editoriale giornaliero di alta qualità sui trend più rilevanti dell'intelligenza artificiale di oggi.
L'editoriale deve essere scritto in italiano, con tono autorevole e giornalistico, rivolto a CEO, manager e investitori italiani.

Restituisci un JSON con questa struttura esatta:
{
  "title": "Titolo dell'editoriale (max 80 caratteri, incisivo e diretto — DEVE essere UNICO e diverso dai titoli recenti)",
  "subtitle": "Sottotitolo esplicativo (max 120 caratteri)",
  "keyTrend": "Il trend AI principale del giorno (max 60 caratteri)",
  "body": "Corpo dell'editoriale (3-4 paragrafi, circa 350-450 parole totali). Deve analizzare i trend AI più recenti, il loro impatto sul business italiano, e offrire una prospettiva editoriale originale. Usa dati, esempi concreti e un punto di vista netto.",
  "authorNote": "Nota finale del direttore (1-2 frasi, max 150 caratteri, riflessione personale sul tema)"
}${recentTitlesBlock}`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "Sei il direttore editoriale di Proof Press. Rispondi sempre con JSON valido." },
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

  const prompt = `Sei un analista di Proof Press, specializzato nell'identificare startup AI emergenti.
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
    // 3. Ricerche Proof Press Research (20 ricerche giornaliere)
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
    // 4. Check diversity score e alert se < 70%
    try {
      await checkDiversityScoreAlert();
    } catch (diversityErr) {
      console.error("[DailyContent] Diversity check failed:", diversityErr);
    }
  } catch (err) {
    console.error("[DailyContent] Refresh failed:", err);
  }
}

const DIVERSITY_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 ore
const DIVERSITY_COOLDOWN_KEY = "last_diversity_alert_at";

/**
 * Calcola il diversity score degli ultimi 14 editoriali.
 * Se scende sotto il 95%, invia un alert al proprietario (max 1 volta ogni 24h).
 * Il cooldown è persistente nel DB — sopravvive ai riavvii del server.
 */
async function checkDiversityScoreAlert(): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    const editorials = await db
      .select({ title: dailyEditorial.title, dateLabel: dailyEditorial.dateLabel })
      .from(dailyEditorial)
      .orderBy(desc(dailyEditorial.createdAt))
      .limit(14);

    if (editorials.length < 5) return; // troppo pochi per valutare

    const uniqueTitles = new Set(editorials.map(e => e.title.toLowerCase())).size;
    const diversityScore = Math.round((uniqueTitles / editorials.length) * 100);

    console.log(`[DailyContent] Diversity score: ${diversityScore}% (${uniqueTitles}/${editorials.length} titoli unici)`);

    if (diversityScore < 95) {
      const now = Date.now();
      // Cooldown persistente nel DB (sopravvive ai riavvii del server)
      const settingRows = await db.select().from(systemSettings).where(eq(systemSettings.key, DIVERSITY_COOLDOWN_KEY)).limit(1);
      const lastSentAt = settingRows[0] ? parseInt(settingRows[0].value, 10) : null;
      const cooldownOk = !lastSentAt || (now - lastSentAt) > DIVERSITY_COOLDOWN_MS;
      if (!cooldownOk) {
        const hoursAgo = Math.round((now - lastSentAt!) / 3_600_000);
        console.log(`[DailyContent] ⏳ Diversity alert soppresso (cooldown 24h DB — ultimo inviato ${hoursAgo}h fa)`);
        return;
      }
      // Trova le coppie più simili per il report
      const titles = editorials.map(e => `- [${e.dateLabel}] ${e.title}`);
      const alertContent = [
        `Il diversity score degli ultimi ${editorials.length} editoriali è sceso al ${diversityScore}% (soglia: 95%).`,
        ``,
        `Titoli unici: ${uniqueTitles} su ${editorials.length}`,
        ``,
        `Ultimi titoli:`,
        ...titles,
        ``,
        `Azione consigliata: verificare il prompt di generazione editoriali e rigenerare l'editoriale di oggi dal pannello admin.`
      ].join("\n");

      await notifyOwner({
        title: `⚠️ Alert Ripetitività Editoriali: Diversity Score ${diversityScore}%`,
        content: alertContent,
      });
      // Salva nel log DB
      await logAlert({
        type: "diversity",
        severity: diversityScore < 50 ? "critical" : "warning",
        title: `Diversity Score ${diversityScore}% (soglia: 95%)`,
        message: `Titoli unici: ${uniqueTitles} su ${editorials.length}\n${titles.join("\n")}`,
        emailSent: true,
      });
      // Salva il timestamp nel DB per il cooldown persistente
      await db.insert(systemSettings).values({ key: DIVERSITY_COOLDOWN_KEY, value: String(now) })
        .onDuplicateKeyUpdate({ set: { value: String(now) } });
      console.log(`[DailyContent] ⚠️ Alert inviato: diversity score ${diversityScore}% (prossimo possibile tra 24h)`);
    }
  } catch (err) {
    console.error("[DailyContent] Diversity score check error:", err);
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
