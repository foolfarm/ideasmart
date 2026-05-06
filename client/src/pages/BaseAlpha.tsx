/**
 * BASE ALPHA — Osservatorio Intelligence Premium
 * Pagina dedicata al servizio di reporting su tematiche specifiche
 * Palette: nero inchiostro (#0a0a0a) + oro (#c9a227) + carta (#fafaf8)
 * Stile: editorial intelligence, premium B2B
 */
import { useState } from "react";
import { Link } from "wouter";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import LeftSidebar from "@/components/LeftSidebar";
import SEOHead from "@/components/SEOHead";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const INK = "#0a0a0a";
const GOLD = "#c9a227";
const GOLD_LIGHT = "#f9f3e3";
const PAPER = "#fafaf8";
const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif";

// ─── Settori coperti dall'Osservatorio ───────────────────────────────────────
const SECTORS = [
  { id: "ai", label: "Intelligenza Artificiale & LLM", icon: "🤖", desc: "Modelli fondazionali, infrastruttura AI, adozione enterprise, regolamentazione EU AI Act" },
  { id: "vc", label: "Venture Capital & Private Equity", icon: "💼", desc: "Deal flow, round di finanziamento, trend LP, emerging markets, co-investment" },
  { id: "startup", label: "Startup & Ecosistemi", icon: "🚀", desc: "Early stage, scale-up, exit, M&A, ecosistemi nazionali e comparativi EU/US/APAC" },
  { id: "tech", label: "Tecnologia & Infrastruttura", icon: "⚙️", desc: "Cloud, edge computing, quantum, cybersecurity, semiconduttori, supply chain tech" },
  { id: "fintech", label: "Fintech & Digital Finance", icon: "🏦", desc: "Open banking, DeFi istituzionale, CBDC, embedded finance, regtech" },
  { id: "health", label: "HealthTech & BioTech", icon: "🧬", desc: "Digital health, genomica, AI diagnostica, farmaceutica digitale, MedTech" },
  { id: "energy", label: "Energy & CleanTech", icon: "⚡", desc: "Transizione energetica, storage, hydrogen, carbon markets, smart grid" },
  { id: "media", label: "Media & Informazione", icon: "📰", desc: "Giornalismo agentico, AI content, piattaforme, advertising tech, fact-checking" },
  { id: "policy", label: "Policy & Regolamentazione", icon: "🏛️", desc: "AI Act, GDPR evolution, Digital Markets Act, policy tech, compliance" },
  { id: "space", label: "Space Economy", icon: "🛰️", desc: "New Space, satellite tech, launch market, downstream applications, dual-use" },
];

// ─── Piani abbonamento ────────────────────────────────────────────────────────
const PLANS = [
  {
    id: "weekly",
    label: "WEEKLY BRIEF",
    freq: "Settimanale",
    icon: "📋",
    desc: "Report settimanale su 1 settore verticale. Sintesi delle notizie pre-pubbliche più rilevanti della settimana, analisi trend e segnali deboli.",
    features: [
      "1 settore verticale a scelta",
      "Report settimanale certificato PPV",
      "Top 10 segnali pre-pubblici",
      "Trend analysis + Key takeaway",
      "Accesso archivio 3 mesi",
    ],
    cta: "Richiedi informazioni",
    highlight: false,
  },
  {
    id: "monthly",
    label: "MONTHLY INTELLIGENCE",
    freq: "Mensile",
    icon: "📊",
    desc: "Report mensile approfondito su 2 settori verticali. Include analisi comparativa, mappa degli attori chiave e outlook strategico.",
    features: [
      "2 settori verticali a scelta",
      "Report mensile certificato PPV",
      "Analisi pre-pubblica da 4.000+ fonti",
      "Mappa attori & deal flow",
      "Outlook strategico 90 giorni",
      "Accesso archivio 12 mesi",
      "1 call di briefing mensile",
    ],
    cta: "Richiedi informazioni",
    highlight: true,
  },
  {
    id: "quarterly",
    label: "QUARTERLY DEEP DIVE",
    freq: "Trimestrale",
    icon: "🔬",
    desc: "Report trimestrale con focus verticale personalizzato. Analisi approfondita con ricerche su dati pre-pubblici, benchmark di mercato e scenari competitivi.",
    features: [
      "Settori verticali illimitati",
      "Report trimestrale certificato PPV",
      "Ricerca pre-pubblica dedicata",
      "Benchmark competitivo personalizzato",
      "Scenari strategici + raccomandazioni",
      "Accesso archivio completo",
      "Sessioni di briefing dedicate",
      "Accesso diretto al team di analisti",
    ],
    cta: "Richiedi informazioni",
    highlight: false,
  },
];

// ─── Componente Piano ─────────────────────────────────────────────────────────
function PlanCard({ plan, onContact }: { plan: typeof PLANS[0]; onContact: (plan: string) => void }) {
  return (
    <div
      className="flex flex-col rounded-none border p-6 transition-all duration-200 hover:shadow-lg"
      style={{
        borderColor: plan.highlight ? GOLD : `${INK}20`,
        background: plan.highlight ? INK : PAPER,
        color: plan.highlight ? PAPER : INK,
        boxShadow: plan.highlight ? `0 0 0 1px ${GOLD}` : undefined,
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{plan.icon}</span>
        <div>
          <p className="text-[9px] font-black tracking-[0.2em] uppercase" style={{ color: plan.highlight ? GOLD : `${INK}50` }}>
            {plan.freq}
          </p>
          <h3 className="text-base font-black tracking-tight" style={{ fontFamily: FONT }}>
            {plan.label}
          </h3>
        </div>
      </div>
      <p className="text-sm leading-relaxed mb-5" style={{ color: plan.highlight ? `${PAPER}80` : `${INK}65`, fontFamily: FONT }}>
        {plan.desc}
      </p>
      <ul className="flex-1 space-y-2 mb-6">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-[13px]" style={{ color: plan.highlight ? `${PAPER}90` : `${INK}80`, fontFamily: FONT }}>
            <span style={{ color: GOLD, marginTop: "2px", flexShrink: 0 }}>✓</span>
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={() => onContact(plan.label)}
        className="w-full py-2.5 text-[11px] font-black tracking-[0.15em] uppercase transition-all duration-200 hover:opacity-90"
        style={{
          background: plan.highlight ? GOLD : INK,
          color: plan.highlight ? INK : PAPER,
          fontFamily: FONT,
        }}
      >
        {plan.cta} →
      </button>
    </div>
  );
}

// ─── Componente Settore ───────────────────────────────────────────────────────
function SectorCard({ sector }: { sector: typeof SECTORS[0] }) {
  return (
    <div
      className="p-4 border transition-all duration-200 hover:border-[#c9a227] hover:shadow-sm group"
      style={{ borderColor: `${INK}12`, background: PAPER }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{sector.icon}</span>
        <h4 className="text-[13px] font-black" style={{ color: INK, fontFamily: FONT }}>
          {sector.label}
        </h4>
      </div>
      <p className="text-[12px] leading-relaxed" style={{ color: `${INK}55`, fontFamily: FONT }}>
        {sector.desc}
      </p>
    </div>
  );
}

// ─── Pagina principale ────────────────────────────────────────────────────────
export default function BaseAlpha() {
  const [contactForm, setContactForm] = useState({ name: "", email: "", company: "", plan: "", sector: "", message: "" });
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submitLead = trpc.centroStudi.submitLead.useMutation({
    onSuccess: () => {
      toast.success("Richiesta inviata — il nostro team ti contatterà entro 24 ore.");
      setShowForm(false);
      setContactForm({ name: "", email: "", company: "", plan: "", sector: "", message: "" });
      setSubmitting(false);
    },
    onError: () => {
      toast.error("Errore nell'invio. Riprova o scrivici a info@proofpress.ai");
      setSubmitting(false);
    },
  });

  // Mostra il form quando si clicca su un piano
  const _ = showForm;

  function handleContact(planLabel: string) {
    setContactForm(f => ({ ...f, plan: planLabel }));
    setShowForm(true);
    setTimeout(() => document.getElementById("ba-contact-form")?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    submitLead.mutate({
      name: contactForm.name,
      email: contactForm.email,
      company: contactForm.company || undefined,
      sector: contactForm.sector || undefined,
      interest: "osservatorio",
      message: `Piano: ${contactForm.plan}${contactForm.message ? ` | ${contactForm.message}` : ""}`,
      source: "base-alpha",
    });
  }

  return (
    <>
      <SEOHead
        title="Base Alpha — Osservatorio Intelligence Premium | ProofPress"
        description="Reporting su tematiche specifiche basato su notizie pre-pubbliche, analisi AI multi-fonte e certificazione ProofPress Verify. Abbonamenti settimanali, mensili e trimestrali."
        canonical="https://proofpress.ai/base-alpha"
        ogSiteName="ProofPress"
      />

      <div className="flex min-h-screen" style={{ background: PAPER, color: INK }}>
        <LeftSidebar />
        <div className="flex-1 min-w-0 overflow-x-hidden">
          <SharedPageHeader />

          {/* ── HERO ─────────────────────────────────────────────────────── */}
          <div style={{ background: INK, color: PAPER }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
              {/* Eyebrow */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[9px] font-black tracking-[0.25em] uppercase px-2.5 py-1" style={{ background: GOLD, color: INK }}>
                  OSSERVATORIO
                </span>
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: `${PAPER}40` }}>
                  Intelligence Premium
                </span>
              </div>

              {/* Titolo */}
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-black leading-none tracking-tight mb-6"
                style={{ fontFamily: FONT, letterSpacing: "-0.02em" }}
              >
                BASE ALPHA
              </h1>

              {/* Sottotitolo */}
              <p
                className="text-lg sm:text-xl leading-relaxed mb-8 max-w-2xl"
                style={{ color: `${PAPER}75`, fontFamily: FONT }}
              >
                Il primo osservatorio con redazione agentica che analizza oltre{" "}
                <strong style={{ color: GOLD }}>4.000 fonti</strong> — incluse informazioni{" "}
                <strong style={{ color: GOLD }}>pre-pubbliche</strong> — per trasformare i segnali
                deboli in intelligence strategica certificata.
              </p>

              {/* Badge PPV */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-none border" style={{ borderColor: `${GOLD}40`, background: `${GOLD}10` }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.5"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <span className="text-[10px] font-black tracking-wider uppercase" style={{ color: GOLD }}>
                    Certificato ProofPress Verify™
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-none border" style={{ borderColor: `${PAPER}20` }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={`${PAPER}60`} strokeWidth="2.5"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: `${PAPER}50` }}>
                    Notarizzato su IPFS
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-none border" style={{ borderColor: `${PAPER}20` }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={`${PAPER}60`} strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                  <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: `${PAPER}50` }}>
                    Aggiornato ogni 24h
                  </span>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleContact("MONTHLY INTELLIGENCE")}
                  className="px-6 py-3 text-[11px] font-black tracking-[0.15em] uppercase transition-all hover:opacity-90"
                  style={{ background: GOLD, color: INK, fontFamily: FONT }}
                >
                  Richiedi informazioni →
                </button>
                <a
                  href="#piani"
                  className="px-6 py-3 text-[11px] font-black tracking-[0.15em] uppercase border transition-all hover:bg-white/5"
                  style={{ borderColor: `${PAPER}30`, color: `${PAPER}80`, fontFamily: FONT }}
                >
                  Scopri i piani
                </a>
              </div>
            </div>
          </div>

          {/* ── COME FUNZIONA ─────────────────────────────────────────────── */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
            <div className="border-t-4 border-[#0a0a0a] mb-8">
              <h2 className="mt-4 text-2xl sm:text-3xl font-black tracking-tight" style={{ fontFamily: FONT }}>
                Come funziona l'Osservatorio
              </h2>
              <p className="mt-2 text-sm" style={{ color: `${INK}50`, fontFamily: FONT }}>
                Un processo agentico in 4 fasi che trasforma il rumore informativo in intelligence azionabile
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-[#0a0a0a]/10">
              {[
                {
                  step: "01",
                  title: "Acquisizione pre-pubblica",
                  desc: "I nostri agenti AI monitorano continuamente oltre 4.000 fonti — database tecnici, brevetti, preprint scientifici, regulatory filings, forum specializzati — estraendo segnali prima che diventino notizie mainstream.",
                  icon: "🔍",
                },
                {
                  step: "02",
                  title: "Analisi multi-fonte",
                  desc: "Ogni segnale viene incrociato con dati di mercato, analisi competitive e ricerche approfondite. Gli analisti AI identificano pattern, correlazioni e implicazioni strategiche non visibili nelle singole fonti.",
                  icon: "🧠",
                },
                {
                  step: "03",
                  title: "Elaborazione report",
                  desc: "I dati vengono sintetizzati in report strutturati con executive summary, analisi di dettaglio, mappa degli attori chiave e outlook strategico. Ogni report è calibrato sul settore verticale del cliente.",
                  icon: "📝",
                },
                {
                  step: "04",
                  title: "Certificazione PPV",
                  desc: "Ogni report viene certificato attraverso la tecnologia ProofPress Verify™: hash crittografico SHA-256, notarizzazione su IPFS e Trust Score basato su confronto multi-fonte. Ogni informazione è tracciabile e verificabile.",
                  icon: "🔐",
                },
              ].map((step, i) => (
                <div
                  key={step.step}
                  className="p-6 border-r last:border-r-0"
                  style={{ borderColor: `${INK}10`, borderRightColor: i < 3 ? `${INK}10` : "transparent" }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase px-2 py-0.5" style={{ background: INK, color: PAPER }}>
                      {step.step}
                    </span>
                    <span className="text-lg">{step.icon}</span>
                  </div>
                  <h3 className="text-sm font-black mb-2" style={{ fontFamily: FONT, color: INK }}>
                    {step.title}
                  </h3>
                  <p className="text-[12px] leading-relaxed" style={{ color: `${INK}55`, fontFamily: FONT }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── SETTORI ───────────────────────────────────────────────────── */}
          <div style={{ background: `${INK}04` }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
              <div className="border-t-4 border-[#0a0a0a] mb-8">
                <h2 className="mt-4 text-2xl sm:text-3xl font-black tracking-tight" style={{ fontFamily: FONT }}>
                  Settori coperti
                </h2>
                <p className="mt-2 text-sm" style={{ color: `${INK}50`, fontFamily: FONT }}>
                  10 verticali strategici con copertura pre-pubblica e analisi approfondita
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SECTORS.map(s => <SectorCard key={s.id} sector={s} />)}
              </div>
            </div>
          </div>

          {/* ── PIANI ABBONAMENTO ─────────────────────────────────────────── */}
          <div id="piani" className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
            <div className="border-t-4 border-[#0a0a0a] mb-8">
              <h2 className="mt-4 text-2xl sm:text-3xl font-black tracking-tight" style={{ fontFamily: FONT }}>
                Piani di abbonamento
              </h2>
              <p className="mt-2 text-sm" style={{ color: `${INK}50`, fontFamily: FONT }}>
                Tre livelli di approfondimento per ogni esigenza strategica
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLANS.map(plan => (
                <PlanCard key={plan.id} plan={plan} onContact={handleContact} />
              ))}
            </div>
          </div>

          {/* ── PERCHÉ BASE ALPHA ─────────────────────────────────────────── */}
          <div style={{ background: INK, color: PAPER }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
              <div className="border-t-4 mb-8" style={{ borderColor: GOLD }}>
                <h2 className="mt-4 text-2xl sm:text-3xl font-black tracking-tight" style={{ fontFamily: FONT }}>
                  Perché Base Alpha
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {[
                  {
                    stat: "4.000+",
                    label: "Fonti monitorate",
                    desc: "Database tecnici, brevetti, preprint, regulatory filings, forum specializzati — incluse fonti pre-pubbliche non accessibili con ricerche standard.",
                  },
                  {
                    stat: "24h",
                    label: "Ciclo di aggiornamento",
                    desc: "I nostri agenti AI lavorano continuamente. Ogni report riflette lo stato dell'arte aggiornato nelle ultime 24 ore, non la settimana scorsa.",
                  },
                  {
                    stat: "100%",
                    label: "Certificato PPV",
                    desc: "Ogni informazione è certificata con hash crittografico e notarizzata su IPFS. Tracciabilità e verificabilità garantite nel tempo.",
                  },
                ].map(item => (
                  <div key={item.stat}>
                    <p className="text-4xl font-black mb-1" style={{ color: GOLD, fontFamily: FONT }}>{item.stat}</p>
                    <p className="text-[11px] font-black tracking-[0.15em] uppercase mb-3" style={{ color: `${PAPER}50` }}>{item.label}</p>
                    <p className="text-sm leading-relaxed" style={{ color: `${PAPER}65`, fontFamily: FONT }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── FORM CONTATTO ─────────────────────────────────────────────── */}
          <div id="ba-contact-form" className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
            <div className="border-t-4 border-[#0a0a0a] mb-8">
              <h2 className="mt-4 text-2xl sm:text-3xl font-black tracking-tight" style={{ fontFamily: FONT }}>
                Sei interessato?
              </h2>
              <p className="mt-2 text-sm" style={{ color: `${INK}50`, fontFamily: FONT }}>
                Contattaci per ricevere una proposta personalizzata. Il nostro team ti risponderà entro 24 ore.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Info contatto */}
              <div>
                <div className="space-y-4 mb-8">
                  {[
                    { icon: "📧", label: "Email", value: "info@proofpress.ai" },
                    { icon: "🌐", label: "Web", value: "proofpress.ai" },
                    { icon: "🏢", label: "Sede", value: "Milano, Italia" },
                  ].map(c => (
                    <div key={c.label} className="flex items-center gap-3">
                      <span className="text-lg">{c.icon}</span>
                      <div>
                        <p className="text-[10px] font-black tracking-wider uppercase" style={{ color: `${INK}40` }}>{c.label}</p>
                        <p className="text-sm font-semibold" style={{ color: INK, fontFamily: FONT }}>{c.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-5 border" style={{ borderColor: `${GOLD}30`, background: GOLD_LIGHT }}>
                  <p className="text-[11px] font-black tracking-wider uppercase mb-2" style={{ color: GOLD }}>
                    Nota
                  </p>
                  <p className="text-[13px] leading-relaxed" style={{ color: `${INK}70`, fontFamily: FONT }}>
                    Base Alpha è un servizio B2B rivolto a team strategici, fondi di investimento, corporate innovation e C-suite che necessitano di intelligence pre-pubblica certificata per decisioni ad alto impatto.
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black tracking-wider uppercase mb-1" style={{ color: `${INK}50` }}>Nome *</label>
                    <input
                      required
                      value={contactForm.name}
                      onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border outline-none focus:border-[#c9a227] transition-colors"
                      style={{ borderColor: `${INK}20`, background: PAPER, color: INK, fontFamily: FONT }}
                      placeholder="Andrea Cinelli"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black tracking-wider uppercase mb-1" style={{ color: `${INK}50` }}>Email *</label>
                    <input
                      required
                      type="email"
                      value={contactForm.email}
                      onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border outline-none focus:border-[#c9a227] transition-colors"
                      style={{ borderColor: `${INK}20`, background: PAPER, color: INK, fontFamily: FONT }}
                      placeholder="andrea@azienda.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black tracking-wider uppercase mb-1" style={{ color: `${INK}50` }}>Azienda</label>
                  <input
                    value={contactForm.company}
                    onChange={e => setContactForm(f => ({ ...f, company: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border outline-none focus:border-[#c9a227] transition-colors"
                    style={{ borderColor: `${INK}20`, background: PAPER, color: INK, fontFamily: FONT }}
                    placeholder="Nome azienda / fondo"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black tracking-wider uppercase mb-1" style={{ color: `${INK}50` }}>Piano di interesse</label>
                    <select
                      value={contactForm.plan}
                      onChange={e => setContactForm(f => ({ ...f, plan: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border outline-none focus:border-[#c9a227] transition-colors"
                      style={{ borderColor: `${INK}20`, background: PAPER, color: INK, fontFamily: FONT }}
                    >
                      <option value="">Seleziona piano</option>
                      {PLANS.map(p => <option key={p.id} value={p.label}>{p.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black tracking-wider uppercase mb-1" style={{ color: `${INK}50` }}>Settore di interesse</label>
                    <select
                      value={contactForm.sector}
                      onChange={e => setContactForm(f => ({ ...f, sector: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border outline-none focus:border-[#c9a227] transition-colors"
                      style={{ borderColor: `${INK}20`, background: PAPER, color: INK, fontFamily: FONT }}
                    >
                      <option value="">Seleziona settore</option>
                      {SECTORS.map(s => <option key={s.id} value={s.label}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black tracking-wider uppercase mb-1" style={{ color: `${INK}50` }}>Messaggio</label>
                  <textarea
                    rows={4}
                    value={contactForm.message}
                    onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border outline-none focus:border-[#c9a227] transition-colors resize-none"
                    style={{ borderColor: `${INK}20`, background: PAPER, color: INK, fontFamily: FONT }}
                    placeholder="Descrivi brevemente le tue esigenze di intelligence..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 text-[11px] font-black tracking-[0.15em] uppercase transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: INK, color: PAPER, fontFamily: FONT }}
                >
                  {submitting ? "Invio in corso..." : "Invia richiesta →"}
                </button>
              </form>
            </div>
          </div>

          {/* ── FOOTER LINK ───────────────────────────────────────────────── */}
          <div className="border-t" style={{ borderColor: `${INK}10` }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-[11px]" style={{ color: `${INK}40`, fontFamily: FONT }}>
                © 2026 ProofPress · Base Alpha Osservatorio Intelligence
              </p>
              <div className="flex gap-4">
                <Link href="/osservatorio-tech">
                  <span className="text-[11px] font-bold hover:underline cursor-pointer" style={{ color: `${INK}50`, fontFamily: FONT }}>
                    ← Articoli di Andrea Cinelli
                  </span>
                </Link>
                <a href="https://proofpressverify.com" target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold hover:underline" style={{ color: GOLD, fontFamily: FONT }}>
                  ProofPress Verify™ →
                </a>
              </div>
            </div>
          </div>

          <SharedPageFooter />
        </div>
      </div>
    </>
  );
}
