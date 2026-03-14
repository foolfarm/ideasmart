import { config } from 'dotenv';
config();

const key = process.env.PEXELS_API_KEY;
console.log('Key present:', !!key, key ? key.slice(0, 10) + '...' : 'MISSING');

if (!key) {
  console.error('PEXELS_API_KEY not set');
  process.exit(1);
}

const res = await fetch('https://api.pexels.com/v1/search?query=artificial+intelligence&per_page=2', {
  headers: { Authorization: key }
});
const data = await res.json();
const photos = data.photos || [];
console.log('Pexels API test:', res.status, photos.length, 'photo(s)');
if (photos[0]) {
  console.log('Sample URL:', photos[0].src.medium.slice(0, 80));
  console.log('Photographer:', photos[0].photographer);
}
