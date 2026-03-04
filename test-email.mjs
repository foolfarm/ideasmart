import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.SENDGRID_FROM_EMAIL || "newsletter@ideasmart.it";
const fromName = process.env.SENDGRID_FROM_NAME || "IDEASMART — AI for Business";

if (!apiKey) {
  console.error("❌ SENDGRID_API_KEY not set");
  process.exit(1);
}

console.log(`📧 Sending test email via SendGrid...`);
console.log(`   From: ${fromName} <${fromEmail}>`);
console.log(`   To: ac@foolfarm.com`);

const html = `<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"><title>IDEASMART Test</title></head>
<body style="margin:0;padding:0;background:#0a0f1e;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f1e;">
  <tr><td align="center" style="padding:20px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr>
        <td style="background:#060a14;padding:10px 24px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.08);">
          <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.3);font-family:Arial,sans-serif;letter-spacing:0.08em;text-transform:uppercase;">STARTUP DI TECNOLOGIA E INNOVAZIONE · AI FOR BUSINESS</p>
        </td>
      </tr>
      <tr>
        <td style="background:#0a0f1e;padding:32px 24px;text-align:center;border-bottom:2px solid #00e5c8;">
          <h1 style="margin:0 0 6px 0;font-size:44px;font-weight:900;color:#ffffff;font-family:Arial,sans-serif;">IDEA<span style="color:#00e5c8;">SMART</span></h1>
          <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.4);letter-spacing:0.15em;text-transform:uppercase;font-family:Arial,sans-serif;">AI for Business · Test Email</p>
        </td>
      </tr>
      <tr>
        <td style="background:#0d1220;padding:24px;">
          <p style="margin:0 0 12px 0;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#00e5c8;font-family:Arial,sans-serif;">◆ Email di Test</p>
          <p style="margin:0 0 12px 0;font-size:15px;color:rgba(255,255,255,0.8);line-height:1.6;font-family:Arial,sans-serif;">
            Ciao Andrea,<br><br>
            Questa è una <strong style="color:#ffffff;">email di test</strong> del sistema newsletter <strong style="color:#00e5c8;">IDEASMART — AI for Business</strong>.
          </p>
          <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.65);line-height:1.6;font-family:Arial,sans-serif;">
            Il sistema è configurato correttamente e pronto per inviare le newsletter settimanali con le <strong style="color:#ffffff;">Top 20 notizie AI</strong> generate automaticamente dall'intelligenza artificiale.
          </p>
        </td>
      </tr>
      <tr>
        <td style="background:#00e5c8;padding:10px 24px;">
          <p style="margin:0;font-size:11px;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;color:#0a0f1e;font-family:Arial,sans-serif;">STARTUP ANALIZZATE QUESTO MESE</p>
        </td>
      </tr>
      <tr>
        <td style="background:#0a0f1e;padding:20px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
                <p style="margin:0 0 4px 0;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#00e5c8;font-family:Arial,sans-serif;">AI Recruiting</p>
                <p style="margin:0;font-size:14px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">FoolTalent — fooltalent.com</p>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
                <p style="margin:0 0 4px 0;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#0066ff;font-family:Arial,sans-serif;">Data Room &amp; Fundraising</p>
                <p style="margin:0;font-size:14px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">FoolShare — foolshare.xyz</p>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
                <p style="margin:0 0 4px 0;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#00e5c8;font-family:Arial,sans-serif;">Cybersecurity</p>
                <p style="margin:0;font-size:14px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">Fragmentalis — fragmentalis.com</p>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 0;">
                <p style="margin:0 0 4px 0;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#ff5500;font-family:Arial,sans-serif;">Market Intelligence</p>
                <p style="margin:0;font-size:14px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">PollCast — pollcast.online</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="background:#0d1220;padding:24px;text-align:center;border-top:1px solid rgba(255,255,255,0.08);">
          <a href="https://ideasmart.manus.space" style="display:inline-block;padding:12px 28px;background:#00e5c8;color:#0a0f1e;font-size:13px;font-weight:700;text-decoration:none;border-radius:8px;font-family:Arial,sans-serif;">Visita IDEASMART →</a>
        </td>
      </tr>
      <tr>
        <td style="background:#060a14;padding:16px 24px;text-align:center;border-top:1px solid rgba(255,255,255,0.08);">
          <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.25);font-family:Arial,sans-serif;">© 2026 IDEASMART — Startup di Tecnologia &amp; Innovazione. Tutti i diritti riservati.</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

const body = {
  personalizations: [{ to: [{ email: "ac@foolfarm.com" }] }],
  from: { email: fromEmail, name: fromName },
  subject: "[TEST] IDEASMART — AI for Business | Sistema Newsletter Attivo",
  content: [{ type: "text/html", value: html }],
};

try {
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (response.status === 202) {
    console.log("✅ Email inviata con successo! Status: 202 Accepted");
    console.log("   Controlla la casella ac@foolfarm.com");
  } else {
    const errorText = await response.text();
    console.error(`❌ SendGrid error ${response.status}:`, errorText);
    process.exit(1);
  }
} catch (err) {
  console.error("❌ Network error:", err.message);
  process.exit(1);
}
