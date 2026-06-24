import { config } from 'dotenv';
config();

const SG_KEY = process.env.SENDGRID_API_KEY;
const BASE = 'https://api.sendgrid.com/v3';

async function sg(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${SG_KEY}`, 'Content-Type': 'application/json' }
  });
  return res.json();
}

// Statistiche per giorno con dettaglio
console.log('=== PERFORMANCE NEWSLETTER 28 MAGGIO – 6 GIUGNO 2026 ===\n');
const stats = await sg('/stats?start_date=2026-05-28&end_date=2026-06-06&aggregated_by=day');

let totSent = 0, totDelivered = 0, totOpens = 0, totUniqueOpens = 0, totClicks = 0, totBounce = 0;

if (Array.isArray(stats)) {
  console.log('Data        | Inviati | Consegnati | Aperture  | Aperture uniche | Click | Bounce');
  console.log('------------|---------|------------|-----------|-----------------|-------|-------');
  for (const day of stats) {
    const m = day.stats?.[0]?.metrics || {};
    const req = m.requests || 0;
    const del = m.delivered || 0;
    const op = m.opens || 0;
    const uop = m.unique_opens || 0;
    const cl = m.clicks || 0;
    const bo = m.bounces || 0;
    totSent += req; totDelivered += del; totOpens += op; totUniqueOpens += uop; totClicks += cl; totBounce += bo;
    const openRate = del > 0 ? ((uop / del) * 100).toFixed(1) : '0';
    console.log(`${day.date} | ${String(req).padStart(7)} | ${String(del).padStart(10)} | ${String(op).padStart(9)} | ${uop} (${openRate}%)`.padEnd(60) + ` | ${cl} | ${bo}`);
  }
  console.log('------------|---------|------------|-----------|-----------------|-------|-------');
  const totOpenRate = totDelivered > 0 ? ((totUniqueOpens / totDelivered) * 100).toFixed(1) : '0';
  console.log(`TOTALE      | ${String(totSent).padStart(7)} | ${String(totDelivered).padStart(10)} | ${String(totOpens).padStart(9)} | ${totUniqueOpens} (${totOpenRate}%) | ${totClicks} | ${totBounce}`);
}

// Cerca tutti i messaggi Fasteer Special con paginazione
console.log('\n=== INVII FASTEER SPECIAL (tutti i soggetti) ===');
const fasteerSubjects = [
  'ProofPress presenta',
  'Ultima chiamata',
  'Hai gi',
  '2.41 Trilioni',
  'Guida Definitiva',
];

// Prendi tutti i messaggi degli ultimi 10 giorni
const allMsgs = await sg('/messages?limit=1000');
if (allMsgs.messages) {
  const fasteerMsgs = allMsgs.messages.filter(m => 
    fasteerSubjects.some(s => (m.subject || '').includes(s))
  );
  
  if (fasteerMsgs.length === 0) {
    console.log('Nessun messaggio Fasteer nell\'activity feed (limit 1000)');
  } else {
    const byDateSubject = {};
    for (const msg of fasteerMsgs) {
      const date = msg.last_event_time?.substring(0, 10) || '?';
      const subj = (msg.subject || 'N/A').substring(0, 70);
      const key = `${date}|${subj}`;
      if (!byDateSubject[key]) byDateSubject[key] = { count: 0, date, subject: subj };
      byDateSubject[key].count++;
    }
    const sorted = Object.values(byDateSubject).sort((a, b) => b.date.localeCompare(a.date));
    for (const item of sorted) {
      console.log(`${item.date} | dest: ${item.count} | "${item.subject}"`);
    }
  }
}
