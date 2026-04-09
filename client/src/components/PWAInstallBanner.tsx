import { usePWA } from "@/hooks/usePWA";
import { X, Download, Share } from "lucide-react";

export default function PWAInstallBanner() {
  const { showBanner, canInstall, isIOS, promptInstall, dismissBanner } = usePWA();

  if (!showBanner) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe"
      style={{
        paddingBottom: "max(16px, env(safe-area-inset-bottom))",
        animation: "slideUp 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>

      <div
        style={{
          background: "#0d1220",
          border: "1px solid rgba(0,229,200,0.25)",
          borderRadius: "16px",
          padding: "16px",
          boxShadow: "0 -4px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,229,200,0.08)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: "#0f0f0f",
            border: "1px solid rgba(0,229,200,0.20)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: "13px",
              fontWeight: 900,
              color: "#ffffff",
              fontFamily: "Georgia, 'Times New Roman', serif",
              letterSpacing: "-0.5px",
            }}
          >
            IS
          </span>
        </div>

        {/* Testo */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#ffffff",
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              marginBottom: "2px",
            }}
          >
            Aggiungi Proof Press
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.45)",
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              lineHeight: 1.4,
            }}
          >
            {isIOS
              ? "Tocca Condividi → \"Aggiungi a schermata Home\""
              : "Installa l'app per accesso rapido alle notizie"}
          </div>
        </div>

        {/* Azioni */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          {!isIOS && canInstall && (
            <button
              onClick={() => promptInstall()}
              style={{
                background: "#1a1a1a",
                color: "#0f0f0f",
                border: "none",
                borderRadius: "8px",
                padding: "8px 14px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                whiteSpace: "nowrap",
              }}
            >
              <Download size={12} />
              Installa
            </button>
          )}
          {isIOS && (
            <div
              style={{
                background: "rgba(0,229,200,0.12)",
                border: "1px solid rgba(0,229,200,0.25)",
                borderRadius: "8px",
                padding: "8px 10px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Share size={14} color="#1a1a1a" />
            </div>
          )}
          <button
            onClick={dismissBanner}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: "8px",
              padding: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={14} color="rgba(255,255,255,0.50)" />
          </button>
        </div>
      </div>
    </div>
  );
}
