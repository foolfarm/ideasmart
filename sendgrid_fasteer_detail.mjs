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

// Cerca tutti i messaggi con "Guida" o "Fasteer" o "Legacy" nel subject
// Usando query encoding corretto
const queries = [
  'subject%3D%22Ultima+chiamata%22',
  'subject%3D%22Hai+gi%C3%A0+scaricato%22',
  'subject%3D%222.41+Trilioni%22',
  'subject%3D%22ProofPress+presenta%22',
];

for (const q of queries) {
  const data = await sg(`/messages?limit=100&query=${q}`);
  if (data.messages && data.messages.length > 0) {
    const bySubject = {};
    for (const msg of data.messages) {
      const key = msg.subject?.substring(0, 80) || 'N/A';
      if (!bySubject[key]) bySubject[key] = { count: 0, date: msg.last_event_time?.substring(0,10), opens: 0 };
      bySubject[key].count++;
    }
    for (const [subject, data] of Object.entries(bySubject)) {
      console.log(`"${subject}" | ${data.date} | destinatari: ${data.count}`);
    }
  }
}

// Cerca anche per from_email ProofPress
console.log('\n=== TUTTI GLI INVII PROOFPRESS (ultimi 100 messaggi) ===');
const all = await sg('/messages?limit=100');
if (all.messages) {
  const bySubject = {};
  for (const msg of all.messages) {
    const key = (msg.subject || 'N/A').substring(0, 75);
    const date = msg.last_event_time?.substring(0, 10) || '?';
    const dateKey = `${date}|${key}`;
    if (!bySubject[dateKey]) bySubject[dateKey] = { count: 0, date, subject: key };
    bySubject[dateKey].count++;
  }
  // Ordina per data desc
  const sorted = Object.values(bySubject).sort((a, b) => b.date.localeCompare(a.date));
  for (const item of sorted) {
    console.log(`${item.date} | dest: ${item.count} | "${item.subject}"`);
  }
}
