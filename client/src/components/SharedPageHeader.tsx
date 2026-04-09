/**
 * SharedPageHeader — Testata condivisa identica alla Home
 * Usato da: tutte le pagine interne
 * Struttura: data + tagline | IDEASMART (grande) | sottotitolo
 * La navigazione canali è gestita separatamente da SectionNav
 */
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useSiteAuth } from "@/hooks/useSiteAuth";
import { User, LogOut, Settings } from "lucide-react";

function formatDateIT(date: Date): string {
  return date.toLocaleDateString("it-IT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function Divider({ thick = false }: { thick?: boolean }) {
  return <div className={`w-full ${thick ? "border-t-[3px]" : "border-t"} border-[#1a1a1a]`} />;
}

// ─── USER PROFILE DROPDOWN ──────────────────────────────────────────────────
function UserProfileDropdown({ user, logout }: { user: { username?: string | null } | null; logout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-full hover:bg-[#1a1a1a]/8 transition-colors"
        style={{ fontFamily: SF }}
      >
        <div className="w-7 h-7 rounded-full bg-[#1a1a1a] flex items-center justify-center">
          <User size={14} color="#fff" strokeWidth={2.2} />
        </div>
        <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest text-[#1a1a1a] max-w-[100px] truncate">
          {user?.username}
        </span>
      </button>

      {/* Dropdown */}
      <div
        className="absolute right-0 top-full mt-1 bg-white border border-[#1a1a1a]/12 shadow-lg rounded-md overflow-hidden z-[60] transition-all duration-200 origin-top-right"
        style={{
          opacity: open ? 1 : 0,
          transform: open ? "scale(1) translateY(0)" : "scale(0.95) translateY(-4px)",
          pointerEvents: open ? "auto" : "none",
          minWidth: "180px",
        }}
      >
        <div className="px-3 py-2.5 border-b border-[#1a1a1a]/8">
          <p className="text-[11px] font-bold text-[#1a1a1a] truncate" style={{ fontFamily: SF }}>
            {user?.username}
          </p>
        </div>
        <Link href="/account">
          <span
            className="flex items-center gap-2 px-3 py-2.5 text-[11px] font-medium text-[#1a1a1a] hover:bg-[#f5f5f5] transition-colors cursor-pointer"
            style={{ fontFamily: SF }}
            onClick={() => setOpen(false)}
          >
            <Settings size={14} strokeWidth={2} />
            Account
          </span>
        </Link>
        <button
          onClick={() => { setOpen(false); logout(); }}
          className="flex items-center gap-2 px-3 py-2.5 text-[11px] font-medium text-[#dc2626] hover:bg-[#fef2f2] transition-colors w-full text-left"
          style={{ fontFamily: SF }}
        >
          <LogOut size={14} strokeWidth={2} />
          Esci
        </button>
      </div>
    </div>
  );
}

export default function SharedPageHeader() {
  const today = new Date();
  const { user, isLoading, isAuthenticated, logout } = useSiteAuth();

  return (
    <header
      className="max-w-[1280px] mx-auto px-4 pt-5 pb-0"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
    >
      {/* Riga data + tagline + auth */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-[#1a1a1a]/50 uppercase tracking-widest">
          {formatDateIT(today)}
        </span>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-[11px] text-[#1a1a1a]/40 uppercase tracking-widest">
            Prompt · Tools · Workflow · News
          </span>
          {!isLoading && (
            isAuthenticated ? (
              <UserProfileDropdown user={user} logout={logout} />
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/accedi">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:opacity-70 transition-opacity"
                    style={{ color: "#1a1a1a" }}
                  >
                    Accedi
                  </span>
                </Link>
                <Link href="/registrati">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-[#1a1a1a] text-white rounded-sm cursor-pointer hover:bg-[#333] transition-colors"
                  >
                    Registrati
                  </span>
                </Link>
              </div>
            )
          )}
        </div>
      </div>

      <Divider thick />

      {/* Logo centrale con manchette Amazon ai lati */}
      <div className="py-6">
        <div className="flex items-center justify-center gap-4">
          {/* Manchette sinistra — Tradedoubler */}
          <div className="hidden lg:flex flex-shrink-0 w-[160px] items-center justify-center overflow-hidden">
            <a href="https://clk.tradedoubler.com/click?p=365615&a=3477790&g=26113480" target="_blank" rel="noopener noreferrer sponsored">
              <img
                src={`https://imp.tradedoubler.com/imp?type(img)g(26113480)a(3477790)${Math.random().toString().substring(2, 11)}`}
                width="300"
                height="250"
                alt="Pubblicità"
                style={{ width: '160px', height: 'auto', display: 'block', border: 0 }}
              />
            </a>
          </div>

          {/* Titolo centrale */}
          <div className="text-center flex-1 min-w-0">
            <Link href="/">
              <h1
                className="font-black tracking-tight text-[#1a1a1a] cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
                  fontSize: "clamp(42px, 7vw, 88px)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                Proof Press{" "}
                <span className="font-normal tracking-[0.05em] text-[#1a1a1a]/35 align-baseline"
                  style={{ fontSize: "clamp(14px,2vw,22px)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                  by Ideasmart
                </span>
              </h1>
            </Link>
            <p className="mt-3 uppercase tracking-[0.2em] text-[#1a1a1a]/60 font-semibold leading-relaxed"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
              <span className="text-[13px]">L'hub informativo per chi deve capire prima degli altri</span>
            </p>
          </div>

          {/* Manchette destra — Tradedoubler */}
          <div className="hidden lg:flex flex-shrink-0 w-[160px] items-center justify-center overflow-hidden">
            <a href="https://clk.tradedoubler.com/click?p=341133&a=3477790&g=26092910" target="_blank" rel="noopener noreferrer sponsored">
              <img
                src={`https://imp.tradedoubler.com/imp?type(img)g(26092910)a(3477790)${Math.random().toString().substring(2, 11)}`}
                width="300"
                height="250"
                alt="Pubblicità"
                style={{ width: '160px', height: 'auto', display: 'block', border: 0 }}
              />
            </a>
          </div>
        </div>

        {/* Sottotitolo full-width */}
        <p className="mt-3 text-center uppercase tracking-[0.18em] text-[#1a1a1a]/45 font-medium"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", fontSize: "10px" }}>
          4.000+ fonti analizzate e certificate 24/7 per offrirti le ultime notizie prima degli altri, per capire, decidere e agire.
        </p>

      </div>

      <Divider thick />
    </header>
  );
}
