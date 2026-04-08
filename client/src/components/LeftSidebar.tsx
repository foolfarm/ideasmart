import { Link, useLocation } from "wouter";
import ReadersCounter from "@/components/ReadersCounter";

interface SidebarChannel {
  label: string;
  icon: string;
  href: string;
  badge?: string;
}

const PRIMARY_CHANNELS: SidebarChannel[] = [
  { label: "Chi Siamo", icon: "👤", href: "/chi-siamo" },
  { label: "AI News", icon: "📡", href: "/ai" },
  { label: "Copy & Paste AI", icon: "📋", href: "/copy-paste-ai" },
  { label: "Automate with AI", icon: "⚡", href: "/automate-with-ai" },
  { label: "Make Money", icon: "$", href: "/make-money-with-ai" },
  { label: "Daily AI Tools", icon: "🛠️", href: "/daily-ai-tools" },
  { label: "ProofPress Verify", icon: "🛡", href: "/proofpress-verify" },
  { label: "AI Opportunities", icon: "📈", href: "/ai-opportunities" },
];

const SECONDARY_CHANNELS: SidebarChannel[] = [
  { label: "AI Research", icon: "🔬", href: "/research" },
  { label: "AI Venture", icon: "🚀", href: "/startup" },
  { label: "AI Invest", icon: "💼", href: "/dealroom" },
  { label: "AI Startup News", icon: "🏢", href: "/startup" },
  { label: "AI Dealflow", icon: "💰", href: "/dealflow" },
  { label: "AI Radar", icon: "📻", href: "/ai" },
];

const UTILITY_LINKS: SidebarChannel[] = [
  { label: "ProofPress Verify", icon: "✅", href: "/proofpress-verify" },
  { label: "Newsletter", icon: "✉️", href: "/#newsletter" },
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
              IDEASMART
            </div>
          </div>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-4 mb-3 border-t-[2px] border-[#1a1a1a]" />

      {/* Canali principali */}
      <div className="px-3 mb-1">
        <span
          className="text-[9px] uppercase tracking-[0.15em] text-[#1a1a1a]/35 font-semibold px-1"
        >
          Canali
        </span>
      </div>
      <nav className="flex flex-col gap-0.5 px-2 mb-3">
        {PRIMARY_CHANNELS.map((ch) => (
          <Link key={ch.href + ch.label} href={ch.href}>
            <div
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-all duration-150 group ${
                isActive(ch.href)
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
          </Link>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-4 mb-2 border-t border-[#1a1a1a]/10" />

      {/* Canali secondari */}
      <div className="px-3 mb-1">
        <span className="text-[9px] uppercase tracking-[0.15em] text-[#1a1a1a]/35 font-semibold px-1">
          Approfondimenti
        </span>
      </div>
      <nav className="flex flex-col gap-0.5 px-2 mb-3">
        {SECONDARY_CHANNELS.map((ch) => (
          <Link key={ch.href + ch.label} href={ch.href}>
            <div
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-all duration-150 ${
                isActive(ch.href)
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
          </Link>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-4 mb-2 border-t border-[#1a1a1a]/10" />

      {/* Link utility */}
      <nav className="flex flex-col gap-0.5 px-2 mb-4">
        {UTILITY_LINKS.map((ch) => (
          <Link key={ch.href} href={ch.href}>
            <div
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-all duration-150 ${
                isActive(ch.href)
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
          </Link>
        ))}
      </nav>

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
