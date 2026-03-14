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
import { refreshNewsIfNeeded } from "../newsScheduler";
import { runDailyContentRefresh } from "../dailyContentScheduler";
import { getDb } from "../db";
import { subscribers, emailOpens } from "../../drizzle/schema";
import { eq, sql } from "drizzle-orm";

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
startAllSchedulers();

// ─── Avvio immediato: genera contenuti se il DB è vuoto ───────────────────────
// Parte 10 secondi dopo l'avvio per non rallentare il boot
setTimeout(async () => {
  try {
    await refreshNewsIfNeeded();
  } catch (err) {
    console.error("[Startup] Errore refresh news iniziale:", err);
  }
}, 10_000);

setTimeout(async () => {
  try {
    await runDailyContentRefresh();
  } catch (err) {
    console.error("[Startup] Errore refresh contenuti iniziale:", err);
  }
}, 30_000);
