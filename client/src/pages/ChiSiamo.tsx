/**
 * IDEASMART — Chi Siamo
 * Layout editoriale coerente con le pagine sezione del sito.
 * Palette: bianco carta (#faf8f3), inchiostro (#1a1a1a), accento teal (#1a1a1a).
 * Tipografia: SF Pro Display (titoli), SF Pro Text (corpo) — sistema Apple.
 */
import { useMemo } from "react";
import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";

const ACCENT = "#1a1a1a";
const ACCENT_LIGHT = "#e6f4f1";
const INK = "#1a1a1a";
const ORANGE = "#2a2a2a";

function formatDateIT(date: Date): string {
  return date.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function Divider({ thick = false }: { thick?: boolean }) {
  return <div className={`w-full ${thick ? "border-t-4" : "border-t"} border-[#1a1a1a]`} />;
}
function ThinDivider() {
  return <div className="w-full border-t border-[#1a1a1a]/15" />;
}
function SectionBadge({ label, color = ACCENT, bg = ACCENT_LIGHT }: { label: string; color?: string; bg?: string }) {
  return (
    <span className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm"
      style={{ background: bg, color, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
      {label}
    </span>
  );
}

const AGENTS = [
  { name: "Market Scout", role: "Monitora oltre 450 fonti globali ogni notte: fonti accademiche, report di settore, feed VC e M&A", icon: "🔍" },
  { name: "Data Verifier", role: "Incrocia e valida i dati da fonti multiple, filtra i segnali non verificati o di bassa qualità", icon: "✅" },
  { name: "Research Writer", role: "Produce Executive Report strutturati: executive summary, key findings, implicazioni strategiche", icon: "✍️" },
  { name: "Senior Analyst", role: "Genera analisi di mercato approfondite su AI Innovation, Venture Capital, M&A e Startup Ecosystem", icon: "📊" },
  { name: "Data Modeler", role: "Elabora modelli quantitativi, trend e proiezioni di mercato su base storica e predittiva", icon: "📈" },
  { name: "Publisher", role: "Distribuisce i report in automatico sulla piattaforma ogni giorno alle 00:00 CET", icon: "🚀" },
  { name: "Social Analyst", role: "Sintetizza i key insight del giorno in formato LinkedIn per opinion leader e decision maker", icon: "🔗" },
  { name: "Intelligence Curator", role: "Seleziona e invia la newsletter settimanale con i report più rilevanti per il target di riferimento", icon: "📧" },
];

const TIMELINE = [
  { year: "2023", label: "La scintilla", text: "Nasce come progetto interno tra un gruppo di professionisti dell'AI e del Venture Capital guidati da Adrian Lenice. L'obiettivo: aggregare e analizzare automaticamente i segnali di mercato più rilevanti su AI, Startup e Venture Capital senza dover leggere decine di fonti ogni mattina." },
  { year: "2024 Q1", label: "Il primo sistema agentico", text: "Il primo agente di analisi entra in produzione. Raccoglie dati da 40 fonti specializzate, li incrocia e produce report strutturati senza intervento umano. La qualità delle analisi supera le aspettative: insight comparabili a quelli di boutique di ricerca con team dedicati." },
  { year: "2024 Q3", label: "La piattaforma", text: "Da 1 a 8 agenti specializzati. Nasce la piattaforma di analisi completa: Scout, Analyst, Researcher, Writer, Publisher. IdeaSmart diventa un punto di riferimento per investitori e operatori del settore AI e Venture Capital." },
  { year: "2025", label: "La crescita", text: "3 aree di analisi verticale: AI Innovation, Venture Capital & M&A, Startup Ecosystem. Oltre 20 ricerche originali al giorno da 450+ fonti globali. Il team di senior advisor si consolida con profili ex Big 5, ex Investment Banking e founder con exit di successo." },
  { year: "2026", label: "Oggi", text: "IdeaSmart è la prima piattaforma italiana di ricerca e analisi di mercato completamente automatizzata su AI, Venture Capital, M&A e Startup. Si apre IdeaSmart Business: il servizio di consulenza dedicata per investitori, aziende, scaleup e fondi che vogliono supporto professionale nelle decisioni di investimento." },
];

const STATS = [
  { value: "20+", label: "Ricerche originali/giorno" },
  { value: "450+", label: "Fonti monitorate" },
  { value: "100+", label: "Clienti in Italia e nel mondo" },
  { value: "30+", label: "Anni esperienza del team" },
  { value: "00:00", label: "Aggiornamento CET" },
  { value: "100%", label: "Dati verificati" },
];

const TESTIMONIALS = [
  {
    quote: "IdeaSmart ci ha fornito in 48 ore un'analisi competitiva sul mercato AI europeo che avrebbe richiesto al nostro team interno almeno tre settimane. La qualità degli insight era paragonabile a quella di una top boutique di ricerca.",
    role: "Partner, Fondo VC pan-europeo — Londra",
    sector: "Venture Capital",
  },
  {
    quote: "Abbiamo utilizzato i report di IdeaSmart per supportare la due diligence su un'acquisizione nel settore AI generativa. La profondità dell'analisi e la velocità di consegna hanno fatto la differenza nel processo decisionale del board.",
    role: "Chief Strategy Officer, Gruppo industriale Fortune 500 — Milano",
    sector: "M&A Advisory",
  },
  {
    quote: "Come family office, avevamo bisogno di una visione strutturata sul mercato delle startup AI in Italia e in Europa. IdeaSmart ci ha consegnato un Executive Report che ha orientato le nostre scelte di allocazione per il 2025.",
    role: "Investment Director, Family Office — Svizzera",
    sector: "Investment Research",
  },
  {
    quote: "Il team di IdeaSmart Business ha affiancato il nostro CDA in una fase critica di reshaping strategico. La combinazione di analisi agentica e consulenza senior ha prodotto un output di qualità eccezionale in tempi che non avremmo mai immaginato possibili.",
    role: "CEO, Scaleup tecnologica — Berlino",
    sector: "Board Advisory",
  },
];

const SIGNATURES = [
  {
    name: "Andrea Cinelli",
    role: "Opinion Leader & Editorialista",
    bio: "Imprenditore seriale, CEO e opinion leader nel settore dell'innovazione digitale, AI e Venture Capital. Autore degli editoriali quotidiani di IdeaSmart.",
    linkedin: "https://www.linkedin.com/in/cinellia/",
    initials: "AC",
    photo: "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/andrea-cinelli-profile_2084610f.jpeg",
  },
];

export default function ChiSiamo() {
  const today = useMemo(() => new Date(), []);

  return (
    <>
      <SEOHead
        title="Chi Siamo — IDEASMART Research"
        description="IdeaSmart: la prima piattaforma italiana di ricerca e analisi di mercato automatizzata su AI Innovation, Venture Capital, M&A e Startup. 20+ ricerche originali al giorno da 450+ fonti globali."
        canonical="https://ideasmart.ai/chi-siamo"
        ogSiteName="IDEASMART Research"
      />
      <style>{`
        /* SF Pro system font — no external loading needed */
      `}</style>
      <div className="min-h-screen" style={{ background: "#faf8f3", color: INK }}>

        {/* ── TESTATA ── */}
        <header className="max-w-6xl mx-auto px-4 pt-6 pb-0">
          <div className="flex items-center justify-between mb-2">
            <Link href="/">
              <span className="text-xs text-[#1a1a1a]/40 hover:text-[#1a1a1a]/70 cursor-pointer uppercase tracking-widest"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                ← IdeaSmart
              </span>
            </Link>
            <span className="text-xs text-[#1a1a1a]/40 uppercase tracking-widest"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
              {formatDateIT(today)}
            </span>
          </div>
          <Divider thick />
          <div className="text-center py-6">
            <SectionBadge label="La nostra storia" />
            <h1 className="mt-3 text-4xl md:text-6xl font-black tracking-tight text-[#1a1a1a]"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif", letterSpacing: "-0.02em" }}>
              Chi Siamo
            </h1>
            <p className="mt-2 text-xs uppercase tracking-[0.25em] text-[#1a1a1a]/50"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
              La prima società italiana di Ricerca di Mercato ed Executive Reports in ambito tecnologico basata su tecnologia agentica
            </p>
          </div>
          <Divider />
        </header>

        <BreakingNewsTicker />

        {/* ── CORPO ── */}
        <main className="max-w-6xl mx-auto px-4 pb-16">

          {/* ── MANIFESTO ── */}
          <section className="py-10 grid md:grid-cols-[2fr_1fr] gap-10">
            <div>
              <SectionBadge label="Manifesto" />
              <h2 className="mt-3 text-3xl md:text-4xl font-bold leading-tight text-[#1a1a1a]"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
                  Ricerca di mercato senza bias,<br />senza agenda, senza confini.
              </h2>
              <div className="mt-5 space-y-4 text-base leading-relaxed text-[#1a1a1a]/75"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
                <p>
                  IdeaSmart nasce dalla visione di <strong style={{ color: INK }}>Adrian Lenice</strong>, imprenditore seriale e investitore con oltre 30 anni di esperienza nell'ecosistema tech e finanziario europeo. L'obiettivo: costruire la prima piattaforma di ricerca e analisi di mercato completamente automatizzata su AI, Venture Capital, M&A e Startup.
                </p>
                <p>
                  Quello che è successo dopo ha superato ogni aspettativa. Il sistema agentico ha preso vita propria, producendo ogni giorno 20+ ricerche originali, 40+ notizie verificate e analisi di mercato che competono con le migliori boutique di ricerca europee. Oggi IdeaSmart è il <strong style={{ color: INK }}>punto di riferimento italiano per chi investe e opera nell'ecosistema AI e Venture Capital</strong>.
                </p>
                <p>
                  Un sistema agentico proprietario replica un team di analisti end-to-end: raccoglie segnali da oltre 450 fonti globali, incrocia dati, produce report strutturati e li distribuisce ogni giorno alle 00:00 CET. Nessuna agenda editoriale. Nessun bias. Solo dati, analizzati con la velocità e la scala impossibili per un team umano.
                </p>
              </div>
            </div>

            {/* Citazione */}
            <div className="flex flex-col justify-center">
              <blockquote className="border-l-4 pl-5 py-2" style={{ borderColor: ACCENT }}>
                <p className="text-xl font-bold italic leading-snug text-[#1a1a1a]"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
                  "Ridefinire la ricerca di mercato nell’era dell’intelligenza artificiale. Non come esperimento, ma come nuovo standard per chi investe in AI, Venture Capital e Startup."
                </p>
                <footer className="mt-3 text-xs uppercase tracking-widest text-[#1a1a1a]/50"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                  — Adrian Lenice, Founder & CEO IdeaSmart
                </footer>
              </blockquote>
            </div>
          </section>

          <ThinDivider />

          {/* ── STATISTICHE ── */}
          <section className="py-8">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-0">
              {STATS.map((s, i) => (
                <div key={i} className="text-center py-5 px-3"
                  style={{ borderLeft: i > 0 ? "1px solid rgba(26,26,46,0.12)" : "none" }}>
                  <div className="text-3xl font-black"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif", color: i === 5 ? ORANGE : INK }}>
                    {s.value}
                  </div>
                  <div className="mt-1 text-[9px] uppercase tracking-widest text-[#1a1a1a]/45"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <ThinDivider />

          {/* ── TIMELINE ── */}
          <section className="py-10">
            <SectionBadge label="La storia" />
            <h2 className="mt-3 text-2xl font-bold text-[#1a1a1a] mb-8"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
              Da progetto interno a leader nella ricerca tecnologica agentica
            </h2>
            <div className="space-y-0">
              {TIMELINE.map((t, i) => (
                <div key={i}>
                  <div className="grid grid-cols-[120px_1fr] gap-6 py-6">
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#1a1a1a]/40"
                        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                        {t.year}
                      </span>
                      <div className="mt-1">
                        <SectionBadge label={t.label} />
                      </div>
                    </div>
                    <div>
                      <p className="text-base leading-relaxed text-[#1a1a1a]/75"
                        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
                        {t.text}
                      </p>
                    </div>
                  </div>
                  {i < TIMELINE.length - 1 && <ThinDivider />}
                </div>
              ))}
            </div>
          </section>

          <ThinDivider />

          {/* ── LA REDAZIONE AGENTICA ── */}
          <section className="py-10">
            <SectionBadge label="Il sistema agentico" />
            <h2 className="mt-3 text-2xl font-bold text-[#1a1a1a] mb-6"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
              8 agenti specializzati al lavoro ogni giorno
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4">
              {AGENTS.map((a, i) => (
                <div key={i} className="py-5 px-4"
                  style={{
                    borderLeft: [1,2,3,5,6,7].includes(i) ? "1px solid rgba(26,26,46,0.10)" : "none",
                    borderTop: i >= 4 ? "1px solid rgba(26,26,46,0.10)" : "none",
                  }}>
                  <div className="text-2xl mb-2">{a.icon}</div>
                  <div className="text-sm font-bold text-[#1a1a1a]"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                    {a.name}
                  </div>
                  <div className="mt-1 text-xs leading-relaxed text-[#1a1a1a]/55"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
                    {a.role}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Link href="/tecnologia">
                <span
                  className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest cursor-pointer transition-colors hover:opacity-70"
                  style={{ color: ACCENT, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                >
                  Scopri come funziona la tecnologia →
                </span>
              </Link>
            </div>
          </section>

          <ThinDivider />

          {/* ── FOTO TEAM ── */}
          <section className="py-10">
            <SectionBadge label="Il Team" />
            <h2 className="mt-3 text-2xl font-bold text-[#1a1a1a] mb-6"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
              Senior advisor, founder con exit, ex Big 5 e opinion leader
            </h2>
            <div className="relative overflow-hidden rounded-sm mb-4" style={{ maxHeight: 480 }}>
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ideasmart-team-italian-CVGhfjRcrHNLGtRsaThccC.webp"
                alt="Il team di IdeaSmart"
                className="w-full object-cover object-center"
                style={{ maxHeight: 480 }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-6"
                style={{ background: "linear-gradient(to top, rgba(10,15,30,0.85) 0%, transparent 100%)" }}>
                <p className="text-white text-sm font-bold uppercase tracking-widest"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                  Adrian Lenice & il team IdeaSmart
                </p>
                <p className="text-white/60 text-xs mt-1"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
                  Ex consulenti Big 5 · Founder con exit · Ex Investment Banking · Partner VC · Opinion Leader AI
                </p>
              </div>
            </div>
          </section>

          <ThinDivider />

          {/* ── FOUNDER ── */}
          <section className="py-10 grid md:grid-cols-[1fr_2fr] gap-10 items-start">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-black text-white mb-3"
                style={{ background: INK, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
                AL
              </div>
              <div className="text-base font-bold text-[#1a1a1a]"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
                Adrian Lenice
              </div>
              <div className="text-[10px] uppercase tracking-widest text-[#1a1a1a]/45 mt-1"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                Founder & CEO IdeaSmart
              </div>
            </div>
            <div>
              <SectionBadge label="Il fondatore" />
              <p className="mt-3 text-base leading-relaxed text-[#1a1a1a]/75"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
                Adrian Lenice è il fondatore e CEO di IdeaSmart. Imprenditore seriale con oltre 30 anni di esperienza nell'ecosistema tech, finanziario e venture capital europeo, ha costruito e ceduto con successo più aziende nel settore dell'innovazione digitale. Ha guidato IdeaSmart dalla sua nascita come progetto interno fino a farne la prima piattaforma italiana di ricerca e analisi di mercato completamente automatizzata su AI, Venture Capital, M&A e Startup.
              </p>
              <p className="mt-3 text-base leading-relaxed text-[#1a1a1a]/75"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
                La sua visione è chiara: la ricerca di mercato del futuro non sarà prodotta da team di analisti con settimane di lavoro, ma da sistemi agentici capaci di raccogliere segnali globali, incrociare dati e produrre insight con una velocità e una scala impossibili per qualsiasi team umano. IdeaSmart è la prova che questa visione è già realtà.
              </p>
            </div>
          </section>

          <ThinDivider />

          {/* ── FIRME IDEASMART ── */}
          <section className="py-10">
            <SectionBadge label="Alcune firme di IdeaSmart" />
            <h2 className="mt-3 text-2xl font-bold text-[#1a1a1a] mb-6"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
              Gli opinion leader che firmano i nostri editoriali
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SIGNATURES.map((s, i) => (
                <div key={i} className="flex gap-4 items-start p-5 border border-[#1a1a1a]/10 hover:border-[#1a1a1a]/25 transition-colors">
                  <div className="flex-shrink-0">
                    {s.photo ? (
                      <img src={s.photo} alt={s.name}
                        className="w-16 h-16 rounded-full object-cover object-top"
                        style={{ border: `2px solid ${ACCENT}` }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-black text-white"
                        style={{ background: INK }}>
                        {s.initials}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-bold text-[#1a1a1a]"
                      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
                      {s.name}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest mt-0.5 mb-2"
                      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", color: ACCENT }}>
                      {s.role}
                    </div>
                    <p className="text-sm leading-relaxed text-[#1a1a1a]/65"
                      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
                      {s.bio}
                    </p>
                    {s.linkedin && (
                      <a href={s.linkedin} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-3 text-[10px] font-bold uppercase tracking-widest transition-opacity hover:opacity-70"
                        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", color: ACCENT }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        Seguimi su LinkedIn →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <ThinDivider />

          {/* ── TESTIMONIAL ── */}
          <section className="py-10">
            <SectionBadge label="Cosa dicono di noi" />
            <h2 className="mt-3 text-2xl font-bold text-[#1a1a1a] mb-2"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
              100+ clienti in Italia e nel mondo si affidano a IdeaSmart
            </h2>
            <p className="text-sm text-[#1a1a1a]/50 mb-8"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
              Le testimonianze sono riportate in forma anonima per tutelare la riservatezza dei nostri clienti.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="p-6 border-l-4"
                  style={{ borderLeftColor: ACCENT, background: "rgba(10,110,92,0.03)" }}>
                  <SectionBadge label={t.sector} />
                  <blockquote className="mt-3 text-base leading-relaxed text-[#1a1a1a]/80 italic"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
                    “{t.quote}”
                  </blockquote>
                  <p className="mt-4 text-[10px] uppercase tracking-widest text-[#1a1a1a]/45"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                    — {t.role}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <Divider thick />

          {/* ── BANNER RECRUITING ── */}
          <section className="py-10">
            <div
              className="p-8 border-2 text-center relative overflow-hidden"
              style={{ borderColor: ACCENT, background: "rgba(10,110,92,0.04)" }}
            >
              <div className="relative">
                <SectionBadge label="Open Positions" />
                <h2
                  className="mt-4 text-2xl md:text-3xl font-bold text-[#1a1a1a] mb-3"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
                >
                  Vuoi Collaborare con Noi?<br />
                  <span style={{ color: ACCENT }}>Cerchiamo Firme d'Eccellenza.</span>
                </h2>
                <p
                  className="text-base leading-relaxed mb-6 max-w-2xl mx-auto text-[#1a1a1a]/65"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}
                >
                  IdeaSmart Business è una community selettiva di senior advisor, founder con exit, ex partner di fondi VC e opinion leader di settore. Stiamo allargando il team con profili di assoluta eccellenza.
                  <br /><br />
                  <strong className="text-[#1a1a1a]">La sezione è molto selettiva. Candidati adesso e scrivici a{" "}
                    <a href="mailto:info@ideasmart.ai?subject=Candidatura IdeaSmart Business" className="underline" style={{ color: ACCENT }}>info@ideasmart.ai</a>
                  </strong>
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href="mailto:info@ideasmart.ai?subject=Candidatura IdeaSmart Business"
                    className="inline-flex items-center gap-2 px-8 py-3 text-sm font-bold uppercase tracking-widest transition-all duration-200"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", background: INK, color: "#1a1a1a" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = ACCENT; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = INK; (e.currentTarget as HTMLElement).style.color = ACCENT; }}
                  >
                    Candidati Ora → info@ideasmart.ai
                  </a>
                </div>
                <p
                  className="mt-4 text-[10px] uppercase tracking-widest text-[#1a1a1a]/35"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                >
                  Selezione continua · Solo profili senior · Riservatezza garantita
                </p>
              </div>
            </div>
          </section>

          <Divider thick />

          {/* ── CTA BUSINESS ── */}
          <section className="py-10 text-center">
            <SectionBadge label="IdeaSmart Business" color={ORANGE} bg="#fff3ee" />
            <h2 className="mt-4 text-2xl md:text-3xl font-bold text-[#1a1a1a]"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
              Analisi a supporto delle tue decisioni.<br />
              <span style={{ color: ACCENT }}>Con i migliori esperti del settore.</span>
            </h2>
            <p className="mt-3 text-base text-[#1a1a1a]/65 max-w-2xl mx-auto"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
              Hai bisogno di un'analisi approfondita per una decisione di investimento? Stai valutando un'acquisizione nel settore AI? Vuoi supporto per il reshaping aziendale o per la strategia di un fondo? IdeaSmart Business mette a tua disposizione un team di senior advisor con oltre 30 anni di esperienza in AI Innovation, M&A e Venture Capital.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/business">
                <span className="inline-flex items-center gap-2 px-8 py-3 text-sm font-bold uppercase tracking-widest cursor-pointer transition-all duration-200"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", background: INK, color: ORANGE }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = ORANGE; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = INK; (e.currentTarget as HTMLElement).style.color = ORANGE; }}>
                  ▶ Scopri IdeaSmart Business
                </span>
              </Link>
              <Link href="/">
                <span className="inline-flex items-center gap-2 px-8 py-3 text-sm font-bold uppercase tracking-widest cursor-pointer transition-all duration-200 border border-[#1a1a1a]/30 hover:border-[#1a1a1a] text-[#1a1a1a]/60 hover:text-[#1a1a1a]"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                  ← Torna alla Home
                </span>
              </Link>
            </div>
          </section>

          {/* ── FOOTER ── */}
          <ThinDivider />
          <footer className="py-6 flex flex-wrap items-center justify-between gap-4">
            <div className="text-[10px] uppercase tracking-widest text-[#1a1a1a]/30"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
              © {new Date().getFullYear()} IdeaSmart — Testata 100% HumanLess
            </div>
            <div className="flex items-center gap-4">
              <Link href="/manifesto">
                <span className="text-[10px] uppercase tracking-widest text-[#1a1a1a]/40 hover:text-[#1a1a1a]/70 cursor-pointer"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>Manifesto</span>
              </Link>
              <Link href="/business">
                <span className="text-[10px] uppercase tracking-widest cursor-pointer"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", color: ORANGE }}>Business</span>
              </Link>
              <Link href="/privacy">
                <span className="text-[10px] uppercase tracking-widest text-[#1a1a1a]/40 hover:text-[#1a1a1a]/70 cursor-pointer"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>Privacy</span>
              </Link>
            </div>
          </footer>

        </main>
      </div>
    </>
  );
}
