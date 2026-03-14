/**
 * Music Scheduler — ITsMusic by IDEASMART
 * Genera contenuti per la sezione /music: news Rock, Indie e AI Music
 * Usa la stessa struttura degli scheduler AI ma con focus musicale
 */
import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { newsItems, dailyEditorial, startupOfDay, weeklyReportage, marketAnalysis } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { findNewsImage, findEditorialImage, findStartupImage, findReportageImage, findMarketAnalysisImage } from "./stockImages";

// ─── Genera 20 news musicali ──────────────────────────────────────────────────
export async function generateMusicNews(): Promise<void> {
  console.log("[MusicScheduler] Generating music news...");
  try {
    const today = new Date().toLocaleDateString("it-IT", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    const weekLabel = new Date().toISOString().split("T")[0];

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Sei un giornalista musicale esperto che scrive per ITsMusic by IDEASMART, una testata italiana specializzata in Rock, Indie e AI Music. 
Scrivi in italiano, con tono editoriale professionale ma appassionato.
Genera notizie credibili e realistiche sull'industria musicale globale e italiana.`,
        },
        {
          role: "user",
          content: `Genera 20 notizie musicali per oggi, ${today}.
Focus su: Rock internazionale, Indie italiano e internazionale, AI Music e tecnologia musicale, industria discografica, streaming, concerti e tour, artisti emergenti, label e diritti musicali.

Restituisci un JSON con questa struttura:
{
  "news": [
    {
      "title": "Titolo della notizia (max 80 caratteri)",
      "summary": "Riassunto in 2-3 frasi (max 200 caratteri)",
      "category": "Categoria (es: Rock, Indie Italia, AI Music, Industria, Tour & Live, Streaming, Label & Diritti)",
      "sourceUrl": "URL fonte reale (Billboard, Rolling Stone, NME, Pitchfork, Il Sole 24 Ore, ecc.)",
      "sourceName": "Nome fonte"
    }
  ]
}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "music_news",
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

    // Rimuovi le news musicali precedenti
    await db.delete(newsItems).where(eq(newsItems.section, 'music'));

    // Inserisci le nuove con immagini
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
        section: 'music',
        weekLabel,
        position: i + 1,
        publishedAt: new Date().toISOString(),
      });
    }

    console.log(`[MusicScheduler] Saved ${Math.min(content.news.length, 20)} music news`);
  } catch (err) {
    console.error("[MusicScheduler] Error generating music news:", err);
  }
}

// ─── Genera editoriale musicale ───────────────────────────────────────────────
export async function generateMusicEditorial(): Promise<void> {
  console.log("[MusicScheduler] Generating music editorial...");
  try {
    const today = new Date().toLocaleDateString("it-IT", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    const dateLabel = new Date().toISOString().split("T")[0];

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Sei il direttore editoriale di ITsMusic by IDEASMART, testata italiana su Rock, Indie e AI Music.
Scrivi editoriali profondi, appassionati e analitici sull'industria musicale. Tono: editoriale, autorevole, appassionato.`,
        },
        {
          role: "user",
          content: `Scrivi l'editoriale musicale di oggi, ${today}.
Analizza un tema rilevante nel mondo Rock, Indie o AI Music: potrebbe essere un trend dell'industria, un artista emergente, l'impatto dell'AI sulla musica, il ritorno del vinile, la crisi dello streaming, ecc.

Restituisci JSON:
{
  "title": "Titolo dell'editoriale (max 80 caratteri)",
  "subtitle": "Sottotitolo (max 120 caratteri)",
  "keyTrend": "Trend chiave (max 50 caratteri)",
  "body": "Corpo dell'editoriale in 4-5 paragrafi separati da \\n\\n (min 400 parole)",
  "authorNote": "Nota dell'autore (max 100 caratteri)"
}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "music_editorial",
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

    const content = JSON.parse(response.choices[0].message.content as string);
    const imageUrl = await findEditorialImage(content.title, content.keyTrend);
    const db = await getDb();
    if (!db) throw new Error("DB not available");

    await db.insert(dailyEditorial).values({
      title: content.title,
      subtitle: content.subtitle,
      keyTrend: content.keyTrend,
      body: content.body,
      authorNote: content.authorNote,
      imageUrl,
      section: 'music',
      dateLabel,
    });

    console.log("[MusicScheduler] Music editorial saved");
  } catch (err) {
    console.error("[MusicScheduler] Error generating music editorial:", err);
  }
}

// ─── Genera Artista della Settimana ───────────────────────────────────────────
export async function generateArtistOfWeek(): Promise<void> {
  console.log("[MusicScheduler] Generating artist of the week...");
  try {
    const today = new Date().toLocaleDateString("it-IT", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    const dateLabel = new Date().toISOString().split("T")[0];

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Sei un critico musicale esperto che scrive per ITsMusic by IDEASMART.
Scegli artisti emergenti o in ascesa nel mondo Rock, Indie o AI Music. Scrivi in italiano.`,
        },
        {
          role: "user",
          content: `Scegli l'Artista della Settimana per oggi, ${today}.
Può essere un artista emergente italiano o internazionale nel mondo Rock, Indie o AI Music.

Restituisci JSON:
{
  "name": "Nome artista/band",
  "tagline": "Tagline (max 80 caratteri)",
  "description": "Descrizione (max 300 caratteri)",
  "category": "Genere (Rock, Indie, AI Music, Indie Rock, ecc.)",
  "country": "Paese di origine",
  "foundedYear": "Anno di inizio carriera",
  "funding": "Notorietà/riconoscimenti principali",
  "whyToday": "Perché è rilevante ora (max 150 caratteri)",
  "websiteUrl": "URL sito ufficiale o social principale"
}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "artist_of_week",
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
            },
            required: ["name", "tagline", "description", "category", "country", "foundedYear", "funding", "whyToday", "websiteUrl"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = JSON.parse(response.choices[0].message.content as string);
    const imageUrl = await findStartupImage(content.name, content.category, content.country);
    const db = await getDb();
    if (!db) throw new Error("DB not available");

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
      imageUrl,
      section: 'music',
      dateLabel,
    });

    console.log("[MusicScheduler] Artist of the week saved:", content.name);
  } catch (err) {
    console.error("[MusicScheduler] Error generating artist of the week:", err);
  }
}

// ─── Genera 4 Reportage Musicali ─────────────────────────────────────────────
export async function generateMusicReportage(): Promise<void> {
  console.log("[MusicScheduler] Generating music reportage...");
  try {
    const weekLabel = `Settimana del ${new Date().toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Sei un giornalista musicale investigativo che scrive reportage approfonditi per ITsMusic by IDEASMART.
Scrivi in italiano, con tono editoriale professionale. Focus su Rock, Indie e AI Music.`,
        },
        {
          role: "user",
          content: `Genera 4 reportage musicali approfonditi per la ${weekLabel}.
Ogni reportage deve riguardare un artista, una label, un festival, una tecnologia musicale o un trend dell'industria.

Restituisci JSON:
{
  "reportage": [
    {
      "position": 1,
      "sectionNumber": "01",
      "category": "Categoria (es: Rock & Indie, AI Music, Label & Industria, Festival & Live)",
      "startupName": "Nome artista/label/festival/progetto",
      "headline": "Titolo del reportage (max 80 caratteri)",
      "subheadline": "Sottotitolo (max 120 caratteri)",
      "bodyText": "Corpo del reportage (min 200 parole)",
      "quote": "Citazione rilevante",
      "feature1": "Caratteristica chiave 1",
      "feature2": "Caratteristica chiave 2",
      "feature3": "Caratteristica chiave 3",
      "feature4": "Caratteristica chiave 4",
      "stat1Value": "Valore statistico 1",
      "stat1Label": "Etichetta stat 1",
      "stat2Value": "Valore statistico 2",
      "stat2Label": "Etichetta stat 2",
      "stat3Value": "Valore statistico 3",
      "stat3Label": "Etichetta stat 3",
      "ctaLabel": "Scopri di più →",
      "ctaUrl": "URL rilevante",
      "websiteUrl": "URL sito ufficiale"
    }
  ]
}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "music_reportage",
          strict: true,
          schema: {
            type: "object",
            properties: {
              reportage: {
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
            required: ["reportage"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = JSON.parse(response.choices[0].message.content as string);
    const db = await getDb();
    if (!db) throw new Error("DB not available");

    // Rimuovi i reportage musicali della settimana precedente
    await db.delete(weeklyReportage).where(eq(weeklyReportage.section, 'music'));

    for (const item of content.reportage.slice(0, 4)) {
      const imageUrl = await findReportageImage(item.startupName, item.headline, item.category);
      await db.insert(weeklyReportage).values({
        position: item.position,
        sectionNumber: item.sectionNumber,
        category: item.category,
        startupName: item.startupName,
        headline: item.headline,
        subheadline: item.subheadline,
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
        weekLabel,
        imageUrl,
        section: 'music',
      });
    }

    console.log("[MusicScheduler] Music reportage saved");
  } catch (err) {
    console.error("[MusicScheduler] Error generating music reportage:", err);
  }
}

// ─── Genera 4 Analisi di Mercato Musicale ────────────────────────────────────
export async function generateMusicMarketAnalysis(): Promise<void> {
  console.log("[MusicScheduler] Generating music market analysis...");
  try {
    const weekLabel = new Date().toISOString().split("T")[0];

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Sei un analista dell'industria musicale che scrive per ITsMusic by IDEASMART.
Analizza trend di mercato, dati di streaming, vendite di vinile, mercato dei concerti, impatto dell'AI sulla musica. Scrivi in italiano.`,
        },
        {
          role: "user",
          content: `Genera 4 analisi di mercato musicale per questa settimana.
Focus su: streaming (Spotify, Apple Music, YouTube Music), mercato del vinile, live music e concerti, AI Music e tecnologia, label e diritti musicali.

Restituisci JSON:
{
  "analyses": [
    {
      "title": "Titolo analisi (max 80 caratteri)",
      "subtitle": "Sottotitolo (max 100 caratteri)",
      "category": "Categoria (Streaming, Vinile & Fisico, Live Music, AI Music, Label & Diritti)",
      "source": "Fonte (IFPI, Spotify, Billboard, Luminate, ecc.)",
      "summary": "Riassunto (max 200 caratteri)",
      "keyInsight": "Insight chiave (max 150 caratteri)",
      "dataPoint1": "Dato statistico principale",
      "dataPoint2": "Secondo dato statistico",
      "dataPoint3": "Terzo dato statistico",
      "marketSize": "Dimensione mercato",
      "growthRate": "Tasso di crescita"
    }
  ]
}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "music_market_analysis",
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

    // Rimuovi le analisi musicali precedenti
    await db.delete(marketAnalysis).where(eq(marketAnalysis.section, 'music'));

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
        section: 'music',
        weekLabel,
        position: i + 1,
      });
    }

    console.log("[MusicScheduler] Music market analysis saved");
  } catch (err) {
    console.error("[MusicScheduler] Error generating music market analysis:", err);
  }
}
