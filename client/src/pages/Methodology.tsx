import { useState } from "react";
import { Link } from "wouter";
import { Eye, EyeOff, Download, Lock } from "lucide-react";
import SharedPageHeader from "@/components/SharedPageHeader";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import LeftSidebar from "@/components/LeftSidebar";
import SharedPageFooter from "@/components/SharedPageFooter";

// ─── Costanti ─────────────────────────────────────────────────────────────────
const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const ORANGE = "#ff5500";
const CYAN = "#00e5c8";
const WHITEPAPER_URL = "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ProofPress_Verify_WhitePaper_v4.0_6067b788.pdf";
const ACCESS_USER = "proofpress";
const ACCESS_PASS = "verify";

// ─── Componenti helper (stesso stile di ChiSiamo) ─────────────────────────────
function Divider() {
  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8">
      <div className="border-t border-[#0a0a0a]/8" />
    </div>
  );
}

function Label({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <span
      className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] mb-4"
      style={{ color: light ? "rgba(255,255,255,0.4)" : "rgba(10,10,10,0.4)", fontFamily: FONT }}
    >
      {children}
    </span>
  );
}

function Section({ children, bg = "transparent", id }: {
  children: React.ReactNode; bg?: string; id?: string;
}) {
  return (
    <section id={id} className="py-20 md:py-28" style={{ background: bg }}>
      <div className="max-w-5xl mx-auto px-5 md:px-8">{children}</div>
    </section>
  );
}

// ─── Login Gate ───────────────────────────────────────────────────────────────
function LoginGate({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === ACCESS_USER && password === ACCESS_PASS) {
      onSuccess();
    } else {
      setError("Credenziali non valide. Riprova.");
    }
  };

  return (
    <div className="flex min-h-screen" style={{ fontFamily: FONT }}>
      <LeftSidebar />
      <div className="flex-1 min-w-0">
        <div className="min-h-screen" style={{ background: "#ffffff", color: "#0a0a0a" }}>
          <SharedPageHeader />
          <BreakingNewsTicker />

          {/* Hero login */}
          <section className="pt-24 pb-20 md:pt-32 md:pb-28" style={{ background: "#ffffff" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              <div className="mb-6">
                <span
                  className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] px-3 py-1 border"
                  style={{ color: ORANGE, borderColor: `${ORANGE}44`, background: `${ORANGE}0d` }}
                >
                  DOCUMENTO RISERVATO · AXIOMIX LLC
                </span>
              </div>
              <div className="max-w-3xl mb-10">
                <h1 className="text-4xl md:text-6xl font-black leading-[1.05] tracking-tight text-[#0a0a0a] mb-6">
                  ProofPress Verify<br />
                  <span style={{ color: ORANGE }}>Methodology</span><br />
                  Reference v1.0
                </h1>
                <p className="text-lg leading-relaxed text-[#0a0a0a]/65 max-w-2xl">
                  Specifica tecnica del protocollo di certificazione e verifica fattuale. 
                  Accesso riservato — inserisci le credenziali per continuare.
                </p>
              </div>

              {/* Form login */}
              <div className="max-w-sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/40 mb-2">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={e => { setUsername(e.target.value); setError(""); }}
                      className="w-full border border-[#0a0a0a]/15 px-4 py-3 text-sm font-mono focus:outline-none focus:border-[#0a0a0a] transition-colors"
                      placeholder="username"
                      autoComplete="username"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/40 mb-2">Password</label>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        value={password}
                        onChange={e => { setPassword(e.target.value); setError(""); }}
                        className="w-full border border-[#0a0a0a]/15 px-4 py-3 text-sm font-mono focus:outline-none focus:border-[#0a0a0a] transition-colors pr-10"
                        placeholder="password"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0a0a0a]/30 hover:text-[#0a0a0a]/60"
                      >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 font-mono">{error}</p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-4 text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-80"
                    style={{ background: ORANGE }}
                  >
                    Accedi alla documentazione →
                  </button>
                </form>
                <div className="flex items-center gap-2 mt-6 text-xs text-[#0a0a0a]/35">
                  <Lock className="w-3 h-3" />
                  <span>Documento confidenziale · AxiomiX LLC · v1.0.0</span>
                </div>
              </div>
            </div>
          </section>

          <SharedPageFooter />
        </div>
      </div>
    </div>
  );
}

// ─── Contenuto principale ─────────────────────────────────────────────────────
function MethodologyContent() {
  return (
    <div className="flex min-h-screen" style={{ fontFamily: FONT }}>
      <LeftSidebar />
      <div className="flex-1 min-w-0">
        <div className="min-h-screen" style={{ background: "#ffffff", color: "#0a0a0a" }}>
          <SharedPageHeader />
          <BreakingNewsTicker />

          {/* ── HERO ── */}
          <section className="pt-24 pb-20 md:pt-32 md:pb-28" style={{ background: "#ffffff" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-xs text-[#0a0a0a]/35 font-mono mb-8">
                <Link href="/" className="hover:text-[#0a0a0a]/60 transition-colors">Home</Link>
                <span>→</span>
                <Link href="/proofpress-verify" className="hover:text-[#0a0a0a]/60 transition-colors">ProofPress Verify</Link>
                <span>→</span>
                <span className="text-[#0a0a0a]/60">Methodology v1</span>
              </div>

              <div className="mb-6">
                <span
                  className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] px-3 py-1 border"
                  style={{ color: ORANGE, borderColor: `${ORANGE}44`, background: `${ORANGE}0d` }}
                >
                  TECHNICAL REFERENCE · AXIOMIX LLC
                </span>
              </div>
              <div className="max-w-3xl mb-10">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-[#0a0a0a] mb-6">
                  ProofPress Verify.<br />
                  <span style={{ color: ORANGE }}>Come funziona,</span><br />
                  davvero.
                </h1>
                <p className="text-lg md:text-xl leading-relaxed text-[#0a0a0a]/65 max-w-2xl">
                  Specifica tecnica del protocollo di certificazione SHA-256, della pipeline di verifica agentica 
                  e del sistema di firma digitale per giornalisti. Versione 1.0.0.
                </p>
              </div>

              {/* KPI bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 py-8 border-t border-b border-[#0a0a0a]/8">
                {[
                  { val: "SHA-256", label: "algoritmo crittografico" },
                  { val: "8", label: "claim max per articolo" },
                  { val: "3", label: "fonti per claim" },
                  { val: "A–F", label: "grading trust score" },
                ].map(({ val, label }) => (
                  <div key={val}>
                    <div className="text-2xl md:text-3xl font-black mb-1" style={{ color: ORANGE }}>{val}</div>
                    <div className="text-xs text-[#0a0a0a]/50 uppercase tracking-wide leading-snug">{label}</div>
                  </div>
                ))}
              </div>

              {/* CTA download */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={WHITEPAPER_URL}
                  download="ProofPress_Verify_WhitePaper_v4.0.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-80"
                  style={{ background: ORANGE }}
                >
                  <Download className="w-4 h-4" />
                  Scarica White Paper PDF
                </a>
                <Link
                  href="/proofpress-verify"
                  className="inline-block px-8 py-4 text-sm font-bold uppercase tracking-widest border transition-colors hover:bg-[#0a0a0a]/5"
                  style={{ borderColor: "#0a0a0a", color: "#0a0a0a" }}
                >
                  ProofPress Verify →
                </Link>
              </div>
            </div>
          </section>

          <Divider />

          {/* ── MODULO 1: HASH ENGINE ── */}
          <Section bg="#f8f8f6" id="hash-engine">
            <Label>Modulo 1 — Certificazione</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-16">
              Hash Engine.<br />SHA-256 immutabile.
            </h2>
            <div className="space-y-12">
              {[
                {
                  n: "01",
                  title: "Payload strutturato",
                  text: "Ogni contenuto genera un payload UTF-8 per concatenazione: titolo + sommario + URL sorgente + timestamp ISO 8601. Per gli articoli del Journalist Portal, il payload include anche la journalistKey univoca dell'autore.",
                  code: `payload = title + "|" + summary + "|" + sourceUrl + "|" + createdAt.toISOString()\n// Journalist Portal:\npayload = title + "|" + body.substring(0, 500) + "|" + journalistKey + "|" + new Date().toISOString()`,
                  codeColor: CYAN,
                },
                {
                  n: "02",
                  title: "Generazione hash",
                  text: "Il payload è processato con Node.js crypto.createHash('sha256'). Output: 64 caratteri hex (256 bit). Collision resistance: 2¹²⁸ operazioni birthday-bound. L'hash è immutabile: una volta persistito nel database non può essere alterato senza invalidare la certificazione.",
                  code: `return createHash("sha256").update(payload, "utf8").digest("hex");`,
                  codeColor: CYAN,
                },
                {
                  n: "03",
                  title: "Badge PP-XXXXXXXXXXXXXXXX",
                  text: "I primi 16 caratteri dell'hash (uppercase) formano il badge visibile sull'articolo. Il badge è il riferimento pubblico per la verifica: ogni lettore può inserirlo nel sistema Verify per ottenere il Verification Report completo.",
                  code: `return \`PP-\${hash.substring(0, 16).toUpperCase()}\`;`,
                  codeColor: ORANGE,
                },
              ].map(({ n, title, text, code, codeColor }) => (
                <div key={n} className="grid md:grid-cols-[80px_1fr] gap-6">
                  <div className="text-5xl font-black text-[#0a0a0a]/8 leading-none">{n}</div>
                  <div>
                    <h3 className="text-xl font-black text-[#0a0a0a] mb-3">{title}</h3>
                    <p className="text-[#0a0a0a]/65 leading-relaxed mb-4">{text}</p>
                    <div className="bg-[#0a0a0a] rounded p-4 overflow-x-auto">
                      <code className="text-xs font-mono whitespace-pre" style={{ color: codeColor }}>{code}</code>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ── MODULO 2: PIPELINE ── */}
          <Section bg="#ffffff" id="pipeline">
            <Label>Modulo 2 — Verifica Agentica</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-4">
              Pipeline in 4 step.<br />Ogni claim verificato.
            </h2>
            <p className="text-[#0a0a0a]/55 text-lg mb-16 max-w-2xl">
              La pipeline (<code className="font-mono text-sm">server/verifyEngine.ts</code>) è invocata in modo asincrono dopo il commit dell'hash. 
              Massimo 8 claim per articolo, 3 fonti per claim, 3 retry con backoff esponenziale.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  step: "Step 1",
                  title: "Content Hashing",
                  color: "#0a0a0a",
                  desc: "Riutilizza l'hash del Modulo 1. Il verifyHash è incluso come content_hash_sha256 nel Verification Report, stabilendo il collegamento crittografico tra report e versione specifica del contenuto.",
                },
                {
                  step: "Step 2",
                  title: "Claim Extraction",
                  color: ORANGE,
                  desc: "Titolo e sommario sono processati da Claude API (claude-haiku-4-5) con prompt strutturato. Estrae claim fattuali verificabili in schema JSON. MAX_CLAIMS = 8. Retry: 3 tentativi, delay 2s → 4s → 8s.",
                },
                {
                  step: "Step 3",
                  title: "Multi-Source Corroboration",
                  color: CYAN,
                  desc: "Ogni claim è verificato su DuckDuckGo HTML endpoint + Google Fact Check Tools API. MAX_SOURCES_PER_CLAIM = 3. Stance detection via Claude: confirms | contradicts | neutral | unrelated.",
                },
                {
                  step: "Step 4",
                  title: "Trust Scoring",
                  color: "#7c3aed",
                  desc: "Trust score pesato: 0.55 × corroboration_ratio + 0.30 × (avg_credibility/10) + 0.15 × avg_independence_score. Normalizzato [0.000–1.000]. Grade A–F assegnato su soglie predefinite.",
                },
              ].map(({ step, title, color, desc }) => (
                <div
                  key={step}
                  className="border p-7"
                  style={{ borderColor: "rgba(10,10,10,0.1)" }}
                >
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color }}>{step}</div>
                  <h3 className="text-xl font-black text-[#0a0a0a] mb-3">{title}</h3>
                  <p className="text-sm text-[#0a0a0a]/60 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ── TRUST SCORE ── */}
          <Section bg="#f8f8f6" id="trust-score">
            <Label>Modulo 2 — Trust Score</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-16">
              Formula pesata.<br />Tre componenti.
            </h2>

            <div className="bg-[#0a0a0a] p-8 mb-10">
              <div className="text-[11px] font-mono text-white/30 uppercase tracking-widest mb-4">Weighted trust score computation</div>
              <pre className="font-mono leading-loose overflow-x-auto" style={{ color: CYAN, fontSize: "1rem" }}>{`trust_score = 0.55 × corroboration_ratio
            + 0.30 × (avg_credibility / 10.0)
            + 0.15 × avg_independence_score`}</pre>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {[
                { weight: "0.55", label: "corroboration_ratio", desc: "total_confirming / total_checked — su tutti i claim estratti" },
                { weight: "0.30", label: "avg_credibility / 10.0", desc: "Media pesata per numero di fonti, normalizzata su 10" },
                { weight: "0.15", label: "avg_independence_score", desc: "Media aritmetica dei per-claim independence_score" },
              ].map(({ weight, label, desc }) => (
                <div key={label} className="border border-[#0a0a0a]/10 p-6 bg-white">
                  <div className="text-4xl font-black mb-2" style={{ color: ORANGE }}>{weight}</div>
                  <div className="text-xs font-mono text-[#0a0a0a] mb-2">{label}</div>
                  <div className="text-xs text-[#0a0a0a]/50">{desc}</div>
                </div>
              ))}
            </div>

            {/* Grading table */}
            <Label>Grading Thresholds</Label>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ background: "#0a0a0a", color: "#ffffff" }}>
                    <th className="text-left p-4 font-mono text-sm">Grade</th>
                    <th className="text-left p-4 font-mono text-sm">Score Range</th>
                    <th className="text-left p-4 text-sm">Interpretation</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { grade: "A", range: "≥ 0.850", interp: "High corroboration, high-credibility sources, high source diversity", bg: "#f0fdf4", color: "#16a34a" },
                    { grade: "B", range: "≥ 0.700", interp: "Good corroboration with minor gaps", bg: "#eff6ff", color: "#1d4ed8" },
                    { grade: "C", range: "≥ 0.550", interp: "Partial corroboration or lower-credibility sources", bg: "#fefce8", color: "#ca8a04" },
                    { grade: "D", range: "≥ 0.400", interp: "Weak corroboration or significant source limitations", bg: "#fff7ed", color: "#c2410c" },
                    { grade: "F", range: "< 0.400", interp: "Insufficient corroboration or contradicting evidence", bg: "#fef2f2", color: "#dc2626" },
                  ].map(({ grade, range, interp, bg, color }) => (
                    <tr key={grade} style={{ background: bg }}>
                      <td className="p-4 font-mono font-black text-2xl" style={{ color }}>{grade}</td>
                      <td className="p-4 font-mono text-sm text-[#0a0a0a]/70">{range}</td>
                      <td className="p-4 text-sm text-[#0a0a0a]/70">{interp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Divider />

          {/* ── JOURNALIST PORTAL ── */}
          <Section bg="#ffffff" id="journalist-portal">
            <Label>Modulo 3 — Firma Digitale</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-4">
              Journalist Portal.<br />
              <span style={{ color: ORANGE }}>Ogni articolo firmato.</span>
            </h2>
            <p className="text-[#0a0a0a]/55 text-lg mb-16 max-w-2xl">
              Ogni giornalista accreditato ProofPress riceve una Journalist Key univoca. 
              La chiave è inclusa nel payload SHA-256: l'hash certifica simultaneamente contenuto, 
              timestamp e identità dell'autore.
            </p>

            <div className="space-y-12">
              {[
                {
                  n: "01",
                  title: "Journalist Key",
                  text: "Stringa crittograficamente univoca generata al momento dell'accreditamento. Associata all'identità del giornalista nel database. Non condivisibile: due articoli con journalistKey diverse producono hash distinti anche a parità di contenuto.",
                },
                {
                  n: "02",
                  title: "Signed Payload",
                  text: "Il payload dell'articolo include journalistKey come quarto campo. L'hash risultante è crittograficamente vincolato all'identità dell'autore. Il badge PP-XXXXXXXXXXXXXXXX sull'articolo certifica: contenuto + timestamp + autore.",
                },
                {
                  n: "03",
                  title: "Track Record verificabile",
                  text: "Ogni articolo pubblicato con firma digitale contribuisce al track record del giornalista: lista immutabile di pubblicazioni con badge, trust score e timestamp. Un portfolio verificabile da terze parti tramite API pubblica.",
                },
              ].map(({ n, title, text }) => (
                <div key={n} className="grid md:grid-cols-[80px_1fr] gap-6">
                  <div className="text-5xl font-black text-[#0a0a0a]/8 leading-none">{n}</div>
                  <div>
                    <h3 className="text-xl font-black text-[#0a0a0a] mb-3">{title}</h3>
                    <p className="text-[#0a0a0a]/65 leading-relaxed">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ── REPORT SCHEMA ── */}
          <Section bg="#f8f8f6" id="report-schema">
            <Label>Output — Verification Report</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-4">
              Schema JSON.<br />Struttura completa.
            </h2>
            <p className="text-[#0a0a0a]/55 text-lg mb-10 max-w-2xl">
              La pipeline produce un oggetto <code className="font-mono text-sm">FullVerificationReport</code> persistito 
              come JSON associato al record articolo nel database.
            </p>
            <div className="bg-[#0a0a0a] p-6 overflow-x-auto">
              <pre className="font-mono text-xs leading-relaxed" style={{ color: CYAN }}>{`interface FullVerificationReport {
  report_version: "1.0.0";
  report_id: string;           // UUID v4
  generated_at: string;        // ISO 8601
  article: {
    title: string;
    language: string;
    word_count: number;
    content_hash_sha256: string;
    url?: string | null;
  };
  claims: Claim[];
  corroboration: CorroborationResult[];
  fact_check_hits: FactCheckHit[];
  trust_score: TrustScore;
}`}</pre>
            </div>
          </Section>

          <Divider />

          {/* ── CTA FINALE ── */}
          <section className="py-20 md:py-28" style={{ background: "#0a0a0a" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              <Label light>Documentazione completa</Label>
              <h2 className="text-3xl md:text-4xl font-black leading-tight text-white mb-6">
                White Paper tecnico.<br />
                <span style={{ color: ORANGE }}>Scaricalo adesso.</span>
              </h2>
              <p className="text-white/50 text-lg mb-10 max-w-2xl">
                ProofPress Verify Architecture, Pipeline &amp; Journalist Certification System. 
                Versione 4.0 — AxiomiX LLC. Include architettura completa, parametri tecnici, 
                API specification, roadmap e compliance EU AI Act.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={WHITEPAPER_URL}
                  download="ProofPress_Verify_WhitePaper_v4.0.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-80"
                  style={{ background: ORANGE }}
                >
                  <Download className="w-4 h-4" />
                  Scarica White Paper PDF →
                </a>
                <Link
                  href="/proofpress-verify"
                  className="inline-block px-8 py-4 text-sm font-bold uppercase tracking-widest border border-white/20 text-white transition-colors hover:bg-white/5"
                >
                  ProofPress Verify →
                </Link>
              </div>
              <p className="text-white/20 text-xs font-mono mt-10">
                © 2025 AxiomiX LLC · ProofPress Verify Methodology v1.0.0 · Aprile 2025
              </p>
            </div>
          </section>

          <SharedPageFooter />
        </div>
      </div>
    </div>
  );
}

// ─── Entry point con login gate ───────────────────────────────────────────────
export default function Methodology() {
  const [authenticated, setAuthenticated] = useState(false);

  if (!authenticated) {
    return <LoginGate onSuccess={() => setAuthenticated(true)} />;
  }

  return <MethodologyContent />;
}
