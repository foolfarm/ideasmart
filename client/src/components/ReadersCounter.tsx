/**
 * ReadersCounter — contatore lettori attivi per la riga istituzionale.
 * Legge il dato reale dal DB via trpc.newsletter.getActiveCount.
 * Mostra un'animazione di conteggio al primo render e aggiorna ogni 5 minuti.
 */
import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";

interface ReadersCounterProps {
  /** Classe CSS aggiuntiva per il contenitore */
  className?: string;
  /** Valore di fallback mentre il dato viene caricato */
  fallback?: number;
}

/** Formatta il numero con separatore migliaia (es. 1857 → "1.857") */
function formatCount(n: number): string {
  return n.toLocaleString("it-IT");
}

/** Hook per animare il contatore da 0 al valore target */
function useCountUp(target: number, duration = 1200): number {
  const [current, setCurrent] = useState(0);
  const raf = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);
  const startValue = useRef(0);

  useEffect(() => {
    if (target === 0) return;
    startValue.current = current;
    startTime.current = null;

    const step = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      // Easing: ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(startValue.current + (target - startValue.current) * eased);
      setCurrent(value);
      if (progress < 1) {
        raf.current = requestAnimationFrame(step);
      }
    };

    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return current;
}

export default function ReadersCounter({ className = "", fallback = 1200 }: ReadersCounterProps) {
  const { data, isLoading } = trpc.newsletter.getActiveCount.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minuti
    refetchInterval: 5 * 60 * 1000,
  });

  // Usa il dato reale se disponibile, altrimenti il fallback
  const target = isLoading ? 0 : (typeof data === "number" ? data : fallback);
  const animated = useCountUp(target, 1400);

  // Non mostrare nulla se il dato è 0 o non ancora caricato
  if (isLoading) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] ${className}`}
        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", color: "#1a1a1a", opacity: 0.35 }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#9ca3af",
            display: "inline-block",
          }}
        />
        — lettori
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] select-none ${className}`}
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", color: "#1a1a1a", opacity: 0.65 }}
      title="Lettori attivi iscritti alla newsletter Proof Press"
    >
      {/* Pallino verde pulsante */}
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "#00b89a",
          display: "inline-block",
          boxShadow: "0 0 0 0 rgba(0,184,154,0.4)",
          animation: "pulse-dot 2s infinite",
        }}
      />
      <style>{`
        @keyframes pulse-dot {
          0%   { box-shadow: 0 0 0 0 rgba(0,184,154,0.45); }
          70%  { box-shadow: 0 0 0 5px rgba(0,184,154,0); }
          100% { box-shadow: 0 0 0 0 rgba(0,184,154,0); }
        }
      `}</style>
      {formatCount(animated)} lettori
    </span>
  );
}
