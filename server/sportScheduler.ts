/**
 * Sport Scheduler — Sport & Markets by IDEASMART
 * Genera contenuti per la sezione /sport: news, editoriale, reportage, analisi di mercato
 * Tono: senior analyst Deloitte Football Money League/KPMG Football Benchmark — dati precisi, framing strategico, impatto per le imprese
 */
import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { newsItems, dailyEditorial, startupOfDay, weeklyReportage, marketAnalysis } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { findNewsImage, findEditorialImage, findReportageImage, findMarketAnalysisImage } from "./stockImages";

// ─── Genera 20 news Sport ───────────────────────────────────────────────────
export async function generateSportNews(): Promise<void> {
  console.log("[SportScheduler] Generating sport news...");
  try {
    const today = new Date().toLocaleDateString("it-IT", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    const weekLabel = new Date().toISOString().split("T")[0];
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Sei un senior analyst di Sport & Markets by IDEASMART, testata giornalistica HumanLess italiana.
Scrivi in italiano con tono da senior analyst Deloitte Football Money League/KPMG Football Benchmark: dati precisi, framing strategico, implicazioni per manager dello sport e investitori italiani.
Genera notizie credibili e realistiche sui sport, business sportivo e industria dell'entertainment.`,
        },
        {
          role: "user",
          content: `Genera 20 notizie di finanza e mercati per oggi, ${today}.
Focus su: mercati azionari, politica monetaria BCE/Fed, M&A, private equity, fintech, crypto regolamentata, obbligazioni, commodities, forex, economia globale, ESG, banche italiane ed europee, IPO.
Categorie da usare: Calcio & Business, Diritti TV & Media, Sponsorship & Brand, Stadi & Infrastrutture, Esports, Sport Tech, Valutazioni Club, Trasferimenti & Mercato, Formula 1 & Motorsport, NBA & Basket, Tennis & Golf, Olimpiadi & Mega-eventi.
Restituisci un JSON con questa struttura:
{
  "news": [
    {
      "title": "Titolo della notizia (max 80 caratteri)",
      "summary": "Riassunto in 2-3 frasi con dati concreti (max 200 caratteri)",
      "category": "Categoria (dalla lista sopra)",
      "sourceUrl": "URL homepage del sito sorgente (es. https://www.sportspromedia.com, https://www.sportbusiness.com, https://www.gazzetta.it) — NON inventare URL di articoli specifici",
      "sourceName": "Nome fonte"
    }
  ]
}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "sport_news",
          strict: true,
          schema: {
            type: "object",
            properties: {
              news: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    summary: { type: "string" },
                    category: { type: "string" },
                    sourceUrl: { type: "string" },
                    sourceName: { type: "string" },
                  },
                  required: ["title", "summary", "category", "sourceUrl", "sourceName"],
                  additionalProperties: false,
                },
              },
            },
            required: ["news"],
            additionalProperties: false,
          },
        },
      },
    });
    const content = JSON.parse(response.choices[0].message.content as string);
    const db = await getDb();
    if (!db) throw new Error("DB not available");
    await db.delete(newsItems).where(eq(newsItems.section, 'sport'));
    for (let i = 0; i < Math.min(content.news.length, 20); i++) {
      const item = content.news[i];
      const imageUrl = await findNewsImage(item.title, item.category);
      await db.insert(newsItems).values({
        title: item.title,
        summary: item.summary,
        category: item.category,
        sourceUrl: item.sourceUrl,
        sourceName: item.sourceName,
        imageUrl: imageUrl || null,
        section: 'sport',
        weekLabel,
        position: i + 1,
        publishedAt: new Date().toISOString(),
      });
    }
    console.log(`[SportScheduler] Saved ${Math.min(content.news.length, 20)} sport news`);
  } catch (err) {
    console.error("[SportScheduler] Error generating sport news:", err);
  }
}

// ─── Genera Editoriale Sport ────────────────────────────────────────────────
export async function generateSportEditorial(): Promise<void> {
  console.log("[SportScheduler] Generating sport editorial...");
  try {
    const today = new Date().toLocaleDateString("it-IT", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    const weekLabel = new Date().toISOString().split("T")[0];
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Sei il direttore editoriale di Sport & Markets by IDEASMART.
Il tuo stile è quello di un senior analyst Deloitte Football Money League/KPMG Football Benchmark: parti da un dato di mercato specifico e verificabile, analizza le implicazioni strategiche per manager dello sport e investitori italiani, concludi con una provocazione per i peer.
Bandite le frasi retoriche vuote. Ogni affermazione deve essere supportata da dati o logica di mercato.
Scrivi in italiano, tono autorevole, frasi concise e incisive.`,
        },
        {
          role: "user",
          content: `Scrivi l'editoriale di Sport & Markets per oggi, ${today}.
Scegli il tema più rilevante tra: diritti TV, valutazioni club, deal di sponsorship, esports, sport tech, mega-eventi.
Restituisci JSON:
{
  "title": "Titolo editoriale (max 80 caratteri, incisivo)",
  "subtitle": "Sottotitolo analitico (max 120 caratteri)",
  "body": "Corpo dell'editoriale (400-600 parole). Struttura: 1) dato di mercato di apertura con fonte, 2) analisi delle implicazioni per le imprese italiane, 3) confronto con scenario europeo/globale, 4) provocazione finale per manager dello sport e investitori.",
  "section": "sport"
}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "sport_editorial",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              subtitle: { type: "string" },
              body: { type: "string" },
              section: { type: "string" },
            },
            required: ["title", "subtitle", "body", "section"],
            additionalProperties: false,
          },
        },
      },
    });
    const content = JSON.parse(response.choices[0].message.content as string);
    const db = await getDb();
    if (!db) throw new Error("DB not available");
    const imageUrl = await findEditorialImage(content.title, "sport");
    await db.insert(dailyEditorial).values({
      title: content.title,
      subtitle: content.subtitle,
      body: content.body,
      imageUrl: imageUrl || null,
      section: 'sport',
      dateLabel: weekLabel,
    });
    console.log("[SportScheduler] Sport editorial saved");
  } catch (err) {
    console.error("[SportScheduler] Error generating sport editorial:", err);
  }
}

// ─── Genera Deal/Azienda della Settimana Sport ──────────────────────────────
export async function generateSportDealOfWeek(): Promise<void> {
  console.log("[SportScheduler] Generating sport deal of week...");
  try {
    const weekLabel = new Date().toISOString().split("T")[0];
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Sei un analista M&A e deal tracker per Sport & Markets by IDEASMART.
Analizza i deal più significativi della settimana: acquisizioni, IPO, round di finanziamento, fusioni.
Tono: senior analyst con dati precisi e implicazioni strategiche.`,
        },
        {
          role: "user",
          content: `Genera la scheda "Deal Sportivo della Settimana" per Sport & Markets.
Scegli il deal/evento finanziario più significativo della settimana (accordo TV, acquisizione club, deal sponsorship, valutazione record).
Restituisci JSON:
{
  "name": "Nome deal o evento (es: 'Acquisizione UniCredit-Commerzbank')",
  "tagline": "Tagline analitica (max 100 caratteri)",
  "description": "Analisi approfondita del deal (300-400 parole): contesto, cifre, implicazioni strategiche, impatto sul mercato italiano/europeo",
  "metric1": "Prima metrica chiave (es: '€13.2B valore deal')",
  "metric2": "Seconda metrica (es: '+23% premium sull'ultimo prezzo')",
  "metric3": "Terza metrica (es: 'Terzo player per asset in Europa')",
  "category": "Categoria (Diritti TV, Sponsorship, Acquisizione, Esports, Regolamentazione)",
  "source": "Fonte principale (es: Bloomberg, FT, Reuters)"
}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "sport_deal_of_week",
          strict: true,
          schema: {
            type: "object",
            properties: {
              name: { type: "string" },
              tagline: { type: "string" },
              description: { type: "string" },
              metric1: { type: "string" },
              metric2: { type: "string" },
              metric3: { type: "string" },
              category: { type: "string" },
              source: { type: "string" },
            },
            required: ["name", "tagline", "description", "metric1", "metric2", "metric3", "category", "source"],
            additionalProperties: false,
          },
        },
      },
    });
    const content = JSON.parse(response.choices[0].message.content as string);
    const db = await getDb();
    if (!db) throw new Error("DB not available");
    const imageUrl = await findReportageImage(content.name, content.name, content.category);
    await db.insert(startupOfDay).values({
      name: content.name,
      tagline: content.tagline,
      description: content.description,
      category: content.category,
      country: 'Europa',
      whyToday: content.tagline,
      websiteUrl: '',
      imageUrl: imageUrl || null,
      section: 'sport',
      dateLabel: weekLabel,
    });
    console.log("[SportScheduler] Sport deal of week saved");
  } catch (err) {
    console.error("[SportScheduler] Error generating sport deal of week:", err);
  }
}

// ─── Genera Reportage Sport ─────────────────────────────────────────────────
export async function generateSportReportage(): Promise<void> {
  console.log("[SportScheduler] Generating sport reportage...");
  try {
    const weekLabel = new Date().toISOString().split("T")[0];
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Sei un senior analyst di Sport & Markets by IDEASMART. Produci reportage approfonditi su aziende, deal e trend finanziari con dati precisi e analisi strategica.`,
        },
        {
          role: "user",
          content: `Genera 4 reportage su aziende o deal finanziari rilevanti questa settimana.
Copri settori diversi (es: club calcistico, team esports, deal sponsorship, federazione sportiva).
Restituisci JSON:
{
  "reportages": [
    {
      "position": 1,
      "sectionNumber": "01",
      "category": "Categoria (Calcio, Basket, Formula1, Esports, Sponsorship)",
      "startupName": "Nome azienda o deal",
      "headline": "Titolo reportage (max 80 caratteri)",
      "subheadline": "Sottotitolo (max 120 caratteri)",
      "bodyText": "Testo reportage (300-400 parole): contesto di mercato, analisi finanziaria, dati chiave, implicazioni strategiche",
      "quote": "Citazione significativa di un CEO/analista (reale o plausibile)",
      "feature1": "Prima caratteristica chiave dell'azienda/deal",
      "feature2": "Seconda caratteristica",
      "feature3": "Terza caratteristica",
      "feature4": "Quarta caratteristica",
      "stat1Value": "Valore stat 1 (es: €4.2B)",
      "stat1Label": "Label stat 1 (es: Market Cap)",
      "stat2Value": "Valore stat 2",
      "stat2Label": "Label stat 2",
      "stat3Value": "Valore stat 3",
      "stat3Label": "Label stat 3",
      "ctaLabel": "Testo CTA (es: Analisi completa)",
      "ctaUrl": "URL homepage fonte (es: https://www.ft.com)",
      "websiteUrl": "URL homepage azienda"
    }
  ]
}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "sport_reportage",
          strict: true,
          schema: {
            type: "object",
            properties: {
              reportages: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    position: { type: "number" },
                    sectionNumber: { type: "string" },
                    category: { type: "string" },
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
                    ctaUrl: { type: "string" },
                    websiteUrl: { type: "string" },
                  },
                  required: ["position", "sectionNumber", "category", "startupName", "headline", "subheadline", "bodyText", "quote", "feature1", "feature2", "feature3", "feature4", "stat1Value", "stat1Label", "stat2Value", "stat2Label", "stat3Value", "stat3Label", "ctaLabel", "ctaUrl", "websiteUrl"],
                  additionalProperties: false,
                },
              },
            },
            required: ["reportages"],
            additionalProperties: false,
          },
        },
      },
    });
    const content = JSON.parse(response.choices[0].message.content as string);
    const db = await getDb();
    if (!db) throw new Error("DB not available");
    await db.delete(weeklyReportage).where(eq(weeklyReportage.section, 'sport'));
    for (let i = 0; i < Math.min(content.reportages.length, 4); i++) {
      const item = content.reportages[i];
      const imageUrl = await findReportageImage(item.startupName, item.headline, item.category);
      await db.insert(weeklyReportage).values({
        startupName: item.startupName,
        headline: item.headline,
        subheadline: item.subheadline,
        category: item.category,
        bodyText: item.bodyText,
        quote: item.quote,
        feature1: item.feature1,
        feature2: item.feature2,
        feature3: item.feature3,
        feature4: item.feature4,
        stat1Value: item.stat1Value,
        stat1Label: item.stat1Label,
        stat2Value: item.stat2Value,
        stat2Label: item.stat2Label,
        stat3Value: item.stat3Value,
        stat3Label: item.stat3Label,
        ctaLabel: item.ctaLabel,
        ctaUrl: item.ctaUrl,
        websiteUrl: item.websiteUrl,
        imageUrl,
        section: 'sport',
        weekLabel,
        sectionNumber: `0${i + 1}`,
        position: i + 1,
      });
    }
    console.log("[SportScheduler] Sport reportage saved");
  } catch (err) {
    console.error("[SportScheduler] Error generating sport reportage:", err);
  }
}

// ─── Genera Analisi di Mercato Sport ───────────────────────────────────────
export async function generateSportMarketAnalysis(): Promise<void> {
  console.log("[SportScheduler] Generating sport market analysis...");
  try {
    const weekLabel = new Date().toISOString().split("T")[0];
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Sei un senior analyst di Sport & Markets by IDEASMART. Produci analisi di mercato approfondite con dati, trend e prospettive per manager dello sport e investitori italiani.`,
        },
        {
          role: "user",
          content: `Genera 4 analisi di mercato sui temi finanziari più rilevanti questa settimana.
Copri settori diversi (es: mercati azionari, macro BCE, M&A, fintech).
Restituisci JSON:
{
  "analyses": [
    {
      "title": "Titolo analisi (max 80 caratteri)",
      "subtitle": "Sottotitolo (max 120 caratteri)",
      "category": "Settore analizzato",
      "source": "Fonte principale (es: Deloitte, KPMG, SportsPro, Forbes Sports)",
      "summary": "Sintesi dell'analisi (200-300 parole) con dati concreti e implicazioni strategiche",
      "keyInsight": "Insight principale (max 150 caratteri)",
      "dataPoint1": "Dato chiave 1 (es: 'BCE mantiene tassi al 3.5% — terzo trimestre consecutivo')",
      "dataPoint2": "Dato chiave 2",
      "dataPoint3": "Dato chiave 3",
      "marketSize": "Dimensione mercato o valore rilevante (es: '€2.1T AUM gestiti in Europa')",
      "growthRate": "Variazione o trend (es: '-12% YTD per il FTSE MIB')"
    }
  ]
}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "sport_market_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              analyses: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    subtitle: { type: "string" },
                    category: { type: "string" },
                    source: { type: "string" },
                    summary: { type: "string" },
                    keyInsight: { type: "string" },
                    dataPoint1: { type: "string" },
                    dataPoint2: { type: "string" },
                    dataPoint3: { type: "string" },
                    marketSize: { type: "string" },
                    growthRate: { type: "string" },
                  },
                  required: ["title", "subtitle", "category", "source", "summary", "keyInsight", "dataPoint1", "dataPoint2", "dataPoint3", "marketSize", "growthRate"],
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
    const content = JSON.parse(response.choices[0].message.content as string);
    const db = await getDb();
    if (!db) throw new Error("DB not available");
    await db.delete(marketAnalysis).where(eq(marketAnalysis.section, 'sport'));
    for (let i = 0; i < Math.min(content.analyses.length, 4); i++) {
      const item = content.analyses[i];
      const imageUrl = await findMarketAnalysisImage(item.title, item.category, item.source);
      await db.insert(marketAnalysis).values({
        title: item.title,
        subtitle: item.subtitle,
        category: item.category,
        source: item.source,
        summary: item.summary,
        keyInsight: item.keyInsight,
        dataPoint1: item.dataPoint1,
        dataPoint2: item.dataPoint2,
        dataPoint3: item.dataPoint3,
        marketSize: item.marketSize,
        growthRate: item.growthRate,
        imageUrl,
        section: 'sport',
        weekLabel,
        position: i + 1,
      });
    }
    console.log("[SportScheduler] Sport market analysis saved");
  } catch (err) {
    console.error("[SportScheduler] Error generating sport market analysis:", err);
  }
}
