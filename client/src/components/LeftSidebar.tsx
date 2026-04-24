import { Link, useLocation } from "wouter";
import ReadersCounter from "@/components/ReadersCounter";
import { useState, useRef } from "react";
import {
  Info, Briefcase, Megaphone, PenLine, Mail, User,
  ExternalLink, Download, ChevronRight,
  Newspaper, KeyRound, Building2, CheckCircle, Users,
} from "lucide-react";

/* ─── FONT STACK ─────────────────────────────────────────────────────── */
const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Segoe UI', Arial, sans-serif";

/* ─── DIMENSIONI ─────────────────────────────────────────────────────── */
const COLLAPSED_W = 62;
const EXPANDED_W  = 260;

/* ─── ICONA MENU ─────────────────────────────────────────────────────── */
function MenuIcon({ Icon, active, orange }: { Icon: React.ElementType; active: boolean; orange?: boolean }) {
  return (
    <span
      className="flex-shrink-0 flex items-center justify-center"
      style={{
        width: 32, height: 32, borderRadius: 9,
        background: orange ? "rgba(255,85,0,0.12)" : active ? "#1d1d1f" : "#f2f2f7",
        transition: "background 0.15s ease",
      }}
    >
      <Icon
        size={15}
        strokeWidth={1.9}
        color={orange ? "#ff5500" : active ? "#ffffff" : "#48484a"}
      />
    </span>
  );
}

/* ─── STRUTTURA MENU ─────────────────────────────────────────────────── */
type NavItem =
  | { type: "link"; href: string; label: string; Icon: React.ElementType; external?: boolean }
  | { type: "group"; label: string; Icon: React.ElementType; children: { href: string; label: string; external?: boolean }[] };

const NAV_STRUCTURE: NavItem[] = [
  {
    type: "group",
    label: "Chi Siamo",
    Icon: Info,
    children: [
      { href: "/cosa-facciamo", label: "Chi Siamo" },
      { href: "/chi-siamo-story", label: "Storia" },
    ],
  },
  {
    type: "group",
    label: "Offerta",
    Icon: Briefcase,
    children: [
      { href: "/offertacommerciale", label: "Redazione Agentica" },
      { href: "/newsletter-agentica", label: "Newsletter Agentica" },
      { href: "/proofpress-verify", label: "Certificazione Notizie" },
      { href: "/verify-business", label: "Certificazione Informazioni" },
      {
        href: "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ProofPress_Brochure_a9cc5247.pdf",
        label: "Download Brochure",
        external: true,
      },
    ],
  },
  { type: "link", href: "/pubblicita", label: "Advertise", Icon: Megaphone },
  {
    type: "group",
    label: "Scrivi per noi",
    Icon: PenLine,
    children: [
      { href: "/scrivi-per-noi", label: "Scrivi per noi" },
      { href: "/journalist-portal", label: "Portale Giornalisti" },
    ],
  },
  { type: "link", href: "/contatti", label: "Contatti", Icon: Mail },
  { type: "link", href: "/osservatorio-tech", label: "Osservatorio Tech", Icon: User },
];

/* ─── VOCE SEMPLICE ─────────────────────────────────────────────────── */
function NavLink({
  href, label, Icon, external, active, expanded, labelStyle,
}: {
  href: string; label: string; Icon: React.ElementType;
  external?: boolean; active: boolean; expanded: boolean;
  labelStyle: React.CSSProperties;
}) {
  const inner = (
    <div
      className="flex items-center gap-3 px-1 py-1.5 rounded-xl cursor-pointer transition-all duration-150 hover:bg-[#f5f5f7]"
      title={!expanded ? label : undefined}
    >
      <MenuIcon Icon={Icon} active={active} />
      <span className="text-[13px] font-semibold text-[#1d1d1f] flex items-center gap-1" style={labelStyle}>
        {label}
        {external && <ExternalLink size={10} className="opacity-30 flex-shrink-0" />}
      </span>
    </div>
  );
  if (external) {
    return <a href={href} target="_blank" rel="noopener noreferrer">{inner}</a>;
  }
  return <Link href={href}>{inner}</Link>;
}

/* ─── GRUPPO CON SOTTOMENU ───────────────────────────────────────────── */
function NavGroup({
  label, Icon, children, expanded, labelStyle, isAnyChildActive,
}: {
  label: string; Icon: React.ElementType;
  children: { href: string; label: string; external?: boolean }[];
  expanded: boolean; labelStyle: React.CSSProperties; isAnyChildActive: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* Voce principale */}
      <div
        className="flex items-center gap-3 px-1 py-1.5 rounded-xl cursor-pointer transition-all duration-150 hover:bg-[#f5f5f7]"
        title={!expanded ? label : undefined}
        onClick={() => expanded && setOpen(o => !o)}
      >
        <MenuIcon Icon={Icon} active={isAnyChildActive} />
        <span className="text-[13px] font-semibold text-[#1d1d1f] flex-1" style={labelStyle}>{label}</span>
        {expanded && (
          <ChevronRight
            size={13}
            strokeWidth={2}
            color="#8e8e93"
            style={{
              transform: open ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 180ms ease",
              flexShrink: 0,
            }}
          />
        )}
      </div>

      {/* Sottovoci */}
      {expanded && open && (
        <div className="ml-10 flex flex-col gap-0 mt-0.5 mb-1">
          {children.map(({ href, label: childLabel, external }) => {
            const inner = (
              <div
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all duration-150 hover:bg-[#f5f5f7]"
              >
                <span
                  style={{
                    fontFamily: SF,
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#3a3a3c",
                    whiteSpace: "nowrap",
                  }}
                >
                  {childLabel}
                </span>
                {external && <ExternalLink size={9} className="opacity-30 flex-shrink-0" />}
              </div>
            );
            if (external) {
              return (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer">
                  {inner}
                </a>
              );
            }
            return <Link key={href} href={href}>{inner}</Link>;
          })}
        </div>
      )}
    </div>
  );
}

/* ─── COMPONENTE PRINCIPALE ─────────────────────────────────────────── */
export default function LeftSidebar() {
  const [location] = useLocation();
  const [hovered, setHovered] = useState(false);
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
    if (href.startsWith("http")) return false;
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
        <p style={{ fontSize: "11.5px", color: "rgba(29,29,31,0.5)", lineHeight: 1.65, fontFamily: SF }}>
          ProofPress Magazine nato in California come un bulletin board privato nasce dalla piattaforma ProofPress, la prima tecnologia di AI Journalism certificata con hash crittografico SHA-256 e archiviata su IPFS. Vogliamo costruire un mondo con informazione certa e sicura.
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          NAV PRINCIPALE
      ══════════════════════════════════════════════════════════════ */}
      <nav className="flex flex-col gap-0.5 px-2 mb-3">

        {NAV_STRUCTURE.map((item, i) => {
          if (item.type === "link") {
            return (
              <NavLink
                key={i}
                href={item.href}
                label={item.label}
                Icon={item.Icon}
                external={item.external}
                active={isActive(item.href)}
                expanded={expanded}
                labelStyle={labelStyle}
              />
            );
          }
          // group
          const isAnyChildActive = item.children.some(c => !c.external && isActive(c.href));
          return (
            <NavGroup
              key={i}
              label={item.label}
              Icon={item.Icon}
              children={item.children}
              expanded={expanded}
              labelStyle={labelStyle}
              isAnyChildActive={isAnyChildActive}
            />
          );
        })}

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
