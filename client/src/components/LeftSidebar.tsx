import { Link, useLocation } from "wouter";
import ReadersCounter from "@/components/ReadersCounter";
import { useState, useRef } from "react";
import {
  ChevronDown, ChevronRight,
  Info, BookOpen, Briefcase, Mail,
  Monitor, BookMarked, CircleDollarSign, PenLine, KeyRound,
} from "lucide-react";

/* ─── FONT STACK ─────────────────────────────────────────────────────── */
const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Segoe UI', Arial, sans-serif";

/* ─── DIMENSIONI ─────────────────────────────────────────────────────── */
const COLLAPSED_W = 62;
const EXPANDED_W  = 236;

/* ─── ICONA MENU ─────────────────────────────────────────────────────── */
function MenuIcon({ Icon, active }: { Icon: React.ElementType; active: boolean }) {
  return (
    <span
      className="flex-shrink-0 flex items-center justify-center"
      style={{
        width: 32, height: 32, borderRadius: 9,
        background: active ? "#1d1d1f" : "#f2f2f7",
        transition: "background 0.15s ease",
      }}
    >
      <Icon size={15} strokeWidth={1.9} color={active ? "#ffffff" : "#48484a"} />
    </span>
  );
}

export default function LeftSidebar() {
  const [location] = useLocation();
  const [hovered, setHovered] = useState(false);
  const [chiSiamoOpen, setChiSiamoOpen] = useState(
    location.startsWith("/chi-siamo") || location.startsWith("/storia")
  );
  const [cosaFacciamoOpen, setCosaFacciamoOpen] = useState(
    location.startsWith("/cosa-facciamo") || location.startsWith("/piattaforma") || location.startsWith("/proofpress-verify")
  );
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setHovered(true);
  };
  const handleMouseLeave = () => {
    leaveTimer.current = setTimeout(() => setHovered(false), 130);
  };

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  const expanded = hovered;
  const w = expanded ? EXPANDED_W : COLLAPSED_W;

  const labelStyle: React.CSSProperties = {
    fontFamily: SF,
    opacity: expanded ? 1 : 0,
    transition: "opacity 150ms ease",
    whiteSpace: "nowrap",
    overflow: "hidden",
  };
  const fadeBlock: React.CSSProperties = {
    opacity: expanded ? 1 : 0,
    transition: "opacity 150ms ease",
    overflow: "hidden",
  };

  /* ── Sub-link helper ── */
  const SubLink = ({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) => (
    <Link href={href}>
      <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all cursor-pointer ${
        isActive(href) ? "text-[#1d1d1f] font-semibold" : "text-[#6e6e73] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"
      }`}>
        <Icon size={11} strokeWidth={2} />
        <span className="text-[12px] font-medium" style={{ fontFamily: SF }}>{label}</span>
      </div>
    </Link>
  );

  return (
    <aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="hidden lg:flex flex-col flex-shrink-0"
      style={{
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: expanded ? "auto" : "hidden",
        overflowX: "hidden",
        background: "#ffffff",
        borderRight: "1px solid #e5e5ea",
        paddingTop: "16px",
        paddingBottom: "28px",
        scrollbarWidth: "none",
        width: `${w}px`,
        minWidth: `${w}px`,
        maxWidth: `${w}px`,
        transition: "width 230ms cubic-bezier(0.4,0,0.2,1), min-width 230ms cubic-bezier(0.4,0,0.2,1), max-width 230ms cubic-bezier(0.4,0,0.2,1)",
        zIndex: 40,
        boxShadow: expanded ? "3px 0 20px rgba(0,0,0,0.07)" : "none",
        fontFamily: SF,
      }}
    >

      {/* ── Titolo Menu ── */}
      <div className="px-3 mb-3" style={fadeBlock}>
        <div style={{ fontFamily: SF, fontSize: "20px", fontWeight: 900, color: "#1d1d1f", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          Menu
        </div>
      </div>
      <div className="mx-3 mb-3 border-t border-[#e5e5ea]" style={fadeBlock} />

      {/* ── Tagline ── */}
      <div className="px-3 mb-5" style={{ ...fadeBlock, whiteSpace: "normal" }}>
        <p style={{ fontSize: "12px", color: "rgba(29,29,31,0.5)", lineHeight: 1.6, fontFamily: SF }}>
          ProofPress Magazine nasce dalla piattaforma ProofPress, la prima tecnologia di AI Journalism certificato.
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          NAV PRINCIPALE — struttura A/B/C/D/E
      ══════════════════════════════════════════════════════════════ */}
      <nav className="flex flex-col gap-0.5 px-2 mb-3">

        {/* A) CHI SIAMO — dropdown */}
        <div>
          <button
            onClick={() => expanded && setChiSiamoOpen(!chiSiamoOpen)}
            className="w-full flex items-center gap-3 px-1 py-1.5 rounded-xl cursor-pointer transition-all duration-150 hover:bg-[#f5f5f7]"
            title={!expanded ? "Chi Siamo" : undefined}
          >
            <MenuIcon Icon={Info} active={isActive("/chi-siamo") || isActive("/storia")} />
            <span className="text-[13px] font-semibold text-[#1d1d1f] flex-1 text-left" style={labelStyle}>Chi Siamo</span>
            {expanded && (chiSiamoOpen
              ? <ChevronDown size={12} className="flex-shrink-0 opacity-30 mr-1" />
              : <ChevronRight size={12} className="flex-shrink-0 opacity-30 mr-1" />)}
          </button>
          {chiSiamoOpen && expanded && (
            <div className="ml-11 mt-0.5 flex flex-col gap-0.5 border-l border-[#e5e5ea] pl-3">
              <SubLink href="/chi-siamo" icon={Info} label="Chi Siamo" />
              <SubLink href="/storia" icon={BookOpen} label="Storia" />
            </div>
          )}
        </div>

        {/* B) COSA FACCIAMO — dropdown */}
        <div>
          <button
            onClick={() => expanded && setCosaFacciamoOpen(!cosaFacciamoOpen)}
            className="w-full flex items-center gap-3 px-1 py-1.5 rounded-xl cursor-pointer transition-all duration-150 hover:bg-[#f5f5f7]"
            title={!expanded ? "Cosa Facciamo" : undefined}
          >
            <MenuIcon Icon={Monitor} active={isActive("/cosa-facciamo") || isActive("/piattaforma") || isActive("/proofpress-verify")} />
            <span className="text-[13px] font-semibold text-[#1d1d1f] flex-1 text-left" style={labelStyle}>Cosa Facciamo</span>
            {expanded && (cosaFacciamoOpen
              ? <ChevronDown size={12} className="flex-shrink-0 opacity-30 mr-1" />
              : <ChevronRight size={12} className="flex-shrink-0 opacity-30 mr-1" />)}
          </button>
          {cosaFacciamoOpen && expanded && (
            <div className="ml-11 mt-0.5 flex flex-col gap-0.5 border-l border-[#e5e5ea] pl-3">
              <SubLink href="/cosa-facciamo" icon={Briefcase} label="Cosa Offriamo" />
              <SubLink href="/piattaforma" icon={Monitor} label="Piattaforma Agentica" />
              <SubLink href="/proofpress-verify" icon={BookMarked} label="Tecnologia Verify" />
            </div>
          )}
        </div>

        {/* C) PUBBLICIZZA */}
        <Link href="/pubblicita">
          <div
            className="flex items-center gap-3 px-1 py-1.5 rounded-xl cursor-pointer transition-all duration-150 hover:bg-[#f5f5f7]"
            title={!expanded ? "Pubblicizza" : undefined}
          >
            <MenuIcon Icon={Briefcase} active={isActive("/pubblicita")} />
            <span className="text-[13px] font-semibold text-[#1d1d1f]" style={labelStyle}>Pubblicizza</span>
          </div>
        </Link>

        {/* C2) SCRIVI PER NOI */}
        <Link href="/scrivi-per-noi">
          <div
            className="flex items-center gap-3 px-1 py-1.5 rounded-xl cursor-pointer transition-all duration-150 hover:bg-[#f5f5f7]"
            title={!expanded ? "Scrivi per Noi" : undefined}
          >
            <MenuIcon Icon={PenLine} active={isActive("/scrivi-per-noi")} />
            <span className="text-[13px] font-semibold text-[#1d1d1f]" style={labelStyle}>Scrivi per Noi</span>
          </div>
        </Link>

        {/* C3) PORTALE GIORNALISTI */}
        <Link href="/journalist-portal">
          <div
            className="flex items-center gap-3 px-1 py-1.5 rounded-xl cursor-pointer transition-all duration-150 hover:bg-[#f5f5f7]"
            title={!expanded ? "Portale Giornalisti" : undefined}
          >
            <MenuIcon Icon={KeyRound} active={isActive("/journalist-portal")} />
            <span className="text-[13px] font-semibold text-[#1d1d1f]" style={labelStyle}>Portale Giornalisti</span>
          </div>
        </Link>

        {/* D) CONTATTI */}
        <Link href="/contatti">
          <div
            className="flex items-center gap-3 px-1 py-1.5 rounded-xl cursor-pointer transition-all duration-150 hover:bg-[#f5f5f7]"
            title={!expanded ? "Contatti" : undefined}
          >
            <MenuIcon Icon={Mail} active={isActive("/contatti")} />
            <span className="text-[13px] font-semibold text-[#1d1d1f]" style={labelStyle}>Contatti</span>
          </div>
        </Link>

        {/* E) INVESTI */}
        <Link href="/investor">
          <div
            className="flex items-center gap-3 px-1 py-1.5 rounded-xl cursor-pointer transition-all duration-150 hover:bg-[#fff3ee]"
            title={!expanded ? "Investi" : undefined}
          >
            <span
              className="flex-shrink-0 flex items-center justify-center"
              style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(255,85,0,0.12)", transition: "background 0.15s ease" }}
            >
              <CircleDollarSign size={15} strokeWidth={1.9} color="#ff5500" />
            </span>
            <div style={{ ...labelStyle, flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#ff5500", fontFamily: SF, lineHeight: 1.2 }}>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ff5500] animate-pulse mr-1.5 align-middle" />
                Investi
              </div>
              <div style={{ fontSize: "10px", color: "#ff5500", opacity: 0.7, fontFamily: SF, lineHeight: 1.2 }}>Pre-Seed Open</div>
            </div>
          </div>
        </Link>

      </nav>

      {/* Spazio flessibile */}
      <div className="flex-1" />

      {/* ── LinkedIn ── */}
      <div className="px-2 mb-3 mt-3">
        <a
          href="https://www.linkedin.com/company/proofpress/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-1 py-1.5 rounded-xl hover:bg-[#f5f5f7] transition-colors cursor-pointer"
          title={!expanded ? "LinkedIn" : undefined}
        >
          <span
            className="flex-shrink-0 flex items-center justify-center"
            style={{ width: 32, height: 32, borderRadius: 9, background: "#f2f2f7" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#48484a">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </span>
          <div style={{ flex: 1, minWidth: 0, ...fadeBlock }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#1d1d1f", fontFamily: SF, lineHeight: 1.2 }}>ProofPress</div>
            <div style={{ fontSize: "10px", color: "#8e8e93", fontFamily: SF, lineHeight: 1.2 }}>Seguici su LinkedIn</div>
          </div>
        </a>
      </div>

      {/* ── Readers counter ── */}
      <div style={fadeBlock}>
        <div className="mx-3 mb-2 border-t border-[#e5e5ea]" />
        <div className="px-3">
          <ReadersCounter />
        </div>
      </div>

    </aside>
  );
}
