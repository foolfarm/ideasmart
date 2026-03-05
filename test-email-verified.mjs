/**
 * Test invio email IDEASMART con mittente verificato ac@foolfarm.com
 */
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.SENDGRID_API_KEY;
const TO_EMAIL = "ac@foolfarm.com";

// Usa mittente verificato
const FROM_EMAIL = "ac@foolfarm.com";
const FROM_NAME = "IDEASMART — AI for Business";

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>IDEASMART Newsletter — Test</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:#0a1628;padding:32px 40px;text-align:center;">
              <div style="font-size:32px;font-weight:900;letter-spacing:-1px;color:#ffffff;">
                IDEA<span style="color:#00b4a0;">SMART</span>
              </div>
              <div style="font-size:11px;letter-spacing:3px;color:#8899aa;margin-top:6px;text-transform:uppercase;">
                AI for Business · Osservatorio sull'Innovazione
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="font-size:14px;color:#666;margin:0 0 8px 0;text-transform:uppercase;letter-spacing:2px;font-weight:600;">
                📧 EMAIL DI TEST
              </p>
              <h1 style="font-size:26px;color:#0a1628;margin:0 0 20px 0;line-height:1.3;">
                Benvenuto nella newsletter IDEASMART
              </h1>
              <p style="font-size:16px;color:#444;line-height:1.7;margin:0 0 16px 0;">
                Ciao Andrea,
              </p>
              <p style="font-size:16px;color:#444;line-height:1.7;margin:0 0 16px 0;">
                Questa è un'email di test per verificare che il sistema di invio newsletter di <strong>IDEASMART — AI for Business</strong> funzioni correttamente.
              </p>
              <p style="font-size:16px;color:#444;line-height:1.7;margin:0 0 24px 0;">
                Il sistema è configurato per inviare ogni settimana le <strong>10 notizie più importanti</strong> nel mondo dell'AI e delle startup italiane a <strong>1.857 iscritti</strong>.
              </p>

              <!-- Stats box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafb;border-radius:8px;margin:0 0 24px 0;">
                <tr>
                  <td style="padding:20px;text-align:center;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="text-align:center;padding:0 10px;">
                          <div style="font-size:28px;font-weight:900;color:#00b4a0;">1.857</div>
                          <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Iscritti</div>
                        </td>
                        <td style="text-align:center;padding:0 10px;border-left:1px solid #e0e0e0;">
                          <div style="font-size:28px;font-weight:900;color:#0a1628;">4</div>
                          <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Startup analizzate</div>
                        </td>
                        <td style="text-align:center;padding:0 10px;border-left:1px solid #e0e0e0;">
                          <div style="font-size:28px;font-weight:900;color:#ff5500;">10</div>
                          <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">News settimanali</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="font-size:14px;color:#888;line-height:1.6;margin:0 0 24px 0;padding:16px;background:#fff8f0;border-left:3px solid #ff5500;border-radius:0 8px 8px 0;">
                <strong>Nota tecnica:</strong> Il mittente utilizzato per questo test è <code>ac@foolfarm.com</code> (verificato). 
                Per usare <code>newsletter@ideasmart.it</code> come mittente ufficiale, è necessario verificarlo su SendGrid.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:#00b4a0;border-radius:8px;">
                    <a href="https://ideasmart.ai" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.5px;">
                      Visita IDEASMART →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafb;padding:24px 40px;text-align:center;border-top:1px solid #eee;">
              <p style="font-size:12px;color:#aaa;margin:0 0 8px 0;">
                <strong style="color:#666;">IDEASMART — AI for Business</strong><br>
                Osservatorio sull'Innovazione AI Italiana
              </p>
              <p style="font-size:11px;color:#bbb;margin:0;">
                Hai ricevuto questa email perché sei iscritto alla newsletter IDEASMART.<br>
                <a href="#" style="color:#00b4a0;">Disiscriviti</a> · <a href="#" style="color:#00b4a0;">Aggiorna preferenze</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

console.log("═══════════════════════════════════════════════");
console.log("📤 TEST INVIO EMAIL IDEASMART");
console.log("═══════════════════════════════════════════════");
console.log(`Da:  ${FROM_NAME} <${FROM_EMAIL}>`);
console.log(`A:   ${TO_EMAIL}`);
console.log(`Oggetto: [TEST] IDEASMART Newsletter — Sistema attivo`);
console.log("");

const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    personalizations: [{ to: [{ email: TO_EMAIL }] }],
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: "[TEST] IDEASMART Newsletter — Sistema attivo ✅",
    content: [{ type: "text/html", value: htmlContent }],
  }),
});

if (response.ok || response.status === 202) {
  console.log(`✅ EMAIL INVIATA CON SUCCESSO! (Status: ${response.status})`);
  console.log(`📬 Controlla la casella di ${TO_EMAIL}`);
} else {
  const body = await response.json();
  console.log(`❌ Errore invio (Status: ${response.status})`);
  console.log("Dettagli:", JSON.stringify(body, null, 2));
}
console.log("═══════════════════════════════════════════════");
