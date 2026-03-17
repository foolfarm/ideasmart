/**
 * IDEASMART — Prima Pagina di Giornale
 * Layout editoriale classico: testata, notizia del giorno, colonne canali, griglia sezioni, elenco misto.
 * Palette: bianco carta (#faf8f3), inchiostro (#1a1a2e), accenti per sezione.
 * Tipografia: Playfair Display (titoli), Source Serif 4 (corpo), Space Mono (label/meta).
 */
import { useMemo } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import SEOHead from "@/components/SEOHead";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";

const SECTION_COLORS = {
  ai: { accent: "#0a6e5c", light: "#e6f4f1", label: "AI4Business", path: "/ai" },
  music: { accent: "#5b21b6", light: "#ede9fe", label: "ITsMusic", path: "/music" },
  startup: { accent: "#c2410c", light: "#fff0e6", label: "Startup News", path: "/startup" },
  finance: { accent: "#15803d", light: "#f0fdf4", label: "Finance & Markets", path: "/finance" },
  health: { accent: "#0369a1", light: "#eff6ff", label: "Health & Biotech", path: "/health" },
  sport: { accent: "#b45309", light: "#fffbeb", label: "Sport & Business", path: "/sport" },
  luxury: { accent: "#7c3aed", light: "#faf5ff", label: "Lifestyle & Luxury", path: "/luxury" },
  news: { accent: "#1a1f2e", light: "#f1f5f9", label: "News Italia", path: "/news" },
  motori: { accent: "#dc2626", light: "#fef2f2", label: "Motori", path: "/motori" },
  tennis: { accent: "#65a30d", light: "#f7fee7", label: "Tennis", path: "/tennis" },
  basket: { accent: "#ea580c", light: "#fff7ed", label: "Basket", path: "/basket" },
};

function formatDateIT(date: Date): string {
  return date.toLocaleDateString("it-IT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function formatShortDate(str: string): string {
  if (!str) return "";
  try {
    return new Date(str).toLocaleDateString("it-IT", { day: "numeric", month: "short" });
  } catch { return str; }
}

function Divider({ thick = false }: { thick?: boolean }) {
  return <div className={`w-full ${thick ? "border-t-4" : "border-t"} border-[#1a1a2e]`} />;
}

function ThinDivider() {
  return <div className="w-full border-t border-[#1a1a2e]/20" />;
}

type SectionKey = "ai" | "music" | "startup" | "finance" | "health" | "sport" | "luxury" | "news" | "motori" | "tennis" | "basket";
function SectionLabel({ section }: { section: SectionKey }) {
  const s = SECTION_COLORS[section];
  return (
    <span
      className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm"
      style={{ background: s.light, color: s.accent, fontFamily: "'Space Mono', monospace" }}
    >
      {s.label}
    </span>
  );
}

function HeroNews({ news, editorial }: {
  news: { id: number; title: string; summary: string; category: string; imageUrl?: string | null; sourceName?: string; publishedAt?: string; section?: string; sourceUrl?: string };
  editorial?: { id?: number; title: string; subtitle?: string | null; body: string } | null;
}) {
  const section = (news.section as "ai" | "music" | "startup") || "ai";
  const s = SECTION_COLORS[section];
  // Se c'è un editoriale, link interno all'editoriale; altrimenti link diretto alla fonte della notizia
  const href = editorial?.id
    ? `/${section}/editoriale/${editorial.id}`
    : (news.sourceUrl && news.sourceUrl !== '#' ? news.sourceUrl : `https://www.google.com/search?q=${encodeURIComponent(news.title)}`);
  const isExternal = !editorial?.id;
  const bodyText = editorial?.body || news.summary;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
      <div className="pr-0 md:pr-6 py-4">
        <SectionLabel section={section} />
        {isExternal ? (
          <a href={href} rel="noopener noreferrer">
            <h2 className="mt-3 text-3xl md:text-4xl font-bold leading-tight text-[#1a1a2e] hover:underline cursor-pointer"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {editorial?.title || news.title}
            </h2>
          </a>
        ) : (
          <Link href={href}>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold leading-tight text-[#1a1a2e] hover:underline cursor-pointer"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {editorial?.title || news.title}
            </h2>
          </Link>
        )}
        {(editorial?.subtitle || news.category) && (
          <p className="mt-2 text-base font-semibold text-[#1a1a2e]/60 italic"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
            {editorial?.subtitle || news.category}
          </p>
        )}
        <ThinDivider />
        <p className="mt-3 text-base leading-relaxed text-[#1a1a2e]/80"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
          {bodyText.slice(0, 320)}{bodyText.length > 320 ? "…" : ""}
        </p>
        {isExternal ? (
          <a href={href} rel="noopener noreferrer">
            <span className="mt-4 inline-block text-xs font-bold uppercase tracking-widest hover:underline"
              style={{ color: s.accent, fontFamily: "'Space Mono', monospace" }}>
              Leggi l'articolo originale →
            </span>
          </a>
        ) : (
          <Link href={href}>
            <span className="mt-4 inline-block text-xs font-bold uppercase tracking-widest hover:underline"
              style={{ color: s.accent, fontFamily: "'Space Mono', monospace" }}>
              Continua a leggere →
            </span>
          </Link>
        )}
      </div>
      <div className="py-4 pl-0 md:pl-6 border-l-0 md:border-l border-[#1a1a2e]/20">
        {news.imageUrl ? (
          isExternal ? (
            <a href={href} rel="noopener noreferrer">
              <img src={news.imageUrl} alt={news.title}
                className="w-full h-56 md:h-72 object-cover grayscale-[20%] hover:grayscale-0 transition-all cursor-pointer"
                style={{ border: "1px solid rgba(26,26,46,0.15)" }} />
            </a>
          ) : (
            <Link href={href}>
              <img src={news.imageUrl} alt={news.title}
                className="w-full h-56 md:h-72 object-cover grayscale-[20%] hover:grayscale-0 transition-all cursor-pointer"
                style={{ border: "1px solid rgba(26,26,46,0.15)" }} />
            </Link>
          )
        ) : (
          <div className="w-full h-56 md:h-72 flex items-center justify-center"
            style={{ background: s.light, border: `1px solid ${s.accent}30` }}>
            <span className="text-4xl opacity-30">📰</span>
          </div>
        )}
        {news.sourceName && (
          <p className="mt-2 text-xs text-[#1a1a2e]/40 italic"
            style={{ fontFamily: "'Space Mono', monospace" }}>
            Fonte: {news.sourceName}{news.publishedAt ? ` · ${formatShortDate(news.publishedAt)}` : ""}
          </p>
        )}
      </div>
    </div>
  );
}

function NewsCard({ item, section, showImage = false }: {
  item: { id: number; title: string; summary: string; category: string; imageUrl?: string | null; sourceName?: string; publishedAt?: string; sourceUrl?: string };
  section: SectionKey;
  showImage?: boolean;
}) {
  const s = SECTION_COLORS[section];
  const href = item.sourceUrl && item.sourceUrl !== '#' ? item.sourceUrl : `https://www.google.com/search?q=${encodeURIComponent(item.title)}`;
  return (
    <div className="py-3">
      {showImage && item.imageUrl && (
        <a href={href} rel="noopener noreferrer">
          <img src={item.imageUrl} alt={item.title}
            className="w-full h-32 object-cover mb-2 grayscale-[20%] hover:grayscale-0 transition-all cursor-pointer"
            style={{ border: "1px solid rgba(26,26,46,0.1)" }} />
        </a>
      )}
      <a href={href} rel="noopener noreferrer">
        <h3 className="text-base font-bold leading-snug text-[#1a1a2e] hover:underline cursor-pointer"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {item.title}
        </h3>
      </a>
      <p className="mt-1 text-sm leading-relaxed text-[#1a1a2e]/65 line-clamp-3"
        style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
        {item.summary}
      </p>
      {item.sourceName && (
        <p className="mt-1 text-[10px] text-[#1a1a2e]/35"
          style={{ fontFamily: "'Space Mono', monospace" }}>
          {item.sourceName}{item.publishedAt ? ` · ${formatShortDate(item.publishedAt)}` : ""}
        </p>
      )}
    </div>
  );
}

function NewsRow({ item, section }: {
  item: { id: number; title: string; summary: string; category: string; sourceName?: string; publishedAt?: string; sourceUrl?: string };
  section: SectionKey;
}) {
  const s = SECTION_COLORS[section];
  const href = item.sourceUrl && item.sourceUrl !== '#' ? item.sourceUrl : `https://www.google.com/search?q=${encodeURIComponent(item.title)}`;
  return (
    <div className="py-2.5 grid grid-cols-[auto_1fr] gap-3 items-start">
      <SectionLabel section={section} />
      <div>
        <a href={href} rel="noopener noreferrer">
          <span className="text-sm font-semibold text-[#1a1a2e] hover:underline cursor-pointer leading-snug"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {item.title}
          </span>
        </a>
        {item.sourceName && (
          <span className="ml-2 text-[10px] text-[#1a1a2e]/35"
            style={{ fontFamily: "'Space Mono', monospace" }}>
            {item.sourceName}{item.publishedAt ? ` · ${formatShortDate(item.publishedAt)}` : ""}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const today = useMemo(() => new Date(), []);

  const { data: aiNews } = trpc.news.getLatest.useQuery({ limit: 8, section: "ai" });
  const { data: musicNews } = trpc.news.getLatest.useQuery({ limit: 6, section: "music" });
  const { data: startupNews } = trpc.news.getLatest.useQuery({ limit: 6, section: "startup" });
  const { data: financeNews } = trpc.news.getLatest.useQuery({ limit: 4, section: "finance" });
  const { data: healthNews } = trpc.news.getLatest.useQuery({ limit: 4, section: "health" });
  const { data: sportNews } = trpc.news.getLatest.useQuery({ limit: 4, section: "sport" });
  const { data: luxuryNews } = trpc.news.getLatest.useQuery({ limit: 4, section: "luxury" });
  const { data: newsNews } = trpc.news.getLatest.useQuery({ limit: 4, section: "news" });
  const { data: motoriNews } = trpc.news.getLatest.useQuery({ limit: 4, section: "motori" });
  const { data: tennisNews } = trpc.news.getLatest.useQuery({ limit: 4, section: "tennis" });
  const { data: basketNews } = trpc.news.getLatest.useQuery({ limit: 4, section: "basket" });
  const { data: aiEditorial } = trpc.editorial.getLatest.useQuery({ section: "ai" });

  const heroNews = useMemo(() => {
    const all = aiNews || [];
    return all.find(n => n.imageUrl) || all[0] || null;
  }, [aiNews]);

  const aiSecondary = useMemo(() => {
    if (!aiNews) return [];
    return aiNews.filter(n => n.id !== heroNews?.id).slice(0, 2);
  }, [aiNews, heroNews]);

  type MixedNewsItem = { id: number; title: string; summary: string; category: string; sourceName: string; sourceUrl: string; publishedAt: string; imageUrl: string | null; section: SectionKey };

  const mixedNews = useMemo(() => {
    const ai: MixedNewsItem[] = (aiNews || []).filter(n => n.id !== heroNews?.id).slice(2, 5).map(n => ({ ...n, section: "ai" as const }));
    const music: MixedNewsItem[] = (musicNews || []).slice(2, 5).map(n => ({ ...n, section: "music" as const }));
    const startup: MixedNewsItem[] = (startupNews || []).slice(2, 5).map(n => ({ ...n, section: "startup" as const }));
    const result: MixedNewsItem[] = [];
    const maxLen = Math.max(ai.length, music.length, startup.length);
    for (let i = 0; i < maxLen; i++) {
      if (ai[i]) result.push(ai[i]);
      if (music[i]) result.push(music[i]);
      if (startup[i]) result.push(startup[i]);
    }
    return result;
  }, [aiNews, musicNews, startupNews, heroNews]);

  const newChannelsNews = useMemo(() => {
    const finance: MixedNewsItem[] = (financeNews || []).slice(0, 3).map(n => ({ ...n, section: "finance" as const }));
    const health: MixedNewsItem[] = (healthNews || []).slice(0, 3).map(n => ({ ...n, section: "health" as const }));
    const sport: MixedNewsItem[] = (sportNews || []).slice(0, 3).map(n => ({ ...n, section: "sport" as const }));
    const luxury: MixedNewsItem[] = (luxuryNews || []).slice(0, 3).map(n => ({ ...n, section: "luxury" as const }));
    const result: MixedNewsItem[] = [];
    const maxLen = Math.max(finance.length, health.length, sport.length, luxury.length);
    for (let i = 0; i < maxLen; i++) {
      if (finance[i]) result.push(finance[i]);
      if (health[i]) result.push(health[i]);
      if (sport[i]) result.push(sport[i]);
      if (luxury[i]) result.push(luxury[i]);
    }
    return result;
  }, [financeNews, healthNews, sportNews, luxuryNews]);

  return (
    <>
      <SEOHead
        title="IDEASMART — Testata Giornalistica HumanLess"
        description="La prima testata giornalistica HumanLess: AI, Musica, Startup, Finance, Health, Sport e Luxury. Informazione senza agenda, solo notizie."
        canonical="https://ideasmart.ai"
        ogSiteName="IDEASMART"
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,600&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,300;1,8..60,400&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
      `}</style>

      <div className="min-h-screen" style={{ background: "#faf8f3", color: "#1a1a2e" }}>

        {/* TESTATA */}
        <header className="max-w-6xl mx-auto px-4 pt-6 pb-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#1a1a2e]/50 uppercase tracking-widest"
              style={{ fontFamily: "'Space Mono', monospace" }}>
              {formatDateIT(today)}
            </span>
            <span className="text-xs text-[#1a1a2e]/40 uppercase tracking-widest"
              style={{ fontFamily: "'Space Mono', monospace" }}>
              Testata 100% HumanLess
            </span>
          </div>

          <Divider thick />

          <div className="text-center py-5">
            <Link href="/">
              <h1 className="text-5xl md:text-7xl font-black tracking-tight text-[#1a1a2e] cursor-pointer hover:opacity-80 transition-opacity"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.02em" }}>
                IdeaSmart
              </h1>
            </Link>
            <p className="mt-1 text-xs uppercase tracking-[0.3em] text-[#1a1a2e]/50"
              style={{ fontFamily: "'Space Mono', monospace" }}>
              La Prima Testata Giornalistica HumanLess italiana
            </p>
          </div>

          <Divider thick />

          <nav className="flex flex-wrap items-center justify-center gap-0 py-2 border-t border-[#1a1a2e]/15">
            {(["ai", "music", "startup", "finance", "health", "sport", "luxury", "news", "motori", "tennis", "basket"] as const).map((sec, i) => {
              const s = SECTION_COLORS[sec];
              return (
                <Link key={sec} href={s.path}>
                  <span className="px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-opacity hover:opacity-50 cursor-pointer text-[#1a1a2e]"
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      borderLeft: i > 0 ? "1px solid rgba(26,26,46,0.18)" : "none",
                      letterSpacing: "0.08em",
                    }}>
                    {s.label}
                  </span>
                </Link>
              );
            })}
            <Link href="/edicola">
              <span className="px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em] transition-opacity hover:opacity-50 cursor-pointer text-[#1a1a2e]"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  borderLeft: "1px solid rgba(26,26,46,0.18)",
                }}>
                Edicola
              </span>
            </Link>
            <Link href="/manifesto">
              <span className="px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em] transition-opacity hover:opacity-50 cursor-pointer text-[#1a1a2e]"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  borderLeft: "1px solid rgba(26,26,46,0.18)",
                }}>
                Manifesto
              </span>
            </Link>
          </nav>

          <Divider />
        </header>
        <BreakingNewsTicker />

        {/* CORPO */}
        <main className="max-w-6xl mx-auto px-4 pb-12">

          {/* Sezione 1: Notizia del giorno + Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-0 mt-0">

            <div className="pr-0 lg:pr-6 border-r-0 lg:border-r border-[#1a1a2e]/20">
              <div className="py-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a2e]/40"
                  style={{ fontFamily: "'Space Mono', monospace" }}>
                  Notizia del Giorno
                </span>
              </div>
              <ThinDivider />

              {heroNews ? (
                <HeroNews news={{ ...heroNews, section: "ai" }} editorial={aiEditorial} />
              ) : (
                <div className="py-12 text-center text-[#1a1a2e]/30">
                  <p style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>Caricamento notizie…</p>
                </div>
              )}

              <ThinDivider />

              {aiSecondary.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 mt-2">
                  {aiSecondary.map((item, i) => (
                    <div key={item.id} className={i > 0 ? "border-l border-[#1a1a2e]/20 pl-4" : "pr-4"}>
                      <NewsCard item={item} section="ai" showImage />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="pl-0 lg:pl-5 mt-6 lg:mt-0">
              <div className="py-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a2e]/40"
                  style={{ fontFamily: "'Space Mono', monospace" }}>
                  I Canali
                </span>
              </div>
              <ThinDivider />
              {(["ai", "music", "startup", "finance", "health", "sport", "luxury", "news", "motori", "tennis", "basket"] as const).map((sec) => {
                const s = SECTION_COLORS[sec];
                return (
                  <Link key={sec} href={s.path}>
                    <div className="py-2.5 flex items-center justify-between group cursor-pointer hover:opacity-50 transition-opacity border-b border-[#1a1a2e]/10">
                      <span className="text-sm font-bold text-[#1a1a2e]"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                        {s.label}
                      </span>                     <span className="text-xs text-[#1a1a2e]/30 group-hover:text-[#1a1a2e]/60 transition-colors"
                        style={{ fontFamily: "'Space Mono', monospace" }}>
                        →
                      </span>
                    </div>
                  </Link>
                );
              })}

              {aiEditorial && (
                <div className="mt-5">
                  <div className="py-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a2e]/40"
                      style={{ fontFamily: "'Space Mono', monospace" }}>
                      Editoriale
                    </span>
                  </div>
                  <ThinDivider />
                  <div className="py-3">
                    <p className="text-sm font-bold text-[#1a1a2e] leading-snug"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      {aiEditorial.title}
                    </p>
                    {aiEditorial.subtitle && (
                      <p className="mt-1 text-xs italic text-[#1a1a2e]/55"
                        style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                        {aiEditorial.subtitle}
                      </p>
                    )}
                    <p className="mt-2 text-xs leading-relaxed text-[#1a1a2e]/65 line-clamp-5"
                      style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                      {aiEditorial.body}
                    </p>
                    <Link href="/ai">
                      <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-widest hover:underline"
                        style={{ color: SECTION_COLORS.ai.accent, fontFamily: "'Space Mono', monospace" }}>
                        Leggi tutto →
                      </span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sezione 2: Griglia 3 colonne */}
          <div className="mt-6">
            <Divider thick />
            <div className="py-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a2e]/40"
                style={{ fontFamily: "'Space Mono', monospace" }}>
                Dalle Redazioni
              </span>
            </div>
            <ThinDivider />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mt-2">
              {(["ai", "music", "startup"] as const).map((sec, colIdx) => {
                const newsForSection = sec === "ai" ? aiNews : sec === "music" ? musicNews : startupNews;
                const items = (newsForSection || []).filter(n => n.id !== heroNews?.id).slice(0, 3);
                const s = SECTION_COLORS[sec];
                return (
                  <div key={sec} className={colIdx > 0 ? "border-l border-[#1a1a2e]/20 pl-5" : "pr-5"}>
                    <div className="py-2">
                      <Link href={s.path}>
                        <span className="text-xs font-bold uppercase tracking-widest hover:underline cursor-pointer"
                          style={{ color: s.accent, fontFamily: "'Space Mono', monospace" }}>
                          {s.label}
                        </span>
                      </Link>
                    </div>
                    <div className="border-t-2" style={{ borderColor: s.accent }} />
                    {items.length > 0 ? (
                      items.map((item, i) => (
                        <div key={item.id}>
                          <NewsCard item={item} section={sec} showImage={i === 0} />
                          {i < items.length - 1 && <ThinDivider />}
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-[#1a1a2e]/25 text-sm">Caricamento…</div>
                    )}
                    <Link href={s.path}>
                      <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-widest hover:underline cursor-pointer"
                        style={{ color: s.accent, fontFamily: "'Space Mono', monospace" }}>
                        Tutte le notizie →
                      </span>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sezione 3: Elenco misto */}
          {mixedNews.length > 0 && (
            <div className="mt-8">
              <Divider thick />
              <div className="py-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a2e]/40"
                  style={{ fontFamily: "'Space Mono', monospace" }}>
                  Altre Notizie del Giorno
                </span>
              </div>
              <ThinDivider />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 mt-1">
                {mixedNews.map((item, i) => (
                  <div key={`${item.section}-${item.id}`}>
                    <NewsRow item={item} section={item.section} />
                    {i < mixedNews.length - 1 && <ThinDivider />}
                  </div>
                ))}
              </div>
            </div>
          )}

          

          {/* Sezione 4: Nuovi Canali — Finance, Health, Sport, Luxury */}
          <div className="mt-8">
            <Divider thick />
            <div className="py-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a2e]/40"
                style={{ fontFamily: "'Space Mono', monospace" }}>
                I Nuovi Canali
              </span>
            </div>
            <ThinDivider />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-0 mt-2">
              {(["finance", "health", "sport", "luxury"] as const).map((sec, colIdx) => {
                const newsForSection = sec === "finance" ? financeNews : sec === "health" ? healthNews : sec === "sport" ? sportNews : luxuryNews;
                const items = (newsForSection || []).slice(0, 3);
                const s = SECTION_COLORS[sec];
                return (
                  <div key={sec} className={colIdx > 0 ? "border-l border-[#1a1a2e]/20 pl-4" : "pr-4"}>
                    <div className="py-2">
                      <Link href={s.path}>
                        <span className="text-xs font-bold uppercase tracking-widest hover:underline cursor-pointer"
                          style={{ color: s.accent, fontFamily: "'Space Mono', monospace" }}>
                          {s.label}
                        </span>
                      </Link>
                    </div>
                    <div className="border-t-2" style={{ borderColor: s.accent }} />
                    {items.length > 0 ? (
                      items.map((item, i) => (
                        <div key={item.id}>
                          <div className="py-2.5">
                            <a href={item.sourceUrl && item.sourceUrl !== '#' ? item.sourceUrl : `https://www.google.com/search?q=${encodeURIComponent(item.title)}`}
                              target="_blank" rel="noopener noreferrer">
                              <span className="text-sm font-semibold text-[#1a1a2e] hover:underline cursor-pointer leading-snug"
                                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                {item.title}
                              </span>
                            </a>
                            {item.sourceName && (
                              <p className="mt-0.5 text-[10px] text-[#1a1a2e]/35" style={{ fontFamily: "'Space Mono', monospace" }}>
                                {item.sourceName}
                              </p>
                            )}
                          </div>
                          {i < items.length - 1 && <ThinDivider />}
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-[#1a1a2e]/25 text-sm">In arrivo…</div>
                    )}
                    <Link href={s.path}>
                      <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-widest hover:underline cursor-pointer"
                        style={{ color: s.accent, fontFamily: "'Space Mono', monospace" }}>
                        Tutte le notizie →
                      </span>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sezione 5: News Italia, Motori, Tennis, Basket */}
          <div className="mt-8">
            <Divider thick />
            <div className="py-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a2e]/40"
                style={{ fontFamily: "'Space Mono', monospace" }}>
                News &amp; Sport
              </span>
            </div>
            <ThinDivider />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-0 mt-2">
              {(["news", "motori", "tennis", "basket"] as const).map((sec, colIdx) => {
                const newsForSection = sec === "news" ? newsNews : sec === "motori" ? motoriNews : sec === "tennis" ? tennisNews : basketNews;
                const items = (newsForSection || []).slice(0, 3);
                const s = SECTION_COLORS[sec];
                return (
                  <div key={sec} className={colIdx > 0 ? "border-l border-[#1a1a2e]/20 pl-4" : "pr-4"}>
                    <div className="py-2">
                      <Link href={s.path}>
                        <span className="text-xs font-bold uppercase tracking-widest hover:underline cursor-pointer"
                          style={{ color: s.accent, fontFamily: "'Space Mono', monospace" }}>
                          {s.label}
                        </span>
                      </Link>
                    </div>
                    <div className="border-t-2" style={{ borderColor: s.accent }} />
                    {items.length > 0 ? (
                      items.map((item, i) => (
                        <div key={item.id}>
                          <div className="py-2.5">
                            <a href={item.sourceUrl && item.sourceUrl !== '#' ? item.sourceUrl : `https://www.google.com/search?q=${encodeURIComponent(item.title)}`}
                              target="_blank" rel="noopener noreferrer">
                              <span className="text-sm font-semibold text-[#1a1a2e] hover:underline cursor-pointer leading-snug"
                                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                {item.title}
                              </span>
                            </a>
                            {item.sourceName && (
                              <p className="mt-0.5 text-[10px] text-[#1a1a2e]/35" style={{ fontFamily: "'Space Mono', monospace" }}>
                                {item.sourceName}
                              </p>
                            )}
                          </div>
                          {i < items.length - 1 && <ThinDivider />}
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-[#1a1a2e]/25 text-sm">In arrivo…</div>
                    )}
                    <Link href={s.path}>
                      <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-widest hover:underline cursor-pointer"
                        style={{ color: s.accent, fontFamily: "'Space Mono', monospace" }}>
                        Tutte le notizie →
                      </span>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          

          {/* Footer testata */}
          <div className="mt-12">
            <Divider thick />
            <div className="py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-xs text-[#1a1a2e]/40"
                style={{ fontFamily: "'Space Mono', monospace" }}>
                {`© ${today.getFullYear()} IdeaSmart · Testata Giornalistica 100% HumanLess`}
              </p>
              <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-end">
                {(["ai", "music", "startup", "finance", "health", "sport", "luxury", "news", "motori", "tennis", "basket"] as const).map((sec) => {
                  const s = SECTION_COLORS[sec];
                  return (
                    <Link key={sec} href={s.path}>
                      <span className="text-xs hover:underline cursor-pointer"
                        style={{ color: s.accent, fontFamily: "'Space Mono', monospace" }}>
                        {s.label}
                      </span>
                    </Link>
                  );
                })}
                <Link href="/manifesto">
                  <span className="text-xs hover:underline cursor-pointer font-bold"
                    style={{ color: "#0a6e5c", fontFamily: "'Space Mono', monospace" }}>
                    Manifesto HumanLess
                  </span>
                </Link>
                <Link href="/privacy">
                  <span className="text-xs hover:underline cursor-pointer text-[#1a1a2e]/40"
                    style={{ fontFamily: "'Space Mono', monospace" }}>
                    Privacy Policy
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
