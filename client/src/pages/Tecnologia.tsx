import SharedPageHeader from "@/components/SharedPageHeader";
/**
 * IDEASMART — Tecnologia
 * Layout editoriale coerente con le pagine sezione del sito.
 * Palette: bianco carta (#ffffff), inchiostro (#1a1a1a), accento teal (#1a1a1a).
 * Tipografia: SF Pro Display (titoli), SF Pro Text (corpo) — sistema Apple.
 */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import LeftSidebar from "@/components/LeftSidebar";

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
    <span
      className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm"
      style={{ background: bg, color, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
    >
      {label}
    </span>
  );
}

// ─── Dati ────────────────────────────────────────────────────────────────────

const STATS = [
  { value: "450+", label: "Fonti monitorate" },
  { value: "~1.200", label: "Articoli analizzati/giorno" },
  { value: "63%", label: "Contenuti scartati" },
  { value: "6", label: "Dimensioni di verifica" },
  { value: "5", label: "Agenti nel flusso" },
  { value: "0", label: "Redattori umani" }
];

const AGENTS = [
  { name: "Scouting Agent", role: "Intercetta le notizie dalla rete globale in tempo reale, monitorando oltre 450 fonti RSS e feed specializzati.", icon: "◎" },
  { name: "Verify Agent", role: "Analizza e valida ogni contenuto su sei dimensioni di qualità informativa. Il cuore del sistema.", icon: "⬡" },
  { name: "Balancing Agent", role: "Riequilibra bias e distorsioni narrative, garantendo pluralità di prospettive su ogni argomento.", icon: "⊖" },
  { name: "Synthesis Agent", role: "Costruisce articoli chiari, leggibili e informativamente densi a partire dai contenuti validati.", icon: "◈" },
  { name: "Publishing Agent", role: "Distribuisce i contenuti in tempo reale su tutti i canali editoriali, con metadati e categorizzazione automatica.", icon: "▷" }
];

const VERIFY_DIMS = [
  { n: "01", label: "Attendibilità della fonte", desc: "Storico editoriale, autorevolezza, track record di accuratezza" },
  { n: "02", label: "Coerenza tra fonti multiple", desc: "Cross-validazione su almeno tre fonti indipendenti" },
  { n: "03", label: "Neutralità del linguaggio", desc: "Analisi semantica per rilevare carica emotiva e framing" },
  { n: "04", label: "Bilanciamento delle prospettive", desc: "Presenza di punti di vista contrapposti sullo stesso fatto" },
  { n: "05", label: "Livello di distorsione narrativa", desc: "Rilevamento di omissioni, enfasi selettive e agenda implicita" },
  { n: "06", label: "Presenza di agenda implicita", desc: "Identificazione di interessi economici o politici sottostanti" }
];

const PROCESS_STEPS = [
  { n: "01", title: "Raccolta massiva", desc: "Migliaia di fonti analizzate in tempo reale da 14 verticali tematici." },
  { n: "02", title: "Validazione algoritmica", desc: "Verify confronta, incrocia e pesa ogni contenuto su sei dimensioni." },
  { n: "03", title: "Riduzione del rumore", desc: "Eliminazione automatica di contenuti distorti o sotto soglia qualitativa." },
  { n: "04", title: "Sintesi intelligente", desc: "Generazione di articoli chiari, oggettivi e informativamente densi." },
  { n: "05", title: "Distribuzione", desc: "Informazione filtrata, categorizzata e pronta per ogni canale editoriale." }
];

// ─── Diagramma processo interattivo ─────────────────────────────────────────

const PROCESS_DETAILS = [
  {
    n: "01",
    title: "Raccolta massiva",
    desc: "Migliaia di fonti analizzate in tempo reale da 14 verticali tematici.",
    detail: "Lo Scouting Agent monitora continuamente oltre 450 feed RSS, API di notizie e fonti specializzate. Ogni ora vengono analizzati migliaia di segnali provenienti da tutto il mondo, filtrati per lingua, rilevanza e freschezza.",
    icon: "◎",
    stat: "450+ fonti",
  },
  {
    n: "02",
    title: "Validazione algoritmica",
    desc: "Verify confronta, incrocia e pesa ogni contenuto su sei dimensioni.",
    detail: "Il Verify Agent assegna a ogni contenuto un punteggio dinamico su sei dimensioni: attendibilità della fonte, coerenza multi-fonte, neutralità del linguaggio, bilanciamento delle prospettive, distorsione narrativa e agenda implicita. Solo i contenuti sopra soglia proseguono.",
    icon: "⬡",
    stat: "6 dimensioni",
  },
  {
    n: "03",
    title: "Riduzione del rumore",
    desc: "Eliminazione automatica di contenuti distorti o sotto soglia qualitativa.",
    detail: "Il 63% dei contenuti analizzati viene scartato automaticamente. Vengono eliminati duplicati, contenuti con punteggio Verify insufficiente, notizie non verificabili su almeno tre fonti indipendenti e contenuti con carica emotiva eccessiva.",
    icon: "⊖",
    stat: "63% scartati",
  },
  {
    n: "04",
    title: "Sintesi intelligente",
    desc: "Generazione di articoli chiari, oggettivi e informativamente densi.",
    detail: "Il Synthesis Agent trasforma i contenuti validati in articoli leggibili, con struttura editoriale coerente, titoli ottimizzati e sintesi informativa. Il linguaggio viene calibrato per massimizzare la chiarezza senza sacrificare la densità informativa.",
    icon: "◈",
    stat: "~1.200/giorno",
  },
  {
    n: "05",
    title: "Distribuzione",
    desc: "Informazione filtrata, categorizzata e pronta per ogni canale editoriale.",
    detail: "Il Publishing Agent distribuisce i contenuti sui 14 canali tematici di Proof Press, assegna metadati, categorie e tag, e ottimizza la presentazione per ogni contesto: homepage, newsletter, feed RSS, API. Tutto in tempo reale, senza intervento umano.",
    icon: "▷",
    stat: "14 canali",
  }
];

function ProcessDiagram() {
  const [active, setActive] = useState<number>(0);
  const step = PROCESS_DETAILS[active];

  return (
    <section className="py-10">
      <SectionBadge label="Il processo" />
      <h2
        className="mt-3 text-2xl font-bold text-[#1a1a1a] mb-8"
        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
      >
        Come funziona Proof Press
      </h2>

      {/* Diagramma desktop: flow orizzontale */}
      <div className="hidden md:block">
        {/* Step bar */}
        <div className="flex items-stretch relative">
          {PROCESS_DETAILS.map((s, i) => (
            <button
              key={s.n}
              onClick={() => setActive(i)}
              className="flex-1 text-left transition-all cursor-pointer group"
              style={{
                borderTop: `3px solid ${active === i ? "#1a1a1a" : "rgba(26,26,46,0.15)"}`,
                paddingTop: "1rem",
                paddingRight: i < PROCESS_DETAILS.length - 1 ? "1.5rem" : "0",
                background: "transparent",
                border: "none",
                outline: "none",
              }}
            >
              <div
                className="text-[10px] font-bold uppercase tracking-widest mb-1"
                style={{
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
                  color: active === i ? "#1a1a1a" : "rgba(26,26,46,0.35)",
                }}
              >
                {s.n}
              </div>
              <div
                className="text-sm font-bold leading-tight"
                style={{
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
                  color: active === i ? "#1a1a1a" : "rgba(26,26,46,0.5)",
                }}
              >
                {s.title}
              </div>
              <div
                className="mt-1 text-[10px] uppercase tracking-widest"
                style={{
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
                  color: active === i ? "#1a1a1a" : "rgba(26,26,46,0.25)",
                }}
              >
                {s.stat}
              </div>
            </button>
          ))}
        </div>

        {/* Dettaglio step attivo */}
        <div
          className="mt-6 grid grid-cols-[auto_1fr] gap-8 p-6"
          style={{ background: "#f0faf7", borderLeft: "4px solid #1a1a1a" }}
        >
          <div
            className="text-4xl font-black text-[#1a1a1a] w-12 text-center leading-none"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
          >
            {step.icon}
          </div>
          <div>
            <p
              className="text-lg font-bold text-[#1a1a1a] mb-2"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
            >
              {step.title}
            </p>
            <p
              className="text-base leading-relaxed text-[#1a1a1a]/75"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}
            >
              {step.detail}
            </p>
          </div>
        </div>

        {/* Frecce di navigazione */}
        <div className="flex justify-between mt-4">
          <button
            onClick={() => setActive((a) => Math.max(0, a - 1))}
            disabled={active === 0}
            className="text-xs font-bold uppercase tracking-widest disabled:opacity-20 transition-opacity hover:opacity-60"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", color: "#1a1a1a", background: "none", border: "none", cursor: active === 0 ? "default" : "pointer" }}
          >
            ← Precedente
          </button>
          <div className="flex gap-2 items-center">
            {PROCESS_DETAILS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  background: active === i ? "#1a1a1a" : "rgba(26,26,46,0.20)",
                  border: "none",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
          <button
            onClick={() => setActive((a) => Math.min(PROCESS_DETAILS.length - 1, a + 1))}
            disabled={active === PROCESS_DETAILS.length - 1}
            className="text-xs font-bold uppercase tracking-widest disabled:opacity-20 transition-opacity hover:opacity-60"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", color: "#1a1a1a", background: "none", border: "none", cursor: active === PROCESS_DETAILS.length - 1 ? "default" : "pointer" }}
          >
            Successivo →
          </button>
        </div>
      </div>

      {/* Mobile: accordion verticale */}
      <div className="md:hidden space-y-0">
        {PROCESS_DETAILS.map((s, i) => (
          <div key={s.n}>
            <button
              onClick={() => setActive(active === i ? -1 : i)}
              className="w-full text-left py-4 flex items-center justify-between"
              style={{ background: "none", border: "none", cursor: "pointer", borderTop: "1px solid rgba(26,26,46,0.12)" }}
            >
              <div className="flex items-center gap-4">
                <span
                  className="text-[10px] font-bold uppercase tracking-widest w-8"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", color: active === i ? "#1a1a1a" : "rgba(26,26,46,0.35)" }}
                >
                  {s.n}
                </span>
                <span
                  className="text-sm font-bold"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif", color: active === i ? "#1a1a1a" : "rgba(26,26,46,0.65)" }}
                >
                  {s.title}
                </span>
              </div>
              <span
                className="text-xs"
                style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              >
                {active === i ? "−" : "+"}
              </span>
            </button>
            {active === i && (
              <div
                className="pb-4 pl-12 pr-2"
                style={{ borderTop: "1px solid rgba(10,110,92,0.2)" }}
              >
                <p
                  className="pt-3 text-sm leading-relaxed text-[#1a1a1a]/70"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}
                >
                  {s.detail}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Tecnologia() {
  const today = useMemo(() => new Date(), []);

  return (
    <div className="flex min-h-screen">
      <LeftSidebar />
      <div className="flex-1 min-w-0">
      <SEOHead
        title="Tecnologia — Proof Press"
        description="Come funziona Proof Press: la piattaforma editoriale agentica con Verify, l'algoritmo proprietario che valida ogni notizia su sei dimensioni di qualità informativa."
        canonical="https://proofpress.ai/tecnologia"
        ogSiteName="Proof Press"
      />
      <style>{`
        /* SF Pro system font — no external loading needed */
      `}</style>
      <div className="min-h-screen" style={{ background: "#ffffff", color: INK }}>

        {/* ── TESTATA ── */}
        <SharedPageHeader />

        <BreakingNewsTicker />

        {/* ── CORPO ── */}
        <main className="max-w-6xl mx-auto px-4 pb-16">

          {/* ── INTRO ── */}
          <section className="py-10 grid md:grid-cols-[2fr_1fr] gap-10">
            <div>
              <SectionBadge label="La piattaforma" />
              <h2
                className="mt-3 text-3xl md:text-4xl font-bold leading-tight text-[#1a1a1a]"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
              >
                La prima testata editoriale completamente agentica.
              </h2>
              <div
                className="mt-5 space-y-4 text-base leading-relaxed text-[#1a1a1a]/75"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}
              >
                <p>
                  Proof Press non è una redazione tradizionale. È un sistema autonomo composto da agenti AI specializzati che replicano — e migliorano — il lavoro di una newsroom. Ogni notizia viene raccolta, verificata, bilanciata, sintetizzata e pubblicata senza intervento umano diretto.
                </p>
                <p>
                  Non perché l'uomo non serva. Ma perché vogliamo eliminare i suoi bias. La differenza tra Proof Press e il giornalismo tradizionale è semplice: <strong style={{ color: INK }}>loro interpretano, noi misuriamo.</strong> L'informazione non è più soggettiva. Diventa un output calcolato.
                </p>
                <p>
                  Al centro di tutto c'è <strong style={{ color: ACCENT }}>Verify</strong>, il nostro algoritmo proprietario: il sistema che analizza, valida e pesa ogni contenuto prima che raggiunga il lettore.
                </p>
              </div>
            </div>

            {/* Citazione */}
            <div className="flex flex-col justify-center">
              <blockquote className="border-l-4 pl-5 py-2" style={{ borderColor: ACCENT }}>
                <p
                  className="text-xl font-bold italic leading-snug text-[#1a1a1a]"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
                >
                  "Non promettiamo neutralità. La costruiamo a livello architetturale."
                </p>
                <footer
                  className="mt-3 text-xs uppercase tracking-widest text-[#1a1a1a]/50"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                >
                  — Proof Press, Manifesto Editoriale
                </footer>
              </blockquote>
            </div>
          </section>

          <ThinDivider />

          {/* ── STATISTICHE ── */}
          <section className="py-8">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-0">
              {STATS.map((s, i) => (
                <div
                  key={i}
                  className="text-center py-5 px-3"
                  style={{ borderLeft: i > 0 ? "1px solid rgba(26,26,46,0.12)" : "none" }}
                >
                  <div
                    className="text-3xl font-black"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif", color: i === 5 ? ORANGE : INK }}
                  >
                    {s.value}
                  </div>
                  <div
                    className="mt-1 text-[9px] uppercase tracking-widest text-[#1a1a1a]/45"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <ThinDivider />

          {/* ── IL PROBLEMA ── */}
          <section className="py-10 grid md:grid-cols-[1fr_1fr] gap-10">
            <div>
              <SectionBadge label="Il problema" />
              <h2
                className="mt-3 text-2xl font-bold text-[#1a1a1a] mb-5"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
              >
                Oggi l'informazione è rotta.
              </h2>
              <div
                className="space-y-4 text-base leading-relaxed text-[#1a1a1a]/75"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}
              >
                <p>
                  Polarizzata, manipolata, rumorosa, inefficiente. La sovrabbondanza di contenuti non ha prodotto più chiarezza: ha prodotto più confusione. Non sai più cosa è vero, cosa è rilevante, a chi credere.
                </p>
                <p>
                  Proof Press elimina il problema alla radice: non scegliamo una narrativa. <strong style={{ color: INK }}>Costruiamo un sistema che le neutralizza tutte.</strong>
                </p>
              </div>
            </div>
            <div>
              <SectionBadge label="Il nostro approccio" />
              <h2
                className="mt-3 text-2xl font-bold text-[#1a1a1a] mb-5"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
              >
                Zero bias. Davvero.
              </h2>
              <div className="space-y-3">
                {[
                  { tag: "Humanless", desc: "Nessuna interferenza editoriale umana nel flusso di pubblicazione" },
                  { tag: "Agenda-free", desc: "Nessun interesse politico o economico che orienta la selezione" },
                  { tag: "Self-auditing", desc: "Ogni contenuto è verificato dal sistema stesso prima e dopo la pubblicazione" }
                ].map((item) => (
                  <div
                    key={item.tag}
                    className="flex gap-3 py-3"
                    style={{ borderBottom: "1px solid rgba(26,26,46,0.10)" }}
                  >
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm flex-shrink-0 h-fit mt-0.5"
                      style={{ background: ACCENT_LIGHT, color: ACCENT, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                    >
                      {item.tag}
                    </span>
                    <p
                      className="text-sm leading-relaxed text-[#1a1a1a]/70"
                      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}
                    >
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <ThinDivider />

          {/* ── LA REDAZIONE AGENTICA ── */}
          <section className="py-10">
            <SectionBadge label="Architettura" />
            <h2
              className="mt-3 text-2xl font-bold text-[#1a1a1a] mb-6"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
            >
              Una redazione completamente agentica
            </h2>
            <p
              className="text-base leading-relaxed text-[#1a1a1a]/65 mb-8 max-w-2xl"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}
            >
              Cinque agenti specializzati replicano — e migliorano — ogni fase del lavoro di una newsroom tradizionale, operando in sequenza senza interruzioni.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-5">
              {AGENTS.map((a, i) => (
                <div
                  key={i}
                  className="py-5 px-4"
                  style={{
                    borderLeft: i > 0 ? "1px solid rgba(26,26,46,0.10)" : "none",
                    borderTop: "1px solid rgba(26,26,46,0.10)",
                    borderBottom: "1px solid rgba(26,26,46,0.10)",
                  }}
                >
                  <div
                    className="text-xl mb-2 font-mono"
                    style={{ color: ACCENT }}
                  >
                    {a.icon}
                  </div>
                  <div
                    className="text-sm font-bold text-[#1a1a1a] mb-1"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                  >
                    {a.name}
                  </div>
                  <div
                    className="text-xs leading-relaxed text-[#1a1a1a]/55"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}
                  >
                    {a.role}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <ThinDivider />

          {/* ── VERIFY ── */}
          <section className="py-10">
            <SectionBadge label="Verify — Algoritmo proprietario" color={ACCENT} bg={ACCENT_LIGHT} />
            <h2
              className="mt-3 text-3xl md:text-4xl font-bold leading-tight text-[#1a1a1a] mb-4"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
            >
              Non verifichiamo le notizie. Le pesiamo.
            </h2>
            <p
              className="text-base leading-relaxed text-[#1a1a1a]/70 mb-8 max-w-2xl"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}
            >
              Verify è l'algoritmo proprietario che rappresenta il vero vantaggio competitivo di Proof Press. Ogni notizia riceve un <strong style={{ color: INK }}>punteggio dinamico di qualità informativa</strong> basato su sei dimensioni distinte. Solo i contenuti che superano la soglia entrano nel flusso editoriale.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {VERIFY_DIMS.map((dim, i) => (
                <div
                  key={dim.n}
                  className="py-5 px-0 flex gap-5"
                  style={{
                    borderTop: "1px solid rgba(26,26,46,0.10)",
                    borderRight: i % 2 === 0 ? "1px solid rgba(26,26,46,0.10)" : "none",
                    paddingRight: i % 2 === 0 ? "2rem" : "0",
                    paddingLeft: i % 2 === 1 ? "2rem" : "0",
                  }}
                >
                  <span
                    className="text-[10px] font-bold flex-shrink-0 w-8 text-right mt-0.5"
                    style={{ color: ACCENT, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                  >
                    {dim.n}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#1a1a1a] mb-1">{dim.label}</p>
                    <p
                      className="text-xs leading-relaxed text-[#1a1a1a]/55"
                      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}
                    >
                      {dim.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <ThinDivider />

          {/* ── VERIFY IN NUMERI ── */}
          <section className="py-10">
            <SectionBadge label="Verify in numeri" />
            <h2
              className="mt-3 text-2xl font-bold text-[#1a1a1a] mb-8"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
            >
              L'algoritmo al lavoro, ogni giorno
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mb-8">
              {[
                {
                  title: "Soglia qualitativa dinamica",
                  desc: "Il punteggio minimo per la pubblicazione si adatta al volume di fonti disponibili: in caso di breaking news con poche fonti, la soglia si abbassa per garantire tempestività senza sacrificare l'accuratezza.",
                },
                {
                  title: "Cross-validazione multi-fonte",
                  desc: "Ogni fatto viene incrociato su almeno 3 fonti indipendenti. Se la coerenza è sotto il 70%, il contenuto viene segnalato come 'non confermato' e pubblicato con disclaimer esplicito.",
                },
                {
                  title: "Audit continuo post-pubblicazione",
                  desc: "Verify non si ferma alla pubblicazione: monitora le correzioni e gli aggiornamenti delle fonti originali. Se un fatto viene smentito, il sistema aggiorna automaticamente l'articolo.",
                }
              ].map((item, i) => (
                <div
                  key={item.title}
                  className="py-5 px-5"
                  style={{
                    borderLeft: i > 0 ? "1px solid rgba(26,26,46,0.10)" : "none",
                    borderTop: "1px solid rgba(26,26,46,0.10)",
                    borderBottom: "1px solid rgba(26,26,46,0.10)",
                  }}
                >
                  <div
                    className="text-sm font-bold text-[#1a1a1a] mb-2"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                  >
                    {item.title}
                  </div>
                  <p
                    className="text-sm leading-relaxed text-[#1a1a1a]/60"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <ThinDivider />

          {/* ── COME FUNZIONA — DIAGRAMMA INTERATTIVO ── */}
          <ProcessDiagram />

          <ThinDivider />

          {/* ── VISION ── */}
          <section className="py-10 grid md:grid-cols-[2fr_1fr] gap-10">
            <div>
              <SectionBadge label="Vision" />
              <h2
                className="mt-3 text-2xl font-bold text-[#1a1a1a] mb-5"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
              >
                Costruire il primo layer di verità algoritmica globale
              </h2>
              <div
                className="space-y-4 text-base leading-relaxed text-[#1a1a1a]/75"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}
              >
                <p>
                  Vogliamo diventare l'infrastruttura di riferimento per l'informazione verificata: per utenti, per aziende, per piattaforme, per sistemi AI.
                </p>
                <p>
                  Proof Press non è un giornale, non è un blog, non è un aggregatore. È un <strong style={{ color: INK }}>sistema di validazione dell'informazione</strong>, un motore di verità computazionale, una newsroom autonoma. Non una testata. Un nuovo standard.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { label: "Per gli utenti", desc: "Informazione affidabile senza dover filtrare il rumore" },
                { label: "Per le aziende", desc: "Intelligence di mercato verificata e debiasata" },
                { label: "Per le piattaforme", desc: "Layer di validazione contenuti integrabile via API" },
                { label: "Per i sistemi AI", desc: "Dataset di training puliti e verificati algoritmicamente" }
              ].map((item) => (
                <div
                  key={item.label}
                  className="py-3"
                  style={{ borderBottom: "1px solid rgba(26,26,46,0.10)" }}
                >
                  <p
                    className="text-[10px] font-bold uppercase tracking-widest mb-1"
                    style={{ color: ACCENT, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                  >
                    {item.label}
                  </p>
                  <p
                    className="text-sm text-[#1a1a1a]/65"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <Divider thick />

          {/* ── CTA ── */}
          <section className="py-10 text-center">
            <SectionBadge label="Scopri Proof Press" color={ORANGE} bg="#fff3ee" />
            <h2
              className="mt-4 text-2xl md:text-3xl font-bold text-[#1a1a1a]"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
            >
              Vuoi capire come funziona davvero l'informazione senza filtri?
            </h2>
            <p
              className="mt-3 text-base text-[#1a1a1a]/65 max-w-xl mx-auto"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}
            >
              Esplora i 14 canali editoriali di Proof Press, iscriviti alla newsletter settimanale o scopri come collaborare con noi.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <span
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-widest cursor-pointer transition-all hover:opacity-80"
                  style={{
                    background: INK,
                    color: "#fff",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
                  }}
                >
                  Esplora Proof Press →
                </span>
              </Link>
              <Link href="/chi-siamo">
                <span
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-widest cursor-pointer transition-all hover:opacity-80 border border-[#1a1a1a]/20"
                  style={{
                    background: "transparent",
                    color: INK,
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
                  }}
                >
                  Chi siamo →
                </span>
              </Link>
              <Link href="/advertise">
                <span
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-widest cursor-pointer transition-all hover:opacity-80"
                  style={{
                    background: "#fff3ee",
                    color: ORANGE,
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
                  }}
                >
                  Collabora con noi →
                </span>
              </Link>
            </div>
          </section>

        </main>

        {/* ── FOOTER ── */}
        <footer
          className="border-t py-4"
          style={{ borderColor: "rgba(26,26,46,0.15)", background: "#ffffff" }}
        >
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p
              className="text-[11px]"
              style={{ color: "rgba(26,26,46,0.4)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
            >
              ProofPress Magazine è parte del gruppo{" "}
              <span style={{ fontWeight: 600, color: "rgba(26,26,46,0.55)" }}>AxiomX</span>
              {" · "}
              <a href="/privacy" style={{ color: "rgba(26,26,46,0.4)", textDecoration: "underline" }}>Privacy</a>
            </p>
          </div>
        </footer>

      </div>
      </div>
    </div>
  );
}
