import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

const outputDir = "/home/ubuntu/exports";
const generatedAt = new Date();
const dateStamp = generatedAt.toISOString().slice(0, 10);
const outputCsv = path.join(outputDir, `proofpress_iscritti_newsletter_dettaglio_${dateStamp}.csv`);
const outputSummary = path.join(outputDir, `proofpress_iscritti_newsletter_dettaglio_${dateStamp}.json`);

function escapeCsv(value) {
  const normalized = String(value ?? "").trim();
  return /[",\n\r]/.test(normalized)
    ? `"${normalized.replaceAll('"', '""')}"`
    : normalized;
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL non configurato");
}

await fs.mkdir(outputDir, { recursive: true });
const connection = await mysql.createConnection(process.env.DATABASE_URL);

try {
  const [rows] = await connection.execute(`
    SELECT name, email
    FROM subscribers
    WHERE status = 'active'
      AND email IS NOT NULL
      AND TRIM(email) <> ''
    ORDER BY LOWER(email) ASC
  `);

  const seen = new Set();
  const subscribers = [];
  const invalid = [];
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  for (const row of rows) {
    const email = String(row.email).trim().toLowerCase();
    if (!email || seen.has(email)) continue;
    seen.add(email);
    const nameParts = String(row.name ?? "").trim().replace(/\s+/g, " ").split(" ").filter(Boolean);
    const firstName = nameParts.length > 0 ? nameParts[0] : "";
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
    subscribers.push({ firstName, lastName, phone: "", email });
    if (!emailPattern.test(email)) invalid.push(email);
  }

  const csvRows = [
    ["Nome", "Cognome", "Telefono", "Email"].map(escapeCsv).join(","),
    ...subscribers.map(({ firstName, lastName, phone, email }) => [firstName, lastName, phone, email].map(escapeCsv).join(",")),
  ];
  await fs.writeFile(outputCsv, "\uFEFF" + csvRows.join("\n") + "\n", "utf8");
  await fs.writeFile(
    outputSummary,
    JSON.stringify(
      {
        generatedAt: generatedAt.toISOString(),
        queriedActiveSubscribers: rows.length,
        exportedRecords: subscribers.length,
        recordsWithName: subscribers.filter((subscriber) => subscriber.firstName.length > 0).length,
        recordsWithPhone: 0,
        invalidEmailCount: invalid.length,
        invalidEmails: invalid,
        phoneFieldNote: "Il database degli iscritti non conserva numeri di telefono: la colonna Telefono viene inclusa ma resta vuota.",
        csvPath: outputCsv,
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(JSON.stringify({ outputCsv, outputSummary, exportedRecords: subscribers.length, invalidEmailCount: invalid.length }));
} finally {
  await connection.end();
}
