/*
 * ProofPress — RESEARCH Page
 * Design: StartupItalia-inspired — immagini 16:9, titoli Playfair serif, griglia 3 colonne
 * Focus: ricerche e analisi verificate su AI, Startup, Venture Capital
 */
import { useMemo } from "react";
import { Link } from "wouter";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import { trpc } from "@/lib/trpc";
import SEOHead from "@/components/SEOHead";
import VerifyBadge from "@/components/VerifyBadge";
import RequireAuth from "@/components/RequireAuth";
import ArchiveSection from "@/components/ArchiveSection";
import { ExternalLink, ArrowRight, FlaskConical } from "lucide-react";

const ACCENT = "#1a1a1a";
const FONT_SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
const FONT_SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif";

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  startup:         "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80",
  venture_capital: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
  ai_trends:       "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80",
  technology:      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
  market:          "https://images.unsplash.com/photo-1642790551116-18e150f248e3?w=800&q=80"
};

const CATEGORY_LABELS: Record<string, string> = {
  startup: "Startup",
  venture_capital: "Venture Capital",
  ai_trends: "AI Trends",
  technology: "Tecnologia",
  market: "Mercati"
};

function getImageUrl(report: { imageUrl?: string | null; category: string }): string {
  return report.imageUrl || CATEGORY_FALLBACK_IMAGES[report.category] || CATEGORY_FALLBACK_IMAGES["ai_trends"];
}

function getCategoryLabel(cat: string): string {
  return CATEGORY_LABELS[cat] ?? cat;
}

function formatShortDate(str: string): string {
  if (!str) return "";
  try { return new Date(str).toLocaleDateString("it-IT", { day: "numeric", month: "short" }); } catch { return str; }
}

type Report = {
  id: number;
  title: string;
  summary: string;
  keyFindings: string[];
  source: string;
  sourceUrl: string | null;
  category: string;
  region: string;
  dateLabel: string;
  isResearchOfDay?: boolean;
  viewCount: number;
  imageUrl?: string | null;
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

function HeroCard({ report }: { report: Report }) {
  const href = `/research/${report.id}`;
  const imgUrl = getImageUrl(report);
  return (
    <article className="group cursor-pointer">
      <Link href={href}>
        <div className="relative overflow-hidden rounded-lg bg-[#f5f5f5]" style={{ aspectRatio: "16/9" }}>
          <img src={imgUrl} alt={report.title} loading="eager" decoding="async"
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>
      </Link>
      <div className="mt-3">
        <span className="inline-block text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 mb-2"
          style={{ background: ACCENT, color: "#fff", fontFamily: FONT_SANS, borderRadius: "3px" }}>
          {getCategoryLabel(report.category)}
        </span>
        <Link href={href}>
          <h2 className="text-[#1a1a1a] hover:text-[#e63946] transition-colors leading-tight"
            style={{ fontFamily: FONT_SERIF, fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, lineHeight: 1.2 }}>
            {report.title}
          </h2>
        </Link>
        <p className="mt-2 text-[15px] leading-relaxed text-[#555]"
          style={{ fontFamily: FONT_SANS, lineHeight: 1.65 }}>
          {report.summary.slice(0, 240)}{report.summary.length > 240 ? "…" : ""}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <p className="text-[11px] text-[#999] uppercase tracking-widest" style={{ fontFamily: FONT_SANS }}>
            {report.source}{report.dateLabel ? ` · ${formatShortDate(report.dateLabel)}` : ""}
          </p>
          {report.sourceUrl && (
            <a href={report.sourceUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest hover:underline"
              style={{ color: "#e63946", fontFamily: FONT_SANS }}>
              Fonte <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        <VerifyBadge hash={`research-${report.id}-${report.source}-${report.dateLabel}`} size="sm" />
      </div>
    </article>
  );
}

function MediumCard({ report }: { report: Report }) {
  const href = `/research/${report.id}`;
  const imgUrl = getImageUrl(report);
  return (
    <article className="group cursor-pointer">
      <Link href={href}>
        <div className="overflow-hidden rounded-md bg-[#f5f5f5]" style={{ aspectRatio: "16/9" }}>
          <img src={imgUrl} alt={report.title} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
        </div>
      </Link>
      <div className="mt-2.5">
        <span className="inline-block text-[9px] font-bold uppercase tracking-[0.1em] px-1.5 py-0.5 mb-1.5"
          style={{ background: ACCENT, color: "#fff", fontFamily: FONT_SANS, borderRadius: "2px" }}>
          {getCategoryLabel(report.category)}
        </span>
        <Link href={href}>
          <h3 className="text-[#1a1a1a] hover:text-[#e63946] transition-colors leading-snug line-clamp-3"
            style={{ fontFamily: FONT_SERIF, fontSize: "clamp(15px, 1.6vw, 18px)", fontWeight: 700, lineHeight: 1.3 }}>
            {report.title}
          </h3>
        </Link>
        <p className="mt-1.5 text-[12px] text-[#666] line-clamp-2" style={{ fontFamily: FONT_SANS, lineHeight: 1.55 }}>
          {report.summary.slice(0, 120)}{report.summary.length > 120 ? "…" : ""}
        </p>
        <p className="mt-1 text-[10px] text-[#999] uppercase tracking-widest" style={{ fontFamily: FONT_SANS }}>
          {report.source}{report.dateLabel ? ` · ${formatShortDate(report.dateLabel)}` : ""}
        </p>
      </div>
    </article>
  );
}

function SmallRow({ report }: { report: Report }) {
  const href = `/research/${report.id}`;
  return (
    <div className="py-3 border-b border-[#f0f0f0] last:border-0">
      <div className="flex items-center gap-1 mb-1">
        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5"
          style={{ background: ACCENT, color: "#fff", fontFamily: FONT_SANS, borderRadius: "2px" }}>
          {getCategoryLabel(report.category)}
        </span>
        {report.dateLabel && (
          <span className="text-[9px] text-[#999]" style={{ fontFamily: FONT_SANS }}>
            {formatShortDate(report.dateLabel)}
          </span>
        )}
      </div>
      <Link href={href}>
        <p className="text-[14px] font-bold text-[#1a1a1a] hover:text-[#e63946] transition-colors leading-snug line-clamp-2"
          style={{ fontFamily: FONT_SERIF }}>
          {report.title}
        </p>
      </Link>
      <p className="text-[10px] text-[#999] mt-0.5" style={{ fontFamily: FONT_SANS }}>{report.source}</p>
    </div>
  );
}

export default function Research() {
  const { data: reports, isLoading } = trpc.news.getResearchReports.useQuery({ limit: 30 });

  const filteredReports = useMemo(() => reports ?? [], [reports]);
  const heroReport = useMemo(() => filteredReports[0] ?? null, [filteredReports]);
  const grid3 = useMemo(() => filteredReports.slice(1, 4), [filteredReports]);
  const grid3b = useMemo(() => filteredReports.slice(4, 7), [filteredReports]);
  const listReports = useMemo(() => filteredReports.slice(7, 30), [filteredReports]);

  return (
    <RequireAuth>
      <>
        <SEOHead
          title="Research — Proof Press"
          description="Analisi approfondite su AI, Startup e Venture Capital. Ricerche verificate da ProofPress per chi prende decisioni."
          canonical="https://proofpress.ai/research"
          ogImage="https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/og-research-cisacbT2pWcoc5B4U27pjr.png"
          ogSiteName="Proof Press"
        />
        <div className="min-h-screen" style={{ background: "#ffffff" }}>
          <SharedPageHeader />
          <main className="max-w-[1280px] mx-auto px-4 pb-16">

            {isLoading ? (
              <div className="py-20 text-center">
                <div className="animate-pulse space-y-6">
                  <div className="h-64 bg-[#f0f0f0] rounded-lg" />
                  <div className="grid grid-cols-3 gap-6">
                    {[1,2,3].map(i => <div key={i} className="h-48 bg-[#f0f0f0] rounded-lg" />)}
                  </div>
                </div>
              </div>
            ) : !reports || reports.length === 0 ? (
              <div className="text-center py-20">
                <FlaskConical className="w-10 h-10 text-[#ccc] mx-auto mb-4" />
                <p className="text-[#999] text-lg font-semibold" style={{ fontFamily: FONT_SERIF }}>
                  Le ricerche di oggi sono in preparazione
                </p>
                <p className="text-[#bbb] text-sm mt-2" style={{ fontFamily: FONT_SANS }}>
                  Torna tra poco — vengono generate ogni mattina alle 06:00
                </p>
              </div>
            ) : (
              <>
                {/* ── HERO + KEY FINDINGS ── */}
                <section className="mt-6">
                  <SectionHeader title="Research — Analisi e Ricerche" accent={ACCENT} />
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
                    <div>
                      {heroReport && <HeroCard report={heroReport} />}
                    </div>
                    <div>
                      {heroReport && heroReport.keyFindings.length > 0 && (
                        <div className="border border-[#e8e8e8] rounded-lg p-5">
                          <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: `2px solid ${ACCENT}` }}>
                            <span className="text-[11px] font-bold uppercase tracking-[0.15em]"
                              style={{ color: ACCENT, fontFamily: FONT_SANS }}>
                              Key Findings
                            </span>
                          </div>
                          <p className="text-[15px] font-bold text-[#1a1a1a] leading-snug mb-3"
                            style={{ fontFamily: FONT_SERIF }}>
                            {heroReport.title}
                          </p>
                          <ul className="space-y-3">
                            {heroReport.keyFindings.slice(0, 5).map((f: string, i: number) => (
                              <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-[#555]"
                                style={{ fontFamily: FONT_SANS }}>
                                <span className="font-black shrink-0 text-[11px] mt-0.5"
                                  style={{ color: "#e63946", fontFamily: FONT_SANS }}>
                                  {i + 1}.
                                </span>
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-3 px-3 py-1.5 rounded text-[11px] font-semibold"
                            style={{ background: "#f5f5f5", color: ACCENT, fontFamily: FONT_SANS }}>
                            Fonte: {heroReport.source}
                          </div>
                          <Link href={`/research/${heroReport.id}`}>
                            <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest hover:underline cursor-pointer"
                              style={{ color: ACCENT, fontFamily: FONT_SANS }}>
                              Leggi tutto <ArrowRight className="w-3 h-3" />
                            </span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* ── GRIGLIA 3 COLONNE ── */}
                {grid3.length > 0 && (
                  <section className="mt-10">
                    <SectionHeader title="Ricerche di Oggi" accent={ACCENT} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {grid3.map(r => <MediumCard key={r.id} report={r} />)}
                    </div>
                  </section>
                )}

                {grid3b.length > 0 && (
                  <section className="mt-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {grid3b.map(r => <MediumCard key={r.id} report={r} />)}
                    </div>
                  </section>
                )}

                {/* ── ELENCO RICERCHE RIMANENTI ── */}
                {listReports.length > 0 && (
                  <section className="mt-10">
                    <SectionHeader title="Altre Ricerche" accent={ACCENT} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                      {listReports.map(r => <SmallRow key={r.id} report={r} />)}
                    </div>
                  </section>
                )}
              </>
            )}

            <ArchiveSection section="research" accentColor={ACCENT} skipCount={10} />
            <SharedPageFooter />
          </main>
        </div>
      </>
    </RequireAuth>
  );
}
