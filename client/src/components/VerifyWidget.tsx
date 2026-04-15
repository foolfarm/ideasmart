/**
 * VerifyWidget — Widget di verifica autenticità notizie ProofPress Verify
 * Posizionato nella sidebar destra, sopra il banner "Crea il tuo giornale AI"
 * Design: dark editorial, impattante, stile certificazione blockchain
 */
import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ShieldCheck, ShieldX, Search, RotateCcw } from "lucide-react";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

const SECTION_LABELS: Record<string, string> = {
  ai: "AI News",
  startup: "Startup",
  dealroom: "Dealroom",
  news: "News",
  research: "Research",
  finance: "Finance",
  cybersecurity: "Cybersecurity",
};

export default function VerifyWidget() {
  const [inputHash, setInputHash] = useState("");
  const [searchHash, setSearchHash] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isFetching } = trpc.news.lookupByHash.useQuery(
    { hash: searchHash! },
    { enabled: !!searchHash, retry: false }
  );

  function handleVerify() {
    const h = inputHash.trim();
    if (!h) return;
    setSearchHash(h);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleVerify();
  }

  function handleReset() {
    setInputHash("");
    setSearchHash(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  const hasResult = searchHash && !isFetching && data !== undefined;
  const found = hasResult && data !== null;
  const notFound = hasResult && data === null;

  return (
    <div
      className="mb-5 rounded-2xl overflow-hidden"
      style={{ fontFamily: SF, border: "1px solid #e5e5ea" }}
    >
      {/* ── Header dark ── */}
      <div
        className="px-4 pt-4 pb-3"
        style={{ background: "#1a1a1a" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck size={16} color="#00e5c8" strokeWidth={2.2} />
          <span
            className="text-[11px] font-black uppercase tracking-[0.14em]"
            style={{ color: "#fff" }}
          >
            ProofPress Verify
          </span>
        </div>
        <p className="text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
          Verifica l'autenticità di una notizia. Copia il codice hash ProofPress Verify e controlla.
        </p>
      </div>

      {/* ── Body ── */}
      <div className="px-4 py-3" style={{ background: "#f5f5f7" }}>

        {/* INPUT + PULSANTE — sempre visibile finché non c'è risultato positivo */}
        {!found && (
          <>
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputHash}
                  onChange={e => { setInputHash(e.target.value); setSearchHash(null); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Incolla il codice hash…"
                  className="w-full text-[9px] pl-2.5 pr-2 py-2 rounded-xl outline-none transition-all"
                  style={{
                    background: "#fff",
                    border: "1.5px solid #d1d1d6",
                    color: "#1a1a1a",
                    fontFamily: "JetBrains Mono, 'Courier New', monospace",
                    letterSpacing: "0.02em",
                  }}
                  onFocus={e => (e.target.style.borderColor = "#1a1a1a")}
                  onBlur={e => (e.target.style.borderColor = "#d1d1d6")}
                />
              </div>
              <button
                onClick={handleVerify}
                disabled={!inputHash.trim() || isFetching}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                style={{
                  background: inputHash.trim() ? "#1a1a1a" : "#d1d1d6",
                  color: "#fff",
                  cursor: inputHash.trim() ? "pointer" : "not-allowed",
                  fontFamily: SF,
                  whiteSpace: "nowrap",
                }}
              >
                {isFetching ? (
                  <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Search size={11} strokeWidth={2.5} />
                )}
                {isFetching ? "" : "Verifica"}
              </button>
            </div>

            {/* Stato: non trovato */}
            {notFound && (
              <div
                className="rounded-xl px-3 py-2.5 flex items-start gap-2"
                style={{ background: "#fff3f3", border: "1px solid #ffcdd2" }}
              >
                <ShieldX size={14} color="#c62828" strokeWidth={2} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold" style={{ color: "#c62828" }}>
                    Hash non riconosciuto
                  </p>
                  <p className="text-[9px] mt-0.5 leading-snug" style={{ color: "rgba(198,40,40,0.75)" }}>
                    Questo codice non corrisponde ad alcuna notizia certificata ProofPress.
                  </p>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1 text-[9px] font-bold mt-1.5"
                    style={{ color: "#c62828", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  >
                    <RotateCcw size={9} />
                    Prova un altro codice
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* RISULTATO POSITIVO */}
        {found && data && (
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1.5px solid #a5d6b7" }}
          >
            {/* Badge header verde */}
            <div
              className="px-3 py-2 flex items-center gap-2"
              style={{ background: "#2e7d32" }}
            >
              <ShieldCheck size={14} color="#fff" strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: "#fff" }}>
                Notizia Certificata ProofPress
              </span>
            </div>

            {/* Contenuto */}
            <div className="px-3 py-3" style={{ background: "#f0faf4" }}>
              {/* Titolo */}
              <p
                className="text-[12px] font-bold leading-snug mb-3"
                style={{ color: "#1a1a1a", lineHeight: 1.4 }}
              >
                {data.title}
              </p>

              {/* Metadati in tabella compatta */}
              <div className="flex flex-col gap-1 mb-3">
                {data.sourceName && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-[8px] uppercase tracking-widest font-black" style={{ color: "rgba(26,26,26,0.4)", minWidth: 44 }}>Fonte</span>
                    <span className="text-[10px] font-medium" style={{ color: "#1a1a1a" }}>{data.sourceName}</span>
                  </div>
                )}
                {data.publishedAt && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-[8px] uppercase tracking-widest font-black" style={{ color: "rgba(26,26,26,0.4)", minWidth: 44 }}>Data</span>
                    <span className="text-[10px] font-medium" style={{ color: "#1a1a1a" }}>{data.publishedAt}</span>
                  </div>
                )}
                {data.section && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-[8px] uppercase tracking-widest font-black" style={{ color: "rgba(26,26,26,0.4)", minWidth: 44 }}>Canale</span>
                    <span className="text-[10px] font-medium" style={{ color: "#1a1a1a" }}>{SECTION_LABELS[data.section] ?? data.section}</span>
                  </div>
                )}
              </div>

              {/* Hash SHA-256 */}
              <div
                className="rounded-lg px-2.5 py-2 mb-3"
                style={{ background: "rgba(46,125,50,0.1)", border: "1px solid rgba(46,125,50,0.25)" }}
              >
                <p className="text-[8px] font-black uppercase tracking-widest mb-1" style={{ color: "rgba(46,125,50,0.8)" }}>
                  Hash SHA-256 certificato
                </p>
                <p
                  className="break-all"
                  style={{
                    fontFamily: "JetBrains Mono, 'Courier New', monospace",
                    fontSize: "8px",
                    color: "#2e7d32",
                    lineHeight: 1.6,
                  }}
                >
                  {data.verifyHash}
                </p>
              </div>

              {/* CTA */}
              <div className="flex items-center justify-between">
                <Link href={`/news/${data.id}`}>
                  <span
                    className="flex items-center gap-1 text-[10px] font-bold cursor-pointer hover:opacity-70 transition-opacity"
                    style={{ color: "#1a1a1a" }}
                  >
                    Leggi l'articolo →
                  </span>
                </Link>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 text-[9px]"
                  style={{ color: "rgba(26,26,26,0.4)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  <RotateCcw size={9} />
                  Nuova verifica
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
