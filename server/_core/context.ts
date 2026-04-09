import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { COOKIE_NAME } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  // Salta l'autenticazione OAuth se non c'è il cookie Manus (COOKIE_NAME = app_session_id).
  // Questo evita chiamate HTTP esterne inutili che bloccherebbero le richieste per 30 secondi
  // quando l'utente usa solo l'autenticazione nativa Proof Press (ideasmart_session).
  const cookieHeader = opts.req.headers.cookie || "";
  const cookies = parseCookieHeader(cookieHeader);
  const hasManusSession = !!cookies[COOKIE_NAME];

  if (hasManusSession) {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch (error) {
      // Authentication is optional for public procedures.
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
