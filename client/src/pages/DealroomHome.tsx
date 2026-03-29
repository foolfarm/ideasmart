/**
 * IDEASMART — DEALROOM · Sezione Deal, Round e Investimenti VC
 * Layout editoriale da giornale: testata sezione, deal del giorno, notizie in colonne, archivio.
 * Focus: mercato italiano → europeo → globale.
 * Palette: bianco carta (#faf8f3), inchiostro (#1a1a1a), accento verde scuro (#1a4a2e).
 */
import { useMemo } from "react";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import ArchiveSection from "@/components/ArchiveSection";
import { trpc } from "@/lib/trpc";
import NewsletterSubscribeForm from "@/components/NewsletterSubscribeForm";
import SEOHead from "@/components/SEOHead";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import SectionChannelBar from "@/components/SectionChannelBar";
import RequireAuth from "@/components/RequireAuth";

const ACCENT = "#1a4a2e";
const ACCENT_LIGHT = "#f0f7f3";
const INK = "#1a1a1a";

function formatDateIT(date: Date): string {
  return date.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function formatShortDate(str: string): string {
  if (!str) return "";
  try { return new Date(str).toLocaleDateString("it-IT", { day: "numeric", month: "short" }); } catch { return str; }
}
function Divider({ thick = false }: { thick?: boolean }) {
  return <div className={`w-full ${thick ? "border-t-4" : "border-t"} border-[#1a1a1a]`} />;
}
function ThinDivider() { return <div className="w-full border-t border-[#1a1a1a]/20" />; }

function DealBadge({ label }: { label: string }) {
  return (
    <span className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm"
      style={{ background: ACCENT_LIGHT, color: ACCENT, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
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
            style={{ border: "1px solid rgba(26,74,46,0.15)" }} />
        </a>
      )}
      <DealBadge label={item.category || "Deal"} />
      <a href={href} target="_blank" rel="noopener noreferrer">
        <h3 className="mt-2 text-base font-bold leading-snug text-[#1a1a1a] hover:underline cursor-pointer"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
          {item.title}
        </h3>
      </a>
      <p className="mt-1 text-sm leading-relaxed text-[#1a1a1a]/65 line-clamp-3"
        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
        {item.summary}
      </p>
      {item.sourceName && (
        <p className="mt-1 text-[10px] text-[#1a1a1a]/35" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
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
      <DealBadge label={item.category || "Deal"} />
      <div>
        <a href={href} target="_blank" rel="noopener noreferrer">
          <span className="text-sm font-semibold text-[#1a1a1a] hover:underline cursor-pointer"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
            {item.title}
          </span>
        </a>
        {item.sourceName && (
          <span className="ml-2 text-[10px] text-[#1a1a1a]/35" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
            {item.sourceName}{item.publishedAt ? ` · ${formatShortDate(item.publishedAt)}` : ""}
          </span>
        )}
      </div>
    </div>
  );
}

export default function DealroomHome() {
  const today = useMemo(() => new Date(), []);

  const { data: newsData } = trpc.news.getLatest.useQuery(
    { limit: 30, section: "dealroom" },
    { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false }
  );

  const news = newsData || [];

  // Separa le notizie per mercato (Italia prima, poi Europa, poi Global)
  const italianNews = news.filter(n =>
    n.sourceName?.toLowerCase().includes("italian") ||
    n.sourceName?.toLowerCase().includes("italia") ||
    n.sourceName?.toLowerCase().includes("startupitalia") ||
    n.sourceName?.toLowerCase().includes("ilsole24ore") ||
    n.sourceName?.toLowerCase().includes("corriere") ||
    n.sourceName?.toLowerCase().includes("startupbusiness") ||
    n.sourceName?.toLowerCase().includes("ventureup") ||
    n.sourceName?.toLowerCase().includes("tech.eu") ||
    n.category?.toLowerCase().includes("italia") ||
    n.category?.toLowerCase().includes("italian")
  );

  const heroNews = news.find(n => n.imageUrl) || news[0] || null;
  const secondaryNews = news.filter(n => n.id !== heroNews?.id).slice(0, 2);
  const remainingNews = news.filter(n => n.id !== heroNews?.id).slice(2, 8);
  const listNews = news.filter(n => n.id !== heroNews?.id).slice(8, 25);

  return (
    <>
      <SEOHead
        title="DEALROOM — IDEASMART"
        description="Notizie su round, funding, seed, Series A/B e investimenti venture capital. Focus sul mercato italiano, europeo e globale."
        canonical="https://ideasmart.ai/dealroom"
        ogSiteName="IdeaSmart"
      />

      <div className="min-h-screen" style={{ background: "#faf8f3", color: INK }}>

        <SharedPageHeader />
        <BreakingNewsTicker />
        <SectionChannelBar />

        <RequireAuth>
          <main className="max-w-6xl mx-auto px-4 pb-12">

            {/* TESTATA SEZIONE */}
            <div className="py-4 border-b-4 border-[#1a1a1a] mb-0">
              <div className="flex items-baseline gap-4">
                <h1 className="text-4xl font-black uppercase tracking-tight text-[#1a1a1a]"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
                  DEALROOM
                </h1>
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#1a1a1a]/40"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                  Round · Funding · VC · Exit
                </span>
              </div>
              <p className="mt-1 text-sm text-[#1a1a1a]/55 italic"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
                {formatDateIT(today)} — Mercato italiano, europeo e globale
              </p>
            </div>

            {/* SEZIONE 1: Hero + Sidebar info */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-0 mt-0">

              <div className="pr-0 lg:pr-6 border-r-0 lg:border-r border-[#1a1a1a]/20">
                <div className="py-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]/40"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                    Deal del Giorno
                  </span>
                </div>
                <ThinDivider />

                {heroNews ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                    <div className="pr-0 md:pr-5 py-4">
                      <DealBadge label={heroNews.category || "Funding"} />
                      <a href={heroNews.sourceUrl && heroNews.sourceUrl !== '#' ? heroNews.sourceUrl : `https://www.google.com/search?q=${encodeURIComponent(heroNews.title)}`}
                        target="_blank" rel="noopener noreferrer">
                        <h2 className="mt-3 text-2xl md:text-3xl font-bold leading-tight text-[#1a1a1a] hover:underline cursor-pointer"
                          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
                          {heroNews.title}
                        </h2>
                      </a>
                      <ThinDivider />
                      <p className="mt-3 text-base leading-relaxed text-[#1a1a1a]/80"
                        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
                        {heroNews.summary.slice(0, 280)}{heroNews.summary.length > 280 ? "…" : ""}
                      </p>
                      <a href={heroNews.sourceUrl && heroNews.sourceUrl !== '#' ? heroNews.sourceUrl : `https://www.google.com/search?q=${encodeURIComponent(heroNews.title)}`}
                        target="_blank" rel="noopener noreferrer">
                        <span className="mt-3 inline-block text-xs font-bold uppercase tracking-widest hover:underline"
                          style={{ color: ACCENT, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                          Leggi l'articolo originale →
                        </span>
                      </a>
                    </div>
                    <div className="py-4 pl-0 md:pl-5 border-l-0 md:border-l border-[#1a1a1a]/20">
                      {heroNews.imageUrl ? (
                        <a href={heroNews.sourceUrl && heroNews.sourceUrl !== '#' ? heroNews.sourceUrl : `https://www.google.com/search?q=${encodeURIComponent(heroNews.title)}`}
                          target="_blank" rel="noopener noreferrer">
                          <img src={heroNews.imageUrl} alt={heroNews.title} loading="lazy" decoding="async"
                            className="w-full h-52 object-cover cursor-pointer grayscale-[15%] hover:grayscale-0 transition-all"
                            style={{ border: "1px solid rgba(26,74,46,0.15)" }} />
                        </a>
                      ) : (
                        <div className="w-full h-52 flex items-center justify-center"
                          style={{ background: ACCENT_LIGHT, border: `1px solid ${ACCENT}30` }}>
                          <span className="text-4xl opacity-30">💼</span>
                        </div>
                      )}
                      {heroNews.sourceName && (
                        <p className="mt-2 text-xs text-[#1a1a1a]/40 italic"
                          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                          Fonte: {heroNews.sourceName}{heroNews.publishedAt ? ` · ${formatShortDate(heroNews.publishedAt)}` : ""}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-[#1a1a1a]/30">
                    <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
                      Caricamento notizie dealroom…
                    </p>
                    <p className="mt-2 text-xs text-[#1a1a1a]/20">
                      Le notizie vengono aggiornate automaticamente ogni ora.
                    </p>
                  </div>
                )}

                <ThinDivider />

                {secondaryNews.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 mt-2">
                    {secondaryNews.map((item, i) => (
                      <div key={item.id} className={i > 0 ? "border-l border-[#1a1a1a]/20 pl-4" : "pr-4"}>
                        <NewsCard item={item} showImage />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar: info canale */}
              <div className="pl-0 lg:pl-5 mt-6 lg:mt-0">
                <div className="py-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]/40"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                    Cos'è DEALROOM
                  </span>
                </div>
                <ThinDivider />
                <div className="py-3">
                  <p className="text-sm leading-relaxed text-[#1a1a1a]/75"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
                    DEALROOM è il canale di IDEASMART dedicato ai round di finanziamento, agli investimenti venture capital, alle exit e ai deal dell'ecosistema startup.
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-[#1a1a1a]/75"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
                    Copriamo il mercato <strong>italiano</strong> in priorità, poi quello <strong>europeo</strong> e infine quello <strong>globale</strong>.
                  </p>
                  <ThinDivider />
                  <div className="mt-3 space-y-2">
                    {[
                      { label: "Seed", desc: "Pre-seed e seed round" },
                      { label: "Series A/B/C", desc: "Round di crescita" },
                      { label: "Venture Capital", desc: "Fondi e investitori" },
                      { label: "Exit & M&A", desc: "Acquisizioni e IPO" },
                    ].map(({ label, desc }) => (
                      <div key={label} className="flex items-start gap-2 py-1.5">
                        <span className="inline-block text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 mt-0.5 rounded-sm flex-shrink-0"
                          style={{ background: ACCENT_LIGHT, color: ACCENT }}>
                          {label}
                        </span>
                        <span className="text-xs text-[#1a1a1a]/55"
                          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
                          {desc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SEZIONE 2: Griglia notizie */}
            {remainingNews.length > 0 && (
              <div className="mt-6">
                <Divider thick />
                <div className="py-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]/40"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                    Ultime Notizie Deal & Funding
                  </span>
                </div>
                <ThinDivider />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mt-2">
                  {remainingNews.slice(0, 3).map((item, i) => (
                    <div key={item.id} className={i > 0 ? "border-l border-[#1a1a1a]/20 pl-5" : "pr-5"}>
                      <NewsCard item={item} showImage={i === 0} />
                    </div>
                  ))}
                </div>
                {remainingNews.length > 3 && (
                  <>
                    <ThinDivider />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mt-2">
                      {remainingNews.slice(3, 6).map((item, i) => (
                        <div key={item.id} className={i > 0 ? "border-l border-[#1a1a1a]/20 pl-5" : "pr-5"}>
                          <NewsCard item={item} />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* SEZIONE 3: Focus Italia */}
            {italianNews.length > 0 && (
              <div className="mt-8">
                <Divider thick />
                <div className="py-3 flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]/40"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                    Focus Italia
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm"
                    style={{ background: "#f0f7f3", color: ACCENT }}>
                    🇮🇹 Mercato Italiano
                  </span>
                </div>
                <ThinDivider />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mt-2">
                  {italianNews.slice(0, 6).map((item, i) => (
                    <div key={item.id}
                      className={`py-4 ${i % 2 === 1 ? "border-l border-[#1a1a1a]/20 pl-6" : "pr-6"} ${i >= 2 ? "border-t border-[#1a1a1a]/20" : ""}`}>
                      <DealBadge label={item.category || "Italia"} />
                      <a href={item.sourceUrl && item.sourceUrl !== '#' ? item.sourceUrl : `https://www.google.com/search?q=${encodeURIComponent(item.title)}`}
                        target="_blank" rel="noopener noreferrer">
                        <h3 className="mt-2 text-base font-bold text-[#1a1a1a] leading-snug hover:opacity-70 transition-opacity cursor-pointer"
                          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
                          {item.title}
                        </h3>
                      </a>
                      <p className="mt-1 text-sm leading-relaxed text-[#1a1a1a]/65 line-clamp-2"
                        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
                        {item.summary}
                      </p>
                      {item.sourceName && (
                        <p className="mt-1 text-[10px] text-[#1a1a1a]/35">{item.sourceName}{item.publishedAt ? ` · ${formatShortDate(item.publishedAt)}` : ""}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SEZIONE 4: Elenco notizie rimanenti */}
            {listNews.length > 0 && (
              <div className="mt-8">
                <Divider thick />
                <div className="py-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]/40"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
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

            {/* SEZIONE 5: Newsletter */}
            <div className="mt-10">
              <Divider thick />
              <div className="py-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]"
                    style={{ color: ACCENT, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                    Newsletter
                  </span>
                  <h3 className="mt-2 text-2xl font-bold text-[#1a1a1a]"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
                    Ricevi DEALROOM ogni settimana
                  </h3>
                  <p className="mt-2 text-sm text-[#1a1a1a]/65"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
                    I round, i deal e gli investimenti più importanti dell'ecosistema startup italiano ed europeo, direttamente nella tua inbox.
                  </p>
                </div>
                <div>
                  <NewsletterSubscribeForm defaultChannel="startup" accentColor={ACCENT} />
                </div>
              </div>
            </div>

            {/* Archivio */}
            <ArchiveSection
              section="dealroom"
              accentColor={ACCENT}
              skipCount={10}
            />

            <div className="max-w-[1280px] mx-auto">
              <SharedPageFooter />
            </div>
          </main>
        </RequireAuth>
      </div>
    </>
  );
}
