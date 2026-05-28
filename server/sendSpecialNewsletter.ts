/**
 * ProofPress Special Newsletter — Dealroom Global Tech Ecosystem Index 2026
 * Script one-shot per invio newsletter speciale a un singolo indirizzo (test)
 * o a tutti gli iscritti attivi.
 */
import { sendEmail } from "./email";
import { getActiveSubscribers } from "./db";
import { sendWithWarmup } from "./newsletterWarmup";
import { notifyOwner } from "./_core/notification";

const RESEARCH_ID = 1800001;
const RESEARCH_URL = `https://proofpress.ai/research/${RESEARCH_ID}`;
const IMAGE_URL = "https://ideasmartai-uypaon6i.manus.space/manus-storage/dealroom_2026_cover_f3c1ef9b.jpg";

const TODAY = new Date().toLocaleDateString("it-IT", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function buildSpecialHtml(): string {
  const BG = "#0a0f1e";
  const WHITE = "#ffffff";
  const ACCENT = "#e8002d";
  const MUTED = "#8a8f9e";
  const CARD_BG = "#ffffff";
  const BORDER = "#e5e7eb";
  const F_SANS = "'DM Sans', Arial, sans-serif";
  const F_SERIF = "'Playfair Display', Georgia, serif";

  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ProofPress Special — Dealroom Global Tech Ecosystem Index 2026</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:${F_SANS};">

<!-- PREHEADER -->
<div style="display:none;max-height:0;overflow:hidden;color:#f5f5f5;font-size:1px;">
  325 città, 77 paesi, un solo report: chi comanda l'innovazione globale nel 2026.
</div>

<!-- WRAPPER -->
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;">
<tr><td align="center" style="padding:24px 16px;">

<!-- CONTAINER -->
<table width="680" cellpadding="0" cellspacing="0" style="max-width:680px;width:100%;background:${WHITE};border-radius:4px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

  <!-- HEADER DARK -->
  <tr>
    <td style="background:${BG};padding:32px 48px 24px;text-align:center;">
      <p style="margin:0 0 4px;font-family:${F_SANS};font-size:11px;letter-spacing:3px;color:${MUTED};text-transform:uppercase;">ProofPress</p>
      <h1 style="margin:0;font-family:${F_SERIF};font-size:36px;font-weight:900;color:${WHITE};letter-spacing:-1px;line-height:1.1;">SPECIAL REPORT</h1>
      <div style="width:48px;height:3px;background:${ACCENT};margin:12px auto 16px;"></div>
      <p style="margin:0;font-family:${F_SANS};font-size:13px;color:${MUTED};letter-spacing:1px;text-transform:uppercase;">${TODAY} &nbsp;·&nbsp; Edizione Speciale</p>
    </td>
  </tr>

  <!-- HERO IMAGE -->
  <tr>
    <td style="padding:0;position:relative;">
      <img src="${IMAGE_URL}" alt="Global Tech Ecosystem 2026" width="680" style="display:block;width:100%;max-width:680px;height:280px;object-fit:cover;" />
      <div style="background:linear-gradient(to top, rgba(10,15,30,0.85) 0%, transparent 100%);position:absolute;bottom:0;left:0;right:0;height:120px;"></div>
    </td>
  </tr>

  <!-- INTRO EDITORIALE -->
  <tr>
    <td style="padding:40px 48px 32px;">
      <p style="margin:0 0 6px;font-family:${F_SANS};font-size:11px;letter-spacing:3px;color:${ACCENT};text-transform:uppercase;font-weight:700;">DEALROOM GLOBAL TECH ECOSYSTEM INDEX 2026</p>
      <h2 style="margin:0 0 20px;font-family:${F_SERIF};font-size:28px;font-weight:900;color:#0a0f1e;line-height:1.2;">Chi comanda davvero l'innovazione globale — e dove si posiziona l'Europa</h2>
      <p style="margin:0 0 16px;font-family:${F_SANS};font-size:15px;color:#374151;line-height:1.7;">
        Il Dealroom Global Tech Ecosystem Index 2026 è il benchmark più completo mai prodotto sugli ecosistemi tech mondiali: <strong>325 città in 77 paesi</strong>, analizzate su quattro dimensioni — investimento, innovazione, talento e risultati. Non è una classifica di sentiment. È un sistema di misurazione quantitativo che ridisegna la mappa del potere tecnologico globale.
      </p>
      <p style="margin:0 0 24px;font-family:${F_SANS};font-size:15px;color:#374151;line-height:1.7;">
        La Bay Area mantiene il primato assoluto. London è #4 con <strong>$714 miliardi di enterprise value</strong> e 137 unicorni. Mumbai guida i Rising Stars con crescita degli unicorni di 1.8x. E l'AI sta ridisegnando le gerarchie: Tel Aviv è #6 globale nel settore, Toronto-Waterloo guadagna 7 posizioni, Munich sale di 13.
      </p>
    </td>
  </tr>

  <!-- DIVIDER -->
  <tr><td style="padding:0 48px;"><div style="height:1px;background:${BORDER};"></div></td></tr>

  <!-- KEY FINDINGS -->
  <tr>
    <td style="padding:32px 48px;">
      <p style="margin:0 0 20px;font-family:${F_SANS};font-size:11px;letter-spacing:3px;color:${MUTED};text-transform:uppercase;font-weight:700;">I DATI CHE CONTANO</p>

      <!-- Finding 1 -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr>
          <td width="4" style="background:${ACCENT};border-radius:2px;">&nbsp;</td>
          <td style="padding-left:16px;">
            <p style="margin:0 0 4px;font-family:${F_SANS};font-size:13px;font-weight:700;color:#0a0f1e;text-transform:uppercase;letter-spacing:1px;">GLOBAL CHAMPIONS</p>
            <p style="margin:0;font-family:${F_SANS};font-size:14px;color:#374151;line-height:1.6;">Bay Area #1, New York #2, Boston #3, <strong>London #4 con $714B EV e 137 unicorni</strong>. Austin (#6), Seoul (#10) e Bengaluru (#12) costruiscono ecosistemi di scala reale.</p>
          </td>
        </tr>
      </table>

      <!-- Finding 2 -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr>
          <td width="4" style="background:#0a0f1e;border-radius:2px;">&nbsp;</td>
          <td style="padding-left:16px;">
            <p style="margin:0 0 4px;font-family:${F_SANS};font-size:13px;font-weight:700;color:#0a0f1e;text-transform:uppercase;letter-spacing:1px;">DENSITY LEADERS</p>
            <p style="margin:0;font-family:${F_SANS};font-size:14px;color:#374151;line-height:1.6;"><strong>Cambridge UK #3 globale</strong> con $264B EV per milione di abitanti — il triplo di Stoccolma. Ghent, Tallinn e Lausanne nella top 10 globale per densità.</p>
          </td>
        </tr>
      </table>

      <!-- Finding 3 -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr>
          <td width="4" style="background:#059669;border-radius:2px;">&nbsp;</td>
          <td style="padding-left:16px;">
            <p style="margin:0 0 4px;font-family:${F_SANS};font-size:13px;font-weight:700;color:#0a0f1e;text-transform:uppercase;letter-spacing:1px;">RISING STARS</p>
            <p style="margin:0;font-family:${F_SANS};font-size:14px;color:#374151;line-height:1.6;"><strong>Mumbai #1 globale</strong> con $241B EV e costo vita al 26% di NYC. Johannesburg cresce 11.1x in EV dal 2019. Istanbul #3 globale, Kyiv #2 in Europa.</p>
          </td>
        </tr>
      </table>

      <!-- Finding 4 -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:0;">
        <tr>
          <td width="4" style="background:#7c3aed;border-radius:2px;">&nbsp;</td>
          <td style="padding-left:16px;">
            <p style="margin:0 0 4px;font-family:${F_SANS};font-size:13px;font-weight:700;color:#0a0f1e;text-transform:uppercase;letter-spacing:1px;">AI SECTOR</p>
            <p style="margin:0;font-family:${F_SANS};font-size:14px;color:#374151;line-height:1.6;"><strong>Tel Aviv #6 globale nell'AI</strong>, Toronto-Waterloo +7 posizioni, Munich +13. L'AI ridisegna le gerarchie: chi non è nella top 20 AI oggi, non sarà nella top 10 generale domani.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- DIVIDER -->
  <tr><td style="padding:0 48px;"><div style="height:1px;background:${BORDER};"></div></td></tr>

  <!-- EUROPA E ITALIA -->
  <tr>
    <td style="padding:32px 48px;">
      <p style="margin:0 0 16px;font-family:${F_SANS};font-size:11px;letter-spacing:3px;color:${MUTED};text-transform:uppercase;font-weight:700;">EUROPA E ITALIA</p>
      <p style="margin:0 0 16px;font-family:${F_SANS};font-size:15px;color:#374151;line-height:1.7;">
        In Europa, la classifica Global Champions vede <strong>London, Paris, Stockholm, Berlin e Munich</strong> nei top 5. La Francia ha 11 città nell'indice globale. La Svezia ha costruito un flywheel di reinvestimento che la rende il benchmark per gli ecosistemi di media dimensione.
      </p>
      <p style="margin:0 0 0;font-family:${F_SANS};font-size:15px;color:#374151;line-height:1.7;">
        <strong>Milano e Torino</strong> sono nella mappa degli unicorn cities europei e Milano appare tra i Rising Stars europei — segnale di traiettoria positiva. Il gap con i leader continentali è misurabile e richiede interventi strutturali: accesso al capitale di rischio, linkage università-impresa, attrazione di talento internazionale.
      </p>
    </td>
  </tr>

  <!-- SPONSOR: PROMPT COLLECTION 2026 -->
  <tr><td style="padding:0 48px;"><div style="height:1px;background:${BORDER};"></div></td></tr>
  <tr>
    <td style="padding:28px 48px;">
      <p style="margin:0 0 14px;font-family:${F_SANS};font-size:10px;letter-spacing:3px;color:${MUTED};text-transform:uppercase;font-weight:600;">SPONSOR OF THE DAY</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:6px;overflow:hidden;">
        <!-- Immagine hero -->
        <tr>
          <td style="padding:0;">
            <a href="https://promptcollection2026.com?utm_source=newsletter&utm_medium=email&utm_campaign=proofpress-special" style="display:block;text-decoration:none;">
              <img src="https://ideasmartai-uypaon6i.manus.space/manus-storage/promptcollection_banner_0b099480.jpg" alt="Prompt Collection 2026" width="584" style="display:block;width:100%;max-height:200px;object-fit:cover;border-radius:6px 6px 0 0;" />
            </a>
          </td>
        </tr>
        <!-- Testo + CTA su sfondo dark -->
        <tr>
          <td style="background:#0a0f1e;padding:28px 32px 32px;border-radius:0 0 6px 6px;">
            <p style="margin:0 0 6px;font-family:${F_SANS};font-size:10px;letter-spacing:3px;color:#e8002d;text-transform:uppercase;font-weight:700;">PROMPT COLLECTION 2026</p>
            <h3 style="margin:0 0 10px;font-family:${F_SERIF};font-size:26px;font-weight:900;color:#ffffff;line-height:1.15;">Smetti di perdere tempo<br>a scrivere prompt.</h3>
            <p style="margin:0 0 22px;font-family:${F_SANS};font-size:13px;color:#8a8f9e;line-height:1.7;">500+ prompt testati e pronti all'uso per founder, marketer e team AI.<br>Copia, incolla, ottieni risultati in 30 secondi. Zero abbonamenti.</p>
            <a href="https://promptcollection2026.com?utm_source=newsletter&utm_medium=email&utm_campaign=proofpress-special" style="display:inline-block;background:#e8002d;color:#ffffff;font-family:${F_SANS};font-size:13px;font-weight:800;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:15px 36px;border-radius:3px;">SCARICA ORA &mdash; &Egrave; GRATIS &nbsp;&#8594;</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr><td style="padding:0 48px;"><div style="height:1px;background:${BORDER};"></div></td></tr>

  <!-- CTA PRINCIPALE -->
  <tr>
    <td style="padding:8px 48px 40px;text-align:center;">
      <a href="${RESEARCH_URL}" style="display:inline-block;background:${ACCENT};color:${WHITE};font-family:${F_SANS};font-size:14px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;padding:16px 40px;border-radius:2px;">Leggi l'analisi completa su ProofPress →</a>
      <p style="margin:16px 0 0;font-family:${F_SANS};font-size:12px;color:${MUTED};">Analisi editoriale ProofPress · Certificato ProofPress Verify Technology</p>
    </td>
  </tr>

  <!-- DIVIDER -->
  <tr><td style="padding:0 48px;"><div style="height:1px;background:${BORDER};"></div></td></tr>

  <!-- CITAZIONE + PROOFPRESS VERIFY -->
  <tr>
    <td style="padding:32px 48px;background:#f9fafb;">
      <!-- Citazione -->
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="border-left:3px solid ${ACCENT};padding-left:20px;">
            <p style="margin:0 0 10px;font-family:${F_SERIF};font-size:18px;color:#0a0f1e;line-height:1.6;font-style:italic;">
              &ldquo;Il contenuto certificato non è una scelta editoriale &mdash; è una posizione strategica. Chi costruisce oggi l&rsquo;infrastruttura di certificazione si posiziona su tre vettori simultanei: difesa legale, revenue da AI e premium pubblicitario.&rdquo;
            </p>
            <p style="margin:0;font-family:${F_SANS};font-size:12px;color:${MUTED};font-weight:600;">— Adrian Lenice, Fondatore ProofPress.AI</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <!-- PROOFPRESS VERIFY BLOCK -->
  <tr>
    <td style="padding:0 48px 40px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f1e;border-radius:6px;">
        <tr>
          <td style="padding:28px 32px;">
            <p style="margin:0 0 4px;font-family:${F_SANS};font-size:10px;letter-spacing:3px;color:#e8002d;text-transform:uppercase;font-weight:700;">PROOFPRESS VERIFY&trade;</p>
            <h3 style="margin:0 0 12px;font-family:${F_SERIF};font-size:22px;font-weight:900;color:#ffffff;line-height:1.2;">Il futuro dell&rsquo;informazione<br>è la notizia certificata.</h3>
            <p style="margin:0 0 18px;font-family:${F_SANS};font-size:13px;color:#8a8f9e;line-height:1.7;">ProofPress Verify è il sistema che imprime un codice crittografico su ogni contenuto &mdash; articolo, report, comunicato, output di Agent AI. Ogni informazione diventa tracciabile, verificabile e monetizzabile quando citata da un modello AI.</p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:12px;">
                  <a href="https://proofpressverify.com?utm_source=newsletter&utm_medium=email&utm_campaign=proofpress-special" style="display:inline-block;background:#e8002d;color:#ffffff;font-family:${F_SANS};font-size:12px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;padding:13px 28px;border-radius:3px;">Scopri come funziona &nbsp;&#8594;</a>
                </td>
                <td>
                  <a href="https://proofpressverify.com/certifica?utm_source=newsletter&utm_medium=email&utm_campaign=proofpress-special" style="display:inline-block;background:transparent;color:#ffffff;font-family:${F_SANS};font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;padding:13px 28px;border-radius:3px;border:1px solid rgba(255,255,255,0.25);">Certifica la tua informazione &nbsp;&#8594;</a>
                </td>
              </tr>
            </table>
            <p style="margin:16px 0 0;font-family:${F_SANS};font-size:11px;color:#555c6e;line-height:1.5;">Disponibile per aziende, editori, studi legali e Agent AI. &mdash; <a href="https://proofpressverify.com" style="color:#e8002d;text-decoration:none;">proofpressverify.com</a></p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="background:${BG};padding:28px 48px;text-align:center;">
      <p style="margin:0 0 8px;font-family:${F_SERIF};font-size:18px;font-weight:900;color:${WHITE};letter-spacing:2px;">PROOFPRESS</p>
      <p style="margin:0 0 12px;font-family:${F_SANS};font-size:11px;color:${MUTED};letter-spacing:2px;text-transform:uppercase;">Agentic Certified Journalism Platform</p>
      <p style="margin:0;font-family:${F_SANS};font-size:12px;color:${MUTED};">
        <a href="https://proofpress.ai" style="color:${MUTED};text-decoration:none;">proofpress.ai</a>
        &nbsp;·&nbsp;
        <a href="https://proofpress.ai/unsubscribe" style="color:${MUTED};text-decoration:none;">Cancella iscrizione</a>
      </p>
    </td>
  </tr>

</table>
<!-- END CONTAINER -->

</td></tr>
</table>
<!-- END WRAPPER -->

</body>
</html>`;
}

async function sendSpecialNewsletter(toEmail: string): Promise<void> {
  const subject = `PROOFPRESS SPECIAL — Dealroom Global Tech Ecosystem Index 2026: chi comanda l'innovazione globale`;
  const html = buildSpecialHtml();

  console.log(`[SpecialNewsletter] Invio a ${toEmail}...`);
  const result = await sendEmail({
    sender: 'daily',
    to: toEmail,
    subject,
    html,
  });

  if (result.success) {
    console.log(`[SpecialNewsletter] ✅ Inviata con successo a ${toEmail}`);
  } else {
    console.error(`[SpecialNewsletter] ❌ Errore: ${result.error}`);
    process.exit(1);
  }
}

export async function sendSpecialNewsletterAll(): Promise<void> {
  const subject = `PROOFPRESS SPECIAL — Dealroom Global Tech Ecosystem Index 2026: chi comanda l'innovazione globale`;
  const html = buildSpecialHtml();
  const BASE_URL = "https://proofpress.ai";

  const subscribers = await getActiveSubscribers();
  if (subscribers.length === 0) {
    console.log(`[SpecialNewsletter] Nessun iscritto attivo trovato.`);
    return;
  }
  console.log(`[SpecialNewsletter] Invio a ${subscribers.length} iscritti attivi...`);

  const warmupResult = await sendWithWarmup(
    subscribers,
    async (sub) => {
      const unsubUrl = sub.unsubscribeToken
        ? `${BASE_URL}/unsubscribe?token=${sub.unsubscribeToken}`
        : `${BASE_URL}/unsubscribe`;
      const personalizedHtml = html.replace(`${BASE_URL}/unsubscribe`, unsubUrl);
      return sendEmail({
        sender: 'daily',
        to: sub.email,
        subject,
        html: personalizedHtml,
        listUnsubscribeUrl: unsubUrl,
      });
    },
    '[SpecialNewsletter]'
  );

  const totalSent = warmupResult.totalSent;
  console.log(`[SpecialNewsletter] ✅ ${totalSent}/${subscribers.length} inviati`);

  await notifyOwner({
    title: `📧 ProofPress Special inviata — Dealroom 2026`,
    content: `Newsletter speciale inviata a ${totalSent}/${subscribers.length} iscritti.`,
  });
}

// Esegui
const arg = process.argv[2];
if (arg === '--all') {
  sendSpecialNewsletterAll().catch(console.error);
} else {
  const target = arg || "ac@acinelli.com";
  sendSpecialNewsletter(target).catch(console.error);
}
