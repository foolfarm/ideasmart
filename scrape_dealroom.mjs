import "dotenv/config";
import { refreshDealroomNewsFromRSS } from "./server/rssNewsScheduler.ts";

console.log("Avvio scraping DEALROOM con prompt corretto...");
await refreshDealroomNewsFromRSS();
console.log("Scraping DEALROOM completato!");
process.exit(0);
