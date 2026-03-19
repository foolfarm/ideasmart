/**
 * IDEASMART — Pagina Tecnologia
 * Design: Editoriale carta bianca (#faf8f3), Playfair Display, Source Serif 4, Space Mono
 * Contenuto: Storytelling su IdeaSmart come piattaforma agentica e Verify come algoritmo proprietario
 */
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";

// ─── Animation helper ─────────────────────────────────────────────────────────
function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
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

// ─── Agenti della redazione ────────────────────────────────────────────────────
const AGENTS = [
  {
    name: "Scouting Agent",
    icon: "◎",
    desc: "Intercetta le notizie dalla rete globale in tempo reale, monitorando oltre 450 fonti RSS e feed specializzati.",
    color: "#1a3a5c",
  },
  {
    name: "Verify Agent",
    icon: "⬡",
    desc: "Analizza e valida ogni contenuto su sei dimensioni di qualità informativa. Il cuore del sistema.",
    color: "#0a3d2e",
  },
  {
    name: "Balancing Agent",
    icon: "⊖",
    desc: "Riequilibra bias e distorsioni narrative, garantendo pluralità di prospettive su ogni argomento.",
    color: "#3a1a5c",
  },
  {
    name: "Synthesis Agent",
    icon: "◈",
    desc: "Costruisce articoli chiari, leggibili e informativamente densi a partire dai contenuti validati.",
    color: "#5c1a1a",
  },
  {
    name: "Publishing Agent",
    icon: "▷",
    desc: "Distribuisce i contenuti in tempo reale su tutti i canali editoriali, con metadati e categorizzazione automatica.",
    color: "#1a4a1a",
  },
];

// ─── Dimensioni Verify ────────────────────────────────────────────────────────
const VERIFY_DIMS = [
  { label: "Attendibilità della fonte", desc: "Storico editoriale, autorevolezza, track record di accuratezza" },
  { label: "Coerenza tra fonti multiple", desc: "Cross-validazione su almeno tre fonti indipendenti" },
  { label: "Neutralità del linguaggio", desc: "Analisi semantica per rilevare carica emotiva e framing" },
  { label: "Bilanciamento delle prospettive", desc: "Presenza di punti di vista contrapposti sullo stesso fatto" },
  { label: "Livello di distorsione narrativa", desc: "Rilevamento di omissioni, enfasi selettive e agenda implicita" },
  { label: "Presenza di agenda implicita", desc: "Identificazione di interessi economici o politici sottostanti" },
];

// ─── Steps del processo ───────────────────────────────────────────────────────
const PROCESS_STEPS = [
  { n: "01", title: "Raccolta massiva", desc: "Migliaia di fonti analizzate in tempo reale da 14 verticali tematici" },
  { n: "02", title: "Validazione algoritmica", desc: "Verify confronta, incrocia e pesa ogni contenuto su sei dimensioni" },
  { n: "03", title: "Riduzione del rumore", desc: "Eliminazione automatica di contenuti distorti o sotto soglia qualitativa" },
  { n: "04", title: "Sintesi intelligente", desc: "Generazione di articoli chiari, oggettivi e informativamente densi" },
  { n: "05", title: "Distribuzione", desc: "Informazione filtrata, categorizzata e pronta per ogni canale editoriale" },
];

export default function Tecnologia() {
  return (
    <div style={{ background: "#faf8f3", minHeight: "100vh", fontFamily: "'Source Serif 4', Georgia, serif" }}>
      <Navbar />

      {/* ─── HERO ──────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "#0d1b2a", paddingTop: "96px", paddingBottom: "80px" }}
      >
        {/* Griglia decorativa */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,229,200,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,200,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-6">
          <FadeUp>
            <p
              className="text-xs font-mono tracking-[0.25em] uppercase mb-6"
              style={{ color: "#00e5c8", fontFamily: "'Space Mono', monospace" }}
            >
              Tecnologia — IdeaSmart
            </p>
            <h1
              className="text-4xl md:text-6xl font-bold leading-tight mb-8"
              style={{ color: "#f5f2ec", fontFamily: "'Playfair Display', Georgia, serif", maxWidth: "780px" }}
            >
              L'informazione non è più un'opinione.
              <span style={{ color: "#00e5c8" }}> È un calcolo.</span>
            </h1>
            <p
              className="text-lg md:text-xl leading-relaxed mb-10"
              style={{ color: "#94a3b8", maxWidth: "640px", fontFamily: "'Source Serif 4', Georgia, serif" }}
            >
              IdeaSmart è la prima piattaforma editoriale agentica che trasforma il caos delle notizie
              in informazione verificata, pesata e oggettiva. Grazie a{" "}
              <strong style={{ color: "#00e5c8" }}>Verify</strong>, il nostro algoritmo proprietario,
              ogni contenuto viene analizzato, validato e bilanciato prima di essere pubblicato.
            </p>
            <div className="flex flex-wrap gap-4">
              {["Nessun bias", "Nessuna agenda", "Solo informazione qualificata"].map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 rounded-full text-sm font-mono font-semibold"
                  style={{
                    background: "rgba(0,229,200,0.1)",
                    color: "#00e5c8",
                    border: "1px solid rgba(0,229,200,0.25)",
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  ✓ {tag}
                </span>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ─── IL PROBLEMA ─────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <FadeUp>
            <p
              className="text-xs font-mono tracking-[0.2em] uppercase mb-4"
              style={{ color: "#9ca3af", fontFamily: "'Space Mono', monospace" }}
            >
              Il problema
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold leading-tight mb-6"
              style={{ color: "#1a1f2e", fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Oggi l'informazione è rotta.
            </h2>
            <p className="text-base leading-relaxed mb-6" style={{ color: "#4b5563" }}>
              Polarizzata, manipolata, rumorosa, inefficiente. Il risultato è che non sai più cosa è
              vero, cosa è rilevante, a chi credere. La sovrabbondanza di contenuti non ha prodotto
              più chiarezza: ha prodotto più confusione.
            </p>
            <p className="text-base leading-relaxed" style={{ color: "#4b5563" }}>
              IdeaSmart elimina il problema alla radice: non scegliamo una narrativa.{" "}
              <strong style={{ color: "#1a1f2e" }}>Costruiamo un sistema che le neutralizza tutte.</strong>
            </p>
          </FadeUp>
          <FadeUp delay={0.15}>
            <div
              className="rounded-2xl p-8"
              style={{ background: "#fff", border: "1px solid #e5e7eb" }}
            >
              {[
                { label: "Fonti polarizzate", value: "94%", sub: "dei media online mostra bias rilevabile" },
                { label: "Contenuti duplicati", value: "67%", sub: "delle notizie sono rielaborazioni della stessa fonte" },
                { label: "Agenda implicita", value: "3 su 5", sub: "articoli contengono framing orientato" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="py-5 border-b last:border-0"
                  style={{ borderColor: "#f3f4f6" }}
                >
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-sm font-semibold" style={{ color: "#374151" }}>
                      {stat.label}
                    </span>
                    <span
                      className="text-2xl font-bold"
                      style={{ color: "#0d1b2a", fontFamily: "'Playfair Display', serif" }}
                    >
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: "#9ca3af" }}>
                    {stat.sub}
                  </p>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ─── REDAZIONE AGENTICA ──────────────────────────────────────────────── */}
      <section style={{ background: "#f5f2ec", padding: "80px 0" }}>
        <div className="max-w-5xl mx-auto px-6">
          <FadeUp>
            <div className="text-center mb-14">
              <p
                className="text-xs font-mono tracking-[0.2em] uppercase mb-4"
                style={{ color: "#9ca3af", fontFamily: "'Space Mono', monospace" }}
              >
                Architettura
              </p>
              <h2
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ color: "#1a1f2e", fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Una redazione completamente agentica
              </h2>
              <p
                className="text-base leading-relaxed mx-auto"
                style={{ color: "#4b5563", maxWidth: "560px" }}
              >
                IdeaSmart non è una redazione tradizionale. È un sistema autonomo composto da agenti AI
                specializzati che replicano — e migliorano — il lavoro di una newsroom.
              </p>
            </div>
          </FadeUp>
          <div className="grid md:grid-cols-5 gap-4">
            {AGENTS.map((agent, i) => (
              <FadeUp key={agent.name} delay={i * 0.08}>
                <div
                  className="rounded-xl p-5 h-full flex flex-col"
                  style={{ background: "#fff", border: "1px solid #e5e7eb" }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-4 font-mono"
                    style={{ background: agent.color, color: "#fff" }}
                  >
                    {agent.icon}
                  </div>
                  <p
                    className="text-sm font-bold mb-2"
                    style={{ color: "#1a1f2e", fontFamily: "'Space Mono', monospace" }}
                  >
                    {agent.name}
                  </p>
                  <p className="text-xs leading-relaxed flex-1" style={{ color: "#6b7280" }}>
                    {agent.desc}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
          <FadeUp delay={0.4}>
            <p
              className="text-center text-sm italic mt-10"
              style={{ color: "#9ca3af", fontFamily: "'Source Serif 4', serif" }}
            >
              Tutto senza intervento umano diretto — non perché l'uomo non serva, ma perché vogliamo
              eliminare i suoi bias.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ─── VERIFY ──────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <FadeUp>
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-mono text-lg font-bold"
              style={{ background: "#0a3d2e", color: "#00e5c8" }}
            >
              ⬡
            </div>
            <p
              className="text-xs font-mono tracking-[0.2em] uppercase"
              style={{ color: "#9ca3af", fontFamily: "'Space Mono', monospace" }}
            >
              Verify — Algoritmo proprietario
            </p>
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold leading-tight mb-6"
            style={{ color: "#1a1f2e", fontFamily: "'Playfair Display', Georgia, serif", maxWidth: "640px" }}
          >
            Non verifichiamo le notizie.
            <br />
            <span style={{ color: "#00b89a" }}>Le pesiamo.</span>
          </h2>
          <p
            className="text-base leading-relaxed mb-12"
            style={{ color: "#4b5563", maxWidth: "600px" }}
          >
            Verify è l'algoritmo proprietario che rappresenta il vero vantaggio competitivo di
            IdeaSmart. Ogni notizia viene valutata su sei dimensioni distinte, ricevendo un{" "}
            <strong style={{ color: "#1a1f2e" }}>punteggio dinamico di qualità informativa</strong>.
            Solo i contenuti che superano la soglia entrano nel flusso editoriale.
          </p>
        </FadeUp>
        <div className="grid md:grid-cols-2 gap-4">
          {VERIFY_DIMS.map((dim, i) => (
            <FadeUp key={dim.label} delay={i * 0.07}>
              <div
                className="rounded-xl p-5 flex gap-4"
                style={{ background: "#fff", border: "1px solid #e5e7eb" }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-mono font-bold mt-0.5"
                  style={{ background: "#e6faf8", color: "#00b89a" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <p className="text-sm font-bold mb-1" style={{ color: "#1a1f2e" }}>
                    {dim.label}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "#6b7280" }}>
                    {dim.desc}
                  </p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ─── COME FUNZIONA ───────────────────────────────────────────────────── */}
      <section style={{ background: "#0d1b2a", padding: "80px 0" }}>
        <div className="max-w-5xl mx-auto px-6">
          <FadeUp>
            <div className="text-center mb-14">
              <p
                className="text-xs font-mono tracking-[0.2em] uppercase mb-4"
                style={{ color: "#00e5c8", fontFamily: "'Space Mono', monospace" }}
              >
                Il processo
              </p>
              <h2
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ color: "#f5f2ec", fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Come funziona IdeaSmart
              </h2>
            </div>
          </FadeUp>
          <div className="relative">
            {/* Linea verticale */}
            <div
              className="absolute left-[19px] top-0 bottom-0 w-px hidden md:block"
              style={{ background: "rgba(0,229,200,0.15)" }}
            />
            <div className="space-y-6">
              {PROCESS_STEPS.map((step, i) => (
                <FadeUp key={step.n} delay={i * 0.1}>
                  <div className="flex gap-6 items-start">
                    <div
                      className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-mono font-bold z-10"
                      style={{ background: "#0d1b2a", border: "2px solid #00e5c8", color: "#00e5c8" }}
                    >
                      {step.n}
                    </div>
                    <div
                      className="flex-1 rounded-xl p-5"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      <p
                        className="text-base font-bold mb-1"
                        style={{ color: "#f5f2ec", fontFamily: "'Playfair Display', serif" }}
                      >
                        {step.title}
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── APPROCCIO: DALL'OPINIONE AL DATO ───────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <FadeUp>
            <p
              className="text-xs font-mono tracking-[0.2em] uppercase mb-4"
              style={{ color: "#9ca3af", fontFamily: "'Space Mono', monospace" }}
            >
              Il nostro approccio
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold leading-tight mb-6"
              style={{ color: "#1a1f2e", fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Dall'opinione al dato
            </h2>
            <p className="text-base leading-relaxed mb-6" style={{ color: "#4b5563" }}>
              La differenza tra IdeaSmart e il giornalismo tradizionale è semplice: loro interpretano,
              noi misuriamo. L'informazione non è più soggettiva. Diventa un output calcolato.
            </p>
            <div
              className="rounded-xl p-6"
              style={{ background: "#f5f2ec", border: "1px solid #e5e7eb" }}
            >
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Giornalismo tradizionale", items: ["Interpreta", "Seleziona", "Opina", "Agenda"] },
                  { label: "IdeaSmart", items: ["Misura", "Valida", "Calcola", "Algoritmo"] },
                ].map((col) => (
                  <div key={col.label}>
                    <p
                      className="text-xs font-mono font-bold mb-3 uppercase tracking-widest"
                      style={{ color: col.label === "IdeaSmart" ? "#00b89a" : "#9ca3af" }}
                    >
                      {col.label}
                    </p>
                    <ul className="space-y-2">
                      {col.items.map((item) => (
                        <li
                          key={item}
                          className="text-sm font-semibold"
                          style={{ color: col.label === "IdeaSmart" ? "#1a1f2e" : "#9ca3af" }}
                        >
                          {col.label === "IdeaSmart" ? "✓ " : "× "}
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
          <FadeUp delay={0.15}>
            <p
              className="text-xs font-mono tracking-[0.2em] uppercase mb-4"
              style={{ color: "#9ca3af", fontFamily: "'Space Mono', monospace" }}
            >
              Zero bias. Davvero.
            </p>
            <h3
              className="text-2xl font-bold mb-6"
              style={{ color: "#1a1f2e", fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Neutralità costruita a livello architetturale
            </h3>
            <p className="text-base leading-relaxed mb-8" style={{ color: "#4b5563" }}>
              Non promettiamo neutralità. La costruiamo nel codice. IdeaSmart è progettata per essere
              strutturalmente immune ai bias editoriali.
            </p>
            <div className="space-y-4">
              {[
                {
                  tag: "Humanless",
                  desc: "Nessuna interferenza editoriale umana nel flusso di pubblicazione",
                  color: "#1a3a5c",
                },
                {
                  tag: "Agenda-free",
                  desc: "Nessun interesse politico o economico che orienta la selezione",
                  color: "#0a3d2e",
                },
                {
                  tag: "Self-auditing",
                  desc: "Ogni contenuto è verificato dal sistema stesso prima e dopo la pubblicazione",
                  color: "#3a1a5c",
                },
              ].map((item) => (
                <div
                  key={item.tag}
                  className="flex gap-4 rounded-xl p-4"
                  style={{ background: "#fff", border: "1px solid #e5e7eb" }}
                >
                  <span
                    className="px-2 py-1 rounded text-xs font-mono font-bold flex-shrink-0 h-fit"
                    style={{ background: item.color, color: "#fff" }}
                  >
                    {item.tag}
                  </span>
                  <p className="text-sm leading-relaxed" style={{ color: "#4b5563" }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ─── VISION ──────────────────────────────────────────────────────────── */}
      <section style={{ background: "#f5f2ec", padding: "80px 0" }}>
        <div className="max-w-5xl mx-auto px-6">
          <FadeUp>
            <div className="text-center mb-12">
              <p
                className="text-xs font-mono tracking-[0.2em] uppercase mb-4"
                style={{ color: "#9ca3af", fontFamily: "'Space Mono', monospace" }}
              >
                Vision
              </p>
              <h2
                className="text-3xl md:text-4xl font-bold mb-6"
                style={{ color: "#1a1f2e", fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Costruire il primo layer di verità algoritmica globale
              </h2>
              <p
                className="text-base leading-relaxed mx-auto mb-10"
                style={{ color: "#4b5563", maxWidth: "580px" }}
              >
                Vogliamo diventare l'infrastruttura di riferimento per l'informazione verificata.
                Non una testata. Un nuovo standard.
              </p>
            </div>
          </FadeUp>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
            {[
              { label: "Per gli utenti", desc: "Informazione affidabile senza dover filtrare il rumore" },
              { label: "Per le aziende", desc: "Intelligence di mercato verificata e debiasata" },
              { label: "Per le piattaforme", desc: "Layer di validazione contenuti integrabile via API" },
              { label: "Per i sistemi AI", desc: "Dataset di training puliti e verificati algoritmicamente" },
            ].map((item, i) => (
              <FadeUp key={item.label} delay={i * 0.08}>
                <div
                  className="rounded-xl p-5 h-full"
                  style={{ background: "#fff", border: "1px solid #e5e7eb" }}
                >
                  <p
                    className="text-sm font-bold mb-2"
                    style={{ color: "#1a1f2e", fontFamily: "'Space Mono', monospace", fontSize: "11px" }}
                  >
                    {item.label}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "#6b7280" }}>
                    {item.desc}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>

          {/* Posizionamento */}
          <FadeUp delay={0.3}>
            <div
              className="rounded-2xl p-8 md:p-12 text-center"
              style={{ background: "#0d1b2a" }}
            >
              <p
                className="text-xs font-mono tracking-[0.2em] uppercase mb-6"
                style={{ color: "#00e5c8", fontFamily: "'Space Mono', monospace" }}
              >
                Posizionamento
              </p>
              <h3
                className="text-2xl md:text-3xl font-bold mb-8"
                style={{ color: "#f5f2ec", fontFamily: "'Playfair Display', serif" }}
              >
                IdeaSmart non è:
              </h3>
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {["un giornale", "un blog", "un aggregatore"].map((item) => (
                  <span
                    key={item}
                    className="px-4 py-2 rounded-full text-sm font-mono"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      color: "#94a3b8",
                      border: "1px solid rgba(255,255,255,0.1)",
                      textDecoration: "line-through",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
              <h3
                className="text-2xl md:text-3xl font-bold mb-8"
                style={{ color: "#f5f2ec", fontFamily: "'Playfair Display', serif" }}
              >
                È:
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  "un sistema di validazione dell'informazione",
                  "un motore di verità computazionale",
                  "una newsroom autonoma",
                ].map((item) => (
                  <span
                    key={item}
                    className="px-4 py-2 rounded-full text-sm font-mono font-semibold"
                    style={{
                      background: "rgba(0,229,200,0.1)",
                      color: "#00e5c8",
                      border: "1px solid rgba(0,229,200,0.3)",
                    }}
                  >
                    ✓ {item}
                  </span>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <FadeUp>
          <div className="text-center">
            <p
              className="text-xs font-mono tracking-[0.2em] uppercase mb-4"
              style={{ color: "#9ca3af", fontFamily: "'Space Mono', monospace" }}
            >
              Scopri IdeaSmart
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold mb-6"
              style={{ color: "#1a1f2e", fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Vuoi capire come funziona davvero l'informazione senza filtri?
            </h2>
            <p
              className="text-base leading-relaxed mb-10 mx-auto"
              style={{ color: "#4b5563", maxWidth: "520px" }}
            >
              Esplora i 14 canali editoriali di IdeaSmart, iscriviti alla newsletter settimanale
              o scopri come collaborare con noi.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-base font-bold transition-all hover:scale-105"
                style={{
                  background: "#0d1b2a",
                  color: "#fff",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Esplora IdeaSmart →
              </Link>
              <Link
                href="/chi-siamo"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-base font-bold transition-all hover:scale-105 border"
                style={{
                  background: "transparent",
                  color: "#1a1f2e",
                  borderColor: "#d1d5db",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Chi siamo →
              </Link>
              <Link
                href="/advertise"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-base font-bold transition-all hover:scale-105 border"
                style={{
                  background: "transparent",
                  color: "#e84f00",
                  borderColor: "#e84f0030",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Collabora con noi →
              </Link>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer
        className="border-t py-10"
        style={{ borderColor: "#e5e7eb", background: "#faf8f3" }}
      >
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p
            className="text-xs font-mono mb-2"
            style={{ color: "#9ca3af", fontFamily: "'Space Mono', monospace" }}
          >
            IDEASMART — Tecnologia
          </p>
          <p className="text-xs" style={{ color: "#d1d5db" }}>
            © {new Date().getFullYear()} IdeaSmart · Tutti i diritti riservati ·{" "}
            <a href="/" style={{ color: "#9ca3af" }}>
              ideasmart.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
