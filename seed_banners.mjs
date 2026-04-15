import 'dotenv/config';
import { createConnection } from 'mysql2/promise';

const conn = await createConnection(process.env.DATABASE_URL);

const banners = [
  { name: "Prompt Collection 2026 — Generale", imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ideasmart-banner-collection-2026-square_a775263d.png", imageKey: "pc2026-generale.png", clickUrl: "https://promptcollection2026.com", slot: "both", weight: 8 },
  { name: "Prompt Collection 2026 — Commercialisti", imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ideasmart-banner-verticale-commercialisti-square_bc6e5af2.png", imageKey: "pc2026-commercialisti.png", clickUrl: "https://promptcollection2026.com", slot: "both", weight: 7 },
  { name: "Prompt Collection 2026 — Avvocati", imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ideasmart-banner-verticale-avvocati-square_136c47a1.png", imageKey: "pc2026-avvocati.png", clickUrl: "https://promptcollection2026.com", slot: "both", weight: 7 },
  { name: "Prompt Collection 2026 — Studenti", imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ideasmart-banner-verticale-studenti-square_6d00b84f.png", imageKey: "pc2026-studenti.png", clickUrl: "https://promptcollection2026.com", slot: "both", weight: 7 },
  { name: "ProofPress Business — Crea il tuo giornale AI", imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/proofpress-business-banner_eecb762f.png", imageKey: "proofpress-business.png", clickUrl: "https://proofpress.ai/offerta/creator", slot: "sidebar", weight: 9 },
  { name: "Prompt Collection 2026 — Sidebar", imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ideasmart-banner-collection-2026-square_a775263d.png", imageKey: "pc2026-sidebar.png", clickUrl: "https://promptcollection2026.com", slot: "sidebar", weight: 6 },
];

let inserted = 0;
for (const b of banners) {
  const [rows] = await conn.execute('SELECT id FROM banners WHERE name = ? LIMIT 1', [b.name]);
  if (rows.length > 0) { console.log(`  SKIP: ${b.name}`); continue; }
  await conn.execute(
    'INSERT INTO banners (name, imageUrl, imageKey, clickUrl, slot, weight, active, sortOrder, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, 1, 0, NOW(), NOW())',
    [b.name, b.imageUrl, b.imageKey, b.clickUrl, b.slot, b.weight]
  );
  console.log(`  ✓ ${b.name} [${b.slot}]`);
  inserted++;
}
const [[{ total }]] = await conn.execute('SELECT COUNT(*) as total FROM banners');
console.log(`\nTotale banner nel DB: ${total} (${inserted} nuovi)`);
await conn.end();
