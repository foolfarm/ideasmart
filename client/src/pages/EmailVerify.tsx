/*
 * EMAIL VERIFY — Estensione 03 di ProofPress Verify™
 * Pagina prodotto dedicata alla certificazione di newsletter e comunicazioni email
 */
import { useRef } from "react";
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

export default function EmailVerify() {
  const contactRef = useRef<HTMLDivElement>(null);
  const scrollToContact = () => contactRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="flex min-h-screen">
      <LeftSidebar />
      <div className="flex-1 min-w-0">
        <SEOHead
          title="Email Verify — Certifica newsletter e comunicazioni email con ProofPress Verify™"
          description="Email Verify certifica newsletter e comunicazioni email con hash SHA-256 e archiviazione IPFS. Ogni messaggio riceve un certificato crittografico di integrità."
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

          {/* HERO */}
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
                  Per Newsletter · Email Marketing · Comunicazioni
                </span>
              </div>
              <h1
                className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-[#0a0a0a] mb-6"
                style={{ fontFamily: FONT }}
              >
                <span style={{ color: GREEN }}>Email</span> Verify<br />
                <span className="text-[#0a0a0a]/25">Ogni email. Certificata.</span>
              </h1>
              <p className="text-lg md:text-xl leading-relaxed text-[#0a0a0a]/65 max-w-4xl mb-10">
                Email Verify certifica newsletter e comunicazioni email prima dell'invio. Ogni messaggio riceve un <strong className="text-[#0a0a0a]">hash crittografico SHA-256</strong> che prova che il contenuto non è stato alterato dopo la certificazione. Ideale per newsletter editoriali, comunicazioni istituzionali e qualsiasi email ad alto valore informativo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                <button
                  onClick={scrollToContact}
                  className="px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-80"
                  style={{ background: GREEN, fontFamily: FONT }}
                >
                  Richiedi una demo →
                </button>
                <Link
                  href="/proofpress-verify"
                  className="px-8 py-4 text-sm font-bold uppercase tracking-widest text-center border border-[#0a0a0a]/20 hover:border-[#0a0a0a]/50 transition-colors"
                  style={{ fontFamily: FONT }}
                >
                  ← Tutte le estensioni
                </Link>
              </div>
            </div>
          </section>

          <Divider />

          {/* PERCHÉ */}
          <Section id="perche">
            <Label>Il problema</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-8" style={{ fontFamily: FONT }}>
              Le email vengono alterate.<br />Nessuno lo sa.
            </h2>
            <div className="max-w-3xl space-y-5 text-base leading-relaxed text-[#0a0a0a]/70">
              <p>
                Le comunicazioni email sono vulnerabili per definizione: un messaggio può essere intercettato, modificato e reinoltrato senza che il destinatario abbia alcun modo di verificare se il contenuto che sta leggendo è identico a quello originariamente inviato.
              </p>
              <p>
                Per newsletter editoriali, comunicazioni finanziarie, aggiornamenti regolatori o qualsiasi email ad alto valore informativo, questa vulnerabilità è un rischio concreto. Un numero sbagliato, una data modificata, una dichiarazione alterata: la differenza tra il contenuto originale e quello ricevuto può avere conseguenze legali, reputazionali o finanziarie.
              </p>
              <p>
                Email Verify risolve questo problema con la stessa tecnologia crittografica usata per certificare le blockchain: <strong className="text-[#0a0a0a]">SHA-256 + IPFS</strong>. Il certificato è la prova che il contenuto non è stato toccato.
              </p>
            </div>
          </Section>

          <Divider />

          {/* COME FUNZIONA */}
          <Section bg="#f8f8f6" id="come-funziona">
            <Label>Come funziona</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-12" style={{ fontFamily: FONT }}>
              Scrivi. Certifica. Invia.
            </h2>
            <div className="space-y-8">
              {[
                {
                  step: "01",
                  title: "Prepara il contenuto",
                  text: "Scrivi la newsletter o la comunicazione email come faresti normalmente. Email Verify si integra con i principali ESP (Mailchimp, Brevo, Klaviyo, Substack) o accetta il contenuto in formato testo/HTML.",
                },
                {
                  step: "02",
                  title: "Certificazione pre-invio",
                  text: "Prima dell'invio, il contenuto viene hashato con SHA-256 e archiviato su IPFS. Il CID crittografico è la prova permanente del contenuto originale. Il processo richiede meno di 10 secondi.",
                },
                {
                  step: "03",
                  title: "Codice di verifica nell'email",
                  text: "Il codice PP-XXXXXXXXXXXXXXXX viene aggiunto automaticamente all'email (footer o header). Il destinatario può verificare l'integrità del contenuto in qualsiasi momento inserendo il codice su proofpress.ai/proofpress-verify.",
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
          </Section>

          <Divider />

          {/* PER CHI */}
          <Section id="per-chi">
            <Label>Per chi</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-12" style={{ fontFamily: FONT }}>
              Per chi invia email<br />che contano davvero.
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: "📧",
                  title: "Newsletter editoriali",
                  text: "Per newsletter con contenuti informativi ad alto valore: analisi di mercato, briefing settimanali, report esclusivi. Il certificato Email Verify è la prova che i tuoi iscritti stanno leggendo esattamente quello che hai scritto.",
                },
                {
                  icon: "🏛️",
                  title: "Comunicazioni istituzionali",
                  text: "Per enti pubblici, istituzioni finanziarie, organizzazioni regolate: ogni comunicazione certificata ha una prova crittografica di integrità che può essere presentata in contesti di audit o compliance.",
                },
                {
                  icon: "📈",
                  title: "Investor relations",
                  text: "Per comunicazioni agli investitori, aggiornamenti finanziari, earnings preview: il certificato Email Verify prova che il contenuto inviato agli investitori è identico a quello archiviato — protezione legale e reputazionale.",
                },
              ].map(({ icon, title, text }) => (
                <div key={title} className="p-6 border border-[#0a0a0a]/8">
                  <div className="text-2xl mb-3">{icon}</div>
                  <h3 className="font-black text-base mb-3 text-[#0a0a0a]" style={{ fontFamily: FONT }}>{title}</h3>
                  <p className="text-sm leading-relaxed text-[#0a0a0a]/65">{text}</p>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* CTA FINALE */}
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
              <ContactForm origine="Email Verify" />
            </div>
          </section>

          <div className="py-12 text-center" style={{ background: "#0a0a0a", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-sm text-white/30 italic max-w-2xl mx-auto px-5" style={{ fontFamily: FONT }}>
              "Non promettiamo verità. Forniamo evidenza. La differenza è tutto."
            </p>
          </div>
          <SharedPageFooter />
        </div>
      </div>
    </div>
  );
}
