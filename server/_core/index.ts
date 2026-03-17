import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { startAllSchedulers } from "../schedulerManager";
import { refreshAINewsFromRSS } from "../rssNewsScheduler";
import { runDailyContentRefresh } from "../dailyContentScheduler";
import { fixAllSourceUrls } from "../urlAuditFix";
// import { startAuditScheduler } from "../auditScheduler"; // RIMOSSO — audit disabilitato definitivamente il 14/03/2026
import { getDb } from "../db";
import { subscribers, emailOpens } from "../../drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { invalidateAll } from "../cache";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // ── Email Open Tracking Pixel ──────────────────────────────────────────────
  // GET /api/track/open?sid=TOKEN&cid=CAMPAIGN_ID&sub=SUBJECT
  app.get("/api/track/open", async (req, res) => {
    // Risponde subito con il pixel trasparente 1x1
    const pixel = Buffer.from(
      "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      "base64"
    );
    res.set("Content-Type", "image/gif");
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    res.send(pixel);

    // Traccia l'apertura in background (non blocca la risposta)
    const { sid, cid, sub } = req.query as Record<string, string>;
    if (!sid || !cid) return;

    try {
      const db = await getDb();
      if (!db) return;

      // Trova il subscriber tramite il token
      const [subscriber] = await db
        .select({ id: subscribers.id, email: subscribers.email })
        .from(subscribers)
        .where(eq(subscribers.unsubscribeToken, sid))
        .limit(1);

      if (!subscriber) return;

      // Registra l'apertura nella tabella email_opens
      await db.insert(emailOpens).values({
        subscriberEmail: subscriber.email,
        campaignId: cid,
        campaignSubject: sub || null,
        userAgent: (req.headers["user-agent"] || "").substring(0, 500),
        ipAddress: (req.ip || "").substring(0, 64),
      });

      // Aggiorna i contatori sul subscriber
      await db
        .update(subscribers)
        .set({
          totalOpened: sql`${subscribers.totalOpened} + 1`,
          lastOpenedAt: new Date(),
        })
        .where(eq(subscribers.id, subscriber.id));

      // Aggiorna openedCount nella campagna newsletter_sends
      // (aggiorna solo il primo record trovato per questo campaignId)
      console.log(`[Track] Apertura registrata: ${subscriber.email} | campagna: ${cid}`);
    } catch (err) {
      console.error("[Track] Errore tracking apertura:", err);
    }
  });

  // ── Cache-Control headers per le risposte tRPC pubbliche ────────────────────
  // Le procedure pubbliche (news, editorial, ecc.) sono cachate in-memory lato server.
  // Aggiungiamo anche un header HTTP per il CDN/browser: max-age=60s (1 minuto).
  // Le procedure protette (admin, auth) non vengono cachate.
  app.use("/api/trpc", (req, res, next) => {
    const url = req.url || '';
    const isPublicRead = req.method === 'GET' && (
      url.includes('news.getLatest') ||
      url.includes('news.getHomeData') ||
      url.includes('news.getById') ||
      url.includes('news.getRelated') ||
      url.includes('news.getAll') ||
      url.includes('editorial.getLatest') ||
      url.includes('editorial.getById') ||
      url.includes('reportage.getLatestWeek') ||
      url.includes('reportage.getById') ||
      url.includes('marketAnalysis.getLatest') ||
      url.includes('marketAnalysis.getById') ||
      url.includes('startupOfDay.getLatest') ||
      url.includes('startupOfDay.getById') ||
      url.includes('sistema.getPuntoDelGiorno') ||
      url.includes('sistema.getBarometro') ||
      url.includes('sistema.getThreatAlert')
    );
    if (isPublicRead) {
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    } else {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    }
    next();
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);

// ─── Avvia tutti gli scheduler automatici centralizzati ───────────────────────
// Tutti gli orari sono in CET/CEST (ora italiana, Europe/Rome)
// - News AI:       ogni giorno alle 00:00
// - Editoriale:    ogni giorno alle 00:05
// - Reportage:     ogni lunedì alle 00:15
// - Analisi:       ogni lunedì alle 00:20
// - Newsletter:    lunedì e venerdì alle 10:00
// - Audit:         DISABILITATO — l'audit sulle homepage dei giornali genera falsi negativi
//                   (score 0 su notizie AI generate internamente). Riabilitare solo dopo
//                   aver configurato l'audit per verificare URL articolo specifici.
startAllSchedulers();
// startAuditScheduler(); // DISABILITATO il 14/03/2026

// ─── Avvio immediato: fix URL errati nel DB (eseguito una volta all'avvio) ────
// Parte 15 secondi dopo l'avvio per non rallentare il boot
setTimeout(async () => {
  try {
    console.log("[Startup] 🔧 Avvio fix immediato sourceUrl nel DB...");
    const result = await fixAllSourceUrls({ batchSize: 15, delayMs: 200 });
    console.log(`[Startup] ✅ Fix URL completato: ${result.fixed} corretti, ${result.alreadyOk} già ok, ${result.failed} falliti`);
  } catch (err) {
    console.error("[Startup] Errore fix URL (non critico):", err);
  }
}, 15_000);

// ─── Avvio immediato: scraping RSS se il DB è vuoto ──────────────────────────
// Parte 45 secondi dopo l'avvio (dopo il fix URL)
setTimeout(async () => {
  try {
    const db = await getDb();
    if (!db) return;
    const { newsItems } = await import("../../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const existing = await db.select().from(newsItems).where(eq(newsItems.section, 'ai')).limit(1);
    if (existing.length === 0) {
      console.log("[Startup] DB vuoto — avvio scraping RSS iniziale...");
      await refreshAINewsFromRSS();
    } else {
      console.log("[Startup] DB già popolato — skip scraping iniziale");
    }
  } catch (err) {
    console.error("[Startup] Errore scraping RSS iniziale:", err);
  }
}, 45_000);

setTimeout(async () => {
  try {
    await runDailyContentRefresh();
  } catch (err) {
    console.error("[Startup] Errore refresh contenuti iniziale:", err);
  }
}, 30_000);

// ─── Cache warm-up: pre-popola la cache in-memory all'avvio ──────────────────────────────────────────────────
// Parte 60 secondi dopo l'avvio (dopo scraping e fix URL) per garantire che il
// DB sia già popolato. Questo assicura che il primo utente del giorno non aspetti.
setTimeout(async () => {
  try {
    console.log('[Cache Warmup] 🔥 Avvio pre-riscaldamento cache...');
    const { getHomeNewsData, getLatestEditorial, getLatestStartupOfDay, getLatestWeeklyReportage, getLatestMarketAnalysis } = await import('../db');
    const { cached, invalidateAll: _inv, CACHE_KEYS, DEFAULT_TTL_MS, EDITORIAL_TTL_MS } = await import('../cache');

    // Invalida tutto per ripartire da zero con dati freschi
    invalidateAll();

    // Pre-popola homepage (la più importante)
    await cached(CACHE_KEYS.HOME_DATA, () => getHomeNewsData(), DEFAULT_TTL_MS);
    console.log('[Cache Warmup] ✅ Homepage data cached');

    // Pre-popola editoriali, startup, reportage, market per le sezioni più visitate
    const topSections = ['ai', 'startup', 'music', 'finance', 'health', 'sport', 'luxury', 'news'];
    await Promise.all(topSections.flatMap(section => [
      cached(CACHE_KEYS.EDITORIAL_LATEST(section), () => getLatestEditorial(section as any), EDITORIAL_TTL_MS),
      cached(CACHE_KEYS.STARTUP_LATEST(section), () => getLatestStartupOfDay(section as any), EDITORIAL_TTL_MS),
      cached(CACHE_KEYS.REPORTAGE_LATEST(section), () => getLatestWeeklyReportage(section as any), EDITORIAL_TTL_MS),
      cached(CACHE_KEYS.MARKET_LATEST(section), () => getLatestMarketAnalysis(section as any), EDITORIAL_TTL_MS),
    ]));
    console.log('[Cache Warmup] ✅ Sezioni principali cached');
    console.log('[Cache Warmup] 🎉 Cache warm-up completato!');
  } catch (err) {
    console.error('[Cache Warmup] Errore (non critico):', err);
  }
}, 60_000);
