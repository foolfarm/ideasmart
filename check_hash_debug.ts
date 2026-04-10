import "dotenv/config";
import { getDb } from "./server/db";
import { newsItems } from "./drizzle/schema";
import { desc, isNotNull } from "drizzle-orm";
import { createHash } from "crypto";

async function main() {
  const db = await getDb();
  if (!db) { process.exit(1); }
  
  const items = await db.select().from(newsItems).where(isNotNull(newsItems.verifyHash)).orderBy(desc(newsItems.id)).limit(1);
  const item = items[0];
  
  console.log("createdAt type:", typeof item.createdAt);
  console.log("createdAt value:", item.createdAt);
  console.log("verifyHash stored:", item.verifyHash);
  
  const combos = [
    ["ISO", [item.title?.trim(), item.summary?.trim(), item.sourceUrl?.trim() ?? "", new Date(item.createdAt).toISOString()]],
    ["toString", [item.title?.trim(), item.summary?.trim(), item.sourceUrl?.trim() ?? "", item.createdAt?.toString()]],
    ["empty date", [item.title?.trim(), item.summary?.trim(), item.sourceUrl?.trim() ?? "", ""]],
    ["no date", [item.title?.trim(), item.summary?.trim(), item.sourceUrl?.trim() ?? ""]],
  ] as [string, string[]][];
  
  for (const [label, combo] of combos) {
    const payload = combo.join("|");
    const hash = createHash("sha256").update(payload, "utf8").digest("hex");
    const match = hash === item.verifyHash;
    console.log(`[${label}] ${match ? "✅ MATCH" : "❌"} hash=${hash.slice(0,16)}`);
  }
  
  process.exit(0);
}
main().catch(console.error);
