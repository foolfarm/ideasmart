/**
 * IDEASMART INTELLIGENCE — Pagina prodotto
 * Design: Dark navy (#0a0f1e) + Cyan (#00e5c8) + Off-white (#f5f2ec)
 * Typography: Playfair Display (titoli), DM Sans (body), Space Mono (label/meta)
 * 8 sezioni: Hero → Problema → Come funziona → Piani → Tecnologia → Advisory → Social Proof → CTA finale
 */
import { useState } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import SEOHead from "@/components/SEOHead";

// ─── Divider ─────────────────────────────────────────────────────────────────
function Divider({ color = "#00e5c8", opacity = 0.2 }: { color?: string; opacity?: number }) {
  return <div style={{ height: "1px", background: color, opacity }} />;
}

// ─── Section Label ────────────────────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <span className="text-[10px] font-bold uppercase tracking-[0.25em] block mb-3"
      style={{ color: "#00e5c8", fontFamily: "'Space Mono', monospace" }}>
      {label}
    </span>
  );
}

// ─── Pricing Card ─────────────────────────────────────────────────────────────
function PricingCard({
  name, price, subtitle, features, cta, subCta, highlighted = false,
}: {
  name: string;
  price: string;
  subtitle: string;
  features: string[];
  cta: string;
  subCta?: string;
  highlighted?: boolean;
}) {
  return (
    <div className="relative flex flex-col p-6 rounded-lg"
      style={{
        background: highlighted ? "#0a0f1e" : "#fff",
        border: highlighted ? "2px solid #00e5c8" : "1px solid rgba(26,26,46,0.12)",
        boxShadow: highlighted ? "0 0 40px rgba(0,229,200,0.12)" : "none",
      }}>
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 text-[9px] font-bold uppercase tracking-widest"
            style={{ background: "#00e5c8", color: "#0a0f1e", fontFamily: "'Space Mono', monospace" }}>
            Più popolare
          </span>
        </div>
      )}
      <div className="mb-4">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] mb-1"
          style={{ color: highlighted ? "#00e5c8" : "#0a6e5c", fontFamily: "'Space Mono', monospace" }}>
          {name}
        </h3>
        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-[32px] font-black"
            style={{ color: highlighted ? "#fff" : "#0a0f1e", fontFamily: "'Playfair Display', Georgia, serif" }}>
            {price}
          </span>
          {price !== "Su misura" && (
            <span className="text-[12px]" style={{ color: highlighted ? "rgba(255,255,255,0.5)" : "rgba(26,26,46,0.4)", fontFamily: "'Space Mono', monospace" }}>
              /mese
            </span>
          )}
        </div>
        <p className="text-[12px]" style={{ color: highlighted ? "rgba(255,255,255,0.65)" : "rgba(26,26,46,0.6)", fontFamily: "'DM Sans', Arial, sans-serif" }}>
          {subtitle}
        </p>
      </div>
      <Divider color={highlighted ? "#00e5c8" : "#1a1a2e"} opacity={highlighted ? 0.2 : 0.08} />
      <ul className="mt-4 mb-6 flex flex-col gap-2 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-[12px]"
            style={{ color: highlighted ? "rgba(255,255,255,0.8)" : "rgba(26,26,46,0.75)", fontFamily: "'DM Sans', Arial, sans-serif" }}>
            <span style={{ color: "#00e5c8", flexShrink: 0, marginTop: "2px" }}>✓</span>
            {f}
          </li>
        ))}
      </ul>
      <a href="mailto:intelligence@ideasmart.biz"
        className="block text-center py-3 font-bold text-[11px] uppercase tracking-widest transition-all hover:opacity-90"
        style={{
          background: highlighted ? "#00e5c8" : "transparent",
          color: highlighted ? "#0a0f1e" : "#0a6e5c",
          border: highlighted ? "none" : "1.5px solid #0a6e5c",
          fontFamily: "'Space Mono', monospace",
        }}>
        {cta}
      </a>
      {subCta && (
        <p className="mt-2 text-center text-[10px]"
          style={{ color: highlighted ? "rgba(255,255,255,0.35)" : "rgba(26,26,46,0.35)", fontFamily: "'Space Mono', monospace" }}>
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
        title="IdeaSmart Intelligence — Non leggere le notizie. Usale per decidere."
        description="Competitive monitoring, alert scenario-based e briefing personalizzati per CEO, founder e investitori. 450+ fonti, 20+ analisi/giorno, aggiornamento 00:00 CET."
        ogSiteName="IDEASMART INTELLIGENCE"
        keywords="intelligence AI, competitive monitoring, briefing CEO, startup Italia, venture capital, decision maker"
      />
      <div style={{ background: "#f5f2ec", minHeight: "100vh" }}>
        <Navbar />

        {/* ══ SEZIONE 1 — HERO ══════════════════════════════════════════════════ */}
        <section style={{ background: "#0a0f1e" }}>
          <div className="max-w-[1100px] mx-auto px-4 py-16 sm:py-24">
            {/* Breadcrumb */}
            <div className="mb-8">
              <Link href="/">
                <span className="text-[10px] uppercase tracking-widest cursor-pointer hover:opacity-70 transition-opacity"
                  style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace" }}>
                  ← IdeaSmart · Intelligence
                </span>
              </Link>
            </div>

            <div className="max-w-[800px]">
              <SectionLabel label="NUOVO" />
              <h1 className="mb-6 leading-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(2.2rem, 5vw, 3.8rem)", fontWeight: 900, color: "#fff" }}>
                Intelligence che lavora.{" "}
                <span style={{ color: "#00e5c8" }}>Decisioni che contano.</span>
              </h1>
              <p className="mb-8 text-[16px] leading-relaxed"
                style={{ color: "rgba(255,255,255,0.65)", fontFamily: "'DM Sans', Arial, sans-serif", maxWidth: "620px" }}>
                Monitoriamo i tuoi competitor, tracciamo i deal nel tuo mercato, e ogni settimana ti diciamo cosa è cambiato e perché ti riguarda. Non è un giornale. È il tuo sistema di intelligence operativa.
              </p>

              {/* Metriche */}
              <div className="flex flex-wrap gap-6 mb-10">
                {[
                  { value: "450+", label: "fonti monitorate" },
                  { value: "20+", label: "analisi/giorno" },
                  { value: "00:00", label: "aggiornamento CET" },
                ].map((m) => (
                  <div key={m.label}>
                    <span className="text-[22px] font-black block" style={{ color: "#00e5c8", fontFamily: "'Space Mono', monospace" }}>{m.value}</span>
                    <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace" }}>{m.label}</span>
                  </div>
                ))}
              </div>

              <a href="#piani"
                className="inline-flex items-center gap-2 px-6 py-3 font-bold text-[12px] uppercase tracking-widest transition-all hover:opacity-90"
                style={{ background: "#00e5c8", color: "#0a0f1e", fontFamily: "'Space Mono', monospace" }}>
                Scegli il tuo piano →
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
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#0a0f1e" }}>
                Il 90% è rumore.
              </h2>
              <p className="text-[15px] leading-relaxed mb-4"
                style={{ color: "rgba(26,26,46,0.7)", fontFamily: "'DM Sans', Arial, sans-serif" }}>
                Ogni mattina, chi prende decisioni su AI, investimenti e tecnologia deve setacciare decine di fonti, report, newsletter e feed per capire cosa sta succedendo. Il 90% è rumore. Il 10% che conta è disperso, frammentato, non verificato.
              </p>
              <p className="text-[15px] leading-relaxed font-semibold"
                style={{ color: "#0a0f1e", fontFamily: "'DM Sans', Arial, sans-serif" }}>
                IdeaSmart Intelligence fa questo lavoro al posto tuo — 24 ore su 24, 7 giorni su 7 — e ti consegna solo quello che ti serve per decidere. Non articoli. <span style={{ color: "#0a6e5c" }}>Insight azionabili.</span>
              </p>
            </div>
          </div>
        </section>

        {/* ══ SEZIONE 3 — COME FUNZIONA ═════════════════════════════════════════ */}
        <section className="py-16" style={{ background: "#fff" }}>
          <div className="max-w-[1100px] mx-auto px-4">
            <SectionLabel label="Come funziona" />
            <h2 className="text-[28px] sm:text-[34px] font-black mb-12 leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#0a0f1e" }}>
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
                  text: "8 agenti AI specializzati monitorano 450+ fonti ogni notte. L'algoritmo Verify™ incrocia ogni dato su almeno 3 fonti indipendenti.",
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
                },
              ].map((s) => (
                <div key={s.step} className="p-5 rounded-lg" style={{ background: "#f5f2ec", border: "1px solid rgba(26,26,46,0.06)" }}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[22px]">{s.icon}</span>
                    <span className="text-[10px] font-bold" style={{ color: "#00e5c8", fontFamily: "'Space Mono', monospace" }}>STEP {s.step}</span>
                  </div>
                  <h3 className="text-[14px] font-bold mb-2" style={{ color: "#0a0f1e", fontFamily: "'Playfair Display', Georgia, serif" }}>{s.title}</h3>
                  <p className="text-[12px] leading-relaxed" style={{ color: "rgba(26,26,46,0.6)", fontFamily: "'DM Sans', Arial, sans-serif" }}>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ SEZIONE 4 — I PIANI ═══════════════════════════════════════════════ */}
        <section id="piani" className="py-16" style={{ background: "#f5f2ec" }}>
          <div className="max-w-[1100px] mx-auto px-4">
            <SectionLabel label="I piani" />
            <h2 className="text-[28px] sm:text-[34px] font-black mb-3 leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#0a0f1e" }}>
              Scegli il livello di intelligence che ti serve.
            </h2>
            {/* Toggle annuale/mensile */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[11px]" style={{ fontFamily: "'Space Mono', monospace", color: annual ? "rgba(26,26,46,0.4)" : "#0a0f1e" }}>Mensile</span>
              <button
                onClick={() => setAnnual(!annual)}
                className="relative flex-shrink-0"
                style={{ width: "44px", height: "24px", borderRadius: "12px", border: "none", cursor: "pointer", background: annual ? "#0a6e5c" : "rgba(26,26,46,0.2)", transition: "background 0.2s" }}
              >
                <span style={{ position: "absolute", top: "3px", left: annual ? "23px" : "3px", width: "18px", height: "18px", borderRadius: "50%", background: "#ffffff", transition: "left 0.2s", display: "block" }} />
              </button>
              <span className="text-[11px]" style={{ fontFamily: "'Space Mono', monospace", color: annual ? "#0a6e5c" : "rgba(26,26,46,0.4)" }}>
                Annuale <span style={{ fontSize: "9px", background: "#0a6e5c", color: "#fff", padding: "1px 5px", borderRadius: "3px", marginLeft: "4px" }}>-15%</span>
              </span>
            </div>
            <p className="text-[13px] mb-10" style={{ color: "rgba(26,26,46,0.5)", fontFamily: "'Space Mono', monospace" }}>
              14 giorni gratis su tutti i piani. Nessuna carta richiesta.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PricingCard
                name="RADAR"
                price={radarPrice}
                subtitle="Per chi vuole restare informato senza perdere tempo."
                features={[
                  "Dashboard segnali di mercato personalizzata",
                  "Accesso completo a 20+ report quotidiani",
                  "Alert scenario-based configurabili (fino a 5)",
                  "Weekly personal briefing generato dall'AI",
                  "Newsletter curata settimanale",
                  "Archivio storico 12 mesi",
                ]}
                cta="Prova 14 giorni gratis"
                subCta="Nessuna carta richiesta"
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
                  "Accesso prioritario alle ricerche on-demand",
                ]}
                cta="Attiva INTEL — 14 giorni gratis"
                subCta="Il piano scelto dal 70% dei decision-maker"
                highlighted
              />
              <PricingCard
                name="ENTERPRISE"
                price="Su misura"
                subtitle="Per fondi, corporate e scaleup che vogliono un sistema proprietario."
                features={[
                  "Tutto quello di INTEL, più:",
                  "Feed white-label per il tuo team o fondo",
                  "API access ai dati IdeaSmart",
                  "Briefing dedicati per il CdA",
                  "Integrazione Slack / Teams / CRM",
                  "Analyst-on-demand con senior advisor",
                  "Account manager dedicato",
                ]}
                cta="Parliamone — prenota una call"
              />
            </div>
          </div>
        </section>

        {/* ══ SEZIONE 5 — LA TECNOLOGIA ═════════════════════════════════════════ */}
        <section className="py-16" style={{ background: "#0a0f1e" }}>
          <div className="max-w-[1100px] mx-auto px-4">
            <SectionLabel label="La tecnologia" />
            <h2 className="text-[28px] sm:text-[34px] font-black mb-6 leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#fff" }}>
              8 agenti. 450 fonti. <span style={{ color: "#00e5c8" }}>Zero bias.</span>
            </h2>
            <p className="text-[15px] leading-relaxed mb-10 max-w-[700px]"
              style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans', Arial, sans-serif" }}>
              Il sistema agentico di IdeaSmart replica un team di 20 analisti. Ogni notte, i nostri agenti scandagliano fonti accademiche, report Gartner, CB Insights, McKinsey, feed VC, M&A tracker e media specializzati in 4 continenti. L'algoritmo proprietario Verify™ incrocia ogni segnale su almeno 3 fonti indipendenti prima di pubblicarlo. Il risultato arriva sulla tua dashboard alle 00:00 CET, ogni giorno.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {[
                { icon: "🔍", name: "Market Scout", desc: "450+ fonti globali monitorate ogni notte" },
                { icon: "✅", name: "Data Verifier", desc: "Triple-check su fonti indipendenti" },
                { icon: "📊", name: "Senior Analyst", desc: "Report strutturati con key findings" },
                { icon: "🎯", name: "Intelligence Curator", desc: "Personalizzazione sul tuo profilo" },
              ].map((a) => (
                <div key={a.name} className="flex items-start gap-3 p-4 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,229,200,0.12)" }}>
                  <span className="text-[20px] flex-shrink-0">{a.icon}</span>
                  <div>
                    <p className="text-[12px] font-bold mb-0.5" style={{ color: "#00e5c8", fontFamily: "'Space Mono', monospace" }}>{a.name}</p>
                    <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', Arial, sans-serif" }}>{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <a href="#piani" className="text-[11px] font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
              style={{ color: "#00e5c8", fontFamily: "'Space Mono', monospace" }}>
              Scopri tutti gli 8 agenti →
            </a>
          </div>
        </section>

        {/* ══ SEZIONE 6 — ADVISORY ══════════════════════════════════════════════ */}
        <section className="py-16" style={{ background: "#fff" }}>
          <div className="max-w-[1100px] mx-auto px-4">
            <SectionLabel label="Advisory" />
            <h2 className="text-[28px] sm:text-[34px] font-black mb-4 leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#0a0f1e" }}>
              Quando i dati non bastano, c'è Advisory.
            </h2>
            <p className="text-[15px] leading-relaxed mb-4 max-w-[680px]"
              style={{ color: "rgba(26,26,46,0.65)", fontFamily: "'DM Sans', Arial, sans-serif" }}>
              A volte i dati ti dicono <em>cosa</em> sta succedendo. Ma serve qualcuno che ti dica <em>cosa fare</em>. IdeaSmart Advisory è il nostro servizio di consulenza senior per le decisioni che richiedono un professionista al tavolo.
            </p>
            <p className="text-[14px] font-semibold mb-8"
              style={{ color: "#0a0f1e", fontFamily: "'DM Sans', Arial, sans-serif" }}>
              Il team: ex partner Big 5, ex managing director investment banking, founder con exit, ex partner VC. Non teorici — operatori con cicatrici sul campo.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {[
                { icon: "◈", name: "AI Innovation Strategy", desc: "Trasformazione AI per board e C-Level" },
                { icon: "◉", name: "M&A Advisory", desc: "Due diligence e valutazione asset tech" },
                { icon: "◎", name: "Partnership Scouting", desc: "Identificazione partner strategici" },
                { icon: "◇", name: "VC Research", desc: "Ricerche di mercato per decisioni di investimento" },
              ].map((s) => (
                <div key={s.name} className="flex items-start gap-3 p-4 rounded-lg"
                  style={{ background: "#f5f2ec", border: "1px solid rgba(26,26,46,0.06)" }}>
                  <span className="text-[18px] flex-shrink-0" style={{ color: "#0a6e5c" }}>{s.icon}</span>
                  <div>
                    <p className="text-[12px] font-bold mb-0.5" style={{ color: "#0a0f1e", fontFamily: "'Space Mono', monospace" }}>{s.name}</p>
                    <p className="text-[12px]" style={{ color: "rgba(26,26,46,0.55)", fontFamily: "'DM Sans', Arial, sans-serif" }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] mb-4" style={{ color: "rgba(26,26,46,0.4)", fontFamily: "'Space Mono', monospace" }}>
              Project-based · Retainer mensile · Board Advisory
            </p>
            <a href="mailto:advisory@ideasmart.biz"
              className="inline-flex items-center gap-2 px-5 py-2.5 font-bold text-[11px] uppercase tracking-widest transition-all hover:opacity-90"
              style={{ background: "#0a0f1e", color: "#fff", fontFamily: "'Space Mono', monospace" }}>
              Parliamo del tuo progetto — 30 minuti, zero impegno →
            </a>
          </div>
        </section>

        {/* ══ SEZIONE 7 — SOCIAL PROOF ══════════════════════════════════════════ */}
        <section className="py-16" style={{ background: "#f5f2ec" }}>
          <div className="max-w-[1100px] mx-auto px-4">
            <SectionLabel label="I numeri" />
            <h2 className="text-[28px] sm:text-[34px] font-black mb-10 leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#0a0f1e" }}>
              I numeri parlano.
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {[
                { value: "100+", label: "decision-maker attivi" },
                { value: "20+", label: "analisi prodotte ogni giorno" },
                { value: "450+", label: "fonti monitorate in tempo reale" },
                { value: "48h", label: "tempo medio risposta advisory" },
                { value: "3×", label: "fonti di verifica per ogni dato" },
              ].map((m) => (
                <div key={m.label} className="text-center">
                  <span className="text-[32px] font-black block mb-1"
                    style={{ color: "#0a0f1e", fontFamily: "'Playfair Display', Georgia, serif" }}>
                    {m.value}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest"
                    style={{ color: "rgba(26,26,46,0.45)", fontFamily: "'Space Mono', monospace" }}>
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ SEZIONE 8 — CTA FINALE ════════════════════════════════════════════ */}
        <section className="py-20" style={{ background: "#0a0f1e" }}>
          <div className="max-w-[700px] mx-auto px-4 text-center">
            <SectionLabel label="Inizia adesso" />
            <h2 className="text-[28px] sm:text-[38px] font-black mb-4 leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#fff" }}>
              Inizia con una prova gratuita di{" "}
              <span style={{ color: "#00e5c8" }}>14 giorni.</span>
            </h2>
            <p className="text-[15px] leading-relaxed mb-8"
              style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'DM Sans', Arial, sans-serif" }}>
              Nessuna carta di credito. Nessun impegno. Configura il tuo profilo in 2 minuti e domani mattina trovi il tuo primo briefing personalizzato pronto.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="mailto:intelligence@ideasmart.biz"
                className="inline-flex items-center gap-2 px-7 py-3.5 font-bold text-[12px] uppercase tracking-widest transition-all hover:opacity-90"
                style={{ background: "#00e5c8", color: "#0a0f1e", fontFamily: "'Space Mono', monospace" }}>
                Attiva la prova gratuita →
              </a>
              <a href="mailto:intelligence@ideasmart.biz"
                className="text-[12px] hover:opacity-70 transition-opacity"
                style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Space Mono', monospace" }}>
                Oppure scrivici a intelligence@ideasmart.biz
              </a>
            </div>
          </div>
        </section>

        {/* ══ FOOTER MINIMAL ════════════════════════════════════════════════════ */}
        <div className="py-4 px-4 flex flex-col sm:flex-row items-center justify-between gap-2"
          style={{ background: "#0a0f1e", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'Space Mono', monospace" }}>
            © {new Date().getFullYear()} IdeaSmart Intelligence · AI · Startup · Venture Capital
          </p>
          <div className="flex items-center gap-4">
            <Link href="/"><span className="text-[10px] hover:opacity-70 cursor-pointer" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Space Mono', monospace" }}>Home</span></Link>
            <Link href="/research"><span className="text-[10px] hover:opacity-70 cursor-pointer" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Space Mono', monospace" }}>Research</span></Link>
            <Link href="/chi-siamo"><span className="text-[10px] hover:opacity-70 cursor-pointer" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Space Mono', monospace" }}>Chi Siamo</span></Link>
            <Link href="/privacy"><span className="text-[10px] hover:opacity-70 cursor-pointer" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Space Mono', monospace" }}>Privacy</span></Link>
          </div>
        </div>
      </div>
    </>
  );
}
