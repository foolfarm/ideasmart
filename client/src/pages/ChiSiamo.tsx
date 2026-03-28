/**
 * IDEASMART — Chi Siamo
 * Layout editoriale coerente con le pagine sezione del sito.
 * Palette: bianco carta (#faf8f3), inchiostro (#1a1a2e), accento teal (#0a6e5c).
 * Tipografia: Playfair Display (titoli), Source Serif 4 (corpo), Space Mono (label/meta).
 */
import { useMemo } from "react";
import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";

const ACCENT = "#0a6e5c";
const ACCENT_LIGHT = "#e6f4f1";
const INK = "#1a1a2e";
const ORANGE = "#ff5500";

function formatDateIT(date: Date): string {
  return date.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function Divider({ thick = false }: { thick?: boolean }) {
  return <div className={`w-full ${thick ? "border-t-4" : "border-t"} border-[#1a1a2e]`} />;
}
function ThinDivider() {
  return <div className="w-full border-t border-[#1a1a2e]/15" />;
}
function SectionBadge({ label, color = ACCENT, bg = ACCENT_LIGHT }: { label: string; color?: string; bg?: string }) {
  return (
    <span className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm"
      style={{ background: bg, color, fontFamily: "'Space Mono', monospace" }}>
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
  { year: "2024 Q3", label: "La piattaforma", text: "Da 1 a 8 agenti specializzati. Nasce la piattaforma di analisi completa: Scout, Analyst, Researcher, Writer, Publisher. IdeaSmart Research diventa un punto di riferimento per investitori e operatori del settore AI e Venture Capital." },
  { year: "2025", label: "La crescita", text: "3 aree di analisi verticale: AI Innovation, Venture Capital & M&A, Startup Ecosystem. Oltre 20 ricerche originali al giorno da 450+ fonti globali. Il team di senior advisor si consolida con profili ex Big 5, ex Investment Banking e founder con exit di successo." },
  { year: "2026", label: "Oggi", text: "IdeaSmart Research è la prima piattaforma italiana di ricerca e analisi di mercato completamente automatizzata su AI, Venture Capital, M&A e Startup. Si apre IdeaSmart Business: il servizio di consulenza dedicata per investitori, aziende, scaleup e fondi che vogliono supporto professionale nelle decisioni di investimento." },
];

const STATS = [
  { value: "20+", label: "Ricerche originali/giorno" },
  { value: "450+", label: "Fonti monitorate" },
  { value: "3", label: "Aree di analisi" },
  { value: "30+", label: "Anni esperienza del team" },
  { value: "00:00", label: "Aggiornamento CET" },
  { value: "100%", label: "Dati verificati" },
];

export default function ChiSiamo() {
  const today = useMemo(() => new Date(), []);

  return (
    <>
      <SEOHead
        title="Chi Siamo — IDEASMART Research"
        description="IdeaSmart Research: la prima piattaforma italiana di ricerca e analisi di mercato automatizzata su AI Innovation, Venture Capital, M&A e Startup. 20+ ricerche originali al giorno da 450+ fonti globali."
        canonical="https://ideasmart.ai/chi-siamo"
        ogSiteName="IDEASMART Research"
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,600&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,300;1,8..60,400&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
      `}</style>
      <div className="min-h-screen" style={{ background: "#faf8f3", color: INK }}>

        {/* ── TESTATA ── */}
        <header className="max-w-6xl mx-auto px-4 pt-6 pb-0">
          <div className="flex items-center justify-between mb-2">
            <Link href="/">
              <span className="text-xs text-[#1a1a2e]/40 hover:text-[#1a1a2e]/70 cursor-pointer uppercase tracking-widest"
                style={{ fontFamily: "'Space Mono', monospace" }}>
                ← IdeaSmart
              </span>
            </Link>
            <span className="text-xs text-[#1a1a2e]/40 uppercase tracking-widest"
              style={{ fontFamily: "'Space Mono', monospace" }}>
              {formatDateIT(today)}
            </span>
          </div>
          <Divider thick />
          <div className="text-center py-6">
            <SectionBadge label="La nostra storia" />
            <h1 className="mt-3 text-4xl md:text-6xl font-black tracking-tight text-[#1a1a2e]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.02em" }}>
              Chi Siamo
            </h1>
            <p className="mt-2 text-xs uppercase tracking-[0.25em] text-[#1a1a2e]/50"
              style={{ fontFamily: "'Space Mono', monospace" }}>
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
              <h2 className="mt-3 text-3xl md:text-4xl font-bold leading-tight text-[#1a1a2e]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Ricerca di mercato senza bias,<br />senza agenda, senza confini.
              </h2>
              <div className="mt-5 space-y-4 text-base leading-relaxed text-[#1a1a2e]/75"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                <p>
                  IdeaSmart Research nasce dalla visione di <strong style={{ color: INK }}>Adrian Lenice</strong>, imprenditore seriale e investitore con oltre 30 anni di esperienza nell'ecosistema tech e finanziario europeo. L'obiettivo: costruire la prima piattaforma di ricerca e analisi di mercato completamente automatizzata su AI, Venture Capital, M&A e Startup.
                </p>
                <p>
                  Quello che è successo dopo ha superato ogni aspettativa. Il sistema agentico ha preso vita propria, producendo ogni giorno 20+ ricerche originali, 40+ notizie verificate e analisi di mercato che competono con le migliori boutique di ricerca europee. Oggi IdeaSmart Research è il <strong style={{ color: INK }}>punto di riferimento italiano per chi investe e opera nell'ecosistema AI e Venture Capital</strong>.
                </p>
                <p>
                  Un sistema agentico proprietario replica un team di analisti end-to-end: raccoglie segnali da oltre 450 fonti globali, incrocia dati, produce report strutturati e li distribuisce ogni giorno alle 00:00 CET. Nessuna agenda editoriale. Nessun bias. Solo dati, analizzati con la velocità e la scala impossibili per un team umano.
                </p>
              </div>
            </div>

            {/* Citazione */}
            <div className="flex flex-col justify-center">
              <blockquote className="border-l-4 pl-5 py-2" style={{ borderColor: ACCENT }}>
                <p className="text-xl font-bold italic leading-snug text-[#1a1a2e]"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  "Ridefinire la ricerca di mercato nell’era dell’intelligenza artificiale. Non come esperimento, ma come nuovo standard per chi investe in AI, Venture Capital e Startup."
                </p>
                <footer className="mt-3 text-xs uppercase tracking-widest text-[#1a1a2e]/50"
                  style={{ fontFamily: "'Space Mono', monospace" }}>
                  — Adrian Lenice, Founder & CEO IdeaSmart Research
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
                    style={{ fontFamily: "'Playfair Display', Georgia, serif", color: i === 5 ? ORANGE : INK }}>
                    {s.value}
                  </div>
                  <div className="mt-1 text-[9px] uppercase tracking-widest text-[#1a1a2e]/45"
                    style={{ fontFamily: "'Space Mono', monospace" }}>
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
            <h2 className="mt-3 text-2xl font-bold text-[#1a1a2e] mb-8"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Da progetto interno a leader nella ricerca tecnologica agentica
            </h2>
            <div className="space-y-0">
              {TIMELINE.map((t, i) => (
                <div key={i}>
                  <div className="grid grid-cols-[120px_1fr] gap-6 py-6">
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#1a1a2e]/40"
                        style={{ fontFamily: "'Space Mono', monospace" }}>
                        {t.year}
                      </span>
                      <div className="mt-1">
                        <SectionBadge label={t.label} />
                      </div>
                    </div>
                    <div>
                      <p className="text-base leading-relaxed text-[#1a1a2e]/75"
                        style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
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
            <h2 className="mt-3 text-2xl font-bold text-[#1a1a2e] mb-6"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
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
                  <div className="text-sm font-bold text-[#1a1a2e]"
                    style={{ fontFamily: "'Space Mono', monospace" }}>
                    {a.name}
                  </div>
                  <div className="mt-1 text-xs leading-relaxed text-[#1a1a2e]/55"
                    style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                    {a.role}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Link href="/tecnologia">
                <span
                  className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest cursor-pointer transition-colors hover:opacity-70"
                  style={{ color: ACCENT, fontFamily: "'Space Mono', monospace" }}
                >
                  Scopri come funziona la tecnologia →
                </span>
              </Link>
            </div>
          </section>

          <ThinDivider />

          {/* ── FOUNDER ── */}
          <section className="py-10 grid md:grid-cols-[1fr_2fr] gap-10 items-start">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-black text-white mb-3"
                style={{ background: INK, fontFamily: "'Playfair Display', Georgia, serif" }}>
                AL
              </div>
              <div className="text-base font-bold text-[#1a1a2e]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Adrian Lenice
              </div>
              <div className="text-[10px] uppercase tracking-widest text-[#1a1a2e]/45 mt-1"
                style={{ fontFamily: "'Space Mono', monospace" }}>
                Founder & CEO IdeaSmart Research
              </div>
            </div>
            <div>
              <SectionBadge label="Il fondatore" />
              <p className="mt-3 text-base leading-relaxed text-[#1a1a2e]/75"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                Adrian Lenice è il fondatore e CEO di IdeaSmart Research. Imprenditore seriale con oltre 30 anni di esperienza nell'ecosistema tech, finanziario e venture capital europeo, ha costruito e ceduto con successo più aziende nel settore dell'innovazione digitale. Ha guidato IdeaSmart dalla sua nascita come progetto interno fino a farne la prima piattaforma italiana di ricerca e analisi di mercato completamente automatizzata su AI, Venture Capital, M&A e Startup.
              </p>
              <p className="mt-3 text-base leading-relaxed text-[#1a1a2e]/75"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                La sua visione è chiara: la ricerca di mercato del futuro non sarà prodotta da team di analisti con settimane di lavoro, ma da sistemi agentici capaci di raccogliere segnali globali, incrociare dati e produrre insight con una velocità e una scala impossibili per qualsiasi team umano. IdeaSmart Research è la prova che questa visione è già realtà.
              </p>
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
                  className="mt-4 text-2xl md:text-3xl font-bold text-[#1a1a2e] mb-3"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Vuoi Collaborare con Noi?<br />
                  <span style={{ color: ACCENT }}>Cerchiamo Firme d'Eccellenza.</span>
                </h2>
                <p
                  className="text-base leading-relaxed mb-6 max-w-2xl mx-auto text-[#1a1a2e]/65"
                  style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
                >
                  IdeaSmart Business è una community selettiva di senior advisor, founder con exit, ex partner di fondi VC e opinion leader di settore. Stiamo allargando il team con profili di assoluta eccellenza.
                  <br /><br />
                  <strong className="text-[#1a1a2e]">La sezione è molto selettiva. Candidati adesso e scrivici a{" "}
                    <a href="mailto:info@ideasmart.ai?subject=Candidatura IdeaSmart Business" className="underline" style={{ color: ACCENT }}>info@ideasmart.ai</a>
                  </strong>
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href="mailto:info@ideasmart.ai?subject=Candidatura IdeaSmart Business"
                    className="inline-flex items-center gap-2 px-8 py-3 text-sm font-bold uppercase tracking-widest transition-all duration-200"
                    style={{ fontFamily: "'Space Mono', monospace", background: INK, color: "#0a6e5c" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = ACCENT; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = INK; (e.currentTarget as HTMLElement).style.color = ACCENT; }}
                  >
                    Candidati Ora → info@ideasmart.ai
                  </a>
                </div>
                <p
                  className="mt-4 text-[10px] uppercase tracking-widest text-[#1a1a2e]/35"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  Selezione continua · Solo profili senior · Riservatezza garantita
                </p>
              </div>
            </div>
          </section>

          <Divider thick />

          {/* ── CTA BUSINESS ── */}
          <section className="py-10 text-center">
            <SectionBadge label="IdeaSmart Research Business" color={ORANGE} bg="#fff3ee" />
            <h2 className="mt-4 text-2xl md:text-3xl font-bold text-[#1a1a2e]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Analisi a supporto delle tue decisioni.<br />
              <span style={{ color: ACCENT }}>Con i migliori esperti del settore.</span>
            </h2>
            <p className="mt-3 text-base text-[#1a1a2e]/65 max-w-2xl mx-auto"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
              Hai bisogno di un'analisi approfondita per una decisione di investimento? Stai valutando un'acquisizione nel settore AI? Vuoi supporto per il reshaping aziendale o per la strategia di un fondo? IdeaSmart Research Business mette a tua disposizione un team di senior advisor con oltre 30 anni di esperienza in AI Innovation, M&A e Venture Capital.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/business">
                <span className="inline-flex items-center gap-2 px-8 py-3 text-sm font-bold uppercase tracking-widest cursor-pointer transition-all duration-200"
                  style={{ fontFamily: "'Space Mono', monospace", background: INK, color: ORANGE }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = ORANGE; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = INK; (e.currentTarget as HTMLElement).style.color = ORANGE; }}>
                  ▶ Scopri IdeaSmart Research Business
                </span>
              </Link>
              <Link href="/">
                <span className="inline-flex items-center gap-2 px-8 py-3 text-sm font-bold uppercase tracking-widest cursor-pointer transition-all duration-200 border border-[#1a1a2e]/30 hover:border-[#1a1a2e] text-[#1a1a2e]/60 hover:text-[#1a1a2e]"
                  style={{ fontFamily: "'Space Mono', monospace" }}>
                  ← Torna alla Home
                </span>
              </Link>
            </div>
          </section>

          {/* ── FOOTER ── */}
          <ThinDivider />
          <footer className="py-6 flex flex-wrap items-center justify-between gap-4">
            <div className="text-[10px] uppercase tracking-widest text-[#1a1a2e]/30"
              style={{ fontFamily: "'Space Mono', monospace" }}>
              © {new Date().getFullYear()} IdeaSmart — Testata 100% HumanLess
            </div>
            <div className="flex items-center gap-4">
              <Link href="/manifesto">
                <span className="text-[10px] uppercase tracking-widest text-[#1a1a2e]/40 hover:text-[#1a1a2e]/70 cursor-pointer"
                  style={{ fontFamily: "'Space Mono', monospace" }}>Manifesto</span>
              </Link>
              <Link href="/business">
                <span className="text-[10px] uppercase tracking-widest cursor-pointer"
                  style={{ fontFamily: "'Space Mono', monospace", color: ORANGE }}>Business</span>
              </Link>
              <Link href="/privacy">
                <span className="text-[10px] uppercase tracking-widest text-[#1a1a2e]/40 hover:text-[#1a1a2e]/70 cursor-pointer"
                  style={{ fontFamily: "'Space Mono', monospace" }}>Privacy</span>
              </Link>
            </div>
          </footer>

        </main>
      </div>
    </>
  );
}
