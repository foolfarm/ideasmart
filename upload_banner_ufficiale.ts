import { storagePut } from './server/storage';
import * as fs from 'fs';

const data = fs.readFileSync('/home/ubuntu/webdev-static-assets/fasteer_banner_ufficiale.png');
const { url } = await storagePut('fasteer_banner_ufficiale_guida.png', data, 'image/png');
console.log('CDN URL:', url);
