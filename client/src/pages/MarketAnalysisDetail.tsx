/**
 * MarketAnalysisDetail — Pagina dettaglio analisi di mercato
 */
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ExternalLink, TrendingUp } from "lucide-react";

const SECTION_CONFIG = {
  ai: { label: "AI4Business", color: "#0a7ea4", path: "/ai" },
  music: { label: "ITsMusic", color: "#7c3aed", path: "/music" },
  startup: { label: "Startup News", color: "#ea580c", path: "/startup" },
};

export default function MarketAnalysisDetail() {
  const params = useParams<{ section: string; id: string }>();
  const section = (params.section ?? "ai") as "ai" | "music" | "startup";
  const id = parseInt(params.id ?? "0");

  const { data: analysis, isLoading } = trpc.marketAnalysis.getById.useQuery({ id }, { enabled: !!id });
  const cfg = SECTION_CONFIG[section] ?? SECTION_CONFIG.ai;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f9f6f0] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1a2744] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-[#f9f6f0] flex items-center justify-center">
        <div className="text-center">
          <p className="font-mono text-sm text-[#1a2744]/60 tracking-widest uppercase mb-4">Analisi non trovata</p>
          <Link href={cfg.path} className="text-sm underline" style={{ color: cfg.color }}>← Torna alla sezione</Link>
        </div>
      </div>
    );
  }

  const dataPoints = [analysis.dataPoint1, analysis.dataPoint2, analysis.dataPoint3].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#f9f6f0]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <header className="border-b-2 border-[#1a2744] bg-[#f9f6f0]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#1a2744] tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>IdeaSmart</Link>
          <span className="font-mono text-xs text-[#1a2744]/50 tracking-widest uppercase">
            {new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </span>
        </div>
        <div className="border-t border-[#1a2744]/20">
          <div className="max-w-4xl mx-auto px-4 py-1 flex gap-6">
            {Object.entries(SECTION_CONFIG).map(([key, s]) => (
              <Link key={key} href={s.path} className="font-mono text-xs tracking-widest uppercase py-1 hover:opacity-70 transition-opacity" style={{ color: key === section ? s.color : "#1a2744" }}>{s.label}</Link>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4">
        <Link href={cfg.path} className="inline-flex items-center gap-2 text-sm hover:opacity-70 transition-opacity" style={{ color: cfg.color }}>
          <ArrowLeft className="w-4 h-4" />
          <span className="font-mono tracking-widest uppercase text-xs">Torna a {cfg.label}</span>
        </Link>
      </div>

      <article className="max-w-4xl mx-auto px-4 pb-16">
        <div className="mb-4 flex items-center gap-3">
          <span className="font-mono text-xs tracking-widest uppercase px-2 py-1 border" style={{ color: cfg.color, borderColor: cfg.color }}>Analisi di Mercato</span>
          <span className="font-mono text-xs text-[#1a2744]/50 tracking-widest uppercase">{analysis.category}</span>
          <span className="font-mono text-xs text-[#1a2744]/40">{analysis.source}</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-[#1a2744] leading-tight mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          {analysis.title}
        </h1>

        {analysis.subtitle && (
          <p className="text-xl text-[#1a2744]/70 italic mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>{analysis.subtitle}</p>
        )}

        {/* Firma autore */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#1a2744]/20">
          <div className="w-8 h-8 rounded-full bg-[#1a2744] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold" style={{ fontFamily: "'Space Mono', monospace" }}>AL</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1a2744]" style={{ fontFamily: "'Playfair Display', serif" }}>Andrea Cinelli</p>
            <p className="font-mono text-xs text-[#1a2744]/50 tracking-widest uppercase">Direttore Editoriale</p>
          </div>
        </div>

        <div className="border-t border-[#1a2744]/20 mb-8" />

        {/* KPI */}
        {(analysis.marketSize || analysis.growthRate) && (
          <div className="grid grid-cols-2 gap-4 mb-8 p-6 border border-[#1a2744]/10 bg-white">
            {analysis.marketSize && (
              <div className="text-center">
                <p className="text-3xl font-bold" style={{ color: cfg.color, fontFamily: "'Playfair Display', serif" }}>{analysis.marketSize}</p>
                <p className="font-mono text-xs text-[#1a2744]/60 tracking-widest uppercase mt-1">Dimensione Mercato</p>
              </div>
            )}
            {analysis.growthRate && (
              <div className="text-center">
                <p className="text-3xl font-bold" style={{ color: cfg.color, fontFamily: "'Playfair Display', serif" }}>{analysis.growthRate}</p>
                <p className="font-mono text-xs text-[#1a2744]/60 tracking-widest uppercase mt-1">Tasso di Crescita</p>
              </div>
            )}
          </div>
        )}

        {/* Sommario */}
        <div className="mb-8">
          {analysis.summary.split('\n\n').map((p, i) => (
            <p key={i} className="mb-6 text-lg leading-relaxed text-[#1a2744]/85">{p}</p>
          ))}
        </div>

        {/* Key Insight */}
        {analysis.keyInsight && (
          <blockquote className="my-8 border-l-4 pl-6 py-2" style={{ borderColor: cfg.color }}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" style={{ color: cfg.color }} />
              <span className="font-mono text-xs tracking-widest uppercase" style={{ color: cfg.color }}>Key Insight</span>
            </div>
            <p className="text-lg italic text-[#1a2744]/80" style={{ fontFamily: "'Playfair Display', serif" }}>{analysis.keyInsight}</p>
          </blockquote>
        )}

        {/* Data Points */}
        {dataPoints.length > 0 && (
          <div className="mb-8">
            <h3 className="font-mono text-xs tracking-widest uppercase text-[#1a2744]/60 mb-4">Dati chiave</h3>
            <ul className="space-y-3">
              {dataPoints.map((dp, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: cfg.color }} />
                  <span className="text-[#1a2744]/80 leading-relaxed">{dp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Rilevanza Italia */}
        {analysis.italyRelevance && (
          <div className="mb-8 p-6 border border-[#1a2744]/10 bg-white">
            <h3 className="font-mono text-xs tracking-widest uppercase text-[#1a2744]/60 mb-3">Rilevanza per l'Italia</h3>
            <p className="text-[#1a2744]/80 leading-relaxed">{analysis.italyRelevance}</p>
          </div>
        )}

        {/* Fonte */}
        {analysis.sourceUrl && (
          <div className="mt-8 pt-6 border-t border-[#1a2744]/20">
            <a href={analysis.sourceUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm hover:opacity-70 transition-opacity" style={{ color: cfg.color }}>
              <ExternalLink className="w-4 h-4" />
              Fonte: {analysis.source}
            </a>
          </div>
        )}

        <div className="mt-12 pt-6 border-t border-[#1a2744]/20">
          {/* Pulsante Condividi su LinkedIn */}
          <div className="flex items-center justify-center mb-6">
            <button
              onClick={() => {
                const url = encodeURIComponent(window.location.href);
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=600,height=600');
              }}
              className="inline-flex items-center gap-3 px-6 py-3 font-bold text-sm uppercase tracking-widest transition-opacity hover:opacity-80"
              style={{ background: '#0A66C2', color: '#fff', fontFamily: "'Space Mono', monospace" }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              Condividi su LinkedIn
            </button>
          </div>
          <div className="flex items-center justify-between">
            <Link href={cfg.path} className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: cfg.color }}>
              <ArrowLeft className="w-4 h-4" />Torna a {cfg.label}
            </Link>
            <Link href="/" className="text-sm text-[#1a2744]/50 hover:text-[#1a2744] transition-colors font-mono tracking-widest uppercase text-xs">IdeaSmart Home</Link>
          </div>
        </div>
      </article>
    </div>
  );
}
