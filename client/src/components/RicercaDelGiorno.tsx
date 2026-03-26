/**
 * RicercaDelGiorno — Blocco homepage per IDEASMART Research
 * Mostra la ricerca del giorno con link alla pagina /research
 */
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Microscope, ExternalLink, ArrowRight, BookOpen, Globe, MapPin, TrendingUp, Cpu, BarChart3, Building2, DollarSign } from "lucide-react";

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  startup: { label: "Startup", icon: <Building2 className="w-3 h-3" />, color: "text-orange-600 bg-orange-50 border-orange-200" },
  venture_capital: { label: "Venture Capital", icon: <DollarSign className="w-3 h-3" />, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  ai_trends: { label: "AI Trends", icon: <Cpu className="w-3 h-3" />, color: "text-cyan-600 bg-cyan-50 border-cyan-200" },
  technology: { label: "Tecnologia", icon: <BarChart3 className="w-3 h-3" />, color: "text-violet-600 bg-violet-50 border-violet-200" },
  market: { label: "Mercati", icon: <TrendingUp className="w-3 h-3" />, color: "text-blue-600 bg-blue-50 border-blue-200" },
};

const REGION_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  global: { label: "Globale", icon: <Globe className="w-3 h-3" /> },
  europe: { label: "Europa", icon: <MapPin className="w-3 h-3" /> },
  italy: { label: "Italia", icon: <MapPin className="w-3 h-3" /> },
};

function getCategoryConfig(cat: string) {
  return CATEGORY_CONFIG[cat] ?? { label: cat, icon: <BookOpen className="w-3 h-3" />, color: "text-gray-600 bg-gray-50 border-gray-200" };
}

export default function RicercaDelGiorno() {
  const { data: report, isLoading } = trpc.news.getResearchOfDay.useQuery();

  if (isLoading) {
    return (
      <section className="border-t border-[#1a1a2e]/10 py-8">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-40 mb-4" />
          <div className="h-40 bg-gray-100 rounded-xl" />
        </div>
      </section>
    );
  }

  if (!report) return null;

  const catConfig = getCategoryConfig(report.category);
  const regionConfig = REGION_CONFIG[report.region] ?? { label: report.region, icon: <Globe className="w-3 h-3" /> };
  const keyFindings = Array.isArray(report.keyFindings) ? report.keyFindings : [];

  return (
    <section className="border-t border-[#1a1a2e]/10 py-8">
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#0a0f1e] rounded flex items-center justify-center">
            <Microscope className="w-3.5 h-3.5 text-[#00e5c8]" />
          </div>
          <h2 className="font-black text-[#0a0f1e] text-sm uppercase tracking-widest">
            IDEASMART Research
          </h2>
          <span className="text-[#0a0f1e]/30 text-xs font-mono">— Ricerca del Giorno</span>
        </div>
        <Link href="/research"
          className="flex items-center gap-1 text-xs font-semibold text-[#0a0f1e]/50 hover:text-[#00b8a0] transition-colors">
          Tutte le ricerche <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Card */}
      <div className="bg-[#0a0f1e] rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#00e5c8] to-[#00b8a0] px-5 py-2 flex items-center gap-2">
          <Microscope className="w-4 h-4 text-[#0a0f1e]" />
          <span className="text-[#0a0f1e] font-black text-xs tracking-widest uppercase">Ricerca del Giorno</span>
          <span className="ml-auto text-[#0a0f1e]/60 text-xs font-mono">{report.dateLabel}</span>
        </div>

        <div className="p-5 md:p-6">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${catConfig.color}`}>
              {catConfig.icon} {catConfig.label}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/70 border border-white/20">
              {regionConfig.icon} {regionConfig.label}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/70 border border-white/20">
              <BookOpen className="w-3 h-3" /> {report.source}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-white font-black text-xl md:text-2xl leading-tight mb-3">
            {report.title}
          </h3>

          {/* Summary */}
          <p className="text-white/70 text-sm leading-relaxed mb-4 line-clamp-3">
            {report.summary}
          </p>

          {/* Key Findings (max 3) */}
          {keyFindings.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
              <p className="text-[#00e5c8] font-bold text-xs uppercase tracking-wider mb-2">Key Findings</p>
              <ul className="space-y-1.5">
                {keyFindings.slice(0, 3).map((f: string, i: number) => (
                  <li key={i} className="flex gap-2 text-white/70 text-xs leading-relaxed">
                    <span className="text-[#00e5c8] font-black shrink-0">{i + 1}.</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA */}
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/research"
              className="inline-flex items-center gap-1.5 bg-[#00e5c8] text-[#0a0f1e] px-4 py-2 rounded-lg font-black text-xs hover:bg-[#00b8a0] transition-colors">
              Tutte le ricerche di oggi <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            {report.sourceUrl && (
              <a href={report.sourceUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-xs font-semibold">
                Fonte originale <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
