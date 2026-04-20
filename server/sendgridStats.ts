/**
 * Proof Press — SendGrid Statistics
 *
 * Recupera statistiche di performance delle newsletter da SendGrid API v3:
 * - Global stats (delivered, opens, clicks, bounces, spam, unsubscribes)
 * - Suppressions: unsubscribes, bounces, spam reports, blocks, invalid emails
 *
 * Docs: https://docs.sendgrid.com/api-reference/stats
 */

import { ENV } from "./_core/env";

const SG_BASE = "https://api.sendgrid.com/v3";

function sgHeaders() {
  return {
    Authorization: `Bearer ${ENV.sendgridApiKey}`,
    "Content-Type": "application/json",
  };
}

// ── Tipi ────────────────────────────────────────────────────────────────────

export interface SendgridDayStat {
  date: string; // YYYY-MM-DD
  requests: number;
  delivered: number;
  opens: number;
  unique_opens: number;
  clicks: number;
  unique_clicks: number;
  bounces: number;
  spam_reports: number;
  unsubscribes: number;
  blocks: number;
  invalid_emails: number;
  open_rate: number;   // calcolato: unique_opens / delivered * 100
  click_rate: number;  // calcolato: unique_clicks / delivered * 100
}

export interface SendgridSuppression {
  email: string;
  created: number; // Unix timestamp
  reason?: string;
}

export interface SendgridStatsResult {
  stats: SendgridDayStat[];
  totals: Omit<SendgridDayStat, "date" | "open_rate" | "click_rate"> & {
    open_rate: number;
    click_rate: number;
  };
  unsubscribes: SendgridSuppression[];
  bounces: SendgridSuppression[];
  spamReports: SendgridSuppression[];
  fetchedAt: string; // ISO timestamp
}

// ── Funzioni API ─────────────────────────────────────────────────────────────

/**
 * Recupera le statistiche globali degli ultimi N giorni.
 */
export async function fetchSendgridGlobalStats(days = 30): Promise<SendgridDayStat[]> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const url = `${SG_BASE}/stats?start_date=${fmt(startDate)}&end_date=${fmt(endDate)}&aggregated_by=day`;

  const res = await fetch(url, { headers: sgHeaders() });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SendGrid stats API error ${res.status}: ${err}`);
  }

  const data = await res.json() as Array<{
    date: string;
    stats: Array<{
      metrics: {
        requests?: number;
        delivered?: number;
        opens?: number;
        unique_opens?: number;
        clicks?: number;
        unique_clicks?: number;
        bounces?: number;
        spam_reports?: number;
        unsubscribes?: number;
        blocks?: number;
        invalid_emails?: number;
      };
    }>;
  }>;

  return data.map((day) => {
    const m = day.stats?.[0]?.metrics ?? {};
    const delivered = m.delivered ?? 0;
    const unique_opens = m.unique_opens ?? 0;
    const unique_clicks = m.unique_clicks ?? 0;
    return {
      date: day.date,
      requests: m.requests ?? 0,
      delivered,
      opens: m.opens ?? 0,
      unique_opens,
      clicks: m.clicks ?? 0,
      unique_clicks,
      bounces: m.bounces ?? 0,
      spam_reports: m.spam_reports ?? 0,
      unsubscribes: m.unsubscribes ?? 0,
      blocks: m.blocks ?? 0,
      invalid_emails: m.invalid_emails ?? 0,
      open_rate: delivered > 0 ? Math.round((unique_opens / delivered) * 1000) / 10 : 0,
      click_rate: delivered > 0 ? Math.round((unique_clicks / delivered) * 1000) / 10 : 0,
    };
  });
}

/**
 * Recupera gli ultimi N disiscritti.
 */
export async function fetchSendgridUnsubscribes(limit = 100): Promise<SendgridSuppression[]> {
  const url = `${SG_BASE}/asm/suppressions/global?limit=${limit}&offset=0`;
  const res = await fetch(url, { headers: sgHeaders() });
  if (!res.ok) {
    const err = await res.text();
    console.warn(`[SendGrid] Unsubscribes API error ${res.status}: ${err}`);
    return [];
  }
  const data = await res.json() as Array<{ email: string; created: number }>;
  return data.map((u) => ({ email: u.email, created: u.created }));
}

/**
 * Recupera gli ultimi N bounce.
 */
export async function fetchSendgridBounces(limit = 100): Promise<SendgridSuppression[]> {
  const url = `${SG_BASE}/suppression/bounces?limit=${limit}`;
  const res = await fetch(url, { headers: sgHeaders() });
  if (!res.ok) {
    const err = await res.text();
    console.warn(`[SendGrid] Bounces API error ${res.status}: ${err}`);
    return [];
  }
  const data = await res.json() as Array<{ email: string; created: number; reason?: string }>;
  return data.map((b) => ({ email: b.email, created: b.created, reason: b.reason }));
}

/**
 * Recupera gli ultimi N spam report.
 */
export async function fetchSendgridSpamReports(limit = 100): Promise<SendgridSuppression[]> {
  const url = `${SG_BASE}/suppression/spam_reports?limit=${limit}`;
  const res = await fetch(url, { headers: sgHeaders() });
  if (!res.ok) {
    const err = await res.text();
    console.warn(`[SendGrid] Spam reports API error ${res.status}: ${err}`);
    return [];
  }
  const data = await res.json() as Array<{ email: string; created: number }>;
  return data.map((s) => ({ email: s.email, created: s.created }));
}

/**
 * Recupera i blocchi recenti (email bloccate per policy o reputazione).
 */
export async function fetchSendgridBlocks(limit = 100): Promise<SendgridSuppression[]> {
  const url = `${SG_BASE}/suppression/blocks?limit=${limit}`;
  const res = await fetch(url, { headers: sgHeaders() });
  if (!res.ok) {
    const err = await res.text();
    console.warn(`[SendGrid] Blocks API error ${res.status}: ${err}`);
    return [];
  }
  const data = await res.json() as Array<{ email: string; created: number; reason?: string }>;
  return data.map((b) => ({ email: b.email, created: b.created, reason: b.reason }));
}

/**
 * Recupera tutte le statistiche SendGrid in un'unica chiamata aggregata.
 */
export async function fetchAllSendgridStats(days = 30): Promise<SendgridStatsResult> {
  const [stats, unsubscribes, bounces, spamReports] = await Promise.allSettled([
    fetchSendgridGlobalStats(days),
    fetchSendgridUnsubscribes(200),
    fetchSendgridBounces(200),
    fetchSendgridSpamReports(200),
  ]);

  const statsData: SendgridDayStat[] = stats.status === "fulfilled" ? stats.value : [];
  const unsubData: SendgridSuppression[] = unsubscribes.status === "fulfilled" ? unsubscribes.value : [];
  const bounceData: SendgridSuppression[] = bounces.status === "fulfilled" ? bounces.value : [];
  const spamData: SendgridSuppression[] = spamReports.status === "fulfilled" ? spamReports.value : [];

  // Calcola totali aggregati
  const totals = statsData.reduce(
    (acc, day) => ({
      requests: acc.requests + day.requests,
      delivered: acc.delivered + day.delivered,
      opens: acc.opens + day.opens,
      unique_opens: acc.unique_opens + day.unique_opens,
      clicks: acc.clicks + day.clicks,
      unique_clicks: acc.unique_clicks + day.unique_clicks,
      bounces: acc.bounces + day.bounces,
      spam_reports: acc.spam_reports + day.spam_reports,
      unsubscribes: acc.unsubscribes + day.unsubscribes,
      blocks: acc.blocks + day.blocks,
      invalid_emails: acc.invalid_emails + day.invalid_emails,
    }),
    {
      requests: 0, delivered: 0, opens: 0, unique_opens: 0,
      clicks: 0, unique_clicks: 0, bounces: 0, spam_reports: 0,
      unsubscribes: 0, blocks: 0, invalid_emails: 0,
    }
  );

  return {
    stats: statsData,
    totals: {
      ...totals,
      open_rate: totals.delivered > 0 ? Math.round((totals.unique_opens / totals.delivered) * 1000) / 10 : 0,
      click_rate: totals.delivered > 0 ? Math.round((totals.unique_clicks / totals.delivered) * 1000) / 10 : 0,
    },
    unsubscribes: unsubData,
    bounces: bounceData,
    spamReports: spamData,
    fetchedAt: new Date().toISOString(),
  };
}
