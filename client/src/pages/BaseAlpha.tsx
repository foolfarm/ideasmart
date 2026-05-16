/**
 * BASE ALPHA + TOP TECH OBSERVATORY
 * Redesign: sfondo bianco/grigio chiaro, alta leggibilità, CTA forti
 */
import { useState } from "react";
import { Link } from "wouter";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import SEOHead from "@/components/SEOHead";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

const SECTORS = [
  { icon: "🤖", label: "Intelligenza Artificiale & LLM", desc: "Modelli fondazionali, infrastruttura AI, adozione enterprise, EU AI Act, agentic AI" },
  { icon: "💼", label: "Venture Capital & Private Equity", desc: "Deal flow, round, trend LP, emerging markets, co-investment, fund strategy" },
  { icon: "🚀", label: "Startup & Ecosistemi", desc: "Early stage, scale-up, exit, M&A, ecosistemi EU/US/APAC, acceleratori" },
  { icon: "⚙️", label: "Tecnologia & Infrastruttura", desc: "Cloud, edge computing, semiconduttori, supply chain tech, piattaforme enterprise" },
  { icon: "🔐", label: "Cybersecurity", desc: "Threat intelligence, zero-trust, AI security, compliance, data protection, SOC" },
  { icon: "⚛️", label: "Quantum Computing", desc: "Hardware quantistico, algoritmi, crittografia post-quantum, applicazioni industriali" },
  { icon: "🏦", label: "Fintech & Digital Finance", desc: "Open banking, DeFi istituzionale, CBDC, embedded finance, payment tech" },
  { icon: "🧬", label: "HealthTech & BioTech", desc: "Digital health, genomica, AI diagnostica, MedTech, longevity, drug discovery" },
  { icon: "⚡", label: "Energy & CleanTech", desc: "Transizione energetica, storage, hydrogen, carbon markets, smart grid" },
  { icon: "🌾", label: "AgriTech & AgriFood", desc: "Precision farming, food tech, supply chain agro, biotech alimentare, sostenibilità" },
  { icon: "🏭", label: "Industry & Manufacturing", desc: "Industria 4.0, automazione, robotica avanzata, digital twin, smart factory" },
  { icon: "🚗", label: "Automotive & Mobility", desc: "EV, guida autonoma, connected car, mobilità urbana, infrastruttura di ricarica" },
  { icon: "📰", label: "Media & Informazione", desc: "Giornalismo agentico, AI content, advertising tech, fact-checking, creator economy" },
  { icon: "🏛️", label: "Policy & Regolamentazione", desc: "AI Act, GDPR, Digital Markets Act, compliance, governance tecnologica" },
  { icon: "🛰️", label: "Space Economy", desc: "New Space, satellite tech, launch market, dual-use, osservazione terrestre" },
  { icon: "🏙️", label: "Smart Cities & PropTech", desc: "Città intelligenti, real estate tech, infrastrutture digitali, urban mobility" },
  { icon: "🎓", label: "EdTech & Future of Work", desc: "Formazione AI-native, reskilling, piattaforme learning, workforce transformation" },
  { icon: "🛡️", label: "GovTech & Defence Tech", desc: "Digitalizzazione PA, identità digitale, dual-use, sicurezza nazionale, procurement" },
];

const PLANS = [
  {
    id: "weekly-brief",
    badge: "ENTRY",
    label: "Weekly Brief",
    freq: "Settimanale · 1 settore",
    desc: "Report settimanale su 1 settore verticale a scelta. Segnali pre-pubblici, trend e key takeaway certificati PPV.",
    features: [
      "1 settore verticale a scelta",
      "Report settimanale certificato PPV",
      "Top 10 segnali pre-pubblici",
      "Trend analysis + Key takeaway",
      "Analisi pre-pubblica 4.000+ fonti",
      "Archivio 3 mesi",
    ],
    highlight: false,
    price: "€199/mese",
    priceId: "price_1TUMRU8CvMSliYUFLHE18MpI",
    interval: "mensile",
  },
  {
    id: "weekly-intelligence",
    badge: "MOST POPULAR",
    label: "Weekly Intelligence",
    freq: "Settimanale · 2 settori",
    desc: "Report settimanale su 2 settori verticali a scelta. Analisi comparativa, mappa attori chiave e segnali pre-pubblici avanzati.",
    features: [
      "2 settori verticali a scelta",
      "Report settimanale certificato PPV",
      "Top 10 segnali pre-pubblici per settore",
      "Trend analysis + Key takeaway",
      "Analisi pre-pubblica 4.000+ fonti",
      "Mappa attori & deal flow",
      "Archivio 6 mesi",
    ],
    highlight: true,
    price: "€299/mese",
    priceId: "price_1TUMRX8CvMSliYUFzO6KbSt8",
    interval: "mensile",
  },
  {
    id: "weekly-deep-dive",
    badge: "PREMIUM",
    label: "Weekly Deep Dive",
    freq: "Settimanale · 3 settori",
    desc: "Report settimanale su 3 settori verticali a scelta. Copertura completa con scenari strategici, benchmark competitivo e outlook 90 giorni.",
    features: [
      "3 settori verticali a scelta",
      "Report settimanale certificato PPV",
      "Top 10 segnali pre-pubblici per settore",
      "Trend analysis + Key takeaway",
      "Analisi pre-pubblica 4.000+ fonti",
      "Mappa attori & deal flow",
      "Outlook strategico 90 giorni",
      "Benchmark competitivo personalizzato",
      "Archivio completo",
      "1 call di briefing mensile",
    ],
    highlight: false,
    price: "€499/mese",
    priceId: "price_1TUMRa8CvMSliYUFk7jWZjpg",
    interval: "mensile",
  },
];

export default function BaseAlpha() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", company: "", plan: "", sector: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const createCheckout = trpc.baseAlpha.createCheckout.useMutation({
    retry: false,
    onSuccess: (data: { checkoutUrl: string | null }) => {
      setCheckoutLoading(null);
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast.error("Impossibile avviare il checkout. Riprova.");
      }
    },
    onError: (err: { message?: string }) => {
      setCheckoutLoading(null);
      toast.error(err.message || "Errore nel checkout. Riprova.");
    },
  });

  const handleCheckout = (planId: string) => {
    setCheckoutLoading(planId);
    createCheckout.mutate({
      planId: planId as "weekly-brief" | "weekly-intelligence" | "weekly-deep-dive",
      origin: window.location.origin,
      customerEmail: user?.email ?? undefined,
      customerName: user?.name ?? undefined,
    });
  };

  const submitLead = trpc.centroStudi.submitLead.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Richiesta inviata! Ti risponderemo entro 24 ore.");
    },
    onError: () => toast.error("Errore nell'invio. Riprova o scrivi a info@proofpress.ai"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) return toast.error("Nome e email sono obbligatori");
    submitLead.mutate({
      name: form.name,
      email: form.email,
      company: form.company || undefined,
      sector: form.sector || undefined,
      interest: "osservatorio",
      message: `Piano: ${form.plan}${form.message ? ` | ${form.message}` : ""}`,
      source: "base-alpha",
    });
  };

  const scrollToContact = () =>
    document.getElementById("ba-contact")?.scrollIntoView({ behavior: "smooth" });

  const scrollToPlans = () =>
    document.getElementById("ba-plans")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Base Alpha+ Osservatorio Tech Advisory | ProofPress"
        description="Il primo osservatorio a disposizione delle aziende con informazioni e ricerche certificate in tecnologia, investimenti, startup e venture capital."
        canonical="https://proofpress.ai/base-alpha"
        ogSiteName="ProofPress"
      />
      <SharedPageHeader />
      <div className="flex min-h-screen">
        
        <main className="flex-1 min-w-0 overflow-x-hidden">

            {/* ══ HERO — layout 3/4 + 1/4 con profilo Adrian Lenice ════════════════════ */}
          <section className="bg-white border-b border-zinc-200">
            <div style={{ borderBottom: "3px solid #111" }}>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-0">
                {/* Titolo display — 3/4 */}
                <div className="lg:col-span-3 px-8 md:px-12 py-12 md:py-16" style={{ borderRight: "1px solid #11111115" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-black tracking-[0.25em] uppercase px-3 py-1.5 bg-[#c9a227] text-black">
                      OSSERVATORIO
                    </span>
                    <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-zinc-500">
                      Tech Advisory
                    </span>
                  </div>
                  <h1
                    className="font-black leading-none mb-6 text-[#111]"
                    style={{ fontSize: "clamp(3.5rem, 8vw, 7.5rem)", lineHeight: 0.93, letterSpacing: "-0.03em" }}
                  >
                    Base Alpha+
                  </h1>
                  <p
                    className="mt-6 font-bold leading-snug max-w-2xl"
                    style={{ color: "#111", fontSize: "clamp(1.15rem, 1.9vw, 1.45rem)", fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Il primo osservatorio a disposizione delle aziende<br />
                    <span style={{ color: "#dc2626" }}>con informazioni e ricerche certificate.</span>
                  </p>
                  <p
                    className="mt-6 leading-relaxed max-w-2xl"
                    style={{ color: "#11111170", fontSize: "clamp(1rem, 1.5vw, 1.2rem)", fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Tecnologia, investimenti, startup, venture capital. Conosci prima del mercato e su cosa investire.
                  </p>
                  <div className="flex flex-wrap gap-4 mt-8">
                    <button
                      onClick={scrollToContact}
                      className="bg-[#c9a227] text-black font-black text-sm tracking-wider uppercase px-8 py-4 hover:bg-[#b8911f] transition-colors"
                    >
                      RICHIEDI INFORMAZIONI →
                    </button>
                    <button
                      onClick={scrollToPlans}
                      className="border-2 border-zinc-300 text-[#111] font-bold text-sm tracking-wider uppercase px-8 py-4 hover:border-zinc-600 transition-colors"
                    >
                      SCOPRI I PIANI
                    </button>
                  </div>
                </div>
                {/* Profilo Adrian Lenice — 1/4 */}
                <div className="lg:col-span-1 flex flex-col bg-white border-l border-zinc-100">
                  <div className="flex flex-col">
                    <div className="relative">
                      <img
                        src="https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/adrian_lenice_portrait-HBM94kj3QyQX8VWJxXjg6j.webp"
                        alt="Adrian Lenice"
                        className="w-full object-cover object-top"
                        style={{ aspectRatio: "3/4", maxHeight: "320px" }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-[#0a0a0a]">
                        <p className="text-[9px] font-black tracking-[0.2em] uppercase text-[#c9a227]">Direttore</p>
                      </div>
                    </div>
                    <div className="px-5 py-5 flex flex-col gap-3 border-b border-zinc-100">
                      <div>
                        <p className="text-base font-black text-[#0a0a0a]">Adrian Lenice</p>
                        <p className="text-[9px] font-bold tracking-[0.18em] uppercase mt-1 text-[#c9a227]">
                          Direttore · Base Alpha+
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] text-zinc-500 leading-relaxed">Team globale di analisti</p>
                        <p className="text-[11px] text-zinc-500 leading-relaxed">200+ clienti istituzionali</p>
                        <p className="text-[11px] text-zinc-500 leading-relaxed">4.000+ fonti monitorate</p>
                        <p className="text-[11px] text-zinc-500 leading-relaxed">100% contenuti certificati PPV™</p>
                      </div>
                      <a
                        href="mailto:adrian@proofpress.ai"
                        className="w-full text-center text-[10px] font-black tracking-wider uppercase py-3 transition-opacity hover:opacity-90 bg-zinc-900 text-white"
                      >
                        CONTATTA ADRIAN
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ══ NUMERI — sfondo grigio chiaro ══════════════════════════════════ */}
          <section className="bg-zinc-50 border-b border-zinc-200">
            <div className="grid grid-cols-3 divide-x divide-zinc-200">
              {[
                { num: "4.000+", label: "Fonti monitorate", sub: "incluse fonti pre-pubbliche" },
                { num: "18", label: "Settori verticali", sub: "con copertura dedicata" },
                { num: "100%", label: "Certificato PPV", sub: "hash SHA-256 + IPFS" },
              ].map((s) => (
                <div key={s.num} className="px-6 md:px-10 py-8 text-center">
                  <p className="text-4xl md:text-5xl font-black text-[#111] leading-none">{s.num}</p>
                  <p className="text-xs font-black text-[#111] mt-2 uppercase tracking-widest">{s.label}</p>
                  <p className="text-xs text-zinc-500 mt-1">{s.sub}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ══ COME FUNZIONA — sfondo bianco ══════════════════════════════════ */}
          <section className="bg-white px-6 md:px-12 py-14 border-b border-zinc-100">
            <div className="max-w-4xl">
              <p className="text-[11px] font-black tracking-[0.25em] uppercase text-[#c9a227] mb-2">Come funziona</p>
              <h2 className="text-3xl md:text-4xl font-black text-[#111] mb-10">
                Un processo agentico in 4 fasi
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  {
                    n: "01", icon: "🔍", title: "Acquisizione pre-pubblica",
                    desc: "I nostri agenti AI monitorano continuamente oltre 4.000 fonti — database tecnici, brevetti, preprint scientifici, regulatory filings, forum specializzati — estraendo segnali prima che diventino notizie mainstream.",
                  },
                  {
                    n: "02", icon: "🧠", title: "Analisi multi-fonte",
                    desc: "Ogni segnale viene incrociato con dati di mercato, analisi competitive e ricerche approfondite. Gli analisti AI identificano pattern, correlazioni e implicazioni strategiche non visibili nelle singole fonti.",
                  },
                  {
                    n: "03", icon: "📝", title: "Elaborazione report",
                    desc: "I dati vengono sintetizzati in report strutturati con executive summary, analisi di dettaglio, mappa degli attori chiave e outlook strategico calibrato sul settore verticale del cliente.",
                  },
                  {
                    n: "04", icon: "🔐", title: "Certificazione PPV",
                    desc: "Ogni report viene certificato attraverso ProofPress Verify™: hash crittografico SHA-256, notarizzazione su IPFS e Trust Score basato su confronto multi-fonte. Ogni informazione è tracciabile e verificabile.",
                  },
                ].map((s) => (
                  <div key={s.n} className="bg-zinc-50 border border-zinc-100 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[11px] font-black tracking-widest text-[#c9a227]">{s.n}</span>
                      <span className="text-2xl">{s.icon}</span>
                    </div>
                    <h3 className="text-lg font-black text-[#111] mb-2">{s.title}</h3>
                    <p className="text-sm text-zinc-600 leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══ SETTORI — sfondo grigio chiaro ═════════════════════════════════ */}
          <section className="bg-zinc-50 px-6 md:px-12 py-14 border-b border-zinc-200">
            <div className="max-w-4xl">
              <p className="text-[11px] font-black tracking-[0.25em] uppercase text-[#c9a227] mb-2">Settori coperti</p>
              <h2 className="text-3xl md:text-4xl font-black text-[#111] mb-10">
                18 verticali strategici con copertura pre-pubblica
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SECTORS.map((s) => (
                  <div key={s.label} className="bg-white border border-zinc-200 p-4 flex gap-4 items-start hover:border-[#c9a227] transition-colors">
                    <span className="text-2xl flex-shrink-0 mt-0.5">{s.icon}</span>
                    <div>
                      <p className="text-sm font-black text-[#111]">{s.label}</p>
                      <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══ PIANI — sfondo bianco ═══════════════════════════════════════════ */}
          <section id="ba-plans" className="bg-white px-6 md:px-12 py-14 border-b border-zinc-100">
            <div className="max-w-4xl">
              <p className="text-[11px] font-black tracking-[0.25em] uppercase text-[#c9a227] mb-2">Piani di abbonamento</p>
              <h2 className="text-3xl md:text-4xl font-black text-[#111] mb-10">
                Tre livelli di approfondimento
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PLANS.map((p) => (
                  <div
                    key={p.id}
                    className={`flex flex-col border-2 p-6 ${p.highlight ? "border-[#c9a227] bg-amber-50" : "border-zinc-200 bg-white"}`}
                  >
                    <div className="mb-4">
                      <span className={`text-[9px] font-black tracking-[0.2em] uppercase px-2 py-1 ${p.highlight ? "bg-[#c9a227] text-black" : "bg-[#111] text-white"}`}>
                        {p.badge}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">{p.freq}</p>
                    <h3 className="text-xl font-black text-[#111] mb-3">{p.label}</h3>
                    <p className="text-sm text-zinc-600 leading-relaxed mb-5">{p.desc}</p>
                    <ul className="space-y-2 mb-6 flex-1">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-zinc-700">
                          <span className="text-[#c9a227] font-black flex-shrink-0 mt-0.5">✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto">
                      <div className={`text-center py-3 mb-3 ${p.highlight ? "bg-amber-50" : "bg-zinc-50"}`}>
                        <span className="text-2xl font-black text-[#111]">{p.price}</span>
                        <span className="text-xs text-zinc-500 ml-1">/ {p.interval}</span>
                      </div>
                      <button
                        onClick={() => handleCheckout(p.id)}
                        disabled={checkoutLoading === p.id}
                        className={`w-full py-3 text-sm font-black tracking-wider uppercase transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${p.highlight ? "bg-[#c9a227] text-black hover:bg-[#b8911f]" : "bg-[#111] text-white hover:bg-zinc-800"}`}
                      >
                        {checkoutLoading === p.id ? "CARICAMENTO..." : "ABBONATI ORA →"}
                      </button>
                      <button
                        onClick={() => {
                          setForm((prev) => ({ ...prev, plan: p.label }));
                          scrollToContact();
                        }}
                        className="w-full py-2 text-xs font-bold tracking-wider uppercase text-zinc-500 hover:text-zinc-800 transition-colors mt-1"
                      >
                        Richiedi informazioni
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══ PERCHÉ BASE ALPHA — sfondo scuro ═══════════════════════════════ */}
          <section className="bg-[#111] text-white px-6 md:px-12 py-14">
            <div className="max-w-4xl">
              <p className="text-[11px] font-black tracking-[0.25em] uppercase text-[#c9a227] mb-2">Perché Base Alpha</p>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-10">
                Intelligence che arriva prima del mercato
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    title: "Pre-pubblica",
                    desc: "Monitoriamo database tecnici, brevetti, preprint scientifici e regulatory filings. Ricevi segnali prima che diventino notizie mainstream — con un vantaggio informativo di 24-72 ore sul mercato.",
                  },
                  {
                    title: "Verificata",
                    desc: "Ogni informazione è certificata con hash crittografico SHA-256 e notarizzata su IPFS. Tracciabilità e verificabilità garantite nel tempo. Nessuna fonte non verificabile.",
                  },
                  {
                    title: "Azionabile",
                    desc: "Non solo dati: ogni report include executive summary, mappa degli attori chiave, outlook strategico e raccomandazioni operative calibrate sul tuo settore e obiettivi.",
                  },
                ].map((s) => (
                  <div key={s.title} className="border-l-2 border-[#c9a227] pl-5">
                    <h3 className="text-lg font-black text-white mb-2">{s.title}</h3>
                    <p className="text-sm text-white/60 leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══ LEADERSHIP — Adrian Lenice — sfondo bianco, immagine grande ══════ */}
          <section className="bg-white px-6 md:px-12 py-14 border-b border-zinc-100">
            <div className="max-w-4xl">
              <p className="text-[11px] font-black tracking-[0.25em] uppercase text-[#c9a227] mb-2">Il team</p>
              <h2 className="text-2xl md:text-3xl font-black text-zinc-900 mb-10">Chi guida Base Alpha +</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-10 items-start">
                {/* Colonna foto — grande */}
                <div className="md:col-span-2 flex flex-col gap-4">
                  <div className="relative">
                    <img
                      src="https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/adrian_lenice_portrait-HBM94kj3QyQX8VWJxXjg6j.webp"
                      alt="Adrian Lenice"
                      className="w-full object-cover object-top"
                      style={{ aspectRatio: "3/4", maxHeight: "340px" }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-[#0a0a0a]">
                      <p className="text-[9px] font-black tracking-[0.2em] uppercase text-[#c9a227]">Direttore</p>
                    </div>
                  </div>
                  {/* Info sotto foto */}
                  <div className="flex flex-col gap-3 border border-zinc-100 px-5 py-5">
                    <div>
                      <p className="text-base font-black text-zinc-900">Adrian Lenice</p>
                      <p className="text-[9px] font-bold tracking-[0.18em] uppercase mt-1 text-[#c9a227]">
                        Direttore · ProofPress.ai
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] text-zinc-500 leading-relaxed">Team globale di analisti</p>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">200+ clienti istituzionali</p>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">4.000+ fonti monitorate</p>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">100% contenuti certificati PPV™</p>
                    </div>
                    <a
                      href="mailto:adrian@proofpress.ai"
                      className="w-full text-center text-[10px] font-black tracking-wider uppercase py-3 transition-opacity hover:opacity-90 bg-zinc-900 text-white"
                    >
                      adrian@proofpress.ai
                    </a>
                  </div>
                </div>
                {/* Colonna bio */}
                <div className="md:col-span-3 flex flex-col gap-5 pt-1">
                  <p className="text-base text-zinc-700 leading-relaxed">
                    Adrian Lenice guida Base Alpha + come Direttore dell'Osservatorio e del Centro Studi di ProofPress.ai.
                    Coordina un team globale di analisti specializzati in tecnologia, venture capital e innovazione,
                    con focus su intelligence pre-pubblica e report verticali verificati su commissione per board e C-suite.
                  </p>
                  <p className="text-base text-zinc-700 leading-relaxed">
                    Ogni report prodotto da Base Alpha + viene certificato con tecnologia ProofPress Verify™ —
                    hash crittografico SHA-256 e notarizzazione IPFS — garantendo tracciabilità e verificabilità
                    nel tempo per i clienti istituzionali.
                  </p>
                  {/* Statistiche */}
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    {[
                      { label: "200+", desc: "Clienti serviti" },
                      { label: "4.000+", desc: "Fonti monitorate" },
                      { label: "100%", desc: "Contenuti verificati" },
                    ].map((s) => (
                      <div key={s.label} className="border-l-2 border-[#c9a227] pl-3">
                        <p className="text-2xl font-black text-zinc-900">{s.label}</p>
                        <p className="text-[10px] font-bold tracking-wider uppercase text-zinc-500">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                  {/* Quote */}
                  <blockquote className="border-l-4 border-[#c9a227] pl-5 py-1 mt-2">
                    <p className="text-base font-medium italic text-zinc-500 leading-relaxed">
                      "Intelligence that arrives before the market — verified, actionable, institutional-grade."
                    </p>
                  </blockquote>
                </div>
              </div>
            </div>
          </section>

          {/* ══ FORM CONTATTO — sfondo bianco, massima leggibilità ═════════════ */}
          <section id="ba-contact" className="bg-white px-6 md:px-12 py-14 border-t border-zinc-100">
            <div className="max-w-2xl">
              <p className="text-[11px] font-black tracking-[0.25em] uppercase text-[#c9a227] mb-2">Sei interessato?</p>
              <h2 className="text-3xl md:text-4xl font-black text-[#111] mb-3">
                Richiedi una proposta personalizzata
              </h2>
              <p className="text-base text-zinc-500 mb-8 leading-relaxed">
                Il nostro team ti risponderà entro 24 ore con una proposta calibrata sulle tue esigenze di intelligence strategica.
              </p>

              {submitted ? (
                <div className="bg-green-50 border-2 border-green-500 p-8 text-center">
                  <p className="text-2xl font-black text-green-700 mb-2">✓ Richiesta inviata</p>
                  <p className="text-zinc-600">Ti risponderemo entro 24 ore a <strong>{form.email}</strong></p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-[#111] uppercase tracking-wider mb-1.5">Nome *</label>
                      <input
                        type="text"
                        placeholder="Andrea Cinelli"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full border-2 border-zinc-200 focus:border-[#111] outline-none px-4 py-3 text-sm font-medium transition-colors bg-white text-[#111]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-[#111] uppercase tracking-wider mb-1.5">Email *</label>
                      <input
                        type="email"
                        placeholder="andrea@azienda.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full border-2 border-zinc-200 focus:border-[#111] outline-none px-4 py-3 text-sm font-medium transition-colors bg-white text-[#111]"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-[#111] uppercase tracking-wider mb-1.5">Azienda / Fondo</label>
                    <input
                      type="text"
                      placeholder="Nome azienda o fondo"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="w-full border-2 border-zinc-200 focus:border-[#111] outline-none px-4 py-3 text-sm font-medium transition-colors bg-white text-[#111]"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-[#111] uppercase tracking-wider mb-1.5">Piano di interesse</label>
                      <select
                        value={form.plan}
                        onChange={(e) => setForm({ ...form, plan: e.target.value })}
                        className="w-full border-2 border-zinc-200 focus:border-[#111] outline-none px-4 py-3 text-sm font-medium bg-white text-[#111] transition-colors"
                      >
                        <option value="">Seleziona piano</option>
                        <option value="Weekly Brief">Weekly Brief — €199/mese (1 settore)</option>
                        <option value="Weekly Intelligence">Weekly Intelligence — €299/mese (2 settori)</option>
                        <option value="Weekly Deep Dive">Weekly Deep Dive — €499/mese (3 settori)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-[#111] uppercase tracking-wider mb-1.5">Settore di interesse</label>
                      <select
                        value={form.sector}
                        onChange={(e) => setForm({ ...form, sector: e.target.value })}
                        className="w-full border-2 border-zinc-200 focus:border-[#111] outline-none px-4 py-3 text-sm font-medium bg-white text-[#111] transition-colors"
                      >
                        <option value="">Seleziona settore</option>
                        {SECTORS.map((s) => (
                          <option key={s.label} value={s.label}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-[#111] uppercase tracking-wider mb-1.5">Messaggio</label>
                    <textarea
                      rows={4}
                      placeholder="Descrivi brevemente le tue esigenze di intelligence..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full border-2 border-zinc-200 focus:border-[#111] outline-none px-4 py-3 text-sm font-medium transition-colors resize-none bg-white text-[#111]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitLead.isPending}
                    className="w-full bg-[#111] text-white font-black text-sm tracking-wider uppercase py-4 hover:bg-zinc-800 transition-colors disabled:opacity-50"
                  >
                    {submitLead.isPending ? "INVIO IN CORSO..." : "INVIA RICHIESTA →"}
                  </button>
                  <p className="text-xs text-zinc-400 text-center">
                    Base Alpha è un servizio B2B rivolto a team strategici, fondi di investimento, corporate innovation e C-suite.
                  </p>
                </form>
              )}
            </div>
          </section>

          {/* ══ FOOTER MINI ════════════════════════════════════════════════════ */}
          <div className="bg-zinc-50 border-t border-zinc-200 px-6 md:px-12 py-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-zinc-500">© 2026 ProofPress · Base Alpha Osservatorio Intelligence</p>
            <div className="flex gap-4">
              <Link href="/osservatorio-tech" className="text-xs text-zinc-500 hover:text-[#111] transition-colors">← Articoli di Andrea Cinelli</Link>
              <a href="https://proofpressverify.com/" target="_blank" rel="noopener noreferrer" className="text-xs text-[#c9a227] font-bold hover:underline">ProofPress Verify™ →</a>
            </div>
          </div>

        </main>
      </div>
      <SharedPageFooter />
    </div>
  );
}
