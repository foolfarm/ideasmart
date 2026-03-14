/**
 * IDEASMART — Scheduler Manager Centralizzato
 * ─────────────────────────────────────────────────────────────────────────────
 * Gestisce tutte le routine automatiche del sito con orari CET precisi.
 *
 * Routine configurate (tutti gli orari sono in CET/CEST — ora italiana):
 *
 *  ┌─────────────────────────────────────────────────────────────────────────┐
 *  │  CONTENUTI GIORNALIERI (ogni giorno alle 00:00 CET)                     │
 *  │  00:00 — News AI (20 notizie aggiornate)                                │
 *  │  00:05 — Editoriale del giorno + Startup del giorno                     │
 *  │  00:10 — Immagini stock Pexels per i nuovi contenuti                    │
 *  │                                                                          │
 *  │  CONTENUTI SETTIMANALI (ogni lunedì alle 00:00 CET)                     │
 *  │  00:15 — 4 Reportage su startup AI italiane                             │
 *  │  00:20 — 4 Analisi di mercato AI                                        │
 *  │                                                                          │
 *  │  NEWSLETTER (ora italiana)                                               │
 *  │  Lunedì 10:00 — Newsletter settimanale                                  │
 *  │  Venerdì 10:00 — Newsletter settimanale                                 │
 *  └─────────────────────────────────────────────────────────────────────────┘
 *
 * node-cron usa il fuso orario del server. Il server gira in UTC.
 * CET = UTC+1 (inverno), CEST = UTC+2 (estate).
 * Usiamo timezone: "Europe/Rome" per gestire automaticamente l'ora legale.
 */

import cron from "node-cron";
import { refreshNewsIfNeeded } from "./newsScheduler";
import { runDailyContentRefresh } from "./dailyContentScheduler";
import { generateWeeklyReportage } from "./weeklyReportageScheduler";
import { generateMarketAnalysis } from "./marketAnalysisScheduler";
import { sendWeeklyNewsletter } from "./newsletterScheduler";

const TZ = "Europe/Rome";

// ─── Chiavi per evitare doppi invii ──────────────────────────────────────────

let lastNewsletterSentKey: string | null = null;

function getTodayKey(): string {
  const now = new Date();
  // Usa l'ora italiana per determinare il giorno
  const italianDate = new Intl.DateTimeFormat("it-IT", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return italianDate;
}

function getWeekKey(): string {
  const now = new Date();
  // Calcola la settimana ISO in ora italiana
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

  // ── 1. NEWS AI — ogni giorno alle 00:00 CET ──────────────────────────────
  // Cron: "0 0 * * *" = alle 00:00 ogni giorno
  cron.schedule("0 0 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 00:00 CET — Avvio aggiornamento News AI...");
    try {
      await refreshNewsIfNeeded();
      console.log("[SchedulerManager] ✅ News AI aggiornate con successo");
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore aggiornamento News AI:", err);
    }
  }, { timezone: TZ });

  // ── 2. EDITORIALE + STARTUP DEL GIORNO — ogni giorno alle 00:05 CET ─────
  cron.schedule("5 0 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 00:05 CET — Avvio Editoriale + Startup del giorno...");
    try {
      await runDailyContentRefresh();
      console.log("[SchedulerManager] ✅ Editoriale e Startup del giorno aggiornati");
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore Editoriale/Startup:", err);
    }
  }, { timezone: TZ });

  // ── 3. REPORTAGE SETTIMANALI — ogni lunedì alle 00:15 CET ────────────────
  // Cron: "15 0 * * 1" = alle 00:15 ogni lunedì
  cron.schedule("15 0 * * 1", async () => {
    console.log("[SchedulerManager] ⏰ Lunedì 00:15 CET — Avvio generazione Reportage settimanali...");
    try {
      await generateWeeklyReportage();
      console.log("[SchedulerManager] ✅ Reportage settimanali generati con successo");
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore generazione Reportage:", err);
    }
  }, { timezone: TZ });

  // ── 4. ANALISI DI MERCATO — ogni lunedì alle 00:20 CET ───────────────────
  cron.schedule("20 0 * * 1", async () => {
    console.log("[SchedulerManager] ⏰ Lunedì 00:20 CET — Avvio generazione Analisi di Mercato...");
    try {
      await generateMarketAnalysis();
      console.log("[SchedulerManager] ✅ Analisi di Mercato generate con successo");
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore generazione Analisi di Mercato:", err);
    }
  }, { timezone: TZ });

  // ── 5. NEWSLETTER — ogni lunedì e venerdì alle 10:00 CET ─────────────────
  // Cron: "0 10 * * 1,5" = alle 10:00 ogni lunedì (1) e venerdì (5)
  cron.schedule("0 10 * * 1,5", async () => {
    const now = new Date();
    const italianNow = new Date(now.toLocaleString("en-US", { timeZone: TZ }));
    const dayName = italianNow.getDay() === 1 ? "Lunedì" : "Venerdì";
    const weekKey = getWeekKey();
    const sendKey = `${weekKey}-${italianNow.getDay()}`;

    console.log(`[SchedulerManager] ⏰ ${dayName} 10:00 CET — Verifica invio Newsletter...`);

    // Evita doppi invii (es. se il server si riavvia durante l'ora 10:xx)
    if (lastNewsletterSentKey === sendKey) {
      console.log(`[SchedulerManager] ⏭️ Newsletter già inviata per ${sendKey}, skip`);
      return;
    }

    try {
      lastNewsletterSentKey = sendKey;
      await sendWeeklyNewsletter();
      console.log(`[SchedulerManager] ✅ Newsletter inviata con successo (${dayName})`);
    } catch (err) {
      lastNewsletterSentKey = null; // Reset per permettere retry
      console.error("[SchedulerManager] ❌ Errore invio Newsletter:", err);
    }
  }, { timezone: TZ });

  // ── Log riepilogo ─────────────────────────────────────────────────────────
  console.log("[SchedulerManager] ✅ Tutti gli scheduler attivi:");
  console.log("[SchedulerManager]   📰 News AI       → ogni giorno alle 00:00 CET");
  console.log("[SchedulerManager]   ✍️  Editoriale    → ogni giorno alle 00:05 CET");
  console.log("[SchedulerManager]   🏢 Reportage     → ogni lunedì alle 00:15 CET");
  console.log("[SchedulerManager]   📊 Analisi       → ogni lunedì alle 00:20 CET");
  console.log("[SchedulerManager]   📧 Newsletter    → lunedì e venerdì alle 10:00 CET");
}
