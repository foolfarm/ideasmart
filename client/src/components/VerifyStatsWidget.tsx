/**
 * VerifyStatsWidget — ProofPress Verify widget con indicatore numerico notizie certificate
 * Mostra: titolo + badge CERTIFICATO + stats "X notizie certificate oggi" + iframe
 */
import { trpc } from "@/lib/trpc";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";

export default function VerifyStatsWidget() {
  const { data: stats } = trpc.ppv.getStats.useQuery(undefined, {
    staleTime: 1000 * 60 * 5, // cache 5 minuti
    refetchOnWindowFocus: false,
  });

  const certifiedToday = stats?.certifiedToday ?? 0;
  const certifiedTotal = stats?.certifiedTotal ?? 0;

  return (
    <div className="max-w-[1280px] mx-auto px-4 pt-2 pb-1 hidden sm:block">
      <div
        className="rounded-lg px-4 py-3"
        style={{ background: "#fff", border: "1px solid #e8edf5" }}
      >
        {/* Riga 1: titolo + badge + stats + link */}
        <div className="flex items-center gap-2 mb-1">
          <span style={{ fontSize: 13 }}>🔐</span>
          <span
            className="text-[10px] font-black uppercase tracking-[0.18em]"
            style={{ color: "#0066cc", fontFamily: SF }}
          >
            Verifica la veridicità di ogni notizia
          </span>
          <span
            className="text-[7px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
            style={{ background: "#0066cc", color: "#fff" }}
          >
            CERTIFICATO
          </span>

          {/* Indicatore numerico */}
          {certifiedToday > 0 && (
            <span
              className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ background: "#e8f5e9", color: "#2e7d32", border: "1px solid #a5d6a7" }}
            >
              ✓ {certifiedToday} notizie certificate oggi
            </span>
          )}
          {certifiedToday === 0 && certifiedTotal > 0 && (
            <span
              className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ background: "#e3f2fd", color: "#1565c0", border: "1px solid #90caf9" }}
            >
              {certifiedTotal} notizie certificate
            </span>
          )}

          <div className="flex-1" />
          <a
            href="https://proofpressverify.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] font-semibold hover:underline"
            style={{ color: "#0066cc", whiteSpace: "nowrap" }}
          >
            proofpressverify.com →
          </a>
        </div>

        {/* Riga 2: descrizione compatta */}
        <p
          className="text-[10px] leading-snug mb-2"
          style={{ color: "#444", fontFamily: SF }}
        >
          Copia il codice di verifica sotto ogni notizia e scopri come verifichiamo ogni notizia con{" "}
          <a
            href="https://proofpressverify.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold hover:underline"
            style={{ color: "#0066cc" }}
          >
            ProofPress Verify
          </a>
          .
        </p>

        {/* Widget iframe */}
        <iframe
          src="https://proofpressverify.com/widget/news-verify?theme=light"
          width="100%"
          height="120"
          frameBorder="0"
          style={{ border: "none", borderRadius: "8px", display: "block" }}
          title="Verifica con ProofPress"
          loading="lazy"
        />
      </div>
    </div>
  );
}
