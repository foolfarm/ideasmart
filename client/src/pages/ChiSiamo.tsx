/*
 * /chi-siamo — Offerta ProofPress (aggiornata con demo live)
 * Hero → Come funziona → Piani & Pricing → Tabella comparativa →
 * Demo live → Social proof → CTA finale
 */
import SEOHead from "@/components/SEOHead";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const ORANGE = "#ff5500";
const DEMO_URL = "https://ideasmart.technology";
const CONTACT_HREF = "mailto:info@proofpress.ai";

function Divider() {
  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8">
      <div className="border-t border-[#0a0a0a]/8" />
    </div>
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

function Section({ children, bg = "transparent", id }: {
  children: React.ReactNode; bg?: string; id?: string;
}) {
  return (
    <section id={id} className="py-20 md:py-28" style={{ background: bg }}>
      <div className="max-w-5xl mx-auto px-5 md:px-8">{children}</div>
    </section>
  );
}

function Check() {
  return <span style={{ color: "#16a34a" }} className="font-bold">✓</span>;
}

function PlanCard({
  icon, name, price, setup, tagline, badge, ideal, features, altRevShare, ctaText, ctaHref, highlight = false,
}: {
  icon: string; name: string; price: string; setup?: string; tagline: string;
  badge?: string; ideal: string; features: string[]; altRevShare?: string;
  ctaText: string; ctaHref: string; highlight?: boolean;
}) {
  return (
    <div
      className="flex flex-col border p-7 relative"
      style={{
        borderColor: highlight ? ORANGE : "rgba(10,10,10,0.1)",
        background: highlight ? "#fff8f5" : "#ffffff",
      }}
    >
      {badge && (
        <div
          className="absolute -top-3 left-6 text-[10px] font-bold uppercase tracking-widest px-3 py-1 text-white"
          style={{ background: ORANGE, fontFamily: FONT }}
        >
          {badge}
        </div>
      )}
      <div className="text-2xl mb-3">{icon}</div>
      <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: ORANGE, fontFamily: FONT }}>{name}</div>
      <div className="text-3xl font-black mb-1 text-[#0a0a0a]" style={{ fontFamily: FONT }}>{price}</div>
      {setup && <div className="text-xs text-[#0a0a0a]/45 mb-4">Setup: {setup} una tantum</div>}
      <p className="text-sm font-semibold text-[#0a0a0a] mb-2 leading-snug">{tagline}</p>
      <p className="text-xs text-[#0a0a0a]/50 mb-5">Ideale per: {ideal}</p>
      <ul className="space-y-2 mb-6 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-[#0a0a0a]/70">
            <Check />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      {altRevShare && (
        <div className="text-xs text-[#0a0a0a]/45 italic mb-5 border-t border-[#0a0a0a]/8 pt-4">
          Alternativa: {altRevShare}
        </div>
      )}
      <a
        href={ctaHref}
        target={ctaHref.startsWith("http") ? "_blank" : undefined}
        rel={ctaHref.startsWith("http") ? "noopener noreferrer" : undefined}
        className="block text-center py-3 text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
        style={{
          background: highlight ? ORANGE : "#0a0a0a",
          color: "#ffffff",
          fontFamily: FONT,
        }}
      >
        {ctaText}
      </a>
    </div>
  );
}

export default function ChiSiamo() {
  return (
    <div className="flex min-h-screen">
      
      <div className="flex-1 min-w-0">
        <SEOHead
          title="Offerta ProofPress — La tua redazione AI pronta in giorni"
          description="12 agenti giornalisti scrivono, verificano e pubblicano per te. Ogni notizia certificata con ProofPress Verify. Piani da €690/mese. Demo live disponibile subito."
          canonical="https://proofpress.ai/chi-siamo"
          ogSiteName="Proof Press"
        />

        <div className="min-h-screen" style={{ background: "#ffffff", color: "#0a0a0a", fontFamily: FONT }}>
          <SharedPageHeader />
          {/* ── HERO ── */}
          <section className="pt-24 pb-20 md:pt-32 md:pb-28" style={{ background: "#ffffff" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              <div className="mb-6">
                <span
                  className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] px-3 py-1 border"
                  style={{ color: ORANGE, borderColor: `${ORANGE}44`, background: `${ORANGE}0d`, fontFamily: FONT }}
                >
                  PIATTAFORMA DI GIORNALISMO AGENTICO
                </span>
              </div>

              <div className="max-w-3xl mb-10">
                <h1
                  className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-[#0a0a0a] mb-6"
                  style={{ fontFamily: FONT }}
                >
                  La tua redazione AI.<br />
                  <span style={{ color: ORANGE }}>Pronta in giorni,</span><br />
                  non in mesi.
                </h1>
                <p className="text-lg md:text-xl leading-relaxed text-[#0a0a0a]/65 max-w-2xl">
                  Tu scegli di cosa parlare. 12 agenti giornalisti scrivono, verificano e pubblicano per te. Ogni notizia certificata con ProofPress Verify. Funziona anche se sei solo.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 py-8 border-t border-b border-[#0a0a0a]/8">
                {[
                  { val: "4.000+", label: "fonti monitorate 24/7" },
                  { val: "12", label: "agenti giornalisti" },
                  { val: "100%", label: "notizie certificate" },
                  { val: "100k+", label: "lettori/mese su ProofPress" },
                ].map(({ val, label }) => (
                  <div key={val}>
                    <div className="text-3xl md:text-4xl font-black mb-1" style={{ color: ORANGE, fontFamily: FONT }}>{val}</div>
                    <div className="text-xs text-[#0a0a0a]/50 uppercase tracking-wide leading-snug">{label}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={DEMO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-80"
                  style={{ background: ORANGE, fontFamily: FONT }}
                >
                  Guarda la demo live →
                </a>
                <a
                  href={CONTACT_HREF}
                  className="inline-block px-8 py-4 text-sm font-bold uppercase tracking-widest border transition-colors hover:bg-[#0a0a0a]/5"
                  style={{ borderColor: "#0a0a0a", color: "#0a0a0a", fontFamily: FONT }}
                >
                  Scrivici
                </a>
              </div>
            </div>
          </section>

          <Divider />

          {/* ── COME FUNZIONA ── */}
          <Section bg="#f8f8f6" id="come-funziona">
            <Label>Come funziona</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-16" style={{ fontFamily: FONT }}>
              Tre passi. Poi la redazione<br />lavora da sola.
            </h2>

            <div className="space-y-12">
              {[
                {
                  n: "01",
                  title: "Scegli il piano",
                  text: "Decidi quanti agenti ti servono, su quali verticali vuoi pubblicare e con che tono. Freelance o media company, c'è un taglio per te.",
                },
                {
                  n: "02",
                  title: "Configura la linea editoriale",
                  text: "Definisci le fonti, il posizionamento, lo stile. Gli agenti imparano a scrivere come vuoi tu. In pochi giorni sei live.",
                },
                {
                  n: "03",
                  title: "Pubblica in automatico, ogni giorno",
                  text: "La redazione monitora, verifica, scrive e distribuisce. Tu mantieni il controllo strategico. Il resto è automatico — 24 ore su 24.",
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

            <div className="mt-12 pt-8 border-t border-[#0a0a0a]/8">
              <p className="text-sm text-[#0a0a0a]/50 mb-3">Non ci credi?</p>
              <a
                href={DEMO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-70"
                style={{ color: ORANGE, fontFamily: FONT }}
              >
                Guarda la piattaforma in azione →
              </a>
            </div>
          </Section>

          <Divider />

          {/* ── PIANI & PRICING ── */}
          <Section id="piani">
            <Label>Piani e pricing</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-4" style={{ fontFamily: FONT }}>
              Scegli la tua redazione.
            </h2>
            <p className="text-base text-[#0a0a0a]/55 mb-14 max-w-2xl">
              Ogni piano include ProofPress Verify, la tecnologia che certifica ogni notizia con hash crittografico. Nessun costo nascosto. Disdici quando vuoi.
            </p>

            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
              <PlanCard
                icon="✍️"
                name="SOLO"
                price="€690/mese"
                setup="€3.500"
                tagline="Per chi vuole la sua voce. Una testata, un verticale, zero compromessi."
                ideal="giornalisti indipendenti, analisti, newsletter creator"
                features={[
                  "4 Agent Giornalisti + 4 agenti di supporto",
                  "1 canale tematico",
                  "Fino a 15 articoli/giorno",
                  "Newsletter settimanale inclusa",
                  "ProofPress Verify su ogni articolo",
                  "Gestibile da 1 persona",
                  "Supporto via email",
                ]}
                ctaText="Guarda la demo →"
                ctaHref={DEMO_URL}
              />
              <PlanCard
                icon="📰"
                name="REDAZIONE"
                price="€1.490/mese"
                setup="€7.000"
                tagline="Per chi vuole una testata vera. Più canali, più distribuzione, più crescita."
                badge="Piano più scelto"
                ideal="editori digitali, media startup, vertical media"
                features={[
                  "8 Agent Giornalisti + 4 agenti di supporto",
                  "Fino a 6 canali tematici",
                  "Newsletter + paywall integrato",
                  "Post social automatici (LinkedIn, X)",
                  "ProofPress Verify + badge visibile",
                  "Dashboard editoriale",
                  "Supporto prioritario",
                ]}
                altRevShare="€3.500 setup + 25% dei ricavi (min. €500/mese)"
                ctaText="Guarda la demo →"
                ctaHref={DEMO_URL}
                highlight
              />
              <PlanCard
                icon="🏛️"
                name="EDITORE"
                price="€2.490/mese"
                setup="€12.000"
                tagline="Per chi scala. Canali illimitati, analytics avanzato, account manager dedicato."
                ideal="testate online, media company, gruppi editoriali"
                features={[
                  "12 Agent Giornalisti + 4 agenti di supporto",
                  "Canali illimitati",
                  "Newsletter + paywall + abbonamenti",
                  "Analytics avanzato + report mensile",
                  "Account manager dedicato",
                  "Accesso prioritario a nuove feature",
                  "Onboarding assistito",
                ]}
                altRevShare="€5.000 setup + 20% dei ricavi (min. €900/mese)"
                ctaText="Parla con noi →"
                ctaHref={CONTACT_HREF}
              />
              <PlanCard
                icon="⚫"
                name="ENTERPRISE"
                price="Su misura"
                tagline="Per chi ha esigenze specifiche, vuole una white-label o deve integrare un CMS esistente."
                ideal="gruppi editoriali, corporate, brand media"
                features={[
                  "Configurazione e agenti custom",
                  "Integrazione con CMS/piattaforme esistenti",
                  "API dedicata",
                  "SLA garantito",
                  "White-label disponibile",
                  "Fatturazione personalizzata",
                ]}
                ctaText="Contattaci →"
                ctaHref={CONTACT_HREF}
              />
            </div>
          </Section>

          <Divider />

          {/* ── TABELLA COMPARATIVA ── */}
          <Section bg="#f8f8f6" id="confronto">
            <Label>Confronto piani</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-10" style={{ fontFamily: FONT }}>
              Confronta i piani nel dettaglio.
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse" style={{ fontFamily: FONT }}>
                <thead>
                  <tr className="border-b-2 border-[#0a0a0a]">
                    <th className="text-left py-3 pr-6 font-black text-[#0a0a0a] text-xs uppercase tracking-wide">Feature</th>
                    {["SOLO", "REDAZIONE", "EDITORE", "ENTERPRISE"].map((p) => (
                      <th
                        key={p}
                        className="text-center py-3 px-4 font-black text-xs uppercase tracking-wide"
                        style={{ color: p === "REDAZIONE" ? ORANGE : "#0a0a0a" }}
                      >
                        {p}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0a0a0a]/6">
                  {[
                    ["Agent Giornalisti", "4", "8", "12", "Custom"],
                    ["Agenti di supporto", "4", "4", "4", "Custom"],
                    ["Canali tematici", "1", "Fino a 6", "Illimitati", "Illimitati"],
                    ["Articoli/giorno", "~15", "~40", "Illimitati", "Illimitati"],
                    ["ProofPress Verify", "✓", "✓", "✓", "✓"],
                    ["Newsletter", "Settimanale", "✓ personalizzabile", "✓ multi-lista", "✓"],
                    ["Paywall", "—", "✓", "✓", "✓"],
                    ["Post social automatici", "—", "✓", "✓", "✓"],
                    ["Dashboard analytics", "Base", "✓", "Avanzato", "Custom"],
                    ["Account manager", "—", "—", "✓", "✓"],
                    ["Onboarding assistito", "Standard", "Standard", "Dedicato", "Dedicato"],
                    ["Opzione revenue share", "—", "✓", "✓", "Negoziabile"],
                    ["API / CMS integration", "—", "—", "—", "✓"],
                    ["White-label", "—", "—", "—", "✓"],
                  ].map(([feature, ...vals]) => (
                    <tr key={feature} className="hover:bg-[#0a0a0a]/2 transition-colors">
                      <td className="py-3 pr-6 text-[#0a0a0a]/70 font-medium">{feature}</td>
                      {vals.map((v, i) => (
                        <td
                          key={i}
                          className="py-3 px-4 text-center"
                          style={{
                            color: v === "✓" ? "#16a34a" : v === "—" ? "rgba(10,10,10,0.2)" : "rgba(10,10,10,0.65)",
                            fontWeight: v === "✓" ? "bold" : undefined,
                          }}
                        >
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Divider />

          {/* ── DEMO LIVE ── */}
          <section className="py-20 md:py-28" style={{ background: "#0a0a0a" }} id="demo">
            <div className="max-w-5xl mx-auto px-5 md:px-8 text-center">
              <Label light>Demo live</Label>
              <h2
                className="text-3xl md:text-5xl font-black leading-tight mb-6 text-white"
                style={{ fontFamily: FONT }}
              >
                Vedi la piattaforma in azione.<br />
                <span style={{ color: ORANGE }}>Adesso.</span>
              </h2>
              <p className="text-base text-white/55 mb-10 max-w-2xl mx-auto">
                ProofPress è già operativa. Non ti chiediamo di immaginare come funziona — te lo facciamo vedere. La demo è live, aperta, senza registrazione. Entra e guarda una redazione agentica al lavoro: notizie raccolte, verificate, certificate e pubblicate in tempo reale.
              </p>
              <a
                href={DEMO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-12 py-5 text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-80 mb-6"
                style={{ background: ORANGE, fontFamily: FONT }}
              >
                Entra nella demo live →
              </a>
              <div className="flex flex-wrap justify-center gap-6 text-xs text-white/30 uppercase tracking-widest">
                <span>Nessuna registrazione richiesta</span>
                <span>·</span>
                <span>Accesso immediato</span>
                <span>·</span>
                <span>Dati reali, non simulati</span>
              </div>
            </div>
          </section>

          <Divider />

          {/* ── SOCIAL PROOF ── */}
          <Section id="social-proof">
            <Label>Già in produzione</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-6" style={{ fontFamily: FONT }}>
              Già in produzione. Ogni giorno.
            </h2>
            <p className="text-base text-[#0a0a0a]/65 mb-14 max-w-2xl">
              ProofPress stessa è la prova: 3 canali tematici, 100.000+ lettori/mese, 6.000+ iscritti newsletter, 20+ articoli al giorno. Tutto gestito dalla piattaforma con un team editoriale di 1 persona.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  quote: "Avevo una newsletter su AI e startup, ma non riuscivo a tenere il ritmo. Con ProofPress pubblico ogni giorno. La qualità è costante e i lettori se ne accorgono.",
                  author: "Founder, media startup AI",
                  location: "Milano",
                },
                {
                  quote: "Ho lanciato una testata verticale sul venture capital europeo in due settimane. Oggi genera traffico organico e lead qualificati. Con 1 persona.",
                  author: "Investor Relations Manager",
                  location: "Londra",
                },
                {
                  quote: "La certificazione delle notizie ha fatto la differenza. I miei lettori sono professionisti esigenti: sapere che ogni contenuto è verificato cambia tutto.",
                  author: "Direttore editoriale, testata B2B",
                  location: "Roma",
                },
              ].map(({ quote, author, location }) => (
                <div key={author} className="p-6 border-l-2" style={{ borderColor: ORANGE, background: "#f8f8f6" }}>
                  <p className="text-sm leading-relaxed text-[#0a0a0a]/70 mb-5 italic">"{quote}"</p>
                  <div className="text-xs font-bold text-[#0a0a0a]">{author}</div>
                  <div className="text-xs text-[#0a0a0a]/40">{location}</div>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ── SEZIONE ISTITUZIONALE AxiomX LLC ── */}
          <Section bg="#f8f8f6">
            <div className="max-w-3xl">
              <Label>Chi c'è dietro ProofPress</Label>
              <h2
                className="text-2xl md:text-3xl font-black leading-tight mb-6 text-[#0a0a0a]"
                style={{ fontFamily: FONT }}
              >
                Un progetto <span style={{ color: ORANGE }}>AxiomX LLC</span>
              </h2>
              <p className="text-base leading-relaxed text-[#0a0a0a]/65 mb-4">
                ProofPress è un progetto di <strong>AxiomX LLC</strong>, società registrata negli Stati Uniti d'America.
                AxiomX opera nel settore dell'intelligenza artificiale applicata ai media, con focus su piattaforme
                di giornalismo agentico, certificazione dei contenuti e distribuzione editoriale scalabile.
              </p>
              <p className="text-base leading-relaxed text-[#0a0a0a]/65 mb-6">
                La piattaforma ProofPress è stata concepita, progettata e sviluppata interamente dal team AxiomX,
                con l'obiettivo di portare standard di affidabilità e trasparenza nell'informazione digitale
                attraverso tecnologie AI proprietarie.
              </p>
              <div className="flex flex-wrap gap-8 pt-4 border-t border-[#0a0a0a]/8">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-[#0a0a0a]/40 mb-1">Sede legale</div>
                  <div className="text-sm font-semibold text-[#0a0a0a]">AxiomX LLC · United States of America</div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-[#0a0a0a]/40 mb-1">Contatti</div>
                  <div className="text-sm font-semibold text-[#0a0a0a]">
                    <a href="mailto:info@proofpress.ai" style={{ color: ORANGE }}>info@proofpress.ai</a>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-[#0a0a0a]/40 mb-1">Piattaforma</div>
                  <div className="text-sm font-semibold text-[#0a0a0a]">ProofPress.AI</div>
                </div>
              </div>
            </div>
          </Section>

          <Divider />

          {/* ── CTA FINALE ── */}
          <section className="py-24 md:py-32" style={{ background: "#0a0a0a" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8 text-center">
              <Label light>Inizia adesso</Label>
              <h2
                className="text-3xl md:text-5xl font-black leading-tight mb-6 text-white"
                style={{ fontFamily: FONT }}
              >
                Il giornalismo sta cambiando.<br />
                <span style={{ color: ORANGE }}>Tu puoi guidarlo.</span>
              </h2>
              <p className="text-base text-white/55 mb-12 max-w-xl mx-auto">
                Hai visto la demo. Hai visto i piani. Ora scegli: continuare a fare giornalismo come nel 2015 o costruire una redazione che lavora 24/7 con informazione certificata.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <a
                  href={DEMO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-10 py-4 text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-80"
                  style={{ background: ORANGE, fontFamily: FONT }}
                >
                  Guarda la demo live →
                </a>
                <a
                  href={CONTACT_HREF}
                  className="inline-block px-10 py-4 text-sm font-bold uppercase tracking-widest border text-white transition-colors hover:bg-white/10"
                  style={{ borderColor: "rgba(255,255,255,0.2)", fontFamily: FONT }}
                >
                  Scrivici a info@proofpress.ai
                </a>
              </div>
              <div className="flex flex-wrap justify-center gap-6 text-xs text-white/30 uppercase tracking-widest">
                <span>Setup in pochi giorni</span>
                <span>·</span>
                <span>Disdici quando vuoi</span>
                <span>·</span>
                <span>Nessun costo nascosto</span>
              </div>
            </div>
          </section>

          <SharedPageFooter />
        </div>
      </div>
    </div>
  );
}
