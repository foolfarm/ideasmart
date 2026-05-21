/*
 * ProofPress — AI NEWS Page
 * Design: StartupItalia-inspired — immagini 16:9, titoli Playfair serif, griglia 3 colonne
 * Accent: #e63946 (rosso ProofPress)
 */
import { useMemo } from "react";
import { Link } from "wouter";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import ArchiveSection from "@/components/ArchiveSection";
import { trpc } from "@/lib/trpc";
import NewsletterSubscribeForm from "@/components/NewsletterSubscribeForm";
import SEOHead from "@/components/SEOHead";
import EditorialeDelDirettore from "@/components/EditorialeDelDirettore";
import VerifyBadge from "@/components/VerifyBadge";
import { stripLinkedInSignature } from "@/lib/stripLinkedInSignature";

const ACCENT = "#e63946";
const FONT_SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
const FONT_SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif";

function formatShortDate(str: string): string {
  if (!str) return "";
  try {
    const d = new Date(str);
    const now = new Date();
    const diffH = Math.floor((now.getTime() - d.getTime()) / 3600000);
    if (diffH < 1) return "Ora";
    if (diffH < 24) return `${diffH}h fa`;
    return d.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
  } catch { return str; }
}

type NewsItem = {
  id: number;
  title: string;
  summary: string;
  category: string;
  imageUrl?: string | null;
  sourceName?: string;
  publishedAt?: string;
  sourceUrl?: string;
  verifyHash?: string | null;
  trustGrade?: string | null;
  trustScore?: number | null;
  ppvHash?: string | null;
  ppvIpfsUrl?: string | null;
  ppvTrustGrade?: string | null;
  ppvTrustScore?: number | null;
  ppvDocumentId?: number | null;
};

function SectionHeader({ title, accent, href }: { title: string; accent: string; href?: string }) {
  return (
    <div className="flex items-center justify-between mb-4 pb-2" style={{ borderBottom: `3px solid ${accent}` }}>
      <h2 className="text-[13px] font-bold uppercase tracking-[0.15em] m-0" style={{ color: accent, fontFamily: FONT_SANS }}>
        {title}
      </h2>
      {href && (
        <Link href={href}>
          <span className="text-[10px] font-bold uppercase tracking-widest hover:underline cursor-pointer"
            style={{ color: accent, fontFamily: FONT_SANS }}>
            Tutte →
          </span>
        </Link>
      )}
    </div>
  );
}

function HeroCard({ item }: { item: NewsItem }) {
  const href = `/ai/news/${item.id}`;
  return (
    <article className="group cursor-pointer">
      <Link href={href}>
        <div className="relative overflow-hidden rounded-lg bg-[#f5f5f5]" style={{ aspectRatio: "16/9" }}>
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.title} loading="eager" decoding="async"
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f5f5f5] to-[#e8e8e8]">
              <span className="text-[#bbb] text-xs uppercase tracking-widest" style={{ fontFamily: FONT_SANS }}>AI</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>
      </Link>
      <div className="mt-3">
        <span className="inline-block text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 mb-2"
          style={{ background: ACCENT, color: "#fff", fontFamily: FONT_SANS, borderRadius: "3px" }}>
          {item.category || "AI"}
        </span>
        <Link href={href}>
          <h2 className="text-[#1a1a1a] hover:text-[#e63946] transition-colors leading-tight"
            style={{ fontFamily: FONT_SERIF, fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, lineHeight: 1.2 }}>
            {item.title}
          </h2>
        </Link>
        <p className="mt-2 text-[15px] leading-relaxed text-[#555]"
          style={{ fontFamily: FONT_SANS, lineHeight: 1.65 }}>
          {item.summary.slice(0, 220)}{item.summary.length > 220 ? "…" : ""}
        </p>
        <p className="mt-2 text-[11px] text-[#999] uppercase tracking-widest" style={{ fontFamily: FONT_SANS }}>
          {item.sourceName}{item.publishedAt ? ` · ${formatShortDate(item.publishedAt)}` : ""}
        </p>
        {(item.verifyHash || item.ppvHash) && (
          <div className="mt-1.5">
            <VerifyBadge hash={item.ppvHash || item.verifyHash} size="sm"
              trustGrade={item.ppvTrustGrade || item.trustGrade}
              trustScore={item.ppvTrustScore ?? item.trustScore}
              ppvHash={item.ppvHash} ppvIpfsUrl={item.ppvIpfsUrl}
              ppvTrustGrade={item.ppvTrustGrade} ppvDocumentId={item.ppvDocumentId} />
          </div>
        )}
      </div>
    </article>
  );
}

function MediumCard({ item }: { item: NewsItem }) {
  const href = `/ai/news/${item.id}`;
  return (
    <article className="group cursor-pointer">
      <Link href={href}>
        <div className="overflow-hidden rounded-md bg-[#f5f5f5]" style={{ aspectRatio: "16/9" }}>
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.title} loading="lazy"
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f5f5f5] to-[#e8e8e8]">
              <span className="text-[#bbb] text-[10px] uppercase tracking-widest" style={{ fontFamily: FONT_SANS }}>AI</span>
            </div>
          )}
        </div>
      </Link>
      <div className="mt-2.5">
        <span className="inline-block text-[9px] font-bold uppercase tracking-[0.1em] px-1.5 py-0.5 mb-1.5"
          style={{ background: ACCENT, color: "#fff", fontFamily: FONT_SANS, borderRadius: "2px" }}>
          {item.category || "AI"}
        </span>
        <Link href={href}>
          <h3 className="text-[#1a1a1a] hover:text-[#e63946] transition-colors leading-snug line-clamp-3"
            style={{ fontFamily: FONT_SERIF, fontSize: "clamp(15px, 1.6vw, 18px)", fontWeight: 700, lineHeight: 1.3 }}>
            {item.title}
          </h3>
        </Link>
        <p className="mt-1.5 text-[12px] text-[#666] line-clamp-2" style={{ fontFamily: FONT_SANS, lineHeight: 1.55 }}>
          {item.summary.slice(0, 120)}{item.summary.length > 120 ? "…" : ""}
        </p>
        <p className="mt-1 text-[10px] text-[#999] uppercase tracking-widest" style={{ fontFamily: FONT_SANS }}>
          {item.sourceName}{item.publishedAt ? ` · ${formatShortDate(item.publishedAt)}` : ""}
        </p>
      </div>
    </article>
  );
}

function SmallRow({ item }: { item: NewsItem }) {
  const href = `/ai/news/${item.id}`;
  return (
    <div className="py-3 border-b border-[#f0f0f0] last:border-0">
      <div className="flex items-center gap-1 mb-1">
        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5"
          style={{ background: ACCENT, color: "#fff", fontFamily: FONT_SANS, borderRadius: "2px" }}>
          {item.category || "AI"}
        </span>
        {item.publishedAt && (
          <span className="text-[9px] text-[#999]" style={{ fontFamily: FONT_SANS }}>
            {formatShortDate(item.publishedAt)}
          </span>
        )}
      </div>
      <Link href={href}>
        <p className="text-[14px] font-bold text-[#1a1a1a] hover:text-[#e63946] transition-colors leading-snug line-clamp-2"
          style={{ fontFamily: FONT_SERIF }}>
          {item.title}
        </p>
      </Link>
      <p className="text-[10px] text-[#999] mt-0.5" style={{ fontFamily: FONT_SANS }}>{item.sourceName}</p>
    </div>
  );
}

export default function AiHome() {
  const queryOpts = { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false };
  const { data: newsData } = trpc.news.getLatest.useQuery({ limit: 20, section: "ai" }, queryOpts);
  const { data: editorial } = trpc.editorial.getLatest.useQuery({ section: "ai" }, queryOpts);
  const { data: startupData } = trpc.startupOfDay.getLatest.useQuery({ section: "ai" }, queryOpts);
  const { data: reportageItems } = trpc.reportage.getLatestWeek.useQuery({ section: "ai" }, queryOpts);
  const { data: analyses } = trpc.marketAnalysis.getLatest.useQuery({ section: "ai" }, queryOpts);

  const news = useMemo(() => newsData || [], [newsData]);
  const heroNews = useMemo(() => news.find(n => n.imageUrl) || news[0] || null, [news]);
  const grid3 = useMemo(() => news.filter(n => n.id !== heroNews?.id).slice(0, 3), [news, heroNews]);
  const grid3b = useMemo(() => news.filter(n => n.id !== heroNews?.id).slice(3, 6), [news, heroNews]);
  const listNews = useMemo(() => news.filter(n => n.id !== heroNews?.id).slice(6, 18), [news, heroNews]);

  return (
    <>
      <SEOHead
        title="AI NEWS — Proof Press"
        description="Notizie aggiornate ogni giorno sull'Intelligenza Artificiale per il business italiano. Editoriale, analisi e startup del giorno."
        canonical="https://proofpress.ai/ai"
        ogImage="https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/og-ai-2HNKKGHLmzPvLTRw9y9Nko.png"
        ogSiteName="Proof Press"
      />
      <div className="min-h-screen" style={{ background: "#ffffff" }}>
        <SharedPageHeader />
        <main className="max-w-[1280px] mx-auto px-4 pb-16">

          {/* ── HERO + EDITORIALE ── */}
          <section className="mt-6">
            <div className="flex items-center justify-between mb-4 pb-2" style={{ borderBottom: `3px solid ${ACCENT}` }}>
              <h2 className="text-[13px] font-bold uppercase tracking-[0.15em]" style={{ color: ACCENT, fontFamily: FONT_SANS }}>
                AI News
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
              {/* Hero principale */}
              <div>
                {heroNews ? <HeroCard item={heroNews} /> : (
                  <div className="py-12 text-center text-[#999]" style={{ fontFamily: FONT_SANS }}>Caricamento notizie…</div>
                )}
              </div>
              {/* Sidebar: editoriale */}
              <div>
                {editorial && (
                  <div className="border border-[#e8e8e8] rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: `2px solid ${ACCENT}` }}>
                      <span className="text-[11px] font-bold uppercase tracking-[0.15em]"
                        style={{ color: ACCENT, fontFamily: FONT_SANS }}>
                        Editoriale del Giorno
                      </span>
                    </div>
                    <Link href={`/ai/editoriale/${editorial.id}`}>
                      <h3 className="text-[17px] font-bold text-[#1a1a1a] leading-snug hover:text-[#e63946] transition-colors cursor-pointer"
                        style={{ fontFamily: FONT_SERIF }}>
                        {editorial.title}
                      </h3>
                    </Link>
                    {editorial.subtitle && (
                      <p className="mt-1 text-[13px] italic text-[#666]" style={{ fontFamily: FONT_SANS }}>
                        {editorial.subtitle}
                      </p>
                    )}
                    {editorial.keyTrend && (
                      <div className="mt-2 px-3 py-1.5 rounded text-[11px] font-semibold"
                        style={{ background: "#fff5f5", color: ACCENT, fontFamily: FONT_SANS }}>
                        📈 {editorial.keyTrend}
                      </div>
                    )}
                    <p className="mt-3 text-[13px] leading-relaxed text-[#555] line-clamp-6"
                      style={{ fontFamily: FONT_SANS, lineHeight: 1.6 }}>
                      {stripLinkedInSignature(editorial.body ?? '')}
                    </p>
                    {editorial.authorNote && (
                      <blockquote className="mt-3 pl-3 border-l-2 text-[12px] italic text-[#666]"
                        style={{ borderColor: ACCENT, fontFamily: FONT_SANS }}>
                        {editorial.authorNote}
                      </blockquote>
                    )}
                    <Link href={`/ai/editoriale/${editorial.id}`}>
                      <span className="mt-3 inline-block text-[11px] font-bold uppercase tracking-widest hover:underline cursor-pointer"
                        style={{ color: ACCENT, fontFamily: FONT_SANS }}>
                        Leggi tutto →
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ── EDITORIALE DEL DIRETTORE ── */}
          <section className="mt-10">
            <EditorialeDelDirettore />
          </section>

          {/* ── GRIGLIA 3 COLONNE ── */}
          {grid3.length > 0 && (
            <section className="mt-10">
              <SectionHeader title="Ultime Notizie AI" accent={ACCENT} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {grid3.map(item => <MediumCard key={item.id} item={item} />)}
              </div>
            </section>
          )}

          {/* ── SECONDA GRIGLIA 3 COLONNE ── */}
          {grid3b.length > 0 && (
            <section className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {grid3b.map(item => <MediumCard key={item.id} item={item} />)}
              </div>
            </section>
          )}

          {/* ── STARTUP DEL GIORNO ── */}
          {startupData && (
            <section className="mt-10">
              <SectionHeader title="Startup del Giorno" accent="#1a1a1a" href="/startup" />
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 border border-[#e8e8e8] rounded-lg p-6">
                <div>
                  <Link href={`/ai/spotlight/${startupData.id}`}>
                    <h3 className="text-[22px] font-bold text-[#1a1a1a] hover:text-[#e63946] transition-colors cursor-pointer"
                      style={{ fontFamily: FONT_SERIF }}>
                      {startupData.name}
                    </h3>
                  </Link>
                  <p className="text-[14px] italic text-[#666] mt-1" style={{ fontFamily: FONT_SANS }}>
                    {startupData.tagline}
                  </p>
                  <p className="mt-3 text-[14px] leading-relaxed text-[#444]" style={{ fontFamily: FONT_SANS }}>
                    {startupData.description}
                  </p>
                  <p className="mt-2 text-[13px] text-[#444]" style={{ fontFamily: FONT_SANS }}>
                    <strong>Perché oggi:</strong> {startupData.whyToday}
                  </p>
                  <div className="flex gap-3 mt-3">
                    {startupData.websiteUrl && (
                      <a href={startupData.websiteUrl} target="_blank" rel="noopener noreferrer"
                        className="text-[11px] font-bold uppercase tracking-widest hover:underline"
                        style={{ color: ACCENT, fontFamily: FONT_SANS }}>
                        Sito →
                      </a>
                    )}
                    <Link href={`/ai/spotlight/${startupData.id}`}>
                      <span className="text-[11px] font-bold uppercase tracking-widest hover:underline cursor-pointer"
                        style={{ color: "#1a1a1a", fontFamily: FONT_SANS }}>
                        Approfondisci →
                      </span>
                    </Link>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 content-start">
                  {[
                    { label: "Categoria", value: startupData.category },
                    { label: "Paese", value: startupData.country || "Italia" },
                    { label: "Fondata", value: startupData.foundedYear || "N/D" },
                    { label: "Funding", value: startupData.funding || "N/D" }
                  ].map(({ label, value }) => (
                    <div key={label} className="p-3 rounded-lg bg-[#f9f9f9]">
                      <p className="text-[9px] font-bold uppercase tracking-widest mb-1"
                        style={{ color: ACCENT, fontFamily: FONT_SANS }}>{label}</p>
                      <p className="text-[13px] font-semibold text-[#1a1a1a]" style={{ fontFamily: FONT_SANS }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── REPORTAGE ── */}
          {reportageItems && reportageItems.length > 0 && (
            <section className="mt-10">
              <SectionHeader title="Reportage della Settimana" accent="#1a1a1a" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reportageItems.slice(0, 4).map(item => (
                  <article key={item.id} className="border border-[#e8e8e8] rounded-lg p-5 hover:border-[#1a1a1a]/30 hover:shadow-sm transition-all">
                    <span className="inline-block text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 mb-2"
                      style={{ background: "#1a1a1a", color: "#fff", fontFamily: FONT_SANS, borderRadius: "2px" }}>
                      {item.category || "Reportage"}
                    </span>
                    <Link href={`/ai/reportage/${item.id}`}>
                      <h3 className="text-[17px] font-bold text-[#1a1a1a] hover:text-[#e63946] transition-colors leading-snug cursor-pointer"
                        style={{ fontFamily: FONT_SERIF }}>
                        {item.headline}
                      </h3>
                    </Link>
                    <p className="mt-2 text-[13px] text-[#666] line-clamp-3" style={{ fontFamily: FONT_SANS, lineHeight: 1.55 }}>
                      {item.subheadline || item.bodyText?.slice(0, 200)}
                    </p>
                    {item.quote && (
                      <blockquote className="mt-2 pl-3 border-l-2 text-[12px] italic text-[#666]"
                        style={{ borderColor: ACCENT, fontFamily: FONT_SANS }}>
                        "{item.quote}"
                      </blockquote>
                    )}
                    <Link href={`/ai/reportage/${item.id}`}>
                      <span className="mt-2 inline-block text-[11px] font-bold uppercase tracking-widest hover:underline cursor-pointer"
                        style={{ color: ACCENT, fontFamily: FONT_SANS }}>
                        Leggi tutto →
                      </span>
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* ── ANALISI DI MERCATO ── */}
          {analyses && analyses.length > 0 && (
            <section className="mt-10">
              <SectionHeader title="Analisi di Mercato" accent="#1a1a1a" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {analyses.slice(0, 4).map(item => (
                  <article key={item.id} className="border border-[#e8e8e8] rounded-lg p-4 hover:border-[#1a1a1a]/30 hover:shadow-sm transition-all">
                    <span className="inline-block text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 mb-2"
                      style={{ background: "#1a1a1a", color: "#fff", fontFamily: FONT_SANS, borderRadius: "2px" }}>
                      {item.source || "Analisi"}
                    </span>
                    <Link href={`/ai/analisi/${item.id}`}>
                      <h3 className="text-[15px] font-bold text-[#1a1a1a] hover:text-[#e63946] transition-colors leading-snug cursor-pointer"
                        style={{ fontFamily: FONT_SERIF }}>
                        {item.title}
                      </h3>
                    </Link>
                    <p className="mt-2 text-[13px] text-[#666] line-clamp-3" style={{ fontFamily: FONT_SANS, lineHeight: 1.55 }}>
                      {item.summary}
                    </p>
                    <Link href={`/ai/analisi/${item.id}`}>
                      <span className="mt-2 inline-block text-[11px] font-bold uppercase tracking-widest hover:underline cursor-pointer"
                        style={{ color: ACCENT, fontFamily: FONT_SANS }}>
                        Leggi tutto →
                      </span>
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* ── ELENCO NOTIZIE RIMANENTI ── */}
          {listNews.length > 0 && (
            <section className="mt-10">
              <SectionHeader title="Altre Notizie AI" accent={ACCENT} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                {listNews.map(item => <SmallRow key={item.id} item={item} />)}
              </div>
            </section>
          )}

          {/* ── NEWSLETTER ── */}
          <section className="mt-12 border-t border-[#e8e8e8] pt-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: ACCENT, fontFamily: FONT_SANS }}>Newsletter</span>
                <h3 className="mt-2 text-[24px] font-bold text-[#1a1a1a]" style={{ fontFamily: FONT_SERIF }}>
                  Ricevi AI News ogni settimana
                </h3>
                <p className="mt-2 text-[14px] text-[#666]" style={{ fontFamily: FONT_SANS }}>
                  Le notizie più importanti sull'AI per il business italiano, ogni lunedì.
                </p>
              </div>
              <div>
                <NewsletterSubscribeForm defaultChannel="ai" accentColor={ACCENT} />
              </div>
            </div>
          </section>

          {/* Archivio */}
          <ArchiveSection section="ai" accentColor={ACCENT} skipCount={10} />

          <SharedPageFooter />
        </main>
      </div>
    </>
  );
}
