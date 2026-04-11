/**
 * AdminSystemHealth — Pannello "Salute del Sistema"
 * Mostra lo stato di aggiornamento di tutte le 14 sezioni:
 * - Ultima notizia inserita (titolo + timestamp)
 * - Notizie inserite oggi
 * - Totale notizie nel DB
 * - Pulsante trigger manuale scraping per ogni sezione
 * - Pulsante "Aggiorna Tutto" per avviare tutti i canali
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RefreshCw, ArrowLeft, Activity, Clock, Database, Zap } from "lucide-react";

type SectionKey = "ai" | "startup" | "dealroom" | "all";

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
    refetchInterval: 60_000, // aggiorna ogni minuto
  });

  const triggerMutation = trpc.health.triggerSectionScraping.useMutation({
    onSuccess: (result, variables) => {
      setLastTriggered(prev => ({ ...prev, [variables.section]: new Date() }));
      toast.success("Scraping avviato", { description: result.message });
      setTriggeringSection(null);
      // Ricarica i dati dopo 10 secondi
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f5f5f7" }}>
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f5f5f7" }}>
        <p className="text-white/60">Accesso non autorizzato.</p>
      </div>
    );
  }

  const sections = data?.sections ?? [];
  const greenCount = sections.filter(s => getStatusColor(s.todayCount, s.latestCreatedAt) === "green").length;
  const yellowCount = sections.filter(s => getStatusColor(s.todayCount, s.latestCreatedAt) === "yellow").length;
  const redCount = sections.filter(s => getStatusColor(s.todayCount, s.latestCreatedAt) === "red").length;

  return (
    <div className="min-h-screen" style={{ background: "#f5f5f7", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.4)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Admin
            </button>
            <span className="text-white/20">/</span>
            <span className="text-white font-bold" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
              Salute del Sistema
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/30">
              {dataUpdatedAt ? `Aggiornato ${formatRelativeTime(new Date(dataUpdatedAt))}` : ""}
            </span>
            <Button
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="bg-white/10 hover:bg-white/20 text-white border-0"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? "animate-spin" : ""}`} />
              Aggiorna
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-white/40 uppercase tracking-wider">Uptime</span>
            </div>
            <p className="text-2xl font-bold text-white" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
              {data ? formatUptime(data.uptime) : "—"}
            </p>
          </div>
          <div className="rounded-xl p-4" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs text-white/40 uppercase tracking-wider">Aggiornate oggi</span>
            </div>
            <p className="text-2xl font-bold text-green-400" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
              {greenCount}
            </p>
          </div>
          <div className="rounded-xl p-4" style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)" }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-xs text-white/40 uppercase tracking-wider">Parziali</span>
            </div>
            <p className="text-2xl font-bold text-yellow-400" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
              {yellowCount}
            </p>
          </div>
          <div className="rounded-xl p-4" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-xs text-white/40 uppercase tracking-wider">Da aggiornare</span>
            </div>
            <p className="text-2xl font-bold text-red-400" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
              {redCount}
            </p>
          </div>
        </div>

        {/* Trigger All button */}
        <div className="mb-6 flex items-center gap-4">
          <Button
            onClick={() => handleTrigger("all")}
            disabled={triggeringSection === "all"}
            className="font-bold"
            style={{ background: "#2a2a2a", color: "#fff", border: "none" }}
          >
            <Zap className={`w-4 h-4 mr-2 ${triggeringSection === "all" ? "animate-spin" : ""}`} />
            {triggeringSection === "all" ? "Avvio in corso..." : "Aggiorna Tutti i Canali"}
          </Button>
          {lastTriggered["all"] && (
            <span className="text-xs text-white/30">
              Avviato {formatRelativeTime(lastTriggered["all"])}
            </span>
          )}
          <span className="text-xs text-white/30">Lo scraping parte in background — ricarica tra 2-3 minuti</span>
        </div>

        {/* Section table */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {sections.map((s) => {
              const status = getStatusColor(s.todayCount, s.latestCreatedAt);
              const isTriggering = triggeringSection === s.key;
              const wasTriggered = !!lastTriggered[s.key];
              const statusColors = {
                green: { dot: "bg-green-400", border: "rgba(34,197,94,0.15)", bg: "rgba(34,197,94,0.04)" },
                yellow: { dot: "bg-yellow-400", border: "rgba(234,179,8,0.2)", bg: "rgba(234,179,8,0.04)" },
                red: { dot: "bg-red-400", border: "rgba(239,68,68,0.2)", bg: "rgba(239,68,68,0.04)" }
              };
              const sc = statusColors[status];

              return (
                <div
                  key={s.key}
                  className="rounded-xl p-4 flex items-center gap-4"
                  style={{ background: sc.bg, border: `1px solid ${sc.border}` }}
                >
                  {/* Status dot */}
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${sc.dot}`} />

                  {/* Icon + label */}
                  <div className="w-36 flex-shrink-0">
                    <p className="text-sm font-bold text-white" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                      {s.icon} {s.label}
                    </p>
                  </div>

                  {/* Latest news */}
                  <div className="flex-1 min-w-0">
                    {s.latestTitle ? (
                      <p className="text-xs text-white/60 truncate">{s.latestTitle}</p>
                    ) : (
                      <p className="text-xs text-red-400/60 italic">Nessuna notizia nel DB</p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-white/30 text-xs mb-0.5">
                        <Clock className="w-3 h-3" />
                        <span>Ultima</span>
                      </div>
                      <p className="text-xs font-semibold text-white/70">
                        {formatRelativeTime(s.latestCreatedAt)}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-white/30 text-xs mb-0.5">
                        <Activity className="w-3 h-3" />
                        <span>Oggi</span>
                      </div>
                      <Badge
                        className="text-xs font-bold"
                        style={{
                          background: s.todayCount > 0 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                          color: s.todayCount > 0 ? "#4ade80" : "#f87171",
                          border: "none"
                        }}
                      >
                        {s.todayCount}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-white/30 text-xs mb-0.5">
                        <Database className="w-3 h-3" />
                        <span>Tot.</span>
                      </div>
                      <p className="text-xs font-semibold text-white/50">{s.totalCount}</p>
                    </div>
                  </div>

                  {/* Trigger button */}
                  <Button
                    size="sm"
                    onClick={() => handleTrigger(s.key as SectionKey)}
                    disabled={isTriggering || triggeringSection === "all"}
                    className="flex-shrink-0 text-xs font-bold"
                    style={{
                      background: wasTriggered ? "rgba(0,229,200,0.15)" : "rgba(255,255,255,0.08)",
                      color: wasTriggered ? "#1a1a1a" : "rgba(255,255,255,0.6)",
                      border: wasTriggered ? "1px solid rgba(0,229,200,0.3)" : "1px solid rgba(255,255,255,0.1)"
                    }}
                  >
                    <RefreshCw className={`w-3 h-3 mr-1 ${isTriggering ? "animate-spin" : ""}`} />
                    {isTriggering ? "Avvio..." : wasTriggered ? "Avviato" : "Aggiorna"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Server info */}
        {data && (
          <div className="mt-6 rounded-xl p-4 flex items-center gap-6" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div>
              <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Server Time</p>
              <p className="text-sm text-white/60">{new Date(data.serverTime).toLocaleString("it-IT", { timeZone: "Europe/Rome" })} CET</p>
            </div>
            <div>
              <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Uptime</p>
              <p className="text-sm text-white/60">{formatUptime(data.uptime)}</p>
            </div>
            <div>
              <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Sezioni monitorate</p>
              <p className="text-sm text-white/60">{sections.length}</p>
            </div>
            <div>
              <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Totale notizie DB</p>
              <p className="text-sm text-white/60">{sections.reduce((acc, s) => acc + s.totalCount, 0).toLocaleString("it-IT")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
