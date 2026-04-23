/**
 * ProofPress Verify — Demo Pubblica
 * Pagina /verify/demo: chiunque può incollare un testo e vedere
 * in tempo reale SHA-256 hash, claim estratti e TrustGrade.
 * Nessun login richiesto. I risultati NON vengono salvati nel database.
 */
import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Link, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

// Mappa slug URL → indice in EXAMPLE_TEXTS
const EXAMPLE_SLUG_MAP: Record<string, number> = {
  esg: 0,
  tech: 1,
  ai: 1,
  comunicato: 2,
  mifid: 3,
  mar: 3,
  finance: 3,
  csrd: 4,
  deloitte: 4,
  esg2: 4,
};

// ─── Testi di esempio per la demo ────────────────────────────────────────────
const EXAMPLE_TEXTS = [
  {
    label: "Reportage ESG / CSRD",
    title: "Emissioni CO₂ di Acme SpA — Report 2024",
    text: `Nel 2024, Acme SpA ha ridotto le emissioni di CO₂ del 18% rispetto al 2023, passando da 42.000 a 34.440 tonnellate di CO₂ equivalente. Il dato è certificato da Bureau Veritas secondo lo standard ISO 14064-1. La riduzione è stata ottenuta grazie all'installazione di 2.400 pannelli fotovoltaici nello stabilimento di Torino, che coprono il 35% del fabbisogno energetico. Il piano di decarbonizzazione prevede il raggiungimento della carbon neutrality entro il 2030, in linea con gli obiettivi Science Based Targets (SBTi). Il CAPEX investito nel 2024 per la transizione energetica è stato di 4,2 milioni di euro, con un ROI atteso di 7 anni.`,
  },
  {
    label: "Notizia Tech / AI",
    title: "OpenAI lancia GPT-5 con capacità multimodali avanzate",
    text: `OpenAI ha annunciato il rilascio di GPT-5, il suo modello di linguaggio di nuova generazione, con capacità multimodali che includono analisi di immagini, audio e video in tempo reale. Secondo il CEO Sam Altman, GPT-5 supera i benchmark umani in 23 delle 30 categorie di test standardizzati, inclusi ragionamento matematico e comprensione del linguaggio naturale. Il modello è stato addestrato su un dataset di 10 trilioni di token e utilizza una nuova architettura transformer con 1,8 trilioni di parametri. Il lancio commerciale è previsto per il Q3 2025 con prezzi a partire da 0,002 dollari per 1.000 token di input.`,
  },
  {
    label: "Comunicato Aziendale",
    title: "FoolFarm chiude round Series A da 5 milioni di euro",
    text: `FoolFarm, il venture studio italiano specializzato in startup AI-native, ha chiuso un round Series A da 5 milioni di euro guidato da CDP Venture Capital con la partecipazione di Azimut Libera Impresa e tre family office milanesi. I fondi saranno utilizzati per accelerare lo sviluppo di tre nuove venture nel settore AI for Business, con un focus su compliance automatizzata, analisi predittiva per PMI e piattaforme di content verification. Il portfolio attuale di FoolFarm comprende 12 startup, di cui 2 con exit completata e 4 in fase di scale-up. Il round porta la valutazione pre-money di FoolFarm a 18 milioni di euro.`,
  },
  {
    label: "MiFID II / MAR — Finance & IR",
    title: "Comunicato Price-Sensitive: Utili Q1 2025 e Guidance Annuale",
    text: `Il Consiglio di Amministrazione di ExampleCorp S.p.A. (ticker: EXC.MI) ha approvato in data odierna i risultati preliminari non certificati del primo trimestre 2025. Ricavi consolidati: 487 milioni di euro, in crescita del 14,2% rispetto al Q1 2024 (427 milioni). EBITDA adjusted: 112 milioni di euro, con margine al 23,0% (Q1 2024: 21,3%). Utile netto: 58 milioni di euro (+22% YoY). Il Consiglio di Amministrazione conferma la guidance per l'esercizio 2025: ricavi tra 1,85 e 1,95 miliardi di euro, EBITDA adjusted tra 420 e 450 milioni di euro. La società ha avviato un processo di valutazione di potenziali operazioni straordinarie, inclusa la cessione di una business unit non-core con ricavi annui di circa 80 milioni di euro. Ai sensi del Regolamento (UE) n. 596/2014 (MAR), il presente comunicato costituisce informazione privilegiata. Il management ha adottato le misure previste dall'art. 17 MAR per garantire la corretta e tempestiva divulgazione al mercato. La data di approvazione del bilancio consolidato certificato è fissata per il 15 maggio 2025.`,
  },
  {
    label: "CSRD / Deloitte Audit",
    title: "CSRD Compliance Report 2024 — Emissioni, Governance e Supply Chain",
    text: `Il presente report è redatto in conformità alla Corporate Sustainability Reporting Directive (CSRD) e agli European Sustainability Reporting Standards (ESRS E1, S1, G1). Emissioni: Le emissioni di Scope 1 e Scope 2 dell'esercizio 2024 ammontano rispettivamente a 18.200 tCO₂e e 9.400 tCO₂e, con una riduzione complessiva del 22% rispetto al baseline 2021. Le emissioni di Scope 3 (categorie 1, 4 e 11) sono state calcolate secondo il GHG Protocol e ammontano a 142.000 tCO₂e. Il piano di transizione prevede il raggiungimento del Net Zero entro il 2040, con target intermedi validati da Science Based Targets initiative (SBTi) nel 2023. Governance: Il Consiglio di Amministrazione ha approvato nel 2024 una politica di remunerazione variabile per il top management con il 30% legato al raggiungimento di KPI ESG (riduzione emissioni, parità di genere, indice di engagement dipendenti). Il Comitato Sostenibilità si riunisce con cadenza trimestrale e riporta direttamente al CDA. Supply Chain: Il 78% dei fornitori strategici (Tier 1, fatturato >500k€) ha completato la self-assessment ESG tramite la piattaforma EcoVadis, con un punteggio medio di 62/100. Sono stati identificati 4 fornitori ad alto rischio climatico nelle regioni MENA e Asia meridionale; per questi è stato avviato un piano di engagement e audit on-site previsto per Q2 2025. Il 100% del packaging primario è certificato FSC o PEFC.`,
  },
];

// ─── Colori per TrustGrade ────────────────────────────────────────────────────
const GRADE_CONFIG: Record<string, { color: string; bg: string; border: string; label: string }> = {
  A: { color: "#00e5c8", bg: "rgba(0,229,200,0.12)", border: "rgba(0,229,200,0.4)", label: "Eccellente" },
  B: { color: "#4ade80", bg: "rgba(74,222,128,0.12)", border: "rgba(74,222,128,0.4)", label: "Buono" },
  C: { color: "#facc15", bg: "rgba(250,204,21,0.12)", border: "rgba(250,204,21,0.4)", label: "Sufficiente" },
  D: { color: "#fb923c", bg: "rgba(251,146,60,0.12)", border: "rgba(251,146,60,0.4)", label: "Insufficiente" },
  F: { color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.4)", label: "Non verificabile" },
};

const CLAIM_TYPE_LABELS: Record<string, string> = {
  statistic: "Statistica",
  factual_event: "Evento Fattuale",
  quote: "Citazione",
  prediction: "Previsione",
};

// ─── Criteri breakdown ────────────────────────────────────────────────────────
const BREAKDOWN_LABELS: Record<string, { label: string; max: number; icon: string }> = {
  hash: { label: "Hash SHA-256 generato", max: 40, icon: "🔐" },
  title: { label: "Titolo strutturato (>10 car.)", max: 8, icon: "📝" },
  richContent: { label: "Contenuto ricco (>800 car.)", max: 15, icon: "📄" },
  claimsExtracted: { label: "Claim estratti dall'AI", max: 5, icon: "🤖" },
  verifiableClaims: { label: "≥2 claim verificabili", max: 12, icon: "✅" },
  ipfs: { label: "Ancoraggio IPFS (solo versione certificata)", max: 25, icon: "⛓️" },
};

// ─── Step animazione pipeline ─────────────────────────────────────────────────
const PIPELINE_STEPS = [
  { id: "hash", label: "Calcolo hash SHA-256", icon: "🔐" },
  { id: "llm", label: "Estrazione claim con AI", icon: "🤖" },
  { id: "score", label: "Calcolo TrustGrade", icon: "📊" },
];

// ─── Componente principale ────────────────────────────────────────────────────
export default function VerifyDemo() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [copied, setCopied] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);
  const search = useSearch();

  const mutation = trpc.news.verifyDemo.useMutation({
    onMutate: () => {
      setActiveStep(0);
      setTimeout(() => setActiveStep(1), 400);
      setTimeout(() => setActiveStep(2), 900);
    },
    onSuccess: () => {
      setActiveStep(-1);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    },
    onError: () => setActiveStep(-1),
  });

  // Pre-seleziona l'esempio e, se ?autorun=1, lancia l'analisi automaticamente
  useEffect(() => {
    const params = new URLSearchParams(search);
    const slug = params.get("example")?.toLowerCase() ?? "";
    const autorun = params.get("autorun") === "1";

    if (!slug) return;
    const idx = EXAMPLE_SLUG_MAP[slug];
    if (idx === undefined || !EXAMPLE_TEXTS[idx]) return;

    const ex = EXAMPLE_TEXTS[idx];
    setTitle(ex.title);
    setText(ex.text);

    if (autorun) {
      setTimeout(() => {
        mutation.mutate({ text: ex.text.trim(), title: ex.title.trim() });
      }, 300);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 50) return;
    mutation.mutate({ text: text.trim(), title: title.trim() || undefined });
  };

  const handleExample = (ex: (typeof EXAMPLE_TEXTS)[number]) => {
    setTitle(ex.title);
    setText(ex.text);
    mutation.reset();
  };

  const copyHash = () => {
    if (!mutation.data?.sha256) return;
    navigator.clipboard.writeText(mutation.data.sha256);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Genera link condivisibile: /verify/demo?example=<slug> se riconoscibile, altrimenti con hash
  const getShareUrl = () => {
    const base = window.location.origin + "/verify/demo";
    if (!mutation.data?.sha256) return base;
    // Cerca se il testo corrente corrisponde a un esempio noto
    const matchIdx = EXAMPLE_TEXTS.findIndex(ex => ex.title === title && ex.text === text);
    if (matchIdx >= 0) {
      const slug = Object.entries(EXAMPLE_SLUG_MAP).find(([, v]) => v === matchIdx)?.[0] ?? "";
      if (slug) return `${base}?example=${slug}`;
    }
    // Fallback: link con hash SHA-256 pre-compilato nel form di verifica pubblica
    return `${window.location.origin}/proofpress-verify?hash=${mutation.data.sha256}`;
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(getShareUrl());
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const sendDemoMutation = trpc.news.sendDemoLink.useMutation({
    onSuccess: () => {
      setEmailSent(true);
      setEmailError("");
      setTimeout(() => setEmailSent(false), 4000);
    },
    onError: (err) => {
      setEmailError(err.message ?? "Errore durante l'invio. Riprova.");
    },
  });

  const handleSendEmail = () => {
    if (!emailInput.trim() || !mutation.data) return;
    setEmailError("");
    sendDemoMutation.mutate({
      recipientEmail: emailInput.trim(),
      shareUrl: getShareUrl(),
      sha256: mutation.data.sha256,
      trustGrade: mutation.data.trustGrade,
      trustScore: mutation.data.trustScore,
      contentTitle: title || undefined,
      origin: window.location.origin,
    });
  };

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const isLoading = mutation.isPending;
  const result = mutation.data;
  const gradeConf = result ? (GRADE_CONFIG[result.trustGrade] ?? GRADE_CONFIG["F"]) : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0f1e 0%, #0d1530 50%, #0a0f1e 100%)",
        fontFamily: "'DM Sans', sans-serif",
        color: "#e2e8f0",
      }}
    >
      {/* ── Header minimal Verify ─────────────────────────────────────────── */}
      <header
        style={{
          borderBottom: "1px solid rgba(0,229,200,0.15)",
          background: "rgba(10,15,30,0.95)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 1.5rem",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link href="/verify">
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "1.05rem",
                color: "#00e5c8",
                letterSpacing: "-0.01em",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ opacity: 0.7, fontSize: "0.85rem" }}>⛓️</span>
              ProofPress <span style={{ color: "#ffffff", fontWeight: 400 }}>Verify</span>
            </span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link href="/verify/dashboard">
              <span
                style={{
                  fontSize: "0.82rem",
                  color: "rgba(226,232,240,0.6)",
                  cursor: "pointer",
                  transition: "color 0.2s",
                }}
              >
                Dashboard →
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: "4rem 1.5rem 2rem", textAlign: "center", maxWidth: 760, margin: "0 auto" }}>
        <div
          style={{
            display: "inline-block",
            background: "rgba(0,229,200,0.1)",
            border: "1px solid rgba(0,229,200,0.3)",
            borderRadius: 999,
            padding: "4px 14px",
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "#00e5c8",
            textTransform: "uppercase",
            marginBottom: "1.2rem",
          }}
        >
          Demo Gratuita · Nessun Login Richiesto
        </div>
        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            marginBottom: "1rem",
            color: "#ffffff",
          }}
        >
          Verifica un contenuto{" "}
          <span style={{ color: "#00e5c8" }}>in tempo reale</span>
        </h1>
        <p
          style={{
            fontSize: "1rem",
            lineHeight: 1.7,
            color: "rgba(226,232,240,0.7)",
            maxWidth: 560,
            margin: "0 auto 0.8rem",
          }}
        >
          Incolla il testo di un articolo, comunicato o report ESG. ProofPress Verify
          calcola l'hash SHA-256, estrae i claim fattuali con AI e assegna un TrustGrade.
        </p>
        <p
          style={{
            fontSize: "0.8rem",
            color: "rgba(226,232,240,0.4)",
            fontStyle: "italic",
          }}
        >
          I risultati di questa demo non vengono salvati nel database e non producono una certificazione IPFS.
        </p>
      </section>

      {/* ── Esempi rapidi ─────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "0 1.5rem 1.5rem" }}>
        <p style={{ fontSize: "0.78rem", color: "rgba(226,232,240,0.45)", marginBottom: "0.6rem", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
          Prova con un esempio:
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {EXAMPLE_TEXTS.map((ex) => (
            <button
              key={ex.label}
              onClick={() => handleExample(ex)}
              style={{
                background: "rgba(255,85,0,0.08)",
                border: "1px solid rgba(255,85,0,0.25)",
                borderRadius: 8,
                padding: "6px 14px",
                fontSize: "0.8rem",
                color: "#ff8c55",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                transition: "all 0.2s",
              }}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Form ──────────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "0 1.5rem 2rem" }}>
        <form
          onSubmit={handleSubmit}
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: "1.8rem",
          }}
        >
          {/* Titolo */}
          <div style={{ marginBottom: "1.2rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "rgba(226,232,240,0.6)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 8,
              }}
            >
              Titolo (opzionale)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Es: Emissioni CO₂ di Acme SpA — Report 2024"
              maxLength={500}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: "0.92rem",
                color: "#e2e8f0",
                fontFamily: "'DM Sans', sans-serif",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(0,229,200,0.4)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>

          {/* Testo */}
          <div style={{ marginBottom: "1.4rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "rgba(226,232,240,0.6)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 8,
              }}
            >
              Testo dell'articolo *
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Incolla qui il testo dell'articolo, comunicato stampa, report ESG o qualsiasi contenuto da verificare (min. 50 caratteri)..."
              rows={10}
              maxLength={10000}
              required
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: "0.92rem",
                color: "#e2e8f0",
                fontFamily: "'DM Sans', sans-serif",
                outline: "none",
                resize: "vertical",
                lineHeight: 1.65,
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(0,229,200,0.4)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 6,
                fontSize: "0.75rem",
                color: "rgba(226,232,240,0.4)",
              }}
            >
              <span>{wordCount} parole</span>
              <span style={{ color: charCount > 9500 ? "#fb923c" : "rgba(226,232,240,0.4)" }}>
                {charCount.toLocaleString()} / 10.000 caratteri
              </span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || charCount < 50}
            style={{
              width: "100%",
              background: isLoading || charCount < 50
                ? "rgba(0,229,200,0.2)"
                : "linear-gradient(135deg, #00e5c8 0%, #00b8a2 100%)",
              border: "none",
              borderRadius: 10,
              padding: "14px 24px",
              fontSize: "1rem",
              fontWeight: 700,
              color: isLoading || charCount < 50 ? "rgba(0,229,200,0.5)" : "#0a0f1e",
              cursor: isLoading || charCount < 50 ? "not-allowed" : "pointer",
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: "-0.01em",
              transition: "all 0.2s",
            }}
          >
            {isLoading ? "Analisi in corso..." : "Analizza con ProofPress Verify →"}
          </button>

          {mutation.isError && (
            <p style={{ marginTop: 12, color: "#f87171", fontSize: "0.85rem", textAlign: "center" }}>
              Errore durante l'analisi. Riprova tra qualche secondo.
            </p>
          )}
        </form>
      </section>

      {/* ── Animazione Pipeline ────────────────────────────────────────────── */}
      <AnimatePresence>
        {isLoading && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{ maxWidth: 760, margin: "0 auto", padding: "0 1.5rem 2rem" }}
          >
            <div
              style={{
                background: "rgba(0,229,200,0.04)",
                border: "1px solid rgba(0,229,200,0.15)",
                borderRadius: 16,
                padding: "1.5rem",
              }}
            >
              <p
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "#00e5c8",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "1rem",
                }}
              >
                Pipeline in esecuzione
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {PIPELINE_STEPS.map((step, idx) => {
                  const done = activeStep > idx;
                  const active = activeStep === idx;
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0.3 }}
                      animate={{ opacity: active || done ? 1 : 0.35 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 14px",
                        borderRadius: 10,
                        background: active
                          ? "rgba(0,229,200,0.08)"
                          : done
                          ? "rgba(74,222,128,0.06)"
                          : "transparent",
                        border: `1px solid ${
                          active
                            ? "rgba(0,229,200,0.3)"
                            : done
                            ? "rgba(74,222,128,0.2)"
                            : "rgba(255,255,255,0.06)"
                        }`,
                        transition: "all 0.3s",
                      }}
                    >
                      <span style={{ fontSize: "1.1rem" }}>{step.icon}</span>
                      <span
                        style={{
                          fontSize: "0.88rem",
                          fontWeight: 500,
                          color: active ? "#00e5c8" : done ? "#4ade80" : "rgba(226,232,240,0.5)",
                        }}
                      >
                        {step.label}
                      </span>
                      {done && (
                        <span style={{ marginLeft: "auto", color: "#4ade80", fontSize: "0.85rem" }}>✓</span>
                      )}
                      {active && (
                        <span
                          style={{
                            marginLeft: "auto",
                            width: 16,
                            height: 16,
                            border: "2px solid rgba(0,229,200,0.3)",
                            borderTopColor: "#00e5c8",
                            borderRadius: "50%",
                            display: "inline-block",
                            animation: "spin 0.8s linear infinite",
                          }}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Risultati ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {result && !isLoading && (
          <motion.section
            ref={resultRef}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ maxWidth: 760, margin: "0 auto", padding: "0 1.5rem 4rem" }}
          >
            {/* Header risultati */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: "1.5rem",
                paddingBottom: "1rem",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#ffffff",
                }}
              >
                Risultati analisi
              </span>
              <span
                style={{
                  fontSize: "0.72rem",
                  color: "rgba(226,232,240,0.4)",
                  marginLeft: "auto",
                }}
              >
                {result.wordCount} parole · {result.charCount.toLocaleString()} caratteri
                {result.processingMs > 0 && ` · ${(result.processingMs / 1000).toFixed(1)}s`}
              </span>
            </div>

            {/* TrustGrade + Score */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: 24,
                marginBottom: "1.5rem",
                background: gradeConf!.bg,
                border: `1px solid ${gradeConf!.border}`,
                borderRadius: 16,
                padding: "1.5rem",
                alignItems: "center",
              }}
            >
              {/* Badge Grade */}
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 16,
                    background: gradeConf!.bg,
                    border: `2px solid ${gradeConf!.color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "2.4rem",
                    fontWeight: 900,
                    color: gradeConf!.color,
                    letterSpacing: "-0.04em",
                  }}
                >
                  {result.trustGrade}
                </div>
                <p
                  style={{
                    fontSize: "0.72rem",
                    color: gradeConf!.color,
                    fontWeight: 600,
                    marginTop: 6,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {gradeConf!.label}
                </p>
              </div>

              {/* Score bar + info */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: "1.6rem",
                      fontWeight: 800,
                      color: gradeConf!.color,
                    }}
                  >
                    {result.trustScore}
                    <span style={{ fontSize: "0.9rem", fontWeight: 400, color: "rgba(226,232,240,0.5)" }}>
                      /100
                    </span>
                  </span>
                  <span style={{ fontSize: "0.78rem", color: "rgba(226,232,240,0.5)" }}>
                    TrustScore
                  </span>
                </div>
                {/* Barra */}
                <div
                  style={{
                    height: 8,
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: 999,
                    overflow: "hidden",
                    marginBottom: 10,
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.trustScore}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{
                      height: "100%",
                      background: `linear-gradient(90deg, ${gradeConf!.color}, ${gradeConf!.color}cc)`,
                      borderRadius: 999,
                    }}
                  />
                </div>
                <p style={{ fontSize: "0.78rem", color: "rgba(226,232,240,0.5)", lineHeight: 1.5 }}>
                  Score calcolato su criteri strutturali (hash, titolo, lunghezza, claim AI).
                  La versione certificata aggiunge +25 punti per l'ancoraggio IPFS.
                </p>
              </div>
            </div>

            {/* SHA-256 Hash */}
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "1rem 1.2rem",
                marginBottom: "1.2rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "rgba(226,232,240,0.5)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  🔐 Hash SHA-256
                </span>
                <button
                  onClick={copyHash}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 6,
                    padding: "3px 10px",
                    fontSize: "0.72rem",
                    color: copied ? "#4ade80" : "rgba(226,232,240,0.6)",
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    transition: "all 0.2s",
                  }}
                >
                  {copied ? "Copiato ✓" : "Copia"}
                </button>
              </div>
              <code
                style={{
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                  fontSize: "0.78rem",
                  color: "#00e5c8",
                  wordBreak: "break-all",
                  lineHeight: 1.6,
                  display: "block",
                }}
              >
                {result.sha256}
              </code>
              <p style={{ fontSize: "0.72rem", color: "rgba(226,232,240,0.35)", marginTop: 8 }}>
                Impronta digitale univoca del contenuto. Qualsiasi modifica al testo produce un hash diverso.
              </p>
            </div>

            {/* Breakdown criteri */}
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "1rem 1.2rem",
                marginBottom: "1.2rem",
              }}
            >
              <p
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "rgba(226,232,240,0.5)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "0.8rem",
                }}
              >
                📊 Breakdown TrustScore
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {Object.entries(result.breakdown).map(([key, pts]) => {
                  const conf = BREAKDOWN_LABELS[key];
                  if (!conf) return null;
                  const earned = pts as number;
                  const pct = conf.max > 0 ? (earned / conf.max) * 100 : 0;
                  return (
                    <div
                      key={key}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        opacity: earned > 0 ? 1 : 0.45,
                      }}
                    >
                      <span style={{ fontSize: "0.85rem", width: 20, textAlign: "center" }}>
                        {conf.icon}
                      </span>
                      <span
                        style={{
                          flex: 1,
                          fontSize: "0.82rem",
                          color: earned > 0 ? "#e2e8f0" : "rgba(226,232,240,0.5)",
                        }}
                      >
                        {conf.label}
                      </span>
                      <div
                        style={{
                          width: 80,
                          height: 5,
                          background: "rgba(255,255,255,0.08)",
                          borderRadius: 999,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: earned > 0 ? "#00e5c8" : "transparent",
                            borderRadius: 999,
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          color: earned > 0 ? "#00e5c8" : "rgba(226,232,240,0.3)",
                          width: 40,
                          textAlign: "right",
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        +{earned}/{conf.max}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Claims estratti */}
            {result.claims.length > 0 && (
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: "1rem 1.2rem",
                  marginBottom: "1.2rem",
                }}
              >
                <p
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "rgba(226,232,240,0.5)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: "0.8rem",
                  }}
                >
                  🤖 Claim fattuali estratti dall'AI ({result.claims.length})
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {result.claims.map((claim, idx) => (
                    <div
                      key={claim.claim_id ?? idx}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                        padding: "10px 12px",
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 10,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          color: "#0a0f1e",
                          background: claim.verifiable ? "#00e5c8" : "rgba(226,232,240,0.3)",
                          borderRadius: 4,
                          padding: "2px 7px",
                          whiteSpace: "nowrap",
                          marginTop: 1,
                          flexShrink: 0,
                        }}
                      >
                        {CLAIM_TYPE_LABELS[claim.type] ?? claim.type}
                      </span>
                      <span style={{ fontSize: "0.87rem", color: "#e2e8f0", lineHeight: 1.55 }}>
                        {claim.text}
                      </span>
                      {claim.verifiable && (
                        <span
                          style={{
                            fontSize: "0.68rem",
                            color: "#00e5c8",
                            whiteSpace: "nowrap",
                            marginTop: 3,
                            flexShrink: 0,
                          }}
                        >
                          ✓ verificabile
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottone Condividi questa demo */}
            <div
              style={{
                background: "rgba(0,229,200,0.05)",
                border: "1px solid rgba(0,229,200,0.2)",
                borderRadius: 12,
                padding: "1rem 1.2rem",
                marginBottom: "1.2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <div>
                <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#00e5c8", marginBottom: 3 }}>
                  🔗 Condividi questa demo
                </p>
                <p style={{ fontSize: "0.75rem", color: "rgba(226,232,240,0.45)", lineHeight: 1.5 }}>
                  {EXAMPLE_TEXTS.findIndex(ex => ex.title === title && ex.text === text) >= 0
                    ? "Link con esempio pre-selezionato — il destinatario vede subito il testo caricato"
                    : "Link con hash SHA-256 — porta alla pagina di verifica pubblica con l'hash pre-compilato"}
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, minWidth: 180 }}>
                <code
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.68rem",
                    color: "rgba(0,229,200,0.7)",
                    wordBreak: "break-all",
                    textAlign: "right",
                    lineHeight: 1.4,
                    maxWidth: 280,
                  }}
                >
                  {getShareUrl()}
                </code>
                <button
                  onClick={copyShareLink}
                  style={{
                    background: copiedShare ? "rgba(74,222,128,0.15)" : "rgba(0,229,200,0.12)",
                    border: `1px solid ${copiedShare ? "rgba(74,222,128,0.4)" : "rgba(0,229,200,0.3)"}`,
                    borderRadius: 8,
                    padding: "7px 18px",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: copiedShare ? "#4ade80" : "#00e5c8",
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {copiedShare ? "✓ Link copiato!" : "📋 Copia link"}
                </button>
              </div>
            </div>

            {/* Campo email — invia link demo */}
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                padding: "1rem 1.2rem",
                marginBottom: "1.2rem",
              }}
            >
              <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "rgba(226,232,240,0.8)", marginBottom: 4 }}>
                📧 Invia questa analisi via email
              </p>
              <p style={{ fontSize: "0.75rem", color: "rgba(226,232,240,0.4)", marginBottom: 12, lineHeight: 1.5 }}>
                Il destinatario riceverà il link con TrustGrade, hash SHA-256 e accesso diretto alla demo.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => { setEmailInput(e.target.value); setEmailError(""); }}
                  placeholder="email@destinatario.com"
                  style={{
                    flex: 1,
                    minWidth: 200,
                    padding: "9px 14px",
                    background: "rgba(255,255,255,0.05)",
                    border: `1px solid ${emailError ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.15)"}`,
                    borderRadius: 8,
                    color: "#e2e8f0",
                    fontSize: "0.88rem",
                    fontFamily: "'DM Sans', sans-serif",
                    outline: "none",
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSendEmail()}
                />
                <button
                  onClick={handleSendEmail}
                  disabled={!emailInput.trim() || sendDemoMutation.isPending || emailSent}
                  style={{
                    background: emailSent ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.08)",
                    border: `1px solid ${emailSent ? "rgba(74,222,128,0.4)" : "rgba(255,255,255,0.2)"}`,
                    borderRadius: 8,
                    padding: "9px 18px",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: emailSent ? "#4ade80" : "rgba(226,232,240,0.8)",
                    cursor: emailInput.trim() && !emailSent ? "pointer" : "default",
                    fontFamily: "'DM Sans', sans-serif",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                    opacity: !emailInput.trim() ? 0.45 : 1,
                  }}
                >
                  {sendDemoMutation.isPending ? "Invio..." : emailSent ? "✓ Inviata!" : "Invia"}
                </button>
              </div>
              {emailError && (
                <p style={{ marginTop: 8, fontSize: "0.78rem", color: "#f87171" }}>{emailError}</p>
              )}
            </div>

            {/* CTA certificazione */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(255,85,0,0.08) 0%, rgba(0,229,200,0.06) 100%)",
                border: "1px solid rgba(255,85,0,0.2)",
                borderRadius: 16,
                padding: "1.5rem",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#ffffff",
                  marginBottom: 8,
                }}
              >
                Vuoi la certificazione completa con ancoraggio IPFS?
              </p>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "rgba(226,232,240,0.6)",
                  marginBottom: "1.2rem",
                  lineHeight: 1.6,
                }}
              >
                La versione certificata aggiunge +25 punti al TrustScore, genera un report
                immutabile su blockchain IPFS e produce un URL pubblico verificabile per sempre.
              </p>
              <Link href="/verify/join">
                <span
                  style={{
                    display: "inline-block",
                    background: "linear-gradient(135deg, #ff5500 0%, #ff7733 100%)",
                    borderRadius: 10,
                    padding: "11px 28px",
                    fontSize: "0.92rem",
                    fontWeight: 700,
                    color: "#ffffff",
                    cursor: "pointer",
                    fontFamily: "'Space Grotesk', sans-serif",
                    letterSpacing: "-0.01em",
                    textDecoration: "none",
                  }}
                >
                  Richiedi accesso a Verify →
                </span>
              </Link>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Spinner CSS */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
