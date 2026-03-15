/**
 * BreakingNewsTicker — Barra di scorrimento automatico con le ultime notizie
 * Stile: giornale digitale, scorrimento continuo da destra a sinistra
 * Usato in: Home, AiHome, MusicHome, StartupHome
 */
import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

interface TickerItem {
  id: number;
  title: string;
  category: string;
  section: "ai" | "music" | "startup";
}

function getSectionPath(section: string): string {
  if (section === "music") return "music";
  if (section === "startup") return "startup";
  return "ai";
}

function getSectionColor(section: string): string {
  if (section === "music") return "#5b21b6";
  if (section === "startup") return "#c2410c";
  return "#0a6e5c";
}

function getSectionLabel(section: string): string {
  if (section === "music") return "MUSIC";
  if (section === "startup") return "STARTUP";
  return "AI";
}

export default function BreakingNewsTicker() {
  const trackRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);
  const posRef = useRef(0);
  const pausedRef = useRef(false);

  // Fetch latest news from all three sections
  const { data: aiNews } = trpc.news.getLatest.useQuery({ limit: 5, section: "ai" });
  const { data: musicNews } = trpc.news.getLatest.useQuery({ limit: 5, section: "music" });
  const { data: startupNews } = trpc.news.getLatest.useQuery({ limit: 5, section: "startup" });

  const allItems: TickerItem[] = [
    ...(aiNews || []).slice(0, 5).map(n => ({ id: n.id, title: n.title, category: n.category, section: "ai" as const })),
    ...(musicNews || []).slice(0, 5).map(n => ({ id: n.id, title: n.title, category: n.category, section: "music" as const })),
    ...(startupNews || []).slice(0, 5).map(n => ({ id: n.id, title: n.title, category: n.category, section: "startup" as const })),
  ];

  // Duplicate items for seamless loop
  const displayItems = allItems.length > 0 ? [...allItems, ...allItems] : [];

  useEffect(() => {
    const track = trackRef.current;
    if (!track || displayItems.length === 0) return;

    const speed = 0.5; // px per frame

    const animate = () => {
      if (!pausedRef.current && track) {
        posRef.current -= speed;
        const halfWidth = track.scrollWidth / 2;
        if (Math.abs(posRef.current) >= halfWidth) {
          posRef.current = 0;
        }
        track.style.transform = `translateX(${posRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [displayItems.length]);

  if (allItems.length === 0) return null;

  return (
    <div
      className="w-full overflow-hidden border-b border-[#1a1a2e]/20"
      style={{ background: "#1a1a2e", height: "36px" }}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      <div className="flex items-center h-full">
        {/* Label "BREAKING" */}
        <div
          className="flex-shrink-0 flex items-center px-3 h-full text-[10px] font-bold uppercase tracking-widest z-10"
          style={{
            background: "#e63946",
            color: "#fff",
            fontFamily: "'Space Mono', monospace",
            minWidth: "90px",
            letterSpacing: "0.15em",
          }}
        >
          LIVE
        </div>

        {/* Scrolling track */}
        <div className="flex-1 overflow-hidden relative h-full">
          <div
            ref={trackRef}
            className="flex items-center h-full gap-0 whitespace-nowrap"
            style={{ willChange: "transform" }}
          >
            {displayItems.map((item, idx) => {
              const color = getSectionColor(item.section);
              const label = getSectionLabel(item.section);
              const path = `/${getSectionPath(item.section)}/news/${item.id}`;
              return (
                <span key={`${item.id}-${idx}`} className="inline-flex items-center gap-2 px-5">
                  <span
                    className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm flex-shrink-0"
                    style={{ background: color + "30", color: color, fontFamily: "'Space Mono', monospace" }}
                  >
                    {label}
                  </span>
                  <Link href={path}>
                    <span
                      className="text-xs text-white/80 hover:text-white transition-colors cursor-pointer"
                      style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
                    >
                      {item.title}
                    </span>
                  </Link>
                  <span className="text-white/20 text-xs mx-1">·</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
