/**
 * IDEASMART Research — Pagina ricerche giornaliere
 * Testata identica alla Home: logo centrato, manchette, barra canali SectionNav
 */
import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import ReadersCounter from "@/components/ReadersCounter";
import {
  ExternalLink, TrendingUp, Globe, MapPin, BookOpen,
  ChevronDown, ChevronUp, Mail, ArrowRight,
  FlaskConical, BarChart3, Cpu, Building2, DollarSign
} from "lucide-react";

// ── Palette sezioni (identica alla Home) ─────────────────────────────────────
const SECTION_COLORS = {
  ai:            { accent: "#0a6e5c", light: "#e6f4f1", label: "AI4Business",       path: "/ai" },
  music:         { accent: "#5b21b6", light: "#ede9fe", label: "ITsMusic",           path: "/music" },
  startup:       { accent: "#c2410c", light: "#fff0e6", label: "Startup News",       path: "/startup" },
  finance:       { accent: "#15803d", light: "#f0fdf4", label: "Finance & Markets",  path: "/finance" },
  health:        { accent: "#0369a1", light: "#eff6ff", label: "Health & Biotech",   path: "/health" },
  sport:         { accent: "#b45309", light: "#fffbeb", label: "Sport & Business",   path: "/sport" },
  luxury:        { accent: "#7c3aed", light: "#faf5ff", label: "Lifestyle & Luxury", path: "/luxury" },
  news:          { accent: "#1a1f2e", light: "#f1f5f9", label: "News Italia",        path: "/news" },
  motori:        { accent: "#dc2626", light: "#fef2f2", label: "Motori",             path: "/motori" },
  tennis:        { accent: "#65a30d", light: "#f7fee7", label: "Tennis",             path: "/tennis" },
  basket:        { accent: "#ea580c", light: "#fff7ed", label: "Basket",             path: "/basket" },
  gossip:        { accent: "#db2777", light: "#fdf2f8", label: "Business Gossip",    path: "/gossip" },
  cybersecurity: { accent: "#0ea5e9", light: "#f0f9ff", label: "Cybersecurity",      path: "/cybersecurity" },
  sondaggi:      { accent: "#8b5cf6", light: "#f5f3ff", label: "Sondaggi",           path: "/sondaggi" },
};

// ── Config categorie ricerche ─────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ReactNode; accentColor: string; bgColor: string }> = {
  startup:         { label: "Startup",         icon: <Building2 className="w-3.5 h-3.5" />,  accentColor: "#c2410c", bgColor: "#fff0e6" },
  venture_capital: { label: "Venture Capital", icon: <DollarSign className="w-3.5 h-3.5" />, accentColor: "#15803d", bgColor: "#f0fdf4" },
  ai_trends:       { label: "AI Trends",       icon: <Cpu className="w-3.5 h-3.5" />,        accentColor: "#0a6e5c", bgColor: "#e6f4f1" },
  technology:      { label: "Tecnologia",      icon: <BarChart3 className="w-3.5 h-3.5" />,  accentColor: "#7c3aed", bgColor: "#faf5ff" },
  market:          { label: "Mercati",         icon: <TrendingUp className="w-3.5 h-3.5" />, accentColor: "#0369a1", bgColor: "#eff6ff" },
};

const REGION_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  global: { label: "Globale", icon: <Globe className="w-3 h-3" /> },
  europe: { label: "Europa",  icon: <MapPin className="w-3 h-3" /> },
  italy:  { label: "Italia",  icon: <MapPin className="w-3 h-3" /> },
};

function getCategoryConfig(cat: string) {
  return CATEGORY_CONFIG[cat] ?? { label: cat, icon: <BookOpen className="w-3.5 h-3.5" />, accentColor: "#1a1a2e", bgColor: "#f5f2ec" };
}

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  startup:         "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80",
  venture_capital: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80",
  ai_trends:       "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80",
  technology:      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
  market:          "https://images.unsplash.com/photo-1642790551116-18e150f248e3?w=600&q=80",
};

function getImageUrl(report: { imageUrl?: string | null; category: string }): string {
  return report.imageUrl || CATEGORY_FALLBACK_IMAGES[report.category] || CATEGORY_FALLBACK_IMAGES["ai_trends"];
}

// ── Utility ───────────────────────────────────────────────────────────────────
function formatDateIT(date: Date): string {
  return date.toLocaleDateString("it-IT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function Divider({ thick = false }: { thick?: boolean }) {
  return <div className={`w-full ${thick ? "border-t-4" : "border-t"} border-[#1a1a2e]`} />;
}

// ── SectionNav (identica alla Home) ──────────────────────────────────────────
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
      {/* Riga 1: canali editoriali */}
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
                      <span className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: "#fff", opacity: 0.6 }} />
                    )}
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

      {/* Riga 2: pagine istituzionali */}
      <div className="flex flex-wrap items-center border-t" style={{ borderColor: "rgba(26,26,46,0.10)", background: "#f5f2ec" }}>
        <Link href="/edicola">
          <span className="flex items-center px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] cursor-pointer transition-all text-[#1a1a2e]/60 hover:text-[#1a1a2e] hover:underline decoration-[#1a1a2e] underline-offset-2" style={{ fontFamily: "'Space Mono', monospace" }}>Edicola</span>
        </Link>
        <span className="text-[#1a1a2e]/15 text-xs">|</span>
        <Link href="/manifesto">
          <span className="flex items-center px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] cursor-pointer transition-all text-[#1a1a2e]/60 hover:text-[#0a6e5c] hover:underline decoration-[#0a6e5c] underline-offset-2" style={{ fontFamily: "'Space Mono', monospace" }}>Manifesto</span>
        </Link>
        <span className="text-[#1a1a2e]/15 text-xs">|</span>
        <Link href="/chi-siamo">
          <span className="flex items-center px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] cursor-pointer transition-all text-[#1a1a2e]/60 hover:text-[#0369a1] hover:underline decoration-[#0369a1] underline-offset-2" style={{ fontFamily: "'Space Mono', monospace" }}>Chi Siamo</span>
        </Link>
        <span className="text-[#1a1a2e]/15 text-xs">|</span>
        <Link href="/tecnologia">
          <span className="flex items-center px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] cursor-pointer transition-all text-[#1a1a2e]/60 hover:text-[#00b89a] hover:underline decoration-[#00b89a] underline-offset-2" style={{ fontFamily: "'Space Mono', monospace" }}>Tecnologia</span>
        </Link>
        <span className="text-[#1a1a2e]/15 text-xs">|</span>
        <Link href="/advertise">
          <span className="flex items-center px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] cursor-pointer transition-all text-[#ff5500]/70 hover:text-[#ff5500] hover:underline decoration-[#ff5500] underline-offset-2" style={{ fontFamily: "'Space Mono', monospace" }}>Advertise</span>
        </Link>
        <span className="text-[#1a1a2e]/15 text-xs mx-1">·</span>
        <ReadersCounter />
        <div className="ml-auto flex items-center">
          <Link href="/business">
            <span
              className="flex items-center gap-2 px-5 py-2 text-[9px] font-black uppercase tracking-[0.14em] cursor-pointer transition-all duration-200"
              style={{ fontFamily: "'Space Mono', monospace", background: "#1a1a2e", color: "#ff5500", letterSpacing: "0.14em" }}
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
    <div className="border-2 border-[#1a1a2e] overflow-hidden" style={{ background: "#f5f2ec" }}>
      {/* Intestazione categoria */}
      <div
        className="px-6 py-2.5 flex items-center gap-2 border-b border-[#1a1a2e]/10"
        style={{ background: catConfig.bgColor }}
      >
        <FlaskConical className="w-4 h-4" style={{ color: catConfig.accentColor }} />
        <span
          className="text-[10px] font-bold uppercase tracking-[0.25em]"
          style={{ color: catConfig.accentColor, fontFamily: "'Space Mono', monospace" }}
        >
          Ricerca del Giorno — {catConfig.label}
        </span>
        <span className="ml-auto text-[10px] text-[#1a1a2e]/40" style={{ fontFamily: "'Space Mono', monospace" }}>
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e]/40 to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#f5f2ec]/30" />
        </div>

        {/* Contenuto */}
        <div className="md:col-span-3 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border"
              style={{ color: catConfig.accentColor, borderColor: catConfig.accentColor, background: catConfig.bgColor, fontFamily: "'Space Mono', monospace" }}
            >
              {catConfig.icon} {catConfig.label}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-[#1a1a2e]/50 uppercase tracking-widest" style={{ fontFamily: "'Space Mono', monospace" }}>
              {regionConfig.icon} {regionConfig.label}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-[#1a1a2e]/50 uppercase tracking-widest" style={{ fontFamily: "'Space Mono', monospace" }}>
              <BookOpen className="w-3 h-3" /> {report.source}
            </span>
          </div>

          <h2
            className="text-2xl md:text-3xl font-black text-[#1a1a2e] leading-tight mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {report.title}
          </h2>

          <p className="text-[#1a1a2e]/70 text-base leading-relaxed mb-5" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
            {report.summary}
          </p>

          {report.keyFindings.length > 0 && (
            <div className="border border-[#1a1a2e]/15 p-4 mb-5" style={{ background: "#faf8f3" }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: catConfig.accentColor, fontFamily: "'Space Mono', monospace" }}>
                Key Findings
              </p>
              <ul className="space-y-1.5">
                {report.keyFindings.map((f, i) => (
                  <li key={i} className="flex gap-2 text-[#1a1a2e]/70 text-sm leading-relaxed" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                    <span className="font-black shrink-0" style={{ color: catConfig.accentColor, fontFamily: "'Space Mono', monospace" }}>{i + 1}.</span>
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
              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#1a1a2e]/50 hover:text-[#1a1a2e] transition-colors"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Fonte originale <ExternalLink className="w-3 h-3" />
            </a>
          )}
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
    <div className="border border-[#1a1a2e]/15 overflow-hidden hover:border-[#1a1a2e]/40 transition-colors" style={{ background: "#f5f2ec" }}>
      {/* Immagine */}
      <div className="relative overflow-hidden" style={{ height: "160px" }}>
        <img src={imgUrl} alt={report.title} className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3">
          <span
            className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5"
            style={{ color: catConfig.accentColor, background: catConfig.bgColor, fontFamily: "'Space Mono', monospace" }}
          >
            {catConfig.icon} {catConfig.label}
          </span>
        </div>
      </div>

      {/* Contenuto */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 text-[9px] text-[#1a1a2e]/40 uppercase tracking-widest" style={{ fontFamily: "'Space Mono', monospace" }}>
            {regionConfig.icon} {regionConfig.label}
          </span>
          <span className="text-[#1a1a2e]/20 text-[9px]">·</span>
          <span className="text-[9px] text-[#1a1a2e]/40 uppercase tracking-widest" style={{ fontFamily: "'Space Mono', monospace" }}>
            {report.source}
          </span>
        </div>

        <h3
          className="font-black text-[#1a1a2e] text-base leading-snug mb-2 cursor-pointer hover:opacity-70 transition-opacity"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          onClick={() => setExpanded(!expanded)}
        >
          {report.title}
        </h3>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-[#1a1a2e]/10">
            <p className="text-[#1a1a2e]/70 text-sm leading-relaxed mb-3" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
              {report.summary}
            </p>
            {report.keyFindings.length > 0 && (
              <div className="border border-[#1a1a2e]/10 p-3 mb-3" style={{ background: "#faf8f3" }}>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: catConfig.accentColor, fontFamily: "'Space Mono', monospace" }}>
                  Key Findings
                </p>
                <ul className="space-y-1">
                  {report.keyFindings.map((f, i) => (
                    <li key={i} className="flex gap-2 text-[#1a1a2e]/60 text-xs leading-relaxed" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                      <span className="font-black shrink-0" style={{ color: catConfig.accentColor, fontFamily: "'Space Mono', monospace" }}>{i + 1}.</span>
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
                className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-[#1a1a2e]/40 hover:text-[#1a1a2e] transition-colors"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                Fonte <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 flex items-center gap-1 text-[9px] uppercase tracking-widest text-[#1a1a2e]/30 hover:text-[#1a1a2e]/60 transition-colors"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          {expanded ? <><ChevronUp className="w-3 h-3" /> Meno</> : <><ChevronDown className="w-3 h-3" /> Leggi</>}
        </button>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function ResearchSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-72 bg-[#1a1a2e]/8 border border-[#1a1a2e]/10" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 bg-[#1a1a2e]/5 border border-[#1a1a2e]/10" />
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
    <>
      {/* Font Google identici alla Home */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,600&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,300;1,8..60,400&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
      `}</style>

      <div className="min-h-screen" style={{ background: "#faf8f3", color: "#1a1a2e" }}>

        {/* ── TESTATA EDITORIALE (identica alla Home) ───────────────────────── */}
        <header className="max-w-6xl mx-auto px-4 pt-6 pb-0">
          {/* Riga data / tagline */}
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-xs text-[#1a1a2e]/50 uppercase tracking-widest"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {formatDateIT(today)}
            </span>
            <span
              className="text-xs text-[#1a1a2e]/40 uppercase tracking-widest"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Testata 100% HumanLess
            </span>
          </div>

          <Divider thick />

          {/* Manchette + Brand centrale */}
          <div className="grid grid-cols-1 md:grid-cols-[140px_1fr_140px] items-center gap-4 py-4 md:py-5">

            {/* MANCHETTE SINISTRA */}
            <div className="hidden md:flex justify-end">
              <Link href="/business">
                <div
                  className="w-[130px] h-[130px] border-2 flex flex-col items-center justify-center text-center p-3 cursor-pointer hover:shadow-md transition-all"
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
                <h1
                  className="text-5xl md:text-7xl font-black tracking-tight text-[#1a1a2e] cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.02em" }}
                >
                  IdeaSmart
                </h1>
              </Link>
              <p
                className="mt-1 text-xs uppercase tracking-[0.3em] text-[#1a1a2e]/50"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                La Prima Testata Giornalistica HumanLess italiana
              </p>
              <p
                className="mt-1 text-[11px] text-[#1a1a2e]/40 italic"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "0.02em" }}
              >
                Adrian Lenice, Direttore Responsabile
              </p>
            </div>

            {/* MANCHETTE DESTRA — spazio banner */}
            <div className="hidden md:flex justify-start">
              <div
                className="w-[130px] h-[130px] border overflow-hidden flex items-center justify-center"
                style={{ borderColor: "rgba(26,26,46,0.20)", background: "#f5f2ec" }}
              >
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

          {/* Barra canali + pagine istituzionali */}
          <SectionNav />

          <Divider />
        </header>

        {/* ── Titolo sezione Research ───────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 pt-6 pb-2">
          <div className="flex items-end justify-between gap-4 mb-1">
            <div>
              <span
                className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#1a1a2e]/40 block mb-1"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                ● IDEASMART Research
              </span>
              <h2
                className="text-3xl md:text-4xl font-black text-[#1a1a2e] leading-none"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Ricerche del Giorno
              </h2>
            </div>
            <p
              className="hidden md:block text-[10px] text-[#1a1a2e]/40 uppercase tracking-widest text-right max-w-xs leading-relaxed"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              20 ricerche · Gartner · CB Insights · McKinsey · Statista
            </p>
          </div>
          <p
            className="text-[#1a1a2e]/55 text-sm mt-2 mb-4"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
          >
            Analisi quotidiane su Startup, Venture Capital e AI Trends — dati dalle principali fonti di ricerca globali ed europee.
          </p>
        </div>

        {/* ── Contenuto principale ──────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 pb-12">

          {/* Filtri categoria */}
          <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-[#1a1a2e]/10">
            {categories.map(cat => {
              const config = cat === "all"
                ? { label: "Tutte", icon: null, accentColor: "#1a1a2e", bgColor: "#faf8f3" }
                : getCategoryConfig(cat);
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border transition-colors"
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    background: isActive ? "#1a1a2e" : "#faf8f3",
                    color: isActive ? "#faf8f3" : "#1a1a2e",
                    borderColor: isActive ? "#1a1a2e" : "#1a1a2e30",
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
              <FlaskConical className="w-10 h-10 text-[#1a1a2e]/20 mx-auto mb-4" />
              <p className="text-[#1a1a2e]/50 text-lg font-semibold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Le ricerche di oggi sono in preparazione
              </p>
              <p className="text-[#1a1a2e]/30 text-sm mt-2" style={{ fontFamily: "'Space Mono', monospace" }}>
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
                    <div className="h-px flex-1 bg-[#1a1a2e]/10" />
                    <h3
                      className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#1a1a2e]/40"
                      style={{ fontFamily: "'Space Mono', monospace" }}
                    >
                      Tutte le ricerche di oggi
                    </h3>
                    <div className="h-px flex-1 bg-[#1a1a2e]/10" />
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

          {/* ── CHI È IDEASMART RESEARCH ──────────────────────────────────── */}
          <div className="mt-16 border-2 border-[#1a1a2e]" style={{ background: "#f5f2ec" }}>
            {/* Header sezione */}
            <div className="border-b-2 border-[#1a1a2e] px-8 py-4 flex items-center gap-3">
              <FlaskConical className="w-5 h-5" style={{ color: "#1a1a2e" }} />
              <span
                className="text-[11px] font-black uppercase tracking-[0.3em] text-[#1a1a2e]"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                Chi è IdeaSmart Research
              </span>
            </div>

            <div className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8">
              {/* Testo identitario */}
              <div>
                <h2
                  className="text-2xl md:text-3xl font-black text-[#1a1a2e] leading-tight mb-4"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  L'area di ricerca agentica<br />
                  <span style={{ color: "#0a6e5c" }}>di IdeaSmart</span>
                </h2>

                <p
                  className="text-[#1a1a2e]/70 text-base leading-relaxed mb-4"
                  style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
                >
                  <strong>IdeaSmart Research</strong> è l'unità di intelligenza artificiale agentica di IdeaSmart dedicata alla produzione di ricerche di mercato, analisi di settore e intelligence competitiva. Ogni giorno, agenti AI autonomi raccolgono, sintetizzano e verificano dati dalle principali fonti mondiali — Gartner, CB Insights, McKinsey, Statista, Dealroom, EIF — per produrre 20 ricerche originali su Startup, Venture Capital e AI Trends.
                </p>

                <p
                  className="text-[#1a1a2e]/60 text-sm leading-relaxed mb-6"
                  style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
                >
                  Il nostro approccio combina la velocità dell'AI con il rigore metodologico della ricerca accademica: ogni report include key findings verificati, dati quantitativi, fonti primarie e prospettive di mercato a 12-36 mesi. Siamo la prima testata italiana a produrre ricerche di mercato in modo completamente automatizzato e scalabile.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-0">
                  {[
                    { num: "20",    label: "Ricerche al giorno" },
                    { num: "5",     label: "Categorie coperte" },
                    { num: "50+",   label: "Fonti monitorate" },
                    { num: "100%",  label: "AI-powered" },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="border border-[#1a1a2e]/15 p-3 text-center"
                      style={{ background: "#faf8f3" }}
                    >
                      <p
                        className="text-2xl font-black text-[#1a1a2e] leading-none mb-1"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      >
                        {stat.num}
                      </p>
                      <p
                        className="text-[9px] uppercase tracking-widest text-[#1a1a2e]/50"
                        style={{ fontFamily: "'Space Mono', monospace" }}
                      >
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pannello CTA ricerche dedicate */}
              <div
                className="border-2 border-[#1a1a2e] p-6 flex flex-col"
                style={{ background: "#1a1a2e" }}
              >
                <span
                  className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.22em] px-2.5 py-1 mb-5 self-start"
                  style={{ background: "#ff5500", color: "#faf8f3", fontFamily: "'Space Mono', monospace" }}
                >
                  <FlaskConical className="w-3 h-3" />
                  Ricerche Dedicate
                </span>

                <h3
                  className="text-xl font-black text-[#faf8f3] leading-tight mb-3"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Hai bisogno di una ricerca<br />
                  <span style={{ color: "#00e5c8" }}>su misura?</span>
                </h3>

                <p
                  className="text-[#faf8f3]/55 text-sm leading-relaxed mb-5 flex-1"
                  style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
                >
                  Commissiona ricerche specialistiche su Venture Capital, AI Trends, analisi di mercato e scouting di investimento. Pensate per investitori, founder e manager.
                </p>

                <div className="space-y-2">
                  {[
                    { icon: <TrendingUp className="w-3 h-3" />, label: "Venture Capital & Deal Flow" },
                    { icon: <Cpu className="w-3 h-3" />, label: "AI & Tech Trends" },
                    { icon: <BarChart3 className="w-3 h-3" />, label: "Market Intelligence" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span style={{ color: "#00e5c8" }}>{item.icon}</span>
                      <span
                        className="text-[10px] text-[#faf8f3]/60 uppercase tracking-widest"
                        style={{ fontFamily: "'Space Mono', monospace" }}
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-2">
                  <a
                    href="mailto:research@ideasmart.ai"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
                    style={{ background: "#00e5c8", color: "#1a1a2e", fontFamily: "'Space Mono', monospace" }}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    research@ideasmart.ai
                  </a>
                  <a
                    href="/business"
                    className="flex items-center justify-center gap-2 w-full border border-[#faf8f3]/20 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
                    style={{ color: "#faf8f3", fontFamily: "'Space Mono', monospace" }}
                  >
                    IdeaSmart Business
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="text-center text-xs py-6 border-t border-[#1a1a2e]/10"
          style={{ color: "#1a1a2e", opacity: 0.3, fontFamily: "'Space Mono', monospace" }}
        >
          © {new Date().getFullYear()} IdeaSmart · Testata Giornalistica 100% HumanLess
        </div>
      </div>
    </>
  );
}
