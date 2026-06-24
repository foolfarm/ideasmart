import { config } from 'dotenv';
config();

import mysql from 'mysql2/promise';

const DB_URL = process.env.DATABASE_URL;
const SG_KEY = process.env.SENDGRID_API_KEY;
const LI_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║         PROOFPRESS.AI — SANITY CHECK COMPLETO               ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log(`Data/ora: ${new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' })} (CET)\n`);

// ─── 1. VARIABILI D'AMBIENTE ──────────────────────────────────────────────────
console.log('━━━ 1. VARIABILI D\'AMBIENTE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
const envVars = [
  ['DATABASE_URL', DB_URL],
  ['SENDGRID_API_KEY', SG_KEY],
  ['LINKEDIN_ACCESS_TOKEN', LI_TOKEN],
  ['LINKEDIN_REFRESH_TOKEN', process.env.LINKEDIN_REFRESH_TOKEN],
  ['LINKEDIN_AUTHOR_URN', process.env.LINKEDIN_AUTHOR_URN],
  ['ANTHROPIC_API_KEY', ANTHROPIC_KEY],
  ['PEXELS_API_KEY', process.env.PEXELS_API_KEY],
  ['SENDGRID_FROM_EMAIL', process.env.SENDGRID_FROM_EMAIL],
  ['JWT_SECRET', process.env.JWT_SECRET],
];
for (const [name, val] of envVars) {
  const status = val ? `✅ presente (${val.length} chars)` : '❌ MANCANTE';
  console.log(`  ${name}: ${status}`);
}

// ─── 2. DATABASE ──────────────────────────────────────────────────────────────
console.log('\n━━━ 2. DATABASE (TiDB/MySQL) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
let conn;
try {
  conn = await mysql.createConnection(DB_URL + '&connectTimeout=10000');
  await conn.ping();
  console.log('  ✅ Connessione DB: OK');

  // Iscritti
  const [[subRow]] = await conn.execute('SELECT COUNT(*) as tot, SUM(active=1) as att FROM subscribers');
  console.log(`  ✅ Iscritti: ${subRow.tot} totali, ${subRow.att} attivi`);

  // Ultimi invii newsletter
  const [sends] = await conn.execute(
    `SELECT campaign_id, sent_at, total_sent, total_failed, status 
     FROM newsletter_sends ORDER BY sent_at DESC LIMIT 10`
  ).catch(() => [[]]);
  
  if (sends.length > 0) {
    console.log(`\n  Ultimi 10 invii newsletter:`);
    for (const s of sends) {
      const dt = s.sent_at ? new Date(s.sent_at).toLocaleString('it-IT', { timeZone: 'Europe/Rome' }) : '?';
      console.log(`    ${dt} | ${s.campaign_id} | sent:${s.total_sent} fail:${s.total_failed} | ${s.status}`);
    }
  } else {
    console.log('  ⚠️  Tabella newsletter_sends vuota');
  }

  // Ultimi post LinkedIn
  const [posts] = await conn.execute(
    `SELECT date_label, slot, title, linkedin_url, created_at 
     FROM linkedin_posts ORDER BY created_at DESC LIMIT 8`
  ).catch(() => [[]]);
  
  if (posts.length > 0) {
    console.log(`\n  Ultimi post LinkedIn:`);
    for (const p of posts) {
      const dt = p.created_at ? new Date(p.created_at).toLocaleString('it-IT', { timeZone: 'Europe/Rome' }) : '?';
      console.log(`    ${dt} | slot:${p.slot} | "${p.title?.substring(0, 55)}"`);
    }
  } else {
    console.log('  ⚠️  Tabella linkedin_posts vuota');
  }

  // Email opens recenti
  const [[openRow]] = await conn.execute(
    `SELECT COUNT(*) as tot, MAX(opened_at) as last_open FROM email_opens`
  ).catch(() => [[{ tot: 0, last_open: null }]]);
  if (openRow.tot > 0) {
    const lastOpen = openRow.last_open ? new Date(openRow.last_open).toLocaleString('it-IT', { timeZone: 'Europe/Rome' }) : '?';
    console.log(`\n  Email opens nel DB: ${openRow.tot} (ultima: ${lastOpen})`);
  }

} catch (err) {
  console.log(`  ❌ Errore DB: ${err.message}`);
} finally {
  if (conn) await conn.end().catch(() => {});
}

// ─── 3. SENDGRID API ──────────────────────────────────────────────────────────
console.log('\n━━━ 3. SENDGRID API ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
try {
  const sgRes = await fetch('https://api.sendgrid.com/v3/scopes', {
    headers: { Authorization: `Bearer ${SG_KEY}` }
  });
  if (sgRes.ok) {
    const d = await sgRes.json();
    const hasSend = d.scopes?.includes('mail.send');
    console.log(`  ✅ Autenticazione: OK (HTTP ${sgRes.status})`);
    console.log(`  ${hasSend ? '✅' : '❌'} Permesso mail.send: ${hasSend ? 'OK' : 'MANCANTE'}`);
    console.log(`  Totale permessi: ${d.scopes?.length || 0}`);
  } else {
    console.log(`  ❌ Autenticazione fallita: HTTP ${sgRes.status}`);
  }

  // Stats oggi
  const today = new Date().toISOString().substring(0, 10);
  const statsRes = await fetch(`https://api.sendgrid.com/v3/stats?start_date=${today}&aggregated_by=day`, {
    headers: { Authorization: `Bearer ${SG_KEY}` }
  });
  if (statsRes.ok) {
    const stats = await statsRes.json();
    const m = stats[0]?.stats?.[0]?.metrics || {};
    console.log(`  Oggi (${today}): inviati=${m.requests||0}, consegnati=${m.delivered||0}, aperture_uniche=${m.unique_opens||0}, bounce=${m.bounces||0}`);
  }
} catch (err) {
  console.log(`  ❌ Errore SendGrid: ${err.message}`);
}

// ─── 4. LINKEDIN API ──────────────────────────────────────────────────────────
console.log('\n━━━ 4. LINKEDIN API ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
try {
  const TOKEN_EXPIRY_UTC = 1784108934;
  const now = Math.floor(Date.now() / 1000);
  const daysLeft = Math.floor((TOKEN_EXPIRY_UTC - now) / 86400);
  const expiresAt = new Date(TOKEN_EXPIRY_UTC * 1000).toLocaleDateString('it-IT', { timeZone: 'Europe/Rome' });
  
  const liRes = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${LI_TOKEN}` }
  });
  if (liRes.ok) {
    const d = await liRes.json();
    console.log(`  ✅ API attiva: OK (HTTP ${liRes.status})`);
    console.log(`  Account: ${d.name || d.sub}`);
    console.log(`  Token scade: ${expiresAt} (tra ${daysLeft} giorni)`);
    console.log(`  Status: ${daysLeft > 14 ? '✅ VALIDO' : daysLeft > 7 ? '🟡 WARNING' : '🔴 CRITICO'}`);
  } else {
    const err = await liRes.text();
    console.log(`  ❌ API fallita: HTTP ${liRes.status} — ${err.substring(0, 200)}`);
  }
} catch (err) {
  console.log(`  ❌ Errore LinkedIn: ${err.message}`);
}

// ─── 5. ANTHROPIC API ─────────────────────────────────────────────────────────
console.log('\n━━━ 5. ANTHROPIC (Claude) API ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
try {
  const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'ping' }]
    })
  });
  if (aiRes.ok) {
    console.log(`  ✅ Anthropic API: OK (HTTP ${aiRes.status})`);
  } else {
    const err = await aiRes.text();
    console.log(`  ❌ Anthropic fallita: HTTP ${aiRes.status} — ${err.substring(0, 200)}`);
  }
} catch (err) {
  console.log(`  ❌ Errore Anthropic: ${err.message}`);
}

// ─── 6. PEXELS API ────────────────────────────────────────────────────────────
console.log('\n━━━ 6. PEXELS API (immagini) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
try {
  const pxRes = await fetch('https://api.pexels.com/v1/search?query=technology&per_page=1', {
    headers: { Authorization: process.env.PEXELS_API_KEY }
  });
  if (pxRes.ok) {
    const d = await pxRes.json();
    console.log(`  ✅ Pexels API: OK (HTTP ${pxRes.status}) — ${d.total_results?.toLocaleString()} risultati disponibili`);
  } else {
    console.log(`  ❌ Pexels fallita: HTTP ${pxRes.status}`);
  }
} catch (err) {
  console.log(`  ❌ Errore Pexels: ${err.message}`);
}

// ─── 7. SITO PRODUZIONE ───────────────────────────────────────────────────────
console.log('\n━━━ 7. SITO PRODUZIONE (proofpress.ai) ━━━━━━━━━━━━━━━━━━━━━━');
const pages = [
  ['Homepage', 'https://proofpress.ai'],
  ['Landing Fasteer', 'https://proofpress.ai/fasteer-guida-legacy'],
  ['Chi Siamo', 'https://proofpress.ai/chi-siamo'],
  ['API auth', 'https://proofpress.ai/api/trpc/auth.me?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D'],
];
for (const [name, url] of pages) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const ok = r.status < 400 || r.status === 401;
    console.log(`  ${ok ? '✅' : '❌'} ${name}: HTTP ${r.status}`);
  } catch (err) {
    console.log(`  ❌ ${name}: ${err.message}`);
  }
}

// ─── 8. SCHEDULER STATUS ──────────────────────────────────────────────────────
console.log('\n━━━ 8. SCHEDULER (node-cron) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  Il server di produzione gestisce i cron job autonomamente.');
console.log('  Ultimo log locale: 6 giugno 2026 (sandbox dormiente dopo quella data).');

// Verifica se la newsletter di oggi è stata inviata via SendGrid stats
const todayDate = new Date().toISOString().substring(0, 10);
const statsCheck = await fetch(`https://api.sendgrid.com/v3/stats?start_date=${todayDate}&aggregated_by=day`, {
  headers: { Authorization: `Bearer ${SG_KEY}` }
});
if (statsCheck.ok) {
  const s = await statsCheck.json();
  const m = s[0]?.stats?.[0]?.metrics || {};
  const sent = m.requests || 0;
  const delivered = m.delivered || 0;
  if (sent > 1000) {
    console.log(`  ✅ Newsletter di oggi INVIATA: ${sent} email, ${delivered} consegnate`);
  } else if (sent > 0) {
    console.log(`  ⚠️  Invii oggi: ${sent} (sotto soglia — newsletter non ancora inviata o in corso)`);
  } else {
    console.log(`  ⚠️  Nessun invio oggi registrato in SendGrid (${todayDate})`);
    console.log('     Possibili cause: server non attivo alle 08:30 CET, giorno festivo, o invio non ancora avvenuto');
  }
}

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║                    FINE SANITY CHECK                        ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
