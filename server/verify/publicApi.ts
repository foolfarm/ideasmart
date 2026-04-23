/**
 * ProofPress Verify SaaS — Public REST API
 *
 * Endpoint REST pubblico per l'integrazione B2B:
 *   POST /api/verify/article   — verifica un articolo tramite hash o URL
 *   GET  /api/verify/report/:hash — recupera un report già generato
 *   GET  /api/verify/status    — stato del piano e consumo mensile
 *
 * Autenticazione: Bearer <ppv_live_...> nell'header Authorization.
 * Rate limiting: basato sul campo rateLimit della API key.
 *
 * Piani e limiti mensili:
 *   essential     — 100 articoli/mese  — €490/mese
 *   premiere      — 300 articoli/mese  — €990/mese
 *   professional  — 500 articoli/mese  — €1.470/mese
 *   custom        — illimitato         — su preventivo
 */

import type { Express, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { newsItems as newsItemsTable } from "../../drizzle/schema";
import { validateApiKey } from "./apiKeyRouter";
import { incrementArticleUsage } from "./usageRouter";

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractBearerToken(req: Request): string | null {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) return null;
  return auth.slice(7).trim() || null;
}

function apiError(res: Response, status: number, code: string, message: string) {
  return res.status(status).json({ error: { code, message } });
}

// ── Registrazione route sull'app Express ─────────────────────────────────────

export function registerVerifyPublicApi(app: Express) {
  // ─────────────────────────────────────────────────────────────────────────
  // POST /api/verify/article
  // Body: { hash?: string, url?: string }
  // Risposta: { status, trustScore, trustGrade, report, usage }
  // ─────────────────────────────────────────────────────────────────────────
  app.post("/api/verify/article", async (req: Request, res: Response) => {
    const rawKey = extractBearerToken(req);
    if (!rawKey) {
      return apiError(res, 401, "UNAUTHORIZED", "API key mancante. Usa Authorization: Bearer <ppv_live_...>");
    }

    // 1. Valida la chiave API
    const keyData = await validateApiKey(rawKey);
    if (!keyData) {
      return apiError(res, 401, "INVALID_API_KEY", "Chiave API non valida o revocata.");
    }
    if (!keyData.canVerify) {
      return apiError(res, 403, "FORBIDDEN", "Questa chiave non ha il permesso di verificare articoli.");
    }

    const { hash, url } = req.body || {};
    if (!hash && !url) {
      return apiError(res, 400, "BAD_REQUEST", "Fornisci 'hash' (SHA-256 dell'articolo) o 'url' (URL sorgente).");
    }

    try {
      const db = await getDb();
      if (!db) return apiError(res, 503, "DB_UNAVAILABLE", "Database temporaneamente non disponibile.");

      // 2. Trova l'articolo nel DB
      let article = null;
      if (hash) {
        const rows = await db
          .select()
          .from(newsItemsTable)
          .where(eq(newsItemsTable.verifyHash, hash))
          .limit(1);
        article = rows[0] ?? null;
      } else if (url) {
        const rows = await db
          .select()
          .from(newsItemsTable)
          .where(eq(newsItemsTable.sourceUrl, url))
          .limit(1);
        article = rows[0] ?? null;
      }

      if (!article) {
        return apiError(res, 404, "ARTICLE_NOT_FOUND", "Articolo non trovato nel database ProofPress.");
      }

      // 3. Controlla il consumo mensile (rate limit)
      const usage = await incrementArticleUsage(keyData.organizationId);
      if (!usage.allowed) {
        return res.status(429).json({
          error: {
            code: "QUOTA_EXCEEDED",
            message: `Hai raggiunto il limite mensile di ${usage.articlesLimit} articoli. Aggiorna il piano per continuare.`,
          },
          usage: {
            articlesUsed: usage.articlesUsed,
            articlesLimit: usage.articlesLimit,
          },
        });
      }

      // 4. Se già verificato, restituisce i dati salvati (cache)
      if (article.trustScore !== null && article.trustGrade !== null) {
        return res.json({
          status: "verified",
          article: {
            id: article.id,
            title: article.title,
            verifyHash: article.verifyHash,
            sourceUrl: article.sourceUrl,
            publishedAt: article.publishedAt,
            proofpressUrl: `https://proofpress.ai/ai/news/${article.id}`,
          },
          trustScore: article.trustScore,
          trustGrade: article.trustGrade,
          report: article.verifyReport ?? null,
          usage: {
            articlesUsed: usage.articlesUsed,
            articlesLimit: usage.articlesLimit,
          },
        });
      }

      // 5. Esegui pipeline verify (primo accesso)
      if (!article.verifyHash) {
        return apiError(res, 422, "NO_HASH", "Articolo trovato ma privo di hash di verifica.");
      }

      const { runVerifyPipeline } = await import("../verifyEngine.js");
      const { corroborateClaims } = await import("../corroborator.js");

      const report = await runVerifyPipeline({
        articleId: article.id,
        title: article.title,
        summary: article.summary,
        sourceUrl: article.sourceUrl,
        verifyHash: article.verifyHash,
        corroborationFn: corroborateClaims,
      });

      // 6. Salva risultati nel DB
      await db
        .update(newsItemsTable)
        .set({
          verifyReport: report as unknown as Record<string, unknown>,
          trustScore: report.trust_score.overall,
          trustGrade: report.trust_score.grade,
        })
        .where(eq(newsItemsTable.id, article.id));

      return res.json({
        status: "verified",
        article: {
          id: article.id,
          title: article.title,
          verifyHash: article.verifyHash,
          sourceUrl: article.sourceUrl,
          publishedAt: article.publishedAt,
          proofpressUrl: `https://proofpress.ai/ai/news/${article.id}`,
        },
        trustScore: report.trust_score.overall,
        trustGrade: report.trust_score.grade,
        report,
        usage: {
          articlesUsed: usage.articlesUsed,
          articlesLimit: usage.articlesLimit,
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[VerifyPublicApi] Errore:", msg);
      return apiError(res, 500, "INTERNAL_ERROR", "Errore interno durante la verifica.");
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET /api/verify/report/:hash
  // Recupera un report già generato senza consumare quota
  // ─────────────────────────────────────────────────────────────────────────
  app.get("/api/verify/report/:hash", async (req: Request, res: Response) => {
    const rawKey = extractBearerToken(req);
    if (!rawKey) return apiError(res, 401, "UNAUTHORIZED", "API key mancante.");

    const keyData = await validateApiKey(rawKey);
    if (!keyData || !keyData.canReadReports) {
      return apiError(res, 401, "INVALID_API_KEY", "Chiave API non valida o senza permesso di lettura.");
    }

    const { hash } = req.params;
    if (!hash || hash.length !== 64) {
      return apiError(res, 400, "BAD_REQUEST", "Hash SHA-256 non valido (deve essere 64 caratteri hex).");
    }

    try {
      const db = await getDb();
      if (!db) return apiError(res, 503, "DB_UNAVAILABLE", "Database temporaneamente non disponibile.");

      const [article] = await db
        .select({
          id: newsItemsTable.id,
          title: newsItemsTable.title,
          verifyHash: newsItemsTable.verifyHash,
          sourceUrl: newsItemsTable.sourceUrl,
          publishedAt: newsItemsTable.publishedAt,
          trustScore: newsItemsTable.trustScore,
          trustGrade: newsItemsTable.trustGrade,
          verifyReport: newsItemsTable.verifyReport,
        })
        .from(newsItemsTable)
        .where(eq(newsItemsTable.verifyHash, hash))
        .limit(1);

      if (!article) return apiError(res, 404, "NOT_FOUND", "Articolo non trovato.");
      if (article.trustScore === null) {
        return apiError(res, 404, "NOT_VERIFIED", "Articolo trovato ma non ancora verificato. Usa POST /api/verify/article.");
      }

      return res.json({
        article: {
          id: article.id,
          title: article.title,
          verifyHash: article.verifyHash,
          sourceUrl: article.sourceUrl,
          publishedAt: article.publishedAt,
          proofpressUrl: `https://proofpress.ai/ai/news/${article.id}`,
        },
        trustScore: article.trustScore,
        trustGrade: article.trustGrade,
        report: article.verifyReport ?? null,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[VerifyPublicApi] Errore GET report:", msg);
      return apiError(res, 500, "INTERNAL_ERROR", "Errore interno.");
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET /api/verify/status
  // Stato del piano e consumo mensile dell'organizzazione
  // ─────────────────────────────────────────────────────────────────────────
  app.get("/api/verify/status", async (req: Request, res: Response) => {
    const rawKey = extractBearerToken(req);
    if (!rawKey) return apiError(res, 401, "UNAUTHORIZED", "API key mancante.");

    const keyData = await validateApiKey(rawKey);
    if (!keyData) return apiError(res, 401, "INVALID_API_KEY", "Chiave API non valida.");

    try {
      const { verifyOrganizations, verifySubscriptions } = await import("../../drizzle/schema");
      const { and, lte, gte } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) return apiError(res, 503, "DB_UNAVAILABLE", "Database non disponibile.");

      const [org] = await db
        .select({ id: verifyOrganizations.id, name: verifyOrganizations.name, plan: verifyOrganizations.plan, status: verifyOrganizations.status })
        .from(verifyOrganizations)
        .where(eq(verifyOrganizations.id, keyData.organizationId))
        .limit(1);

      if (!org) return apiError(res, 404, "ORG_NOT_FOUND", "Organizzazione non trovata.");

      const now = new Date();
      const [sub] = await db
        .select()
        .from(verifySubscriptions)
        .where(
          and(
            eq(verifySubscriptions.organizationId, org.id),
            lte(verifySubscriptions.periodStart, now),
            gte(verifySubscriptions.periodEnd, now)
          )
        )
        .limit(1);

      return res.json({
        organization: { id: org.id, name: org.name, plan: org.plan, status: org.status },
        subscription: sub
          ? {
              plan: sub.plan,
              status: sub.status,
              articlesUsed: sub.articlesUsed,
              articlesLimit: sub.articlesLimit,
              periodStart: sub.periodStart,
              periodEnd: sub.periodEnd,
            }
          : null,
        apiKey: {
          canVerify: keyData.canVerify,
          canReadReports: keyData.canReadReports,
          rateLimit: keyData.rateLimit,
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[VerifyPublicApi] Errore GET status:", msg);
      return apiError(res, 500, "INTERNAL_ERROR", "Errore interno.");
    }
  });

  console.log("[VerifyPublicApi] ✅ Endpoint REST registrati: POST /api/verify/article, GET /api/verify/report/:hash, GET /api/verify/status");
}
