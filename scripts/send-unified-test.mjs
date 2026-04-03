/**
 * Invia la newsletter unificata di test a ac@acinelli.com
 * Uso: cd /home/ubuntu/ideasmart && node --loader tsx scripts/send-unified-test.mjs
 */
import { sendUnifiedTestToEmail } from "../server/unifiedNewsletter.ts";

const TO = process.argv[2] || "ac@acinelli.com";

console.log(`\n📧 Invio newsletter unificata di test a ${TO}...\n`);

try {
  const result = await sendUnifiedTestToEmail(TO);
  if (result.success) {
    console.log(`\n✅ Newsletter inviata con successo!`);
    console.log(`   Subject: ${result.subject}`);
    console.log(`   Stats: AI=${result.stats.ai}, Startup=${result.stats.startup}, Dealroom=${result.stats.dealroom}, Breaking=${result.stats.breaking}, Research=${result.stats.research}`);
  } else {
    console.error(`\n❌ Errore: ${result.error}`);
  }
} catch (err) {
  console.error(`\n❌ Errore critico:`, err);
}

process.exit(0);
