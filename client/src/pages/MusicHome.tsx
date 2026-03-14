/*
 * IDEASMART — ITsMusic Section
 * Design: Deep Black (#0d0d0d) + Violet (#7c3aed) + Magenta (#e91e8c) + Gold (#f59e0b)
 * Typography: Space Grotesk (display) + DM Sans (body)
 * Focus: Rock, Indie, AI Music — Industria musicale italiana e internazionale
 */
import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import AdUnit from "@/components/AdUnit";
import CommentSection from "@/components/CommentSection";
import SocialShare from "@/components/SocialShare";
import SEOHead from "@/components/SEOHead";

// ─── Brand Colors ─────────────────────────────────────────────────────────────
const M = {
  violet: "#7c3aed",
  violetLight: "#ede9fe",
  magenta: "#e91e8c",
  magentaLight: "#fce7f3",
  gold: "#f59e0b",
  goldLight: "#fef3c7",
  black: "#0d0d0d",
  dark: "#1a1a2e",
  surface: "#16213e",
  surface2: "#0f3460",
  muted: "#9ca3af",
  border: "#2d2d4e",
  text: "#e2e8f0",
  textMuted: "#94a3b8",
};

// ─── Animation helpers ───────────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Music Navbar ─────────────────────────────────────────────────────────────
function MusicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(13,13,13,0.97)" : "rgba(13,13,13,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${scrolled ? M.border : "transparent"}`,
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2 group">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
              style={{ background: `linear-gradient(135deg, ${M.violet}, ${M.magenta})`, color: "#fff" }}
            >
              IS
            </div>
            <span className="font-black text-lg" style={{ color: M.text, fontFamily: "'Space Grotesk', sans-serif" }}>
              IDEASMART
            </span>
          </a>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: M.violet, color: "#fff" }}>
            MUSIC
          </span>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { label: "News", href: "#news" },
            { label: "Editoriale", href: "#editoriale" },
            { label: "Artista", href: "#artista" },
            { label: "Reportage", href: "#reportage" },
            { label: "Analisi", href: "#analisi" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={{ color: "#c4b5fd", fontFamily: "'DM Sans', sans-serif" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = `${M.violet}30`; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#c4b5fd"; e.currentTarget.style.background = "transparent"; }}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Section switcher */}
        <div className="flex items-center gap-2">
          <a
            href="/ai"
            className="text-xs font-bold px-3 py-1.5 rounded-full border transition-all"
            style={{ borderColor: M.border, color: M.textMuted }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = M.violet; e.currentTarget.style.color = M.violet; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = M.border; e.currentTarget.style.color = M.textMuted; }}
          >
            → AI
          </a>
          <a
            href="/music"
            className="text-xs font-bold px-3 py-1.5 rounded-full"
            style={{ background: `linear-gradient(135deg, ${M.violet}, ${M.magenta})`, color: "#fff" }}
          >
            MUSIC
          </a>
        </div>
      </div>
    </nav>
  );
}

// ─── News Grid Music ──────────────────────────────────────────────────────────
function MusicNewsGrid() {
  const { data: newsData, isLoading } = trpc.news.getLatest.useQuery({ limit: 20, section: 'music' });

  const fallbackNews = [
    { id: 1, title: "Taylor Swift annuncia il Eras Tour 2026: 80 date in Europa", summary: "La popstar americana porta il suo tour record in Europa con 80 date, incluse 3 a Milano.", category: "Tour & Live", sourceUrl: "#", sourceName: "Billboard" },
    { id: 2, title: "Spotify lancia DJ AI in italiano: mix personalizzati con voce sintetica", summary: "Spotify espande il suo DJ AI in Italia con una voce italiana e playlist generate dall'intelligenza artificiale.", category: "AI Music", sourceUrl: "#", sourceName: "TechCrunch" },
    { id: 3, title: "Indie italiano: Calcutta e Gazzelle dominano le classifiche streaming", summary: "L'indie italiano conquista le classifiche con numeri da record: Calcutta e Gazzelle superano i 100M di stream mensili.", category: "Indie Italia", sourceUrl: "#", sourceName: "Rolling Stone IT" },
    { id: 4, title: "Universal Music Group vs AI: accordo storico con OpenAI", summary: "UMG firma un accordo con OpenAI per l'utilizzo legale di musica nei modelli AI, aprendo una nuova era per i diritti musicali.", category: "Industria", sourceUrl: "#", sourceName: "Financial Times" },
    { id: 5, title: "Rock is back: vendite di vinile +34% nel 2025, record dal 1987", summary: "Il vinile continua la sua rinascita con un incremento del 34% nelle vendite globali, trainato dal rock classico e indie.", category: "Rock & Vinile", sourceUrl: "#", sourceName: "IFPI" },
    { id: 6, title: "Suno AI 4.0: genera canzoni complete in 30 secondi con testo e musica", summary: "Suno lancia la versione 4.0 del suo generatore musicale AI, capace di creare canzoni complete di alta qualità.", category: "AI Music", sourceUrl: "#", sourceName: "Wired" },
  ];

  const items = (newsData ?? []) as Array<{
    id: number; title: string; summary: string; category: string;
    sourceUrl: string; sourceName: string; imageUrl?: string | null;
  }>;

  const COLORS = [
    { color: M.violet, bg: M.violetLight },
    { color: M.magenta, bg: M.magentaLight },
    { color: M.gold, bg: M.goldLight },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl p-5 animate-pulse" style={{ background: M.surface, height: 160 }} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16" style={{ color: M.muted }}>
        <p className="text-lg font-semibold mb-2" style={{ color: M.text }}>Notizie in aggiornamento...</p>
        <p className="text-sm">I contenuti musicali verranno caricati a breve.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {items.map((item, i) => {
        const { color, bg } = COLORS[i % COLORS.length];
        return (
          <FadeUp key={item.id} delay={i * 0.05}>
            <div
              className="rounded-xl border overflow-hidden hover:shadow-xl transition-all group"
              style={{ borderColor: M.border, background: M.surface }}
            >
              {/* Image — sopra su mobile, a sinistra su desktop */}
              {item.imageUrl && (
                <div className="block sm:hidden w-full h-44 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="flex gap-0">
                {/* Image — affiancata su desktop */}
                {item.imageUrl && (
                  <div className="hidden sm:block w-32 flex-shrink-0 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      style={{ minHeight: 140 }}
                    />
                  </div>
                )}
                {/* Content */}
                <div className="flex-1 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: bg, color }}>
                      {item.category}
                    </span>
                    <span className="text-xs font-medium" style={{ color: "#a78bfa" }}>{item.sourceName}</span>
                  </div>
                  <h3 className="text-base font-bold leading-snug mb-3" style={{ color: M.text, fontFamily: "'Space Grotesk', sans-serif" }}>
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed line-clamp-3" style={{ color: "#cbd5e1" }}>
                    {item.summary}
                  </p>
                  <a
                    href={`/music/news/${item.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium mt-2 transition-colors"
                    style={{ color }}
                  >
                    Leggi →
                  </a>
                  {/* Social sharing */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-purple-500/20">
                    <span className="text-xs" style={{ color: M.textMuted }}>{item.sourceName}</span>
                    <SocialShare
                      title={item.title + ' — via ITsMusic by IDEASMART'}
                      url={item.sourceUrl !== '#' ? item.sourceUrl : undefined}
                      accentColor="purple"
                      compact
                    />
                  </div>
                  {/* Commenti */}
                  <CommentSection
                    section="music"
                    articleType="news"
                    articleId={item.id}
                    accentColor="purple"
                  />
                </div>
              </div>
            </div>
          </FadeUp>
        );
      })}
    </div>
  );
}

// ─── Editorial Section Music ──────────────────────────────────────────────────
function MusicEditorialSection() {
  const { data: editorial, isLoading } = trpc.editorial.getLatest.useQuery({ section: 'music' });

  const today = new Date().toLocaleDateString("it-IT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const paragraphs = editorial?.body
    ? editorial.body.split(/\n\n+/).filter(Boolean)
    : null;

  return (
    <section id="editoriale" className="border-t" style={{ borderColor: M.border }}>
      {/* Section header */}
      <div className="border-b" style={{ borderColor: M.border, background: M.surface }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: M.textMuted }}>02 —</span>
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: M.violet }}>EDITORIALE</span>
        </div>
      </div>
      <div className="border-b-2" style={{ borderColor: M.violet, background: `${M.violet}10` }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <h2 className="text-3xl sm:text-4xl font-black leading-tight" style={{ color: M.text, fontFamily: "'Space Grotesk', sans-serif" }}>
            {editorial?.title || "L'editoriale musicale di oggi"}
          </h2>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main editorial */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 rounded-full" style={{ background: `linear-gradient(to bottom, ${M.violet}, ${M.magenta})` }} />
              <div>
                <p className="text-xs font-bold tracking-widest uppercase" style={{ color: M.violet }}>
                  {editorial?.keyTrend || "Trend del giorno"}
                </p>
                <p className="text-xs" style={{ color: M.textMuted }}>{today}</p>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-4 rounded animate-pulse" style={{ background: M.surface, width: `${85 - i * 10}%` }} />
                ))}
              </div>
            ) : paragraphs ? (
              <div className="space-y-4">
                {paragraphs.map((p, i) => (
                  <p key={i} className="text-base leading-relaxed" style={{ color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif" }}>
                    {p}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-base leading-relaxed" style={{ color: "#cbd5e1" }}>
                L'editoriale musicale di oggi sarà disponibile a breve. Torna domani per la nostra analisi quotidiana sull'industria musicale.
              </p>
            )}

            {editorial?.authorNote && (
              <div className="mt-6 p-4 rounded-xl border-l-4" style={{ borderColor: M.violet, background: `${M.violet}10` }}>
                <p className="text-sm italic" style={{ color: "#c4b5fd" }}>{editorial.authorNote}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {editorial?.subtitle && (
              <div className="p-5 rounded-xl border" style={{ borderColor: M.border, background: M.surface }}>
                <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: M.violet }}>FOCUS</p>
                <p className="text-base font-semibold leading-snug" style={{ color: "#e2e8f0", fontFamily: "'Space Grotesk', sans-serif" }}>
                  {editorial.subtitle}
                </p>
              </div>
            )}
            <div className="p-5 rounded-xl border" style={{ borderColor: M.border, background: M.surface }}>
              <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: M.magenta }}>SEZIONI</p>
              {["Rock & Indie", "AI Music", "Industria", "Artisti", "Analisi"].map((s, i) => (
                <div key={s} className="flex items-center gap-2 py-2 border-b last:border-0" style={{ borderColor: M.border }}>
                  <span className="text-xs font-bold" style={{ color: M.textMuted }}>0{i + 1}</span>
                  <span className="text-sm font-medium" style={{ color: M.text }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Artista della Settimana (=Startup of the Day for Music) ─────────────────
function ArtistOfWeekSection() {
  const { data: artist, isLoading } = trpc.startupOfDay.getLatest.useQuery({ section: 'music' });

  const today = new Date().toLocaleDateString("it-IT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <section id="artista" className="border-t" style={{ borderColor: M.border }}>
      <div className="border-b" style={{ borderColor: M.border, background: M.surface }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: M.textMuted }}>03 —</span>
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: M.magenta }}>ARTISTA DELLA SETTIMANA</span>
        </div>
      </div>
      <div className="border-b-2" style={{ borderColor: M.magenta, background: `${M.magenta}10` }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <h2 className="text-3xl sm:text-4xl font-black leading-tight" style={{ color: M.text, fontFamily: "'Space Grotesk', sans-serif" }}>
            {artist?.name || "Artista della Settimana"}
          </h2>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-6 rounded w-1/3" style={{ background: M.surface }} />
            <div className="h-4 rounded w-2/3" style={{ background: M.surface }} />
            <div className="h-32 rounded" style={{ background: M.surface }} />
          </div>
        ) : artist ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg" style={{ background: `linear-gradient(135deg, ${M.violet}, ${M.magenta})`, color: "#fff" }}>
                  {artist.name?.charAt(0) || "A"}
                </div>
                <div>
                  <p className="font-black text-lg" style={{ color: M.text, fontFamily: "'Space Grotesk', sans-serif" }}>{artist.name}</p>
                  <p className="text-xs" style={{ color: M.textMuted }}>{artist.category} · {artist.country}</p>
                </div>
              </div>
              <p className="text-base font-semibold mb-3" style={{ color: "#a78bfa" }}>{artist.tagline}</p>
              <p className="text-base leading-relaxed" style={{ color: "#cbd5e1" }}>{artist.description}</p>
              {artist.whyToday && (
                <div className="mt-4 p-4 rounded-xl border-l-4" style={{ borderColor: M.magenta, background: `${M.magenta}10` }}>
                  <p className="text-xs font-bold uppercase mb-1" style={{ color: M.magenta }}>PERCHÉ ORA</p>
                  <p className="text-sm" style={{ color: "#cbd5e1" }}>{artist.whyToday}</p>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {[
                { label: "Genere", value: artist.category },
                { label: "Paese", value: artist.country },
                { label: "Anno di fondazione", value: artist.foundedYear },
                { label: "Notorietà", value: artist.funding },
              ].filter(i => i.value).map(item => (
                <div key={item.label} className="flex justify-between items-center py-3 border-b" style={{ borderColor: M.border }}>
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: M.textMuted }}>{item.label}</span>
                  <span className="text-sm font-semibold" style={{ color: M.text }}>{item.value}</span>
                </div>
              ))}
              {artist.websiteUrl && artist.websiteUrl !== "#" && (
                <a
                  href={artist.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                  style={{ background: `linear-gradient(135deg, ${M.violet}, ${M.magenta})`, color: "#fff" }}
                >
                  Scopri l'artista →
                </a>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm" style={{ color: M.textMuted }}>
            L'artista della settimana sarà disponibile a breve. Torna domani!
          </p>
        )}
      </div>
    </section>
  );
}

// ─── Reportage Section Music ──────────────────────────────────────────────────
function MusicReportageSection() {
  const { data: reportageItems, isLoading } = trpc.reportage.getLatestWeek.useQuery({ section: 'music' });

  const fallback = [
    { id: 1, position: 1, sectionNumber: "01", category: "Reportage · Rock & Indie", startupName: "Caricamento...", headline: "Reportage in arrivo", subheadline: "", bodyText: "", quote: "", feature1: "", feature2: "", feature3: "", feature4: "", stat1Value: "—", stat1Label: "Stat 1", stat2Value: "—", stat2Label: "Stat 2", stat3Value: "—", stat3Label: "Stat 3", ctaLabel: "Scopri di più →", ctaUrl: "#", websiteUrl: "#", weekLabel: "" },
  ];

  const items = (reportageItems && reportageItems.length > 0 ? reportageItems : fallback) as Array<{
    id: number; position: number; sectionNumber: string; category: string; startupName: string;
    headline: string; subheadline: string; bodyText: string; quote: string;
    feature1: string; feature2: string; feature3: string; feature4: string;
    stat1Value: string; stat1Label: string; stat2Value: string; stat2Label: string;
    stat3Value: string; stat3Label: string; ctaLabel: string; ctaUrl: string;
    websiteUrl: string; weekLabel: string; imageUrl?: string | null;
  }>;

  const ACCENT_COLORS = [M.violet, M.magenta, M.gold, "#10b981"];

  return (
    <section id="reportage" className="border-t" style={{ borderColor: M.border }}>
      <div className="border-b" style={{ borderColor: M.border, background: M.surface }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: M.textMuted }}>04 —</span>
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: M.gold }}>REPORTAGE MUSICALE</span>
        </div>
      </div>
      <div className="border-b-2" style={{ borderColor: M.gold, background: `${M.gold}10` }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <h2 className="text-3xl sm:text-4xl font-black leading-tight" style={{ color: M.text, fontFamily: "'Space Grotesk', sans-serif" }}>
            I 4 reportage musicali della settimana
          </h2>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl animate-pulse" style={{ background: M.surface, height: 280 }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item, i) => {
              const accent = ACCENT_COLORS[i % ACCENT_COLORS.length];
              return (
                <FadeUp key={item.id} delay={i * 0.1}>
                  <div className="rounded-xl border overflow-hidden hover:shadow-xl transition-all group" style={{ borderColor: M.border, background: M.surface }}>
                    {item.imageUrl && (
                      <div className="h-40 overflow-hidden">
                        <img src={item.imageUrl} alt={item.headline} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-black" style={{ color: accent }}>{item.sectionNumber}</span>
                        <span className="text-xs font-bold" style={{ color: M.textMuted }}>{item.category}</span>
                      </div>
                      <h3 className="text-base font-black mb-2 leading-snug" style={{ color: M.text, fontFamily: "'Space Grotesk', sans-serif" }}>
                        {item.startupName}
                      </h3>
                      <p className="text-sm font-semibold mb-3" style={{ color: accent }}>{item.headline}</p>
                      {item.bodyText && (
                        <p className="text-sm leading-relaxed line-clamp-3 mb-4" style={{ color: "#cbd5e1" }}>{item.bodyText}</p>
                      )}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {[
                          { v: item.stat1Value, l: item.stat1Label },
                          { v: item.stat2Value, l: item.stat2Label },
                          { v: item.stat3Value, l: item.stat3Label },
                        ].filter(s => s.v && s.v !== "—").map((s, j) => (
                          <div key={j} className="text-center p-2 rounded-lg" style={{ background: `${accent}15` }}>
                            <div className="text-sm font-black" style={{ color: accent }}>{s.v}</div>
                            <div className="text-xs" style={{ color: M.textMuted }}>{s.l}</div>
                          </div>
                        ))}
                      </div>
                      {item.ctaUrl && item.ctaUrl !== "#" && (
                        <a
                          href={item.ctaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold transition-colors"
                          style={{ color: accent }}
                        >
                          {item.ctaLabel}
                        </a>
                      )}
                    </div>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Market Analysis Music ────────────────────────────────────────────────────
function MusicMarketSection() {
  const { data: analyses, isLoading } = trpc.marketAnalysis.getLatest.useQuery({ section: 'music' });

  return (
    <section id="analisi" className="border-t" style={{ borderColor: M.border }}>
      <div className="border-b" style={{ borderColor: M.border, background: M.surface }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: M.textMuted }}>05 —</span>
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: M.violet }}>ANALISI DI MERCATO</span>
        </div>
      </div>
      <div className="border-b-2" style={{ borderColor: M.violet, background: `${M.violet}10` }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <h2 className="text-3xl sm:text-4xl font-black leading-tight" style={{ color: M.text, fontFamily: "'Space Grotesk', sans-serif" }}>
            Analisi di mercato musicale
          </h2>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl animate-pulse" style={{ background: M.surface, height: 200 }} />
            ))}
          </div>
        ) : analyses && analyses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analyses.map((item, i) => {
              const accent = [M.violet, M.magenta, M.gold, "#10b981"][i % 4];
              return (
                <FadeUp key={item.id} delay={i * 0.1}>
                  <div className="rounded-xl border overflow-hidden" style={{ borderColor: M.border, background: M.surface }}>
                    {item.imageUrl && (
                      <div className="h-32 overflow-hidden">
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${accent}20`, color: accent }}>
                          {item.category}
                        </span>
                        <span className="text-xs" style={{ color: M.textMuted }}>{item.source}</span>
                      </div>
                      <h3 className="text-base font-black mb-2" style={{ color: M.text, fontFamily: "'Space Grotesk', sans-serif" }}>
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <p className="text-sm font-semibold mb-2" style={{ color: accent }}>{item.subtitle}</p>
                      )}
                      <p className="text-sm leading-relaxed" style={{ color: "#cbd5e1" }}>{item.summary}</p>
                      {item.keyInsight && (
                        <div className="mt-3 p-3 rounded-lg" style={{ background: `${accent}15` }}>
                          <p className="text-xs font-bold uppercase mb-1" style={{ color: accent }}>KEY INSIGHT</p>
                          <p className="text-sm" style={{ color: "#cbd5e1" }}>{item.keyInsight}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        ) : (
          <p className="text-sm" style={{ color: M.textMuted }}>
            Le analisi di mercato musicale saranno disponibili a breve. Il sistema genera nuove analisi ogni lunedì.
          </p>
        )}
      </div>
    </section>
  );
}

// ─── Newsletter Section Music ─────────────────────────────────────────────────
function MusicNewsletterSection() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { data: activeSubscriberCount } = trpc.newsletter.getActiveCount.useQuery();

  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: (data) => {
      if ((data as any).alreadySubscribed) {
        toast.info("Sei già iscritto alla newsletter ITsMusic!");
      } else {
        setSubscribed(true);
        toast.success("Iscrizione completata! Benvenuto in ITsMusic.");
      }
    },
    onError: (err) => {
      toast.error("Errore: " + err.message);
    },
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      subscribeMutation.mutate({ email, name: name || undefined });
    }
  };

  return (
    <section className="border-t py-16" style={{ borderColor: M.border, background: M.dark }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <FadeUp>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 border" style={{ borderColor: M.violet, background: `${M.violet}15` }}>
            <span className="text-xs font-bold" style={{ color: M.violet }}>🎵 ITsMusic by IDEASMART</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: M.text, fontFamily: "'Space Grotesk', sans-serif" }}>
            La newsletter musicale italiana
          </h2>
          <p className="text-lg mb-2" style={{ color: "#cbd5e1" }}>
            Unisciti a oltre{" "}
            <span className="font-black" style={{ color: M.violet }}>
              {activeSubscriberCount?.toLocaleString("it-IT") ?? "—"}
            </span>{" "}
            professionisti che ogni settimana ricevono ITsMusic: news Rock &amp; Indie, artisti emergenti, AI Music e analisi dell'industria.
          </p>
          <p className="text-sm mb-8" style={{ color: M.textMuted }}>Ogni lunedì e venerdì alle 10:00 — Gratis, sempre.</p>

          {subscribed ? (
            <div className="p-6 rounded-2xl border" style={{ borderColor: M.violet, background: `${M.violet}15` }}>
              <p className="text-2xl mb-2">🎸</p>
              <p className="font-black text-lg mb-1" style={{ color: M.text }}>Benvenuto in ITsMusic!</p>
              <p className="text-sm" style={{ color: M.textMuted }}>Riceverai la prossima newsletter lunedì alle 10:00.</p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="text"
                placeholder="Il tuo nome"
                value={name}
                onChange={e => setName(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                style={{ background: M.surface, borderColor: M.border, color: M.text }}
                onFocus={e => (e.target.style.borderColor = M.violet)}
                onBlur={e => (e.target.style.borderColor = M.border)}
              />
              <input
                type="email"
                placeholder="La tua email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                style={{ background: M.surface, borderColor: M.border, color: M.text }}
                onFocus={e => (e.target.style.borderColor = M.violet)}
                onBlur={e => (e.target.style.borderColor = M.border)}
              />
              <button
                type="submit"
                disabled={subscribeMutation.isPending}
                className="px-6 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${M.violet}, ${M.magenta})`, color: "#fff" }}
              >
                {subscribeMutation.isPending ? "..." : "Iscriviti →"}
              </button>
            </form>
          )}
        </FadeUp>
      </div>
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MusicHome() {
  const musicSeoStructuredData = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "name": "ITsMusic",
    "alternateName": "ITsMusic by IDEASMART",
    "url": "https://www.ideasmart.ai/music",
    "description": "La testata italiana dedicata all'industria musicale: Rock, Indie, AI Music. Notizie, artisti emergenti, analisi di mercato e reportage aggiornati ogni giorno.",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.ideasmart.ai/favicon.ico"
    },
    "publisher": {
      "@type": "Organization",
      "name": "IDEASMART",
      "url": "https://www.ideasmart.ai"
    },
    "about": [
      { "@type": "Thing", "name": "Rock music" },
      { "@type": "Thing", "name": "Indie music" },
      { "@type": "Thing", "name": "AI Music" },
      { "@type": "Thing", "name": "Industria musicale" }
    ]
  };

  return (
    <div className="min-h-screen" style={{ background: M.black }}>
      <SEOHead
        title="ITsMusic — Rock, Indie e AI Music | Notizie sull'Industria Musicale"
        description="ITsMusic è la testata italiana dedicata all'industria musicale: Rock, Indie, AI Music. Notizie su artisti emergenti, analisi di mercato discografico, reportage e newsletter settimanale."
        keywords="ITsMusic, rock italiano, indie music, AI music, industria musicale, artisti emergenti, Spotify, Billboard, Rolling Stone, musica italiana, notizie musica, newsletter musica"
        canonical="https://www.ideasmart.ai/music"
        ogSiteName="ITsMusic"
        ogType="website"
        robots="index, follow"
        structuredData={musicSeoStructuredData}
      />
      <MusicNavbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden pt-16" style={{ background: `linear-gradient(135deg, ${M.black} 0%, ${M.dark} 50%, ${M.surface} 100%)` }}>
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: `radial-gradient(circle, ${M.violet}, transparent)` }} />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: `radial-gradient(circle, ${M.magenta}, transparent)` }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <FadeUp>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 border" style={{ borderColor: M.violet, background: `${M.violet}20` }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: M.violet }} />
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: M.violet }}>ITsMusic by IDEASMART</span>
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-none mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                <span style={{ color: M.text }}>Rock, Indie</span>
                <br />
                <span style={{ background: `linear-gradient(135deg, ${M.violet}, ${M.magenta})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  & AI Music
                </span>
              </h1>
            </FadeUp>

            <FadeUp delay={0.2}>
              <p className="text-lg sm:text-xl mb-8 max-w-2xl leading-relaxed" style={{ color: M.textMuted, fontFamily: "'DM Sans', sans-serif" }}>
                La testata giornalistica italiana sull'industria musicale. News, artisti emergenti, analisi di mercato e reportage esclusivi su Rock, Indie e AI Music.
              </p>
            </FadeUp>

            <FadeUp delay={0.3}>
              <div className="flex flex-wrap gap-4 mb-10">
                <a href="#news" className="px-6 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90" style={{ background: `linear-gradient(135deg, ${M.violet}, ${M.magenta})`, color: "#fff" }}>
                  Leggi le news →
                </a>
                <a href="#newsletter" className="px-6 py-3 rounded-xl font-bold text-sm border transition-all" style={{ borderColor: M.violet, color: M.violet, background: "transparent" }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${M.violet}20`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  Iscriviti alla newsletter
                </a>
              </div>
            </FadeUp>

            <FadeUp delay={0.4}>
              <div className="flex flex-wrap gap-6">
                {[
                  { value: "20+", label: "News al giorno", color: M.violet },
                  { value: "4", label: "Reportage/settimana", color: M.magenta },
                  { value: "100%", label: "Italiano", color: M.gold },
                ].map(stat => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl font-black" style={{ color: stat.color, fontFamily: "'Space Grotesk', sans-serif" }}>{stat.value}</div>
                    <div className="text-xs" style={{ color: M.textMuted }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── NEWS ─────────────────────────────────────────────────────────── */}
      <section id="news" className="border-t" style={{ borderColor: M.border }}>
        <div className="border-b" style={{ borderColor: M.border, background: M.surface }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: M.textMuted }}>01 —</span>
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: M.magenta }}>NEWS MUSICALI</span>
          </div>
        </div>
        <div className="border-b-2" style={{ borderColor: M.magenta, background: `${M.magenta}10` }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <h2 className="text-3xl sm:text-4xl font-black leading-tight" style={{ color: M.text, fontFamily: "'Space Grotesk', sans-serif" }}>
              Le 20 notizie musicali più importanti
            </h2>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <MusicNewsGrid />
        </div>
      </section>

      {/* AdSense Banner 1 */}
      <AdUnit format="horizontal" className="my-4" />

      <MusicEditorialSection />

      {/* AdSense Banner 2 */}
      <AdUnit format="horizontal" className="my-4" />

      <ArtistOfWeekSection />

      <MusicReportageSection />

      {/* AdSense Banner 3 */}
      <AdUnit format="horizontal" className="my-4" />

      <MusicMarketSection />

      {/* AdSense Banner 4 */}
      <AdUnit format="horizontal" className="my-4" />

      {/* ── NEWSLETTER ───────────────────────────────────────────────────── */}
      <div id="newsletter">
        <MusicNewsletterSection />
      </div>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t py-8" style={{ borderColor: M.border, background: M.black }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded flex items-center justify-center font-black text-xs" style={{ background: `linear-gradient(135deg, ${M.violet}, ${M.magenta})`, color: "#fff" }}>IS</div>
              <span className="font-black text-sm" style={{ color: M.text }}>ITsMusic by IDEASMART</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="/" className="text-xs transition-colors" style={{ color: M.textMuted }} onMouseEnter={e => (e.currentTarget.style.color = M.violet)} onMouseLeave={e => (e.currentTarget.style.color = M.textMuted)}>Hub</a>
              <a href="/ai" className="text-xs transition-colors" style={{ color: M.textMuted }} onMouseEnter={e => (e.currentTarget.style.color = M.violet)} onMouseLeave={e => (e.currentTarget.style.color = M.textMuted)}>AI4Business</a>
              <a href="/privacy" className="text-xs transition-colors" style={{ color: M.textMuted }} onMouseEnter={e => (e.currentTarget.style.color = M.violet)} onMouseLeave={e => (e.currentTarget.style.color = M.textMuted)}>Privacy</a>
            </div>
            <p className="text-xs" style={{ color: M.textMuted }}>© 2025 IDEASMART · ITsMusic</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
