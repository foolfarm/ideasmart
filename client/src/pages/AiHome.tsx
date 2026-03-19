/**
 * IDEASMART — AI4Business News · Sezione AI
 * Layout editoriale da giornale: testata sezione, editoriale del giorno, notizie in colonne, reportage, startup del giorno.
 * Palette: bianco carta (#faf8f3), inchiostro (#1a1a2e), accento teal (#0a6e5c).
 */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import ArchiveSection from "@/components/ArchiveSection";
import { trpc } from "@/lib/trpc";
import NewsletterSubscribeForm from "@/components/NewsletterSubscribeForm";
import SEOHead from "@/components/SEOHead";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import SectionChannelBar from "@/components/SectionChannelBar";

const ACCENT = "#0a6e5c";
const ACCENT_LIGHT = "#e6f4f1";
const INK = "#1a1a2e";

function formatDateIT(date: Date): string {
  return date.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function formatShortDate(str: string): string {
  if (!str) return "";
  try { return new Date(str).toLocaleDateString("it-IT", { day: "numeric", month: "short" }); } catch { return str; }
}

function Divider({ thick = false }: { thick?: boolean }) {
  return <div className={`w-full ${thick ? "border-t-4" : "border-t"} border-[#1a1a2e]`} />;
}
function ThinDivider() { return <div className="w-full border-t border-[#1a1a2e]/20" />; }

function SectionBadge({ label }: { label: string }) {
  return (
    <span className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm"
      style={{ background: ACCENT_LIGHT, color: ACCENT, fontFamily: "'Space Mono', monospace" }}>
      {label}
    </span>
  );
}

function NewsCard({ item, showImage = false, large = false }: {
  item: { id: number; title: string; summary: string; category: string; imageUrl?: string | null; sourceName?: string; publishedAt?: string; sourceUrl?: string };
  showImage?: boolean;
  large?: boolean;
}) {
  const href = item.sourceUrl && item.sourceUrl !== '#' ? item.sourceUrl : `https://www.google.com/search?q=${encodeURIComponent(item.title)}`;
  return (
    <div className="py-3">
      {showImage && item.imageUrl && (
        <a href={href} rel="noopener noreferrer">
          <img src={item.imageUrl} alt={item.title} loading="lazy" decoding="async"
            className={`w-full ${large ? "h-52" : "h-32"} object-cover mb-3 cursor-pointer grayscale-[15%] hover:grayscale-0 transition-all`}
            style={{ border: "1px solid rgba(26,26,46,0.1)" }} />
        </a>
      )}
      <SectionBadge label={item.category || "AI"} />
      <a href={href} rel="noopener noreferrer">
        <h3 className={`mt-2 ${large ? "text-xl md:text-2xl" : "text-base"} font-bold leading-snug text-[#1a1a2e] hover:underline cursor-pointer`}
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {item.title}
        </h3>
      </a>
      <p className="mt-1 text-sm leading-relaxed text-[#1a1a2e]/65 line-clamp-3"
        style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
        {item.summary}
      </p>
      {item.sourceName && (
        <p className="mt-1 text-[10px] text-[#1a1a2e]/35" style={{ fontFamily: "'Space Mono', monospace" }}>
          {item.sourceName}{item.publishedAt ? ` · ${formatShortDate(item.publishedAt)}` : ""}
        </p>
      )}
    </div>
  );
}

function NewsRow({ item }: {
  item: { id: number; title: string; category: string; sourceName?: string; publishedAt?: string; sourceUrl?: string };
}) {
  const href = item.sourceUrl && item.sourceUrl !== '#' ? item.sourceUrl : `https://www.google.com/search?q=${encodeURIComponent(item.title)}`;
  return (
    <div className="py-2.5 grid grid-cols-[auto_1fr] gap-3 items-start">
      <SectionBadge label={item.category || "AI"} />
      <div>
        <a href={href} rel="noopener noreferrer">
          <span className="text-sm font-semibold text-[#1a1a2e] hover:underline cursor-pointer"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {item.title}
          </span>
        </a>
        {item.sourceName && (
          <span className="ml-2 text-[10px] text-[#1a1a2e]/35" style={{ fontFamily: "'Space Mono', monospace" }}>
            {item.sourceName}{item.publishedAt ? ` · ${formatShortDate(item.publishedAt)}` : ""}
          </span>
        )}
      </div>
    </div>
  );
}

export default function AiHome() {
  const today = useMemo(() => new Date(), []);

  const { data: newsData } = trpc.news.getLatest.useQuery({ limit: 20, section: "ai" }, { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false });
  const { data: editorial } = trpc.editorial.getLatest.useQuery({ section: "ai" }, { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false });
  const { data: startupData } = trpc.startupOfDay.getLatest.useQuery({ section: "ai" }, { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false });
  const { data: reportageItems } = trpc.reportage.getLatestWeek.useQuery({ section: "ai" }, { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false });
  const { data: analyses } = trpc.marketAnalysis.getLatest.useQuery({ section: "ai" }, { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false });


  const news = newsData || [];
  const heroNews = news.find(n => n.imageUrl) || news[0] || null;
  const secondaryNews = news.filter(n => n.id !== heroNews?.id).slice(0, 2);
  const remainingNews = news.filter(n => n.id !== heroNews?.id).slice(2, 8);
  const listNews = news.filter(n => n.id !== heroNews?.id).slice(8, 20);

  return (
    <>
      <SEOHead
        title="AI4Business News — IDEASMART"
        description="Notizie aggiornate ogni giorno sull'Intelligenza Artificiale per il business italiano. Editoriale, analisi e startup del giorno."
        canonical="https://ideasmart.ai/ai"
        ogSiteName="IDEASMART"
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,600&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,300;1,8..60,400&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
      `}</style>

      <div className="min-h-screen" style={{ background: "#faf8f3", color: INK }}>

        {/* TESTATA SEZIONE */}
        <header className="max-w-6xl mx-auto px-4 pt-6 pb-0">
          <div className="flex items-center justify-between mb-2">
            <Link href="/">
              <span className="text-xs text-[#1a1a2e]/40 hover:text-[#1a1a2e]/70 cursor-pointer uppercase tracking-widest"
                style={{ fontFamily: "'Space Mono', monospace" }}>
                ← IdeaSmart
              </span>
            </Link>
            <span className="text-xs text-[#1a1a2e]/40 uppercase tracking-widest"
              style={{ fontFamily: "'Space Mono', monospace" }}>
              {formatDateIT(today)}
            </span>
          </div>

          <Divider thick />

          <div className="text-center py-5">
            <div className="inline-block px-3 py-1 mb-3 rounded-sm text-xs font-bold uppercase tracking-widest"
              style={{ background: ACCENT_LIGHT, color: ACCENT, fontFamily: "'Space Mono', monospace" }}>
              Canale AI
            </div>
            <Link href="/">
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#1a1a2e] cursor-pointer hover:opacity-80 transition-opacity"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.02em" }}>
                AI4Business News
              </h1>
            </Link>
            <p className="mt-1 text-xs uppercase tracking-[0.25em] text-[#1a1a2e]/50"
              style={{ fontFamily: "'Space Mono', monospace" }}>
              Intelligenza Artificiale per il Business Italiano
            </p>
          </div>

          <Divider thick />

          <nav className="flex items-center justify-center gap-0 py-2">
            {["Notizie", "Editoriale", "Startup del Giorno", "Reportage", "Analisi"].map((label, i) => (
              <span key={label}
                className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors hover:opacity-70 cursor-pointer"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  color: ACCENT,
                  borderLeft: i > 0 ? "1px solid rgba(26,26,46,0.2)" : "none",
                }}>
                {label}
              </span>
            ))}
            <Link href="/edicola">
              <span className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors hover:opacity-70 cursor-pointer"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  color: "#1a1a2e",
                  borderLeft: "1px solid rgba(26,26,46,0.2)",
                }}>
                📰 Edicola
              </span>
            </Link>
            <Link href="/manifesto">
              <span className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors hover:opacity-70 cursor-pointer"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  color: "#1a1a2e",
                  borderLeft: "1px solid rgba(26,26,46,0.2)",
                }}>
                Manifesto
              </span>
            </Link>
            <Link href="/chi-siamo">
              <span className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors hover:opacity-70 cursor-pointer"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  color: "#1a1a2e",
                  borderLeft: "1px solid rgba(26,26,46,0.2)",
                }}>
                Chi Siamo
              </span>
            </Link>
            <Link href="/tecnologia">
              <span className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors hover:opacity-70 cursor-pointer"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  color: "#00b89a",
                  borderLeft: "1px solid rgba(26,26,46,0.2)",
                }}>
                Tecnologia
              </span>
            </Link>
          </nav>

          <Divider />
        </header>
          <BreakingNewsTicker />
        <SectionChannelBar />
        <main className="max-w-6xl mx-auto px-4 pb-12">

          {/* SEZIONE 1: Hero + Sidebar editoriale */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-0 mt-0">

            {/* Colonna principale: notizia hero + 2 secondarie */}
            <div className="pr-0 lg:pr-6 border-r-0 lg:border-r border-[#1a1a2e]/20">
              <div className="py-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a2e]/40"
                  style={{ fontFamily: "'Space Mono', monospace" }}>
                  Notizia del Giorno
                </span>
              </div>
              <ThinDivider />

              {heroNews ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                  <div className="pr-0 md:pr-5 py-4">
                    <SectionBadge label={heroNews.category || "AI"} />
                    <a href={heroNews.sourceUrl && heroNews.sourceUrl !== '#' ? heroNews.sourceUrl : `https://www.google.com/search?q=${encodeURIComponent(heroNews.title)}`} rel="noopener noreferrer">
                      <h2 className="mt-3 text-2xl md:text-3xl font-bold leading-tight text-[#1a1a2e] hover:underline cursor-pointer"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                        {heroNews.title}
                      </h2>
                    </a>
                    <ThinDivider />
                    <p className="mt-3 text-base leading-relaxed text-[#1a1a2e]/80"
                      style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                      {heroNews.summary.slice(0, 280)}{heroNews.summary.length > 280 ? "…" : ""}
                    </p>
                    <a href={heroNews.sourceUrl && heroNews.sourceUrl !== '#' ? heroNews.sourceUrl : `https://www.google.com/search?q=${encodeURIComponent(heroNews.title)}`} rel="noopener noreferrer">
                      <span className="mt-3 inline-block text-xs font-bold uppercase tracking-widest hover:underline"
                        style={{ color: ACCENT, fontFamily: "'Space Mono', monospace" }}>
                        Leggi l'articolo originale →
                      </span>
                    </a>
                  </div>
                  <div className="py-4 pl-0 md:pl-5 border-l-0 md:border-l border-[#1a1a2e]/20">
                    {heroNews.imageUrl ? (
                      <a href={heroNews.sourceUrl && heroNews.sourceUrl !== '#' ? heroNews.sourceUrl : `https://www.google.com/search?q=${encodeURIComponent(heroNews.title)}`} rel="noopener noreferrer">
                        <img src={heroNews.imageUrl} alt={heroNews.title} loading="lazy" decoding="async"
                          className="w-full h-52 object-cover cursor-pointer grayscale-[15%] hover:grayscale-0 transition-all"
                          style={{ border: "1px solid rgba(26,26,46,0.15)" }} />
                      </a>
                    ) : (
                      <div className="w-full h-52 flex items-center justify-center"
                        style={{ background: ACCENT_LIGHT, border: `1px solid ${ACCENT}30` }}>
                        <span className="text-3xl opacity-30">🤖</span>
                      </div>
                    )}
                    {heroNews.sourceName && (
                      <p className="mt-2 text-xs text-[#1a1a2e]/40 italic" style={{ fontFamily: "'Space Mono', monospace" }}>
                        Fonte: {heroNews.sourceName}{heroNews.publishedAt ? ` · ${formatShortDate(heroNews.publishedAt)}` : ""}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-[#1a1a2e]/30">
                  <p style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>Caricamento notizie…</p>
                </div>
              )}

              <ThinDivider />

              {secondaryNews.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 mt-2">
                  {secondaryNews.map((item, i) => (
                    <div key={item.id} className={i > 0 ? "border-l border-[#1a1a2e]/20 pl-4" : "pr-4"}>
                      <NewsCard item={item} showImage />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar: editoriale del giorno */}
            <div className="pl-0 lg:pl-5 mt-6 lg:mt-0">
              <div className="py-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a2e]/40"
                  style={{ fontFamily: "'Space Mono', monospace" }}>
                  Editoriale del Giorno
                </span>
              </div>
              <ThinDivider />

              {editorial ? (
                <div className="py-3">
                  <Link href={`/ai/editoriale/${editorial.id}`}>
                    <p className="text-base font-bold text-[#1a1a2e] leading-snug hover:opacity-70 transition-opacity cursor-pointer"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      {editorial.title}
                    </p>
                  </Link>
                  {editorial.subtitle && (
                    <p className="mt-1 text-sm italic text-[#1a1a2e]/55"
                      style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                      {editorial.subtitle}
                    </p>
                  )}
                  {editorial.keyTrend && (
                    <div className="mt-2 px-3 py-1.5 rounded-sm text-xs font-semibold"
                      style={{ background: ACCENT_LIGHT, color: ACCENT, fontFamily: "'Space Mono', monospace" }}>
                      Trend: {editorial.keyTrend}
                    </div>
                  )}
                  <ThinDivider />
                  <p className="mt-2 text-sm leading-relaxed text-[#1a1a2e]/70 line-clamp-8"
                    style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                    {editorial.body}
                  </p>
                  {editorial.authorNote && (
                    <blockquote className="mt-3 pl-3 border-l-2 text-xs italic text-[#1a1a2e]/55"
                      style={{ borderColor: ACCENT, fontFamily: "'Source Serif 4', Georgia, serif" }}>
                      {editorial.authorNote}
                    </blockquote>
                  )}
                  <Link href={`/ai/editoriale/${editorial.id}`}
                    className="mt-3 inline-block text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
                    style={{ color: ACCENT, fontFamily: "'Space Mono', monospace" }}>
                    Leggi tutto →
                  </Link>
                </div>
              ) : (
                <div className="py-6 text-center text-[#1a1a2e]/25 text-sm">Caricamento editoriale…</div>
              )}
            </div>
          </div>

          {/* SEZIONE 2: Griglia notizie 3 colonne */}
          {remainingNews.length > 0 && (
            <div className="mt-6">
              <Divider thick />
              <div className="py-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a2e]/40"
                  style={{ fontFamily: "'Space Mono', monospace" }}>
                  Ultime Notizie AI
                </span>
              </div>
              <ThinDivider />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mt-2">
                {remainingNews.slice(0, 3).map((item, i) => (
                  <div key={item.id} className={i > 0 ? "border-l border-[#1a1a2e]/20 pl-5" : "pr-5"}>
                    <NewsCard item={item} showImage={i === 0} />
                  </div>
                ))}
              </div>
              {remainingNews.length > 3 && (
                <>
                  <ThinDivider />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mt-2">
                    {remainingNews.slice(3, 6).map((item, i) => (
                      <div key={item.id} className={i > 0 ? "border-l border-[#1a1a2e]/20 pl-5" : "pr-5"}>
                        <NewsCard item={item} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          

          {/* SEZIONE 3: Startup del Giorno */}
          {startupData && (
            <div className="mt-8">
              <Divider thick />
              <div className="py-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a2e]/40"
                  style={{ fontFamily: "'Space Mono', monospace" }}>
                  Startup del Giorno
                </span>
              </div>
              <ThinDivider />
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-0 py-4">
                <div className="pr-0 lg:pr-6 border-r-0 lg:border-r border-[#1a1a2e]/20">
                  <div className="flex items-start gap-3 mb-3">
                    <div>
                      <Link href={`/ai/spotlight/${startupData.id}`}>
                        <h3 className="text-xl font-bold text-[#1a1a2e] hover:opacity-70 transition-opacity cursor-pointer"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                          {startupData.name}
                        </h3>
                      </Link>
                      <p className="text-sm italic text-[#1a1a2e]/60"
                        style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                        {startupData.tagline}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-[#1a1a2e]/75"
                    style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                    {startupData.description}
                  </p>
                  <p className="mt-3 text-sm text-[#1a1a2e]/70"
                    style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                    <strong>Perché oggi:</strong> {startupData.whyToday}
                  </p>
                  {startupData.websiteUrl && (
                    <a href={startupData.websiteUrl} target="_blank" rel="noopener noreferrer"
                      className="mt-3 inline-block text-xs font-bold uppercase tracking-widest hover:underline"
                      style={{ color: ACCENT, fontFamily: "'Space Mono', monospace" }}>
                      Visita il sito →
                    </a>
                  )}
                  <Link href={`/ai/spotlight/${startupData.id}`}
                    className="mt-3 ml-4 inline-block text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
                    style={{ color: ACCENT, fontFamily: "'Space Mono', monospace" }}>
                    Approfondisci →
                  </Link>
                </div>
                <div className="pl-0 lg:pl-6 mt-4 lg:mt-0">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Categoria", value: startupData.category },
                      { label: "Paese", value: startupData.country || "Italia" },
                      { label: "Fondata", value: startupData.foundedYear || "N/D" },
                      { label: "Funding", value: startupData.funding || "N/D" },
                    ].map(({ label, value }) => (
                      <div key={label} className="p-3 rounded-sm" style={{ background: ACCENT_LIGHT }}>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1"
                          style={{ color: ACCENT, fontFamily: "'Space Mono', monospace" }}>
                          {label}
                        </p>
                        <p className="text-sm font-semibold text-[#1a1a2e]"
                          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                  {startupData.aiScore != null && startupData.aiScore > 0 && (
                    <div className="mt-3 p-3 rounded-sm" style={{ background: ACCENT_LIGHT }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-1"
                        style={{ color: ACCENT, fontFamily: "'Space Mono', monospace" }}>
                        AI Score
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-[#1a1a2e]/10">
                          <div className="h-2 rounded-full transition-all"
                            style={{ width: `${startupData.aiScore}%`, background: ACCENT }} />
                        </div>
                        <span className="text-sm font-bold" style={{ color: ACCENT }}>{startupData.aiScore}/100</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SEZIONE 4: Reportage */}
          {reportageItems && reportageItems.length > 0 && (
            <div className="mt-8">
              <Divider thick />
              <div className="py-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a2e]/40"
                  style={{ fontFamily: "'Space Mono', monospace" }}>
                  Reportage della Settimana
                </span>
              </div>
              <ThinDivider />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mt-2">
                {reportageItems.slice(0, 4).map((item, i) => (
                  <div key={item.id}
                    className={`py-4 ${i % 2 === 1 ? "border-l border-[#1a1a2e]/20 pl-6" : "pr-6"} ${i >= 2 ? "border-t border-[#1a1a2e]/20" : ""}`}>
                    <SectionBadge label={item.category || "Reportage"} />
                    <Link href={`/ai/reportage/${item.id}`}>
                      <h3 className="mt-2 text-lg font-bold text-[#1a1a2e] leading-snug hover:opacity-70 transition-opacity cursor-pointer"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                        {item.headline}
                      </h3>
                    </Link>
                    <p className="mt-1 text-sm leading-relaxed text-[#1a1a2e]/65 line-clamp-3"
                      style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                      {item.subheadline || item.bodyText?.slice(0, 200)}
                    </p>
                    {item.quote && (
                      <blockquote className="mt-2 pl-3 border-l-2 text-xs italic text-[#1a1a2e]/55"
                        style={{ borderColor: ACCENT, fontFamily: "'Source Serif 4', Georgia, serif" }}>
                        "{item.quote}"
                      </blockquote>
                    )}
                    <Link href={`/ai/reportage/${item.id}`}
                      className="mt-2 inline-block text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
                      style={{ color: ACCENT, fontFamily: "'Space Mono', monospace" }}>
                      Leggi tutto →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          

          {/* SEZIONE 5: Analisi di mercato */}
          {analyses && analyses.length > 0 && (
            <div className="mt-8">
              <Divider thick />
              <div className="py-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a2e]/40"
                  style={{ fontFamily: "'Space Mono', monospace" }}>
                  Analisi di Mercato
                </span>
              </div>
              <ThinDivider />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mt-2">
                {analyses.slice(0, 4).map((item, i) => (
                  <div key={item.id}
                    className={`py-4 ${i % 2 === 1 ? "border-l border-[#1a1a2e]/20 pl-6" : "pr-6"} ${i >= 2 ? "border-t border-[#1a1a2e]/20" : ""}`}>
                    <SectionBadge label={item.source || "Analisi"} />
                    <Link href={`/ai/analisi/${item.id}`}>
                      <h3 className="mt-2 text-base font-bold text-[#1a1a2e] leading-snug hover:opacity-70 transition-opacity cursor-pointer"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                        {item.title}
                      </h3>
                    </Link>
                    <p className="mt-1 text-sm leading-relaxed text-[#1a1a2e]/65 line-clamp-3"
                      style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                      {item.summary}
                    </p>
                    <Link href={`/ai/analisi/${item.id}`}
                      className="mt-2 inline-block text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
                      style={{ color: ACCENT, fontFamily: "'Space Mono', monospace" }}>
                      Leggi tutto →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEZIONE 6: Elenco notizie rimanenti */}
          {listNews.length > 0 && (
            <div className="mt-8">
              <Divider thick />
              <div className="py-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a2e]/40"
                  style={{ fontFamily: "'Space Mono', monospace" }}>
                  Altre Notizie
                </span>
              </div>
              <ThinDivider />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 mt-1">
                {listNews.map((item, i) => (
                  <div key={item.id}>
                    <NewsRow item={item} />
                    {i < listNews.length - 1 && <ThinDivider />}
                  </div>
                ))}
              </div>
            </div>
          )}

          

          {/* SEZIONE 7: Newsletter */}
          <div className="mt-10">
            <Divider thick />
            <div className="py-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: ACCENT, fontFamily: "'Space Mono', monospace" }}>
                  Newsletter
                </span>
                <h3 className="mt-2 text-2xl font-bold text-[#1a1a2e]"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Ricevi AI4Business News ogni settimana
                </h3>
                <p className="mt-2 text-sm text-[#1a1a2e]/65"
                  style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                  Le notizie più importanti sull'AI per il business italiano, direttamente nella tua inbox ogni lunedì.
                </p>
              </div>
              <div>
                <NewsletterSubscribeForm defaultChannel="ai" accentColor="#00b4a0" />
              </div>
            </div>
          </div>

          {/* Archivio */}
          <ArchiveSection
            section="ai"
            accentColor="#00e5c8"
            skipCount={10}
          />

                    {/* Footer sezione */}
          <div className="mt-4">
            <Divider thick />
            <div className="py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-xs text-[#1a1a2e]/40" style={{ fontFamily: "'Space Mono', monospace" }}>
                {`© ${today.getFullYear()} IdeaSmart · AI4Business News`}
              </p>
              <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-end">
                <Link href="/"><span className="text-xs hover:underline cursor-pointer text-[#1a1a2e]/40" style={{ fontFamily: "'Space Mono', monospace" }}>← Home</span></Link>
                <Link href="/music"><span className="text-xs hover:underline cursor-pointer" style={{ color: "#5b21b6", fontFamily: "'Space Mono', monospace" }}>ITsMusic</span></Link>
                <Link href="/startup"><span className="text-xs hover:underline cursor-pointer" style={{ color: "#c2410c", fontFamily: "'Space Mono', monospace" }}>Startup News</span></Link>
                <Link href="/privacy"><span className="text-xs hover:underline cursor-pointer text-[#1a1a2e]/40" style={{ fontFamily: "'Space Mono', monospace" }}>Privacy Policy</span></Link>

              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
