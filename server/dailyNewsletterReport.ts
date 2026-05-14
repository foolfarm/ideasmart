/**
 * dailyNewsletterReport.ts — Report giornaliero newsletter alle 18:30 CET
 * ─────────────────────────────────────────────────────────────────────────────
 * Inviato automaticamente ogni giorno alle 18:30 CET a ac@acinelli.com con
 * le performance complete di ENTRAMBE le newsletter del giorno:
 *
 *   📰 BUONGIORNO (08:30 CET, Lista 1 ~2.097 iscritti)
 *   ☀️  BUONPOMERIGGIO PPV (17:30 CET, Lista 2 ~1.285 iscritti)
 *
 * Dati estratti da:
 *   1. SendGrid API /v3/stats     → metriche aggregate del giorno (delivered, opens, clicks, bounces, spam)
 *   2. SendGrid API /v3/messages  → conteggio messaggi per subject (per separare le due newsletter)
 *   3. DB locale newsletter_sends → inviati, falliti, status per tipo
 *
 * Nota: SendGrid /v3/stats aggrega TUTTE le email del giorno insieme.
 * Per separare BUONGIORNO da PPV usiamo i sentCount dal DB come denominatori
 * e stimiamo la quota di aperture proporzionalmente al peso di ciascuna lista.
 */

import { sendEmail } from "./email";
import { fetchSendgridGlobalStats } from "./sendgridStats";
import { getDb } from "./db";
import { ENV } from "./_core/env";

const REPORT_TO = "ac@acinelli.com";
const BASE_URL = "https://proofpress.ai";
const SG_BASE = "https://api.sendgrid.com/v3";

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString("it-IT");
}

function pct(num: number, den: number): string {
  if (den === 0) return "—";
  return ((num / den) * 100).toFixed(1) + "%";
}

function rateColor(rate: number): string {
  if (rate >= 30) return "#34c759"; // verde — eccellente
  if (rate >= 20) return "#ff9500"; // arancione — buono
  return "#ff3b30";                 // rosso — sotto benchmark
}

function badge(label: string, value: string, color: string): string {
  return `
    <td style="text-align:center;padding:16px 12px;background:#f5f5f7;border-radius:12px;">
      <p style="margin:0;font-size:26px;font-weight:700;color:${color};">${value}</p>
      <p style="margin:4px 0 0;font-size:11px;color:#6e6e73;text-transform:uppercase;letter-spacing:0.05em;">${label}</p>
    </td>`;
}

function spacer(): string {
  return `<td style="width:8px;"></td>`;
}

// ── Recupera conteggio messaggi SendGrid per subject (per separare le due newsletter) ──
async function fetchMessageCountBySubjectPrefix(prefix: string, dateStr: string): Promise<number> {
  try {
    // Usa SendGrid Email Activity API per contare messaggi per subject
    const query = encodeURIComponent(
      `subject LIKE "${prefix}%" AND last_event_time BETWEEN TIMESTAMP "${dateStr}T00:00:00Z" AND TIMESTAMP "${dateStr}T23:59:59Z"`
    );
    const url = `${SG_BASE}/messages?limit=1000&query=${query}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${ENV.sendgridApiKey}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) return 0;
    const data = await res.json() as { messages?: unknown[] };
    return data.messages?.length ?? 0;
  } catch {
    return 0;
  }
}

// ── Recupera metriche dal DB locale per tipo newsletter ──────────────────────
async function getDbMetrics(dateStr: string): Promise<{
  morning: { sentCount: number; failedCount: number; recipientCount: number; subject: string; status: string } | null;
  ppv: { sentCount: number; failedCount: number; recipientCount: number; subject: string; status: string } | null;
}> {
  const result = { morning: null as any, ppv: null as any };
  try {
    const db = await getDb();
    if (!db) return result;
    const { newsletterSends } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");

    const rows = await db
      .select({
        newsletterType: newsletterSends.newsletterType,
        sentCount: newsletterSends.sentCount,
        failedCount: newsletterSends.failedCount,
        recipientCount: newsletterSends.recipientCount,
        subject: newsletterSends.subject,
        status: newsletterSends.status,
      })
      .from(newsletterSends)
      .where(eq(newsletterSends.sendDate, dateStr));

    for (const row of rows) {
      if (row.newsletterType === "morning") result.morning = row;
      if (row.newsletterType === "ppv") result.ppv = row;
    }
  } catch (err) {
    console.warn("[DailyReport] Errore lettura DB metrics:", err);
  }
  return result;
}

// ── Genera HTML del report ───────────────────────────────────────────────────
async function buildDailyReportHtml(): Promise<{ html: string; subject: string }> {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-CA", { timeZone: "Europe/Rome" }); // YYYY-MM-DD
  const dateLabel = now.toLocaleDateString("it-IT", {
    timeZone: "Europe/Rome",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const reportTime = now.toLocaleTimeString("it-IT", { timeZone: "Europe/Rome", hour: "2-digit", minute: "2-digit" });

  // ── 1. Statistiche aggregate SendGrid del giorno ─────────────────────────
  let sgStats = { delivered: 0, unique_opens: 0, unique_clicks: 0, bounces: 0, spam_reports: 0, blocks: 0, unsubscribes: 0, requests: 0 };
  try {
    const stats = await fetchSendgridGlobalStats(1);
    const today = stats.find(s => s.date === dateStr) ?? stats[stats.length - 1];
    if (today) {
      sgStats = {
        delivered: today.delivered,
        unique_opens: today.unique_opens,
        unique_clicks: today.unique_clicks,
        bounces: today.bounces,
        spam_reports: today.spam_reports,
        blocks: today.blocks,
        unsubscribes: today.unsubscribes,
        requests: today.requests,
      };
    }
  } catch (err) {
    console.warn("[DailyReport] Errore fetch SendGrid stats:", err);
  }

  // ── 2. Dati DB per tipo newsletter ───────────────────────────────────────
  const dbMetrics = await getDbMetrics(dateStr);
  const morningDb = dbMetrics.morning;
  const ppvDb = dbMetrics.ppv;

  // ── 3. Stima split aperture proporzionale ai destinatari ─────────────────
  // SendGrid aggrega tutto — distribuiamo le aperture proporzionalmente.
  // Priorità: sentCount (se > 0), poi recipientCount, poi default.
  // La newsletter BUONGIORNO salva solo recipientCount (non sent_count), quindi
  // usiamo recipientCount come base affidabile per entrambe le liste.
  const morningRecip = (morningDb?.sentCount && morningDb.sentCount > 0)
    ? morningDb.sentCount
    : (morningDb?.recipientCount && morningDb.recipientCount > 0)
      ? morningDb.recipientCount
      : 2097;
  const ppvRecip = (ppvDb?.sentCount && ppvDb.sentCount > 0)
    ? ppvDb.sentCount
    : (ppvDb?.recipientCount && ppvDb.recipientCount > 0)
      ? ppvDb.recipientCount
      : 1285;
  const totalRecip = morningRecip + ppvRecip;

  const morningWeight = totalRecip > 0 ? morningRecip / totalRecip : 0.62;
  const ppvWeight = totalRecip > 0 ? ppvRecip / totalRecip : 0.38;

  const morningDelivered = Math.round(sgStats.delivered * morningWeight);
  const ppvDelivered = sgStats.delivered - morningDelivered;

  const morningOpens = Math.round(sgStats.unique_opens * morningWeight);
  const ppvOpens = sgStats.unique_opens - morningOpens;

  const morningClicks = Math.round(sgStats.unique_clicks * morningWeight);
  const ppvClicks = sgStats.unique_clicks - morningClicks;

  // ── 4. Calcolo KPI ───────────────────────────────────────────────────────
  const totalOR = parseFloat(pct(sgStats.unique_opens, sgStats.delivered));
  const morningOR = parseFloat(pct(morningOpens, morningDelivered));
  const ppvOR = parseFloat(pct(ppvOpens, ppvDelivered));

  const morningSubject = morningDb?.subject ?? "BUONGIORNO — Le news di oggi da ProofPress";
  const ppvSubject = ppvDb?.subject ?? "☀️ Buonpomeriggio — ProofPress Verify™";
  const morningStatus = morningDb?.status ?? "—";
  const ppvStatus = ppvDb?.status ?? "—";

  function statusBadge(s: string): string {
    const map: Record<string, { label: string; color: string }> = {
      sent: { label: "✅ Inviata", color: "#34c759" },
      sending: { label: "🔄 In invio", color: "#ff9500" },
      pending: { label: "⏳ In attesa", color: "#8e8e93" },
      failed: { label: "❌ Fallita", color: "#ff3b30" },
      approved: { label: "✅ Approvata", color: "#34c759" },
    };
    const m = map[s] ?? { label: s, color: "#8e8e93" };
    return `<span style="display:inline-block;padding:2px 10px;border-radius:20px;background:${m.color}22;color:${m.color};font-size:12px;font-weight:600;">${m.label}</span>`;
  }

  // ── 5. Costruzione HTML ──────────────────────────────────────────────────
  const html = `<!DOCTYPE html>
<html lang="it">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f7;padding:32px 16px;">
    <tr><td align="center">
      <table width="620" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e5ea;">

        <!-- HEADER -->
        <tr><td style="background:linear-gradient(135deg,#0a1628 0%,#1a2a4a 100%);padding:28px 32px;">
          <p style="margin:0;font-size:11px;font-weight:700;color:#00b4a0;text-transform:uppercase;letter-spacing:0.12em;">ProofPress · Report Giornaliero</p>
          <h1 style="margin:8px 0 0;font-size:24px;font-weight:700;color:#ffffff;">📊 Performance Newsletter</h1>
          <p style="margin:6px 0 0;font-size:14px;color:#8899aa;">${dateLabel} · Generato alle ${reportTime} CET</p>
        </td></tr>

        <!-- RIEPILOGO TOTALE GIORNATA -->
        <tr><td style="padding:24px 32px;border-bottom:1px solid #f0f0f0;">
          <p style="margin:0 0 16px;font-size:12px;font-weight:700;color:#8e8e93;text-transform:uppercase;letter-spacing:0.08em;">Totale giornata — entrambe le newsletter</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              ${badge("Richieste", fmt(sgStats.requests), "#007aff")}
              ${spacer()}
              ${badge("Consegnate", fmt(sgStats.delivered), "#007aff")}
              ${spacer()}
              ${badge("Aperture uniche", fmt(sgStats.unique_opens), rateColor(totalOR))}
              ${spacer()}
              ${badge("OR%", pct(sgStats.unique_opens, sgStats.delivered), rateColor(totalOR))}
            </tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;">
            <tr>
              ${badge("Click unici", fmt(sgStats.unique_clicks), "#ff9500")}
              ${spacer()}
              ${badge("CTR%", pct(sgStats.unique_clicks, sgStats.delivered), "#ff9500")}
              ${spacer()}
              ${badge("Bounce", fmt(sgStats.bounces), sgStats.bounces > 0 ? "#ff3b30" : "#34c759")}
              ${spacer()}
              ${badge("Spam", fmt(sgStats.spam_reports), sgStats.spam_reports > 0 ? "#ff3b30" : "#34c759")}
            </tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;">
            <tr>
              ${badge("Blocchi", fmt(sgStats.blocks), sgStats.blocks > 5 ? "#ff9500" : "#8e8e93")}
              ${spacer()}
              ${badge("Disiscritti", fmt(sgStats.unsubscribes), sgStats.unsubscribes > 5 ? "#ff9500" : "#8e8e93")}
              ${spacer()}
              <td style="width:50%;"></td>
            </tr>
          </table>
        </td></tr>

        <!-- NEWSLETTER 1: BUONGIORNO -->
        <tr><td style="padding:24px 32px;border-bottom:1px solid #f0f0f0;">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
            <span style="font-size:20px;">📰</span>
            <div>
              <p style="margin:0;font-size:14px;font-weight:700;color:#1d1d1f;">BUONGIORNO — Lista 1</p>
              <p style="margin:2px 0 0;font-size:12px;color:#8e8e93;">Invio 08:30 CET · ~${fmt(morningRecip)} iscritti</p>
            </div>
            <div style="margin-left:auto;">${statusBadge(morningStatus)}</div>
          </div>
          <p style="margin:0 0 16px;font-size:13px;color:#6e6e73;font-style:italic;border-left:3px solid #007aff;padding-left:12px;">${morningSubject}</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;border:1px solid #e5e5ea;border-radius:10px;overflow:hidden;">
            <tr style="background:#f5f5f7;">
              <th style="padding:10px 14px;text-align:left;font-size:11px;color:#6e6e73;text-transform:uppercase;font-weight:600;border-bottom:1px solid #e5e5ea;">Metrica</th>
              <th style="padding:10px 14px;text-align:right;font-size:11px;color:#6e6e73;text-transform:uppercase;font-weight:600;border-bottom:1px solid #e5e5ea;">Valore</th>
              <th style="padding:10px 14px;text-align:right;font-size:11px;color:#6e6e73;text-transform:uppercase;font-weight:600;border-bottom:1px solid #e5e5ea;">Benchmark B2B</th>
            </tr>
            <tr>
              <td style="padding:10px 14px;font-size:13px;color:#1d1d1f;border-bottom:1px solid #f0f0f0;">Inviati (DB)</td>
              <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#1d1d1f;text-align:right;border-bottom:1px solid #f0f0f0;">${fmt(morningRecip)}</td>
              <td style="padding:10px 14px;font-size:12px;color:#8e8e93;text-align:right;border-bottom:1px solid #f0f0f0;">—</td>
            </tr>
            <tr style="background:#fafafa;">
              <td style="padding:10px 14px;font-size:13px;color:#1d1d1f;border-bottom:1px solid #f0f0f0;">Consegnate (stima)</td>
              <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#007aff;text-align:right;border-bottom:1px solid #f0f0f0;">${fmt(morningDelivered)}</td>
              <td style="padding:10px 14px;font-size:12px;color:#8e8e93;text-align:right;border-bottom:1px solid #f0f0f0;">&gt;95%</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;font-size:13px;color:#1d1d1f;border-bottom:1px solid #f0f0f0;">Aperture uniche (stima)</td>
              <td style="padding:10px 14px;font-size:13px;font-weight:600;color:${rateColor(morningOR)};text-align:right;border-bottom:1px solid #f0f0f0;">${fmt(morningOpens)}</td>
              <td style="padding:10px 14px;font-size:12px;color:#8e8e93;text-align:right;border-bottom:1px solid #f0f0f0;">20–25%</td>
            </tr>
            <tr style="background:#fafafa;">
              <td style="padding:10px 14px;font-size:13px;color:#1d1d1f;border-bottom:1px solid #f0f0f0;">Open Rate (stima)</td>
              <td style="padding:10px 14px;font-size:14px;font-weight:700;color:${rateColor(morningOR)};text-align:right;border-bottom:1px solid #f0f0f0;">${pct(morningOpens, morningDelivered)}</td>
              <td style="padding:10px 14px;font-size:12px;color:#8e8e93;text-align:right;border-bottom:1px solid #f0f0f0;">20–25%</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;font-size:13px;color:#1d1d1f;border-bottom:1px solid #f0f0f0;">Click unici (stima)</td>
              <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#ff9500;text-align:right;border-bottom:1px solid #f0f0f0;">${fmt(morningClicks)}</td>
              <td style="padding:10px 14px;font-size:12px;color:#8e8e93;text-align:right;border-bottom:1px solid #f0f0f0;">2–5%</td>
            </tr>
            <tr style="background:#fafafa;">
              <td style="padding:10px 14px;font-size:13px;color:#1d1d1f;">CTR (stima)</td>
              <td style="padding:10px 14px;font-size:14px;font-weight:700;color:#ff9500;text-align:right;">${pct(morningClicks, morningDelivered)}</td>
              <td style="padding:10px 14px;font-size:12px;color:#8e8e93;text-align:right;">2–5%</td>
            </tr>
          </table>
          <p style="margin:10px 0 0;font-size:11px;color:#8e8e93;font-style:italic;">* Consegnate, aperture e click sono stime proporzionali basate sul peso della lista (${Math.round(morningWeight * 100)}% del totale). I dati esatti sono aggregati da SendGrid.</p>
        </td></tr>

        <!-- NEWSLETTER 2: BUONPOMERIGGIO PPV -->
        <tr><td style="padding:24px 32px;border-bottom:1px solid #f0f0f0;">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
            <span style="font-size:20px;">☀️</span>
            <div>
              <p style="margin:0;font-size:14px;font-weight:700;color:#1d1d1f;">BUONPOMERIGGIO PPV — Lista 2</p>
              <p style="margin:2px 0 0;font-size:12px;color:#8e8e93;">Invio 17:30 CET · ~${fmt(ppvRecip)} iscritti</p>
            </div>
            <div style="margin-left:auto;">${statusBadge(ppvStatus)}</div>
          </div>
          <p style="margin:0 0 16px;font-size:13px;color:#6e6e73;font-style:italic;border-left:3px solid #00b4a0;padding-left:12px;">${ppvSubject}</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;border:1px solid #e5e5ea;border-radius:10px;overflow:hidden;">
            <tr style="background:#f5f5f7;">
              <th style="padding:10px 14px;text-align:left;font-size:11px;color:#6e6e73;text-transform:uppercase;font-weight:600;border-bottom:1px solid #e5e5ea;">Metrica</th>
              <th style="padding:10px 14px;text-align:right;font-size:11px;color:#6e6e73;text-transform:uppercase;font-weight:600;border-bottom:1px solid #e5e5ea;">Valore</th>
              <th style="padding:10px 14px;text-align:right;font-size:11px;color:#6e6e73;text-transform:uppercase;font-weight:600;border-bottom:1px solid #e5e5ea;">Benchmark B2B</th>
            </tr>
            <tr>
              <td style="padding:10px 14px;font-size:13px;color:#1d1d1f;border-bottom:1px solid #f0f0f0;">Inviati (DB)</td>
              <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#1d1d1f;text-align:right;border-bottom:1px solid #f0f0f0;">${fmt(ppvRecip)}</td>
              <td style="padding:10px 14px;font-size:12px;color:#8e8e93;text-align:right;border-bottom:1px solid #f0f0f0;">—</td>
            </tr>
            <tr style="background:#fafafa;">
              <td style="padding:10px 14px;font-size:13px;color:#1d1d1f;border-bottom:1px solid #f0f0f0;">Consegnate (stima)</td>
              <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#007aff;text-align:right;border-bottom:1px solid #f0f0f0;">${fmt(ppvDelivered)}</td>
              <td style="padding:10px 14px;font-size:12px;color:#8e8e93;text-align:right;border-bottom:1px solid #f0f0f0;">&gt;95%</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;font-size:13px;color:#1d1d1f;border-bottom:1px solid #f0f0f0;">Aperture uniche (stima)</td>
              <td style="padding:10px 14px;font-size:13px;font-weight:600;color:${rateColor(ppvOR)};text-align:right;border-bottom:1px solid #f0f0f0;">${fmt(ppvOpens)}</td>
              <td style="padding:10px 14px;font-size:12px;color:#8e8e93;text-align:right;border-bottom:1px solid #f0f0f0;">20–25%</td>
            </tr>
            <tr style="background:#fafafa;">
              <td style="padding:10px 14px;font-size:13px;color:#1d1d1f;border-bottom:1px solid #f0f0f0;">Open Rate (stima)</td>
              <td style="padding:10px 14px;font-size:14px;font-weight:700;color:${rateColor(ppvOR)};text-align:right;border-bottom:1px solid #f0f0f0;">${pct(ppvOpens, ppvDelivered)}</td>
              <td style="padding:10px 14px;font-size:12px;color:#8e8e93;text-align:right;border-bottom:1px solid #f0f0f0;">20–25%</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;font-size:13px;color:#1d1d1f;border-bottom:1px solid #f0f0f0;">Click unici (stima)</td>
              <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#ff9500;text-align:right;border-bottom:1px solid #f0f0f0;">${fmt(ppvClicks)}</td>
              <td style="padding:10px 14px;font-size:12px;color:#8e8e93;text-align:right;border-bottom:1px solid #f0f0f0;">2–5%</td>
            </tr>
            <tr style="background:#fafafa;">
              <td style="padding:10px 14px;font-size:13px;color:#1d1d1f;">CTR (stima)</td>
              <td style="padding:10px 14px;font-size:14px;font-weight:700;color:#ff9500;text-align:right;">${pct(ppvClicks, ppvDelivered)}</td>
              <td style="padding:10px 14px;font-size:12px;color:#8e8e93;text-align:right;">2–5%</td>
            </tr>
          </table>
          <p style="margin:10px 0 0;font-size:11px;color:#8e8e93;font-style:italic;">* Consegnate, aperture e click sono stime proporzionali basate sul peso della lista (${Math.round(ppvWeight * 100)}% del totale). I dati esatti sono aggregati da SendGrid.</p>
        </td></tr>

        <!-- NOTE METODOLOGICHE -->
        <tr><td style="padding:20px 32px;border-bottom:1px solid #f0f0f0;background:#fafafa;">
          <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#8e8e93;text-transform:uppercase;letter-spacing:0.06em;">ℹ️ Nota metodologica</p>
          <p style="margin:0;font-size:12px;color:#6e6e73;line-height:1.6;">
            SendGrid aggrega le statistiche di tutte le email in un'unica metrica giornaliera. I dati <em>Totale giornata</em> sono esatti (API /v3/stats). Le metriche per singola newsletter (BUONGIORNO e PPV) sono <strong>stime proporzionali</strong> calcolate in base al peso di ciascuna lista sul totale degli invii del giorno. I conteggi <em>Inviati</em> provengono dal database locale (tabella newsletter_sends).
          </p>
        </td></tr>

        <!-- FOOTER -->
        <tr><td style="padding:20px 32px;background:#f5f5f7;">
          <p style="margin:0;font-size:11px;color:#8e8e93;text-align:center;">
            Report automatico generato da <strong style="color:#00b4a0;">ProofPress.AI</strong> · Scheduler 18:30 CET<br>
            <a href="${BASE_URL}/admin" style="color:#007aff;text-decoration:none;">Accedi all'Admin</a> · 
            <a href="https://app.sendgrid.com/statistics" style="color:#007aff;text-decoration:none;">SendGrid Dashboard</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const emailSubject = `📊 ProofPress · Report Newsletter ${dateLabel}`;
  return { html, subject: emailSubject };
}

// ── Funzione principale esportata ────────────────────────────────────────────

/**
 * Invia il report giornaliero delle newsletter a ac@acinelli.com.
 * Chiamata dallo scheduler alle 18:30 CET ogni giorno.
 */
export async function sendDailyNewsletterReport(): Promise<void> {
  console.log("[DailyNewsletterReport] 📊 Avvio generazione report giornaliero newsletter...");
  try {
    const { html, subject } = await buildDailyReportHtml();

    const result = await sendEmail({
      to: REPORT_TO,
      subject,
      html,
      sender: "default", // Mittente: info@proofpress.ai (report amministrativi)
    });

    if (result.success) {
      console.log(`[DailyNewsletterReport] ✅ Report inviato a ${REPORT_TO}: "${subject}"`);
    } else {
      console.error(`[DailyNewsletterReport] ❌ Invio fallito: ${result.error}`);
    }
  } catch (err) {
    console.error("[DailyNewsletterReport] ❌ Errore generazione report:", err);
  }
}
