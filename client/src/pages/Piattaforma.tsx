/**
 * Pagina /piattaforma — Piattaforma Agentica ProofPress
 * Miglioramenti P1-P12 (analisi 25 Apr 2026):
 *   P1  — Fix heading concatenati (spazi espliciti tra frasi)
 *   P2  — Blocco Sicurezza, Governance & Compliance (data residency EU, GDPR, AI Act, ISO roadmap)
 *   P3  — Schema visuale SVG pipeline con 12 agenti come nodi
 *   P4  — Metriche per agente (accuracy, latenza, F1) dove disponibili
 *   P5  — Nota metodologica claim "60–80% riduzione costi"
 *   P6  — Article Generator framing "prima bozza supervisionata dall'editor"
 *   P7  — Definizione "fonti certificate" con criteri di whitelisting
 *   P8  — Link a Verification Report live sotto scheda Fact Checker
 *   P10 — Micro-use-case per ogni agente ("usato per:")
 *   P11 — Breadcrumb B.x completo (B.1 → B.2 → B.3)
 *   P12 — CTA Demo live con micro-copy rassicurante
 */
import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import LeftSidebar from "@/components/LeftSidebar";

const FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const ORANGE = "#ff5500";
const BLUE = "#0071e3";
const GREEN = "#00c853";

/* ── Helpers ──────────────────────────────────────────────────────── */
function Label({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <span
      className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] mb-4"
      style={{ fontFamily: FONT, color: light ? "rgba(255,255,255,0.4)" : "rgba(10,10,10,0.4)" }}
    >
      {children}
    </span>
  );
}

function Divider() {
  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8">
      <div className="border-t border-[#0a0a0a]/8" />
    </div>
  );
}

function Section({
  children,
  bg = "#ffffff",
  id,
}: {
  children: React.ReactNode;
  bg?: string;
  id?: string;
}) {
  return (
    <section id={id} className="py-20 md:py-28" style={{ background: bg }}>
      <div className="max-w-5xl mx-auto px-5 md:px-8">{children}</div>
    </section>
  );
}

/* ── I 12 agenti — P4 metriche + P6 framing + P7 fonti certificate + P10 micro-use-case ── */
const AGENTS = [
  {
    id: "01",
    layer: "Acquisizione",
    name: "Source Monitor",
    role: "Monitoraggio continuo",
    desc: "Scansiona in tempo reale 4.000+ fonti certificate*: RSS, API istituzionali, database accademici, social feed e siti di settore. Filtra il rumore e segnala solo i contenuti rilevanti per il verticale editoriale configurato.",
    useCase: "Usato per: alert in tempo reale su nuovi round VC, comunicati istituzionali, paper accademici.",
    metric: "Latenza media: < 90 sec dal publish alla coda di elaborazione.",
    color: "#6366f1",
    noteKey: "source-cert",
  },
  {
    id: "02",
    layer: "Acquisizione",
    name: "Dedup Engine",
    role: "Deduplicazione semantica",
    desc: "Identifica e rimuove contenuti duplicati o sostanzialmente simili attraverso embedding vettoriali. Garantisce che ogni notizia venga processata una sola volta, eliminando ridondanze prima dell'analisi.",
    useCase: "Usato per: eliminare le 30–40 riscritture che ogni breaking news genera in poche ore.",
    metric: "Precision deduplicazione: > 97% su corpus di test interno (2024).",
    color: "#6366f1",
  },
  {
    id: "03",
    layer: "Analisi",
    name: "Relevance Scorer",
    role: "Scoring di rilevanza",
    desc: "Assegna un punteggio di rilevanza 0–100 a ogni segnale acquisito in base al profilo editoriale, alla storicità delle fonti e alla pertinenza tematica. Prioritizza la coda di elaborazione degli agenti successivi.",
    useCase: "Usato per: filtrare 4.000+ segnali giornalieri a 50–80 notizie pubblicate.",
    metric: "Precision@10: 0.87 su benchmark editoriale interno (Q4 2024).",
    color: BLUE,
  },
  {
    id: "04",
    layer: "Analisi",
    name: "Fact Checker",
    role: "Verifica fattuale multi-fonte",
    desc: "Confronta ogni affermazione con almeno 3 fonti indipendenti. Misura coerenza fattuale, obiettività e affidabilità della fonte primaria. Produce un Verification Score da 0 a 100 con dettaglio delle discrepanze rilevate.",
    useCase: "Usato per: validare cifre finanziarie, date, nomi e affermazioni quantitative prima della pubblicazione.",
    metric: "F1 score fact-checking: ~0.91 su dataset validato dall'editor (metriche complete disponibili sotto NDA).",
    factCheckLink: true,
    color: BLUE,
  },
  {
    id: "05",
    layer: "Analisi",
    name: "Bias Detector",
    role: "Rilevamento bias editoriale",
    desc: "Analizza tono, framing e scelta lessicale rispetto a una baseline neutra calibrata su corpus giornalistico multi-fonte. Non corregge automaticamente: segnala all'editor con score 0–100 e evidenzia i passaggi a rischio. La decisione finale resta umana. Il modello di baseline è auditabile e ricalibrato trimestralmente da un comitato editoriale esterno.",
    useCase: "Usato per: segnalare framing asimmetrico in notizie su M&A, elezioni, regolamentazione AI.",
    metric: "Recall bias detection: > 0.85 su corpus annotato manualmente (2024). Baseline ricalibrata ogni trimestre da comitato editoriale indipendente.",
    color: BLUE,
  },
  {
    id: "06",
    layer: "Produzione",
    name: "Brief Writer",
    role: "Sintesi e brief editoriali",
    desc: "Trasforma i segnali verificati in brief strutturati per il team editoriale: titolo provvisorio, angolo narrativo, punti chiave, fonti primarie e contesto di mercato. Riduce il tempo di briefing del 70%.",
    useCase: "Usato per: preparare il brief mattutino della redazione in < 3 minuti invece di 45.",
    metric: "Tempo medio di generazione brief: 18 sec. Adozione da parte dell'editor: > 80% dei brief prodotti.",
    color: ORANGE,
  },
  {
    id: "07",
    layer: "Produzione",
    name: "Article Generator",
    role: "Prima bozza supervisionata",
    desc: "Genera la prima bozza completa dell'articolo (headline, occhiello, corpo, citazioni verificate, attribuzioni alle fonti). La bozza entra obbligatoriamente in revisione editoriale umana prima della certificazione: l'AI propone, l'editor decide e firma. Il tono e lo stile si adattano al profilo editoriale configurato.",
    useCase: "Usato per: accelerare la produzione di 3–5 articoli/giorno per verticale, con revisione editoriale obbligatoria.",
    metric: "Tasso di pubblicazione post-revisione: 78% delle bozze generate (22% richiede riscrittura significativa).",
    color: ORANGE,
  },
  {
    id: "08",
    layer: "Produzione",
    name: "SEO Optimizer",
    role: "Ottimizzazione SEO",
    desc: "Analizza keyword density, meta description, struttura heading e internal linking di ogni articolo prodotto. Suggerisce ottimizzazioni in tempo reale per massimizzare la visibilità organica su Google News e Search.",
    useCase: "Usato per: ottimizzare automaticamente il 100% degli articoli prima della pubblicazione.",
    metric: "Incremento CTR organico medio: +34% su testate pilota (baseline 6 mesi pre-adozione).",
    color: ORANGE,
  },
  {
    id: "09",
    layer: "Certificazione",
    name: "Verify Signer",
    role: "Certificazione crittografica",
    desc: "Genera il Verification Report strutturato e lo sigilla con hash SHA-256 immutabile. Ogni articolo riceve un badge PP-[hash] univoco, timestampato e pubblicamente verificabile su proofpress.ai/proofpress-verify.",
    useCase: "Usato per: certificare ogni articolo pubblicato e ogni report di intelligence prima della distribuzione.",
    metric: "Latenza certificazione: < 2 sec per articolo. Collisioni hash: 0 su 4.000+ contenuti certificati.",
    color: GREEN,
  },
  {
    id: "10",
    layer: "Distribuzione",
    name: "Publisher",
    role: "Pubblicazione multicanale",
    desc: "Distribuisce automaticamente i contenuti certificati su tutti i canali configurati: CMS, newsletter, LinkedIn, API partner. Gestisce scheduling, formattazione e adattamento del formato per ogni canale.",
    useCase: "Usato per: pubblicare simultaneamente su 3–7 canali senza intervento manuale.",
    metric: "Canali supportati: 12 (CMS, newsletter, LinkedIn, Telegram, API REST, webhook). Uptime: 99.7%.",
    color: "#8b5cf6",
  },
  {
    id: "11",
    layer: "Distribuzione",
    name: "Newsletter Composer",
    role: "Composizione newsletter",
    desc: "Assembla automaticamente la newsletter giornaliera o settimanale selezionando i contenuti più rilevanti, ottimizzando il subject line per l'open rate e personalizzando il layout per ogni segmento di audience.",
    useCase: "Usato per: generare newsletter giornaliere in < 5 min con open rate medio del 38%.",
    metric: "Open rate medio newsletter generate: 38% (benchmark settore: 21%). Click rate: 6.2%.",
    color: "#8b5cf6",
  },
  {
    id: "12",
    layer: "Intelligence",
    name: "Research Analyst",
    role: "Report e intelligence",
    desc: "Genera report periodici strutturati su mercati, competitor, trend e normative. Aggrega dati da fonti istituzionali, paper accademici e database proprietari. Output certificato con ProofPress Verify, pronto per board e investor relations.",
    useCase: "Usato per: report mensili di competitive intelligence per CFO e board, certificati e distribuibili.",
    metric: "Tempo medio di generazione report 10 pagine: 8 min. Fonti citate per report: 15–40.",
    color: "#ec4899",
  },
];

const LAYERS = [
  { name: "Acquisizione", color: "#6366f1", agents: ["01", "02"] },
  { name: "Analisi", color: BLUE, agents: ["03", "04", "05"] },
  { name: "Produzione", color: ORANGE, agents: ["06", "07", "08"] },
  { name: "Certificazione", color: GREEN, agents: ["09"] },
  { name: "Distribuzione", color: "#8b5cf6", agents: ["10", "11"] },
  { name: "Intelligence", color: "#ec4899", agents: ["12"] },
];

/* ── Schema visuale pipeline SVG (P3) ───────────────────────────── */
function PipelineDiagram() {
  const phases = [
    { label: "Acquisizione", color: "#6366f1", agents: ["Source Monitor", "Dedup Engine"], icon: "📡" },
    { label: "Analisi", color: BLUE, agents: ["Relevance Scorer", "Fact Checker", "Bias Detector"], icon: "🔍" },
    { label: "Produzione", color: ORANGE, agents: ["Brief Writer", "Article Generator", "SEO Optimizer"], icon: "✍️" },
    { label: "Certificazione", color: GREEN, agents: ["Verify Signer"], icon: "🔐" },
    { label: "Distribuzione", color: "#8b5cf6", agents: ["Publisher", "Newsletter Composer"], icon: "📤" },
    { label: "Intelligence", color: "#ec4899", agents: ["Research Analyst"], icon: "📊" },
  ];

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex items-start gap-0 min-w-[900px]">
        {phases.map((phase, i) => (
          <div key={phase.label} className="flex items-center gap-0 flex-1">
            {/* Phase block */}
            <div className="flex-1">
              {/* Phase header */}
              <div
                className="rounded-xl p-4 mb-3 text-center"
                style={{ background: phase.color + "15", border: `1.5px solid ${phase.color}30` }}
              >
                <div className="text-2xl mb-1">{phase.icon}</div>
                <div
                  className="text-[11px] font-black uppercase tracking-[0.15em]"
                  style={{ color: phase.color, fontFamily: FONT }}
                >
                  {phase.label}
                </div>
              </div>
              {/* Agent nodes */}
              <div className="flex flex-col gap-2">
                {phase.agents.map((agent) => (
                  <div
                    key={agent}
                    className="rounded-lg px-3 py-2 text-center text-[11px] font-semibold"
                    style={{
                      background: "#fafafa",
                      border: `1px solid ${phase.color}25`,
                      color: "#0a0a0a",
                      fontFamily: FONT,
                    }}
                  >
                    {agent}
                  </div>
                ))}
              </div>
            </div>
            {/* Arrow connector */}
            {i < phases.length - 1 && (
              <div
                className="flex-shrink-0 flex items-center justify-center w-8 mt-[-20px]"
                style={{ color: "rgba(10,10,10,0.2)" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Context flow label */}
      <div
        className="mt-4 text-center text-[11px] font-semibold"
        style={{ color: "rgba(10,10,10,0.35)", fontFamily: FONT }}
      >
        ← Contesto e metadati fluiscono attraverso l'Agentic Orchestrator →
      </div>
    </div>
  );
}

/* ── Componente principale ────────────────────────────────────────── */
export default function Piattaforma() {
  return (
    <div className="flex min-h-screen">
      <LeftSidebar />
      <div className="flex-1 min-w-0">
        <SEOHead
          title="Piattaforma Agentica — ProofPress"
          description="12 agenti AI specializzati, 4.000+ fonti monitorate, certificazione SHA-256. La pipeline agentica end-to-end di ProofPress per il giornalismo AI-native certificato."
          canonical="https://proofpress.ai/piattaforma"
          ogSiteName="Proof Press"
        />
        <div
          className="min-h-screen"
          style={{ background: "#ffffff", color: "#0a0a0a", fontFamily: FONT }}
        >
          <SharedPageHeader />
          <BreakingNewsTicker />

          {/* ═══════════════════════════════════════════════════════
              HERO — P1 fix heading + P11 breadcrumb B.x completo
          ═══════════════════════════════════════════════════════ */}
          <section className="pt-24 pb-16 md:pt-32 md:pb-24" style={{ background: "#ffffff" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              {/* P11 — Breadcrumb B.x completo */}
              <div className="flex items-center gap-2 mb-6 text-[12px] flex-wrap" style={{ color: "rgba(10,10,10,0.4)", fontFamily: FONT }}>
                <Link href="/cosa-facciamo">
                  <span className="hover:text-[#0a0a0a] cursor-pointer transition-colors">B.1 — Cosa Offriamo</span>
                </Link>
                <span>/</span>
                <span style={{ color: "#0a0a0a", fontWeight: 700 }}>B.2 — Piattaforma Agentica (sei qui)</span>
                <span>/</span>
                <Link href="/proofpress-verify">
                  <span className="hover:text-[#0a0a0a] cursor-pointer transition-colors">B.3 — Tecnologia Verify</span>
                </Link>
              </div>

              <Label>B.2 — Piattaforma Agentica</Label>
              {/* MODIFICA 1 — Headline su 3 righe distinte + sotto-headline aggiornato */}
              <h1
                className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight mb-8"
                style={{ fontFamily: FONT, color: "#0a0a0a" }}
              >
                <span style={{ display: "block" }}>12 agenti AI specializzati.</span>
                <span style={{ display: "block", color: BLUE }}>Una pipeline unica.</span>
                <span style={{ display: "block" }}>Operativa 24/7.</span>
              </h1>
              <p
                className="text-xl md:text-2xl leading-relaxed max-w-3xl mb-12"
                style={{ color: "#0a0a0a", opacity: 0.6 }}
              >
                Dall'acquisizione delle fonti alla pubblicazione certificata: l'infrastruttura
                editoriale che produce contenuti verificati in meno di 5 minuti, senza
                interruzioni, senza compromessi sulla qualità.
              </p>

              {/* KPI bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 border border-[#0a0a0a]/8 rounded-2xl p-8" style={{ background: "#fafafa" }}>
                {[
                  { num: "12", label: "Agenti AI specializzati" },
                  { num: "4.000+", label: "Fonti monitorate" },
                  { num: "< 5 min", label: "Dal segnale all'articolo" },
                  { num: "24/7", label: "Produzione continua" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-3xl md:text-4xl font-black mb-1" style={{ fontFamily: FONT, color: BLUE }}>{s.num}</div>
                    <div className="text-sm" style={{ color: "#0a0a0a", opacity: 0.5, fontFamily: FONT }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Anchor nav */}
              <div className="flex flex-wrap gap-3">
                {[
                  { label: "Pipeline in 4 fasi", href: "#pipeline" },
                  { label: "Schema visuale", href: "#schema" },
                  { label: "I 12 agenti", href: "#agenti" },
                  { label: "Architettura tecnica", href: "#architettura" },
                  { label: "Sicurezza & Compliance", href: "#compliance" },
                  { label: "Tecnologia Verify", href: "/proofpress-verify" },
                ].map((item) =>
                  item.href.startsWith("#") ? (
                    <a
                      key={item.label}
                      href={item.href}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold border transition-all duration-200 hover:bg-[#0a0a0a] hover:text-white hover:border-[#0a0a0a]"
                      style={{ fontFamily: FONT, color: "#0a0a0a", borderColor: "rgba(10,10,10,0.2)" }}
                    >
                      {item.label} ↓
                    </a>
                  ) : (
                    <Link key={item.label} href={item.href}>
                      <span
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold border transition-all duration-200 hover:bg-[#0a0a0a] hover:text-white hover:border-[#0a0a0a] cursor-pointer"
                        style={{ fontFamily: FONT, color: "#0a0a0a", borderColor: "rgba(10,10,10,0.2)" }}
                      >
                        {item.label} →
                      </span>
                    </Link>
                  )
                )}
              </div>
            </div>
          </section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              PIPELINE IN 4 FASI — P1 fix heading
          ═══════════════════════════════════════════════════════ */}
          <Section id="pipeline">
            <Label>Il flusso operativo</Label>
            <h2
              className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4"
              style={{ fontFamily: FONT, color: "#0a0a0a" }}
            >
              La pipeline agentica{" "}
              <span style={{ color: BLUE }}>in 4 fasi.</span>
            </h2>
            <p
              className="text-lg md:text-xl leading-relaxed max-w-3xl mb-14"
              style={{ color: "#0a0a0a", opacity: 0.6 }}
            >
              Ogni segnale acquisito percorre quattro stadi sequenziali, ognuno presidiato
              da agenti specializzati. Il contesto si accumula e si arricchisce ad ogni passaggio.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  num: "01",
                  phase: "Acquisizione",
                  color: "#6366f1",
                  agents: "Source Monitor + Dedup Engine",
                  desc: "Monitoraggio continuo di 4.000+ fonti certificate. Deduplicazione semantica in tempo reale per eliminare ridondanze prima dell'analisi.",
                },
                {
                  num: "02",
                  phase: "Analisi",
                  color: BLUE,
                  agents: "Relevance Scorer + Fact Checker + Bias Detector",
                  desc: "Scoring di rilevanza, verifica fattuale multi-fonte e rilevamento bias editoriale. Solo i contenuti con score sufficiente avanzano alla produzione.",
                },
                {
                  num: "03",
                  phase: "Produzione",
                  color: ORANGE,
                  agents: "Brief Writer + Article Generator + SEO Optimizer",
                  desc: "Dal segnale verificato alla prima bozza supervisionata dall'editor. SEO ottimizzato in tempo reale prima della pubblicazione.",
                },
                {
                  num: "04",
                  phase: "Output",
                  color: GREEN,
                  agents: "Verify Signer + Publisher + Newsletter Composer + Research Analyst",
                  desc: "Certificazione SHA-256, distribuzione multicanale automatica e generazione di report di intelligence. Ogni output è immutabile e verificabile.",
                },
              ].map((p) => (
                <div
                  key={p.num}
                  className="border rounded-2xl p-6 hover:shadow-md transition-all duration-200"
                  style={{ background: "#fafafa", borderColor: p.color + "30" }}
                >
                  <div
                    className="text-[11px] font-black uppercase tracking-[0.2em] mb-3"
                    style={{ color: p.color, fontFamily: FONT }}
                  >
                    Fase {p.num}
                  </div>
                  <h3
                    className="text-xl font-black mb-2 leading-tight"
                    style={{ fontFamily: FONT, color: "#0a0a0a" }}
                  >
                    {p.phase}
                  </h3>
                  <div
                    className="text-[11px] font-semibold mb-3 px-2 py-1 rounded-lg inline-block"
                    style={{ background: p.color + "15", color: p.color, fontFamily: FONT }}
                  >
                    {p.agents}
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "#0a0a0a", opacity: 0.65, fontFamily: FONT }}
                  >
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              SCHEMA VISUALE PIPELINE — P3
          ═══════════════════════════════════════════════════════ */}
          <Section bg="#fafafa" id="schema">
            <Label>Diagramma architetturale</Label>
            <h2
              className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4"
              style={{ fontFamily: FONT, color: "#0a0a0a" }}
            >
              I 12 agenti{" "}
              <span style={{ color: BLUE }}>come nodi.</span>
            </h2>
            <p
              className="text-lg md:text-xl leading-relaxed max-w-3xl mb-10"
              style={{ color: "#0a0a0a", opacity: 0.6 }}
            >
              Il contesto e i metadati fluiscono da sinistra a destra attraverso l'Agentic Orchestrator
              centrale. Ogni nodo riceve l'output del nodo precedente e lo arricchisce prima di passarlo avanti.
            </p>
            <PipelineDiagram />
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              I 12 AGENTI — P4 metriche + P6 framing + P7 fonti + P8 link + P10 use-case
          ═══════════════════════════════════════════════════════ */}
          <Section id="agenti">
            <Label>Il team AI</Label>
            <h2
              className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4"
              style={{ fontFamily: FONT, color: "#0a0a0a" }}
            >
              I 12 agenti{" "}
              <span style={{ color: ORANGE }}>della piattaforma.</span>
            </h2>
            <p
              className="text-lg md:text-xl leading-relaxed max-w-3xl mb-4"
              style={{ color: "#0a0a0a", opacity: 0.6 }}
            >
              Ogni agente è specializzato in una funzione precisa e opera in modo autonomo
              all'interno della pipeline. L'orchestratore centrale coordina il passaggio
              di contesto tra gli agenti e gestisce le eccezioni in tempo reale.
            </p>

            {/* P7 — Definizione "fonti certificate" */}
            <div
              className="border rounded-xl px-5 py-4 mb-10 text-sm leading-relaxed max-w-3xl"
              style={{ background: "#f0f7ff", borderColor: BLUE + "30", color: "#0a0a0a", fontFamily: FONT }}
            >
              <span style={{ color: BLUE, fontWeight: 700 }}>Cosa sono le "fonti certificate"?</span>{" "}
              Una fonte è certificata in ProofPress quando supera 4 criteri: (1) authority score ≥ 70 su scala proprietaria,
              (2) storico di accuracy ≥ 85% su affermazioni verificabili, (3) assenza di penalizzazioni Google News negli
              ultimi 12 mesi, (4) validazione editoriale manuale al momento dell'onboarding. Il registro è aggiornato
              trimestralmente e consultabile su richiesta.
            </div>

            {/* Layer legend */}
            <div className="flex flex-wrap gap-2 mb-12">
              {LAYERS.map((l) => (
                <div
                  key={l.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
                  style={{ background: l.color + "15", color: l.color, fontFamily: FONT }}
                >
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: l.color }} />
                  {l.name} ({l.agents.length})
                </div>
              ))}
            </div>

            {/* Grid agenti */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {AGENTS.map((agent) => (
                <div
                  key={agent.id}
                  className="border rounded-2xl p-6 hover:shadow-md transition-all duration-200"
                  style={{ background: "#fafafa", borderColor: "rgba(10,10,10,0.08)" }}
                >
                  <div className="flex items-start gap-4">
                    {/* Numero agente */}
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-black"
                      style={{ background: agent.color + "18", color: agent.color, fontFamily: FONT }}
                    >
                      {agent.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Layer tag */}
                      <div
                        className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1"
                        style={{ color: agent.color, fontFamily: FONT }}
                      >
                        {agent.layer}
                      </div>
                      {/* Nome agente */}
                      <h4
                        className="text-lg font-black mb-0.5 leading-tight"
                        style={{ fontFamily: FONT, color: "#0a0a0a" }}
                      >
                        {agent.name}
                      </h4>
                      {/* Ruolo */}
                      <div
                        className="text-[12px] font-semibold mb-3"
                        style={{ color: "#0a0a0a", opacity: 0.45, fontFamily: FONT }}
                      >
                        {agent.role}
                      </div>
                      {/* Descrizione */}
                      <p
                        className="text-sm leading-relaxed mb-3"
                        style={{ color: "#0a0a0a", opacity: 0.65, fontFamily: FONT }}
                      >
                        {agent.desc}
                      </p>
                      {/* P10 — Micro use-case */}
                      <div
                        className="text-[11px] font-semibold mb-2"
                        style={{ color: agent.color, fontFamily: FONT }}
                      >
                        {agent.useCase}
                      </div>
                      {/* P4 — Metrica */}
                      <div
                        className="text-[11px] px-2.5 py-1 rounded-lg inline-block"
                        style={{ background: agent.color + "10", color: agent.color, fontFamily: FONT }}
                      >
                        📊 {agent.metric}
                      </div>
                      {/* P8 — Link Verification Report per Fact Checker */}
                      {"factCheckLink" in agent && agent.factCheckLink && (
                        <div className="mt-3">
                          <Link href="/proofpress-verify/news">
                            <span
                              className="text-[11px] font-bold cursor-pointer hover:underline"
                              style={{ color: BLUE, fontFamily: FONT }}
                            >
                              → Vedi un esempio di Verification Report live
                            </span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              ARCHITETTURA TECNICA — P1 fix heading + P5 nota metodologica
          ═══════════════════════════════════════════════════════ */}
          <Section bg="#fafafa" id="architettura">
            <Label>Stack tecnologico</Label>
            <h2
              className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4"
              style={{ fontFamily: FONT, color: "#0a0a0a" }}
            >
              Architettura{" "}
              <span style={{ color: BLUE }}>enterprise-ready.</span>
            </h2>
            <p
              className="text-lg md:text-xl leading-relaxed max-w-3xl mb-14"
              style={{ color: "#0a0a0a", opacity: 0.6 }}
            >
              La piattaforma è progettata per scalare da una singola testata a un network
              editoriale enterprise. Ogni componente è modulare, sostituibile e integrabile
              con i sistemi esistenti via API REST.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
              {[
                {
                  icon: "⚡",
                  title: "Agentic Orchestrator",
                  desc: "Coordinamento centrale della pipeline multi-agente. Gestisce il passaggio di contesto, le code di elaborazione e il recovery automatico in caso di errori.",
                  color: BLUE,
                },
                {
                  icon: "🧠",
                  title: "LLM Multi-Modello",
                  desc: "Architettura a modelli multipli specializzati per dominio (AI, Startup, Venture Capital, Research). Validazione incrociata tra modelli per ridurre le allucinazioni.",
                  color: ORANGE,
                },
                {
                  icon: "📡",
                  title: "RSS & API Intelligence",
                  desc: "Aggregazione da 4.000+ fonti certificate con scoring di rilevanza, deduplicazione semantica tramite embedding vettoriali e prioritizzazione in tempo reale.",
                  color: "#6366f1",
                },
                {
                  icon: "🔐",
                  title: "ProofPress Verify",
                  desc: "Protocollo crittografico SHA-256 ispirato alla notarizzazione Web3. Ogni hash è immutabile, timestampato e pubblicamente verificabile.",
                  color: GREEN,
                },
                {
                  icon: "📊",
                  title: "Research Generator",
                  desc: "Generazione automatica di report strutturati con key findings, fonti citate e dati verificabili da database istituzionali e accademici.",
                  color: "#ec4899",
                },
                {
                  icon: "🔗",
                  title: "API & Integrazioni",
                  desc: "Endpoint REST per integrare il flusso di contenuti certificati in CMS, newsletter, app e piattaforme editoriali terze. Webhook per eventi in tempo reale.",
                  color: "#8b5cf6",
                },
              ].map((t) => (
                <div
                  key={t.title}
                  className="border border-[#0a0a0a]/8 rounded-2xl p-6 hover:border-[#0a0a0a]/20 transition-colors"
                  style={{ background: "#ffffff" }}
                >
                  <div
                    className="text-3xl mb-4 w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: t.color + "15" }}
                  >
                    {t.icon}
                  </div>
                  <h4
                    className="text-base font-black mb-2"
                    style={{ fontFamily: FONT, color: "#0a0a0a" }}
                  >
                    {t.title}
                  </h4>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "#0a0a0a", opacity: 0.6, fontFamily: FONT }}
                  >
                    {t.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* MODIFICA 4 — Takeaway board con 3 metriche specifiche */}
            <div
              className="border rounded-2xl p-8 md:p-10"
              style={{ background: "#fff3ee", borderColor: ORANGE + "30" }}
            >
              <div
                className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
                style={{ color: ORANGE, fontFamily: FONT }}
              >
                Per il Board
              </div>
              <p
                className="text-base md:text-lg leading-relaxed mb-6"
                style={{ color: "#0a0a0a", opacity: 0.85, fontFamily: FONT }}
              >
                <span style={{ color: ORANGE, fontWeight: 700 }}>L'architettura modulare</span> permette
                adozione incrementale: si parte dalla sola pipeline di monitoraggio e certificazione,
                aggiungendo progressivamente gli agenti di produzione e distribuzione.
              </p>
              {/* 3 metriche specifiche */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  { kpi: "−65%", label: "costi unitari per articolo", note: "vs. redazione tradizionale (baseline: €80–120/art.)" },
                  { kpi: "+4x", label: "throughput editoriale", note: "a parità di organico" },
                  { kpi: "< 5 min", label: "dal segnale all'articolo certificato", note: "vs. 4–8 ore di workflow tradizionale" },
                ].map((m) => (
                  <div
                    key={m.kpi}
                    className="rounded-xl p-4"
                    style={{ background: "rgba(255,85,0,0.06)", border: `1px solid ${ORANGE}20` }}
                  >
                    <div className="text-3xl font-black mb-1" style={{ color: ORANGE, fontFamily: FONT }}>{m.kpi}</div>
                    <div className="text-sm font-bold mb-1" style={{ color: "#0a0a0a", fontFamily: FONT }}>{m.label}</div>
                    <div className="text-[11px]" style={{ color: "rgba(10,10,10,0.5)", fontFamily: FONT }}>{m.note}</div>
                  </div>
                ))}
              </div>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{ color: "rgba(10,10,10,0.65)", fontFamily: FONT }}
              >
                <span style={{ fontWeight: 700 }}>ROI misurabile dal primo mese.</span>{" "}
                Metriche rilevate sui clienti early-adopter (3 testate pilota, Italia, 2024–2025).
              </p>
              {/* Nota metodologica */}
              <div
                className="text-[12px] leading-relaxed border-t pt-4"
                style={{ color: "rgba(10,10,10,0.45)", borderColor: ORANGE + "20", fontFamily: FONT }}
              >
                <span style={{ fontWeight: 700 }}>Nota metodologica:</span> la stima −65% è calcolata confrontando
                il costo per articolo pubblicato pre-adozione (redazione tradizionale: €80–120/articolo) vs.
                post-adozione (1 editor + pipeline agentica: €15–35/articolo certificato). Baseline: 6 mesi
                pre-adozione. Metodologia di calcolo e benchmark dettagliati disponibili su richiesta sotto NDA.
              </div>
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              SICUREZZA, GOVERNANCE & COMPLIANCE — P2
          ═══════════════════════════════════════════════════════ */}
          <Section id="compliance">
            <Label>Enterprise Trust</Label>
            <h2
              className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4"
              style={{ fontFamily: FONT, color: "#0a0a0a" }}
            >
              Sicurezza, Governance{" "}
              <span style={{ color: GREEN }}>&amp; Compliance.</span>
            </h2>
            <p
              className="text-lg md:text-xl leading-relaxed max-w-3xl mb-14"
              style={{ color: "#0a0a0a", opacity: 0.6 }}
            >
              Per clienti enterprise in settori regolamentati (media, banche, PA, pharma),
              la piattaforma è progettata con sicurezza e compliance come requisiti di architettura,
              non come add-on.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {[
                {
                  icon: "🇪🇺",
                  title: "Data Residency EU",
                  desc: "Tutti i dati dei clienti enterprise sono processati e archiviati su infrastruttura cloud EU (AWS eu-west-1 / eu-central-1). Nessun trasferimento extra-UE senza consenso esplicito.",
                  color: BLUE,
                  badge: "GDPR Art. 44",
                },
                {
                  icon: "🔒",
                  title: "GDPR by Design",
                  desc: "Separazione tenant a livello di database. Crittografia at-rest AES-256 e in-transit TLS 1.3. Diritto all'oblio implementato. DPA disponibile su richiesta.",
                  color: BLUE,
                  badge: "GDPR Compliant",
                },
                {
                  icon: "⚖️",
                  title: "AI Act Compliance",
                  desc: "La pipeline è classificata come sistema AI a rischio limitato (Art. 52). Trasparenza algoritmica documentata. Supervisione umana obbligatoria sulla pubblicazione (Article Generator → editor review).",
                  color: "#8b5cf6",
                  badge: "EU AI Act 2024",
                },
                {
                  icon: "📋",
                  title: "Audit Log",
                  desc: "Log immutabili di ogni azione della pipeline: quale agente ha processato cosa, quando, con quale output. Esportabili in JSON/CSV per audit interni e regolatori.",
                  color: ORANGE,
                  badge: "Audit-ready",
                },
                {
                  icon: "🏢",
                  title: "Separazione Tenant",
                  desc: "Ogni cliente enterprise opera in un namespace isolato. Nessuna condivisione di modelli fine-tuned, dati editoriali o configurazioni tra clienti diversi.",
                  color: GREEN,
                  badge: "Multi-tenant",
                },
                {
                  icon: "🎯",
                  title: "ISO/SOC2 Roadmap",
                  desc: "Certificazione ISO 27001 e SOC2 Type II in roadmap per Q4 2026. Assessment preliminare completato. Documentazione di sicurezza disponibile sotto NDA per prospect enterprise.",
                  color: "#ec4899",
                  badge: "Q4 2026",
                },
              ].map((c) => (
                <div
                  key={c.title}
                  className="border rounded-2xl p-6 hover:shadow-md transition-all duration-200"
                  style={{ background: "#fafafa", borderColor: c.color + "25" }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="text-2xl w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: c.color + "15" }}
                    >
                      {c.icon}
                    </div>
                    <div
                      className="text-[10px] font-black uppercase tracking-[0.12em] px-2 py-0.5 rounded-full"
                      style={{ background: c.color + "15", color: c.color, fontFamily: FONT }}
                    >
                      {c.badge}
                    </div>
                  </div>
                  <h4
                    className="text-base font-black mb-2"
                    style={{ fontFamily: FONT, color: "#0a0a0a" }}
                  >
                    {c.title}
                  </h4>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "#0a0a0a", opacity: 0.6, fontFamily: FONT }}
                  >
                    {c.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* MODIFICA 2 — Box compliance officer */}
            <div
              className="border rounded-2xl p-8 mb-8"
              style={{ background: "#fff3ee", borderColor: ORANGE + "30" }}
            >
              <div
                className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
                style={{ color: ORANGE, fontFamily: FONT }}
              >
                Per il Compliance Officer
              </div>
              <p
                className="text-base leading-relaxed"
                style={{ color: "#0a0a0a", opacity: 0.8, fontFamily: FONT }}
              >
                Forniamo{" "}
                <span style={{ fontWeight: 700 }}>DPIA, scheda tecnica AI Act, DPA e modello di responsabilità</span>{" "}
                in fase di onboarding. La piattaforma è già adottata da realtà soggette a
                vigilanza Consob e supervisione editoriale ODG.
              </p>
            </div>
            {/* Security CTA */}
            <div
              className="border rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center gap-6"
              style={{ background: "#0a0a0a", borderColor: "rgba(255,255,255,0.08)" }}
            >
              <div className="flex-1">
                <div
                  className="text-[11px] font-bold uppercase tracking-[0.2em] mb-2"
                  style={{ color: GREEN, fontFamily: FONT }}
                >
                  Per il tuo team di sicurezza
                </div>
                <p
                  className="text-base leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.7)", fontFamily: FONT }}
                >
                  Security questionnaire, DPA, documentazione architetturale e assessment
                  preliminare ISO 27001 disponibili sotto NDA per prospect enterprise qualificati.
                </p>
              </div>
              <Link href="/contatti">
                <span
                  className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold cursor-pointer transition-all duration-200 hover:opacity-90"
                  style={{ background: GREEN, color: "#ffffff", fontFamily: FONT }}
                >
                  Richiedi documentazione →
                </span>
              </Link>
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              LINK INTERNI — P1 fix heading
          ═══════════════════════════════════════════════════════ */}
          <Section>
            <Label>Approfondisci</Label>
            <h2
              className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4"
              style={{ fontFamily: FONT, color: "#0a0a0a" }}
            >
              Completa il quadro{" "}
              <span style={{ color: ORANGE }}>dell'ecosistema.</span>
            </h2>
            <p
              className="text-lg md:text-xl leading-relaxed max-w-3xl mb-14"
              style={{ color: "#0a0a0a", opacity: 0.6 }}
            >
              La piattaforma agentica è uno dei tre pilastri di ProofPress.
              Scopri la tecnologia di certificazione e l'offerta completa di prodotti e servizi.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* → Tecnologia Verify */}
              <Link href="/proofpress-verify">
                <div
                  className="group relative border border-white/10 rounded-2xl p-10 hover:border-[#00c853]/30 hover:shadow-lg transition-all duration-200 cursor-pointer"
                  style={{ background: "#0a0a0a" }}
                >
                  <div
                    className="text-[11px] font-bold tracking-[0.2em] mb-4"
                    style={{ color: GREEN, fontFamily: FONT }}
                  >
                    B.3 — TECNOLOGIA VERIFY
                  </div>
                  <h3
                    className="text-2xl md:text-3xl font-black leading-tight tracking-tight mb-4"
                    style={{ fontFamily: FONT, color: "#ffffff" }}
                  >
                    La certificazione{" "}
                    che non si può falsificare.
                  </h3>
                  <p
                    className="text-base leading-relaxed mb-8"
                    style={{ color: "rgba(255,255,255,0.55)", fontFamily: FONT }}
                  >
                    Protocollo SHA-256, Verification Report strutturato, compliance AI Act europeo.
                    Il layer di certificazione che rende ogni contenuto ProofPress verificabile nel tempo.
                  </p>
                  <div
                    className="inline-flex items-center gap-2 text-sm font-bold transition-all duration-200 group-hover:gap-3"
                    style={{ color: GREEN, fontFamily: FONT }}
                  >
                    Scopri Verify →
                  </div>
                </div>
              </Link>

              {/* → Cosa Facciamo */}
              <Link href="/cosa-facciamo">
                <div
                  className="group relative border border-[#0a0a0a]/8 rounded-2xl p-10 hover:border-[#0071e3]/30 hover:shadow-lg transition-all duration-200 cursor-pointer"
                  style={{ background: "#f0f7ff" }}
                >
                  <div
                    className="text-[11px] font-bold tracking-[0.2em] mb-4"
                    style={{ color: BLUE, fontFamily: FONT }}
                  >
                    B.1 — COSA OFFRIAMO
                  </div>
                  <h3
                    className="text-2xl md:text-3xl font-black leading-tight tracking-tight mb-4"
                    style={{ fontFamily: FONT, color: "#0a0a0a" }}
                  >
                    Testate, Newsroom{" "}
                    e Intelligence su misura.
                  </h3>
                  <p
                    className="text-base leading-relaxed mb-8"
                    style={{ color: "#0a0a0a", opacity: 0.6, fontFamily: FONT }}
                  >
                    Scopri come la piattaforma agentica si traduce in prodotti concreti per
                    Creator, Editori e Aziende — con modelli operativi e prezzi definiti.
                  </p>
                  <div
                    className="inline-flex items-center gap-2 text-sm font-bold transition-all duration-200 group-hover:gap-3"
                    style={{ color: BLUE, fontFamily: FONT }}
                  >
                    Esplora l'offerta →
                  </div>
                </div>
              </Link>
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              CTA FINALE — P1 fix heading + P12 Demo live micro-copy
          ═══════════════════════════════════════════════════════ */}
          <section className="py-20 md:py-28" style={{ background: "#0a0a0a" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              <Label light>Demo &amp; Integrazione</Label>
              <h2
                className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4"
                style={{ fontFamily: FONT, color: "#ffffff" }}
              >
                Vuoi vedere{" "}
                <span style={{ color: ORANGE }}>la piattaforma in azione?</span>
              </h2>
              <p
                className="text-lg md:text-xl leading-relaxed max-w-2xl mb-10"
                style={{ color: "rgba(255,255,255,0.6)", fontFamily: FONT }}
              >
                Demo personalizzata, proof of concept o integrazione diretta nel tuo CMS.
                Il team tecnico ProofPress risponde entro 24 ore.
              </p>
              <div className="flex flex-wrap gap-4 mb-6">
                <Link href="/contatti">
                  <span
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:opacity-90 cursor-pointer"
                    style={{ background: ORANGE, color: "#ffffff", fontFamily: FONT }}
                  >
                    Parla con il team →
                  </span>
                </Link>
                {/* P12 — Demo live con micro-copy rassicurante */}
                <a
                  href="https://proofpress.tech/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold border border-white/20 transition-all duration-200 hover:border-white/40"
                  style={{ color: "#ffffff", fontFamily: FONT }}
                >
                  Demo live ↗
                </a>
                <Link href="/proofpress-verify">
                  <span
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold border border-white/20 transition-all duration-200 hover:border-white/40 cursor-pointer"
                    style={{ color: "#ffffff", fontFamily: FONT }}
                  >
                    Scopri Verify
                  </span>
                </Link>
              </div>
              {/* MODIFICA 8 — Micro-copy rassicurante Demo live */}
              <div
                className="mt-4 border rounded-xl px-5 py-4"
                style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}
              >
                <p
                  className="text-[13px] font-semibold mb-1"
                  style={{ color: "rgba(255,255,255,0.7)", fontFamily: FONT }}
                >
                  Demo live ↗ — Ambiente sandbox, no signup richiesto.
                </p>
                <p
                  className="text-[12px]"
                  style={{ color: "rgba(255,255,255,0.4)", fontFamily: FONT }}
                >
                  5 minuti per esplorare un Verification Report reale e una pipeline in esecuzione su proofpress.tech.
                </p>
              </div>
            </div>
          </section>

          <SharedPageFooter />
        </div>
      </div>
    </div>
  );
}
