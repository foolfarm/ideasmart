/**
 * ChannelsBar — Barra canali orizzontale sotto l'header
 * Sostituisce la sezione Canali della sidebar sinistra
 * Design: etichette compatte con icona + label, stile editoriale
 */
import { Link, useLocation } from "wouter";
import { Zap, BookOpen, Rocket, TrendingUp } from "lucide-react";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

const CHANNELS = [
  { label: "Breaking News", sublabel: "AI & Tech",      path: "/ai",       Icon: Zap        },
  { label: "Research",      sublabel: "Analisi & Dati", path: "/research", Icon: BookOpen   },
  { label: "Venture",       sublabel: "Startup",        path: "/startup",  Icon: Rocket     },
  { label: "Dealroom",      sublabel: "Investimenti",   path: "/dealroom", Icon: TrendingUp },
];

export default function ChannelsBar() {
  const [location] = useLocation();

  return (
    <div
      className="w-full border-t border-b border-[#e5e5ea]"
      style={{ background: "#fafafa" }}
    >
      <div className="max-w-[1280px] mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-0">

          {/* Label "CANALI" */}
          <span
            className="flex-shrink-0 text-[9px] font-black uppercase tracking-[0.22em] pr-3 mr-1"
            style={{
              fontFamily: SF,
              color: "rgba(26,26,26,0.35)",
              borderRight: "1px solid #e5e5ea",
            }}
          >
            Canali
          </span>

          {/* Etichette canali */}
          {CHANNELS.map(({ label, sublabel, path, Icon }) => {
            const active = location === path || location.startsWith(path + "/");
            return (
              <Link key={path} href={path}>
                <div
                  className="flex items-center gap-2 flex-shrink-0 px-3 py-2.5 cursor-pointer transition-all duration-150 relative"
                  style={{
                    borderBottom: active ? "2px solid #1a1a1a" : "2px solid transparent",
                    marginBottom: "-1px",
                  }}
                >
                  {/* Icona */}
                  <span
                    className="flex-shrink-0 flex items-center justify-center"
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      background: active ? "#1a1a1a" : "#ebebeb",
                      transition: "background 0.15s ease",
                    }}
                  >
                    <Icon
                      size={11}
                      strokeWidth={2}
                      color={active ? "#ffffff" : "#48484a"}
                    />
                  </span>

                  {/* Testo */}
                  <div className="flex flex-col">
                    <span
                      className="text-[11px] font-bold leading-tight"
                      style={{
                        fontFamily: SF,
                        color: active ? "#1a1a1a" : "#3a3a3c",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {label}
                    </span>
                    <span
                      className="text-[9px] leading-tight"
                      style={{
                        fontFamily: SF,
                        color: "#8e8e93",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {sublabel}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
