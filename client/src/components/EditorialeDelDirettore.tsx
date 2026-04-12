/**
 * EditorialeDelDirettore — Sezione Home Page
 *
 * Mostra l'editoriale giornaliero del direttore Andrea Cinelli (sezione "ai")
 * con firma Andrea Cinelli, data e link alla pagina autore.
 *
 * Design: stile quotidiano di qualità — sfondo bianco, bordo nero spesso,
 * colonna sinistra con firma, colonna destra con testo editoriale completo.
 * Distinto dal "Punto del Giorno" (post LinkedIn): questo è l'editoriale lungo.
 */

import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

const INK = "#1a1a1a";
const ACCENT = "#1a1a1a";
const PAPER = "#ffffff";
const AUTHOR_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/andrea-cinelli-profile_2084610f.jpeg";

function formatDateIT(dateLabel: string): string {
  try {
    const parts = dateLabel.split("-").map(Number);
    let year: number, month: number, day: number;
    if (parts[0] > 31) {
      // Formato ISO: YYYY-MM-DD
      [year, month, day] = parts;
    } else {
      // Formato italiano invertito: DD-MM-YYYY
      [day, month, year] = parts;
    }
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("it-IT", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateLabel;
  }
}

/** Divide il body in paragrafi e applica grassetto inline (**testo**) */
function renderBody(body: string) {
  const paragraphs = body
    .split(/\n{1,2}/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  return paragraphs.map((para, i) => {
    // Sostituisce **testo** con <strong>testo</strong>
    const parts = para.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p
        key={i}
        style={{
          color: INK + "cc",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif",
          fontSize: "16px",
          lineHeight: 1.8,
          marginBottom: "0",
        }}
      >
        {parts.map((part, j) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={j} style={{ color: INK, fontWeight: 700 }}>
              {part.slice(2, -2)}
            </strong>
          ) : (
            part
          )
        )}
      </p>
    );
  });
}

export default function EditorialeDelDirettore() {
  const { data: editorial, isLoading } = trpc.editorial.getLatest.useQuery(
    { section: "ai" },
    { staleTime: 1000 * 60 * 30, refetchOnWindowFocus: false }
  );

  // Non mostrare nulla se non c'è editoriale e non sta caricando
  if (!isLoading && !editorial) return null;

  return (
    <section>
      {/* ── Header sezione ── */}
      <div className="border-t-[3px]" style={{ borderColor: ACCENT }} />
      <div className="py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-[3px] w-6" style={{ background: ACCENT }} />
          <span
            className="text-[11px] font-bold uppercase tracking-[0.25em]"
            style={{
              color: ACCENT,
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
            }}
          >
            Editoriale del Direttore
          </span>
        </div>
        {editorial?.dateLabel && (
          <span
            className="text-[10px] uppercase tracking-widest"
            style={{
              color: INK + "55",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
            }}
          >
            {formatDateIT(editorial.dateLabel)}
          </span>
        )}
      </div>

      {/* ── Corpo ── */}
      {isLoading && !editorial ? (
        <div className="animate-pulse border-l-4 pl-6 py-6" style={{ borderColor: ACCENT, background: PAPER }}>
          <div className="h-6 rounded w-3/4 mb-3" style={{ background: INK + "15" }} />
          <div className="h-4 rounded w-1/2 mb-6" style={{ background: INK + "10" }} />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-3 rounded" style={{ background: INK + "08", width: i === 5 ? "60%" : "100%" }} />
            ))}
          </div>
        </div>
      ) : editorial ? (
        <div
          className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-0 border-l-4"
          style={{ borderColor: ACCENT, background: PAPER }}
        >
          {/* ── Colonna sinistra: firma autore ── */}
          <div
            className="flex flex-col justify-between p-5 border-r"
            style={{ borderColor: INK + "10" }}
          >
            {/* Avatar + nome */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={AUTHOR_IMG}
                  alt="Andrea Cinelli"
                  className="w-14 h-14 rounded-full object-cover object-top border-2 flex-shrink-0"
                  style={{ borderColor: ACCENT }}
                />
                <div>
                  <Link href="/andrea-cinelli">
                    <p
                      className="font-bold leading-tight cursor-pointer hover:underline"
                      style={{
                        color: INK,
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
                        fontSize: "15px",
                      }}
                    >
                      Andrea Cinelli
                    </p>
                  </Link>
                  <p
                    className="text-[11px] mt-0.5 leading-snug"
                    style={{
                      color: INK + "60",
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
                    }}
                  >
                    Direttore editoriale
                  </p>
                </div>
              </div>

              {/* Ruolo / bio breve */}
              <p
                className="text-[12px] leading-relaxed mb-4"
                style={{
                  color: INK + "70",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif",
                  fontStyle: "italic",
                }}
              >
                Serial entrepreneur, 2 exit. Co-fondatore di Libero.it. Fondatore di FoolFarm. Professore di AI al Sole 24 Ore Business School.
              </p>

              {/* Key trend del giorno */}
              {editorial.keyTrend && (
                <div
                  className="px-3 py-2 mb-4"
                  style={{ background: INK + "06", borderLeft: `3px solid ${ACCENT}` }}
                >
                  <p
                    className="text-[9px] font-bold uppercase tracking-widest mb-1"
                    style={{ color: INK + "50", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                  >
                    Trend del giorno
                  </p>
                  <p
                    className="text-[13px] font-semibold leading-snug"
                    style={{ color: INK, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
                  >
                    {editorial.keyTrend}
                  </p>
                </div>
              )}
            </div>

            {/* Footer firma: LinkedIn + archivio */}
            <div className="space-y-2 pt-4 border-t" style={{ borderColor: INK + "10" }}>
              <a
                href="https://www.linkedin.com/in/cinellia/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold uppercase tracking-widest hover:underline block"
                style={{ color: "#0077b5", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              >
                Seguimi su LinkedIn →
              </a>
              <Link href="/andrea-cinelli">
                <span
                  className="text-[10px] font-bold uppercase tracking-widest hover:underline cursor-pointer block"
                  style={{ color: ACCENT, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                >
                  Tutti gli editoriali →
                </span>
              </Link>
            </div>
          </div>

          {/* ── Colonna destra: testo editoriale ── */}
          <div className="p-6 md:p-8">
            {/* Titolo */}
            <h3
              className="font-bold leading-tight mb-2"
              style={{
                color: INK,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
                fontSize: "clamp(22px, 2.5vw, 30px)",
                lineHeight: 1.15,
              }}
            >
              {editorial.title}
            </h3>

            {/* Sottotitolo */}
            {editorial.subtitle && (
              <p
                className="mb-5"
                style={{
                  color: INK + "70",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif",
                  fontSize: "16px",
                  lineHeight: 1.5,
                  fontStyle: "italic",
                }}
              >
                {editorial.subtitle}
              </p>
            )}

            {/* Separatore */}
            <div className="border-t mb-5" style={{ borderColor: INK + "15" }} />

            {/* Body */}
            <div className="space-y-4">
              {renderBody(editorial.body)}
            </div>

            {/* Nota del direttore */}
            {editorial.authorNote && (
              <div
                className="mt-6 px-4 py-3 border-l-2"
                style={{ borderColor: ACCENT, background: INK + "04" }}
              >
                <p
                  className="text-[11px] font-bold uppercase tracking-widest mb-1"
                  style={{ color: INK + "50", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                >
                  Nota del Direttore
                </p>
                <p
                  style={{
                    color: INK + "90",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif",
                    fontSize: "14px",
                    lineHeight: 1.7,
                    fontStyle: "italic",
                  }}
                >
                  {editorial.authorNote}
                </p>
              </div>
            )}

            {/* Footer: link pagina completa */}
            <div className="mt-6 pt-4 border-t flex items-center justify-end" style={{ borderColor: INK + "12" }}>
              {editorial.id && (
                <Link href={`/ai/editoriale/${editorial.id}`}>
                  <span
                    className="text-[11px] font-bold uppercase tracking-widest hover:underline cursor-pointer"
                    style={{ color: ACCENT, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                  >
                    Leggi l'analisi completa →
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
