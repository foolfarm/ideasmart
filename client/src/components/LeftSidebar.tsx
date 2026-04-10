import { Link, useLocation } from "wouter";
import ReadersCounter from "@/components/ReadersCounter";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface SidebarChannel {
  label: string;
  icon: string;
  href: string;
}

/* ─── SEZIONE INFO ────────────────────────────────────────────────────── */
const INFO_LINKS: SidebarChannel[] = [
  { label: "Chi siamo",   icon: "🏗️", href: "/chi-siamo-story" },
  { label: "Pubblicizza", icon: "📣", href: "/pubblicita" },
  { label: "Contatti",    icon: "✉️", href: "mailto:info@proofpress.ai" },
];

const PIATTAFORMA_SUBMENU = [
  { label: "Agentic Platform Demo", icon: "🎯", href: "https://ideasmart.technology", external: true },
  { label: "ProofPress Verify",     icon: "✅", href: "/proofpress-verify", external: false },
];

const OFFERTA_SUBMENU = [
  { label: "Creator & Giornalisti", icon: "✍️", href: "/offerta/creator" },
  { label: "Testate & Editori",     icon: "📰", href: "/offerta/editori" },
  { label: "Aziende & Corporate",   icon: "🏢", href: "/offerta/aziende" },
];

export default function LeftSidebar() {
  const [location] = useLocation();
  const [offertaOpen, setOffertaOpen] = useState(
    location.startsWith("/offerta")
  );
  const [piattaformaOpen, setPiattaformaOpen] = useState(
    location.startsWith("/proofpress-verify")
  );

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <aside
      className="hidden lg:flex flex-col w-[200px] flex-shrink-0"
      style={{
        position: "sticky",
        top: "0",
        height: "100vh",
        overflowY: "auto",
        background: "#faf8f3",
        borderRight: "1px solid rgba(26,26,26,0.08)",
        paddingTop: "16px",
        paddingBottom: "32px",
        scrollbarWidth: "none",
      }}
    >
      {/* Logo — "Chi siamo" come titolo cliccabile */}
      <div className="px-4 mb-4">
        <Link href="/chi-siamo-story">
          <div className="cursor-pointer">
            <div
              style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
            <div
              className="font-black text-[#1a1a1a]"
              style={{ fontSize: "20px" }}
            >
              Menu
            </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-4 mb-3 border-t-[2px] border-[#1a1a1a]" />

      {/* Sezione info */}
      <nav className="flex flex-col gap-0.5 px-2 mb-4">

        {/* Voce Piattaforma con submenu */}
        <div>
          <button
            onClick={() => setPiattaformaOpen(!piattaformaOpen)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-all duration-150 ${
              location.startsWith("/proofpress-verify")
                ? "bg-[#1a1a1a] text-white"
                : "hover:bg-[#1a1a1a]/6 text-[#1a1a1a]/70 hover:text-[#1a1a1a]"
            }`}
          >
            <span className="text-[13px] w-4 text-center flex-shrink-0">🖥️</span>
            <span
              className="text-[12px] font-medium leading-tight flex-1 text-left"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Arial, sans-serif" }}
            >
              Piattaforma
            </span>
            {piattaformaOpen
              ? <ChevronDown size={12} className="flex-shrink-0 opacity-60" />
              : <ChevronRight size={12} className="flex-shrink-0 opacity-60" />}
          </button>
          {piattaformaOpen && (
            <div className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-[#1a1a1a]/10 pl-2">
              {PIATTAFORMA_SUBMENU.map((sub) => (
                sub.external ? (
                  <a key={sub.href} href={sub.href} target="_blank" rel="noopener noreferrer">
                    <div className="flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer transition-all duration-150 hover:bg-[#1a1a1a]/6 text-[#1a1a1a]/60 hover:text-[#1a1a1a]">
                      <span className="text-[11px] w-3 text-center flex-shrink-0">{sub.icon}</span>
                      <span className="text-[11px] font-medium leading-tight" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Arial, sans-serif" }}>{sub.label}</span>
                    </div>
                  </a>
                ) : (
                  <Link key={sub.href} href={sub.href}>
                    <div className={`flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer transition-all duration-150 ${
                      isActive(sub.href) ? "bg-[#ff5500] text-white" : "hover:bg-[#1a1a1a]/6 text-[#1a1a1a]/60 hover:text-[#1a1a1a]"
                    }`}>
                      <span className="text-[11px] w-3 text-center flex-shrink-0">{sub.icon}</span>
                      <span className="text-[11px] font-medium leading-tight" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Arial, sans-serif" }}>{sub.label}</span>
                    </div>
                  </Link>
                )
              ))}
            </div>
          )}
        </div>

        {/* Voce Offerta con submenu */}
        <div>
          <button
            onClick={() => setOffertaOpen(!offertaOpen)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-all duration-150 ${
              location.startsWith("/offerta")
                ? "bg-[#1a1a1a] text-white"
                : "hover:bg-[#1a1a1a]/6 text-[#1a1a1a]/70 hover:text-[#1a1a1a]"
            }`}
          >
            <span className="text-[13px] w-4 text-center flex-shrink-0">💼</span>
            <span
              className="text-[12px] font-medium leading-tight flex-1 text-left"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Arial, sans-serif" }}
            >
              Offerta
            </span>
            {offertaOpen
              ? <ChevronDown size={12} className="flex-shrink-0 opacity-60" />
              : <ChevronRight size={12} className="flex-shrink-0 opacity-60" />}
          </button>
          {offertaOpen && (
            <div className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-[#1a1a1a]/10 pl-2">
              {OFFERTA_SUBMENU.map((sub) => (
                <Link key={sub.href} href={sub.href}>
                  <div
                    className={`flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer transition-all duration-150 ${
                      isActive(sub.href)
                        ? "bg-[#ff5500] text-white"
                        : "hover:bg-[#1a1a1a]/6 text-[#1a1a1a]/60 hover:text-[#1a1a1a]"
                    }`}
                  >
                    <span className="text-[11px] w-3 text-center flex-shrink-0">{sub.icon}</span>
                    <span
                      className="text-[11px] font-medium leading-tight"
                      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Arial, sans-serif" }}
                    >
                      {sub.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {INFO_LINKS.map((ch) => {
          const isExternal = ch.href.startsWith("http") || ch.href.startsWith("mailto:");
          const inner = (
            <div
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-all duration-150 ${
                !isExternal && isActive(ch.href)
                  ? "bg-[#1a1a1a] text-white"
                  : "hover:bg-[#1a1a1a]/6 text-[#1a1a1a]/70 hover:text-[#1a1a1a]"
              }`}
            >
              <span className="text-[13px] w-4 text-center flex-shrink-0">{ch.icon}</span>
              <span
                className="text-[12px] font-medium leading-tight"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Arial, sans-serif" }}
              >
                {ch.label}
              </span>
            </div>
          );
          return isExternal ? (
            <a
              key={ch.href + ch.label}
              href={ch.href}
              target={ch.href.startsWith("mailto:") ? "_self" : "_blank"}
              rel="noopener noreferrer"
            >
              {inner}
            </a>
          ) : (
            <Link key={ch.href + ch.label} href={ch.href}>
              {inner}
            </Link>
          );
        })}
      </nav>

      {/* Banner ProofPress — 3 target */}
      <div className="mx-3 mb-4">
        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            overflow: "hidden",
            border: "1px solid rgba(26,26,26,0.12)",
            boxShadow: "0 2px 12px rgba(26,26,26,0.06)",
          }}
        >
          {/* Header */}
          <div style={{ background: "#ff5500", padding: "7px 12px" }}>
            <div style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
              ProofPress — Sei...
            </div>
          </div>

          {/* 3 target cards */}
          {[
            {
              icon: "✍️",
              title: "Un Creator o Giornalista?",
              desc: "Pubblica con notizie certificate e raggiungi 100k+ lettori.",
              href: "/offerta/creator",
              cta: "Scopri →",
            },
            {
              icon: "📰",
              title: "Una Testata o Editore?",
              desc: "Redazione AI autonoma. Notizie certificate 24/7.",
              href: "/offerta/editori",
              cta: "Scopri →",
            },
            {
              icon: "🏢",
              title: "Un'Azienda?",
              desc: "Thought leadership e content marketing certificato.",
              href: "/offerta/aziende",
              cta: "Scopri →",
            },
          ].map((t, i) => (
            <Link key={t.href} href={t.href}>
              <div
                style={{
                  padding: "10px 12px",
                  borderTop: i > 0 ? "1px solid rgba(26,26,26,0.07)" : undefined,
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                className="hover:bg-[#fff3ee]"
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                  <span style={{ fontSize: "16px", lineHeight: 1, marginTop: "1px", flexShrink: 0 }}>{t.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "#1a1a1a", lineHeight: 1.3, marginBottom: "3px", fontFamily: "system-ui, sans-serif" }}>
                      {t.title}
                    </div>
                    <div style={{ fontSize: "10px", color: "rgba(26,26,26,0.55)", lineHeight: 1.4, marginBottom: "5px", fontFamily: "system-ui, sans-serif" }}>
                      {t.desc}
                    </div>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#ff5500", fontFamily: "system-ui, sans-serif" }}>
                      {t.cta}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Divider */}
      <div className="mx-4 mb-3 border-t border-[#1a1a1a]/10" />

      {/* Readers counter */}
      <div className="px-4">
        <ReadersCounter />
      </div>
    </aside>
  );
}
