import { trpc } from "@/lib/trpc";
import { Shield, AlertTriangle, AlertCircle, Info, ExternalLink } from "lucide-react";

type RiskLevel = "CRITICO" | "ALTO" | "MEDIO" | "BASSO";

const RISK_CONFIG: Record<RiskLevel, { color: string; bg: string; border: string; icon: React.ReactNode; label: string }> = {
  CRITICO: {
    color: "#2a2a2a",
    bg: "#fef2f2",
    border: "#fca5a5",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    label: "CRITICO",
  },
  ALTO: {
    color: "#2a2a2a",
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
  Ransomware: "#2a2a2a",
  Phishing: "#2a2a2a",
  "Vulnerabilità": "#d97706",
  "Data Breach": "#2a2a2a",
  APT: "#1d4ed8",
  DDoS: "#0891b2",
};

// ─── Skeleton specifico che replica la struttura reale della card ─────────────
// Mostra l'esatta anatomia della card (badge tipo, badge rischio, titolo, testo, footer)
// così l'utente capisce cosa sta arrivando e non vede schede nere vuote
function ThreatCardSkeleton() {
  return (
    <div
      className="rounded-lg border p-4"
      style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
    >
      {/* Header: badge tipo + badge rischio */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="h-4 w-20 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.12)" }} />
        <div className="h-4 w-16 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.08)" }} />
      </div>
      {/* Titolo minaccia */}
      <div className="h-4 w-4/5 rounded mb-1.5 animate-pulse" style={{ background: "rgba(255,255,255,0.15)" }} />
      <div className="h-4 w-3/5 rounded mb-3 animate-pulse" style={{ background: "rgba(255,255,255,0.10)" }} />
      {/* Descrizione: 3 righe */}
      <div className="space-y-1.5 mb-3">
        <div className="h-3 w-full rounded animate-pulse" style={{ background: "rgba(255,255,255,0.07)" }} />
        <div className="h-3 w-11/12 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.07)" }} />
        <div className="h-3 w-4/6 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.07)" }} />
      </div>
      {/* Footer: settore + fonte */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10">
        <div className="h-3 w-24 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.08)" }} />
        <div className="h-3 w-16 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.08)" }} />
      </div>
    </div>
  );
}

export default function ThreatAlert() {
  const { data, isLoading } = trpc.news.getThreatAlert.useQuery(undefined, {
    staleTime: 1000 * 60 * 60 * 4, // 4 ore: dati LLM cambiano raramente
    refetchOnWindowFocus: false,
    retry: 1,
  });

  if (isLoading) {
    return (
      <section className="py-8 bg-[#0a1628] border-t border-white/10">
        <div className="max-w-[1200px] mx-auto px-4">
          {/* Header skeleton */}
          <div className="flex items-start justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#27ae60]/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-[#27ae60]" />
              </div>
              <div>
                <span
                  className="text-xs font-bold uppercase tracking-[0.18em] text-[#27ae60] block"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                >
                  Threat Alert
                </span>
                <div className="h-3 w-32 rounded mt-1 animate-pulse" style={{ background: "rgba(255,255,255,0.10)" }} />
              </div>
            </div>
            <div className="h-3 w-48 rounded animate-pulse hidden sm:block" style={{ background: "rgba(255,255,255,0.07)" }} />
          </div>
          {/* 6 card skeleton con struttura reale */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <ThreatCardSkeleton key={i} />
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
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              >
                Threat Alert
              </span>
              <span
                className="text-[10px] text-white/40"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              >
                Aggiornato: {data.aggiornato}
              </span>
            </div>
          </div>
          <p
            className="text-xs text-white/50 max-w-xs text-right hidden sm:block"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif", fontStyle: "italic" }}
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
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
                    }}
                  >
                    {minaccia.tipo}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                    style={{
                      color: risk.color,
                      background: `${risk.color}20`,
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
                    }}
                  >
                    {risk.icon}
                    {risk.label}
                  </span>
                </div>

                {/* Nome minaccia */}
                <h4
                  className="text-sm font-bold text-white mb-1 leading-tight"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
                >
                  {minaccia.nome}
                </h4>

                {/* Descrizione */}
                <p
                  className="text-xs text-white/60 mb-3 leading-relaxed"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}
                >
                  {minaccia.descrizione}
                </p>

                {/* Footer card */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                  <span
                    className="text-[9px] text-white/40"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                  >
                    Settore: <span className="text-white/60">{minaccia.settoreColpito}</span>
                  </span>
                  <span
                    className="text-[9px] text-white/40 flex items-center gap-1"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
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
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif", fontStyle: "italic" }}
        >
          {data.sommario}
        </p>
      </div>
    </section>
  );
}
