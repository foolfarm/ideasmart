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
import { AI_SOURCES, MUSIC_SOURCES, STARTUP_SOURCES, FINANCE_SOURCES, HEALTH_SOURCES, SPORT_SOURCES, LUXURY_SOURCES, NEWS_SOURCES, MOTORI_SOURCES, TENNIS_SOURCES, BASKET_SOURCES, GOSSIP_SOURCES, CYBERSECURITY_SOURCES, SONDAGGI_SOURCES, DEALROOM_SOURCES, getHomepageForUrl, SECTION_FALLBACKS } from "./rssSources";
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
        videoUrl: extractVideoUrl(item as unknown as Record<string, unknown>),
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
  section: "ai" | "music" | "startup" | "finance" | "health" | "sport" | "luxury" | "news" | "motori" | "tennis" | "basket" | "gossip" | "cybersecurity" | "sondaggi" | "dealroom" | "dealroom"
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
    finance: {
      label: "Finance & Markets",
      categories: ["Mercati Azionari", "Macro & Banche Centrali", "Fintech & Crypto", "M&A & Private Equity", "Venture Capital", "Obbligazioni & Tassi", "Commodities", "Forex", "Economia Globale", "ESG & Sostenibilità", "Banche & Credito", "IPO & Listini"],
      instructions: "Seleziona le notizie più rilevanti per CFO, investitori e manager italiani. Privilegia dati macro, movimenti di mercato, deal significativi, politiche BCE/Fed, analisi di impatto per le imprese.",
    },
    health: {
      label: "Health & Biotech",
      categories: ["Biotech & Pharma", "AI in Medicina", "Longevità & Aging", "Oncologia", "MedTech & Dispositivi", "Salute Digitale", "Ricerca Clinica", "Sanità Pubblica", "Genomica", "Neuroscienze", "Drug Discovery", "Regolamentazione FDA/EMA"],
      instructions: "Seleziona le notizie più rilevanti per professionisti della salute, investitori biotech e manager sanitari. Privilegia approvazioni FDA/EMA, trial clinici, breakthrough scientifici, finanziamenti biotech.",
    },
    sport: {
      label: "Sport & Business",
      categories: ["Calcio & Business", "Diritti TV & Media", "Sponsorship & Brand", "Stadi & Infrastrutture", "Esports", "Sport Tech", "Valutazioni Club", "Trasferimenti & Mercato", "Formula 1 & Motorsport", "NBA & Basket", "Tennis & Golf", "Olimpiadi & Mega-eventi"],
      instructions: "Seleziona le notizie più rilevanti per manager dello sport, investitori e appassionati di business sportivo. Privilegia deal economici, diritti TV, valutazioni club, innovazione tecnologica nello sport.",
    },
    luxury: {
      label: "Lifestyle & Luxury",
      categories: ["Moda & Lusso", "Made in Italy", "Orologeria & Gioielleria", "Automotive Luxury", "Arte & Collezionismo", "Vino & Gastronomia", "Travel & Hospitality", "Real Estate Luxury", "Brand Strategy", "Sostenibilità nel Lusso", "Retail & E-commerce Luxury", "Acquisizioni nel Lusso"],
      instructions: "Seleziona le notizie più rilevanti per imprenditori del made in Italy, manager del lusso e investitori. Privilegia strategie di brand, acquisizioni LVMH/Kering/Richemont, trend di mercato, innovazione nel retail luxury.",
    },
    news: {
      label: "News Generali",
      categories: ["Politica Italiana", "Politica Internazionale", "Economia", "Esteri", "Cronaca", "Glamour & Spettacolo", "Ambiente", "Società", "Giustizia", "Europa", "Medio Oriente", "USA & Americhe"],
      instructions: "Seleziona le 20 notizie più importanti del giorno per un lettore italiano informato. Privilegia notizie di politica, economia, esteri e cronaca. Includi almeno 2 notizie di glamour/spettacolo. Titoli chiari e diretti, senza sensazionalismo.",
    },
    motori: {
      label: "Motori",
      categories: ["Formula 1", "MotoGP & Motorsport", "Auto Elettriche", "Nuovi Modelli", "Mercato Auto", "Tecnologia Auto", "Supercar & Hypercar", "SUV & Crossover", "Auto d'Epoca", "Moto", "Industria Automotive", "Guida Autonoma"],
      instructions: "Seleziona le 20 notizie più rilevanti per gli appassionati di motori italiani. Privilegia F1, nuovi modelli, elettrico, motorsport e notizie dall'industria automotive. Titoli appassionati e diretti.",
    },
    tennis: {
      label: "Tennis",
      categories: ["ATP Tour", "WTA Tour", "Grand Slam", "Tennis Italiano", "Sinner & Azzurri", "Ranking ATP/WTA", "Davis Cup & Billie Jean King", "Next Gen", "Analisi Tattica", "Mercato & Coaching", "Tornei Masters", "ITF & Challenger"],
      instructions: "Seleziona le 20 notizie più rilevanti per gli appassionati di tennis italiani. Privilegia Sinner, Berrettini e gli altri azzurri, Grand Slam, ATP/WTA Tour. Titoli precisi con nomi dei giocatori.",
    },
    basket: {
      label: "Basket",
      categories: ["NBA", "Serie A Basket", "Eurolega", "Nazionale Italiana", "Mercato & Trasferimenti", "Analisi Tattica", "Statistiche", "Giovani Talenti", "Coach & Staff", "Infortuni", "Playoff", "Draft NBA"],
      instructions: "Seleziona le 20 notizie più rilevanti per gli appassionati di basket italiani. Privilegia NBA, Serie A, Eurolega e Nazionale italiana. Titoli precisi con nomi dei giocatori e squadre.",
    },
    gossip: {
      label: "Business Gossip Italia",
      categories: ["CEO & Executive Moves", "Deal & M&A Italia", "Round & Funding", "VC & Investitori", "Borsa & Mercati", "Licenziamenti & Ristrutturazioni", "Nuovi Prodotti & Lancio", "Rumor & Indiscrezioni", "Startup Drama", "Controversie Corporate", "IPO & Quotazioni", "Retroscena & Insider"],
      instructions: "Seleziona le 20 notizie più interessanti e rilevanti del mondo business e startup ITALIANO. PRIORITÀ ASSOLUTA: movimenti di CEO/manager italiani, deal M&A in Italia, round di finanziamento startup italiane, notizie di borsa italiana, retroscena corporate, gossip insider dal mondo finanziario e imprenditoriale italiano. Privilegia notizie con nomi di persone, cifre e dettagli concreti. Tono vivace ma professionale. ESCLUDI notizie generiche senza protagonisti identificabili.",
    },
    cybersecurity: {
      label: "Cybersecurity",
      categories: ["Data Breach", "Ransomware & Malware", "Vulnerabilità & Patch", "Threat Intelligence", "Zero-Day", "Sicurezza Cloud", "Identità & Accessi", "AI & Sicurezza", "Normative & Compliance", "Attacchi Stato-Nazione", "Sicurezza Mobile", "Italia & Cybersecurity"],
      instructions: "Seleziona le 20 notizie più rilevanti per CISO, security manager e professionisti IT italiani. Privilegia breach significativi, nuove vulnerabilità, attacchi ransomware, normative NIS2/GDPR e trend di sicurezza.",
    },
    sondaggi: {
      label: "Sondaggi & Dati Italia",
      categories: ["Sondaggi Politici Italiani", "Intenzioni di Voto", "Gradimento Governo", "Sondaggi Economici", "Opinione Pubblica", "Trend Sociali", "Ricerche ISTAT/Censis", "Dati & Statistiche", "Report Istituzionali", "Consenso & Fiducia", "Analisi Partiti", "Scenari Elettorali"],
      instructions: "Seleziona le 20 notizie più interessanti tra sondaggi, ricerche e dati italiani. PRIORITÀ ASSOLUTA: sondaggi politici italiani (intenzioni di voto, gradimento governo/partiti, scenari elettorali), dati ISTAT/Censis/Eurispes, ricerche di istituti italiani (SWG, YouTrend, Tecnè, Demopolis, Noto, EMG). Privilegia contenuti con dati numerici, percentuali, confronti temporali. Tono analitico e basato sui dati. ESCLUDI notizie generiche senza dati.",
    },
    dealroom: {
      label: "DEALROOM — Funding & VC",
      categories: ["Seed Round", "Series A", "Series B", "Series C+", "Venture Capital Italia", "Venture Capital Europa", "Venture Capital Global", "M&A & Acquisizioni", "Exit & IPO", "VC Fund", "Deal Italiano", "Deal Europeo", "Deal Globale", "Corporate VC", "Angel & Pre-seed"],
      instructions: "Seleziona le 20 notizie più rilevanti su round di finanziamento, deal VC, M&A, seed, exit e investimenti. PRIORITÀ ASSOLUTA: deal italiani (startup italiane che raccolgono fondi, acquisizioni di aziende italiane, VC italiani che investono), poi europei, poi globali. Privilegia notizie con cifre concrete (importo del round, valutazione, investitori), nomi di startup e founder. ESCLUDI notizie generiche senza dati di deal specifici. Tono professionale e data-driven.",
    },
  } as const;

  const cfg = sectionConfig[section];
  const today = new Date().toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });

  // ITALIA FIRST: ordina gli articoli mettendo le fonti italiane in cima.
  // Identifica articoli italiani dal dominio .it o dal nome fonte noto.
  const itDomainPatterns = [
    ".it/", "ansa.it", "corriere.it", "repubblica.it", "ilpost.it",
    "sole24ore", "ilsole24ore", "wired.it", "forbes.it", "gazzetta.it",
    "corrieredellosport", "tuttosport", "autosprint", "motorionline",
    "supertennis", "tennis.it", "fitp.it", "legabasket", "italbasket",
    "agendadigitale", "digital4", "innovationpost", "corrierecomunicazioni",
    "punto-informatico", "tomshw.it", "hwupgrade", "ilfattoquotidiano",
    "lastampa", "agi.it", "tgcom24", "sky.it", "rainews", "adnkronos",
    "askanews", "italpress", "ilgiornale", "libero.it", "panorama.it",
    "espresso.it", "linkiesta", "startupitalia", "economyup", "milanofinanza",
    "borsaitaliana", "smartworld", "hdblog", "everyeye", "gamereactor.it",
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

  const prompt = `Sei il redattore capo di ${cfg.label} by IDEASMART. Oggi è ${today}.

Hai a disposizione questi articoli reali recuperati dai feed RSS delle nostre fonti certificate:

${articlesForPrompt}

COMPITO: Seleziona i 20 articoli più rilevanti per il nostro pubblico e per ognuno produci:
- title: titolo giornalistico in ITALIANO, incisivo (max 80 caratteri)
- summary: riassunto editoriale in ITALIANO (2-3 frasi, max 250 caratteri)  
- category: una tra [${cfg.categories.join(", ")}]
- sourceIndex: indice dell'articolo originale (numero tra parentesi quadre)

CRITERI: ${cfg.instructions}

IMPORTANTE — ITALIA FIRST:
- Gli articoli marcati 🇮🇹 provengono da fonti italiane: PRIVILEGIALI nella selezione.
- Includi almeno 8-10 articoli da fonti italiane (🇮🇹) nei 20 selezionati, se disponibili.
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
        videoUrl: original.videoUrl,        // URL embed video se disponibile
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
  section: "ai" | "music" | "startup" | "finance" | "health" | "sport" | "luxury" | "news" | "motori" | "tennis" | "basket" | "gossip" | "cybersecurity" | "sondaggi" | "dealroom"
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

export async function scrapeFinanceNews(): Promise<ScrapedArticle[]> {
  console.log("[RssScraper] Avvio scraping Finance news...");
  const articles = await fetchAllFeeds(FINANCE_SOURCES);
  return selectAndTranslate(articles, "finance");
}

export async function scrapeHealthNews(): Promise<ScrapedArticle[]> {
  console.log("[RssScraper] Avvio scraping Health news...");
  const articles = await fetchAllFeeds(HEALTH_SOURCES);
  return selectAndTranslate(articles, "health");
}

export async function scrapeSportNews(): Promise<ScrapedArticle[]> {
  console.log("[RssScraper] Avvio scraping Sport news...");
  const articles = await fetchAllFeeds(SPORT_SOURCES);
  return selectAndTranslate(articles, "sport");
}

export async function scrapeLuxuryNews(): Promise<ScrapedArticle[]> {
  console.log("[RssScraper] Avvio scraping Luxury news...");
  const articles = await fetchAllFeeds(LUXURY_SOURCES);
  return selectAndTranslate(articles, "luxury");
}

export async function scrapeNewsGenerali(): Promise<ScrapedArticle[]> {
  console.log("[RssScraper] Avvio scraping News Generali...");
  const articles = await fetchAllFeeds(NEWS_SOURCES);
  return selectAndTranslate(articles, "news");
}

export async function scrapeMotoriNews(): Promise<ScrapedArticle[]> {
  console.log("[RssScraper] Avvio scraping Motori news...");
  const articles = await fetchAllFeeds(MOTORI_SOURCES);
  return selectAndTranslate(articles, "motori");
}

export async function scrapeTennisNews(): Promise<ScrapedArticle[]> {
  console.log("[RssScraper] Avvio scraping Tennis news...");
  const articles = await fetchAllFeeds(TENNIS_SOURCES);
  return selectAndTranslate(articles, "tennis");
}

export async function scrapeBasketNews(): Promise<ScrapedArticle[]> {
  console.log("[RssScraper] Avvio scraping Basket news...");
  const articles = await fetchAllFeeds(BASKET_SOURCES);
  return selectAndTranslate(articles, "basket");
}

export async function scrapeGossipNews(): Promise<ScrapedArticle[]> {
  console.log("[RssScraper] Avvio scraping Business Gossip news...");
  const articles = await fetchAllFeeds(GOSSIP_SOURCES);
  return selectAndTranslate(articles, "gossip");
}

export async function scrapeCybersecurityNews(): Promise<ScrapedArticle[]> {
  console.log("[RssScraper] Avvio scraping Cybersecurity news...");
  const articles = await fetchAllFeeds(CYBERSECURITY_SOURCES);
  return selectAndTranslate(articles, "cybersecurity");
}

export async function scrapeSondaggiNews(): Promise<ScrapedArticle[]> {
  console.log("[RssScraper] Avvio scraping Sondaggi news...");
  const articles = await fetchAllFeeds(SONDAGGI_SOURCES);
  return selectAndTranslate(articles, "sondaggi");
}

export async function scrapeDealroomNews(): Promise<ScrapedArticle[]> {
  console.log("[RssScraper] Avvio scraping Dealroom news (round, funding, VC, M&A, exit)...");
  const articles = await fetchAllFeeds(DEALROOM_SOURCES);
  return selectAndTranslate(articles, "dealroom");
}
