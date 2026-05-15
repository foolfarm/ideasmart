/**
 * AdminHeader — Header condiviso per tutte le pagine admin
 * Navigazione a 4 gruppi con dropdown: Newsletter | Contenuti | Sistema | Monetizzazione
 */
import { useState, useRef, useEffect } from "react";
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

const NAV_GROUPS = [
  {
    label: "Newsletter",
    items: [
      { label: "📊 Performance & Statistiche", path: "/admin/newsletter-performance" },
      { label: "📧 Promo Newsletter", path: "/admin/promo-newsletter" },
      { label: "📰 Contenuti & Sponsor", path: "/admin/newsletter-content" },
    ],
  },
  {
    label: "Contenuti",
    items: [
      { label: "🔍 Audit Contenuti", path: "/admin/audit" },
      { label: "📡 Monitor RSS", path: "/admin/rss-monitor" },
      { label: "✍️ Giornalisti", path: "/admin/journalists" },
      { label: "🛠️ Tools & Feedback", path: "/admin/tools-feedback" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { label: "💚 Salute Sistema", path: "/admin/system-health" },
      { label: "🔔 Alert Log", path: "/admin/alert-log" },
    ],
  },
  {
    label: "Monetizzazione",
    items: [
      { label: "📢 Pubblicità & Banner", path: "/admin/pubblicita" },
      { label: "🛒 Amazon Deals", path: "/admin/amazon-deals" },
      { label: "🎯 Leads", path: "/admin/leads" },
      { label: "✅ Verify Clienti", path: "/admin/verify" },
    ],
  },
];

interface DropdownMenuProps {
  label: string;
  items: { label: string; path: string }[];
  currentPath: string;
  onNavigate: (path: string) => void;
}

function DropdownMenu({ label, items, currentPath, onNavigate }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const isGroupActive = items.some(
    (item) => currentPath === item.path || currentPath.startsWith(item.path + "/")
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs transition-all px-2.5 py-1.5 rounded-md"
        style={{
          color: isGroupActive ? C.black : C.mid,
          background: isGroupActive ? C.hover : "transparent",
          fontWeight: isGroupActive ? 600 : 400,
          fontFamily: C.font,
        }}
      >
        {label}
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s ease",
            opacity: 0.5,
          }}
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1 rounded-xl shadow-lg border z-50 py-1 min-w-[200px]"
          style={{ background: C.white, borderColor: C.border }}
        >
          {items.map((item) => {
            const isActive =
              currentPath === item.path || currentPath.startsWith(item.path + "/");
            return (
              <button
                key={item.path}
                onClick={() => {
                  onNavigate(item.path);
                  setOpen(false);
                }}
                className="w-full text-left text-xs px-4 py-2.5 transition-colors"
                style={{
                  color: isActive ? C.black : C.mid,
                  background: isActive ? C.hover : "transparent",
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: C.font,
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface AdminHeaderProps {
  title?: string;
}

export default function AdminHeader({ title: _title }: AdminHeaderProps) {
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

          {/* Dashboard link diretto */}
          <button
            onClick={() => navigate("/admin")}
            className="text-xs transition-all px-2.5 py-1.5 rounded-md"
            style={{
              color: location === "/admin" ? C.black : C.mid,
              background: location === "/admin" ? C.hover : "transparent",
              fontWeight: location === "/admin" ? 600 : 400,
            }}
          >
            Dashboard
          </button>

          {/* Gruppi dropdown */}
          {NAV_GROUPS.map((group) => (
            <DropdownMenu
              key={group.label}
              label={group.label}
              items={group.items}
              currentPath={location}
              onNavigate={navigate}
            />
          ))}
        </div>

        {/* Right: user */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs" style={{ color: C.mid }}>
            {user?.name ?? user?.email ?? ""}
          </span>
        </div>
      </div>
    </div>
  );
}
