/**
 * Script per inviare la newsletter a TUTTI gli iscritti attivi.
 * Usa lo stesso template chiaro dello script di prova.
 * Uso: node scripts/send-newsletter-all.mjs
 */

import { config } from "dotenv";
config();

const DB_URL = process.env.DATABASE_URL;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "info@ideasmart.ai";
const FROM_NAME = process.env.SENDGRID_FROM_NAME || "AI4Business News by IDEASMART";
const BASE_URL = "https://ideasmart.ai";

if (!DB_URL) { console.error("DATABASE_URL non impostato"); process.exit(1); }
if (!SENDGRID_API_KEY) { console.error("SENDGRID_API_KEY non impostato"); process.exit(1); }

import mysql from "mysql2/promise";

const conn = await mysql.createConnection(DB_URL);
console.log("✓ Connesso al database");

// ── Recupera dati newsletter ────────────────────────────────────────────────
const [newsRows] = await conn.execute(
  "SELECT title, summary, category, sourceName, sourceUrl FROM news_items ORDER BY createdAt DESC, position ASC LIMIT 25"
);
const [editorialRows] = await conn.execute(
  "SELECT title, subtitle, body, keyTrend, authorNote FROM daily_editorial ORDER BY createdAt DESC LIMIT 1"
);
const [startupRows] = await conn.execute(
  "SELECT name, tagline, description, category, funding, whyToday, websiteUrl, aiScore FROM startup_of_day ORDER BY createdAt DESC LIMIT 1"
);
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

// ── Recupera tutti gli iscritti attivi con token ────────────────────────────
const [subscribers] = await conn.execute(
  "SELECT email, unsubscribeToken FROM subscribers WHERE status = 'active' AND email IS NOT NULL AND email != ''"
);

await conn.end();

console.log(`✓ Dati recuperati: ${newsRows.length} news, ${reportageRows.length} reportage, ${analysesRows.length} analisi`);
console.log(`✓ Iscritti attivi: ${subscribers.length}`);
if (editorialRows.length > 0) console.log(`  Editoriale: "${editorialRows[0].title}"`);
if (startupRows.length > 0) console.log(`  Startup del giorno: "${startupRows[0].name}"`);

// ── Palette CHIARA ──────────────────────────────────────────────────────────
const today = new Date();
const dateLabel = today.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });

const TEAL    = "#00b4a0";
const TEAL_L  = "#e6f7f5";
const NAVY    = "#1a1f2e";
const ORANGE  = "#e84f00";
const ORANGE_L= "#fff2ec";
const BLUE    = "#1a56db";
const BLUE_L  = "#eff4ff";
const SLATE   = "#4b5563";
const MUTED   = "#9ca3af";
const BORDER  = "#e2e5ed";
const SURF1   = "#f8f9fc";
const SURF2   = "#f1f3f8";
const WHITE   = "#ffffff";
const PURPLE  = "#7c3aed";
const PURPLE_L= "#f5f3ff";
const GREEN   = "#059669";
const GREEN_L = "#ecfdf5";

const catColors = {
  "Modelli Generativi":    { text: TEAL,   bg: TEAL_L   },
  "AI Generativa":         { text: TEAL,   bg: TEAL_L   },
  "AI Agentiva":           { text: TEAL,   bg: TEAL_L   },
  "Robot & AI Fisica":     { text: TEAL,   bg: TEAL_L   },
  "AI & Startup Italiane": { text: TEAL,   bg: TEAL_L   },
  "AI & Hardware":         { text: BLUE,   bg: BLUE_L   },
  "Big Tech":              { text: BLUE,   bg: BLUE_L   },
  "Internazionalizzazione":{ text: BLUE,   bg: BLUE_L   },
  "AI & Difesa":           { text: ORANGE, bg: ORANGE_L },
  "Startup & Funding":     { text: ORANGE, bg: ORANGE_L },
  "Ricerca & Innovazione": { text: ORANGE, bg: ORANGE_L },
  "Regolamentazione AI":   { text: "#b45309", bg: "#fffbeb" },
  "AI & Lavoro":           { text: PURPLE, bg: PURPLE_L },
  "AI & Salute":           { text: GREEN,  bg: GREEN_L  },
  "AI & Finanza":          { text: BLUE,   bg: BLUE_L   },
};
const getColor = (cat) => catColors[cat]?.text ?? TEAL;
const getBg    = (cat) => catColors[cat]?.bg   ?? TEAL_L;

const editorial = editorialRows[0] ?? null;
const startup   = startupRows[0]   ?? null;
const news      = newsRows;
const reportages= reportageRows;
const analyses  = analysesRows;

// ── Funzione per generare HTML personalizzato per ogni iscritto ─────────────
function buildHtml(unsubLink, trackingPixelUrl) {
  const newsHtml = news.map((item, idx) => {
    const num   = String(idx + 1).padStart(2, "0");
    const color = getColor(item.category);
    const bg    = getBg(item.category);
    return `
  <tr>
    <td style="padding:14px 24px;border-bottom:1px solid ${BORDER};background:${idx % 2 === 0 ? WHITE : SURF1};">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="28" valign="top" style="padding-right:12px;">
            <span style="font-size:11px;font-weight:700;color:${MUTED};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${num}</span>
          </td>
          <td valign="top">
            <span style="display:inline-block;font-size:9px;font-weight:700;color:${color};background:${bg};text-transform:uppercase;letter-spacing:0.08em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;padding:2px 8px;border-radius:4px;margin-bottom:5px;">${item.category}</span><br>
            <span style="font-size:14px;font-weight:700;color:${NAVY};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.4;">${item.title}</span><br>
            <span style="font-size:12px;color:${SLATE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.55;">${item.summary}</span>
            ${item.sourceName ? `<br><span style="font-size:11px;color:${MUTED};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Fonte: ${item.sourceUrl ? `<a href="${item.sourceUrl}" style="color:${color};text-decoration:none;">${item.sourceName}</a>` : item.sourceName}</span>` : ""}
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
  }).join("");

  const accentColors = [TEAL, ORANGE, BLUE, PURPLE];
  const accentBgs    = [TEAL_L, ORANGE_L, BLUE_L, PURPLE_L];

  const reportageHtml = reportages.map((rep, idx) => {
    const color = accentColors[idx % 4];
    const bgL   = accentBgs[idx % 4];
    const statsHtml = [
      rep.stat1Value && rep.stat1Label ? `<td width="30%" align="center" style="background:${bgL};border-radius:8px;padding:12px 8px;border:1px solid ${BORDER};"><div style="font-size:22px;font-weight:900;color:${color};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${rep.stat1Value}</div><div style="font-size:10px;color:${MUTED};text-transform:uppercase;letter-spacing:0.08em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${rep.stat1Label}</div></td>` : "",
      rep.stat2Value && rep.stat2Label ? `<td width="4%"></td><td width="30%" align="center" style="background:${bgL};border-radius:8px;padding:12px 8px;border:1px solid ${BORDER};"><div style="font-size:22px;font-weight:900;color:${color};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${rep.stat2Value}</div><div style="font-size:10px;color:${MUTED};text-transform:uppercase;letter-spacing:0.08em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${rep.stat2Label}</div></td>` : "",
      rep.stat3Value && rep.stat3Label ? `<td width="4%"></td><td width="30%" align="center" style="background:${bgL};border-radius:8px;padding:12px 8px;border:1px solid ${BORDER};"><div style="font-size:22px;font-weight:900;color:${color};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${rep.stat3Value}</div><div style="font-size:10px;color:${MUTED};text-transform:uppercase;letter-spacing:0.08em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${rep.stat3Label}</div></td>` : "",
    ].filter(Boolean).join("");
    return `
  <tr>
    <td style="padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background:${SURF1};padding:10px 24px;border-top:1px solid ${BORDER};border-bottom:1px solid ${BORDER};">
            <span style="font-size:9px;color:${MUTED};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;">0${idx + 1} &mdash;</span>&nbsp;
            <span style="font-size:9px;font-weight:700;color:${color};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;">${rep.category}</span>
          </td>
        </tr>
        <tr>
          <td style="background:${bgL};border-left:4px solid ${color};padding:16px 24px;">
            <span style="font-size:20px;font-weight:900;color:${NAVY};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.3;">${rep.headline}</span>
            ${rep.subheadline ? `<br><span style="font-size:13px;color:${SLATE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${rep.subheadline}</span>` : ""}
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:20px 24px 24px;background:${WHITE};">
      <p style="font-size:13px;line-height:1.8;color:${SLATE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 14px;">${(rep.bodyText || "").replace(/\n/g, "<br>")}</p>
      ${rep.quote ? `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:14px 0;"><tr><td style="border-left:3px solid ${color};padding:10px 16px;background:${bgL};border-radius:0 6px 6px 0;"><span style="font-size:13px;font-style:italic;color:${color};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">"${rep.quote}"</span></td></tr></table>` : ""}
      ${statsHtml ? `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;"><tr>${statsHtml}</tr></table>` : ""}
      ${rep.websiteUrl || rep.ctaUrl ? `<table cellpadding="0" cellspacing="0" border="0"><tr><td style="background:${color};border-radius:8px;padding:11px 22px;"><a href="${rep.ctaUrl || rep.websiteUrl}" target="_blank" style="font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${rep.ctaLabel || "Scopri di più"} &rarr;</a></td></tr></table>` : ""}
    </td>
  </tr>`;
  }).join("");

  const analysesHtml = analyses.map((a, idx) => {
    const color = accentColors[idx % 4];
    const bgL   = accentBgs[idx % 4];
    const dps = [a.dataPoint1, a.dataPoint2, a.dataPoint3].filter(Boolean);
    const dpHtml = dps.map(dp => `<li style="font-size:12px;color:${SLATE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin-bottom:4px;">${dp}</li>`).join("");
    return `
  <tr>
    <td style="padding:16px 24px;border-bottom:1px solid ${BORDER};background:${idx % 2 === 0 ? WHITE : SURF1};">
      <span style="display:inline-block;font-size:9px;font-weight:700;color:${color};background:${bgL};text-transform:uppercase;letter-spacing:0.08em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;padding:2px 8px;border-radius:4px;margin-bottom:6px;">${a.category}</span><br>
      <span style="font-size:15px;font-weight:800;color:${NAVY};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${a.title}</span><br>
      <span style="font-size:12px;color:${SLATE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.6;">${a.summary}</span>
      ${dpHtml ? `<ul style="margin:8px 0 0 16px;padding:0;">${dpHtml}</ul>` : ""}
      ${a.keyInsight ? `<p style="font-size:12px;font-weight:700;color:${color};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:8px 0 0;">💡 ${a.keyInsight}</p>` : ""}
    </td>
  </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AI4Business News by IDEASMART — ${dateLabel}</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0f4f8;">
<tr><td align="center" style="padding:24px 16px;">
<table width="640" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;width:100%;background:${WHITE};border-radius:16px;overflow:hidden;border:1px solid ${BORDER};box-shadow:0 4px 24px rgba(0,0,0,0.07);">

  <!-- HEADER TEAL -->
  <tr>
    <td style="background:${TEAL};padding:20px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">IDEA<span style="color:#0a0f1e;">SMART</span></span>
            <span style="font-size:11px;color:rgba(255,255,255,0.75);letter-spacing:0.12em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin-left:10px;">AI FOR BUSINESS</span>
          </td>
          <td align="right">
            <span style="font-size:11px;color:rgba(255,255,255,0.75);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${dateLabel}</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- HERO -->
  <tr>
    <td style="background:linear-gradient(135deg,#f0faf9 0%,#e6f7f5 100%);padding:32px 32px 28px;border-bottom:3px solid ${TEAL};">
      <span style="font-size:11px;font-weight:700;color:${TEAL};text-transform:uppercase;letter-spacing:0.12em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">◆ AI4Business News</span><br>
      <span style="font-size:32px;font-weight:900;color:${NAVY};letter-spacing:-1px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.2;">Il Quotidiano AI<br><span style="color:${TEAL};">per il Business Italiano</span></span>
      <br><br>
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background:${WHITE};border:1px solid ${BORDER};border-radius:8px;padding:8px 16px;margin-right:8px;">
            <span style="font-size:11px;color:${MUTED};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">📰 <strong style="color:${NAVY};">${news.length} news AI</strong></span>
          </td>
          <td width="8"></td>
          <td style="background:${WHITE};border:1px solid ${BORDER};border-radius:8px;padding:8px 16px;">
            <span style="font-size:11px;color:${MUTED};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">📊 <strong style="color:${NAVY};">${reportages.length} reportage · ${analyses.length} analisi</strong></span>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  ${editorial ? `
  <!-- EDITORIALE -->
  <tr>
    <td style="padding:0 32px;background:${WHITE};">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:20px 0 8px;">
            <span style="font-size:9px;font-weight:700;color:${MUTED};text-transform:uppercase;letter-spacing:0.15em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">EDITORIALE — ANALISI DEL GIORNO</span>
          </td>
        </tr>
        <tr>
          <td style="background:${SURF1};border-left:4px solid ${TEAL};border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:24px;">
            <span style="font-size:18px;font-weight:800;color:${NAVY};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.3;">${editorial.title}</span>
            ${editorial.subtitle ? `<br><span style="font-size:12px;color:${SLATE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${editorial.subtitle}</span>` : ""}
          </td>
        </tr>
        ${editorial.keyTrend ? `<tr><td style="padding:12px 0 0;"><span style="font-size:11px;font-weight:700;color:${TEAL};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;text-transform:uppercase;letter-spacing:0.08em;">◆ TREND DEL GIORNO: ${editorial.keyTrend}</span></td></tr>` : ""}
        ${editorial.body ? `<tr><td style="padding:10px 0 20px;"><p style="font-size:13px;line-height:1.8;color:${SLATE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0;">${editorial.body.replace(/\n/g, "<br>")}</p></td></tr>` : ""}
      </table>
    </td>
  </tr>` : ""}

  ${startup ? `
  <!-- STARTUP DEL GIORNO -->
  <tr>
    <td style="padding:0 32px 24px;background:${WHITE};">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,${ORANGE_L} 0%,#fff8f5 100%);border:1px solid #fbd5c5;border-radius:12px;overflow:hidden;">
        <tr>
          <td style="padding:16px 20px;border-bottom:1px solid #fbd5c5;background:${ORANGE};"><span style="font-size:10px;font-weight:700;color:#ffffff;text-transform:uppercase;letter-spacing:0.12em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">⚡ STARTUP DEL GIORNO</span></td>
        </tr>
        <tr>
          <td style="padding:16px 20px;">
            <span style="font-size:20px;font-weight:900;color:${NAVY};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${startup.name}</span>
            ${startup.aiScore ? `<span style="margin-left:10px;font-size:11px;font-weight:700;color:${ORANGE};background:${ORANGE_L};border:1px solid #fbd5c5;border-radius:20px;padding:3px 10px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">AI Score: ${startup.aiScore}/10</span>` : ""}
            <br>
            ${startup.tagline ? `<span style="font-size:13px;color:${SLATE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${startup.tagline}</span><br>` : ""}
            ${startup.description ? `<p style="font-size:13px;line-height:1.7;color:${SLATE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:10px 0;">${startup.description}</p>` : ""}
            ${startup.whyToday ? `<p style="font-size:12px;font-weight:700;color:${ORANGE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 12px;">💡 Perché oggi: ${startup.whyToday}</p>` : ""}
            ${startup.websiteUrl ? `<table cellpadding="0" cellspacing="0" border="0"><tr><td style="background:${ORANGE};border-radius:8px;padding:10px 20px;"><a href="${startup.websiteUrl}" target="_blank" style="font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Visita il sito &rarr;</a></td></tr></table>` : ""}
          </td>
        </tr>
      </table>
    </td>
  </tr>` : ""}

  ${reportages.length > 0 ? `
  <!-- REPORTAGE -->
  <tr>
    <td style="padding:0 32px 8px;background:${SURF1};">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:20px 0 12px;border-bottom:2px solid ${TEAL};">
            <span style="font-size:16px;font-weight:900;color:${NAVY};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Reportage della Settimana</span>
            <span style="font-size:10px;color:${MUTED};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin-left:10px;text-transform:uppercase;letter-spacing:0.1em;">${reportages.length} storie</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="background:${SURF1};">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${reportageHtml}
      </table>
    </td>
  </tr>` : ""}

  ${news.length > 0 ? `
  <!-- NEWS AI -->
  <tr>
    <td style="padding:0 32px 8px;background:${WHITE};">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:24px 0 12px;border-bottom:2px solid ${NAVY};">
            <span style="font-size:16px;font-weight:900;color:${NAVY};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Top ${news.length} News AI</span>
            <span style="font-size:10px;color:${MUTED};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin-left:10px;text-transform:uppercase;letter-spacing:0.1em;">selezionate dall'AI</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${newsHtml}
      </table>
    </td>
  </tr>` : ""}

  ${analyses.length > 0 ? `
  <!-- ANALISI DI MERCATO -->
  <tr>
    <td style="padding:0 32px 8px;background:${SURF1};">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:24px 0 12px;border-bottom:2px solid ${BLUE};">
            <span style="font-size:16px;font-weight:900;color:${NAVY};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Analisi di Mercato</span>
            <span style="font-size:10px;color:${MUTED};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin-left:10px;text-transform:uppercase;letter-spacing:0.1em;">${analyses.length} analisi</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="background:${SURF1};">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${analysesHtml}
      </table>
    </td>
  </tr>` : ""}

  <!-- CTA -->
  <tr>
    <td style="padding:32px;background:linear-gradient(135deg,${TEAL_L} 0%,#e6f7f5 100%);border-top:3px solid ${TEAL};">
      <p style="font-size:16px;font-weight:800;color:${NAVY};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 8px;">Leggi tutte le notizie su IDEASMART →</p>
      <p style="font-size:13px;color:${SLATE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 20px;">Analisi quotidiane, reportage e startup AI selezionate per il business italiano.</p>
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background:${TEAL};border-radius:10px;padding:14px 28px;">
            <a href="${BASE_URL}" target="_blank" style="font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Visita ideasmart.ai &rarr;</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="background:${SURF2};padding:24px 32px;border-top:1px solid ${BORDER};">
      <p style="font-size:12px;color:${MUTED};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 8px;text-align:center;">
        <strong style="color:${NAVY};">IDEASMART</strong> — AI for Business · <a href="${BASE_URL}" style="color:${TEAL};text-decoration:none;">ideasmart.ai</a>
      </p>
      <p style="font-size:11px;color:${MUTED};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0;text-align:center;">
        Hai ricevuto questa email perché sei iscritto alla newsletter IDEASMART.<br>
        <a href="${unsubLink}" style="color:${TEAL};text-decoration:underline;">Annulla iscrizione</a> &nbsp;·&nbsp;
        <a href="${BASE_URL}/privacy" style="color:${MUTED};text-decoration:none;">Privacy Policy</a> &nbsp;·&nbsp;
        Hai domande? Scrivi a <a href="mailto:info@ideasmart.ai" style="color:${TEAL};text-decoration:none;">info@ideasmart.ai</a>
      </p>
    </td>
  </tr>

</table>
</td></tr></table>
${trackingPixelUrl ? `<img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="" />` : ""}
</body>
</html>`;
}

// ── Funzione invio singola email ────────────────────────────────────────────
async function sendEmail(to, html, subject) {
  const body = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject,
    content: [{ type: "text/html", value: html }],
  };
  const r = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { "Authorization": `Bearer ${SENDGRID_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.status === 202;
}

// ── Invio a tutti gli iscritti ──────────────────────────────────────────────
const subject = `AI4Business News — ${dateLabel} | ${news.length} news, ${reportages.length} reportage`;
let sent = 0;
let failed = 0;
const BATCH_SIZE = 10; // Invia in batch per evitare rate limiting

console.log(`\n🚀 Avvio invio a ${subscribers.length} iscritti...`);
console.log(`   Mittente: ${FROM_NAME} <${FROM_EMAIL}>`);
console.log(`   Oggetto: ${subject}\n`);

for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
  const batch = subscribers.slice(i, i + BATCH_SIZE);
  await Promise.all(batch.map(async (sub) => {
    const unsubLink = sub.unsubscribeToken
      ? `${BASE_URL}/unsubscribe?token=${sub.unsubscribeToken}`
      : `${BASE_URL}/unsubscribe`;
    const trackingPixelUrl = `${BASE_URL}/api/track/open?token=${sub.unsubscribeToken || ""}&t=${Date.now()}`;
    const html = buildHtml(unsubLink, trackingPixelUrl);
    const ok = await sendEmail(sub.email, html, subject);
    if (ok) {
      sent++;
    } else {
      failed++;
      console.error(`  ❌ Fallito: ${sub.email}`);
    }
  }));

  // Progress ogni 50 email
  if ((i + BATCH_SIZE) % 50 === 0 || i + BATCH_SIZE >= subscribers.length) {
    const progress = Math.min(i + BATCH_SIZE, subscribers.length);
    console.log(`  📨 ${progress}/${subscribers.length} — Inviati: ${sent} | Falliti: ${failed}`);
  }

  // Pausa breve tra batch per evitare rate limiting SendGrid
  if (i + BATCH_SIZE < subscribers.length) {
    await new Promise(r => setTimeout(r, 200));
  }
}

console.log(`\n✅ Invio completato!`);
console.log(`   ✓ Inviati con successo: ${sent}`);
console.log(`   ✗ Falliti: ${failed}`);
console.log(`   Oggetto: ${subject}`);
