/**
 * IDEASMART Research — Ricerche & Analisi
 * Layout editoriale identico a AiHome: hero ricerca + sidebar, griglia 3 col, lista, newsletter, archivio.
 * Palette: bianco carta (#ffffff), inchiostro (#1a1a1a), accento viola (#6d28d9).
 */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import { trpc } from "@/lib/trpc";
import NewsletterSubscribeForm from "@/components/NewsletterSubscribeForm";
import SEOHead from "@/components/SEOHead";
import VerifyBadge from "@/components/VerifyBadge";
import RequireAuth from "@/components/RequireAuth";
import ArchiveSection from "@/components/ArchiveSection";
import {
  ExternalLink, Globe, MapPin, BookOpen, ArrowRight,
  FlaskConical, BarChart3, Cpu, Building2, DollarSign, TrendingUp
} from "lucide-react";

const ACCENT = "#6d28d9";
const ACCENT_LIGHT = "#f5f3ff";
const INK = "#1a1a1a";
const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
const SF_DISPLAY = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";
const SF_SERIF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif";

function Divider({ thick = false }: { thick?: boolean }) {
  return <div className={`w-full ${thick ? "border-t-4" : "border-t"} border-[#1a1a1a]`} />;
}
function ThinDivider() { return <div className="w-full border-t border-[#1a1a1a]/20" />; }

function SectionBadge({ label }: { label: string }) {
  return (
    <span
      className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-lg"
      style={{ background: ACCENT_LIGHT, color: ACCENT, fontFamily: SF }}
    >
      {label}
    </span>
  );
}

// ── Config categorie ─────────────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ReactNode; accentColor: string; bgColor: string }> = {
  startup:         { label: "Startup",         icon: <Building2 className="w-3.5 h-3.5" />,  accentColor: "#2a2a2a", bgColor: "#fff0e6" },
  venture_capital: { label: "Venture Capital", icon: <DollarSign className="w-3.5 h-3.5" />, accentColor: "#1a1a1a", bgColor: "#f0fdf4" },
  ai_trends:       { label: "AI Trends",       icon: <Cpu className="w-3.5 h-3.5" />,        accentColor: "#1a1a1a", bgColor: "#e6f4f1" },
  technology:      { label: "Tecnologia",      icon: <BarChart3 className="w-3.5 h-3.5" />,  accentColor: "#2a2a2a", bgColor: "#faf5ff" },
  market:          { label: "Mercati",         icon: <TrendingUp className="w-3.5 h-3.5" />, accentColor: "#1a1a1a", bgColor: "#eff6ff" }
};

const REGION_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  global: { label: "Globale", icon: <Globe className="w-3 h-3" /> },
  europe: { label: "Europa",  icon: <MapPin className="w-3 h-3" /> },
  italy:  { label: "Italia",  icon: <MapPin className="w-3 h-3" /> }
};

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  startup:         "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80",
  venture_capital: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80",
  ai_trends:       "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80",
  technology:      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
  market:          "https://images.unsplash.com/photo-1642790551116-18e150f248e3?w=600&q=80"
};

function getCategoryConfig(cat: string) {
  return CATEGORY_CONFIG[cat] ?? { label: cat, icon: <BookOpen className="w-3.5 h-3.5" />, accentColor: "#1a1a1a", bgColor: "#f5f5f7" };
}

function getImageUrl(report: { imageUrl?: string | null; category: string }): string {
  return report.imageUrl || CATEGORY_FALLBACK_IMAGES[report.category] || CATEGORY_FALLBACK_IMAGES["ai_trends"];
}

function formatShortDate(str: string): string {
  if (!str) return "";
  try { return new Date(str).toLocaleDateString("it-IT", { day: "numeric", month: "short" }); } catch { return str; }
}

// ── Card ricerca (stile NewsCard di AiHome) ──────────────────────────────────
function ResearchCard({ report, showImage = false, large = false }: {
  report: {
    id: number; title: string; summary: string; keyFindings: string[];
    source: string; sourceUrl: string | null; category: string; region: string;
    dateLabel: string; isResearchOfDay?: boolean; viewCount: number;
    imageUrl?: string | null;
  };
  showImage?: boolean;
  large?: boolean;
}) {
  const trackView = trpc.news.trackResearchView.useMutation();
  const catConfig = getCategoryConfig(report.category);
  const imgUrl = getImageUrl(report);
  const href = `/research/${report.id}`;

  return (
    <div className="py-4">
      {showImage && (
        <Link href={href}>
          <img
            src={imgUrl}
            alt={report.title}
            loading="lazy"
            decoding="async"
            className={`w-full ${large ? "h-40 sm:h-56" : "h-32 sm:h-40"} object-cover mb-3 cursor-pointer hover:opacity-95 transition-opacity`}
            style={{ borderRadius: "8px", border: "1px solid rgba(26,26,46,0.07)", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}
          />
        </Link>
      )}
      <SectionBadge label={catConfig.label} />
      <Link href={href}>
        <h3
          className={`mt-2 ${large ? "text-2xl md:text-3xl" : "text-[17px]"} font-bold leading-snug text-[#1a1a1a] hover:underline cursor-pointer`}
          style={{ fontFamily: SF_DISPLAY, letterSpacing: large ? "-0.02em" : "-0.01em", lineHeight: 1.25 }}
        >
          {report.title}
        </h3>
      </Link>
      <p className="mt-2 text-[15px] leading-relaxed text-[#1a1a1a]/65 line-clamp-3" style={{ fontFamily: SF_SERIF }}>
        {report.summary}
      </p>
      {report.source && (
        <p className="mt-1 text-[10px] text-[#1a1a1a]/35" style={{ fontFamily: SF }}>
          {report.source}{report.dateLabel ? ` · ${formatShortDate(report.dateLabel)}` : ""}
        </p>
      )}
      <VerifyBadge hash={`research-${report.id}-${report.source}-${report.dateLabel}`} size="sm" />
    </div>
  );
}

// ── Row ricerca (stile NewsRow di AiHome) ────────────────────────────────────
function ResearchRow({ report }: {
  report: {
    id: number; title: string; category: string; source: string; dateLabel: string;
  };
}) {
  const catConfig = getCategoryConfig(report.category);
  const href = `/research/${report.id}`;
  return (
    <div className="py-2.5 grid grid-cols-[auto_1fr] gap-3 items-start">
      <SectionBadge label={catConfig.label} />
      <div>
        <Link href={href}>
          <span
            className="text-[15px] font-semibold text-[#1a1a1a] hover:underline cursor-pointer"
            style={{ fontFamily: SF_DISPLAY }}
          >
            {report.title}
          </span>
        </Link>
        {report.source && (
          <span className="ml-2 text-[10px] text-[#1a1a1a]/35" style={{ fontFamily: SF }}>
            {report.source}{report.dateLabel ? ` · ${formatShortDate(report.dateLabel)}` : ""}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function ResearchSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-0">
        <div className="h-72 bg-[#1a1a1a]/8 border border-[#1a1a1a]/10" />
        <div className="h-72 bg-[#1a1a1a]/5 border border-[#1a1a1a]/10 ml-4" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 bg-[#1a1a1a]/5 border border-[#1a1a1a]/10" />
        ))}
      </div>
    </div>
  );
}

// ── Pagina principale ─────────────────────────────────────────────────────────
export default function Research() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const _today = useMemo(() => new Date(), []);

  const { data: reports, isLoading } = trpc.news.getResearchReports.useQuery({ limit: 30 });

  const categories = ["all", "ai_trends", "venture_capital", "startup", "technology", "market"];

  const allReports = reports ?? [];
  const filteredReports = activeCategory === "all"
    ? allReports
    : allReports.filter(r => r.category === activeCategory);

  // Struttura identica ad AiHome: hero + sidebar, griglia, lista
  const heroReport = filteredReports[0] ?? null;
  const secondaryReports = filteredReports.slice(1, 3);
  const gridReports = filteredReports.slice(3, 9);
  const listReports = filteredReports.slice(9, 30);

  return (
    <RequireAuth>
      <>
        <SEOHead
          title="Ricerche & Analisi — ProofPress"
          description="Analisi approfondite su AI, Startup e Venture Capital. Ricerche verificate da ProofPress per chi prende decisioni."
          canonical="https://proofpress.ai/research"
          ogImage="https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/og-research-cisacbT2pWcoc5B4U27pjr.png"
          ogSiteName="ProofPress"
        />

        <div className="flex min-h-screen" style={{ background: "#ffffff", color: INK }}>
          <div className="flex-1 min-w-0 overflow-x-hidden">
            <SharedPageHeader />
            <main className="max-w-6xl mx-auto px-3 sm:px-4 pb-12">

              {/* ── Filtri categoria ── */}
              <div className="flex flex-wrap gap-2 mt-4 mb-2 pb-3 border-b border-[#1a1a1a]/10">
                {categories.map(cat => {
                  const config = cat === "all"
                    ? { label: "Tutte", icon: null, accentColor: "#1a1a1a", bgColor: "#ffffff" }
                    : getCategoryConfig(cat);
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border transition-colors"
                      style={{
                        fontFamily: SF,
                        background: isActive ? "#1a1a1a" : "#ffffff",
                        color: isActive ? "#ffffff" : "#1a1a1a",
                        borderColor: isActive ? "#1a1a1a" : "#1a1a1a30"
                      }}
                    >
                      {config.icon} {config.label}
                    </button>
                  );
                })}
              </div>

              {isLoading ? (
                <ResearchSkeleton />
              ) : !reports || reports.length === 0 ? (
                <div className="text-center py-20">
                  <FlaskConical className="w-10 h-10 text-[#1a1a1a]/20 mx-auto mb-4" />
                  <p className="text-[#1a1a1a]/50 text-lg font-semibold" style={{ fontFamily: SF_DISPLAY }}>
                    Le ricerche di oggi sono in preparazione
                  </p>
                  <p className="text-[#1a1a1a]/30 text-sm mt-2" style={{ fontFamily: SF }}>
                    Torna tra poco — vengono generate ogni mattina alle 06:00
                  </p>
                </div>
              ) : (
                <>
                  {/* SEZIONE 1: Hero + Sidebar */}
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-0 mt-0">

                    {/* Colonna principale: ricerca hero + 2 secondarie */}
                    <div className="pr-0 lg:pr-6 border-r-0 lg:border-r border-[#1a1a1a]/20">
                      <div className="py-4">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]/40" style={{ fontFamily: SF }}>
                          Ricerca del Giorno
                        </span>
                      </div>
                      <ThinDivider />

                      {heroReport ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                          <div className="pr-0 md:pr-5 py-4">
                            <SectionBadge label={getCategoryConfig(heroReport.category).label} />
                            <Link href={`/research/${heroReport.id}`}>
                              <h2
                                className="mt-3 text-2xl md:text-3xl font-bold leading-tight text-[#1a1a1a] hover:underline cursor-pointer"
                                style={{ fontFamily: SF_DISPLAY }}
                              >
                                {heroReport.title}
                              </h2>
                            </Link>
                            <ThinDivider />
                            <p className="mt-3 text-base leading-relaxed text-[#1a1a1a]/80" style={{ fontFamily: SF_SERIF }}>
                              {heroReport.summary.slice(0, 280)}{heroReport.summary.length > 280 ? "…" : ""}
                            </p>
                            <div className="mt-2 flex items-center gap-3">
                              <Link href={`/research/${heroReport.id}`}>
                                <span
                                  className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest hover:underline"
                                  style={{ color: ACCENT, fontFamily: SF }}
                                >
                                  Leggi la ricerca <ArrowRight className="w-3 h-3" />
                                </span>
                              </Link>
                              {heroReport.sourceUrl && (
                                <a
                                  href={heroReport.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[#1a1a1a]/40 hover:text-[#1a1a1a] transition-colors"
                                  style={{ fontFamily: SF }}
                                >
                                  Fonte <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            {heroReport.source && (
                              <p className="mt-2 text-xs text-[#1a1a1a]/40 italic" style={{ fontFamily: SF }}>
                                Fonte: {heroReport.source}{heroReport.dateLabel ? ` · ${formatShortDate(heroReport.dateLabel)}` : ""}
                              </p>
                            )}
                          </div>
                          <div className="py-4 pl-0 md:pl-5 border-l-0 md:border-l border-[#1a1a1a]/20">
                            <img
                              src={getImageUrl(heroReport)}
                              alt={heroReport.title}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-36 sm:h-52 object-cover grayscale-[15%] hover:grayscale-0 transition-all"
                              style={{ border: "1px solid rgba(26,26,46,0.15)" }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="py-12 text-center text-[#1a1a1a]/30">
                          <p style={{ fontFamily: SF_SERIF }}>Caricamento ricerche…</p>
                        </div>
                      )}

                      <ThinDivider />

                      {secondaryReports.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 mt-2">
                          {secondaryReports.map((item, i) => (
                            <div key={item.id} className={i > 0 ? "border-l border-[#1a1a1a]/20 pl-4" : "pr-4"}>
                              <ResearchCard report={item} showImage />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Sidebar: fonti e key findings della ricerca hero */}
                    <div className="pl-0 lg:pl-5 mt-6 lg:mt-0">
                      <div className="py-4">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]/40" style={{ fontFamily: SF }}>
                          Key Findings
                        </span>
                      </div>
                      <ThinDivider />

                      {heroReport && heroReport.keyFindings.length > 0 ? (
                        <div className="py-4">
                          <p
                            className="text-base font-bold text-[#1a1a1a] leading-snug mb-3"
                            style={{ fontFamily: SF_DISPLAY }}
                          >
                            {heroReport.title}
                          </p>
                          <ul className="space-y-3">
                            {heroReport.keyFindings.slice(0, 5).map((f: string, i: number) => (
                              <li key={i} className="flex gap-2 text-sm leading-relaxed text-[#1a1a1a]/70" style={{ fontFamily: SF_SERIF }}>
                                <span
                                  className="font-black shrink-0 text-[11px] mt-0.5"
                                  style={{ color: ACCENT, fontFamily: SF }}
                                >
                                  {i + 1}.
                                </span>
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                          <ThinDivider />
                          <div className="mt-3 px-3 py-1.5 rounded-sm text-xs font-semibold" style={{ background: ACCENT_LIGHT, color: ACCENT, fontFamily: SF }}>
                            Fonte: {heroReport.source}
                          </div>
                          <Link
                            href={`/research/${heroReport.id}`}
                            className="mt-3 inline-block text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
                            style={{ color: ACCENT, fontFamily: SF }}
                          >
                            Leggi tutto →
                          </Link>
                        </div>
                      ) : (
                        <div className="py-6 text-center text-[#1a1a1a]/25 text-sm">Caricamento…</div>
                      )}
                    </div>
                  </div>

                  {/* SEZIONE 2: Griglia ricerche 3 colonne */}
                  {gridReports.length > 0 && (
                    <div className="mt-6">
                      <Divider thick />
                      <div className="py-4">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]/40" style={{ fontFamily: SF }}>
                          Ricerche di Oggi
                        </span>
                      </div>
                      <ThinDivider />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mt-2">
                        {gridReports.slice(0, 3).map((item, i) => (
                          <div key={item.id} className={i > 0 ? "border-l border-[#1a1a1a]/20 pl-5" : "pr-5"}>
                            <ResearchCard report={item} showImage={i === 0} />
                          </div>
                        ))}
                      </div>
                      {gridReports.length > 3 && (
                        <>
                          <ThinDivider />
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mt-2">
                            {gridReports.slice(3, 6).map((item, i) => (
                              <div key={item.id} className={i > 0 ? "border-l border-[#1a1a1a]/20 pl-5" : "pr-5"}>
                                <ResearchCard report={item} />
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* SEZIONE 3: Elenco ricerche rimanenti */}
                  {listReports.length > 0 && (
                    <div className="mt-8">
                      <Divider thick />
                      <div className="py-4">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]/40" style={{ fontFamily: SF }}>
                          Altre Ricerche
                        </span>
                      </div>
                      <ThinDivider />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 mt-1">
                        {listReports.map((item, i) => (
                          <div key={item.id}>
                            <ResearchRow report={item} />
                            {i < listReports.length - 1 && <ThinDivider />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* SEZIONE 4: Newsletter */}
              <div className="mt-10">
                <Divider thick />
                <div className="py-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: ACCENT, fontFamily: SF }}>
                      Newsletter
                    </span>
                    <h3 className="mt-2 text-2xl font-bold text-[#1a1a1a]" style={{ fontFamily: SF_DISPLAY }}>
                      Ricevi le ricerche ogni settimana
                    </h3>
                    <p className="mt-2 text-sm text-[#1a1a1a]/65" style={{ fontFamily: SF_SERIF }}>
                      Analisi su AI, Startup e Venture Capital — dati verificati da Gartner, CB Insights, McKinsey, Statista.
                    </p>
                  </div>
                  <div>
                    <NewsletterSubscribeForm defaultChannel="ai" accentColor={ACCENT} />
                  </div>
                </div>
              </div>

              {/* Archivio */}
              <ArchiveSection
                section="research"
                accentColor={ACCENT}
                skipCount={10}
              />

              <div className="max-w-[1280px] mx-auto">
                <SharedPageFooter />
              </div>
            </main>
          </div>
        </div>
      </>
    </RequireAuth>
  );
}
