/*
 * ProofPress — DEALROOM Page
 * Design: StartupItalia-inspired — immagini 16:9, titoli Playfair serif, griglia 3 colonne
 * Focus: round di investimento, deal, funding, seed, Series A/B, exit — Italia First
 */
import { useMemo } from "react";
import { Link } from "wouter";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import ArchiveSection from "@/components/ArchiveSection";
import { trpc } from "@/lib/trpc";
import NewsletterSubscribeForm from "@/components/NewsletterSubscribeForm";
import SEOHead from "@/components/SEOHead";
import VerifyBadge from "@/components/VerifyBadge";

const ACCENT = "#0f0f0f";
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
  const href = `/dealroom/news/${item.id}`;
  return (
    <article className="group cursor-pointer">
      <Link href={href}>
        <div className="relative overflow-hidden rounded-lg bg-[#f5f5f5]" style={{ aspectRatio: "16/9" }}>
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.title} loading="eager" decoding="async"
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f5f5f5] to-[#e8e8e8]">
              <span className="text-[#bbb] text-xs uppercase tracking-widest" style={{ fontFamily: FONT_SANS }}>Deal</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>
      </Link>
      <div className="mt-3">
        <span className="inline-block text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 mb-2"
          style={{ background: ACCENT, color: "#fff", fontFamily: FONT_SANS, borderRadius: "3px" }}>
          {item.category || "Deal"}
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
  const href = `/dealroom/news/${item.id}`;
  return (
    <article className="group cursor-pointer">
      <Link href={href}>
        <div className="overflow-hidden rounded-md bg-[#f5f5f5]" style={{ aspectRatio: "16/9" }}>
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.title} loading="lazy"
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f5f5f5] to-[#e8e8e8]">
              <span className="text-[#bbb] text-[10px] uppercase tracking-widest" style={{ fontFamily: FONT_SANS }}>Deal</span>
            </div>
          )}
        </div>
      </Link>
      <div className="mt-2.5">
        <span className="inline-block text-[9px] font-bold uppercase tracking-[0.1em] px-1.5 py-0.5 mb-1.5"
          style={{ background: ACCENT, color: "#fff", fontFamily: FONT_SANS, borderRadius: "2px" }}>
          {item.category || "Deal"}
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
  const href = `/dealroom/news/${item.id}`;
  return (
    <div className="py-3 border-b border-[#f0f0f0] last:border-0">
      <div className="flex items-center gap-1 mb-1">
        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5"
          style={{ background: ACCENT, color: "#fff", fontFamily: FONT_SANS, borderRadius: "2px" }}>
          {item.category || "Deal"}
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

export default function DealroomHome() {
  const queryOpts = { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false };
  const { data: newsData } = trpc.news.getLatest.useQuery({ limit: 50, section: "dealroom" }, queryOpts);

  const allNews = useMemo(() => newsData || [], [newsData]);
  const dedupedNews = useMemo(() => {
    const seen = new Set<string>();
    return allNews.filter((n) => {
      const key = n.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [allNews]);

  const heroNews = useMemo(() => dedupedNews.find(n => n.imageUrl) || dedupedNews[0] || null, [dedupedNews]);
  const grid3 = useMemo(() => dedupedNews.filter(n => n.id !== heroNews?.id).slice(0, 3), [dedupedNews, heroNews]);
  const grid3b = useMemo(() => dedupedNews.filter(n => n.id !== heroNews?.id).slice(3, 6), [dedupedNews, heroNews]);
  const listNews = useMemo(() => dedupedNews.filter(n => n.id !== heroNews?.id).slice(6, 30), [dedupedNews, heroNews]);

  return (
    <>
      <SEOHead
        title="Dealroom — Proof Press"
        description="Round di investimento, deal, funding, seed, Series A/B e investimenti venture capital. Focus sul mercato italiano, europeo e globale."
        canonical="https://proofpress.ai/dealroom"
        ogImage="https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/og-dealroom-7mUmbMgvxbCQ26uct7dsis.png"
        ogSiteName="Proof Press"
      />
      <div className="min-h-screen" style={{ background: "#ffffff" }}>
        <SharedPageHeader />
        <main className="max-w-[1280px] mx-auto px-4 pb-16">

          {/* ── HERO ── */}
          <section className="mt-6">
            <SectionHeader title="Dealroom — Round & Investimenti" accent={ACCENT} />
            {heroNews ? <HeroCard item={heroNews} /> : (
              <div className="py-12 text-center text-[#999]" style={{ fontFamily: FONT_SANS }}>Caricamento deal…</div>
            )}
          </section>

          {/* ── GRIGLIA 3 COLONNE ── */}
          {grid3.length > 0 && (
            <section className="mt-10">
              <SectionHeader title="Ultimi Deal" accent={ACCENT} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {grid3.map(item => <MediumCard key={item.id} item={item} />)}
              </div>
            </section>
          )}

          {grid3b.length > 0 && (
            <section className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {grid3b.map(item => <MediumCard key={item.id} item={item} />)}
              </div>
            </section>
          )}

          {/* ── ELENCO NOTIZIE RIMANENTI ── */}
          {listNews.length > 0 && (
            <section className="mt-10">
              <SectionHeader title="Tutti i Deal" accent={ACCENT} />
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
                  Ricevi Dealroom ogni settimana
                </h3>
                <p className="mt-2 text-[14px] text-[#666]" style={{ fontFamily: FONT_SANS }}>
                  I round, i deal e gli investimenti più rilevanti del mercato italiano ed europeo.
                </p>
              </div>
              <div>
                <NewsletterSubscribeForm defaultChannel="dealroom" accentColor={ACCENT} />
              </div>
            </div>
          </section>

          <ArchiveSection section="dealroom" accentColor={ACCENT} skipCount={10} />
          <SharedPageFooter />
        </main>
      </div>
    </>
  );
}
