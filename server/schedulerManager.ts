/**
 * Proof Press — Scheduler Manager Centralizzato
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
  *  │  NEWSLETTER — OGNI GIORNO 7gg/7                                              │
  *  │  07:30 — Preview a ac@acinelli.com (force, nessuna approvazione)          │
  *  │  08:30 — Invio massivo "BUONGIORNO by PROOFPRESS" → tutti i subscriber    │
  *  │  Mittente: redazione@proofpress.ai — Unica newsletter unificata            │
 *  │  Contenuto: AI News + Startup + DEALROOM + Breaking + Research          │
 *  │  + Sponsor a rotazione + Amazon Deal del giorno                         │
 *  │                                                                          │
 *  │  LINKEDIN AUTOPOST — 5 slot giornalieri                                  │
 *  │  10:00 — Post mattino: AI News (fisso)                                 │
 *  │  12:30 — Post Startup News                                              │
 *  │  14:30 — Post Proof Press Research (ultima ricerca)                      │
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
import { syncOsservatorioArticles } from "./osservatorioScheduler";

// ── Helper: invia alert email al team operativo ───────────────────────────────
async function sendSchedulerAlert(subject: string, bodyHtml: string): Promise<void> {
  const ALERT_EMAIL = "info@proofpress.ai";
  try {
    const result = await sendEmail({
      to: ALERT_EMAIL,
      subject: `⚠️ [Proof Press SCHEDULER] ${subject}`,
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
            Questo alert è stato generato automaticamente dallo scheduler di <strong style="color:#00b4a0;">Proof Press</strong>.<br>
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
import { invalidateAll, invalidateBySection, invalidateSection, invalidateCache, CACHE_KEYS } from "./cache";
import { getDb, unsubscribeEmail } from "./db";
import { eq } from "drizzle-orm";
import { aggregateEvents } from "./eventsAggregator";
import { ingestAllChannels, seedRssSources } from "./channelIngestor";
import { sendDailyMetricsReport } from "./dailyMetricsReport";

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



  // ── Invalidazione cache parziale dopo LinkedIn (10:05, 12:35, 14:35, 16:05, 18:05 CET) ───
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

  cron.schedule("5 18 * * *", async () => {
    try {
      invalidateBySection(CACHE_KEYS.PUNTO_DEL_GIORNO);
      console.log("[SchedulerManager] ✅ Cache Punto del Giorno invalidata dopo LinkedIn STARTUP NEWS SERA");
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore invalidazione cache:", err);
    }
  }, { timezone: TZ });

  // ══════════════════════════════════════════════════════════════════════════
  // NEWSLETTER GIORNALIERA PER CANALE
  // ══════════════════════════════════════════════════════════════════════════
  // Ogni giorno alle 07:00 viene inviata una preview a info@proofpress.ai
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
          // Invalida la cache così la homepage mostra subito la nuova ricerca del giorno
          invalidateCache('research:ofDay');
          invalidateCache('research:*');
          console.log("[SchedulerManager] 🔄 Cache research:ofDay invalidata — homepage aggiornata");
          // Alert email: le ricerche erano mancanti e sono state rigenerate
          const todayLabelR = new Date().toLocaleDateString("en-CA", { timeZone: TZ });
          sendSchedulerAlert(
            `Ricerche mancanti: ${result.generated} rigenerate`,
            `<p>La verifica delle <strong>07:15 CET</strong> ha rilevato che le ricerche giornaliere erano assenti per oggi.</p>
             <p>Il cron notturno (05:30 CET) potrebbe essere stato offline o aver fallito silenziosamente.</p>
             <p>La rigenerazione automatica ha prodotto <strong>${result.generated} ricerche</strong>.</p>
             <ul style="margin:12px 0;padding-left:20px;">
               <li>Sezione: <strong>Proof Press Research</strong></li>
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



  // ── MORNING HEALTH REPORT (08:00 CET) — tutti i giorni ─────────────────
  cron.schedule("0 8 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 08:00 CET — Invio Morning Health Report...");
    try {
      await runMorningHealthReport();
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore Morning Health Report:", err);
    }
  }, { timezone: TZ });

  // ── NEWSLETTER PREVIEW (07:30 CET) — invia bozza a ac@acinelli.com ogni giorno ────────────
  // Cron: 30 7 * * * = ogni giorno alle 07:30 CET, 7 giorni su 7
  // Spostato a 07:30 per evitare conflitto con verifica notizie (07:00) e verifica research (07:15)
  // Invia la preview della newsletter del giorno a ac@acinelli.com per verifica visiva
  cron.schedule("30 7 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 07:30 CET — Invio preview newsletter a ac@acinelli.com...");
    try {
      const { sendUnifiedPreview } = await import("./unifiedNewsletter");
      const result = await sendUnifiedPreview(true); // force=true bypassa il guard giornaliero
      if (result.success) {
        console.log(`[SchedulerManager] ✅ Preview inviata a ac@acinelli.com — ${result.subject}`);
      } else {
        console.error("[SchedulerManager] ❌ Errore preview:", result.error);
      }
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore critico preview:", err);
    }
  }, { timezone: TZ });

  // ── NEWSLETTER MASSIVA "BUONGIORNO by PROOFPRESS" — 08:30 CET (7 giorni su 7) ────────────
  // Cron: 30 8 * * * = ogni giorno alle 08:30 CET, domenica e sabato inclusi
  // Nessuna approvazione richiesta — invio automatico diretto a tutti i 2.454 subscriber attivi
  // Gli unsubscribed (5.608) sono automaticamente esclusi dalla query getActiveSubscribers()
  cron.schedule("30 8 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 08:30 CET — Invio massivo \"BUONGIORNO by PROOFPRESS\" a tutti i subscriber attivi (7gg/7)...");
    await withLock("newsletter-mattino", async () => {
      try {
        const { sendMorningNewsletterToAll } = await import("./unifiedNewsletter");
        const result = await sendMorningNewsletterToAll();
        if (result.success) {
          console.log(`[SchedulerManager] ✅ Newsletter inviata: ${result.recipientCount} destinatari — ${result.subject}`);
        } else {
          console.error("[SchedulerManager] ❌ Errore newsletter:", result.error);
        }
      } catch (err) {
        console.error("[SchedulerManager] ❌ Errore critico newsletter:", err);
      }
    });
  }, { timezone: TZ });

  // NEWSLETTER PROMOZIONALE — DISABILITATA (rimossa 2026-04-12 per decisione editoriale)
  // NEWSLETTER SABATO SEPARATA — DISABILITATA (rimossa 2026-04-24: newsletter unificata 7gg/7)
  // ══════════════════════════════════════════════════════════════════════════
  // LINKEDIN AUTOPOST — 5 post giornalieri:
  //   10:00 CET — AI News (morning)
  //   12:30 CET — 2° Editoriale AI su ricerche di mercato (ai-research-morning)
  //   14:30 CET — 2° AI News (research)
  //   16:00 CET — 2° Ricerche di mercato (research-afternoon)
  //   18:00 CET — Startup News (startup-evening)
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

  // 2° Editoriale AI — 12:30 CET (ricerche di mercato AI di alto livello)
  cron.schedule("30 12 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 12:30 CET — Pubblicazione LinkedIn 2° EDITORIALE AI (ricerche di mercato)...");
    await withLock("linkedin-ai-research-morning", async () => {
      try {
        const result = await publishLinkedInPost("ai-research-morning");
        console.log(`[SchedulerManager] ✅ LinkedIn 2° EDITORIALE AI: ${result.published}/1 post pubblicati`);
        if (result.errors.length > 0) {
          console.error("[SchedulerManager] ⚠️ LinkedIn 2° EDITORIALE AI errori:", result.errors);
        }
        invalidateBySection("home");
      } catch (err) {
        console.error("[SchedulerManager] ❌ Errore LinkedIn 2° EDITORIALE AI:", err);
      }
    });
  }, { timezone: TZ });

  // Post Ricerche — 14:30 CET (Proof Press Research)
  cron.schedule("30 14 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 14:30 CET — Pubblicazione LinkedIn RICERCHE (Proof Press Research)...");
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

  // 2° Ricerche Proof Press — 16:00 CET
  cron.schedule("0 16 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 16:00 CET — Pubblicazione LinkedIn 2° RICERCHE (Proof Press Research)...");
    await withLock("linkedin-research-afternoon", async () => {
      try {
        const result = await publishLinkedInPost("research-afternoon");
        console.log(`[SchedulerManager] ✅ LinkedIn 2° RICERCHE: ${result.published}/1 post pubblicati`);
        if (result.errors.length > 0) {
          console.error("[SchedulerManager] ⚠️ LinkedIn 2° RICERCHE errori:", result.errors);
        }
        invalidateBySection("home");
      } catch (err) {
        console.error("[SchedulerManager] ❌ Errore LinkedIn 2° RICERCHE:", err);
      }
    });
  }, { timezone: TZ });

  // 5° Post — Startup News Sera — 18:00 CET
  cron.schedule("0 18 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 18:00 CET — Pubblicazione LinkedIn STARTUP NEWS SERA...");
    await withLock("linkedin-startup-evening", async () => {
      try {
        const result = await publishLinkedInPost("startup-evening");
        console.log(`[SchedulerManager] ✅ LinkedIn STARTUP NEWS SERA: ${result.published}/1 post pubblicati`);
        if (result.errors.length > 0) {
          console.error("[SchedulerManager] ⚠️ LinkedIn STARTUP NEWS SERA errori:", result.errors);
        }
        invalidateBySection("home");
      } catch (err) {
        console.error("[SchedulerManager] ❌ Errore LinkedIn STARTUP NEWS SERA:", err);
      }
    });
  }, { timezone: TZ });

  // ══════════════════════════════════════════════════════════════════════════
  // SLOT SERALI IN INGLESE: 20:00, 21:30, 22:30, 23:30 CET
  // Quattro post in lingua inglese per il pubblico internazionale
  // ══════════════════════════════════════════════════════════════════════════
  cron.schedule("0 20 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 20:00 CET — Pubblicazione LinkedIn EN AI NEWS SERA...");
    await withLock("linkedin-en-evening-news", async () => {
      try {
        const result = await publishLinkedInPost("en-evening-news");
        console.log(`[SchedulerManager] ✅ LinkedIn EN AI NEWS SERA: ${result.published}/1 post pubblicati`);
        if (result.errors.length > 0) console.error("[SchedulerManager] ⚠️ LinkedIn EN AI NEWS SERA errori:", result.errors);
        invalidateBySection("home");
      } catch (err) { console.error("[SchedulerManager] ❌ Errore LinkedIn EN AI NEWS SERA:", err); }
    });
  }, { timezone: TZ });

  cron.schedule("30 21 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 21:30 CET — Pubblicazione LinkedIn EN 2° EDITORIALE AI...");
    await withLock("linkedin-en-ai-research", async () => {
      try {
        const result = await publishLinkedInPost("en-ai-research");
        console.log(`[SchedulerManager] ✅ LinkedIn EN 2° EDITORIALE AI: ${result.published}/1 post pubblicati`);
        if (result.errors.length > 0) console.error("[SchedulerManager] ⚠️ LinkedIn EN 2° EDITORIALE AI errori:", result.errors);
        invalidateBySection("home");
      } catch (err) { console.error("[SchedulerManager] ❌ Errore LinkedIn EN 2° EDITORIALE AI:", err); }
    });
  }, { timezone: TZ });

  cron.schedule("30 22 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 22:30 CET — Pubblicazione LinkedIn EN RICERCHE...");
    await withLock("linkedin-en-research", async () => {
      try {
        const result = await publishLinkedInPost("en-research");
        console.log(`[SchedulerManager] ✅ LinkedIn EN RICERCHE: ${result.published}/1 post pubblicati`);
        if (result.errors.length > 0) console.error("[SchedulerManager] ⚠️ LinkedIn EN RICERCHE errori:", result.errors);
        invalidateBySection("home");
      } catch (err) { console.error("[SchedulerManager] ❌ Errore LinkedIn EN RICERCHE:", err); }
    });
  }, { timezone: TZ });

  cron.schedule("30 23 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 23:30 CET — Pubblicazione LinkedIn EN 3° RICERCHE...");
    await withLock("linkedin-en-research-late", async () => {
      try {
        const result = await publishLinkedInPost("en-research-late");
        console.log(`[SchedulerManager] ✅ LinkedIn EN 3° RICERCHE: ${result.published}/1 post pubblicati`);
        if (result.errors.length > 0) console.error("[SchedulerManager] ⚠️ LinkedIn EN 3° RICERCHE errori:", result.errors);
        invalidateBySection("home");
      } catch (err) { console.error("[SchedulerManager] ❌ Errore LinkedIn EN 3° RICERCHE:", err); }
    });
  }, { timezone: TZ });

  // Invalidazione cache dopo slot serali inglesi
  cron.schedule("5 20 * * *", async () => {
    try { invalidateBySection(CACHE_KEYS.PUNTO_DEL_GIORNO); console.log("[SchedulerManager] ✅ Cache invalidata dopo LinkedIn EN AI NEWS SERA"); }
    catch (err) { console.error("[SchedulerManager] ❌ Errore invalidazione cache:", err); }
  }, { timezone: TZ });
  cron.schedule("35 21 * * *", async () => {
    try { invalidateBySection(CACHE_KEYS.PUNTO_DEL_GIORNO); console.log("[SchedulerManager] ✅ Cache invalidata dopo LinkedIn EN 2° EDITORIALE AI"); }
    catch (err) { console.error("[SchedulerManager] ❌ Errore invalidazione cache:", err); }
  }, { timezone: TZ });
  cron.schedule("35 22 * * *", async () => {
    try { invalidateBySection(CACHE_KEYS.PUNTO_DEL_GIORNO); console.log("[SchedulerManager] ✅ Cache invalidata dopo LinkedIn EN RICERCHE"); }
    catch (err) { console.error("[SchedulerManager] ❌ Errore invalidazione cache:", err); }
  }, { timezone: TZ });
  cron.schedule("35 23 * * *", async () => {
    try { invalidateBySection(CACHE_KEYS.PUNTO_DEL_GIORNO); console.log("[SchedulerManager] ✅ Cache invalidata dopo LinkedIn EN 3° RICERCHE"); }
    catch (err) { console.error("[SchedulerManager] ❌ Errore invalidazione cache:", err); }
  }, { timezone: TZ });

  // ══════════════════════════════════════════════════════════════════════════
  // CATCH-UP LINKEDIN — all'avvio, recupera i post mancati se il cron era offline
  // Slot IT: morning (10:00), ai-research-morning (12:30), research (14:30), research-afternoon (16:00), startup-evening (18:00)
  // Slot EN: en-evening-news (20:00), en-ai-research (21:30), en-research (22:30), en-research-late (23:30)
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
        ["ai-research-morning", 12 * 60 + 30, "2° EDITORIALE AI (12:30)"],
        ["research", 14 * 60 + 30, "RICERCHE (14:30)"],
        ["research-afternoon", 16 * 60, "2° RICERCHE (16:00)"],
        ["startup-evening", 18 * 60, "STARTUP NEWS SERA (18:00)"],
        ["en-evening-news", 20 * 60, "EN AI NEWS SERA (20:00)"],
        ["en-ai-research", 21 * 60 + 30, "EN 2° EDITORIALE AI (21:30)"],
        ["en-research", 22 * 60 + 30, "EN RICERCHE (22:30)"],
        ["en-research-late", 23 * 60 + 30, "EN 3° RICERCHE (23:30)"],
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
  // SITE HEALTH CHECK — 2 volte al giorno (09:00 e 17:00 CET)
  // Se rileva problemi, invia alert email con cooldown 6h (max 1 email ogni 6 ore)
  // ══════════════════════════════════════════════════════════════════════
  cron.schedule("0 9,17 * * *", async () => {
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
  // CATCH-UP NEWSLETTER BUONGIORNO — CONSERVATIVO (12 Mag 2026)
  // Al riavvio del server: avvia l'invio SOLO se non esiste NESSUN record
  // newsletter_sends per oggi (qualunque status: sent/sending/failed/pending).
  // Logica: se un record esiste già, significa che un invio è stato tentato
  // (completato, in corso, fallito o interrotto) — NON riprovare automaticamente.
  // Questo previene doppi invii dopo riavvii multipli o invii parziali interrotti.
  // Per forzare un nuovo invio dopo un fallimento: usare l'endpoint manuale admin.
  // ══════════════════════════════════════════════════════════════════════════
  setTimeout(async () => {
    try {
      const nowCET = new Date(new Date().toLocaleString("en-US", { timeZone: TZ }));
      const hourCET = nowCET.getHours();
      const minuteCET = nowCET.getMinutes();
      const currentMinutes = hourCET * 60 + minuteCET;
      // Finestra catch-up: 08:30 – 12:00 CET
      const CATCHUP_START = 8 * 60 + 30;  // 08:30
      const CATCHUP_END   = 12 * 60;       // 12:00
      if (currentMinutes < CATCHUP_START) {
        console.log(`[SchedulerManager] ℹ️ CATCH-UP BUONGIORNO: sono le ${hourCET}:${String(minuteCET).padStart(2,'0')} CET, prima delle 08:30 — nessun catch-up necessario`);
        return;
      }
      if (currentMinutes >= CATCHUP_END) {
        console.log(`[SchedulerManager] ℹ️ CATCH-UP BUONGIORNO: sono le ${hourCET}:${String(minuteCET).padStart(2,'0')} CET, dopo le 12:00 — finestra catch-up chiusa`);
        return;
      }
      // ── GUARD CONSERVATIVO: blocca su qualsiasi record esistente oggi ──────────────────────────
      const catchUpDb = await getDb();
      if (!catchUpDb) {
        console.warn('[SchedulerManager] ⚠️ CATCH-UP BUONGIORNO: DB non disponibile');
        return;
      }
      const { sql: sqlOp } = await import("drizzle-orm");
      const todayLabelCET = nowCET.toLocaleDateString('en-CA', { timeZone: TZ }); // YYYY-MM-DD

      // Cerca QUALSIASI record di oggi, indipendentemente dallo status
      const anyRecordResult = await catchUpDb.execute(
        sqlOp`SELECT id, status, recipientCount FROM newsletter_sends
              WHERE send_date = ${todayLabelCET} AND section = 'ai4business'
              LIMIT 1`
      ) as any;
      const anyRows = Array.isArray(anyRecordResult) ? anyRecordResult[0] : (anyRecordResult?.rows ?? []);

      if (anyRows && anyRows.length > 0) {
        const rec = anyRows[0];
        // Qualunque status: non avviare il catch-up automatico
        if (rec.status === 'sent' && Number(rec.recipientCount) > 0) {
          console.log(`[SchedulerManager] ✅ CATCH-UP BUONGIORNO: già inviata oggi (id=${rec.id}, ${rec.recipientCount} destinatari) — skip`);
        } else if (rec.status === 'sending') {
          console.warn(`[SchedulerManager] ⚠️ CATCH-UP BUONGIORNO: invio già in corso (id=${rec.id}) — skip per sicurezza`);
        } else if (rec.status === 'failed') {
          console.warn(`[SchedulerManager] ⚠️ CATCH-UP BUONGIORNO: invio di oggi risulta 'failed' (id=${rec.id}) — skip automatico, richiede intervento manuale dall'Admin`);
        } else {
          console.warn(`[SchedulerManager] ⚠️ CATCH-UP BUONGIORNO: record esistente oggi (id=${rec.id}, status=${rec.status}) — skip per sicurezza`);
        }
        return; // In tutti i casi: esiste un record oggi → NON avviare il catch-up
      }

      // Nessun record oggi: avvia il catch-up
      console.log(`[SchedulerManager] 🔄 CATCH-UP BUONGIORNO: nessun record oggi (${hourCET}:${String(minuteCET).padStart(2,'0')} CET) — avvio invio catch-up...`);
      await withLock('newsletter-mattino', async () => {
        try {
          const { sendMorningNewsletterToAll } = await import('./unifiedNewsletter');
          const result = await sendMorningNewsletterToAll();
          if (result.success && result.recipientCount > 0) {
            console.log(`[SchedulerManager] ✅ CATCH-UP BUONGIORNO: inviata a ${result.recipientCount} destinatari — "${result.subject}"`);
          } else if (result.recipientCount === 0 && result.success) {
            console.log(`[SchedulerManager] ℹ️ CATCH-UP BUONGIORNO: guard ha bloccato (già inviata o in corso)`);
          } else {
            console.error(`[SchedulerManager] ❌ CATCH-UP BUONGIORNO: errore — ${result.error}`);
          }
        } catch (err) {
          console.error('[SchedulerManager] ❌ CATCH-UP BUONGIORNO: errore critico:', err);
        }
      });
    } catch (err) {
      console.error('[SchedulerManager] ⚠️ CATCH-UP BUONGIORNO fallito (non critico):', err);
    }
  }, 90_000); // 90 secondi dopo l'avvio (lascia tempo al server di stabilizzarsi)

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
  // Proof Press RESEARCH — lun/mer/ven alle 06:00 CET
  // Genera 10 ricerche su Startup, VC e AI Trends da fonti specializzate
  // ═══════════════════════════════════════════════════════════════════════════
  cron.schedule(
    "0 0 6 * * 1,3,5", // lun, mer, ven alle 06:00 CET
    () => withLock("researchGeneration", async () => {
      console.log("[SchedulerManager] 🔬 Proof Press Research: generazione ricerche giornaliere...");
      try {
        const result = await generateDailyResearch();
        if (result.generated > 0) {
          console.log(`[SchedulerManager] ✅ Research: ${result.generated} ricerche generate`);
          // Invalida la cache research:ofDay così la homepage mostra la nuova ricerca del giorno
          invalidateCache('research:ofDay');
          invalidateCache('research:*');
          console.log("[SchedulerManager] 🔄 Cache research:ofDay invalidata — homepage aggiornata");
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
        // Invalida la cache così la homepage mostra subito la nuova ricerca del giorno
        invalidateCache('research:ofDay');
        invalidateCache('research:*');
        console.log("[SchedulerManager] 🔄 Cache research:ofDay invalidata — homepage aggiornata");
      } else {
        console.log("[SchedulerManager] ℹ️ Research avvio: ricerche già presenti");
      }
    } catch (err) {
      console.error("[SchedulerManager] ❌ Research avvio errore:", err);
    }
  }, 120_000); // 2 minuti dopo l'avvio

  // ═══════════════════════════════════════════════════════════════════════════
  // DAILY METRICS REPORT — ogni giorno alle 18:00 CET
  // Invia report con metriche sito a ac@acinelli.com:
  // A) Nuovi iscritti + totale mailing list
  // B) Newsletter inviate oggi (destinatari, aperture, tasso)
  // C) Post LinkedIn pubblicati oggi
  // D) Contenuti generati oggi (AI, Startup, Dealroom, Research)
  // ═══════════════════════════════════════════════════════════════════════════
  cron.schedule(
    "0 0 18 * * *", // ogni giorno alle 18:00 CET
    () => withLock("dailyMetricsReport", async () => {
      console.log("[SchedulerManager] 📊 18:00 CET — Invio report giornaliero metriche...");
      try {
        await sendDailyMetricsReport();
      } catch (err) {
        console.error("[SchedulerManager] ❌ Daily metrics report errore:", err);
      }
    }),
    { timezone: TZ }
  );

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
  console.log("[SchedulerManager]   Audit notturno   -> ogni giorno alle 02:00 CET (verifica URL + sostituzione)");
  console.log("[SchedulerManager]   📧 Audit link NL     -> RIMOSSO (non necessario con nuovo template)");
  console.log("[SchedulerManager]   📧 Newsletter \"BUONGIORNO by PROOFPRESS\" -> 7gg/7 alle 08:00 CET \u2192 tutti gli iscritti (NO approvazione, mittente: redazione@proofpress.ai)");
  console.log("[SchedulerManager]   📧 Newsletter Sabato Separata -> DISABILITATA (rimossa 2026-04-24, newsletter unificata 7gg/7)");
  console.log("[SchedulerManager]   📧 Newsletter Promozionali -> DISABILITATE (rimossa 2026-04-12)");
  console.log("[SchedulerManager]   Morning Health Report -> ogni giorno alle 08:00 CET -> info@andreacinelli.com");
  console.log("[SchedulerManager]   💼 LinkedIn MATTINO       → ogni giorno alle 10:00 CET (AI News)");
  console.log("[SchedulerManager]   💼 LinkedIn 2° EDITORIALE AI → ogni giorno alle 12:30 CET (ricerche di mercato AI)");
  console.log("[SchedulerManager]   💼 LinkedIn RICERCHE      → ogni giorno alle 14:30 CET (Proof Press Research)");
  console.log("[SchedulerManager]   💼 LinkedIn 2° RICERCHE    → ogni giorno alle 16:00 CET (2° Proof Press Research)");
  console.log("[SchedulerManager]   💼 LinkedIn STARTUP NEWS SERA → ogni giorno alle 18:00 CET (round, exit, startup IT/EU)");
  console.log("[SchedulerManager]   🇬🇧 LinkedIn EN AI NEWS SERA  → ogni giorno alle 20:00 CET (AI news in English)");
  console.log("[SchedulerManager]   🇬🇧 LinkedIn EN 2° EDITORIALE → ogni giorno alle 21:30 CET (AI research in English)");
  console.log("[SchedulerManager]   🇬🇧 LinkedIn EN RICERCHE     → ogni giorno alle 22:30 CET (ProofPress Research in English)");
  console.log("[SchedulerManager]   🇬🇧 LinkedIn EN 3° RICERCHE  → ogni giorno alle 23:30 CET (late-night research in English)");
  console.log("[SchedulerManager]   🏥 Health Check    → ogni ora (verifica contenuti sito produzione, alert email se problemi)");
   console.log("[SchedulerManager]   Keep-Alive      -> ping HTTP ogni 4 ore per prevenire ibernazione sandbox");
  console.log("[SchedulerManager]   [OFF] Catch-up NL     -> DISABILITATO (richiede approvazione manuale)");
  console.log("[SchedulerManager]   ✅ Verifica news   → ogni giorno alle 07:00 CET (AI + Startup + DEALROOM, rigenera se mancanti)");
  console.log("[SchedulerManager]   ✅ Verifica research → ogni giorno alle 07:15 CET (rigenera se mancanti)");
  console.log("[SchedulerManager]   ✅ Verifica LinkedIn → ogni giorno alle 09:30 CET (pubblica se nessun post oggi)");
  console.log("[SchedulerManager]   🚀 Breaking News   → ogni 3 ore alle :05 (analisi AI notizie urgenti, archivio dopo 6h)");
  console.log("[SchedulerManager]   🔬 Research        → lun/mer/ven alle 06:00 CET (10 ricerche AI/Startup/VC)");
  console.log("[SchedulerManager]   🧠 Channel Ingestor → lun/mer/ven alle 00:00 CET (RSS + AI per 6 canali)");
  console.log("[SchedulerManager]   📅 Events Aggregator → ogni 12 ore alle 06:30 e 18:30 CET (Luma ICS + RSS italiani)");
  console.log("[SchedulerManager]   📊 Daily Metrics Report → ogni giorno alle 18:00 CET (iscritti, NL, LinkedIn, contenuti) → ac@acinelli.com");

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

  // NEWSLETTER PROMOZIONALI (Business, Prompt Collection, Pubblicità) — TUTTE DISABILITATE
  // Rimossa per decisione editoriale 2026-04-12.
  // Restano attive solo: Daily Unificata (lun–ven 11:00) + Newsletter Sabato (12:00).
  console.log("[SchedulerManager]   📧 Newsletter Promozionali (Business/PromptCollection/Pubblicità) → DISABILITATE");

  // ══════════════════════════════════════════════════════════════════════════
  // LIST HYGIENE AUTOMATICA — ogni domenica alle 06:00 CET
  //   Recupera Global Unsubscribe + Bounce + Spam Report da SendGrid
  //   e marca come 'unsubscribed' nel DB tutti gli iscritti corrispondenti.
  // ══════════════════════════════════════════════════════════════════════════
  cron.schedule("0 6 * * 0", async () => {
    console.log("[SchedulerManager] ⏰ 06:00 CET (dom) — List Hygiene automatica...");
    await withLock("list-hygiene", async () => {
      try {
        const SENDGRID_KEY = process.env.SENDGRID_API_KEY;
        if (!SENDGRID_KEY) { console.warn("[ListHygiene] SENDGRID_API_KEY mancante — skip"); return; }

        const suppressedEmails = new Set<string>();
        const endpoints = [
          "asm/suppressions/global",
          "suppression/bounces",
          "suppression/spam_reports",
        ];
        for (const path of endpoints) {
          let offset = 0;
          while (true) {
            const res = await fetch(`https://api.sendgrid.com/v3/${path}?limit=500&offset=${offset}`, {
              headers: { Authorization: `Bearer ${SENDGRID_KEY}` },
            });
            if (!res.ok) break;
            const data = await res.json();
            const items: any[] = Array.isArray(data) ? data : (data.suppressions ?? []);
            if (items.length === 0) break;
            for (const item of items) {
              const email = (item.email ?? item).toString().toLowerCase().trim();
              if (email) suppressedEmails.add(email);
            }
            if (items.length < 500) break;
            offset += 500;
          }
        }
        console.log(`[ListHygiene] Totale soppressi SendGrid: ${suppressedEmails.size}`);

        const db = await getDb();
        if (!db) { console.warn("[ListHygiene] DB non disponibile — skip"); return; }
        const { subscribers: subsTable } = await import("../drizzle/schema");
        const { inArray } = await import("drizzle-orm");
        const activeRows = await db.select({ id: subsTable.id, email: subsTable.email })
          .from(subsTable)
          .where(eq(subsTable.status, "active"));
        const toRemove = activeRows.filter(r => suppressedEmails.has(r.email.toLowerCase().trim()));
        if (toRemove.length === 0) {
          console.log("[ListHygiene] ✅ Nessun iscritto da rimuovere — lista già pulita");
          return;
        }
        const ids = toRemove.map(r => r.id);
        await db.update(subsTable)
          .set({ status: "unsubscribed", unsubscribedAt: new Date() })
          .where(inArray(subsTable.id, ids));
        console.log(`[ListHygiene] ✅ ${toRemove.length} iscritti marcati 'unsubscribed'`);
        const { notifyOwner } = await import("./_core/notification");
        await notifyOwner({
          title: `🧹 List Hygiene domenicale completata`,
          content: `Rimossi ${toRemove.length} iscritti corrispondenti a indirizzi soppressi su SendGrid.\nTotale soppressi: ${suppressedEmails.size}`,
        });
      } catch (err) {
        console.error("[ListHygiene] ❌ Errore:", err);
      }
    });
  }, { timezone: TZ });
  console.log("[SchedulerManager]   🧹 List Hygiene → ogni domenica alle 06:00 CET (Global Unsubscribe + Bounce + Spam)");

  // ─── Delivery Rate Monitor ─────────────────────────────────────────────────
  // Controlla le statistiche SendGrid ogni giorno alle 11:30, 13:30 e 15:30 CET
  // (1h dopo i principali invii newsletter: 10:30, 12:30, 14:30)
  // Se il delivery rate scende sotto l'85%, notifica il proprietario.
  cron.schedule("0 30 9,11,13 * * 1,3,5", async () => {
    try {
      const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
      if (!SENDGRID_API_KEY) return;
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(
        `https://api.sendgrid.com/v3/stats?start_date=${today}&end_date=${today}&aggregated_by=day`,
        { headers: { Authorization: `Bearer ${SENDGRID_API_KEY}` } }
      );
      if (!res.ok) return;
      const data = await res.json() as Array<{ stats: Array<{ metrics: Record<string, number> }> }>;
      if (!data || data.length === 0) return;
      const metrics = data[0]?.stats?.[0]?.metrics ?? {};
      const requests = metrics.requests ?? 0;
      const delivered = metrics.delivered ?? 0;
      const bounces = (metrics.bounces ?? 0) + (metrics.blocks ?? 0);
      if (requests < 10) return; // Troppo pochi invii, skip
      const deliveryRate = requests > 0 ? (delivered / requests) * 100 : 0;
      const bounceRate = requests > 0 ? (bounces / requests) * 100 : 0;
      const DELIVERY_THRESHOLD = 85;
      const BOUNCE_THRESHOLD = 5;
      if (deliveryRate < DELIVERY_THRESHOLD || bounceRate > BOUNCE_THRESHOLD) {
        const { notifyOwner } = await import("./_core/notification");
        await notifyOwner({
          title: `⚠️ Alert Deliverability — ${today}`,
          content: `Delivery rate: ${deliveryRate.toFixed(1)}% (soglia: ${DELIVERY_THRESHOLD}%)\nBounce rate: ${bounceRate.toFixed(1)}% (soglia: ${BOUNCE_THRESHOLD}%)\nRichieste: ${requests} | Consegnate: ${delivered} | Bounce/Block: ${bounces}\n\nAzione consigliata: verificare la reputazione IP su SendGrid Dashboard → Sender Authentication.`,
        });
        console.warn(`[DeliveryMonitor] ⚠️ Delivery rate basso: ${deliveryRate.toFixed(1)}% (${delivered}/${requests})`);
      } else {
        console.log(`[DeliveryMonitor] ✅ Delivery OK: ${deliveryRate.toFixed(1)}% (${delivered}/${requests})`);
      }
    } catch (err) {
      console.error("[DeliveryMonitor] Errore:", err);
    }
  }, { timezone: TZ });
  console.log("[SchedulerManager]   📊 Delivery Monitor → 11:30, 13:30, 15:30 CET lun/mer/ven (alert se delivery < 85%)");

  // ══════════════════════════════════════════════════════════════════════════
  // SPAM RATE MONITOR — ogni giorno alle 19:00 CET
  //   Controlla il tasso di spam degli ultimi 2 giorni.
  //   Se supera lo 0.1% (soglia critica SendGrid), invia un alert immediato.
  //   Soglia 0.1% = 1 segnalazione ogni 1.000 email inviate.
  // ══════════════════════════════════════════════════════════════════════════
  cron.schedule("0 19 * * *", async () => {
    console.log("[SpamMonitor] ⏰ 19:00 CET — Controllo spam rate...");
    try {
      const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
      if (!SENDGRID_API_KEY) { console.warn("[SpamMonitor] SENDGRID_API_KEY mancante — skip"); return; }
      // Recupera statistiche degli ultimi 2 giorni
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 2);
      const start = startDate.toISOString().split("T")[0];
      const end = endDate.toISOString().split("T")[0];
      const res = await fetch(
        `https://api.sendgrid.com/v3/stats?start_date=${start}&end_date=${end}&aggregated_by=day`,
        { headers: { Authorization: `Bearer ${SENDGRID_API_KEY}` } }
      );
      if (!res.ok) { console.warn(`[SpamMonitor] API error ${res.status}`); return; }
      const data = await res.json() as Array<{ date: string; stats: Array<{ metrics: Record<string, number> }> }>;
      if (!data || data.length === 0) return;
      // Aggrega i dati degli ultimi 2 giorni
      let totalDelivered = 0;
      let totalSpam = 0;
      for (const day of data) {
        const metrics = day.stats?.[0]?.metrics ?? {};
        totalDelivered += metrics.delivered ?? 0;
        totalSpam += metrics.spam_reports ?? 0;
      }
      if (totalDelivered < 100) { console.log(`[SpamMonitor] Troppo pochi invii (${totalDelivered}) — skip`); return; }
      const spamRate = (totalSpam / totalDelivered) * 100;
      const SPAM_THRESHOLD = 0.1; // Soglia critica SendGrid
      console.log(`[SpamMonitor] Spam rate: ${spamRate.toFixed(3)}% (${totalSpam}/${totalDelivered} email)`);
      if (spamRate >= SPAM_THRESHOLD) {
        const { notifyOwner } = await import("./_core/notification");
        const severity = spamRate >= 0.3 ? "🔴 CRITICO" : spamRate >= 0.2 ? "🟠 ALTO" : "🟡 ATTENZIONE";
        await notifyOwner({
          title: `${severity} Spam Rate Alert — ${spamRate.toFixed(3)}%`,
          content: `Il tasso di spam ha superato la soglia critica SendGrid (0.1%).\n\n` +
            `📊 Dati ultimi 2 giorni:\n` +
            `• Email consegnate: ${totalDelivered.toLocaleString("it-IT")}\n` +
            `• Segnalazioni spam: ${totalSpam}\n` +
            `• Spam rate: ${spamRate.toFixed(3)}% (soglia: ${SPAM_THRESHOLD}%)\n\n` +
            `⚠️ Azioni immediate consigliate:\n` +
            `1. Verificare la lista iscritti (rimuovere inattivi da >6 mesi)\n` +
            `2. Controllare SendGrid Dashboard → Reputation\n` +
            `3. Rivedere oggetto e contenuto dell'ultima newsletter\n` +
            `4. Verificare se ci sono email acquistate o non opt-in nella lista`,
        });
        console.warn(`[SpamMonitor] ⚠️ ALERT: spam rate ${spamRate.toFixed(3)}% supera soglia ${SPAM_THRESHOLD}%`);
      } else {
        console.log(`[SpamMonitor] ✅ Spam rate OK: ${spamRate.toFixed(3)}% (sotto soglia ${SPAM_THRESHOLD}%)`);
      }
    } catch (err) {
      console.error("[SpamMonitor] ❌ Errore:", err);
    }
  }, { timezone: TZ });
  console.log("[SchedulerManager]   🚨 Spam Monitor → ogni giorno alle 19:00 CET (alert se spam rate ≥ 0.1%)");

  // ══════════════════════════════════════════════════════════════════════════
  // OSSERVATORIO TECH — ogni giorno alle 00:30 CET
  //   Sincronizza i nuovi editoriali di Andrea Cinelli nella tabella
  //   osservatorio_articles (upsert incrementale, nessun DELETE).
  //   Finestra: ultimi 90 giorni.
  // ══════════════════════════════════════════════════════════════════════════
  cron.schedule("30 0 * * *", async () => {
    console.log("[OsservatorioScheduler] ⏰ 00:30 CET — Sincronizzazione Osservatorio Tech...");
    await withLock("osservatorio-sync", async () => {
      try {
        const inserted = await syncOsservatorioArticles();
        console.log(`[OsservatorioScheduler] ✅ Completato: ${inserted} nuovi articoli inseriti`);
      } catch (err) {
        console.error("[OsservatorioScheduler] ❌ Errore sincronizzazione:", err);
      }
    });
  }, { timezone: TZ });
  console.log("[SchedulerManager]   📰 Osservatorio Tech → ogni giorno alle 00:30 CET (sync incrementale editoriali Andrea Cinelli)");

  // ══════════════════════════════════════════════════════════════════════════
  // PPV EDITORIAL CAMPAIGN — 11–15 maggio 2026
  //   12:30 CET — Preview newsletter ProofPressVerify a ac@acinelli.com
  //   12:50 CET — Articolo editoriale firmato Andrea Cinelli su ProofPressVerify + post LinkedIn
  //   17:30 CET — Newsletter promozionale ProofPressVerify agli iscritti attivi
  // ══════════════════════════════════════════════════════════════════════════
  cron.schedule("30 12 * * 1-5", async () => {
    console.log("[PPV Campaign] ⏰ 12:30 CET — Invio preview newsletter ProofPressVerify...");
    try {
      const { sendPpvNewsletterPreview } = await import("./ppvEditorialScheduler");
      await sendPpvNewsletterPreview();
    } catch (err) { console.error("[PPV Campaign] ❌ Preview newsletter:", err); }
  }, { timezone: TZ });

  cron.schedule("50 12 * * 1-5", async () => {
    console.log("[PPV Campaign] ⏰ 12:50 CET — Generazione articolo editoriale ProofPressVerify...");
    try {
      const { generatePpvEditorial } = await import("./ppvEditorialScheduler");
      const result = await generatePpvEditorial();
      if (result.success) console.log(`[PPV Campaign] ✅ Articolo pubblicato: ${result.title}`);
      else console.warn(`[PPV Campaign] ⚠️ Articolo non generato: ${result.error}`);
    } catch (err) { console.error("[PPV Campaign] ❌ Articolo editoriale:", err); }
  }, { timezone: TZ });

  cron.schedule("30 17 * * 1-5", async () => {
    console.log("[PPV Campaign] ⏰ 17:30 CET — Invio newsletter ProofPressVerify agli iscritti...");
    try {
      const { sendPpvNewsletterToAll } = await import("./ppvEditorialScheduler");
      await sendPpvNewsletterToAll();
    } catch (err) { console.error("[PPV Campaign] ❌ Newsletter iscritti:", err); }
  }, { timezone: TZ });

  console.log("[SchedulerManager]   🔐 PPV Campaign → 12:30 preview, 12:50 articolo+LinkedIn, 17:30 newsletter (lun-ven, 11-15 mag 2026)");

  // ══════════════════════════════════════════════════════════════════════════
  // SENDGRID SUPPRESSION SYNC — ogni 12 ore (06:00 e 18:00 CET)
  //   Recupera da SendGrid: bounce, spam_report, invalid_emails, unsubscribes globali
  //   Marca automaticamente come 'unsubscribed' nel DB tutti gli indirizzi trovati
  //   Protegge le email in PROTECTED_EMAILS (ac@acinelli.com, andrea@acinelli.com)
  // ══════════════════════════════════════════════════════════════════════════
  const syncSendgridSuppressions = async () => {
    console.log("[SendgridSync] ⏰ Avvio sincronizzazione soppressioni SendGrid...");
    await withLock("sendgrid-suppression-sync", async () => {
      try {
        const SGKEY = process.env.SENDGRID_API_KEY;
        if (!SGKEY) {
          console.warn("[SendgridSync] ⚠️ SENDGRID_API_KEY non configurata, skip.");
          return;
        }

        // Funzione helper per fetch paginato SendGrid
        const fetchAllSuppressed = async (endpoint: string): Promise<string[]> => {
          const emails: string[] = [];
          let offset = 0;
          const limit = 500;
          while (true) {
            const res = await fetch(
              `https://api.sendgrid.com/v3${endpoint}?limit=${limit}&offset=${offset}`,
              { headers: { Authorization: `Bearer ${SGKEY}` } }
            );
            if (!res.ok) break;
            const data = await res.json() as Array<{ email: string }>;
            if (!Array.isArray(data) || data.length === 0) break;
            data.forEach(r => { if (r.email) emails.push(r.email.trim().toLowerCase()); });
            if (data.length < limit) break;
            offset += limit;
          }
          return emails;
        };

        // Recupera tutte le categorie di soppressione
        const [bounces, spamReports, invalidEmails, globalUnsubs] = await Promise.all([
          fetchAllSuppressed("/suppression/bounces"),
          fetchAllSuppressed("/suppression/spam_reports"),
          fetchAllSuppressed("/suppression/invalid_emails"),
          fetchAllSuppressed("/suppression/unsubscribes"),
        ]);

        // Deduplicazione
        const allSuppressed = Array.from(new Set([
          ...bounces,
          ...spamReports,
          ...invalidEmails,
          ...globalUnsubs,
        ]));

        console.log(`[SendgridSync] 📊 Trovati: ${bounces.length} bounce, ${spamReports.length} spam, ${invalidEmails.length} invalid, ${globalUnsubs.length} unsub globali → ${allSuppressed.length} unici`);

        // Aggiorna il DB: marca come unsubscribed tutti gli indirizzi soppressi
        let updated = 0;
        let skipped = 0;
        for (const email of allSuppressed) {
          try {
            await unsubscribeEmail(email); // già protegge PROTECTED_EMAILS
            updated++;
          } catch (err) {
            skipped++;
          }
        }

        console.log(`[SendgridSync] ✅ Completato: ${updated} indirizzi marcati unsubscribed, ${skipped} errori/protetti`);

        // Notifica owner se ci sono nuove soppressioni significative
        if (bounces.length > 0 || spamReports.length > 0) {
          const { notifyOwner } = await import("./_core/notification");
          await notifyOwner({
            title: `📧 SendGrid Sync: ${updated} soppressioni rimosse dalle liste`,
            content: `Bounce: ${bounces.length} | Spam: ${spamReports.length} | Invalid: ${invalidEmails.length} | Unsub globali: ${globalUnsubs.length}\nTotale rimossi: ${updated} indirizzi marcati unsubscribed su entrambe le liste.`,
          });
        }
      } catch (err) {
        console.error("[SendgridSync] ❌ Errore sincronizzazione:", err);
      }
    });
  };

  // Esegui subito all'avvio del server (per recuperare soppressioni accumulate)
  setTimeout(() => syncSendgridSuppressions(), 30_000); // 30 secondi dopo l'avvio

  // Cron ogni 12 ore: 06:00 CET e 18:00 CET
  cron.schedule("0 4 * * *", syncSendgridSuppressions, { timezone: TZ });  // 06:00 CET
  cron.schedule("0 16 * * *", syncSendgridSuppressions, { timezone: TZ }); // 18:00 CET
  console.log("[SchedulerManager]   📧 SendGrid Suppression Sync → all'avvio + ogni 12h (06:00 e 18:00 CET) — bounce/spam/invalid/unsub");
}
