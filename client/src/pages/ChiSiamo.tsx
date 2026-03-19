/*
 * IDEASMART — Chi Siamo
 * La storia di IdeaSmart: da bulletin board interna a prima testata giornalistica 100% agente
 * Design: editoriale, coerente con la Home (navy #0a0f1e + cyan #00b4a0 + arancio #ff5500)
 */
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "wouter";

// ─── Animation helper ─────────────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Timeline data ─────────────────────────────────────────────────────────────
const TIMELINE = [
  {
    year: "2023",
    label: "La scintilla",
    text: "Tutto nasce da una chat interna tra nerd appassionati di AI sparsi per il mondo. Adrian Lenice lancia una semplice bulletin board per condividere segnalazioni su startup e intelligenza artificiale. Nessun piano editoriale, nessun budget: solo curiosità e codice.",
    color: "#00b4a0",
  },
  {
    year: "2024 Q1",
    label: "Il primo agente",
    text: "Il primo agente automatizzato entra in produzione: raccoglie notizie da 40 fonti, le riassume e le pubblica senza intervento umano. Il risultato è grezzo ma funziona. Il team capisce di avere qualcosa di unico tra le mani.",
    color: "#ff5500",
  },
  {
    year: "2024 Q3",
    label: "La redazione si forma",
    text: "Il sistema si espande: arrivano gli agenti Editor, Analyst e Social. Ogni agente ha un ruolo preciso nella pipeline editoriale. Per la prima volta, un articolo completo — dalla fonte alla pubblicazione — viene prodotto in meno di 4 minuti senza toccare una tastiera.",
    color: "#7c3aed",
  },
  {
    year: "2024 Q4",
    label: "Il manifesto",
    text: "IdeaSmart pubblica il suo manifesto: informazione senza bias, senza agenda, senza mediazioni umane. La testata si registra al ROC e diventa ufficialmente la prima testata giornalistica 100% HumanLess d'Italia. La notizia rimbalza su LinkedIn e porta i primi 1.000 lettori.",
    color: "#e84f00",
  },
  {
    year: "2025",
    label: "La crescita",
    text: "La piattaforma scala a 14 canali tematici, oltre 20 agenti in produzione simultanea, 7.000+ utenti unici al giorno e una newsletter con 500+ iscritti. Il sistema agentico proprietario gestisce l'intero flusso editoriale end-to-end: scraping, verifica, scrittura, SEO, social e newsletter.",
    color: "#16a34a",
  },
  {
    year: "2026",
    label: "IdeaSmart Business",
    text: "Nasce IdeaSmart Business: la piattaforma che permette a giornalisti, editori e creator di replicare il modello IdeaSmart e lanciare la propria testata agente. Il sogno di Adrian diventa un prodotto scalabile, disponibile per chiunque voglia ridefinire il giornalismo nell'era dell'AI.",
    color: "#ff5500",
  },
];

// ─── Agent cards ──────────────────────────────────────────────────────────────
const AGENTS = [
  { name: "Scout", role: "Raccoglie notizie da 200+ fonti", icon: "🔍", color: "#00b4a0" },
  { name: "Verifier", role: "Verifica fatti e cross-referencing", icon: "✅", color: "#16a34a" },
  { name: "Writer", role: "Redige articoli originali", icon: "✍️", color: "#7c3aed" },
  { name: "Editor", role: "Corregge, ottimizza, titola", icon: "📝", color: "#e84f00" },
  { name: "Analyst", role: "Produce analisi e commenti", icon: "📊", color: "#0891b2" },
  { name: "Publisher", role: "Pubblica su tutti i canali", icon: "🚀", color: "#ff5500" },
  { name: "Social", role: "Gestisce LinkedIn e social", icon: "📣", color: "#db2777" },
  { name: "Newsletter", role: "Compone e invia la newsletter", icon: "📧", color: "#b45309" },
];

// ─── Stats ────────────────────────────────────────────────────────────────────
const STATS = [
  { value: "20+", label: "Agenti AI in produzione" },
  { value: "14", label: "Canali tematici" },
  { value: "7.000+", label: "Utenti unici al giorno" },
  { value: "500+", label: "Iscritti newsletter" },
  { value: "200+", label: "Notizie prodotte ogni giorno" },
  { value: "0", label: "Redattori umani" },
];

export default function ChiSiamo() {
  return (
    <div className="min-h-screen bg-[#faf9f6]" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── HERO ── */}
      <section className="relative bg-[#0a0f1e] overflow-hidden">
        {/* Grid decorativa */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "linear-gradient(#00b4a0 1px, transparent 1px), linear-gradient(90deg, #00b4a0 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-32 text-center">
          <FadeUp>
            <p className="text-xs font-mono tracking-[0.3em] uppercase text-[#00b4a0] mb-6">
              La nostra storia
            </p>
            <h1
              className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Nati per caso.<br />
              <span style={{ color: "#ff5500" }}>Rimasti per scelta.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
              IdeaSmart è la prima testata giornalistica completamente autonoma, powered by AI.
              Un progetto nato da una chat tra nerd appassionati, oggi con un manifesto forte:
              ridefinire il giornalismo nell'era dell'intelligenza artificiale.
            </p>
          </FadeUp>

          {/* Divider */}
          <FadeUp delay={0.2}>
            <div className="flex items-center justify-center gap-4 mt-12">
              <div className="h-px w-16 bg-white/10" />
              <span className="text-xs font-mono text-white/30 tracking-widest">TESTATA 100% HUMANLESS</span>
              <div className="h-px w-16 bg-white/10" />
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {STATS.map((s, i) => (
              <FadeUp key={s.label} delay={i * 0.05}>
                <div className="text-center">
                  <div
                    className="text-3xl font-black mb-1"
                    style={{ color: "#0a0f1e", fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {s.value}
                  </div>
                  <div className="text-xs text-[#6b7280] leading-tight">{s.label}</div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── MANIFESTO ── */}
      <section className="py-16 md:py-24 bg-[#faf9f6]">
        <div className="max-w-3xl mx-auto px-4">
          <FadeUp>
            <p className="text-xs font-mono tracking-[0.3em] uppercase text-[#ff5500] mb-4">Il manifesto</p>
            <h2
              className="text-3xl md:text-4xl font-black text-[#0a0f1e] mb-8 leading-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Informazione senza bias,<br />senza agenda, senza mediazioni.
            </h2>
          </FadeUp>
          <FadeUp delay={0.1}>
            <div className="space-y-5 text-[#374151] leading-relaxed text-lg">
              <p>
                IdeaSmart nasce attorno a un'idea radicale: <strong>il giornalismo può essere oggettivo se chi lo produce non ha interessi da difendere</strong>. Un sistema agentico non ha carriere da proteggere, inserzionisti da compiacere o linee editoriali da rispettare. Produce informazione perché è programmato per farlo bene.
              </p>
              <p>
                Il sistema agentico proprietario replica una redazione end-to-end, con algoritmi di verifica che puntano a un'informazione oggettiva, scalabile e senza bias. Dalla raccolta delle notizie fino alla pubblicazione, ogni passaggio è automatizzato, tracciabile e migliorabile.
              </p>
              <p>
                Non è un esperimento. È un prodotto in produzione, ogni giorno, da oltre due anni. <strong>IdeaSmart è la prova che il giornalismo del futuro è già qui.</strong>
              </p>
            </div>
          </FadeUp>

          {/* Pull quote */}
          <FadeUp delay={0.2}>
            <blockquote className="mt-10 border-l-4 border-[#ff5500] pl-6 py-2">
              <p className="text-xl font-semibold text-[#0a0f1e] italic leading-relaxed">
                "Abbiamo costruito una redazione che non dorme mai, non si ammala, non ha pregiudizi e non chiede aumenti. L'unica cosa che chiede è un buon prompt."
              </p>
              <footer className="mt-3 text-sm text-[#6b7280]">
                — <strong>Adrian Lenice</strong>, Founder & Direttore Responsabile, IdeaSmart
              </footer>
            </blockquote>
          </FadeUp>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <FadeUp>
            <p className="text-xs font-mono tracking-[0.3em] uppercase text-[#00b4a0] mb-4">La storia</p>
            <h2
              className="text-3xl md:text-4xl font-black text-[#0a0f1e] mb-12 leading-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Da bulletin board<br />a testata nazionale.
            </h2>
          </FadeUp>

          <div className="relative">
            {/* Linea verticale */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200" />

            <div className="space-y-10">
              {TIMELINE.map((item, i) => (
                <FadeUp key={item.year} delay={i * 0.08}>
                  <div className="flex gap-6">
                    {/* Dot */}
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-xs z-10 relative"
                        style={{ background: item.color, fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {item.year.split(" ")[0].slice(2)}
                      </div>
                    </div>
                    {/* Content */}
                    <div className="pb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-xs font-mono tracking-widest uppercase"
                          style={{ color: item.color }}
                        >
                          {item.year}
                        </span>
                      </div>
                      <h3
                        className="text-lg font-black text-[#0a0f1e] mb-2"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {item.label}
                      </h3>
                      <p className="text-[#4b5563] leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── LA REDAZIONE ── */}
      <section className="py-16 md:py-24 bg-[#0a0f1e]">
        <div className="max-w-5xl mx-auto px-4">
          <FadeUp>
            <div className="text-center mb-12">
              <p className="text-xs font-mono tracking-[0.3em] uppercase text-[#00b4a0] mb-4">La redazione</p>
              <h2
                className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                20+ agenti al lavoro.<br />
                <span style={{ color: "#ff5500" }}>Ogni giorno, senza sosta.</span>
              </h2>
              <p className="text-white/50 max-w-xl mx-auto">
                Ogni agente ha un ruolo preciso nella pipeline editoriale. Lavorano in parallelo, si passano il lavoro, si correggono a vicenda. Come una vera redazione — ma senza pause caffè.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {AGENTS.map((agent, i) => (
              <FadeUp key={agent.name} delay={i * 0.06}>
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/8 transition-colors">
                  <div className="text-2xl mb-3">{agent.icon}</div>
                  <div
                    className="text-sm font-black mb-1"
                    style={{ color: agent.color, fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {agent.name}
                  </div>
                  <div className="text-xs text-white/40 leading-snug">{agent.role}</div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOUNDER ── */}
      <section className="py-16 md:py-24 bg-[#faf9f6]">
        <div className="max-w-3xl mx-auto px-4">
          <FadeUp>
            <p className="text-xs font-mono tracking-[0.3em] uppercase text-[#ff5500] mb-4">Il fondatore</p>
            <h2
              className="text-3xl md:text-4xl font-black text-[#0a0f1e] mb-8 leading-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Adrian Lenice
            </h2>
          </FadeUp>
          <FadeUp delay={0.1}>
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white"
                  style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #1a2a4a 100%)" }}
                >
                  AL
                </div>
              </div>
              <div className="space-y-4 text-[#374151] leading-relaxed">
                <p>
                  Adrian Lenice è il fondatore e Direttore Responsabile di IdeaSmart. Imprenditore seriale, appassionato di intelligenza artificiale e sistemi agentici, ha costruito IdeaSmart partendo da zero — senza investitori, senza redazione, senza ufficio.
                </p>
                <p>
                  La sua visione è semplice e radicale: <strong>il giornalismo del futuro non ha bisogno di giornalisti umani per produrre informazione di qualità</strong>. Ha bisogno di architetture intelligenti, algoritmi di verifica robusti e un sistema che scala senza perdere coerenza.
                </p>
                <p>
                  Oggi guida un team distribuito di sviluppatori e ricercatori AI che continuano a far evolvere la piattaforma, con l'obiettivo di portare il modello IdeaSmart a chiunque voglia costruire la propria testata agente.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <a
                    href="https://www.linkedin.com/in/adrianlenice"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all hover:scale-105"
                    style={{ color: "#0a66c2", borderColor: "#0a66c220", background: "#f0f7ff" }}
                  >
                    LinkedIn →
                  </a>
                  <a
                    href="https://ideasmart.ai/manifesto"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all hover:scale-105"
                    style={{ color: "#ff5500", borderColor: "#ff550020", background: "#fff4f0" }}
                  >
                    Leggi il Manifesto →
                  </a>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 md:py-20 bg-[#0a0f1e]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <FadeUp>
            <h2
              className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Vuoi replicare il modello?
            </h2>
            <p className="text-white/50 mb-8 leading-relaxed">
              Con IdeaSmart Business puoi lanciare la tua testata agente in poche settimane. Scopri i piani e prenota una call gratuita.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/business"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-base font-bold text-white transition-all hover:opacity-90"
                style={{ background: "#ff5500" }}
              >
                🚀 IdeaSmart Business →
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-base font-semibold border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all"
              >
                Torna alla testata →
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0a0f1e] border-t border-white/5 py-6">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <span className="font-black text-white text-base" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            IDEA<span style={{ color: "#00b4a0" }}>SMART</span>
          </span>
          <div className="flex items-center gap-5 text-xs text-white/30">
            <Link href="/manifesto"><span className="hover:text-white/60 transition-colors cursor-pointer">Manifesto</span></Link>
            <Link href="/business"><span className="hover:text-white/60 transition-colors cursor-pointer">Business</span></Link>
            <Link href="/privacy"><span className="hover:text-white/60 transition-colors cursor-pointer">Privacy</span></Link>
            <a href="mailto:info@ideasmart.ai" className="hover:text-white/60 transition-colors">info@ideasmart.ai</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
