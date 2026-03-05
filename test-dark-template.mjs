import { buildMonthlyNewsletterHtml } from "./server/email.ts";

// Notizie di test
const testNews = [
  { category: "Modelli Generativi", title: "OpenAI lancia GPT-5.3 Instant: -26.8% di allucinazioni", summary: "Il modello più usato di OpenAI riduce le allucinazioni del 26,8% sulle query web. GPT-5.2 Instant verrà ritirato il 3 giugno 2026.", url: "https://venturebeat.com", source: "VentureBeat" },
  { category: "AI & Difesa", title: "Anthropic vs. Pentagono: Claude rifiuta le richieste militari", summary: "Dario Amodei difende la posizione: \"Siamo patrioti, ma esistono linee rosse.\"", url: "https://cbsnews.com", source: "CBS News" },
  { category: "AI Agentiva", title: "Deloitte: nel 2026 il 40% delle app aziendali sarà AI-driven", summary: "Nuovi ruoli emergono: AI Operations Manager e Human-AI Interaction Designer.", url: "https://deloitte.com", source: "Deloitte Global" },
  { category: "Big Tech", title: "Google lancia Flash-Lite: Gemini 3.1 punta sull'enterprise scale", summary: "La battaglia tra i modelli si sposta dalla qualità dei benchmark alla scalabilità operativa.", url: "https://theneurondaily.com", source: "The Neuron Daily" },
  { category: "Robot & AI Fisica", title: "La Cina accelera: robot umanoidi e agenti AI nelle fabbriche", summary: "Obiettivo: robot umanoidi in produzione di massa entro il 2027.", url: "https://scmp.com", source: "South China Morning Post" },
  { category: "Startup & Funding", title: "Anthropic raggiunge $20 miliardi di revenue run rate", summary: "Claude Code vale 2,5 miliardi e il 4% di tutto il codice su GitHub.", source: "Analisi Finanziaria" },
  { category: "AI & Hardware", title: "Qualcomm al MWC 2026: l'AI ibrida arriva su ogni dispositivo", summary: "Nuova generazione Snapdragon con AI on-device/cloud senza dipendenza dal cloud.", source: "La Repubblica" },
  { category: "AI & Startup Italiane", title: "Deep Tech Revolution: 5 startup italiane ricevono €200k ciascuna", summary: "Metà cash, metà servizi per sviluppare tecnologie deep tech con componente AI.", source: "Il Messaggero" },
  { category: "Internazionalizzazione", title: "Call4Innovit 2026: startup italiane a Silicon Valley a fondo perduto", summary: "Programma gratuito per portare startup e PMI italiane nel mercato americano.", source: "Incentivi Impresa" },
  { category: "Ricerca & Innovazione", title: "MIT Sloan: \"L'AI agentiva non è ancora pronta per il prime time\"", summary: "La bolla AI si sgonfierà, ma l'AI generativa diventerà infrastruttura enterprise.", source: "MIT Sloan Management Review" },
];

const html = buildMonthlyNewsletterHtml({
  month: "Marzo 2026",
  issueNumber: "03",
  news: testNews,
});

// Invia via SendGrid
const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = "ac@foolfarm.com";
const fromName = "IDEASMART — AI for Business";

const body = {
  personalizations: [{ to: [{ email: "ac@foolfarm.com" }] }],
  from: { email: fromEmail, name: fromName },
  subject: "IDEASMART — AI for Business · N° 03 · Marzo 2026 [TEST TEMPLATE DARK]",
  content: [{ type: "text/html", value: html }],
};

const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

if (response.status === 202) {
  console.log("✅ Email inviata con successo con il template dark ufficiale!");
  console.log("📧 Destinatario: ac@foolfarm.com");
  console.log("📋 Template: Dark Editorial (sfondo navy #0a0f1e)");
} else {
  const err = await response.text();
  console.error("❌ Errore:", response.status, err);
}
