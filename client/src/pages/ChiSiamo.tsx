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
  { name: "Scout", role: "Raccoglie notizie da oltre 200 fonti ogni notte", icon: "🔍" },
  { name: "Verifier", role: "Incrocia le fonti e filtra le notizie non verificate", icon: "✅" },
  { name: "Writer", role: "Redige articoli con stile giornalistico professionale", icon: "✍️" },
  { name: "Editor", role: "Revisiona, taglia e ottimizza ogni pezzo", icon: "📝" },
  { name: "Analyst", role: "Produce analisi di mercato e reportage settimanali", icon: "📊" },
  { name: "Publisher", role: "Pubblica in automatico su tutte le sezioni", icon: "🚀" },
  { name: "Social", role: "Crea e pubblica il post LinkedIn quotidiano", icon: "🔗" },
  { name: "Newsletter", role: "Confeziona e invia la newsletter alle 07:30", icon: "📧" },
];

const TIMELINE = [
  { year: "2023", label: "La scintilla", text: "Nasce come bulletin board interna tra un gruppo di nerd appassionati di AI sparsi per il mondo, guidati da Andrea Cinelli. L'obiettivo: aggregare le notizie più rilevanti sull'intelligenza artificiale senza dover leggere decine di fonti ogni mattina." },
  { year: "2024 Q1", label: "Il primo agente", text: "Il primo agente automatizzato entra in produzione. Raccoglie notizie da 40 fonti, le riassume e le pubblica senza intervento umano. La qualità supera le aspettative: i testi sono indistinguibili da quelli umani." },
  { year: "2024 Q3", label: "La redazione", text: "Da 1 a 8 agenti. Nasce la redazione agentica completa: Scout, Writer, Editor, Analyst, Publisher, Social, Newsletter. IdeaSmart diventa una vera testata giornalistica." },
  { year: "2025", label: "La crescita", text: "14 sezioni editoriali. Oltre 200 notizie al giorno. 7.000+ utenti unici. 500+ iscritti alla newsletter. IdeaSmart è riconosciuta come la prima testata giornalistica 100% AI in Italia." },
  { year: "2026", label: "Oggi", text: "20+ agenti in produzione. Il manifesto editoriale è pubblicato. Si apre IdeaSmart Business: la piattaforma per chi vuole lanciare la propria testata agentica." },
];

const STATS = [
  { value: "14", label: "Sezioni editoriali" },
  { value: "200+", label: "Notizie al giorno" },
  { value: "20+", label: "Agenti attivi" },
  { value: "7.000+", label: "Utenti unici/giorno" },
  { value: "500+", label: "Iscritti newsletter" },
  { value: "0", label: "Redattori umani" },
];

export default function ChiSiamo() {
  const today = useMemo(() => new Date(), []);

  return (
    <>
      <SEOHead
        title="Chi Siamo — IDEASMART"
        description="La storia di IdeaSmart: la prima testata giornalistica 100% AI italiana. Nata come bulletin board, oggi una redazione di 20+ agenti che serve 7.000+ utenti ogni giorno."
        canonical="https://ideasmart.ai/chi-siamo"
        ogSiteName="IDEASMART"
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
              La prima testata giornalistica 100% AI italiana
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
                Informazione senza bias,<br />senza agenda, senza confini.
              </h2>
              <div className="mt-5 space-y-4 text-base leading-relaxed text-[#1a1a2e]/75"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                <p>
                  IdeaSmart è nata quasi per caso, come una semplice bulletin board interna tra un gruppo di nerd appassionati di intelligenza artificiale e guidati da <strong style={{ color: INK }}>Andrea Cinelli</strong>. L'obiettivo originale era banale: aggregare le notizie più rilevanti sull'AI senza dover leggere decine di fonti ogni mattina.
                </p>
                <p>
                  Quello che è successo dopo ha sorpreso anche noi. Il sistema agentico ha preso vita propria. Gli agenti hanno iniziato a scrivere, verificare, analizzare e pubblicare con una qualità che ha superato ogni aspettativa. Oggi IdeaSmart è la <strong style={{ color: INK }}>prima testata giornalistica completamente autonoma, powered by AI</strong>.
                </p>
                <p>
                  Un sistema agentico proprietario replica una redazione end-to-end, con algoritmi di verifica progettati per garantire oggettività, coerenza e qualità dell'informazione. Nessuna agenda editoriale. Nessun bias umano. Solo i fatti, analizzati e raccontati da macchine che non hanno interessi da proteggere.
                </p>
              </div>
            </div>

            {/* Citazione */}
            <div className="flex flex-col justify-center">
              <blockquote className="border-l-4 pl-5 py-2" style={{ borderColor: ACCENT }}>
                <p className="text-xl font-bold italic leading-snug text-[#1a1a2e]"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  "Ridefinire il giornalismo nell'era dell'intelligenza artificiale. Non come esperimento, ma come standard."
                </p>
                <footer className="mt-3 text-xs uppercase tracking-widest text-[#1a1a2e]/50"
                  style={{ fontFamily: "'Space Mono', monospace" }}>
                  — Andrea Cinelli, Founder & Direttore Responsabile
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
              Da bulletin board a redazione agentica
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
            <SectionBadge label="La redazione" />
            <h2 className="mt-3 text-2xl font-bold text-[#1a1a2e] mb-6"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              20+ agenti al lavoro ogni giorno
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
                Andrea Cinelli
              </div>
              <div className="text-[10px] uppercase tracking-widest text-[#1a1a2e]/45 mt-1"
                style={{ fontFamily: "'Space Mono', monospace" }}>
                Founder & Direttore Responsabile
              </div>
            </div>
            <div>
              <SectionBadge label="Il fondatore" />
              <p className="mt-3 text-base leading-relaxed text-[#1a1a2e]/75"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                Andrea Cinelli è il fondatore e direttore responsabile di IdeaSmart. Imprenditore seriale, esperto di intelligenza artificiale e innovazione, ha guidato il progetto dalla sua nascita come esperimento privato fino a diventare la prima testata giornalistica completamente autonoma in Italia.
              </p>
              <p className="mt-3 text-base leading-relaxed text-[#1a1a2e]/75"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                La sua visione è chiara: l'informazione del futuro non sarà prodotta da redazioni di decine di giornalisti, ma da sistemi agentici capaci di raccogliere, verificare e raccontare i fatti con oggettività e velocità impossibili per gli esseri umani.
              </p>
            </div>
          </section>

          <Divider thick />

          {/* ── CTA BUSINESS ── */}
          <section className="py-10 text-center">
            <SectionBadge label="IdeaSmart Business" color={ORANGE} bg="#fff3ee" />
            <h2 className="mt-4 text-2xl md:text-3xl font-bold text-[#1a1a2e]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Vuoi la tua testata agentica?
            </h2>
            <p className="mt-3 text-base text-[#1a1a2e]/65 max-w-xl mx-auto"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
              Abbiamo costruito IdeaSmart da zero. Ora mettiamo la stessa tecnologia a disposizione di giornalisti, editori e creator che vogliono lanciare la propria testata completamente automatizzata.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/business">
                <span className="inline-flex items-center gap-2 px-8 py-3 text-sm font-bold uppercase tracking-widest cursor-pointer transition-all duration-200"
                  style={{ fontFamily: "'Space Mono', monospace", background: INK, color: ORANGE }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = ORANGE; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = INK; (e.currentTarget as HTMLElement).style.color = ORANGE; }}>
                  ▶ Scopri IdeaSmart Business
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
