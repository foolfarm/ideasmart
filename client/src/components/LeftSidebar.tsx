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

          {/* 3 target — crescono per riempire lo spazio */}
          {[
            {
              icon: "✍️",
              label: "Creator & Giornalisti",
              desc: "Pubblica con il tuo nome, certificato e verificato. Raggiungi 100k+ lettori senza gestire una redazione.",
              cta: "Scopri il piano Creator →",
              href: "/offerta/creator"
            },
            {
              icon: "📰",
              label: "Testate & Editori",
              desc: "Una redazione AI che lavora 24/7 al posto tuo. Più contenuti, più lettori, revenue share dal primo giorno.",
              cta: "Scopri il piano Editori →",
              href: "/offerta/editori"
            },
            {
              icon: "🏢",
              label: "Aziende & Corporate",
              desc: "Intelligence certificata e newsroom branded per il tuo settore. Decisioni più veloci, autorevolezza immediata.",
              cta: "Scopri il piano Aziende →",
              href: "/offerta/aziende"
            },
          ].map((t, i) => (
            <Link key={t.href} href={t.href} style={{ flex: 1, display: "flex", minHeight: 0 }}>
              <div
                style={{ flex: 1, padding: "10px 13px", borderTop: i > 0 ? "1px solid rgba(26,26,26,0.07)" : undefined, cursor: "pointer", transition: "background 0.15s", display: "flex", flexDirection: "column", justifyContent: "center" }}
                className="hover:bg-[#fff3ee]"
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", width: "100%" }}>
                  <span style={{ fontSize: "18px", lineHeight: 1, flexShrink: 0, marginTop: "1px" }}>{t.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#1a1a1a", lineHeight: 1.3, fontFamily: SF }}>{t.label}</div>
                    <div style={{ fontSize: "11px", color: "rgba(26,26,26,0.58)", lineHeight: 1.55, fontFamily: SF, marginTop: "4px" }}>{t.desc}</div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#ff5500", fontFamily: SF, marginTop: "6px" }}>{t.cta}</div>
                  </div>
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

      {/* Divider */}
      <div className="mx-5 mb-3 border-t border-[#1a1a1a]/10" />

      {/* Readers counter */}
      <div className="px-5">
        <ReadersCounter />
      </div>
    </aside>
  );
}
