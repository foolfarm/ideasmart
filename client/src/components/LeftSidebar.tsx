import { Link, useLocation } from "wouter";
import ReadersCounter from "@/components/ReadersCounter";

interface SidebarChannel {
  label: string;
  icon: string;
  href: string;
}

/* ─── SEZIONE INFO ────────────────────────────────────── */
const INFO_LINKS: SidebarChannel[] = [
  { label: "Chi siamo",                  icon: "🏛️", href: "/chi-siamo-story" },
  { label: "Offerta",                    icon: "👤", href: "/chi-siamo" },
  { label: "Tecnologia",                 icon: "✅", href: "/proofpress-verify" },
  { label: "Demo",                       icon: "🎯", href: "https://ideasmart.technology" },
  { label: "Pubblicizza",                icon: "📣", href: "/pubblicita" },
  { label: "Contatti",                   icon: "✉️", href: "mailto:info@proofpress.ai" },
];

export default function LeftSidebar() {
  const [location] = useLocation();

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

      {/* Banner ProofPress Business — stile chiaro, più alto */}
      <div className="mx-3 mb-4">
        <a href="/chi-siamo" className="block">
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid rgba(26,26,26,0.12)",
              boxShadow: "0 2px 12px rgba(26,26,26,0.06)",
              cursor: "pointer",
            }}
          >
            {/* Intestazione arancione */}
            <div
              style={{
                background: "#ff5500",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: 800,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#ffffff",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Arial, sans-serif",
                }}
              >
                ProofPress Business
              </div>
            </div>

            {/* Corpo chiaro */}
            <div style={{ padding: "14px 12px 16px" }}>
              {/* Icona decorativa */}
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  background: "#fff3ee",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "10px",
                  fontSize: "18px",
                }}
              >
                📰
              </div>

              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 800,
                  color: "#1a1a1a",
                  lineHeight: 1.3,
                  marginBottom: "8px",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif",
                }}
              >
                Crea il tuo giornale agentico con informazione certificata
              </div>

              <div
                style={{
                  fontSize: "11px",
                  color: "rgba(26,26,26,0.55)",
                  lineHeight: 1.5,
                  marginBottom: "6px",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Arial, sans-serif",
                }}
              >
                Redazione AI autonoma. Notizie 100% certificate con ProofPress Verify.
              </div>

              <div
                style={{
                  fontSize: "11px",
                  color: "rgba(26,26,26,0.55)",
                  lineHeight: 1.5,
                  marginBottom: "14px",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Arial, sans-serif",
                }}
              >
                Oltre 100.000 lettori al mese. Funziona anche senza una redazione.
              </div>

              {/* Divider */}
              <div style={{ borderTop: "1px solid rgba(26,26,26,0.08)", marginBottom: "12px" }} />

              {/* Statistiche */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
                {[
                  { num: "100k+", label: "lettori/mese" },
                  { num: "6k+",   label: "newsletter" },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{
                      flex: 1,
                      background: "#faf8f3",
                      borderRadius: "6px",
                      padding: "6px 8px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 800,
                        color: "#ff5500",
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif",
                      }}
                    >
                      {s.num}
                    </div>
                    <div style={{ fontSize: "9px", color: "rgba(26,26,26,0.5)" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div
                style={{
                  display: "block",
                  background: "#ff5500",
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  textAlign: "center",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Arial, sans-serif",
                }}
              >
                Scopri come →
              </div>
            </div>
          </div>
        </a>
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
