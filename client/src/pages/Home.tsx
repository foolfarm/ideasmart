/*
 * IDEASMART RESEARCH — Prima Pagina Newsroom
 * Layout: griglia editoriale asimmetrica stile Il Sole 24 Ore / Financial Times
 * Palette: bianco carta (#faf8f3), inchiostro (#1a1a2e), accenti per sezione.
 * Tipografia: Playfair Display (titoli), Source Serif 4 (corpo), Space Mono (label/meta).
 * Struttura: HERO 3 colonne → Striscia Research → AI+Startup misti → Griglia VC/Finance → Footer
 */
import { useMemo, useRef, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import SEOHead from "@/components/SEOHead";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import BreakingNewsSection from "@/components/BreakingNewsSection";
import PuntoDelGiorno from "@/components/PuntoDelGiorno";
import ReadersCounter from "@/components/ReadersCounter";

// ─── Costanti colori sezione ─────────────────────────────────────────────────
const SECTION_COLORS = {
  ai:            { accent: "#0a6e5c", light: "#e6f4f1", label: "AI4Business",        path: "/ai" },
  music:         { accent: "#5b21b6", light: "#ede9fe", label: "ITsMusic",            path: "/music" },
  startup:       { accent: "#c2410c", light: "#fff0e6", label: "Startup News",        path: "/startup" },
  finance:       { accent: "#15803d", light: "#f0fdf4", label: "Finance & Markets",   path: "/finance" },
  health:        { accent: "#0369a1", light: "#eff6ff", label: "Health & Biotech",    path: "/health" },
  sport:         { accent: "#b45309", light: "#fffbeb", label: "Sport & Business",    path: "/sport" },
  luxury:        { accent: "#7c3aed", light: "#faf5ff", label: "Lifestyle & Luxury",  path: "/luxury" },
  news:          { accent: "#1a1f2e", light: "#f1f5f9", label: "News Italia",         path: "/news" },
  motori:        { accent: "#dc2626", light: "#fef2f2", label: "Motori",              path: "/motori" },
  tennis:        { accent: "#65a30d", light: "#f7fee7", label: "Tennis",              path: "/tennis" },
  basket:        { accent: "#ea580c", light: "#fff7ed", label: "Basket",              path: "/basket" },
  gossip:        { accent: "#db2777", light: "#fdf2f8", label: "Business Gossip",     path: "/gossip" },
  cybersecurity: { accent: "#0ea5e9", light: "#f0f9ff", label: "Cybersecurity",       path: "/cybersecurity" },
  sondaggi:      { accent: "#8b5cf6", light: "#f5f3ff", label: "Sondaggi",            path: "/sondaggi" },
};

const RESEARCH_CATEGORY_IMAGES: Record<string, string> = {
  startup:         "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80",
  venture_capital: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80",
  ai_trends:       "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80",
  technology:      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
  market:          "https://images.unsplash.com/photo-1642790551116-18e150f248e3?w=600&q=80",
};

const RESEARCH_CATEGORY_LABELS: Record<string, { label: string; accent: string; bg: string }> = {
  startup:         { label: "Startup",         accent: "#c2410c", bg: "#fff0e6" },
  venture_capital: { label: "Venture Capital", accent: "#15803d", bg: "#f0fdf4" },
  ai_trends:       { label: "AI Trends",       accent: "#0a6e5c", bg: "#e6f4f1" },
  technology:      { label: "Tecnologia",      accent: "#7c3aed", bg: "#faf5ff" },
  market:          { label: "Mercati",         accent: "#0369a1", bg: "#eff6ff" },
};

// ─── Utility ─────────────────────────────────────────────────────────────────
type SectionKey = keyof typeof SECTION_COLORS;

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

function formatDateIT(date: Date): string {
  return date.toLocaleDateString("it-IT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function formatShortDate(str: string): string {
  if (!str) return "";
  try { return new Date(str).toLocaleDateString("it-IT", { day: "numeric", month: "short" }); }
  catch { return str; }
}

function Divider({ thick = false }: { thick?: boolean }) {
  return <div className={`w-full ${thick ? "border-t-4" : "border-t"} border-[#1a1a2e]`} />;
}

function ThinDivider() {
  return <div className="w-full border-t border-[#1a1a2e]/15" />;
}

function SectionLabel({ section }: { section: SectionKey }) {
  const s = SECTION_COLORS[section];
  return (
    <span
      className="inline-block text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm"
      style={{ background: s.light, color: s.accent, fontFamily: "'Space Mono', monospace" }}
    >
      {s.label}
    </span>
  );
}

function ResearchBadge({ label, accent, bg }: { label: string; accent: string; bg: string }) {
  return (
    <span
      className="inline-block text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm"
      style={{ background: bg, color: accent, fontFamily: "'Space Mono', monospace" }}
    >
      {label}
    </span>
  );
}

function NewsItemHref(item: NewsItem): string {
  return item.sourceUrl && item.sourceUrl !== '#'
    ? item.sourceUrl
    : `https://www.google.com/search?q=${encodeURIComponent(item.title)}`;
}

// ─── COMPONENTI LAYOUT ────────────────────────────────────────────────────────

/**
 * Articolo HERO grande: immagine full-width + titolo grande + sommario
 * Usato per l'apertura della prima pagina
 */
function HeroArticle({ item, section, editorial }: {
  item: NewsItem;
  section: SectionKey;
  editorial?: { id?: number; title: string; subtitle?: string | null; body: string } | null;
}) {
  const s = SECTION_COLORS[section];
  const href = editorial?.id
    ? `/${section}/editoriale/${editorial.id}`
    : NewsItemHref(item);
  const isExternal = !editorial?.id;
  const title = editorial?.title || item.title;
  const body = editorial?.body || item.summary;
  const img = item.imageUrl;

  return (
    <article>
      {img && (
        isExternal ? (
          <a href={href} target="_blank" rel="noopener noreferrer">
            <img
              src={img} alt={title} loading="eager" decoding="async"
              className="w-full object-cover grayscale-[10%] hover:grayscale-0 transition-all"
              style={{ height: "260px", border: "1px solid rgba(26,26,46,0.12)" }}
            />
          </a>
        ) : (
          <Link href={href}>
            <img
              src={img} alt={title} loading="eager" decoding="async"
              className="w-full object-cover grayscale-[10%] hover:grayscale-0 transition-all cursor-pointer"
              style={{ height: "260px", border: "1px solid rgba(26,26,46,0.12)" }}
            />
          </Link>
        )
      )}
      <div className="mt-3">
        <SectionLabel section={section} />
        {isExternal ? (
          <a href={href} target="_blank" rel="noopener noreferrer">
            <h2 className="mt-2 text-2xl md:text-3xl font-bold leading-tight text-[#1a1a2e] hover:underline"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {title}
            </h2>
          </a>
        ) : (
          <Link href={href}>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold leading-tight text-[#1a1a2e] hover:underline cursor-pointer"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {title}
            </h2>
          </Link>
        )}
        {editorial?.subtitle && (
          <p className="mt-1 text-sm italic text-[#1a1a2e]/55"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
            {editorial.subtitle}
          </p>
        )}
        <p className="mt-2 text-sm leading-relaxed text-[#1a1a2e]/70 line-clamp-3"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
          {body.slice(0, 240)}{body.length > 240 ? "…" : ""}
        </p>
        <p className="mt-2 text-[10px] text-[#1a1a2e]/35"
          style={{ fontFamily: "'Space Mono', monospace" }}>
          {item.sourceName}{item.publishedAt ? ` · ${formatShortDate(item.publishedAt)}` : ""}
        </p>
      </div>
    </article>
  );
}

/**
 * Articolo MEDIO: titolo medio + sommario breve + immagine opzionale
 * Usato nelle colonne laterali e nelle griglie secondarie
 */
function MediumArticle({ item, section, showImage = false }: {
  item: NewsItem;
  section: SectionKey;
  showImage?: boolean;
}) {
  const s = SECTION_COLORS[section];
  const href = NewsItemHref(item);
  return (
    <article className="py-3">
      {showImage && item.imageUrl && (
        <a href={href} target="_blank" rel="noopener noreferrer">
          <img src={item.imageUrl} alt={item.title} loading="lazy" decoding="async"
            className="w-full object-cover mb-2 grayscale-[15%] hover:grayscale-0 transition-all"
            style={{ height: "120px", border: "1px solid rgba(26,26,46,0.10)" }} />
        </a>
      )}
      <SectionLabel section={section} />
      <a href={href} target="_blank" rel="noopener noreferrer">
        <h3 className="mt-1.5 text-sm font-bold leading-snug text-[#1a1a2e] hover:underline"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {item.title}
        </h3>
      </a>
      <p className="mt-1 text-xs leading-relaxed text-[#1a1a2e]/60 line-clamp-2"
        style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
        {item.summary}
      </p>
      <p className="mt-1 text-[10px] text-[#1a1a2e]/30"
        style={{ fontFamily: "'Space Mono', monospace" }}>
        {item.sourceName}{item.publishedAt ? ` · ${formatShortDate(item.publishedAt)}` : ""}
      </p>
    </article>
  );
}

/**
 * Riga notizia compatta: badge sezione + titolo + fonte
 * Usata nelle liste laterali e nelle code di sezione
 */
function CompactRow({ item, section }: { item: NewsItem; section: SectionKey }) {
  const href = NewsItemHref(item);
  return (
    <div className="py-2 grid grid-cols-[auto_1fr] gap-2 items-start">
      <SectionLabel section={section} />
      <div>
        <a href={href} target="_blank" rel="noopener noreferrer">
          <span className="text-xs font-semibold text-[#1a1a2e] hover:underline leading-snug"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {item.title}
          </span>
        </a>
        {item.sourceName && (
          <span className="ml-1.5 text-[10px] text-[#1a1a2e]/30"
            style={{ fontFamily: "'Space Mono', monospace" }}>
            {item.sourceName}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Card ricerca compatta per la striscia orizzontale
 */
function ResearchCard({ report }: { report: {
  id: number; title: string; summary: string; keyFindings: string[];
  source: string; category: string; dateLabel: string; isResearchOfDay: boolean; imageUrl: string | null;
}}) {
  const cat = RESEARCH_CATEGORY_LABELS[report.category] ?? { label: report.category, accent: "#1a1a2e", bg: "#f5f2ec" };
  const imgUrl = report.imageUrl || RESEARCH_CATEGORY_IMAGES[report.category] || RESEARCH_CATEGORY_IMAGES["ai_trends"];
  const keyFindings = Array.isArray(report.keyFindings) ? report.keyFindings : [];
  return (
    <article className="flex flex-col h-full">
      <Link href="/research">
        <div className="relative overflow-hidden cursor-pointer" style={{ height: "100px" }}>
          <img src={imgUrl} alt={report.title} loading="lazy"
            className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all"
            style={{ border: "1px solid rgba(26,26,46,0.10)" }} />
          <div className="absolute top-1.5 left-1.5">
            <ResearchBadge label={cat.label} accent={cat.accent} bg={cat.bg} />
          </div>
          {report.isResearchOfDay && (
            <div className="absolute top-1.5 right-1.5">
              <span className="text-[8px] font-bold uppercase px-1.5 py-0.5"
                style={{ background: "#1a1a2e", color: "#faf8f3", fontFamily: "'Space Mono', monospace" }}>
                ★ Del Giorno
              </span>
            </div>
          )}
        </div>
      </Link>
      <p className="mt-1.5 text-[9px] text-[#1a1a2e]/35" style={{ fontFamily: "'Space Mono', monospace" }}>
        {report.source} · {report.dateLabel}
      </p>
      <Link href="/research">
        <h4 className="mt-0.5 text-xs font-bold leading-snug text-[#1a1a2e] hover:underline cursor-pointer line-clamp-2"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {report.title}
        </h4>
      </Link>
      {keyFindings[0] && (
        <p className="mt-1 text-[10px] text-[#1a1a2e]/50 italic line-clamp-2"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
          <span className="font-bold not-italic" style={{ color: cat.accent }}>→</span> {keyFindings[0]}
        </p>
      )}
    </article>
  );
}

// ─── SectionNav ───────────────────────────────────────────────────────────────
function SectionNav() {
  const [location] = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const { data: sectionCounts } = trpc.news.getSectionCounts.useQuery(undefined, {
    staleTime: 10 * 60 * 1000, refetchOnWindowFocus: false,
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

  const SECTIONS = ["ai", "startup"] as const;

  return (
    <nav className="border-t border-[#1a1a2e] overflow-hidden">
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
                    onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = s.accent; (e.currentTarget as HTMLElement).style.color = "#fff"; } }}
                    onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = "#1a1a2e"; } }}
                  >
                    {s.label}
                    {sectionCounts && sectionCounts[sec] > 0 && (
                      <span className="ml-1.5 text-[8px] font-bold px-1 py-0.5 rounded-sm"
                        style={{ background: isActive ? "rgba(255,255,255,0.25)" : s.light, color: isActive ? "#fff" : s.accent, fontFamily: "'Space Mono', monospace", lineHeight: 1 }}>
                        {sectionCounts[sec]}
                      </span>
                    )}
                    {isActive && <span className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: "#fff", opacity: 0.6 }} />}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
        {canScrollRight && (
          <button
            className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-8 pointer-events-auto"
            style={{ background: "linear-gradient(to right, transparent, #faf8f3 70%)", border: "none", cursor: "pointer" }}
            onClick={() => scrollRef.current?.scrollBy({ left: 120, behavior: "smooth" })}
            aria-label="Scorri menu"
          >
            <span style={{ fontSize: "14px", color: "#1a1a2e", fontWeight: "bold" }}>›</span>
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center border-t" style={{ borderColor: "rgba(26,26,46,0.10)", background: "#f5f2ec" }}>
        {[
          { href: "/research", label: "Research", color: "#0a6e5c" },
          { href: "/chi-siamo", label: "Chi Siamo", color: "#1a1a2e" },
          { href: "/tecnologia", label: "Tecnologia", color: "#1a1a2e" },
          { href: "/advertise", label: "Advertise", color: "#ff5500" },
        ].map((item, i) => (
          <span key={item.href} className="flex items-center">
            {i > 0 && <span className="text-[#1a1a2e]/15 text-xs">|</span>}
            <Link href={item.href}>
              <span className="flex items-center px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] cursor-pointer transition-all hover:underline"
                style={{ fontFamily: "'Space Mono', monospace", color: item.color }}>
                {item.label}
              </span>
            </Link>
          </span>
        ))}
        <span className="text-[#1a1a2e]/15 text-xs mx-1">·</span>
        <ReadersCounter />
        <div className="ml-auto flex items-center">
          <Link href="/business">
            <span className="flex items-center gap-2 px-5 py-2 text-[9px] font-black uppercase tracking-[0.14em] cursor-pointer transition-all duration-200"
              style={{ fontFamily: "'Space Mono', monospace", background: "#1a1a2e", color: "#ff5500" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#ff5500"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#1a1a2e"; (e.currentTarget as HTMLElement).style.color = "#ff5500"; }}>
              <span style={{ fontSize: "10px" }}>▶</span>
              IdeaSmart Business
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ─── HOME PRINCIPALE ─────────────────────────────────────────────────────────
export default function Home() {
  const today = useMemo(() => new Date(), []);
  const queryOpts = { staleTime: 10 * 60 * 1000, refetchOnWindowFocus: false };

  const { data: homeData, isLoading: homeLoading } = trpc.news.getHomeData.useQuery(undefined, queryOpts);
  const { data: aiEditorial } = trpc.editorial.getLatest.useQuery({ section: "ai" }, queryOpts);
  const { data: startupEditorial } = trpc.editorial.getLatest.useQuery({ section: "startup" }, queryOpts);
  const { data: researchReports } = trpc.news.getResearchReports.useQuery({ limit: 6 }, queryOpts);

  const aiNews     = homeData?.ai      ?? [];
  const startupNews = homeData?.startup ?? [];
  const financeNews = homeData?.finance ?? [];

  // Hero: primo articolo AI con immagine
  const aiHero = useMemo(() => aiNews.find(n => n.imageUrl) || aiNews[0] || null, [aiNews]);
  // Hero Startup: primo articolo startup con immagine DIVERSA dall'AI hero
  const startupHero = useMemo(() =>
    startupNews.find(n => n.imageUrl && n.imageUrl !== aiHero?.imageUrl) || startupNews[0] || null,
    [startupNews, aiHero]
  );
  // Notizie AI rimanenti (escluso hero)
  const aiRest = useMemo(() => aiNews.filter(n => n.id !== aiHero?.id), [aiNews, aiHero]);
  // Notizie Startup rimanenti (escluso hero)
  const startupRest = useMemo(() => startupNews.filter(n => n.id !== startupHero?.id), [startupNews, startupHero]);

  // Flusso misto AI+Startup per la terza colonna e le sezioni inferiori
  // Interleave: AI[0], Startup[0], AI[1], Startup[1], ...
  const mixedFeed = useMemo(() => {
    const result: Array<NewsItem & { section: SectionKey }> = [];
    const maxLen = Math.max(aiRest.length, startupRest.length);
    for (let i = 0; i < maxLen; i++) {
      if (aiRest[i]) result.push({ ...aiRest[i], section: "ai" });
      if (startupRest[i]) result.push({ ...startupRest[i], section: "startup" });
    }
    return result;
  }, [aiRest, startupRest]);

  return (
    <>
      <SEOHead
        title="IDEASMART RESEARCH — AI, Startup & Venture Capital"
        description="Analisi quotidiane su Startup, Venture Capital e AI Trends — dati dalle principali fonti di ricerca globali ed europee."
        canonical="https://ideasmart.ai"
        ogSiteName="IDEASMART RESEARCH"
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,600&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,300;1,8..60,400&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="min-h-screen" style={{ background: "#faf8f3", color: "#1a1a2e" }}>

        {/* ══ TESTATA ══════════════════════════════════════════════════════════ */}
        <header className="max-w-6xl mx-auto px-4 pt-6 pb-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#1a1a2e]/50 uppercase tracking-widest"
              style={{ fontFamily: "'Space Mono', monospace" }}>
              {formatDateIT(today)}
            </span>
            <span className="text-xs text-[#1a1a2e]/40 uppercase tracking-widest"
              style={{ fontFamily: "'Space Mono', monospace" }}>
              Research · AI · Startup · Venture Capital
            </span>
          </div>
          <Divider thick />

          {/* Manchette 3 colonne */}
          <div className="grid grid-cols-1 md:grid-cols-[140px_1fr_140px] items-center gap-4 py-4 md:py-5">
            {/* Manchette sinistra */}
            <div className="hidden md:flex justify-end">
              <Link href="/research">
                <div className="w-[130px] h-[130px] border-2 flex flex-col items-center justify-center text-center p-3 cursor-pointer hover:shadow-md transition-all"
                  style={{ borderColor: "#0a6e5c", background: "#e6f4f1" }}>
                  <span className="text-[8px] font-bold uppercase tracking-[0.15em] block mb-1.5"
                    style={{ color: "#0a6e5c", fontFamily: "'Space Mono', monospace" }}>
                    IdeaSmart Research
                  </span>
                  <span className="text-[13px] font-black leading-tight block mb-2.5"
                    style={{ color: "#1a1a2e", fontFamily: "'Playfair Display', Georgia, serif" }}>
                    20 ricerche ogni giorno su AI, Startup e VC
                  </span>
                  <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5"
                    style={{ background: "#0a6e5c", color: "#fff", fontFamily: "'Space Mono', monospace" }}>
                    Scopri →
                  </span>
                </div>
              </Link>
            </div>

            {/* Brand centrale */}
            <div className="text-center">
              <Link href="/">
                <h1 className="text-5xl md:text-7xl font-black tracking-tight text-[#1a1a2e] cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.02em" }}>
                  IDEASMART <span style={{ color: "#0a6e5c" }}>RESEARCH</span>
                </h1>
              </Link>
              <p className="mt-1 text-xs uppercase tracking-[0.3em] text-[#1a1a2e]/50"
                style={{ fontFamily: "'Space Mono', monospace" }}>
                Analisi quotidiane su Startup, Venture Capital e AI Trends
              </p>
              <p className="mt-1 text-[11px] text-[#1a1a2e]/40 italic"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Dati dalle principali fonti di ricerca globali ed europee
              </p>
            </div>

            {/* Manchette destra — banner */}
            <div className="hidden md:flex justify-start">
              <div className="w-[130px] h-[130px] border overflow-hidden flex items-center justify-center"
                style={{ borderColor: "rgba(26,26,46,0.20)", background: "#f5f2ec" }}>
                <a href="https://clk.tradedoubler.com/click?p=354184&a=3477790&g=25914926" target="_blank" rel="noopener noreferrer">
                  <img src={`https://imp.tradedoubler.com/imp?type(img)g(25914926)a(3477790)${Math.random().toString().substring(2, 11)}`}
                    width="130" height="130" alt="Pubblicità"
                    style={{ display: "block", width: "130px", height: "130px", objectFit: "cover" }} />
                </a>
              </div>
            </div>
          </div>

          <Divider thick />
          <SectionNav />
          <Divider />
        </header>

        <BreakingNewsSection />
        <BreakingNewsTicker />

        {/* ══ CORPO ════════════════════════════════════════════════════════════ */}
        <main className="max-w-6xl mx-auto px-4 pb-12">
          <h2 className="sr-only">Ricerche AI, Startup News e AI4Business — aggiornate ogni giorno</h2>

          {/* ── PUNTO DEL GIORNO ── */}
          <PuntoDelGiorno />

          {/* ── BANNER LEADERBOARD ── */}
          <div className="my-6 flex flex-col items-center">
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#1a1a2e]/30 mb-1"
              style={{ fontFamily: "'Space Mono', monospace" }}>Pubblicità</p>
            <div className="overflow-hidden flex items-center justify-center"
              style={{ width: "728px", height: "90px", maxWidth: "100%", border: "1px solid rgba(26,26,46,0.08)", background: "#f5f2ec" }}>
              <a href="https://clk.tradedoubler.com/click?p=328374&a=3477790&g=25809148" target="_blank" rel="noopener noreferrer">
                <img src={`https://imp.tradedoubler.com/imp?type(img)g(25809148)a(3477790)${Math.random().toString().substring(2, 11)}`}
                  width="728" height="90" alt="Pubblicità"
                  style={{ display: "block", width: "728px", height: "90px", maxWidth: "100%", objectFit: "cover" }} />
              </a>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              BLOCCO 1 — APERTURA PRIMA PAGINA
              Layout: [AI Hero grande] | [Startup Hero] | [Colonna notizie miste]
          ══════════════════════════════════════════════════════════════════ */}
          {!homeLoading && (
            <section className="mt-6">
              <Divider thick />
              <div className="py-2 flex items-center gap-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a2e]/40"
                  style={{ fontFamily: "'Space Mono', monospace" }}>
                  Primo Piano
                </span>
                <span className="text-[10px] text-[#1a1a2e]/25" style={{ fontFamily: "'Space Mono', monospace" }}>—</span>
                <span className="text-[10px] text-[#0a6e5c] font-bold uppercase tracking-widest"
                  style={{ fontFamily: "'Space Mono', monospace" }}>
                  AI · Startup · Venture Capital
                </span>
              </div>
              <Divider />

              {/* Griglia 3 colonne: hero AI | hero Startup | notizie miste */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mt-4">

                {/* COL 1 — Hero AI (più grande) */}
                <div className="md:col-span-1 pr-0 md:pr-5 pb-4 md:pb-0 border-b md:border-b-0 md:border-r border-[#1a1a2e]/15">
                  {aiHero ? (
                    <HeroArticle item={aiHero} section="ai" editorial={aiEditorial} />
                  ) : (
                    <div className="py-8 text-center text-[#1a1a2e]/25 text-sm">Caricamento…</div>
                  )}
                  {/* 2 notizie AI sotto l'hero */}
                  {aiRest.slice(0, 2).map((item, i) => (
                    <div key={item.id}>
                      <ThinDivider />
                      <MediumArticle item={item} section="ai" />
                    </div>
                  ))}
                </div>

                {/* COL 2 — Hero Startup */}
                <div className="md:col-span-1 px-0 md:px-5 py-4 md:py-0 border-b md:border-b-0 md:border-r border-[#1a1a2e]/15">
                  {startupHero ? (
                    <HeroArticle item={startupHero} section="startup" editorial={startupEditorial} />
                  ) : (
                    <div className="py-8 text-center text-[#1a1a2e]/25 text-sm">Caricamento…</div>
                  )}
                  {/* 2 notizie Startup sotto l'hero */}
                  {startupRest.slice(0, 2).map((item, i) => (
                    <div key={item.id}>
                      <ThinDivider />
                      <MediumArticle item={item} section="startup" />
                    </div>
                  ))}
                </div>

                {/* COL 3 — Flusso misto AI+Startup (lista compatta) */}
                <div className="md:col-span-1 pl-0 md:pl-5 pt-4 md:pt-0">
                  <div className="py-1 mb-2">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#1a1a2e]/40"
                      style={{ fontFamily: "'Space Mono', monospace" }}>
                      Ultime notizie
                    </span>
                  </div>
                  <div className="border-t-2 border-[#1a1a2e] mb-1" />
                  {mixedFeed.slice(2, 14).map((item, i) => (
                    <div key={`${item.section}-${item.id}`}>
                      {i > 0 && <ThinDivider />}
                      <CompactRow item={item} section={item.section} />
                    </div>
                  ))}
                  <div className="mt-3 flex gap-3">
                    <Link href="/ai">
                      <span className="text-[9px] font-bold uppercase tracking-widest hover:underline"
                        style={{ color: SECTION_COLORS.ai.accent, fontFamily: "'Space Mono', monospace" }}>
                        Tutte le AI →
                      </span>
                    </Link>
                    <Link href="/startup">
                      <span className="text-[9px] font-bold uppercase tracking-widest hover:underline"
                        style={{ color: SECTION_COLORS.startup.accent, fontFamily: "'Space Mono', monospace" }}>
                        Tutte le Startup →
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              BLOCCO 2 — STRISCIA IDEASMART RESEARCH
              6 card ricerche in griglia orizzontale
          ══════════════════════════════════════════════════════════════════ */}
          {researchReports && researchReports.length > 0 && (
            <section className="mt-10">
              <Divider thick />
              <div className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a2e]/40"
                    style={{ fontFamily: "'Space Mono', monospace" }}>
                    IdeaSmart Research
                  </span>
                  <span className="text-[10px] text-[#0a6e5c] font-bold uppercase tracking-widest"
                    style={{ fontFamily: "'Space Mono', monospace" }}>
                    — 20 ricerche ogni giorno su AI, Startup & VC
                  </span>
                </div>
                <Link href="/research">
                  <span className="text-[10px] font-bold uppercase tracking-widest hover:underline cursor-pointer"
                    style={{ color: "#0a6e5c", fontFamily: "'Space Mono', monospace" }}>
                    Tutte le ricerche →
                  </span>
                </Link>
              </div>
              <div className="border-t-2" style={{ borderColor: "#0a6e5c" }} />

              {/* Griglia 6 card research */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-0 mt-3">
                {researchReports.map((r, i) => (
                  <div key={r.id}
                    className={`py-3 ${i > 0 ? 'pl-3 border-l border-[#1a1a2e]/12' : 'pr-3'}`}>
                    <ResearchCard report={r} />
                  </div>
                ))}
              </div>

              <ThinDivider />
              <div className="py-3 text-center">
                <Link href="/research">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-6 py-2 border-2 border-[#0a6e5c] text-[#0a6e5c] hover:bg-[#0a6e5c] hover:text-white transition-colors cursor-pointer"
                    style={{ fontFamily: "'Space Mono', monospace" }}>
                    Vedi tutte le 20 ricerche di oggi →
                  </span>
                </Link>
              </div>
            </section>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              BLOCCO 3 — SECONDA PAGINA: AI + STARTUP IN DUE COLONNE EDITORIALI
              Layout: [AI editoriale + 4 notizie] | [Startup editoriale + 4 notizie]
          ══════════════════════════════════════════════════════════════════ */}
          {!homeLoading && (aiRest.length > 2 || startupRest.length > 2) && (
            <section className="mt-10">
              <Divider thick />
              <div className="py-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a2e]/40"
                  style={{ fontFamily: "'Space Mono', monospace" }}>
                  Approfondimenti
                </span>
              </div>
              <Divider />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mt-4">

                {/* Colonna AI */}
                <div className="pr-0 md:pr-6 pb-6 md:pb-0 border-b md:border-b-0 md:border-r border-[#1a1a2e]/15">
                  {/* Header sezione */}
                  <div className="flex items-center justify-between mb-2">
                    <Link href="/ai">
                      <span className="text-xs font-bold uppercase tracking-widest hover:underline cursor-pointer"
                        style={{ color: SECTION_COLORS.ai.accent, fontFamily: "'Space Mono', monospace" }}>
                        AI4Business
                      </span>
                    </Link>
                    <Link href="/ai">
                      <span className="text-[9px] font-bold uppercase tracking-widest hover:underline"
                        style={{ color: SECTION_COLORS.ai.accent, fontFamily: "'Space Mono', monospace" }}>
                        Tutte →
                      </span>
                    </Link>
                  </div>
                  <div className="border-t-2 mb-3" style={{ borderColor: SECTION_COLORS.ai.accent }} />

                  {/* Editoriale AI */}
                  {aiEditorial && (
                    <div className="mb-4 p-3" style={{ background: SECTION_COLORS.ai.light, borderLeft: `3px solid ${SECTION_COLORS.ai.accent}` }}>
                      <p className="text-[9px] font-bold uppercase tracking-widest mb-1"
                        style={{ color: SECTION_COLORS.ai.accent, fontFamily: "'Space Mono', monospace" }}>
                        Editoriale del Giorno
                      </p>
                      <Link href="/ai">
                        <h3 className="text-sm font-bold leading-snug text-[#1a1a2e] hover:underline cursor-pointer"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                          {aiEditorial.title}
                        </h3>
                      </Link>
                      {aiEditorial.subtitle && (
                        <p className="mt-0.5 text-xs italic text-[#1a1a2e]/55"
                          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                          {aiEditorial.subtitle}
                        </p>
                      )}
                      <p className="mt-1 text-xs leading-relaxed text-[#1a1a2e]/65 line-clamp-3"
                        style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                        {aiEditorial.body.slice(0, 200)}…
                      </p>
                    </div>
                  )}

                  {/* 4 notizie AI con immagine alternata */}
                  {aiRest.slice(2, 6).map((item, i) => (
                    <div key={item.id}>
                      {i > 0 && <ThinDivider />}
                      <MediumArticle item={item} section="ai" showImage={i === 0 && !!item.imageUrl} />
                    </div>
                  ))}

                  {/* Lista compatta notizie AI extra */}
                  {aiRest.slice(6, 12).length > 0 && (
                    <div className="mt-3">
                      <ThinDivider />
                      <p className="py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-[#1a1a2e]/35"
                        style={{ fontFamily: "'Space Mono', monospace" }}>
                        Altre notizie AI
                      </p>
                      {aiRest.slice(6, 12).map(item => (
                        <div key={item.id}>
                          <ThinDivider />
                          <CompactRow item={item} section="ai" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Colonna Startup */}
                <div className="pl-0 md:pl-6 pt-6 md:pt-0">
                  <div className="flex items-center justify-between mb-2">
                    <Link href="/startup">
                      <span className="text-xs font-bold uppercase tracking-widest hover:underline cursor-pointer"
                        style={{ color: SECTION_COLORS.startup.accent, fontFamily: "'Space Mono', monospace" }}>
                        Startup News
                      </span>
                    </Link>
                    <Link href="/startup">
                      <span className="text-[9px] font-bold uppercase tracking-widest hover:underline"
                        style={{ color: SECTION_COLORS.startup.accent, fontFamily: "'Space Mono', monospace" }}>
                        Tutte →
                      </span>
                    </Link>
                  </div>
                  <div className="border-t-2 mb-3" style={{ borderColor: SECTION_COLORS.startup.accent }} />

                  {/* Editoriale Startup */}
                  {startupEditorial && (
                    <div className="mb-4 p-3" style={{ background: SECTION_COLORS.startup.light, borderLeft: `3px solid ${SECTION_COLORS.startup.accent}` }}>
                      <p className="text-[9px] font-bold uppercase tracking-widest mb-1"
                        style={{ color: SECTION_COLORS.startup.accent, fontFamily: "'Space Mono', monospace" }}>
                        Editoriale del Giorno
                      </p>
                      <Link href="/startup">
                        <h3 className="text-sm font-bold leading-snug text-[#1a1a2e] hover:underline cursor-pointer"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                          {startupEditorial.title}
                        </h3>
                      </Link>
                      {startupEditorial.subtitle && (
                        <p className="mt-0.5 text-xs italic text-[#1a1a2e]/55"
                          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                          {startupEditorial.subtitle}
                        </p>
                      )}
                      <p className="mt-1 text-xs leading-relaxed text-[#1a1a2e]/65 line-clamp-3"
                        style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                        {startupEditorial.body.slice(0, 200)}…
                      </p>
                    </div>
                  )}

                  {/* 4 notizie Startup */}
                  {startupRest.slice(2, 6).map((item, i) => (
                    <div key={item.id}>
                      {i > 0 && <ThinDivider />}
                      <MediumArticle item={item} section="startup" showImage={i === 0 && !!item.imageUrl} />
                    </div>
                  ))}

                  {/* Lista compatta Startup extra */}
                  {startupRest.slice(6, 12).length > 0 && (
                    <div className="mt-3">
                      <ThinDivider />
                      <p className="py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-[#1a1a2e]/35"
                        style={{ fontFamily: "'Space Mono', monospace" }}>
                        Altre notizie Startup
                      </p>
                      {startupRest.slice(6, 12).map(item => (
                        <div key={item.id}>
                          <ThinDivider />
                          <CompactRow item={item} section="startup" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              BLOCCO 4 — STRISCIA VENTURE CAPITAL / FINANCE
              Layout: [VC/Finance hero] | [Lista notizie VC] | [Banner 300x250]
          ══════════════════════════════════════════════════════════════════ */}
          {financeNews.length > 0 && (
            <section className="mt-10">
              <Divider thick />
              <div className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a2e]/40"
                    style={{ fontFamily: "'Space Mono', monospace" }}>
                    Finance & Markets
                  </span>
                  <span className="text-[10px] text-[#15803d] font-bold uppercase tracking-widest"
                    style={{ fontFamily: "'Space Mono', monospace" }}>
                    — Venture Capital · Mercati · Investimenti
                  </span>
                </div>
                <Link href="/finance">
                  <span className="text-[10px] font-bold uppercase tracking-widest hover:underline cursor-pointer"
                    style={{ color: SECTION_COLORS.finance.accent, fontFamily: "'Space Mono', monospace" }}>
                    Tutte le notizie →
                  </span>
                </Link>
              </div>
              <div className="border-t-2" style={{ borderColor: SECTION_COLORS.finance.accent }} />

              <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-0 mt-4">
                {/* Hero Finance */}
                <div className="pr-0 md:pr-5 pb-4 md:pb-0 border-b md:border-b-0 md:border-r border-[#1a1a2e]/15">
                  {financeNews[0] && <HeroArticle item={financeNews[0]} section="finance" />}
                </div>

                {/* Lista Finance */}
                <div className="px-0 md:px-5 py-4 md:py-0">
                  {financeNews.slice(1, 5).map((item, i) => (
                    <div key={item.id}>
                      {i > 0 && <ThinDivider />}
                      <MediumArticle item={item} section="finance" />
                    </div>
                  ))}
                </div>

                {/* Banner 300x250 */}
                <div className="pl-0 md:pl-5 flex items-start justify-center pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-[#1a1a2e]/15">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-[#1a1a2e]/30 text-center mb-1"
                      style={{ fontFamily: "'Space Mono', monospace" }}>Pubblicità</p>
                    <a href="https://clk.tradedoubler.com/click?p=360031&a=3477790&g=25650800" target="_blank" rel="noopener noreferrer">
                      <img src={`https://imp.tradedoubler.com/imp?type(img)g(25650800)a(3477790)${Math.random().toString().substring(2, 11)}`}
                        width="300" height="250" alt="Pubblicità"
                        style={{ display: "block", maxWidth: "100%", height: "auto" }} />
                    </a>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── BANNER PRE-FOOTER ── */}
          <div className="mt-10 flex justify-center">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-[#1a1a2e]/30 text-center mb-1"
                style={{ fontFamily: "'Space Mono', monospace" }}>Pubblicità</p>
              <a href="https://clk.tradedoubler.com/click?p=384511&a=3477790&g=25996460" target="_blank" rel="noopener noreferrer">
                <img src={`https://imp.tradedoubler.com/imp?type(img)g(25996460)a(3477790)${Math.random().toString().substring(2, 11)}`}
                  width="728" height="90" alt="Pubblicità"
                  style={{ display: "block", maxWidth: "100%", height: "auto" }} />
              </a>
            </div>
          </div>

          {/* ── FOOTER ── */}
          <div className="mt-12">
            <Divider thick />
            <div className="py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-xs text-[#1a1a2e]/40"
                style={{ fontFamily: "'Space Mono', monospace" }}>
                {`© ${today.getFullYear()} IdeaSmart Research · AI · Startup · Venture Capital`}
              </p>
              <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-end">
                {(["ai", "startup"] as const).map(sec => (
                  <Link key={sec} href={SECTION_COLORS[sec].path}>
                    <span className="text-[10px] hover:underline cursor-pointer"
                      style={{ color: SECTION_COLORS[sec].accent, fontFamily: "'Space Mono', monospace" }}>
                      {SECTION_COLORS[sec].label}
                    </span>
                  </Link>
                ))}
                {[
                  { href: "/chi-siamo", label: "Chi Siamo", color: "#0369a1" },
                  { href: "/business", label: "IdeaSmart Business", color: "#ff5500" },
                  { href: "/research", label: "IdeaSmart Research", color: "#0a6e5c" },
                  { href: "/privacy", label: "Privacy Policy", color: "#1a1a2e" },
                ].map(item => (
                  <Link key={item.href} href={item.href}>
                    <span className="text-[10px] hover:underline cursor-pointer font-bold"
                      style={{ color: item.color, fontFamily: "'Space Mono', monospace" }}>
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

        </main>
      </div>
    </>
  );
}
