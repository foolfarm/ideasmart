/*
 * IDEASMART Home Page — Light Editorial / Tech Magazine
 * Design: White (#fafafa) + Slate (#1a1f2e) + Teal (#00b4a0) + Orange (#e84f00)
 * Typography: Space Grotesk (display) + DM Sans (body) + JetBrains Mono (mono)
 * Layout: Asymmetric editorial with numbered sections
 */
import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// ─── Image URLs (CDN) ────────────────────────────────────────────────────────
const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ideasmart_hero-6ZrdwCga3BYZbueso82C5j.webp";
const FOOLTALENT_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ideasmart_fooltalent-2nEN4eE9YHfFBW4qWKwTVs.webp";
const FOOLSHARE_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ideasmart_foolshare-UYNVhRWFTa6cBhUyxxwkEK.webp";
const FRAGMENTALIS_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ideasmart_fragmentalis-WqVpGnPxQvhf6bevxs5m6m.webp";
const POLLCAST_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ideasmart_pollcast-gLGMN8iojcFU6EWceVzvo5.webp";

// ─── Brand Colors ─────────────────────────────────────────────────────────────
const C = {
  teal: "#00b4a0",
  tealLight: "#e6f7f5",
  orange: "#e84f00",
  orangeLight: "#fff2ec",
  blue: "#1a56db",
  blueLight: "#eff4ff",
  navy: "#1a1f2e",
  slate: "#4b5563",
  muted: "#9ca3af",
  border: "#e2e5ed",
  surface1: "#f8f9fc",
  surface2: "#f1f3f8",
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

// ─── Progress Bar ────────────────────────────────────────────────────────────
function PollBar({ label, category, percentage, votes, color, bgColor }: {
  label: string; category: string; percentage: number; votes: number; color: string; bgColor: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="rounded-xl p-4 border transition-all hover:shadow-sm" style={{ borderColor: C.border, background: "#fff" }}>
      <p className="editorial-tag mb-2" style={{ color }}>{category}</p>
      <p className="text-sm font-semibold mb-3 leading-snug" style={{ color: C.navy, fontFamily: "'Space Grotesk', sans-serif" }}>
        {label}
      </p>
      <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: bgColor }}>
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
        <span className="text-xs" style={{ color: C.muted }}>{votes.toLocaleString()} voti</span>
      </div>
    </div>
  );
}

// ─── Feature check item ──────────────────────────────────────────────────────
function FeatureItem({ text, color, bgColor }: { text: string; color: string; bgColor: string }) {
  return (
    <div className="flex items-start gap-3 py-3 feature-item">
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: bgColor }}
      >
        <span className="text-xs font-bold" style={{ color }}>✓</span>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: C.slate }}>{text}</p>
    </div>
  );
}

// ─── Stat block ─────────────────────────────────────────────────────────────
function StatBlock({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="text-center p-4 rounded-xl stat-block">
      <div className="text-3xl font-black mb-1" style={{ color, fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
      <div className="editorial-tag" style={{ color: C.muted }}>{label}</div>
    </div>
  );
}

// ─── Section Header ──────────────────────────────────────────────────────────
function SectionHeader({ number, category, categoryColor, title, titleColor }: {
  number: string; category: string; categoryColor: string; title: string; titleColor?: string;
}) {
  return (
    <>
      <div className="border-b" style={{ borderColor: C.border, background: C.surface1 }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
          <span className="editorial-tag" style={{ color: C.muted }}>{number} —</span>
          <span className="editorial-tag" style={{ color: categoryColor }}>{category}</span>
        </div>
      </div>
      <div className="border-b-2" style={{ borderColor: categoryColor, background: `${categoryColor}08` }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <h2
            className="text-2xl sm:text-3xl font-black leading-tight"
            style={{ color: titleColor || C.navy, fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {title}
          </h2>
        </div>
      </div>
    </>
  );
}

// ─── NewsGrid Component (dynamic, reads from DB via tRPC) ──────────────────
const NEWS_COLORS = [
  { color: C.teal, bg: C.tealLight },
  { color: C.orange, bg: C.orangeLight },
  { color: C.blue, bg: C.blueLight },
];

function NewsGrid() {
  const { data: newsData, isLoading } = trpc.news.getLatest.useQuery({ limit: 20 });

  const fallbackNews = [
    { id: 1, title: "OpenAI lancia GPT-5.3 Instant: -26.8% di allucinazioni", summary: "Il modello più usato di OpenAI riceve un aggiornamento che riduce le allucinazioni del 26,8% sulle query web.", category: "Modelli Generativi", sourceUrl: "https://venturebeat.com", sourceName: "VentureBeat" },
    { id: 2, title: "Anthropic vs. Pentagono: Claude rifiuta le richieste militari", summary: "Anthropic entra in rotta di collisione con il Dipartimento della Difesa USA dopo aver rifiutato di adattare Claude per usi militari.", category: "AI & Difesa", sourceUrl: "https://cbsnews.com", sourceName: "CBS News" },
    { id: 3, title: "Agentic AI: nel 2026 il 40% delle app aziendali sarà AI-driven", summary: "Il report Deloitte certifica che le aziende stanno deployando agenti AI autonomi su funzioni critiche.", category: "AI Agentiva", sourceUrl: "https://deloitte.com", sourceName: "Deloitte" },
    { id: 4, title: "Google lancia Flash-Lite: Gemini 3.1 punta sull'enterprise scale", summary: "Google risponde a OpenAI con Flash-Lite, la versione enterprise di Gemini 3.1 ottimizzata per carichi di lavoro su scala.", category: "Big Tech", sourceUrl: "https://google.com", sourceName: "Google Blog" },
    { id: 5, title: "La Cina accelera: robot umanoidi e agenti AI nelle fabbriche", summary: "I leader tech cinesi chiedono di accelerare l'adozione industriale di robot umanoidi. Obiettivo: produzione di massa entro il 2027.", category: "Robot & AI Fisica", sourceUrl: "https://scmp.com", sourceName: "SCMP" },
    { id: 6, title: "Anthropic raggiunge $20 miliardi di revenue run rate", summary: "Anthropic supera i 20 miliardi di dollari di revenue run rate, trainata da Claude Code.", category: "Startup & Funding", sourceUrl: "https://anthropic.com", sourceName: "Analisi Finanziaria" },
    { id: 7, title: "Qualcomm al MWC 2026: l'AI ibrida arriva su ogni dispositivo", summary: "Qualcomm annuncia la nuova generazione Snapdragon con AI ibrida on-device/cloud per smartphone.", category: "AI & Hardware", sourceUrl: "https://qualcomm.com", sourceName: "La Repubblica" },
    { id: 8, title: "Deep Tech Revolution: 5 startup italiane ricevono €200k ciascuna", summary: "Il programma seleziona 5 startup italiane che riceveranno 200.000 euro ciascuna per sviluppare tecnologie deep tech con AI.", category: "AI & Startup Italiane", sourceUrl: "https://ilmessaggero.it", sourceName: "Il Messaggero" },
    { id: 9, title: "Call4Innovit 2026: startup italiane a Silicon Valley a fondo perduto", summary: "Innovit lancia il programma di accelerazione gratuito per portare startup e PMI italiane nella Silicon Valley.", category: "Internazionalizzazione", sourceUrl: "https://innovit.it", sourceName: "Incentivi Impresa" },
    { id: 10, title: "MIT Sloan: 'L'AI agentiva non è ancora pronta per il prime time'", summary: "Il MIT Sloan pubblica le action items per i decision maker AI nel 2026: l'AI agentiva è promettente ma instabile.", category: "Ricerca & Innovazione", sourceUrl: "https://mitsloan.mit.edu", sourceName: "MIT Sloan" },
    { id: 11, title: "EU AI Act: prime restrizioni per i sistemi ad alto rischio", summary: "L'UE attiva le prime disposizioni vincolanti dell'AI Act. Le aziende hanno 12 mesi per adeguarsi.", category: "Regolamentazione AI", sourceUrl: "https://ec.europa.eu", sourceName: "Il Sole 24 Ore" },
    { id: 12, title: "DeepMind: AlphaFold 3 accelera la scoperta di farmaci oncologici", summary: "AlphaFold 3 applicato alla ricerca oncologica: identificati 47 nuovi target proteici per terapie contro il cancro.", category: "AI & Salute", sourceUrl: "https://deepmind.google", sourceName: "Nature Medicine" },
    { id: 13, title: "BlackRock integra AI generativa nei portafogli: +12% di alpha", summary: "Il più grande gestore patrimoniale al mondo annuncia l'integrazione di modelli AI generativi nella gestione attiva.", category: "AI & Finanza", sourceUrl: "https://blackrock.com", sourceName: "Financial Times" },
    { id: 14, title: "Meta lancia Llama 4: open source e multimodale, sfida GPT-5", summary: "Meta rilascia Llama 4 con capacità multimodali avanzate e licenza open source commerciale. 405 miliardi di parametri.", category: "Modelli Generativi", sourceUrl: "https://ai.meta.com", sourceName: "TechCrunch" },
    { id: 15, title: "WEF: l'AI creerà 97 milioni di nuovi posti di lavoro entro il 2028", summary: "Il report WEF 2026 ribalta la narrativa: l'AI non distrugge lavoro, lo trasforma. Il 65% dei lavori del 2030 non esiste ancora.", category: "AI & Lavoro", sourceUrl: "https://weforum.org", sourceName: "World Economic Forum" },
    { id: 16, title: "CDP Venture Capital: €500M per startup AI italiane nel 2026", summary: "CDP Venture Capital annuncia un fondo dedicato da 500 milioni di euro per startup AI italiane.", category: "AI & Startup Italiane", sourceUrl: "https://cdpventurecapital.it", sourceName: "Corriere della Sera" },
    { id: 17, title: "Microsoft Copilot+ PC: l'AI on-device conquista il 30% del mercato", summary: "I PC con chip NPU dedicati all'AI raggiungono il 30% delle vendite enterprise in Europa.", category: "Big Tech", sourceUrl: "https://microsoft.com", sourceName: "IDC Research" },
    { id: 18, title: "Stanford HAI: l'Italia sale al 7° posto nell'AI Index 2026", summary: "L'AI Index 2026 di Stanford: l'Italia guadagna 3 posizioni, trainata dalla crescita di startup AI.", category: "Ricerca & Innovazione", sourceUrl: "https://aiindex.stanford.edu", sourceName: "Stanford HAI" },
    { id: 19, title: "Salesforce Agentforce 2.0: agenti AI autonomi per il CRM enterprise", summary: "Salesforce lancia Agentforce 2.0 con agenti AI che gestiscono autonomamente pipeline di vendita e supporto clienti.", category: "AI Agentiva", sourceUrl: "https://salesforce.com", sourceName: "Salesforce Blog" },
    { id: 20, title: "Gartner: il 45% delle violazioni dati nel 2026 coinvolge sistemi AI", summary: "Quasi la metà delle violazioni dati aziendali nel 2026 ha come vettore un sistema AI mal configurato.", category: "AI & Sicurezza", sourceUrl: "https://gartner.com", sourceName: "Gartner" },
  ];

  const items = (newsData && newsData.length > 0 ? newsData : fallbackNews) as Array<{
    id: number; title: string; summary: string; category: string; sourceUrl: string; sourceName: string;
  }>;

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="news-card p-5 animate-pulse">
            <div className="h-3 rounded mb-3" style={{ background: C.surface2, width: "40%" }} />
            <div className="h-4 rounded mb-2" style={{ background: C.surface2, width: "90%" }} />
            <div className="h-3 rounded" style={{ background: C.surface2, width: "70%" }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {items.slice(0, 20).map((item, i) => {
        const colorSet = NEWS_COLORS[i % NEWS_COLORS.length];
        const num = String(i + 1).padStart(2, "0");
        return (
          <FadeUp key={item.id} delay={i * 0.03}>
            <div className="news-card h-full p-5 group flex flex-col">
              <div className="flex items-start gap-3 mb-3">
                <span className="editorial-tag flex-shrink-0 mt-0.5" style={{ color: C.muted }}>{num}</span>
                <span
                  className="inline-block px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0"
                  style={{ background: colorSet.bg, color: colorSet.color }}
                >
                  {item.category}
                </span>
              </div>
              <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                <h3
                  className="text-sm font-bold leading-snug mb-2 transition-colors hover:text-[#00b4a0]"
                  style={{ color: C.navy, fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {item.title}
                </h3>
                <p className="text-xs leading-relaxed mb-3" style={{ color: C.slate, fontFamily: "'DM Sans', sans-serif" }}>
                  {item.summary}
                </p>
              </a>
              <div className="flex items-center justify-between mt-auto pt-3 border-t" style={{ borderColor: C.border }}>
                <span className="text-xs" style={{ color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>{item.sourceName}</span>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(item.sourceUrl)}`}
                    target="_blank" rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-all hover:scale-105"
                    style={{ background: "#0077b5", color: "#fff" }}
                    title="Condividi su LinkedIn"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    <span className="hidden sm:inline">LinkedIn</span>
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(item.title + ' — via @IDEASMART_AI')}&url=${encodeURIComponent(item.sourceUrl)}`}
                    target="_blank" rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-all hover:scale-105"
                    style={{ background: "#000", color: "#fff" }}
                    title="Condividi su X"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    <span className="hidden sm:inline">X</span>
                  </a>
                </div>
              </div>
            </div>
          </FadeUp>
        );
      })}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Home() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: (data) => {
      if ((data as any).alreadySubscribed) {
        toast.info("Sei già iscritto alla newsletter IDEASMART!");
      } else {
        setSubscribed(true);
        toast.success("Iscrizione completata! Benvenuto in IDEASMART.");
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
    <div className="min-h-screen" style={{ background: "#fafafa" }}>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden" style={{ background: "#ffffff" }}>
        {/* Background image */}
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="Rete neurale AI - Osservatorio sull'Innovazione AI Italiana" className="w-full h-full object-cover opacity-5" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, #ffffff 0%, #f0f9f8 60%, #fafafa 100%)` }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          <FadeUp>
            {/* Issue badge */}
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border" style={{ borderColor: `${C.teal}40`, background: `${C.teal}12` }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.teal }} />
              <span className="editorial-tag" style={{ color: C.teal }}>
                Osservatorio sull'Innovazione AI Italiana
              </span>
              <span className="editorial-tag" style={{ color: C.muted }}>N° 03 — Marzo 2026</span>
            </div>

            {/* Main title */}
            <h1
              className="text-6xl sm:text-7xl lg:text-8xl font-black leading-none tracking-tight mb-6"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: C.navy }}
            >
              IDEA<span style={{ color: C.teal }}>SMART</span>
            </h1>
            <p
              className="text-base sm:text-lg tracking-widest uppercase mb-8"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: C.muted }}
            >
              L'Analisi Mensile &nbsp;·&nbsp; AI for Business
            </p>

            {/* Description */}
            <p className="text-lg sm:text-xl leading-relaxed max-w-2xl mb-10" style={{ fontFamily: "'DM Sans', sans-serif", color: C.slate }}>
              <strong style={{ color: C.navy }}>IDEASMART</strong> è la startup italiana di tecnologia e innovazione
              che ogni mese analizza, testa e seleziona le realtà più promettenti
              dell'ecosistema AI per il business. La nostra redazione porta alla luce
              le soluzioni che stanno ridefinendo il modo di lavorare, investire e crescere.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-8 mb-10">
              {[
                { value: "N° 03", label: "Marzo 2026" },
                { value: "4", label: "Startup analizzate" },
                { value: "100%", label: "AI-driven" },
              ].map((s) => (
                <div key={s.label} className="flex items-baseline gap-2">
                  <span className="text-2xl font-black" style={{ color: C.teal, fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</span>
                  <span className="text-sm" style={{ color: C.muted }}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => document.getElementById("editoriale")?.scrollIntoView({ behavior: "smooth" })}
                className="px-6 py-3 rounded-lg text-sm font-bold transition-all duration-200 hover:scale-105 text-white"
                style={{ background: C.teal, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Leggi l'analisi del mese ↓
              </button>
              <button
                onClick={() => document.getElementById("newsletter")?.scrollIntoView({ behavior: "smooth" })}
                className="px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{ border: `1.5px solid ${C.border}`, color: C.slate, fontFamily: "'DM Sans', sans-serif", background: "#fff" }}
              >
                Abbonati alla newsletter →
              </button>
            </div>
          </FadeUp>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style={{ color: C.muted }}>
          <span className="editorial-tag">SCORRI</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-0.5 h-8 rounded-full"
            style={{ background: `linear-gradient(to bottom, ${C.teal}80, transparent)` }}
          />
        </div>
      </section>

      {/* ── ULTIME NEWS AI (dinamiche dal DB) ──────────────────────────── */}
      <section id="news" className="border-t" style={{ borderColor: C.border, background: "#fff" }}>
        {/* Category bar */}
        <div className="border-b" style={{ borderColor: C.border, background: C.surface1 }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.teal }} />
              <span className="editorial-tag" style={{ color: C.teal }}>◆ Ultime News AI</span>
              <span className="editorial-tag" style={{ color: C.muted }}>Aggiornato ogni giorno</span>
            </div>
            <span className="editorial-tag hidden sm:block" style={{ color: C.muted }}>Selezione editoriale IDEASMART</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <FadeUp>
            <h2 className="text-2xl sm:text-3xl font-black mb-2" style={{ color: C.navy, fontFamily: "'Space Grotesk', sans-serif" }}>
              I 20 eventi AI più significativi della settimana
            </h2>
            <p className="text-sm mb-8" style={{ color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>
              La selezione editoriale di IDEASMART sui fatti che stanno ridefinendo il panorama dell'intelligenza artificiale globale.
            </p>
          </FadeUp>

          <NewsGrid />

          {/* ── ADVERTISING BANNER ──────────────────────────────────────────────────────────────────────────── */}
          <div className="mt-12">
            <div
              className="relative rounded-2xl overflow-hidden border"
              style={{ borderColor: `${C.teal}30`, background: `linear-gradient(135deg, ${C.teal}08 0%, ${C.blue}08 100%)` }}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-8">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${C.teal}, ${C.blue})` }}
                  >
                    <span className="text-white font-black text-lg">AD</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: C.muted }}>Spazio Pubblicitario</p>
                    <p className="text-base font-bold" style={{ color: C.navy, fontFamily: "'Space Grotesk', sans-serif" }}>
                      La tua startup AI qui — Raggiungi 1.857 decision maker italiani
                    </p>
                    <p className="text-xs mt-1" style={{ color: C.slate }}>
                      Newsletter settimanale · Sito editoriale · Audience qualificata
                    </p>
                  </div>
                </div>
                <a
                  href="mailto:ac@foolfarm.com?subject=Advertising%20IDEASMART&body=Ciao%2C%20sono%20interessato%20a%20uno%20spazio%20pubblicitario%20su%20IDEASMART."
                  className="flex-shrink-0 px-6 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105 hover:shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${C.teal}, ${C.blue})`, color: "#fff" }}
                >
                  Contattaci →
                </a>
              </div>
              {/* Decorative tag */}
              <div
                className="absolute top-3 right-3 px-2 py-0.5 rounded text-xs font-bold"
                style={{ background: `${C.teal}20`, color: C.teal }}
              >
                Advertising
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EDITORIALE ──────────────────────────────────────────────────────── */}
      <section id="editoriale" className="border-t" style={{ borderColor: C.border, background: C.surface1 }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <FadeUp>
            <p className="editorial-tag mb-4" style={{ color: C.teal }}>◆ Editoriale</p>
            <h2
              className="text-3xl sm:text-4xl font-black leading-tight mb-8 max-w-3xl"
              style={{ color: C.navy, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              L'AI italiana non è un fenomeno di nicchia.
              <br />
              <span style={{ color: C.teal }}>Sta cambiando le regole del gioco.</span>
            </h2>
          </FadeUp>

          <div className="grid lg:grid-cols-3 gap-12">
            <FadeUp delay={0.1} className="lg:col-span-2">
              <div className="space-y-5 leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <p style={{ color: C.slate }}>
                  Quando abbiamo fondato IDEASMART, la domanda che ci ponevamo era semplice:
                  dove sta succedendo davvero qualcosa di interessante nell'ecosistema AI italiano?
                  Non nei comunicati stampa, non nei convegni, ma nei prodotti concreti che le aziende
                  usano ogni giorno per assumere, proteggere dati, comunicare e prendere decisioni.
                </p>
                <p style={{ color: C.slate }}>
                  Questo mese abbiamo analizzato quattro startup che ci hanno convinto. Non perché abbiano
                  raccolto il round più grande o abbiano il fondatore più famoso, ma perché hanno costruito
                  qualcosa di reale: una tecnologia proprietaria, un modello di business sostenibile,
                  un problema concreto risolto in modo intelligente.
                </p>
                <p style={{ color: C.slate }}>
                  Da <strong style={{ color: C.navy }}>FoolTalent</strong>, che sta ridefinendo il recruiting
                  con l'AI, a <strong style={{ color: C.navy }}>FoolShare</strong>, che ha costruito la data room
                  più avanzata del mercato italiano. Da <strong style={{ color: C.navy }}>Fragmentalis</strong>,
                  con la sua tecnologia brevettata di comunicazione quantum-resistant, a{" "}
                  <strong style={{ color: C.navy }}>PollCast</strong>, che trasforma l'intelligenza collettiva
                  in market intelligence. Quattro storie diverse, un denominatore comune: l'AI come leva
                  di vantaggio competitivo reale.
                </p>
              </div>

              {/* Firma */}
              <div className="flex items-center gap-4 mt-8 pt-6 border-t" style={{ borderColor: C.border }}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 text-white"
                  style={{ background: `linear-gradient(135deg, ${C.teal}, ${C.blue})` }}
                >
                  IS
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: C.navy, fontFamily: "'Space Grotesk', sans-serif" }}>
                    La Redazione IDEASMART
                  </p>
                  <p className="text-xs" style={{ color: C.muted }}>Startup di Tecnologia &amp; Innovazione — AI for Business</p>
                </div>
              </div>
            </FadeUp>

            {/* Index */}
            <FadeUp delay={0.2}>
              <div className="rounded-2xl p-6 border" style={{ background: "#fff", borderColor: C.border }}>
                <p className="editorial-tag mb-5" style={{ color: C.muted }}>◆ In questo numero</p>
                <div className="space-y-1">
                  {[
                    { n: "01", cat: "Reportage", title: "FoolTalent: l'AI che scova i talenti prima degli altri.", id: "fooltalent", color: C.teal },
                    { n: "02", cat: "Analisi", title: "FoolShare: la fortezza digitale per i dati che contano.", id: "foolshare", color: C.blue },
                    { n: "03", cat: "Inchiesta", title: "Fragmentalis: la comunicazione a prova di spia.", id: "fragmentalis", color: C.teal },
                    { n: "04", cat: "Focus", title: "PollCast: l'intelligenza collettiva che prevede i trend.", id: "pollcast", color: C.orange },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" })}
                      className="w-full text-left p-3 rounded-xl transition-colors group"
                      style={{ background: "transparent" }}
                      onMouseEnter={e => (e.currentTarget.style.background = C.surface1)}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <div className="flex items-start gap-3">
                        <span className="editorial-tag flex-shrink-0 mt-0.5" style={{ color: C.muted }}>{item.n}</span>
                        <div>
                          <p className="editorial-tag mb-1" style={{ color: item.color }}>{item.cat}</p>
                          <p className="text-xs leading-snug" style={{ color: C.slate }}>{item.title}</p>
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
      <section id="fooltalent" className="border-t" style={{ borderColor: C.border, background: "#fff" }}>
        <SectionHeader number="01" category="Reportage · AI Recruiting" categoryColor={C.teal} title="FoolTalent: l'AI che scova i talenti prima degli altri." />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <FadeUp>
              <p className="text-sm font-semibold mb-4" style={{ color: C.teal, fontFamily: "'DM Sans', sans-serif" }}>
                Come una startup milanese sta rivoluzionando il processo di selezione del personale con l'intelligenza artificiale.
              </p>
              <div className="space-y-4 leading-relaxed mb-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <p style={{ color: C.slate }}>
                  Il problema del recruiting nelle startup italiane è sempre lo stesso: troppo tempo perso
                  a leggere CV irrilevanti, troppo poco a parlare con i candidati giusti.{" "}
                  <strong style={{ color: C.navy }}>FoolTalent</strong> ha deciso di affrontarlo con un approccio
                  radicalmente diverso: la sua AI non filtra per parole chiave, ma analizza ogni candidatura
                  in profondità e assegna un punteggio di compatibilità reale.
                </p>
                <p style={{ color: C.slate }}>
                  Nella nostra analisi, quello che ci ha colpito è la granularità del punteggio: l'AI non
                  si limita a dire "compatibile" o "non compatibile", ma spiega perché, indicando i punti
                  di forza e le lacune di ogni candidato rispetto al profilo cercato.
                </p>
              </div>

              <blockquote className="quote-block mb-6">
                <p className="text-sm italic" style={{ color: C.teal }}>
                  "L'AI non sostituisce il recruiter. Lo libera dal rumore, così può concentrarsi sul segnale."
                </p>
              </blockquote>

              <div>
                <FeatureItem color={C.teal} bgColor={C.tealLight} text="Valutazione automatica AI con punteggio percentuale di compatibilità per ogni candidatura" />
                <FeatureItem color={C.teal} bgColor={C.tealLight} text="Shortlist intelligente: il sistema mostra solo i profili più compatibili, ordinati per rilevanza" />
                <FeatureItem color={C.teal} bgColor={C.tealLight} text="Database talenti integrato con ricerca avanzata per competenze, settore ed esperienza" />
                <FeatureItem color={C.teal} bgColor={C.tealLight} text="Dashboard analytics con trend candidature in tempo reale e reportistica avanzata" />
              </div>

              <div className="grid grid-cols-3 gap-3 mt-6">
                <StatBlock value="78" label="Candidature gestite" color={C.teal} />
                <StatBlock value="100%" label="Valutate da AI" color={C.teal} />
                <StatBlock value="60%" label="Punteggio medio" color={C.teal} />
              </div>

              <div className="flex flex-wrap gap-3 mt-8">
                <a href="https://fooltalent.com" target="_blank" rel="noopener noreferrer" className="btn-primary">
                  Scopri FoolTalent →
                </a>
                <a href="https://fooltalent.com" target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  Vedi gli annunci →
                </a>
              </div>
            </FadeUp>

            <FadeUp delay={0.15}>
              <div className="rounded-2xl overflow-hidden article-card">
                <img src={FOOLTALENT_IMG} alt="FoolTalent - AI Recruiting Platform" className="w-full h-60 object-cover" loading="lazy" />
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── FOOLSHARE ───────────────────────────────────────────────────────── */}
      <section id="foolshare" className="border-t" style={{ borderColor: C.border, background: C.surface1 }}>
        <SectionHeader number="02" category="Analisi · Data Room & Fundraising" categoryColor={C.blue} title="FoolShare: la fortezza digitale per i dati che contano." />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <FadeUp>
              <p className="text-sm font-semibold mb-4" style={{ color: C.blue, fontFamily: "'DM Sans', sans-serif" }}>
                Abbiamo testato la piattaforma che unisce data room sicure, NDA digitali e un sistema operativo per il fundraising.
              </p>
              <div className="space-y-4 leading-relaxed mb-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <p style={{ color: C.slate }}>
                  La condivisione di documenti sensibili è il tallone d'Achille di molte aziende.{" "}
                  <strong style={{ color: C.navy }}>FoolShare</strong> risponde con una piattaforma che non si limita
                  a "proteggere" i documenti, ma li trasforma in uno strumento di intelligence: ogni link condiviso
                  è tracciabile — chi lo ha aperto, per quanti minuti, quante volte, da quale città.
                </p>
                <p style={{ color: C.slate }}>
                  Il modulo Fundraising OS è quello che ci ha colpito di più. Le startup possono aprire una
                  Project Room pubblica, presentarsi agli investitori e raccogliere soft commitment in modo
                  strutturato. L'AI Agent integrato analizza automaticamente tutti i documenti caricati.
                </p>
              </div>

              <blockquote className="quote-block mb-6" style={{ borderLeftColor: C.blue }}>
                <p className="text-sm italic" style={{ color: C.blue }}>
                  "Non è solo una data room. È un sistema operativo per il fundraising. La differenza è sostanziale."
                </p>
              </blockquote>

              <div className="rounded-xl p-4 mb-6 border" style={{ background: C.blueLight, borderColor: `${C.blue}20` }}>
                <p className="text-sm" style={{ color: C.slate, fontFamily: "'DM Sans', sans-serif" }}>
                  <span style={{ color: C.blue }}>🎁 Prova gratuita 7 giorni</span> — nessuna carta di credito richiesta.<br />
                  Piani da <strong style={{ color: C.navy }}>€49/mese</strong> (Premium) · <strong style={{ color: C.navy }}>€99/mese</strong> (Project Room + Fundraising OS)
                </p>
              </div>

              <div>
                <FeatureItem color={C.blue} bgColor={C.blueLight} text="Crittografia 256-bit su tutti i file — GDPR compliant, 99.9% uptime garantito" />
                <FeatureItem color={C.blue} bgColor={C.blueLight} text="NDA digitali legalmente vincolanti con template bilingue IT/EN incluso" />
                <FeatureItem color={C.blue} bgColor={C.blueLight} text="Analytics avanzate: geolocalizzazione visitatori, grafici settimanali, visualizzazioni in tempo reale" />
                <FeatureItem color={C.blue} bgColor={C.blueLight} text="AI Agent integrato: analisi automatica dei documenti e risposte immediate sui contenuti" />
              </div>

              <div className="flex flex-wrap gap-3 mt-8">
                <a href="https://foolshare.xyz" target="_blank" rel="noopener noreferrer" className="btn-primary">
                  Inizia gratis →
                </a>
                <a href="https://foolshare.xyz" target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  Scopri i piani →
                </a>
              </div>
            </FadeUp>

            <FadeUp delay={0.15}>
              <div className="rounded-2xl overflow-hidden article-card mb-6">
                <img src={FOOLSHARE_IMG} alt="FoolShare - Data Room e Fundraising" className="w-full h-60 object-cover" loading="lazy" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { title: "Condivisione Sicura", desc: "Link protetti, accesso per email, blocco download" },
                  { title: "Fundraising OS", desc: "Project Room, investor tracking, soft commitment" },
                  { title: "Data Room Pro", desc: "Cartelle strutturate, permessi granulari, due diligence" },
                ].map((f) => (
                  <div key={f.title} className="rounded-xl p-3 border text-center" style={{ background: "#fff", borderColor: C.border }}>
                    <p className="text-xs font-bold mb-1" style={{ color: C.blue, fontFamily: "'Space Grotesk', sans-serif" }}>{f.title}</p>
                    <p className="text-xs leading-snug" style={{ color: C.muted }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── FRAGMENTALIS ────────────────────────────────────────────────────── */}
      <section id="fragmentalis" className="border-t" style={{ borderColor: C.border, background: "#fff" }}>
        <SectionHeader number="03" category="Inchiesta · Cybersecurity & Comunicazione" categoryColor={C.teal} title="Fragmentalis: la comunicazione a prova di spia (e di computer quantistici)." />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <FadeUp>
              <p className="text-sm font-semibold mb-4" style={{ color: C.teal, fontFamily: "'DM Sans', sans-serif" }}>
                La tecnologia brevettata IT/EU/USA che rende matematicamente impossibile intercettare le comunicazioni aziendali.
              </p>
              <div className="space-y-4 leading-relaxed mb-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <p style={{ color: C.slate }}>
                  Mentre tutti parlano di crittografia end-to-end, <strong style={{ color: C.navy }}>Fragmentalis</strong>{" "}
                  ha già spostato il campo di gioco nel futuro. La sua tecnologia brevettata "polverizza" i dati —
                  li frammenta su nodi distribuiti, rendendo matematicamente impossibile ricostruirli. Il prodotto
                  di punta, <strong style={{ color: C.navy }}>StreamSafer Communicator</strong>, è già usato da CDA
                  aziendali, studi legali e istituzioni finanziarie.
                </p>
                <p style={{ color: C.slate }}>
                  Con l'avvento dei computer quantistici, che renderanno obsoleta la crittografia tradizionale,
                  la soluzione di Fragmentalis diventa non solo interessante, ma necessaria. GDPR, DORA e NIS2
                  compliant. 6 prodotti verticali per ogni settore.
                </p>
              </div>

              <blockquote className="quote-block mb-6">
                <p className="text-sm italic" style={{ color: C.teal }}>
                  "Non esiste un server centrale. I dati vengono polverizzati. Per ricostruirli, bisognerebbe accedere a tutti i nodi contemporaneamente. Matematicamente impossibile."
                </p>
              </blockquote>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <StatBlock value="0" label="Server centrale" color={C.teal} />
                <StatBlock value="100%" label="Controllo dati" color={C.teal} />
                <StatBlock value="3" label="Brevetti IT/EU/US" color={C.teal} />
              </div>

              <div className="flex flex-wrap gap-3">
                <a href="https://fragmentalis.com" target="_blank" rel="noopener noreferrer" className="btn-primary">
                  Richiedi Demo →
                </a>
                <a href="https://fragmentalis.com" target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  Scopri StreamSafer →
                </a>
              </div>
            </FadeUp>

            <FadeUp delay={0.15}>
              <div className="rounded-2xl overflow-hidden article-card mb-6">
                <img src={FRAGMENTALIS_IMG} alt="Fragmentalis - Comunicazione Quantum-Resistant" className="w-full h-60 object-cover" loading="lazy" />
              </div>
              <div>
                <FeatureItem color={C.teal} bgColor={C.tealLight} text="Nessun server centrale — architettura distribuita peer-to-peer brevettata" />
                <FeatureItem color={C.teal} bgColor={C.tealLight} text="Quantum-resistant: resistente anche ai futuri computer quantistici" />
                <FeatureItem color={C.teal} bgColor={C.tealLight} text="6 prodotti verticali: Communicator, Vault, Shield, Bridge, Guard, Relay" />
                <FeatureItem color={C.teal} bgColor={C.tealLight} text="Compliance totale: GDPR, DORA, NIS2 — audit trail completo" />
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── POLLCAST ────────────────────────────────────────────────────────── */}
      <section id="pollcast" className="border-t" style={{ borderColor: C.border, background: C.surface1 }}>
        <SectionHeader number="04" category="Focus · Market Intelligence" categoryColor={C.orange} title="PollCast: l'intelligenza collettiva che prevede i trend di mercato." />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <FadeUp>
              <p className="text-sm font-semibold mb-4" style={{ color: C.orange, fontFamily: "'DM Sans', sans-serif" }}>
                La piattaforma gratuita che trasforma le previsioni della community in strumento di market intelligence per le aziende.
              </p>
              <div className="space-y-4 leading-relaxed mb-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <p style={{ color: C.slate }}>
                  E se le previsioni di mercato non fossero più un'esclusiva per pochi analisti?{" "}
                  <strong style={{ color: C.navy }}>PollCast</strong> ha lanciato una piattaforma gratuita dove
                  chiunque può creare e votare previsioni su qualsiasi tema — business, tech, sport, politica
                  o trend di mercato. I risultati aggregati, su migliaia di voti, tendono a essere
                  sorprendentemente accurati.
                </p>
                <p style={{ color: C.slate }}>
                  Per le aziende, l'applicazione più interessante è la market intelligence: monitorare le
                  previsioni della community su temi rilevanti offre un termometro in tempo reale del sentiment
                  del mercato. Un vantaggio informativo che fino a ieri richiedeva costose ricerche.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <StatBlock value="2.974" label="Voti totali" color={C.orange} />
                <StatBlock value="10" label="Previsioni attive" color={C.orange} />
              </div>

              <div className="flex flex-wrap gap-3">
                <a href="https://pollcast.online" target="_blank" rel="noopener noreferrer" className="btn-primary">
                  Vota le previsioni →
                </a>
                <a href="https://pollcast.online" target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  Crea una previsione →
                </a>
              </div>
            </FadeUp>

            <FadeUp delay={0.15}>
              <div className="rounded-2xl overflow-hidden article-card mb-6">
                <img src={POLLCAST_IMG} alt="PollCast - Market Intelligence Platform" className="w-full h-48 object-cover" loading="lazy" />
              </div>

              <p className="editorial-tag mb-4" style={{ color: C.muted }}>◆ Previsioni di tendenza</p>
              <div className="space-y-3">
                <PollBar label="Bitcoin supererà i $200,000 entro il 2026?" category="Crypto" percentage={61} votes={511} color={C.orange} bgColor={C.orangeLight} />
                <PollBar label="ChatGPT-5 sarà rilasciato entro giugno 2026?" category="Tecnologia" percentage={75} votes={370} color={C.orange} bgColor={C.orangeLight} />
                <PollBar label="Tesla raggiungerà i $500 per azione entro fine 2026?" category="Economia" percentage={57} votes={412} color={C.orange} bgColor={C.orangeLight} />
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── FOOLFARM BANNER ─────────────────────────────────────────────────── */}
      <section className="border-t" style={{ borderColor: C.border, background: C.navy }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <FadeUp>
            <p className="editorial-tag mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>◆ Da dove nasce l'innovazione</p>
            <h2 className="text-3xl font-black text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              FoolFarm AI Innovation Studios
            </h2>
            <p className="text-base max-w-2xl mx-auto mb-8 leading-relaxed" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans', sans-serif" }}>
              IDEASMART è un progetto editoriale indipendente nato all'interno di{" "}
              <strong className="text-white">FoolFarm</strong>, il primo startup studio AI-native italiano.
              La nostra missione è dare voce all'ecosistema, con analisi imparziali e approfondite.
            </p>
            <a
              href="https://foolfarm.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all hover:scale-105 text-white"
              style={{ background: C.teal, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Scopri FoolFarm →
            </a>
          </FadeUp>
        </div>
      </section>

      {/* ── NEWSLETTER SIGNUP ───────────────────────────────────────────────── */}
      <section id="newsletter" className="border-t" style={{ borderColor: C.border, background: "#fff" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <FadeUp>
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border" style={{ borderColor: `${C.teal}30`, background: C.tealLight }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.teal }} />
              <span className="editorial-tag" style={{ color: C.teal }}>Newsletter Mensile</span>
            </div>
            <h2 className="text-4xl font-black mb-4" style={{ color: C.navy, fontFamily: "'Space Grotesk', sans-serif" }}>
              Ricevi l'analisi mensile
              <br />
              <span style={{ color: C.teal }}>direttamente nella tua inbox.</span>
            </h2>
            <p className="text-base mb-10 leading-relaxed" style={{ color: C.slate, fontFamily: "'DM Sans', sans-serif" }}>
              Ogni mese selezioniamo le 4 startup AI più promettenti per il business italiano.
              Analisi approfondite, dati reali, nessuno spam.
            </p>

            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-3 max-w-md mx-auto">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Il tuo nome (opzionale)"
                  className="w-full px-4 py-3 rounded-lg text-sm border focus:outline-none transition-colors"
                  style={{ borderColor: C.border, background: C.surface1, color: C.navy, fontFamily: "'DM Sans', sans-serif" }}
                  onFocus={e => (e.target.style.borderColor = C.teal)}
                  onBlur={e => (e.target.style.borderColor = C.border)}
                />
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="La tua email aziendale"
                    required
                    className="flex-1 px-4 py-3 rounded-lg text-sm border focus:outline-none transition-colors"
                    style={{ borderColor: C.border, background: C.surface1, color: C.navy, fontFamily: "'DM Sans', sans-serif" }}
                    onFocus={e => (e.target.style.borderColor = C.teal)}
                    onBlur={e => (e.target.style.borderColor = C.border)}
                  />
                  <button
                    type="submit"
                    disabled={subscribeMutation.isPending}
                    className="px-6 py-3 rounded-lg text-sm font-bold transition-all hover:scale-105 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed text-white"
                    style={{ background: C.navy, fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {subscribeMutation.isPending ? "Iscrizione..." : "Abbonati gratis →"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-3 p-4 rounded-xl border" style={{ background: C.tealLight, borderColor: `${C.teal}30` }}>
                <span style={{ color: C.teal }}>✓</span>
                <p className="text-sm" style={{ color: C.navy, fontFamily: "'DM Sans', sans-serif" }}>
                  Perfetto! Ti invieremo la prossima analisi mensile.
                </p>
              </div>
            )}

            <p className="text-xs mt-4" style={{ color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>
              Gratuita · Mensile · Nessuno spam · Disiscrizione in un click
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="border-t" style={{ borderColor: C.border, background: C.surface1 }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="text-2xl font-black mb-2" style={{ color: C.navy, fontFamily: "'Space Grotesk', sans-serif" }}>
                IDEA<span style={{ color: C.teal }}>SMART</span>
              </div>
              <p className="editorial-tag mb-4" style={{ color: C.muted }}>Startup di Tecnologia &amp; Innovazione</p>
              <p className="text-sm leading-relaxed" style={{ color: C.slate, fontFamily: "'DM Sans', sans-serif" }}>
                L'Osservatorio sull'Innovazione AI Italiana. Ogni mese analizziamo le startup AI
                più promettenti per il business.
              </p>
            </div>

            {/* Startup analizzate */}
            <div>
              <p className="editorial-tag mb-4" style={{ color: C.muted }}>Startup analizzate</p>
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
                    className="block text-sm transition-colors"
                    style={{ color: C.slate, fontFamily: "'DM Sans', sans-serif" }}
                    onMouseEnter={e => (e.currentTarget.style.color = C.navy)}
                    onMouseLeave={e => (e.currentTarget.style.color = C.slate)}
                  >
                    {s.name} →
                  </a>
                ))}
              </div>
            </div>

            {/* Powered by */}
            <div>
              <p className="editorial-tag mb-4" style={{ color: C.muted }}>Powered by</p>
              <a
                href="https://foolfarm.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm transition-colors mb-2"
                style={{ color: C.slate, fontFamily: "'DM Sans', sans-serif" }}
                onMouseEnter={e => (e.currentTarget.style.color = C.navy)}
                onMouseLeave={e => (e.currentTarget.style.color = C.slate)}
              >
                FoolFarm AI Innovation Studios →
              </a>
              <p className="text-xs" style={{ color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>
                Il primo startup studio AI-native italiano.
              </p>
            </div>
          </div>

          <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: C.border }}>
            <p className="text-xs" style={{ color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>
              © 2026 IDEASMART — Startup di Tecnologia &amp; Innovazione. Tutti i diritti riservati.
            </p>
            <p className="editorial-tag" style={{ color: C.muted }}>
              AI for Business · N° 03 · Marzo 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
