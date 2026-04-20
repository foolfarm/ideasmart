/**
 * Force Daily Preview — bypassa il guard DB e invia la preview della newsletter daily
 * Usato quando il record del giorno esiste già ma si vuole reinviare la preview
 * con le nuove impostazioni (mittente, orario, ecc.)
 */
import 'dotenv/config';
import mysql from 'mysql2/promise';

const DB_URL = process.env.DATABASE_URL;

async function main() {
  console.log('[ForceDailyPreview] Connessione al DB...');
  const conn = await mysql.createConnection(DB_URL);

  // Ottieni la data di oggi in CET
  const nowCET = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Rome' }));
  const todayStart = new Date(nowCET);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(nowCET);
  todayEnd.setHours(23, 59, 59, 999);
  console.log(`[ForceDailyPreview] Ricerca record tra ${todayStart.toISOString()} e ${todayEnd.toISOString()}`);

  // Verifica record esistente (usa scheduledAt o createdAt per trovare record di oggi)
  const [rows] = await conn.execute(
    `SELECT id, status, subject, approvedAt, sentAt FROM newsletter_sends WHERE createdAt >= ? AND createdAt <= ? ORDER BY id DESC LIMIT 3`,
    [todayStart, todayEnd]
  );
  console.log('[ForceDailyPreview] Record esistenti oggi:', rows);

  // Elimina TUTTI i record di oggi per permettere la creazione di un nuovo record
  if (rows.length > 0) {
    for (const row of rows) {
      console.log(`[ForceDailyPreview] Eliminazione record ID ${row.id} (status: ${row.status})...`);
      await conn.execute(`DELETE FROM newsletter_sends WHERE id = ?`, [row.id]);
    }
    console.log(`[ForceDailyPreview] ✅ Tutti i record di oggi eliminati. Ora invio la preview...`);
  } else {
    console.log('[ForceDailyPreview] Nessun record trovato oggi. Invio preview...');
  }

  await conn.end();

  // Ora invoca sendUnifiedPreview
  const { sendUnifiedPreview } = await import('../server/unifiedNewsletter');
  const result = await sendUnifiedPreview();
  console.log('[ForceDailyPreview] Risultato:', JSON.stringify(result, null, 2));

  if (result.success) {
    console.log(`[ForceDailyPreview] ✅ Preview inviata: "${result.subject}"`);
  } else {
    console.error(`[ForceDailyPreview] ❌ Errore: ${result.error}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('[ForceDailyPreview] ❌ Errore critico:', err);
  process.exit(1);
});
