/**
 * morningHealthReport.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Cron mattutino alle 08:00 CET:
 * 1. Verifica quante notizie sono state pubblicate oggi per ogni sezione
 * 2. Controlla se i post LinkedIn del mattino sono stati pubblicati
 * 3. Invia un report email HTML a info@andreacinelli.com
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { getDb } from "./db";
import { newsItems, linkedinPosts } from "../drizzle/schema";
import { eq, gte, and, count, desc } from "drizzle-orm";
import { sendEmail } from "./email";

const REPORT_EMAIL = "info@andreacinelli.com";

// Mappa sezione → nome leggibile + emoji
const SECTIONS: { key: string; label: string; emoji: string; expectedMin: number }[] = [
  { key: "news",          label: "News Italia",       emoji: "🇮🇹", expectedMin: 5 },
  { key: "ai",            label: "AI News",           emoji: "🤖", expectedMin: 5 },
  { key: "startup",       label: "Startup News",      emoji: "🚀", expectedMin: 5 },
  { key: "finance",       label: "Finance & Markets", emoji: "📈", expectedMin: 5 },
  { key: "sport",         label: "Sport & Business",  emoji: "⚽", expectedMin: 5 },
  { key: "music",         label: "ITsMusic",          emoji: "🎵", expectedMin: 3 },
  { key: "luxury",        label: "Lifestyle & Luxury",emoji: "💎", expectedMin: 3 },
  { key: "health",        label: "Health & Biotech",  emoji: "🏥", expectedMin: 3 },
  { key: "motori",        label: "Motori",            emoji: "🏎️", expectedMin: 3 },
  { key: "tennis",        label: "Tennis",            emoji: "🎾", expectedMin: 3 },
  { key: "basket",        label: "Basket",            emoji: "🏀", expectedMin: 3 },
  { key: "gossip",        label: "Business Gossip",   emoji: "💬", expectedMin: 3 },
  { key: "cybersecurity", label: "Cybersecurity",     emoji: "🔐", expectedMin: 3 },
  { key: "sondaggi",      label: "Sondaggi",          emoji: "📊", expectedMin: 2 }
];

interface SectionStatus {
  key: string;
  label: string;
  emoji: string;
  count: number;
  expectedMin: number;
  ok: boolean;
  lastTitle?: string;
}

interface LinkedInStatus {
  slot: string;
  label: string;
  published: boolean;
  title?: string;
}

export async function runMorningHealthReport(): Promise<void> {
  console.log("[MorningReport] 📊 Avvio report salute sistema mattutino...");

  const db = await getDb();
  if (!db) {
    console.error("[MorningReport] DB non disponibile, report saltato");
    return;
  }

  // ── 1. Calcola inizio giornata odierna (mezzanotte UTC) ─────────────────
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayStartDate = todayStart;

  // ── 2. Conta notizie per sezione pubblicate oggi ─────────────────────────
  const sectionStatuses: SectionStatus[] = [];

  for (const section of SECTIONS) {
    try {
      // Conta notizie create oggi
      const countResult = await db
        .select({ total: count() })
        .from(newsItems)
        .where(
          and(
            eq(newsItems.section, section.key as any),
            gte(newsItems.createdAt, todayStartDate)
          )
        );

      const todayCount = countResult[0]?.total ?? 0;

      // Prendi il titolo dell'ultima notizia inserita oggi
      let lastTitle: string | undefined;
      if (todayCount > 0) {
        const lastItem = await db
          .select({ title: newsItems.title })
          .from(newsItems)
          .where(
            and(
              eq(newsItems.section, section.key as any),
              gte(newsItems.createdAt, todayStartDate)
            )
          )
          .orderBy(desc(newsItems.createdAt))
          .limit(1);
        lastTitle = lastItem[0]?.title;
      }

      sectionStatuses.push({
        key: section.key,
        label: section.label,
        emoji: section.emoji,
        count: todayCount,
        expectedMin: section.expectedMin,
        ok: todayCount >= section.expectedMin,
        lastTitle
      });
    } catch (err) {
      console.error(`[MorningReport] Errore sezione ${section.key}:`, err);
      sectionStatuses.push({
        key: section.key,
        label: section.label,
        emoji: section.emoji,
        count: 0,
        expectedMin: section.expectedMin,
        ok: false
      });
    }
  }

  // ── 3. Verifica post LinkedIn pubblicati oggi ────────────────────────────
  const todayLabel = now.toISOString().split("T")[0]; // "2026-03-21"

  const linkedInStatuses: LinkedInStatus[] = [];
  const slots = [
    { slot: "morning",   label: "Mattino (10:30)" },
    { slot: "afternoon", label: "Pomeriggio (15:00)" },
    { slot: "evening",   label: "Sera (17:30)" }
  ];

  for (const { slot, label } of slots) {
    try {
      const posts = await db
        .select({ title: linkedinPosts.postText })
        .from(linkedinPosts)
        .where(
          and(
            eq(linkedinPosts.dateLabel, todayLabel),
            eq(linkedinPosts.slot, slot as any)
          )
        )
        .limit(1);

      const published = posts.length > 0;
      const title = posts[0]?.title
        ? posts[0].title.substring(0, 80) + (posts[0].title.length > 80 ? "..." : "")
        : undefined;

      linkedInStatuses.push({ slot, label, published, title });
    } catch (err) {
      linkedInStatuses.push({ slot, label, published: false });
    }
  }

  // ── 4. Calcola statistiche riepilogative ─────────────────────────────────
  const sectionsOk = sectionStatuses.filter(s => s.ok).length;
  const sectionsKo = sectionStatuses.filter(s => !s.ok).length;
  const totalNewsToday = sectionStatuses.reduce((sum, s) => sum + s.count, 0);
  const linkedInPublished = linkedInStatuses.filter(l => l.published).length;
  const overallOk = sectionsKo === 0;

  // ── 5. Componi email HTML ─────────────────────────────────────────────────
  const html = buildReportHtml({
    date: now,
    sectionStatuses,
    linkedInStatuses,
    sectionsOk,
    sectionsKo,
    totalNewsToday,
    linkedInPublished,
    overallOk
  });

  // ── 6. Invia email ────────────────────────────────────────────────────────
  const statusEmoji = overallOk ? "✅" : "⚠️";
  const subject = `${statusEmoji} IdeaSmart Report ${todayLabel} — ${sectionsOk}/${SECTIONS.length} sezioni OK, ${totalNewsToday} notizie, ${linkedInPublished}/3 LinkedIn`;

  try {
    const result = await sendEmail({
      to: REPORT_EMAIL,
      subject,
      html
    });

    if (result.success) {
      console.log(`[MorningReport] ✅ Report inviato a ${REPORT_EMAIL} — ${sectionsOk}/${SECTIONS.length} sezioni OK, ${totalNewsToday} notizie oggi`);
    } else {
      console.error(`[MorningReport] ❌ Errore invio report: ${result.error}`);
    }
  } catch (err) {
    console.error("[MorningReport] ❌ Errore fatale invio report:", err);
  }
}

// ─── Composizione HTML email ─────────────────────────────────────────────────

function buildReportHtml(data: {
  date: Date;
  sectionStatuses: SectionStatus[];
  linkedInStatuses: LinkedInStatus[];
  sectionsOk: number;
  sectionsKo: number;
  totalNewsToday: number;
  linkedInPublished: number;
  overallOk: boolean;
}): string {
  const { date, sectionStatuses, linkedInStatuses, sectionsOk, sectionsKo, totalNewsToday, linkedInPublished, overallOk } = data;

  const dateStr = date.toLocaleDateString("it-IT", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    timeZone: "Europe/Rome"
  });
  const timeStr = date.toLocaleTimeString("it-IT", {
    hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome"
  });

  const statusColor = overallOk ? "#00c896" : "#ff5500";
  const statusText = overallOk ? "TUTTO OK" : `${sectionsKo} SEZIONI DA VERIFICARE`;

  // Righe tabella sezioni
  const sectionRows = sectionStatuses.map(s => {
    const bg = s.ok ? "transparent" : "rgba(255,85,0,0.08)";
    const indicator = s.ok ? "✅" : "⚠️";
    const countColor = s.ok ? "#00c896" : "#ff5500";
    const titlePreview = s.lastTitle
      ? `<span style="color:#8892a4;font-size:11px;display:block;margin-top:2px;">${escapeHtml(s.lastTitle.substring(0, 60))}${s.lastTitle.length > 60 ? "…" : ""}</span>`
      : `<span style="color:#ff5500;font-size:11px;display:block;margin-top:2px;">Nessuna notizia oggi</span>`;

    return `
      <tr style="background:${bg};border-bottom:1px solid rgba(255,255,255,0.05);">
        <td style="padding:10px 12px;font-size:13px;color:#c8d0dc;">${s.emoji} ${s.label}${titlePreview}</td>
        <td style="padding:10px 12px;text-align:center;font-size:15px;font-weight:700;color:${countColor};">${s.count}</td>
        <td style="padding:10px 12px;text-align:center;font-size:12px;color:#8892a4;">min ${s.expectedMin}</td>
        <td style="padding:10px 12px;text-align:center;font-size:16px;">${indicator}</td>
      </tr>`;
  }).join("");

  // Righe LinkedIn
  const linkedInRows = linkedInStatuses.map(l => {
    const indicator = l.published ? "✅ Pubblicato" : "❌ Non pubblicato";
    const indicatorColor = l.published ? "#00c896" : "#ff5500";
    const titlePreview = l.title
      ? `<span style="color:#8892a4;font-size:11px;display:block;margin-top:2px;">${escapeHtml(l.title)}</span>`
      : "";

    return `
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
        <td style="padding:10px 12px;font-size:13px;color:#c8d0dc;">💼 ${l.label}${titlePreview}</td>
        <td style="padding:10px 12px;text-align:right;font-size:13px;font-weight:600;color:${indicatorColor};">${indicator}</td>
      </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IdeaSmart Morning Report</title>
</head>
<body style="margin:0;padding:0;background:#0a0f1e;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f1e;min-height:100vh;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0d1528 0%,#0a0f1e 100%);border:1px solid rgba(0,200,150,0.2);border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:3px;color:#00c896;text-transform:uppercase;font-weight:600;">IDEASMART — AI FOR BUSINESS</p>
              <h1 style="margin:8px 0 4px;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Morning Report</h1>
              <p style="margin:0;font-size:13px;color:#8892a4;">${dateStr} · ore ${timeStr}</p>
              <div style="margin-top:16px;display:inline-block;background:${statusColor}22;border:1px solid ${statusColor}44;border-radius:20px;padding:6px 18px;">
                <span style="font-size:13px;font-weight:700;color:${statusColor};letter-spacing:1px;">${statusText}</span>
              </div>
            </td>
          </tr>

          <!-- KPI Bar -->
          <tr>
            <td style="background:#0d1528;border-left:1px solid rgba(0,200,150,0.2);border-right:1px solid rgba(0,200,150,0.2);padding:20px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align:center;padding:0 8px;">
                    <div style="font-size:32px;font-weight:800;color:#00c896;">${totalNewsToday}</div>
                    <div style="font-size:11px;color:#8892a4;text-transform:uppercase;letter-spacing:1px;margin-top:2px;">Notizie oggi</div>
                  </td>
                  <td style="text-align:center;padding:0 8px;border-left:1px solid rgba(255,255,255,0.08);border-right:1px solid rgba(255,255,255,0.08);">
                    <div style="font-size:32px;font-weight:800;color:${overallOk ? '#00c896' : '#ff5500'};">${sectionsOk}/${sectionStatuses.length}</div>
                    <div style="font-size:11px;color:#8892a4;text-transform:uppercase;letter-spacing:1px;margin-top:2px;">Sezioni OK</div>
                  </td>
                  <td style="text-align:center;padding:0 8px;">
                    <div style="font-size:32px;font-weight:800;color:${linkedInPublished === 3 ? '#00c896' : linkedInPublished > 0 ? '#ffaa00' : '#ff5500'};">${linkedInPublished}/3</div>
                    <div style="font-size:11px;color:#8892a4;text-transform:uppercase;letter-spacing:1px;margin-top:2px;">LinkedIn post</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Sezioni Table -->
          <tr>
            <td style="background:#0d1528;border-left:1px solid rgba(0,200,150,0.2);border-right:1px solid rgba(0,200,150,0.2);padding:0 32px 24px;">
              <h2 style="margin:0 0 12px;font-size:13px;font-weight:700;color:#ffffff;letter-spacing:2px;text-transform:uppercase;padding-top:20px;border-top:1px solid rgba(255,255,255,0.08);">Stato Sezioni</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
                <thead>
                  <tr style="background:rgba(255,255,255,0.05);">
                    <th style="padding:8px 12px;text-align:left;font-size:11px;color:#8892a4;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Sezione</th>
                    <th style="padding:8px 12px;text-align:center;font-size:11px;color:#8892a4;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Oggi</th>
                    <th style="padding:8px 12px;text-align:center;font-size:11px;color:#8892a4;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Target</th>
                    <th style="padding:8px 12px;text-align:center;font-size:11px;color:#8892a4;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${sectionRows}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- LinkedIn Table -->
          <tr>
            <td style="background:#0d1528;border-left:1px solid rgba(0,200,150,0.2);border-right:1px solid rgba(0,200,150,0.2);padding:0 32px 24px;">
              <h2 style="margin:0 0 12px;font-size:13px;font-weight:700;color:#ffffff;letter-spacing:2px;text-transform:uppercase;padding-top:20px;border-top:1px solid rgba(255,255,255,0.08);">Post LinkedIn</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
                <tbody>
                  ${linkedInRows}
                </tbody>
              </table>
              <p style="margin:12px 0 0;font-size:11px;color:#8892a4;">
                ℹ️ I post pomeridiano (15:00) e serale (17:30) potrebbero non essere ancora stati pubblicati al momento di questo report.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="background:#0d1528;border-left:1px solid rgba(0,200,150,0.2);border-right:1px solid rgba(0,200,150,0.2);padding:0 32px 28px;">
              <div style="padding-top:20px;border-top:1px solid rgba(255,255,255,0.08);text-align:center;">
                <a href="https://www.ideasmart.ai/admin/system-health" style="display:inline-block;background:#00c896;color:#0a0f1e;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:1px;padding:12px 28px;border-radius:6px;text-transform:uppercase;">
                  Apri Pannello Salute Sistema →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#060b18;border:1px solid rgba(0,200,150,0.1);border-top:none;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#4a5568;">
                Report automatico generato da <strong style="color:#00c896;">IdeaSmart</strong> · La Prima Testata Giornalistica Humanless Italiana<br>
                Inviato ogni mattina alle 08:00 CET · <a href="https://www.ideasmart.ai" style="color:#00c896;text-decoration:none;">www.ideasmart.ai</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
