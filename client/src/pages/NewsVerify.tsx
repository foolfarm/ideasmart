/*
 * NEWS VERIFY — Estensione 01 di ProofPress Verify™
 * Pagina prodotto dedicata alla certificazione di articoli giornalistici
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

export default function NewsVerify() {
  const contactRef = useRef<HTMLDivElement>(null);
  const scrollToContact = () => contactRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="flex min-h-screen">
      <LeftSidebar />
      <div className="flex-1 min-w-0">
        <SEOHead
          title="News Verify — Certifica ogni articolo con ProofPress Verify™"
          description="News Verify certifica ogni articolo pubblicato dalla tua redazione con hash SHA-256 e archiviazione IPFS. Verification Report pubblico, claim per claim."
          canonical="https://proofpress.ai/proofpress-verify/news"
          ogSiteName="Proof Press"
        />
        <div className="min-h-screen" style={{ background: "#ffffff", color: "#0a0a0a", fontFamily: FONT }}>
          <SharedPageHeader />
          <BreakingNewsTicker />

          {/* BREADCRUMB */}
          <div className="max-w-5xl mx-auto px-5 md:px-8 pt-8">
            <nav className="flex items-center gap-2 text-xs text-[#0a0a0a]/40" style={{ fontFamily: FONT }}>
              <Link href="/proofpress-verify" className="hover:text-[#ff5500] transition-colors">ProofPress Verify™</Link>
              <span>/</span>
              <span className="text-[#0a0a0a]/70 font-semibold">News Verify</span>
            </nav>
          </div>

          {/* HERO */}
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
                <span className="text-[#0a0a0a]/25">Ogni articolo. Certificato.</span>
              </h1>
              <p className="text-lg md:text-xl leading-relaxed text-[#0a0a0a]/65 max-w-4xl mb-10">
                News Verify certifica ogni articolo pubblicato dalla tua redazione. Ogni notizia esce con un <strong className="text-[#0a0a0a]">Verification Report pubblico</strong> che documenta, claim per claim, quante fonti indipendenti lo confermano e con quale credibilità. Il contenuto viene sigillato con hash SHA-256 e archiviato su IPFS — immutabile, verificabile da chiunque.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                <button
                  onClick={scrollToContact}
                  className="px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-80"
                  style={{ background: ORANGE, fontFamily: FONT }}
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

          {/* COME FUNZIONA */}
          <Section id="come-funziona">
            <Label>Come funziona</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-12" style={{ fontFamily: FONT }}>
              Dal testo al certificato.<br />In meno di 3 minuti.
            </h2>
            <div className="space-y-10">
              {[
                {
                  step: "01",
                  title: "Estrazione dei claim",
                  text: "Il sistema AI analizza il testo dell'articolo e identifica tutti i claim fattuali verificabili: dati numerici, attribuzioni, eventi, dichiarazioni. Ogni claim viene isolato e classificato per tipologia.",
                },
                {
                  step: "02",
                  title: "Corroborazione multi-fonte",
                  text: "Ogni claim viene confrontato con 4.000+ fonti classificate per credibilità: agenzie stampa (Reuters, AP, ANSA), database istituzionali (SEC, BCE, ISTAT), pubblicazioni peer-reviewed. Il sistema calcola un trust score per ogni claim.",
                },
                {
                  step: "03",
                  title: "Verification Report",
                  text: "Il sistema genera un Verification Report strutturato con esito per ogni singolo claim: corroborato, non corroborato, parzialmente corroborato. Il report include le fonti usate per ogni verifica.",
                },
                {
                  step: "04",
                  title: "Hash SHA-256 + IPFS",
                  text: "Il Verification Report viene hashato con SHA-256 e archiviato su IPFS tramite Pinata. Il CID crittografico garantisce che il contenuto non possa essere alterato senza che il CID cambi. La verifica è indipendente da ProofPress.",
                },
                {
                  step: "05",
                  title: "Badge trust grade",
                  text: "L'articolo riceve un badge visibile al lettore con il trust grade (A–F) e il codice PP-XXXXXXXXXXXXXXXX. Chiunque può inserire il codice su proofpress.ai/proofpress-verify per accedere al Verification Report originale.",
                },
              ].map(({ step, title, text }) => (
                <div key={step} className="grid md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-1">
                    <div className="text-4xl font-black leading-none" style={{ color: `${ORANGE}33`, fontFamily: FONT }}>{step}</div>
                  </div>
                  <div className="md:col-span-11 border-l-2 pl-6" style={{ borderColor: `${ORANGE}33` }}>
                    <h3 className="text-lg font-black mb-3 text-[#0a0a0a]" style={{ fontFamily: FONT }}>{title}</h3>
                    <p className="text-base leading-relaxed text-[#0a0a0a]/65">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* PER CHI */}
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

          {/* TRUST GRADE */}
          <Section id="grading">
            <Label>Il sistema di grading</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-8" style={{ fontFamily: FONT }}>
              Da A a F.<br />La credibilità diventa un numero.
            </h2>
            <p className="text-base text-[#0a0a0a]/55 mb-10 max-w-2xl leading-relaxed">
              Il trust score (0–100) viene calcolato su 4 dimensioni: coerenza fattuale (40%), qualità delle fonti (30%), assenza di bias (20%), freschezza dei dati (10%). Il grade sintetizza il score in una lettera leggibile dal lettore.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { grade: "A", range: "90–100", color: "#22c55e", desc: "Eccellente corroborazione" },
                { grade: "B", range: "75–89", color: "#3b82f6", desc: "Buona corroborazione" },
                { grade: "C", range: "55–74", color: "#eab308", desc: "Corroborazione parziale" },
                { grade: "D", range: "40–54", color: "#f97316", desc: "Corroborazione debole" },
                { grade: "F", range: "0–39", color: "#ef4444", desc: "Non corroborato" },
              ].map(({ grade, range, color, desc }) => (
                <div key={grade} className="p-5 border-2 text-center" style={{ borderColor: `${color}44`, background: `${color}08` }}>
                  <div className="text-4xl font-black mb-1" style={{ color, fontFamily: FONT }}>{grade}</div>
                  <div className="text-xs font-mono text-[#0a0a0a]/50 mb-2">{range}</div>
                  <div className="text-xs text-[#0a0a0a]/60 leading-tight">{desc}</div>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* CTA FINALE */}
          <section id="contact" className="py-24 md:py-32" style={{ background: "#f5f5f7" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8" ref={contactRef}>
              <div className="text-center mb-12">
                <Label>Inizia con News Verify</Label>
                <h2
                  className="text-3xl md:text-5xl font-black leading-tight mb-6"
                  style={{ fontFamily: FONT, color: "#0a0a0a" }}
                >
                  La tua redazione merita<br />
                  <span style={{ color: ORANGE }}>un certificato, non un disclaimer.</span>
                </h2>
                <p className="text-base mb-4 max-w-xl mx-auto" style={{ color: "#0a0a0a", opacity: 0.55 }}>
                  Scrivici per integrare News Verify nella tua redazione, per richiedere una demo personalizzata, o per esplorare partnership tecnologiche.
                </p>
              </div>
              <ContactForm origine="News Verify" />
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
