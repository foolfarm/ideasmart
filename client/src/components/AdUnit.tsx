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
 * Unità da creare su AdSense (una per ogni riga):
 *   HOME_BANNER          → Homepage Hub — Banner orizzontale tra notizie e Chi siamo
 *   AI_TOP               → AI4Business — Banner top (sotto hero)
 *   AI_MID1              → AI4Business — Banner mid 1 (tra notizie)
 *   AI_MID2              → AI4Business — Banner mid 2 (tra notizie)
 *   AI_BOTTOM            → AI4Business — Banner bottom (prima del footer)
 *   MUSIC_TOP            → ITsMusic — Banner top
 *   MUSIC_MID1           → ITsMusic — Banner mid 1
 *   MUSIC_MID2           → ITsMusic — Banner mid 2
 *   MUSIC_BOTTOM         → ITsMusic — Banner bottom
 *   STARTUP_TOP          → Startup News — Banner top
 *   STARTUP_MID1         → Startup News — Banner mid 1
 *   STARTUP_MID2         → Startup News — Banner mid 2
 *   STARTUP_BOTTOM       → Startup News — Banner bottom
 *   FINANCE_TOP          → Finance & Markets — Banner top
 *   FINANCE_MID1         → Finance & Markets — Banner mid 1
 *   FINANCE_MID2         → Finance & Markets — Banner mid 2
 *   FINANCE_BOTTOM       → Finance & Markets — Banner bottom
 *   HEALTH_TOP           → Health & Biotech — Banner top
 *   HEALTH_MID1          → Health & Biotech — Banner mid 1
 *   HEALTH_MID2          → Health & Biotech — Banner mid 2
 *   HEALTH_BOTTOM        → Health & Biotech — Banner bottom
 *   SPORT_TOP            → Sport & Business — Banner top
 *   SPORT_MID1           → Sport & Business — Banner mid 1
 *   SPORT_MID2           → Sport & Business — Banner mid 2
 *   SPORT_BOTTOM         → Sport & Business — Banner bottom
 *   LUXURY_TOP           → Lifestyle & Luxury — Banner top
 *   LUXURY_MID1          → Lifestyle & Luxury — Banner mid 1
 *   LUXURY_MID2          → Lifestyle & Luxury — Banner mid 2
 *   LUXURY_BOTTOM        → Lifestyle & Luxury — Banner bottom
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
// Tre slot attivi in rotazione per posizionamento:
//   8723745625  → "ideasmart"   banner orizzontale   → Top e Bottom
//   8948908650  → "ideasmart1"  banner in-content     → Mid1
//   3313438599  → "Ideasmart"   banner in-content     → Mid2
export const AD_SLOTS = {
  // Homepage Hub
  HOME_BANNER:     "8723745625",  // orizzontale

  // Sezione AI4Business
  AI_TOP:          "8723745625",  // orizzontale
  AI_MID1:         "8948908650",  // in-content 1
  AI_MID2:         "3313438599",  // in-content 2
  AI_BOTTOM:       "8723745625",  // orizzontale

  // Sezione ITsMusic
  MUSIC_TOP:       "8723745625",
  MUSIC_MID1:      "8948908650",
  MUSIC_MID2:      "3313438599",
  MUSIC_BOTTOM:    "8723745625",

  // Sezione Startup News
  STARTUP_TOP:     "8723745625",
  STARTUP_MID1:    "8948908650",
  STARTUP_MID2:    "3313438599",
  STARTUP_BOTTOM:  "8723745625",

  // Sezione Finance & Markets
  FINANCE_TOP:     "8723745625",
  FINANCE_MID1:    "8948908650",
  FINANCE_MID2:    "3313438599",
  FINANCE_BOTTOM:  "8723745625",

  // Sezione Health & Biotech
  HEALTH_TOP:      "8723745625",
  HEALTH_MID1:     "8948908650",
  HEALTH_MID2:     "3313438599",
  HEALTH_BOTTOM:   "8723745625",

  // Sezione Sport & Business
  SPORT_TOP:       "8723745625",
  SPORT_MID1:      "8948908650",
  SPORT_MID2:      "3313438599",
  SPORT_BOTTOM:    "8723745625",

  // Sezione Lifestyle & Luxury
  LUXURY_TOP:      "8723745625",
  LUXURY_MID1:     "8948908650",
  LUXURY_MID2:     "3313438599",
  LUXURY_BOTTOM:   "8723745625",

  // Sezione News Generali
  NEWS_TOP:        "8723745625",
  NEWS_MID1:       "8948908650",
  NEWS_MID2:       "3313438599",
  NEWS_BOTTOM:     "8723745625",

  // Sezione Motori
  MOTORI_TOP:      "8723745625",
  MOTORI_MID1:     "8948908650",
  MOTORI_MID2:     "3313438599",
  MOTORI_BOTTOM:   "8723745625",

  // Sezione Tennis
  TENNIS_TOP:      "8723745625",
  TENNIS_MID1:     "8948908650",
  TENNIS_MID2:     "3313438599",
  TENNIS_BOTTOM:   "8723745625",

  // Sezione Basket
  BASKET_TOP:      "8723745625",
  BASKET_MID1:     "8948908650",
  BASKET_MID2:     "3313438599",
  BASKET_BOTTOM:   "8723745625",
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

// ─── Helper per creare i 4 banner di un canale ─────────────────────────────────
function makeChannelAds(
  topSlot: string,
  mid1Slot: string,
  mid2Slot: string,
  bottomSlot: string,
  margin = "16px auto"
) {
  const Top = ({ className = "" }: { className?: string }) => (
    <AdUnit slot={topSlot} format="horizontal" className={className}
      style={{ margin, maxWidth: "970px" }} />
  );
  const Mid1 = ({ className = "" }: { className?: string }) => (
    <AdUnit slot={mid1Slot} format="auto" layout="in-article" className={className}
      style={{ margin: "24px 0" }} />
  );
  const Mid2 = ({ className = "" }: { className?: string }) => (
    <AdUnit slot={mid2Slot} format="auto" layout="in-article" className={className}
      style={{ margin: "24px 0" }} />
  );
  const Bottom = ({ className = "" }: { className?: string }) => (
    <AdUnit slot={bottomSlot} format="horizontal" className={className}
      style={{ margin: "32px auto", maxWidth: "970px" }} />
  );
  return { Top, Mid1, Mid2, Bottom };
}

// ─── Homepage Hub ──────────────────────────────────────────────────────────────
export function AdHomeBanner({ className = "" }: { className?: string }) {
  return (
    <AdUnit slot={AD_SLOTS.HOME_BANNER} format="auto" className={className}
      style={{ margin: "32px auto", maxWidth: "970px" }} />
  );
}

// ─── AI4Business ──────────────────────────────────────────────────────────────
const _ai = makeChannelAds(AD_SLOTS.AI_TOP, AD_SLOTS.AI_MID1, AD_SLOTS.AI_MID2, AD_SLOTS.AI_BOTTOM);
export const AdAiTop    = _ai.Top;
export const AdAiMid1   = _ai.Mid1;
export const AdAiMid2   = _ai.Mid2;
export const AdAiBottom = _ai.Bottom;

// ─── ITsMusic ─────────────────────────────────────────────────────────────────
const _music = makeChannelAds(AD_SLOTS.MUSIC_TOP, AD_SLOTS.MUSIC_MID1, AD_SLOTS.MUSIC_MID2, AD_SLOTS.MUSIC_BOTTOM);
export const AdMusicTop    = _music.Top;
export const AdMusicMid1   = _music.Mid1;
export const AdMusicMid2   = _music.Mid2;
export const AdMusicBottom = _music.Bottom;

// ─── Startup News ─────────────────────────────────────────────────────────────
const _startup = makeChannelAds(AD_SLOTS.STARTUP_TOP, AD_SLOTS.STARTUP_MID1, AD_SLOTS.STARTUP_MID2, AD_SLOTS.STARTUP_BOTTOM);
export const AdStartupTop    = _startup.Top;
export const AdStartupMid1   = _startup.Mid1;
export const AdStartupMid2   = _startup.Mid2;
export const AdStartupBottom = _startup.Bottom;

// ─── Finance & Markets ────────────────────────────────────────────────────────
const _finance = makeChannelAds(AD_SLOTS.FINANCE_TOP, AD_SLOTS.FINANCE_MID1, AD_SLOTS.FINANCE_MID2, AD_SLOTS.FINANCE_BOTTOM);
export const AdFinanceTop    = _finance.Top;
export const AdFinanceMid1   = _finance.Mid1;
export const AdFinanceMid2   = _finance.Mid2;
export const AdFinanceBottom = _finance.Bottom;

// ─── Health & Biotech ─────────────────────────────────────────────────────────
const _health = makeChannelAds(AD_SLOTS.HEALTH_TOP, AD_SLOTS.HEALTH_MID1, AD_SLOTS.HEALTH_MID2, AD_SLOTS.HEALTH_BOTTOM);
export const AdHealthTop    = _health.Top;
export const AdHealthMid1   = _health.Mid1;
export const AdHealthMid2   = _health.Mid2;
export const AdHealthBottom = _health.Bottom;

// ─── Sport & Business ─────────────────────────────────────────────────────────
const _sport = makeChannelAds(AD_SLOTS.SPORT_TOP, AD_SLOTS.SPORT_MID1, AD_SLOTS.SPORT_MID2, AD_SLOTS.SPORT_BOTTOM);
export const AdSportTop    = _sport.Top;
export const AdSportMid1   = _sport.Mid1;
export const AdSportMid2   = _sport.Mid2;
export const AdSportBottom = _sport.Bottom;

// ─── Lifestyle & Luxury ───────────────────────────────────────────────────────
const _luxury = makeChannelAds(AD_SLOTS.LUXURY_TOP, AD_SLOTS.LUXURY_MID1, AD_SLOTS.LUXURY_MID2, AD_SLOTS.LUXURY_BOTTOM);
export const AdLuxuryTop    = _luxury.Top;
export const AdLuxuryMid1   = _luxury.Mid1;
export const AdLuxuryMid2   = _luxury.Mid2;
export const AdLuxuryBottom = _luxury.Bottom;

// ─── News Generali ────────────────────────────────────────────────────────────
const _news = makeChannelAds(AD_SLOTS.NEWS_TOP, AD_SLOTS.NEWS_MID1, AD_SLOTS.NEWS_MID2, AD_SLOTS.NEWS_BOTTOM);
export const AdNewsTop    = _news.Top;
export const AdNewsMid1   = _news.Mid1;
export const AdNewsMid2   = _news.Mid2;
export const AdNewsBottom = _news.Bottom;

// ─── Motori ───────────────────────────────────────────────────────────────────
const _motori = makeChannelAds(AD_SLOTS.MOTORI_TOP, AD_SLOTS.MOTORI_MID1, AD_SLOTS.MOTORI_MID2, AD_SLOTS.MOTORI_BOTTOM);
export const AdMotoriTop    = _motori.Top;
export const AdMotoriMid1   = _motori.Mid1;
export const AdMotoriMid2   = _motori.Mid2;
export const AdMotoriBottom = _motori.Bottom;

// ─── Tennis ───────────────────────────────────────────────────────────────────
const _tennis = makeChannelAds(AD_SLOTS.TENNIS_TOP, AD_SLOTS.TENNIS_MID1, AD_SLOTS.TENNIS_MID2, AD_SLOTS.TENNIS_BOTTOM);
export const AdTennisTop    = _tennis.Top;
export const AdTennisMid1   = _tennis.Mid1;
export const AdTennisMid2   = _tennis.Mid2;
export const AdTennisBottom = _tennis.Bottom;

// ─── Basket ───────────────────────────────────────────────────────────────────
const _basket = makeChannelAds(AD_SLOTS.BASKET_TOP, AD_SLOTS.BASKET_MID1, AD_SLOTS.BASKET_MID2, AD_SLOTS.BASKET_BOTTOM);
export const AdBasketTop    = _basket.Top;
export const AdBasketMid1   = _basket.Mid1;
export const AdBasketMid2   = _basket.Mid2;
export const AdBasketBottom = _basket.Bottom;

// ─── Componenti generici @deprecated ──────────────────────────────────────────
/** @deprecated Usare i componenti nominati sopra */
export function AdBannerHorizontal({ className = "" }: { className?: string }) {
  return <AdUnit slot="" format="auto" className={className}
    style={{ margin: "32px auto", maxWidth: "970px" }} />;
}

/** @deprecated Usare i componenti nominati sopra */
export function AdBannerRectangle({ className = "" }: { className?: string }) {
  return <AdUnit slot="" format="auto" className={className}
    style={{ margin: "16px auto", maxWidth: "336px" }} />;
}

/** @deprecated Usare i componenti nominati sopra */
export function AdBannerInFeed({ className = "" }: { className?: string }) {
  return <AdUnit slot="" format="auto" layout="in-article" className={className}
    style={{ margin: "24px 0" }} />;
}
