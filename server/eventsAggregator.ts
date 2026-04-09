/**
 * Proof Press Events Aggregator
 * Aggrega eventi Tech/AI/Startup italiani da:
 *   1. Luma ICS — "What's Happening in Milan" (Tech/Startup filter)
 *   2. RSS feeds italiani (EconomyUp, AgendaDigitale, InnovationPost, BeBeez)
 * Eseguito ogni 12 ore dallo scheduler.
 */

import { getDb } from "./db";
import { techEvents, InsertTechEvent } from "../drizzle/schema";
import { lt } from "drizzle-orm";

// ── Fonti ─────────────────────────────────────────────────────────────────────

const LUMA_ICS_URL = "https://api2.luma.com/ics/get?entity=discover&id=discplace-9AyCYUvGH7xiqhh";

// Keyword per filtrare eventi tech/AI/startup da Luma (che include anche eventi non-tech)
const TECH_KEYWORDS = [
  "ai", "artificial intelligence", "startup", "tech", "innovation", "venture",
  "vc", "investor", "founder", "saas", "software", "digital", "fintech",
  "deeptech", "blockchain", "data", "machine learning", "ml", "llm",
  "hackathon", "pitch", "accelerator", "incubator", "coworking", "networking",
  "n8n", "product", "developer", "coding", "build", "demo day", "fireside",
  "workshop", "summit", "conference", "meetup", "community", "scale",
  "growth", "b2b", "enterprise", "scaleup", "unicorn", "exit", "m&a",
  "investment", "fundraising", "angel", "seed", "series", "ipo",
  "intelligenza artificiale", "intelligenza", "innovazione", "digitale",
  "imprenditore", "imprenditoria", "startup", "tecnologia", "ricerca",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

async function fetchUrl(url: string, timeout = 10000): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Proof Press/1.0)" },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function isTechEvent(title: string, description: string): boolean {
  const text = (title + " " + description).toLowerCase();
  return TECH_KEYWORDS.some((kw) => text.includes(kw));
}

function parseICSDate(dtStr: string): Date | null {
  try {
    // Format: YYYYMMDDTHHMMSSZ or YYYYMMDDTHHMMSS or YYYYMMDD
    const s = dtStr.replace("Z", "").replace("T", "");
    if (s.length >= 8) {
      const year = parseInt(s.slice(0, 4));
      const month = parseInt(s.slice(4, 6)) - 1;
      const day = parseInt(s.slice(6, 8));
      const hour = s.length >= 10 ? parseInt(s.slice(8, 10)) : 0;
      const min = s.length >= 12 ? parseInt(s.slice(10, 12)) : 0;
      const sec = s.length >= 14 ? parseInt(s.slice(12, 14)) : 0;
      const d = new Date(Date.UTC(year, month, day, hour, min, sec));
      if (!isNaN(d.getTime())) return d;
    }
  } catch {}
  return null;
}

// ── Luma ICS Parser ───────────────────────────────────────────────────────────

interface ICSEvent {
  uid: string;
  summary: string;
  description: string;
  location: string;
  dtstart: string;
  dtend: string;
  organizer: string;
}

function parseICS(content: string): ICSEvent[] {
  const events: ICSEvent[] = [];
  let current: Partial<ICSEvent> = {};
  let inEvent = false;

  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (line === "BEGIN:VEVENT") {
      inEvent = true;
      current = {};
    } else if (line === "END:VEVENT") {
      if (inEvent && current.uid && current.summary && current.dtstart) {
        events.push(current as ICSEvent);
      }
      inEvent = false;
    } else if (inEvent && line.includes(":")) {
      const colonIdx = line.indexOf(":");
      const rawKey = line.slice(0, colonIdx);
      const val = line.slice(colonIdx + 1)
        .replace(/\\n/g, " ")
        .replace(/\\,/g, ",")
        .replace(/\\;/g, ";")
        .trim();
      const key = rawKey.split(";")[0].toUpperCase();
      switch (key) {
        case "UID": current.uid = val; break;
        case "SUMMARY": current.summary = val; break;
        case "DESCRIPTION": current.description = (current.description || "") + val; break;
        case "LOCATION": current.location = val; break;
        case "DTSTART": current.dtstart = val; break;
        case "DTEND": current.dtend = val; break;
        case "ORGANIZER":
          // ORGANIZER;CN="Name":MAILTO:... → extract CN
          const cnMatch = rawKey.match(/CN="([^"]+)"/);
          current.organizer = cnMatch ? cnMatch[1] : val;
          break;
      }
    }
  }
  return events;
}

async function aggregateLumaEvents(): Promise<InsertTechEvent[]> {
  const content = await fetchUrl(LUMA_ICS_URL);
  if (!content) {
    console.log("[Events] Luma ICS: fetch failed");
    return [];
  }

  const icsEvents = parseICS(content);
  const now = new Date();
  const results: InsertTechEvent[] = [];

  for (const ev of icsEvents) {
    const startAt = parseICSDate(ev.dtstart);
    if (!startAt || startAt <= now) continue; // solo eventi futuri

    const title = ev.summary || "";
    const description = ev.description || "";

    // Filtra solo eventi tech/startup/AI
    if (!isTechEvent(title, description)) continue;

    const endAt = ev.dtend ? parseICSDate(ev.dtend) : null;

    // Estrai URL Luma dalla descrizione
    const urlMatch = description.match(/https:\/\/luma\.com\/\S+/);
    const eventUrl = urlMatch ? urlMatch[0].split("\\")[0] : null;

    // Determina categoria
    const text = (title + " " + description).toLowerCase();
    let category: InsertTechEvent["category"] = "tech";
    if (text.includes("ai") || text.includes("artificial intelligence") || text.includes("intelligenza artificiale") || text.includes("machine learning") || text.includes("llm")) {
      category = "ai";
    } else if (text.includes("startup") || text.includes("founder") || text.includes("pitch") || text.includes("accelerator") || text.includes("demo day")) {
      category = "startup";
    } else if (text.includes("venture") || text.includes("investor") || text.includes("vc") || text.includes("investment") || text.includes("fundraising") || text.includes("angel")) {
      category = "vc";
    } else if (text.includes("innovation") || text.includes("innovazione")) {
      category = "innovation";
    }

    // Determina se online
    const isOnline = !ev.location || ev.location.toLowerCase().includes("online") || ev.location.toLowerCase().includes("zoom") || ev.location.toLowerCase().includes("meet") || ev.location.startsWith("https://");

    results.push({
      externalUid: `luma:${ev.uid}`,
      source: "luma",
      title: title.slice(0, 500),
      description: description.slice(0, 2000),
      location: ev.location ? ev.location.slice(0, 500) : null,
      eventUrl: eventUrl,
      startAt,
      endAt: endAt || null,
      category,
      organizer: ev.organizer ? ev.organizer.slice(0, 255) : null,
      isOnline,
      isFree: true, // Luma events are typically free
    });
  }

  console.log(`[Events] Luma ICS: ${results.length} tech events found (of ${icsEvents.length} total)`);
  return results;
}

// ── RSS Parser ────────────────────────────────────────────────────────────────

interface RSSItem {
  guid: string;
  title: string;
  link: string;
  description: string;
  pubDate: string;
}

function parseRSS(content: string, sourceName: string): RSSItem[] {
  const items: RSSItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(content)) !== null) {
    const block = match[1];
    const getTag = (tag: string) => {
      const m = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([^<]*)<\\/${tag}>`));
      return m ? (m[1] || m[2] || "").trim() : "";
    };
    const guid = getTag("guid") || getTag("link");
    const title = getTag("title");
    const link = getTag("link");
    const description = getTag("description").replace(/<[^>]+>/g, "").slice(0, 500);
    const pubDate = getTag("pubDate");
    if (title && link) {
      items.push({ guid: guid || link, title, link, description, pubDate });
    }
  }
  return items;
}

// RSS feeds che pubblicano eventi tech/AI/startup italiani
const RSS_SOURCES = [
  { name: "EconomyUp", url: "https://www.economyup.it/feed", source: "rss_economyup" },
  { name: "AgendaDigitale", url: "https://www.agendadigitale.eu/feed", source: "rss_agendadigitale" },
  { name: "InnovationPost", url: "https://www.innovationpost.it/feed", source: "rss_innovationpost" },
  { name: "BeBeez", url: "https://bebeez.it/feed", source: "rss_bebeez" },
];

// Keyword per identificare articoli che parlano di EVENTI nei feed RSS
const EVENT_KEYWORDS = [
  "evento", "eventi", "conference", "conferenza", "summit", "webinar",
  "workshop", "meetup", "hackathon", "pitch", "demo day", "forum",
  "convegno", "tavola rotonda", "round table", "investor day",
  "startup day", "innovation day", "tech day", "ai day",
  "we make future", "smau", "italian tech week", "ai week",
];

async function aggregateRSSEvents(): Promise<InsertTechEvent[]> {
  const results: InsertTechEvent[] = [];
  const now = new Date();

  for (const feed of RSS_SOURCES) {
    const content = await fetchUrl(feed.url);
    if (!content) {
      console.log(`[Events] RSS ${feed.name}: fetch failed`);
      continue;
    }

    const items = parseRSS(content, feed.name);
    let count = 0;

    for (const item of items) {
      const text = (item.title + " " + item.description).toLowerCase();

      // Filtra solo articoli che parlano di eventi tech/startup
      const isEvent = EVENT_KEYWORDS.some((kw) => text.includes(kw));
      const isTech = isTechEvent(item.title, item.description);
      if (!isEvent || !isTech) continue;

      // Per gli articoli RSS, usiamo la data di pubblicazione come startAt
      // (non è una data evento precisa, ma indica quando l'evento è stato annunciato)
      let startAt: Date;
      try {
        startAt = item.pubDate ? new Date(item.pubDate) : now;
        if (isNaN(startAt.getTime())) startAt = now;
      } catch {
        startAt = now;
      }

      // Determina categoria
      let category: InsertTechEvent["category"] = "tech";
      if (text.includes("ai") || text.includes("artificial intelligence") || text.includes("intelligenza artificiale")) {
        category = "ai";
      } else if (text.includes("startup") || text.includes("founder")) {
        category = "startup";
      } else if (text.includes("venture") || text.includes("investor") || text.includes("vc")) {
        category = "vc";
      } else if (text.includes("innovation") || text.includes("innovazione")) {
        category = "innovation";
      }

      results.push({
        externalUid: `rss:${feed.source}:${item.guid}`,
        source: feed.source,
        title: item.title.slice(0, 500),
        description: item.description.slice(0, 2000),
        location: "Italia",
        eventUrl: item.link,
        startAt,
        endAt: null,
        category,
        organizer: feed.name,
        isOnline: text.includes("online") || text.includes("webinar") || text.includes("virtual"),
        isFree: !text.includes("€") && !text.includes("biglietto") && !text.includes("ticket"),
      });
      count++;
    }

    console.log(`[Events] RSS ${feed.name}: ${count} event articles found (of ${items.length} total)`);
  }

  return results;
}

// ── Main Aggregator ───────────────────────────────────────────────────────────

export async function aggregateEvents(): Promise<{ inserted: number; skipped: number; errors: number }> {
  console.log("[Events] Starting event aggregation...");
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  // Raccogli eventi da tutte le fonti
  const [lumaEvents, rssEvents] = await Promise.all([
    aggregateLumaEvents(),
    aggregateRSSEvents(),
  ]);

  const allEvents = [...lumaEvents, ...rssEvents];
  console.log(`[Events] Total candidates: ${allEvents.length}`);

  const db = await getDb();
  if (!db) {
    console.error("[Events] DB not available");
    return { inserted: 0, skipped: 0, errors: 1 };
  }

  // Upsert nel DB (insert or skip se già esiste per externalUid)
  for (const event of allEvents) {
    try {
      await db.insert(techEvents).values(event).onDuplicateKeyUpdate({
        set: {
          title: event.title,
          description: event.description,
          location: event.location,
          startAt: event.startAt,
          endAt: event.endAt,
          category: event.category,
          organizer: event.organizer,
          isOnline: event.isOnline,
          isFree: event.isFree,
          updatedAt: new Date(),
        },
      });
      inserted++;
    } catch (err) {
      console.error(`[Events] Error inserting event "${event.title}":`, err);
      errors++;
    }
  }

  // Rimuovi eventi passati (più di 7 giorni fa)
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  try {
    await db.delete(techEvents).where(lt(techEvents.startAt, cutoff));
  } catch (err) {
    console.error("[Events] Error cleaning old events:", err);
  }

  console.log(`[Events] Aggregation complete: ${inserted} upserted, ${skipped} skipped, ${errors} errors`);
  return { inserted, skipped, errors };
}
