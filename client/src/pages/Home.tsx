/*
 * IDEASMART — Homepage Hub Multitematica
 * Design: Deep navy (#0a0f1e) + Teal (#00b4a0) + Viola (#8b5cf6) + Orange (#e84f00)
 * Layout: Testata giornalistica multicanale — AI4Business News + ITsMusic
 */
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";

// ─── Brand Colors ─────────────────────────────────────────────────────────────
const C = {
  navy: "#0a0f1e",
  navyMid: "#111827",
  teal: "#00b4a0",
  tealLight: "rgba(0,180,160,0.12)",
  violet: "#8b5cf6",
  violetLight: "rgba(139,92,246,0.12)",
  orange: "#e84f00",
  white: "#ffffff",
  whiteAlpha80: "rgba(255,255,255,0.8)",
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

// ─── Channel Card ─────────────────────────────────────────────────────────────
function ChannelCard({
  href, label, tagline, color, colorLight, icon, newsCount, subscriberCount,
  latestNews,
}: {
  href: string; label: string; tagline: string; color: string; colorLight: string;
  icon: string; newsCount: number; subscriberCount?: number;
  latestNews: Array<{ title: string; category: string }>;
}) {
  return (
    <Link href={href}>
      <div
        className="group cursor-pointer rounded-2xl p-8 transition-all duration-300 hover:scale-[1.01]"
        style={{
          background: `linear-gradient(135deg, ${colorLight} 0%, rgba(255,255,255,0.03) 100%)`,
          border: `1px solid ${color}30`,
          boxShadow: `0 0 40px ${color}10`,
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{icon}</span>
              <span
                className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full"
                style={{ background: colorLight, color, border: `1px solid ${color}40` }}
              >
                {label}
              </span>
            </div>
            <p className="text-sm" style={{ color: C.whiteAlpha50 }}>{tagline}</p>
          </div>
          <div
            className="text-sm font-bold px-3 py-1 rounded-full transition-all group-hover:scale-105"
            style={{ background: color, color: "#fff" }}
          >
            Entra →
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mb-6">
          <div className="text-center">
            <div className="text-xl font-bold" style={{ color }}>{newsCount}</div>
            <div className="text-xs" style={{ color: C.whiteAlpha50 }}>notizie oggi</div>
          </div>
          {subscriberCount && (
            <div className="text-center">
              <div className="text-xl font-bold" style={{ color: C.white }}>{subscriberCount.toLocaleString("it-IT")}</div>
              <div className="text-xs" style={{ color: C.whiteAlpha50 }}>iscritti</div>
            </div>
          )}
        </div>

        {/* Latest news preview */}
        <div className="space-y-2">
          {latestNews.slice(0, 3).map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-xs mt-0.5 shrink-0" style={{ color }}>▸</span>
              <span className="text-xs leading-snug" style={{ color: C.whiteAlpha80 }}>{item.title}</span>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}

// ─── News Card compatta ───────────────────────────────────────────────────────
function MiniNewsCard({
  title, category, imageUrl, section, sourceUrl,
}: {
  title: string; category: string; imageUrl?: string | null; section: "ai" | "music"; sourceUrl?: string;
}) {
  const color = section === "ai" ? C.teal : C.violet;
  const sectionLabel = section === "ai" ? "AI" : "MUSIC";
  const href = section === "ai" ? "/ai" : "/music";

  return (
    <Link href={href}>
      <div
        className="group cursor-pointer rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.01]"
        style={{ background: C.whiteAlpha8, border: `1px solid ${C.border}` }}
      >
        {imageUrl && (
          <div className="h-32 overflow-hidden">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${color}20`, color, border: `1px solid ${color}30` }}
            >
              {sectionLabel}
            </span>
            <span className="text-xs" style={{ color: C.whiteAlpha50 }}>{category}</span>
          </div>
          <p className="text-sm font-semibold leading-snug" style={{ color: C.white }}>{title}</p>
        </div>
      </div>
    </Link>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  // Carica le ultime news AI e musicali per la preview
  const { data: aiNews } = trpc.news.getLatest.useQuery({ section: "ai" });
  const { data: musicNews } = trpc.news.getLatest.useQuery({ section: "music" });
  const { data: subscriberCount } = trpc.newsletter.getActiveCount.useQuery();

  const aiLatest = (aiNews || []).slice(0, 3).map((n) => ({ title: n.title, category: n.category }));
  const musicLatest = (musicNews || []).slice(0, 3).map((n) => ({ title: n.title, category: n.category }));

  // Mix delle ultime notizie da entrambe le sezioni (alternato)
  const allNews = [];
  const aiSlice = (aiNews || []).slice(0, 6);
  const musicSlice = (musicNews || []).slice(0, 6);
  const maxLen = Math.max(aiSlice.length, musicSlice.length);
  for (let i = 0; i < maxLen; i++) {
    if (aiSlice[i]) allNews.push({ ...aiSlice[i], section: "ai" as const });
    if (musicSlice[i]) allNews.push({ ...musicSlice[i], section: "music" as const });
  }

  return (
    <div style={{ background: C.navy, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Font imports */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');
        .hub-title { font-family: 'Space Grotesk', sans-serif; }
      `}</style>

      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative pt-28 pb-20 px-4 overflow-hidden"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,180,160,0.15) 0%, transparent 70%), ${C.navy}`,
        }}
      >
        {/* Decorative grid */}
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
              className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-6"
              style={{ background: C.whiteAlpha8, border: `1px solid ${C.border}`, color: C.teal }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.teal }} />
              Testata Giornalistica Multicanale
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <h1
              className="hub-title text-5xl md:text-7xl font-bold mb-6 leading-tight"
              style={{ color: C.white }}
            >
              IDEA<span style={{ color: C.teal }}>SMART</span>
            </h1>
          </FadeUp>

          <FadeUp delay={0.2}>
            <p className="text-lg md:text-xl mb-4 max-w-2xl mx-auto" style={{ color: C.whiteAlpha80 }}>
              La piattaforma editoriale italiana che unisce i mondi dell'<strong style={{ color: C.teal }}>Intelligenza Artificiale</strong> e della <strong style={{ color: C.violet }}>Musica</strong>.
            </p>
            <p className="text-base mb-10 max-w-xl mx-auto" style={{ color: C.whiteAlpha50 }}>
              Contenuti aggiornati ogni giorno. Analisi, reportage e newsletter curate da AI per professionisti.
            </p>
          </FadeUp>

          {/* Stats */}
          <FadeUp delay={0.3}>
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              {[
                { value: "2", label: "canali tematici" },
                { value: "40+", label: "contenuti al giorno" },
                { value: subscriberCount ? `${subscriberCount.toLocaleString("it-IT")}+` : "5.000+", label: "iscritti attivi" },
                { value: "100%", label: "aggiornamento automatico" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="hub-title text-3xl font-bold" style={{ color: C.white }}>{stat.value}</div>
                  <div className="text-xs mt-1" style={{ color: C.whiteAlpha50 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── CANALI ────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-12">
              <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: C.teal }}>I nostri canali</p>
              <h2 className="hub-title text-3xl md:text-4xl font-bold" style={{ color: C.white }}>
                Scegli il tuo canale
              </h2>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-6">
            <FadeUp delay={0.1}>
              <ChannelCard
                href="/ai"
                label="AI4Business News"
                tagline="Intelligenza artificiale, startup, analisi di mercato e reportage per il business"
                color={C.teal}
                colorLight={C.tealLight}
                icon="🤖"
                newsCount={20}
                subscriberCount={subscriberCount || undefined}
                latestNews={aiLatest}
              />
            </FadeUp>

            <FadeUp delay={0.2}>
              <ChannelCard
                href="/music"
                label="ITsMusic"
                tagline="Rock, Indie e AI Music — notizie, artisti emergenti, analisi dell'industria musicale"
                color={C.violet}
                colorLight={C.violetLight}
                icon="🎸"
                newsCount={20}
                latestNews={musicLatest}
              />
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── MIX NOTIZIE ───────────────────────────────────────────────────── */}
      {allNews.length > 0 && (
        <section className="py-16 px-4" style={{ background: C.navyMid }}>
          <div className="max-w-5xl mx-auto">
            <FadeUp>
              <div className="flex items-center justify-between mb-10">
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: C.whiteAlpha50 }}>
                    In primo piano
                  </p>
                  <h2 className="hub-title text-2xl md:text-3xl font-bold" style={{ color: C.white }}>
                    Le ultime notizie
                  </h2>
                </div>
                <div className="flex gap-2">
                  <Link href="/ai">
                    <span
                      className="text-xs font-bold px-3 py-1.5 rounded-full cursor-pointer transition-all hover:opacity-80"
                      style={{ background: C.tealLight, color: C.teal, border: `1px solid ${C.teal}30` }}
                    >
                      AI →
                    </span>
                  </Link>
                  <Link href="/music">
                    <span
                      className="text-xs font-bold px-3 py-1.5 rounded-full cursor-pointer transition-all hover:opacity-80"
                      style={{ background: C.violetLight, color: C.violet, border: `1px solid ${C.violet}30` }}
                    >
                      Music →
                    </span>
                  </Link>
                </div>
              </div>
            </FadeUp>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allNews.slice(0, 12).map((item, i) => (
                <FadeUp key={i} delay={i * 0.04}>
                  <MiniNewsCard
                    title={item.title}
                    category={item.category}
                    imageUrl={item.imageUrl}
                    section={item.section}
                    sourceUrl={item.sourceUrl}
                  />
                </FadeUp>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── MANIFESTO ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <FadeUp>
            <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: C.teal }}>
              Il nostro manifesto
            </p>
            <h2 className="hub-title text-3xl md:text-4xl font-bold mb-6" style={{ color: C.white }}>
              Giornalismo aumentato dall'intelligenza artificiale
            </h2>
            <p className="text-base leading-relaxed mb-4" style={{ color: C.whiteAlpha80 }}>
              IDEASMART è una testata giornalistica di nuova generazione che usa l'intelligenza artificiale per selezionare, analizzare e distribuire contenuti di qualità in due dei settori più dinamici del nostro tempo: il business dell'AI e l'industria musicale.
            </p>
            <p className="text-base leading-relaxed" style={{ color: C.whiteAlpha50 }}>
              Ogni giorno, i nostri algoritmi analizzano centinaia di fonti globali per estrarre le notizie più rilevanti, arricchirle con analisi originali e distribuirle ai professionisti che ne hanno bisogno.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── NEWSLETTER CTA ────────────────────────────────────────────────── */}
      <section
        className="py-20 px-4"
        style={{
          background: `linear-gradient(135deg, ${C.tealLight} 0%, ${C.violetLight} 100%)`,
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <FadeUp>
            <h2 className="hub-title text-3xl md:text-4xl font-bold mb-4" style={{ color: C.white }}>
              Scegli la tua newsletter
            </h2>
            <p className="text-base mb-10" style={{ color: C.whiteAlpha80 }}>
              Ricevi ogni lunedì e venerdì la selezione editoriale del canale che preferisci.
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
      <footer className="py-12 px-4" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="hub-title text-xl font-bold mb-1" style={{ color: C.white }}>
                IDEA<span style={{ color: C.teal }}>SMART</span>
              </div>
              <p className="text-xs" style={{ color: C.whiteAlpha50 }}>
                Testata giornalistica multicanale — AI4Business News + ITsMusic
              </p>
            </div>
            <div className="flex gap-6 text-sm" style={{ color: C.whiteAlpha50 }}>
              <Link href="/ai"><span className="hover:text-white cursor-pointer transition-colors" style={{ color: C.teal }}>AI4Business →</span></Link>
              <Link href="/music"><span className="hover:text-white cursor-pointer transition-colors" style={{ color: C.violet }}>ITsMusic →</span></Link>
            </div>
          </div>
          <div className="mt-8 pt-6 text-center text-xs" style={{ color: C.whiteAlpha50, borderTop: `1px solid ${C.border}` }}>
            © {new Date().getFullYear()} IDEASMART — Tutti i diritti riservati
          </div>
        </div>
      </footer>
    </div>
  );
}
