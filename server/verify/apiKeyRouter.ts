/**
 * ProofPress Verify SaaS — API Key Router
 *
 * Generazione, revoca e validazione delle chiavi API per l'integrazione
 * redazionale degli editori clienti.
 *
 * Formato chiave: ppv_live_<32 byte hex> (64 char totali dopo il prefisso)
 * Storage: solo l'hash SHA-256 viene salvato nel DB — la chiave raw viene
 * mostrata una sola volta al momento della creazione.
 */
import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { createHash, randomBytes } from "crypto";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  verifyApiKeys,
  verifyOrganizations,
  type InsertVerifyApiKey,
} from "../../drizzle/schema";

// ── Helpers ───────────────────────────────────────────────────────────────────

const KEY_PREFIX = "ppv_live_";

function generateRawKey(): string {
  return KEY_PREFIX + randomBytes(32).toString("hex");
}

function hashKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

function requireAdmin(role: string) {
  if (role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Accesso riservato agli amministratori." });
  }
}

// ── Funzione pubblica per validare una chiave API (usata da publicApi.ts) ────

export async function validateApiKey(rawKey: string): Promise<{
  organizationId: number;
  canVerify: boolean;
  canReadReports: boolean;
  rateLimit: number;
} | null> {
  const db = await getDb();
  if (!db) return null;

  const keyHash = hashKey(rawKey);

  const [keyRow] = await db
    .select()
    .from(verifyApiKeys)
    .where(
      and(
        eq(verifyApiKeys.keyHash, keyHash),
        eq(verifyApiKeys.isActive, true)
      )
    )
    .limit(1);

  if (!keyRow) return null;
  if (keyRow.expiresAt && keyRow.expiresAt < new Date()) return null;

  // Aggiorna lastUsedAt in background (non blocca la risposta)
  db.update(verifyApiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(verifyApiKeys.id, keyRow.id))
    .catch(() => {});

  return {
    organizationId: keyRow.organizationId,
    canVerify: keyRow.canVerify,
    canReadReports: keyRow.canReadReports,
    rateLimit: keyRow.rateLimit,
  };
}

// ── Router ────────────────────────────────────────────────────────────────────

export const verifyApiKeyRouter = router({
  /**
   * [ADMIN] Lista chiavi API di un'organizzazione (senza mostrare la chiave raw)
   */
  list: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile." });

      return db
        .select({
          id: verifyApiKeys.id,
          keyPrefix: verifyApiKeys.keyPrefix,
          label: verifyApiKeys.label,
          canVerify: verifyApiKeys.canVerify,
          canReadReports: verifyApiKeys.canReadReports,
          canManageOrg: verifyApiKeys.canManageOrg,
          rateLimit: verifyApiKeys.rateLimit,
          isActive: verifyApiKeys.isActive,
          lastUsedAt: verifyApiKeys.lastUsedAt,
          expiresAt: verifyApiKeys.expiresAt,
          createdAt: verifyApiKeys.createdAt,
          revokedAt: verifyApiKeys.revokedAt,
        })
        .from(verifyApiKeys)
        .where(eq(verifyApiKeys.organizationId, input.organizationId))
        .orderBy(desc(verifyApiKeys.createdAt));
    }),

  /**
   * [ADMIN] Genera una nuova chiave API per un'organizzazione.
   * La chiave raw viene restituita UNA SOLA VOLTA — non è recuperabile in seguito.
   */
  create: protectedProcedure
    .input(
      z.object({
        organizationId: z.number().int().positive(),
        label: z.string().max(128).optional(),
        canVerify: z.boolean().default(true),
        canReadReports: z.boolean().default(true),
        canManageOrg: z.boolean().default(false),
        rateLimit: z.number().int().min(1).max(10000).default(100),
        expiresInDays: z.number().int().min(1).max(3650).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile." });

      // Verifica che l'organizzazione esista
      const [org] = await db
        .select({ id: verifyOrganizations.id })
        .from(verifyOrganizations)
        .where(eq(verifyOrganizations.id, input.organizationId))
        .limit(1);
      if (!org) throw new TRPCError({ code: "NOT_FOUND", message: "Organizzazione non trovata." });

      const rawKey = generateRawKey();
      const keyHash = hashKey(rawKey);
      const keyPrefix = rawKey.slice(0, 12) + "..."; // mostra solo i primi 12 char come label

      const expiresAt = input.expiresInDays
        ? new Date(Date.now() + input.expiresInDays * 86400_000)
        : null;

      const insertData: InsertVerifyApiKey = {
        organizationId: input.organizationId,
        keyPrefix,
        keyHash,
        label: input.label ?? null,
        canVerify: input.canVerify,
        canReadReports: input.canReadReports,
        canManageOrg: input.canManageOrg,
        rateLimit: input.rateLimit,
        isActive: true,
        expiresAt: expiresAt ?? undefined,
      };

      const [result] = await db.insert(verifyApiKeys).values(insertData).$returningId();

      return {
        id: result.id,
        rawKey, // ⚠️ mostrata UNA SOLA VOLTA — salvala subito
        keyPrefix,
        message: "Chiave API generata. Salvala subito: non sarà più visibile.",
      };
    }),

  /**
   * [ADMIN] Revoca una chiave API (soft delete)
   */
  revoke: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile." });

      await db
        .update(verifyApiKeys)
        .set({ isActive: false, revokedAt: new Date() })
        .where(eq(verifyApiKeys.id, input.id));

      return { success: true, message: "Chiave API revocata." };
    }),
});
