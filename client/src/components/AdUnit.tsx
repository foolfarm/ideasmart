/**
 * AdUnit — Componente riutilizzabile per Google AdSense
 *
 * Mostra sempre l'annuncio: Google AdSense gestisce autonomamente
 * il consenso GDPR tramite il proprio TCF (Transparency & Consent Framework).
 * Non è necessario bloccare il caricamento lato client.
 *
 * ─── COME CONFIGURARE GLI SLOT ADSENSE ────────────────────────────────────
 * 1. Vai su https://adsense.google.com → Annunci → Per unità
 * 2. Crea le unità pubblicitarie con i nomi indicati sotto
 * 3. Copia lo Slot ID (numero a 10 cifre, es. "1234567890")
 * 4. Sostituisci i placeholder SLOT_* con gli ID reali
 *
 * Unità da creare su AdSense:
 *   SLOT_HOME_BANNER        → Homepage Hub — Banner orizzontale tra notizie e Chi siamo
 *   SLOT_AI_TOP             → AI4Business — Banner top (sotto hero)
 *   SLOT_AI_MID1            → AI4Business — Banner mid 1 (tra notizie)
 *   SLOT_AI_MID2            → AI4Business — Banner mid 2 (tra notizie)
 *   SLOT_AI_BOTTOM          → AI4Business — Banner bottom (prima del footer)
 *   SLOT_MUSIC_TOP          → ITsMusic — Banner top (sotto hero)
 *   SLOT_MUSIC_MID1         → ITsMusic — Banner mid 1 (tra notizie)
 *   SLOT_MUSIC_MID2         → ITsMusic — Banner mid 2 (tra notizie)
 *   SLOT_MUSIC_BOTTOM       → ITsMusic — Banner bottom (prima del footer)
 * ──────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

// ─── Publisher ID ──────────────────────────────────────────────────────────────
const CLIENT_ID = "ca-pub-7185482526978993";

// ─── Slot ID Placeholder ───────────────────────────────────────────────────────
// Sostituire con gli ID reali ottenuti dal pannello Google AdSense
// Formato: stringa numerica a 10 cifre, es. "1234567890"
export const AD_SLOTS = {
  // Homepage Hub
  HOME_BANNER:   "", // TODO: inserire Slot ID "IDEASMART — Home Banner"

  // Sezione AI4Business
  AI_TOP:        "", // TODO: inserire Slot ID "AI4Business — Top Banner"
  AI_MID1:       "", // TODO: inserire Slot ID "AI4Business — Mid Banner 1"
  AI_MID2:       "", // TODO: inserire Slot ID "AI4Business — Mid Banner 2"
  AI_BOTTOM:     "", // TODO: inserire Slot ID "AI4Business — Bottom Banner"

  // Sezione ITsMusic
  MUSIC_TOP:     "", // TODO: inserire Slot ID "ITsMusic — Top Banner"
  MUSIC_MID1:    "", // TODO: inserire Slot ID "ITsMusic — Mid Banner 1"
  MUSIC_MID2:    "", // TODO: inserire Slot ID "ITsMusic — Mid Banner 2"
  MUSIC_BOTTOM:  "", // TODO: inserire Slot ID "ITsMusic — Bottom Banner"
} as const;

// ─── Tipi ──────────────────────────────────────────────────────────────────────
type AdFormat = "auto" | "rectangle" | "horizontal" | "vertical" | "fluid";

interface AdUnitProps {
  /** Slot ID dell'unità pubblicitaria AdSense — usa AD_SLOTS.* per i valori configurati */
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

// ─── Componente base ───────────────────────────────────────────────────────────
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

// ─── Banner preconfigurati per posizione ───────────────────────────────────────

/**
 * Homepage Hub — Banner orizzontale tra notizie e Chi siamo
 */
export function AdHomeBanner({ className = "" }: { className?: string }) {
  return (
    <AdUnit
      slot={AD_SLOTS.HOME_BANNER}
      format="auto"
      className={className}
      style={{ margin: "32px auto", maxWidth: "970px" }}
    />
  );
}

/**
 * AI4Business — Banner top (sotto hero)
 */
export function AdAiTop({ className = "" }: { className?: string }) {
  return (
    <AdUnit
      slot={AD_SLOTS.AI_TOP}
      format="horizontal"
      className={className}
      style={{ margin: "16px auto", maxWidth: "970px" }}
    />
  );
}

/**
 * AI4Business — Banner mid 1 (tra notizie)
 */
export function AdAiMid1({ className = "" }: { className?: string }) {
  return (
    <AdUnit
      slot={AD_SLOTS.AI_MID1}
      format="auto"
      layout="in-article"
      className={className}
      style={{ margin: "24px 0" }}
    />
  );
}

/**
 * AI4Business — Banner mid 2 (tra notizie)
 */
export function AdAiMid2({ className = "" }: { className?: string }) {
  return (
    <AdUnit
      slot={AD_SLOTS.AI_MID2}
      format="auto"
      layout="in-article"
      className={className}
      style={{ margin: "24px 0" }}
    />
  );
}

/**
 * AI4Business — Banner bottom (prima del footer)
 */
export function AdAiBottom({ className = "" }: { className?: string }) {
  return (
    <AdUnit
      slot={AD_SLOTS.AI_BOTTOM}
      format="horizontal"
      className={className}
      style={{ margin: "32px auto", maxWidth: "970px" }}
    />
  );
}

/**
 * ITsMusic — Banner top (sotto hero)
 */
export function AdMusicTop({ className = "" }: { className?: string }) {
  return (
    <AdUnit
      slot={AD_SLOTS.MUSIC_TOP}
      format="horizontal"
      className={className}
      style={{ margin: "16px auto", maxWidth: "970px" }}
    />
  );
}

/**
 * ITsMusic — Banner mid 1 (tra notizie)
 */
export function AdMusicMid1({ className = "" }: { className?: string }) {
  return (
    <AdUnit
      slot={AD_SLOTS.MUSIC_MID1}
      format="auto"
      layout="in-article"
      className={className}
      style={{ margin: "24px 0" }}
    />
  );
}

/**
 * ITsMusic — Banner mid 2 (tra notizie)
 */
export function AdMusicMid2({ className = "" }: { className?: string }) {
  return (
    <AdUnit
      slot={AD_SLOTS.MUSIC_MID2}
      format="auto"
      layout="in-article"
      className={className}
      style={{ margin: "24px 0" }}
    />
  );
}

/**
 * ITsMusic — Banner bottom (prima del footer)
 */
export function AdMusicBottom({ className = "" }: { className?: string }) {
  return (
    <AdUnit
      slot={AD_SLOTS.MUSIC_BOTTOM}
      format="horizontal"
      className={className}
      style={{ margin: "32px auto", maxWidth: "970px" }}
    />
  );
}

/**
 * @deprecated Usare i componenti nominati sopra (AdHomeBanner, AdAiTop, ecc.)
 * Banner orizzontale generico — ideale tra sezioni (728x90 o responsive)
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
 * @deprecated Usare i componenti nominati sopra
 * Banner rettangolare generico — ideale in sidebar o tra card (300x250)
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
 * @deprecated Usare i componenti nominati sopra
 * Banner in-feed generico — ideale tra articoli in lista
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
