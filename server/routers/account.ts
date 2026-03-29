/**
 * account router — gestione profilo e lista di lettura personale
 * Richiede sessione cookie valida (siteAuth)
 */
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { siteUsers, savedArticles } from "../../drizzle/schema";
import { eq, and, gt, desc } from "drizzle-orm";
import { createHash, randomBytes } from "crypto";
import { TRPCError } from "@trpc/server";

function hashPassword(plain: string): string {
  return createHash("sha256").update(plain + (process.env.JWT_SECRET || "ideasmart_secret")).digest("hex");
}

/** Helper: legge l'utente dalla sessione cookie, lancia UNAUTHORIZED se non loggato */
async function requireSiteUser(ctx: any) {
  const req = ctx.req;
  const sessionToken = req?.cookies?.ideasmart_session;
  if (!sessionToken) throw new TRPCError({ code: "UNAUTHORIZED", message: "Devi essere loggato." });

  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });

  const now = new Date();
  const rows = await db.select()
    .from(siteUsers)
    .where(and(
      eq(siteUsers.sessionToken, sessionToken),
      gt(siteUsers.sessionExpiresAt, now)
    ))
    .limit(1);

  if (rows.length === 0) throw new TRPCError({ code: "UNAUTHORIZED", message: "Sessione scaduta. Accedi di nuovo." });
  return { user: rows[0], db };
}

export const accountRouter = router({

  /** Cambia la password dell'utente loggato */
  changePassword: publicProcedure
    .input(z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(6).max(128),
    }))
    .mutation(async ({ input, ctx }) => {
      const { user, db } = await requireSiteUser(ctx);

      if (user.passwordHash !== hashPassword(input.currentPassword)) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Password attuale non corretta." });
      }

      await db.update(siteUsers)
        .set({ passwordHash: hashPassword(input.newPassword) })
        .where(eq(siteUsers.id, user.id));

      return { ok: true };
    }),

  /** Salva un articolo nella lista di lettura */
  saveArticle: publicProcedure
    .input(z.object({
      contentType: z.enum(["news", "editorial", "reportage", "analysis", "startup", "research"]),
      contentId: z.number().int().positive(),
      title: z.string().max(512),
      section: z.string().max(64).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { user, db } = await requireSiteUser(ctx);

      // Controlla se già salvato
      const existing = await db.select({ id: savedArticles.id })
        .from(savedArticles)
        .where(and(
          eq(savedArticles.siteUserId, user.id),
          eq(savedArticles.contentType, input.contentType),
          eq(savedArticles.contentId, input.contentId)
        ))
        .limit(1);

      if (existing.length > 0) {
        // Già salvato → rimuovi (toggle)
        await db.delete(savedArticles).where(eq(savedArticles.id, existing[0].id));
        return { saved: false };
      }

      await db.insert(savedArticles).values({
        siteUserId: user.id,
        contentType: input.contentType,
        contentId: input.contentId,
        title: input.title,
        section: input.section ?? null,
      });

      return { saved: true };
    }),

  /** Controlla se un articolo è salvato */
  isSaved: publicProcedure
    .input(z.object({
      contentType: z.enum(["news", "editorial", "reportage", "analysis", "startup", "research"]),
      contentId: z.number().int().positive(),
    }))
    .query(async ({ input, ctx }) => {
      const req = ctx.req as any;
      const sessionToken = req?.cookies?.ideasmart_session;
      if (!sessionToken) return { saved: false };

      const db = await getDb();
      if (!db) return { saved: false };

      const now = new Date();
      const userRows = await db.select({ id: siteUsers.id })
        .from(siteUsers)
        .where(and(eq(siteUsers.sessionToken, sessionToken), gt(siteUsers.sessionExpiresAt, now)))
        .limit(1);

      if (userRows.length === 0) return { saved: false };

      const rows = await db.select({ id: savedArticles.id })
        .from(savedArticles)
        .where(and(
          eq(savedArticles.siteUserId, userRows[0].id),
          eq(savedArticles.contentType, input.contentType),
          eq(savedArticles.contentId, input.contentId)
        ))
        .limit(1);

      return { saved: rows.length > 0 };
    }),

  /** Lista di lettura dell'utente loggato */
  getReadingList: publicProcedure
    .query(async ({ ctx }) => {
      const { user, db } = await requireSiteUser(ctx);

      const rows = await db.select()
        .from(savedArticles)
        .where(eq(savedArticles.siteUserId, user.id))
        .orderBy(desc(savedArticles.savedAt));

      return rows;
    }),

  /** Rimuove un articolo dalla lista di lettura */
  removeFromReadingList: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      const { user, db } = await requireSiteUser(ctx);

      await db.delete(savedArticles)
        .where(and(
          eq(savedArticles.id, input.id),
          eq(savedArticles.siteUserId, user.id) // sicurezza: solo il proprietario
        ));

      return { ok: true };
    }),
});
