/**
 * SectionNav — Barra canali "AI Operating System" condivisa tra tutte le pagine
 * 7 canali principali + MORE dropdown (legacy) + CHI SIAMO
 */
import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  Play, ClipboardCopy, Zap, DollarSign, Wrench, ShieldCheck,
  TrendingUp, Cpu, Rocket, Handshake, BookOpen,
  MoreHorizontal, ChevronDown, Info, Menu, X,
} from "lucide-react";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  ai:              <Cpu size={13} strokeWidth={2.2} />,
  startup:         <Rocket size={13} strokeWidth={2.2} />,
  dealroom:        <Handshake size={13} strokeWidth={2.2} />,
  research:        <BookOpen size={13} strokeWidth={2.2} />,
  "start-here":    <Play size={13} strokeWidth={2.2} />,
  "copy-paste":    <ClipboardCopy size={13} strokeWidth={2.2} />,
  automate:        <Zap size={13} strokeWidth={2.2} />,
  "make-money":    <DollarSign size={13} strokeWidth={2.2} />,
  tools:           <Wrench size={13} strokeWidth={2.2} />,
  "verified-news": <ShieldCheck size={13} strokeWidth={2.2} />,
  opportunities:   <TrendingUp size={13} strokeWidth={2.2} />,
};

function NavItem({ href, label, icon, isActive }: {
  href: string; label: string; icon: React.ReactNode; isActive: boolean;
}) {
  return (
    <Link href={href}>
      <span
        className={`flex items-center gap-1.5 px-2.5 py-2.5 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-200 cursor-pointer border-r border-[#1a1a1a]/15 hover:bg-[#1a1a1a] hover:text-white hover:shadow-[inset_0_-2px_0_0_#dc2626] ${
          isActive ? "bg-[#1a1a1a] text-white shadow-[inset_0_-2px_0_0_#dc2626]" : ""
        }`}
        style={{ fontFamily: SF, color: isActive ? "#fff" : "#1a1a1a" }}
      >
        {icon}
        {label}
      </span>
    </Link>
  );
}

export default function SectionNav() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMobileMenuOpen(false); setMoreOpen(false); }, [location]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const mainChannels = [
    { key: "start-here",    label: "START HERE",        path: "/start-here" },
    { key: "copy-paste",    label: "COPY & PASTE AI",   path: "/copy-paste-ai" },
    { key: "automate",      label: "AUTOMATE",          path: "/automate-with-ai" },
    { key: "make-money",    label: "MAKE MONEY",        path: "/make-money-with-ai" },
    { key: "tools",         label: "DAILY AI TOOLS",    path: "/daily-ai-tools" },
    { key: "verified-news", label: "VERIFIED NEWS",     path: "/verified-ai-news" },
    { key: "opportunities", label: "AI OPPORTUNITIES",  path: "/ai-opportunities" },
  ];

  const moreChannels = [
    { key: "startup",  label: "STARTUP NEWS", path: "/startup" },
    { key: "dealroom", label: "DEALROOM",     path: "/dealroom" },
    { key: "research", label: "RICERCHE",     path: "/research" },
  ];

  const isMoreActive = moreChannels.some(c => location === c.path || location.startsWith(c.path + "/"));

  return (
    <>
      <nav className="flex items-center gap-0 overflow-x-auto scrollbar-hide w-full">
        {/* Desktop: tutti i canali */}
        <div className="hidden lg:flex items-center gap-0">
          {mainChannels.map((c) => (
            <NavItem
              key={c.key}
              href={c.path}
              label={c.label}
              icon={CHANNEL_ICONS[c.key]}
              isActive={location === c.path || location.startsWith(c.path + "/")}
            />
          ))}

          {/* More dropdown */}
          <div ref={moreRef} className="relative">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-2.5 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-200 cursor-pointer border-r border-[#1a1a1a]/15 hover:bg-[#1a1a1a] hover:text-white ${
                isMoreActive ? "bg-[#1a1a1a] text-white" : ""
              }`}
              style={{ fontFamily: SF, color: isMoreActive ? "#fff" : "#1a1a1a" }}
            >
              <MoreHorizontal size={13} strokeWidth={2.2} />
              MORE
              <ChevronDown size={10} strokeWidth={2.5} className={`transition-transform ${moreOpen ? "rotate-180" : ""}`} />
            </button>
            {moreOpen && (
              <div className="absolute top-full left-0 z-50 bg-white border border-[#1a1a1a]/15 shadow-lg min-w-[180px]">
                {moreChannels.map((c) => (
                  <Link key={c.key} href={c.path}>
                    <span
                      className={`flex items-center gap-2 px-4 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-[#1a1a1a] hover:text-white transition-colors cursor-pointer border-b border-[#1a1a1a]/8 last:border-b-0 ${
                        location === c.path || location.startsWith(c.path + "/") ? "bg-[#1a1a1a] text-white" : ""
                      }`}
                      style={{ fontFamily: SF, color: location === c.path || location.startsWith(c.path + "/") ? "#fff" : "#1a1a1a" }}
                    >
                      {CHANNEL_ICONS[c.key]}
                      {c.label}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile: primi 3 canali + hamburger */}
        <div className="flex lg:hidden items-center gap-0">
          {mainChannels.slice(0, 3).map((c) => (
            <NavItem
              key={c.key}
              href={c.path}
              label={c.label}
              icon={CHANNEL_ICONS[c.key]}
              isActive={location === c.path || location.startsWith(c.path + "/")}
            />
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CHI SIAMO — desktop only */}
        <div className="hidden lg:flex items-center gap-0 border-l border-[#1a1a1a]/15">
          <Link href="/chi-siamo">
            <span
              className={`flex items-center gap-1.5 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-200 cursor-pointer hover:bg-[#1a1a1a] hover:text-white hover:shadow-[inset_0_-2px_0_0_#dc2626] ${
                location === "/chi-siamo" ? "bg-[#1a1a1a] text-white" : ""
              }`}
              style={{ fontFamily: SF, color: location === "/chi-siamo" ? "#fff" : "#1a1a1a" }}>
              <Info size={13} strokeWidth={2.2} />
              CHI SIAMO
            </span>
          </Link>
        </div>

        {/* Hamburger — mobile/tablet only */}
        <button
          className="flex lg:hidden items-center justify-center w-10 h-10 border-l border-[#1a1a1a]/15 hover:bg-[#1a1a1a]/5 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X size={18} color="#1a1a1a" /> : <Menu size={18} color="#1a1a1a" />}
        </button>
      </nav>

      {/* Mobile dropdown — all channels */}
      <div
        className="lg:hidden overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: mobileMenuOpen ? "600px" : "0px",
          opacity: mobileMenuOpen ? 1 : 0,
        }}
      >
        <div className="border-b border-[#1a1a1a]/15 bg-white">
          {mainChannels.map((c) => (
            <Link key={c.key} href={c.path}>
              <span
                className={`flex items-center gap-2 px-4 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-[#f5f5f5] transition-colors cursor-pointer border-b border-[#1a1a1a]/8 ${
                  location === c.path ? "bg-[#1a1a1a] text-white" : ""
                }`}
                style={{ fontFamily: SF, color: location === c.path ? "#fff" : "#1a1a1a" }}>
                {CHANNEL_ICONS[c.key]}
                {c.label}
              </span>
            </Link>
          ))}
          <div className="px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-[#1a1a1a]/30" style={{ fontFamily: SF }}>More</div>
          {moreChannels.map((c) => (
            <Link key={c.key} href={c.path}>
              <span
                className={`flex items-center gap-2 px-4 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-[#f5f5f5] transition-colors cursor-pointer border-b border-[#1a1a1a]/8 ${
                  location === c.path ? "bg-[#1a1a1a] text-white" : ""
                }`}
                style={{ fontFamily: SF, color: location === c.path ? "#fff" : "#1a1a1a" }}>
                {CHANNEL_ICONS[c.key]}
                {c.label}
              </span>
            </Link>
          ))}
          <Link href="/chi-siamo">
            <span
              className="flex items-center gap-2 px-4 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-[#f5f5f5] transition-colors cursor-pointer"
              style={{ fontFamily: SF, color: "#1a1a1a" }}>
              <Info size={14} strokeWidth={2} />
              CHI SIAMO
            </span>
          </Link>
        </div>
      </div>
    </>
  );
}
