/**
 * IDEASMART — Health & Biotech
 * Palette: bianco carta (#faf8f3), inchiostro (#1a1a2e), accento verde finanza (#0369a1).
 */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import ArchiveSection from "@/components/ArchiveSection";
import { trpc } from "@/lib/trpc";
import NewsletterSubscribeForm from "@/components/NewsletterSubscribeForm";
import SEOHead from "@/components/SEOHead";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import SectionChannelBar from "@/components/SectionChannelBar";

const ACCENT = "#0369a1";
const ACCENT_LIGHT = "#eff6ff";
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
function NewsCard({ item, showImage = false }: {
  item: { id: number; title: string; summary: string; category: string; imageUrl?: string | null; sourceName?: string; publishedAt?: string; sourceUrl?: string };
  showImage?: boolean;
}) {
  const href = item.sourceUrl && item.sourceUrl !== '#' ? item.sourceUrl : `https://www.google.com/search?q=${encodeURIComponent(item.title)}`;
  return (
    <div className="py-3">
      {showImage && item.imageUrl && (
        <a href={href} target="_blank" rel="noopener noreferrer">
          <img src={item.imageUrl} alt={item.title} loading="lazy" decoding="async"
            className="w-full h-32 object-cover mb-3 cursor-pointer grayscale-[15%] hover:grayscale-0 transition-all"
            style={{ border: "1px solid rgba(26,26,46,0.1)" }} />
        </a>
      )}
      <SectionBadge label={item.category || "Finance"} />
      <a href={href} target="_blank" rel="noopener noreferrer">
        <h3 className="mt-2 text-base font-bold leading-snug text-[#1a1a2e] hover:underline cursor-pointer"
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
      <SectionBadge label={item.category || "Finance"} />
      <div>
        <a href={href} target="_blank" rel="noopener noreferrer">
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

export default function HealthHome() {
  const today = useMemo(() => new Date(), []);
  const { data: newsData } = trpc.news.getLatest.useQuery({ limit: 20, section: "health" }, { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false });
  const { data: editorial } = trpc.editorial.getLatest.useQuery({ section: "health" }, { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false });
  const { data: startupData } = trpc.startupOfDay.getLatest.useQuery({ section: "health" }, { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false });
  const { data: reportageItems } = trpc.reportage.getLatestWeek.useQuery({ section: "health" }, { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false });
  const { data: analyses } = trpc.marketAnalysis.getLatest.useQuery({ section: "health" }, { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false });
  const news = newsData || [];
  const heroNews = news.find(n => n.imageUrl) || news[0] || null;
  const secondaryNews = news.filter(n => n.id !== heroNews?.id).slice(0, 2);
  const remainingNews = news.filter(n => n.id !== heroNews?.id).slice(2, 8);
  const listNews = news.filter(n => n.id !== heroNews?.id).slice(8, 20);

  return (
    <>
      <SEOHead
        title="Health & Biotech — IDEASMART"
        description="Notizie su biotech, pharma, AI in medicina e longevità. Dati da Nature, NEJM, FDA, EMA, STAT News."
        canonical="https://ideasmart.ai/health"
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
              Health & Biotech
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#1a1a2e]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              IDEASMART
            </h1>
            <p className="mt-2 text-sm text-[#1a1a2e]/50 uppercase tracking-[0.25em]"
              style={{ fontFamily: "'Space Mono', monospace" }}>
              Health & Biotech · Analisi Mercati · Macro · Fintech
            </p>
          </div>
          <Divider thick />
          <nav className="flex items-center justify-center gap-0 py-2 flex-wrap">
            <Link href="/edicola">
              <span className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors hover:opacity-70 cursor-pointer"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  color: "#1a1a2e",
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
          <div className="w-full border-t border-[#1a1a2e]/20" />
        </header>

        {/* BREAKING NEWS TICKER */}
        <div className="max-w-6xl mx-auto px-4">
          <BreakingNewsTicker />
        <SectionChannelBar />
        </div>
        <main className="max-w-6xl mx-auto px-4 pb-16">
          {/* SEZIONE 1: Hero + Secondarie */}
          {heroNews && (
            <div className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                {/* Hero */}
                <div className="md:col-span-2 md:pr-8 md:border-r border-[#1a1a2e]">
                  {heroNews.imageUrl && (
                    <a href={heroNews.sourceUrl && heroNews.sourceUrl !== '#' ? heroNews.sourceUrl : `https://www.google.com/search?q=${encodeURIComponent(heroNews.title)}`}
                      target="_blank" rel="noopener noreferrer">
                      <img src={heroNews.imageUrl} alt={heroNews.title} loading="lazy" decoding="async"
                        className="w-full h-64 md:h-80 object-cover mb-4 grayscale-[10%] hover:grayscale-0 transition-all"
                        style={{ border: "1px solid rgba(26,26,46,0.1)" }} />
                    </a>
                  )}
                  <SectionBadge label={heroNews.category || "Finance"} />
                  <a href={heroNews.sourceUrl && heroNews.sourceUrl !== '#' ? heroNews.sourceUrl : `https://www.google.com/search?q=${encodeURIComponent(heroNews.title)}`}
                    target="_blank" rel="noopener noreferrer">
                    <h2 className="mt-3 text-2xl md:text-3xl font-black leading-tight text-[#1a1a2e] hover:underline cursor-pointer"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      {heroNews.title}
                    </h2>
                  </a>
                  <p className="mt-3 text-base leading-relaxed text-[#1a1a2e]/70"
                    style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                    {heroNews.summary}
                  </p>
                  {heroNews.sourceName && (
                    <p className="mt-2 text-[10px] text-[#1a1a2e]/35 uppercase tracking-widest"
                      style={{ fontFamily: "'Space Mono', monospace" }}>
                      {heroNews.sourceName}{heroNews.publishedAt ? ` · ${formatShortDate(heroNews.publishedAt)}` : ""}
                    </p>
                  )}
                </div>
                {/* Secondarie */}
                <div className="md:pl-8 mt-6 md:mt-0">
                  {secondaryNews.map((item, i) => (
                    <div key={item.id}>
                      <NewsCard item={item} showImage={!!item.imageUrl} />
                      {i < secondaryNews.length - 1 && <ThinDivider />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SEZIONE 2: Editoriale del giorno */}
          {editorial && (
            <div className="mt-8">
              <Divider thick />
              <div className="py-3 flex items-center gap-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: ACCENT, fontFamily: "'Space Mono', monospace" }}>
                  Editoriale del Giorno
                </span>
                <div className="flex-1 border-t border-[#1a1a2e]/20" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-black leading-tight text-[#1a1a2e]"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    {editorial.title}
                  </h2>
                  {editorial.subtitle && (
                    <p className="mt-2 text-base italic text-[#1a1a2e]/60"
                      style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                      {editorial.subtitle}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm leading-relaxed text-[#1a1a2e]/75"
                    style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                    {editorial.body?.slice(0, 400)}{editorial.body && editorial.body.length > 400 ? "…" : ""}
                  </p>
                  {editorial.keyTrend && (
                    <div className="mt-3 pl-3 border-l-2 border-[#0369a1]">
                      <p className="text-xs font-bold uppercase tracking-widest text-[#0369a1]"
                        style={{ fontFamily: "'Space Mono', monospace" }}>
                        Key Trend
                      </p>
                      <p className="text-sm text-[#1a1a2e]/70 mt-1"
                        style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                        {editorial.keyTrend}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {/* Pulsante Condividi su LinkedIn */}
              <div className="mt-4 flex items-center gap-4">
                <button
                  onClick={() => {
                    const url = encodeURIComponent(window.location.href + '/editorial/' + editorial.id);
                    const text = encodeURIComponent(editorial.title + ' — Analisi IDEASMART');
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`, '_blank', 'width=600,height=600');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
                  style={{ background: '#0A66C2', color: '#fff', fontFamily: "'Space Mono', monospace" }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  Condividi su LinkedIn
                </button>
              </div>
            </div>
          )}

          

          {/* SEZIONE 3: Notizie rimanenti (griglia 3 col) */}
          {remainingNews.length > 0 && (
            <div className="mt-8">
              <Divider thick />
              <div className="py-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a2e]/40"
                  style={{ fontFamily: "'Space Mono', monospace" }}>
                  Notizie del Giorno
                </span>
              </div>
              <ThinDivider />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8">
                {remainingNews.map((item, i) => (
                  <div key={item.id}>
                    <NewsCard item={item} showImage={!!item.imageUrl} />
                    {i < remainingNews.length - 1 && <ThinDivider />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEZIONE 4: Market Analysis */}
          {analyses && analyses.length > 0 && (
            <div className="mt-8">
              <Divider thick />
              <div className="py-3 flex items-center gap-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: ACCENT, fontFamily: "'Space Mono', monospace" }}>
                  Analisi di Mercato
                </span>
                <div className="flex-1 border-t border-[#1a1a2e]/20" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {analyses.slice(0, 4).map((item) => (
                  <div key={item.id} className="border-l-2 pl-4" style={{ borderColor: ACCENT }}>
                    <SectionBadge label={item.category} />
                    <h3 className="mt-2 text-base font-bold text-[#1a1a2e]"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-[#1a1a2e]/65 line-clamp-3"
                      style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                      {item.summary}
                    </p>
                    {item.dataPoint1 && (
                      <p className="mt-2 text-xs font-bold" style={{ color: ACCENT, fontFamily: "'Space Mono', monospace" }}>
                        → {item.dataPoint1}
                      </p>
                    )}
                    <p className="mt-1 text-[10px] text-[#1a1a2e]/35" style={{ fontFamily: "'Space Mono', monospace" }}>
                      {item.source}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          

          {/* SEZIONE 5: Reportage */}
          {reportageItems && reportageItems.length > 0 && (
            <div className="mt-8">
              <Divider thick />
              <div className="py-3 flex items-center gap-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: ACCENT, fontFamily: "'Space Mono', monospace" }}>
                  Reportage della Settimana
                </span>
                <div className="flex-1 border-t border-[#1a1a2e]/20" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {reportageItems.slice(0, 2).map((item) => (
                  <div key={item.id}>
                    <SectionBadge label={item.category} />
                    <h3 className="mt-2 text-lg font-bold text-[#1a1a2e]"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      {item.headline}
                    </h3>
                    <p className="mt-1 text-sm text-[#1a1a2e]/65 line-clamp-4"
                      style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                      {item.bodyText?.slice(0, 300)}…
                    </p>
                    <Link href={`/reportage/${item.id}`}>
                      <span className="mt-2 inline-block text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
                        style={{ color: ACCENT, fontFamily: "'Space Mono', monospace" }}>
                        Leggi tutto →
                      </span>
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
                  Ricevi Health & Biotech ogni settimana
                </h3>
                <p className="mt-2 text-sm text-[#1a1a2e]/65"
                  style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                  Notizie su biotech, pharma, AI in medicina e longevità per professionisti sanitari e investitori.
                </p>
              </div>
              <div>
                <NewsletterSubscribeForm defaultChannel="health" accentColor="#dc2626" />
              </div>
            </div>
          </div>

          {/* Archivio */}
          <ArchiveSection
            section="health"
            accentColor="#0369a1"
            skipCount={10}
          />

                    {/* Footer sezione */}
          <div className="mt-4">
            <Divider thick />
            <div className="py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-xs text-[#1a1a2e]/40" style={{ fontFamily: "'Space Mono', monospace" }}>
                {`© ${today.getFullYear()} IdeaSmart · Health & Biotech`}
              </p>
              <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-end">
                <Link href="/"><span className="text-xs hover:underline cursor-pointer text-[#1a1a2e]/40" style={{ fontFamily: "'Space Mono', monospace" }}>← Home</span></Link>
                <Link href="/ai"><span className="text-xs hover:underline cursor-pointer" style={{ color: "#0a6e5c", fontFamily: "'Space Mono', monospace" }}>AI4Business</span></Link>
                <Link href="/startup"><span className="text-xs hover:underline cursor-pointer" style={{ color: "#c2410c", fontFamily: "'Space Mono', monospace" }}>Startup</span></Link>
                <Link href="/health"><span className="text-xs hover:underline cursor-pointer" style={{ color: "#0369a1", fontFamily: "'Space Mono', monospace" }}>Health</span></Link>
                <Link href="/sport"><span className="text-xs hover:underline cursor-pointer" style={{ color: "#b45309", fontFamily: "'Space Mono', monospace" }}>Sport</span></Link>
                <Link href="/luxury"><span className="text-xs hover:underline cursor-pointer" style={{ color: "#7c3aed", fontFamily: "'Space Mono', monospace" }}>Luxury</span></Link>
                <Link href="/privacy"><span className="text-xs hover:underline cursor-pointer text-[#1a1a2e]/40" style={{ fontFamily: "'Space Mono', monospace" }}>Privacy</span></Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
