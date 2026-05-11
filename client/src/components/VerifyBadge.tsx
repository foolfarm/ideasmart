/**
 * VerifyBadge — Badge ProofPress Verify
 *
 * LOGICA:
 * - Se ppvHash è presente → articolo certificato PPV:
 *     mostra shield + "PROOFPRESS VERIFY™" + tasto copy (copia ppvHash)
 * - Se ppvHash è assente ma hash locale presente → articolo non ancora certificato PPV:
 *     mostra shield grigio + "CERTIFICAZIONE IN CORSO" (nessun tasto copy)
 *
 * Il tasto copy copia SOLO il ppvHash (hash certificato nel DB ProofPressVerify).
 * L'hash SHA-256 locale NON viene mai copiato perché non è riconosciuto dal widget PPV.
 */
import { useState } from "react";
import { ShieldCheck, ShieldOff, Copy, Check } from "lucide-react";
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

  // Mostra il badge solo se c'è almeno un hash (locale o PPV)
  const hasLocalHash = !!hash;
  const hasPpvHash = !!ppvHash;

  if (!hasLocalHash && !hasPpvHash) return null;

  // Dati di visualizzazione: usa PPV se disponibile, altrimenti fallback locale
  const effectiveGrade = ppvTrustGrade || trustGrade;
  const effectiveScore =
    ppvTrustScore !== null && ppvTrustScore !== undefined
      ? ppvTrustScore * 100
      : trustScore;

  const gradeColor = effectiveGrade ? (GRADE_COLOR[effectiveGrade] ?? "#636e72") : null;
  const gradeLabel = effectiveGrade ? (GRADE_LABEL[effectiveGrade] ?? "") : "";
  const scoreText =
    effectiveScore !== null && effectiveScore !== undefined
      ? Math.round(Number(effectiveScore))
      : "—";
  const gradeTooltip = `Trust Score: ${scoreText}/100 — Grade ${effectiveGrade} (${gradeLabel}) · Certificato ProofPress Verify™ · Clicca per scoprire come funziona il sistema di valutazione`;

  function handleGradeClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    navigate("/trust-score");
  }

  function handleVerifyClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!hasPpvHash) return; // non certificato, nessuna azione
    if (ppvIpfsUrl) {
      window.open(ppvIpfsUrl, "_blank", "noopener,noreferrer");
    } else {
      window.open(
        `https://proofpressverify.com/api/public/certificate/${encodeURIComponent(ppvHash!)}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  }

  // Copia SOLO il ppvHash certificato — mai l'hash locale
  async function handleCopy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!hasPpvHash) return;
    try {
      await navigator.clipboard.writeText(ppvHash!);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = ppvHash!;
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

  // ── ARTICOLO NON ANCORA CERTIFICATO PPV ──────────────────────────────────
  if (!hasPpvHash) {
    if (size === "sm") {
      return (
        <span className="inline-flex items-center gap-1 select-none" title="Certificazione ProofPress Verify in corso">
          <ShieldOff size={10} strokeWidth={2} style={{ color: "#b2bec3", flexShrink: 0 }} />
          <span
            style={{
              fontFamily: "JetBrains Mono, 'Courier New', monospace",
              fontSize: "9px",
              fontWeight: 600,
              letterSpacing: "0.05em",
              color: "#b2bec3",
              lineHeight: 1,
            }}
          >
            CERTIFICAZIONE IN CORSO
          </span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 select-none" title="Certificazione ProofPress Verify in corso">
        <ShieldOff size={12} strokeWidth={2} style={{ color: "#b2bec3", flexShrink: 0 }} />
        <span
          style={{
            fontFamily: "JetBrains Mono, 'Courier New', monospace",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.05em",
            color: "#b2bec3",
            lineHeight: 1,
          }}
        >
          CERTIFICAZIONE IN CORSO
        </span>
      </span>
    );
  }

  // ── ARTICOLO CERTIFICATO PPV ─────────────────────────────────────────────
  if (size === "sm") {
    return (
      <span className="inline-flex items-center gap-1 select-none">
        {/* Trust grade badge */}
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

        {/* Icona shield — apre il certificato PPV */}
        <span
          role="link"
          tabIndex={0}
          onClick={handleVerifyClick}
          onKeyDown={(e) => e.key === "Enter" && handleVerifyClick(e as unknown as React.MouseEvent)}
          title={`Verifica certificato ProofPress Verify™ · Hash: ${ppvHash}`}
          className="cursor-pointer hover:opacity-75 transition-opacity inline-flex items-center"
        >
          <ShieldCheck size={10} strokeWidth={2.5} style={{ color: "#0066cc", flexShrink: 0 }} />
        </span>

        {/* Label */}
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
          PROOFPRESS VERIFY™
        </span>

        {/* Tasto copy — copia ppvHash */}
        <button
          onClick={handleCopy}
          title={copied ? "Codice PP copiato!" : `Copia codice PP · ${ppvHash}`}
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
      {/* Trust grade badge md */}
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

      {/* Blocco "ProofPress Verify" + copy */}
      <div
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded border transition-all"
        style={{
          borderColor: copied ? "#2e7d3230" : "#0066cc20",
          background: copied ? "#f0faf4" : "#f0f7ff",
        }}
      >
        {/* Icona shield */}
        <span
          role="link"
          tabIndex={0}
          onClick={handleVerifyClick}
          onKeyDown={(e) => e.key === "Enter" && handleVerifyClick(e as unknown as React.MouseEvent)}
          title={`Verifica certificato ProofPress Verify™ · Hash: ${ppvHash}`}
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
          {copied ? "COPIATO!" : "PROOFPRESS VERIFY™"}
        </span>

        {/* Tasto copy */}
        <button
          onClick={handleCopy}
          title={copied ? "Codice PP copiato!" : `Copia codice PP · ${ppvHash}`}
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
