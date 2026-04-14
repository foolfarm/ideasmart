import { Link, useLocation } from "wouter";
import ReadersCounter from "@/components/ReadersCounter";
import { useState, useRef } from "react";
import {
  ChevronDown, ChevronRight,
  Home, Zap, BookOpen, Rocket, TrendingUp,
  Monitor, Briefcase, Info, Mail, BookMarked,
  PenLine, Newspaper, Building2, CircleDollarSign,
} from "lucide-react";

/* ─── FONT STACK ─────────────────────────────────────────────────────── */
const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Segoe UI', Arial, sans-serif";

/* ─── CANALI (aggiornati ogni giorno) ────────────────────────────────── */
const CHANNELS = [
  { label: "Breaking News", sublabel: "AI & Tech",      path: "/ai",       Icon: Zap        },
  { label: "Research",      sublabel: "Analisi & Dati", path: "/research", Icon: BookOpen   },
  { label: "Venture",       sublabel: "Startup",        path: "/startup",  Icon: Rocket     },
  { label: "Dealroom",      sublabel: "Investimenti",   path: "/dealroom", Icon: TrendingUp },
];

/* ─── MENU PRINCIPALE ────────────────────────────────────────────────── */
const PIATTAFORMA_SUBMENU = [
  { label: "Piattaforma ProofPress", Icon: Monitor,    href: "/piattaforma",                 external: false },
  { label: "Agentic Platform Demo",  Icon: Zap,        href: "https://proofpress.tech/", external: true  },
  { label: "ProofPress Verify",      Icon: BookMarked, href: "/proofpress-verify",           external: false },
];

const OFFERTA_SUBMENU = [
  { label: "Creator & Giornalisti", Icon: PenLine,   href: "/offerta/creator" },
  { label: "Testate & Editori",     Icon: Newspaper, href: "/offerta/editori" },
  { label: "Aziende & Corporate",   Icon: Building2, href: "/offerta/aziende" },
];

const INFO_LINKS = [
  { label: "Investor — Pre-Seed Open", Icon: CircleDollarSign, href: "/investor", external: false, badge: true },
  { label: "Chi siamo",         Icon: Info,       href: "/chi-siamo-story",                  external: false },
  { label: "Pubblicizza",       Icon: Briefcase,  href: "/pubblicita",                       external: false },
  { label: "Collezione Prompt", Icon: BookMarked, href: "https://promptcollection2026.com/", external: true  },
  { label: "Contatti",          Icon: Mail,       href: "mailto:info@proofpress.ai",         external: true  },
];

/* ─── DIMENSIONI ─────────────────────────────────────────────────────── */
const COLLAPSED_W = 62;
const EXPANDED_W  = 236;

/* ─────────────────────────────────────────────────────────────────────
   ICONA CANALE — grande, monocromatica, stile Apple SF Symbols
   Stato normale:  sfondo #f2f2f7 (Apple grey-50), icona #3a3a3c
   Stato attivo:   sfondo #1d1d1f (Apple black),   icona #ffffff
   Hover:          sfondo #e5e5ea
───────────────────────────────────────────────────────────────────── */
function ChannelIcon({
  Icon,
  active,
}: {
  Icon: React.ElementType;
  active: boolean;
}) {
  return (
    <span
      className="flex-shrink-0 flex items-center justify-center"
      style={{
        width: 38,
        height: 38,
        borderRadius: 12,
        background: active ? "#1d1d1f" : "#f2f2f7",
        transition: "background 0.15s ease",
      }}
    >
      <Icon
        size={19}
        strokeWidth={1.8}
        color={active ? "#ffffff" : "#3a3a3c"}
      />
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   ICONA MENU — media, monocromatica
   Normale: sfondo #f2f2f7, icona #48484a
   Attivo:  sfondo #1d1d1f, icona #ffffff
───────────────────────────────────────────────────────────────────── */
function MenuIcon({
  Icon,
  active,
}: {
  Icon: React.ElementType;
  active: boolean;
}) {
  return (
    <span
      className="flex-shrink-0 flex items-center justify-center"
      style={{
        width: 32,
        height: 32,
        borderRadius: 9,
        background: active ? "#1d1d1f" : "#f2f2f7",
        transition: "background 0.15s ease",
      }}
    >
      <Icon
        size={15}
        strokeWidth={1.9}
        color={active ? "#ffffff" : "#48484a"}
      />
    </span>
  );
}

export default function LeftSidebar() {
  const [location] = useLocation();
  const [hovered, setHovered] = useState(false);
  const [offertaOpen, setOffertaOpen]     = useState(location.startsWith("/offerta"));
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

  /* helpers */
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
        boxShadow: expanded ? "3px 0 20px rgba(0,0,0,0.07)" : "none",
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
        <p style={{ fontSize: "12px", color: "rgba(29,29,31,0.5)", lineHeight: 1.6, fontFamily: SF }}>
          ProofPress Magazine nasce dalla piattaforma ProofPress, la prima tecnologia di AI Journalism certificato. Crea la tua testata AI-native: scopri l&apos;offerta per{" "}
          <Link href="/offerta/creator"><span style={{ color: "#0071e3", fontWeight: 700, cursor: "pointer" }}>creator</span></Link>,{" "}
          <Link href="/offerta/aziende"><span style={{ color: "#0071e3", fontWeight: 700, cursor: "pointer" }}>aziende</span></Link>{" "}ed{" "}
          <Link href="/offerta/editori"><span style={{ color: "#0071e3", fontWeight: 700, cursor: "pointer" }}>editori</span></Link>.
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          NAV PRINCIPALE
      ══════════════════════════════════════════════════════════════ */}
      <nav className="flex flex-col gap-0.5 px-2 mb-3">

        {/* HOME */}
        <Link href="/">
          <div
            className="flex items-center gap-3 px-1 py-1.5 rounded-xl cursor-pointer transition-all duration-150 hover:bg-[#f5f5f7]"
            title={!expanded ? "Home" : undefined}
          >
            <MenuIcon Icon={Home} active={location === "/"} />
            <span className="text-[13px] font-semibold text-[#1d1d1f]" style={labelStyle}>Home</span>
          </div>
        </Link>

        {/* PIATTAFORMA */}
        <div>
          <button
            onClick={() => expanded && setPiattaformaOpen(!piattaformaOpen)}
            className="w-full flex items-center gap-3 px-1 py-1.5 rounded-xl cursor-pointer transition-all duration-150 hover:bg-[#f5f5f7]"
            title={!expanded ? "Piattaforma" : undefined}
          >
            <MenuIcon Icon={Monitor} active={location.startsWith("/piattaforma") || location.startsWith("/proofpress-verify")} />
            <span className="text-[13px] font-semibold text-[#1d1d1f] flex-1 text-left" style={labelStyle}>Piattaforma</span>
            {expanded && (piattaformaOpen
              ? <ChevronDown size={12} className="flex-shrink-0 opacity-30 mr-1" />
              : <ChevronRight size={12} className="flex-shrink-0 opacity-30 mr-1" />)}
          </button>
          {piattaformaOpen && expanded && (
            <div className="ml-11 mt-0.5 flex flex-col gap-0.5 border-l border-[#e5e5ea] pl-3">
              {PIATTAFORMA_SUBMENU.map((sub) =>
                sub.external ? (
                  <a key={sub.href} href={sub.href} target="_blank" rel="noopener noreferrer">
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#f5f5f7] text-[#6e6e73] hover:text-[#1d1d1f] transition-all cursor-pointer">
                      <sub.Icon size={11} strokeWidth={2} />
                      <span className="text-[12px] font-medium" style={{ fontFamily: SF }}>{sub.label}</span>
                    </div>
                  </a>
                ) : (
                  <Link key={sub.href} href={sub.href}>
                    <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all cursor-pointer ${isActive(sub.href) ? "text-[#1d1d1f] font-semibold" : "text-[#6e6e73] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"}`}>
                      <sub.Icon size={11} strokeWidth={2} />
                      <span className="text-[12px] font-medium" style={{ fontFamily: SF }}>{sub.label}</span>
                    </div>
                  </Link>
                )
              )}
            </div>
          )}
        </div>

        {/* OFFERTA */}
        <div>
          <button
            onClick={() => expanded && setOffertaOpen(!offertaOpen)}
            className="w-full flex items-center gap-3 px-1 py-1.5 rounded-xl cursor-pointer transition-all duration-150 hover:bg-[#f5f5f7]"
            title={!expanded ? "Offerta" : undefined}
          >
            <MenuIcon Icon={Briefcase} active={location.startsWith("/offerta")} />
            <span className="text-[13px] font-semibold text-[#1d1d1f] flex-1 text-left" style={labelStyle}>Offerta</span>
            {expanded && (offertaOpen
              ? <ChevronDown size={12} className="flex-shrink-0 opacity-30 mr-1" />
              : <ChevronRight size={12} className="flex-shrink-0 opacity-30 mr-1" />)}
          </button>
          {offertaOpen && expanded && (
            <div className="ml-11 mt-0.5 flex flex-col gap-0.5 border-l border-[#e5e5ea] pl-3">
              {OFFERTA_SUBMENU.map((sub) => (
                <Link key={sub.href} href={sub.href}>
                  <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all cursor-pointer ${isActive(sub.href) ? "text-[#1d1d1f] font-semibold" : "text-[#6e6e73] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"}`}>
                    <sub.Icon size={11} strokeWidth={2} />
                    <span className="text-[12px] font-medium" style={{ fontFamily: SF }}>{sub.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* INFO LINKS */}
        {INFO_LINKS.map((ch) => {
          const inner = (
            <div
              className="flex items-center gap-3 px-1 py-1.5 rounded-xl cursor-pointer transition-all duration-150 hover:bg-[#f5f5f7]"
              title={!expanded ? ch.label : undefined}
              style={(ch as any).badge ? { background: "rgba(255,85,0,0.07)" } : undefined}
            >
              <span
                className="flex-shrink-0 flex items-center justify-center"
                style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: (ch as any).badge ? "rgba(255,85,0,0.15)" : ((!ch.external && isActive(ch.href)) ? "#1d1d1f" : "#f2f2f7"),
                  transition: "background 0.15s ease",
                }}
              >
                <ch.Icon size={15} strokeWidth={1.9} color={(ch as any).badge ? "#ff5500" : ((!ch.external && isActive(ch.href)) ? "#ffffff" : "#1d1d1f")} />
              </span>
              <span
                className="text-[13px] font-semibold"
                style={{ ...labelStyle, color: (ch as any).badge ? "#ff5500" : "#1d1d1f" }}
              >
                {(ch as any).badge && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ff5500] animate-pulse mr-1.5 align-middle" />
                )}
                {ch.label}
              </span>
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
          SEZIONE CANALI — icone grandi monocromatiche
      ══════════════════════════════════════════════════════════════ */}
      <div className="mx-3 mb-2 border-t border-[#e5e5ea]" />

      {/* Header CANALI */}
      <div className="px-2 mb-1.5">
        <button
          onClick={() => expanded && setCanaliOpen(!canaliOpen)}
          className="w-full flex items-center gap-3 px-1 py-1 rounded-lg hover:bg-[#f5f5f7] transition-all"
          title={!expanded ? "Canali" : undefined}
        >
          <span className="w-[38px] flex items-center justify-center flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1d1d1f] opacity-40" />
          </span>
          <span
            className="text-[10px] font-black uppercase tracking-[0.22em] text-[#1d1d1f]/35 flex-1 text-left"
            style={{ ...labelStyle, fontFamily: SF }}
          >
            Canali
          </span>
          {expanded && (canaliOpen
            ? <ChevronDown size={11} className="flex-shrink-0 opacity-25 mr-1" />
            : <ChevronRight size={11} className="flex-shrink-0 opacity-25 mr-1" />)}
        </button>
      </div>

      {/* Lista canali */}
      {(canaliOpen || !expanded) && (
        <nav className="flex flex-col gap-1 px-2 pb-2">
          {CHANNELS.map(({ label, sublabel, path, Icon }) => {
            const active = location === path || location.startsWith(path + "/");
            return (
              <Link key={path} href={path}>
                <div
                  className="flex items-center gap-3 px-1 py-1.5 rounded-xl cursor-pointer transition-all duration-150 hover:bg-[#f5f5f7]"
                  title={!expanded ? label : undefined}
                  style={{ minHeight: 52 }}
                >
                  <ChannelIcon Icon={Icon} active={active} />
                  <div className="flex flex-col min-w-0" style={labelStyle}>
                    <span
                      className="text-[13px] font-bold leading-tight"
                      style={{ color: active ? "#1d1d1f" : "#1d1d1f", fontFamily: SF }}
                    >
                      {label}
                    </span>
                    <span
                      className="text-[10px] leading-tight mt-0.5"
                      style={{ color: "#8e8e93", fontFamily: SF }}
                    >
                      {sublabel}
                    </span>
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
          className="flex items-center gap-3 px-1 py-1.5 rounded-xl hover:bg-[#f5f5f7] transition-colors cursor-pointer"
          title={!expanded ? "LinkedIn" : undefined}
        >
          {/* Icona LinkedIn monocromatica */}
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
