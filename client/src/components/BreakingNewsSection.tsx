/**
 * BreakingNewsSection — Sezione Breaking News in cima alla Homepage
 * Mostra le notizie urgenti selezionate ogni ora dall'AI.
 * Si aggiorna automaticamente ogni 5 minuti.
 * Se non ci sono breaking news attive, il componente non viene renderizzato.
 * Stile: chiaro, editoriale — coerente con il resto del giornale.
 */
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { Clock, Zap } from "lucide-react";
import { Link } from "wouter";

// Mappa sezione → colore badge (testo scuro su sfondo chiaro)
const SECTION_COLORS: Record<string, string> = {
  ai:      "bg-cyan-100 text-cyan-800 border-cyan-200",
  startup: "bg-violet-100 text-violet-800 border-violet-200",
  health:  "bg-rose-100 text-rose-800 border-rose-200",
};

const SECTION_LABELS: Record<string, string> = {
  ai: "AI",
  startup: "Startup",
  health: "Health",
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Adesso";
  if (diffMin < 60) return `${diffMin} min fa`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h fa`;
  return `${Math.floor(diffH / 24)}g fa`;
}

export default function BreakingNewsSection() {
  const { data: breakingNews, isLoading } = trpc.news.getBreakingNews.useQuery(
    undefined,
    {
      refetchInterval: 5 * 60 * 1000,
      staleTime: 4 * 60 * 1000,
    }
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [, setNow] = useState(new Date());

  // Ticker: scorre automaticamente ogni 8 secondi
  useEffect(() => {
    if (!breakingNews || breakingNews.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % breakingNews.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [breakingNews]);

  // Aggiorna il timestamp ogni minuto
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  // Reset activeIndex se fuori range
  useEffect(() => {
    if (breakingNews && activeIndex >= breakingNews.length) {
      setActiveIndex(0);
    }
  }, [breakingNews, activeIndex]);

  if (isLoading || !breakingNews || breakingNews.length === 0) return null;

  const safeIndex = activeIndex < breakingNews.length ? activeIndex : 0;
  const active = breakingNews[safeIndex];
  if (!active) return null;

  const sectionColor = SECTION_COLORS[active.section] ?? SECTION_COLORS.ai;
  const sectionLabel = SECTION_LABELS[active.section] ?? (active.section?.toUpperCase() ?? "NEWS");

  // Costruisce il link interno alla sezione
  const articleHref = `/${active.section ?? "ai"}`;

  return (
    <div
      style={{
        background: "#ffffff",
        borderTop: "2px solid #1d1d1f",
        borderBottom: "1px solid #e5e5ea",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-0">
        {/* Barra principale */}
        <div className="flex items-stretch min-h-[48px]">

          {/* Badge BREAKING */}
          <div
            style={{
              background: "#1d1d1f",
              color: "#fff",
              fontWeight: 900,
              fontSize: "10px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "0 14px",
              flexShrink: 0,
              userSelect: "none",
            }}
          >
            <Zap className="w-3 h-3 fill-current" />
            <span>Breaking</span>
          </div>

          {/* Separatore */}
          <div style={{ width: "1px", background: "rgba(26,26,26,0.12)", flexShrink: 0 }} />

          {/* Contenuto */}
          <div className="flex-1 flex items-center gap-3 px-4 overflow-hidden">
            {/* Badge sezione */}
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 uppercase tracking-wide ${sectionColor}`}
            >
              {sectionLabel}
            </span>

            {/* Titolo — link interno */}
            <Link href={articleHref}>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#1a1a1a",
                  lineHeight: 1.3,
                  cursor: "pointer",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif",
                }}
                className="hover:text-[#0071e3] transition-colors truncate block"
                title={active.title}
              >
                {active.title}
              </span>
            </Link>
          </div>

          {/* Timestamp + fonte */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "0 16px",
              flexShrink: 0,
              fontSize: "11px",
              color: "rgba(26,26,26,0.45)",
            }}
            className="hidden md:flex"
          >
            <Clock className="w-3 h-3" />
            <span>{formatTimeAgo(new Date(active.createdAt))}</span>
            <span style={{ color: "rgba(26,26,26,0.2)" }}>·</span>
            <span className="truncate max-w-[120px]">{active.sourceName}</span>
          </div>

          {/* Paginazione punti */}
          {breakingNews.length > 1 && (
            <div className="flex items-center gap-1.5 px-4 shrink-0">
              {breakingNews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === activeIndex
                      ? "bg-[#1d1d1f] w-3"
                      : "bg-[#1d1d1f]/20 hover:bg-[#1d1d1f]/40 w-1.5"
                  }`}
                  aria-label={`Breaking news ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sommario */}
        {active.summary && (
          <div
            style={{
              padding: "0 14px 10px",
              borderTop: "1px solid rgba(26,26,26,0.07)",
              paddingTop: "6px",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                color: "rgba(26,26,26,0.60)",
                lineHeight: 1.5,
                margin: 0,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Arial, sans-serif",
              }}
            >
              {active.summary}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
