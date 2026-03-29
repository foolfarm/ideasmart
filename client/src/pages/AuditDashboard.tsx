/**
 * AuditDashboard — Dashboard editoriale per il controllo della coerenza dei contenuti
 *
 * Accessibile solo agli admin su /admin/audit
 * Funzionalità:
 * - Stato scheduler automatico (ogni 24 ore)
 * - Avvio audit completo (news + analisi + reportage) o batch per tipo
 * - Risultati con filtri per stato, sezione e tipo di contenuto
 * - Identificazione rapida di contenuti non coerenti con le fonti
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";

// ── Colori status ──────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  ok: { label: "Coerente", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", icon: "✓" },
  warning: { label: "Parziale", color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: "⚠" },
  error: { label: "Non coerente", color: "#2a2a2a", bg: "#fef2f2", border: "#fecaca", icon: "✗" },
  unreachable: { label: "Non raggiungibile", color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb", icon: "○" },
  pending: { label: "In attesa", color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe", icon: "…" },
};

type AuditStatus = keyof typeof STATUS_CONFIG;

function StatusBadge({ status }: { status: AuditStatus }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border"
      style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
    >
      <span>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

function ScoreBar({ score }: { score: number | null }) {
  if (score === null) return <span className="text-gray-400 text-sm">—</span>;
  const color = score >= 70 ? "#16a34a" : score >= 40 ? "#d97706" : "#2a2a2a";
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 rounded-full bg-gray-200 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-sm font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
  });
}

export default function AuditDashboard() {
  const { user, loading } = useAuth();

  // Filtri risultati
  const [filterSection, setFilterSection] = useState<"ai" | "music" | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<AuditStatus | undefined>(undefined);
  const [filterType, setFilterType] = useState<"news" | "analysis" | "reportage" | undefined>(undefined);

  // Audit batch state
  const [batchSection, setBatchSection] = useState<"ai" | "music" | undefined>(undefined);
  const [batchType, setBatchType] = useState<"news" | "analysis" | "full">("full");
  const [batchLimit, setBatchLimit] = useState(20);

  // Queries
  const { data: stats, refetch: refetchStats } = trpc.audit.getStats.useQuery();
  const { data: schedulerStatus, refetch: refetchScheduler } = trpc.audit.getSchedulerStatus.useQuery();
  const { data: results, refetch: refetchResults, isLoading: resultsLoading } = trpc.audit.getResults.useQuery({
    section: filterSection,
    status: filterStatus,
    contentType: filterType,
    limit: 50,
  });

  // Mutations
  const runBatch = trpc.audit.runBatch.useMutation({
    onSuccess: (data) => {
      toast.success(`Audit completato: ${data.processed} contenuti — OK: ${data.ok}, Warning: ${data.warning}, Errori: ${data.error}`);
      refetchStats();
      refetchResults();
      refetchScheduler();
    },
    onError: (err) => toast.error("Errore audit: " + err.message),
  });

  const runFullAudit = trpc.audit.runFullAuditNow.useMutation({
    onSuccess: (data) => {
      const byType = data.byType as Record<string, { processed: number; ok: number; warning: number; error: number }>;
      toast.success(
        `Audit completo: ${data.processed} contenuti — OK: ${data.ok}, Warning: ${data.warning}, Errori: ${data.error}\n` +
        `News: ${byType?.news?.processed ?? 0} | Analisi: ${byType?.analysis?.processed ?? 0} | Reportage: ${byType?.reportage?.processed ?? 0}`
      );
      refetchStats();
      refetchResults();
      refetchScheduler();
    },
    onError: (err) => toast.error("Errore audit completo: " + err.message),
  });

  const triggerScheduled = trpc.audit.triggerScheduledAudit.useMutation({
    onSuccess: () => {
      toast.success("Audit schedulato avviato in background — riceverai email se ci sono anomalie");
      setTimeout(() => { refetchScheduler(); refetchStats(); refetchResults(); }, 3000);
    },
    onError: (err) => toast.error("Errore: " + err.message),
  });

  const deleteResult = trpc.audit.deleteResult.useMutation({
    onSuccess: () => {
      toast.success("Risultato eliminato");
      refetchResults();
      refetchStats();
    },
    onError: (err) => toast.error("Errore: " + err.message),
  });

  const [replaceSection, setReplaceSection] = useState<"ai" | "music">("ai");
  const replaceAllLowScore = trpc.news.replaceAllLowScore.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.message} — Le notizie sostituite non appariranno più in homepage.`);
      refetchStats();
      refetchResults();
    },
    onError: (err) => toast.error("Errore sostituzione: " + err.message),
  });

  const handleRunAudit = () => {
    if (batchType === "full") {
      runFullAudit.mutate({ section: batchSection, limit: batchLimit });
    } else {
      runBatch.mutate({ section: batchSection, contentType: batchType, limit: batchLimit });
    }
  };

  const isAuditRunning = runBatch.isPending || runFullAudit.isPending;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Caricamento...</div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <div className="text-2xl font-bold text-gray-800">Accesso riservato</div>
        <p className="text-gray-500">Questa pagina è riservata agli amministratori.</p>
        <Link href="/" className="text-teal-600 hover:underline">← Torna alla home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead title="Audit Contenuti — IDEASMART Admin" description="Dashboard di audit editoriale" robots="noindex, nofollow" />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div>
            <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-600">← Admin</Link>
            <h1 className="text-2xl font-black text-gray-900 mt-1">Audit Coerenza Contenuti</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Verifica automatica ogni 24 ore — News · Analisi · Reportage
            </p>
          </div>
          <div className="flex items-center gap-3">
            {schedulerStatus?.isRunning ? (
              <div className="flex items-center gap-2 text-sm text-amber-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse inline-block" />
                Audit in corso...
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                Scheduler attivo
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">

        {/* Scheduler Status Card */}
        {schedulerStatus && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 mb-1">Scheduler Automatico</h2>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>
                    <span className="font-semibold text-gray-700">Ultimo audit:</span>{" "}
                    {schedulerStatus.lastRunAt ? formatDate(schedulerStatus.lastRunAt) : "Mai eseguito"}
                  </span>
                  <span>
                    <span className="font-semibold text-gray-700">Prossimo:</span>{" "}
                    {schedulerStatus.nextRunAt ? formatDate(schedulerStatus.nextRunAt) : "—"}
                  </span>
                  <span>
                    <span className="font-semibold text-gray-700">Frequenza:</span>{" "}
                    ogni {schedulerStatus.intervalHours}h
                  </span>
                  <span>
                    <span className="font-semibold text-gray-700">Alert email:</span>{" "}
                    {schedulerStatus.adminEmail}
                  </span>
                </div>
                {schedulerStatus.lastResult && (
                  <div className="mt-2 flex flex-wrap gap-3 text-xs">
                    <span className="text-gray-500">Ultimo risultato:</span>
                    <span className="text-green-600 font-bold">✓ {schedulerStatus.lastResult.ok} OK</span>
                    <span className="text-amber-600 font-bold">⚠ {schedulerStatus.lastResult.warning} warning</span>
                    <span className="text-red-600 font-bold">✗ {schedulerStatus.lastResult.error} errori</span>
                    <span className="text-gray-500">{schedulerStatus.lastResult.unreachable} non raggiungibili</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => triggerScheduled.mutate()}
                disabled={triggerScheduled.isPending || schedulerStatus.isRunning}
                className="px-4 py-2 rounded-lg font-bold text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {triggerScheduled.isPending ? "Avviando..." : "Esegui ora"}
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { key: "total", label: "Totale audit", value: stats.total, color: "#374151" },
              { key: "ok", label: "Coerenti", value: stats.ok, color: "#16a34a" },
              { key: "warning", label: "Parziali", value: stats.warning, color: "#d97706" },
              { key: "error", label: "Non coerenti", value: stats.error, color: "#2a2a2a" },
              { key: "unreachable", label: "Non raggiungibili", value: stats.unreachable, color: "#6b7280" },
              { key: "pending", label: "In attesa", value: stats.pending, color: "#6366f1" },
            ].map((s) => (
              <div key={s.key} className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
                <div className="text-3xl font-black" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Avvia Audit */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Avvia Audit</h2>
          <p className="text-sm text-gray-500 mb-4">
            L'audit scarica ogni pagina di destinazione, estrae il testo e usa l'AI per verificare
            se il contenuto pubblicato corrisponde alla fonte. L'audit completo verifica news, analisi di mercato e reportage.
          </p>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo audit</label>
              <select
                value={batchType}
                onChange={(e) => setBatchType(e.target.value as "news" | "analysis" | "full")}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="full">Audit completo (news + analisi + reportage)</option>
                <option value="news">Solo notizie</option>
                <option value="analysis">Solo analisi di mercato</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Sezione</label>
              <select
                value={batchSection ?? ""}
                onChange={(e) => setBatchSection(e.target.value ? e.target.value as "ai" | "music" : undefined)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Tutte le sezioni</option>
                <option value="ai">AI4Business</option>
                <option value="music">ITsMusic</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Contenuti per tipo</label>
              <select
                value={batchLimit}
                onChange={(e) => setBatchLimit(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <button
              onClick={handleRunAudit}
              disabled={isAuditRunning}
              className="px-5 py-2 rounded-lg font-bold text-sm text-white transition-all disabled:opacity-50"
              style={{ background: isAuditRunning ? "#9ca3af" : "#1a1a1a" }}
            >
              {isAuditRunning ? "Audit in corso..." : "Avvia Audit"}
            </button>
          </div>
          {isAuditRunning && (
            <div className="mt-4 p-3 rounded-lg bg-teal-50 border border-teal-200 text-sm text-teal-700">
              Verifica in corso — il processo può richiedere 2-5 minuti per 20 contenuti (fetch + analisi LLM per ogni tipo)...
            </div>
          )}
        </div>

        {/* Sostituzione automatica notizie score < 40 */}
        <div className="bg-white rounded-xl border border-red-200 p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <span className="text-red-500">✗</span>
                Sostituzione Automatica Notizie Non Coerenti
              </h2>
              <p className="text-sm text-gray-500 mb-3">
                Le notizie con score di coerenza &lt; 40 o con URL non raggiungibili vengono
                <strong className="text-gray-700"> automaticamente nascoste dalla homepage</strong>.
                Usa questo strumento per sostituirle con nuovi contenuti generati dall'AI,
                mantenendo la stessa categoria editoriale.
              </p>
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Sezione</label>
                  <select
                    value={replaceSection}
                    onChange={(e) => setReplaceSection(e.target.value as "ai" | "music")}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    <option value="ai">AI4Business</option>
                    <option value="music">ITsMusic</option>
                  </select>
                </div>
                <button
                  onClick={() => replaceAllLowScore.mutate({ section: replaceSection })}
                  disabled={replaceAllLowScore.isPending}
                  className="px-5 py-2 rounded-lg font-bold text-sm text-white transition-all disabled:opacity-50"
                  style={{ background: replaceAllLowScore.isPending ? "#9ca3af" : "#2a2a2a" }}
                >
                  {replaceAllLowScore.isPending ? "Sostituzione in corso..." : "Sostituisci notizie non coerenti"}
                </button>
              </div>
              {replaceAllLowScore.isPending && (
                <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  Generazione contenuti sostitutivi in corso — può richiedere 1-2 minuti...
                </div>
              )}
            </div>
            <div className="text-right text-sm">
              <div className="text-xs text-gray-400 mb-1">Filtro attivo</div>
              <div className="font-bold text-red-600 text-lg">Score &lt; 40</div>
              <div className="text-xs text-gray-400">nascoste dalla homepage</div>
            </div>
          </div>
        </div>

        {/* Filtri e Risultati */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex-1">Risultati Audit</h2>
            <div className="flex flex-wrap gap-2">
              <select
                value={filterSection ?? ""}
                onChange={(e) => setFilterSection(e.target.value ? e.target.value as "ai" | "music" : undefined)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Tutte le sezioni</option>
                <option value="ai">AI4Business</option>
                <option value="music">ITsMusic</option>
              </select>
              <select
                value={filterStatus ?? ""}
                onChange={(e) => setFilterStatus(e.target.value ? e.target.value as AuditStatus : undefined)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Tutti gli stati</option>
                <option value="ok">Coerenti</option>
                <option value="warning">Parziali</option>
                <option value="error">Non coerenti</option>
                <option value="unreachable">Non raggiungibili</option>
              </select>
              <select
                value={filterType ?? ""}
                onChange={(e) => setFilterType(e.target.value ? e.target.value as "news" | "analysis" | "reportage" : undefined)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Tutti i tipi</option>
                <option value="news">Notizie</option>
                <option value="analysis">Analisi</option>
                <option value="reportage">Reportage</option>
              </select>
            </div>
          </div>

          {resultsLoading ? (
            <div className="text-center py-12 text-gray-400">Caricamento risultati...</div>
          ) : !results || results.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🔍</div>
              <div className="text-gray-500 font-medium">Nessun risultato di audit</div>
              <p className="text-sm text-gray-400 mt-1">Avvia un audit per iniziare la verifica dei contenuti</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((row) => (
                <div
                  key={row.id}
                  className="border rounded-xl p-4 hover:shadow-sm transition-shadow"
                  style={{
                    borderColor: STATUS_CONFIG[row.status as AuditStatus]?.border ?? "#e5e7eb",
                    background: STATUS_CONFIG[row.status as AuditStatus]?.bg ?? "#fff",
                  }}
                >
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <StatusBadge status={row.status as AuditStatus} />
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium capitalize">
                          {row.contentType} · {row.section === "ai" ? "AI4Business" : "ITsMusic"}
                        </span>
                        <span className="text-xs text-gray-400">ID #{row.contentId}</span>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">
                        {row.publishedTitle}
                      </p>
                      <a
                        href={row.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline break-all line-clamp-1"
                      >
                        {row.sourceUrl}
                      </a>
                      {row.auditNote && (
                        <p className="text-xs text-gray-600 mt-2 p-2 rounded bg-white/60 border border-gray-200">
                          <span className="font-semibold">Nota audit:</span> {row.auditNote}
                        </p>
                      )}
                      {row.httpStatus && row.httpStatus !== 200 && (
                        <p className="text-xs text-red-600 mt-1">HTTP Status: {row.httpStatus}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <ScoreBar score={row.coherenceScore ?? null} />
                      <span className="text-xs text-gray-400">{formatDate(row.auditedAt?.toString())}</span>
                      <div className="flex gap-2">
                        <a
                          href={row.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          Apri fonte
                        </a>
                        <button
                          onClick={() => deleteResult.mutate({ auditId: row.id })}
                          className="text-xs px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                        >
                          Elimina
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Guida interpretazione */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">Come interpretare i risultati</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p className="font-semibold text-green-700 mb-1">✓ Coerente (score 70-100)</p>
              <p>La pagina di destinazione tratta lo stesso argomento del titolo e sommario pubblicati. Il contenuto è affidabile.</p>
            </div>
            <div>
              <p className="font-semibold text-amber-700 mb-1">⚠ Parziale (score 40-69)</p>
              <p>La pagina è correlata ma non identica all'argomento pubblicato. Verificare manualmente se il titolo è fuorviante.</p>
            </div>
            <div>
              <p className="font-semibold text-red-700 mb-1">✗ Non coerente (score 0-39)</p>
              <p>La pagina di destinazione non tratta l'argomento indicato nel titolo. Il contenuto va rimosso o corretto.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-600 mb-1">○ Non raggiungibile</p>
              <p>La pagina non è accessibile (404, timeout, blocco bot). Verificare se l'URL è ancora valido.</p>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700">
            <span className="font-semibold">Notifiche automatiche:</span> Se l'audit rileva ≥2 contenuti non coerenti o ≥4 parziali,
            viene inviata automaticamente un'email di alert a <strong>{schedulerStatus?.adminEmail ?? "info@ideasmart.ai"}</strong>.
          </div>
        </div>

      </div>
    </div>
  );
}
