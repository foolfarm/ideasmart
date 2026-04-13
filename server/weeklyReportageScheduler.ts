/**
 * Weekly Reportage Scheduler
 * Genera 4 reportage su startup AI italiane ogni lunedì alle 00:00.
 * Può essere triggerato manualmente dall'admin.
 */
import { invokeLLM } from "./_core/llm";
import { saveWeeklyReportage, deleteReportageByWeek } from "./db";
import { InsertWeeklyReportage } from "../drizzle/schema";
import { findReportageImage } from "./stockImages";

function getWeekLabel(): string {
  const now = new Date();
  const year = now.getFullYear();
  const start = new Date(year, 0, 1);
  const week = Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

const CATEGORIES = [
  "Reportage · AI & Produttività",
  "Analisi · AI & Fintech",
  "Inchiesta · AI & Salute",
  "Focus · AI & Industria",
];

const SECTION_NUMBERS = ["01", "02", "03", "04"];

export async function generateWeeklyReportage(): Promise<void> {
  const weekLabel = getWeekLabel();
  console.log(`[WeeklyReportage] Generating reportage for week ${weekLabel}...`);

  try {
    const prompt = `Sei un giornalista tech italiano esperto di intelligenza artificiale e startup. 
Oggi devi scrivere 4 reportage approfonditi su 4 DIVERSE startup italiane che stanno usando l'AI in modo innovativo nel 2025-2026.

Scegli startup REALI italiane che esistono davvero, oppure startup europee con forte presenza in Italia, nei settori:
1. AI & Produttività (es. strumenti AI per il lavoro, automazione aziendale)
2. AI & Fintech (es. AI per investimenti, credito, pagamenti)
3. AI & Salute (es. diagnostica AI, telemedicina, drug discovery)
4. AI & Industria (es. AI per manifattura, logistica, supply chain)

Per ogni startup restituisci un oggetto JSON con questi campi ESATTI:
{
  "startupName": "nome della startup",
  "headline": "titolo del reportage (max 80 caratteri, coinvolgente)",
  "subheadline": "sottotitolo descrittivo (max 120 caratteri)",
  "bodyText": "testo del reportage (3-4 paragrafi, totale 200-300 parole, in italiano, giornalistico e coinvolgente)",
  "quote": "citazione del fondatore o CEO (max 150 caratteri, tra virgolette)",
  "feature1": "prima caratteristica distintiva del prodotto (max 100 caratteri)",
  "feature2": "seconda caratteristica distintiva (max 100 caratteri)",
  "feature3": "terza caratteristica distintiva (max 100 caratteri)",
  "feature4": "quarta caratteristica distintiva (max 100 caratteri)",
  "stat1Value": "valore stat 1 (es. '95%', '2.4M', '500+')",
  "stat1Label": "etichetta stat 1 (es. 'Accuratezza AI', 'Utenti attivi')",
  "stat2Value": "valore stat 2",
  "stat2Label": "etichetta stat 2",
  "stat3Value": "valore stat 3",
  "stat3Label": "etichetta stat 3",
  "ctaLabel": "testo del bottone CTA (es. 'Scopri la piattaforma →')",
  "websiteUrl": "URL del sito web della startup (se non la conosci usa '#')"
}

Rispondi con un array JSON di esattamente 4 oggetti, uno per settore. Nessun testo aggiuntivo, solo JSON valido.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Sei un giornalista tech italiano specializzato in AI e startup. Rispondi sempre con JSON valido, senza markdown code blocks.",
        },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "weekly_reportage",
          strict: true,
          schema: {
            type: "object",
            properties: {
              reportage: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    startupName: { type: "string" },
                    headline: { type: "string" },
                    subheadline: { type: "string" },
                    bodyText: { type: "string" },
                    quote: { type: "string" },
                    feature1: { type: "string" },
                    feature2: { type: "string" },
                    feature3: { type: "string" },
                    feature4: { type: "string" },
                    stat1Value: { type: "string" },
                    stat1Label: { type: "string" },
                    stat2Value: { type: "string" },
                    stat2Label: { type: "string" },
                    stat3Value: { type: "string" },
                    stat3Label: { type: "string" },
                    ctaLabel: { type: "string" },
                    websiteUrl: { type: "string" },
                  },
                  required: [
                    "startupName", "headline", "subheadline", "bodyText", "quote",
                    "feature1", "feature2", "feature3", "feature4",
                    "stat1Value", "stat1Label", "stat2Value", "stat2Label",
                    "stat3Value", "stat3Label", "ctaLabel", "websiteUrl",
                  ],
                  additionalProperties: false,
                },
              },
            },
            required: ["reportage"],
            additionalProperties: false,
          },
        },
      },
    });

    const rawContent = response.choices[0]?.message?.content;
    if (!rawContent) throw new Error("LLM returned empty content");
    const content = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);

    let parsed: { reportage: Array<Record<string, string>> };
    try {
      const { stripJsonBackticks } = await import("./_core/llm");
      parsed = JSON.parse(stripJsonBackticks(content));
    } catch {
      // Fallback: try to extract JSON array
      const match = content.match(/\[[\s\S]*\]/);
      if (match) {
        parsed = { reportage: JSON.parse(match[0]) };
      } else {
        throw new Error("Cannot parse LLM response as JSON");
      }
    }

    const items = parsed.reportage;
    if (!Array.isArray(items) || items.length < 4) {
      throw new Error(`Expected 4 reportage items, got ${items?.length ?? 0}`);
    }

    // Elimina eventuali reportage della stessa settimana già presenti
    await deleteReportageByWeek(weekLabel);

    // Cerca immagini stock Pexels per ogni reportage (zero costi)
    const imageUrls = await Promise.all(
      items.slice(0, 4).map((item, i) =>
        findReportageImage(item.startupName ?? "", item.headline ?? "", CATEGORIES[i])
          .then(url => {
            if (url) console.log(`[WeeklyReportage] Stock image found for reportage ${i + 1}: ${item.startupName}`);
            return url;
          })
      )
    );

    const inserts: InsertWeeklyReportage[] = items.slice(0, 4).map((item, i) => ({
      section: 'ai' as const,
      weekLabel,
      position: i + 1,
      sectionNumber: SECTION_NUMBERS[i],
      category: CATEGORIES[i],
      startupName: item.startupName ?? "",
      headline: item.headline ?? "",
      subheadline: item.subheadline ?? "",
      bodyText: item.bodyText ?? "",
      quote: item.quote ?? "",
      feature1: item.feature1 ?? "",
      feature2: item.feature2 ?? "",
      feature3: item.feature3 ?? "",
      feature4: item.feature4 ?? "",
      stat1Value: item.stat1Value ?? "",
      stat1Label: item.stat1Label ?? "",
      stat2Value: item.stat2Value ?? "",
      stat2Label: item.stat2Label ?? "",
      stat3Value: item.stat3Value ?? "",
      stat3Label: item.stat3Label ?? "",
      ctaLabel: item.ctaLabel ?? "Scopri di più →",
      ctaUrl: item.websiteUrl ?? "#",
      websiteUrl: item.websiteUrl ?? "#",
      imageUrl: imageUrls[i] ?? null,
    }));

    await saveWeeklyReportage(inserts);
    console.log(`[WeeklyReportage] ✓ Generated and saved ${inserts.length} reportage for ${weekLabel}`);
  } catch (error) {
    console.error("[WeeklyReportage] ✗ Failed to generate reportage:", error);
    throw error;
  }
}

/**
 * Avvia il cron job: ogni lunedì alle 00:00
 */
export function startWeeklyReportageScheduler(): void {
  console.log("[WeeklyReportage] Scheduler started — runs every Monday at 00:00");

  function scheduleNextMonday() {
    const now = new Date();
    const next = new Date(now);
    // Calcola il prossimo lunedì alle 00:00
    const daysUntilMonday = (8 - now.getDay()) % 7 || 7; // 0=domenica, 1=lunedì
    next.setDate(now.getDate() + daysUntilMonday);
    next.setHours(0, 0, 0, 0);
    const msUntilNext = next.getTime() - now.getTime();
    console.log(`[WeeklyReportage] Next generation scheduled for ${next.toISOString()} (in ${Math.round(msUntilNext / 3600000)}h)`);

    setTimeout(async () => {
      try {
        await generateWeeklyReportage();
      } catch (err) {
        console.error("[WeeklyReportage] Scheduled generation failed:", err);
      }
      // Riprogramma per il lunedì successivo (7 giorni)
      setInterval(async () => {
        try {
          await generateWeeklyReportage();
        } catch (err) {
          console.error("[WeeklyReportage] Scheduled generation failed:", err);
        }
      }, 7 * 24 * 60 * 60 * 1000);
    }, msUntilNext);
  }

  scheduleNextMonday();
}
