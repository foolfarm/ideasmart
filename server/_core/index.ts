import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { notifyOwner } from "./notification";

// ─── Helper: invia notifica email + Manus su errori critici del server ────
async function notifyServerError(subject: string, body: string): Promise<void> {
  const timestamp = new Date().toISOString();
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 8px;">
        🚨 ${subject}
      </h2>
      <p style="color: #374151; font-size: 16px;">${body}</p>
      <p style="color: #6b7280; font-size: 13px; margin-top: 24px;">
        Timestamp: ${timestamp}<br>
        Server: Proof Press — AI for Business<br>
        <a href="https://www.proofpress.ai" style="color: #2563eb;">proofpress.ai</a>
      </p>
    </div>
  `;
  // Invia sia notifica Manus che email a info@andreacinelli.com
  await Promise.allSettled([
    notifyOwner({ title: subject, content: `${body} (${timestamp})` }),
    // Importazione dinamica per evitare dipendenze circolari al boot
    import("../email").then(({ sendEmail }) =>
      sendEmail({
        to: "info@andreacinelli.com",
        subject: `[Proof Press] ${subject}`,
        html,
        text: `${subject}\n\n${body}\n\nTimestamp: ${timestamp}`,
      })
    ),
  ]);
}

// ─── Graceful Error Handler: previene crash EMFILE e altri errori critici ────
// EMFILE (too many open files) si verifica quando lo scraper RSS apre troppe
// connessioni HTTP simultanee. Invece di crashare, logghiamo e notifichiamo.
process.on("uncaughtException", async (err: NodeJS.ErrnoException) => {
  const code = err.code || "UNKNOWN";
  const msg = err.message || String(err);
  console.error(`[Server] ❌ uncaughtException (${code}): ${msg}`);
  if (code === "EMFILE" || code === "ENFILE") {
    // EMFILE: troppi file aperti — NON crashare, solo loggare e notificare
    console.error("[Server] ⚠️ EMFILE rilevato — il server continua a girare. Verifica i limiti OS.");
    try {
      await notifyServerError(
        "⚠️ EMFILE su Proof Press",
        "Il server ha rilevato EMFILE (too many open files). Il server continua a girare. Controlla i log per dettagli."
      );
    } catch { /* notifica non critica */ }
  } else {
    // Altri errori critici: notifica e poi lascia crashare (il supervisor riavvia)
    console.error("[Server] 💥 Errore critico non gestito — il server si riavvierà.");
    try {
      await notifyServerError(
        "💥 Crash Proof Press",
        `Errore critico: ${code} — ${msg.slice(0, 300)}. Il server si riavvierà automaticamente.`
      );
    } catch { /* notifica non critica */ }
    process.exit(1);
  }
});

process.on("unhandledRejection", (reason) => {
  const msg = reason instanceof Error ? reason.message : String(reason);
  console.error(`[Server] ⚠️ unhandledRejection: ${msg.slice(0, 200)}`);
  // Non crashare per promise rejection — solo loggare
});

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
import { subscribers, emailOpens, newsletterSends } from "../../drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { invalidateAll, getCacheStats } from "../cache";
import fs from "fs";
import path from "path";

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

    // ── Trust proxy: necessario per rate limiting corretto dietro CDN/load balancer ────────────────
  // Manus usa un reverse proxy che aggiunge X-Forwarded-For
  app.set('trust proxy', 1);

  // ── Redirect 301: tutti i domini → proofpress.ai ──────────────────────────────────────────
  // Preserva path e query string per SEO. Intercetta prima di qualsiasi altro middleware.
  const CANONICAL_HOST = "proofpress.ai";
  const OLD_HOSTS = [
    "ideasmart.ai", "www.ideasmart.ai",
    "ideasmart.biz", "www.ideasmart.biz",
    "www.proofpress.ai",
    "ideasmart.manus.space", "ideasmartai-uypaon6i.manus.space"
  ];
  app.use((req, res, next) => {
    const host = (req.hostname || req.headers.host || "").replace(/:\d+$/, "").toLowerCase();
    if (OLD_HOSTS.includes(host)) {
      const protocol = req.protocol || "https";
      const target = `${protocol}://${CANONICAL_HOST}${req.originalUrl}`;
      console.log(`[Redirect 301] ${host}${req.originalUrl} → ${target}`);
      return res.redirect(301, target);
    }
    next();
  });

  // ── Security Headers (Helmet) ─────────────────────────────────────────────────────────────
  // X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy, ecc.
  app.use(helmet({
    contentSecurityPolicy: false, // Disabilitato: AdSense + Google Fonts richiedono CSP permissiva
    crossOriginEmbedderPolicy: false, // Disabilitato: necessario per AdSense iframes
    hsts: {
      maxAge: 31536000,        // 1 anno
      includeSubDomains: true,
      preload: true,
    },
  }));

  // ── Rate Limiting ─────────────────────────────────────────────────────────────
  // Protegge le API tRPC e le route sensibili da abusi e DDoS
  const apiLimiter = rateLimit({
    windowMs: 60 * 1000,    // 1 minuto
    limit: 120,             // max 120 richieste/minuto per IP
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Troppe richieste. Riprova tra un minuto.' },
    skip: (req) => {
      const ip = req.ip || '';
      return ip === '127.0.0.1' || ip === '::1';
    },
  });
  app.use('/api/trpc', apiLimiter);

  // Rate limiter più restrittivo per le route di autenticazione
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minuti
    limit: 20,                  // max 20 tentativi di login per IP
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Troppi tentativi di accesso. Riprova tra 15 minuti.' },
  });
  app.use('/api/oauth', authLimiter);

  // ── Compressione gzip/deflate per tutte le risposte ≥1KB ────────────────────
  // Riduce la dimensione delle risposte JSON tRPC del 70-85%
  app.use(compression({
    level: 6,          // Bilanciamento velocità/compressione (1=veloce, 9=massimo)
    threshold: 1024,   // Comprimi solo risposte ≥1KB
    filter: (req, res) => {
      // Non comprimere le immagini (già compresse)
      const contentType = res.getHeader('Content-Type') as string || '';
      if (contentType.startsWith('image/')) return false;
      return compression.filter(req, res);
    },
  }));

  // Body parser — limite ridotto a 2MB (era 50MB: eccessivo e rischioso per DoS)
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ limit: "2mb", extended: true }));
  // Cookie parser — necessario per leggere req.cookies nelle procedure tRPC
  app.use(cookieParser());
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // ── Auth endpoints dedicati — bypassano tRPC per impostare cookie correttamente ──
  // tRPC v11 serializza la risposta prima che Express possa aggiungere Set-Cookie.
  // Questi endpoint Express nativi garantiscono che il cookie venga impostato.
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ error: "Email e password richiesti" });
      }
      const { getDb } = await import("../db");
      const { siteUsers } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const { createHash, randomBytes } = await import("crypto");
      const db = await getDb();
      if (!db) return res.status(500).json({ error: "Database non disponibile" });
      const rows = await db.select().from(siteUsers).where(eq(siteUsers.email, email.toLowerCase())).limit(1);
      if (rows.length === 0) return res.status(401).json({ error: "Email o password non corretti." });
      const user = rows[0];
      if (!user.emailVerified) return res.status(403).json({ error: "Devi prima confermare la tua email." });
      const hash = createHash("sha256").update(password + (process.env.JWT_SECRET || "ideasmart_secret")).digest("hex");
      if (user.passwordHash !== hash) return res.status(401).json({ error: "Email o password non corretti." });
      const sessionToken = randomBytes(64).toString("hex");
      const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await db.update(siteUsers).set({ sessionToken, sessionExpiresAt, lastLoginAt: new Date() }).where(eq(siteUsers.id, user.id));
      const isProduction = process.env.NODE_ENV === "production";
      res.cookie("ideasmart_session", sessionToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: "/",
      });
      return res.json({ ok: true, username: user.username });
    } catch (err) {
      console.error("[Auth] Login error:", err);
      return res.status(500).json({ error: "Errore interno" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      const sessionToken = req.cookies?.ideasmart_session;
      if (sessionToken) {
        const { getDb } = await import("../db");
        const { siteUsers } = await import("../../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const db = await getDb();
        if (db) await db.update(siteUsers).set({ sessionToken: null, sessionExpiresAt: null }).where(eq(siteUsers.sessionToken, sessionToken));
      }
      res.clearCookie("ideasmart_session", { path: "/" });
      return res.json({ ok: true });
    } catch (err) {
      console.error("[Auth] Logout error:", err);
      return res.status(500).json({ error: "Errore interno" });
    }
  });

  // ── ads.txt — servito come file statico da client/public/ads.txt ──────────
  // Il file contiene le righe AdSense (pub-7185482526978993) + reseller network.
  // Per aggiornarlo: modificare direttamente client/public/ads.txt
  console.log("[ads.txt] Servito come file statico da client/public/ads.txt");

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

  // ── Newsletter Approval endpoint ────────────────────────────────────────────────────────────────────────
  // GET /api/newsletter/approve/:token — approva l'invio massivo
  app.get("/api/newsletter/approve/:token", async (req, res) => {
    const { token } = req.params;
    if (!token) return res.status(400).send("Token mancante");
    try {
      const db = await getDb();
      if (!db) return res.status(500).send("DB non disponibile");
      const [record] = await db
        .select({ id: newsletterSends.id, subject: newsletterSends.subject, approvedAt: newsletterSends.approvedAt, status: newsletterSends.status })
        .from(newsletterSends)
        .where(eq(newsletterSends.approvalToken, token))
        .limit(1);
      if (!record) {
        return res.status(404).send(`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:-apple-system,sans-serif;max-width:500px;margin:80px auto;text-align:center;"><h2>❌ Token non valido</h2><p>Il link di approvazione non è valido o è già scaduto.</p></body></html>`);
      }
      if (record.approvedAt) {
        return res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:-apple-system,sans-serif;max-width:500px;margin:80px auto;text-align:center;"><h2>✅ Già approvata</h2><p>La newsletter <strong>${record.subject}</strong> è già stata approvata e verrà inviata alle 11:00.</p></body></html>`);
      }
      if (record.status === 'sent') {
        return res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:-apple-system,sans-serif;max-width:500px;margin:80px auto;text-align:center;"><h2>📧 Già inviata</h2><p>La newsletter <strong>${record.subject}</strong> è già stata inviata.</p></body></html>`);
      }
      await db.update(newsletterSends)
        .set({ approvedAt: new Date(), approvedBy: "ac@acinelli.com", status: "approved" })
        .where(eq(newsletterSends.id, record.id));
      console.log(`[Approval] ✅ Newsletter approvata: "${record.subject}" (id: ${record.id})`);
      try { await notifyOwner({ title: "✅ Newsletter approvata", content: `"${record.subject}" approvata. Invio massivo alle 11:00 CET.` }); } catch {}
      return res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:80px auto;text-align:center;background:#f5f5f7;padding:40px;border-radius:18px;"><div style="font-size:48px;margin-bottom:16px;">✅</div><h2 style="font-size:22px;font-weight:600;color:#1d1d1f;margin:0 0 8px;">Newsletter approvata</h2><p style="color:#6e6e73;font-size:15px;margin:0 0 24px;">${record.subject}</p><div style="background:#fff;border-radius:12px;padding:16px;border:1px solid #e5e5ea;"><p style="margin:0;font-size:14px;color:#1d1d1f;">L'invio massivo partirà automaticamente alle <strong>11:00 CET</strong>.</p></div><p style="margin-top:24px;font-size:12px;color:#aeaeb2;">ProofPress Admin · ${new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' })}</p></body></html>`);
    } catch (err) {
      console.error("[Approval] Errore:", err);
      return res.status(500).send("Errore interno");
    }
  });

  // ── Newsletter Trigger manuale (solo admin, protetto da JWT_SECRET) ──────────────
  // POST /api/newsletter/trigger-send — forza l'invio della newsletter se approvata
  app.post("/api/newsletter/trigger-send", async (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token || token !== process.env.JWT_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const { sendUnifiedNewsletterToAll } = await import('../unifiedNewsletter');
      console.log('[ManualTrigger] Avvio invio manuale newsletter...');
      const result = await sendUnifiedNewsletterToAll();
      console.log('[ManualTrigger] Risultato:', JSON.stringify(result));
      return res.json(result);
    } catch (err: any) {
      console.error('[ManualTrigger] Errore:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Cache Stats endpoint (solo admin, protetto da JWT_SECRET) ──────────────────
  // GET /api/cache-stats — restituisce hit/miss/size/TTL per ogni chiave in cache
  app.get("/api/cache-stats", (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token || token !== process.env.JWT_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const stats = getCacheStats();
    return res.json(stats);
  });

  // ── Admin: disiscrizione manuale newsletter (protetto da JWT_SECRET) ──────────────
  // POST /api/admin/newsletter/unsub — disiscrive una email dal DB
  // Body: { email: string }
  // Auth: Authorization: Bearer <JWT_SECRET>
  app.post("/api/admin/newsletter/unsub", async (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token || token !== process.env.JWT_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { email } = req.body || {};
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email mancante' });
    }
    try {
      const { unsubscribeEmail } = await import('../db');
      await unsubscribeEmail(email.trim().toLowerCase());
      console.log(`[AdminUnsub] ✅ Disiscritta manualmente: ${email}`);
      return res.json({ success: true, email: email.trim().toLowerCase() });
    } catch (err: any) {
      console.error('[AdminUnsub] Errore:', err);
      return res.status(500).json({ error: err.message || 'Errore interno' });
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

  // ── Redirect 301: vecchia route /per-giornalisti → /offertacommerciale ──────
  app.get("/per-giornalisti", (_req, res) => {
    res.redirect(301, "/offertacommerciale");
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
// Parte 5 secondi dopo l'avvio: il DB è sempre già popolato in produzione.
// Warm-up immediato garantisce che il primo visitatore non aspetti.
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

    // Pre-popola tutte le 14 sezioni (news + editoriali + startup + reportage + market)
    const allSections = ['ai', 'startup', 'music', 'finance', 'health', 'sport', 'luxury', 'news', 'motori', 'tennis', 'basket', 'gossip', 'cybersecurity', 'sondaggi'];
    const { getLatestNewsFiltered } = await import('../db');

    // Stagger il warm-up in batch da 4 sezioni per non sovraccaricare il DB
    for (let i = 0; i < allSections.length; i += 4) {
      const batch = allSections.slice(i, i + 4);
      await Promise.all(batch.flatMap(section => [
        cached(CACHE_KEYS.NEWS_LATEST(section, 20), () => getLatestNewsFiltered(20, section as any), DEFAULT_TTL_MS),
        cached(CACHE_KEYS.EDITORIAL_LATEST(section), () => getLatestEditorial(section as any), EDITORIAL_TTL_MS),
        cached(CACHE_KEYS.STARTUP_LATEST(section), () => getLatestStartupOfDay(section as any), EDITORIAL_TTL_MS),
        cached(CACHE_KEYS.REPORTAGE_LATEST(section), () => getLatestWeeklyReportage(section as any), EDITORIAL_TTL_MS),
        cached(CACHE_KEYS.MARKET_LATEST(section), () => getLatestMarketAnalysis(section as any), EDITORIAL_TTL_MS),
      ]));
      // Piccola pausa tra i batch per non saturare il DB
      await new Promise(r => setTimeout(r, 500));
    }
    console.log('[Cache Warmup] ✅ Tutte le 14 sezioni cached (news + editoriali + startup + reportage + market)');
    console.log('[Cache Warmup] 🎉 Cache warm-up completato!');
  } catch (err) {
    console.error('[Cache Warmup] Errore (non critico):', err);
  }
}, 5_000); // 5 secondi: il DB è sempre già popolato in produzione


// ─── Health Watchdog: rileva se il server è bloccato e notifica ──────────────
// Ogni 30 minuti verifica che il server risponda correttamente.
// Se rileva un problema (es. event loop bloccato), notifica Andrea.
let _lastHeartbeat = Date.now();
setInterval(() => { _lastHeartbeat = Date.now(); }, 60_000); // heartbeat ogni minuto

setInterval(async () => {
  const now = Date.now();
  const elapsed = now - _lastHeartbeat;
  // Se il heartbeat non è stato aggiornato da più di 3 minuti, l'event loop è bloccato
  if (elapsed > 3 * 60 * 1000) {
    console.error(`[Watchdog] ⚠️ Event loop bloccato da ${Math.round(elapsed / 1000)}s — possibile deadlock`);
    try {
      await notifyOwner({
        title: "⚠️ Proof Press: server lento",
        content: `Il server non risponde da ${Math.round(elapsed / 60000)} minuti (${new Date().toISOString()}). Potrebbe essere necessario un riavvio.`
      });
    } catch { /* notifica non critica */ }
  }
}, 30 * 60 * 1000); // controlla ogni 30 minuti
