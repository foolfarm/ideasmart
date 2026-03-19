/**
 * SectionChannelBar — Barra canali editoriali condivisa tra tutte le pagine sezione
 * Mostra tutti i canali con evidenziazione del canale attivo, badge contatori, freccia scorrimento mobile.
 * Da includere in cima a ogni pagina sezione (AiHome, StartupHome, ecc.) subito dopo la testata.
 */
import { useRef, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

const SECTION_COLORS = {
  ai:           { accent: "#0a6e5c", light: "#e6f4f1", label: "AI4Business",      path: "/ai" },
  music:        { accent: "#5b21b6", light: "#ede9fe", label: "ITsMusic",          path: "/music" },
  startup:      { accent: "#c2410c", light: "#fff0e6", label: "Startup News",      path: "/startup" },
  finance:      { accent: "#15803d", light: "#f0fdf4", label: "Finance & Markets", path: "/finance" },
  health:       { accent: "#0369a1", light: "#eff6ff", label: "Health & Biotech",  path: "/health" },
  sport:        { accent: "#b45309", light: "#fffbeb", label: "Sport & Business",  path: "/sport" },
  luxury:       { accent: "#7c3aed", light: "#faf5ff", label: "Lifestyle & Luxury",path: "/luxury" },
  news:         { accent: "#1a1f2e", light: "#f1f5f9", label: "News Italia",        path: "/news" },
  motori:       { accent: "#dc2626", light: "#fef2f2", label: "Motori",             path: "/motori" },
  tennis:       { accent: "#65a30d", light: "#f7fee7", label: "Tennis",             path: "/tennis" },
  basket:       { accent: "#ea580c", light: "#fff7ed", label: "Basket",             path: "/basket" },
  gossip:       { accent: "#db2777", light: "#fdf2f8", label: "Business Gossip",    path: "/gossip" },
  cybersecurity:{ accent: "#0ea5e9", light: "#f0f9ff", label: "Cybersecurity",      path: "/cybersecurity" },
  sondaggi:     { accent: "#8b5cf6", light: "#f5f3ff", label: "Sondaggi",           path: "/sondaggi" },
} as const;

const SECTIONS = ["news", "ai", "startup", "finance", "sport", "motori", "tennis", "basket", "health", "luxury", "music", "gossip", "cybersecurity", "sondaggi"] as const;
type SectionKey = typeof SECTIONS[number];

export default function SectionChannelBar() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [location] = useLocation();

  const { data: sectionCounts } = trpc.news.getSectionCounts.useQuery(undefined, {
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    check();
    el.addEventListener("scroll", check);
    window.addEventListener("resize", check);
    return () => {
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  // Scrolla automaticamente al canale attivo al mount
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const activeIdx = SECTIONS.findIndex(sec => {
      const s = SECTION_COLORS[sec];
      return location === s.path || location.startsWith(s.path + "/");
    });
    if (activeIdx > 3) {
      // Scorri per mostrare il canale attivo
      const items = el.querySelectorAll("a");
      if (items[activeIdx]) {
        items[activeIdx].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [location]);

  return (
    <nav
      className="border-t border-b overflow-hidden"
      style={{ borderColor: "rgba(26,26,46,0.15)", background: "#faf8f3" }}
    >
      {/* Riga canali editoriali */}
      <div className="relative">
        <div ref={scrollRef} className="overflow-x-auto scrollbar-hide">
          <div className="flex items-stretch min-w-max">
            {SECTIONS.map((sec: SectionKey, i) => {
              const s = SECTION_COLORS[sec];
              const isActive = location === s.path || location.startsWith(s.path + "/");
              return (
                <Link key={sec} href={s.path}>
                  <span
                    className="relative flex items-center px-4 py-2.5 text-[9.5px] font-bold uppercase tracking-[0.12em] cursor-pointer transition-all duration-200"
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      borderLeft: i > 0 ? "1px solid rgba(26,26,46,0.12)" : "none",
                      background: isActive ? s.accent : "",
                      color: isActive ? "#fff" : "#1a1a2e",
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = s.accent;
                        (e.currentTarget as HTMLElement).style.color = "#fff";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = "";
                        (e.currentTarget as HTMLElement).style.color = "#1a1a2e";
                      }
                    }}
                  >
                    {s.label}
                    {sectionCounts && (sectionCounts as Record<string, number>)[sec] > 0 && (
                      <span
                        className="ml-1.5 text-[8px] font-bold px-1 py-0.5 rounded-sm"
                        style={{
                          background: isActive ? "rgba(255,255,255,0.25)" : s.light,
                          color: isActive ? "#fff" : s.accent,
                          fontFamily: "'Space Mono', monospace",
                          lineHeight: 1,
                        }}
                      >
                        {(sectionCounts as Record<string, number>)[sec]}
                      </span>
                    )}
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-0 right-0 h-[2px]"
                        style={{ background: "#fff", opacity: 0.6 }}
                      />
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
        {/* Freccia scorrimento mobile */}
        {canScrollRight && (
          <button
            className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-8 pointer-events-auto"
            style={{
              background: "linear-gradient(to right, transparent, #faf8f3 70%)",
              border: "none",
              cursor: "pointer",
            }}
            onClick={() => scrollRef.current?.scrollBy({ left: 120, behavior: "smooth" })}
            aria-label="Scorri canali"
          >
            <span style={{ fontSize: "14px", color: "#1a1a2e", fontWeight: "bold" }}>›</span>
          </button>
        )}
      </div>
    </nav>
  );
}
