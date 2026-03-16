/**
 * send-channel-preview.mts
 * Script per inviare la preview della newsletter del canale di oggi
 * Uso: npx tsx scripts/send-channel-preview.mts [channelKey]
 * Esempio: npx tsx scripts/send-channel-preview.mts ai
 */

import "dotenv/config";
import { sendDailyChannelPreview, sendChannelNewsletterManual, getTodayChannel, CHANNEL_SCHEDULE } from "../server/dailyChannelNewsletter.js";

const arg = process.argv[2] as string | undefined;

async function main() {
  if (arg && arg !== "preview") {
    // Invio manuale per un canale specifico
    const validKeys = CHANNEL_SCHEDULE.map(c => c.key);
    if (!validKeys.includes(arg as any)) {
      console.error(`[Error] Canale non valido: ${arg}`);
      console.error(`Canali disponibili: ${validKeys.join(", ")}`);
      process.exit(1);
    }
    console.log(`[Test] Invio newsletter canale: ${arg.toUpperCase()}`);
    const result = await sendChannelNewsletterManual(arg as any, true); // testOnly=true → invia solo a info@ideasmart.ai
    console.log("[Test] Risultato:", JSON.stringify(result, null, 2));
  } else {
    // Preview del canale di oggi
    const todayChannel = getTodayChannel();
    if (!todayChannel) {
      console.log("[Test] Nessun canale programmato per oggi.");
      process.exit(0);
    }
    console.log(`[Test] Invio preview newsletter: ${todayChannel.name} (${todayChannel.key})`);
    const result = await sendDailyChannelPreview();
    console.log("[Test] Risultato:", JSON.stringify(result, null, 2));
  }
  process.exit(0);
}

main().catch(err => {
  console.error("[Test] Errore:", err);
  process.exit(1);
});
