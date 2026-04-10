import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ArrowRight, Mic, Newspaper, BarChart2, TrendingUp } from "lucide-react";
import OffertaLeadForm from "@/components/OffertaLeadForm";

const DEMO_URL = "https://ideasmart.technology";
const CONTACT_URL = "/contatti";

export default function OffertaEditori() {
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
            <Link href="/offerta/aziende" className="hover:text-[#c0392b] transition-colors">Offerta Corporate →</Link>
          </div>
        </div>
      </div>

      {/* HERO */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12">
        <div className="text-center">
          <span className="inline-block text-[10px] font-bold tracking-[0.25em] uppercase bg-[#c0392b] text-white px-3 py-1.5 rounded-sm mb-6">
            Per Editori, Testate Online e Media Company
          </span>
          <h1 className="text-[42px] md:text-[56px] font-black leading-[1.05] tracking-[-0.02em] mb-6 max-w-3xl mx-auto">
            Più verticali. Più contenuti. Più ricavi. Stessa redazione.
          </h1>
          <p className="text-[17px] text-[#1a1a1a]/65 leading-relaxed max-w-2xl mx-auto mb-8">
            Hai una testata che funziona ma non riesci a espandere. Vorresti coprire nuovi segmenti ma ogni verticale richiede giornalisti, fonti, competenze. ProofPress aggiunge linee editoriali complete alla tua testata — ognuna con agenti dedicati — senza un'assunzione. Più canali significa più inventory, più lettori, più ricavi pubblicitari.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-2xl mx-auto">
            {[
              { value: "4.000+", label: "fonti monitorate 24/7" },
              { value: "12", label: "agenti giornalisti" },
              { value: "100%", label: "contenuti certificati" },
              { value: "3x", label: "inventory pubblicitaria media dopo 4 mesi" },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-[#1a1a1a]/8 rounded-xl p-4">
                <div className="text-[28px] font-black text-[#c0392b] leading-none">{s.value}</div>
                <div className="text-[11px] text-[#1a1a1a]/50 mt-1 leading-tight">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
              <Button className="bg-[#c0392b] hover:bg-[#a93226] text-white font-bold px-8 py-3 text-[14px] tracking-[0.05em]">
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
        <h2 className="text-[28px] md:text-[36px] font-black mb-6 tracking-[-0.01em]">Il paradosso dell'editore digitale: per fare ricavi devi scalare, per scalare devi spendere.</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="text-[15px] text-[#1a1a1a]/70 leading-relaxed space-y-4">
            <p>Ogni nuovo verticale richiede almeno 1-2 giornalisti specializzati (€40-80k/anno ciascuno), nuove fonti, nuovo know-how. I ricavi pubblicitari sono proporzionali al volume di contenuti e al numero di pagine indicizzate — ma il costo di produzione cresce linearmente con ogni assunzione.</p>
            <p>Le testate che scalano lo fanno in due modi: o abbassano la qualità (più clickbait, meno verifica, contenuti superficiali) o bruciano cassa sperando di raggiungere la massa critica prima dei soldi.</p>
            <p>Intanto, l'AI generativa sta abbassando a zero il costo di produzione per chiunque — ma senza verifica, quei contenuti sono rumore, non segnale.</p>
          </div>
          <div className="bg-[#c0392b]/5 border border-[#c0392b]/15 rounded-2xl p-6">
            <p className="text-[18px] font-bold text-[#c0392b] mb-3">ProofPress ti dà il volume senza sacrificare la qualità. E la certificazione che i tuoi competitor non hanno.</p>
            <div className="space-y-2">
              {["Nuovi verticali senza assunzioni", "Produzione quotidiana automatica", "Certificazione ProofPress Verify", "Paywall e newsletter per canale", "Analytics per canale"].map(f => (
                <div key={f} className="flex items-center gap-2 text-[14px] text-[#1a1a1a]/70">
                  <CheckCircle className="w-4 h-4 text-[#c0392b] flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="border-t border-[#1a1a1a]/8" />

      {/* COSA PUOI COSTRUIRE */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="text-[28px] md:text-[36px] font-black mb-2 tracking-[-0.01em]">Espandi, automatizza, monetizza.</h2>
        <p className="text-[15px] text-[#1a1a1a]/50 mb-10">Quattro leve per far crescere la tua testata.</p>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { icon: <Newspaper className="w-5 h-5" />, title: "Aggiungi verticali senza assumere", desc: "Hai una testata tech e vorresti coprire anche finanza, energia, healthcare, legal? Con ProofPress ogni nuovo verticale è un set di agenti dedicati con fonti specializzate e tono calibrato. Il costo marginale di un nuovo canale è una frazione di un'assunzione. In 4 mesi puoi triplicare i canali e l'inventory pubblicitaria." },
            { icon: <BarChart2 className="w-5 h-5" />, title: "Automatizza la produzione quotidiana", desc: "I tuoi giornalisti umani si concentrano sulle inchieste, le interviste, i pezzi d'opinione — il lavoro che solo un umano può fare. Gli agenti ProofPress si occupano della copertura quotidiana: breaking news, rassegne, aggiornamenti di mercato, analisi dati. La redazione umana diventa strategica, non operativa." },
            { icon: <TrendingUp className="w-5 h-5" />, title: "Lancia una testata verticale da zero", desc: "Vuoi testare un nuovo mercato editoriale senza rischiare? Lancia un verticale con ProofPress: se funziona, lo scali. Se non funziona, chiudi senza costi fissi residui. Il time-to-market passa da mesi a giorni. Il rischio passa da centinaia di migliaia di euro a poche migliaia." },
            { icon: <Mic className="w-5 h-5" />, title: "Aggiungi l'audio alla tua testata", desc: "Con ProofPress Radio ogni canale testuale diventa anche un canale audio. Bollettini giornalieri stile GR, podcast multi-episodio, feed RSS per Spotify e Apple Podcast. Un nuovo formato di distribuzione che raggiunge i lettori dove il testo non arriva — in auto, in palestra, in viaggio." },
          ].map(item => (
            <div key={item.title} className="bg-white border border-[#1a1a1a]/8 rounded-2xl p-6 hover:border-[#c0392b]/30 transition-colors">
              <div className="w-9 h-9 bg-[#c0392b]/10 rounded-lg flex items-center justify-center text-[#c0392b] mb-4">{item.icon}</div>
              <h3 className="text-[16px] font-bold mb-2">{item.title}</h3>
              <p className="text-[14px] text-[#1a1a1a]/60 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-[#1a1a1a]/8" />

      {/* COME FUNZIONA */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="text-[28px] md:text-[36px] font-black mb-10 tracking-[-0.01em]">Tre passi. Poi la nuova linea editoriale è operativa.</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: "01", title: "Scegli i verticali da espandere", desc: "Vuoi aggiungere finanza alla tua testata tech? O lanciare una testata completamente nuova? Decidi quanti canali, con che profondità, e per quale audience. Noi ti aiutiamo a mappare le fonti ottimali per ogni verticale." },
            { n: "02", title: "Configura fonti, tono e standard", desc: "Ogni verticale ha i suoi agenti dedicati con fonti specializzate. Definisci il tono (deve essere coerente con la testata madre o differenziato?), gli standard qualitativi, la frequenza di pubblicazione. Gli agenti si calibrano in pochi giorni." },
            { n: "03", title: "Pubblica, distribuisci, monetizza", desc: "I nuovi verticali pubblicano in automatico — quotidianamente, con certificazione ProofPress Verify su ogni pezzo. Newsletter, social, paywall — tutto configurabile per canale. Tu gestisci la strategia editoriale, la piattaforma fa il resto." },
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
        <h2 className="text-[28px] md:text-[36px] font-black mb-8 tracking-[-0.01em]">I numeri che un editore capisce al volo.</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#1a1a1a]/4 rounded-2xl p-6">
            <h3 className="text-[14px] font-bold tracking-[0.1em] uppercase text-[#1a1a1a]/50 mb-4">Costo di un nuovo verticale tradizionale</h3>
            <div className="space-y-2">
              {["1-2 giornalisti specializzati: €80-160k/anno", "Tool, fonti, abbonamenti: €10-20k/anno", "Management overhead: €15-25k/anno", "Time to market: 3-6 mesi", "Totale anno 1: €105-205k per un verticale"].map(i => (
                <div key={i} className="flex items-start gap-2 text-[13px] text-[#1a1a1a]/65">
                  <XCircle className="w-4 h-4 text-[#1a1a1a]/30 flex-shrink-0 mt-0.5" />
                  {i}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#c0392b]/5 border border-[#c0392b]/15 rounded-2xl p-6">
            <h3 className="text-[14px] font-bold tracking-[0.1em] uppercase text-[#c0392b] mb-4">Con ProofPress REDAZIONE</h3>
            <div className="space-y-2">
              {["Piano REDAZIONE (fino a 6 canali): €17.880/anno + €7.000 setup", "Time to market: 5-10 giorni", "Canale aggiuntivo: €3.480/anno", "Totale anno 1 per 3 verticali: ~€25.000", "Costo: -80% rispetto a un'espansione tradizionale"].map(i => (
                <div key={i} className="flex items-start gap-2 text-[13px] text-[#1a1a1a]/70">
                  <CheckCircle className="w-4 h-4 text-[#c0392b] flex-shrink-0 mt-0.5" />
                  {i}
                </div>
              ))}
            </div>
            <p className="text-[12px] text-[#1a1a1a]/45 mt-4 italic">3-5x più contenuti per verticale · Inventory pubblicitaria 3x in 4 mesi · Disdici quando vuoi</p>
          </div>
        </div>
      </section>

      <div className="border-t border-[#1a1a1a]/8" />

      {/* PIANI */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="text-[28px] md:text-[36px] font-black mb-2 tracking-[-0.01em]">Due piani per chi pubblica seriamente.</h2>
        <p className="text-[15px] text-[#1a1a1a]/50 mb-10">Revenue share disponibile su entrambi i piani.</p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* REDAZIONE */}
          <div className="bg-white border-2 border-[#c0392b] rounded-2xl p-8 relative">
            <div className="absolute -top-3 left-6">
              <span className="bg-[#c0392b] text-white text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1 rounded-full">⭐ Piano più scelto</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[20px]">📰</span>
              <span className="text-[18px] font-black">REDAZIONE</span>
            </div>
            <div className="text-[36px] font-black text-[#c0392b] leading-none mb-1">€1.490<span className="text-[16px] font-normal text-[#1a1a1a]/50">/mese</span></div>
            <div className="text-[13px] text-[#1a1a1a]/50 mb-2">Setup: €7.000 una tantum</div>
            <div className="text-[12px] text-[#1a1a1a]/40 mb-5 italic">Alt. revenue share: €3.500 setup + 25% ricavi (min €500/mese)</div>
            <p className="text-[13px] font-semibold text-[#1a1a1a]/70 mb-5">Per testate che vogliono espandere. Multi-canale, multi-formato, monetizzabile.</p>
            <div className="space-y-2 mb-6">
              {["8 Agent Giornalisti + 4 agenti di supporto", "Fino a 6 canali tematici", "Newsletter personalizzabile per canale + paywall", "Post social automatici (LinkedIn, X) per canale", "ProofPress Verify su ogni articolo", "Dashboard editoriale con analytics per canale", "Contenuti testuali + video briefing", "Supporto prioritario"].map(f => (
                <div key={f} className="flex items-start gap-2 text-[13px] text-[#1a1a1a]/70">
                  <CheckCircle className="w-4 h-4 text-[#c0392b] flex-shrink-0 mt-0.5" />
                  {f}
                </div>
              ))}
            </div>
            <a href={DEMO_URL} target="_blank" rel="noopener noreferrer" className="block">
              <Button className="w-full bg-[#c0392b] hover:bg-[#a93226] text-white font-bold">
                Guarda la demo <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </a>
          </div>

          {/* EDITORE */}
          <div className="bg-white border border-[#1a1a1a]/10 rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[20px]">🏛️</span>
              <span className="text-[18px] font-black">EDITORE</span>
            </div>
            <div className="text-[36px] font-black text-[#1a1a1a] leading-none mb-1">€2.490<span className="text-[16px] font-normal text-[#1a1a1a]/50">/mese</span></div>
            <div className="text-[13px] text-[#1a1a1a]/50 mb-2">Setup: €12.000 una tantum</div>
            <div className="text-[12px] text-[#1a1a1a]/40 mb-5 italic">Alt. revenue share: €5.000 setup + 20% ricavi (min €900/mese)</div>
            <p className="text-[13px] font-semibold text-[#1a1a1a]/70 mb-5">Per chi scala senza limiti. Canali illimitati, analytics avanzato, account manager.</p>
            <div className="space-y-2 mb-6">
              {["12 Agent Giornalisti + 4 agenti di supporto", "Canali illimitati", "Newsletter + paywall + abbonamenti multi-tier", "Analytics avanzato + report mensile per canale", "Account manager dedicato", "Contenuti testuali + video briefing + audio podcast", "Integrazione con piattaforme adv (Google Ad Manager)", "Accesso prioritario a nuove feature", "Onboarding assistito con mappatura fonti"].map(f => (
                <div key={f} className="flex items-start gap-2 text-[13px] text-[#1a1a1a]/70">
                  <CheckCircle className="w-4 h-4 text-[#1a1a1a]/40 flex-shrink-0 mt-0.5" />
                  {f}
                </div>
              ))}
            </div>
            <Link href={CONTACT_URL}>
              <Button variant="outline" className="w-full border-[#1a1a1a]/20 font-bold">
                Parla con noi <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Add-on */}
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { icon: "🎙️", name: "ProofPress Radio", price: "€390/mese per canale", desc: "Conversione automatica articoli → audio broadcast-quality. Feed RSS per Spotify e Apple Podcast. Bundle 3+ canali: €290/mese per canale." },
            { icon: "📰", name: "Canale aggiuntivo", price: "€290/mese per canale", desc: "Per il piano REDAZIONE: espandi oltre i 6 canali inclusi senza passare al piano EDITORE." },
          ].map(a => (
            <div key={a.name} className="bg-white border border-[#1a1a1a]/8 rounded-xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span>{a.icon}</span>
                    <span className="text-[14px] font-bold">{a.name}</span>
                  </div>
                  <p className="text-[13px] text-[#1a1a1a]/55 leading-relaxed">{a.desc}</p>
                </div>
                <div className="text-[13px] font-bold text-[#c0392b] whitespace-nowrap">{a.price}</div>
              </div>
            </div>
          ))}
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
                <th className="text-left py-3 pr-4 font-bold text-[#1a1a1a]/50 w-[40%]">Feature</th>
                <th className="text-center py-3 px-4 font-bold text-[#c0392b]">REDAZIONE</th>
                <th className="text-center py-3 px-4 font-bold text-[#1a1a1a]">EDITORE</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Agent Giornalisti", "8", "12"],
                ["Canali tematici", "Fino a 6", "Illimitati"],
                ["ProofPress Verify", "✓", "✓"],
                ["Newsletter per canale", "✓", "✓ + multi-tier"],
                ["Paywall", "✓", "✓ + abbonamenti"],
                ["Post social per canale", "✓", "✓"],
                ["Video briefing", "✓", "✓"],
                ["Audio podcast", "—", "✓"],
                ["Analytics", "Per canale", "Avanzato + report"],
                ["Integrazione adv", "—", "✓"],
                ["Account manager", "—", "✓"],
                ["Revenue share", "✓ (25%)", "✓ (20%)"],
              ].map(([feat, r, e]) => (
                <tr key={feat} className="border-b border-[#1a1a1a]/5 hover:bg-[#1a1a1a]/2">
                  <td className="py-2.5 pr-4 text-[#1a1a1a]/70">{feat}</td>
                  <td className="py-2.5 px-4 text-center font-medium text-[#c0392b]">{r}</td>
                  <td className="py-2.5 px-4 text-center font-medium">{e}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="border-t border-[#1a1a1a]/8" />

      {/* SOCIAL PROOF */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="text-[24px] font-black mb-8 tracking-[-0.01em]">Testate che già usano ProofPress.</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {[
            { quote: "Abbiamo aggiunto 3 verticali alla testata senza assumere nessuno. I ricavi pubblicitari sono cresciuti del 40% in 4 mesi perché abbiamo triplicato l'inventory.", author: "Direttore editoriale, testata tech", location: "Milano" },
            { quote: "Volevamo testare un verticale healthcare. Con ProofPress lo abbiamo lanciato in una settimana. Dopo 3 mesi aveva più traffico del nostro canale storico.", author: "CEO, media company digitale", location: "Roma" },
            { quote: "Il revenue share ci ha permesso di partire senza rischio. Ora ProofPress gestisce 4 canali della nostra testata e i costi editoriali sono calati del 65%.", author: "COO, editore digitale", location: "Barcellona" },
            { quote: "ProofPress Radio ha aperto un canale di distribuzione che non avevamo. Il podcast automatico del verticale finanza ha 3.000 ascolti/settimana dopo 2 mesi.", author: "Head of Digital, testata business", location: "Londra" },
          ].map(t => (
            <div key={t.author} className="bg-white border border-[#1a1a1a]/8 rounded-2xl p-6">
              <p className="text-[14px] text-[#1a1a1a]/70 leading-relaxed mb-4 italic">"{t.quote}"</p>
              <div className="text-[12px] font-semibold text-[#1a1a1a]/50">— {t.author} · {t.location}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-[#1a1a1a]/8" />

      {/* CTA FINALE */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h2 className="text-[32px] md:text-[42px] font-black mb-4 tracking-[-0.02em]">Il prossimo verticale della tua testata può andare live tra una settimana.</h2>
        <p className="text-[16px] text-[#1a1a1a]/55 mb-8 max-w-xl mx-auto">Non è una promessa — è quello che facciamo. Guarda la piattaforma in azione con dati reali.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
            <Button className="bg-[#c0392b] hover:bg-[#a93226] text-white font-bold px-10 py-3 text-[15px]">
              Guarda la demo live <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </a>
          <Link href={CONTACT_URL}>
            <Button variant="outline" className="border-[#1a1a1a]/20 font-bold px-10 py-3 text-[15px]">
              Parla con noi
            </Button>
          </Link>
        </div>
        <p className="text-[12px] text-[#1a1a1a]/35 tracking-[0.1em] uppercase">Setup in pochi giorni · Revenue share disponibile · Disdici quando vuoi</p>

        <div className="mt-10 pt-8 border-t border-[#1a1a1a]/8 flex flex-col sm:flex-row gap-4 justify-center text-[13px]">
          <Link href="/offerta/creator" className="text-[#c0392b] font-semibold hover:underline">
            Sei un creator? → Offerta Creator
          </Link>
          <span className="text-[#1a1a1a]/20 hidden sm:inline">·</span>
          <Link href="/offerta/aziende" className="text-[#c0392b] font-semibold hover:underline">
            Sei un'azienda? → Offerta Corporate
          </Link>
        </div>
      </section>

      {/* LEAD FORM */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <OffertaLeadForm
          source="editori"
          title="Inizia oggi — parla con noi"
          subtitle="Compila il form e ti contatteremo entro 24 ore con tutti i dettagli sull'offerta per Testate ed Editori. Nessun impegno."
        />
      </section>
    </div>
  );
}
