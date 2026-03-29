/*
 * IDEASMART NewsSection — Feed RSS giornaliero AI & Startup
 * Fonti: TechCrunch AI, VentureBeat AI, The Verge AI (via rss2json.com proxy)
 * Aggiornamento: ogni caricamento pagina, cache 1 ora in localStorage
 */
import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  description: string;
  category: string;
  color: string;
}

// RSS sources via rss2json.com (free, no key needed for public feeds)
const RSS_FEEDS = [
  {
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
    source: "TechCrunch AI",
    category: "AI",
    color: "#1a1a1a",
  },
  {
    url: "https://venturebeat.com/category/ai/feed/",
    source: "VentureBeat",
    category: "Startup",
    color: "#0066ff",
  },
  {
    url: "https://www.wired.com/feed/tag/artificial-intelligence/latest/rss",
    source: "Wired",
    category: "Tecnologia",
    color: "#2a2a2a",
  },
];

const RSS2JSON = "https://api.rss2json.com/v1/api.json?rss_url=";
const CACHE_KEY = "ideasmart_news_cache";
const CACHE_TTL = 60 * 60 * 1000; // 1 ora

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, " ").trim().slice(0, 120);
}

function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.a
      ref={ref}
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group block p-4 rounded-xl border border-white/8 hover:border-white/20 transition-all duration-200 hover:bg-white/3"
      style={{ background: "rgba(255,255,255,0.02)" }}
    >
      <div className="flex items-start gap-3">
        {/* Number */}
        <span
          className="text-xs font-black flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center mt-0.5"
          style={{ background: `${item.color}18`, color: item.color, fontFamily: "'JetBrains Mono', monospace" }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="flex-1 min-w-0">
          {/* Category + source + date */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className="text-xs font-bold tracking-widest uppercase"
              style={{ color: item.color, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem" }}
            >
              {item.category}
            </span>
            <span className="text-white/20 text-xs">·</span>
            <span className="text-xs text-white/30" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
              {item.source}
            </span>
            <span className="text-white/20 text-xs">·</span>
            <span className="text-xs text-white/25" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
              {formatDate(item.pubDate)}
            </span>
          </div>

          {/* Title */}
          <h3
            className="text-sm font-semibold text-white/85 group-hover:text-white transition-colors leading-snug mb-1"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
          >
            {item.title}
          </h3>

          {/* Description */}
          {item.description && (
            <p className="text-xs text-white/35 leading-relaxed line-clamp-2" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
              {item.description}
            </p>
          )}
        </div>

        {/* Arrow */}
        <span
          className="text-xs flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-1"
          style={{ color: item.color }}
        >
          →
        </span>
      </div>
    </motion.a>
  );
}

export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  useEffect(() => {
    const loadNews = async () => {
      // Check cache
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL && data.length > 0) {
            setNews(data);
            setLastUpdate(new Date(timestamp).toLocaleString("it-IT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }));
            setLoading(false);
            return;
          }
        }
      } catch {
        // ignore cache errors
      }

      // Fetch from RSS feeds
      try {
        const allItems: NewsItem[] = [];

        await Promise.allSettled(
          RSS_FEEDS.map(async (feed) => {
            try {
              const res = await fetch(`${RSS2JSON}${encodeURIComponent(feed.url)}&count=5`, {
                signal: AbortSignal.timeout(8000),
              });
              if (!res.ok) return;
              const json = await res.json();
              if (json.status !== "ok" || !json.items) return;

              json.items.slice(0, 5).forEach((item: { title: string; link: string; pubDate: string; description?: string; content?: string }) => {
                allItems.push({
                  title: item.title || "",
                  link: item.link || "#",
                  pubDate: item.pubDate || "",
                  source: feed.source,
                  category: feed.category,
                  color: feed.color,
                  description: stripHtml(item.description || item.content || ""),
                });
              });
            } catch {
              // skip failed feed
            }
          })
        );

        // Sort by date descending, take top 10
        const sorted = allItems
          .filter((i) => i.title)
          .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
          .slice(0, 10);

        if (sorted.length > 0) {
          setNews(sorted);
          const now = Date.now();
          setLastUpdate(new Date(now).toLocaleString("it-IT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }));
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data: sorted, timestamp: now }));
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  return (
    <section id="news" className="border-t border-white/8" style={{ background: "#0d1220" }}>
      {/* Section header */}
      <div className="border-b border-white/8" style={{ background: "#060a14" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="editorial-tag text-white/30">05 —</span>
            <span className="editorial-tag" style={{ color: "#1a1a1a" }}>Ultime News · AI &amp; Startup</span>
          </div>
          {lastUpdate && (
            <span className="text-xs text-white/25 hidden sm:block" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              Aggiornato: {lastUpdate}
            </span>
          )}
        </div>
      </div>

      <div className="border-b-2" style={{ borderColor: "#1a1a1a", background: "rgba(0,229,200,0.04)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <h2
            className="text-2xl sm:text-3xl font-black text-white"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
          >
            Le notizie del giorno su AI e startup.
          </h2>
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#1a1a1a" }} />
            <span className="editorial-tag" style={{ color: "#1a1a1a" }}>Live</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Source legend */}
        <div className="flex flex-wrap gap-4 mb-8">
          {RSS_FEEDS.map((f) => (
            <div key={f.source} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: f.color }} />
              <span className="text-xs text-white/40" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>{f.source}</span>
            </div>
          ))}
        </div>

        {loading && (
          <div className="grid sm:grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-xl border border-white/6 animate-pulse"
                style={{ background: "rgba(255,255,255,0.02)" }}
              />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-12 border border-white/8 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)" }}>
            <p className="text-white/40 text-sm mb-2" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
              Impossibile caricare le notizie in questo momento.
            </p>
            <p className="text-white/25 text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              Riprova tra qualche minuto.
            </p>
          </div>
        )}

        {!loading && !error && news.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-3">
            {news.map((item, i) => (
              <NewsCard key={item.link + i} item={item} index={i} />
            ))}
          </div>
        )}

        {/* Footer note */}
        {!loading && news.length > 0 && (
          <p className="text-xs text-white/20 mt-6 text-center" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
            Notizie aggiornate automaticamente ogni ora da TechCrunch, VentureBeat e Wired.
          </p>
        )}
      </div>
    </section>
  );
}
