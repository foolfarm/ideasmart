import SharedPageHeader from "@/components/SharedPageHeader";
/**
 * PROOFPRESS VERIFY REPORT — Pagina pubblica del Verification Report
 *
 * Route: /verify/:cid
 *
 * Mostra il report di certificazione con:
 * - TrustGrade visuale con breakdown criteri
 * - Claims estratti con stato di corroborazione
 * - Hash SHA-256 e CID IPFS
 * - Metadati articolo
 */
import { useParams, Link } from "wouter";
import {
  ShieldCheck, ShieldX, ExternalLink, Copy, Check, Loader2,
  CheckCircle2, XCircle, AlertCircle, MinusCircle, ChevronDown, ChevronUp,
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "JetBrains Mono, 'Courier New', monospace";
const ORANGE = "#ff5500";
const TEAL = "#00897b";

// ── Tipi ──────────────────────────────────────────────────────────────────────

interface VerificationReport {
  protocol: string;
  pinnedAt: string;
  verifyHash: string;
  article: {
    id: number;
    title: string;
    summary: string;
    section: string;
    sourceName?: string | null;
    sourceUrl?: string | null;
    publishedAt?: string | null;
    category: string;
    weekLabel: string;
  };
  issuer: string;
  disclaimer: string;
}

interface Claim {
  claim_id: string;
  text: string;
  type: string;
  verifiable: boolean;
  entities?: string[];
}

interface CorroborationItem {
  claim_id: string;
  status: "VERIFIED" | "UNVERIFIED" | "CONTRADICTED" | "PARTIAL";
  confidence: number;
  sources_checked: number;
  sources_confirming: number;
  sources_contradicting: number;
  avg_credibility: number;
  evidence: Array<{ url?: string; title?: string; credibility?: number }>;
}

interface RawVerifyReport {
  article?: { title?: string; url?: string; word_count?: number; language?: string };
  claims?: Claim[];
  corroboration?: CorroborationItem[];
  trust_score?: { overall: number; grade: string };
  report_id?: string;
  generated_at?: string;
  processing_time_seconds?: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const SECTION_LABELS: Record<string, string> = {
  ai: "AI4Business News",
  startup: "Startup News",
  dealroom: "Dealroom",
  news: "News",
  research: "Research",
  finance: "Finance",
  cybersecurity: "Cybersecurity",
};

const GRADE_CONFIG: Record<string, { color: string; bg: string; border: string; label: string; desc: string }> = {
  A: { color: "#16a34a", bg: "#f0fdf4", border: "#86efac", label: "Grade A", desc: "Certificazione Massima" },
  B: { color: "#2563eb", bg: "#eff6ff", border: "#93c5fd", label: "Grade B", desc: "Alta Affidabilità" },
  C: { color: "#ca8a04", bg: "#fefce8", border: "#fde047", label: "Grade C", desc: "Affidabilità Standard" },
  D: { color: "#ea580c", bg: "#fff7ed", border: "#fdba74", label: "Grade D", desc: "Verifica Parziale" },
  F: { color: "#dc2626", bg: "#fef2f2", border: "#fca5a5", label: "Grade F", desc: "Non Verificato" },
};

const CORROBORATION_STATUS: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  VERIFIED:     { icon: CheckCircle2, color: "#16a34a", label: "Verificato" },
  PARTIAL:      { icon: AlertCircle,  color: "#ca8a04", label: "Parzialmente verificato" },
  UNVERIFIED:   { icon: MinusCircle,  color: "#6b7280", label: "Non verificato" },
  CONTRADICTED: { icon: XCircle,      color: "#dc2626", label: "Contraddetto" },
};

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback */ }
  }
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
      style={{ color: copied ? "#2e7d32" : "rgba(10,10,10,0.4)", fontFamily: FONT, background: "none", border: "none", cursor: "pointer", padding: 0 }}
    >
      {copied ? <Check size={10} /> : <Copy size={10} />}
      {copied ? "Copiato!" : label}
    </button>
  );
}

/** Breakdown dei criteri Trust Score */
function TrustBreakdown({ article, grade }: {
  article: { verifyHash?: string | null; ipfsCid?: string | null; sourceName?: string | null; sourceUrl?: string | null; summary?: string | null };
  grade: string;
}) {
  const gc = GRADE_CONFIG[grade] ?? GRADE_CONFIG["F"];
  const criteria = [
    { label: "Hash SHA-256 certificato", points: 40, ok: !!(article.verifyHash && article.verifyHash.length === 64) },
    { label: "Archiviazione IPFS immutabile", points: 25, ok: !!(article.ipfsCid && article.ipfsCid.length > 10) },
    { label: "Fonte citata (nome)", points: 8, ok: !!(article.sourceName?.trim()) },
    { label: "Fonte citata (URL)", points: 7, ok: !!(article.sourceUrl?.trim()) },
    { label: "Contenuto ricco (>150 char)", points: 15, ok: (article.summary?.trim().length ?? 0) >= 150 },
    { label: "Report AI Verify generato", points: 5, ok: true },
  ];
  const earned = criteria.reduce((s, c) => s + (c.ok ? c.points : 0), 0);
  return (
    <div className="rounded-2xl p-5 mb-4" style={{ background: gc.bg, border: `1.5px solid ${gc.border}` }}>
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black flex-shrink-0"
          style={{ background: gc.color, color: "#fff", fontFamily: FONT }}
        >
          {grade}
        </div>
        <div>
          <div className="text-base font-black" style={{ color: gc.color, fontFamily: FONT }}>{gc.label} — {gc.desc}</div>
          <div className="text-xs mt-0.5" style={{ color: "rgba(10,10,10,0.5)", fontFamily: FONT }}>
            Punteggio certificazione: <span className="font-bold">{earned}/100</span>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {criteria.map(c => (
          <div key={c.label} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold ${
                c.ok ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
              }`}>{c.ok ? '✓' : '○'}</span>
              <span className="text-[11px] truncate" style={{ color: c.ok ? "#1a1a1a" : "rgba(10,10,10,0.4)", fontFamily: FONT }}>{c.label}</span>
            </div>
            <span className="text-[11px] font-bold flex-shrink-0" style={{ color: c.ok ? gc.color : '#d1d5db', fontFamily: FONT }}>
              +{c.ok ? c.points : 0}/{c.points}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[9px] mt-3 leading-relaxed" style={{ color: "rgba(10,10,10,0.35)", fontFamily: FONT }}>
        Il Trust Score misura la qualità della certificazione crittografica, non la veridicità del contenuto.
      </p>
    </div>
  );
}

/** Lista claims con stato di corroborazione */
function ClaimsSection({ claims, corroboration }: { claims: Claim[]; corroboration: CorroborationItem[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const corrMap = Object.fromEntries(corroboration.map(c => [c.claim_id, c]));

  if (!claims.length) return null;

  return (
    <div className="rounded-2xl overflow-hidden mb-4" style={{ border: "1.5px solid rgba(10,10,10,0.1)" }}>
      <div className="px-5 py-3 flex items-center gap-2" style={{ background: "#f5f5f7", borderBottom: "1px solid rgba(10,10,10,0.08)" }}>
        <ShieldCheck size={14} style={{ color: TEAL }} />
        <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: "#1a1a1a", fontFamily: FONT }}>
          Claim estratti e verificati ({claims.length})
        </span>
      </div>
      <div className="divide-y divide-black/5">
        {claims.map(claim => {
          const corr = corrMap[claim.claim_id];
          const statusKey = corr?.status ?? "UNVERIFIED";
          const sc = CORROBORATION_STATUS[statusKey] ?? CORROBORATION_STATUS.UNVERIFIED;
          const Icon = sc.icon;
          const isOpen = expanded === claim.claim_id;
          const pct = corr ? Math.round(corr.confidence * 100) : 0;

          return (
            <div key={claim.claim_id} className="bg-white">
              <button
                className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-[#fafafa] transition-colors"
                onClick={() => setExpanded(isOpen ? null : claim.claim_id)}
              >
                <Icon size={16} className="flex-shrink-0 mt-0.5" style={{ color: sc.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium leading-snug mb-1" style={{ color: "#1a1a1a", fontFamily: FONT }}>
                    {claim.text}
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-[10px] font-bold" style={{ color: sc.color, fontFamily: FONT }}>{sc.label}</span>
                    {corr && corr.sources_checked > 0 && (
                      <span className="text-[10px]" style={{ color: "rgba(10,10,10,0.4)", fontFamily: FONT }}>
                        {corr.sources_checked} fonti analizzate · {corr.sources_confirming} confermanti
                      </span>
                    )}
                    {pct > 0 && (
                      <div className="flex items-center gap-1">
                        <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: sc.color }} />
                        </div>
                        <span className="text-[9px] font-bold" style={{ color: sc.color }}>{pct}%</span>
                      </div>
                    )}
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-medium" style={{ background: "rgba(10,10,10,0.06)", color: "rgba(10,10,10,0.5)", fontFamily: FONT }}>
                      {claim.type}
                    </span>
                  </div>
                </div>
                {isOpen ? <ChevronUp size={14} style={{ color: "rgba(10,10,10,0.3)" }} /> : <ChevronDown size={14} style={{ color: "rgba(10,10,10,0.3)" }} />}
              </button>

              {isOpen && corr && corr.evidence && corr.evidence.length > 0 && (
                <div className="px-5 pb-4 pt-0">
                  <div className="ml-7 space-y-1.5">
                    <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: "rgba(10,10,10,0.4)", fontFamily: FONT }}>
                      Fonti analizzate
                    </p>
                    {corr.evidence.slice(0, 4).map((ev, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {ev.url ? (
                          <a href={ev.url} target="_blank" rel="noopener noreferrer"
                            className="text-[10px] hover:underline truncate" style={{ color: TEAL, fontFamily: FONT }}>
                            <ExternalLink size={9} className="inline mr-1" />
                            {ev.title ?? ev.url}
                          </a>
                        ) : (
                          <span className="text-[10px] truncate" style={{ color: "rgba(10,10,10,0.5)", fontFamily: FONT }}>
                            {ev.title ?? "Fonte anonima"}
                          </span>
                        )}
                        {ev.credibility !== undefined && (
                          <span className="text-[9px] font-bold flex-shrink-0" style={{ color: "rgba(10,10,10,0.35)", fontFamily: FONT }}>
                            {Math.round(ev.credibility * 100)}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {isOpen && (!corr || !corr.evidence || corr.evidence.length === 0) && (
                <div className="px-5 pb-4 ml-7">
                  <p className="text-[10px]" style={{ color: "rgba(10,10,10,0.4)", fontFamily: FONT }}>
                    Nessuna evidenza disponibile per questo claim.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Componente principale ─────────────────────────────────────────────────────

export default function VerifyReport() {
  const params = useParams<{ cid: string }>();
  const cid = params.cid;

  const ipfsUrl = cid ? `https://gateway.pinata.cloud/ipfs/${cid}` : null;

  // Determina se il CID è un hash SHA-256 (64 char hex) o un CID IPFS (bafk…)
  const isHash = cid && /^[a-f0-9]{64}$/i.test(cid);

  // Cerca l'articolo nel DB per hash SHA-256
  const { data: dbArticle } = trpc.news.lookupByHash.useQuery(
    { hash: cid! },
    { enabled: !!isHash, retry: 1, staleTime: 60_000 }
  );

  // Carica il report IPFS (solo se è un CID IPFS, non un hash)
  const { data: rawReport, isLoading: loading, error: queryError } = trpc.news.fetchIPFSReport.useQuery(
    { cid: cid! },
    { enabled: !!cid && !isHash, retry: 1 }
  );

  const report = rawReport as VerificationReport | undefined;
  const error = queryError?.message ?? null;

  // Estrae claims e corroboration dal verifyReport del DB (JSON string)
  const parsedVerifyReport: RawVerifyReport | null = (() => {
    const raw = dbArticle?.verifyReport ?? null;
    if (!raw) return null;
    try { return typeof raw === 'string' ? JSON.parse(raw) : raw as RawVerifyReport; }
    catch { return null; }
  })();

  const claims: Claim[] = parsedVerifyReport?.claims ?? [];
  const corroboration: CorroborationItem[] = parsedVerifyReport?.corroboration ?? [];

  // Dati articolo: preferisce DB (più ricco) su IPFS
  const articleTitle = dbArticle?.title ?? report?.article.title ?? "";
  const articleSummary = dbArticle?.summary ?? report?.article.summary ?? "";
  const sourceName = dbArticle?.sourceName ?? report?.article.sourceName ?? null;
  const sourceUrl = dbArticle?.sourceUrl ?? report?.article.sourceUrl ?? null;
  const section = dbArticle?.section ?? report?.article.section ?? "";
  const trustGrade = dbArticle?.trustGrade ?? null;
  const trustScore = dbArticle?.trustScore ?? null;
  const verifyHash = dbArticle?.verifyHash ?? report?.verifyHash ?? cid ?? "";
  const ipfsCid = dbArticle?.ipfsCid ?? (!isHash ? cid : null);

  const pinnedDate = (dbArticle?.ipfsPinnedAt ?? report?.pinnedAt)
    ? new Date((dbArticle?.ipfsPinnedAt ?? report?.pinnedAt)!).toLocaleDateString("it-IT", {
        day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZoneName: "short",
      })
    : null;

  const publishedDate = (dbArticle?.publishedAt ?? report?.article.publishedAt)
    ? new Date((dbArticle?.publishedAt ?? report?.article.publishedAt)!).toLocaleDateString("it-IT", {
        day: "2-digit", month: "long", year: "numeric",
      })
    : null;

  // Mostra il contenuto se abbiamo dati dal DB (anche senza IPFS)
  const hasContent = !!dbArticle || (!loading && !error && !!report);
  const isLoading = loading && !dbArticle;

  return (
    <>
      <SEOHead
        title={articleTitle ? `Verification Report — ${articleTitle.substring(0, 60)}` : "Verification Report — ProofPress Verify"}
        description="Verification Report immutabile ancorato su IPFS tramite ProofPress Verify. Prova crittografica dell'autenticità dell'articolo."
      />

      <SharedPageHeader />

      <main className="min-h-screen" style={{ background: "#f5f5f7" }}>
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-12 md:py-16">

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 size={32} className="animate-spin" style={{ color: TEAL }} />
              <p className="text-sm" style={{ color: "rgba(10,10,10,0.5)", fontFamily: FONT }}>
                Caricamento Verification Report…
              </p>
              <p className="text-xs font-mono" style={{ color: "rgba(10,10,10,0.3)" }}>
                CID: {cid?.substring(0, 30)}…
              </p>
            </div>
          )}

          {/* Errore */}
          {!isLoading && !hasContent && (error || !cid) && (
            <div className="rounded-2xl p-8 text-center" style={{ background: "#fff3f3", border: "1px solid #ffcdd2" }}>
              <ShieldX size={40} className="mx-auto mb-4" style={{ color: "#c62828" }} />
              <h1 className="text-xl font-bold mb-2" style={{ color: "#c62828", fontFamily: FONT }}>
                Report non trovato
              </h1>
              <p className="text-sm mb-4" style={{ color: "rgba(198,40,40,0.75)", fontFamily: FONT }}>
                {error ?? "CID o hash non valido"}
              </p>
              <p className="text-xs mb-6 font-mono" style={{ color: "rgba(10,10,10,0.4)" }}>
                CID: {cid}
              </p>
              <Link href="/proofpress-verify">
                <span className="inline-block px-6 py-3 text-sm font-bold uppercase tracking-widest text-white cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ background: ORANGE, fontFamily: FONT }}>
                  Verifica un hash →
                </span>
              </Link>
            </div>
          )}

          {/* Report trovato */}
          {hasContent && (
            <div>
              {/* Header certificazione */}
              <div className="rounded-2xl overflow-hidden mb-5" style={{ border: "2px solid #a5d6b7" }}>
                <div className="px-6 py-5 flex items-center gap-3" style={{ background: "#2e7d32" }}>
                  <ShieldCheck size={28} color="#fff" strokeWidth={2.5} />
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-[0.15em] mb-0.5" style={{ color: "rgba(255,255,255,0.6)", fontFamily: FONT }}>
                      ProofPress Verify — Verification Report
                    </div>
                    <div className="text-base font-black" style={{ color: "#fff", fontFamily: FONT }}>
                      Contenuto certificato e immutabile
                    </div>
                  </div>
                </div>
                <div className="px-6 py-6" style={{ background: "#f0faf4" }}>
                  <h1 className="text-xl md:text-2xl font-black mb-2 leading-tight"
                    style={{ color: "#1a1a1a", fontFamily: FONT, letterSpacing: "-0.02em" }}>
                    {articleTitle}
                  </h1>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(10,10,10,0.65)", fontFamily: FONT }}>
                    {articleSummary}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5 p-4 rounded-xl"
                    style={{ background: "rgba(46,125,50,0.06)", border: "1px solid rgba(46,125,50,0.15)" }}>
                    {[
                      { label: "Sezione", value: SECTION_LABELS[section] ?? section.toUpperCase() },
                      { label: "Fonte", value: sourceName ?? "—" },
                      { label: "Pubblicato", value: publishedDate ?? "—" },
                      { label: "Certificato", value: pinnedDate ?? "—" },
                      { label: "Protocollo", value: report?.protocol ?? "ProofPress-Verify-v1" },
                      { label: "Issuer", value: "ProofPress Magazine" },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <div className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: "rgba(46,125,50,0.6)", fontFamily: FONT }}>{label}</div>
                        <div className="text-[11px] font-medium leading-snug" style={{ color: "#1a1a1a", fontFamily: FONT }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  {/* Hash SHA-256 */}
                  <div className="rounded-xl p-4 mb-3" style={{ background: "rgba(46,125,50,0.08)", border: "1px solid rgba(46,125,50,0.2)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "rgba(46,125,50,0.8)", fontFamily: FONT }}>Hash SHA-256 certificato</span>
                      <CopyButton text={verifyHash} label="Copia hash" />
                    </div>
                    <p className="break-all text-[11px] leading-relaxed" style={{ fontFamily: MONO, color: "#2e7d32" }}>
                      {verifyHash}
                    </p>
                  </div>
                  {/* CID IPFS */}
                  {ipfsCid && (
                    <div className="rounded-xl p-4 mb-3" style={{ background: "rgba(0,150,136,0.06)", border: "1px solid rgba(0,150,136,0.2)" }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: TEAL, fontFamily: FONT }}>⛓ CID IPFS — Immutabile</span>
                          <span className="text-[8px] px-1.5 py-0.5 rounded font-bold" style={{ background: TEAL, color: "#fff", fontFamily: FONT }}>PINATA</span>
                        </div>
                        <CopyButton text={ipfsCid} label="Copia CID" />
                      </div>
                      <p className="break-all text-[11px] leading-relaxed mb-2" style={{ fontFamily: MONO, color: "#00695c" }}>
                        {ipfsCid}
                      </p>
                      <a href={`https://gateway.pinata.cloud/ipfs/${ipfsCid}`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold hover:opacity-70 transition-opacity"
                        style={{ color: TEAL, fontFamily: FONT }}>
                        <ExternalLink size={10} />
                        Visualizza JSON raw su IPFS Gateway →
                      </a>
                    </div>
                  )}
                  {/* Disclaimer */}
                  <div className="border-t pt-4" style={{ borderColor: "rgba(46,125,50,0.15)" }}>
                    <p className="text-[9px] leading-relaxed" style={{ color: "rgba(10,10,10,0.35)", fontFamily: FONT }}>
                      {report?.disclaimer ?? "Questo report è generato automaticamente da ProofPress Verify. Il CID IPFS garantisce l'immutabilità del contenuto certificato."}
                    </p>
                  </div>
                </div>
              </div>

              {/* TrustGrade Breakdown */}
              {trustGrade && (
                <TrustBreakdown
                  grade={trustGrade}
                  article={{ verifyHash, ipfsCid, sourceName, sourceUrl, summary: articleSummary }}
                />
              )}

              {/* Claims e corroborazione */}
              {claims.length > 0 && (
                <ClaimsSection claims={claims} corroboration={corroboration} />
              )}

              {/* Score numerico */}
              {trustScore !== null && (
                <div className="rounded-2xl p-4 mb-4 flex items-center gap-4"
                  style={{ background: "#fff", border: "1.5px solid rgba(10,10,10,0.1)" }}>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: "rgba(10,10,10,0.4)", fontFamily: FONT }}>Trust Score</p>
                    <p className="text-3xl font-black" style={{ color: GRADE_CONFIG[trustGrade ?? "F"]?.color ?? "#6b7280", fontFamily: FONT }}>
                      {trustScore <= 1 ? Math.round(trustScore * 100) : Math.round(trustScore)}<span className="text-base font-medium">/100</span>
                    </p>
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${trustScore <= 1 ? Math.round(trustScore * 100) : Math.round(trustScore)}%`,
                          background: GRADE_CONFIG[trustGrade ?? "F"]?.color ?? "#6b7280",
                        }} />
                    </div>
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                {sourceUrl && (
                  <a href={sourceUrl} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-widest border transition-opacity hover:opacity-70"
                    style={{ borderColor: "rgba(10,10,10,0.15)", color: "rgba(10,10,10,0.6)", fontFamily: FONT }}>
                    <ExternalLink size={14} />
                    Fonte originale
                  </a>
                )}
                {dbArticle?.id && (
                  <Link href={`/${section}/news/${dbArticle.id}`}>
                    <span className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-widest text-white cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ background: "#1a1a1a", fontFamily: FONT }}>
                      Leggi su ProofPress →
                    </span>
                  </Link>
                )}
              </div>

              {/* Nota tecnica */}
              <div className="rounded-xl p-4" style={{ background: "rgba(10,10,10,0.03)", border: "1px solid rgba(10,10,10,0.06)" }}>
                <p className="text-[10px] leading-relaxed" style={{ color: "rgba(10,10,10,0.4)", fontFamily: FONT }}>
                  <span className="font-bold">Come verificare in modo trustless:</span> Il CID IPFS è un indirizzo immutabile. Puoi accedere al Verification Report JSON da qualsiasi IPFS Gateway pubblico (es.{" "}
                  <code style={{ fontFamily: MONO }}>https://ipfs.io/ipfs/{ipfsCid?.substring(0, 20)}…</code>) e confrontare l'hash SHA-256 con quello dell'articolo originale. Se coincidono, il contenuto non è stato modificato dopo la certificazione.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t py-6" style={{ borderColor: "rgba(10,10,10,0.08)", background: "#fff" }}>
        <div className="max-w-3xl mx-auto px-5 md:px-8 flex items-center justify-between">
          <p className="text-[10px]" style={{ color: "rgba(10,10,10,0.35)", fontFamily: FONT }}>
            ProofPress Magazine — Certified Journalism Platform
          </p>
          <Link href="/proofpress-verify">
            <span className="text-[10px] font-bold cursor-pointer hover:opacity-70 transition-opacity" style={{ color: TEAL, fontFamily: FONT }}>
              ProofPress Verify →
            </span>
          </Link>
        </div>
      </footer>
    </>
  );
}
