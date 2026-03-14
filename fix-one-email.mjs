import { createConnection } from "mysql2/promise";
import * as dotenv from "dotenv";
import { randomBytes } from "crypto";
dotenv.config();

const db = await createConnection(process.env.DATABASE_URL);
const email = "lorenzo.franchini@cdpventurecapital.it";
const token = randomBytes(32).toString("hex");
const [ex] = await db.execute("SELECT id, status FROM subscribers WHERE email = ?", [email]);
if (ex.length > 0) {
  if (ex[0].status === "unsubscribed") {
    await db.execute("UPDATE subscribers SET status = 'active', unsubscribedAt = NULL WHERE email = ?", [email]);
    console.log("Riattivato:", email);
  } else {
    console.log("Già attivo:", email);
  }
} else {
  await db.execute(
    "INSERT INTO subscribers (email, name, status, subscribedAt, unsubscribeToken) VALUES (?, ?, 'active', NOW(), ?)",
    [email, null, token]
  );
  console.log("Aggiunto:", email);
}

const [count] = await db.execute("SELECT COUNT(*) as active FROM subscribers WHERE status = 'active'");
console.log("Iscritti attivi totali:", count[0].active);
await db.end();
