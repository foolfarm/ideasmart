/**
 * SectionNav — Menu slide-over canali + barra sotto header con Chi Siamo e Demo
 * v2: animazioni fluide CSS, rimozione Chi Siamo dal panel, barra sotto header
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import {
  Play, Cpu, ClipboardCopy, Zap, DollarSign, Wrench, ShieldCheck,
  TrendingUp, Rocket, Handshake, BookOpen, Menu, X, ChevronRight,
  Sparkles, ExternalLink, Info, MonitorPlay,
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

export default function SectionNav() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const hoverIntentRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveIntentRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close on route change
  useEffect(() => { setOpen(false); }, [location]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
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

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (hoverIntentRef.current) clearTimeout(hoverIntentRef.current);
      if (leaveIntentRef.current) clearTimeout(leaveIntentRef.current);
    };
  }, []);

  // ─── Hover intent: open on hover with small delay, close with grace period ──
  const cancelLeave = useCallback(() => {
    if (leaveIntentRef.current) {
      clearTimeout(leaveIntentRef.current);
      leaveIntentRef.current = null;
    }
  }, []);

  const cancelHover = useCallback(() => {
    if (hoverIntentRef.current) {
      clearTimeout(hoverIntentRef.current);
      hoverIntentRef.current = null;
    }
  }, []);

  const scheduleOpen = useCallback(() => {
    cancelLeave();
    cancelHover();
    hoverIntentRef.current = setTimeout(() => setOpen(true), 150);
  }, [cancelLeave, cancelHover]);

  const scheduleClose = useCallback(() => {
    cancelHover();
    leaveIntentRef.current = setTimeout(() => setOpen(false), 350);
  }, [cancelHover]);

  // Find active channel
  const activeChannel = ALL_CHANNELS.find(
    (c) => location === c.path || location.startsWith(c.path + "/")
  );

  return (
    <>
      {/* ═══ TOP BAR: CANALI button + Chi Siamo + Demo ═══ */}
      <div
        className="flex items-center bg-white border-b border-[#1a1a1a]/8"
        style={{ fontFamily: SF }}
      >
        {/* Hamburger CANALI button */}
        <button
          ref={triggerRef}
          onClick={() => setOpen(!open)}
          onMouseEnter={scheduleOpen}
          onMouseLeave={scheduleClose}
          className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-all duration-200 cursor-pointer border-r border-[#1a1a1a]/10 group"
          aria-label={open ? "Chiudi menu canali" : "Apri menu canali"}
        >
          <span className="relative w-4 h-4 flex items-center justify-center">
            <Menu
              size={15}
              strokeWidth={2.2}
              className={`absolute transition-all duration-300 ease-out ${open ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"}`}
            />
            <X
              size={15}
              strokeWidth={2.2}
              className={`absolute transition-all duration-300 ease-out ${open ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"}`}
            />
          </span>
          CANALI
        </button>

        {/* Active channel indicator */}
        {activeChannel && (
          <Link href={activeChannel.path}>
            <span
              className="flex items-center gap-1.5 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#dc2626] hover:text-[#b91c1c] transition-colors cursor-pointer"
            >
              <activeChannel.icon size={13} strokeWidth={2.2} />
              {activeChannel.label}
            </span>
          </Link>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Demo Tecnologia IdeaSmart link */}
        <a
          href="https://ideasmart.technology"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors cursor-pointer"
        >
          <MonitorPlay size={13} strokeWidth={2.2} />
          Demo Tecnologia IdeaSmart
          <ExternalLink size={10} strokeWidth={2.5} className="opacity-60" />
        </a>

        {/* ProofPress Verify button */}
        <Link href="/verify">
          <span
            className="flex items-center gap-1.5 mr-3 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white bg-[#dc2626] hover:bg-[#b91c1c] rounded-sm transition-all duration-200 cursor-pointer"
          >
            <Info size={13} strokeWidth={2} />
            ProofPress Verify
          </span>
        </Link>
      </div>

      {/* ═══ BACKDROP ═══ */}
      <div
        className={`fixed inset-0 z-[998] transition-opacity duration-300 ease-out ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(3px)" }}
        onClick={() => setOpen(false)}
      />

      {/* ═══ SLIDE-OVER PANEL ═══ */}
      <div
        ref={panelRef}
        onMouseEnter={cancelLeave}
        onMouseLeave={scheduleClose}
        className={`fixed top-0 left-0 h-full z-[999] overflow-y-auto overscroll-contain`}
        style={{
          width: "320px",
          background: "#faf8f3",
          fontFamily: SF,
          boxShadow: open ? "8px 0 40px rgba(0,0,0,0.18)" : "none",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
          willChange: "transform",
        }}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#1a1a1a]">
          <span className="text-[13px] font-black uppercase tracking-[0.15em] text-white">
            IDEASMART
          </span>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 hover:bg-white/15 rounded-md transition-colors duration-150"
            aria-label="Chiudi menu"
          >
            <X size={17} strokeWidth={2} color="#fff" />
          </button>
        </div>

        {/* Title section */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center gap-2 mb-0.5">
            <Sparkles size={13} strokeWidth={2} className="text-[#dc2626]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]/45">
              Naviga i canali
            </span>
          </div>
          <p className="text-[11px] text-[#1a1a1a]/50 leading-relaxed">
            Esplora tutti i contenuti di IdeaSmart
          </p>
        </div>

        {/* Channel list */}
        <nav className="px-3 pb-3">
          {ALL_CHANNELS.map((c, i) => {
            const isActive = location === c.path || location.startsWith(c.path + "/");
            const isHovered = hoveredKey === c.key;
            const Icon = c.icon;
            return (
              <Link key={c.key} href={c.path}>
                <div
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer mb-px group ${
                    isActive
                      ? "bg-[#1a1a1a] text-white"
                      : "text-[#1a1a1a] hover:bg-white"
                  }`}
                  onMouseEnter={() => setHoveredKey(c.key)}
                  onMouseLeave={() => setHoveredKey(null)}
                  style={{
                    transition: "all 0.2s ease",
                    boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.12)" : isHovered ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
                    opacity: open ? 1 : 0,
                    transform: open ? "translateX(0)" : "translateX(-12px)",
                    transitionDelay: open ? `${i * 25}ms` : "0ms",
                    transitionProperty: "all",
                    transitionDuration: "0.3s",
                    transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
                  }}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <div
                      className="absolute left-0 top-1/2 w-[3px] h-5 bg-[#dc2626] rounded-r-full"
                      style={{ transform: "translateY(-50%)" }}
                    />
                  )}

                  {/* Icon */}
                  <span
                    className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md transition-all duration-200 ${
                      isActive
                        ? "bg-[#dc2626]/20 text-[#dc2626]"
                        : isHovered
                          ? "bg-[#1a1a1a]/10 text-[#1a1a1a] scale-105"
                          : "bg-[#1a1a1a]/5 text-[#1a1a1a]/45"
                    }`}
                  >
                    <Icon size={14} strokeWidth={2} />
                  </span>

                  {/* Label + description */}
                  <div className="flex-1 min-w-0">
                    <span className={`block text-[11px] font-bold uppercase tracking-wider leading-tight ${
                      isActive ? "text-white" : ""
                    }`}>
                      {c.label}
                    </span>
                    <span className={`block text-[9px] leading-tight mt-0.5 ${
                      isActive ? "text-white/45" : "text-[#1a1a1a]/30"
                    }`}>
                      {c.desc}
                    </span>
                  </div>

                  {/* Arrow */}
                  <ChevronRight
                    size={13}
                    strokeWidth={2}
                    className={`flex-shrink-0 transition-all duration-200 ${
                      isActive
                        ? "text-white/40"
                        : isHovered
                          ? "text-[#1a1a1a]/35 translate-x-0.5"
                          : "text-transparent"
                    }`}
                  />
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer branding */}
        <div className="px-5 py-4 mt-2 border-t border-[#1a1a1a]/8 bg-[#1a1a1a]/[0.03]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#dc2626] animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]/35">
              Il tuo sistema operativo sull'AI
            </span>
          </div>
          <p className="text-[10px] text-[#1a1a1a]/25 mt-0.5">
            Prompt, strumenti e workflow per trasformare l'AI in risultati concreti.
          </p>
        </div>
      </div>
    </>
  );
}
