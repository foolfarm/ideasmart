/**
 * alertLogger.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Helper per salvare gli alert di sistema nel DB (tabella alert_logs).
 * Usato da siteHealthCheck, diversityAlert, linkedinPublisher, ecc.
 * ──────────────────────────────────────────────────────────────────────────────
 */
import { getDb } from "./db";
import { alertLogs } from "../drizzle/schema";
import { desc, eq, gte, count } from "drizzle-orm";

export type AlertType = "health_check" | "diversity" | "linkedin" | "newsletter" | "system";
export type AlertSeverity = "critical" | "warning" | "info";

export interface LogAlertOptions {
  type: AlertType;
  severity?: AlertSeverity;
  title: string;
  message: string;
  emailSent?: boolean;
}

/**
 * Salva un alert nel DB.
 * Non lancia eccezioni — in caso di errore logga solo in console.
 */
export async function logAlert(opts: LogAlertOptions): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;
    await db.insert(alertLogs).values({
      type: opts.type,
      severity: opts.severity ?? "warning",
      title: opts.title,
      message: opts.message,
      emailSent: opts.emailSent ?? false,
      read: false,
    });
    console.log(`[AlertLogger] ✅ Alert salvato: [${opts.type}] ${opts.title}`);
  } catch (err) {
    console.error("[AlertLogger] ❌ Errore salvataggio alert:", err);
  }
}

/**
 * Conta gli alert non letti.
 */
export async function countUnreadAlerts(): Promise<number> {
  try {
    const db = await getDb();
    if (!db) return 0;
    const [result] = await db
      .select({ cnt: count() })
      .from(alertLogs)
      .where(eq(alertLogs.read, false));
    return result?.cnt ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Recupera gli ultimi N alert (default 50).
 */
export async function getRecentAlerts(limit = 50) {
  try {
    const db = await getDb();
    if (!db) return [];
    return await db
      .select()
      .from(alertLogs)
      .orderBy(desc(alertLogs.createdAt))
      .limit(limit);
  } catch {
    return [];
  }
}

/**
 * Segna tutti gli alert come letti.
 */
export async function markAllAlertsRead(): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;
    await db.update(alertLogs).set({ read: true }).where(eq(alertLogs.read, false));
  } catch (err) {
    console.error("[AlertLogger] ❌ Errore markAllRead:", err);
  }
}

/**
 * Segna un singolo alert come letto.
 */
export async function markAlertRead(id: number): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;
    await db.update(alertLogs).set({ read: true }).where(eq(alertLogs.id, id));
  } catch (err) {
    console.error("[AlertLogger] ❌ Errore markRead:", err);
  }
}
