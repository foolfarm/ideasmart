import "dotenv/config";

const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.SENDGRID_FROM_EMAIL || "info@ideasmart.ai";
const fromName = process.env.SENDGRID_FROM_NAME || "Ideasmart Daily";

if (!apiKey) {
  console.error("SENDGRID_API_KEY non configurata");
  process.exit(1);
}

const html = `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Test Newsletter — Ideasmart Daily</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f2ec;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f2ec;padding:40px 0;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid rgba(26,26,26,0.1);">
  <tr>
    <td style="padding:32px 40px 24px;border-bottom:2px solid #1a1a1a;">
      <p style="margin:0;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(26,26,26,0.4);">Intelligence quotidiana su AI, Startup e Venture Capital</p>
      <h1 style="margin:8px 0 0;font-size:32px;font-weight:900;letter-spacing:-0.02em;color:#1a1a1a;">IDEASMART</h1>
    </td>
  </tr>
  <tr>
    <td style="background:#1a1a1a;padding:32px 40px;">
      <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.4);">Test invio</p>
      <h2 style="margin:0 0 12px;font-size:26px;font-weight:800;letter-spacing:-0.02em;color:#ffffff;line-height:1.2;">Newsletter di test</h2>
      <p style="margin:0;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.65);">Questa è una email di test per verificare che il nome mittente <strong style="color:#ffffff;">"${fromName}"</strong> appaia correttamente nella casella di posta.</p>
    </td>
  </tr>
  <tr>
    <td style="padding:36px 40px;">
      <p style="margin:0;font-size:14px;line-height:1.7;color:#374151;">
        <strong>Mittente:</strong> ${fromName} &lt;${fromEmail}&gt;<br>
        <strong>Data:</strong> ${new Date().toLocaleString("it-IT", { timeZone: "Europe/Rome" })}<br>
        <strong>Scopo:</strong> Verifica nome mittente newsletter
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding:20px 40px;border-top:1px solid rgba(26,26,26,0.08);background:#faf8f3;">
      <p style="margin:0;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(26,26,26,0.35);">
        © ${new Date().getFullYear()} IDEASMART · AI · Startup · Venture Capital
      </p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`;

const body = {
  personalizations: [{ to: [{ email: "ac@acinelli.com" }] }],
  from: { email: fromEmail, name: fromName },
  subject: "[TEST] Verifica nome mittente — Ideasmart Daily",
  content: [
    { type: "text/plain", value: `Questa è una email di test per verificare il nome mittente "${fromName}". Data: ${new Date().toLocaleString("it-IT", { timeZone: "Europe/Rome" })}` },
    { type: "text/html", value: html }
  ]
};

console.log(`Invio test a ac@acinelli.com come "${fromName}" <${fromEmail}>...`);

const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify(body)
});

if (res.status === 202) {
  console.log("✅ Email inviata con successo! Controlla la casella ac@acinelli.com");
} else {
  const err = await res.text();
  console.error(`❌ Errore SendGrid ${res.status}:`, err);
}
