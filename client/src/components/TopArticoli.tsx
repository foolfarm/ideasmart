import { trpc } from "@/lib/trpc";
import { useCallback } from "react";

// Mappa sezione → etichetta colore editoriale
const SECTION_COLORS: Record<string, string> = {
  ai: "#00e5c8",
  startup: "#ff5500",
  finance: "#f0b429",
  health: "#4ade80",
  sport: "#60a5fa",
  luxury: "#c084fc",
  music: "#f472b6",
  news: "#94a3b8",
  motori: "#fb923c",
  tennis: "#a3e635",
  basket: "#f97316",
  gossip: "#e879f9",
  cybersecurity: "#38bdf8",
  sondaggi: "#fbbf24",
};

const SECTION_LABELS: Record<string, string> = {
  ai: "AI4Business",
  startup: "Startup",
  finance: "Finance",
  health: "Health",
  sport: "Sport",
  luxury: "Luxury",
  music: "Music",
  news: "News Italia",
  motori: "Motori",
  tennis: "Tennis",
  basket: "Basket",
  gossip: "Gossip",
  cybersecurity: "Cyber",
  sondaggi: "Sondaggi",
};

interface TopArticoliProps {
  limit?: number;
}

export default function TopArticoli({ limit = 10 }: TopArticoliProps) {
  const { data: articles, isLoading } = trpc.news.getTopArticlesWeekly.useQuery(
    { limit },
    { staleTime: 1000 * 60 * 10 }
  );
  const trackView = trpc.news.trackView.useMutation();

  const handleArticleClick = useCallback(
    (id: number, url: string) => {
      trackView.mutate({ id });
      window.open(url, "_blank", "noopener,noreferrer");
    },
    [trackView]
  );

  if (isLoading) {
    return (
      <div
        className="border border-white/8 rounded-xl p-4"
        style={{ background: "#0d1526" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <span
            className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5"
            style={{
              color: "#ff5500",
              background: "#ff550015",
              fontFamily: "'Space Mono', monospace",
            }}
          >
            ● Più letti
          </span>
          <span
            className="text-[9px] uppercase tracking-widest"
            style={{ color: "#ffffff40", fontFamily: "'Space Mono', monospace" }}
          >
            questa settimana
          </span>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div
                className="w-6 h-6 rounded flex-shrink-0"
                style={{ background: "#ffffff10" }}
              />
              <div className="flex-1 space-y-1.5">
                <div
                  className="h-3 rounded w-full"
                  style={{ background: "#ffffff10" }}
                />
                <div
                  className="h-3 rounded w-3/4"
                  style={{ background: "#ffffff08" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!articles || articles.length === 0) return null;

  return (
    <div
      className="border border-white/8 rounded-xl p-4"
      style={{ background: "#0d1526" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5"
            style={{
              color: "#ff5500",
              background: "#ff550015",
              fontFamily: "'Space Mono', monospace",
            }}
          >
            ● Più letti
          </span>
          <span
            className="text-[9px] uppercase tracking-widest"
            style={{ color: "#ffffff40", fontFamily: "'Space Mono', monospace" }}
          >
            questa settimana
          </span>
        </div>
        <span
          className="text-[9px] uppercase tracking-widest"
          style={{ color: "#ffffff25", fontFamily: "'Space Mono', monospace" }}
        >
          Top {articles.length}
        </span>
      </div>

      {/* Lista articoli */}
      <ol className="space-y-0">
        {articles.map((article, idx) => {
          const sectionColor = SECTION_COLORS[article.section] ?? "#ffffff60";
          const sectionLabel = SECTION_LABELS[article.section] ?? article.section;
          const isTop3 = idx < 3;

          return (
            <li key={article.id}>
              <button
                className="w-full text-left group flex gap-3 py-2.5 transition-colors hover:bg-white/3 rounded-lg px-1 -mx-1"
                onClick={() =>
                  handleArticleClick(article.id, article.sourceUrl)
                }
              >
                {/* Numero ranking */}
                <div className="flex-shrink-0 w-6 flex items-start justify-center pt-0.5">
                  <span
                    className="text-sm font-bold leading-none"
                    style={{
                      color: isTop3 ? sectionColor : "#ffffff25",
                      fontFamily: "'Space Mono', monospace",
                    }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Contenuto */}
                <div className="flex-1 min-w-0">
                  {/* Badge sezione */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className="text-[8px] font-bold uppercase tracking-widest"
                      style={{
                        color: sectionColor,
                        fontFamily: "'Space Mono', monospace",
                      }}
                    >
                      {sectionLabel}
                    </span>
                    {article.viewCount > 0 && (
                      <span
                        className="text-[8px] uppercase tracking-widest"
                        style={{
                          color: "#ffffff25",
                          fontFamily: "'Space Mono', monospace",
                        }}
                      >
                        · {article.viewCount.toLocaleString("it-IT")} letture
                      </span>
                    )}
                  </div>

                  {/* Titolo */}
                  <p
                    className="text-xs font-semibold leading-snug group-hover:text-white transition-colors line-clamp-2"
                    style={{
                      color: isTop3 ? "#e8eaf0" : "#b0b8cc",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {article.title}
                  </p>
                </div>

                {/* Immagine thumbnail (solo top 3) */}
                {isTop3 && article.imageUrl && (
                  <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden opacity-70 group-hover:opacity-100 transition-opacity">
                    <img
                      src={article.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
              </button>

              {/* Separatore (non sull'ultimo) */}
              {idx < articles.length - 1 && (
                <div
                  className="h-px mx-1"
                  style={{ background: "#ffffff08" }}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
