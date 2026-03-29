/**
 * siteAuth router — registrazione nativa IdeaSmart
 * Flusso: register → email conferma → verifyEmail → login → cookie sessione
 */
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { siteUsers } from "../../drizzle/schema";
import { eq, and, gt } from "drizzle-orm";
import { createHash, randomBytes } from "crypto";
import { TRPCError } from "@trpc/server";
import { sendVerificationEmail } from "../_core/mailer";

// ─── helpers ─────────────────────────────────────────────────────────────────
function hashPassword(plain: string): string {
  return createHash("sha256").update(plain + (process.env.JWT_SECRET || "ideasmart_secret")).digest("hex");
}

function generateToken(len = 48): string {
  return randomBytes(len).toString("hex");
}

// ─── router ──────────────────────────────────────────────────────────────────
export const siteAuthRouter = router({

  /** Registra un nuovo utente e invia email di conferma */
  register: publicProcedure
    .input(z.object({
      username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/, "Solo lettere, numeri e underscore"),
      email: z.string().email(),
      password: z.string().min(6).max(128),
      origin: z.string().url(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });

      const existing = await db.select()
        .from(siteUsers)
        .where(eq(siteUsers.email, input.email.toLowerCase()))
        .limit(1);

      if (existing.length > 0) {
        const existingUser = existing[0];
        // Se l'email è già verificata → blocca con messaggio di accesso
        if (existingUser.emailVerified) {
          throw new TRPCError({ code: "CONFLICT", message: "Email già registrata. Prova ad accedere." });
        }
        // Se l'email NON è verificata → aggiorna il token e reinvia l'email
        const newToken = generateToken();
        const newExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await db.update(siteUsers)
          .set({
            passwordHash: hashPassword(input.password),
            verificationToken: newToken,
            verificationTokenExpiresAt: newExpiry,
          })
          .where(eq(siteUsers.id, existingUser.id));
        const verifyUrl = `${input.origin}/verifica-email?token=${newToken}`;
        await sendVerificationEmail({ to: input.email, username: existingUser.username, verifyUrl });
        return { ok: true, resent: true };
      }

      const existingUsername = await db.select({ id: siteUsers.id })
        .from(siteUsers)
        .where(eq(siteUsers.username, input.username.toLowerCase()))
        .limit(1);
      if (existingUsername.length > 0) {
        throw new TRPCError({ code: "CONFLICT", message: "Username già in uso. Scegline un altro." });
      }

      const verificationToken = generateToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

      await db.insert(siteUsers).values({
        username: input.username.toLowerCase(),
        email: input.email.toLowerCase(),
        passwordHash: hashPassword(input.password),
        emailVerified: false,
        verificationToken,
        verificationTokenExpiresAt: expiresAt,
      });

      const verifyUrl = `${input.origin}/verifica-email?token=${verificationToken}`;
      await sendVerificationEmail({ to: input.email, username: input.username, verifyUrl });

      return { ok: true };
    }),

  /** Verifica il token email */
  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });

      const now = new Date();
      const rows = await db.select()
        .from(siteUsers)
        .where(and(
          eq(siteUsers.verificationToken, input.token),
          gt(siteUsers.verificationTokenExpiresAt, now)
        ))
        .limit(1);

      if (rows.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Link non valido o scaduto. Registrati di nuovo." });
      }

      await db.update(siteUsers)
        .set({ emailVerified: true, verificationToken: null, verificationTokenExpiresAt: null })
        .where(eq(siteUsers.id, rows[0].id));

      return { ok: true, username: rows[0].username };
    }),

  /** Login con email + password → imposta cookie sessione */
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });

      const rows = await db.select()
        .from(siteUsers)
        .where(eq(siteUsers.email, input.email.toLowerCase()))
        .limit(1);

      if (rows.length === 0) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Email o password non corretti." });
      }

      const user = rows[0];

      if (!user.emailVerified) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Devi prima confermare la tua email. Controlla la casella di posta." });
      }

      if (user.passwordHash !== hashPassword(input.password)) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Email o password non corretti." });
      }

      const sessionToken = generateToken(64);
      const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 giorni

      await db.update(siteUsers)
        .set({ sessionToken, sessionExpiresAt, lastLoginAt: new Date() })
        .where(eq(siteUsers.id, user.id));

      const res = (ctx as any).res;
      if (res) {
        res.cookie("ideasmart_session", sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 30 * 24 * 60 * 60 * 1000,
          path: "/",
        });
      }

      return { ok: true, username: user.username };
    }),

  /** Restituisce l'utente corrente dalla sessione cookie */
  me: publicProcedure
    .query(async ({ ctx }) => {
      const req = (ctx as any).req;
      const sessionToken = req?.cookies?.ideasmart_session;
      if (!sessionToken) return null;

      const db = await getDb();
      if (!db) return null;

      const now = new Date();
      const rows = await db.select({
        id: siteUsers.id,
        username: siteUsers.username,
        email: siteUsers.email,
        emailVerified: siteUsers.emailVerified,
      })
        .from(siteUsers)
        .where(and(
          eq(siteUsers.sessionToken, sessionToken),
          gt(siteUsers.sessionExpiresAt, now)
        ))
        .limit(1);

      return rows.length > 0 ? rows[0] : null;
    }),

  /** Logout: cancella cookie e invalida sessione */
  logout: publicProcedure
    .mutation(async ({ ctx }) => {
      const req = (ctx as any).req;
      const res = (ctx as any).res;
      const sessionToken = req?.cookies?.ideasmart_session;

      if (sessionToken) {
        const db = await getDb();
        if (db) {
          await db.update(siteUsers)
            .set({ sessionToken: null, sessionExpiresAt: null })
            .where(eq(siteUsers.sessionToken, sessionToken));
        }
      }

      if (res) {
        res.clearCookie("ideasmart_session", { path: "/" });
      }

      return { ok: true };
    }),
});
