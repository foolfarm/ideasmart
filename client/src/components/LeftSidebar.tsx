import { Link, useLocation } from "wouter";
import ReadersCounter from "@/components/ReadersCounter";
import { useState, useRef } from "react";
import {
  Monitor, CheckCircle, Newspaper, Megaphone, PenLine,
  KeyRound, Info, Mail, CircleDollarSign, ExternalLink, Download,
} from "lucide-react";

/* ─── FONT STACK ─────────────────────────────────────────────────────── */
const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Segoe UI', Arial, sans-serif";

/* ─── DIMENSIONI ─────────────────────────────────────────────────────── */
const COLLAPSED_W = 62;
const EXPANDED_W  = 248;

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

/* ─── VOCI MENU ─────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { href: "/piattaforma",       label: "Platform",          Icon: Monitor,          external: false },
  { href: "https://proofpress.tech/", label: "Demo Platform", Icon: ExternalLink,   external: true  },
  { href: "/proofpress-verify", label: "Verify",            Icon: CheckCircle,      external: false },
  { href: "/",                  label: "Magazine",          Icon: Newspaper,        external: false },
  { href: "/pubblicita",        label: "Advertise",         Icon: Megaphone,        external: false },
  { href: "/scrivi-per-noi",    label: "Contribute",        Icon: PenLine,          external: false },
  { href: "/journalist-portal", label: "Journalists Portal",Icon: KeyRound,         external: false },
  { href: "/cosa-facciamo",     label: "About",             Icon: Info,             external: false },
  { href: "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ProofPress_Brochure_a9cc5247.pdf", label: "Download Brochure", Icon: Download, external: true  },
  { href: "/contatti",          label: "Contact",           Icon: Mail,             external: false },
];

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
          NAV PRINCIPALE — 9 voci flat + 1 Invest
      ══════════════════════════════════════════════════════════════ */}
      <nav className="flex flex-col gap-0.5 px-2 mb-3">

        {NAV_ITEMS.map(({ href, label, Icon, external }) =>
          external ? (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-1 py-1.5 rounded-xl cursor-pointer transition-all duration-150 hover:bg-[#f5f5f7]"
              title={!expanded ? label : undefined}
            >
              <MenuIcon Icon={Icon} active={false} />
              <span className="text-[13px] font-semibold text-[#1d1d1f] flex items-center gap-1" style={labelStyle}>
                {label}
                <ExternalLink size={10} className="opacity-30 flex-shrink-0" />
              </span>
            </a>
          ) : (
            <Link key={href} href={href}>
              <div
                className="flex items-center gap-3 px-1 py-1.5 rounded-xl cursor-pointer transition-all duration-150 hover:bg-[#f5f5f7]"
                title={!expanded ? label : undefined}
              >
                <MenuIcon Icon={Icon} active={isActive(href)} />
                <span className="text-[13px] font-semibold text-[#1d1d1f]" style={labelStyle}>{label}</span>
              </div>
            </Link>
          )
        )}

        {/* INVEST — voce speciale arancio */}
        <Link href="/investor">
          <div
            className="flex items-center gap-3 px-1 py-1.5 rounded-xl cursor-pointer transition-all duration-150 hover:bg-[#fff3ee]"
            title={!expanded ? "Invest" : undefined}
          >
            <MenuIcon Icon={CircleDollarSign} active={false} orange />
            <div style={{ ...labelStyle, flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#ff5500", fontFamily: SF, lineHeight: 1.2 }}>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ff5500] animate-pulse mr-1.5 align-middle" />
                Invest
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
