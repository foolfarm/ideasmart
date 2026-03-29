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
 *  │  00:20 — Analisi di mercato AI (ogni lunedì)                            │
 *  │  01:00 — News Startup (scraping RSS reale)                              │
 *  │  01:05 — Editoriale Startup + Startup della Settimana                   │
 *  │  01:15 — Reportage Startup (ogni lunedì)                                │
 *  │  01:20 — Analisi Mercato Startup (ogni lunedì)                          │
 *  │  02:00 — Audit notturno URL notizie                                     │
 *  │  05:30 — Invalidazione cache (contenuti freschi disponibili)             │
 *  │  06:00 — Generazione 10 ricerche AI/Startup/VC (Research)               │
 *  │  06:45 — Audit link newsletter pre-invio                                │
 *  │  [DISABILITATO] 05:45 — Snapshot barometro politico (Sondaggi stand by) │
 *  │  [DISABILITATO] Finance, Health, Sport, Luxury, Music, Motori, ecc.      │
 *  │                                                                          │
 *  │  NEWSLETTER SETTIMANALE (3 canali, 3 giorni)                             │
 *  │  Lunedì    07:00 — Preview AI News → ac@acinelli.com                   │
 *  │  Lunedì    07:30 — Newsletter AI News + Ricerche → tutti iscritti       │
 *  │  Martedì   — Nessun invio                                              │
 *  │  Mercoledì 07:00 — Preview Startup News → ac@acinelli.com              │
 *  │  Mercoledì 07:30 — Newsletter Startup News + Ricerche → tutti iscritti │
 *  │  Giovedì   — Nessun invio                                              │
 *  │  Venerdì   07:00 — Preview DEALROOM News → ac@acinelli.com             │
 *  │  Venerdì   07:30 — Newsletter DEALROOM News (deal sett.) → tutti iscr. │
 *  │  Sabato    — Nessun invio                                              │
 *  │  Domenica  — Nessun invio                                              │
 *  │                                                                          │
 *  │  LINKEDIN AUTOPOST — 3 slot giornalieri                                  │
 *  │  10:30 — Post mattino: AI4Business (fisso)                              │
 *  │  13:00 — Post pomeriggio: Startup News (fisso)                          │
 *  │  17:30 — Post sera: AI4Business o Startup (rotazione settimanale)       │
 *  └─────────────────────────────────────────────────────────────────────────┘
 *
 * node-cron usa il fuso orario del server. Il server gira in UTC.
 * CET = UTC+1 (inverno), CEST = UTC+2 (estate).
 * Usiamo timezone: "Europe/Rome" per gestire automaticamente l'ora legale.
 */

import cron from "node-cron";
import { refreshAINewsFromRSS, refreshMusicNewsFromRSS, refreshStartupNewsFromRSS, refreshFinanceNewsFromRSS, refreshHealthNewsFromRSS, refreshSportNewsFromRSS, refreshLuxuryNewsFromRSS, refreshGossipNewsFromRSS, refreshCybersecurityNewsFromRSS, refreshSondaggiNewsFromRSS, refreshNewsGeneraliFromRSS, refreshMotoriNewsFromRSS, refreshTennisNewsFromRSS, refreshBasketNewsFromRSS, refreshDealroomNewsFromRSS } from "./rssNewsScheduler";
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
import { generateDailyResearch } from "./researchGenerator";
import { runMorningHealthReport } from "./morningHealthReport";
import { publishLinkedInPost, publishDailyLinkedInPosts } from "./linkedinPublisher";
import { sendEmail } from "./email";

// ── Helper: invia alert email al team operativo ───────────────────────────────
async function sendSchedulerAlert(subject: string, bodyHtml: string): Promise<void> {
  const ALERT_EMAIL = "info@ideasmart.ai";
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
import { saveBarometroSnapshot, getDb } from "./db";
import { invokeLLM } from "./_core/llm";
import { newsItems as newsItemsTable } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { aggregateEvents } from "./eventsAggregator";

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
  // SEZIONE /music — ITsMusic [DISABILITATO — pivot IdeaSmart Research]
  // ══════════════════════════════════════════════════════════════════════════
  // cron.schedule("30 0 * * *", ...) — refreshMusicNewsFromRSS DISABILITATO
  // cron.schedule("35 0 * * *", ...) — generateMusicEditorial DISABILITATO
  // cron.schedule("45 0 * * 1", ...) — generateMusicReportage DISABILITATO
  // cron.schedule("50 0 * * 1", ...) — generateMusicMarketAnalysis DISABILITATO

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
  // SEZIONE /dealroom — DEALROOM: Round, Funding, VC, M&A
  // Scraping ogni giorno alle 01:30 CET (dopo Startup News)
  // ══════════════════════════════════════════════════════════════════════════

  cron.schedule("30 1 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 01:30 CET — Avvio scraping RSS DEALROOM (round, funding, VC, M&A)...");
    await withLock("rss-dealroom", async () => {
      try { await refreshDealroomNewsFromRSS(); invalidateSection('dealroom'); console.log("[SchedulerManager] ✅ DEALROOM News aggiornate + cache invalidata"); }
      catch (err) { console.error("[SchedulerManager] ❌ DEALROOM News:", err); }
    });
  }, { timezone: TZ });

  // ══════════════════════════════════════════════════════════════════════════
  // SEZIONE /finance — Finance & Markets [DISABILITATO — pivot IdeaSmart Research]
  // ══════════════════════════════════════════════════════════════════════════
  // cron.schedule("30 1 * * *", ...) — refreshFinanceNewsFromRSS DISABILITATO
  // cron.schedule("35 1 * * *", ...) — generateFinanceEditorial DISABILITATO
  // cron.schedule("45 1 * * 1", ...) — generateFinanceReportage DISABILITATO
  // cron.schedule("50 1 * * 1", ...) — generateFinanceMarketAnalysis DISABILITATO

  // ══════════════════════════════════════════════════════════════════════════
  // AUDIT NOTTURNO — ogni giorno alle 02:00 CET
  // ══════════════════════════════════════════════════════════════════════════

  cron.schedule("0 2 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 02:00 CET — Audit notturno URL notizie...");
    try { await runNightlyAudit(); console.log("[SchedulerManager] ✅ Audit notturno completato"); }
    catch (err) { console.error("[SchedulerManager] ❌ Audit notturno:", err); }
  }, { timezone: TZ });

  // ══════════════════════════════════════════════════════════════════════════
  // SEZIONE /health — Health & Biotech [DISABILITATO — pivot IdeaSmart Research]
  // ══════════════════════════════════════════════════════════════════════════
  // cron.schedule("15 2 * * *", ...) — refreshHealthNewsFromRSS DISABILITATO
  // cron.schedule("20 2 * * *", ...) — generateHealthEditorial DISABILITATO
  // cron.schedule("30 2 * * 1", ...) — generateHealthReportage DISABILITATO
  // cron.schedule("35 2 * * 1", ...) — generateHealthMarketAnalysis DISABILITATO

  // ══════════════════════════════════════════════════════════════════════════
  // SEZIONE /sport — Sport & Business [DISABILITATO — pivot IdeaSmart Research]
  // ══════════════════════════════════════════════════════════════════════════
  // cron.schedule("45 2 * * *", ...) — refreshSportNewsFromRSS DISABILITATO
  // cron.schedule("50 2 * * *", ...) — generateSportEditorial DISABILITATO
  // cron.schedule("55 2 * * 1", ...) — generateSportReportage DISABILITATO
  // cron.schedule("58 2 * * 1", ...) — generateSportMarketAnalysis DISABILITATO

  // ══════════════════════════════════════════════════════════════════════════
  // SEZIONE /luxury — Lifestyle & Luxury [DISABILITATO — pivot IdeaSmart Research]
  // ══════════════════════════════════════════════════════════════════════════
  // cron.schedule("5 3 * * *", ...) — refreshLuxuryNewsFromRSS DISABILITATO
  // cron.schedule("10 3 * * *", ...) — generateLuxuryEditorial DISABILITATO
  // cron.schedule("20 3 * * 1", ...) — generateLuxuryReportage DISABILITATO
  // cron.schedule("25 3 * * 1", ...) — generateLuxuryMarketAnalysis DISABILITATO

  // ══════════════════════════════════════════════════════════════════════════
  // SEZIONE /gossip — Business Gossip [DISABILITATO — pivot IdeaSmart Research]
  // ══════════════════════════════════════════════════════════════════════════
  // cron.schedule("30 3 * * *", ...) — refreshGossipNewsFromRSS DISABILITATO

  // ══════════════════════════════════════════════════════════════════════════
  // SEZIONE /cybersecurity — Cybersecurity [DISABILITATO — pivot IdeaSmart Research]
  // ══════════════════════════════════════════════════════════════════════════
  // cron.schedule("45 3 * * *", ...) — refreshCybersecurityNewsFromRSS DISABILITATO

  // ══════════════════════════════════════════════════════════════════════════
  // SEZIONI DISABILITATE — pivot IdeaSmart Research (27 Mar 2026)
  // ══════════════════════════════════════════════════════════════════════════
  // cron.schedule("0 4 * * *", ...) — refreshSondaggiNewsFromRSS DISABILITATO
  // cron.schedule("0 4 15 * * *", ...) — refreshNewsGeneraliFromRSS DISABILITATO
  // cron.schedule("0 30 4 * * *", ...) — refreshMotoriNewsFromRSS DISABILITATO
  // cron.schedule("0 45 4 * * *", ...) — refreshTennisNewsFromRSS DISABILITATO
  // cron.schedule("0 0 5 * * *", ...) — refreshBasketNewsFromRSS DISABILITATO

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
  // SNAPSHOT BAROMETRO POLITICO — [DISABILITATO — sezione Sondaggi in stand by, 28 Mar 2026]
  // ══════════════════════════════════════════════════════════════════════════
  // Ogni giorno alle 05:45 salviamo uno snapshot del barometro politico
  // per alimentare il grafico storico a 4 settimane nel widget Sondaggi.
  // cron.schedule("45 5 * * *", async () => { // DISABILITATO
  if (false) { // DISABILITATO — sezione Sondaggi in stand by
  (async () => {
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
  })(); } // fine blocco DISABILITATO barometro

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

  // ══════════════════════════════════════════════════════════════════════════
  // VERIFICA GIORNALIERA NOTIZIE — 07:00 CET
  // Controlla che AI4Business e Startup abbiano notizie di oggi.
  // Se mancano (es. il cron notturno era offline), le genera subito.
  // Questo è un secondo livello di sicurezza rispetto al catch-up all'avvio.
  // ══════════════════════════════════════════════════════════════════════════
  cron.schedule("0 7 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 07:00 CET — Verifica giornaliera notizie AI4Business e Startup...");
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

        const sectionsToVerify: Array<{ section: 'ai' | 'startup'; label: string; refreshFn: () => Promise<void> }> = [
          { section: 'ai', label: 'AI4Business', refreshFn: async () => { await refreshAINewsFromRSS(); } },
          { section: 'startup', label: 'Startup News', refreshFn: async () => { await refreshStartupNewsFromRSS(); } },
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
  // LINKEDIN AUTOPOST — 3 post giornalieri: 10:30 CET (mattino AI) + 13:00 CET (startup) + 17:30 CET (sera)
  // ══════════════════════════════════════════════════════════════════════════

  // ══════════════════════════════════════════════════════════════════════════
  // VERIFICA GIORNALIERA LINKEDIN — 10:00 CET
  // Controlla che i post LinkedIn del giorno siano stati pubblicati.
  // Se il cron delle 10:30 / 13:00 / 17:30 era offline, pubblica subito.
  // Questo cron gira 30 minuti PRIMA del post mattino per garantire
  // che almeno un post sia sempre pubblicato ogni giorno.
  // ══════════════════════════════════════════════════════════════════════════
  cron.schedule("0 10 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 10:00 CET — Verifica giornaliera post LinkedIn...");
    await withLock("daily-linkedin-check", async () => {
      try {
        const liCheckDb = await getDb();
        if (!liCheckDb) { console.warn("[SchedulerManager] ⚠️ Verifica LinkedIn: DB non disponibile"); return; }
        const { linkedinPosts: lpCheckTable } = await import("../drizzle/schema");
        const { and: andLi } = await import("drizzle-orm");
        const nowCET = new Date(new Date().toLocaleString("en-US", { timeZone: TZ }));
        const today = nowCET.toLocaleDateString("en-CA", { timeZone: TZ }); // YYYY-MM-DD

        // Controlla se esiste almeno un post di oggi (qualsiasi slot)
        const existingToday = await liCheckDb.select({ id: lpCheckTable.id, slot: lpCheckTable.slot })
          .from(lpCheckTable)
          .where(eq(lpCheckTable.dateLabel, today))
          .limit(3);

        const publishedSlots = existingToday.map(p => p.slot);

        if (publishedSlots.length === 0) {
          // Nessun post oggi: pubblica subito il post mattino
          console.log("[SchedulerManager] 🔄 VERIFICA 10:00: nessun post LinkedIn oggi — pubblico post mattino ora...");
          await withLock("linkedin-morning", async () => {
            const result = await publishLinkedInPost("morning");
            console.log(`[SchedulerManager] ✅ VERIFICA 10:00: LinkedIn MATTINO: ${result.published}/1 post pubblicati`);
            invalidateBySection("home");
          });
        } else {
          console.log(`[SchedulerManager] ✅ VERIFICA 10:00: LinkedIn ha già ${publishedSlots.length} post oggi (${publishedSlots.join(", ")}) — OK`);
        }
      } catch (err) {
        console.error("[SchedulerManager] ❌ Verifica giornaliera LinkedIn errore:", err);
      }
    });
  }, { timezone: TZ });

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

  // Post Startup pomeridiano — 13:00 CET (dedicato esclusivamente alle Startup News)
  cron.schedule("0 13 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 13:00 CET — Pubblicazione LinkedIn STARTUP POMERIGGIO...");
    await withLock("linkedin-startup-afternoon", async () => {
      try {
        const result = await publishLinkedInPost("startup-afternoon");
        console.log(`[SchedulerManager] ✅ LinkedIn STARTUP POMERIGGIO: ${result.published}/1 post pubblicati`);
        if (result.errors.length > 0) {
          console.error("[SchedulerManager] ⚠️ LinkedIn STARTUP POMERIGGIO errori:", result.errors);
        }
        // Invalida cache Punto del Giorno
        invalidateBySection("home");
      } catch (err) {
        console.error("[SchedulerManager] ❌ Errore LinkedIn STARTUP POMERIGGIO:", err);
      }
    });
  }, { timezone: TZ });

  // [DISABILITATO] Slot 15:00 CET (afternoon) — rimosso, ora solo 3 slot: 10:30 / 13:00 / 17:30
  // cron.schedule("0 15 * * *", ...) — linkedin-afternoon DISABILITATO

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

      // Controlla se il post Startup pomeridiano (13:00) è mancato
      if (currentMinutes >= 13 * 60) {
        const existingStartupAfternoon = await catchUpDb.select({ id: lpTable.id })
          .from(lpTable)
          .where(andOp(eq(lpTable.dateLabel, today), eq(lpTable.slot, "startup-afternoon")))
          .limit(1);
        if (existingStartupAfternoon.length === 0) {
          console.log("[SchedulerManager] 🔄 CATCH-UP: post STARTUP POMERIGGIO mancato, pubblico ora...");
          await withLock("linkedin-startup-afternoon", async () => {
            const result = await publishLinkedInPost("startup-afternoon");
            console.log(`[SchedulerManager] ✅ CATCH-UP STARTUP POMERIGGIO: ${result.published}/1 post pubblicati`);
            invalidateBySection("home");
          });
        } else {
          console.log("[SchedulerManager] ✅ CATCH-UP: post STARTUP POMERIGGIO già presente nel DB, nessuna azione.");
        }
      }

      // [DISABILITATO] Catch-up slot afternoon 15:00 — rimosso (ora solo 3 slot: 10:30 / 13:00 / 17:30)

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
  }, 4 * 60 * 60 * 1000); // ogni 4 ore (ridotto da 12h per prevenire ibernazione sandbox)

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

  // ═══════════════════════════════════════════════════════════════════════════
  // IDEASMART RESEARCH — ogni giorno alle 06:00 CET
  // Genera 10 ricerche su Startup, VC e AI Trends da fonti specializzate
  // ═══════════════════════════════════════════════════════════════════════════
  cron.schedule(
    "0 0 6 * * *", // ogni giorno alle 06:00 CET
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
      // Pivot IdeaSmart Research: solo AI4Business e Startup News nel catch-up
      const sectionsToCheck: Array<{ section: 'ai' | 'startup'; label: string; refreshFn: () => Promise<void> }> = [
        { section: 'ai', label: 'AI4Business', refreshFn: async () => { await refreshAINewsFromRSS(); } },
        { section: 'startup', label: 'Startup News', refreshFn: async () => { await refreshStartupNewsFromRSS(); } },
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
  console.log("[SchedulerManager]   💼 LinkedIn STARTUP  → ogni giorno alle 13:00 CET (Startup News, sempre)");
  console.log("[SchedulerManager]   💼 LinkedIn POMERIGGIO → ogni giorno alle 15:00 CET (sezione opposta rispetto al mattino)");
  console.log("[SchedulerManager]   💼 LinkedIn SERA → ogni giorno alle 17:30 CET (Vibe Coding / AI / Startup / Mercato)");
  console.log("[SchedulerManager]   📌 Punto del Giorno → aggiornato 3 volte al giorno: 10:30, 15:00 e 17:30 CET");
  console.log("[SchedulerManager]   🏓 Keep-Alive      → ping HTTP ogni 4 ore per prevenire ibernazione sandbox");
  console.log("[SchedulerManager]   🔄 Catch-up NL     → all'avvio, forza invio newsletter se mancata (dopo le 07:30 CET)");
  console.log("[SchedulerManager]   ✅ Verifica news   → ogni giorno alle 07:00 CET (AI4Business + Startup, rigenera se mancanti)");
  console.log("[SchedulerManager]   ✅ Verifica research → ogni giorno alle 07:15 CET (rigenera se mancanti)");
  console.log("[SchedulerManager]   ✅ Verifica LinkedIn → ogni giorno alle 10:00 CET (pubblica se nessun post oggi)");
  console.log("[SchedulerManager]   🚀 Breaking News   → ogni ora alle :05 (analisi AI notizie urgenti, archivio dopo 6h)");
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
}
