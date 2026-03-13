/**
 * Script per inviare la newsletter di prova a un indirizzo specifico.
 * Bypassa l'autenticazione OAuth per uso in sviluppo.
 * Uso: node scripts/send-test-newsletter.mjs ac@acinelli.com
 */

import { config } from "dotenv";
config();

const TO_EMAIL = process.argv[2] || "ac@acinelli.com";
const DB_URL = process.env.DATABASE_URL;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "info@foolfarm.com";
const FROM_NAME = process.env.SENDGRID_FROM_NAME || "AI4Business News — IDEASMART";

if (!DB_URL) { console.error("DATABASE_URL non impostato"); process.exit(1); }
if (!SENDGRID_API_KEY) { console.error("SENDGRID_API_KEY non impostato"); process.exit(1); }

// ── Connessione DB ──────────────────────────────────────────────────────────
import mysql from "mysql2/promise";

const conn = await mysql.createConnection(DB_URL);

console.log("✓ Connesso al database");

// ── Recupera dati ───────────────────────────────────────────────────────────
const [newsRows] = await conn.execute(
  "SELECT title, summary, category, sourceName, sourceUrl FROM news_items ORDER BY createdAt DESC, position ASC LIMIT 25"
);

const [editorialRows] = await conn.execute(
  "SELECT title, subtitle, body, keyTrend, authorNote FROM daily_editorial ORDER BY createdAt DESC LIMIT 1"
);

const [startupRows] = await conn.execute(
  "SELECT name, tagline, description, category, funding, whyToday, websiteUrl, aiScore FROM startup_of_day ORDER BY createdAt DESC LIMIT 1"
);

// Recupera i reportage della settimana più recente
const [latestRepRow] = await conn.execute(
  "SELECT weekLabel FROM weekly_reportage ORDER BY createdAt DESC LIMIT 1"
);
let reportageRows = [];
if (latestRepRow.length > 0) {
  [reportageRows] = await conn.execute(
    "SELECT startupName, category, headline, subheadline, bodyText, quote, stat1Value, stat1Label, stat2Value, stat2Label, stat3Value, stat3Label, websiteUrl, ctaLabel, ctaUrl FROM weekly_reportage WHERE weekLabel = ? ORDER BY position",
    [latestRepRow[0].weekLabel]
  );
}

// Recupera le analisi di mercato più recenti
const [latestAnalRow] = await conn.execute(
  "SELECT weekLabel FROM market_analysis ORDER BY createdAt DESC LIMIT 1"
);
let analysesRows = [];
if (latestAnalRow.length > 0) {
  [analysesRows] = await conn.execute(
    "SELECT title, category, summary, source, dataPoint1, dataPoint2, dataPoint3, keyInsight, italyRelevance FROM market_analysis WHERE weekLabel = ? ORDER BY position",
    [latestAnalRow[0].weekLabel]
  );
}

// Recupera il token dell'iscritto destinatario (se esiste)
const [recipientRows] = await conn.execute(
  'SELECT unsubscribeToken FROM subscribers WHERE email = ? LIMIT 1',
  [TO_EMAIL]
);
const recipientToken = recipientRows[0]?.unsubscribeToken;

await conn.end();

console.log(`✓ Dati recuperati: ${newsRows.length} news, ${reportageRows.length} reportage, ${analysesRows.length} analisi`);
if (editorialRows.length > 0) console.log(`  Editoriale: "${editorialRows[0].title}"`);
if (startupRows.length > 0) console.log(`  Startup del giorno: "${startupRows[0].name}"`);

// ── Costruisce HTML ─────────────────────────────────────────────────────────
const today = new Date();
const dateLabel = today.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });

const TEAL = "#00b4a0";
const NAVY = "#0a0f1e";
const ORANGE = "#e84f00";
const BLUE = "#1a56db";

const catColors = {
  "Modelli Generativi": TEAL, "AI Generativa": TEAL, "AI Agentiva": TEAL,
  "Robot & AI Fisica": TEAL, "AI & Startup Italiane": TEAL,
  "AI & Hardware": BLUE, "Big Tech": BLUE, "Internazionalizzazione": BLUE,
  "AI & Difesa": ORANGE, "Startup & Funding": ORANGE, "Ricerca & Innovazione": ORANGE,
  "Regolamentazione AI": "#f39c12", "AI & Lavoro": "#8b5cf6",
  "AI & Salute": "#10b981", "AI & Finanza": BLUE,
};
const getColor = (cat) => catColors[cat] ?? TEAL;

const editorial = editorialRows[0] ?? null;
const startup = startupRows[0] ?? null;
const news = newsRows;
const reportages = reportageRows;
const analyses = analysesRows;
const baseUrl = "https://ideasmart.ai";
const unsubLink = recipientToken
  ? `${baseUrl}/unsubscribe?token=${recipientToken}`
  : `${baseUrl}/unsubscribe`;
console.log(`  Link unsubscribe: ${unsubLink}`);

// NEWS
const newsHtml = news.map((item, idx) => {
  const num = String(idx + 1).padStart(2, "0");
  const color = getColor(item.category);
  return `
  <tr>
    <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="32" valign="top" style="padding-right:12px;">
            <span style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.25);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${num}</span>
          </td>
          <td valign="top">
            <span style="display:inline-block;font-size:10px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:0.08em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin-bottom:4px;">${item.category}</span><br>
            <span style="font-size:14px;font-weight:700;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.4;">${item.title}</span><br>
            <span style="font-size:12px;color:rgba(255,255,255,0.55);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.5;">${item.summary}</span>
            ${item.sourceName ? `<br><span style="font-size:11px;color:${color};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Fonte: ${item.sourceUrl ? `<a href="${item.sourceUrl}" style="color:${color};text-decoration:none;">${item.sourceName}</a>` : item.sourceName}</span>` : ""}
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}).join("");

// REPORTAGE
const accentColors = [TEAL, ORANGE, BLUE, "#8b5cf6"];
const reportageHtml = reportages.map((rep, idx) => {
  const color = accentColors[idx % 4];
  const rgbMap = { [TEAL]: "0,180,160", [ORANGE]: "232,79,0", [BLUE]: "26,86,219", "#8b5cf6": "139,92,246" };
  const rgb = rgbMap[color] || "0,180,160";
  const statsHtml = [
    rep.stat1Value && rep.stat1Label ? `<td width="30%" align="center" style="background:rgba(255,255,255,0.03);border-radius:8px;padding:12px 8px;border:1px solid rgba(255,255,255,0.06);"><div style="font-size:22px;font-weight:900;color:${color};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${rep.stat1Value}</div><div style="font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.08em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${rep.stat1Label}</div></td>` : "",
    rep.stat2Value && rep.stat2Label ? `<td width="4%"></td><td width="30%" align="center" style="background:rgba(255,255,255,0.03);border-radius:8px;padding:12px 8px;border:1px solid rgba(255,255,255,0.06);"><div style="font-size:22px;font-weight:900;color:${color};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${rep.stat2Value}</div><div style="font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.08em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${rep.stat2Label}</div></td>` : "",
    rep.stat3Value && rep.stat3Label ? `<td width="4%"></td><td width="30%" align="center" style="background:rgba(255,255,255,0.03);border-radius:8px;padding:12px 8px;border:1px solid rgba(255,255,255,0.06);"><div style="font-size:22px;font-weight:900;color:${color};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${rep.stat3Value}</div><div style="font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.08em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${rep.stat3Label}</div></td>` : "",
  ].filter(Boolean).join("");

  return `
  <!-- REPORTAGE ${idx + 1}: ${rep.startupName} -->
  <tr>
    <td style="padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background:#060a14;padding:10px 32px;border-top:1px solid rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.06);">
            <span style="font-size:10px;color:rgba(255,255,255,0.25);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;">0${idx + 1} &mdash;</span>&nbsp;
            <span style="font-size:10px;color:${color};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;">${rep.category}</span>
          </td>
        </tr>
        <tr>
          <td style="background:rgba(${rgb},0.06);border-bottom:3px solid ${color};padding:14px 32px;">
            <span style="font-size:20px;font-weight:900;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.3;">${rep.headline}</span>
            ${rep.subheadline ? `<br><span style="font-size:13px;color:rgba(255,255,255,0.55);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${rep.subheadline}</span>` : ""}
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:24px 32px 28px;background:#0a0f1e;">
      <p style="font-size:14px;line-height:1.75;color:rgba(255,255,255,0.70);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 16px;">${(rep.bodyText || "").replace(/\n/g, "<br>")}</p>
      ${rep.quote ? `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;"><tr><td style="border-left:3px solid ${color};padding:10px 16px;background:rgba(255,255,255,0.03);border-radius:0 6px 6px 0;"><span style="font-size:13px;font-style:italic;color:${color};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">"${rep.quote}"</span></td></tr></table>` : ""}
      ${statsHtml ? `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;"><tr>${statsHtml}</tr></table>` : ""}
      ${rep.websiteUrl || rep.ctaUrl ? `<table cellpadding="0" cellspacing="0" border="0"><tr><td style="background:${color};border-radius:8px;padding:12px 24px;"><a href="${rep.ctaUrl || rep.websiteUrl}" target="_blank" style="font-size:13px;font-weight:700;color:${color === ORANGE ? "#ffffff" : NAVY};text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${rep.ctaLabel || "Scopri di più"} &rarr;</a></td></tr></table>` : ""}
    </td>
  </tr>`;
}).join("");

// ANALISI
const analysesHtml = analyses.map((a, idx) => {
  const color = accentColors[idx % 4];
  return `
  <tr>
    <td style="padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="padding:0 0 8px;"><span style="font-size:10px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:0.08em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${a.category}</span> <span style="font-size:10px;color:rgba(255,255,255,0.30);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&mdash; ${a.source}</span></td></tr>
        <tr><td style="padding:0 0 8px;"><span style="font-size:15px;font-weight:800;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.4;">${a.title}</span></td></tr>
        <tr><td style="padding:0 0 10px;"><span style="font-size:13px;line-height:1.65;color:rgba(255,255,255,0.60);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${a.summary}</span></td></tr>
        ${(a.dataPoint1 || a.dataPoint2 || a.dataPoint3) ? `<tr><td style="padding:8px 0;">${[a.dataPoint1, a.dataPoint2, a.dataPoint3].filter(Boolean).map(dp => `<span style="font-size:12px;font-weight:700;color:${color};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin-right:16px;">&#9632; ${dp}</span>`).join("")}</td></tr>` : ""}
        ${a.keyInsight ? `<tr><td style="padding:8px 0 0;"><span style="font-size:12px;font-style:italic;color:rgba(255,255,255,0.45);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">"${a.keyInsight}"</span></td></tr>` : ""}
      </table>
    </td>
  </tr>`;
}).join("");

const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI4Business News — ${dateLabel}</title>
</head>
<body style="margin:0;padding:0;background:#040810;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#040810;padding:20px 0 40px;">
  <tr><td align="center">
  <table width="640" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;width:100%;background:#0a0f1e;border-radius:4px;overflow:hidden;">

    <!-- TEST BANNER -->
    <tr><td style="background:#e84f00;padding:8px 32px;text-align:center;"><span style="font-size:11px;font-weight:700;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;text-transform:uppercase;letter-spacing:0.1em;">&#9888; EMAIL DI PROVA — Non inviare agli iscritti</span></td></tr>

    <!-- TOP BAR -->
    <tr><td style="background:#040810;padding:10px 32px;"><span style="font-size:10px;color:${TEAL};letter-spacing:0.15em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9670; AI4Business News &mdash; by IDEASMART &mdash; ${dateLabel}</span></td></tr>

    <!-- HEADER -->
    <tr>
      <td style="background:linear-gradient(135deg,${NAVY} 0%,#1a2540 100%);padding:36px 32px 28px;">
        <div style="font-size:32px;font-weight:900;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.1;margin-bottom:4px;">AI4Business <span style="color:${TEAL};">News</span></div>
        <div style="font-size:13px;color:rgba(255,255,255,0.45);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin-bottom:16px;">by IDEASMART &mdash; Il Quotidiano AI Italiano</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.55);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
          In questa edizione: <strong style="color:#ffffff;">${news.length} news AI</strong> &middot; <strong style="color:#ffffff;">${reportages.length} reportage</strong> &middot; <strong style="color:#ffffff;">${analyses.length} analisi di mercato</strong>${editorial ? " &middot; <strong style=\"color:#ffffff;\">Editoriale</strong>" : ""}${startup ? " &middot; <strong style=\"color:#ffffff;\">Startup del Giorno</strong>" : ""}
        </div>
      </td>
    </tr>

    ${editorial ? `
    <!-- EDITORIALE -->
    <tr><td style="padding:0;"><table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="background:#060a14;padding:10px 32px;border-top:1px solid rgba(255,255,255,0.06);"><span style="font-size:10px;color:rgba(255,255,255,0.25);letter-spacing:0.1em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">EDITORIALE &mdash;</span>&nbsp;<span style="font-size:10px;color:${TEAL};letter-spacing:0.1em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Analisi del Giorno</span></td></tr>
      <tr><td style="background:rgba(0,180,160,0.06);border-bottom:3px solid ${TEAL};padding:14px 32px;"><span style="font-size:20px;font-weight:900;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.3;">${editorial.title}</span>${editorial.subtitle ? `<br><span style="font-size:13px;color:rgba(255,255,255,0.55);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${editorial.subtitle}</span>` : ""}</td></tr>
    </table></td></tr>
    <tr><td style="padding:24px 32px 28px;background:#0a0f1e;">
      ${editorial.keyTrend ? `<p style="font-size:12px;font-weight:700;color:${TEAL};text-transform:uppercase;letter-spacing:0.08em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 12px;">&#9670; Trend del giorno: ${editorial.keyTrend}</p>` : ""}
      <p style="font-size:14px;line-height:1.75;color:rgba(255,255,255,0.70);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 16px;">${(editorial.body || "").replace(/\n/g, "<br>")}</p>
      ${editorial.authorNote ? `<p style="font-size:13px;font-style:italic;color:rgba(255,255,255,0.45);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0;border-top:1px solid rgba(255,255,255,0.06);padding-top:12px;">${editorial.authorNote}</p>` : ""}
    </td></tr>` : ""}

    ${startup ? `
    <!-- STARTUP DEL GIORNO -->
    <tr><td style="padding:0;"><table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="background:#060a14;padding:10px 32px;border-top:1px solid rgba(255,255,255,0.06);"><span style="font-size:10px;color:rgba(255,255,255,0.25);letter-spacing:0.1em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">STARTUP DEL GIORNO &mdash;</span>&nbsp;<span style="font-size:10px;color:${ORANGE};letter-spacing:0.1em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${startup.category}</span></td></tr>
      <tr><td style="background:rgba(232,79,0,0.06);border-bottom:3px solid ${ORANGE};padding:14px 32px;"><span style="font-size:20px;font-weight:900;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.3;">${startup.name}</span><br><span style="font-size:13px;color:rgba(255,255,255,0.55);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${startup.tagline}</span></td></tr>
    </table></td></tr>
    <tr><td style="padding:24px 32px 28px;background:#0a0f1e;">
      <p style="font-size:14px;line-height:1.75;color:rgba(255,255,255,0.70);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 12px;">${startup.description}</p>
      <p style="font-size:13px;font-weight:600;color:${ORANGE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 8px;">Perché oggi?</p>
      <p style="font-size:13px;line-height:1.65;color:rgba(255,255,255,0.60);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 16px;">${startup.whyToday}</p>
      ${startup.funding ? `<p style="font-size:12px;color:${ORANGE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 16px;">&#9632; Funding: <strong>${startup.funding}</strong></p>` : ""}
      ${startup.aiScore ? `<p style="font-size:12px;color:rgba(255,255,255,0.40);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 16px;">AI Score: <strong style="color:${ORANGE};">${startup.aiScore}/100</strong></p>` : ""}
      ${startup.websiteUrl ? `<table cellpadding="0" cellspacing="0" border="0"><tr><td style="background:${ORANGE};border-radius:8px;padding:12px 24px;"><a href="${startup.websiteUrl}" target="_blank" style="font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Visita il sito &rarr;</a></td></tr></table>` : ""}
    </td></tr>` : ""}

    ${reportages.length > 0 ? `
    <!-- REPORTAGE -->
    <tr><td style="padding:0;"><table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="background:#040810;padding:14px 32px;border-top:1px solid rgba(255,255,255,0.06);"><span style="font-size:10px;color:${TEAL};letter-spacing:0.15em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9670; Reportage Startup AI Italiane</span></td></tr>
    </table></td></tr>
    ${reportageHtml}` : ""}

    <!-- NEWS -->
    <tr><td style="padding:0;"><table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="background:#040810;padding:14px 32px;border-top:1px solid rgba(255,255,255,0.06);"><span style="font-size:10px;color:${TEAL};letter-spacing:0.15em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9670; Le ${news.length} Notizie AI del Giorno</span></td></tr>
    </table></td></tr>
    <tr><td style="padding:20px 32px 28px;background:#060a14;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">${newsHtml}</table>
    </td></tr>

    ${analyses.length > 0 ? `
    <!-- ANALISI -->
    <tr><td style="padding:0;"><table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="background:#040810;padding:14px 32px;border-top:1px solid rgba(255,255,255,0.06);"><span style="font-size:10px;color:${BLUE};letter-spacing:0.15em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9670; Analisi di Mercato AI</span></td></tr>
    </table></td></tr>
    <tr><td style="padding:20px 32px 28px;background:#060a14;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">${analysesHtml}</table>
    </td></tr>` : ""}

    <!-- CTA -->
    <tr><td align="center" style="padding:32px;background:linear-gradient(135deg,#060a14,${NAVY});border-top:1px solid rgba(255,255,255,0.06);">
      <p style="font-size:18px;font-weight:900;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 8px;">Leggi tutte le news sul sito<br><span style="color:${TEAL};">AI4Business News</span></p>
      <p style="font-size:13px;color:rgba(255,255,255,0.45);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 20px;">Aggiornato ogni giorno con le notizie AI più rilevanti per il business italiano.</p>
      <table cellpadding="0" cellspacing="0" border="0" align="center"><tr><td style="background:${TEAL};border-radius:8px;padding:14px 32px;"><a href="${baseUrl}" style="font-size:14px;font-weight:700;color:${NAVY};text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Vai al sito &rarr;</a></td></tr></table>
    </td></tr>

    <!-- FOOTER -->
    <tr><td style="padding:28px 32px 32px;background:#040810;border-top:1px solid rgba(255,255,255,0.05);">
      <p style="font-size:11px;color:rgba(255,255,255,0.25);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 10px;text-align:center;">&copy; 2026 <strong style="color:rgba(255,255,255,0.40);">AI4Business News</strong> &mdash; by IDEASMART &middot; Startup di Tecnologia &amp; Innovazione</p>
      <p style="font-size:11px;color:rgba(255,255,255,0.18);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 12px;text-align:center;line-height:1.6;">Hai ricevuto questa email perch&eacute; sei iscritto alla newsletter AI4Business News by IDEASMART.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 12px;"><tr><td style="border-top:1px solid rgba(255,255,255,0.06);font-size:0;line-height:0;">&nbsp;</td></tr></table>
      <p style="font-size:11px;color:rgba(255,255,255,0.20);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0;text-align:center;">
        <a href="${unsubLink}" style="color:#ff5500;text-decoration:underline;font-weight:600;">Annulla iscrizione</a>
        &nbsp;&middot;&nbsp;<a href="${baseUrl}" style="color:rgba(255,255,255,0.30);text-decoration:underline;">Visita il sito</a>
        &nbsp;&middot;&nbsp;<a href="mailto:ac@foolfarm.com" style="color:rgba(255,255,255,0.30);text-decoration:underline;">Contattaci</a>
      </p>
    </td></tr>

  </table>
  </td></tr>
</table>
</body>
</html>`;

// ── Invia via SendGrid ──────────────────────────────────────────────────────
const subject = `[PROVA] AI4Business News — ${dateLabel} | ${news.length} news, ${reportages.length} reportage`;

console.log(`\nInvio a: ${TO_EMAIL}`);
console.log(`Oggetto: ${subject}`);

const body = {
  personalizations: [{ to: [{ email: TO_EMAIL }] }],
  from: { email: FROM_EMAIL, name: FROM_NAME },
  subject,
  content: [{ type: "text/html", value: html }],
};

const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${SENDGRID_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

if (response.status === 202) {
  console.log(`\n✓ Newsletter di prova inviata con successo a ${TO_EMAIL}!`);
  console.log(`  News: ${news.length} | Reportage: ${reportages.length} | Analisi: ${analyses.length}`);
  console.log(`  Editoriale: ${editorial ? "✓" : "—"} | Startup del giorno: ${startup ? "✓" : "—"}`);
} else {
  const errorText = await response.text();
  console.error(`\n✗ Errore SendGrid ${response.status}:`, errorText);
  process.exit(1);
}
