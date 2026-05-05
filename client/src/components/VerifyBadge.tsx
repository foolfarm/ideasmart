/**
 * VerifyBadge — Badge ProofPress Verify con hash SHA-256 univoco per ogni articolo
 *
 * Click sinistro: copia l'hash completo negli appunti (con feedback visivo "Copiato!")
 * Click destro / Ctrl+click: apre la pagina /proofpress-verify?hash=...
 *
 * L'hash certifica il contenuto dell'articolo al momento della pubblicazione,
 * garantendo tracciabilità e verificabilità nel tempo.
 *
 * trustGrade: se valorizzato, mostra il badge A/B/C/D/F accanto all'hash.
 * Il badge grade è cliccabile e porta alla pagina /trust-score.
 *
 * ppvHash/ppvIpfsUrl: se valorizzati, usa i dati dell'API esterna ProofPress Verify™
 * e il link porta direttamente al report IPFS pubblico.
 */
import { useState } from "react";
import { ShieldCheck, Copy, Check } from "lucide-react";
import { useLocation } from "wouter";

interface VerifyBadgeProps {
  hash?: string | null;
  size?: "sm" | "md";
  trustGrade?: string | null;
  trustScore?: number | null;
  // ProofPress Verify API esterna (proofpressverify.com)
  ppvHash?: string | null;
  ppvIpfsUrl?: string | null;
  ppvDocumentId?: number | null;
  ppvTrustGrade?: string | null;
  ppvTrustScore?: number | null;
}

const GRADE_COLOR: Record<string, string> = {
  A: "#00b894",
  B: "#00cec9",
  C: "#fdcb6e",
  D: "#e17055",
  F: "#d63031",
};

const GRADE_LABEL: Record<string, string> = {
  A: "Certificazione Massima",
  B: "Alta Affidabilità",
  C: "Affidabilità Standard",
  D: "Verifica Parziale",
  F: "Non Verificato",
};

export default function VerifyBadge({
  hash,
  size = "sm",
  trustGrade,
  trustScore,
  ppvHash,
  ppvIpfsUrl,
  ppvDocumentId: _ppvDocumentId,
  ppvTrustGrade,
  ppvTrustScore,
}: VerifyBadgeProps) {
  const [copied, setCopied] = useState(false);
  const [, navigate] = useLocation();

  // Usa i dati PPV se disponibili, altrimenti fallback ai dati locali
  const effectiveHash = ppvHash || hash;
  const effectiveGrade = ppvTrustGrade || trustGrade;
  const effectiveScore =
    ppvTrustScore !== null && ppvTrustScore !== undefined
      ? ppvTrustScore * 100
      : trustScore;
  const isPpvCertified = !!ppvHash;

  if (!effectiveHash) return null;

  const displayHash = "#" + effectiveHash.substring(0, 16).toUpperCase();

  function handleGradeClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    navigate("/trust-score");
  }

  function handleVerifyClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (ppvIpfsUrl) {
      window.open(ppvIpfsUrl, "_blank", "noopener,noreferrer");
    } else {
      navigate(`/proofpress-verify?hash=${encodeURIComponent(effectiveHash!)}`);
    }
  }

  const gradeColor = effectiveGrade ? (GRADE_COLOR[effectiveGrade] ?? "#636e72") : null;
  const gradeLabel = effectiveGrade ? (GRADE_LABEL[effectiveGrade] ?? "") : "";
  const scoreText =
    effectiveScore !== null && effectiveScore !== undefined
      ? Math.round(Number(effectiveScore))
      : "—";
  const gradeTooltip = `Trust Score: ${scoreText}/100 — Grade ${effectiveGrade} (${gradeLabel})${
    isPpvCertified ? " · Certificato ProofPress Verify™" : ""
  } · Clicca per scoprire come funziona il sistema di valutazione`;

  async function handleCopy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(effectiveHash!);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = effectiveHash!;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (size === "sm") {
    return (
      <span className="inline-flex items-center gap-1 select-none">
        {/* Trust grade badge — cliccabile → /trust-score */}
        {effectiveGrade && gradeColor && (
          <span
            role="link"
            tabIndex={0}
            onClick={handleGradeClick}
            onKeyDown={(e) => e.key === "Enter" && handleGradeClick(e as unknown as React.MouseEvent)}
            title={gradeTooltip}
            className="inline-flex items-center justify-center font-black text-white rounded cursor-pointer transition-opacity hover:opacity-75"
            style={{
              background: gradeColor,
              fontSize: "8px",
              width: "14px",
              height: "14px",
              flexShrink: 0,
              letterSpacing: 0,
            }}
          >
            {effectiveGrade}
          </span>
        )}
        {/* Copia hash — click principale */}
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 cursor-pointer hover:opacity-75 transition-opacity"
          title={
            copied
              ? "Hash copiato!"
              : `Clicca per copiare l'hash${isPpvCertified ? " (Certificato PPV™)" : ""} — ` +
                effectiveHash
          }
          style={{ background: "none", border: "none", padding: 0 }}
        >
          {copied ? (
            <Check size={10} strokeWidth={2.5} style={{ color: "#2e7d32", flexShrink: 0 }} />
          ) : (
            <ShieldCheck size={10} strokeWidth={2.5} style={{ color: "#0066cc", flexShrink: 0 }} />
          )}
          <span
            style={{
              fontFamily: "JetBrains Mono, 'Courier New', monospace",
              fontSize: "9px",
              fontWeight: 600,
              letterSpacing: "0.05em",
              color: copied ? "#2e7d32" : "#0066cc",
              lineHeight: 1,
              transition: "color 0.2s ease",
            }}
          >
            {copied ? "COPIATO!" : `PROOFPRESS VERIFY${isPpvCertified ? "™" : ""} ${displayHash}`}
          </span>
        </button>
        {/* Link verifica — icona separata */}
        <span
          role="link"
          tabIndex={0}
          onClick={handleVerifyClick}
          onKeyDown={(e) => e.key === "Enter" && handleVerifyClick(e as unknown as React.MouseEvent)}
          title={isPpvCertified ? "Apri Report IPFS su ProofPress Verify™" : "Verifica su ProofPress"}
          className="cursor-pointer hover:opacity-60 transition-opacity"
          style={{ display: "inline-flex" }}
        >
          <Copy size={8} strokeWidth={2} style={{ color: "#0066cc" }} />
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 select-none">
      {/* Trust grade badge md — cliccabile → /trust-score */}
      {effectiveGrade && gradeColor && (
        <span
          role="link"
          tabIndex={0}
          onClick={handleGradeClick}
          onKeyDown={(e) => e.key === "Enter" && handleGradeClick(e as unknown as React.MouseEvent)}
          title={gradeTooltip}
          className="inline-flex items-center justify-center font-black text-white rounded cursor-pointer transition-opacity hover:opacity-75"
          style={{
            background: gradeColor,
            fontSize: "10px",
            width: "20px",
            height: "20px",
            flexShrink: 0,
          }}
        >
          {effectiveGrade}
        </span>
      )}
      {/* Copia hash */}
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded border cursor-pointer hover:opacity-80 transition-all"
        style={{
          borderColor: copied ? "#2e7d3220" : "#0066cc20",
          background: copied ? "#f0faf4" : "#f0f7ff",
          border: "none",
          padding: 0,
        }}
        title={
          copied
            ? "Hash copiato!"
            : `Clicca per copiare l'hash${isPpvCertified ? " (Certificato PPV™)" : ""} — ` +
              effectiveHash
        }
      >
        <div
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded border transition-all"
          style={{
            borderColor: copied ? "#2e7d3220" : "#0066cc20",
            background: copied ? "#f0faf4" : "#f0f7ff",
          }}
        >
          {copied ? (
            <Check size={12} strokeWidth={2.5} style={{ color: "#2e7d32", flexShrink: 0 }} />
          ) : (
            <ShieldCheck size={12} strokeWidth={2.5} style={{ color: "#0066cc", flexShrink: 0 }} />
          )}
          <span
            style={{
              fontFamily: "JetBrains Mono, 'Courier New', monospace",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: copied ? "#2e7d32" : "#0066cc",
              lineHeight: 1,
              transition: "color 0.2s ease",
            }}
          >
            {copied ? "COPIATO!" : `PROOFPRESS VERIFY${isPpvCertified ? "™" : ""} ${displayHash}`}
          </span>
        </div>
      </button>
    </span>
  );
}
