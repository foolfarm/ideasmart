/**
 * Amazon Deals Router — ProofPress
 * CRUD per i deal Amazon affiliati con scraping automatico dei metadati.
 * Rotazione giornaliera automatica: il deal del giorno viene scelto in base
 * alla data corrente (round-robin sui deal attivi).
 */

import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { amazonDailyDeals } from "../../drizzle/schema";
import { eq, desc, and, asc, sql } from "drizzle-orm";

// ─── Middleware admin ─────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Solo gli admin possono eseguire questa operazione" });
  }
  return next({ ctx });
});

// ─── Scraping metadati Amazon ─────────────────────────────────────────────────
async function scrapeAmazonMetadata(url: string): Promise<{
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  rating: string;
  reviewCount: string;
  category: string;
}> {
  const defaults = {
    title: "Offerta Amazon del Giorno",
    description: "Scopri questa offerta selezionata per i lettori di ProofPress.",
    price: "Vedi su Amazon",
    imageUrl: "",
    rating: "",
    reviewCount: "",
    category: "Tech & Innovazione",
  };

  try {
    // Risolvi prima il redirect di amzn.to
    let finalUrl = url;
    try {
      const headRes = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        signal: AbortSignal.timeout(8000),
      });
      finalUrl = headRes.url || url;
    } catch {
      // Usa l'URL originale se il redirect fallisce
    }

    const res = await fetch(finalUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "it-IT,it;q=0.9,en;q=0.8",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) return defaults;
    const html = await res.text();

    // ── Titolo ────────────────────────────────────────────────────────────────
    let title = defaults.title;
    const titlePatterns = [
      /<span id="productTitle"[^>]*>\s*([^<]+)\s*<\/span>/i,
      /<title[^>]*>([^<]+)<\/title>/i,
    ];
    for (const pat of titlePatterns) {
      const m = html.match(pat);
      if (m) {
        title = m[1].replace(/ - Amazon\.it.*$/i, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').trim().slice(0, 250);
        if (title.length > 10) break;
      }
    }

    // ── Immagine ──────────────────────────────────────────────────────────────
    let imageUrl = defaults.imageUrl;
    const imgPatterns = [
      /"hiRes":"(https:\/\/m\.media-amazon\.com[^"]+)"/,
      /"large":"(https:\/\/m\.media-amazon\.com[^"]+)"/,
      /id="landingImage"[^>]+src="([^"]+)"/,
      /id="imgBlkFront"[^>]+src="([^"]+)"/,
      /data-old-hires="([^"]+)"/,
      /"imageUrl":"(https:\/\/m\.media-amazon\.com[^"]+)"/,
    ];
    for (const pat of imgPatterns) {
      const m = html.match(pat);
      if (m && m[1].includes("amazon")) {
        imageUrl = m[1];
        break;
      }
    }

    // ── Prezzo ────────────────────────────────────────────────────────────────
    let price = defaults.price;
    const pricePatterns = [
      /"priceAmount":([\d.]+)/,
      /class="a-price-whole">([0-9.,]+)/,
      /"price":"([^"]+)"/,
      /id="priceblock_ourprice"[^>]*>([^<]+)</,
    ];
    for (const pat of pricePatterns) {
      const m = html.match(pat);
      if (m) {
        const raw = m[1].replace(/[^\d.,]/g, "");
        if (raw) { price = `€${raw}`; break; }
      }
    }

    // ── Rating ────────────────────────────────────────────────────────────────
    let rating = defaults.rating;
    const ratingM = html.match(/"ratingScore":([\d.]+)/) || html.match(/class="a-icon-alt">([0-9,.]+ su 5)/);
    if (ratingM) rating = ratingM[1].replace(",", ".").slice(0, 6);

    // ── Recensioni ────────────────────────────────────────────────────────────
    let reviewCount = defaults.reviewCount;
    const reviewM = html.match(/"totalReviewCount":(\d+)/) || html.match(/id="acrCustomerReviewText"[^>]*>([\d.,]+ recensioni)/);
    if (reviewM) reviewCount = reviewM[1];

    // ── Categoria ─────────────────────────────────────────────────────────────
    let category = defaults.category;
      const catM = html.match(/"categoryName":"([^"]+)"/) || html.match(/class="a-breadcrumb"[^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>/);
    if (catM) category = catM[1].trim().slice(0, 100);

    return { title, description: defaults.description, price, imageUrl, rating, reviewCount, category };
  } catch (err) {
    console.warn("[AmazonScraper] Errore:", (err as Error).message);
    return defaults;
  }
}

// ─── Helper: deal del giorno (round-robin su attivi) ─────────────────────────
export async function getTodayAmazonDeal(): Promise<typeof amazonDailyDeals.$inferSelect | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // 1. Cerca un deal schedulato esattamente per oggi
    const scheduled = await db
      .select()
      .from(amazonDailyDeals)
      .where(and(eq(amazonDailyDeals.active, true), eq(amazonDailyDeals.scheduledDate, today)))
      .limit(1);
    if (scheduled.length > 0) return scheduled[0];

    // 2. Fallback: round-robin su tutti i deal attivi con metadati completi
    const allActive = await db
      .select()
      .from(amazonDailyDeals)
      .where(and(eq(amazonDailyDeals.active, true), eq(amazonDailyDeals.scrapingStatus, "done")))
      .orderBy(asc(amazonDailyDeals.id));

    if (allActive.length === 0) {
      // Anche pending va bene come fallback
      const anyActive = await db
        .select()
        .from(amazonDailyDeals)
        .where(eq(amazonDailyDeals.active, true))
        .orderBy(asc(amazonDailyDeals.id));
      if (anyActive.length === 0) return null;
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
      return anyActive[dayOfYear % anyActive.length];
    }

    // Round-robin basato sul giorno dell'anno
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return allActive[dayOfYear % allActive.length];
  } catch {
    return null;
  }
}

// ─── Helper: 3 deal per la newsletter (deal del giorno + 2 alternativi) ───────
export async function getNewsletterAmazonDeals(count = 3): Promise<typeof amazonDailyDeals.$inferSelect[]> {
  try {
    const db = await getDb();
    if (!db) return [];
    const active = await db
      .select()
      .from(amazonDailyDeals)
      .where(and(eq(amazonDailyDeals.active, true), eq(amazonDailyDeals.scrapingStatus, "done")))
      .orderBy(asc(amazonDailyDeals.id));
    if (active.length === 0) return [];
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const result: typeof amazonDailyDeals.$inferSelect[] = [];
    for (let i = 0; i < Math.min(count, active.length); i++) {
      result.push(active[(dayOfYear + i) % active.length]);
    }
    return result;
  } catch {
    return [];
  }
}

// ─── Router ───────────────────────────────────────────────────────────────────
export const amazonDealsRouter = router({

  // ── Pubblico: deal del giorno per il sito ──────────────────────────────────
  getTodayDeal: publicProcedure.query(async () => {
    const deal = await getTodayAmazonDeal();
    return deal ?? null;
  }),

  // ── Pubblico: lista deals per widget sito (max 6) ─────────────────────────
  getActiveDeals: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(12).default(6) }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
      const all = await db
        .select()
        .from(amazonDailyDeals)
        .where(and(eq(amazonDailyDeals.active, true), eq(amazonDailyDeals.scrapingStatus, "done")))
        .orderBy(asc(amazonDailyDeals.id));
      if (all.length === 0) return [];
      const lim = input?.limit ?? 6;
      const result: typeof amazonDailyDeals.$inferSelect[] = [];
      for (let i = 0; i < Math.min(lim, all.length); i++) {
        result.push(all[(dayOfYear + i) % all.length]);
      }
      return result;
    }),

  // ── Admin: lista tutti i deals ─────────────────────────────────────────────
  adminGetAll: adminProcedure
    .input(z.object({ limit: z.number().default(100) }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(amazonDailyDeals)
        .orderBy(desc(amazonDailyDeals.createdAt))
        .limit(input?.limit ?? 100);
    }),

  // ── Admin: crea deal singolo (con scraping automatico) ────────────────────
  adminCreate: adminProcedure
    .input(z.object({
      affiliateUrl: z.string().url(),
      scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      category: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });

      const today = new Date().toISOString().slice(0, 10);

      // Inserisci subito con stato pending
      await db.insert(amazonDailyDeals).values({
        affiliateUrl: input.affiliateUrl,
        title: "Caricamento in corso...",
        description: "Recupero metadati da Amazon...",
        price: "...",
        imageUrl: null,
        rating: null,
        reviewCount: null,
        category: input.category ?? null,
        scheduledDate: input.scheduledDate ?? today,
        active: true,
        clickCount: 0,
        scrapingStatus: "pending",
      });

      // Recupera l'ID appena inserito
      const [inserted] = await db
        .select()
        .from(amazonDailyDeals)
        .where(eq(amazonDailyDeals.affiliateUrl, input.affiliateUrl))
        .orderBy(desc(amazonDailyDeals.createdAt))
        .limit(1);

      if (!inserted) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Inserimento fallito" });

      // Scraping in background
      setImmediate(async () => {
        try {
          const meta = await scrapeAmazonMetadata(input.affiliateUrl);
          await db.update(amazonDailyDeals)
            .set({
              title: meta.title,
              description: meta.description,
              price: meta.price,
              imageUrl: meta.imageUrl || null,
              rating: meta.rating || null,
              reviewCount: meta.reviewCount || null,
              category: meta.category || input.category || null,
              scrapingStatus: "done",
            })
            .where(eq(amazonDailyDeals.id, inserted.id));
          console.log(`[AmazonDeals] Metadati aggiornati per ID ${inserted.id}: ${meta.title}`);
        } catch (err) {
          await db.update(amazonDailyDeals)
            .set({ scrapingStatus: "failed" })
            .where(eq(amazonDailyDeals.id, inserted.id));
          console.error(`[AmazonDeals] Scraping fallito per ID ${inserted.id}:`, err);
        }
      });

      return { success: true, id: inserted.id, message: "Deal inserito. Metadati in recupero automatico..." };
    }),

  // ── Admin: caricamento massivo da lista URL (file TXT/RTF) ────────────────
  adminBulkCreate: adminProcedure
    .input(z.object({
      urls: z.array(z.string().url()).min(1).max(200),
      category: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });

      const today = new Date().toISOString().slice(0, 10);
      let inserted = 0;
      let skipped = 0;

      for (const url of input.urls) {
        try {
          // Controlla duplicati
          const existing = await db
            .select({ id: amazonDailyDeals.id })
            .from(amazonDailyDeals)
            .where(eq(amazonDailyDeals.affiliateUrl, url))
            .limit(1);
          if (existing.length > 0) { skipped++; continue; }

          await db.insert(amazonDailyDeals).values({
            affiliateUrl: url,
            title: "Caricamento in corso...",
            description: "Recupero metadati da Amazon...",
            price: "...",
            imageUrl: null,
            rating: null,
            reviewCount: null,
            category: input.category ?? null,
            scheduledDate: today,
            active: true,
            clickCount: 0,
            scrapingStatus: "pending",
          });
          inserted++;
        } catch {
          skipped++;
        }
      }

      // Avvia scraping in background per tutti i pending
      setImmediate(async () => {
        const pending = await db
          .select()
          .from(amazonDailyDeals)
          .where(eq(amazonDailyDeals.scrapingStatus, "pending"))
          .orderBy(desc(amazonDailyDeals.createdAt))
          .limit(200);

        for (const deal of pending) {
          try {
            const meta = await scrapeAmazonMetadata(deal.affiliateUrl);
            await db.update(amazonDailyDeals)
              .set({
                title: meta.title,
                description: meta.description,
                price: meta.price,
                imageUrl: meta.imageUrl || null,
                rating: meta.rating || null,
                reviewCount: meta.reviewCount || null,
                category: meta.category || deal.category || null,
                scrapingStatus: "done",
              })
              .where(eq(amazonDailyDeals.id, deal.id));
            // Pausa tra le richieste per non fare rate limiting
            await new Promise(r => setTimeout(r, 1500));
          } catch {
            await db.update(amazonDailyDeals)
              .set({ scrapingStatus: "failed" })
              .where(eq(amazonDailyDeals.id, deal.id));
          }
        }
        console.log(`[AmazonDeals] Scraping batch completato per ${pending.length} deals`);
      });

      return {
        success: true,
        inserted,
        skipped,
        message: `${inserted} deal inseriti (${skipped} saltati). Metadati in recupero automatico...`,
      };
    }),

  // ── Admin: aggiorna deal ───────────────────────────────────────────────────
  adminUpdate: adminProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      price: z.string().optional(),
      affiliateUrl: z.string().url().optional(),
      imageUrl: z.string().optional(),
      rating: z.string().optional(),
      reviewCount: z.string().optional(),
      category: z.string().optional(),
      scheduledDate: z.string().optional(),
      active: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
      const { id, ...updates } = input;
      // Rimuovi undefined
      const clean = Object.fromEntries(Object.entries(updates).filter(([, v]) => v !== undefined));
      await db.update(amazonDailyDeals).set(clean).where(eq(amazonDailyDeals.id, id));
      return { success: true };
    }),

  // ── Admin: toggle attivo/inattivo ─────────────────────────────────────────
  adminToggle: adminProcedure
    .input(z.object({ id: z.number(), active: z.boolean() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
      await db.update(amazonDailyDeals)
        .set({ active: input.active })
        .where(eq(amazonDailyDeals.id, input.id));
      return { success: true };
    }),

  // ── Admin: elimina deal ────────────────────────────────────────────────────
  adminDelete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
      await db.delete(amazonDailyDeals).where(eq(amazonDailyDeals.id, input.id));
      return { success: true };
    }),

  // ── Admin: ri-scraping manuale per un deal ────────────────────────────────
  adminRescrape: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
      const [deal] = await db.select().from(amazonDailyDeals).where(eq(amazonDailyDeals.id, input.id)).limit(1);
      if (!deal) throw new TRPCError({ code: "NOT_FOUND", message: "Deal non trovato" });

      await db.update(amazonDailyDeals).set({ scrapingStatus: "pending" }).where(eq(amazonDailyDeals.id, input.id));

      setImmediate(async () => {
        try {
          const meta = await scrapeAmazonMetadata(deal.affiliateUrl);
          await db.update(amazonDailyDeals)
            .set({ ...meta, imageUrl: meta.imageUrl || null, scrapingStatus: "done" })
            .where(eq(amazonDailyDeals.id, input.id));
        } catch {
          await db.update(amazonDailyDeals).set({ scrapingStatus: "failed" }).where(eq(amazonDailyDeals.id, input.id));
        }
      });

      return { success: true, message: "Scraping avviato in background" };
    }),

  // ── Pubblico: traccia click su un deal ────────────────────────────────────
  trackClick: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.update(amazonDailyDeals)
        .set({ clickCount: sql`${amazonDailyDeals.clickCount} + 1` })
        .where(eq(amazonDailyDeals.id, input.id));
      return { success: true };
    }),
});
