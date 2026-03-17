/**
 * IDEASMART — Scheduler Manager Centralizzato
 * ─────────────────────────────────────────────────────────────────────────────
 * Gestisce tutte le routine automatiche del sito con orari CET precisi.
 *
 * Routine configurate (tutti gli orari sono in CET/CEST — ora italiana):
 *
 *  ┌─────────────────────────────────────────────────────────────────────────┐
 *  │  AGGIORNAMENTO CONTENUTI — ogni giorno (tutti i 7 canali)               │
 *  │  00:00 — News AI (scraping RSS reale)                                   │
 *  │  00:05 — Editoriale AI + Startup del giorno                             │
 *  │  00:15 — Reportage AI (ogni lunedì)                                     │
 *  │  00:20 — Analisi di mercato AI (ogni lunedì)                            │
 *  │  00:30 — News Musicali (scraping RSS reale)                             │
 *  │  00:35 — Editoriale Music + Artista della settimana                     │
 *  │  00:45 — Reportage Music (ogni lunedì)                                  │
 *  │  00:50 — Analisi mercato Music (ogni lunedì)                            │
 *  │  01:00 — News Startup (scraping RSS reale)                              │
 *  │  01:05 — Editoriale Startup + Startup della Settimana                   │
 *  │  01:15 — Reportage Startup (ogni lunedì)                                │
 *  │  01:20 — Analisi Mercato Startup (ogni lunedì)                          │
 *  │  01:30 — News Finance (scraping RSS reale)                              │
 *  │  01:35 — Editoriale Finance + Deal of Week                              │
 *  │  01:45 — Reportage Finance (ogni lunedì)                                │
 *  │  01:50 — Analisi Finance (ogni lunedì)                                  │
 *  │  02:00 — Audit notturno URL notizie                                     │
 *  │  02:15 — News Health (scraping RSS reale)                               │
 *  │  02:20 — Editoriale Health + Deal of Week                               │
 *  │  02:30 — Reportage Health (ogni lunedì)                                 │
 *  │  02:35 — Analisi Health (ogni lunedì)                                   │
 *  │  02:45 — News Sport (scraping RSS reale)                                │
 *  │  02:50 — Editoriale Sport + Deal of Week                                │
 *  │  02:55 — Reportage Sport (ogni lunedì)                                  │
 *  │  02:58 — Analisi Sport (ogni lunedì)                                    │
 *  │  03:05 — News Luxury (scraping RSS reale)                               │
 *  │  03:10 — Editoriale Luxury + Deal of Week                               │
 *  │  03:20 — Reportage Luxury (ogni lunedì)                                 │
 *  │  03:25 — Analisi Luxury (ogni lunedì)                                   │
 *  │                                                                          │
 *  │  NEWSLETTER GIORNALIERA PER CANALE                                       │
 *  │  Lunedì    07:00 — Preview AI4Business → info@ideasmart.ai              │
 *  │  Lunedì    07:30 — Newsletter AI4Business → tutti gli iscritti          │
 *  │  Martedì   07:00 — Preview Startup → info@ideasmart.ai                  │
 *  │  Martedì   07:30 — Newsletter Startup → tutti gli iscritti              │
 *  │  Mercoledì 07:00 — Preview Finance → info@ideasmart.ai                  │
 *  │  Mercoledì 07:30 — Newsletter Finance → tutti gli iscritti              │
 *  │  Giovedì   07:00 — Preview Sport → info@ideasmart.ai                    │
 *  │  Giovedì   07:30 — Newsletter Sport → tutti gli iscritti                │
 *  │  Venerdì   07:00 — Preview ITsMusic → info@ideasmart.ai                 │
 *  │  Venerdì   07:30 — Newsletter ITsMusic → tutti gli iscritti             │
 *  │  Sabato    07:00 — Preview Luxury → info@ideasmart.ai                   │
 *  │  Sabato    07:30 — Newsletter Luxury → tutti gli iscritti               │
 *  │  Domenica  07:00 — Preview Health → info@ideasmart.ai                   │
 *  │  Domenica  07:30 — Newsletter Health → tutti gli iscritti               │
 *  │                                                                          │
 *  │  LINKEDIN AUTOPOST + PUNTO DEL GIORNO — ogni giorno                      │
 *  │  10:00 — Post editoriale AI/Startup su LinkedIn                         │
 *  │          → salva automaticamente il testo nel DB (tabella linkedin_posts)│
 *  │          → alimenta la sezione "Punto del Giorno" nella Home             │
 *  └─────────────────────────────────────────────────────────────────────────┘
 *
 * node-cron usa il fuso orario del server. Il server gira in UTC.
 * CET = UTC+1 (inverno), CEST = UTC+2 (estate).
 * Usiamo timezone: "Europe/Rome" per gestire automaticamente l'ora legale.
 */

import cron from "node-cron";
import { refreshAINewsFromRSS, refreshMusicNewsFromRSS, refreshStartupNewsFromRSS, refreshFinanceNewsFromRSS, refreshHealthNewsFromRSS, refreshSportNewsFromRSS, refreshLuxuryNewsFromRSS, refreshGossipNewsFromRSS, refreshCybersecurityNewsFromRSS, refreshSondaggiNewsFromRSS } from "./rssNewsScheduler";
import { generateFinanceEditorial, generateFinanceDealOfWeek, generateFinanceReportage, generateFinanceMarketAnalysis } from "./financeScheduler";
import { generateHealthEditorial, generateHealthDealOfWeek, generateHealthReportage, generateHealthMarketAnalysis } from "./healthScheduler";
import { generateSportEditorial, generateSportDealOfWeek, generateSportReportage, generateSportMarketAnalysis } from "./sportScheduler";
import { generateLuxuryEditorial, generateLuxuryDealOfWeek, generateLuxuryReportage, generateLuxuryMarketAnalysis } from "./luxuryScheduler";
import { runDailyContentRefresh } from "./dailyContentScheduler";
import { generateWeeklyReportage } from "./weeklyReportageScheduler";
import { generateMarketAnalysis } from "./marketAnalysisScheduler";
import {
  generateMusicEditorial,
  generateArtistOfWeek,
  generateMusicReportage,
  generateMusicMarketAnalysis,
} from "./musicScheduler";
import {
  generateStartupEditorial,
  generateStartupOfWeek,
  generateStartupReportage,
  generateStartupMarketAnalysis,
} from "./startupScheduler";
import { runNightlyAudit } from "./nightlyAuditScheduler";
import { publishDailyLinkedInPosts } from "./linkedinPublisher";
import { sendDailyChannelPreview, sendDailyChannelNewsletter } from "./dailyChannelNewsletter";

const TZ = "Europe/Rome";

// ─── Chiavi per evitare doppi invii ──────────────────────────────────────────
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

  cron.schedule("0 0 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 00:00 CET — Avvio scraping RSS News AI...");
    try { await refreshAINewsFromRSS(); console.log("[SchedulerManager] ✅ News AI aggiornate"); }
    catch (err) { console.error("[SchedulerManager] ❌ News AI:", err); }
  }, { timezone: TZ });

  cron.schedule("5 0 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 00:05 CET — Editoriale AI + Startup del giorno...");
    try { await runDailyContentRefresh(); console.log("[SchedulerManager] ✅ Editoriale e Startup AI aggiornati"); }
    catch (err) { console.error("[SchedulerManager] ❌ Editoriale/Startup AI:", err); }
  }, { timezone: TZ });

  cron.schedule("15 0 * * 1", async () => {
    console.log("[SchedulerManager] ⏰ Lunedì 00:15 CET — Reportage AI...");
    try { await generateWeeklyReportage(); console.log("[SchedulerManager] ✅ Reportage AI generati"); }
    catch (err) { console.error("[SchedulerManager] ❌ Reportage AI:", err); }
  }, { timezone: TZ });

  cron.schedule("20 0 * * 1", async () => {
    console.log("[SchedulerManager] ⏰ Lunedì 00:20 CET — Analisi Mercato AI...");
    try { await generateMarketAnalysis(); console.log("[SchedulerManager] ✅ Analisi Mercato AI generate"); }
    catch (err) { console.error("[SchedulerManager] ❌ Analisi Mercato AI:", err); }
  }, { timezone: TZ });

  // ══════════════════════════════════════════════════════════════════════════
  // SEZIONE /music — ITsMusic
  // ══════════════════════════════════════════════════════════════════════════

  cron.schedule("30 0 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 00:30 CET — Avvio scraping RSS News Musicali...");
    try { await refreshMusicNewsFromRSS(); console.log("[SchedulerManager] ✅ News Musicali aggiornate"); }
    catch (err) { console.error("[SchedulerManager] ❌ News Musicali:", err); }
  }, { timezone: TZ });

  cron.schedule("35 0 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 00:35 CET — Editoriale Music + Artista...");
    try { await generateMusicEditorial(); await generateArtistOfWeek(); console.log("[SchedulerManager] ✅ Editoriale Music aggiornato"); }
    catch (err) { console.error("[SchedulerManager] ❌ Editoriale Music:", err); }
  }, { timezone: TZ });

  cron.schedule("45 0 * * 1", async () => {
    try { await generateMusicReportage(); console.log("[SchedulerManager] ✅ Reportage Music generati"); }
    catch (err) { console.error("[SchedulerManager] ❌ Reportage Music:", err); }
  }, { timezone: TZ });

  cron.schedule("50 0 * * 1", async () => {
    try { await generateMusicMarketAnalysis(); console.log("[SchedulerManager] ✅ Analisi Music generate"); }
    catch (err) { console.error("[SchedulerManager] ❌ Analisi Music:", err); }
  }, { timezone: TZ });

  // ══════════════════════════════════════════════════════════════════════════
  // SEZIONE /startup — Startup News
  // ══════════════════════════════════════════════════════════════════════════

  cron.schedule("0 1 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 01:00 CET — Avvio scraping RSS Startup News...");
    try { await refreshStartupNewsFromRSS(); console.log("[SchedulerManager] ✅ Startup News aggiornate"); }
    catch (err) { console.error("[SchedulerManager] ❌ Startup News:", err); }
  }, { timezone: TZ });

  cron.schedule("5 1 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 01:05 CET — Editoriale Startup + Startup della Settimana...");
    try { await generateStartupEditorial(); await generateStartupOfWeek(); console.log("[SchedulerManager] ✅ Editoriale Startup aggiornato"); }
    catch (err) { console.error("[SchedulerManager] ❌ Editoriale Startup:", err); }
  }, { timezone: TZ });

  cron.schedule("15 1 * * 1", async () => {
    try { await generateStartupReportage(); console.log("[SchedulerManager] ✅ Reportage Startup generati"); }
    catch (err) { console.error("[SchedulerManager] ❌ Reportage Startup:", err); }
  }, { timezone: TZ });

  cron.schedule("20 1 * * 1", async () => {
    try { await generateStartupMarketAnalysis(); console.log("[SchedulerManager] ✅ Analisi Startup generate"); }
    catch (err) { console.error("[SchedulerManager] ❌ Analisi Startup:", err); }
  }, { timezone: TZ });

  // ══════════════════════════════════════════════════════════════════════════
  // SEZIONE /finance — Finance & Markets
  // ══════════════════════════════════════════════════════════════════════════

  cron.schedule("30 1 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 01:30 CET — Avvio scraping Finance news...");
    try { await refreshFinanceNewsFromRSS(); console.log("[SchedulerManager] ✅ Finance news aggiornate"); }
    catch (err) { console.error("[SchedulerManager] ❌ Finance news:", err); }
  }, { timezone: TZ });

  cron.schedule("35 1 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 01:35 CET — Editoriale Finance...");
    try { await generateFinanceEditorial(); await generateFinanceDealOfWeek(); console.log("[SchedulerManager] ✅ Editoriale Finance aggiornato"); }
    catch (err) { console.error("[SchedulerManager] ❌ Finance editorial:", err); }
  }, { timezone: TZ });

  cron.schedule("45 1 * * 1", async () => {
    try { await generateFinanceReportage(); console.log("[SchedulerManager] ✅ Reportage Finance generati"); }
    catch (err) { console.error("[SchedulerManager] ❌ Finance reportage:", err); }
  }, { timezone: TZ });

  cron.schedule("50 1 * * 1", async () => {
    try { await generateFinanceMarketAnalysis(); console.log("[SchedulerManager] ✅ Analisi Finance generate"); }
    catch (err) { console.error("[SchedulerManager] ❌ Finance market analysis:", err); }
  }, { timezone: TZ });

  // ══════════════════════════════════════════════════════════════════════════
  // AUDIT NOTTURNO — ogni giorno alle 02:00 CET
  // ══════════════════════════════════════════════════════════════════════════

  cron.schedule("0 2 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 02:00 CET — Audit notturno URL notizie...");
    try { await runNightlyAudit(); console.log("[SchedulerManager] ✅ Audit notturno completato"); }
    catch (err) { console.error("[SchedulerManager] ❌ Audit notturno:", err); }
  }, { timezone: TZ });

  // ══════════════════════════════════════════════════════════════════════════
  // SEZIONE /health — Health & Biotech
  // ══════════════════════════════════════════════════════════════════════════

  cron.schedule("15 2 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 02:15 CET — Avvio scraping Health news...");
    try { await refreshHealthNewsFromRSS(); console.log("[SchedulerManager] ✅ Health news aggiornate"); }
    catch (err) { console.error("[SchedulerManager] ❌ Health news:", err); }
  }, { timezone: TZ });

  cron.schedule("20 2 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 02:20 CET — Editoriale Health...");
    try { await generateHealthEditorial(); await generateHealthDealOfWeek(); console.log("[SchedulerManager] ✅ Editoriale Health aggiornato"); }
    catch (err) { console.error("[SchedulerManager] ❌ Health editorial:", err); }
  }, { timezone: TZ });

  cron.schedule("30 2 * * 1", async () => {
    try { await generateHealthReportage(); console.log("[SchedulerManager] ✅ Reportage Health generati"); }
    catch (err) { console.error("[SchedulerManager] ❌ Health reportage:", err); }
  }, { timezone: TZ });

  cron.schedule("35 2 * * 1", async () => {
    try { await generateHealthMarketAnalysis(); console.log("[SchedulerManager] ✅ Analisi Health generate"); }
    catch (err) { console.error("[SchedulerManager] ❌ Health market analysis:", err); }
  }, { timezone: TZ });

  // ══════════════════════════════════════════════════════════════════════════
  // SEZIONE /sport — Sport & Business
  // ══════════════════════════════════════════════════════════════════════════

  cron.schedule("45 2 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 02:45 CET — Avvio scraping Sport news...");
    try { await refreshSportNewsFromRSS(); console.log("[SchedulerManager] ✅ Sport news aggiornate"); }
    catch (err) { console.error("[SchedulerManager] ❌ Sport news:", err); }
  }, { timezone: TZ });

  cron.schedule("50 2 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 02:50 CET — Editoriale Sport...");
    try { await generateSportEditorial(); await generateSportDealOfWeek(); console.log("[SchedulerManager] ✅ Editoriale Sport aggiornato"); }
    catch (err) { console.error("[SchedulerManager] ❌ Sport editorial:", err); }
  }, { timezone: TZ });

  cron.schedule("55 2 * * 1", async () => {
    try { await generateSportReportage(); console.log("[SchedulerManager] ✅ Reportage Sport generati"); }
    catch (err) { console.error("[SchedulerManager] ❌ Sport reportage:", err); }
  }, { timezone: TZ });

  cron.schedule("58 2 * * 1", async () => {
    try { await generateSportMarketAnalysis(); console.log("[SchedulerManager] ✅ Analisi Sport generate"); }
    catch (err) { console.error("[SchedulerManager] ❌ Sport market analysis:", err); }
  }, { timezone: TZ });

  // ══════════════════════════════════════════════════════════════════════════
  // SEZIONE /luxury — Lifestyle & Luxury
  // ══════════════════════════════════════════════════════════════════════════

  cron.schedule("5 3 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 03:05 CET — Avvio scraping Luxury news...");
    try { await refreshLuxuryNewsFromRSS(); console.log("[SchedulerManager] ✅ Luxury news aggiornate"); }
    catch (err) { console.error("[SchedulerManager] ❌ Luxury news:", err); }
  }, { timezone: TZ });

  cron.schedule("10 3 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 03:10 CET — Editoriale Luxury...");
    try { await generateLuxuryEditorial(); await generateLuxuryDealOfWeek(); console.log("[SchedulerManager] ✅ Editoriale Luxury aggiornato"); }
    catch (err) { console.error("[SchedulerManager] ❌ Luxury editorial:", err); }
  }, { timezone: TZ });

  cron.schedule("20 3 * * 1", async () => {
    try { await generateLuxuryReportage(); console.log("[SchedulerManager] ✅ Reportage Luxury generati"); }
    catch (err) { console.error("[SchedulerManager] ❌ Luxury reportage:", err); }
  }, { timezone: TZ });

  cron.schedule("25 3 * * 1", async () => {
    try { await generateLuxuryMarketAnalysis(); console.log("[SchedulerManager] ✅ Analisi Luxury generate"); }
    catch (err) { console.error("[SchedulerManager] ❌ Luxury market analysis:", err); }
  }, { timezone: TZ });

  // ══════════════════════════════════════════════════════════════════════════
  // SEZIONE /gossip — Business Gossip
  // ══════════════════════════════════════════════════════════════════════════

  cron.schedule("30 3 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 03:30 CET — Avvio scraping Business Gossip news...");
    try { await refreshGossipNewsFromRSS(); console.log("[SchedulerManager] ✅ Gossip news aggiornate"); }
    catch (err) { console.error("[SchedulerManager] ❌ Gossip news:", err); }
  }, { timezone: TZ });

  // ══════════════════════════════════════════════════════════════════════════
  // SEZIONE /cybersecurity — Cybersecurity
  // ══════════════════════════════════════════════════════════════════════════

  cron.schedule("45 3 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 03:45 CET — Avvio scraping Cybersecurity news...");
    try { await refreshCybersecurityNewsFromRSS(); console.log("[SchedulerManager] ✅ Cybersecurity news aggiornate"); }
    catch (err) { console.error("[SchedulerManager] ❌ Cybersecurity news:", err); }
  }, { timezone: TZ });

  // ══════════════════════════════════════════════════════════════════════════
  // SEZIONE /sondaggi — Sondaggi & Dati
  // ══════════════════════════════════════════════════════════════════════════

  cron.schedule("0 4 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 04:00 CET — Avvio scraping Sondaggi news...");
    try { await refreshSondaggiNewsFromRSS(); console.log("[SchedulerManager] ✅ Sondaggi news aggiornate"); }
    catch (err) { console.error("[SchedulerManager] ❌ Sondaggi news:", err); }
  }, { timezone: TZ });

  // ══════════════════════════════════════════════════════════════════════════
  // NEWSLETTER GIORNALIERA PER CANALE
  // ══════════════════════════════════════════════════════════════════════════
  // Ogni giorno alle 07:00 viene inviata una preview a info@ideasmart.ai
  // Ogni giorno alle 07:30 viene inviata la newsletter massiva al canale del giorno:
  //   Lunedì    → AI4Business News
  //   Martedì   → Startup News
  //   Mercoledì → Finance & Markets
  //   Giovedì   → Sport & Business
  //   Venerdì   → ITsMusic
  //   Sabato    → Lifestyle & Luxury
  //   Domenica  → Health & Biotech

  // ── PREVIEW (07:00 CET) — tutti i giorni ─────────────────────────────────
  cron.schedule("0 7 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 07:00 CET — Invio preview newsletter del giorno...");
    try {
      const result = await sendDailyChannelPreview();
      if (result.success) {
        console.log(`[SchedulerManager] ✅ Preview ${result.channel} inviata a info@ideasmart.ai`);
      } else {
        console.log(`[SchedulerManager] ℹ️ Preview: ${result.channel} — ${result.error || "skip"}`);
      }
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore preview newsletter:", err);
    }
  }, { timezone: TZ });

  // ── INVIO MASSIVO (07:30 CET) — tutti i giorni ───────────────────────────
  cron.schedule("30 7 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 07:30 CET — Invio newsletter massiva del giorno...");
    try {
      const result = await sendDailyChannelNewsletter();
      if (result.success && result.recipientCount > 0) {
        console.log(`[SchedulerManager] ✅ Newsletter ${result.channel}: ${result.recipientCount} iscritti, ${result.newsCount} notizie`);
      } else if (result.recipientCount === 0 && result.success) {
        console.log(`[SchedulerManager] ℹ️ Newsletter ${result.channel}: già inviata oggi o nessun iscritto`);
      } else {
        console.error(`[SchedulerManager] ❌ Newsletter ${result.channel}: ${result.error}`);
      }
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore invio newsletter massiva:", err);
    }
  }, { timezone: TZ });

  // ══════════════════════════════════════════════════════════════════════════
  // LINKEDIN AUTOPOST — ogni giorno alle 10:00 CET
  // ══════════════════════════════════════════════════════════════════════════

  cron.schedule("0 10 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 10:00 CET — Pubblicazione LinkedIn editoriale del giorno...");
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
  console.log("[SchedulerManager]   💰 News Finance     → ogni giorno alle 01:30 CET (scraping RSS reale)");
  console.log("[SchedulerManager]   ✍️  Editoriale Finance → ogni giorno alle 01:35 CET");
  console.log("[SchedulerManager]   🌙 Audit notturno   → ogni giorno alle 02:00 CET (verifica URL + sostituzione)");
  console.log("[SchedulerManager]   🏥 News Health      → ogni giorno alle 02:15 CET (scraping RSS reale)");
  console.log("[SchedulerManager]   ✍️  Editoriale Health → ogni giorno alle 02:20 CET");
  console.log("[SchedulerManager]   ⚽ News Sport       → ogni giorno alle 02:45 CET (scraping RSS reale)");
  console.log("[SchedulerManager]   ✍️  Editoriale Sport → ogni giorno alle 02:50 CET");
  console.log("[SchedulerManager]   💸 News Luxury      → ogni giorno alle 03:05 CET (scraping RSS reale)");
  console.log("[SchedulerManager]   ✍️  Editoriale Luxury → ogni giorno alle 03:10 CET");
  console.log("[SchedulerManager]   🗞️  News Gossip       → ogni giorno alle 03:30 CET (scraping RSS reale)");
  console.log("[SchedulerManager]   🔐 News Cybersec    → ogni giorno alle 03:45 CET (scraping RSS reale)");
  console.log("[SchedulerManager]   📊 News Sondaggi    → ogni giorno alle 04:00 CET (scraping RSS reale)");
  console.log("[SchedulerManager]   👁️  Preview newsletter → ogni giorno alle 07:00 CET → info@ideasmart.ai");
  console.log("[SchedulerManager]   📧 Newsletter canale → ogni giorno alle 07:30 CET (Lun=AI, Mar=Startup, Mer=Finance, Gio=Sport, Ven=Music, Sab=Luxury, Dom=Health)");
  console.log("[SchedulerManager]   💼 LinkedIn Autopost → ogni giorno alle 10:00 CET");
  console.log("[SchedulerManager]   📌 Punto del Giorno → aggiornato automaticamente alle 10:00 CET (via LinkedIn publisher → DB)");
}
