/**
 * AdSenseUnit — Componente riutilizzabile per le unità display Google AdSense
 *
 * Unità configurate:
 *  - "proopress1"   → slot 9347464483, formato auto responsive (default per articoli)
 *  - "leaderboard"  → slot 9347464483, 728×90 (banner orizzontale sotto l'header)
 *  - "medium-rect"  → slot 9347464483, 300×250 (colonna destra home)
 *
 * Lo script adsbygoogle.js è già caricato in index.html.
 * Questo componente chiama (adsbygoogle = window.adsbygoogle || []).push({})
 * una sola volta per istanza al mount, tramite useEffect.
 *
 * NOTA: In sviluppo (localhost) gli annunci non vengono visualizzati — normale.
 * In produzione (proofpress.ai) vengono serviti automaticamente dopo approvazione AdSense.
 */

import { useEffect, useRef } from "react";

type AdFormat = "proopress1" | "leaderboard" | "medium-rect";

interface AdSenseUnitProps {
  format: AdFormat;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const AD_CLIENT = "ca-pub-7185482526978993";
const AD_SLOT   = "9347464483";

export default function AdSenseUnit({ format, className = "" }: AdSenseUnitProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (_) {
      // Silenzioso in sviluppo — normale su localhost
    }
  }, []);

  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";

  /* ── Formato auto responsive (articoli) ── */
  if (format === "proopress1") {
    return (
      <div className={`adsense-unit w-full ${className}`}>
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={AD_CLIENT}
          data-ad-slot={AD_SLOT}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        <span
          className="block text-center mt-0.5"
          style={{ fontFamily: SF, fontSize: "9px", color: "#aeaeb2", textTransform: "uppercase", letterSpacing: "0.1em" }}
        >
          Pubblicità
        </span>
      </div>
    );
  }

  /* ── Leaderboard 728×90 ── */
  if (format === "leaderboard") {
    return (
      <div className={`adsense-unit flex flex-col items-center ${className}`}>
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: 728, height: 90 }}
          data-ad-client={AD_CLIENT}
          data-ad-slot={AD_SLOT}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        <span
          className="mt-0.5"
          style={{ fontFamily: SF, fontSize: "9px", color: "#aeaeb2", textTransform: "uppercase", letterSpacing: "0.1em" }}
        >
          Pubblicità
        </span>
      </div>
    );
  }

  /* ── Medium Rectangle 300×250 ── */
  return (
    <div className={`adsense-unit flex flex-col items-center ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: 300, height: 250 }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={AD_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <span
        className="mt-0.5"
        style={{ fontFamily: SF, fontSize: "9px", color: "#aeaeb2", textTransform: "uppercase", letterSpacing: "0.1em" }}
      >
        Pubblicità
      </span>
    </div>
  );
}
