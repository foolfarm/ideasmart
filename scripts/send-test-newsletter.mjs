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
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "info@ideasmart.ai";
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

const [recipientRows] = await conn.execute(
  'SELECT unsubscribeToken FROM subscribers WHERE email = ? LIMIT 1',
  [TO_EMAIL]
);
const recipientToken = recipientRows[0]?.unsubscribeToken;

await conn.end();

console.log(`✓ Dati recuperati: ${newsRows.length} news, ${reportageRows.length} reportage, ${analysesRows.length} analisi`);
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
const baseUrl   = "https://ideasmart.ai";
const unsubLink = recipientToken
  ? `${baseUrl}/unsubscribe?token=${recipientToken}`
  : `${baseUrl}/unsubscribe`;
console.log(`  Link unsubscribe: ${unsubLink}`);

// ── NEWS ────────────────────────────────────────────────────────────────────
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

// ── REPORTAGE ───────────────────────────────────────────────────────────────
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

// ── ANALISI ─────────────────────────────────────────────────────────────────
const analysesHtml = analyses.map((a, idx) => {
  const color = accentColors[idx % 4];
  const bgL   = accentBgs[idx % 4];
  return `
  <tr>
    <td style="padding:16px 24px;border-bottom:1px solid ${BORDER};background:${idx % 2 === 0 ? WHITE : SURF1};">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="padding:0 0 6px;">
          <span style="font-size:9px;font-weight:700;color:${color};background:${bgL};text-transform:uppercase;letter-spacing:0.08em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;padding:2px 8px;border-radius:4px;">${a.category}</span>
          <span style="font-size:10px;color:${MUTED};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"> &mdash; ${a.source}</span>
        </td></tr>
        <tr><td style="padding:0 0 6px;"><span style="font-size:15px;font-weight:800;color:${NAVY};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.4;">${a.title}</span></td></tr>
        <tr><td style="padding:0 0 8px;"><span style="font-size:13px;line-height:1.65;color:${SLATE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${a.summary}</span></td></tr>
        ${(a.dataPoint1 || a.dataPoint2 || a.dataPoint3) ? `<tr><td style="padding:6px 0;">${[a.dataPoint1, a.dataPoint2, a.dataPoint3].filter(Boolean).map(dp => `<span style="font-size:11px;font-weight:700;color:${color};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin-right:14px;">&#9632; ${dp}</span>`).join("")}</td></tr>` : ""}
        ${a.keyInsight ? `<tr><td style="padding:6px 0 0;"><span style="font-size:12px;font-style:italic;color:${MUTED};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">"${a.keyInsight}"</span></td></tr>` : ""}
      </table>
    </td>
  </tr>`;
}).join("");

// ── HTML COMPLETO ────────────────────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI4Business News — ${dateLabel}</title>
</head>
<body style="margin:0;padding:0;background:${SURF2};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${SURF2};padding:24px 0 48px;">
  <tr><td align="center">
  <table width="640" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;width:100%;background:${WHITE};border:1px solid ${BORDER};border-radius:12px;overflow:hidden;">

    <!-- TEST BANNER -->
    <tr><td style="background:${ORANGE};padding:9px 24px;text-align:center;"><span style="font-size:11px;font-weight:700;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;text-transform:uppercase;letter-spacing:0.1em;">&#9888; EMAIL DI PROVA — Non inviare agli iscritti</span></td></tr>

    <!-- TOP BAR teal -->
    <tr><td style="background:${TEAL};padding:0;height:4px;"></td></tr>

    <!-- HEADER BRAND -->
    <tr>
      <td style="background:${WHITE};padding:16px 24px;border-bottom:1px solid ${BORDER};">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td valign="middle">
              <span style="font-size:14px;font-weight:900;color:${NAVY};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.06em;text-transform:uppercase;">IDEA<span style="color:${TEAL};">SMART</span></span>
              <span style="font-size:10px;color:${MUTED};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"> &nbsp;&bull;&nbsp; AI for Business</span>
            </td>
            <td align="right" valign="middle">
              <span style="font-size:10px;color:${MUTED};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${dateLabel}</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- HERO -->
    <tr>
      <td style="background:${TEAL_L};padding:36px 24px 28px;border-bottom:1px solid ${BORDER};">
        <div style="display:inline-block;margin-bottom:12px;">
          <span style="font-size:9px;font-weight:700;color:${TEAL};text-transform:uppercase;letter-spacing:0.15em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;border:1px solid ${TEAL};border-radius:20px;padding:3px 12px;">&#9670; Osservatorio AI Italiano &bull; Aggiornato ogni giorno</span>
        </div>
        <div style="font-size:34px;font-weight:900;color:${NAVY};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.1;margin-bottom:5px;">
          AI4Business <span style="color:${TEAL};">News</span>
        </div>
        <div style="font-size:13px;color:${SLATE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin-bottom:20px;">by IDEASMART &mdash; Il Quotidiano AI Italiano</div>
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding-right:24px;">
              <div style="font-size:26px;font-weight:900;color:${TEAL};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1;">${news.length}</div>
              <div style="font-size:9px;color:${MUTED};text-transform:uppercase;letter-spacing:0.1em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">News AI</div>
            </td>
            ${reportages.length > 0 ? `<td style="padding-right:24px;border-left:1px solid ${BORDER};padding-left:24px;">
              <div style="font-size:26px;font-weight:900;color:${ORANGE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1;">${reportages.length}</div>
              <div style="font-size:9px;color:${MUTED};text-transform:uppercase;letter-spacing:0.1em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Reportage</div>
            </td>` : ""}
            ${analyses.length > 0 ? `<td style="border-left:1px solid ${BORDER};padding-left:24px;">
              <div style="font-size:26px;font-weight:900;color:${BLUE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1;">${analyses.length}</div>
              <div style="font-size:9px;color:${MUTED};text-transform:uppercase;letter-spacing:0.1em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Analisi</div>
            </td>` : ""}
          </tr>
        </table>
      </td>
    </tr>

    ${editorial ? `
    <!-- EDITORIALE -->
    <tr>
      <td style="border-top:1px solid ${BORDER};">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="background:${SURF1};padding:10px 24px;">
            <span style="font-size:9px;font-weight:700;color:${MUTED};letter-spacing:0.15em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">EDITORIALE</span>
            <span style="font-size:9px;color:${BORDER};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"> &mdash; </span>
            <span style="font-size:9px;font-weight:700;color:${TEAL};letter-spacing:0.15em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Analisi del Giorno</span>
          </td></tr>
          <tr><td style="padding:20px 24px 16px;border-left:4px solid ${TEAL};background:${TEAL_L};">
            ${editorial.keyTrend ? `<div style="font-size:9px;font-weight:700;color:${TEAL};text-transform:uppercase;letter-spacing:0.12em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin-bottom:8px;">&#9670; ${editorial.keyTrend}</div>` : ""}
            <div style="font-size:20px;font-weight:900;color:${NAVY};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.25;margin-bottom:6px;">${editorial.title}</div>
            ${editorial.subtitle ? `<div style="font-size:13px;color:${SLATE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${editorial.subtitle}</div>` : ""}
          </td></tr>
          <tr><td style="padding:18px 24px;background:${WHITE};">
            <p style="font-size:13px;line-height:1.8;color:${SLATE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 10px;">${(editorial.body || "").replace(/\n/g, "<br>")}</p>
            ${editorial.authorNote ? `<p style="font-size:12px;font-style:italic;color:${MUTED};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:10px 0 0;padding-top:10px;border-top:1px solid ${BORDER};">${editorial.authorNote}</p>` : ""}
          </td></tr>
        </table>
      </td>
    </tr>` : ""}

    ${startup ? `
    <!-- STARTUP DEL GIORNO -->
    <tr>
      <td style="border-top:1px solid ${BORDER};">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="background:${SURF1};padding:10px 24px;">
            <span style="font-size:9px;font-weight:700;color:${MUTED};letter-spacing:0.15em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">STARTUP DEL GIORNO</span>
            <span style="font-size:9px;color:${BORDER};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"> &mdash; </span>
            <span style="font-size:9px;font-weight:700;color:${ORANGE};letter-spacing:0.15em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${startup.category}</span>
          </td></tr>
          <tr><td style="padding:20px 24px 16px;border-left:4px solid ${ORANGE};background:${ORANGE_L};">
            <div style="font-size:20px;font-weight:900;color:${NAVY};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.2;margin-bottom:5px;">${startup.name}</div>
            <div style="font-size:13px;color:${SLATE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${startup.tagline}</div>
          </td></tr>
          <tr><td style="padding:18px 24px;background:${WHITE};">
            <p style="font-size:13px;line-height:1.8;color:${SLATE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 10px;">${startup.description}</p>
            <p style="font-size:11px;font-weight:700;color:${ORANGE};text-transform:uppercase;letter-spacing:0.1em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 5px;">Perché oggi?</p>
            <p style="font-size:13px;line-height:1.7;color:${SLATE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 12px;">${startup.whyToday}</p>
            ${startup.funding ? `<div style="margin-bottom:10px;"><span style="font-size:11px;font-weight:700;color:${ORANGE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9632; Funding: ${startup.funding}</span></div>` : ""}
            ${startup.aiScore ? `<div style="margin-bottom:14px;"><span style="font-size:11px;color:${MUTED};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">AI Score: <strong style="color:${ORANGE};">${startup.aiScore}/100</strong></span></div>` : ""}
            ${startup.websiteUrl ? `<table cellpadding="0" cellspacing="0" border="0"><tr><td style="background:${ORANGE};border-radius:8px;padding:11px 22px;"><a href="${startup.websiteUrl}" target="_blank" style="font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Visita il sito &rarr;</a></td></tr></table>` : ""}
          </td></tr>
        </table>
      </td>
    </tr>` : ""}

    ${reportages.length > 0 ? `
    <!-- REPORTAGE -->
    <tr>
      <td style="border-top:1px solid ${BORDER};">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="background:${SURF1};padding:12px 24px;">
            <span style="font-size:9px;font-weight:700;color:${TEAL};letter-spacing:0.15em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9670; Reportage Startup AI Italiane</span>
          </td></tr>
        </table>
      </td>
    </tr>
    <tr><td style="padding:0;background:${WHITE};">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">${reportageHtml}</table>
    </td></tr>` : ""}

    <!-- NEWS -->
    <tr>
      <td style="border-top:1px solid ${BORDER};">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="background:${SURF1};padding:12px 24px;">
            <span style="font-size:9px;font-weight:700;color:${TEAL};letter-spacing:0.15em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9670; Le ${news.length} Notizie AI del Giorno</span>
          </td></tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="background:${WHITE};">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">${newsHtml}</table>
      </td>
    </tr>

    ${analyses.length > 0 ? `
    <!-- ANALISI -->
    <tr>
      <td style="border-top:1px solid ${BORDER};">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="background:${SURF1};padding:12px 24px;">
            <span style="font-size:9px;font-weight:700;color:${BLUE};letter-spacing:0.15em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9670; Analisi di Mercato AI</span>
          </td></tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="background:${WHITE};">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">${analysesHtml}</table>
      </td>
    </tr>` : ""}

    <!-- CTA -->
    <tr>
      <td align="center" style="padding:32px 24px;background:${TEAL_L};border-top:1px solid ${BORDER};">
        <p style="font-size:18px;font-weight:900;color:${NAVY};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 8px;">Leggi tutte le news sul sito<br><span style="color:${TEAL};">AI4Business News</span></p>
        <p style="font-size:13px;color:${SLATE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 20px;">Aggiornato ogni giorno con le notizie AI più rilevanti per il business italiano.</p>
        <table cellpadding="0" cellspacing="0" border="0" align="center"><tr><td style="background:${TEAL};border-radius:8px;padding:14px 32px;"><a href="${baseUrl}" style="font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Vai al sito &rarr;</a></td></tr></table>
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td style="background:${SURF1};padding:24px 24px 28px;border-top:1px solid ${BORDER};">
        <p style="font-size:11px;color:${NAVY};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 8px;text-align:center;">
          <strong>IDEA<span style="color:${TEAL};">SMART</span></strong> &mdash; AI for Business &bull; &copy; 2026
        </p>
        <p style="font-size:10px;color:${MUTED};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 14px;text-align:center;line-height:1.7;">
          Hai ricevuto questa email perch&eacute; sei iscritto alla newsletter AI4Business News by IDEASMART.<br>
          Ai sensi del GDPR (Reg. UE 2016/679) puoi annullare l'iscrizione in qualsiasi momento.
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 12px;"><tr><td style="border-top:1px solid ${BORDER};font-size:0;line-height:0;">&nbsp;</td></tr></table>
        <p style="font-size:11px;color:${MUTED};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0;text-align:center;">
          <a href="${unsubLink}" style="color:${ORANGE};text-decoration:underline;font-weight:700;">Annulla iscrizione</a>
          &nbsp;&middot;&nbsp;
          <a href="${baseUrl}" style="color:${TEAL};text-decoration:none;">ideasmart.ai</a>
          &nbsp;&middot;&nbsp;
          <a href="mailto:info@ideasmart.ai" style="color:${TEAL};text-decoration:none;">info@ideasmart.ai</a>
        </p>
      </td>
    </tr>

    <!-- BOTTOM BAR -->
    <tr><td style="background:${TEAL};padding:0;height:3px;"></td></tr>

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

if (response.ok) {
  console.log(`✓ Newsletter di prova inviata con successo a ${TO_EMAIL}!`);
  console.log(`  News: ${news.length} | Reportage: ${reportages.length} | Analisi: ${analyses.length}`);
  console.log(`  Editoriale: ${editorial ? "✓" : "✗"} | Startup del giorno: ${startup ? "✓" : "✗"}`);
} else {
  const err = await response.text();
  console.error(`✗ Errore invio: ${response.status} ${response.statusText}`);
  console.error(err);
}
