/*
 * ProofPress — Home Page Editoriale
 * Design: StartupItalia-inspired — immagini 16:9 grandi, titoli Playfair Display serif bold,
 *         griglia 3 colonne, sfondo bianco, accent rosso #e63946
 * Mantiene: VerifyBadge, CommentSection, BannerRotator, PuntoDelGiorno, VerifyStatsWidget
 * Italia First: badge 🇮🇹 su notizie italiane, notizie IT in cima
 */
import React, { useMemo, useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useSiteAuth } from "@/hooks/useSiteAuth";
import SEOHead from "@/components/SEOHead";
import PuntoDelGiorno from "@/components/PuntoDelGiorno";
import EditorialeDelDirettore from "@/components/EditorialeDelDirettore";
import { User, LogOut, Settings, Star } from "lucide-react";
import VerifyBadge from "@/components/VerifyBadge";
import CommentSection from "@/components/CommentSection";
import BannerRotator from "@/components/BannerRotator";
import { Skeleton } from "@/components/ui/skeleton";
import VerifyStatsWidget from "@/components/VerifyStatsWidget";
import { useTranslation } from "react-i18next";

// ─── Costanti design ─────────────────────────────────────────────────────────
const ACCENT = "#e63946";       // rosso ProofPress
const FONT_SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
const FONT_SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif";

const SECTION_COLORS = {
  ai:       { accent: ACCENT,    label: "AI",       path: "/ai" },
  startup:  { accent: "#1a1a1a", label: "Startup",  path: "/startup" },
  research: { accent: "#1a1a1a", label: "Research", path: "/research" },
  dealroom: { accent: "#0f0f0f", label: "Deal",     path: "/dealroom" },
};
type SectionKey = keyof typeof SECTION_COLORS;

type NewsItem = {
  id: number;
  title: string;
  summary: string;
  titleEn?: string | null;
  summaryEn?: string | null;
  category: string;
  sourceName: string;
  sourceUrl: string;
  publishedAt: string;
  imageUrl: string | null;
  videoUrl?: string | null;
  section?: string;
  verifyHash?: string | null;
  trustGrade?: string | null;
  trustScore?: number | null;
  ipfsCid?: string | null;
  ipfsUrl?: string | null;
  ppvHash?: string | null;
  ppvIpfsUrl?: string | null;
  ppvTrustGrade?: string | null;
  ppvTrustScore?: number | null;
  ppvDocumentId?: number | null;
  isItalian?: boolean;
};

// ─── Language helpers ────────────────────────────────────────────────────────
const LangContext = React.createContext<"it" | "en">("it");
function useLang() { return React.useContext(LangContext); }
function itemTitle(item: NewsItem, lang: "it" | "en"): string {
  if (lang === "en" && item.titleEn) return item.titleEn;
  return item.title;
}
function itemSummary(item: NewsItem, lang: "it" | "en"): string {
  if (lang === "en" && item.summaryEn) return item.summaryEn;
  return item.summary;
}

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
function NewsItemHref(item: NewsItem, sectionOverride?: string): string {
  const sec = sectionOverride || item.section || "ai";
  return `/${sec}/news/${item.id}`;
}

// ─── Badge sezione ────────────────────────────────────────────────────────────
function SectionBadge({ section, label }: { section: SectionKey; label?: string }) {
  const s = SECTION_COLORS[section];
  return (
    <span
      className="inline-block text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 mr-1"
      style={{ background: s.accent, color: "#fff", fontFamily: FONT_SANS, borderRadius: "3px" }}
    >
      {label || s.label}
    </span>
  );
}

// ─── Badge Italia ─────────────────────────────────────────────────────────────
function ItalyBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 mr-1"
      style={{ background: "#f0f9f0", color: "#1a7a3a", fontFamily: FONT_SANS, borderRadius: "3px", border: "1px solid #d4edda" }}>
      🇮🇹 IT
    </span>
  );
}

// ─── HERO CARD — Grande, immagine 16:9 full-width, titolo Playfair ────────────
function HeroCard({ item, section }: { item: NewsItem; section: SectionKey }) {
  const lang = useLang();
  const href = NewsItemHref(item, section);
  const title = itemTitle(item, lang);
  const summary = itemSummary(item, lang);

  return (
    <article className="group cursor-pointer">
      {/* Immagine 16:9 */}
      <Link href={href}>
        <div className="relative overflow-hidden rounded-lg bg-[#f5f5f5]" style={{ aspectRatio: "16/9" }}>
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={title}
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f5f5f5] to-[#e8e8e8]">
              <span className="text-[#999] text-xs uppercase tracking-widest font-medium" style={{ fontFamily: FONT_SANS }}>ProofPress</span>
            </div>
          )}
          {/* Overlay gradient per leggibilità */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
      </Link>
      {/* Contenuto */}
      <div className="mt-3">
        <div className="flex items-center gap-1 mb-2 flex-wrap">
          <SectionBadge section={section} />
          {item.isItalian && <ItalyBadge />}
        </div>
        <Link href={href}>
          <h2
            className="text-[#1a1a1a] hover:text-[#e63946] transition-colors leading-tight"
            style={{
              fontFamily: FONT_SERIF,
              fontSize: "clamp(22px, 3vw, 32px)",
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: "-0.01em"
            }}
          >
            {title}
          </h2>
        </Link>
        <p className="mt-2 text-[15px] leading-relaxed text-[#555]"
          style={{ fontFamily: FONT_SANS, lineHeight: 1.65 }}>
          {summary.slice(0, 220)}{summary.length > 220 ? "…" : ""}
        </p>
        <p className="mt-2 text-[11px] text-[#999] uppercase tracking-widest"
          style={{ fontFamily: FONT_SANS }}>
          {item.sourceName}{item.publishedAt ? ` · ${formatShortDate(item.publishedAt)}` : ""}
        </p>
        {(item.verifyHash || item.ppvHash) && (
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <VerifyBadge
              hash={item.ppvHash || item.verifyHash}
              size="sm"
              trustGrade={item.ppvTrustGrade || item.trustGrade}
              trustScore={item.ppvTrustScore ?? item.trustScore}
              ppvHash={item.ppvHash}
              ppvIpfsUrl={item.ppvIpfsUrl}
              ppvTrustGrade={item.ppvTrustGrade}
              ppvDocumentId={item.ppvDocumentId}
            />
          </div>
        )}
      </div>
    </article>
  );
}

// ─── MEDIUM CARD — Immagine 16:9 + titolo breve ──────────────────────────────
function MediumCard({ item, section }: { item: NewsItem; section: SectionKey }) {
  const lang = useLang();
  const href = NewsItemHref(item, section);
  const title = itemTitle(item, lang);
  const summary = itemSummary(item, lang);

  return (
    <article className="group cursor-pointer">
      <Link href={href}>
        <div className="relative overflow-hidden rounded-md bg-[#f5f5f5]" style={{ aspectRatio: "16/9" }}>
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f5f5f5] to-[#e8e8e8]">
              <span className="text-[#bbb] text-[10px] uppercase tracking-widest font-medium" style={{ fontFamily: FONT_SANS }}>ProofPress</span>
            </div>
          )}
        </div>
      </Link>
      <div className="mt-2.5">
        <div className="flex items-center gap-1 mb-1.5 flex-wrap">
          <SectionBadge section={section} />
          {item.isItalian && <ItalyBadge />}
        </div>
        <Link href={href}>
          <h3
            className="text-[#1a1a1a] hover:text-[#e63946] transition-colors leading-snug line-clamp-3"
            style={{
              fontFamily: FONT_SERIF,
              fontSize: "clamp(16px, 1.8vw, 20px)",
              fontWeight: 700,
              lineHeight: 1.3
            }}
          >
            {title}
          </h3>
        </Link>
        <p className="mt-1.5 text-[13px] text-[#666] line-clamp-2"
          style={{ fontFamily: FONT_SANS, lineHeight: 1.55 }}>
          {summary.slice(0, 140)}{summary.length > 140 ? "…" : ""}
        </p>
        <p className="mt-1 text-[10px] text-[#999] uppercase tracking-widest"
          style={{ fontFamily: FONT_SANS }}>
          {item.sourceName}{item.publishedAt ? ` · ${formatShortDate(item.publishedAt)}` : ""}
        </p>
        {(item.verifyHash || item.ppvHash) && (
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            <VerifyBadge
              hash={item.ppvHash || item.verifyHash}
              size="sm"
              trustGrade={item.ppvTrustGrade || item.trustGrade}
              trustScore={item.ppvTrustScore ?? item.trustScore}
              ppvHash={item.ppvHash}
              ppvIpfsUrl={item.ppvIpfsUrl}
              ppvTrustGrade={item.ppvTrustGrade}
              ppvDocumentId={item.ppvDocumentId}
            />
          </div>
        )}
      </div>
    </article>
  );
}

// ─── SMALL CARD — Solo testo, titolo + fonte + data ──────────────────────────
function SmallCard({ item, section, showImage = false }: { item: NewsItem; section: SectionKey; showImage?: boolean }) {
  const lang = useLang();
  const href = NewsItemHref(item, section);
  const title = itemTitle(item, lang);

  return (
    <article className="group cursor-pointer flex gap-3 py-3 border-b border-[#f0f0f0] last:border-0">
      {showImage && item.imageUrl && (
        <Link href={href}>
          <div className="flex-shrink-0 w-20 h-14 overflow-hidden rounded-md bg-[#f5f5f5]">
            <img src={item.imageUrl} alt={title} loading="lazy"
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
          </div>
        </Link>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 mb-1 flex-wrap">
          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5"
            style={{ background: SECTION_COLORS[section].accent, color: "#fff", fontFamily: FONT_SANS, borderRadius: "2px" }}>
            {SECTION_COLORS[section].label}
          </span>
          {item.isItalian && <span className="text-[9px]">🇮🇹</span>}
          {item.publishedAt && (
            <span className="text-[9px] text-[#999]" style={{ fontFamily: FONT_SANS }}>
              {formatShortDate(item.publishedAt)}
            </span>
          )}
        </div>
        <Link href={href}>
          <p className="text-[14px] font-bold text-[#1a1a1a] hover:text-[#e63946] transition-colors leading-snug line-clamp-2"
            style={{ fontFamily: FONT_SERIF }}>
            {title}
          </p>
        </Link>
        <p className="text-[10px] text-[#999] mt-0.5" style={{ fontFamily: FONT_SANS }}>
          {item.sourceName}
        </p>
      </div>
    </article>
  );
}

// ─── SECTION HEADER ──────────────────────────────────────────────────────────
function SectionHeader({ title, accent, href }: { title: string; accent: string; href: string }) {
  return (
    <div className="flex items-center justify-between mb-4 pb-2" style={{ borderBottom: `3px solid ${accent}` }}>
      <h2 className="text-[13px] font-bold uppercase tracking-[0.15em] m-0"
        style={{ color: accent, fontFamily: FONT_SANS }}>
        {title}
      </h2>
      <Link href={href}>
        <span className="text-[10px] font-bold uppercase tracking-widest hover:underline cursor-pointer"
          style={{ color: accent, fontFamily: FONT_SANS }}>
          Tutte →
        </span>
      </Link>
    </div>
  );
}

// ─── AMAZON DEAL MANCHETTE ───────────────────────────────────────────────────
function HomeAmazonDeal({ offset = 0 }: { offset?: number }) {
  const { data: deals } = trpc.amazonDeals.getDealsWithImage.useQuery({ limit: 6 }, { staleTime: 1000 * 60 * 60 });
  const trackClick = trpc.amazonDeals.trackClick.useMutation();
  const deal = deals && deals.length > 0 ? deals[offset % deals.length] : null;
  if (!deal || !deal.imageUrl || !deal.imageUrl.startsWith('http')) {
    return <div className="hidden xl:block flex-shrink-0" style={{ width: '90px' }} />;
  }
  return (
    <div className="hidden xl:flex flex-col flex-shrink-0 items-center gap-0.5" style={{ width: '90px' }}>
      <a href={deal.affiliateUrl} target="_blank" rel="noopener noreferrer sponsored"
        onClick={() => trackClick.mutate({ id: deal.id })}
        className="w-full block rounded-lg overflow-hidden border border-[#e5e5ea] bg-white hover:border-[#ff9900] transition-colors group"
        style={{ textDecoration: 'none' }} title={deal.title}>
        <div className="w-full overflow-hidden" style={{ height: '60px', background: '#fff' }}>
          <img src={deal.imageUrl} alt={deal.title} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', padding: '3px' }} />
        </div>
        <div className="px-1.5 py-1 bg-white">
          <p style={{ fontFamily: FONT_SANS, fontSize: '8px', fontWeight: 700, color: '#1d1d1f', lineHeight: 1.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {deal.title}
          </p>
          {deal.price && deal.price !== '...' && (
            <p style={{ fontFamily: FONT_SANS, fontSize: '9px', fontWeight: 800, color: '#ff9900', marginTop: '1px' }}>{deal.price}</p>
          )}
          {deal.rating && (
            <div className="flex items-center gap-0.5 mt-0.5">
              <Star size={7} fill="#ff9900" color="#ff9900" />
              <span style={{ fontFamily: FONT_SANS, fontSize: '7px', color: '#6e6e73' }}>{deal.rating}</span>
            </div>
          )}
        </div>
        <div className="px-1.5 py-0.5 bg-[#ff9900] group-hover:bg-[#e68900] transition-colors">
          <p style={{ fontFamily: FONT_SANS, fontSize: '7px', fontWeight: 700, color: '#fff', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Vedi su Amazon</p>
        </div>
      </a>
      <span style={{ fontFamily: FONT_SANS, fontSize: '8px', letterSpacing: '0.06em', color: '#aeaeb2', textTransform: 'uppercase' }}>Sponsorizzato</span>
    </div>
  );
}

// ─── AUTH BUTTONS ────────────────────────────────────────────────────────────
function HomeUserProfileDropdown({ user, logout }: { user: { username?: string | null } | null; logout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-full hover:bg-[#1a1a1a]/8 transition-colors"
        style={{ fontFamily: FONT_SANS }}>
        <div className="w-7 h-7 rounded-full bg-[#1a1a1a] flex items-center justify-center">
          <User size={14} color="#fff" strokeWidth={2.2} />
        </div>
        <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest text-[#1a1a1a] max-w-[100px] truncate">
          {user?.username}
        </span>
      </button>
      <div className="absolute right-0 top-full mt-1 bg-white border border-[#1a1a1a]/12 shadow-lg rounded-md overflow-hidden z-[60] transition-all duration-200 origin-top-right"
        style={{ opacity: open ? 1 : 0, transform: open ? "scale(1) translateY(0)" : "scale(0.95) translateY(-4px)", pointerEvents: open ? "auto" : "none", minWidth: "180px" }}>
        <div className="px-3 py-2.5 border-b border-[#1a1a1a]/8">
          <p className="text-[11px] font-bold text-[#1a1a1a] truncate" style={{ fontFamily: FONT_SANS }}>{user?.username}</p>
        </div>
        <Link href="/account">
          <span className="flex items-center gap-2 px-3 py-2.5 text-[11px] font-medium text-[#1a1a1a] hover:bg-[#f5f5f5] transition-colors cursor-pointer"
            style={{ fontFamily: FONT_SANS }} onClick={() => setOpen(false)}>
            <Settings size={14} strokeWidth={2} /> Account
          </span>
        </Link>
        <button onClick={() => { setOpen(false); logout(); }}
          className="flex items-center gap-2 px-3 py-2.5 text-[11px] font-medium text-[#6e6e73] hover:bg-[#f5f5f7] transition-colors w-full text-left"
          style={{ fontFamily: FONT_SANS }}>
          <LogOut size={14} strokeWidth={2} /> Esci
        </button>
      </div>
    </div>
  );
}

function HomeAuthButtons() {
  const { user, isLoading, isAuthenticated, logout } = useSiteAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <HomeUserProfileDropdown user={user} logout={logout} />;
  return (
    <div className="flex items-center gap-0">
      <Link href="/accedi">
        <span className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-[#1a1a1a] hover:text-white transition-colors whitespace-nowrap border-r border-[#1a1a1a]/15"
          style={{ fontFamily: FONT_SANS, color: "#1a1a1a" }}>
          Accedi
        </span>
      </Link>
      <Link href="/registrati">
        <span className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap"
          style={{ fontFamily: FONT_SANS, background: "#1a1a1a", color: "#ffffff" }}>
          Registrati
        </span>
      </Link>
    </div>
  );
}

// ─── NAVBAR SEZIONI ──────────────────────────────────────────────────────────
function SectionsNav() {
  const sections = [
    { label: "AI", href: "/ai" },
    { label: "Startup", href: "/startup" },
    { label: "Research", href: "/research" },
    { label: "Dealroom", href: "/dealroom" },
    { label: "Personaggi", href: "/personaggi" },
  ];
  return (
    <nav className="border-b border-[#e8e8e8] bg-white sticky top-0 z-40 shadow-sm">
      <div className="max-w-[1280px] mx-auto px-4">
        <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
          {sections.map((s) => (
            <Link key={s.href} href={s.href}>
              <span
                className="inline-block px-4 py-3 text-[12px] font-bold uppercase tracking-[0.1em] whitespace-nowrap cursor-pointer hover:text-[#e63946] transition-colors border-b-2 border-transparent hover:border-[#e63946]"
                style={{ fontFamily: FONT_SANS, color: "#1a1a1a" }}
              >
                {s.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

// ─── HOME PRINCIPALE ─────────────────────────────────────────────────────────
export default function Home() {
  const today = useMemo(() => new Date(), []);
  const { i18n } = useTranslation();
  const lang = (i18n.language?.startsWith("en") ? "en" : "it") as "it" | "en";
  const queryOpts = { staleTime: 10 * 60 * 1000, refetchOnWindowFocus: false };
  const criticalQueryOpts = { ...queryOpts, retry: 2, retryDelay: 1500 };

  const { data: homeData, isLoading: homeLoadingRaw } = trpc.news.getHomeData.useQuery({ lang }, criticalQueryOpts);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoadingTimeout(true), 8000);
    return () => clearTimeout(t);
  }, []);
  const homeLoading = homeLoadingRaw && !loadingTimeout;

  const { data: researchReports } = trpc.news.getResearchReports.useQuery({ limit: 6 }, queryOpts);
  const { data: researchOfDay } = trpc.news.getResearchOfDay.useQuery(undefined, criticalQueryOpts);
  const { data: upcomingEvents } = trpc.events.getUpcoming.useQuery({ limit: 3, category: "all" }, queryOpts);
  const { data: authorPosts } = trpc.news.getAuthorPosts.useQuery({ limit: 3 }, queryOpts);
  const { data: topNewsWithImages } = trpc.news.getTopWithImages.useQuery({ limit: 6 }, queryOpts);
  const { data: featuredPersonaggi } = trpc.personaggi.getFeatured.useQuery(undefined, queryOpts);

  const aiNews      = homeData?.ai      ?? [];
  const startupNews = homeData?.startup ?? [];
  const dealroomNews = homeData?.dealroom ?? [];

  // Hero principale: primo AI con immagine
  const aiHero = useMemo(() => aiNews.find(n => n.imageUrl) || aiNews[0] || null, [aiNews]);
  const aiRest = useMemo(() => aiNews.filter(n => n.id !== aiHero?.id).slice(0, 8), [aiNews, aiHero]);

  // Startup hero
  const startupHero = useMemo(() =>
    startupNews.find(n => n.imageUrl) || startupNews[0] || null,
    [startupNews]
  );
  const startupRest = useMemo(() => startupNews.filter(n => n.id !== startupHero?.id).slice(0, 6), [startupNews, startupHero]);

  // Deal hero
  const dealHero = useMemo(() => dealroomNews.find(n => n.imageUrl) || dealroomNews[0] || null, [dealroomNews]);
  const dealRest = useMemo(() => dealroomNews.filter(n => n.id !== dealHero?.id).slice(0, 5), [dealroomNews, dealHero]);

  // Griglia 3 colonne principale: AI hero + 2 secondarie
  const grid3Items = useMemo(() => {
    const items: NewsItem[] = [];
    if (aiHero) items.push(aiHero);
    if (startupHero) items.push(startupHero);
    if (dealHero) items.push(dealHero);
    return items;
  }, [aiHero, startupHero, dealHero]);

  return (
    <LangContext.Provider value={lang}>
      <>
        <SEOHead
          title="Proof Press — AI, Startup e Venture Capital"
          description="AI, Startup e Venture Capital verificati da 4.000+ fonti ogni giorno. Insight esclusivi per decision maker, founder e investitori. ProofPress Verify."
          canonical="https://proofpress.ai"
          ogSiteName="Proof Press"
        />

        <style>{`
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
          .pp-divider { border-top: 1px solid #e8e8e8; }
          .pp-divider-thick { border-top: 3px solid #1a1a1a; }
        `}</style>

        <div className="min-h-screen" style={{ background: "#ffffff", color: "#1d1d1f" }}>

          {/* ══ TESTATA ══════════════════════════════════════════════════════════ */}
          <header style={{ background: "#fff", borderBottom: "1px solid #e8e8e8" }}>
            <div className="max-w-[1280px] mx-auto px-4">
              {/* Riga superiore: data + auth */}
              <div className="flex items-center justify-between py-1.5 border-b border-[#f0f0f0]">
                <span className="text-[10px] text-[#999] uppercase tracking-widest" style={{ fontFamily: FONT_SANS }}>
                  {formatDateIT(today)}
                </span>
                <div className="flex items-center gap-3">
                  <HomeAuthButtons />
                </div>
              </div>

              {/* Brand centrato con manchette */}
              <div className="py-4 sm:py-6">
                <div className="hidden xl:grid xl:grid-cols-[160px_1fr_160px] items-center gap-4">
                  <div className="flex justify-center items-center">
                    <BannerRotator slot="left" width={160} height={100} site="it" />
                  </div>
                  <div className="text-center">
                    <Link href="/">
                      <h1 className="font-black tracking-tight text-[#1a1a1a] cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ fontFamily: FONT_SERIF, fontSize: "clamp(36px, 7vw, 88px)", letterSpacing: "-0.02em", lineHeight: 1 }}>
                        ProofPress
                      </h1>
                    </Link>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-[#999]" style={{ fontFamily: FONT_SANS }}>
                      AI · Startup · Venture Capital · 🇮🇹 Italia First
                    </p>
                  </div>
                  <div className="flex justify-center items-center">
                    <BannerRotator slot="right" width={160} height={100} site="it" />
                  </div>
                </div>
                {/* Mobile/tablet */}
                <div className="xl:hidden text-center">
                  <Link href="/">
                    <h1 className="font-black tracking-tight text-[#1a1a1a] cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ fontFamily: FONT_SERIF, fontSize: "clamp(32px, 8vw, 60px)", letterSpacing: "-0.02em", lineHeight: 1 }}>
                      ProofPress
                    </h1>
                  </Link>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#999]" style={{ fontFamily: FONT_SANS }}>
                    AI · Startup · Venture Capital · 🇮🇹 Italia First
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* ══ NAVBAR SEZIONI ══════════════════════════════════════════════════ */}
          <SectionsNav />

          {/* ══ VERIFY STATS WIDGET ═════════════════════════════════════════════ */}
          <VerifyStatsWidget />

          {/* ══ CORPO PRINCIPALE ════════════════════════════════════════════════ */}
          <main className="max-w-[1280px] mx-auto px-4 pb-16" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 68px)' }}>

            {/* ── LOADING SKELETON ── */}
            {homeLoading && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="w-full rounded-lg" style={{ aspectRatio: "16/9" }} />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-4/5" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            )}

            {!homeLoading && (
              <>
                {/* ── GRIGLIA HERO 3 COLONNE ── */}
                {grid3Items.length > 0 && (
                  <section className="mt-6">
                    <div className="pp-divider-thick mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Hero principale — più grande su mobile */}
                      {aiHero && (
                        <div className="md:col-span-1">
                          <HeroCard item={aiHero} section="ai" />
                        </div>
                      )}
                      {startupHero && (
                        <div className="md:col-span-1">
                          <HeroCard item={startupHero} section="startup" />
                        </div>
                      )}
                      {dealHero && (
                        <div className="md:col-span-1">
                          <HeroCard item={dealHero} section="dealroom" />
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* ── PUNTO DEL GIORNO ── */}
                <section className="mt-10">
                  <PuntoDelGiorno />
                </section>

                {/* ── GRIGLIA 3 COLONNE: AI + Startup + Dealroom ── */}
                <section className="mt-10">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Colonna AI */}
                    <div>
                      <SectionHeader title="AI News" accent={ACCENT} href="/ai" />
                      <div className="space-y-5">
                        {aiRest.slice(0, 3).map((item) => (
                          <MediumCard key={item.id} item={item} section="ai" />
                        ))}
                      </div>
                      {aiRest.length > 3 && (
                        <div className="mt-4 pt-4 border-t border-[#f0f0f0]">
                          {aiRest.slice(3, 7).map((item) => (
                            <SmallCard key={item.id} item={item} section="ai" />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Colonna Startup */}
                    <div>
                      <SectionHeader title="Startup" accent="#1a1a1a" href="/startup" />
                      <div className="space-y-5">
                        {startupRest.slice(0, 3).map((item) => (
                          <MediumCard key={item.id} item={item} section="startup" />
                        ))}
                      </div>
                      {startupRest.length > 3 && (
                        <div className="mt-4 pt-4 border-t border-[#f0f0f0]">
                          {startupRest.slice(3, 6).map((item) => (
                            <SmallCard key={item.id} item={item} section="startup" />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Colonna Dealroom + Sidebar */}
                    <div>
                      <SectionHeader title="Dealroom" accent="#0f0f0f" href="/dealroom" />
                      <div className="space-y-5">
                        {dealRest.slice(0, 2).map((item) => (
                          <MediumCard key={item.id} item={item} section="dealroom" />
                        ))}
                      </div>
                      {dealRest.length > 2 && (
                        <div className="mt-4 pt-4 border-t border-[#f0f0f0]">
                          {dealRest.slice(2, 5).map((item) => (
                            <SmallCard key={item.id} item={item} section="dealroom" />
                          ))}
                        </div>
                      )}

                      {/* Banner newsletter */}
                      <div className="mt-6">
                        <a href="/buongiorno" style={{ textDecoration: "none" }}>
                          <div className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                            <img
                              src="https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/banner-buongiorno-proofpress-o5yF8EwRCXLYHaxjCcjDgS.webp"
                              alt="Buongiorno ProofPress — Iscriviti alla newsletter delle 8:30"
                              style={{ width: "100%", display: "block" }}
                            />
                          </div>
                        </a>
                      </div>

                      {/* Banner sidebar */}
                      <div className="mt-4 flex justify-center">
                        <BannerRotator slot="sidebar" width={300} height={250} site="it" />
                      </div>

                      {/* Post di Andrea Cinelli */}
                      {authorPosts && authorPosts.length > 0 && (
                        <div className="mt-6">
                          <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: `3px solid #0077b5` }}>
                            <h3 className="text-[12px] font-bold uppercase tracking-[0.15em]"
                              style={{ color: "#0077b5", fontFamily: FONT_SANS }}>
                              Andrea Cinelli
                            </h3>
                          </div>
                          <div className="space-y-3">
                            {authorPosts.map((post) => {
                              const firstLine = (post.title || post.postText.split('\n')[0]).replace(/[*_#]/g, '').trim();
                              const postDate = new Date(post.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
                              return (
                                <article key={post.id} className="pb-3 border-b border-[#f0f0f0] last:border-0">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0" style={{ background: "#0077b5" }}>
                                      <svg width="8" height="8" viewBox="0 0 24 24" fill="white">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                      </svg>
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#0077b5", fontFamily: FONT_SANS }}>LinkedIn</span>
                                    <span className="text-[9px] text-[#999] ml-auto" style={{ fontFamily: FONT_SANS }}>{postDate}</span>
                                  </div>
                                  <p className="text-[13px] font-bold leading-snug text-[#1a1a1a] line-clamp-2"
                                    style={{ fontFamily: FONT_SERIF }}>
                                    {firstLine.length > 90 ? firstLine.slice(0, 90) + '…' : firstLine}
                                  </p>
                                  {post.linkedinUrl ? (
                                    <a href={post.linkedinUrl} target="_blank" rel="noopener noreferrer"
                                      className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider"
                                      style={{ color: "#0077b5", fontFamily: FONT_SANS }}>
                                      Leggi su LinkedIn →
                                    </a>
                                  ) : (
                                    <a href="/andrea-cinelli"
                                      className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider"
                                      style={{ color: "#0077b5", fontFamily: FONT_SANS }}>
                                      Leggi →
                                    </a>
                                  )}
                                </article>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Deep Dive editoriale */}
                      <div className="mt-6">
                        <EditorialeDelDirettore />
                      </div>
                    </div>
                  </div>
                </section>

                {/* ── BANNER ORIZZONTALE ── */}
                <div className="mt-10 py-4 border-t border-b border-[#e8e8e8]">
                  <BannerRotator slot="horizontal" height={100} fullWidth site="it" />
                </div>

                {/* ── RESEARCH DEL GIORNO ── */}
                {researchReports && researchReports.length > 0 && (
                  <section className="mt-10">
                    <SectionHeader title="Research — 20 ricerche al giorno" accent="#1a1a1a" href="/research" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {researchReports.slice(0, 6).map(r => (
                        <Link key={r.id} href={`/research/${r.id}`}>
                          <article className="cursor-pointer group border border-[#e8e8e8] rounded-lg p-4 hover:border-[#1a1a1a]/30 hover:shadow-sm transition-all">
                            <span className="inline-block text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 mb-2"
                              style={{ background: "#1a1a1a", color: "#fff", fontFamily: FONT_SANS, borderRadius: "2px" }}>
                              {r.category.replace("_", " ")}
                            </span>
                            <h4 className="text-[15px] font-bold leading-snug text-[#1a1a1a] group-hover:text-[#e63946] transition-colors line-clamp-3"
                              style={{ fontFamily: FONT_SERIF }}>
                              {r.title}
                            </h4>
                            <p className="mt-1.5 text-[12px] text-[#666] line-clamp-2"
                              style={{ fontFamily: FONT_SANS, lineHeight: 1.5 }}>
                              {r.summary}
                            </p>
                            <p className="mt-1.5 text-[10px] text-[#999] uppercase" style={{ fontFamily: FONT_SANS }}>
                              {r.source}
                            </p>
                          </article>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-5 text-center">
                      <Link href="/research">
                        <span className="inline-block text-[11px] font-bold uppercase tracking-widest px-6 py-2.5 border border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-colors cursor-pointer"
                          style={{ fontFamily: FONT_SANS }}>
                          Vedi tutte le ricerche →
                        </span>
                      </Link>
                    </div>
                  </section>
                )}

                {/* ── TOP NEWS IN EVIDENZA ── */}
                {topNewsWithImages && topNewsWithImages.length > 0 && (
                  <section className="mt-10">
                    <SectionHeader title="In Evidenza" accent={ACCENT} href="/ai" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      {topNewsWithImages.slice(0, 6).map((item) => {
                        const sectionKey = (item.section || 'ai') as SectionKey;
                        const href = NewsItemHref(item as NewsItem, sectionKey);
                        return (
                          <Link key={item.id} href={href}>
                            <article className="group cursor-pointer">
                              {item.imageUrl && (
                                <div className="overflow-hidden rounded-md bg-[#f5f5f5]" style={{ aspectRatio: "16/9" }}>
                                  <img src={item.imageUrl} alt={item.title} loading="lazy"
                                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                                </div>
                              )}
                              <div className="mt-1.5">
                                <span className="inline-block text-[8px] font-bold uppercase tracking-widest px-1 py-0.5 mb-1"
                                  style={{ background: SECTION_COLORS[sectionKey]?.accent ?? "#1a1a1a", color: "#fff", fontFamily: FONT_SANS, borderRadius: "2px" }}>
                                  {item.category || sectionKey.toUpperCase()}
                                </span>
                                <h4 className="text-[11px] font-bold leading-snug line-clamp-2 group-hover:text-[#e63946] transition-colors"
                                  style={{ color: "#1a1a1a", fontFamily: FONT_SERIF }}>
                                  {item.title}
                                </h4>
                              </div>
                            </article>
                          </Link>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* ── PROSSIMI EVENTI ── */}
                {upcomingEvents && upcomingEvents.length > 0 && (
                  <section className="mt-10">
                    <SectionHeader title="Prossimi Eventi" accent="#1a1a1a" href="/events" />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {upcomingEvents.map((ev) => {
                        const startDate = new Date(ev.startAt);
                        const dayNum = startDate.toLocaleDateString("it-IT", { day: "2-digit" });
                        const monthShort = startDate.toLocaleDateString("it-IT", { month: "short" }).toUpperCase();
                        return (
                          <a key={ev.id} href={ev.eventUrl || "#"} target="_blank" rel="noopener noreferrer"
                            className="flex gap-3 p-4 border border-[#e8e8e8] rounded-lg hover:border-[#1a1a1a]/40 hover:shadow-sm transition-all group"
                            style={{ background: "#fff" }}>
                            <div className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-14 rounded-md" style={{ background: "#1a1a1a" }}>
                              <span className="text-[18px] font-black leading-none text-white" style={{ fontFamily: FONT_SERIF }}>{dayNum}</span>
                              <span className="text-[9px] font-bold tracking-widest text-white/70" style={{ fontFamily: FONT_SANS }}>{monthShort}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-bold text-[#1a1a1a] leading-snug line-clamp-2 group-hover:text-[#e63946] transition-colors"
                                style={{ fontFamily: FONT_SERIF }}>
                                {ev.title}
                              </p>
                              {ev.location && (
                                <p className="text-[10px] text-[#999] mt-0.5" style={{ fontFamily: FONT_SANS }}>
                                  📍 {ev.location}
                                </p>
                              )}
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </section>
                )}
              </>
            )}

            {/* ── PROTAGONISTI DEL VENTURE ── */}
            {featuredPersonaggi && featuredPersonaggi.length > 0 && (
              <section className="mt-10">
                <div className="flex items-center justify-between mb-4 pb-2" style={{ borderBottom: "3px solid #1a1a1a" }}>
                  <span className="text-[13px] font-bold uppercase tracking-[0.15em]" style={{ color: "#1a1a1a", fontFamily: FONT_SANS }}>Protagonisti del Venture</span>
                  <Link href="/personaggi">
                    <span className="text-[11px] font-medium text-[#888] hover:text-[#e63946] transition-colors cursor-pointer" style={{ fontFamily: FONT_SANS }}>Tutti i profili →</span>
                  </Link>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                  {featuredPersonaggi.slice(0, 6).map((persona) => {
                    const catColors: Record<string, string> = { founder: "#e63946", investor: "#2563eb", executive: "#059669", researcher: "#7c3aed", journalist: "#d97706", other: "#6b7280" };
                    const catLabels: Record<string, string> = { founder: "Founder", investor: "Investor", executive: "Executive", researcher: "Ricercatore", journalist: "Giornalista", other: "Altro" };
                    const fallbacks: Record<string, string> = { founder: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80", investor: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", executive: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80", researcher: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80", journalist: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80", other: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80" };
                    const imgSrc = persona.imageUrl || fallbacks[persona.category] || fallbacks["founder"];
                    const color = catColors[persona.category] || "#1a1a1a";
                    const label = catLabels[persona.category] || persona.category;
                    return (
                      <Link key={persona.id} href={`/personaggi/${persona.slug}`}>
                        <article className="group cursor-pointer text-center">
                          <div className="relative overflow-hidden rounded-lg bg-[#f5f5f5] mb-2" style={{ aspectRatio: "3/4" }}>
                            <img src={imgSrc} alt={persona.name} loading="lazy" className="w-full h-full object-cover object-top group-hover:scale-[1.04] transition-transform duration-500" />
                            {persona.isItalian && <div className="absolute top-1.5 left-1.5 text-sm">🇮🇹</div>}
                          </div>
                          <span className="inline-block text-[9px] font-bold uppercase tracking-[0.1em] px-1.5 py-0.5 mb-1" style={{ background: color, color: "#fff", fontFamily: FONT_SANS, borderRadius: "2px" }}>{label}</span>
                          <h3 className="text-[12px] font-bold text-[#1a1a1a] group-hover:text-[#e63946] transition-colors leading-snug" style={{ fontFamily: FONT_SERIF }}>{persona.name}</h3>
                          {persona.company && <p className="text-[10px] text-[#aaa]" style={{ fontFamily: FONT_SANS }}>{persona.company}</p>}
                        </article>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── BANNER FOOTER ── */}
            <div className="mt-10 mb-2 -mx-4">
              <BannerRotator slot="horizontal" fullWidth site="it" />
            </div>

            {/* ── FOOTER ── */}
            <div className="mt-10 pt-6 border-t border-[#e8e8e8]">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[11px] text-[#999]" style={{ fontFamily: FONT_SANS }}>
                  ProofPress Magazine è parte del gruppo{" "}
                  <span className="font-semibold text-[#666]">AxiomX</span>
                </p>
                <div className="flex items-center gap-4">
                  <Link href="/privacy">
                    <span className="text-[11px] text-[#999] hover:text-[#1a1a1a] cursor-pointer transition-colors" style={{ fontFamily: FONT_SANS }}>Privacy</span>
                  </Link>
                  <Link href="/personaggi">
                    <span className="text-[11px] text-[#999] hover:text-[#1a1a1a] cursor-pointer transition-colors" style={{ fontFamily: FONT_SANS }}>Personaggi</span>
                  </Link>
                  <Link href="/research">
                    <span className="text-[11px] text-[#999] hover:text-[#1a1a1a] cursor-pointer transition-colors" style={{ fontFamily: FONT_SANS }}>Research</span>
                  </Link>
                </div>
              </div>
            </div>

          </main>
        </div>
      </>
    </LangContext.Provider>
  );
}
