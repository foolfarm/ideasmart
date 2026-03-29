/*
 * IdeaSmart — Prima Pagina Giornale
 * Layout: testata → breaking → Punto del Giorno → griglia [hero+secondarie | sidebar news]
 * Ispirazione: Il Sole 24 Ore — prima pagina cartacea
 * Tipografia: SF Pro Display (titoli), SF Pro Text (corpo) — sistema Apple
 * Font size: body 15-16px, titoli secondari 20-22px, hero 32-38px
 */
import { useMemo, useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useSiteAuth } from "@/hooks/useSiteAuth";
import SEOHead from "@/components/SEOHead";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import BreakingNewsSection from "@/components/BreakingNewsSection";
import PuntoDelGiorno from "@/components/PuntoDelGiorno";

// ─── Costanti colori sezione ─────────────────────────────────────────────────
const SECTION_COLORS = {
  ai:            { accent: "#1a1a1a", light: "#f5f5f5", label: "AI NEWS",        path: "/ai" },
  music:         { accent: "#2a2a2a", light: "#ede9fe", label: "ITsMusic",            path: "/music" },
  startup:       { accent: "#2a2a2a", light: "#f5f5f5", label: "STARTUP NEWS",        path: "/startup" },
  finance:       { accent: "#1a1a1a", light: "#f0fdf4", label: "Finance & Markets",   path: "/finance" },
  health:        { accent: "#1a1a1a", light: "#eff6ff", label: "Health & Biotech",    path: "/health" },
  sport:         { accent: "#2a2a2a", light: "#fffbeb", label: "Sport & Business",    path: "/sport" },
  luxury:        { accent: "#2a2a2a", light: "#faf5ff", label: "Lifestyle & Luxury",  path: "/luxury" },
  news:          { accent: "#1a1a1a", light: "#f1f5f9", label: "News Italia",         path: "/news" },
  motori:        { accent: "#2a2a2a", light: "#fef2f2", label: "Motori",              path: "/motori" },
  tennis:        { accent: "#2a2a2a", light: "#f7fee7", label: "Tennis",              path: "/tennis" },
  basket:        { accent: "#2a2a2a", light: "#fff7ed", label: "Basket",              path: "/basket" },
  gossip:        { accent: "#2a2a2a", light: "#fdf2f8", label: "Business Gossip",     path: "/gossip" },
  cybersecurity: { accent: "#1a1a1a", light: "#f0f9ff", label: "Cybersecurity",       path: "/cybersecurity" },
  sondaggi:      { accent: "#2a2a2a", light: "#f5f3ff", label: "Sondaggi",            path: "/sondaggi" },
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
  return <div className={`w-full ${thick ? "border-t-[3px]" : "border-t"} border-[#1a1a1a]`} />;
}
function ThinDivider() {
  return <div className="w-full border-t border-[#1a1a1a]/12" />;
}

// ─── Badge sezione ────────────────────────────────────────────────────────────
function SectionBadge({ section }: { section: SectionKey }) {
  const s = SECTION_COLORS[section];
  return (
    <span
      className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] px-1.5 py-0.5 mr-1"
      style={{ background: s.accent, color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
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
      className="mt-2 leading-tight text-[#1a1a1a] hover:underline"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif", fontSize: "clamp(30px, 4vw, 42px)", fontWeight: 800, lineHeight: 1.15 }}
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
          <p className="mt-2 text-lg italic text-[#1a1a1a]/60"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif", lineHeight: 1.5 }}>
            {editorial.subtitle}
          </p>
        )}
        <p className="mt-3 text-[17px] leading-relaxed text-[#1a1a1a]/75"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif", lineHeight: 1.7 }}>
          {body.slice(0, 320)}{body.length > 320 ? "…" : ""}
        </p>
        <p className="mt-2 text-[11px] text-[#1a1a1a]/40 uppercase tracking-widest"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
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
          className="mt-2 text-[#1a1a1a] hover:underline leading-snug"
          style={{
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
            fontSize: "clamp(18px, 2vw, 22px)",
            fontWeight: 700,
            lineHeight: 1.3,
          }}
        >
          {item.title}
        </h3>
      </a>
      <p className="mt-2 text-[16px] leading-relaxed text-[#1a1a1a]/65 line-clamp-3"
        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif", lineHeight: 1.65 }}>
        {item.summary}
      </p>
      <p className="mt-1.5 text-[11px] text-[#1a1a1a]/35 uppercase tracking-widest"
        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
        {item.sourceName}{item.publishedAt ? ` · ${formatShortDate(item.publishedAt)}` : ""}
      </p>
    </article>
  );
}

// ─── SIDEBAR NEWS ITEM — titolo 15px + fonte ─────────────────────────────────
function SidebarNewsItem({ item, section }: { item: NewsItem; section: SectionKey }) {
  const s = SECTION_COLORS[section];
  // font aumentati per leggibilità
  const href = NewsItemHref(item);
  return (
    <div className="py-3">
      <div className="flex items-center gap-1.5 mb-1">
        <span
          className="text-[9px] font-bold uppercase tracking-[0.12em] px-1 py-0.5"
          style={{ background: s.accent, color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
        >
          {s.label}
        </span>
        {item.publishedAt && (
          <span className="text-[10px] text-[#1a1a1a]/35" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
            {formatShortDate(item.publishedAt)}
          </span>
        )}
      </div>
      <a href={href} target="_blank" rel="noopener noreferrer">
        <p
          className="text-[#1a1a1a] hover:underline leading-snug"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif", fontSize: "17px", fontWeight: 700, lineHeight: 1.35 }}
        >
          {item.title}
        </p>
      </a>
      {item.summary && (
        <p className="mt-1 text-[15px] text-[#1a1a1a]/55 line-clamp-2"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif", lineHeight: 1.5 }}>
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
    { key: "ai",      label: "AI NEWS", path: "/ai" },
    { key: "startup", label: "STARTUP NEWS", path: "/startup" },
  ];
  return (
    <nav className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
      {navSections.map((s, i) => {
        const count = sectionCounts?.[s.key] ?? 0;
        return (
          <Link key={s.key} href={s.path}>
            <span
              className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap hover:bg-[#1a1a1a] hover:text-white transition-colors cursor-pointer border-r border-[#1a1a1a]/15"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", color: SECTION_COLORS[s.key].accent }}
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
        <span className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap hover:bg-[#1a1a1a] hover:text-white transition-colors cursor-pointer"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", color: "#1a1a1a" }}>
          RICERCHE
        </span>
      </Link>
      <Link href="/chi-siamo">
        <span className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap hover:bg-[#1a1a1a] hover:text-white transition-colors cursor-pointer border-l border-[#1a1a1a]/15"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", color: "#1a1a1a" }}>
          Chi Siamo
        </span>
      </Link>
      {/* ▶ Intelligence — nascosta temporaneamente */}
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
    <span className="flex items-center gap-1 text-[10px] text-[#1a1a1a] font-bold"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
      <span className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] animate-pulse inline-block" />
      {count.toLocaleString("it-IT")} lettori
    </span>
  );
}

// ─── AUTH BUTTONS (Home navbar) ─────────────────────────────────────────────
function HomeAuthButtons() {
  const { user, isLoading, isAuthenticated, logout } = useSiteAuth();
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
  if (isLoading) return null;
  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-0">
        <Link href="/account">
          <span
            className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-[#1a1a1a] hover:text-white transition-colors whitespace-nowrap"
            style={{ fontFamily: SF, color: "#1a1a1a" }}
          >
            {user?.username}
          </span>
        </Link>
        <button
          onClick={logout}
          className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest border-l border-[#1a1a1a]/15 hover:bg-[#1a1a1a] hover:text-white transition-colors"
          style={{ fontFamily: SF, color: "rgba(26,26,26,0.5)", background: "transparent" }}
        >
          Esci
        </button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-0">
      <Link href="/accedi">
        <span
          className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-[#1a1a1a] hover:text-white transition-colors whitespace-nowrap border-r border-[#1a1a1a]/15"
          style={{ fontFamily: SF, color: "#1a1a1a" }}
        >
          Accedi
        </span>
      </Link>
      <Link href="/registrati">
        <span
          className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap"
          style={{ fontFamily: SF, background: "#1a1a1a", color: "#ffffff" }}
        >
          Registrati
        </span>
      </Link>
    </div>
  );
}

// ─── SEZIONE LABEL (per nav interna) ─────────────────────────────────────────
function SectionLabel({ label, accent }: { label: string; accent: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="h-[3px] w-6" style={{ background: accent }} />
      <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] m-0 p-0"
        style={{ color: accent, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", fontSize: "10px", lineHeight: 1 }}>
        {label}
      </h2>
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
  const { data: upcomingEvents } = trpc.events.getUpcoming.useQuery({ limit: 6, category: "all" }, queryOpts);

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
        title="IdeaSmart — Intelligence su AI, Startup e Venture Capital"
        description="Analisi quotidiane su Startup, Venture Capital e AI Trends — dati dalle principali fonti di ricerca globali ed europee."
        canonical="https://ideasmart.ai"
        ogSiteName="IdeaSmart"
      />

      <style>{`
        /* SF Pro system font — no external loading needed */
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .newspaper-col-rule { border-right: 1px solid rgba(26,26,46,0.15); }
      `}</style>

      <div className="min-h-screen" style={{ background: "#faf8f3", color: "#1a1a1a" }}>

        {/* ══ TESTATA ══════════════════════════════════════════════════════════ */}
        <header className="max-w-[1280px] mx-auto px-4 pt-5 pb-0">
          {/* Riga data + categorie */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-[#1a1a1a]/50 uppercase tracking-widest"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
              {formatDateIT(today)}
            </span>
            <span className="text-[11px] text-[#1a1a1a]/40 uppercase tracking-widest"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
              Research · AI · Startup · Venture Capital
            </span>
          </div>
          <Divider thick />

          {/* Header centrato — manchette rimosse */}
          <div className="py-6">
            {/* Brand centrale */}
            <div className="text-center">
              <Link href="/">
                <h1 className="font-black tracking-tight text-[#1a1a1a] cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
                    fontSize: "clamp(42px, 7vw, 88px)",
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                  }}>
                  IDEASMART
                </h1>
              </Link>
              <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-[#1a1a1a]/50"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                Intelligence quotidiana su AI, Startup e Venture Capital
              </p>
              <p className="mt-1 text-[12px] text-[#1a1a1a]/40 italic"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
                Ricerche verificate, alert e briefing per chi prende decisioni.
              </p>
            </div>

          </div>

          <Divider thick />

          {/* Nav sezioni + auth */}
          <div className="flex items-center justify-between border-b border-[#1a1a1a]/15">
            <SectionNav />
            <div className="flex items-center gap-0 border-l border-[#1a1a1a]/15">
              <HomeAuthButtons />
              <div className="hidden sm:flex items-center px-3 border-l border-[#1a1a1a]/15">
                <ReadersCounter />
              </div>
            </div>
          </div>

        </header>

        {/* ══ BREAKING NEWS ════════════════════════════════════════════════════ */}
        <BreakingNewsSection />
        <BreakingNewsTicker />

        {/* ══ CORPO ═══════════════════════════════════════════════════════════════════════ */}
        <main className="max-w-[1280px] mx-auto px-4 pb-16">

          {/* Strip metriche spostata dopo i contenuti — vedi posizione corretta sotto */}

          {/* ── RICERCA DEL GIORNO — card grande in evidenza (come da prompt) ── */}
          {researchReports && researchReports.length > 0 && (() => {
            const r = researchReports[0];
            const accent = r.category === "startup" ? "#2a2a2a"
              : r.category === "venture_capital" ? "#1a1a1a"
              : r.category === "ai_trends" ? "#1a1a1a"
              : r.category === "technology" ? "#2a2a2a"
              : "#1a1a1a";
            return (
              <div className="mt-4 mb-2">
                <div className="py-1.5 flex items-center justify-between border-b-2" style={{ borderColor: "#1a1a1a" }}>
                  <div className="flex items-center gap-2">
                    <div className="h-[3px] w-6" style={{ background: "#1a1a1a" }} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>Ricerca del Giorno</span>
                  </div>
                  <Link href="/research">
                    <span className="text-[10px] font-bold uppercase tracking-widest hover:underline cursor-pointer" style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>Vedi tutte le ricerche →</span>
                  </Link>
                </div>
                <Link href={`/research/${r.id}`}>
                  <article className="group mt-3 p-5 border-l-4 hover:bg-[#f8faf9] transition-colors cursor-pointer" style={{ borderColor: accent, background: "rgba(10,110,92,0.03)" }}>
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1">
                        <span className="inline-block text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 mb-2" style={{ background: accent, color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                          {r.category.replace("_", " ")}
                        </span>
                        <h2 className="text-[22px] sm:text-[26px] font-bold leading-tight group-hover:underline" style={{ color: "#0f0f0f", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
                          {r.title}
                        </h2>
                        <p className="mt-2 text-[14px] leading-relaxed" style={{ color: "rgba(26,26,46,0.65)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
                          {r.summary}
                        </p>
                        <div className="mt-3 flex items-center gap-3">
                          <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(26,26,46,0.4)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>{r.source}</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: accent, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>Leggi la ricerca →</span>
                        </div>
                      </div>
                      {r.imageUrl && (
                        <div className="flex-shrink-0 w-full sm:w-[200px] h-[120px] overflow-hidden">
                          <img src={r.imageUrl} alt={r.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </article>
                </Link>
              </div>
            );
          })()}

          {/* ══════════════════════════════════════════════════════════════════
              PRIMA PAGINA — Layout giornale
              [Colonna principale 70%] | [Sidebar notizie 30%]
          ══════════════════════════════════════════════════════════════════ */}
          {!homeLoading && (
            <section className="mt-4">
              <Divider thick />
              <div className="py-2 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]/50"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                  Prima Pagina — {formatDateIT(today)}
                </span>
                <span className="text-[10px] text-[#1a1a1a] font-bold uppercase tracking-widest"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
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
                    <div className="md:pr-5 md:border-r border-[#1a1a1a]/15 pt-4">
                      <SectionLabel label="STARTUP NEWS" accent={SECTION_COLORS.startup.accent} />
                      {startupHero && (
                        <SecondaryArticle item={startupHero} section="startup" showImage={!!startupHero.imageUrl} />
                      )}
                      {startupRest.slice(0, 4).map((item, i) => (
                        <div key={item.id}>
                          <ThinDivider />
                          <SecondaryArticle item={item} section="startup" />
                        </div>
                      ))}
                      <div className="mt-2">
                        <Link href="/startup">
                          <span className="text-[10px] font-bold uppercase tracking-widest hover:underline"
                            style={{ color: SECTION_COLORS.startup.accent, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                            Tutte le notizie Startup →
                          </span>
                        </Link>
                      </div>
                    </div>

                    {/* Colonna AI secondary */}
                    <div className="md:pl-5 pt-4">
                      <SectionLabel label="AI NEWS" accent={SECTION_COLORS.ai.accent} />
                      {aiRest.slice(0, 5).map((item, i) => (
                        <div key={item.id}>
                          {i > 0 && <ThinDivider />}
                          <SecondaryArticle item={item} section="ai" showImage={i === 0 && !!item.imageUrl} />
                        </div>
                      ))}
                      <div className="mt-2">
                        <Link href="/ai">
                          <span className="text-[10px] font-bold uppercase tracking-widest hover:underline"
                            style={{ color: SECTION_COLORS.ai.accent, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                            Tutte le notizie AI →
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* SEPARATORE */}
                  <div className="my-6">
                    <Divider />
                  </div>

                  {/* ── PUNTO DEL GIORNO — colonna editoriale a metà pagina ── */}
                  <div className="my-8">
                    <PuntoDelGiorno />
                  </div>

                  {/* STRISCIA RESEARCH */}
                  {researchReports && researchReports.length > 0 && (
                    <div className="mt-8">
                      <Divider thick />
                      <div className="py-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-[3px] w-8" style={{ background: "#1a1a1a" }} />
                          <span className="text-[11px] font-bold uppercase tracking-[0.2em]"
                            style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                            IdeaSmart — 20 ricerche al giorno
                          </span>
                        </div>
                        <Link href="/research">
                          <span className="text-[10px] font-bold uppercase tracking-widest hover:underline cursor-pointer"
                            style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                            Tutte →
                          </span>
                        </Link>
                      </div>
                      <div className="border-t-2" style={{ borderColor: "#1a1a1a" }} />
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                        {researchReports.slice(0, 6).map(r => {
                          const accent = r.category === "startup" ? "#2a2a2a"
                            : r.category === "venture_capital" ? "#1a1a1a"
                            : r.category === "ai_trends" ? "#1a1a1a"
                            : r.category === "technology" ? "#2a2a2a"
                            : "#1a1a1a";
                          return (
                            <Link key={r.id} href={`/research/${r.id}`}>
                              <article className="cursor-pointer group border border-[#1a1a1a]/10 p-3 hover:border-[#1a1a1a]/30 transition-colors">
                                <span className="inline-block text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 mb-2"
                                  style={{ background: accent, color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                                  {r.category.replace("_", " ")}
                                </span>
                                <h4 className="text-[16px] font-bold leading-snug text-[#1a1a1a] group-hover:underline line-clamp-3"
                                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
                                  {r.title}
                                </h4>
                                <p className="mt-1 text-[14px] text-[#1a1a1a]/50 line-clamp-2"
                                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
                                  {r.summary}
                                </p>
                                <p className="mt-1.5 text-[10px] text-[#1a1a1a]/35 uppercase"
                                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                                  {r.source}
                                </p>
                              </article>
                            </Link>
                          );
                        })}
                      </div>
                      <div className="mt-4 text-center">
                        <Link href="/research">
                          <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-6 py-2 border-2 border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-colors cursor-pointer"
                            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                            Vedi tutte le 20 ricerche di oggi →
                          </span>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* TERZA RIGA: Startup approfondimenti */}
                  {startupRest.length > 5 && (
                    <div className="mt-8">
                      <Divider thick />
                      <div className="py-2 flex items-center justify-between">
                        <SectionLabel label="STARTUP NEWS — Approfondimenti" accent={SECTION_COLORS.startup.accent} />
                        <Link href="/startup">
                          <span className="text-[10px] font-bold uppercase tracking-widest hover:underline"
                            style={{ color: SECTION_COLORS.startup.accent, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                            Tutte →
                          </span>
                        </Link>
                      </div>
                      <div className="border-t-2" style={{ borderColor: SECTION_COLORS.startup.accent }} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mt-2">
                        {startupRest.slice(5, 13).map((item, i) => (
                          <div key={item.id}
                            className={`${i % 2 === 0 ? "md:pr-5 md:border-r border-[#1a1a1a]/15" : "md:pl-5"} ${i > 1 ? "border-t border-[#1a1a1a]/12" : ""}`}>
                            <SecondaryArticle item={item} section="startup" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STARTUP EDITORIALE */}
                  {startupEditorial && (
                    <div className="mt-8">
                      <Divider thick />
                      <div className="py-2">
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em]"
                          style={{ color: SECTION_COLORS.startup.accent, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                          Editoriale Startup del Giorno
                        </span>
                      </div>
                      <div className="border-t-2" style={{ borderColor: SECTION_COLORS.startup.accent }} />
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-6">
                        <div>
                          <Link href={`/startup/editoriale/${startupEditorial.id ?? ""}`}>
                            <h3 className="text-[22px] font-bold leading-snug text-[#1a1a1a] hover:underline cursor-pointer"
                              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
                              {startupEditorial.title}
                            </h3>
                          </Link>
                          {startupEditorial.subtitle && (
                            <p className="mt-2 text-[16px] italic text-[#1a1a1a]/55"
                              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
                              {startupEditorial.subtitle}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-[15px] leading-relaxed text-[#1a1a1a]/70"
                            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif", lineHeight: 1.7 }}>
                            {startupEditorial.body.slice(0, 400)}…
                          </p>
                          <Link href={`/startup/editoriale/${startupEditorial.id ?? ""}`}>
                            <span className="mt-2 inline-block text-[11px] font-bold uppercase tracking-widest hover:underline"
                              style={{ color: SECTION_COLORS.startup.accent, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
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
                        <SectionLabel label="AI NEWS — Approfondimenti" accent={SECTION_COLORS.ai.accent} />
                        <Link href="/ai">
                          <span className="text-[10px] font-bold uppercase tracking-widest hover:underline"
                            style={{ color: SECTION_COLORS.ai.accent, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                            Tutte →
                          </span>
                        </Link>
                      </div>
                      <div className="border-t-2" style={{ borderColor: SECTION_COLORS.ai.accent }} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mt-2">
                        {aiRest.slice(5, 15).map((item, i) => (
                          <div key={item.id}
                            className={`${i % 2 === 0 ? "md:pr-5 md:border-r border-[#1a1a1a]/15" : "md:pl-5"} ${i > 1 ? "border-t border-[#1a1a1a]/12" : ""}`}>
                            <SecondaryArticle item={item} section="ai" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* ── SIDEBAR DESTRA (30%) ── */}
                <div className="lg:pl-6 mt-6 lg:mt-0">

                  {/* ── Banner iscrizione gratuita — sidebar ── */}
                  <div className="mb-5 p-4 border-l-4" style={{ background: "#f5f3ee", borderColor: "#1a1a1a" }}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2"
                      style={{ color: "rgba(26,26,26,0.45)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                      IDEASMART
                    </p>
                    <p className="text-[15px] font-black leading-snug mb-1"
                      style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif", letterSpacing: "-0.01em" }}>
                      Ogni giorno 400 news, ricerche e notizie gratis.
                    </p>
                    <p className="text-[11px] mb-3"
                      style={{ color: "rgba(26,26,26,0.5)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", lineHeight: 1.5 }}>
                      AI, Startup e Venture Capital — aggiornato ogni giorno.
                    </p>
                    <Link href="/registrati">
                      <span className="block text-center text-[11px] font-bold uppercase tracking-widest py-2.5 transition-opacity hover:opacity-80 cursor-pointer"
                        style={{ background: "#1a1a1a", color: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                        Iscriviti gratis →
                      </span>
                    </Link>
                  </div>

                  {/* Ultime Notizie — stream */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-[3px] flex-1" style={{ background: "#1a1a1a" }} />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]"
                        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                        Ultime Notizie
                      </span>
                      <div className="h-[3px] flex-1" style={{ background: "#1a1a1a" }} />
                    </div>
                    <div className="border-t-[3px] border-[#1a1a1a]" />

                    {sidebarFeed.map((item, i) => (
                      <div key={`${item.section}-${item.id}`}>
                        {i > 0 && <ThinDivider />}
                        <SidebarNewsItem item={item} section={item.section} />
                      </div>
                    ))}

                    <div className="mt-4 pt-3 border-t border-[#1a1a1a]/15 text-center">
                      <Link href="/ai">
                        <span className="text-[10px] font-bold uppercase tracking-widest hover:underline block mb-1"
                          style={{ color: SECTION_COLORS.ai.accent, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                          AI NEWS →
                        </span>
                      </Link>
                      <Link href="/startup">
                        <span className="text-[10px] font-bold uppercase tracking-widest hover:underline block mb-1"
                          style={{ color: SECTION_COLORS.startup.accent, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                          STARTUP NEWS →
                        </span>
                      </Link>
                      <Link href="/finance">
                        <span className="text-[10px] font-bold uppercase tracking-widest hover:underline block"
                          style={{ color: SECTION_COLORS.finance.accent, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                          Finance & Markets →
                        </span>
                      </Link>
                    </div>
                  </div>

                  {/* Research del Giorno */}
                  {researchOfDay && (
                    <div className="mt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-[3px] flex-1" style={{ background: "#1a1a1a" }} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]"
                          style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                          Research del Giorno
                        </span>
                        <div className="h-[3px] flex-1" style={{ background: "#1a1a1a" }} />
                      </div>
                      <div className="border-t-[3px]" style={{ borderColor: "#1a1a1a" }} />
                      <Link href="/research">
                        <article className="cursor-pointer group pt-3">
                          <span className="inline-block text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 mb-2"
                            style={{ background: "#1a1a1a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                            ★ {researchOfDay.category.replace("_", " ")}
                          </span>
                          <h4 className="text-[16px] font-bold leading-snug text-[#1a1a1a] group-hover:underline"
                            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
                            {researchOfDay.title}
                          </h4>
                          <p className="mt-2 text-[13px] text-[#1a1a1a]/60 line-clamp-3"
                            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif", lineHeight: 1.55 }}>
                            {researchOfDay.summary}
                          </p>
                          {Array.isArray(researchOfDay.keyFindings) && researchOfDay.keyFindings[0] && (
                            <p className="mt-2 text-[12px] italic text-[#1a1a1a] line-clamp-2"
                              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
                              → {researchOfDay.keyFindings[0]}
                            </p>
                          )}
                          <p className="mt-1.5 text-[10px] text-[#1a1a1a]/35 uppercase"
                            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                            {researchOfDay.source}
                          </p>
                        </article>
                      </Link>
                    </div>
                  )}

                  {/* ── Intelligence promo compatta — sidebar bassa ── */}
                  <div className="mt-6 p-4 border border-[#1a1a1a]/15">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-2"
                      style={{ color: "rgba(26,26,26,0.4)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                      ▶ Intelligence
                    </p>
                    <p className="text-[13px] font-bold leading-snug mb-2"
                      style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
                      Non leggere le notizie. Usale per decidere.
                    </p>
                    <p className="text-[11px] mb-3"
                      style={{ color: "rgba(26,26,26,0.5)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", lineHeight: 1.5 }}>
                      Briefing settimanale · 450+ fonti · 8 agenti AI
                    </p>
                    <Link href="/intelligence">
                      <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 border border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-colors cursor-pointer"
                        style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                        Scopri i piani →
                      </span>
                    </Link>
                  </div>

                </div>
              </div>
            </section>
          )}

          {/* ── PROSSIMI EVENTI ── */}
          {upcomingEvents && upcomingEvents.length > 0 && (
            <section className="mt-10">
              <Divider />
              <div className="mt-8">
                <h2 style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif", fontSize: "1.1rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#1a1a1a", marginBottom: "0.25rem" }}>
                  Prossimi Eventi
                </h2>
                <p className="text-[11px] uppercase tracking-widest mb-6" style={{ color: "#1a1a1a", opacity: 0.45, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                  Tech · AI · Startup · Venture Capital · Italia
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingEvents.map((ev) => {
                    const startDate = new Date(ev.startAt);
                    const dayNum = startDate.toLocaleDateString("it-IT", { day: "2-digit" });
                    const monthShort = startDate.toLocaleDateString("it-IT", { month: "short" }).toUpperCase();
                    const weekday = startDate.toLocaleDateString("it-IT", { weekday: "short" }).toUpperCase();
                    const timeStr = startDate.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
                    const categoryColors: Record<string, { bg: string; text: string; label: string }> = {
                      ai:         { bg: "#e6f4f1", text: "#1a1a1a", label: "AI" },
                      startup:    { bg: "#fff0e6", text: "#2a2a2a", label: "Startup" },
                      vc:         { bg: "#eff6ff", text: "#1a1a1a", label: "Venture Capital" },
                      tech:       { bg: "#f0fdf4", text: "#1a1a1a", label: "Tech" },
                      innovation: { bg: "#faf5ff", text: "#2a2a2a", label: "Innovation" },
                      other:      { bg: "#f1f5f9", text: "#475569", label: "Evento" },
                    };
                    const cat = categoryColors[ev.category] || categoryColors.other;
                    return (
                      <a
                        key={ev.id}
                        href={ev.eventUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex gap-3 p-4 border border-[#1a1a1a]/10 rounded-lg hover:border-[#1a1a1a]/40 hover:shadow-sm transition-all group"
                        style={{ background: "#fff" }}
                      >
                        {/* Data box */}
                        <div className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-14 rounded-md" style={{ background: "#0f0f0f" }}>
                          <span className="text-[18px] font-black leading-none" style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>{dayNum}</span>
                          <span className="text-[9px] font-bold tracking-widest" style={{ color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>{monthShort}</span>
                          <span className="text-[8px] tracking-wide" style={{ color: "#fff", opacity: 0.6, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>{weekday}</span>
                        </div>
                        {/* Contenuto */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded" style={{ background: cat.bg, color: cat.text }}>
                              {cat.label}
                            </span>
                            {ev.isFree && (
                              <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded" style={{ background: "#f5f5f5", color: "#333333" }}>Free</span>
                            )}
                            {ev.isOnline && (
                              <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded" style={{ background: "#f5f5f5", color: "#555555" }}>Online</span>
                            )}
                          </div>
                          <p className="text-[13px] font-bold leading-snug line-clamp-2 group-hover:text-[#1a1a1a] transition-colors" style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
                            {ev.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            {ev.location && (
                              <span className="text-[10px]" style={{ color: "#1a1a1a", opacity: 0.5, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                                📍 {ev.location.slice(0, 30)}{ev.location.length > 30 ? "…" : ""}
                              </span>
                            )}
                            <span className="text-[10px]" style={{ color: "#1a1a1a", opacity: 0.4, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                              {timeStr !== "00:00" ? `⏰ ${timeStr}` : ""}
                            </span>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
                <div className="mt-4 text-right">
                  <span className="text-[10px] uppercase tracking-widest" style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", opacity: 0.7 }}>
                    Aggiornato ogni 12 ore · Fonte: Luma + RSS italiani
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* ── STRIP METRICHE — dopo i contenuti editoriali (come da prompt) ── */}
          <div className="mt-10 py-6 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-0"
            style={{ background: "rgba(0,0,0,0.03)", borderTop: "2px solid rgba(0,0,0,0.1)", borderBottom: "2px solid rgba(0,0,0,0.1)" }}>
            {[
              { value: "14", label: "canali\ntematici" },
              { value: "20+", label: "ricerche\nal giorno" },
              { value: "450+", label: "fonti\nmonitorate" },
              { value: "6.905", label: "lettori\nattivi" },
            ].map((m, i) => (
              <div key={m.label} className={`flex flex-col items-center justify-center py-2 ${i < 3 ? "sm:border-r border-[#1a1a1a]/10" : ""}`}>
                <span className="text-[28px] sm:text-[32px] font-black leading-none" style={{ color: "#0f0f0f", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>{m.value}</span>
                <span className="text-[10px] uppercase tracking-widest mt-1 text-center whitespace-pre-line" style={{ color: "rgba(26,26,46,0.45)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>{m.label}</span>
              </div>
            ))}
          </div>

          {/* ── STRIP PRE-FOOTER INTELLIGENCE ── */}
          <div className="mt-10 py-5 px-6 flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ background: "#0f0f0f", borderTop: "1px solid rgba(255,255,255,0.1)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <p className="text-[13px] text-center sm:text-left" style={{ color: "rgba(255,255,255,0.75)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
              CEO, founder, investitori: il tuo briefing settimanale personalizzato è a un click.
            </p>
            <Link href="/intelligence">
              <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 font-bold text-[11px] uppercase tracking-widest transition-all hover:opacity-90 border"
                style={{ borderColor: "rgba(255,255,255,0.4)", color: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", whiteSpace: "nowrap" }}>
                Attiva Intelligence →
              </span>
            </Link>
          </div>

          {/* ── FOOTER ── */}
          <div className="mt-12">
            <Divider thick />
            <div className="py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-[11px] text-[#1a1a1a]/40"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                {`© ${today.getFullYear()} IdeaSmart · AI · Startup · Venture Capital`}
              </p>
              <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-end">
                {(["ai", "startup"] as const).map(sec => (
                  <Link key={sec} href={SECTION_COLORS[sec].path}>
                    <span className="text-[10px] hover:underline cursor-pointer"
                      style={{ color: SECTION_COLORS[sec].accent, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                      {SECTION_COLORS[sec].label}
                    </span>
                  </Link>
                ))}
                {[
                  { href: "/chi-siamo", label: "Chi Siamo", color: "#1a1a1a" },
                  { href: "/intelligence", label: "Intelligence", color: "#1a1a1a" },
                  { href: "/research", label: "RICERCHE", color: "#1a1a1a" },
                  { href: "/privacy", label: "Privacy Policy", color: "#1a1a1a" },
                ].map(item => (
                  <Link key={item.href} href={item.href}>
                    <span className="text-[10px] hover:underline cursor-pointer font-bold"
                      style={{ color: item.color, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
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
