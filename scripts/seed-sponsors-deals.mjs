import 'dotenv/config';
import mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  // Inserire sponsor aggiuntivo: Fragmentalis (primary)
  await conn.execute(
    `INSERT INTO newsletter_sponsors (name, headline, description, url, imageUrl, features, ctaText, placement, active, weight) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'Fragmentalis',
      'Fragmentalis — La piattaforma AI per il tuo business',
      'Fragmentalis trasforma i tuoi dati aziendali in insight azionabili grazie all\'intelligenza artificiale. Automatizza processi, analizza trend e prendi decisioni data-driven.',
      'https://fragmentalis.com?utm_source=ideasmart&utm_medium=newsletter&utm_campaign=sponsor',
      'https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ideasmart_fragmentalis-WqVpGnPxQvhf6bevxs5m6m.webp',
      JSON.stringify(['AI Analytics avanzati', 'Dashboard personalizzabili', 'Integrazione API in 5 minuti']),
      'Prova gratis →',
      'primary',
      true,
      1
    ]
  );
  console.log('Sponsor Fragmentalis inserito');
  
  // Inserire sponsor aggiuntivo: PollCast (spotlight)
  await conn.execute(
    `INSERT INTO newsletter_sponsors (name, headline, description, url, imageUrl, features, ctaText, placement, active, weight) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'PollCast',
      'PollCast — Sondaggi intelligenti per il tuo team',
      'Crea sondaggi e poll interattivi per il tuo team, i tuoi clienti o la tua community. Analisi in tempo reale e report automatici.',
      'https://pollcast.io?utm_source=ideasmart&utm_medium=newsletter&utm_campaign=sponsor',
      'https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ideasmart_pollcast-gLGMN8iojcFU6EWceVzvo5.webp',
      JSON.stringify(['Sondaggi illimitati', 'Report in tempo reale', 'Integrazione Slack e Teams']),
      'Inizia ora →',
      'spotlight',
      true,
      1
    ]
  );
  console.log('Sponsor PollCast inserito');
  
  // Inserire altri Amazon Deals per rotazione
  await conn.execute(
    `INSERT INTO amazon_daily_deals (title, description, price, affiliateUrl, imageUrl, rating, reviewCount, category, scheduledDate, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'Apple AirPods Pro 2 — Cancellazione attiva del rumore',
      'Gli AirPods Pro 2 con chip H2 offrono cancellazione attiva del rumore 2x piu efficace, audio adattivo e fino a 6 ore di ascolto.',
      '€279,00',
      'https://amzn.to/airpods-pro-2',
      null,
      '4.8/5',
      '45.000+',
      'Audio & Tech',
      '2026-04-02',
      true
    ]
  );
  console.log('Amazon Deal AirPods Pro 2 inserito (2 aprile)');
  
  await conn.execute(
    `INSERT INTO amazon_daily_deals (title, description, price, affiliateUrl, imageUrl, rating, reviewCount, category, scheduledDate, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'Kindle Scribe — Il Kindle per leggere e scrivere',
      'Kindle Scribe con schermo da 10.2 pollici e penna inclusa. Leggi, scrivi e annota direttamente sui tuoi libri e documenti.',
      '€389,99',
      'https://amzn.to/kindle-scribe',
      null,
      '4.5/5',
      '12.000+',
      'E-Reader & Produttivita',
      '2026-04-03',
      true
    ]
  );
  console.log('Amazon Deal Kindle Scribe inserito (3 aprile)');
  
  await conn.execute(
    `INSERT INTO amazon_daily_deals (title, description, price, affiliateUrl, imageUrl, rating, reviewCount, category, scheduledDate, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'Logitech MX Master 3S — Mouse wireless ergonomico',
      'Il mouse piu avanzato per la produttivita. Scorrimento MagSpeed, sensore 8K DPI, silenzioso, connessione fino a 3 dispositivi.',
      '€99,99',
      'https://amzn.to/mx-master-3s',
      null,
      '4.7/5',
      '28.000+',
      'Accessori & Produttivita',
      '2026-04-04',
      true
    ]
  );
  console.log('Amazon Deal MX Master 3S inserito (4 aprile)');
  
  // Verifica finale
  const [allDeals] = await conn.execute('SELECT id, title, scheduledDate, active FROM amazon_daily_deals ORDER BY scheduledDate');
  console.log('\nTutti i deals:', allDeals);
  const [allSponsors] = await conn.execute('SELECT id, name, placement, active FROM newsletter_sponsors');
  console.log('Tutti gli sponsor:', allSponsors);
  
  await conn.end();
}
main().catch(console.error);
