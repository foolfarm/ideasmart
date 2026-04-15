/**
 * Admin Promo Newsletter — Prompt Collection 2026
 * Invia la newsletter pubblicitaria a tutti gli iscritti attivi
 * Mittente: ProofPress Business (noreply@proofpress.biz)
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { useLocation } from "wouter";
import AdminHeader from "@/components/AdminHeader";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
const C = {
  bg: "#f5f5f7",
  white: "#ffffff",
  black: "#1d1d1f",
  mid: "#6e6e73",
  light: "#aeaeb2",
  border: "#e5e5ea",
  gold: "#b59457",
  red: "#dc2626",
  green: "#16a34a",
};

export default function AdminPromoNewsletter() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  const [subject, setSubject] = useState("99 prompt curati per lavorare meglio con l'AI");
  const [testEmail, setTestEmail] = useState("");
  const [result, setResult] = useState<{ sent: number; errors?: number; total?: number } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const sendMutation = trpc.adminTools.sendPromptCollectionNewsletter.useMutation({
    onSuccess: (data: { success: boolean; sent: number; errors?: number; total?: number; error?: string }) => {
      setResult(data);
      setShowConfirm(false);
      if (data.success) {
        toast.success(`✅ Inviata a ${data.sent} iscritti`);
      } else {
        toast.error("Errore durante l'invio");
      }
    },
    onError: (err: { message: string }) => {
      toast.error("Errore: " + err.message);
      setShowConfirm(false);
    },
  });

  if (loading) return null;
  if (!user || user.role !== "admin") {
    navigate("/");
    return null;
  }

  const inputStyle = {
    background: C.bg,
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    padding: "10px 14px",
    fontSize: 14,
    color: C.black,
    fontFamily: FONT,
    outline: "none",
    width: "100%",
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONT }}>
      <AdminHeader />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px" }}>

        {/* Titolo */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.gold, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
            NEWSLETTER PUBBLICITARIA
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.black, margin: 0, lineHeight: 1.2 }}>
            Prompt Collection 2026
          </h1>
          <p style={{ fontSize: 14, color: C.mid, marginTop: 8, lineHeight: 1.6 }}>
            Invia la newsletter promozionale a tutti gli iscritti attivi.<br />
            Mittente: <strong>ProofPress Business</strong> · <code style={{ fontSize: 12, background: "#f0f0f0", padding: "2px 6px", borderRadius: 4 }}>noreply@proofpress.biz</code>
          </p>
        </div>

        {/* Card oggetto */}
        <div style={{ background: C.white, borderRadius: 18, padding: 24, marginBottom: 16, border: `1px solid ${C.border}` }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.mid, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
            Oggetto email
          </label>
          <input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            style={inputStyle}
            placeholder="Oggetto della newsletter..."
          />
        </div>

        {/* Card test */}
        <div style={{ background: C.white, borderRadius: 18, padding: 24, marginBottom: 16, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.black, marginBottom: 4 }}>Invia email di test</div>
          <p style={{ fontSize: 13, color: C.mid, marginBottom: 14, lineHeight: 1.5 }}>
            Ricevi un'anteprima con il banner [TEST] prima dell'invio massivo.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={testEmail}
              onChange={e => setTestEmail(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
              placeholder="email@esempio.com"
              type="email"
            />
            <button
              onClick={() => {
                if (!testEmail) { toast.error("Inserisci un'email di test"); return; }
                sendMutation.mutate({ mode: "test", testEmail, subject });
              }}
              disabled={sendMutation.isPending}
              style={{
                background: C.black,
                color: C.white,
                border: "none",
                borderRadius: 12,
                padding: "10px 20px",
                fontSize: 14,
                fontWeight: 600,
                cursor: sendMutation.isPending ? "not-allowed" : "pointer",
                opacity: sendMutation.isPending ? 0.6 : 1,
                whiteSpace: "nowrap",
                fontFamily: FONT,
              }}
            >
              {sendMutation.isPending ? "Invio..." : "Invia test"}
            </button>
          </div>
        </div>

        {/* Anteprima template */}
        <div style={{ background: C.white, borderRadius: 18, padding: 24, marginBottom: 16, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.black, marginBottom: 12 }}>Anteprima contenuto</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "Headline", value: "99 prompt curati per lavorare meglio con l'AI" },
              { label: "Mittente", value: "ProofPress Business <noreply@proofpress.biz>" },
              { label: "Verticali inclusi", value: "Commercialisti · Studenti · Avvocati" },
              { label: "CTA principale", value: "promptcollection2026.com" },
              { label: "Prezzo per verticale", value: "€29 per verticale" },
              { label: "Footer", value: "Unsubscribe + Privacy Policy" },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: C.bg, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.light, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 13, color: C.black, lineHeight: 1.4 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Invio massivo */}
        <div style={{ background: C.white, borderRadius: 18, padding: 24, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.black, marginBottom: 4 }}>Invio massivo a tutti gli iscritti</div>
          <p style={{ fontSize: 13, color: C.mid, marginBottom: 16, lineHeight: 1.5 }}>
            La newsletter verrà inviata a <strong>tutti gli iscritti attivi</strong> con link di disiscrizione personalizzato. L'operazione non è reversibile.
          </p>

          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              style={{
                background: C.gold,
                color: C.white,
                border: "none",
                borderRadius: 12,
                padding: "12px 28px",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: FONT,
              }}
            >
              Invia a tutti gli iscritti →
            </button>
          ) : (
            <div style={{ background: "#fff8f0", border: `1px solid ${C.gold}`, borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.black, marginBottom: 8 }}>
                ⚠️ Conferma invio massivo
              </div>
              <p style={{ fontSize: 13, color: C.mid, marginBottom: 16, lineHeight: 1.5 }}>
                Stai per inviare la newsletter <strong>Prompt Collection 2026</strong> a tutti gli iscritti attivi. Questa azione non può essere annullata.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => sendMutation.mutate({ mode: "full", subject })}
                  disabled={sendMutation.isPending}
                  style={{
                    background: C.gold,
                    color: C.white,
                    border: "none",
                    borderRadius: 10,
                    padding: "10px 24px",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: sendMutation.isPending ? "not-allowed" : "pointer",
                    opacity: sendMutation.isPending ? 0.6 : 1,
                    fontFamily: FONT,
                  }}
                >
                  {sendMutation.isPending ? "Invio in corso..." : "Sì, invia ora"}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  style={{
                    background: "transparent",
                    color: C.mid,
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    padding: "10px 20px",
                    fontSize: 14,
                    cursor: "pointer",
                    fontFamily: FONT,
                  }}
                >
                  Annulla
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Risultato */}
        {result && (
          <div style={{
            marginTop: 16,
            background: result.errors && result.errors > 0 ? "#fff8f0" : "#f0fdf4",
            border: `1px solid ${result.errors && result.errors > 0 ? C.gold : "#86efac"}`,
            borderRadius: 14,
            padding: 20,
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.black, marginBottom: 8 }}>
              {result.errors && result.errors > 0 ? "⚠️ Invio completato con errori" : "✅ Invio completato"}
            </div>
            <div style={{ display: "flex", gap: 24 }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: C.green }}>{result.sent}</div>
                <div style={{ fontSize: 12, color: C.mid, textTransform: "uppercase", letterSpacing: "0.08em" }}>Inviate</div>
              </div>
              {result.errors !== undefined && result.errors > 0 && (
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: C.red }}>{result.errors}</div>
                  <div style={{ fontSize: 12, color: C.mid, textTransform: "uppercase", letterSpacing: "0.08em" }}>Errori</div>
                </div>
              )}
              {result.total !== undefined && (
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: C.black }}>{result.total}</div>
                  <div style={{ fontSize: 12, color: C.mid, textTransform: "uppercase", letterSpacing: "0.08em" }}>Totale iscritti</div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
