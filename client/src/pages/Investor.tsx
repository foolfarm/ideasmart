/*
 * /investor — ProofPress Pre-Seed Round
 * Stile: Apple/ghiaccio — sfondo #ffffff, testo #0a0a0a, accento #ff5500
 * Coerente con ChiSiamo.tsx e il resto del sito ProofPress
 */
import { useState, useEffect } from "react";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import LeftSidebar from "@/components/LeftSidebar";
import { trpc } from "@/lib/trpc";
import SEOHead from "@/components/SEOHead";

const FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const ORANGE = "#ff5500";
const DEADLINE = new Date("2026-05-30T23:59:59+02:00"); // 30 maggio 2026 mezzanotte CET

// ─── Utility components ──────────────────────────────────────────────────────
function Divider() {
  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8">
      <div className="border-t border-[#0a0a0a]/8" />
    </div>
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

function Section({
  children,
  bg = "transparent",
  id,
}: {
  children: React.ReactNode;
  bg?: string;
  id?: string;
}) {
  return (
    <section id={id} className="py-20 md:py-28" style={{ background: bg }}>
      <div className="max-w-5xl mx-auto px-5 md:px-8">{children}</div>
    </section>
  );
}

// ─── Countdown component ─────────────────────────────────────────────────────
function Countdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const diff = DEADLINE.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      className="mt-12 w-full"
      style={{
        background: "#0a0a0a",
        borderLeft: `4px solid ${ORANGE}`,
        padding: "2rem 2.5rem",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <span
          className="inline-block w-2 h-2 rounded-full animate-pulse"
          style={{ background: ORANGE }}
        />
        <span
          className="text-[11px] font-bold uppercase tracking-[0.25em]"
          style={{ color: ORANGE, fontFamily: FONT }}
        >
          Soft Commitment Window — Chiude il 30 Maggio 2026
        </span>
      </div>

      {/* Timer grande */}
      <div className="flex flex-wrap gap-2 md:gap-6 items-end mb-8">
        {[
          { val: timeLeft.days, label: "Giorni" },
          { val: timeLeft.hours, label: "Ore" },
          { val: timeLeft.minutes, label: "Minuti" },
          { val: timeLeft.seconds, label: "Secondi" },
        ].map(({ val, label }, i) => (
          <div key={label} className="flex items-end gap-2 md:gap-6">
            <div className="text-center">
              <div
                className="text-5xl md:text-7xl font-black leading-none tabular-nums"
                style={{ color: "#ffffff", fontFamily: FONT, letterSpacing: "-0.04em" }}
              >
                {pad(val)}
              </div>
              <div
                className="text-[10px] uppercase tracking-[0.2em] mt-2"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                {label}
              </div>
            </div>
            {i < 3 && (
              <span
                className="text-3xl md:text-5xl font-black mb-4"
                style={{ color: ORANGE, lineHeight: 1 }}
              >
                :
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Messaggio evento */}
      <div
        className="border-t pt-6"
        style={{ borderColor: "rgba(255,255,255,0.1)" }}
      >
        <p
          className="text-base md:text-lg font-bold mb-2"
          style={{ color: "#ffffff", fontFamily: FONT }}
        >
          Entro il 30 maggio organizzeremo un Investor Day riservato a chi ha espresso interesse.
        </p>
        <p
          className="text-sm leading-relaxed mb-6"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          Chi invia un soft commitment entro questa data riceverà un invito personale all'evento di
          presentazione privato con il team ProofPress — demo live della piattaforma, roadmap dettagliata
          e accesso ai termini definitivi del round.{" "}
          Il lancio ufficiale è fissato per il{" "}
          <strong style={{ color: "#ffffff" }}>1 giugno 2026</strong>.
          I posti sono limitati.
        </p>
        <a
          href="#form-investor"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
          style={{ background: ORANGE, color: "#ffffff", fontFamily: FONT }}
        >
          Invia il tuo interesse →
        </a>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Investor() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState<"25k" | "50k" | "100k" | "">("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = trpc.investor.submitInterest.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !amount) return;
    submitMutation.mutate({
      name,
      email,
      message: `Taglio proposto: ${amount.toUpperCase()} — ${message}`.trim(),
    });
  };

  return (
    <>
      <SEOHead
        title="Investi in ProofPress — Pre-Seed Round 250K · AI Journalism Certificato"
        description="ProofPress sta aprendo il suo primo round pre-seed da 250.000 € a valutazione 2,5M. Una piattaforma di giornalismo agentico certificato che trasforma il modo in cui si costruiscono e distribuiscono le notizie."
        canonical="https://proofpress.ai/investor"
        ogImage="https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/proofpress-icon-512-final_6afd42ba.png"
        ogType="website"
        keywords="ProofPress investor, pre-seed round, AI journalism, giornalismo agentico, startup investimento"
      />
    <div className="flex min-h-screen">
      <LeftSidebar />
      <div className="flex-1 min-w-0">
        <div
          className="min-h-screen"
          style={{ background: "#ffffff", color: "#0a0a0a", fontFamily: FONT }}
        >
          <SharedPageHeader />
          {/* ── HERO ─────────────────────────────────────────────────────────── */}
          <section className="pt-24 pb-20 md:pt-32 md:pb-28" style={{ background: "#ffffff" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8">

              {/* Badge */}
              <div className="mb-6">
                <span
                  className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] px-3 py-1 border"
                  style={{ color: ORANGE, borderColor: `${ORANGE}44`, background: `${ORANGE}0d`, fontFamily: FONT }}
                >
                  Pre-Seed Round · Apertura Limitata · Target 250.000 € · Valutazione 2,5M €
                </span>
              </div>

              {/* Headline visionaria */}
              <div className="max-w-3xl mb-8">
                <h1
                  className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-[#0a0a0a] mb-6"
                  style={{ fontFamily: FONT }}
                >
                  Investi in una<br />
                  <span style={{ color: ORANGE }}>nuova era</span><br />
                  del giornalismo.
                </h1>
                <p
                  className="text-lg md:text-xl leading-relaxed text-[#0a0a0a]/65 max-w-2xl mb-4"
                  style={{ fontFamily: FONT }}
                >
                  ProofPress è la piattaforma che consente all'editoria di unire la potenza
                  dell'AI e la creatività dell'uomo per portare il giornalismo a una nuova dimensione.
                  Nata quasi per caso come bulletin board, è oggi una redazione agentica live,
                  con 6.259 iscritti attivi e una tecnologia di certificazione unica in Europa.
                </p>
                <p
                  className="text-base leading-relaxed text-[#0a0a0a]/55 max-w-2xl"
                  style={{ fontFamily: FONT }}
                >
                  Siamo pronti al lancio. Stiamo aprendo il nostro primo round pre-seed
                  per i partner che vogliono costruire con noi il futuro dell'informazione.
                </p>
              </div>

              {/* Metriche */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 py-8 border-t border-b border-[#0a0a0a]/8">
                {[
                  { val: "6.259", label: "iscritti newsletter attivi" },
                  { val: "4.000+", label: "fonti monitorate 24/7" },
                  { val: "2,5M €", label: "valutazione pre-seed" },
                  { val: "250K €", label: "target round" },
                ].map(({ val, label }) => (
                  <div key={val}>
                    <div className="text-3xl md:text-4xl font-black mb-1" style={{ color: ORANGE, fontFamily: FONT }}>
                      {val}
                    </div>
                    <div className="text-xs text-[#0a0a0a]/50 uppercase tracking-wide leading-snug">{label}</div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4 mb-0">
                <a
                  href="#form-investor"
                  className="inline-block px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-80"
                  style={{ background: ORANGE, fontFamily: FONT }}
                >
                  Proponi il tuo investimento →
                </a>
                <a
                  href="#cosa-e"
                  className="inline-block px-8 py-4 text-sm font-bold uppercase tracking-widest border transition-colors hover:bg-[#0a0a0a]/5"
                  style={{ borderColor: "#0a0a0a", color: "#0a0a0a", fontFamily: FONT }}
                >
                  Scopri ProofPress
                </a>
              </div>

              {/* Countdown */}
              <Countdown />
            </div>
          </section>

          <Divider />

          {/* ── COSA È PROOFPRESS ────────────────────────────────────────────── */}
          <Section bg="#f8f8f6" id="cosa-e">
            <Label>Cos'è ProofPress</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-6" style={{ fontFamily: FONT }}>
              Non un media.<br />Un'infrastruttura per<br />l'informazione del futuro.
            </h2>
            <p className="text-base text-[#0a0a0a]/65 leading-relaxed max-w-2xl mb-12">
              ProofPress è una piattaforma agentica che trasforma il modo in cui le notizie vengono
              create, verificate e distribuite. Dodici agenti AI lavorano in parallelo 24 ore su 24:
              monitorano oltre 4.000 fonti, scrivono articoli, li verificano con il protocollo
              ProofPress Verify e li pubblicano in tempo reale. Il giornalista umano mantiene
              il controllo strategico ed editoriale. La macchina fa il resto.
            </p>
            <div className="space-y-10">
              {[
                {
                  n: "01",
                  title: "Giornalismo Agentico",
                  text: "Una redazione di 12 agenti AI che scrivono, riscrivono, titolano e pubblicano in automatico. Ogni agente è specializzato su un verticale: AI, startup, finanza, mercati, ricerca. Nessun intervento umano nella produzione — solo nella direzione.",
                },
                {
                  n: "02",
                  title: "Certificazione ProofPress Verify",
                  text: "Ogni notizia viene analizzata da un sistema multi-agente che ne misura affidabilità, coerenza fattuale e obiettività. Il Verification Report viene sigillato con hash crittografico SHA-256 immutabile: tracciabile, verificabile nel tempo, impossibile da alterare.",
                },
                {
                  n: "03",
                  title: "Distribuzione Certificata",
                  text: "Newsletter quotidiana a 6.259 iscritti attivi (crescita organica, zero paid). Sito live su proofpress.ai. Pipeline di distribuzione multicanale: email, web, social, API. Ogni contenuto porta il sigillo ProofPress Verify.",
                },
              ].map(({ n, title, text }) => (
                <div key={n} className="grid md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-1">
                    <div className="text-5xl font-black leading-none" style={{ color: `${ORANGE}33`, fontFamily: FONT }}>{n}</div>
                  </div>
                  <div className="md:col-span-11">
                    <h3 className="text-lg font-black mb-2 text-[#0a0a0a]" style={{ fontFamily: FONT }}>{title}</h3>
                    <p className="text-base text-[#0a0a0a]/65 leading-relaxed">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ── COSA VOGLIAMO DIVENTARE ──────────────────────────────────────── */}
          <Section id="visione">
            <Label>Visione</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-6" style={{ fontFamily: FONT }}>
              Cosa vogliamo<br />
              <span style={{ color: ORANGE }}>diventare.</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-12 mb-14">
              <div>
                <p className="text-base text-[#0a0a0a]/65 leading-relaxed mb-6">
                  ProofPress vuole diventare il <strong>market leader europeo dell'AI Journalism certificato</strong>:
                  la piattaforma di riferimento per editori, media company, corporate e istituzioni
                  che vogliono produrre e distribuire informazione verificata, scalabile e conforme
                  all'AI Act europeo.
                </p>
                <p className="text-base text-[#0a0a0a]/65 leading-relaxed">
                  Non un'altra testata digitale. Un'infrastruttura abilitante: il layer di verifica
                  e produzione su cui l'editoria del futuro costruirà i propri prodotti editoriali.
                  Il modello è quello delle piattaforme — non dei media tradizionali.
                </p>
              </div>
              <div>
                <p className="text-base text-[#0a0a0a]/65 leading-relaxed mb-6">
                  Nasce un nuovo media dove AI e uomo collaborano: l'intelligenza artificiale
                  gestisce volume, velocità e verifica. Il giornalista umano porta giudizio,
                  etica e direzione editoriale. Il risultato è informazione di qualità superiore,
                  prodotta a costi radicalmente inferiori.
                </p>
                <p className="text-base text-[#0a0a0a]/65 leading-relaxed">
                  Obiettivo 2027: <strong>50.000 iscritti</strong>, <strong>10 clienti enterprise attivi</strong>,
                  espansione EU in 4 lingue, API Verify licenziata a terze parti.
                  Il Seed Round seguirà entro 12 mesi dalla chiusura del pre-seed.
                </p>
              </div>
            </div>

            {/* 3 pilastri visione */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: "🌍",
                  title: "Market Leader EU",
                  text: "Prima piattaforma europea di AI Journalism certificato. Standard di riferimento per l'editoria conforme all'AI Act. Moat tecnologico costruito ora, quando il mercato è ancora vergine.",
                },
                {
                  icon: "🏗",
                  title: "Piattaforma, non testata",
                  text: "ProofPress Magazine è il proof of concept. Il prodotto vero è la pipeline agentica e il protocollo Verify: licenziabili, scalabili, integrabili in qualsiasi flusso editoriale.",
                },
                {
                  icon: "⚡",
                  title: "Built to Scale",
                  text: "Architettura cloud-native, API-first, multi-lingua. Da 1 a 100 clienti senza riscrivere una riga. Costruito per crescere veloce e uscire strategicamente.",
                },
              ].map(({ icon, title, text }) => (
                <div key={title} className="border border-[#0a0a0a]/10 p-6" style={{ background: "#f8f8f6" }}>
                  <div className="text-2xl mb-3">{icon}</div>
                  <h3 className="text-base font-black mb-2 text-[#0a0a0a]" style={{ fontFamily: FONT }}>{title}</h3>
                  <p className="text-sm text-[#0a0a0a]/60 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ── MODELLO DI OFFERTA ───────────────────────────────────────────── */}
          <Section bg="#f8f8f6" id="offerta">
            <Label>Modello di offerta</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-4" style={{ fontFamily: FONT }}>
              Chi paga per ProofPress.
            </h2>
            <p className="text-base text-[#0a0a0a]/55 mb-14 max-w-2xl">
              Tre mercati distinti, tre flussi di ricavo. La piattaforma è già operativa su
              ProofPress Magazine come proof of concept. Il round serve a scalare la tecnologia
              e acquisire i primi clienti enterprise.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: "📰",
                  segment: "Media & Publisher",
                  model: "Licenza SaaS",
                  desc: "Editori, testate digitali e creator che vogliono una redazione AI-native. Licenza della pipeline agentica per produrre contenuti certificati in autonomia.",
                  price: "Da €690/mese",
                  alt: "Alternativa: revenue sharing 20%",
                },
                {
                  icon: "🏢",
                  segment: "Enterprise & Corporate",
                  model: "Intelligence Certificata",
                  desc: "Aziende e C-suite che necessitano di intelligence su mercati, competitor e trend. Report certificati per decisioni strategiche, board e investor relations.",
                  price: "Da €2.500/mese",
                  alt: "Pilota enterprise Q4 2026",
                },
                {
                  icon: "⚖️",
                  segment: "Finanza, Legal & PA",
                  model: "Compliance & Monitoring",
                  desc: "Banche, studi legali e PA che necessitano di monitoraggio disinformazione e news verification per compliance, M&A e due diligence.",
                  price: "Custom pricing",
                  alt: "Conforme AI Act europeo",
                },
              ].map(({ icon, segment, model, desc, price, alt }) => (
                <div key={segment} className="border border-[#0a0a0a]/10 p-7 flex flex-col" style={{ background: "#ffffff" }}>
                  <div className="text-3xl mb-4">{icon}</div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: "rgba(10,10,10,0.35)" }}>{model}</div>
                  <h3 className="text-lg font-black mb-3 text-[#0a0a0a]" style={{ fontFamily: FONT }}>{segment}</h3>
                  <p className="text-sm text-[#0a0a0a]/60 leading-relaxed flex-1 mb-4">{desc}</p>
                  <div className="text-base font-black mb-1" style={{ color: ORANGE, fontFamily: FONT }}>{price}</div>
                  <div className="text-xs text-[#0a0a0a]/40 italic">{alt}</div>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ── PRE-SEED ROUND ───────────────────────────────────────────────── */}
          <Section id="round">
            <Label>Pre-Seed Round 2026</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-4" style={{ fontFamily: FONT }}>
              250.000 € per diventare<br />market leader.
            </h2>
            <p className="text-base text-[#0a0a0a]/55 mb-14 max-w-2xl">
              Il round pre-seed serve a trasformare ProofPress da proof of concept operativo
              a piattaforma scalabile. Valutazione pre-money: <strong>2,5 milioni di euro</strong>.
              Il team combina competenze editoriali, tecnologiche e di business development.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-14">
              {[
                {
                  pct: "40%",
                  area: "Tecnologia",
                  amount: "100.000 €",
                  items: ["Scalabilità pipeline agentica", "API ProofPress Verify per terze parti", "Dashboard enterprise self-service", "Integrazione multicanale"],
                },
                {
                  pct: "35%",
                  area: "Go-to-Market",
                  amount: "87.500 €",
                  items: ["3 pilot enterprise (media, banca, PA)", "PR e lancio ufficiale in Italia", "Sales & business development", "Certificazioni AI Act"],
                },
                {
                  pct: "25%",
                  area: "Operations",
                  amount: "62.500 €",
                  items: ["Team editoriale e supervisione AI", "Infrastruttura cloud e sicurezza", "Legal, IP e protezione brevetti", "Runway 12 mesi fino al Seed"],
                },
              ].map(({ pct, area, amount, items }) => (
                <div key={area} className="border border-[#0a0a0a]/10 p-7" style={{ background: "#f8f8f6" }}>
                  <div className="text-4xl font-black mb-1" style={{ color: ORANGE, fontFamily: FONT }}>{pct}</div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: "rgba(10,10,10,0.35)" }}>{area}</div>
                  <div className="text-base font-black mb-4 text-[#0a0a0a]" style={{ fontFamily: FONT }}>{amount}</div>
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-[#0a0a0a]/65">
                        <span style={{ color: ORANGE }} className="font-bold mt-0.5">→</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Roadmap */}
            <div className="border-t border-[#0a0a0a]/8 pt-12">
              <Label>Roadmap 2026–2027</Label>
              <div className="space-y-8">
                {[
                  { q: "1 Giugno 2026", title: "Lancio Ufficiale", desc: "Chiusura pre-seed. Lancio pubblico ProofPress. Avvio sviluppo API Verify. Primo pilot enterprise." },
                  { q: "Q3 2026", title: "Enterprise Traction", desc: "Versione enterprise della piattaforma. 3 clienti beta attivi. 15.000 iscritti newsletter." },
                  { q: "Q4 2026", title: "Seed Round", desc: "3 contratti enterprise firmati. Avvio raccolta Seed Round. Espansione team." },
                  { q: "Q1–Q2 2027", title: "Espansione EU", desc: "Versioni in inglese, francese, spagnolo. Target 50.000 iscritti. Market leader EU certificato." },
                ].map(({ q, title, desc }) => (
                  <div key={q} className="grid md:grid-cols-12 gap-4 items-start">
                    <div className="md:col-span-2">
                      <div className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: ORANGE }}>{q}</div>
                    </div>
                    <div className="md:col-span-10">
                      <h3 className="text-base font-black mb-1 text-[#0a0a0a]" style={{ fontFamily: FONT }}>{title}</h3>
                      <p className="text-sm text-[#0a0a0a]/60 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Divider />



          <Divider />

          {/* ── FORM PROPOSTA INVESTIMENTO ───────────────────────────────────── */}
          <Section id="form-investor">
            <div className="max-w-2xl">
              <Label>Proponi il tuo investimento</Label>
              <h2 className="text-3xl md:text-4xl font-black leading-tight mb-4" style={{ fontFamily: FONT }}>
                Vuoi investire<br />in ProofPress?
              </h2>
              <p className="text-base text-[#0a0a0a]/55 mb-3">
                I tagli di investimento disponibili nel round pre-seed sono:
              </p>

              {/* Tagli */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { key: "25k" as const, label: "25.000 €", sub: "~1% equity" },
                  { key: "50k" as const, label: "50.000 €", sub: "~2% equity" },
                  { key: "100k" as const, label: "100.000 €", sub: "~4% equity" },
                ].map(({ key, label, sub }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setAmount(key)}
                    className="border p-4 text-center transition-all"
                    style={{
                      borderColor: amount === key ? ORANGE : "#0a0a0a22",
                      background: amount === key ? `${ORANGE}0d` : "#f8f8f6",
                      fontFamily: FONT,
                    }}
                  >
                    <div className="text-lg font-black text-[#0a0a0a]" style={{ fontFamily: FONT }}>{label}</div>
                    <div className="text-xs text-[#0a0a0a]/45 mt-1">{sub}</div>
                  </button>
                ))}
              </div>

              <p className="text-xs text-[#0a0a0a]/40 mb-8 italic">
                Valutazione pre-money: 2,5M €.
                Equity calcolata indicativamente su valutazione pre-money. I termini definitivi saranno
                concordati con ogni investitore.
              </p>

              {submitted ? (
                <div className="border border-[#0a0a0a]/10 p-8" style={{ background: "#f8f8f6" }}>
                  <div className="text-2xl font-black mb-2" style={{ color: ORANGE, fontFamily: FONT }}>
                    Proposta ricevuta.
                  </div>
                  <p className="text-base text-[#0a0a0a]/65">
                    Il team ti risponderà entro 24 ore con i termini del round.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-[0.15em] mb-2 text-[#0a0a0a]/50" htmlFor="inv-name">
                        Nome *
                      </label>
                      <input
                        id="inv-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Mario Rossi"
                        className="w-full border border-[#0a0a0a]/15 px-4 py-3 text-sm outline-none focus:border-[#0a0a0a]/40 transition-colors"
                        style={{ background: "#f8f8f6", fontFamily: FONT }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-[0.15em] mb-2 text-[#0a0a0a]/50" htmlFor="inv-email">
                        Email *
                      </label>
                      <input
                        id="inv-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="mario@fund.com"
                        className="w-full border border-[#0a0a0a]/15 px-4 py-3 text-sm outline-none focus:border-[#0a0a0a]/40 transition-colors"
                        style={{ background: "#f8f8f6", fontFamily: FONT }}
                      />
                    </div>
                  </div>

                  {!amount && (
                    <p className="text-xs text-[#0a0a0a]/45 italic">Seleziona un taglio di investimento qui sopra per continuare.</p>
                  )}

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.15em] mb-2 text-[#0a0a0a]/50" htmlFor="inv-message">
                      Note aggiuntive (opzionale)
                    </label>
                    <textarea
                      id="inv-message"
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Sono un investitore / fondo / family office / angel. Vorrei capire..."
                      className="w-full border border-[#0a0a0a]/15 px-4 py-3 text-sm outline-none focus:border-[#0a0a0a]/40 transition-colors resize-none"
                      style={{ background: "#f8f8f6", fontFamily: FONT }}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <button
                      type="submit"
                      disabled={submitMutation.isPending || !name || !email || !amount}
                      className="px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-80 disabled:opacity-40"
                      style={{ background: ORANGE, fontFamily: FONT, border: "none", cursor: name && email && amount ? "pointer" : "not-allowed" }}
                    >
                      {submitMutation.isPending ? "Invio..." : "Invia la tua proposta →"}
                    </button>
                    <p className="text-xs text-[#0a0a0a]/35 mt-3 sm:mt-4 leading-relaxed">
                      I tuoi dati non vengono condivisi con terze parti.<br />
                      Nessuna newsletter automatica.
                    </p>
                  </div>

                  {submitMutation.isError && (
                    <p className="text-sm text-red-500">
                      Errore nell'invio. Scrivi direttamente a{" "}
                      <a href="mailto:info@proofpress.ai" style={{ color: ORANGE }}>info@proofpress.ai</a>
                    </p>
                  )}
                </form>
              )}
            </div>
          </Section>

          <SharedPageFooter />
        </div>
      </div>
    </div>
    </>
  );
}
