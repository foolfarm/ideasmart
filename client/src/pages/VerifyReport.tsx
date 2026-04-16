/**
 * PROOFPRESS VERIFY REPORT — Pagina pubblica del Verification Report IPFS
 *
 * Route: /verify/:cid
 *
 * Carica il JSON del Verification Report direttamente da IPFS Gateway (Pinata),
 * lo mostra in una pagina branded ProofPress utilizzabile come prova legale
 * indipendente dal sito. Ogni CID è immutabile e verificabile da chiunque.
 */
import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { ShieldCheck, ShieldX, ExternalLink, Copy, Check, Loader2 } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "JetBrains Mono, 'Courier New', monospace";
const ORANGE = "#ff5500";
const TEAL = "#00897b";

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

const SECTION_LABELS: Record<string, string> = {
  ai: "AI4Business News",
  startup: "Startup News",
  dealroom: "Dealroom",
  news: "News",
  research: "Research",
  finance: "Finance",
  cybersecurity: "Cybersecurity",
};

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
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

export default function VerifyReport() {
  const params = useParams<{ cid: string }>();
  const cid = params.cid;

  const [report, setReport] = useState<VerificationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ipfsUrl = cid ? `https://gateway.pinata.cloud/ipfs/${cid}` : null;

  useEffect(() => {
    if (!cid) {
      setError("CID non valido");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`https://gateway.pinata.cloud/ipfs/${cid}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Gateway error: ${res.status}`);
        const data = await res.json();
        // Valida che sia un report ProofPress
        if (!data.protocol || !data.protocol.startsWith("ProofPress-Verify")) {
          throw new Error("Il file non è un Verification Report ProofPress valido");
        }
        setReport(data as VerificationReport);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message || "Impossibile caricare il Verification Report da IPFS");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [cid]);

  const pinnedDate = report?.pinnedAt
    ? new Date(report.pinnedAt).toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      })
    : null;

  const publishedDate = report?.article.publishedAt
    ? new Date(report.article.publishedAt).toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <>
      <SEOHead
        title={report ? `Verification Report — ${report.article.title.substring(0, 60)}` : "Verification Report — ProofPress Verify"}
        description="Verification Report immutabile ancorato su IPFS tramite ProofPress Verify. Prova crittografica dell'autenticità dell'articolo."
      />

      {/* ── Header minimal ── */}
      <header
        className="border-b"
        style={{ borderColor: "rgba(10,10,10,0.08)", background: "#fff" }}
      >
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-4 flex items-center justify-between">
          <Link href="/">
            <span
              className="text-lg font-black cursor-pointer hover:opacity-70 transition-opacity"
              style={{ fontFamily: FONT, letterSpacing: "-0.02em" }}
            >
              ProofPress
              <span className="text-xs font-bold ml-1.5 px-1.5 py-0.5 rounded" style={{ background: TEAL, color: "#fff", letterSpacing: "0.05em" }}>
                VERIFY
              </span>
            </span>
          </Link>
          <Link href="/proofpress-verify">
            <span
              className="text-xs font-bold uppercase tracking-widest cursor-pointer hover:opacity-70 transition-opacity"
              style={{ color: "rgba(10,10,10,0.4)", fontFamily: FONT }}
            >
              Verifica un altro hash →
            </span>
          </Link>
        </div>
      </header>

      {/* ── Contenuto principale ── */}
      <main className="min-h-screen" style={{ background: "#f5f5f7" }}>
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-12 md:py-16">

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 size={32} className="animate-spin" style={{ color: TEAL }} />
              <p className="text-sm" style={{ color: "rgba(10,10,10,0.5)", fontFamily: FONT }}>
                Caricamento Verification Report da IPFS…
              </p>
              <p className="text-xs font-mono" style={{ color: "rgba(10,10,10,0.3)" }}>
                CID: {cid?.substring(0, 30)}…
              </p>
            </div>
          )}

          {/* Errore */}
          {!loading && error && (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: "#fff3f3", border: "1px solid #ffcdd2" }}
            >
              <ShieldX size={40} className="mx-auto mb-4" style={{ color: "#c62828" }} />
              <h1 className="text-xl font-bold mb-2" style={{ color: "#c62828", fontFamily: FONT }}>
                Report non trovato
              </h1>
              <p className="text-sm mb-4" style={{ color: "rgba(198,40,40,0.75)", fontFamily: FONT }}>
                {error}
              </p>
              <p className="text-xs mb-6" style={{ color: "rgba(10,10,10,0.4)", fontFamily: MONO }}>
                CID: {cid}
              </p>
              <Link href="/proofpress-verify">
                <span
                  className="inline-block px-6 py-3 text-sm font-bold uppercase tracking-widest text-white cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ background: ORANGE, fontFamily: FONT }}
                >
                  Verifica un hash →
                </span>
              </Link>
            </div>
          )}

          {/* Report trovato */}
          {!loading && !error && report && (
            <div>
              {/* Badge certificazione */}
              <div
                className="rounded-2xl overflow-hidden mb-6"
                style={{ border: "2px solid #a5d6b7" }}
              >
                {/* Header verde */}
                <div
                  className="px-6 py-5 flex items-center gap-3"
                  style={{ background: "#2e7d32" }}
                >
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

                {/* Body */}
                <div className="px-6 py-6" style={{ background: "#f0faf4" }}>
                  {/* Titolo articolo */}
                  <h1
                    className="text-xl md:text-2xl font-black mb-2 leading-tight"
                    style={{ color: "#1a1a1a", fontFamily: FONT, letterSpacing: "-0.02em" }}
                  >
                    {report.article.title}
                  </h1>

                  {/* Sommario */}
                  <p
                    className="text-sm leading-relaxed mb-5"
                    style={{ color: "rgba(10,10,10,0.65)", fontFamily: FONT }}
                  >
                    {report.article.summary}
                  </p>

                  {/* Metadati in griglia */}
                  <div
                    className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5 p-4 rounded-xl"
                    style={{ background: "rgba(46,125,50,0.06)", border: "1px solid rgba(46,125,50,0.15)" }}
                  >
                    {[
                      { label: "Sezione", value: SECTION_LABELS[report.article.section] ?? report.article.section.toUpperCase() },
                      { label: "Categoria", value: report.article.category },
                      { label: "Fonte", value: report.article.sourceName ?? "—" },
                      { label: "Pubblicato", value: publishedDate ?? "—" },
                      { label: "Certificato", value: pinnedDate ?? "—" },
                      { label: "Protocollo", value: report.protocol },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <div className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: "rgba(46,125,50,0.6)", fontFamily: FONT }}>
                          {label}
                        </div>
                        <div className="text-[11px] font-medium leading-snug" style={{ color: "#1a1a1a", fontFamily: FONT }}>
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Hash SHA-256 */}
                  <div
                    className="rounded-xl p-4 mb-4"
                    style={{ background: "rgba(46,125,50,0.08)", border: "1px solid rgba(46,125,50,0.2)" }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "rgba(46,125,50,0.8)", fontFamily: FONT }}>
                        Hash SHA-256 certificato
                      </span>
                      <CopyButton text={report.verifyHash} label="Copia hash" />
                    </div>
                    <p
                      className="break-all text-[11px] leading-relaxed"
                      style={{ fontFamily: MONO, color: "#2e7d32" }}
                    >
                      {report.verifyHash}
                    </p>
                  </div>

                  {/* CID IPFS */}
                  <div
                    className="rounded-xl p-4 mb-4"
                    style={{ background: "rgba(0,150,136,0.06)", border: "1px solid rgba(0,150,136,0.2)" }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: TEAL, fontFamily: FONT }}>
                          ⛓ CID IPFS — Immutabile
                        </span>
                        <span className="text-[8px] px-1.5 py-0.5 rounded font-bold" style={{ background: TEAL, color: "#fff", fontFamily: FONT }}>
                          PINATA
                        </span>
                      </div>
                      <CopyButton text={cid!} label="Copia CID" />
                    </div>
                    <p
                      className="break-all text-[11px] leading-relaxed mb-2"
                      style={{ fontFamily: MONO, color: "#00695c" }}
                    >
                      {cid}
                    </p>
                    {ipfsUrl && (
                      <a
                        href={ipfsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold hover:opacity-70 transition-opacity"
                        style={{ color: TEAL, fontFamily: FONT }}
                      >
                        <ExternalLink size={10} />
                        Visualizza JSON raw su IPFS Gateway →
                      </a>
                    )}
                  </div>

                  {/* Issuer e disclaimer */}
                  <div className="border-t pt-4" style={{ borderColor: "rgba(46,125,50,0.15)" }}>
                    <p className="text-[10px] mb-1" style={{ color: "rgba(10,10,10,0.5)", fontFamily: FONT }}>
                      <span className="font-bold">Emesso da:</span> {report.issuer}
                    </p>
                    <p className="text-[9px] leading-relaxed" style={{ color: "rgba(10,10,10,0.35)", fontFamily: FONT }}>
                      {report.disclaimer}
                    </p>
                  </div>
                </div>
              </div>

              {/* Link all'articolo originale */}
              <div className="flex flex-col sm:flex-row gap-3">
                {report.article.sourceUrl && (
                  <a
                    href={report.article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-widest border transition-opacity hover:opacity-70"
                    style={{ borderColor: "rgba(10,10,10,0.15)", color: "rgba(10,10,10,0.6)", fontFamily: FONT }}
                  >
                    <ExternalLink size={14} />
                    Fonte originale
                  </a>
                )}
                <Link href={`/${report.article.section}/news/${report.article.id}`}>
                  <span
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-widest text-white cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ background: "#1a1a1a", fontFamily: FONT }}
                  >
                    Leggi su ProofPress →
                  </span>
                </Link>
              </div>

              {/* Nota tecnica */}
              <div
                className="mt-6 rounded-xl p-4"
                style={{ background: "rgba(10,10,10,0.03)", border: "1px solid rgba(10,10,10,0.06)" }}
              >
                <p className="text-[10px] leading-relaxed" style={{ color: "rgba(10,10,10,0.4)", fontFamily: FONT }}>
                  <span className="font-bold">Come verificare in modo trustless:</span> Il CID IPFS sopra è un indirizzo immutabile. Puoi accedere al Verification Report JSON da qualsiasi IPFS Gateway pubblico (es.{" "}
                  <code style={{ fontFamily: MONO }}>https://ipfs.io/ipfs/{cid?.substring(0, 20)}…</code>) e confrontare l'hash SHA-256 con quello dell'articolo originale. Se coincidono, il contenuto non è stato modificato dopo la certificazione.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Footer minimal ── */}
      <footer
        className="border-t py-6"
        style={{ borderColor: "rgba(10,10,10,0.08)", background: "#fff" }}
      >
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
