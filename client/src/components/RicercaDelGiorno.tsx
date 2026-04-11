/**
 * RicercaDelGiorno — Blocco homepage per IDEASMART Research
 * Stile editoriale premium: sfondo carta #ffffff, inchiostro #1a1a1a
 * Layout a doppia colonna con immagine tematica + contenuto
 */
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import {
  ArrowRight, BookOpen, Globe, MapPin, TrendingUp, Cpu,
  BarChart3, Building2, DollarSign, FlaskConical, ExternalLink
} from "lucide-react";

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ReactNode; accentColor: string; bgColor: string }> = {
  startup:         { label: "Startup",         icon: <Building2 className="w-3 h-3" />,  accentColor: "#2a2a2a", bgColor: "#fff0e6" },
  venture_capital: { label: "Venture Capital", icon: <DollarSign className="w-3 h-3" />, accentColor: "#1a1a1a", bgColor: "#f0fdf4" },
  ai_trends:       { label: "AI Trends",       icon: <Cpu className="w-3 h-3" />,        accentColor: "#1a1a1a", bgColor: "#e6f4f1" },
  technology:      { label: "Tecnologia",      icon: <BarChart3 className="w-3 h-3" />,  accentColor: "#2a2a2a", bgColor: "#faf5ff" },
  market:          { label: "Mercati",         icon: <TrendingUp className="w-3 h-3" />, accentColor: "#1a1a1a", bgColor: "#eff6ff" },
};

const REGION_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  global: { label: "Globale", icon: <Globe className="w-3 h-3" /> },
  europe: { label: "Europa",  icon: <MapPin className="w-3 h-3" /> },
  italy:  { label: "Italia",  icon: <MapPin className="w-3 h-3" /> },
};

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  startup:         "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80",
  venture_capital: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80",
  ai_trends:       "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80",
  technology:      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
  market:          "https://images.unsplash.com/photo-1642790551116-18e150f248e3?w=600&q=80",
};

function getCategoryConfig(cat: string) {
  return CATEGORY_CONFIG[cat] ?? { label: cat, icon: <BookOpen className="w-3 h-3" />, accentColor: "#1a1a1a", bgColor: "#f5f5f7" };
}

function getImageUrl(category: string, imageUrl?: string | null): string {
  return imageUrl || CATEGORY_FALLBACK_IMAGES[category] || CATEGORY_FALLBACK_IMAGES["ai_trends"];
}

export default function RicercaDelGiorno() {
  const { data: report, isLoading } = trpc.news.getResearchOfDay.useQuery();

  if (isLoading) {
    return (
      <section className="border-t-2 border-[#1a1a1a] py-5">
        <div className="animate-pulse">
          <div className="h-4 bg-[#1a1a1a]/10 rounded w-64 mb-4" />
          <div className="h-52 bg-[#1a1a1a]/5 border border-[#1a1a1a]/10" />
        </div>
      </section>
    );
  }

  if (!report) return null;

  const catConfig = getCategoryConfig(report.category);
  const regionConfig = REGION_CONFIG[report.region] ?? { label: report.region, icon: <Globe className="w-3 h-3" /> };
  const keyFindings = Array.isArray(report.keyFindings) ? report.keyFindings : [];
  const imgUrl = getImageUrl(report.category, (report as any).imageUrl);

  return (
    <section className="border-t-2 border-[#1a1a1a] pt-5 pb-6">

      {/* ── Intestazione sezione editoriale ─────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-3.5 h-3.5" style={{ color: "#1a1a1a" }} />
          <span
            className="text-[10px] font-black uppercase tracking-[0.28em] text-[#1a1a1a]"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
          >
            Proof Press
          </span>
          <span
            className="text-[10px] uppercase tracking-widest text-[#1a1a1a]/40"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
          >
            — La ricerca del giorno
          </span>
        </div>
        <Link
          href="/research"
          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#1a1a1a]/40 hover:text-[#1a1a1a] transition-colors"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
        >
          Tutte le ricerche <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* ── Sottotitolo sezione ──────────────────────────────────────────── */}
      <p
        className="text-[11px] text-[#1a1a1a]/50 mb-4 leading-relaxed"
        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}
      >
        Analisi quotidiane su Startup, Venture Capital e AI Trends — dati dalle principali fonti di ricerca globali ed europee.
      </p>

      {/* ── Card editoriale premium ──────────────────────────────────────── */}
      <div
        className="border border-[#e5e5ea] overflow-hidden"
        style={{ background: "#f5f5f7" }}
      >
        {/* Striscia categoria colorata */}
        <div
          className="px-5 py-2 flex items-center gap-2 border-b-2 border-[#1a1a1a]"
          style={{ background: "#1a1a1a" }}
        >
          <FlaskConical className="w-3.5 h-3.5" style={{ color: "#ffffff" }} />
          <span
            className="text-[10px] font-bold uppercase tracking-[0.22em]"
            style={{ color: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
          >
            Ricerca del Giorno
          </span>
          <span
            className="ml-2 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5"
            style={{ color: catConfig.accentColor, background: catConfig.bgColor, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
          >
            {catConfig.icon} {catConfig.label}
          </span>
          <span
            className="ml-auto text-[9px] text-[#ffffff]/50"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
          >
            {report.dateLabel}
          </span>
        </div>

        {/* Layout a due colonne: immagine + contenuto */}
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr]">

          {/* Immagine tematica */}
          <div className="relative overflow-hidden" style={{ minHeight: "200px" }}>
            <img
              src={imgUrl}
              alt={report.title}
              className="w-full h-full object-cover"
              style={{ minHeight: "200px" }}
            />
            {/* Overlay gradiente */}
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to right, transparent 60%, #f5f5f7)" }}
            />
            {/* Badge fonte */}
            <div className="absolute bottom-3 left-3">
              <span
                className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-1"
                style={{ background: "rgba(26,26,46,0.85)", color: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              >
                <BookOpen className="w-2.5 h-2.5" /> {report.source}
              </span>
            </div>
          </div>

          {/* Contenuto */}
          <div className="p-5 md:p-6">
            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span
                className="inline-flex items-center gap-1 text-[9px] text-[#1a1a1a]/50 uppercase tracking-widest"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              >
                {regionConfig.icon} {regionConfig.label}
              </span>
              <span className="text-[#1a1a1a]/20 text-[9px]">·</span>
              <span
                className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 border"
                style={{
                  color: catConfig.accentColor,
                  borderColor: catConfig.accentColor + "60",
                  background: catConfig.bgColor,
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif"
                }}
              >
                {catConfig.icon} {catConfig.label}
              </span>
            </div>

            {/* Titolo */}
            <h3
              className="text-[#1a1a1a] font-black text-xl md:text-2xl leading-tight mb-3"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
            >
              {report.title}
            </h3>

            {/* Sommario */}
            <p
              className="text-[#1a1a1a]/65 text-sm leading-relaxed mb-4 line-clamp-2"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}
            >
              {report.summary}
            </p>

            {/* Key Findings — max 3 */}
            {keyFindings.length > 0 && (
              <div
                className="border border-[#1a1a1a]/12 p-3.5 mb-4"
                style={{ background: "#ffffff" }}
              >
                <p
                  className="text-[9px] font-bold uppercase tracking-[0.22em] mb-2"
                  style={{ color: catConfig.accentColor, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                >
                  Key Findings
                </p>
                <ul className="space-y-1.5">
                  {keyFindings.slice(0, 3).map((f: string, i: number) => (
                    <li
                      key={i}
                      className="flex gap-2 text-[#1a1a1a]/65 text-xs leading-relaxed"
                      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}
                    >
                      <span
                        className="font-black shrink-0 text-[10px]"
                        style={{ color: catConfig.accentColor, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                      >
                        {i + 1}.
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA doppia */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/research"
                className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest px-4 py-2 border border-[#e5e5ea] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-[#ffffff] transition-colors"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              >
                Tutte le ricerche di oggi <ArrowRight className="w-3 h-3" />
              </Link>
              {report.sourceUrl && (
                <a
                  href={report.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[9px] uppercase tracking-widest text-[#1a1a1a]/35 hover:text-[#1a1a1a] transition-colors"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                >
                  Fonte <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
