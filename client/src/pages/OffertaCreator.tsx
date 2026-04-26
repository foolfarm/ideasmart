import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ArrowRight, Mic, Newspaper, Mail, Users, Shield, Zap, Clock } from "lucide-react";
import OffertaLeadForm from "@/components/OffertaLeadForm";

const DEMO_URL = "https://ideasmart.technology";
const PREVENTIVO_URL = "/preventivo-creator";

export default function OffertaCreator() {
  return (
    <div className="min-h-screen bg-[#faf9f7] text-[#1a1a1a]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>

      {/* NAV BREADCRUMB */}
      <div className="border-b border-[#1a1a1a]/8 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]/50 hover:text-[#1a1a1a] transition-colors">
            ← ProofPress
          </Link>
          <div className="flex items-center gap-4 text-[11px] font-medium tracking-[0.12em] uppercase text-[#1a1a1a]/40">
            <Link href="/offerta/editori" className="hover:text-[#c0392b] transition-colors">Offerta Testate →</Link>
            <Link href="/offerta/aziende" className="hover:text-[#c0392b] transition-colors">Offerta Corporate →</Link>
          </div>
        </div>
      </div>

      {/* HERO */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12">
        <div className="text-center">
          <span className="inline-block text-[10px] font-bold tracking-[0.25em] uppercase bg-[#c0392b] text-white px-3 py-1.5 rounded-sm mb-6">
            Per Giornalisti, Analisti e Creator
          </span>
          <h1 className="text-[42px] md:text-[56px] font-black leading-[1.05] tracking-[-0.02em] mb-6 max-w-3xl mx-auto">
            La tua testata. La tua firma. Zero redazione.
          </h1>
          <p className="text-[17px] text-[#1a1a1a]/65 leading-relaxed max-w-2xl mx-auto mb-8">
            Sei un giornalista indipendente, un analista, un newsletter creator. Hai le idee e la competenza — ti manca il tempo e la struttura. ProofPress ti dà una redazione AI che scrive, verifica e pubblica per te. Tu mantieni la voce, il controllo e la firma. Ogni contenuto certificato.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-2xl mx-auto">
            {[
              { value: "4.000+", label: "fonti monitorate 24/7" },
              { value: "15", label: "articoli/giorno con SOLO" },
              { value: "100%", label: "contenuti certificati" },
              { value: "1", label: "persona per gestire tutto" },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-[#1a1a1a]/8 rounded-xl p-4">
                <div className="text-[28px] font-black text-[#c0392b] leading-none">{s.value}</div>
                <div className="text-[11px] text-[#1a1a1a]/50 mt-1 leading-tight">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={PREVENTIVO_URL}>
              <Button className="bg-[#c0392b] hover:bg-[#a93226] text-white font-bold px-8 py-3 text-[14px] tracking-[0.05em]">
                Richiedi preventivo <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-[#1a1a1a]/20 font-bold px-8 py-3 text-[14px]">
                Guarda la demo live
              </Button>
            </a>
          </div>
        </div>
      </section>

      <div className="border-t border-[#1a1a1a]/8" />

      {/* IL PROBLEMA */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="text-[28px] md:text-[36px] font-black mb-6 tracking-[-0.01em]">Hai il talento. Non hai le 16 ore al giorno.</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="text-[15px] text-[#1a1a1a]/70 leading-relaxed space-y-4">
            <p>Lo sai già: monitorare le fonti richiede 2 ore. Scrivere un pezzo decente altre 2. Verificare i dati, formattare, pubblicare, distribuire, gestire la newsletter — altre 3. Moltiplica per 5 giorni e hai un lavoro full-time che produce 5 articoli a settimana. I tuoi lettori ne vorrebbero 5 al giorno.</p>
            <p>E intanto devi anche trovare clienti, gestire i social, rispondere alle email, fatturare, vivere.</p>
            <p>Il risultato: pubblichi meno di quanto vorresti, cresci più lentamente di quanto potresti, e il tuo lettore si abitua a cercare altrove. Non perché sei meno bravo — perché sei solo.</p>
          </div>
          <div className="bg-[#c0392b]/5 border border-[#c0392b]/15 rounded-2xl p-6">
            <p className="text-[18px] font-bold text-[#c0392b] mb-3">ProofPress ti dà il team che non puoi assumere.</p>
            <div className="space-y-2">
              {["Monitoraggio fonti automatico", "Scrittura con il tuo tono", "Certificazione ProofPress Verify", "Distribuzione newsletter", "Analytics e dashboard"].map(f => (
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
        <h2 className="text-[28px] md:text-[36px] font-black mb-2 tracking-[-0.01em]">Da solo, ma con una redazione alle spalle.</h2>
        <p className="text-[15px] text-[#1a1a1a]/50 mb-10">Quattro cose che puoi fare da domani.</p>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { icon: <Newspaper className="w-5 h-5" />, title: "La tua testata verticale", desc: "Scegli il tuo verticale — AI, fintech, venture capital, sport business, healthcare, energia, real estate, food, fashion, crypto — e lancia una testata completa in pochi giorni. Gli agenti monitorano le fonti che scegli tu, scrivono con il tono che decidi tu, certificano tutto con ProofPress Verify. Tu firmi, correggi se vuoi, e pubblichi." },
            { icon: <Mail className="w-5 h-5" />, title: "La tua newsletter che scala", desc: "Passi da una newsletter settimanale a una quotidiana senza aggiungere ore di lavoro. Gli agenti selezionano le notizie rilevanti, scrivono i riassunti, impaginano e inviano. Tu scegli i temi e approvi. Il ritmo di pubblicazione non dipende più dal tuo tempo — dipende dalla tua ambizione." },
            { icon: <Mic className="w-5 h-5" />, title: "La tua voce, su più canali", desc: "Non solo testo. Con l'add-on Radio trasformi i tuoi articoli in podcast e bollettini audio con voci AI realistiche. I tuoi lettori ti leggono al mattino e ti ascoltano in auto. Un canale diventa due. L'engagement raddoppia." },
            { icon: <Shield className="w-5 h-5" />, title: "La tua credibilità, certificata", desc: "Ogni contenuto porta il badge ProofPress Verify. I tuoi lettori sanno che quello che scrivi è verificato su fonti multiple e sigillato con hash crittografico. Non devi più dire \"fidati di me\" — puoi dire \"controlla tu\"." },
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
        <h2 className="text-[28px] md:text-[36px] font-black mb-10 tracking-[-0.01em]">Tre passi. Poi scrivi solo quando vuoi, non quando devi.</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: "01", title: "Scegli il tuo verticale e il tuo stile", desc: "AI e startup? Venture capital europeo? Real estate di lusso? Healthcare e biotech? Decidi il tema, il tono (formale, conversazionale, tecnico, divulgativo), e le fonti da monitorare. Se non sai da dove partire, ti aiutiamo noi." },
            { n: "02", title: "Gli agenti imparano la tua voce", desc: "In pochi giorni gli agenti assimilano il tuo stile. Non scrivono come un robot — scrivono come scriveresti tu se avessi 12 ore in più al giorno. Puoi sempre intervenire, editare, aggiungere il tuo punto di vista." },
            { n: "03", title: "Pubblica, distribuisci, cresci", desc: "La redazione monitora, verifica, scrive e distribuisce — ogni giorno, senza pause. Tu ti concentri su quello che sai fare meglio: pensare, analizzare, avere opinioni. Il lavoro meccanico lo fanno gli agenti." },
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

      {/* PIANO */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="text-[28px] md:text-[36px] font-black mb-2 tracking-[-0.01em]">Un piano. Tutto incluso. Pensato per chi lavora da solo.</h2>
        <p className="text-[15px] text-[#1a1a1a]/50 mb-10">Alternativa revenue share disponibile: €1.500 setup + 25% dei ricavi (minimo €200/mese)</p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Piano SOLO */}
          <div className="bg-white border-2 border-[#c0392b] rounded-2xl p-8 relative">
            <div className="absolute -top-3 left-6">
              <span className="bg-[#c0392b] text-white text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1 rounded-full">Piano principale</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[20px]">✍️</span>
              <span className="text-[18px] font-black">SOLO</span>
            </div>
            <div className="text-[36px] font-black text-[#c0392b] leading-none mb-1">€690<span className="text-[16px] font-normal text-[#1a1a1a]/50">/mese</span></div>
            <div className="text-[13px] text-[#1a1a1a]/50 mb-6">Setup: €3.500 una tantum</div>
            <p className="text-[13px] font-semibold text-[#1a1a1a]/70 mb-5">La tua redazione personale. Un verticale, pubblicazione quotidiana, certificazione inclusa.</p>
            <div className="space-y-2 mb-6">
              {["4 Agent Giornalisti + 4 agenti di supporto", "1 canale tematico (espandibile)", "Fino a 15 articoli/giorno", "Newsletter settimanale inclusa", "ProofPress Verify su ogni contenuto", "Distribuzione: sito web + email", "Dashboard base con analytics", "Gestibile da 1 persona", "Onboarding guidato"].map(f => (
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

          {/* Add-on */}
          <div className="space-y-4">
            <h3 className="text-[14px] font-bold tracking-[0.1em] uppercase text-[#1a1a1a]/40 mb-4">Add-on disponibili</h3>
            {[
              { icon: "🎙️", name: "ProofPress Radio", price: "€390/mese", desc: "Trasforma i tuoi articoli in podcast e bollettini audio. Voci AI broadcast-quality, feed RSS per Spotify e Apple Podcast." },
              { icon: "📰", name: "Canale aggiuntivo", price: "€290/mese per canale", desc: "Vuoi coprire un secondo verticale? Aggiungi un canale con agenti dedicati senza cambiare piano." },
              { icon: "📧", name: "Newsletter quotidiana", price: "€190/mese", desc: "Passa dalla newsletter settimanale a quella quotidiana con selezione e invio automatico." },
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
        </div>
      </section>

      <div className="border-t border-[#1a1a1a]/8" />

      {/* ROI */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="text-[28px] md:text-[36px] font-black mb-8 tracking-[-0.01em]">Quanto ti costa oggi fare quello che ProofPress fa in automatico?</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#1a1a1a]/4 rounded-2xl p-6">
            <h3 className="text-[14px] font-bold tracking-[0.1em] uppercase text-[#1a1a1a]/50 mb-4">Senza ProofPress</h3>
            <div className="space-y-2">
              {["4-5 ore/giorno per monitoraggio fonti, scrittura, verifica, pubblicazione", "20-25 ore/settimana di lavoro meccanico", "5-7 articoli/settimana se sei veloce", "0 certificazione, 0 automazione", "Costo opportunità: consulenze, clienti, progetti non fatti"].map(i => (
                <div key={i} className="flex items-start gap-2 text-[13px] text-[#1a1a1a]/65">
                  <XCircle className="w-4 h-4 text-[#1a1a1a]/30 flex-shrink-0 mt-0.5" />
                  {i}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#c0392b]/5 border border-[#c0392b]/15 rounded-2xl p-6">
            <h3 className="text-[14px] font-bold tracking-[0.1em] uppercase text-[#c0392b] mb-4">Con ProofPress SOLO</h3>
            <div className="space-y-2">
              {["30 minuti/giorno per review e approvazione (opzionale)", "Fino a 15 articoli/giorno pubblicati e certificati", "Newsletter automatica", "Costo: €690/mese = €23/giorno = meno di un pranzo di lavoro"].map(i => (
                <div key={i} className="flex items-start gap-2 text-[13px] text-[#1a1a1a]/70">
                  <CheckCircle className="w-4 h-4 text-[#c0392b] flex-shrink-0 mt-0.5" />
                  {i}
                </div>
              ))}
            </div>
            <p className="text-[12px] text-[#1a1a1a]/45 mt-4 italic">Le ore che risparmi le investi in consulenze, clienti, formazione, vita. Il ROI si paga dal primo mese.</p>
          </div>
        </div>
      </section>

      <div className="border-t border-[#1a1a1a]/8" />

      {/* PER CHI È */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-[18px] font-black mb-4 text-[#1a1a1a]">✅ Perfetto per te se:</h3>
            <div className="space-y-2">
              {["Sei un giornalista freelance che vuole la sua testata senza il peso di una redazione", "Sei un analista che pubblica report e vuole aumentare la frequenza e la reach", "Sei un newsletter creator che vuole passare da hobby a media business", "Sei un esperto di settore che vuole posizionarsi come voce di riferimento", "Sei un podcaster che vuole aggiungere contenuti scritti al suo canale"].map(i => (
                <div key={i} className="flex items-start gap-2 text-[14px] text-[#1a1a1a]/70">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  {i}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-[18px] font-black mb-4 text-[#1a1a1a]">❌ Probabilmente non è per te se:</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-[14px] text-[#1a1a1a]/70">
                <XCircle className="w-4 h-4 text-[#1a1a1a]/30 flex-shrink-0 mt-0.5" />
                <span>Hai già una redazione strutturata e cerchi di automatizzarla →{" "}
                  <Link href="/offerta/editori" className="text-[#c0392b] font-semibold hover:underline">Offerta Testate →</Link>
                </span>
              </div>
              <div className="flex items-start gap-2 text-[14px] text-[#1a1a1a]/70">
                <XCircle className="w-4 h-4 text-[#1a1a1a]/30 flex-shrink-0 mt-0.5" />
                <span>Sei un'azienda e vuoi una corporate newsroom o un feed interno →{" "}
                  <Link href="/offerta/aziende" className="text-[#c0392b] font-semibold hover:underline">Offerta Corporate →</Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="border-t border-[#1a1a1a]/8" />

      {/* SOCIAL PROOF */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="text-[24px] font-black mb-8 tracking-[-0.01em]">Creator che già usano ProofPress.</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { quote: "Avevo una newsletter su AI e startup, ma non riuscivo a tenere il ritmo. Con ProofPress pubblico ogni giorno. La qualità è costante e i lettori se ne accorgono.", author: "Founder, newsletter AI", location: "Milano" },
            { quote: "Sono un analista finanziario. Pubblicavo un report a settimana. Ora ne escono tre al giorno sul mio sito — e io ne scrivo uno a settimana di mio pugno. Gli altri li curano gli agenti con il mio tono.", author: "Analista indipendente", location: "Zurigo" },
            { quote: "Ho attivato Radio sul mio canale. I miei lettori adesso mi ascoltano anche in macchina. Le aperture della newsletter sono salite del 35% da quando aggiungo il link al podcast.", author: "Creator, newsletter venture capital", location: "Londra" },
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
        <h2 className="text-[32px] md:text-[42px] font-black mb-4 tracking-[-0.02em]">La tua testata può esistere domani. Non tra sei mesi.</h2>
        <p className="text-[16px] text-[#1a1a1a]/55 mb-8 max-w-xl mx-auto">Guarda la piattaforma in azione. Non è un video — è la demo live, con dati reali.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <Link href={PREVENTIVO_URL}>
            <Button className="bg-[#c0392b] hover:bg-[#a93226] text-white font-bold px-10 py-3 text-[15px]">
              Richiedi preventivo gratuito <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="border-[#1a1a1a]/20 font-bold px-10 py-3 text-[15px]">
              Guarda la demo live
            </Button>
          </a>
        </div>
        <p className="text-[12px] text-[#1a1a1a]/35 tracking-[0.1em] uppercase">Setup in pochi giorni · Gestibile da 1 persona · Disdici quando vuoi</p>

        {/* Link alle altre pagine */}
        <div className="mt-10 pt-8 border-t border-[#1a1a1a]/8 flex flex-col sm:flex-row gap-4 justify-center text-[13px]">
          <Link href="/offerta/editori" className="text-[#c0392b] font-semibold hover:underline">
            Sei un editore? → Offerta Testate
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
          source="creator"
          title="Inizia oggi — parla con noi"
          subtitle="Compila il form e ti contatteremo entro 24 ore con tutti i dettagli sull'offerta Creator. Nessun impegno."
        />
      </section>
    </div>
  );
}
