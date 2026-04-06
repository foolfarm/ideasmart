import { config } from 'dotenv';
config();

import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const today = '2026-04-06';

// Deal 1: MacBook Air M4 — Sponsor del Giorno
await conn.execute(`
  INSERT INTO amazon_daily_deals 
  (title, description, price, affiliateUrl, imageUrl, rating, reviewCount, category, scheduledDate, active)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
`, [
  'Apple MacBook Air 13" con chip M4',
  'Il MacBook Air più potente di sempre. Chip M4 con CPU 10-core e GPU 10-core, 16GB di memoria unificata, fino a 18 ore di autonomia. Perfetto per lavoro, creatività e AI.',
  '1.329,00',
  'https://amzn.to/4vhSYcY',
  'https://m.media-amazon.com/images/I/71jG+e7roXL._AC_SL1500_.jpg',
  4.8,
  1240,
  'Tech',
  today
]);

// Deal 2: iPad Pro M4 — Today's Spotlight
await conn.execute(`
  INSERT INTO amazon_daily_deals 
  (title, description, price, affiliateUrl, imageUrl, rating, reviewCount, category, scheduledDate, active)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
`, [
  'Apple iPad Pro 11" con chip M4 — 256GB Wi-Fi',
  'Il tablet più avanzato di Apple. Display Ultra Retina XDR OLED tandem, chip M4, Apple Pencil Pro compatibile. Ideale per professionisti creativi e produttività AI.',
  '1.129,00',
  'https://amzn.to/4vhSYcY',
  'https://m.media-amazon.com/images/I/71N00VS+W8L._AC_SL1500_.jpg',
  4.7,
  890,
  'Tech',
  today
]);

console.log('✅ 2 deal Amazon inseriti per oggi:', today);
await conn.end();
process.exit(0);
