import "dotenv/config";
import { sendUnifiedTestToEmail } from "../server/unifiedNewsletter";

console.log("Invio newsletter test unificata a ac@acinelli.com...");
const result = await sendUnifiedTestToEmail("ac@acinelli.com");
console.log("Risultato:", JSON.stringify(result, null, 2));
process.exit(0);
