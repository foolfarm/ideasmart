/*
 * PROOF PRESS — Pagina Offerta / Pricing
 * Contenuti aggiornati: hero, come funziona, piani, tabella comparativa, social proof, CTA finale
 * Stile: editoriale pulito — bianco, nero, accento arancione #ff5500
 */
import { useState } from "react";
import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import LeftSidebar from "@/components/LeftSidebar";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const ORANGE = "#ff5500";

/* ── Sezione wrapper ── */
function Section({ children, className = "", bg = "transparent", id }: { children: React.ReactNode; className?: string; bg?: string; id?: string }) {
  return (
    <section id={id} className={`py-20 md:py-28 ${className}`} style={{ background: bg }}>
      <div className="max-w-5xl mx-auto px-5 md:px-8">{children}</div>
    </section>
  );
}

/* ── Label piccola ── */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/40 mb-4" style={{ fontFamily: FONT }}>
      {children}
    </span>
  );
}

/* ── Divider sottile ── */
function Divider() {
  return <div className="max-w-5xl mx-auto px-5 md:px-8"><div className="border-t border-[#0a0a0a]/8" /></div>;
}

/* ── Piani pricing ── */
const PLANS = [
  {
    icon: "✍️",
    name: "SOLO",
    price: "€690",
    period: "/mese",
    setup: "€3.500 una tantum",
    tagline: "Per chi vuole la sua voce. Una testata, un verticale, zero compromessi.",
    highlight: false,
    badge: null,
    ideal: "Giornalisti indipendenti, analisti, newsletter creator",
    features: [
      "4 Agent Giornalisti + 4 agenti di supporto",
      "1 canale tematico",
      "Fino a 15 articoli/giorno",
      "Newsletter settimanale inclusa",
      "ProofPress Verify su ogni articolo",
      "Gestibile da 1 persona",
      "Supporto via email",
    ],
    revenueShare: null,
    cta: "Richiedi una demo →",
    ctaLink: "/demo",
  },
  {
    icon: "📰",
    name: "REDAZIONE",
    price: "€1.490",
    period: "/mese",
    setup: "€7.000 una tantum",
    tagline: "Per chi vuole una testata vera. Più canali, più distribuzione, più crescita.",
    highlight: true,
    badge: "⭐ Piano più scelto",
    ideal: "Editori digitali, media startup, vertical media",
    features: [
      "8 Agent Giornalisti + 4 agenti di supporto",
      "Fino a 6 canali tematici",
      "Newsletter + paywall integrato",
      "Post social automatici (LinkedIn, X)",
      "ProofPress Verify + badge visibile su ogni articolo",
      "Dashboard editoriale",
      "Supporto prioritario",
    ],
    revenueShare: "Alternativa: €3.500 setup + 25% dei ricavi (min. €500/mese)",
    cta: "Richiedi una demo →",
    ctaLink: "/demo",
  },
  {
    icon: "🏛️",
    name: "EDITORE",
    price: "€2.490",
    period: "/mese",
    setup: "€12.000 una tantum",
    tagline: "Per chi scala. Canali illimitati, analytics avanzato, un account manager dedicato.",
    highlight: false,
    badge: null,
    ideal: "Testate online, media company, gruppi editoriali",
    features: [
      "12 Agent Giornalisti + 4 agenti di supporto",
      "Canali illimitati",
      "Newsletter + paywall + sistema abbonamenti",
      "Analytics avanzato + report mensile",
      "Account manager dedicato",
      "Accesso prioritario a nuove feature",
      "Onboarding assistito",
    ],
    revenueShare: "Alternativa: €5.000 setup + 20% dei ricavi (min. €900/mese)",
    cta: "Parla con noi →",
    ctaLink: "mailto:info@proofpress.ai",
  },
  {
    icon: "⚫",
    name: "ENTERPRISE",
    price: "Su misura",
    period: "",
    setup: "",
    tagline: "Per chi ha esigenze specifiche, vuole una white-label o deve integrare un CMS esistente.",
    highlight: false,
    badge: null,
    ideal: "Gruppi editoriali, corporate, brand media",
    features: [
      "Configurazione e agenti custom",
      "Integrazione con CMS/piattaforme esistenti",
      "API dedicata",
      "SLA garantito",
      "White-label disponibile",
      "Fatturazione personalizzata",
    ],
    revenueShare: null,
    cta: "Contattaci →",
    ctaLink: "mailto:info@proofpress.ai",
  },
];

/* ── Tabella comparativa ── */
const TABLE_ROWS = [
  { feature: "Agent Giornalisti", solo: "4", redazione: "8", editore: "12", enterprise: "Custom" },
  { feature: "Agenti di supporto", solo: "4", redazione: "4", editore: "4", enterprise: "Custom" },
  { feature: "Canali tematici", solo: "1", redazione: "Fino a 6", editore: "Illimitati", enterprise: "Illimitati" },
  { feature: "Articoli/giorno", solo: "~15", redazione: "~40", editore: "Illimitati", enterprise: "Illimitati" },
  { feature: "ProofPress Verify", solo: "✓", redazione: "✓", editore: "✓", enterprise: "✓" },
  { feature: "Newsletter", solo: "Settimanale", redazione: "✓ + personalizzabile", editore: "✓ + multi-lista", enterprise: "✓" },
  { feature: "Paywall", solo: "—", redazione: "✓", editore: "✓", enterprise: "✓" },
  { feature: "Post social automatici", solo: "—", redazione: "✓", editore: "✓", enterprise: "✓" },
  { feature: "Dashboard analytics", solo: "Base", redazione: "✓", editore: "Avanzato", enterprise: "Custom" },
  { feature: "Account manager", solo: "—", redazione: "—", editore: "✓", enterprise: "✓" },
  { feature: "Onboarding assistito", solo: "Standard", redazione: "Standard", editore: "Dedicato", enterprise: "Dedicato" },
  { feature: "Opzione revenue share", solo: "—", redazione: "✓", editore: "✓", enterprise: "Negoziabile" },
  { feature: "API / CMS integration", solo: "—", redazione: "—", editore: "—", enterprise: "✓" },
  { feature: "White-label", solo: "—", redazione: "—", editore: "—", enterprise: "✓" },
];

/* ── Testimonianze ── */
const TESTIMONIALS = [
  {
    quote: "Avevo una newsletter su AI e startup, ma non riuscivo a tenere il ritmo. Con ProofPress pubblico ogni giorno. La qualità è costante e i lettori se ne accorgono.",
    author: "Founder, media startup AI",
    location: "Milano",
  },
  {
    quote: "Ho lanciato una testata verticale sul venture capital europeo in due settimane. Oggi genera traffico organico e lead qualificati. Con 1 persona.",
    author: "Investor Relations Manager",
    location: "Londra",
  },
  {
    quote: "La certificazione delle notizie ha fatto la differenza. I miei lettori sono professionisti esigenti: sapere che ogni contenuto è verificato cambia tutto.",
    author: "Direttore editoriale, testata B2B",
    location: "Roma",
  },
];

export default function ChiSiamo() {
  const [activeTab, setActiveTab] = useState<number | null>(null);

  return (
    <div className="flex min-h-screen">
      <LeftSidebar />
      <div className="flex-1 min-w-0">
        <SEOHead
          title="Proof Press — La tua redazione AI. Pronta in giorni, non in mesi."
          description="12 agenti giornalisti scrivono, verificano e pubblicano per te. Ogni notizia certificata con ProofPress Verify. Piani da €690/mese."
          canonical="https://proofpress.ai/chi-siamo"
          ogSiteName="Proof Press"
        />

        <div className="min-h-screen" style={{ background: "#ffffff", color: "#0a0a0a", fontFamily: FONT }}>
          <SharedPageHeader />
          <BreakingNewsTicker />

          {/* ═══════════════════════════════════════════════════════════════════
              HERO
          ═══════════════════════════════════════════════════════════════════ */}
          <section className="pt-24 pb-20 md:pt-32 md:pb-28" style={{ background: "#ffffff" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              {/* Badge */}
              <div className="mb-6">
                <span
                  className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border"
                  style={{ color: ORANGE, borderColor: `${ORANGE}33`, background: `${ORANGE}0d` }}
                >
                  PIATTAFORMA DI GIORNALISMO AGENTICO
                </span>
              </div>

              <div className="max-w-3xl mb-10">
                <h1
                  className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-[#0a0a0a] mb-6"
                  style={{ fontFamily: FONT }}
                >
                  La tua redazione AI.<br />
                  <span style={{ color: ORANGE }}>Pronta in giorni,</span><br />
                  non in mesi.
                </h1>
                <p className="text-lg md:text-xl leading-relaxed text-[#0a0a0a]/65 max-w-2xl">
                  Tu scegli di cosa parlare. 12 agenti giornalisti scrivono, verificano e pubblicano per te.
                  Ogni notizia certificata con ProofPress Verify. Funziona anche se sei solo.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 py-8 border-t border-b border-[#0a0a0a]/8">
                {[
                  { val: "4.000+", label: "fonti monitorate 24/7" },
                  { val: "12", label: "agenti giornalisti" },
                  { val: "100%", label: "notizie certificate" },
                  { val: "100k+", label: "lettori/mese su ProofPress" },
                ].map(({ val, label }) => (
                  <div key={val}>
                    <div className="text-3xl md:text-4xl font-black mb-1" style={{ color: ORANGE, fontFamily: FONT }}>{val}</div>
                    <div className="text-xs text-[#0a0a0a]/50 uppercase tracking-wide">{label}</div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/demo">
                  <button
                    className="px-8 py-4 text-sm font-bold uppercase tracking-widest text-white rounded-none transition-opacity hover:opacity-80"
                    style={{ background: ORANGE, fontFamily: FONT }}
                  >
                    Richiedi una demo →
                  </button>
                </Link>
                <a
                  href="mailto:info@proofpress.ai"
                  className="px-8 py-4 text-sm font-bold uppercase tracking-widest rounded-none border transition-colors hover:bg-[#0a0a0a]/5"
                  style={{ borderColor: "#0a0a0a", color: "#0a0a0a", fontFamily: FONT }}
                >
                  Scrivici
                </a>
              </div>
            </div>
          </section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════════════════
              COME FUNZIONA
          ═══════════════════════════════════════════════════════════════════ */}
          <Section bg="#f8f8f6" id="come-funziona">
            <Label>Come funziona</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-16" style={{ fontFamily: FONT }}>
              Tre passi. Poi la redazione<br />lavora da sola.
            </h2>
            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  num: "01",
                  title: "Scegli il piano",
                  desc: "Decidi quanti agenti ti servono, su quali verticali vuoi pubblicare e con che tono. Freelance o media company, c'è un taglio per te.",
                },
                {
                  num: "02",
                  title: "Configura la linea editoriale",
                  desc: "Definisci le fonti, il posizionamento, lo stile. Gli agenti imparano a scrivere come vuoi tu. In pochi giorni sei live.",
                },
                {
                  num: "03",
                  title: "Pubblica in automatico, ogni giorno",
                  desc: "La redazione monitora, verifica, scrive e distribuisce. Tu mantieni il controllo strategico. Il resto è automatico — 24 ore su 24.",
                },
              ].map(({ num, title, desc }) => (
                <div key={num}>
                  <div
                    className="text-5xl font-black mb-4 leading-none"
                    style={{ color: `${ORANGE}22`, fontFamily: FONT }}
                  >
                    {num}
                  </div>
                  <div className="font-bold text-lg mb-3" style={{ color: "#0a0a0a" }}>— {title}</div>
                  <p className="text-sm leading-relaxed" style={{ color: "#0a0a0a", opacity: 0.6 }}>{desc}</p>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════════════════
              PIANI E PRICING
          ═══════════════════════════════════════════════════════════════════ */}
          <Section id="pricing">
            <Label>Piani e pricing</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-4" style={{ fontFamily: FONT }}>
              Scegli la tua redazione.
            </h2>
            <p className="text-base text-[#0a0a0a]/55 mb-16 max-w-2xl">
              Ogni piano include ProofPress Verify, la tecnologia che certifica ogni notizia con hash crittografico.
              Nessun costo nascosto. Disdici quando vuoi.
            </p>

            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className="flex flex-col p-6 border transition-all"
                  style={{
                    borderColor: plan.highlight ? ORANGE : "#0a0a0a1a",
                    background: plan.highlight ? "#0a0a0a" : "#ffffff",
                    color: plan.highlight ? "#ffffff" : "#0a0a0a",
                  }}
                >
                  {plan.badge && (
                    <div
                      className="text-[10px] font-bold uppercase tracking-widest mb-4 px-2 py-1 inline-block"
                      style={{ background: ORANGE, color: "#ffffff" }}
                    >
                      {plan.badge}
                    </div>
                  )}
                  <div className="text-2xl mb-2">{plan.icon}</div>
                  <div
                    className="text-xs font-bold uppercase tracking-[0.2em] mb-3"
                    style={{ color: plan.highlight ? `${ORANGE}` : "#0a0a0a80" }}
                  >
                    {plan.name}
                  </div>
                  <div className="mb-1">
                    <span className="text-3xl font-black" style={{ fontFamily: FONT }}>{plan.price}</span>
                    <span className="text-sm opacity-60">{plan.period}</span>
                  </div>
                  {plan.setup && (
                    <div className="text-xs opacity-50 mb-4">{plan.setup}</div>
                  )}
                  <p
                    className="text-sm leading-relaxed mb-6 pb-6 border-b"
                    style={{ borderColor: plan.highlight ? "#ffffff22" : "#0a0a0a11", opacity: 0.75 }}
                  >
                    {plan.tagline}
                  </p>
                  <div className="text-[10px] font-bold uppercase tracking-widest mb-3 opacity-50">
                    Ideale per: {plan.ideal}
                  </div>
                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <span style={{ color: ORANGE }} className="flex-shrink-0 mt-0.5">✓</span>
                        <span style={{ opacity: 0.8 }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  {plan.revenueShare && (
                    <div
                      className="text-xs leading-relaxed mb-6 p-3"
                      style={{ background: plan.highlight ? "#ffffff11" : `${ORANGE}0d`, color: plan.highlight ? "#ffffff99" : "#0a0a0a99" }}
                    >
                      {plan.revenueShare}
                    </div>
                  )}
                  {plan.ctaLink.startsWith("mailto") ? (
                    <a
                      href={plan.ctaLink}
                      className="block text-center py-3 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
                      style={{
                        background: plan.highlight ? ORANGE : "#0a0a0a",
                        color: "#ffffff",
                        fontFamily: FONT,
                      }}
                    >
                      {plan.cta}
                    </a>
                  ) : (
                    <Link href={plan.ctaLink}>
                      <button
                        className="w-full py-3 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
                        style={{
                          background: plan.highlight ? ORANGE : "#0a0a0a",
                          color: "#ffffff",
                          fontFamily: FONT,
                        }}
                      >
                        {plan.cta}
                      </button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════════════════
              TABELLA COMPARATIVA
          ═══════════════════════════════════════════════════════════════════ */}
          <Section bg="#f8f8f6" id="confronto">
            <Label>Confronto piani</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-12" style={{ fontFamily: FONT }}>
              Confronta i piani nel dettaglio.
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ fontFamily: FONT }}>
                <thead>
                  <tr className="border-b border-[#0a0a0a]/10">
                    <th className="text-left py-3 pr-6 text-xs font-bold uppercase tracking-widest text-[#0a0a0a]/40">Feature</th>
                    {["SOLO", "REDAZIONE", "EDITORE", "ENTERPRISE"].map((h) => (
                      <th key={h} className="text-center py-3 px-3 text-xs font-bold uppercase tracking-widest" style={{ color: h === "REDAZIONE" ? ORANGE : "#0a0a0a" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TABLE_ROWS.map((row, i) => (
                    <tr key={row.feature} className="border-b border-[#0a0a0a]/6" style={{ background: i % 2 === 0 ? "transparent" : "#0a0a0a04" }}>
                      <td className="py-3 pr-6 text-[#0a0a0a]/70 text-xs">{row.feature}</td>
                      <td className="py-3 px-3 text-center text-xs text-[#0a0a0a]/60">{row.solo}</td>
                      <td className="py-3 px-3 text-center text-xs font-semibold" style={{ color: ORANGE }}>{row.redazione}</td>
                      <td className="py-3 px-3 text-center text-xs text-[#0a0a0a]/60">{row.editore}</td>
                      <td className="py-3 px-3 text-center text-xs text-[#0a0a0a]/60">{row.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════════════════
              SOCIAL PROOF
          ═══════════════════════════════════════════════════════════════════ */}
          <Section id="social-proof">
            <Label>Già in produzione</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-6" style={{ fontFamily: FONT }}>
              Già in produzione. Ogni giorno.
            </h2>
            <p className="text-base text-[#0a0a0a]/55 mb-16 max-w-3xl">
              ProofPress stessa è la prova: 3 canali tematici, 100.000+ lettori/mese, 6.000+ iscritti newsletter,
              20+ articoli al giorno. Tutto gestito dalla piattaforma con un team editoriale di 1 persona.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {TESTIMONIALS.map(({ quote, author, location }) => (
                <div key={author} className="border-l-2 pl-6" style={{ borderColor: ORANGE }}>
                  <blockquote className="text-base leading-relaxed text-[#0a0a0a]/75 mb-4 italic">
                    "{quote}"
                  </blockquote>
                  <div className="text-xs font-bold text-[#0a0a0a]/50 uppercase tracking-wide">
                    — {author} · {location}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════════════════
              CTA FINALE
          ═══════════════════════════════════════════════════════════════════ */}
          <section className="py-24 md:py-32" style={{ background: "#0a0a0a" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8 text-center">
              <Label>Inizia ora</Label>
              <h2
                className="text-3xl md:text-5xl font-black leading-tight mb-6 text-white"
                style={{ fontFamily: FONT }}
              >
                Il giornalismo sta cambiando.<br />
                <span style={{ color: ORANGE }}>Tu puoi guidarlo.</span>
              </h2>
              <p className="text-base text-white/55 mb-12 max-w-xl mx-auto">
                Prenota una demo e vedi la piattaforma in azione. In 30 minuti capisci se fa per te.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link href="/demo">
                  <button
                    className="px-10 py-4 text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-80"
                    style={{ background: ORANGE, fontFamily: FONT }}
                  >
                    Richiedi una demo →
                  </button>
                </Link>
                <a
                  href="mailto:info@proofpress.ai"
                  className="px-10 py-4 text-sm font-bold uppercase tracking-widest border text-white transition-colors hover:bg-white/10"
                  style={{ borderColor: "#ffffff33", fontFamily: FONT }}
                >
                  Scrivici a info@proofpress.ai
                </a>
              </div>
              <div className="flex flex-wrap justify-center gap-6 text-xs text-white/30 uppercase tracking-widest">
                <span>Setup in pochi giorni</span>
                <span>·</span>
                <span>Disdici quando vuoi</span>
                <span>·</span>
                <span>Nessun costo nascosto</span>
              </div>
            </div>
          </section>

          <SharedPageFooter />
        </div>
      </div>
    </div>
  );
}
