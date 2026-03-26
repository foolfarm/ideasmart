/**
 * BreakingNewsSection — Sezione Breaking News in cima alla Homepage
 * Mostra le notizie urgenti selezionate ogni ora dall'AI.
 * Si aggiorna automaticamente ogni 5 minuti.
 * Se non ci sono breaking news attive, il componente non viene renderizzato.
 */
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { ExternalLink, AlertTriangle, Clock, Zap } from "lucide-react";

// Mappa sezione → colore badge
const SECTION_COLORS: Record<string, string> = {
  ai: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  startup: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  finance: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  sport: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  health: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  luxury: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  music: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  news: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  motori: "bg-red-500/20 text-red-300 border-red-500/30",
  tennis: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  basket: "bg-orange-600/20 text-orange-300 border-orange-600/30",
  gossip: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30",
  cybersecurity: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  sondaggi: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
};

const SECTION_LABELS: Record<string, string> = {
  ai: "AI",
  startup: "Startup",
  finance: "Finance",
  sport: "Sport",
  health: "Health",
  luxury: "Luxury",
  music: "Music",
  news: "Italia",
  motori: "Motori",
  tennis: "Tennis",
  basket: "Basket",
  gossip: "Gossip",
  cybersecurity: "Cyber",
  sondaggi: "Sondaggi",
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
      refetchInterval: 5 * 60 * 1000, // aggiorna ogni 5 minuti
      staleTime: 4 * 60 * 1000,
    }
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [now, setNow] = useState(new Date());

  // Ticker: scorre automaticamente tra le breaking news ogni 8 secondi
  useEffect(() => {
    if (!breakingNews || breakingNews.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % breakingNews.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [breakingNews]);

  // Aggiorna il timestamp "X min fa" ogni minuto
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  // Non mostrare nulla se non ci sono breaking news
  if (isLoading || !breakingNews || breakingNews.length === 0) return null;

  const active = breakingNews[activeIndex];
  const sectionColor = SECTION_COLORS[active.section] ?? SECTION_COLORS.news;
  const sectionLabel = SECTION_LABELS[active.section] ?? active.section.toUpperCase();

  return (
    <div className="w-full bg-red-950/40 border-y border-red-500/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-0">
        {/* Barra principale breaking */}
        <div className="flex items-stretch min-h-[52px]">
          {/* Badge BREAKING */}
          <div className="flex items-center gap-1.5 px-4 bg-red-600 text-white font-black text-xs tracking-widest uppercase shrink-0 select-none">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>BREAKING</span>
          </div>

          {/* Separatore */}
          <div className="w-px bg-red-500/40 shrink-0" />

          {/* Contenuto scorrevole */}
          <div className="flex-1 flex items-center gap-3 px-4 overflow-hidden">
            {/* Badge sezione */}
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 uppercase tracking-wide ${sectionColor}`}
            >
              {sectionLabel}
            </span>

            {/* Titolo */}
            <a
              href={active.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-white/95 hover:text-red-300 transition-colors truncate leading-tight"
              title={active.title}
            >
              {active.title}
            </a>

            {/* Link esterno */}
            <ExternalLink className="w-3.5 h-3.5 text-white/40 shrink-0 hidden sm:block" />
          </div>

          {/* Timestamp + fonte */}
          <div className="hidden md:flex items-center gap-2 px-4 shrink-0 text-white/40 text-xs">
            <Clock className="w-3 h-3" />
            <span>{formatTimeAgo(new Date(active.createdAt))}</span>
            <span className="text-white/20">·</span>
            <span className="truncate max-w-[120px]">{active.sourceName}</span>
          </div>

          {/* Paginazione punti */}
          {breakingNews.length > 1 && (
            <div className="flex items-center gap-1.5 px-4 shrink-0">
              {breakingNews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === activeIndex
                      ? "bg-red-400 w-3"
                      : "bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`Breaking news ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sommario espanso (solo se c'è) */}
        {active.summary && (
          <div className="px-4 pb-2.5 pt-0 border-t border-red-500/20">
            <p className="text-xs text-white/55 leading-relaxed line-clamp-2">
              {active.summary}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
