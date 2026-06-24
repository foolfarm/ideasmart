import { config } from 'dotenv';
config();

const SG_KEY = process.env.SENDGRID_API_KEY;
const BASE = 'https://api.sendgrid.com/v3';

async function sg(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${SG_KEY}`, 'Content-Type': 'application/json' }
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, ok: res.ok, data: json };
}

if (!SG_KEY) {
  console.log('❌ SENDGRID_API_KEY non trovato in env');
  process.exit(1);
}

console.log('=== VERIFICA API SENDGRID ===\n');
console.log('API Key trovata, lunghezza:', SG_KEY.length, 'chars');
console.log('Prefisso:', SG_KEY.substring(0, 12) + '...\n');

// 1. Test autenticazione — /scopes
console.log('--- 1. Test autenticazione (scopes) ---');
const scopes = await sg('/scopes');
if (scopes.ok) {
  const scopeList = scopes.data?.scopes || [];
  console.log('✅ Autenticazione OK — HTTP', scopes.status);
  const keyScopes = ['mail.send', 'stats.read', 'suppressions.read', 'marketing.read'];
  for (const s of keyScopes) {
    const has = scopeList.includes(s);
    console.log(`  ${has ? '✅' : '❌'} ${s}`);
  }
  console.log(`  Totale permessi: ${scopeList.length}`);
} else {
  console.log('❌ Autenticazione FALLITA — HTTP', scopes.status, JSON.stringify(scopes.data).substring(0, 200));
}

// 2. Statistiche ultime 24h
console.log('\n--- 2. Statistiche ultime 24h ---');
const today = new Date().toISOString().substring(0, 10);
const yesterday = new Date(Date.now() - 86400000).toISOString().substring(0, 10);
const stats24h = await sg(`/stats?start_date=${yesterday}&end_date=${today}&aggregated_by=day`);
if (stats24h.ok && Array.isArray(stats24h.data)) {
  for (const day of stats24h.data) {
    const m = day.stats?.[0]?.metrics || {};
    console.log(`  ${day.date}: inviati=${m.requests||0}, consegnati=${m.delivered||0}, aperture=${m.unique_opens||0}, bounce=${m.bounces||0}, spam=${m.spam_reports||0}`);
  }
} else {
  console.log('  Errore stats:', JSON.stringify(stats24h.data).substring(0, 200));
}

// 3. Bounce/Spam list
console.log('\n--- 3. Bounce recenti (ultimi 5) ---');
const bounces = await sg('/suppression/bounces?limit=5');
if (bounces.ok) {
  const list = Array.isArray(bounces.data) ? bounces.data : [];
  if (list.length === 0) {
    console.log('  ✅ Nessun bounce recente');
  } else {
    for (const b of list) {
      console.log(`  ⚠️  ${b.email} — ${b.reason?.substring(0, 80)}`);
    }
  }
} else {
  console.log('  Errore:', JSON.stringify(bounces.data).substring(0, 200));
}

// 4. Spam reports
console.log('\n--- 4. Spam reports recenti ---');
const spam = await sg('/suppression/spam_reports?limit=5');
if (spam.ok) {
  const list = Array.isArray(spam.data) ? spam.data : [];
  if (list.length === 0) {
    console.log('  ✅ Nessun spam report recente');
  } else {
    for (const s of list) {
      console.log(`  🚨 ${s.email} — ${new Date(s.created * 1000).toLocaleDateString('it-IT')}`);
    }
  }
} else {
  console.log('  Errore:', JSON.stringify(spam.data).substring(0, 200));
}

// 5. Sender identity verificata
console.log('\n--- 5. Sender identity ---');
const senders = await sg('/verified_senders');
if (senders.ok) {
  const list = senders.data?.results || [];
  for (const s of list) {
    const verified = s.verified ? '✅' : '❌';
    console.log(`  ${verified} ${s.from_email} (${s.from_name}) — ${s.verified ? 'VERIFICATO' : 'NON VERIFICATO'}`);
  }
  if (list.length === 0) console.log('  Nessun sender verificato trovato');
} else {
  console.log('  Errore:', JSON.stringify(senders.data).substring(0, 200));
}

// 6. Test invio email (solo dry-run — non invia davvero, solo valida)
console.log('\n--- 6. Validazione API key con /mail/send (dry-run) ---');
const testPayload = {
  personalizations: [{ to: [{ email: 'test@example.com' }] }],
  from: { email: process.env.SENDGRID_FROM_EMAIL || 'noreply@proofpress.ai', name: 'ProofPress' },
  subject: 'Test API',
  content: [{ type: 'text/plain', value: 'Test' }],
  mail_settings: { sandbox_mode: { enable: true } }
};
const sendTest = await fetch(`${BASE}/mail/send`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${SG_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify(testPayload)
});
if (sendTest.status === 200 || sendTest.status === 202) {
  console.log(`  ✅ API /mail/send funzionante — HTTP ${sendTest.status} (sandbox mode, nessuna email inviata)`);
} else {
  const errBody = await sendTest.text();
  console.log(`  ❌ /mail/send errore — HTTP ${sendTest.status}: ${errBody.substring(0, 300)}`);
}

console.log('\n=== FINE VERIFICA ===');
