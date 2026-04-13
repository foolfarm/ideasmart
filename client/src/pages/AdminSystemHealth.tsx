/**
 * AdminSystemHealth — Pannello "Salute del Sistema"
 * Stile Apple monocromatico con AdminHeader condiviso
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { RefreshCw, Activity, Clock, Database, Zap } from "lucide-react";
import AdminHeader from "@/components/AdminHeader";

type SectionKey = "ai" | "startup" | "dealroom" | "all";

const C = {
  bg: "#f5f5f7",
  white: "#ffffff",
  black: "#1d1d1f",
  mid: "#6e6e73",
  light: "#aeaeb2",
  border: "#e5e5ea",
  font: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
};

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatRelativeTime(date: Date | null): string {
  if (!date) return "—";
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "adesso";
  if (minutes < 60) return `${minutes}m fa`;
  if (hours < 24) return `${hours}h fa`;
  return `${days}g fa`;
}

function getStatusColor(todayCount: number, latestCreatedAt: Date | null): "green" | "yellow" | "red" {
  if (!latestCreatedAt) return "red";
  const hoursSince = (Date.now() - new Date(latestCreatedAt).getTime()) / 3600000;
  if (todayCount > 0 && hoursSince < 12) return "green";
  if (hoursSince < 24) return "yellow";
  return "red";
}

export default function AdminSystemHealth() {
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [triggeringSection, setTriggeringSection] = useState<string | null>(null);
  const [lastTriggered, setLastTriggered] = useState<Record<string, Date>>({});

  const { data, isLoading, refetch, dataUpdatedAt } = trpc.health.getSystemHealth.useQuery(undefined, {
    refetchInterval: 60_000,
  });

  const triggerMutation = trpc.health.triggerSectionScraping.useMutation({
    onSuccess: (result, variables) => {
      setLastTriggered(prev => ({ ...prev, [variables.section]: new Date() }));
      toast.success("Scraping avviato", { description: result.message });
      setTriggeringSection(null);
      setTimeout(() => refetch(), 10_000);
    },
    onError: (err) => {
      toast.error("Errore", { description: err.message });
      setTriggeringSection(null);
    }
  });

  const handleTrigger = (section: SectionKey) => {
    setTriggeringSection(section);
    triggerMutation.mutate({ section });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: C.black }} />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <div className="text-center">
          <p className="text-sm mb-4" style={{ color: C.mid }}>Accesso non autorizzato.</p>
          <button onClick={() => navigate("/")} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: C.black, color: "#fff" }}>
            Torna alla Home
          </button>
        </div>
      </div>
    );
  }

  const sections = data?.sections ?? [];
  const greenCount = sections.filter(s => getStatusColor(s.todayCount, s.latestCreatedAt) === "green").length;
  const yellowCount = sections.filter(s => getStatusColor(s.todayCount, s.latestCreatedAt) === "yellow").length;
  const redCount = sections.filter(s => getStatusColor(s.todayCount, s.latestCreatedAt) === "red").length;

  return (
    <div className="min-h-screen" style={{ background: C.bg, fontFamily: C.font }}>
      <AdminHeader title="Salute Sistema" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl p-4 border" style={{ background: C.white, borderColor: C.border }}>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4" style={{ color: C.mid }} />
              <span className="text-xs uppercase tracking-wider" style={{ color: C.light }}>Uptime</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: C.black }}>
              {data ? formatUptime(data.uptime) : "—"}
            </p>
          </div>
          <div className="rounded-xl p-4 border" style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs uppercase tracking-wider" style={{ color: C.light }}>Aggiornate oggi</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{greenCount}</p>
          </div>
          <div className="rounded-xl p-4 border" style={{ background: "#fffbeb", borderColor: "#fde68a" }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-xs uppercase tracking-wider" style={{ color: C.light }}>Parziali</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{yellowCount}</p>
          </div>
          <div className="rounded-xl p-4 border" style={{ background: "#fef2f2", borderColor: "#fecaca" }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs uppercase tracking-wider" style={{ color: C.light }}>Da aggiornare</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{redCount}</p>
          </div>
        </div>

        {/* Trigger All button */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => handleTrigger("all")}
            disabled={triggeringSection === "all"}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
            style={{ background: C.black, color: "#fff" }}
          >
            <Zap className={`w-4 h-4 ${triggeringSection === "all" ? "animate-spin" : ""}`} />
            {triggeringSection === "all" ? "Avvio in corso..." : "Aggiorna Tutti i Canali"}
          </button>
          {lastTriggered["all"] && (
            <span className="text-xs" style={{ color: C.light }}>
              Avviato {formatRelativeTime(lastTriggered["all"])}
            </span>
          )}
          <span className="text-xs" style={{ color: C.light }}>Lo scraping parte in background — ricarica tra 2–3 minuti</span>
        </div>

        {/* Section table */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: C.border }} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {sections.map((s) => {
              const status = getStatusColor(s.todayCount, s.latestCreatedAt);
              const isTriggering = triggeringSection === s.key;
              const wasTriggered = !!lastTriggered[s.key];
              const statusStyles = {
                green: { dot: "bg-green-500", border: "#bbf7d0", bg: "#f0fdf4" },
                yellow: { dot: "bg-yellow-500", border: "#fde68a", bg: "#fffbeb" },
                red: { dot: "bg-red-500", border: "#fecaca", bg: "#fef2f2" }
              };
              const sc = statusStyles[status];

              return (
                <div
                  key={s.key}
                  className="rounded-xl p-4 flex items-center gap-4 border"
                  style={{ background: sc.bg, borderColor: sc.border }}
                >
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${sc.dot}`} />

                  <div className="w-36 flex-shrink-0">
                    <p className="text-sm font-semibold" style={{ color: C.black }}>
                      {s.icon} {s.label}
                    </p>
                  </div>

                  <div className="flex-1 min-w-0">
                    {s.latestTitle ? (
                      <p className="text-xs truncate" style={{ color: C.mid }}>{s.latestTitle}</p>
                    ) : (
                      <p className="text-xs italic text-red-500">Nessuna notizia nel DB</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-xs mb-0.5" style={{ color: C.light }}>
                        <Clock className="w-3 h-3" />
                        <span>Ultima</span>
                      </div>
                      <p className="text-xs font-semibold" style={{ color: C.mid }}>
                        {formatRelativeTime(s.latestCreatedAt)}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-xs mb-0.5" style={{ color: C.light }}>
                        <Activity className="w-3 h-3" />
                        <span>Oggi</span>
                      </div>
                      <span
                        className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                        style={{
                          background: s.todayCount > 0 ? "#dcfce7" : "#fee2e2",
                          color: s.todayCount > 0 ? "#166534" : "#991b1b",
                        }}
                      >
                        {s.todayCount}
                      </span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-xs mb-0.5" style={{ color: C.light }}>
                        <Database className="w-3 h-3" />
                        <span>Tot.</span>
                      </div>
                      <p className="text-xs font-semibold" style={{ color: C.mid }}>{s.totalCount}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleTrigger(s.key as SectionKey)}
                    disabled={isTriggering || triggeringSection === "all"}
                    className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all disabled:opacity-50"
                    style={{
                      background: wasTriggered ? "#f0fdf4" : C.white,
                      color: wasTriggered ? "#166534" : C.black,
                      borderColor: wasTriggered ? "#bbf7d0" : C.border,
                    }}
                  >
                    <RefreshCw className={`w-3 h-3 ${isTriggering ? "animate-spin" : ""}`} />
                    {isTriggering ? "Avvio..." : wasTriggered ? "Avviato" : "Aggiorna"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Refresh + Server info */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all"
              style={{ background: C.white, color: C.black, borderColor: C.border }}
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
              Aggiorna
            </button>
            {dataUpdatedAt && (
              <span className="text-xs" style={{ color: C.light }}>
                Aggiornato {formatRelativeTime(new Date(dataUpdatedAt))}
              </span>
            )}
          </div>
        </div>

        {data && (
          <div className="mt-4 rounded-xl p-4 flex items-center gap-6 border" style={{ background: C.white, borderColor: C.border }}>
            <div>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: C.light }}>Server Time</p>
              <p className="text-sm" style={{ color: C.mid }}>{new Date(data.serverTime).toLocaleString("it-IT", { timeZone: "Europe/Rome" })} CET</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: C.light }}>Uptime</p>
              <p className="text-sm" style={{ color: C.mid }}>{formatUptime(data.uptime)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: C.light }}>Sezioni monitorate</p>
              <p className="text-sm" style={{ color: C.mid }}>{sections.length}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: C.light }}>Totale notizie DB</p>
              <p className="text-sm" style={{ color: C.mid }}>{sections.reduce((acc, s) => acc + s.totalCount, 0).toLocaleString("it-IT")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
