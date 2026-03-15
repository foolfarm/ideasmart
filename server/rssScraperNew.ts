/**
 * RSS Scraper — IDEASMART
 * Recupera notizie reali dai feed RSS delle fonti certificate.
 * Nessuna notizia viene inventata: tutto deriva da feed RSS reali.
 * 
 * Flusso:
 * 1. Fetch feed RSS da tutte le fonti certificate della sezione
 * 2. Filtra articoli delle ultime 48h
 * 3. Usa LLM per selezionare i 20 più rilevanti e tradurli in italiano
 * 4. Verifica HTTP di ogni sourceUrl (URL articolo originale) prima di salvare
 * 5. Se l'URL articolo non risponde → usa homepage del dominio
 * 6. Salva nel DB con sourceUrl = URL articolo reale (o homepage come fallback)
 * 
 * PRINCIPIO FONDAMENTALE:
 * - sourceUrl = URL dell'articolo originale (link diretto all'articolo su fonte reale)
 * - sourceName = nome della testata giornalistica (coerente con sourceUrl)
 * - MAI URL inventati, MAI mismatch tra sourceName e sourceUrl
 */

import Parser from "rss-parser";
import axios from "axios";
import { invokeLLM } from "./_core/llm";
import { AI_SOURCES, MUSIC_SOURCES, STARTUP_SOURCES, getHomepageForUrl, SECTION_FALLBACKS } from "./rssSources";
import type { RssSource } from "./rssSources";

const rssParser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "IDEASMART/1.0 (news aggregator; https://ideasmart.ai)",
    "Accept": "application/rss+xml, application/xml, text/xml, */*",
  },
  customFields: {
    item: [["media:content", "mediaContent"], ["dc:creator", "creator"]],
  },
});

export interface ScrapedArticle {
  title: string;
  summary: string;
  category: string;
  sourceName: string;
  sourceUrl: string;        // URL articolo originale (link diretto alla fonte reale)
  sourceHomepage: string;   // Homepage del dominio (fallback se articolo non raggiungibile)
  publishedAt: string;
  language: "it" | "en";
}

/**
 * Recupera articoli da un singolo feed RSS
 */
async function fetchFeed(source: RssSource): Promise<Array<{
  title: string;
  content: string;
  link: string;
  pubDate: string;
  sourceName: string;
  sourceHomepage: string;
}>> {
  try {
    const feed = await rssParser.parseURL(source.feedUrl);
    const cutoff = Date.now() - 48 * 60 * 60 * 1000; // ultime 48h

    return (feed.items || [])
      .filter(item => {
        if (!item.title) return false;
        const pub = item.pubDate ? new Date(item.pubDate).getTime() : Date.now();
        return pub > cutoff;
      })
      .slice(0, 15) // max 15 articoli per fonte
      .map(item => ({
        title: (item.title || "").trim(),
        content: (item.contentSnippet || item.content || item.summary || "").slice(0, 300),
        link: item.link || source.homepage,
        pubDate: item.pubDate || new Date().toISOString(),
        sourceName: source.name,
        sourceHomepage: source.homepage,
      }));
  } catch (err) {
    console.warn(`[RssScraper] Feed non raggiungibile: ${source.feedUrl} — ${(err as Error).message}`);
    return [];
  }
}

/**
 * Recupera articoli da tutte le fonti di una sezione
 */
async function fetchAllFeeds(sources: RssSource[]): Promise<ReturnType<typeof fetchFeed> extends Promise<infer T> ? T : never> {
  const results = await Promise.allSettled(sources.map(s => fetchFeed(s)));
  const all: Awaited<ReturnType<typeof fetchFeed>> = [];
  results.forEach(r => {
    if (r.status === "fulfilled") all.push(...r.value);
  });
  console.log(`[RssScraper] Recuperati ${all.length} articoli raw da ${sources.length} fonti`);
  return all;
}

/**
 * Usa LLM per selezionare i 20 articoli più rilevanti e produrre
 * titolo + sommario in italiano, con categoria editoriale.
 */
async function selectAndTranslate(
  articles: Awaited<ReturnType<typeof fetchAllFeeds>>,
  section: "ai" | "music" | "startup"
): Promise<ScrapedArticle[]> {
  if (articles.length === 0) {
    console.warn(`[RssScraper] Nessun articolo disponibile per ${section}`);
    return [];
  }

  const sectionConfig = {
    ai: {
      label: "AI4Business",
      categories: ["Modelli Generativi", "AI Agentiva", "Big Tech", "Startup & Funding", "AI & Hardware", "Robot & AI Fisica", "AI & Startup Italiane", "Ricerca & Innovazione", "AI & Lavoro", "AI & Sicurezza", "Regolamentazione AI", "AI & Salute", "AI & Finanza"],
      instructions: "Seleziona le notizie più rilevanti per professionisti e manager italiani interessati all'AI applicata al business. Privilegia impatto concreto, finanziamenti, nuovi modelli, normative EU.",
    },
    music: {
      label: "ITsMusic",
      categories: ["Rock & Indie", "AI Music", "Industria Musicale", "Tour & Live", "Artisti Emergenti", "Streaming & Digital", "Vinile & Fisico", "Produzione Musicale", "Diritti & Copyright", "Festival & Concerti"],
      instructions: "Seleziona le notizie più rilevanti per appassionati di musica Rock, Indie e industria musicale. Privilegia artisti noti, tour, nuovi album, streaming, AI nella musica.",
    },
    startup: {
      label: "Startup News",
      categories: ["Startup Italiana", "Startup Internazionale", "Fintech", "Healthtech", "Greentech", "Edtech", "Deeptech", "SaaS & B2B", "Funding & VC", "Acquisizioni", "IPO & Mercati", "Ecosistema"],
      instructions: "Seleziona le notizie più rilevanti per founder, investitori e professionisti dell'ecosistema startup. Privilegia round di finanziamento, nuovi prodotti, unicorni, startup italiane.",
    },
  };

  const cfg = sectionConfig[section];
  const today = new Date().toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });

  // Prepara lista articoli per il prompt (max 60 per non superare il context)
  const articlesForPrompt = articles.slice(0, 60).map((a, i) => 
    `[${i}] FONTE: ${a.sourceName} | TITOLO: ${a.title} | ESTRATTO: ${a.content.slice(0, 150)}`
  ).join("\n");

  const prompt = `Sei il redattore capo di ${cfg.label} by IDEASMART. Oggi è ${today}.

Hai a disposizione questi articoli reali recuperati dai feed RSS delle nostre fonti certificate:

${articlesForPrompt}

COMPITO: Seleziona i 20 articoli più rilevanti per il nostro pubblico e per ognuno produci:
- title: titolo giornalistico in ITALIANO, incisivo (max 80 caratteri)
- summary: riassunto editoriale in ITALIANO (2-3 frasi, max 250 caratteri)  
- category: una tra [${cfg.categories.join(", ")}]
- sourceIndex: indice dell'articolo originale (numero tra parentesi quadre)

CRITERI: ${cfg.instructions}

IMPORTANTE: 
- Seleziona SOLO articoli dalla lista fornita (usa sourceIndex per riferimento)
- Traduci e adatta i titoli in italiano giornalistico
- Distribuisci le categorie in modo equilibrato
- Includi almeno 3-4 fonti diverse tra i 20 selezionati

Rispondi SOLO con JSON valido.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "Sei un redattore editoriale esperto. Rispondi sempre con JSON valido." },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "selected_articles",
          strict: true,
          schema: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    summary: { type: "string" },
                    category: { type: "string" },
                    sourceIndex: { type: "integer" },
                  },
                  required: ["title", "summary", "category", "sourceIndex"],
                  additionalProperties: false,
                },
              },
            },
            required: ["items"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content as string;
    const parsed = JSON.parse(content);

    const result: ScrapedArticle[] = [];
    for (const item of (parsed.items || []).slice(0, 20)) {
      const original = articles[item.sourceIndex];
      if (!original) continue;

      const pubDate = original.pubDate
        ? new Date(original.pubDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      result.push({
        title: item.title,
        summary: item.summary,
        category: item.category,
        sourceName: original.sourceName,
        sourceUrl: original.link,           // URL articolo originale (link diretto)
        sourceHomepage: original.sourceHomepage, // Homepage per fallback
        publishedAt: pubDate,
        language: "it",
      });
    }

    console.log(`[RssScraper] Selezionati ${result.length} articoli per ${section}`);
    return result;
  } catch (err) {
    console.error(`[RssScraper] Errore selezione LLM per ${section}:`, err);
    // Fallback: prendi i primi 20 articoli senza traduzione
    return articles.slice(0, 20).map(a => ({
      title: a.title,
      summary: a.content.slice(0, 250),
      category: section === "ai" ? "Ricerca & Innovazione" : section === "music" ? "Industria Musicale" : "Startup Internazionale",
      sourceName: a.sourceName,
      sourceUrl: a.link,           // URL articolo originale
      sourceHomepage: a.sourceHomepage,
      publishedAt: new Date(a.pubDate).toISOString().split("T")[0],
      language: "en" as const,
    }));
  }
}

/**
 * Verifica HTTP di un URL (HEAD request).
 * Restituisce true se raggiungibile (2xx o 3xx), false altrimenti.
 */
export async function verifyUrl(url: string, timeoutMs = 8000): Promise<boolean> {
  try {
    const response = await axios.head(url, {
      timeout: timeoutMs,
      maxRedirects: 3,
      validateStatus: (status) => status < 500,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; IDEASMART/1.0; +https://ideasmart.ai)",
      },
    });
    return response.status < 400;
  } catch {
    // Prova con GET se HEAD fallisce
    try {
      const response = await axios.get(url, {
        timeout: timeoutMs,
        maxRedirects: 3,
        validateStatus: (status) => status < 500,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; IDEASMART/1.0; +https://ideasmart.ai)",
        },
        responseType: "stream",
      });
      response.data.destroy(); // Non scaricare il body
      return response.status < 400;
    } catch {
      return false;
    }
  }
}

/**
 * Verifica e corregge il sourceUrl di un articolo.
 * Se l'URL è un articolo specifico (non homepage) → usa la homepage del dominio.
 * Se la homepage non risponde → usa il fallback di sezione.
 */
export async function sanitizeSourceUrl(
  url: string,
  section: "ai" | "music" | "startup"
): Promise<string> {
  // Se è già una homepage (nessun path significativo), verifica e restituisci
  try {
    const parsed = new URL(url);
    const isHomepage = parsed.pathname === "/" || parsed.pathname === "";
    
    if (isHomepage) {
      const ok = await verifyUrl(url);
      return ok ? url : SECTION_FALLBACKS[section];
    }
    
    // È un URL con path → prendi la homepage
    const homepage = getHomepageForUrl(url, section);
    const ok = await verifyUrl(homepage);
    return ok ? homepage : SECTION_FALLBACKS[section];
  } catch {
    return SECTION_FALLBACKS[section];
  }
}

// ─── Funzioni principali di scraping per sezione ─────────────────────────────

export async function scrapeAINews(): Promise<ScrapedArticle[]> {
  console.log("[RssScraper] Avvio scraping AI news...");
  const articles = await fetchAllFeeds(AI_SOURCES);
  return selectAndTranslate(articles, "ai");
}

export async function scrapeMusicNews(): Promise<ScrapedArticle[]> {
  console.log("[RssScraper] Avvio scraping Music news...");
  const articles = await fetchAllFeeds(MUSIC_SOURCES);
  return selectAndTranslate(articles, "music");
}

export async function scrapeStartupNews(): Promise<ScrapedArticle[]> {
  console.log("[RssScraper] Avvio scraping Startup news...");
  const articles = await fetchAllFeeds(STARTUP_SOURCES);
  return selectAndTranslate(articles, "startup");
}
