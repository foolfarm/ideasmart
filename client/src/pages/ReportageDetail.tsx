/**
 * ReportageDetail — Pagina dettaglio reportage settimanale
 * Stile: prima pagina di giornale (bianco carta, inchiostro, SF Pro)
 */
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ExternalLink } from "lucide-react";
import RequireAuth from "@/components/RequireAuth";
import SaveArticleButton from "@/components/SaveArticleButton";

const SECTION_CONFIG = {
  ai: { label: "AI NEWS", color: "#0a7ea4", path: "/ai" },
  music: { label: "ITsMusic", color: "#2a2a2a", path: "/music" },
  startup: { label: "STARTUP NEWS", color: "#2a2a2a", path: "/startup" },
};

export default function ReportageDetail() {
  const params = useParams<{ section: string; id: string }>();
  const section = (params.section ?? "ai") as "ai" | "music" | "startup";
  const id = parseInt(params.id ?? "0");

  const { data: rep, isLoading } = trpc.reportage.getById.useQuery(
    { id },
    { enabled: !!id }
  );

  const cfg = SECTION_CONFIG[section] ?? SECTION_CONFIG.ai;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f9f6f0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono text-sm text-[#1a1a1a]/60 tracking-widest uppercase">Caricamento reportage…</p>
        </div>
      </div>
    );
  }

  if (!rep) {
    return (
      <div className="min-h-screen bg-[#f9f6f0] flex items-center justify-center">
        <div className="text-center">
          <p className="font-mono text-sm text-[#1a1a1a]/60 tracking-widest uppercase mb-4">Reportage non trovato</p>
          <Link href={cfg.path} className="text-sm underline" style={{ color: cfg.color }}>← Torna alla sezione</Link>
        </div>
      </div>
    );
  }

  const stats = [
    rep.stat1Value && rep.stat1Label ? { value: rep.stat1Value, label: rep.stat1Label } : null,
    rep.stat2Value && rep.stat2Label ? { value: rep.stat2Value, label: rep.stat2Label } : null,
    rep.stat3Value && rep.stat3Label ? { value: rep.stat3Value, label: rep.stat3Label } : null,
  ].filter(Boolean);

  const features = [rep.feature1, rep.feature2, rep.feature3, rep.feature4].filter(Boolean);

  return (
    <RequireAuth>
    <div className="min-h-screen bg-[#f9f6f0]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
      {/* Testata */}
      <header className="border-b-2 border-[#1a1a1a] bg-[#f9f6f0]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#1a1a1a] tracking-tight" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', serif" }}>
            IdeaSmart
          </Link>
          <span className="font-mono text-xs text-[#1a1a1a]/50 tracking-widest uppercase">
            {new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </span>
        </div>
        <div className="border-t border-[#1a1a1a]/20">
          <div className="max-w-4xl mx-auto px-4 py-1 flex gap-6">
            {Object.entries(SECTION_CONFIG).map(([key, s]) => (
              <Link key={key} href={s.path} className="font-mono text-xs tracking-widest uppercase py-1 hover:opacity-70 transition-opacity" style={{ color: key === section ? s.color : "#1a1a1a" }}>
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <Link href={cfg.path} className="inline-flex items-center gap-2 text-sm hover:opacity-70 transition-opacity" style={{ color: cfg.color }}>
          <ArrowLeft className="w-4 h-4" />
          <span className="font-mono tracking-widest uppercase text-xs">Torna a {cfg.label}</span>
        </Link>
      </div>

      {/* Articolo */}
      <article className="max-w-4xl mx-auto px-4 pb-16">
        {/* Label */}
        <div className="mb-4 flex items-center gap-3">
          <span className="font-mono text-xs tracking-widest uppercase px-2 py-1 border" style={{ color: cfg.color, borderColor: cfg.color }}>
            Reportage
          </span>
          <span className="font-mono text-xs text-[#1a1a1a]/50 tracking-widest uppercase">{rep.category}</span>
          <span className="font-mono text-xs text-[#1a1a1a]/40">Settimana {rep.weekLabel}</span>
        </div>

        {/* Azienda */}
        <p className="font-mono text-sm tracking-widest uppercase mb-2" style={{ color: cfg.color }}>{rep.startupName}</p>

        {/* Titolo */}
        <h1 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] leading-tight mb-4" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', serif" }}>
          {rep.headline}
        </h1>

        {/* Sottotitolo */}
        {rep.subheadline && (
          <p className="text-xl text-[#1a1a1a]/70 italic mb-6 leading-relaxed" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', serif" }}>
            {rep.subheadline}
          </p>
        )}

        {/* Salva + Firma autore */}
        <div className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b border-[#1a1a1a]/20">
          <SaveArticleButton contentType="reportage" contentId={rep.id} title={rep.headline} section={section} />
          <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>AL</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1a1a1a]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', serif" }}>Andrea Cinelli</p>
            <p className="font-mono text-xs text-[#1a1a1a]/50 tracking-widest uppercase">Direttore Editoriale</p>
          </div>
        </div>

        <div className="border-t border-[#1a1a1a]/20 mb-8" />

        {/* Immagine */}
        {rep.imageUrl && (
          <figure className="mb-8">
            <img src={rep.imageUrl} alt={rep.headline} loading="lazy" decoding="async" className="w-full h-64 md:h-80 object-cover" />
          </figure>
        )}

        {/* Statistiche */}
        {stats.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8 p-6 border border-[#1a1a1a]/10 bg-white">
            {stats.map((stat, i) => stat && (
              <div key={i} className="text-center">
                <p className="text-3xl font-bold" style={{ color: cfg.color, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', serif" }}>{stat.value}</p>
                <p className="font-mono text-xs text-[#1a1a1a]/60 tracking-widest uppercase mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Corpo del testo */}
        <div className="text-[#1a1a1a]/85 leading-relaxed mb-8">
          {rep.bodyText.split('\n\n').map((paragraph, i) => (
            <p key={i} className="mb-6 text-lg leading-relaxed">{paragraph}</p>
          ))}
        </div>

        {/* Quote */}
        {rep.quote && (
          <blockquote className="my-8 border-l-4 pl-6 py-2" style={{ borderColor: cfg.color }}>
            <p className="text-xl italic text-[#1a1a1a]/80 leading-relaxed" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', serif" }}>
              "{rep.quote}"
            </p>
          </blockquote>
        )}

        {/* Features */}
        {features.length > 0 && (
          <div className="mb-8">
            <h3 className="font-mono text-xs tracking-widest uppercase text-[#1a1a1a]/60 mb-4">Punti chiave</h3>
            <ul className="space-y-3">
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5" style={{ backgroundColor: cfg.color }}>{i + 1}</span>
                  <span className="text-[#1a1a1a]/80 leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA / Website */}
        {(rep.websiteUrl || rep.ctaUrl) && (
          <div className="mt-8 pt-6 border-t border-[#1a1a1a]/20">
            <a
              href={rep.ctaUrl ?? rep.websiteUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 text-white text-sm font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: cfg.color }}
            >
              {rep.ctaLabel ?? "Visita il sito"}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-[#1a1a1a]/20">
          {/* Pulsante Condividi su LinkedIn */}
          <div className="flex items-center justify-center mb-6">
            <button
              onClick={() => {
                const url = encodeURIComponent(window.location.href);
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=600,height=600');
              }}
              className="inline-flex items-center gap-3 px-6 py-3 font-bold text-sm uppercase tracking-widest transition-opacity hover:opacity-80"
              style={{ background: '#0A66C2', color: '#fff', fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              Condividi su LinkedIn
            </button>
          </div>
          <div className="flex items-center justify-between">
            <Link href={cfg.path} className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: cfg.color }}>
              <ArrowLeft className="w-4 h-4" />
              Torna a {cfg.label}
            </Link>
            <Link href="/" className="text-sm text-[#1a1a1a]/50 hover:text-[#1a1a1a] transition-colors font-mono tracking-widest uppercase text-xs">
              IdeaSmart Home
            </Link>
          </div>
        </div>
      </article>
    </div>
    </RequireAuth>
  );
}
