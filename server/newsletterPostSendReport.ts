/**
 * newsletterPostSendReport.ts — Report post-invio newsletter a +1h
 * ─────────────────────────────────────────────────────────────────────────────
 * Inviato automaticamente 1 ora dopo l'invio massivo della newsletter a
 * ac@acinelli.com con statistiche complete:
 *   - Delivered / Opened / Click (SendGrid)
 *   - Spam reports (ultimi)
 *   - Bounce (ultimi)
 *   - Blocchi (ultimi)
 *   - Click banner newsletter (dal DB interno)
 *   - Disiscritti (ultimi)
 */

import { sendEmail } from "./email";
import {
  fetchSendgridGlobalStats,
  fetchSendgridUnsubscribes,
  fetchSendgridBounces,
  fetchSendgridSpamReports,
  fetchSendgridBlocks,
} from "./sendgridStats";
import { getDb } from "./db";
import { banners, bannerEvents } from "../drizzle/schema";
import { eq, sql, gte, and } from "drizzle-orm";

const REPORT_TO = "ac@acinelli.com";
const BASE_URL = "https://proofpress.ai";

// ── Formattazione numero ─────────────────────────────────────────────────────
function fmt(n: number): string {
  return n.toLocaleString("it-IT");
}

// ── Genera HTML del report ───────────────────────────────────────────────────
async function buildReportHtml(params: {
  subject: string;
  recipientCount: number;
  sendDate: Date;
}): Promise<string> {
  const { subject, recipientCount, sendDate } = params;

  // Recupera statistiche SendGrid del giorno corrente
  const [stats, unsubs, bounces, spamReports, blocks] = await Promise.allSettled([
    fetchSendgridGlobalStats(1),
    fetchSendgridUnsubscribes(50),
    fetchSendgridBounces(50),
    fetchSendgridSpamReports(50),
    fetchSendgridBlocks(50),
  ]);

  const todayStats = stats.status === "fulfilled" && stats.value.length > 0
    ? stats.value[stats.value.length - 1]
    : null;

  const unsubList = unsubs.status === "fulfilled" ? unsubs.value : [];
  const bounceList = bounces.status === "fulfilled" ? bounces.value : [];
  const spamList = spamReports.status === "fulfilled" ? spamReports.value : [];
  const blockList = blocks.status === "fulfilled" ? blocks.value : [];

  // Recupera click banner newsletter delle ultime 2 ore
  const db = await getDb();
  let bannerClickRows: Array<{ name: string; clicks: number }> = [];
  if (db) {
    try {
      const since2h = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const rows = await db
        .select({
          bannerId: bannerEvents.bannerId,
          count: sql<number>`COUNT(*)`,
        })
        .from(bannerEvents)
        .where(
          and(
            gte(bannerEvents.createdAt, since2h),
            eq(bannerEvents.source, "newsletter"),
            eq(bannerEvents.eventType, "click")
          )
        )
        .groupBy(bannerEvents.bannerId);

      if (rows.length > 0) {
        const allBanners = await db.select({ id: banners.id, name: banners.name }).from(banners);
        bannerClickRows = rows.map((r) => ({
          name: allBanners.find((b) => b.id === r.bannerId)?.name ?? `Banner #${r.bannerId}`,
          clicks: Number(r.count),
        }));
      }
    } catch (e) {
      console.warn("[PostSendReport] Errore recupero banner clicks:", e);
    }
  }

  const delivered = todayStats?.delivered ?? recipientCount;
  const opens = todayStats?.unique_opens ?? 0;
  const clicks = todayStats?.unique_clicks ?? 0;
  const openRate = delivered > 0 ? ((opens / delivered) * 100).toFixed(1) : "0.0";
  const clickRate = delivered > 0 ? ((clicks / delivered) * 100).toFixed(1) : "0.0";
  const bounceCount = todayStats?.bounces ?? bounceList.length;
  const spamCount = todayStats?.spam_reports ?? spamList.length;
  const blockCount = todayStats?.blocks ?? blockList.length;
  const unsubCount = todayStats?.unsubscribes ?? unsubList.length;

  const sendDateStr = sendDate.toLocaleString("it-IT", { timeZone: "Europe/Rome" });
  const reportDateStr = new Date().toLocaleString("it-IT", { timeZone: "Europe/Rome" });

  // ── Righe email lista (max 10 per sezione) ──────────────────────────────
  function emailRows(list: Array<{ email: string; reason?: string }>, max = 10): string {
    if (list.length === 0) return `<tr><td colspan="2" style="padding:8px 12px;color:#6e6e73;font-style:italic;">Nessuno</td></tr>`;
    return list.slice(0, max).map((item) => `
      <tr>
        <td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#1d1d1f;">${item.email}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;font-size:12px;color:#6e6e73;">${item.reason ?? ""}</td>
      </tr>`).join("") + (list.length > max ? `<tr><td colspan="2" style="padding:6px 12px;font-size:12px;color:#6e6e73;font-style:italic;">... e altri ${list.length - max}</td></tr>` : "");
  }

  function bannerRows(): string {
    if (bannerClickRows.length === 0) return `<tr><td colspan="2" style="padding:8px 12px;color:#6e6e73;font-style:italic;">Nessun click banner registrato</td></tr>`;
    return bannerClickRows.map((b) => `
      <tr>
        <td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#1d1d1f;">${b.name}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:600;color:#af52de;">${fmt(b.clicks)}</td>
      </tr>`).join("");
  }

  return `<!DOCTYPE html>
<html lang="it">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f7;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e5ea;">

        <!-- HEADER -->
        <tr><td style="background:#1d1d1f;padding:24px 32px;">
          <p style="margin:0;font-size:12px;font-weight:600;color:#86868b;text-transform:uppercase;letter-spacing:0.1em;">ProofPress Admin</p>
          <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#ffffff;">📊 Report Post-Invio Newsletter</h1>
          <p style="margin:6px 0 0;font-size:13px;color:#86868b;">Statistiche a +1h dall'invio massivo</p>
        </td></tr>

        <!-- META INVIO -->
        <tr><td style="padding:24px 32px;border-bottom:1px solid #f0f0f0;">
          <p style="margin:0 0 4px;font-size:12px;color:#86868b;text-transform:uppercase;letter-spacing:0.08em;">Oggetto newsletter</p>
          <p style="margin:0 0 16px;font-size:15px;font-weight:600;color:#1d1d1f;">${subject}</p>
          <div style="display:flex;gap:24px;flex-wrap:wrap;">
            <div>
              <p style="margin:0 0 2px;font-size:11px;color:#86868b;text-transform:uppercase;">Invio effettuato</p>
              <p style="margin:0;font-size:14px;color:#1d1d1f;">${sendDateStr}</p>
            </div>
            <div>
              <p style="margin:0 0 2px;font-size:11px;color:#86868b;text-transform:uppercase;">Report generato</p>
              <p style="margin:0;font-size:14px;color:#1d1d1f;">${reportDateStr}</p>
            </div>
            <div>
              <p style="margin:0 0 2px;font-size:11px;color:#86868b;text-transform:uppercase;">Destinatari</p>
              <p style="margin:0;font-size:14px;font-weight:700;color:#1d1d1f;">${fmt(recipientCount)}</p>
            </div>
          </div>
        </td></tr>

        <!-- KPI PRINCIPALI -->
        <tr><td style="padding:24px 32px;border-bottom:1px solid #f0f0f0;">
          <p style="margin:0 0 16px;font-size:13px;font-weight:600;color:#1d1d1f;text-transform:uppercase;letter-spacing:0.06em;">Performance SendGrid</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="text-align:center;padding:16px;background:#f5f5f7;border-radius:12px;width:25%;">
                <p style="margin:0;font-size:28px;font-weight:700;color:#007aff;">${fmt(delivered)}</p>
                <p style="margin:4px 0 0;font-size:11px;color:#6e6e73;text-transform:uppercase;">Consegnate</p>
              </td>
              <td style="width:8px;"></td>
              <td style="text-align:center;padding:16px;background:#f5f5f7;border-radius:12px;width:25%;">
                <p style="margin:0;font-size:28px;font-weight:700;color:#34c759;">${fmt(opens)}</p>
                <p style="margin:4px 0 0;font-size:11px;color:#6e6e73;text-transform:uppercase;">Aperte (${openRate}%)</p>
              </td>
              <td style="width:8px;"></td>
              <td style="text-align:center;padding:16px;background:#f5f5f7;border-radius:12px;width:25%;">
                <p style="margin:0;font-size:28px;font-weight:700;color:#ff9500;">${fmt(clicks)}</p>
                <p style="margin:4px 0 0;font-size:11px;color:#6e6e73;text-transform:uppercase;">Click (${clickRate}%)</p>
              </td>
              <td style="width:8px;"></td>
              <td style="text-align:center;padding:16px;background:#f5f5f7;border-radius:12px;width:25%;">
                <p style="margin:0;font-size:28px;font-weight:700;color:#ff3b30;">${fmt(spamCount)}</p>
                <p style="margin:4px 0 0;font-size:11px;color:#6e6e73;text-transform:uppercase;">Spam</p>
              </td>
            </tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;">
            <tr>
              <td style="text-align:center;padding:16px;background:#f5f5f7;border-radius:12px;width:33%;">
                <p style="margin:0;font-size:28px;font-weight:700;color:#ff3b30;">${fmt(bounceCount)}</p>
                <p style="margin:4px 0 0;font-size:11px;color:#6e6e73;text-transform:uppercase;">Bounce</p>
              </td>
              <td style="width:8px;"></td>
              <td style="text-align:center;padding:16px;background:#f5f5f7;border-radius:12px;width:33%;">
                <p style="margin:0;font-size:28px;font-weight:700;color:#ff3b30;">${fmt(blockCount)}</p>
                <p style="margin:4px 0 0;font-size:11px;color:#6e6e73;text-transform:uppercase;">Blocchi</p>
              </td>
              <td style="width:8px;"></td>
              <td style="text-align:center;padding:16px;background:#f5f5f7;border-radius:12px;width:33%;">
                <p style="margin:0;font-size:28px;font-weight:700;color:#ff9500;">${fmt(unsubCount)}</p>
                <p style="margin:4px 0 0;font-size:11px;color:#6e6e73;text-transform:uppercase;">Disiscritti</p>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- CLICK BANNER NEWSLETTER -->
        <tr><td style="padding:24px 32px;border-bottom:1px solid #f0f0f0;">
          <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#1d1d1f;text-transform:uppercase;letter-spacing:0.06em;">🎯 Click Banner Newsletter (ultime 2h)</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e5e5ea;border-radius:8px;overflow:hidden;">
            <tr style="background:#f5f5f7;">
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6e6e73;text-transform:uppercase;font-weight:600;">Banner</th>
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6e6e73;text-transform:uppercase;font-weight:600;">Click</th>
            </tr>
            ${bannerRows()}
          </table>
        </td></tr>

        <!-- SPAM REPORTS -->
        ${spamList.length > 0 ? `
        <tr><td style="padding:24px 32px;border-bottom:1px solid #f0f0f0;">
          <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#ff3b30;text-transform:uppercase;letter-spacing:0.06em;">⚠️ Segnalazioni Spam (${spamList.length})</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #ffe5e5;border-radius:8px;overflow:hidden;">
            <tr style="background:#fff5f5;">
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6e6e73;text-transform:uppercase;font-weight:600;">Email</th>
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6e6e73;text-transform:uppercase;font-weight:600;">Motivo</th>
            </tr>
            ${emailRows(spamList)}
          </table>
        </td></tr>` : ""}

        <!-- BOUNCE -->
        ${bounceList.length > 0 ? `
        <tr><td style="padding:24px 32px;border-bottom:1px solid #f0f0f0;">
          <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#ff9500;text-transform:uppercase;letter-spacing:0.06em;">📭 Bounce (${bounceList.length})</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #fff3e0;border-radius:8px;overflow:hidden;">
            <tr style="background:#fffbf0;">
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6e6e73;text-transform:uppercase;font-weight:600;">Email</th>
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6e6e73;text-transform:uppercase;font-weight:600;">Motivo</th>
            </tr>
            ${emailRows(bounceList)}
          </table>
        </td></tr>` : ""}

        <!-- BLOCCHI -->
        ${blockList.length > 0 ? `
        <tr><td style="padding:24px 32px;border-bottom:1px solid #f0f0f0;">
          <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#ff3b30;text-transform:uppercase;letter-spacing:0.06em;">🚫 Blocchi (${blockList.length})</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #ffe5e5;border-radius:8px;overflow:hidden;">
            <tr style="background:#fff5f5;">
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6e6e73;text-transform:uppercase;font-weight:600;">Email</th>
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6e6e73;text-transform:uppercase;font-weight:600;">Motivo</th>
            </tr>
            ${emailRows(blockList)}
          </table>
        </td></tr>` : ""}

        <!-- DISISCRITTI -->
        ${unsubList.length > 0 ? `
        <tr><td style="padding:24px 32px;border-bottom:1px solid #f0f0f0;">
          <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#6e6e73;text-transform:uppercase;letter-spacing:0.06em;">👋 Disiscritti Recenti (${unsubList.length})</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e5e5ea;border-radius:8px;overflow:hidden;">
            <tr style="background:#f5f5f7;">
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6e6e73;text-transform:uppercase;font-weight:600;">Email</th>
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6e6e73;text-transform:uppercase;font-weight:600;"></th>
            </tr>
            ${emailRows(unsubList)}
          </table>
        </td></tr>` : ""}

        <!-- FOOTER -->
        <tr><td style="padding:24px 32px;background:#f5f5f7;">
          <p style="margin:0;font-size:12px;color:#86868b;text-align:center;">
            ProofPress Admin · Report automatico post-invio ·
            <a href="${BASE_URL}/admin" style="color:#007aff;text-decoration:none;">Dashboard Admin</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * Invia il report post-invio newsletter a +1h.
 * Chiamare questa funzione subito dopo l'invio massivo — usa setTimeout internamente.
 */
export function schedulePostSendReport(params: {
  subject: string;
  recipientCount: number;
  sendDate?: Date;
  delayMs?: number; // default: 60 minuti
}): void {
  const { subject, recipientCount, sendDate = new Date(), delayMs = 60 * 60 * 1000 } = params;

  console.log(`[PostSendReport] ⏱ Report programmato tra ${Math.round(delayMs / 60000)} minuti`);

  setTimeout(async () => {
    console.log("[PostSendReport] 📊 Generazione report post-invio...");
    try {
      const html = await buildReportHtml({ subject, recipientCount, sendDate });
      const result = await sendEmail({
        sender: "daily",
        to: REPORT_TO,
        subject: `📊 Report Newsletter: ${subject.substring(0, 60)}`,
        html,
      });
      if (result.success) {
        console.log(`[PostSendReport] ✅ Report inviato a ${REPORT_TO}`);
      } else {
        console.error(`[PostSendReport] ❌ Errore invio report: ${result.error}`);
      }
    } catch (err) {
      console.error("[PostSendReport] ❌ Errore critico:", err);
    }
  }, delayMs);
}
