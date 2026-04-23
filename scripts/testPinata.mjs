import 'dotenv/config';

const jwt = process.env.PINATA_JWT;
console.log('JWT presente:', !!jwt, jwt ? jwt.slice(0, 20) + '...' : 'MANCANTE');

const res = await fetch('https://api.pinata.cloud/data/testAuthentication', {
  headers: { 'Authorization': `Bearer ${jwt}` }
});
const data = await res.json();
console.log('Status HTTP:', res.status);
console.log('Risposta:', JSON.stringify(data));

if (res.status === 200) {
  console.log('\n✅ Pinata OK — avvio backfill...');
} else {
  console.log('\n❌ Pinata ancora bloccato. Il JWT potrebbe essere scaduto dopo l\'upgrade.');
  console.log('Soluzione: vai su app.pinata.cloud → API Keys → rigenera il JWT e aggiornalo in Settings → Secrets.');
}
