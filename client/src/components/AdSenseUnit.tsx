/**
 * AdSenseUnit — Componente riutilizzabile per le unità display Google AdSense
 *
 * Formati disponibili:
 *  - "autorelaxed"  → slot 4913395454, autorelaxed (fine pagina, dopo correlati)
 *  - "in-article"   → slot 8796800149, fluid in-article centrato (metà corpo articolo)
 *  - "fluid"        → slot 5451008544, fluid native inline (inizio articolo)
 *  - "proopress1"   → slot 9347464483, auto responsive (fine corpo articolo)
 *  - "leaderboard"  → slot 9347464483, 728×90 (sotto l'header, desktop)
 *  - "medium-rect"  → slot 9347464483, 300×250 (colonna destra home)
 *
 * Lo script adsbygoogle.js è già caricato in index.html.
 * Ogni istanza chiama push({}) una sola volta al mount (anti-doppio push in StrictMode).
 *
 * NOTA: In sviluppo (localhost) gli annunci non vengono visualizzati — normale.
 * In produzione (proofpress.ai) vengono serviti automaticamente dopo approvazione AdSense.
 */

import { useEffect, useRef } from "react";

export type AdFormat = "autorelaxed" | "in-article" | "fluid" | "proopress1" | "leaderboard" | "medium-rect";

interface AdSenseUnitProps {
  format: AdFormat;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const AD_CLIENT        = "ca-pub-7185482526978993";
const SLOT_AUTO        = "9347464483";   // proopress1 — auto responsive
const SLOT_FLUID       = "5451008544";   // fluid native inline
const FLUID_LAYOUT     = "-4p+cn+4z-cw-v";
const SLOT_IN_ARTICLE  = "8796800149";   // fluid in-article centrato
const SLOT_AUTORELAXED = "4913395454";   // autorelaxed — fine pagina

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";

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

  /* ── Autorelaxed — fine pagina ── */
  if (format === "autorelaxed") {
    return (
      <div className={`adsense-unit w-full ${className}`}>
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-format="autorelaxed"
          data-ad-client={AD_CLIENT}
          data-ad-slot={SLOT_AUTORELAXED}
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

  /* ── In-article fluid centrato ── */
  if (format === "in-article") {
    return (
      <div className={`adsense-unit w-full ${className}`}>
        <ins
          className="adsbygoogle"
          style={{ display: "block", textAlign: "center" }}
          data-ad-layout="in-article"
          data-ad-format="fluid"
          data-ad-client={AD_CLIENT}
          data-ad-slot={SLOT_IN_ARTICLE}
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

  /* ── Fluid native inline ── */
  if (format === "fluid") {
    return (
      <div className={`adsense-unit w-full ${className}`}>
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-format="fluid"
          data-ad-layout-key={FLUID_LAYOUT}
          data-ad-client={AD_CLIENT}
          data-ad-slot={SLOT_FLUID}
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

  /* ── Auto responsive (proopress1) ── */
  if (format === "proopress1") {
    return (
      <div className={`adsense-unit w-full ${className}`}>
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={AD_CLIENT}
          data-ad-slot={SLOT_AUTO}
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
          data-ad-slot={SLOT_AUTO}
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
        data-ad-slot={SLOT_AUTO}
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
