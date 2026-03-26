/**
 * IDEASMART Research — Pagina dedicata alle ricerche giornaliere
 * Stile: coerente con il design editoriale del sito (navy + cyan + orange)
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, TrendingUp, Globe, MapPin, BookOpen, ChevronDown, ChevronUp, Mail, Phone, ArrowRight, Microscope, BarChart3, Cpu, Building2, DollarSign } from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  startup: { label: "Startup", icon: <Building2 className="w-3.5 h-3.5" />, color: "bg-orange-100 text-orange-700 border-orange-200" },
  venture_capital: { label: "Venture Capital", icon: <DollarSign className="w-3.5 h-3.5" />, color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  ai_trends: { label: "AI Trends", icon: <Cpu className="w-3.5 h-3.5" />, color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  technology: { label: "Tecnologia", icon: <BarChart3 className="w-3.5 h-3.5" />, color: "bg-violet-100 text-violet-700 border-violet-200" },
  market: { label: "Mercati", icon: <TrendingUp className="w-3.5 h-3.5" />, color: "bg-blue-100 text-blue-700 border-blue-200" },
};

const REGION_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  global: { label: "Globale", icon: <Globe className="w-3 h-3" /> },
  europe: { label: "Europa", icon: <MapPin className="w-3 h-3" /> },
  italy: { label: "Italia", icon: <MapPin className="w-3 h-3" /> },
};

function getCategoryConfig(cat: string) {
  return CATEGORY_CONFIG[cat] ?? { label: cat, icon: <BookOpen className="w-3.5 h-3.5" />, color: "bg-gray-100 text-gray-700 border-gray-200" };
}

// ── Componente singola ricerca ───────────────────────────────────────────────
function ResearchCard({ report, isHighlight = false }: {
  report: {
    id: number; title: string; summary: string; keyFindings: string[];
    source: string; sourceUrl: string | null; category: string; region: string;
    dateLabel: string; isResearchOfDay?: boolean; viewCount: number;
  };
  isHighlight?: boolean;
}) {
  const [expanded, setExpanded] = useState(isHighlight);
  const trackView = trpc.news.trackResearchView.useMutation();
  const catConfig = getCategoryConfig(report.category);
  const regionConfig = REGION_CONFIG[report.region] ?? { label: report.region, icon: <Globe className="w-3 h-3" /> };

  const handleSourceClick = () => {
    trackView.mutate({ id: report.id });
  };

  if (isHighlight) {
    return (
      <div className="border-2 border-[#00e5c8] rounded-2xl overflow-hidden bg-[#0a0f1e] text-white shadow-xl shadow-[#00e5c8]/10">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00e5c8] to-[#00b8a0] px-6 py-3 flex items-center gap-3">
          <Microscope className="w-5 h-5 text-[#0a0f1e]" />
          <span className="font-black text-[#0a0f1e] text-sm tracking-widest uppercase">Ricerca del Giorno</span>
          <span className="ml-auto text-[#0a0f1e]/70 text-xs font-mono">{report.dateLabel}</span>
        </div>
        {/* Body */}
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${catConfig.color}`}>
              {catConfig.icon} {catConfig.label}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/80 border border-white/20">
              {regionConfig.icon} {regionConfig.label}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/80 border border-white/20">
              <BookOpen className="w-3 h-3" /> {report.source}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black leading-tight mb-4 text-white">{report.title}</h2>
          <p className="text-white/80 text-base leading-relaxed mb-6">{report.summary}</p>
          {/* Key Findings */}
          {report.keyFindings.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <p className="text-[#00e5c8] font-bold text-sm uppercase tracking-wider mb-3">Key Findings</p>
              <ul className="space-y-2">
                {report.keyFindings.map((f, i) => (
                  <li key={i} className="flex gap-3 text-white/80 text-sm leading-relaxed">
                    <span className="text-[#00e5c8] font-black shrink-0 mt-0.5">{i + 1}.</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {report.sourceUrl && (
            <a href={report.sourceUrl} target="_blank" rel="noopener noreferrer" onClick={handleSourceClick}
              className="mt-5 inline-flex items-center gap-2 text-[#00e5c8] hover:text-white transition-colors text-sm font-semibold">
              Leggi la ricerca originale <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl bg-white hover:border-[#00e5c8] hover:shadow-md transition-all duration-200">
      <div className="p-5">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${catConfig.color}`}>
            {catConfig.icon} {catConfig.label}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 border border-gray-200">
            {regionConfig.icon} {regionConfig.label}
          </span>
        </div>
        <h3 className="font-bold text-[#0a0f1e] text-base leading-snug mb-2 cursor-pointer hover:text-[#00b8a0]"
          onClick={() => setExpanded(!expanded)}>
          {report.title}
        </h3>
        <p className="text-gray-500 text-xs mb-3">Fonte: <span className="font-semibold text-gray-700">{report.source}</span></p>

        {/* Expandable content */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-gray-600 text-sm leading-relaxed mb-4">{report.summary}</p>
            {report.keyFindings.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 mb-3">
                <p className="text-[#0a0f1e] font-bold text-xs uppercase tracking-wider mb-2">Key Findings</p>
                <ul className="space-y-1.5">
                  {report.keyFindings.map((f, i) => (
                    <li key={i} className="flex gap-2 text-gray-600 text-sm">
                      <span className="text-[#00b8a0] font-bold shrink-0">{i + 1}.</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {report.sourceUrl && (
              <a href={report.sourceUrl} target="_blank" rel="noopener noreferrer" onClick={handleSourceClick}
                className="inline-flex items-center gap-1.5 text-[#00b8a0] hover:text-[#0a0f1e] transition-colors text-sm font-semibold">
                Fonte originale <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        <button onClick={() => setExpanded(!expanded)}
          className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-[#00b8a0] transition-colors">
          {expanded ? <><ChevronUp className="w-3.5 h-3.5" /> Mostra meno</> : <><ChevronDown className="w-3.5 h-3.5" /> Leggi di più</>}
        </button>
      </div>
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function ResearchSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-64 bg-gray-200 rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ── Pagina principale ─────────────────────────────────────────────────────────
export default function Research() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const { data: reports, isLoading } = trpc.news.getResearchReports.useQuery({ limit: 10 });

  const categories = ["all", "ai_trends", "venture_capital", "startup", "technology", "market"];

  const filteredReports = activeCategory === "all"
    ? (reports ?? [])
    : (reports ?? []).filter(r => r.category === activeCategory);

  const researchOfDay = reports?.find(r => r.isResearchOfDay) ?? reports?.[0] ?? null;
  const otherReports = reports?.filter(r => r.id !== researchOfDay?.id) ?? [];
  const filteredOthers = activeCategory === "all"
    ? otherReports
    : otherReports.filter(r => r.category === activeCategory);

  const today = new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-[#f5f3ef]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      {/* Hero Header */}
      <div className="bg-[#0a0f1e] text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#00e5c8] rounded-xl flex items-center justify-center shrink-0 mt-1">
              <Microscope className="w-6 h-6 text-[#0a0f1e]" />
            </div>
            <div>
              <p className="text-[#00e5c8] text-xs font-black tracking-widest uppercase mb-1">IDEASMART</p>
              <h1 className="text-4xl md:text-5xl font-black leading-tight mb-3">Research</h1>
              <p className="text-white/70 text-lg max-w-2xl leading-relaxed">
                10 ricerche ogni giorno su Startup, Venture Capital e AI Trends. Dati da Gartner, CB Insights, Statista, McKinsey e le principali fonti di ricerca globali ed europee.
              </p>
              <p className="text-white/40 text-sm mt-3 font-mono">{today}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => {
            const config = cat === "all" ? { label: "Tutte", icon: null } : getCategoryConfig(cat);
            return (
              <button key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                  activeCategory === cat
                    ? "bg-[#0a0f1e] text-white border-[#0a0f1e]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#00e5c8]"
                }`}>
                {config.icon} {config.label}
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <ResearchSkeleton />
        ) : !reports || reports.length === 0 ? (
          <div className="text-center py-20">
            <Microscope className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-semibold">Le ricerche di oggi sono in preparazione</p>
            <p className="text-gray-400 text-sm mt-2">Torna tra poco — vengono generate ogni mattina alle 06:00</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Ricerca del Giorno */}
            {researchOfDay && (activeCategory === "all" || activeCategory === researchOfDay.category) && (
              <ResearchCard report={researchOfDay} isHighlight />
            )}

            {/* Griglia altre ricerche */}
            {filteredOthers.length > 0 && (
              <div>
                <h2 className="text-lg font-black text-[#0a0f1e] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-[#ff5500] rounded-full inline-block" />
                  Tutte le ricerche di oggi
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredOthers.map(report => (
                    <ResearchCard key={report.id} report={report} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── CALL TO ACTION ─────────────────────────────────────────────────── */}
        <div className="mt-16 bg-[#0a0f1e] rounded-2xl overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-[#ff5500] text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                <Microscope className="w-3.5 h-3.5" />
                IDEASMART Research Team
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">
                Hai bisogno di una ricerca<br />
                <span className="text-[#00e5c8]">dedicata al tuo business?</span>
              </h2>
              <p className="text-white/70 text-lg leading-relaxed mb-8">
                Il team IDEASMART Research offre analisi specialistiche su misura per investitori, founder e manager. Ricerche approfondite su Venture Capital, AI Trends tecnologici, analisi di mercato e scouting di investimento.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[
                  { icon: <TrendingUp className="w-5 h-5" />, title: "Venture Capital", desc: "Analisi deal flow, valutazioni e trend VC italiani ed europei" },
                  { icon: <Cpu className="w-5 h-5" />, title: "AI & Tech Trends", desc: "Ricerche su adozione AI, tecnologie emergenti e scenari futuri" },
                  { icon: <BarChart3 className="w-5 h-5" />, title: "Market Intelligence", desc: "Analisi competitive, sizing di mercato e opportunità di investimento" },
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <div className="text-[#00e5c8] mb-3">{item.icon}</div>
                    <p className="text-white font-bold text-sm mb-1">{item.title}</p>
                    <p className="text-white/60 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href="mailto:research@ideasmart.ai"
                  className="inline-flex items-center justify-center gap-2 bg-[#00e5c8] text-[#0a0f1e] px-6 py-3.5 rounded-xl font-black text-sm hover:bg-[#00b8a0] transition-colors">
                  <Mail className="w-4 h-4" />
                  research@ideasmart.ai
                </a>
                <a href="/business"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 text-white border border-white/20 px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-white/20 transition-colors">
                  Scopri IdeaSmart Business
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="bg-[#0a0f1e] text-white/40 text-center text-xs py-6 mt-8">
        © {new Date().getFullYear()} IDEASMART · La prima testata giornalistica AI italiana
      </div>
    </div>
  );
}
