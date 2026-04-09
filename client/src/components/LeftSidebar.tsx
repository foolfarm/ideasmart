import { Link, useLocation } from "wouter";
import ReadersCounter from "@/components/ReadersCounter";

interface SidebarChannel {
  label: string;
  icon: string;
  href: string;
}

/* ─── SEZIONE INFO ────────────────────────────────────── */
const INFO_LINKS: SidebarChannel[] = [
  { label: "Crea Un Giornale",       icon: "👤", href: "/chi-siamo" },
  { label: "Tecnologia",             icon: "✅", href: "/proofpress-verify" },
  { label: "Demo",                   icon: "🎯", href: "https://ideasmart.technology" },
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
      {/* Logo */}
      <div className="px-4 mb-4">
        <Link href="/">
          <div className="cursor-pointer">
            <div
              className="font-black text-[#1a1a1a]"
              style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
                fontSize: "20px",
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              Proof Press
            </div>
          </div>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-4 mb-3 border-t-[2px] border-[#1a1a1a]" />

      {/* Sezione info */}
      <nav className="flex flex-col gap-0.5 px-2 mb-4">
        {INFO_LINKS.map((ch) => {
          const isExternal = ch.href.startsWith("http");
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
            <a key={ch.href + ch.label} href={ch.href} target="_blank" rel="noopener noreferrer">
              {inner}
            </a>
          ) : (
            <Link key={ch.href + ch.label} href={ch.href}>
              {inner}
            </Link>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Banner ProofPress Business */}
      <div className="mx-3 mb-4">
        <a href="/chi-siamo" className="block">
          <div
            style={{
              background: "linear-gradient(135deg, #1a1a1a 0%, #2d1a0e 100%)",
              borderRadius: "10px",
              padding: "14px 12px",
              border: "1px solid rgba(255,85,0,0.25)",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#ff5500",
                marginBottom: "6px",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Arial, sans-serif",
              }}
            >
              ProofPress Business
            </div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.3,
                marginBottom: "8px",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif",
              }}
            >
              Crea il tuo giornale agentico con informazione certificata
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "rgba(255,255,255,0.55)",
                lineHeight: 1.4,
                marginBottom: "10px",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Arial, sans-serif",
              }}
            >
              Redazione AI autonoma. Notizie 100% certificate. Da €499/mese.
            </div>
            <div
              style={{
                display: "inline-block",
                background: "#ff5500",
                color: "#ffffff",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.05em",
                padding: "5px 10px",
                borderRadius: "5px",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Arial, sans-serif",
              }}
            >
              Scopri come →
            </div>
          </div>
        </a>
      </div>

      {/* Divider */}
      <div className="mx-4 mb-3 border-t border-[#1a1a1a]/10" />

      {/* Readers counter */}
      <div className="px-4">
        <ReadersCounter />
      </div>
    </aside>
  );
}
