import { trpc } from "@/lib/trpc";
import { Shield, AlertTriangle, AlertCircle, Info, ExternalLink } from "lucide-react";

type RiskLevel = "CRITICO" | "ALTO" | "MEDIO" | "BASSO";

const RISK_CONFIG: Record<RiskLevel, { color: string; bg: string; border: string; icon: React.ReactNode; label: string }> = {
  CRITICO: {
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fca5a5",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    label: "CRITICO",
  },
  ALTO: {
    color: "#ea580c",
    bg: "#fff7ed",
    border: "#fdba74",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    label: "ALTO",
  },
  MEDIO: {
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fcd34d",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    label: "MEDIO",
  },
  BASSO: {
    color: "#059669",
    bg: "#ecfdf5",
    border: "#6ee7b7",
    icon: <Info className="w-3.5 h-3.5" />,
    label: "BASSO",
  },
};

const TIPO_COLORS: Record<string, string> = {
  Ransomware: "#dc2626",
  Phishing: "#ea580c",
  "Vulnerabilità": "#d97706",
  "Data Breach": "#7c3aed",
  APT: "#1d4ed8",
  DDoS: "#0891b2",
};

export default function ThreatAlert() {
  const { data, isLoading } = trpc.news.getThreatAlert.useQuery(undefined, {
    staleTime: 1000 * 60 * 60 * 4, // 4 ore: dati LLM cambiano raramente
    retry: 1,
  });

  if (isLoading) {
    return (
      <section className="py-8 bg-[#0a1628]">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-[#27ae60]" />
            <span
              className="text-xs font-bold uppercase tracking-[0.18em] text-[#27ae60]"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Threat Alert
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!data || !data.minacce?.length) return null;

  return (
    <section className="py-8 bg-[#0a1628] border-t border-white/10">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#27ae60]/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#27ae60]" />
            </div>
            <div>
              <span
                className="text-xs font-bold uppercase tracking-[0.18em] text-[#27ae60] block"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                Threat Alert
              </span>
              <span
                className="text-[10px] text-white/40"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                Aggiornato: {data.aggiornato}
              </span>
            </div>
          </div>
          <p
            className="text-xs text-white/50 max-w-xs text-right hidden sm:block"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontStyle: "italic" }}
          >
            {data.sommario}
          </p>
        </div>

        {/* Minacce grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.minacce.map((minaccia: {
            tipo: string;
            nome: string;
            descrizione: string;
            livelloRischio: string;
            settoreColpito: string;
            fonte: string;
          }, idx: number) => {
            const risk = RISK_CONFIG[minaccia.livelloRischio as RiskLevel] ?? RISK_CONFIG["MEDIO"];
            const tipoColor = TIPO_COLORS[minaccia.tipo] ?? "#6b7280";
            return (
              <div
                key={idx}
                className="rounded-lg border p-4 transition-all hover:scale-[1.01]"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderColor: `${risk.color}40`,
                }}
              >
                {/* Header card */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                    style={{
                      color: tipoColor,
                      background: `${tipoColor}20`,
                      fontFamily: "'Space Mono', monospace",
                    }}
                  >
                    {minaccia.tipo}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                    style={{
                      color: risk.color,
                      background: `${risk.color}20`,
                      fontFamily: "'Space Mono', monospace",
                    }}
                  >
                    {risk.icon}
                    {risk.label}
                  </span>
                </div>

                {/* Nome minaccia */}
                <h4
                  className="text-sm font-bold text-white mb-1 leading-tight"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {minaccia.nome}
                </h4>

                {/* Descrizione */}
                <p
                  className="text-xs text-white/60 mb-3 leading-relaxed"
                  style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
                >
                  {minaccia.descrizione}
                </p>

                {/* Footer card */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                  <span
                    className="text-[9px] text-white/40"
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    Settore: <span className="text-white/60">{minaccia.settoreColpito}</span>
                  </span>
                  <span
                    className="text-[9px] text-white/40 flex items-center gap-1"
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                    {minaccia.fonte}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sommario mobile */}
        <p
          className="text-xs text-white/40 mt-4 text-center sm:hidden"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontStyle: "italic" }}
        >
          {data.sommario}
        </p>
      </div>
    </section>
  );
}
