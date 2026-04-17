import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);
try {
  const [rows] = await connection.execute("DESCRIBE journalist_articles");
  console.log("Colonne esistenti:");
  rows.forEach(r => console.log(" -", r.Field, r.Type));

  const existing = rows.map(r => r.Field.toLowerCase());

  if (!existing.includes("reviewnotes")) {
    await connection.execute("ALTER TABLE journalist_articles ADD COLUMN reviewNotes TEXT NULL");
    console.log("✅ Colonna reviewNotes aggiunta");
  } else {
    console.log("ℹ️  reviewNotes già presente");
  }

  if (!existing.includes("reviewedat")) {
    await connection.execute("ALTER TABLE journalist_articles ADD COLUMN reviewedAt TIMESTAMP NULL");
    console.log("✅ Colonna reviewedAt aggiunta");
  } else {
    console.log("ℹ️  reviewedAt già presente");
  }

  console.log("\n✅ Schema aggiornato con successo");
} finally {
  await connection.end();
}
