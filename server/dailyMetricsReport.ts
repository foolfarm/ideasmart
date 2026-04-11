/**
 * dailyMetricsReport.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Email giornaliera alle 18:00 CET con metriche del sito ProofPress:
 *
 * A) Nuovi iscritti/subscriber nelle ultime 24h + totale mailing list
 * B) Newsletter inviate oggi: destinatari, aperture, tasso apertura
 * C) Post LinkedIn pubblicati oggi
 * D) Contenuti generati oggi (news AI, Startup, Research, DEALROOM)
 * ──────────────────────────────────────────────────────────────────────────────
 */
import { getDb } from "./db";
import {
  subscribers,
  newsletterSends,
  linkedinPosts,
  newsItems,
  researchReports,
} from "../drizzle/schema";
import { eq, gte, and, count, desc, sql } from "drizzle-orm";
import { sendEmail } from "./email";

const REPORT_EMAIL = "ac@acinelli.com";
const BRAND = "ProofPress";
const BRAND_COLOR = "#1a1a1a";
const ACCENT_COLOR = "#ff5500";

// Anti-duplicato: traccia l'ultima data in cui il report è stato inviato (YYYY-MM-DD)
let lastReportSentDate: string | null = null;

// ─── Utility ─────────────────────────────────────────────────────────────────
function formatNum(n: number): string {
  return n.toLocaleString("it-IT");
}

function pct(part: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

function formatDateIT(d: Date): string {
  return d.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── Raccolta dati ────────────────────────────────────────────────────────────
interface DailyMetrics {
  // Subscribers
  newSubscribersToday: number;
  totalActiveSubscribers: number;
  totalUnsubscribed: number;

  // Newsletter
  newslettersSentToday: {
    subject: string;
    section: string;
    recipientCount: number;
    openedCount: number;
    sentAt: Date | null;
  }[];

  // LinkedIn
  linkedinPostsToday: {
    slot: string;
    title: string | null;
    section: string;
    linkedinUrl: string | null;
  }[];

  // Contenuti
  aiNewsToday: number;
  startupNewsToday: number;
  dealroomNewsToday: number;
  researchToday: number;
}

export async function collectDailyMetrics(): Promise<DailyMetrics | null> {
  const db = await getDb();
  if (!db) {
    console.error("[DailyMetrics] DB non disponibile");
    return null;
  }

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const todayLabel = now.toISOString().slice(0, 10); // YYYY-MM-DD

  try {
    // A) Subscribers
    const [newSubsResult] = await db
      .select({ cnt: count() })
      .from(subscribers)
      .where(and(
        gte(subscribers.subscribedAt, todayStart),
        eq(subscribers.status, "active")
      ));
    const newSubscribersToday = newSubsResult?.cnt ?? 0;

    const [totalActiveResult] = await db
      .select({ cnt: count() })
      .from(subscribers)
      .where(eq(subscribers.status, "active"));
    const totalActiveSubscribers = totalActiveResult?.cnt ?? 0;

    const [totalUnsubResult] = await db
      .select({ cnt: count() })
      .from(subscribers)
      .where(eq(subscribers.status, "unsubscribed"));
    const totalUnsubscribed = totalUnsubResult?.cnt ?? 0;

    // B) Newsletter inviate oggi — deduplicazione per subject
    // Ogni invio può generare più record (retry, test, ecc.)
    // Prendiamo l'invio con recipientCount massimo per ogni oggetto univoco
    const nlSentRaw = await db
      .select({
        subject: newsletterSends.subject,
        section: newsletterSends.section,
        recipientCount: newsletterSends.recipientCount,
        openedCount: newsletterSends.openedCount,
        sentAt: newsletterSends.sentAt,
      })
      .from(newsletterSends)
      .where(and(
        gte(newsletterSends.createdAt, todayStart),
        eq(newsletterSends.status, "sent")
      ))
      .orderBy(desc(newsletterSends.sentAt))
      .limit(50); // prendo più record per poi deduplicare

    // Deduplicazione: per ogni subject univoco, tieni il record con recipientCount massimo
    // (se recipientCount è uguale, tieni il più recente)
    const nlBySubject = new Map<string, typeof nlSentRaw[0]>();
    for (const row of nlSentRaw) {
      const existing = nlBySubject.get(row.subject);
      if (!existing || row.recipientCount > existing.recipientCount) {
        nlBySubject.set(row.subject, row);
      }
    }
    const nlSent = Array.from(nlBySubject.values())
      .sort((a, b) => (b.sentAt?.getTime() ?? 0) - (a.sentAt?.getTime() ?? 0))
      .slice(0, 10);

    // C) Post LinkedIn di oggi
    const liPosts = await db
      .select({
        slot: linkedinPosts.slot,
        title: linkedinPosts.title,
        section: linkedinPosts.section,
        linkedinUrl: linkedinPosts.linkedinUrl,
      })
      .from(linkedinPosts)
      .where(eq(linkedinPosts.dateLabel, todayLabel))
      .orderBy(desc(linkedinPosts.id))
      .limit(10);

    // D) Contenuti generati oggi
    const [aiNewsResult] = await db
      .select({ cnt: count() })
      .from(newsItems)
      .where(and(
        eq(newsItems.section, "ai"),
        gte(newsItems.createdAt, todayStart)
      ));
    const aiNewsToday = aiNewsResult?.cnt ?? 0;

    const [startupNewsResult] = await db
      .select({ cnt: count() })
      .from(newsItems)
      .where(and(
        eq(newsItems.section, "startup"),
        gte(newsItems.createdAt, todayStart)
      ));
    const startupNewsToday = startupNewsResult?.cnt ?? 0;

    const [dealroomResult] = await db
      .select({ cnt: count() })
      .from(newsItems)
      .where(and(
        eq(newsItems.section, "dealroom"),
        gte(newsItems.createdAt, todayStart)
      ));
    const dealroomNewsToday = dealroomResult?.cnt ?? 0;

    const [researchResult] = await db
      .select({ cnt: count() })
      .from(researchReports)
      .where(gte(researchReports.createdAt, todayStart));
    const researchToday = researchResult?.cnt ?? 0;

    return {
      newSubscribersToday,
      totalActiveSubscribers,
      totalUnsubscribed,
      newslettersSentToday: nlSent.map(n => ({
        subject: n.subject,
        section: n.section,
        recipientCount: n.recipientCount,
        openedCount: n.openedCount,
        sentAt: n.sentAt,
      })),
      linkedinPostsToday: liPosts.map(p => ({
        slot: p.slot,
        title: p.title,
        section: p.section,
        linkedinUrl: p.linkedinUrl,
      })),
      aiNewsToday,
      startupNewsToday,
      dealroomNewsToday,
      researchToday,
    };
  } catch (err) {
    console.error("[DailyMetrics] Errore raccolta dati:", err);
    return null;
  }
}

// ─── Template HTML ────────────────────────────────────────────────────────────
function buildDailyMetricsHtml(metrics: DailyMetrics, date: Date): string {
  const dateStr = formatDateIT(date);

  const totalNlRecipients = metrics.newslettersSentToday.reduce((s, n) => s + n.recipientCount, 0);
  const totalNlOpened = metrics.newslettersSentToday.reduce((s, n) => s + n.openedCount, 0);

  const nlRows = metrics.newslettersSentToday.length > 0
    ? metrics.newslettersSentToday.map(n => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#333;">${n.subject.substring(0, 60)}${n.subject.length > 60 ? "…" : ""}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#333;text-align:center;">${formatNum(n.recipientCount)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#333;text-align:center;">${formatNum(n.openedCount)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:bold;color:${n.openedCount / Math.max(n.recipientCount, 1) > 0.25 ? "#00b89a" : "#ff5500"};text-align:center;">${pct(n.openedCount, n.recipientCount)}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="4" style="padding:12px;text-align:center;color:#999;font-size:13px;">Nessuna newsletter inviata oggi</td></tr>`;

  const slotLabels: Record<string, string> = {
    morning: "10:00 — Mattino",
    "startup-afternoon": "12:30 — Startup",
    research: "14:30 — Research",
    "research-afternoon": "16:00 — Research 2°",
    "ai-tool-radar": "16:00 — AI Tool Radar",
    dealroom: "18:00 — Dealroom",
    afternoon: "Pomeriggio",
    evening: "Sera",
  };

  const liRows = metrics.linkedinPostsToday.length > 0
    ? metrics.linkedinPostsToday.map(p => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#333;">${slotLabels[p.slot] ?? p.slot}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#333;">${p.title?.substring(0, 55) ?? "—"}${(p.title?.length ?? 0) > 55 ? "…" : ""}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;text-align:center;">
          ${p.linkedinUrl ? `<a href="${p.linkedinUrl}" style="color:#0077b5;font-weight:bold;text-decoration:none;">Vedi →</a>` : "—"}
        </td>
      </tr>
    `).join("")
    : `<tr><td colspan="3" style="padding:12px;text-align:center;color:#999;font-size:13px;">Nessun post LinkedIn oggi</td></tr>`;

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Report Giornaliero ProofPress — ${dateStr}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e8e8e8;max-width:600px;width:100%;">

          <!-- HEADER -->
          <tr>
            <td style="background:${BRAND_COLOR};padding:24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0;font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;">${BRAND}</p>
                    <p style="margin:4px 0 0;font-size:11px;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.15em;">Report Giornaliero</p>
                  </td>
                  <td align="right">
                    <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.5);">18:00 CET</p>
                    <p style="margin:2px 0 0;font-size:11px;color:rgba(255,255,255,0.4);">${dateStr}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- SEZIONE A: MAILING LIST -->
          <tr>
            <td style="padding:28px 32px 0;">
              <p style="margin:0 0 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;color:${ACCENT_COLOR};">A — Mailing List</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="33%" style="text-align:center;padding:16px;background:#fafafa;border:1px solid #f0f0f0;">
                    <p style="margin:0;font-size:32px;font-weight:900;color:${metrics.newSubscribersToday > 0 ? '#00b89a' : BRAND_COLOR};">${metrics.newSubscribersToday > 0 ? "+" : ""}${formatNum(metrics.newSubscribersToday)}</p>
                    <p style="margin:4px 0 0;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#999;">Nuovi oggi</p>
                    ${metrics.newSubscribersToday === 0 ? '<p style="margin:2px 0 0;font-size:9px;color:#ccc;">(nessuna nuova iscrizione)</p>' : ''}
                  </td>
                  <td width="4%"></td>
                  <td width="33%" style="text-align:center;padding:16px;background:#fafafa;border:1px solid #f0f0f0;">
                    <p style="margin:0;font-size:32px;font-weight:900;color:${BRAND_COLOR};">${formatNum(metrics.totalActiveSubscribers)}</p>
                    <p style="margin:4px 0 0;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#999;">Totale attivi</p>
                  </td>
                  <td width="4%"></td>
                  <td width="26%" style="text-align:center;padding:16px;background:#fafafa;border:1px solid #f0f0f0;">
                    <p style="margin:0;font-size:32px;font-weight:900;color:#999;">${formatNum(metrics.totalUnsubscribed)}</p>
                    <p style="margin:4px 0 0;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#999;">Disiscritti</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- SEZIONE B: NEWSLETTER -->
          <tr>
            <td style="padding:28px 32px 0;">
              <p style="margin:0 0 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;color:${ACCENT_COLOR};">B — Newsletter Inviate Oggi</p>
              ${metrics.newslettersSentToday.length > 0 ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0f0f0;">
                <tr style="background:#fafafa;">
                  <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#999;font-weight:600;">Oggetto</th>
                  <th style="padding:8px 12px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#999;font-weight:600;">Inviati</th>
                  <th style="padding:8px 12px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#999;font-weight:600;">Aperture</th>
                  <th style="padding:8px 12px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#999;font-weight:600;">Tasso</th>
                </tr>
                ${nlRows}
              </table>
              <p style="margin:8px 0 0;font-size:11px;color:#999;">Totale: ${formatNum(totalNlRecipients)} inviati · ${formatNum(totalNlOpened)} aperture · ${pct(totalNlOpened, totalNlRecipients)} tasso medio &nbsp;&middot;&nbsp; <em>${metrics.newslettersSentToday.length} newsletter univoche (deduplicato per oggetto)</em></p>
              ` : `<p style="margin:0;font-size:13px;color:#999;font-style:italic;">Nessuna newsletter inviata oggi.</p>`}
            </td>
          </tr>

          <!-- SEZIONE C: LINKEDIN -->
          <tr>
            <td style="padding:28px 32px 0;">
              <p style="margin:0 0 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;color:${ACCENT_COLOR};">C — Post LinkedIn Oggi</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0f0f0;">
                <tr style="background:#fafafa;">
                  <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#999;font-weight:600;">Slot</th>
                  <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#999;font-weight:600;">Titolo</th>
                  <th style="padding:8px 12px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#999;font-weight:600;">Link</th>
                </tr>
                ${liRows}
              </table>
            </td>
          </tr>

          <!-- SEZIONE D: CONTENUTI -->
          <tr>
            <td style="padding:28px 32px 0;">
              <p style="margin:0 0 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;color:${ACCENT_COLOR};">D — Contenuti Generati Oggi</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="23%" style="text-align:center;padding:12px 8px;background:#fafafa;border:1px solid #f0f0f0;">
                    <p style="margin:0;font-size:24px;font-weight:900;color:${BRAND_COLOR};">${formatNum(metrics.aiNewsToday)}</p>
                    <p style="margin:4px 0 0;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#999;">AI News</p>
                  </td>
                  <td width="4%"></td>
                  <td width="23%" style="text-align:center;padding:12px 8px;background:#fafafa;border:1px solid #f0f0f0;">
                    <p style="margin:0;font-size:24px;font-weight:900;color:${BRAND_COLOR};">${formatNum(metrics.startupNewsToday)}</p>
                    <p style="margin:4px 0 0;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#999;">Startup</p>
                  </td>
                  <td width="4%"></td>
                  <td width="23%" style="text-align:center;padding:12px 8px;background:#fafafa;border:1px solid #f0f0f0;">
                    <p style="margin:0;font-size:24px;font-weight:900;color:${BRAND_COLOR};">${formatNum(metrics.dealroomNewsToday)}</p>
                    <p style="margin:4px 0 0;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#999;">Dealroom</p>
                  </td>
                  <td width="4%"></td>
                  <td width="19%" style="text-align:center;padding:12px 8px;background:#fafafa;border:1px solid #f0f0f0;">
                    <p style="margin:0;font-size:24px;font-weight:900;color:${BRAND_COLOR};">${formatNum(metrics.researchToday)}</p>
                    <p style="margin:4px 0 0;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#999;">Research</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:32px 32px 24px;">
              <div style="border-top:1px solid #f0f0f0;padding-top:20px;">
                <p style="margin:0;font-size:11px;color:#bbb;text-align:center;">
                  Report automatico generato da <strong style="color:${BRAND_COLOR};">${BRAND}</strong> · ${dateStr} · 18:00 CET<br>
                  <a href="https://proofpress.ai" style="color:${ACCENT_COLOR};text-decoration:none;">proofpress.ai</a>
                </p>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Funzione principale ──────────────────────────────────────────────────────
export async function sendDailyMetricsReport(): Promise<void> {
  // Anti-duplicato: non inviare più di 1 volta al giorno
  const todayKey = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Rome" }); // YYYY-MM-DD
  if (lastReportSentDate === todayKey) {
    console.log(`[DailyMetrics] ⏳ Report già inviato oggi (${todayKey}) — skip`);
    return;
  }

  console.log("[DailyMetrics] 📊 Avvio report giornaliero metriche...");

  const metrics = await collectDailyMetrics();
  if (!metrics) {
    console.error("[DailyMetrics] Impossibile raccogliere metriche — report saltato");
    return;
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const subject = `📊 ProofPress Daily — ${dateStr} | +${metrics.newSubscribersToday} iscritti · ${metrics.totalActiveSubscribers} totali`;
  const html = buildDailyMetricsHtml(metrics, now);

  const result = await sendEmail({
    to: REPORT_EMAIL,
    subject,
    html,
    text: `Report giornaliero ProofPress — ${dateStr}\n\nNuovi iscritti oggi: ${metrics.newSubscribersToday}\nTotale attivi: ${metrics.totalActiveSubscribers}\nNewsletter inviate: ${metrics.newslettersSentToday.length}\nPost LinkedIn: ${metrics.linkedinPostsToday.length}\nAI News: ${metrics.aiNewsToday} | Startup: ${metrics.startupNewsToday} | Dealroom: ${metrics.dealroomNewsToday} | Research: ${metrics.researchToday}`,
  });

  if (result.success) {
    lastReportSentDate = todayKey; // segna come inviato oggi
    console.log(`[DailyMetrics] ✅ Report inviato a ${REPORT_EMAIL} (prossimo domani)`);
  } else {
    console.error(`[DailyMetrics] ❌ Errore invio report: ${result.error}`);
  }
}
