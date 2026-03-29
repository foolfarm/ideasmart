/**
 * SectionChannelBar — Barra canali editoriali condivisa tra tutte le pagine sezione
 * Solo 3 canali attivi: AI NEWS, STARTUP NEWS, DEALROOM
 */
import { useRef, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

const SECTION_COLORS = {
  ai:       { accent: "#1a1a1a", light: "#e6f4f1", label: "AI NEWS",       path: "/ai" },
  startup:  { accent: "#2a2a2a", light: "#fff0e6", label: "STARTUP NEWS",  path: "/startup" },
  dealroom: { accent: "#1a4a2e", light: "#f0f7f3", label: "DEALROOM",      path: "/dealroom" },
} as const;

const SECTIONS = ["ai", "startup", "dealroom"] as const;
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

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const activeIdx = SECTIONS.findIndex(sec => {
      const s = SECTION_COLORS[sec];
      return location === s.path || location.startsWith(s.path + "/");
    });
    if (activeIdx > 1) {
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
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
                      borderLeft: i > 0 ? "1px solid rgba(26,26,46,0.12)" : "none",
                      background: isActive ? s.accent : "",
                      color: isActive ? "#fff" : "#1a1a1a",
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
                        (e.currentTarget as HTMLElement).style.color = "#1a1a1a";
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
                          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
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
            <span style={{ fontSize: "14px", color: "#1a1a1a", fontWeight: "bold" }}>›</span>
          </button>
        )}
      </div>
    </nav>
  );
}
