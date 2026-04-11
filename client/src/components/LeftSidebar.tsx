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
  { label: "Chi siamo",        icon: "🏗️", href: "/chi-siamo-story" },
  { label: "Pubblicizza",      icon: "📣", href: "/pubblicita" },
  { label: "Collezione Prompt", icon: "📋", href: "https://promptcollection2026.com/" },
  { label: "Contatti",         icon: "✉️", href: "mailto:info@proofpress.ai" },
];

const PIATTAFORMA_SUBMENU = [
  { label: "Piattaforma ProofPress", icon: "🚀", href: "/piattaforma", external: false },
  { label: "Agentic Platform Demo", icon: "🎯", href: "https://ideasmart.technology", external: true },
  { label: "ProofPress Verify",     icon: "✅", href: "/proofpress-verify", external: false },
];

const OFFERTA_SUBMENU = [
  { label: "Creator & Giornalisti", icon: "✍️", href: "/offerta/creator" },
  { label: "Testate & Editori",     icon: "📰", href: "/offerta/editori" },
  { label: "Aziende & Corporate",   icon: "🏢", href: "/offerta/aziende" },
];

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

export default function LeftSidebar() {
  const [location] = useLocation();
  const [offertaOpen, setOffertaOpen] = useState(
    location.startsWith("/offerta")
  );
  const [piattaformaOpen, setPiattaformaOpen] = useState(
    location.startsWith("/proofpress-verify") || location.startsWith("/piattaforma")
  );

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <aside
      className="hidden lg:flex flex-col w-[220px] flex-shrink-0"
      style={{
        position: "sticky",
        top: "0",
        height: "100vh",
        overflowY: "auto",
        background: "#faf8f3",
        borderRight: "1px solid rgba(26,26,26,0.1)",
        paddingTop: "20px",
        paddingBottom: "32px",
        scrollbarWidth: "none",
      }}
    >
      {/* Titolo "Menu" */}
      <div className="px-5 mb-4">
        <Link href="/chi-siamo-story">
          <div
            style={{
              fontFamily: SF,
              fontSize: "22px",
              fontWeight: 900,
              color: "#1a1a1a",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              cursor: "pointer",
            }}
          >
            Menu
          </div>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-5 mb-4 border-t-[2px] border-[#1a1a1a]" />

      {/* Tagline */}
      <div className="px-5 mb-5">
        <p style={{ fontSize: "13px", color: "rgba(26,26,26,0.72)", lineHeight: 1.65, fontFamily: SF }}>
          ProofPress Magazine nasce dalla piattaforma ProofPress, la prima tecnologia di AI Journalism certificato. Crea la tua testata AI-native: scopri l&apos;offerta per{" "}
          <Link href="/offerta/creator"><span style={{ color: "#ff5500", fontWeight: 700, cursor: "pointer" }}>creator</span></Link>,{" "}
          <Link href="/offerta/aziende"><span style={{ color: "#ff5500", fontWeight: 700, cursor: "pointer" }}>aziende</span></Link>{" "}ed{" "}
          <Link href="/offerta/editori"><span style={{ color: "#ff5500", fontWeight: 700, cursor: "pointer" }}>editori</span></Link>.
        </p>
      </div>

      {/* Nav principale */}
      <nav className="flex flex-col gap-1 px-3 mb-5">

        {/* Piattaforma con submenu */}
        <div>
          <button
            onClick={() => setPiattaformaOpen(!piattaformaOpen)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 ${
              location.startsWith("/proofpress-verify") || location.startsWith("/piattaforma")
                ? "bg-[#1a1a1a] text-white"
                : "hover:bg-[#1a1a1a]/8 text-[#1a1a1a] hover:text-[#1a1a1a]"
            }`}
          >
            <span className="text-[15px] w-5 text-center flex-shrink-0">🖥️</span>
            <span
              className="text-[14px] font-semibold leading-tight flex-1 text-left"
              style={{ fontFamily: SF }}
            >
              Piattaforma
            </span>
            {piattaformaOpen
              ? <ChevronDown size={14} className="flex-shrink-0 opacity-50" />
              : <ChevronRight size={14} className="flex-shrink-0 opacity-50" />}
          </button>
          {piattaformaOpen && (
            <div className="ml-5 mt-1 flex flex-col gap-0.5 border-l-2 border-[#1a1a1a]/12 pl-3">
              {PIATTAFORMA_SUBMENU.map((sub) => (
                sub.external ? (
                  <a key={sub.href} href={sub.href} target="_blank" rel="noopener noreferrer">
                    <div className="flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer transition-all duration-150 hover:bg-[#1a1a1a]/6 text-[#1a1a1a]/65 hover:text-[#1a1a1a]">
                      <span className="text-[13px] w-4 text-center flex-shrink-0">{sub.icon}</span>
                      <span className="text-[13px] font-medium leading-tight" style={{ fontFamily: SF }}>{sub.label}</span>
                    </div>
                  </a>
                ) : (
                  <Link key={sub.href} href={sub.href}>
                    <div className={`flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer transition-all duration-150 ${
                      isActive(sub.href) ? "bg-[#ff5500] text-white" : "hover:bg-[#1a1a1a]/6 text-[#1a1a1a]/65 hover:text-[#1a1a1a]"
                    }`}>
                      <span className="text-[13px] w-4 text-center flex-shrink-0">{sub.icon}</span>
                      <span className="text-[13px] font-medium leading-tight" style={{ fontFamily: SF }}>{sub.label}</span>
                    </div>
                  </Link>
                )
              ))}
            </div>
          )}
        </div>

        {/* Offerta con submenu */}
        <div>
          <button
            onClick={() => setOffertaOpen(!offertaOpen)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 ${
              location.startsWith("/offerta")
                ? "bg-[#1a1a1a] text-white"
                : "hover:bg-[#1a1a1a]/8 text-[#1a1a1a] hover:text-[#1a1a1a]"
            }`}
          >
            <span className="text-[15px] w-5 text-center flex-shrink-0">💼</span>
            <span
              className="text-[14px] font-semibold leading-tight flex-1 text-left"
              style={{ fontFamily: SF }}
            >
              Offerta
            </span>
            {offertaOpen
              ? <ChevronDown size={14} className="flex-shrink-0 opacity-50" />
              : <ChevronRight size={14} className="flex-shrink-0 opacity-50" />}
          </button>
          {offertaOpen && (
            <div className="ml-5 mt-1 flex flex-col gap-0.5 border-l-2 border-[#1a1a1a]/12 pl-3">
              {OFFERTA_SUBMENU.map((sub) => (
                <Link key={sub.href} href={sub.href}>
                  <div
                    className={`flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer transition-all duration-150 ${
                      isActive(sub.href)
                        ? "bg-[#ff5500] text-white"
                        : "hover:bg-[#1a1a1a]/6 text-[#1a1a1a]/65 hover:text-[#1a1a1a]"
                    }`}
                  >
                    <span className="text-[13px] w-4 text-center flex-shrink-0">{sub.icon}</span>
                    <span
                      className="text-[13px] font-medium leading-tight"
                      style={{ fontFamily: SF }}
                    >
                      {sub.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Info links */}
        {INFO_LINKS.map((ch) => {
          const isExternal = ch.href.startsWith("http") || ch.href.startsWith("mailto:");
          const inner = (
            <div
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 ${
                !isExternal && isActive(ch.href)
                  ? "bg-[#1a1a1a] text-white"
                  : "hover:bg-[#1a1a1a]/8 text-[#1a1a1a] hover:text-[#1a1a1a]"
              }`}
            >
              <span className="text-[15px] w-5 text-center flex-shrink-0">{ch.icon}</span>
              <span
                className="text-[14px] font-semibold leading-tight"
                style={{ fontFamily: SF }}
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

      {/* Banner ProofPress — espanso fino al ReadersCounter */}
      <div className="mx-3 flex-1 flex flex-col min-h-0 mb-3">
        <div className="flex flex-col flex-1 min-h-0" style={{ background: "#fff", borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(26,26,26,0.1)", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>

          {/* Header arancione */}
          <div style={{ background: "#ff5500", padding: "10px 13px", flexShrink: 0 }}>
            <div style={{ fontSize: "10px", fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff", fontFamily: SF }}>
              ProofPress — Per il tuo business
            </div>
          </div>

          {/* 3 target — layout compatto con descrizione breve */}
          {[
            {
              icon: "✍️",
              label: "Creator & Giornalisti",
              desc: "Pubblica certificato, raggiungi 100k+ lettori.",
              cta: "Scopri →",
              href: "/offerta/creator"
            },
            {
              icon: "📰",
              label: "Testate & Editori",
              desc: "Redazione AI 24/7, revenue share.",
              cta: "Scopri →",
              href: "/offerta/editori"
            },
            {
              icon: "🏢",
              label: "Aziende & Corporate",
              desc: "Intelligence certificata, newsroom branded.",
              cta: "Scopri →",
              href: "/offerta/aziende"
            },
          ].map((t, i) => (
            <Link key={t.href} href={t.href} style={{ display: "flex" }}>
              <div
                style={{ flex: 1, padding: "12px 13px", borderTop: i > 0 ? "1px solid rgba(26,26,26,0.07)" : undefined, cursor: "pointer", transition: "background 0.15s" }}
                className="hover:bg-[#fff3ee]"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "9px", width: "100%" }}>
                  <span style={{ fontSize: "16px", lineHeight: 1, flexShrink: 0 }}>{t.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "12px", fontWeight: 800, color: "#1a1a1a", lineHeight: 1.25, fontFamily: SF }}>{t.label}</div>
                    <div style={{ fontSize: "10.5px", color: "rgba(26,26,26,0.55)", lineHeight: 1.4, fontFamily: SF, marginTop: "2px" }}>{t.desc}</div>
                  </div>
                  <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#ff5500", fontFamily: SF, flexShrink: 0, whiteSpace: "nowrap" }}>{t.cta}</div>
                </div>
              </div>
            </Link>
          ))}

          {/* Footer */}
          <Link href="/offerta">
            <div style={{ padding: "10px 13px", background: "#fff8f5", borderTop: "1px solid rgba(255,85,0,0.12)", cursor: "pointer", flexShrink: 0 }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#ff5500", fontFamily: SF, textAlign: "center" }}>
                Scopri tutti i piani →
              </div>
            </div>
          </Link>

        </div>
      </div>

      {/* LinkedIn ProofPress */}
      <div className="px-4 mb-3">
        <a
          href="https://www.linkedin.com/company/proofpress/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#f0f7ff] transition-colors group"
          style={{ border: "1px solid rgba(10,102,194,0.15)", background: "rgba(10,102,194,0.04)" }}
        >
          {/* LinkedIn icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#0a66c2" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#0a66c2", fontFamily: "system-ui, sans-serif", lineHeight: 1.2 }}>ProofPress</div>
            <div style={{ fontSize: "10px", color: "rgba(26,26,26,0.5)", fontFamily: "system-ui, sans-serif", lineHeight: 1.2 }}>Seguici su LinkedIn</div>
          </div>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0a66c2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.6 }}>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
      </div>

      {/* Divider */}
      <div className="mx-5 mb-3 border-t border-[#1a1a1a]/10" />

      {/* Readers counter */}
      <div className="px-5">
        <ReadersCounter />
      </div>
    </aside>
  );
}
