import { config } from 'dotenv';
config();

const SG_KEY = process.env.SENDGRID_API_KEY;
const LI_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const PEXELS_KEY = process.env.PEXELS_API_KEY;

const BASE_SG = 'https://api.sendgrid.com/v3';

async function sg(path) {
  const r = await fetch(`${BASE_SG}${path}`, {
    headers: { Authorization: `Bearer ${SG_KEY}` }
  });
  return { status: r.status, ok: r.ok, data: await r.json().catch(() => null) };
}

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║     PROOFPRESS.AI — SANITY CHECK COMPLETO  11/06/2026       ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

// ─── NEWSLETTER DI OGGI ───────────────────────────────────────────────────────
console.log('━━━ NEWSLETTER BUONGIORNO — STATO OGGI (11 giugno 2026) ━━━━━━');
const today = '2026-06-11';
const yesterday = '2026-06-10';

// Stats per oggi e ieri
const statsToday = await sg(`/stats?start_date=${today}&end_date=${today}&aggregated_by=day`);
const statsYest = await sg(`/stats?start_date=${yesterday}&end_date=${yesterday}&aggregated_by=day`);

const mToday = statsToday.data?.[0]?.stats?.[0]?.metrics || {};
const mYest = statsYest.data?.[0]?.stats?.[0]?.metrics || {};

console.log(`  Oggi (${today}):`);
console.log(`    Inviati:        ${mToday.requests || 0}`);
console.log(`    Consegnati:     ${mToday.delivered || 0}`);
console.log(`    Aperture uniche: ${mToday.unique_opens || 0}`);
console.log(`    Bounce:         ${mToday.bounces || 0}`);
console.log(`    Spam:           ${mToday.spam_reports || 0}`);

const todaySent = mToday.requests || 0;
if (todaySent >= 3000) {
  console.log(`  ✅ Newsletter di oggi INVIATA (${todaySent} email)`);
} else if (todaySent >= 100) {
  console.log(`  ⚠️  Invio parziale oggi: ${todaySent} email (atteso ~6.000)`);
} else {
  console.log(`  ❌ Newsletter di oggi NON INVIATA (solo ${todaySent} email registrate)`);
  console.log(`     CAUSA PROBABILE: server di produzione non attivo alle 08:30 CET`);
}

console.log(`\n  Ieri (${yesterday}):`);
console.log(`    Inviati: ${mYest.requests || 0} | Consegnati: ${mYest.delivered || 0} | Aperture: ${mYest.unique_opens || 0}`);

// Stats ultimi 7 giorni
console.log('\n━━━ PERFORMANCE ULTIMI 7 GIORNI ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
const stats7 = await sg(`/stats?start_date=2026-06-05&end_date=${today}&aggregated_by=day`);
if (stats7.ok && Array.isArray(stats7.data)) {
  console.log('  Data       | Inviati | Consegnati | Aperture | Open%');
  console.log('  -----------|---------|------------|----------|------');
  for (const day of stats7.data) {
    const m = day.stats?.[0]?.metrics || {};
    const req = m.requests || 0;
    const del = m.delivered || 0;
    const uop = m.unique_opens || 0;
    const rate = del > 0 ? ((uop / del) * 100).toFixed(1) : '—';
    const flag = req >= 3000 ? '✅' : req >= 100 ? '⚠️ ' : '❌';
    console.log(`  ${flag} ${day.date} | ${String(req).padStart(7)} | ${String(del).padStart(10)} | ${String(uop).padStart(8)} | ${rate}%`);
  }
}

// ─── API STATUS ───────────────────────────────────────────────────────────────
console.log('\n━━━ STATO API ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// 1. SendGrid
const sgAuth = await sg('/scopes');
const hasSend = sgAuth.data?.scopes?.includes('mail.send');
console.log(`  SendGrid:   ${sgAuth.ok && hasSend ? '✅ OK' : '❌ PROBLEMA'} — HTTP ${sgAuth.status}, mail.send: ${hasSend ? 'OK' : 'MANCANTE'}`);

// 2. LinkedIn
const liRes = await fetch('https://api.linkedin.com/v2/userinfo', {
  headers: { Authorization: `Bearer ${LI_TOKEN}` }
}).catch(() => ({ ok: false, status: 0 }));
const TOKEN_EXPIRY_UTC = 1784108934;
const daysLeft = Math.floor((TOKEN_EXPIRY_UTC - Date.now() / 1000) / 86400);
console.log(`  LinkedIn:   ${liRes.ok ? '✅ OK' : '❌ PROBLEMA'} — HTTP ${liRes.status}, token scade tra ${daysLeft} giorni (15/07/2026)`);

// 3. Anthropic — test con modello corretto
const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': ANTHROPIC_KEY,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json'
  },
  body: JSON.stringify({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 5,
    messages: [{ role: 'user', content: 'ping' }]
  })
}).catch(() => ({ ok: false, status: 0 }));
console.log(`  Anthropic:  ${aiRes.ok ? '✅ OK' : '❌ PROBLEMA'} — HTTP ${aiRes.status}${!aiRes.ok ? ' (modello claude-3-haiku deprecato — usare claude-3-5-haiku-20241022)' : ''}`);

// 4. Pexels
const pxRes = await fetch('https://api.pexels.com/v1/search?query=ai&per_page=1', {
  headers: { Authorization: PEXELS_KEY }
}).catch(() => ({ ok: false, status: 0 }));
console.log(`  Pexels:     ${pxRes.ok ? '✅ OK' : '❌ PROBLEMA'} — HTTP ${pxRes.status}`);

// 5. Sito produzione
const siteRes = await fetch('https://proofpress.ai', { signal: AbortSignal.timeout(10000) })
  .catch(() => ({ ok: false, status: 0 }));
console.log(`  proofpress.ai: ${siteRes.ok ? '✅ OK' : '❌ PROBLEMA'} — HTTP ${siteRes.status}`);

// ─── POST LINKEDIN RECENTI ────────────────────────────────────────────────────
console.log('\n━━━ POST LINKEDIN RECENTI (via API) ━━━━━━━━━━━━━━━━━━━━━━━━━');
const authorUrn = process.env.LINKEDIN_AUTHOR_URN;
if (authorUrn) {
  const postsRes = await fetch(
    `https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(${encodeURIComponent(authorUrn)})&count=5`,
    { headers: { Authorization: `Bearer ${LI_TOKEN}`, 'X-Restli-Protocol-Version': '2.0.0' } }
  ).catch(() => null);
  
  if (postsRes?.ok) {
    const postsData = await postsRes.json();
    const elements = postsData.elements || [];
    if (elements.length > 0) {
      console.log(`  Ultimi ${elements.length} post trovati:`);
      for (const p of elements) {
        const created = p.created?.time ? new Date(p.created.time).toLocaleDateString('it-IT') : '?';
        const text = p.specificContent?.['com.linkedin.ugc.ShareContent']?.shareCommentary?.text?.substring(0, 80) || 'N/A';
        console.log(`    ${created} — "${text}..."`);
      }
    } else {
      console.log('  Nessun post trovato via API ugcPosts');
    }
  } else {
    // Prova con shares API
    const sharesRes = await fetch(
      `https://api.linkedin.com/v2/shares?q=owners&owners=${encodeURIComponent(authorUrn)}&count=5`,
      { headers: { Authorization: `Bearer ${LI_TOKEN}`, 'X-Restli-Protocol-Version': '2.0.0' } }
    ).catch(() => null);
    if (sharesRes?.ok) {
      const d = await sharesRes.json();
      console.log(`  Post recenti (shares API): ${d.elements?.length || 0} trovati`);
    } else {
      console.log(`  ⚠️  API posts LinkedIn non disponibile (HTTP ${postsRes?.status || '?'})`);
      console.log('  Ultimi post noti dal DB: vedere tabella linkedin_posts');
    }
  }
}

// ─── SCHEDULER STATUS ─────────────────────────────────────────────────────────
console.log('\n━━━ SCHEDULER — ANALISI INVII MANCATI ━━━━━━━━━━━━━━━━━━━━━━━');
// Verifica giorni lavorativi recenti con invii mancati
const checkDates = ['2026-06-09', '2026-06-10', '2026-06-11'];
const statsRange = await sg(`/stats?start_date=2026-06-09&end_date=${today}&aggregated_by=day`);
if (statsRange.ok && Array.isArray(statsRange.data)) {
  for (const day of statsRange.data) {
    const m = day.stats?.[0]?.metrics || {};
    const req = m.requests || 0;
    const date = new Date(day.date);
    const dow = date.getDay(); // 0=Dom, 1=Lun...5=Ven, 6=Sab
    const isWeekday = dow >= 1 && dow <= 5;
    if (isWeekday) {
      if (req >= 3000) {
        console.log(`  ✅ ${day.date} (${['Dom','Lun','Mar','Mer','Gio','Ven','Sab'][dow]}): Newsletter inviata (${req} email)`);
      } else {
        console.log(`  ❌ ${day.date} (${['Dom','Lun','Mar','Mer','Gio','Ven','Sab'][dow]}): Newsletter NON inviata (solo ${req} email)`);
        console.log(`     → Il server di produzione probabilmente non era attivo alle 08:30 CET`);
      }
    } else {
      console.log(`  ℹ️  ${day.date} (${['Dom','Lun','Mar','Mer','Gio','Ven','Sab'][dow]}): Weekend — nessun invio previsto`);
    }
  }
}

console.log('\n━━━ RIEPILOGO PROBLEMI RILEVATI ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
// Riepilogo
const issues = [];
if (todaySent < 3000) issues.push('❌ Newsletter di oggi NON inviata (0-5 email vs atteso ~6.000)');
if (!aiRes.ok) issues.push('⚠️  Anthropic: modello claude-3-haiku-20240307 deprecato — aggiornare a claude-3-5-haiku-20241022');

if (issues.length === 0) {
  console.log('  ✅ Nessun problema critico rilevato');
} else {
  for (const issue of issues) {
    console.log(`  ${issue}`);
  }
}

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║                    FINE SANITY CHECK                        ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
