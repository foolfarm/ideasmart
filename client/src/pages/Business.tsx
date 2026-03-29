/**
 * IDEASMART BUSINESS — Pagina servizi premium
 * Layout editoriale coerente con il resto del sito (stile Il Sole 24 Ore).
 * Palette: bianco carta (#faf8f3), inchiostro (#1a1a1a), teal (#1a1a1a), arancio (#2a2a2a).
 * Due offerte: A) Piattaforma AI Agentica · B) Consulenza & Advisory
 */

import { useState } from "react";
import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import Navbar from "@/components/Navbar";

// ── Palette ───────────────────────────────────────────────────────────────────
const INK     = "#1a1a1a";
const TEAL    = "#1a1a1a";
const TEAL_LT = "#e6f4f1";
const ORANGE  = "#2a2a2a";
const ORANGE_LT = "#fff0e6";
const GOLD    = "#c9a84c";
const GOLD_LT = "#fdf8ec";
const PAPER   = "#faf8f3";
const MUTED   = "#1a1a1a99";

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDateIT(date: Date) {
  return date.toLocaleDateString("it-IT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function Divider({ thick = false }: { thick?: boolean }) {
  return <div className={`w-full ${thick ? "border-t-4" : "border-t"} border-[#1a1a1a]`} />;
}

function ThinDivider() {
  return <div className="w-full border-t border-[#1a1a1a]/15" />;
}

function SectionBadge({
  label, color = TEAL, bg = TEAL_LT,
}: { label: string; color?: string; bg?: string }) {
  return (
    <span
      className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm"
      style={{ background: bg, color, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
    >
      {label}
    </span>
  );
}

// ── Dati Piattaforma (Offerta A) ──────────────────────────────────────────────
const PLATFORM_FEATURES = [
  {
    icon: "⚡",
    title: "Aggiornamento 24/7",
    desc: "Il sistema agentico monitora oltre 450 fonti globali in tempo reale. Ogni mattina alle 00:00 CET trovi il tuo briefing personalizzato già pronto.",
  },
  {
    icon: "🔬",
    title: "Algoritmo Verify™",
    desc: "Ogni dato viene incrociato su almeno 3 fonti indipendenti prima di essere pubblicato. Zero notizie non verificate, zero allarmi falsi.",
  },
  {
    icon: "🎯",
    title: "Personalizzazione verticale",
    desc: "Scegli le tue aree di interesse: AI Innovation, Venture Capital, M&A, Startup Ecosystem. Il feed si adatta al tuo profilo decisionale.",
  },
  {
    icon: "📊",
    title: "Executive Report quotidiani",
    desc: "Non solo notizie: ogni giorno 20+ analisi strutturate con executive summary, key findings e implicazioni strategiche pronte per il board.",
  },
  {
    icon: "🔗",
    title: "Intelligence LinkedIn",
    desc: "I key insight del giorno sintetizzati in formato LinkedIn da Andrea Cinelli, Opinion Leader & Editorialista IdeaSmart.",
  },
  {
    icon: "📧",
    title: "Newsletter settimanale",
    desc: "Ogni venerdì mattina: i 5 report più rilevanti della settimana, curati dall'Intelligence Curator agentico. Direttamente nella tua inbox.",
  },
];

const PLATFORM_PLANS = [
  {
    name: "Free",
    price: "Gratis",
    period: "",
    badge: null,
    color: INK,
    bg: "#f1f5f9",
    features: [
      "Accesso alle notizie AI NEWS e STARTUP NEWS",
      "5 Executive Report al mese",
      "Newsletter settimanale",
      "Punto del Giorno (post LinkedIn)",
    ],
    cta: "Inizia gratis",
    href: "/",
    outline: true,
  },
  {
    name: "Research Pro",
    price: "€49",
    period: "/mese",
    badge: "PIÙ POPOLARE",
    color: TEAL,
    bg: TEAL_LT,
    features: [
      "Tutti i contenuti Free",
      "20+ Executive Report al giorno",
      "Ricerche di mercato illimitate",
      "Feed personalizzato per settore",
      "Alert real-time su M&A e VC deals",
      "Archivio storico 12 mesi",
    ],
    cta: "Prova 14 giorni gratis",
    href: "mailto:business@ideasmart.ai?subject=Research Pro",
    outline: false,
  },
  {
    name: "Enterprise",
    price: "Su misura",
    period: "",
    badge: null,
    color: GOLD,
    bg: GOLD_LT,
    features: [
      "Tutti i contenuti Research Pro",
      "Feed white-label per il tuo team",
      "API access ai dati IdeaSmart",
      "Briefing personalizzati per il board",
      "Integrazione Slack / Teams",
      "Account manager dedicato",
    ],
    cta: "Contattaci",
    href: "mailto:business@ideasmart.ai?subject=Enterprise",
    outline: true,
  },
];

// ── Dati Advisory (Offerta B) ─────────────────────────────────────────────────
const ADVISORY_SERVICES = [
  {
    id: "ai-strategy",
    tag: "AI STRATEGY",
    icon: "◈",
    color: TEAL,
    bg: TEAL_LT,
    title: "AI Innovation Strategy",
    subtitle: "Trasformazione AI per board e C-Level",
    desc: "Supportiamo board e C-Level nella definizione di strategie di adozione dell'intelligenza artificiale: roadmap tecnologica, governance dei dati, identificazione dei casi d'uso ad alto impatto e valutazione del ROI. Non teorie — piani operativi costruiti con chi ha già guidato trasformazioni simili.",
    deliverables: ["AI Readiness Assessment", "Roadmap strategica 12-36 mesi", "Business case e ROI modelling", "Governance framework"],
  },
  {
    id: "ma-advisory",
    tag: "M&A ADVISORY",
    icon: "◉",
    color: ORANGE,
    bg: ORANGE_LT,
    title: "M&A Advisory AI & Tech",
    subtitle: "Due diligence e valutazione di asset tecnologici",
    desc: "Supporto specializzato nelle operazioni di M&A nel settore tech e AI: due diligence tecnologica, valutazione della proprietà intellettuale, analisi del team e del prodotto, identificazione di target strategici e supporto nelle negoziazioni. Esperienza diretta in oltre 40 operazioni completate.",
    deliverables: ["Tech Due Diligence", "IP & Asset Valuation", "Target Identification", "Deal Structuring Support"],
  },
  {
    id: "partnership",
    tag: "PARTNERSHIP TECH",
    icon: "◎",
    color: GOLD,
    bg: GOLD_LT,
    title: "Ricerca di Partnership Tecnologiche",
    subtitle: "Identificazione e scouting di partner strategici",
    desc: "Identifichiamo e valutiamo opportunità di partnership tecnologica per aziende che vogliono accelerare l'adozione AI o espandere il proprio ecosistema. Dall'analisi del mercato all'introduzione diretta: sfruttiamo la nostra rete di 100+ operatori del settore per connettere le realtà giuste.",
    deliverables: ["Partner Landscape Mapping", "Shortlist qualificata", "Introduzioni dirette", "Term sheet support"],
  },
  {
    id: "vc-research",
    tag: "VC RESEARCH",
    icon: "◇",
    color: "#1a1a1a",
    bg: "#f0fdf4",
    title: "Venture Capital Research",
    subtitle: "Ricerche di mercato per decisioni di investimento",
    desc: "Ricerche verticali e personalizzate per fondi VC, family office e investitori istituzionali: analisi di settore, landscape competitivo, benchmark di valutazione, trend di mercato e identificazione delle opportunità di investimento più rilevanti nell'ecosistema AI e deeptech europeo.",
    deliverables: ["Sector Deep Dives", "Competitive Landscape", "Valuation Benchmarks", "Deal Flow Intelligence"],
  },
];

const ADVISORY_TEAM = [
  {
    initials: "B5",
    tag: "EX BIG 5",
    role: "AI Strategy & Corporate Transformation",
    bg: TEAL_LT,
    color: TEAL,
    detail: "Ex Partner di una delle prime cinque società di consulenza strategica globale. 25+ anni di advisory su trasformazione digitale e AI adoption per aziende Fortune 500.",
  },
  {
    initials: "IB",
    tag: "EX INVESTMENT BANKING",
    role: "M&A & Capital Markets",
    bg: ORANGE_LT,
    color: ORANGE,
    detail: "Ex Managing Director in una primaria investment bank europea. 30+ anni in operazioni M&A tech, IPO e capital markets. Deal value complessivo >€2 miliardi.",
  },
  {
    initials: "FX",
    tag: "FOUNDER · 3 EXIT",
    role: "Startup Strategy & Venture",
    bg: GOLD_LT,
    color: GOLD,
    detail: "Fondatore seriale con tre exit di successo nel settore SaaS e AI. Mentor di oltre 60 startup in portafoglio. Profonda conoscenza dell'ecosistema VC europeo.",
  },
  {
    initials: "VC",
    tag: "EX VENTURE CAPITAL",
    role: "VC Strategy & Portfolio Management",
    bg: "#f0fdf4",
    color: "#1a1a1a",
    detail: "Ex Partner fondatore di un fondo VC deeptech con €300M AUM. 18+ anni nell'ecosistema VC europeo. Portfolio di 50+ investimenti in AI, robotica e biotech.",
  },
];

const ADVISORY_FORMATS = [
  {
    icon: "📋",
    title: "Project-based",
    desc: "Ricerche e advisory su singoli progetti con deliverable definiti e timeline chiara. Ideale per due diligence, ricerche di mercato puntuali, scouting di partner.",
  },
  {
    icon: "🔄",
    title: "Retainer mensile",
    desc: "Presenza continuativa del team per supporto strategico ricorrente. Briefing mensili, alert su deal flow, accesso diretto agli advisor senior.",
  },
  {
    icon: "🏛️",
    title: "Board Advisory",
    desc: "Un senior advisor come membro dell'advisory board con presenza alle riunioni chiave. Il formato più intensivo per chi vuole un partner strategico a lungo termine.",
  },
];

// ── Componenti ────────────────────────────────────────────────────────────────

function ServiceAccordion({ service }: { service: typeof ADVISORY_SERVICES[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border-b cursor-pointer group"
      style={{ borderColor: `${INK}20` }}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-start justify-between gap-4 py-5">
        <div className="flex items-start gap-4 flex-1">
          <div
            className="w-10 h-10 rounded-sm flex items-center justify-center text-lg flex-shrink-0 mt-0.5"
            style={{ background: service.bg, color: service.color }}
          >
            {service.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <SectionBadge label={service.tag} color={service.color} bg={service.bg} />
            </div>
            <h3
              className="text-lg font-bold leading-tight"
              style={{ color: INK, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
            >
              {service.title}
            </h3>
            <p className="text-sm mt-0.5" style={{ color: MUTED, fontFamily: "'Source Serif 4', serif" }}>
              {service.subtitle}
            </p>
          </div>
        </div>
        <span
          className="text-xl transition-transform duration-200 mt-1 flex-shrink-0"
          style={{ color: MUTED, transform: open ? "rotate(45deg)" : "none" }}
        >
          +
        </span>
      </div>
      {open && (
        <div className="pb-6 pl-14">
          <p className="text-sm leading-relaxed mb-4" style={{ color: MUTED, fontFamily: "'Source Serif 4', serif" }}>
            {service.desc}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {service.deliverables.map((d) => (
              <div key={d} className="flex items-center gap-2 text-xs font-semibold" style={{ color: service.color }}>
                <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: service.color }} />
                {d}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Pagina ────────────────────────────────────────────────────────────────────

export default function Business() {

  return (
    <>
      <SEOHead
        title="IdeaSmart Business — Piattaforma AI & Advisory"
        description="Due offerte per chi decide: la piattaforma AI agentica IdeaSmart Intelligence con 20+ ricerche al giorno, e il servizio di consulenza senior su AI Innovation, M&A e partnership tecnologiche."
        canonical="https://ideasmart.ai/business"
        ogSiteName="IDEASMART Research"
      />
      <style>{`
        /* SF Pro system font — no external loading needed */
      `}</style>

      <div className="min-h-screen" style={{ background: PAPER, color: INK }}>

        {/* ── NAVBAR STANDARD ── */}
        <Navbar />

        <BreakingNewsTicker />

        {/* ── HERO ── */}
        <section className="max-w-6xl mx-auto px-4 pt-20 pb-0">
          <div className="text-center py-8">
            <SectionBadge label="IdeaSmart Business" />
            <h1
              className="mt-3 text-4xl md:text-6xl font-black tracking-tight"
              style={{ color: INK, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif", letterSpacing: "-0.02em" }}
            >
              Due strumenti.<br />
              <span style={{ color: TEAL }}>Una sola missione.</span>
            </h1>
            <p
              className="mt-3 text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
              style={{ color: MUTED, fontFamily: "'Source Serif 4', serif" }}
            >
              Informazione AI agentica personalizzata 24 ore su 24 — e consulenza senior su AI, M&A e partnership tecnologiche.
              Per chi prende decisioni che contano.
            </p>
          </div>
          <Divider />
        </section>

        {/* ── INDICE OFFERTE ── */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Card A */}
            <a
              href="#piattaforma"
              className="group block border-2 rounded-sm p-6 transition-all duration-200 hover:shadow-md"
              style={{ borderColor: TEAL, background: TEAL_LT }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-sm flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: TEAL, color: "#fff" }}
                >
                  A
                </div>
                <div>
                  <SectionBadge label="Piattaforma" color={TEAL} bg="#c8ede8" />
                  <h2
                    className="mt-2 text-xl font-bold leading-tight"
                    style={{ color: INK, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
                  >
                    IdeaSmart Intelligence
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: MUTED, fontFamily: "'Source Serif 4', serif" }}>
                    La piattaforma AI agentica con news e ricerche personalizzate ogni giorno, basata sull'algoritmo Verify™.
                  </p>
                  <span
                    className="inline-block mt-3 text-xs font-bold uppercase tracking-wider"
                    style={{ color: TEAL, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                  >
                    Scopri la piattaforma →
                  </span>
                </div>
              </div>
            </a>

            {/* Card B */}
            <a
              href="#advisory"
              className="group block border-2 rounded-sm p-6 transition-all duration-200 hover:shadow-md"
              style={{ borderColor: GOLD, background: GOLD_LT }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-sm flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: GOLD, color: "#fff" }}
                >
                  B
                </div>
                <div>
                  <SectionBadge label="Consulenza" color={GOLD} bg="#f5e9c8" />
                  <h2
                    className="mt-2 text-xl font-bold leading-tight"
                    style={{ color: INK, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
                  >
                    IdeaSmart Advisory
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: MUTED, fontFamily: "'Source Serif 4', serif" }}>
                    Consulenza e ricerca senior su AI Innovation, M&A e ricerca di partnership tecnologiche. Per board, fondi e scaleup.
                  </p>
                  <span
                    className="inline-block mt-3 text-xs font-bold uppercase tracking-wider"
                    style={{ color: GOLD, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                  >
                    Scopri l'advisory →
                  </span>
                </div>
              </div>
            </a>
          </div>
        </section>

        <ThinDivider />

        {/* ══════════════════════════════════════════════════════════════════════
            OFFERTA A — PIATTAFORMA AI AGENTICA
        ══════════════════════════════════════════════════════════════════════ */}
        <section id="piattaforma" className="max-w-6xl mx-auto px-4 py-12">

          {/* Intestazione sezione */}
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-8 h-8 rounded-sm flex items-center justify-center text-sm font-black text-white"
              style={{ background: TEAL }}
            >
              A
            </div>
            <SectionBadge label="IdeaSmart Intelligence Platform" color={TEAL} bg={TEAL_LT} />
          </div>
          <Divider thick />

          <div className="grid md:grid-cols-[2fr_1fr] gap-10 pt-8">
            <div>
              <h2
                className="text-3xl md:text-4xl font-bold leading-tight mb-4"
                style={{ color: INK, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
              >
                Il tuo briefing AI personalizzato.<br />
                <span style={{ color: TEAL }}>Ogni mattina alle 00:00 CET.</span>
              </h2>
              <div
                className="text-base leading-relaxed space-y-3"
                style={{ color: MUTED, fontFamily: "'Source Serif 4', serif" }}
              >
                <p>
                  IdeaSmart Intelligence è la piattaforma di informazione AI agentica che lavora mentre dormi. Otto agenti specializzati monitorano oltre <strong style={{ color: INK }}>450 fonti globali</strong> ogni notte: fonti accademiche, report di settore, feed VC e M&A, media specializzati internazionali.
                </p>
                <p>
                  L'algoritmo proprietario <strong style={{ color: INK }}>Verify™</strong> incrocia ogni dato su almeno tre fonti indipendenti prima di pubblicarlo. Il risultato: ogni mattina trovi sul tuo feed 20+ ricerche originali e 40+ notizie verificate, pronte per le tue decisioni.
                </p>
                <p>
                  Non è un aggregatore di notizie. È un <strong style={{ color: INK }}>sistema di intelligence personalizzato</strong> che si adatta al tuo profilo: scegli le aree che ti interessano — AI Innovation, Venture Capital, M&A, Startup Ecosystem — e il feed si costruisce intorno alle tue priorità.
                </p>
              </div>
            </div>

            {/* Citazione */}
            <div className="flex flex-col justify-start pt-2">
              <blockquote className="border-l-4 pl-5 py-2" style={{ borderColor: TEAL }}>
                <p
                  className="text-lg font-bold italic leading-snug"
                  style={{ color: INK, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
                >
                  "In 3 anni di sviluppo agentico, abbiamo costruito il sistema di ricerca automatizzata più avanzato d'Italia. Oggi lo mettiamo a disposizione di chi decide."
                </p>
                <footer
                  className="mt-3 text-xs uppercase tracking-widest"
                  style={{ color: MUTED, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                >
                  — Adrian Lenice, Founder & CEO IdeaSmart
                </footer>
              </blockquote>

              {/* KPI */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { v: "20+", l: "Ricerche/giorno" },
                  { v: "450+", l: "Fonti monitorate" },
                  { v: "00:00", l: "Aggiornamento CET" },
                  { v: "100%", l: "Dati verificati" },
                ].map(({ v, l }) => (
                  <div key={l} className="text-center p-3 rounded-sm" style={{ background: TEAL_LT }}>
                    <div
                      className="text-2xl font-black"
                      style={{ color: TEAL, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                    >
                      {v}
                    </div>
                    <div
                      className="text-[10px] uppercase tracking-wider mt-0.5"
                      style={{ color: MUTED, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                    >
                      {l}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature grid */}
          <div className="mt-10">
            <ThinDivider />
            <h3
              className="mt-6 mb-5 text-xs font-bold uppercase tracking-[0.2em]"
              style={{ color: MUTED, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
            >
              Cosa include la piattaforma
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PLATFORM_FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="border p-4 rounded-sm"
                  style={{ borderColor: `${INK}15`, background: "#fff" }}
                >
                  <div className="text-2xl mb-2">{f.icon}</div>
                  <h4
                    className="font-bold text-sm mb-1"
                    style={{ color: INK, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                  >
                    {f.title}
                  </h4>
                  <p className="text-xs leading-relaxed" style={{ color: MUTED, fontFamily: "'Source Serif 4', serif" }}>
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Piani */}
          <div className="mt-12">
            <ThinDivider />
            <h3
              className="mt-6 mb-5 text-xs font-bold uppercase tracking-[0.2em]"
              style={{ color: MUTED, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
            >
              Piani di abbonamento
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {PLATFORM_PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className="border-2 rounded-sm p-5 flex flex-col"
                  style={{
                    borderColor: plan.color,
                    background: plan.bg,
                  }}
                >
                  {plan.badge && (
                    <div className="mb-2">
                      <SectionBadge label={plan.badge} color={plan.color} bg={`${plan.color}20`} />
                    </div>
                  )}
                  <div
                    className="text-lg font-black mb-1"
                    style={{ color: plan.color, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                  >
                    {plan.name}
                  </div>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span
                      className="text-3xl font-black"
                      style={{ color: INK, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', serif" }}
                    >
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-sm" style={{ color: MUTED }}>
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <ul className="space-y-2 flex-1 mb-5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs" style={{ color: MUTED }}>
                        <span className="mt-0.5 flex-shrink-0" style={{ color: plan.color }}>✓</span>
                        <span style={{ fontFamily: "'Source Serif 4', serif" }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={plan.href}
                    className="block text-center py-2.5 px-4 text-sm font-bold rounded-sm transition-all duration-200 hover:opacity-90"
                    style={
                      plan.outline
                        ? { border: `2px solid ${plan.color}`, color: plan.color, background: "transparent", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }
                        : { background: plan.color, color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }
                    }
                  >
                    {plan.cta}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4">
          <Divider thick />
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            OFFERTA B — CONSULENZA & ADVISORY
        ══════════════════════════════════════════════════════════════════════ */}
        <section id="advisory" className="max-w-6xl mx-auto px-4 py-12">

          {/* Intestazione sezione */}
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-8 h-8 rounded-sm flex items-center justify-center text-sm font-black text-white"
              style={{ background: GOLD }}
            >
              B
            </div>
            <SectionBadge label="IdeaSmart Advisory" color={GOLD} bg={GOLD_LT} />
          </div>
          <Divider thick />

          <div className="grid md:grid-cols-[2fr_1fr] gap-10 pt-8">
            <div>
              <h2
                className="text-3xl md:text-4xl font-bold leading-tight mb-4"
                style={{ color: INK, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
              >
                Consulenza senior su AI, M&A<br />
                <span style={{ color: GOLD }}>e partnership tecnologiche.</span>
              </h2>
              <div
                className="text-base leading-relaxed space-y-3"
                style={{ color: MUTED, fontFamily: "'Source Serif 4', serif" }}
              >
                <p>
                  IdeaSmart Advisory è il servizio di consulenza e ricerca dedicato a chi ha bisogno di supporto professionale nelle decisioni strategiche su <strong style={{ color: INK }}>AI Innovation, M&A e ricerca di partnership tecnologiche</strong>.
                </p>
                <p>
                  Il team è composto da senior advisor con background in Big 5, investment banking, venture capital e imprenditoria seriale. Profili che hanno guidato trasformazioni, completato exit e gestito fondi — non teorici, ma operatori con cicatrici sul campo.
                </p>
                <p>
                  La differenza rispetto a una consulenza tradizionale: ogni engagement è supportato dalla <strong style={{ color: INK }}>base dati IdeaSmart</strong> — 20+ analisi quotidiane, 450+ fonti monitorate, intelligence in tempo reale sull'ecosistema AI e VC europeo.
                </p>
              </div>
            </div>

            {/* Team */}
            <div>
              <h3
                className="text-xs font-bold uppercase tracking-[0.2em] mb-4"
                style={{ color: MUTED, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              >
                Il team advisory
              </h3>
              <div className="space-y-3">
                {ADVISORY_TEAM.map((m) => (
                  <div
                    key={m.initials}
                    className="flex items-start gap-3 p-3 rounded-sm border"
                    style={{ borderColor: `${INK}10`, background: "#fff" }}
                  >
                    <div
                      className="w-9 h-9 rounded-sm flex items-center justify-center text-xs font-black flex-shrink-0"
                      style={{ background: m.bg, color: m.color }}
                    >
                      {m.initials}
                    </div>
                    <div>
                      <div className="mb-0.5">
                        <SectionBadge label={m.tag} color={m.color} bg={m.bg} />
                      </div>
                      <div
                        className="text-xs font-bold"
                        style={{ color: INK, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                      >
                        {m.role}
                      </div>
                      <p className="text-xs mt-0.5 leading-relaxed" style={{ color: MUTED, fontFamily: "'Source Serif 4', serif" }}>
                        {m.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Servizi accordion */}
          <div className="mt-10">
            <ThinDivider />
            <h3
              className="mt-6 mb-2 text-xs font-bold uppercase tracking-[0.2em]"
              style={{ color: MUTED, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
            >
              I servizi advisory
            </h3>
            <div>
              {ADVISORY_SERVICES.map((s) => (
                <ServiceAccordion key={s.id} service={s} />
              ))}
            </div>
          </div>

          {/* Formati di engagement */}
          <div className="mt-10">
            <ThinDivider />
            <h3
              className="mt-6 mb-5 text-xs font-bold uppercase tracking-[0.2em]"
              style={{ color: MUTED, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
            >
              Formati di engagement
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {ADVISORY_FORMATS.map((f) => (
                <div
                  key={f.title}
                  className="border p-5 rounded-sm"
                  style={{ borderColor: `${GOLD}40`, background: GOLD_LT }}
                >
                  <div className="text-2xl mb-2">{f.icon}</div>
                  <h4
                    className="font-bold text-sm mb-2"
                    style={{ color: INK, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                  >
                    {f.title}
                  </h4>
                  <p className="text-xs leading-relaxed" style={{ color: MUTED, fontFamily: "'Source Serif 4', serif" }}>
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Advisory */}
          <div
            className="mt-10 p-8 rounded-sm border-2 text-center"
            style={{ borderColor: GOLD, background: GOLD_LT }}
          >
            <SectionBadge label="Inizia una conversazione" color={GOLD} bg={`${GOLD}25`} />
            <h3
              className="mt-3 text-2xl md:text-3xl font-bold"
              style={{ color: INK, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
            >
              Parliamo del tuo progetto.
            </h3>
            <p
              className="mt-2 text-sm max-w-lg mx-auto leading-relaxed"
              style={{ color: MUTED, fontFamily: "'Source Serif 4', serif" }}
            >
              Ogni engagement inizia con una call esplorativa di 30 minuti. Nessun impegno, nessun costo. Solo una conversazione tra professionisti.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:business@ideasmart.ai?subject=IdeaSmart Advisory — Richiesta di contatto"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold rounded-sm transition-all hover:opacity-90 text-white"
                style={{ background: GOLD, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              >
                Scrivici a business@ideasmart.ai →
              </a>
              <a
                href="https://www.linkedin.com/in/cinellia/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold rounded-sm border-2 transition-all hover:opacity-80"
                style={{ borderColor: GOLD, color: GOLD, background: "transparent", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              >
                Contatta su LinkedIn
              </a>
            </div>
          </div>
        </section>

        {/* ── BANNER RECRUITING ── */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <ThinDivider />
          <div
            className="mt-6 p-6 rounded-sm border flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ borderColor: `${TEAL}30`, background: TEAL_LT }}
          >
            <div>
              <SectionBadge label="Collabora con noi" color={TEAL} bg={`${TEAL}20`} />
              <h3
                className="mt-2 text-lg font-bold"
                style={{ color: INK, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
              >
                Cerchiamo firme d'eccellenza.
              </h3>
              <p className="text-sm mt-1" style={{ color: MUTED, fontFamily: "'Source Serif 4', serif" }}>
                Ex Big 5, ex VC, founder con exit, C-Level Fortune 500. Se hai un track record straordinario e vuoi portare il tuo know-how nel network IdeaSmart Advisory, scrivici.
              </p>
            </div>
            <a
              href="mailto:business@ideasmart.ai?subject=Collaborazione IdeaSmart Advisory"
              className="flex-shrink-0 px-5 py-2.5 text-sm font-bold rounded-sm border-2 transition-all hover:opacity-80 whitespace-nowrap"
              style={{ borderColor: TEAL, color: TEAL, background: "transparent", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
            >
              Candidati →
            </a>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer
          className="border-t mt-4 py-8"
          style={{ borderColor: `${INK}20`, background: "#f1f5f9" }}
        >
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span
                className="text-lg font-black"
                style={{ color: INK, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              >
                IDEA<span style={{ color: TEAL }}>SMART</span>{" "}
                <span style={{ color: TEAL, fontSize: "0.75em" }}>RESEARCH</span>
              </span>
              <p className="text-xs mt-0.5" style={{ color: MUTED, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                AI · Startup · Venture Capital
              </p>
            </div>
            <div className="flex gap-4 text-xs" style={{ color: MUTED, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
              <Link href="/" className="hover:underline">Home</Link>
              <Link href="/chi-siamo" className="hover:underline">Chi Siamo</Link>
              <Link href="/research" className="hover:underline">Research</Link>
              <a href="mailto:business@ideasmart.ai" className="hover:underline">business@ideasmart.ai</a>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
