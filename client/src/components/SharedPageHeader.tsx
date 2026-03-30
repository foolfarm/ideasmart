/**
 * SharedPageHeader — Testata condivisa identica alla Home
 * Usato da: /research, /ai, /startup, /chi-siamo e tutte le pagine interne
 * Struttura: data + tagline | IDEASMART (grande) | nav sezioni + lettori
 */
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useSiteAuth } from "@/hooks/useSiteAuth";

function formatDateIT(date: Date): string {
  return date.toLocaleDateString("it-IT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function Divider({ thick = false }: { thick?: boolean }) {
  return <div className={`w-full ${thick ? "border-t-[3px]" : "border-t"} border-[#1a1a1a]`} />;
}

function ReadersCounter() {
  const [count, setCount] = useState(6905);
  useEffect(() => {
    const t = setInterval(() => {
      setCount(c => c + Math.floor(Math.random() * 3));
    }, 45000);
    return () => clearInterval(t);
  }, []);
  return (
    <span
      className="flex items-center gap-1 text-[10px] text-[#1a1a1a] font-bold"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] animate-pulse inline-block" />
      {count.toLocaleString("it-IT")} lettori
    </span>
  );
}

function SectionNav() {
  const [location] = useLocation();
  const { data: sectionCounts } = trpc.news.getSectionCounts.useQuery(undefined, {
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const navItems = [
    { key: "ai",       label: "AI NEWS",      path: "/ai",       accent: "#1a1a1a" },
    { key: "startup",  label: "STARTUP NEWS", path: "/startup",  accent: "#2a2a2a" },
    { key: "research", label: "RICERCHE",      path: "/research", accent: "#1a1a1a" },
    { key: "dealroom",  label: "DEALROOM",     path: "/dealroom",  accent: "#1a4a2e" },
    { key: "chi-siamo",label: "Chi Siamo",    path: "/chi-siamo",accent: "#1a1a1a" },
    // Intelligence nascosta temporaneamente
    // { key: "intelligence", label: "▶ Intelligence" /* NASCOSTA */, path: "/intelligence", accent: "#1a1a1a" }
  ];

  return (
    <nav className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
      {navItems.map((item, i) => {
        const isActive = location === item.path || location.startsWith(item.path + "/");
        const count = (sectionCounts as Record<string, number> | undefined)?.[item.key] ?? 0;
        const isFirst = i === 0;
        const borderClass = i > 0 ? "border-l border-[#1a1a1a]/15" : "";
        return (
          <Link key={item.key} href={item.path}>
            <span
              className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors cursor-pointer ${borderClass}`}
              style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
                color: isActive ? "#ffffff" : item.accent,
                background: isActive ? "#1a1a1a" : "transparent",
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "#1a1a1a";
                  (e.currentTarget as HTMLElement).style.color = "#ffffff";
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = item.accent;
                }
              }}
            >
              {item.label}
              {count > 0 && (item.key === "ai" || item.key === "startup" || item.key === "research" || item.key === "dealroom") && (
                <span
                  className="text-[9px] font-bold px-1 py-0.5 rounded-sm"
                  style={{ background: isActive ? "rgba(255,255,255,0.25)" : item.accent, color: "#fff" }}
                >
                  {count}
                </span>
              )}
            </span>
          </Link>
        );
      })}
    </nav>
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
            Research · AI · Startup · Venture Capital
          </span>
          {!isLoading && (
            isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link href="/account">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:opacity-70 transition-opacity"
                    style={{ color: "#1a1a1a" }}
                  >
                    {user?.username}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="text-[10px] font-bold uppercase tracking-widest border border-[#1a1a1a]/30 px-2 py-1 hover:bg-[#1a1a1a] hover:text-white transition-colors"
                  style={{ color: "#1a1a1a", background: "transparent" }}
                >
                  Esci
                </button>
              </div>
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
                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ background: "#1a1a1a", color: "#ffffff" }}
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

      {/* Logo centrale */}
      <div className="py-6 text-center">
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
            IDEASMART
          </h1>
        </Link>
        <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-[#1a1a1a]/50">
          Intelligence quotidiana su AI, Startup e Venture Capital
        </p>
        <p
          className="mt-1 text-[12px] text-[#1a1a1a]/40 italic"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}
        >
          Ricerche verificate, alert e briefing per chi prende decisioni.
        </p>
      </div>

      <Divider thick />

      {/* Nav sezioni + lettori */}
      <div className="flex items-center justify-between border-b border-[#1a1a1a]/15">
        <SectionNav />
        <div className="hidden sm:flex items-center px-3 border-l border-[#1a1a1a]/15">
          <ReadersCounter />
        </div>
      </div>
    </header>
  );
}
