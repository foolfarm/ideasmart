/**
 * send-newsletter-manual.mjs
 * Invia manualmente la newsletter AI4Business di oggi a tutti gli iscritti.
 * Uso: node scripts/send-newsletter-manual.mjs
 */

import { SignJWT } from "jose";
import { readFileSync } from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// Legge le variabili d'ambiente dal .env se disponibile
try {
  const dotenv = require("dotenv");
  dotenv.config();
} catch {}

const JWT_SECRET = process.env.JWT_SECRET;
const OWNER_OPEN_ID = process.env.OWNER_OPEN_ID;
const PORT = process.env.PORT || "3000";
const BASE_URL = `http://localhost:${PORT}`;

if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET non disponibile");
  process.exit(1);
}

async function getAdminToken() {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const appId = process.env.VITE_APP_ID || "ideasmart";
  const token = await new SignJWT({
    openId: OWNER_OPEN_ID || "admin",
    appId: appId,
    name: "Andrea",
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
  return token;
}

async function sendNewsletterManual(channelKey = "ai") {
  const token = await getAdminToken();

  console.log(`📧 Invio newsletter manuale — canale: ${channelKey}`);
  console.log(`🔗 Server: ${BASE_URL}`);

  const body = JSON.stringify({
    json: {
      channelKey,
      testOnly: false,
    },
  });

  const res = await fetch(`${BASE_URL}/api/trpc/admin.sendChannelNewsletter`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `app_session_id=${token}`,
    },
    body,
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error("❌ Risposta non JSON:", text.slice(0, 500));
    process.exit(1);
  }

  // tRPC v11 risponde con { result: { data: { json: ... } } } o { error: { json: ... } }
  const result = data?.result?.data?.json;
  const error = data?.error?.json;

  if (result) {
    if (result.success) {
      console.log(`✅ Newsletter "${result.channel}" inviata con successo!`);
      console.log(`   Destinatari: ${result.recipientCount}`);
      console.log(`   Notizie:     ${result.newsCount}`);
      console.log(`   Oggetto:     ${result.subject}`);
    } else {
      console.error(`❌ Errore: ${result.error}`);
    }
  } else if (error) {
    console.error("❌ Errore tRPC:", JSON.stringify(error, null, 2).slice(0, 500));
  } else {
    console.log("Risposta raw:", JSON.stringify(data, null, 2).slice(0, 1000));
  }
}

sendNewsletterManual("ai").catch(console.error);
