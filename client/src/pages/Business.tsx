/**
 * IDEASMART BUSINESS — Landing Page
 * Design editoriale coerente con la testata: carta bianca (#faf8f3), inchiostro (#1a1a2e)
 * Tipografia: Playfair Display (titoli), Source Serif 4 (corpo), Space Mono (label/meta)
 */

import { useRef, useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  Search, PenLine, CheckCircle2, BarChart3, Globe, Share2,
  Zap, Bot, Newspaper, TrendingUp, Mail, Clock, Shield, Users,
  ChevronDown, ChevronUp, ArrowRight
} from "lucide-react";

// ── Palette editoriale ────────────────────────────────────────────────────────
const INK = "#1a1a2e";
const PAPER = "#faf8f3";
const ACCENT = "#c2410c"; // arancio editoriale (coerente con Startup News)
const LIGHT = "#fff0e6";

// ── Helpers tipografici ───────────────────────────────────────────────────────
function Divider({ thick = false }: { thick?: boolean }) {
  return <div className={`w-full ${thick ? "border-t-4" : "border-t"} border-[#1a1a2e]`} />;
}
function ThinDivider() {
  return <div className="w-full border-t border-[#1a1a2e]/20" />;
}
function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block text-[10px] font-bold uppercase tracking-[0.18em] px-2 py-0.5 rounded-sm mb-3"
      style={{ background: LIGHT, color: ACCENT, fontFamily: "'Space Mono', monospace" }}
    >
      {children}
    </span>
  );
}

// ── Demo Interattiva ──────────────────────────────────────────────────────────

const AGENTS = [
  {
    id: "scout",
    icon: Search,
    name: "Agent Scout",
    steps: [
      "Monitoraggio 847 fonti RSS attive...",
      "Trovate 23 notizie rilevanti nelle ultime 2 ore",
      "Prioritizzazione per rilevanza e impatto...",
      "✓ 8 notizie selezionate per la pubblicazione",
    ],
  },
  {
    id: "writer",
    icon: PenLine,
    name: "Agent Writer",
    steps: [
      "Analisi del contesto editoriale...",
      "Redazione: 'Startup deeptech italiane +35% nel 2025'",
      "Ottimizzazione headline e struttura...",
      "✓ Articolo di 450 parole completato",
    ],
  },
  {
    id: "editor",
    icon: CheckCircle2,
    name: "Agent Editor",
    steps: [
      "Verifica accuratezza e fonti...",
      "Ottimizzazione SEO: keyword density, meta...",
      "Controllo tono editoriale e stile...",
      "✓ Articolo approvato e pronto per la pubblicazione",
    ],
  },
  {
    id: "analyst",
    icon: BarChart3,
    name: "Agent Analyst",
    steps: [
      "Elaborazione dati di mercato...",
      "Generazione analisi: 'Finance & Markets Weekly'",
      "Correlazione con trend macroeconomici...",
      "✓ Report di analisi generato",
    ],
  },
  {
    id: "publisher",
    icon: Globe,
    name: "Agent Publisher",
    steps: [
      "Scheduling contenuti per le 06:00...",
      "Ottimizzazione immagini e layout...",
      "Preparazione newsletter quotidiana...",
      "✓ 14 articoli schedulati per domani mattina",
    ],
  },
  {
    id: "social",
    icon: Share2,
    name: "Agent Social",
    steps: [
      "Selezione notizia top del giorno...",
      "Generazione post LinkedIn con analisi...",
      "Scheduling per le 10:30 CET...",
      "✓ Post LinkedIn pronto — 1.2K follower raggiunti",
    ],
  },
];

const SECTORS = ["Economia & Finance", "Tech & AI", "Sport & Business", "Lifestyle & Luxury", "Salute & Biotech", "Custom"];

function AgentDemo() {
  const [activeAgents, setActiveAgents] = useState<Record<string, number>>({});
  const [selectedSector, setSelectedSector] = useState("Tech & AI");
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startDemo = () => {
    setRunning(true);
    setActiveAgents({});
    let step = 0;
    const maxSteps = 4;
    intervalRef.current = setInterval(() => {
      if (step >= maxSteps) {
        clearInterval(intervalRef.current!);
        setRunning(false);
        return;
      }
      setActiveAgents(() => {
        const next: Record<string, number> = {};
        AGENTS.forEach(a => { next[a.id] = step; });
        return next;
      });
      step++;
    }, 1400);
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return (
    <div className="border-2 border-[#1a1a2e] p-6 md:p-8" style={{ background: PAPER }}>
      {/* Selector settore */}
      <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-[#1a1a2e]/20">
        {SECTORS.map(s => (
          <button
            key={s}
            onClick={() => setSelectedSector(s)}
            className="px-3 py-1 text-xs font-bold uppercase tracking-widest transition-all border"
            style={{
              fontFamily: "'Space Mono', monospace",
              background: selectedSector === s ? INK : "transparent",
              color: selectedSector === s ? PAPER : `${INK}60`,
              borderColor: selectedSector === s ? INK : `${INK}30`,
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Agenti */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {AGENTS.map(agent => {
          const currentStep = activeAgents[agent.id] ?? -1;
          const isActive = currentStep >= 0;
          const isDone = currentStep >= 3;
          const Icon = agent.icon;
          return (
            <div
              key={agent.id}
              className="p-4 border transition-all duration-500"
              style={{
                borderColor: isDone ? INK : isActive ? `${INK}40` : `${INK}15`,
                background: isDone ? `${INK}08` : "transparent",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: isActive ? ACCENT : `${INK}30` }}
                />
                <span
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ fontFamily: "'Space Mono', monospace", color: isActive ? INK : `${INK}30` }}
                >
                  {agent.name}
                </span>
                {isDone && (
                  <span className="ml-auto text-xs font-bold" style={{ color: ACCENT }}>✓</span>
                )}
                {isActive && !isDone && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: ACCENT }} />
                )}
              </div>
              <p
                className="text-xs leading-relaxed min-h-[2.5rem]"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: isActive ? `${INK}70` : `${INK}25` }}
              >
                {isActive ? agent.steps[Math.min(currentStep, 3)] : "In attesa..."}
              </p>
            </div>
          );
        })}
      </div>

      {/* Bottone avvia */}
      <div className="flex items-center justify-between pt-4 border-t border-[#1a1a2e]/20">
        <p className="text-xs" style={{ fontFamily: "'Space Mono', monospace", color: `${INK}40` }}>
          Settore: <span style={{ color: ACCENT }}>{selectedSector}</span>
        </p>
        <button
          onClick={startDemo}
          disabled={running}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold uppercase tracking-widest transition-all border-2"
          style={{
            fontFamily: "'Space Mono', monospace",
            background: running ? "transparent" : INK,
            color: running ? `${INK}40` : PAPER,
            borderColor: running ? `${INK}20` : INK,
            cursor: running ? "not-allowed" : "pointer",
          }}
        >
          {running ? (
            <>
              <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
              Redazione al lavoro...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Avvia la redazione
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "Devo essere un giornalista per usare IdeaSmart Business?",
    a: "No, ma avere una competenza editoriale aiuta a configurare meglio il tono e i settori. Molti nostri clienti sono imprenditori, creator o agenzie di comunicazione che vogliono una presenza editoriale autorevole.",
  },
  {
    q: "I contenuti sono originali o aggregati?",
    a: "Gli agenti producono articoli originali basati su fonti verificate. Non è aggregazione: è redazione automatizzata. Ogni articolo viene scritto ex novo a partire dalle notizie rilevate, con un tono editoriale coerente con il brand della testata.",
  },
  {
    q: "Posso usare il mio dominio personalizzato?",
    a: "Sì, tutti i piani includono la possibilità di usare un dominio personalizzato (es. latua-testata.it). Gestiamo noi la configurazione DNS e il certificato SSL.",
  },
  {
    q: "Quanto tempo ci vuole per lanciare?",
    a: "Mediamente 2-4 settimane dalla firma del contratto alla pubblicazione del primo articolo. Il tempo dipende dalla complessità della configurazione e dal numero di sezioni richieste.",
  },
  {
    q: "Posso supervisionare i contenuti prima della pubblicazione?",
    a: "Sì. Puoi impostare un flusso di approvazione dove ogni articolo passa per la tua revisione prima di essere pubblicato. Oppure puoi lasciare tutto in automatico — la scelta è tua.",
  },
  {
    q: "Come funziona il modello Revenue Sharing?",
    a: "Con il modello Revenue Sharing, non paghi nulla di fisso. IdeaSmart gestisce la testata, la monetizzazione pubblicitaria e la distribuzione. In cambio, trattiamo il 30% dei ricavi pubblicitari generati. Ideale per chi vuole partire senza rischi.",
  },
];

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#1a1a2e]/20 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
      >
        <span
          className="font-semibold text-sm md:text-base leading-snug"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: INK }}
        >
          {q}
        </span>
        {open
          ? <ChevronUp className="w-4 h-4 shrink-0" style={{ color: `${INK}50` }} />
          : <ChevronDown className="w-4 h-4 shrink-0" style={{ color: `${INK}50` }} />
        }
      </button>
      {open && (
        <p
          className="pb-5 text-sm leading-relaxed"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: `${INK}70` }}
        >
          {a}
        </p>
      )}
    </div>
  );
}

// ── Pagina principale ─────────────────────────────────────────────────────────

export default function Business() {
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Carica Calendly script
  useEffect(() => {
    const existing = document.querySelector('script[src*="calendly"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className="min-h-screen" style={{ background: PAPER, color: INK }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,600&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,300;1,8..60,400&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
      `}</style>

      {/* ── TESTATA ── */}
      <header className="max-w-6xl mx-auto px-4 pt-6 pb-0">
        <div className="flex items-center justify-between mb-2">
          <Link href="/">
            <span
              className="text-xs uppercase tracking-[0.25em] cursor-pointer hover:opacity-60 transition-opacity"
              style={{ fontFamily: "'Space Mono', monospace", color: `${INK}50` }}
            >
              ← Torna alla testata
            </span>
          </Link>
          <button
            onClick={scrollToForm}
            className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest border-2 transition-all hover:bg-[#1a1a2e] hover:text-[#faf8f3]"
            style={{ fontFamily: "'Space Mono', monospace", borderColor: INK, color: INK }}
          >
            Prenota demo
          </button>
        </div>

        <Divider thick />

        <div className="text-center py-5">
          <Link href="/">
            <h1
              className="text-5xl md:text-7xl font-black tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.02em", color: INK }}
            >
              IdeaSmart
            </h1>
          </Link>
          <p
            className="mt-1 text-xs uppercase tracking-[0.3em]"
            style={{ fontFamily: "'Space Mono', monospace", color: `${INK}50` }}
          >
            La Redazione Agente per la tua Testata
          </p>
          <p
            className="mt-1 text-[11px] italic"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: `${INK}40`, letterSpacing: "0.02em" }}
          >
            Powered by IdeaSmart.ai — La Prima Testata HumanLess italiana
          </p>
        </div>

        <Divider thick />
      </header>

      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-4 pt-10 pb-8">
        <div className="grid md:grid-cols-[3fr_2fr] gap-0">
          {/* Colonna sinistra: headline */}
          <div className="pr-0 md:pr-8 py-4 border-r-0 md:border-r border-[#1a1a2e]/20">
            <SectionTag>IdeaSmart Business</SectionTag>
            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] mb-5"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.02em", color: INK }}
            >
              Lancia la tua testata giornalistica.{" "}
              <span style={{ color: ACCENT }}>La redazione lavora per te.</span>
            </h2>
            <ThinDivider />
            <p
              className="mt-4 text-base leading-relaxed mb-6 max-w-lg"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: `${INK}75` }}
            >
              IdeaSmart Business è la piattaforma che permette a giornalisti, editori e creator di lanciare
              un giornale completamente automatizzato, con una redazione di agenti AI che produce notizie
              e analisi originali 24 ore su 24.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={scrollToForm}
                className="flex items-center justify-center gap-2 px-6 py-3 font-bold text-sm uppercase tracking-widest border-2 transition-all hover:opacity-80"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  background: INK,
                  color: PAPER,
                  borderColor: INK,
                }}
              >
                Prenota una demo gratuita
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#come-funziona"
                className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-sm uppercase tracking-widest border-2 transition-all hover:bg-[#1a1a2e]/5"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  color: INK,
                  borderColor: `${INK}40`,
                }}
              >
                Come funziona
              </a>
            </div>
          </div>

          {/* Colonna destra: stats */}
          <div className="pl-0 md:pl-8 py-4 mt-6 md:mt-0">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4"
              style={{ fontFamily: "'Space Mono', monospace", color: `${INK}40` }}
            >
              IdeaSmart.ai — Live Stats
            </p>
            <ThinDivider />
            <div className="grid grid-cols-2 gap-0 mt-0">
              {[
                { value: "14", label: "Sezioni tematiche", icon: Newspaper },
                { value: "200+", label: "Notizie al giorno", icon: Zap },
                { value: "0", label: "Redattori umani", icon: Bot },
                { value: "06:00", label: "Pubblicazione auto", icon: Clock },
              ].map(({ value, label, icon: Icon }, i) => (
                <div
                  key={label}
                  className={`py-4 px-3 ${i % 2 === 0 ? "border-r border-[#1a1a2e]/20" : ""} ${i < 2 ? "border-b border-[#1a1a2e]/20" : ""}`}
                >
                  <Icon className="w-4 h-4 mb-2" style={{ color: ACCENT }} />
                  <p
                    className="text-2xl font-black"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif", color: INK }}
                  >
                    {value}
                  </p>
                  <p
                    className="text-[10px] mt-0.5"
                    style={{ fontFamily: "'Space Mono', monospace", color: `${INK}40` }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
            <ThinDivider />
            <p
              className="mt-3 text-xs italic leading-relaxed"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: `${INK}40` }}
            >
              "Una testata giornalistica completa, gestita interamente da agenti AI. Zero costi redazionali."
            </p>
            <p
              className="mt-1 text-[10px] font-bold"
              style={{ fontFamily: "'Space Mono', monospace", color: ACCENT }}
            >
              — Andrea Cinelli, Founder IdeaSmart
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4"><Divider /></div>

      {/* ── PAIN POINTS ── */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <SectionTag>Il problema</SectionTag>
          <h2
            className="text-3xl md:text-4xl font-black leading-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: INK }}
          >
            Fare giornalismo di qualità costa troppo.{" "}
            <em style={{ color: ACCENT }}>Fino ad oggi.</em>
          </h2>
        </div>
        <ThinDivider />
        <div className="grid md:grid-cols-3 gap-0 mt-0">
          {[
            {
              icon: "💸",
              title: "Costi insostenibili",
              desc: "Una redazione di 5 persone costa €15.000–€30.000/mese. Impossibile per editori indipendenti e giornalisti freelance.",
            },
            {
              icon: "⏰",
              title: "Copertura limitata",
              desc: "Con risorse umane limitate, è impossibile coprire più settori con continuità e qualità costante.",
            },
            {
              icon: "🔄",
              title: "Contenuti obsoleti",
              desc: "Le notizie invecchiano in ore. Senza una redazione sempre attiva, si perde il momento giusto per pubblicare.",
            },
          ].map(({ icon, title, desc }, i) => (
            <div
              key={title}
              className={`py-6 ${i < 2 ? "border-r-0 md:border-r border-[#1a1a2e]/20" : ""} ${i > 0 ? "pl-0 md:pl-6" : ""} ${i < 2 ? "pr-0 md:pr-6" : ""}`}
            >
              <div className="text-2xl mb-3">{icon}</div>
              <h3
                className="font-bold text-base mb-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: INK }}
              >
                {title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: `${INK}60` }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4"><Divider /></div>

      {/* ── DEMO INTERATTIVA ── */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-6">
          <SectionTag>Demo interattiva</SectionTag>
          <h2
            className="text-3xl md:text-4xl font-black leading-tight mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: INK }}
          >
            Guarda la tua redazione al lavoro
          </h2>
          <p
            className="text-base max-w-xl"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: `${INK}65` }}
          >
            Seleziona un settore e avvia la simulazione. Ecco come la tua redazione agente lavora ogni giorno in automatico.
          </p>
        </div>
        <AgentDemo />
      </section>

      <div className="max-w-6xl mx-auto px-4"><Divider /></div>

      {/* ── CASE STUDY ── */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <SectionTag>Case study reale</SectionTag>
          <h2
            className="text-3xl md:text-4xl font-black leading-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: INK }}
          >
            IdeaSmart.ai — la prova che funziona
          </h2>
          <p
            className="mt-2 text-base max-w-xl"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: `${INK}65` }}
          >
            Non vendiamo una promessa. Vendiamo la stessa tecnologia che usiamo ogni giorno per gestire IdeaSmart.ai.
          </p>
        </div>
        <ThinDivider />

        {/* Metriche */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-0 mt-0">
          {[
            { value: "14", label: "Sezioni tematiche", sub: "AI, Startup, Finance, Sport, Motori, Tennis, Basket, Health, Luxury, Music, Gossip, Cybersecurity, Sondaggi, News Italia", icon: Newspaper },
            { value: "200+", label: "Notizie al giorno", sub: "Prodotte interamente da agenti AI, con articoli originali e analisi di mercato", icon: TrendingUp },
            { value: "0€", label: "Costo redazionale", sub: "Zero giornalisti, zero editor, zero grafici. Solo agenti AI che lavorano 24/7", icon: Bot },
            { value: "06:00", label: "Pubblicazione auto", sub: "Ogni mattina alle 06:00 CET, la testata si aggiorna con le notizie del giorno", icon: Clock },
            { value: "Daily", label: "Newsletter automatica", sub: "Inviata ogni mattina agli iscritti con le notizie più rilevanti del giorno", icon: Mail },
            { value: "10:30", label: "Post LinkedIn auto", sub: "Un post al giorno generato e pubblicato automaticamente con analisi originale", icon: Share2 },
          ].map(({ value, label, sub, icon: Icon }, i) => (
            <div
              key={label}
              className={`py-5 ${i % 3 !== 2 ? "border-r-0 md:border-r border-[#1a1a2e]/20" : ""} ${i < 3 ? "border-b border-[#1a1a2e]/20" : ""} ${i % 3 !== 0 ? "pl-0 md:pl-5" : ""} ${i % 3 !== 2 ? "pr-0 md:pr-5" : ""}`}
            >
              <Icon className="w-4 h-4 mb-2" style={{ color: ACCENT }} />
              <p
                className="text-3xl font-black mb-1"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: INK }}
              >
                {value}
              </p>
              <p
                className="text-xs font-bold mb-1"
                style={{ fontFamily: "'Space Mono', monospace", color: INK }}
              >
                {label}
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: `${INK}40` }}
              >
                {sub}
              </p>
            </div>
          ))}
        </div>

        <ThinDivider />

        {/* Quote founder */}
        <div className="py-8 grid md:grid-cols-[auto_1fr] gap-6 items-start">
          <div
            className="text-5xl font-black leading-none select-none hidden md:block"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: `${INK}15` }}
          >
            "
          </div>
          <div>
            <p
              className="text-lg md:text-xl leading-relaxed italic mb-4"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: `${INK}80` }}
            >
              Ho lanciato IdeaSmart come esperimento: una testata giornalistica completamente gestita da agenti AI.
              Oggi pubblica più notizie di una redazione di 10 persone, con costi mensili inferiori a quelli di un
              singolo collaboratore. Ora voglio mettere questa tecnologia a disposizione di chi ha una storia da raccontare.
            </p>
            <p
              className="font-bold text-sm"
              style={{ fontFamily: "'Space Mono', monospace", color: ACCENT }}
            >
              Andrea Cinelli
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ fontFamily: "'Space Mono', monospace", color: `${INK}40` }}
            >
              Founder & CEO FoolFarm · Direttore Responsabile IdeaSmart
            </p>
            <Link
              href="/chi-siamo"
              className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold uppercase tracking-widest hover:underline transition-colors"
              style={{ fontFamily: "'Space Mono', monospace", color: `${INK}50` }}
            >
              Scopri la storia di IdeaSmart →
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4"><Divider /></div>

      {/* ── COME FUNZIONA ── */}
      <section id="come-funziona" className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <SectionTag>Come funziona</SectionTag>
          <h2
            className="text-3xl md:text-4xl font-black leading-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: INK }}
          >
            Dal brief alla testata in 30 giorni
          </h2>
          <p
            className="mt-2 text-base max-w-xl"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: `${INK}65` }}
          >
            Un processo semplice e guidato. Tu porti la visione editoriale, noi costruiamo la redazione.
          </p>
        </div>
        <ThinDivider />
        <div className="grid md:grid-cols-3 gap-0 mt-0">
          {[
            {
              step: "01",
              title: "Configura la tua testata",
              desc: "Scegli i settori, il tono editoriale, le fonti, la frequenza di pubblicazione e il brand. Noi configuriamo la redazione agente su misura per te.",
              icon: Shield,
            },
            {
              step: "02",
              title: "La redazione lavora in autonomia",
              desc: "Ogni giorno, gli agenti monitorano le fonti, scrivono articoli originali, ottimizzano per SEO e pubblicano in automatico. Tu supervisioni, loro producono.",
              icon: Bot,
            },
            {
              step: "03",
              title: "Scala quando vuoi",
              desc: "Aggiungi sezioni, aumenta la frequenza, integra newsletter e social. La piattaforma cresce con te senza aumentare i costi operativi.",
              icon: TrendingUp,
            },
          ].map(({ step, title, desc, icon: Icon }, i) => (
            <div
              key={step}
              className={`py-6 relative ${i < 2 ? "border-r-0 md:border-r border-[#1a1a2e]/20" : ""} ${i > 0 ? "pl-0 md:pl-6" : ""} ${i < 2 ? "pr-0 md:pr-6" : ""}`}
            >
              <div
                className="absolute top-4 right-0 text-6xl font-black leading-none select-none"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: `${INK}08` }}
              >
                {step}
              </div>
              <Icon className="w-5 h-5 mb-4" style={{ color: ACCENT }} />
              <h3
                className="font-bold text-base mb-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: INK }}
              >
                {title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: `${INK}60` }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4"><Divider /></div>

      {/* ── PRICING ── */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <SectionTag>Prezzi</SectionTag>
          <h2
            className="text-3xl md:text-4xl font-black leading-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: INK }}
          >
            Un modello pensato per chi vuole crescere
          </h2>
          <p
            className="mt-2 text-base max-w-xl"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: `${INK}65` }}
          >
            Scegli il piano più adatto alle tue esigenze. Tutti includono setup, configurazione degli agenti e formazione.
          </p>
        </div>
        <ThinDivider />

        <div className="grid md:grid-cols-3 gap-0 mt-0">
          {[
            {
              name: "Starter",
              price: "€ 490",
              period: "/mese",
              desc: "Per chi vuole testare il modello con una singola sezione tematica.",
              features: [
                "1 sezione tematica",
                "Fino a 20 notizie/giorno",
                "Newsletter settimanale automatica",
                "Dominio personalizzato",
                "Dashboard analytics",
                "Supporto email",
              ],
              cta: "Inizia con Starter",
              highlighted: false,
              badge: null,
            },
            {
              name: "Professional",
              price: "€ 990",
              period: "/mese",
              desc: "La scelta ideale per chi vuole una testata multisettore completa.",
              features: [
                "Fino a 5 sezioni tematiche",
                "Fino a 100 notizie/giorno",
                "Newsletter quotidiana automatica",
                "Post social automatici (LinkedIn + X)",
                "SEO ottimizzato",
                "Supporto prioritario",
              ],
              cta: "Scegli Professional",
              highlighted: true,
              badge: "Il più scelto",
            },
            {
              name: "Revenue Sharing",
              price: "0€",
              period: " upfront",
              desc: "Nessun costo fisso. Partiamo insieme e cresciamo insieme.",
              features: [
                "Tutte le funzionalità Professional",
                "Nessun costo fisso mensile",
                "Monetizzazione gestita da IdeaSmart",
                "30% dei ricavi pubblicitari",
                "Accordo personalizzato",
                "Ideale per chi parte da zero",
              ],
              cta: "Parliamone",
              highlighted: false,
              badge: "Senza rischi",
            },
          ].map(({ name, price, period, desc, features, cta, highlighted, badge }, i) => (
            <div
              key={name}
              className={`py-8 flex flex-col ${i < 2 ? "border-r-0 md:border-r border-[#1a1a2e]/20" : ""} ${i > 0 ? "pl-0 md:pl-6" : ""} ${i < 2 ? "pr-0 md:pr-6" : ""} ${highlighted ? "relative" : ""}`}
              style={highlighted ? { background: `${INK}05` } : {}}
            >
              {badge && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    background: highlighted ? INK : ACCENT,
                    color: PAPER,
                  }}
                >
                  {badge}
                </div>
              )}
              <div className="mb-4">
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2"
                  style={{ fontFamily: "'Space Mono', monospace", color: highlighted ? ACCENT : `${INK}50` }}
                >
                  {name}
                </p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span
                    className="text-4xl font-black"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif", color: INK }}
                  >
                    {price}
                  </span>
                  <span
                    className="text-sm"
                    style={{ fontFamily: "'Space Mono', monospace", color: `${INK}40` }}
                  >
                    {period}
                  </span>
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: `${INK}60` }}
                >
                  {desc}
                </p>
              </div>
              <ThinDivider />
              <ul className="space-y-2.5 flex-1 my-4">
                {features.map(f => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: ACCENT }} />
                    <span
                      className="text-sm"
                      style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: `${INK}70` }}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
              <ThinDivider />
              <button
                onClick={scrollToForm}
                className="mt-4 w-full py-3 font-bold text-sm uppercase tracking-widest border-2 transition-all hover:opacity-80"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  background: highlighted ? INK : "transparent",
                  color: highlighted ? PAPER : INK,
                  borderColor: INK,
                }}
              >
                {cta}
              </button>
            </div>
          ))}
        </div>
        <p
          className="text-center text-xs mt-6"
          style={{ fontFamily: "'Space Mono', monospace", color: `${INK}35` }}
        >
          Tutti i piani includono setup, configurazione degli agenti e formazione. Prezzi IVA esclusa.
        </p>
      </section>

      <div className="max-w-6xl mx-auto px-4"><Divider /></div>

      {/* ── FAQ ── */}
      <section className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-6">
          <SectionTag>Domande frequenti</SectionTag>
          <h2
            className="text-3xl md:text-4xl font-black leading-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: INK }}
          >
            Tutto quello che vuoi sapere
          </h2>
        </div>
        <ThinDivider />
        <div>
          {FAQS.map(faq => <FAQ key={faq.q} {...faq} />)}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4"><Divider /></div>

      {/* ── CTA / CALENDLY ── */}
      <section ref={formRef} className="max-w-3xl mx-auto px-4 py-10 pb-16">
        <div className="mb-8 text-center">
          <SectionTag>Prenota una call</SectionTag>
          <h2
            className="text-3xl md:text-4xl font-black leading-tight mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: INK }}
          >
            Pronto a lanciare la tua testata?
          </h2>
          <p
            className="text-base max-w-lg mx-auto leading-relaxed"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: `${INK}65` }}
          >
            Prenota una call gratuita di 30 minuti con il nostro team. Ti mostreremo una demo live della
            piattaforma e costruiremo insieme il progetto su misura per te.
          </p>
        </div>

        <div className="border-2 border-[#1a1a2e] overflow-hidden">
          <div
            className="calendly-inline-widget"
            data-url="https://calendly.com/andyiltoscano/30min?hide_gdpr_banner=1&primary_color=c2410c"
            style={{ minWidth: "320px", height: "700px" }}
          />
        </div>

        {/* Trust badges */}
        <div
          className="flex flex-wrap items-center justify-center gap-6 mt-6 text-xs"
          style={{ fontFamily: "'Space Mono', monospace", color: `${INK}40` }}
        >
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Tecnologia made in Italy
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Testata registrata al ROC
          </div>
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            GDPR compliant
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="border-t-4 border-[#1a1a2e] py-8"
        style={{ background: PAPER }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <Divider />
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4">
            <Link href="/">
              <span
                className="font-black text-lg cursor-pointer hover:opacity-70 transition-opacity"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: INK }}
              >
                IdeaSmart
                <span
                  className="ml-2 text-xs font-bold uppercase tracking-widest"
                  style={{ fontFamily: "'Space Mono', monospace", color: ACCENT }}
                >
                  Business
                </span>
              </span>
            </Link>
            <div
              className="flex items-center gap-6 text-xs"
              style={{ fontFamily: "'Space Mono', monospace", color: `${INK}40` }}
            >
              <Link href="/chi-siamo">
                <span className="hover:underline cursor-pointer font-semibold" style={{ color: INK }}>Chi Siamo</span>
              </Link>
              <Link href="/privacy">
                <span className="hover:underline cursor-pointer">Privacy Policy</span>
              </Link>
              <a href="mailto:info@ideasmart.ai" className="hover:underline">info@ideasmart.ai</a>
              <Link href="/">
                <span className="hover:underline cursor-pointer">ideasmart.ai</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
