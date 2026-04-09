/**
 * IDEASMART INTELLIGENCE — Pagina prodotto
 * Design: Dark navy (#0f0f0f) + Cyan (#1a1a1a) + Off-white (#f5f2ec)
 * Typography: SF Pro Display (titoli), SF Pro Text (body) — sistema Apple
 * 8 sezioni: Hero → Problema → Come funziona → Piani → Tecnologia → Advisory → Social Proof → CTA finale
 */
import { useState } from "react";
import { Link } from "wouter";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import LeftSidebar from "@/components/LeftSidebar";
import SEOHead from "@/components/SEOHead";

// ─── Divider ─────────────────────────────────────────────────────────────────
function Divider({ color = "#1a1a1a", opacity = 0.2 }: { color?: string; opacity?: number }) {
  return <div style={{ height: "1px", background: color, opacity }} />;
}

// ─── Section Label ────────────────────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <span className="text-[10px] font-bold uppercase tracking-[0.25em] block mb-3"
      style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
      {label}
    </span>
  );
}

// ─── Pricing Card ─────────────────────────────────────────────────────────────
function PricingCard({
  name, price, subtitle, features, cta, subCta, highlighted = false, ctaHref, ctaAriaLabel,
}: {
  name: string;
  price: string;
  subtitle: string;
  features: string[];
  cta: string;
  subCta?: string;
  highlighted?: boolean;
  ctaHref: string;
  ctaAriaLabel: string;
}) {
  return (
    <div className="relative flex flex-col p-6 rounded-lg"
      style={{
        background: highlighted ? "#0f0f0f" : "#fff",
        border: highlighted ? "2px solid #1a1a1a" : "1px solid rgba(26,26,46,0.12)",
        boxShadow: highlighted ? "0 0 40px rgba(0,229,200,0.12), 0 4px 24px rgba(0,0,0,0.08)" : "none",
        transform: highlighted ? "translateY(-4px)" : "none",
      }}>
      {highlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 text-[9px] font-bold uppercase tracking-widest"
            style={{ background: "#1a1a1a", color: "#0f0f0f", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", whiteSpace: "nowrap" }}>
            PIÙ SCELTO
          </span>
        </div>
      )}
      <div className="mb-4">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] mb-1"
          style={{ color: highlighted ? "#1a1a1a" : "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
          {name}
        </h3>
        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-[32px] font-black"
            style={{ color: highlighted ? "#fff" : "#0f0f0f", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
            {price}
          </span>
          {price !== "Su misura" && (
            <span className="text-[12px]" style={{ color: highlighted ? "rgba(255,255,255,0.5)" : "rgba(26,26,46,0.4)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
              /mese
            </span>
          )}
        </div>
        <p className="text-[12px] italic" style={{ color: highlighted ? "rgba(255,255,255,0.55)" : "rgba(26,26,46,0.5)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
          {subtitle}
        </p>
      </div>
      <Divider color={highlighted ? "#1a1a1a" : "#1a1a1a"} opacity={highlighted ? 0.2 : 0.08} />
      <ul className="mt-4 mb-6 flex flex-col gap-2 flex-1" role="list" aria-label={`Funzionalità piano ${name}`}>
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-[12px]"
            style={{ color: highlighted ? "rgba(255,255,255,0.8)" : "rgba(26,26,46,0.75)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
            <span style={{ color: "#1a1a1a", flexShrink: 0, marginTop: "2px" }} aria-hidden="true">✓</span>
            {f}
          </li>
        ))}
      </ul>
      <a
        href={ctaHref}
        aria-label={ctaAriaLabel}
        data-cta-name={name.toLowerCase()}
        data-plan={name.toLowerCase()}
        className="block text-center py-3 font-bold text-[11px] uppercase tracking-widest transition-all hover:opacity-90"
        style={{
          background: highlighted ? "#1a1a1a" : "transparent",
          color: highlighted ? "#0f0f0f" : "#1a1a1a",
          border: highlighted ? "none" : "1.5px solid #1a1a1a",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
        }}>
        {cta}
      </a>
      {subCta && (
        <p className="mt-2 text-center text-[10px]"
          style={{ color: highlighted ? "rgba(255,255,255,0.35)" : "rgba(26,26,46,0.35)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
          {subCta}
        </p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Intelligence() {
  const [annual, setAnnual] = useState(false);
  const radarPrice = annual ? "€33" : "€39";
  const intelPrice = annual ? "€169" : "€199";

  return (
    <>
      <SEOHead
        title="Proof Press Intelligence — Competitive Monitoring & AI Briefing per Decision-Maker"
        description="Monitoriamo i tuoi competitor, tracciamo i deal e ti consegniamo briefing personalizzati ogni giorno. Powered by 8 agenti AI e 450+ fonti globali."
        ogSiteName="Proof Press INTELLIGENCE"
        ogType="website"
        keywords="intelligence AI, competitive monitoring, briefing CEO, startup Italia, venture capital, decision maker, M&A, fondi investimento"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Proof Press Intelligence",
          "description": "Competitive monitoring e AI briefing personalizzati per CEO, founder e investitori.",
          "brand": { "@type": "Brand", "name": "Proof Press" },
          "offers": [
            { "@type": "Offer", "name": "RADAR", "price": "39", "priceCurrency": "EUR" },
            { "@type": "Offer", "name": "INTEL", "price": "199", "priceCurrency": "EUR" },
            { "@type": "Offer", "name": "ENTERPRISE", "description": "Prezzo su misura" }
          ]
        }}
      />
      <div className="flex" style={{ background: "#f5f2ec", minHeight: "100vh" }}>
        <LeftSidebar />
        <div className="flex-1 min-w-0">
        <SharedPageHeader />

        {/* ══ SEZIONE 1 — HERO ══════════════════════════════════════════════════ */}
        <section style={{ background: "#1a1a1a" }}>
          <div className="max-w-[1100px] mx-auto px-4 py-16 sm:py-24">
            {/* Breadcrumb */}
            <div className="mb-8">
              <Link href="/">
                <span className="text-[10px] uppercase tracking-widest cursor-pointer hover:opacity-70 transition-opacity"
                  style={{ color: "rgba(255,255,255,0.4)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                  ← Proof Press · Intelligence
                </span>
              </Link>
            </div>

            <div className="max-w-[800px]">
              <SectionLabel label="NUOVO" />
              <h1 className="mb-6 leading-tight"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif", fontSize: "clamp(2.2rem, 5vw, 3.8rem)", fontWeight: 900, color: "#fff" }}>
                Intelligence che lavora.{" "}
                <span style={{ color: "rgba(255,255,255,0.45)" }}>Decisioni che contano.</span>
              </h1>
              <p className="mb-8 text-[16px] leading-relaxed"
                style={{ color: "rgba(255,255,255,0.65)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", maxWidth: "620px" }}>
                Monitoriamo i tuoi competitor, tracciamo i deal nel tuo mercato, e ogni settimana ti diciamo cosa è cambiato e perché ti riguarda. Non è un giornale. È il tuo sistema di intelligence operativa.
              </p>

              {/* Metriche */}
              <div className="flex flex-wrap gap-6 mb-10">
                {[
                  { value: "450+", label: "fonti monitorate" },
                  { value: "20+", label: "analisi/giorno" },
                  { value: "00:00", label: "aggiornamento CET" }
                ].map((m) => (
                  <div key={m.label}>
                    <span className="text-[22px] font-black block" style={{ color: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>{m.value}</span>
                    <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>{m.label}</span>
                  </div>
                ))}
              </div>

              <a href="#pricing"
                aria-label="Vai alla sezione prezzi"
                data-cta-name="hero-pricing"
                className="inline-flex items-center gap-2 px-6 py-3 font-bold text-[12px] uppercase tracking-widest transition-all hover:opacity-90"
                style={{ background: "#ffffff", color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                Scegli il tuo piano →
              </a>
              <a
                href="#come-funziona"
                onClick={(e) => { e.preventDefault(); document.getElementById('come-funziona')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="block mt-4 text-[12px] hover:opacity-70 transition-opacity cursor-pointer"
                style={{ color: "rgba(255,255,255,0.45)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              >
                Oppure scopri come funziona ↓
              </a>
            </div>
          </div>
        </section>

        {/* ══ SEZIONE 2 — IL PROBLEMA ═══════════════════════════════════════════ */}
        <section className="py-16" style={{ background: "#f5f2ec" }}>
          <div className="max-w-[1100px] mx-auto px-4">
            <div className="max-w-[700px]">
              <SectionLabel label="Il problema che risolviamo" />
              <h2 className="text-[28px] sm:text-[36px] font-black mb-6 leading-tight"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif", color: "#0f0f0f" }}>
                Il 90% è rumore.
              </h2>
              <p className="text-[15px] leading-relaxed mb-4"
                style={{ color: "rgba(26,26,46,0.7)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                Ogni mattina, chi prende decisioni su AI, investimenti e tecnologia deve setacciare decine di fonti, report, newsletter e feed per capire cosa sta succedendo. Il 90% è rumore. Il 10% che conta è disperso, frammentato, non verificato.
              </p>
              <p className="text-[15px] leading-relaxed font-semibold"
                style={{ color: "#0f0f0f", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                Proof Press Intelligence fa questo lavoro al posto tuo — 24 ore su 24, 7 giorni su 7 — e ti consegna solo quello che ti serve per decidere. Non articoli. <span style={{ color: "#1a1a1a" }}>Insight azionabili.</span>
              </p>
            </div>
          </div>
        </section>

        {/* ══ SEZIONE 3 — COME FUNZIONA ═════════════════════════════════════════ */}
        <section id="come-funziona" className="py-16" style={{ background: "#fff" }}>
          <div className="max-w-[1100px] mx-auto px-4">
            <SectionLabel label="Come funziona" />
            <h2 className="text-[28px] sm:text-[34px] font-black mb-12 leading-tight"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif", color: "#0f0f0f" }}>
              4 passi. Zero attrito.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: "🎯",
                  step: "01",
                  title: "Configura il tuo profilo",
                  text: "Dicci chi sei, cosa fai, chi sono i tuoi competitor, quali mercati ti interessano. Il sistema si calibra sulle tue priorità.",
                },
                {
                  icon: "🔍",
                  step: "02",
                  title: "Gli agenti lavorano",
                  text: "8 agenti AI specializzati monitorano 450+ fonti ogni notte. L’algoritmo ProofPress Verify™ incrocia ogni dato su almeno 3 fonti indipendenti.",
                },
                {
                  icon: "📊",
                  step: "03",
                  title: "Ricevi il tuo briefing",
                  text: "Ogni mattina trovi la tua dashboard aggiornata: segnali di mercato, movimenti dei competitor, deal rilevanti, alert sugli scenari configurati.",
                },
                {
                  icon: "📋",
                  step: "04",
                  title: "Decidi e agisci",
                  text: "Report board-ready, executive summary, analisi scaricabili. Pronti per il tuo CdA, i tuoi investitori, il tuo team.",
                }
              ].map((s) => (
                <div key={s.step} className="p-5 rounded-lg" style={{ background: "#f5f2ec", border: "1px solid rgba(26,26,46,0.06)" }}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[22px]">{s.icon}</span>
                    <span className="text-[10px] font-bold" style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>STEP {s.step}</span>
                  </div>
                  <h3 className="text-[14px] font-bold mb-2" style={{ color: "#0f0f0f", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>{s.title}</h3>
                  <p className="text-[12px] leading-relaxed" style={{ color: "rgba(26,26,46,0.6)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ SEZIONE 4 — I PIANI ═══════════════════════════════════════════════ */}
        <section id="pricing" className="py-16" style={{ background: "#f5f2ec" }}>
          <div className="max-w-[1100px] mx-auto px-4">
            <SectionLabel label="I piani" />
            <h2 className="text-[28px] sm:text-[34px] font-black mb-3 leading-tight"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif", color: "#0f0f0f" }}>
              Scegli il livello di intelligence che ti serve.
            </h2>
            {/* Toggle annuale/mensile */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[11px]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", color: annual ? "rgba(26,26,46,0.4)" : "#0f0f0f" }}>Mensile</span>
              <button
                onClick={() => setAnnual(!annual)}
                className="relative flex-shrink-0"
                style={{ width: "44px", height: "24px", borderRadius: "12px", border: "none", cursor: "pointer", background: annual ? "#1a1a1a" : "rgba(26,26,46,0.2)", transition: "background 0.2s" }}
              >
                <span style={{ position: "absolute", top: "3px", left: annual ? "23px" : "3px", width: "18px", height: "18px", borderRadius: "50%", background: "#ffffff", transition: "left 0.2s", display: "block" }} />
              </button>
              <span className="text-[11px]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", color: annual ? "#1a1a1a" : "rgba(26,26,46,0.4)" }}>
                Annuale <span style={{ fontSize: "9px", background: "#1a1a1a", color: "#fff", padding: "1px 5px", borderRadius: "3px", marginLeft: "4px" }}>-15%</span>
              </span>
            </div>
            <p className="text-[13px] mb-10" style={{ color: "rgba(26,26,46,0.5)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
              14 giorni gratis su tutti i piani. Nessuna carta richiesta.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
              {/* Piano FREE */}
              <div className="flex flex-col p-6 rounded-lg" style={{ background: "#fff", border: "1px solid rgba(26,26,46,0.08)" }}>
                <div className="mb-4">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] mb-1" style={{ color: "rgba(26,26,46,0.4)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>FREE</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-[32px] font-black" style={{ color: "#0f0f0f", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>€0</span>
                  </div>
                  <p className="text-[12px] italic" style={{ color: "rgba(26,26,46,0.5)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>Inizia a esplorare. Zero impegno.</p>
                </div>
                <Divider color="#1a1a1a" opacity={0.08} />
                <ul className="mt-4 mb-6 flex flex-col gap-2 flex-1" role="list" aria-label="Funzionalità piano FREE">
                  {["5 articoli al giorno", "Tutti i titoli delle ricerche", "Newsletter settimanale gratuita", "Punto del Giorno editoriale"].map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12px]" style={{ color: "rgba(26,26,46,0.75)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                      <span style={{ color: "#1a1a1a", flexShrink: 0, marginTop: "2px" }} aria-hidden="true">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="/"
                  aria-label="Registrati gratis su Proof Press"
                  data-cta-name="free"
                  data-plan="free"
                  className="block text-center py-3 font-bold text-[11px] uppercase tracking-widest transition-all hover:opacity-70"
                  style={{ background: "transparent", color: "rgba(26,26,46,0.5)", border: "1.5px solid rgba(26,26,46,0.2)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                >
                  Registrati gratis →
                </a>
              </div>
              <PricingCard
                name="RADAR"
                price={radarPrice}
                subtitle="Per chi vuole un sistema, non un giornale."
                features={[
                  "Dashboard segnali di mercato personalizzata",
                  "Accesso completo a 20+ report quotidiani",
                  "Alert scenario-based configurabili (fino a 5)",
                  "Weekly personal briefing generato dall'AI",
                  "Newsletter curata settimanale",
                  "Archivio storico 12 mesi"
                ]}
                cta="Prova 14 giorni gratis"
                subCta="Nessuna carta richiesta"
                ctaHref="mailto:intelligence@ideasmart.biz?subject=Richiesta%20trial%20RADAR"
                ctaAriaLabel="Attiva prova gratuita piano RADAR"
              />
              <PricingCard
                name="INTEL"
                price={intelPrice}
                subtitle="Per chi deve prendere decisioni e portarle in board."
                features={[
                  "Tutto quello di RADAR, più:",
                  "Competitive Intelligence attiva — traccia fino a 10 aziende in continuo",
                  "Deal Flow Scanner con scoring automatico",
                  "Alert illimitati su scenari complessi",
                  "Board-ready report scaricabili e brandizzabili",
                  "Monthly strategy digest con trend analysis",
                  "Accesso prioritario alle ricerche on-demand"
                ]}
                cta="Attiva INTEL — 14 giorni gratis"
                subCta="Il piano scelto dal 70% dei decision-maker"
                highlighted
                ctaHref="mailto:intelligence@ideasmart.biz?subject=Richiesta%20trial%20INTEL"
                ctaAriaLabel="Attiva prova gratuita piano INTEL - 14 giorni gratis"
              />
              <PricingCard
                name="ENTERPRISE"
                price="Su misura"
                subtitle="Per fondi, corporate e scaleup che vogliono un sistema proprietario."
                features={[
                  "Tutto quello di INTEL, più:",
                  "Feed white-label per il tuo team o fondo",
                  "API access ai dati Proof Press",
                  "Briefing dedicati per il CdA",
                  "Integrazione Slack / Teams / CRM",
                  "Analyst-on-demand con senior advisor",
                  "Account manager dedicato"
                ]}
                cta="Parliamone — prenota una call"
                ctaHref="mailto:intelligence@ideasmart.biz?subject=Richiesta%20ENTERPRISE%20Intelligence"
                ctaAriaLabel="Contatta il team per il piano Enterprise"
              />
            </div>
          </div>
        </section>

        {/* ══ SEZIONE 5 — LA TECNOLOGIA ═════════════════════════════════════════ */}
        <section className="py-16" style={{ background: "#0f0f0f" }}>
          <div className="max-w-[1100px] mx-auto px-4">
            <SectionLabel label="La tecnologia" />
            <h2 className="text-[28px] sm:text-[34px] font-black mb-6 leading-tight"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif", color: "#fff" }}>
              8 agenti. 450 fonti. <span style={{ color: "#1a1a1a" }}>Zero bias.</span>
            </h2>
            <p className="text-[15px] leading-relaxed mb-10 max-w-[700px]"
              style={{ color: "rgba(255,255,255,0.6)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
              Il sistema agentico di Proof Press replica un team di 20 analisti. Ogni notte, i nostri agenti scandagliano fonti accademiche, report Gartner, CB Insights, McKinsey, feed VC, M&A tracker e media specializzati in 4 continenti. L’algoritmo proprietario ProofPress Verify™ incrocia ogni segnale su almeno 3 fonti indipendenti prima di pubblicarlo. Il risultato arriva sulla tua dashboard alle 00:00 CET, ogni giorno.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {[
                { icon: "🔍", name: "Market Scout", desc: "450+ fonti globali monitorate ogni notte" },
                { icon: "✅", name: "Data Verifier", desc: "Triple-check su fonti indipendenti" },
                { icon: "📊", name: "Senior Analyst", desc: "Report strutturati con key findings" },
                { icon: "🎯", name: "Intelligence Curator", desc: "Personalizzazione sul tuo profilo" }
              ].map((a) => (
                <div key={a.name} className="flex items-start gap-3 p-4 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,229,200,0.12)" }}>
                  <span className="text-[20px] flex-shrink-0">{a.icon}</span>
                  <div>
                    <p className="text-[12px] font-bold mb-0.5" style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>{a.name}</p>
                    <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <a href="/tecnologia"
              aria-label="Scopri tutti gli 8 agenti AI di Proof Press Intelligence"
              data-cta-name="tecnologia-agents"
              className="text-[11px] font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
              style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
              Scopri tutti gli 8 agenti →
            </a>
          </div>
        </section>

        {/* ══ SEZIONE 6 — ADVISORY ══════════════════════════════════════════════ */}
        <section className="py-16" style={{ background: "#fff" }}>
          <div className="max-w-[1100px] mx-auto px-4">
            <SectionLabel label="Advisory" />
            <h2 className="text-[28px] sm:text-[34px] font-black mb-4 leading-tight"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif", color: "#0f0f0f" }}>
              Quando i dati non bastano, c'è Advisory.
            </h2>
            <p className="text-[15px] leading-relaxed mb-4 max-w-[680px]"
              style={{ color: "rgba(26,26,46,0.65)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
              A volte i dati ti dicono <em>cosa</em> sta succedendo. Ma serve qualcuno che ti dica <em>cosa fare</em>. Proof Press Advisory è il nostro servizio di consulenza senior per le decisioni che richiedono un professionista al tavolo.
            </p>
            <p className="text-[14px] font-semibold mb-8"
              style={{ color: "#0f0f0f", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
              Il team: ex partner Big 5, ex managing director investment banking, founder con exit, ex partner VC. Non teorici — operatori con cicatrici sul campo.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {[
                { icon: "◈", name: "AI Innovation Strategy", desc: "Trasformazione AI per board e C-Level" },
                { icon: "◉", name: "M&A Advisory", desc: "Due diligence e valutazione asset tech" },
                { icon: "◎", name: "Partnership Scouting", desc: "Identificazione partner strategici" },
                { icon: "◇", name: "VC Research", desc: "Ricerche di mercato per decisioni di investimento" }
              ].map((s) => (
                <div key={s.name} className="flex items-start gap-3 p-4 rounded-lg"
                  style={{ background: "#f5f2ec", border: "1px solid rgba(26,26,46,0.06)" }}>
                  <span className="text-[18px] flex-shrink-0" style={{ color: "#1a1a1a" }}>{s.icon}</span>
                  <div>
                    <p className="text-[12px] font-bold mb-0.5" style={{ color: "#0f0f0f", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>{s.name}</p>
                    <p className="text-[12px]" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] mb-4" style={{ color: "rgba(26,26,46,0.4)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
              Project-based · Retainer mensile · Board Advisory
            </p>
            <a href="mailto:advisory@ideasmart.biz?subject=Richiesta%20consulenza%20Advisory"
              aria-label="Richiedi una consulenza Advisory"
              data-cta-name="advisory"
              className="inline-flex items-center gap-2 px-5 py-2.5 font-bold text-[11px] uppercase tracking-widest transition-all hover:opacity-90"
              style={{ background: "#0f0f0f", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
              Parliamo del tuo progetto — 30 minuti, zero impegno →
            </a>
          </div>
        </section>

        {/* ══ SEZIONE 7 — SOCIAL PROOF ══════════════════════════════════════════ */}
        <section className="py-16" style={{ background: "#f5f2ec" }}>
          <div className="max-w-[1100px] mx-auto px-4">
            <SectionLabel label="I numeri" />
            <h2 className="text-[28px] sm:text-[34px] font-black mb-10 leading-tight"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif", color: "#0f0f0f" }}>
              I numeri parlano.
            </h2>
            {/* TODO: Client logos row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {[
                { value: "100+", label: "decision-maker attivi" },
                { value: "20+", label: "analisi prodotte ogni giorno" },
                { value: "450+", label: "fonti monitorate in tempo reale" },
                { value: "48h", label: "tempo medio risposta advisory" },
                { value: "3×", label: "fonti di verifica per ogni dato" }
              ].map((m) => (
                <div key={m.label} className="text-center">
                  <span className="text-[32px] font-black block mb-1"
                    style={{ color: "#0f0f0f", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
                    {m.value}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest"
                    style={{ color: "rgba(26,26,46,0.45)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ SEZIONE 8 — CTA FINALE ════════════════════════════════════════════ */}
        <section className="py-20" style={{ background: "#0f0f0f" }}>
          <div className="max-w-[700px] mx-auto px-4 text-center">
            <SectionLabel label="Inizia adesso" />
            <h2 className="text-[28px] sm:text-[38px] font-black mb-4 leading-tight"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif", color: "#fff" }}>
              Inizia con una prova gratuita di{" "}
              <span style={{ color: "#1a1a1a" }}>14 giorni.</span>
            </h2>
            <p className="text-[15px] leading-relaxed mb-8"
              style={{ color: "rgba(255,255,255,0.55)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
              Nessuna carta di credito. Nessun impegno. Configura il tuo profilo in 2 minuti e domani mattina trovi il tuo primo briefing personalizzato pronto.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="mailto:intelligence@ideasmart.biz?subject=Attivazione%20prova%20gratuita%20Intelligence"
                aria-label="Attiva la prova gratuita di Proof Press Intelligence"
                data-cta-name="cta-finale"
                className="inline-flex items-center gap-2 px-7 py-3.5 font-bold text-[12px] uppercase tracking-widest transition-all hover:opacity-90"
                style={{ background: "#1a1a1a", color: "#0f0f0f", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                Attiva la prova gratuita →
              </a>
              <a href="mailto:intelligence@ideasmart.biz?subject=Richiesta%20prova%20gratuita%20Intelligence"
                className="text-[12px] hover:opacity-70 transition-opacity"
                aria-label="Scrivi direttamente a intelligence@ideasmart.biz"
                style={{ color: "rgba(255,255,255,0.45)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                Oppure scrivici a intelligence@ideasmart.biz
              </a>
            </div>
            <div className="mt-6">
              <a href="/"
                className="text-[11px] hover:opacity-70 transition-opacity underline"
                aria-label="Registrati gratis e leggi 5 articoli al giorno"
                style={{ color: "rgba(255,255,255,0.35)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                Non sei pronto? Registrati gratis e leggi 5 articoli al giorno →
              </a>
            </div>
          </div>
        </section>

        <SharedPageFooter />
        </div>
      </div>
    </>
  );
}
