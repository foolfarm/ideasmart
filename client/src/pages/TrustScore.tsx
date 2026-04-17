/**
 * ProofPress — Trust Score
 * Pagina pubblica che spiega il sistema di valutazione A-F.
 * Design editoriale coerente con il resto del sito.
 * Palette: bianco carta (#ffffff), inchiostro (#1a1a1a), accento teal (#00e5c8), verde A (#00c853)
 */
import { useMemo } from "react";
import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import LeftSidebar from "@/components/LeftSidebar";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
const SF_DISPLAY = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";
const MONO = "JetBrains Mono, 'Courier New', monospace";
const INK = "#1a1a1a";

function Divider({ thick = false }: { thick?: boolean }) {
  return <div className={`w-full ${thick ? "border-t-4" : "border-t"} border-[#1a1a1a]`} />;
}
function ThinDivider() {
  return <div className="w-full border-t border-[#1a1a1a]/15" />;
}
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]/40 mb-3"
      style={{ fontFamily: SF }}
    >
      {children}
    </span>
  );
}

// ─── Dati criteri ────────────────────────────────────────────────────────────
const CRITERIA = [
  {
    n: "01",
    label: "Certificazione crittografica",
    points: 40,
    desc: "Ogni articolo riceve un hash SHA-256 unico che sigilla il contenuto al momento della pubblicazione. L'hash è immutabile: qualsiasi modifica successiva al testo produce un hash diverso, rendendo immediatamente rilevabile qualsiasi alterazione.",
    icon: "🔐",
    required: true,
  },
  {
    n: "02",
    label: "Archiviazione IPFS",
    points: 25,
    desc: "Il Verification Report viene pinnato su IPFS (InterPlanetary File System) tramite Pinata. L'archiviazione decentralizzata garantisce che il documento esista indipendentemente dall'infrastruttura di ProofPress, con un CID (Content Identifier) permanente e verificabile da chiunque.",
    icon: "⛓",
    required: false,
  },
  {
    n: "03",
    label: "Attribuzione della fonte",
    points: 15,
    desc: "La presenza di un nome fonte verificabile (+8 punti) e di un URL di origine (+7 punti) consente al lettore di risalire alla notizia primaria. La trasparenza sulla provenienza è un requisito fondamentale del giornalismo certificato.",
    icon: "📎",
    required: false,
  },
  {
    n: "04",
    label: "Ricchezza del contenuto",
    points: 15,
    desc: "La profondità editoriale viene misurata sulla lunghezza del testo: 15 punti per contenuti superiori a 800 caratteri, 10 per oltre 400, 6 per oltre 150, 3 per oltre 50. Un contenuto più ricco offre maggiore contesto e riduce il rischio di fraintendimenti.",
    icon: "📝",
    required: false,
  },
  {
    n: "05",
    label: "Report di verifica AI",
    points: 5,
    desc: "La presenza di un Verification Report strutturato — generato dall'agente Verify — aggiunge 5 punti. Il report documenta le dimensioni di analisi: attendibilità della fonte, coerenza multi-fonte, neutralità del linguaggio, bilanciamento delle prospettive.",
    icon: "🤖",
    required: false,
  },
];

// ─── Scala gradi ─────────────────────────────────────────────────────────────
const GRADES = [
  {
    grade: "A",
    range: "90–100",
    label: "Certificazione Massima",
    color: "#00c853",
    bg: "#f0fff4",
    border: "#00c85330",
    desc: "Hash SHA-256 + IPFS + fonte citata + URL + contenuto ricco (≥400 chars). Il massimo livello di verifica raggiungibile. Ogni elemento della catena di certificazione è presente e verificabile in modo indipendente.",
    example: "Articoli journalist con body esteso, pinnati su IPFS con fonte primaria citata.",
  },
  {
    grade: "B",
    range: "75–89",
    label: "Alta Affidabilità",
    color: "#00e5c8",
    bg: "#f0fffe",
    border: "#00e5c830",
    desc: "Hash SHA-256 + fonte citata + URL. Il contenuto è certificato crittograficamente con attribuzione completa. Il pin IPFS è in corso o il contenuto è più breve di 400 caratteri.",
    example: "News items con summary standard (150-400 chars), fonte e URL presenti, hash generato.",
  },
  {
    grade: "C",
    range: "55–74",
    label: "Affidabilità Standard",
    color: "#ff9800",
    bg: "#fffbf0",
    border: "#ff980030",
    desc: "Hash SHA-256 presente ma fonte parziale o contenuto breve. La certificazione crittografica è garantita, ma mancano elementi di attribuzione o profondità editoriale.",
    example: "Contenuti con solo sourceName (senza URL) o summary molto breve (<150 chars).",
  },
  {
    grade: "D",
    range: "35–54",
    label: "Verifica Parziale",
    color: "#ff5722",
    bg: "#fff5f0",
    border: "#ff572230",
    desc: "Hash SHA-256 presente ma senza fonte verificabile. Il contenuto è certificato nella sua integrità ma non è possibile risalire alla fonte primaria.",
    example: "Articoli con hash ma senza sourceName né sourceUrl.",
  },
  {
    grade: "F",
    range: "0–34",
    label: "Non Verificato",
    color: "#9e9e9e",
    bg: "#fafafa",
    border: "#9e9e9e30",
    desc: "Nessuna certificazione crittografica. Il contenuto non ha superato il processo di verifica ProofPress o è stato importato da fonti esterne senza hash.",
    example: "Contenuti legacy o importati prima dell'attivazione del sistema Verify.",
  },
];

// ─── FAQ ─────────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "Cosa succede se un articolo viene modificato dopo la pubblicazione?",
    a: "L'hash SHA-256 è calcolato sul contenuto al momento della pubblicazione. Qualsiasi modifica successiva produce un hash diverso, rendendo immediatamente rilevabile l'alterazione. ProofPress non modifica mai il contenuto certificato: eventuali correzioni vengono pubblicate come nuovi articoli con nuovo hash.",
  },
  {
    q: "Come posso verificare autonomamente un articolo?",
    a: "Ogni articolo mostra il badge PROOFPRESS VERIFY con l'hash SHA-256. Cliccando sull'icona di copia puoi copiare l'hash e verificarlo su qualsiasi tool SHA-256 online. Per gli articoli con IPFS, il CID è accessibile direttamente su ipfs.io o qualsiasi gateway IPFS pubblico.",
  },
  {
    q: "Perché alcuni articoli hanno grade B e non A?",
    a: "Il grade A richiede un punteggio ≥ 90/100, che si raggiunge con: hash + IPFS + fonte + URL + summary ≥ 400 caratteri. Gli articoli con summary più brevi (tipicamente le news items generate dagli scheduler) ottengono grade B (score 83-86). Il grade viene aggiornato automaticamente a A quando il pin IPFS viene completato e il contenuto è sufficientemente ricco.",
  },
  {
    q: "Il Trust Score è calcolato da un algoritmo o da un umano?",
    a: "Il calcolo è completamente algoritmico, deterministico e riproducibile: stessi input producono sempre lo stesso score. Non c'è discrezionalità umana nel punteggio. I criteri e i pesi sono pubblici e documentati in questa pagina.",
  },
  {
    q: "Cosa significa 'IPFS pinnato'?",
    a: "IPFS (InterPlanetary File System) è una rete di archiviazione decentralizzata. 'Pinnare' un documento significa renderlo permanentemente disponibile su questa rete con un CID (Content Identifier) univoco. A differenza di un URL tradizionale, il CID IPFS identifica il contenuto stesso — non la sua posizione — garantendo che il documento esista anche se ProofPress cessasse di operare.",
  },
  {
    q: "Il sistema Trust Score è applicato anche agli articoli dei giornalisti certificati?",
    a: "Sì. Gli articoli approvati tramite il Journalist Portal ricevono hash SHA-256 al momento dell'approvazione, seguiti da pin IPFS asincrono. Gli articoli con body ≥ 800 caratteri raggiungono tipicamente grade A (score 88-95) grazie alla maggiore ricchezza editoriale.",
  },
];

// ─── Componente FAQ accordion ─────────────────────────────────────────────────
import { useState } from "react";
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#1a1a1a]/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left py-4 flex items-start justify-between gap-4 hover:opacity-70 transition-opacity"
        style={{ background: "none", border: "none", cursor: "pointer" }}
      >
        <span
          className="text-[15px] font-semibold text-[#1a1a1a] leading-snug"
          style={{ fontFamily: SF_DISPLAY }}
        >
          {q}
        </span>
        <span
          className="text-[18px] text-[#1a1a1a]/40 flex-shrink-0 mt-0.5 transition-transform"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}
        >
          +
        </span>
      </button>
      {open && (
        <p
          className="pb-4 text-[14px] text-[#1a1a1a]/65 leading-relaxed"
          style={{ fontFamily: SF }}
        >
          {a}
        </p>
      )}
    </div>
  );
}

// ─── Componente Score Simulator ───────────────────────────────────────────────
function ScoreSimulator() {
  const [hasHash, setHasHash] = useState(true);
  const [hasIpfs, setHasIpfs] = useState(false);
  const [hasSource, setHasSource] = useState(true);
  const [hasUrl, setHasUrl] = useState(true);
  const [contentLen, setContentLen] = useState<"none" | "short" | "medium" | "long" | "rich">("medium");
  const [hasReport, setHasReport] = useState(false);

  const score = useMemo(() => {
    let s = 0;
    if (hasHash) s += 40;
    if (hasIpfs) s += 25;
    if (hasSource) s += 8;
    if (hasUrl) s += 7;
    if (contentLen === "rich") s += 15;
    else if (contentLen === "long") s += 10;
    else if (contentLen === "medium") s += 6;
    else if (contentLen === "short") s += 3;
    if (hasReport) s += 5;
    return s;
  }, [hasHash, hasIpfs, hasSource, hasUrl, contentLen, hasReport]);

  const grade = score >= 90 ? "A" : score >= 75 ? "B" : score >= 55 ? "C" : score >= 35 ? "D" : "F";
  const gradeColor = grade === "A" ? "#00c853" : grade === "B" ? "#00e5c8" : grade === "C" ? "#ff9800" : grade === "D" ? "#ff5722" : "#9e9e9e";
  const gradeLabel = grade === "A" ? "Certificazione Massima" : grade === "B" ? "Alta Affidabilità" : grade === "C" ? "Affidabilità Standard" : grade === "D" ? "Verifica Parziale" : "Non Verificato";

  return (
    <div
      className="rounded-xl p-6 border"
      style={{ background: "#fafafa", borderColor: "#1a1a1a10" }}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]/40 mb-4" style={{ fontFamily: SF }}>
        Simulatore Trust Score
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {/* Toggle criteri */}
        {[
          { label: "Hash SHA-256", value: hasHash, set: setHasHash, pts: "+40" },
          { label: "IPFS Pin", value: hasIpfs, set: setHasIpfs, pts: "+25" },
          { label: "Nome fonte", value: hasSource, set: setHasSource, pts: "+8" },
          { label: "URL fonte", value: hasUrl, set: setHasUrl, pts: "+7" },
          { label: "Report AI", value: hasReport, set: setHasReport, pts: "+5" },
        ].map(({ label, value, set, pts }) => (
          <button
            key={label}
            onClick={() => set(!value)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all text-left"
            style={{
              background: value ? "#f0fff4" : "#fff",
              borderColor: value ? "#00c85340" : "#1a1a1a15",
              cursor: "pointer",
            }}
          >
            <span className="text-[13px] font-medium text-[#1a1a1a]" style={{ fontFamily: SF }}>
              {label}
            </span>
            <span
              className="text-[11px] font-bold"
              style={{ fontFamily: MONO, color: value ? "#00c853" : "#1a1a1a40" }}
            >
              {pts}
            </span>
          </button>
        ))}

        {/* Selettore lunghezza contenuto */}
        <div className="sm:col-span-2">
          <p className="text-[11px] text-[#1a1a1a]/40 mb-2" style={{ fontFamily: SF }}>
            Lunghezza contenuto (0–15 punti)
          </p>
          <div className="flex gap-2 flex-wrap">
            {[
              { val: "none", label: "Nessuno", pts: "0" },
              { val: "short", label: ">50 chars", pts: "+3" },
              { val: "medium", label: ">150 chars", pts: "+6" },
              { val: "long", label: ">400 chars", pts: "+10" },
              { val: "rich", label: ">800 chars", pts: "+15" },
            ].map(({ val, label, pts }) => (
              <button
                key={val}
                onClick={() => setContentLen(val as typeof contentLen)}
                className="px-2.5 py-1.5 rounded-lg border text-[11px] transition-all"
                style={{
                  background: contentLen === val ? "#f0fff4" : "#fff",
                  borderColor: contentLen === val ? "#00c85340" : "#1a1a1a15",
                  fontFamily: SF,
                  fontWeight: contentLen === val ? 700 : 400,
                  color: contentLen === val ? "#00c853" : "#1a1a1a",
                  cursor: "pointer",
                }}
              >
                {label} <span style={{ fontFamily: MONO, fontSize: "10px" }}>{pts}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Risultato */}
      <div
        className="flex items-center gap-4 p-4 rounded-xl border"
        style={{ background: "#fff", borderColor: gradeColor + "40" }}
      >
        <div
          className="flex items-center justify-center font-black text-white rounded-lg flex-shrink-0"
          style={{ background: gradeColor, width: "52px", height: "52px", fontSize: "28px", fontFamily: SF_DISPLAY }}
        >
          {grade}
        </div>
        <div>
          <p className="text-[22px] font-black text-[#1a1a1a]" style={{ fontFamily: MONO }}>
            {score}<span className="text-[14px] font-normal text-[#1a1a1a]/40">/100</span>
          </p>
          <p className="text-[13px] font-semibold" style={{ fontFamily: SF, color: gradeColor }}>
            {gradeLabel}
          </p>
        </div>
        {/* Barra score */}
        <div className="flex-1 ml-2 hidden sm:block">
          <div className="w-full h-2 rounded-full bg-[#1a1a1a]/8 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${score}%`, background: gradeColor }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-[#1a1a1a]/30" style={{ fontFamily: MONO }}>0</span>
            <span className="text-[9px] text-[#1a1a1a]/30" style={{ fontFamily: MONO }}>100</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Pagina principale ────────────────────────────────────────────────────────
export default function TrustScore() {
  const today = useMemo(() => new Date(), []);

  return (
    <>
      <SEOHead
        title="Trust Score — Sistema di Valutazione ProofPress Verify"
        description="Come ProofPress certifica ogni articolo con hash SHA-256, IPFS e scoring A-F. Trasparenza totale sui criteri di valutazione editoriale."
        canonical="https://proofpress.ai/trust-score"
        ogImage="https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/og-ai-2HNKKGHLmzPvLTRw9y9Nko.png"
        ogSiteName="ProofPress"
      />

      <div className="flex min-h-screen" style={{ background: "#ffffff", color: INK }}>
        <LeftSidebar />
        <div className="flex-1 min-w-0 overflow-x-hidden">
          <SharedPageHeader />
          <BreakingNewsTicker />

          <main className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">

            {/* ── TESTATA ──────────────────────────────────────────────── */}
            <div className="pt-8 pb-4">
              <SectionLabel>ProofPress Verify · Sistema di Valutazione</SectionLabel>
              <Divider thick />
              <div className="py-6">
                <h1
                  className="text-[clamp(36px,6vw,64px)] font-black leading-none text-[#1a1a1a]"
                  style={{ fontFamily: SF_DISPLAY, letterSpacing: "-0.03em" }}
                >
                  Trust Score
                </h1>
                <p
                  className="mt-3 text-[18px] text-[#1a1a1a]/60 leading-relaxed max-w-2xl"
                  style={{ fontFamily: SF }}
                >
                  Come ProofPress certifica ogni articolo e assegna un grade da A a F.
                  Un sistema algoritmico, deterministico e pubblicamente verificabile.
                </p>
                <div className="mt-4 flex items-center gap-3 flex-wrap">
                  <span
                    className="text-[11px] text-[#1a1a1a]/35 uppercase tracking-widest"
                    style={{ fontFamily: SF }}
                  >
                    {today.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                  <span className="text-[#1a1a1a]/20">·</span>
                  <span
                    className="text-[11px] text-[#1a1a1a]/35 uppercase tracking-widest"
                    style={{ fontFamily: SF }}
                  >
                    Versione 1.0
                  </span>
                </div>
              </div>
              <ThinDivider />
            </div>

            {/* ── INTRO ────────────────────────────────────────────────── */}
            <section className="py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  { value: "5", label: "Criteri di valutazione" },
                  { value: "100", label: "Punti massimi" },
                  { value: "A–F", label: "Scala di grading" },
                ].map(({ value, label }) => (
                  <div key={label} className="border border-[#1a1a1a]/10 rounded-xl p-5 text-center">
                    <p
                      className="text-[40px] font-black text-[#1a1a1a]"
                      style={{ fontFamily: MONO, lineHeight: 1 }}
                    >
                      {value}
                    </p>
                    <p
                      className="mt-1 text-[12px] text-[#1a1a1a]/45 uppercase tracking-widest"
                      style={{ fontFamily: SF }}
                    >
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              <p
                className="text-[16px] text-[#1a1a1a]/70 leading-relaxed"
                style={{ fontFamily: SF }}
              >
                Il Trust Score è un punteggio numerico da 0 a 100 che misura il livello di certificazione
                di ogni articolo pubblicato su ProofPress. Il calcolo è{" "}
                <strong className="text-[#1a1a1a]">deterministico e riproducibile</strong>: gli stessi
                input producono sempre lo stesso score. Non esiste discrezionalità editoriale nel
                punteggio — solo criteri tecnici oggettivi e verificabili.
              </p>
            </section>

            <ThinDivider />

            {/* ── CRITERI ──────────────────────────────────────────────── */}
            <section className="py-8">
              <SectionLabel>I Criteri di Valutazione</SectionLabel>
              <h2
                className="text-[28px] font-black text-[#1a1a1a] mb-6"
                style={{ fontFamily: SF_DISPLAY, letterSpacing: "-0.02em" }}
              >
                Come viene calcolato il punteggio
              </h2>

              <div className="space-y-0">
                {CRITERIA.map((c, i) => (
                  <div key={c.n}>
                    <div className="py-6 grid grid-cols-[48px_1fr_auto] gap-4 items-start">
                      {/* Numero */}
                      <div>
                        <span
                          className="text-[11px] font-bold text-[#1a1a1a]/25"
                          style={{ fontFamily: MONO }}
                        >
                          {c.n}
                        </span>
                      </div>
                      {/* Contenuto */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[18px]">{c.icon}</span>
                          <h3
                            className="text-[17px] font-bold text-[#1a1a1a]"
                            style={{ fontFamily: SF_DISPLAY }}
                          >
                            {c.label}
                          </h3>
                          {c.required && (
                            <span
                              className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                              style={{ background: "#1a1a1a", color: "#fff", fontFamily: SF }}
                            >
                              Obbligatorio
                            </span>
                          )}
                        </div>
                        <p
                          className="text-[14px] text-[#1a1a1a]/60 leading-relaxed"
                          style={{ fontFamily: SF }}
                        >
                          {c.desc}
                        </p>
                      </div>
                      {/* Punti */}
                      <div className="text-right flex-shrink-0">
                        <span
                          className="text-[22px] font-black text-[#1a1a1a]"
                          style={{ fontFamily: MONO }}
                        >
                          +{c.points}
                        </span>
                        <p
                          className="text-[10px] text-[#1a1a1a]/35 uppercase tracking-widest"
                          style={{ fontFamily: SF }}
                        >
                          punti
                        </p>
                      </div>
                    </div>
                    {i < CRITERIA.length - 1 && <ThinDivider />}
                  </div>
                ))}
              </div>
            </section>

            <ThinDivider />

            {/* ── SIMULATORE ───────────────────────────────────────────── */}
            <section className="py-8">
              <SectionLabel>Prova il Simulatore</SectionLabel>
              <h2
                className="text-[28px] font-black text-[#1a1a1a] mb-2"
                style={{ fontFamily: SF_DISPLAY, letterSpacing: "-0.02em" }}
              >
                Calcola il Trust Score
              </h2>
              <p
                className="text-[14px] text-[#1a1a1a]/50 mb-6"
                style={{ fontFamily: SF }}
              >
                Seleziona i criteri presenti in un articolo per vedere il punteggio risultante.
              </p>
              <ScoreSimulator />
            </section>

            <ThinDivider />

            {/* ── SCALA GRADI ──────────────────────────────────────────── */}
            <section className="py-8">
              <SectionLabel>La Scala di Grading</SectionLabel>
              <h2
                className="text-[28px] font-black text-[#1a1a1a] mb-6"
                style={{ fontFamily: SF_DISPLAY, letterSpacing: "-0.02em" }}
              >
                Da A a F: cosa significa ogni grade
              </h2>

              <div className="space-y-4">
                {GRADES.map((g) => (
                  <div
                    key={g.grade}
                    className="rounded-xl border p-5"
                    style={{ background: g.bg, borderColor: g.border }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Badge grade */}
                      <div
                        className="flex items-center justify-center font-black text-white rounded-lg flex-shrink-0"
                        style={{
                          background: g.color,
                          width: "44px",
                          height: "44px",
                          fontSize: "22px",
                          fontFamily: SF_DISPLAY,
                        }}
                      >
                        {g.grade}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <h3
                            className="text-[16px] font-bold text-[#1a1a1a]"
                            style={{ fontFamily: SF_DISPLAY }}
                          >
                            {g.label}
                          </h3>
                          <span
                            className="text-[12px] font-bold"
                            style={{ fontFamily: MONO, color: g.color }}
                          >
                            {g.range} punti
                          </span>
                        </div>
                        <p
                          className="text-[13px] text-[#1a1a1a]/65 leading-relaxed mb-2"
                          style={{ fontFamily: SF }}
                        >
                          {g.desc}
                        </p>
                        <p
                          className="text-[11px] text-[#1a1a1a]/40 italic"
                          style={{ fontFamily: SF }}
                        >
                          Esempio: {g.example}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <ThinDivider />

            {/* ── COME FUNZIONA IL BADGE ────────────────────────────────── */}
            <section className="py-8">
              <SectionLabel>Il Badge ProofPress Verify</SectionLabel>
              <h2
                className="text-[28px] font-black text-[#1a1a1a] mb-4"
                style={{ fontFamily: SF_DISPLAY, letterSpacing: "-0.02em" }}
              >
                Come leggere il badge sugli articoli
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p
                    className="text-[14px] text-[#1a1a1a]/65 leading-relaxed mb-4"
                    style={{ fontFamily: SF }}
                  >
                    Ogni articolo certificato mostra il badge{" "}
                    <strong className="text-[#1a1a1a]">PROOFPRESS VERIFY</strong> con:
                  </p>
                  <ul className="space-y-3">
                    {[
                      { icon: "🟩", text: "Il quadratino colorato con la lettera del grade (A/B/C/D/F)" },
                      { icon: "🔐", text: "L'icona scudo che indica la certificazione crittografica attiva" },
                      { icon: "#", text: "I primi 8 caratteri dell'hash SHA-256 (clicca per copiare l'hash completo)" },
                      { icon: "↗", text: "L'icona di link per accedere al Verification Report completo" },
                    ].map(({ icon, text }) => (
                      <li key={text} className="flex items-start gap-3">
                        <span className="text-[16px] flex-shrink-0">{icon}</span>
                        <span
                          className="text-[13px] text-[#1a1a1a]/65"
                          style={{ fontFamily: SF }}
                        >
                          {text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div
                  className="rounded-xl border p-5 flex flex-col gap-3"
                  style={{ background: "#fafafa", borderColor: "#1a1a1a10" }}
                >
                  <p
                    className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#1a1a1a]/35"
                    style={{ fontFamily: SF }}
                  >
                    Esempio badge
                  </p>
                  {/* Simulazione badge grade A */}
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex items-center justify-center font-black text-white rounded"
                      style={{ background: "#00c853", fontSize: "10px", width: "18px", height: "18px", fontFamily: SF_DISPLAY }}
                    >
                      A
                    </span>
                    <span
                      className="text-[11px] font-bold"
                      style={{ fontFamily: MONO, color: "#0066cc" }}
                    >
                      🛡 PROOFPRESS VERIFY a3f8c2d1
                    </span>
                  </div>
                  {/* Simulazione badge grade B */}
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex items-center justify-center font-black text-white rounded"
                      style={{ background: "#00e5c8", fontSize: "10px", width: "18px", height: "18px", fontFamily: SF_DISPLAY }}
                    >
                      B
                    </span>
                    <span
                      className="text-[11px] font-bold"
                      style={{ fontFamily: MONO, color: "#0066cc" }}
                    >
                      🛡 PROOFPRESS VERIFY 7b4e91f0
                    </span>
                  </div>
                  {/* Simulazione badge grade C */}
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex items-center justify-center font-black text-white rounded"
                      style={{ background: "#ff9800", fontSize: "10px", width: "18px", height: "18px", fontFamily: SF_DISPLAY }}
                    >
                      C
                    </span>
                    <span
                      className="text-[11px] font-bold"
                      style={{ fontFamily: MONO, color: "#0066cc" }}
                    >
                      🛡 PROOFPRESS VERIFY 2c5d8a3e
                    </span>
                  </div>
                  <p
                    className="text-[10px] text-[#1a1a1a]/35 mt-1"
                    style={{ fontFamily: SF }}
                  >
                    Il colore del quadratino indica immediatamente il grade. Passa il mouse per vedere score e grade completi.
                  </p>
                </div>
              </div>
            </section>

            <ThinDivider />

            {/* ── FAQ ──────────────────────────────────────────────────── */}
            <section className="py-8">
              <SectionLabel>Domande Frequenti</SectionLabel>
              <h2
                className="text-[28px] font-black text-[#1a1a1a] mb-6"
                style={{ fontFamily: SF_DISPLAY, letterSpacing: "-0.02em" }}
              >
                FAQ
              </h2>
              <div>
                {FAQS.map((faq) => (
                  <FaqItem key={faq.q} q={faq.q} a={faq.a} />
                ))}
              </div>
            </section>

            <ThinDivider />

            {/* ── CTA ──────────────────────────────────────────────────── */}
            <section className="py-10">
              <div
                className="rounded-2xl p-8 border"
                style={{ background: "#0a0f1e", borderColor: "#ffffff10" }}
              >
                <SectionLabel>
                  <span style={{ color: "#00e5c8" }}>ProofPress Verify Technology</span>
                </SectionLabel>
                <h2
                  className="text-[28px] font-black text-white mb-3"
                  style={{ fontFamily: SF_DISPLAY, letterSpacing: "-0.02em" }}
                >
                  Informazione certificata, non solo pubblicata.
                </h2>
                <p
                  className="text-[15px] text-white/60 leading-relaxed mb-6 max-w-xl"
                  style={{ fontFamily: SF }}
                >
                  ProofPress è l'unica piattaforma editoriale italiana che applica certificazione
                  crittografica e archiviazione IPFS a ogni articolo pubblicato. Il Trust Score
                  non è un'opinione — è un fatto verificabile.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Link href="/proofpress-verify">
                    <span
                      className="inline-block px-5 py-2.5 rounded-lg text-[13px] font-bold cursor-pointer transition-opacity hover:opacity-80"
                      style={{ background: "#00e5c8", color: "#0a0f1e", fontFamily: SF }}
                    >
                      Scopri la Tecnologia →
                    </span>
                  </Link>
                  <Link href="/advertise">
                    <span
                      className="inline-block px-5 py-2.5 rounded-lg text-[13px] font-bold cursor-pointer transition-opacity hover:opacity-80 border"
                      style={{ background: "transparent", color: "#fff", borderColor: "#ffffff30", fontFamily: SF }}
                    >
                      Pubblica su ProofPress
                    </span>
                  </Link>
                </div>
              </div>
            </section>

          </main>

          <SharedPageFooter />
        </div>
      </div>
    </>
  );
}
