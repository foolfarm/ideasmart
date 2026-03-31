/**
 * siteHealthCheck.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Demone di health check orario per verificare che il sito in produzione
 * sia online e i contenuti siano visibili.
 *
 * Verifica:
 *  1. Homepage raggiungibile (HTTP 200)
 *  2. API tRPC rispondono (getHomeData, getBreakingNews, getResearchReports)
 *  3. Contenuti presenti (notizie AI, Startup, DEALROOM, ricerche)
 *  4. Pagine principali raggiungibili (/ai, /startup, /dealroom, /ricerche, /chi-siamo)
 *
 * Se rileva problemi, invia una notifica email al proprietario.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { sendEmail } from "./email";

const PROD_URL = "https://ideasmart.ai";
const ALERT_EMAIL = "info@andreacinelli.com";
const FETCH_TIMEOUT = 15_000;

// ── Tipi ─────────────────────────────────────────────────────────────────────

interface CheckResult {
  name: string;
  ok: boolean;
  status?: number;
  detail?: string;
  responseTimeMs?: number;
}

interface HealthReport {
  timestamp: string;
  allOk: boolean;
  checks: CheckResult[];
  totalTimeMs: number;
}

// ── Helper fetch con timeout ─────────────────────────────────────────────────

async function fetchWithTimeout(url: string, timeoutMs = FETCH_TIMEOUT): Promise<Response> {
  return fetch(url, {
    method: "GET",
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      "User-Agent": "IDEASMART-HealthCheck/1.0",
      "Accept": "text/html,application/json,*/*",
    },
  });
}

// ── Check 1: Homepage raggiungibile ──────────────────────────────────────────

async function checkHomepage(): Promise<CheckResult> {
  const start = Date.now();
  try {
    const res = await fetchWithTimeout(PROD_URL);
    const body = await res.text();
    const hasContent = body.length > 5000; // Una homepage vuota è molto corta
    const hasIdeasmart = body.includes("IDEASMART");
    
    if (res.status !== 200) {
      return { name: "Homepage HTTP", ok: false, status: res.status, detail: `HTTP ${res.status}`, responseTimeMs: Date.now() - start };
    }
    if (!hasContent) {
      return { name: "Homepage contenuto", ok: false, status: 200, detail: `Pagina troppo corta (${body.length} bytes) — possibile pagina vuota`, responseTimeMs: Date.now() - start };
    }
    if (!hasIdeasmart) {
      return { name: "Homepage contenuto", ok: false, status: 200, detail: "Testo 'IDEASMART' non trovato nella pagina", responseTimeMs: Date.now() - start };
    }
    return { name: "Homepage HTTP", ok: true, status: 200, detail: `OK (${body.length} bytes)`, responseTimeMs: Date.now() - start };
  } catch (err) {
    return { name: "Homepage HTTP", ok: false, detail: `Errore: ${err instanceof Error ? err.message : String(err)}`, responseTimeMs: Date.now() - start };
  }
}

// ── Check 2: API tRPC — getHomeData ──────────────────────────────────────────

async function checkHomeDataAPI(): Promise<CheckResult> {
  const start = Date.now();
  const url = `${PROD_URL}/api/trpc/news.getHomeData`;
  try {
    const res = await fetchWithTimeout(url);
    const data = await res.json();
    
    if (res.status !== 200) {
      return { name: "API getHomeData", ok: false, status: res.status, detail: `HTTP ${res.status}`, responseTimeMs: Date.now() - start };
    }

    // Verifica che ci siano dati nelle sezioni principali
    const result = data?.result?.data?.json;
    if (!result) {
      return { name: "API getHomeData", ok: false, status: 200, detail: "Risposta API vuota o malformata", responseTimeMs: Date.now() - start };
    }

    const sections = [];
    if (result.ai && Array.isArray(result.ai)) sections.push({ name: "AI", count: result.ai.length });
    if (result.startup && Array.isArray(result.startup)) sections.push({ name: "Startup", count: result.startup.length });
    if (result.dealroom && Array.isArray(result.dealroom)) sections.push({ name: "Dealroom", count: result.dealroom.length });

    const emptySections = sections.filter(s => s.count === 0);
    if (emptySections.length > 0) {
      return { 
        name: "API getHomeData", 
        ok: false, 
        status: 200, 
        detail: `Sezioni vuote: ${emptySections.map(s => s.name).join(", ")}. Totali: ${sections.map(s => `${s.name}=${s.count}`).join(", ")}`,
        responseTimeMs: Date.now() - start 
      };
    }

    return { 
      name: "API getHomeData", 
      ok: true, 
      status: 200, 
      detail: `OK — ${sections.map(s => `${s.name}=${s.count}`).join(", ")}`,
      responseTimeMs: Date.now() - start 
    };
  } catch (err) {
    return { name: "API getHomeData", ok: false, detail: `Errore: ${err instanceof Error ? err.message : String(err)}`, responseTimeMs: Date.now() - start };
  }
}

// ── Check 3: API tRPC — Breaking News ────────────────────────────────────────

async function checkBreakingNewsAPI(): Promise<CheckResult> {
  const start = Date.now();
  const url = `${PROD_URL}/api/trpc/news.getBreakingNews`;
  try {
    const res = await fetchWithTimeout(url);
    if (res.status !== 200) {
      return { name: "API Breaking News", ok: false, status: res.status, detail: `HTTP ${res.status}`, responseTimeMs: Date.now() - start };
    }
    const data = await res.json();
    return { name: "API Breaking News", ok: true, status: 200, detail: "OK", responseTimeMs: Date.now() - start };
  } catch (err) {
    return { name: "API Breaking News", ok: false, detail: `Errore: ${err instanceof Error ? err.message : String(err)}`, responseTimeMs: Date.now() - start };
  }
}

// ── Check 4: API tRPC — Ricerche ─────────────────────────────────────────────

async function checkResearchAPI(): Promise<CheckResult> {
  const start = Date.now();
  const url = `${PROD_URL}/api/trpc/news.getResearchReports?input=${encodeURIComponent(JSON.stringify({ json: { limit: 5 } }))}`;
  try {
    const res = await fetchWithTimeout(url);
    if (res.status !== 200) {
      return { name: "API Ricerche", ok: false, status: res.status, detail: `HTTP ${res.status}`, responseTimeMs: Date.now() - start };
    }
    const data = await res.json();
    const reports = data?.result?.data?.json;
    const count = Array.isArray(reports) ? reports.length : 0;
    if (count === 0) {
      return { name: "API Ricerche", ok: false, status: 200, detail: "Nessuna ricerca trovata", responseTimeMs: Date.now() - start };
    }
    return { name: "API Ricerche", ok: true, status: 200, detail: `OK — ${count} ricerche`, responseTimeMs: Date.now() - start };
  } catch (err) {
    return { name: "API Ricerche", ok: false, detail: `Errore: ${err instanceof Error ? err.message : String(err)}`, responseTimeMs: Date.now() - start };
  }
}

// ── Check 5: Pagine principali raggiungibili ─────────────────────────────────

async function checkPages(): Promise<CheckResult[]> {
  const pages = [
    { path: "/ai", name: "Pagina AI News" },
    { path: "/startup", name: "Pagina Startup News" },
    { path: "/dealroom", name: "Pagina DEALROOM" },
    { path: "/ricerche", name: "Pagina Ricerche" },
    { path: "/chi-siamo", name: "Pagina Chi Siamo" },
  ];

  const results: CheckResult[] = [];
  for (const page of pages) {
    const start = Date.now();
    try {
      const res = await fetchWithTimeout(`${PROD_URL}${page.path}`);
      results.push({
        name: page.name,
        ok: res.status === 200,
        status: res.status,
        detail: res.status === 200 ? "OK" : `HTTP ${res.status}`,
        responseTimeMs: Date.now() - start,
      });
    } catch (err) {
      results.push({
        name: page.name,
        ok: false,
        detail: `Errore: ${err instanceof Error ? err.message : String(err)}`,
        responseTimeMs: Date.now() - start,
      });
    }
  }
  return results;
}

// ── Generazione report HTML per email ────────────────────────────────────────

function buildAlertEmailHtml(report: HealthReport): string {
  const failedChecks = report.checks.filter(c => !c.ok);
  const passedChecks = report.checks.filter(c => c.ok);

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8f8f6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    
    <!-- Header -->
    <div style="background:#dc2626;padding:20px 28px;border-radius:8px 8px 0 0;">
      <h1 style="margin:0;font-size:18px;font-weight:900;color:#ffffff;letter-spacing:0.05em;">
        🚨 ALERT: Problemi rilevati su ideasmart.ai
      </h1>
      <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.8);">
        Health Check automatico · ${report.timestamp}
      </p>
    </div>

    <!-- Riepilogo -->
    <div style="background:#ffffff;padding:24px 28px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
      <p style="margin:0 0 16px;font-size:14px;color:#374151;">
        <strong>${failedChecks.length} check falliti</strong> su ${report.checks.length} totali · 
        Tempo totale: ${report.totalTimeMs}ms
      </p>

      <!-- Check falliti -->
      <h3 style="margin:0 0 10px;font-size:13px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:0.1em;">
        ❌ Check falliti (${failedChecks.length})
      </h3>
      <table width="100%" style="border-collapse:collapse;margin-bottom:20px;">
        <tr style="background:#fef2f2;">
          <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:700;color:#991b1b;border-bottom:1px solid #fecaca;">Check</th>
          <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:700;color:#991b1b;border-bottom:1px solid #fecaca;">Dettaglio</th>
          <th style="padding:8px 12px;text-align:right;font-size:11px;font-weight:700;color:#991b1b;border-bottom:1px solid #fecaca;">Tempo</th>
        </tr>
        ${failedChecks.map(c => `
        <tr>
          <td style="padding:8px 12px;font-size:12px;color:#991b1b;border-bottom:1px solid #fee2e2;font-weight:600;">${c.name}</td>
          <td style="padding:8px 12px;font-size:12px;color:#7f1d1d;border-bottom:1px solid #fee2e2;">${c.detail ?? "—"}</td>
          <td style="padding:8px 12px;font-size:12px;color:#991b1b;border-bottom:1px solid #fee2e2;text-align:right;">${c.responseTimeMs ?? "—"}ms</td>
        </tr>`).join("")}
      </table>

      ${passedChecks.length > 0 ? `
      <!-- Check OK -->
      <h3 style="margin:0 0 10px;font-size:13px;font-weight:700;color:#059669;text-transform:uppercase;letter-spacing:0.1em;">
        ✅ Check OK (${passedChecks.length})
      </h3>
      <table width="100%" style="border-collapse:collapse;">
        ${passedChecks.map(c => `
        <tr>
          <td style="padding:6px 12px;font-size:12px;color:#065f46;border-bottom:1px solid #d1fae5;">${c.name}</td>
          <td style="padding:6px 12px;font-size:12px;color:#047857;border-bottom:1px solid #d1fae5;">${c.detail ?? "OK"}</td>
          <td style="padding:6px 12px;font-size:12px;color:#065f46;border-bottom:1px solid #d1fae5;text-align:right;">${c.responseTimeMs ?? "—"}ms</td>
        </tr>`).join("")}
      </table>` : ""}
    </div>

    <!-- Footer -->
    <div style="background:#f3f4f6;padding:16px 28px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;border-top:none;">
      <p style="margin:0;font-size:11px;color:#6b7280;text-align:center;">
        Health Check automatico · Eseguito ogni ora · 
        <a href="https://www.ideasmart.ai" style="color:#059669;text-decoration:none;">ideasmart.ai</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

// ── Esecuzione completa del health check ─────────────────────────────────────

export async function runSiteHealthCheck(): Promise<HealthReport> {
  const startTotal = Date.now();
  const timestamp = new Date().toLocaleString("it-IT", { timeZone: "Europe/Rome" });

  console.log("[HealthCheck] 🏥 Avvio health check produzione...");

  // Esegui tutti i check
  const checks: CheckResult[] = [];

  // 1. Homepage
  checks.push(await checkHomepage());

  // 2. API getHomeData
  checks.push(await checkHomeDataAPI());

  // 3. API Breaking News
  checks.push(await checkBreakingNewsAPI());

  // 4. API Ricerche
  checks.push(await checkResearchAPI());

  // 5. Pagine principali
  const pageChecks = await checkPages();
  checks.push(...pageChecks);

  const totalTimeMs = Date.now() - startTotal;
  const allOk = checks.every(c => c.ok);

  const report: HealthReport = {
    timestamp,
    allOk,
    checks,
    totalTimeMs,
  };

  // Log riepilogo
  const failedCount = checks.filter(c => !c.ok).length;
  if (allOk) {
    console.log(`[HealthCheck] ✅ Tutti i ${checks.length} check OK (${totalTimeMs}ms)`);
  } else {
    console.warn(`[HealthCheck] ⚠️ ${failedCount}/${checks.length} check FALLITI (${totalTimeMs}ms)`);
    checks.filter(c => !c.ok).forEach(c => {
      console.warn(`[HealthCheck]   ❌ ${c.name}: ${c.detail}`);
    });
  }

  // Invia alert email SOLO se ci sono problemi
  if (!allOk) {
    try {
      const html = buildAlertEmailHtml(report);
      const result = await sendEmail({
        to: ALERT_EMAIL,
        subject: `🚨 IDEASMART Health Check FALLITO — ${failedCount} problemi rilevati`,
        html,
      });
      if (result.success) {
        console.log(`[HealthCheck] 📧 Alert inviato a ${ALERT_EMAIL}`);
      } else {
        console.error(`[HealthCheck] ❌ Errore invio alert: ${result.error}`);
      }
    } catch (err) {
      console.error("[HealthCheck] ❌ Errore invio email alert:", err);
    }
  }

  return report;
}
