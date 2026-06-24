import { config } from 'dotenv';
config();

const KEY = process.env.SENDGRID_API_KEY;
const TODAY = '2026-06-19';

// Recupera tutti i messaggi BUONGIORNO di oggi
const query = encodeURIComponent(`last_event_time BETWEEN TIMESTAMP "${TODAY}T00:00:00Z" AND TIMESTAMP "${TODAY}T23:59:59Z" AND subject LIKE "%BUONGIORNO%"`);

let allMessages = [];
let offset = 0;
process.stderr.write('Recupero messaggi...\n');

while (true) {
  const r = await fetch(`https://api.sendgrid.com/v3/messages?limit=1000&offset=${offset}&query=${query}`, {
    headers: { Authorization: `Bearer ${KEY}` }
  });
  const data = await r.json();
  const msgs = data.messages || [];
  allMessages = allMessages.concat(msgs);
  if (msgs.length < 1000) break;
  offset += 1000;
  if (offset >= 5000) break;
}

process.stderr.write(`Totale messaggi: ${allMessages.length}\n`);

// Recupera eventi dettagliati per ogni messaggio con opens > 0 (campione rappresentativo)
// Per i click: recupera dettaglio di TUTTI i messaggi con clicks_count > 0
// Nota: clicks_count nell'Activity Feed è sempre 0 per limitazione API — usiamo gli eventi
const msgWithOpens = allMessages.filter(m => m.opens_count > 0);
process.stderr.write(`Messaggi con aperture: ${msgWithOpens.length} — recupero dettagli...\n`);

// Strutture dati
const deviceCounts = { mobile: 0, desktop: 0, tablet: 0, unknown: 0 };
const osCounts = {};
const clientCounts = {};
const hourCounts = {};
const domainOpens = {};
const clickEvents = [];
const openEvents = [];

// Funzione per classificare device da user agent
function classifyDevice(ua) {
  if (!ua) return 'unknown';
  if (/iPad/i.test(ua)) return 'tablet';
  if (/iPhone|Android.*Mobile|Mobile/i.test(ua)) return 'mobile';
  if (/Windows|Macintosh|Linux|CrOS/i.test(ua)) return 'desktop';
  return 'unknown';
}

function extractOS(ua) {
  if (!ua) return 'Unknown';
  if (/iPhone|iPad/.test(ua)) return 'iOS';
  if (/Android/.test(ua)) return 'Android';
  if (/Windows/.test(ua)) return 'Windows';
  if (/Macintosh/.test(ua)) return 'macOS';
  if (/Linux/.test(ua)) return 'Linux';
  return 'Other';
}

function extractClient(ua) {
  if (!ua) return 'Unknown';
  if (/Outlook/i.test(ua)) return 'Outlook';
  if (/iPhone|iPad/i.test(ua) && /Mobile/i.test(ua)) return 'Apple Mail (iOS)';
  if (/Macintosh/i.test(ua) && !/Chrome|Firefox/i.test(ua)) return 'Apple Mail (macOS)';
  if (/Chrome/i.test(ua)) return 'Chrome';
  if (/Firefox/i.test(ua)) return 'Firefox';
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return 'Safari';
  if (/Thunderbird/i.test(ua)) return 'Thunderbird';
  if (/YahooMailProxy|Yahoo/i.test(ua)) return 'Yahoo Mail';
  if (/GoogleImageProxy|Google/i.test(ua)) return 'Gmail';
  return 'Other';
}

// Recupera dettagli in batch (max 50 richieste parallele)
const BATCH = 30;
let processed = 0;

for (let i = 0; i < msgWithOpens.length; i += BATCH) {
  const batch = msgWithOpens.slice(i, i + BATCH);
  const results = await Promise.allSettled(
    batch.map(msg =>
      fetch(`https://api.sendgrid.com/v3/messages/${encodeURIComponent(msg.msg_id)}`, {
        headers: { Authorization: `Bearer ${KEY}` }
      }).then(r => r.json()).then(d => ({ msg, detail: d }))
    )
  );

  for (const res of results) {
    if (res.status !== 'fulfilled') continue;
    const { msg, detail } = res.value;
    const events = detail.events || [];
    const domain = msg.to_email?.split('@')[1] || 'unknown';

    for (const ev of events) {
      const ua = ev.http_user_agent || '';
      const hour = ev.processed ? new Date(ev.processed).getUTCHours() : null;

      if (ev.event_name === 'open') {
        const device = classifyDevice(ua);
        const os = extractOS(ua);
        const client = extractClient(ua);
        deviceCounts[device]++;
        osCounts[os] = (osCounts[os] || 0) + 1;
        clientCounts[client] = (clientCounts[client] || 0) + 1;
        if (hour !== null) hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        domainOpens[domain] = (domainOpens[domain] || 0) + 1;
        openEvents.push({ email: msg.to_email, time: ev.processed, device, os, client });
      }

      if (ev.event_name === 'click') {
        clickEvents.push({
          email: msg.to_email,
          url: ev.url || ev.link_url || 'N/A',
          time: ev.processed,
          ua: ua.substring(0, 80)
        });
      }
    }
  }

  processed += batch.length;
  process.stderr.write(`  ${processed}/${msgWithOpens.length} elaborati\n`);
}

// Stats generali da API
const statsR = await fetch(`https://api.sendgrid.com/v3/stats?start_date=${TODAY}&end_date=${TODAY}&aggregated_by=day`, {
  headers: { Authorization: `Bearer ${KEY}` }
});
const statsData = await statsR.json();
const m = statsData[0]?.stats[0]?.metrics || {};

// Top domini per aperture
const topDomains = Object.entries(domainOpens)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15);

// Distribuzione oraria (CET = UTC+2)
const hourCET = {};
for (const [h, count] of Object.entries(hourCounts)) {
  const cet = (Number(h) + 2) % 24;
  hourCET[cet] = (hourCET[cet] || 0) + count;
}

// Output JSON completo
const report = {
  data: TODAY,
  oggetto: 'BUONGIORNO — Le news di oggi da ProofPress, Venerdì 19 giugno 2026',
  mittente: 'redazione@proofpress.ai',

  metriche_generali: {
    inviati: m.requests || 0,
    consegnati: m.delivered || 0,
    non_consegnati: (m.requests || 0) - (m.delivered || 0),
    aperture_totali: m.opens || 0,
    aperture_uniche: m.unique_opens || 0,
    click_totali: m.clicks || 0,
    click_unici: m.unique_clicks || 0,
    bounce: m.bounces || 0,
    spam_reports: m.spam_reports || 0,
    disiscrizioni: m.unsubscribes || 0,
    open_rate_pct: m.delivered > 0 ? +((m.unique_opens / m.delivered) * 100).toFixed(2) : 0,
    click_rate_pct: m.delivered > 0 ? +((m.unique_clicks / m.delivered) * 100).toFixed(2) : 0,
    click_to_open_rate_pct: m.unique_opens > 0 ? +((m.unique_clicks / m.unique_opens) * 100).toFixed(2) : 0,
    deliverability_rate_pct: m.requests > 0 ? +((m.delivered / m.requests) * 100).toFixed(2) : 0,
  },

  dispositivi: deviceCounts,
  sistemi_operativi: Object.entries(osCounts).sort((a,b) => b[1]-a[1]),
  client_email: Object.entries(clientCounts).sort((a,b) => b[1]-a[1]),

  distribuzione_oraria_aperture_cet: Object.entries(hourCET)
    .sort((a,b) => Number(a[0]) - Number(b[0]))
    .map(([h, c]) => ({ ora_cet: `${h.padStart(2,'0')}:00`, aperture: c })),

  top_15_domini_per_aperture: topDomains.map(([domain, opens]) => ({ domain, opens })),

  click_dettaglio: clickEvents.length > 0
    ? clickEvents
    : [{ nota: 'Nessun click registrato finora (la newsletter è stata inviata stamattina, i click si accumulano nel corso della giornata)' }],

  totale_eventi_analizzati: {
    aperture_eventi: openEvents.length,
    click_eventi: clickEvents.length,
    messaggi_analizzati: msgWithOpens.length
  }
};

console.log(JSON.stringify(report, null, 2));
