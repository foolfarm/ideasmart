/**
 * SharedPageHeader — Testata condivisa identica alla Home
 * Usato da: /research, /ai, /startup, /chi-siamo e tutte le pagine interne
 * Struttura: data + tagline | IDEASMART (grande) | nav sezioni + lettori
 */
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

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
    { key: "ai",      label: "AI4Business", path: "/ai",          accent: "#1a1a1a" },
    { key: "startup", label: "Startup News", path: "/startup",     accent: "#2a2a2a" },
    { key: "research",label: "Research",     path: "/research",    accent: "#1a1a1a" },
    { key: "chi-siamo",label: "Chi Siamo",   path: "/chi-siamo",   accent: "#1a1a1a" },
    { key: "intelligence", label: "▶ Intelligence", path: "/intelligence", accent: "#1a1a1a" },
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
              {count > 0 && (item.key === "ai" || item.key === "startup") && (
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

  return (
    <header
      className="max-w-[1280px] mx-auto px-4 pt-5 pb-0"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
    >
      {/* Riga data + tagline */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-[#1a1a1a]/50 uppercase tracking-widest">
          {formatDateIT(today)}
        </span>
        <span className="text-[11px] text-[#1a1a1a]/40 uppercase tracking-widest">
          Research · AI · Startup · Venture Capital
        </span>
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
