import SharedPageHeader from "@/components/SharedPageHeader";
/**
 * IDEASMART — AI Dealflow Europe
 * Selezioni startup giornaliere dal Startup Radar
 * Stile: editoriale finanziario, rating INVEST/INVEST+/INVEST++
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import SEOHead from "@/components/SEOHead";
import { Link } from "wouter";
import {
  Rocket,
  TrendingUp,
  ExternalLink,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Target,
  Zap,
  Star,
} from "lucide-react";

// ── Rating badge colors ─────────────────────────────────────────────────────
const RATING_CONFIG = {
  INVEST: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
    icon: Target,
    label: "INVEST",
    desc: "Investi moderato — da monitorare",
  },
  "INVEST+": {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
    icon: Zap,
    label: "INVEST+",
    desc: "Investi subito — opportunità concreta",
  },
  "INVEST++": {
    bg: "bg-red-50 dark:bg-red-950/40",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
    icon: Star,
    label: "INVEST++",
    desc: "Investi immediatamente — opportunità rara",
  },
} as const;

function formatDateIT(dateStr: string): string {
  try {
    const parts = dateStr.split("-");
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString("it-IT", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function Dealflow() {
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);

  // Fetch available dates
  const { data: dates = [], isLoading: datesLoading } = trpc.dealflow.dates.useQuery();

  // Use first available date if none selected
  const activeDate = selectedDate || (dates.length > 0 ? dates[0] : undefined);

  // Fetch picks for active date
  const { data: picks = [], isLoading: picksLoading } = trpc.dealflow.byDate.useQuery(
    { date: activeDate },
    { enabled: !!activeDate }
  );

  // Navigate between dates
  const currentDateIndex = useMemo(() => {
    if (!activeDate || dates.length === 0) return -1;
    return dates.indexOf(activeDate);
  }, [activeDate, dates]);

  const canGoNewer = currentDateIndex > 0;
  const canGoOlder = currentDateIndex < dates.length - 1 && currentDateIndex >= 0;

  const goNewer = () => {
    if (canGoNewer) setSelectedDate(dates[currentDateIndex - 1]);
  };
  const goOlder = () => {
    if (canGoOlder) setSelectedDate(dates[currentDateIndex + 1]);
  };

  const isLoading = datesLoading || picksLoading;

  return (
    <div className="flex min-h-screen">
      
      <div className="flex-1 min-w-0">
      <SEOHead
        title="AI Dealflow Europe — Proof Press"
        description="Le 10 startup AI europee più investibili del giorno, selezionate dal nostro radar con rating INVEST/INVEST+/INVEST++"
      />

      <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
        {/* Header */}
        <SharedPageHeader />

        {/* Rating Legend */}
        <div className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
          <div className="max-w-5xl mx-auto px-4 py-3">
            <div className="flex flex-wrap gap-4 text-xs">
              {Object.entries(RATING_CONFIG).map(([key, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <div key={key} className="flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${cfg.bg} ${cfg.text} ${cfg.border} font-semibold`}>
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                    <span className="text-neutral-500 dark:text-neutral-400">{cfg.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="border-b border-neutral-200 dark:border-neutral-800">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={goOlder}
              disabled={!canGoOlder}
              className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Precedente
            </button>

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-neutral-400" />
              <span className="font-medium text-neutral-800 dark:text-neutral-200 capitalize">
                {activeDate ? formatDateIT(activeDate) : "—"}
              </span>
            </div>

            <button
              onClick={goNewer}
              disabled={!canGoNewer}
              className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Successivo
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <main className="max-w-5xl mx-auto px-4 py-8">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
                  <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3 mb-3" />
                  <div className="h-4 bg-neutral-100 dark:bg-neutral-900 rounded w-2/3 mb-2" />
                  <div className="h-4 bg-neutral-100 dark:bg-neutral-900 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : picks.length === 0 ? (
            <div className="text-center py-20">
              <Rocket className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
              <p className="text-neutral-500 dark:text-neutral-400 text-lg">
                Nessuna selezione disponibile per questa data.
              </p>
              <p className="text-neutral-400 dark:text-neutral-500 text-sm mt-1">
                Le selezioni vengono pubblicate ogni giorno alle 14:30 CET.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {picks.map((pick) => {
                const ratingKey = pick.rating as keyof typeof RATING_CONFIG;
                const cfg = RATING_CONFIG[ratingKey] || RATING_CONFIG.INVEST;
                const Icon = cfg.icon;

                return (
                  <article
                    key={pick.id}
                    className="group border border-neutral-200 dark:border-neutral-800 rounded-lg hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 overflow-hidden"
                  >
                    <div className="p-5 sm:p-6">
                      {/* Top row: rank + name + rating */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm font-bold text-neutral-600 dark:text-neutral-400">
                            {pick.rank}
                          </span>
                          <div>
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                              {pick.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                              {pick.country && <span>{pick.country}</span>}
                              {pick.country && pick.sector && <span>·</span>}
                              {pick.sector && <span>{pick.sector}</span>}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded border text-xs font-bold whitespace-nowrap ${cfg.bg} ${cfg.text} ${cfg.border}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {cfg.label}
                        </span>
                      </div>

                      {/* Description */}
                      {pick.description && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-3 pl-11">
                          {pick.description}
                        </p>
                      )}

                      {/* Funding & Valuation */}
                      <div className="flex flex-wrap gap-3 pl-11 mb-3">
                        {pick.funding && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-neutral-500 dark:text-neutral-400">Funding:</span>
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200">{pick.funding}</span>
                          </div>
                        )}
                        {pick.valuation && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <ArrowUpRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span className="text-neutral-500 dark:text-neutral-400">Valutazione:</span>
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200">{pick.valuation}</span>
                          </div>
                        )}
                      </div>

                      {/* Link */}
                      {pick.link && (
                        <div className="pl-11">
                          <a
                            href={pick.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Visita sito
                          </a>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Footer CTA */}
          <div className="mt-12 border-t border-neutral-200 dark:border-neutral-800 pt-8 text-center">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
              Vuoi ricevere il Dealflow ogni giorno nella tua inbox?
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-lg text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
            >
              Iscriviti alla Newsletter
            </Link>
          </div>
        </main>
      </div>
      </div>
    </div>
  );
}
