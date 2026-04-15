/**
 * VerifyWidget — Widget compatto per la verifica dell'autenticità delle notizie
 * tramite hash ProofPress Verify. Da inserire nella sidebar sinistra della Home.
 */
import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

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

  const { data, isFetching, error } = trpc.news.lookupByHash.useQuery(
    { hash: searchHash! },
    { enabled: !!searchHash, retry: false }
  );

  function handleVerify() {
    const h = inputHash.trim();
    if (!h) return;
    setSearchHash(h);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleVerify();
  }

  function handleReset() {
    setInputHash("");
    setSearchHash(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  const verified = searchHash && data !== undefined && !isFetching;
  const found = verified && data !== null;
  const notFound = verified && data === null;

  return (
    <div
      className="mb-5 rounded-2xl overflow-hidden"
      style={{
        background: "#f5f5f7",
        border: "1px solid #e5e5ea",
        fontFamily: SF,
      }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3" style={{ borderBottom: "1px solid #e5e5ea" }}>
        <div className="flex items-center gap-2 mb-1">
          {/* Icona scudo */}
          <div
            className="flex items-center justify-center rounded-md flex-shrink-0"
            style={{ width: 24, height: 24, background: "#1a1a1a" }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path
                d="M6.5 1L2 3v3.5c0 2.5 1.9 4.8 4.5 5.5C9.1 11.3 11 9 11 6.5V3L6.5 1z"
                fill="#fff"
                stroke="#fff"
                strokeWidth="0.3"
              />
              <path d="M4.5 6.5l1.5 1.5 2.5-2.5" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p
            className="text-[11px] font-black uppercase tracking-[0.12em]"
            style={{ color: "#1a1a1a" }}
          >
            ProofPress Verify
          </p>
        </div>
        <p className="text-[10px] leading-snug" style={{ color: "rgba(26,26,26,0.55)" }}>
          Verifica l'autenticità di una notizia. Copia il codice hash ProofPress Verify e controlla.
        </p>
      </div>

      {/* Input + Pulsante */}
      <div className="px-4 py-3">
        {!found ? (
          <>
            <div className="flex gap-2 mb-2">
              <input
                ref={inputRef}
                type="text"
                value={inputHash}
                onChange={e => { setInputHash(e.target.value); setSearchHash(null); }}
                onKeyDown={handleKeyDown}
                placeholder="Incolla il codice hash…"
                className="flex-1 text-[10px] px-2.5 py-2 rounded-lg outline-none transition-all"
                style={{
                  background: "#fff",
                  border: "1px solid #d1d1d6",
                  color: "#1a1a1a",
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "9px",
                  letterSpacing: "0.03em",
                  minWidth: 0,
                }}
                onFocus={e => (e.target.style.borderColor = "#1a1a1a")}
                onBlur={e => (e.target.style.borderColor = "#d1d1d6")}
              />
              <button
                onClick={handleVerify}
                disabled={!inputHash.trim() || isFetching}
                className="flex-shrink-0 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                style={{
                  background: inputHash.trim() ? "#1a1a1a" : "#d1d1d6",
                  color: "#fff",
                  cursor: inputHash.trim() ? "pointer" : "not-allowed",
                  fontFamily: SF,
                }}
              >
                {isFetching ? "…" : "Verifica"}
              </button>
            </div>

            {/* Stato: non trovato */}
            {notFound && (
              <div
                className="rounded-xl px-3 py-2.5 flex items-start gap-2"
                style={{ background: "#fff3f3", border: "1px solid #ffcdd2" }}
              >
                <span style={{ fontSize: 14, lineHeight: 1 }}>✗</span>
                <div>
                  <p className="text-[10px] font-bold" style={{ color: "#c62828" }}>
                    Hash non trovato
                  </p>
                  <p className="text-[9px] mt-0.5" style={{ color: "rgba(198,40,40,0.7)" }}>
                    Questo codice non corrisponde ad alcuna notizia certificata ProofPress.
                  </p>
                  <button
                    onClick={handleReset}
                    className="text-[9px] font-bold mt-1.5 underline"
                    style={{ color: "#c62828", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  >
                    Prova un altro codice
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Risultato: trovato */
          <div
            className="rounded-xl px-3 py-3"
            style={{ background: "#f0faf4", border: "1px solid #a5d6b7" }}
          >
            {/* Badge verificato */}
            <div className="flex items-center gap-1.5 mb-2">
              <div
                className="flex items-center justify-center rounded-full flex-shrink-0"
                style={{ width: 18, height: 18, background: "#2e7d32" }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.1em]" style={{ color: "#2e7d32" }}>
                Notizia Certificata
              </p>
            </div>

            {/* Titolo */}
            <p
              className="text-[11px] font-bold leading-snug mb-2"
              style={{ color: "#1a1a1a", lineHeight: 1.4 }}
            >
              {data!.title}
            </p>

            {/* Metadati */}
            <div className="flex flex-col gap-1 mb-2">
              {data!.sourceName && (
                <div className="flex items-center gap-1">
                  <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: "rgba(26,26,26,0.4)", minWidth: 48 }}>Fonte</span>
                  <span className="text-[9px]" style={{ color: "#1a1a1a" }}>{data!.sourceName}</span>
                </div>
              )}
              {data!.publishedAt && (
                <div className="flex items-center gap-1">
                  <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: "rgba(26,26,26,0.4)", minWidth: 48 }}>Data</span>
                  <span className="text-[9px]" style={{ color: "#1a1a1a" }}>{data!.publishedAt}</span>
                </div>
              )}
              {data!.section && (
                <div className="flex items-center gap-1">
                  <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: "rgba(26,26,26,0.4)", minWidth: 48 }}>Sezione</span>
                  <span className="text-[9px]" style={{ color: "#1a1a1a" }}>{SECTION_LABELS[data!.section] ?? data!.section}</span>
                </div>
              )}
            </div>

            {/* Hash (troncato) */}
            <div
              className="rounded-lg px-2 py-1.5 mb-2"
              style={{ background: "rgba(46,125,50,0.08)", border: "1px solid rgba(46,125,50,0.2)" }}
            >
              <p className="text-[8px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "rgba(46,125,50,0.7)" }}>
                Hash SHA-256
              </p>
              <p
                className="break-all"
                style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "8px", color: "#2e7d32", lineHeight: 1.5 }}
              >
                {data!.verifyHash}
              </p>
            </div>

            {/* CTA: leggi articolo */}
            <div className="flex items-center justify-between">
              <Link href={`/news/${data!.id}`}>
                <span
                  className="text-[9px] font-bold uppercase tracking-widest cursor-pointer hover:opacity-70 transition-opacity"
                  style={{ color: "#1a1a1a", textDecoration: "underline" }}
                >
                  Leggi l'articolo →
                </span>
              </Link>
              <button
                onClick={handleReset}
                className="text-[9px]"
                style={{ color: "rgba(26,26,26,0.4)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                Nuova verifica
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
