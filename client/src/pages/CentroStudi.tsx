/**
 * /centro-studi — Base Alpha Centro Studi
 * Design: dark editorial premium — navy profondo + rosso ProofPress + accenti grafici
 * Hero: split asimmetrico con pattern grid + numero display + badge animato
 * Layout: editorial magazine con sezioni visivamente distinte
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import SharedPageFooter from "@/components/SharedPageFooter";

// ─── Design tokens ────────────────────────────────────────────────────────────
const RED = "#cc0000";
const NAVY = "#080c18";
const NAVY2 = "#0d1221";
const PAPER = "#f5f0e8";
const FONT_DISPLAY = "'Space Grotesk', sans-serif";
const FONT_BODY = "'DM Sans', sans-serif";

// ─── Settori verticali ────────────────────────────────────────────────────────
const SECTORS = [
  { key: "agrifood", label: "Agrifood & Food Tech", icon: "🌾", desc: "Precision farming, supply chain alimentare, sostenibilità agricola, biotech" },
  { key: "tecnologia", label: "Tecnologia & AI", icon: "🤖", desc: "AI generativa, LLM, automazione, cloud, cybersecurity, deep tech" },
  { key: "manifattura", label: "Manifattura & Industria 4.0", icon: "🏭", desc: "Smart factory, IoT industriale, robotica, manutenzione predittiva" },
  { key: "fintech", label: "Fintech & Financial Services", icon: "💳", desc: "Open banking, pagamenti digitali, insurtech, regtech, DeFi" },
  { key: "automotive", label: "Automotive & Mobility", icon: "🚗", desc: "EV, guida autonoma, mobilità urbana, supply chain automotive" },
  { key: "healthcare", label: "Healthcare & Life Sciences", icon: "🏥", desc: "Digital health, medtech, genomica, AI diagnostica, pharma innovation" },
  { key: "esg", label: "ESG & Sostenibilità", icon: "🌱", desc: "CSRD compliance, carbon accounting, green finance, economia circolare" },
  { key: "realestate", label: "Real Estate & PropTech", icon: "🏢", desc: "Smart building, proptech, mercato immobiliare, facility management" },
  { key: "education", label: "Education & EdTech", icon: "🎓", desc: "Formazione aziendale, e-learning, AI tutor, upskilling workforce" },
  { key: "retail", label: "Retail & E-commerce", icon: "🛍️", desc: "Omnichannel, personalizzazione AI, supply chain retail, D2C" },
  { key: "energy", label: "Energy & Utilities", icon: "⚡", desc: "Energie rinnovabili, smart grid, efficienza energetica, hydrogen economy" },
  { key: "cybersecurity", label: "Cybersecurity & Privacy", icon: "🔒", desc: "Zero trust, AI security, compliance GDPR/NIS2, threat intelligence" },
  { key: "telco", label: "Telco & Media", icon: "📡", desc: "5G, streaming, AI journalism, piattaforme digitali, convergenza media" },
  { key: "startup", label: "Startup & Venture Capital", icon: "🚀", desc: "Ecosistema startup italiano ed europeo, deal flow, fundraising, exit" },
  { key: "luxury", label: "Luxury & Fashion Tech", icon: "💎", desc: "Digital luxury, NFT fashion, supply chain tracciabile, brand experience" },
  { key: "pubblica", label: "Pubblica Amministrazione & GovTech", icon: "🏛️", desc: "Digitalizzazione PA, smart city, open data, procurement innovativo" },
];

// ─── Tipi di report ────────────────────────────────────────────────────────────
const REPORT_TYPES = [
  {
    type: "Osservatorio Settimanale",
    desc: "Report ricorrente su un settore verticale. Fonti verificate con ProofPress Verify™, curato dal Centro Studi.",
    badge: "ABBONAMENTO",
    badgeColor: RED,
    cta: "abbonamento_report" as const,
    icon: "📊",
    highlight: "Delivery settimanale",
  },
  {
    type: "Report Custom",
    desc: "Analisi su misura per una specifica domanda di business. Metodologia proprietaria, dati primari e secondari, consegna in 5-10 giorni.",
    badge: "SU COMMISSIONE",
    badgeColor: "#1a3a5c",
    cta: "report_custom" as const,
    icon: "🎯",
    highlight: "Consegna in 5-10 giorni",
  },
  {
    type: "Osservatorio Tematico",
    desc: "Ricerca approfondita su un tema trasversale (es. AI Act, CSRD, mercato M&A). Formato white paper, citabile e distribuibile.",
    badge: "PROGETTO",
    badgeColor: "#1a2a1a",
    cta: "osservatorio" as const,
    icon: "📋",
    highlight: "White paper certificato",
  },
];

// ─── Form lead ────────────────────────────────────────────────────────────────
function LeadForm({ defaultInterest }: { defaultInterest?: string }) {
  const [form, setForm] = useState({
    name: "", email: "", company: "", role: "",
    sector: "", interest: defaultInterest || "abbonamento_report", message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const submitLead = trpc.centroStudi.submitLead.useMutation({
    onSuccess: () => { setSubmitted(true); toast.success("Richiesta inviata — Ti risponderemo entro 24 ore lavorative."); },
    onError: (err) => { toast.error(err.message); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Compila nome e email");
      return;
    }
    submitLead.mutate({
      name: form.name,
      email: form.email,
      company: form.company || undefined,
      role: form.role || undefined,
      sector: form.sector || undefined,
      interest: form.interest as "abbonamento_report" | "report_custom" | "osservatorio" | "informazioni",
      message: form.message || undefined,
      source: "centro-studi",
    });
  };

  if (submitted) {
    return (
      <div className="text-center py-16 px-6">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: RED + "20", border: `2px solid ${RED}` }}>
          <span className="text-2xl">✓</span>
        </div>
        <h3 className="text-2xl font-black mb-3" style={{ color: PAPER, fontFamily: FONT_DISPLAY }}>
          Richiesta ricevuta
        </h3>
        <p className="text-sm max-w-sm mx-auto" style={{ color: PAPER + "70", fontFamily: FONT_BODY }}>
          Andrea Cinelli o un membro del Centro Studi ti risponderà entro 24 ore lavorative.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: PAPER + "50", fontFamily: FONT_DISPLAY }}>Nome e Cognome *</label>
          <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-4 py-3 text-sm rounded-none bg-white/5 border border-white/10 focus:border-red-600 focus:outline-none transition-colors"
            style={{ color: PAPER, fontFamily: FONT_BODY }} placeholder="Mario Rossi" />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: PAPER + "50", fontFamily: FONT_DISPLAY }}>Email *</label>
          <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="w-full px-4 py-3 text-sm rounded-none bg-white/5 border border-white/10 focus:border-red-600 focus:outline-none transition-colors"
            style={{ color: PAPER, fontFamily: FONT_BODY }} placeholder="mario@azienda.it" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: PAPER + "50", fontFamily: FONT_DISPLAY }}>Azienda</label>
          <input type="text" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
            className="w-full px-4 py-3 text-sm rounded-none bg-white/5 border border-white/10 focus:border-red-600 focus:outline-none transition-colors"
            style={{ color: PAPER, fontFamily: FONT_BODY }} placeholder="Nome Azienda" />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: PAPER + "50", fontFamily: FONT_DISPLAY }}>Ruolo</label>
          <input type="text" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            className="w-full px-4 py-3 text-sm rounded-none bg-white/5 border border-white/10 focus:border-red-600 focus:outline-none transition-colors"
            style={{ color: PAPER, fontFamily: FONT_BODY }} placeholder="CEO, CMO, Head of Strategy..." />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: PAPER + "50", fontFamily: FONT_DISPLAY }}>Settore di interesse</label>
          <select value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}
            className="w-full px-4 py-3 text-sm rounded-none bg-white/5 border border-white/10 focus:border-red-600 focus:outline-none transition-colors"
            style={{ color: PAPER, fontFamily: FONT_BODY, backgroundColor: "#0d1221" }}>
            <option value="">Seleziona settore</option>
            {SECTORS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: PAPER + "50", fontFamily: FONT_DISPLAY }}>Tipo di interesse</label>
          <select value={form.interest} onChange={e => setForm(f => ({ ...f, interest: e.target.value }))}
            className="w-full px-4 py-3 text-sm rounded-none bg-white/5 border border-white/10 focus:border-red-600 focus:outline-none transition-colors"
            style={{ color: PAPER, fontFamily: FONT_BODY, backgroundColor: "#0d1221" }}>
            <option value="abbonamento_report">Abbonamento Report Settimanali</option>
            <option value="report_custom">Report Custom su Commissione</option>
            <option value="osservatorio">Osservatorio Tematico</option>
            <option value="informazioni">Informazioni Generali</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: PAPER + "50", fontFamily: FONT_DISPLAY }}>Messaggio (opzionale)</label>
        <textarea rows={3} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          className="w-full px-4 py-3 text-sm rounded-none bg-white/5 border border-white/10 focus:border-red-600 focus:outline-none transition-colors resize-none"
          style={{ color: PAPER, fontFamily: FONT_BODY }} placeholder="Descrivi brevemente la tua esigenza..." />
      </div>
      <button type="submit" disabled={submitLead.isPending}
        className="w-full py-4 text-sm font-black tracking-widest uppercase transition-opacity hover:opacity-85 disabled:opacity-50"
        style={{ backgroundColor: RED, color: PAPER, fontFamily: FONT_DISPLAY }}>
        {submitLead.isPending ? "Invio in corso..." : "Invia Richiesta →"}
      </button>
      <p className="text-[10px] text-center" style={{ color: PAPER + "35", fontFamily: FONT_BODY }}>
        I tuoi dati non vengono condivisi con terze parti. Risposta garantita entro 24h lavorative.
      </p>
    </form>
  );
}

// ─── Componente principale ────────────────────────────────────────────────────
export default function CentroStudi() {
  const [activeSector, setActiveSector] = useState<string | null>(null);
  const [formInterest, setFormInterest] = useState<string>("abbonamento_report");

  const scrollToForm = (interest: string) => {
    setFormInterest(interest);
    setTimeout(() => {
      document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: NAVY }}>
      <Navbar />
      
      <MobileNav />

      <main className="pl-0 md:pl-12 pt-16">

        {/* ══ HERO — split asimmetrico con pattern e numero display ══════════ */}
        <section
          className="relative overflow-hidden"
          style={{ backgroundColor: NAVY, minHeight: "92vh" }}
        >
          {/* Pattern griglia di sfondo */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(rgba(204,0,0,0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(204,0,0,0.04) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }}
          />
          {/* Linea verticale rossa decorativa */}
          <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: RED }} />
          {/* Numero display gigante in background */}
          <div
            className="absolute right-0 top-0 select-none pointer-events-none hidden lg:block"
            style={{
              fontSize: "clamp(200px, 28vw, 420px)",
              fontFamily: FONT_DISPLAY,
              fontWeight: 900,
              color: "rgba(204,0,0,0.04)",
              lineHeight: 1,
              letterSpacing: "-0.05em",
              userSelect: "none",
            }}
          >
            BA
          </div>

          <div className="relative z-10 px-8 md:px-16 lg:px-24 pt-20 pb-16 max-w-7xl">
            {/* Breadcrumb / tag */}
            <div className="flex items-center gap-4 mb-10">
              <span
                className="px-3 py-1.5 text-[10px] font-black tracking-widest uppercase"
                style={{ backgroundColor: RED, color: PAPER, fontFamily: FONT_DISPLAY }}
              >
                CENTRO STUDI
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: PAPER + "35", fontFamily: FONT_DISPLAY }}>
                BASE ALPHA RESEARCH · PROOFPRESS
              </span>
            </div>

            {/* Headline principale — tipografia display */}
            <div className="mb-8">
              <h1
                className="font-black leading-none mb-2"
                style={{
                  fontFamily: FONT_DISPLAY,
                  color: PAPER,
                  fontSize: "clamp(48px, 8vw, 110px)",
                  letterSpacing: "-0.03em",
                  lineHeight: 0.92,
                }}
              >
                Osservatori
              </h1>
              <h1
                className="font-black leading-none mb-2"
                style={{
                  fontFamily: FONT_DISPLAY,
                  color: RED,
                  fontSize: "clamp(48px, 8vw, 110px)",
                  letterSpacing: "-0.03em",
                  lineHeight: 0.92,
                }}
              >
                e Report
              </h1>
              <h1
                className="font-black leading-none"
                style={{
                  fontFamily: FONT_DISPLAY,
                  color: PAPER + "30",
                  fontSize: "clamp(48px, 8vw, 110px)",
                  letterSpacing: "-0.03em",
                  lineHeight: 0.92,
                }}
              >
                Verificati.
              </h1>
            </div>

            {/* Sottotitolo + CTA in layout split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-14">
              <div>
                <p
                  className="text-lg leading-relaxed mb-8"
                  style={{ color: PAPER + "75", fontFamily: FONT_BODY, maxWidth: "480px" }}
                >
                  Base Alpha è l'Osservatorio e Centro Studi di ProofPress, guidato da{" "}
                  <strong style={{ color: PAPER }}>Andrea Cinelli</strong>.
                  Sviluppiamo per oltre{" "}
                  <strong style={{ color: RED }}>200 clienti</strong> report settoriali
                  certificati con tecnologia{" "}
                  <strong style={{ color: PAPER }}>ProofPress Verify™</strong> —
                  dati verificabili, fonti tracciabili, insight per board e C-suite.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => scrollToForm("abbonamento_report")}
                    className="px-8 py-4 text-sm font-black tracking-widest uppercase transition-all hover:opacity-90 active:scale-95"
                    style={{ backgroundColor: RED, color: PAPER, fontFamily: FONT_DISPLAY }}
                  >
                    Abbonati ai Report →
                  </button>
                  <button
                    onClick={() => scrollToForm("report_custom")}
                    className="px-8 py-4 text-sm font-black tracking-widest uppercase transition-all hover:bg-white/10"
                    style={{ border: `1px solid ${PAPER}30`, color: PAPER, fontFamily: FONT_DISPLAY }}
                  >
                    Report Custom
                  </button>
                </div>
              </div>

              {/* KPI block — design card con bordo rosso */}
              <div className="grid grid-cols-2 gap-px" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                {[
                  { n: "200+", label: "Clienti serviti", sub: "C-suite e board" },
                  { n: "30+", label: "Anni di execution", sub: "Esperienza diretta" },
                  { n: "16", label: "Settori verticali", sub: "Copertura completa" },
                  { n: "100%", label: "Fonti verificate", sub: "ProofPress Verify™" },
                ].map((kpi, i) => (
                  <div
                    key={kpi.label}
                    className="p-6 flex flex-col justify-between"
                    style={{
                      backgroundColor: i === 0 ? RED : NAVY2,
                      borderTop: i === 0 ? "none" : `1px solid rgba(255,255,255,0.05)`,
                    }}
                  >
                    <p
                      className="text-4xl font-black leading-none mb-1"
                      style={{ color: i === 0 ? PAPER : PAPER, fontFamily: FONT_DISPLAY }}
                    >
                      {kpi.n}
                    </p>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider" style={{ color: i === 0 ? PAPER + "cc" : PAPER, fontFamily: FONT_DISPLAY }}>{kpi.label}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: i === 0 ? PAPER + "80" : PAPER + "40", fontFamily: FONT_BODY }}>{kpi.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ticker / proof bar */}
            <div className="mt-16 pt-6 border-t flex flex-wrap gap-8 items-center" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              {["Agrifood", "Fintech", "Healthcare", "AI & Tech", "ESG", "Automotive", "Manifattura", "Startup"].map(tag => (
                <span key={tag} className="text-[10px] font-bold tracking-widest uppercase" style={{ color: PAPER + "30", fontFamily: FONT_DISPLAY }}>
                  {tag}
                </span>
              ))}
              <span className="ml-auto text-[10px] font-bold" style={{ color: RED, fontFamily: FONT_DISPLAY }}>
                ● REPORT SETTIMANALI ATTIVI
              </span>
            </div>
          </div>
        </section>

        {/* ══ COSA PRODUCIAMO — card orizzontali con numero editoriale ═══════ */}
        <section style={{ backgroundColor: NAVY2 }} className="px-8 md:px-16 lg:px-24 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-12 border-b pb-6" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <div>
                <p className="text-[10px] font-black tracking-widest uppercase mb-2" style={{ color: RED, fontFamily: FONT_DISPLAY }}>COSA PRODUCIAMO</p>
                <h2 className="text-3xl md:text-4xl font-black" style={{ color: PAPER, fontFamily: FONT_DISPLAY }}>
                  Tre formati.<br />Un solo standard.
                </h2>
              </div>
              <span className="text-6xl font-black hidden md:block" style={{ color: "rgba(255,255,255,0.04)", fontFamily: FONT_DISPLAY }}>03</span>
            </div>

            <div className="space-y-px">
              {REPORT_TYPES.map((rt, idx) => (
                <div
                  key={rt.type}
                  className="group flex flex-col md:flex-row gap-0 transition-all hover:bg-white/3 cursor-pointer"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                  onClick={() => scrollToForm(rt.cta)}
                >
                  {/* Numero */}
                  <div className="flex-none w-full md:w-20 flex items-center justify-start md:justify-center py-6 px-6 md:px-0">
                    <span className="text-5xl font-black" style={{ color: "rgba(255,255,255,0.07)", fontFamily: FONT_DISPLAY }}>
                      0{idx + 1}
                    </span>
                  </div>
                  {/* Icona */}
                  <div className="flex-none w-16 hidden md:flex items-center justify-center">
                    <span className="text-2xl">{rt.icon}</span>
                  </div>
                  {/* Contenuto */}
                  <div className="flex-1 py-6 px-6 md:px-8">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span
                        className="px-2 py-0.5 text-[9px] font-black tracking-widest uppercase"
                        style={{ backgroundColor: rt.badgeColor, color: PAPER, fontFamily: FONT_DISPLAY }}
                      >
                        {rt.badge}
                      </span>
                      <h3 className="text-lg font-black" style={{ color: PAPER, fontFamily: FONT_DISPLAY }}>{rt.type}</h3>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: PAPER + "60", fontFamily: FONT_BODY, maxWidth: "560px" }}>{rt.desc}</p>
                  </div>
                  {/* CTA + highlight */}
                  <div className="flex-none flex flex-col items-end justify-center py-6 px-6 gap-2">
                    <span className="text-[10px] font-bold" style={{ color: RED, fontFamily: FONT_DISPLAY }}>{rt.highlight}</span>
                    <span
                      className="text-xs font-black tracking-wide opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: PAPER, fontFamily: FONT_DISPLAY }}
                    >
                      Richiedi →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ SETTORI — griglia con hover espansivo ══════════════════════════ */}
        <section className="px-8 md:px-16 lg:px-24 py-20" style={{ backgroundColor: NAVY }}>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-14">
              <div>
                <p className="text-[10px] font-black tracking-widest uppercase mb-3" style={{ color: RED, fontFamily: FONT_DISPLAY }}>SETTORI VERTICALI</p>
                <h2 className="text-3xl md:text-5xl font-black leading-none" style={{ color: PAPER, fontFamily: FONT_DISPLAY }}>
                  16 verticali.<br />
                  <span style={{ color: PAPER + "35" }}>Un solo standard</span><br />
                  <span style={{ color: PAPER + "35" }}>di qualità.</span>
                </h2>
              </div>
              <div className="flex items-end">
                <p className="text-sm leading-relaxed" style={{ color: PAPER + "55", fontFamily: FONT_BODY }}>
                  Ogni settore ha un team dedicato, un set di fonti verificate e una metodologia calibrata
                  sulle specificità del mercato. Non trovi il tuo verticale? Operiamo anche su settori custom.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
              {SECTORS.map(s => (
                <button
                  key={s.key}
                  onClick={() => setActiveSector(activeSector === s.key ? null : s.key)}
                  className="text-left p-5 transition-all group"
                  style={{
                    backgroundColor: activeSector === s.key ? RED : NAVY2,
                    minHeight: "100px",
                  }}
                >
                  <span className="text-2xl mb-3 block">{s.icon}</span>
                  <p
                    className="text-xs font-black leading-tight"
                    style={{ color: activeSector === s.key ? PAPER : PAPER + "80", fontFamily: FONT_DISPLAY }}
                  >
                    {s.label}
                  </p>
                  {activeSector === s.key && (
                    <p className="text-[10px] leading-relaxed mt-2" style={{ color: PAPER + "80", fontFamily: FONT_BODY }}>
                      {s.desc}
                    </p>
                  )}
                </button>
              ))}
            </div>
            <p className="mt-5 text-[10px]" style={{ color: PAPER + "30", fontFamily: FONT_BODY }}>
              Clicca su un settore per vedere il dettaglio tematico.
            </p>
          </div>
        </section>

        {/* ══ METODOLOGIA — timeline orizzontale con accenti grafici ═════════ */}
        <section style={{ backgroundColor: NAVY2 }} className="px-8 md:px-16 lg:px-24 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-14 border-b pb-6" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <div>
                <p className="text-[10px] font-black tracking-widest uppercase mb-2" style={{ color: RED, fontFamily: FONT_DISPLAY }}>METODOLOGIA</p>
                <h2 className="text-3xl md:text-4xl font-black" style={{ color: PAPER, fontFamily: FONT_DISPLAY }}>
                  Come costruiamo<br />ogni report.
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
              {[
                { n: "01", title: "Raccolta fonti", desc: "Aggregazione da 200+ fonti verificate per settore — istituzionali, accademiche, industry reports", icon: "📡" },
                { n: "02", title: "Verifica Verify™", desc: "Ogni dato viene corroborato con ProofPress Verify™: Trust Score, source credibility, contradiction check", icon: "🔍" },
                { n: "03", title: "Analisi Centro Studi", desc: "Il team guidato da Andrea Cinelli trasforma i dati in insight strategici per board e C-suite", icon: "🧠" },
                { n: "04", title: "Certificazione IPFS", desc: "Il report viene hashato SHA-256 e archiviato su IPFS — immutabile, verificabile, citabile", icon: "🔐" },
              ].map((step, idx) => (
                <div
                  key={step.n}
                  className="relative p-8"
                  style={{
                    borderLeft: idx === 0 ? `3px solid ${RED}` : "1px solid rgba(255,255,255,0.06)",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <p className="text-5xl font-black leading-none" style={{ color: RED, fontFamily: FONT_DISPLAY }}>{step.n}</p>
                    <span className="text-2xl">{step.icon}</span>
                  </div>
                  <p className="text-sm font-black mb-3" style={{ color: PAPER, fontFamily: FONT_DISPLAY }}>{step.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: PAPER + "55", fontFamily: FONT_BODY }}>{step.desc}</p>
                  {/* Connettore freccia */}
                  {idx < 3 && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 hidden md:flex items-center justify-center z-10"
                      style={{ color: RED, fontFamily: FONT_DISPLAY, fontSize: "10px" }}>
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ ANDREA CINELLI — credenziali del direttore ═════════════════════ */}
        <section
          className="px-8 md:px-16 lg:px-24 py-20 relative overflow-hidden"
          style={{ backgroundColor: RED }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />
          <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
            <div className="md:col-span-2">
              <p className="text-[10px] font-black tracking-widest uppercase mb-4" style={{ color: PAPER + "70", fontFamily: FONT_DISPLAY }}>DIRETTORE DEL CENTRO STUDI</p>
              <h2 className="text-4xl md:text-5xl font-black leading-none mb-6" style={{ color: PAPER, fontFamily: FONT_DISPLAY }}>
                Andrea Cinelli
              </h2>
              <p className="text-base leading-relaxed mb-6" style={{ color: PAPER + "85", fontFamily: FONT_BODY, maxWidth: "520px" }}>
                Serial entrepreneur con 30+ anni di execution. Co-fondatore di Libero.it (10M+ utenti),
                ex Head of Mobile VAS Vodafone Global, fondatore di 12+ venture AI.
                Membro Advisory Board Deloitte CM. Professore di AI a Il Sole 24 Ore Business School.
                Autore di 25+ brevetti.
              </p>
              <div className="flex flex-wrap gap-3">
                {["30+ anni", "12+ venture AI", "25+ brevetti", "Deloitte Advisory Board", "Il Sole 24 Ore"].map(tag => (
                  <span key={tag} className="px-3 py-1 text-[10px] font-black tracking-wide uppercase" style={{ backgroundColor: "rgba(0,0,0,0.2)", color: PAPER, fontFamily: FONT_DISPLAY }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <a href="/andrea-cinelli" className="block p-5 transition-all hover:bg-black/10" style={{ border: "1px solid rgba(255,255,255,0.2)" }}>
                <p className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: PAPER, fontFamily: FONT_DISPLAY }}>Profilo completo →</p>
                <p className="text-[10px]" style={{ color: PAPER + "70", fontFamily: FONT_BODY }}>Bio, pubblicazioni, editoriali e keynote</p>
              </a>
              <a href="https://www.linkedin.com/in/andreacinelli" target="_blank" rel="noopener noreferrer" className="block p-5 transition-all hover:bg-black/10" style={{ border: "1px solid rgba(255,255,255,0.2)" }}>
                <p className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: PAPER, fontFamily: FONT_DISPLAY }}>LinkedIn →</p>
                <p className="text-[10px]" style={{ color: PAPER + "70", fontFamily: FONT_BODY }}>Seguici per gli aggiornamenti settimanali</p>
              </a>
            </div>
          </div>
        </section>

        {/* ══ FORM LEAD — dark con accento editoriale ════════════════════════ */}
        <section id="lead-form" className="px-8 md:px-16 lg:px-24 py-20" style={{ backgroundColor: NAVY }}>
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-16">
            {/* Colonna sinistra — copy */}
            <div className="lg:col-span-2">
              <p className="text-[10px] font-black tracking-widest uppercase mb-4" style={{ color: RED, fontFamily: FONT_DISPLAY }}>CONTATTO DIRETTO</p>
              <h2 className="text-3xl md:text-4xl font-black leading-none mb-6" style={{ color: PAPER, fontFamily: FONT_DISPLAY }}>
                Parla con<br />il Centro Studi.
              </h2>
              <p className="text-sm leading-relaxed mb-8" style={{ color: PAPER + "55", fontFamily: FONT_BODY }}>
                Andrea Cinelli o un membro del team ti risponde entro 24 ore lavorative.
                Ogni richiesta viene letta personalmente.
              </p>
              {/* Garanzie */}
              <div className="space-y-4">
                {[
                  { icon: "⚡", text: "Risposta in 24h lavorative" },
                  { icon: "🔒", text: "Dati non condivisi con terze parti" },
                  { icon: "🎯", text: "Preventivo personalizzato per settore" },
                ].map(g => (
                  <div key={g.text} className="flex items-center gap-3">
                    <span className="text-base">{g.icon}</span>
                    <span className="text-xs font-bold" style={{ color: PAPER + "60", fontFamily: FONT_BODY }}>{g.text}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Colonna destra — form */}
            <div className="lg:col-span-3">
              <div className="p-8 md:p-10" style={{ backgroundColor: NAVY2, border: "1px solid rgba(255,255,255,0.07)" }}>
                <LeadForm defaultInterest={formInterest} />
              </div>
            </div>
          </div>
        </section>

      </main>
      <SharedPageFooter />
    </div>
  );
}
