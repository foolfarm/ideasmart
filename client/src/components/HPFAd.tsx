/**
 * HPFAd — Banner pubblicitari HighPerformanceFormat
 *
 * Usa iframe diretto per evitare conflitti tra istanze multiple sulla stessa pagina.
 *
 * Formati disponibili:
 *   sidebar-tall   → 160×600  (skyscraper laterale)
 *   square         → 300×250  (rettangolo medio, manchette)
 *   mobile-banner  → 320×50   (banner mobile)
 *   banner         → 468×60   (banner standard)
 *   leaderboard    → 728×90   (leaderboard)
 *   native         → native ads (profitablecpmratenetwork)
 */
import { useEffect, useRef } from "react";

type HPFAdFormat =
  | "sidebar-tall"
  | "square"
  | "mobile-banner"
  | "banner"
  | "leaderboard"
  | "native";

const AD_CONFIGS: Record<
  HPFAdFormat,
  { key: string; width: number; height: number; src: string }
> = {
  "sidebar-tall": {
    key: "83d11d05ab4b59e8d978167113abb83d",
    width: 160,
    height: 600,
    src: "https://www.highperformanceformat.com/83d11d05ab4b59e8d978167113abb83d/invoke.js",
  },
  square: {
    key: "c64b50ac24503ed12af462e86dd24174",
    width: 300,
    height: 250,
    src: "https://www.highperformanceformat.com/c64b50ac24503ed12af462e86dd24174/invoke.js",
  },
  "mobile-banner": {
    key: "f2d4a26222837df07a393dc7bf8481ac",
    width: 320,
    height: 50,
    src: "https://www.highperformanceformat.com/f2d4a26222837df07a393dc7bf8481ac/invoke.js",
  },
  banner: {
    key: "6891ab067d9b0d703e434ed6c4b084d4",
    width: 468,
    height: 60,
    src: "https://www.highperformanceformat.com/6891ab067d9b0d703e434ed6c4b084d4/invoke.js",
  },
  leaderboard: {
    key: "f052fd7895d578a0c7ec276a2905f040",
    width: 728,
    height: 90,
    src: "https://www.highperformanceformat.com/f052fd7895d578a0c7ec276a2905f040/invoke.js",
  },
  native: {
    key: "27ed91d4ee0c313a62fb977faa5fd775",
    width: 0,
    height: 0,
    src: "https://pl29152692.profitablecpmratenetwork.com/27ed91d4ee0c313a62fb977faa5fd775/invoke.js",
  },
};

interface HPFAdProps {
  format: HPFAdFormat;
  className?: string;
  /** Fattore di scala CSS (es. 0.53 porta 300x250 → ~160x133). Default: 1 */
  scale?: number;
}

export default function HPFAd({ format, className = "", scale = 1 }: HPFAdProps) {
  const config = AD_CONFIGS[format];
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const scaledW = Math.round(config.width * scale);
  const scaledH = Math.round(config.height * scale);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || format === "native") return;

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>body{margin:0;padding:0;overflow:hidden;}</style>
</head>
<body>
<script type="text/javascript">
  atOptions = {
    'key': '${config.key}',
    'format': 'iframe',
    'height': ${config.height},
    'width': ${config.width},
    'params': {}
  };
<\/script>
<script type="text/javascript" src="${config.src}"><\/script>
</body>
</html>`;

    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();
  }, [format, config.key, config.width, config.height, config.src]);

  if (format === "native") {
    return <NativeAd className={className} />;
  }

  return (
    <div
      className={`flex flex-col items-center ${className}`}
      style={{ width: scaledW, minHeight: scaledH + 14, overflow: 'hidden' }}
    >
      <div style={{
        width: config.width,
        height: config.height,
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top left',
        flexShrink: 0,
      }}>
        <iframe
          ref={iframeRef}
          width={config.width}
          height={config.height}
          frameBorder="0"
          scrolling="no"
          style={{ display: "block", border: "none" }}
          title={`ad-${config.key}`}
        />
      </div>
      <span
        style={{
          fontSize: "9px",
          letterSpacing: "0.08em",
          color: "#aeaeb2",
          textTransform: "uppercase",
          marginTop: "2px",
          fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        Pubblicità
      </span>
    </div>
  );
}

// ─── Native Ad (profitablecpmratenetwork) ────────────────────────────────────

function NativeAd({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const injected = useRef(false);

  useEffect(() => {
    if (injected.current || !containerRef.current) return;
    injected.current = true;

    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src =
      "https://pl29152692.profitablecpmratenetwork.com/27ed91d4ee0c313a62fb977faa5fd775/invoke.js";
    containerRef.current.appendChild(script);
  }, []);

  return (
    <div
      ref={containerRef}
      id="container-27ed91d4ee0c313a62fb977faa5fd775"
      className={className}
      style={{ minHeight: "100px", width: "100%" }}
    />
  );
}

// ─── Shorthand exports ────────────────────────────────────────────────────────

export function HPFSidebarTall({ className = "", scale }: { className?: string; scale?: number }) {
  return <HPFAd format="sidebar-tall" className={className} scale={scale} />;
}

export function HPFSquare({ className = "", scale }: { className?: string; scale?: number }) {
  return <HPFAd format="square" className={className} scale={scale} />;
}

export function HPFMobileBanner({ className = "" }: { className?: string }) {
  return <HPFAd format="mobile-banner" className={className} />;
}

export function HPFBanner({ className = "" }: { className?: string }) {
  return <HPFAd format="banner" className={className} />;
}

export function HPFLeaderboard({ className = "" }: { className?: string }) {
  return <HPFAd format="leaderboard" className={className} />;
}

export function HPFNative({ className = "" }: { className?: string }) {
  return <HPFAd format="native" className={className} />;
}
