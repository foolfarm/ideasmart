/**
 * IDEASMART — Scheduler Manager Centralizzato
 * ─────────────────────────────────────────────────────────────────────────────
 * Gestisce tutte le routine automatiche del sito con orari CET precisi.
 *
 * Routine configurate (tutti gli orari sono in CET/CEST — ora italiana):
 *
 *  ┌─────────────────────────────────────────────────────────────────────────┐
 *  │  SEZIONE /ai — AI4Business News                                          │
 *  │  00:00 — News AI (20 notizie aggiornate)                                │
 *  │  00:05 — Editoriale del giorno + Startup del giorno                     │
 *  │  00:15 — 4 Reportage su startup AI italiane (ogni lunedì)               │
 *  │  00:20 — 4 Analisi di mercato AI (ogni lunedì)                          │
 *  │                                                                          │
 *  │  SEZIONE /music — ITsMusic                                               │
 *  │  00:30 — News musicali (20 notizie Rock/Indie/AI Music)                 │
 *  │  00:35 — Editoriale musicale + Artista della settimana                  │
 *  │  00:45 — 4 Reportage musicali (ogni lunedì)                             │
 *  │  00:50 — 4 Analisi mercato musicale (ogni lunedì)                       │
 *  │                                                                          │
 *  │  NEWSLETTER (ora italiana)                                               │
 *  │  Lunedì 10:00 — AI4Business News + ITsMusic                             │
 *  │  Venerdì 10:00 — AI4Business News + ITsMusic                            │
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
import {
  generateMusicNews,
  generateMusicEditorial,
  generateArtistOfWeek,
  generateMusicReportage,
  generateMusicMarketAnalysis,
} from "./musicScheduler";
import { sendItsMusicNewsletter } from "./musicNewsletterScheduler";

const TZ = "Europe/Rome";

// ─── Chiavi per evitare doppi invii ──────────────────────────────────────────
let lastNewsletterSentKey: string | null = null;
let lastMusicNewsletterSentKey: string | null = null;

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

  // ── 1. NEWS AI — ogni giorno alle 00:00 CET ──────────────────────────────
  cron.schedule("0 0 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 00:00 CET — Avvio aggiornamento News AI...");
    try {
      await refreshNewsIfNeeded();
      console.log("[SchedulerManager] ✅ News AI aggiornate con successo");
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore aggiornamento News AI:", err);
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

  // ── 5. NEWS MUSICALI — ogni giorno alle 00:30 CET ────────────────────────
  cron.schedule("30 0 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 00:30 CET — Avvio aggiornamento News Musicali...");
    try {
      await generateMusicNews();
      console.log("[SchedulerManager] ✅ News Musicali aggiornate con successo");
    } catch (err) {
      console.error("[SchedulerManager] ❌ Errore aggiornamento News Musicali:", err);
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
  // NEWSLETTER — AI4Business News + ITsMusic
  // ══════════════════════════════════════════════════════════════════════════

  // ── 9. NEWSLETTER — ogni lunedì e venerdì alle 10:00 CET ─────────────────
  cron.schedule("0 10 * * 1,5", async () => {
    const now = new Date();
    const italianNow = new Date(now.toLocaleString("en-US", { timeZone: TZ }));
    const dayName = italianNow.getDay() === 1 ? "Lunedì" : "Venerdì";
    const weekKey = getWeekKey();
    const sendKey = `${weekKey}-${italianNow.getDay()}`;

    console.log(`[SchedulerManager] ⏰ ${dayName} 10:00 CET — Verifica invio Newsletter...`);

    if (lastNewsletterSentKey === sendKey) {
      console.log(`[SchedulerManager] ⏭️ Newsletter già inviata per ${sendKey}, skip`);
      return;
    }

    try {
      lastNewsletterSentKey = sendKey;
      await sendWeeklyNewsletter();
      console.log(`[SchedulerManager] ✅ AI4Business News inviata con successo (${dayName})`);
    } catch (err) {
      lastNewsletterSentKey = null;
      console.error("[SchedulerManager] ❌ Errore invio AI4Business News:", err);
    }

    // Invia anche ITsMusic
    if (lastMusicNewsletterSentKey === sendKey) {
      console.log(`[SchedulerManager] ⏭️ ITsMusic già inviata per ${sendKey}, skip`);
      return;
    }
    try {
      lastMusicNewsletterSentKey = sendKey;
      await sendItsMusicNewsletter();
      console.log(`[SchedulerManager] ✅ ITsMusic inviata con successo (${dayName})`);
    } catch (err) {
      lastMusicNewsletterSentKey = null;
      console.error("[SchedulerManager] ❌ Errore invio ITsMusic:", err);
    }
  }, { timezone: TZ });

  // ── Log riepilogo ─────────────────────────────────────────────────────────
  console.log("[SchedulerManager] ✅ Tutti gli scheduler attivi:");
  console.log("[SchedulerManager]   📰 News AI          → ogni giorno alle 00:00 CET");
  console.log("[SchedulerManager]   ✍️  Editoriale AI    → ogni giorno alle 00:05 CET");
  console.log("[SchedulerManager]   🏢 Reportage AI     → ogni lunedì alle 00:15 CET");
  console.log("[SchedulerManager]   📊 Analisi AI       → ogni lunedì alle 00:20 CET");
  console.log("[SchedulerManager]   🎸 News Musica      → ogni giorno alle 00:30 CET");
  console.log("[SchedulerManager]   🎵 Editoriale Music → ogni giorno alle 00:35 CET");
  console.log("[SchedulerManager]   🎤 Reportage Music  → ogni lunedì alle 00:45 CET");
  console.log("[SchedulerManager]   🎼 Analisi Music    → ogni lunedì alle 00:50 CET");
  console.log("[SchedulerManager]   📧 Newsletter       → lunedì e venerdì alle 10:00 CET");
}
