/**
 * CollaboratoriBanner — Banner editoriale "Scrivi per ProofPress"
 * Design: coerente con il sito (white bg, #0a0a0a, #ff5500 orange)
 * Varianti: "full" (orizzontale largo, per home/pagine interne) e "compact" (sidebar)
 */
import { Link } from "wouter";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const ORANGE = "#ff5500";

interface CollaboratoriBannerProps {
  variant?: "full" | "compact";
  className?: string;
}

export default function CollaboratoriBanner({ variant = "full", className = "" }: CollaboratoriBannerProps) {
  if (variant === "compact") {
    return (
      <div
        className={`relative overflow-hidden ${className}`}
        style={{
          background: "#0a0a0a",
          border: `1px solid ${ORANGE}30`,
          fontFamily: SF,
        }}
      >
        {/* Accent line top */}
        <div style={{ height: "3px", background: ORANGE, width: "100%" }} />

        <div className="p-5">
          {/* Tag */}
          <span
            className="inline-block text-[9px] font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: ORANGE }}
          >
            Cerchiamo collaboratori
          </span>

          {/* Headline */}
          <p
            className="text-sm font-black text-white leading-snug mb-3"
            style={{ fontFamily: SF }}
          >
            Vuoi scrivere su ProofPress?
          </p>

          {/* Sub */}
          <p className="text-[11px] text-white/55 leading-relaxed mb-4" style={{ fontFamily: SF }}>
            Giornalisti, analisti e voci pronte a cambiare il giornalismo. Entra nella redazione del futuro.
          </p>

          {/* CTA */}
          <Link href="/scrivi-per-noi">
            <span
              className="inline-block text-[11px] font-bold uppercase tracking-wide px-4 py-2 transition-all hover:opacity-90 cursor-pointer"
              style={{ background: ORANGE, color: "#ffffff", fontFamily: SF }}
            >
              Scopri come →
            </span>
          </Link>
        </div>
      </div>
    );
  }

  // variant === "full"
  return (
    <div
      className={`relative overflow-hidden w-full ${className}`}
      style={{
        background: "#0a0a0a",
        fontFamily: SF,
      }}
    >
      {/* Accent line top */}
      <div style={{ height: "3px", background: ORANGE, width: "100%" }} />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-7">
        {/* Left: copy */}
        <div className="flex-1 min-w-0">
          <span
            className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: ORANGE }}
          >
            Cerchiamo collaboratori · Redazione aperta
          </span>

          <h3
            className="text-xl md:text-2xl font-black text-white leading-snug mb-2"
            style={{ fontFamily: SF }}
          >
            Vuoi scrivere su ProofPress ed entrare nel nuovo giornalismo?
          </h3>

          <p className="text-sm text-white/55 leading-relaxed max-w-xl" style={{ fontFamily: SF }}>
            Cerchiamo collaboratori e penne pronte a cambiare il mondo. AI, startup, venture capital, tecnologia: 
            scrivi per la prima testata di AI Journalism certificato in Italia.
          </p>
        </div>

        {/* Right: stats + CTA */}
        <div className="flex flex-col items-center md:items-end gap-4 flex-shrink-0">
          {/* Mini stats */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-xl font-black text-white" style={{ fontFamily: SF }}>12.000+</div>
              <div className="text-[10px] text-white/40 uppercase tracking-wide">lettori</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <div className="text-xl font-black text-white" style={{ fontFamily: SF }}>4.000+</div>
              <div className="text-[10px] text-white/40 uppercase tracking-wide">fonti monitorate</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <div className="text-xl font-black" style={{ color: ORANGE, fontFamily: SF }}>100%</div>
              <div className="text-[10px] text-white/40 uppercase tracking-wide">verificato</div>
            </div>
          </div>

          {/* CTA */}
          <Link href="/scrivi-per-noi">
            <span
              className="inline-block text-sm font-bold uppercase tracking-wide px-6 py-3 transition-all hover:opacity-90 cursor-pointer"
              style={{ background: ORANGE, color: "#ffffff", fontFamily: SF }}
            >
              Candidati ora →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
