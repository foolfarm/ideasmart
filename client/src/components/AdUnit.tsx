/**
 * AdUnit — Componente riutilizzabile per Google AdSense
 *
 * Rispetta il consenso cookie (CookieConsent) e mostra l'annuncio
 * solo se l'utente ha accettato i cookie pubblicitari.
 * Supporta diversi formati: banner orizzontale, rettangolo, in-feed.
 */

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

type AdFormat = "auto" | "rectangle" | "horizontal" | "vertical" | "fluid";

interface AdUnitProps {
  /** Slot ID dell'unità pubblicitaria AdSense */
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

/**
 * Controlla se l'utente ha accettato i cookie pubblicitari.
 * Legge la preferenza salvata da CookieBanner in localStorage.
 */
function hasAdConsent(): boolean {
  try {
    const stored = localStorage.getItem("cookie-consent");
    if (!stored) return false;
    const parsed = JSON.parse(stored);
    return parsed?.advertising === true;
  } catch {
    return false;
  }
}

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
    if (!hasAdConsent()) return;

    try {
      initialized.current = true;
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn("[AdUnit] adsbygoogle push error:", e);
    }
  }, []);

  // Se non c'è consenso, non renderizzare nulla
  if (!hasAdConsent()) return null;

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
      slot="7185482526978993"
      format="horizontal"
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
      slot="7185482526978993"
      format="rectangle"
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
      slot="7185482526978993"
      format="fluid"
      layout="in-article"
      className={className}
      style={{ margin: "24px 0" }}
    />
  );
}
