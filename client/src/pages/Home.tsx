/*
 * IDEASMART — Homepage Hub Multitematica
 * Design: Deep navy (#0a0f1e) + Teal (#00b4a0) + Viola (#8b5cf6) + Orange (#e84f00)
 * Layout: Testata giornalistica multicanale — AI4Business News + ITsMusic
 *
 * NAVBAR: differenziata — hub con Canali / Chi siamo / Advertising
 * CANALI: card grandi con descrizioni estese
 * NOTIZIE: layout verticale, font grandi, alta leggibilità
 */
import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import SEOHead from "@/components/SEOHead";
import AdUnit from "@/components/AdUnit";

// ─── Brand Colors ─────────────────────────────────────────────────────────────
const C = {
  navy: "#0a0f1e",
  navyMid: "#111827",
  navyCard: "#0f172a",
  teal: "#00b4a0",
  tealLight: "rgba(0,180,160,0.12)",
  violet: "#8b5cf6",
  violetLight: "rgba(139,92,246,0.12)",
  orange: "#e84f00",
  white: "#ffffff",
  whiteAlpha90: "rgba(255,255,255,0.9)",
  whiteAlpha80: "rgba(255,255,255,0.8)",
  whiteAlpha60: "rgba(255,255,255,0.6)",
  whiteAlpha50: "rgba(255,255,255,0.5)",
  whiteAlpha15: "rgba(255,255,255,0.15)",
  whiteAlpha8: "rgba(255,255,255,0.08)",
  border: "rgba(255,255,255,0.1)",
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
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Hub Navbar (solo per la homepage /) ──────────────────────────────────────
function HubNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navItems = [
    { label: "AI4Business", href: "/ai", color: C.teal },
    { label: "ITsMusic", href: "/music", color: C.violet },
    { label: "Chi siamo", href: "#chi-siamo" },
    { label: "Advertising", href: "/advertise", highlight: true },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(10,15,30,0.97)" : "rgba(10,15,30,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <span
                className="text-xl sm:text-2xl font-black tracking-tight"
                style={{ color: C.white, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                IDEA<span style={{ color: C.teal }}>SMART</span>
              </span>
              <span
                className="hidden sm:block text-xs font-mono tracking-widest uppercase"
                style={{ color: C.whiteAlpha50 }}
              >
                MULTICANALE
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              item.href.startsWith("#") ? (
                <button
                  key={item.label}
                  onClick={() => {
                    const el = document.getElementById("chi-siamo");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-200"
                  style={{
                    color: item.color || C.whiteAlpha80,
                    background: "transparent",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = C.whiteAlpha8)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  {item.label}
                </button>
              ) : item.highlight ? (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 hover:opacity-90"
                  style={{
                    background: C.orange,
                    color: "#fff",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {item.label}
                </a>
              ) : (
                <Link key={item.label} href={item.href}>
                  <span
                    className="px-3 py-2 rounded-lg text-sm font-bold transition-colors duration-200 cursor-pointer"
                    style={{
                      color: item.color || C.whiteAlpha80,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.whiteAlpha8)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    {item.label}
                  </span>
                </Link>
              )
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ background: menuOpen ? C.whiteAlpha8 : "transparent" }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <div className="w-6 h-0.5 mb-1.5 transition-all duration-300 origin-center"
              style={{ background: C.white, transform: menuOpen ? "rotate(45deg) translateY(8px)" : "none" }} />
            <div className="w-6 h-0.5 mb-1.5 transition-all duration-300"
              style={{ background: C.white, opacity: menuOpen ? 0 : 1 }} />
            <div className="w-6 h-0.5 transition-all duration-300 origin-center"
              style={{ background: C.white, transform: menuOpen ? "rotate(-45deg) translateY(-8px)" : "none" }} />
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className="md:hidden overflow-hidden transition-all duration-300"
          style={{ maxHeight: menuOpen ? "400px" : "0px" }}
        >
          <div className="py-3 space-y-1" style={{ borderTop: `1px solid ${C.border}` }}>
            <Link href="/ai">
              <div className="px-4 py-3.5 text-base font-bold rounded-lg cursor-pointer"
                style={{ color: C.teal }} onClick={() => setMenuOpen(false)}>
                🤖 AI4Business News
              </div>
            </Link>
            <Link href="/music">
              <div className="px-4 py-3.5 text-base font-bold rounded-lg cursor-pointer"
                style={{ color: C.violet }} onClick={() => setMenuOpen(false)}>
                🎸 ITsMusic
              </div>
            </Link>
            <button
              className="block w-full text-left px-4 py-3.5 text-base font-semibold rounded-lg"
              style={{ color: C.whiteAlpha80 }}
              onClick={() => {
                const el = document.getElementById("chi-siamo");
                if (el) el.scrollIntoView({ behavior: "smooth" });
                setMenuOpen(false);
              }}
            >
              Chi siamo
            </button>
            <a href="/advertise" className="block px-4 py-3.5 text-base font-bold rounded-lg"
              style={{ color: C.orange }} onClick={() => setMenuOpen(false)}>
              Advertising →
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  const { data: aiNews } = trpc.news.getLatest.useQuery({ section: "ai" });
  const { data: musicNews } = trpc.news.getLatest.useQuery({ section: "music" });
  const { data: subscriberCount } = trpc.newsletter.getActiveCount.useQuery();

  const aiLatest = (aiNews || []).slice(0, 3).map((n) => ({ title: n.title, category: n.category }));
  const musicLatest = (musicNews || []).slice(0, 3).map((n) => ({ title: n.title, category: n.category }));

  // Mix alternato AI + Music per la sezione notizie
  const allNews: Array<{ id: number; title: string; category: string; imageUrl?: string | null; section: "ai" | "music"; sourceUrl?: string; summary?: string }> = [];
  const aiSlice = (aiNews || []).slice(0, 8);
  const musicSlice = (musicNews || []).slice(0, 8);
  const maxLen = Math.max(aiSlice.length, musicSlice.length);
  for (let i = 0; i < maxLen; i++) {
    if (aiSlice[i]) allNews.push({ ...aiSlice[i], section: "ai" as const });
    if (musicSlice[i]) allNews.push({ ...musicSlice[i], section: "music" as const });
  }

  const seoStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "IDEASMART",
    "url": "https://www.ideasmart.ai",
    "description": "Testata giornalistica multicanale italiana: AI4Business News e ITsMusic. Notizie, analisi e newsletter su intelligenza artificiale e industria musicale.",
    "publisher": {
      "@type": "Organization",
      "name": "IDEASMART",
      "url": "https://www.ideasmart.ai",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.ideasmart.ai/favicon.ico"
      }
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.ideasmart.ai/ai?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div style={{ background: C.navy, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <SEOHead
        title="IDEASMART — Testata Giornalistica Multicanale AI e Musica"
        description="IDEASMART è la piattaforma editoriale italiana che unisce AI4Business News e ITsMusic. Notizie, analisi di mercato, startup emergenti e industria musicale aggiornate ogni giorno."
        keywords="IDEASMART, testata giornalistica, AI for business, intelligenza artificiale, musica, rock, indie, startup italiane, newsletter AI, newsletter musica"
        canonical="https://www.ideasmart.ai"
        ogSiteName="IDEASMART"
        ogType="website"
        structuredData={seoStructuredData}
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
        .hub-title { font-family: 'Space Grotesk', sans-serif; }
      `}</style>

      <HubNavbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative pt-24 sm:pt-28 pb-16 sm:pb-20 px-4 overflow-hidden"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,180,160,0.15) 0%, transparent 70%), ${C.navy}`,
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(${C.whiteAlpha8} 1px, transparent 1px), linear-gradient(90deg, ${C.whiteAlpha8} 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-5xl mx-auto text-center">
          <FadeUp>
            <div
              className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase px-3 sm:px-4 py-2 rounded-full mb-5 sm:mb-6"
              style={{ background: C.whiteAlpha8, border: `1px solid ${C.border}`, color: C.teal }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.teal }} />
              <span className="hidden xs:inline">Testata Giornalistica </span>Multicanale
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            {/* Titolo: 5xl su mobile, 7xl su sm, 8xl su md */}
            <h1
              className="hub-title text-5xl sm:text-7xl md:text-8xl font-black mb-4 sm:mb-6 leading-none tracking-tight"
              style={{ color: C.white }}
            >
              IDEA<span style={{ color: C.teal }}>SMART</span>
            </h1>
          </FadeUp>

          <FadeUp delay={0.2}>
            <p
              className="text-lg sm:text-xl md:text-2xl mb-4 sm:mb-5 max-w-3xl mx-auto leading-relaxed px-1"
              style={{ color: C.whiteAlpha90 }}
            >
              La piattaforma editoriale italiana che unisce i mondi dell'<strong style={{ color: C.teal }}>Intelligenza Artificiale</strong> e della <strong style={{ color: C.violet }}>Musica</strong>.
            </p>
            <p
              className="text-base sm:text-lg mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-1"
              style={{ color: C.whiteAlpha60 }}
            >
              Contenuti aggiornati ogni giorno. Analisi, reportage e newsletter curate da AI per professionisti.
            </p>
          </FadeUp>

          <FadeUp delay={0.3}>
            {/* Statistiche: griglia 2×2 su mobile, 4 colonne su desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-10 mb-8 sm:mb-12 max-w-xs sm:max-w-none mx-auto">
              {[
                { value: "2", label: "canali tematici" },
                { value: "40+", label: "contenuti al giorno" },
                { value: subscriberCount ? `${subscriberCount.toLocaleString("it-IT")}+` : "5.000+", label: "iscritti attivi" },
                { value: "100%", label: "aggiornamento auto" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="hub-title text-3xl sm:text-4xl font-black" style={{ color: C.white }}>{stat.value}</div>
                  <div className="text-xs sm:text-sm mt-1 leading-tight" style={{ color: C.whiteAlpha50 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </FadeUp>

          <FadeUp delay={0.4}>
            {/* CTA: full-width su mobile, auto su desktop */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href="/ai" className="block sm:inline-block">
                <button
                  className="w-full sm:w-auto px-6 sm:px-8 py-4 rounded-xl font-bold text-base transition-all hover:scale-105 active:scale-95"
                  style={{ background: C.teal, color: C.navy }}
                >
                  🤖 Entra in AI4Business
                </button>
              </Link>
              <Link href="/music" className="block sm:inline-block">
                <button
                  className="w-full sm:w-auto px-6 sm:px-8 py-4 rounded-xl font-bold text-base transition-all hover:scale-105 active:scale-95"
                  style={{ background: C.violet, color: C.white }}
                >
                  🎸 Entra in ITsMusic
                </button>
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── I NOSTRI CANALI ───────────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ background: C.navyMid }}>
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-14">
              <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: C.teal }}>I nostri canali</p>
              <h2 className="hub-title text-4xl md:text-5xl font-black mb-4" style={{ color: C.white }}>
                Scegli il tuo canale
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: C.whiteAlpha60 }}>
                Due testate indipendenti, una piattaforma. Ogni canale ha la sua redazione AI, la sua newsletter e il suo pubblico di riferimento.
              </p>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-8">
            {/* AI4Business */}
            <FadeUp delay={0.1}>
              <Link href="/ai">
                <div
                  className="group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl"
                  style={{
                    background: `linear-gradient(135deg, rgba(0,180,160,0.15) 0%, rgba(0,180,160,0.05) 100%)`,
                    border: `1px solid rgba(0,180,160,0.3)`,
                  }}
                >
                  {/* Top accent bar */}
                  <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${C.teal}, rgba(0,180,160,0.3))` }} />

                  <div className="p-8 md:p-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                          style={{ background: "rgba(0,180,160,0.2)", border: "1px solid rgba(0,180,160,0.3)" }}
                        >
                          🤖
                        </div>
                        <div>
                          <span
                            className="text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full"
                            style={{ background: "rgba(0,180,160,0.2)", color: C.teal, border: "1px solid rgba(0,180,160,0.3)" }}
                          >
                            AI4BUSINESS NEWS
                          </span>
                          <p className="text-xs mt-1.5" style={{ color: C.whiteAlpha50 }}>by IDEASMART</p>
                        </div>
                      </div>
                      <div
                        className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all group-hover:scale-105"
                        style={{ background: C.teal, color: C.navy }}
                      >
                        Entra →
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="hub-title text-2xl md:text-3xl font-black mb-4 leading-tight" style={{ color: C.white }}>
                      Il tuo punto di riferimento sull'AI per il business
                    </h3>

                    {/* Description */}
                    <p className="text-base leading-relaxed mb-6" style={{ color: C.whiteAlpha80 }}>
                      Ogni giorno selezioniamo e analizziamo le notizie più rilevanti sull'intelligenza artificiale applicata al business: startup emergenti, analisi di mercato, reportage esclusivi e l'editoriale quotidiano del nostro algoritmo editoriale.
                    </p>
                    <p className="text-sm leading-relaxed mb-8" style={{ color: C.whiteAlpha60 }}>
                      Cosa trovi su AI4Business: <strong style={{ color: C.teal }}>20 notizie al giorno</strong> dalle fonti globali più autorevoli, l'editoriale AI del giorno, la startup emergente da tenere d'occhio, 4 reportage settimanali su aziende italiane e 4 analisi di mercato da CB Insights, Sifted e The Information.
                    </p>

                    {/* Stats */}
                    <div className="flex gap-6 mb-8 py-5 border-t border-b" style={{ borderColor: "rgba(0,180,160,0.2)" }}>
                      <div>
                        <div className="hub-title text-3xl font-black" style={{ color: C.teal }}>20</div>
                        <div className="text-sm mt-1" style={{ color: C.whiteAlpha50 }}>notizie al giorno</div>
                      </div>
                      <div>
                        <div className="hub-title text-3xl font-black" style={{ color: C.white }}>
                          {subscriberCount ? subscriberCount.toLocaleString("it-IT") : "5.452"}
                        </div>
                        <div className="text-sm mt-1" style={{ color: C.whiteAlpha50 }}>iscritti newsletter</div>
                      </div>
                      <div>
                        <div className="hub-title text-3xl font-black" style={{ color: C.teal }}>2×</div>
                        <div className="text-sm mt-1" style={{ color: C.whiteAlpha50 }}>a settimana</div>
                      </div>
                    </div>

                    {/* Latest news */}
                    <div className="space-y-3">
                      <p className="text-xs font-bold tracking-widest uppercase" style={{ color: C.whiteAlpha50 }}>ULTIME NOTIZIE</p>
                      {aiLatest.map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: C.teal }} />
                          <span className="text-sm leading-snug" style={{ color: C.whiteAlpha80 }}>{item.title}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 sm:hidden">
                      <div
                        className="w-full text-center py-3 rounded-xl font-bold text-base"
                        style={{ background: C.teal, color: C.navy }}
                      >
                        Entra in AI4Business →
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </FadeUp>

            {/* ITsMusic */}
            <FadeUp delay={0.2}>
              <Link href="/music">
                <div
                  className="group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl"
                  style={{
                    background: `linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.05) 100%)`,
                    border: `1px solid rgba(139,92,246,0.3)`,
                  }}
                >
                  {/* Top accent bar */}
                  <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${C.violet}, rgba(139,92,246,0.3))` }} />

                  <div className="p-8 md:p-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                          style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.3)" }}
                        >
                          🎸
                        </div>
                        <div>
                          <span
                            className="text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full"
                            style={{ background: "rgba(139,92,246,0.2)", color: C.violet, border: "1px solid rgba(139,92,246,0.3)" }}
                          >
                            ITSMUSIC
                          </span>
                          <p className="text-xs mt-1.5" style={{ color: C.whiteAlpha50 }}>by IDEASMART</p>
                        </div>
                      </div>
                      <div
                        className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all group-hover:scale-105"
                        style={{ background: C.violet, color: C.white }}
                      >
                        Entra →
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="hub-title text-2xl md:text-3xl font-black mb-4 leading-tight" style={{ color: C.white }}>
                      Rock, Indie e AI Music: l'industria musicale vista dall'interno
                    </h3>

                    {/* Description */}
                    <p className="text-base leading-relaxed mb-6" style={{ color: C.whiteAlpha80 }}>
                      ITsMusic è la testata italiana dedicata all'industria musicale contemporanea. Copriamo il Rock e l'Indie italiano e internazionale, l'impatto dell'intelligenza artificiale sulla musica e le dinamiche del mercato discografico globale.
                    </p>
                    <p className="text-sm leading-relaxed mb-8" style={{ color: C.whiteAlpha60 }}>
                      Cosa trovi su ITsMusic: <strong style={{ color: C.violet }}>20 notizie al giorno</strong> da Billboard, Rolling Stone e NME, l'editoriale musicale quotidiano, l'artista della settimana da scoprire, 4 reportage su scene musicali emergenti e 4 analisi di mercato da IFPI e Goldman Sachs.
                    </p>

                    {/* Stats */}
                    <div className="flex gap-6 mb-8 py-5 border-t border-b" style={{ borderColor: "rgba(139,92,246,0.2)" }}>
                      <div>
                        <div className="hub-title text-3xl font-black" style={{ color: C.violet }}>20</div>
                        <div className="text-sm mt-1" style={{ color: C.whiteAlpha50 }}>notizie al giorno</div>
                      </div>
                      <div>
                        <div className="hub-title text-3xl font-black" style={{ color: C.white }}>Rock</div>
                        <div className="text-sm mt-1" style={{ color: C.whiteAlpha50 }}>Indie · AI Music</div>
                      </div>
                      <div>
                        <div className="hub-title text-3xl font-black" style={{ color: C.violet }}>2×</div>
                        <div className="text-sm mt-1" style={{ color: C.whiteAlpha50 }}>a settimana</div>
                      </div>
                    </div>

                    {/* Latest news */}
                    <div className="space-y-3">
                      <p className="text-xs font-bold tracking-widest uppercase" style={{ color: C.whiteAlpha50 }}>ULTIME NOTIZIE</p>
                      {musicLatest.map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: C.violet }} />
                          <span className="text-sm leading-snug" style={{ color: C.whiteAlpha80 }}>{item.title}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 sm:hidden">
                      <div
                        className="w-full text-center py-3 rounded-xl font-bold text-base"
                        style={{ background: C.violet, color: C.white }}
                      >
                        Entra in ITsMusic →
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── ULTIME NOTIZIE (layout verticale, font grandi) ─────────────────── */}
      {allNews.length > 0 && (
        <section className="py-20 px-4" style={{ background: C.navy }}>
          <div className="max-w-4xl mx-auto">
            <FadeUp>
              <div className="flex items-end justify-between mb-12">
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: C.whiteAlpha50 }}>
                    In primo piano
                  </p>
                  <h2 className="hub-title text-4xl md:text-5xl font-black" style={{ color: C.white }}>
                    Le ultime notizie
                  </h2>
                  <p className="text-sm mt-2" style={{ color: C.whiteAlpha50 }}>
                    da <span className="font-bold" style={{ color: C.teal }}>AI4Business</span> e <span className="font-bold" style={{ color: C.violet }}>ITsMusic</span> — aggiornate ogni giorno
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link href="/ai">
                    <span
                      className="text-sm font-bold px-4 py-2 rounded-full cursor-pointer transition-all hover:opacity-80"
                      style={{ background: "rgba(0,180,160,0.15)", color: C.teal, border: `1px solid rgba(0,180,160,0.3)` }}
                    >
                      AI →
                    </span>
                  </Link>
                  <Link href="/music">
                    <span
                      className="text-sm font-bold px-4 py-2 rounded-full cursor-pointer transition-all hover:opacity-80"
                      style={{ background: "rgba(139,92,246,0.15)", color: C.violet, border: `1px solid rgba(139,92,246,0.3)` }}
                    >
                      Music →
                    </span>
                  </Link>
                </div>
              </div>
            </FadeUp>

            {/* Layout verticale — una notizia per riga */}
            <div className="space-y-0">
              {allNews.slice(0, 12).map((item, i) => {
                const isAi = item.section === "ai";
                const color = isAi ? C.teal : C.violet;
                const sectionLabel = isAi ? "AI4Business" : "ITsMusic";
                const href = isAi ? "/ai" : "/music";
                return (
                  <FadeUp key={i} delay={i * 0.03}>
                    <Link href={href}>
                      <div
                        className="group cursor-pointer flex gap-5 py-6 transition-all duration-200 hover:bg-white/5 px-4 -mx-4 rounded-xl"
                        style={{ borderBottom: `1px solid ${C.border}` }}
                      >
                        {/* Numero */}
                        <div
                          className="hub-title text-3xl font-black shrink-0 w-10 text-right leading-none pt-1"
                          style={{ color: `${color}40` }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </div>

                        {/* Immagine */}
                        {item.imageUrl && (
                          <div className="hidden sm:block w-24 h-16 rounded-lg overflow-hidden shrink-0">
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        )}

                        {/* Contenuto */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className="text-xs font-bold px-2.5 py-1 rounded-full"
                              style={{ background: `${color}20`, color, border: `1px solid ${color}30` }}
                            >
                              {sectionLabel}
                            </span>
                            <span className="text-xs font-medium" style={{ color: C.whiteAlpha50 }}>{item.category}</span>
                          </div>
                          <h3
                            className="hub-title text-xl md:text-2xl font-bold leading-snug group-hover:opacity-80 transition-opacity"
                            style={{ color: C.white }}
                          >
                            {item.title}
                          </h3>
                          {item.summary && (
                            <p className="text-base mt-2 leading-relaxed line-clamp-2" style={{ color: C.whiteAlpha60 }}>
                              {item.summary}
                            </p>
                          )}
                        </div>

                        {/* Arrow */}
                        <div
                          className="hidden md:flex items-center shrink-0 text-xl font-bold transition-transform duration-200 group-hover:translate-x-1"
                          style={{ color: `${color}60` }}
                        >
                          →
                        </div>
                      </div>
                    </Link>
                  </FadeUp>
                );
              })}
            </div>

            <FadeUp>
              <div className="flex gap-4 mt-10 justify-center">
                <Link href="/ai">
                  <button
                    className="px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
                    style={{ background: "rgba(0,180,160,0.15)", color: C.teal, border: `1px solid rgba(0,180,160,0.3)` }}
                  >
                    Tutte le news AI →
                  </button>
                </Link>
                <Link href="/music">
                  <button
                    className="px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
                    style={{ background: "rgba(139,92,246,0.15)", color: C.violet, border: `1px solid rgba(139,92,246,0.3)` }}
                  >
                    Tutte le news Music →
                  </button>
                </Link>
              </div>
            </FadeUp>
          </div>
        </section>
      )}

      {/* ── ADSENSE BANNER ────────────────────────────────────────────────── */}
      <div className="py-4 px-4" style={{ background: "#0a0f1e" }}>
        <div className="max-w-4xl mx-auto">
          <AdUnit format="auto" label="Pubblicità" />
        </div>
      </div>

      {/* ── POLLCAST SONDAGGI ─────────────────────────────────────────────── */}
      <section id="pollcast" className="py-20 px-4" style={{ background: C.navy }}>
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-10">
              <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: C.orange }}>Community</p>
              <h2 className="hub-title text-4xl md:text-5xl font-black mb-4" style={{ color: C.white }}>
                Partecipa ai sondaggi di<br /><span style={{ color: C.teal }}>IdeaSmart</span> su PollCast
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: C.whiteAlpha60 }}>
                La tua opinione conta. Vota i sondaggi curati dalla redazione di IDEASMART su AI, business e musica — e scopri cosa pensa la community.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.15}>
            <div
              className="relative rounded-2xl overflow-hidden p-8 md:p-12 flex flex-col md:flex-row items-center gap-8"
              style={{
                background: "linear-gradient(135deg, #0f172a 0%, #111827 60%, rgba(0,180,160,0.08) 100%)",
                border: `1px solid ${C.whiteAlpha15}`,
              }}
            >
              {/* Icona / Logo PollCast */}
              <div className="flex-shrink-0 flex flex-col items-center gap-3">
                <div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl"
                  style={{ background: "linear-gradient(135deg, #00b4a0 0%, #e84f00 100%)" }}
                >
                  📊
                </div>
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: C.teal }}>PollCast Online</span>
              </div>

              {/* Testo */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-black mb-3" style={{ color: C.white }}>
                  Esprimi la tua opinione
                </h3>
                <p className="text-base mb-6" style={{ color: C.whiteAlpha60 }}>
                  PollCast è la piattaforma di sondaggi in tempo reale di IDEASMART. Partecipa ai poll settimanali su intelligenza artificiale, industria musicale e tendenze del business italiano. I risultati vengono pubblicati nelle nostre newsletter.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                  <a
                    href="https://pollcast.online/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-bold text-base transition-all duration-200 hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${C.teal} 0%, #007a6e 100%)`,
                      color: C.white,
                      boxShadow: `0 4px 20px rgba(0,180,160,0.35)`,
                    }}
                  >
                    <span>Vai ai sondaggi</span>
                    <span style={{ fontSize: "1.1em" }}>→</span>
                  </a>
                  <a
                    href="https://pollcast.online/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-bold text-base transition-all duration-200"
                    style={{
                      border: `1px solid ${C.whiteAlpha15}`,
                      color: C.whiteAlpha80,
                      background: "transparent",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.whiteAlpha8)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    Scopri PollCast
                  </a>
                </div>
              </div>

              {/* Statistiche decorative */}
              <div className="flex-shrink-0 grid grid-cols-2 gap-3 md:gap-4">
                {[
                  { value: "100%", label: "Anonimo" },
                  { value: "Live", label: "Risultati" },
                  { value: "AI", label: "& Musica" },
                  { value: "Free", label: "Gratuito" },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="text-center p-3 rounded-xl"
                    style={{ background: C.whiteAlpha8, border: `1px solid ${C.whiteAlpha8}` }}
                  >
                    <p className="text-xl font-black" style={{ color: i % 2 === 0 ? C.teal : C.orange }}>{stat.value}</p>
                    <p className="text-xs" style={{ color: C.whiteAlpha50 }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── CHI SIAMO / MANIFESTO ─────────────────────────────────────────── */}
      <section id="chi-siamo" className="py-24 px-4" style={{ background: C.navyMid }}>
        <div className="max-w-4xl mx-auto">
          <FadeUp>
            <div className="text-center mb-14">
              <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: C.teal }}>Chi siamo</p>
              <h2 className="hub-title text-4xl md:text-5xl font-black mb-6" style={{ color: C.white }}>
                Giornalismo aumentato<br />dall'intelligenza artificiale
              </h2>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-10">
            <FadeUp delay={0.1}>
              <div>
                <p className="text-lg leading-relaxed mb-5" style={{ color: C.whiteAlpha80 }}>
                  IDEASMART è una testata giornalistica di nuova generazione che usa l'intelligenza artificiale per selezionare, analizzare e distribuire contenuti di qualità in due dei settori più dinamici del nostro tempo: il business dell'AI e l'industria musicale.
                </p>
                <p className="text-base leading-relaxed" style={{ color: C.whiteAlpha60 }}>
                  Ogni giorno, i nostri algoritmi analizzano centinaia di fonti globali per estrarre le notizie più rilevanti, arricchirle con analisi originali e distribuirle ai professionisti che ne hanno bisogno — senza rumore, senza clickbait.
                </p>
              </div>
            </FadeUp>
            <FadeUp delay={0.2}>
              <div className="space-y-5">
                {[
                  { icon: "🔍", title: "Selezione automatica", desc: "Il nostro sistema analizza oltre 200 fonti globali ogni giorno e seleziona solo le notizie davvero rilevanti per il tuo settore." },
                  { icon: "✍️", title: "Analisi editoriale AI", desc: "Ogni notizia viene arricchita con contesto, analisi e prospettive originali generate dal nostro modello editoriale." },
                  { icon: "📬", title: "Newsletter curate", desc: "Due newsletter settimanali — AI4Business e ITsMusic — consegnate ogni lunedì e venerdì alle 10:00." },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ background: C.whiteAlpha8, border: `1px solid ${C.border}` }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-base font-bold mb-1" style={{ color: C.white }}>{item.title}</p>
                      <p className="text-sm leading-relaxed" style={{ color: C.whiteAlpha60 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER CTA ────────────────────────────────────────────────── */}
      <section
        className="py-20 px-4"
        style={{
          background: `linear-gradient(135deg, rgba(0,180,160,0.12) 0%, rgba(139,92,246,0.12) 100%)`,
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <FadeUp>
            <div className="hub-title text-4xl md:text-5xl font-black mb-5" style={{ color: C.white }}>
              Scegli la tua newsletter
            </div>
            <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: C.whiteAlpha80 }}>
              Ricevi ogni lunedì e venerdì la selezione editoriale del canale che preferisci. Gratis, sempre.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/ai">
                <button
                  className="px-8 py-4 rounded-xl font-bold text-base transition-all hover:scale-105"
                  style={{ background: C.teal, color: C.navy }}
                >
                  🤖 AI4Business News
                </button>
              </Link>
              <Link href="/music">
                <button
                  className="px-8 py-4 rounded-xl font-bold text-base transition-all hover:scale-105"
                  style={{ background: C.violet, color: C.white }}
                >
                  🎸 ITsMusic
                </button>
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="py-14 px-4" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-10">
            {/* Logo + tagline */}
            <div>
              <div className="hub-title text-2xl font-black mb-2" style={{ color: C.white }}>
                IDEA<span style={{ color: C.teal }}>SMART</span>
              </div>
              <p className="text-sm mb-1" style={{ color: C.whiteAlpha50 }}>
                Testata giornalistica multicanale
              </p>
              <p className="text-sm" style={{ color: C.whiteAlpha50 }}>
                AI4Business News + ITsMusic
              </p>
            </div>

            {/* Canali */}
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: C.whiteAlpha50 }}>CANALI</p>
              <div className="space-y-2">
                <Link href="/ai">
                  <div className="text-base font-semibold cursor-pointer transition-opacity hover:opacity-80" style={{ color: C.teal }}>
                    🤖 AI4Business News →
                  </div>
                </Link>
                <Link href="/music">
                  <div className="text-base font-semibold cursor-pointer transition-opacity hover:opacity-80" style={{ color: C.violet }}>
                    🎸 ITsMusic →
                  </div>
                </Link>
              </div>
            </div>

            {/* Info */}
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: C.whiteAlpha50 }}>INFO</p>
              <div className="space-y-2">
                <button
                  className="block text-base transition-opacity hover:opacity-80"
                  style={{ color: C.whiteAlpha60 }}
                  onClick={() => document.getElementById("chi-siamo")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Chi siamo
                </button>
                <a href="/advertise" className="block text-base transition-opacity hover:opacity-80" style={{ color: C.whiteAlpha60 }}>
                  Advertising
                </a>
                <a href="/privacy" className="block text-base transition-opacity hover:opacity-80" style={{ color: C.whiteAlpha60 }}>
                  Privacy Policy
                </a>
                <a href="mailto:info@ideasmart.ai" className="block text-base transition-opacity hover:opacity-80" style={{ color: C.whiteAlpha60 }}>
                  info@ideasmart.ai
                </a>
              </div>
            </div>
          </div>

          <div className="pt-6 text-center text-sm" style={{ color: C.whiteAlpha50, borderTop: `1px solid ${C.border}` }}>
            © {new Date().getFullYear()} IDEASMART — Tutti i diritti riservati
          </div>
        </div>
      </footer>
    </div>
  );
}
