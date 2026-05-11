/**
 * RSS Scraper — Proof Press
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
import { invokeLLMFast, stripJsonBackticks } from "./_core/llm";
import { AI_SOURCES, STARTUP_SOURCES, DEALROOM_SOURCES, getHomepageForUrl, SECTION_FALLBACKS } from "./rssSources";
import type { RssSource } from "./rssSources";

const rssParser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "Proof Press/1.0 (news aggregator; https://proofpress.ai)",
    "Accept": "application/rss+xml, application/xml, text/xml, */*"
  },
  customFields: {
    item: [["media:content", "mediaContent"], ["dc:creator", "creator"]]
  }
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
  videoUrl?: string;        // URL embed YouTube/Vimeo se disponibile nel feed RSS
}

/**
 * Recupera articoli da un singolo feed RSS
 */
/**
 * Estrae l'URL embed di YouTube/Vimeo da un item RSS se disponibile
 */
function extractVideoUrl(item: Record<string, unknown>): string | undefined {
  // YouTube feed: <yt:videoId> o link youtube.com
  const ytId = (item as Record<string, unknown>)["yt:videoId"] as string | undefined;
  if (ytId) return `https://www.youtube.com/embed/${ytId}`;
  // media:content con type video
  const media = (item as Record<string, unknown>)["mediaContent"] as Record<string, unknown> | undefined;
  if (media) {
    const mediaType = (media["$"] as Record<string, string> | undefined)?.["type"] || "";
    const mediaUrl = (media["$"] as Record<string, string> | undefined)?.["url"] || "";
    if (mediaType.startsWith("video") && mediaUrl) return mediaUrl;
  }
  // Link YouTube diretto nell'URL articolo
  const link = (item as Record<string, unknown>)["link"] as string | undefined;
  const ytMatch = link?.match(/youtube\.com\/watch\?v=([\w-]+)/) || link?.match(/youtu\.be\/([\w-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  return undefined;
}

async function fetchFeed(source: RssSource): Promise<Array<{
  title: string;
  content: string;
  link: string;
  pubDate: string;
  sourceName: string;
  sourceHomepage: string;
  videoUrl?: string;
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
        videoUrl: extractVideoUrl(item as unknown as Record<string, unknown>)
      }));
  } catch (err) {
    console.warn(`[RssScraper] Feed non raggiungibile: ${source.feedUrl} — ${(err as Error).message}`);
    return [];
  }
}

/**
 * Esegue un array di task asincroni con concorrenza limitata.
 * Previene EMFILE (too many open files) limitando le connessioni HTTP simultanee.
 */
async function pLimit<T>(tasks: Array<() => Promise<T>>, concurrency: number): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = [];
  let idx = 0;
  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      try {
        results[i] = { status: 'fulfilled', value: await tasks[i]() };
      } catch (reason) {
        results[i] = { status: 'rejected', reason };
      }
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, worker);
  await Promise.all(workers);
  return results;
}

/**
 * Recupera articoli da tutte le fonti di una sezione.
 * Usa un concurrency limiter (max 5 fetch parallele) per evitare EMFILE.
 */
async function fetchAllFeeds(sources: RssSource[]): Promise<ReturnType<typeof fetchFeed> extends Promise<infer T> ? T : never> {
  // MAX 5 connessioni HTTP simultanee per evitare EMFILE (too many open files)
  const CONCURRENCY = 5;
  const tasks = sources.map(s => () => fetchFeed(s));
  const results = await pLimit(tasks, CONCURRENCY);
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
  section: "ai" | "startup" | "dealroom"
): Promise<ScrapedArticle[]> {
  if (articles.length === 0) {
    console.warn(`[RssScraper] Nessun articolo disponibile per ${section}`);
    return [];
  }

  const sectionConfig = {
    ai: {
      label: "AI News",
      categories: ["Modelli Generativi", "AI Agentiva", "Big Tech", "Startup & Funding", "AI & Hardware", "Robot & AI Fisica", "AI & Startup Italiane", "Ricerca & Innovazione", "AI & Lavoro", "AI & Sicurezza", "Regolamentazione AI", "AI & Salute", "AI & Finanza"],
      instructions: "Seleziona le notizie più rilevanti per professionisti e manager italiani interessati all'AI applicata al business. Privilegia impatto concreto, finanziamenti, nuovi modelli, normative EU."
    },
    startup: {
      label: "Startup News",
      categories: ["Startup Italiana", "Startup Internazionale", "Fintech", "Healthtech", "Greentech", "Edtech", "Deeptech", "SaaS & B2B", "Funding & VC", "Acquisizioni", "IPO & Mercati", "Ecosistema"],
      instructions: "Seleziona le notizie più rilevanti per founder, investitori e professionisti dell'ecosistema startup. Privilegia round di finanziamento, nuovi prodotti, unicorni, startup italiane."
    },

    dealroom: {
      label: "DEALROOM — Funding & VC",
      categories: ["Seed Round", "Series A", "Series B", "Series C+", "Venture Capital Italia", "Venture Capital Europa", "Venture Capital Global", "M&A & Acquisizioni", "Exit & IPO", "VC Fund", "Deal Italiano", "Deal Europeo", "Deal Globale", "Corporate VC", "Angel & Pre-seed"],
      instructions: "SEI UN FILTRO DEAL FINANZIARIO ULTRA-SELETTIVO. Seleziona SOLO notizie dove una TRANSAZIONE FINANZIARIA è avvenuta o sta per avvenire. Una transazione è ESCLUSIVAMENTE: 1) Un round di finanziamento (seed, Series A/B/C/D, growth) con importo e/o investitore nominato, 2) Un'acquisizione M&A con acquirente e target nominati, 3) Una IPO o quotazione in borsa, 4) La chiusura di un nuovo fondo VC/PE con importo, 5) Un investimento corporate venture con cifra. PAROLE CHIAVE OBBLIGATORIE nel titolo o descrizione: raccoglie, chiude round, finanziamento, investimento, acquisisce, acquisizione, IPO, quotazione, Series A/B/C, seed round, funding, raises, acquires, merger, fund close. ESCLUDI TUTTO IL RESTO: notizie di crescita aziendale senza deal (es. 'ricavi a 70M'), notizie su cucina/cibo/export, notizie su metalli/olimpiadi/sport, notizie su governance/banche/commissari, notizie su politica industriale, notizie su AI/tech senza round, libri/opinioni, guide prodotto. TEST: c'è un VERBO DI TRANSAZIONE (raccoglie, acquisisce, chiude fondo, va in IPO)? Se NO → SCARTA. PRIORITÀ: 1) Deal italiani, 2) Deal europei, 3) Deal globali >50M$."
    }
  } as const;

  const cfg = sectionConfig[section];
  const today = new Date().toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });

  // ITALIA FIRST: ordina gli articoli mettendo le fonti italiane in cima.
  // Identifica articoli italiani dal dominio .it o dal nome fonte noto.
  const itDomainPatterns = [
    ".it/", "ansa.it", "corriere.it", "repubblica.it", "ilpost.it",
    "sole24ore", "ilsole24ore", "wired.it", "forbes.it", "gazzetta.it",
    "agendadigitale", "digital4", "innovationpost", "corrierecomunicazioni",
    "punto-informatico", "tomshw.it", "hwupgrade", "ilfattoquotidiano",
    "lastampa", "agi.it", "tgcom24", "sky.it", "rainews", "adnkronos",
    "askanews", "italpress", "ilgiornale", "libero.it", "panorama.it",
    "espresso.it", "linkiesta", "startupitalia", "economyup", "milanofinanza",
    "borsaitaliana", "smartworld", "hdblog", "everyeye", "gamereactor.it"
  ];
  const isItalian = (a: { sourceName: string; link: string }) =>
    itDomainPatterns.some(p => a.link.toLowerCase().includes(p) || a.sourceName.toLowerCase().includes(p.replace(".it/", "").replace(".it", "")));
  const italianArticles = articles.filter(isItalian);
  const internationalArticles = articles.filter(a => !isItalian(a));
  // Componi: prima gli italiani, poi gli internazionali, max 60 totali
  const sortedArticles = [...italianArticles, ...internationalArticles].slice(0, 60);
  const italianCount = italianArticles.length;
  console.log(`[RssScraper] Italia first: ${italianCount} italiani + ${sortedArticles.length - italianCount} internazionali per ${section}`);

  // Prepara lista articoli per il prompt (max 60 per non superare il context)
  const articlesForPrompt = sortedArticles.map((a, i) => 
    `[${i}]${i < italianCount ? " 🇮🇹" : ""} FONTE: ${a.sourceName} | TITOLO: ${a.title} | ESTRATTO: ${a.content.slice(0, 150)}`
  ).join("\n");

  const prompt = `Sei il redattore capo di ${cfg.label} by Proof Press. Oggi è ${today}.

Hai a disposizione questi articoli reali recuperati dai feed RSS delle nostre fonti certificate:

${articlesForPrompt}

COMPITO: Seleziona i 20 articoli più rilevanti per il nostro pubblico e per ognuno produci:
- title: titolo giornalistico in ITALIANO, incisivo (max 80 caratteri) — OBBLIGATORIO in italiano, mai in inglese
- summary: articolo giornalistico completo in ITALIANO (5-8 frasi, 600-900 caratteri) — OBBLIGATORIO in italiano, mai in inglese
- category: una tra [${cfg.categories.join(", ")}]
- sourceIndex: indice dell'articolo originale (numero tra parentesi quadre)

CRITERI: ${cfg.instructions}

REGOLE FONDAMENTALI PER IL CAMPO summary — STILE GIORNALISTICO PROFESSIONALE:
Scrivi ogni summary come un articolo giornalistico completo, con il tono del Corriere della Sera o del Financial Times. NON descrivere l'articolo sorgente: RACCONTA la notizia direttamente.

VIETATO iniziare con queste formule: "L'articolo", "Questo articolo", "Il pezzo", "Lo studio", "La ricerca", "Il report", "Il documento", "Il post", "La guida", "Il tutorial".

STRUTTURA OBBLIGATORIA di ogni summary:
1. APERTURA (1-2 frasi): il fatto chiave con soggetto, verbo, numeri concreti. Es: "OpenAI ha chiuso un round da 40 miliardi di dollari, la più grande raccolta di capitale privato nella storia della Silicon Valley."
2. CONTESTO (1-2 frasi): perché questo fatto è rilevante ora, cosa lo ha preceduto o reso possibile.
3. IMPATTO BUSINESS (1-2 frasi): cosa cambia per aziende, investitori, professionisti — con dati o nomi specifici quando disponibili.
4. PROSPETTIVA (1 frase): una domanda aperta, un rischio, un'opportunità o una previsione credibile.

VARIA gli incipit tra questi pattern (non usare sempre lo stesso):
- Inizio con soggetto + azione: "Google ha annunciato...", "Il Parlamento Europeo ha approvato..."
- Inizio con dato numerico: "Quaranta miliardi di dollari in un solo round.", "Il 73% dei manager italiani..."
- Inizio con contesto di mercato: "Mentre il settore AI attraversa...", "In un mercato che vale già..."
- Inizio con il paradosso o la tensione: "Più potente, ma anche più costoso.", "La promessa è ambiziosa."
- Inizio con il nome del protagonista: "Elon Musk torna a scommettere su...", "Anthropic ha scelto..."

IMPORTANTE — ITALIA FIRST:
- Gli articoli marcati 🇮🇹 provengono da fonti italiane: PRIVILEGIALI nella selezione.
- Includi almeno 8-10 articoli da fonti italiane (🇮🇹) nei 20 selezionati, se disponibili.
- Seleziona SOLO articoli dalla lista fornita (usa sourceIndex per riferimento)
- Traduci e adatta i titoli in italiano giornalistico — TUTTI i titoli devono essere in ITALIANO, anche se la fonte è in inglese
- LINGUA OBBLIGATORIA: titoli e summary SEMPRE in italiano, mai in inglese
- Distribuisci le categorie in modo equilibrato
- Includi almeno 3-4 fonti diverse tra i 20 selezionati

Rispondi SOLO con JSON valido.`;

  try {
    const response = await invokeLLMFast({
      messages: [
        { role: "system", content: "Sei un giornalista senior italiano con 20 anni di esperienza al Corriere della Sera e al Financial Times. Scrivi notizie dirette, concrete, con fatti e numeri. Non descrivi mai gli articoli: racconti le notizie. Il tuo stile è autorevole, preciso, mai burocratico. Rispondi sempre con JSON valido. IMPORTANTE: tutti i titoli e i summary devono essere scritti in ITALIANO, mai in inglese, anche se la fonte è in inglese." },
        { role: "user", content: prompt }
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
                    sourceIndex: { type: "integer" }
                  },
                  required: ["title", "summary", "category", "sourceIndex"],
                  additionalProperties: false
                }
              }
            },
            required: ["items"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content as string;
    let parsed: { items?: Array<{ title: string; summary: string; category: string; sourceIndex: number }> };
    try {
      parsed = JSON.parse(stripJsonBackticks(content));
    } catch (jsonErr) {
      // Secondo tentativo: prompt semplificato con meno articoli per ridurre la probabilità di JSON malformato
      console.warn(`[RssScraper] JSON malformato al primo tentativo per ${section}, ritento con prompt semplificato...`);
      const shortList = sortedArticles.slice(0, 20).map((a, i) =>
        `[${i}] ${a.sourceName}: ${a.title}`
      ).join("\n");
      const retryResponse = await invokeLLMFast({
        messages: [
          { role: "system", content: "Sei un redattore. Rispondi SOLO con JSON valido, nessun testo aggiuntivo." },
          { role: "user", content: `Seleziona i 15 articoli più rilevanti su ${cfg.label} da questa lista e traducili in italiano.\n\n${shortList}\n\nRispondi con JSON: {\"items\":[{\"title\":\"...\",\"summary\":\"...\",\"category\":\"...\",\"sourceIndex\":0}]}` }
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
                      sourceIndex: { type: "integer" }
                    },
                    required: ["title", "summary", "category", "sourceIndex"],
                    additionalProperties: false
                  }
                }
              },
              required: ["items"],
              additionalProperties: false
            }
          }
        }
      });
      const retryContent = retryResponse.choices[0]?.message?.content as string;
      parsed = JSON.parse(stripJsonBackticks(retryContent));
    }

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
        videoUrl: original.videoUrl,        // URL embed video se disponibile
      });
    }

    console.log(`[RssScraper] Selezionati ${result.length} articoli per ${section}`);
    return result;
  } catch (err) {
    console.error(`[RssScraper] Errore selezione LLM per ${section}:`, err);

    // Fallback SELETTIVO: usa solo fonti specializzate per la sezione,
    // mai fonti generaliste (Corriere, Repubblica, etc.) che porterebbero notizie off-topic.
    const SECTION_SPECIFIC_PATTERNS: Record<string, string[]> = {
      ai: ["openai", "deepmind", "anthropic", "huggingface", "venturebeat", "techcrunch", "wired",
           "ansa.it", "agendadigitale", "digital4", "innovationpost", "corrierecomunicazioni",
           "ilsole24ore", "sole24ore", "startupitalia", "economyup", "milanofinanza"],
      startup: ["startupitalia", "economyup", "techcrunch", "venturebeat", "crunchbase",
                "startupbusiness", "bebeez", "ilsole24ore", "sole24ore", "milanofinanza",
                "sifted", "eu-startups", "dealroom", "pitchbook", "bloomberg"],
      dealroom: ["bebeez", "dealroom", "pitchbook", "crunchbase", "techcrunch", "venturebeat",
                 "ilsole24ore", "sole24ore", "milanofinanza", "bloomberg", "reuters",
                 "startupbusiness", "startupitalia", "economyup"]
    };
    const sectionPatterns = SECTION_SPECIFIC_PATTERNS[section] || itDomainPatterns;
    const sectionFallback = articles.filter(a =>
      sectionPatterns.some(p => a.link.toLowerCase().includes(p) || a.sourceName.toLowerCase().includes(p))
    );
    // Se non ci sono abbastanza fonti specializzate, usa solo quelle disponibili.
    // NON usare mai fonti generaliste come fallback: meglio pochi articoli corretti che molti off-topic.
    const cleanFallback = sectionFallback.length > 0
      ? sectionFallback
      : []; // Nessuna fonte specializzata disponibile: restituisce array vuoto
    const catLabel = section === "ai" ? "Ricerca & Innovazione" : section === "startup" ? "Startup" : "Dealroom";
    console.log(`[RssScraper] Fallback selettivo per ${section}: ${cleanFallback.length} articoli specializzati`);
    // Fallback: tenta una traduzione LLM semplificata dei titoli in italiano
    const fallbackArticles = cleanFallback.slice(0, 20);
    try {
      const titlesForTranslation = fallbackArticles.map((a, i) => `[${i}] ${a.title}`).join("\n");
      const transResponse = await invokeLLMFast({
        messages: [
          { role: "system", content: "Sei un traduttore italiano. Traduci i titoli in italiano giornalistico. Rispondi con JSON valido." },
          { role: "user", content: `Traduci questi titoli in italiano giornalistico incisivo (max 80 caratteri ciascuno).\n\n${titlesForTranslation}\n\nRispondi con JSON: {"translations":[{"index":0,"title":"..."}]}` }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "translations",
            strict: true,
            schema: {
              type: "object",
              properties: {
                translations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      index: { type: "integer" },
                      title: { type: "string" }
                    },
                    required: ["index", "title"],
                    additionalProperties: false
                  }
                }
              },
              required: ["translations"],
              additionalProperties: false
            }
          }
        }
      });
      const transContent = transResponse.choices[0]?.message?.content as string;
      const transParsed: { translations?: Array<{ index: number; title: string }> } = JSON.parse(stripJsonBackticks(transContent));
      const titleMap = new Map((transParsed.translations || []).map(t => [t.index, t.title]));
      console.log(`[RssScraper] Fallback traduzione: ${titleMap.size} titoli tradotti in italiano`);
      return fallbackArticles.map((a, i) => ({
        title: titleMap.get(i) || a.title,
        summary: a.content.slice(0, 250),
        category: catLabel,
        sourceName: a.sourceName,
        sourceUrl: a.link,
        sourceHomepage: a.sourceHomepage,
        publishedAt: new Date(a.pubDate).toISOString().split("T")[0],
        language: "it" as const
      }));
    } catch (transErr) {
      console.warn(`[RssScraper] Traduzione fallback fallita, uso titoli originali:`, transErr);
      return fallbackArticles.map(a => ({
        title: a.title,
        summary: a.content.slice(0, 250),
        category: catLabel,
        sourceName: a.sourceName,
        sourceUrl: a.link,
        sourceHomepage: a.sourceHomepage,
        publishedAt: new Date(a.pubDate).toISOString().split("T")[0],
        language: "it" as const
      }));
    }
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
        "User-Agent": "Mozilla/5.0 (compatible; Proof Press/1.0; +https://proofpress.ai)"
      }
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
          "User-Agent": "Mozilla/5.0 (compatible; Proof Press/1.0; +https://proofpress.ai)"
        },
        responseType: "stream"
      });
      response.data.destroy(); // Non scaricare il body
      return response.status < 400;
    } catch {
      return false;
    }
  }
}

/**
 * Verifica e preserva il sourceUrl di un articolo.
 * REGOLA FONDAMENTALE: preservare SEMPRE l'URL dell'articolo (con path).
 * Usare la homepage solo se l'URL è già una homepage (senza path).
 * Usare il fallback di sezione solo se l'URL è completamente non valido.
 * 
 * NON verificare HTTP qui (troppo lento per lo scraping massivo).
 * La verifica HTTP avviene nell'audit notturno (nightlyAuditScheduler).
 */
export async function sanitizeSourceUrl(
  url: string,
  section: "ai" | "startup" | "health" | "news" | "dealroom"
): Promise<string> {
  try {
    const parsed = new URL(url);
    const isHomepage = parsed.pathname === "/" || parsed.pathname === "" || parsed.pathname === "//";
    
    if (!isHomepage) {
      // È un URL articolo specifico (con path) → PRESERVARE SEMPRE
      return url;
    }
    
    // È già una homepage (nessun path) → restituire così com'è
    return url;
  } catch {
    // URL non valido → usa il fallback di sezione
    return SECTION_FALLBACKS[section];
  }
}

// ─── Funzioni principali di scraping per sezione ─────────────────────────────

export async function scrapeAINews(): Promise<ScrapedArticle[]> {
  console.log("[RssScraper] Avvio scraping AI news...");
  const articles = await fetchAllFeeds(AI_SOURCES);
  return selectAndTranslate(articles, "ai");
}


export async function scrapeStartupNews(): Promise<ScrapedArticle[]> {
  console.log("[RssScraper] Avvio scraping Startup news...");
  const articles = await fetchAllFeeds(STARTUP_SOURCES);
  return selectAndTranslate(articles, "startup");
}












export async function scrapeDealroomNews(): Promise<ScrapedArticle[]> {
  console.log("[RssScraper] Avvio scraping Dealroom news (round, funding, VC, M&A, exit)...");
  const articles = await fetchAllFeeds(DEALROOM_SOURCES);

  // Pre-filtro: scarta articoli che NON contengono parole chiave deal/funding nel titolo o descrizione
  const DEAL_KEYWORDS = [
    // Italiano
    "raccoglie", "raccolta", "finanziamento", "round", "investimento", "investitori",
    "acquisisce", "acquisizione", "acquisita", "ipo", "quotazione", "quotata",
    "fondo", "fund", "venture", "seed", "series", "milioni", "miliardi",
    "startup", "scaleup", "exit", "m&a", "merger", "buyout", "leveraged",
    "private equity", "angel", "pre-seed", "growth", "valutazione",
    // Inglese
    "raises", "raised", "funding", "funded", "acquires", "acquired",
    "acquisition", "merger", "ipo", "valuation", "investment", "investor",
    "closes", "closed", "round", "series", "seed", "venture", "capital",
    "billion", "million", "unicorn", "decacorn"
  ];

  const preFiltered = articles.filter((a) => {
    const text = `${a.title} ${a.content || ""}`.toLowerCase();
    return DEAL_KEYWORDS.some((kw) => text.includes(kw));
  });

  console.log(`[RssScraper] Pre-filtro DEALROOM: ${articles.length} raw → ${preFiltered.length} con keyword deal/funding`);

  return selectAndTranslate(preFiltered, "dealroom");
}
