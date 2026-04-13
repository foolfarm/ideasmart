/**
 * AdminAlertLog.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Pannello Admin: storico alert di sistema (health check, diversity, linkedin)
 * Permette di vedere tutti gli alert, filtrarli per tipo/severità e marcarli come letti.
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCheck,
  Check,
  RefreshCw,
  Bell,
  BellOff,
} from "lucide-react";
import AdminHeader from "@/components/AdminHeader";

type AlertType = "health_check" | "diversity" | "linkedin" | "newsletter" | "system";
type AlertSeverity = "critical" | "warning" | "info";

const TYPE_LABELS: Record<AlertType, string> = {
  health_check: "Health Check",
  diversity: "Diversity",
  linkedin: "LinkedIn",
  newsletter: "Newsletter",
  system: "Sistema",
};

const TYPE_COLORS: Record<AlertType, string> = {
  health_check: "bg-red-100 text-red-700",
  diversity: "bg-orange-100 text-orange-700",
  linkedin: "bg-blue-100 text-blue-700",
  newsletter: "bg-purple-100 text-purple-700",
  system: "bg-gray-100 text-gray-700",
};

const SEVERITY_ICON: Record<AlertSeverity, React.ReactNode> = {
  critical: <AlertCircle className="w-4 h-4 text-red-500" />,
  warning: <AlertTriangle className="w-4 h-4 text-orange-500" />,
  info: <Info className="w-4 h-4 text-blue-500" />,
};

const SEVERITY_BG: Record<AlertSeverity, string> = {
  critical: "border-l-4 border-red-500 bg-red-50",
  warning: "border-l-4 border-orange-400 bg-orange-50",
  info: "border-l-4 border-blue-400 bg-blue-50",
};

export default function AdminAlertLog() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<AlertType | "all">("all");
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  const utils = trpc.useUtils();

  const { data, isLoading, refetch } = trpc.adminTools.getAlertLogs.useQuery(
    { limit: 150 },
    { refetchInterval: 30_000 } // aggiorna ogni 30 secondi
  );

  const markReadMutation = trpc.adminTools.markAlertRead.useMutation({
    onSuccess: () => utils.adminTools.getAlertLogs.invalidate(),
  });

  const markAllReadMutation = trpc.adminTools.markAllAlertsRead.useMutation({
    onSuccess: () => utils.adminTools.getAlertLogs.invalidate(),
  });

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Accesso non autorizzato.</p>
      </div>
    );
  }

  type AlertItem = NonNullable<typeof data>["alerts"][number];
  const alerts: AlertItem[] = data?.alerts ?? [];
  const unread = data?.unread ?? 0;

  const filtered = alerts.filter((a) => {
    if (filter !== "all" && a.type !== filter) return false;
    if (showOnlyUnread && a.read) return false;
    return true;
  });

  const formatDate = (d: Date | string) => {
    const date = new Date(d);
    return date.toLocaleString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="min-h-screen pb-20"
      style={{ background: "#f5f5f7", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', sans-serif" }}
    >
      <AdminHeader title="Alert Log" />

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(["all", "health_check", "diversity", "linkedin"] as const).map((t) => {
            const count =
              t === "all"
                ? alerts.length
                : alerts.filter((a: AlertItem) => a.type === t).length;
            const critCount =
              t === "all"
                ? alerts.filter((a: AlertItem) => a.severity === "critical").length
                : alerts.filter((a: AlertItem) => a.type === t && a.severity === "critical").length;;
            return (
              <Card
                key={t}
                className={`cursor-pointer transition-all ${filter === t ? "ring-2 ring-orange-400" : "hover:shadow-sm"}`}
                onClick={() => setFilter(t)}
              >
                <CardContent className="p-3">
                  <p className="text-xs text-gray-500 mb-1">
                    {t === "all" ? "Tutti" : TYPE_LABELS[t as AlertType]}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  {critCount > 0 && (
                    <p className="text-xs text-red-500 font-medium">{critCount} critici</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filtri */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowOnlyUnread(!showOnlyUnread)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
              showOnlyUnread
                ? "bg-orange-100 border-orange-300 text-orange-700"
                : "bg-white border-gray-200 text-gray-600"
            }`}
          >
            {showOnlyUnread ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
            Solo non letti
          </button>
          {(["all", "health_check", "diversity", "linkedin", "newsletter", "system"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filter === t
                  ? "bg-gray-900 border-gray-900 text-white"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
              }`}
            >
              {t === "all" ? "Tutti" : TYPE_LABELS[t as AlertType]}
            </button>
          ))}
        </div>

        {/* Lista alert */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCheck className="w-10 h-10 text-green-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Nessun alert</p>
              <p className="text-xs text-gray-400 mt-1">
                {showOnlyUnread ? "Tutti gli alert sono stati letti." : "Il sistema funziona correttamente."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((alert: AlertItem) => (
              <div
                key={alert.id}
                className={`rounded-lg p-4 transition-all ${
                  SEVERITY_BG[alert.severity as AlertSeverity]
                } ${alert.read ? "opacity-60" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    {SEVERITY_ICON[alert.severity as AlertSeverity]}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            TYPE_COLORS[alert.type as AlertType]
                          }`}
                        >
                          {TYPE_LABELS[alert.type as AlertType]}
                        </span>
                        {!alert.read && (
                          <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                        )}
                        {alert.emailSent && (
                          <span className="text-xs text-gray-400">📧 email inviata</span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-900 leading-snug">
                        {alert.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 whitespace-pre-line leading-relaxed line-clamp-3">
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDate(alert.createdAt)}
                      </p>
                    </div>
                  </div>
                  {!alert.read && (
                    <button
                      onClick={() => markReadMutation.mutate({ id: alert.id })}
                      className="shrink-0 p-1.5 rounded-full hover:bg-white/60 transition-colors text-gray-500"
                      title="Segna come letto"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
