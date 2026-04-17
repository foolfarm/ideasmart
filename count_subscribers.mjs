import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Conta iscritti
const [totalRows] = await conn.execute('SELECT COUNT(*) as cnt FROM subscribers');
const [activeRows] = await conn.execute("SELECT COUNT(*) as cnt FROM subscribers WHERE status = 'active'");
const [unsubRows] = await conn.execute("SELECT COUNT(*) as cnt FROM subscribers WHERE unsubscribedAt IS NOT NULL");
console.log('=== ISCRITTI ===');
console.log('Totale iscritti nel DB:', totalRows[0].cnt);
console.log('Iscritti attivi (status=active):', activeRows[0].cnt);
console.log('Disiscritti:', unsubRows[0].cnt);

// Invii newsletter di oggi
console.log('\n=== INVII NEWSLETTER OGGI ===');
const [sends] = await conn.execute(
  "SELECT id, subject, recipientCount, status, sentAt, section FROM newsletter_sends WHERE DATE(sentAt) = CURDATE() ORDER BY sentAt DESC LIMIT 20"
);
console.log('Invii oggi:', sends.length);
for (const s of sends) {
  console.log(`  [${s.sentAt}] sezione=${s.section} destinatari=${s.recipientCount} status=${s.status}`);
  console.log(`    subject: ${s.subject?.substring(0, 80)}`);
}

// Invii degli ultimi 7 giorni
console.log('\n=== INVII ULTIMI 7 GIORNI ===');
const [recentSends] = await conn.execute(
  "SELECT DATE(sentAt) as giorno, COUNT(*) as n_invii, SUM(recipientCount) as tot_destinatari, GROUP_CONCAT(section ORDER BY sentAt) as sezioni FROM newsletter_sends WHERE sentAt >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) GROUP BY DATE(sentAt) ORDER BY giorno DESC"
);
for (const r of recentSends) {
  console.log(`  ${r.giorno}: ${r.n_invii} invii, ${r.tot_destinatari} destinatari totali, sezioni: ${r.sezioni}`);
}

await conn.end();
