import { Link } from "wouter";
import { ChevronRight, Hash, Cpu, BarChart3, Shield, FileText, ExternalLink } from "lucide-react";
import SharedPageHeader from "@/components/SharedPageHeader";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import LeftSidebar from "@/components/LeftSidebar";
import SharedPageFooter from "@/components/SharedPageFooter";

const WHITEPAPER_URL = ""; // verrà popolato dopo upload CDN

export default function Methodology() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <SharedPageHeader />
      <BreakingNewsTicker />

      <div className="flex max-w-[1400px] mx-auto">
        {/* Sidebar sinistra */}
        <aside className="hidden lg:block w-[280px] shrink-0 border-r border-gray-100 min-h-screen">
          <LeftSidebar />
        </aside>

        {/* Contenuto principale */}
        <main className="flex-1 min-w-0 px-6 py-8 max-w-4xl">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-xs text-gray-400 mb-6 font-mono">
            <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/proofpress-verify" className="hover:text-gray-600 transition-colors">ProofPress Verify</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-700 font-medium">Methodology v1</span>
          </nav>

          {/* Header */}
          <div className="border-b-2 border-[#0a0a0a] pb-6 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-[#0a0a0a] text-white text-[10px] font-mono px-2 py-0.5 tracking-widest uppercase">Technical Reference</span>
              <span className="text-gray-400 text-xs font-mono">v1.0 — AxiomiX LLC</span>
            </div>
            <h1 className="text-3xl font-bold text-[#0a0a0a] leading-tight mb-3">
              ProofPress Verify — Methodology Reference
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed max-w-2xl">
              Specifica tecnica del protocollo di certificazione e verifica fattuale implementato in ProofPress. 
              Questo documento descrive il modello crittografico, la pipeline di verifica agentica e la formula 
              di calcolo del Trust Score. Versione: 1.0.0 — Maintainer: AxiomiX LLC.
            </p>
          </div>

          {/* Anchor nav */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-10">
            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-3">Sezioni</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { href: "#hash-engine", label: "1. Hash Engine (SHA-256)" },
                { href: "#payload-spec", label: "2. Payload Specification" },
                { href: "#pipeline", label: "3. Agentic Verification Pipeline" },
                { href: "#claim-extraction", label: "4. Claim Extraction" },
                { href: "#corroboration", label: "5. Multi-Source Corroboration" },
                { href: "#trust-score", label: "6. Trust Score Formula" },
                { href: "#grading", label: "7. Grading Thresholds" },
                { href: "#report-schema", label: "8. Verification Report Schema" },
              ].map(({ href, label }) => (
                <a key={href} href={href} className="text-[#0a0a0a] hover:text-[#ff5500] font-mono text-xs transition-colors">
                  → {label}
                </a>
              ))}
            </div>
          </div>

          {/* ─── SEZIONE 1: Hash Engine ─── */}
          <section id="hash-engine" className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#0a0a0a] rounded flex items-center justify-center shrink-0">
                <Hash className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-[#0a0a0a]">1. Hash Engine — Certificazione SHA-256</h2>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              Ogni contenuto pubblicato su ProofPress riceve un hash crittografico SHA-256 immutabile al momento 
              della pubblicazione. L'hash è calcolato su un payload strutturato che include titolo, sommario, 
              URL sorgente e timestamp ISO 8601. Una volta generato e persistito nel database, l'hash non può 
              essere alterato senza invalidare la certificazione.
            </p>

            {/* ─── SEZIONE 2: Payload Spec ─── */}
            <div id="payload-spec" className="mt-6">
              <h3 className="text-base font-bold text-[#0a0a0a] mb-3 font-mono">2. Payload Specification</h3>
              <p className="text-gray-700 text-sm mb-3">
                Il payload è una stringa UTF-8 costruita per concatenazione con separatore <code className="bg-gray-100 px-1 rounded text-xs font-mono">|</code>:
              </p>
              <div className="bg-[#0a0a0a] rounded-lg p-4 mb-4">
                <p className="text-gray-400 text-xs font-mono mb-1">// Contenuto standard (pipeline automatica)</p>
                <code className="text-[#00e5c8] text-sm font-mono block">
                  payload = title + "|" + summary + "|" + sourceUrl + "|" + createdAt.toISOString()
                </code>
              </div>
              <div className="bg-[#0a0a0a] rounded-lg p-4 mb-4">
                <p className="text-gray-400 text-xs font-mono mb-1">// Contenuto firmato dal giornalista (Journalist Portal)</p>
                <code className="text-[#ff5500] text-sm font-mono block">
                  payload = title + "|" + body.substring(0, 500) + "|" + journalistKey + "|" + new Date().toISOString()
                </code>
              </div>
              <p className="text-gray-600 text-xs leading-relaxed bg-amber-50 border border-amber-200 rounded p-3">
                <strong>Nota:</strong> L'inclusione di <code className="font-mono">journalistKey</code> nel payload del Journalist Portal garantisce che l'hash sia crittograficamente vincolato all'identità dell'autore. Due articoli con contenuto testuale identico ma <code className="font-mono">journalistKey</code> diversi producono hash distinti.
              </p>
            </div>

            {/* Implementazione TypeScript */}
            <div className="mt-6">
              <h3 className="text-base font-bold text-[#0a0a0a] mb-3 font-mono">Implementazione (server/verify.ts)</h3>
              <div className="bg-[#0a0a0a] rounded-lg p-4 overflow-x-auto">
                <pre className="text-[#00e5c8] text-xs font-mono leading-relaxed">{`import { createHash } from "crypto";

export function generateVerifyHash(params: {
  title: string;
  summary: string;
  sourceUrl: string;
  createdAt: Date;
}): string {
  const payload = [
    params.title,
    params.summary,
    params.sourceUrl,
    params.createdAt.toISOString(),
  ].join("|");
  return createHash("sha256").update(payload, "utf8").digest("hex");
}

export function formatVerifyHash(hash: string): string {
  return \`PP-\${hash.substring(0, 16).toUpperCase()}\`;
}`}</pre>
              </div>
            </div>

            {/* Garanzie di integrità */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Output", value: "256 bit", desc: "64 caratteri hex" },
                { label: "Collision resistance", value: "2¹²⁸", desc: "operazioni birthday-bound" },
                { label: "Badge format", value: "PP-XXXXXXXXXXXXXXXX", desc: "16 char uppercase + prefisso" },
              ].map(({ label, value, desc }) => (
                <div key={label} className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 font-mono mb-1">{label}</p>
                  <p className="text-lg font-bold text-[#0a0a0a] font-mono">{value}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ─── SEZIONE 3: Pipeline ─── */}
          <section id="pipeline" className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#ff5500] rounded flex items-center justify-center shrink-0">
                <Cpu className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-[#0a0a0a]">3. Agentic Verification Pipeline</h2>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed mb-6">
              La pipeline di verifica (<code className="bg-gray-100 px-1 rounded text-xs font-mono">server/verifyEngine.ts</code>, <code className="bg-gray-100 px-1 rounded text-xs font-mono">server/corroborator.ts</code>) implementa un processo automatizzato di verifica fattuale in 4 step. La pipeline è invocata in modo asincrono dopo il commit dell'hash e il suo output è persistito come JSON strutturato associato al record articolo.
            </p>

            {/* Step cards */}
            <div className="space-y-4 mb-8">
              {[
                {
                  step: "Step 1",
                  title: "Content Hashing",
                  color: "border-l-[#0a0a0a]",
                  desc: "Riutilizza l'output del Module 1. Il verifyHash generato al momento della pubblicazione è incluso come campo content_hash_sha256 nel Verification Report, stabilendo un collegamento crittografico tra il report e la versione specifica del contenuto verificato."
                },
                {
                  step: "Step 2",
                  title: "Claim Extraction",
                  color: "border-l-[#ff5500]",
                  desc: "Titolo e sommario dell'articolo sono sottoposti all'API Anthropic Claude (modello: claude-haiku-4-5) con un prompt strutturato che richiede l'estrazione di claim fattuali verificabili. Il prompt impone uno schema JSON e limita l'estrazione a un massimo di 8 claim (MAX_CLAIMS = 8). Implementa retry con backoff esponenziale: 3 tentativi massimi con delay 2s, 4s, 8s."
                },
                {
                  step: "Step 3",
                  title: "Multi-Source Corroboration",
                  color: "border-l-[#00e5c8]",
                  desc: "Ogni claim verificabile è sottoposto a due backend di ricerca indipendenti: DuckDuckGo HTML endpoint e Google Fact Check Tools API. Massimo 3 fonti per claim (MAX_SOURCES_PER_CLAIM = 3). Per ogni fonte, stance detection via Claude API (temperature=0, STANCE_MAX_TOKENS=50): confirms | contradicts | neutral | unrelated."
                },
                {
                  step: "Step 4",
                  title: "Trust Scoring",
                  color: "border-l-purple-500",
                  desc: "Calcolo del trust score pesato su tutti i risultati di corroborazione. Il puntaggio grezzo è normalizzato in [0.000, 1.000] con 3 decimali. Un grade letterale A–F è assegnato in base a soglie predefinite."
                },
              ].map(({ step, title, color, desc }) => (
                <div key={step} className={`border-l-4 ${color} bg-gray-50 rounded-r-lg p-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">{step}</span>
                    <span className="text-sm font-bold text-[#0a0a0a]">{title}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            {/* Claim extraction schema */}
            <div id="claim-extraction" className="mb-8">
              <h3 className="text-base font-bold text-[#0a0a0a] mb-3 font-mono">4. Claim Schema</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0a0a0a] text-white">
                      <th className="text-left p-2 font-mono">Field</th>
                      <th className="text-left p-2 font-mono">Type</th>
                      <th className="text-left p-2 font-mono">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { field: "claim_id", type: "string", desc: "UUID v4 identifier" },
                      { field: "text", type: "string", desc: "Verbatim claim text" },
                      { field: "type", type: "enum", desc: "factual_event | statistic | quote | attribution | causal" },
                      { field: "entities", type: "string[]", desc: "Named entities referenced in the claim" },
                      { field: "verifiable", type: "boolean", desc: "LLM assessment of external verifiability" },
                    ].map(({ field, type, desc }, i) => (
                      <tr key={field} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="p-2 font-mono text-[#ff5500]">{field}</td>
                        <td className="p-2 font-mono text-gray-500">{type}</td>
                        <td className="p-2 text-gray-700">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Corroboration */}
            <div id="corroboration" className="mb-8">
              <h3 className="text-base font-bold text-[#0a0a0a] mb-3 font-mono">5. Corroboration Result Fields</h3>
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0a0a0a] text-white">
                      <th className="text-left p-2 font-mono">Field</th>
                      <th className="text-left p-2 font-mono">Type</th>
                      <th className="text-left p-2 font-mono">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { field: "sources_checked", type: "integer", desc: "Total sources retrieved and processed" },
                      { field: "sources_confirming", type: "integer", desc: "Sources with stance confirms" },
                      { field: "sources_contradicting", type: "integer", desc: "Sources with stance contradicts" },
                      { field: "sources_neutral", type: "integer", desc: "Sources with stance neutral or unrelated" },
                      { field: "avg_credibility", type: "float", desc: "Weighted average credibility score [0–10]" },
                      { field: "independence_score", type: "float", desc: "Domain diversity metric [0–1]" },
                      { field: "confidence", type: "float", desc: "Composite confidence score [0–1]" },
                      { field: "status", type: "enum", desc: "CORROBORATED | PARTIALLY_CORROBORATED | UNVERIFIED | CONTESTED | FALSE" },
                    ].map(({ field, type, desc }, i) => (
                      <tr key={field} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="p-2 font-mono text-[#ff5500]">{field}</td>
                        <td className="p-2 font-mono text-gray-500">{type}</td>
                        <td className="p-2 text-gray-700">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Domain Registry */}
              <h4 className="text-sm font-bold text-[#0a0a0a] mb-2 font-mono">Domain Credibility Registry (CREDIBILITY_MAP)</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-2 font-mono">Tier</th>
                      <th className="text-left p-2 font-mono">Score Range</th>
                      <th className="text-left p-2 font-mono">Example Domains</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { tier: "Tier 1", range: "9.0–9.5", domains: "reuters.com, apnews.com, pubmed.ncbi.nlm.nih.gov, nature.com" },
                      { tier: "Tier 2", range: "7.5–8.5", domains: "theguardian.com, bloomberg.com, ft.com, corriere.it, ansa.it" },
                      { tier: "Tier 3", range: "7.0–7.5", domains: "techcrunch.com, wired.com, wired.it" },
                      { tier: "Default", range: "4.0", domains: "Unknown or unregistered domains" },
                    ].map(({ tier, range, domains }, i) => (
                      <tr key={tier} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="p-2 font-mono font-bold text-[#0a0a0a]">{tier}</td>
                        <td className="p-2 font-mono text-[#ff5500]">{range}</td>
                        <td className="p-2 text-gray-600">{domains}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ─── SEZIONE 6: Trust Score ─── */}
          <section id="trust-score" className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center shrink-0">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-[#0a0a0a]">6. Trust Score Formula</h2>
            </div>

            <div className="bg-[#0a0a0a] rounded-xl p-6 mb-6">
              <p className="text-gray-400 text-xs font-mono mb-3">// Weighted trust score computation</p>
              <pre className="text-[#00e5c8] text-sm font-mono leading-loose">{`trust_score = 0.55 × corroboration_ratio
            + 0.30 × (avg_credibility / 10.0)
            + 0.15 × avg_independence_score`}</pre>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { weight: "0.55", label: "corroboration_ratio", desc: "total_confirming / total_checked — su tutti i claim" },
                { weight: "0.30", label: "avg_credibility / 10.0", desc: "Media pesata per numero di fonti, normalizzata su 10" },
                { weight: "0.15", label: "avg_independence_score", desc: "Media aritmetica dei per-claim independence_score" },
              ].map(({ weight, label, desc }) => (
                <div key={label} className="border border-gray-200 rounded-lg p-4">
                  <p className="text-2xl font-bold text-[#ff5500] font-mono mb-1">{weight}</p>
                  <p className="text-xs font-mono text-[#0a0a0a] mb-1">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              ))}
            </div>

            <p className="text-gray-600 text-xs bg-gray-50 border border-gray-200 rounded p-3">
              Il puntaggio grezzo è normalizzato in [0.000, 1.000] e arrotondato a 3 decimali. 
              Il puntaggio di default assegnato quando nessun claim verificabile è estratto è <strong>0.550 (grade C)</strong>, 
              rappresentando una baseline neutrale.
            </p>
          </section>

          {/* ─── SEZIONE 7: Grading ─── */}
          <section id="grading" className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#00e5c8] rounded flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-[#0a0a0a]" />
              </div>
              <h2 className="text-xl font-bold text-[#0a0a0a]">7. Grading Thresholds</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#0a0a0a] text-white">
                    <th className="text-left p-3 font-mono">Grade</th>
                    <th className="text-left p-3 font-mono">Score Range</th>
                    <th className="text-left p-3">Interpretation</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { grade: "A", range: "≥ 0.850", interp: "High corroboration, high-credibility sources, high source diversity", bg: "bg-green-50", color: "text-green-700" },
                    { grade: "B", range: "≥ 0.700", interp: "Good corroboration with minor gaps", bg: "bg-blue-50", color: "text-blue-700" },
                    { grade: "C", range: "≥ 0.550", interp: "Partial corroboration or lower-credibility sources", bg: "bg-yellow-50", color: "text-yellow-700" },
                    { grade: "D", range: "≥ 0.400", interp: "Weak corroboration or significant source limitations", bg: "bg-orange-50", color: "text-orange-700" },
                    { grade: "F", range: "< 0.400", interp: "Insufficient corroboration or contradicting evidence", bg: "bg-red-50", color: "text-red-700" },
                  ].map(({ grade, range, interp, bg, color }) => (
                    <tr key={grade} className={bg}>
                      <td className={`p-3 font-mono font-bold text-2xl ${color}`}>{grade}</td>
                      <td className="p-3 font-mono text-gray-700">{range}</td>
                      <td className="p-3 text-gray-700 text-sm">{interp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ─── SEZIONE 8: Report Schema ─── */}
          <section id="report-schema" className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-[#0a0a0a]">8. Verification Report Schema</h2>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              La pipeline produce un oggetto <code className="bg-gray-100 px-1 rounded text-xs font-mono">FullVerificationReport</code> conforme al seguente schema TypeScript:
            </p>
            <div className="bg-[#0a0a0a] rounded-xl p-5 overflow-x-auto">
              <pre className="text-[#00e5c8] text-xs font-mono leading-relaxed">{`interface FullVerificationReport {
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
          </section>

          {/* ─── CTA finale ─── */}
          <div className="border-t border-gray-200 pt-8 mt-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/proofpress-verify"
                className="inline-flex items-center gap-2 bg-[#0a0a0a] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                <Shield className="w-4 h-4" />
                ProofPress Verify
              </Link>
              <a
                href="https://proofpress.ai/methodology/v1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:border-gray-500 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Permalink metodologia
              </a>
            </div>
            <p className="text-xs text-gray-400 font-mono mt-4">
              © 2025 AxiomiX LLC — ProofPress Verify Methodology v1.0.0 — 
              Ultimo aggiornamento: Aprile 2025
            </p>
          </div>

        </main>
      </div>

      <SharedPageFooter />
    </div>
  );
}
