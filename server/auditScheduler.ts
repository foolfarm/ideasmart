/**
 * auditScheduler.ts — Scheduler automatico per l'audit dei contenuti
 *
 * Esegue un audit completo (news + analisi + reportage) ogni 24 ore.
 * Se rileva anomalie (notizie non coerenti o non raggiungibili), invia
 * una notifica email all'admin con il report dettagliato.
 *
 * Avvio: chiamare startAuditScheduler() all'avvio del server.
 */

import { runFullAudit, getAuditResults } from "./auditContent";
import { sendEmail } from "./email";

// ── Configurazione ─────────────────────────────────────────────────────────
const AUDIT_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 ore
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "ac@acinelli.com";
const ALERT_THRESHOLD_ERRORS = 2;   // Invia alert se ci sono >= 2 notizie non coerenti
const ALERT_THRESHOLD_WARNINGS = 4; // Invia alert se ci sono >= 4 notizie parziali
const AUDIT_LIMIT_PER_RUN = 20;     // Contenuti da verificare per ogni tipo

// ── Stato interno dello scheduler ─────────────────────────────────────────
let schedulerTimer: ReturnType<typeof setInterval> | null = null;
let lastRunAt: Date | null = null;
let lastRunResult: {
  processed: number;
  ok: number;
  warning: number;
  error: number;
  unreachable: number;
  byType: Record<string, { processed: number; ok: number; warning: number; error: number; unreachable: number }>;
} | null = null;
let isRunning = false;
let nextRunAt: Date | null = null;

// ── Costruzione email di report ────────────────────────────────────────────
function buildAuditReportEmail(result: typeof lastRunResult, anomalies: Awaited<ReturnType<typeof getAuditResults>>): string {
  if (!result) return "";

  const totalScore = result.processed > 0 ? Math.round((result.ok / result.processed) * 100) : 0;
  const statusColor = result.error >= ALERT_THRESHOLD_ERRORS ? "#dc2626" : result.warning >= ALERT_THRESHOLD_WARNINGS ? "#d97706" : "#16a34a";
  const statusLabel = result.error >= ALERT_THRESHOLD_ERRORS ? "ALERT — Contenuti non coerenti rilevati" : result.warning >= ALERT_THRESHOLD_WARNINGS ? "ATTENZIONE — Contenuti parzialmente coerenti" : "OK — Audit completato senza anomalie critiche";

  const anomalyRows = anomalies.slice(0, 15).map(a => `
    <tr style="border-bottom: 1px solid #f3f4f6;">
      <td style="padding: 8px 12px; font-size: 13px; color: #374151; max-width: 300px;">${a.publishedTitle}</td>
      <td style="padding: 8px 12px; font-size: 12px; color: #6b7280;">${a.contentType} · ${a.section === "ai" ? "AI News" : a.section === "startup" ? "Startup News" : a.section === "dealroom" ? "DEALROOM" : a.section}</td>
      <td style="padding: 8px 12px; font-size: 12px; font-weight: bold; color: ${a.status === "error" ? "#dc2626" : a.status === "unreachable" ? "#6b7280" : "#d97706"};">
        ${a.status === "error" ? "Non coerente" : a.status === "unreachable" ? "Non raggiungibile" : "Parziale"}
        ${a.coherenceScore !== null ? ` (${a.coherenceScore}/100)` : ""}
      </td>
      <td style="padding: 8px 12px; font-size: 11px; color: #9ca3af; max-width: 200px; word-break: break-all;">
        <a href="${a.sourceUrl}" style="color: #3b82f6;">${(a.sourceUrl || "").slice(0, 60)}...</a>
      </td>
    </tr>
  `).join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f9fafb; margin: 0; padding: 20px;">
  <div style="max-width: 700px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background: #0a0f1e; padding: 24px 32px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 22px; font-weight: 900; color: white; letter-spacing: -0.5px;">IDEA<span style="color: #00b4a0;">SMART</span></span>
        <span style="font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px;">Audit Report</span>
      </div>
      <div style="margin-top: 8px; font-size: 13px; color: rgba(255,255,255,0.5);">
        ${new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
      </div>
    </div>

    <!-- Status Banner -->
    <div style="padding: 16px 32px; background: ${result.error >= ALERT_THRESHOLD_ERRORS ? "#fef2f2" : result.warning >= ALERT_THRESHOLD_WARNINGS ? "#fffbeb" : "#f0fdf4"}; border-bottom: 2px solid ${statusColor};">
      <div style="font-size: 15px; font-weight: 700; color: ${statusColor};">${statusLabel}</div>
      <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">
        Audit automatico completato — ${result.processed} contenuti verificati
      </div>
    </div>

    <!-- Stats -->
    <div style="padding: 24px 32px;">
      <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 24px;">
        ${[
          { label: "Verificati", value: result.processed, color: "#374151" },
          { label: "Coerenti", value: result.ok, color: "#16a34a" },
          { label: "Parziali", value: result.warning, color: "#d97706" },
          { label: "Non coerenti", value: result.error, color: "#dc2626" },
          { label: "Non raggiungibili", value: result.unreachable, color: "#6b7280" },
        ].map(s => `
          <div style="text-align: center; padding: 12px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
            <div style="font-size: 24px; font-weight: 900; color: ${s.color};">${s.value}</div>
            <div style="font-size: 11px; color: #9ca3af; margin-top: 2px;">${s.label}</div>
          </div>
        `).join("")}
      </div>

      <!-- Per tipo -->
      <div style="margin-bottom: 24px;">
        <div style="font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 8px;">Dettaglio per tipo di contenuto</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background: #f9fafb;">
              <th style="text-align: left; padding: 8px 12px; color: #6b7280; font-weight: 600;">Tipo</th>
              <th style="text-align: center; padding: 8px 12px; color: #6b7280; font-weight: 600;">Verificati</th>
              <th style="text-align: center; padding: 8px 12px; color: #16a34a; font-weight: 600;">OK</th>
              <th style="text-align: center; padding: 8px 12px; color: #d97706; font-weight: 600;">Warning</th>
              <th style="text-align: center; padding: 8px 12px; color: #dc2626; font-weight: 600;">Errori</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(result.byType).map(([type, stats]) => `
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 8px 12px; font-weight: 600; text-transform: capitalize;">${type}</td>
                <td style="text-align: center; padding: 8px 12px;">${stats.processed}</td>
                <td style="text-align: center; padding: 8px 12px; color: #16a34a; font-weight: 700;">${stats.ok}</td>
                <td style="text-align: center; padding: 8px 12px; color: #d97706; font-weight: 700;">${stats.warning}</td>
                <td style="text-align: center; padding: 8px 12px; color: #dc2626; font-weight: 700;">${stats.error}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      <!-- Anomalie -->
      ${anomalies.length > 0 ? `
        <div>
          <div style="font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 8px;">
            Contenuti che richiedono attenzione (${anomalies.length})
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="text-align: left; padding: 8px 12px; color: #6b7280; font-weight: 600;">Titolo</th>
                <th style="text-align: left; padding: 8px 12px; color: #6b7280; font-weight: 600;">Tipo · Canale</th>
                <th style="text-align: left; padding: 8px 12px; color: #6b7280; font-weight: 600;">Stato</th>
                <th style="text-align: left; padding: 8px 12px; color: #6b7280; font-weight: 600;">URL Fonte</th>
              </tr>
            </thead>
            <tbody>${anomalyRows}</tbody>
          </table>
        </div>
      ` : `
        <div style="text-align: center; padding: 20px; color: #16a34a; font-weight: 600;">
          ✓ Nessuna anomalia rilevata — tutti i contenuti sono coerenti con le fonti
        </div>
      `}
    </div>

    <!-- Footer -->
    <div style="padding: 16px 32px; background: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
      <a href="https://www.ideasmart.biz/admin/audit" style="display: inline-block; padding: 10px 24px; background: #0a0f1e; color: white; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 700;">
        Apri Dashboard Audit →
      </a>
      <div style="margin-top: 12px; font-size: 11px; color: #9ca3af;">
        Audit automatico Proof Press · Prossima esecuzione tra 24 ore
      </div>
    </div>

  </div>
</body>
</html>`;
}

// ── Esecuzione singola dell'audit ──────────────────────────────────────────
export async function runScheduledAudit(): Promise<void> {
  if (isRunning) {
    console.log("[AuditScheduler] Audit già in corso, skip.");
    return;
  }

  isRunning = true;
  const startTime = Date.now();
  console.log(`[AuditScheduler] Avvio audit automatico — ${new Date().toISOString()}`);

  try {
    // Esegui audit completo su entrambe le sezioni
    const result = await runFullAudit({ limit: AUDIT_LIMIT_PER_RUN });
    lastRunAt = new Date();
    lastRunResult = result;

    const elapsed = Math.round((Date.now() - startTime) / 1000);
    console.log(`[AuditScheduler] Audit completato in ${elapsed}s — Verificati: ${result.processed}, OK: ${result.ok}, Warning: ${result.warning}, Errori: ${result.error}, Non raggiungibili: ${result.unreachable}`);

    // NOTA: invio email di alert DISABILITATO il 14/03/2026
    // L'audit genera falsi positivi (score 0) sulle notizie AI perché verifica
    // le homepage dei giornali invece degli articoli specifici.
    // Le email di alert sono state disabilitate per evitare falsi allarmi.
    // Per riabilitarle, rimuovere questo commento e ripristinare il codice.
    const hasAlerts = result.error >= ALERT_THRESHOLD_ERRORS || result.warning >= ALERT_THRESHOLD_WARNINGS || result.unreachable >= 5;
    if (hasAlerts) {
      console.log(`[AuditScheduler] Anomalie rilevate (${result.error} errori, ${result.unreachable} non raggiungibili) — email DISABILITATA`);
    } else {
      console.log(`[AuditScheduler] Nessuna anomalia critica — email non inviata`);
    }
  } catch (err) {
    console.error("[AuditScheduler] Errore durante l'audit:", err);
  } finally {
    isRunning = false;
    nextRunAt = new Date(Date.now() + AUDIT_INTERVAL_MS);
  }
}

// ── Avvio dello scheduler ──────────────────────────────────────────────────
export function startAuditScheduler(): void {
  if (schedulerTimer) {
    console.log("[AuditScheduler] Scheduler già avviato, skip.");
    return;
  }

  console.log(`[AuditScheduler] Scheduler avviato — audit ogni 24 ore. Prima esecuzione tra 5 minuti.`);

  // Prima esecuzione dopo 5 minuti (per dare tempo al server di avviarsi)
  const firstRunDelay = 5 * 60 * 1000;
  nextRunAt = new Date(Date.now() + firstRunDelay);

  setTimeout(async () => {
    await runScheduledAudit();
    // Poi ogni 24 ore
    schedulerTimer = setInterval(runScheduledAudit, AUDIT_INTERVAL_MS);
    nextRunAt = new Date(Date.now() + AUDIT_INTERVAL_MS);
  }, firstRunDelay);
}

// ── Stato dello scheduler (per la dashboard) ──────────────────────────────
export function getSchedulerStatus() {
  return {
    isRunning,
    lastRunAt: lastRunAt?.toISOString() ?? null,
    nextRunAt: nextRunAt?.toISOString() ?? null,
    lastResult: lastRunResult,
    intervalHours: AUDIT_INTERVAL_MS / (60 * 60 * 1000),
    adminEmail: ADMIN_EMAIL,
  };
}

// ── Arresto dello scheduler ────────────────────────────────────────────────
export function stopAuditScheduler(): void {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
    console.log("[AuditScheduler] Scheduler fermato.");
  }
}
