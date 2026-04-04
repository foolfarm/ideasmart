import 'dotenv/config';

const API_KEY = process.env.SENDGRID_API_KEY;
if (!API_KEY) {
  console.error("SENDGRID_API_KEY non trovato");
  process.exit(1);
}

const headers = {
  "Authorization": `Bearer ${API_KEY}`,
  "Content-Type": "application/json"
};

const today = new Date().toISOString().split('T')[0];

console.log("=".repeat(60));
console.log(`STATISTICHE SENDGRID — ${today}`);
console.log("=".repeat(60));

const url = `https://api.sendgrid.com/v3/stats?start_date=${today}&end_date=${today}`;
const resp = await fetch(url, { headers });
if (resp.ok) {
  const data = await resp.json();
  if (data && data.length > 0) {
    for (const dayData of data) {
      const stats = dayData.stats?.[0]?.metrics || {};
      console.log(`\nData: ${dayData.date}`);
      console.log(`  Richieste (inviate):    ${stats.requests || 0}`);
      console.log(`  Consegnate:             ${stats.delivered || 0}`);
      console.log(`  Aperture uniche:        ${stats.unique_opens || 0}`);
      console.log(`  Click unici:            ${stats.unique_clicks || 0}`);
      console.log(`  Bounce:                 ${stats.bounces || 0}`);
      console.log(`  Spam report:            ${stats.spam_reports || 0}`);
      console.log(`  Disiscrizioni:          ${stats.unsubscribes || 0}`);
      console.log(`  Bloccate:               ${stats.blocks || 0}`);
      
      const delivered = stats.delivered || 0;
      const uniqueOpens = stats.unique_opens || 0;
      const uniqueClicks = stats.unique_clicks || 0;
      
      if (delivered > 0) {
        console.log(`\n  Tasso apertura:      ${((uniqueOpens / delivered) * 100).toFixed(1)}%`);
        console.log(`  Tasso click:         ${((uniqueClicks / delivered) * 100).toFixed(1)}%`);
      }
    }
  } else {
    console.log("  Nessun dato disponibile per oggi");
  }
} else {
  console.error(`Errore API: ${resp.status}`);
}
