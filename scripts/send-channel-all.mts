/**
 * send-channel-all.mts
 * Invia la newsletter del canale specificato a tutti gli iscritti attivi.
 * Uso: npx tsx scripts/send-channel-all.mts [channelKey]
 * Esempio: npx tsx scripts/send-channel-all.mts ai
 */

import "dotenv/config";
import { sendChannelNewsletterManual, getTodayChannel, CHANNEL_SCHEDULE } from "../server/dailyChannelNewsletter.js";

const arg = process.argv[2] as string | undefined;

async function main() {
  let channelKey: string;

  if (arg) {
    const validKeys = CHANNEL_SCHEDULE.map(c => c.key);
    if (!validKeys.includes(arg as any)) {
      console.error(`[Error] Canale non valido: ${arg}`);
      console.error(`Canali disponibili: ${validKeys.join(", ")}`);
      process.exit(1);
    }
    channelKey = arg;
  } else {
    const todayChannel = getTodayChannel();
    if (!todayChannel) {
      console.log("[Error] Nessun canale programmato per oggi.");
      process.exit(1);
    }
    channelKey = todayChannel.key;
  }

  console.log(`[Invio] 📧 Invio newsletter canale: ${channelKey.toUpperCase()} → TUTTI GLI ISCRITTI ATTIVI`);
  const result = await sendChannelNewsletterManual(channelKey as any, false); // testOnly=false → tutti gli iscritti
  console.log("[Invio] Risultato:", JSON.stringify(result, null, 2));
  process.exit(0);
}

main().catch(err => {
  console.error("[Invio] Errore:", err);
  process.exit(1);
});
