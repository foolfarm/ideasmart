/**
 * IDEASMART — Privacy Policy & Disclaimer GDPR
 * Pagina completa conforme al Regolamento UE 2016/679 (GDPR)
 */
import { useLocation } from "wouter";

const LAST_UPDATE = "15 marzo 2026";
const OWNER = "Proof Press — AI for Business";
const OWNER_EMAIL = "info@proofpress.ai";
const SITE_URL = "https://ideasmart.biz";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-10">
      <h2
        className="text-xl font-black mb-4 pb-2 border-b"
        style={{
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
          color: "#1a1a1a",
          borderColor: "#e2e5ed",
        }}
      >
        {title}
      </h2>
      <div
        className="text-sm leading-relaxed space-y-3"
        style={{ color: "#4a5568", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
      >
        {children}
      </div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>;
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span style={{ color: "#1a1a1a", flexShrink: 0 }}>◆</span>
      <span>{children}</span>
    </li>
  );
}

export default function Privacy() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen" style={{ background: "#f0f4f8" }}>

      {/* Header */}
      <div className="border-b" style={{ background: "#ffffff", borderColor: "#e2e5ed" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="text-sm font-bold transition-colors hover:opacity-70"
            style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
          >
            ← Proof Press
          </button>
          <span className="text-xs" style={{ color: "#9ca3af" }}>
            Aggiornato il {LAST_UPDATE}
          </span>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: "#1a1a1a" }} className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
            style={{ background: "rgba(0,180,160,0.15)", color: "#1a1a1a" }}
          >
            Documento legale
          </div>
          <h1
            className="text-4xl font-black mb-3"
            style={{ color: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
          >
            Privacy Policy
            <span style={{ color: "#1a1a1a" }}> & Disclaimer</span>
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
            Informativa ai sensi del Regolamento UE 2016/679 (GDPR) e del D.Lgs. 196/2003 come modificato dal D.Lgs. 101/2018
          </p>
        </div>
      </div>

      {/* Indice rapido */}
      <div className="border-b" style={{ background: "#ffffff", borderColor: "#e2e5ed" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-3 text-xs" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
            {[
              ["#titolare", "Titolare"],
              ["#dati", "Dati raccolti"],
              ["#finalita", "Finalità"],
              ["#newsletter", "Newsletter"],
              ["#cookie", "Cookie"],
              ["#diritti", "Diritti"],
              ["#disclaimer", "Disclaimer"],
              ["#contatti", "Contatti"]
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="px-3 py-1 rounded-full border transition-colors hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
                style={{ borderColor: "#e2e5ed", color: "#6b7280" }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Contenuto */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Card principale */}
        <div className="rounded-2xl border p-8 mb-6" style={{ background: "#ffffff", borderColor: "#e2e5ed" }}>

          <Section id="titolare" title="1. Titolare del Trattamento">
            <P>
              Il Titolare del trattamento dei dati personali raccolti tramite il sito web <strong>{SITE_URL}</strong> è:
            </P>
            <div
              className="rounded-xl p-4 border"
              style={{ background: "#f8fafc", borderColor: "#e2e5ed" }}
            >
              <p className="font-bold mb-1" style={{ color: "#1a1a1a" }}>{OWNER}</p>
              <p>Email: <a href={`mailto:${OWNER_EMAIL}`} style={{ color: "#1a1a1a" }}>{OWNER_EMAIL}</a></p>
              <p>Sito web: <a href={SITE_URL} style={{ color: "#1a1a1a" }}>{SITE_URL}</a></p>
            </div>
          </Section>

          <Section id="dati" title="2. Dati Personali Raccolti">
            <P>
              Il sito raccoglie le seguenti categorie di dati personali, esclusivamente con il consenso esplicito dell'utente o per legittimo interesse:
            </P>
            <ul className="space-y-2 ml-2">
              <Li><strong>Indirizzo email</strong> — fornito volontariamente per l'iscrizione alla newsletter o per richieste di contatto.</Li>
              <Li><strong>Nome</strong> — opzionale, fornito al momento dell'iscrizione alla newsletter.</Li>
              <Li><strong>Dati di navigazione</strong> — indirizzo IP, tipo di browser, sistema operativo, pagine visitate, raccolti automaticamente dai server per finalità di sicurezza e analisi statistica aggregata.</Li>
              <Li><strong>Dati di interazione email</strong> — apertura delle email newsletter, tramite pixel di tracciamento tecnico, per misurare l'efficacia delle comunicazioni.</Li>
              <Li><strong>Cookie</strong> — come descritto nella sezione dedicata.</Li>
            </ul>
            <P>
              Il sito <strong>non raccoglie</strong> dati sensibili (salute, orientamento politico/religioso, dati biometrici) né dati di minori di 16 anni.
            </P>
          </Section>

          <Section id="finalita" title="3. Finalità e Base Giuridica del Trattamento">
            <P>I dati personali sono trattati per le seguenti finalità:</P>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr style={{ background: "#f0f4f8" }}>
                    <th className="text-left p-3 font-bold" style={{ color: "#1a1a1a" }}>Finalità</th>
                    <th className="text-left p-3 font-bold" style={{ color: "#1a1a1a" }}>Base giuridica</th>
                    <th className="text-left p-3 font-bold" style={{ color: "#1a1a1a" }}>Conservazione</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Invio newsletter AI NEWS News", "Consenso esplicito (art. 6.1.a GDPR)", "Fino alla disiscrizione"],
                    ["Analisi aperture newsletter", "Legittimo interesse (art. 6.1.f GDPR)", "24 mesi"],
                    ["Sicurezza e prevenzione frodi", "Legittimo interesse (art. 6.1.f GDPR)", "12 mesi"],
                    ["Adempimenti legali e fiscali", "Obbligo legale (art. 6.1.c GDPR)", "10 anni"],
                    ["Statistiche aggregate anonime", "Legittimo interesse (art. 6.1.f GDPR)", "Indefinita (anonimizzati)"]
                  ].map(([fin, base, cons], i) => (
                    <tr key={i} className="border-t" style={{ borderColor: "#e2e5ed" }}>
                      <td className="p-3">{fin}</td>
                      <td className="p-3" style={{ color: "#6b7280" }}>{base}</td>
                      <td className="p-3" style={{ color: "#6b7280" }}>{cons}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="newsletter" title="4. Newsletter — Iscrizione e Disiscrizione">
            <P>
              L'iscrizione alla newsletter <strong>AI NEWS News by Proof Press</strong> è volontaria e richiede la fornitura dell'indirizzo email. Iscrivendosi, l'utente acconsente esplicitamente a ricevere comunicazioni periodiche contenenti notizie, analisi e reportage sull'intelligenza artificiale applicata al business.
            </P>
            <P>
              Ogni email contiene un link di disiscrizione immediata. La disiscrizione è gratuita, senza necessità di fornire motivazioni, e produce effetto entro 24 ore. In alternativa, è possibile richiedere la disiscrizione scrivendo a <a href={`mailto:${OWNER_EMAIL}`} style={{ color: "#1a1a1a" }}>{OWNER_EMAIL}</a>.
            </P>
            <P>
              Le email newsletter possono contenere un <strong>pixel di tracciamento</strong> (immagine 1×1 pixel) che ci permette di rilevare se e quando l'email è stata aperta. Questo dato è utilizzato esclusivamente per migliorare la qualità e la frequenza delle comunicazioni. È possibile disabilitare il caricamento automatico delle immagini nel proprio client email per evitare questo tracciamento.
            </P>
          </Section>

          <Section id="cookie" title="5. Cookie Policy">
            <P>
              Il sito utilizza cookie tecnici necessari al funzionamento e cookie di terze parti per l'analisi statistica. Di seguito la classificazione:
            </P>
            <ul className="space-y-2 ml-2">
              <Li>
                <strong>Cookie tecnici/di sessione</strong> — necessari per l'autenticazione e il corretto funzionamento del sito. Non richiedono consenso (art. 122 D.Lgs. 196/2003).
              </Li>
              <Li>
                <strong>Cookie analitici di terze parti</strong> — Google Analytics (anonimizzato) per statistiche aggregate di navigazione. Richiedono consenso.
              </Li>
              <Li>
                <strong>Cookie di profilazione</strong> — utilizzati per personalizzare i contenuti in base alle preferenze di navigazione. Richiedono consenso esplicito.
              </Li>
            </ul>
            <P>
              L'utente può gestire o revocare il consenso ai cookie in qualsiasi momento tramite le impostazioni del browser o il pannello preferenze cookie del sito.
            </P>
          </Section>

          <Section id="adsense" title="6. Personalizzazione dei Contenuti">
            <P>
              Il sito può utilizzare cookie di profilazione per personalizzare i contenuti editoriali in base alle preferenze di navigazione dell'utente. Questi cookie non vengono utilizzati per scopi pubblicitari commerciali di terze parti.
            </P>
            <P>
              L'utente può disabilitare i cookie di profilazione in qualsiasi momento tramite il pannello preferenze cookie del sito o le impostazioni del browser.
            </P>
          </Section>

          <Section id="diritti" title="7. Diritti dell'Interessato (GDPR)">
            <P>
              Ai sensi degli artt. 15-22 del Regolamento UE 2016/679, l'utente ha il diritto di:
            </P>
            <ul className="space-y-2 ml-2">
              <Li><strong>Accesso</strong> — ottenere conferma del trattamento e copia dei dati personali.</Li>
              <Li><strong>Rettifica</strong> — richiedere la correzione di dati inesatti o incompleti.</Li>
              <Li><strong>Cancellazione ("diritto all'oblio")</strong> — ottenere la cancellazione dei dati personali.</Li>
              <Li><strong>Limitazione</strong> — richiedere la limitazione del trattamento in determinati casi.</Li>
              <Li><strong>Portabilità</strong> — ricevere i dati in formato strutturato e leggibile da macchina.</Li>
              <Li><strong>Opposizione</strong> — opporsi al trattamento basato su legittimo interesse.</Li>
              <Li><strong>Revoca del consenso</strong> — revocare in qualsiasi momento il consenso prestato, senza pregiudicare la liceità del trattamento precedente.</Li>
            </ul>
            <P>
              Per esercitare i propri diritti, è possibile inviare una richiesta scritta a <a href={`mailto:${OWNER_EMAIL}`} style={{ color: "#1a1a1a" }}>{OWNER_EMAIL}</a>. Il Titolare risponderà entro 30 giorni. In caso di mancata risposta o risposta insoddisfacente, l'utente ha il diritto di proporre reclamo al <strong>Garante per la Protezione dei Dati Personali</strong> (<a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" style={{ color: "#1a1a1a" }}>garanteprivacy.it</a>).
            </P>
          </Section>

          <Section id="disclaimer" title="8. Disclaimer — Limitazione di Responsabilità">
            <P>
              <strong>Natura editoriale e informativa.</strong> I contenuti pubblicati su Proof Press — AI for Business (news, editoriali, reportage, analisi di mercato, profili di startup) hanno esclusivamente finalità informativa e giornalistica. Non costituiscono in alcun modo consulenza finanziaria, legale, fiscale, di investimento o professionale di qualsiasi natura.
            </P>
            <P>
              <strong>Accuratezza delle informazioni.</strong> Sebbene Proof Press si impegni a garantire l'accuratezza e l'aggiornamento dei contenuti, non si assume alcuna responsabilità per errori, omissioni, imprecisioni o informazioni non aggiornate. I contenuti generati con il supporto di intelligenza artificiale sono soggetti a revisione editoriale ma potrebbero contenere inesattezze.
            </P>
            <P>
              <strong>Link esterni.</strong> Il sito può contenere link a siti web di terze parti. Proof Press non è responsabile del contenuto, delle politiche sulla privacy o delle pratiche di tali siti. L'inserimento di un link non implica approvazione o endorsement del sito collegato.
            </P>
            <P>
              <strong>Contenuti generati dall'AI.</strong> Parte dei contenuti pubblicati su questo sito è generata o assistita da sistemi di intelligenza artificiale. Tali contenuti sono revisionati dalla redazione ma potrebbero non riflettere sempre opinioni o posizioni ufficiali. Proof Press non garantisce la completezza o l'assenza di errori nei contenuti AI-assisted.
            </P>
            <P>
              <strong>Contenuti editoriali.</strong> I contenuti pubblicati su Proof Press sono selezionati e curati dalla redazione. La menzione di prodotti, servizi o aziende nei contenuti editoriali non implica raccomandazione o approvazione commerciale. Proof Press non è responsabile per le decisioni prese dagli utenti sulla base dei contenuti pubblicati.
            </P>
            <P>
              <strong>Proprietà intellettuale.</strong> Tutti i contenuti originali pubblicati su Proof Press (testi, grafica, loghi, layout) sono protetti da copyright. È vietata la riproduzione, anche parziale, senza autorizzazione scritta, salvo citazione con attribuzione e link alla fonte originale.
            </P>
          </Section>

          <Section id="contatti" title="9. Contatti e Aggiornamenti">
            <P>
              Per qualsiasi domanda relativa alla presente informativa o al trattamento dei dati personali, è possibile contattare il Titolare del trattamento all'indirizzo:{" "}
              <a href={`mailto:${OWNER_EMAIL}`} style={{ color: "#1a1a1a" }}>{OWNER_EMAIL}</a>.
            </P>
            <P>
              La presente Privacy Policy e Disclaimer è stata aggiornata il <strong>{LAST_UPDATE}</strong>. Proof Press si riserva il diritto di modificare questa informativa in qualsiasi momento. Le modifiche sostanziali saranno comunicate agli iscritti alla newsletter e/o tramite avviso in evidenza sul sito. L'uso continuato del sito dopo la pubblicazione delle modifiche costituisce accettazione delle stesse.
            </P>
          </Section>

        </div>

        {/* Footer della pagina */}
        <div className="text-center py-6">
          <p className="text-xs mb-3" style={{ color: "#9ca3af", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
            © {new Date().getFullYear()} Proof Press — AI for Business · Tutti i diritti riservati
          </p>
          <button
            onClick={() => navigate("/")}
            className="text-xs font-bold transition-colors hover:opacity-70"
            style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
          >
            ← Torna alla Home
          </button>
        </div>

      </div>
    </div>
  );
}
