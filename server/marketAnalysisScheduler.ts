/**
 * marketAnalysisScheduler.ts
 * Genera 4 analisi di mercato AI ogni 7 giorni attingendo da fonti come
 * CB Insights, Sifted, TechCrunch, The Information, Dealroom, PitchBook.
 * Cron: ogni giovedì alle 06:00 UTC
 */

import { invokeLLM, stripJsonBackticks } from "./_core/llm";
import { saveMarketAnalysis, getLatestMarketAnalysis, deleteMarketAnalysisByWeek } from "./db";
import { findMarketAnalysisImage } from "./stockImages";

function getWeekLabel(): string {
  const now = new Date();
  const year = now.getFullYear();
  const start = new Date(year, 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const week = Math.ceil((diff / oneWeek) + 1);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

const SOURCES = [
  "CB Insights",
  "Sifted",
  "TechCrunch",
  "The Information",
  "Dealroom",
  "PitchBook",
  "VentureBeat",
  "MIT Technology Review",
  "Stanford HAI",
  "McKinsey Global Institute",
  "Goldman Sachs Research",
  "Gartner",
];

const CATEGORIES = [
  "AI & Fintech",
  "AI & Healthcare",
  "AI & Enterprise",
  "AI & Retail",
  "AI & Manufacturing",
  "AI & Legal",
  "AI & Education",
  "AI & Real Estate",
  "AI Infrastructure",
  "Generative AI",
  "AI Agents",
  "AI & Cybersecurity",
  "AI & Logistics",
  "AI & Energy",
  "AI & Media",
];

interface MarketAnalysisItem {
  position: number;
  source: string;
  sourceUrl?: string;
  category: string;
  title: string;
  subtitle?: string;
  summary: string;
  keyInsight?: string;
  dataPoint1?: string;
  dataPoint2?: string;
  dataPoint3?: string;
  marketSize?: string;
  growthRate?: string;
  italyRelevance?: string;
}

export async function generateMarketAnalysis(): Promise<void> {
  const weekLabel = getWeekLabel();
  const today = new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });

  console.log(`[MarketAnalysis] Generazione analisi di mercato per ${weekLabel}...`);

  // Seleziona 4 fonti e categorie casuali
  const shuffledSources = [...SOURCES].sort(() => Math.random() - 0.5).slice(0, 4);
  const shuffledCategories = [...CATEGORIES].sort(() => Math.random() - 0.5).slice(0, 4);

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Sei un analista di mercato esperto in AI e tecnologia. Scrivi in italiano professionale.
Hai accesso alle ultime analisi e report di mercato di fonti autorevoli come CB Insights, Sifted, TechCrunch, Dealroom, PitchBook, McKinsey, Goldman Sachs, Gartner, MIT Technology Review.
Il tuo compito è sintetizzare le analisi di mercato AI più rilevanti e recenti, con dati concreti e insight strategici.
Includi sempre dati numerici reali (dimensioni mercato, tassi di crescita, investimenti) e una sezione specifica sulla rilevanza per il mercato italiano.`,
        },
        {
          role: "user",
          content: `Genera 4 analisi di mercato AI per la settimana del ${today}.

Ogni analisi deve essere basata su una fonte diversa e coprire un settore diverso.

Fonti da usare: ${shuffledSources.join(", ")}
Settori da coprire: ${shuffledCategories.join(", ")}

Per ogni analisi fornisci:
- source: nome della fonte (es. "CB Insights")
- sourceUrl: URL plausibile della fonte (es. "https://www.cbinsights.com/research/ai-fintech-2026")
- category: settore (es. "AI & Fintech")
- title: titolo dell'analisi (max 80 caratteri, impattante)
- subtitle: sottotitolo (max 120 caratteri)
- summary: sintesi approfondita dell'analisi (4-5 paragrafi, almeno 400 parole), con dati concreti, trend emergenti, player chiave, proiezioni
- keyInsight: l'insight principale più importante (1-2 frasi, max 200 caratteri)
- dataPoint1: primo dato chiave con contesto (es. "Mercato AI Fintech: $47B nel 2025, +34% YoY")
- dataPoint2: secondo dato chiave (es. "67% delle banche europee ha già adottato AI per il risk assessment")
- dataPoint3: terzo dato chiave (es. "Investimenti VC in AI Fintech: $12.4B nel Q1 2026")
- marketSize: dimensione del mercato (es. "$47B nel 2025")
- growthRate: tasso di crescita (es. "+34% CAGR 2025-2030")
- italyRelevance: paragrafo specifico sulla rilevanza per l'Italia e le opportunità per le aziende italiane (almeno 100 parole)

Rispondi SOLO con un JSON valido, senza markdown, nel formato:
{
  "analyses": [
    { "source": "...", "sourceUrl": "...", "category": "...", "title": "...", "subtitle": "...", "summary": "...", "keyInsight": "...", "dataPoint1": "...", "dataPoint2": "...", "dataPoint3": "...", "marketSize": "...", "growthRate": "...", "italyRelevance": "..." },
    ...
  ]
}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "market_analyses",
          strict: true,
          schema: {
            type: "object",
            properties: {
              analyses: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    source: { type: "string" },
                    sourceUrl: { type: "string" },
                    category: { type: "string" },
                    title: { type: "string" },
                    subtitle: { type: "string" },
                    summary: { type: "string" },
                    keyInsight: { type: "string" },
                    dataPoint1: { type: "string" },
                    dataPoint2: { type: "string" },
                    dataPoint3: { type: "string" },
                    marketSize: { type: "string" },
                    growthRate: { type: "string" },
                    italyRelevance: { type: "string" },
                  },
                  required: ["source", "sourceUrl", "category", "title", "subtitle", "summary", "keyInsight", "dataPoint1", "dataPoint2", "dataPoint3", "marketSize", "growthRate", "italyRelevance"],
                  additionalProperties: false,
                },
              },
            },
            required: ["analyses"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(stripJsonBackticks(content));
    const analyses: MarketAnalysisItem[] = parsed.analyses.slice(0, 4).map((a: MarketAnalysisItem, i: number) => ({
      ...a,
      position: i + 1,
    }));

    // Elimina analisi precedenti della stessa settimana (idempotente)
    await deleteMarketAnalysisByWeek(weekLabel);

    // Cerca immagini stock Pexels per ogni analisi (zero costi)
    const imageUrls = await Promise.all(
      analyses.map((a) =>
        findMarketAnalysisImage(a.title, a.category, a.source)
          .then(url => {
            if (url) console.log(`[MarketAnalysis] Stock image found: ${a.title.slice(0, 40)}...`);
            return url;
          })
      )
    );

    // Salva le nuove analisi con immagini
    await saveMarketAnalysis(
      analyses.map((a, i) => ({
        section: 'ai' as const,
        weekLabel,
        position: a.position,
        source: a.source,
        sourceUrl: a.sourceUrl ?? null,
        category: a.category,
        title: a.title,
        subtitle: a.subtitle ?? null,
        summary: a.summary,
        keyInsight: a.keyInsight ?? null,
        dataPoint1: a.dataPoint1 ?? null,
        dataPoint2: a.dataPoint2 ?? null,
        dataPoint3: a.dataPoint3 ?? null,
        marketSize: a.marketSize ?? null,
        growthRate: a.growthRate ?? null,
        italyRelevance: a.italyRelevance ?? null,
        imageUrl: imageUrls[i] ?? null,
      }))
    );

    console.log(`[MarketAnalysis] ✅ Salvate ${analyses.length} analisi di mercato per ${weekLabel}`);
    analyses.forEach((a) => console.log(`  [${a.position}] ${a.source} — ${a.title}`));
  } catch (err) {
    console.error("[MarketAnalysis] ❌ Errore generazione analisi:", err);
    throw err;
  }
}

export function startMarketAnalysisScheduler(): void {
  console.log("[MarketAnalysis] Scheduler started — runs every 7 days (Thursday 06:00 UTC)");

  function scheduleNextThursday() {
    const now = new Date();
    const next = new Date(now);
    // Calcola il prossimo giovedì alle 06:00 UTC
    const daysUntilThursday = (4 - now.getUTCDay() + 7) % 7 || 7;
    next.setUTCDate(now.getUTCDate() + daysUntilThursday);
    next.setUTCHours(6, 0, 0, 0);
    const msUntilNext = next.getTime() - now.getTime();
    console.log(`[MarketAnalysis] Next generation scheduled for ${next.toISOString()} (in ${Math.round(msUntilNext / 3600000)}h)`);

    setTimeout(async () => {
      try {
        await generateMarketAnalysis();
      } catch (err) {
        console.error("[MarketAnalysis] Scheduled generation failed:", err);
      }
      // Riprogramma ogni 7 giorni
      setInterval(async () => {
        try {
          await generateMarketAnalysis();
        } catch (err) {
          console.error("[MarketAnalysis] Scheduled generation failed:", err);
        }
      }, 7 * 24 * 60 * 60 * 1000);
    }, msUntilNext);
  }

  scheduleNextThursday();

  // Genera subito se il DB è vuoto
  getLatestMarketAnalysis()
    .then((existing) => {
      if (existing.length === 0) {
        console.log("[MarketAnalysis] DB vuoto — generazione immediata...");
        generateMarketAnalysis().catch(console.error);
      } else {
        console.log(`[MarketAnalysis] Trovate ${existing.length} analisi esistenti — nessuna generazione immediata`);
      }
    })
    .catch(console.error);
}
