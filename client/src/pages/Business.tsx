/**
 * IDEASMART BUSINESS — Advisory & Research Landing Page
 * Servizio di consulenza e ricerca su AI Innovation, M&A e Venture Capital
 * Design: Navy profondo (#0a0f1e) + Gold (#c9a84c) + Bianco carta (#faf8f3)
 * Tipografia: Playfair Display (titoli), Source Serif 4 (corpo), Space Mono (label)
 */

import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import SEOHead from "@/components/SEOHead";

// ── Palette ───────────────────────────────────────────────────────────────────
const NAVY = "#0a0f1e";
const NAVY_MID = "#111827";
const NAVY_LIGHT = "#1e2a45";
const GOLD = "#c9a84c";
const GOLD_LIGHT = "#e8d5a3";
const PAPER = "#faf8f3";
const WHITE = "#ffffff";
const MUTED = "rgba(255,255,255,0.55)";

// ── Dati ──────────────────────────────────────────────────────────────────────

const SERVICES = [
  {
    id: "ai-strategy",
    icon: "◈",
    title: "AI Innovation Strategy",
    subtitle: "Trasformazione AI per il board e il C-Level",
    description:
      "Supportiamo board e C-Level nella definizione di strategie di adozione dell'intelligenza artificiale: roadmap tecnologica, governance dei dati, identificazione dei casi d'uso ad alto impatto e valutazione del ROI. Non teorie — piani operativi costruiti con chi ha già guidato trasformazioni simili.",
    deliverables: ["AI Readiness Assessment", "Roadmap strategica 12-36 mesi", "Business case e ROI modelling", "Governance framework"],
    tag: "AI STRATEGY",
  },
  {
    id: "ma-advisory",
    icon: "◉",
    title: "M&A Advisory AI & Tech",
    subtitle: "Due diligence e valutazione di asset tecnologici",
    description:
      "Offriamo supporto specializzato nelle operazioni di M&A nel settore tech e AI: due diligence tecnologica, valutazione della proprietà intellettuale, analisi del team e del prodotto, identificazione di target strategici e supporto nelle negoziazioni. Esperienza diretta in oltre 40 operazioni completate.",
    deliverables: ["Tech Due Diligence", "IP & Asset Valuation", "Target Identification", "Deal Structuring Support"],
    tag: "M&A ADVISORY",
  },
  {
    id: "vc-research",
    icon: "◎",
    title: "Venture Capital Research",
    subtitle: "Ricerche di mercato per decisioni di investimento",
    description:
      "Ricerche verticali e personalizzate per fondi VC, family office e investitori istituzionali: analisi di settore, landscape competitivo, benchmark di valutazione, trend di mercato e identificazione delle opportunità di investimento più rilevanti nell'ecosistema AI e deeptech europeo.",
    deliverables: ["Sector Deep Dives", "Competitive Landscape", "Valuation Benchmarks", "Deal Flow Intelligence"],
    tag: "VC RESEARCH",
  },
  {
    id: "board-support",
    icon: "◇",
    title: "Board & C-Level Advisory",
    subtitle: "Affiancamento strategico continuativo",
    description:
      "Un advisor senior al fianco del board e del management team per decisioni strategiche su tecnologia, mercati e investimenti. Non consulenza episodica — una presenza continuativa che porta 30 anni di esperienza operativa direttamente nelle riunioni che contano.",
    deliverables: ["Board Advisory Retainer", "Strategic Briefings mensili", "Market Intelligence settimanale", "Access al network IdeaSmart"],
    tag: "BOARD ADVISORY",
  },
];

const CLIENTS = [
  {
    icon: "⬡",
    title: "Fondi Venture Capital",
    description: "Deal flow intelligence, sector research e supporto nella due diligence tecnica per fondi early-stage e growth.",
  },
  {
    icon: "⬢",
    title: "Corporate & Large Enterprise",
    description: "AI strategy, M&A advisory e trasformazione digitale per aziende Fortune 500 e Top 100 italiane.",
  },
  {
    icon: "⬣",
    title: "Scaleup & Growth Company",
    description: "Supporto strategico per scaleup in fase di crescita: fundraising positioning, go-to-market e board preparation.",
  },
  {
    icon: "⬤",
    title: "Family Office & Investitori",
    description: "Research personalizzata e advisory per investitori privati che vogliono esposizione intelligente all'ecosistema AI e tech.",
  },
];

const DIFFERENTIATORS = [
  {
    number: "30+",
    label: "Anni di esperienza",
    detail: "Il team senior ha guidato trasformazioni in aziende Fortune 500, completato exit di successo e gestito fondi di investimento.",
  },
  {
    number: "20",
    label: "Ricerche al giorno",
    detail: "IdeaSmart Research pubblica ogni giorno 20 analisi originali su AI, Startup e Venture Capital — la base dati del nostro advisory.",
  },
  {
    number: "40+",
    label: "Operazioni M&A",
    detail: "Esperienza diretta in operazioni di M&A nel settore tech, con deal size da €2M a €200M.",
  },
  {
    number: "100%",
    label: "Verticale AI & VC",
    detail: "Non siamo una consulenza generalista. Ogni advisor del team lavora esclusivamente su AI, tech e venture capital.",
  },
];

const TEAM_PROFILES = [
  {
    initials: "AC",
    name: "Andrea Cinelli",
    role: "Founder & Lead Advisor",
    background: "Imprenditore seriale con 20+ anni nell'ecosistema tech italiano ed europeo. Fondatore di FoolFarm, IdeaSmart e multiple exit di successo. Opinion leader su AI e Venture Capital.",
    expertise: ["AI Strategy", "Venture Capital", "Startup Ecosystem"],
  },
  {
    initials: "SR",
    name: "Senior Advisor — Finance",
    role: "M&A & Capital Markets",
    background: "Ex Managing Director in una primaria investment bank europea. 30+ anni in operazioni M&A tech, IPO e capital markets. Background in Top 500 company.",
    expertise: ["M&A Advisory", "Capital Markets", "Deal Structuring"],
  },
  {
    initials: "TA",
    name: "Senior Advisor — Technology",
    role: "AI Innovation & Digital Transformation",
    background: "Ex CTO di un gruppo Fortune 500 europeo. Pioniere nell'adozione enterprise dell'AI. Ha guidato trasformazioni digitali con budget superiori a €500M.",
    expertise: ["AI Architecture", "Digital Transformation", "Tech Due Diligence"],
  },
  {
    initials: "VL",
    name: "Senior Advisor — Venture",
    role: "VC Strategy & Portfolio",
    background: "Partner fondatore di un fondo VC con €200M AUM. 15+ anni nell'ecosistema VC europeo. Portfolio di 40+ investimenti in AI, deeptech e SaaS.",
    expertise: ["VC Strategy", "Portfolio Management", "Fundraising"],
  },
];

const FAQS = [
  {
    q: "Come si differenzia IdeaSmart Business da una consulenza tradizionale?",
    a: "IdeaSmart Business combina la profondità di ricerca di una think tank (20 analisi quotidiane su AI e VC) con l'esperienza operativa di advisor che hanno lavorato in Top 500, completato exit e gestito fondi. Non offriamo framework teorici — offriamo insight basati su dati reali e decisioni prese in prima persona.",
  },
  {
    q: "Quali sono i formati di engagement disponibili?",
    a: "Offriamo tre formati: (1) Project-based — ricerche e advisory su singoli progetti con deliverable definiti; (2) Retainer mensile — presenza continuativa del team per supporto strategico ricorrente; (3) Board Advisory — un senior advisor come membro del board o advisory board con presenza alle riunioni chiave.",
  },
  {
    q: "In quanto tempo viene consegnata una ricerca di mercato?",
    a: "Una ricerca di mercato standard (20-30 pagine) viene consegnata in 5-7 giorni lavorativi. Per ricerche più approfondite o che richiedono interviste con esperti del settore, i tempi sono di 2-3 settimane. Offriamo anche briefing rapidi (48 ore) per decisioni urgenti.",
  },
  {
    q: "Lavorate anche con startup early-stage?",
    a: "Sì, ma con un approccio selettivo. Lavoriamo con startup che hanno già una traction dimostrabile e si trovano in fase di fundraising Series A o successiva, o che stanno preparando un'operazione di M&A. Per startup pre-revenue, il nostro contributo è più efficace in fase di board preparation e investor storytelling.",
  },
];

// ── Componenti ────────────────────────────────────────────────────────────────

function GoldDivider() {
  return <div className="w-12 h-0.5 my-4" style={{ background: GOLD }} />;
}

function ServiceCard({ service, index }: { service: typeof SERVICES[0]; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border p-6 cursor-pointer transition-all duration-300 group"
      style={{
        borderColor: open ? GOLD : "rgba(201,168,76,0.25)",
        background: open ? "rgba(201,168,76,0.06)" : "transparent",
      }}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl" style={{ color: GOLD }}>{service.icon}</span>
            <span
              className="text-[9px] font-bold uppercase tracking-[0.25em] px-2 py-0.5 border"
              style={{ color: GOLD, borderColor: GOLD + "40", fontFamily: "'Space Mono', monospace" }}
            >
              {service.tag}
            </span>
          </div>
          <h3
            className="text-xl font-bold mb-1 group-hover:text-white transition-colors"
            style={{ color: GOLD_LIGHT, fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {service.title}
          </h3>
          <p className="text-sm" style={{ color: MUTED, fontFamily: "'Source Serif 4', serif" }}>
            {service.subtitle}
          </p>
        </div>
        <span className="text-2xl mt-1 transition-transform duration-300" style={{ color: GOLD, transform: open ? "rotate(45deg)" : "rotate(0deg)" }}>
          +
        </span>
      </div>

      {open && (
        <div className="mt-5 pt-5 border-t" style={{ borderColor: "rgba(201,168,76,0.2)" }}>
          <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.75)", fontFamily: "'Source Serif 4', serif" }}>
            {service.description}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {service.deliverables.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span style={{ color: GOLD }}>→</span>
                <span className="text-xs" style={{ color: GOLD_LIGHT, fontFamily: "'Space Mono', monospace" }}>{d}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ContactForm() {
  const [form, setForm] = useState({ name: "", company: "", email: "", service: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Compila almeno nome, email e messaggio");
      return;
    }
    // Simula invio
    await new Promise(r => setTimeout(r, 800));
    setSent(true);
    toast.success("Richiesta inviata. Ti contatteremo entro 24 ore.");
  };

  if (sent) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4" style={{ color: GOLD }}>✓</div>
        <p className="text-lg font-bold mb-2" style={{ color: WHITE, fontFamily: "'Playfair Display', serif" }}>
          Richiesta ricevuta
        </p>
        <p className="text-sm" style={{ color: MUTED, fontFamily: "'Source Serif 4', serif" }}>
          Un membro del team ti contatterà entro 24 ore lavorative.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: GOLD, fontFamily: "'Space Mono', monospace" }}>
            Nome e Cognome *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-transparent border outline-none focus:border-[#c9a84c] transition-colors"
            style={{ borderColor: "rgba(201,168,76,0.3)", color: WHITE, fontFamily: "'Source Serif 4', serif" }}
            placeholder="Andrea Rossi"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: GOLD, fontFamily: "'Space Mono', monospace" }}>
            Azienda / Fondo
          </label>
          <input
            type="text"
            value={form.company}
            onChange={e => setForm({ ...form, company: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-transparent border outline-none focus:border-[#c9a84c] transition-colors"
            style={{ borderColor: "rgba(201,168,76,0.3)", color: WHITE, fontFamily: "'Source Serif 4', serif" }}
            placeholder="Nome azienda o fondo"
          />
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: GOLD, fontFamily: "'Space Mono', monospace" }}>
          Email *
        </label>
        <input
          type="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          className="w-full px-3 py-2 text-sm bg-transparent border outline-none focus:border-[#c9a84c] transition-colors"
          style={{ borderColor: "rgba(201,168,76,0.3)", color: WHITE, fontFamily: "'Source Serif 4', serif" }}
          placeholder="andrea@azienda.com"
        />
      </div>
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: GOLD, fontFamily: "'Space Mono', monospace" }}>
          Area di interesse
        </label>
        <select
          value={form.service}
          onChange={e => setForm({ ...form, service: e.target.value })}
          className="w-full px-3 py-2 text-sm bg-transparent border outline-none focus:border-[#c9a84c] transition-colors"
          style={{ borderColor: "rgba(201,168,76,0.3)", color: form.service ? WHITE : "rgba(255,255,255,0.4)", fontFamily: "'Source Serif 4', serif", background: NAVY_MID }}
        >
          <option value="" style={{ background: NAVY_MID }}>Seleziona un servizio</option>
          <option value="ai-strategy" style={{ background: NAVY_MID }}>AI Innovation Strategy</option>
          <option value="ma-advisory" style={{ background: NAVY_MID }}>M&A Advisory AI & Tech</option>
          <option value="vc-research" style={{ background: NAVY_MID }}>Venture Capital Research</option>
          <option value="board-support" style={{ background: NAVY_MID }}>Board & C-Level Advisory</option>
          <option value="other" style={{ background: NAVY_MID }}>Altro / Non so ancora</option>
        </select>
      </div>
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: GOLD, fontFamily: "'Space Mono', monospace" }}>
          Descrivi la tua esigenza *
        </label>
        <textarea
          value={form.message}
          onChange={e => setForm({ ...form, message: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 text-sm bg-transparent border outline-none focus:border-[#c9a84c] transition-colors resize-none"
          style={{ borderColor: "rgba(201,168,76,0.3)", color: WHITE, fontFamily: "'Source Serif 4', serif" }}
          placeholder="Descrivici brevemente il contesto e l'obiettivo della tua richiesta..."
        />
      </div>
      <button
        type="submit"
        className="w-full py-3 text-sm font-bold uppercase tracking-widest transition-all duration-200 hover:opacity-90"
        style={{ background: GOLD, color: NAVY, fontFamily: "'Space Mono', monospace" }}
      >
        Invia Richiesta →
      </button>
      <p className="text-[10px] text-center" style={{ color: MUTED, fontFamily: "'Space Mono', monospace" }}>
        Risposta garantita entro 24 ore lavorative · Riservatezza totale
      </p>
    </form>
  );
}

// ── Pagina principale ─────────────────────────────────────────────────────────

export default function Business() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <div style={{ background: NAVY, minHeight: "100vh", color: WHITE }}>
      <SEOHead
        title="IdeaSmart Business — Advisory & Research su AI, M&A e Venture Capital"
        description="Consulenza strategica e ricerche di mercato su AI Innovation, M&A e Venture Capital. Un team di senior advisor con 30+ anni di esperienza a supporto di investitori, aziende, scaleup e fondi."
      />
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_LIGHT} 100%)` }}
      >
        {/* Griglia decorativa */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(${GOLD} 1px, transparent 1px), linear-gradient(90deg, ${GOLD} 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-0.5" style={{ background: GOLD }} />
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.3em]"
                  style={{ color: GOLD, fontFamily: "'Space Mono', monospace" }}
                >
                  IdeaSmart Business
                </span>
              </div>

              <h1
                className="text-4xl md:text-5xl font-bold leading-[1.1] mb-6"
                style={{ color: WHITE, fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Advisory & Research<br />
                <span style={{ color: GOLD }}>AI · M&A · Venture Capital</span>
              </h1>

              <p
                className="text-base leading-relaxed mb-8"
                style={{ color: "rgba(255,255,255,0.70)", fontFamily: "'Source Serif 4', Georgia, serif", maxWidth: "480px" }}
              >
                Un team di senior advisor con 30+ anni di esperienza in Top 500, exit di successo e gestione di fondi VC. Ricerche di mercato verticali e consulenza strategica a supporto delle decisioni di investimento nell'ecosistema AI e Venture Capital.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#contact"
                  className="px-6 py-3 text-sm font-bold uppercase tracking-widest text-center transition-opacity hover:opacity-90"
                  style={{ background: GOLD, color: NAVY, fontFamily: "'Space Mono', monospace" }}
                >
                  Richiedi una Consulenza →
                </a>
                <a
                  href="#services"
                  className="px-6 py-3 text-sm font-bold uppercase tracking-widest text-center border transition-colors hover:border-[#c9a84c]"
                  style={{ borderColor: "rgba(201,168,76,0.4)", color: GOLD_LIGHT, fontFamily: "'Space Mono', monospace" }}
                >
                  Scopri i Servizi
                </a>
              </div>
            </div>

            {/* Right — Credenziali */}
            <div className="grid grid-cols-2 gap-4">
              {DIFFERENTIATORS.map((d, i) => (
                <div
                  key={i}
                  className="p-5 border"
                  style={{ borderColor: "rgba(201,168,76,0.2)", background: "rgba(201,168,76,0.04)" }}
                >
                  <p
                    className="text-3xl font-bold mb-1"
                    style={{ color: GOLD, fontFamily: "'Playfair Display', serif" }}
                  >
                    {d.number}
                  </p>
                  <p
                    className="text-xs font-bold uppercase tracking-wider mb-2"
                    style={{ color: GOLD_LIGHT, fontFamily: "'Space Mono', monospace" }}
                  >
                    {d.label}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: MUTED, fontFamily: "'Source Serif 4', serif" }}>
                    {d.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── POSITIONING STATEMENT ─────────────────────────────────────────── */}
      <section
        className="py-12 border-y"
        style={{ borderColor: "rgba(201,168,76,0.2)", background: "rgba(201,168,76,0.04)" }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <blockquote
            className="text-xl md:text-2xl font-bold leading-relaxed"
            style={{ color: GOLD_LIGHT, fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            "Non siamo una consulenza generalista. Siamo il team che ha vissuto dall'interno le trasformazioni che oggi consigliamo. Ogni ricerca che pubblichiamo, ogni advisory che offriamo, nasce da decisioni prese in prima persona — non da framework teorici."
          </blockquote>
          <p className="mt-4 text-sm" style={{ color: MUTED, fontFamily: "'Space Mono', monospace" }}>
            — Andrea Cinelli, Founder IdeaSmart Business
          </p>
        </div>
      </section>

      {/* ── SERVIZI ──────────────────────────────────────────────────────── */}
      <section id="services" className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-12">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.3em]"
              style={{ color: GOLD, fontFamily: "'Space Mono', monospace" }}
            >
              Aree di Intervento
            </span>
            <GoldDivider />
            <h2
              className="text-3xl md:text-4xl font-bold"
              style={{ color: WHITE, fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Quattro Servizi Verticali.<br />
              <span style={{ color: GOLD }}>Un Solo Focus: AI & Venture Capital.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SERVICES.map((service, i) => (
              <ServiceCard key={service.id} service={service} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CLIENTI TARGET ───────────────────────────────────────────────── */}
      <section
        className="py-20 border-y"
        style={{ borderColor: "rgba(201,168,76,0.15)", background: NAVY_MID }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-12">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.3em]"
              style={{ color: GOLD, fontFamily: "'Space Mono', monospace" }}
            >
              Chi Serviamo
            </span>
            <GoldDivider />
            <h2
              className="text-3xl font-bold"
              style={{ color: WHITE, fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Supporto Specializzato<br />
              <span style={{ color: GOLD }}>per Chi Decide.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CLIENTS.map((client, i) => (
              <div
                key={i}
                className="p-6 border transition-all duration-300 hover:border-[#c9a84c]/60 group"
                style={{ borderColor: "rgba(201,168,76,0.2)" }}
              >
                <span className="text-3xl block mb-4" style={{ color: GOLD }}>{client.icon}</span>
                <h3
                  className="text-base font-bold mb-2 group-hover:text-[#c9a84c] transition-colors"
                  style={{ color: GOLD_LIGHT, fontFamily: "'Playfair Display', serif" }}
                >
                  {client.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: MUTED, fontFamily: "'Source Serif 4', serif" }}>
                  {client.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ─────────────────────────────────────────────────────────── */}
      <section id="team" className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-12">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.3em]"
              style={{ color: GOLD, fontFamily: "'Space Mono', monospace" }}
            >
              Il Team
            </span>
            <GoldDivider />
            <h2
              className="text-3xl font-bold"
              style={{ color: WHITE, fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Senior Advisor con Esperienza Operativa.<br />
              <span style={{ color: GOLD }}>Non Consulenti Teorici.</span>
            </h2>
            <p
              className="mt-4 text-sm leading-relaxed max-w-2xl"
              style={{ color: MUTED, fontFamily: "'Source Serif 4', serif" }}
            >
              Ogni membro del team ha guidato trasformazioni reali: come CTO di Fortune 500, come partner di fondi VC, come founder con exit di successo. Questo è il profilo minimo per entrare nel team IdeaSmart Business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TEAM_PROFILES.map((member, i) => (
              <div
                key={i}
                className="p-6 border"
                style={{ borderColor: "rgba(201,168,76,0.2)", background: "rgba(201,168,76,0.03)" }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: GOLD + "20", color: GOLD, fontFamily: "'Space Mono', monospace", border: `1px solid ${GOLD}40` }}
                  >
                    {member.initials}
                  </div>
                  <div>
                    <h3
                      className="text-base font-bold"
                      style={{ color: WHITE, fontFamily: "'Playfair Display', serif" }}
                    >
                      {member.name}
                    </h3>
                    <p
                      className="text-xs"
                      style={{ color: GOLD, fontFamily: "'Space Mono', monospace" }}
                    >
                      {member.role}
                    </p>
                  </div>
                </div>
                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{ color: MUTED, fontFamily: "'Source Serif 4', serif" }}
                >
                  {member.background}
                </p>
                <div className="flex flex-wrap gap-2">
                  {member.expertise.map((tag, j) => (
                    <span
                      key={j}
                      className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border"
                      style={{ color: GOLD_LIGHT, borderColor: GOLD + "30", fontFamily: "'Space Mono', monospace" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div
            className="mt-8 p-6 border text-center"
            style={{ borderColor: "rgba(201,168,76,0.3)", background: "rgba(201,168,76,0.05)" }}
          >
            <p
              className="text-sm font-bold mb-1"
              style={{ color: GOLD_LIGHT, fontFamily: "'Playfair Display', serif" }}
            >
              Il team si espande in base al progetto
            </p>
            <p className="text-xs" style={{ color: MUTED, fontFamily: "'Source Serif 4', serif" }}>
              Per ogni mandato, selezioniamo gli advisor con l'esperienza più rilevante per il settore e la fase del cliente. Il network IdeaSmart include oltre 50 senior professional in AI, tech, finance e venture capital.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section
        className="py-20 border-t"
        style={{ borderColor: "rgba(201,168,76,0.15)", background: NAVY_MID }}
      >
        <div className="max-w-3xl mx-auto px-4">
          <div className="mb-10">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.3em]"
              style={{ color: GOLD, fontFamily: "'Space Mono', monospace" }}
            >
              Domande Frequenti
            </span>
            <GoldDivider />
            <h2
              className="text-2xl font-bold"
              style={{ color: WHITE, fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Come Funziona
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="border cursor-pointer"
                style={{ borderColor: activeFaq === i ? GOLD + "60" : "rgba(201,168,76,0.2)" }}
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
              >
                <div className="flex items-center justify-between p-5">
                  <p
                    className="text-sm font-bold pr-4"
                    style={{ color: activeFaq === i ? GOLD_LIGHT : WHITE, fontFamily: "'Source Serif 4', serif" }}
                  >
                    {faq.q}
                  </p>
                  <span className="text-xl flex-shrink-0 transition-transform duration-200" style={{ color: GOLD, transform: activeFaq === i ? "rotate(45deg)" : "none" }}>
                    +
                  </span>
                </div>
                {activeFaq === i && (
                  <div className="px-5 pb-5 border-t" style={{ borderColor: "rgba(201,168,76,0.2)" }}>
                    <p className="text-sm leading-relaxed pt-4" style={{ color: MUTED, fontFamily: "'Source Serif 4', serif" }}>
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────────────────── */}
      <section id="contact" className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left */}
            <div>
              <span
                className="text-[10px] font-bold uppercase tracking-[0.3em]"
                style={{ color: GOLD, fontFamily: "'Space Mono', monospace" }}
              >
                Contatti
              </span>
              <GoldDivider />
              <h2
                className="text-3xl font-bold mb-4"
                style={{ color: WHITE, fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Inizia la Conversazione.<br />
                <span style={{ color: GOLD }}>Risposta in 24 Ore.</span>
              </h2>
              <p
                className="text-sm leading-relaxed mb-8"
                style={{ color: MUTED, fontFamily: "'Source Serif 4', serif" }}
              >
                Ogni mandato inizia con una conversazione. Raccontaci il contesto, l'obiettivo e la tempistica — il team valuterà come possiamo essere più utili e ti risponderà entro 24 ore lavorative.
              </p>

              <div className="space-y-4">
                <a
                  href="mailto:business@ideasmart.ai"
                  className="flex items-center gap-3 group"
                >
                  <div
                    className="w-10 h-10 border flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: GOLD + "40" }}
                  >
                    <span style={{ color: GOLD }}>@</span>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: MUTED, fontFamily: "'Space Mono', monospace" }}>Email diretta</p>
                    <p className="text-sm font-bold group-hover:text-[#c9a84c] transition-colors" style={{ color: GOLD_LIGHT, fontFamily: "'Space Mono', monospace" }}>
                      business@ideasmart.ai
                    </p>
                  </div>
                </a>

                <a
                  href="https://www.linkedin.com/in/andreacinelli"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <div
                    className="w-10 h-10 border flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: GOLD + "40" }}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ color: GOLD }}>
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: MUTED, fontFamily: "'Space Mono', monospace" }}>LinkedIn</p>
                    <p className="text-sm font-bold group-hover:text-[#c9a84c] transition-colors" style={{ color: GOLD_LIGHT, fontFamily: "'Space Mono', monospace" }}>
                      Andrea Cinelli
                    </p>
                  </div>
                </a>
              </div>

              {/* Link alla ricerca */}
              <div
                className="mt-8 p-4 border"
                style={{ borderColor: "rgba(201,168,76,0.25)", background: "rgba(201,168,76,0.05)" }}
              >
                <p className="text-xs font-bold mb-1" style={{ color: GOLD, fontFamily: "'Space Mono', monospace" }}>
                  OGNI GIORNO SU IDEASMART RESEARCH
                </p>
                <p className="text-xs leading-relaxed mb-3" style={{ color: MUTED, fontFamily: "'Source Serif 4', serif" }}>
                  20 ricerche originali su AI, Startup e Venture Capital. La base dati che alimenta il nostro advisory — disponibile gratuitamente ogni giorno.
                </p>
                <Link
                  href="/research"
                  className="text-xs font-bold uppercase tracking-widest hover:underline"
                  style={{ color: GOLD, fontFamily: "'Space Mono', monospace" }}
                >
                  Leggi le ricerche di oggi →
                </Link>
              </div>
            </div>

            {/* Right — Form */}
            <div
              className="p-8 border"
              style={{ borderColor: "rgba(201,168,76,0.25)", background: "rgba(201,168,76,0.04)" }}
            >
              <p
                className="text-lg font-bold mb-6"
                style={{ color: WHITE, fontFamily: "'Playfair Display', serif" }}
              >
                Richiedi un primo incontro
              </p>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER STRIP ─────────────────────────────────────────────────── */}
      <div
        className="py-6 border-t text-center"
        style={{ borderColor: "rgba(201,168,76,0.2)" }}
      >
        <p className="text-[10px] uppercase tracking-widest" style={{ color: MUTED, fontFamily: "'Space Mono', monospace" }}>
          IdeaSmart Business · Advisory & Research · AI Innovation · M&A · Venture Capital
        </p>
        <Link
          href="/"
          className="text-[10px] uppercase tracking-widest hover:underline mt-1 block"
          style={{ color: GOLD + "80", fontFamily: "'Space Mono', monospace" }}
        >
          ← Torna a IdeaSmart Research
        </Link>
      </div>
    </div>
  );
}
