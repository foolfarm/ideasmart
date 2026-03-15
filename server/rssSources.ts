/**
 * RSS Sources Whitelist — IDEASMART
 * Fonti certificate con feed RSS verificati per le tre sezioni.
 * Queste sono le UNICHE fonti usate per lo scraping delle notizie.
 * Nessuna notizia viene inventata: tutto deriva da feed RSS reali.
 */

export interface RssSource {
  name: string;           // Nome visualizzato della fonte
  homepage: string;       // URL homepage (usato come sourceUrl)
  feedUrl: string;        // URL del feed RSS
  section: "ai" | "music" | "startup";
  language: "it" | "en";
  priority: number;       // 1=alta, 2=media, 3=bassa
}

// ─── AI4Business Sources ──────────────────────────────────────────────────────
export const AI_SOURCES: RssSource[] = [
  {
    name: "TechCrunch AI",
    homepage: "https://techcrunch.com",
    feedUrl: "https://techcrunch.com/category/artificial-intelligence/feed/",
    section: "ai", language: "en", priority: 1,
  },
  {
    name: "Wired",
    homepage: "https://www.wired.com",
    feedUrl: "https://www.wired.com/feed/rss",
    section: "ai", language: "en", priority: 1,
  },
  {
    name: "VentureBeat AI",
    homepage: "https://venturebeat.com",
    feedUrl: "https://venturebeat.com/category/ai/feed/",
    section: "ai", language: "en", priority: 1,
  },
  {
    name: "MIT Technology Review",
    homepage: "https://www.technologyreview.com",
    feedUrl: "https://www.technologyreview.com/feed/",
    section: "ai", language: "en", priority: 1,
  },
  {
    name: "The Verge AI",
    homepage: "https://www.theverge.com",
    feedUrl: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
    section: "ai", language: "en", priority: 1,
  },
  {
    name: "Ars Technica AI",
    homepage: "https://arstechnica.com",
    feedUrl: "https://feeds.arstechnica.com/arstechnica/index",
    section: "ai", language: "en", priority: 2,
  },
  {
    name: "Reuters Technology",
    homepage: "https://www.reuters.com",
    feedUrl: "https://feeds.reuters.com/reuters/technologyNews",
    section: "ai", language: "en", priority: 1,
  },
  {
    name: "Il Sole 24 Ore Tecnologia",
    homepage: "https://www.ilsole24ore.com",
    feedUrl: "https://www.ilsole24ore.com/rss/tecnologia.xml",
    section: "ai", language: "it", priority: 1,
  },
  {
    name: "Corriere Innovazione",
    homepage: "https://www.corriere.it",
    feedUrl: "https://www.corriere.it/rss/innovazione.xml",
    section: "ai", language: "it", priority: 2,
  },
  {
    name: "Tom's Hardware",
    homepage: "https://www.tomshw.it",
    feedUrl: "https://www.tomshw.it/feed/",
    section: "ai", language: "it", priority: 2,
  },
  {
    name: "ZDNet",
    homepage: "https://www.zdnet.com",
    feedUrl: "https://www.zdnet.com/news/rss.xml",
    section: "ai", language: "en", priority: 2,
  },
  {
    name: "AI News",
    homepage: "https://www.artificialintelligence-news.com",
    feedUrl: "https://www.artificialintelligence-news.com/feed/",
    section: "ai", language: "en", priority: 1,
  },
];

// ─── ITsMusic Sources ─────────────────────────────────────────────────────────
export const MUSIC_SOURCES: RssSource[] = [
  {
    name: "Billboard",
    homepage: "https://www.billboard.com",
    feedUrl: "https://www.billboard.com/feed/",
    section: "music", language: "en", priority: 1,
  },
  {
    name: "Rolling Stone",
    homepage: "https://www.rollingstone.com",
    feedUrl: "https://www.rollingstone.com/music/feed/",
    section: "music", language: "en", priority: 1,
  },
  {
    name: "NME",
    homepage: "https://www.nme.com",
    feedUrl: "https://www.nme.com/feed",
    section: "music", language: "en", priority: 1,
  },
  {
    name: "Pitchfork",
    homepage: "https://pitchfork.com",
    feedUrl: "https://pitchfork.com/rss/news/",
    section: "music", language: "en", priority: 1,
  },
  {
    name: "Consequence of Sound",
    homepage: "https://consequence.net",
    feedUrl: "https://consequence.net/feed/",
    section: "music", language: "en", priority: 2,
  },
  {
    name: "Music Business Worldwide",
    homepage: "https://www.musicbusinessworldwide.com",
    feedUrl: "https://www.musicbusinessworldwide.com/feed/",
    section: "music", language: "en", priority: 1,
  },
  {
    name: "Variety Music",
    homepage: "https://variety.com",
    feedUrl: "https://variety.com/v/music/feed/",
    section: "music", language: "en", priority: 2,
  },
  {
    name: "Rockol",
    homepage: "https://www.rockol.it",
    feedUrl: "https://www.rockol.it/feed/news",
    section: "music", language: "it", priority: 1,
  },
  {
    name: "Soundsblog",
    homepage: "https://www.soundsblog.it",
    feedUrl: "https://www.soundsblog.it/feed",
    section: "music", language: "it", priority: 2,
  },
  {
    name: "Loud and Clear Reviews",
    homepage: "https://loudandclearreviews.com",
    feedUrl: "https://loudandclearreviews.com/feed/",
    section: "music", language: "en", priority: 2,
  },
];

// ─── Startup News Sources ─────────────────────────────────────────────────────
export const STARTUP_SOURCES: RssSource[] = [
  {
    name: "TechCrunch Startups",
    homepage: "https://techcrunch.com",
    feedUrl: "https://techcrunch.com/category/startups/feed/",
    section: "startup", language: "en", priority: 1,
  },
  {
    name: "Sifted",
    homepage: "https://sifted.eu",
    feedUrl: "https://sifted.eu/feed",
    section: "startup", language: "en", priority: 1,
  },
  {
    name: "Startup Italia",
    homepage: "https://www.startupitalia.eu",
    feedUrl: "https://www.startupitalia.eu/feed",
    section: "startup", language: "it", priority: 1,
  },
  {
    name: "Il Sole 24 Ore Startup",
    homepage: "https://www.ilsole24ore.com",
    feedUrl: "https://www.ilsole24ore.com/rss/economia.xml",
    section: "startup", language: "it", priority: 1,
  },
  {
    name: "Wired Startup",
    homepage: "https://www.wired.com",
    feedUrl: "https://www.wired.com/feed/rss",
    section: "startup", language: "en", priority: 2,
  },
  {
    name: "Crunchbase News",
    homepage: "https://news.crunchbase.com",
    feedUrl: "https://news.crunchbase.com/feed/",
    section: "startup", language: "en", priority: 1,
  },
  {
    name: "VentureBeat",
    homepage: "https://venturebeat.com",
    feedUrl: "https://venturebeat.com/feed/",
    section: "startup", language: "en", priority: 1,
  },
  {
    name: "Forbes Entrepreneurs",
    homepage: "https://www.forbes.com",
    feedUrl: "https://www.forbes.com/entrepreneurs/feed2/",
    section: "startup", language: "en", priority: 2,
  },
  {
    name: "Repubblica Economia",
    homepage: "https://www.repubblica.it",
    feedUrl: "https://www.repubblica.it/rss/economia/rss2.0.xml",
    section: "startup", language: "it", priority: 2,
  },
  {
    name: "Corriere Economia",
    homepage: "https://www.corriere.it",
    feedUrl: "https://www.corriere.it/rss/economia.xml",
    section: "startup", language: "it", priority: 2,
  },
  {
    name: "EU-Startups",
    homepage: "https://www.eu-startups.com",
    feedUrl: "https://www.eu-startups.com/feed/",
    section: "startup", language: "en", priority: 1,
  },
];

// ─── Fallback homepage per dominio ───────────────────────────────────────────
// Mappa dominio → homepage sicura (usata quando un URL specifico è 404)
export const DOMAIN_FALLBACKS: Record<string, string> = {
  // AI
  "techcrunch.com": "https://techcrunch.com",
  "wired.com": "https://www.wired.com",
  "www.wired.com": "https://www.wired.com",
  "venturebeat.com": "https://venturebeat.com",
  "technologyreview.com": "https://www.technologyreview.com",
  "www.technologyreview.com": "https://www.technologyreview.com",
  "theverge.com": "https://www.theverge.com",
  "www.theverge.com": "https://www.theverge.com",
  "arstechnica.com": "https://arstechnica.com",
  "reuters.com": "https://www.reuters.com",
  "www.reuters.com": "https://www.reuters.com",
  "ilsole24ore.com": "https://www.ilsole24ore.com",
  "www.ilsole24ore.com": "https://www.ilsole24ore.com",
  "corriere.it": "https://www.corriere.it",
  "www.corriere.it": "https://www.corriere.it",
  "zdnet.com": "https://www.zdnet.com",
  "artificialintelligence-news.com": "https://www.artificialintelligence-news.com",
  "tomshw.it": "https://www.tomshw.it",
  "openai.com": "https://openai.com",
  "deepmind.google": "https://deepmind.google",
  "blogs.microsoft.com": "https://blogs.microsoft.com",
  "microsoft.com": "https://www.microsoft.com",
  "www.microsoft.com": "https://www.microsoft.com",
  "google.com": "https://www.google.com",
  "bloomberg.com": "https://www.bloomberg.com",
  "www.bloomberg.com": "https://www.bloomberg.com",
  "wsj.com": "https://www.wsj.com",
  "www.wsj.com": "https://www.wsj.com",
  "hbr.org": "https://hbr.org",
  "nature.com": "https://www.nature.com",
  "www.nature.com": "https://www.nature.com",
  "intel.com": "https://www.intel.com",
  "www.intel.com": "https://www.intel.com",
  "europarl.europa.eu": "https://www.europarl.europa.eu",
  "commission.europa.eu": "https://commission.europa.eu",
  "nato.int": "https://www.nato.int",
  "www.nato.int": "https://www.nato.int",
  // Music
  "billboard.com": "https://www.billboard.com",
  "www.billboard.com": "https://www.billboard.com",
  "rollingstone.com": "https://www.rollingstone.com",
  "www.rollingstone.com": "https://www.rollingstone.com",
  "nme.com": "https://www.nme.com",
  "www.nme.com": "https://www.nme.com",
  "pitchfork.com": "https://pitchfork.com",
  "consequence.net": "https://consequence.net",
  "musicbusinessworldwide.com": "https://www.musicbusinessworldwide.com",
  "www.musicbusinessworldwide.com": "https://www.musicbusinessworldwide.com",
  "variety.com": "https://variety.com",
  "rockol.it": "https://www.rockol.it",
  "www.rockol.it": "https://www.rockol.it",
  "soundsblog.it": "https://www.soundsblog.it",
  "www.soundsblog.it": "https://www.soundsblog.it",
  // Startup
  "sifted.eu": "https://sifted.eu",
  "startupitalia.eu": "https://www.startupitalia.eu",
  "www.startupitalia.eu": "https://www.startupitalia.eu",
  "news.crunchbase.com": "https://news.crunchbase.com",
  "crunchbase.com": "https://www.crunchbase.com",
  "forbes.com": "https://www.forbes.com",
  "www.forbes.com": "https://www.forbes.com",
  "repubblica.it": "https://www.repubblica.it",
  "www.repubblica.it": "https://www.repubblica.it",
  "eu-startups.com": "https://www.eu-startups.com",
  "www.eu-startups.com": "https://www.eu-startups.com",
};

// ─── Fallback di sezione (usato se il dominio non è in whitelist) ─────────────
export const SECTION_FALLBACKS: Record<string, string> = {
  ai: "https://techcrunch.com",
  music: "https://www.billboard.com",
  startup: "https://techcrunch.com",
};

/**
 * Estrae il dominio da un URL e restituisce la homepage sicura dalla whitelist.
 * Se il dominio non è in whitelist, restituisce il fallback di sezione.
 */
export function getHomepageForUrl(url: string, section: "ai" | "music" | "startup"): string {
  try {
    const parsed = new URL(url);
    const domain = parsed.hostname.replace(/^www\./, "");
    // Cerca prima con www, poi senza
    return (
      DOMAIN_FALLBACKS[parsed.hostname] ||
      DOMAIN_FALLBACKS[domain] ||
      `${parsed.protocol}//${parsed.hostname}` ||
      SECTION_FALLBACKS[section]
    );
  } catch {
    return SECTION_FALLBACKS[section];
  }
}

export const ALL_SOURCES = [...AI_SOURCES, ...MUSIC_SOURCES, ...STARTUP_SOURCES];
