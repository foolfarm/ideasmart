/**
 * IDEASMART — Scheduler Manager Centralizzato
 * ─────────────────────────────────────────────────────────────────────────────
 * Gestisce tutte le routine automatiche del sito con orari CET precisi.
 *
 * Routine configurate (tutti gli orari sono in CET/CEST — ora italiana):
 *
 *  ┌─────────────────────────────────────────────────────────────────────────┐
 *  │  AGGIORNAMENTO CONTENUTI — ogni giorno                                   │
 *  │  00:00 — News AI (20 notizie da scraping RSS reale)                     │
 *  │  00:05 — Editoriale AI del giorno + Startup del giorno                  │
 *  │  00:15 — 4 Reportage su startup AI italiane (ogni lunedì)               │
 *  │  00:20 — 4 Analisi di mercato AI (ogni lunedì)                          │
 *  │  00:30 — News musicali (20 notizie da scraping RSS reale)               │
 *  │  00:35 — Editoriale musicale + Artista della settimana                  │
 *  │  00:45 — 4 Reportage musicali (ogni lunedì)                             │
 *  │  00:50 — 4 Analisi mercato musicale (ogni lunedì)                       │
 *  │  01:00 — News Startup (20 notizie da scraping RSS reale)                │
 *  │  01:05 — Editoriale Startup + Startup della Settimana                   │
 *  │  01:15 — 4 Reportage Startup (ogni lunedì)                              │
 *  │  01:20 — 4 Analisi Mercato Startup (ogni lunedì)                        │
 *  │                                                                          │
 *  │  AUDIT NOTTURNO — ogni giorno                                            │
 *  │  02:00 — Audit URL notizie: verifica raggiungibilità e sostituisce      │
 *  │          le notizie con link non validi con notizie fresche da RSS       │
 *  │                                                                          │
 *  │  NEWSLETTER — solo lunedì                                                │
 *  │  Lunedì 07:30 — Newsletter di TEST a ac@acinelli.com (preview)          │
 *  │  Lunedì 09:30 — Newsletter MASSIVA a tutti gli iscritti attivi          │
 *  └─────────────────────────────────────────────────────────────────────────┘
 *
 * node-cron usa il fuso orario del server. Il server gira in UTC.
 * CET = UTC+1 (inverno), CEST = UTC+2 (estate).
 * Usiamo timezone: "Europe/Rome" per gestire automaticamente l'ora legale.
 */

import cron from "node-cron";
import { refreshAINewsFromRSS, refreshMusicNewsFromRSS, refreshStartupNewsFromRSS, refreshFinanceNewsFromRSS, refreshHealthNewsFromRSS, refreshSportNewsFromRSS, refreshLuxuryNewsFromRSS } from "./rssNewsScheduler";
import { generateFinanceEditorial, generateFinanceDealOfWeek, generateFinanceReportage, generateFinanceMarketAnalysis } from "./financeScheduler";
import { generateHealthEditorial, generateHealthDealOfWeek, generateHealthReportage, generateHealthMarketAnalysis } from "./healthScheduler";
import { generateSportEditorial, generateSportDealOfWeek, generateSportReportage, generateSportMarketAnalysis } from "./sportScheduler";
import { generateLuxuryEditorial, generateLuxuryDealOfWeek, generateLuxuryReportage, generateLuxuryMarketAnalysis } from "./luxuryScheduler";
import { runDailyContentRefresh } from "./dailyContentScheduler";
import { generateWeeklyReportage } from "./weeklyReportageScheduler";
import { generateMarketAnalysis } from "./marketAnalysisScheduler";
import { sendWeeklyNewsletter } from "./newsletterScheduler";
import {
  generateMusicEditorial,
  generateArtistOfWeek,
  generateMusicReportage,
  generateMusicMarketAnalysis,
} from "./musicScheduler";
import { sendItsMusicNewsletter } from "./musicNewsletterScheduler";
import {
  generateStartupEditorial,
  generateStartupOfWeek,
  generateStartupReportage,
  generateStartupMarketAnalysis,
} from "./startupScheduler";
import { sendTestNewsletter } from "./newsletterTestSender";
import { runNightlyAudit } from "./nightlyAuditScheduler";
import { publishDailyLinkedInPosts } from "./linkedinPublisher";

const TZ = "Europe/Rome";

// ─── Chiavi per evitare doppi invii ──────────────────────────────────────────
let lastNewsletterSentKey: string | null = null;
let lastMusicNewsletterSentKey: string | null = null;
let lastTestNewsletterSentKey: string | null = null;

function getWeekKey(): string {
  const now = new Date();
  const d = new Date(now.toLocaleString("en-US", { timeZone: TZ }));
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

// ─── Avvio scheduler ─────────────────────────────────────────────────────────
export function startAllSchedulers(): void {
  console.log("[SchedulerManager] 🚀 Avvio di tutti gli scheduler automatici...");
  console.log("[SchedulerManager] Fuso orario: Europe/Rome (CET/CEST)");

  // ══════════════════════════════════════════════════════════════════════════
  // SEZIONE /ai — AI4Business News
  // ══════════════════════════════════════════════════════════════════════════

  // ── 1. NEWS AI — ogni giorno alle 00:00 CET (SCRAPING RSS REALE) ──────────
  cron.schedule("0 0 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 00:00 CET — Avvio scraping RSS News AI (fonti reali)...");
    try {
      await refreshAINewsFromRSS();
      console.log("[SchedulerManager] ✅ News AI aggiornate da fonti RSS reali");
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore scraping RSS News AI:", err);
    }
  }, { timezone: TZ });

  // ── 2. EDITORIALE AI + STARTUP DEL GIORNO — ogni giorno alle 00:05 CET ──
  cron.schedule("5 0 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 00:05 CET — Avvio Editoriale AI + Startup del giorno...");
    try {
      await runDailyContentRefresh();
      console.log("[SchedulerManager] ✅ Editoriale e Startup del giorno aggiornati");
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore Editoriale/Startup AI:", err);
    }
  }, { timezone: TZ });

  // ── 3. REPORTAGE AI — ogni lunedì alle 00:15 CET ─────────────────────────
  cron.schedule("15 0 * * 1", async () => {
    console.log("[SchedulerManager] ⏰ Lunedì 00:15 CET — Avvio generazione Reportage AI...");
    try {
      await generateWeeklyReportage();
      console.log("[SchedulerManager] ✅ Reportage AI generati con successo");
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore generazione Reportage AI:", err);
    }
  }, { timezone: TZ });

  // ── 4. ANALISI DI MERCATO AI — ogni lunedì alle 00:20 CET ────────────────
  cron.schedule("20 0 * * 1", async () => {
    console.log("[SchedulerManager] ⏰ Lunedì 00:20 CET — Avvio generazione Analisi di Mercato AI...");
    try {
      await generateMarketAnalysis();
      console.log("[SchedulerManager] ✅ Analisi di Mercato AI generate con successo");
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore generazione Analisi di Mercato AI:", err);
    }
  }, { timezone: TZ });

  // ══════════════════════════════════════════════════════════════════════════
  // SEZIONE /music — ITsMusic
  // ══════════════════════════════════════════════════════════════════════════

  // ── 5. NEWS MUSICALI — ogni giorno alle 00:30 CET (SCRAPING RSS REALE) ─────
  cron.schedule("30 0 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 00:30 CET — Avvio scraping RSS News Musicali (fonti reali)...");
    try {
      await refreshMusicNewsFromRSS();
      console.log("[SchedulerManager] ✅ News Musicali aggiornate da fonti RSS reali");
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore scraping RSS News Musicali:", err);
    }
  }, { timezone: TZ });

  // ── 6. EDITORIALE MUSICALE + ARTISTA — ogni giorno alle 00:35 CET ────────
  cron.schedule("35 0 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 00:35 CET — Avvio Editoriale Musicale + Artista della settimana...");
    try {
      await generateMusicEditorial();
      await generateArtistOfWeek();
      console.log("[SchedulerManager] ✅ Editoriale Musicale e Artista aggiornati");
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore Editoriale/Artista Musicale:", err);
    }
  }, { timezone: TZ });

  // ── 7. REPORTAGE MUSICALI — ogni lunedì alle 00:45 CET ───────────────────
  cron.schedule("45 0 * * 1", async () => {
    console.log("[SchedulerManager] ⏰ Lunedì 00:45 CET — Avvio generazione Reportage Musicali...");
    try {
      await generateMusicReportage();
      console.log("[SchedulerManager] ✅ Reportage Musicali generati con successo");
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore generazione Reportage Musicali:", err);
    }
  }, { timezone: TZ });

  // ── 8. ANALISI MERCATO MUSICALE — ogni lunedì alle 00:50 CET ─────────────
  cron.schedule("50 0 * * 1", async () => {
    console.log("[SchedulerManager] ⏰ Lunedì 00:50 CET — Avvio generazione Analisi Mercato Musicale...");
    try {
      await generateMusicMarketAnalysis();
      console.log("[SchedulerManager] ✅ Analisi Mercato Musicale generate con successo");
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore generazione Analisi Mercato Musicale:", err);
    }
  }, { timezone: TZ });

  // ══════════════════════════════════════════════════════════════════════════
  // SEZIONE /startup — Startup News
  // ══════════════════════════════════════════════════════════════════════════

  // ── 9. NEWS STARTUP — ogni giorno alle 01:00 CET (SCRAPING RSS REALE) ──────
  cron.schedule("0 1 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 01:00 CET — Avvio scraping RSS Startup News (fonti reali)...");
    try {
      await refreshStartupNewsFromRSS();
      console.log("[SchedulerManager] ✅ Startup News aggiornate da fonti RSS reali");
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore scraping RSS Startup News:", err);
    }
  }, { timezone: TZ });

  // ── 10. EDITORIALE STARTUP + STARTUP DELLA SETTIMANA — ogni giorno alle 01:05 CET ──
  cron.schedule("5 1 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 01:05 CET — Avvio Editoriale Startup + Startup della Settimana...");
    try {
      await generateStartupEditorial();
      await generateStartupOfWeek();
      console.log("[SchedulerManager] ✅ Editoriale Startup e Startup della Settimana aggiornati");
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore Editoriale/Startup della Settimana:", err);
    }
  }, { timezone: TZ });

  // ── 11. REPORTAGE STARTUP — ogni lunedì alle 01:15 CET ───────────────────
  cron.schedule("15 1 * * 1", async () => {
    console.log("[SchedulerManager] ⏰ Lunedì 01:15 CET — Avvio generazione Reportage Startup...");
    try {
      await generateStartupReportage();
      console.log("[SchedulerManager] ✅ Reportage Startup generati con successo");
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore generazione Reportage Startup:", err);
    }
  }, { timezone: TZ });

  // ── 12. ANALISI MERCATO STARTUP — ogni lunedì alle 01:20 CET ─────────────
  cron.schedule("20 1 * * 1", async () => {
    console.log("[SchedulerManager] ⏰ Lunedì 01:20 CET — Avvio generazione Analisi Mercato Startup...");
    try {
      await generateStartupMarketAnalysis();
      console.log("[SchedulerManager] ✅ Analisi Mercato Startup generate con successo");
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore generazione Analisi Mercato Startup:", err);
    }
  }, { timezone: TZ });

  // ═════════════════════════════════════════════════════════════  // ══════════════════════════════════════════════════════════════════════════
  // SEZIONE /finance — Finance & Markets
  // ══════════════════════════════════════════════════════════════════════════
  cron.schedule("30 1 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 01:30 CET — Avvio scraping Finance news...");
    try { await refreshFinanceNewsFromRSS(); } catch (err) { console.error("[SchedulerManager] ❌ Finance news:", err); }
  }, { timezone: TZ });
  cron.schedule("35 1 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 01:35 CET — Avvio editoriale Finance...");
    try { await generateFinanceEditorial(); await generateFinanceDealOfWeek(); } catch (err) { console.error("[SchedulerManager] ❌ Finance editorial:", err); }
  }, { timezone: TZ });
  cron.schedule("45 1 * * 1", async () => {
    try { await generateFinanceReportage(); } catch (err) { console.error("[SchedulerManager] ❌ Finance reportage:", err); }
  }, { timezone: TZ });
  cron.schedule("50 1 * * 1", async () => {
    try { await generateFinanceMarketAnalysis(); } catch (err) { console.error("[SchedulerManager] ❌ Finance market analysis:", err); }
  }, { timezone: TZ });

  // ══════════════════════════════════════════════════════════════════════════
  // SEZIONE /health — Health & Biotech
  // ══════════════════════════════════════════════════════════════════════════
  cron.schedule("15 2 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 02:15 CET — Avvio scraping Health news...");
    try { await refreshHealthNewsFromRSS(); } catch (err) { console.error("[SchedulerManager] ❌ Health news:", err); }
  }, { timezone: TZ });
  cron.schedule("20 2 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 02:20 CET — Avvio editoriale Health...");
    try { await generateHealthEditorial(); await generateHealthDealOfWeek(); } catch (err) { console.error("[SchedulerManager] ❌ Health editorial:", err); }
  }, { timezone: TZ });
  cron.schedule("30 2 * * 1", async () => {
    try { await generateHealthReportage(); } catch (err) { console.error("[SchedulerManager] ❌ Health reportage:", err); }
  }, { timezone: TZ });
  cron.schedule("35 2 * * 1", async () => {
    try { await generateHealthMarketAnalysis(); } catch (err) { console.error("[SchedulerManager] ❌ Health market analysis:", err); }
  }, { timezone: TZ });

  // ══════════════════════════════════════════════════════════════════════════
  // SEZIONE /sport — Sport & Business
  // ══════════════════════════════════════════════════════════════════════════
  cron.schedule("45 2 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 02:45 CET — Avvio scraping Sport news...");
    try { await refreshSportNewsFromRSS(); } catch (err) { console.error("[SchedulerManager] ❌ Sport news:", err); }
  }, { timezone: TZ });
  cron.schedule("50 2 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 02:50 CET — Avvio editoriale Sport...");
    try { await generateSportEditorial(); await generateSportDealOfWeek(); } catch (err) { console.error("[SchedulerManager] ❌ Sport editorial:", err); }
  }, { timezone: TZ });
  cron.schedule("55 2 * * 1", async () => {
    try { await generateSportReportage(); } catch (err) { console.error("[SchedulerManager] ❌ Sport reportage:", err); }
  }, { timezone: TZ });
  cron.schedule("58 2 * * 1", async () => {
    try { await generateSportMarketAnalysis(); } catch (err) { console.error("[SchedulerManager] ❌ Sport market analysis:", err); }
  }, { timezone: TZ });

  // ══════════════════════════════════════════════════════════════════════════
  // SEZIONE /luxury — Lifestyle & Luxury
  // ══════════════════════════════════════════════════════════════════════════
  cron.schedule("5 3 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 03:05 CET — Avvio scraping Luxury news...");
    try { await refreshLuxuryNewsFromRSS(); } catch (err) { console.error("[SchedulerManager] ❌ Luxury news:", err); }
  }, { timezone: TZ });
  cron.schedule("10 3 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 03:10 CET — Avvio editoriale Luxury...");
    try { await generateLuxuryEditorial(); await generateLuxuryDealOfWeek(); } catch (err) { console.error("[SchedulerManager] ❌ Luxury editorial:", err); }
  }, { timezone: TZ });
  cron.schedule("20 3 * * 1", async () => {
    try { await generateLuxuryReportage(); } catch (err) { console.error("[SchedulerManager] ❌ Luxury reportage:", err); }
  }, { timezone: TZ });
  cron.schedule("25 3 * * 1", async () => {
    try { await generateLuxuryMarketAnalysis(); } catch (err) { console.error("[SchedulerManager] ❌ Luxury market analysis:", err); }
  }, { timezone: TZ });

  // ══════════
  // AUDIT NOTTURNO — ogni giorno alle 02:00 CET // ══════════════════════════════════════════════════════════════════════════

  // ── 13. AUDIT NOTTURNO — ogni giorno alle 02:00 CET ──────────────────────
  // Verifica raggiungibilità URL di tutte le notizie.
  // Sostituisce le notizie con link non validi con notizie fresche da RSS.
  cron.schedule("0 2 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 02:00 CET — Avvio audit notturno URL notizie...");
    try {
      await runNightlyAudit();
      console.log("[SchedulerManager] ✅ Audit notturno completato");
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore audit notturno:", err);
    }
  }, { timezone: TZ });

  // ══════════════════════════════════════════════════════════════════════════
  // NEWSLETTER — solo lunedì
  // ══════════════════════════════════════════════════════════════════════════

  // ── 14. NEWSLETTER TEST — ogni lunedì alle 07:30 CET ─────────────────────
  // Invia una newsletter di test a ac@acinelli.com con i contenuti reali dal DB.
  // Permette la valutazione del contenuto prima dell'invio massivo alle 09:30.
  cron.schedule("30 7 * * 1", async () => {
    const weekKey = getWeekKey();
    const testKey = `test-${weekKey}`;

    console.log("[SchedulerManager] ⏰ Lunedì 07:30 CET — Invio newsletter di TEST a ac@acinelli.com...");

    if (lastTestNewsletterSentKey === testKey) {
      console.log(`[SchedulerManager] ⏭️ Newsletter di test già inviata per ${weekKey}, skip`);
      return;
    }

    try {
      lastTestNewsletterSentKey = testKey;
      await sendTestNewsletter();
      console.log("[SchedulerManager] ✅ Newsletter di test inviata a ac@acinelli.com");
    } catch (err) {
      lastTestNewsletterSentKey = null; // reset per permettere retry
      console.error("[SchedulerManager] ❌ Errore invio newsletter di test:", err);
    }
  }, { timezone: TZ });

  // ── 15. NEWSLETTER MASSIVA — ogni lunedì alle 09:30 CET ──────────────────
  // Invia la newsletter a tutti gli iscritti attivi (AI4Business + ITsMusic).
  // Spostato da 10:00 a 09:30 come richiesto.
  cron.schedule("30 9 * * 1", async () => {
    const weekKey = getWeekKey();
    const sendKey = `${weekKey}-monday`;

    console.log("[SchedulerManager] ⏰ Lunedì 09:30 CET — Verifica invio Newsletter massiva...");

    if (lastNewsletterSentKey === sendKey) {
      console.log(`[SchedulerManager] ⏭️ Newsletter già inviata per ${sendKey}, skip`);
      return;
    }

    // Invia AI4Business News
    try {
      lastNewsletterSentKey = sendKey;
      await sendWeeklyNewsletter();
      console.log("[SchedulerManager] ✅ AI4Business News inviata con successo (Lunedì 09:30)");
    } catch (err) {
      lastNewsletterSentKey = null;
      console.error("[SchedulerManager] ❌ Errore invio AI4Business News:", err);
    }

    // Invia ITsMusic
    if (lastMusicNewsletterSentKey === sendKey) {
      console.log(`[SchedulerManager] ⏭️ ITsMusic già inviata per ${sendKey}, skip`);
      return;
    }
    try {
      lastMusicNewsletterSentKey = sendKey;
      await sendItsMusicNewsletter();
      console.log("[SchedulerManager] ✅ ITsMusic inviata con successo (Lunedì 09:30)");
    } catch (err) {
      lastMusicNewsletterSentKey = null;
      console.error("[SchedulerManager] ❌ Errore invio ITsMusic:", err);
    }
  }, { timezone: TZ });

  // ══════════════════════════════════════════════════════════════════════════
  // LINKEDIN AUTOPOST — ogni giorno alle 10:00 CET
  // ══════════════════════════════════════════════════════════════════════════

  // ── 16. LINKEDIN AUTOPOST — ogni giorno alle 10:00 CET ───────────────────
  // Pubblica 1 post editoriale giornaliero su LinkedIn (AI o Startup in alternanza).
  // Testo generato con LLM — tono HumanLess, analisi da senior analyst. Immagine da Pexels.
  // Token LinkedIn scade ogni 2 mesi — aggiornare in Secrets.
  cron.schedule("0 10 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 10:00 CET — Avvio pubblicazione LinkedIn editoriale del giorno...");
    try {
      const result = await publishDailyLinkedInPosts();
      console.log(`[SchedulerManager] ✅ LinkedIn: ${result.published}/1 post pubblicati`);
      if (result.errors.length > 0) {
        console.error("[SchedulerManager] ⚠️ LinkedIn errori:", result.errors);
      }
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore pubblicazione LinkedIn:", err);
    }
  }, { timezone: TZ });

  // ── Log riepilogo ─────────────────────────────────────────────────────────
  console.log("[SchedulerManager] ✅ Tutti gli scheduler attivi:");
  console.log("[SchedulerManager]   📰 News AI          → ogni giorno alle 00:00 CET (scraping RSS reale)");
  console.log("[SchedulerManager]   ✍️  Editoriale AI    → ogni giorno alle 00:05 CET");
  console.log("[SchedulerManager]   🏢 Reportage AI     → ogni lunedì alle 00:15 CET");
  console.log("[SchedulerManager]   📊 Analisi AI       → ogni lunedì alle 00:20 CET");
  console.log("[SchedulerManager]   🎸 News Musica      → ogni giorno alle 00:30 CET (scraping RSS reale)");
  console.log("[SchedulerManager]   🎵 Editoriale Music → ogni giorno alle 00:35 CET");
  console.log("[SchedulerManager]   🎤 Reportage Music  → ogni lunedì alle 00:45 CET");
  console.log("[SchedulerManager]   🎼 Analisi Music    → ogni lunedì alle 00:50 CET");
  console.log("[SchedulerManager]   🚀 News Startup     → ogni giorno alle 01:00 CET (scraping RSS reale)");
  console.log("[SchedulerManager]   ✍️  Editoriale Startup → ogni giorno alle 01:05 CET");
  console.log("[SchedulerManager]   🏢 Reportage Startup → ogni lunedì alle 01:15 CET");
  console.log("[SchedulerManager]   📊 Analisi Startup  → ogni lunedì alle 01:20 CET");
  console.log("[SchedulerManager]   🌙 Audit notturno   → ogni giorno alle 02:00 CET (verifica URL + sostituzione)");
  console.log("[SchedulerManager]   🧪 Newsletter TEST  → ogni lunedì alle 08:30 CET → ac@acinelli.com");
  console.log("[SchedulerManager]   📧 Newsletter       → ogni lunedì alle 09:30 CET (invio massivo)");
  console.log("[SchedulerManager]   💼 LinkedIn Autopost → ogni giorno alle 10:00 CET (editoriale AI/Startup — tono HumanLess, analisi da senior analyst)");
}
