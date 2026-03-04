/*
 * IDEASMART Home Page — Dark Editorial / Tech Magazine
 * Design: Deep navy (#0a0f1e) + Cyan (#00e5c8) + Orange (#ff5500)
 * Typography: Space Grotesk (display) + DM Sans (body) + JetBrains Mono (mono)
 * Layout: Asymmetric editorial with numbered sections
 */
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Navbar from "@/components/Navbar";

// ─── Image URLs (CDN) ────────────────────────────────────────────────────────
const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ideasmart_hero-6ZrdwCga3BYZbueso82C5j.webp";
const FOOLTALENT_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ideasmart_fooltalent-2nEN4eE9YHfFBW4qWKwTVs.webp";
const FOOLSHARE_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ideasmart_foolshare-UYNVhRWFTa6cBhUyxxwkEK.webp";
const FRAGMENTALIS_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ideasmart_fragmentalis-WqVpGnPxQvhf6bevxs5m6m.webp";
const POLLCAST_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ideasmart_pollcast-gLGMN8iojcFU6EWceVzvo5.webp";

// ─── Animation helpers ───────────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Progress Bar ────────────────────────────────────────────────────────────
function PollBar({ label, category, percentage, votes, color }: {
  label: string; category: string; percentage: number; votes: number; color: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="border border-white/8 rounded-xl p-4 hover:border-white/15 transition-colors">
      <p className="editorial-tag mb-2" style={{ color }}>{category}</p>
      <p className="text-sm font-semibold text-white/90 mb-3 leading-snug" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        {label}
      </p>
      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden mb-2">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${percentage}%` } : {}}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between">
        <span className="text-xs font-bold" style={{ color }}>{percentage}% Sì</span>
        <span className="text-xs text-white/35">{votes.toLocaleString()} voti</span>
      </div>
    </div>
  );
}

// ─── Feature check item ──────────────────────────────────────────────────────
function FeatureItem({ text, color }: { text: string; color: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/6 last:border-0">
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: `${color}20` }}
      >
        <span className="text-xs font-bold" style={{ color }}>✓</span>
      </div>
      <p className="text-sm text-white/70 leading-relaxed">{text}</p>
    </div>
  );
}

// ─── Stat block ─────────────────────────────────────────────────────────────
function StatBlock({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="text-center p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
      <div className="text-3xl font-black mb-1" style={{ color, fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
      <div className="editorial-tag text-white/35">{label}</div>
    </div>
  );
}

// ─── Article Section ─────────────────────────────────────────────────────────
function ArticleSection({
  id, number, category, categoryColor, title, subtitle, image, accentColor, bgDark = false,
  children, ctaPrimary, ctaSecondary, ctaUrl,
}: {
  id: string; number: string; category: string; categoryColor: string;
  title: string; subtitle: string; image: string; accentColor: string; bgDark?: boolean;
  children: React.ReactNode; ctaPrimary: string; ctaSecondary: string; ctaUrl: string;
}) {
  return (
    <section id={id} className="relative" style={{ background: bgDark ? "#080c18" : "#0a0f1e" }}>
      {/* Category bar */}
      <div className="border-b border-white/8" style={{ background: "#060a14" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
          <span className="editorial-tag text-white/30">{number} —</span>
          <span className="editorial-tag" style={{ color: categoryColor }}>{category}</span>
        </div>
      </div>

      {/* Title bar */}
      <div className="border-b-2" style={{ borderColor: accentColor, background: `${accentColor}12` }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <h2
            className="text-2xl sm:text-3xl font-black leading-tight"
            style={{ color: bgDark ? accentColor : "#ffffff", fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {title}
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: text */}
          <FadeUp>
            <p className="text-sm font-medium mb-4" style={{ color: accentColor, fontFamily: "'DM Sans', sans-serif" }}>
              {subtitle}
            </p>
            {children}
            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mt-8">
              <a
                href={ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-bold transition-all duration-200 hover:scale-105"
                style={{ background: accentColor, color: bgDark ? "#0a0f1e" : "#0a0f1e", fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {ctaPrimary} →
              </a>
              <a
                href={ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold border border-white/15 text-white/70 hover:text-white hover:border-white/30 transition-all duration-200"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {ctaSecondary}
              </a>
            </div>
          </FadeUp>

          {/* Right: image */}
          <FadeUp delay={0.15}>
            <div className="rounded-2xl overflow-hidden border border-white/8 article-card">
              <img
                src={image}
                alt={title}
                className="w-full h-56 object-cover"
                loading="lazy"
              />
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Home() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubscribed(true);
  };

  return (
    <div className="min-h-screen" style={{ background: "#0a0f1e" }}>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="Rete neurale AI - Osservatorio sull'Innovazione AI Italiana" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(10,15,30,0.6) 0%, rgba(10,15,30,0.85) 60%, #0a0f1e 100%)" }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <FadeUp>
            {/* Issue badge */}
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-white/15" style={{ background: "rgba(0,229,200,0.08)" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#00e5c8" }} />
              <span className="editorial-tag" style={{ color: "#00e5c8" }}>
                Osservatorio sull'Innovazione AI Italiana
              </span>
              <span className="editorial-tag text-white/30">N° 03 — Marzo 2026</span>
            </div>

            {/* Main title */}
            <h1
              className="text-6xl sm:text-7xl lg:text-8xl font-black leading-none tracking-tight mb-6"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              IDEA<span style={{ color: "#00e5c8" }}>SMART</span>
            </h1>
            <p
              className="text-base sm:text-lg tracking-widest uppercase mb-8 text-white/40"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              L'Analisi Mensile &nbsp;·&nbsp; AI for Business
            </p>

            {/* Description */}
            <p className="text-lg sm:text-xl text-white/70 leading-relaxed max-w-2xl mb-10" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              <strong className="text-white">IDEASMART</strong> è la startup italiana di tecnologia e innovazione
              che ogni mese analizza, testa e seleziona le realtà più promettenti
              dell'ecosistema AI per il business. La nostra redazione porta alla luce
              le soluzioni che stanno ridefinendo il modo di lavorare, investire e crescere.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-6 mb-10">
              {[
                { value: "N° 03", label: "Marzo 2026" },
                { value: "4", label: "Startup analizzate" },
                { value: "100%", label: "AI-driven" },
              ].map((s) => (
                <div key={s.label} className="flex items-baseline gap-2">
                  <span className="text-2xl font-black" style={{ color: "#00e5c8", fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</span>
                  <span className="text-sm text-white/40">{s.label}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => document.getElementById("editoriale")?.scrollIntoView({ behavior: "smooth" })}
                className="px-6 py-3 rounded-lg text-sm font-bold transition-all duration-200 hover:scale-105"
                style={{ background: "#00e5c8", color: "#0a0f1e", fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Leggi l'analisi del mese ↓
              </button>
              <button
                onClick={() => document.getElementById("newsletter")?.scrollIntoView({ behavior: "smooth" })}
                className="px-6 py-3 rounded-lg text-sm font-semibold border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all duration-200"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Abbonati alla newsletter →
              </button>
            </div>
          </FadeUp>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/25">
          <span className="editorial-tag">SCORRI</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-0.5 h-8 rounded-full"
            style={{ background: "linear-gradient(to bottom, rgba(0,229,200,0.5), transparent)" }}
          />
        </div>
      </section>

      {/* ── EDITORIALE ──────────────────────────────────────────────────────── */}
      <section id="editoriale" className="border-t border-white/8" style={{ background: "#0d1220" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <FadeUp>
            <p className="editorial-tag mb-4" style={{ color: "#00e5c8" }}>◆ Editoriale</p>
            <h2
              className="text-3xl sm:text-4xl font-black leading-tight mb-8 max-w-3xl"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              L'AI italiana non è un fenomeno di nicchia.
              <br />
              <span style={{ color: "#00e5c8" }}>Sta cambiando le regole del gioco.</span>
            </h2>
          </FadeUp>

          <div className="grid lg:grid-cols-3 gap-12">
            <FadeUp delay={0.1} className="lg:col-span-2">
              <div className="space-y-5 text-white/70 leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <p>
                  Quando abbiamo fondato IDEASMART, la domanda che ci ponevamo era semplice:
                  dove sta succedendo davvero qualcosa di interessante nell'ecosistema AI italiano?
                  Non nei comunicati stampa, non nei convegni, ma nei prodotti concreti che le aziende
                  usano ogni giorno per assumere, proteggere dati, comunicare e prendere decisioni.
                </p>
                <p>
                  Questo mese abbiamo analizzato quattro startup che ci hanno convinto. Non perché abbiano
                  raccolto il round più grande o abbiano il fondatore più famoso, ma perché hanno costruito
                  qualcosa di reale: una tecnologia proprietaria, un modello di business sostenibile,
                  un problema concreto risolto in modo intelligente.
                </p>
                <p>
                  Da <strong className="text-white">FoolTalent</strong>, che sta ridefinendo il recruiting
                  con l'AI, a <strong className="text-white">FoolShare</strong>, che ha costruito la data room
                  più avanzata del mercato italiano. Da <strong className="text-white">Fragmentalis</strong>,
                  con la sua tecnologia brevettata di comunicazione quantum-resistant, a{" "}
                  <strong className="text-white">PollCast</strong>, che trasforma l'intelligenza collettiva
                  in market intelligence. Quattro storie diverse, un denominatore comune: l'AI come leva
                  di vantaggio competitivo reale.
                </p>
              </div>

              {/* Firma */}
              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-white/8">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #00e5c8, #0066ff)", color: "#0a0f1e" }}
                >
                  IS
                </div>
                <div>
                  <p className="text-sm font-semibold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    La Redazione IDEASMART
                  </p>
                  <p className="text-xs text-white/40">Startup di Tecnologia &amp; Innovazione — AI for Business</p>
                </div>
              </div>
            </FadeUp>

            {/* Index */}
            <FadeUp delay={0.2}>
              <div className="border border-white/8 rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.02)" }}>
                <p className="editorial-tag text-white/30 mb-5">◆ In questo numero</p>
                <div className="space-y-1">
                  {[
                    { n: "01", cat: "Reportage", title: "FoolTalent: l'AI che scova i talenti prima degli altri.", id: "fooltalent", color: "#00e5c8" },
                    { n: "02", cat: "Analisi", title: "FoolShare: la fortezza digitale per i dati che contano.", id: "foolshare", color: "#0066ff" },
                    { n: "03", cat: "Inchiesta", title: "Fragmentalis: la comunicazione a prova di spia.", id: "fragmentalis", color: "#00e5c8" },
                    { n: "04", cat: "Focus", title: "PollCast: l'intelligenza collettiva che prevede i trend.", id: "pollcast", color: "#ff5500" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" })}
                      className="w-full text-left p-3 rounded-xl hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="editorial-tag text-white/25 flex-shrink-0 mt-0.5">{item.n}</span>
                        <div>
                          <p className="editorial-tag mb-1" style={{ color: item.color }}>{item.cat}</p>
                          <p className="text-xs text-white/60 group-hover:text-white/80 transition-colors leading-snug">
                            {item.title}
                          </p>
                        </div>
                        <span className="ml-auto text-xs flex-shrink-0" style={{ color: item.color }}>→</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── FOOLTALENT ──────────────────────────────────────────────────────── */}
      <ArticleSection
        id="fooltalent"
        number="01"
        category="Reportage · AI Recruiting"
        categoryColor="#00e5c8"
        title="FoolTalent: l'AI che scova i talenti prima degli altri."
        subtitle="Come una startup milanese sta rivoluzionando il processo di selezione del personale con l'intelligenza artificiale."
        image={FOOLTALENT_IMG}
        accentColor="#00e5c8"
        ctaPrimary="Scopri FoolTalent"
        ctaSecondary="Vedi gli annunci →"
        ctaUrl="https://fooltalent.com"
      >
        <div className="space-y-4 text-white/70 leading-relaxed mb-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          <p>
            Il problema del recruiting nelle startup italiane è sempre lo stesso: troppo tempo perso
            a leggere CV irrilevanti, troppo poco a parlare con i candidati giusti.{" "}
            <strong className="text-white">FoolTalent</strong> ha deciso di affrontarlo con un approccio
            radicalmente diverso: la sua AI non filtra per parole chiave, ma analizza ogni candidatura
            in profondità e assegna un punteggio di compatibilità reale.
          </p>
          <p>
            Nella nostra analisi, quello che ci ha colpito è la granularità del punteggio: l'AI non
            si limita a dire "compatibile" o "non compatibile", ma spiega perché, indicando i punti
            di forza e le lacune di ogni candidato rispetto al profilo cercato.
          </p>
        </div>

        {/* Quote */}
        <blockquote className="border-l-2 pl-4 py-2 mb-6" style={{ borderColor: "#00e5c8", background: "rgba(0,229,200,0.05)", borderRadius: "0 8px 8px 0" }}>
          <p className="text-sm italic" style={{ color: "#00e5c8" }}>
            "L'AI non sostituisce il recruiter. Lo libera dal rumore, così può concentrarsi sul segnale."
          </p>
        </blockquote>

        <div className="space-y-0">
          <FeatureItem color="#00e5c8" text="Valutazione automatica AI con punteggio percentuale di compatibilità per ogni candidatura" />
          <FeatureItem color="#00e5c8" text="Shortlist intelligente: il sistema mostra solo i profili più compatibili, ordinati per rilevanza" />
          <FeatureItem color="#00e5c8" text="Database talenti integrato con ricerca avanzata per competenze, settore ed esperienza" />
          <FeatureItem color="#00e5c8" text="Dashboard analytics con trend candidature in tempo reale e reportistica avanzata" />
        </div>

        <div className="grid grid-cols-3 gap-3 mt-6">
          <StatBlock value="78" label="Candidature gestite" color="#00e5c8" />
          <StatBlock value="100%" label="Valutate da AI" color="#00e5c8" />
          <StatBlock value="60%" label="Punteggio medio" color="#00e5c8" />
        </div>
      </ArticleSection>

      {/* ── FOOLSHARE ───────────────────────────────────────────────────────── */}
      <section id="foolshare" className="relative border-t border-white/8" style={{ background: "#080c18" }}>
        {/* Category bar */}
        <div className="border-b border-white/8" style={{ background: "#060a14" }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
            <span className="editorial-tag text-white/30">02 —</span>
            <span className="editorial-tag" style={{ color: "#0066ff" }}>Analisi · Data Room &amp; Fundraising</span>
          </div>
        </div>
        <div className="border-b-2" style={{ borderColor: "#0066ff", background: "rgba(0,102,255,0.08)" }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              FoolShare: la fortezza digitale per i dati che contano.
            </h2>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <FadeUp>
              <p className="text-sm font-medium mb-4" style={{ color: "#0066ff" }}>
                Abbiamo testato la piattaforma che unisce data room sicure, NDA digitali e un sistema operativo per il fundraising.
              </p>
              <div className="space-y-4 text-white/70 leading-relaxed mb-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <p>
                  La condivisione di documenti sensibili è il tallone d'Achille di molte aziende.{" "}
                  <strong className="text-white">FoolShare</strong> risponde con una piattaforma che non si limita
                  a "proteggere" i documenti, ma li trasforma in uno strumento di intelligence: ogni link condiviso
                  è tracciabile — chi lo ha aperto, per quanti minuti, quante volte, da quale città.
                </p>
                <p>
                  Il modulo Fundraising OS è quello che ci ha colpito di più. Le startup possono aprire una
                  Project Room pubblica, presentarsi agli investitori e raccogliere soft commitment in modo
                  strutturato. L'AI Agent integrato analizza automaticamente tutti i documenti caricati.
                </p>
              </div>

              <blockquote className="border-l-2 pl-4 py-2 mb-6" style={{ borderColor: "#0066ff", background: "rgba(0,102,255,0.05)", borderRadius: "0 8px 8px 0" }}>
                <p className="text-sm italic" style={{ color: "#0066ff" }}>
                  "Non è solo una data room. È un sistema operativo per il fundraising. La differenza è sostanziale."
                </p>
              </blockquote>

              {/* Pricing box */}
              <div className="rounded-xl p-4 mb-6 border border-white/8" style={{ background: "rgba(0,102,255,0.06)" }}>
                <p className="text-sm text-white/80" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  <span style={{ color: "#0066ff" }}>🎁 Prova gratuita 7 giorni</span> — nessuna carta di credito richiesta.<br />
                  Piani da <strong className="text-white">€49/mese</strong> (Premium) · <strong className="text-white">€99/mese</strong> (Project Room + Fundraising OS)
                </p>
              </div>

              <div className="space-y-0">
                <FeatureItem color="#0066ff" text="Crittografia 256-bit su tutti i file — GDPR compliant, 99.9% uptime garantito" />
                <FeatureItem color="#0066ff" text="NDA digitali legalmente vincolanti con template bilingue IT/EN incluso" />
                <FeatureItem color="#0066ff" text="Analytics avanzate: geolocalizzazione visitatori, grafici settimanali, visualizzazioni in tempo reale" />
                <FeatureItem color="#0066ff" text="AI Agent integrato: analisi automatica dei documenti e risposte immediate sui contenuti" />
              </div>

              <div className="flex flex-wrap gap-3 mt-8">
                <a href="https://foolshare.xyz" target="_blank" rel="noopener noreferrer"
                  className="px-5 py-3 rounded-lg text-sm font-bold transition-all hover:scale-105"
                  style={{ background: "#0066ff", color: "#fff", fontFamily: "'Space Grotesk', sans-serif" }}>
                  Inizia gratis →
                </a>
                <a href="https://foolshare.xyz" target="_blank" rel="noopener noreferrer"
                  className="px-5 py-3 rounded-lg text-sm font-semibold border border-white/15 text-white/70 hover:text-white hover:border-white/30 transition-all">
                  Scopri i piani →
                </a>
              </div>
            </FadeUp>

            <FadeUp delay={0.15}>
              <div className="rounded-2xl overflow-hidden border border-white/8 article-card mb-6">
                <img src={FOOLSHARE_IMG} alt="FoolShare" className="w-full h-56 object-cover" loading="lazy" />
              </div>
              {/* Feature cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { title: "Condivisione Sicura", desc: "Link protetti, accesso per email, blocco download" },
                  { title: "Fundraising OS", desc: "Project Room, investor tracking, soft commitment" },
                  { title: "Data Room Pro", desc: "Cartelle strutturate, permessi granulari, due diligence" },
                ].map((f) => (
                  <div key={f.title} className="rounded-xl p-3 border border-white/8 text-center" style={{ background: "rgba(0,102,255,0.05)" }}>
                    <p className="text-xs font-bold mb-1" style={{ color: "#0066ff", fontFamily: "'Space Grotesk', sans-serif" }}>{f.title}</p>
                    <p className="text-xs text-white/40 leading-snug">{f.desc}</p>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── FRAGMENTALIS ────────────────────────────────────────────────────── */}
      <section id="fragmentalis" className="border-t border-white/8" style={{ background: "#060a14" }}>
        <div className="border-b border-white/8" style={{ background: "#040810" }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
            <span className="editorial-tag text-white/30">03 —</span>
            <span className="editorial-tag" style={{ color: "#00e5c8" }}>Inchiesta · Cybersecurity &amp; Comunicazione</span>
          </div>
        </div>
        <div className="border-b-2" style={{ borderColor: "#00e5c8", background: "linear-gradient(135deg, rgba(0,6,110,0.4), rgba(0,229,200,0.05))" }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <h2 className="text-2xl sm:text-3xl font-black leading-tight" style={{ color: "#00e5c8", fontFamily: "'Space Grotesk', sans-serif" }}>
              Fragmentalis: la comunicazione a prova di spia (e di computer quantistici).
            </h2>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <FadeUp>
              <p className="text-sm font-medium mb-4" style={{ color: "#00e5c8" }}>
                La tecnologia brevettata IT/EU/USA che rende matematicamente impossibile intercettare le comunicazioni aziendali.
              </p>
              <div className="space-y-4 text-white/70 leading-relaxed mb-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <p>
                  Mentre tutti parlano di crittografia end-to-end, <strong className="text-white">Fragmentalis</strong>{" "}
                  ha già spostato il campo di gioco nel futuro. La sua tecnologia brevettata "polverizza" i dati —
                  li frammenta su nodi distribuiti, rendendo matematicamente impossibile ricostruirli. Il prodotto
                  di punta, <strong className="text-white">StreamSafer Communicator</strong>, è già usato da CDA
                  aziendali, studi legali e istituzioni finanziarie.
                </p>
                <p>
                  Con l'avvento dei computer quantistici, che renderanno obsoleta la crittografia tradizionale,
                  la soluzione di Fragmentalis diventa non solo interessante, ma necessaria. GDPR, DORA e NIS2
                  compliant. 6 prodotti verticali per ogni settore.
                </p>
              </div>

              <blockquote className="border-l-2 pl-4 py-2 mb-6" style={{ borderColor: "#00e5c8", background: "rgba(0,229,200,0.04)", borderRadius: "0 8px 8px 0" }}>
                <p className="text-sm italic" style={{ color: "#00e5c8" }}>
                  "Non esiste un server centrale. I dati vengono polverizzati. Per ricostruirli, bisognerebbe accedere a tutti i nodi contemporaneamente. Matematicamente impossibile."
                </p>
              </blockquote>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <StatBlock value="0" label="Server centrale" color="#00e5c8" />
                <StatBlock value="100%" label="Controllo dati" color="#00e5c8" />
                <StatBlock value="3" label="Brevetti IT/EU/US" color="#00e5c8" />
              </div>

              <div className="flex flex-wrap gap-3 mt-4">
                <a href="https://fragmentalis.com" target="_blank" rel="noopener noreferrer"
                  className="px-5 py-3 rounded-lg text-sm font-bold transition-all hover:scale-105"
                  style={{ background: "#00e5c8", color: "#0a0f1e", fontFamily: "'Space Grotesk', sans-serif" }}>
                  Richiedi Demo →
                </a>
                <a href="https://fragmentalis.com" target="_blank" rel="noopener noreferrer"
                  className="px-5 py-3 rounded-lg text-sm font-semibold border border-white/15 text-white/70 hover:text-white hover:border-white/30 transition-all">
                  Scopri StreamSafer →
                </a>
              </div>
            </FadeUp>

            <FadeUp delay={0.15}>
              <div className="rounded-2xl overflow-hidden border border-white/8 article-card">
                <img src={FRAGMENTALIS_IMG} alt="Fragmentalis" className="w-full h-56 object-cover" loading="lazy" />
              </div>
              <div className="mt-4 space-y-0">
                <FeatureItem color="#00e5c8" text="Nessun server centrale — architettura distribuita peer-to-peer brevettata" />
                <FeatureItem color="#00e5c8" text="Quantum-resistant: resistente anche ai futuri computer quantistici" />
                <FeatureItem color="#00e5c8" text="6 prodotti verticali: Communicator, Vault, Shield, Bridge, Guard, Relay" />
                <FeatureItem color="#00e5c8" text="Compliance totale: GDPR, DORA, NIS2 — audit trail completo" />
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── POLLCAST ────────────────────────────────────────────────────────── */}
      <section id="pollcast" className="border-t border-white/8" style={{ background: "#0a0f1e" }}>
        <div className="border-b border-white/8" style={{ background: "#060a14" }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
            <span className="editorial-tag text-white/30">04 —</span>
            <span className="editorial-tag" style={{ color: "#ff5500" }}>Focus · Market Intelligence</span>
          </div>
        </div>
        <div className="border-b-2" style={{ borderColor: "#ff5500", background: "rgba(255,85,0,0.06)" }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              PollCast: l'intelligenza collettiva che prevede i trend di mercato.
            </h2>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <FadeUp>
              <p className="text-sm font-medium mb-4" style={{ color: "#ff5500" }}>
                La piattaforma gratuita che trasforma le previsioni della community in strumento di market intelligence per le aziende.
              </p>
              <div className="space-y-4 text-white/70 leading-relaxed mb-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <p>
                  E se le previsioni di mercato non fossero più un'esclusiva per pochi analisti?{" "}
                  <strong className="text-white">PollCast</strong> ha lanciato una piattaforma gratuita dove
                  chiunque può creare e votare previsioni su qualsiasi tema — business, tech, sport, politica
                  o trend di mercato. I risultati aggregati, su migliaia di voti, tendono a essere
                  sorprendentemente accurati.
                </p>
                <p>
                  Per le aziende, l'applicazione più interessante è la market intelligence: monitorare le
                  previsioni della community su temi rilevanti offre un termometro in tempo reale del sentiment
                  del mercato. Un vantaggio informativo che fino a ieri richiedeva costose ricerche.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <StatBlock value="2.974" label="Voti totali" color="#ff5500" />
                <StatBlock value="10" label="Previsioni attive" color="#ff5500" />
              </div>

              <div className="flex flex-wrap gap-3 mt-4">
                <a href="https://pollcast.online" target="_blank" rel="noopener noreferrer"
                  className="px-5 py-3 rounded-lg text-sm font-bold transition-all hover:scale-105"
                  style={{ background: "#ff5500", color: "#fff", fontFamily: "'Space Grotesk', sans-serif" }}>
                  Vota le previsioni →
                </a>
                <a href="https://pollcast.online" target="_blank" rel="noopener noreferrer"
                  className="px-5 py-3 rounded-lg text-sm font-semibold border border-white/15 text-white/70 hover:text-white hover:border-white/30 transition-all">
                  Crea una previsione →
                </a>
              </div>
            </FadeUp>

            <FadeUp delay={0.15}>
              <div className="rounded-2xl overflow-hidden border border-white/8 article-card mb-6">
                <img src={POLLCAST_IMG} alt="PollCast" className="w-full h-48 object-cover" loading="lazy" />
              </div>

              <p className="editorial-tag text-white/30 mb-4">◆ Previsioni di tendenza</p>
              <div className="space-y-3">
                <PollBar label="Bitcoin supererà i $200,000 entro il 2026?" category="Crypto" percentage={61} votes={511} color="#ff5500" />
                <PollBar label="ChatGPT-5 sarà rilasciato entro giugno 2026?" category="Tecnologia" percentage={75} votes={370} color="#ff5500" />
                <PollBar label="Tesla raggiungerà i $500 per azione entro fine 2026?" category="Economia" percentage={57} votes={412} color="#ff5500" />
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── FOOLFARM BANNER ─────────────────────────────────────────────────── */}
      <section className="border-t border-white/8" style={{ background: "linear-gradient(135deg, #060a14, #0a0f1e)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <FadeUp>
            <p className="editorial-tag text-white/30 mb-4">◆ Da dove nasce l'innovazione</p>
            <h2 className="text-3xl font-black text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              FoolFarm AI Innovation Studios
            </h2>
            <p className="text-base text-white/50 max-w-2xl mx-auto mb-8 leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              IDEASMART è un progetto editoriale indipendente nato all'interno di{" "}
              <strong className="text-white">FoolFarm</strong>, il primo startup studio AI-native italiano.
              La nostra missione è dare voce all'ecosistema, con analisi imparziali e approfondite.
            </p>
            <a
              href="https://foolfarm.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all hover:scale-105"
              style={{ background: "#00e5c8", color: "#0a0f1e", fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Scopri FoolFarm →
            </a>
          </FadeUp>
        </div>
      </section>

      {/* ── NEWSLETTER SIGNUP ───────────────────────────────────────────────── */}
      <section id="newsletter" className="border-t border-white/8" style={{ background: "#0d1220" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <FadeUp>
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-white/10" style={{ background: "rgba(0,229,200,0.06)" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#00e5c8" }} />
              <span className="editorial-tag" style={{ color: "#00e5c8" }}>Newsletter Mensile</span>
            </div>
            <h2 className="text-4xl font-black text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Ricevi l'analisi mensile
              <br />
              <span style={{ color: "#00e5c8" }}>direttamente nella tua inbox.</span>
            </h2>
            <p className="text-base text-white/50 mb-10 leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Ogni mese selezioniamo le 4 startup AI più promettenti per il business italiano.
              Analisi approfondite, dati reali, nessuno spam.
            </p>

            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="La tua email aziendale"
                  required
                  className="flex-1 px-4 py-3 rounded-lg text-sm border border-white/15 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-[#00e5c8] transition-colors"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-lg text-sm font-bold transition-all hover:scale-105 whitespace-nowrap"
                  style={{ background: "#00e5c8", color: "#0a0f1e", fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Abbonati gratis →
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-3 p-4 rounded-xl border border-white/10" style={{ background: "rgba(0,229,200,0.06)" }}>
                <span style={{ color: "#00e5c8" }}>✓</span>
                <p className="text-white/80 text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Perfetto! Ti invieremo la prossima analisi mensile.
                </p>
              </div>
            )}

            <p className="text-xs text-white/25 mt-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Gratuita · Mensile · Nessuno spam · Disiscrizione in un click
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/8" style={{ background: "#060a14" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="text-2xl font-black mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                IDEA<span style={{ color: "#00e5c8" }}>SMART</span>
              </div>
              <p className="editorial-tag text-white/25 mb-4">Startup di Tecnologia &amp; Innovazione</p>
              <p className="text-sm text-white/40 leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                L'Osservatorio sull'Innovazione AI Italiana. Ogni mese analizziamo le startup AI
                più promettenti per il business.
              </p>
            </div>

            {/* Startup analizzate */}
            <div>
              <p className="editorial-tag text-white/30 mb-4">Startup analizzate</p>
              <div className="space-y-2">
                {[
                  { name: "FoolTalent", url: "https://fooltalent.com" },
                  { name: "FoolShare", url: "https://foolshare.xyz" },
                  { name: "Fragmentalis", url: "https://fragmentalis.com" },
                  { name: "PollCast", url: "https://pollcast.online" },
                ].map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-white/50 hover:text-white transition-colors"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {s.name} →
                  </a>
                ))}
              </div>
            </div>

            {/* Powered by */}
            <div>
              <p className="editorial-tag text-white/30 mb-4">Powered by</p>
              <a
                href="https://foolfarm.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-white/50 hover:text-white transition-colors mb-2"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                FoolFarm AI Innovation Studios →
              </a>
              <p className="text-xs text-white/25" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Il primo startup studio AI-native italiano.
              </p>
            </div>
          </div>

          <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/25" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              © 2026 IDEASMART — Startup di Tecnologia &amp; Innovazione. Tutti i diritti riservati.
            </p>
            <p className="editorial-tag text-white/20">
              AI for Business · N° 03 · Marzo 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
