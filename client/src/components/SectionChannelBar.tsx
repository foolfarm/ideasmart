/**
 * SectionChannelBar — Menu navigazione canali stile "magazine toolbar"
 * Layout: icona + label per ogni canale, MORE dropdown, contatore lettori a destra
 * Ispirato al mockup con: START HERE · AI NEWS · COPY & PASTE AI · AUTOMATE ·
 *   MAKE MONEY · DAILY AI TOOLS · VERIFIED NEWS · AI OPPORTUNITIES · MORE · CHI S
 */
import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown } from "lucide-react";
import ReadersCounter from "./ReadersCounter";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

// ─── Canali principali visibili nella barra ───────────────────────────────────
const PRIMARY_CHANNELS = [
  { key: "start-here",  label: "START HERE",      path: "/start-here",          icon: "▷" },
  { key: "ai",          label: "AI NEWS",          path: "/ai",                  icon: "📡" },
  { key: "copy-paste",  label: "COPY & PASTE AI",  path: "/copy-paste-ai",       icon: "📋" },
  { key: "automate",    label: "AUTOMATE",         path: "/automate-with-ai",    icon: "⚡" },
  { key: "make-money",  label: "MAKE MONEY",       path: "/make-money-with-ai",  icon: "$" },
  { key: "tools",       label: "DAILY AI TOOLS",   path: "/daily-ai-tools",      icon: "🛠️" },
  { key: "verified",    label: "VERIFIED NEWS",    path: "/verified-ai-news",    icon: "🛡" },
  { key: "opps",        label: "AI OPPORTUNITIES", path: "/ai-opportunities",    icon: "📈" },
];

// ─── Canali nel dropdown MORE ─────────────────────────────────────────────────
const MORE_CHANNELS = [
  { key: "research",  label: "AI RESEARCH",    path: "/research",    desc: "Analisi e ricerche di mercato" },
  { key: "venture",   label: "AI VENTURE",     path: "/dealroom",    desc: "Deal, round e M&A" },
  { key: "invest",    label: "AI INVEST",      path: "/dealflow",    desc: "Opportunità di investimento" },
  { key: "startup",   label: "AI STARTUP NEWS",path: "/startup",     desc: "Startup da tenere d'occhio" },
  { key: "chi-siamo", label: "CHI SIAMO",      path: "/chi-siamo",   desc: "Il team e la missione" },
  { key: "verify",    label: "VERIFY",         path: "/verify",      desc: "Verifica autenticità articoli" },
];

export default function SectionChannelBar() {
  const [location] = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Chiudi dropdown al click fuori
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Chiudi al cambio route
  useEffect(() => { setMoreOpen(false); }, [location]);

  const isActive = (path: string) =>
    location === path || location.startsWith(path + "/");

  const activeInMore = MORE_CHANNELS.find((c) => isActive(c.path));

  return (
    /*
     * Il wrapper esterno NON ha overflow:hidden/auto così il dropdown
     * può uscire verticalmente senza essere tagliato.
     */
    <div
      className="border-b border-[#1a1a1a]/10 bg-white"
      style={{ fontFamily: SF, position: "relative" }}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 flex items-stretch">

        {/* ─── Canali primari — scroll orizzontale su mobile ─────────────── */}
        <div
          className="flex items-stretch flex-1 min-w-0"
          style={{ overflowX: "auto", overflowY: "visible", scrollbarWidth: "none" }}
        >
          {PRIMARY_CHANNELS.map((ch) => {
            const active = isActive(ch.path);
            return (
              <Link key={ch.key} href={ch.path}>
                <span
                  className={`flex items-center gap-1 px-2.5 sm:px-3 py-2.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.08em] whitespace-nowrap cursor-pointer transition-all duration-200 border-b-2 h-full ${
                    active
                      ? "border-[#1a1a1a] text-[#1a1a1a]"
                      : "border-transparent text-[#1a1a1a]/50 hover:text-[#1a1a1a] hover:border-[#1a1a1a]/20"
                  }`}
                >
                  <span className="text-[12px] leading-none">{ch.icon}</span>
                  <span className="hidden sm:inline">{ch.label}</span>
                  <span className="sm:hidden">{ch.label.split(" ")[0]}</span>
                </span>
              </Link>
            );
          })}

          {/* Separatore */}
          <div className="w-px self-stretch bg-[#1a1a1a]/10 mx-0.5 flex-shrink-0" />

          {/* ─── MORE dropdown ───────────────────────────────────────────── */}
          <div className="relative flex-shrink-0" ref={moreRef}>
            <button
              onClick={() => setMoreOpen((v) => !v)}
              className={`flex items-center gap-1 px-3 py-2.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.08em] cursor-pointer transition-all duration-200 border-b-2 h-full ${
                activeInMore || moreOpen
                  ? "border-[#1d1d1f] text-[#1d1d1f]"
                  : "border-transparent text-[#1a1a1a]/50 hover:text-[#1a1a1a] hover:border-[#1a1a1a]/20"
              }`}
            >
              ··· MORE
              <ChevronDown
                size={11}
                strokeWidth={2.5}
                className={`transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown panel */}
            {moreOpen && (
              <div
                className="absolute left-0 top-full z-[999] bg-white border border-[#1a1a1a]/12 rounded-b-xl shadow-2xl py-1.5 min-w-[220px]"
                style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.18)" }}
              >
                {MORE_CHANNELS.map((ch) => {
                  const active = isActive(ch.path);
                  return (
                    <Link key={ch.key} href={ch.path}>
                      <div
                        className={`flex flex-col px-4 py-2.5 cursor-pointer transition-colors duration-150 ${
                          active ? "bg-[#1a1a1a] text-white" : "hover:bg-[#f5f5f5] text-[#1a1a1a]"
                        }`}
                      >
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${active ? "text-white" : "text-[#1a1a1a]"}`}>
                          {ch.label}
                        </span>
                        <span className={`text-[9px] mt-0.5 ${active ? "text-white/60" : "text-[#1a1a1a]/40"}`}>
                          {ch.desc}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ─── Contatore lettori a destra ────────────────────────────────── */}
        <div className="flex-shrink-0 flex items-center pl-3 border-l border-[#1a1a1a]/10 ml-1">
          <ReadersCounter />
        </div>
      </div>
    </div>
  );
}
