/*
 * INFO VERIFY — Estensione 02 di ProofPress Verify™
 * Landing B2B completa — 12 sezioni
 * Target: Direzione Comunicazione, Investor Relations, Compliance & Legal, Brand, PA
 */
import { useState, useRef } from "react";
import { Link } from "wouter";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import ContactForm from "@/components/ContactForm";
import SEOHead from "@/components/SEOHead";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const BLUE = "#0984e3";

function Section({ children, bg = "transparent", id }: { children: React.ReactNode; bg?: string; id?: string }) {
  return (
    <section id={id} className="py-20 md:py-28" style={{ background: bg }}>
      <div className="max-w-5xl mx-auto px-5 md:px-8">{children}</div>
    </section>
  );
}

function Label({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <span
      className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] mb-4"
      style={{ color: light ? "rgba(255,255,255,0.4)" : "rgba(10,10,10,0.4)", fontFamily: FONT }}
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

/* ─── FAQ ACCORDION ─────────────────────────────────────────────────────── */
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

export default function InfoVerify() {
  const contactRef = useRef<HTMLDivElement>(null);
  const scrollToContact = () => contactRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="flex min-h-screen">
      
      <div className="flex-1 min-w-0">
        <SEOHead
          title="Info Verify — Certifica documenti e contenuti informativi aziendali con ProofPress Verify™"
          description="Info Verify certifica comunicati stampa, report aziendali, white paper e documenti corporate con hash SHA-256 e archiviazione IPFS. Compliance AI Act, MAR, eIDAS, GDPR."
          canonical="https://proofpress.ai/proofpress-verify/info"
          ogSiteName="Proof Press"
        />
        <div className="min-h-screen" style={{ background: "#ffffff", color: "#0a0a0a", fontFamily: FONT }}>
          <SharedPageHeader />
          {/* BREADCRUMB */}
          <div className="max-w-5xl mx-auto px-5 md:px-8 pt-8">
            <nav className="flex items-center gap-2 text-xs text-[#0a0a0a]/40" style={{ fontFamily: FONT }}>
              <Link href="/proofpress-verify" className="hover:text-[#0984e3] transition-colors">ProofPress Verify™</Link>
              <span>/</span>
              <span className="text-[#0a0a0a]/70 font-semibold">Info Verify</span>
            </nav>
          </div>

          {/* ─── 1. HERO ─────────────────────────────────────────────────────── */}
          <section className="pt-12 pb-20 md:pt-16 md:pb-28" style={{ background: "#ffffff" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              <div className="mb-6 flex flex-wrap gap-2 items-center">
                <span
                  className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] px-3 py-1 border"
                  style={{ color: BLUE, borderColor: `${BLUE}44`, background: `${BLUE}0d`, fontFamily: FONT }}
                >
                  ProofPress Verify™ · Estensione 02
                </span>
                <span
                  className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] px-3 py-1 border border-[#0a0a0a]/15"
                  style={{ color: "#0a0a0a", opacity: 0.45, fontFamily: FONT }}
                >
                  Per Aziende · PR &amp; Comms · Istituzioni
                </span>
              </div>
              <h1
                className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-[#0a0a0a] mb-4"
                style={{ fontFamily: FONT }}
              >
                <span style={{ color: BLUE }}>Info</span> Verify<br />
                <span className="text-[#0a0a0a]/25">Ogni documento. Certificato.</span>
              </h1>
              <p className="text-base font-bold mb-4 max-w-4xl" style={{ color: BLUE, fontFamily: FONT }}>
                L&apos;estensione corporate del protocollo ProofPress Verify™.
              </p>
              <p className="text-lg md:text-xl leading-relaxed text-[#0a0a0a]/65 max-w-4xl mb-4">
                Info Verify certifica qualsiasi contenuto informativo — comunicati stampa, report aziendali, white paper, post social — con un <strong className="text-[#0a0a0a]">certificato crittografico verificabile da chiunque</strong>, in qualsiasi momento, senza intermediari.
              </p>
              <p className="text-base italic text-[#0a0a0a]/45 max-w-3xl mb-10" style={{ fontFamily: FONT }}>
                I tuoi documenti meritano una prova, non una promessa.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                <button
                  onClick={scrollToContact}
                  className="px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-80"
                  style={{ background: BLUE, fontFamily: FONT }}
                >
                  Richiedi una demo →
                </button>
                <button
                  onClick={() => document.getElementById("destinatario")?.scrollIntoView({ behavior: "smooth" })}
                  className="px-8 py-4 text-sm font-bold uppercase tracking-widest border border-[#0a0a0a]/20 hover:border-[#0984e3] transition-colors text-center"
                  style={{ fontFamily: FONT }}
                >
                  Vedi un comunicato certificato →
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

          {/* ─── VIDEO SIGILLO DIGITALE (spostato qui, subito dopo l'hero) ──────────── */}
          <section className="py-16 md:py-20" style={{ background: "#0a0a0a" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              <div className="mb-8 text-center">
                <span
                  className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-white/40"
                  style={{ fontFamily: FONT }}
                >
                  ProofPress Info Verify · In pochi Secondi
                </span>
                <h2 className="mt-3 text-2xl md:text-3xl font-black text-white" style={{ fontFamily: FONT }}>
                  Il Sigillo Digitale per i tuoi Documenti.
                </h2>
              </div>
              <div
                className="relative w-full overflow-hidden"
                style={{ aspectRatio: "16/9", background: "#1a1a1a" }}
              >
                <video
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                  style={{ display: "block" }}
                >
                  <source src="/manus-storage/ProofPress__Sigillo_Digitale_72768cfa.mp4" type="video/mp4" />
                  Il tuo browser non supporta la riproduzione video.
                </video>
              </div>
              <p className="mt-4 text-center text-[13px] text-white/35" style={{ fontFamily: FONT }}>
                ProofPress Info Verify — Certifica ogni documento con hash crittografico immutabile e notarizzazione IPFS
              </p>
            </div>
          </section>

          <Divider />

          {/* ─── 2. IL PROBLEMA CORPORATE ──────────────────────────────────── */}
          <Section id="problema">
            <Label>Il problema</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-8" style={{ fontFamily: FONT }}>
              L&apos;informazione aziendale ha un problema di fiducia.<br />
              <span className="text-[#0a0a0a]/30">E nessuno la sta risolvendo.</span>
            </h2>
            <div className="max-w-3xl mb-12">
              <p className="text-lg leading-relaxed text-[#0a0a0a]/65 mb-6">
                Solo il <strong className="text-[#0a0a0a]">51% dei consumatori si fida della comunicazione aziendale</strong> (Edelman Trust Barometer 2024). Per le PR, gli investor relations e la comunicazione istituzionale, il problema non è più <em>produrre</em> contenuti — è <em>dimostrarne l&apos;integrità</em> a chi li riceve.
              </p>
              <p className="text-lg leading-relaxed text-[#0a0a0a]/65 mb-6">
                Un comunicato stampa, una volta inviato, può essere modificato, riformulato, decontestualizzato. Un report finanziario può circolare in versioni alterate. Un post social può essere attribuito a un brand che non l&apos;ha mai pubblicato. Oggi non esiste una <strong className="text-[#0a0a0a]">catena di custodia digitale</strong> per l&apos;informazione aziendale.
              </p>
              <p className="text-lg font-bold text-[#0a0a0a]">Info Verify è quella catena di custodia.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: "Comunicati stampa modificati post-invio", sub: "Nessuna prova dell'originale" },
                { label: "Report distribuiti su canali non controllati", sub: "Nessuna catena di custodia" },
                { label: "Contenuti AI-generated indistinguibili dagli umani", sub: "Nessun layer di accountability" },
              ].map(({ label, sub }) => (
                <div key={label} className="p-5 border border-[#0a0a0a]/8 bg-[#fafafa]">
                  <p className="text-sm font-bold text-[#0a0a0a] mb-1">{label}</p>
                  <p className="text-xs text-[#0a0a0a]/45">{sub}</p>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ─── 3. CASI D'USO ───────────────────────────────────────────────── */}
          <Section id="use-case" bg="#f8f8f6">
            <Label>Casi d&apos;uso</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-12" style={{ fontFamily: FONT }}>
              Ogni documento ha un valore.<br />Info Verify lo rende dimostrabile.
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: "📢",
                  title: "Comunicati stampa",
                  text: "Un comunicato certificato porta un hash crittografico che prova che il contenuto non è stato alterato dopo la pubblicazione. I giornalisti possono verificare l'integrità del documento in autonomia.",
                },
                {
                  icon: "📊",
                  title: "Report aziendali e white paper",
                  text: "Report finanziari, analisi di mercato, white paper tecnici: ogni documento certificato diventa un asset con prova crittografica di integrità. Ideale per investor relations, compliance e comunicazione istituzionale.",
                },
                {
                  icon: "📱",
                  title: "Post social e contenuti digital",
                  text: "Certifica i contenuti social prima della pubblicazione. Il certificato Info Verify prova che il contenuto originale non è stato modificato — utile per brand che operano in settori regolamentati o ad alta visibilità.",
                },
                {
                  icon: "📄",
                  title: "Atti amministrativi e comunicazioni ufficiali",
                  text: "Per PA e istituzioni: bandi, comunicazioni ufficiali, atti distribuiti in formato digitale ricevono un layer di accountability pubblica che ogni cittadino può verificare in autonomia.",
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

          {/* ─── 4. COMPLIANCE & REGULATORY ──────────────────────────────────── */}
          <Section id="compliance">
            <Label>Compliance &amp; Regulatory</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-6" style={{ fontFamily: FONT }}>
              Quando l&apos;integrità documentale è un obbligo,<br />
              <span className="text-[#0a0a0a]/30">non un&apos;opzione.</span>
            </h2>
            <p className="text-lg leading-relaxed text-[#0a0a0a]/65 max-w-3xl mb-12">
              Nei settori regolamentati, dimostrare che un documento non è stato alterato dopo la pubblicazione non è una buona pratica — è un requisito normativo. Info Verify fornisce un layer di accountability crittografica compatibile con i principali quadri europei.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              {[
                {
                  icon: "🇪🇺",
                  title: "AI Act (Regolamento UE 2024/1689)",
                  text: "Per organizzazioni che usano AI nella produzione di contenuti, l'AI Act richiede tracciabilità e accountability. Info Verify documenta ogni claim, la fonte di corroborazione e la pipeline di verifica.",
                },
                {
                  icon: "📈",
                  title: "MAR — Market Abuse Regulation",
                  text: "Per emittenti quotati e investor relations: ogni comunicato price-sensitive può essere certificato con timestamp crittografico immutabile, prova della versione ufficiale al momento della diffusione.",
                },
                {
                  icon: "🔐",
                  title: "eIDAS 2.0",
                  text: "Allineato ai principi di firma elettronica e sigillo qualificato: il CID IPFS + hash SHA-256 fornisce evidenza dell'integrità documentale opponibile in contesti di audit.",
                },
                {
                  icon: "📋",
                  title: "GDPR — Catena di custodia",
                  text: "Per comunicazioni che contengono dati personali, Info Verify documenta la versione esatta distribuita e a chi, senza esporre il contenuto: l'hash è pubblico, il documento resta privato.",
                },
              ].map(({ icon, title, text }) => (
                <div key={title} className="p-6 border-l-4 border-[#0984e3] bg-[#f0f7ff]">
                  <div className="text-2xl mb-3">{icon}</div>
                  <h3 className="font-black text-base mb-3 text-[#0a0a0a]" style={{ fontFamily: FONT }}>{title}</h3>
                  <p className="text-sm leading-relaxed text-[#0a0a0a]/65">{text}</p>
                </div>
              ))}
            </div>
            <button
              onClick={scrollToContact}
              className="px-8 py-3 text-sm font-bold uppercase tracking-widest border transition-colors"
              style={{ borderColor: BLUE, color: BLUE, fontFamily: FONT }}
            >
              Parla con il nostro team compliance →
            </button>
          </Section>

          <Divider />

          {/* ─── 5. PER CHI È ────────────────────────────────────────────────── */}
          <Section id="per-chi" bg="#f8f8f6">
            <Label>Per chi è</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-12" style={{ fontFamily: FONT }}>
              Per chi comunica, per chi rendiconta,<br />
              <span className="text-[#0a0a0a]/30">per chi deve dimostrarlo.</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: "🏢",
                  title: "Direzione Comunicazione & PR",
                  text: "Ogni comunicato stampa esce con un certificato crittografico. I giornalisti che lo ricevono possono verificare che la versione che hanno è quella ufficiale. Nessun rischio di citazioni decontestualizzate o versioni alterate in circolazione.",
                },
                {
                  icon: "📊",
                  title: "Investor Relations",
                  text: "Comunicati price-sensitive, presentazioni agli analisti, report trimestrali: ogni documento finanziario riceve un timestamp immutabile. Per board, regolatori e stakeholder, c'è sempre una versione ufficiale verificabile.",
                },
                {
                  icon: "⚖️",
                  title: "Compliance & Legal",
                  text: "Per audit interni, contenziosi, ispezioni regolatorie: una prova crittografica della versione esatta di un documento al momento della pubblicazione. Sostituisce procedure di archiviazione manuale costose e fragili.",
                },
                {
                  icon: "🎯",
                  title: "Brand & Marketing",
                  text: "Ogni post social, white paper, contenuto editoriale prodotto dal brand viene certificato prima della pubblicazione. Se qualcuno attribuisce al brand contenuti non autentici, c'è una prova pubblica della vera produzione del brand.",
                },
                {
                  icon: "🏛️",
                  title: "Pubblica Amministrazione",
                  text: "Comunicazioni ufficiali, bandi, atti amministrativi distribuiti in formato digitale: Info Verify aggiunge un layer di accountability pubblica che ogni cittadino può verificare in autonomia.",
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

          {/* ─── 6. COME FUNZIONA ────────────────────────────────────────────── */}
          <Section id="come-funziona">
            <Label>Come funziona</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-12" style={{ fontFamily: FONT }}>
              Carica. Certifica. Condividi.
            </h2>
            <div className="space-y-8 mb-10">
              {[
                {
                  step: "01",
                  title: "Carica il documento",
                  text: "Carica il documento in formato PDF, DOCX, HTML o Markdown. Il sistema accetta comunicati stampa, report, white paper, post social e qualsiasi contenuto informativo strutturato.",
                },
                {
                  step: "02",
                  title: "Analisi e verifica dei claim",
                  text: "Il sistema AI estrae i claim fattuali verificabili e li confronta con fonti classificate per credibilità. Il risultato è un Verification Report con esito per ogni singolo claim.",
                },
                {
                  step: "03",
                  title: "Certificato crittografico",
                  text: "Il documento e il Verification Report vengono hashati con SHA-256 e archiviati su IPFS. Il CID crittografico è la prova permanente che il contenuto non è stato alterato dopo la certificazione.",
                },
                {
                  step: "04",
                  title: "Condivisione del certificato",
                  text: "Ricevi il codice PP-XXXXXXXXXXXXXXXX da allegare al documento. Chiunque può verificare l'integrità del contenuto inserendo il codice su proofpress.ai/proofpress-verify.",
                },
              ].map(({ step, title, text }) => (
                <div key={step} className="grid md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-1">
                    <div className="text-4xl font-black leading-none" style={{ color: `${BLUE}33`, fontFamily: FONT }}>{step}</div>
                  </div>
                  <div className="md:col-span-11 border-l-2 pl-6" style={{ borderColor: `${BLUE}33` }}>
                    <h3 className="text-lg font-black mb-3 text-[#0a0a0a]" style={{ fontFamily: FONT }}>{title}</h3>
                    <p className="text-base leading-relaxed text-[#0a0a0a]/65">{text}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-[#0a0a0a]/40 border-t border-[#0a0a0a]/8 pt-6">
              Questa è la pipeline applicata all&apos;informazione aziendale. Per la specifica completa del protocollo, vedi →{" "}
              <Link href="/proofpress-verify" className="underline hover:text-[#0984e3] transition-colors">
                ProofPress Verify™ — Il protocollo
              </Link>
            </p>
          </Section>

          <Divider />

          {/* ─── 7. INTEGRAZIONE E API ───────────────────────────────────────── */}
          <Section id="integrazione" bg="#f8f8f6">
            <Label>Integrazione</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-6" style={{ fontFamily: FONT }}>
              Si integra con il modo in cui già lavori.
            </h2>
            <p className="text-lg leading-relaxed text-[#0a0a0a]/65 max-w-3xl mb-12">
              Info Verify non chiede di cambiare i tuoi processi. Si innesta sul tuo flusso di approvazione esistente e certifica i documenti al momento della pubblicazione.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: "🔌",
                  title: "REST API",
                  text: "Endpoint dedicati per certificazione singola, batch, recupero del Verification Report e verifica del CID. Documentazione OpenAPI completa.",
                },
                {
                  icon: "⚡",
                  title: "Webhook su pubblicazione",
                  text: "Configura un webhook sul tuo CMS o DMS: ogni documento in stato \"publish\" viene automaticamente certificato senza intervento manuale.",
                },
                {
                  icon: "🔗",
                  title: "Connettori nativi",
                  text: "Disponibili o in roadmap per SharePoint, Confluence, Google Drive, Box, WordPress, Drupal, Adobe Experience Manager.",
                },
                {
                  icon: "🏷️",
                  title: "SDK & Embedding",
                  text: "Componente embeddabile per aggiungere il badge \"Verified by Info Verify\" su sito, comunicato, presentazione PDF o email.",
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

          {/* ─── 8. COSA VEDE IL DESTINATARIO ────────────────────────────────── */}
          <Section id="destinatario">
            <Label>Verify in azione</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-12" style={{ fontFamily: FONT }}>
              Cosa vede chi riceve un tuo documento.
            </h2>
            <div className="border border-[#0a0a0a]/8 rounded-xl overflow-hidden mb-8">
              {/* Mockup comunicato */}
              <div className="bg-[#f0f7ff] border-b border-[#0984e3]/20 px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-white rounded"
                    style={{ background: BLUE, fontFamily: FONT }}
                  >
                    ✓ Verified by Info Verify · Grade A
                  </div>
                  <span className="text-xs text-[#0a0a0a]/50 font-mono">CID: bafkrei…a7f2</span>
                </div>
                <span className="text-xs text-[#0a0a0a]/40">Documento originale, immutabile dal 22/04/2026 14:30 CET</span>
              </div>
              <div className="px-6 py-6 bg-white">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#0a0a0a]/30 mb-2">Comunicato Stampa — Esempio</p>
                    <h3 className="text-xl font-black text-[#0a0a0a] mb-3" style={{ fontFamily: FONT }}>
                      Azienda XYZ annuncia partnership strategica con il Gruppo ABC
                    </h3>
                    <p className="text-sm text-[#0a0a0a]/55 leading-relaxed">
                      Milano, 22 aprile 2026 — Azienda XYZ S.p.A. ha annunciato oggi la firma di un accordo di partnership strategica con il Gruppo ABC per lo sviluppo di soluzioni di intelligenza artificiale nel settore finanziario...
                    </p>
                  </div>
                  <div className="md:w-64 border border-[#0984e3]/20 rounded-lg p-4 bg-[#f0f7ff] flex-shrink-0">
                    <p className="text-xs font-bold text-[#0984e3] mb-3 uppercase tracking-widest">Verification Report</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#0a0a0a]/50">Claim verificati</span>
                        <span className="font-bold text-[#0a0a0a]">12/12</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#0a0a0a]/50">Trust Score</span>
                        <span className="font-bold" style={{ color: BLUE }}>94/100</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#0a0a0a]/50">Grade</span>
                        <span className="font-bold text-green-600">A — Pubblica</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#0a0a0a]/50">Archiviato su</span>
                        <span className="font-bold text-[#0a0a0a]">IPFS</span>
                      </div>
                    </div>
                    <button
                      onClick={scrollToContact}
                      className="mt-4 w-full text-xs font-bold py-2 text-center border transition-colors"
                      style={{ borderColor: BLUE, color: BLUE, fontFamily: FONT }}
                    >
                      Verifica indipendente →
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-base italic text-[#0a0a0a]/55 max-w-2xl" style={{ fontFamily: FONT }}>
              Il destinatario non deve fidarsi di te. Può verificare in autonomia. <strong className="text-[#0a0a0a]">È questo che cambia tutto.</strong>
            </p>
          </Section>

          <Divider />

          {/* ─── 10. PROVA SOCIALE ───────────────────────────────────────────── */}
          <Section id="social-proof">
            <Label>Già attivi</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-8" style={{ fontFamily: FONT }}>
              Organizzazioni che hanno scelto<br />
              <span className="text-[#0a0a0a]/30">la prova invece della promessa.</span>
            </h2>
            <div className="border border-[#0984e3]/20 bg-[#f0f7ff] p-8 rounded-xl mb-8">
              <p className="text-sm font-bold uppercase tracking-widest text-[#0984e3] mb-4">Beta Program</p>
              <p className="text-base leading-relaxed text-[#0a0a0a]/70 mb-4">
                Info Verify è in beta program con un gruppo selezionato di organizzazioni nei settori PR, finance e Pubblica Amministrazione. Apertura general availability: <strong className="text-[#0a0a0a]">Q3 2026</strong>.
              </p>
              <p className="text-sm text-[#0a0a0a]/50">
                Partecipare al beta program significa accedere al servizio prima del lancio pubblico, a condizioni preferenziali, con supporto diretto del team tecnico.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { num: "37+", label: "Documenti già certificati e archiviati su IPFS" },
                { num: "3", label: "Settori attivi: PR, Finance, Pubblica Amministrazione" },
                { num: "100%", label: "Dei documenti certificati verificabili pubblicamente" },
              ].map(({ num, label }) => (
                <div key={label} className="p-5 border border-[#0a0a0a]/8 text-center">
                  <div className="text-3xl font-black mb-2" style={{ color: BLUE, fontFamily: FONT }}>{num}</div>
                  <p className="text-xs text-[#0a0a0a]/55">{label}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ─── 12. FORM DI CONTATTO ────────────────────────────────────────── */}
          <section id="contact" className="py-24 md:py-32" style={{ background: "#f5f5f7" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8" ref={contactRef}>
              <div className="text-center mb-12">
                <Label>Inizia con Info Verify</Label>
                <h2
                  className="text-3xl md:text-5xl font-black leading-tight mb-6"
                  style={{ fontFamily: FONT, color: "#0a0a0a" }}
                >
                  I tuoi documenti meritano<br />
                  <span style={{ color: BLUE }}>una prova, non una promessa.</span>
                </h2>
                <p className="text-base mb-4 max-w-xl mx-auto" style={{ color: "#0a0a0a", opacity: 0.55 }}>
                  Scrivici per integrare Info Verify nella tua organizzazione, per richiedere una demo personalizzata, o per esplorare partnership tecnologiche.
                </p>
              </div>
              {/* CTA preventivo */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                <a href="/preventivo-info-verify">
                  <button
                    className="inline-flex items-center justify-center text-white font-bold px-10 py-3 text-[15px] transition-opacity hover:opacity-90"
                    style={{ background: BLUE, borderRadius: 0 }}
                  >
                    Richiedi preventivo gratuito →
                  </button>
                </a>
                <a href="/verify/demo">
                  <button
                    className="inline-flex items-center justify-center border-2 bg-transparent hover:bg-[#0a0a0a]/5 text-[#0a0a0a] font-bold px-10 py-3 text-[15px] transition-colors"
                    style={{ borderColor: "rgba(10,10,10,0.2)", borderRadius: 0 }}
                  >
                    Guarda la demo
                  </button>
                </a>
              </div>
              <p className="text-center text-[12px] text-[#0a0a0a]/35 tracking-[0.1em] uppercase mb-10" style={{ fontFamily: FONT }}>Nessun impegno · Risposta entro 24h · Demo personalizzata</p>
              <ContactForm origine="Info Verify — /proofpress-verify/info" />
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
