/**
 * IDEASMART — Manifesto HumanLess
 * Pagina editoriale che definisce la filosofia e il posizionamento di IDEASMART.
 * Design: coerente con l'estetica del giornale (bianco carta, inchiostro, Playfair Display).
 */

import SEOHead from "@/components/SEOHead";
import { Link } from "wouter";

const SECTIONS = [
  {
    number: "I",
    title: "La fine del giornalismo come lo conoscevamo",
    body: `Per decenni, il giornalismo ha operato su un assioma implicito: il valore dell'informazione dipende dalla presenza umana nella catena di produzione. Un essere umano che seleziona, un essere umano che scrive, un essere umano che decide cosa è rilevante e cosa non lo è.

Questo assioma era corretto finché la capacità cognitiva umana rappresentava un vantaggio computazionale reale rispetto alle alternative disponibili. Non è più così.

Non stiamo assistendo a una crisi del giornalismo. Stiamo assistendo alla fine di un modello di produzione dell'informazione che aveva senso in un'epoca specifica — e che quella stessa epoca ha reso obsoleto.`,
  },
  {
    number: "II",
    title: "HumanLess non significa senza umanità",
    body: `Il termine HumanLess è deliberatamente provocatorio. Non significa assenza di prospettiva umana, né indifferenza ai valori che il giornalismo ha storicamente incarnato: rigore, verifica, interesse pubblico.

Significa qualcosa di più preciso: la rimozione dell'essere umano come collo di bottiglia nella produzione dell'informazione. Il punto di frizione dove la stanchezza, il bias cognitivo, la pressione commerciale e i limiti fisici del tempo degradano sistematicamente la qualità dell'output.

Un sistema HumanLess non elimina il giudizio — lo eleva. Rimuove il rumore per amplificare il segnale. Sostituisce la produzione frenetica di contenuto con l'analisi strutturata di dati. Sostituisce l'opinione non verificata con l'insight fondato su evidenza.`,
  },
  {
    number: "III",
    title: "Il modello operativo di IDEASMART",
    body: `IDEASMART è costruita su agenti AI specializzati che operano in modo autonomo, coordinato e continuo. Ogni agente ha un dominio di competenza definito — AI & Business, Startup & Venture Capital, Industria Musicale — e opera secondo protocolli editoriali precisi.

Gli agenti monitorano in tempo reale oltre 200 fonti primarie: report di McKinsey, Gartner, CBInsights, Stanford AI Index, World Economic Forum, Crunchbase, PitchBook, arXiv. Non aggregano titoli — analizzano segnali. Distinguono tra dato verificabile e speculazione. Citano le fonti. Quantificano le affermazioni.

Il risultato non è un feed di notizie. È un sistema di intelligence editoriale che produce, ogni giorno, analisi di livello istituzionale accessibili a chiunque voglia capire dove si muove il mercato — non solo cosa è accaduto.`,
  },
  {
    number: "IV",
    title: "Il paradosso della qualità senza fatica",
    body: `Il giornalismo tradizionale ha un problema strutturale che raramente viene nominato: la qualità è inversamente proporzionale alla velocità di produzione. Più velocemente si deve produrre, peggio si produce. Le redazioni lo sanno. I lettori lo percepiscono. Nessuno ha trovato una soluzione perché la soluzione richiedeva di cambiare il modello di produzione, non di ottimizzarlo.

Un sistema agentico non ha questo vincolo. Non si stanca. Non ha scadenze di chiusura. Non subisce la pressione del click. Può dedicare alla verifica di un singolo dato lo stesso tempo che un giornalista umano dedicherebbe a scrivere tre articoli.

Questo non è un vantaggio marginale. È un cambio di paradigma nella relazione tra velocità e qualità dell'informazione.`,
  },
  {
    number: "V",
    title: "Il ruolo dell'intelligenza umana in un sistema HumanLess",
    body: `Andrea Cinelli, fondatore di IDEASMART, non scrive gli articoli. Definisce i protocolli editoriali. Stabilisce i criteri di qualità. Seleziona le fonti primarie. Valuta i risultati. Interviene quando il sistema produce output che non rispettano gli standard definiti.

Questa è la forma più alta di direzione editoriale: non produrre contenuto, ma progettare i sistemi che producono contenuto di qualità superiore a quello che qualsiasi singolo essere umano potrebbe produrre in modo sostenibile.

Il direttore editoriale di un sistema HumanLess è un architetto di sistemi cognitivi, non un produttore di testo. È una distinzione che richiede una revisione profonda di cosa significhi "fare giornalismo" nell'era degli agenti AI.`,
  },
  {
    number: "VI",
    title: "Le implicazioni per il business italiano",
    body: `IDEASMART non è un esperimento accademico. È una dimostrazione operativa di un principio che ogni azienda italiana dovrebbe comprendere: l'AI agentiva non è uno strumento per fare le stesse cose più velocemente. È un'infrastruttura per fare cose che prima erano impossibili.

Una redazione di 50 giornalisti non può monitorare 200 fonti in tempo reale, produrre analisi strutturate su tre settori distinti, mantenere coerenza editoriale su centinaia di articoli al mese e farlo a costo marginale zero. Un sistema agentico lo fa.

La domanda per le PMI italiane non è "l'AI sostituirà i miei dipendenti?" La domanda corretta è: "Quali processi nella mia azienda hanno la stessa struttura del problema che IDEASMART ha risolto?" La risposta, nella maggior parte dei casi, è: molti più di quanti pensiate.`,
  },
  {
    number: "VIII",
    title: "Serietà, obiettività, imparzialità",
    body: `Viviamo in un'epoca in cui il giornalismo è diventato, in larga parte, uno strumento di posizionamento. I grandi editori hanno azionisti, inserzionisti, affiliazioni politiche. Le redazioni hanno linee editoriali che riflettono interessi precisi. Il lettore lo sa — e ha smesso di fidarsi.

Un sistema HumanLess non ha opinioni politiche. Non ha inserzionisti da compiacere. Non ha una parte da difendere. L'AI non è di destra né di sinistra, non è pro-establishment né anti-sistema. Analizza i dati, verifica le fonti, riporta i fatti.

Questo non è un vantaggio tecnico. È un vantaggio strutturale. L'imparzialità di IDEASMART non dipende dalla buona volontà di un direttore editoriale o dall'etica di un singolo giornalista — dipende dall'architettura del sistema. Non ci sono interessi da tutelare perché non ci sono soggetti umani con interessi. Ci sono solo dati, fonti e analisi.

In un panorama mediatico dove ogni voce è sospettata di essere pilotata, IDEASMART offre qualcosa di radicalmente diverso: informazione senza agenda. Solo notizie.`,
  },
  {
    number: "VII",
    title: "Un impegno verso il lettore",
    body: `IDEASMART si impegna a rispettare tre principi che definiscono cosa significa essere HumanLess in modo responsabile.

Il primo è la trasparenza radicale: ogni contenuto prodotto da agenti AI è identificato come tale. Non esistono firme umane su testi generati da macchine. Il lettore sa sempre con cosa sta interagendo.

Il secondo è la verificabilità: ogni affermazione quantitativa è accompagnata dalla fonte primaria. Nessun dato senza citazione. Nessuna statistica senza contesto. Il lettore può sempre risalire all'origine dell'informazione.

Il terzo è la responsabilità editoriale: un sistema HumanLess non è un sistema irresponsabile. È un sistema dove la responsabilità è concentrata e misurabile, non diluita in una catena di produzione opaca dove nessuno risponde di nulla.`,
  },
];

const STATS = [
  { value: "200+", label: "Fonti primarie monitorate" },
  { value: "3", label: "Settori di analisi" },
  { value: "24/7", label: "Operatività degli agenti" },
  { value: "0", label: "Articoli scritti da esseri umani" },
];

export default function Manifesto() {
  return (
    <>
      <SEOHead
        title="Manifesto HumanLess — IDEASMART"
        description="La filosofia editoriale di IDEASMART: cosa significa essere la prima testata giornalistica HumanLess e perché questo approccio rappresenta il futuro dell'informazione di qualità."
        canonical="https://ideasmart.ai/manifesto"
      />

      <div
        className="min-h-screen"
        style={{ background: "#faf8f3", color: "#1a1a2e" }}
      >
        {/* ── Header ── */}
        <header
          className="border-b-4 border-[#1a1a2e]"
          style={{ background: "#faf8f3" }}
        >
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/">
              <span
                className="text-2xl font-black tracking-tight cursor-pointer hover:opacity-70 transition-opacity"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                IdeaSmart
              </span>
            </Link>
            <Link href="/">
              <span
                className="text-xs uppercase tracking-widest text-[#1a1a2e]/50 hover:text-[#1a1a2e] transition-colors cursor-pointer"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                ← Prima Pagina
              </span>
            </Link>
          </div>
        </header>

        {/* ── Hero Manifesto ── */}
        <div className="max-w-4xl mx-auto px-6 pt-16 pb-8">
          {/* Label */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-[#1a1a2e]" />
            <span
              className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#1a1a2e]/50"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Manifesto Editoriale
            </span>
            <div className="h-px flex-1 bg-[#1a1a2e]" />
          </div>

          {/* Titolo principale */}
          <h1
            className="text-6xl md:text-8xl font-black tracking-tight text-[#1a1a2e] leading-none mb-6"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              letterSpacing: "-0.03em",
            }}
          >
            Human
            <span style={{ color: "#0a6e5c" }}>Less</span>
          </h1>

          {/* Sottotitolo */}
          <p
            className="text-xl md:text-2xl leading-relaxed text-[#1a1a2e]/70 max-w-2xl mb-8"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
          >
            Perché abbiamo rimosso l'essere umano dalla catena di produzione
            dell'informazione — e perché questo è il passo più responsabile che
            potessimo fare.
          </p>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-[#1a1a2e]/40 mb-2"
            style={{ fontFamily: "'Space Mono', monospace" }}>
            <span>Andrea Cinelli, Fondatore</span>
            <span>·</span>
            <span>IDEASMART Editorial Board</span>
            <span>·</span>
            <span>Marzo 2026</span>
          </div>

          <div className="w-full border-t-4 border-[#1a1a2e] mt-8 mb-0" />
        </div>

        {/* ── Statistiche ── */}
        <div className="border-b-2 border-[#1a1a2e]/10" style={{ background: "#1a1a2e" }}>
          <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div
                  className="text-4xl font-black text-white mb-1"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-[10px] uppercase tracking-widest text-white/50"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Corpo del Manifesto ── */}
        <div className="max-w-4xl mx-auto px-6 py-16">
          {/* Citazione di apertura */}
          <blockquote
            className="border-l-4 border-[#0a6e5c] pl-6 mb-16"
          >
            <p
              className="text-2xl md:text-3xl font-bold leading-snug text-[#1a1a2e] italic"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              "Il problema del giornalismo non è la mancanza di talento umano.
              È la struttura di produzione che trasforma il talento in rumore."
            </p>
            <footer
              className="mt-4 text-sm text-[#1a1a2e]/50"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              — Andrea Cinelli, Fondatore di IDEASMART
            </footer>
          </blockquote>

          {/* Sezioni del manifesto */}
          <div className="space-y-0">
            {SECTIONS.map((section, index) => (
              <div key={section.number}>
                <div className="py-12">
                  {/* Numero sezione */}
                  <div className="flex items-baseline gap-4 mb-4">
                    <span
                      className="text-6xl font-black text-[#1a1a2e]/8 select-none leading-none"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {section.number}
                    </span>
                    <h2
                      className="text-2xl md:text-3xl font-bold leading-tight text-[#1a1a2e]"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {section.title}
                    </h2>
                  </div>

                  {/* Corpo */}
                  <div className="space-y-4 pl-0 md:pl-20">
                    {section.body.split("\n\n").map((paragraph, i) => (
                      <p
                        key={i}
                        className="text-lg leading-relaxed text-[#1a1a2e]/80"
                        style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Divisore tra sezioni (non dopo l'ultima) */}
                {index < SECTIONS.length - 1 && (
                  <div className="w-full border-t border-[#1a1a2e]/15" />
                )}
              </div>
            ))}
          </div>

          {/* Divisore finale */}
          <div className="w-full border-t-4 border-[#1a1a2e] mt-4 mb-16" />

          {/* Firma e CTA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Firma */}
            <div>
              <p
                className="text-base leading-relaxed text-[#1a1a2e]/70 mb-6"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
              >
                IDEASMART è un progetto in evoluzione continua. Il Manifesto
                HumanLess non è un documento statico — è un impegno operativo
                che si aggiorna ogni volta che il sistema migliora.
              </p>
              <p
                className="text-base leading-relaxed text-[#1a1a2e]/70 mb-8"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
              >
                Se sei un CEO, un investitore o un imprenditore che vuole
                capire come applicare questo approccio alla tua organizzazione,
                la conversazione inizia qui.
              </p>
              <div
                className="text-sm font-bold text-[#1a1a2e]"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                Adrian Lenice
                <br />
                <span className="font-normal text-[#1a1a2e]/50">
                  Direttore Responsabile · IDEASMART
                </span>
              </div>
            </div>

            {/* CTA box */}
            <div
              className="p-8 border-2 border-[#1a1a2e]"
              style={{ background: "#faf8f3" }}
            >
              <p
                className="text-[10px] uppercase tracking-widest text-[#0a6e5c] mb-3 font-bold"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                Esplora IDEASMART
              </p>
              <p
                className="text-lg font-bold text-[#1a1a2e] mb-6 leading-snug"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Leggi le analisi quotidiane prodotte dal sistema HumanLess
              </p>
              <div className="flex flex-col gap-3">
                <Link href="/ai">
                  <div
                    className="w-full py-3 px-4 text-center text-sm font-bold uppercase tracking-widest cursor-pointer transition-opacity hover:opacity-80"
                    style={{
                      background: "#0a6e5c",
                      color: "#faf8f3",
                      fontFamily: "'Space Mono', monospace",
                    }}
                  >
                    AI4Business →
                  </div>
                </Link>
                <Link href="/startup">
                  <div
                    className="w-full py-3 px-4 text-center text-sm font-bold uppercase tracking-widest cursor-pointer transition-opacity hover:opacity-80"
                    style={{
                      background: "#c2410c",
                      color: "#faf8f3",
                      fontFamily: "'Space Mono', monospace",
                    }}
                  >
                    Startup News →
                  </div>
                </Link>
                <Link href="/music">
                  <div
                    className="w-full py-3 px-4 text-center text-sm font-bold uppercase tracking-widest cursor-pointer transition-opacity hover:opacity-80"
                    style={{
                      background: "#5b21b6",
                      color: "#faf8f3",
                      fontFamily: "'Space Mono', monospace",
                    }}
                  >
                    ITsMusic →
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          className="border-t-4 border-[#1a1a2e]"
          style={{ background: "#1a1a2e" }}
        >
          <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <span
              className="text-lg font-black text-white"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              IdeaSmart
            </span>
            <span
              className="text-xs text-white/30 uppercase tracking-widest"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              La Prima Testata Giornalistica HumanLess
            </span>
            <Link href="/">
              <span
                className="text-xs text-white/50 hover:text-white transition-colors cursor-pointer uppercase tracking-widest"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                ← Prima Pagina
              </span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
