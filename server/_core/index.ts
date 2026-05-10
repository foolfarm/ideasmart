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
import { registerStorageProxy } from "./storageProxy";
import { registerVerifyPublicApi } from "../verify/publicApi";
import { registerVerifyStripeWebhook } from "../verify/stripeVerify";
import { registerBaseAlphaWebhook } from "../routers/baseAlphaWebhook";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { startAllSchedulers } from "../schedulerManager";
import { refreshAINewsFromRSS } from "../rssNewsScheduler";
import { runDailyContentRefresh } from "../dailyContentScheduler";
import { fixAllSourceUrls } from "../urlAuditFix";
// import { startAuditScheduler } from "../auditScheduler"; // RIMOSSO — audit disabilitato definitivamente il 14/03/2026
import { getDb } from "../db";
import { subscribers, emailOpens, newsletterSends, banners, bannerEvents } from "../../drizzle/schema";
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
    contentSecurityPolicy: false, // Disabilitato: Google Fonts e analytics richiedono CSP permissiva
    crossOriginEmbedderPolicy: false, // Disabilitato: necessario per iframe di terze parti (Calendly)
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

  // Body parser — 14MB per gestire upload immagini banner in base64
  // (base64 aumenta la dimensione del 33%: immagine 10MB → ~13.3MB base64)
  // IMPORTANTE: le route webhook Stripe richiedono il raw body per la verifica della firma.
  // express.json() globale parserebbe il payload prima che express.raw() inline possa intercettarlo,
  // rendendo impossibile la verifica. Per questo escludiamo esplicitamente i path webhook.
  const STRIPE_WEBHOOK_PATHS = [
    '/api/stripe/base-alpha/webhook',
    '/api/stripe/verify/webhook',
  ];
  app.use((req, _res, next) => {
    if (STRIPE_WEBHOOK_PATHS.includes(req.path)) return next();
    express.json({ limit: '14mb' })(req, _res, next);
  });
  app.use((req, _res, next) => {
    if (STRIPE_WEBHOOK_PATHS.includes(req.path)) return next();
    express.urlencoded({ limit: '14mb', extended: true })(req, _res, next);
  });
  // Cookie parser — necessario per leggere req.cookies nelle procedure tRPC
  app.use(cookieParser());
  // Storage proxy — serve /manus-storage/* files via signed URLs
  registerStorageProxy(app);
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // ProofPress Verify SaaS — REST API pubblica B2B
  registerVerifyPublicApi(app);
  // ProofPress Verify SaaS — Stripe webhook
  registerVerifyStripeWebhook(app);
  // Base Alpha + — Stripe webhook
  registerBaseAlphaWebhook(app);

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
      // Rileva HTTPS sia in produzione che in dev (proxy Manus usa HTTPS anche in dev)
      const isSecureConn = req.secure ||
        req.headers["x-forwarded-proto"] === "https" ||
        (req.headers["x-forwarded-proto"] as string)?.startsWith("https");
      res.cookie("ideasmart_session", sessionToken, {
        httpOnly: true,
        secure: isSecureConn,
        sameSite: isSecureConn ? "none" : "lax",
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

  // ── Journalist Portal Login — endpoint Express nativo ──────────────────────
  // tRPC v11 serializza la risposta prima che Express possa aggiungere Set-Cookie.
  // Questo endpoint nativo garantisce che il cookie journalist_session venga impostato.
  app.post("/api/journalist/login", async (req, res) => {
    try {
      const { username, password } = req.body || {};
      if (!username || !password) {
        return res.status(400).json({ error: "Username e password richiesti" });
      }
      const { journalists } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const { createHash, randomBytes } = await import("crypto");
      const db = await getDb();
      if (!db) return res.status(500).json({ error: "Database non disponibile" });

      const rows = await db
        .select()
        .from(journalists)
        .where(eq(journalists.username, username.toLowerCase().trim()))
        .limit(1);

      if (rows.length === 0) {
        return res.status(401).json({ error: "Username o password non corretti." });
      }
      const journalist = rows[0];
      if (!journalist.isActive) {
        return res.status(403).json({ error: "Account disattivato. Contatta la redazione ProofPress." });
      }
      const passwordHash = createHash("sha256").update(password + "pp_journalist_salt_2026").digest("hex");
      if (journalist.passwordHash !== passwordHash) {
        return res.status(401).json({ error: "Username o password non corretti." });
      }

       const sessionToken = randomBytes(64).toString("hex");
      const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await db
        .update(journalists)
        .set({ sessionToken, sessionExpiresAt, lastLoginAt: new Date() })
        .where(eq(journalists.id, journalist.id));
      // Rileva HTTPS sia in produzione che in dev (proxy Manus usa HTTPS anche in dev)
      const isSecure = req.secure ||
        req.headers["x-forwarded-proto"] === "https" ||
        (req.headers["x-forwarded-proto"] as string)?.startsWith("https");
      res.cookie("journalist_session", sessionToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: isSecure ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      return res.json({
        ok: true,
        journalist: {
          id: journalist.id,
          username: journalist.username,
          displayName: journalist.displayName,
          journalistKey: journalist.journalistKey,
          totalArticles: journalist.totalArticles,
        },
      });
    } catch (err) {
      console.error("[Journalist] Login error:", err);
      return res.status(500).json({ error: "Errore interno" });
    }
  });

  app.post("/api/journalist/logout", async (req, res) => {
    try {
      const sessionToken = req.cookies?.journalist_session;
      if (sessionToken) {
        const { journalists } = await import("../../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const db = await getDb();
        if (db) {
          await db
            .update(journalists)
            .set({ sessionToken: null, sessionExpiresAt: null })
            .where(eq(journalists.sessionToken, sessionToken));
        }
      }
      res.clearCookie("journalist_session", { path: "/" });
      return res.json({ ok: true });
    } catch (err) {
      console.error("[Journalist] Logout error:", err);
      return res.status(500).json({ error: "Errore interno" });
    }
  });

  // ── Import documento Word/PDF per il portale giornalisti ──────────────────
  // POST /api/journalist/import-document — accetta .docx o .pdf, ritorna il testo estratto
  {
    const multer = (await import("multer")).default;
    const upload = multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
      fileFilter: (_req, file, cb) => {
        const allowed = [
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/msword",
          "application/pdf",
        ];
        const allowedExt = [".docx", ".doc", ".pdf"];
        const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf("."));
        if (allowed.includes(file.mimetype) || allowedExt.includes(ext)) {
          cb(null, true);
        } else {
          cb(new Error("Formato non supportato. Usa .docx o .pdf"));
        }
      },
    });
    app.post("/api/journalist/import-document", upload.single("file"), async (req, res) => {
      try {
        if (!req.file) return res.status(400).json({ error: "Nessun file ricevuto" });
        const ext = req.file.originalname.toLowerCase().slice(req.file.originalname.lastIndexOf("."));
        let extractedText = "";
        if (ext === ".docx" || ext === ".doc" || req.file.mimetype.includes("wordprocessingml") || req.file.mimetype.includes("msword")) {
          // Parsing Word con mammoth
          const mammoth = await import("mammoth");
          const result = await mammoth.extractRawText({ buffer: req.file.buffer });
          extractedText = result.value.trim();
        } else if (ext === ".pdf" || req.file.mimetype === "application/pdf") {
          // Parsing PDF con pdf-parse
          const pdfParseModule = await import("pdf-parse");
          const pdfParse = (pdfParseModule as any).default ?? pdfParseModule;
          const data = await pdfParse(req.file.buffer);
          extractedText = data.text.trim();
        } else {
          return res.status(400).json({ error: "Formato non supportato" });
        }
        if (!extractedText) return res.status(422).json({ error: "Impossibile estrarre testo dal documento" });
        return res.json({ ok: true, text: extractedText, filename: req.file.originalname });
      } catch (err: any) {
        console.error("[ImportDoc] Error:", err);
        return res.status(500).json({ error: err?.message || "Errore durante l'elaborazione del documento" });
      }
    });
  }

  // ── ads.txt — servito come file statico da client/public/ads.txt ──────────
  // Il file contiene solo il publisher diretto Google (pub-7185482526978993).
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

  // ── Banner Newsletter Click Tracking ─────────────────────────────────────────────────────────────────────
  // GET /api/nl/b/:bannerId — traccia click banner dalla newsletter e redirige all'URL del banner
  // Parametri query: sid=<newsletter_send_id>
  app.get("/api/nl/b/:bannerId", async (req, res) => {
    const bannerId = parseInt(req.params.bannerId, 10);
    const sendId = req.query.sid ? parseInt(req.query.sid as string, 10) : null;
    if (isNaN(bannerId)) return res.redirect(302, "https://proofpress.ai");
    let targetUrl = "https://proofpress.ai";
    try {
      const db = await getDb();
      if (db) {
        const [banner] = await db
          .select({ id: banners.id, clickUrl: banners.clickUrl })
          .from(banners)
          .where(eq(banners.id, bannerId))
          .limit(1);
        if (banner?.clickUrl) {
          targetUrl = banner.clickUrl;
          // Registra il click newsletter in background (non blocca il redirect)
          (async () => {
            try {
              await db.insert(bannerEvents).values({
                bannerId: banner.id,
                eventType: "click",
                slot: "newsletter",
                source: "newsletter",
                newsletterSendId: sendId,
                referrer: ((req.headers.referer || "") as string).substring(0, 512) || null,
                userAgent: ((req.headers["user-agent"] || "") as string).substring(0, 512) || null,
              });
              await db.update(banners)
                .set({
                  clicks: sql`${banners.clicks} + 1`,
                  newsletterClicks: sql`${banners.newsletterClicks} + 1`,
                })
                .where(eq(banners.id, bannerId));
              console.log(`[BannerTrack] ✅ Click newsletter: banner=${bannerId}, send=${sendId}`);
            } catch (trackErr) {
              console.error("[BannerTrack] Errore tracking:", trackErr);
            }
          })();
        }
      }
    } catch (err) {
      console.error("[BannerTrack] Errore:", err);
    }
    return res.redirect(302, targetUrl);
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
        return res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:-apple-system,sans-serif;max-width:500px;margin:80px auto;text-align:center;"><h2>✅ Già approvata</h2><p>La newsletter <strong>${record.subject}</strong> è già stata approvata e verrà inviata alle 22:00 CET.</p></body></html>`);
      }
      if (record.status === 'sent') {
        return res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:-apple-system,sans-serif;max-width:500px;margin:80px auto;text-align:center;"><h2>📧 Già inviata</h2><p>La newsletter <strong>${record.subject}</strong> è già stata inviata.</p></body></html>`);
      }
      await db.update(newsletterSends)
        .set({ approvedAt: new Date(), approvedBy: "ac@acinelli.com", status: "approved" })
        .where(eq(newsletterSends.id, record.id));
      console.log(`[Approval] ✅ Newsletter approvata: "${record.subject}" (id: ${record.id})`);
      try { await notifyOwner({ title: "✅ Newsletter approvata", content: `"${record.subject}" approvata. Invio massivo alle 22:00 CET.` }); } catch {}
      return res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:80px auto;text-align:center;background:#f5f5f7;padding:40px;border-radius:18px;"><div style="font-size:48px;margin-bottom:16px;">✅</div><h2 style="font-size:22px;font-weight:600;color:#1d1d1f;margin:0 0 8px;">Newsletter approvata</h2><p style="color:#6e6e73;font-size:15px;margin:0 0 24px;">${record.subject}</p><div style="background:#fff;border-radius:12px;padding:16px;border:1px solid #e5e5ea;"><p style="margin:0;font-size:14px;color:#1d1d1f;">L'invio massivo partirà automaticamente alle <strong>22:00 CET</strong>.</p></div><p style="margin-top:24px;font-size:12px;color:#aeaeb2;">ProofPress Admin · ${new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' })}</p></body></html>`);
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

  // POST /api/newsletter/trigger-morning — forza l'invio della newsletter BUONGIORNO (senza approvazione)
  // Usato dal catch-up scheduler e dal trigger manuale per garantire l'invio anche dopo riavvii del server
  app.post("/api/newsletter/trigger-morning", async (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token || token !== process.env.JWT_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const { sendMorningNewsletterToAll } = await import('../unifiedNewsletter');
      console.log('[MorningTrigger] Avvio invio manuale newsletter BUONGIORNO...');
      const result = await sendMorningNewsletterToAll();
      console.log('[MorningTrigger] Risultato:', JSON.stringify(result));
      return res.json(result);
    } catch (err: any) {
      console.error('[MorningTrigger] Errore:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // POST /api/newsletter/trigger-preview — forza la generazione della preview (crea record pending)
  app.post("/api/newsletter/trigger-preview", async (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token || token !== process.env.JWT_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const { sendUnifiedPreview } = await import('../unifiedNewsletter');
      console.log('[ManualPreview] Avvio generazione preview newsletter...');
      const result = await sendUnifiedPreview();
      console.log('[ManualPreview] Risultato:', JSON.stringify(result));
      return res.json(result);
    } catch (err: any) {
      console.error('[ManualPreview] Errore:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // POST /api/newsletter/force-send — genera + approva + invia in un unico step
  app.post("/api/newsletter/force-send", async (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token || token !== process.env.JWT_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const { sendUnifiedPreview, sendUnifiedNewsletterToAll } = await import('../unifiedNewsletter');
      const { getDb } = await import('../db' as any);
      const mysql = await import('../../node_modules/mysql2/promise.js' as any);
      const conn = await mysql.createConnection(process.env.DATABASE_URL);

      // Step 1: genera preview con force=true (bypassa guard in-memory e DB)
      console.log('[ForceNewsletter] Step 1: generazione preview (force mode)...');
      const previewResult = await sendUnifiedPreview(true);
      console.log('[ForceNewsletter] Preview generata:', previewResult?.subject);

      // Step 2: approva il record pending di oggi
      const [rows] = await conn.execute(
        "SELECT id FROM newsletter_sends WHERE DATE(createdAt) = CURDATE() AND status = 'pending' ORDER BY id DESC LIMIT 1"
      ) as any;
      if (rows.length === 0) {
        await conn.end();
        return res.status(400).json({ error: 'Nessun record pending trovato dopo la preview' });
      }
      const recordId = rows[0].id;
      await conn.execute(
        "UPDATE newsletter_sends SET status = 'approved', approvedAt = NOW() WHERE id = ?",
        [recordId]
      );
      console.log(`[ForceNewsletter] Step 2: record ${recordId} approvato`);
      await conn.end();

      // Step 3: invia a tutti
      console.log('[ForceNewsletter] Step 3: invio massivo...');
      const sendResult = await sendUnifiedNewsletterToAll();
      console.log('[ForceNewsletter] Invio completato:', JSON.stringify(sendResult));
      return res.json({ preview: previewResult, send: sendResult, recordId });
    } catch (err: any) {
      console.error('[ForceNewsletter] Errore:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Health Check pubblico (per UptimeRobot, Manus scheduler, monitoring esterno) ───────────
  // GET /api/health — risponde {status:'ok', ts, uptime} senza autenticazione
  app.get("/api/health", (_req, res) => {
    return res.json({
      status: "ok",
      ts: Date.now(),
      uptime: Math.floor(process.uptime()),
      version: process.env.npm_package_version ?? "1.0.0",
    });
  });

  // POST /api/health/restart — riavvio graceful del server (protetto da JWT_SECRET)
  // Usato dal monitoring esterno per forzare il riavvio in caso di anomalie
  app.post("/api/health/restart", (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token || token !== process.env.JWT_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    console.log('[HealthRestart] 🔄 Riavvio remoto richiesto dal monitoring esterno...');
    res.json({ status: 'restarting', ts: Date.now() });
    // Graceful restart: lascia 500ms per inviare la risposta, poi esce
    // Il process manager (Cloud Run) rileva l'uscita e riavvia automaticamente
    setTimeout(() => {
      console.log('[HealthRestart] 🛑 Uscita processo per riavvio graceful...');
      process.exit(0);
    }, 500);
  });

  // ── Newsletter BUONGIORNO — task schedulato esterno Manus (08:30 CET) ──────────────────────
  // POST /api/scheduled/morning-newsletter
  // Invio massivo newsletter BUONGIORNO a tutti gli iscritti attivi.
  // Indipendente dal ciclo di vita CloudRun: risolve il problema del cron mancato su riavvio server.
  // Auth: Authorization: Bearer <JWT_SECRET>
  app.post("/api/scheduled/morning-newsletter", async (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token || token !== process.env.JWT_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const { sendMorningNewsletterToAll } = await import('../unifiedNewsletter');
      console.log('[ScheduledMorningNL] ⏰ Avvio invio newsletter BUONGIORNO (task schedulato esterno Manus)...');
      const result = await sendMorningNewsletterToAll();
      console.log('[ScheduledMorningNL] ✅ Risultato:', JSON.stringify({
        success: result.success,
        recipientCount: result.recipientCount,
        subject: result.subject,
      }));
      return res.json({
        success: result.success,
        recipientCount: result.recipientCount,
        subject: result.subject,
        stats: result.stats,
        error: result.error,
      });
    } catch (err: any) {
      console.error('[ScheduledMorningNL] ❌ Errore:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Scheduled Dealflow endpoint (protetto da JWT_SECRET) ──────────────────────────────────
  // POST /api/scheduled/dealflow — triggera la generazione dei pick dealflow
  // Usato dal task schedulato notturno esterno di Manus per aggiornare /dealflow
  app.post("/api/scheduled/dealflow", async (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token || token !== process.env.JWT_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const { generateStartupRadarPost_main } = await import('../startupRadar');
      console.log('[ScheduledDealflow] Avvio generazione dealflow picks...');
      const result = await generateStartupRadarPost_main();
      console.log('[ScheduledDealflow] Risultato:', JSON.stringify({ success: result.success, startupCount: result.startupCount }));
      return res.json({ success: result.success, startupCount: result.startupCount, error: result.error });
    } catch (err: any) {
      console.error('[ScheduledDealflow] Errore:', err);
      return res.status(500).json({ error: err.message });
    }
  });


  // ── Pulizia settimanale iscritti (suppressions SendGrid → DB) ──────────────────
  // POST /api/scheduled/cleanup-subscribers
  // Recupera spam/bounce/blocks/invalid da SendGrid e imposta status='unsubscribed'
  // Auth: Authorization: Bearer <JWT_SECRET>
  app.post("/api/scheduled/cleanup-subscribers", async (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token || token !== process.env.JWT_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY ?? '';
    if (!SENDGRID_API_KEY) {
      return res.status(500).json({ error: 'SENDGRID_API_KEY not configured' });
    }

    try {
      console.log('[CleanupSubscribers] Avvio pulizia iscritti da suppressions SendGrid...');

      // Recupera tutte le pagine di una categoria di suppressions
      const fetchAllSuppressed = async (endpoint: string): Promise<Set<string>> => {
        const emails = new Set<string>();
        let offset = 0;
        const limit = 500;
        while (true) {
          const url = `https://api.sendgrid.com/v3/${endpoint}?limit=${limit}&offset=${offset}`;
          const r = await fetch(url, {
            headers: { Authorization: `Bearer ${SENDGRID_API_KEY}`, 'Content-Type': 'application/json' },
          });
          if (!r.ok) break;
          const data: any = await r.json();
          const items: any[] = Array.isArray(data) ? data : (data.result ?? []);
          if (items.length === 0) break;
          for (const item of items) {
            const email = (item.email ?? '').toLowerCase().trim();
            if (email) emails.add(email);
          }
          if (items.length < limit) break;
          offset += limit;
        }
        return emails;
      }

      const [spamSet, bounceSet, blockSet, invalidSet] = await Promise.all([
        fetchAllSuppressed('suppression/spam_reports'),
        fetchAllSuppressed('suppression/bounces'),
        fetchAllSuppressed('suppression/blocks'),
        fetchAllSuppressed('suppression/invalid_emails'),
      ]);

      const allSuppressed = new Set([...Array.from(spamSet), ...Array.from(bounceSet), ...Array.from(blockSet), ...Array.from(invalidSet)]);
      const emailList = Array.from(allSuppressed);

      console.log(`[CleanupSubscribers] Suppressions: spam=${spamSet.size} bounce=${bounceSet.size} blocks=${blockSet.size} invalid=${invalidSet.size} totale=${allSuppressed.size}`);

      if (emailList.length === 0) {
        return res.json({ success: true, suppressed: 0, removed: 0, activeAfter: 0 });
      }

      // Aggiorna in batch da 500
      const cleanupDb = await getDb();
      if (!cleanupDb) throw new Error('DB connection unavailable');
      const BATCH = 500;
      let totalRemoved = 0;
      for (let i = 0; i < emailList.length; i += BATCH) {
        const batch = emailList.slice(i, i + BATCH);
        const placeholders = batch.map(() => '?').join(',');
        const result: any = await cleanupDb.execute(
          sql.raw(`UPDATE subscribers SET status = 'unsubscribed', unsubscribedAt = NOW() WHERE email IN (${placeholders}) AND status = 'active'`)
        );
        // mysql2 restituisce [ResultSetHeader, ...] — affectedRows è nel primo elemento
        const affected = Array.isArray(result) ? (result[0]?.affectedRows ?? 0) : (result?.affectedRows ?? 0);
        totalRemoved += affected;
      }

      // Conta attivi rimanenti via raw SQL
      const activeCountRaw: any = await cleanupDb.execute(sql`SELECT COUNT(*) as cnt FROM subscribers WHERE status = 'active'`);
      const activeAfter: number = Array.isArray(activeCountRaw)
        ? (activeCountRaw[0]?.[0]?.cnt ?? activeCountRaw[0]?.cnt ?? 0)
        : (activeCountRaw?.cnt ?? 0);

      console.log(`[CleanupSubscribers] Completato: rimossi=${totalRemoved} attivi_rimanenti=${activeAfter}`);

      // Notifica owner
      try {
        const { notifyOwner } = await import('./notification');
        await notifyOwner({
          title: '🧹 Pulizia iscritti completata',
          content: `Suppressions SendGrid: spam=${spamSet.size}, bounce=${bounceSet.size}, blocks=${blockSet.size}, invalid=${invalidSet.size}\nIscritti disattivati: ${totalRemoved}\nIscritti attivi rimanenti: ${activeAfter}`,
        });
      } catch (_) { /* notifica opzionale */ }

      return res.json({
        success: true,
        suppressed: allSuppressed.size,
        removed: totalRemoved,
        activeAfter,
        breakdown: { spam: spamSet.size, bounce: bounceSet.size, blocks: blockSet.size, invalid: invalidSet.size },
      });
    } catch (err: any) {
      console.error('[CleanupSubscribers] Errore:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // ── ProofPress Verify — Batch Re-Certificazione Schedulata ──────────────────────
  // POST /api/scheduled/ppv-certify — certifica in batch gli articoli non ancora certificati da PPV
  // Usato dal task schedulato di Manus per certificare gli articoli esistenti
  // Auth: Cookie app_session_id (utente autenticato) oppure Authorization: Bearer <JWT_SECRET>
  app.post("/api/scheduled/ppv-certify", async (req, res) => {
    // Accetta sia JWT_SECRET (task schedulato) che cookie di sessione (admin)
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const isJwtAuth = token && token === process.env.JWT_SECRET;

    // Se non è JWT, verifica che sia un utente autenticato (via cookie)
    if (!isJwtAuth) {
      // Permetti anche utenti con ruolo 'user' o 'admin' (task schedulato usa cookie)
      const sessionCookie = req.cookies?.app_session_id;
      if (!sessionCookie) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }

    const { type = 'all', limit = 10 } = req.body || {};

    try {
      const { certifyWithPpv } = await import('../proofpressVerifyClient');
      const { getDb } = await import('../db');
      const { newsItems: newsItemsTable, channelContent: channelContentTable } = await import('../../drizzle/schema');
      const { isNull, desc, eq } = await import('drizzle-orm');
      const { invalidateAll } = await import('../cache');

      const db = await getDb();
      if (!db) return res.status(500).json({ error: 'DB non disponibile' });

      const results: { type: string; id: number; title: string; grade: string; score: number }[] = [];
      const errors: { type: string; id: number; title: string; error: string }[] = [];

      // Certifica news_items
      if (type === 'newsItems' || type === 'all') {
        const items = await db.select({
          id: newsItemsTable.id,
          title: newsItemsTable.title,
          summary: newsItemsTable.summary,
          sourceUrl: newsItemsTable.sourceUrl,
        }).from(newsItemsTable)
          .where(isNull(newsItemsTable.ppvHash))
          .orderBy(desc(newsItemsTable.createdAt))
          .limit(Number(limit));

        for (const item of items) {
          try {
            const ppv = await certifyWithPpv({
              title: item.title,
              content: item.summary,
              sourceUrl: item.sourceUrl,
            });
            if (ppv) {
              await db.update(newsItemsTable).set({
                ppvHash: ppv.hash,
                ppvDocumentId: ppv.document_id,
                ppvIpfsCid: ppv.ipfs_cid,
                ppvIpfsUrl: ppv.ipfs_url,
                ppvTrustScore: ppv.trust_score,
                ppvTrustGrade: ppv.trust_grade,
                ppvCertifiedAt: new Date(),
                ppvReport: ppv.report as any,
              }).where(eq(newsItemsTable.id, item.id));
              results.push({ type: 'newsItem', id: item.id, title: item.title, grade: ppv.trust_grade, score: Math.round(ppv.trust_score * 100) });
            } else {
              errors.push({ type: 'newsItem', id: item.id, title: item.title, error: 'PPV returned null' });
            }
          } catch (e: any) {
            errors.push({ type: 'newsItem', id: item.id, title: item.title, error: e.message });
          }
          await new Promise(r => setTimeout(r, 1000));
        }
      }

      // Certifica channel_content
      if (type === 'channelContent' || type === 'all') {
        const limitPerType = type === 'all' ? Math.floor(Number(limit) / 2) : Number(limit);
        const items = await db.select({
          id: channelContentTable.id,
          title: channelContentTable.title,
          body: channelContentTable.body,
          sourceUrl: channelContentTable.sourceUrl,
        }).from(channelContentTable)
          .where(isNull(channelContentTable.ppvHash))
          .orderBy(desc(channelContentTable.createdAt))
          .limit(limitPerType);

        for (const item of items) {
          try {
            const ppv = await certifyWithPpv({
              title: item.title,
              content: item.body ?? item.title,
              sourceUrl: item.sourceUrl,
            });
            if (ppv) {
              await db.update(channelContentTable).set({
                ppvHash: ppv.hash,
                ppvDocumentId: ppv.document_id,
                ppvIpfsCid: ppv.ipfs_cid,
                ppvIpfsUrl: ppv.ipfs_url,
                ppvTrustScore: ppv.trust_score,
                ppvTrustGrade: ppv.trust_grade,
                ppvCertifiedAt: new Date(),
                ppvReport: ppv.report as any,
              }).where(eq(channelContentTable.id, item.id));
              results.push({ type: 'channelContent', id: item.id, title: item.title, grade: ppv.trust_grade, score: Math.round(ppv.trust_score * 100) });
            } else {
              errors.push({ type: 'channelContent', id: item.id, title: item.title, error: 'PPV returned null' });
            }
          } catch (e: any) {
            errors.push({ type: 'channelContent', id: item.id, title: item.title, error: e.message });
          }
          await new Promise(r => setTimeout(r, 1000));
        }
      }

      invalidateAll();
      console.log(`[PPV Batch] Certificati: ${results.length}, Errori: ${errors.length}`);
      return res.json({ success: true, certified: results.length, errorsCount: errors.length, results, errors });
    } catch (err: any) {
      console.error('[PPV Batch] Errore:', err);
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
