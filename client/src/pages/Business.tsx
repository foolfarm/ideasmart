/**
 * IDEASMART BUSINESS — Landing Page
 * Piattaforma per giornalisti ed editori che vogliono lanciare una testata agente automatizzata.
 * Design: bianco/crema (#faf9f6) + navy (#0a0f1e) + cyan (#00e5c8) + arancio (#ff5500)
 */

import { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Newspaper, Bot, Zap, TrendingUp, Mail, Share2, Search,
  PenLine, CheckCircle2, ChevronDown, ChevronUp, ArrowRight,
  Star, Users, BarChart3, Clock, Globe, Shield
} from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────

function FadeUp({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Demo Interattiva ──────────────────────────────────────────────────────────

const AGENTS = [
  {
    id: "scout",
    icon: Search,
    name: "Agent Scout",
    color: "#00e5c8",
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
    color: "#ff5500",
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
    color: "#6366f1",
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
    color: "#f59e0b",
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
    color: "#22c55e",
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
    color: "#0ea5e9",
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
      setActiveAgents(prev => {
        const next: Record<string, number> = {};
        AGENTS.forEach(a => { next[a.id] = step; });
        return next;
      });
      step++;
    }, 1400);
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return (
    <div className="bg-[#0a0f1e] rounded-2xl p-6 md:p-8 border border-white/10">
      {/* Selector settore */}
      <div className="flex flex-wrap gap-2 mb-6">
        {SECTORS.map(s => (
          <button
            key={s}
            onClick={() => setSelectedSector(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              selectedSector === s
                ? "bg-[#00e5c8] text-[#0a0f1e] border-[#00e5c8]"
                : "bg-transparent text-white/50 border-white/15 hover:border-white/30 hover:text-white/80"
            }`}
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
              className={`rounded-xl p-4 border transition-all duration-500 ${
                isDone
                  ? "border-white/20 bg-white/5"
                  : isActive
                  ? "border-white/15 bg-white/3"
                  : "border-white/8 bg-white/2"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                    isActive ? "opacity-100" : "opacity-30"
                  }`}
                  style={{ background: `${agent.color}20` }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: agent.color }} />
                </div>
                <span className={`text-xs font-bold transition-colors ${isActive ? "text-white" : "text-white/30"}`}>
                  {agent.name}
                </span>
                {isDone && (
                  <span className="ml-auto text-xs" style={{ color: agent.color }}>✓</span>
                )}
                {isActive && !isDone && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: agent.color }} />
                )}
              </div>
              <p className={`text-xs leading-relaxed transition-colors min-h-[2.5rem] ${
                isActive ? "text-white/60" : "text-white/20"
              }`}>
                {isActive ? agent.steps[Math.min(currentStep, 3)] : "In attesa..."}
              </p>
            </div>
          );
        })}
      </div>

      {/* Bottone avvia */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/30">
          Settore selezionato: <span className="text-[#00e5c8]">{selectedSector}</span>
        </p>
        <button
          onClick={startDemo}
          disabled={running}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            running
              ? "bg-white/10 text-white/40 cursor-not-allowed"
              : "bg-[#ff5500] text-white hover:bg-[#e04a00] active:scale-95"
          }`}
        >
          {running ? (
            <>
              <span className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
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
    <div className="border-b border-[#e8e4dc] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
      >
        <span className="font-semibold text-[#0a0f1e] text-sm md:text-base leading-snug">{q}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-[#0a0f1e]/40 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#0a0f1e]/40 shrink-0" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-[#4b5563] text-sm leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Form CTA ──────────────────────────────────────────────────────────────────

const SECTOR_OPTIONS = [
  "AI & Tech", "Economia & Finance", "Sport & Business",
  "Lifestyle & Luxury", "Salute & Biotech", "Motori", "Musica & Cultura",
  "Politica & Attualità", "Gossip & Entertainment", "Cybersecurity", "Altro",
];

const ROLE_OPTIONS = [
  "Giornalista freelance", "Editore / Direttore", "Imprenditore / CEO",
  "Agenzia di comunicazione", "Creator / Influencer", "Altro",
];

function DemoForm() {
  const [form, setForm] = useState({
    name: "", email: "", role: "", message: "",
  });
  const [sectors, setSectors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const mutation = trpc.business.requestDemo.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Richiesta inviata! Ti risponderemo entro 24 ore.");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const toggleSector = (s: string) => {
    setSectors(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.role || sectors.length === 0) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }
    mutation.mutate({ ...form, sectors });
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="text-5xl mb-4">🚀</div>
        <h3 className="text-2xl font-black text-[#0a0f1e] mb-3">Richiesta ricevuta!</h3>
        <p className="text-[#4b5563] max-w-md mx-auto leading-relaxed">
          Abbiamo ricevuto la tua richiesta di demo. Ti contatteremo entro <strong>24 ore</strong> per schedulare una call gratuita di 30 minuti.
        </p>
        <p className="text-sm text-[#9ca3af] mt-4">Controlla anche la cartella spam se non ricevi la nostra email.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#0a0f1e]/60 uppercase tracking-wide mb-1.5">
            Nome e Cognome *
          </label>
          <Input
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="Mario Rossi"
            className="bg-white border-[#e8e4dc] focus:border-[#00e5c8]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#0a0f1e]/60 uppercase tracking-wide mb-1.5">
            Email *
          </label>
          <Input
            type="email"
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            placeholder="mario@testata.it"
            className="bg-white border-[#e8e4dc] focus:border-[#00e5c8]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#0a0f1e]/60 uppercase tracking-wide mb-1.5">
          Ruolo / Professione *
        </label>
        <select
          value={form.role}
          onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
          className="w-full h-10 px-3 rounded-md border border-[#e8e4dc] bg-white text-sm text-[#0a0f1e] focus:outline-none focus:border-[#00e5c8]"
        >
          <option value="">Seleziona il tuo ruolo...</option>
          {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#0a0f1e]/60 uppercase tracking-wide mb-2">
          Settori di interesse * <span className="normal-case font-normal">(seleziona uno o più)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {SECTOR_OPTIONS.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSector(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                sectors.includes(s)
                  ? "bg-[#0a0f1e] text-white border-[#0a0f1e]"
                  : "bg-white text-[#0a0f1e]/60 border-[#e8e4dc] hover:border-[#0a0f1e]/30"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#0a0f1e]/60 uppercase tracking-wide mb-1.5">
          Note aggiuntive (opzionale)
        </label>
        <Textarea
          value={form.message}
          onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
          placeholder="Raccontaci il tuo progetto editoriale, il target, gli obiettivi..."
          rows={3}
          className="bg-white border-[#e8e4dc] focus:border-[#00e5c8] resize-none"
        />
      </div>

      <Button
        type="submit"
        disabled={mutation.isPending}
        className="w-full h-12 bg-[#ff5500] hover:bg-[#e04a00] text-white font-bold text-base rounded-xl"
      >
        {mutation.isPending ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            Invio in corso...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            Prenota la tua demo gratuita
            <ArrowRight className="w-4 h-4" />
          </span>
        )}
      </Button>

      <p className="text-center text-xs text-[#9ca3af]">
        Risponderemo entro 24 ore · Nessun impegno · La call è gratuita
      </p>
    </form>
  );
}

// ── Pagina principale ─────────────────────────────────────────────────────────

export default function Business() {
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#0a0f1e]">

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 bg-[#faf9f6]/95 backdrop-blur border-b border-[#e8e4dc]">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/">
            <span className="font-black text-xl tracking-tight cursor-pointer">
              IDEA<span className="text-[#ff5500]">SMART</span>
              <span className="ml-2 text-xs font-bold text-[#00e5c8] tracking-widest">BUSINESS</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/">
              <span className="text-sm text-[#0a0f1e]/50 hover:text-[#0a0f1e] transition-colors cursor-pointer hidden sm:block">
                ← Torna alla testata
              </span>
            </Link>
            <button
              onClick={scrollToForm}
              className="px-4 py-2 bg-[#ff5500] text-white text-sm font-bold rounded-lg hover:bg-[#e04a00] transition-colors"
            >
              Prenota demo
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-12 md:pt-24 md:pb-16">
        <FadeUp>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#00e5c8]/10 border border-[#00e5c8]/30 rounded-full text-xs font-bold text-[#00895e] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5c8] animate-pulse" />
            La stessa tecnologia che alimenta IdeaSmart.ai — 14 sezioni, 200+ notizie/giorno
          </div>
        </FadeUp>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <FadeUp delay={0.05}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight mb-6">
                Lancia la tua<br />
                <span className="text-[#ff5500]">testata giornalistica.</span><br />
                <span className="text-[#0a0f1e]/40">La redazione lavora<br />per te — ogni giorno.</span>
              </h1>
            </FadeUp>
            <FadeUp delay={0.1}>
              <p className="text-lg text-[#4b5563] leading-relaxed mb-8 max-w-lg">
                IdeaSmart Business è la piattaforma che permette a giornalisti, editori e creator di lanciare un giornale completamente automatizzato, con una redazione di agenti AI che produce notizie e analisi originali 24 ore su 24.
              </p>
            </FadeUp>
            <FadeUp delay={0.15}>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={scrollToForm}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#ff5500] text-white font-bold rounded-xl hover:bg-[#e04a00] transition-colors text-base"
                >
                  Prenota una demo gratuita
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#come-funziona"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 border border-[#e8e4dc] text-[#0a0f1e] font-semibold rounded-xl hover:border-[#0a0f1e]/30 transition-colors text-base"
                >
                  Scopri come funziona
                </a>
              </div>
            </FadeUp>
          </div>

          {/* Stats card */}
          <FadeUp delay={0.2}>
            <div className="bg-[#0a0f1e] rounded-2xl p-6 md:p-8 border border-white/10">
              <p className="text-[#00e5c8] text-xs font-bold tracking-widest mb-5 uppercase">
                IdeaSmart.ai — Live Stats
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "14", label: "Sezioni tematiche", icon: Newspaper },
                  { value: "200+", label: "Notizie al giorno", icon: Zap },
                  { value: "0", label: "Redattori umani", icon: Bot },
                  { value: "06:00", label: "Pubblicazione auto", icon: Clock },
                ].map(({ value, label, icon: Icon }) => (
                  <div key={label} className="bg-white/5 rounded-xl p-4">
                    <Icon className="w-4 h-4 text-[#00e5c8] mb-2" />
                    <p className="text-2xl font-black text-white">{value}</p>
                    <p className="text-xs text-white/40 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-white/30 italic">
                  "Una testata giornalistica completa, gestita interamente da agenti AI. Zero costi redazionali."
                </p>
                <p className="text-xs text-[#00e5c8] font-semibold mt-1">— Andrea Cinelli, Founder IdeaSmart</p>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── PAIN POINTS ── */}
      <section className="bg-[#0a0f1e] py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <FadeUp>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                Fare giornalismo di qualità costa troppo.<br />
                <span className="text-[#00e5c8]">Fino ad oggi.</span>
              </h2>
              <p className="text-white/50 max-w-xl mx-auto">
                Una redazione tradizionale richiede giornalisti, editor, grafici e sviluppatori. IdeaSmart Business cambia le regole.
              </p>
            </div>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-6">
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
            ].map(({ icon, title, desc }) => (
              <FadeUp key={title}>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors">
                  <div className="text-3xl mb-4">{icon}</div>
                  <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO INTERATTIVA ── */}
      <section className="py-16 md:py-20 bg-[#f4f1eb]">
        <div className="max-w-6xl mx-auto px-4">
          <FadeUp>
            <div className="text-center mb-10">
              <Badge className="mb-4 bg-[#ff5500]/10 text-[#ff5500] border-[#ff5500]/20 hover:bg-[#ff5500]/10">
                Demo interattiva
              </Badge>
              <h2 className="text-3xl md:text-4xl font-black text-[#0a0f1e] mb-4">
                Guarda la tua redazione al lavoro
              </h2>
              <p className="text-[#4b5563] max-w-xl mx-auto">
                Seleziona un settore e avvia la simulazione. Ecco come la tua redazione agente lavora ogni giorno in automatico.
              </p>
            </div>
          </FadeUp>
          <FadeUp delay={0.1}>
            <AgentDemo />
          </FadeUp>
        </div>
      </section>

      {/* ── CASE STUDY ── */}
      <section className="py-16 md:py-20 bg-[#faf9f6]">
        <div className="max-w-6xl mx-auto px-4">
          <FadeUp>
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-[#00e5c8]/10 text-[#00895e] border-[#00e5c8]/20 hover:bg-[#00e5c8]/10">
                Case study reale
              </Badge>
              <h2 className="text-3xl md:text-4xl font-black text-[#0a0f1e] mb-4">
                IdeaSmart.ai — la prova che funziona
              </h2>
              <p className="text-[#4b5563] max-w-xl mx-auto">
                Non vendiamo una promessa. Vendiamo la stessa tecnologia che usiamo ogni giorno per gestire IdeaSmart.ai.
              </p>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-4 mb-10">
            {[
              { value: "14", label: "Sezioni tematiche", sub: "AI, Startup, Finance, Sport, Motori, Tennis, Basket, Health, Luxury, Music, Gossip, Cybersecurity, Sondaggi, News Italia", icon: Newspaper, color: "#ff5500" },
              { value: "200+", label: "Notizie pubblicate al giorno", sub: "Prodotte interamente da agenti AI, con articoli originali e analisi di mercato", icon: TrendingUp, color: "#00e5c8" },
              { value: "0€", label: "Costo redazionale umano", sub: "Zero giornalisti, zero editor, zero grafici. Solo agenti AI che lavorano 24/7", icon: Bot, color: "#6366f1" },
              { value: "06:00", label: "Pubblicazione automatica", sub: "Ogni mattina alle 06:00 CET, la testata si aggiorna con le notizie del giorno", icon: Clock, color: "#f59e0b" },
              { value: "Daily", label: "Newsletter automatica", sub: "Inviata ogni mattina agli iscritti con le notizie più rilevanti del giorno", icon: Mail, color: "#22c55e" },
              { value: "10:30", label: "Post LinkedIn automatico", sub: "Un post al giorno generato e pubblicato automaticamente con analisi originale", icon: Share2, color: "#0ea5e9" },
            ].map(({ value, label, sub, icon: Icon, color }) => (
              <FadeUp key={label}>
                <div className="bg-white border border-[#e8e4dc] rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <Icon className="w-5 h-5 mb-3" style={{ color }} />
                  <p className="text-3xl font-black text-[#0a0f1e] mb-1">{value}</p>
                  <p className="text-sm font-bold text-[#0a0f1e] mb-2">{label}</p>
                  <p className="text-xs text-[#9ca3af] leading-relaxed">{sub}</p>
                </div>
              </FadeUp>
            ))}
          </div>

          {/* Quote founder */}
          <FadeUp>
            <div className="bg-[#0a0f1e] rounded-2xl p-8 md:p-10 flex flex-col md:flex-row gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-[#00e5c8]/20 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 text-[#00e5c8]" />
              </div>
              <div>
                <p className="text-white/80 text-lg md:text-xl leading-relaxed italic mb-4">
                  "Ho lanciato IdeaSmart come esperimento: una testata giornalistica completamente gestita da agenti AI. Oggi pubblica più notizie di una redazione di 10 persone, con costi mensili inferiori a quelli di un singolo collaboratore. Ora voglio mettere questa tecnologia a disposizione di chi ha una storia da raccontare."
                </p>
                <p className="text-[#00e5c8] font-bold">Andrea Cinelli</p>
                <p className="text-white/40 text-sm">Founder & CEO FoolFarm · Direttore Responsabile IdeaSmart</p>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── COME FUNZIONA ── */}
      <section id="come-funziona" className="py-16 md:py-20 bg-[#f4f1eb]">
        <div className="max-w-6xl mx-auto px-4">
          <FadeUp>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-[#0a0f1e] mb-4">
                Dal brief alla testata in 30 giorni
              </h2>
              <p className="text-[#4b5563] max-w-xl mx-auto">
                Un processo semplice e guidato. Tu porti la visione editoriale, noi costruiamo la redazione.
              </p>
            </div>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Configura la tua testata",
                desc: "Scegli i settori, il tono editoriale, le fonti, la frequenza di pubblicazione e il brand. Noi configuriamo la redazione agente su misura per te.",
                icon: Shield,
                color: "#ff5500",
              },
              {
                step: "02",
                title: "La redazione lavora in autonomia",
                desc: "Ogni giorno, gli agenti monitorano le fonti, scrivono articoli originali, ottimizzano per SEO e pubblicano in automatico. Tu supervisioni, loro producono.",
                icon: Bot,
                color: "#00e5c8",
              },
              {
                step: "03",
                title: "Scala quando vuoi",
                desc: "Aggiungi sezioni, aumenta la frequenza, integra newsletter e social. La piattaforma cresce con te senza aumentare i costi operativi.",
                icon: TrendingUp,
                color: "#6366f1",
              },
            ].map(({ step, title, desc, icon: Icon, color }, i) => (
              <FadeUp key={step} delay={i * 0.1}>
                <div className="relative bg-white border border-[#e8e4dc] rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="text-6xl font-black text-[#e8e4dc] absolute top-4 right-5 leading-none select-none">
                    {step}
                  </div>
                  <Icon className="w-6 h-6 mb-4" style={{ color }} />
                  <h3 className="text-lg font-black text-[#0a0f1e] mb-3">{title}</h3>
                  <p className="text-sm text-[#4b5563] leading-relaxed">{desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-16 md:py-20 bg-[#faf9f6]">
        <div className="max-w-6xl mx-auto px-4">
          <FadeUp>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-[#0a0f1e] mb-4">
                Un modello pensato per chi vuole crescere
              </h2>
              <p className="text-[#4b5563] max-w-xl mx-auto">
                Scegli il piano più adatto alle tue esigenze. Tutti includono setup, configurazione degli agenti e formazione.
              </p>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-6">
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
            ].map(({ name, price, period, desc, features, cta, highlighted, badge }) => (
              <FadeUp key={name}>
                <div className={`relative rounded-2xl p-6 md:p-8 h-full flex flex-col border transition-all ${
                  highlighted
                    ? "bg-[#0a0f1e] border-[#00e5c8]/30 shadow-xl"
                    : "bg-white border-[#e8e4dc] hover:shadow-md"
                }`}>
                  {badge && (
                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold ${
                      highlighted ? "bg-[#00e5c8] text-[#0a0f1e]" : "bg-[#ff5500] text-white"
                    }`}>
                      {badge}
                    </div>
                  )}
                  <div className="mb-6">
                    <p className={`text-xs font-bold tracking-widest uppercase mb-2 ${highlighted ? "text-[#00e5c8]" : "text-[#ff5500]"}`}>
                      {name}
                    </p>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className={`text-4xl font-black ${highlighted ? "text-white" : "text-[#0a0f1e]"}`}>{price}</span>
                      <span className={`text-sm ${highlighted ? "text-white/40" : "text-[#9ca3af]"}`}>{period}</span>
                    </div>
                    <p className={`text-sm leading-relaxed ${highlighted ? "text-white/50" : "text-[#4b5563]"}`}>{desc}</p>
                  </div>
                  <ul className="space-y-2.5 flex-1 mb-6">
                    {features.map(f => (
                      <li key={f} className="flex items-start gap-2">
                        <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${highlighted ? "text-[#00e5c8]" : "text-[#22c55e]"}`} />
                        <span className={`text-sm ${highlighted ? "text-white/70" : "text-[#4b5563]"}`}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={scrollToForm}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${
                      highlighted
                        ? "bg-[#ff5500] text-white hover:bg-[#e04a00]"
                        : "bg-[#0a0f1e] text-white hover:bg-[#1a2030]"
                    }`}
                  >
                    {cta}
                  </button>
                </div>
              </FadeUp>
            ))}
          </div>
          <p className="text-center text-xs text-[#9ca3af] mt-6">
            Tutti i piani includono setup, configurazione degli agenti e formazione. Prezzi IVA esclusa.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 md:py-20 bg-[#f4f1eb]">
        <div className="max-w-3xl mx-auto px-4">
          <FadeUp>
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-black text-[#0a0f1e] mb-4">
                Domande frequenti
              </h2>
            </div>
          </FadeUp>
          <FadeUp delay={0.05}>
            <div className="bg-white rounded-2xl border border-[#e8e4dc] px-6 md:px-8">
              {FAQS.map(faq => <FAQ key={faq.q} {...faq} />)}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── CTA FORM ── */}
      <section ref={formRef} className="py-16 md:py-24 bg-[#faf9f6]">
        <div className="max-w-2xl mx-auto px-4">
          <FadeUp>
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-black text-[#0a0f1e] mb-4">
                Pronto a lanciare la tua testata?
              </h2>
              <p className="text-[#4b5563] max-w-lg mx-auto leading-relaxed">
                Prenota una call gratuita di 30 minuti con il nostro team. Ti mostreremo una demo live della piattaforma e costruiremo insieme il progetto su misura per te.
              </p>
            </div>
          </FadeUp>
          <FadeUp delay={0.1}>
            <div className="bg-white border border-[#e8e4dc] rounded-2xl overflow-hidden shadow-sm">
              {/* Calendly inline widget */}
              <div
                className="calendly-inline-widget"
                data-url="https://calendly.com/andyiltoscano/30min?hide_gdpr_banner=1&primary_color=ff5500"
                style={{ minWidth: "320px", height: "700px" }}
              />
            </div>
          </FadeUp>

          {/* Trust badges */}
          <FadeUp delay={0.15}>
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-xs text-[#9ca3af]">
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
          </FadeUp>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0a0f1e] py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-black text-white text-lg">
            IDEA<span className="text-[#ff5500]">SMART</span>
            <span className="ml-2 text-xs text-[#00e5c8] tracking-widest">BUSINESS</span>
          </span>
          <div className="flex items-center gap-6 text-xs text-white/30">
            <Link href="/privacy"><span className="hover:text-white/60 transition-colors cursor-pointer">Privacy Policy</span></Link>
            <a href="mailto:info@ideasmart.ai" className="hover:text-white/60 transition-colors">info@ideasmart.ai</a>
            <Link href="/"><span className="hover:text-white/60 transition-colors cursor-pointer">ideasmart.ai</span></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
