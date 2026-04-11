/**
 * IDEASMART Research — Pagina ricerche giornaliere
 * Testata identica alla Home: logo centrato, manchette, barra canali SectionNav
 */
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import SharedPageHeader from "@/components/SharedPageHeader";
import SEOHead from "@/components/SEOHead";
import SharedPageFooter from "@/components/SharedPageFooter";
import RequireAuth from "@/components/RequireAuth";
import LeftSidebar from "@/components/LeftSidebar";
import VerifyBadge from "@/components/VerifyBadge";
import {
  ExternalLink, TrendingUp, Globe, MapPin, BookOpen,
  ChevronDown, ChevronUp, Mail, ArrowRight,
  FlaskConical, BarChart3, Cpu, Building2, DollarSign
} from "lucide-react";

// ── Palette sezioni (identica alla Home) ─────────────────────────────────────
const SECTION_COLORS = {
  ai:            { accent: "#1a1a1a", light: "#e6f4f1", label: "AI NEWS",       path: "/ai" },
  startup:       { accent: "#2a2a2a", light: "#fff0e6", label: "STARTUP NEWS",       path: "/startup" },
  health:        { accent: "#1a1a1a", light: "#eff6ff", label: "Health & Biotech",   path: "/health" }
};

// ── Config categorie ricerche ─────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ReactNode; accentColor: string; bgColor: string }> = {
  startup:         { label: "Startup",         icon: <Building2 className="w-3.5 h-3.5" />,  accentColor: "#2a2a2a", bgColor: "#fff0e6" },
  venture_capital: { label: "Venture Capital", icon: <DollarSign className="w-3.5 h-3.5" />, accentColor: "#1a1a1a", bgColor: "#f0fdf4" },
  ai_trends:       { label: "AI Trends",       icon: <Cpu className="w-3.5 h-3.5" />,        accentColor: "#1a1a1a", bgColor: "#e6f4f1" },
  technology:      { label: "Tecnologia",      icon: <BarChart3 className="w-3.5 h-3.5" />,  accentColor: "#2a2a2a", bgColor: "#faf5ff" },
  market:          { label: "Mercati",         icon: <TrendingUp className="w-3.5 h-3.5" />, accentColor: "#1a1a1a", bgColor: "#eff6ff" }
};

const REGION_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  global: { label: "Globale", icon: <Globe className="w-3 h-3" /> },
  europe: { label: "Europa",  icon: <MapPin className="w-3 h-3" /> },
  italy:  { label: "Italia",  icon: <MapPin className="w-3 h-3" /> }
};

function getCategoryConfig(cat: string) {
  return CATEGORY_CONFIG[cat] ?? { label: cat, icon: <BookOpen className="w-3.5 h-3.5" />, accentColor: "#1a1a1a", bgColor: "#f5f5f7" };
}

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  startup:         "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80",
  venture_capital: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80",
  ai_trends:       "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80",
  technology:      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
  market:          "https://images.unsplash.com/photo-1642790551116-18e150f248e3?w=600&q=80"
};

function getImageUrl(report: { imageUrl?: string | null; category: string }): string {
  return report.imageUrl || CATEGORY_FALLBACK_IMAGES[report.category] || CATEGORY_FALLBACK_IMAGES["ai_trends"];
}



// ── Card Ricerca del Giorno (hero) ────────────────────────────────────────────
function ResearchHeroCard({ report }: {
  report: {
    id: number; title: string; summary: string; keyFindings: string[];
    source: string; sourceUrl: string | null; category: string; region: string;
    dateLabel: string; isResearchOfDay?: boolean; viewCount: number;
    imageUrl?: string | null;
  };
}) {
  const trackView = trpc.news.trackResearchView.useMutation();
  const catConfig = getCategoryConfig(report.category);
  const regionConfig = REGION_CONFIG[report.region] ?? { label: report.region, icon: <Globe className="w-3 h-3" /> };
  const imgUrl = getImageUrl(report);

  return (
    <div className="border-2 border-[#1a1a1a] overflow-hidden" style={{ background: "#f5f5f7" }}>
      {/* Intestazione categoria */}
      <div
        className="px-6 py-2.5 flex items-center gap-2 border-b border-[#1a1a1a]/10"
        style={{ background: catConfig.bgColor }}
      >
        <FlaskConical className="w-4 h-4" style={{ color: catConfig.accentColor }} />
        <span
          className="text-[10px] font-bold uppercase tracking-[0.25em]"
          style={{ color: catConfig.accentColor, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
        >
          Ricerca del Giorno — {catConfig.label}
        </span>
        <span className="ml-auto text-[10px] text-[#1a1a1a]/40" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
          {report.dateLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5">
        {/* Immagine */}
        <div className="md:col-span-2 relative">
          <img
            src={imgUrl}
            alt={report.title}
            className="w-full h-56 md:h-full object-cover"
            style={{ minHeight: "240px" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/40 to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#f5f5f7]/30" />
        </div>

        {/* Contenuto */}
        <div className="md:col-span-3 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border"
              style={{ color: catConfig.accentColor, borderColor: catConfig.accentColor, background: catConfig.bgColor, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
            >
              {catConfig.icon} {catConfig.label}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-[#1a1a1a]/50 uppercase tracking-widest" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
              {regionConfig.icon} {regionConfig.label}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-[#1a1a1a]/50 uppercase tracking-widest" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
              <BookOpen className="w-3 h-3" /> {report.source}
            </span>
          </div>

          <Link href={`/research/${report.id}`}>
          <h2
            className="text-2xl md:text-3xl font-black text-[#1a1a1a] leading-tight mb-4 cursor-pointer hover:opacity-75 transition-opacity"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
          >
            {report.title}
          </h2>
          </Link>

          <p className="text-[#1a1a1a]/70 text-base leading-relaxed mb-5" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
            {report.summary}
          </p>

          {report.keyFindings.length > 0 && (
            <div className="border border-[#1a1a1a]/15 p-4 mb-5" style={{ background: "#ffffff" }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: catConfig.accentColor, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                Key Findings
              </p>
              <ul className="space-y-1.5">
                {report.keyFindings.map((f, i) => (
                  <li key={i} className="flex gap-2 text-[#1a1a1a]/70 text-sm leading-relaxed" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
                    <span className="font-black shrink-0" style={{ color: catConfig.accentColor, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>{i + 1}.</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Link href={`/research/${report.id}`}>
              <span
                className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:opacity-70 transition-opacity"
                style={{ color: catConfig.accentColor, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              >
                Leggi la ricerca <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
            {report.sourceUrl && (
              <a
                href={report.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackView.mutate({ id: report.id })}
                className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#1a1a1a]/40 hover:text-[#1a1a1a] transition-colors"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              >
                Fonte originale <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Card ricerca standard ─────────────────────────────────────────────────────
function ResearchCard({ report }: {
  report: {
    id: number; title: string; summary: string; keyFindings: string[];
    source: string; sourceUrl: string | null; category: string; region: string;
    dateLabel: string; isResearchOfDay?: boolean; viewCount: number;
    imageUrl?: string | null;
  };
}) {
  const [expanded, setExpanded] = useState(false);
  const trackView = trpc.news.trackResearchView.useMutation();
  const catConfig = getCategoryConfig(report.category);
  const regionConfig = REGION_CONFIG[report.region] ?? { label: report.region, icon: <Globe className="w-3 h-3" /> };
  const imgUrl = getImageUrl(report);

  return (
    <div className="border border-[#1a1a1a]/15 overflow-hidden hover:border-[#1a1a1a]/40 transition-colors" style={{ background: "#f5f5f7" }}>
      {/* Immagine */}
      <div className="relative overflow-hidden" style={{ height: "160px" }}>
        <img src={imgUrl} alt={report.title} className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3">
          <span
            className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5"
            style={{ color: catConfig.accentColor, background: catConfig.bgColor, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
          >
            {catConfig.icon} {catConfig.label}
          </span>
        </div>
      </div>

      {/* Contenuto */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 text-[9px] text-[#1a1a1a]/40 uppercase tracking-widest" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
            {regionConfig.icon} {regionConfig.label}
          </span>
          <span className="text-[#1a1a1a]/20 text-[9px]">·</span>
          <span className="text-[9px] text-[#1a1a1a]/40 uppercase tracking-widest" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
            {report.source}
          </span>
        </div>

        <Link href={`/research/${report.id}`}>
        <h3
          className="font-black text-[#1a1a1a] text-base leading-snug mb-2 cursor-pointer hover:opacity-70 transition-opacity"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
        >
          {report.title}
        </h3>
        </Link>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-[#1a1a1a]/10">
            <p className="text-[#1a1a1a]/70 text-sm leading-relaxed mb-3" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
              {report.summary}
            </p>
            {report.keyFindings.length > 0 && (
              <div className="border border-[#1a1a1a]/10 p-3 mb-3" style={{ background: "#ffffff" }}>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: catConfig.accentColor, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                  Key Findings
                </p>
                <ul className="space-y-1">
                  {report.keyFindings.map((f, i) => (
                    <li key={i} className="flex gap-2 text-[#1a1a1a]/60 text-xs leading-relaxed" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
                      <span className="font-black shrink-0" style={{ color: catConfig.accentColor, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>{i + 1}.</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {report.sourceUrl && (
              <a
                href={report.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackView.mutate({ id: report.id })}
                className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-[#1a1a1a]/40 hover:text-[#1a1a1a] transition-colors"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              >
                Fonte <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* VERIFY badge */}
        <div className="px-4 pb-1">
          <VerifyBadge hash={`research-${report.id}-${report.source}-${report.dateLabel}`} size="sm" />
        </div>

        <div className="flex items-center gap-3 mt-2 px-4 pb-3">
          <Link href={`/research/${report.id}`}>
            <span
              className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest cursor-pointer hover:opacity-70 transition-opacity"
              style={{ color: catConfig.accentColor, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
            >
              Leggi <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-[#1a1a1a]/30 hover:text-[#1a1a1a]/60 transition-colors"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
          >
            {expanded ? <><ChevronUp className="w-3 h-3" /> Meno</> : <><ChevronDown className="w-3 h-3" /> Anteprima</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function ResearchSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-72 bg-[#1a1a1a]/8 border border-[#1a1a1a]/10" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 bg-[#1a1a1a]/5 border border-[#1a1a1a]/10" />
        ))}
      </div>
    </div>
  );
}

// ── Pagina principale ─────────────────────────────────────────────────────────
export default function Research() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const today = useMemo(() => new Date(), []);

  const { data: reports, isLoading } = trpc.news.getResearchReports.useQuery({ limit: 20 });

  const categories = ["all", "ai_trends", "venture_capital", "startup", "technology", "market"];

  const researchOfDay = reports?.find(r => r.isResearchOfDay) ?? reports?.[0] ?? null;
  const otherReports = reports?.filter(r => r.id !== researchOfDay?.id) ?? [];
  const filteredOthers = activeCategory === "all"
    ? otherReports
    : otherReports.filter(r => r.category === activeCategory);

  return (
    <RequireAuth>
      <div className="flex min-h-screen" style={{ background: "#ffffff", color: "#1a1a1a" }}>
        <LeftSidebar />
        <div className="flex-1 min-w-0 overflow-x-hidden">
        <SEOHead
          title="Ricerche & Analisi — ProofPress"
          description="Analisi approfondite su AI, Startup e Venture Capital. Ricerche verificate da ProofPress per chi prende decisioni."
          canonical="https://proofpress.ai/research"
          ogImage="https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/og-research-cisacbT2pWcoc5B4U27pjr.png"
          ogSiteName="ProofPress"
        />
        <SharedPageHeader />
        {/* ── Titolo sezione Research ───────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 pt-6 pb-2">
          <div className="flex items-end justify-between gap-4 mb-1">
            <div>
              <span
                className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#1a1a1a]/40 block mb-1"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              >
                ● Proof Press Research
              </span>
              <h2
                className="text-3xl md:text-4xl font-black text-[#1a1a1a] leading-none"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
              >
                Ricerche del Giorno
              </h2>
            </div>
            <p
              className="hidden md:block text-[10px] text-[#1a1a1a]/40 uppercase tracking-widest text-right max-w-xs leading-relaxed"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
            >
              20 ricerche · Gartner · CB Insights · McKinsey · Statista
            </p>
          </div>
          <p
            className="text-[#1a1a1a]/55 text-sm mt-2 mb-4"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}
          >
            Analisi quotidiane su Startup, Venture Capital e AI Trends — dati dalle principali fonti di ricerca globali ed europee.
          </p>
        </div>

        {/* ── Contenuto principale ──────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-3 sm:px-4 pb-12 lg:pb-12" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 68px)' }}>

          {/* Filtri categoria */}
          <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-[#1a1a1a]/10">
            {categories.map(cat => {
              const config = cat === "all"
                ? { label: "Tutte", icon: null, accentColor: "#1a1a1a", bgColor: "#ffffff" }
                : getCategoryConfig(cat);
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border transition-colors"
                  style={{
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
                    background: isActive ? "#1a1a1a" : "#ffffff",
                    color: isActive ? "#ffffff" : "#1a1a1a",
                    borderColor: isActive ? "#1a1a1a" : "#1a1a1a30"
                  }}
                >
                  {config.icon} {config.label}
                </button>
              );
            })}
          </div>

          {isLoading ? (
            <ResearchSkeleton />
          ) : !reports || reports.length === 0 ? (
            <div className="text-center py-20">
              <FlaskConical className="w-10 h-10 text-[#1a1a1a]/20 mx-auto mb-4" />
              <p className="text-[#1a1a1a]/50 text-lg font-semibold" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
                Le ricerche di oggi sono in preparazione
              </p>
              <p className="text-[#1a1a1a]/30 text-sm mt-2" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                Torna tra poco — vengono generate ogni mattina alle 06:00
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Ricerca del Giorno (hero) */}
              {researchOfDay && (activeCategory === "all" || activeCategory === researchOfDay.category) && (
                <ResearchHeroCard report={researchOfDay} />
              )}

              {/* Griglia tutte le ricerche */}
              {filteredOthers.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-px flex-1 bg-[#1a1a1a]/10" />
                    <h3
                      className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#1a1a1a]/40"
                      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                    >
                      Tutte le ricerche di oggi
                    </h3>
                    <div className="h-px flex-1 bg-[#1a1a1a]/10" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredOthers.map(report => (
                      <ResearchCard key={report.id} report={report} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── CHI È IdeaSmart ──────────────────────────────────── */}
          <div className="mt-16 border-2 border-[#1a1a1a]" style={{ background: "#f5f5f7" }}>
            {/* Header sezione */}
            <div className="border-b-2 border-[#1a1a1a] px-8 py-4 flex items-center gap-3">
              <FlaskConical className="w-5 h-5" style={{ color: "#1a1a1a" }} />
              <span
                className="text-[11px] font-black uppercase tracking-[0.3em] text-[#1a1a1a]"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              >
                Chi è Proof Press
              </span>
            </div>

            <div className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8">
              {/* Testo identitario */}
              <div>
                <h2
                  className="text-2xl md:text-3xl font-black text-[#1a1a1a] leading-tight mb-4"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
                >
                  L'area di ricerca agentica<br />
                  <span style={{ color: "#1a1a1a" }}>di Proof Press</span>
                </h2>

                <p
                  className="text-[#1a1a1a]/70 text-base leading-relaxed mb-4"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}
                >
                  <strong>Proof Press</strong> è l'unità di intelligenza artificiale agentica di Proof Press dedicata alla produzione di ricerche di mercato, analisi di settore e intelligence competitiva. Ogni giorno, agenti AI autonomi raccolgono, sintetizzano e verificano dati dalle principali fonti mondiali — Gartner, CB Insights, McKinsey, Statista, Dealroom, EIF — per produrre 20 ricerche originali su Startup, Venture Capital e AI Trends.
                </p>

                <p
                  className="text-[#1a1a1a]/60 text-sm leading-relaxed mb-6"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}
                >
                  Il nostro approccio combina la velocità dell'AI con il rigore metodologico della ricerca accademica: ogni report include key findings verificati, dati quantitativi, fonti primarie e prospettive di mercato a 12-36 mesi. Siamo la prima testata italiana a produrre ricerche di mercato in modo completamente automatizzato e scalabile.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-0">
                  {[
                    { num: "20",    label: "Ricerche al giorno" },
                    { num: "5",     label: "Categorie coperte" },
                    { num: "50+",   label: "Fonti monitorate" },
                    { num: "100%",  label: "AI-powered" }
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="border border-[#1a1a1a]/15 p-3 text-center"
                      style={{ background: "#ffffff" }}
                    >
                      <p
                        className="text-2xl font-black text-[#1a1a1a] leading-none mb-1"
                        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
                      >
                        {stat.num}
                      </p>
                      <p
                        className="text-[9px] uppercase tracking-widest text-[#1a1a1a]/50"
                        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                      >
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pannello CTA ricerche dedicate */}
              <div
                className="border-2 border-[#1a1a1a] p-6 flex flex-col"
                style={{ background: "#1a1a1a" }}
              >
                <span
                  className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.22em] px-2.5 py-1 mb-5 self-start"
                  style={{ background: "#2a2a2a", color: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                >
                  <FlaskConical className="w-3 h-3" />
                  Ricerche Dedicate
                </span>

                <h3
                  className="text-xl font-black text-[#ffffff] leading-tight mb-3"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
                >
                  Hai bisogno di una ricerca<br />
                  <span style={{ color: "#1a1a1a" }}>su misura?</span>
                </h3>

                <p
                  className="text-[#ffffff]/55 text-sm leading-relaxed mb-5 flex-1"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}
                >
                  Commissiona ricerche specialistiche su Venture Capital, AI Trends, analisi di mercato e scouting di investimento. Pensate per investitori, founder e manager.
                </p>

                <div className="space-y-2">
                  {[
                    { icon: <TrendingUp className="w-3 h-3" />, label: "Venture Capital & Deal Flow" },
                    { icon: <Cpu className="w-3 h-3" />, label: "AI & Tech Trends" },
                    { icon: <BarChart3 className="w-3 h-3" />, label: "Market Intelligence" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span style={{ color: "#1a1a1a" }}>{item.icon}</span>
                      <span
                        className="text-[10px] text-[#ffffff]/60 uppercase tracking-widest"
                        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-2">
                  <a
                    href="mailto:research@proofpress.ai"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
                    style={{ background: "#1a1a1a", color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    research@proofpress.ai
                  </a>
                  <a
                    href="/business"
                    className="flex items-center justify-center gap-2 w-full border border-[#ffffff]/20 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
                    style={{ color: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                  >
                    Proof Press Business
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-4">
          <SharedPageFooter />
        </div>
        </div>{/* fine contenuto principale */}
      </div>
    </RequireAuth>
  );
}
