/**
 * PromoBanners — 2 banner promozionali ProofPress Creator
 *
 * UTILIZZO:
 *   import { PromoBannerCreiamo, PromoBannerApri } from "@/components/PromoBanners";
 *
 *   // Banner orizzontale full-width (ideale tra sezioni)
 *   <PromoBannerCreiamo />
 *
 *   // Banner orizzontale full-width (ideale a fine pagina o sidebar)
 *   <PromoBannerApri />
 *
 *   // Coppia affiancata (2 colonne)
 *   <PromoBannerPair />
 *
 * Entrambi linkano a https://proofpress.ai/offertacommerciale
 * Design: chiaro, editoriale, coerente con il sistema tipografico SF Pro del sito.
 */

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
const TARGET_URL = "https://proofpress.ai/offertacommerciale";

// ─── Banner 1 — "Creiamo Giornali AI per te" ─────────────────────────────────
export function PromoBannerCreiamo() {
  return (
    <a
      href={TARGET_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full no-underline group"
      style={{ textDecoration: "none" }}
      aria-label="Creiamo Giornali AI per te — scopri l'offerta ProofPress"
    >
      <div
        className="relative w-full overflow-hidden rounded-2xl"
        style={{
          background: "linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 40%, #fef3e2 100%)",
          border: "1.5px solid rgba(26,26,46,0.10)",
          padding: "20px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          transition: "box-shadow 0.2s ease, border-color 0.2s ease",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(26,26,46,0.12)";
          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(26,26,46,0.22)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(26,26,46,0.10)";
        }}
      >
        {/* Icona decorativa */}
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-xl"
          style={{
            width: 48,
            height: 48,
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            fontSize: 22,
          }}
        >
          🗞️
        </div>

        {/* Testo principale */}
        <div className="flex-1 min-w-0">
          <p
            style={{
              fontFamily: SF,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#6e6e73",
              marginBottom: "3px",
            }}
          >
            ProofPress Creator
          </p>
          <p
            style={{
              fontFamily: SF,
              fontSize: "20px",
              fontWeight: 800,
              color: "#1a1a2e",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            Creiamo Giornali AI{" "}
            <span style={{ color: "#ff5500" }}>per te</span>
          </p>
          <p
            style={{
              fontFamily: SF,
              fontSize: "12px",
              color: "#6e6e73",
              marginTop: "4px",
              lineHeight: 1.4,
            }}
          >
            Testata AI-native chiavi in mano — contenuti verificati, pubblicazione automatica, brand editoriale.
          </p>
        </div>

        {/* CTA */}
        <div
          className="flex-shrink-0 flex items-center gap-2 rounded-xl px-5 py-2.5 group-hover:opacity-90 transition-opacity"
          style={{
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            fontFamily: SF,
            fontSize: "13px",
            fontWeight: 700,
            color: "#fff",
            whiteSpace: "nowrap",
            letterSpacing: "0.01em",
          }}
        >
          Scopri l'offerta →
        </div>
      </div>
    </a>
  );
}

// ─── Banner 2 — "Apri un tuo Giornale AI" ────────────────────────────────────
export function PromoBannerApri() {
  return (
    <a
      href={TARGET_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full no-underline group"
      style={{ textDecoration: "none" }}
      aria-label="Apri un tuo Giornale AI — scopri l'offerta ProofPress"
    >
      <div
        className="relative w-full overflow-hidden rounded-2xl"
        style={{
          background: "linear-gradient(135deg, #fff8f0 0%, #fff3e0 40%, #fce4ec 100%)",
          border: "1.5px solid rgba(255,85,0,0.15)",
          padding: "20px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          transition: "box-shadow 0.2s ease, border-color 0.2s ease",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(255,85,0,0.12)";
          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,85,0,0.30)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,85,0,0.15)";
        }}
      >
        {/* Icona decorativa */}
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-xl"
          style={{
            width: 48,
            height: 48,
            background: "linear-gradient(135deg, #ff5500 0%, #ff8c00 100%)",
            fontSize: 22,
          }}
        >
          🚀
        </div>

        {/* Testo principale */}
        <div className="flex-1 min-w-0">
          <p
            style={{
              fontFamily: SF,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#ff5500",
              marginBottom: "3px",
            }}
          >
            Lancia la tua testata
          </p>
          <p
            style={{
              fontFamily: SF,
              fontSize: "20px",
              fontWeight: 800,
              color: "#1a1a2e",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            Apri un tuo{" "}
            <span style={{ color: "#ff5500" }}>Giornale AI</span>
          </p>
          <p
            style={{
              fontFamily: SF,
              fontSize: "12px",
              color: "#6e6e73",
              marginTop: "4px",
              lineHeight: 1.4,
            }}
          >
            Diventa editore AI-native in 30 giorni. Contenuti verificati, audience building, monetizzazione inclusa.
          </p>
        </div>

        {/* CTA */}
        <div
          className="flex-shrink-0 flex items-center gap-2 rounded-xl px-5 py-2.5 group-hover:opacity-90 transition-opacity"
          style={{
            background: "linear-gradient(135deg, #ff5500 0%, #ff8c00 100%)",
            fontFamily: SF,
            fontSize: "13px",
            fontWeight: 700,
            color: "#fff",
            whiteSpace: "nowrap",
            letterSpacing: "0.01em",
          }}
        >
          Inizia ora →
        </div>
      </div>
    </a>
  );
}

// ─── Coppia affiancata (2 colonne su desktop, stack su mobile) ────────────────
export function PromoBannerPair() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      <PromoBannerCreiamo />
      <PromoBannerApri />
    </div>
  );
}

// Export default: la coppia
export default PromoBannerPair;
