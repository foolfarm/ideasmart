/**
 * AdUnit — Componente riutilizzabile per Google AdSense
 *
 * Ogni componente è definito come funzione esplicita e nominata
 * per evitare problemi di cache con Vite HMR.
 *
 * Publisher ID: ca-pub-7185482526978993
 * Slot attivi:
 *   8723745625  → "ideasmart"   banner orizzontale   → Top e Bottom
 *   8948908650  → "ideasmart1"  banner in-content     → Mid1
 *   3313438599  → "Ideasmart"   banner in-content     → Mid2
 */

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

// ─── Publisher ID ──────────────────────────────────────────────────────────────
const CLIENT_ID = "ca-pub-7185482526978993";

// ─── Slot IDs ─────────────────────────────────────────────────────────────────
export const AD_SLOTS = {
  HOME_BANNER:     "8723745625",
  AI_TOP:          "8723745625",
  AI_MID1:         "8948908650",
  AI_MID2:         "3313438599",
  AI_BOTTOM:       "8723745625",
  MUSIC_TOP:       "8723745625",
  MUSIC_MID1:      "8948908650",
  MUSIC_MID2:      "3313438599",
  MUSIC_BOTTOM:    "8723745625",
  STARTUP_TOP:     "8723745625",
  STARTUP_MID1:    "8948908650",
  STARTUP_MID2:    "3313438599",
  STARTUP_BOTTOM:  "8723745625",
  FINANCE_TOP:     "8723745625",
  FINANCE_MID1:    "8948908650",
  FINANCE_MID2:    "3313438599",
  FINANCE_BOTTOM:  "8723745625",
  HEALTH_TOP:      "8723745625",
  HEALTH_MID1:     "8948908650",
  HEALTH_MID2:     "3313438599",
  HEALTH_BOTTOM:   "8723745625",
  SPORT_TOP:       "8723745625",
  SPORT_MID1:      "8948908650",
  SPORT_MID2:      "3313438599",
  SPORT_BOTTOM:    "8723745625",
  LUXURY_TOP:      "8723745625",
  LUXURY_MID1:     "8948908650",
  LUXURY_MID2:     "3313438599",
  LUXURY_BOTTOM:   "8723745625",
  NEWS_TOP:        "8723745625",
  NEWS_MID1:       "8948908650",
  NEWS_MID2:       "3313438599",
  NEWS_BOTTOM:     "8723745625",
  MOTORI_TOP:      "8723745625",
  MOTORI_MID1:     "8948908650",
  MOTORI_MID2:     "3313438599",
  MOTORI_BOTTOM:   "8723745625",
  TENNIS_TOP:      "8723745625",
  TENNIS_MID1:     "8948908650",
  TENNIS_MID2:     "3313438599",
  TENNIS_BOTTOM:   "8723745625",
  BASKET_TOP:      "8723745625",
  BASKET_MID1:     "8948908650",
  BASKET_MID2:     "3313438599",
  BASKET_BOTTOM:   "8723745625",
  GOSSIP_TOP:      "8723745625",
  GOSSIP_MID1:     "8948908650",
  GOSSIP_MID2:     "3313438599",
  GOSSIP_BOTTOM:   "8723745625",
  CYBER_TOP:       "8723745625",
  CYBER_MID1:      "8948908650",
  CYBER_MID2:      "3313438599",
  CYBER_BOTTOM:    "8723745625",
  SONDAGGI_TOP:    "8723745625",
  SONDAGGI_MID1:   "8948908650",
  SONDAGGI_MID2:   "3313438599",
  SONDAGGI_BOTTOM: "8723745625",
} as const;

// ─── Tipi ──────────────────────────────────────────────────────────────────────
type AdFormat = "auto" | "rectangle" | "horizontal" | "vertical" | "fluid";

interface AdUnitProps {
  slot?: string;
  format?: AdFormat;
  className?: string;
  layout?: string;
  style?: React.CSSProperties;
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
      style={{ textAlign: "center", overflow: "hidden", ...style }}
    >
      {label && (
        <p style={{ fontSize: "10px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px", fontFamily: "sans-serif" }}>
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

// ─── Homepage Hub ──────────────────────────────────────────────────────────────
export function AdHomeBanner({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.HOME_BANNER} format="auto" className={className} style={{ margin: "32px auto", maxWidth: "970px" }} />;
}

// ─── AI4Business ──────────────────────────────────────────────────────────────
export function AdAiTop({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.AI_TOP} format="horizontal" className={className} style={{ margin: "16px auto", maxWidth: "970px" }} />;
}
export function AdAiMid1({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.AI_MID1} format="auto" layout="in-article" className={className} style={{ margin: "24px 0" }} />;
}
export function AdAiMid2({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.AI_MID2} format="auto" layout="in-article" className={className} style={{ margin: "24px 0" }} />;
}
export function AdAiBottom({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.AI_BOTTOM} format="horizontal" className={className} style={{ margin: "32px auto", maxWidth: "970px" }} />;
}

// ─── ITsMusic ─────────────────────────────────────────────────────────────────
export function AdMusicTop({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.MUSIC_TOP} format="horizontal" className={className} style={{ margin: "16px auto", maxWidth: "970px" }} />;
}
export function AdMusicMid1({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.MUSIC_MID1} format="auto" layout="in-article" className={className} style={{ margin: "24px 0" }} />;
}
export function AdMusicMid2({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.MUSIC_MID2} format="auto" layout="in-article" className={className} style={{ margin: "24px 0" }} />;
}
export function AdMusicBottom({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.MUSIC_BOTTOM} format="horizontal" className={className} style={{ margin: "32px auto", maxWidth: "970px" }} />;
}

// ─── Startup News ─────────────────────────────────────────────────────────────
export function AdStartupTop({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.STARTUP_TOP} format="horizontal" className={className} style={{ margin: "16px auto", maxWidth: "970px" }} />;
}
export function AdStartupMid1({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.STARTUP_MID1} format="auto" layout="in-article" className={className} style={{ margin: "24px 0" }} />;
}
export function AdStartupMid2({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.STARTUP_MID2} format="auto" layout="in-article" className={className} style={{ margin: "24px 0" }} />;
}
export function AdStartupBottom({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.STARTUP_BOTTOM} format="horizontal" className={className} style={{ margin: "32px auto", maxWidth: "970px" }} />;
}

// ─── Finance & Markets ────────────────────────────────────────────────────────
export function AdFinanceTop({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.FINANCE_TOP} format="horizontal" className={className} style={{ margin: "16px auto", maxWidth: "970px" }} />;
}
export function AdFinanceMid1({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.FINANCE_MID1} format="auto" layout="in-article" className={className} style={{ margin: "24px 0" }} />;
}
export function AdFinanceMid2({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.FINANCE_MID2} format="auto" layout="in-article" className={className} style={{ margin: "24px 0" }} />;
}
export function AdFinanceBottom({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.FINANCE_BOTTOM} format="horizontal" className={className} style={{ margin: "32px auto", maxWidth: "970px" }} />;
}

// ─── Health & Biotech ─────────────────────────────────────────────────────────
export function AdHealthTop({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.HEALTH_TOP} format="horizontal" className={className} style={{ margin: "16px auto", maxWidth: "970px" }} />;
}
export function AdHealthMid1({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.HEALTH_MID1} format="auto" layout="in-article" className={className} style={{ margin: "24px 0" }} />;
}
export function AdHealthMid2({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.HEALTH_MID2} format="auto" layout="in-article" className={className} style={{ margin: "24px 0" }} />;
}
export function AdHealthBottom({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.HEALTH_BOTTOM} format="horizontal" className={className} style={{ margin: "32px auto", maxWidth: "970px" }} />;
}

// ─── Sport & Business ─────────────────────────────────────────────────────────
export function AdSportTop({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.SPORT_TOP} format="horizontal" className={className} style={{ margin: "16px auto", maxWidth: "970px" }} />;
}
export function AdSportMid1({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.SPORT_MID1} format="auto" layout="in-article" className={className} style={{ margin: "24px 0" }} />;
}
export function AdSportMid2({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.SPORT_MID2} format="auto" layout="in-article" className={className} style={{ margin: "24px 0" }} />;
}
export function AdSportBottom({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.SPORT_BOTTOM} format="horizontal" className={className} style={{ margin: "32px auto", maxWidth: "970px" }} />;
}

// ─── Lifestyle & Luxury ───────────────────────────────────────────────────────
export function AdLuxuryTop({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.LUXURY_TOP} format="horizontal" className={className} style={{ margin: "16px auto", maxWidth: "970px" }} />;
}
export function AdLuxuryMid1({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.LUXURY_MID1} format="auto" layout="in-article" className={className} style={{ margin: "24px 0" }} />;
}
export function AdLuxuryMid2({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.LUXURY_MID2} format="auto" layout="in-article" className={className} style={{ margin: "24px 0" }} />;
}
export function AdLuxuryBottom({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.LUXURY_BOTTOM} format="horizontal" className={className} style={{ margin: "32px auto", maxWidth: "970px" }} />;
}

// ─── News Generali ────────────────────────────────────────────────────────────
export function AdNewsTop({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.NEWS_TOP} format="horizontal" className={className} style={{ margin: "16px auto", maxWidth: "970px" }} />;
}
export function AdNewsMid1({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.NEWS_MID1} format="auto" layout="in-article" className={className} style={{ margin: "24px 0" }} />;
}
export function AdNewsMid2({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.NEWS_MID2} format="auto" layout="in-article" className={className} style={{ margin: "24px 0" }} />;
}
export function AdNewsBottom({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.NEWS_BOTTOM} format="horizontal" className={className} style={{ margin: "32px auto", maxWidth: "970px" }} />;
}

// ─── Motori ───────────────────────────────────────────────────────────────────
export function AdMotoriTop({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.MOTORI_TOP} format="horizontal" className={className} style={{ margin: "16px auto", maxWidth: "970px" }} />;
}
export function AdMotoriMid1({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.MOTORI_MID1} format="auto" layout="in-article" className={className} style={{ margin: "24px 0" }} />;
}
export function AdMotoriMid2({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.MOTORI_MID2} format="auto" layout="in-article" className={className} style={{ margin: "24px 0" }} />;
}
export function AdMotoriBottom({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.MOTORI_BOTTOM} format="horizontal" className={className} style={{ margin: "32px auto", maxWidth: "970px" }} />;
}

// ─── Tennis ───────────────────────────────────────────────────────────────────
export function AdTennisTop({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.TENNIS_TOP} format="horizontal" className={className} style={{ margin: "16px auto", maxWidth: "970px" }} />;
}
export function AdTennisMid1({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.TENNIS_MID1} format="auto" layout="in-article" className={className} style={{ margin: "24px 0" }} />;
}
export function AdTennisMid2({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.TENNIS_MID2} format="auto" layout="in-article" className={className} style={{ margin: "24px 0" }} />;
}
export function AdTennisBottom({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.TENNIS_BOTTOM} format="horizontal" className={className} style={{ margin: "32px auto", maxWidth: "970px" }} />;
}

// ─── Basket ───────────────────────────────────────────────────────────────────
export function AdBasketTop({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.BASKET_TOP} format="horizontal" className={className} style={{ margin: "16px auto", maxWidth: "970px" }} />;
}
export function AdBasketMid1({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.BASKET_MID1} format="auto" layout="in-article" className={className} style={{ margin: "24px 0" }} />;
}
export function AdBasketMid2({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.BASKET_MID2} format="auto" layout="in-article" className={className} style={{ margin: "24px 0" }} />;
}
export function AdBasketBottom({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.BASKET_BOTTOM} format="horizontal" className={className} style={{ margin: "32px auto", maxWidth: "970px" }} />;
}

// ─── Business Gossip ─────────────────────────────────────────────────────────
export function AdGossipTop({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.GOSSIP_TOP} format="horizontal" className={className} style={{ margin: "16px auto", maxWidth: "970px" }} />;
}
export function AdGossipMid1({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.GOSSIP_MID1} format="auto" layout="in-article" className={className} style={{ margin: "24px 0" }} />;
}
export function AdGossipMid2({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.GOSSIP_MID2} format="auto" layout="in-article" className={className} style={{ margin: "24px 0" }} />;
}
export function AdGossipBottom({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.GOSSIP_BOTTOM} format="horizontal" className={className} style={{ margin: "32px auto", maxWidth: "970px" }} />;
}

// ─── Cybersecurity ────────────────────────────────────────────────────────────
export function AdCyberTop({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.CYBER_TOP} format="horizontal" className={className} style={{ margin: "16px auto", maxWidth: "970px" }} />;
}
export function AdCyberMid1({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.CYBER_MID1} format="auto" layout="in-article" className={className} style={{ margin: "24px 0" }} />;
}
export function AdCyberMid2({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.CYBER_MID2} format="auto" layout="in-article" className={className} style={{ margin: "24px 0" }} />;
}
export function AdCyberBottom({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.CYBER_BOTTOM} format="horizontal" className={className} style={{ margin: "32px auto", maxWidth: "970px" }} />;
}

// ─── Sondaggi ─────────────────────────────────────────────────────────────────
export function AdSondaggiTop({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.SONDAGGI_TOP} format="horizontal" className={className} style={{ margin: "16px auto", maxWidth: "970px" }} />;
}
export function AdSondaggiMid1({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.SONDAGGI_MID1} format="auto" layout="in-article" className={className} style={{ margin: "24px 0" }} />;
}
export function AdSondaggiMid2({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.SONDAGGI_MID2} format="auto" layout="in-article" className={className} style={{ margin: "24px 0" }} />;
}
export function AdSondaggiBottom({ className = "" }: { className?: string }) {
  return <AdUnit slot={AD_SLOTS.SONDAGGI_BOTTOM} format="horizontal" className={className} style={{ margin: "32px auto", maxWidth: "970px" }} />;
}

// ─── Componenti generici @deprecated ──────────────────────────────────────────
/** @deprecated Usare i componenti nominati sopra */
export function AdBannerHorizontal({ className = "" }: { className?: string }) {
  return <AdUnit slot="" format="auto" className={className} style={{ margin: "32px auto", maxWidth: "970px" }} />;
}

/** @deprecated Usare i componenti nominati sopra */
export function AdBannerRectangle({ className = "" }: { className?: string }) {
  return <AdUnit slot="" format="auto" className={className} style={{ margin: "16px auto", maxWidth: "336px" }} />;
}

/** @deprecated Usare i componenti nominati sopra */
export function AdBannerInFeed({ className = "" }: { className?: string }) {
  return <AdUnit slot="" format="auto" layout="in-article" className={className} style={{ margin: "24px 0" }} />;
}
