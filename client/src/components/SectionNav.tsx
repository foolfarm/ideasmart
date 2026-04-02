/**
 * SectionNav — Menu a tendina laterale sinistro con tutti i canali
 * Design migliorato: titolo "Naviga i canali", effetti interattivi, animazioni
 */
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  Play, Cpu, ClipboardCopy, Zap, DollarSign, Wrench, ShieldCheck,
  TrendingUp, Rocket, Handshake, BookOpen, Info, Menu, X, ChevronRight,
  Sparkles,
} from "lucide-react";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

const ALL_CHANNELS = [
  { key: "start-here",  label: "START HERE",        path: "/start-here",        icon: Play,          desc: "Come iniziare con l'AI" },
  { key: "ai",          label: "AI NEWS",            path: "/ai",                icon: Cpu,           desc: "Le ultime notizie sull'AI" },
  { key: "prompt-ai",   label: "PROMPT AI",          path: "/copy-paste-ai",     icon: ClipboardCopy, desc: "Prompt pronti da usare" },
  { key: "use-case",    label: "USE CASE AI",        path: "/automate-with-ai",  icon: Zap,           desc: "Casi d'uso reali" },
  { key: "fare-soldi",  label: "FARE SOLDI",         path: "/make-money-with-ai",icon: DollarSign,    desc: "Monetizza con l'AI" },
  { key: "tools",       label: "AI TOOLS",           path: "/daily-ai-tools",    icon: Wrench,        desc: "I migliori strumenti AI" },
  { key: "ai-radar",    label: "AI RADAR",           path: "/verified-ai-news",  icon: ShieldCheck,   desc: "News verificate e filtrate" },
  { key: "ai-invest",   label: "AI INVEST",          path: "/ai-opportunities",  icon: TrendingUp,    desc: "Opportunità di investimento" },
  { key: "startup",     label: "AI STARTUP NEWS",    path: "/startup",           icon: Rocket,        desc: "Startup da tenere d'occhio" },
  { key: "dealroom",    label: "AI DEALROOM",        path: "/dealroom",          icon: Handshake,     desc: "Round, funding e M&A" },
  { key: "research",    label: "AI RESEARCH",        path: "/research",          icon: BookOpen,      desc: "Ricerche e analisi" },
];

const EXTRA_LINKS = [
  { key: "chi-siamo", label: "CHI SIAMO", path: "/chi-siamo", icon: Info, desc: "La nostra missione" },
];

export default function SectionNav() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Mouseover open / mouseleave close with delay
  const handleTriggerMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setOpen(true);
    }, 200);
  };

  const handleTriggerMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 400);
  };

  const handlePanelMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handlePanelMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 400);
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // Find active channel
  const activeChannel = ALL_CHANNELS.find(
    (c) => location === c.path || location.startsWith(c.path + "/")
  );

  return (
    <>
      {/* Trigger bar — sticky */}
      <div
        className="flex items-center bg-white"
        style={{ fontFamily: SF }}
      >
        {/* Hamburger button */}
        <button
          ref={triggerRef}
          onClick={() => setOpen(!open)}
          onMouseEnter={handleTriggerMouseEnter}
          onMouseLeave={handleTriggerMouseLeave}
          className="flex items-center gap-2.5 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-all duration-200 cursor-pointer border-r border-[#1a1a1a]/10 group"
          aria-label={open ? "Chiudi menu canali" : "Apri menu canali"}
        >
          <span className="relative w-4 h-4 flex items-center justify-center">
            <Menu
              size={16}
              strokeWidth={2.2}
              className={`absolute transition-all duration-300 ${open ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"}`}
            />
            <X
              size={16}
              strokeWidth={2.2}
              className={`absolute transition-all duration-300 ${open ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"}`}
            />
          </span>
          CANALI
        </button>

        {/* Active channel indicator */}
        {activeChannel && (
          <Link href={activeChannel.path}>
            <span
              className="flex items-center gap-1.5 px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-[#dc2626] hover:text-[#b91c1c] transition-colors cursor-pointer"
              style={{ fontFamily: SF }}
            >
              <activeChannel.icon size={13} strokeWidth={2.2} />
              {activeChannel.label}
            </span>
          </Link>
        )}

        <div className="flex-1" />
      </div>

      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[998] transition-all duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Slide-in panel from left */}
      <div
        ref={panelRef}
        onMouseEnter={handlePanelMouseEnter}
        onMouseLeave={handlePanelMouseLeave}
        className={`fixed top-0 left-0 h-full w-[320px] bg-[#faf8f3] z-[999] shadow-[8px_0_30px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ fontFamily: SF }}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#1a1a1a]">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-black uppercase tracking-[0.15em] text-white">
              IDEASMART
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
            aria-label="Chiudi menu"
          >
            <X size={18} strokeWidth={2} color="#fff" />
          </button>
        </div>

        {/* Title section */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={14} strokeWidth={2} className="text-[#dc2626]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#1a1a1a]/50">
              Naviga i canali
            </span>
          </div>
          <p className="text-[12px] text-[#1a1a1a]/60 leading-relaxed">
            Esplora tutti i contenuti di IdeaSmart
          </p>
        </div>

        {/* Channel list */}
        <div className="px-3 pb-3">
          {ALL_CHANNELS.map((c, i) => {
            const isActive = location === c.path || location.startsWith(c.path + "/");
            const isHovered = hoveredKey === c.key;
            const Icon = c.icon;
            return (
              <Link key={c.key} href={c.path}>
                <div
                  className={`relative flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 mb-0.5 group ${
                    isActive
                      ? "bg-[#1a1a1a] text-white shadow-md"
                      : "text-[#1a1a1a] hover:bg-white hover:shadow-sm"
                  }`}
                  onMouseEnter={() => setHoveredKey(c.key)}
                  onMouseLeave={() => setHoveredKey(null)}
                  style={{
                    animationDelay: open ? `${i * 30}ms` : "0ms",
                    transform: open ? "translateX(0)" : "translateX(-8px)",
                    opacity: open ? 1 : 0,
                    transition: `all 0.3s cubic-bezier(0.16, 1, 0.3, 1) ${i * 30}ms`,
                  }}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#dc2626] rounded-r-full" />
                  )}

                  {/* Icon container */}
                  <span
                    className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-[#dc2626]/20 text-[#dc2626]"
                        : isHovered
                          ? "bg-[#1a1a1a]/10 text-[#1a1a1a] scale-110"
                          : "bg-[#1a1a1a]/5 text-[#1a1a1a]/50"
                    }`}
                  >
                    <Icon size={15} strokeWidth={2} />
                  </span>

                  {/* Label + description */}
                  <div className="flex-1 min-w-0">
                    <span className={`block text-[11px] font-bold uppercase tracking-wider leading-tight ${
                      isActive ? "text-white" : ""
                    }`}>
                      {c.label}
                    </span>
                    <span className={`block text-[9px] leading-tight mt-0.5 ${
                      isActive ? "text-white/50" : "text-[#1a1a1a]/35"
                    }`}>
                      {c.desc}
                    </span>
                  </div>

                  {/* Arrow */}
                  <ChevronRight
                    size={14}
                    strokeWidth={2}
                    className={`flex-shrink-0 transition-all duration-200 ${
                      isActive
                        ? "text-white/50"
                        : isHovered
                          ? "text-[#1a1a1a]/40 translate-x-0.5"
                          : "text-transparent"
                    }`}
                  />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div className="mx-5 border-t border-[#1a1a1a]/8" />

        {/* Extra links */}
        <div className="px-3 py-2">
          {EXTRA_LINKS.map((c) => {
            const isActive = location === c.path;
            const Icon = c.icon;
            return (
              <Link key={c.key} href={c.path}>
                <div
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 group ${
                    isActive
                      ? "bg-[#1a1a1a] text-white shadow-md"
                      : "text-[#1a1a1a]/60 hover:bg-white hover:text-[#1a1a1a] hover:shadow-sm"
                  }`}
                  onMouseEnter={() => setHoveredKey(c.key)}
                  onMouseLeave={() => setHoveredKey(null)}
                >
                  <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 ${
                    isActive ? "bg-white/10 text-white/60" : "bg-[#1a1a1a]/5 text-[#1a1a1a]/40 group-hover:bg-[#1a1a1a]/10"
                  }`}>
                    <Icon size={15} strokeWidth={2} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="block text-[11px] font-bold uppercase tracking-wider">{c.label}</span>
                    <span className={`block text-[9px] mt-0.5 ${isActive ? "text-white/40" : "text-[#1a1a1a]/30"}`}>{c.desc}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer branding */}
        <div className="px-5 py-5 mt-4 border-t border-[#1a1a1a]/8 bg-[#1a1a1a]/[0.03]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#dc2626] animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]/40">
              Il tuo sistema operativo sull'AI
            </span>
          </div>
          <p className="text-[10px] text-[#1a1a1a]/30 mt-1">
            Prompt, strumenti e workflow per trasformare l'AI in risultati concreti.
          </p>
        </div>
      </div>
    </>
  );
}
