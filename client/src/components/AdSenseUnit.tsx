/**
 * AdSenseUnit — Componente riutilizzabile per le unità display Google AdSense
 *
 * Formati supportati:
 *  - "leaderboard"  → 728×90  (banner orizzontale sotto l'header, desktop only)
 *  - "medium-rect"  → 300×250 (banner rettangolare colonna destra)
 *
 * Lo script adsbygoogle.js è già caricato in index.html.
 * Questo componente chiama (adsbygoogle = window.adsbygoogle || []).push({})
 * una sola volta per istanza, al mount, tramite useEffect.
 *
 * NOTA: In sviluppo gli annunci non vengono visualizzati (Google blocca localhost).
 * In produzione (proofpress.ai) gli annunci vengono serviti automaticamente
 * da Google Auto Ads / unità manuali una volta approvato l'account AdSense.
 */

import { useEffect, useRef } from "react";

type AdFormat = "leaderboard" | "medium-rect";

interface AdSenseUnitProps {
  format: AdFormat;
  /** Slot ID dell'unità annuncio creata in AdSense (es. "1234567890").
   *  Lasciare vuoto per usare Auto Ads (Google sceglie automaticamente). */
  adSlot?: string;
  className?: string;
}

const FORMAT_CONFIG: Record<AdFormat, { width: number; height: number; label: string }> = {
  "leaderboard": { width: 728, height: 90,  label: "728×90 Leaderboard" },
  "medium-rect": { width: 300, height: 250, label: "300×250 Medium Rectangle" },
};

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdSenseUnit({ format, adSlot, className = "" }: AdSenseUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const { width, height, label } = FORMAT_CONFIG[format];

  useEffect(() => {
    // Evita doppio push in StrictMode / hot-reload
    if (pushed.current) return;
    pushed.current = true;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // Silenzioso in sviluppo — normale su localhost
    }
  }, []);

  return (
    <div
      className={`adsense-unit flex flex-col items-center ${className}`}
      style={{ minWidth: width, minHeight: height }}
      aria-label={`Annuncio pubblicitario ${label}`}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", width, height }}
        data-ad-client="ca-pub-7185482526978993"
        {...(adSlot ? { "data-ad-slot": adSlot } : { "data-ad-format": "auto", "data-full-width-responsive": "true" })}
      />
      <span
        className="mt-0.5 text-[9px] uppercase tracking-[0.1em]"
        style={{ color: "#aeaeb2", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
      >
        Pubblicità
      </span>
    </div>
  );
}
