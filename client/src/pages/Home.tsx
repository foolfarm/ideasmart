/*
 * IdeaSmart — Prima Pagina Giornale
 * Layout: testata → breaking → Punto del Giorno → griglia [hero+secondarie | sidebar news]
 * Ispirazione: Il Sole 24 Ore — prima pagina cartacea
 * Tipografia: SF Pro Display (titoli), SF Pro Text (corpo) — sistema Apple
 * Font size: body 15-16px, titoli secondari 20-22px, hero 32-38px
 */
import React, { useMemo, useRef, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useSiteAuth } from "@/hooks/useSiteAuth";
import SEOHead from "@/components/SEOHead";
import BreakingNewsSection from "@/components/BreakingNewsSection";
import PuntoDelGiorno from "@/components/PuntoDelGiorno";
import EditorialeDelDirettore from "@/components/EditorialeDelDirettore";
import PostEnricoGiacomelli from "@/components/PostEnricoGiacomelli";
import { Cpu, Rocket, Handshake, BookOpen, User, LogOut, Settings, ShoppingCart, Star } from "lucide-react";
import LeftSidebar from "@/components/LeftSidebar";
import MobileNav from "@/components/MobileNav";
import VerifyBadge from "@/components/VerifyBadge";
import CommentSection from "@/components/CommentSection";
import BannerRotator from "@/components/BannerRotator";
import CollaboratoriBanner from "@/components/CollaboratoriBanner";
import { Skeleton } from "@/components/ui/skeleton";
import VerifyWidget from "@/components/VerifyWidget";
import TrustScoreWidget from "@/components/TrustScoreWidget";
import ChannelsBar from "@/components/ChannelsBar";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

// ─── Amazon Deal Manchette (Home) ───────────────────────────────────────────────────
// Manchette Home: usa solo deal con immagine reale. Se non disponibile, spazio vuoto trasparente.
function HomeAmazonDeal({ offset = 0 }: { offset?: number }) {
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
  const { data: deals } = trpc.amazonDeals.getDealsWithImage.useQuery({ limit: 6 }, { staleTime: 1000 * 60 * 60 });
  const trackClick = trpc.amazonDeals.trackClick.useMutation();

  const deal = deals && deals.length > 0 ? deals[offset % deals.length] : null;

  // REGOLA: nessun carrello vuoto. Se non c'è immagine, spazio trasparente.
  if (!deal || !deal.imageUrl || !deal.imageUrl.startsWith('http')) {
    return <div className="hidden xl:block flex-shrink-0" style={{ width: '90px' }} />;
  }

  return (
    // Manchette compatta: 90px larghezza, immagine 60px altezza — proporzione da giornale
    <div className="hidden xl:flex flex-col flex-shrink-0 items-center gap-0.5" style={{ width: '90px' }}>
      <a
        href={deal.affiliateUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={() => trackClick.mutate({ id: deal.id })}
        className="w-full block rounded-lg overflow-hidden border border-[#e5e5ea] bg-white hover:border-[#ff9900] transition-colors group"
        style={{ textDecoration: 'none' }}
        title={deal.title}
      >
        <div className="w-full overflow-hidden" style={{ height: '60px', background: '#fff' }}>
          <img src={deal.imageUrl} alt={deal.title} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', padding: '3px' }} />
        </div>
        <div className="px-1.5 py-1 bg-white">
          <p style={{ fontFamily: SF, fontSize: '8px', fontWeight: 700, color: '#1d1d1f', lineHeight: 1.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {deal.title}
          </p>
          {deal.price && deal.price !== '...' && (
            <p style={{ fontFamily: SF, fontSize: '9px', fontWeight: 800, color: '#ff9900', marginTop: '1px' }}>{deal.price}</p>
          )}
          {deal.rating && (
            <div className="flex items-center gap-0.5 mt-0.5">
              <Star size={7} fill="#ff9900" color="#ff9900" />
              <span style={{ fontFamily: SF, fontSize: '7px', color: '#6e6e73' }}>{deal.rating}</span>
            </div>
          )}
        </div>
        <div className="px-1.5 py-0.5 bg-[#ff9900] group-hover:bg-[#e68900] transition-colors">
          <p style={{ fontFamily: SF, fontSize: '7px', fontWeight: 700, color: '#fff', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Vedi su Amazon</p>
        </div>
      </a>
      <span style={{ fontFamily: SF, fontSize: '8px', letterSpacing: '0.06em', color: '#aeaeb2', textTransform: 'uppercase' }}>Sponsorizzato</span>
    </div>
  );
}

// ─── Banner Amazon Verticale — colonna destra sidebar ────────────────
const ROTATION_MS = 30 * 60 * 1000; // 30 minuti

function AmazonDealVertical() {
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
  const { data: deals } = trpc.amazonDeals.getDealsWithImage.useQuery({ limit: 8 }, { staleTime: 1000 * 60 * 60 });
  const trackClick = trpc.amazonDeals.trackClick.useMutation();

  // Offset iniziale: parte da 2 (diverso dalle manchette header che usano 0 e 1)
  const [offset, setOffset] = useState(2);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (!deals || deals.length === 0) return;
    const interval = setInterval(() => {
      // Fade out
      setFade(false);
      setTimeout(() => {
        setOffset(prev => {
          // Cicla tra gli indici disponibili, saltando 0 e 1 (usati dalle manchette)
          const available = deals.length;
          const next = prev + 1 >= available ? 2 : prev + 1;
          return next;
        });
        setFade(true);
      }, 400);
    }, ROTATION_MS);
    return () => clearInterval(interval);
  }, [deals]);

  const deal = deals && deals.length > offset ? deals[offset] : deals && deals.length > 0 ? deals[0] : null;

  if (!deal || !deal.imageUrl || !deal.imageUrl.startsWith('http')) return null;

  return (
    <div className="mb-5" style={{ transition: 'opacity 0.4s ease', opacity: fade ? 1 : 0 }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(26,26,26,0.45)', fontFamily: SF }}>
        Offerta Amazon
      </p>
      <a
        href={deal.affiliateUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={() => trackClick.mutate({ id: deal.id })}
        className="block rounded-2xl overflow-hidden border border-[#e5e5ea] bg-white hover:border-[#ff9900] hover:shadow-md transition-all group"
        style={{ textDecoration: 'none' }}
      >
        <div className="w-full flex items-center justify-center" style={{ height: '160px', background: '#fafafa' }}>
          <img
            src={deal.imageUrl}
            alt={deal.title}
            style={{ maxWidth: '80%', maxHeight: '140px', objectFit: 'contain', display: 'block' }}
          />
        </div>
        <div className="p-3">
          <p style={{ fontFamily: SF, fontSize: '12px', fontWeight: 700, color: '#1d1d1f', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '6px' }}>
            {deal.title}
          </p>
          {deal.price && deal.price !== '...' && (
            <p style={{ fontFamily: SF, fontSize: '16px', fontWeight: 800, color: '#ff9900', marginBottom: '4px' }}>
              {deal.price}
            </p>
          )}
          {deal.rating && (
            <div className="flex items-center gap-1 mb-3">
              <Star size={11} fill="#ff9900" color="#ff9900" />
              <span style={{ fontFamily: SF, fontSize: '11px', color: '#6e6e73' }}>{deal.rating} su 5</span>
            </div>
          )}
          <div className="w-full py-2 rounded-lg bg-[#ff9900] group-hover:bg-[#e68900] transition-colors text-center">
            <span style={{ fontFamily: SF, fontSize: '11px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vedi su Amazon →</span>
          </div>
        </div>
      </a>
      <p className="text-center mt-1" style={{ fontFamily: SF, fontSize: '9px', letterSpacing: '0.06em', color: '#aeaeb2', textTransform: 'uppercase' }}>Sponsorizzato</p>
    </div>
  );
}

// ─── Strip Amazon Deals orizzontale (max 4 deal con immagine) ────────────────
function AmazonDealsStrip() {
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
  const { data: deals } = trpc.amazonDeals.getDealsWithImage.useQuery({ limit: 4 }, { staleTime: 1000 * 60 * 30 });
  const trackClick = trpc.amazonDeals.trackClick.useMutation();

  if (!deals || deals.length === 0) return null;

  return (
    <div className="w-full border-t border-b border-[#e5e5ea] bg-[#fafafa] py-3">
      <div className="max-w-7xl mx-auto px-4">
      <div className="flex items-center gap-2 mb-2">
        <span style={{ fontFamily: SF, fontSize: '9px', fontWeight: 700, color: '#ff9900', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Offerte Amazon del Giorno</span>
        <div className="flex-1 h-px bg-[#e5e5ea]" />
        <span style={{ fontFamily: SF, fontSize: '8px', color: '#aeaeb2', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sponsorizzato</span>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide">
        {deals.map((deal) => (
          <a
            key={deal.id}
            href={deal.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() => trackClick.mutate({ id: deal.id })}
            className="flex-shrink-0 flex items-center gap-2 bg-white rounded-lg border border-[#e5e5ea] hover:border-[#ff9900] transition-colors px-2 py-1.5 group"
            style={{ textDecoration: 'none', minWidth: '180px', maxWidth: '220px' }}
          >
            <div className="flex-shrink-0" style={{ width: '40px', height: '40px', background: '#fff' }}>
              <img src={deal.imageUrl!} alt={deal.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontFamily: SF, fontSize: '9px', fontWeight: 600, color: '#1d1d1f', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {deal.title}
              </p>
              {deal.price && deal.price !== '...' && (
                <p style={{ fontFamily: SF, fontSize: '10px', fontWeight: 800, color: '#ff9900' }}>{deal.price}</p>
              )}
            </div>
            <div className="flex-shrink-0 bg-[#ff9900] group-hover:bg-[#e68900] rounded px-1.5 py-0.5 transition-colors">
              <span style={{ fontFamily: SF, fontSize: '7px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Vedi</span>
            </div>
          </a>
        ))}
      </div>
      </div>
    </div>
  );
}

// ─── Griglia Amazon Deals (banner mid-page, 2-4 deal con immagine) ────────────
function AmazonDealsGrid({ startOffset = 0, maxDeals = 4 }: { startOffset?: number; maxDeals?: number }) {
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
  const { data: allDeals } = trpc.amazonDeals.getDealsWithImage.useQuery({ limit: 8 }, { staleTime: 1000 * 60 * 30 });
  const trackClick = trpc.amazonDeals.trackClick.useMutation();

  if (!allDeals || allDeals.length === 0) return null;

  // Prendi deal a partire dall'offset per mostrare prodotti diversi in aree diverse
  const deals = allDeals.slice(startOffset % allDeals.length).concat(allDeals.slice(0, startOffset % allDeals.length)).slice(0, maxDeals);

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <span style={{ fontFamily: SF, fontSize: '9px', fontWeight: 700, color: '#ff9900', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Selezione Amazon</span>
        <div className="flex-1 h-px bg-[#e5e5ea]" />
        <span style={{ fontFamily: SF, fontSize: '8px', color: '#aeaeb2', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sponsorizzato</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {deals.map((deal) => (
          <a
            key={deal.id}
            href={deal.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() => trackClick.mutate({ id: deal.id })}
            className="block rounded-xl overflow-hidden border border-[#e5e5ea] bg-white hover:border-[#ff9900] transition-colors group"
            style={{ textDecoration: 'none' }}
          >
            <div style={{ height: '80px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
              <img src={deal.imageUrl!} alt={deal.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
            <div className="px-2 py-1 bg-white">
              <p style={{ fontFamily: SF, fontSize: '8px', fontWeight: 600, color: '#1d1d1f', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {deal.title}
              </p>
              {deal.price && deal.price !== '...' && (
                <p style={{ fontFamily: SF, fontSize: '9px', fontWeight: 800, color: '#ff9900' }}>{deal.price}</p>
              )}
            </div>
            <div className="px-2 py-1 bg-[#ff9900] group-hover:bg-[#e68900] transition-colors">
              <p style={{ fontFamily: SF, fontSize: '7px', fontWeight: 700, color: '#fff', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vedi su Amazon</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── Costanti colori sezione ─────────────────────────────────────────────────────
// ─── Carosello Prompt Collection 2026 ─────────────────────────────────────────
const PROMPT_BANNERS = [
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ideasmart-banner-collection-2026-square_a775263d.png",
    alt: "Prompt Collection 2026 — 99 prompt premium per ChatGPT, Claude, Perplexity",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ideasmart-banner-verticale-commercialisti-square_bc6e5af2.png",
    alt: "Prompt Book per Commercialisti — Verticale Professionale",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ideasmart-banner-verticale-avvocati-square_136c47a1.png",
    alt: "Prompt Book per Avvocati — Verticale Professionale",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ideasmart-banner-verticale-studenti-square_6d00b84f.png",
    alt: "Prompt Book per Studenti — Verticale Professionale",
  },
];

function PromptCollectionCarousel() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % PROMPT_BANNERS.length);
        setVisible(true);
      }, 400);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const banner = PROMPT_BANNERS[current];

  return (
    <a
      href="https://promptcollection2026.com"
      target="_blank"
      rel="noopener noreferrer"
      className="block mb-5 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1"
      style={{ textDecoration: "none" }}
    >
      <img
        src={banner.src}
        alt={banner.alt}
        className="w-full rounded-2xl"
        style={{
          display: "block",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      />
    </a>
  );
}

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
};

// ─── Language helpers ────────────────────────────────────────────────────────
const LangContext = React.createContext<"it" | "en">("it");
function useLang() { return React.useContext(LangContext); }
/** Restituisce il titolo nella lingua corrente (fallback IT se EN non disponibile) */
function itemTitle(item: NewsItem, lang: "it" | "en"): string {
  if (lang === "en" && item.titleEn) return item.titleEn;
  return item.title;
}
/** Restituisce il sommario nella lingua corrente (fallback IT se EN non disponibile) */
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
  // REGOLA: tutti i link puntano alle pagine interne /sezione/news/:id
  // MAI alle fonti esterne dalla home (il paywall blocca i non registrati)
  const sec = sectionOverride || item.section || "ai";
  return `/${sec}/news/${item.id}`;
}
function Divider({ thick = false }: { thick?: boolean }) {
  return <div className={`w-full ${thick ? "border-t-2" : "border-t"} border-[#1a1a1a]`} />;
}
function ThinDivider() {
  return <div className="w-full border-t border-[#1a1a1a]/12" />;
}

// ─── Badge sezione ────────────────────────────────────────────────────────────
function SectionBadge({ section }: { section: SectionKey }) {
  const s = SECTION_COLORS[section];
  return (
    <span
      className="inline-block text-[10px] font-bold uppercase tracking-[0.12em] px-2 py-1 mr-1"
      style={{ background: s.accent, color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", borderRadius: "4px" }}
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
  const href = editorial?.id ? `/${section}/editoriale/${editorial.id}` : NewsItemHref(item, section);
  const isExternal = false; // tutti i link sono interni — il paywall blocca i non registrati
  const lang = useLang();
  const title = editorial?.title || itemTitle(item, lang);
  const body = editorial?.body || itemSummary(item, lang);
  const img = item.imageUrl;

  const TitleEl = (
    <h3
      className="mt-2 leading-tight text-[#1a1a1a] hover:underline"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif", fontSize: "clamp(32px, 4.5vw, 50px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.025em" }}
    >
      {title}
    </h3>
  );

  return (
    <article className="pb-4">
      {img && (
          <Link href={href}>
            <img
              src={img} alt={title} loading="eager" decoding="async"
              className="w-full object-cover hover:opacity-95 transition-opacity cursor-pointer"
              style={{ height: "clamp(200px, 50vw, 420px)", borderRadius: "10px", border: "1px solid rgba(26,26,46,0.07)", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}
            />
          </Link>
      )}
      <div className="mt-5">
        <SectionBadge section={section} />
        <Link href={href}>{TitleEl}</Link>
        {editorial?.subtitle && (
          <p className="mt-2 text-lg italic text-[#1a1a1a]/60"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif", lineHeight: 1.5 }}>
            {editorial.subtitle}
          </p>
        )}
        <p className="mt-4 text-[18px] leading-relaxed text-[#1a1a1a]/70"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif", lineHeight: 1.75 }}>
          {body.slice(0, 320)}{body.length > 320 ? "…" : ""}
        </p>
        <p className="mt-2 text-[11px] text-[#1a1a1a]/40 uppercase tracking-widest"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
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
            {item.ipfsCid && item.ipfsUrl && (
              <a
                href={item.ipfsUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={`Certificato IPFS · CID: ${item.ipfsCid}`}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border transition-colors"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif", color: '#00897b', borderColor: '#00897b33', background: '#00897b0d' }}
                onClick={e => e.stopPropagation()}
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                IPFS
              </a>
            )}
          </div>
        )}
        {(section === "ai" || section === "startup") && (
          <CommentSection
            section={section as "ai" | "startup"}
            articleType="news"
            articleId={item.id}
          />
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
  const lang = useLang();
  const href = NewsItemHref(item, section);
  return (
    <article className="py-4">
      {showImage && item.imageUrl && (
        <Link href={href}>
          <img src={item.imageUrl} alt={itemTitle(item, lang)} loading="lazy"
            className="w-full object-cover mb-3 cursor-pointer"
            style={{ height: "200px", borderRadius: "8px", border: "1px solid rgba(26,26,46,0.07)" }} />
        </Link>
      )}
      <SectionBadge section={section} />
      <Link href={href}>
        <h3
          className="mt-2 text-[#1a1a1a] hover:underline leading-snug"
          style={{
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
            fontSize: "clamp(18px, 2vw, 22px)",
            fontWeight: 700,
            lineHeight: 1.3
          }}
        >
          {itemTitle(item, lang)}
        </h3>
      </Link>
      <p className="mt-2 text-[16px] leading-relaxed text-[#1a1a1a]/65 line-clamp-3"
        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif", lineHeight: 1.65 }}>
        {itemSummary(item, lang)}
      </p>
      <p className="mt-1.5 text-[11px] text-[#1a1a1a]/35 uppercase tracking-widest"
        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
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
          {item.ipfsCid && item.ipfsUrl && (
            <a
              href={item.ipfsUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={`Certificato IPFS · CID: ${item.ipfsCid}`}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border transition-colors"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif", color: '#00897b', borderColor: '#00897b33', background: '#00897b0d' }}
              onClick={e => e.stopPropagation()}
            >
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              IPFS
            </a>
          )}
        </div>
      )}
      {(section === "ai" || section === "startup") && (
        <CommentSection
          section={section as "ai" | "startup"}
          articleType="news"
          articleId={item.id}
        />
      )}
    </article>
  );
}

// ─── SIDEBAR NEWS ITEM — titolo 15px + fonte ─────────────────────────────────
function SidebarNewsItem({ item, section }: { item: NewsItem; section: SectionKey }) {
  const s = SECTION_COLORS[section];
  // font aumentati per leggibilità
  const lang = useLang();
  const href = NewsItemHref(item, section);
  return (
    <div className="py-3">
      <div className="flex items-center gap-1.5 mb-1">
        <span
          className="text-[9px] font-bold uppercase tracking-[0.12em] px-1.5 py-0.5"
          style={{ background: s.accent, color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", borderRadius: "3px" }}
        >
          {s.label}
        </span>
        {item.publishedAt && (
          <span className="text-[10px] text-[#1a1a1a]/35" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
            {formatShortDate(item.publishedAt)}
          </span>
        )}
      </div>
      <Link href={href}>
        <p
          className="text-[#1a1a1a] hover:underline leading-snug"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif", fontSize: "18px", fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.01em" }}
        >
          {itemTitle(item, lang)}
        </p>
      </Link>
      {item.summary && (
        <p className="mt-1 text-[15px] text-[#1a1a1a]/55 line-clamp-2"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif", lineHeight: 1.5 }}>
          {itemSummary(item, lang)}
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
          className="flex items-center gap-2 px-3 py-2.5 text-[11px] font-medium text-[#6e6e73] hover:bg-[#f5f5f7] transition-colors w-full text-left"
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
      <div className="h-[3px] w-8" style={{ background: accent }} />
      <h2 className="text-[12px] font-bold uppercase tracking-[0.18em] m-0 p-0"
        style={{ color: accent, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", fontSize: "12px", lineHeight: 1 }}>
        {label}
      </h2>
    </div>
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
  // Timeout di sicurezza: dopo 8 secondi forza il rendering anche se homeLoading è ancora true
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoadingTimeout(true), 8000);
    return () => clearTimeout(t);
  }, []);
  const homeLoading = homeLoadingRaw && !loadingTimeout;
  const { data: aiEditorial } = trpc.editorial.getLatest.useQuery({ section: "ai" }, queryOpts);
  const { data: startupEditorial } = trpc.editorial.getLatest.useQuery({ section: "startup" }, queryOpts);
  const { data: researchReports } = trpc.news.getResearchReports.useQuery({ limit: 6 }, queryOpts);
  const { data: researchOfDay } = trpc.news.getResearchOfDay.useQuery(undefined, criticalQueryOpts);
  const { data: upcomingEvents } = trpc.events.getUpcoming.useQuery({ limit: 6, category: "all" }, queryOpts);
  const { data: authorPosts } = trpc.news.getAuthorPosts.useQuery({ limit: 5 }, queryOpts);
  const { data: ipfsCountData } = trpc.news.getIPFSCount.useQuery(undefined, { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false });
  const ipfsCount = ipfsCountData?.count ?? 0;
  const { data: gradeAArticles } = trpc.news.getGradeA.useQuery({ limit: 6 }, queryOpts);
  const { data: topNewsWithImages } = trpc.news.getTopWithImages.useQuery({ limit: 5 }, queryOpts);

  const aiNews      = homeData?.ai      ?? [];
  const startupNews = homeData?.startup ?? [];

  const dealroomNews = homeData?.dealroom ?? [];

  // Hero principale: usa researchOfDay (ricerca del giorno) — mai uguale al Punto del Giorno di Andrea Cinelli
  // Fallback: primo dealroom con immagine, poi primo AI con immagine
  const mainHero = useMemo(() => {
    if (researchOfDay) return { type: "research" as const, data: researchOfDay };
    const dealHero = dealroomNews.find(n => n.imageUrl);
    if (dealHero) return { type: "dealroom" as const, data: dealHero };
    return null;
  }, [researchOfDay, dealroomNews]);

  // Hero: primo articolo AI con immagine (rimane nella griglia secondaria)
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
    <LangContext.Provider value={lang}>
    <>
      <SEOHead
        title="Proof Press — AI, Startup e Venture Capital"
        description="AI, Startup e Venture Capital verificati da 4.000+ fonti ogni giorno. Insight esclusivi per decision maker, founder e investitori. ProofPress Verify."
        canonical="https://proofpress.ai"
        ogSiteName="Proof Press"
      />

      <style>{`
        /* SF Pro system font — no external loading needed */
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .newspaper-col-rule { border-right: 1px solid rgba(26,26,46,0.15); }
      `}</style>

      <div className="flex min-h-screen" style={{ background: "#ffffff", color: "#1d1d1f" }}>
        {/* ══ SIDEBAR SINISTRA FISSA ══════════════════════════════════════════ */}
        <LeftSidebar />

        {/* ══ CONTENUTO PRINCIPALE ═══════════════════════════════════════════ */}
        <div className="flex-1 min-w-0 overflow-x-hidden">

        {/* ══ TESTATA ══════════════════════════════════════════════════════════ */}
        <header className="max-w-[1280px] mx-auto px-4 pt-2 pb-0 sm:pt-5">
          {/* Riga data + categorie + auth */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {/* Hamburger mobile — visibile solo su < lg */}
              <MobileNav />
              <span className="text-[11px] text-[#1a1a1a]/50 uppercase tracking-widest"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                {formatDateIT(today)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* Selettore lingua IT/EN — visibile su desktop */}
              <div className="hidden sm:flex">
                <LanguageSwitcher variant="navbar" />
              </div>
              <a href="https://www.linkedin.com/company/proofpress/" target="_blank" rel="noopener noreferrer"
                className="hidden sm:inline flex items-center gap-1 text-[11px] text-[#1a1a1a]/50 hover:text-[#0077b5] transition-colors uppercase tracking-widest"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                ProofPress
              </a>
              <HomeAuthButtons />
            </div>
          </div>
          <Divider thick />

          {/* Header centrato */}
          <div className="py-1 sm:py-4">





            {/* Brand centrale con manchette Tradedoubler ai lati — grid 3 colonne su xl */}
            <div className="hidden xl:grid xl:grid-cols-[170px_1fr_170px] items-center gap-4">
              {/* Manchette sinistra */}
              <div className="flex justify-center items-center">
                <BannerRotator slot="left" width={160} height={160} />
              </div>
              {/* Titolo centrale */}
              <div className="text-center">
                <Link href="/">
                  <div className="cursor-pointer hover:opacity-80 transition-opacity">
                    <div style={{ display: "inline-flex", alignItems: "flex-start", justifyContent: "center", position: "relative" }}>
                      <h1 className="font-black tracking-tight text-[#1a1a1a] inline"
                        style={{
                          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
                          fontSize: "clamp(28px, 7vw, 88px)",
                          letterSpacing: "-0.02em",
                          lineHeight: 1
                        }}>
                        ProofPress
                      </h1>
                      <span className="font-bold tracking-widest text-[#1a1a1a]/50"
                        style={{
                          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
                          fontSize: "clamp(8px, 1vw, 14px)",
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          lineHeight: 1,
                          marginTop: "0.3em",
                          marginLeft: "0.4em"
                        }}>
                        Magazine
                      </span>
                    </div>
                  </div>
                </Link>
                {/* Sottotitolo */}
                <div className="hidden sm:block mt-2 text-[#1a1a1a]/60 font-semibold"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", lineHeight: 1.5 }}>
                  <div className="uppercase tracking-[0.15em] md:tracking-[0.2em]" style={{ fontSize: "clamp(9px, 1.1vw, 13px)" }}>
                    Il primo magazine con redazione agentica e informazioni 100% certificate
                  </div>
                  <div className="uppercase tracking-[0.08em] font-bold" style={{ fontSize: "clamp(7px, 0.82vw, 10px)", marginTop: "3px", color: "#00b894" }}>
                    Tecnologia · Investimenti · Startup · Venture Capital
                  </div>
                </div>
              </div>
              {/* Manchette destra */}
              <div className="flex justify-center items-center">
                <BannerRotator slot="right" width={160} height={160} />
              </div>
            </div>
            {/* Fallback mobile/tablet — solo titolo centrato senza manchette */}
            <div className="xl:hidden text-center">
              <Link href="/">
                <div className="cursor-pointer hover:opacity-80 transition-opacity">
                  <div style={{ display: "inline-flex", alignItems: "flex-start", justifyContent: "center", position: "relative" }}>
                    <h1 className="font-black tracking-tight text-[#1a1a1a] inline"
                      style={{
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
                        fontSize: "clamp(28px, 7vw, 88px)",
                        letterSpacing: "-0.02em",
                        lineHeight: 1
                      }}>
                      ProofPress
                    </h1>
                    <span className="font-bold tracking-widest text-[#1a1a1a]/50"
                      style={{
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
                        fontSize: "clamp(8px, 1vw, 14px)",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        lineHeight: 1,
                        marginTop: "0.3em",
                        marginLeft: "0.4em"
                      }}>
                      Magazine
                    </span>
                  </div>
                </div>
              </Link>
              <div className="hidden sm:block mt-2 text-[#1a1a1a]/60 font-semibold"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", lineHeight: 1.5 }}>
                <div className="uppercase tracking-[0.15em] md:tracking-[0.2em]" style={{ fontSize: "clamp(9px, 1.1vw, 13px)" }}>
                  Il primo magazine con redazione agentica e informazioni 100% certificate
                </div>
                <div className="uppercase tracking-[0.08em] font-bold" style={{ fontSize: "clamp(7px, 0.82vw, 10px)", marginTop: "3px", color: "#00b894" }}>
                  Tecnologia · Investimenti · Startup · Venture Capital
                </div>
              </div>
            </div>
          </div>
        </header>
            {/* ══ BREAKING NEWS — nascosto su mobile ═══════════════════════════════════════════════════════════════════ */}
        <div className="hidden sm:block">
          <BreakingNewsSection />
        </div>
        {/* ══ TICKER LIVE — sotto Breaking News ═══════════════════════════════════════════════════════════════════════ */}
        <div className="hidden sm:block">
        </div>
                {/* ══ IN EVIDENZA — Top news con immagine, tutte le sezioni ═══════════════════════════════ */}
        {topNewsWithImages && topNewsWithImages.length > 0 && (
          <div className="max-w-[1280px] mx-auto px-4 py-3 hidden sm:block">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-[2px] w-4" style={{ background: "#1a1a1a" }} />
              <span className="text-[9px] font-bold uppercase tracking-[0.22em]"
                style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                In Evidenza
              </span>
              <div className="h-[2px] flex-1" style={{ background: "#1a1a1a", opacity: 0.15 }} />
            </div>
            <div className="grid grid-cols-5 gap-3">
              {topNewsWithImages.slice(0, 5).map((item) => {
                const sectionKey = (item.section || 'ai') as SectionKey;
                const href = NewsItemHref(item as NewsItem, sectionKey);
                return (
                  <Link key={item.id} href={href}>
                    <article className="group cursor-pointer">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full object-cover rounded-md group-hover:opacity-90 transition-opacity"
                          style={{ height: "90px", border: "1px solid rgba(26,26,46,0.07)" }}
                        />
                      )}
                      <div className="mt-1.5">
                        <span
                          className="inline-block text-[8px] font-bold uppercase tracking-widest px-1 py-0.5 mb-1"
                          style={{ background: SECTION_COLORS[sectionKey]?.accent ?? "#1a1a1a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
                        >
                          {item.category || sectionKey.toUpperCase()}
                        </span>
                        <h4
                          className="text-[11px] font-bold leading-snug line-clamp-2 group-hover:underline"
                          style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
                        >
                          {item.title}
                        </h4>
                        <p className="text-[9px] mt-0.5" style={{ color: "#1a1a1a", opacity: 0.4, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                          {item.sourceName}
                        </p>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
        {/* ══ BARRA CANALI ORIZZONTALE ════════════════════════════════════════════════════════════ */}
        {/* <ChannelsBar /> — temporaneamente nascosta */}
        {/* ══ CORPO ═════════════════════════════════════════════════════════════════════════════════ */}
        <main className="max-w-[1280px] mx-auto px-4 pb-16 lg:pb-16" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 68px)' }}>
          {/* ══════════════════════════════════════════════════════════════
              PRIMA PAGINA — Layout giornale
              [Colonna principale 70%] | [Sidebar notizie 30%]
          ══════════════════════════════════════════════════════════════ */}
          {homeLoading && (
            <section className="mt-4">
              <Divider thick />
              <div className="py-2 flex items-center justify-between">
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-3 w-36" />
              </div>
              <Divider />
              {/* Skeleton layout: colonna principale + sidebar */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-0 mt-4">
                {/* Colonna principale */}
                <div className="lg:pr-6 space-y-6">
                  {/* Hero skeleton */}
                  <Skeleton className="w-full h-[320px] rounded-none" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-4/5" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  {/* Grid notizie skeleton */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="w-full h-[140px] rounded-none" />
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-4/5" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Sidebar skeleton */}
                <div className="hidden lg:block pl-6 space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="w-16 h-16 flex-shrink-0 rounded-none" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
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

                  {/* HERO PRINCIPALE — Research of Day (mai uguale al Punto del Giorno di Andrea Cinelli) */}
                  {mainHero && (
                    <div className="pb-5">
                      {mainHero.type === "research" ? (
                        <article className="pb-4">
                          {mainHero.data.imageUrl && (
                            <Link href={`/research/${mainHero.data.id}`}>
                              <img
                                src={mainHero.data.imageUrl}
                                alt={mainHero.data.title}
                                loading="eager"
                                decoding="async"
                                className="w-full object-cover hover:opacity-95 transition-opacity cursor-pointer"
                                style={{ height: "clamp(200px, 50vw, 420px)", borderRadius: "10px", border: "1px solid rgba(26,26,46,0.07)", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}
                              />
                            </Link>
                          )}
                          <div className="mt-3">
                            <span
                              className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] px-1.5 py-0.5 mr-1"
                              style={{ background: "#1a1a1a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                            >
                              RESEARCH
                            </span>
                            <Link href={`/research/${mainHero.data.id}`}>
                              <h3
                                className="mt-2 leading-tight text-[#1a1a1a] hover:underline"
                                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif", fontSize: "clamp(22px, 4vw, 42px)", fontWeight: 800, lineHeight: 1.15 }}
                              >
                                {mainHero.data.title}
                              </h3>
                            </Link>
                            <p className="mt-3 text-[15px] sm:text-[17px] leading-relaxed text-[#1a1a1a]/75"
                              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif", lineHeight: 1.7 }}>
                              {mainHero.data.summary.slice(0, 320)}{mainHero.data.summary.length > 320 ? "\u2026" : ""}
                            </p>
                            <p className="mt-2 text-[11px] text-[#1a1a1a]/40 uppercase tracking-widest"
                              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                              {mainHero.data.source}
                            </p>
                          </div>
                        </article>
                      ) : (
                        <HeroArticle item={mainHero.data as NewsItem} section="dealroom" />
                      )}
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
                    <div className="mt-12">
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
                              <article className="cursor-pointer group border border-[#e5e5ea] p-3 rounded-xl hover:border-[#1d1d1f]/20 transition-colors">
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
                      {/* ── Banner Orizzontale 728x90 — subito dopo la griglia Research ── */}
                      <div className="w-full mt-6" style={{ borderTop: "1px solid #e8e8ed", borderBottom: "1px solid #e8e8ed", padding: "16px 0" }}>
                        <BannerRotator slot="horizontal" height={100} fullWidth />
                      </div>

                      <div className="mt-4 text-center">
                        <Link href="/research">
                          <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-6 py-2 border border-[#1d1d1f] text-[#1d1d1f] hover:bg-[#1d1d1f] hover:text-white transition-colors cursor-pointer"
                            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                            Vedi tutte le 20 ricerche di oggi →
                          </span>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* ── SEZIONE DEALROOM — Round, Funding, VC, M&A ── */}
                  {dealroomNews.length > 0 && (
                    <div className="mt-12">
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
                    <div className="mt-12">
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
                    <div className="mt-12">
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
                    <div className="mt-12">
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

                  {/* ── ProofPress Verify Widget ── (temporaneamente nascosto) */}
                  {false && <VerifyWidget />}

                  {/* ── Slot 3: Banner rotante sidebar destra 300x250 ── */}
                  <div className="mb-5 flex flex-col items-center">
                    <BannerRotator slot="sidebar" width={300} height={250} />
                  </div>


                  {/* ── Articolo quadrato: ProofPress su Il Sole 24 Ore ── */}
                  <div className="mb-5">
                    <a
                      href="https://www.ilsole24ore.com/art/agenti-e-hash-crittografici-nasce-redazione-agentica-che-seleziona-notizie-AI9fgyXC"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block"
                      style={{ textDecoration: "none" }}
                    >
                      <div
                        style={{
                          background: "#fdf6ee",
                          border: "1px solid #e8e0d0",
                          borderRadius: 10,
                          overflow: "hidden",
                          transition: "box-shadow 0.2s",
                        }}
                        className="hover:shadow-md"
                      >
                        {/* Header badge */}
                        <div
                          style={{
                            background: "#c8001a",
                            padding: "8px 14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
                              fontSize: 9,
                              fontWeight: 900,
                              letterSpacing: "0.12em",
                              color: "#fff",
                              textTransform: "uppercase",
                              lineHeight: 1.3,
                            }}
                          >
                            IL SOLE 24 ORE
                          </span>
                          <span
                            style={{
                              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                              fontSize: 9,
                              fontWeight: 600,
                              color: "rgba(255,255,255,0.75)",
                              letterSpacing: "0.08em",
                            }}
                          >
                            27 apr 2026
                          </span>
                        </div>
                        {/* Corpo articolo */}
                        <div style={{ padding: "14px 14px 16px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              background: "#c8001a",
                              color: "#fff",
                              fontSize: 8,
                              fontWeight: 700,
                              letterSpacing: "0.18em",
                              textTransform: "uppercase",
                              padding: "2px 7px",
                              borderRadius: 3,
                              marginBottom: 8,
                              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                            }}
                          >
                            Oggi su Il Sole 24 Ore
                          </span>
                          <p
                            style={{
                              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
                              fontSize: 14,
                              fontWeight: 700,
                              color: "#1a1a1a",
                              lineHeight: 1.4,
                              margin: "0 0 8px",
                            }}
                            className="group-hover:underline"
                          >
                            Agenti AI e hash crittografici: nasce la redazione &ldquo;agentica&rdquo; che seleziona le notizie
                          </p>
                          <p
                            style={{
                              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                              fontSize: 12,
                              color: "#666",
                              lineHeight: 1.5,
                              margin: 0,
                            }}
                          >
                            ProofPress si presenta al mercato italiano come il primo modello di giornalismo agentico in grado di replicare e automatizzare l&rsquo;intero flusso di lavoro di una redazione grazie all&rsquo;AI.
                          </p>
                          <div
                            style={{
                              marginTop: 12,
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              color: "#c8001a",
                              fontSize: 11,
                              fontWeight: 700,
                              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                            }}
                          >
                            Leggi l&rsquo;articolo
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                          </div>
                        </div>
                      </div>
                    </a>
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
                    <div className="border-t-2 border-[#1d1d1f]" />

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
                      <div className="border-t-2" style={{ borderColor: "#1d1d1f" }} />
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

                  {/* ── Trust Score Widget ── */}
                  <TrustScoreWidget />

                  {/* Post di Andrea Cinelli */}
                  {authorPosts && authorPosts.length > 0 && (
                    <div className="mt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-[3px] flex-1" style={{ background: "#1a1a1a" }} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]"
                          style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                          Post di Andrea Cinelli
                        </span>
                        <div className="h-[3px] flex-1" style={{ background: "#1a1a1a" }} />
                      </div>
                      <div className="border-t-2 mb-3" style={{ borderColor: "#1d1d1f" }} />
                      <div className="space-y-4">
                        {authorPosts.map((post) => {
                          const firstLine = (post.title || post.postText.split('\n')[0]).replace(/[*_#]/g, '').trim();
                          const preview = post.postText.replace(/[*_#]/g, '').replace(/\n+/g, ' ').trim();
                          const postDate = new Date(post.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
                          return (
                            <article key={post.id} className="pb-3 border-b border-[#1a1a1a]/10 last:border-0">
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                                  style={{ background: "#0077b5" }}>
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                  </svg>
                                </div>
                                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#0077b5" }}>Andrea Cinelli</span>
                                <span className="text-[9px] text-[#1a1a1a]/35 ml-auto">{postDate}</span>
                              </div>
                              <h4 className="text-[13px] font-bold leading-snug text-[#1a1a1a] mb-1"
                                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
                                {firstLine.length > 90 ? firstLine.slice(0, 90) + '\u2026' : firstLine}
                              </h4>
                              <p className="text-[11px] text-[#1a1a1a]/55 line-clamp-2"
                                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif", lineHeight: 1.5 }}>
                                {preview.length > 140 ? preview.slice(0, 140) + '\u2026' : preview}
                              </p>
                              {post.linkedinUrl ? (
                                <a href={post.linkedinUrl} target="_blank" rel="noopener noreferrer"
                                  className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider"
                                  style={{ color: "#0077b5" }}>
                                  Leggi su LinkedIn \u2192
                                </a>
                              ) : (
                                <a href="/andrea-cinelli"
                                  className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider"
                                  style={{ color: "#0077b5" }}>
                                  Leggi \u2192
                                </a>
                              )}
                            </article>
                          );
                        })}
                      </div>
                      <a href="/andrea-cinelli"
                        className="block mt-3 text-[10px] font-bold uppercase tracking-widest text-center"
                        style={{ color: "#1a1a1a", opacity: 0.45 }}>
                        Tutti i post →
                      </a>
                    </div>
                  )}

                  {/* ── POST ENRICO GIACOMELLI ── */}
                  <PostEnricoGiacomelli />

                  {/* ── DEEP DIVE — sotto i post LinkedIn di Andrea ── */}
                  <div className="mt-8">
                    <EditorialeDelDirettore />
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
          )}          <div className="mt-12 mb-8">
          </div>

          {/* ── SEZIONE GRADE A — Articoli con massima certificazione Trust Score ── */}
          {gradeAArticles && gradeAArticles.length > 0 && (
            <section className="mt-10">
              <Divider />
              <div className="mt-8">
                {/* Header sezione */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex items-center justify-center font-black text-white rounded"
                      style={{ background: "#00b894", fontSize: "11px", width: "18px", height: "18px", flexShrink: 0 }}
                    >
                      A
                    </span>
                    <h2
                      style={{
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "#1a1a1a",
                        margin: 0,
                      }}
                    >
                      Certificazione Massima
                    </h2>
                  </div>
                  <Link
                    href="/trust-score"
                    className="text-[10px] font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
                    style={{ color: "#00b894" }}
                  >
                    Cos’è il Trust Score →
                  </Link>
                </div>
                <p
                  className="text-[11px] uppercase tracking-widest mb-6"
                  style={{
                    color: "#1a1a1a",
                    opacity: 0.45,
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
                  }}
                >
                  {gradeAArticles.some((a) => a.trustGrade === "A")
                    ? "Articoli con SHA-256 · IPFS · Fonte verificata · Contenuto certificato"
                    : "Articoli con il più alto Trust Score · SHA-256 · IPFS · Fonte verificata"}
                </p>
                {/* Grid articoli */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gradeAArticles.map((item) => (
                    <Link key={item.id} href={`/news/${item.id}`}>
                      <article
                        className="p-4 border border-[#1a1a1a]/10 rounded-lg hover:border-[#00b894]/40 hover:shadow-sm transition-all group cursor-pointer"
                        style={{ background: "#fff" }}
                      >
                        {/* Grade badge + categoria */}
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                            style={{ background: "#f0f9f6", color: "#00b894" }}
                          >
                            {item.category || item.section?.toUpperCase()}
                          </span>
                          <VerifyBadge
                            hash={item.verifyHash}
                            size="sm"
                            trustGrade={item.trustGrade}
                            trustScore={item.trustScore}
                          />
                        </div>
                        {/* Titolo */}
                        <h3
                          className="font-bold leading-snug mb-2 group-hover:text-[#00b894] transition-colors line-clamp-2"
                          style={{
                            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
                            fontSize: "0.9rem",
                            color: "#1a1a1a",
                          }}
                        >
                          {item.title}
                        </h3>
                        {/* Summary */}
                        <p
                          className="text-[12px] leading-relaxed line-clamp-2 mb-3"
                          style={{ color: "#1a1a1a", opacity: 0.6 }}
                        >
                          {item.summary}
                        </p>
                        {/* Footer: fonte + data */}
                        <div className="flex items-center justify-between">
                          <span
                            className="text-[10px] font-semibold"
                            style={{ color: "#1a1a1a", opacity: 0.45 }}
                          >
                            {item.sourceName}
                          </span>
                          <span
                            className="text-[10px]"
                            style={{ color: "#1a1a1a", opacity: 0.35 }}
                          >
                            {item.publishedAt}
                          </span>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── BANNER COLLABORATORI ── */}
          <div className="mt-10 mb-2">
            <CollaboratoriBanner variant="full" />
          </div>

          {/* ── FOOTER ── */}
          <div className="mt-12">
            <Divider thick />
            <div className="py-4 flex items-center justify-center">
              <p className="text-[11px] text-[#1a1a1a]/40"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                ProofPress Magazine è parte del gruppo{" "}
                <span className="font-semibold text-[#1a1a1a]/55">AxiomX</span>
                {" · "}
                <Link href="/privacy">
                  <span className="hover:underline cursor-pointer">Privacy</span>
                </Link>
              </p>
            </div>
          </div>

        </main>
        </div>{/* fine contenuto principale */}
      </div>
    </>
    </LangContext.Provider>
  );
}
