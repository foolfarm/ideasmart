/**
 * BreakingNewsTicker — Barra di scorrimento automatico con le ultime notizie
 * Pivot IdeaSmart: mostra solo AI NEWS e STARTUP NEWS
 */
import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

type SectionKey = "ai" | "startup";

interface TickerItem {
  id: number;
  title: string;
  section: SectionKey;
}

const SECTION_META: Record<SectionKey, { label: string; color: string; path: string }> = {
  ai:      { label: "AI4BUSINESS", color: "#1a1a1a", path: "ai" },
  startup: { label: "STARTUP",     color: "#2a2a2a", path: "startup" },
};

export default function BreakingNewsTicker() {
  const trackRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);
  const posRef = useRef(0);
  const pausedRef = useRef(false);

  // Solo AI NEWS e STARTUP NEWS
  const { data: aiNews }      = trpc.news.getLatest.useQuery({ limit: 6, section: "ai" });
  const { data: startupNews } = trpc.news.getLatest.useQuery({ limit: 6, section: "startup" });

  // Interleave le notizie dei 2 canali attivi
  const allItems: TickerItem[] = [];
  const sources: [SectionKey, typeof aiNews][] = [
    ["ai", aiNews],
    ["startup", startupNews]
  ];
  const maxLen = Math.max(...sources.map(([, d]) => (d || []).length));
  for (let i = 0; i < maxLen; i++) {
    for (const [sec, data] of sources) {
      const item = (data || [])[i];
      if (item) allItems.push({ id: item.id, title: item.title, section: sec });
    }
  }

  // Duplica per loop continuo
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
      className="w-full overflow-hidden border-b border-[#1a1a1a]/20"
      style={{ background: "#1a1a1a", height: "36px" }}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      <div className="flex items-center h-full">
        {/* Label "LIVE" */}
        <div
          className="flex-shrink-0 flex items-center px-3 h-full text-[10px] font-bold uppercase tracking-widest z-10"
          style={{
            background: "#e63946",
            color: "#fff",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
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
              const meta = SECTION_META[item.section];
              const path = `/${meta.path}/news/${item.id}`;
              return (
                <span key={`${item.id}-${idx}`} className="inline-flex items-center gap-2 px-5">
                  <span
                    className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm flex-shrink-0"
                    style={{ background: meta.color + "30", color: meta.color, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                  >
                    {meta.label}
                  </span>
                  <Link href={path}>
                    <span
                      className="text-xs text-white/80 hover:text-white transition-colors cursor-pointer"
                      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}
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
