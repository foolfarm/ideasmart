/**
 * VerifyStatsWidget — Layout 2 colonne
 * Sinistra (50%): ProofPress Verify compatto con iframe
 * Destra (50%): Canali del giornale con icone e link
 */
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Zap, BookOpen, Rocket, TrendingUp, Sun, Globe, Briefcase, Eye } from "lucide-react";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";

const CHANNELS = [
  { label: "AI News",          sublabel: "Breaking news AI & Tech",    path: "/ai",       Icon: Zap,         color: "#0066cc",  external: false },
  { label: "Research",         sublabel: "Analisi & Dati di mercato",  path: "/research", Icon: BookOpen,    color: "#6d28d9",  external: false },
  { label: "Startup & Venture",sublabel: "Round, exit, deal europei",  path: "/startup",  Icon: Rocket,      color: "#dc2626",  external: false },
  { label: "Dealroom",         sublabel: "Investimenti & M&A",         path: "/dealroom", Icon: TrendingUp,  color: "#059669",  external: false },
  { label: "Buongiorno",       sublabel: "Newsletter delle 8:30",      path: "/buongiorno",Icon: Sun,         color: "#d97706",  external: false },
  { label: "International",    sublabel: "proofpress.biz",             path: "https://proofpress.biz", Icon: Globe, color: "#374151", external: true },
  { label: "Servizi",          sublabel: "Offerta commerciale",        path: "/offertacommerciale", Icon: Briefcase, color: "#0891b2", external: false },
  { label: "Osservatorio",     sublabel: "Base Alpha tech",            path: "/base-alpha", Icon: Eye, color: "#7c3aed", external: false },
];

export default function VerifyStatsWidget() {
  const { data: stats } = trpc.ppv.getStats.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
  const certifiedToday = stats?.certifiedToday ?? 0;
  const certifiedTotal = stats?.certifiedTotal ?? 0;

  return (
    <div className="max-w-[1280px] mx-auto px-4 pt-2 pb-1 hidden sm:block">
      <div
        className="rounded-lg overflow-hidden"
        style={{ border: "1px solid #e8edf5" }}
      >
        <div className="grid divide-x divide-[#e8edf5]" style={{ gridTemplateColumns: "38% 62%" }}>

          {/* ── COLONNA SINISTRA: ProofPress Verify ── */}
          <div className="px-4 py-3" style={{ background: "#fff" }}>
            <div className="flex items-center gap-2 mb-1.5">
              <span style={{ fontSize: 12 }}>🔐</span>
              <span
                className="text-[10px] font-black uppercase tracking-[0.18em]"
                style={{ color: "#0066cc", fontFamily: SF }}
              >
                Verifica la veridicità
              </span>
              <span
                className="text-[7px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                style={{ background: "#0066cc", color: "#fff" }}
              >
                CERTIFICATO
              </span>
              {certifiedToday > 0 && (
                <span
                  className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{ background: "#e8f5e9", color: "#2e7d32", border: "1px solid #a5d6a7" }}
                >
                  ✓ {certifiedToday} certificate oggi
                </span>
              )}
              {certifiedToday === 0 && certifiedTotal > 0 && (
                <span
                  className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{ background: "#e3f2fd", color: "#1565c0", border: "1px solid #90caf9" }}
                >
                  {certifiedTotal} certificate
                </span>
              )}
              <div className="flex-1" />
              <a
                href="https://proofpressverify.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] font-semibold hover:underline flex-shrink-0"
                style={{ color: "#0066cc" }}
              >
                proofpressverify.com →
              </a>
            </div>
            <iframe
              src="https://proofpressverify.com/widget/news-verify?theme=light"
              width="100%"
              height="80"
              frameBorder="0"
              style={{ border: "none", borderRadius: "6px", display: "block" }}
              title="Verifica con ProofPress"
              loading="lazy"
            />
          </div>

          {/* ── COLONNA DESTRA: Canali del giornale ── */}
          <div className="px-4 py-3" style={{ background: "#fafafa" }}>
            <div className="mb-2">
              <span
                className="text-[9px] font-black uppercase tracking-[0.2em]"
                style={{ color: "rgba(26,26,26,0.4)", fontFamily: SF }}
              >
                I canali di ProofPress
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {CHANNELS.map(({ label, sublabel, path, Icon, color, external }) => {
                const inner = (
                  <div
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-all hover:bg-white hover:shadow-sm"
                    style={{ border: "1px solid #ebebeb" }}
                  >
                    <span
                      className="flex-shrink-0 flex items-center justify-center"
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        background: color + "18",
                      }}
                    >
                      <Icon size={11} strokeWidth={2.2} color={color} />
                    </span>
                    <div className="min-w-0">
                      <div
                        className="text-[10px] font-bold leading-tight truncate"
                        style={{ color: "#1a1a1a", fontFamily: SF }}
                      >
                        {label}
                      </div>
                      <div
                        className="text-[8px] leading-tight truncate"
                        style={{ color: "#8e8e93", fontFamily: SF }}
                      >
                        {sublabel}
                      </div>
                    </div>
                  </div>
                );
                return external ? (
                  <a key={path} href={path} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                    {inner}
                  </a>
                ) : (
                  <Link key={path} href={path}>
                    {inner}
                  </Link>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
