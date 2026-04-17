/**
 * Pagina /piattaforma — Piattaforma Agentica ProofPress
 * Stessa logica editoriale di /cosa-facciamo:
 * Hero → Anchor nav → Pipeline 4 fasi → 12 Agenti → Architettura tecnica → Link interni → CTA
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

/* ── I 12 agenti della piattaforma ───────────────────────────────── */
const AGENTS = [
  {
    id: "01",
    layer: "Acquisizione",
    name: "Source Monitor",
    role: "Monitoraggio continuo",
    desc: "Scansiona in tempo reale 4.000+ fonti certificate: RSS, API istituzionali, database accademici, social feed e siti di settore. Filtra il rumore e segnala solo i contenuti rilevanti per il verticale editoriale configurato.",
    color: "#6366f1",
  },
  {
    id: "02",
    layer: "Acquisizione",
    name: "Dedup Engine",
    role: "Deduplicazione semantica",
    desc: "Identifica e rimuove contenuti duplicati o sostanzialmente simili attraverso embedding vettoriali. Garantisce che ogni notizia venga processata una sola volta, eliminando ridondanze prima dell'analisi.",
    color: "#6366f1",
  },
  {
    id: "03",
    layer: "Analisi",
    name: "Relevance Scorer",
    role: "Scoring di rilevanza",
    desc: "Assegna un punteggio di rilevanza 0–100 a ogni segnale acquisito in base al profilo editoriale, alla storicità delle fonti e alla pertinenza tematica. Prioritizza la coda di elaborazione degli agenti successivi.",
    color: "#0071e3",
  },
  {
    id: "04",
    layer: "Analisi",
    name: "Fact Checker",
    role: "Verifica fattuale multi-fonte",
    desc: "Confronta ogni affermazione con almeno 3 fonti indipendenti. Misura coerenza fattuale, obiettività e affidabilità della fonte primaria. Produce un Verification Score da 0 a 100 con dettaglio delle discrepanze rilevate.",
    color: "#0071e3",
  },
  {
    id: "05",
    layer: "Analisi",
    name: "Bias Detector",
    role: "Rilevamento bias editoriale",
    desc: "Analizza il tono, il framing e la scelta lessicale per identificare bias politici, commerciali o culturali. Segnala al team editoriale le aree di potenziale parzialità prima della pubblicazione.",
    color: "#0071e3",
  },
  {
    id: "06",
    layer: "Produzione",
    name: "Brief Writer",
    role: "Sintesi e brief editoriali",
    desc: "Trasforma i segnali verificati in brief strutturati per il team editoriale: titolo provvisorio, angolo narrativo, punti chiave, fonti primarie e contesto di mercato. Riduce il tempo di briefing del 70%.",
    color: "#ff5500",
  },
  {
    id: "07",
    layer: "Produzione",
    name: "Article Generator",
    role: "Scrittura automatica",
    desc: "Produce articoli completi ottimizzati per web: headline, occhiello, corpo testo, citazioni verificate e call-to-action. Il tono e lo stile si adattano al profilo editoriale configurato per ogni testata.",
    color: "#ff5500",
  },
  {
    id: "08",
    layer: "Produzione",
    name: "SEO Optimizer",
    role: "Ottimizzazione SEO",
    desc: "Analizza keyword density, meta description, struttura heading e internal linking di ogni articolo prodotto. Suggerisce ottimizzazioni in tempo reale per massimizzare la visibilità organica su Google News e Search.",
    color: "#ff5500",
  },
  {
    id: "09",
    layer: "Certificazione",
    name: "Verify Signer",
    role: "Certificazione crittografica",
    desc: "Genera il Verification Report strutturato e lo sigilla con hash SHA-256 immutabile. Ogni articolo riceve un badge PP-[hash] univoco, timestampato e pubblicamente verificabile su proofpress.ai/proofpress-verify.",
    color: "#00c853",
  },
  {
    id: "10",
    layer: "Distribuzione",
    name: "Publisher",
    role: "Pubblicazione multicanale",
    desc: "Distribuisce automaticamente i contenuti certificati su tutti i canali configurati: CMS, newsletter, LinkedIn, API partner. Gestisce scheduling, formattazione e adattamento del formato per ogni canale.",
    color: "#8b5cf6",
  },
  {
    id: "11",
    layer: "Distribuzione",
    name: "Newsletter Composer",
    role: "Composizione newsletter",
    desc: "Assembla automaticamente la newsletter giornaliera o settimanale selezionando i contenuti più rilevanti, ottimizzando il subject line per l'open rate e personalizzando il layout per ogni segmento di audience.",
    color: "#8b5cf6",
  },
  {
    id: "12",
    layer: "Intelligence",
    name: "Research Analyst",
    role: "Report e intelligence",
    desc: "Genera report periodici strutturati su mercati, competitor, trend e normative. Aggrega dati da fonti istituzionali, paper accademici e database proprietari. Output certificato con ProofPress Verify, pronto per board e investor relations.",
    color: "#ec4899",
  },
];

const LAYERS = [
  { name: "Acquisizione", color: "#6366f1", agents: ["01", "02"] },
  { name: "Analisi", color: "#0071e3", agents: ["03", "04", "05"] },
  { name: "Produzione", color: "#ff5500", agents: ["06", "07", "08"] },
  { name: "Certificazione", color: "#00c853", agents: ["09"] },
  { name: "Distribuzione", color: "#8b5cf6", agents: ["10", "11"] },
  { name: "Intelligence", color: "#ec4899", agents: ["12"] },
];

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
              HERO
          ═══════════════════════════════════════════════════════ */}
          <section className="pt-24 pb-16 md:pt-32 md:pb-24" style={{ background: "#ffffff" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 mb-6 text-[12px]" style={{ color: "rgba(10,10,10,0.4)", fontFamily: FONT }}>
                <Link href="/cosa-facciamo">
                  <span className="hover:text-[#0a0a0a] cursor-pointer transition-colors">Cosa Facciamo</span>
                </Link>
                <span>/</span>
                <span style={{ color: "#0a0a0a", fontWeight: 600 }}>Piattaforma Agentica</span>
              </div>

              <Label>B.2 — Piattaforma Agentica</Label>
              <h1
                className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tight mb-8"
                style={{ fontFamily: FONT, color: "#0a0a0a" }}
              >
                12 agenti AI.<br />
                <span style={{ color: BLUE }}>Un'unica pipeline.</span><br />
                24/7.
              </h1>
              <p
                className="text-xl md:text-2xl leading-relaxed max-w-3xl mb-12"
                style={{ color: "#0a0a0a", opacity: 0.6 }}
              >
                La piattaforma agentica ProofPress è un'infrastruttura editoriale end-to-end:
                dall'acquisizione delle fonti alla pubblicazione certificata, 12 agenti AI
                specializzati operano in parallelo senza interruzioni.
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
                  { label: "I 12 agenti", href: "#agenti" },
                  { label: "Architettura tecnica", href: "#architettura" },
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
              PIPELINE IN 4 FASI
          ═══════════════════════════════════════════════════════ */}
          <Section bg="#fafafa" id="pipeline">
            <Label>Il flusso</Label>
            <h2
              className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4"
              style={{ fontFamily: FONT, color: "#0a0a0a" }}
            >
              La pipeline agentica<br />
              <span style={{ color: BLUE }}>in 4 fasi.</span>
            </h2>
            <p
              className="text-lg md:text-xl leading-relaxed max-w-3xl mb-14"
              style={{ color: "#0a0a0a", opacity: 0.6 }}
            >
              Dal segnale grezzo all'articolo certificato in meno di 5 minuti.
              Ogni fase è gestita da agenti specializzati che operano in parallelo
              e si passano il contesto in modo strutturato.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                {
                  step: "01",
                  phase: "Acquisizione",
                  title: "Monitoraggio & Deduplicazione",
                  desc: "Source Monitor scansiona 4.000+ fonti in tempo reale. Dedup Engine rimuove i duplicati semantici prima dell'analisi.",
                  color: "#6366f1",
                  agents: "Agenti: Source Monitor, Dedup Engine",
                },
                {
                  step: "02",
                  phase: "Analisi",
                  title: "Scoring, Verifica & Bias",
                  desc: "Relevance Scorer prioritizza i segnali. Fact Checker verifica su 3+ fonti. Bias Detector identifica parzialità editoriali.",
                  color: BLUE,
                  agents: "Agenti: Relevance Scorer, Fact Checker, Bias Detector",
                },
                {
                  step: "03",
                  phase: "Produzione",
                  title: "Brief, Articolo & SEO",
                  desc: "Brief Writer sintetizza il contesto. Article Generator scrive l'articolo. SEO Optimizer massimizza la visibilità organica.",
                  color: ORANGE,
                  agents: "Agenti: Brief Writer, Article Generator, SEO Optimizer",
                },
                {
                  step: "04",
                  phase: "Output",
                  title: "Certificazione & Distribuzione",
                  desc: "Verify Signer sigilla con SHA-256. Publisher distribuisce su tutti i canali. Newsletter Composer assembla le digest.",
                  color: "#00c853",
                  agents: "Agenti: Verify Signer, Publisher, Newsletter Composer",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="border rounded-2xl p-6 flex flex-col gap-3"
                  style={{ background: "#ffffff", borderColor: "rgba(10,10,10,0.08)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="text-[11px] font-black tracking-[0.2em] px-2 py-0.5 rounded-full"
                      style={{ background: item.color + "18", color: item.color, fontFamily: FONT }}
                    >
                      {item.step}
                    </div>
                    <div
                      className="text-[10px] font-bold uppercase tracking-[0.15em]"
                      style={{ color: item.color, fontFamily: FONT }}
                    >
                      {item.phase}
                    </div>
                  </div>
                  <h4
                    className="text-lg font-black leading-tight"
                    style={{ fontFamily: FONT, color: "#0a0a0a" }}
                  >
                    {item.title}
                  </h4>
                  <p
                    className="text-sm leading-relaxed flex-1"
                    style={{ color: "#0a0a0a", opacity: 0.6, fontFamily: FONT }}
                  >
                    {item.desc}
                  </p>
                  <div
                    className="text-[10px] font-medium pt-2 border-t border-[#0a0a0a]/6"
                    style={{ color: "#0a0a0a", opacity: 0.4, fontFamily: FONT }}
                  >
                    {item.agents}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              I 12 AGENTI
          ═══════════════════════════════════════════════════════ */}
          <Section id="agenti">
            <Label>Il team AI</Label>
            <h2
              className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4"
              style={{ fontFamily: FONT, color: "#0a0a0a" }}
            >
              I 12 agenti<br />
              <span style={{ color: ORANGE }}>della piattaforma.</span>
            </h2>
            <p
              className="text-lg md:text-xl leading-relaxed max-w-3xl mb-6"
              style={{ color: "#0a0a0a", opacity: 0.6 }}
            >
              Ogni agente è specializzato in una funzione precisa e opera in modo autonomo
              all'interno della pipeline. L'orchestratore centrale coordina il passaggio
              di contesto tra gli agenti e gestisce le eccezioni in tempo reale.
            </p>

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
                        className="text-sm leading-relaxed"
                        style={{ color: "#0a0a0a", opacity: 0.65, fontFamily: FONT }}
                      >
                        {agent.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              ARCHITETTURA TECNICA
          ═══════════════════════════════════════════════════════ */}
          <Section bg="#fafafa" id="architettura">
            <Label>Stack tecnologico</Label>
            <h2
              className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4"
              style={{ fontFamily: FONT, color: "#0a0a0a" }}
            >
              Architettura<br />
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
                  desc: "Aggregazione da 4.000+ fonti con scoring di rilevanza, deduplicazione semantica tramite embedding vettoriali e prioritizzazione in tempo reale.",
                  color: "#6366f1",
                },
                {
                  icon: "🔐",
                  title: "ProofPress Verify",
                  desc: "Protocollo crittografico SHA-256 ispirato alla notarizzazione Web3. Ogni hash è immutabile, timestampato e pubblicamente verificabile.",
                  color: "#00c853",
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

            {/* Compliance note */}
            <div
              className="border rounded-2xl p-8 md:p-10"
              style={{ background: "#fff3ee", borderColor: ORANGE + "30" }}
            >
              <div
                className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
                style={{ color: ORANGE, fontFamily: FONT }}
              >
                Takeaway per il board
              </div>
              <p
                className="text-base md:text-lg leading-relaxed"
                style={{ color: "#0a0a0a", opacity: 0.75, fontFamily: FONT }}
              >
                <span style={{ color: ORANGE, fontWeight: 700 }}>L'architettura modulare</span> permette
                di adottare ProofPress per componenti: si può partire dalla sola pipeline di
                monitoraggio e certificazione, aggiungendo progressivamente gli agenti di produzione.
                Il ROI è misurabile dal primo mese — riduzione del 60–80% dei costi di produzione
                editoriale a parità di qualità certificata.
              </p>
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              LINK INTERNI — Verify + Cosa Facciamo
          ═══════════════════════════════════════════════════════ */}
          <Section>
            <Label>Approfondisci</Label>
            <h2
              className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4"
              style={{ fontFamily: FONT, color: "#0a0a0a" }}
            >
              Completa il quadro<br />
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
                    style={{ color: "#00c853", fontFamily: FONT }}
                  >
                    B.3 — TECNOLOGIA VERIFY
                  </div>
                  <h3
                    className="text-2xl md:text-3xl font-black leading-tight tracking-tight mb-4"
                    style={{ fontFamily: FONT, color: "#ffffff" }}
                  >
                    La certificazione<br />che non si<br />può falsificare.
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
                    style={{ color: "#00c853", fontFamily: FONT }}
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
                    Testate, Newsroom<br />e Intelligence<br />su misura.
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
              CTA FINALE
          ═══════════════════════════════════════════════════════ */}
          <section className="py-20 md:py-28" style={{ background: "#0a0a0a" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              <Label light>Demo & Integrazione</Label>
              <h2
                className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4"
                style={{ fontFamily: FONT, color: "#ffffff" }}
              >
                Vuoi vedere<br />
                <span style={{ color: ORANGE }}>la piattaforma in azione?</span>
              </h2>
              <p
                className="text-lg md:text-xl leading-relaxed max-w-2xl mb-10"
                style={{ color: "rgba(255,255,255,0.6)", fontFamily: FONT }}
              >
                Demo personalizzata, proof of concept o integrazione diretta nel tuo CMS.
                Il team tecnico ProofPress risponde entro 24 ore.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contatti">
                  <span
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:opacity-90 cursor-pointer"
                    style={{ background: ORANGE, color: "#ffffff", fontFamily: FONT }}
                  >
                    Parla con il team →
                  </span>
                </Link>
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
            </div>
          </section>

          <SharedPageFooter />
        </div>
      </div>
    </div>
  );
}
