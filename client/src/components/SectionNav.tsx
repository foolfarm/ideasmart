/**
 * SectionNav — Menu a tendina laterale sinistro con tutti i canali
 * Hamburger button + slide-in panel da sinistra, presente su tutte le pagine
 */
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  Play, Cpu, ClipboardCopy, Zap, DollarSign, Wrench, ShieldCheck,
  TrendingUp, Rocket, Handshake, BookOpen, Info, Menu, X, ChevronRight,
} from "lucide-react";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

const ALL_CHANNELS = [
  { key: "start-here",  label: "START HERE",        path: "/start-here",        icon: <Play size={16} strokeWidth={2} /> },
  { key: "ai",          label: "AI NEWS",            path: "/ai",                icon: <Cpu size={16} strokeWidth={2} /> },
  { key: "prompt-ai",   label: "PROMPT AI",          path: "/copy-paste-ai",     icon: <ClipboardCopy size={16} strokeWidth={2} /> },
  { key: "use-case",    label: "USE CASE AI",        path: "/automate-with-ai",  icon: <Zap size={16} strokeWidth={2} /> },
  { key: "fare-soldi",  label: "FARE SOLDI",         path: "/make-money-with-ai",icon: <DollarSign size={16} strokeWidth={2} /> },
  { key: "tools",       label: "AI TOOLS",           path: "/daily-ai-tools",    icon: <Wrench size={16} strokeWidth={2} /> },
  { key: "ai-radar",    label: "AI RADAR",           path: "/verified-ai-news",  icon: <ShieldCheck size={16} strokeWidth={2} /> },
  { key: "ai-invest",   label: "AI INVEST",          path: "/ai-opportunities",  icon: <TrendingUp size={16} strokeWidth={2} /> },
  { key: "startup",     label: "AI STARTUP NEWS",    path: "/startup",           icon: <Rocket size={16} strokeWidth={2} /> },
  { key: "dealroom",    label: "AI DEALROOM",        path: "/dealroom",          icon: <Handshake size={16} strokeWidth={2} /> },
  { key: "research",    label: "AI RESEARCH",        path: "/research",          icon: <BookOpen size={16} strokeWidth={2} /> },
];

const EXTRA_LINKS = [
  { key: "chi-siamo", label: "CHI SIAMO", path: "/chi-siamo", icon: <Info size={16} strokeWidth={2} /> },
];

export default function SectionNav() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on route change
  useEffect(() => { setOpen(false); }, [location]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Hamburger trigger bar */}
      <div
        className="flex items-center border-b border-[#1a1a1a]/10 bg-white"
        style={{ fontFamily: SF }}
      >
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-all duration-200 cursor-pointer border-r border-[#1a1a1a]/10"
          aria-label="Apri menu canali"
        >
          {open ? <X size={16} strokeWidth={2.2} /> : <Menu size={16} strokeWidth={2.2} />}
          CANALI
        </button>

        {/* Current channel indicator on desktop */}
        {ALL_CHANNELS.map((c) => {
          const isActive = location === c.path || location.startsWith(c.path + "/");
          if (!isActive) return null;
          return (
            <span
              key={c.key}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#dc2626]"
              style={{ fontFamily: SF }}
            >
              {c.icon}
              {c.label}
            </span>
          );
        })}

        <div className="flex-1" />

        {/* Readers counter slot — can be filled by parent */}
      </div>

      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-[998] transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Slide-in panel from left */}
      <div
        ref={panelRef}
        className={`fixed top-0 left-0 h-full w-[280px] bg-white z-[999] shadow-2xl transition-transform duration-300 ease-in-out overflow-y-auto ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ fontFamily: SF }}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]/10">
          <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#1a1a1a]">
            IDEASMART
          </span>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 hover:bg-[#f5f5f5] rounded-md transition-colors"
            aria-label="Chiudi menu"
          >
            <X size={18} strokeWidth={2} color="#1a1a1a" />
          </button>
        </div>

        {/* Section label */}
        <div className="px-5 pt-4 pb-2">
          <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#1a1a1a]/40">
            Canali
          </span>
        </div>

        {/* Channel list */}
        <div className="px-2 pb-2">
          {ALL_CHANNELS.map((c) => {
            const isActive = location === c.path || location.startsWith(c.path + "/");
            return (
              <Link key={c.key} href={c.path}>
                <span
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-[12px] font-bold uppercase tracking-wider cursor-pointer transition-all duration-200 group ${
                    isActive
                      ? "bg-[#1a1a1a] text-white shadow-sm"
                      : "text-[#1a1a1a] hover:bg-[#f5f5f5]"
                  }`}
                >
                  <span className={`flex-shrink-0 ${isActive ? "text-[#dc2626]" : "text-[#1a1a1a]/50 group-hover:text-[#1a1a1a]"}`}>
                    {c.icon}
                  </span>
                  <span className="flex-1">{c.label}</span>
                  {isActive && (
                    <ChevronRight size={14} strokeWidth={2.5} className="text-white/60" />
                  )}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div className="mx-5 border-t border-[#1a1a1a]/8" />

        {/* Extra links */}
        <div className="px-2 py-2">
          {EXTRA_LINKS.map((c) => {
            const isActive = location === c.path;
            return (
              <Link key={c.key} href={c.path}>
                <span
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-[12px] font-bold uppercase tracking-wider cursor-pointer transition-all duration-200 group ${
                    isActive
                      ? "bg-[#1a1a1a] text-white shadow-sm"
                      : "text-[#1a1a1a]/60 hover:bg-[#f5f5f5] hover:text-[#1a1a1a]"
                  }`}
                >
                  <span className={`flex-shrink-0 ${isActive ? "text-white/60" : "text-[#1a1a1a]/40 group-hover:text-[#1a1a1a]/60"}`}>
                    {c.icon}
                  </span>
                  <span className="flex-1">{c.label}</span>
                </span>
              </Link>
            );
          })}
        </div>

        {/* Footer branding */}
        <div className="px-5 py-4 mt-auto border-t border-[#1a1a1a]/8">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]/30">
            Il tuo sistema operativo sull'AI
          </p>
        </div>
      </div>
    </>
  );
}
