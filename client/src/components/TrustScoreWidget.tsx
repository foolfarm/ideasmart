/**
 * TrustScoreWidget — Sidebar widget che mostra la distribuzione dei Trust Score A-F
 * Design: editoriale, coerente con il sistema SF Pro del magazine ProofPress
 */
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
const SF_DISPLAY = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";

// Colori e label per ogni grade
const GRADE_CONFIG: Record<string, { color: string; bg: string; label: string; desc: string }> = {
  A: { color: "#00b894", bg: "#f0fdf8", label: "A", desc: "Certificazione completa" },
  B: { color: "#0984e3", bg: "#eff6ff", label: "B", desc: "Alta affidabilità" },
  C: { color: "#fdcb6e", bg: "#fffbeb", label: "C", desc: "Affidabilità media" },
  D: { color: "#e17055", bg: "#fff5f0", label: "D", desc: "Affidabilità limitata" },
  F: { color: "#d63031", bg: "#fff0f0", label: "F", desc: "Non verificato" },
};

// Tutti i grade possibili in ordine
const ALL_GRADES = ["A", "B", "C", "D", "F"];

export default function TrustScoreWidget() {
  const { data, isLoading } = trpc.news.getTrustDistribution.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-[3px] flex-1" style={{ background: "#1a1a1a" }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: "#1a1a1a", fontFamily: SF }}>
            Trust Score
          </span>
          <div className="h-[3px] flex-1" style={{ background: "#1a1a1a" }} />
        </div>
        <div className="border-t-2 mb-3" style={{ borderColor: "#1d1d1f" }} />
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-6 rounded animate-pulse" style={{ background: "#f0f0f0" }} />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.certified === 0) return null;

  const { distribution, total, certified, topGrade, avgScore } = data;

  // Mappa grade → count per lookup rapido
  const gradeMap = new Map(distribution.map(d => [d.grade, d]));

  // Grade presenti (per barre)
  const presentGrades = ALL_GRADES.filter(g => gradeMap.has(g));

  // Massimo count (per normalizzare le barre)
  const maxCount = Math.max(...distribution.map(d => d.count), 1);

  return (
    <div className="mt-6">
      {/* Header sezione */}
      <div className="flex items-center gap-2 mb-2">
        <div className="h-[3px] flex-1" style={{ background: "#1a1a1a" }} />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]"
          style={{ color: "#1a1a1a", fontFamily: SF }}>
          Trust Score
        </span>
        <div className="h-[3px] flex-1" style={{ background: "#1a1a1a" }} />
      </div>
      <div className="border-t-2 mb-3" style={{ borderColor: "#1d1d1f" }} />

      {/* Stat aggregate */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {/* Totale certificati */}
        <div className="text-center p-2 rounded-lg" style={{ background: "#f8f8f8" }}>
          <p className="text-[18px] font-black leading-none mb-0.5" style={{ color: "#1a1a1a", fontFamily: SF_DISPLAY }}>
            {certified}
          </p>
          <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: "#1a1a1a", opacity: 0.45, fontFamily: SF }}>
            Certificati
          </p>
        </div>
        {/* Score medio */}
        <div className="text-center p-2 rounded-lg" style={{ background: "#f8f8f8" }}>
          <p className="text-[18px] font-black leading-none mb-0.5" style={{ color: "#1a1a1a", fontFamily: SF_DISPLAY }}>
            {avgScore}
          </p>
          <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: "#1a1a1a", opacity: 0.45, fontFamily: SF }}>
            Score medio
          </p>
        </div>
        {/* Grade top */}
        <div className="text-center p-2 rounded-lg" style={{ background: topGrade ? GRADE_CONFIG[topGrade]?.bg ?? "#f8f8f8" : "#f8f8f8" }}>
          <p className="text-[18px] font-black leading-none mb-0.5"
            style={{ color: topGrade ? GRADE_CONFIG[topGrade]?.color ?? "#1a1a1a" : "#1a1a1a", fontFamily: SF_DISPLAY }}>
            {topGrade ?? "—"}
          </p>
          <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: "#1a1a1a", opacity: 0.45, fontFamily: SF }}>
            Top grade
          </p>
        </div>
      </div>

      {/* Barre distribuzione */}
      <div className="space-y-2">
        {presentGrades.map(grade => {
          const entry = gradeMap.get(grade)!;
          const cfg = GRADE_CONFIG[grade] ?? { color: "#888", bg: "#f8f8f8", label: grade, desc: "" };
          const barWidth = Math.max(4, Math.round((entry.count / maxCount) * 100));
          const pct = total > 0 ? Math.round((entry.count / total) * 100) : 0;

          return (
            <div key={grade} className="flex items-center gap-2">
              {/* Badge grade */}
              <span
                className="inline-flex items-center justify-center font-black text-white rounded flex-shrink-0"
                style={{ background: cfg.color, fontSize: "10px", width: "16px", height: "16px" }}
              >
                {grade}
              </span>
              {/* Barra */}
              <div className="flex-1 relative h-4 rounded overflow-hidden" style={{ background: "#f0f0f0" }}>
                <div
                  className="h-full rounded transition-all duration-700"
                  style={{ width: `${barWidth}%`, background: cfg.color, opacity: 0.75 }}
                />
                {/* Label count sovrapposta */}
                <span
                  className="absolute inset-0 flex items-center pl-2 text-[9px] font-bold"
                  style={{ color: barWidth > 30 ? "#fff" : cfg.color, fontFamily: SF }}
                >
                  {entry.count} art.
                </span>
              </div>
              {/* Percentuale */}
              <span className="text-[9px] font-bold flex-shrink-0 w-7 text-right"
                style={{ color: cfg.color, fontFamily: SF }}>
                {pct}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Copertura totale */}
      <div className="mt-3 pt-2 border-t border-[#1a1a1a]/10">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: "#1a1a1a", opacity: 0.45, fontFamily: SF }}>
            Copertura ProofPress Verify
          </span>
          <span className="text-[9px] font-black" style={{ color: "#1a1a1a", fontFamily: SF }}>
            {total > 0 ? Math.round((certified / total) * 100) : 0}%
          </span>
        </div>
        {/* Barra copertura */}
        <div className="h-1.5 rounded overflow-hidden" style={{ background: "#f0f0f0" }}>
          <div
            className="h-full rounded transition-all duration-700"
            style={{
              width: `${total > 0 ? Math.round((certified / total) * 100) : 0}%`,
              background: "linear-gradient(90deg, #00b894, #0984e3)"
            }}
          />
        </div>
        <p className="text-[8px] mt-1" style={{ color: "#1a1a1a", opacity: 0.35, fontFamily: SF }}>
          {certified} su {total} articoli certificati
        </p>
      </div>

      {/* CTA */}
      <div className="mt-3 text-center">
        <Link href="/trust-score">
          <span
            className="text-[9px] font-bold uppercase tracking-widest hover:opacity-70 transition-opacity cursor-pointer"
            style={{ color: "#00b894", fontFamily: SF }}
          >
            Scopri il sistema Trust Score →
          </span>
        </Link>
      </div>
    </div>
  );
}
