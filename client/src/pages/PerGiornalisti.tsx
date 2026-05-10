/**
 * ProofPress Creator — Offerta Commerciale
 * 3 piani: Starter €199 | Publisher €449 | Gold €899
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
      id: "creator_starter",
      name: "ProofPress Creator Starter",
      badge: "STARTER",
      tagline: "Valida il tuo primo verticale",
      priceLabel: "€199",
      priceSubLabel: "/mese",
      verticali: 1,
      highlight: false,
      features: [
        "1 verticale tematico",
        "Setup editoriale (fonti + redazione agentica)",
        "Setup sul tuo dominio",
        "Pubblicazione automatica",
        "Dashboard analytics",
        "Supporto onboarding",
        "Fino a 300 articoli/mese",
      ],
    },
    {
      id: "creator_publisher",
      name: "ProofPress Creator Publisher",
      badge: "MOST POPULAR",
      tagline: "Costruisci un giornale AI multi-verticale",
      priceLabel: "€449",
      priceSubLabel: "/mese",
      verticali: 3,
      highlight: true,
      features: [
        "Tutto Starter, più:",
        "3 verticali tematici",
        "Cross-linking automatico tra verticali (SEO topical authority)",
        "SEO Engine avanzato (keyword clustering, schema markup)",
        "Scheduling editoriale (pubblicazione per fascia oraria)",
        "A/B testing su headline e meta description",
        "Dashboard analytics avanzata",
        "Sistema di rotazione banner integrato (monetizzazione diretta)",
        "Fino a 1.200 articoli/mese",
        "Supporto prioritario",
      ],
    },
    {
      id: "creator_gold",
      name: "ProofPress Creator Gold",
      badge: "PREMIUM",
      tagline: "La redazione AI completa",
      priceLabel: "€899",
      priceSubLabel: "/mese",
      verticali: 6,
      highlight: false,
      features: [
        "Tutto Publisher, più:",
        "6 verticali tematici",
        "Newsletter automation (digest per verticale, segmentazione)",
        "Fino a 3.000 articoli/mese",
        "Account manager dedicato",
        "Accesso API ProofPress",
      ],
    },
  ];

  return (
    <>
      <SEOHead
        title="ProofPress Creator — Starter €199 · Publisher €449 · Gold €899/mese"
        description="Lancia la tua testata online con una redazione AI. Starter €199, Publisher €449, Gold €899/mese. Setup in 7 giorni, pubblicazione automatica, certificazione ProofPress Verify™."
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
                    ProofPress Creator:<br />da €199/mese. Fino a 3.000 articoli/mese.
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
