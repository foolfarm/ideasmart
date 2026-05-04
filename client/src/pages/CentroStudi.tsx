/**
 * /centro-studi — Base Alpha Centro Studi
 * Catalogo report per settore + form lead inline
 * Design: dark editorial (navy/nero) + rosso ProofPress + bianco
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import LeftSidebar from "@/components/LeftSidebar";
import MobileNav from "@/components/MobileNav";
import SharedPageFooter from "@/components/SharedPageFooter";

// ─── Design tokens ────────────────────────────────────────────────────────────
const RED = "#cc0000";
const NAVY = "#0a0f1e";
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
    cta: "abbonamento_report",
  },
  {
    type: "Report Custom",
    desc: "Analisi su misura per una specifica domanda di business. Metodologia proprietaria, dati primari e secondari, consegna in 5-10 giorni.",
    badge: "SU COMMISSIONE",
    badgeColor: "#1a5276",
    cta: "report_custom",
  },
  {
    type: "Osservatorio Tematico",
    desc: "Ricerca approfondita su un tema trasversale (es. AI Act, CSRD, mercato M&A). Formato white paper, citabile e distribuibile.",
    badge: "PROGETTO",
    badgeColor: "#1e8449",
    cta: "osservatorio",
  },
];

// ─── Form lead ────────────────────────────────────────────────────────────────
function LeadForm({ defaultInterest }: { defaultInterest?: string }) {
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    sector: "",
    interest: defaultInterest ?? "informazioni",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const submitLead = trpc.centroStudi.submitLead.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Richiesta inviata — Ti risponderemo entro 24 ore lavorative.");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
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
      <div className="text-center py-12 px-6">
        <div className="text-4xl mb-4">✓</div>
        <h3 className="text-xl font-bold mb-2" style={{ color: PAPER, fontFamily: FONT_DISPLAY }}>
          Richiesta ricevuta
        </h3>
        <p className="text-sm" style={{ color: PAPER + "80", fontFamily: FONT_BODY }}>
          Andrea Cinelli o un membro del Centro Studi ti risponderà entro 24 ore lavorative.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: PAPER + "60", fontFamily: FONT_DISPLAY }}>
            Nome e Cognome *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2 text-sm rounded bg-white/5 border border-white/10 focus:border-red-500 focus:outline-none transition-colors"
            style={{ color: PAPER, fontFamily: FONT_BODY }}
            placeholder="Mario Rossi"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: PAPER + "60", fontFamily: FONT_DISPLAY }}>
            Email *
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="w-full px-3 py-2 text-sm rounded bg-white/5 border border-white/10 focus:border-red-500 focus:outline-none transition-colors"
            style={{ color: PAPER, fontFamily: FONT_BODY }}
            placeholder="mario@azienda.it"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: PAPER + "60", fontFamily: FONT_DISPLAY }}>
            Azienda
          </label>
          <input
            type="text"
            value={form.company}
            onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
            className="w-full px-3 py-2 text-sm rounded bg-white/5 border border-white/10 focus:border-red-500 focus:outline-none transition-colors"
            style={{ color: PAPER, fontFamily: FONT_BODY }}
            placeholder="Nome Azienda"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: PAPER + "60", fontFamily: FONT_DISPLAY }}>
            Ruolo
          </label>
          <input
            type="text"
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            className="w-full px-3 py-2 text-sm rounded bg-white/5 border border-white/10 focus:border-red-500 focus:outline-none transition-colors"
            style={{ color: PAPER, fontFamily: FONT_BODY }}
            placeholder="CEO, CMO, Head of Strategy..."
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: PAPER + "60", fontFamily: FONT_DISPLAY }}>
            Settore di interesse
          </label>
          <select
            value={form.sector}
            onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}
            className="w-full px-3 py-2 text-sm rounded bg-white/5 border border-white/10 focus:border-red-500 focus:outline-none transition-colors"
            style={{ color: PAPER, fontFamily: FONT_BODY, backgroundColor: "#1a1f2e" }}
          >
            <option value="">Seleziona settore</option>
            {SECTORS.map(s => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: PAPER + "60", fontFamily: FONT_DISPLAY }}>
            Tipo di interesse
          </label>
          <select
            value={form.interest}
            onChange={e => setForm(f => ({ ...f, interest: e.target.value }))}
            className="w-full px-3 py-2 text-sm rounded bg-white/5 border border-white/10 focus:border-red-500 focus:outline-none transition-colors"
            style={{ color: PAPER, fontFamily: FONT_BODY, backgroundColor: "#1a1f2e" }}
          >
            <option value="abbonamento_report">Abbonamento Report Settimanali</option>
            <option value="report_custom">Report Custom su Commissione</option>
            <option value="osservatorio">Osservatorio Tematico</option>
            <option value="informazioni">Informazioni Generali</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: PAPER + "60", fontFamily: FONT_DISPLAY }}>
          Messaggio (opzionale)
        </label>
        <textarea
          rows={3}
          value={form.message}
          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          className="w-full px-3 py-2 text-sm rounded bg-white/5 border border-white/10 focus:border-red-500 focus:outline-none transition-colors resize-none"
          style={{ color: PAPER, fontFamily: FONT_BODY }}
          placeholder="Descrivi brevemente la tua esigenza..."
        />
      </div>
      <button
        type="submit"
        disabled={submitLead.isPending}
        className="w-full py-3 text-sm font-bold tracking-wide transition-opacity hover:opacity-85 disabled:opacity-50"
        style={{ backgroundColor: RED, color: PAPER, fontFamily: FONT_DISPLAY }}
      >
        {submitLead.isPending ? "Invio in corso..." : "Invia Richiesta →"}
      </button>
      <p className="text-[10px] text-center" style={{ color: PAPER + "40", fontFamily: FONT_BODY }}>
        I tuoi dati non vengono condivisi con terze parti. Risposta garantita entro 24h lavorative.
      </p>
    </form>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CentroStudi() {
  const [activeSector, setActiveSector] = useState<string | null>(null);
  const [formInterest, setFormInterest] = useState("informazioni");

  const handleSectorCTA = (interest: string) => {
    setFormInterest(interest);
    document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: NAVY }}>
      <Navbar />
      <LeftSidebar />
      <MobileNav />

      <main className="pl-0 md:pl-12 pt-16">
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="px-6 md:px-12 lg:px-20 pt-16 pb-12 border-b border-white/8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 text-[10px] font-black tracking-widest uppercase" style={{ backgroundColor: RED, color: PAPER, fontFamily: FONT_DISPLAY }}>
                CENTRO STUDI
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: PAPER + "40", fontFamily: FONT_DISPLAY }}>
                BASE ALPHA RESEARCH
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black leading-none mb-6" style={{ color: PAPER, fontFamily: FONT_DISPLAY }}>
              Osservatori e Report<br />
              <span style={{ color: RED }}>Verificati su Misura</span>
            </h1>
            <p className="text-base md:text-lg leading-relaxed max-w-2xl mb-8" style={{ color: PAPER + "80", fontFamily: FONT_BODY }}>
              Base Alpha è l'Osservatorio e Centro Studi di ProofPress, guidato da <strong style={{ color: PAPER }}>Andrea Cinelli</strong>.
              Sviluppiamo per oltre <strong style={{ color: RED }}>200 clienti</strong> report settoriali, osservatori tematici e analisi di mercato
              certificati con tecnologia <strong style={{ color: PAPER }}>ProofPress Verify™</strong> — dati verificabili, fonti tracciabili,
              insight azionabili per board e C-suite.
            </p>
            {/* KPI row */}
            <div className="flex flex-wrap gap-8 mb-8">
              {[
                { n: "200+", label: "Clienti serviti" },
                { n: "30+", label: "Anni di execution" },
                { n: "16", label: "Settori verticali" },
                { n: "100%", label: "Fonti verificate Verify™" },
              ].map(kpi => (
                <div key={kpi.label}>
                  <p className="text-3xl font-black leading-none" style={{ color: PAPER, fontFamily: FONT_DISPLAY }}>{kpi.n}</p>
                  <p className="text-[10px] font-bold tracking-wider uppercase mt-1" style={{ color: PAPER + "40", fontFamily: FONT_DISPLAY }}>{kpi.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Tipi di report ───────────────────────────────────────────────── */}
        <section className="px-6 md:px-12 lg:px-20 py-14 border-b border-white/8">
          <div className="max-w-5xl mx-auto">
            <p className="text-[10px] font-black tracking-widest uppercase mb-8" style={{ color: RED, fontFamily: FONT_DISPLAY }}>
              COSA PRODUCIAMO
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {REPORT_TYPES.map(rt => (
                <div key={rt.type} className="border border-white/8 p-6 hover:border-white/20 transition-colors">
                  <span className="inline-block px-2 py-0.5 text-[9px] font-black tracking-widest uppercase mb-4" style={{ backgroundColor: rt.badgeColor, color: PAPER, fontFamily: FONT_DISPLAY }}>
                    {rt.badge}
                  </span>
                  <h3 className="text-base font-black mb-3" style={{ color: PAPER, fontFamily: FONT_DISPLAY }}>{rt.type}</h3>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: PAPER + "70", fontFamily: FONT_BODY }}>{rt.desc}</p>
                  <button
                    onClick={() => handleSectorCTA(rt.cta)}
                    className="text-xs font-bold tracking-wide transition-opacity hover:opacity-70"
                    style={{ color: RED, fontFamily: FONT_DISPLAY }}
                  >
                    Richiedi informazioni →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Settori verticali ────────────────────────────────────────────── */}
        <section className="px-6 md:px-12 lg:px-20 py-14 border-b border-white/8">
          <div className="max-w-5xl mx-auto">
            <p className="text-[10px] font-black tracking-widest uppercase mb-2" style={{ color: RED, fontFamily: FONT_DISPLAY }}>
              SETTORI VERTICALI
            </p>
            <h2 className="text-2xl md:text-3xl font-black mb-8" style={{ color: PAPER, fontFamily: FONT_DISPLAY }}>
              16 Verticali. Un solo standard di qualità.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SECTORS.map(s => (
                <button
                  key={s.key}
                  onClick={() => {
                    setActiveSector(activeSector === s.key ? null : s.key);
                  }}
                  className="text-left p-4 border transition-all"
                  style={{
                    borderColor: activeSector === s.key ? RED : "rgba(255,255,255,0.08)",
                    backgroundColor: activeSector === s.key ? RED + "15" : "transparent",
                  }}
                >
                  <span className="text-xl mb-2 block">{s.icon}</span>
                  <p className="text-xs font-bold leading-tight mb-1" style={{ color: PAPER, fontFamily: FONT_DISPLAY }}>{s.label}</p>
                  {activeSector === s.key && (
                    <p className="text-[11px] leading-relaxed mt-2" style={{ color: PAPER + "70", fontFamily: FONT_BODY }}>{s.desc}</p>
                  )}
                </button>
              ))}
            </div>
            <p className="mt-6 text-xs" style={{ color: PAPER + "40", fontFamily: FONT_BODY }}>
              Clicca su un settore per vedere il dettaglio tematico. Non trovi il tuo settore? Contattaci — operiamo anche su verticali custom.
            </p>
          </div>
        </section>

        {/* ── Metodologia ──────────────────────────────────────────────────── */}
        <section className="px-6 md:px-12 lg:px-20 py-14 border-b border-white/8">
          <div className="max-w-5xl mx-auto">
            <p className="text-[10px] font-black tracking-widest uppercase mb-8" style={{ color: RED, fontFamily: FONT_DISPLAY }}>
              METODOLOGIA
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { n: "01", title: "Raccolta fonti", desc: "Aggregazione da 200+ fonti verificate per settore — istituzionali, accademiche, industry" },
                { n: "02", title: "Verifica Verify™", desc: "Ogni dato viene corroborato con ProofPress Verify™: Trust Score, source credibility, contradiction check" },
                { n: "03", title: "Analisi Centro Studi", desc: "Il team guidato da Andrea Cinelli trasforma i dati in insight strategici per board e C-suite" },
                { n: "04", title: "Certificazione IPFS", desc: "Il report viene hashato SHA-256 e archiviato su IPFS — immutabile, verificabile, citabile" },
              ].map(step => (
                <div key={step.n} className="border-t border-white/10 pt-4">
                  <p className="text-3xl font-black mb-3" style={{ color: RED, fontFamily: FONT_DISPLAY }}>{step.n}</p>
                  <p className="text-sm font-bold mb-2" style={{ color: PAPER, fontFamily: FONT_DISPLAY }}>{step.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: PAPER + "60", fontFamily: FONT_BODY }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Form lead ────────────────────────────────────────────────────── */}
        <section id="lead-form" className="px-6 md:px-12 lg:px-20 py-16">
          <div className="max-w-2xl mx-auto">
            <p className="text-[10px] font-black tracking-widest uppercase mb-3" style={{ color: RED, fontFamily: FONT_DISPLAY }}>
              CONTATTO DIRETTO
            </p>
            <h2 className="text-2xl md:text-3xl font-black mb-3" style={{ color: PAPER, fontFamily: FONT_DISPLAY }}>
              Parla con il Centro Studi
            </h2>
            <p className="text-sm mb-8" style={{ color: PAPER + "60", fontFamily: FONT_BODY }}>
              Compila il form — Andrea Cinelli o un membro del team ti risponde entro 24 ore lavorative.
            </p>
            <div className="border border-white/10 p-6 md:p-8">
              <LeadForm defaultInterest={formInterest} />
            </div>
          </div>
        </section>
      </main>

      <SharedPageFooter />
    </div>
  );
}
