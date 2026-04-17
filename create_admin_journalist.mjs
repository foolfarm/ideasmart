/**
 * Script per creare il primo account giornalista ProofPress
 * Username: admin | Password: admin.123
 */
import mysql from "mysql2/promise";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL non trovata nel .env");
  process.exit(1);
}

function hashPassword(password) {
  return crypto.createHash("sha256").update(password + "pp_journalist_salt_2026").digest("hex");
}

function generateJournalistKey() {
  return crypto.randomBytes(32).toString("hex");
}

async function main() {
  const connection = await mysql.createConnection(DATABASE_URL);

  try {
    // Controlla se esiste già
    const [existing] = await connection.execute(
      "SELECT id, username FROM journalists WHERE username = ?",
      ["admin"]
    );

    if (existing.length > 0) {
      console.log(`⚠️  Account "admin" già esistente (id: ${existing[0].id}). Nessuna azione eseguita.`);
      process.exit(0);
    }

    const journalistKey = generateJournalistKey();
    const passwordHash = hashPassword("admin.123");

    const [result] = await connection.execute(
      `INSERT INTO journalists 
        (username, email, passwordHash, displayName, bio, journalistKey, isActive, totalArticles)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "admin",
        "admin@proofpress.ai",
        passwordHash,
        "Admin ProofPress",
        "Account amministratore del Portale Giornalisti ProofPress.",
        journalistKey,
        1,
        0,
      ]
    );

    const insertId = result.insertId;
    console.log(`✅ Account giornalista creato con successo!`);
    console.log(`   ID: ${insertId}`);
    console.log(`   Username: admin`);
    console.log(`   Password: admin.123`);
    console.log(`   Journalist Key: ${journalistKey.substring(0, 8)}...`);
    console.log(`   Email: admin@proofpress.ai`);
    console.log(`\n🔑 Accedi su: /journalist-portal`);
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error("❌ Errore:", err.message);
  process.exit(1);
});
