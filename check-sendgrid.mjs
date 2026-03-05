/**
 * Verifica stato account SendGrid: API key, mittenti verificati, limiti
 */
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;
const FROM_NAME = process.env.SENDGRID_FROM_NAME;

console.log("═══════════════════════════════════════════════");
console.log("🔍 VERIFICA CONFIGURAZIONE SENDGRID");
console.log("═══════════════════════════════════════════════");
console.log(`📧 FROM_EMAIL: ${FROM_EMAIL}`);
console.log(`👤 FROM_NAME:  ${FROM_NAME}`);
console.log(`🔑 API_KEY:    ${API_KEY ? API_KEY.substring(0, 12) + "..." : "NON TROVATA"}`);
console.log("");

if (!API_KEY) {
  console.error("❌ SENDGRID_API_KEY non configurata!");
  process.exit(1);
}

// 1. Verifica API key (user info)
console.log("1️⃣  Verifica validità API key...");
const userRes = await fetch("https://api.sendgrid.com/v3/user/profile", {
  headers: { Authorization: `Bearer ${API_KEY}` },
});
if (userRes.ok) {
  const user = await userRes.json();
  console.log(`   ✅ API key valida — Account: ${user.email || "N/A"} (${user.first_name || ""} ${user.last_name || ""})`);
} else {
  const err = await userRes.json();
  console.log(`   ❌ API key NON valida — Status: ${userRes.status}`);
  console.log(`   Errore: ${JSON.stringify(err)}`);
}

// 2. Verifica mittenti Single Sender verificati
console.log("\n2️⃣  Verifica mittenti Single Sender verificati...");
const sendersRes = await fetch("https://api.sendgrid.com/v3/verified_senders", {
  headers: { Authorization: `Bearer ${API_KEY}` },
});
if (sendersRes.ok) {
  const data = await sendersRes.json();
  const senders = data.results || [];
  if (senders.length === 0) {
    console.log("   ⚠️  Nessun mittente Single Sender verificato trovato");
  } else {
    console.log(`   ✅ ${senders.length} mittente/i trovato/i:`);
    senders.forEach(s => {
      const verified = s.verified ? "✅ VERIFICATO" : "⏳ IN ATTESA";
      console.log(`      ${verified} — ${s.from_email} (${s.from_name || "N/A"})`);
    });
  }
} else {
  const err = await sendersRes.json();
  console.log(`   ❌ Errore verifica senders: ${JSON.stringify(err)}`);
}

// 3. Verifica Domain Authentication
console.log("\n3️⃣  Verifica Domain Authentication...");
const domainRes = await fetch("https://api.sendgrid.com/v3/whitelabel/domains", {
  headers: { Authorization: `Bearer ${API_KEY}` },
});
if (domainRes.ok) {
  const domains = await domainRes.json();
  if (!domains || domains.length === 0) {
    console.log("   ⚠️  Nessun dominio autenticato trovato");
  } else {
    console.log(`   ✅ ${domains.length} dominio/i autenticato/i:`);
    domains.forEach(d => {
      const valid = d.valid ? "✅ VALIDO" : "⚠️  NON VALIDO";
      console.log(`      ${valid} — ${d.domain}`);
    });
  }
} else {
  console.log(`   ❌ Errore: ${domainRes.status}`);
}

// 4. Verifica piano e limiti
console.log("\n4️⃣  Verifica piano account...");
const planRes = await fetch("https://api.sendgrid.com/v3/user/account", {
  headers: { Authorization: `Bearer ${API_KEY}` },
});
if (planRes.ok) {
  const plan = await planRes.json();
  console.log(`   ✅ Piano: ${plan.plan_name || "N/A"} — Tipo: ${plan.type || "N/A"}`);
} else {
  console.log(`   ⚠️  Info piano non disponibili`);
}

console.log("\n═══════════════════════════════════════════════");
console.log("📋 RIEPILOGO");
console.log("═══════════════════════════════════════════════");
console.log(`Mittente configurato: ${FROM_EMAIL}`);
console.log("Se il mittente NON è verificato, l'invio fallirà con errore 403.");
console.log("Soluzione: verificare il mittente su https://app.sendgrid.com/settings/sender_auth");
console.log("═══════════════════════════════════════════════");
