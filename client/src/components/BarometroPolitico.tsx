/**
 * BarometroPolitico — Widget grafico con intenzioni di voto italiane
 * Stile: editoriale, barre orizzontali, palette partiti italiani
 */
import { trpc } from "@/lib/trpc";

const ACCENT = "#2980b9";
const ACCENT_LIGHT = "#eaf4fb";
const INK = "#1a1a2e";

interface Partito {
  nome: string;
  nomeCompleto: string;
  percentuale: number;
  colore: string;
  variazione: number;
}

interface BarometroData {
  partiti: Partito[];
  fonte: string;
  data: string;
  nota: string;
}

function VariazioneIcon({ val }: { val: number }) {
  if (val > 0) return <span style={{ color: "#27ae60", fontFamily: "'Space Mono', monospace" }} className="text-[10px] font-bold">▲ +{val.toFixed(1)}</span>;
  if (val < 0) return <span style={{ color: "#e74c3c", fontFamily: "'Space Mono', monospace" }} className="text-[10px] font-bold">▼ {val.toFixed(1)}</span>;
  return <span style={{ color: INK + "60", fontFamily: "'Space Mono', monospace" }} className="text-[10px]">— 0.0</span>;
}

function BarometroSkeleton() {
  return (
    <div className="animate-pulse">
      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <div key={i} className="flex items-center gap-3 mb-3">
          <div className="w-12 h-3 rounded" style={{ background: INK + "15" }} />
          <div className="flex-1 h-5 rounded" style={{ background: INK + "10" }} />
          <div className="w-10 h-3 rounded" style={{ background: INK + "15" }} />
        </div>
      ))}
    </div>
  );
}

export default function BarometroPolitico() {
  const { data, isLoading, error } = trpc.news.getBarometro.useQuery(undefined, {
    staleTime: 1000 * 60 * 60, // 1 ora di cache
    refetchOnWindowFocus: false,
  });

  const barometro = data as BarometroData | null | undefined;

  // Ordina per percentuale decrescente
  const sortedPartiti = barometro?.partiti
    ? [...barometro.partiti].sort((a, b) => b.percentuale - a.percentuale)
    : [];

  const maxPerc = sortedPartiti.length > 0 ? Math.max(...sortedPartiti.map(p => p.percentuale)) : 40;

  return (
    <div className="mt-8">
      <div className="w-full border-t-4 border-[#1a1a2e]" />
      <div className="py-3 flex items-center gap-4">
        <span
          className="text-[10px] font-bold uppercase tracking-[0.2em]"
          style={{ color: ACCENT, fontFamily: "'Space Mono', monospace" }}
        >
          Barometro Politico
        </span>
        <div className="flex-1 border-t border-[#1a1a2e]/20" />
        {barometro && (
          <span
            className="text-[10px] text-[#1a1a2e]/40 uppercase tracking-widest"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            {barometro.fonte} · {barometro.data}
          </span>
        )}
      </div>

      <div
        className="rounded-lg p-5 border"
        style={{ background: ACCENT_LIGHT, borderColor: ACCENT + "30" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3
              className="text-lg font-black text-[#1a1a2e]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Intenzioni di Voto
            </h3>
            <p
              className="text-xs text-[#1a1a2e]/55 mt-0.5"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
            >
              Sondaggio più recente disponibile — aggiornato ad ogni scraping notturno
            </p>
          </div>
          <div
            className="flex-shrink-0 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest"
            style={{ background: ACCENT, color: "#fff", fontFamily: "'Space Mono', monospace" }}
          >
            LIVE
          </div>
        </div>

        {/* Grafico */}
        {isLoading && <BarometroSkeleton />}

        {error && (
          <p className="text-sm text-[#1a1a2e]/50 text-center py-4" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
            Dati non disponibili al momento. Riprova più tardi.
          </p>
        )}

        {!isLoading && !error && sortedPartiti.length === 0 && (
          <p className="text-sm text-[#1a1a2e]/50 text-center py-4" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
            Nessun dato disponibile. Lo scraping notturno aggiornerà il barometro.
          </p>
        )}

        {!isLoading && sortedPartiti.length > 0 && (
          <div className="space-y-2.5">
            {sortedPartiti.map((partito) => (
              <div key={partito.nome} className="flex items-center gap-3">
                {/* Nome partito */}
                <div
                  className="w-14 flex-shrink-0 text-right text-[11px] font-bold"
                  style={{ color: INK, fontFamily: "'Space Mono', monospace" }}
                  title={partito.nomeCompleto}
                >
                  {partito.nome}
                </div>

                {/* Barra */}
                <div className="flex-1 relative h-6 rounded-sm overflow-hidden" style={{ background: INK + "10" }}>
                  <div
                    className="absolute left-0 top-0 h-full rounded-sm transition-all duration-700"
                    style={{
                      width: `${(partito.percentuale / maxPerc) * 100}%`,
                      background: partito.colore || ACCENT,
                      opacity: 0.85,
                    }}
                  />
                  <span
                    className="absolute left-2 top-0 h-full flex items-center text-[11px] font-bold"
                    style={{
                      color: (partito.percentuale / maxPerc) > 0.35 ? "#fff" : INK,
                      fontFamily: "'Space Mono', monospace",
                      zIndex: 1,
                    }}
                  >
                    {partito.percentuale.toFixed(1)}%
                  </span>
                </div>

                {/* Variazione */}
                <div className="w-16 flex-shrink-0 text-right">
                  <VariazioneIcon val={partito.variazione} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer nota */}
        {barometro?.nota && (
          <p
            className="mt-4 text-[10px] text-[#1a1a2e]/40 italic border-t pt-3"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif", borderColor: INK + "15" }}
          >
            {barometro.nota}
          </p>
        )}
      </div>
    </div>
  );
}
