/**
 * RicercaDelGiorno — Blocco homepage per IDEASMART Research
 * Stile uniforme al tema editoriale della Home: sfondo carta #faf8f3, inchiostro #1a1a2e
 */
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ArrowRight, BookOpen, Globe, MapPin, TrendingUp, Cpu, BarChart3, Building2, DollarSign, FlaskConical } from "lucide-react";

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ReactNode; accentColor: string; bgColor: string }> = {
  startup:        { label: "Startup",        icon: <Building2 className="w-3 h-3" />,  accentColor: "#c2410c", bgColor: "#fff0e6" },
  venture_capital:{ label: "Venture Capital",icon: <DollarSign className="w-3 h-3" />, accentColor: "#15803d", bgColor: "#f0fdf4" },
  ai_trends:      { label: "AI Trends",      icon: <Cpu className="w-3 h-3" />,        accentColor: "#0a6e5c", bgColor: "#e6f4f1" },
  technology:     { label: "Tecnologia",     icon: <BarChart3 className="w-3 h-3" />,  accentColor: "#7c3aed", bgColor: "#faf5ff" },
  market:         { label: "Mercati",        icon: <TrendingUp className="w-3 h-3" />, accentColor: "#0369a1", bgColor: "#eff6ff" },
};

const REGION_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  global: { label: "Globale", icon: <Globe className="w-3 h-3" /> },
  europe: { label: "Europa",  icon: <MapPin className="w-3 h-3" /> },
  italy:  { label: "Italia",  icon: <MapPin className="w-3 h-3" /> },
};

function getCategoryConfig(cat: string) {
  return CATEGORY_CONFIG[cat] ?? { label: cat, icon: <BookOpen className="w-3 h-3" />, accentColor: "#1a1a2e", bgColor: "#f5f2ec" };
}

export default function RicercaDelGiorno() {
  const { data: report, isLoading } = trpc.news.getResearchOfDay.useQuery();

  if (isLoading) {
    return (
      <section className="border-t-2 border-[#1a1a2e] py-5">
        <div className="animate-pulse">
          <div className="h-4 bg-[#1a1a2e]/10 rounded w-48 mb-4" />
          <div className="h-32 bg-[#1a1a2e]/5 rounded" />
        </div>
      </section>
    );
  }

  if (!report) return null;

  const catConfig = getCategoryConfig(report.category);
  const regionConfig = REGION_CONFIG[report.region] ?? { label: report.region, icon: <Globe className="w-3 h-3" /> };
  const keyFindings = Array.isArray(report.keyFindings) ? report.keyFindings : [];

  return (
    <section className="border-t-2 border-[#1a1a2e] py-5">
      {/* Header sezione — stile etichetta editoriale */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.25em]"
            style={{ color: "#1a1a2e", fontFamily: "'Space Mono', monospace" }}
          >
            ● IDEASMART Research
          </span>
          <span
            className="text-[10px] uppercase tracking-widest text-[#1a1a2e]/40"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            — Ricerca del Giorno
          </span>
        </div>
        <Link
          href="/research"
          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#1a1a2e]/50 hover:text-[#1a1a2e] transition-colors"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          Tutte le ricerche <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Card editoriale — sfondo carta, bordo inchiostro */}
      <div
        className="border border-[#1a1a2e]/20 overflow-hidden"
        style={{ background: "#f5f2ec" }}
      >
        {/* Intestazione colorata per categoria */}
        <div
          className="px-5 py-2 flex items-center gap-2 border-b border-[#1a1a2e]/10"
          style={{ background: catConfig.bgColor }}
        >
          <FlaskConical className="w-3.5 h-3.5" style={{ color: catConfig.accentColor }} />
          <span
            className="text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: catConfig.accentColor, fontFamily: "'Space Mono', monospace" }}
          >
            {catConfig.label}
          </span>
          <span
            className="ml-auto text-[10px] text-[#1a1a2e]/40"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            {report.dateLabel}
          </span>
        </div>

        <div className="p-5 md:p-6">
          {/* Meta badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border"
              style={{
                color: catConfig.accentColor,
                borderColor: catConfig.accentColor,
                background: catConfig.bgColor,
                fontFamily: "'Space Mono', monospace"
              }}
            >
              {catConfig.icon} {catConfig.label}
            </span>
            <span
              className="inline-flex items-center gap-1 text-[10px] text-[#1a1a2e]/50 uppercase tracking-widest"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {regionConfig.icon} {regionConfig.label}
            </span>
            <span
              className="inline-flex items-center gap-1 text-[10px] text-[#1a1a2e]/50 uppercase tracking-widest"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              <BookOpen className="w-3 h-3" /> {report.source}
            </span>
          </div>

          {/* Titolo — stile titolo editoriale */}
          <h3
            className="text-[#1a1a2e] font-black text-xl md:text-2xl leading-tight mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {report.title}
          </h3>

          {/* Sommario */}
          <p
            className="text-[#1a1a2e]/70 text-sm leading-relaxed mb-4 line-clamp-3"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
          >
            {report.summary}
          </p>

          {/* Key Findings */}
          {keyFindings.length > 0 && (
            <div
              className="border border-[#1a1a2e]/15 p-4 mb-4"
              style={{ background: "#faf8f3" }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2"
                style={{ color: catConfig.accentColor, fontFamily: "'Space Mono', monospace" }}
              >
                Key Findings
              </p>
              <ul className="space-y-1.5">
                {keyFindings.slice(0, 3).map((f: string, i: number) => (
                  <li key={i} className="flex gap-2 text-[#1a1a2e]/70 text-xs leading-relaxed"
                    style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                    <span
                      className="font-black shrink-0"
                      style={{ color: catConfig.accentColor, fontFamily: "'Space Mono', monospace" }}
                    >
                      {i + 1}.
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA */}
          <Link
            href="/research"
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-4 py-2 border-2 border-[#1a1a2e] text-[#1a1a2e] hover:bg-[#1a1a2e] hover:text-[#faf8f3] transition-colors"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Tutte le ricerche di oggi <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}
