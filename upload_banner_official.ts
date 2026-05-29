/**
 * Script one-shot: carica il banner ufficiale Fasteer su S3 e stampa l'URL pubblico
 */
import { readFileSync } from 'fs';
import { storagePut } from './server/storage';

const filePath = '/home/ubuntu/upload/banner_guida_definitiva.png';
const fileBuffer = readFileSync(filePath);
const key = `banners/fasteer_guida_definitiva_ufficiale.png`;

const { url } = await storagePut(key, fileBuffer, 'image/png');
console.log('URL pubblico:', url);
