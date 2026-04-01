/**
 * IDEASMART — Stock Images Helper
 *
 * Cerca immagini stock gratuite da Pexels per parole chiave
 * coerenti con il titolo e la categoria dell'articolo.
 * Zero costi, zero generazione AI.
 *
 * Pexels API: gratuita, 200 richieste/ora, 20.000/mese
 * Licenza: tutte le foto Pexels sono gratuite per uso commerciale
 */

// ── Tipi ─────────────────────────────────────────────────────────────────────

interface PexelsPhoto {
  id: number;
  src: {
    medium: string;
    large: string;
    large2x: string;
  };
  photographer: string;
  photographer_url: string;
  alt: string;
}

interface PexelsResponse {
  photos: PexelsPhoto[];
  total_results: number;
}

// ── Keyword mapping per categoria ─────────────────────────────────────────────

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  // News categories
  "AI & Hardware": ["computer chip", "semiconductor technology", "GPU processor"],
  "AI & Startup": ["startup office", "tech innovation", "entrepreneur technology"],
  "Startup & Funding": ["investment funding", "startup growth", "venture capital"],
  "AI & Fintech": ["fintech digital banking", "financial technology", "digital finance"],
  "AI & Salute": ["medical technology", "healthcare AI", "digital health"],
  "AI & Lavoro": ["future of work", "remote work technology", "digital workplace"],
  "AI & Difesa": ["cybersecurity technology", "digital security", "network security"],
  "AI & Energia": ["renewable energy technology", "smart grid", "green technology"],
  "AI & Mobilità": ["autonomous vehicle", "smart transportation", "electric vehicle"],
  "AI & Educazione": ["online education technology", "e-learning", "digital learning"],
  "AI & Agricoltura": ["precision agriculture", "smart farming", "agricultural technology"],
  "Modelli Generativi": ["artificial intelligence", "neural network", "machine learning"],
  "Regolamentazione": ["law technology", "digital regulation", "policy technology"],
  "Ricerca & Sviluppo": ["research laboratory", "scientific research", "innovation lab"],
  "Cloud & Edge": ["cloud computing", "data center", "server technology"],
  "Robotica": ["robot technology", "automation", "industrial robot"],
  // Music categories
  // Startup categories
  "Startup Italiana": ["italian startup office", "entrepreneur team italy", "startup coworking"],
  "Startup Internazionale": ["global startup", "tech startup office", "entrepreneur team"],
  "Fintech": ["fintech", "financial technology", "digital banking app"],
  "Healthtech": ["health technology", "medical startup", "digital health app"],
  "Greentech": ["green technology startup", "sustainable energy startup", "clean tech"],
  "Edtech": ["education technology", "e-learning startup", "digital classroom"],
  "Foodtech": ["food technology", "food startup", "food innovation lab"],
  "Proptech": ["real estate technology", "property tech", "smart building"],
  "Deeptech": ["deep technology research", "innovation lab", "scientific startup"],
  "SaaS & B2B": ["software startup", "saas business", "b2b technology office"],
  "E-commerce": ["e-commerce startup", "online retail", "digital commerce"],
  "Mobility": ["mobility startup", "transportation technology", "smart mobility"],
  "Funding & VC": ["venture capital meeting", "startup funding", "investor pitch"],
  "Acquisizioni": ["business acquisition", "company merger", "deal handshake"],
  "IPO & Mercati": ["stock market", "ipo business", "financial market trading"],
  "Ecosistema": ["startup ecosystem", "innovation hub", "startup incubator space"],
  // Default
  "default": ["artificial intelligence", "technology innovation", "digital future"]
};



// ── Estrai parole chiave dal titolo ─────────────────────────────────────────

function extractKeywordsFromTitle(title: string, isMusic = false): string {
  // Rimuovi parole comuni italiane e inglesi
  const stopWords = new Set([
    "il", "la", "lo", "le", "gli", "i", "un", "una", "uno",
    "di", "da", "in", "con", "su", "per", "tra", "fra",
    "e", "o", "ma", "che", "è", "ha", "si", "non", "del",
    "della", "dello", "dei", "degli", "delle", "al", "allo",
    "alla", "ai", "agli", "alle", "nel", "nella", "nei",
    "the", "a", "an", "of", "in", "on", "at", "to", "for",
    "and", "or", "but", "with", "by", "from", "as", "is",
    "are", "was", "were", "be", "been", "have", "has", "had",
    "will", "would", "could", "should", "may", "might",
    "lancia", "presenta", "annuncia", "svela", "rilascia",
    "investe", "raccoglie", "chiude", "vince", "sperimenta",
    "nuovo", "nuova", "nuovi", "nuove", "primo", "prima"
  ]);

  const words = title
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w))
    .slice(0, 4);

  // Sostituisci termini italiani con equivalenti inglesi per Pexels
  const aiTranslations: Record<string, string> = {
    "intelligenza": "artificial intelligence",
    "artificiale": "artificial intelligence",
    "startup": "startup",
    "tecnologia": "technology",
    "digitale": "digital",
    "robot": "robot",
    "robotica": "robotics",
    "salute": "healthcare",
    "sanità": "healthcare",
    "energia": "energy",
    "sicurezza": "security",
    "finanza": "finance",
    "banca": "banking",
    "agricoltura": "agriculture",
    "lavoro": "work",
    "educazione": "education",
    "mobilità": "mobility",
    "difesa": "defense",
    "chip": "microchip",
    "cloud": "cloud computing",
    "dati": "data",
    "algoritmo": "algorithm",
    "modello": "machine learning",
    "europa": "europe",
    "italia": "italy",
    "mercato": "market",
    "investimento": "investment",
    "crescita": "growth"
  };

  const translated = words.map(w => aiTranslations[w] || w).join(" ");
  return translated || ("technology innovation");
}

// ── Ricerca immagine su Pexels ────────────────────────────────────────────────

// Contatore globale per garantire pagine diverse tra chiamate successive nella stessa sessione
let pexelsCallCounter = 0;

async function searchPexels(
  query: string,
  orientation: "landscape" | "square" = "landscape",
  excludeUrls: string[] = []
): Promise<string | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.warn("[StockImages] PEXELS_API_KEY not set, using fallback");
    return null;
  }

  try {
    // Usa pagina diversa per ogni chiamata: combina contatore + random per massima diversità
    pexelsCallCounter++;
    const basePage = (pexelsCallCounter % 5) + 1; // Pagine 1-5 a rotazione
    const randomOffset = Math.floor(Math.random() * 3); // +0, +1, o +2
    const page = basePage + randomOffset; // Pagine da 1 a 7
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&page=${page}&orientation=${orientation}&size=medium`;
    const res = await fetch(url, {
      headers: { Authorization: apiKey }
    });

    if (!res.ok) {
      console.warn(`[StockImages] Pexels API error: ${res.status} for query "${query}"`);
      return null;
    }

    const data: PexelsResponse = await res.json();
    let photos = data.photos || [];

    if (photos.length === 0) {
      console.warn(`[StockImages] No Pexels results for "${query}" (page ${page})`);
      return null;
    }

    // Escludi le immagini già usate di recente — confronto sia per ID che per URL completo
    if (excludeUrls.length > 0) {
      const filtered = photos.filter(p => {
        const photoId = String(p.id);
        const photoLargeUrl = p.src.large;
        return !excludeUrls.some(u => u.includes(photoId) || u === photoLargeUrl);
      });
      if (filtered.length > 0) {
        photos = filtered;
      } else {
        console.log(`[StockImages] Tutte le foto della pagina ${page} sono già usate, uso comunque una casuale`);
      }
    }

    // Scegli una foto casuale tra le disponibili per varietà
    const idx = Math.floor(Math.random() * Math.min(photos.length, 10));
    const photo = photos[idx];

    console.log(`[StockImages] Selezionata foto ID ${photo.id} da pagina ${page} per query "${query}"`);
    // Usa large per qualità migliore (max 1280px)
    return photo.src.large;
  } catch (err) {
    console.warn("[StockImages] Pexels search failed:", err);
    return null;
  }
}



// ── API pubblica ──────────────────────────────────────────────────────────────────────────────────

// Keyword ultra-generiche per categoria — garantiscono sempre risultati su Pexels
const PEXELS_GUARANTEED_KEYWORDS: Record<string, string[]> = {
  // Tech / AI
  "AI & Hardware": ["technology", "computer", "digital"],
  "AI & Startup": ["office", "business", "startup"],
  "Startup & Funding": ["business", "investment", "office"],
  "AI & Fintech": ["finance", "banking", "money"],
  "AI & Salute": ["healthcare", "medical", "hospital"],
  "AI & Lavoro": ["work", "office", "people"],
  "AI & Difesa": ["security", "technology", "network"],
  "Modelli Generativi": ["technology", "computer", "abstract"],
  "Robotica": ["robot", "technology", "automation"],
  // Music
  // Startup
  "Startup Italiana": ["office", "startup", "team"],
  "Startup Internazionale": ["startup", "office", "team"],
  "Fintech": ["finance", "technology", "banking"],
  "Healthtech": ["health", "technology", "medical"],
  "Greentech": ["nature", "renewable", "green"],
  "SaaS & B2B": ["software", "computer", "office"],
  "Funding & VC": ["business", "investment", "meeting"],
  // Default
  "default": ["technology", "business", "office"]
};

async function getPexelsFallback(category: string): Promise<string | null> {
  const keywords = PEXELS_GUARANTEED_KEYWORDS[category] || PEXELS_GUARANTEED_KEYWORDS["default"];
  // Prova ogni keyword in ordine finché una funziona
  for (const kw of keywords) {
    const url = await searchPexels(kw);
    if (url) return url;
  }
  // Ultima risorsa: "nature" e "city" hanno sempre risultati su Pexels
  return await searchPexels("city") || await searchPexels("nature") || null;
}

/**
 * Cerca un'immagine stock coerente con il titolo e la categoria dell'articolo.
 * Usa Pexels come fonte principale, con fallback su Unsplash.
 *
 * Usa keyword specifiche per sezione.
 */
export async function findStockImage(
  title: string,
  category: string,
  context?: string
): Promise<string | null> {
  const isMusic = false; // Music channel removed
  const STARTUP_CATEGORIES = new Set(["Startup Italiana", "Startup Internazionale", "Fintech", "Healthtech", "Greentech", "Edtech", "Deeptech", "SaaS & B2B", "Funding & VC", "Acquisizioni", "IPO & Mercati", "Ecosistema"]);
  const isStartup = STARTUP_CATEGORIES.has(category);

  // 1. Prima prova con parole chiave estratte dal titolo
  //    Per Startup: keyword startup | Per AI: keyword tecnologiche
  const titleKeywords = extractKeywordsFromTitle(title, isMusic);
  const query1 = isStartup
    ? `${titleKeywords} startup entrepreneur`
    : `${titleKeywords} technology`;
  let url = await searchPexels(query1);

  // 2. Se non trovato, prova con le keyword della categoria
  if (!url) {
    const categoryKws = CATEGORY_KEYWORDS[category] || CATEGORY_KEYWORDS["default"];
    const query2 = categoryKws[Math.floor(Math.random() * categoryKws.length)];
    url = await searchPexels(query2);
  }

  // 3. Se ancora non trovato, prova con context
  if (!url && context) {
    const query3 = isStartup ? `${context} startup` : `${context} technology`;
    url = await searchPexels(query3);
  }

  // 4. Fallback finale per sezione specifica
  if (!url) {
    if (isMusic) {
    } else if (isStartup) {
      const startupFallbacks = ["startup team", "entrepreneur office", "business innovation", "startup pitch", "coworking space"];
      url = await searchPexels(startupFallbacks[Math.floor(Math.random() * startupFallbacks.length)]);
    }
  }

  // 5. Fallback Pexels con keyword ultra-generiche garantite (sostituisce Unsplash deprecato)
  if (!url) {
    url = await getPexelsFallback(category);
  }

  return url;
}

/**
 * Versione specializzata per news
 */
export async function findNewsImage(title: string, category: string): Promise<string | null> {
  return findStockImage(title, category);
}

// ── Keyword curate per editoriali LinkedIn ──────────────────────────────────
// Queste keyword sono visivamente inequivocabili: niente crypto, niente trading.
// Pool ampliata per garantire massima varietà tra i 4 post giornalieri.

const LINKEDIN_AI_KEYWORDS = [
  "robot arm factory automation",
  "data scientist laptop screen",
  "artificial intelligence robot",
  "machine learning code screen",
  "tech startup team meeting",
  "business innovation technology",
  "digital transformation office",
  "futuristic technology interface",
  "AI computer vision screen",
  "smart city technology",
  "neural network visualization",
  "server data center technology",
  "programmer coding laptop night",
  "business analytics dashboard",
  "autonomous robot warehouse",
  "AI chip processor technology",
  "tech executive meeting boardroom",
  "cloud computing network",
  "cybersecurity digital protection",
  "machine learning algorithm"
];

const LINKEDIN_STARTUP_KEYWORDS = [
  "startup team brainstorming",
  "entrepreneur pitch presentation",
  "coworking space startup",
  "business growth chart meeting",
  "venture capital handshake",
  "startup office collaboration",
  "innovation hub technology",
  "founder startup laptop",
  "accelerator program startup",
  "business strategy whiteboard",
  "entrepreneur success celebration",
  "startup funding investment",
  "tech founder interview",
  "product launch startup",
  "team collaboration modern office",
  "business plan presentation",
  "startup incubator workspace",
  "young entrepreneur technology",
  "scale up business growth",
  "innovation lab prototype"
];

// ── Mapping tematico avanzato: keyword del titolo → query Pexels pertinente ──
// Garantisce che ogni post abbia un'immagine visivamente coerente con il tema.
const THEME_KEYWORD_MAP: Array<{ patterns: RegExp; query: string }> = [
  // AI & Modelli
  { patterns: /gpt|chatgpt|openai|llm|language model|modello linguistico/i, query: "AI chatbot conversation interface" },
  { patterns: /gemini|google ai|bard/i, query: "Google technology AI innovation" },
  { patterns: /claude|anthropic/i, query: "AI assistant technology screen" },
  { patterns: /deepseek|mistral|llama/i, query: "open source AI code programming" },
  { patterns: /agent[ie]|agentic|autonomous ai/i, query: "autonomous robot AI agent" },
  // Robotica & Automazione
  { patterns: /robot|robotica|automazione|automation/i, query: "industrial robot automation factory" },
  { patterns: /drone|uav/i, query: "drone technology aerial" },
  { patterns: /veicolo autonomo|self.driving|autonomous vehicle/i, query: "self driving car technology" },
  // Hardware & Chip
  { patterns: /chip|semiconduttore|semiconductor|nvidia|gpu|processore/i, query: "semiconductor chip processor technology" },
  { patterns: /quantum|quantistico/i, query: "quantum computing technology" },
  // Cloud & Infrastruttura
  { patterns: /cloud|aws|azure|google cloud/i, query: "cloud computing data center" },
  { patterns: /data center|datacenter|server/i, query: "server data center infrastructure" },
  { patterns: /cybersecurity|sicurezza|hacker|breach/i, query: "cybersecurity digital protection" },
  // Startup & Funding
  { patterns: /funding|round|serie [abc]|seed|investimento/i, query: "startup funding investment pitch" },
  { patterns: /ipo|borsa|mercato|stock/i, query: "stock market business finance" },
  { patterns: /acquisizione|acquisition|merger|m&a/i, query: "business merger acquisition handshake" },
  { patterns: /unicorn|unicorno/i, query: "successful startup growth unicorn" },
  // Settori verticali
  { patterns: /salute|health|medic|biotech|pharma/i, query: "healthcare technology medical AI" },
  { patterns: /fintech|banca|banking|pagamenti|payment/i, query: "fintech digital banking app" },
  { patterns: /energia|energy|green|sostenib|climate/i, query: "renewable energy green technology" },
  { patterns: /educazione|education|learning|formazione/i, query: "e-learning education technology" },
  { patterns: /retail|ecommerce|e-commerce|shopping/i, query: "e-commerce retail technology" },
  { patterns: /manifattura|manufacturing|industria/i, query: "smart manufacturing industry 4.0" },
  // Lavoro & Organizzazione
  { patterns: /lavoro|work|occupazione|jobs|workforce/i, query: "future of work remote office" },
  { patterns: /ceo|cto|leadership|executive|board/i, query: "executive leadership business meeting" },
  { patterns: /strategia|strategy|decisione|decision/i, query: "business strategy planning meeting" }
];

/**
 * Estrae la query Pexels più pertinente al tema del titolo del post.
 * Usa il mapping tematico avanzato prima di ricorrere alle keyword generiche.
 */
function getThematicQuery(title: string, keyTrend: string, section: "ai" | "startup"): string {
  const text = `${title} ${keyTrend}`.toLowerCase();

  // Cerca il primo pattern che corrisponde al tema
  for (const { patterns, query } of THEME_KEYWORD_MAP) {
    if (patterns.test(text)) {
      return query;
    }
  }

  // Fallback: keyword generica per sezione
  return section === "startup"
    ? "startup entrepreneur innovation office"
    : "artificial intelligence technology innovation";
}

/**
 * Versione specializzata per editoriale LinkedIn.
 * Usa keyword visivamente pertinenti e tematicamente coerenti con il post,
 * evitando immagini crypto/finanza/trading e immagini già usate di recente.
 *
 * @param title - Titolo dell'editoriale
 * @param keyTrend - Trend chiave dell'editoriale
 * @param section - Sezione tematica (ai o startup)
 * @param recentImageUrls - URL immagini usate di recente (da escludere per varietà)
 */
export async function findEditorialImage(
  title: string,
  keyTrend: string,
  section: "ai" | "startup" = "ai",
  recentImageUrls: string[] = []
): Promise<string | null> {
  const isStartup = section === "startup";
  const pool = isStartup ? LINKEDIN_STARTUP_KEYWORDS : LINKEDIN_AI_KEYWORDS;

  // 1. Query tematica specifica basata sul contenuto del titolo
  const thematicQuery = getThematicQuery(title, keyTrend, section);
  let url = await searchPexels(thematicQuery, "landscape", recentImageUrls);
  if (url) {
    console.log(`[StockImages] 🎯 Immagine tematica trovata: "${thematicQuery}"`);
    return url;
  }

  // 2. Prova con keyword estratte dal titolo + sezione
  const titleKws = extractKeywordsFromTitle(title, false);
  const query2 = isStartup
    ? `${titleKws} startup entrepreneur`
    : `${titleKws} artificial intelligence technology`;
  url = await searchPexels(query2, "landscape", recentImageUrls);
  if (url) {
    console.log(`[StockImages] 📝 Immagine da titolo trovata: "${query2}"`);
    return url;
  }

  // 3. Prova con keyTrend + sezione (se diverso dal titolo)
  if (keyTrend && keyTrend.length > 3) {
    const query3 = isStartup
      ? `${keyTrend} startup`
      : `${keyTrend} technology AI`;
    url = await searchPexels(query3, "landscape", recentImageUrls);
    if (url) {
      console.log(`[StockImages] 📊 Immagine da keyTrend trovata: "${query3}"`);
      return url;
    }
  }

  // 4. Prova con keyword curate dalla pool (casuale, escludendo immagini recenti)
  // Usa un indice deterministico basato sull'ora per evitare ripetizioni tra slot
  const hourSlot = new Date().getHours();
  const poolIdx = hourSlot % pool.length;
  url = await searchPexels(pool[poolIdx], "landscape", recentImageUrls);
  if (url) {
    console.log(`[StockImages] 🎲 Immagine da pool (slot ${poolIdx}): "${pool[poolIdx]}"`);
    return url;
  }

  // 5. Seconda keyword dalla pool (offset +5 per diversificare)
  const poolIdx2 = (poolIdx + 5) % pool.length;
  url = await searchPexels(pool[poolIdx2], "landscape", recentImageUrls);
  if (url) return url;

  // 6. Fallback assoluto senza esclusioni
  url = await searchPexels(isStartup ? "startup office team" : "technology innovation office");
  return url;
}

/**
 * Versione specializzata per startup
 */
export async function findStartupImage(name: string, category: string, tagline: string): Promise<string | null> {
  return findStockImage(`${name} ${tagline}`, "AI & Startup", category);
}

/**
 * Versione specializzata per reportage
 */
export async function findReportageImage(startupName: string, headline: string, category: string): Promise<string | null> {
  return findStockImage(headline, category, startupName);
}

/**
 * Versione specializzata per analisi di mercato
 */
export async function findMarketAnalysisImage(title: string, category: string, source: string): Promise<string | null> {
  return findStockImage(title, category, source);
}
