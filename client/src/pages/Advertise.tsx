/**
 * IDEASMART — Pagina Advertise / Media Kit
 * Design: Deep navy + Cyan + Orange — editoriale premium
 * Sezioni: Hero stats, Perché IDEASMART, Formati & Prezzi, Audience, Form contatto
 */
import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
  navy: "#0a0f1e",
  teal: "#00e5c8",
  tealLight: "#e6faf8",
  orange: "#ff5500",
  orangeLight: "#fff3ee",
  slate: "#4b5563",
  muted: "#9ca3af",
  border: "#e5e7eb",
  surface1: "#f9fafb",
  surface2: "#f3f4f6",
  white: "#ffffff",
};

// ─── Animation helper ─────────────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
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

// ─── Formati pubblicitari ─────────────────────────────────────────────────────
const FORMATS = [
  {
    id: "banner-hero",
    tag: "MASSIMA VISIBILITÀ",
    tagColor: C.orange,
    name: "Banner Hero",
    description: "Posizione premium nella hero section della homepage. Il tuo brand appare come prima cosa che vede ogni visitatore, sopra la fold, con logo, headline e CTA.",
    placement: "Homepage — Above the fold",
    size: "Full-width · 1200×200px",
    price: "€1.500",
    period: "/ settimana",
    impressions: "~8.000 impressioni/sett.",
    ctr: "CTR medio: 2,8%",
    highlight: true,
    features: ["Logo + headline + CTA", "Link diretto al tuo sito", "Visibile su desktop e mobile", "Report settimanale incluso"],
  },
  {
    id: "newsletter-sponsor",
    tag: "ALTO ENGAGEMENT",
    tagColor: C.teal,
    name: "Newsletter Sponsorizzata",
    description: "Il tuo messaggio nella newsletter settimanale inviata a tutti gli iscritti attivi. Formato nativo editoriale: non sembra pubblicità, viene letto come contenuto.",
    placement: "Newsletter settimanale",
    size: "Blocco nativo · 600px wide",
    price: "€900",
    period: "/ invio",
    impressions: "~1.800 destinatari",
    ctr: "Open rate: 42%",
    highlight: false,
    features: ["Formato nativo editoriale", "Logo + testo + CTA", "Link tracciato", "Report aperture incluso"],
  },
  {
    id: "startup-sponsorizzata",
    tag: "CONTENT MARKETING",
    tagColor: C.navy,
    name: "Startup del Giorno Sponsorizzata",
    description: "La tua startup o prodotto AI viene presentato come 'Startup del Giorno' con una recensione editoriale completa: descrizione, AI Score, perché è rilevante oggi.",
    placement: "Homepage — Sezione Startup del Giorno",
    size: "Card full-width con badge 'Sponsorizzato'",
    price: "€750",
    period: "/ giorno",
    impressions: "~1.200 visualizzazioni/giorno",
    ctr: "Engagement: 4,1%",
    highlight: false,
    features: ["Recensione editoriale completa", "AI Score personalizzato", "Link sito + LinkedIn", "Badge 'Sponsorizzato' trasparente"],
  },
  {
    id: "reportage-branded",
    tag: "BRAND AWARENESS",
    tagColor: "#7c3aed",
    name: "Reportage Branded",
    description: "Uno dei 4 reportage settimanali è dedicato alla tua startup o prodotto AI. Formato lungo (500+ parole), con statistiche, quote e call-to-action. Rimane online per 7 giorni.",
    placement: "Homepage — Sezione Reportage della Settimana",
    size: "Card editoriale completa",
    price: "€1.200",
    period: "/ settimana",
    impressions: "~5.000 visualizzazioni/sett.",
    ctr: "Tempo medio lettura: 2m 40s",
    highlight: false,
    features: ["500+ parole editoriali", "Statistiche e dati inclusi", "Quote in evidenza", "Online per 7 giorni"],
  },
  {
    id: "analisi-sponsorizzata",
    tag: "THOUGHT LEADERSHIP",
    tagColor: "#0891b2",
    name: "Analisi di Mercato Sponsorizzata",
    description: "La tua ricerca, whitepaper o analisi di mercato viene presentata nella sezione 'Ultime Analisi di Mercato' come contenuto editoriale con la tua fonte e brand.",
    placement: "Homepage — Sezione Analisi di Mercato",
    size: "Card analisi con logo fonte",
    price: "€600",
    period: "/ settimana",
    impressions: "~3.000 visualizzazioni/sett.",
    ctr: "Download rate: 3,5%",
    highlight: false,
    features: ["Fonte brandizzata con logo", "Sintesi editoriale inclusa", "Link al documento originale", "Online per 7 giorni"],
  },
];

// ─── Statistiche audience ─────────────────────────────────────────────────────
const AUDIENCE_STATS = [
  { value: "1.800+", label: "Iscritti newsletter", icon: "◆" },
  { value: "8.000+", label: "Visitatori unici/mese", icon: "◆" },
  { value: "42%", label: "Open rate newsletter", icon: "◆" },
  { value: "4,2 min", label: "Tempo medio sul sito", icon: "◆" },
  { value: "78%", label: "Professionisti B2B", icon: "◆" },
  { value: "100%", label: "Audience italiana", icon: "◆" },
];

// ─── Profili audience ─────────────────────────────────────────────────────────
const AUDIENCE_PROFILES = [
  { role: "CTO / CIO", pct: "28%", color: C.teal },
  { role: "Founder / CEO", pct: "24%", color: C.orange },
  { role: "Product Manager", pct: "18%", color: "#7c3aed" },
  { role: "Investitori / VC", pct: "14%", color: "#0891b2" },
  { role: "Consulenti AI", pct: "16%", color: "#059669" },
];

// ─── Componente principale ────────────────────────────────────────────────────
export default function Advertise() {
  const [formData, setFormData] = useState({
    company: "",
    name: "",
    email: "",
    format: "",
    budget: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  // Conta iscritti reali dal DB
  const { data: subscriberCount } = trpc.newsletter.getActiveCount.useQuery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.name || !formData.company) {
      toast.error("Compila tutti i campi obbligatori.");
      return;
    }
    setSending(true);
    try {
      // Notifica al proprietario del sito
      await fetch("/api/trpc/system.notifyOwner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          json: {
            title: `🎯 Nuova richiesta advertising da ${formData.company}`,
            content: `**Azienda:** ${formData.company}\n**Contatto:** ${formData.name} (${formData.email})\n**Formato:** ${formData.format || "Non specificato"}\n**Budget:** ${formData.budget || "Non specificato"}\n**Messaggio:** ${formData.message || "—"}`,
          },
        }),
      });
      setSubmitted(true);
      toast.success("Richiesta inviata! Ti contatteremo entro 24 ore.");
    } catch {
      toast.error("Errore nell'invio. Scrivi direttamente a info@ideasmart.ai");
    } finally {
      setSending(false);
    }
  };

  const realCount = subscriberCount ?? 1800;

  return (
    <div style={{ background: C.white, minHeight: "100vh" }}>

      {/* ── NAVBAR MINIMAL ──────────────────────────────────────────────────── */}
      <nav style={{ background: C.navy, borderBottom: `1px solid rgba(255,255,255,0.08)` }} className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <span className="text-xl font-black tracking-tight" style={{ color: C.white, fontFamily: "'Space Grotesk', sans-serif" }}>
              IDEA<span style={{ color: C.teal }}>SMART</span>
            </span>
            <span className="text-xs font-medium tracking-widest uppercase hidden sm:block" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif" }}>
              AI FOR BUSINESS
            </span>
          </a>
          <a
            href="/"
            className="text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans', sans-serif" }}
          >
            ← Torna alla home
          </a>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section style={{ background: C.navy, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 70% 50%, ${C.teal}12 0%, transparent 60%)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 0, left: "10%", width: "30%", height: "50%", background: `radial-gradient(ellipse at bottom, ${C.orange}10 0%, transparent 70%)`, pointerEvents: "none" }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <FadeUp>
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border" style={{ borderColor: `${C.orange}40`, background: `${C.orange}15` }}>
              <span className="w-2 h-2 rounded-full" style={{ background: C.orange }} />
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: C.orange, fontFamily: "'Space Grotesk', sans-serif" }}>Media Kit 2026</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight" style={{ color: C.white, fontFamily: "'Space Grotesk', sans-serif" }}>
              Raggiungi i decision maker<br />
              <span style={{ color: C.teal }}>dell'AI italiano.</span>
            </h1>

            <p className="text-xl sm:text-2xl mb-12 max-w-3xl leading-relaxed" style={{ color: "rgba(255,255,255,0.8)", fontFamily: "'DM Sans', sans-serif" }}>
              IDEASMART è il punto di riferimento per oltre <strong style={{ color: C.white }}>{realCount.toLocaleString("it-IT")} professionisti</strong> che ogni giorno cercano le migliori opportunità nell'ecosistema AI italiano.
            </p>

            {/* Audience stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              {AUDIENCE_STATS.map((stat, i) => (
                <FadeUp key={i} delay={i * 0.07}>
                  <div className="text-center">
                    <div className="text-3xl font-black mb-1" style={{ color: C.teal, fontFamily: "'Space Grotesk', sans-serif" }}>{stat.value}</div>
                    <div className="text-xs leading-tight" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans', sans-serif" }}>{stat.label}</div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── PERCHÉ IDEASMART ────────────────────────────────────────────────── */}
      <section style={{ background: C.surface1, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <FadeUp>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full border" style={{ borderColor: `${C.teal}40`, background: C.tealLight }}>
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: C.teal, fontFamily: "'Space Grotesk', sans-serif" }}>Perché IDEASMART</span>
              </div>
              <h2 className="text-4xl font-black" style={{ color: C.navy, fontFamily: "'Space Grotesk', sans-serif" }}>
                Un'audience qualificata, non generica.
              </h2>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Profili */}
            <FadeUp delay={0.1}>
              <h3 className="text-xl font-bold mb-6" style={{ color: C.navy, fontFamily: "'Space Grotesk', sans-serif" }}>Chi legge IDEASMART</h3>
              <div className="space-y-4">
                {AUDIENCE_PROFILES.map((p, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-base font-semibold" style={{ color: C.navy, fontFamily: "'DM Sans', sans-serif" }}>{p.role}</span>
                      <span className="text-base font-black" style={{ color: p.color, fontFamily: "'Space Grotesk', sans-serif" }}>{p.pct}</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: C.border }}>
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: p.pct, background: p.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>

            {/* Punti di forza */}
            <FadeUp delay={0.2}>
              <h3 className="text-xl font-bold mb-6" style={{ color: C.navy, fontFamily: "'Space Grotesk', sans-serif" }}>I vantaggi per gli inserzionisti</h3>
              <div className="space-y-5">
                {[
                  { icon: "◆", title: "Audience verticale AI", desc: "Tutti i lettori sono professionisti che cercano attivamente soluzioni AI per il business. Zero dispersione." },
                  { icon: "◆", title: "Formato editoriale nativo", desc: "La pubblicità si integra nel contenuto editoriale. Non interrompe, accompagna. CTR 3x superiore ai banner standard." },
                  { icon: "◆", title: "Aggiornamento quotidiano", desc: "Il sito viene aggiornato ogni giorno con nuovi contenuti. I tuoi annunci appaiono sempre in un contesto fresco e rilevante." },
                  { icon: "◆", title: "Report e trasparenza", desc: "Ogni formato include un report con impressioni, click e engagement. Nessuna scatola nera." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-sm mt-1 flex-shrink-0" style={{ color: C.teal }}>✓</span>
                    <div>
                      <div className="text-base font-bold mb-1" style={{ color: C.navy, fontFamily: "'Space Grotesk', sans-serif" }}>{item.title}</div>
                      <div className="text-base leading-relaxed" style={{ color: C.slate, fontFamily: "'DM Sans', sans-serif" }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── FORMATI & PREZZI ────────────────────────────────────────────────── */}
      <section style={{ background: C.white }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <FadeUp>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full border" style={{ borderColor: `${C.orange}40`, background: C.orangeLight }}>
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: C.orange, fontFamily: "'Space Grotesk', sans-serif" }}>Formati & Prezzi</span>
              </div>
              <h2 className="text-4xl font-black mb-4" style={{ color: C.navy, fontFamily: "'Space Grotesk', sans-serif" }}>
                5 formati per ogni obiettivo.
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: C.slate, fontFamily: "'DM Sans', sans-serif" }}>
                Dalla visibilità massima al thought leadership. Ogni formato è progettato per integrarsi naturalmente nel flusso editoriale di IDEASMART.
              </p>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {FORMATS.map((fmt, i) => (
              <FadeUp key={fmt.id} delay={i * 0.08}>
                <div
                  className="rounded-2xl p-7 h-full flex flex-col transition-all hover:-translate-y-1 hover:shadow-xl"
                  style={{
                    border: fmt.highlight ? `2px solid ${C.orange}` : `1px solid ${C.border}`,
                    background: fmt.highlight ? `linear-gradient(135deg, ${C.navy} 0%, #111827 100%)` : C.white,
                    position: "relative",
                  }}
                >
                  {fmt.highlight && (
                    <div
                      className="absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-black"
                      style={{ background: C.orange, color: C.white, fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      ★ CONSIGLIATO
                    </div>
                  )}

                  {/* Tag */}
                  <div className="inline-flex mb-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold tracking-wider"
                      style={{
                        background: fmt.highlight ? `${fmt.tagColor}25` : `${fmt.tagColor}15`,
                        color: fmt.highlight ? fmt.tagColor : fmt.tagColor,
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      {fmt.tag}
                    </span>
                  </div>

                  {/* Nome e descrizione */}
                  <h3 className="text-xl font-black mb-3" style={{ color: fmt.highlight ? C.white : C.navy, fontFamily: "'Space Grotesk', sans-serif" }}>
                    {fmt.name}
                  </h3>
                  <p className="text-sm leading-relaxed mb-5 flex-grow" style={{ color: fmt.highlight ? "rgba(255,255,255,0.75)" : C.slate, fontFamily: "'DM Sans', sans-serif" }}>
                    {fmt.description}
                  </p>

                  {/* Dettagli tecnici */}
                  <div className="space-y-1.5 mb-5 pb-5" style={{ borderBottom: `1px solid ${fmt.highlight ? "rgba(255,255,255,0.12)" : C.border}` }}>
                    <div className="flex items-start gap-2">
                      <span className="text-xs mt-0.5 flex-shrink-0" style={{ color: fmt.highlight ? C.teal : C.teal }}>📍</span>
                      <span className="text-xs" style={{ color: fmt.highlight ? "rgba(255,255,255,0.6)" : C.muted, fontFamily: "'DM Sans', sans-serif" }}>{fmt.placement}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-xs mt-0.5 flex-shrink-0" style={{ color: C.teal }}>📐</span>
                      <span className="text-xs" style={{ color: fmt.highlight ? "rgba(255,255,255,0.6)" : C.muted, fontFamily: "'DM Sans', sans-serif" }}>{fmt.size}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-xs mt-0.5 flex-shrink-0" style={{ color: C.teal }}>👁</span>
                      <span className="text-xs" style={{ color: fmt.highlight ? "rgba(255,255,255,0.6)" : C.muted, fontFamily: "'DM Sans', sans-serif" }}>{fmt.impressions} · {fmt.ctr}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    {fmt.features.map((f, fi) => (
                      <div key={fi} className="flex items-center gap-2">
                        <span className="text-xs flex-shrink-0" style={{ color: C.teal }}>✓</span>
                        <span className="text-sm" style={{ color: fmt.highlight ? "rgba(255,255,255,0.85)" : C.slate, fontFamily: "'DM Sans', sans-serif" }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* Prezzo e CTA */}
                  <div className="flex items-end justify-between mt-auto">
                    <div>
                      <span className="text-3xl font-black" style={{ color: fmt.highlight ? C.teal : C.navy, fontFamily: "'Space Grotesk', sans-serif" }}>{fmt.price}</span>
                      <span className="text-sm ml-1" style={{ color: fmt.highlight ? "rgba(255,255,255,0.5)" : C.muted, fontFamily: "'DM Sans', sans-serif" }}>{fmt.period}</span>
                    </div>
                    <a
                      href="#contatto"
                      className="px-4 py-2 rounded-lg text-sm font-bold transition-all hover:scale-105"
                      style={{
                        background: fmt.highlight ? C.orange : C.navy,
                        color: C.white,
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      Richiedi →
                    </a>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>

          {/* Nota prezzi */}
          <FadeUp delay={0.3}>
            <div className="mt-10 p-6 rounded-2xl text-center" style={{ background: C.surface1, border: `1px solid ${C.border}` }}>
              <p className="text-base" style={{ color: C.slate, fontFamily: "'DM Sans', sans-serif" }}>
                Tutti i prezzi sono IVA esclusa. Sono disponibili <strong style={{ color: C.navy }}>pacchetti mensili con sconto 20%</strong> e <strong style={{ color: C.navy }}>pacchetti trimestrali con sconto 35%</strong>.
                Per campagne personalizzate o bundle multi-formato, contattaci direttamente.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FORM CONTATTO ───────────────────────────────────────────────────── */}
      <section id="contatto" style={{ background: C.navy, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: "40%", height: "100%", background: `radial-gradient(ellipse at top right, ${C.teal}12 0%, transparent 70%)`, pointerEvents: "none" }} />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <FadeUp>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full border" style={{ borderColor: `${C.teal}40`, background: `${C.teal}15` }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.teal }} />
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: C.teal, fontFamily: "'Space Grotesk', sans-serif" }}>Inizia ora</span>
              </div>
              <h2 className="text-4xl font-black mb-4" style={{ color: C.white, fontFamily: "'Space Grotesk', sans-serif" }}>
                Parliamo della tua campagna.
              </h2>
              <p className="text-lg" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "'DM Sans', sans-serif" }}>
                Compila il form e ti risponderemo entro 24 ore con una proposta personalizzata.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="rounded-2xl p-8 sm:p-10" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)" }}>
              {!submitted ? (
                <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-5">
                  {/* Azienda */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold mb-2" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "'DM Sans', sans-serif" }}>Azienda / Brand *</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={e => setFormData(p => ({ ...p, company: e.target.value }))}
                      placeholder="Il nome della tua azienda"
                      required
                      className="w-full px-4 py-3.5 rounded-xl text-base border focus:outline-none transition-all"
                      style={{ borderColor: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}
                      onFocus={e => { e.target.style.borderColor = C.teal; }}
                      onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.2)"; }}
                    />
                  </div>

                  {/* Nome */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "'DM Sans', sans-serif" }}>Nome e Cognome *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      placeholder="Il tuo nome"
                      required
                      className="w-full px-4 py-3.5 rounded-xl text-base border focus:outline-none transition-all"
                      style={{ borderColor: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}
                      onFocus={e => { e.target.style.borderColor = C.teal; }}
                      onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.2)"; }}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "'DM Sans', sans-serif" }}>Email aziendale *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                      placeholder="nome@azienda.com"
                      required
                      className="w-full px-4 py-3.5 rounded-xl text-base border focus:outline-none transition-all"
                      style={{ borderColor: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}
                      onFocus={e => { e.target.style.borderColor = C.teal; }}
                      onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.2)"; }}
                    />
                  </div>

                  {/* Formato */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "'DM Sans', sans-serif" }}>Formato di interesse</label>
                    <select
                      value={formData.format}
                      onChange={e => setFormData(p => ({ ...p, format: e.target.value }))}
                      className="w-full px-4 py-3.5 rounded-xl text-base border focus:outline-none transition-all"
                      style={{ borderColor: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: formData.format ? "#fff" : "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif" }}
                      onFocus={e => { e.target.style.borderColor = C.teal; }}
                      onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.2)"; }}
                    >
                      <option value="" style={{ background: C.navy }}>Seleziona un formato</option>
                      <option value="Banner Hero (€1.500/sett.)" style={{ background: C.navy }}>Banner Hero — €1.500/sett.</option>
                      <option value="Newsletter Sponsorizzata (€900/invio)" style={{ background: C.navy }}>Newsletter Sponsorizzata — €900/invio</option>
                      <option value="Startup del Giorno (€750/giorno)" style={{ background: C.navy }}>Startup del Giorno — €750/giorno</option>
                      <option value="Reportage Branded (€1.200/sett.)" style={{ background: C.navy }}>Reportage Branded — €1.200/sett.</option>
                      <option value="Analisi di Mercato (€600/sett.)" style={{ background: C.navy }}>Analisi di Mercato — €600/sett.</option>
                      <option value="Pacchetto personalizzato" style={{ background: C.navy }}>Pacchetto personalizzato</option>
                    </select>
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "'DM Sans', sans-serif" }}>Budget mensile indicativo</label>
                    <select
                      value={formData.budget}
                      onChange={e => setFormData(p => ({ ...p, budget: e.target.value }))}
                      className="w-full px-4 py-3.5 rounded-xl text-base border focus:outline-none transition-all"
                      style={{ borderColor: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: formData.budget ? "#fff" : "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif" }}
                      onFocus={e => { e.target.style.borderColor = C.teal; }}
                      onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.2)"; }}
                    >
                      <option value="" style={{ background: C.navy }}>Seleziona un range</option>
                      <option value="< €1.000/mese" style={{ background: C.navy }}>Meno di €1.000/mese</option>
                      <option value="€1.000 – €3.000/mese" style={{ background: C.navy }}>€1.000 – €3.000/mese</option>
                      <option value="€3.000 – €5.000/mese" style={{ background: C.navy }}>€3.000 – €5.000/mese</option>
                      <option value="> €5.000/mese" style={{ background: C.navy }}>Più di €5.000/mese</option>
                    </select>
                  </div>

                  {/* Messaggio */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold mb-2" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "'DM Sans', sans-serif" }}>Messaggio (opzionale)</label>
                    <textarea
                      value={formData.message}
                      onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                      placeholder="Descrivi brevemente la tua campagna, gli obiettivi e il target..."
                      rows={4}
                      className="w-full px-4 py-3.5 rounded-xl text-base border focus:outline-none transition-all resize-none"
                      style={{ borderColor: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}
                      onFocus={e => { e.target.style.borderColor = C.teal; }}
                      onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.2)"; }}
                    />
                  </div>

                  {/* Submit */}
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full py-4 rounded-xl text-base font-black transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ background: C.orange, color: C.white, fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {sending ? "Invio in corso..." : "Invia la richiesta →"}
                    </button>
                    <p className="text-xs mt-3 text-center" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif" }}>
                      Oppure scrivi direttamente a{" "}
                      <a href="mailto:info@ideasmart.ai" className="underline" style={{ color: C.teal }}>info@ideasmart.ai</a>
                    </p>
                  </div>
                </form>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: `${C.teal}20`, border: `2px solid ${C.teal}` }}>
                    <span className="text-3xl" style={{ color: C.teal }}>✓</span>
                  </div>
                  <h3 className="text-3xl font-black mb-3" style={{ color: C.white, fontFamily: "'Space Grotesk', sans-serif" }}>
                    Richiesta ricevuta!
                  </h3>
                  <p className="text-lg mb-6" style={{ color: "rgba(255,255,255,0.75)", fontFamily: "'DM Sans', sans-serif" }}>
                    Ti risponderemo entro 24 ore con una proposta personalizzata.<br />
                    Nel frattempo, puoi esplorare il sito per capire meglio il nostro formato editoriale.
                  </p>
                  <a
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-base font-bold transition-all hover:scale-105"
                    style={{ background: C.teal, color: C.navy, fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Torna alla home →
                  </a>
                </div>
              )}
            </div>
          </FadeUp>
        </div>
      </section>

    </div>
  );
}
