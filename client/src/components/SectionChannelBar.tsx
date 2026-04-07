/**
 * SectionChannelBar — Barra canali orizzontale sotto la hero
 * Canali principali: AI NEWS | AI RESEARCH | AI VENTURE | AI INVEST
 * + dropdown "Altro" con tutti gli altri canali secondari
 */
import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown } from "lucide-react";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

// ─── Canali principali (barra visibile) ──────────────────────────────────────
const PRIMARY_CHANNELS = [
  { key: "ai",       label: "AI NEWS",     path: "/ai",               color: "#1a1a1a" },
  { key: "research", label: "AI RESEARCH", path: "/research",         color: "#0066cc" },
  { key: "venture",  label: "AI VENTURE",  path: "/dealroom",         color: "#7c3aed" },
  { key: "invest",   label: "AI INVEST",   path: "/ai-opportunities", color: "#0d6e3f" },
];

// ─── Canali secondari (dropdown "Altro") ─────────────────────────────────────
const OTHER_CHANNELS = [
  { key: "startup",    label: "AI STARTUP NEWS",  path: "/startup",             desc: "Startup da tenere d'occhio" },
  { key: "prompt-ai",  label: "PROMPT AI",         path: "/copy-paste-ai",       desc: "Prompt pronti da usare" },
  { key: "use-case",   label: "USE CASE AI",       path: "/automate-with-ai",    desc: "Casi d'uso reali" },
  { key: "fare-soldi", label: "FARE SOLDI",        path: "/make-money-with-ai",  desc: "Monetizza con l'AI" },
  { key: "tools",      label: "AI TOOLS",          path: "/daily-ai-tools",      desc: "I migliori strumenti AI" },
  { key: "ai-radar",   label: "AI RADAR",          path: "/verified-ai-news",    desc: "News verificate e filtrate" },
  { key: "dealflow",   label: "AI DEALFLOW",       path: "/dealflow",            desc: "Round, funding e M&A" },
  { key: "start-here", label: "START HERE",        path: "/start-here",          desc: "Come iniziare con l'AI" },
];

export default function SectionChannelBar() {
  const [location] = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Chiudi dropdown al click fuori
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Chiudi dropdown al cambio route
  useEffect(() => { setDropdownOpen(false); }, [location]);

  // Controlla se un path è attivo
  const isActive = (path: string) =>
    location === path || location.startsWith(path + "/");

  // Controlla se il canale attivo è in "Altro"
  const activeInOther = OTHER_CHANNELS.find((c) => isActive(c.path));

  return (
    <div
      className="flex items-center border-b border-[#1a1a1a]/10 bg-white overflow-x-auto"
      style={{ fontFamily: SF, scrollbarWidth: "none" }}
    >
      {/* ─── Canali primari ─────────────────────────────────────────────── */}
      {PRIMARY_CHANNELS.map((ch) => {
        const active = isActive(ch.path);
        return (
          <Link key={ch.key} href={ch.path}>
            <span
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] whitespace-nowrap cursor-pointer transition-all duration-200 border-b-2 ${
                active
                  ? "border-current"
                  : "border-transparent hover:border-[#1a1a1a]/20"
              }`}
              style={{
                color: active ? ch.color : "#1a1a1a80",
                borderColor: active ? ch.color : undefined,
              }}
            >
              {/* Dot colorato */}
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-200"
                style={{ background: active ? ch.color : "#1a1a1a30" }}
              />
              {ch.label}
            </span>
          </Link>
        );
      })}

      {/* ─── Separatore ─────────────────────────────────────────────────── */}
      <div className="w-px h-4 bg-[#1a1a1a]/10 mx-1 flex-shrink-0" />

      {/* ─── Dropdown "Altro" ───────────────────────────────────────────── */}
      <div className="relative flex-shrink-0" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={`flex items-center gap-1 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] cursor-pointer transition-all duration-200 border-b-2 ${
            activeInOther || dropdownOpen
              ? "border-[#dc2626] text-[#dc2626]"
              : "border-transparent text-[#1a1a1a]/50 hover:text-[#1a1a1a] hover:border-[#1a1a1a]/20"
          }`}
        >
          {activeInOther ? activeInOther.label : "ALTRO"}
          <ChevronDown
            size={12}
            strokeWidth={2.5}
            className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown panel */}
        {dropdownOpen && (
          <div
            className="absolute top-full left-0 mt-0 z-[200] bg-white border border-[#1a1a1a]/10 rounded-b-xl shadow-xl py-1.5 min-w-[220px]"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
          >
            {OTHER_CHANNELS.map((ch) => {
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

      {/* ─── Spacer ─────────────────────────────────────────────────────── */}
      <div className="flex-1" />
    </div>
  );
}
