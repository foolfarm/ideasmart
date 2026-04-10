/*
 * IdeaSmart — Prima Pagina Giornale
 * Layout: testata → breaking → Punto del Giorno → griglia [hero+secondarie | sidebar news]
 * Ispirazione: Il Sole 24 Ore — prima pagina cartacea
 * Tipografia: SF Pro Display (titoli), SF Pro Text (corpo) — sistema Apple
 * Font size: body 15-16px, titoli secondari 20-22px, hero 32-38px
 */
import { useMemo, useRef, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useSiteAuth } from "@/hooks/useSiteAuth";
import SEOHead from "@/components/SEOHead";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import BreakingNewsSection from "@/components/BreakingNewsSection";
import PuntoDelGiorno from "@/components/PuntoDelGiorno";
import { Cpu, Rocket, Handshake, BookOpen, User, LogOut, Settings } from "lucide-react";
import LeftSidebar from "@/components/LeftSidebar";
import VerifyBadge from "@/components/VerifyBadge";

// ─── Costanti colori sezione ─────────────────────────────────────────────────
const SECTION_COLORS = {
  ai:            { accent: "#1a1a1a", light: "#f5f5f5", label: "AI NEWS",        path: "/ai" },
  startup:       { accent: "#2a2a2a", light: "#f5f5f5", label: "STARTUP NEWS",        path: "/startup" },
  research:      { accent: "#1a1a1a", light: "#eff6ff", label: "RESEARCH",             path: "/research" },
  dealroom:      { accent: "#0f0f0f", light: "#f0f9ff", label: "DEALROOM",            path: "/dealroom" }
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
  verifyHash?: string | null;
};

// ─── Utility ─────────────────────────────────────────────────────────────────
function formatDateIT(date: Date): string {
  return date.toLocaleDateString("it-IT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
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
    <h3
      className="mt-2 leading-tight text-[#1a1a1a] hover:underline"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif", fontSize: "clamp(30px, 4vw, 42px)", fontWeight: 800, lineHeight: 1.15 }}
    >
      {title}
    </h3>
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
        {item.verifyHash && (
          <div className="mt-1.5">
            <VerifyBadge hash={item.verifyHash} size="sm" />
          </div>
        )}
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
            lineHeight: 1.3
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
      {item.verifyHash && (
        <div className="mt-1">
          <VerifyBadge hash={item.verifyHash} size="sm" />
        </div>
      )}
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
// ─── USER PROFILE DROPDOWN (Home) ───────────────────────────────────────────
function HomeUserProfileDropdown({ user, logout }: { user: { username?: string | null } | null; logout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-full hover:bg-[#1a1a1a]/8 transition-colors"
        style={{ fontFamily: SF }}
      >
        <div className="w-7 h-7 rounded-full bg-[#1a1a1a] flex items-center justify-center">
          <User size={14} color="#fff" strokeWidth={2.2} />
        </div>
        <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest text-[#1a1a1a] max-w-[100px] truncate">
          {user?.username}
        </span>
      </button>
      <div
        className="absolute right-0 top-full mt-1 bg-white border border-[#1a1a1a]/12 shadow-lg rounded-md overflow-hidden z-[60] transition-all duration-200 origin-top-right"
        style={{
          opacity: open ? 1 : 0,
          transform: open ? "scale(1) translateY(0)" : "scale(0.95) translateY(-4px)",
          pointerEvents: open ? "auto" : "none",
          minWidth: "180px",
        }}
      >
        <div className="px-3 py-2.5 border-b border-[#1a1a1a]/8">
          <p className="text-[11px] font-bold text-[#1a1a1a] truncate" style={{ fontFamily: SF }}>
            {user?.username}
          </p>
        </div>
        <Link href="/account">
          <span
            className="flex items-center gap-2 px-3 py-2.5 text-[11px] font-medium text-[#1a1a1a] hover:bg-[#f5f5f5] transition-colors cursor-pointer"
            style={{ fontFamily: SF }}
            onClick={() => setOpen(false)}
          >
            <Settings size={14} strokeWidth={2} />
            Account
          </span>
        </Link>
        <button
          onClick={() => { setOpen(false); logout(); }}
          className="flex items-center gap-2 px-3 py-2.5 text-[11px] font-medium text-[#dc2626] hover:bg-[#fef2f2] transition-colors w-full text-left"
          style={{ fontFamily: SF }}
        >
          <LogOut size={14} strokeWidth={2} />
          Esci
        </button>
      </div>
    </div>
  );
}

function HomeAuthButtons() {
  const { user, isLoading, isAuthenticated, logout } = useSiteAuth();
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
  if (isLoading) return null;
  if (isAuthenticated) {
    return <HomeUserProfileDropdown user={user} logout={logout} />;
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

  const dealroomNews = homeData?.dealroom ?? [];

  // Hero: primo articolo AI con immagine
  const aiHero = useMemo(() => aiNews.find(n => n.imageUrl) || aiNews[0] || null, [aiNews]);
  const aiRest = useMemo(() => aiNews.filter(n => n.id !== aiHero?.id), [aiNews, aiHero]);

  // Startup hero
  const startupHero = useMemo(() =>
    startupNews.find(n => n.imageUrl && n.imageUrl !== aiHero?.imageUrl) || startupNews[0] || null,
    [startupNews, aiHero]
  );
  const startupRest = useMemo(() => startupNews.filter(n => n.id !== startupHero?.id), [startupNews, startupHero]);

  // Sidebar: mix di tutte le sezioni (AI, Startup, Dealroom)
  const sidebarFeed = useMemo(() => {
    const items: Array<NewsItem & { section: SectionKey }> = [];
    const pools: Array<{ news: NewsItem[]; section: SectionKey }> = [
      { news: aiRest.slice(3), section: "ai" },
      { news: startupRest.slice(3), section: "startup" },
      { news: dealroomNews.slice(0, 4), section: "dealroom" }
    ];
    const maxLen = Math.max(...pools.map(p => p.news.length));
    for (let i = 0; i < maxLen; i++) {
      for (const pool of pools) {
        if (pool.news[i]) items.push({ ...pool.news[i], section: pool.section });
      }
    }
    return items.slice(0, 30);
  }, [aiRest, startupRest, dealroomNews]);

  return (
    <>
      <SEOHead
        title="Proof Press — AI, Startup e Venture Capital"
        description="Analisi quotidiane su Startup, Venture Capital e AI Trends — dati dalle principali fonti di ricerca globali ed europee."
        canonical="https://ideasmart.biz"
        ogSiteName="Proof Press"
      />

      <style>{`
        /* SF Pro system font — no external loading needed */
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .newspaper-col-rule { border-right: 1px solid rgba(26,26,46,0.15); }
      `}</style>

      <div className="flex min-h-screen" style={{ background: "#faf8f3", color: "#1a1a1a" }}>
        {/* ══ SIDEBAR SINISTRA FISSA ══════════════════════════════════════════ */}
        <LeftSidebar />

        {/* ══ CONTENUTO PRINCIPALE ═══════════════════════════════════════════ */}
        <div className="flex-1 min-w-0 overflow-x-hidden">

        {/* ══ TESTATA ══════════════════════════════════════════════════════════ */}
        <header className="max-w-[1280px] mx-auto px-4 pt-5 pb-0">
          {/* Riga data + categorie + auth */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-[#1a1a1a]/50 uppercase tracking-widest"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
              {formatDateIT(today)}
            </span>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-[11px] text-[#1a1a1a]/40 uppercase tracking-widest"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                Prompt · Tools · Workflow · News
              </span>
              <HomeAuthButtons />
            </div>
          </div>
          <Divider thick />

          {/* Header centrato */}
          <div className="py-4">

            {/* Sopra il titolo: descrizione full-width su una sola riga */}
            <p className="text-center uppercase tracking-[0.18em] text-[#1a1a1a]/40 font-medium whitespace-nowrap overflow-hidden text-ellipsis mb-3"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", fontSize: "10px" }}>
              Il Magazine che analizza e verifica ogni giorno 4.000+ fonti per trasformare l’informazione in insight esclusivi e affidabili.
            </p>

            {/* Brand centrale con manchette Tradedoubler ai lati */}
            <div className="flex items-center justify-center gap-4">
              {/* Manchette sinistra — Tradedoubler */}
              <div className="hidden lg:flex flex-shrink-0 w-[160px] items-center justify-center overflow-hidden">
                <a href="https://clk.tradedoubler.com/click?p=365615&a=3477790&g=26113480" target="_blank" rel="noopener noreferrer sponsored">
                  <img
                    src={`https://imp.tradedoubler.com/imp?type(img)g(26113480)a(3477790)${Math.random().toString().substring(2, 11)}`}
                    width="300"
                    height="250"
                    alt="Pubblicità"
                    style={{ width: '160px', height: 'auto', display: 'block', border: 0 }}
                  />
                </a>
              </div>

              {/* Titolo centrale + sottotitolo 2 righe */}
              <div className="text-center flex-1 min-w-0">
                <Link href="/">
                  <div className="cursor-pointer hover:opacity-80 transition-opacity">
                    <h1 className="font-black tracking-tight text-[#1a1a1a] inline"
                      style={{
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
                        fontSize: "clamp(42px, 7vw, 88px)",
                        letterSpacing: "-0.02em",
                        lineHeight: 1
                      }}>
                      ProofPress
                    </h1>
                  </div>
                </Link>
                {/* Sottotitolo: riga 1 più grande, riga 2 più piccola */}
                <div className="mt-2 uppercase tracking-[0.2em] text-[#1a1a1a]/60 font-semibold"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                  <div style={{ fontSize: "13px", lineHeight: 1.4 }}>La prima piattaforma di giornalismo agentico certificato</div>
                  <div style={{ fontSize: "10px", lineHeight: 1.4, marginTop: "2px" }}>per innovatori, creator, aziende ed editori</div>
                </div>
              </div>

              {/* Manchette destra — Tradedoubler */}
              <div className="hidden lg:flex flex-shrink-0 w-[160px] items-center justify-center overflow-hidden">
                <a href="https://clk.tradedoubler.com/click?p=341133&a=3477790&g=26092910" target="_blank" rel="noopener noreferrer sponsored">
                  <img
                    src={`https://imp.tradedoubler.com/imp?type(img)g(26092910)a(3477790)${Math.random().toString().substring(2, 11)}`}
                    width="300"
                    height="250"
                    alt="Pubblicità"
                    style={{ width: '160px', height: 'auto', display: 'block', border: 0 }}
                  />
                </a>
              </div>
            </div>

          </div>

          <Divider thick />

        </header>

        {/* ══ BREAKING NEWS ════════════════════════════════════════════════════ */}
        <BreakingNewsSection />
        <BreakingNewsTicker />

        {/* ══ BANNER COLLEZIONE PROMPT ════════════════════════════════════════ */}
        <div className="max-w-[1280px] mx-auto px-4 mt-3">
          <a
            href="https://ideasmart.forum/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-3 rounded-lg transition-all duration-300 hover:shadow-lg group"
            style={{ background: "#1a1a1a", textDecoration: "none" }}
          >
            <div className="flex-shrink-0 text-2xl">📋</div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] mb-0.5" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Arial, sans-serif" }}>Collezione Proof Press</p>
              <p className="text-[14px] font-black leading-tight" style={{ color: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif" }}>Prompt da usare davvero nel lavoro quotidiano — 39€</p>
            </div>
            <span className="flex-shrink-0 text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded group-hover:opacity-90 transition-opacity" style={{ background: "#e74c3c", color: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Arial, sans-serif" }}>Scopri →</span>
          </a>
        </div>

        {/* ══ CORPO ═══════════════════════════════════════════════════════════════════ */}
        <main className="max-w-[1280px] mx-auto px-4 pb-16">



          {/* ══════════════════════════════════════════════════════════════════
              PRIMA PAGINA — Layout giornale
              [Colonna principale 70%] | [Sidebar notizie 30%]
          ══════════════════════════════════════════════════════════════════ */}
          {!homeLoading && (
            <section className="mt-4">
              <Divider thick />
              <div className="py-2 flex items-center justify-between">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]/50 m-0"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", fontSize: "11px", lineHeight: 1 }}>
                  Prima Pagina — {formatDateIT(today)}
                </h2>
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
                          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] m-0"
                            style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", fontSize: "11px", lineHeight: 1 }}>
                            Proof Press — 20 ricerche al giorno
                          </h2>
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

                  {/* ── SEZIONE DEALROOM — Round, Funding, VC, M&A ── */}
                  {dealroomNews.length > 0 && (
                    <div className="mt-8">
                      <Divider thick />
                      <div className="py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-[3px] w-6" style={{ background: "#0f0f0f" }} />
                          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] m-0"
                            style={{ color: "#0f0f0f", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", fontSize: "10px", lineHeight: 1 }}>
                            DEALROOM — Round, Funding &amp; M&amp;A
                          </h2>
                        </div>
                        <Link href="/dealroom">
                          <span className="text-[10px] font-bold uppercase tracking-widest hover:underline cursor-pointer"
                            style={{ color: "#0f0f0f", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                            Tutte le deal →
                          </span>
                        </Link>
                      </div>
                      <div className="border-t-2" style={{ borderColor: "#0f0f0f" }} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mt-2">
                        {dealroomNews.slice(0, 4).map((item, i) => (
                          <div key={item.id}
                            className={`${
                              i % 2 === 0 ? "md:pr-5 md:border-r border-[#1a1a1a]/15" : "md:pl-5"
                            } ${i > 1 ? "border-t border-[#1a1a1a]/12" : ""}`}>
                            <SecondaryArticle item={item} section="dealroom" />
                          </div>
                        ))}
                      </div>
                      {dealroomNews.length > 4 && (
                        <div className="mt-4 border-t border-[#1a1a1a]/10 pt-3">
                          <div className="flex flex-col gap-0">
                            {dealroomNews.slice(4, 8).map((item, i) => (
                              <div key={item.id} className={i > 0 ? "border-t border-[#1a1a1a]/8" : ""}>
                                <SidebarNewsItem item={item} section="dealroom" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="mt-3">
                        <Link href="/dealroom">
                          <span className="text-[10px] font-bold uppercase tracking-widest hover:underline"
                            style={{ color: "#0f0f0f", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                            Vedi tutti i deal →
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

                  {/* ── Box Annuncio ProofPress ── */}
                  <Link href="/proofpress-verify">
                    <div className="mb-5 p-5 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 group"
                      style={{ background: "#f5f3ee", border: "1px solid rgba(26,26,26,0.08)" }}>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2"
                        style={{ color: "rgba(26,26,26,0.45)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Arial, sans-serif" }}>
                        Novità
                      </p>
                      <p className="text-[18px] font-black leading-tight mb-2"
                        style={{ color: "#1a1a1a", fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif", letterSpacing: "-0.02em" }}>
                        Ideasmart diventa Proof Press.
                      </p>
                      <p className="text-[12px] leading-relaxed mb-4"
                        style={{ color: "rgba(26,26,26,0.6)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                        La rivoluzione della notizia: certificata, automatizzata, vera. No fakes, more news vere per basare le vostre decisioni.
                      </p>
                      <span className="block text-center text-[11px] font-bold uppercase tracking-wider py-2.5 group-hover:opacity-80 transition-opacity rounded"
                        style={{ background: "#e74c3c", color: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                        Scopri La ProofPress Verify Technology →
                      </span>
                    </div>
                  </Link>

                  {/* ── Banner Collezione Prompt — sidebar ── */}
                  <a
                    href="https://ideasmart.forum/"
                    className="block mb-5 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 group"
                    style={{ textDecoration: "none" }}
                  >
                    <div className="p-5 rounded-lg" style={{ background: "#f5f3ee", border: "1px solid rgba(26,26,26,0.08)" }}>
                      <p className="text-[18px] font-black leading-tight mb-3"
                        style={{ color: "#1a1a1a", fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif", letterSpacing: "-0.02em" }}>
                        La collezione Proof Press di prompt da usare davvero nel lavoro quotidiano.
                      </p>
                      <p className="text-[12px] leading-relaxed mb-4"
                        style={{ color: "rgba(26,26,26,0.6)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                        Un funnel semplice e concreto: arrivi dalla newsletter, acquisti a <strong style={{ color: "#1a1a1a" }}>39 €</strong> e ottieni accesso alla libreria ricercabile con il PDF completo incluso.
                      </p>
                      <span className="block text-center text-[11px] font-bold uppercase tracking-wider py-2.5 group-hover:opacity-90 transition-opacity rounded"
                        style={{ background: "#e74c3c", color: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                        Scopri la collezione →
                      </span>
                    </div>
                  </a>

                  {/* ── Banner iscrizione gratuita — sidebar ── */}
                  <div className="mb-5 p-4 border-l-4" style={{ background: "#f5f3ee", borderColor: "#1a1a1a" }}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2"
                      style={{ color: "rgba(26,26,26,0.45)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                      Proof Press
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
                      <Link href="/dealroom">
                        <span className="text-[10px] font-bold uppercase tracking-widest hover:underline block"
                          style={{ color: SECTION_COLORS.dealroom.accent, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                          DEALROOM →
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
                      other:      { bg: "#f1f5f9", text: "#475569", label: "Evento" }
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




          {/* ── FOOTER ── */}
          <div className="mt-12">
            <Divider thick />
            <div className="py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-[11px] text-[#1a1a1a]/40"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                {`© ${today.getFullYear()} Proof Press · AI · Startup · Venture Capital`}
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
                  { href: "/dealroom", label: "DEALROOM", color: "#1a1a1a" },
                  { href: "/chi-siamo", label: "Chi Siamo", color: "#1a1a1a" },
                  { href: "/research", label: "RICERCHE", color: "#1a1a1a" },
                  { href: "/privacy", label: "Privacy Policy", color: "#1a1a1a" }
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
        </div>{/* fine contenuto principale */}
      </div>
    </>
  );
}
