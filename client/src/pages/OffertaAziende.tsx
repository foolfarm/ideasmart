import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ArrowRight, Globe, BarChart2, Briefcase, Users, Mic, Zap } from "lucide-react";

const DEMO_URL = "https://ideasmart.technology";
const CONTACT_URL = "/contatti";

export default function OffertaAziende() {
  return (
    <div className="min-h-screen bg-[#faf9f7] text-[#1a1a1a]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>

      {/* NAV BREADCRUMB */}
      <div className="border-b border-[#1a1a1a]/8 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]/50 hover:text-[#1a1a1a] transition-colors">
            ← ProofPress
          </Link>
          <div className="flex items-center gap-4 text-[11px] font-medium tracking-[0.12em] uppercase text-[#1a1a1a]/40">
            <Link href="/offerta/creator" className="hover:text-[#c0392b] transition-colors">Offerta Creator →</Link>
            <Link href="/offerta/editori" className="hover:text-[#c0392b] transition-colors">Offerta Testate →</Link>
          </div>
        </div>
      </div>

      {/* HERO */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12">
        <div className="text-center">
          <span className="inline-block text-[10px] font-bold tracking-[0.25em] uppercase bg-[#1a1a1a] text-white px-3 py-1.5 rounded-sm mb-6">
            Per Aziende, Scaleup e Corporate
          </span>
          <h1 className="text-[38px] md:text-[52px] font-black leading-[1.05] tracking-[-0.02em] mb-6 max-w-3xl mx-auto">
            Il tuo sito è una brochure. La tua intranet è vuota. La tua IR è un PDF. Cambia tutto.
          </h1>
          <p className="text-[17px] text-[#1a1a1a]/65 leading-relaxed max-w-2xl mx-auto mb-8">
            Una redazione AI che costruisce la tua corporate newsroom, la tua sezione Investor Relations, il tuo intelligence feed interno, il tuo canale HR — con contenuti certificati, automatici, multimediali. Senza assumere una redazione. Senza installare niente.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-2xl mx-auto">
            {[
              { value: "4.000+", label: "fonti monitorate 24/7" },
              { value: "12", label: "agenti specializzati" },
              { value: "100%", label: "contenuti certificati" },
              { value: "< 3 min", label: "tempo medio di certificazione" },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-[#1a1a1a]/8 rounded-xl p-4">
                <div className="text-[26px] font-black text-[#1a1a1a] leading-none">{s.value}</div>
                <div className="text-[11px] text-[#1a1a1a]/50 mt-1 leading-tight">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
              <Button className="bg-[#1a1a1a] hover:bg-[#333] text-white font-bold px-8 py-3 text-[14px] tracking-[0.05em]">
                Guarda la demo live <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </a>
            <Link href={CONTACT_URL}>
              <Button variant="outline" className="border-[#1a1a1a]/20 font-bold px-8 py-3 text-[14px]">
                Parla con noi
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="border-t border-[#1a1a1a]/8" />

      {/* IL PROBLEMA */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="text-[28px] md:text-[36px] font-black mb-6 tracking-[-0.01em]">Ogni azienda ha un problema di informazione. Quasi nessuna lo sta risolvendo.</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#1a1a1a]/4 rounded-2xl p-6">
            <h3 className="text-[14px] font-bold tracking-[0.1em] uppercase text-[#1a1a1a]/50 mb-4">Verso l'esterno</h3>
            <p className="text-[14px] text-[#1a1a1a]/65 leading-relaxed">Il tuo sito ha un bounce rate dell'80%. Il blog è fermo. La sezione IR è un archivio PDF. I competitor pubblicano contenuti ogni giorno e si posizionano come thought leader — tu aggiorni la pagina "Chi siamo" una volta all'anno. I clienti non tornano sul tuo sito perché non c'è niente da leggere. Gli investitori aprono la IR solo per i numeri trimestrali e chiudono.</p>
          </div>
          <div className="bg-[#1a1a1a]/4 rounded-2xl p-6">
            <h3 className="text-[14px] font-bold tracking-[0.1em] uppercase text-[#1a1a1a]/50 mb-4">Verso l'interno</h3>
            <p className="text-[14px] text-[#1a1a1a]/65 leading-relaxed">Il C-level paga 4-5 newsletter premium per sapere cosa succede nel settore — ognuno le sue, nessuno le condivide. I team lavorano a compartimenti stagni. L'HR manda comunicazioni che nessuno legge. Non esiste un'informazione condivisa che crei contesto, allineamento e cultura.</p>
          </div>
        </div>
        <div className="mt-6 bg-[#1a1a1a] text-white rounded-2xl p-6 text-center">
          <p className="text-[17px] font-bold">Non ti serve un content team interno. Non ti serve un'agenzia PR. <span className="text-[#f0c040]">Ti serve un'infrastruttura informativa.</span> Automatica, certificata, personalizzata, multimediale.</p>
        </div>
      </section>

      <div className="border-t border-[#1a1a1a]/8" />

      {/* COSA PUOI COSTRUIRE */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="text-[28px] md:text-[36px] font-black mb-2 tracking-[-0.01em]">Sei soluzioni. Un'unica piattaforma.</h2>
        <p className="text-[15px] text-[#1a1a1a]/50 mb-10">Verso l'esterno, verso l'interno, in ogni formato.</p>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: <Globe className="w-5 h-5" />, emoji: "🌐", title: "Corporate newsroom", desc: "Contenuti freschi ogni giorno, verticali sul tuo settore, certificati, con il tuo brand. Il sito smette di essere una brochure digitale. Google ti indicizza su keyword di settore. I lead arrivano da chi ti legge." },
            { icon: <BarChart2 className="w-5 h-5" />, emoji: "📊", title: "Investor Relations", desc: "La sezione IR diventa un canale informativo attivo: trend di settore, analisi competitor, commento ai risultati, aggiornamenti regolamentari — tutto quotidiano, tutto certificato, tutto professionale." },
            { icon: <Zap className="w-5 h-5" />, emoji: "🔍", title: "Daily Intelligence Brief", desc: "Ogni mattina il management riceve un briefing personalizzato: cosa è successo nel settore, mosse dei competitor, cambi normativi, deal rilevanti. Fonti certificate, zero rumore, formato executive." },
            { icon: <Users className="w-5 h-5" />, emoji: "👥", title: "Canale dipendenti", desc: "ProofPress costruisce un giornale interno: notizie del settore, trend di mercato, successi dell'azienda, contenuti formativi — curati ogni giorno. Un canale vivo sulla intranet che i dipendenti aprono perché è utile." },
            { icon: <Briefcase className="w-5 h-5" />, emoji: "🎯", title: "Feed per business unit", desc: "Il product team monitora i competitor. Il sales monitora deal e prospect. Il legal monitora la regolamentazione. Ogni business unit riceve il suo feed dedicato via Slack, Teams o email." },
            { icon: <Mic className="w-5 h-5" />, emoji: "🎙️", title: "Canali multimediali e Radio", desc: "Il briefing del CEO in auto alle 7:30. Il canale dipendenti in podcast durante la pausa pranzo. La IR in video commento ai risultati. Ogni contenuto diventa multimediale. Ogni audience viene raggiunta nel formato che preferisce." },
          ].map(item => (
            <div key={item.title} className="bg-white border border-[#1a1a1a]/8 rounded-2xl p-6 hover:border-[#1a1a1a]/20 transition-colors">
              <div className="text-[24px] mb-3">{item.emoji}</div>
              <h3 className="text-[15px] font-bold mb-2">{item.title}</h3>
              <p className="text-[13px] text-[#1a1a1a]/60 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-[#1a1a1a]/8" />

      {/* COME FUNZIONA */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="text-[28px] md:text-[36px] font-black mb-10 tracking-[-0.01em]">Tre passi. Poi l'infrastruttura informa da sola.</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: "01", title: "Definisci gli obiettivi", desc: "Corporate newsroom? IR? Intelligence per il management? Feed per i team? Canale HR? Tutto insieme? Definisci cosa vuoi costruire, per quale audience — interna o esterna — e in che formato: testo, video, audio." },
            { n: "02", title: "Configura fonti, temi e distribuzione", desc: "Fonti di settore, competitor, database regolamentari, report interni, feed specifici. Definisci tono, frequenza, canali (sito, intranet, Slack, Teams, email, app). Gli agenti imparano le tue priorità. In pochi giorni sei operativo." },
            { n: "03", title: "L'informazione arriva. Ogni giorno. Senza intervento.", desc: "Il C-level riceve il briefing alle 8:00. La IR si aggiorna in automatico. La intranet pubblica il canale dipendenti. Il sito ha contenuti freschi. I team ricevono i loro feed. Zero intervento manuale. Zero redazione interna." },
          ].map(step => (
            <div key={step.n} className="relative">
              <div className="text-[48px] font-black text-[#1a1a1a]/8 leading-none mb-3">{step.n}</div>
              <h3 className="text-[15px] font-bold mb-2">{step.title}</h3>
              <p className="text-[14px] text-[#1a1a1a]/60 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-[#1a1a1a]/8" />

      {/* ROI */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="text-[28px] md:text-[36px] font-black mb-8 tracking-[-0.01em]">I numeri per chi deve approvare il budget.</h2>
        <div className="space-y-6">
          {/* Tabella 1 */}
          <div>
            <h3 className="text-[14px] font-bold tracking-[0.1em] uppercase text-[#1a1a1a]/50 mb-3">Corporate newsroom vs. content team interno</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] bg-white border border-[#1a1a1a]/8 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-[#1a1a1a]/4">
                    <th className="text-left py-3 px-4 font-bold text-[#1a1a1a]/50"></th>
                    <th className="text-center py-3 px-4 font-bold text-[#1a1a1a]/50">Content team interno</th>
                    <th className="text-center py-3 px-4 font-bold text-[#1a1a1a]">ProofPress BUSINESS</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Costo annuo", "€120-180k (2 persone + tool)", "€24.880 (piano + setup)"],
                    ["Output", "3-5 articoli/settimana", "5-15 articoli/giorno"],
                    ["Certificazione", "Nessuna", "ProofPress Verify inclusa"],
                    ["Time to market", "2-3 mesi", "5-10 giorni"],
                  ].map(([f, a, b]) => (
                    <tr key={f} className="border-t border-[#1a1a1a]/5">
                      <td className="py-2.5 px-4 text-[#1a1a1a]/60">{f}</td>
                      <td className="py-2.5 px-4 text-center text-[#1a1a1a]/50">{a}</td>
                      <td className="py-2.5 px-4 text-center font-semibold text-[#1a1a1a]">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <div className="border-t border-[#1a1a1a]/8" />

      {/* PIANI */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="text-[28px] md:text-[36px] font-black mb-2 tracking-[-0.01em]">Scegli la tua configurazione.</h2>
        <p className="text-[15px] text-[#1a1a1a]/50 mb-10">Ogni piano include ProofPress Verify. Funziona verso l'esterno e verso l'interno. Nessun costo nascosto.</p>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* BUSINESS */}
          <div className="bg-white border border-[#1a1a1a]/10 rounded-2xl p-6">
            <div className="text-[20px] mb-1">🏢</div>
            <div className="text-[17px] font-black mb-1">BUSINESS</div>
            <div className="text-[30px] font-black text-[#1a1a1a] leading-none mb-1">€1.490<span className="text-[14px] font-normal text-[#1a1a1a]/50">/mese</span></div>
            <div className="text-[12px] text-[#1a1a1a]/50 mb-4">Setup: €7.000 una tantum</div>
            <p className="text-[12px] text-[#1a1a1a]/55 mb-4 leading-relaxed">Per scaleup e PMI. Un obiettivo, un'implementazione chiara.</p>
            <div className="space-y-1.5 mb-5">
              {["8 Agent + 4 supporto", "Fino a 6 canali", "ProofPress Verify", "Dashboard editoriale", "Contenuti testuali + video", "Distribuzione: sito, email, Slack", "Newsletter per stakeholder"].map(f => (
                <div key={f} className="flex items-start gap-2 text-[12px] text-[#1a1a1a]/65">
                  <CheckCircle className="w-3.5 h-3.5 text-[#1a1a1a]/40 flex-shrink-0 mt-0.5" />
                  {f}
                </div>
              ))}
            </div>
            <a href={DEMO_URL} target="_blank" rel="noopener noreferrer" className="block">
              <Button variant="outline" className="w-full border-[#1a1a1a]/20 font-bold text-[13px]">
                Guarda la demo
              </Button>
            </a>
          </div>

          {/* CORPORATE */}
          <div className="bg-white border-2 border-[#1a1a1a] rounded-2xl p-6 relative">
            <div className="absolute -top-3 left-6">
              <span className="bg-[#1a1a1a] text-white text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1 rounded-full">Più scelto</span>
            </div>
            <div className="text-[20px] mb-1">🏛️</div>
            <div className="text-[17px] font-black mb-1">CORPORATE</div>
            <div className="text-[30px] font-black text-[#1a1a1a] leading-none mb-1">€2.490<span className="text-[14px] font-normal text-[#1a1a1a]/50">/mese</span></div>
            <div className="text-[12px] text-[#1a1a1a]/50 mb-4">Setup: €12.000 una tantum</div>
            <p className="text-[12px] text-[#1a1a1a]/55 mb-4 leading-relaxed">Per aziende strutturate. Esterno + interno, multi-team, multimediale.</p>
            <div className="space-y-1.5 mb-5">
              {["12 Agent + 4 supporto", "Canali illimitati", "Daily Intelligence Brief", "Canale dipendenti/HR", "Feed per business unit", "Contenuti testuali + video + audio", "Slack, Teams, email, app", "Account manager dedicato", "Analytics avanzato + report mensile"].map(f => (
                <div key={f} className="flex items-start gap-2 text-[12px] text-[#1a1a1a]/65">
                  <CheckCircle className="w-3.5 h-3.5 text-[#1a1a1a] flex-shrink-0 mt-0.5" />
                  {f}
                </div>
              ))}
            </div>
            <Link href={CONTACT_URL}>
              <Button className="w-full bg-[#1a1a1a] hover:bg-[#333] text-white font-bold text-[13px]">
                Parla con noi <ArrowRight className="ml-2 w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* ENTERPRISE */}
          <div className="bg-[#1a1a1a] text-white rounded-2xl p-6">
            <div className="text-[20px] mb-1">⚫</div>
            <div className="text-[17px] font-black mb-1">ENTERPRISE</div>
            <div className="text-[24px] font-black leading-none mb-1">Su misura</div>
            <div className="text-[12px] text-white/40 mb-4">Configurazione e pricing custom</div>
            <p className="text-[12px] text-white/60 mb-4 leading-relaxed">Per chi ha esigenze specifiche: multi-country, compliance, integrazione piena, white-label.</p>
            <div className="space-y-1.5 mb-5">
              {["Configurazione e agenti custom", "Integrazione CMS, Sharepoint, SAP", "API dedicata + SLA garantito", "White-label disponibile", "Multi-team con permessi separati", "Compliance e data residency", "Fatturazione personalizzata"].map(f => (
                <div key={f} className="flex items-start gap-2 text-[12px] text-white/60">
                  <CheckCircle className="w-3.5 h-3.5 text-white/40 flex-shrink-0 mt-0.5" />
                  {f}
                </div>
              ))}
            </div>
            <Link href={CONTACT_URL}>
              <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 font-bold text-[13px]">
                Contattaci
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="border-t border-[#1a1a1a]/8" />

      {/* TABELLA COMPARATIVA */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="text-[24px] font-black mb-6 tracking-[-0.01em]">Confronta i piani.</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#1a1a1a]/10">
                <th className="text-left py-3 pr-4 font-bold text-[#1a1a1a]/50 w-[35%]">Feature</th>
                <th className="text-center py-3 px-3 font-bold text-[#1a1a1a]/60">BUSINESS</th>
                <th className="text-center py-3 px-3 font-bold text-[#1a1a1a]">CORPORATE</th>
                <th className="text-center py-3 px-3 font-bold text-[#1a1a1a]/60">ENTERPRISE</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Agent Giornalisti", "8", "12", "Custom"],
                ["Canali tematici", "Fino a 6", "Illimitati", "Illimitati"],
                ["ProofPress Verify", "✓", "✓", "✓"],
                ["Corporate newsroom", "✓", "✓", "✓"],
                ["Intelligence feed", "✓", "✓", "✓"],
                ["Daily Intelligence Brief", "—", "✓", "✓"],
                ["Canale IR", "✓", "✓", "✓"],
                ["Canale dipendenti/HR", "—", "✓", "✓"],
                ["Feed per business unit", "—", "✓", "✓"],
                ["Video briefing", "✓", "✓", "✓"],
                ["Audio podcast", "—", "✓", "✓"],
                ["Slack/Teams", "✓", "✓", "✓"],
                ["Account manager", "—", "✓", "✓"],
                ["API/integrazione CMS", "—", "—", "✓"],
                ["White-label", "—", "—", "✓"],
                ["Compliance", "—", "—", "✓"],
              ].map(([feat, b, c, e]) => (
                <tr key={feat} className="border-b border-[#1a1a1a]/5 hover:bg-[#1a1a1a]/2">
                  <td className="py-2.5 pr-4 text-[#1a1a1a]/70">{feat}</td>
                  <td className="py-2.5 px-3 text-center text-[#1a1a1a]/50">{b}</td>
                  <td className="py-2.5 px-3 text-center font-semibold text-[#1a1a1a]">{c}</td>
                  <td className="py-2.5 px-3 text-center text-[#1a1a1a]/50">{e}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="border-t border-[#1a1a1a]/8" />

      {/* SOCIAL PROOF */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="text-[24px] font-black mb-8 tracking-[-0.01em]">Aziende che già usano ProofPress.</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { quote: "Il nostro sito corporate era una brochure. Con la newsroom ProofPress il traffico organico è triplicato in 3 mesi e i lead qualificati sono aumentati del 60%.", author: "CMO, azienda B2B", location: "Roma" },
            { quote: "La sezione IR era morta. Ora pubblica analisi di settore ogni giorno. Gli analisti ci hanno chiesto come facciamo.", author: "CFO, scaleup fintech", location: "Londra" },
            { quote: "Abbiamo sostituito 4 newsletter a pagamento con un feed interno ProofPress. Il C-level riceve un briefing personalizzato ogni mattina. Costo: un quarto di prima.", author: "Head of Strategy, scaleup SaaS", location: "Berlino" },
            { quote: "L'HR cercava engagement. Il canale informativo sulla intranet ha un tasso di apertura del 72%. Nessuna comunicazione interna ha mai avuto questi numeri.", author: "CHRO, corporate industriale", location: "Milano" },
            { quote: "Il podcast automatico della IR ha 1.200 ascolti a settimana. Gli analisti lo ascoltano la mattina invece di leggere il report. Non l'avremmo mai immaginato.", author: "Head of IR, azienda quotata", location: "Francoforte" },
          ].map(t => (
            <div key={t.author} className="bg-white border border-[#1a1a1a]/8 rounded-2xl p-6">
              <p className="text-[13px] text-[#1a1a1a]/70 leading-relaxed mb-4 italic">"{t.quote}"</p>
              <div className="text-[11px] font-semibold text-[#1a1a1a]/50">— {t.author} · {t.location}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-[#1a1a1a]/8" />

      {/* CTA FINALE */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h2 className="text-[32px] md:text-[42px] font-black mb-4 tracking-[-0.02em]">Il tuo sito, la tua IR, la tua intranet possono essere vivi domani.</h2>
        <p className="text-[16px] text-[#1a1a1a]/55 mb-8 max-w-xl mx-auto">Guarda la piattaforma in azione. Non è un video — è la demo live con dati reali. In 5 minuti capisci cosa può fare per la tua azienda.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
            <Button className="bg-[#1a1a1a] hover:bg-[#333] text-white font-bold px-10 py-3 text-[15px]">
              Guarda la demo live <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </a>
          <Link href={CONTACT_URL}>
            <Button variant="outline" className="border-[#1a1a1a]/20 font-bold px-10 py-3 text-[15px]">
              Parla con noi
            </Button>
          </Link>
        </div>
        <p className="text-[12px] text-[#1a1a1a]/35 tracking-[0.1em] uppercase">Setup in pochi giorni · Nessun software da installare · Nessun costo nascosto</p>

        <div className="mt-10 pt-8 border-t border-[#1a1a1a]/8 flex flex-col sm:flex-row gap-4 justify-center text-[13px]">
          <Link href="/offerta/creator" className="text-[#c0392b] font-semibold hover:underline">
            Sei un creator? → Offerta Creator
          </Link>
          <span className="text-[#1a1a1a]/20 hidden sm:inline">·</span>
          <Link href="/offerta/editori" className="text-[#c0392b] font-semibold hover:underline">
            Sei un editore? → Offerta Testate
          </Link>
        </div>
      </section>
    </div>
  );
}
