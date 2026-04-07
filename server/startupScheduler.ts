/**
 * Startup Scheduler — Startup News by IDEASMART
 * Genera contenuti per la sezione /startup: news, editoriale, startup della settimana, reportage, analisi
 * Usa la stessa struttura degli scheduler AI e Music ma con focus sulle startup italiane e internazionali
 */
import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { newsItems, dailyEditorial, startupOfDay, weeklyReportage, marketAnalysis } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { findNewsImage, findEditorialImage, findStartupImage, findReportageImage, findMarketAnalysisImage } from "./stockImages";
import { generateVerifyHash } from "./verify";

// ─── Genera 20 news startup ───────────────────────────────────────────────────
export async function generateStartupNews(): Promise<void> {
  console.log("[StartupScheduler] Generating startup news...");
  try {
    const today = new Date().toLocaleDateString("it-IT", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    const weekLabel = new Date().toISOString().split("T")[0];
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Sei un giornalista specializzato in startup e innovazione che scrive per Startup News by IDEASMART, una testata italiana di riferimento per l'ecosistema startup.
Scrivi in italiano, con tono editoriale professionale e autorevole.
Genera notizie credibili e realistiche sull'ecosistema startup italiano e internazionale.`,
        },
        {
          role: "user",
          content: `Genera 20 notizie sulle startup per oggi, ${today}.
Focus su: startup italiane e internazionali, round di finanziamento, acquisizioni, IPO, nuovi prodotti, espansioni internazionali, ecosistema VC, acceleratori, unicorni, exit, fallimenti notevoli, trend di settore.
Categorie da usare: Startup Italiana, Startup Internazionale, Fintech, Healthtech, Greentech, Edtech, Foodtech, Proptech, Deeptech, SaaS & B2B, E-commerce, Mobility, Funding & VC, Acquisizioni, IPO & Mercati, Ecosistema.
Restituisci un JSON con questa struttura:
{
  "news": [
    {
      "title": "Titolo della notizia (max 80 caratteri)",
      "summary": "Riassunto in 2-3 frasi (max 200 caratteri)",
      "category": "Categoria (dalla lista sopra)",
      "sourceUrl": "URL homepage del sito sorgente (es. https://techcrunch.com, https://www.startupitalia.eu, https://www.ilsole24ore.com) — NON inventare URL di articoli specifici",
      "sourceName": "Nome fonte"
    }
  ]
}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "startup_news",
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
    // Rimuovi le news startup precedenti
    await db.delete(newsItems).where(eq(newsItems.section, 'startup'));
    // Inserisci le nuove con immagini
    for (let i = 0; i < Math.min(content.news.length, 20); i++) {
      const item = content.news[i];
      const imageUrl = await findNewsImage(item.title, item.category);
      const verifyHash = generateVerifyHash(item.title, item.summary, item.sourceUrl, new Date());
      await db.insert(newsItems).values({
        title: item.title,
        summary: item.summary,
        category: item.category,
        sourceUrl: item.sourceUrl,
        sourceName: item.sourceName,
        imageUrl: imageUrl || null,
        section: 'startup',
        weekLabel,
        position: i + 1,
        publishedAt: new Date().toISOString(),
        verifyHash,
      });
    }
    console.log(`[StartupScheduler] Saved ${Math.min(content.news.length, 20)} startup news`);
  } catch (err) {
    console.error("[StartupScheduler] Error generating startup news:", err);
  }
}

// ─── Genera editoriale startup ────────────────────────────────────────────────
export async function generateStartupEditorial(): Promise<void> {
  console.log("[StartupScheduler] Generating startup editorial...");
  try {
    const today = new Date().toLocaleDateString("it-IT", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    const dateLabel = new Date().toISOString().split("T")[0];
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Sei il direttore editoriale di Startup News by IDEASMART. Scrivi editoriali profondi e autorevoli sull'ecosistema startup italiano e internazionale. Tono professionale, visionario, con dati e analisi concrete.`,
        },
        {
          role: "user",
          content: `Scrivi l'editoriale del giorno per ${today}.
Scegli un tema rilevante nell'ecosistema startup (es: stato del VC italiano, trend deeptech, sfide delle startup B2B, crescita dell'ecosistema Sud Europa, AI e startup, ecc.).
Restituisci JSON:
{
  "title": "Titolo editoriale (max 80 caratteri)",
  "subtitle": "Sottotitolo (max 120 caratteri)",
  "body": "Corpo dell'editoriale (400-600 parole, in italiano, tono autorevole e analitico)",
  "keyTrend": "Il trend chiave discusso (max 50 caratteri)",
  "authorNote": "Nota del direttore (max 100 caratteri)"
}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "startup_editorial",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              subtitle: { type: "string" },
              body: { type: "string" },
              keyTrend: { type: "string" },
              authorNote: { type: "string" },
            },
            required: ["title", "subtitle", "body", "keyTrend", "authorNote"],
            additionalProperties: false,
          },
        },
      },
    });
    const content = JSON.parse(response.choices[0].message.content as string);
    const db = await getDb();
    if (!db) throw new Error("DB not available");
    const imageUrl = await findEditorialImage(content.title, content.keyTrend);
    await db.delete(dailyEditorial).where(eq(dailyEditorial.section, 'startup'));
    await db.insert(dailyEditorial).values({
      title: content.title,
      subtitle: content.subtitle,
      body: content.body,
      keyTrend: content.keyTrend,
      authorNote: content.authorNote,
      imageUrl,
      section: 'startup',
      dateLabel,
    });
    console.log("[StartupScheduler] Startup editorial saved");
  } catch (err) {
    console.error("[StartupScheduler] Error generating startup editorial:", err);
  }
}

// ─── Genera Startup della Settimana ──────────────────────────────────────────
export async function generateStartupOfWeek(): Promise<void> {
  console.log("[StartupScheduler] Generating startup of the week...");
  try {
    const today = new Date().toLocaleDateString("it-IT", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    const dateLabel = new Date().toISOString().split("T")[0];
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Sei un analista di startup per IDEASMART. Selezioni la startup più interessante della settimana tra quelle italiane e internazionali, con focus su innovazione, impatto e potenziale di crescita.`,
        },
        {
          role: "user",
          content: `Seleziona la Startup della Settimana per ${today}.
Scegli una startup reale (italiana o internazionale) che si è distinta questa settimana per un round di finanziamento, lancio di prodotto, espansione, o impatto innovativo.
Restituisci JSON:
{
  "name": "Nome startup",
  "tagline": "Tagline (max 100 caratteri)",
  "description": "Descrizione dettagliata (200-300 parole)",
  "category": "Categoria (es: Fintech, Healthtech, SaaS & B2B, ecc.)",
  "country": "Paese di origine",
  "foundedYear": "Anno di fondazione",
  "funding": "Totale funding raccolto (es: €5M, $50M, N/D)",
  "whyToday": "Perché è la startup della settimana (100-150 parole)",
  "websiteUrl": "URL sito web",
  "aiScore": 85
}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "startup_of_week",
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
              aiScore: { type: "number" },
            },
            required: ["name", "tagline", "description", "category", "country", "foundedYear", "funding", "whyToday", "websiteUrl", "aiScore"],
            additionalProperties: false,
          },
        },
      },
    });
    const content = JSON.parse(response.choices[0].message.content as string);
    const db = await getDb();
    if (!db) throw new Error("DB not available");
    const imageUrl = await findStartupImage(content.name, content.category, content.tagline);
    await db.delete(startupOfDay).where(eq(startupOfDay.section, 'startup'));
    await db.insert(startupOfDay).values({
      name: content.name,
      tagline: content.tagline,
      description: content.description,
      category: content.category,
      country: content.country,
      foundedYear: content.foundedYear,
      funding: content.funding,
      whyToday: content.whyToday,
      websiteUrl: content.websiteUrl,
      aiScore: content.aiScore,
      imageUrl,
      section: 'startup',
      dateLabel,
    });
    console.log("[StartupScheduler] Startup of the week saved");
  } catch (err) {
    console.error("[StartupScheduler] Error generating startup of the week:", err);
  }
}

// ─── Genera Reportage Startup ─────────────────────────────────────────────────
export async function generateStartupReportage(): Promise<void> {
  console.log("[StartupScheduler] Generating startup reportage...");
  try {
    const weekLabel = new Date().toISOString().split("T")[0];
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Sei un giornalista investigativo specializzato in startup per IDEASMART. Scrivi reportage approfonditi su startup italiane e internazionali, con analisi del business model, team, mercato e prospettive.`,
        },
        {
          role: "user",
          content: `Genera 4 reportage approfonditi su startup italiane o internazionali rilevanti questa settimana.
Ogni reportage deve coprire una startup diversa con settori diversi (es: Fintech, Healthtech, Deeptech, SaaS).
Restituisci JSON:
{
  "reportages": [
    {
      "startupName": "Nome startup",
      "headline": "Titolo del reportage (max 80 caratteri)",
      "subheadline": "Sottotitolo (max 120 caratteri)",
      "category": "Categoria startup",
      "country": "Paese",
      "foundedYear": "Anno",
      "funding": "Funding totale",
      "teamSize": "Dimensione team (es: 15-30 persone)",
      "body": "Corpo del reportage (500-700 parole, in italiano)",
      "keyMetric": "Metrica chiave (es: 10.000 utenti attivi)",
      "challenge": "Sfida principale affrontata (max 100 caratteri)",
      "opportunity": "Opportunità di mercato (max 100 caratteri)",
      "quote": "Citazione del founder (inventata ma credibile)",
      "quoteAuthor": "Nome e ruolo del founder",
      "websiteUrl": "URL sito web",
      "tags": ["tag1", "tag2", "tag3"]
    }
  ]
}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "startup_reportage",
          strict: true,
          schema: {
            type: "object",
            properties: {
              reportages: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    startupName: { type: "string" },
                    headline: { type: "string" },
                    subheadline: { type: "string" },
                    category: { type: "string" },
                    country: { type: "string" },
                    foundedYear: { type: "string" },
                    funding: { type: "string" },
                    teamSize: { type: "string" },
                    body: { type: "string" },
                    keyMetric: { type: "string" },
                    challenge: { type: "string" },
                    opportunity: { type: "string" },
                    quote: { type: "string" },
                    quoteAuthor: { type: "string" },
                    websiteUrl: { type: "string" },
                    tags: { type: "array", items: { type: "string" } },
                  },
                  required: ["startupName", "headline", "subheadline", "category", "country", "foundedYear", "funding", "teamSize", "body", "keyMetric", "challenge", "opportunity", "quote", "quoteAuthor", "websiteUrl", "tags"],
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
    await db.delete(weeklyReportage).where(eq(weeklyReportage.section, 'startup'));
    for (let i = 0; i < Math.min(content.reportages.length, 4); i++) {
      const item = content.reportages[i];
      const imageUrl = await findReportageImage(item.startupName, item.headline, item.category);
      // Mappa i campi al formato della tabella weeklyReportage
      await db.insert(weeklyReportage).values({
        startupName: item.startupName,
        headline: item.headline,
        subheadline: item.subheadline,
        category: item.category,
        bodyText: item.body,
        quote: `"${item.quote}" — ${item.quoteAuthor}`,
        feature1: item.keyMetric,
        feature2: item.challenge,
        feature3: item.opportunity,
        stat1Value: item.funding,
        stat1Label: 'Funding',
        stat2Value: item.teamSize,
        stat2Label: 'Team',
        stat3Value: item.country,
        stat3Label: 'Paese',
        ctaLabel: 'Visita il sito',
        ctaUrl: item.websiteUrl,
        websiteUrl: item.websiteUrl,
        imageUrl,
        section: 'startup',
        weekLabel,
        sectionNumber: `0${i + 1}`,
        position: i + 1,
      });
    }
    console.log("[StartupScheduler] Startup reportage saved");
  } catch (err) {
    console.error("[StartupScheduler] Error generating startup reportage:", err);
  }
}

// ─── Genera Analisi di Mercato Startup ───────────────────────────────────────
export async function generateStartupMarketAnalysis(): Promise<void> {
  console.log("[StartupScheduler] Generating startup market analysis...");
  try {
    const weekLabel = new Date().toISOString().split("T")[0];
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Sei un analista di mercato per IDEASMART. Produci analisi di mercato approfondite sui settori più caldi per le startup, con dati, trend e prospettive di investimento.`,
        },
        {
          role: "user",
          content: `Genera 4 analisi di mercato sui settori startup più rilevanti questa settimana.
Copri settori diversi (es: Fintech, AI & Startup, Greentech, Healthtech).
Restituisci JSON:
{
  "analyses": [
    {
      "title": "Titolo analisi (max 80 caratteri)",
      "subtitle": "Sottotitolo (max 120 caratteri)",
      "category": "Settore analizzato",
      "source": "Fonte principale (es: Dealroom, Crunchbase, PitchBook, Startup Genome)",
      "summary": "Sintesi dell'analisi (200-300 parole)",
      "keyInsight": "Insight principale (max 150 caratteri)",
      "dataPoint1": "Dato chiave 1 (es: €2.3B investiti nel Q1 2025)",
      "dataPoint2": "Dato chiave 2",
      "dataPoint3": "Dato chiave 3",
      "marketSize": "Dimensione mercato (es: €45B nel 2025)",
      "growthRate": "Tasso di crescita (es: +23% YoY)"
    }
  ]
}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "startup_market_analysis",
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
    await db.delete(marketAnalysis).where(eq(marketAnalysis.section, 'startup'));
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
        section: 'startup',
        weekLabel,
        position: i + 1,
      });
    }
    console.log("[StartupScheduler] Startup market analysis saved");
  } catch (err) {
    console.error("[StartupScheduler] Error generating startup market analysis:", err);
  }
}
