/*
 * INFO VERIFY — Estensione 02 di ProofPress Verify™
 * Pagina prodotto dedicata alla certificazione di contenuti informativi aziendali
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

export default function InfoVerify() {
  const contactRef = useRef<HTMLDivElement>(null);
  const scrollToContact = () => contactRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="flex min-h-screen">
      <LeftSidebar />
      <div className="flex-1 min-w-0">
        <SEOHead
          title="Info Verify — Certifica documenti e contenuti informativi con ProofPress Verify™"
          description="Info Verify certifica comunicati stampa, report aziendali, white paper e post social con hash SHA-256 e archiviazione IPFS. Integrità crittografica per ogni documento."
          canonical="https://proofpress.ai/proofpress-verify/info"
          ogSiteName="Proof Press"
        />
        <div className="min-h-screen" style={{ background: "#ffffff", color: "#0a0a0a", fontFamily: FONT }}>
          <SharedPageHeader />
          <BreakingNewsTicker />

          {/* BREADCRUMB */}
          <div className="max-w-5xl mx-auto px-5 md:px-8 pt-8">
            <nav className="flex items-center gap-2 text-xs text-[#0a0a0a]/40" style={{ fontFamily: FONT }}>
              <Link href="/proofpress-verify" className="hover:text-[#0984e3] transition-colors">ProofPress Verify™</Link>
              <span>/</span>
              <span className="text-[#0a0a0a]/70 font-semibold">Info Verify</span>
            </nav>
          </div>

          {/* HERO */}
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
                  Per Aziende · PR & Comms · Istituzioni
                </span>
              </div>
              <h1
                className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-[#0a0a0a] mb-6"
                style={{ fontFamily: FONT }}
              >
                <span style={{ color: BLUE }}>Info</span> Verify<br />
                <span className="text-[#0a0a0a]/25">Ogni documento. Certificato.</span>
              </h1>
              <p className="text-lg md:text-xl leading-relaxed text-[#0a0a0a]/65 max-w-4xl mb-10">
                Info Verify certifica qualsiasi contenuto informativo: comunicati stampa, report aziendali, white paper, post sui social. Ogni documento riceve un <strong className="text-[#0a0a0a]">certificato crittografico</strong> che prova l'integrità del contenuto nel tempo — immutabile, pubblico, verificabile da chiunque senza intermediari.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                <button
                  onClick={scrollToContact}
                  className="px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-80"
                  style={{ background: BLUE, fontFamily: FONT }}
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

          {/* CASI D'USO */}
          <Section id="use-case">
            <Label>Casi d'uso</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-12" style={{ fontFamily: FONT }}>
              Ogni documento ha un valore.<br />Info Verify lo rende dimostrabile.
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: "📢",
                  title: "Comunicati stampa",
                  text: "Un comunicato stampa certificato con Info Verify porta un hash crittografico che prova che il contenuto non è stato alterato dopo la pubblicazione. I giornalisti possono verificare l'integrità del documento in autonomia.",
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
                  icon: "⚖️",
                  title: "Documenti legali e compliance",
                  text: "Per aziende che operano in settori regolamentati, Info Verify fornisce un layer di accountability documentale: ogni documento certificato ha una prova crittografica di integrità che può essere presentata in contesti legali o di audit.",
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

          {/* COME FUNZIONA */}
          <Section bg="#f8f8f6" id="come-funziona">
            <Label>Come funziona</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-12" style={{ fontFamily: FONT }}>
              Carica. Certifica. Condividi.
            </h2>
            <div className="space-y-8">
              {[
                {
                  step: "01",
                  title: "Carica il documento",
                  text: "Carica il documento in formato testo, PDF o HTML. Il sistema accetta comunicati stampa, report, white paper, post social e qualsiasi contenuto informativo strutturato.",
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
          </Section>

          <Divider />

          {/* CTA FINALE */}
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
              <ContactForm origine="Info Verify" />
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
