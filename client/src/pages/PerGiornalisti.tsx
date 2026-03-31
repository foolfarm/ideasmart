/**
 * Per Giornalisti e Testate Online — Landing Page di vendita
 * 13 sezioni: Hero, Il Numero, Il Problema, La Soluzione, Come Funziona,
 * Cosa Ottieni, Prove, Fai Due Conti, Pricing, Revenue Share, Casi d'Uso, FAQ, CTA Finale
 * Palette: bianco (#ffffff), nero (#0a0a0a), crema (#f5f0e8), accento rosso (#dc2626)
 */
import { useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import SEOHead from "@/components/SEOHead";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/* ── Helpers ── */
function Section({ children, className = "", bg = "transparent", id }: { children: React.ReactNode; className?: string; bg?: string; id?: string }) {
  return (
    <section id={id} className={`py-20 md:py-28 ${className}`} style={{ background: bg }}>
      <div className="max-w-5xl mx-auto px-5 md:px-8">{children}</div>
    </section>
  );
}

function Label({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span className={`inline-block text-[11px] font-bold uppercase tracking-[0.2em] mb-4 ${accent ? "text-[#dc2626]" : "text-[#0a0a0a]/40"}`}
      style={{ fontFamily: FONT }}>
      {children}
    </span>
  );
}

function Divider() {
  return <div className="max-w-5xl mx-auto px-5 md:px-8"><div className="border-t border-[#0a0a0a]/8" /></div>;
}

/* ── FAQ Accordion ── */
const FAQ_DATA = [
  { q: "Come funziona la piattaforma IdeaSmart?", a: "IdeaSmart è una redazione digitale composta da agenti AI specializzati che lavorano come un team editoriale. Analizzano le tue fonti configurate ogni giorno, verificano le notizie con la tecnologia proprietaria Verify\u2122, scrivono articoli nel tono che hai scelto e li pubblicano sul tuo giornale. Tu interagisci con la redazione via chat, in linguaggio naturale: \"scrivi un pezzo su questo tema\", \"estrai le news del giorno\", \"pubblica in prima pagina\"." },
  { q: "Cos'è la tecnologia Verify\u2122?", a: "Verify è un protocollo di validazione agentica delle notizie. L'AI confronta ogni contenuto su fonti multiple, ne misura affidabilità e coerenza fattuale, e genera un Verification Report. Il report viene sigillato con un hash crittografico immutabile — tracciabile, trasparente e verificabile nel tempo." },
  { q: "Quanto tempo serve per lanciare una testata?", a: "Il setup completo richiede 5-7 giorni lavorativi. Include la configurazione della piattaforma, la personalizzazione editoriale, il setup delle fonti e il training degli agenti AI sulla tua linea editoriale. Dopo il lancio, la redazione è operativa 24/7." },
  { q: "Posso personalizzare lo stile editoriale?", a: "Sì, completamente. Definisci il tono (formale, informale, tecnico, divulgativo), il linguaggio, il posizionamento della testata. Puoi anche insegnare alla piattaforma a scrivere come te, fornendo esempi del tuo stile. Gli agenti AI si adattano alla tua linea editoriale." },
  { q: "Cosa sono i token e come funzionano?", a: "I token sono l'unità di misura dell'AI generativa. Ogni articolo scritto, ogni analisi, ogni interazione con la chat redazionale consuma token. Ogni piano include un budget mensile (da 1M a 10M) più che sufficiente per l'uso previsto. Se hai bisogno di più, puoi acquistarli a €10 ogni 100.000 token. La maggior parte dei clienti non supera mai la soglia inclusa." },
  { q: "Quanto produce la redazione AI rispetto a una tradizionale?", a: "Un giornalista produce in media 2-3 articoli al giorno. Il piano Single Vertical produce 10-15 articoli/giorno (equivalente a 4-5 giornalisti), il Multi-Channel 20-30 (equivalente a 8-10), il Full Newsroom non ha limiti. 24/7, senza ferie, malattia o turnover." },
  { q: "Serve un team per gestire la piattaforma?", a: "No. Il piano Single Vertical funziona con una sola persona. La piattaforma gestisce autonomamente l'intero flusso editoriale. Tu mantieni il controllo sulla linea editoriale e sulla strategia — il resto lo fa il sistema." },
  { q: "Come funziona il revenue share?", a: "Al posto del canone mensile puoi scegliere il 20% sui ricavi generati dalla testata (abbonamenti, pubblicità, sponsorizzazioni). Paghi solo il setup e poi cresciamo insieme. Disponibile per Multi-Channel e Full Newsroom, con minimo garantito (€300/mese e €500/mese)." },
  { q: "I contenuti sono miei?", a: "Sì, al 100%. Tutti i contenuti generati dalla piattaforma sono di tua proprietà. Puoi usarli, ripubblicarli, distribuirli come vuoi. La piattaforma è il tuo strumento, i contenuti sono tuoi." },
  { q: "Posso cancellare quando voglio?", a: "Sì. Nessun vincolo a lungo termine. Il canone è mensile e puoi disdire con 30 giorni di preavviso. Il setup una tantum non è rimborsabile. I contenuti pubblicati restano tuoi." },
  { q: "E se voglio migrare a un altro sistema?", a: "Tutti i contenuti sono esportabili in formati standard (HTML, Markdown, JSON). La piattaforma è tua finché la usi, i contenuti sono tuoi per sempre. Nessun lock-in." },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#0a0a0a]/8">
      <button onClick={() => setOpen(!open)} className="w-full py-6 flex items-start justify-between text-left gap-4 group">
        <span className="text-base md:text-lg font-bold text-[#0a0a0a] group-hover:text-[#dc2626] transition-colors" style={{ fontFamily: FONT }}>{q}</span>
        <span className="text-2xl font-light text-[#0a0a0a]/30 shrink-0 mt-0.5">{open ? "\u2212" : "+"}</span>
      </button>
      {open && <p className="pb-6 text-[15px] leading-relaxed text-[#0a0a0a]/60 max-w-3xl" style={{ fontFamily: FONT }}>{a}</p>}
    </div>
  );
}

/* ── Demo Form ── */
function DemoForm({ formRef }: { formRef: React.RefObject<HTMLDivElement | null> }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileType, setProfileType] = useState<"giornalista_freelance" | "editore_digitale" | "creator_analista" | "media_company" | "altro">("giornalista_freelance");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const mutation = trpc.demoRequest.submit.useMutation({ onSuccess: () => setSent(true) });

  if (sent) {
    return (
      <div ref={formRef} id="demo" className="text-center py-12">
        <div className="text-5xl mb-4">&#10003;</div>
        <h3 className="text-2xl font-black text-[#0a0a0a]" style={{ fontFamily: FONT }}>Richiesta inviata</h3>
        <p className="mt-3 text-[#0a0a0a]/60" style={{ fontFamily: FONT }}>Ti contatteremo entro 24 ore per fissare la demo.</p>
      </div>
    );
  }

  return (
    <div ref={formRef} id="demo" className="max-w-xl mx-auto">
      <div className="space-y-4">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome e cognome" className="w-full px-5 py-4 border-2 border-[#0a0a0a]/10 text-[15px] focus:border-[#0a0a0a] focus:outline-none transition-colors" style={{ fontFamily: FONT, borderRadius: 0, background: "#ffffff" }} />
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email professionale" className="w-full px-5 py-4 border-2 border-[#0a0a0a]/10 text-[15px] focus:border-[#0a0a0a] focus:outline-none transition-colors" style={{ fontFamily: FONT, borderRadius: 0, background: "#ffffff" }} />
        <select value={profileType} onChange={e => setProfileType(e.target.value as typeof profileType)} className="w-full px-5 py-4 border-2 border-[#0a0a0a]/10 text-[15px] focus:border-[#0a0a0a] focus:outline-none transition-colors" style={{ fontFamily: FONT, borderRadius: 0, background: "#ffffff" }}>
          <option value="giornalista_freelance">Giornalista / Freelancer</option>
          <option value="editore_digitale">Editore digitale / Testata online</option>
          <option value="creator_analista">Creator / Analista</option>
          <option value="media_company">Media company</option>
          <option value="altro">Altro</option>
        </select>
        <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Descrivi brevemente la tua testata o il tuo progetto editoriale..." rows={4} className="w-full px-5 py-4 border-2 border-[#0a0a0a]/10 text-[15px] focus:border-[#0a0a0a] focus:outline-none transition-colors resize-none" style={{ fontFamily: FONT, borderRadius: 0, background: "#ffffff" }} />
        <button onClick={() => { if (name && email) mutation.mutate({ name, email, profileType, message }); }} disabled={mutation.isPending || !name || !email} className="w-full px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] text-white transition-all duration-200 hover:opacity-90 disabled:opacity-40" style={{ background: "#dc2626", borderRadius: 0 }}>
          {mutation.isPending ? "Invio in corso..." : "Prenota una demo gratuita \u2192"}
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════════════════ */
export default function PerGiornalisti() {
  const demoRef = useRef<HTMLDivElement>(null);
  const scrollToDemo = () => demoRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToHow = () => document.getElementById("come-funziona")?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <SEOHead
        title="IdeaSmart — La Redazione AI per Giornalisti e Testate Online | Da €500/mese"
        description="Lancia la tua testata online con una redazione AI. 8 agenti, le tue fonti, il tuo tono. 10-15 articoli/giorno da €500/mese. Risparmi fino a €560k/anno rispetto a una redazione tradizionale."
        canonical="https://ideasmart.ai/per-giornalisti"
        ogSiteName="IDEASMART"
      />

      <div className="min-h-screen" style={{ background: "#ffffff", color: "#0a0a0a", fontFamily: FONT }}>
        <SharedPageHeader />
        <BreakingNewsTicker />

        {/* ═══ SEZIONE 1 — HERO ═══ */}
        <section className="pt-24 pb-20 md:pt-32 md:pb-28" style={{ background: "#ffffff" }}>
          <div className="max-w-5xl mx-auto px-5 md:px-8">
            <div className="max-w-3xl">
              <Label accent>Per Giornalisti e Testate Online</Label>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-[#0a0a0a]">
                La tua redazione AI.<br />
                <span className="text-[#0a0a0a]/25">Pronta in una settimana.</span>
              </h1>
              <p className="mt-6 text-xl md:text-2xl font-medium leading-relaxed text-[#0a0a0a]/60 max-w-2xl">
                Lancia una testata, verticalizza un giornale esistente o scala la produzione editoriale — senza assumere nessuno. 8 agenti AI, le tue fonti, il tuo tono. Tu fai il direttore.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <button onClick={scrollToDemo} className="px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] text-white transition-all duration-200 hover:opacity-90" style={{ background: "#dc2626", borderRadius: 0 }}>
                  Prenota una demo &rarr;
                </button>
                <button onClick={scrollToHow} className="px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] text-[#0a0a0a] border-2 border-[#0a0a0a] transition-all duration-200 hover:bg-[#0a0a0a] hover:text-white" style={{ borderRadius: 0 }}>
                  Guarda come funziona &darr;
                </button>
              </div>
              <p className="mt-5 text-[13px] text-[#0a0a0a]/35" style={{ fontFamily: FONT }}>
                Setup in pochi giorni &middot; Nessun vincolo a lungo termine &middot; Da €500/mese
              </p>
            </div>
          </div>
        </section>

        {/* ═══ SEZIONE 2 — IL NUMERO CHE CONTA ═══ */}
        <section className="py-20 md:py-24" style={{ background: "#0a0a0a" }}>
          <div className="max-w-5xl mx-auto px-5 md:px-8 text-center">
            <div className="text-7xl md:text-9xl font-black text-white tracking-tight">10x</div>
            <p className="mt-4 text-xl md:text-2xl font-medium text-white/70">
              meno di una redazione tradizionale.
            </p>
            <p className="mt-2 text-lg text-white/50">
              Stesso output. Stessa qualità. Nessun compromesso.
            </p>
            <div className="mt-12 flex flex-wrap justify-center gap-x-10 gap-y-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">
              <span>4.000+ fonti certificate</span>
              <span>&middot;</span>
              <span>8 agenti AI</span>
              <span>&middot;</span>
              <span>Tecnologia Verify&trade;</span>
              <span>&middot;</span>
              <span>Operativi 24/7</span>
            </div>
          </div>
        </section>

        {/* ═══ SEZIONE 3 — IL PROBLEMA ═══ */}
        <Section bg="#ffffff" id="problema">
          <Label>Il Problema</Label>
          <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
            Fare giornalismo oggi costa troppo.<br />
            <span className="text-[#0a0a0a]/25">E scala troppo poco.</span>
          </h2>
          <div className="mt-14 grid md:grid-cols-3 gap-8">
            {[
              { icon: "\uD83D\uDCB0", title: "Una redazione costa €150-250k/anno", text: "Giornalisti, editor, fact-checker, social media manager, strumenti. Anche una piccola testata con 2-3 persone supera facilmente i €100k all'anno. Per un freelance o un editore indipendente è insostenibile." },
              { icon: "\u23F1\uFE0F", title: "Dalla notizia alla pubblicazione passano ore", text: "Raccogliere le fonti, verificare, scrivere, editare, impaginare, pubblicare, condividere sui social. Il ciclo editoriale tradizionale è lento. In un mondo real-time, arrivi sempre dopo." },
              { icon: "\uD83D\uDCC9", title: "Per scalare devi assumere. E il margine crolla.", text: "Vuoi aggiungere un canale? Servono 1-2 persone in più. Vuoi coprire un nuovo verticale? Altre assunzioni. Il modello tradizionale non scala senza costi lineari. Più produci, meno guadagni." },
            ].map((c, i) => (
              <div key={i} className="p-8 border border-[#0a0a0a]/8 hover:border-[#0a0a0a]/20 transition-colors">
                <div className="text-3xl mb-4">{c.icon}</div>
                <h3 className="text-lg font-black text-[#0a0a0a] mb-3" style={{ fontFamily: FONT }}>{c.title}</h3>
                <p className="text-[15px] leading-relaxed text-[#0a0a0a]/55" style={{ fontFamily: FONT }}>{c.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-12 text-center text-lg md:text-xl font-medium text-[#0a0a0a]/60" style={{ fontFamily: FONT }}>
            Il risultato? La maggior parte delle testate non scala.<br />E chi scala, perde margine — o qualità.
          </p>
        </Section>

        <Divider />

        {/* ═══ SEZIONE 4 — LA SOLUZIONE ═══ */}
        <Section bg="#ffffff" id="soluzione">
          <Label>La Soluzione</Label>
          <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
            IdeaSmart è la tua redazione.<br />
            <span className="text-[#0a0a0a]/25">Solo che lavora 24 ore su 24 e costa 10 volte meno.</span>
          </h2>
          <p className="mt-6 text-lg md:text-xl leading-relaxed text-[#0a0a0a]/60 max-w-3xl" style={{ fontFamily: FONT }}>
            IdeaSmart ti dà una redazione completa di agenti AI specializzati che fanno quello che fa un team editoriale: monitorano le fonti, verificano i dati, scrivono gli articoli, li pubblicano e li distribuiscono. Tu scegli la linea editoriale. Loro eseguono.
          </p>
          <div className="mt-14 grid md:grid-cols-2 gap-8">
            {[
              { icon: "\uD83C\uDFAF", title: "Tu decidi cosa coprire", text: "Temi, fonti, tono, frequenza. La direzione è tua." },
              { icon: "\uD83E\uDD16", title: "Gli agenti scrivono e pubblicano", text: "Articoli, analisi, newsletter — in automatico o su tuo comando." },
              { icon: "\u2705", title: "Ogni notizia è verificata", text: "La tecnologia Verify\u2122 incrocia ogni dato su fonti multiple." },
              { icon: "\uD83D\uDE80", title: "Il giornale è online, su dominio tuo", text: "Una testata completa, pronta, con il tuo brand e la tua identità." },
            ].map((c, i) => (
              <div key={i} className="flex gap-5 p-6">
                <div className="text-2xl shrink-0">{c.icon}</div>
                <div>
                  <h3 className="text-base font-black text-[#0a0a0a]" style={{ fontFamily: FONT }}>{c.title}</h3>
                  <p className="mt-1 text-[15px] text-[#0a0a0a]/55" style={{ fontFamily: FONT }}>{c.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <button onClick={scrollToDemo} className="px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] text-white transition-all duration-200 hover:opacity-90" style={{ background: "#dc2626", borderRadius: 0 }}>
              Prenota una demo e vedi la piattaforma in azione &rarr;
            </button>
          </div>
        </Section>

        <Divider />

        {/* ═══ SEZIONE 5 — COME FUNZIONA ═══ */}
        <Section bg="#f5f0e8" id="come-funziona">
          <Label>Come Funziona</Label>
          <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
            Da zero a testata online in 4 step.
          </h2>
          <div className="mt-14 grid md:grid-cols-4 gap-8">
            {[
              { step: "01", icon: "\uD83D\uDCCB", title: "Ci dici come lo vuoi", text: "Scegli nome, canali, fonti, tono editoriale, layout. Ci racconti la tua testata e noi la configuriamo." },
              { step: "02", icon: "\u2699\uFE0F", title: "Configuriamo la tua istanza", text: "Setup dedicato su dominio tuo: fonti, agenti AI, regole editoriali, tema grafico. Tutto su misura." },
              { step: "03", icon: "\uD83D\uDCAC", title: "Parli con la tua redazione", text: "Via chat dai istruzioni alla redazione AI: scrivi un pezzo su questo tema, estrai le news del giorno, pubblica in prima pagina." },
              { step: "04", icon: "\uD83D\uDCF0", title: "Il giornale è live", text: "La testata pubblica in automatico o su tua approvazione. Articoli, newsletter, social post — tutto gestito." },
            ].map((s, i) => (
              <div key={i} className="text-center md:text-left">
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#dc2626] mb-3">Step {s.step}</div>
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="text-base font-black text-[#0a0a0a] mb-2" style={{ fontFamily: FONT }}>{s.title}</h3>
                <p className="text-[14px] leading-relaxed text-[#0a0a0a]/55" style={{ fontFamily: FONT }}>{s.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-12 text-center text-base font-medium text-[#0a0a0a]/50" style={{ fontFamily: FONT }}>
            Tempo medio dal primo contatto al go-live: <strong className="text-[#0a0a0a]">5-7 giorni</strong>.
          </p>
        </Section>

        <Divider />

        {/* ═══ SEZIONE 6 — COSA OTTIENI ═══ */}
        <Section bg="#ffffff" id="cosa-ottieni">
          <Label>Cosa Ottieni</Label>
          <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
            Non un tool.<br /><span className="text-[#0a0a0a]/25">Una redazione completa.</span>
          </h2>
          <div className="mt-14 grid md:grid-cols-3 gap-8">
            {[
              { icon: "\uD83D\uDCF0", title: "Testata completa su dominio dedicato", text: "Homepage, canali tematici, singoli articoli, pagina chi siamo, ticker live, breaking news. Tutto sul tuo dominio, col tuo brand." },
              { icon: "\uD83E\uDD16", title: "8 agenti AI specializzati", text: "Market Scout, Data Verifier, Research Writer, Senior Analyst, Fact Checker, Publisher, Social Editor, Newsletter Curator. Una redazione che non dorme mai." },
              { icon: "\uD83D\uDCAC", title: "Chat redazionale", text: "Parli con la piattaforma come parleresti con il tuo team. \"Scrivi un pezzo su X\", \"Estrai le notizie di oggi\", \"Pubblica in prima pagina\". Linguaggio naturale, zero tecnicismi." },
              { icon: "\u2705", title: "Tecnologia Verify\u2122", text: "Ogni notizia viene incrociata su fonti multiple prima della pubblicazione. Report di verifica con hash crittografico. Fact-checking automatico, zero fake news." },
              { icon: "\uD83D\uDCE7", title: "Newsletter automatica", text: "Settimanale o giornaliera, costruita in automatico dai contenuti migliori. Distribuita ai tuoi lettori senza che tu faccia nulla." },
              { icon: "\uD83D\uDCF1", title: "Distribuzione social", text: "Post LinkedIn, tweet, summary per Telegram — generati automaticamente dai tuoi articoli. Pubblica ovunque, gestisci da un posto." },
            ].map((c, i) => (
              <div key={i} className="p-8 border border-[#0a0a0a]/8 hover:border-[#0a0a0a]/20 transition-colors">
                <div className="text-2xl mb-4">{c.icon}</div>
                <h3 className="text-base font-black text-[#0a0a0a] mb-3" style={{ fontFamily: FONT }}>{c.title}</h3>
                <p className="text-[14px] leading-relaxed text-[#0a0a0a]/55" style={{ fontFamily: FONT }}>{c.text}</p>
              </div>
            ))}
          </div>
          {/* Extra features */}
          <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 text-[13px] text-[#0a0a0a]/50" style={{ fontFamily: FONT }}>
            <span>\uD83D\uDD12 Paywall integrato</span>
            <span>\uD83D\uDCCA Analytics</span>
            <span>\uD83C\uDF0D Multi-lingua</span>
            <span>\uD83D\uDCC5 Programmazione</span>
          </div>
        </Section>

        <Divider />

        {/* ═══ SEZIONE 7 — PROVE ═══ */}
        <Section bg="#f5f0e8" id="prove">
          <Label>Già in Produzione</Label>
          <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
            Non è un prototipo.<br /><span className="text-[#0a0a0a]/25">È quello che usiamo noi ogni giorno.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-[#0a0a0a]/60 max-w-3xl" style={{ fontFamily: FONT }}>
            IdeaSmart stessa è la prova che il sistema funziona. Una testata con 4 canali tematici, oltre 6.900 lettori, 20+ ricerche originali al giorno, 40+ notizie, newsletter trisettimanale e post LinkedIn automatici. Tutto gestito dalla piattaforma, con un team editoriale di 1 persona.
          </p>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-b border-[#0a0a0a]/10">
            {[
              { val: "6.900+", lab: "lettori attivi" },
              { val: "4", lab: "canali tematici" },
              { val: "20+", lab: "ricerche al giorno" },
              { val: "1", lab: "persona nel team" },
            ].map((s, i) => (
              <div key={i} className="py-8 text-center" style={{ borderRight: i < 3 ? "1px solid rgba(10,10,10,0.1)" : "none" }}>
                <div className="text-3xl md:text-4xl font-black text-[#0a0a0a]">{s.val}</div>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/35">{s.lab}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <a href="https://ideasmart.ai" target="_blank" rel="noopener noreferrer" className="text-sm font-bold uppercase tracking-[0.15em] text-[#dc2626] hover:underline" style={{ fontFamily: FONT }}>
              Guarda il risultato dal vivo &rarr; ideasmart.ai
            </a>
          </div>
        </Section>

        <Divider />

        {/* ═══ SEZIONE 8 — FAI DUE CONTI ═══ */}
        <Section bg="#ffffff" id="confronto">
          <Label>Fai Due Conti</Label>
          <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
            Quanto costa davvero una redazione?<br />
            <span className="text-[#dc2626]">E quanto risparmi con IdeaSmart?</span>
          </h2>
          <p className="mt-4 text-lg text-[#0a0a0a]/60 max-w-3xl" style={{ fontFamily: FONT }}>
            Una redazione tradizionale costa tra €80.000 e €580.000 all'anno in stipendi, strumenti e overhead. Con IdeaSmart ottieni lo stesso output — o di più — a una frazione del costo.
          </p>

          {/* Tabella confronto */}
          <div className="mt-12 overflow-x-auto">
            <table className="w-full text-left text-[14px]" style={{ fontFamily: FONT }}>
              <thead>
                <tr className="border-b-2 border-[#0a0a0a]">
                  <th className="py-3 pr-4 font-bold text-[#0a0a0a]">Voce di costo</th>
                  <th className="py-3 pr-4 font-bold text-[#0a0a0a]">Redazione trad.</th>
                  <th className="py-3 pr-4 font-bold text-[#0a0a0a]">IdeaSmart</th>
                  <th className="py-3 font-bold text-[#dc2626]">Risparmio</th>
                </tr>
              </thead>
              <tbody className="text-[#0a0a0a]/70">
                {[
                  ["Giornalisti (2-3 FTE)", "€60.000 – €90.000", "Incluso", "100%"],
                  ["Editor / Caporedattore", "€35.000 – €50.000", "Incluso", "100%"],
                  ["Fact-checker", "€25.000 – €35.000", "Incluso (Verify\u2122)", "100%"],
                  ["Social media manager", "€20.000 – €30.000", "Incluso", "100%"],
                  ["Newsletter manager", "€15.000 – €20.000", "Incluso", "100%"],
                  ["Strumenti e software", "€5.000 – €10.000", "Incluso", "100%"],
                  ["Hosting e infrastruttura", "€3.000 – €8.000", "Incluso", "100%"],
                ].map((r, i) => (
                  <tr key={i} className="border-b border-[#0a0a0a]/8">
                    <td className="py-3 pr-4">{r[0]}</td>
                    <td className="py-3 pr-4">{r[1]}</td>
                    <td className="py-3 pr-4 font-bold text-[#0a0a0a]">{r[2]}</td>
                    <td className="py-3 font-bold text-[#dc2626]">{r[3]}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-[#0a0a0a]">
                  <td className="py-3 pr-4 font-black text-[#0a0a0a]">TOTALE ANNUO</td>
                  <td className="py-3 pr-4 font-black text-[#0a0a0a]">€163.000 – €243.000</td>
                  <td className="py-3 pr-4 font-black text-[#dc2626]">da €9.000</td>
                  <td className="py-3 font-black text-[#dc2626]">fino a 17x</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3 Card confronto */}
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="border border-[#0a0a0a]/10 p-8">
              <h3 className="text-lg font-black text-[#0a0a0a] mb-6" style={{ fontFamily: FONT }}>La tua testata vs. 2 giornalisti</h3>
              <div className="space-y-2 text-[13px] text-[#0a0a0a]/60 mb-6" style={{ fontFamily: FONT }}>
                <p>2 giornalisti — €50.000 – €70.000</p>
                <p>1 editor part-time — €18.000 – €25.000</p>
                <p>Fact-checking — €8.000 – €12.000</p>
                <p>Social media — €10.000 – €15.000</p>
                <p>Newsletter — €3.000 – €5.000</p>
                <p>Hosting, CMS — €3.000 – €6.000</p>
                <p className="font-bold text-[#0a0a0a] pt-2 border-t border-[#0a0a0a]/10">Totale: €92.000 – €133.000/anno</p>
              </div>
              <div className="bg-[#f5f0e8] p-4 mb-4">
                <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#0a0a0a]/40">IdeaSmart — Single Vertical</p>
                <p className="text-[13px] text-[#0a0a0a]/60 mt-1">Setup: €3.000 + €500/mese &times; 12 = €6.000</p>
                <p className="text-[13px] font-bold text-[#0a0a0a] mt-1">Anno 1: €9.000 &middot; Anno 2+: €6.000</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-[#dc2626]">€124.000</div>
                <div className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#0a0a0a]/40 mt-1">risparmi/anno</div>
              </div>
            </div>

            {/* Card 2 — evidenziata */}
            <div className="border-2 border-[#dc2626] p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#dc2626] text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1">Più scelto</div>
              <h3 className="text-lg font-black text-[#0a0a0a] mb-6" style={{ fontFamily: FONT }}>La tua testata vs. 4 giornalisti</h3>
              <div className="space-y-2 text-[13px] text-[#0a0a0a]/60 mb-6" style={{ fontFamily: FONT }}>
                <p>4 giornalisti — €100.000 – €150.000</p>
                <p>1 caporedattore — €35.000 – €50.000</p>
                <p>1 fact-checker — €25.000 – €35.000</p>
                <p>1 social media — €20.000 – €30.000</p>
                <p>Newsletter — €5.000 – €8.000</p>
                <p>Hosting, CMS — €5.000 – €10.000</p>
                <p className="font-bold text-[#0a0a0a] pt-2 border-t border-[#0a0a0a]/10">Totale: €190.000 – €283.000/anno</p>
              </div>
              <div className="bg-[#f5f0e8] p-4 mb-4">
                <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#0a0a0a]/40">IdeaSmart — Multi-Channel</p>
                <p className="text-[13px] text-[#0a0a0a]/60 mt-1">Setup: €5.000 + €750/mese &times; 12 = €9.000</p>
                <p className="text-[13px] font-bold text-[#0a0a0a] mt-1">Anno 1: €14.000 &middot; Anno 2+: €9.000</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-[#dc2626]">€269.000</div>
                <div className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#0a0a0a]/40 mt-1">risparmi/anno</div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="border border-[#0a0a0a]/10 p-8">
              <h3 className="text-lg font-black text-[#0a0a0a] mb-6" style={{ fontFamily: FONT }}>La tua testata vs. 8 giornalisti</h3>
              <div className="space-y-2 text-[13px] text-[#0a0a0a]/60 mb-6" style={{ fontFamily: FONT }}>
                <p>8 giornalisti — €200.000 – €320.000</p>
                <p>Caporedattore + vice — €60.000 – €85.000</p>
                <p>2 fact-checker — €50.000 – €70.000</p>
                <p>Social + newsletter — €35.000 – €50.000</p>
                <p>1 data analyst — €30.000 – €40.000</p>
                <p>Hosting, CMS — €8.000 – €15.000</p>
                <p className="font-bold text-[#0a0a0a] pt-2 border-t border-[#0a0a0a]/10">Totale: €383.000 – €580.000/anno</p>
              </div>
              <div className="bg-[#f5f0e8] p-4 mb-4">
                <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#0a0a0a]/40">IdeaSmart — Full Newsroom</p>
                <p className="text-[13px] text-[#0a0a0a]/60 mt-1">Setup: €7.500 + €1.000/mese &times; 12 = €12.000</p>
                <p className="text-[13px] font-bold text-[#0a0a0a] mt-1">Anno 1: €19.500 &middot; Anno 2+: €12.000</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-[#dc2626]">€560.000</div>
                <div className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#0a0a0a]/40 mt-1">risparmi/anno</div>
              </div>
            </div>
          </div>

          {/* Strip riassuntiva */}
          <div className="mt-12 text-center">
            <p className="text-lg font-medium text-[#0a0a0a]/60" style={{ fontFamily: FONT }}>
              Il setup si ripaga in meno di 30 giorni.<br />
              <strong className="text-[#0a0a0a]">Dal secondo anno il risparmio è ancora più grande.</strong>
            </p>
          </div>
        </Section>

        <Divider />

        {/* ═══ SEZIONE 9 — PRICING ═══ */}
        <Section bg="#f5f0e8" id="pricing">
          <Label>I Piani</Label>
          <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
            Scegli la tua redazione.<br />
            <span className="text-[#dc2626]">Scala quando vuoi.</span>
          </h2>
          <p className="mt-4 text-lg text-[#0a0a0a]/60" style={{ fontFamily: FONT }}>
            Setup dedicato + canone mensile con token inclusi. Ogni testata è un'istanza propria, su dominio dedicato.
          </p>

          <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Single Vertical */}
            <div className="bg-white p-8 border border-[#0a0a0a]/10">
              <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-[#0a0a0a]/40 mb-2" style={{ fontFamily: FONT }}>Single Vertical</h3>
              <div className="text-2xl font-black text-[#0a0a0a]" style={{ fontFamily: FONT }}>€3.000 <span className="text-base font-medium text-[#0a0a0a]/40">una tantum</span></div>
              <div className="text-lg font-bold text-[#dc2626]" style={{ fontFamily: FONT }}>+ €500/mese</div>
              <ul className="mt-6 space-y-2 text-[13px] text-[#0a0a0a]/60" style={{ fontFamily: FONT }}>
                <li>&rarr; 4 agenti AI configurati sulle tue fonti</li>
                <li>&rarr; 1 canale tematico</li>
                <li>&rarr; 10-15 articoli AI/giorno</li>
                <li>&rarr; 1M token/mese inclusi</li>
                <li>&rarr; Setup completo: fonti, tone of voice, regole</li>
                <li>&rarr; Training editoriale</li>
                <li>&rarr; Newsletter automatica settimanale</li>
                <li>&rarr; Dominio dedicato</li>
                <li>&rarr; Manutenzione agenti mensile</li>
                <li>&rarr; Supporto email</li>
              </ul>
              <div className="mt-6 pt-4 border-t border-[#0a0a0a]/8">
                <p className="text-[12px] font-bold text-[#0a0a0a]/40 uppercase tracking-[0.1em]">Costo annuo: €9.000</p>
                <p className="text-[12px] text-[#0a0a0a]/40 mt-1">Per vertical media, rubriche personali, testate monotematiche.</p>
              </div>
            </div>

            {/* Multi-Channel */}
            <div className="bg-white p-8 border-2 border-[#dc2626] relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#dc2626] text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1">Più scelto</div>
              <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-[#0a0a0a]/40 mb-2" style={{ fontFamily: FONT }}>Multi-Channel</h3>
              <div className="text-2xl font-black text-[#0a0a0a]" style={{ fontFamily: FONT }}>€5.000 <span className="text-base font-medium text-[#0a0a0a]/40">una tantum</span></div>
              <div className="text-lg font-bold text-[#dc2626]" style={{ fontFamily: FONT }}>+ €750/mese</div>
              <ul className="mt-6 space-y-2 text-[13px] text-[#0a0a0a]/60" style={{ fontFamily: FONT }}>
                <li>&rarr; 8 agenti AI configurati</li>
                <li>&rarr; Fino a 6 canali tematici</li>
                <li>&rarr; 20-30 articoli AI/giorno</li>
                <li>&rarr; 3M token/mese inclusi</li>
                <li>&rarr; Setup + sessione strategica (2h)</li>
                <li>&rarr; Training + 1 revisione mensile</li>
                <li>&rarr; Newsletter automatica multi-lista</li>
                <li>&rarr; Paywall integrato (se richiesto)</li>
                <li>&rarr; Dominio dedicato</li>
                <li>&rarr; Analytics base</li>
                <li>&rarr; Supporto prioritario</li>
              </ul>
              <div className="mt-6 pt-4 border-t border-[#0a0a0a]/8">
                <p className="text-[12px] font-bold text-[#0a0a0a]/40 uppercase tracking-[0.1em]">Costo annuo: €14.000</p>
                <p className="text-[12px] text-[#0a0a0a]/40 mt-1">Per testate multi-canale, verticalizzazioni, media company.</p>
              </div>
            </div>

            {/* Full Newsroom */}
            <div className="bg-white p-8 border border-[#0a0a0a]/10">
              <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-[#0a0a0a]/40 mb-2" style={{ fontFamily: FONT }}>Full Newsroom</h3>
              <div className="text-2xl font-black text-[#0a0a0a]" style={{ fontFamily: FONT }}>€7.500 <span className="text-base font-medium text-[#0a0a0a]/40">una tantum</span></div>
              <div className="text-lg font-bold text-[#dc2626]" style={{ fontFamily: FONT }}>+ €1.000/mese</div>
              <ul className="mt-6 space-y-2 text-[13px] text-[#0a0a0a]/60" style={{ fontFamily: FONT }}>
                <li>&rarr; 12 agenti AI configurati</li>
                <li>&rarr; Canali illimitati</li>
                <li>&rarr; Articoli illimitati</li>
                <li>&rarr; 10M token/mese inclusi</li>
                <li>&rarr; Setup + sessione strategica (4h) + audit fonti</li>
                <li>&rarr; Training + 2 revisioni mensili</li>
                <li>&rarr; Newsletter multi-lista</li>
                <li>&rarr; Paywall + gestione abbonamenti</li>
                <li>&rarr; Dominio dedicato</li>
                <li>&rarr; Analytics avanzato</li>
                <li>&rarr; Distribuzione multi-canale</li>
                <li>&rarr; Account manager dedicato</li>
                <li>&rarr; Sessione mensile di ottimizzazione</li>
              </ul>
              <div className="mt-6 pt-4 border-t border-[#0a0a0a]/8">
                <p className="text-[12px] font-bold text-[#0a0a0a]/40 uppercase tracking-[0.1em]">Costo annuo: €19.500</p>
                <p className="text-[12px] text-[#0a0a0a]/40 mt-1">Per media company, gruppi editoriali, grandi testate.</p>
              </div>
            </div>

            {/* Custom */}
            <div className="bg-[#0a0a0a] p-8 text-white">
              <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-white/40 mb-2" style={{ fontFamily: FONT }}>Custom</h3>
              <div className="text-2xl font-black text-white" style={{ fontFamily: FONT }}>Parliamone</div>
              <ul className="mt-6 space-y-2 text-[13px] text-white/60" style={{ fontFamily: FONT }}>
                <li>&rarr; Agenti e canali su misura</li>
                <li>&rarr; Token budget personalizzato</li>
                <li>&rarr; Multi-testata</li>
                <li>&rarr; Integrazioni personalizzate</li>
                <li>&rarr; SLA e supporto dedicato</li>
                <li>&rarr; Team multi-editor</li>
                <li>&rarr; White-label completo</li>
              </ul>
              <div className="mt-8">
                <button onClick={scrollToDemo} className="w-full px-6 py-3 text-sm font-bold uppercase tracking-[0.15em] bg-white text-[#0a0a0a] hover:bg-white/90 transition-colors" style={{ borderRadius: 0 }}>
                  Contattaci &rarr;
                </button>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-[13px] text-[#0a0a0a]/40" style={{ fontFamily: FONT }}>
            Tutti i piani includono: istanza dedicata su dominio proprio, configurazione piattaforma, personalizzazione editoriale, setup fonti, training AI e tecnologia Verify&trade;. Token extra: €10 ogni 100.000 token aggiuntivi.
          </p>
        </Section>

        <Divider />

        {/* ═══ SEZIONE 10 — REVENUE SHARE ═══ */}
        <Section bg="#ffffff" id="revenue-share">
          <div className="max-w-2xl mx-auto text-center">
            <Label>Alternativa</Label>
            <h3 className="text-2xl md:text-3xl font-black text-[#0a0a0a]" style={{ fontFamily: FONT }}>
              Preferisci il revenue share?
            </h3>
            <p className="mt-4 text-base leading-relaxed text-[#0a0a0a]/60" style={{ fontFamily: FONT }}>
              Al posto del canone mensile, puoi scegliere il modello revenue share al 20% sui ricavi generati dalla testata. Paghi solo il setup una tantum e poi cresciamo insieme: noi guadagniamo solo quando guadagni tu.
            </p>
            <p className="mt-3 text-[14px] text-[#0a0a0a]/50" style={{ fontFamily: FONT }}>
              Disponibile per <strong>Multi-Channel</strong> e <strong>Full Newsroom</strong>.
            </p>
            <div className="mt-8 inline-block bg-[#0a0a0a] text-white px-8 py-4">
              <div className="text-2xl font-black">20% Revenue Share</div>
              <div className="text-[13px] text-white/60 mt-1">Solo setup + 20% sui ricavi effettivi</div>
              <div className="text-[12px] text-white/40 mt-2">Minimo garantito: €300/mese (Multi-Channel), €500/mese (Full Newsroom)</div>
            </div>
          </div>
        </Section>

        <Divider />

        {/* ═══ SEZIONE 11 — CASI D'USO ═══ */}
        <Section bg="#f5f0e8" id="casi-duso">
          <Label>Per Chi È</Label>
          <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
            4 scenari. Un'unica piattaforma.
          </h2>
          <div className="mt-14 grid md:grid-cols-2 gap-8">
            {[
              { icon: "\uD83D\uDE80", title: "\"Voglio lanciare la mia testata\"", text: "Sei un giornalista con 20 anni di esperienza in un settore e vuoi la tua voce indipendente. Non hai budget per una redazione, ma hai le idee chiare su cosa coprire e come.", plan: "SINGLE VERTICAL \u00B7 €500/mese", quote: "\"Ho lanciato un vertical sull'AI in Italia. In 3 mesi avevo 40 articoli/settimana e 2.000 lettori.\"" },
              { icon: "\uD83D\uDCCA", title: "\"Voglio verticalizzare la mia testata esistente\"", text: "Hai già un giornale online generalista e vuoi lanciare spin-off su verticali specifici — fintech, healthtech, sport business — senza raddoppiare il team.", plan: "MULTI-CHANNEL \u00B7 €750/mese", quote: "\"Abbiamo aggiunto 3 verticali alla nostra testata. Stessa qualità, zero assunzioni.\"" },
              { icon: "\uD83C\uDFE2", title: "\"Voglio una testata per la mia organizzazione\"", text: "Sei un'associazione di categoria, un ordine professionale, un fondo di investimento. Vuoi un media proprietario per i tuoi stakeholder ma non hai una redazione interna.", plan: "MULTI-CHANNEL o FULL NEWSROOM", quote: "\"L'associazione ora ha un giornale settoriale che i soci leggono ogni mattina.\"" },
              { icon: "\uD83D\uDCF1", title: "\"Voglio scalare la produzione senza assumere\"", text: "Hai una media company e produci contenuti per più clienti o più testate. Ogni nuovo progetto richiede nuove assunzioni. Con IdeaSmart, ogni progetto è una nuova istanza.", plan: "FULL NEWSROOM o CUSTOM", quote: "\"Gestiamo 3 testate con un team di 2 persone. Prima ne servivano 12.\"" },
            ].map((c, i) => (
              <div key={i} className="bg-white p-8 border border-[#0a0a0a]/8">
                <div className="text-3xl mb-4">{c.icon}</div>
                <h3 className="text-lg font-black text-[#0a0a0a] mb-3" style={{ fontFamily: FONT }}>{c.title}</h3>
                <p className="text-[14px] leading-relaxed text-[#0a0a0a]/55 mb-4" style={{ fontFamily: FONT }}>{c.text}</p>
                <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#dc2626] mb-3" style={{ fontFamily: FONT }}>{c.plan}</p>
                <p className="text-[13px] italic text-[#0a0a0a]/40" style={{ fontFamily: FONT }}>{c.quote}</p>
              </div>
            ))}
          </div>
        </Section>

        <Divider />

        {/* ═══ SEZIONE 12 — FAQ ═══ */}
        <Section bg="#ffffff" id="faq">
          <Label>Domande Frequenti</Label>
          <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a] mb-8">
            Tutto quello che devi sapere.
          </h2>
          <div>
            {FAQ_DATA.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
          </div>
        </Section>

        {/* ═══ SEZIONE 13 — CTA FINALE ═══ */}
        <section className="py-24 md:py-32" style={{ background: "#0a0a0a" }}>
          <div className="max-w-3xl mx-auto px-5 md:px-8 text-center">
            <h2 className="text-3xl md:text-5xl font-black leading-tight text-white">
              Il giornalismo sta cambiando.<br />
              <span className="text-white/30">Puoi guidarlo o subirlo.</span>
            </h2>
            <p className="mt-6 text-lg text-white/60" style={{ fontFamily: FONT }}>
              Prenota una demo di 30 minuti. Ti mostriamo il sistema in azione — con le tue fonti, i tuoi temi, il tuo tono. Nessun impegno.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={scrollToDemo} className="px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] text-white transition-all duration-200 hover:opacity-90" style={{ background: "#dc2626", borderRadius: 0 }}>
                Prenota una demo &rarr;
              </button>
              <a href="mailto:redazione@ideasmart.ai?subject=Richiesta%20demo%20%E2%80%94%20dalla%20pagina%20per-giornalisti" className="px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] text-white border-2 border-white/30 transition-all duration-200 hover:bg-white hover:text-[#0a0a0a] text-center" style={{ borderRadius: 0 }}>
                Scrivici: redazione@ideasmart.ai
              </a>
            </div>
            <p className="mt-6 text-[13px] text-white/30" style={{ fontFamily: FONT }}>
              Setup in pochi giorni &middot; Da €500/mese &middot; Revenue share disponibile
            </p>
          </div>
        </section>

        {/* ═══ DEMO FORM ═══ */}
        <Section bg="#f5f0e8" id="demo-section">
          <div className="text-center mb-10">
            <Label accent>Prenota una Demo</Label>
            <h2 className="text-3xl md:text-4xl font-black text-[#0a0a0a]" style={{ fontFamily: FONT }}>
              Raccontaci il tuo progetto editoriale.
            </h2>
            <p className="mt-3 text-base text-[#0a0a0a]/50" style={{ fontFamily: FONT }}>
              Ti contatteremo entro 24 ore per fissare una demo personalizzata.
            </p>
          </div>
          <DemoForm formRef={demoRef} />
        </Section>

        <SharedPageFooter />
      </div>
    </>
  );
}
