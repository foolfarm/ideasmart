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

// 1. Stats globali per giorno dal 28 maggio al 6 giugno
console.log('\n=== STATISTICHE GLOBALI (28 maggio – 6 giugno 2026) ===');
const stats = await sg('/stats?start_date=2026-05-28&end_date=2026-06-06&aggregated_by=day');
if (Array.isArray(stats)) {
  for (const day of stats) {
    const m = day.stats?.[0]?.metrics || {};
    console.log(`${day.date} | inviati: ${m.requests || 0} | consegnati: ${m.delivered || 0} | aperti: ${m.opens || 0} (unici: ${m.unique_opens || 0}) | click: ${m.clicks || 0} (unici: ${m.unique_clicks || 0}) | bounce: ${m.bounces || 0} | spam: ${m.spam_reports || 0}`);
  }
} else {
  console.log('Errore stats:', JSON.stringify(stats));
}

// 2. Ultimi messaggi inviati (activity feed) - ultimi 50
console.log('\n=== ACTIVITY FEED — Ultimi invii ===');
const activity = await sg('/messages?limit=50&query=status%3D%22delivered%22');
if (activity.messages) {
  // Raggruppa per subject
  const bySubject = {};
  for (const msg of activity.messages) {
    const key = msg.subject?.substring(0, 70) || 'N/A';
    if (!bySubject[key]) bySubject[key] = { count: 0, first: msg.last_event_time, last: msg.last_event_time };
    bySubject[key].count++;
    if (msg.last_event_time < bySubject[key].first) bySubject[key].first = msg.last_event_time;
    if (msg.last_event_time > bySubject[key].last) bySubject[key].last = msg.last_event_time;
  }
  for (const [subject, data] of Object.entries(bySubject)) {
    console.log(`"${subject}" | dest: ${data.count} | primo: ${data.first} | ultimo: ${data.last}`);
  }
} else {
  console.log('Activity:', JSON.stringify(activity).substring(0, 300));
}

// 3. Cerca specificamente invii Fasteer
console.log('\n=== RICERCA FASTEER ===');
const fasteer = await sg('/messages?limit=100&query=subject%3D%22Guida+Definitiva%22');
if (fasteer.messages && fasteer.messages.length > 0) {
  const bySubject = {};
  for (const msg of fasteer.messages) {
    const key = msg.subject?.substring(0, 80) || 'N/A';
    if (!bySubject[key]) bySubject[key] = { count: 0, date: msg.last_event_time?.substring(0,10) };
    bySubject[key].count++;
  }
  for (const [subject, data] of Object.entries(bySubject)) {
    console.log(`"${subject}" | ${data.date} | dest: ${data.count}`);
  }
} else {
  console.log('Nessun messaggio Fasteer trovato (o API non supporta query full-text)');
  console.log(JSON.stringify(fasteer).substring(0, 200));
}
