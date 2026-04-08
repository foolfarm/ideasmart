import dotenv from "dotenv";
dotenv.config();

// Import the function directly
const { sendUnifiedTestToEmail } = await import("./server/unifiedNewsletter.ts");

console.log("📧 Invio newsletter di test a ac@acinelli.com...");
try {
  const result = await sendUnifiedTestToEmail("ac@acinelli.com");
  if (result.success) {
    console.log("✅ Newsletter di test inviata con successo!");
    console.log(`   Stats: AI=${result.stats?.ai || 0}, Startup=${result.stats?.startup || 0}, Dealroom=${result.stats?.dealroom || 0}, Breaking=${result.stats?.breaking || 0}, Research=${result.stats?.research || 0}`);
  } else {
    console.error("❌ Errore:", result.error);
  }
} catch (err) {
  console.error("❌ Errore fatale:", err);
}
process.exit(0);
