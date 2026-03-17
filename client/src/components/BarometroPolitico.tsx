/**
 * BarometroPolitico — Widget grafico con intenzioni di voto italiane
 * Stile: editoriale, barre orizzontali + grafico storico a linee (Recharts)
 * Tab: "Oggi" (barre) | "4 Settimane" (linee)
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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

type HistoryRow = {
  dateLabel: string;
  partito: string;
  partitoNome: string | null;
  percentuale: number;
  colore: string | null;
};

function VariazioneIcon({ val }: { val: number }) {
  if (val > 0)
    return (
      <span style={{ color: "#27ae60", fontFamily: "'Space Mono', monospace" }} className="text-[10px] font-bold">
        ▲ +{val.toFixed(1)}
      </span>
    );
  if (val < 0)
    return (
      <span style={{ color: "#e74c3c", fontFamily: "'Space Mono', monospace" }} className="text-[10px] font-bold">
        ▼ {val.toFixed(1)}
      </span>
    );
  return (
    <span style={{ color: INK + "60", fontFamily: "'Space Mono', monospace" }} className="text-[10px]">
      — 0.0
    </span>
  );
}

function BarometroSkeleton() {
  return (
    <div className="animate-pulse">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="flex items-center gap-3 mb-3">
          <div className="w-12 h-3 rounded" style={{ background: INK + "15" }} />
          <div className="flex-1 h-5 rounded" style={{ background: INK + "10" }} />
          <div className="w-10 h-3 rounded" style={{ background: INK + "15" }} />
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="animate-pulse h-52 flex items-end gap-1 px-2">
      {[60, 80, 55, 90, 70, 85, 65].map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t"
          style={{ height: `${h}%`, background: INK + "12" }}
        />
      ))}
    </div>
  );
}

/** Trasforma i dati flat in array di oggetti per Recharts (una riga = una data) */
function buildChartData(rows: HistoryRow[]): { date: string; [partito: string]: number | string }[] {
  const byDate: Record<string, Record<string, number>> = {};
  for (const row of rows) {
    if (!byDate[row.dateLabel]) byDate[row.dateLabel] = {};
    byDate[row.dateLabel][row.partito] = row.percentuale;
  }
  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({
      date: date.slice(5), // "MM-DD" per compattezza
      ...values,
    }));
}

/** Estrae i partiti unici con il loro colore dall'array storico */
function extractPartitiFromHistory(rows: HistoryRow[]): { nome: string; colore: string }[] {
  const map = new Map<string, string>();
  for (const r of rows) {
    if (!map.has(r.partito)) map.set(r.partito, r.colore ?? ACCENT);
  }
  return Array.from(map.entries()).map(([nome, colore]) => ({ nome, colore }));
}

// Tooltip personalizzato per il grafico
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  const sorted = [...payload].sort((a, b) => b.value - a.value);
  return (
    <div
      className="rounded-lg shadow-lg p-3 border text-xs"
      style={{ background: "#fff", borderColor: INK + "20", fontFamily: "'Space Mono', monospace", minWidth: 140 }}
    >
      <p className="font-bold mb-2" style={{ color: INK }}>
        {label}
      </p>
      {sorted.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-3 mb-1">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span style={{ color: INK + "cc" }}>{entry.name}</span>
          </span>
          <span className="font-bold" style={{ color: INK }}>
            {entry.value.toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
}

export default function BarometroPolitico() {
  const [activeTab, setActiveTab] = useState<"oggi" | "storico">("oggi");

  const { data, isLoading, error } = trpc.news.getBarometro.useQuery(undefined, {
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });

  const { data: historyData, isLoading: historyLoading } = trpc.news.getBarometroHistory.useQuery(
    { days: 28 },
    {
      staleTime: 1000 * 60 * 15,
      refetchOnWindowFocus: false,
      enabled: activeTab === "storico",
    }
  );

  const barometro = data as BarometroData | null | undefined;

  const sortedPartiti = useMemo(
    () => (barometro?.partiti ? [...barometro.partiti].sort((a, b) => b.percentuale - a.percentuale) : []),
    [barometro]
  );

  const maxPerc = sortedPartiti.length > 0 ? Math.max(...sortedPartiti.map((p) => p.percentuale)) : 40;

  const chartData = useMemo(() => buildChartData((historyData as HistoryRow[]) ?? []), [historyData]);
  const partitiInHistory = useMemo(
    () => extractPartitiFromHistory((historyData as HistoryRow[]) ?? []),
    [historyData]
  );

  const hasHistory = chartData.length > 0;

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
        {/* Header con tabs */}
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
              Sondaggio più recente — aggiornato ogni notte
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Tab switcher */}
            <div
              className="flex rounded overflow-hidden border text-[9px] font-bold uppercase tracking-widest"
              style={{ borderColor: ACCENT + "40" }}
            >
              <button
                onClick={() => setActiveTab("oggi")}
                className="px-2.5 py-1 transition-colors"
                style={{
                  background: activeTab === "oggi" ? ACCENT : "transparent",
                  color: activeTab === "oggi" ? "#fff" : ACCENT,
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                Oggi
              </button>
              <button
                onClick={() => setActiveTab("storico")}
                className="px-2.5 py-1 transition-colors"
                style={{
                  background: activeTab === "storico" ? ACCENT : "transparent",
                  color: activeTab === "storico" ? "#fff" : ACCENT,
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                4 Settimane
              </button>
            </div>
            <div
              className="flex-shrink-0 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest"
              style={{ background: ACCENT, color: "#fff", fontFamily: "'Space Mono', monospace" }}
            >
              LIVE
            </div>
          </div>
        </div>

        {/* ── TAB: OGGI (barre orizzontali) ── */}
        {activeTab === "oggi" && (
          <>
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
                    <div
                      className="w-14 flex-shrink-0 text-right text-[11px] font-bold"
                      style={{ color: INK, fontFamily: "'Space Mono', monospace" }}
                      title={partito.nomeCompleto}
                    >
                      {partito.nome}
                    </div>
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
                          color: partito.percentuale / maxPerc > 0.35 ? "#fff" : INK,
                          fontFamily: "'Space Mono', monospace",
                          zIndex: 1,
                        }}
                      >
                        {partito.percentuale.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-16 flex-shrink-0 text-right">
                      <VariazioneIcon val={partito.variazione} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── TAB: STORICO (grafico a linee) ── */}
        {activeTab === "storico" && (
          <>
            {historyLoading && <ChartSkeleton />}
            {!historyLoading && !hasHistory && (
              <div className="text-center py-8">
                <p
                  className="text-sm text-[#1a1a2e]/50 mb-1"
                  style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
                >
                  Lo storico si popola automaticamente ogni notte.
                </p>
                <p
                  className="text-xs text-[#1a1a2e]/35"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  I dati storici saranno disponibili dopo il primo ciclo di scraping notturno.
                </p>
              </div>
            )}
            {!historyLoading && hasHistory && (
              <div className="mt-2">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={INK + "10"} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 9, fontFamily: "'Space Mono', monospace", fill: INK + "80" }}
                      tickLine={false}
                      axisLine={{ stroke: INK + "20" }}
                    />
                    <YAxis
                      tick={{ fontSize: 9, fontFamily: "'Space Mono', monospace", fill: INK + "80" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v}%`}
                      domain={[0, "auto"]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: 9, fontFamily: "'Space Mono', monospace", paddingTop: 8 }}
                      iconType="circle"
                      iconSize={8}
                    />
                    {partitiInHistory.map((p) => (
                      <Line
                        key={p.nome}
                        type="monotone"
                        dataKey={p.nome}
                        stroke={p.colore}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
                <p
                  className="mt-2 text-[9px] text-[#1a1a2e]/35 text-right"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  Dati: ultimi {chartData.length} giorni rilevati
                </p>
              </div>
            )}
          </>
        )}

        {/* Footer nota */}
        {activeTab === "oggi" && barometro?.nota && (
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
