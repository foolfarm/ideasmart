/*
 * PROOFPRESS VERIFY AGENT™ — Pagina prodotto
 * Certificazione degli agenti AI e dei loro output
 * Design: dark editorial, coerente con ProofPressVerify.tsx
 * Sezioni: hero → problema → come funziona (5 step) → model-agnostic → pricing → CTA
 */
import { useState } from "react";
import { Link } from "wouter";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import LeftSidebar from "@/components/LeftSidebar";
import SEOHead from "@/components/SEOHead";
import { ChevronDown, ChevronUp, Shield, CheckCircle, Code, Globe, FileCheck, Zap, Lock, AlertTriangle } from "lucide-react";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "JetBrains Mono, 'Courier New', monospace";
const RED = "#e63329";

/* ── Divider ── */
function Divider() {
  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8">
      <div className="border-t border-white/8" />
    </div>
  );
}

/* ── Label ── */
function Label({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] mb-4"
      style={{ color: accent ? RED : "rgba(255,255,255,0.4)", fontFamily: FONT }}
    >
      {children}
    </span>
  );
}

/* ── Section wrapper ── */
function Section({ children, bg = "transparent", id, className = "" }: {
  children: React.ReactNode; bg?: string; id?: string; className?: string;
}) {
  return (
    <section id={id} className={`py-20 md:py-28 ${className}`} style={{ background: bg }}>
      <div className="max-w-5xl mx-auto px-5 md:px-8">{children}</div>
    </section>
  );
}

/* ── Model logos badge ── */
const MODELS = [
  { name: "Claude", color: "#d97706" },
  { name: "GPT-4o", color: "#10a37f" },
  { name: "Gemini", color: "#4285f4" },
  { name: "Llama", color: "#7c3aed" },
  { name: "Mistral", color: "#f59e0b" },
  { name: "Grok", color: "#e5e7eb" },
  { name: "DeepSeek", color: "#06b6d4" },
  { name: "Custom", color: "#6b7280" },
];

/* ── Tech Specs ── */
function TechSpecs() {
  const [open, setOpen] = useState(false);
  const specs = [
    { label: "Hashing", value: "SHA-256 sul payload completo: output + metadata + Agent DID + timestamp. Immutabile e verificabile indipendentemente da ProofPress." },
    { label: "Archiviazione", value: "IPFS tramite Pinata. CID pubblico verificabile su qualsiasi gateway IPFS. Ogni Output Certificate ha un hash permanente." },
    { label: "Agent Identity Standard", value: "W3C Decentralized Identifiers (DIDs) v1.1 — standard aperto, interoperabile con qualsiasi sistema di identità digitale." },
    { label: "Behavioral Testing", value: "OWASP Top 10 for Agentic Applications — 100 prompt standardizzati per settore, hallucination rate measurement, prompt injection resistance." },
    { label: "Content Verification", value: "Corroborator ProofPress: 200+ fonti autorevoli, Claude 3.5 per contradiction detection, Perplexity Sonar Pro per real-time search." },
    { label: "Latenza certificazione", value: "Output Certification: 2–5 secondi in modalità real-time. Batch processing disponibile per volumi > 1.000 output/giorno." },
    { label: "Compliance", value: "EU AI Act (Regolamento UE 2024/1689) — Art. 11 (documentazione tecnica), Art. 12 (audit trail), Art. 14 (supervisione umana), Art. 50 (trasparenza)." },
    { label: "Integrazione", value: "API REST + SDK TypeScript/Python. Compatibile con LangChain, AutoGen, CrewAI, n8n, Make, Zapier e qualsiasi framework agentic." },
  ];
  return (
    <div className="border border-white/10 mt-10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/3 transition-colors"
        style={{ fontFamily: FONT }}
      >
        <span className="text-sm font-bold uppercase tracking-widest text-white/50">Specifiche tecniche complete</span>
        {open ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
      </button>
      {open && (
        <div className="border-t border-white/8">
          {specs.map((s, i) => (
            <div key={i} className="flex gap-6 px-6 py-4 border-b border-white/5 last:border-0">
              <div className="w-48 shrink-0 text-xs font-bold uppercase tracking-wider text-white/40" style={{ fontFamily: FONT }}>{s.label}</div>
              <div className="text-sm text-white/70 leading-relaxed" style={{ fontFamily: FONT }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function VerifyAgent() {
  const [activePlan, setActivePlan] = useState<string | null>(null);

  const plans = [
    {
      id: "starter",
      name: "Agent Starter",
      price: "€299",
      period: "/mese",
      target: "AI startup, PMI",
      features: [
        "1 agente certificato",
        "500 output/mese",
        "Output Certificate + badge verificabile",
        "Agent DID (W3C standard)",
        "Dashboard base",
        "Support email",
      ],
      cta: "Inizia gratis 14 giorni",
      highlight: false,
    },
    {
      id: "professional",
      name: "Agent Professional",
      price: "€799",
      period: "/mese",
      target: "Aziende mid-market",
      features: [
        "5 agenti certificati",
        "2.000 output/mese",
        "EU AI Act Compliance Report",
        "Behavioral Testing completo",
        "Provenance Chain IPFS",
        "API access + SDK",
        "Support prioritario",
      ],
      cta: "Richiedi demo",
      highlight: true,
    },
    {
      id: "enterprise",
      name: "Agent Enterprise",
      price: "€2.499",
      period: "/mese",
      target: "Banche, healthcare, legal",
      features: [
        "Agenti illimitati",
        "Output illimitati",
        "Audit trail dedicato",
        "SLA 99.9%",
        "EU AI Act documentation auto-generata",
        "Integrazione regolatori",
        "Account manager dedicato",
        "On-premise option",
      ],
      cta: "Contatta il team enterprise",
      highlight: false,
    },
    {
      id: "cas",
      name: "Certification-as-a-Service",
      price: "€4.999",
      period: " una tantum",
      target: "AI vendor, system integrator",
      features: [
        "Certificazione completa agente",
        "Badge ProofPress Certified Agent™",
        "Documentazione EU AI Act inclusa",
        "Report Behavioral Testing",
        "Valido 12 mesi",
        "Rinnovabile a €1.999/anno",
      ],
      cta: "Richiedi certificazione",
      highlight: false,
    },
  ];

  return (
    <div style={{ background: "#0a0f1e", minHeight: "100vh", fontFamily: FONT }}>
      <SEOHead
        title="ProofPress Verify Agent™ — Certificazione Agenti AI | ProofPress"
        description="Certifica gli output dei tuoi agenti AI e la loro identità. Conforme EU AI Act. Model-agnostic: funziona con Claude, GPT-4o, Gemini, Llama e qualsiasi modello."
      />

      <LeftSidebar />

      <div className="ml-0 md:ml-14">
        <SharedPageHeader />
        {/* ── HERO ── */}
        <section className="relative overflow-hidden" style={{ background: "#0a0f1e", minHeight: "92vh" }}>
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "60px 60px"
            }}
          />
          {/* Glow */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #e63329 0%, transparent 70%)", transform: "translate(30%, -30%)" }}
          />

          <div className="relative max-w-5xl mx-auto px-5 md:px-8 pt-24 pb-20">
            {/* Badge */}
            <div className="flex items-center gap-3 mb-8">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em]"
                style={{ background: RED, color: "#fff", fontFamily: FONT }}>
                NUOVO PRODOTTO
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/30">
                Disponibile agosto 2026 — Early access aperto
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-black leading-[0.9] mb-8 text-white"
              style={{ fontSize: "clamp(52px, 8vw, 96px)", fontFamily: FONT, letterSpacing: "-0.03em" }}>
              Certifica i tuoi<br />
              <span style={{ color: RED }}>Agenti AI.</span><br />
              Qualsiasi modello.
            </h1>

            {/* Subhead */}
            <p className="text-xl md:text-2xl text-white/60 max-w-2xl mb-10 leading-relaxed" style={{ fontFamily: FONT }}>
              ProofPress Verify Agent™ è l'infrastruttura di certificazione per agenti AI.
              Certifica ogni output, attesta l'identità dell'agente, garantisce la conformità EU AI Act.
              Funziona con Claude, GPT-4o, Gemini, Llama — e con qualsiasi modello tu stia usando.
            </p>

            {/* CTA */}
            <div className="flex flex-wrap gap-4 mb-16">
              <a href="mailto:andrea.cinelli@foolfarm.com?subject=ProofPress Verify Agent - Early Access&body=Sono interessato all'early access di ProofPress Verify Agent™. Ecco il mio caso d'uso:"
                className="inline-flex items-center gap-2 px-8 py-4 font-bold text-white transition-all hover:opacity-90"
                style={{ background: RED, fontFamily: FONT, fontSize: "15px" }}>
                Richiedi Early Access →
              </a>
              <a href="#come-funziona"
                className="inline-flex items-center gap-2 px-8 py-4 font-bold text-white/80 border border-white/20 transition-all hover:border-white/40 hover:text-white"
                style={{ fontFamily: FONT, fontSize: "15px" }}>
                Come funziona ↓
              </a>
            </div>

            {/* KPI strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px border border-white/8" style={{ background: "rgba(255,255,255,0.05)" }}>
              {[
                { n: "2 ago 2026", label: "EU AI Act — piena applicabilità" },
                { n: "46.3%", label: "CAGR mercato agenti AI 2025–2030" },
                { n: "3%", label: "Sanzione max fatturato globale" },
                { n: "Any model", label: "Compatibilità modelli AI" },
              ].map((k, i) => (
                <div key={i} className="px-6 py-5" style={{ background: "#0a0f1e" }}>
                  <div className="text-2xl font-black text-white mb-1" style={{ fontFamily: FONT }}>{k.n}</div>
                  <div className="text-xs text-white/40 uppercase tracking-wider" style={{ fontFamily: FONT }}>{k.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* ── IL PROBLEMA ── */}
        <Section bg="#0a0f1e">
          <Label>Il problema</Label>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight" style={{ fontFamily: FONT, letterSpacing: "-0.02em" }}>
            Gli agenti AI decidono.<br />
            <span className="text-white/40">Nessuno certifica che abbiano deciso bene.</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-px border border-white/8 mb-12" style={{ background: "rgba(255,255,255,0.05)" }}>
            {[
              {
                icon: <AlertTriangle className="w-6 h-6" style={{ color: RED }} />,
                title: "Allucinazioni non rilevate",
                body: "Un agente AI può produrre output plausibili ma factualmente errati. Senza verifica, questi errori raggiungono clienti, investitori e regolatori.",
              },
              {
                icon: <Lock className="w-6 h-6" style={{ color: RED }} />,
                title: "Nessun audit trail",
                body: "L'EU AI Act richiede logging immutabile di ogni decisione per i sistemi ad alto rischio. La maggior parte dei deployment attuali non lo ha.",
              },
              {
                icon: <Shield className="w-6 h-6" style={{ color: RED }} />,
                title: "Identità non verificabile",
                body: "Chi garantisce che l'agente che ha prodotto quel report sia la versione dichiarata, con quella configurazione, in quel momento?",
              },
            ].map((p, i) => (
              <div key={i} className="p-8" style={{ background: "#0a0f1e" }}>
                <div className="mb-4">{p.icon}</div>
                <h3 className="text-lg font-bold text-white mb-3" style={{ fontFamily: FONT }}>{p.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed" style={{ fontFamily: FONT }}>{p.body}</p>
              </div>
            ))}
          </div>
          <div className="border-l-4 pl-6 py-2" style={{ borderColor: RED }}>
            <p className="text-lg text-white/70 leading-relaxed" style={{ fontFamily: FONT }}>
              <strong className="text-white">ProofPress Verify Agent™</strong> risolve questi tre problemi con un'unica API:
              certifica ogni output, attesta l'identità dell'agente, genera l'audit trail conforme EU AI Act.
              In 3 righe di codice.
            </p>
          </div>
        </Section>

        <Divider />

        {/* ── COME FUNZIONA ── */}
        <Section bg="#0a0f1e" id="come-funziona">
          <Label accent>Come funziona</Label>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight" style={{ fontFamily: FONT, letterSpacing: "-0.02em" }}>
            5 step. Una sola API.
          </h2>
          <p className="text-lg text-white/50 mb-14 max-w-2xl" style={{ fontFamily: FONT }}>
            Dal momento in cui registri il tuo agente a quando il primo output viene certificato: meno di 48 ore.
          </p>

          <div className="space-y-px border border-white/8">
            {[
              {
                n: "01",
                title: "Registrazione dell'agente",
                timing: "Una tantum — 5 minuti",
                body: "Chiami l'API di registrazione con il nome dell'agente, il provider del modello (Claude, GPT-4o, Gemini, Llama, custom…), la versione, l'organizzazione deployer e lo scope operativo. ProofPress emette un Agent DID — un identificatore univoco e immutabile basato sullo standard W3C — che diventa il \"codice fiscale\" del tuo agente.",
                code: `POST /api/verify-agent/register
{
  "agentName": "FinanceAdvisor-v2.1",
  "modelProvider": "anthropic",
  "modelVersion": "claude-3-5-sonnet",
  "deployerOrg": "Acme Bank SpA",
  "scope": ["financial_analysis"]
}
→ { "agentDID": "did:proofpress:agent:7f3a..." }`,
              },
              {
                n: "02",
                title: "Behavioral Testing automatico",
                timing: "Automatico — 48 ore",
                body: "ProofPress esegue automaticamente 100 prompt standardizzati per il settore dichiarato, misura il tasso di allucinazioni, testa la resistenza a prompt injection e verifica la coerenza delle risposte. Il risultato è un Behavioral Score da 0 a 100 e un Behavioral Consistency Certificate. Nessun accesso al modello richiesto — i test sono black-box sull'output.",
                code: `// Risultato automatico dopo 48h
{
  "behavioralScore": 94,
  "hallucinationRate": "1.2%",
  "promptInjectionResistance": "HIGH",
  "consistencyScore": 97,
  "certificate": "PP-BHV-2026-00123"
}`,
              },
              {
                n: "03",
                title: "Certificazione EU AI Act",
                timing: "Automatico — incluso nel piano Professional+",
                body: "ProofPress classifica automaticamente il tuo agente secondo l'Allegato III dell'EU AI Act, identifica i gap di compliance e genera la documentazione tecnica richiesta dall'Art. 11. Il risultato è un EU AI Act Compliance Certificate che attesta la conformità del sistema per la categoria di rischio dichiarata.",
                code: `{
  "euAiActCategory": "high_risk",
  "complianceGaps": [],
  "art11DocGenerated": true,
  "art12AuditTrail": "ENABLED",
  "art14HumanOversight": "DOCUMENTED",
  "certificate": "PP-EUAI-2026-00045"
}`,
              },
              {
                n: "04",
                title: "Certificazione degli output (real-time)",
                timing: "2–5 secondi per output",
                body: "Ogni volta che il tuo agente produce un output rilevante, chiami l'API con una singola riga di codice. ProofPress hasha l'output con SHA-256, lo archivia su IPFS, verifica le affermazioni chiave contro 200+ fonti autorevoli, assegna il Certification Grade (A/B/C/D) e restituisce il certificato con link pubblico verificabile. Il link all'Agent DID crea la Provenance Chain immutabile.",
                code: `POST /api/verify-agent/certify-output
{
  "agentDID": "did:proofpress:agent:7f3a...",
  "output": "Analisi Q1 2026: il titolo XYZ...",
  "outputType": "financial_report"
}
→ {
  "certId": "PP-AGT-2026-00847",
  "grade": "A",
  "verifyUrl": "https://proofpress.ai/verify/PP-AGT-2026-00847"
}`,
              },
              {
                n: "05",
                title: "Verifica pubblica",
                timing: "Istantanea — sempre disponibile",
                body: "Chiunque — un cliente, un regolatore, un avvocato — può verificare qualsiasi output certificato visitando il link pubblico o scansionando il QR code allegato al documento. La pagina mostra: chi ha prodotto l'output, quando, come è stato verificato, le fonti consultate, il Certification Grade e lo stato del certificato agente (attivo, scaduto, revocato).",
                code: `GET /api/verify-agent/check/PP-AGT-2026-00847
→ {
  "valid": true,
  "agentDID": "did:proofpress:agent:7f3a...",
  "agentName": "FinanceAdvisor-v2.1",
  "modelProvider": "anthropic",
  "grade": "A",
  "sourcesChecked": 47,
  "contradictionsFound": 0,
  "agentCertStatus": "active"
}`,
              },
            ].map((step, i) => (
              <div key={i} className="grid md:grid-cols-2 gap-0" style={{ background: "#0a0f1e", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="p-8 border-r border-white/6">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-5xl font-black leading-none" style={{ color: "rgba(255,255,255,0.08)", fontFamily: FONT }}>{step.n}</span>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: RED, fontFamily: FONT }}>{step.timing}</div>
                      <h3 className="text-xl font-bold text-white" style={{ fontFamily: FONT }}>{step.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-white/55 leading-relaxed" style={{ fontFamily: FONT }}>{step.body}</p>
                </div>
                <div className="p-8 flex items-center" style={{ background: "#060a14" }}>
                  <pre className="text-xs text-green-400/80 overflow-x-auto w-full leading-relaxed" style={{ fontFamily: MONO }}>{step.code}</pre>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Divider />

        {/* ── MODEL AGNOSTIC ── */}
        <Section bg="#0d1117">
          <Label>Compatibilità</Label>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight" style={{ fontFamily: FONT, letterSpacing: "-0.02em" }}>
            Funziona con qualsiasi<br />
            <span style={{ color: RED }}>modello AI.</span>
          </h2>
          <p className="text-lg text-white/55 max-w-2xl mb-12 leading-relaxed" style={{ fontFamily: FONT }}>
            ProofPress non certifica il modello — certifica l'<strong className="text-white">output</strong> e il <strong className="text-white">comportamento</strong> dell'agente.
            Esattamente come un certificato SSL non certifica il linguaggio di programmazione del server, ma la sua identità e affidabilità.
            Il tuo agente può essere costruito con qualsiasi tecnologia.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
            {MODELS.map((m, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4 border border-white/8 hover:border-white/20 transition-colors" style={{ background: "#0a0f1e" }}>
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: m.color }} />
                <span className="text-sm font-bold text-white/80" style={{ fontFamily: FONT }}>{m.name}</span>
                <CheckCircle className="w-4 h-4 ml-auto" style={{ color: m.color, opacity: 0.7 }} />
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-px border border-white/8" style={{ background: "rgba(255,255,255,0.05)" }}>
            {[
              {
                icon: <Code className="w-5 h-5" style={{ color: RED }} />,
                title: "Compatibile con tutti i framework",
                body: "LangChain, AutoGen, CrewAI, n8n, Make, Zapier, LlamaIndex. Se il tuo agente produce un output testuale, ProofPress può certificarlo.",
              },
              {
                icon: <Globe className="w-5 h-5" style={{ color: RED }} />,
                title: "API REST + SDK",
                body: "SDK ufficiali per TypeScript e Python. Integrazione in meno di un'ora. Documentazione completa con esempi per ogni framework agentic.",
              },
              {
                icon: <Zap className="w-5 h-5" style={{ color: RED }} />,
                title: "3 righe di codice",
                body: "L'integrazione minima richiede una sola chiamata API dopo ogni output dell'agente. Nessuna modifica all'architettura esistente.",
              },
            ].map((f, i) => (
              <div key={i} className="p-8" style={{ background: "#0a0f1e" }}>
                <div className="mb-4">{f.icon}</div>
                <h3 className="text-base font-bold text-white mb-2" style={{ fontFamily: FONT }}>{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed" style={{ fontFamily: FONT }}>{f.body}</p>
              </div>
            ))}
          </div>
        </Section>

        <Divider />

        {/* ── USE CASES ── */}
        <Section bg="#0a0f1e">
          <Label>Casi d'uso</Label>
          <h2 className="text-4xl font-black text-white mb-12 leading-tight" style={{ fontFamily: FONT, letterSpacing: "-0.02em" }}>
            Chi ne ha bisogno — e perché adesso.
          </h2>
          <div className="grid md:grid-cols-2 gap-px border border-white/8" style={{ background: "rgba(255,255,255,0.05)" }}>
            {[
              {
                sector: "Finanza & IR",
                tag: "MAR + MiFID II",
                title: "Agenti di analisi finanziaria",
                body: "Un agente che produce raccomandazioni di investimento o comunicati price-sensitive è soggetto a MAR. L'Output Certificate con Provenance Chain è l'audit trail immutabile richiesto dai compliance officer e dalla Consob.",
                urgency: "Alta — sanzioni fino al 3% fatturato",
              },
              {
                sector: "Legal & Compliance",
                tag: "EU AI Act Art. 11-14",
                title: "Agenti di due diligence e contract review",
                body: "Gli output di agenti legali influenzano decisioni da milioni di euro. Il certificato diventa evidenza documentale in caso di dispute. La documentazione tecnica auto-generata soddisfa i requisiti EU AI Act per sistemi ad alto rischio.",
                urgency: "Alta — responsabilità professionale",
              },
              {
                sector: "Healthcare",
                tag: "EU AI Act Annex III",
                title: "Agenti diagnostici e di triage",
                body: "Classificati come sistemi AI ad alto rischio dall'EU AI Act. La certificazione è prerequisito per la messa in produzione in ambito clinico. Il Behavioral Testing misura l'hallucination rate su dataset medici standardizzati.",
                urgency: "Critica — prerequisito normativo",
              },
              {
                sector: "Corporate Communication",
                tag: "CSRD + ESG",
                title: "Agenti per report ESG e comunicati",
                body: "I documenti di sostenibilità prodotti con assistenza AI devono essere verificabili per soddisfare la CSRD. L'Output Certificate con Certification Grade A/B/C/D diventa parte integrante del processo di reporting.",
                urgency: "Media-Alta — CSRD obbligatoria 2025+",
              },
              {
                sector: "AI Vendors",
                tag: "Differenziatore commerciale",
                title: "Startup e aziende che vendono agenti AI",
                body: "Il badge ProofPress Certified Agent™ diventa un differenziatore commerciale verso clienti enterprise e regulated. Dimostra che il prodotto è stato testato, certificato e soddisfa i requisiti EU AI Act — riducendo il ciclo di vendita.",
                urgency: "Media — vantaggio competitivo",
              },
              {
                sector: "Agentic Platforms",
                tag: "Trust infrastructure",
                title: "Piattaforme multi-agent e orchestratori",
                body: "Le piattaforme che orchestrano più agenti in pipeline complesse possono certificare ogni step del workflow. La Provenance Chain traccia l'intero percorso decisionale dall'input iniziale all'output finale.",
                urgency: "Media — governance agentic",
              },
            ].map((uc, i) => (
              <div key={i} className="p-8" style={{ background: "#0a0f1e" }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-1" style={{ background: RED, color: "#fff", fontFamily: FONT }}>{uc.sector}</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30" style={{ fontFamily: FONT }}>{uc.tag}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-3" style={{ fontFamily: FONT }}>{uc.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed mb-4" style={{ fontFamily: FONT }}>{uc.body}</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: uc.urgency.startsWith("Critica") ? "#ef4444" : uc.urgency.startsWith("Alta") ? RED : "#f59e0b" }} />
                  <span className="text-xs text-white/30 font-bold uppercase tracking-wider" style={{ fontFamily: FONT }}>Urgenza: {uc.urgency}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Divider />

        {/* ── PRICING ── */}
        <Section bg="#0d1117" id="pricing">
          <Label accent>Pricing</Label>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight" style={{ fontFamily: FONT, letterSpacing: "-0.02em" }}>
            Scegli il piano giusto<br />per il tuo agente.
          </h2>
          <p className="text-lg text-white/50 mb-12" style={{ fontFamily: FONT }}>
            Early access disponibile. Prezzi bloccati per i primi 50 clienti.
          </p>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-px border border-white/8" style={{ background: "rgba(255,255,255,0.05)" }}>
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="p-8 flex flex-col transition-all cursor-pointer"
                style={{
                  background: plan.highlight ? RED : "#0a0f1e",
                  outline: activePlan === plan.id ? `2px solid ${RED}` : "none",
                }}
                onClick={() => setActivePlan(activePlan === plan.id ? null : plan.id)}
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: plan.highlight ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.3)", fontFamily: FONT }}>
                  {plan.target}
                </div>
                <div className="text-xl font-black text-white mb-1" style={{ fontFamily: FONT }}>{plan.name}</div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-white" style={{ fontFamily: FONT }}>{plan.price}</span>
                  <span className="text-sm text-white/50" style={{ fontFamily: FONT }}>{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-8 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: plan.highlight ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.55)", fontFamily: FONT }}>
                      <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: plan.highlight ? "#fff" : RED }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={`mailto:andrea.cinelli@foolfarm.com?subject=ProofPress Verify Agent - ${plan.name}&body=Sono interessato al piano ${plan.name}.`}
                  className="block text-center py-3 font-bold text-sm transition-all hover:opacity-90"
                  style={{
                    background: plan.highlight ? "#fff" : RED,
                    color: plan.highlight ? RED : "#fff",
                    fontFamily: FONT,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </Section>

        <Divider />

        {/* ── TECH SPECS ── */}
        <Section bg="#0a0f1e">
          <Label>Specifiche</Label>
          <h2 className="text-3xl font-black text-white mb-2" style={{ fontFamily: FONT, letterSpacing: "-0.02em" }}>
            Architettura tecnica
          </h2>
          <p className="text-base text-white/50 mb-2" style={{ fontFamily: FONT }}>
            Standard aperti, interoperabili, indipendenti da ProofPress per la verifica.
          </p>
          <TechSpecs />
        </Section>

        <Divider />

        {/* ── CTA FINALE ── */}
        <section className="py-24" style={{ background: RED }}>
          <div className="max-w-5xl mx-auto px-5 md:px-8 text-center">
            <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/60 mb-6" style={{ fontFamily: FONT }}>
              Early Access — Posti limitati
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight" style={{ fontFamily: FONT, letterSpacing: "-0.03em" }}>
              Il tuo agente AI<br />è certificato?
            </h2>
            <p className="text-xl text-white/75 max-w-xl mx-auto mb-10 leading-relaxed" style={{ fontFamily: FONT }}>
              Dal 2 agosto 2026, l'EU AI Act rende la certificazione obbligatoria per gli agenti ad alto rischio.
              Inizia adesso — i primi 50 clienti ottengono il prezzo bloccato per 12 mesi.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="mailto:andrea.cinelli@foolfarm.com?subject=ProofPress Verify Agent - Early Access&body=Sono interessato all'early access di ProofPress Verify Agent™. Il mio caso d'uso:"
                className="inline-flex items-center gap-2 px-10 py-5 font-bold text-lg transition-all hover:opacity-90"
                style={{ background: "#fff", color: RED, fontFamily: FONT }}
              >
                Richiedi Early Access →
              </a>
              <Link
                href="/proofpress-verify"
                className="inline-flex items-center gap-2 px-10 py-5 font-bold text-lg border-2 border-white/40 text-white transition-all hover:border-white"
                style={{ fontFamily: FONT }}
              >
                Scopri tutta la suite Verify
              </Link>
            </div>
          </div>
        </section>

        <SharedPageFooter />
      </div>
    </div>
  );
}
