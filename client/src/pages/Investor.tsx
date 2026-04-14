/*
 * /investor — ProofPress Pre-Seed Round
 * Stile: Apple/ghiaccio — sfondo #ffffff, testo #0a0a0a, accento #ff5500 (orange)
 * Coerente con ChiSiamo.tsx e il resto del sito ProofPress
 * Tono: board-level, dati concreti, visione chiara, CTA diretta
 */
import { useState } from "react";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import LeftSidebar from "@/components/LeftSidebar";
import { trpc } from "@/lib/trpc";

const FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const ORANGE = "#ff5500";

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

// ─── Main component ───────────────────────────────────────────────────────────
export default function Investor() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = trpc.investor.submitInterest.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    submitMutation.mutate({ name, email, message: message || undefined });
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
          <section
            className="pt-24 pb-20 md:pt-32 md:pb-28"
            style={{ background: "#ffffff" }}
          >
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              {/* Badge pre-seed */}
              <div className="mb-6">
                <span
                  className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] px-3 py-1 border"
                  style={{
                    color: ORANGE,
                    borderColor: `${ORANGE}44`,
                    background: `${ORANGE}0d`,
                    fontFamily: FONT,
                  }}
                >
                  Pre-Seed Round · Apertura Limitata · Target 250.000 €
                </span>
              </div>

              {/* Headline */}
              <div className="max-w-3xl mb-10">
                <h1
                  className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-[#0a0a0a] mb-6"
                  style={{ fontFamily: FONT }}
                >
                  Il giornalismo<br />
                  <span style={{ color: ORANGE }}>non è mai stato</span><br />
                  così rotto.
                </h1>
                <p
                  className="text-lg md:text-xl leading-relaxed text-[#0a0a0a]/65 max-w-2xl"
                  style={{ fontFamily: FONT }}
                >
                  ProofPress nasce per ricostruirlo. La prima piattaforma italiana di
                  AI Journalism certificato: dove l'intelligenza artificiale e il giornalismo
                  umano collaborano per portare l'informazione a un livello superiore.
                  Notizie verificate, certificate, distribuite in tempo reale.
                </p>
              </div>

              {/* Metriche hero */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 py-8 border-t border-b border-[#0a0a0a]/8">
                {[
                  { val: "6.259", label: "iscritti newsletter attivi" },
                  { val: "4.000+", label: "fonti monitorate 24/7" },
                  { val: "100%", label: "notizie certificate SHA-256" },
                  { val: "250K €", label: "target pre-seed round" },
                ].map(({ val, label }) => (
                  <div key={val}>
                    <div
                      className="text-3xl md:text-4xl font-black mb-1"
                      style={{ color: ORANGE, fontFamily: FONT }}
                    >
                      {val}
                    </div>
                    <div className="text-xs text-[#0a0a0a]/50 uppercase tracking-wide leading-snug">
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA hero */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#form-investor"
                  className="inline-block px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-80"
                  style={{ background: ORANGE, fontFamily: FONT }}
                >
                  Sono interessato →
                </a>
                <a
                  href="#cosa-e"
                  className="inline-block px-8 py-4 text-sm font-bold uppercase tracking-widest border transition-colors hover:bg-[#0a0a0a]/5"
                  style={{ borderColor: "#0a0a0a", color: "#0a0a0a", fontFamily: FONT }}
                >
                  Scopri ProofPress
                </a>
              </div>
            </div>
          </section>

          <Divider />

          {/* ── COSA È PROOFPRESS ────────────────────────────────────────────── */}
          <Section bg="#f8f8f6" id="cosa-e">
            <Label>Cos'è ProofPress</Label>
            <h2
              className="text-3xl md:text-4xl font-black leading-tight mb-6"
              style={{ fontFamily: FONT }}
            >
              Non un media.<br />Un'infrastruttura per<br />l'informazione del futuro.
            </h2>
            <p className="text-base text-[#0a0a0a]/65 leading-relaxed max-w-2xl mb-12">
              ProofPress è una piattaforma agentica che trasforma il modo in cui le notizie
              vengono create, verificate e distribuite. Dodici agenti AI lavorano in parallelo
              24 ore su 24: monitorano oltre 4.000 fonti, scrivono articoli, li verificano
              con il protocollo ProofPress Verify e li pubblicano in tempo reale.
              Il giornalista umano mantiene il controllo strategico ed editoriale.
              La macchina fa il resto.
            </p>

            {/* Tre pilastri */}
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
                  text: "Ogni notizia viene analizzata da un sistema multi-agente che ne misura affidabilità, coerenza fattuale e obiettività. Il Verification Report viene sigillato con hash crittografico SHA-256 immutabile: la notizia è tracciabile, verificabile nel tempo, impossibile da alterare. Ispirato alla notarizzazione Web3.",
                },
                {
                  n: "03",
                  title: "Distribuzione Certificata",
                  text: "Newsletter quotidiana a 6.259 iscritti attivi (crescita organica, zero paid). Sito live su proofpress.ai. Pipeline di distribuzione multicanale: email, web, social, API. Ogni contenuto porta il sigillo ProofPress Verify — differenziazione immediata sul mercato.",
                },
              ].map(({ n, title, text }) => (
                <div key={n} className="grid md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-1">
                    <div
                      className="text-5xl font-black leading-none"
                      style={{ color: `${ORANGE}33`, fontFamily: FONT }}
                    >
                      {n}
                    </div>
                  </div>
                  <div className="md:col-span-11">
                    <h3
                      className="text-lg font-black mb-2 text-[#0a0a0a]"
                      style={{ fontFamily: FONT }}
                    >
                      {title}
                    </h3>
                    <p className="text-base text-[#0a0a0a]/65 leading-relaxed">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ── MODELLO DI OFFERTA ───────────────────────────────────────────── */}
          <Section id="offerta">
            <Label>Modello di offerta</Label>
            <h2
              className="text-3xl md:text-4xl font-black leading-tight mb-4"
              style={{ fontFamily: FONT }}
            >
              Chi paga per ProofPress.
            </h2>
            <p className="text-base text-[#0a0a0a]/55 mb-14 max-w-2xl">
              Tre mercati distinti, tre flussi di ricavo. La piattaforma è già operativa
              su ProofPress Magazine come proof of concept. Il round serve a scalare
              la tecnologia e acquisire i primi clienti enterprise.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: "📰",
                  segment: "Media & Publisher",
                  model: "Licenza SaaS",
                  desc: "Editori, testate digitali e creator che vogliono una redazione AI-native. Licenza della pipeline agentica per produrre contenuti certificati in autonomia. Setup una tantum + canone mensile.",
                  price: "Da €690/mese",
                  alt: "Alternativa: revenue sharing 20%",
                },
                {
                  icon: "🏢",
                  segment: "Enterprise & Corporate",
                  model: "Intelligence Certificata",
                  desc: "Aziende e C-suite che necessitano di intelligence su mercati, competitor e trend. Report certificati per decisioni strategiche, board e investor relations. Contratti annuali.",
                  price: "Da €2.500/mese",
                  alt: "Pilota enterprise Q4 2026",
                },
                {
                  icon: "⚖️",
                  segment: "Finanza, Legal & PA",
                  model: "Compliance & Monitoring",
                  desc: "Banche, studi legali e pubblica amministrazione che necessitano di monitoraggio disinformazione e news verification per compliance, M&A e due diligence. SLA garantito.",
                  price: "Custom pricing",
                  alt: "Conforme AI Act europeo",
                },
              ].map(({ icon, segment, model, desc, price, alt }) => (
                <div
                  key={segment}
                  className="border border-[#0a0a0a]/10 p-7 flex flex-col"
                  style={{ background: "#ffffff" }}
                >
                  <div className="text-3xl mb-4">{icon}</div>
                  <div
                    className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1"
                    style={{ color: "rgba(10,10,10,0.35)" }}
                  >
                    {model}
                  </div>
                  <h3
                    className="text-lg font-black mb-3 text-[#0a0a0a]"
                    style={{ fontFamily: FONT }}
                  >
                    {segment}
                  </h3>
                  <p className="text-sm text-[#0a0a0a]/60 leading-relaxed flex-1 mb-4">
                    {desc}
                  </p>
                  <div
                    className="text-base font-black mb-1"
                    style={{ color: ORANGE, fontFamily: FONT }}
                  >
                    {price}
                  </div>
                  <div className="text-xs text-[#0a0a0a]/40 italic">{alt}</div>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ── VISIONE ──────────────────────────────────────────────────────── */}
          <Section bg="#f8f8f6" id="visione">
            <Label>Visione</Label>
            <h2
              className="text-3xl md:text-4xl font-black leading-tight mb-6"
              style={{ fontFamily: FONT }}
            >
              Nasce un nuovo media.<br />
              <span style={{ color: ORANGE }}>Dove AI e uomo</span><br />
              collaborano per informare meglio.
            </h2>

            <div className="grid md:grid-cols-2 gap-12 mb-14">
              <div>
                <p className="text-base text-[#0a0a0a]/65 leading-relaxed mb-6">
                  Il giornalismo tradizionale è in crisi strutturale: costi insostenibili,
                  velocità insufficiente, fiducia ai minimi storici. Il 65% degli italiani
                  non si fida più dei media (Reuters Institute 2024). La disinformazione
                  costa all'economia globale 78 miliardi di dollari l'anno.
                </p>
                <p className="text-base text-[#0a0a0a]/65 leading-relaxed">
                  ProofPress non sostituisce il giornalista: lo amplifica. L'AI gestisce
                  il volume, la velocità e la verifica. Il giornalista umano porta
                  giudizio, etica e direzione editoriale. Il risultato è un nuovo modello
                  di media: più veloce, più affidabile, più scalabile.
                </p>
              </div>
              <div>
                <p className="text-base text-[#0a0a0a]/65 leading-relaxed mb-6">
                  Il mercato globale dei media digitali vale 460 miliardi di dollari.
                  L'AI journalism è ancora un territorio vergine: chi entra ora costruisce
                  il moat. L'AI Act europeo e le nuove norme sulla disinformazione premiano
                  le piattaforme con sistemi di verifica certificata.
                </p>
                <p className="text-base text-[#0a0a0a]/65 leading-relaxed">
                  ProofPress è già conforme, già operativa, già distribuita.
                  L'obiettivo è diventare il <strong>market leader europeo
                  dell'AI Journalism certificato</strong> entro il 2027,
                  con 50.000 iscritti e 10 clienti enterprise attivi.
                </p>
              </div>
            </div>

            {/* Perché adesso */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: "📉",
                  title: "Il mercato è rotto",
                  text: "Fiducia nei media ai minimi. Disinformazione dilagante. La domanda di informazione certificata non ha ancora un'offerta strutturata. ProofPress risolve il problema alla radice.",
                },
                {
                  icon: "⏱",
                  title: "Timing perfetto",
                  text: "AI Act europeo in vigore. Norme anti-disinformazione in arrivo. Chi costruisce ora l'infrastruttura di verifica diventa lo standard di riferimento del settore.",
                },
                {
                  icon: "🏆",
                  title: "Team con track record",
                  text: "Fondato da Andrea Cinelli: co-fondatore Libero.it (10M+ utenti), 2 exit, 25+ brevetti, Advisory Board Deloitte, professore AI al Sole 24 Ore Business School.",
                },
              ].map(({ icon, title, text }) => (
                <div
                  key={title}
                  className="border border-[#0a0a0a]/10 p-6"
                  style={{ background: "#ffffff" }}
                >
                  <div className="text-2xl mb-3">{icon}</div>
                  <h3
                    className="text-base font-black mb-2 text-[#0a0a0a]"
                    style={{ fontFamily: FONT }}
                  >
                    {title}
                  </h3>
                  <p className="text-sm text-[#0a0a0a]/60 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ── PRE-SEED ROUND ───────────────────────────────────────────────── */}
          <Section id="round">
            <Label>Pre-Seed Round 2026</Label>
            <h2
              className="text-3xl md:text-4xl font-black leading-tight mb-4"
              style={{ fontFamily: FONT }}
            >
              250.000 € per diventare<br />market leader.
            </h2>
            <p className="text-base text-[#0a0a0a]/55 mb-14 max-w-2xl">
              Il round pre-seed serve a trasformare ProofPress da proof of concept
              operativo a piattaforma scalabile. Tre aree di investimento, impatto misurabile,
              timeline definita.
            </p>

            {/* Allocazione */}
            <div className="grid md:grid-cols-3 gap-6 mb-14">
              {[
                {
                  pct: "40%",
                  area: "Tecnologia",
                  amount: "100.000 €",
                  items: [
                    "Scalabilità pipeline agentica",
                    "API ProofPress Verify per terze parti",
                    "Dashboard enterprise self-service",
                    "Integrazione multicanale (Slack, API, webhook)",
                  ],
                },
                {
                  pct: "35%",
                  area: "Go-to-Market",
                  amount: "87.500 €",
                  items: [
                    "3 pilot enterprise (media group, banca, PA)",
                    "PR e lancio ufficiale in Italia",
                    "Sales & business development",
                    "Certificazioni e compliance AI Act",
                  ],
                },
                {
                  pct: "25%",
                  area: "Operations",
                  amount: "62.500 €",
                  items: [
                    "Team editoriale e supervisione AI",
                    "Infrastruttura cloud e sicurezza",
                    "Legal, IP e protezione brevetti",
                    "Runway 12 mesi fino al Seed",
                  ],
                },
              ].map(({ pct, area, amount, items }) => (
                <div
                  key={area}
                  className="border border-[#0a0a0a]/10 p-7"
                  style={{ background: "#f8f8f6" }}
                >
                  <div
                    className="text-4xl font-black mb-1"
                    style={{ color: ORANGE, fontFamily: FONT }}
                  >
                    {pct}
                  </div>
                  <div
                    className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1"
                    style={{ color: "rgba(10,10,10,0.35)" }}
                  >
                    {area}
                  </div>
                  <div
                    className="text-base font-black mb-4 text-[#0a0a0a]"
                    style={{ fontFamily: FONT }}
                  >
                    {amount}
                  </div>
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-[#0a0a0a]/65"
                      >
                        <span style={{ color: ORANGE }} className="font-bold mt-0.5">
                          →
                        </span>
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
                  {
                    q: "Q2 2026",
                    title: "Chiusura Pre-Seed",
                    desc: "Raccolta 250K €. Avvio sviluppo API Verify. Primo pilot enterprise.",
                  },
                  {
                    q: "Q3 2026",
                    title: "Lancio Ufficiale Italia",
                    desc: "PR nazionale. Versione enterprise della piattaforma. 3 clienti beta attivi.",
                  },
                  {
                    q: "Q4 2026",
                    title: "Enterprise Traction",
                    desc: "3 contratti enterprise firmati. 15.000 iscritti newsletter. Avvio Seed Round.",
                  },
                  {
                    q: "Q1–Q2 2027",
                    title: "Espansione EU",
                    desc: "Versioni in inglese, francese, spagnolo. Target 50.000 iscritti. Market leader EU.",
                  },
                ].map(({ q, title, desc }) => (
                  <div key={q} className="grid md:grid-cols-12 gap-4 items-start">
                    <div className="md:col-span-2">
                      <div
                        className="text-xs font-bold uppercase tracking-[0.15em]"
                        style={{ color: ORANGE }}
                      >
                        {q}
                      </div>
                    </div>
                    <div className="md:col-span-10">
                      <h3
                        className="text-base font-black mb-1 text-[#0a0a0a]"
                        style={{ fontFamily: FONT }}
                      >
                        {title}
                      </h3>
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
            <div className="grid md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-2">
                <div
                  className="w-16 h-16 flex items-center justify-center text-2xl font-black border border-[#0a0a0a]/15"
                  style={{ background: "#ffffff", color: "#0a0a0a", fontFamily: FONT }}
                >
                  AC
                </div>
              </div>
              <div className="md:col-span-10">
                <h2
                  className="text-2xl md:text-3xl font-black mb-2 text-[#0a0a0a]"
                  style={{ fontFamily: FONT }}
                >
                  Andrea Cinelli
                </h2>
                <p
                  className="text-sm font-bold uppercase tracking-[0.15em] mb-6"
                  style={{ color: ORANGE }}
                >
                  Founder & CEO, ProofPress
                </p>
                <p className="text-base text-[#0a0a0a]/65 leading-relaxed mb-6">
                  30+ anni di esperienza nella costruzione di prodotti digitali e piattaforme
                  tecnologiche a scala. Co-fondatore di Libero.it (10M+ utenti, Infostrada–Olivetti Group),
                  Head of Mobile VAS Vodafone Global, serial entrepreneur con 2 exit.
                  Autore di 25+ brevetti — tra cui IP alla base del sistema SPID italiano.
                </p>
                <p className="text-base text-[#0a0a0a]/65 leading-relaxed mb-8">
                  Membro dell'Advisory Board Deloitte Central Mediterranean. Professore di AI
                  al Sole 24 Ore Business School. Keynote speaker internazionale su AI e innovazione.
                  Fondatore di FoolFarm, uno dei principali AI Venture Studio europei.
                </p>
                <div className="flex flex-wrap gap-3">
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
                <div className="mt-6">
                  <a
                    href="https://linkedin.com/in/andreacinelli"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-70"
                    style={{ color: ORANGE, fontFamily: FONT }}
                  >
                    LinkedIn → linkedin.com/in/andreacinelli
                  </a>
                </div>
              </div>
            </div>
          </Section>

          <Divider />

          {/* ── FORM CONTATTO ────────────────────────────────────────────────── */}
          <Section id="form-investor">
            <div className="max-w-2xl">
              <Label>Investor Relations</Label>
              <h2
                className="text-3xl md:text-4xl font-black leading-tight mb-4"
                style={{ fontFamily: FONT }}
              >
                Sei interessato?
              </h2>
              <p className="text-base text-[#0a0a0a]/55 mb-10">
                Scrivici. Risponde direttamente Andrea Cinelli entro 24 ore.
                Nessun pitch deck da scaricare, nessuna call di discovery infinita.
                Parliamo.
              </p>

              {submitted ? (
                <div
                  className="border border-[#0a0a0a]/10 p-8"
                  style={{ background: "#f8f8f6" }}
                >
                  <div
                    className="text-2xl font-black mb-2"
                    style={{ color: ORANGE, fontFamily: FONT }}
                  >
                    Messaggio ricevuto.
                  </div>
                  <p className="text-base text-[#0a0a0a]/65">
                    Ti rispondo entro 24 ore. — Andrea Cinelli
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label
                        className="block text-xs font-bold uppercase tracking-[0.15em] mb-2 text-[#0a0a0a]/50"
                        htmlFor="inv-name"
                      >
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
                      <label
                        className="block text-xs font-bold uppercase tracking-[0.15em] mb-2 text-[#0a0a0a]/50"
                        htmlFor="inv-email"
                      >
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
                  <div>
                    <label
                      className="block text-xs font-bold uppercase tracking-[0.15em] mb-2 text-[#0a0a0a]/50"
                      htmlFor="inv-message"
                    >
                      Messaggio (opzionale)
                    </label>
                    <textarea
                      id="inv-message"
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Sono un investitore / fondo / family office interessato a capire di più su ProofPress..."
                      className="w-full border border-[#0a0a0a]/15 px-4 py-3 text-sm outline-none focus:border-[#0a0a0a]/40 transition-colors resize-none"
                      style={{ background: "#f8f8f6", fontFamily: FONT }}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <button
                      type="submit"
                      disabled={submitMutation.isPending || !name || !email}
                      className="px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-80 disabled:opacity-40"
                      style={{ background: ORANGE, fontFamily: FONT, border: "none", cursor: name && email ? "pointer" : "not-allowed" }}
                    >
                      {submitMutation.isPending ? "Invio..." : "Invia il tuo interesse →"}
                    </button>
                    <p className="text-xs text-[#0a0a0a]/35 mt-3 sm:mt-4 leading-relaxed">
                      I tuoi dati non vengono condivisi con terze parti.<br />
                      Nessuna newsletter automatica.
                    </p>
                  </div>
                  {submitMutation.isError && (
                    <p className="text-sm text-red-500">
                      Errore nell'invio. Scrivi direttamente a{" "}
                      <a href="mailto:ac@acinelli.com" style={{ color: ORANGE }}>
                        ac@acinelli.com
                      </a>
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
                <a
                  href="https://proofpress.ai"
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: ORANGE }}
                >
                  proofpress.ai
                </a>
              </p>
              <p className="text-xs text-[#0a0a0a]/35" style={{ fontFamily: FONT }}>
                Investor Relations:{" "}
                <a
                  href="mailto:ac@acinelli.com"
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: ORANGE }}
                >
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
