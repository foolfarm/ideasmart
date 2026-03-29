/**
 * CookieBanner — Banner GDPR con pannello preferenze per categoria
 * Design: stile chiaro IDEASMART, posizionato in basso a sinistra
 */
import { useState } from "react";
import { useCookieConsent } from "@/hooks/useCookieConsent";

// ── Toggle switch ────────────────────────────────────────────────────────────
function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className="relative inline-flex items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2"
      style={{
        width: 44,
        height: 24,
        background: checked ? "#1a1a1a" : "#d1d5db",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        flexShrink: 0,
      }}
    >
      <span
        className="inline-block rounded-full bg-white shadow transition-transform"
        style={{
          width: 18,
          height: 18,
          transform: checked ? "translateX(22px)" : "translateX(3px)",
        }}
      />
    </button>
  );
}

// ── Categoria row ────────────────────────────────────────────────────────────
function CategoryRow({
  title,
  description,
  examples,
  checked,
  onChange,
  disabled = false,
}: {
  title: string;
  description: string;
  examples: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className="flex items-start gap-4 py-4 border-b last:border-0"
      style={{ borderColor: "#e2e5ed" }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-sm font-bold"
            style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
          >
            {title}
          </span>
          {disabled && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-bold"
              style={{ background: "rgba(0,180,160,0.12)", color: "#1a1a1a" }}
            >
              Sempre attivi
            </span>
          )}
        </div>
        <p
          className="text-xs leading-relaxed mb-1"
          style={{ color: "#6b7280", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
        >
          {description}
        </p>
        <p
          className="text-xs"
          style={{ color: "#9ca3af", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
        >
          <strong>Esempi:</strong> {examples}
        </p>
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

// ── Componente principale ────────────────────────────────────────────────────
export default function CookieBanner() {
  const { hasDecided, acceptAll, rejectAll, saveCustom } = useCookieConsent();
  const [showPanel, setShowPanel] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [advertising, setAdvertising] = useState(false);

  // Non mostrare se l'utente ha già scelto
  if (hasDecided) return null;

  return (
    <>
      {/* Overlay scuro quando il pannello è aperto */}
      {showPanel && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}
          onClick={() => setShowPanel(false)}
        />
      )}

      {/* ── Pannello preferenze ────────────────────────────────────────────── */}
      {showPanel && (
        <div
          className="fixed inset-x-0 bottom-0 z-50 sm:inset-auto sm:bottom-6 sm:left-6 sm:max-w-md w-full rounded-t-2xl sm:rounded-2xl shadow-2xl border overflow-hidden"
          style={{ background: "#ffffff", borderColor: "#e2e5ed" }}
        >
          {/* Header pannello */}
          <div
            className="px-6 py-4 border-b flex items-center justify-between"
            style={{ background: "#1a1a1a", borderColor: "#2d3748" }}
          >
            <div>
              <h2
                className="text-base font-black text-white"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              >
                IDEA<span style={{ color: "#1a1a1a" }}>SMART</span> — Preferenze Cookie
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                Scegli quali cookie accettare
              </p>
            </div>
            <button
              onClick={() => setShowPanel(false)}
              className="text-white/40 hover:text-white transition-colors text-xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Corpo */}
          <div className="px-6 py-2 max-h-96 overflow-y-auto">
            <CategoryRow
              title="Cookie Tecnici"
              description="Necessari per il funzionamento del sito. Non possono essere disattivati perché il sito non funzionerebbe senza di essi."
              examples="Sessione utente, preferenze di navigazione, sicurezza CSRF"
              checked={true}
              onChange={() => {}}
              disabled={true}
            />
            <CategoryRow
              title="Cookie Analitici"
              description="Ci aiutano a capire come i visitatori interagiscono con il sito raccogliendo informazioni in forma anonima e aggregata."
              examples="Google Analytics (anonimizzato), statistiche di navigazione"
              checked={analytics}
              onChange={setAnalytics}
            />
            <CategoryRow
              title="Cookie di Profilazione"
              description="Utilizzati per tracciare le preferenze di navigazione e personalizzare i contenuti in base ai tuoi interessi."
              examples="Cookie di sessione estesa, preferenze contenuti, personalizzazione newsletter"
              checked={advertising}
              onChange={setAdvertising}
            />
          </div>

          {/* Footer pannello */}
          <div
            className="px-6 py-4 border-t flex flex-col sm:flex-row gap-3"
            style={{ borderColor: "#e2e5ed", background: "#f8fafc" }}
          >
            <button
              onClick={() => saveCustom({ analytics, advertising })}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors"
              style={{
                borderColor: "#1a1a1a",
                color: "#1a1a1a",
                background: "transparent",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              Salva preferenze
            </button>
            <button
              onClick={acceptAll}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors"
              style={{
                background: "#1a1a1a",
                color: "#ffffff",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              Accetta tutti
            </button>
          </div>

          {/* Link privacy */}
          <div className="px-6 pb-4 text-center">
            <a
              href="/privacy"
              className="text-xs underline"
              style={{ color: "#9ca3af", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
            >
              Leggi la Privacy Policy & Disclaimer completa
            </a>
          </div>
        </div>
      )}

      {/* ── Banner principale (quando il pannello è chiuso) ─────────────────── */}
      {!showPanel && (
        <div
          className="fixed inset-x-0 bottom-0 z-50 sm:inset-auto sm:bottom-6 sm:left-6 sm:max-w-md w-full rounded-t-2xl sm:rounded-2xl shadow-2xl border"
          style={{ background: "#ffffff", borderColor: "#e2e5ed" }}
        >
          {/* Striscia teal in cima */}
          <div style={{ height: 3, background: "#1a1a1a", borderRadius: "12px 12px 0 0" }} />

          <div className="px-5 py-5">
            {/* Titolo */}
            <div className="flex items-start gap-3 mb-3">
              <span className="text-xl">🍪</span>
              <div>
                <h3
                  className="text-sm font-black mb-1"
                  style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                >
                  Utilizziamo i cookie
                </h3>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "#6b7280", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                >
                  Usiamo cookie tecnici (necessari), analitici e di profilazione per migliorare la tua esperienza e personalizzare i contenuti. Puoi scegliere quali accettare.{" "}
                  <a href="/privacy" style={{ color: "#1a1a1a", textDecoration: "underline" }}>
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>

            {/* Pulsanti */}
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <button
                onClick={rejectAll}
                className="flex-1 py-2 rounded-xl text-xs font-bold border transition-colors"
                style={{
                  borderColor: "#d1d5db",
                  color: "#6b7280",
                  background: "transparent",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                Rifiuta tutti
              </button>
              <button
                onClick={() => setShowPanel(true)}
                className="flex-1 py-2 rounded-xl text-xs font-bold border transition-colors"
                style={{
                  borderColor: "#1a1a1a",
                  color: "#1a1a1a",
                  background: "transparent",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                Personalizza
              </button>
              <button
                onClick={acceptAll}
                className="flex-1 py-2 rounded-xl text-xs font-bold transition-colors"
                style={{
                  background: "#1a1a1a",
                  color: "#ffffff",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                Accetta tutti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
