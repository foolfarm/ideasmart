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
  "Cybersecurity": ["cybersecurity", "data protection", "digital security"],
  "Cloud & Edge": ["cloud computing", "data center", "server technology"],
  "Robotica": ["robot technology", "automation", "industrial robot"],
  // Music categories
  "Rock & Indie": ["rock concert", "indie music band", "live music performance"],
  "AI Music": ["music technology", "digital music production", "audio technology"],
  "Industria Musicale": ["music industry", "record label", "music business"],
  "Tour & Live": ["concert stage", "live music concert", "music festival crowd"],
  "Artisti Emergenti": ["young musician", "emerging artist", "music studio recording"],
  "Streaming & Digital": ["music streaming", "headphones music", "digital audio"],
  "Vinile & Fisico": ["vinyl record", "record store", "turntable music"],
  "Produzione Musicale": ["music studio", "mixing console", "music producer"],
  "Diritti & Copyright": ["music rights", "copyright law", "intellectual property"],
  "Festival & Concerti": ["music festival", "outdoor concert", "festival crowd"],
  // Default
  "default": ["artificial intelligence", "technology innovation", "digital future"],
};

// ── Categorie musicali (per rilevare la sezione) ────────────────────────────

const MUSIC_CATEGORIES = new Set([
  "Rock & Indie", "AI Music", "Industria Musicale", "Tour & Live",
  "Artisti Emergenti", "Streaming & Digital", "Vinile & Fisico",
  "Produzione Musicale", "Diritti & Copyright", "Festival & Concerti",
]);

// ── Keyword musicali per titolo (traduzione IT→EN contestuale) ───────────────

const MUSIC_TITLE_TRANSLATIONS: Record<string, string> = {
  "musica": "music",
  "musicale": "music",
  "musicali": "music",
  "concerto": "concert",
  "concerti": "concert stage",
  "tour": "music tour",
  "album": "album vinyl",
  "singolo": "music single",
  "band": "rock band",
  "artista": "musician artist",
  "artisti": "musicians artists",
  "festival": "music festival",
  "streaming": "music streaming",
  "vinile": "vinyl record",
  "produzione": "music production",
  "studio": "recording studio",
  "chitarra": "guitar",
  "batteria": "drums",
  "cantante": "singer",
  "cantanti": "singers",
  "indie": "indie music",
  "rock": "rock music",
  "punk": "punk rock",
  "pop": "pop music",
  "hip-hop": "hip hop",
  "rapper": "rapper",
  "dj": "dj music",
  "etichetta": "record label",
  "royalties": "music royalties",
  "diritti": "music rights",
  "palco": "concert stage",
  "live": "live concert",
  "playlist": "music playlist",
  "spotify": "music streaming",
  "metaverso": "virtual concert",
  "emergenti": "emerging musicians",
  "produttore": "music producer",
  "produttori": "music producers",
  "discografica": "record label",
  "discografiche": "record labels",
  "majorlabel": "record label",
  "major": "record label",
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
    "nuovo", "nuova", "nuovi", "nuove", "primo", "prima",
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
    "crescita": "growth",
  };

  const translations = isMusic ? MUSIC_TITLE_TRANSLATIONS : aiTranslations;
  const translated = words.map(w => translations[w] || w).join(" ");
  return translated || (isMusic ? "music" : "technology innovation");
}

// ── Ricerca immagine su Pexels ────────────────────────────────────────────────

async function searchPexels(query: string, orientation: "landscape" | "square" = "landscape"): Promise<string | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.warn("[StockImages] PEXELS_API_KEY not set, using fallback");
    return null;
  }

  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=${orientation}&size=medium`;
    const res = await fetch(url, {
      headers: { Authorization: apiKey },
    });

    if (!res.ok) {
      console.warn(`[StockImages] Pexels API error: ${res.status} for query "${query}"`);
      return null;
    }

    const data: PexelsResponse = await res.json();
    const photos = data.photos || [];

    if (photos.length === 0) {
      console.warn(`[StockImages] No Pexels results for "${query}"`);
      return null;
    }

    // Scegli una foto casuale tra le prime 5 per varietà
    const idx = Math.floor(Math.random() * Math.min(photos.length, 5));
    const photo = photos[idx];

    // Usa large per qualità migliore (max 1280px)
    return photo.src.large;
  } catch (err) {
    console.warn("[StockImages] Pexels search failed:", err);
    return null;
  }
}

// ── Fallback: URL Unsplash deterministici per categoria ──────────────────────

function getUnsplashFallback(category: string, seed: string): string {
  // Mappa categorie a collezioni Unsplash specifiche (ID collezioni pubbliche)
  const collectionMap: Record<string, string> = {
    "AI & Hardware": "artificial-intelligence,technology",
    "AI & Startup": "startup,technology,office",
    "Startup & Funding": "business,investment,startup",
    "AI & Fintech": "finance,banking,technology",
    "AI & Salute": "healthcare,medical,technology",
    "AI & Lavoro": "work,office,technology",
    "AI & Difesa": "security,technology,network",
    "Modelli Generativi": "artificial-intelligence,neural-network",
    "Cybersecurity": "cybersecurity,security,technology",
    "Robotica": "robot,automation,technology",
    "default": "technology,innovation,digital",
  };

  const keywords = collectionMap[category] || collectionMap["default"];
  // Usa un seed deterministico basato sul titolo per evitare immagini duplicate
  const hash = seed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return `https://source.unsplash.com/800x450/?${keywords}&sig=${hash}`;
}

// ── API pubblica ─────────────────────────────────────────────────────────────

/**
 * Cerca un'immagine stock coerente con il titolo e la categoria dell'articolo.
 * Usa Pexels come fonte principale, con fallback su Unsplash.
 *
 * Per le categorie musicali usa keyword musicali specifiche (mai tecnologiche).
 */
export async function findStockImage(
  title: string,
  category: string,
  context?: string
): Promise<string | null> {
  const isMusic = MUSIC_CATEGORIES.has(category);

  // 1. Prima prova con parole chiave estratte dal titolo
  //    Per Music: keyword musicali | Per AI: keyword tecnologiche
  const titleKeywords = extractKeywordsFromTitle(title, isMusic);
  const query1 = isMusic
    ? `${titleKeywords} music`          // es. "concert stage music"
    : `${titleKeywords} technology`;    // es. "artificial intelligence technology"
  let url = await searchPexels(query1);

  // 2. Se non trovato, prova con le keyword della categoria
  if (!url) {
    const categoryKws = CATEGORY_KEYWORDS[category] || CATEGORY_KEYWORDS["default"];
    const query2 = categoryKws[Math.floor(Math.random() * categoryKws.length)];
    url = await searchPexels(query2);
  }

  // 3. Se ancora non trovato, prova con context
  if (!url && context) {
    const query3 = isMusic ? `${context} music` : `${context} technology`;
    url = await searchPexels(query3);
  }

  // 4. Fallback finale: per Music usa sempre query musicale generica
  if (!url) {
    if (isMusic) {
      const musicFallbacks = ["music concert", "live music", "musician playing", "music studio", "vinyl record"];
      const fallbackQuery = musicFallbacks[Math.floor(Math.random() * musicFallbacks.length)];
      url = await searchPexels(fallbackQuery);
    }
  }

  // 5. Fallback Unsplash
  if (!url) {
    url = getUnsplashFallback(category, title);
  }

  return url;
}

/**
 * Versione specializzata per news
 */
export async function findNewsImage(title: string, category: string): Promise<string | null> {
  return findStockImage(title, category);
}

/**
 * Versione specializzata per editoriale
 */
export async function findEditorialImage(title: string, keyTrend: string): Promise<string | null> {
  return findStockImage(title, "Modelli Generativi", keyTrend);
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
