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
 */
import { useState } from "react";
import { ShieldCheck, Copy, Check } from "lucide-react";
import { useLocation } from "wouter";

interface VerifyBadgeProps {
  hash?: string | null;
  size?: "sm" | "md";
  trustGrade?: string | null;
  trustScore?: number | null;
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

export default function VerifyBadge({ hash, size = "sm", trustGrade, trustScore }: VerifyBadgeProps) {
  const [copied, setCopied] = useState(false);
  const [, navigate] = useLocation();

  if (!hash) return null;

  const displayHash = "#" + hash.substring(0, 16).toUpperCase();
  const verifyUrl = `/proofpress-verify?hash=${encodeURIComponent(hash)}`;

  function handleGradeClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    navigate("/trust-score");
  }

  function handleVerifyClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    navigate(verifyUrl);
  }
  const gradeColor = trustGrade ? (GRADE_COLOR[trustGrade] ?? "#636e72") : null;
  const gradeLabel = trustGrade ? (GRADE_LABEL[trustGrade] ?? "") : "";
  const scoreText = trustScore !== null && trustScore !== undefined ? Math.round(Number(trustScore)) : "—";
  const gradeTooltip = `Trust Score: ${scoreText}/100 — Grade ${trustGrade} (${gradeLabel}) · Clicca per scoprire come funziona il sistema di valutazione`;

  async function handleCopy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(hash!);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = hash!;
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
        {trustGrade && gradeColor && (
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
            {trustGrade}
          </span>
        )}
        {/* Copia hash — click principale */}
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 cursor-pointer hover:opacity-75 transition-opacity"
          title={copied ? "Hash copiato!" : "Clicca per copiare l'hash — " + hash}
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
            {copied ? "COPIATO!" : `PROOFPRESS VERIFY ${displayHash}`}
          </span>
        </button>
        {/* Link verifica — icona separata */}
        <span
          role="link"
          tabIndex={0}
          onClick={handleVerifyClick}
          onKeyDown={(e) => e.key === "Enter" && handleVerifyClick(e as unknown as React.MouseEvent)}
          title="Verifica su ProofPress"
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
      {trustGrade && gradeColor && (
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
          {trustGrade}
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
        title={copied ? "Hash copiato!" : "Clicca per copiare l'hash — " + hash}
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
            {copied ? "COPIATO!" : `PROOFPRESS VERIFY ${displayHash}`}
          </span>
        </div>
      </button>
    </span>
  );
}
