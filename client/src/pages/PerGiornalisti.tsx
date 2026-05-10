/**
 * ProofPress Creator — Offerta Commerciale (Landing Page Selling)
 * 3 piani: Starter €199 | Publisher €449 | Gold €899
 * Design: bianco (#ffffff), nero (#0a0a0a), rosso (#dc2626), grigio (#f5f5f7)
 * Target: freelancer, consulenti, PMI, brand, agenzie, testate online
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

// ─── Utility Components ───────────────────────────────────────────────────────

function SectionLabel({ children, color = "#0a0a0a" }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="inline-block text-[11px] font-black uppercase tracking-[0.22em]"
      style={{ color }}
    >
      {children}
    </span>
  );
}

function CheckItem({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <li className="flex items-start gap-3 text-[15px] leading-snug" style={{ color: dark ? "rgba(255,255,255,0.8)" : "rgba(10,10,10,0.72)" }}>
      <span className="mt-0.5 shrink-0 font-bold text-[16px]" style={{ color: dark ? "#4ade80" : "#16a34a" }}>✓</span>
      <span>{children}</span>
    </li>
  );
}

function Divider() {
  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8">
      <div className="border-t border-[#0a0a0a]/8" />
    </div>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────

interface PlanCardProps {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  price: string;
  articoli: string;
  verticali: number;
  features: string[];
  highlight: boolean;
  onCheckout: (planId: string) => void;
  loading: boolean;
}

function PlanCard({ id, name, badge, tagline, price, articoli, verticali, features, highlight, onCheckout, loading }: PlanCardProps) {
  return (
    <div
      className="relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5"
      style={{
        background: highlight ? "#0a0a0a" : "#ffffff",
        border: highlight ? "2px solid #dc2626" : "2px solid #e5e7eb",
        boxShadow: highlight
          ? "0 24px 64px rgba(220,38,38,0.18), 0 8px 24px rgba(0,0,0,0.14)"
          : "0 4px 24px rgba(0,0,0,0.07)",
      }}
    >
      {highlight && (
        <div className="text-center text-[11px] font-black uppercase tracking-[0.2em] py-2.5" style={{ background: "#dc2626", color: "#fff" }}>
          ★ Il più scelto ★
        </div>
      )}
      <div className="p-7 flex flex-col flex-1 gap-5">
        {/* Badge + nome */}
        <div className="flex flex-col gap-2">
          <span
            className="inline-block text-[10px] font-black uppercase tracking-[0.18em] px-2.5 py-1 rounded-full w-fit"
            style={{
              background: badge === "MOST POPULAR" ? "#dc2626" : badge === "PREMIUM" ? "#d97706" : "#6b7280",
              color: "#fff",
            }}
          >
            {badge}
          </span>
          <h3 className="text-xl font-black leading-tight" style={{ color: highlight ? "#ffffff" : "#0a0a0a" }}>
            {name}
          </h3>
          <p className="text-sm leading-snug" style={{ color: highlight ? "rgba(255,255,255,0.55)" : "rgba(10,10,10,0.5)" }}>
            {tagline}
          </p>
        </div>

        {/* Prezzo */}
        <div className="flex items-end gap-1.5">
          <span className="text-5xl font-black leading-none" style={{ color: highlight ? "#ffffff" : "#0a0a0a" }}>
            {price}
          </span>
          <span className="text-base font-medium mb-1" style={{ color: highlight ? "rgba(255,255,255,0.45)" : "rgba(10,10,10,0.4)" }}>
            /mese
          </span>
        </div>

        {/* Metriche chiave */}
        <div className="grid grid-cols-2 gap-2">
          <div
            className="rounded-xl px-3 py-2.5 text-center"
            style={{ background: highlight ? "rgba(220,38,38,0.14)" : "rgba(10,10,10,0.04)" }}
          >
            <div className="text-xl font-black" style={{ color: highlight ? "#ff6b6b" : "#dc2626" }}>{verticali}</div>
            <div className="text-[11px] font-semibold mt-0.5" style={{ color: highlight ? "rgba(255,255,255,0.5)" : "rgba(10,10,10,0.45)" }}>
              {verticali === 1 ? "Verticale" : "Verticali"}
            </div>
          </div>
          <div
            className="rounded-xl px-3 py-2.5 text-center"
            style={{ background: highlight ? "rgba(220,38,38,0.14)" : "rgba(10,10,10,0.04)" }}
          >
            <div className="text-xl font-black" style={{ color: highlight ? "#ff6b6b" : "#dc2626" }}>{articoli}</div>
            <div className="text-[11px] font-semibold mt-0.5" style={{ color: highlight ? "rgba(255,255,255,0.5)" : "rgba(10,10,10,0.45)" }}>
              art/mese
            </div>
          </div>
        </div>

        {/* Feature list */}
        <ul className="flex flex-col gap-2.5 flex-1">
          {features.map((f, i) => (
            <CheckItem key={i} dark={highlight}>{f}</CheckItem>
          ))}
        </ul>

        {/* Verify badge */}
        <a
          href="https://proofpressverify.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[12px] font-semibold no-underline hover:opacity-80 transition-opacity"
          style={{ color: highlight ? "rgba(255,255,255,0.45)" : "rgba(10,10,10,0.38)" }}
        >
          <span>🔐</span>
          <span>Certificato ProofPress Verify™</span>
        </a>

        {/* CTA */}
        <button
          onClick={() => onCheckout(id)}
          disabled={loading}
          className="w-full py-4 rounded-xl text-[15px] font-black uppercase tracking-[0.1em] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90"
          style={{
            background: highlight ? "#dc2626" : "#0a0a0a",
            color: "#ffffff",
            boxShadow: highlight ? "0 4px 20px rgba(220,38,38,0.4)" : "none",
          }}
        >
          {loading ? "Apertura checkout…" : "Inizia ora →"}
        </button>
        <p className="text-center text-[11px]" style={{ color: highlight ? "rgba(255,255,255,0.3)" : "rgba(10,10,10,0.3)" }}>
          Nessun vincolo · Disdici quando vuoi
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

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
      // onError gestisce il toast
    } finally {
      setLoadingPlan(null);
    }
  };

  const plans: PlanCardProps[] = [
    {
      id: "creator_starter",
      name: "Starter",
      badge: "STARTER",
      tagline: "Lancia il tuo primo verticale editoriale",
      price: "€199",
      articoli: "300",
      verticali: 1,
      highlight: false,
      onCheckout: handleCheckout,
      loading: loadingPlan === "creator_starter",
      features: [
        "1 verticale tematico a scelta",
        "Setup editoriale (fonti + redazione agentica)",
        "Pubblicazione automatica sul tuo dominio",
        "Dashboard analytics base",
        "Certificazione ProofPress Verify™ su ogni articolo",
        "Supporto onboarding dedicato",
        "Fino a 300 articoli/mese",
      ],
    },
    {
      id: "creator_publisher",
      name: "Publisher",
      badge: "MOST POPULAR",
      tagline: "Costruisci una testata AI multi-verticale",
      price: "€449",
      articoli: "1.200",
      verticali: 3,
      highlight: true,
      onCheckout: handleCheckout,
      loading: loadingPlan === "creator_publisher",
      features: [
        "Tutto Starter, più:",
        "3 verticali tematici",
        "SEO Engine avanzato (keyword clustering, schema markup)",
        "Cross-linking automatico tra verticali (topical authority)",
        "Scheduling editoriale per fascia oraria",
        "A/B testing su headline e meta description",
        "Sistema di rotazione banner (monetizzazione diretta)",
        "Dashboard analytics avanzata",
        "Fino a 1.200 articoli/mese",
        "Supporto prioritario",
      ],
    },
    {
      id: "creator_gold",
      name: "Gold",
      badge: "PREMIUM",
      tagline: "La redazione AI completa per editori ambiziosi",
      price: "€899",
      articoli: "3.000",
      verticali: 6,
      highlight: false,
      onCheckout: handleCheckout,
      loading: loadingPlan === "creator_gold",
      features: [
        "Tutto Publisher, più:",
        "6 verticali tematici",
        "Newsletter automation (digest per verticale, segmentazione)",
        "Accesso API ProofPress per integrazioni custom",
        "Account manager dedicato",
        "Fino a 3.000 articoli/mese",
        "SLA prioritario e onboarding accelerato",
      ],
    },
  ];

  return (
    <>
      <SEOHead
        title="ProofPress Creator — Crea il tuo Giornale AI | Starter €199 · Publisher €449 · Gold €899"
        description="Creiamo un giornale AI per te. Per freelancer, consulenti, brand, agenzie e testate online. Redazione agentica, pubblicazione automatica, certificazione ProofPress Verify™. Setup in 7 giorni."
        canonical="https://proofpress.ai/offertacommerciale"
        ogSiteName="ProofPress"
      />
      <div className="flex min-h-screen" style={{ background: "#ffffff", color: "#0a0a0a", fontFamily: FONT }}>
        <LeftSidebar />
        <div className="flex-1 min-w-0">
          <SharedPageHeader />

          {/* ═══════════════════════════════════════════════════════
              HERO — "Creiamo un giornale AI per te"
          ═══════════════════════════════════════════════════════ */}
          <section className="pt-20 pb-16 md:pt-28 md:pb-24" style={{ background: "#ffffff" }}>
            <div className="max-w-6xl mx-auto px-5 md:px-8">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                {/* Left: copy */}
                <div className="flex flex-col gap-7">
                  <div className="flex flex-col gap-3">
                    <SectionLabel color="#dc2626">ProofPress Creator</SectionLabel>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.06] tracking-tight text-[#0a0a0a]">
                      Creiamo un<br />
                      <span style={{ color: "#dc2626" }}>Giornale AI</span><br />
                      per te.
                    </h1>
                  </div>
                  <p className="text-xl font-semibold leading-relaxed text-[#0a0a0a]/75 max-w-lg">
                    Una redazione agentica completa che produce, verifica e pubblica contenuti ogni giorno — sotto la tua direzione editoriale.
                  </p>
                  <p className="text-base leading-relaxed text-[#0a0a0a]/55 max-w-lg">
                    Tu scegli i verticali tematici e il tono. Noi configuriamo le fonti, addestriamo la redazione AI e pubblichiamo automaticamente sul tuo dominio. Ogni articolo è certificato{" "}
                    <a
                      href="https://proofpressverify.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold underline decoration-[#dc2626]/40 hover:decoration-[#dc2626] transition-all"
                      style={{ color: "#dc2626" }}
                    >
                      ProofPress Verify™
                    </a>
                    {" "}— hash crittografico immutabile, tracciabilità garantita.
                  </p>
                  {/* KPI bar */}
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    {[
                      { n: "7", unit: "giorni", label: "per il setup completo" },
                      { n: "3.000", unit: "art/mese", label: "piano Gold" },
                      { n: "95%", unit: "risparmio", label: "vs redazione tradizionale" },
                    ].map(({ n, unit, label }) => (
                      <div key={n} className="flex flex-col gap-0.5">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-[#0a0a0a]">{n}</span>
                          <span className="text-[12px] font-bold text-[#dc2626]">{unit}</span>
                        </div>
                        <span className="text-[12px] text-[#0a0a0a]/45 leading-snug">{label}</span>
                      </div>
                    ))}
                  </div>
                  {/* CTA buttons */}
                  <div className="flex flex-wrap gap-3 pt-1">
                    <button
                      onClick={() => document.getElementById("piani")?.scrollIntoView({ behavior: "smooth" })}
                      className="px-8 py-3.5 rounded-xl text-[14px] font-black uppercase tracking-[0.1em] text-white transition-all hover:opacity-90"
                      style={{ background: "#dc2626", boxShadow: "0 4px 20px rgba(220,38,38,0.3)" }}
                    >
                      Scegli il piano →
                    </button>
                    <a
                      href="https://proofpressverify.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-3.5 rounded-xl text-[14px] font-black uppercase tracking-[0.1em] no-underline transition-all hover:bg-[#0a0a0a]/5"
                      style={{ border: "2px solid rgba(10,10,10,0.14)", color: "#0a0a0a" }}
                    >
                      🔐 Scopri Verify™
                    </a>
                  </div>
                </div>

                {/* Right: visual card stack */}
                <div className="hidden md:flex flex-col gap-4">
                  {/* Mock editorial card */}
                  <div className="rounded-2xl overflow-hidden border border-[#e5e7eb]" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
                    <div className="px-5 py-3 flex items-center justify-between" style={{ background: "#0a0a0a" }}>
                      <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white/60">La tua testata · AI-powered</span>
                      <span className="text-[11px] font-bold text-[#4ade80]">● LIVE</span>
                    </div>
                    <div className="p-5 flex flex-col gap-4" style={{ background: "#f9f9f9" }}>
                      <div className="flex gap-3 items-start">
                        <div className="w-16 h-16 rounded-lg shrink-0" style={{ background: "#e5e7eb" }} />
                        <div className="flex flex-col gap-1.5 flex-1">
                          <div className="h-2.5 rounded-full w-3/4" style={{ background: "#0a0a0a/10", backgroundColor: "rgba(10,10,10,0.1)" }} />
                          <div className="h-2 rounded-full w-full" style={{ background: "rgba(10,10,10,0.06)" }} />
                          <div className="h-2 rounded-full w-5/6" style={{ background: "rgba(10,10,10,0.06)" }} />
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "#dc2626" }}>AI · TECH</span>
                            <span className="text-[10px] text-[#0a0a0a]/40">2 min fa</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 items-start">
                        <div className="w-16 h-16 rounded-lg shrink-0" style={{ background: "#e5e7eb" }} />
                        <div className="flex flex-col gap-1.5 flex-1">
                          <div className="h-2.5 rounded-full w-2/3" style={{ background: "rgba(10,10,10,0.1)" }} />
                          <div className="h-2 rounded-full w-full" style={{ background: "rgba(10,10,10,0.06)" }} />
                          <div className="h-2 rounded-full w-4/5" style={{ background: "rgba(10,10,10,0.06)" }} />
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "#2563eb" }}>STARTUP</span>
                            <span className="text-[10px] text-[#0a0a0a]/40">15 min fa</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-[#e5e7eb]">
                        <span className="text-[11px] text-[#0a0a0a]/40">12 articoli pubblicati oggi</span>
                        <span className="text-[11px] font-bold text-[#16a34a]">🔐 Tutti certificati</span>
                      </div>
                    </div>
                  </div>
                  {/* Stats mini card */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { v: "4.200", l: "Lettori unici" },
                      { v: "98%", l: "Uptime" },
                      { v: "12", l: "Art. oggi" },
                    ].map(({ v, l }) => (
                      <div key={l} className="rounded-xl p-3 text-center border border-[#e5e7eb]">
                        <div className="text-xl font-black text-[#0a0a0a]">{v}</div>
                        <div className="text-[11px] text-[#0a0a0a]/45 mt-0.5">{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              TARGET — A chi è rivolto
          ═══════════════════════════════════════════════════════ */}
          <section className="py-20 md:py-28" style={{ background: "#f5f5f7" }}>
            <div className="max-w-6xl mx-auto px-5 md:px-8">
              <div className="flex flex-col gap-4 mb-14">
                <SectionLabel>A chi è rivolto</SectionLabel>
                <h2 className="text-3xl md:text-4xl font-black text-[#0a0a0a] max-w-2xl">
                  Dal freelancer alla testata online: ProofPress Creator scala con te.
                </h2>
                <p className="text-lg text-[#0a0a0a]/55 max-w-2xl leading-relaxed">
                  Non è uno strumento per giornalisti. È un'infrastruttura editoriale AI per chiunque voglia costruire un'autorità di contenuto nel proprio settore.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  {
                    icon: "✍️",
                    title: "Freelancer & Consulenti",
                    desc: "Crea una testata verticale sul tuo settore di competenza. Diventa la fonte di riferimento per i tuoi clienti e prospect. Genera lead qualificati con contenuti certificati.",
                  },
                  {
                    icon: "🏢",
                    title: "PMI & Brand",
                    desc: "Trasforma la tua expertise aziendale in contenuto editoriale ad alto valore. Costruisci autorità SEO, alimenta il funnel commerciale, riduci i costi di content marketing del 90%.",
                  },
                  {
                    icon: "📣",
                    title: "Agenzie di Comunicazione",
                    desc: "Offri ai tuoi clienti una testata AI white-label. Scala la produzione di contenuti senza aumentare il team. Margini più alti, delivery più veloce.",
                  },
                  {
                    icon: "📰",
                    title: "Testate Online",
                    desc: "Aggiungi verticali tematici senza assumere nuovi giornalisti. Aumenta la copertura editoriale, migliora il ranking SEO, mantieni la certificazione su ogni articolo.",
                  },
                  {
                    icon: "🎓",
                    title: "Associazioni & Istituzioni",
                    desc: "Pubblica newsletter e magazine digitali per i tuoi associati. Contenuti aggiornati quotidianamente, zero overhead redazionale, massima credibilità certificata.",
                  },
                  {
                    icon: "🚀",
                    title: "Startup & Scale-up",
                    desc: "Costruisci la tua presenza editoriale fin dal giorno uno. Thought leadership, SEO organico, investor relations content — tutto automatizzato e verificato.",
                  },
                ].map(({ icon, title, desc }) => (
                  <div
                    key={title}
                    className="flex flex-col gap-3 p-6 rounded-2xl bg-white border border-[#e5e7eb] hover:border-[#dc2626]/30 transition-colors"
                    style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
                  >
                    <span className="text-3xl">{icon}</span>
                    <h3 className="text-[17px] font-black text-[#0a0a0a]">{title}</h3>
                    <p className="text-[14px] text-[#0a0a0a]/58 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              PROBLEMA / SOLUZIONE
          ═══════════════════════════════════════════════════════ */}
          <section className="py-20 md:py-28" style={{ background: "#ffffff" }}>
            <div className="max-w-6xl mx-auto px-5 md:px-8">
              <div className="grid md:grid-cols-2 gap-12 items-start">
                {/* Problema */}
                <div className="flex flex-col gap-6 p-8 rounded-2xl" style={{ background: "#f5f5f7", border: "1px solid #e5e7eb" }}>
                  <SectionLabel color="#6b7280">Il problema</SectionLabel>
                  <h2 className="text-2xl md:text-3xl font-black leading-tight text-[#0a0a0a]">
                    Una redazione tradizionale costa €150–250k/anno.
                  </h2>
                  <p className="text-base text-[#0a0a0a]/58 leading-relaxed">
                    Giornalisti, editor, fact-checker, social media manager, strumenti editoriali, hosting. Anche una piccola testata con 2–3 persone supera facilmente i €100k annui. Per un freelance, una PMI o un editore indipendente è insostenibile.
                  </p>
                  <ul className="flex flex-col gap-2.5">
                    {[
                      "Costi fissi elevati anche in assenza di traffico",
                      "Difficoltà a scalare la produzione in tempi brevi",
                      "Nessuna certificazione automatica dell'affidabilità",
                      "SEO lento senza volume e frequenza di pubblicazione",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2.5 text-[14px] text-[#0a0a0a]/60 leading-snug">
                        <span className="mt-0.5 shrink-0 text-[#dc2626] font-bold">✕</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Soluzione */}
                <div className="flex flex-col gap-6 p-8 rounded-2xl" style={{ background: "#0a0a0a", border: "2px solid #dc2626" }}>
                  <SectionLabel color="#dc2626">La soluzione</SectionLabel>
                  <h2 className="text-2xl md:text-3xl font-black leading-tight text-white">
                    ProofPress Creator: da €199/mese. Fino a 3.000 articoli/mese.
                  </h2>
                  <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
                    Una redazione AI completa che produce, verifica e pubblica per te. Stessa qualità editoriale, costi ridotti del 95%, certificazione crittografica su ogni articolo.
                  </p>
                  <ul className="flex flex-col gap-2.5">
                    {[
                      "Risparmio fino a €240k/anno vs redazione tradizionale",
                      "Setup completo in 5–7 giorni lavorativi",
                      "Pubblicazione automatica sul tuo dominio",
                      "Certificazione ProofPress Verify™ su ogni articolo",
                      "Nessun vincolo contrattuale a lungo termine",
                    ].map((t) => (
                      <CheckItem key={t} dark>{t}</CheckItem>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              COME FUNZIONA — 4 step
          ═══════════════════════════════════════════════════════ */}
          <section className="py-20 md:py-28" style={{ background: "#f5f5f7" }}>
            <div className="max-w-6xl mx-auto px-5 md:px-8">
              <div className="flex flex-col gap-4 mb-14">
                <SectionLabel>Come funziona</SectionLabel>
                <h2 className="text-3xl md:text-4xl font-black text-[#0a0a0a]">
                  Dal contratto al primo articolo: 7 giorni.
                </h2>
                <p className="text-lg text-[#0a0a0a]/55 max-w-2xl leading-relaxed">
                  Il processo è strutturato, veloce e completamente gestito dal nostro team. Tu decidi la direzione editoriale, noi costruiamo e facciamo girare la macchina.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    n: "01",
                    title: "Onboarding editoriale",
                    desc: "Scegli i verticali tematici, le fonti da monitorare, il tono e la brand voice. Il nostro team configura l'identità editoriale della tua testata.",
                    time: "Giorno 1–2",
                  },
                  {
                    n: "02",
                    title: "Setup tecnico",
                    desc: "Configuriamo la piattaforma sul tuo dominio, integriamo il CMS, impostiamo lo scheduling e colleghiamo le fonti RSS, API e social.",
                    time: "Giorno 2–4",
                  },
                  {
                    n: "03",
                    title: "Redazione AI attiva",
                    desc: "La redazione agentica inizia a produrre articoli. Ogni contenuto viene verificato con ProofPress Verify™ prima della pubblicazione.",
                    time: "Giorno 5–6",
                  },
                  {
                    n: "04",
                    title: "Go live & analytics",
                    desc: "La tua testata è live. Accedi alla dashboard per monitorare traffico, engagement, performance SEO e stato delle certificazioni.",
                    time: "Giorno 7",
                  },
                ].map(({ n, title, desc, time }) => (
                  <div key={n} className="flex flex-col gap-4 p-6 rounded-2xl bg-white border border-[#e5e7eb]" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                    <div className="flex items-start justify-between">
                      <span className="text-5xl font-black" style={{ color: "rgba(10,10,10,0.08)" }}>{n}</span>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(220,38,38,0.08)", color: "#dc2626" }}>{time}</span>
                    </div>
                    <h3 className="text-[17px] font-black text-[#0a0a0a] leading-snug">{title}</h3>
                    <p className="text-[14px] text-[#0a0a0a]/55 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              PIANI — 3 tier
          ═══════════════════════════════════════════════════════ */}
          <section id="piani" className="py-20 md:py-28" style={{ background: "#ffffff" }}>
            <div className="max-w-6xl mx-auto px-5 md:px-8">
              <div className="flex flex-col gap-4 mb-14 text-center">
                <SectionLabel color="#dc2626">Piani e prezzi</SectionLabel>
                <h2 className="text-3xl md:text-5xl font-black text-[#0a0a0a]">
                  Scegli il tuo piano Creator
                </h2>
                <p className="text-lg text-[#0a0a0a]/55 max-w-2xl mx-auto leading-relaxed">
                  Tutti i piani includono setup editoriale, pubblicazione automatica, certificazione ProofPress Verify™ e dashboard analytics. Nessun costo nascosto.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6 items-start">
                {plans.map((plan) => (
                  <PlanCard key={plan.id} {...plan} />
                ))}
              </div>
              <p className="text-center text-[13px] text-[#0a0a0a]/40 mt-8">
                Hai esigenze particolari? Scrivici a{" "}
                <a href="mailto:creator@proofpress.ai" className="underline hover:text-[#dc2626] transition-colors" style={{ color: "#0a0a0a" }}>
                  creator@proofpress.ai
                </a>{" "}
                per un piano custom.
              </p>
            </div>
          </section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              CONFRONTO — Tabella comparativa
          ═══════════════════════════════════════════════════════ */}
          <section className="py-20 md:py-28" style={{ background: "#f5f5f7" }}>
            <div className="max-w-6xl mx-auto px-5 md:px-8">
              <div className="flex flex-col gap-4 mb-12">
                <SectionLabel>Confronto piani</SectionLabel>
                <h2 className="text-2xl md:text-3xl font-black text-[#0a0a0a]">Cosa include ogni piano</h2>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-[#e5e7eb]" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                <table className="w-full text-[14px]">
                  <thead>
                    <tr style={{ background: "#0a0a0a" }}>
                      <th className="text-left px-5 py-4 font-black text-white/70 text-[12px] uppercase tracking-[0.12em]">Funzionalità</th>
                      <th className="text-center px-5 py-4 font-black text-white text-[13px]">Starter<br /><span className="text-[#dc2626] text-[15px]">€199</span></th>
                      <th className="text-center px-5 py-4 font-black text-white text-[13px]" style={{ background: "#dc2626" }}>Publisher<br /><span className="text-white text-[15px]">€449</span></th>
                      <th className="text-center px-5 py-4 font-black text-white text-[13px]">Gold<br /><span className="text-[#d97706] text-[15px]">€899</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: "Verticali tematici", s: "1", p: "3", g: "6" },
                      { feature: "Articoli/mese", s: "300", p: "1.200", g: "3.000" },
                      { feature: "Setup editoriale", s: "✓", p: "✓", g: "✓" },
                      { feature: "Pubblicazione automatica", s: "✓", p: "✓", g: "✓" },
                      { feature: "Certificazione Verify™", s: "✓", p: "✓", g: "✓" },
                      { feature: "Dashboard analytics", s: "Base", p: "Avanzata", g: "Avanzata" },
                      { feature: "SEO Engine avanzato", s: "—", p: "✓", g: "✓" },
                      { feature: "A/B testing headline", s: "—", p: "✓", g: "✓" },
                      { feature: "Rotazione banner", s: "—", p: "✓", g: "✓" },
                      { feature: "Newsletter automation", s: "—", p: "—", g: "✓" },
                      { feature: "Accesso API ProofPress", s: "—", p: "—", g: "✓" },
                      { feature: "Account manager dedicato", s: "—", p: "—", g: "✓" },
                      { feature: "Supporto", s: "Onboarding", p: "Prioritario", g: "SLA dedicato" },
                    ].map(({ feature, s, p, g }, i) => (
                      <tr key={feature} style={{ background: i % 2 === 0 ? "#ffffff" : "#f9f9f9" }}>
                        <td className="px-5 py-3.5 font-semibold text-[#0a0a0a]/75">{feature}</td>
                        <td className="px-5 py-3.5 text-center text-[#0a0a0a]/60">{s}</td>
                        <td className="px-5 py-3.5 text-center font-bold text-[#dc2626]" style={{ background: i % 2 === 0 ? "rgba(220,38,38,0.04)" : "rgba(220,38,38,0.07)" }}>{p}</td>
                        <td className="px-5 py-3.5 text-center text-[#0a0a0a]/60">{g}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              PROOFPRESS VERIFY — Add-on
          ═══════════════════════════════════════════════════════ */}
          <section className="py-20 md:py-28" style={{ background: "#ffffff" }}>
            <div className="max-w-6xl mx-auto px-5 md:px-8">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <SectionLabel color="#dc2626">Incluso in tutti i piani</SectionLabel>
                    <h2 className="text-3xl md:text-4xl font-black text-[#0a0a0a] leading-tight">
                      🔐 ProofPress Verify™<br />
                      <span className="text-[#0a0a0a]/35">La certificazione che<br />nessun concorrente ha.</span>
                    </h2>
                  </div>
                  <p className="text-lg text-[#0a0a0a]/60 leading-relaxed">
                    Ogni articolo pubblicato con ProofPress Creator viene automaticamente analizzato e certificato con un hash crittografico immutabile. Il lettore può verificare l'autenticità di ogni notizia in tempo reale.
                  </p>
                  <ul className="flex flex-col gap-3">
                    {[
                      "Analisi multi-fonte automatica per ogni articolo",
                      "Trust Score calcolato su affidabilità, coerenza e obiettività",
                      "Hash crittografico immutabile (ispirato al Web3)",
                      "Verification Report pubblico e verificabile",
                      "Badge di certificazione visibile ai lettori",
                    ].map((t) => (
                      <CheckItem key={t}>{t}</CheckItem>
                    ))}
                  </ul>
                  <a
                    href="https://proofpressverify.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-[14px] font-black uppercase tracking-[0.1em] no-underline transition-all hover:opacity-90 w-fit"
                    style={{ background: "#0a0a0a", color: "#ffffff" }}
                  >
                    🔐 Visita proofpressverify.com →
                  </a>
                </div>
                {/* Verify visual */}
                <div className="flex flex-col gap-4">
                  <div className="rounded-2xl overflow-hidden border border-[#e5e7eb]" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
                    <div className="px-5 py-3 flex items-center gap-3" style={{ background: "#0a0a0a" }}>
                      <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white/60">ProofPress Verify™</span>
                      <span className="ml-auto text-[11px] font-bold text-[#4ade80]">● Certificato</span>
                    </div>
                    <div className="p-5 flex flex-col gap-4" style={{ background: "#f9f9f9" }}>
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-[#0a0a0a]/40 uppercase tracking-[0.12em]">Articolo verificato</span>
                        <p className="text-[15px] font-bold text-[#0a0a0a] leading-snug">
                          "L'AI generativa ridisegna il mercato del lavoro: +2,3M posti entro 2026"
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: "Trust Score", value: "94/100", color: "#16a34a" },
                          { label: "Fonti", value: "7 verificate", color: "#2563eb" },
                          { label: "Stato", value: "Certificato", color: "#16a34a" },
                        ].map(({ label, value, color }) => (
                          <div key={label} className="rounded-lg p-2.5 text-center" style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}>
                            <div className="text-[13px] font-black" style={{ color }}>{value}</div>
                            <div className="text-[10px] text-[#0a0a0a]/40 mt-0.5">{label}</div>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-lg p-3" style={{ background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.2)" }}>
                        <div className="text-[10px] font-bold text-[#0a0a0a]/40 uppercase tracking-[0.1em] mb-1">Hash crittografico</div>
                        <code className="text-[11px] font-mono text-[#0a0a0a]/60 break-all">
                          a3f8c2d1e9b4071f5a6d3c8e2f1b9a4d7c5e8f2a1b3d6e9c4f7a2b5d8e1f4a7b
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              SOCIAL PROOF — Numeri e testimonianze
          ═══════════════════════════════════════════════════════ */}
          <section className="py-20 md:py-28" style={{ background: "#f5f5f7" }}>
            <div className="max-w-6xl mx-auto px-5 md:px-8">
              <div className="flex flex-col gap-4 mb-14">
                <SectionLabel>Risultati reali</SectionLabel>
                <h2 className="text-3xl md:text-4xl font-black text-[#0a0a0a]">
                  Numeri che parlano chiaro.
                </h2>
              </div>
              {/* KPI grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-14">
                {[
                  { n: "4.000+", label: "Fonti monitorate in tempo reale" },
                  { n: "10–15", label: "Articoli/giorno per verticale" },
                  { n: "7", label: "Giorni per il setup completo" },
                  { n: "95%", label: "Riduzione costi vs redazione tradizionale" },
                ].map(({ n, label }) => (
                  <div key={n} className="flex flex-col gap-2 p-6 rounded-2xl bg-white border border-[#e5e7eb]" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                    <span className="text-4xl font-black text-[#0a0a0a]">{n}</span>
                    <span className="text-[13px] text-[#0a0a0a]/55 leading-snug">{label}</span>
                  </div>
                ))}
              </div>
              {/* Testimonials */}
              <div className="grid md:grid-cols-3 gap-5">
                {[
                  {
                    quote: "In 7 giorni avevo una testata verticale sull'AI completamente operativa. Il traffico organico è cresciuto del 340% in 3 mesi.",
                    name: "Marco T.",
                    role: "Consulente AI & Digital Transformation",
                    plan: "Publisher",
                  },
                  {
                    quote: "Abbiamo sostituito un team di 3 content editor con ProofPress Creator Gold. Produzione triplicata, costi ridotti dell'80%. I clienti non si sono accorti della differenza.",
                    name: "Sara B.",
                    role: "CEO, Agenzia di Comunicazione",
                    plan: "Gold",
                  },
                  {
                    quote: "La certificazione ProofPress Verify™ ci ha dato credibilità immediata. I lettori vedono il badge e si fidano. Per una testata online emergente è un vantaggio competitivo enorme.",
                    name: "Luca M.",
                    role: "Founder, Testata Online Fintech",
                    plan: "Publisher",
                  },
                ].map(({ quote, name, role, plan }) => (
                  <div
                    key={name}
                    className="flex flex-col gap-5 p-6 rounded-2xl bg-white border border-[#e5e7eb]"
                    style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
                  >
                    <p className="text-[15px] text-[#0a0a0a]/70 leading-relaxed italic">"{quote}"</p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#e5e7eb]">
                      <div>
                        <div className="text-[14px] font-black text-[#0a0a0a]">{name}</div>
                        <div className="text-[12px] text-[#0a0a0a]/45">{role}</div>
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(220,38,38,0.08)", color: "#dc2626" }}>
                        Piano {plan}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              FAQ
          ═══════════════════════════════════════════════════════ */}
          <section className="py-20 md:py-28" style={{ background: "#ffffff" }}>
            <div className="max-w-4xl mx-auto px-5 md:px-8">
              <div className="flex flex-col gap-4 mb-12">
                <SectionLabel>Domande frequenti</SectionLabel>
                <h2 className="text-3xl md:text-4xl font-black text-[#0a0a0a]">Tutto quello che devi sapere.</h2>
              </div>
              <div className="flex flex-col gap-0 divide-y divide-[#e5e7eb]">
                {[
                  {
                    q: "Posso usare il mio dominio?",
                    a: "Sì, tutti i piani includono il setup sul tuo dominio esistente. Il team tecnico gestisce la configurazione DNS e l'integrazione con il tuo CMS.",
                  },
                  {
                    q: "Gli articoli sono scritti da AI o da giornalisti?",
                    a: "La redazione è agentica: l'AI produce i contenuti partendo da fonti verificate, seguendo le linee editoriali che hai definito in fase di onboarding. Tu mantieni il controllo editoriale e puoi modificare o bloccare qualsiasi articolo prima della pubblicazione.",
                  },
                  {
                    q: "Cosa succede se voglio cambiare piano?",
                    a: "Puoi fare upgrade o downgrade in qualsiasi momento dalla tua area abbonamenti. Il cambio è effettivo dal ciclo di fatturazione successivo.",
                  },
                  {
                    q: "Come funziona la certificazione ProofPress Verify™?",
                    a: "Ogni articolo viene analizzato da un sistema AI multi-fonte che valuta affidabilità, coerenza fattuale e obiettività. Il risultato viene sigillato con un hash crittografico immutabile e reso pubblicamente verificabile su proofpressverify.com.",
                  },
                  {
                    q: "Posso disdire quando voglio?",
                    a: "Sì. Non ci sono vincoli contrattuali a lungo termine. Puoi disdire in qualsiasi momento dalla tua area abbonamenti. L'accesso rimane attivo fino alla fine del periodo già pagato.",
                  },
                  {
                    q: "Offrite piani custom per grandi editori?",
                    a: "Sì. Per testate con esigenze specifiche (più verticali, volumi superiori, integrazioni custom, white-label) contattaci a creator@proofpress.ai per un preventivo personalizzato.",
                  },
                ].map(({ q, a }) => (
                  <FaqItem key={q} question={q} answer={a} />
                ))}
              </div>
            </div>
          </section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              CTA FINALE
          ═══════════════════════════════════════════════════════ */}
          <section className="py-24 md:py-32" style={{ background: "#0a0a0a" }}>
            <div className="max-w-4xl mx-auto px-5 md:px-8 text-center flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <SectionLabel color="rgba(255,255,255,0.35)">Inizia oggi</SectionLabel>
                <h2 className="text-3xl md:text-5xl font-black leading-tight text-white">
                  La tua redazione AI<br />
                  <span style={{ color: "#dc2626" }}>è pronta in 7 giorni.</span>
                </h2>
                <p className="text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Scegli il piano, configura i tuoi verticali, e inizia a pubblicare contenuti certificati ProofPress Verify™ da domani. Nessun vincolo, disdici quando vuoi.
                </p>
              </div>
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
                  style={{ border: "2px solid rgba(255,255,255,0.18)" }}
                >
                  🔐 Scopri Verify™
                </a>
              </div>
              <div className="flex flex-wrap gap-6 justify-center pt-2">
                {[
                  "Setup in 5–7 giorni",
                  "Nessun vincolo contrattuale",
                  "Disdici quando vuoi",
                  "Certificazione inclusa",
                ].map((t) => (
                  <span key={t} className="text-[13px] font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>
                    ✓ {t}
                  </span>
                ))}
              </div>
              <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                Hai domande?{" "}
                <a href="mailto:creator@proofpress.ai" className="underline hover:text-white/50 transition-colors" style={{ color: "rgba(255,255,255,0.35)" }}>
                  creator@proofpress.ai
                </a>
              </p>
            </div>
          </section>

          <SharedPageFooter />
        </div>
      </div>
    </>
  );
}

// ─── FAQ Accordion Item ───────────────────────────────────────────────────────

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="py-5">
      <button
        className="w-full flex items-center justify-between gap-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="text-[16px] font-black text-[#0a0a0a] leading-snug">{question}</span>
        <span
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[14px] font-black transition-transform duration-200"
          style={{
            background: open ? "#dc2626" : "rgba(10,10,10,0.07)",
            color: open ? "#fff" : "#0a0a0a",
            transform: open ? "rotate(45deg)" : "none",
          }}
        >
          +
        </span>
      </button>
      {open && (
        <p className="mt-4 text-[15px] text-[#0a0a0a]/60 leading-relaxed max-w-3xl">
          {answer}
        </p>
      )}
    </div>
  );
}
