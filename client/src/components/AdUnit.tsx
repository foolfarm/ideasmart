/**
 * AdUnit — Componente riutilizzabile per Google AdSense
 *
 * Mostra sempre l'annuncio: Google AdSense gestisce autonomamente
 * il consenso GDPR tramite il proprio TCF (Transparency & Consent Framework).
 * Non è necessario bloccare il caricamento lato client.
 */

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

type AdFormat = "auto" | "rectangle" | "horizontal" | "vertical" | "fluid";

interface AdUnitProps {
  /** Slot ID dell'unità pubblicitaria AdSense (lasciare vuoto finché non si ha l'ID) */
  slot?: string;
  /** Formato dell'annuncio */
  format?: AdFormat;
  /** Classe CSS aggiuntiva per il contenitore */
  className?: string;
  /** Layout per annunci in-feed/in-article */
  layout?: string;
  /** Stile inline per il contenitore esterno */
  style?: React.CSSProperties;
  /** Etichetta visiva sopra l'annuncio */
  label?: string;
}

const CLIENT_ID = "ca-pub-7185482526978993";

export default function AdUnit({
  slot = "",
  format = "auto",
  className = "",
  layout,
  style,
  label = "Pubblicità",
}: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn("[AdUnit] adsbygoogle push error:", e);
    }
  }, []);

  return (
    <div
      className={`ad-unit-wrapper ${className}`}
      style={{
        textAlign: "center",
        overflow: "hidden",
        ...style,
      }}
    >
      {label && (
        <p
          style={{
            fontSize: "10px",
            color: "#9ca3af",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "4px",
            fontFamily: "sans-serif",
          }}
        >
          {label}
        </p>
      )}
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
        {...(layout ? { "data-ad-layout": layout } : {})}
      />
    </div>
  );
}

/**
 * Banner orizzontale — ideale tra sezioni (728x90 o responsive)
 */
export function AdBannerHorizontal({ className = "" }: { className?: string }) {
  return (
    <AdUnit
      slot=""
      format="auto"
      className={className}
      style={{ margin: "32px auto", maxWidth: "970px" }}
    />
  );
}

/**
 * Banner rettangolare — ideale in sidebar o tra card (300x250)
 */
export function AdBannerRectangle({ className = "" }: { className?: string }) {
  return (
    <AdUnit
      slot=""
      format="auto"
      className={className}
      style={{ margin: "16px auto", maxWidth: "336px" }}
    />
  );
}

/**
 * Banner in-feed — ideale tra articoli in lista
 */
export function AdBannerInFeed({ className = "" }: { className?: string }) {
  return (
    <AdUnit
      slot=""
      format="auto"
      layout="in-article"
      className={className}
      style={{ margin: "24px 0" }}
    />
  );
}
