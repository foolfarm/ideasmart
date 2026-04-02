/**
 * SectionNav — Barra canali "AI Operating System" condivisa tra tutte le pagine
 * Tutti i canali direttamente nella barra, senza dropdown MORE
 */
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  Play, Cpu, ClipboardCopy, Zap, DollarSign, Wrench, ShieldCheck,
  TrendingUp, Rocket, Handshake, BookOpen, Info, Menu, X,
} from "lucide-react";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  "start-here":    <Play size={13} strokeWidth={2.2} />,
  ai:              <Cpu size={13} strokeWidth={2.2} />,
  "prompt-ai":     <ClipboardCopy size={13} strokeWidth={2.2} />,
  "use-case":      <Zap size={13} strokeWidth={2.2} />,
  "fare-soldi":    <DollarSign size={13} strokeWidth={2.2} />,
  tools:           <Wrench size={13} strokeWidth={2.2} />,
  "ai-radar":      <ShieldCheck size={13} strokeWidth={2.2} />,
  "ai-invest":     <TrendingUp size={13} strokeWidth={2.2} />,
  startup:         <Rocket size={13} strokeWidth={2.2} />,
  dealroom:        <Handshake size={13} strokeWidth={2.2} />,
  research:        <BookOpen size={13} strokeWidth={2.2} />,
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

  useEffect(() => { setMobileMenuOpen(false); }, [location]);

  const allChannels = [
    { key: "start-here",  label: "START HERE",        path: "/start-here" },
    { key: "ai",          label: "AI NEWS",            path: "/ai" },
    { key: "prompt-ai",   label: "PROMPT AI",          path: "/copy-paste-ai" },
    { key: "use-case",    label: "USE CASE AI",        path: "/automate-with-ai" },
    { key: "fare-soldi",  label: "FARE SOLDI",         path: "/make-money-with-ai" },
    { key: "tools",       label: "AI TOOLS",           path: "/daily-ai-tools" },
    { key: "ai-radar",    label: "AI RADAR",           path: "/verified-ai-news" },
    { key: "ai-invest",   label: "AI INVEST",          path: "/ai-opportunities" },
    { key: "startup",     label: "AI STARTUP NEWS",    path: "/startup" },
    { key: "dealroom",    label: "AI DEALROOM",        path: "/dealroom" },
    { key: "research",    label: "AI RESEARCH",        path: "/research" },
  ];

  return (
    <>
      <nav className="flex items-center gap-0 overflow-x-auto scrollbar-hide w-full">
        {/* Desktop: tutti i canali */}
        <div className="hidden lg:flex items-center gap-0">
          {allChannels.map((c) => (
            <NavItem
              key={c.key}
              href={c.path}
              label={c.label}
              icon={CHANNEL_ICONS[c.key]}
              isActive={location === c.path || location.startsWith(c.path + "/")}
            />
          ))}
        </div>

        {/* Mobile: primi 4 canali + hamburger */}
        <div className="flex lg:hidden items-center gap-0">
          {allChannels.slice(0, 4).map((c) => (
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
          maxHeight: mobileMenuOpen ? "700px" : "0px",
          opacity: mobileMenuOpen ? 1 : 0,
        }}
      >
        <div className="border-b border-[#1a1a1a]/15 bg-white">
          {allChannels.map((c) => (
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
