/**
 * IDEASMART — Venture Capital
 * Pagina dedicata al Venture Capital: notizie Finance filtrate + ricerche VC
 * Palette: carta (#faf8f3), inchiostro (#1a1a1a), accento VC (#1a1a1a), oro (#b8860b)
 */
import { useMemo } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import SEOHead from "@/components/SEOHead";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import SectionChannelBar from "@/components/SectionChannelBar";
import ReadersCounter from "@/components/ReadersCounter";
import NewsletterSubscribeForm from "@/components/NewsletterSubscribeForm";

const VC_GREEN = "#1a1a1a";
const VC_LIGHT = "#f0fdf4";
const VC_GOLD = "#b8860b";
const INK = "#1a1a1a";
const PAPER = "#faf8f3";

function Divider({ thick = false }: { thick?: boolean }) {
  return <div className={`w-full ${thick ? "border-t-4" : "border-t"} border-[#1a1a1a]`} />;
}
function ThinDivider() { return <div className="w-full border-t border-[#1a1a1a]/20" />; }

function VCBadge({ label, accent = VC_GREEN, bg = VC_LIGHT }: { label: string; accent?: string; bg?: string }) {
  return (
    <span className="inline-block text-[9px] font-bold uppercase tracking-[0.15em] px-1.5 py-0.5"
      style={{ background: bg, color: accent, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
      {label}
    </span>
  );
}

function formatShortDate(str: string): string {
  if (!str) return "";
  try { return new Date(str).toLocaleDateString("it-IT", { day: "numeric", month: "short" }); } catch { return str; }
}

function NewsHero({ item }: {
  item: { id: number; title: string; summary: string; category: string; imageUrl?: string | null; sourceName?: string; publishedAt?: string; sourceUrl?: string };
}) {
  const href = item.sourceUrl && item.sourceUrl !== "#" ? item.sourceUrl : `https://www.google.com/search?q=${encodeURIComponent(item.title)}`;
  return (
    <article className="group">
      {item.imageUrl && (
        <a href={href} target="_blank" rel="noopener noreferrer">
          <div className="relative overflow-hidden mb-3" style={{ height: "220px" }}>
            <img src={item.imageUrl} alt={item.title} loading="eager"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(26,26,46,0.6) 0%, transparent 60%)" }} />
          </div>
        </a>
      )}
      <VCBadge label={item.category || "Venture Capital"} />
      <a href={href} target="_blank" rel="noopener noreferrer">
        <h2 className="mt-2 text-2xl font-bold leading-tight text-[#1a1a1a] hover:underline cursor-pointer"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
          {item.title}
        </h2>
      </a>
      <p className="mt-2 text-sm leading-relaxed text-[#1a1a1a]/65 line-clamp-4"
        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
        {item.summary}
      </p>
      {item.sourceName && (
        <p className="mt-1.5 text-[10px] text-[#1a1a1a]/40" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
          {item.sourceName}{item.publishedAt ? ` · ${formatShortDate(item.publishedAt)}` : ""}
        </p>
      )}
    </article>
  );
}

function NewsMedium({ item, showImage = false }: {
  item: { id: number; title: string; summary: string; category: string; imageUrl?: string | null; sourceName?: string; publishedAt?: string; sourceUrl?: string };
  showImage?: boolean;
}) {
  const href = item.sourceUrl && item.sourceUrl !== "#" ? item.sourceUrl : `https://www.google.com/search?q=${encodeURIComponent(item.title)}`;
  return (
    <article className="py-3 group">
      {showImage && item.imageUrl && (
        <a href={href} target="_blank" rel="noopener noreferrer">
          <img src={item.imageUrl} alt={item.title} loading="lazy"
            className="w-full h-28 object-cover mb-2 cursor-pointer hover:opacity-90 transition-opacity"
            style={{ border: "1px solid rgba(26,26,46,0.1)" }} />
        </a>
      )}
      <VCBadge label={item.category || "Finance"} />
      <a href={href} target="_blank" rel="noopener noreferrer">
        <h3 className="mt-1 text-base font-bold leading-snug text-[#1a1a1a] hover:underline cursor-pointer"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
          {item.title}
        </h3>
      </a>
      <p className="mt-0.5 text-sm leading-relaxed text-[#1a1a1a]/60 line-clamp-2"
        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
        {item.summary}
      </p>
      {item.sourceName && (
        <p className="mt-0.5 text-[9px] text-[#1a1a1a]/35" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
          {item.sourceName}{item.publishedAt ? ` · ${formatShortDate(item.publishedAt)}` : ""}
        </p>
      )}
    </article>
  );
}

function NewsCompact({ item }: {
  item: { id: number; title: string; category: string; sourceName?: string; publishedAt?: string; sourceUrl?: string };
}) {
  const href = item.sourceUrl && item.sourceUrl !== "#" ? item.sourceUrl : `https://www.google.com/search?q=${encodeURIComponent(item.title)}`;
  return (
    <div className="py-2 grid grid-cols-[auto_1fr] gap-2 items-start">
      <VCBadge label={item.category || "VC"} />
      <div>
        <a href={href} target="_blank" rel="noopener noreferrer">
          <span className="text-sm font-semibold text-[#1a1a1a] hover:underline cursor-pointer leading-snug"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
            {item.title}
          </span>
        </a>
        {item.sourceName && (
          <p className="text-[9px] text-[#1a1a1a]/35 mt-0.5" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
            {item.sourceName}{item.publishedAt ? ` · ${formatShortDate(item.publishedAt)}` : ""}
          </p>
        )}
      </div>
    </div>
  );
}

const RESEARCH_CATEGORY_LABELS: Record<string, { label: string; accent: string; bg: string }> = {
  venture_capital: { label: "Venture Capital", accent: "#1a1a1a", bg: "#f0fdf4" },
  startup: { label: "Startup", accent: "#1a1a1a", bg: "#e0f2fe" },
  ai_trends: { label: "AI Trends", accent: "#2a2a2a", bg: "#f3e8ff" },
  technology: { label: "Technology", accent: "#0891b2", bg: "#e0f7fa" },
  market: { label: "Market", accent: "#b8860b", bg: "#fef9c3" },
};

function ResearchCard({ report }: {
  report: {
    id: number; title: string; summary: string; source: string; category: string;
    keyFindings: string[]; imageUrl?: string | null; dateLabel?: string; region?: string;
  };
}) {
  const cat = RESEARCH_CATEGORY_LABELS[report.category] ?? { label: report.category, accent: "#1a1a1a", bg: VC_LIGHT };
  const kf = Array.isArray(report.keyFindings) ? report.keyFindings : [];
  return (
    <Link href="/research">
      <article className="py-3 cursor-pointer group">
        {report.imageUrl && (
          <div className="overflow-hidden mb-2" style={{ height: "100px" }}>
            <img src={report.imageUrl} alt={report.title} loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
        )}
        <VCBadge label={cat.label} accent={cat.accent} bg={cat.bg} />
        <h4 className="mt-1 text-sm font-bold leading-snug text-[#1a1a1a] group-hover:underline line-clamp-2"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
          {report.title}
        </h4>
        {kf[0] && (
          <p className="mt-1 text-[10px] text-[#1a1a1a]/50 italic line-clamp-2"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
            <span className="font-bold not-italic" style={{ color: cat.accent }}>→</span> {kf[0]}
          </p>
        )}
        <p className="mt-1 text-[9px] text-[#1a1a1a]/35" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
          {report.source}{report.dateLabel ? ` · ${report.dateLabel}` : ""}
        </p>
      </article>
    </Link>
  );
}

export default function VentureCapital() {
  const today = useMemo(() => new Date(), []);
  const queryOpts = { staleTime: 10 * 60 * 1000, refetchOnWindowFocus: false };

  const { data: financeData, isLoading: financeLoading } = trpc.news.getLatest.useQuery(
    { limit: 20, section: "finance" }, queryOpts
  );
  const { data: vcResearch } = trpc.news.getResearchByCategory.useQuery(
    { category: "venture_capital", limit: 10 }, queryOpts
  );
  const { data: startupResearch } = trpc.news.getResearchByCategory.useQuery(
    { category: "startup", limit: 6 }, queryOpts
  );

  const financeNews = financeData ?? [];
  const updateTicker = useMemo(() => {
    return `Aggiornato · ${today.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}`;
  }, [today]);

  return (
    <>
      <SEOHead
        title="Venture Capital — IdeaSmart"
        description="Analisi quotidiane su Venture Capital, round di investimento, startup finanziate e mercati. Dati dalle principali fonti di ricerca globali."
        canonical="https://ideasmart.ai/venture-capital"
        ogSiteName="IdeaSmart"
      />

      <div style={{ background: PAPER, minHeight: "100vh", color: INK }}>

        {/* ── TESTATA ── */}
        <header style={{ borderBottom: `4px solid ${INK}` }}>
          <div className="max-w-7xl mx-auto px-4 pt-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <Link href="/">
                <span className="text-xs font-bold uppercase tracking-[0.15em] cursor-pointer hover:underline"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", color: INK }}>
                  ← IdeaSmart
                </span>
              </Link>
              <ReadersCounter />
            </div>

            {/* Titolo sezione */}
            <div className="text-center py-4 border-y border-[#1a1a1a]/20">
              <p className="text-[9px] uppercase tracking-[0.3em] text-[#1a1a1a]/40 mb-1"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                IdeaSmart
              </p>
              <h1 className="text-5xl font-black uppercase tracking-tight"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", color: "#1a1a1a", letterSpacing: "-0.02em" }}>
                Venture Capital
              </h1>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#1a1a1a]/50"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                Round · Investimenti · Startup Finanziate · Mercati
              </p>
              <p className="mt-1 text-[9px] italic text-[#1a1a1a]/30"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                {updateTicker}
              </p>
            </div>
          </div>

          {/* Breaking news ticker */}
          <BreakingNewsTicker />

          {/* Nav canali */}
          <SectionChannelBar />
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6">

          {/* ══════════════════════════════════════════════════════════════════
              BLOCCO 1 — APERTURA: Hero VC + lista notizie + ricerche VC
          ══════════════════════════════════════════════════════════════════ */}
          {!financeLoading && financeNews.length > 0 && (
            <section>
              <Divider thick />
              <div className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]/40"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                    Notizie del Giorno
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                    — Finance & Venture Capital
                  </span>
                </div>
                <Link href="/finance">
                  <span className="text-[10px] font-bold uppercase tracking-widest hover:underline cursor-pointer"
                    style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                    Finance →
                  </span>
                </Link>
              </div>
              <Divider />

              {/* Griglia: Hero (2 col) | Lista (1 col) | Ricerche VC (1 col) */}
              <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-0 mt-4">

                {/* Hero Finance */}
                <div className="pr-0 md:pr-6 pb-4 md:pb-0 border-b md:border-b-0 md:border-r border-[#1a1a1a]/15">
                  {financeNews[0] && <NewsHero item={financeNews[0]} />}

                  {/* Seconda notizia media */}
                  {financeNews[1] && (
                    <div className="mt-4 pt-4 border-t border-[#1a1a1a]/15">
                      <NewsMedium item={financeNews[1]} showImage={!!financeNews[1].imageUrl} />
                    </div>
                  )}
                </div>

                {/* Lista notizie Finance */}
                <div className="px-0 md:px-5 py-4 md:py-0 border-b md:border-b-0 md:border-r border-[#1a1a1a]/15">
                  <div className="mb-2">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]/40"
                      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                      Ultime notizie
                    </span>
                    <div className="border-t-2 border-[#1a1a1a] mt-1" />
                  </div>
                  {financeNews.slice(2, 10).map((item: typeof financeNews[0], i: number) => (
                    <div key={item.id}>
                      {i > 0 && <ThinDivider />}
                      <NewsCompact item={item} />
                    </div>
                  ))}
                </div>

                {/* Ricerche VC */}
                <div className="pl-0 md:pl-5 py-4 md:py-0">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em]"
                      style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                      Research VC
                    </span>
                    <Link href="/research">
                      <span className="text-[9px] uppercase tracking-widest hover:underline"
                        style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                        Tutte →
                      </span>
                    </Link>
                  </div>
                  <div className="border-t-2 mb-2" style={{ borderColor: "#1a1a1a" }} />

                  {vcResearch && vcResearch.length > 0 ? (
                    vcResearch.slice(0, 5).map((r, i) => (
                      <div key={r.id}>
                        {i > 0 && <ThinDivider />}
                        <ResearchCard report={r} />
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#1a1a1a]/40 italic py-4"
                      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
                      Le ricerche VC di oggi saranno disponibili a breve.
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              BLOCCO 2 — GRIGLIA RICERCHE VC COMPLETE
          ══════════════════════════════════════════════════════════════════ */}
          {vcResearch && vcResearch.length > 5 && (
            <section className="mt-10">
              <Divider thick />
              <div className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]/40"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                    IdeaSmart
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                    — Venture Capital & Startup Funding
                  </span>
                </div>
                <Link href="/research">
                  <span className="text-[10px] font-bold uppercase tracking-widest hover:underline cursor-pointer"
                    style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                    Tutte le ricerche →
                  </span>
                </Link>
              </div>
              <div className="border-t-2" style={{ borderColor: "#1a1a1a" }} />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 mt-3">
                {vcResearch.slice(5).map((r, i: number) => (
                  <div key={r.id}
                    className={`py-3 ${i % 3 !== 0 ? "pl-4 border-l border-[#1a1a1a]/12" : "pr-4"}`}>
                    <ResearchCard report={r} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              BLOCCO 3 — RICERCHE STARTUP CORRELATE
          ══════════════════════════════════════════════════════════════════ */}
          {startupResearch && startupResearch.length > 0 && (
            <section className="mt-10">
              <Divider thick />
              <div className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]/40"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                    Startup & Ecosistema
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                    — Ricerche correlate al VC
                  </span>
                </div>
                <Link href="/startup">
                  <span className="text-[10px] font-bold uppercase tracking-widest hover:underline cursor-pointer"
                    style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                    Startup News →
                  </span>
                </Link>
              </div>
              <div className="border-t-2" style={{ borderColor: "#1a1a1a" }} />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 mt-3">
                {startupResearch.map((r, i: number) => (
                  <div key={r.id}
                    className={`py-3 ${i % 3 !== 0 ? "pl-4 border-l border-[#1a1a1a]/12" : "pr-4"}`}>
                    <ResearchCard report={r} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              BLOCCO 4 — ALTRE NOTIZIE FINANCE
          ══════════════════════════════════════════════════════════════════ */}
          {financeNews.length > 10 && (
            <section className="mt-10">
              <Divider thick />
              <div className="py-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]/40"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                  Altre notizie Finance & Markets
                </span>
                <span className="text-[9px] italic text-[#1a1a1a]/30"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                  {updateTicker}
                </span>
              </div>
              <Divider />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 mt-3">
                {financeNews.slice(10, 20).map((item: typeof financeNews[0], i: number) => (
                  <div key={item.id}
                    className={`py-3 ${i % 3 !== 0 ? "pl-4 border-l border-[#1a1a1a]/12" : "pr-4"}`}>
                    <NewsMedium item={item} showImage={i < 3 && !!item.imageUrl} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              CTA — RICERCHE DEDICATE
          ══════════════════════════════════════════════════════════════════ */}
          <section className="mt-12">
            <Divider thick />
            <div className="py-10 text-center" style={{ background: INK }}>
              <p className="text-[9px] uppercase tracking-[0.3em] mb-2"
                style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                IdeaSmart
              </p>
              <h2 className="text-3xl font-black uppercase mb-3"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", color: "#faf8f3" }}>
                Ricerche Dedicate su Venture Capital
              </h2>
              <p className="text-sm max-w-xl mx-auto mb-6"
                style={{ color: "rgba(250,248,243,0.65)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
                Analisi personalizzate su deal flow, mercati verticali, comparazioni di round e benchmark di settore.
                Il team IdeaSmart è disponibile per ricerche su misura per investitori, fondi e corporate.
              </p>
              <a href="mailto:info@ideasmart.ai?subject=Ricerca%20Dedicata%20Venture%20Capital"
                className="inline-block px-8 py-3 font-bold uppercase tracking-widest text-sm transition-all hover:opacity-90"
                style={{ background: "#1a1a1a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                Contatta il Team Research →
              </a>
            </div>
          </section>

          {/* Newsletter */}
          <div className="mt-10">
            <Divider thick />
            <div className="py-6">
              <NewsletterSubscribeForm defaultChannel="finance" accentColor={VC_GREEN} />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8">
            <Divider thick />
            <div className="py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-xs text-[#1a1a1a]/40"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                {`© ${today.getFullYear()} IdeaSmart · Venture Capital · AI · Startup`}
              </p>
              <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-end">
                {[
                  { href: "/", label: "Home", color: INK },
                  { href: "/research", label: "Research", color: "#1a1a1a" },
                  { href: "/finance", label: "Finance", color: "#1a1a1a" },
                  { href: "/startup", label: "Startup", color: "#1a1a1a" },
                  { href: "/ai", label: "AI4Business", color: "#2a2a2a" },
                  { href: "/chi-siamo", label: "Chi Siamo", color: INK },
                ].map(item => (
                  <Link key={item.href} href={item.href}>
                    <span className="text-[10px] hover:underline cursor-pointer font-bold"
                      style={{ color: item.color, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

        </main>
      </div>
    </>
  );
}
