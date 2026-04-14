/*
 * /investor — ProofPress Pre-Seed Round
 * Stile: Apple/ghiaccio — sfondo #ffffff, testo #0a0a0a, accento #ff5500
 * Coerente con ChiSiamo.tsx e il resto del sito ProofPress
 */
import { useState, useEffect } from "react";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import LeftSidebar from "@/components/LeftSidebar";
import { trpc } from "@/lib/trpc";

const FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const ORANGE = "#ff5500";
const DEADLINE = new Date("2026-04-30T23:59:59+02:00"); // 30 aprile 2026 mezzanotte CET

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
      className="border border-[#0a0a0a]/10 p-6 md:p-8 mt-10"
      style={{ background: "#f8f8f6" }}
    >
      <p
        className="text-[11px] font-bold uppercase tracking-[0.2em] mb-4"
        style={{ color: ORANGE }}
      >
        Chiusura Pre-Seed Round — 30 aprile 2026 · Lancio ufficiale 1 maggio
      </p>
      <div className="flex gap-6 md:gap-10 items-end">
        {[
          { val: timeLeft.days, label: "giorni" },
          { val: timeLeft.hours, label: "ore" },
          { val: timeLeft.minutes, label: "minuti" },
          { val: timeLeft.seconds, label: "secondi" },
        ].map(({ val, label }) => (
          <div key={label} className="text-center">
            <div
              className="text-4xl md:text-5xl font-black leading-none tabular-nums"
              style={{ color: "#0a0a0a", fontFamily: FONT }}
            >
              {pad(val)}
            </div>
            <div className="text-[10px] uppercase tracking-[0.15em] mt-1 text-[#0a0a0a]/40">
              {label}
            </div>
          </div>
        ))}
        <div className="hidden md:block flex-1 border-l border-[#0a0a0a]/8 pl-8 ml-2">
          <p className="text-sm text-[#0a0a0a]/55 leading-relaxed">
            Il round pre-seed si chiude il <strong>30 aprile 2026</strong>.<br />
            Il lancio ufficiale della piattaforma è fissato per il <strong>1 maggio 2026</strong>.<br />
            I posti sono limitati. Chi entra ora entra ai termini migliori.
          </p>
        </div>
      </div>
      <p className="block md:hidden text-sm text-[#0a0a0a]/55 leading-relaxed mt-4">
        Il round si chiude il <strong>30 aprile</strong>. Lancio ufficiale <strong>1 maggio 2026</strong>. Posti limitati.
      </p>
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
    <div className="flex min-h-screen">
      <LeftSidebar />
      <div className="flex-1 min-w-0">
        <div
          className="min-h-screen"
          style={{ background: "#ffffff", color: "#0a0a0a", fontFamily: FONT }}
        >
          <SharedPageHeader />
          <BreakingNewsTicker />

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
                  text: "Architettura cloud-native, API-first, multi-lingua. Da 1 a 100 clienti senza riscrivere una riga. Il modello FoolFarm: costruito per crescere veloce e uscire strategicamente.",
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
              Team guidato da Andrea Cinelli (2 exit, 25+ brevetti).
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
                  { q: "1 Maggio 2026", title: "Lancio Ufficiale", desc: "Chiusura pre-seed. Lancio pubblico ProofPress. Avvio sviluppo API Verify. Primo pilot enterprise." },
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

          {/* ── FOUNDER ──────────────────────────────────────────────────────── */}
          <Section bg="#f8f8f6" id="founder">
            <Label>Il Fondatore</Label>
            <div className="grid md:grid-cols-12 gap-10 items-start">
              {/* Avatar monogramma */}
              <div className="md:col-span-2 flex flex-col items-start gap-4">
                <div
                  className="w-20 h-20 flex items-center justify-center text-3xl font-black border-2 border-[#0a0a0a]/20"
                  style={{ background: "#0a0a0a", color: "#ffffff", fontFamily: FONT, letterSpacing: "-0.04em" }}
                >
                  AC
                </div>
              </div>

              {/* Bio */}
              <div className="md:col-span-10">
                <h2 className="text-2xl md:text-4xl font-black mb-1 text-[#0a0a0a]" style={{ fontFamily: FONT }}>
                  Andrea Cinelli
                </h2>
                <p className="text-sm font-bold uppercase tracking-[0.18em] mb-1" style={{ color: ORANGE }}>
                  Co-Founder ProofPress
                </p>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#0a0a0a]/40 mb-7">
                  2 Exit (Inventia, Takeacoder) · 25+ Brevetti · 30+ anni di esperienza
                </p>

                <p className="text-base text-[#0a0a0a]/70 leading-relaxed mb-5">
                  30+ anni di esperienza nella costruzione di prodotti digitali e piattaforme tecnologiche
                  a scala. Co-fondatore di <strong className="text-[#0a0a0a]">Libero.it</strong> (10M+ utenti, Infostrada–Olivetti Group),
                  Head of Mobile VAS <strong className="text-[#0a0a0a]">Vodafone Global</strong> a Düsseldorf,
                  serial entrepreneur con <strong className="text-[#0a0a0a]">2 exit</strong> (Inventia, Takeacoder).
                </p>
                <p className="text-base text-[#0a0a0a]/70 leading-relaxed mb-5">
                  Autore di <strong className="text-[#0a0a0a]">25+ brevetti</strong> — tra cui IP alla base del sistema
                  <strong className="text-[#0a0a0a]"> SPID</strong> italiano.
                  Membro dell'<strong className="text-[#0a0a0a]">Advisory Board Deloitte</strong> Central Mediterranean.
                  Professore di AI al <strong className="text-[#0a0a0a]">Sole 24 Ore Business School</strong>.
                </p>
                <p className="text-base text-[#0a0a0a]/70 leading-relaxed mb-8">
                  Keynote speaker internazionale su AI e innovazione. Fondatore di
                  <strong className="text-[#0a0a0a]"> FoolFarm</strong>, uno dei principali AI Venture Studio europei.
                </p>

                {/* Tag credenziali */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {[
                    "Co-fondatore Libero.it",
                    "2 Exit",
                    "25+ Brevetti",
                    "Advisory Board Deloitte",
                    "Prof. AI Sole 24 Ore",
                    "FoolFarm Venture Studio",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-bold uppercase tracking-wide px-3 py-1.5 border border-[#0a0a0a]/15"
                      style={{ color: "#0a0a0a", background: "#ffffff" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* LinkedIn CTA */}
                <a
                  href="https://linkedin.com/in/andreacinelli"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-70"
                  style={{ color: ORANGE, fontFamily: FONT }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn → linkedin.com/in/andreacinelli
                </a>
              </div>
            </div>
          </Section>

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
                Valutazione pre-money: 2,5M €. Il team è guidato da Andrea Cinelli (2 exit, 25+ brevetti).
                Equity calcolata indicativamente su valutazione pre-money. I termini definitivi saranno
                concordati con ogni investitore.
              </p>

              {submitted ? (
                <div className="border border-[#0a0a0a]/10 p-8" style={{ background: "#f8f8f6" }}>
                  <div className="text-2xl font-black mb-2" style={{ color: ORANGE, fontFamily: FONT }}>
                    Proposta ricevuta.
                  </div>
                  <p className="text-base text-[#0a0a0a]/65">
                    Ti rispondo entro 24 ore con i termini del round. — Andrea Cinelli
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
                      <a href="mailto:ac@acinelli.com" style={{ color: ORANGE }}>ac@acinelli.com</a>
                    </p>
                  )}
                </form>
              )}
            </div>
          </Section>

          <Divider />

          {/* ── FOOTER MINI ──────────────────────────────────────────────────── */}
          <section className="py-10" style={{ background: "#ffffff" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-[#0a0a0a]/35" style={{ fontFamily: FONT }}>
                © 2026 ProofPress · Agentic Certified Journalism Platform ·{" "}
                <a href="https://proofpress.ai" className="hover:opacity-70 transition-opacity" style={{ color: ORANGE }}>
                  proofpress.ai
                </a>
              </p>
              <p className="text-xs text-[#0a0a0a]/35" style={{ fontFamily: FONT }}>
                Investor Relations:{" "}
                <a href="mailto:ac@acinelli.com" className="hover:opacity-70 transition-opacity" style={{ color: ORANGE }}>
                  ac@acinelli.com
                </a>
              </p>
            </div>
          </section>

          <SharedPageFooter />
        </div>
      </div>
    </div>
  );
}
