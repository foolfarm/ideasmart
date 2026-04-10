/**
 * newsletterLinkAudit.ts — Audit automatico dei link della newsletter
 * ─────────────────────────────────────────────────────────────────────────────
 * Eseguito ogni mattina alle 06:45 CET (prima della preview delle 07:00).
 *
 * Funzionamento:
 *   1. Costruisce la newsletter del giorno (senza inviarla)
 *   2. Estrae tutti i link href presenti nell'HTML
 *   3. Verifica ogni link con una richiesta HEAD (timeout 8s)
 *   4. Classifica i link: OK (2xx/3xx), BROKEN (4xx/5xx), TIMEOUT, SKIP (mailto/tel)
 *   5. Invia un report via email a info@proofpress.ai con il riepilogo
 *   6. Se ci sono link broken su proofpress.ai, blocca l'invio e notifica l'owner
 *
 * Soglia di blocco: qualsiasi link proofpress.ai che risponde 4xx/5xx
 * (i link esterni possono fallire senza bloccare l'invio)
 */

import { sendEmail } from "./email";
import { buildChannelNewsletter, getTodayChannel } from "./dailyChannelNewsletter";
import { notifyOwner } from "./_core/notification";

const AUDIT_EMAIL = "info@proofpress.ai";
const BASE_DOMAIN = "proofpress.ai";
const TIMEOUT_MS = 8000;

// ─── Tipi ────────────────────────────────────────────────────────────────────

export interface LinkCheckResult {
  url: string;
  status: "ok" | "broken" | "timeout" | "skip" | "error";
  httpCode?: number;
  isInternal: boolean;
  errorMessage?: string;
}

export interface AuditReport {
  date: string;
  channel: string;
  totalLinks: number;
  okCount: number;
  brokenCount: number;
  timeoutCount: number;
  skipCount: number;
  internalBroken: LinkCheckResult[];
  externalBroken: LinkCheckResult[];
  allResults: LinkCheckResult[];
  shouldBlockSend: boolean;
}

// ─── Estrazione link dall'HTML ────────────────────────────────────────────────

export function extractLinksFromHtml(html: string): string[] {
  const hrefRegex = /href="([^"]+)"/gi;
  const links: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = hrefRegex.exec(html)) !== null) {
    const url = match[1].trim();
    // Salta mailto:, tel:, #anchor, javascript:
    if (
      url.startsWith("mailto:") ||
      url.startsWith("tel:") ||
      url.startsWith("#") ||
      url.startsWith("javascript:")
    ) {
      continue;
    }
    // Salta URL con template literal non risolti (non dovrebbero esserci, ma per sicurezza)
    if (url.includes("${")) {
      continue;
    }
    if (!links.includes(url)) {
      links.push(url);
    }
  }
  return links;
}

// ─── Verifica singolo link ────────────────────────────────────────────────────

async function checkLink(url: string): Promise<LinkCheckResult> {
  const isInternal = url.includes(BASE_DOMAIN);

  // Skip link non-HTTP
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return { url, status: "skip", isInternal };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Proof Press-LinkAudit/1.0 (newsletter link checker)",
      },
    });

    clearTimeout(timeoutId);

    const httpCode = response.status;
    const isOk = httpCode >= 200 && httpCode < 400;

    return {
      url,
      status: isOk ? "ok" : "broken",
      httpCode,
      isInternal,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("abort") || msg.includes("timeout")) {
      return { url, status: "timeout", isInternal, errorMessage: "Timeout dopo 8s" };
    }
    return { url, status: "error", isInternal, errorMessage: msg.slice(0, 100) };
  }
}

// ─── Audit completo ───────────────────────────────────────────────────────────

export async function runNewsletterLinkAudit(): Promise<AuditReport | null> {
  const channel = getTodayChannel();
  if (!channel) {
    console.log("[LinkAudit] Nessun canale configurato per oggi, skip audit");
    return null;
  }

  const dateLabel = new Date().toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  console.log(`[LinkAudit] 🔍 Avvio audit link newsletter ${channel.name} — ${dateLabel}`);

  // 1. Costruisce la newsletter del giorno
  let html: string;
  try {
    const result = await buildChannelNewsletter(channel, false);
    html = result.html;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[LinkAudit] ❌ Errore costruzione newsletter:", msg);
    await notifyOwner({
      title: `❌ Audit link newsletter FALLITO — ${dateLabel}`,
      content: `Impossibile costruire la newsletter ${channel.name} per l'audit.\n\nErrore: ${msg}\n\nL'invio delle 07:30 potrebbe essere compromesso.`,
    });
    return null;
  }

  // 2. Estrae tutti i link
  const links = extractLinksFromHtml(html);
  console.log(`[LinkAudit] 📋 Trovati ${links.length} link unici da verificare`);

  // 3. Verifica ogni link in parallelo (max 10 alla volta per non sovraccaricare)
  const CONCURRENCY = 10;
  const allResults: LinkCheckResult[] = [];

  for (let i = 0; i < links.length; i += CONCURRENCY) {
    const batch = links.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(batch.map(checkLink));
    allResults.push(...batchResults);
  }

  // 4. Classifica i risultati
  const okCount = allResults.filter(r => r.status === "ok").length;
  const brokenCount = allResults.filter(r => r.status === "broken" || r.status === "error").length;
  const timeoutCount = allResults.filter(r => r.status === "timeout").length;
  const skipCount = allResults.filter(r => r.status === "skip").length;

  const internalBroken = allResults.filter(
    r => r.isInternal && (r.status === "broken" || r.status === "error")
  );
  const externalBroken = allResults.filter(
    r => !r.isInternal && (r.status === "broken" || r.status === "error")
  );

  // 5. Determina se bloccare l'invio
  const shouldBlockSend = internalBroken.length > 0;

  const report: AuditReport = {
    date: dateLabel,
    channel: channel.name,
    totalLinks: links.length,
    okCount,
    brokenCount,
    timeoutCount,
    skipCount,
    internalBroken,
    externalBroken,
    allResults,
    shouldBlockSend,
  };

  console.log(`[LinkAudit] ✅ ${okCount} OK | ❌ ${brokenCount} broken | ⏱ ${timeoutCount} timeout | ⏭ ${skipCount} skip`);
  if (internalBroken.length > 0) {
    console.warn(`[LinkAudit] ⚠️ ${internalBroken.length} link INTERNI rotti — INVIO BLOCCATO`);
    internalBroken.forEach(r => console.warn(`  ❌ ${r.url} → HTTP ${r.httpCode ?? r.errorMessage}`));
  }

  // 6. Invia report via email
  await sendAuditReportEmail(report);

  // 7. Notifica owner se ci sono link interni rotti
  if (shouldBlockSend) {
    await notifyOwner({
      title: `🚨 LINK ROTTI nella newsletter ${channel.name} — INVIO BLOCCATO`,
      content: `Audit pre-invio ha rilevato ${internalBroken.length} link interni rotti su proofpress.ai.\n\nL'invio massivo delle 07:30 è stato BLOCCATO.\n\nLink rotti:\n${internalBroken.map(r => `• ${r.url} → HTTP ${r.httpCode ?? r.errorMessage}`).join("\n")}\n\nVerifica le pagine e forza l'invio manualmente dalla dashboard admin.`,
    });
  }

  return report;
}

// ─── Email report HTML ────────────────────────────────────────────────────────

async function sendAuditReportEmail(report: AuditReport): Promise<void> {
  const statusIcon = report.shouldBlockSend ? "🚨" : report.brokenCount > 0 ? "⚠️" : "✅";
  const statusText = report.shouldBlockSend
    ? "INVIO BLOCCATO — Link interni rotti"
    : report.brokenCount > 0
    ? "Avviso — Link esterni non raggiungibili"
    : "Tutti i link verificati con successo";

  const brokenRowsHtml = (rows: LinkCheckResult[]) =>
    rows
      .map(
        r => `
    <tr>
      <td style="padding:6px 10px;font-size:12px;font-family:monospace;color:#dc2626;word-break:break-all;">${r.url}</td>
      <td style="padding:6px 10px;font-size:12px;text-align:center;font-weight:bold;color:#dc2626;">${r.httpCode ?? r.errorMessage ?? r.status}</td>
    </tr>`
      )
      .join("");

  const allOkRowsHtml = report.allResults
    .filter(r => r.status === "ok")
    .slice(0, 20)
    .map(
      r => `
    <tr>
      <td style="padding:4px 10px;font-size:11px;font-family:monospace;color:#166534;word-break:break-all;">${r.url}</td>
      <td style="padding:4px 10px;font-size:11px;text-align:center;color:#166534;">${r.httpCode}</td>
    </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"><title>Audit Link Newsletter</title></head>
<body style="margin:0;padding:24px;background:#f3f4f6;font-family:'Helvetica Neue',sans-serif;">
<table width="640" style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
  <tr><td style="background:${report.shouldBlockSend ? "#dc2626" : report.brokenCount > 0 ? "#d97706" : "#059669"};padding:16px 24px;">
    <span style="font-size:18px;font-weight:700;color:#fff;">${statusIcon} Audit Link Newsletter — ${report.date}</span>
  </td></tr>
  <tr><td style="padding:20px 24px;">
    <p style="font-size:14px;color:#374151;margin:0 0 16px;"><strong>Canale:</strong> ${report.channel}</p>
    <p style="font-size:14px;color:${report.shouldBlockSend ? "#dc2626" : "#374151"};margin:0 0 20px;font-weight:${report.shouldBlockSend ? "700" : "400"};">${statusText}</p>
    
    <!-- Riepilogo -->
    <table width="100%" style="border-collapse:collapse;margin-bottom:20px;">
      <tr>
        <td style="padding:10px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:4px;text-align:center;">
          <div style="font-size:24px;font-weight:900;color:#059669;">${report.okCount}</div>
          <div style="font-size:11px;color:#6b7280;text-transform:uppercase;">OK</div>
        </td>
        <td width="8"></td>
        <td style="padding:10px;background:${report.brokenCount > 0 ? "#fef2f2" : "#f9fafb"};border:1px solid ${report.brokenCount > 0 ? "#fecaca" : "#e5e7eb"};border-radius:4px;text-align:center;">
          <div style="font-size:24px;font-weight:900;color:${report.brokenCount > 0 ? "#dc2626" : "#9ca3af"};">${report.brokenCount}</div>
          <div style="font-size:11px;color:#6b7280;text-transform:uppercase;">Broken</div>
        </td>
        <td width="8"></td>
        <td style="padding:10px;background:#fffbeb;border:1px solid #fde68a;border-radius:4px;text-align:center;">
          <div style="font-size:24px;font-weight:900;color:#d97706;">${report.timeoutCount}</div>
          <div style="font-size:11px;color:#6b7280;text-transform:uppercase;">Timeout</div>
        </td>
        <td width="8"></td>
        <td style="padding:10px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:4px;text-align:center;">
          <div style="font-size:24px;font-weight:900;color:#9ca3af;">${report.totalLinks}</div>
          <div style="font-size:11px;color:#6b7280;text-transform:uppercase;">Totale</div>
        </td>
      </tr>
    </table>

    ${report.internalBroken.length > 0 ? `
    <!-- Link interni rotti -->
    <h3 style="font-size:14px;font-weight:700;color:#dc2626;margin:0 0 8px;">🚨 Link interni rotti (proofpress.ai) — INVIO BLOCCATO</h3>
    <table width="100%" style="border-collapse:collapse;margin-bottom:20px;border:1px solid #fecaca;border-radius:4px;overflow:hidden;">
      <tr style="background:#fef2f2;">
        <th style="padding:8px 10px;font-size:11px;text-align:left;color:#dc2626;">URL</th>
        <th style="padding:8px 10px;font-size:11px;text-align:center;color:#dc2626;">HTTP</th>
      </tr>
      ${brokenRowsHtml(report.internalBroken)}
    </table>` : ""}

    ${report.externalBroken.length > 0 ? `
    <!-- Link esterni non raggiungibili -->
    <h3 style="font-size:14px;font-weight:700;color:#d97706;margin:0 0 8px;">⚠️ Link esterni non raggiungibili</h3>
    <table width="100%" style="border-collapse:collapse;margin-bottom:20px;border:1px solid #fde68a;border-radius:4px;overflow:hidden;">
      <tr style="background:#fffbeb;">
        <th style="padding:8px 10px;font-size:11px;text-align:left;color:#d97706;">URL</th>
        <th style="padding:8px 10px;font-size:11px;text-align:center;color:#d97706;">HTTP</th>
      </tr>
      ${brokenRowsHtml(report.externalBroken)}
    </table>` : ""}

    ${report.okCount > 0 ? `
    <!-- Link OK (prime 20) -->
    <h3 style="font-size:14px;font-weight:700;color:#059669;margin:0 0 8px;">✅ Link verificati (prime ${Math.min(report.okCount, 20)} su ${report.okCount})</h3>
    <table width="100%" style="border-collapse:collapse;margin-bottom:20px;border:1px solid #bbf7d0;border-radius:4px;overflow:hidden;">
      <tr style="background:#f0fdf4;">
        <th style="padding:8px 10px;font-size:11px;text-align:left;color:#059669;">URL</th>
        <th style="padding:8px 10px;font-size:11px;text-align:center;color:#059669;">HTTP</th>
      </tr>
      ${allOkRowsHtml}
    </table>` : ""}

    <p style="font-size:11px;color:#9ca3af;margin:16px 0 0;">
      Audit eseguito automaticamente alle 06:45 CET da Proof Press Newsletter System.<br>
      ${report.shouldBlockSend ? "⚠️ L'invio massivo delle 07:30 è stato BLOCCATO. Correggi i link e forza l'invio dalla dashboard admin." : "✅ L'invio massivo delle 07:30 procederà normalmente."}
    </p>
  </td></tr>
</table>
</body>
</html>`;

  const subject = `${report.shouldBlockSend ? "🚨 BLOCCATO" : report.brokenCount > 0 ? "⚠️ Avviso" : "✅ OK"} — Audit link newsletter ${report.channel} — ${report.date}`;

  try {
    await sendEmail({ to: AUDIT_EMAIL, subject, html });
    console.log(`[LinkAudit] 📧 Report audit inviato a ${AUDIT_EMAIL}`);
  } catch (err) {
    console.error("[LinkAudit] ❌ Errore invio report audit:", err);
  }
}

// ─── Variabile di stato per blocco invio ─────────────────────────────────────

let _auditBlockedToday = false;
let _auditBlockedDayKey = "";

function getDayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function isNewsletterBlockedByAudit(): boolean {
  const today = getDayKey();
  if (_auditBlockedDayKey !== today) {
    // Nuovo giorno — reset blocco
    _auditBlockedToday = false;
    _auditBlockedDayKey = today;
  }
  return _auditBlockedToday;
}

export function setNewsletterBlockedByAudit(blocked: boolean): void {
  _auditBlockedToday = blocked;
  _auditBlockedDayKey = getDayKey();
}
