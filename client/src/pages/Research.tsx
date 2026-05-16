/**
 * IDEASMART Research — Pagina ricerche
 * Testata identica alla Home: SharedPageHeader + VerifyStatsWidget
 * Struttura: header → filtri categoria → griglia unica tutte le ricerche → footer
 */
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import SharedPageHeader from "@/components/SharedPageHeader";
import SEOHead from "@/components/SEOHead";
import SharedPageFooter from "@/components/SharedPageFooter";
import RequireAuth from "@/components/RequireAuth";
import VerifyBadge from "@/components/VerifyBadge";
import {
  ExternalLink, TrendingUp, Globe, MapPin, BookOpen,
  ChevronDown, ChevronUp, ArrowRight,
  FlaskConical, BarChart3, Cpu, Building2, DollarSign
} from "lucide-react";

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

// ── Card ricerca ──────────────────────────────────────────────────────────────
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
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
  const SF_SERIF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif";
  const SF_DISPLAY = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";

  return (
    <div className="border border-[#1a1a1a]/15 overflow-hidden hover:border-[#1a1a1a]/40 transition-colors" style={{ background: "#f5f5f7" }}>
      {/* Immagine */}
      <div className="relative overflow-hidden" style={{ height: "160px" }}>
        <img src={imgUrl} alt={report.title} className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3">
          <span
            className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5"
            style={{ color: catConfig.accentColor, background: catConfig.bgColor, fontFamily: SF }}
          >
            {catConfig.icon} {catConfig.label}
          </span>
        </div>
        {report.isResearchOfDay && (
          <div className="absolute top-3 right-3">
            <span
              className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5"
              style={{ background: "#1a1a1a", color: "#ffffff", fontFamily: SF }}
            >
              Del Giorno
            </span>
          </div>
        )}
      </div>

      {/* Contenuto */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 text-[9px] text-[#1a1a1a]/40 uppercase tracking-widest" style={{ fontFamily: SF }}>
            {regionConfig.icon} {regionConfig.label}
          </span>
          <span className="text-[#1a1a1a]/20">·</span>
          <span className="text-[9px] text-[#1a1a1a]/40 uppercase tracking-widest" style={{ fontFamily: SF }}>
            {report.source}
          </span>
        </div>

        <Link href={`/research/${report.id}`}>
          <h3
            className="text-[14px] font-black text-[#1a1a1a] leading-snug mb-2 cursor-pointer hover:opacity-75 transition-opacity line-clamp-2"
            style={{ fontFamily: SF_DISPLAY }}
          >
            {report.title}
          </h3>
        </Link>

        <p
          className="text-[12px] text-[#1a1a1a]/60 leading-relaxed mb-3 line-clamp-2"
          style={{ fontFamily: SF_SERIF }}
        >
          {report.summary}
        </p>

        {/* Key Findings espandibili */}
        {expanded && report.keyFindings.length > 0 && (
          <div className="border border-[#1a1a1a]/10 p-3 mb-3" style={{ background: "#ffffff" }}>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: catConfig.accentColor, fontFamily: SF }}>
              Key Findings
            </p>
            <ul className="space-y-1">
              {report.keyFindings.slice(0, 3).map((f, i) => (
                <li key={i} className="flex gap-1.5 text-[#1a1a1a]/60 text-[11px] leading-relaxed" style={{ fontFamily: SF_SERIF }}>
                  <span className="font-black shrink-0" style={{ color: catConfig.accentColor, fontFamily: SF }}>{i + 1}.</span>
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
            className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-[#1a1a1a]/40 hover:text-[#1a1a1a] transition-colors mb-2"
            style={{ fontFamily: SF }}
          >
            Fonte <ExternalLink className="w-3 h-3" />
          </a>
        )}

        {/* VERIFY badge */}
        <div className="mb-2">
          <VerifyBadge hash={`research-${report.id}-${report.source}-${report.dateLabel}`} size="sm" />
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/research/${report.id}`}>
            <span
              className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest cursor-pointer hover:opacity-70 transition-opacity"
              style={{ color: catConfig.accentColor, fontFamily: SF }}
            >
              Leggi <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-[#1a1a1a]/30 hover:text-[#1a1a1a]/60 transition-colors"
            style={{ fontFamily: SF }}
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
    <div className="animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-48 bg-[#1a1a1a]/5 border border-[#1a1a1a]/10" />
        ))}
      </div>
    </div>
  );
}

// ── Pagina principale ─────────────────────────────────────────────────────────
export default function Research() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const _today = useMemo(() => new Date(), []);

  const { data: reports, isLoading } = trpc.news.getResearchReports.useQuery({ limit: 30 });

  const categories = ["all", "ai_trends", "venture_capital", "startup", "technology", "market"];

  const filteredReports = activeCategory === "all"
    ? (reports ?? [])
    : (reports ?? []).filter(r => r.category === activeCategory);

  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
  const SF_DISPLAY = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";
  const SF_SERIF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif";

  return (
    <RequireAuth>
      <div className="flex min-h-screen" style={{ background: "#ffffff", color: "#1a1a1a" }}>
        <div className="flex-1 min-w-0 overflow-x-hidden">
          <SEOHead
            title="Ricerche & Analisi — ProofPress"
            description="Analisi approfondite su AI, Startup e Venture Capital. Ricerche verificate da ProofPress per chi prende decisioni."
            canonical="https://proofpress.ai/research"
            ogImage="https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/og-research-cisacbT2pWcoc5B4U27pjr.png"
            ogSiteName="ProofPress"
          />
          <SharedPageHeader />

          {/* ── Contenuto principale ──────────────────────────────────────── */}
          <div className="max-w-[1280px] mx-auto px-3 sm:px-4 pt-4 pb-12 lg:pb-12" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 68px)' }}>

            {/* Intestazione sezione */}
            <div className="flex items-end justify-between gap-4 mb-4 pb-3 border-b border-[#1a1a1a]/10">
              <div>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#1a1a1a]/40 block mb-1"
                  style={{ fontFamily: SF }}
                >
                  ProofPress Research
                </span>
                <h2
                  className="text-2xl md:text-3xl font-black text-[#1a1a1a] leading-none"
                  style={{ fontFamily: SF_DISPLAY }}
                >
                  Ricerche & Analisi
                </h2>
              </div>
              <p
                className="hidden md:block text-[10px] text-[#1a1a1a]/40 uppercase tracking-widest text-right max-w-xs leading-relaxed"
                style={{ fontFamily: SF }}
              >
                Gartner · CB Insights · McKinsey · Statista
              </p>
            </div>

            <p
              className="text-[#1a1a1a]/55 text-sm mb-5"
              style={{ fontFamily: SF_SERIF }}
            >
              Analisi quotidiane su Startup, Venture Capital e AI Trends — dati dalle principali fonti di ricerca globali ed europee.
            </p>

            {/* Filtri categoria */}
            <div className="flex flex-wrap gap-2 mb-6">
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
                      fontFamily: SF,
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

            {/* Griglia ricerche */}
            {isLoading ? (
              <ResearchSkeleton />
            ) : !reports || reports.length === 0 ? (
              <div className="text-center py-20">
                <FlaskConical className="w-10 h-10 text-[#1a1a1a]/20 mx-auto mb-4" />
                <p className="text-[#1a1a1a]/50 text-lg font-semibold" style={{ fontFamily: SF_DISPLAY }}>
                  Le ricerche di oggi sono in preparazione
                </p>
                <p className="text-[#1a1a1a]/30 text-sm mt-2" style={{ fontFamily: SF }}>
                  Torna tra poco — vengono generate ogni mattina alle 06:00
                </p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#1a1a1a]/40 text-sm" style={{ fontFamily: SF }}>
                  Nessuna ricerca per questa categoria oggi.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredReports.map(report => (
                  <ResearchCard key={report.id} report={report} />
                ))}
              </div>
            )}

          </div>

          <div className="max-w-[1280px] mx-auto px-4">
            <SharedPageFooter />
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
