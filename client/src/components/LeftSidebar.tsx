import { Link, useLocation } from "wouter";
import ReadersCounter from "@/components/ReadersCounter";
import { useState, useRef } from "react";
import {
  ChevronDown, ChevronRight,
  Home, Zap, BookOpen, Rocket, TrendingUp,
  Monitor, Briefcase, Building2, PenLine, Newspaper,
  Info, Mail, BookMarked,
} from "lucide-react";

/* ─── FONT STACK ─────────────────────────────────────────────────────── */
const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Segoe UI', Arial, sans-serif";

/* ─── CANALI (aggiornati ogni giorno dal sistema) ───────────────────── */
const CHANNELS = [
  {
    label: "Breaking News",
    path: "/ai",
    Icon: Zap,
    bg: "linear-gradient(135deg, #ff3b30 0%, #ff6b35 100%)",
    shadow: "rgba(220,38,38,0.35)",
  },
  {
    label: "Research",
    path: "/research",
    Icon: BookOpen,
    bg: "linear-gradient(135deg, #0071e3 0%, #34aadc 100%)",
    shadow: "rgba(0,113,227,0.35)",
  },
  {
    label: "Venture",
    path: "/startup",
    Icon: Rocket,
    bg: "linear-gradient(135deg, #ff9f0a 0%, #ffcc00 100%)",
    shadow: "rgba(255,159,10,0.35)",
  },
  {
    label: "Dealroom",
    path: "/dealroom",
    Icon: TrendingUp,
    bg: "linear-gradient(135deg, #34c759 0%, #30d158 100%)",
    shadow: "rgba(52,199,89,0.35)",
  },
];

/* ─── MENU PRINCIPALE ────────────────────────────────────────────────── */
const PIATTAFORMA_SUBMENU = [
  { label: "Piattaforma ProofPress", Icon: Monitor,   href: "/piattaforma",        external: false },
  { label: "Agentic Platform Demo",  Icon: Zap,       href: "https://ideasmart.technology", external: true },
  { label: "ProofPress Verify",      Icon: BookMarked,href: "/proofpress-verify",  external: false },
];

const OFFERTA_SUBMENU = [
  { label: "Creator & Giornalisti", Icon: PenLine,  href: "/offerta/creator" },
  { label: "Testate & Editori",     Icon: Newspaper,href: "/offerta/editori" },
  { label: "Aziende & Corporate",   Icon: Building2,href: "/offerta/aziende" },
];

const INFO_LINKS = [
  { label: "Chi siamo",         Icon: Info,    href: "/chi-siamo-story",              external: false },
  { label: "Pubblicizza",       Icon: Briefcase,href: "/pubblicita",                  external: false },
  { label: "Collezione Prompt", Icon: BookMarked,href: "https://promptcollection2026.com/", external: true },
  { label: "Contatti",          Icon: Mail,    href: "mailto:info@proofpress.ai",     external: true },
];

/* ─── DIMENSIONI ─────────────────────────────────────────────────────── */
const COLLAPSED_W = 60;
const EXPANDED_W  = 232;

/* ─── ICONA GRANDE stile iOS ─────────────────────────────────────────── */
function BigIcon({
  Icon,
  bg,
  shadow,
  active,
  size = 18,
}: {
  Icon: React.ElementType;
  bg: string;
  shadow: string;
  active?: boolean;
  size?: number;
}) {
  return (
    <span
      className="flex-shrink-0 flex items-center justify-center rounded-[10px]"
      style={{
        width: 36,
        height: 36,
        background: active ? bg : bg,
        boxShadow: `0 3px 10px ${shadow}`,
        transition: "box-shadow 0.2s ease, transform 0.15s ease",
      }}
    >
      <Icon size={size} strokeWidth={2} color="#ffffff" />
    </span>
  );
}

/* ─── ICONA PICCOLA stile iOS (menu/info) ────────────────────────────── */
function SmallIcon({
  Icon,
  bg,
  active,
}: {
  Icon: React.ElementType;
  bg: string;
  active?: boolean;
}) {
  return (
    <span
      className="flex-shrink-0 flex items-center justify-center rounded-[8px]"
      style={{
        width: 30,
        height: 30,
        background: active ? "#1d1d1f" : bg,
        transition: "background 0.15s ease",
      }}
    >
      <Icon size={14} strokeWidth={2} color={active ? "#ffffff" : "#ffffff"} />
    </span>
  );
}

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
        boxShadow: expanded ? "3px 0 20px rgba(0,0,0,0.08)" : "none",
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
      <div className="px-3 mb-5" style={{ ...fadeBlock, whiteSpace: "normal" }}>
        <p style={{ fontSize: "12px", color: "rgba(29,29,31,0.55)", lineHeight: 1.6, fontFamily: SF }}>
          ProofPress Magazine — AI Journalism certificato.{" "}
          <Link href="/offerta/creator"><span style={{ color: "#0071e3", fontWeight: 700, cursor: "pointer" }}>Creator</span></Link>,{" "}
          <Link href="/offerta/aziende"><span style={{ color: "#0071e3", fontWeight: 700, cursor: "pointer" }}>aziende</span></Link>{" "}ed{" "}
          <Link href="/offerta/editori"><span style={{ color: "#0071e3", fontWeight: 700, cursor: "pointer" }}>editori</span></Link>.
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          NAV PRINCIPALE
      ══════════════════════════════════════════════════════════════ */}
      <nav className="flex flex-col gap-1 px-2 mb-3">

        {/* ── HOME ── */}
        <Link href="/">
          <div
            className={`flex items-center gap-3 px-1.5 py-1.5 rounded-xl cursor-pointer transition-all duration-150 ${
              location === "/" ? "bg-[#f5f5f7]" : "hover:bg-[#f5f5f7]"
            }`}
            title={!expanded ? "Home" : undefined}
          >
            <SmallIcon
              Icon={Home}
              bg="linear-gradient(135deg, #636366 0%, #48484a 100%)"
              active={location === "/"}
            />
            <span className="text-[13px] font-semibold text-[#1d1d1f] leading-tight" style={labelStyle}>Home</span>
          </div>
        </Link>

        {/* ── PIATTAFORMA ── */}
        <div>
          <button
            onClick={() => expanded && setPiattaformaOpen(!piattaformaOpen)}
            className={`w-full flex items-center gap-3 px-1.5 py-1.5 rounded-xl cursor-pointer transition-all duration-150 ${
              location.startsWith("/proofpress-verify") || location.startsWith("/piattaforma")
                ? "bg-[#f5f5f7]" : "hover:bg-[#f5f5f7]"
            }`}
            title={!expanded ? "Piattaforma" : undefined}
          >
            <SmallIcon Icon={Monitor} bg="linear-gradient(135deg, #5e5ce6 0%, #7c7aff 100%)" active={location.startsWith("/piattaforma")} />
            <span className="text-[13px] font-semibold text-[#1d1d1f] leading-tight flex-1 text-left" style={labelStyle}>Piattaforma</span>
            {expanded && (piattaformaOpen ? <ChevronDown size={13} className="flex-shrink-0 opacity-35 mr-1" /> : <ChevronRight size={13} className="flex-shrink-0 opacity-35 mr-1" />)}
          </button>
          {piattaformaOpen && expanded && (
            <div className="ml-10 mt-0.5 flex flex-col gap-0.5 border-l-2 border-[#1d1d1f]/8 pl-2.5">
              {PIATTAFORMA_SUBMENU.map((sub) =>
                sub.external ? (
                  <a key={sub.href} href={sub.href} target="_blank" rel="noopener noreferrer">
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#f5f5f7] text-[#1d1d1f]/55 hover:text-[#1d1d1f] transition-all cursor-pointer">
                      <sub.Icon size={12} strokeWidth={2} />
                      <span className="text-[12px] font-medium" style={{ fontFamily: SF }}>{sub.label}</span>
                    </div>
                  </a>
                ) : (
                  <Link key={sub.href} href={sub.href}>
                    <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all cursor-pointer ${isActive(sub.href) ? "bg-[#f5f5f7] text-[#1d1d1f]" : "hover:bg-[#f5f5f7] text-[#1d1d1f]/55 hover:text-[#1d1d1f]"}`}>
                      <sub.Icon size={12} strokeWidth={2} />
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
            className={`w-full flex items-center gap-3 px-1.5 py-1.5 rounded-xl cursor-pointer transition-all duration-150 ${
              location.startsWith("/offerta") ? "bg-[#f5f5f7]" : "hover:bg-[#f5f5f7]"
            }`}
            title={!expanded ? "Offerta" : undefined}
          >
            <SmallIcon Icon={Briefcase} bg="linear-gradient(135deg, #ff9f0a 0%, #ff6b00 100%)" active={location.startsWith("/offerta")} />
            <span className="text-[13px] font-semibold text-[#1d1d1f] leading-tight flex-1 text-left" style={labelStyle}>Offerta</span>
            {expanded && (offertaOpen ? <ChevronDown size={13} className="flex-shrink-0 opacity-35 mr-1" /> : <ChevronRight size={13} className="flex-shrink-0 opacity-35 mr-1" />)}
          </button>
          {offertaOpen && expanded && (
            <div className="ml-10 mt-0.5 flex flex-col gap-0.5 border-l-2 border-[#1d1d1f]/8 pl-2.5">
              {OFFERTA_SUBMENU.map((sub) => (
                <Link key={sub.href} href={sub.href}>
                  <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all cursor-pointer ${isActive(sub.href) ? "bg-[#f5f5f7] text-[#1d1d1f]" : "hover:bg-[#f5f5f7] text-[#1d1d1f]/55 hover:text-[#1d1d1f]"}`}>
                    <sub.Icon size={12} strokeWidth={2} />
                    <span className="text-[12px] font-medium" style={{ fontFamily: SF }}>{sub.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── INFO LINKS ── */}
        {INFO_LINKS.map((ch) => {
          const bgMap: Record<string, string> = {
            "Chi siamo":         "linear-gradient(135deg, #636366 0%, #48484a 100%)",
            "Pubblicizza":       "linear-gradient(135deg, #ff3b30 0%, #ff6b35 100%)",
            "Collezione Prompt": "linear-gradient(135deg, #0071e3 0%, #34aadc 100%)",
            "Contatti":          "linear-gradient(135deg, #34c759 0%, #30d158 100%)",
          };
          const inner = (
            <div
              className={`flex items-center gap-3 px-1.5 py-1.5 rounded-xl cursor-pointer transition-all duration-150 ${
                !ch.external && isActive(ch.href) ? "bg-[#f5f5f7]" : "hover:bg-[#f5f5f7]"
              }`}
              title={!expanded ? ch.label : undefined}
            >
              <SmallIcon Icon={ch.Icon} bg={bgMap[ch.label] || "linear-gradient(135deg,#636366,#48484a)"} active={!ch.external && isActive(ch.href)} />
              <span className="text-[13px] font-semibold text-[#1d1d1f] leading-tight" style={labelStyle}>{ch.label}</span>
            </div>
          );
          return ch.external ? (
            <a key={ch.href + ch.label} href={ch.href} target={ch.href.startsWith("mailto:") ? "_self" : "_blank"} rel="noopener noreferrer">{inner}</a>
          ) : (
            <Link key={ch.href + ch.label} href={ch.href}>{inner}</Link>
          );
        })}
      </nav>

      {/* ══════════════════════════════════════════════════════════════
          SEZIONE CANALI — icone grandi stile iOS
      ══════════════════════════════════════════════════════════════ */}
      <div className="mx-3 mb-2 border-t border-[#e5e5ea]" />

      {/* Header CANALI */}
      <div className="px-2 mb-2">
        <button
          onClick={() => expanded && setCanaliOpen(!canaliOpen)}
          className="w-full flex items-center gap-3 px-1.5 py-1 rounded-lg hover:bg-[#f5f5f7] transition-all"
          title={!expanded ? "Canali" : undefined}
        >
          <span className="w-[36px] flex items-center justify-center flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#dc2626] animate-pulse" />
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1d1d1f]/35 flex-1 text-left" style={{ ...labelStyle, fontFamily: SF }}>
            Canali
          </span>
          {expanded && (canaliOpen
            ? <ChevronDown size={11} className="flex-shrink-0 opacity-25 mr-1" />
            : <ChevronRight size={11} className="flex-shrink-0 opacity-25 mr-1" />)}
        </button>
      </div>

      {/* Lista canali con icone grandi */}
      {(canaliOpen || !expanded) && (
        <nav className="flex flex-col gap-1.5 px-2 pb-2">
          {CHANNELS.map(({ label, path, Icon, bg, shadow }) => {
            const active = location === path || location.startsWith(path + "/");
            return (
              <Link key={path} href={path}>
                <div
                  className={`flex items-center gap-3 px-1.5 py-1.5 rounded-xl cursor-pointer transition-all duration-150 group ${
                    active ? "bg-[#f5f5f7]" : "hover:bg-[#f5f5f7]"
                  }`}
                  title={!expanded ? label : undefined}
                  style={{ minHeight: 48 }}
                >
                  <BigIcon Icon={Icon} bg={bg} shadow={shadow} active={active} />
                  <div className="flex flex-col min-w-0" style={labelStyle}>
                    <span className="text-[13px] font-bold text-[#1d1d1f] leading-tight">{label}</span>
                    <span className="text-[10px] text-[#1d1d1f]/40 leading-tight mt-0.5">Aggiornato oggi</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>
      )}

      {/* Spazio flessibile */}
      <div className="flex-1" />

      {/* ── LinkedIn ── */}
      <div className="px-2 mb-3 mt-3">
        <a
          href="https://www.linkedin.com/company/proofpress/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-1.5 py-1.5 rounded-xl hover:bg-[#f0f7ff] transition-colors"
          style={{ border: "1px solid rgba(10,102,194,0.15)", background: "rgba(10,102,194,0.04)" }}
          title={!expanded ? "ProofPress su LinkedIn" : undefined}
        >
          <span
            className="flex-shrink-0 flex items-center justify-center rounded-[8px]"
            style={{ width: 30, height: 30, background: "linear-gradient(135deg,#0a66c2,#0077b5)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#ffffff">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </span>
          <div style={{ flex: 1, minWidth: 0, ...fadeBlock }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#0a66c2", fontFamily: SF, lineHeight: 1.2 }}>ProofPress</div>
            <div style={{ fontSize: "10px", color: "rgba(29,29,31,0.4)", fontFamily: SF, lineHeight: 1.2 }}>Seguici su LinkedIn</div>
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
