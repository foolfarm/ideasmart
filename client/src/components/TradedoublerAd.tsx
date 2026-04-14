/**
 * TradedoublerAd — Banner pubblicitario Tradedoubler
 * Usa document.write via iframe srcdoc per evitare conflitti con React
 * Il banner originale è 500x500; viene scalato a ~160x160 con CSS transform
 *
 * Varianti:
 *  - TradedoublerAdLeft  → g=26039696 (manchette sinistra)
 *  - TradedoublerAdRight → g=26092918 (manchette destra)
 */
import { useEffect, useRef } from "react";

interface TradedoublerAdProps {
  /** Larghezza visibile del contenitore (default 160) */
  displayWidth?: number;
  /** Altezza visibile del contenitore (default 160) */
  displayHeight?: number;
  className?: string;
  /** HTML del banner da iniettare nell'iframe */
  bannerHtml: string;
}

// Banner SINISTRA — g=26039696
export const TD_LEFT_HTML = `<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { overflow: hidden; background: transparent; }
  a img { display: block; border: 0; }
</style>
</head>
<body>
<script type="text/javascript">
var uri = 'https://imp.tradedoubler.com/imp?type(img)g(26039696)a(3477790)' + new String(Math.random()).substring(2, 11);
document.write('<a href="https://clk.tradedoubler.com/click?p=341133&a=3477790&g=26039696" target="_blank"><img src="'+uri+'" width="500" height="500" border="0"><\\/a>');
<\/script>
</body>
</html>`;

// Banner DESTRA — g=26092918
export const TD_RIGHT_HTML = `<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { overflow: hidden; background: transparent; }
  a img { display: block; border: 0; }
</style>
</head>
<body>
<script type="text/javascript">
var uri = 'https://imp.tradedoubler.com/imp?type(img)g(26092918)a(3477790)' + new String(Math.random()).substring(2, 11);
document.write('<a href="https://clk.tradedoubler.com/click?p=341133&a=3477790&g=26092918" target="_blank"><img src="'+uri+'" width="500" height="500" border="0"><\\/a>');
<\/script>
</body>
</html>`;

function TradedoublerAd({
  displayWidth = 160,
  displayHeight = 160,
  className = "",
  bannerHtml,
}: TradedoublerAdProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const scale = displayWidth / 500;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    iframe.srcdoc = bannerHtml;
  }, [bannerHtml]);

  return (
    <div
      className={className}
      style={{
        width: `${displayWidth}px`,
        height: `${displayHeight}px`,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <iframe
        ref={iframeRef}
        title="Tradedoubler Ad"
        scrolling="no"
        frameBorder="0"
        style={{
          width: "500px",
          height: "500px",
          border: "none",
          transformOrigin: "top left",
          transform: `scale(${scale})`,
          pointerEvents: "auto",
        }}
      />
      <p
        style={{
          textAlign: "center",
          fontSize: "9px",
          color: "rgba(26,26,26,0.35)",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginTop: "2px",
        }}
      >
        Pubblicità
      </p>
    </div>
  );
}

export default TradedoublerAd;

/** Shorthand manchette sinistra */
export function TradedoublerAdLeft(props: Omit<TradedoublerAdProps, "bannerHtml">) {
  return <TradedoublerAd {...props} bannerHtml={TD_LEFT_HTML} />;
}

/** Shorthand manchette destra */
export function TradedoublerAdRight(props: Omit<TradedoublerAdProps, "bannerHtml">) {
  return <TradedoublerAd {...props} bannerHtml={TD_RIGHT_HTML} />;
}
