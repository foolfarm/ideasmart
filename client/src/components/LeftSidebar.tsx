import { Link, useLocation } from "wouter";
import ReadersCounter from "@/components/ReadersCounter";
import { useState, useRef } from "react";
import {
  ChevronDown, ChevronRight,
  Home, Zap, BookOpen, Rocket, TrendingUp, ShieldCheck,
  DollarSign, ClipboardCopy, Wrench, Play, Sparkles,
} from "lucide-react";

/* ─── FONT STACK ─────────────────────────────────────────────────────── */
const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Segoe UI', Arial, sans-serif";

/* ─── CANALI ─────────────────────────────────────────────────────────── */
const CHANNELS = [
  { label: "Breaking News", path: "/ai",                  Icon: Zap,           color: "#dc2626" },
  { label: "Research",      path: "/research",            Icon: BookOpen,      color: "#0071e3" },
  { label: "Venture",       path: "/startup",             Icon: Rocket,        color: "#ff9f0a" },
  { label: "Investi",       path: "/dealroom",            Icon: TrendingUp,    color: "#34c759" },
  { label: "Radar",         path: "/verified-ai-news",   Icon: ShieldCheck,   color: "#6e6e73" },
  { label: "Make Money",    path: "/make-money-with-ai", Icon: DollarSign,    color: "#34c759" },
  { label: "Prompt Library",path: "/copy-paste-ai",      Icon: ClipboardCopy, color: "#0071e3" },
  { label: "Nuovi Tools",   path: "/daily-ai-tools",     Icon: Wrench,        color: "#ff9f0a" },
  { label: "Casi d'Uso",    path: "/automate-with-ai",   Icon: Play,          color: "#dc2626" },
  { label: "Opportunità",   path: "/ai-opportunities",   Icon: Sparkles,      color: "#6e6e73" },
];

/* ─── SEZIONE INFO ────────────────────────────────────────────────────── */
const INFO_LINKS = [
  { label: "Chi siamo",         icon: "🏗️", href: "/chi-siamo-story" },
  { label: "Pubblicizza",       icon: "📣", href: "/pubblicita" },
  { label: "Collezione Prompt", icon: "📋", href: "https://promptcollection2026.com/" },
  { label: "Contatti",          icon: "✉️", href: "mailto:info@proofpress.ai" },
];

const PIATTAFORMA_SUBMENU = [
  { label: "Piattaforma ProofPress", icon: "🚀", href: "/piattaforma", external: false },
  { label: "Agentic Platform Demo",  icon: "🎯", href: "https://ideasmart.technology", external: true },
  { label: "ProofPress Verify",      icon: "✅", href: "/proofpress-verify", external: false },
];

const OFFERTA_SUBMENU = [
  { label: "Creator & Giornalisti", icon: "✍️", href: "/offerta/creator" },
  { label: "Testate & Editori",     icon: "📰", href: "/offerta/editori" },
  { label: "Aziende & Corporate",   icon: "🏢", href: "/offerta/aziende" },
];

/* ─── DIMENSIONI ─────────────────────────────────────────────────────── */
const COLLAPSED_W = 52;
const EXPANDED_W  = 224;

export default function LeftSidebar() {
  const [location] = useLocation();
  const [hovered, setHovered] = useState(false);
  const [offertaOpen, setOffertaOpen] = useState(location.startsWith("/offerta"));
  const [piattaformaOpen, setPiattaformaOpen] = useState(
    location.startsWith("/proofpress-verify") || location.startsWith("/piattaforma")
  );
  const [canaliOpen, setCanaliOpen] = useState(true);
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

  /* ─── helpers ─────────────────────────────────────────────────────── */
  const labelStyle: React.CSSProperties = {
    fontFamily: SF,
    opacity: expanded ? 1 : 0,
    transition: "opacity 140ms ease",
    whiteSpace: "nowrap",
    overflow: "hidden",
  };

  const fadeBlock: React.CSSProperties = {
    opacity: expanded ? 1 : 0,
    transition: "opacity 140ms ease",
    overflow: "hidden",
  };

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
        transition: "width 220ms cubic-bezier(0.4,0,0.2,1), min-width 220ms cubic-bezier(0.4,0,0.2,1), max-width 220ms cubic-bezier(0.4,0,0.2,1)",
        zIndex: 40,
        boxShadow: expanded ? "2px 0 18px rgba(0,0,0,0.07)" : "none",
        fontFamily: SF,
      }}
    >

      {/* ── Titolo Menu ── */}
      <div className="px-3 mb-3" style={fadeBlock}>
        <Link href="/chi-siamo-story">
          <div style={{ fontFamily: SF, fontSize: "20px", fontWeight: 900, color: "#1d1d1f", letterSpacing: "-0.02em", lineHeight: 1.1, cursor: "pointer" }}>
            Menu
          </div>
        </Link>
      </div>

      <div className="mx-3 mb-3 border-t border-[#e5e5ea]" style={fadeBlock} />

      {/* ── Tagline ── */}
      <div className="px-3 mb-4" style={{ ...fadeBlock, whiteSpace: "normal" }}>
        <p style={{ fontSize: "12px", color: "rgba(29,29,31,0.6)", lineHeight: 1.6, fontFamily: SF }}>
          ProofPress Magazine — AI Journalism certificato.{" "}
          <Link href="/offerta/creator"><span style={{ color: "#0071e3", fontWeight: 700, cursor: "pointer" }}>Creator</span></Link>,{" "}
          <Link href="/offerta/aziende"><span style={{ color: "#0071e3", fontWeight: 700, cursor: "pointer" }}>aziende</span></Link>{" "}ed{" "}
          <Link href="/offerta/editori"><span style={{ color: "#0071e3", fontWeight: 700, cursor: "pointer" }}>editori</span></Link>.
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          NAV PRINCIPALE
      ══════════════════════════════════════════════════════════════ */}
      <nav className="flex flex-col gap-0.5 px-1.5 mb-2">

        {/* ── HOME ── */}
        <Link href="/">
          <div
            className={`flex items-center gap-2.5 px-2 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
              location === "/" ? "bg-[#1d1d1f] text-white" : "hover:bg-[#f5f5f7] text-[#1d1d1f]"
            }`}
            title={!expanded ? "Home" : undefined}
          >
            <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg ${location === "/" ? "bg-white/20" : "bg-[#1d1d1f]/6"}`}>
              <Home size={13} strokeWidth={2.2} className={location === "/" ? "text-white" : "text-[#1d1d1f]"} />
            </span>
            <span className="text-[13px] font-semibold leading-tight" style={labelStyle}>Home</span>
          </div>
        </Link>

        {/* ── PIATTAFORMA ── */}
        <div>
          <button
            onClick={() => expanded && setPiattaformaOpen(!piattaformaOpen)}
            className={`w-full flex items-center gap-2.5 px-2 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
              location.startsWith("/proofpress-verify") || location.startsWith("/piattaforma")
                ? "bg-[#1d1d1f] text-white"
                : "hover:bg-[#f5f5f7] text-[#1d1d1f]"
            }`}
            title={!expanded ? "Piattaforma" : undefined}
          >
            <span className="text-[14px] w-6 h-6 flex items-center justify-center flex-shrink-0">🖥️</span>
            <span className="text-[13px] font-semibold leading-tight flex-1 text-left" style={labelStyle}>Piattaforma</span>
            {expanded && (piattaformaOpen ? <ChevronDown size={13} className="flex-shrink-0 opacity-40" /> : <ChevronRight size={13} className="flex-shrink-0 opacity-40" />)}
          </button>
          {piattaformaOpen && expanded && (
            <div className="ml-5 mt-0.5 flex flex-col gap-0.5 border-l-2 border-[#1d1d1f]/10 pl-2.5">
              {PIATTAFORMA_SUBMENU.map((sub) =>
                sub.external ? (
                  <a key={sub.href} href={sub.href} target="_blank" rel="noopener noreferrer">
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-[#f5f5f7] text-[#1d1d1f]/55 hover:text-[#1d1d1f] transition-all">
                      <span className="text-[12px]">{sub.icon}</span>
                      <span className="text-[12px] font-medium" style={{ fontFamily: SF }}>{sub.label}</span>
                    </div>
                  </a>
                ) : (
                  <Link key={sub.href} href={sub.href}>
                    <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all ${isActive(sub.href) ? "bg-[#f5f5f7] text-[#1d1d1f] font-semibold" : "hover:bg-[#f5f5f7] text-[#1d1d1f]/55 hover:text-[#1d1d1f]"}`}>
                      <span className="text-[12px]">{sub.icon}</span>
                      <span className="text-[12px] font-medium" style={{ fontFamily: SF }}>{sub.label}</span>
                    </div>
                  </Link>
                )
              )}
            </div>
          )}
        </div>

        {/* ── OFFERTA ── */}
        <div>
          <button
            onClick={() => expanded && setOffertaOpen(!offertaOpen)}
            className={`w-full flex items-center gap-2.5 px-2 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
              location.startsWith("/offerta") ? "bg-[#1d1d1f] text-white" : "hover:bg-[#f5f5f7] text-[#1d1d1f]"
            }`}
            title={!expanded ? "Offerta" : undefined}
          >
            <span className="text-[14px] w-6 h-6 flex items-center justify-center flex-shrink-0">💼</span>
            <span className="text-[13px] font-semibold leading-tight flex-1 text-left" style={labelStyle}>Offerta</span>
            {expanded && (offertaOpen ? <ChevronDown size={13} className="flex-shrink-0 opacity-40" /> : <ChevronRight size={13} className="flex-shrink-0 opacity-40" />)}
          </button>
          {offertaOpen && expanded && (
            <div className="ml-5 mt-0.5 flex flex-col gap-0.5 border-l-2 border-[#1d1d1f]/10 pl-2.5">
              {OFFERTA_SUBMENU.map((sub) => (
                <Link key={sub.href} href={sub.href}>
                  <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all ${isActive(sub.href) ? "bg-[#f5f5f7] text-[#1d1d1f] font-semibold" : "hover:bg-[#f5f5f7] text-[#1d1d1f]/55 hover:text-[#1d1d1f]"}`}>
                    <span className="text-[12px]">{sub.icon}</span>
                    <span className="text-[12px] font-medium" style={{ fontFamily: SF }}>{sub.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── INFO LINKS ── */}
        {INFO_LINKS.map((ch) => {
          const isExternal = ch.href.startsWith("http") || ch.href.startsWith("mailto:");
          const inner = (
            <div
              className={`flex items-center gap-2.5 px-2 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                !isExternal && isActive(ch.href) ? "bg-[#1d1d1f] text-white" : "hover:bg-[#f5f5f7] text-[#1d1d1f]"
              }`}
              title={!expanded ? ch.label : undefined}
            >
              <span className="text-[14px] w-6 h-6 flex items-center justify-center flex-shrink-0">{ch.icon}</span>
              <span className="text-[13px] font-semibold leading-tight" style={labelStyle}>{ch.label}</span>
            </div>
          );
          return isExternal ? (
            <a key={ch.href + ch.label} href={ch.href} target={ch.href.startsWith("mailto:") ? "_self" : "_blank"} rel="noopener noreferrer">{inner}</a>
          ) : (
            <Link key={ch.href + ch.label} href={ch.href}>{inner}</Link>
          );
        })}
      </nav>

      {/* ══════════════════════════════════════════════════════════════
          SEZIONE CANALI
      ══════════════════════════════════════════════════════════════ */}
      <div className="mx-3 mb-2 border-t border-[#e5e5ea]" />

      {/* Header sezione Canali */}
      <div className="px-1.5 mb-1">
        <button
          onClick={() => expanded && setCanaliOpen(!canaliOpen)}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#f5f5f7] transition-all"
          title={!expanded ? "Canali" : undefined}
        >
          {/* Pallino rosso live */}
          <span className="w-6 h-6 flex items-center justify-center flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#dc2626] animate-pulse" />
          </span>
          <span
            className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1d1d1f]/40 flex-1 text-left"
            style={{ ...labelStyle, fontFamily: SF }}
          >
            Canali
          </span>
          {expanded && (canaliOpen
            ? <ChevronDown size={11} className="flex-shrink-0 opacity-30" />
            : <ChevronRight size={11} className="flex-shrink-0 opacity-30" />)}
        </button>
      </div>

      {/* Lista canali */}
      {(canaliOpen || !expanded) && (
        <nav className="flex flex-col gap-0.5 px-1.5">
          {CHANNELS.map(({ label, path, Icon, color }) => {
            const active = location === path || location.startsWith(path + "/");
            return (
              <Link key={path} href={path}>
                <div
                  className={`flex items-center gap-2.5 px-2 py-2 rounded-xl cursor-pointer transition-all duration-150 ${
                    active ? "bg-[#1d1d1f] text-white" : "hover:bg-[#f5f5f7] text-[#1d1d1f]"
                  }`}
                  title={!expanded ? label : undefined}
                >
                  <span
                    className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg transition-all`}
                    style={{
                      background: active ? "rgba(255,255,255,0.15)" : `${color}18`,
                    }}
                  >
                    <Icon size={13} strokeWidth={2.2} style={{ color: active ? "#ffffff" : color }} />
                  </span>
                  <span
                    className="text-[13px] font-semibold leading-tight"
                    style={labelStyle}
                  >
                    {label}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
      )}

      {/* Spazio flessibile */}
      <div className="flex-1" />

      {/* ── LinkedIn ── */}
      <div className="px-1.5 mb-3 mt-4">
        <a
          href="https://www.linkedin.com/company/proofpress/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-[#f0f7ff] transition-colors"
          style={{ border: "1px solid rgba(10,102,194,0.15)", background: "rgba(10,102,194,0.04)", overflow: "hidden" }}
          title={!expanded ? "ProofPress su LinkedIn" : undefined}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="#0a66c2" style={{ flexShrink: 0 }}>
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          <div style={{ flex: 1, minWidth: 0, ...fadeBlock }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#0a66c2", fontFamily: SF, lineHeight: 1.2 }}>ProofPress</div>
            <div style={{ fontSize: "10px", color: "rgba(29,29,31,0.45)", fontFamily: SF, lineHeight: 1.2 }}>Seguici su LinkedIn</div>
          </div>
          {expanded && (
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#0a66c2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.5 }}>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          )}
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
