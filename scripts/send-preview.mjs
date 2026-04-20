/**
 * send-preview.mjs — Invia la preview newsletter di test
 * Uso: node scripts/send-preview.mjs
 */
import { createRequire } from "module";
import { pathToFileURL } from "url";
import { execSync } from "child_process";

// Usa tsx per eseguire il TypeScript
const result = execSync(
  `npx tsx -e "
    import('./server/unifiedNewsletter.ts').then(async (m) => {
      console.log('[Preview] Avvio invio preview...');
      const r = await m.sendUnifiedPreview();
      console.log('[Preview] Risultato:', JSON.stringify(r, null, 2));
      process.exit(0);
    }).catch((e) => {
      console.error('[Preview] Errore:', e.message);
      process.exit(1);
    });
  "`,
  {
    cwd: "/home/ubuntu/ideasmart",
    timeout: 120000,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  }
);
console.log(result);
