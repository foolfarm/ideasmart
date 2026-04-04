import 'dotenv/config';
import { execSync } from 'child_process';

const key = process.env.SENDGRID_API_KEY;
if (!key) {
  console.error("SENDGRID_API_KEY non trovato");
  process.exit(1);
}

try {
  const output = execSync('python3 /home/ubuntu/sendgrid_stats.py', {
    env: { ...process.env, SENDGRID_API_KEY: key },
    encoding: 'utf-8',
    timeout: 30000,
  });
  console.log(output);
} catch (err) {
  console.error(err.stdout || err.message);
}
