/**
 * EditorialDetail — Pagina dettaglio editoriale del giorno
 * Stile: prima pagina di giornale (bianco carta, inchiostro, SF Pro)
 */
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Calendar, TrendingUp } from "lucide-react";
import RequireAuth from "@/components/RequireAuth";
import SaveArticleButton from "@/components/SaveArticleButton";

const SECTION_CONFIG = {
  ai: { label: "AI NEWS", color: "#0a7ea4", path: "/ai" },
  startup: { label: "STARTUP NEWS", color: "#2a2a2a", path: "/startup" }
};

export default function EditorialDetail() {
  const params = useParams<{ section: string; id: string }>();
  const section = (params.section ?? "ai") as "ai" | "startup";
  const id = parseInt(params.id ?? "0");

  const { data: editorial, isLoading } = trpc.editorial.getById.useQuery(
    { id },
    { enabled: !!id }
  );

  const cfg = SECTION_CONFIG[section] ?? SECTION_CONFIG.ai;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#ffffff] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono text-sm text-[#1a1a1a]/60 tracking-widest uppercase">Caricamento editoriale…</p>
        </div>
      </div>
    );
  }

  if (!editorial) {
    return (
      <div className="min-h-screen bg-[#ffffff] flex items-center justify-center">
        <div className="text-center">
          <p className="font-mono text-sm text-[#1a1a1a]/60 tracking-widest uppercase mb-4">Editoriale non trovato</p>
          <Link href={cfg.path} className="text-sm underline" style={{ color: cfg.color }}>← Torna alla sezione</Link>
        </div>
      </div>
    );
  }

  return (
    <RequireAuth>
    <div className="min-h-screen bg-[#ffffff]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
      {/* Testata */}
      <header className="border-b-2 border-[#1a1a1a] bg-[#ffffff]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#1a1a1a] tracking-tight" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', serif" }}>
            Proof Press
          </Link>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-[#1a1a1a]/50 tracking-widest uppercase">
              {new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
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
        {/* Label sezione */}
        <div className="mb-4">
          <span className="font-mono text-xs tracking-widest uppercase px-2 py-1 border" style={{ color: cfg.color, borderColor: cfg.color }}>
            Editoriale del Giorno
          </span>
        </div>

        {/* Titolo */}
        <h1 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] leading-tight mb-4" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', serif" }}>
          {editorial.title}
        </h1>

        {/* Sottotitolo */}
        {editorial.subtitle && (
          <p className="text-xl text-[#1a1a1a]/70 italic mb-6 leading-relaxed" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', serif" }}>
            {editorial.subtitle}
          </p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 mb-8 pb-4 border-b border-[#1a1a1a]/20">
          <SaveArticleButton contentType="editorial" contentId={editorial.id} title={editorial.title} section={section} />
          {/* Firma autore */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center">
              <span className="text-white text-xs font-bold" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>AL</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1a1a1a]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', serif" }}>Adrian Lenice</p>
              <p className="font-mono text-xs text-[#1a1a1a]/50 tracking-widest uppercase">Tech Editor</p>
            </div>
          </div>
          <div className="w-px h-8 bg-[#1a1a1a]/20 hidden sm:block" />
          <div className="flex items-center gap-2 text-sm text-[#1a1a1a]/60">
            <Calendar className="w-4 h-4" />
            <span className="font-mono">{editorial.dateLabel}</span>
          </div>
          {editorial.keyTrend && (
            <div className="flex items-center gap-2 text-sm" style={{ color: cfg.color }}>
              <TrendingUp className="w-4 h-4" />
              <span className="font-mono text-xs tracking-widest uppercase">Trend: {editorial.keyTrend}</span>
            </div>
          )}
        </div>

        {/* Immagine */}
        {editorial.imageUrl && (
          <figure className="mb-8">
            <img src={editorial.imageUrl} alt={editorial.title} loading="lazy" decoding="async" className="w-full h-64 md:h-96 object-cover" />
          </figure>
        )}

        {/* Corpo del testo */}
        <div className="prose prose-lg max-w-none text-[#1a1a1a]/85 leading-relaxed">
          {editorial.body.split('\n\n').map((paragraph, i) => (
            <p key={i} className="mb-6 text-lg leading-relaxed" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
              {paragraph}
            </p>
          ))}
        </div>

        {/* Nota dell'autore */}
        {editorial.authorNote && (
          <blockquote className="mt-10 border-l-4 pl-6 py-2" style={{ borderColor: cfg.color }}>
            <p className="text-base italic text-[#1a1a1a]/70 leading-relaxed" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', serif" }}>
              {editorial.authorNote}
            </p>
          </blockquote>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-[#1a1a1a]/20">
          {/* Pulsante Condividi su LinkedIn */}
          <div className="flex items-center justify-center mb-6">
            <button
              onClick={() => {
                const url = encodeURIComponent(window.location.href);
                const text = encodeURIComponent(`${editorial.title} — Analisi Proof Press`);
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`, '_blank', 'width=600,height=600');
              }}
              className="inline-flex items-center gap-3 px-6 py-3 font-bold text-sm uppercase tracking-widest transition-opacity hover:opacity-80"
              style={{ background: '#0A66C2', color: '#fff', fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Condividi su LinkedIn
            </button>
          </div>
          <div className="flex items-center justify-between">
            <Link href={cfg.path} className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: cfg.color }}>
              <ArrowLeft className="w-4 h-4" />
              Torna a {cfg.label}
            </Link>
            <Link href="/" className="text-sm text-[#1a1a1a]/50 hover:text-[#1a1a1a] transition-colors font-mono tracking-widest uppercase text-xs">
              Proof Press Home
            </Link>
          </div>
        </div>
      </article>
    </div>
    </RequireAuth>
  );
}
