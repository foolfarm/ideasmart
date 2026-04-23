/**
 * AdminHeader — Header condiviso per tutte le pagine admin
 * Stile Apple monocromatico con menu di navigazione completo
 */
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

const C = {
  white: "#ffffff",
  black: "#1d1d1f",
  mid: "#6e6e73",
  border: "#e5e5ea",
  hover: "#f5f5f7",
  font: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
};

const NAV_ITEMS = [
  { label: "Dashboard", path: "/admin" },
  { label: "Performance", path: "/admin/newsletter-performance" },
  { label: "Audit Contenuti", path: "/admin/audit" },
  { label: "Monitor RSS", path: "/admin/rss-monitor" },
  { label: "Email Stats", path: "/admin/sendgrid-stats" },
  { label: "Salute Sistema", path: "/admin/system-health" },
  { label: "Alert Log", path: "/admin/alert-log" },
  { label: "Amazon Deals", path: "/admin/amazon-deals" },
  { label: "Promo Newsletter", path: "/admin/promo-newsletter" },
  { label: "Verify Clienti", path: "/admin/verify" },
];

interface AdminHeaderProps {
  title?: string;
}

export default function AdminHeader({ title }: AdminHeaderProps) {
  const [location, navigate] = useLocation();
  const { user } = useAuth();

  return (
    <div
      className="sticky top-0 z-50 border-b"
      style={{ background: C.white, borderColor: C.border, fontFamily: C.font }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
        {/* Left: breadcrumb + nav */}
        <div className="flex items-center gap-0.5 flex-wrap">
          <button
            onClick={() => navigate("/")}
            className="text-xs transition-colors px-2 py-1.5 rounded-md hover:bg-[#f5f5f7]"
            style={{ color: C.mid }}
          >
            ← ProofPress
          </button>
          <span className="text-xs" style={{ color: C.border }}>/</span>

          {NAV_ITEMS.map((item) => {
            const isActive = location === item.path || (item.path !== "/admin" && location.startsWith(item.path));
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="text-xs transition-all px-2.5 py-1.5 rounded-md"
                style={{
                  color: isActive ? C.black : C.mid,
                  background: isActive ? C.hover : "transparent",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Right: user */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs" style={{ color: C.mid }}>{user?.name ?? user?.email ?? ""}</span>
        </div>
      </div>
    </div>
  );
}
