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
import { refreshAINewsFromRSS, refreshMusicNewsFromRSS, refreshStartupNewsFromRSS, refreshFinanceNewsFromRSS, refreshHealthNewsFromRSS, refreshSportNewsFromRSS, refreshLuxuryNewsFromRSS, refreshGossipNewsFromRSS, refreshCybersecurityNewsFromRSS, refreshSondaggiNewsFromRSS, refreshNewsGeneraliFromRSS, refreshMotoriNewsFromRSS, refreshTennisNewsFromRSS, refreshBasketNewsFromRSS } from "./rssNewsScheduler";
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
import { generateBreakingNews } from "./breakingNewsGenerator";
import { runMorningHealthReport } from "./morningHealthReport";
import { publishLinkedInPost, publishDailyLinkedInPosts } from "./linkedinPublisher";
import { sendDailyChannelPreview, sendDailyChannelNewsletter } from "./dailyChannelNewsletter";
import { runNewsletterLinkAudit, isNewsletterBlockedByAudit, setNewsletterBlockedByAudit } from "./newsletterLinkAudit";
import { invalidateAll, invalidateBySection, invalidateSection, CACHE_KEYS } from "./cache";
import { saveBarometroSnapshot, getDb } from "./db";
import { invokeLLM } from "./_core/llm";
import { newsItems as newsItemsTable } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

const TZ = "Europe/Rome";

// ─── Job Lock: previene sovrapposizioni tra cron job concorrenti ─────────────────────────────
// Se un job è già in esecuzione, il cron successivo viene saltato (skip).
// Questo previene accumuli di job in coda se un job impiega più del previsto.
const _jobLocks: Record<string, boolean> = {};
function withLock<T>(jobName: string, fn: () => Promise<T>): Promise<T | null> {
  if (_jobLocks[jobName]) {
    console.warn(`[SchedulerManager] ⚠️ Skip ${jobName}: già in esecuzione`);
    return Promise.resolve(null);
  }
  _jobLocks[jobName] = true;
  return fn().finally(() => { _jobLocks[jobName] = false; });
}

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
    await withLock("rss-ai", async () => {
      try { await refreshAINewsFromRSS(); invalidateSection('ai'); console.log("[SchedulerManager] ✅ News AI aggiornate + cache invalidata"); }
      catch (err) { console.error("[SchedulerManager] ❌ News AI:", err); }
    });
  }, { timezone: TZ });

  cron.schedule("5 0 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 00:05 CET — Editoriale AI + Startup del giorno...");
    await withLock("editorial-ai", async () => {
      try { await runDailyContentRefresh(); console.log("[SchedulerManager] ✅ Editoriale e Startup AI aggiornati"); }
      catch (err) { console.error("[SchedulerManager] ❌ Editoriale/Startup AI:", err); }
    });
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
    try { await refreshMusicNewsFromRSS(); invalidateSection('music'); console.log("[SchedulerManager] ✅ News Musicali aggiornate + cache invalidata"); }
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
    try { await refreshStartupNewsFromRSS(); invalidateSection('startup'); console.log("[SchedulerManager] ✅ Startup News aggiornate + cache invalidata"); }
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
    try { await refreshFinanceNewsFromRSS(); invalidateSection('finance'); console.log("[SchedulerManager] ✅ Finance news aggiornate + cache invalidata"); }
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
    try { await refreshHealthNewsFromRSS(); invalidateSection('health'); console.log("[SchedulerManager] ✅ Health news aggiornate + cache invalidata"); }
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
    try { await refreshSportNewsFromRSS(); invalidateSection('sport'); console.log("[SchedulerManager] ✅ Sport news aggiornate + cache invalidata"); }
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
    try { await refreshLuxuryNewsFromRSS(); invalidateSection('luxury'); console.log("[SchedulerManager] ✅ Luxury news aggiornate + cache invalidata"); }
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

  // ── News Italia (04:15 CET) ───────────────────────────────────────────────
  cron.schedule("0 4 15 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 04:15 CET — Avvio scraping News Italia...");
    try { await refreshNewsGeneraliFromRSS(); console.log("[SchedulerManager] ✅ News Italia aggiornate"); }
    catch (err) { console.error("[SchedulerManager] ❌ News Italia:", err); }
  }, { timezone: TZ });

  // ── Motori (04:30 CET) ────────────────────────────────────────────────────
  cron.schedule("0 30 4 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 04:30 CET — Avvio scraping Motori news...");
    try { await refreshMotoriNewsFromRSS(); console.log("[SchedulerManager] ✅ Motori news aggiornate"); }
    catch (err) { console.error("[SchedulerManager] ❌ Motori news:", err); }
  }, { timezone: TZ });

  // ── Tennis (04:45 CET) ────────────────────────────────────────────────────
  cron.schedule("0 45 4 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 04:45 CET — Avvio scraping Tennis news...");
    try { await refreshTennisNewsFromRSS(); console.log("[SchedulerManager] ✅ Tennis news aggiornate"); }
    catch (err) { console.error("[SchedulerManager] ❌ Tennis news:", err); }
  }, { timezone: TZ });

  // ── Basket (05:00 CET) ────────────────────────────────────────────────────
  cron.schedule("0 0 5 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 05:00 CET — Avvio scraping Basket news...");
    try { await refreshBasketNewsFromRSS(); console.log("[SchedulerManager] ✅ Basket news aggiornate"); }
    catch (err) { console.error("[SchedulerManager] ❌ Basket news:", err); }
  }, { timezone: TZ });

  // ══════════════════════════════════════════════════════════════════════════
  // INVALIDAZIONE CACHE — 05:30 CET (dopo tutti gli scheduler di scraping)
  // ══════════════════════════════════════════════════════════════════════════
  // Tutti gli scheduler di scraping e generazione contenuti terminano entro le 05:15.
  // Alle 05:30 invalidiamo l'intera cache in-memory così il prossimo utente
  // riceve i contenuti freschi del giorno. La cache si ripopola automaticamente
  // alla prima richiesta (lazy) o tramite warm-up programmato.
  cron.schedule("30 5 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 05:30 CET — Invalidazione cache post-scraping...");
    try {
      invalidateAll();
      console.log("[SchedulerManager] ✅ Cache invalidata — contenuti freschi disponibili al prossimo accesso");
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore invalidazione cache:", err);
    }
  }, { timezone: TZ });

  // ══════════════════════════════════════════════════════════════════════════
  // SNAPSHOT BAROMETRO POLITICO — 05:45 CET (dopo invalidazione cache)
  // ══════════════════════════════════════════════════════════════════════════
  // Ogni giorno alle 05:45 salviamo uno snapshot del barometro politico
  // per alimentare il grafico storico a 4 settimane nel widget Sondaggi.
  cron.schedule("45 5 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 05:45 CET — Salvataggio snapshot barometro politico...");
    try {
      const db = await getDb();
      if (!db) { console.warn("[BarometroSnapshot] DB non disponibile"); return; }
      const items = await db.select().from(newsItemsTable)
        .where(eq(newsItemsTable.section, 'sondaggi'))
        .orderBy(desc(newsItemsTable.createdAt))
        .limit(30);
      if (!items.length) { console.warn("[BarometroSnapshot] Nessuna notizia sondaggi disponibile"); return; }
      const newsText = items.map(n => `TITOLO: ${n.title}\nSOMMARIO: ${n.summary}\nFONTE: ${n.sourceName ?? ''}\nDATA: ${n.publishedAt ?? ''}`).join('\n\n---\n\n');
      const response = await invokeLLM({
        messages: [
          { role: 'system', content: 'Sei un analista politico italiano esperto di sondaggi. Estrai le intenzioni di voto dai sondaggi. Restituisci SEMPRE dati per i principali partiti italiani (FdI, PD, M5S, Lega, FI, AVS, Az/IV). I valori devono sommare a circa 100%.' },
          { role: 'user', content: `Analizza queste notizie ed estrai le intenzioni di voto:\n\n${newsText}\n\nRestituisci JSON con partiti e percentuali.` }
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'barometro_snapshot',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                partiti: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      nome: { type: 'string' },
                      nomeCompleto: { type: 'string' },
                      percentuale: { type: 'number' },
                      colore: { type: 'string' },
                    },
                    required: ['nome', 'nomeCompleto', 'percentuale', 'colore'],
                    additionalProperties: false,
                  }
                },
                fonte: { type: 'string' },
              },
              required: ['partiti', 'fonte'],
              additionalProperties: false,
            },
          },
        },
      });
      const content = response.choices[0]?.message?.content;
      if (!content) { console.warn("[BarometroSnapshot] LLM non ha restituito dati"); return; }
      const parsed = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));
      const today = new Date().toLocaleDateString('en-CA', { timeZone: TZ }); // YYYY-MM-DD
      await saveBarometroSnapshot(today, parsed.partiti, parsed.fonte ?? 'Elaborazione AI');
      console.log(`[BarometroSnapshot] ✅ Snapshot salvato per ${today} — ${parsed.partiti.length} partiti`);
    } catch (err) {
      console.error("[BarometroSnapshot] ❌ Errore salvataggio snapshot:", err);
    }
  }, { timezone: TZ });

  // ── Invalidazione cache parziale dopo LinkedIn (10:35 CET) ───────────────
  // Il post LinkedIn aggiorna il "Punto del Giorno" nella Home.
  // Invalidiamo solo la chiave getPuntoDelGiorno per non toccare le altre.
  cron.schedule("35 10 * * *", async () => {
    try {
      invalidateBySection(CACHE_KEYS.PUNTO_DEL_GIORNO);
      console.log("[SchedulerManager] ✅ Cache Punto del Giorno invalidata dopo LinkedIn post");
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore invalidazione cache Punto del Giorno:", err);
    }
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

  // ── AUDIT LINK (06:45 CET) — tutti i giorni ──────────────────────────────
  cron.schedule("45 6 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 06:45 CET — Audit link newsletter pre-invio...");
    try {
      const report = await runNewsletterLinkAudit();
      if (report) {
        if (report.shouldBlockSend) {
          setNewsletterBlockedByAudit(true);
          console.warn(`[SchedulerManager] 🚨 AUDIT: ${report.internalBroken.length} link interni rotti — INVIO BLOCCATO`);
        } else {
          setNewsletterBlockedByAudit(false);
          console.log(`[SchedulerManager] ✅ AUDIT OK: ${report.okCount} link verificati, ${report.brokenCount} esterni non raggiungibili`);
        }
      }
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore audit link newsletter:", err);
    }
  }, { timezone: TZ });

  // ── MORNING HEALTH REPORT (08:00 CET) — tutti i giorni ─────────────────
  cron.schedule("0 8 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 08:00 CET — Invio Morning Health Report...");
    try {
      await runMorningHealthReport();
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore Morning Health Report:", err);
    }
  }, { timezone: TZ });

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
    // Controlla se l'audit ha bloccato l'invio per link interni rotti
    if (isNewsletterBlockedByAudit()) {
      console.warn("[SchedulerManager] 🚨 INVIO BLOCCATO dall'audit link (06:45) — link interni rotti rilevati. Correggi e forza l'invio dalla dashboard.");
      return;
    }
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
  // LINKEDIN AUTOPOST — 2 post giornalieri: 10:30 CET (mattino) + 15:00 CET (pomeriggio)
  // ══════════════════════════════════════════════════════════════════════════

  // Post mattino — 10:30 CET
  cron.schedule("30 10 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 10:30 CET — Pubblicazione LinkedIn MATTINO...");
    await withLock("linkedin-morning", async () => {
      try {
        const result = await publishLinkedInPost("morning");
        console.log(`[SchedulerManager] ✅ LinkedIn MATTINO: ${result.published}/1 post pubblicati`);
        if (result.errors.length > 0) {
          console.error("[SchedulerManager] ⚠️ LinkedIn MATTINO errori:", result.errors);
        }
        // Invalida cache Punto del Giorno
        invalidateBySection("home");
      } catch (err) {
        console.error("[SchedulerManager] ❌ Errore LinkedIn MATTINO:", err);
      }
    });
  }, { timezone: TZ });

  // Post pomeriggio — 15:00 CET
  cron.schedule("0 15 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 15:00 CET — Pubblicazione LinkedIn POMERIGGIO...");
    await withLock("linkedin-afternoon", async () => {
      try {
        const result = await publishLinkedInPost("afternoon");
        console.log(`[SchedulerManager] ✅ LinkedIn POMERIGGIO: ${result.published}/1 post pubblicati`);
        if (result.errors.length > 0) {
          console.error("[SchedulerManager] ⚠️ LinkedIn POMERIGGIO errori:", result.errors);
        }
        // Invalida cache Punto del Giorno
        invalidateBySection("home");
      } catch (err) {
        console.error("[SchedulerManager] ❌ Errore LinkedIn POMERIGGIO:", err);
      }
    });
  }, { timezone: TZ });

  // Post sera — 17:30 CET (tema: vibe coding, AI e startup, come cambia il mercato)
  cron.schedule("30 17 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 17:30 CET — Pubblicazione LinkedIn SERA (Vibe Coding / AI / Mercato)...");
    await withLock("linkedin-evening", async () => {
      try {
        const result = await publishLinkedInPost("evening");
        console.log(`[SchedulerManager] ✅ LinkedIn SERA: ${result.published}/1 post pubblicati`);
        if (result.errors.length > 0) {
          console.error("[SchedulerManager] ⚠️ LinkedIn SERA errori:", result.errors);
        }
        // Invalida cache Punto del Giorno
        invalidateBySection("home");
      } catch (err) {
        console.error("[SchedulerManager] ❌ Errore LinkedIn SERA:", err);
      }
    });
  }, { timezone: TZ });

  // ══════════════════════════════════════════════════════════════════════════
  // CATCH-UP LINKEDIN — all'avvio, recupera i post mancati se il cron era offline
  // ══════════════════════════════════════════════════════════════════════════
  setTimeout(async () => {
    try {
      const nowCET = new Date(new Date().toLocaleString("en-US", { timeZone: TZ }));
      const hourCET = nowCET.getHours();
      const minuteCET = nowCET.getMinutes();
      const currentMinutes = hourCET * 60 + minuteCET;
      const today = new Date().toISOString().split("T")[0];

      const catchUpDb = await getDb();
      if (!catchUpDb) return;
      const { linkedinPosts: lpTable } = await import("../drizzle/schema");
      const { and: andOp } = await import("drizzle-orm");

      // Controlla se il post mattino (10:30) è mancato
      if (currentMinutes >= 10 * 60 + 30) {
        const existingMorning = await catchUpDb.select({ id: lpTable.id })
          .from(lpTable)
          .where(andOp(eq(lpTable.dateLabel, today), eq(lpTable.slot, "morning")))
          .limit(1);
        if (existingMorning.length === 0) {
          console.log("[SchedulerManager] 🔄 CATCH-UP: post MATTINO mancato, pubblico ora...");
          await withLock("linkedin-morning", async () => {
            const result = await publishLinkedInPost("morning");
            console.log(`[SchedulerManager] ✅ CATCH-UP MATTINO: ${result.published}/1 post pubblicati`);
            invalidateBySection("home");
          });
        } else {
          console.log("[SchedulerManager] ✅ CATCH-UP: post MATTINO già presente nel DB, nessuna azione.");
        }
      }

      // Controlla se il post pomeriggio (15:00) è mancato
      if (currentMinutes >= 15 * 60) {
        const existingAfternoon = await catchUpDb.select({ id: lpTable.id })
          .from(lpTable)
          .where(andOp(eq(lpTable.dateLabel, today), eq(lpTable.slot, "afternoon")))
          .limit(1);
        if (existingAfternoon.length === 0) {
          console.log("[SchedulerManager] 🔄 CATCH-UP: post POMERIGGIO mancato, pubblico ora...");
          await withLock("linkedin-afternoon", async () => {
            const result = await publishLinkedInPost("afternoon");
            console.log(`[SchedulerManager] ✅ CATCH-UP POMERIGGIO: ${result.published}/1 post pubblicati`);
            invalidateBySection("home");
          });
        } else {
          console.log("[SchedulerManager] ✅ CATCH-UP: post POMERIGGIO già presente nel DB, nessuna azione.");
        }
      }

      // Controlla se il post sera (17:30) è mancato
      if (currentMinutes >= 17 * 60 + 30) {
        const existingEvening = await catchUpDb.select({ id: lpTable.id })
          .from(lpTable)
          .where(andOp(eq(lpTable.dateLabel, today), eq(lpTable.slot, "evening")))
          .limit(1);
        if (existingEvening.length === 0) {
          console.log("[SchedulerManager] 🔄 CATCH-UP: post SERA mancato, pubblico ora...");
          await withLock("linkedin-evening", async () => {
            const result = await publishLinkedInPost("evening");
            console.log(`[SchedulerManager] ✅ CATCH-UP SERA: ${result.published}/1 post pubblicati`);
            invalidateBySection("home");
          });
        } else {
          console.log("[SchedulerManager] ✅ CATCH-UP: post SERA già presente nel DB, nessuna azione.");
        }
      }
    } catch (err) {
      console.error("[SchedulerManager] ⚠️ CATCH-UP LinkedIn fallito (non critico):", err);
    }
  }, 30_000); // Attende 30s dopo l'avvio per dare tempo al DB di connettersi

  // ══════════════════════════════════════════════════════════════════════════
  // KEEP-ALIVE — ping HTTP al server ogni 12 ore per prevenire l'ibernazione del sandbox
  // ══════════════════════════════════════════════════════════════════════════
  setInterval(async () => {
    try {
      const port = process.env.PORT || "3000";
      const url = `http://localhost:${port}/api/trpc/health.ping`;
      const res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(10_000) });
      console.log(`[KeepAlive] 🏓 Ping server → HTTP ${res.status} — server attivo`);
    } catch (err) {
      console.warn(`[KeepAlive] ⚠️ Ping fallito (non critico): ${err instanceof Error ? err.message : String(err)}`);
    }
  }, 12 * 60 * 60 * 1000); // ogni 12 ore

  // ══════════════════════════════════════════════════════════════════════════
  // CATCH-UP NEWSLETTER — all'avvio, invia la newsletter del giorno se mancata
  // ══════════════════════════════════════════════════════════════════════════
  setTimeout(async () => {
    try {
      const nowCET = new Date(new Date().toLocaleString("en-US", { timeZone: TZ }));
      const hourCET = nowCET.getHours();
      const minuteCET = nowCET.getMinutes();
      const currentMinutes = hourCET * 60 + minuteCET;

      // Il catch-up newsletter si attiva solo se sono passate le 07:30 CET
      if (currentMinutes < 7 * 60 + 30) {
        console.log("[SchedulerManager] ℹ️ CATCH-UP newsletter: sono le " + `${hourCET}:${String(minuteCET).padStart(2,'0')} CET, prima delle 07:30 — nessun catch-up necessario`);
        return;
      }

      // Controlla se la newsletter del giorno è già stata inviata con successo (recipientCount > 0)
      const catchUpDb = await getDb();
      if (!catchUpDb) return;

      const { newsletterSends: nlSendsTable } = await import("../drizzle/schema");
      const { gte, and: andOp2, gt } = await import("drizzle-orm");

      // Cerca un invio di oggi con recipientCount > 0 (invio reale, non il record vuoto iniziale)
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const successfulSend = await catchUpDb.select({ id: nlSendsTable.id, recipientCount: nlSendsTable.recipientCount })
        .from(nlSendsTable)
        .where(andOp2(
          gte(nlSendsTable.createdAt, todayStart),
          gt(nlSendsTable.recipientCount, 0)
        ))
        .limit(1);

      if (successfulSend.length > 0) {
        console.log(`[SchedulerManager] ✅ CATCH-UP newsletter: già inviata oggi (${successfulSend[0].recipientCount} destinatari) — nessuna azione`);
        return;
      }

      // Newsletter non inviata: forza l'invio ora
      console.log("[SchedulerManager] 🔄 CATCH-UP newsletter: nessun invio riuscito oggi — forzo l'invio ora...");
      const { sendDailyChannelNewsletter: sendNL } = await import("./dailyChannelNewsletter");
      const result = await sendNL();
      if (result.success && result.recipientCount > 0) {
        console.log(`[SchedulerManager] ✅ CATCH-UP newsletter: ${result.channel} inviata a ${result.recipientCount} iscritti`);
      } else if (result.recipientCount === 0 && result.channel === 'none') {
        console.log("[SchedulerManager] ℹ️ CATCH-UP newsletter: nessun canale configurato per oggi");
      } else {
        console.warn(`[SchedulerManager] ⚠️ CATCH-UP newsletter: ${result.channel} — ${result.error || 'nessun iscritto o già inviata'}`);
      }
    } catch (err) {
      console.error("[SchedulerManager] ⚠️ CATCH-UP newsletter fallito (non critico):", err);
    }
  }, 60_000); // Attende 60s dopo l'avvio per dare tempo al DB e alla cache di inizializzarsi

  // ═══════════════════════════════════════════════════════════════════════════
  // BREAKING NEWS — ogni ora alle :05 (5 minuti dopo l'ora, dopo l'aggiornamento news)
  // ═══════════════════════════════════════════════════════════════════════════
  cron.schedule(
    "0 5 * * * *", // ogni ora alle :05 (secondi=0, minuti=5)
    () => withLock("breakingNews", async () => {
      console.log("[SchedulerManager] 🚨 Breaking News: analisi notizie recenti...");
      try {
        const result = await generateBreakingNews();
        if (result.selected > 0) {
          console.log(`[SchedulerManager] ✅ Breaking News: ${result.selected} selezionate, ${result.archived} archiviate`);
        } else if (result.error) {
          console.warn(`[SchedulerManager] ⚠️ Breaking News: ${result.error}`);
        } else {
          console.log("[SchedulerManager] ℹ️ Breaking News: nessuna notizia urgente questa ora");
        }
      } catch (err) {
        console.error("[SchedulerManager] ❌ Breaking News errore:", err);
      }
    }),
    { timezone: TZ }
  );

  // Breaking news: esegui anche subito all'avvio (dopo 90s per dare tempo al DB)
  setTimeout(async () => {
    try {
      console.log("[SchedulerManager] 🚨 Breaking News: prima analisi all'avvio...");
      const result = await generateBreakingNews();
      if (result.selected > 0) {
        console.log(`[SchedulerManager] ✅ Breaking News avvio: ${result.selected} selezionate`);
      } else {
        console.log("[SchedulerManager] ℹ️ Breaking News avvio: nessuna notizia urgente");
      }
    } catch (err) {
      console.error("[SchedulerManager] ❌ Breaking News avvio errore:", err);
    }
  }, 90_000);

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
  console.log("[SchedulerManager]   🇮🇹 News Italia      → ogni giorno alle 04:15 CET (scraping RSS reale)");
  console.log("[SchedulerManager]   🚗 News Motori      → ogni giorno alle 04:30 CET (scraping RSS reale)");
  console.log("[SchedulerManager]   🎾 News Tennis      → ogni giorno alle 04:45 CET (scraping RSS reale)");
  console.log("[SchedulerManager]   🏀 News Basket      → ogni giorno alle 05:00 CET (scraping RSS reale)");
  console.log("[SchedulerManager]   🔍 Audit link newsletter → ogni giorno alle 06:45 CET (verifica HTTP 200 tutti i link)");
  console.log("[SchedulerManager]   👁️  Preview newsletter → ogni giorno alle 07:00 CET → info@ideasmart.ai");
  console.log("[SchedulerManager]   📧 Newsletter canale → ogni giorno alle 07:30 CET (Lun=AI, Mar=Startup, Mer=Finance, Gio=Sport, Ven=Music, Sab=Luxury, Dom=Health)");
  console.log("[SchedulerManager]   📊 Morning Health Report → ogni giorno alle 08:00 CET → info@andreacinelli.com");
  console.log("[SchedulerManager]   💼 LinkedIn MATTINO  → ogni giorno alle 10:30 CET (AI o Startup, alternanza settimanale)");
  console.log("[SchedulerManager]   💼 LinkedIn POMERIGGIO → ogni giorno alle 15:00 CET (sezione opposta rispetto al mattino)");
  console.log("[SchedulerManager]   💼 LinkedIn SERA → ogni giorno alle 17:30 CET (Vibe Coding / AI / Startup / Mercato)");
  console.log("[SchedulerManager]   📌 Punto del Giorno → aggiornato 3 volte al giorno: 10:30, 15:00 e 17:30 CET");
  console.log("[SchedulerManager]   🏓 Keep-Alive      → ping HTTP ogni 12 ore per prevenire ibernazione sandbox");
  console.log("[SchedulerManager]   🔄 Catch-up NL     → all'avvio, forza invio newsletter se mancata (dopo le 07:30 CET)");
  console.log("[SchedulerManager]   🚨 Breaking News   → ogni ora alle :05 (analisi AI notizie urgenti, archivio dopo 6h)");
}
