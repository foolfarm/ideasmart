/**
 * IDEASMART — Edicola Digitale
 * Archivio completo di tutte le notizie del giorno con filtri per sezione, categoria e data.
 * Layout: prima pagina di giornale, stile carta/inchiostro.
 */
import { useMemo, useState, useCallback } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import SEOHead from "@/components/SEOHead";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";

const INK = "#1a1a2e";
const PAPER = "#faf8f3";

const SECTION_CONFIG = {
  all:     { label: "Tutte le Sezioni", accent: INK,       light: "#f0ede6" },
  ai:      { label: "AI4Business",      accent: "#0a6e5c", light: "#e6f4f1" },
  music:   { label: "ITsMusic",         accent: "#5b21b6", light: "#ede9fe" },
  startup: { label: "Startup News",     accent: "#c2410c", light: "#fef3ee" },
} as const;

type SectionKey = keyof typeof SECTION_CONFIG;

function formatDateIT(date: Date): string {
  return date.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function formatShortDate(str: string): string {
  if (!str) return "";
  try { return new Date(str).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" }); } catch { return str; }
}
function formatTime(str: string): string {
  if (!str) return "";
  try { return new Date(str).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }); } catch { return str; }
}

function Divider({ thick = false }: { thick?: boolean }) {
  return <div className={`w-full ${thick ? "border-t-4" : "border-t"} border-[#1a1a2e]`} />;
}
function ThinDivider() { return <div className="w-full border-t border-[#1a1a2e]/15" />; }

function SectionBadge({ section }: { section: string }) {
  const cfg = SECTION_CONFIG[section as SectionKey] ?? SECTION_CONFIG.all;
  return (
    <span
      className="inline-block text-[9px] font-bold uppercase tracking-[0.15em] px-1.5 py-0.5 rounded-sm"
      style={{ background: cfg.light, color: cfg.accent, fontFamily: "'Space Mono', monospace" }}
    >
      {section === "ai" ? "AI" : section === "music" ? "MUSIC" : section === "startup" ? "STARTUP" : "ALL"}
    </span>
  );
}

function CategoryBadge({ label, accent, light }: { label: string; accent: string; light: string }) {
  return (
    <span
      className="inline-block text-[9px] font-bold uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-sm"
      style={{ background: light, color: accent, fontFamily: "'Space Mono', monospace" }}
    >
      {label}
    </span>
  );
}

type NewsItem = {
  id: number;
  title: string;
  summary: string;
  category: string;
  section: string;
  sourceName: string;
  publishedAt: string;
  imageUrl?: string | null;
};

function sectionPath(section: string) {
  return section === "music" ? "music" : section === "startup" ? "startup" : "ai";
}

function NewsListItem({ item }: { item: NewsItem }) {
  const href = `/${sectionPath(item.section)}/news/${item.id}`;
  const cfg = SECTION_CONFIG[item.section as SectionKey] ?? SECTION_CONFIG.all;

  return (
    <div className="py-3 grid grid-cols-[1fr_auto] gap-4 items-start">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <SectionBadge section={item.section} />
          <CategoryBadge label={item.category} accent={cfg.accent} light={cfg.light} />
        </div>
        <Link href={href}>
          <h3
            className="text-base font-bold leading-snug text-[#1a1a2e] hover:underline cursor-pointer"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {item.title}
          </h3>
        </Link>
        <p
          className="mt-1 text-sm leading-relaxed text-[#1a1a2e]/60 line-clamp-2"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
        >
          {item.summary}
        </p>
        <div className="mt-1.5 flex items-center gap-3">
          {item.sourceName && (
            <span className="text-[10px] text-[#1a1a2e]/35" style={{ fontFamily: "'Space Mono', monospace" }}>
              {item.sourceName}
            </span>
          )}
          {item.publishedAt && (
            <span className="text-[10px] text-[#1a1a2e]/30" style={{ fontFamily: "'Space Mono', monospace" }}>
              {formatShortDate(item.publishedAt)} · {formatTime(item.publishedAt)}
            </span>
          )}
        </div>
      </div>
      {item.imageUrl && (
        <Link href={href}>
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-20 h-16 object-cover flex-shrink-0 cursor-pointer grayscale-[20%] hover:grayscale-0 transition-all"
            style={{ border: "1px solid rgba(26,26,46,0.1)" }}
          />
        </Link>
      )}
    </div>
  );
}

function NewsGridCard({ item }: { item: NewsItem }) {
  const href = `/${sectionPath(item.section)}/news/${item.id}`;
  const cfg = SECTION_CONFIG[item.section as SectionKey] ?? SECTION_CONFIG.all;

  return (
    <div className="py-3 border-b border-[#1a1a2e]/10 last:border-b-0">
      {item.imageUrl && (
        <Link href={href}>
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-28 object-cover mb-2 cursor-pointer grayscale-[20%] hover:grayscale-0 transition-all"
            style={{ border: "1px solid rgba(26,26,46,0.1)" }}
          />
        </Link>
      )}
      <div className="flex items-center gap-1.5 mb-1">
        <SectionBadge section={item.section} />
        <CategoryBadge label={item.category} accent={cfg.accent} light={cfg.light} />
      </div>
      <Link href={href}>
        <h3
          className="text-sm font-bold leading-snug text-[#1a1a2e] hover:underline cursor-pointer"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {item.title}
        </h3>
      </Link>
      {item.sourceName && (
        <p className="mt-1 text-[10px] text-[#1a1a2e]/35" style={{ fontFamily: "'Space Mono', monospace" }}>
          {item.sourceName}{item.publishedAt ? ` · ${formatShortDate(item.publishedAt)}` : ""}
        </p>
      )}
    </div>
  );
}

export default function Edicola() {
  const today = useMemo(() => new Date(), []);
  const [section, setSection] = useState<SectionKey>("all");
  const [category, setCategory] = useState<string>("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [offset, setOffset] = useState(0);
  const LIMIT = 40;

  const { data, isLoading } = trpc.news.getAll.useQuery({
    section,
    category: category || undefined,
    limit: LIMIT,
    offset,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const categories = useMemo(() => {
    const cats = new Set(items.map(i => i.category));
    return Array.from(cats).sort();
  }, [items]);

  const handleSectionChange = useCallback((s: SectionKey) => {
    setSection(s);
    setCategory("");
    setOffset(0);
  }, []);

  const handleCategoryChange = useCallback((c: string) => {
    setCategory(c);
    setOffset(0);
  }, []);

  const totalPages = Math.ceil(total / LIMIT);
  const currentPage = Math.floor(offset / LIMIT) + 1;

  const mainItems = items.slice(0, Math.ceil(items.length * 0.7));
  const sideItems = items.slice(Math.ceil(items.length * 0.7));

  return (
    <>
      <SEOHead
        title="Edicola — IDEASMART"
        description="Archivio digitale di tutte le notizie del giorno: AI, Musica e Startup. Aggiornato ogni giorno alle 00:00."
        canonical="https://ideasmart.ai/edicola"
        ogSiteName="IDEASMART"
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,600&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,300;1,8..60,400&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
      `}</style>

      <div className="min-h-screen" style={{ background: PAPER, color: INK }}>

        {/* TESTATA */}
        <header className="max-w-6xl mx-auto px-4 pt-6 pb-0">
          <div className="flex items-center justify-between mb-2">
            <Link href="/">
              <span
                className="text-xs text-[#1a1a2e]/40 hover:text-[#1a1a2e]/70 cursor-pointer uppercase tracking-widest"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                ← IdeaSmart
              </span>
            </Link>
            <span className="text-xs text-[#1a1a2e]/40 uppercase tracking-widest" style={{ fontFamily: "'Space Mono', monospace" }}>
              {formatDateIT(today)}
            </span>
          </div>
          <Divider thick />
          <div className="text-center py-5">
            <div
              className="inline-block px-3 py-1 mb-3 rounded-sm text-xs font-bold uppercase tracking-widest"
              style={{ background: "#f0ede6", color: INK, fontFamily: "'Space Mono', monospace" }}
            >
              Archivio Digitale
            </div>
            <Link href="/">
              <h1
                className="text-4xl md:text-6xl font-black tracking-tight text-[#1a1a2e] cursor-pointer hover:opacity-80 transition-opacity"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.02em" }}
              >
                Edicola
              </h1>
            </Link>
            <p className="mt-1 text-xs uppercase tracking-[0.25em] text-[#1a1a2e]/50" style={{ fontFamily: "'Space Mono', monospace" }}>
              Tutte le notizie · AI · Musica · Startup · Aggiornato ogni giorno
            </p>
          </div>
          <Divider thick />

          {/* Filtri sezione */}
          <nav className="flex items-center justify-center gap-0 py-2 flex-wrap">
            {(Object.keys(SECTION_CONFIG) as SectionKey[]).map((sec, i) => {
              const cfg = SECTION_CONFIG[sec];
              const isActive = section === sec;
              return (
                <button
                  key={sec}
                  onClick={() => handleSectionChange(sec)}
                  className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-all"
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    color: isActive ? "#fff" : cfg.accent,
                    background: isActive ? cfg.accent : "transparent",
                    borderLeft: i > 0 ? "1px solid rgba(26,26,46,0.2)" : "none",
                  }}
                >
                  {cfg.label}
                </button>
              );
            })}
          </nav>
          <Divider />
        </header>

        {/* TICKER */}
        <BreakingNewsTicker />

        {/* BARRA FILTRI + CONTATORE */}
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-[#1a1a2e]/15">
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={category}
              onChange={e => handleCategoryChange(e.target.value)}
              className="text-xs border border-[#1a1a2e]/20 rounded-sm px-2 py-1 bg-transparent"
              style={{ fontFamily: "'Space Mono', monospace", color: INK }}
            >
              <option value="">Tutte le categorie</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <span className="text-[10px] text-[#1a1a2e]/40" style={{ fontFamily: "'Space Mono', monospace" }}>
              {isLoading ? "Caricamento..." : `${total} notizie trovate`}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode("list")}
              className="px-2 py-1 text-xs rounded-sm transition-all"
              style={{
                fontFamily: "'Space Mono', monospace",
                background: viewMode === "list" ? INK : "transparent",
                color: viewMode === "list" ? "#fff" : INK + "60",
                border: `1px solid ${INK}30`,
              }}
            >
              ☰ Lista
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className="px-2 py-1 text-xs rounded-sm transition-all"
              style={{
                fontFamily: "'Space Mono', monospace",
                background: viewMode === "grid" ? INK : "transparent",
                color: viewMode === "grid" ? "#fff" : INK + "60",
                border: `1px solid ${INK}30`,
              }}
            >
              ⊞ Griglia
            </button>
          </div>
        </div>

        {/* CORPO PRINCIPALE */}
        <main className="max-w-6xl mx-auto px-4 pb-12">
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="inline-block w-6 h-6 border-2 border-[#1a1a2e]/20 border-t-[#1a1a2e] rounded-full animate-spin mb-4" />
              <p className="text-sm text-[#1a1a2e]/40" style={{ fontFamily: "'Space Mono', monospace" }}>
                Caricamento notizie...
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-2xl mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Nessuna notizia trovata
              </p>
              <p className="text-sm text-[#1a1a2e]/50" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                Prova a cambiare i filtri o torna più tardi.
              </p>
            </div>
          ) : viewMode === "list" ? (
            <div className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-0">
                {/* Colonna principale */}
                <div className="pr-0 lg:pr-6 border-r-0 lg:border-r border-[#1a1a2e]/15">
                  {mainItems.map((item, idx) => (
                    <div key={item.id}>
                      <NewsListItem item={item} />
                      {idx < mainItems.length - 1 && <ThinDivider />}
                    </div>
                  ))}
                </div>
                {/* Sidebar */}
                <div className="pl-0 lg:pl-6 mt-6 lg:mt-0">
                  <div className="py-2">
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a2e]/40"
                      style={{ fontFamily: "'Space Mono', monospace" }}
                    >
                      Altre notizie
                    </span>
                  </div>
                  <ThinDivider />
                  {sideItems.map((item, idx) => (
                    <div key={item.id}>
                      <div className="py-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <SectionBadge section={item.section} />
                        </div>
                        <Link href={`/${sectionPath(item.section)}/news/${item.id}`}>
                          <span
                            className="text-sm font-semibold text-[#1a1a2e] hover:underline cursor-pointer leading-snug"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                          >
                            {item.title}
                          </span>
                        </Link>
                        {item.sourceName && (
                          <p className="mt-0.5 text-[10px] text-[#1a1a2e]/35" style={{ fontFamily: "'Space Mono', monospace" }}>
                            {item.sourceName}
                          </p>
                        )}
                      </div>
                      {idx < sideItems.length - 1 && <ThinDivider />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map(item => (
                <NewsGridCard key={item.id} item={item} />
              ))}
            </div>
          )}

          {/* PAGINAZIONE */}
          {totalPages > 1 && (
            <div className="mt-10">
              <Divider />
              <div className="flex items-center justify-center gap-3 py-4">
                <button
                  onClick={() => setOffset(Math.max(0, offset - LIMIT))}
                  disabled={offset === 0}
                  className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest border border-[#1a1a2e]/30 disabled:opacity-30 hover:bg-[#1a1a2e] hover:text-white transition-all"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  ← Precedente
                </button>
                <span className="text-xs text-[#1a1a2e]/50" style={{ fontFamily: "'Space Mono', monospace" }}>
                  Pag. {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setOffset(offset + LIMIT)}
                  disabled={offset + LIMIT >= total}
                  className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest border border-[#1a1a2e]/30 disabled:opacity-30 hover:bg-[#1a1a2e] hover:text-white transition-all"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  Successiva →
                </button>
              </div>
            </div>
          )}
        </main>

        {/* FOOTER */}
        <footer className="border-t-4 border-[#1a1a2e] bg-[#1a1a2e] text-white/60 py-6">
          <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-widest" style={{ fontFamily: "'Space Mono', monospace" }}>
              IDEASMART · Edicola Digitale · Aggiornata ogni giorno alle 00:00 CET
            </p>
            <div className="flex items-center gap-4">
              <Link href="/ai"><span className="text-xs hover:text-white transition-colors cursor-pointer" style={{ fontFamily: "'Space Mono', monospace" }}>AI4Business</span></Link>
              <Link href="/music"><span className="text-xs hover:text-white transition-colors cursor-pointer" style={{ fontFamily: "'Space Mono', monospace" }}>ITsMusic</span></Link>
              <Link href="/startup"><span className="text-xs hover:text-white transition-colors cursor-pointer" style={{ fontFamily: "'Space Mono', monospace" }}>Startup News</span></Link>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
