/*
 * IDEASMART RESEARCH — Prima Pagina Giornale
 * Layout: testata → breaking → Punto del Giorno → griglia [hero+secondarie | sidebar news]
 * Ispirazione: Il Sole 24 Ore — prima pagina cartacea
 * Tipografia: Playfair Display (titoli), Source Serif 4 (corpo), Space Mono (label/meta)
 * Font size: body 15-16px, titoli secondari 20-22px, hero 32-38px
 */
import { useMemo, useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import SEOHead from "@/components/SEOHead";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import BreakingNewsSection from "@/components/BreakingNewsSection";
import PuntoDelGiorno from "@/components/PuntoDelGiorno";

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

// ─── Utility ─────────────────────────────────────────────────────────────────
function formatDateIT(date: Date): string {
  return date.toLocaleDateString("it-IT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}
function formatShortDate(str: string): string {
  if (!str) return "";
  try {
    const d = new Date(str);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffH = Math.floor(diffMs / 3600000);
    if (diffH < 1) return "Ora";
    if (diffH < 24) return `${diffH}h fa`;
    return d.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
  } catch { return str; }
}
function NewsItemHref(item: NewsItem): string {
  return item.sourceUrl && item.sourceUrl !== "#" ? item.sourceUrl : "#";
}
function Divider({ thick = false }: { thick?: boolean }) {
  return <div className={`w-full ${thick ? "border-t-[3px]" : "border-t"} border-[#1a1a2e]`} />;
}
function ThinDivider() {
  return <div className="w-full border-t border-[#1a1a2e]/12" />;
}

// ─── Badge sezione ────────────────────────────────────────────────────────────
function SectionBadge({ section }: { section: SectionKey }) {
  const s = SECTION_COLORS[section];
  return (
    <span
      className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] px-1.5 py-0.5 mr-1"
      style={{ background: s.accent, color: "#fff", fontFamily: "'Space Mono', monospace" }}
    >
      {s.label}
    </span>
  );
}

// ─── HERO ARTICLE — grande, con immagine, titolo 32-38px ─────────────────────
function HeroArticle({ item, section, editorial }: {
  item: NewsItem;
  section: SectionKey;
  editorial?: { id?: number; title: string; subtitle?: string | null; body: string } | null;
}) {
  const s = SECTION_COLORS[section];
  const href = editorial?.id ? `/${section}/editoriale/${editorial.id}` : NewsItemHref(item);
  const isExternal = !editorial?.id;
  const title = editorial?.title || item.title;
  const body = editorial?.body || item.summary;
  const img = item.imageUrl;

  const TitleEl = (
    <h2
      className="mt-2 leading-tight text-[#1a1a2e] hover:underline"
      style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: "clamp(26px, 3vw, 38px)",
        fontWeight: 800,
        lineHeight: 1.2,
      }}
    >
      {title}
    </h2>
  );

  return (
    <article className="pb-4">
      {img && (
        isExternal ? (
          <a href={href} target="_blank" rel="noopener noreferrer">
            <img
              src={img} alt={title} loading="eager" decoding="async"
              className="w-full object-cover hover:opacity-95 transition-opacity"
              style={{ height: "320px", border: "1px solid rgba(26,26,46,0.12)" }}
            />
          </a>
        ) : (
          <Link href={href}>
            <img
              src={img} alt={title} loading="eager" decoding="async"
              className="w-full object-cover hover:opacity-95 transition-opacity cursor-pointer"
              style={{ height: "320px", border: "1px solid rgba(26,26,46,0.12)" }}
            />
          </Link>
        )
      )}
      <div className="mt-3">
        <SectionBadge section={section} />
        {isExternal ? (
          <a href={href} target="_blank" rel="noopener noreferrer">{TitleEl}</a>
        ) : (
          <Link href={href}>{TitleEl}</Link>
        )}
        {editorial?.subtitle && (
          <p className="mt-2 text-lg italic text-[#1a1a2e]/60"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif", lineHeight: 1.5 }}>
            {editorial.subtitle}
          </p>
        )}
        <p className="mt-3 text-[15px] leading-relaxed text-[#1a1a2e]/75"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif", lineHeight: 1.7 }}>
          {body.slice(0, 320)}{body.length > 320 ? "…" : ""}
        </p>
        <p className="mt-2 text-[11px] text-[#1a1a2e]/40 uppercase tracking-widest"
          style={{ fontFamily: "'Space Mono', monospace" }}>
          {item.sourceName}{item.publishedAt ? ` · ${formatShortDate(item.publishedAt)}` : ""}
        </p>
      </div>
    </article>
  );
}

// ─── SECONDARY ARTICLE — titolo 20-22px + sommario 2 righe ──────────────────
function SecondaryArticle({ item, section, showImage = false }: {
  item: NewsItem;
  section: SectionKey;
  showImage?: boolean;
}) {
  const href = NewsItemHref(item);
  return (
    <article className="py-4">
      {showImage && item.imageUrl && (
        <a href={href} target="_blank" rel="noopener noreferrer">
          <img src={item.imageUrl} alt={item.title} loading="lazy"
            className="w-full object-cover mb-3"
            style={{ height: "160px", border: "1px solid rgba(26,26,46,0.10)" }} />
        </a>
      )}
      <SectionBadge section={section} />
      <a href={href} target="_blank" rel="noopener noreferrer">
        <h3
          className="mt-2 text-[#1a1a2e] hover:underline leading-snug"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(18px, 2vw, 22px)",
            fontWeight: 700,
            lineHeight: 1.3,
          }}
        >
          {item.title}
        </h3>
      </a>
      <p className="mt-2 text-[15px] leading-relaxed text-[#1a1a2e]/65 line-clamp-3"
        style={{ fontFamily: "'Source Serif 4', Georgia, serif", lineHeight: 1.65 }}>
        {item.summary}
      </p>
      <p className="mt-1.5 text-[11px] text-[#1a1a2e]/35 uppercase tracking-widest"
        style={{ fontFamily: "'Space Mono', monospace" }}>
        {item.sourceName}{item.publishedAt ? ` · ${formatShortDate(item.publishedAt)}` : ""}
      </p>
    </article>
  );
}

// ─── SIDEBAR NEWS ITEM — titolo 15px + fonte ─────────────────────────────────
function SidebarNewsItem({ item, section }: { item: NewsItem; section: SectionKey }) {
  const s = SECTION_COLORS[section];
  const href = NewsItemHref(item);
  return (
    <div className="py-3">
      <div className="flex items-center gap-1.5 mb-1">
        <span
          className="text-[9px] font-bold uppercase tracking-[0.12em] px-1 py-0.5"
          style={{ background: s.accent, color: "#fff", fontFamily: "'Space Mono', monospace" }}
        >
          {s.label}
        </span>
        {item.publishedAt && (
          <span className="text-[10px] text-[#1a1a2e]/35" style={{ fontFamily: "'Space Mono', monospace" }}>
            {formatShortDate(item.publishedAt)}
          </span>
        )}
      </div>
      <a href={href} target="_blank" rel="noopener noreferrer">
        <p
          className="text-[#1a1a2e] hover:underline leading-snug"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "15px",
            fontWeight: 600,
            lineHeight: 1.4,
          }}
        >
          {item.title}
        </p>
      </a>
      {item.summary && (
        <p className="mt-1 text-[13px] text-[#1a1a2e]/55 line-clamp-2"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif", lineHeight: 1.5 }}>
          {item.summary}
        </p>
      )}
    </div>
  );
}

// ─── SECTION NAV ─────────────────────────────────────────────────────────────
function SectionNav() {
  const { data: sectionCounts } = trpc.news.getSectionCounts.useQuery(undefined, {
    staleTime: 15 * 60 * 1000, refetchOnWindowFocus: false,
  });
  const navSections: Array<{ key: SectionKey; label: string; path: string }> = [
    { key: "ai",      label: "AI4Business", path: "/ai" },
    { key: "startup", label: "Startup News", path: "/startup" },
    { key: "finance", label: "Finance",      path: "/finance" },
    { key: "health",  label: "Health",       path: "/health" },
    { key: "sport",   label: "Sport",        path: "/sport" },
    { key: "luxury",  label: "Luxury",       path: "/luxury" },
    { key: "news",    label: "News Italia",  path: "/news" },
    { key: "motori",  label: "Motori",       path: "/motori" },
  ];
  return (
    <nav className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
      {navSections.map((s, i) => {
        const count = sectionCounts?.[s.key] ?? 0;
        return (
          <Link key={s.key} href={s.path}>
            <span
              className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap hover:bg-[#1a1a2e] hover:text-white transition-colors cursor-pointer border-r border-[#1a1a2e]/15"
              style={{ fontFamily: "'Space Mono', monospace", color: SECTION_COLORS[s.key].accent }}
            >
              {s.label}
              {count > 0 && (
                <span className="text-[9px] font-bold px-1 py-0.5 rounded-sm"
                  style={{ background: SECTION_COLORS[s.key].accent, color: "#fff" }}>
                  {count}
                </span>
              )}
            </span>
          </Link>
        );
      })}
      <Link href="/research">
        <span className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap hover:bg-[#0a6e5c] hover:text-white transition-colors cursor-pointer"
          style={{ fontFamily: "'Space Mono', monospace", color: "#0a6e5c" }}>
          Research
        </span>
      </Link>
      <Link href="/chi-siamo">
        <span className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap hover:bg-[#1a1a2e] hover:text-white transition-colors cursor-pointer border-l border-[#1a1a2e]/15"
          style={{ fontFamily: "'Space Mono', monospace", color: "#1a1a2e" }}>
          Chi Siamo
        </span>
      </Link>
      <Link href="/tecnologia">
        <span className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap hover:bg-[#1a1a2e] hover:text-white transition-colors cursor-pointer border-l border-[#1a1a2e]/15"
          style={{ fontFamily: "'Space Mono', monospace", color: "#1a1a2e" }}>
          Tecnologia
        </span>
      </Link>
      <Link href="/business">
        <span className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap hover:bg-[#ff5500] hover:text-white transition-colors cursor-pointer border-l border-[#1a1a2e]/15"
          style={{ fontFamily: "'Space Mono', monospace", color: "#ff5500" }}>
          ▶ IdeaSmart Business
        </span>
      </Link>
    </nav>
  );
}

// ─── READERS COUNTER ─────────────────────────────────────────────────────────
function ReadersCounter() {
  const [count, setCount] = useState(6905);
  useEffect(() => {
    const t = setInterval(() => {
      setCount(c => c + Math.floor(Math.random() * 3));
    }, 45000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="flex items-center gap-1 text-[10px] text-[#0a6e5c] font-bold"
      style={{ fontFamily: "'Space Mono', monospace" }}>
      <span className="w-1.5 h-1.5 rounded-full bg-[#0a6e5c] animate-pulse inline-block" />
      {count.toLocaleString("it-IT")} lettori
    </span>
  );
}

// ─── SEZIONE LABEL (per nav interna) ─────────────────────────────────────────
function SectionLabel({ label, accent }: { label: string; accent: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="h-[3px] w-6" style={{ background: accent }} />
      <span className="text-[10px] font-bold uppercase tracking-[0.2em]"
        style={{ color: accent, fontFamily: "'Space Mono', monospace" }}>
        {label}
      </span>
    </div>
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
  const { data: researchOfDay } = trpc.news.getResearchOfDay.useQuery(undefined, queryOpts);

  const aiNews      = homeData?.ai      ?? [];
  const startupNews = homeData?.startup ?? [];
  const financeNews = homeData?.finance ?? [];
  const healthNews  = homeData?.health  ?? [];
  const sportNews   = homeData?.sport   ?? [];
  const newsItalia  = homeData?.news    ?? [];

  // Hero: primo articolo AI con immagine
  const aiHero = useMemo(() => aiNews.find(n => n.imageUrl) || aiNews[0] || null, [aiNews]);
  const aiRest = useMemo(() => aiNews.filter(n => n.id !== aiHero?.id), [aiNews, aiHero]);

  // Startup hero
  const startupHero = useMemo(() =>
    startupNews.find(n => n.imageUrl && n.imageUrl !== aiHero?.imageUrl) || startupNews[0] || null,
    [startupNews, aiHero]
  );
  const startupRest = useMemo(() => startupNews.filter(n => n.id !== startupHero?.id), [startupNews, startupHero]);

  // Sidebar: mix di tutte le sezioni (AI, Startup, Finance, Health, Sport, News)
  const sidebarFeed = useMemo(() => {
    const items: Array<NewsItem & { section: SectionKey }> = [];
    const pools: Array<{ news: NewsItem[]; section: SectionKey }> = [
      { news: aiRest.slice(3), section: "ai" },
      { news: startupRest.slice(3), section: "startup" },
      { news: financeNews.slice(2), section: "finance" },
      { news: healthNews.slice(0, 4), section: "health" },
      { news: sportNews.slice(0, 4), section: "sport" },
      { news: newsItalia.slice(0, 4), section: "news" },
    ];
    const maxLen = Math.max(...pools.map(p => p.news.length));
    for (let i = 0; i < maxLen; i++) {
      for (const pool of pools) {
        if (pool.news[i]) items.push({ ...pool.news[i], section: pool.section });
      }
    }
    return items.slice(0, 30);
  }, [aiRest, startupRest, financeNews, healthNews, sportNews, newsItalia]);

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
        .newspaper-col-rule { border-right: 1px solid rgba(26,26,46,0.15); }
      `}</style>

      <div className="min-h-screen" style={{ background: "#faf8f3", color: "#1a1a2e" }}>

        {/* ══ TESTATA ══════════════════════════════════════════════════════════ */}
        <header className="max-w-[1280px] mx-auto px-4 pt-5 pb-0">
          {/* Riga data + categorie */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-[#1a1a2e]/50 uppercase tracking-widest"
              style={{ fontFamily: "'Space Mono', monospace" }}>
              {formatDateIT(today)}
            </span>
            <span className="text-[11px] text-[#1a1a2e]/40 uppercase tracking-widest"
              style={{ fontFamily: "'Space Mono', monospace" }}>
              Research · AI · Startup · Venture Capital
            </span>
          </div>
          <Divider thick />

          {/* Manchette 3 colonne */}
          <div className="grid grid-cols-1 md:grid-cols-[160px_1fr_160px] items-center gap-4 py-4">
            {/* Manchette sinistra */}
            <div className="hidden md:flex justify-end">
              <Link href="/research">
                <div className="w-[150px] h-[140px] border-2 flex flex-col items-center justify-center text-center p-3 cursor-pointer hover:shadow-md transition-all"
                  style={{ borderColor: "#0a6e5c", background: "#e6f4f1" }}>
                  <span className="text-[8px] font-bold uppercase tracking-[0.15em] block mb-1.5"
                    style={{ color: "#0a6e5c", fontFamily: "'Space Mono', monospace" }}>
                    IdeaSmart Research
                  </span>
                  <span className="text-[14px] font-black leading-tight block mb-2.5"
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
                <h1 className="font-black tracking-tight text-[#1a1a2e] cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: "clamp(42px, 7vw, 88px)",
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                  }}>
                  IDEASMART <span style={{ color: "#0a6e5c" }}>RESEARCH</span>
                </h1>
              </Link>
              <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-[#1a1a2e]/50"
                style={{ fontFamily: "'Space Mono', monospace" }}>
                Analisi quotidiane su Startup, Venture Capital e AI Trends
              </p>
              <p className="mt-1 text-[12px] text-[#1a1a2e]/40 italic"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                Dati dalle principali fonti di ricerca globali ed europee
              </p>
            </div>

            {/* Manchette destra — banner */}
            <div className="hidden md:flex justify-start">
              <div className="w-[150px] h-[140px] border overflow-hidden flex items-center justify-center"
                style={{ borderColor: "rgba(26,26,46,0.20)", background: "#f5f2ec" }}>
                <a href="https://clk.tradedoubler.com/click?p=354184&a=3477790&g=25914926" target="_blank" rel="noopener noreferrer">
                  <img src={`https://imp.tradedoubler.com/imp?type(img)g(25914926)a(3477790)${Math.random().toString().substring(2, 11)}`}
                    width="150" height="140" alt="Pubblicità"
                    style={{ display: "block", width: "150px", height: "140px", objectFit: "cover" }} />
                </a>
              </div>
            </div>
          </div>

          <Divider thick />

          {/* Nav sezioni */}
          <div className="flex items-center justify-between border-b border-[#1a1a2e]/15">
            <SectionNav />
            <div className="hidden sm:flex items-center px-3 border-l border-[#1a1a2e]/15">
              <ReadersCounter />
            </div>
          </div>
        </header>

        {/* ══ BREAKING NEWS ════════════════════════════════════════════════════ */}
        <BreakingNewsSection />
        <BreakingNewsTicker />

        {/* ══ CORPO ════════════════════════════════════════════════════════════ */}
        <main className="max-w-[1280px] mx-auto px-4 pb-16">

          {/* ── BANNER LEADERBOARD ── */}
          <div className="my-5 flex flex-col items-center">
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
              PRIMA PAGINA — Layout giornale
              [Colonna principale 70%] | [Sidebar notizie 30%]
          ══════════════════════════════════════════════════════════════════ */}
          {!homeLoading && (
            <section className="mt-4">
              <Divider thick />
              <div className="py-2 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1a1a2e]/50"
                  style={{ fontFamily: "'Space Mono', monospace" }}>
                  Prima Pagina — {formatDateIT(today)}
                </span>
                <span className="text-[10px] text-[#0a6e5c] font-bold uppercase tracking-widest"
                  style={{ fontFamily: "'Space Mono', monospace" }}>
                  AI · Startup · Venture Capital
                </span>
              </div>
              <Divider />

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-0 mt-4">

                {/* ── COLONNA PRINCIPALE (sinistra 70%) ── */}
                <div className="lg:pr-6 newspaper-col-rule">

                  {/* HERO PRINCIPALE — AI, grande */}
                  {aiHero && (
                    <div className="pb-5">
                      <HeroArticle item={aiHero} section="ai" editorial={aiEditorial} />
                    </div>
                  )}

                  <ThinDivider />

                  {/* GRIGLIA 2 COLONNE: Startup hero + AI secondary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mt-0">

                    {/* Colonna Startup */}
                    <div className="md:pr-5 md:border-r border-[#1a1a2e]/15 pt-4">
                      <SectionLabel label="Startup News" accent={SECTION_COLORS.startup.accent} />
                      {startupHero && (
                        <SecondaryArticle item={startupHero} section="startup" showImage={!!startupHero.imageUrl} />
                      )}
                      {startupRest.slice(0, 2).map((item, i) => (
                        <div key={item.id}>
                          <ThinDivider />
                          <SecondaryArticle item={item} section="startup" />
                        </div>
                      ))}
                      <div className="mt-2">
                        <Link href="/startup">
                          <span className="text-[10px] font-bold uppercase tracking-widest hover:underline"
                            style={{ color: SECTION_COLORS.startup.accent, fontFamily: "'Space Mono', monospace" }}>
                            Tutte le notizie Startup →
                          </span>
                        </Link>
                      </div>
                    </div>

                    {/* Colonna AI secondary */}
                    <div className="md:pl-5 pt-4">
                      <SectionLabel label="AI4Business" accent={SECTION_COLORS.ai.accent} />
                      {aiRest.slice(0, 3).map((item, i) => (
                        <div key={item.id}>
                          {i > 0 && <ThinDivider />}
                          <SecondaryArticle item={item} section="ai" showImage={i === 0 && !!item.imageUrl} />
                        </div>
                      ))}
                      <div className="mt-2">
                        <Link href="/ai">
                          <span className="text-[10px] font-bold uppercase tracking-widest hover:underline"
                            style={{ color: SECTION_COLORS.ai.accent, fontFamily: "'Space Mono', monospace" }}>
                            Tutte le notizie AI →
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* SEPARATORE + BANNER */}
                  <div className="my-6">
                    <Divider />
                    <div className="py-4 flex justify-center">
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
                    <Divider />
                  </div>

                  {/* SECONDA RIGA: Finance + Health + Sport */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-0">

                    {/* Finance */}
                    <div className="md:pr-4 md:border-r border-[#1a1a2e]/15 pb-4 md:pb-0">
                      <SectionLabel label="Finance & Markets" accent={SECTION_COLORS.finance.accent} />
                      {financeNews.slice(0, 1).map(item => (
                        <SecondaryArticle key={item.id} item={item} section="finance" showImage={!!item.imageUrl} />
                      ))}
                      {financeNews.slice(1, 3).map((item, i) => (
                        <div key={item.id}>
                          <ThinDivider />
                          <SecondaryArticle item={item} section="finance" />
                        </div>
                      ))}
                      <div className="mt-2">
                        <Link href="/finance">
                          <span className="text-[10px] font-bold uppercase tracking-widest hover:underline"
                            style={{ color: SECTION_COLORS.finance.accent, fontFamily: "'Space Mono', monospace" }}>
                            Finance →
                          </span>
                        </Link>
                      </div>
                    </div>

                    {/* Health */}
                    <div className="md:px-4 md:border-r border-[#1a1a2e]/15 pt-4 md:pt-0 border-t md:border-t-0">
                      <SectionLabel label="Health & Biotech" accent={SECTION_COLORS.health.accent} />
                      {healthNews.slice(0, 3).map((item, i) => (
                        <div key={item.id}>
                          {i > 0 && <ThinDivider />}
                          <SecondaryArticle item={item} section="health" showImage={i === 0 && !!item.imageUrl} />
                        </div>
                      ))}
                      <div className="mt-2">
                        <Link href="/health">
                          <span className="text-[10px] font-bold uppercase tracking-widest hover:underline"
                            style={{ color: SECTION_COLORS.health.accent, fontFamily: "'Space Mono', monospace" }}>
                            Health →
                          </span>
                        </Link>
                      </div>
                    </div>

                    {/* Sport */}
                    <div className="md:pl-4 pt-4 md:pt-0 border-t md:border-t-0">
                      <SectionLabel label="Sport & Business" accent={SECTION_COLORS.sport.accent} />
                      {sportNews.slice(0, 3).map((item, i) => (
                        <div key={item.id}>
                          {i > 0 && <ThinDivider />}
                          <SecondaryArticle item={item} section="sport" showImage={i === 0 && !!item.imageUrl} />
                        </div>
                      ))}
                      <div className="mt-2">
                        <Link href="/sport">
                          <span className="text-[10px] font-bold uppercase tracking-widest hover:underline"
                            style={{ color: SECTION_COLORS.sport.accent, fontFamily: "'Space Mono', monospace" }}>
                            Sport →
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* STRISCIA RESEARCH */}
                  {researchReports && researchReports.length > 0 && (
                    <div className="mt-8">
                      <Divider thick />
                      <div className="py-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-[3px] w-8" style={{ background: "#0a6e5c" }} />
                          <span className="text-[11px] font-bold uppercase tracking-[0.2em]"
                            style={{ color: "#0a6e5c", fontFamily: "'Space Mono', monospace" }}>
                            IdeaSmart Research — 20 ricerche al giorno
                          </span>
                        </div>
                        <Link href="/research">
                          <span className="text-[10px] font-bold uppercase tracking-widest hover:underline cursor-pointer"
                            style={{ color: "#0a6e5c", fontFamily: "'Space Mono', monospace" }}>
                            Tutte →
                          </span>
                        </Link>
                      </div>
                      <div className="border-t-2" style={{ borderColor: "#0a6e5c" }} />
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                        {researchReports.slice(0, 6).map(r => {
                          const accent = r.category === "startup" ? "#c2410c"
                            : r.category === "venture_capital" ? "#15803d"
                            : r.category === "ai_trends" ? "#0a6e5c"
                            : r.category === "technology" ? "#7c3aed"
                            : "#0369a1";
                          return (
                            <Link key={r.id} href="/research">
                              <article className="cursor-pointer group border border-[#1a1a2e]/10 p-3 hover:border-[#1a1a2e]/30 transition-colors">
                                <span className="inline-block text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 mb-2"
                                  style={{ background: accent, color: "#fff", fontFamily: "'Space Mono', monospace" }}>
                                  {r.category.replace("_", " ")}
                                </span>
                                <h4 className="text-[14px] font-bold leading-snug text-[#1a1a2e] group-hover:underline line-clamp-3"
                                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                  {r.title}
                                </h4>
                                <p className="mt-1 text-[12px] text-[#1a1a2e]/50 line-clamp-2"
                                  style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                                  {r.summary}
                                </p>
                                <p className="mt-1.5 text-[10px] text-[#1a1a2e]/35 uppercase"
                                  style={{ fontFamily: "'Space Mono', monospace" }}>
                                  {r.source}
                                </p>
                              </article>
                            </Link>
                          );
                        })}
                      </div>
                      <div className="mt-4 text-center">
                        <Link href="/research">
                          <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-6 py-2 border-2 border-[#0a6e5c] text-[#0a6e5c] hover:bg-[#0a6e5c] hover:text-white transition-colors cursor-pointer"
                            style={{ fontFamily: "'Space Mono', monospace" }}>
                            Vedi tutte le 20 ricerche di oggi →
                          </span>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* STARTUP EDITORIALE */}
                  {startupEditorial && (
                    <div className="mt-8">
                      <Divider thick />
                      <div className="py-2">
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em]"
                          style={{ color: SECTION_COLORS.startup.accent, fontFamily: "'Space Mono', monospace" }}>
                          Editoriale Startup del Giorno
                        </span>
                      </div>
                      <div className="border-t-2" style={{ borderColor: SECTION_COLORS.startup.accent }} />
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-6">
                        <div>
                          <Link href={`/startup/editoriale/${startupEditorial.id ?? ""}`}>
                            <h3 className="text-[22px] font-bold leading-snug text-[#1a1a2e] hover:underline cursor-pointer"
                              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                              {startupEditorial.title}
                            </h3>
                          </Link>
                          {startupEditorial.subtitle && (
                            <p className="mt-2 text-[16px] italic text-[#1a1a2e]/55"
                              style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                              {startupEditorial.subtitle}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-[15px] leading-relaxed text-[#1a1a2e]/70"
                            style={{ fontFamily: "'Source Serif 4', Georgia, serif", lineHeight: 1.7 }}>
                            {startupEditorial.body.slice(0, 400)}…
                          </p>
                          <Link href={`/startup/editoriale/${startupEditorial.id ?? ""}`}>
                            <span className="mt-2 inline-block text-[11px] font-bold uppercase tracking-widest hover:underline"
                              style={{ color: SECTION_COLORS.startup.accent, fontFamily: "'Space Mono', monospace" }}>
                              Leggi tutto →
                            </span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ALTRE NOTIZIE AI */}
                  {aiRest.length > 3 && (
                    <div className="mt-8">
                      <Divider thick />
                      <div className="py-2 flex items-center justify-between">
                        <SectionLabel label="AI4Business — Approfondimenti" accent={SECTION_COLORS.ai.accent} />
                        <Link href="/ai">
                          <span className="text-[10px] font-bold uppercase tracking-widest hover:underline"
                            style={{ color: SECTION_COLORS.ai.accent, fontFamily: "'Space Mono', monospace" }}>
                            Tutte →
                          </span>
                        </Link>
                      </div>
                      <div className="border-t-2" style={{ borderColor: SECTION_COLORS.ai.accent }} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mt-2">
                        {aiRest.slice(3, 9).map((item, i) => (
                          <div key={item.id}
                            className={`${i % 2 === 0 ? "md:pr-5 md:border-r border-[#1a1a2e]/15" : "md:pl-5"} ${i > 1 ? "border-t border-[#1a1a2e]/12" : ""}`}>
                            <SecondaryArticle item={item} section="ai" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* ── SIDEBAR DESTRA (30%) ── */}
                <div className="lg:pl-6 mt-6 lg:mt-0">

                  {/* Banner 300x250 */}
                  <div className="mb-5">
                    <p className="text-[9px] uppercase tracking-widest text-[#1a1a2e]/30 text-center mb-1"
                      style={{ fontFamily: "'Space Mono', monospace" }}>Pubblicità</p>
                    <a href="https://clk.tradedoubler.com/click?p=360031&a=3477790&g=25650800" target="_blank" rel="noopener noreferrer">
                      <img src={`https://imp.tradedoubler.com/imp?type(img)g(25650800)a(3477790)${Math.random().toString().substring(2, 11)}`}
                        width="300" height="250" alt="Pubblicità"
                        style={{ display: "block", maxWidth: "100%", height: "auto" }} />
                    </a>
                  </div>

                  {/* Ultime Notizie — stream */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-[3px] flex-1" style={{ background: "#1a1a2e" }} />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a2e]"
                        style={{ fontFamily: "'Space Mono', monospace" }}>
                        Ultime Notizie
                      </span>
                      <div className="h-[3px] flex-1" style={{ background: "#1a1a2e" }} />
                    </div>
                    <div className="border-t-[3px] border-[#1a1a2e]" />

                    {sidebarFeed.map((item, i) => (
                      <div key={`${item.section}-${item.id}`}>
                        {i > 0 && <ThinDivider />}
                        <SidebarNewsItem item={item} section={item.section} />
                      </div>
                    ))}

                    <div className="mt-4 pt-3 border-t border-[#1a1a2e]/15 text-center">
                      <Link href="/ai">
                        <span className="text-[10px] font-bold uppercase tracking-widest hover:underline block mb-1"
                          style={{ color: SECTION_COLORS.ai.accent, fontFamily: "'Space Mono', monospace" }}>
                          AI4Business →
                        </span>
                      </Link>
                      <Link href="/startup">
                        <span className="text-[10px] font-bold uppercase tracking-widest hover:underline block mb-1"
                          style={{ color: SECTION_COLORS.startup.accent, fontFamily: "'Space Mono', monospace" }}>
                          Startup News →
                        </span>
                      </Link>
                      <Link href="/finance">
                        <span className="text-[10px] font-bold uppercase tracking-widest hover:underline block"
                          style={{ color: SECTION_COLORS.finance.accent, fontFamily: "'Space Mono', monospace" }}>
                          Finance & Markets →
                        </span>
                      </Link>
                    </div>
                  </div>

                  {/* Research del Giorno */}
                  {researchOfDay && (
                    <div className="mt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-[3px] flex-1" style={{ background: "#0a6e5c" }} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]"
                          style={{ color: "#0a6e5c", fontFamily: "'Space Mono', monospace" }}>
                          Research del Giorno
                        </span>
                        <div className="h-[3px] flex-1" style={{ background: "#0a6e5c" }} />
                      </div>
                      <div className="border-t-[3px]" style={{ borderColor: "#0a6e5c" }} />
                      <Link href="/research">
                        <article className="cursor-pointer group pt-3">
                          <span className="inline-block text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 mb-2"
                            style={{ background: "#0a6e5c", color: "#fff", fontFamily: "'Space Mono', monospace" }}>
                            ★ {researchOfDay.category.replace("_", " ")}
                          </span>
                          <h4 className="text-[16px] font-bold leading-snug text-[#1a1a2e] group-hover:underline"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                            {researchOfDay.title}
                          </h4>
                          <p className="mt-2 text-[13px] text-[#1a1a2e]/60 line-clamp-3"
                            style={{ fontFamily: "'Source Serif 4', Georgia, serif", lineHeight: 1.55 }}>
                            {researchOfDay.summary}
                          </p>
                          {Array.isArray(researchOfDay.keyFindings) && researchOfDay.keyFindings[0] && (
                            <p className="mt-2 text-[12px] italic text-[#0a6e5c] line-clamp-2"
                              style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                              → {researchOfDay.keyFindings[0]}
                            </p>
                          )}
                          <p className="mt-1.5 text-[10px] text-[#1a1a2e]/35 uppercase"
                            style={{ fontFamily: "'Space Mono', monospace" }}>
                            {researchOfDay.source}
                          </p>
                        </article>
                      </Link>
                    </div>
                  )}

                  {/* IdeaSmart Business promo */}
                  <div className="mt-6 p-4 border-2"
                    style={{ borderColor: "#ff5500", background: "#fff8f5" }}>
                    <span className="text-[9px] font-bold uppercase tracking-widest block mb-2"
                      style={{ color: "#ff5500", fontFamily: "'Space Mono', monospace" }}>
                      IdeaSmart Business
                    </span>
                    <p className="text-[14px] font-bold leading-snug text-[#1a1a2e]"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      Piattaforma AI Agentica + Advisory M&A e Tecnologia
                    </p>
                    <p className="mt-2 text-[13px] text-[#1a1a2e]/65"
                      style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                      Intelligence personalizzata per le tue decisioni strategiche.
                    </p>
                    <Link href="/business">
                      <span className="mt-3 inline-block text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 hover:opacity-80 transition-opacity"
                        style={{ background: "#ff5500", color: "#fff", fontFamily: "'Space Mono', monospace" }}>
                        Scopri →
                      </span>
                    </Link>
                  </div>

                </div>
              </div>
            </section>
          )}

          {/* ── PUNTO DEL GIORNO ── (posizionato dopo la griglia Prima Pagina) */}
          <div className="mt-10">
            <PuntoDelGiorno />
          </div>

          {/* ── FOOTER ── */}
          <div className="mt-12">
            <Divider thick />
            <div className="py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-[11px] text-[#1a1a2e]/40"
                style={{ fontFamily: "'Space Mono', monospace" }}>
                {`© ${today.getFullYear()} IdeaSmart Research · AI · Startup · Venture Capital`}
              </p>
              <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-end">
                {(["ai", "startup", "finance", "health", "sport"] as const).map(sec => (
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
                  { href: "/research", label: "Research", color: "#0a6e5c" },
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
