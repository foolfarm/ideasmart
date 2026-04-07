/**
 * IDEASMART — DEALROOM · Sezione Deal, Round e Investimenti VC
 * Layout editoriale: deal del giorno, notizie in colonne, archivio.
 * NO filtri, NO testata sezione, NO sidebar — layout pulito come AI e Startup.
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
import VerifyBadge from "@/components/VerifyBadge";

const ACCENT = "#1a4a2e";
const ACCENT_LIGHT = "#f0f7f3";
const INK = "#1a1a1a";

function formatShortDate(str: string): string {
  if (!str) return "";
  try {
    return new Date(str).toLocaleDateString("it-IT", { day: "numeric", month: "short" });
  } catch {
    return str;
  }
}

function Divider({ thick = false }: { thick?: boolean }) {
  return <div className={`w-full ${thick ? "border-t-4" : "border-t"} border-[${INK}]`} />;
}

function ThinDivider() {
  return <div className="w-full border-t border-[#1a1a1a]/20" />;
}

function DealBadge({ label }: { label: string }) {
  return (
    <span
      className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm"
      style={{ background: ACCENT_LIGHT, color: ACCENT }}
    >
      {label}
    </span>
  );
}

function NewsCard({
  item,
  showImage = false,
}: {
  item: {
    id: number;
    title: string;
    summary: string;
    category: string;
    imageUrl?: string | null;
    sourceName?: string;
    publishedAt?: string;
    sourceUrl?: string;
    verifyHash?: string | null;
  };
  showImage?: boolean;
}) {
  const href =
    item.sourceUrl && item.sourceUrl !== "#"
      ? item.sourceUrl
      : `https://www.google.com/search?q=${encodeURIComponent(item.title)}`;
  return (
    <div className="py-3">
      {showImage && item.imageUrl && (
        <a href={href} target="_blank" rel="noopener noreferrer">
          <img
            src={item.imageUrl}
            alt={item.title}
            loading="lazy"
            decoding="async"
            className="w-full h-32 object-cover mb-3 cursor-pointer grayscale-[15%] hover:grayscale-0 transition-all"
            style={{ border: "1px solid rgba(26,74,46,0.15)" }}
          />
        </a>
      )}
      <DealBadge label={item.category || "Deal"} />
      <a href={href} target="_blank" rel="noopener noreferrer">
        <h3 className="mt-2 text-base font-bold leading-snug text-[#1a1a1a] hover:underline cursor-pointer">
          {item.title}
        </h3>
      </a>
      <p className="mt-1 text-sm leading-relaxed text-[#1a1a1a]/65 line-clamp-3">
        {item.summary}
      </p>
      {item.sourceName && (
        <p className="mt-1 text-[10px] text-[#1a1a1a]/35">
          {item.sourceName}
          {item.publishedAt ? ` \u00b7 ${formatShortDate(item.publishedAt)}` : ""}
        </p>
      )}
      {item.verifyHash && (
        <div className="mt-1">
          <VerifyBadge hash={item.verifyHash} size="sm" />
        </div>
      )}
    </div>
  );
}

function NewsRow({
  item,
}: {
  item: {
    id: number;
    title: string;
    category: string;
    sourceName?: string;
    publishedAt?: string;
    sourceUrl?: string;
  };
}) {
  const href =
    item.sourceUrl && item.sourceUrl !== "#"
      ? item.sourceUrl
      : `https://www.google.com/search?q=${encodeURIComponent(item.title)}`;
  return (
    <div className="py-2.5 grid grid-cols-[auto_1fr] gap-3 items-start">
      <DealBadge label={item.category || "Deal"} />
      <div>
        <a href={href} target="_blank" rel="noopener noreferrer">
          <span className="text-sm font-semibold text-[#1a1a1a] hover:underline cursor-pointer">
            {item.title}
          </span>
        </a>
        {item.sourceName && (
          <span className="ml-2 text-[10px] text-[#1a1a1a]/35">
            {item.sourceName}
            {item.publishedAt ? ` \u00b7 ${formatShortDate(item.publishedAt)}` : ""}
          </span>
        )}
      </div>
    </div>
  );
}

export default function DealroomHome() {
  const { data: newsData } = trpc.news.getLatest.useQuery(
    { limit: 50, section: "dealroom" },
    { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false },
  );

  const allNews = useMemo(() => newsData || [], [newsData]);

  // Deduplica per titolo (normalizzato)
  const dedupedNews = useMemo(() => {
    const seen = new Set<string>();
    return allNews.filter((n) => {
      const key = n.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [allNews]);

  // Distribuzione notizie
  const heroNews = dedupedNews.find((n) => n.imageUrl) || dedupedNews[0] || null;
  const secondaryNews = dedupedNews.filter((n) => n.id !== heroNews?.id).slice(0, 2);
  const gridNews = dedupedNews.filter((n) => n.id !== heroNews?.id).slice(2, 8);
  const listNews = dedupedNews.filter((n) => n.id !== heroNews?.id).slice(8, 30);

  return (
    <>
      <SEOHead
        title="DEALROOM \u2014 IDEASMART"
        description="Notizie su round, funding, seed, Series A/B e investimenti venture capital. Focus sul mercato italiano, europeo e globale."
        canonical="https://ideasmart.biz/dealroom"
        ogSiteName="IdeaSmart"
      />

      <div className="min-h-screen" style={{ background: "#faf8f3", color: INK }}>
        <SharedPageHeader />
        <BreakingNewsTicker />
        <div className="sticky top-0 z-50 border-b border-[#1a1a1a]/15" style={{ background: "#faf8f3" }}>
          <SectionChannelBar />
        </div>

        <main className="max-w-6xl mx-auto px-4 pb-12">
          {/* SEZIONE 1: Deal del Giorno */}
          <div>
            <div className="py-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]/40">
                Deal del Giorno
              </span>
            </div>
            <ThinDivider />

            {heroNews ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="pr-0 md:pr-5 py-4">
                  <DealBadge label={heroNews.category || "Funding"} />
                  <a
                    href={
                      heroNews.sourceUrl && heroNews.sourceUrl !== "#"
                        ? heroNews.sourceUrl
                        : `https://www.google.com/search?q=${encodeURIComponent(heroNews.title)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <h2 className="mt-3 text-2xl md:text-3xl font-bold leading-tight text-[#1a1a1a] hover:underline cursor-pointer">
                      {heroNews.title}
                    </h2>
                  </a>
                  <ThinDivider />
                  <p className="mt-3 text-base leading-relaxed text-[#1a1a1a]/80">
                    {heroNews.summary.slice(0, 280)}
                    {heroNews.summary.length > 280 ? "\u2026" : ""}
                  </p>
                  <a
                    href={
                      heroNews.sourceUrl && heroNews.sourceUrl !== "#"
                        ? heroNews.sourceUrl
                        : `https://www.google.com/search?q=${encodeURIComponent(heroNews.title)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span
                      className="mt-3 inline-block text-xs font-bold uppercase tracking-widest hover:underline"
                      style={{ color: ACCENT }}
                    >
                      Leggi l&apos;articolo originale &rarr;
                    </span>
                  </a>
                </div>
                <div className="py-4 pl-0 md:pl-5 border-l-0 md:border-l border-[#1a1a1a]/20">
                  {heroNews.imageUrl ? (
                    <a
                      href={
                        heroNews.sourceUrl && heroNews.sourceUrl !== "#"
                          ? heroNews.sourceUrl
                          : `https://www.google.com/search?q=${encodeURIComponent(heroNews.title)}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={heroNews.imageUrl}
                        alt={heroNews.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-52 object-cover cursor-pointer grayscale-[15%] hover:grayscale-0 transition-all"
                        style={{ border: "1px solid rgba(26,74,46,0.15)" }}
                      />
                    </a>
                  ) : (
                    <div
                      className="w-full h-52 flex items-center justify-center"
                      style={{ background: ACCENT_LIGHT, border: `1px solid ${ACCENT}30` }}
                    >
                      <span className="text-4xl opacity-30">&#128188;</span>
                    </div>
                  )}
                  {heroNews.sourceName && (
                    <p className="mt-2 text-xs text-[#1a1a1a]/40 italic">
                      Fonte: {heroNews.sourceName}
                      {heroNews.publishedAt
                        ? ` \u00b7 ${formatShortDate(heroNews.publishedAt)}`
                        : ""}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-[#1a1a1a]/30">
                <p>Caricamento notizie dealroom&hellip;</p>
                <p className="mt-2 text-xs text-[#1a1a1a]/20">
                  Le notizie vengono aggiornate automaticamente ogni giorno alle 01:30 CET.
                </p>
              </div>
            )}

            <ThinDivider />

            {secondaryNews.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 mt-2">
                {secondaryNews.map((item, i) => (
                  <div
                    key={item.id}
                    className={i > 0 ? "border-l border-[#1a1a1a]/20 pl-4" : "pr-4"}
                  >
                    <NewsCard item={item} showImage />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SEZIONE 2: Griglia notizie */}
          {gridNews.length > 0 && (
            <div className="mt-6">
              <Divider thick />
              <div className="py-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]/40">
                  Ultime Notizie Deal &amp; Funding
                </span>
              </div>
              <ThinDivider />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mt-2">
                {gridNews.slice(0, 3).map((item, i) => (
                  <div
                    key={item.id}
                    className={i > 0 ? "border-l border-[#1a1a1a]/20 pl-5" : "pr-5"}
                  >
                    <NewsCard item={item} showImage={i === 0} />
                  </div>
                ))}
              </div>
              {gridNews.length > 3 && (
                <>
                  <ThinDivider />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mt-2">
                    {gridNews.slice(3, 6).map((item, i) => (
                      <div
                        key={item.id}
                        className={i > 0 ? "border-l border-[#1a1a1a]/20 pl-5" : "pr-5"}
                      >
                        <NewsCard item={item} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* SEZIONE 3: Elenco notizie rimanenti */}
          {listNews.length > 0 && (
            <div className="mt-8">
              <Divider thick />
              <div className="py-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]/40">
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

          {/* SEZIONE 4: Newsletter */}
          <div className="mt-10">
            <Divider thick />
            <div className="py-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: ACCENT }}
                >
                  Newsletter
                </span>
                <h3 className="mt-2 text-2xl font-bold text-[#1a1a1a]">
                  Ricevi DEALROOM ogni venerd&igrave;
                </h3>
                <p className="mt-2 text-sm text-[#1a1a1a]/65">
                  I round, i deal e gli investimenti pi&ugrave; importanti
                  dell&apos;ecosistema startup italiano ed europeo, direttamente
                  nella tua inbox.
                </p>
              </div>
              <div>
                <NewsletterSubscribeForm
                  defaultChannel="dealroom"
                  accentColor={ACCENT}
                />
              </div>
            </div>
          </div>

          {/* Archivio */}
          <ArchiveSection section="dealroom" accentColor={ACCENT} skipCount={10} />

          <div className="max-w-[1280px] mx-auto">
            <SharedPageFooter />
          </div>
        </main>
      </div>
    </>
  );
}
