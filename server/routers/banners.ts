/**
 * bannersRouter — Sistema manchette pubblicitarie ProofPress
 * Gestione CRUD banner, API pubblica rotazione, tracking impression/click
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { banners, bannerEvents, bannerSettings, Banner } from "../../drizzle/schema";
import { eq, gte, sql } from "drizzle-orm";
import { storagePut } from "../storage";

// ── Helper: controlla se un banner è attivo in questo momento ──────────────
function isBannerCurrentlyActive(banner: {
  active: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
}): boolean {
  if (!banner.active) return false;
  const now = new Date();
  if (banner.startsAt && banner.startsAt > now) return false;
  if (banner.endsAt && banner.endsAt < now) return false;
  return true;
}

// ── Helper: ottieni/crea impostazioni default ──────────────────────────────
async function getOrCreateSettings() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
  const rows = await db.select().from(bannerSettings).limit(1);
  if (rows.length > 0) return rows[0];
  await db.insert(bannerSettings).values({
    rotationIntervalMs: 15000,
    transition: "fade",
    transitionDurationMs: 400,
  });
  const created = await db.select().from(bannerSettings).limit(1);
  return created[0];
}

// ── Admin: procedura protetta solo per admin ───────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Accesso riservato agli amministratori" });
  }
  return next({ ctx });
});

export const bannersRouter = router({

  // ── API PUBBLICA: manchette attive per il frontend ─────────────────────
  getManchette: publicProcedure.query(async () => {
    const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
    const allBanners = await db.select().from(banners).orderBy(banners.sortOrder, banners.id);
    const settings = await getOrCreateSettings();

    const activeBanners = allBanners.filter(isBannerCurrentlyActive);

    type BannerSlim = { id: number; name: string; imageUrl: string; clickUrl: string; weight: number };

    const leftBanners: BannerSlim[] = activeBanners
      .filter((b: Banner) => b.slot === "left" || b.slot === "both")
      .map((b: Banner) => ({ id: b.id, name: b.name, imageUrl: b.imageUrl, clickUrl: b.clickUrl, weight: b.weight }));

    const rightBanners: BannerSlim[] = activeBanners
      .filter((b: Banner) => b.slot === "right" || b.slot === "both")
      .map((b: Banner) => ({ id: b.id, name: b.name, imageUrl: b.imageUrl, clickUrl: b.clickUrl, weight: b.weight }));

    const sidebarBanners: BannerSlim[] = activeBanners
      .filter((b: Banner) => b.slot === "sidebar")
      .map((b: Banner) => ({ id: b.id, name: b.name, imageUrl: b.imageUrl, clickUrl: b.clickUrl, weight: b.weight }));

    return {
      left: leftBanners,
      right: rightBanners,
      sidebar: sidebarBanners,
      settings: {
        rotationIntervalMs: settings.rotationIntervalMs,
        transition: settings.transition,
        transitionDurationMs: settings.transitionDurationMs,
      },
    };
  }),

  // ── TRACKING: logga impression ─────────────────────────────────────────
  trackImpression: publicProcedure
    .input(z.object({
      bannerId: z.number(),
      slot: z.enum(["left", "right", "sidebar"]),
      userAgent: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
      try {
        await db.insert(bannerEvents).values({
          bannerId: input.bannerId,
          eventType: "impression",
          slot: input.slot,
          userAgent: input.userAgent?.slice(0, 512) ?? null,
        });
        // Aggiorna contatore aggregato
        await db.update(banners)
          .set({ impressions: sql`${banners.impressions} + 1` })
          .where(eq(banners.id, input.bannerId));
      } catch (err) {
        // Silenzioso — il tracking non deve bloccare l'UX
        console.error("[banners.trackImpression]", err);
      }
      return { ok: true };
    }),

  // ── TRACKING: logga click ──────────────────────────────────────────────
  trackClick: publicProcedure
    .input(z.object({
      bannerId: z.number(),
      slot: z.enum(["left", "right", "sidebar"]),
      referrer: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
      try {
        await db.insert(bannerEvents).values({
          bannerId: input.bannerId,
          eventType: "click",
          slot: input.slot,
          referrer: input.referrer?.slice(0, 512) ?? null,
        });
        await db.update(banners)
          .set({ clicks: sql`${banners.clicks} + 1` })
          .where(eq(banners.id, input.bannerId));
      } catch (err) {
        console.error("[banners.trackClick]", err);
      }
      return { ok: true };
    }),

  // ── ADMIN: lista tutti i banner ────────────────────────────────────────
  list: adminProcedure.query(async () => {
    const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
    return db.select().from(banners).orderBy(banners.sortOrder, banners.id);
  }),

  // ── ADMIN: crea banner (upload immagine base64 → S3) ──────────────────
  create: adminProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      imageBase64: z.string(), // "data:image/png;base64,..."
      imageMime: z.string().default("image/png"),
      clickUrl: z.string().url(),
      slot: z.enum(["left", "right", "both", "sidebar"]).default("both"),
      weight: z.number().int().min(1).max(10).default(5),
      active: z.boolean().default(true),
      startsAt: z.string().optional(), // ISO date string
      endsAt: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
      // Upload immagine su S3
      const base64Data = input.imageBase64.replace(/^data:[^;]+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const ext = input.imageMime.split("/")[1] ?? "png";
      const fileKey = `banners/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { url: imageUrl } = await storagePut(fileKey, buffer, input.imageMime);

      const [result] = await db.insert(banners).values({
        name: input.name,
        imageUrl,
        imageKey: fileKey,
        clickUrl: input.clickUrl,
        slot: input.slot,
        weight: input.weight,
        active: input.active,
        startsAt: input.startsAt ? new Date(input.startsAt) : null,
        endsAt: input.endsAt ? new Date(input.endsAt) : null,
        sortOrder: 0,
      });

      return { success: true, imageUrl };
    }),

  // ── ADMIN: aggiorna banner ─────────────────────────────────────────────
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).max(255).optional(),
      clickUrl: z.string().url().optional(),
      slot: z.enum(["left", "right", "both", "sidebar"]).optional(),
      weight: z.number().int().min(1).max(10).optional(),
      active: z.boolean().optional(),
      startsAt: z.string().nullable().optional(),
      endsAt: z.string().nullable().optional(),
      sortOrder: z.number().int().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
      const { id, startsAt, endsAt, ...rest } = input;
      const updateData: Record<string, unknown> = { ...rest };
      if (startsAt !== undefined) updateData.startsAt = startsAt ? new Date(startsAt) : null;
      if (endsAt !== undefined) updateData.endsAt = endsAt ? new Date(endsAt) : null;

      await db.update(banners).set(updateData).where(eq(banners.id, id));
      return { success: true };
    }),

  // ── ADMIN: toggle attivo/disattivo ────────────────────────────────────
  toggle: adminProcedure
    .input(z.object({ id: z.number(), active: z.boolean() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
      await db.update(banners).set({ active: input.active }).where(eq(banners.id, input.id));
      return { success: true };
    }),

  // ── ADMIN: elimina banner ──────────────────────────────────────────────
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
      await db.delete(bannerEvents).where(eq(bannerEvents.bannerId, input.id));
      await db.delete(banners).where(eq(banners.id, input.id));
      return { success: true };
    }),

  // ── ADMIN: statistiche giornaliere per banner ──────────────────────────
  stats: adminProcedure
    .input(z.object({ days: z.number().int().min(1).max(90).default(30) }))
    .query(async ({ input }) => {
      const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
      const since = new Date();
      since.setDate(since.getDate() - input.days);

      // Aggregazione per bannerId + eventType
      const events = await db
        .select({
          bannerId: bannerEvents.bannerId,
          eventType: bannerEvents.eventType,
          count: sql<number>`COUNT(*)`,
        })
        .from(bannerEvents)
        .where(gte(bannerEvents.createdAt, since))
        .groupBy(bannerEvents.bannerId, bannerEvents.eventType);

      const allBanners = await db.select().from(banners).orderBy(banners.sortOrder, banners.id);

      return allBanners.map((b) => {
        const imp = events.find((e) => e.bannerId === b.id && e.eventType === "impression")?.count ?? 0;
        const clk = events.find((e) => e.bannerId === b.id && e.eventType === "click")?.count ?? 0;
        const ctr = imp > 0 ? ((Number(clk) / Number(imp)) * 100).toFixed(2) : "0.00";
        return {
          id: b.id,
          name: b.name,
          slot: b.slot,
          active: b.active,
          impressions: Number(imp),
          clicks: Number(clk),
          ctr: parseFloat(ctr),
          totalImpressions: b.impressions,
          totalClicks: b.clicks,
        };
      });
    }),

  // ── ADMIN: aggiorna impostazioni rotazione ─────────────────────────────
  updateSettings: adminProcedure
    .input(z.object({
      rotationIntervalMs: z.number().int().min(3000).max(120000).optional(),
      transition: z.enum(["fade", "slide", "none"]).optional(),
      transitionDurationMs: z.number().int().min(100).max(2000).optional(),
    }))
    .mutation(async ({ input }) => {
      const settings = await getOrCreateSettings();
      const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
      await db.update(bannerSettings).set(input).where(eq(bannerSettings.id, settings.id));
      return { success: true };
    }),

  // ── ADMIN: ottieni impostazioni ────────────────────────────────────────
  getSettings: adminProcedure.query(async () => {
    return getOrCreateSettings();
  }),
});
