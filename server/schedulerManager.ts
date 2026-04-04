/**
 * IDEASMART — Scheduler Manager Centralizzato
 * ─────────────────────────────────────────────────────────────────────────────
 * Gestisce tutte le routine automatiche del sito con orari CET precisi.
 *
 * Routine configurate (tutti gli orari sono in CET/CEST — ora italiana):
 *
 *  ┌─────────────────────────────────────────────────────────────────────────┐
 *  │  AGGIORNAMENTO CONTENUTI — ogni giorno (sezioni attive: AI, Startup)     │
 *  │  00:00 — News AI (scraping RSS reale)                                   │
 *  │  00:05 — Editoriale AI + Startup del giorno                             │
 *  │  00:15 — Reportage AI (ogni lunedì)                                     │
 *  │  00:20 — Analisi di mercato AI (ogni lunedì)                            │ *  │  01:30 — News DEALROOM (scraping RSS reale)                              │
 *  │  01:35 — Editoriale DEALROOM (deal della settimana)                      │
 *  │  01:05 — Editoriale Startup + Startup della Settimana                   │
 *  │  01:15 — Reportage Startup (ogni lunedì)                                │
 *  │  01:20 — Analisi Mercato Startup (ogni lunedì)                          │
 *  │  02:00 — Audit notturno URL notizie                                     │
 *  │  05:30 — Invalidazione cache (contenuti freschi disponibili)             │
 *  │  06:00 — Generazione 10 ricerche AI/Startup/VC (Research)               │
 *  │  06:45 — Audit link newsletter pre-invio                                │
 *  │  (Canali rimossi: Music, Finance, Health, Sport, Luxury, Gossip, ecc.) │
 *  │                                                                          │
 *  │  NEWSLETTER UNIFICATA GIORNALIERA                                        │
 *  │  Ogni giorno 10:30 — Preview unificata → ac@acinelli.com               │
 *  │  Ogni giorno 12:30 — Newsletter unificata → tutti gli iscritti          │
 *  │  Contenuto: AI News + Startup + DEALROOM + Breaking + Research          │
 *  │  + Sponsor a rotazione + Amazon Deal del giorno                         │
 *  │                                                                          │
 *  │  LINKEDIN AUTOPOST — 5 slot giornalieri                                  │
 *  │  10:00 — Post mattino: AI News (fisso)                                 │
 *  │  12:30 — Post Startup News                                              │
 *  │  14:30 — Post IdeaSmart Research (ultima ricerca)                      │
 *  │  16:00 — Post AI Tool Radar (10 tool AI scoperti oggi)                 │
 *  │  17:30 — Post Dealroom (ultimo deal/round)                             │
 *  │                                                                          │
 *  │  SITE HEALTH CHECK — ogni ora                                            │
 *  │  :00 — Verifica homepage, API, contenuti, pagine principali            │
 *  │  Alert email a info@andreacinelli.com se problemi rilevati              │
 *  └───────────────────────────────────────────────────────────────────────────┘*
 * node-cron usa il fuso orario del server. Il server gira in UTC.
 * CET = UTC+1 (inverno), CEST = UTC+2 (estate).
 * Usiamo timezone: "Europe/Rome" per gestire automaticamente l'ora legale.
 */

import cron from "node-cron";
import { refreshAINewsFromRSS, refreshStartupNewsFromRSS, refreshDealroomNewsFromRSS } from "./rssNewsScheduler";




import { runDailyContentRefresh } from "./dailyContentScheduler";
import { generateWeeklyReportage } from "./weeklyReportageScheduler";
import { generateMarketAnalysis } from "./marketAnalysisScheduler";

import {
  generateStartupEditorial,
  generateStartupOfWeek,
  generateStartupReportage,
  generateStartupMarketAnalysis,
} from "./startupScheduler";
import { runNightlyAudit } from "./nightlyAuditScheduler";
import { generateDealroomEditorial } from "./dealroomScheduler";
import { generateBreakingNews } from "./breakingNewsGenerator";
import { generateDailyResearch } from "./researchGenerator";
import { runMorningHealthReport } from "./morningHealthReport";
import { publishLinkedInPost, publishDailyLinkedInPosts } from "./linkedinPublisher";
import { sendEmail } from "./email";
import { runSiteHealthCheck } from "./siteHealthCheck";

// ── Helper: invia alert email al team operativo ───────────────────────────────
async function sendSchedulerAlert(subject: string, bodyHtml: string): Promise<void> {
  const ALERT_EMAIL = "info@ideasmart.biz";
  try {
    const result = await sendEmail({
      to: ALERT_EMAIL,
      subject: `⚠️ [IDEASMART SCHEDULER] ${subject}`,
      html: `
        <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a1628;color:#e2e8f0;padding:28px;border-radius:8px;">
          <div style="border-left:4px solid #f59e0b;padding-left:16px;margin-bottom:20px;">
            <p style="font-size:11px;font-weight:700;color:#f59e0b;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 4px;">⚠ Scheduler Alert</p>
            <h2 style="font-size:18px;color:#ffffff;margin:0;">${subject}</h2>
          </div>
          <div style="background:#0f2040;border-radius:6px;padding:20px;font-size:14px;line-height:1.7;color:#cbd5e1;">
            ${bodyHtml}
          </div>
          <p style="font-size:11px;color:#64748b;margin-top:20px;">
            Questo alert è stato generato automaticamente dallo scheduler di <strong style="color:#00b4a0;">IDEASMART</strong>.<br>
            Timestamp: ${new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' })} CET
          </p>
        </div>`,
    });
    if (result.success) {
      console.log(`[SchedulerAlert] ✅ Alert email inviata a ${ALERT_EMAIL}: "${subject}"`);
    } else {
      console.warn(`[SchedulerAlert] ⚠️ Alert email fallita: ${result.error}`);
    }
  } catch (alertErr) {
    console.error("[SchedulerAlert] ❌ Errore invio alert:", alertErr);
  }
}
import { sendDailyChannelPreview, sendDailyChannelNewsletter } from "./dailyChannelNewsletter";
import { runNewsletterLinkAudit, isNewsletterBlockedByAudit, setNewsletterBlockedByAudit } from "./newsletterLinkAudit";
import { invalidateAll, invalidateBySection, invalidateSection, CACHE_KEYS } from "./cache";
import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { aggregateEvents } from "./eventsAggregator";
import { ingestAllChannels, seedRssSources } from "./channelIngestor";

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
  // SEZIONE /ai — AI News
  // ══════════════════════════════════════════════════════════════════════════

  cron.schedule("0 0 * * 1,3,5", async () => { // lun, mer, ven alle 00:00 CET
    console.log("[SchedulerManager] ⏰ 00:00 CET (lun/mer/ven) — Avvio scraping RSS News AI...");
    await withLock("rss-ai", async () => {
      try { await refreshAINewsFromRSS(); invalidateSection('ai'); console.log("[SchedulerManager] ✅ News AI aggiornate + cache invalidata"); }
      catch (err) { console.error("[SchedulerManager] ❌ News AI:", err); }
    });
  }, { timezone: TZ });

  cron.schedule("5 0 * * 1,3,5", async () => { // lun, mer, ven alle 00:05 CET
    console.log("[SchedulerManager] ⏰ 00:05 CET (lun/mer/ven) — Editoriale AI + Startup del giorno...");
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


  // ══════════════════════════════════════════════════════════════════════════
  // SEZIONE /startup — Startup News
  // ══════════════════════════════════════════════════════════════════════════

  cron.schedule("0 1 * * 1,3,5", async () => { // lun, mer, ven alle 01:00 CET
    console.log("[SchedulerManager] ⏰ 01:00 CET (lun/mer/ven) — Avvio scraping RSS Startup News...");
    try { await refreshStartupNewsFromRSS(); invalidateSection('startup'); console.log("[SchedulerManager] ✅ Startup News aggiornate + cache invalidata"); }
    catch (err) { console.error("[SchedulerManager] ❌ Startup News:", err); }
  }, { timezone: TZ });

  cron.schedule("5 1 * * 1,3,5", async () => { // lun, mer, ven alle 01:05 CET
    console.log("[SchedulerManager] ⏰ 01:05 CET (lun/mer/ven) — Editoriale Startup + Startup della Settimana...");
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
  // SEZIONE /dealroom — DEALROOM: Round, Funding, VC, M&A
  // Scraping lun/mer/ven alle 01:30 CET (dopo Startup News)
  // ══════════════════════════════════════════════════════════════════════════

  cron.schedule("30 1 * * 1,3,5", async () => { // lun, mer, ven alle 01:30 CET
    console.log("[SchedulerManager] ⏰ 01:30 CET (lun/mer/ven) — Avvio scraping RSS DEALROOM (round, funding, VC, M&A)...");
    await withLock("rss-dealroom", async () => {
      try { await refreshDealroomNewsFromRSS(); invalidateSection('dealroom'); console.log("[SchedulerManager] ✅ DEALROOM News aggiornate + cache invalidata"); }
      catch (err) { console.error("[SchedulerManager] ❌ DEALROOM News:", err); }
    });
  }, { timezone: TZ });

  // Editoriale DEALROOM — lun/mer/ven alle 01:35 CET (dopo scraping DEALROOM)
  cron.schedule("35 1 * * 1,3,5", async () => { // lun, mer, ven alle 01:35 CET
    console.log("[SchedulerManager] ⏰ 01:35 CET (lun/mer/ven) — Generazione editoriale DEALROOM...");
    await withLock("editorial-dealroom", async () => {
      try { await generateDealroomEditorial(); invalidateSection('dealroom'); console.log("[SchedulerManager] ✅ Editoriale DEALROOM generato + cache invalidata"); }
      catch (err) { console.error("[SchedulerManager] ❌ Editoriale DEALROOM:", err); }
    });
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
  // INVALIDAZIONE CACHE — 05:30 CET (dopo tutti gli scheduler di scraping)
  // ══════════════════════════════════════════════════════════════════════════
  // Tutti gli scheduler di scraping e generazione contenuti terminano entro le 05:15.
  // Alle 05:30 invalidiamo l'intera cache in-memory così il prossimo utente
  // riceve i contenuti freschi del giorno. La cache si ripopola automaticamente
  // alla prima richiesta (lazy) o tramite warm-up programmato.
  cron.schedule("30 5 * * 1,3,5", async () => { // lun, mer, ven alle 05:30 CET
    console.log("[SchedulerManager] ⏰ 05:30 CET (lun/mer/ven) — Invalidazione cache post-scraping...");
    try {
      invalidateAll();
      console.log("[SchedulerManager] ✅ Cache invalidata — contenuti freschi disponibili al prossimo accesso");
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore invalidazione cache:", err);
    }
  }, { timezone: TZ });



  // ── Invalidazione cache parziale dopo LinkedIn (10:05, 12:35, 14:35, 16:05, 17:35 CET) ───
  // Il post LinkedIn aggiorna il "Punto del Giorno" nella Home.
  // Invalidiamo la cache dopo ogni slot LinkedIn.
  cron.schedule("5 10 * * *", async () => {
    try {
      invalidateBySection(CACHE_KEYS.PUNTO_DEL_GIORNO);
      console.log("[SchedulerManager] ✅ Cache Punto del Giorno invalidata dopo LinkedIn MATTINO");
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore invalidazione cache:", err);
    }
  }, { timezone: TZ });

  cron.schedule("35 12 * * *", async () => {
    try {
      invalidateBySection(CACHE_KEYS.PUNTO_DEL_GIORNO);
      console.log("[SchedulerManager] ✅ Cache Punto del Giorno invalidata dopo LinkedIn STARTUP");
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore invalidazione cache:", err);
    }
  }, { timezone: TZ });

  cron.schedule("35 14 * * *", async () => {
    try {
      invalidateBySection(CACHE_KEYS.PUNTO_DEL_GIORNO);
      console.log("[SchedulerManager] ✅ Cache Punto del Giorno invalidata dopo LinkedIn RICERCHE");
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore invalidazione cache:", err);
    }
  }, { timezone: TZ });

  cron.schedule("5 16 * * *", async () => {
    try {
      invalidateBySection(CACHE_KEYS.PUNTO_DEL_GIORNO);
      console.log("[SchedulerManager] ✅ Cache Punto del Giorno invalidata dopo LinkedIn AI TOOL RADAR");
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore invalidazione cache:", err);
    }
  }, { timezone: TZ });

  cron.schedule("35 17 * * *", async () => {
    try {
      invalidateBySection(CACHE_KEYS.PUNTO_DEL_GIORNO);
      console.log("[SchedulerManager] ✅ Cache Punto del Giorno invalidata dopo LinkedIn DEALROOM");
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore invalidazione cache:", err);
    }
  }, { timezone: TZ });

  // ══════════════════════════════════════════════════════════════════════════
  // NEWSLETTER GIORNALIERA PER CANALE
  // ══════════════════════════════════════════════════════════════════════════
  // Ogni giorno alle 07:00 viene inviata una preview a info@ideasmart.biz
  // Ogni giorno alle 07:30 viene inviata la newsletter massiva al canale del giorno:
  //   Lunedì    → AI News
  //   Mercoledì → Startup News
  //   Venerdì   → DEALROOM News

  // ══════════════════════════════════════════════════════════════════════════
  // VERIFICA GIORNALIERA NOTIZIE — 07:00 CET
  // Controlla che AI News, Startup e DEALROOM abbiano notizie di oggi.
  // Se mancano (es. il cron notturno era offline), le genera subito.
  // Questo è un secondo livello di sicurezza rispetto al catch-up all'avvio.
  // ══════════════════════════════════════════════════════════════════════════
  cron.schedule("0 7 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 07:00 CET — Verifica giornaliera notizie AI, Startup e DEALROOM...");
    await withLock("daily-news-check", async () => {
      try {
        const checkDb = await getDb();
        if (!checkDb) { console.warn("[SchedulerManager] ⚠️ Verifica notizie: DB non disponibile"); return; }
        const { newsItems: niCheckTable } = await import("../drizzle/schema");
        const { and: andCheck, gte: gteCheck, lt: ltCheck } = await import("drizzle-orm");
        const nowCET = new Date(new Date().toLocaleString("en-US", { timeZone: TZ }));
        const todayLabel = nowCET.toLocaleDateString("en-CA", { timeZone: TZ }); // YYYY-MM-DD
        const todayStart = new Date(todayLabel + "T00:00:00+01:00");
        const todayEnd = new Date(todayLabel + "T23:59:59+01:00");

        const sectionsToVerify: Array<{ section: 'ai' | 'startup' | 'dealroom'; label: string; refreshFn: () => Promise<void> }> = [
          { section: 'ai', label: 'AI News', refreshFn: async () => { await refreshAINewsFromRSS(); } },
          { section: 'startup', label: 'Startup News', refreshFn: async () => { await refreshStartupNewsFromRSS(); } },
          { section: 'dealroom', label: 'DEALROOM', refreshFn: async () => { await refreshDealroomNewsFromRSS(); } },
        ];

        for (const { section, label, refreshFn } of sectionsToVerify) {
          const existing = await checkDb.select({ id: niCheckTable.id })
            .from(niCheckTable)
            .where(andCheck(
              eq(niCheckTable.section, section),
              gteCheck(niCheckTable.createdAt, todayStart),
              ltCheck(niCheckTable.createdAt, todayEnd)
            ))
            .limit(1);

          if (existing.length === 0) {
            console.log(`[SchedulerManager] 🔄 VERIFICA 07:00: sezione '${section}' (${label}) non ha notizie di oggi — avvio refresh...`);
            // Invia alert email: il cron notturno era offline o ha fallito
            sendSchedulerAlert(
              `Notizie mancanti: ${label}`,
              `<p>La verifica delle <strong>07:00 CET</strong> ha rilevato che la sezione <strong>${label}</strong> non aveva notizie per oggi.</p>
               <p>Il cron notturno (00:00 CET) potrebbe essere stato offline o aver fallito silenziosamente.</p>
               <p>La rigenerazione automatica è stata avviata adesso.</p>
               <ul style="margin:12px 0;padding-left:20px;">
                 <li>Sezione: <strong>${label}</strong> (<code>${section}</code>)</li>
                 <li>Data: <strong>${todayLabel}</strong></li>
                 <li>Azione: rigenerazione RSS avviata alle 07:00 CET</li>
               </ul>`
            ).catch(() => {});
            try {
              await refreshFn();
              invalidateSection(section);
              console.log(`[SchedulerManager] ✅ VERIFICA 07:00: '${section}' aggiornata con successo`);
            } catch (refreshErr) {
              const errMsg = refreshErr instanceof Error ? refreshErr.message : String(refreshErr);
              console.error(`[SchedulerManager] ❌ VERIFICA 07:00: refresh '${section}' fallito:`, refreshErr);
              // Alert aggiuntivo: anche la rigenerazione è fallita
              sendSchedulerAlert(
                `ERRORE rigenerazione ${label}`,
                `<p style="color:#f87171;">La rigenerazione automatica della sezione <strong>${label}</strong> è <strong>fallita</strong>.</p>
                 <p>Intervento manuale richiesto dalla dashboard admin.</p>
                 <ul style="margin:12px 0;padding-left:20px;">
                   <li>Sezione: <strong>${label}</strong></li>
                   <li>Data: <strong>${todayLabel}</strong></li>
                   <li>Errore: <code>${errMsg}</code></li>
                 </ul>`
              ).catch(() => {});
            }
          } else {
            console.log(`[SchedulerManager] ✅ VERIFICA 07:00: '${section}' (${label}) ha già notizie di oggi — OK`);
          }
        }
      } catch (err) {
        console.error("[SchedulerManager] ❌ Verifica giornaliera notizie errore:", err);
      }
    });
  }, { timezone: TZ });

  // ══════════════════════════════════════════════════════════════════════════
  // VERIFICA GIORNALIERA RESEARCH — 07:15 CET
  // Controlla che le ricerche di oggi siano presenti; se mancano, le genera.
  // ══════════════════════════════════════════════════════════════════════════
  cron.schedule("15 7 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 07:15 CET — Verifica ricerche giornaliere...");
    await withLock("daily-research-check", async () => {
      try {
        const result = await generateDailyResearch();
        if (result.generated > 0) {
          console.log(`[SchedulerManager] ✅ VERIFICA 07:15: ${result.generated} ricerche generate (erano mancanti)`);
          // Alert email: le ricerche erano mancanti e sono state rigenerate
          const todayLabelR = new Date().toLocaleDateString("en-CA", { timeZone: TZ });
          sendSchedulerAlert(
            `Ricerche mancanti: ${result.generated} rigenerate`,
            `<p>La verifica delle <strong>07:15 CET</strong> ha rilevato che le ricerche giornaliere erano assenti per oggi.</p>
             <p>Il cron notturno (05:30 CET) potrebbe essere stato offline o aver fallito silenziosamente.</p>
             <p>La rigenerazione automatica ha prodotto <strong>${result.generated} ricerche</strong>.</p>
             <ul style="margin:12px 0;padding-left:20px;">
               <li>Sezione: <strong>IdeaSmart Research</strong></li>
               <li>Data: <strong>${todayLabelR}</strong></li>
               <li>Ricerche generate: <strong>${result.generated}</strong></li>
             </ul>`
          ).catch(() => {});
        } else {
          console.log("[SchedulerManager] ✅ VERIFICA 07:15: ricerche già presenti — OK");
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error("[SchedulerManager] ❌ Verifica ricerche errore:", err);
        // Alert email: la rigenerazione delle ricerche è fallita
        sendSchedulerAlert(
          "ERRORE rigenerazione Ricerche",
          `<p style="color:#f87171;">La rigenerazione automatica delle ricerche giornaliere è <strong>fallita</strong>.</p>
           <p>Intervento manuale richiesto dalla dashboard admin.</p>
           <ul style="margin:12px 0;padding-left:20px;">
             <li>Errore: <code>${errMsg}</code></li>
           </ul>`
        ).catch(() => {});
      }
    });
  }, { timezone: TZ });

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

  // ── PREVIEW NEWSLETTER UNIFICATA (10:30 CET) — GIORNALIERA (tutti i giorni) ──────
  cron.schedule("30 10 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 10:30 CET — Invio preview newsletter UNIFICATA giornaliera...");
    try {
      const { sendUnifiedPreview } = await import("./unifiedNewsletter");
      const result = await sendUnifiedPreview();
      if (result.success) {
        console.log(`[SchedulerManager] ✅ Preview newsletter unificata inviata (AI:${result.stats.ai} Startup:${result.stats.startup} Deal:${result.stats.dealroom} Breaking:${result.stats.breaking} Research:${result.stats.research})`);
      } else {
        console.log(`[SchedulerManager] ℹ️ Preview unificata: ${result.error || "skip"}`);
      }
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore preview newsletter unificata:", err);
    }
  }, { timezone: TZ });

  // ── INVIO MASSIVO NEWSLETTER UNIFICATA (12:30 CET) — GIORNALIERO ────────────
  // La newsletter unificata viene inviata automaticamente ogni giorno alle 12:30 CET.
  // L'audit link delle 06:45 può bloccare l'invio se rileva link rotti.
  cron.schedule("30 12 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 12:30 CET — Invio newsletter UNIFICATA giornaliera a tutti gli iscritti...");
    if (isNewsletterBlockedByAudit()) {
      console.warn("[SchedulerManager] 🚨 INVIO BLOCCATO dall'audit link (06:45)");
      await sendSchedulerAlert(
        "Newsletter BLOCCATA dall'audit link",
        `<p>L'invio della newsletter delle <strong>12:30 CET</strong> è stato <strong>bloccato</strong> perché l'audit link delle 06:45 ha rilevato link interni rotti.</p>
         <p>Verificare e correggere i link dalla dashboard admin, poi inviare manualmente.</p>`
      ).catch(() => {});
      return;
    }
    try {
      const { sendUnifiedNewsletterToAll } = await import("./unifiedNewsletter");
      const result = await sendUnifiedNewsletterToAll();
      if (result.success) {
        console.log(`[SchedulerManager] ✅ Newsletter UNIFICATA giornaliera: ${result.recipientCount} iscritti, inviata con successo`);
      } else {
        console.error(`[SchedulerManager] ❌ Newsletter UNIFICATA: ${result.error}`);
        await sendSchedulerAlert(
          "Newsletter UNIFICATA fallita",
          `<p>L'invio della newsletter unificata delle <strong>12:30 CET</strong> è <strong>fallito</strong>.</p>
           <p>Errore: <code>${result.error}</code></p>`
        ).catch(() => {});
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("[SchedulerManager] ❌ Errore invio newsletter UNIFICATA giornaliera:", err);
      await sendSchedulerAlert(
        "ERRORE invio newsletter UNIFICATA",
        `<p style="color:#f87171;">Errore critico nell'invio della newsletter unificata giornaliera.</p>
         <p>Errore: <code>${errMsg}</code></p>`
      ).catch(() => {});
    }
  }, { timezone: TZ });

  // ══════════════════════════════════════════════════════════════════════════
  // LINKEDIN AUTOPOST — 4 post giornalieri:
  //   10:00 CET — AI News (morning)
  //   12:30 CET — Startup News (startup-afternoon)
  //   14:30 CET — Ricerche IdeaSmart (research)
  //   16:00 CET — AI Tool Radar (ai-tool-radar)
  //   17:30 CET — Dealroom (dealroom)
  // ══════════════════════════════════════════════════════════════════════════

  // ══════════════════════════════════════════════════════════════════════════
  // VERIFICA GIORNALIERA LINKEDIN — 09:30 CET
  // Controlla che i post LinkedIn del giorno siano stati pubblicati.
  // Questo cron gira 30 minuti PRIMA del post mattino (10:00).
  // ══════════════════════════════════════════════════════════════════════════
  cron.schedule("30 9 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 09:30 CET — Verifica giornaliera post LinkedIn...");
    await withLock("daily-linkedin-check", async () => {
      try {
        const liCheckDb = await getDb();
        if (!liCheckDb) { console.warn("[SchedulerManager] ⚠️ Verifica LinkedIn: DB non disponibile"); return; }
        const { linkedinPosts: lpCheckTable } = await import("../drizzle/schema");
        const nowCET = new Date(new Date().toLocaleString("en-US", { timeZone: TZ }));
        const today = nowCET.toLocaleDateString("en-CA", { timeZone: TZ });

        const existingToday = await liCheckDb.select({ id: lpCheckTable.id, slot: lpCheckTable.slot })
          .from(lpCheckTable)
          .where(eq(lpCheckTable.dateLabel, today))
          .limit(4);

        const publishedSlots = existingToday.map(p => p.slot);

        if (publishedSlots.length === 0) {
          console.log("[SchedulerManager] 🔄 VERIFICA 09:30: nessun post LinkedIn oggi — pubblico post mattino ora...");
          await withLock("linkedin-morning", async () => {
            const result = await publishLinkedInPost("morning");
            console.log(`[SchedulerManager] ✅ VERIFICA 09:30: LinkedIn MATTINO: ${result.published}/1 post pubblicati`);
            invalidateBySection("home");
          });
        } else {
          console.log(`[SchedulerManager] ✅ VERIFICA 09:30: LinkedIn ha già ${publishedSlots.length} post oggi (${publishedSlots.join(", ")}) — OK`);
        }
      } catch (err) {
        console.error("[SchedulerManager] ❌ Verifica giornaliera LinkedIn errore:", err);
      }
    });
  }, { timezone: TZ });

  // Post mattino — 10:00 CET (AI News)
  cron.schedule("0 10 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 10:00 CET — Pubblicazione LinkedIn MATTINO (AI News)...");
    await withLock("linkedin-morning", async () => {
      try {
        const result = await publishLinkedInPost("morning");
        console.log(`[SchedulerManager] ✅ LinkedIn MATTINO: ${result.published}/1 post pubblicati`);
        if (result.errors.length > 0) {
          console.error("[SchedulerManager] ⚠️ LinkedIn MATTINO errori:", result.errors);
        }
        invalidateBySection("home");
      } catch (err) {
        console.error("[SchedulerManager] ❌ Errore LinkedIn MATTINO:", err);
      }
    });
  }, { timezone: TZ });

  // Post Startup — 12:30 CET (Startup News)
  cron.schedule("30 12 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 12:30 CET — Pubblicazione LinkedIn STARTUP...");
    await withLock("linkedin-startup-afternoon", async () => {
      try {
        const result = await publishLinkedInPost("startup-afternoon");
        console.log(`[SchedulerManager] ✅ LinkedIn STARTUP POMERIGGIO: ${result.published}/1 post pubblicati`);
        if (result.errors.length > 0) {
          console.error("[SchedulerManager] ⚠️ LinkedIn STARTUP POMERIGGIO errori:", result.errors);
        }
        invalidateBySection("home");
      } catch (err) {
        console.error("[SchedulerManager] ❌ Errore LinkedIn STARTUP POMERIGGIO:", err);
      }
    });
  }, { timezone: TZ });

  // Post Ricerche — 14:30 CET (IdeaSmart Research)
  cron.schedule("30 14 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 14:30 CET — Pubblicazione LinkedIn RICERCHE (IdeaSmart Research)...");
    await withLock("linkedin-research", async () => {
      try {
        const result = await publishLinkedInPost("research");
        console.log(`[SchedulerManager] ✅ LinkedIn RICERCHE: ${result.published}/1 post pubblicati`);
        if (result.errors.length > 0) {
          console.error("[SchedulerManager] ⚠️ LinkedIn RICERCHE errori:", result.errors);
        }
        invalidateBySection("home");
      } catch (err) {
        console.error("[SchedulerManager] ❌ Errore LinkedIn RICERCHE:", err);
      }
    });
  }, { timezone: TZ });

  // Post AI Tool Radar — 16:00 CET (10 nuovi tool AI scoperti oggi)
  cron.schedule("0 16 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 16:00 CET — Pubblicazione LinkedIn AI TOOL RADAR...");
    await withLock("linkedin-ai-tool-radar", async () => {
      try {
        const result = await publishLinkedInPost("ai-tool-radar");
        console.log(`[SchedulerManager] ✅ LinkedIn AI TOOL RADAR: ${result.published}/1 post pubblicati`);
        if (result.errors.length > 0) {
          console.error("[SchedulerManager] ⚠️ LinkedIn AI TOOL RADAR errori:", result.errors);
        }
        invalidateBySection("home");
      } catch (err) {
        console.error("[SchedulerManager] ❌ Errore LinkedIn AI TOOL RADAR:", err);
      }
    });
  }, { timezone: TZ });

  // Post Dealroom — 17:30 CET (ultimi deal/round)
  cron.schedule("30 17 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 17:30 CET — Pubblicazione LinkedIn DEALROOM...");
    await withLock("linkedin-dealroom", async () => {
      try {
        const result = await publishLinkedInPost("dealroom");
        console.log(`[SchedulerManager] ✅ LinkedIn DEALROOM: ${result.published}/1 post pubblicati`);
        if (result.errors.length > 0) {
          console.error("[SchedulerManager] ⚠️ LinkedIn DEALROOM errori:", result.errors);
        }
        invalidateBySection("home");
      } catch (err) {
        console.error("[SchedulerManager] ❌ Errore LinkedIn DEALROOM:", err);
      }
    });
  }, { timezone: TZ });

  // ══════════════════════════════════════════════════════════════════════════
  // CATCH-UP LINKEDIN — all'avvio, recupera i post mancati se il cron era offline
  // Slot: morning (10:00), startup-afternoon (14:30), research (17:00), dealroom (18:00)
  // ══════════════════════════════════════════════════════════════════════════
  setTimeout(async () => {
    try {
      const nowCET = new Date(new Date().toLocaleString("en-US", { timeZone: TZ }));
      const hourCET = nowCET.getHours();
      const minuteCET = nowCET.getMinutes();
      const currentMinutes = hourCET * 60 + minuteCET;
      const today = nowCET.toLocaleDateString("en-CA", { timeZone: TZ });

      const catchUpDb = await getDb();
      if (!catchUpDb) return;
      const { linkedinPosts: lpTable } = await import("../drizzle/schema");
      const { and: andOp } = await import("drizzle-orm");

      // Catch-up slot definitions: [slot, scheduledMinutes]
      const catchUpSlots: Array<[string, number, string]> = [
        ["morning", 10 * 60, "MATTINO (10:00)"],
        ["startup-afternoon", 14 * 60 + 30, "STARTUP RADAR EU/IT (14:30)"],
        ["research", 17 * 60, "RICERCHE (17:00)"],
        ["ai-tool-radar", 18 * 60, "AI TOOL RADAR (18:00)"],
        ["dealroom", 19 * 60, "DEALROOM (19:00)"],
      ];

      for (const [slotName, scheduledMin, label] of catchUpSlots) {
        if (currentMinutes >= scheduledMin) {
          const existing = await catchUpDb.select({ id: lpTable.id })
            .from(lpTable)
            .where(andOp(eq(lpTable.dateLabel, today), eq(lpTable.slot, slotName as any)))
            .limit(1);
          if (existing.length === 0) {
            console.log(`[SchedulerManager] 🔄 CATCH-UP: post ${label} mancato, pubblico ora...`);
            await withLock(`linkedin-${slotName}`, async () => {
              const result = await publishLinkedInPost(slotName as any);
              console.log(`[SchedulerManager] ✅ CATCH-UP ${label}: ${result.published}/1 post pubblicati`);
              invalidateBySection("home");
            });
          } else {
            console.log(`[SchedulerManager] ✅ CATCH-UP: post ${label} già presente nel DB, nessuna azione.`);
          }
        }
      }
    } catch (err) {
      console.error("[SchedulerManager] ⚠️ CATCH-UP LinkedIn fallito (non critico):", err);
    }
  }, 30_000); // Attende 30s dopo l'avvio per dare tempo al DB di connettersi

  // ══════════════════════════════════════════════════════════════════════════
  // SITE HEALTH CHECK — ogni ora, verifica che il sito sia online e con contenuti
  // Se rileva problemi (pagina vuota, API down, sezioni mancanti), invia alert email
  // ══════════════════════════════════════════════════════════════════════════
  cron.schedule("0 * * * *", async () => {
    console.log("[SchedulerManager] 🏥 Health Check produzione — verifica contenuti sito...");
    try {
      await runSiteHealthCheck();
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore Health Check produzione:", err);
    }
  }, { timezone: TZ });

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
  }, 4 * 60 * 60 * 1000); // ogni 4 ore (ridotto da 12h per prevenire ibernazione sandbox)

  // ══════════════════════════════════════════════════════════════════════════
  // CATCH-UP NEWSLETTER — DISABILITATO (richiede approvazione manuale da Admin)
  // L'invio automatico catch-up è stato disabilitato per evitare invii senza approvazione.
  // L'owner riceve la preview alle 07:00 CET e approva l'invio dalla dashboard Admin.
  // ══════════════════════════════════════════════════════════════════════════
  /*
  setTimeout(async () => {
    try {
      const nowCET = new Date(new Date().toLocaleString("en-US", { timeZone: TZ }));
      const hourCET = nowCET.getHours();
      const minuteCET = nowCET.getMinutes();
      const currentMinutes = hourCET * 60 + minuteCET;
      if (currentMinutes < 7 * 60 + 30) {
        console.log("[SchedulerManager] ℹ️ CATCH-UP newsletter: prima delle 07:30 — nessun catch-up necessario");
        return;
      }
      const catchUpDb = await getDb();
      if (!catchUpDb) return;
      const { newsletterSends: nlSendsTable } = await import("../drizzle/schema");
      const { gte, and: andOp2, gt } = await import("drizzle-orm");
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const successfulSend = await catchUpDb.select({ id: nlSendsTable.id, recipientCount: nlSendsTable.recipientCount })
        .from(nlSendsTable)
        .where(andOp2(gte(nlSendsTable.createdAt, todayStart), gt(nlSendsTable.recipientCount, 0)))
        .limit(1);
      if (successfulSend.length > 0) {
        console.log(`[SchedulerManager] ✅ CATCH-UP newsletter: già inviata oggi`);
        return;
      }
      console.log("[SchedulerManager] 🔄 CATCH-UP newsletter: nessun invio riuscito oggi — forzo l'invio ora...");
      const { sendDailyChannelNewsletter: sendNL } = await import("./dailyChannelNewsletter");
      const result = await sendNL();
      console.log(`[SchedulerManager] CATCH-UP newsletter: ${result.channel} — ${result.recipientCount} iscritti`);
    } catch (err) {
      console.error("[SchedulerManager] ⚠️ CATCH-UP newsletter fallito:", err);
    }
  }, 60_000);
  */

  // ═══════════════════════════════════════════════════════════════════════════
  // BREAKING NEWS — ogni 3 ore alle :05 (risparmio crediti: da 24 a 8 chiamate/giorno)
  // ═══════════════════════════════════════════════════════════════════════════
  cron.schedule(
    "0 5 */3 * * *", // ogni 3 ore alle :05 (secondi=0, minuti=5, ore=0,3,6,9,12,15,18,21)
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

  // ═══════════════════════════════════════════════════════════════════════════
  // IDEASMART RESEARCH — lun/mer/ven alle 06:00 CET
  // Genera 10 ricerche su Startup, VC e AI Trends da fonti specializzate
  // ═══════════════════════════════════════════════════════════════════════════
  cron.schedule(
    "0 0 6 * * 1,3,5", // lun, mer, ven alle 06:00 CET
    () => withLock("researchGeneration", async () => {
      console.log("[SchedulerManager] 🔬 IDEASMART Research: generazione ricerche giornaliere...");
      try {
        const result = await generateDailyResearch();
        if (result.generated > 0) {
          console.log(`[SchedulerManager] ✅ Research: ${result.generated} ricerche generate`);
        } else if (result.error) {
          console.warn(`[SchedulerManager] ⚠️ Research: ${result.error}`);
        } else {
          console.log("[SchedulerManager] ℹ️ Research: ricerche già presenti oggi");
        }
      } catch (err) {
        console.error("[SchedulerManager] ❌ Research errore:", err);
      }
    }),
    { timezone: TZ }
  );

  // ── Catch-up news all'avvio: se il server parte dopo le 06:00 CET e una sezione
  //    non ha notizie di oggi, le genera subito (evita pagine vuote dopo deploy)
  setTimeout(async () => {
    try {
      const nowCET = new Date(new Date().toLocaleString("en-US", { timeZone: TZ }));
      const hourCET = nowCET.getHours();
      const minuteCET = nowCET.getMinutes();
      const currentMinutes = hourCET * 60 + minuteCET;
      // Solo se sono passate le 06:00 CET (tutti gli scheduler notturni dovrebbero essere già girati)
      if (currentMinutes < 6 * 60) {
        console.log(`[SchedulerManager] ℹ️ Catch-up news: sono le ${hourCET}:${String(minuteCET).padStart(2,'0')} CET, prima delle 06:00 — nessun catch-up necessario`);
        return;
      }
      const catchUpNewsDb = await getDb();
      if (!catchUpNewsDb) return;
      const { newsItems: niTable } = await import("../drizzle/schema");
      const { and: andOp3, gte: gteOp, lt: ltOp } = await import("drizzle-orm");
      const todayStr = nowCET.toISOString().split("T")[0];
      const todayStart = new Date(todayStr + "T00:00:00.000Z");
      const todayEnd = new Date(todayStr + "T23:59:59.999Z");
      // Sezioni attive: AI News, Startup News, DEALROOM
      const sectionsToCheck: Array<{ section: 'ai' | 'startup' | 'dealroom'; label: string; refreshFn: () => Promise<void> }> = [
        { section: 'ai', label: 'AI News', refreshFn: async () => { await refreshAINewsFromRSS(); } },
        { section: 'startup', label: 'Startup News', refreshFn: async () => { await refreshStartupNewsFromRSS(); } },
        { section: 'dealroom', label: 'DEALROOM', refreshFn: async () => { await refreshDealroomNewsFromRSS(); } },
      ];
      for (const { section, label, refreshFn } of sectionsToCheck) {
        const existing = await catchUpNewsDb.select({ id: niTable.id })
          .from(niTable)
          .where(andOp3(
            eq(niTable.section, section),
            gteOp(niTable.createdAt, todayStart),
            ltOp(niTable.createdAt, todayEnd)
          ))
          .limit(1);
        if (existing.length === 0) {
          console.log(`[SchedulerManager] 🔄 CATCH-UP news: sezione '${section}' (${label}) non ha notizie di oggi — avvio refresh...`);
          try {
            await refreshFn();
            invalidateSection(section);
            console.log(`[SchedulerManager] ✅ CATCH-UP news: '${section}' aggiornata`);
          } catch (err) {
            console.error(`[SchedulerManager] ❌ CATCH-UP news '${section}' errore:`, err);
          }
        } else {
          console.log(`[SchedulerManager] ℹ️ CATCH-UP news: '${section}' ha già notizie di oggi — skip`);
        }
      }
    } catch (err) {
      console.error("[SchedulerManager] ❌ Catch-up news all'avvio errore:", err);
    }
  }, 60_000); // 1 minuto dopo l'avvio

  // Research: esegui anche subito all'avvio se non ci sono ricerche di oggi
  setTimeout(async () => {
    try {
      console.log("[SchedulerManager] 🔬 Research: verifica ricerche all'avvio...");
      const result = await generateDailyResearch();
      if (result.generated > 0) {
        console.log(`[SchedulerManager] ✅ Research avvio: ${result.generated} ricerche generate`);
      } else {
        console.log("[SchedulerManager] ℹ️ Research avvio: ricerche già presenti");
      }
    } catch (err) {
      console.error("[SchedulerManager] ❌ Research avvio errore:", err);
    }
  }, 120_000); // 2 minuti dopo l'avvio

  // ── Log riepilogo ─────────────────────────────────────────────────────────
  console.log("[SchedulerManager] ✅ Scheduler attivi (sezioni: AI, Startup, DEALROOM, Research):");
  console.log("[SchedulerManager]   📰 News AI          → lun/mer/ven alle 00:00 CET");
  console.log("[SchedulerManager]   ✍️  Editoriale AI    → lun/mer/ven alle 00:05 CET");
  console.log("[SchedulerManager]   🏢 Reportage AI     → ogni lunedì alle 00:15 CET");
  console.log("[SchedulerManager]   📊 Analisi AI       → ogni lunedì alle 00:20 CET");
  console.log("[SchedulerManager]   🚀 News Startup     → lun/mer/ven alle 01:00 CET");
  console.log("[SchedulerManager]   ✍️  Editoriale Startup → lun/mer/ven alle 01:05 CET");
  console.log("[SchedulerManager]   🏢 Reportage Startup → ogni lunedì alle 01:15 CET");
  console.log("[SchedulerManager]   📊 Analisi Startup  → ogni lunedì alle 01:20 CET");
  console.log("[SchedulerManager]   💰 DEALROOM News    → lun/mer/ven alle 01:30 CET");
  console.log("[SchedulerManager]   ✍️  Editoriale DEALROOM → lun/mer/ven alle 01:35 CET");
  console.log("[SchedulerManager]   🌙 Audit notturno   → ogni giorno alle 02:00 CET (verifica URL + sostituzione)");
  console.log("[SchedulerManager]   🔍 Audit link newsletter → ogni giorno alle 06:45 CET (verifica HTTP 200 tutti i link)");
  console.log("[SchedulerManager]   👁️  Preview newsletter → ogni giorno alle 10:30 CET → ac@acinelli.com");
  console.log("[SchedulerManager]   📧 Newsletter UNIFICATA → ogni giorno alle 12:30 CET → tutti gli iscritti (AUTOMATICA)");
  console.log("[SchedulerManager]   📊 Morning Health Report → ogni giorno alle 08:00 CET → info@andreacinelli.com");
  console.log("[SchedulerManager]   💼 LinkedIn MATTINO       → ogni giorno alle 10:00 CET (AI News)");
  console.log("[SchedulerManager]   💼 LinkedIn STARTUP       → ogni giorno alle 12:30 CET (Startup News)");
  console.log("[SchedulerManager]   💼 LinkedIn RICERCHE      → ogni giorno alle 14:30 CET (IdeaSmart Research)");
  console.log("[SchedulerManager]   💼 LinkedIn AI TOOL RADAR → ogni giorno alle 16:00 CET (10 tool AI scoperti oggi)");
  console.log("[SchedulerManager]   💼 LinkedIn DEALROOM      → ogni giorno alle 17:30 CET (Dealroom)");
  console.log("[SchedulerManager]   🏥 Health Check    → ogni ora (verifica contenuti sito produzione, alert email se problemi)");
  console.log("[SchedulerManager]   🏓 Keep-Alive      → ping HTTP ogni 4 ore per prevenire ibernazione sandbox");
  console.log("[SchedulerManager]   🔄 Catch-up NL     → DISABILITATO (newsletter unificata giornaliera attiva)");
  console.log("[SchedulerManager]   ✅ Verifica news   → ogni giorno alle 07:00 CET (AI + Startup + DEALROOM, rigenera se mancanti)");
  console.log("[SchedulerManager]   ✅ Verifica research → ogni giorno alle 07:15 CET (rigenera se mancanti)");
  console.log("[SchedulerManager]   ✅ Verifica LinkedIn → ogni giorno alle 09:30 CET (pubblica se nessun post oggi)");
  console.log("[SchedulerManager]   🚀 Breaking News   → ogni 3 ore alle :05 (analisi AI notizie urgenti, archivio dopo 6h)");
  console.log("[SchedulerManager]   🔬 Research        → lun/mer/ven alle 06:00 CET (10 ricerche AI/Startup/VC)");
  console.log("[SchedulerManager]   🧠 Channel Ingestor → lun/mer/ven alle 00:00 CET (RSS + AI per 6 canali)");
  console.log("[SchedulerManager]   📅 Events Aggregator → ogni 12 ore alle 06:30 e 18:30 CET (Luma ICS + RSS italiani)");

  // ═══════════════════════════════════════════════════════════════════════════
  // EVENTS AGGREGATOR — ogni 12 ore (06:30 e 18:30 CET)
  // Aggrega eventi Tech/AI/Startup italiani da Luma ICS + RSS feeds
  // ═══════════════════════════════════════════════════════════════════════════
  cron.schedule(
    "0 30 6,18 * * *", // ogni giorno alle 06:30 e 18:30 CET
    () => withLock("eventsAggregation", async () => {
      console.log("[SchedulerManager] 📅 Events Aggregator: avvio aggregazione eventi...");
      try {
        const result = await aggregateEvents();
        console.log(`[SchedulerManager] ✅ Events: ${result.inserted} eventi upsertati`);
      } catch (err) {
        console.error("[SchedulerManager] ❌ Events errore:", err);
      }
    }),
    { timezone: TZ }
  );

  // Prima aggregazione all'avvio (dopo 3 minuti)
  setTimeout(async () => {
    try {
      console.log("[SchedulerManager] 📅 Events: prima aggregazione all'avvio...");
      const result = await aggregateEvents();
      console.log(`[SchedulerManager] ✅ Events avvio: ${result.inserted} eventi caricati`);
    } catch (err) {
      console.error("[SchedulerManager] ❌ Events avvio errore:", err);
    }
  }, 3 * 60 * 1000); // 3 minuti dopo l'avvio

  // ═══════════════════════════════════════════════════════════════════════════
  // CHANNEL CONTENT INGESTOR — lun/mer/ven alle 00:00 CET
  // Raccoglie RSS, genera contenuti AI per tutti i canali
  // (Copy & Paste AI, Automate, Make Money, Daily AI Tools, Verified News, AI Opportunities)
  // Eseguito in parallelo con gli altri scheduler delle 00:00 (AI News, ecc.)
  // ═══════════════════════════════════════════════════════════════════════════
  cron.schedule(
    "0 0 0 * * 1,3,5", // lun, mer, ven alle 00:00 CET
    () => withLock("channelIngest", async () => {
      console.log("[SchedulerManager] 🧠 Channel Ingestor: avvio ingestione contenuti canali...");
      try {
        const results = await ingestAllChannels();
        const summary = Object.entries(results).map(([ch, r]) => `${ch}: ${r.generated} gen, ${r.errors} err`).join(" | ");
        console.log(`[SchedulerManager] ✅ Channel Ingestor: ${summary}`);
      } catch (err) {
        console.error("[SchedulerManager] ❌ Channel Ingestor errore:", err);
      }
    }),
    { timezone: TZ }
  );

  // Seed RSS sources + prima ingestione all'avvio (dopo 4 minuti)
  setTimeout(async () => {
    try {
      console.log("[SchedulerManager] 🌱 Channel Ingestor: seed fonti RSS...");
      const seeded = await seedRssSources();
      console.log(`[SchedulerManager] ✅ RSS seed: ${seeded} nuove fonti aggiunte`);

      // Verifica se ci sono contenuti di oggi, altrimenti genera
      const checkDb = await getDb();
      if (checkDb) {
        const { channelContent: ccTable } = await import("../drizzle/schema");
        const today = new Date().toISOString().slice(0, 10);
        const existing = await checkDb.select({ id: ccTable.id })
          .from(ccTable)
          .where(eq(ccTable.publishDate, today))
          .limit(1);
        if (existing.length === 0) {
          console.log("[SchedulerManager] 🔄 Channel Ingestor: nessun contenuto oggi — avvio ingestione...");
          const results = await ingestAllChannels();
          const summary = Object.entries(results).map(([ch, r]) => `${ch}: ${r.generated} gen`).join(" | ");
          console.log(`[SchedulerManager] ✅ Channel Ingestor avvio: ${summary}`);
        } else {
          console.log("[SchedulerManager] ℹ️ Channel Ingestor: contenuti già presenti oggi — skip");
        }
      }
    } catch (err) {
      console.error("[SchedulerManager] ❌ Channel Ingestor avvio errore:", err);
    }
  }, 4 * 60 * 1000); // 4 minuti dopo l'avvio

  console.log("[SchedulerManager]   🧠 Channel Ingestor → ogni giorno alle 00:00 CET (RSS + AI per 6 canali)");
}
