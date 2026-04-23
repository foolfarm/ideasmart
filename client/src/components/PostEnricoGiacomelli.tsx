/**
 * PostEnricoGiacomelli — Post editoriale di Andrea Cinelli su Enrico Giacomelli / Namirial
 * Stile: Apple editorial, coerente con la Home di ProofPress
 * Video: https://youtu.be/zVl38NEURPY
 */

const FONT_DISPLAY = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";
const FONT_TEXT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif";

const POST_TEXT = [
  "Ho avuto la fortuna di lavorare con Enrico Giacomelli, di conoscerlo. E ne sono rimasto folgorato.",
  "Senza retorica: Enrico è una di quelle persone che, se hai la fortuna di incontrare, ti cambiano la vita. Per umanità, capacità, empatia e determinazione.",
  "Nato dal nulla, partito dalla strada. Lavoro durissimo, infinite sigarette e bestemmie, dedizione totale 24 ore su 24. E accanto a lui le sue persone, uguali a lui: un'alchimia unica, senza fronzoli, senza presunzione, solo relazione umana. Questo è stato il segreto di un successo miliardario che Enrico ha stra-meritato.",
  "La sua è una storia da film, e spero che presto qualche regista se ne accorga: in Italia storie così non ce ne sono tante. Partito da Senigallia, è diventato un leader europeo — pezzo su pezzo, centimetro dopo centimetro.",
  "I clienti non amavano solo Namirial: amavano Enrico. Ne restavano stregati, e non avrebbero mai potuto tradirlo. Perché uno così, capace 24 ore su 24 di dare supporto e servizio con un'umiltà unica e una dedizione incessante, dove lo trovi? Impossibile tradirlo.",
  "Ma soprattutto conta il rispetto e l'attenzione che dedica alle persone con cui lavora. Per questo il successo di Namirial Group non mi sorprende. Non vincono mai i singoli: vince chi sa costruire una squadra vera. Persone che si stimano, si fidano e restano allineate anche oltre il perimetro professionale, perché sanno di poter contare su un leader che è un punto di riferimento 24/7, dentro e fuori dal lavoro.",
  "Per me è stato un privilegio lavorarci insieme. Sono davvero felice per la sua straordinaria storia — completamente meritata — che ho avuto il piacere di toccare con mano, almeno in piccola parte.",
  "Grande Enrico, in bocca al lupo. Sky is the limit 🚀",
];

export default function PostEnricoGiacomelli() {
  const today = new Date().toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mt-6">
      {/* Header sezione */}
      <div className="flex items-center gap-2 mb-2">
        <div className="h-[3px] flex-1" style={{ background: "#1a1a1a" }} />
        <span
          className="text-[10px] font-bold uppercase tracking-[0.2em]"
          style={{
            color: "#1a1a1a",
            fontFamily: FONT_TEXT,
          }}
        >
          Il Post del Direttore
        </span>
        <div className="h-[3px] flex-1" style={{ background: "#1a1a1a" }} />
      </div>
      <div className="border-t-2 mb-4" style={{ borderColor: "#1d1d1f" }} />

      {/* Card post */}
      <article
        className="rounded-xl overflow-hidden"
        style={{
          border: "1px solid rgba(26,26,26,0.10)",
          background: "#fafafa",
        }}
      >
        {/* Video YouTube embed */}
        <div
          className="relative w-full"
          style={{ paddingBottom: "56.25%", background: "#000" }}
        >
          <iframe
            src="https://www.youtube.com/embed/zVl38NEURPY?rel=0&modestbranding=1"
            title="Enrico Giacomelli — Namirial Group"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            style={{ border: 0 }}
          />
        </div>

        {/* Contenuto testuale */}
        <div className="p-4">
          {/* Firma autore */}
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
              style={{ background: "#0077b5" }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </div>
            <span
              className="text-[9px] font-bold uppercase tracking-widest"
              style={{ color: "#0077b5", fontFamily: FONT_TEXT }}
            >
              Andrea Cinelli
            </span>
            <span
              className="text-[9px] ml-auto"
              style={{ color: "rgba(26,26,26,0.35)", fontFamily: FONT_TEXT }}
            >
              {today}
            </span>
          </div>

          {/* Titolo */}
          <h3
            className="text-[15px] font-bold leading-snug mb-3"
            style={{ color: "#1a1a1a", fontFamily: FONT_DISPLAY }}
          >
            Grande Enrico Giacomelli: una storia da film, un successo miliardario meritato
          </h3>

          {/* Testo del post */}
          <div className="space-y-2">
            {POST_TEXT.map((paragraph, i) => (
              <p
                key={i}
                className="text-[12px] leading-relaxed"
                style={{
                  color: "rgba(26,26,26,0.75)",
                  fontFamily: FONT_TEXT,
                }}
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Tag */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {["Namirial", "Leadership", "Startup Italia", "Imprenditoria"].map((tag) => (
              <span
                key={tag}
                className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(26,26,26,0.06)",
                  color: "rgba(26,26,26,0.55)",
                  fontFamily: FONT_TEXT,
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* CTA LinkedIn */}
          <a
            href="https://youtu.be/zVl38NEURPY?si=RR5exPnzcDOdTk0-"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: "#0077b5", fontFamily: FONT_TEXT }}
          >
            Guarda il video completo →
          </a>
        </div>
      </article>
    </div>
  );
}
