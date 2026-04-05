import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import mysql from "mysql2/promise";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const conn = await mysql.createConnection(process.env.DATABASE_URL);

const [cols] = await conn.execute("DESCRIBE amazon_daily_deals");
console.log("Struttura tabella amazon_daily_deals:");
cols.forEach(c => console.log(`  ${c.Field} — ${c.Type} — ${c.Null} — default: ${c.Default}`));

const [rows] = await conn.execute("SELECT * FROM amazon_daily_deals ORDER BY id DESC LIMIT 5");
console.log("\nUltimi 5 record:");
rows.forEach(r => console.log(JSON.stringify(r)));

await conn.end();
