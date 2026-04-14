/**
 * HPFAd — Banner pubblicitari HighPerformanceFormat
 *
 * Formati disponibili:
 *   sidebar-tall   → 160×600  (skyscraper laterale)
 *   square         → 300×250  (rettangolo medio, manchette)
 *   mobile-banner  → 320×50   (banner mobile)
 *   banner         → 468×60   (banner standard)
 *   leaderboard    → 728×90   (leaderboard)
 *   native         → native ads (profitablecpmratenetwork)
 */
import { useEffect, useId, useRef } from "react";

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
}

export default function HPFAd({ format, className = "" }: HPFAdProps) {
  const config = AD_CONFIGS[format];
  const uid = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Pulisce il container prima di iniettare nuovi script
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    if (format === "native") {
      const script = document.createElement("script");
      script.async = true;
      script.setAttribute("data-cfasync", "false");
      script.src = config.src;
      container.appendChild(script);
      return;
    }

    // Imposta atOptions con chiave univoca per questa istanza
    const scriptOptions = document.createElement("script");
    scriptOptions.type = "text/javascript";
    scriptOptions.text = `
      window['atOptions_${uid}'] = {
        'key': '${config.key}',
        'format': 'iframe',
        'height': ${config.height},
        'width': ${config.width},
        'params': {}
      };
      atOptions = window['atOptions_${uid}'];
    `;
    container.appendChild(scriptOptions);

    const scriptInvoke = document.createElement("script");
    scriptInvoke.type = "text/javascript";
    scriptInvoke.src = config.src;
    container.appendChild(scriptInvoke);

    return () => {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, [format, uid]);

  if (format === "native") {
    return (
      <div
        ref={containerRef}
        id={`container-${config.key}-${uid}`}
        className={className}
        style={{ minHeight: "100px", width: "100%" }}
      />
    );
  }

  return (
    <div
      className={`flex flex-col items-center ${className}`}
      style={{ width: config.width, minHeight: config.height }}
    >
      <div
        ref={containerRef}
        style={{ width: config.width, minHeight: config.height, overflow: "hidden" }}
      />
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

// ─── Shorthand exports ────────────────────────────────────────────────────────

export function HPFSidebarTall({ className = "" }: { className?: string }) {
  return <HPFAd format="sidebar-tall" className={className} />;
}

export function HPFSquare({ className = "" }: { className?: string }) {
  return <HPFAd format="square" className={className} />;
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
