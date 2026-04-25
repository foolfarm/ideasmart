/*
 * EMAIL VERIFY — Estensione 03 di ProofPress Verify™
 * Landing B2B completa — 12 sezioni
 * Framing: catena di custodia post-invio, NON sicurezza in transit
 * Target: Newsletter editoriali, IR, Compliance, Brand, Email transazionali
 */
import { useState, useRef } from "react";
import { Link } from "wouter";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import LeftSidebar from "@/components/LeftSidebar";
import ContactForm from "@/components/ContactForm";
import SEOHead from "@/components/SEOHead";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const GREEN = "#00b894";

function Section({ children, bg = "transparent", id }: { children: React.ReactNode; bg?: string; id?: string }) {
  return (
    <section id={id} className="py-20 md:py-28" style={{ background: bg }}>
      <div className="max-w-5xl mx-auto px-5 md:px-8">{children}</div>
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] mb-4"
      style={{ color: "rgba(10,10,10,0.4)", fontFamily: FONT }}
    >
      {children}
    </span>
  );
}

function Divider() {
  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8">
      <div className="border-t border-[#0a0a0a]/8" />
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#0a0a0a]/8 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left"
      >
        <span className="text-base font-bold text-[#0a0a0a]" style={{ fontFamily: FONT }}>{q}</span>
        <span className="flex-shrink-0 text-xl font-light text-[#0a0a0a]/30 mt-0.5">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="pb-5">
          <p className="text-sm leading-relaxed text-[#0a0a0a]/65">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function EmailVerify() {
  const contactRef = useRef<HTMLDivElement>(null);
  const scrollToContact = () => contactRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="flex min-h-screen">
      <LeftSidebar />
      <div className="flex-1 min-w-0">
        <SEOHead
          title="Email Verify — Catena di custodia crittografica per newsletter e comunicazioni email ad alto valore"
          description="Email Verify certifica newsletter, comunicazioni finanziarie e email istituzionali con hash SHA-256 e IPFS. Prova crittografica che il contenuto non è stato alterato dopo l'invio. Compliance eIDAS 2.0, GDPR, MAR."
          canonical="https://proofpress.ai/proofpress-verify/email"
          ogSiteName="Proof Press"
        />
        <div className="min-h-screen" style={{ background: "#ffffff", color: "#0a0a0a", fontFamily: FONT }}>
          <SharedPageHeader />
          <BreakingNewsTicker />

          {/* BREADCRUMB */}
          <div className="max-w-5xl mx-auto px-5 md:px-8 pt-8">
            <nav className="flex items-center gap-2 text-xs text-[#0a0a0a]/40" style={{ fontFamily: FONT }}>
              <Link href="/proofpress-verify" className="hover:text-[#00b894] transition-colors">ProofPress Verify™</Link>
              <span>/</span>
              <span className="text-[#0a0a0a]/70 font-semibold">Email Verify</span>
            </nav>
          </div>

          {/* ─── 1. HERO ─────────────────────────────────────────────────────── */}
          <section className="pt-12 pb-20 md:pt-16 md:pb-28" style={{ background: "#ffffff" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              <div className="mb-6 flex flex-wrap gap-2 items-center">
                <span
                  className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] px-3 py-1 border"
                  style={{ color: GREEN, borderColor: `${GREEN}44`, background: `${GREEN}0d`, fontFamily: FONT }}
                >
                  ProofPress Verify™ · Estensione 03
                </span>
                <span
                  className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] px-3 py-1 border border-[#0a0a0a]/15"
                  style={{ color: "#0a0a0a", opacity: 0.45, fontFamily: FONT }}
                >
                  Per Newsletter · Email Marketing · IR · Compliance
                </span>
              </div>
              <h1
                className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-[#0a0a0a] mb-4"
                style={{ fontFamily: FONT }}
              >
                <span style={{ color: GREEN }}>Email</span> Verify<br />
                <span className="text-[#0a0a0a]/25">Ogni email. Certificata.</span>
              </h1>
              <p className="text-base font-bold mb-4 max-w-4xl" style={{ color: GREEN, fontFamily: FONT }}>
                L&apos;estensione per comunicazioni email del protocollo ProofPress Verify™.
              </p>
              <p className="text-lg md:text-xl leading-relaxed text-[#0a0a0a]/65 max-w-4xl mb-4">
                Email Verify certifica newsletter e comunicazioni email prima dell&apos;invio. Ogni messaggio riceve un <strong className="text-[#0a0a0a]">hash crittografico SHA-256 archiviato su IPFS</strong> che prova che il contenuto non è stato alterato dopo la certificazione. Mittente e destinatario possono verificare in qualsiasi momento qual era il contenuto esatto al momento dell&apos;invio.
              </p>
              <p className="text-base italic text-[#0a0a0a]/45 max-w-3xl mb-10" style={{ fontFamily: FONT }}>
                Le tue email meritano un certificato, non una speranza.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                <button
                  onClick={scrollToContact}
                  className="px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-80"
                  style={{ background: GREEN, fontFamily: FONT }}
                >
                  Richiedi una demo →
                </button>
                <button
                  onClick={() => document.getElementById("destinatario")?.scrollIntoView({ behavior: "smooth" })}
                  className="px-8 py-4 text-sm font-bold uppercase tracking-widest border border-[#0a0a0a]/20 hover:border-[#00b894] transition-colors text-center"
                  style={{ fontFamily: FONT }}
                >
                  Vedi una newsletter certificata →
                </button>
                <Link
                  href="/proofpress-verify"
                  className="px-8 py-4 text-sm font-bold uppercase tracking-widest text-center border border-[#0a0a0a]/10 hover:border-[#0a0a0a]/30 transition-colors text-[#0a0a0a]/50"
                  style={{ fontFamily: FONT }}
                >
                  ← Tutte le estensioni
                </Link>
              </div>
            </div>
          </section>

          <Divider />

          {/* ─── 2. IL PROBLEMA — framing catena di custodia ─────────────────── */}
          <Section id="problema">
            <Label>Il problema</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-8" style={{ fontFamily: FONT }}>
              Un&apos;email ricevuta è la stessa che hai inviato?<br />
              <span className="text-[#0a0a0a]/30">Oggi non c&apos;è modo di dimostrarlo.</span>
            </h2>
            <div className="max-w-3xl space-y-5 text-base leading-relaxed text-[#0a0a0a]/70 mb-12">
              <p>
                Le email ad alto valore informativo — newsletter di analisi, comunicazioni agli investitori, briefing istituzionali — viaggiano per canali multipli, vengono inoltrate, screenshot, citate, talvolta riformulate. Quando un contenuto torna indietro, distorto o frainteso, oggi non esiste un modo semplice per il mittente di provare la versione originale.
              </p>
              <p>
                Non è un problema di sicurezza in transito — è un problema di <strong className="text-[#0a0a0a]">catena di custodia</strong>. Chi ha inviato cosa, quando, e in quale versione esatta. Email Verify è quella catena di custodia: ogni invio produce un certificato crittografico pubblico, archiviato in modo immutabile su IPFS con lo stesso layer crittografico usato per certificare news e documenti — <strong className="text-[#0a0a0a]">SHA-256 + IPFS</strong>.
              </p>
              <p>
                Il certificato è la prova. Non la promessa.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: "Newsletter inoltrate con contenuto modificato", sub: "Nessuna prova della versione originale" },
                { label: "Comunicazioni IR citate fuori contesto", sub: "Nessuna catena di custodia post-invio" },
                { label: "Email AI-generated attribuite al brand", sub: "Nessun layer di accountability del mittente" },
              ].map(({ label, sub }) => (
                <div key={label} className="p-5 border border-[#0a0a0a]/8 bg-[#fafafa]">
                  <p className="text-sm font-bold text-[#0a0a0a] mb-1">{label}</p>
                  <p className="text-xs text-[#0a0a0a]/45">{sub}</p>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ─── 3. PER CHI È — 5 profili ────────────────────────────────────── */}
          <Section id="per-chi" bg="#f8f8f6">
            <Label>Per chi è</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-12" style={{ fontFamily: FONT }}>
              Per chi invia email che contano davvero.
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: "📧",
                  title: "Newsletter editoriali",
                  text: "Per newsletter con contenuti informativi ad alto valore: analisi di mercato, briefing settimanali, report esclusivi. Il certificato Email Verify è la prova che i tuoi iscritti stanno leggendo esattamente quello che hai scritto. Se qualcuno forwarda una versione modificata, hai la prova dell'originale in 10 secondi.",
                },
                {
                  icon: "📈",
                  title: "Investor Relations",
                  text: "Comunicazioni price-sensitive, earnings preview, aggiornamenti agli analisti: ogni email certificata ha un timestamp crittografico immutabile. Per board, regolatori e stakeholder, c'è sempre una versione ufficiale verificabile. Protezione legale e reputazionale in un unico certificato.",
                },
                {
                  icon: "🏛️",
                  title: "Comunicazioni istituzionali",
                  text: "Per enti pubblici, istituzioni finanziarie, organizzazioni regolate: ogni comunicazione certificata ha una prova crittografica di integrità presentabile in contesti di audit, compliance o contenzioso.",
                },
                {
                  icon: "🔄",
                  title: "Email transazionali ad alto valore",
                  text: "Conferme contratto, conferme prezzi, log di consenso GDPR, comunicazioni di modifica termini: ogni email con valore giuridico o commerciale può essere certificata prima dell'invio. Il certificato sostituisce procedure di archiviazione manuale costose.",
                },
                {
                  icon: "🎯",
                  title: "Email marketing con claim verificabili",
                  text: "Campagne con promesse di prezzo, garanzie, dati di performance: certifica il contenuto prima dell'invio. Se un claim viene contestato, hai la prova crittografica di cosa era scritto nell'email originale al momento dell'invio.",
                },
              ].map(({ icon, title, text }) => (
                <div key={title} className="p-6 border border-[#0a0a0a]/8 bg-white">
                  <div className="text-2xl mb-3">{icon}</div>
                  <h3 className="font-black text-base mb-3 text-[#0a0a0a]" style={{ fontFamily: FONT }}>{title}</h3>
                  <p className="text-sm leading-relaxed text-[#0a0a0a]/65">{text}</p>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ─── 4. COME FUNZIONA ────────────────────────────────────────────── */}
          <Section id="come-funziona">
            <Label>Come funziona</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-12" style={{ fontFamily: FONT }}>
              Scrivi. Certifica. Invia.
            </h2>
            <div className="space-y-8 mb-10">
              {[
                {
                  step: "01",
                  title: "Prepara il contenuto",
                  text: "Scrivi la newsletter o la comunicazione email come faresti normalmente. Email Verify si integra con i principali ESP (Mailchimp, Brevo, Klaviyo, Substack) o accetta il contenuto in formato testo/HTML via API.",
                },
                {
                  step: "02",
                  title: "Certificazione pre-invio",
                  text: "Prima dell'invio, il contenuto viene hashato con SHA-256 e archiviato su IPFS. Il CID crittografico è la prova permanente del contenuto originale. Il processo richiede meno di 10 secondi.",
                },
                {
                  step: "03",
                  title: "Codice di verifica nell'email",
                  text: "Il codice PP-XXXXXXXXXXXXXXXX viene aggiunto automaticamente all'email (footer o header, configurabile). Il destinatario può verificare l'integrità del contenuto in qualsiasi momento inserendo il codice su proofpress.ai/proofpress-verify.",
                },
                {
                  step: "04",
                  title: "Verifica indipendente",
                  text: "La verifica è completamente indipendente da ProofPress: il CID IPFS è pubblico e verificabile su qualsiasi gateway IPFS. Non serve fidarsi di noi — il protocollo crittografico è la garanzia.",
                },
              ].map(({ step, title, text }) => (
                <div key={step} className="grid md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-1">
                    <div className="text-4xl font-black leading-none" style={{ color: `${GREEN}33`, fontFamily: FONT }}>{step}</div>
                  </div>
                  <div className="md:col-span-11 border-l-2 pl-6" style={{ borderColor: `${GREEN}33` }}>
                    <h3 className="text-lg font-black mb-3 text-[#0a0a0a]" style={{ fontFamily: FONT }}>{title}</h3>
                    <p className="text-base leading-relaxed text-[#0a0a0a]/65">{text}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-[#0a0a0a]/40 border-t border-[#0a0a0a]/8 pt-6">
              Per la specifica completa del protocollo, vedi →{" "}
              <Link href="/proofpress-verify" className="underline hover:text-[#00b894] transition-colors">
                ProofPress Verify™ — Il protocollo
              </Link>
            </p>
          </Section>

          <Divider />

          {/* ─── 5. INTEGRAZIONE ESP ─────────────────────────────────────────── */}
          <Section id="integrazione" bg="#f8f8f6">
            <Label>Integrazione ESP</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-6" style={{ fontFamily: FONT }}>
              Si integra con il tuo stack email esistente.
            </h2>
            <p className="text-lg leading-relaxed text-[#0a0a0a]/65 max-w-3xl mb-12">
              Email Verify non chiede di cambiare piattaforma. Si innesta sul tuo flusso di approvazione esistente e certifica le email al momento della pubblicazione. Il codice PP-XXXX in footer non incide sui filtri antispam: è puro testo strutturato, non un pixel di tracking.
            </p>

            {/* Griglia ESP */}
            <div className="mb-10">
              <p className="text-xs font-bold uppercase tracking-widest text-[#0a0a0a]/40 mb-4">Integrazioni native disponibili</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {["Mailchimp", "Brevo", "Klaviyo", "Substack"].map(esp => (
                  <div key={esp} className="flex items-center justify-center py-4 border border-[#00b894]/30 bg-[#f0fff8] text-sm font-bold text-[#0a0a0a]">
                    {esp}
                  </div>
                ))}
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#0a0a0a]/40 mb-4">In roadmap</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {["HubSpot", "ActiveCampaign", "Salesforce Marketing Cloud", "Iterable"].map(esp => (
                  <div key={esp} className="flex items-center justify-center py-4 border border-[#0a0a0a]/8 bg-[#fafafa] text-sm text-[#0a0a0a]/45">
                    {esp}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: "🔌",
                  title: "REST API per ESP custom",
                  text: "Endpoint dedicati per certificazione singola, batch e recupero del Verification Report. Documentazione OpenAPI completa. Per qualsiasi ESP non supportato nativamente.",
                },
                {
                  icon: "⚡",
                  title: "Webhook su pubblicazione",
                  text: "Configura un webhook sul tuo ESP: ogni campagna in stato \"ready to send\" viene automaticamente certificata prima dell'invio, senza intervento manuale.",
                },
                {
                  icon: "🏷️",
                  title: "Badge embeddabile",
                  text: "Componente HTML/CSS embeddabile per aggiungere il badge \"Verified by Email Verify\" in footer o header. Cliccabile, porta al Verification Report pubblico.",
                },
                {
                  icon: "⚙️",
                  title: "White-label",
                  text: "Per piattaforme che vogliono offrire la certificazione come servizio proprio: API white-label con branding personalizzato del badge e del Verification Report.",
                },
              ].map(({ icon, title, text }) => (
                <div key={title} className="p-6 border border-[#0a0a0a]/8 bg-white">
                  <div className="text-2xl mb-3">{icon}</div>
                  <h3 className="font-black text-base mb-3 text-[#0a0a0a]" style={{ fontFamily: FONT }}>{title}</h3>
                  <p className="text-sm leading-relaxed text-[#0a0a0a]/65">{text}</p>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ─── 6. COSA VEDE IL DESTINATARIO ────────────────────────────────── */}
          <Section id="destinatario">
            <Label>Email Verify in azione</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-12" style={{ fontFamily: FONT }}>
              Cosa vede chi riceve la tua newsletter.
            </h2>

            {/* Mockup email */}
            <div className="border border-[#0a0a0a]/8 rounded-xl overflow-hidden mb-8">
              {/* Header email client */}
              <div className="bg-[#f5f5f7] border-b border-[#0a0a0a]/8 px-6 py-3 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <span className="text-xs text-[#0a0a0a]/40 ml-2">ProofPress Weekly — 25 Aprile 2026</span>
              </div>
              {/* Corpo email */}
              <div className="bg-white px-8 py-8">
                <p className="text-xs font-bold uppercase tracking-widest text-[#0a0a0a]/30 mb-3">Newsletter · Esempio illustrativo</p>
                <h3 className="text-2xl font-black text-[#0a0a0a] mb-4" style={{ fontFamily: FONT }}>
                  AI e Venture Capital: i deal della settimana
                </h3>
                <p className="text-sm text-[#0a0a0a]/55 leading-relaxed mb-8">
                  Questa settimana il mercato VC ha registrato 12 round significativi nel settore AI, per un totale di €340M. I deal più rilevanti includono...
                </p>
                {/* Footer certificato */}
                <div
                  className="border-t pt-5 mt-5"
                  style={{ borderColor: `${GREEN}33` }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-white rounded"
                        style={{ background: GREEN, fontFamily: FONT }}
                      >
                        ✓ Verified by Email Verify
                      </div>
                      <span className="text-xs text-[#0a0a0a]/50 font-mono">PP-A7F2B9C1D4E5F6G7</span>
                    </div>
                    <button
                      onClick={scrollToContact}
                      className="text-xs font-bold underline transition-colors"
                      style={{ color: GREEN }}
                    >
                      Verifica integrità →
                    </button>
                  </div>
                  <p className="text-[10px] text-[#0a0a0a]/30 mt-2">
                    Certificato il 25/04/2026 alle 08:00 CET · Hash SHA-256 · Archiviato su IPFS · CID: bafkrei…a7f2
                  </p>
                </div>
              </div>
            </div>

            <p className="text-base italic text-[#0a0a0a]/55 max-w-2xl" style={{ fontFamily: FONT }}>
              Il destinatario non deve fidarsi di te. Può verificare in autonomia. <strong className="text-[#0a0a0a]">È questo che cambia tutto.</strong>
            </p>
          </Section>

          <Divider />

          {/* ─── 7. DRIVER NORMATIVO ─────────────────────────────────────────── */}
          <Section id="compliance" bg="#f8f8f6">
            <Label>Compliance &amp; Regulatory</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-6" style={{ fontFamily: FONT }}>
              Quando la certificazione email passa<br />
              <span className="text-[#0a0a0a]/30">da buona pratica a obbligo.</span>
            </h2>
            <p className="text-lg leading-relaxed text-[#0a0a0a]/65 max-w-3xl mb-12">
              Per le comunicazioni email ad alto valore, esistono almeno tre framework europei che rendono la certificazione crittografica non solo utile, ma opponibile in contesti di audit, contenzioso e ispezione regolatoria.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {[
                {
                  icon: "🔐",
                  title: "eIDAS 2.0",
                  text: "Per comunicazioni con valore di sigillo elettronico: il CID IPFS + hash SHA-256 fornisce evidenza dell'integrità documentale allineata ai principi eIDAS 2.0. Opponibile in contesti di audit europei.",
                },
                {
                  icon: "📋",
                  title: "GDPR — Prova di consenso",
                  text: "Per comunicazioni che documentano consenso o modifica di termini: Email Verify certifica la versione esatta dell'email inviata, quando e a chi. Il log di certificazione è la prova del contenuto comunicato.",
                },
                {
                  icon: "📈",
                  title: "MAR — Market Abuse Regulation",
                  text: "Per comunicazioni IR price-sensitive: ogni email agli investitori può essere certificata con timestamp crittografico immutabile. Prova della versione ufficiale al momento della diffusione.",
                },
              ].map(({ icon, title, text }) => (
                <div key={title} className="p-6 border-l-4 bg-[#f0fff8]" style={{ borderColor: GREEN }}>
                  <div className="text-2xl mb-3">{icon}</div>
                  <h3 className="font-black text-base mb-3 text-[#0a0a0a]" style={{ fontFamily: FONT }}>{title}</h3>
                  <p className="text-sm leading-relaxed text-[#0a0a0a]/65">{text}</p>
                </div>
              ))}
            </div>
            <button
              onClick={scrollToContact}
              className="px-8 py-3 text-sm font-bold uppercase tracking-widest border transition-colors"
              style={{ borderColor: GREEN, color: GREEN, fontFamily: FONT }}
            >
              Parla con il nostro team compliance →
            </button>
          </Section>

          <Divider />

          {/* ─── 8. PRICING ──────────────────────────────────────────────────── */}
          <Section id="pricing">
            <Label>Modelli di servizio</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-12" style={{ fontFamily: FONT }}>
              Tre modi per portare Email Verify<br />nella tua piattaforma.
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Pay-per-email",
                  sub: "Per iniziare senza commitment",
                  price: "A partire da € X,XX/email",
                  features: [
                    "Certificazione singola",
                    "Verification Report completo",
                    "Badge embeddabile in footer",
                    "Archiviazione IPFS",
                  ],
                  cta: "Inizia subito",
                  highlight: false,
                },
                {
                  title: "Piano Volume",
                  sub: "Per newsletter e campagne mensili",
                  price: "A partire da € XXX/mese",
                  features: [
                    "Volume mensile incluso",
                    "Integrazione ESP nativa",
                    "Dashboard analytics",
                    "Supporto dedicato",
                  ],
                  cta: "Richiedi demo",
                  highlight: true,
                },
                {
                  title: "Enterprise & White-label",
                  sub: "Per piattaforme e grandi volumi",
                  price: "Su preventivo",
                  features: [
                    "SLA dedicato",
                    "API white-label",
                    "Branding personalizzato del badge",
                    "Integrazione con ESP custom",
                  ],
                  cta: "Contattaci",
                  highlight: false,
                },
              ].map(({ title, sub, price, features, cta, highlight }) => (
                <div
                  key={title}
                  className="p-6 border flex flex-col"
                  style={{
                    borderColor: highlight ? GREEN : "rgba(10,10,10,0.1)",
                    background: highlight ? `${GREEN}08` : "#ffffff",
                  }}
                >
                  {highlight && (
                    <div
                      className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 mb-4 self-start"
                      style={{ background: GREEN, color: "#fff", fontFamily: FONT }}
                    >
                      Più scelto
                    </div>
                  )}
                  <h3 className="text-lg font-black text-[#0a0a0a] mb-1" style={{ fontFamily: FONT }}>{title}</h3>
                  <p className="text-xs text-[#0a0a0a]/45 mb-4">{sub}</p>
                  <p className="text-base font-bold mb-6" style={{ color: GREEN, fontFamily: FONT }}>{price}</p>
                  <ul className="space-y-2 mb-8 flex-1">
                    {features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-[#0a0a0a]/65">
                        <span style={{ color: GREEN }}>✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={scrollToContact}
                    className="w-full py-3 text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
                    style={{
                      background: highlight ? GREEN : "transparent",
                      color: highlight ? "#fff" : GREEN,
                      border: highlight ? "none" : `1px solid ${GREEN}`,
                      fontFamily: FONT,
                    }}
                  >
                    {cta} →
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#0a0a0a]/35 mt-6">* I prezzi definitivi sono disponibili su richiesta. I range indicati sono orientativi e soggetti a variazione in base al volume e alla configurazione.</p>
          </Section>

          <Divider />

          {/* ─── 9. PROVA SOCIALE / BETA PROGRAM ─────────────────────────────── */}
          <Section id="social-proof" bg="#f8f8f6">
            <Label>Già attivi</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-8" style={{ fontFamily: FONT }}>
              Newsletter che hanno scelto<br />
              <span className="text-[#0a0a0a]/30">la prova invece della speranza.</span>
            </h2>
            <div className="border border-[#00b894]/20 bg-[#f0fff8] p-8 rounded-xl mb-8">
              <p className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: GREEN }}>Beta Program</p>
              <p className="text-base leading-relaxed text-[#0a0a0a]/70 mb-4">
                Email Verify è in beta program con un gruppo selezionato di newsletter editoriali, team IR e piattaforme di email marketing. Apertura general availability: <strong className="text-[#0a0a0a]">Q3 2026</strong>.
              </p>
              <p className="text-sm text-[#0a0a0a]/50">
                Partecipare al beta program significa accedere al servizio prima del lancio pubblico, a condizioni preferenziali, con supporto diretto del team tecnico e influenza sulla roadmap.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { num: "37+", label: "Email già certificate e archiviate su IPFS" },
                { num: "3", label: "Settori attivi: Newsletter, IR, Email Marketing" },
                { num: "<10s", label: "Tempo medio di certificazione per email standard" },
              ].map(({ num, label }) => (
                <div key={label} className="p-5 border border-[#0a0a0a]/8 text-center bg-white">
                  <div className="text-3xl font-black mb-2" style={{ color: GREEN, fontFamily: FONT }}>{num}</div>
                  <p className="text-xs text-[#0a0a0a]/55">{label}</p>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ─── 10. FAQ ─────────────────────────────────────────────────────── */}
          <Section id="faq">
            <Label>Domande frequenti</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-12" style={{ fontFamily: FONT }}>
              Le domande di chi gestisce newsletter e comunicazioni.
            </h2>
            <div className="max-w-3xl">
              {[
                {
                  q: "Il codice PP-XXXX in footer incide sulla deliverability?",
                  a: "No. Il codice è puro testo strutturato in footer, non un pixel di tracking, non un link esterno attivo, non un'immagine. Non incide sui filtri antispam né sul preview text. È progettato per essere invisibile ai filtri e visibile agli utenti.",
                },
                {
                  q: "Posso certificare una campagna già inviata?",
                  a: "No. Email Verify certifica il contenuto prima dell'invio — è una catena di custodia, non una firma retroattiva. La certificazione post-invio non avrebbe valore probatorio perché non proverebbe che il contenuto era quello originale al momento dell'invio.",
                },
                {
                  q: "Il contenuto dell'email resta privato?",
                  a: "A scelta. Il CID IPFS è sempre pubblico (è la prova). Il contenuto dell'email può essere archiviato su IPFS pubblico, su IPFS privato, oppure può restare sui vostri sistemi mentre solo l'hash viene reso pubblico.",
                },
                {
                  q: "Si integra con il nostro ESP?",
                  a: "Integrazioni native disponibili per Mailchimp, Brevo, Klaviyo, Substack. Per altri ESP: REST API documentata, webhook configurabili e supporto dedicato in fase di onboarding. HubSpot, ActiveCampaign e Salesforce Marketing Cloud sono in roadmap.",
                },
                {
                  q: "Cosa succede se modifico l'email dopo la certificazione?",
                  a: "L'hash cambia. Una nuova certificazione produce un nuovo CID. La storia di tutte le versioni resta verificabile pubblicamente. Il contenuto originale certificato non è alterabile.",
                },
                {
                  q: "Email Verify ha valore probatorio in tribunale?",
                  a: "Email Verify produce evidenze tecniche (hash SHA-256, CID IPFS, timestamp) compatibili con i principi di eIDAS 2.0. Il valore probatorio specifico va valutato con il vostro consulente legale, ma l'evidenza tecnica è quella canonica per la firma elettronica e il sigillo qualificato.",
                },
              ].map(({ q, a }) => (
                <FAQItem key={q} q={q} a={a} />
              ))}
            </div>
          </Section>

          <Divider />

          {/* ─── 11. FORM DI CONTATTO ────────────────────────────────────────── */}
          <section id="contact" className="py-24 md:py-32" style={{ background: "#f5f5f7" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8" ref={contactRef}>
              <div className="text-center mb-12">
                <Label>Inizia con Email Verify</Label>
                <h2
                  className="text-3xl md:text-5xl font-black leading-tight mb-6"
                  style={{ fontFamily: FONT, color: "#0a0a0a" }}
                >
                  Le tue email meritano<br />
                  <span style={{ color: GREEN }}>un certificato, non una speranza.</span>
                </h2>
                <p className="text-base mb-4 max-w-xl mx-auto" style={{ color: "#0a0a0a", opacity: 0.55 }}>
                  Scrivici per integrare Email Verify nella tua piattaforma di invio, per richiedere una demo personalizzata, o per esplorare partnership tecnologiche.
                </p>
              </div>
              <ContactForm origine="Email Verify — /proofpress-verify/email" />
            </div>
          </section>

          <div className="py-12 text-center" style={{ background: "#0a0a0a", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-sm text-white/30 italic max-w-2xl mx-auto px-5" style={{ fontFamily: FONT }}>
              &ldquo;Non promettiamo verità. Forniamo evidenza. La differenza è tutto.&rdquo;
            </p>
          </div>
          <SharedPageFooter />
        </div>
      </div>
    </div>
  );
}
