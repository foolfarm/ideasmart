/**
 * morningHealthReport.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Cron mattutino alle 08:00 CET:
 * 1. Verifica quante notizie sono state pubblicate oggi per ogni sezione
 * 2. Controlla se i post LinkedIn del mattino sono stati pubblicati
 * 3. Invia un report email HTML a info@andreacinelli.com
 * 4. AUTO-REMEDIATION: se una sezione principale ha 0 notizie, forza refresh
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { getDb } from "./db";
import { newsItems, linkedinPosts, researchReports } from "../drizzle/schema";
import { eq, gte, and, count, desc } from "drizzle-orm";
import { sendEmail } from "./email";

// Sezioni principali che supportano auto-remediation via RSS
const REMEDIABLE_SECTIONS: Record<string, () => Promise<void>> = {};

async function loadRemediableSections() {
  try {
    const { refreshAINewsFromRSS, refreshStartupNewsFromRSS, refreshDealroomNewsFromRSS } = await import("./rssNewsScheduler");
    REMEDIABLE_SECTIONS['ai'] = refreshAINewsFromRSS;
    REMEDIABLE_SECTIONS['startup'] = refreshStartupNewsFromRSS;
    REMEDIABLE_SECTIONS['dealroom'] = refreshDealroomNewsFromRSS;
  } catch (err) {
    console.error("[MorningReport] ⚠️ Impossibile caricare funzioni remediation:", err);
  }
}

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

  // ── 3b. Conta ricerche Research generate oggi ─────────────────────────────
  let researchTodayCount = 0;
  let researchLastTitle: string | undefined;
  try {
    const researchCountResult = await db
      .select({ total: count() })
      .from(researchReports)
      .where(eq(researchReports.dateLabel, todayLabel));
    researchTodayCount = researchCountResult[0]?.total ?? 0;
    if (researchTodayCount > 0) {
      const lastResearch = await db
        .select({ title: researchReports.title })
        .from(researchReports)
        .where(eq(researchReports.dateLabel, todayLabel))
        .orderBy(desc(researchReports.createdAt))
        .limit(1);
      researchLastTitle = lastResearch[0]?.title;
    }
  } catch (err) {
    console.error("[MorningReport] Errore conteggio Research:", err);
  }

  // ── 4. Calcola statistiche riepilogative ───────────────────────────────────────
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
    overallOk,
    researchTodayCount,
    researchLastTitle
  });

  // ── 6. Invia email SOLO se ci sono problemi (sectionsKo > 0) ─────────────
  // Se tutto è OK, non inviare email per non intasare la casella di posta
  if (overallOk) {
    console.log(`[MorningReport] ✅ Tutto OK (${sectionsOk}/${SECTIONS.length} sezioni, ${totalNewsToday} notizie) — email soppressa (nessun problema rilevato)`);
    return;
  }

  const statusEmoji = "⚠️";
  const subject = `${statusEmoji} Proof Press Report ${todayLabel} — ${sectionsKo} sezioni con problemi su ${SECTIONS.length}`;

  try {
    const result = await sendEmail({
      to: REPORT_EMAIL,
      subject,
      html
    });

    if (result.success) {
      console.log(`[MorningReport] 📧 Report inviato (${sectionsKo} problemi) a ${REPORT_EMAIL}`);
    } else {
      console.error(`[MorningReport] ❌ Errore invio report: ${result.error}`);
    }
  } catch (err) {
    console.error("[MorningReport] ❌ Errore fatale invio report:", err);
  }

  // ── 7. AUTO-REMEDIATION: forza refresh sezioni principali con 0 notizie ──
  if (!overallOk) {
    console.log("[MorningReport] 🔧 Avvio auto-remediation per sezioni con problemi...");
    await loadRemediableSections();

    const failedSections = sectionStatuses.filter(s => !s.ok && s.count === 0);
    const remediationResults: { section: string; label: string; success: boolean; error?: string }[] = [];

    for (const failed of failedSections) {
      const refreshFn = REMEDIABLE_SECTIONS[failed.key];
      if (!refreshFn) {
        console.log(`[MorningReport] ℹ️ Sezione '${failed.key}' (${failed.label}) non ha un refresh automatico disponibile — skip`);
        continue;
      }
      console.log(`[MorningReport] 🔄 Auto-remediation: avvio refresh '${failed.key}' (${failed.label})...`);
      try {
        await refreshFn();
        remediationResults.push({ section: failed.key, label: failed.label, success: true });
        console.log(`[MorningReport] ✅ Auto-remediation '${failed.key}': refresh completato`);
      } catch (remErr) {
        const errMsg = remErr instanceof Error ? remErr.message : String(remErr);
        remediationResults.push({ section: failed.key, label: failed.label, success: false, error: errMsg });
        console.error(`[MorningReport] ❌ Auto-remediation '${failed.key}' fallita:`, remErr);
      }
      // Pausa tra un refresh e l'altro per non sovraccaricare le API
      await new Promise(r => setTimeout(r, 15_000));
    }

    // Invia email di follow-up con esito remediation
    if (remediationResults.length > 0) {
      const successCount = remediationResults.filter(r => r.success).length;
      const failCount = remediationResults.filter(r => !r.success).length;
      const remediationHtml = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0f1e;color:#e2e8f0;padding:24px;border-radius:12px;">
          <div style="text-align:center;margin-bottom:20px;">
            <span style="color:#00e5c8;font-size:11px;letter-spacing:2px;font-weight:700;">PROOF PRESS — AUTO-REMEDIATION</span>
            <h2 style="color:#fff;margin:8px 0;">🔧 Refresh Automatico Completato</h2>
            <p style="color:#94a3b8;font-size:13px;">${new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' })} CET</p>
          </div>
          <div style="background:#1e293b;border-radius:8px;padding:16px;margin-bottom:16px;">
            <p style="margin:0 0 8px;">Dopo il Morning Report delle 08:00, il sistema ha rilevato <strong>${failedSections.length} sezioni</strong> con 0 notizie e ha avviato il refresh automatico:</p>
            <table style="width:100%;border-collapse:collapse;margin-top:12px;">
              <tr style="border-bottom:1px solid #334155;">
                <th style="text-align:left;padding:8px;color:#94a3b8;font-size:12px;">SEZIONE</th>
                <th style="text-align:center;padding:8px;color:#94a3b8;font-size:12px;">ESITO</th>
              </tr>
              ${remediationResults.map(r => `
                <tr style="border-bottom:1px solid #1e293b;">
                  <td style="padding:8px;font-size:13px;">${r.label} <code style="color:#94a3b8;font-size:11px;">(${r.section})</code></td>
                  <td style="text-align:center;padding:8px;">
                    ${r.success
                      ? '<span style="color:#22c55e;font-weight:700;">✅ OK</span>'
                      : `<span style="color:#ef4444;font-weight:700;">❌ ERRORE</span><br><span style="color:#94a3b8;font-size:11px;">${r.error ?? ''}</span>`
                    }
                  </td>
                </tr>
              `).join('')}
            </table>
          </div>
          <div style="text-align:center;padding:12px;background:#${successCount === remediationResults.length ? '14532a' : '450a0a'};border-radius:8px;">
            <strong style="color:#${successCount === remediationResults.length ? '22c55e' : 'ef4444'};">
              ${successCount}/${remediationResults.length} refresh riusciti
            </strong>
            ${failCount > 0 ? '<p style="color:#fca5a5;font-size:12px;margin:4px 0 0;">Le sezioni fallite richiedono intervento manuale dalla dashboard Admin.</p>' : ''}
          </div>
        </div>
      `;
      try {
        await sendEmail({
          to: REPORT_EMAIL,
          subject: `🔧 Auto-Remediation ${successCount}/${remediationResults.length} OK — ${remediationResults.map(r => r.label).join(', ')}`,
          html: remediationHtml
        });
        console.log(`[MorningReport] ✅ Email remediation inviata: ${successCount}/${remediationResults.length} refresh riusciti`);
      } catch (emailErr) {
        console.error("[MorningReport] ❌ Errore invio email remediation:", emailErr);
      }
    }
  } else {
    console.log("[MorningReport] ✅ Tutte le sezioni OK — nessuna remediation necessaria");
  }

  // ── 8. AUTO-REMEDIATION EDITORIALE: rigenera con LLM se manca l'editoriale del giorno ──
  await remediateEditorial(todayLabel);
  // ── 9. AUTO-REMEDIATION RESEARCH: rigenera con LLM se mancano le ricerche del giorno ──
  await remediateResearch();
}

async function remediateEditorial(todayLabel: string): Promise<void> {
  try {
    const { getTodayEditorial, saveEditorial, getTodayStartup, saveStartupOfDay } = await import("./db");
    const { generateDailyEditorial, generateStartupOfDay } = await import("./dailyContentScheduler");
    const { generateImage } = await import("./_core/imageGeneration");

    // Controlla editoriale AI
    const existingEditorial = await getTodayEditorial(todayLabel);
    if (!existingEditorial) {
      console.log("[MorningReport] 📝 Editoriale AI mancante — avvio rigenerazione LLM...");
      try {
        const editorial = await generateDailyEditorial();
        let imageUrl: string | undefined;
        try {
          const imgResult = await generateImage({ prompt: `Editorial illustration for: ${editorial.title}. Professional, modern, tech magazine style, dark background.` });
          imageUrl = imgResult.url;
        } catch { /* immagine opzionale */ }
        await saveEditorial({ ...editorial, imageUrl });
        console.log("[MorningReport] ✅ Editoriale AI rigenerato:", editorial.title);
        await sendEmail({
          to: REPORT_EMAIL,
          subject: `📝 Auto-Remediation Editoriale AI — Rigenerato con successo`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0f1e;color:#e2e8f0;padding:24px;border-radius:12px;"><h2 style="color:#00e5c8;">📝 Editoriale AI Rigenerato</h2><p><strong>Titolo:</strong> ${editorial.title}</p><p><strong>Sottotitolo:</strong> ${editorial.subtitle}</p><p style="color:#94a3b8;font-size:12px;">Rigenerato automaticamente alle ${new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' })} CET</p></div>`
        });
      } catch (err) {
        console.error("[MorningReport] ❌ Rigenerazione editoriale AI fallita:", err);
        await sendEmail({
          to: REPORT_EMAIL,
          subject: `❌ Auto-Remediation Editoriale AI FALLITA`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0f1e;color:#e2e8f0;padding:24px;border-radius:12px;"><h2 style="color:#ef4444;">❌ Rigenerazione Editoriale AI Fallita</h2><p>Errore: ${err instanceof Error ? err.message : String(err)}</p><p style="color:#94a3b8;font-size:12px;">Richiede intervento manuale dalla dashboard Admin.</p></div>`
        });
      }
    } else {
      console.log("[MorningReport] ✅ Editoriale AI già presente — nessuna rigenerazione necessaria");
    }

    // Controlla Startup del Giorno
    const existingStartup = await getTodayStartup(todayLabel);
    if (!existingStartup) {
      console.log("[MorningReport] 🚀 Startup del Giorno mancante — avvio rigenerazione LLM...");
      try {
        const startup = await generateStartupOfDay();
        let imageUrl: string | undefined;
        try {
          const imgResult = await generateImage({ prompt: `Startup company illustration for: ${startup.name}. Professional, modern, tech magazine style.` });
          imageUrl = imgResult.url;
        } catch { /* immagine opzionale */ }
        await saveStartupOfDay({ ...startup, imageUrl });
        console.log("[MorningReport] ✅ Startup del Giorno rigenerata:", startup.name);
        await sendEmail({
          to: REPORT_EMAIL,
          subject: `🚀 Auto-Remediation Startup del Giorno — Rigenerata con successo`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0f1e;color:#e2e8f0;padding:24px;border-radius:12px;"><h2 style="color:#00e5c8;">🚀 Startup del Giorno Rigenerata</h2><p><strong>Nome:</strong> ${startup.name}</p><p style="color:#94a3b8;font-size:12px;">Rigenerata automaticamente alle ${new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' })} CET</p></div>`
        });
      } catch (err) {
        console.error("[MorningReport] ❌ Rigenerazione Startup del Giorno fallita:", err);
      }
    } else {
      console.log("[MorningReport] ✅ Startup del Giorno già presente — nessuna rigenerazione necessaria");
    }
  } catch (err) {
    console.error("[MorningReport] ❌ Errore auto-remediation editoriale:", err);
  }
}

async function remediateResearch(): Promise<void> {
  try {
    const { getTodayResearch } = await import("./researchGenerator");
    const { generateDailyResearch } = await import("./researchGenerator");
    // Controlla quante ricerche ci sono oggi
    const existingResearch = await getTodayResearch();
    if (!existingResearch || existingResearch.length === 0) {
      console.log("[MorningReport] 🔍 Research mancante — avvio rigenerazione LLM...");
      try {
        const result = await generateDailyResearch();
        const generated = result?.generated ?? 0;
        console.log(`[MorningReport] ✅ Research rigenerata: ${generated} ricerche`);
        await sendEmail({
          to: REPORT_EMAIL,
          subject: `🔍 Auto-Remediation Research — ${generated} ricerche rigenerate`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0f1e;color:#e2e8f0;padding:24px;border-radius:12px;"><h2 style="color:#00e5c8;">🔍 Research Rigenerata</h2><p><strong>${generated} ricerche</strong> generate automaticamente per oggi.</p><p style="color:#94a3b8;font-size:12px;">Rigenerata automaticamente alle ${new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' })} CET</p></div>`
        });
      } catch (err) {
        console.error("[MorningReport] ❌ Rigenerazione Research fallita:", err);
        await sendEmail({
          to: REPORT_EMAIL,
          subject: `❌ Auto-Remediation Research FALLITA`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0f1e;color:#e2e8f0;padding:24px;border-radius:12px;"><h2 style="color:#ef4444;">❌ Rigenerazione Research Fallita</h2><p>Errore: ${err instanceof Error ? err.message : String(err)}</p><p style="color:#94a3b8;font-size:12px;">Richiede intervento manuale dalla dashboard Admin.</p></div>`
        });
      }
    } else {
      console.log(`[MorningReport] ✅ Research già presente (${existingResearch.length} ricerche) — nessuna rigenerazione necessaria`);
    }
  } catch (err) {
    console.error("[MorningReport] ❌ Errore auto-remediation research:", err);
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
  researchTodayCount: number;
  researchLastTitle?: string;
}): string {
  const { date, sectionStatuses, linkedInStatuses, sectionsOk, sectionsKo, totalNewsToday, linkedInPublished, overallOk, researchTodayCount, researchLastTitle } = data;

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
  <title>Proof Press Morning Report</title>
</head>
<body style="margin:0;padding:0;background:#0a0f1e;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f1e;min-height:100vh;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0d1528 0%,#0a0f1e 100%);border:1px solid rgba(0,200,150,0.2);border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:3px;color:#00c896;text-transform:uppercase;font-weight:600;">Proof Press — AI FOR BUSINESS</p>
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

          <!-- Research Table -->
          <tr>
            <td style="background:#0d1528;border-left:1px solid rgba(0,200,150,0.2);border-right:1px solid rgba(0,200,150,0.2);padding:0 32px 24px;">
              <h2 style="margin:0 0 12px;font-size:13px;font-weight:700;color:#ffffff;letter-spacing:2px;text-transform:uppercase;padding-top:20px;border-top:1px solid rgba(255,255,255,0.08);">🔍 Proof Press Research</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
                <tbody>
                  <tr style="background:${researchTodayCount > 0 ? 'transparent' : 'rgba(255,85,0,0.08)'};border-bottom:1px solid rgba(255,255,255,0.05);">
                    <td style="padding:10px 12px;font-size:13px;color:#c8d0dc;">🔍 Ricerche del giorno${researchLastTitle ? `<span style="color:#8892a4;font-size:11px;display:block;margin-top:2px;">${escapeHtml(researchLastTitle.substring(0, 60))}${researchLastTitle.length > 60 ? '…' : ''}</span>` : `<span style="color:#ff5500;font-size:11px;display:block;margin-top:2px;">Nessuna ricerca oggi</span>`}</td>
                    <td style="padding:10px 12px;text-align:center;font-size:15px;font-weight:700;color:${researchTodayCount > 0 ? '#00c896' : '#ff5500'}">${researchTodayCount}</td>
                    <td style="padding:10px 12px;text-align:center;font-size:12px;color:#8892a4;">min 5</td>
                    <td style="padding:10px 12px;text-align:center;font-size:16px;">${researchTodayCount >= 5 ? '✅' : '⚠️'}</td>
                  </tr>
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
                <a href="https://www.ideasmart.biz/admin/system-health" style="display:inline-block;background:#00c896;color:#0a0f1e;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:1px;padding:12px 28px;border-radius:6px;text-transform:uppercase;">
                  Apri Pannello Salute Sistema →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#060b18;border:1px solid rgba(0,200,150,0.1);border-top:none;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#4a5568;">
                Report automatico generato da <strong style="color:#00c896;">Proof Press</strong> · La Prima Testata Giornalistica Humanless Italiana<br>
                Inviato ogni mattina alle 08:00 CET · <a href="https://www.ideasmart.biz" style="color:#00c896;text-decoration:none;">www.ideasmart.biz</a>
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
