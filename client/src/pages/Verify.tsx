/**
 * IDEASMART VERIFY — Pagina pubblica di verifica autenticità articoli
 * Chiunque può incollare un hash SHA-256 e verificare se un articolo
 * è stato pubblicato e certificato da IDEASMART.
 *
 * Tecnologia VERIFY: protocollo di validazione e certificazione agentica.
 * Ogni notizia genera un hash crittografico immutabile che sigilla
 * contenuto, fonte e timestamp, ispirandosi alla notarizzazione Web3.
 */
import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import LeftSidebar from "@/components/LeftSidebar";
import {
  ShieldCheck, ShieldX, Search, ExternalLink,
  Clock, Globe, Copy, CheckCheck, Info
} from "lucide-react";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";
const SFText = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

function formatDateIT(str: string | Date | null | undefined): string {
  if (!str) return "—";
  try {
    return new Date(str).toLocaleDateString("it-IT", {
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  } catch { return String(str); }
}

const SECTION_LABELS: Record<string, string> = {
  ai: "AI NEWS",
  startup: "STARTUP NEWS",
  research: "AI RESEARCH",
  dealroom: "AI DEALROOM",
};

// ── Componente risultato verifica ─────────────────────────────────────────────
function VerifyResult({ article }: {
  article: {
    id: number;
    title: string;
    summary: string;
    sourceName: string | null;
    sourceUrl: string | null;
    section: string;
    publishedAt: string | Date | null;
    verifyHash: string | null;
  } | null;
  hash: string;
}) {
  const [copied, setCopied] = useState(false);

  if (!article) {
    return (
      <div className="border-2 border-[#dc2626]/30 bg-[#fef2f2] p-8 text-center">
        <ShieldX className="w-12 h-12 text-[#dc2626] mx-auto mb-4" strokeWidth={1.5} />
        <h3
          className="text-xl font-black text-[#dc2626] mb-2"
          style={{ fontFamily: SF }}
        >
          Hash non trovato
        </h3>
        <p
          className="text-[14px] text-[#1a1a1a]/60 max-w-md mx-auto leading-relaxed"
          style={{ fontFamily: SFText }}
        >
          Nessun articolo corrisponde a questo hash nel database IDEASMART.
          L'articolo potrebbe non essere stato pubblicato su questa piattaforma,
          oppure l'hash potrebbe essere errato o alterato.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-[#dc2626]/10 rounded-full">
          <span className="w-2 h-2 rounded-full bg-[#dc2626]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#dc2626]" style={{ fontFamily: SFText }}>
            Verifica fallita
          </span>
        </div>
      </div>
    );
  }

  const sectionLabel = SECTION_LABELS[article.section] ?? article.section.toUpperCase();

  const handleCopy = () => {
    if (article.verifyHash) {
      navigator.clipboard.writeText(article.verifyHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="border-2 border-[#0d6e3f]/30 overflow-hidden">
      {/* Header verde — verifica OK */}
      <div className="bg-[#0d6e3f] px-6 py-4 flex items-center gap-3">
        <ShieldCheck className="w-8 h-8 text-white flex-shrink-0" strokeWidth={1.5} />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/70" style={{ fontFamily: SFText }}>
            Articolo verificato
          </p>
          <p className="text-[15px] font-black text-white" style={{ fontFamily: SF }}>
            Contenuto autentico — pubblicato da IDEASMART
          </p>
        </div>
        <div className="ml-auto hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full">
          <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white" style={{ fontFamily: SFText }}>
            Verifica OK
          </span>
        </div>
      </div>

      {/* Corpo */}
      <div className="p-6 bg-[#f5f2ec]">
        {/* Badge sezione */}
        <div className="mb-4">
          <span
            className="inline-block text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-1 bg-[#1a1a1a] text-white"
            style={{ fontFamily: SFText }}
          >
            {sectionLabel}
          </span>
        </div>

        {/* Titolo articolo */}
        <h3
          className="text-2xl font-black text-[#1a1a1a] leading-snug mb-3"
          style={{ fontFamily: SF }}
        >
          {article.title}
        </h3>

        {/* Sommario */}
        <p
          className="text-[15px] text-[#1a1a1a]/65 leading-relaxed mb-5"
          style={{ fontFamily: SFText, lineHeight: 1.7 }}
        >
          {article.summary}
        </p>

        {/* Metadati */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <div className="flex items-start gap-2.5 p-3 border border-[#1a1a1a]/10 bg-white">
            <Globe className="w-4 h-4 text-[#1a1a1a]/40 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#1a1a1a]/40 mb-0.5" style={{ fontFamily: SFText }}>
                Fonte originale
              </p>
              <p className="text-[13px] font-semibold text-[#1a1a1a]" style={{ fontFamily: SFText }}>
                {article.sourceName}
              </p>
              {article.sourceUrl && (
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-[#0066cc] hover:underline mt-0.5"
                  style={{ fontFamily: SFText }}
                >
                  Visita fonte <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 border border-[#1a1a1a]/10 bg-white">
            <Clock className="w-4 h-4 text-[#1a1a1a]/40 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#1a1a1a]/40 mb-0.5" style={{ fontFamily: SFText }}>
                Data pubblicazione
              </p>
              <p className="text-[13px] font-semibold text-[#1a1a1a]" style={{ fontFamily: SFText }}>
                {formatDateIT(article.publishedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Hash VERIFY */}
        <div className="border border-[#1a1a1a]/15 p-4 bg-white">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]/40 mb-2" style={{ fontFamily: SFText }}>
            Hash VERIFY (SHA-256)
          </p>
          <div className="flex items-center gap-2">
            <code
              className="flex-1 text-[11px] text-[#1a1a1a]/70 break-all leading-relaxed"
              style={{ fontFamily: "JetBrains Mono, 'Courier New', monospace" }}
            >
              {article.verifyHash}
            </code>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 p-1.5 hover:bg-[#f5f2ec] transition-colors rounded"
              title="Copia hash"
            >
              {copied
                ? <CheckCheck className="w-4 h-4 text-[#0d6e3f]" />
                : <Copy className="w-4 h-4 text-[#1a1a1a]/40" />
              }
            </button>
          </div>
        </div>

        {/* Link all'articolo */}
        <div className="mt-4 flex gap-3">
          <Link href={`/ai`}>
            <span
              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#1a1a1a]/50 hover:text-[#1a1a1a] transition-colors cursor-pointer"
              style={{ fontFamily: SFText }}
            >
              ← Torna alle news
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Pagina principale ─────────────────────────────────────────────────────────
export default function Verify() {
  const [location] = useLocation();
  const [inputHash, setInputHash] = useState("");
  const [searchHash, setSearchHash] = useState<string | null>(null);

  // Leggi hash dall'URL query string (?hash=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hashParam = params.get("hash");
    if (hashParam) {
      setInputHash(hashParam);
      setSearchHash(hashParam);
    }
  }, [location]);

  const { data: article, isLoading, isFetching } = trpc.news.lookupByHash.useQuery(
    { hash: searchHash! },
    { enabled: !!searchHash && searchHash.length >= 8 }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputHash.trim();
    if (trimmed.length < 8) return;
    setSearchHash(trimmed);
    // Aggiorna URL senza ricaricare
    const url = new URL(window.location.href);
    url.searchParams.set("hash", trimmed);
    window.history.pushState({}, "", url.toString());
  };

  const isSearching = isLoading || isFetching;

  return (
    <div className="flex min-h-screen" style={{ background: "#faf8f3", color: "#1a1a1a" }}>
      <LeftSidebar />
      <div className="flex-1 min-w-0 overflow-x-hidden">
      <SharedPageHeader />
      <main className="max-w-3xl mx-auto px-4 py-10">

        {/* ── Intestazione sezione ──────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-[#0d6e3f]" strokeWidth={1.5} />
            <span
              className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#1a1a1a]/40"
              style={{ fontFamily: SFText }}
            >
              ● IDEASMART VERIFY
            </span>
          </div>
          <h1
            className="text-3xl md:text-4xl font-black text-[#1a1a1a] leading-none mb-3"
            style={{ fontFamily: SF }}
          >
            Verifica Autenticità
          </h1>
          <p
            className="text-[15px] text-[#1a1a1a]/55 leading-relaxed max-w-xl"
            style={{ fontFamily: SFText, lineHeight: 1.7 }}
          >
            Ogni articolo pubblicato su IDEASMART riceve un hash crittografico SHA-256 univoco
            che certifica titolo, fonte e timestamp in modo immutabile.
            Incolla l'hash qui sotto per verificare l'autenticità di un articolo.
          </p>
        </div>

        {/* ── Form di ricerca ───────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-0 border-2 border-[#1a1a1a] overflow-hidden">
            <div className="flex items-center pl-4 text-[#1a1a1a]/30">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={inputHash}
              onChange={(e) => setInputHash(e.target.value)}
              placeholder="Incolla qui l'hash VERIFY dell'articolo (es. a3f9c2d1...)"
              className="flex-1 px-3 py-3.5 text-[13px] bg-white outline-none text-[#1a1a1a] placeholder-[#1a1a1a]/30"
              style={{ fontFamily: "JetBrains Mono, 'Courier New', monospace" }}
              autoFocus
            />
            <button
              type="submit"
              disabled={inputHash.trim().length < 8 || isSearching}
              className="px-5 py-3.5 bg-[#1a1a1a] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              style={{ fontFamily: SFText }}
            >
              {isSearching ? "Verifica..." : "Verifica"}
            </button>
          </div>
          <p className="mt-2 text-[10px] text-[#1a1a1a]/35 uppercase tracking-widest" style={{ fontFamily: SFText }}>
            L'hash è visibile sotto ogni articolo come "VERIFY #XXXXXXXX"
          </p>
        </form>

        {/* ── Risultato ─────────────────────────────────────────────────── */}
        {isSearching && (
          <div className="border border-[#1a1a1a]/10 p-8 text-center bg-white">
            <div className="w-6 h-6 border-2 border-[#1a1a1a]/20 border-t-[#1a1a1a] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[12px] text-[#1a1a1a]/40 uppercase tracking-widest" style={{ fontFamily: SFText }}>
              Ricerca nel database...
            </p>
          </div>
        )}

        {!isSearching && searchHash && (
          <VerifyResult article={article ?? null} hash={searchHash} />
        )}

        {/* ── Info tecnologia VERIFY ────────────────────────────────────── */}
        {!searchHash && (
          <div className="border border-[#1a1a1a]/10 p-6 bg-white mt-2">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-[#0066cc] mt-0.5 flex-shrink-0" />
              <div>
                <p
                  className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0066cc] mb-2"
                  style={{ fontFamily: SFText }}
                >
                  Come funziona VERIFY
                </p>
                <p
                  className="text-[13px] text-[#1a1a1a]/60 leading-relaxed"
                  style={{ fontFamily: SFText, lineHeight: 1.7 }}
                >
                  VERIFY è un protocollo di validazione e certificazione agentica delle notizie.
                  Ogni contenuto viene analizzato da un sistema AI multi-fonte che ne misura
                  affidabilità, coerenza fattuale e obiettività. Il risultato viene sigillato
                  in un hash crittografico immutabile — ispirato alla notarizzazione Web3 —
                  che garantisce tracciabilità e verificabilità nel tempo.
                </p>
                <p
                  className="text-[12px] text-[#1a1a1a]/40 mt-3 leading-relaxed"
                  style={{ fontFamily: SFText }}
                >
                  L'hash è generato da: <code className="text-[#1a1a1a]/60">SHA-256(titolo + sommario + sourceUrl + timestamp)</code>
                </p>
              </div>
            </div>
          </div>
        )}

      </main>
      <SharedPageFooter />
      </div>{/* fine contenuto principale */}
    </div>
  );
}
