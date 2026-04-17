/**
 * Journalist Portal Router
 * Area privata per giornalisti accreditati ProofPress.
 * Ogni giornalista ha una journalistKey univoca inclusa nell'hash SHA-256
 * per certificare la paternità dell'articolo tramite ProofPress Verify.
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, desc, and, gt } from "drizzle-orm";
import crypto from "crypto";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { journalists, journalistArticles, newsItems } from "../../drizzle/schema";

// ── Helpers ──────────────────────────────────────────────────────────────────

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "pp_journalist_salt_2026").digest("hex") as string;
}

function generateToken(length = 64): string {
  return (crypto.randomBytes(length) as Buffer).toString("hex");
}

/** Genera la journalistKey univoca (32 byte hex = 64 chars) */
function generateJournalistKey(): string {
  return (crypto.randomBytes(32) as Buffer).toString("hex");
}

/**
 * Genera l'hash SHA-256 dell'articolo includendo la journalistKey.
 * payload: title | body_first_500 | journalistKey | createdAt_iso
 * Questo certifica sia il contenuto che la paternità in modo immutabile.
 */
function generateArticleHash(
  title: string,
  body: string,
  journalistKey: string,
  createdAt: Date
): string {
  const payload = [
    title.trim(),
    body.substring(0, 500).trim(),
    journalistKey.trim(),
    createdAt.toISOString(),
  ].join("|");
  return crypto.createHash("sha256").update(payload, "utf8").digest("hex");
}

/** Genera il bollino pubblico: PP-J-XXXXXXXXXXXXXXXX (16 chars uppercase) */
function generateVerifyBadge(hash: string): string {
  return `PP-J-${hash.substring(0, 16).toUpperCase()}`;
}

// ── Middleware sessione giornalista ───────────────────────────────────────────

async function getJournalistFromSession(ctx: any) {
  const req = ctx.req;
  const sessionToken = req?.cookies?.journalist_session;
  if (!sessionToken) return null;
  const db = await getDb();
  if (!db) return null;
  const now = new Date();
  const rows = await db
    .select()
    .from(journalists)
    .where(
      and(
        eq(journalists.sessionToken, sessionToken),
        gt(journalists.sessionExpiresAt, now),
        eq(journalists.isActive, true)
      )
    )
    .limit(1);
  return rows.length > 0 ? rows[0] : null;
}

// ── Router ────────────────────────────────────────────────────────────────────

export const journalistRouter = router({
  /** Login giornalista con username + password */
  login: publicProcedure
    .input(
      z.object({
        username: z.string().min(3),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });

      const rows = await db
        .select()
        .from(journalists)
        .where(eq(journalists.username, input.username.toLowerCase().trim()))
        .limit(1);

      if (rows.length === 0) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Username o password non corretti." });
      }

      const journalist = rows[0];

      if (!journalist.isActive) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Account disattivato. Contatta la redazione ProofPress." });
      }

      if (journalist.passwordHash !== hashPassword(input.password)) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Username o password non corretti." });
      }

      const sessionToken = generateToken(64);
      const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 giorni

      await db
        .update(journalists)
        .set({ sessionToken, sessionExpiresAt, lastLoginAt: new Date() })
        .where(eq(journalists.id, journalist.id));

      const res = (ctx as any).res;
      if (res) {
        res.cookie("journalist_session", sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: "/",
        });
      }

      return {
        ok: true,
        journalist: {
          id: journalist.id,
          username: journalist.username,
          displayName: journalist.displayName,
          journalistKey: journalist.journalistKey,
          totalArticles: journalist.totalArticles,
          avgTrustScore: journalist.avgTrustScore,
        },
      };
    }),

  /** Restituisce il giornalista corrente dalla sessione */
  me: publicProcedure.query(async ({ ctx }) => {
    const journalist = await getJournalistFromSession(ctx);
    if (!journalist) return null;
    return {
      id: journalist.id,
      username: journalist.username,
      displayName: journalist.displayName,
      bio: journalist.bio,
      avatarUrl: journalist.avatarUrl,
      linkedinUrl: journalist.linkedinUrl,
      journalistKey: journalist.journalistKey,
      totalArticles: journalist.totalArticles,
      avgTrustScore: journalist.avgTrustScore,
      createdAt: journalist.createdAt,
    };
  }),

  /** Logout */
  logout: publicProcedure.mutation(async ({ ctx }) => {
    const req = (ctx as any).req;
    const res = (ctx as any).res;
    const sessionToken = req?.cookies?.journalist_session;
    if (sessionToken) {
      const db = await getDb();
      if (db) {
        await db
          .update(journalists)
          .set({ sessionToken: null, sessionExpiresAt: null })
          .where(eq(journalists.sessionToken, sessionToken));
      }
    }
    if (res) {
      res.clearCookie("journalist_session", { path: "/" });
    }
    return { ok: true };
  }),

  /** Lista articoli del giornalista loggato */
  myArticles: publicProcedure.query(async ({ ctx }) => {
    const journalist = await getJournalistFromSession(ctx);
    if (!journalist) throw new TRPCError({ code: "UNAUTHORIZED", message: "Accesso richiesto." });

    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const articles = await db
      .select()
      .from(journalistArticles)
      .where(eq(journalistArticles.journalistId, journalist.id))
      .orderBy(desc(journalistArticles.createdAt));

    return articles;
  }),

  /** Crea o aggiorna una bozza */
  saveDraft: publicProcedure
    .input(
      z.object({
        id: z.number().optional(), // se presente, aggiorna; altrimenti crea
        title: z.string().min(5).max(500),
        body: z.string().min(50),
        summary: z.string().max(500).optional(),
        category: z.string().min(2).max(100),
        imageUrl: z.string().url().optional().or(z.literal("")),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const journalist = await getJournalistFromSession(ctx);
      if (!journalist) throw new TRPCError({ code: "UNAUTHORIZED", message: "Accesso richiesto." });

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      if (input.id) {
        // Aggiorna bozza esistente (solo se appartiene al giornalista e non è pubblicata)
        const existing = await db
          .select()
          .from(journalistArticles)
          .where(
            and(
              eq(journalistArticles.id, input.id),
              eq(journalistArticles.journalistId, journalist.id)
            )
          )
          .limit(1);

        if (existing.length === 0) throw new TRPCError({ code: "NOT_FOUND" });
        if (existing[0].status === "published") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Non puoi modificare un articolo già pubblicato." });
        }

        await db
          .update(journalistArticles)
          .set({
            title: input.title,
            body: input.body,
            summary: input.summary ?? null,
            category: input.category,
            imageUrl: input.imageUrl || null,
            status: "draft",
          })
          .where(eq(journalistArticles.id, input.id));

        return { ok: true, id: input.id };
      } else {
        // Crea nuova bozza
        const [result] = await db.insert(journalistArticles).values({
          journalistId: journalist.id,
          title: input.title,
          body: input.body,
          summary: input.summary ?? null,
          category: input.category,
          imageUrl: input.imageUrl || null,
          status: "draft",
        });

        return { ok: true, id: (result as any).insertId };
      }
    }),

  /**
   * Invia l'articolo in revisione (workflow moderazione).
   * Il giornalista non pubblica direttamente: l'articolo passa in stato "review"
   * e attende l'approvazione dell'admin prima di essere pubblicato.
   */
  submitForReview: publicProcedure
    .input(z.object({ articleId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const journalist = await getJournalistFromSession(ctx);
      if (!journalist) throw new TRPCError({ code: "UNAUTHORIZED", message: "Accesso richiesto." });

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const rows = await db
        .select()
        .from(journalistArticles)
        .where(
          and(
            eq(journalistArticles.id, input.articleId),
            eq(journalistArticles.journalistId, journalist.id)
          )
        )
        .limit(1);

      if (rows.length === 0) throw new TRPCError({ code: "NOT_FOUND" });
      const article = rows[0];

      if (article.status === "published") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Articolo già pubblicato." });
      }
      if (article.status === "review") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Articolo già in revisione." });
      }

      await db
        .update(journalistArticles)
        .set({ status: "review", reviewNotes: null, reviewedAt: null })
        .where(eq(journalistArticles.id, article.id));

      return { ok: true };
    }),

  /**
   * Pubblica l'articolo su ProofPress (chiamato dall'admin dopo approvazione).
   * 1. Genera l'hash SHA-256 con journalistKey inclusa
   * 2. Genera il bollino PP-J-XXXXXXXXXXXXXXXX
   * 3. Inserisce in news_items come articolo certificato
   * 4. Aggiorna journalist_articles con hash, badge e stato published
   * 5. Aggiorna il contatore totalArticles del giornalista
   */
  publish: publicProcedure
    .input(z.object({ articleId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const journalist = await getJournalistFromSession(ctx);
      if (!journalist) throw new TRPCError({ code: "UNAUTHORIZED", message: "Accesso richiesto." });

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Recupera articolo
      const rows = await db
        .select()
        .from(journalistArticles)
        .where(
          and(
            eq(journalistArticles.id, input.articleId),
            eq(journalistArticles.journalistId, journalist.id)
          )
        )
        .limit(1);

      if (rows.length === 0) throw new TRPCError({ code: "NOT_FOUND" });
      const article = rows[0];

      if (article.status === "published") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Articolo già pubblicato." });
      }

      const now = new Date();

      // Genera hash con journalistKey — certifica autore + contenuto
      const verifyHash = generateArticleHash(
        article.title,
        article.body,
        journalist.journalistKey,
        now
      );
      const verifyBadge = generateVerifyBadge(verifyHash);

      // Genera il summary automatico se non presente
      const summary = article.summary || article.body.substring(0, 300).trim() + "...";

      // Calcola weekLabel (formato YYYY-WNN)
      const weekNum = Math.ceil(
        ((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7
      );
      const weekLabel = `${now.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;

      // Inserisce in news_items come articolo certificato
      const [newsResult] = await db.insert(newsItems).values({
        section: "news",
        title: article.title,
        summary,
        category: article.category,
        sourceName: `${journalist.displayName} — ProofPress Certified`,
        sourceUrl: null,
        publishedAt: now.toISOString(),
        weekLabel,
        position: 0,
        imageUrl: article.imageUrl ?? null,
        verifyHash,
        createdAt: now,
      });

      const newsItemId = (newsResult as any).insertId;

      // Aggiorna journalist_articles
      await db
        .update(journalistArticles)
        .set({
          status: "published",
          verifyHash,
          verifyBadge,
          publishedAt: now,
          newsItemId,
        })
        .where(eq(journalistArticles.id, article.id));

      // Aggiorna contatore articoli del giornalista
      await db
        .update(journalists)
        .set({ totalArticles: journalist.totalArticles + 1 })
        .where(eq(journalists.id, journalist.id));

      return {
        ok: true,
        verifyHash,
        verifyBadge,
        newsItemId,
        publishedAt: now,
      };
    }),

  /** Recupera un singolo articolo per modifica */
  getArticle: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const journalist = await getJournalistFromSession(ctx);
      if (!journalist) throw new TRPCError({ code: "UNAUTHORIZED" });

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const rows = await db
        .select()
        .from(journalistArticles)
        .where(
          and(
            eq(journalistArticles.id, input.id),
            eq(journalistArticles.journalistId, journalist.id)
          )
        )
        .limit(1);

      if (rows.length === 0) throw new TRPCError({ code: "NOT_FOUND" });
      return rows[0];
    }),

  /** Elimina una bozza (non pubblicata) */
  deleteDraft: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const journalist = await getJournalistFromSession(ctx);
      if (!journalist) throw new TRPCError({ code: "UNAUTHORIZED" });

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const rows = await db
        .select()
        .from(journalistArticles)
        .where(
          and(
            eq(journalistArticles.id, input.id),
            eq(journalistArticles.journalistId, journalist.id)
          )
        )
        .limit(1);

      if (rows.length === 0) throw new TRPCError({ code: "NOT_FOUND" });
      if (rows[0].status === "published") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Non puoi eliminare un articolo pubblicato." });
      }

      await db
        .delete(journalistArticles)
        .where(eq(journalistArticles.id, input.id));

      return { ok: true };
    }),
});

// ── Admin tRPC procedures ────────────────────────────────────────────────────
// Protette da adminProcedure (solo utenti con role=admin)

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Solo gli admin possono eseguire questa operazione" });
  }
  return next({ ctx });
});

export const journalistAdminRouter = router({
  /** Lista tutti i giornalisti */
  list: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const rows = await db
      .select({
        id: journalists.id,
        username: journalists.username,
        email: journalists.email,
        displayName: journalists.displayName,
        bio: journalists.bio,
        journalistKey: journalists.journalistKey,
        isActive: journalists.isActive,
        totalArticles: journalists.totalArticles,
        createdAt: journalists.createdAt,
        lastLoginAt: journalists.lastLoginAt,
      })
      .from(journalists)
      .orderBy(desc(journalists.createdAt));
    return rows;
  }),

  /** Crea un nuovo account giornalista */
  create: adminProcedure
    .input(
      z.object({
        username: z.string().min(3).max(64),
        password: z.string().min(6).max(128),
        displayName: z.string().min(2).max(255),
        email: z.string().email(),
        bio: z.string().max(1000).optional(),
        linkedinUrl: z.string().url().optional().or(z.literal("")),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Controlla duplicati
      const existing = await db
        .select({ id: journalists.id })
        .from(journalists)
        .where(eq(journalists.username, input.username.toLowerCase().trim()))
        .limit(1);
      if (existing.length > 0) {
        throw new TRPCError({ code: "CONFLICT", message: "Username già in uso." });
      }

      const journalistKey = generateJournalistKey();
      const passwordHash = hashPassword(input.password);

      const [result] = await db.insert(journalists).values({
        username: input.username.toLowerCase().trim(),
        email: input.email.toLowerCase().trim(),
        passwordHash,
        displayName: input.displayName,
        bio: input.bio ?? null,
        linkedinUrl: input.linkedinUrl || null,
        journalistKey,
        isActive: true,
      });

      return {
        ok: true,
        id: (result as any).insertId,
        username: input.username,
        journalistKey,
      };
    }),

  /** Attiva o disattiva un account giornalista */
  toggleActive: adminProcedure
    .input(z.object({ id: z.number(), isActive: z.boolean() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db
        .update(journalists)
        .set({ isActive: input.isActive })
        .where(eq(journalists.id, input.id));
      return { ok: true };
    }),

  /** Reset password di un giornalista */
  resetPassword: adminProcedure
    .input(z.object({ id: z.number(), newPassword: z.string().min(6) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const passwordHash = hashPassword(input.newPassword);
      await db
        .update(journalists)
        .set({ passwordHash, sessionToken: null, sessionExpiresAt: null })
        .where(eq(journalists.id, input.id));
      return { ok: true };
    }),

  /** Elimina un account giornalista (solo se non ha articoli pubblicati) */
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Verifica che non abbia articoli pubblicati
      const published = await db
        .select({ id: journalistArticles.id })
        .from(journalistArticles)
        .where(
          and(
            eq(journalistArticles.journalistId, input.id),
            eq(journalistArticles.status, "published")
          )
        )
        .limit(1);

      if (published.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Non puoi eliminare un giornalista con articoli pubblicati. Disattivalo invece.",
        });
      }

      // Elimina prima gli articoli in bozza
      await db
        .delete(journalistArticles)
        .where(eq(journalistArticles.journalistId, input.id));

      // Poi elimina il giornalista
      await db.delete(journalists).where(eq(journalists.id, input.id));

      return { ok: true };
    }),

  /** Lista articoli in attesa di revisione */
  listPendingReview: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const rows = await db
      .select({
        id: journalistArticles.id,
        journalistId: journalistArticles.journalistId,
        title: journalistArticles.title,
        body: journalistArticles.body,
        summary: journalistArticles.summary,
        category: journalistArticles.category,
        imageUrl: journalistArticles.imageUrl,
        status: journalistArticles.status,
        reviewNotes: journalistArticles.reviewNotes,
        reviewedAt: journalistArticles.reviewedAt,
        createdAt: journalistArticles.createdAt,
        updatedAt: journalistArticles.updatedAt,
        journalistDisplayName: journalists.displayName,
        journalistUsername: journalists.username,
        journalistKey: journalists.journalistKey,
      })
      .from(journalistArticles)
      .innerJoin(journalists, eq(journalistArticles.journalistId, journalists.id))
      .where(eq(journalistArticles.status, "review"))
      .orderBy(desc(journalistArticles.updatedAt));
    return rows;
  }),

  /** Approva un articolo e lo pubblica */
  approveArticle: adminProcedure
    .input(z.object({ articleId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Recupera articolo + giornalista
      const rows = await db
        .select()
        .from(journalistArticles)
        .innerJoin(journalists, eq(journalistArticles.journalistId, journalists.id))
        .where(eq(journalistArticles.id, input.articleId))
        .limit(1);

      if (rows.length === 0) throw new TRPCError({ code: "NOT_FOUND" });
      const { journalist_articles: article, journalists: journalist } = rows[0];

      if (article.status !== "review") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "L'articolo non è in stato di revisione." });
      }

      const now = new Date();

      // Genera hash con journalistKey
      const crypto = await import("crypto");
      const contentToHash = `${article.title}|${article.body}|${journalist.journalistKey}|${now.toISOString()}`;
      const verifyHash = crypto.createHash("sha256").update(contentToHash).digest("hex");
      const verifyBadge = `PP-J-${verifyHash.substring(0, 16).toUpperCase()}`;
      const summary = article.summary || article.body.substring(0, 300).trim() + "...";

      const weekNum = Math.ceil(
        ((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7
      );
      const weekLabel = `${now.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;

      // Inserisce in news_items
      const [newsResult] = await db.insert(newsItems).values({
        section: "news",
        title: article.title,
        summary,
        category: article.category,
        sourceName: `${journalist.displayName} — ProofPress Certified`,
        sourceUrl: null,
        publishedAt: now.toISOString(),
        weekLabel,
        position: 0,
        imageUrl: article.imageUrl ?? null,
        verifyHash,
        createdAt: now,
      });

      const newsItemId = (newsResult as any).insertId;

      // Aggiorna articolo
      await db
        .update(journalistArticles)
        .set({
          status: "published",
          verifyHash,
          verifyBadge,
          publishedAt: now,
          newsItemId,
          reviewedAt: now,
          reviewNotes: null,
        })
        .where(eq(journalistArticles.id, article.id));

      // Aggiorna contatore
      await db
        .update(journalists)
        .set({ totalArticles: journalist.totalArticles + 1 })
        .where(eq(journalists.id, journalist.id));

      return { ok: true, verifyHash, verifyBadge, newsItemId };
    }),

  /** Rifiuta un articolo con note di feedback */
  rejectArticle: adminProcedure
    .input(z.object({ articleId: z.number(), notes: z.string().min(1).max(1000) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const rows = await db
        .select({ id: journalistArticles.id, status: journalistArticles.status })
        .from(journalistArticles)
        .where(eq(journalistArticles.id, input.articleId))
        .limit(1);

      if (rows.length === 0) throw new TRPCError({ code: "NOT_FOUND" });
      if (rows[0].status !== "review") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "L'articolo non è in stato di revisione." });
      }

      await db
        .update(journalistArticles)
        .set({
          status: "rejected",
          reviewNotes: input.notes,
          reviewedAt: new Date(),
        })
        .where(eq(journalistArticles.id, input.articleId));

      return { ok: true };
    }),
});

// ── Admin: crea account giornalista ──────────────────────────────────────────
// Usato dall'admin ProofPress per accreditare nuovi giornalisti

export async function createJournalistAccount(params: {
  username: string;
  email: string;
  password: string;
  displayName: string;
  bio?: string;
  linkedinUrl?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database non disponibile");

  const journalistKey = generateJournalistKey();
  const passwordHash = hashPassword(params.password);

  const [result] = await db.insert(journalists).values({
    username: params.username.toLowerCase().trim(),
    email: params.email.toLowerCase().trim(),
    passwordHash,
    displayName: params.displayName,
    bio: params.bio ?? null,
    linkedinUrl: params.linkedinUrl ?? null,
    journalistKey,
    isActive: true,
  });

  return {
    id: (result as any).insertId,
    username: params.username,
    journalistKey,
  };
}
