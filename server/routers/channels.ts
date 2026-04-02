import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { channelContent, rssFeedSources, rssIngestLog } from "../../drizzle/schema";
import { eq, and, desc, sql, count } from "drizzle-orm";

const CONTENT_CHANNEL_SLUGS = [
  "start-here",
  "copy-paste-ai",
  "automate-with-ai",
  "make-money-with-ai",
  "daily-ai-tools",
  "verified-ai-news",
  "ai-opportunities",
] as const;

const RSS_CHANNEL_SLUGS = [
  "copy-paste-ai",
  "automate-with-ai",
  "make-money-with-ai",
  "daily-ai-tools",
  "verified-ai-news",
  "ai-opportunities",
] as const;

const contentChannelEnum = z.enum(CONTENT_CHANNEL_SLUGS);
const rssChannelEnum = z.enum(RSS_CHANNEL_SLUGS);

// Admin guard
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Accesso riservato agli amministratori" });
  }
  return next({ ctx });
});

export const channelsRouter = router({
  // ── Public: lista contenuti per canale (paginata) ────────────────────────
  getContent: publicProcedure
    .input(z.object({
      channel: contentChannelEnum,
      date: z.string().optional(), // YYYY-MM-DD, default oggi
      limit: z.number().min(1).max(50).default(10),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
      const targetDate = input.date || new Date().toISOString().slice(0, 10);
      const items = await db
        .select()
        .from(channelContent)
        .where(
          and(
            eq(channelContent.channel, input.channel),
            eq(channelContent.publishDate, targetDate),
            eq(channelContent.status, "published"),
          )
        )
        .orderBy(channelContent.position)
        .limit(input.limit)
        .offset(input.offset);
      return items;
    }),

  // ── Public: lista contenuti recenti per canale (ultimi N giorni) ──────────
  getRecent: publicProcedure
    .input(z.object({
      channel: contentChannelEnum,
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
      const items = await db
        .select()
        .from(channelContent)
        .where(
          and(
            eq(channelContent.channel, input.channel),
            eq(channelContent.status, "published"),
          )
        )
        .orderBy(desc(channelContent.publishDate), channelContent.position)
        .limit(input.limit);
      return items;
    }),

  // ── Public: singolo contenuto per ID ─────────────────────────────────────
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
      const [item] = await db
        .select()
        .from(channelContent)
        .where(eq(channelContent.id, input.id))
        .limit(1);
      if (!item) throw new TRPCError({ code: "NOT_FOUND", message: "Contenuto non trovato" });
      // Incrementa view count
      await db.update(channelContent)
        .set({ viewCount: sql`${channelContent.viewCount} + 1` })
        .where(eq(channelContent.id, input.id));
      return item;
    }),

  // ── Public: conteggio contenuti per canale oggi ──────────────────────────
  getTodayCount: publicProcedure
    .input(z.object({ channel: contentChannelEnum }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
      const today = new Date().toISOString().slice(0, 10);
      const [result] = await db
        .select({ total: count() })
        .from(channelContent)
        .where(
          and(
            eq(channelContent.channel, input.channel),
            eq(channelContent.publishDate, today),
            eq(channelContent.status, "published"),
          )
        );
      return result?.total ?? 0;
    }),

  // ── Public: tutti i canali con conteggio di oggi ─────────────────────────
  getAllChannelStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
    const today = new Date().toISOString().slice(0, 10);
    const stats = await db
      .select({
        channel: channelContent.channel,
        total: count(),
      })
      .from(channelContent)
      .where(
        and(
          eq(channelContent.publishDate, today),
          eq(channelContent.status, "published"),
        )
      )
      .groupBy(channelContent.channel);
    return stats;
  }),

  // ── Admin: crea contenuto per un canale ──────────────────────────────────
  create: adminProcedure
    .input(z.object({
      channel: contentChannelEnum,
      title: z.string().min(1),
      subtitle: z.string().optional(),
      body: z.string().min(1),
      category: z.string().optional(),
      actionItem: z.string().optional(),
      promptText: z.string().optional(),
      sourceUrl: z.string().optional(),
      sourceName: z.string().optional(),
      imageUrl: z.string().optional(),
      externalUrl: z.string().optional(),
      publishDate: z.string().optional(),
      position: z.number().optional(),
      status: z.enum(["draft", "published", "archived"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
      const publishDate = input.publishDate || new Date().toISOString().slice(0, 10);
      const [result] = await db.insert(channelContent).values({
        channel: input.channel,
        title: input.title,
        subtitle: input.subtitle,
        body: input.body,
        category: input.category,
        actionItem: input.actionItem,
        promptText: input.promptText,
        sourceUrl: input.sourceUrl,
        sourceName: input.sourceName,
        imageUrl: input.imageUrl,
        externalUrl: input.externalUrl,
        publishDate,
        position: input.position ?? 0,
        status: input.status ?? "published",
      });
      return { id: result.insertId, success: true };
    }),

  // ── Admin: aggiorna contenuto ────────────────────────────────────────────
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      subtitle: z.string().optional(),
      body: z.string().optional(),
      category: z.string().optional(),
      actionItem: z.string().optional(),
      promptText: z.string().optional(),
      sourceUrl: z.string().optional(),
      sourceName: z.string().optional(),
      imageUrl: z.string().optional(),
      externalUrl: z.string().optional(),
      publishDate: z.string().optional(),
      position: z.number().optional(),
      status: z.enum(["draft", "published", "archived"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
      const { id, ...updates } = input;
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined)
      );
      if (Object.keys(cleanUpdates).length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Nessun campo da aggiornare" });
      }
      await db.update(channelContent).set(cleanUpdates).where(eq(channelContent.id, id));
      return { success: true };
    }),

  // ── Admin: elimina contenuto ─────────────────────────────────────────────
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
      await db.delete(channelContent).where(eq(channelContent.id, input.id));
      return { success: true };
    }),

  // ── Admin: lista fonti RSS ───────────────────────────────────────────────
  getRssSources: adminProcedure
    .input(z.object({ channel: rssChannelEnum.optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
      const conditions = input.channel
        ? eq(rssFeedSources.channel, input.channel)
        : undefined;
      const sources = await db
        .select()
        .from(rssFeedSources)
        .where(conditions)
        .orderBy(rssFeedSources.channel, rssFeedSources.name);
      return sources;
    }),

  // ── Admin: aggiungi fonte RSS ────────────────────────────────────────────
  addRssSource: adminProcedure
    .input(z.object({
      channel: rssChannelEnum,
      name: z.string().min(1),
      feedUrl: z.string().url(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
      const [result] = await db.insert(rssFeedSources).values({
        channel: input.channel,
        name: input.name,
        feedUrl: input.feedUrl,
      });
      return { id: result.insertId, success: true };
    }),

  // ── Admin: toggle fonte RSS ──────────────────────────────────────────────
  toggleRssSource: adminProcedure
    .input(z.object({ id: z.number(), active: z.boolean() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
      await db.update(rssFeedSources)
        .set({ active: input.active })
        .where(eq(rssFeedSources.id, input.id));
      return { success: true };
    }),
});
