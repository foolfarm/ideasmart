/**
 * Registro Pubblico Certificazioni ProofPress Verify
 * Pagina pubblica che mostra tutti gli articoli certificati con CID IPFS.
 * Accessibile a chiunque senza login — prova di trasparenza indipendente.
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ExternalLink, Copy, Check, Shield, Database, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

const GRADE_COLOR: Record<string, string> = {
  A: "#00897b",
  B: "#1976d2",
  C: "#f57c00",
  D: "#e53935",
  F: "#b71c1c",
};

const GRADE_LABEL: Record<string, string> = {
  A: "Eccellente",
  B: "Buono",
  C: "Sufficiente",
  D: "Scarso",
  F: "Non verificato",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copiato negli appunti");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-black/5 transition-colors flex-shrink-0"
      title="Copia"
    >
      {copied ? <Check size={11} color="#00897b" /> : <Copy size={11} color="#636e72" />}
    </button>
  );
}

export default function VerifyRegistry() {
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const { data, isLoading } = trpc.verifyOrg.listCertifications.useQuery(
    { limit: PAGE_SIZE, offset: page * PAGE_SIZE },
    { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false }
  );

  const certifications = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <SEOHead
        title="Registro Certificazioni IPFS — ProofPress Verify"
        description={`${total} articoli certificati con tecnologia ProofPress Verify e archiviati su IPFS. Registro pubblico e verificabile da chiunque.`}
      />
      <div className="min-h-screen" style={{ background: "#f5f5f7" }}>
        {/* Header */}
        <div className="border-b border-[#e5e5ea] bg-white">
          <div className="max-w-6xl mx-auto px-4 py-5">
            <Link href="/" className="inline-flex items-center gap-1.5 text-[12px] text-[#1a1a1a]/50 hover:text-[#1a1a1a] transition-colors mb-4" style={{ fontFamily: SF }}>
              <ArrowLeft size={13} />
              ProofPress
            </Link>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#00897b15" }}>
                <Shield size={20} color="#00897b" />
              </div>
              <div>
                <h1 className="text-[22px] font-bold text-[#1a1a1a]" style={{ fontFamily: SF }}>
                  Registro Pubblico Certificazioni
                </h1>
                <p className="text-[13px] text-[#1a1a1a]/55 mt-0.5" style={{ fontFamily: SF }}>
                  Ogni notizia verificata da ProofPress Verify è archiviata su IPFS con un CID crittograficamente immutabile.
                  Chiunque può verificare in modo indipendente che il report non sia stato alterato dopo la certificazione.
                </p>
              </div>
            </div>
            {/* Stats bar */}
            <div className="flex items-center gap-6 mt-5 pt-4 border-t border-[#e5e5ea]">
              <div className="flex items-center gap-2">
                <Database size={14} color="#00897b" />
                <span className="text-[13px] font-bold text-[#00897b]" style={{ fontFamily: SF }}>
                  {total.toLocaleString("it-IT")} certificazioni
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#00897b]" />
                <span className="text-[12px] text-[#1a1a1a]/50" style={{ fontFamily: SF }}>
                  Rete IPFS decentralizzata
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#1976d2]" />
                <span className="text-[12px] text-[#1a1a1a]/50" style={{ fontFamily: SF }}>
                  Pinning via Pinata
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Info box */}
          <div className="rounded-xl border border-[#00897b33] bg-[#00897b08] p-4 mb-6">
            <p className="text-[12px] text-[#1a1a1a]/65 leading-relaxed" style={{ fontFamily: SF }}>
              <strong className="text-[#00897b]">Come funziona:</strong> ogni articolo verificato riceve un hash crittografico (CID) univoco su IPFS.
              Il CID è determinato dal contenuto del report: se il report viene modificato anche di un solo carattere, il CID cambia.
              Copia il CID e accedi a{" "}
              <a href="https://ipfs.io" target="_blank" rel="noopener noreferrer" className="text-[#00897b] underline">ipfs.io</a>{" "}
              per verificare in modo indipendente l'autenticità di ogni certificazione.
            </p>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-[#e5e5ea] overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-[#00897b] border-t-transparent rounded-full animate-spin" />
                  <p className="text-[13px] text-[#1a1a1a]/50" style={{ fontFamily: SF }}>Caricamento certificazioni…</p>
                </div>
              </div>
            ) : certifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Shield size={32} color="#e5e5ea" />
                <p className="text-[14px] text-[#1a1a1a]/40" style={{ fontFamily: SF }}>Nessuna certificazione disponibile</p>
              </div>
            ) : (
              <>
                {/* Table header */}
                <div className="grid grid-cols-[1fr_100px_160px_160px_80px] gap-4 px-5 py-3 border-b border-[#e5e5ea] bg-[#fafafa]">
                  {["Articolo", "Grade", "Verify Hash", "IPFS CID", "Data"].map(h => (
                    <span key={h} className="text-[10px] font-bold uppercase tracking-wider text-[#1a1a1a]/40" style={{ fontFamily: SF }}>{h}</span>
                  ))}
                </div>
                {/* Rows */}
                {certifications.map((cert, idx) => (
                  <div
                    key={cert.id}
                    className={`grid grid-cols-[1fr_100px_160px_160px_80px] gap-4 px-5 py-4 items-start border-b border-[#f0f0f0] hover:bg-[#fafafa] transition-colors ${idx === certifications.length - 1 ? "border-b-0" : ""}`}
                  >
                    {/* Titolo */}
                    <div className="min-w-0">
                      {cert.sourceUrl ? (
                        <a
                          href={cert.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[13px] font-semibold text-[#1a1a1a] hover:text-[#00897b] transition-colors line-clamp-2 leading-snug"
                          style={{ fontFamily: SF }}
                        >
                          {cert.title}
                        </a>
                      ) : (
                        <p className="text-[13px] font-semibold text-[#1a1a1a] line-clamp-2 leading-snug" style={{ fontFamily: SF }}>
                          {cert.title}
                        </p>
                      )}
                      {cert.sourceName && (
                        <p className="text-[10px] text-[#1a1a1a]/40 mt-0.5 uppercase tracking-wider" style={{ fontFamily: SF }}>
                          {cert.sourceName}
                        </p>
                      )}
                    </div>

                    {/* Grade */}
                    <div className="flex items-center gap-1.5">
                      {cert.trustGrade ? (
                        <>
                          <span
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-[13px] font-black"
                            style={{ background: `${GRADE_COLOR[cert.trustGrade] ?? "#636e72"}18`, color: GRADE_COLOR[cert.trustGrade] ?? "#636e72" }}
                          >
                            {cert.trustGrade}
                          </span>
                          <span className="text-[10px] text-[#1a1a1a]/50 hidden xl:block" style={{ fontFamily: SF }}>
                            {GRADE_LABEL[cert.trustGrade] ?? ""}
                          </span>
                        </>
                      ) : (
                        <span className="text-[11px] text-[#1a1a1a]/30" style={{ fontFamily: SF }}>—</span>
                      )}
                    </div>

                    {/* Verify Hash */}
                    <div className="flex items-center gap-1 min-w-0">
                      <span
                        className="text-[10px] font-mono text-[#1a1a1a]/50 truncate"
                        title={cert.verifyHash ?? ""}
                      >
                        {cert.verifyHash ? `${cert.verifyHash.slice(0, 18)}…` : "—"}
                      </span>
                      {cert.verifyHash && <CopyButton text={cert.verifyHash} />}
                    </div>

                    {/* IPFS CID */}
                    <div className="flex items-center gap-1 min-w-0">
                      {cert.ipfsCid ? (
                        <>
                          <span
                            className="text-[10px] font-mono text-[#00897b] truncate"
                            title={cert.ipfsCid}
                          >
                            {cert.ipfsCid.slice(0, 18)}…
                          </span>
                          <CopyButton text={cert.ipfsCid} />
                          {cert.ipfsUrl && (
                            <a
                              href={cert.ipfsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-[#00897b15] transition-colors flex-shrink-0"
                              title="Apri su IPFS"
                            >
                              <ExternalLink size={11} color="#00897b" />
                            </a>
                          )}
                        </>
                      ) : (
                        <span className="text-[11px] text-[#1a1a1a]/30" style={{ fontFamily: SF }}>In attesa</span>
                      )}
                    </div>

                    {/* Data */}
                    <div>
                      <span className="text-[11px] text-[#1a1a1a]/45" style={{ fontFamily: SF }}>
                        {cert.ipfsPinnedAt
                          ? new Date(cert.ipfsPinnedAt).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "2-digit" })
                          : cert.publishedAt
                            ? new Date(cert.publishedAt).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "2-digit" })
                            : "—"
                        }
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 rounded-lg text-[12px] font-semibold border border-[#e5e5ea] bg-white hover:bg-[#fafafa] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                style={{ fontFamily: SF }}
              >
                ← Precedente
              </button>
              <span className="text-[12px] text-[#1a1a1a]/50" style={{ fontFamily: SF }}>
                Pagina {page + 1} di {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 rounded-lg text-[12px] font-semibold border border-[#e5e5ea] bg-white hover:bg-[#fafafa] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                style={{ fontFamily: SF }}
              >
                Successiva →
              </button>
            </div>
          )}

          {/* Footer note */}
          <p className="text-center text-[11px] text-[#1a1a1a]/35 mt-8" style={{ fontFamily: SF }}>
            Questo registro è pubblico e aggiornato in tempo reale. Ogni CID è permanente e non dipende dai server di ProofPress.{" "}
            <Link href="/proofpress-verify" className="text-[#00897b] hover:underline">
              Scopri come funziona ProofPress Verify →
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
