import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { parse as parseCookieHeader } from "cookie";
import { getDb } from "../db";
import { siteUsers } from "../../drizzle/schema";
import { eq, and, gt } from "drizzle-orm";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

/**
 * siteProtectedProcedure — accetta ENTRAMBI i sistemi di autenticazione:
 * 1. OAuth Manus (app_session_id → ctx.user già popolato da context.ts)
 * 2. SiteAuth nativo ProofPress (ideasmart_session → verifica DB siteUsers)
 * Se uno dei due è valido, la procedura procede. Altrimenti lancia UNAUTHORIZED.
 */
const requireSiteUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  // Sistema 1: OAuth Manus (già verificato in context.ts)
  if (ctx.user) {
    return next({ ctx: { ...ctx, user: ctx.user } });
  }

  // Sistema 2: SiteAuth nativo ProofPress
  const req = (ctx as any).req;
  const cookieHeader = req?.headers?.cookie || "";
  const cookies = parseCookieHeader(cookieHeader);
  const sessionToken = cookies["ideasmart_session"];

  if (sessionToken) {
    try {
      const db = await getDb();
      if (db) {
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

        if (rows.length > 0 && rows[0].emailVerified) {
          // Utente nativo autenticato — procede con ctx.user = null (non è un User OAuth)
          // ma il middleware ha verificato l'autenticità
          return next({ ctx });
        }
      }
    } catch {
      // Fallthrough to UNAUTHORIZED
    }
  }

  throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
});

export const siteProtectedProcedure = t.procedure.use(requireSiteUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);
