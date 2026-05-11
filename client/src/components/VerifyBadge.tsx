/**
 * VerifyBadge — Badge ProofPress Verify con hash SHA-256 nascosto
 *
 * Mostra: "Verifica Articolo" + tasto copy (icona) + feedback "Copiato!"
 * L'hash completo NON viene mostrato nel testo — è nascosto nel tooltip e copiato al click.
 *
 * Click icona shield: apre https://proofpressverify.com/api/public/certificate/<hash>
 * Click tasto copy: copia l'hash negli appunti con feedback visivo
 *
 * trustGrade: se valorizzato, mostra il badge A/B/C/D/F accanto al label.
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

  const gradeColor = effectiveGrade ? (GRADE_COLOR[effectiveGrade] ?? "#636e72") : null;
  const gradeLabel = effectiveGrade ? (GRADE_LABEL[effectiveGrade] ?? "") : "";
  const scoreText =
    effectiveScore !== null && effectiveScore !== undefined
      ? Math.round(Number(effectiveScore))
      : "—";
  const gradeTooltip = `Trust Score: ${scoreText}/100 — Grade ${effectiveGrade} (${gradeLabel})${
    isPpvCertified ? " · Certificato ProofPress Verify™" : ""
  } · Clicca per scoprire come funziona il sistema di valutazione`;

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
      window.open(
        `https://proofpressverify.com/api/public/certificate/${encodeURIComponent(effectiveHash!)}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  }

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

        {/* Icona shield — apre il certificato */}
        <span
          role="link"
          tabIndex={0}
          onClick={handleVerifyClick}
          onKeyDown={(e) => e.key === "Enter" && handleVerifyClick(e as unknown as React.MouseEvent)}
          title={`Verifica certificato ProofPress${isPpvCertified ? "™" : ""} · Hash: ${effectiveHash}`}
          className="cursor-pointer hover:opacity-75 transition-opacity inline-flex items-center"
        >
          <ShieldCheck size={10} strokeWidth={2.5} style={{ color: "#0066cc", flexShrink: 0 }} />
        </span>

        {/* Label "Verifica Articolo" */}
        <span
          style={{
            fontFamily: "JetBrains Mono, 'Courier New', monospace",
            fontSize: "9px",
            fontWeight: 600,
            letterSpacing: "0.05em",
            color: "#0066cc",
            lineHeight: 1,
          }}
        >
          {isPpvCertified ? "PROOFPRESS VERIFY™" : "VERIFICA ARTICOLO"}
        </span>

        {/* Tasto copy */}
        <button
          onClick={handleCopy}
          title={copied ? "Hash copiato!" : `Copia codice di verifica · ${effectiveHash}`}
          className="inline-flex items-center gap-0.5 cursor-pointer hover:opacity-75 transition-opacity"
          style={{ background: "none", border: "none", padding: "0 2px" }}
        >
          {copied ? (
            <>
              <Check size={9} strokeWidth={2.5} style={{ color: "#2e7d32", flexShrink: 0 }} />
              <span style={{ fontFamily: "JetBrains Mono, 'Courier New', monospace", fontSize: "8px", fontWeight: 600, color: "#2e7d32", letterSpacing: "0.04em" }}>
                COPIATO!
              </span>
            </>
          ) : (
            <Copy size={9} strokeWidth={2} style={{ color: "#0066cc", flexShrink: 0 }} />
          )}
        </button>
      </span>
    );
  }

  // size === "md"
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

      {/* Blocco "Verifica Articolo" + copy */}
      <div
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded border transition-all"
        style={{
          borderColor: copied ? "#2e7d3230" : "#0066cc20",
          background: copied ? "#f0faf4" : "#f0f7ff",
        }}
      >
        {/* Icona shield — apre il certificato */}
        <span
          role="link"
          tabIndex={0}
          onClick={handleVerifyClick}
          onKeyDown={(e) => e.key === "Enter" && handleVerifyClick(e as unknown as React.MouseEvent)}
          title={`Verifica certificato ProofPress${isPpvCertified ? "™" : ""} · Hash: ${effectiveHash}`}
          className="cursor-pointer hover:opacity-75 transition-opacity inline-flex items-center"
        >
          <ShieldCheck size={12} strokeWidth={2.5} style={{ color: copied ? "#2e7d32" : "#0066cc", flexShrink: 0 }} />
        </span>

        {/* Label */}
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
          {copied ? "COPIATO!" : isPpvCertified ? "PROOFPRESS VERIFY™" : "VERIFICA ARTICOLO"}
        </span>

        {/* Tasto copy */}
        <button
          onClick={handleCopy}
          title={copied ? "Hash copiato!" : `Copia codice di verifica · ${effectiveHash}`}
          className="inline-flex items-center cursor-pointer hover:opacity-75 transition-opacity"
          style={{ background: "none", border: "none", padding: 0 }}
        >
          {copied ? (
            <Check size={11} strokeWidth={2.5} style={{ color: "#2e7d32", flexShrink: 0 }} />
          ) : (
            <Copy size={11} strokeWidth={2} style={{ color: "#0066cc", flexShrink: 0 }} />
          )}
        </button>
      </div>
    </span>
  );
}
