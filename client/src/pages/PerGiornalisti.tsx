/**
 * ProofPress Creator — Offerta Commerciale
 * 3 piani: Basic €199 | Plus €299 | Gold €399
 * Design: bianco (#ffffff), nero (#0a0a0a), rosso (#dc2626)
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import SEOHead from "@/components/SEOHead";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import LeftSidebar from "@/components/LeftSidebar";
import { toast } from "sonner";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function Divider() {
  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8">
      <div className="border-t border-[#0a0a0a]/8" />
    </div>
  );
}

interface PlanCardProps {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  priceLabel: string;
  priceSubLabel: string;
  verticali: number;
  features: string[];
  highlight: boolean;
  onCheckout: (planId: string) => void;
  loading: boolean;
}

function PlanCard({ id, name, badge, tagline, priceLabel, priceSubLabel, verticali, features, highlight, onCheckout, loading }: PlanCardProps) {
  const badgeColor = badge === "MOST POPULAR" ? "#dc2626" : badge === "PREMIUM" ? "#d97706" : "#6b7280";
  return (
    <div
      className="relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        background: highlight ? "#0a0a0a" : "#ffffff",
        border: highlight ? "2px solid #dc2626" : "2px solid #e5e7eb",
        boxShadow: highlight
          ? "0 20px 60px rgba(220,38,38,0.15), 0 8px 24px rgba(0,0,0,0.12)"
          : "0 4px 20px rgba(0,0,0,0.06)",
      }}
    >
      {highlight && (
        <div
          className="text-center text-[11px] font-black uppercase tracking-[0.2em] py-2"
          style={{ background: "#dc2626", color: "#fff" }}
        >
          ★ Più scelto dai creator ★
        </div>
      )}
      <div className="p-7 flex flex-col flex-1 gap-6">
        <div className="flex flex-col gap-3">
          <span
            className="inline-block text-[10px] font-black uppercase tracking-[0.18em] px-2.5 py-1 rounded-full w-fit"
            style={{ background: badgeColor, color: "#fff" }}
          >
            {badge}
          </span>
          <div>
            <h3 className="text-xl font-black leading-tight" style={{ color: highlight ? "#ffffff" : "#0a0a0a" }}>
              {name}
            </h3>
            <p className="text-sm mt-1 leading-snug" style={{ color: highlight ? "rgba(255,255,255,0.6)" : "rgba(10,10,10,0.5)" }}>
              {tagline}
            </p>
          </div>
        </div>
        <div className="flex items-end gap-1">
          <span className="text-5xl font-black leading-none" style={{ color: highlight ? "#ffffff" : "#0a0a0a" }}>
            {priceLabel}
          </span>
          <span className="text-base font-medium mb-1" style={{ color: highlight ? "rgba(255,255,255,0.5)" : "rgba(10,10,10,0.4)" }}>
            {priceSubLabel}
          </span>
        </div>
        <div
          className="rounded-xl px-4 py-3 text-center"
          style={{ background: highlight ? "rgba(220,38,38,0.15)" : "rgba(10,10,10,0.04)" }}
        >
          <span className="text-2xl font-black" style={{ color: highlight ? "#ff6b6b" : "#dc2626" }}>
            {verticali} {verticali === 1 ? "Verticale" : "Verticali"} Tematic{verticali === 1 ? "o" : "i"}
          </span>
        </div>
        <ul className="flex flex-col gap-2.5 flex-1">
          {features.map((f, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-[14px] leading-snug"
              style={{ color: highlight ? "rgba(255,255,255,0.75)" : "rgba(10,10,10,0.7)" }}
            >
              <span className="mt-0.5 shrink-0 font-bold" style={{ color: highlight ? "#4ade80" : "#16a34a" }}>✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <a
          href="https://proofpressverify.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[12px] font-semibold no-underline hover:opacity-80 transition-opacity"
          style={{ color: highlight ? "rgba(255,255,255,0.5)" : "rgba(10,10,10,0.4)" }}
        >
          <span className="text-base">🔐</span>
          <span>Certificato ProofPress Verify™</span>
        </a>
        <button
          onClick={() => onCheckout(id)}
          disabled={loading}
          className="w-full py-4 rounded-xl text-[15px] font-black uppercase tracking-[0.1em] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: highlight ? "#dc2626" : "#0a0a0a",
            color: "#ffffff",
            boxShadow: highlight ? "0 4px 20px rgba(220,38,38,0.4)" : "none",
          }}
        >
          {loading ? "Apertura checkout…" : "INIZIA ORA"}
        </button>
        <p
          className="text-center text-[11px]"
          style={{ color: highlight ? "rgba(255,255,255,0.35)" : "rgba(10,10,10,0.35)" }}
        >
          Nessun vincolo · Disdici quando vuoi
        </p>
      </div>
    </div>
  );
}

export default function PerGiornalisti() {
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const createCheckout = trpc.creator.createCheckout.useMutation({
    retry: false,
    onError: (err) => {
      setLoadingPlan(null);
      toast.error("Errore checkout: " + (err.message || "Riprova tra qualche secondo."));
    },
  });

  const handleCheckout = async (planId: string) => {
    setLoadingPlan(planId);
    try {
      const result = await createCheckout.mutateAsync({
        planId: planId as "creator_starter" | "creator_publisher" | "creator_gold",
        origin: window.location.origin,
        customerEmail: user?.email ?? undefined,
        customerName: user?.name ?? undefined,
      });
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    } catch {
      // onError gestisce già il toast
    } finally {
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      id: "creator_basic",
      name: "ProofPress Creator Basic",
      badge: "STARTER",
      tagline: "Lancia il tuo primo verticale",
      priceLabel: "€199",
      priceSubLabel: "/mese",
      verticali: 1,
      highlight: false,
      features: [
        "1 Verticale Tematico",
        "Articoli giornalieri certificati ProofPress Verify™",
        "Pubblicazione automatica",
        "Newsletter settimanale",
        "Dashboard analytics",
        "Supporto onboarding",
      ],
    },
    {
      id: "creator_plus",
      name: "ProofPress Creator Plus",
      badge: "MOST POPULAR",
      tagline: "Scala su 3 settori chiave",
      priceLabel: "€299",
      priceSubLabel: "/mese",
      verticali: 3,
      highlight: true,
      features: [
        "3 Verticali Tematici",
        "Articoli giornalieri certificati ProofPress Verify™",
        "Pubblicazione automatica multi-verticale",
        "Newsletter settimanale per verticale",
        "Dashboard analytics avanzata",
        "Post social generati automaticamente",
        "Supporto prioritario",
      ],
    },
    {
      id: "creator_gold",
      name: "ProofPress Creator Gold",
      badge: "PREMIUM",
      tagline: "La redazione AI completa",
      priceLabel: "€399",
      priceSubLabel: "/mese",
      verticali: 6,
      highlight: false,
      features: [
        "6 Verticali Tematici",
        "Articoli giornalieri certificati ProofPress Verify™",
        "Pubblicazione automatica multi-verticale",
        "Newsletter settimanale per verticale",
        "Dashboard analytics enterprise",
        "Post social generati automaticamente",
        "Report mensile di performance editoriale",
        "Account manager dedicato",
        "Accesso API ProofPress",
      ],
    },
  ];

  return (
    <>
      <SEOHead
        title="ProofPress Creator — La Redazione AI per Giornalisti e Testate Online"
        description="Lancia la tua testata online con una redazione AI. 1, 3 o 6 verticali tematici. Articoli giornalieri certificati ProofPress Verify™. Da €199/mese."
        canonical="https://proofpress.ai/offertacommerciale"
        ogSiteName="ProofPress"
      />
      <div className="flex min-h-screen" style={{ background: "#ffffff", color: "#0a0a0a", fontFamily: FONT }}>
        <LeftSidebar />
        <div className="flex-1 min-w-0">
          <SharedPageHeader />
          {/* ═══ HERO ═══ */}
          <section className="pt-24 pb-20 md:pt-32 md:pb-28" style={{ background: "#ffffff" }}>
            <div className="max-w-6xl mx-auto px-5 md:px-8">
              <div className="flex flex-col gap-6 max-w-4xl">
                <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#dc2626]">
                  Per Freelancer · Giornalisti · Testate Online
                </span>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-[#0a0a0a]">
                  <span style={{ color: "#dc2626" }}>ProofPress</span> Creator<br />
                  <span className="text-[#0a0a0a]/25">Il Giornale<br />Che si Scrive da Solo.</span>
                </h1>
                <p className="text-xl md:text-2xl font-bold leading-tight text-[#0a0a0a] max-w-3xl">
                  Una redazione AI completa, sotto la tua direzione.<br />
                  Tu scegli i verticali. Noi produciamo, verifichiamo e pubblichiamo.
                </p>
                <p className="text-lg font-medium leading-relaxed text-[#0a0a0a]/55 max-w-3xl">
                  Ogni articolo è certificato{" "}
                  <a
                    href="https://proofpressverify.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold underline decoration-[#dc2626]/40 hover:decoration-[#dc2626] transition-all"
                    style={{ color: "#dc2626" }}
                  >
                    ProofPress Verify™
                  </a>
                  {" "}— il protocollo di validazione agentica con hash crittografico immutabile che certifica ogni notizia su fonti multiple.
                </p>
                <div className="flex flex-wrap gap-6 pt-2">
                  {[
                    { n: "10–15", label: "articoli/giorno per verticale" },
                    { n: "4.000+", label: "fonti monitorate" },
                    { n: "100%", label: "certificazione ProofPress Verify™" },
                  ].map(({ n, label }) => (
                    <div key={n} className="flex flex-col">
                      <span className="text-3xl font-black text-[#0a0a0a]">{n}</span>
                      <span className="text-sm text-[#0a0a0a]/45">{label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => document.getElementById("piani")?.scrollIntoView({ behavior: "smooth" })}
                    className="px-8 py-3.5 rounded-xl text-[14px] font-black uppercase tracking-[0.1em] text-white transition-all hover:opacity-90"
                    style={{ background: "#dc2626" }}
                  >
                    Scegli il tuo piano →
                  </button>
                  <a
                    href="https://proofpressverify.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-3.5 rounded-xl text-[14px] font-black uppercase tracking-[0.1em] transition-all hover:bg-[#0a0a0a]/5 no-underline"
                    style={{ border: "2px solid rgba(10,10,10,0.15)", color: "#0a0a0a" }}
                  >
                    🔐 Scopri Verify™
                  </a>
                </div>
              </div>
            </div>
          </section>

          <Divider />

          {/* ═══ PROBLEMA / SOLUZIONE ═══ */}
          <section className="py-20 md:py-28" style={{ background: "#f5f5f7" }}>
            <div className="max-w-6xl mx-auto px-5 md:px-8">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="flex flex-col gap-6">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/40">Il problema</span>
                  <h2 className="text-3xl md:text-4xl font-black leading-tight text-[#0a0a0a]">
                    Una redazione tradizionale<br />costa €150–250k/anno.
                  </h2>
                  <p className="text-lg text-[#0a0a0a]/60 leading-relaxed">
                    Giornalisti, editor, fact-checker, social media manager, strumenti editoriali. Anche una piccola testata con 2–3 persone supera facilmente i €100k all'anno. Per un freelance o un editore indipendente è insostenibile.
                  </p>
                </div>
                <div className="flex flex-col gap-6">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#dc2626]">La soluzione</span>
                  <h2 className="text-3xl md:text-4xl font-black leading-tight text-[#0a0a0a]">
                    ProofPress Creator:<br />da €199/mese.
                  </h2>
                  <p className="text-lg text-[#0a0a0a]/60 leading-relaxed">
                    Una redazione AI completa che produce, verifica e pubblica per te. Stessa qualità editoriale, costi ridotti del 95%, certificazione crittografica su ogni articolo.
                  </p>
                  <ul className="flex flex-col gap-2.5">
                    {[
                      "Risparmio fino a €240k/anno vs redazione tradizionale",
                      "Setup in 5–7 giorni lavorativi",
                      "Nessun vincolo contrattuale a lungo termine",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2.5 text-[15px] text-[#0a0a0a]/75 leading-snug">
                        <span className="mt-0.5 shrink-0 text-[#16a34a] font-bold text-base">✓</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <Divider />

          {/* ═══ COME FUNZIONA ═══ */}
          <section className="py-20 md:py-28" style={{ background: "#ffffff" }}>
            <div className="max-w-6xl mx-auto px-5 md:px-8">
              <div className="flex flex-col gap-4 mb-14">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/40">Come funziona</span>
                <h2 className="text-3xl md:text-4xl font-black text-[#0a0a0a]">3 passi per lanciare la tua testata AI</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { n: "01", title: "Scegli i tuoi verticali", desc: "Seleziona 1, 3 o 6 settori tematici: AI, startup, finanza, salute, sport, tech, lifestyle — qualsiasi nicchia editoriale." },
                  { n: "02", title: "Configura fonti e tono", desc: "Indichi le fonti da monitorare e il tono editoriale. Il sistema impara il tuo stile e produce contenuti coerenti con la tua identità." },
                  { n: "03", title: "Pubblica e certifica", desc: "Ogni articolo viene verificato automaticamente con ProofPress Verify™ e pubblicato. Tu supervisioni, approvi o modifichi." },
                ].map(({ n, title, desc }) => (
                  <div key={n} className="flex flex-col gap-4 p-6 rounded-2xl" style={{ background: "#f5f5f7" }}>
                    <span className="text-5xl font-black text-[#0a0a0a]/10">{n}</span>
                    <h3 className="text-xl font-black text-[#0a0a0a]">{title}</h3>
                    <p className="text-[15px] text-[#0a0a0a]/60 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <Divider />

          {/* ═══ PROOFPRESS VERIFY ═══ */}
          <section className="py-20 md:py-28" style={{ background: "#0a0a0a" }}>
            <div className="max-w-6xl mx-auto px-5 md:px-8">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="flex flex-col gap-6 flex-1">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#dc2626]">Tecnologia esclusiva</span>
                  <h2 className="text-3xl md:text-4xl font-black leading-tight text-white">
                    🔐 ProofPress Verify™<br />
                    <span className="text-white/40">La certificazione che cambia tutto.</span>
                  </h2>
                  <p className="text-lg text-white/60 leading-relaxed">
                    Ogni articolo prodotto da ProofPress Creator viene analizzato su fonti multiple, validato per affidabilità e coerenza fattuale, e sigillato con un hash crittografico immutabile. Ispirato alla notarizzazione Web3.
                  </p>
                  <ul className="flex flex-col gap-2.5">
                    {[
                      "Confronto multi-fonte automatico",
                      "Verification Report strutturato per ogni articolo",
                      "Hash crittografico immutabile e verificabile",
                      "Trasparenza totale su ogni notizia pubblicata",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2.5 text-[15px] text-white/70">
                        <span className="text-[#4ade80] font-bold mt-0.5">✓</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="https://proofpressverify.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-black uppercase tracking-[0.1em] text-white no-underline transition-all hover:opacity-80 w-fit"
                    style={{ background: "#dc2626" }}
                  >
                    Scopri ProofPress Verify™ →
                  </a>
                </div>
                <div className="flex-1">
                  <div
                    className="rounded-2xl p-6 flex flex-col gap-3"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📄</span>
                      <div>
                        <p className="text-white font-bold text-sm">Verification Report</p>
                        <p className="text-white/40 text-xs">Generato automaticamente per ogni articolo</p>
                      </div>
                    </div>
                    <div className="border-t border-white/10 pt-3 flex flex-col gap-2">
                      {[
                        { label: "Affidabilità fonti", value: "98%", color: "#4ade80" },
                        { label: "Coerenza fattuale", value: "✓ Verificata", color: "#4ade80" },
                        { label: "Obiettività", value: "Alto", color: "#4ade80" },
                        { label: "Hash crittografico", value: "0x7f3a…c9e2", color: "#60a5fa" },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="flex justify-between items-center text-sm">
                          <span className="text-white/50">{label}</span>
                          <span className="font-bold" style={{ color }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ═══ PIANI ═══ */}
          <section id="piani" className="py-20 md:py-28" style={{ background: "#ffffff" }}>
            <div className="max-w-6xl mx-auto px-5 md:px-8">
              <div className="flex flex-col gap-4 mb-14 text-center">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/40">Piani e prezzi</span>
                <h2 className="text-3xl md:text-5xl font-black text-[#0a0a0a]">Scegli il tuo piano Creator</h2>
                <p className="text-lg text-[#0a0a0a]/55 max-w-2xl mx-auto">
                  Tutti i piani includono certificazione ProofPress Verify™, pubblicazione automatica e supporto. Nessun vincolo — disdici quando vuoi.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6 items-stretch">
                {plans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    {...plan}
                    onCheckout={handleCheckout}
                    loading={loadingPlan === plan.id}
                  />
                ))}
              </div>
              <div className="mt-12 text-center flex flex-col gap-2">
                <p className="text-[13px] text-[#0a0a0a]/40 font-medium">
                  🔒 Pagamento sicuro via Stripe · Nessun addebito nascosto · Disdici in qualsiasi momento
                </p>
                <p className="text-[13px] text-[#0a0a0a]/40">
                  Hai domande?{" "}
                  <a href="mailto:info@proofpress.ai" className="underline hover:text-[#0a0a0a]/70 transition-colors">
                    Scrivici a info@proofpress.ai
                  </a>
                </p>
              </div>
            </div>
          </section>

          <Divider />

          {/* ═══ FAQ ═══ */}
          <section className="py-20 md:py-28" style={{ background: "#f5f5f7" }}>
            <div className="max-w-3xl mx-auto px-5 md:px-8">
              <div className="flex flex-col gap-4 mb-12">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/40">Domande frequenti</span>
                <h2 className="text-3xl font-black text-[#0a0a0a]">Tutto quello che devi sapere</h2>
              </div>
              <div className="flex flex-col gap-6">
                {[
                  { q: "Cos'è un Verticale Tematico?", a: "Un verticale tematico è un canale editoriale dedicato a un singolo settore (es. AI, startup, finanza, salute). Ogni verticale ha le sue fonti, il suo tono e la sua newsletter." },
                  { q: "Come funziona la certificazione ProofPress Verify™?", a: "Ogni articolo viene analizzato su fonti multiple, misurato per affidabilità e coerenza fattuale, e sigillato con un hash crittografico immutabile. Il Verification Report è pubblico e verificabile su proofpressverify.com." },
                  { q: "Posso cambiare piano in qualsiasi momento?", a: "Sì. Puoi passare a un piano superiore o inferiore in qualsiasi momento dalla pagina Abbonamenti. Il cambio è immediato e il credito residuo viene applicato automaticamente." },
                  { q: "Quanto tempo ci vuole per il setup?", a: "Il setup standard richiede 5–7 giorni lavorativi. Includiamo onboarding guidato, configurazione delle fonti e test di produzione." },
                  { q: "Posso disdire quando voglio?", a: "Sì, senza penali. Puoi disdire in qualsiasi momento dalla pagina Abbonamenti o contattando il supporto. L'accesso rimane attivo fino alla fine del periodo pagato." },
                ].map(({ q, a }) => (
                  <div key={q} className="flex flex-col gap-2 p-6 rounded-2xl bg-white">
                    <h3 className="text-[16px] font-black text-[#0a0a0a]">{q}</h3>
                    <p className="text-[15px] text-[#0a0a0a]/60 leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ═══ CTA FINALE ═══ */}
          <section className="py-20 md:py-28" style={{ background: "#0a0a0a" }}>
            <div className="max-w-4xl mx-auto px-5 md:px-8 text-center flex flex-col gap-8">
              <h2 className="text-3xl md:text-5xl font-black leading-tight text-white">
                La tua redazione AI<br />
                <span style={{ color: "#dc2626" }}>è pronta in 7 giorni.</span>
              </h2>
              <p className="text-xl text-white/55 max-w-2xl mx-auto">
                Scegli il piano, configura i tuoi verticali, e inizia a pubblicare contenuti certificati ProofPress Verify™ da domani.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => document.getElementById("piani")?.scrollIntoView({ behavior: "smooth" })}
                  className="px-10 py-4 rounded-xl text-[15px] font-black uppercase tracking-[0.1em] text-white transition-all hover:opacity-90"
                  style={{ background: "#dc2626", boxShadow: "0 4px 24px rgba(220,38,38,0.4)" }}
                >
                  Scegli il tuo piano →
                </button>
                <a
                  href="https://proofpressverify.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-10 py-4 rounded-xl text-[15px] font-black uppercase tracking-[0.1em] text-white no-underline transition-all hover:bg-white/10"
                  style={{ border: "2px solid rgba(255,255,255,0.2)" }}
                >
                  🔐 Scopri Verify™
                </a>
              </div>
              <p className="text-[12px] text-white/30">Setup in 5–7 giorni · Nessun vincolo · Disdici quando vuoi</p>
            </div>
          </section>

          <SharedPageFooter />
        </div>
      </div>
    </>
  );
}
