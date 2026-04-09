/**
 * Pagina /chi-siamo-story — La storia di Ideasmart e Adrian Lenice
 * Layout identico a /chi-siamo: LeftSidebar + SharedPageHeader + BreakingNewsTicker + SharedPageFooter
 */
import SEOHead from "@/components/SEOHead";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import LeftSidebar from "@/components/LeftSidebar";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/* ── Sezione wrapper identica a ChiSiamo ── */
function Section({ children, bg = "#ffffff", id }: { children: React.ReactNode; bg?: string; id?: string }) {
  return (
    <section id={id} className="py-20 md:py-28" style={{ background: bg }}>
      <div className="max-w-5xl mx-auto px-5 md:px-8">{children}</div>
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/40 mb-4"
      style={{ fontFamily: FONT }}
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

export default function ChiSiamoStory() {
  return (
    <div className="flex min-h-screen">
      <LeftSidebar />
      <div className="flex-1 min-w-0">
        <SEOHead
          title="Chi siamo — Proof Press by Ideasmart"
          description="La storia di Ideasmart e di Adrian Lenice. Nati per fare informazione che non può essere falsa. Il primo giornale agentico con informazione certificata."
          canonical="https://proofpress.ai/chi-siamo-story"
          ogSiteName="Proof Press"
        />

        <div className="min-h-screen" style={{ background: "#ffffff", color: "#0a0a0a", fontFamily: FONT }}>
          <SharedPageHeader />
          <BreakingNewsTicker />

          {/* ═══════════════════════════════════════════════════════
              HERO
          ═══════════════════════════════════════════════════════ */}
          <section className="pt-24 pb-20 md:pt-32 md:pb-28" style={{ background: "#ffffff" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              <div className="max-w-3xl">
                <Label>Chi siamo</Label>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-[#0a0a0a]">
                  Nati per fare<br />
                  informazione<br />
                  <span className="text-[#0a0a0a]/25">che non può essere falsa.</span>
                </h1>
                <p className="mt-6 text-xl md:text-2xl font-medium leading-relaxed text-[#0a0a0a]/60 max-w-2xl">
                  Nel mondo dell'AI, chi ha accesso all'informazione giusta vince. Chi si basa su notizie false o superficiali perde — e spesso non lo sa nemmeno.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <a
                    href="/chi-siamo"
                    className="px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] text-white transition-all duration-200 hover:opacity-90 inline-block text-center"
                    style={{ background: "#0a0a0a", borderRadius: "0" }}
                  >
                    Scopri l'offerta →
                  </a>
                  <a
                    href="mailto:info@proofpress.ai"
                    className="px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] text-[#0a0a0a] border-2 border-[#0a0a0a] transition-all duration-200 hover:bg-[#0a0a0a] hover:text-white inline-block text-center"
                    style={{ borderRadius: "0" }}
                  >
                    Scrivici
                  </a>
                </div>
              </div>

              {/* Stats bar */}
              <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-b border-[#0a0a0a]/10">
                {[
                  { val: "2022", lab: "Anno di fondazione" },
                  { val: "100k+", lab: "Lettori mensili" },
                  { val: "6.000+", lab: "Iscritti newsletter" },
                  { val: "100%", lab: "Notizie certificate" },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="py-6 text-center"
                    style={{ borderRight: i < 3 ? "1px solid rgba(10,10,10,0.1)" : "none" }}
                  >
                    <div className="text-2xl md:text-3xl font-black text-[#0a0a0a] tracking-tight">{s.val}</div>
                    <div className="mt-1 text-xs text-[#0a0a0a]/40 uppercase tracking-widest">{s.lab}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              LA STORIA
          ═══════════════════════════════════════════════════════ */}
          <Section bg="#ffffff">
            <div className="max-w-3xl">
              <Label>La storia</Label>
              <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight text-[#0a0a0a] mb-10">
                Da una frustrazione,<br />un'idea.
              </h2>
              <div className="space-y-6 text-lg leading-relaxed text-[#0a0a0a]/65">
                <p>
                  Era il 2022. Adrian Lenice, dopo anni tra startup, fondi di venture capital e grandi 
                  aziende tecnologiche europee, si trovava ogni mattina a fare la stessa cosa: 
                  leggere decine di newsletter, scorrere feed di LinkedIn, aprire articoli su TechCrunch, 
                  Sifted, Il Sole 24 Ore — cercando di capire cosa stava davvero succedendo nell'AI.
                </p>
                <p>
                  Il problema non era la mancanza di informazione. Era l'eccesso. E soprattutto, 
                  era la qualità: notizie non verificate, titoli sensazionalistici, analisi superficiali 
                  scritte in fretta per inseguire i trend del momento.{" "}
                  <strong className="text-[#0a0a0a] font-bold">Rumore, non segnale.</strong>
                </p>
                <p>
                  Da quella frustrazione nasce Ideasmart. Non come un altro media digitale, 
                  ma come un sistema editoriale completamente nuovo: una redazione agentica, 
                  guidata dall'intelligenza artificiale, capace di analizzare migliaia di fonti ogni giorno, 
                  selezionare le notizie rilevanti e —{" "}
                  <strong className="text-[#0a0a0a] font-bold">soprattutto — certificarle</strong>{" "}
                  prima di pubblicarle.
                </p>
                <p>
                  <strong className="text-[#0a0a0a] font-bold">Aprile 2026: Ideasmart diventa ProofPress.</strong>{" "}
                  Un nuovo nome, un modello ancora più ambizioso. ProofPress non è solo una testata: è una piattaforma editoriale agentica che integra{" "}
                  <strong className="text-[#0a0a0a] font-bold">ProofPress Verify</strong>, la tecnologia proprietaria capace di analizzare e certificare le informazioni in tempo reale, 
                  affiancata da una piattaforma redazionale che consente a chiunque — aziende, editori, professionisti — di costruirsi un vero e proprio giornale agentico: 
                  una redazione AI che lavora 24/7 per te.
                </p>
              </div>
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              FONDATORE
          ═══════════════════════════════════════════════════════ */}
          <Section bg="#f5f0e8">
            <div className="max-w-3xl">
              <Label>Il fondatore</Label>
              <div className="flex items-start gap-8 mb-10">
                {/* Avatar */}
                <div
                  className="flex-shrink-0 w-20 h-20 rounded-full flex items-center justify-center text-white font-black text-2xl"
                  style={{
                    background: "linear-gradient(135deg, #0a0a0a 0%, #444 100%)",
                    fontFamily: FONT,
                  }}
                >
                  AL
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-[#0a0a0a] tracking-tight">Adrian Lenice</h3>
                  <p className="text-sm text-[#0a0a0a]/45 mt-1 italic">Founder & CEO, Ideasmart · Proof Press</p>
                </div>
              </div>
              <div className="space-y-6 text-lg leading-relaxed text-[#0a0a0a]/65">
                <p>
                  Adrian ha trascorso oltre un decennio al crocevia tra tecnologia, media e finanza. 
                  Ha lavorato con fondi di venture capital europei, acceleratori di startup e 
                  grandi aziende tecnologiche, sviluppando una visione chiara su come l'AI stia 
                  ridisegnando ogni settore dell'economia.
                </p>
                <p>
                  Prima di fondare Ideasmart, ha contribuito a costruire e scalare prodotti digitali 
                  in Italia e in Europa, accumulando una prospettiva rara: quella di chi sa leggere 
                  i mercati, capire la tecnologia e comunicare entrambi in modo accessibile.
                </p>
                <p>
                  La sua convinzione è che{" "}
                  <strong className="text-[#0a0a0a] font-bold">l'informazione di qualità 
                  sia un vantaggio competitivo</strong>{" "}
                  — e che chiunque, azienda o professionista, 
                  meriti di avere accesso a notizie certificate, non a rumore digitale.
                </p>
              </div>

              {/* Citazione */}
              <blockquote className="mt-12 border-l-4 border-[#0a0a0a] pl-6">
                <p className="text-xl md:text-2xl font-bold text-[#0a0a0a] leading-snug italic">
                  "Volevamo costruire il media che avremmo voluto leggere noi stessi. 
                  Uno che non ci facesse perdere tempo, non ci ingannasse, 
                  e ci desse ogni mattina le informazioni per prendere decisioni migliori."
                </p>
                <cite className="block mt-4 text-sm text-[#0a0a0a]/45 not-italic font-semibold">
                  — Adrian Lenice, Fondatore di Ideasmart
                </cite>
              </blockquote>
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              PROOF PRESS
          ═══════════════════════════════════════════════════════ */}
          <Section bg="#ffffff">
            <div className="max-w-3xl">
              <Label>Il progetto</Label>
              <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight text-[#0a0a0a] mb-10">
                Nasce Proof Press:<br />
                il primo giornale agentico<br />
                <span className="text-[#0a0a0a]/25">con informazione certificata.</span>
              </h2>
              <div className="space-y-6 text-lg leading-relaxed text-[#0a0a0a]/65">
                <p>
                  Nel 2024, Ideasmart lancia Proof Press: una piattaforma editoriale completamente nuova, 
                  costruita attorno a un sistema di agenti AI che lavorano in parallelo — 
                  cercano notizie, le analizzano, le confrontano con fonti multiple, 
                  le verificano e le pubblicano con un certificato di affidabilità.
                </p>
                <p>
                  Ogni articolo pubblicato su Proof Press porta un{" "}
                  <strong className="text-[#0a0a0a] font-bold">ProofPress Verify badge</strong>: 
                  un hash crittografico che sigilla contenuto, fonti e criteri di analisi, 
                  rendendo ogni notizia tracciabile e verificabile nel tempo. 
                  Come una notarizzazione digitale del giornalismo.
                </p>
                <p>
                  Il risultato: oltre{" "}
                  <strong className="text-[#0a0a0a] font-bold">100.000 lettori al mese</strong>, 
                  una newsletter trisettimanale con più di{" "}
                  <strong className="text-[#0a0a0a] font-bold">6.000 iscritti qualificati</strong>{" "}
                  tra manager, investitori e founder, e una tecnologia che oggi offriamo 
                  anche ad altri editori e aziende che vogliono costruire la propria redazione agentica.
                </p>
              </div>
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              VALORI
          ═══════════════════════════════════════════════════════ */}
          <Section bg="#f5f0e8">
            <Label>I nostri valori</Label>
            <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight text-[#0a0a0a] mb-12">
              Quello in cui crediamo.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#0a0a0a]/10">
              {[
                {
                  icon: "🔍",
                  title: "Verità prima di tutto",
                  desc: "Ogni notizia che pubblichiamo è verificata da più fonti indipendenti. Non pubblichiamo mai qualcosa che non possiamo certificare. Preferiamo non uscire piuttosto che uscire con qualcosa di dubbio.",
                },
                {
                  icon: "⚡",
                  title: "Velocità senza sacrifici",
                  desc: "L'AI ci permette di essere veloci quanto i migliori media mondiali, senza abbassare gli standard. Aggiorniamo le notizie in tempo reale, ma ogni articolo passa attraverso il nostro sistema di verifica.",
                },
                {
                  icon: "🎯",
                  title: "Rilevanza, non volume",
                  desc: "Non pubblichiamo tutto. Selezioniamo le notizie che contano davvero per chi prende decisioni nel mondo dell'AI e del business. Meno rumore, più segnale.",
                },
                {
                  icon: "🔓",
                  title: "Trasparenza radicale",
                  desc: "Ogni articolo mostra le fonti, il metodo di verifica e il badge ProofPress Verify. Il lettore può sempre controllare da dove viene l'informazione e come è stata verificata.",
                },
              ].map((v) => (
                <div key={v.title} className="bg-white p-8 md:p-10">
                  <div className="text-3xl mb-4">{v.icon}</div>
                  <h3 className="text-lg font-black text-[#0a0a0a] mb-3">{v.title}</h3>
                  <p className="text-sm leading-relaxed text-[#0a0a0a]/55">{v.desc}</p>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              CTA FINALE
          ═══════════════════════════════════════════════════════ */}
          <Section bg="#0a0a0a">
            <div className="max-w-3xl text-center mx-auto">
              <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight text-white mb-6">
                Vuoi costruire il tuo<br />giornale agentico?
              </h2>
              <p className="text-lg text-white/55 leading-relaxed mb-10 max-w-xl mx-auto">
                Offriamo la nostra tecnologia ad editori, aziende e brand che vogliono 
                creare una redazione AI autonoma con informazione certificata.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/chi-siamo"
                  className="px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] text-[#0a0a0a] bg-white transition-all duration-200 hover:opacity-90 inline-block text-center"
                  style={{ borderRadius: "0" }}
                >
                  Scopri l'offerta →
                </a>
                <a
                  href="mailto:info@proofpress.ai"
                  className="px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] text-white border-2 border-white/30 transition-all duration-200 hover:border-white inline-block text-center"
                  style={{ borderRadius: "0" }}
                >
                  Scrivici
                </a>
              </div>
            </div>
          </Section>

          <SharedPageFooter />
        </div>
      </div>
    </div>
  );
}
