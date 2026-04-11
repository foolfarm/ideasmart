/**
 * ResearchDetail — Pagina dettaglio di una singola ricerca
 * Route: /research/:id
 * Protetta da RequireAuth (solo utenti loggati)
 */
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import RequireAuth from "@/components/RequireAuth";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import { useEffect, useRef } from "react";
import {
  ArrowLeft, ExternalLink, Globe, MapPin, BookOpen,
  TrendingUp, BarChart3, Cpu, Building2, DollarSign, Eye,
} from "lucide-react";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
const SF_DISPLAY = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";
const SF_SERIF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif";

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ReactNode; accentColor: string; bgColor: string }> = {
  startup:         { label: "Startup",         icon: <Building2 className="w-3.5 h-3.5" />,  accentColor: "#2a2a2a", bgColor: "#fff0e6" },
  venture_capital: { label: "Venture Capital", icon: <DollarSign className="w-3.5 h-3.5" />, accentColor: "#1a1a1a", bgColor: "#f0fdf4" },
  ai_trends:       { label: "AI Trends",       icon: <Cpu className="w-3.5 h-3.5" />,        accentColor: "#1a1a1a", bgColor: "#e6f4f1" },
  technology:      { label: "Tecnologia",      icon: <BarChart3 className="w-3.5 h-3.5" />,  accentColor: "#2a2a2a", bgColor: "#faf5ff" },
  market:          { label: "Mercati",         icon: <TrendingUp className="w-3.5 h-3.5" />, accentColor: "#1a1a1a", bgColor: "#eff6ff" },
};

const REGION_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  global: { label: "Globale", icon: <Globe className="w-3.5 h-3.5" /> },
  europe: { label: "Europa",  icon: <MapPin className="w-3.5 h-3.5" /> },
  italy:  { label: "Italia",  icon: <MapPin className="w-3.5 h-3.5" /> },
};

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  startup:         "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&q=80",
  venture_capital: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80",
  ai_trends:       "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&q=80",
  technology:      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80",
  market:          "https://images.unsplash.com/photo-1642790551116-18e150f248e3?w=1200&q=80",
};

function getCategoryConfig(cat: string) {
  return CATEGORY_CONFIG[cat] ?? { label: cat, icon: <BookOpen className="w-3.5 h-3.5" />, accentColor: "#1a1a1a", bgColor: "#f5f5f7" };
}

export default function ResearchDetail() {
  const [, params] = useRoute("/research/:id");
  const researchId = params?.id ? parseInt(params.id, 10) : null;

  const { data: report, isLoading } = trpc.news.getResearchById.useQuery(
    { id: researchId! },
    { enabled: !!researchId && !isNaN(researchId!) }
  );
  const trackView = trpc.news.trackResearchView.useMutation();
  const trackedRef = useRef(false);

  // Traccia la visualizzazione quando il report viene caricato (una sola volta)
  useEffect(() => {
    if (report && researchId && !trackedRef.current) {
      trackedRef.current = true;
      trackView.mutate({ id: researchId });
    }
  }, [report, researchId]);

  const catConfig = report ? getCategoryConfig(report.category) : null;
  const regionConfig = report ? (REGION_CONFIG[report.region] ?? { label: report.region, icon: <Globe className="w-3.5 h-3.5" /> }) : null;
  const imgUrl = report ? (report.imageUrl || CATEGORY_FALLBACK_IMAGES[report.category] || CATEGORY_FALLBACK_IMAGES["ai_trends"]) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: "#ffffff" }}>
        <SharedPageHeader />
        <div className="max-w-3xl mx-auto px-4 py-16 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#1a1a1a]/30 border-t-[#1a1a1a] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-[#1a1a1a]/50" style={{ fontFamily: SF }}>Caricamento ricerca…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen" style={{ background: "#ffffff" }}>
        <SharedPageHeader />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-black mb-3" style={{ fontFamily: SF_DISPLAY, color: "#1a1a1a" }}>
            Ricerca non trovata
          </h1>
          <p className="text-sm mb-6" style={{ fontFamily: SF_SERIF, color: "rgba(26,26,26,0.6)" }}>
            La ricerca che stai cercando non esiste o è stata rimossa.
          </p>
          <Link href="/research">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest cursor-pointer hover:opacity-70 transition-opacity" style={{ color: "#1a1a1a", fontFamily: SF }}>
              <ArrowLeft className="w-4 h-4" />
              Torna alle Ricerche
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <RequireAuth>
      <div className="min-h-screen" style={{ background: "#ffffff", color: "#1a1a1a" }}>
        <SharedPageHeader />

        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Link href="/research">
            <span
              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest mb-6 cursor-pointer hover:opacity-70 transition-opacity"
              style={{ color: "rgba(26,26,26,0.45)", fontFamily: SF }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Tutte le Ricerche
            </span>
          </Link>

          {/* Badge categoria + regione */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {catConfig && (
              <span
                className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1"
                style={{ color: catConfig.accentColor, background: catConfig.bgColor, fontFamily: SF }}
              >
                {catConfig.icon} {catConfig.label}
              </span>
            )}
            {regionConfig && (
              <span
                className="inline-flex items-center gap-1.5 text-[10px] text-[#1a1a1a]/50 uppercase tracking-widest"
                style={{ fontFamily: SF }}
              >
                {regionConfig.icon} {regionConfig.label}
              </span>
            )}
            {report.isResearchOfDay && (
              <span
                className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5"
                style={{ background: "#1a1a1a", color: "#ffffff", fontFamily: SF }}
              >
                ★ Ricerca del Giorno
              </span>
            )}
          </div>

          {/* Titolo */}
          <h1
            className="text-3xl md:text-4xl font-black leading-tight mb-4"
            style={{ fontFamily: SF_DISPLAY, letterSpacing: "-0.02em", color: "#1a1a1a" }}
          >
            {report.title}
          </h1>

          {/* Meta: fonte + data + views */}
          <div className="flex flex-wrap items-center gap-3 mb-6 pb-5 border-b border-[#1a1a1a]/10">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(26,26,26,0.5)", fontFamily: SF }}>
              {report.source}
            </span>
            <span className="text-[#1a1a1a]/20 text-[10px]">·</span>
            <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(26,26,26,0.4)", fontFamily: SF }}>
              {report.dateLabel}
            </span>
            {report.viewCount > 0 && (
              <>
                <span className="text-[#1a1a1a]/20 text-[10px]">·</span>
                <span className="inline-flex items-center gap-1 text-[10px]" style={{ color: "rgba(26,26,26,0.35)", fontFamily: SF }}>
                  <Eye className="w-3 h-3" /> {report.viewCount.toLocaleString("it-IT")} letture
                </span>
              </>
            )}
          </div>

          {/* Immagine hero */}
          {imgUrl && (
            <div className="mb-8 overflow-hidden" style={{ maxHeight: "380px" }}>
              <img src={imgUrl} alt={report.title} className="w-full h-full object-cover" style={{ maxHeight: "380px" }} />
            </div>
          )}

          {/* Sommario */}
          <p
            className="text-lg leading-relaxed mb-8"
            style={{ fontFamily: SF_SERIF, color: "rgba(26,26,26,0.8)", lineHeight: "1.8" }}
          >
            {report.summary}
          </p>

          {/* Key Findings */}
          {report.keyFindings.length > 0 && (
            <div className="border-2 border-[#1a1a1a] p-6 mb-8" style={{ background: "#f5f5f7" }}>
              <p
                className="text-[10px] font-black uppercase tracking-[0.3em] mb-5"
                style={{ color: catConfig?.accentColor ?? "#1a1a1a", fontFamily: SF }}
              >
                Key Findings
              </p>
              <ol className="space-y-4">
                {(report.keyFindings as string[]).map((finding, i) => (
                  <li key={i} className="flex gap-4">
                    <span
                      className="text-2xl font-black shrink-0 leading-none mt-0.5"
                      style={{ color: catConfig?.accentColor ?? "#1a1a1a", fontFamily: SF_DISPLAY, opacity: 0.3 }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p
                      className="text-base leading-relaxed"
                      style={{ fontFamily: SF_SERIF, color: "rgba(26,26,26,0.8)" }}
                    >
                      {finding}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Link fonte originale */}
          {report.sourceUrl && (
            <div className="border border-[#1a1a1a]/15 p-4 flex items-center justify-between mb-8" style={{ background: "#ffffff" }}>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "rgba(26,26,26,0.4)", fontFamily: SF }}>
                  Fonte originale
                </p>
                <p className="text-sm font-semibold" style={{ color: "#1a1a1a", fontFamily: SF }}>
                  {report.source}
                </p>
              </div>
              <a
                href={report.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-4 py-2 hover:opacity-80 transition-opacity"
                style={{ background: "#1a1a1a", color: "#ffffff", fontFamily: SF }}
              >
                Leggi la fonte <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* CTA bottom */}
          <div className="border-t-2 border-[#1a1a1a] pt-8 mt-8 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3" style={{ color: "rgba(26,26,26,0.4)", fontFamily: SF }}>
              Hai bisogno di una ricerca dedicata?
            </p>
            <h3 className="text-xl font-black mb-2" style={{ fontFamily: SF_DISPLAY, color: "#1a1a1a" }}>
              Proof Press Research
            </h3>
            <p className="text-sm mb-5 max-w-md mx-auto" style={{ fontFamily: SF_SERIF, color: "rgba(26,26,26,0.6)" }}>
              Analisi su misura su venture capital, AI trend e investimenti tecnologici per il tuo business.
            </p>
            <a
              href="mailto:research@ideasmart.biz"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-6 py-3 hover:opacity-80 transition-opacity"
              style={{ background: "#1a1a1a", color: "#ffffff", fontFamily: SF }}
            >
              Contatta il team Research →
            </a>
          </div>
        </div>

        <SharedPageFooter />
      </div>
    </RequireAuth>
  );
}
