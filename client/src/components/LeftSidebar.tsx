import { Link, useLocation } from "wouter";
import ReadersCounter from "@/components/ReadersCounter";

interface SidebarChannel {
  label: string;
  icon: string;
  href: string;
}

/* ─── SEZIONE INFO ────────────────────────────────────── */
const INFO_LINKS: SidebarChannel[] = [
  { label: "Crea Un Giornale - Servizi", icon: "👤", href: "/chi-siamo" },
  { label: "Tecnologia",                 icon: "✅", href: "/proofpress-verify" },
  { label: "Demo",                       icon: "🎯", href: "https://ideasmart.technology" },
  { label: "Pubblicizza",                icon: "🎯", href: "/pubblicita" },
  { label: "Contatti",                   icon: "✉️", href: "mailto:info@proofpress.ai" },
];

// Immagine editoriale per il banner (redazione agentica)
const BANNER_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ideasmart_hero-6ZrdwCga3BYZbueso82C5j.webp";

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
      {/* Logo — due righe: "Proof Press" + "Business" */}
      <div className="px-4 mb-4">
        <Link href="/">
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
                Proof Press
              </div>
              <div
                className="font-black text-[#ff5500]"
                style={{ fontSize: "20px" }}
              >
                Business
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

      {/* Banner ProofPress Business — subito sotto Demo */}
      <div className="mx-3 mb-4">
        <a href="/chi-siamo" className="block">
          <div
            style={{
              background: "linear-gradient(160deg, #1a1a1a 0%, #2d1a0e 100%)",
              borderRadius: "10px",
              overflow: "hidden",
              border: "1px solid rgba(255,85,0,0.3)",
              cursor: "pointer",
            }}
          >
            {/* Immagine hero */}
            <div style={{ position: "relative", height: "90px", overflow: "hidden" }}>
              <img
                src={BANNER_IMG}
                alt="ProofPress Business"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center top",
                  opacity: 0.7,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to bottom, transparent 30%, #1a1a1a 100%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "8px",
                  left: "10px",
                  fontSize: "8px",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#ff5500",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Arial, sans-serif",
                }}
              >
                ProofPress Business
              </div>
            </div>

            {/* Testo */}
            <div style={{ padding: "10px 12px 12px" }}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#ffffff",
                  lineHeight: 1.3,
                  marginBottom: "6px",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif",
                }}
              >
                Crea il tuo giornale agentico con informazione certificata
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "rgba(255,255,255,0.5)",
                  lineHeight: 1.4,
                  marginBottom: "10px",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Arial, sans-serif",
                }}
              >
                Redazione AI autonoma. Notizie 100% certificate.
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
