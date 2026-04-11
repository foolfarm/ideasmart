/**
 * MobileBottomNav — Bottom navigation bar stile iOS
 * Visibile solo su schermi < lg (1024px)
 * Posizionata in fondo allo schermo con safe area per iPhone
 */
import { Link, useLocation } from "wouter";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

const NAV_ITEMS = [
  { label: "Home",     icon: "🏠", href: "/" },
  { label: "AI",       icon: "🤖", href: "/ai" },
  { label: "Startup",  icon: "🚀", href: "/startup" },
  { label: "Research", icon: "🔬", href: "/research" },
  { label: "Dealroom", icon: "💼", href: "/dealroom" },
];

export default function MobileBottomNav() {
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#e5e5ea]"
      style={{
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="flex items-stretch justify-around h-[52px]">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div
                className="flex flex-col items-center justify-center gap-0.5 px-2 h-full cursor-pointer transition-all duration-150"
                style={{ minWidth: "56px" }}
              >
                <span
                  className="text-[18px] leading-none transition-transform duration-150"
                  style={{ transform: active ? "scale(1.15)" : "scale(1)" }}
                >
                  {item.icon}
                </span>
                <span
                  style={{
                    fontFamily: SF,
                    fontSize: "9px",
                    fontWeight: active ? 700 : 500,
                    color: active ? "#0071e3" : "rgba(26,26,26,0.5)",
                    letterSpacing: "0.01em",
                    lineHeight: 1,
                  }}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
