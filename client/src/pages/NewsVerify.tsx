/*
 * NEWS VERIFY — Estensione 01 di ProofPress Verify™
 * Pagina prodotto verticale per redazioni, freelance e brand media
 * Riscritta v2: eliminata duplicazione madre, aggiunto taglio editoriale,
 * integrazione redazione, grading operativo, FAQ, CTA gerarchica
 */
import { useRef, useState } from "react";
import { Link } from "wouter";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import ContactForm from "@/components/ContactForm";
import SEOHead from "@/components/SEOHead";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const ORANGE = "#ff5500";

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

/* ── FAQ accordion item ── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#0a0a0a]/8 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
        style={{ fontFamily: FONT }}
      >
        <span className="text-sm font-bold text-[#0a0a0a] leading-snug">{q}</span>
        <span className="text-xl font-light text-[#0a0a0a]/40 shrink-0">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="pb-5 text-sm leading-relaxed text-[#0a0a0a]/60" style={{ fontFamily: FONT }}>
          {a}
        </div>
      )}
    </div>
  );
}

export default function NewsVerify() {
  const contactRef = useRef<HTMLDivElement>(null);
  const scrollToContact = () => contactRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="flex min-h-screen">
      
      <div className="flex-1 min-w-0">
        <SEOHead
          title="News Verify — Ogni articolo della tua redazione, certificato. Verificabile da chiunque."
          description="News Verify certifica ogni articolo pubblicato dalla tua redazione con hash SHA-256 e archiviazione IPFS. Verification Report pubblico, claim per claim. Per testate, freelance e brand media."
          canonical="https://proofpress.ai/proofpress-verify/news"
          ogSiteName="Proof Press"
        />
        <div className="min-h-screen" style={{ background: "#ffffff", color: "#0a0a0a", fontFamily: FONT }}>
          <SharedPageHeader />
          {/* BREADCRUMB */}
          <div className="max-w-5xl mx-auto px-5 md:px-8 pt-8">
            <nav className="flex items-center gap-2 text-xs text-[#0a0a0a]/40" style={{ fontFamily: FONT }}>
              <Link href="/proofpress-verify" className="hover:text-[#ff5500] transition-colors">ProofPress Verify™</Link>
              <span>/</span>
              <span className="text-[#0a0a0a]/70 font-semibold">News Verify</span>
            </nav>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              HERO
          ═══════════════════════════════════════════════════════════════════ */}
          <section className="pt-12 pb-20 md:pt-16 md:pb-28" style={{ background: "#ffffff" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              <div className="mb-6 flex flex-wrap gap-2 items-center">
                <span
                  className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] px-3 py-1 border"
                  style={{ color: ORANGE, borderColor: `${ORANGE}44`, background: `${ORANGE}0d`, fontFamily: FONT }}
                >
                  ProofPress Verify™ · Estensione 01
                </span>
                <span
                  className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] px-3 py-1 border border-[#0a0a0a]/15"
                  style={{ color: "#0a0a0a", opacity: 0.45, fontFamily: FONT }}
                >
                  Per Redazioni · Freelance · Brand Media
                </span>
              </div>
              <h1
                className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-[#0a0a0a] mb-6"
                style={{ fontFamily: FONT }}
              >
                <span style={{ color: ORANGE }}>News</span> Verify<br />
                <span className="text-[#0a0a0a]/25">Ogni articolo della tua redazione,<br />certificato. Verificabile da chiunque.</span>
              </h1>
              <p className="text-lg md:text-xl leading-relaxed text-[#0a0a0a]/65 max-w-4xl mb-10">
                News Verify certifica ogni articolo pubblicato dalla tua redazione. Ogni notizia esce con un{" "}
                <strong className="text-[#0a0a0a]">Verification Report pubblico</strong> che documenta, claim per claim,
                quante fonti indipendenti lo confermano e con quale credibilità. Il contenuto viene sigillato con hash SHA-256
                e archiviato su IPFS — immutabile, verificabile da chiunque, indipendente da ProofPress.
              </p>
              {/* CTA gerarchica: primaria + secondaria + terziaria */}
              <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                <button
                  onClick={scrollToContact}
                  className="px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-80"
                  style={{ background: ORANGE, fontFamily: FONT }}
                >
                  Richiedi una demo →
                </button>
                <a
                  href="https://proofpress.ai/methodology/v1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 text-sm font-bold uppercase tracking-widest text-center border border-[#0a0a0a]/20 hover:border-[#0a0a0a]/50 transition-colors"
                  style={{ fontFamily: FONT }}
                >
                  Vedi un Verification Report di esempio →
                </a>
                <Link
                  href="/proofpress-verify"
                  className="px-8 py-4 text-sm font-bold uppercase tracking-widest text-center text-[#0a0a0a]/40 hover:text-[#0a0a0a]/70 transition-colors"
                  style={{ fontFamily: FONT }}
                >
                  ← Tutte le estensioni
                </Link>
              </div>
            </div>
          </section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════════════════
              IL PROBLEMA — TAGLIO EDITORIALE
          ═══════════════════════════════════════════════════════════════════ */}
          <Section bg="#f8f8f6" id="problema">
            <Label>Il contesto</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-8" style={{ fontFamily: FONT }}>
              Il giornalismo ha un problema di fiducia.<br />
              <span style={{ color: ORANGE }}>L&apos;AI lo amplifica.</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mb-10">
              <div className="border-l-2 pl-6" style={{ borderColor: ORANGE }}>
                <div className="text-4xl font-black mb-2" style={{ color: ORANGE, fontFamily: FONT }}>59%</div>
                <p className="text-sm leading-relaxed text-[#0a0a0a]/65">
                  dei lettori non distingue notizie vere da false.<br />
                  <span className="text-[10px] font-mono text-[#0a0a0a]/35">Reuters Institute Digital News Report, 2024</span>
                </p>
              </div>
              <div className="border-l-2 pl-6" style={{ borderColor: "#0a0a0a22" }}>
                <div className="text-4xl font-black mb-2 text-[#0a0a0a]" style={{ fontFamily: FONT }}>&lt;3%</div>
                <p className="text-sm leading-relaxed text-[#0a0a0a]/65">
                  dei contenuti pubblicati ogni giorno viene coperto dai fact-checker tradizionali.
                </p>
              </div>
              <div className="border-l-2 pl-6" style={{ borderColor: "#0a0a0a22" }}>
                <div className="text-4xl font-black mb-2 text-[#0a0a0a]" style={{ fontFamily: FONT }}>0</div>
                <p className="text-sm leading-relaxed text-[#0a0a0a]/65">
                  I disclaimer &ldquo;scritto con l&apos;aiuto dell&apos;AI&rdquo; non sono verificabili. Non bastano.
                </p>
              </div>
            </div>
            <div className="bg-white border border-[#0a0a0a]/8 p-6 md:p-8 max-w-3xl">
              <p className="text-base leading-relaxed text-[#0a0a0a]/75">
                <strong className="text-[#0a0a0a]">News Verify trasforma ogni articolo in un certificato pubblico, immutabile, controllabile da chiunque.</strong>{" "}
                Non è un fact-checker. Non è un filtro editoriale. È la prova crittografica che i claim dell&apos;articolo
                sono stati confrontati con fonti indipendenti e classificati per credibilità — prima della pubblicazione.
              </p>
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════════════════
              INTEGRAZIONE IN REDAZIONE (sostituisce pipeline duplicata)
          ═══════════════════════════════════════════════════════════════════ */}
          <Section id="integrazione">
            <Label>Integrazione in redazione</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-4" style={{ fontFamily: FONT }}>
              Cosa deve fare la redazione?<br />
              <span className="text-[#0a0a0a]/30">Quasi niente.</span>
            </h2>
            <p className="text-base text-[#0a0a0a]/55 mb-12 max-w-2xl leading-relaxed">
              La pipeline tecnica completa (6 step, SHA-256, IPFS, codice PP-XXXX) è documentata sulla{" "}
              <Link href="/proofpress-verify" className="underline hover:text-[#ff5500] transition-colors">pagina del protocollo</Link>.
              Qui la versione operativa: cosa succede in redazione.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  step: "01",
                  title: "Connetti il CMS",
                  text: "REST API, Webhook su pubblicazione, plugin WordPress (beta), connettore Contentful. Il giornalista non cambia workflow: la certificazione avviene in background al momento della pubblicazione.",
                  tag: "REST API · Webhook · WordPress · Contentful",
                },
                {
                  step: "02",
                  title: "Certificazione automatica",
                  text: "Ogni articolo viene certificato in meno di 3 minuti senza intervento del giornalista. Il sistema analizza i claim, li correla con 4.000+ fonti classificate e genera il Verification Report.",
                  tag: "< 3 min · Zero intervento manuale",
                },
                {
                  step: "03",
                  title: "Badge visibile al lettore",
                  text: "Componente embeddabile con Trust Grade (A–F) e codice PP-XXXXXXXXXXXXXXXX. Il lettore può verificare il report originale su proofpress.ai in qualsiasi momento, indipendentemente da voi.",
                  tag: "Badge · Trust Grade · Codice PP-XXXX",
                },
              ].map(({ step, title, text, tag }) => (
                <div key={step} className="border border-[#0a0a0a]/8 p-6 flex flex-col gap-4">
                  <div className="text-3xl font-black" style={{ color: `${ORANGE}55`, fontFamily: FONT }}>{step}</div>
                  <h3 className="text-base font-black text-[#0a0a0a]" style={{ fontFamily: FONT }}>{title}</h3>
                  <p className="text-sm leading-relaxed text-[#0a0a0a]/60 flex-1">{text}</p>
                  <div className="text-[10px] font-mono text-[#0a0a0a]/35 border-t border-[#0a0a0a]/6 pt-3">{tag}</div>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════════════════
              COSA VEDE IL LETTORE — PROVA REALE
          ═══════════════════════════════════════════════════════════════════ */}
          <Section bg="#f8f8f6" id="esempio">
            <Label>Prova reale</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-8" style={{ fontFamily: FONT }}>
              Cosa vede il lettore.<br />
              <span className="text-[#0a0a0a]/30">Già oggi, su ProofPress Magazine.</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Esempio articolo certificato */}
              <div className="bg-white border border-[#0a0a0a]/8 p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 flex items-center justify-center text-white text-lg font-black shrink-0"
                    style={{ background: "#22c55e", fontFamily: FONT }}
                  >
                    A
                  </div>
                  <div>
                    <div className="text-xs font-mono text-[#0a0a0a]/35 uppercase tracking-widest">Trust Grade · 94/100</div>
                    <div className="text-xs font-bold text-[#0a0a0a]/55">8/8 claim corroborati</div>
                  </div>
                </div>
                <h3 className="text-sm font-black text-[#0a0a0a] leading-snug">
                  GPT-5.5: una nuova era dei modelli multimodali
                </h3>
                <p className="text-xs text-[#0a0a0a]/45 leading-relaxed">
                  Tutti i claim fattuali dell&apos;articolo sono stati confrontati con Reuters, MIT Technology Review,
                  OpenAI blog e 5 fonti peer-reviewed. Nessun claim risulta non corroborato.
                </p>
                <div className="text-[10px] font-mono text-[#0a0a0a]/30 border-t border-[#0a0a0a]/6 pt-3">
                  PP-A94F2B1C3D4E5F6A · Archiviato su IPFS · SHA-256 verificato
                </div>
                <a
                  href="https://proofpress.ai/methodology/v1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-70"
                  style={{ color: ORANGE, fontFamily: FONT }}
                >
                  Apri il Verification Report →
                </a>
              </div>
              {/* Esempio con grade C */}
              <div className="bg-white border border-[#0a0a0a]/8 p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 flex items-center justify-center text-white text-lg font-black shrink-0"
                    style={{ background: "#eab308", fontFamily: FONT }}
                  >
                    C
                  </div>
                  <div>
                    <div className="text-xs font-mono text-[#0a0a0a]/35 uppercase tracking-widest">Trust Grade · 67/100</div>
                    <div className="text-xs font-bold text-[#0a0a0a]/55">5/8 claim corroborati · 2 parziali · 1 non corroborato</div>
                  </div>
                </div>
                <h3 className="text-sm font-black text-[#0a0a0a] leading-snug">
                  Startup italiane: raccolta record nel 2024
                </h3>
                <p className="text-xs text-[#0a0a0a]/45 leading-relaxed">
                  Il claim &ldquo;+340% rispetto al 2023&rdquo; risulta parzialmente corroborato: confermato da 2 fonti
                  su 4. Il report indica la revisione consigliata prima della pubblicazione.
                </p>
                <div className="text-[10px] font-mono text-[#0a0a0a]/30 border-t border-[#0a0a0a]/6 pt-3">
                  PP-C67D8E9F0A1B2C3D · Archiviato su IPFS · SHA-256 verificato
                </div>
                <a
                  href="https://proofpress.ai/methodology/v1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-70"
                  style={{ color: ORANGE, fontFamily: FONT }}
                >
                  Apri il Verification Report →
                </a>
              </div>
            </div>
            <p className="text-xs text-[#0a0a0a]/30 mt-6 font-mono">
              * Esempi illustrativi basati su articoli reali pubblicati su ProofPress Magazine. 37+ articoli certificati e archiviati su IPFS.
            </p>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════════════════
              GRADING OPERATIVO (versione redazione, non duplica la madre)
          ═══════════════════════════════════════════════════════════════════ */}
          <Section id="grading">
            <Label>Il grading per la redazione</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-4" style={{ fontFamily: FONT }}>
              Cosa significa il grade<br />
              <span className="text-[#0a0a0a]/30">per un direttore editoriale.</span>
            </h2>
            <p className="text-sm text-[#0a0a0a]/45 mb-10 max-w-2xl leading-relaxed">
              La formula tecnica (40% coerenza + 30% qualità fonti + 20% bias + 10% freschezza) è documentata sulla{" "}
              <Link href="/proofpress-verify" className="underline hover:text-[#ff5500] transition-colors">pagina del protocollo</Link>.
              Qui la traduzione operativa per la redazione.
            </p>
            <div className="space-y-3">
              {[
                {
                  grade: "A",
                  range: "90–100",
                  color: "#22c55e",
                  editorial: "Articolo pubblicabile senza ulteriori controlli. Tutti i claim principali corroborati da fonti indipendenti.",
                  action: "Pubblica",
                },
                {
                  grade: "B",
                  range: "75–89",
                  color: "#3b82f6",
                  editorial: "Buona corroborazione. Revisione consigliata su 1–2 claim con corroborazione parziale.",
                  action: "Revisione leggera",
                },
                {
                  grade: "C",
                  range: "55–74",
                  color: "#eab308",
                  editorial: "Corroborazione parziale. Revisione obbligatoria prima della pubblicazione. Il report indica i claim da verificare manualmente.",
                  action: "Revisione obbligatoria",
                },
                {
                  grade: "D",
                  range: "40–54",
                  color: "#f97316",
                  editorial: "Corroborazione debole. L&apos;articolo va rivisto in profondità. Più della metà dei claim non è corroborata da fonti indipendenti.",
                  action: "Revisione profonda",
                },
                {
                  grade: "F",
                  range: "0–39",
                  color: "#ef4444",
                  editorial: "Non corroborato. Pubblicazione sconsigliata. Il Verification Report indica i claim problematici con dettaglio fonte per fonte.",
                  action: "Non pubblicare",
                },
              ].map(({ grade, range, color, editorial, action }) => (
                <div key={grade} className="grid md:grid-cols-12 gap-4 items-center border border-[#0a0a0a]/6 p-4">
                  <div className="md:col-span-1 flex items-center justify-center">
                    <div
                      className="w-10 h-10 flex items-center justify-center text-white text-lg font-black"
                      style={{ background: color, fontFamily: FONT }}
                    >
                      {grade}
                    </div>
                  </div>
                  <div className="md:col-span-1">
                    <div className="text-xs font-mono text-[#0a0a0a]/35">{range}</div>
                  </div>
                  <div className="md:col-span-8">
                    <p className="text-sm text-[#0a0a0a]/65 leading-relaxed">{editorial}</p>
                  </div>
                  <div className="md:col-span-2 text-right">
                    <span
                      className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1"
                      style={{ background: `${color}15`, color, fontFamily: FONT }}
                    >
                      {action}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════════════════
              PER CHI
          ═══════════════════════════════════════════════════════════════════ */}
          <Section bg="#f8f8f6" id="per-chi">
            <Label>Per chi</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-12" style={{ fontFamily: FONT }}>
              Per chi pubblica notizie<br />e vuole che si veda.
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: "📰",
                  title: "Testate giornalistiche",
                  text: "Ogni articolo esce con un Verification Report pubblico. Il badge ProofPress Verify è visibile al lettore con grade e score. La credibilità della testata non è più un'affermazione — è un dato misurabile, verificabile da chiunque in qualsiasi momento.",
                },
                {
                  icon: "✍️",
                  title: "Giornalisti freelance",
                  text: "Un freelance non ha una redazione di fact-checker alle spalle. Con News Verify, ogni suo contenuto è certificato con lo stesso rigore metodologico di una testata strutturata. Il Verification Report diventa il suo portfolio di credibilità.",
                },
                {
                  icon: "🏢",
                  title: "Brand media e corporate newsroom",
                  text: "Le corporate newsroom soffrono di un deficit strutturale di credibilità: i lettori le percepiscono come PR mascherata. News Verify dà ai contenuti aziendali un layer di certificazione indipendente che nessun disclaimer può sostituire.",
                },
                {
                  icon: "🤖",
                  title: "Redazioni AI-native",
                  text: "Per le redazioni che usano AI generativa, News Verify è il layer di accountability che trasforma contenuti AI-assisted in contenuti certificati. Ogni articolo generato con AI esce con la prova crittografica che i claim sono stati verificati.",
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

          {/* ═══════════════════════════════════════════════════════════════════
              PROVA SOCIALE
          ═══════════════════════════════════════════════════════════════════ */}
          <Section id="prova">
            <Label>Già attivo</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-8" style={{ fontFamily: FONT }}>
              News Verify è già in uso<br />
              <span className="text-[#0a0a0a]/30">su ProofPress Magazine.</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {[
                { value: "37+", label: "Articoli certificati e archiviati su IPFS" },
                { value: "< 3 min", label: "Tempo medio di certificazione per articolo" },
                { value: "100%", label: "Articoli con Verification Report pubblico" },
              ].map(({ value, label }) => (
                <div key={label} className="border border-[#0a0a0a]/8 p-6 text-center">
                  <div className="text-4xl font-black mb-2" style={{ color: ORANGE, fontFamily: FONT }}>{value}</div>
                  <div className="text-xs text-[#0a0a0a]/45 leading-snug">{label}</div>
                </div>
              ))}
            </div>
            <div className="bg-[#f8f8f6] border-l-4 p-6 max-w-2xl" style={{ borderColor: ORANGE }}>
              <p className="text-sm leading-relaxed text-[#0a0a0a]/70 italic mb-3">
                &ldquo;Avere un Verification Report pubblico su ogni articolo ha cambiato il modo in cui i lettori
                interagiscono con i nostri contenuti. Non ci chiedono più di fidarsi — verificano.&rdquo;
              </p>
              <div className="text-xs font-mono text-[#0a0a0a]/35 uppercase tracking-widest">
                Redazione ProofPress Magazine · Esempio tipico
              </div>
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════════════════
              FAQ PER REDAZIONI E CTO
          ═══════════════════════════════════════════════════════════════════ */}
          <Section bg="#f8f8f6" id="faq">
            <Label>FAQ</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-10" style={{ fontFamily: FONT }}>
              Le domande reali<br />
              <span className="text-[#0a0a0a]/30">di direttori e CTO.</span>
            </h2>
            <div className="max-w-3xl">
              <FaqItem
                q="Cosa succede se un articolo riceve un grade basso?"
                a="Il sistema genera il Verification Report con dettaglio claim per claim. Il giornalista o il desk editor riceve una notifica con i claim problematici e le fonti che non corroborano. La pubblicazione non viene bloccata automaticamente: la decisione finale resta editoriale. Il grade basso è un segnale, non un veto."
              />
              <FaqItem
                q="Il giornalista può vedere il Verification Report prima della pubblicazione?"
                a="Sì. Il report è disponibile in anteprima nel pannello di controllo redazionale non appena la certificazione è completata (< 3 minuti dall'invio). Il giornalista può rivedere i claim, aggiornare l'articolo e richiedere una nuova certificazione prima di pubblicare."
              />
              <FaqItem
                q="Funziona con articoli scritti interamente da umani, da AI, o misti?"
                a="Funziona con qualsiasi tipo di contenuto testuale, indipendentemente dall'origine. Il protocollo non distingue tra testo umano e AI: verifica i claim fattuali, non la loro provenienza. Questo è intenzionale: la certificazione riguarda i fatti, non il processo di scrittura."
              />
              <FaqItem
                q="Il badge è obbligatorio per tutti gli articoli o si può scegliere?"
                a="La configurazione è flessibile. Puoi attivare la certificazione automatica su tutti gli articoli, solo su determinate categorie (es. news, escluse le opinioni), o su richiesta esplicita del giornalista. Il badge è visibile al lettore solo se la testata sceglie di mostrarlo."
              />
              <FaqItem
                q="Come si integra News Verify nel nostro CMS?"
                a="Disponibili: REST API (documentazione completa su richiesta), Webhook su evento di pubblicazione, plugin WordPress (beta), connettore Contentful. Per CMS custom, l'integrazione richiede circa 2–4 ore di sviluppo lato IT. Il team ProofPress supporta l'onboarding tecnico."
              />
              <FaqItem
                q="Quanto costa per un volume tipo X articoli/giorno?"
                a="Il pricing è basato sul volume mensile di articoli certificati. Per testate fino a 30 articoli/giorno, i piani partono da €290/mese. Per volumi superiori, contattaci per un preventivo personalizzato. Non ci sono costi di setup o contratti annuali obbligatori."
              />
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════════════════
              CTA FINALE
          ═══════════════════════════════════════════════════════════════════ */}
          <section id="contact" className="py-24 md:py-32" style={{ background: "#0a0a0a" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8" ref={contactRef}>
              <div className="text-center mb-12">
                <Label light>Inizia con News Verify</Label>
                <h2
                  className="text-3xl md:text-5xl font-black leading-tight mb-6 text-white"
                  style={{ fontFamily: FONT }}
                >
                  La tua redazione merita<br />
                  <span style={{ color: ORANGE }}>un certificato, non un disclaimer.</span>
                </h2>
                <p className="text-base mb-4 max-w-xl mx-auto text-white/50">
                  Scrivici per integrare News Verify nella tua redazione, per richiedere una demo personalizzata,
                  o per esplorare partnership tecnologiche.
                </p>
              </div>
              {/* CTA preventivo */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                <a href="/preventivo-news-verify">
                  <button
                    className="inline-flex items-center justify-center text-white font-bold px-10 py-3 text-[15px] transition-opacity hover:opacity-90"
                    style={{ background: ORANGE, borderRadius: 0 }}
                  >
                    Richiedi preventivo gratuito →
                  </button>
                </a>
                <a href="/verify/demo">
                  <button
                    className="inline-flex items-center justify-center border-2 bg-transparent hover:bg-white/10 text-white font-bold px-10 py-3 text-[15px] transition-colors"
                    style={{ borderColor: "rgba(255,255,255,0.2)", borderRadius: 0 }}
                  >
                    Guarda la demo
                  </button>
                </a>
              </div>
              <p className="text-center text-[12px] text-white/30 tracking-[0.1em] uppercase mb-10" style={{ fontFamily: FONT }}>Nessun impegno · Risposta entro 24h · Demo personalizzata</p>
              <ContactForm origine="News Verify" />
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
