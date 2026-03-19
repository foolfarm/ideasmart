/**
 * IDEASMART — Prima Pagina di Giornale Multisezionale
 * Layout editoriale: testata, News Italia in apertura, tutte le 14 sezioni bilanciate, video.
 * Palette: bianco carta (#faf8f3), inchiostro (#1a1a2e), accenti per sezione.
 * Tipografia: Playfair Display (titoli), Source Serif 4 (corpo), Space Mono (label/meta).
 */
import { useMemo, useRef, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import SEOHead from "@/components/SEOHead";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import PuntoDelGiorno from "@/components/PuntoDelGiorno";

const SECTION_COLORS = {
  ai: { accent: "#0a6e5c", light: "#e6f4f1", label: "AI4Business", path: "/ai" },
  music: { accent: "#5b21b6", light: "#ede9fe", label: "ITsMusic", path: "/music" },
  startup: { accent: "#c2410c", light: "#fff0e6", label: "Startup News", path: "/startup" },
  finance: { accent: "#15803d", light: "#f0fdf4", label: "Finance & Markets", path: "/finance" },
  health: { accent: "#0369a1", light: "#eff6ff", label: "Health & Biotech", path: "/health" },
  sport: { accent: "#b45309", light: "#fffbeb", label: "Sport & Business", path: "/sport" },
  luxury: { accent: "#7c3aed", light: "#faf5ff", label: "Lifestyle & Luxury", path: "/luxury" },
  news: { accent: "#1a1f2e", light: "#f1f5f9", label: "News Italia", path: "/news" },
  motori: { accent: "#dc2626", light: "#fef2f2", label: "Motori", path: "/motori" },
  tennis: { accent: "#65a30d", light: "#f7fee7", label: "Tennis", path: "/tennis" },
  basket: { accent: "#ea580c", light: "#fff7ed", label: "Basket", path: "/basket" },
  gossip: { accent: "#db2777", light: "#fdf2f8", label: "Business Gossip", path: "/gossip" },
  cybersecurity: { accent: "#0ea5e9", light: "#f0f9ff", label: "Cybersecurity", path: "/cybersecurity" },
  sondaggi: { accent: "#8b5cf6", light: "#f5f3ff", label: "Sondaggi", path: "/sondaggi" },
};

function formatDateIT(date: Date): string {
  return date.toLocaleDateString("it-IT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function formatShortDate(str: string): string {
  if (!str) return "";
  try {
    return new Date(str).toLocaleDateString("it-IT", { day: "numeric", month: "short" });
  } catch { return str; }
}

function Divider({ thick = false }: { thick?: boolean }) {
  return <div className={`w-full ${thick ? "border-t-4" : "border-t"} border-[#1a1a2e]`} />;
}

function ThinDivider() {
  return <div className="w-full border-t border-[#1a1a2e]/20" />;
}

type SectionKey = "ai" | "music" | "startup" | "finance" | "health" | "sport" | "luxury" | "news" | "motori" | "tennis" | "basket" | "gossip" | "cybersecurity" | "sondaggi";

function SectionLabel({ section }: { section: SectionKey }) {
  const s = SECTION_COLORS[section];
  return (
    <span
      className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm"
      style={{ background: s.light, color: s.accent, fontFamily: "'Space Mono', monospace" }}
    >
      {s.label}
    </span>
  );
}

type NewsItem = {
  id: number;
  title: string;
  summary: string;
  category: string;
  sourceName: string;
  sourceUrl: string;
  publishedAt: string;
  imageUrl: string | null;
  videoUrl?: string | null;
  section?: string;
};

/** Hero news: grande titolo + immagine + sommario */
function HeroNewsBlock({ item, section, editorial }: {
  item: NewsItem;
  section: SectionKey;
  editorial?: { id?: number; title: string; subtitle?: string | null; body: string } | null;
}) {
  const s = SECTION_COLORS[section];
  const href = editorial?.id
    ? `/${section}/editoriale/${editorial.id}`
    : (item.sourceUrl && item.sourceUrl !== '#' ? item.sourceUrl : `https://www.google.com/search?q=${encodeURIComponent(item.title)}`);
  const isExternal = !editorial?.id;
  const displayTitle = editorial?.title || item.title;
  const displayBody = editorial?.body || item.summary;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-0">
      <div className="pr-0 md:pr-6 py-4">
        <SectionLabel section={section} />
        {isExternal ? (
          <a href={href} target="_blank" rel="noopener noreferrer">
            <h2 className="mt-3 text-3xl md:text-4xl font-bold leading-tight text-[#1a1a2e] hover:underline cursor-pointer"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {displayTitle}
            </h2>
          </a>
        ) : (
          <Link href={href}>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold leading-tight text-[#1a1a2e] hover:underline cursor-pointer"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {displayTitle}
            </h2>
          </Link>
        )}
        {(editorial?.subtitle || item.category) && (
          <p className="mt-2 text-base font-semibold text-[#1a1a2e]/60 italic"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
            {editorial?.subtitle || item.category}
          </p>
        )}
        <ThinDivider />
        <p className="mt-3 text-base leading-relaxed text-[#1a1a2e]/80"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
          {displayBody.slice(0, 300)}{displayBody.length > 300 ? "…" : ""}
        </p>
        {isExternal ? (
          <a href={href} target="_blank" rel="noopener noreferrer">
            <span className="mt-4 inline-block text-xs font-bold uppercase tracking-widest hover:underline"
              style={{ color: s.accent, fontFamily: "'Space Mono', monospace" }}>
              Leggi l'articolo originale →
            </span>
          </a>
        ) : (
          <Link href={href}>
            <span className="mt-4 inline-block text-xs font-bold uppercase tracking-widest hover:underline"
              style={{ color: s.accent, fontFamily: "'Space Mono', monospace" }}>
              Continua a leggere →
            </span>
          </Link>
        )}
        {item.sourceName && (
          <p className="mt-2 text-[10px] text-[#1a1a2e]/35 italic"
            style={{ fontFamily: "'Space Mono', monospace" }}>
            Fonte: {item.sourceName}{item.publishedAt ? ` · ${formatShortDate(item.publishedAt)}` : ""}
          </p>
        )}
      </div>
      <div className="py-4 pl-0 md:pl-6 border-l-0 md:border-l border-[#1a1a2e]/20 flex items-start justify-center">
        {/* Spazio pubblicitario: banner Tradedoubler per i blocchi principali */}
        {section === "ai" ? (
          /* Skyscraper 120x600 per il blocco AI4Business */
          <div
            className="flex items-center justify-center overflow-hidden mx-auto"
            style={{ width: "120px", height: "600px", maxWidth: "100%", border: "1px solid rgba(26,26,46,0.10)", background: "#f5f2ec" }}
          >
            <a
              href="https://clk.tradedoubler.com/click?p=377429&a=3477790&g=25854308"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={`https://imp.tradedoubler.com/imp?type(img)g(25854308)a(3477790)${Math.random().toString().substring(2, 11)}`}
                width="120"
                height="600"
                alt="Pubblicità"
                style={{ display: "block", width: "120px", height: "600px", objectFit: "cover" }}
              />
            </a>
          </div>
        ) : section === "news" ? (
          <div
            className="flex items-center justify-center overflow-hidden"
            style={{ width: "300px", height: "250px", maxWidth: "100%", border: "1px solid rgba(26,26,46,0.10)", background: "#f5f2ec" }}
          >
            <a
              href="https://clk.tradedoubler.com/click?p=328374&a=3477790&g=26055766"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={`https://imp.tradedoubler.com/imp?type(img)g(26055766)a(3477790)${Math.random().toString().substring(2, 11)}`}
                width="300"
                height="250"
                alt="Pubblicità"
                style={{ display: "block", width: "300px", height: "250px", objectFit: "cover" }}
              />
            </a>
          </div>
        ) : item.videoUrl ? (
          <div className="w-full aspect-video" style={{ border: "1px solid rgba(26,26,46,0.15)" }}>
            <iframe
              src={item.videoUrl}
              title={item.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : item.imageUrl ? (
          isExternal ? (
            <a href={href} target="_blank" rel="noopener noreferrer">
              <img src={item.imageUrl} alt={item.title} loading="lazy" decoding="async"
                className="w-full h-56 md:h-64 object-cover grayscale-[20%] hover:grayscale-0 transition-all cursor-pointer"
                style={{ border: "1px solid rgba(26,26,46,0.15)" }} />
            </a>
          ) : (
            <Link href={href}>
              <img src={item.imageUrl} alt={item.title} loading="lazy" decoding="async"
                className="w-full h-56 md:h-64 object-cover grayscale-[20%] hover:grayscale-0 transition-all cursor-pointer"
                style={{ border: "1px solid rgba(26,26,46,0.15)" }} />
            </Link>
          )
        ) : (
          <div className="w-full h-56 md:h-64 flex items-center justify-center"
            style={{ background: s.light, border: `1px solid ${s.accent}30` }}>
            <span className="text-4xl opacity-30">📰</span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Card notizia con immagine opzionale */
function NewsCard({ item, section, showImage = false }: {
  item: NewsItem;
  section: SectionKey;
  showImage?: boolean;
}) {
  const s = SECTION_COLORS[section];
  const href = item.sourceUrl && item.sourceUrl !== '#' ? item.sourceUrl : `https://www.google.com/search?q=${encodeURIComponent(item.title)}`;
  return (
    <div className="py-3">
      {showImage && item.videoUrl ? (
        <div className="w-full aspect-video mb-2" style={{ border: "1px solid rgba(26,26,46,0.1)" }}>
          <iframe
            src={item.videoUrl}
            title={item.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : showImage && item.imageUrl ? (
        <a href={href} target="_blank" rel="noopener noreferrer">
          <img src={item.imageUrl} alt={item.title} loading="lazy" decoding="async"
            className="w-full h-32 object-cover mb-2 grayscale-[20%] hover:grayscale-0 transition-all cursor-pointer"
            style={{ border: "1px solid rgba(26,26,46,0.1)" }} />
        </a>
      ) : null}
      <a href={href} target="_blank" rel="noopener noreferrer">
        <h3 className="text-base font-bold leading-snug text-[#1a1a2e] hover:underline cursor-pointer"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {item.title}
        </h3>
      </a>
      <p className="mt-1 text-sm leading-relaxed text-[#1a1a2e]/65 line-clamp-3"
        style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
        {item.summary}
      </p>
      {item.sourceName && (
        <p className="mt-1 text-[10px] text-[#1a1a2e]/35"
          style={{ fontFamily: "'Space Mono', monospace" }}>
          {item.sourceName}{item.publishedAt ? ` · ${formatShortDate(item.publishedAt)}` : ""}
          {item.videoUrl && <span className="ml-2 text-[#dc2626]">▶ VIDEO</span>}
        </p>
      )}
    </div>
  );
}

/** Riga notizia compatta per elenchi */
function NewsRow({ item, section }: {
  item: NewsItem;
  section: SectionKey;
}) {
  const href = item.sourceUrl && item.sourceUrl !== '#' ? item.sourceUrl : `https://www.google.com/search?q=${encodeURIComponent(item.title)}`;
  return (
    <div className="py-2.5 grid grid-cols-[auto_1fr] gap-3 items-start">
      <SectionLabel section={section} />
      <div>
        <a href={href} target="_blank" rel="noopener noreferrer">
          <span className="text-sm font-semibold text-[#1a1a2e] hover:underline cursor-pointer leading-snug"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {item.title}
          </span>
        </a>
        {item.sourceName && (
          <span className="ml-2 text-[10px] text-[#1a1a2e]/35"
            style={{ fontFamily: "'Space Mono', monospace" }}>
            {item.sourceName}{item.publishedAt ? ` · ${formatShortDate(item.publishedAt)}` : ""}
            {item.videoUrl && <span className="ml-1 text-[#dc2626]">▶</span>}
          </span>
        )}
      </div>
    </div>
  );
}

/** Colonna sezione con titolo, lista notizie e link "tutte le notizie" */
function SectionColumn({ section, items, colIdx, showFirstImage = false }: {
  section: SectionKey;
  items: NewsItem[];
  colIdx: number;
  showFirstImage?: boolean;
}) {
  const s = SECTION_COLORS[section];
  return (
    <div className={colIdx > 0 ? "border-l border-[#1a1a2e]/20 pl-4" : "pr-4"}>
      <div className="py-2">
        <Link href={s.path}>
          <span className="text-xs font-bold uppercase tracking-widest hover:underline cursor-pointer"
            style={{ color: s.accent, fontFamily: "'Space Mono', monospace" }}>
            {s.label}
          </span>
        </Link>
      </div>
      <div className="border-t-2" style={{ borderColor: s.accent }} />
      {items.length > 0 ? (
        items.map((item, i) => (
          <div key={item.id}>
            <NewsCard item={item} section={section} showImage={showFirstImage && i === 0} />
            {i < items.length - 1 && <ThinDivider />}
          </div>
        ))
      ) : (
        <div className="py-6 text-center text-[#1a1a2e]/25 text-sm">In arrivo…</div>
      )}
      <Link href={s.path}>
        <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-widest hover:underline cursor-pointer"
          style={{ color: s.accent, fontFamily: "'Space Mono', monospace" }}>
          Tutte le notizie →
        </span>
      </Link>
    </div>
  );
}

/** Sezione video: mostra le notizie con videoUrl disponibile */
function VideoSection({ allItems }: { allItems: Array<NewsItem & { section: SectionKey }> }) {
  const videoItems = useMemo(() =>
    allItems.filter(n => n.videoUrl).slice(0, 4),
    [allItems]
  );
  if (videoItems.length === 0) return null;
  return (
    <div className="mt-8">
      <Divider thick />
      <div className="py-3 flex items-center gap-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a2e]/40"
          style={{ fontFamily: "'Space Mono', monospace" }}>
          Video del Giorno
        </span>
        <span className="text-[10px] text-[#dc2626] font-bold">▶ LIVE</span>
      </div>
      <ThinDivider />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
        {videoItems.map(item => {
          const s = SECTION_COLORS[item.section];
          return (
            <div key={`${item.section}-${item.id}`} className="flex flex-col">
              <div className="w-full aspect-video" style={{ border: "1px solid rgba(26,26,46,0.15)" }}>
                <iframe
                  src={item.videoUrl!}
                  title={item.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="mt-2">
                <SectionLabel section={item.section} />
                <a href={item.sourceUrl && item.sourceUrl !== '#' ? item.sourceUrl : `https://www.google.com/search?q=${encodeURIComponent(item.title)}`}
                  target="_blank" rel="noopener noreferrer">
                  <p className="mt-1 text-sm font-bold text-[#1a1a2e] hover:underline leading-snug line-clamp-2"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    {item.title}
                  </p>
                </a>
                {item.sourceName && (
                  <p className="mt-0.5 text-[10px] text-[#1a1a2e]/35"
                    style={{ fontFamily: "'Space Mono', monospace" }}>
                    {item.sourceName}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SectionNav: menu con sezione attiva + freccia scorrimento mobile + badge contatori ────────
function SectionNav() {
  const [location] = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const { data: sectionCounts } = trpc.news.getSectionCounts.useQuery(undefined, {
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    check();
    el.addEventListener("scroll", check);
    window.addEventListener("resize", check);
    return () => { el.removeEventListener("scroll", check); window.removeEventListener("resize", check); };
  }, []);

  const SECTIONS = ["news", "ai", "startup", "finance", "sport", "motori", "tennis", "basket", "health", "luxury", "music", "gossip", "cybersecurity", "sondaggi"] as const;

  return (
    <nav className="border-t border-[#1a1a2e] overflow-hidden">
      {/* Riga 1: canali editoriali con accent color al hover + indicatore sezione attiva */}
      <div className="relative">
        <div ref={scrollRef} className="overflow-x-auto scrollbar-hide">
          <div className="flex items-stretch min-w-max">
            {SECTIONS.map((sec, i) => {
              const s = SECTION_COLORS[sec];
              const isActive = location === s.path || location.startsWith(s.path + "/");
              return (
                <Link key={sec} href={s.path}>
                  <span
                    className="relative flex items-center px-4 py-2.5 text-[9.5px] font-bold uppercase tracking-[0.12em] cursor-pointer transition-all duration-200"
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      borderLeft: i > 0 ? "1px solid rgba(26,26,46,0.12)" : "none",
                      background: isActive ? s.accent : "",
                      color: isActive ? "#fff" : "#1a1a2e",
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = s.accent;
                        (e.currentTarget as HTMLElement).style.color = "#fff";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = "";
                        (e.currentTarget as HTMLElement).style.color = "#1a1a2e";
                      }
                    }}
                  >
                    {s.label}
                    {sectionCounts && sectionCounts[sec] > 0 && (
                      <span
                        className="ml-1.5 text-[8px] font-bold px-1 py-0.5 rounded-sm"
                        style={{
                          background: isActive ? "rgba(255,255,255,0.25)" : s.light,
                          color: isActive ? "#fff" : s.accent,
                          fontFamily: "'Space Mono', monospace",
                          lineHeight: 1,
                        }}
                      >
                        {sectionCounts[sec]}
                      </span>
                    )}
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-0 right-0 h-[2px]"
                        style={{ background: "#fff", opacity: 0.6 }}
                      />
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
        {/* Freccia scorrimento mobile */}
        {canScrollRight && (
          <button
            className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-8 pointer-events-auto"
            style={{
              background: "linear-gradient(to right, transparent, #faf8f3 70%)",
              border: "none",
              cursor: "pointer",
            }}
            onClick={() => scrollRef.current?.scrollBy({ left: 120, behavior: "smooth" })}
            aria-label="Scorri menu"
          >
            <span style={{ fontSize: "14px", color: "#1a1a2e", fontWeight: "bold" }}>›</span>
          </button>
        )}
      </div>

      {/* Riga 2: pagine istituzionali + maquette Business */}
      <div
        className="flex flex-wrap items-center border-t"
        style={{ borderColor: "rgba(26,26,46,0.10)", background: "#f5f2ec" }}
      >
        <Link href="/edicola">
          <span
            className="flex items-center px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] cursor-pointer transition-colors text-[#1a1a2e]/60 hover:text-[#1a1a2e]"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Edicola
          </span>
        </Link>
        <span className="text-[#1a1a2e]/15 text-xs">|</span>
        <Link href="/manifesto">
          <span
            className="flex items-center px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] cursor-pointer transition-colors text-[#1a1a2e]/60 hover:text-[#0a6e5c]"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Manifesto
          </span>
        </Link>
        <span className="text-[#1a1a2e]/15 text-xs">|</span>
        <Link href="/chi-siamo">
          <span
            className="flex items-center px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] cursor-pointer transition-colors text-[#1a1a2e]/60 hover:text-[#0369a1]"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Chi Siamo
          </span>
        </Link>
        <span className="text-[#1a1a2e]/15 text-xs">|</span>
        <Link href="/tecnologia">
          <span
            className="flex items-center px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] cursor-pointer transition-colors text-[#1a1a2e]/60 hover:text-[#00b89a]"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Tecnologia
          </span>
        </Link>
        <div className="ml-auto flex items-center">
          <Link href="/business">
            <span
              className="flex items-center gap-2 px-5 py-2 text-[9px] font-black uppercase tracking-[0.14em] cursor-pointer transition-all duration-200"
              style={{
                fontFamily: "'Space Mono', monospace",
                background: "#1a1a2e",
                color: "#ff5500",
                letterSpacing: "0.14em",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#ff5500"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#1a1a2e"; (e.currentTarget as HTMLElement).style.color = "#ff5500"; }}
            >
              <span style={{ fontSize: "10px" }}>▶</span>
              IdeaSmart Business
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function Home() {
  const today = useMemo(() => new Date(), []);

  // Singola query ottimizzata per la homepage — staleTime 10 min per evitare refetch inutili
  const queryOpts = { staleTime: 10 * 60 * 1000, refetchOnWindowFocus: false };
  const { data: homeData, isLoading: homeLoading } = trpc.news.getHomeData.useQuery(undefined, queryOpts);
  const { data: newsEditorial } = trpc.editorial.getLatest.useQuery({ section: "news" }, queryOpts);
  const { data: aiEditorial } = trpc.editorial.getLatest.useQuery({ section: "ai" }, queryOpts);

  // Estrae i dati per sezione
  const newsNews = homeData?.news ?? [];
  const aiNews = homeData?.ai ?? [];
  const startupNews = homeData?.startup ?? [];
  const financeNews = homeData?.finance ?? [];
  const sportNews = homeData?.sport ?? [];
  const motoriNews = homeData?.motori ?? [];
  const tennisNews = homeData?.tennis ?? [];
  const basketNews = homeData?.basket ?? [];
  const healthNews = homeData?.health ?? [];
  const luxuryNews = homeData?.luxury ?? [];
  const musicNews = homeData?.music ?? [];
  const gossipNews = homeData?.gossip ?? [];
  const cybersecurityNews = homeData?.cybersecurity ?? [];
  const sondaggiNews = homeData?.sondaggi ?? [];

  // Hero: prima notizia di News Italia con immagine, altrimenti la prima disponibile
  const heroNews = useMemo(() => {
    const all = newsNews || [];
    return all.find(n => n.imageUrl) || all[0] || null;
  }, [newsNews]);

  // Seconda notizia di apertura: prima notizia AI con immagine
  const aiHero = useMemo(() => {
    const all = aiNews || [];
    return all.find(n => n.imageUrl) || all[0] || null;
  }, [aiNews]);

  // Aggregato di tutti gli item con sezione per la sezione video
  type MixedItem = NewsItem & { section: SectionKey };
  const allItemsWithSection = useMemo((): MixedItem[] => {
    const sections: Array<[SectionKey, NewsItem[]]> = [
      ["news", newsNews], ["ai", aiNews], ["startup", startupNews],
      ["finance", financeNews], ["sport", sportNews], ["motori", motoriNews],
      ["tennis", tennisNews], ["basket", basketNews], ["health", healthNews],
      ["luxury", luxuryNews], ["music", musicNews], ["gossip", gossipNews],
      ["cybersecurity", cybersecurityNews], ["sondaggi", sondaggiNews],
    ];
    return sections.flatMap(([sec, items]) => items.map(n => ({ ...n, section: sec })));
  }, [newsNews, aiNews, startupNews, financeNews, sportNews, motoriNews,
    tennisNews, basketNews, healthNews, luxuryNews, musicNews, gossipNews,
    cybersecurityNews, sondaggiNews]);

  return (
    <>
      <SEOHead
        title="IDEASMART — Testata Giornalistica HumanLess"
        description="La prima testata giornalistica HumanLess italiana: notizie su AI, Startup, Finance, Sport, Motori, Tennis, Health, Luxury, Music, Gossip e Cybersecurity."
        canonical="https://ideasmart.ai"
        ogSiteName="IDEASMART"
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,600&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,300;1,8..60,400&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
      `}</style>

      <div className="min-h-screen" style={{ background: "#faf8f3", color: "#1a1a2e" }}>

        {/* ── TESTATA ── */}
        <header className="max-w-6xl mx-auto px-4 pt-6 pb-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#1a1a2e]/50 uppercase tracking-widest"
              style={{ fontFamily: "'Space Mono', monospace" }}>
              {formatDateIT(today)}
            </span>
            <span className="text-xs text-[#1a1a2e]/40 uppercase tracking-widest"
              style={{ fontFamily: "'Space Mono', monospace" }}>
              Testata 100% HumanLess
            </span>
          </div>

          <Divider thick />

          {/* ── TESTATA CON MANCHETTE (layout 3 colonne: manchette | brand | manchette) ── */}
          <div className="grid grid-cols-1 md:grid-cols-[140px_1fr_140px] items-center gap-4 py-4 md:py-5">

            {/* MANCHETTE SINISTRA — IdeaSmart Business */}
            <div className="hidden md:flex justify-end">
              <Link href="/business">
                <div
                  className="w-[130px] h-[130px] border-2 flex flex-col items-center justify-center text-center p-3 cursor-pointer hover:shadow-md transition-all group"
                  style={{ borderColor: "#ff5500", background: "#fff4f0" }}
                >
                  <span
                    className="text-[8px] font-bold uppercase tracking-[0.15em] block mb-1.5"
                    style={{ color: "#ff5500", fontFamily: "'Space Mono', monospace" }}
                  >
                    IdeaSmart Business
                  </span>
                  <span
                    className="text-[13px] font-black leading-tight block mb-2.5"
                    style={{ color: "#1a1a2e", fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Crea il tuo giornale AI powered
                  </span>
                  <span
                    className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5"
                    style={{ background: "#ff5500", color: "#fff", fontFamily: "'Space Mono', monospace" }}
                  >
                    Scopri →
                  </span>
                </div>
              </Link>
            </div>

            {/* BRAND CENTRALE */}
            <div className="text-center">
              <Link href="/">
                <h1 className="text-5xl md:text-7xl font-black tracking-tight text-[#1a1a2e] cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.02em" }}>
                  IdeaSmart
                </h1>
              </Link>
              <p className="mt-1 text-xs uppercase tracking-[0.3em] text-[#1a1a2e]/50"
                style={{ fontFamily: "'Space Mono', monospace" }}>
                La Prima Testata Giornalistica HumanLess italiana
              </p>
              <p className="mt-1 text-[11px] text-[#1a1a2e]/40 italic"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "0.02em" }}>
                Adrian Lenice, Direttore Responsabile
              </p>
            </div>

            {/* MANCHETTE DESTRA — Banner Tradedoubler */}
            <div className="hidden md:flex justify-start">
              <div
                className="w-[130px] h-[130px] border overflow-hidden flex items-center justify-center"
                style={{ borderColor: "rgba(26,26,46,0.20)", background: "#f5f2ec" }}
              >
                {/* Banner Tradedoubler 130x130 (g=25914926) */}
                <a
                  href="https://clk.tradedoubler.com/click?p=354184&a=3477790&g=25914926"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={`https://imp.tradedoubler.com/imp?type(img)g(25914926)a(3477790)${Math.random().toString().substring(2, 11)}`}
                    width="130"
                    height="130"
                    alt="Pubblicità"
                    style={{ display: "block", width: "130px", height: "130px", objectFit: "cover" }}
                  />
                </a>
              </div>
            </div>

          </div>

          <Divider thick />

          {/* Barra navigazione sezioni */}
          {/* Menu navigazione elegante — due righe: canali editoriali + pagine istituzionali */}
          <SectionNav />

          <Divider />
        </header>

        <BreakingNewsTicker />

        {/* ── CORPO ── */}
        <main className="max-w-6xl mx-auto px-4 pb-12">
          {/* H2 per SEO — visivamente nascosto */}
          <h2 className="sr-only">Ultime notizie: AI, Startup, Finance, Sport, Motori, Tennis, Health, Luxury, Music, Gossip, Cybersecurity e Sondaggi</h2>

          {/* ═══════════════════════════════════════════════════════════
              BLOCCO 1 — NEWS ITALIA (apertura principale)
              Layout: hero grande + sidebar con elenco notizie Italia
          ══════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-0 mt-0">

            {/* Hero News Italia */}
            <div className="pr-0 lg:pr-6 border-r-0 lg:border-r border-[#1a1a2e]/20">
              <div className="py-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a2e]/40"
                  style={{ fontFamily: "'Space Mono', monospace" }}>
                  Apertura — News Italia
                </span>
              </div>
              <ThinDivider />
              {heroNews ? (
                <HeroNewsBlock item={heroNews} section="news" editorial={newsEditorial} />
              ) : homeLoading ? (
                <div className="py-6 space-y-3 animate-pulse">
                  <div className="h-4 bg-[#1a1a2e]/10 rounded w-1/4" />
                  <div className="h-8 bg-[#1a1a2e]/10 rounded w-3/4" />
                  <div className="h-8 bg-[#1a1a2e]/10 rounded w-2/3" />
                  <div className="h-48 bg-[#1a1a2e]/8 rounded" />
                  <div className="h-4 bg-[#1a1a2e]/10 rounded w-full" />
                  <div className="h-4 bg-[#1a1a2e]/10 rounded w-5/6" />
                </div>
              ) : (
                <div className="py-12 text-center text-[#1a1a2e]/30">
                  <p style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>Nessuna notizia disponibile</p>
                </div>
              )}
              <ThinDivider />
              {/* Griglia 2 col con le successive notizie News Italia */}
              {newsNews.filter(n => n.id !== heroNews?.id).slice(0, 4).length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 mt-2">
                  {newsNews.filter(n => n.id !== heroNews?.id).slice(0, 4).map((item, i) => (
                    <div key={item.id} className={i % 2 !== 0 ? "border-l border-[#1a1a2e]/20 pl-4" : "pr-4"}>
                      <NewsCard item={item} section="news" showImage={i < 2} />
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3">
                <Link href="/news">
                  <span className="text-[10px] font-bold uppercase tracking-widest hover:underline cursor-pointer"
                    style={{ color: SECTION_COLORS.news.accent, fontFamily: "'Space Mono', monospace" }}>
                    Tutte le notizie italiane →
                  </span>
                </Link>
              </div>
            </div>

            {/* Sidebar: I Canali + Editoriale AI */}
            <div className="pl-0 lg:pl-5 mt-6 lg:mt-0">
              <div className="py-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a2e]/40"
                  style={{ fontFamily: "'Space Mono', monospace" }}>
                  I Canali
                </span>
              </div>
              <ThinDivider />
              {(["news", "ai", "startup", "finance", "sport", "motori", "tennis", "basket", "health", "luxury", "music", "gossip", "cybersecurity", "sondaggi"] as const).map((sec) => {
                const s = SECTION_COLORS[sec];
                return (
                  <Link key={sec} href={s.path}>
                    <div className="py-2 flex items-center justify-between group cursor-pointer hover:opacity-50 transition-opacity border-b border-[#1a1a2e]/10">
                      <span className="text-sm font-bold text-[#1a1a2e]"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                        {s.label}
                      </span>
                      <span className="text-xs text-[#1a1a2e]/30 group-hover:text-[#1a1a2e]/60 transition-colors"
                        style={{ fontFamily: "'Space Mono', monospace" }}>
                        →
                      </span>
                    </div>
                  </Link>
                );
              })}
              {aiEditorial && (
                <div className="mt-4">
                  <div className="py-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a2e]/40"
                      style={{ fontFamily: "'Space Mono', monospace" }}>
                      Editoriale AI
                    </span>
                  </div>
                  <ThinDivider />
                  <div className="py-3">
                    <p className="text-sm font-bold text-[#1a1a2e] leading-snug"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      {aiEditorial.title}
                    </p>
                    {aiEditorial.subtitle && (
                      <p className="mt-1 text-xs italic text-[#1a1a2e]/55"
                        style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                        {aiEditorial.subtitle}
                      </p>
                    )}
                    <p className="mt-2 text-xs leading-relaxed text-[#1a1a2e]/65 line-clamp-4"
                      style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                      {aiEditorial.body}
                    </p>
                    <Link href="/ai">
                      <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-widest hover:underline"
                        style={{ color: SECTION_COLORS.ai.accent, fontFamily: "'Space Mono', monospace" }}>
                        Leggi tutto →
                      </span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Punto del Giorno */}
          <PuntoDelGiorno />

          {/* ── BANNER PUBBLICITARIO LEADERBOARD 728x90 (Tradedoubler) ── */}
          <div className="my-6 flex flex-col items-center">
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#1a1a2e]/30 mb-1"
              style={{ fontFamily: "'Space Mono', monospace" }}>
              Pubblicità
            </p>
            <div
              className="overflow-hidden flex items-center justify-center"
              style={{
                width: "728px",
                height: "90px",
                maxWidth: "100%",
                border: "1px solid rgba(26,26,46,0.08)",
                background: "#f5f2ec",
              }}
            >
              <a
                href="https://clk.tradedoubler.com/click?p=328374&a=3477790&g=25809148"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={`https://imp.tradedoubler.com/imp?type(img)g(25809148)a(3477790)${Math.random().toString().substring(2, 11)}`}
                  width="728"
                  height="90"
                  alt="Pubblicità"
                  style={{ display: "block", width: "728px", height: "90px", maxWidth: "100%", objectFit: "cover" }}
                />
              </a>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              BLOCCO 2 — AI4BUSINESS + STARTUP NEWS (2 colonne grandi)
          ══════════════════════════════════════════════════════════════ */}
          <div className="mt-8">
            <Divider thick />
            <div className="py-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a2e]/40"
                style={{ fontFamily: "'Space Mono', monospace" }}>
                Innovazione & Tecnologia
              </span>
            </div>
            <ThinDivider />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mt-2">
              {/* AI Hero */}
              <div className="pr-0 md:pr-6 border-r-0 md:border-r border-[#1a1a2e]/20">
                <div className="py-2">
                  <Link href="/ai">
                    <span className="text-xs font-bold uppercase tracking-widest hover:underline cursor-pointer"
                      style={{ color: SECTION_COLORS.ai.accent, fontFamily: "'Space Mono', monospace" }}>
                      AI4Business
                    </span>
                  </Link>
                </div>
                <div className="border-t-2" style={{ borderColor: SECTION_COLORS.ai.accent }} />
                {aiHero ? (
                  <HeroNewsBlock item={aiHero} section="ai" editorial={aiEditorial} />
                ) : (
                  <div className="py-8 text-center text-[#1a1a2e]/25 text-sm">Caricamento…</div>
                )}
                {aiNews.filter(n => n.id !== aiHero?.id).slice(0, 2).map((item, i) => (
                  <div key={item.id}>
                    <ThinDivider />
                    <NewsCard item={item} section="ai" />
                  </div>
                ))}
                <Link href="/ai">
                  <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-widest hover:underline cursor-pointer"
                    style={{ color: SECTION_COLORS.ai.accent, fontFamily: "'Space Mono', monospace" }}>
                    Tutte le notizie AI →
                  </span>
                </Link>
              </div>
              {/* Startup */}
              <div className="pl-0 md:pl-6 mt-6 md:mt-0">
                <div className="py-2">
                  <Link href="/startup">
                    <span className="text-xs font-bold uppercase tracking-widest hover:underline cursor-pointer"
                      style={{ color: SECTION_COLORS.startup.accent, fontFamily: "'Space Mono', monospace" }}>
                      Startup News
                    </span>
                  </Link>
                </div>
                <div className="border-t-2" style={{ borderColor: SECTION_COLORS.startup.accent }} />
                {startupNews.slice(0, 4).map((item, i) => (
                  <div key={item.id}>
                    <NewsCard item={item} section="startup" showImage={i === 0} />
                    {i < 3 && <ThinDivider />}
                  </div>
                ))}
                <Link href="/startup">
                  <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-widest hover:underline cursor-pointer"
                    style={{ color: SECTION_COLORS.startup.accent, fontFamily: "'Space Mono', monospace" }}>
                    Tutte le notizie Startup →
                  </span>
                </Link>
                {/* Banner Tradedoubler 300x250 sotto Tutte le notizie Startup */}
                <div className="mt-4 flex justify-center">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-[#1a1a2e]/30 text-center mb-1" style={{ fontFamily: "'Space Mono', monospace" }}>Pubblicità</p>
                    <a
                      href="https://clk.tradedoubler.com/click?p=360031&a=3477790&g=25650800"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={`https://imp.tradedoubler.com/imp?type(img)g(25650800)a(3477790)${Math.random().toString().substring(2, 11)}`}
                        width="300"
                        height="250"
                        alt="Pubblicità"
                        style={{ display: "block", maxWidth: "100%", height: "auto" }}
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              BLOCCO 3 — FINANCE, SPORT, MOTORI (3 colonne)
          ══════════════════════════════════════════════════════════════ */}
          <div className="mt-8">
            <Divider thick />
            <div className="py-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a2e]/40"
                style={{ fontFamily: "'Space Mono', monospace" }}>
                Economia, Sport & Motori
              </span>
            </div>
            <ThinDivider />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mt-2">
              <SectionColumn section="finance" items={financeNews.slice(0, 4)} colIdx={0} showFirstImage />
              <SectionColumn section="sport" items={sportNews.slice(0, 4)} colIdx={1} showFirstImage />
              <SectionColumn section="motori" items={motoriNews.slice(0, 4)} colIdx={2} showFirstImage />
            </div>
            {/* Banner Tradedoubler leaderboard 728x90 sotto il blocco Economia/Sport/Motori */}
            <div className="mt-4 flex justify-center">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-[#1a1a2e]/30 text-center mb-1" style={{ fontFamily: "'Space Mono', monospace" }}>Pubblicità</p>
                <a
                  href="https://clk.tradedoubler.com/click?p=357545&a=3477790&g=25611636"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={`https://imp.tradedoubler.com/imp?type(img)g(25611636)a(3477790)${Math.random().toString().substring(2, 11)}`}
                    width="728"
                    height="90"
                    alt="Pubblicità"
                    style={{ display: "block", maxWidth: "100%", height: "auto" }}
                  />
                </a>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              BLOCCO 4 — TENNIS, BASKET, HEALTH (3 colonne)
          ══════════════════════════════════════════════════════════════ */}
          <div className="mt-8">
            <Divider thick />
            <div className="py-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a2e]/40"
                style={{ fontFamily: "'Space Mono', monospace" }}>
                Sport, Salute & Benessere
              </span>
            </div>
            <ThinDivider />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mt-2">
              <SectionColumn section="tennis" items={tennisNews.slice(0, 4)} colIdx={0} />
              <SectionColumn section="basket" items={basketNews.slice(0, 4)} colIdx={1} />
              <SectionColumn section="health" items={healthNews.slice(0, 4)} colIdx={2} />
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              BLOCCO 5 — VIDEO DEL GIORNO (se disponibili)
          ══════════════════════════════════════════════════════════════ */}
          <VideoSection allItems={allItemsWithSection} />

          {/* ═══════════════════════════════════════════════════════════
              BLOCCO 6 — LUXURY, MUSIC, GOSSIP (3 colonne)
          ══════════════════════════════════════════════════════════════ */}
          <div className="mt-8">
            <Divider thick />
            <div className="py-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a2e]/40"
                style={{ fontFamily: "'Space Mono', monospace" }}>
                Lifestyle, Musica & Gossip Business
              </span>
            </div>
            <ThinDivider />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mt-2">
              <SectionColumn section="luxury" items={luxuryNews.slice(0, 4)} colIdx={0} showFirstImage />
              <SectionColumn section="music" items={musicNews.slice(0, 4)} colIdx={1} showFirstImage />
              <SectionColumn section="gossip" items={gossipNews.slice(0, 4)} colIdx={2} />
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              BLOCCO 7 — CYBERSECURITY + SONDAGGI (2 colonne)
          ══════════════════════════════════════════════════════════════ */}
          <div className="mt-8">
            <Divider thick />
            <div className="py-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a2e]/40"
                style={{ fontFamily: "'Space Mono', monospace" }}>
                Sicurezza & Opinione Pubblica
              </span>
            </div>
            <ThinDivider />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mt-2">
              <div className="pr-0 md:pr-6 border-r-0 md:border-r border-[#1a1a2e]/20">
                <SectionColumn section="cybersecurity" items={cybersecurityNews.slice(0, 5)} colIdx={0} />
              </div>
              <div className="pl-0 md:pl-6 mt-6 md:mt-0">
                <SectionColumn section="sondaggi" items={sondaggiNews.slice(0, 5)} colIdx={0} />
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              BLOCCO 8 — RASSEGNA COMPLETA (elenco misto tutte le sezioni)
          ══════════════════════════════════════════════════════════════ */}
          <div className="mt-8">
            <Divider thick />
            <div className="py-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a2e]/40"
                style={{ fontFamily: "'Space Mono', monospace" }}>
                Rassegna Completa del Giorno
              </span>
            </div>
            <ThinDivider />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 mt-1">
              {allItemsWithSection
                .filter(n => n.id % 3 === 0) // campionamento distribuito
                .slice(0, 20)
                .map((item, i) => (
                  <div key={`rassegna-${item.section}-${item.id}`}>
                    <NewsRow item={item} section={item.section} />
                    {i < 19 && <ThinDivider />}
                  </div>
                ))}
            </div>
          </div>

          {/* Banner Tradedoubler leaderboard 728x90 pre-footer */}
          <div className="mt-4 flex justify-center">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-[#1a1a2e]/30 text-center mb-1" style={{ fontFamily: "'Space Mono', monospace" }}>Pubblicità</p>
              <a
                href="https://clk.tradedoubler.com/click?p=384511&a=3477790&g=25996460"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={`https://imp.tradedoubler.com/imp?type(img)g(25996460)a(3477790)${Math.random().toString().substring(2, 11)}`}
                  width="728"
                  height="90"
                  alt="Pubblicità"
                  style={{ display: "block", maxWidth: "100%", height: "auto" }}
                />
              </a>
            </div>
          </div>
          {/* Footer testata */}
          <div className="mt-12">
            <Divider thick />
            <div className="py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-xs text-[#1a1a2e]/40"
                style={{ fontFamily: "'Space Mono', monospace" }}>
                {`© ${today.getFullYear()} IdeaSmart · Testata Giornalistica 100% HumanLess`}
              </p>
              <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-end">
                {(["news", "ai", "startup", "finance", "sport", "motori", "tennis", "basket", "health", "luxury", "music", "gossip", "cybersecurity", "sondaggi"] as const).map((sec) => {
                  const s = SECTION_COLORS[sec];
                  return (
                    <Link key={sec} href={s.path}>
                      <span className="text-[10px] hover:underline cursor-pointer"
                        style={{ color: s.accent, fontFamily: "'Space Mono', monospace" }}>
                        {s.label}
                      </span>
                    </Link>
                  );
                })}
                <Link href="/chi-siamo">
                  <span className="text-[10px] hover:underline cursor-pointer font-bold"
                    style={{ color: "#0369a1", fontFamily: "'Space Mono', monospace" }}>
                    Chi Siamo
                  </span>
                </Link>
                <Link href="/business">
                  <span className="text-[10px] hover:underline cursor-pointer font-bold"
                    style={{ color: "#ff5500", fontFamily: "'Space Mono', monospace" }}>
                    IdeaSmart Business
                  </span>
                </Link>
                <Link href="/manifesto">
                  <span className="text-[10px] hover:underline cursor-pointer font-bold"
                    style={{ color: "#0a6e5c", fontFamily: "'Space Mono', monospace" }}>
                    Manifesto HumanLess
                  </span>
                </Link>
                <Link href="/privacy">
                  <span className="text-[10px] hover:underline cursor-pointer text-[#1a1a2e]/40"
                    style={{ fontFamily: "'Space Mono', monospace" }}>
                    Privacy Policy
                  </span>
                </Link>

              </div>
            </div>
          </div>

        </main>
      </div>
    </>
  );
}

