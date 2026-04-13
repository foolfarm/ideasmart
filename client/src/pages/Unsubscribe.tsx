/**
 * ProofPress — Pagina di Disiscrizione Newsletter
 * GDPR-compliant: accetta token univoco via URL query param
 * FALLBACK: se non c'è token, mostra form email per disiscrizione manuale
 * URL: /unsubscribe?token=<hex_token>
 * URL fallback: /unsubscribe (mostra form email)
 */
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

type Step = "loading" | "confirm" | "email-form" | "email-confirm" | "success" | "already" | "error";

export default function Unsubscribe() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>("loading");
  const [email, setEmail] = useState<string>("");
  const [emailInput, setEmailInput] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Estrai il token dall'URL
  const token = new URLSearchParams(window.location.search).get("token") ?? "";

  // Query per recuperare l'email associata al token
  const tokenQuery = trpc.newsletter.getByToken.useQuery(
    { token },
    {
      enabled: token.length >= 10,
      retry: false,
    }
  );

  // Mutation per la disiscrizione via token
  const unsubMutation = trpc.newsletter.unsubscribeByToken.useMutation({
    onSuccess: (data) => {
      setEmail(data.email ?? email);
      setStep("success");
    },
    onError: (err) => {
      setErrorMsg(err.message);
      setStep("error");
    },
  });

  // Mutation per la disiscrizione via email diretta
  const unsubByEmailMutation = trpc.newsletter.unsubscribe.useMutation({
    onSuccess: () => {
      setStep("success");
    },
    onError: (err) => {
      setErrorMsg(err.message);
      setStep("error");
    },
  });

  useEffect(() => {
    // Se non c'è token → mostra form email
    if (!token || token.length < 10) {
      setStep("email-form");
      return;
    }

    if (tokenQuery.isLoading) return;

    if (tokenQuery.error || !tokenQuery.data) {
      // Token invalido → mostra form email come fallback
      setStep("email-form");
      return;
    }

    const sub = tokenQuery.data;
    setEmail(sub.email);

    if (sub.status === "unsubscribed") {
      setStep("already");
    } else {
      setStep("confirm");
    }
  }, [tokenQuery.isLoading, tokenQuery.data, tokenQuery.error, token]);

  const handleUnsubscribeByToken = () => {
    if (!token) return;
    setStep("loading");
    unsubMutation.mutate({ token });
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) return;
    setEmail(trimmed);
    setStep("email-confirm");
  };

  const handleUnsubscribeByEmail = () => {
    if (!email) return;
    setStep("loading");
    unsubByEmailMutation.mutate({ email });
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "#f8f9fa", fontFamily: SF }}
    >
      {/* Logo */}
      <div className="mb-10 text-center">
        <button
          onClick={() => navigate("/")}
          className="text-2xl font-black tracking-tight"
          style={{ fontFamily: SF, color: "#0f0f0f", background: "none", border: "none", cursor: "pointer" }}
        >
          Proof<span style={{ color: "#6e6e73" }}>Press</span>
        </button>
        <p className="text-xs uppercase tracking-widest mt-1" style={{ color: "#6b7280" }}>
          AI Business Intelligence
        </p>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-md rounded-2xl p-8 shadow-sm"
        style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
      >
        {/* Loading */}
        {step === "loading" && (
          <div className="text-center py-8">
            <div
              className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
              style={{ borderColor: "#1a1a1a", borderTopColor: "transparent" }}
            />
            <p className="text-sm" style={{ color: "#6b7280" }}>Elaborazione in corso...</p>
          </div>
        )}

        {/* Form Email (fallback senza token) */}
        {step === "email-form" && (
          <div>
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: "#f3f4f6" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold mb-2 text-center" style={{ color: "#0f0f0f", fontFamily: SF }}>
              Annulla iscrizione
            </h1>
            <p className="text-sm mb-6 text-center" style={{ color: "#6b7280", lineHeight: "1.6" }}>
              Inserisci l'indirizzo email con cui sei iscritto alla newsletter Proof Press per procedere con la disiscrizione.
            </p>
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="la-tua@email.com"
                required
                className="w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all"
                style={{
                  border: "1px solid #d1d5db",
                  fontFamily: SF,
                  color: "#0f0f0f",
                  background: "#fff",
                }}
                onFocus={(e) => e.target.style.borderColor = "#1a1a1a"}
                onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
              />
              <button
                type="submit"
                className="w-full py-3 rounded-xl text-sm font-bold transition-all"
                style={{ background: "#1a1a1a", color: "#ffffff", fontFamily: SF }}
              >
                Continua →
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full py-3 rounded-xl text-sm font-medium transition-all"
                style={{ background: "#f3f4f6", color: "#374151" }}
              >
                Annulla
              </button>
            </form>
          </div>
        )}

        {/* Conferma disiscrizione via email */}
        {step === "email-confirm" && (
          <div className="text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: "#fff3f0" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2a2a2a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1 className="text-xl font-bold mb-2" style={{ color: "#0f0f0f", fontFamily: SF }}>
              Conferma disiscrizione
            </h1>
            <p className="text-sm mb-1" style={{ color: "#6b7280" }}>
              Stai per annullare l'iscrizione per:
            </p>
            <p className="text-base font-semibold mb-6" style={{ color: "#0f0f0f" }}>
              {email}
            </p>
            <p className="text-xs mb-8" style={{ color: "#9ca3af", lineHeight: "1.6" }}>
              Non riceverai più la newsletter Proof Press Daily. Puoi reiscriverti in qualsiasi momento dalla home page.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleUnsubscribeByEmail}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all"
                style={{ background: "#1a1a1a", color: "#ffffff", fontFamily: SF }}
              >
                Sì, annulla la mia iscrizione
              </button>
              <button
                onClick={() => setStep("email-form")}
                className="w-full py-3 rounded-xl text-sm font-medium transition-all"
                style={{ background: "#f3f4f6", color: "#374151" }}
              >
                ← Modifica email
              </button>
            </div>
          </div>
        )}

        {/* Confirm (con token) */}
        {step === "confirm" && (
          <div className="text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: "#fff3f0" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2a2a2a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1 className="text-xl font-bold mb-2" style={{ color: "#0f0f0f", fontFamily: SF }}>
              Annulla iscrizione
            </h1>
            <p className="text-sm mb-1" style={{ color: "#6b7280" }}>
              Stai per annullare l'iscrizione alla newsletter Proof Press per:
            </p>
            <p className="text-base font-semibold mb-6" style={{ color: "#0f0f0f" }}>
              {email}
            </p>
            <p className="text-xs mb-8" style={{ color: "#9ca3af", lineHeight: "1.6" }}>
              Non riceverai più la nostra newsletter con le ultime notizie sull'AI e le migliori startup italiane. Puoi reiscriverti in qualsiasi momento dalla home page.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleUnsubscribeByToken}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all"
                style={{ background: "#1a1a1a", color: "#ffffff", fontFamily: SF }}
              >
                Sì, annulla la mia iscrizione
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full py-3 rounded-xl text-sm font-medium transition-all"
                style={{ background: "#f3f4f6", color: "#374151" }}
              >
                No, voglio restare iscritto
              </button>
            </div>
          </div>
        )}

        {/* Success */}
        {step === "success" && (
          <div className="text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: "#f0fdf4" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold mb-2" style={{ color: "#0f0f0f", fontFamily: SF }}>
              Iscrizione annullata
            </h1>
            <p className="text-sm mb-2" style={{ color: "#6b7280" }}>
              {email
                ? <>L'indirizzo <strong style={{ color: "#0f0f0f" }}>{email}</strong> è stato rimosso dalla nostra lista.</>
                : "La tua iscrizione è stata annullata con successo."
              }
            </p>
            <p className="text-xs mb-8" style={{ color: "#9ca3af", lineHeight: "1.6" }}>
              Ai sensi del GDPR (Reg. UE 2016/679), la tua richiesta è stata processata immediatamente. Non riceverai più comunicazioni da Proof Press.
            </p>
            <div
              className="rounded-xl p-4 mb-6 text-left"
              style={{ background: "#f8f9fa", border: "1px solid #e5e7eb" }}
            >
              <p className="text-xs font-semibold mb-1" style={{ color: "#374151" }}>Hai cambiato idea?</p>
              <p className="text-xs" style={{ color: "#6b7280" }}>
                Puoi reiscriverti in qualsiasi momento visitando la home page di Proof Press e inserendo la tua email nel modulo newsletter.
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="w-full py-3 rounded-xl text-sm font-bold transition-all"
              style={{ background: "#0f0f0f", color: "#ffffff", fontFamily: SF }}
            >
              Torna alla home →
            </button>
          </div>
        )}

        {/* Already unsubscribed */}
        {step === "already" && (
          <div className="text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: "#f3f4f6" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold mb-2" style={{ color: "#0f0f0f", fontFamily: SF }}>
              Già disiscritto
            </h1>
            <p className="text-sm mb-6" style={{ color: "#6b7280" }}>
              L'indirizzo <strong style={{ color: "#0f0f0f" }}>{email}</strong> è già stato rimosso dalla nostra lista in precedenza.
            </p>
            <button
              onClick={() => navigate("/")}
              className="w-full py-3 rounded-xl text-sm font-bold"
              style={{ background: "#0f0f0f", color: "#ffffff", fontFamily: SF }}
            >
              Torna alla home →
            </button>
          </div>
        )}

        {/* Error */}
        {step === "error" && (
          <div className="text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: "#fff3f0" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1 className="text-xl font-bold mb-2" style={{ color: "#0f0f0f", fontFamily: SF }}>
              Si è verificato un errore
            </h1>
            <p className="text-sm mb-4" style={{ color: "#6b7280", lineHeight: "1.6" }}>
              {errorMsg || "Non è stato possibile elaborare la tua richiesta."}
            </p>
            <p className="text-xs mb-6" style={{ color: "#9ca3af" }}>
              Riprova inserendo la tua email, oppure scrivi a{" "}
              <a href="mailto:newsletter@proofpress.ai" style={{ color: "#1a1a1a", fontWeight: 600 }}>
                newsletter@proofpress.ai
              </a>
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setStep("email-form")}
                className="w-full py-3 rounded-xl text-sm font-bold"
                style={{ background: "#1a1a1a", color: "#ffffff", fontFamily: SF }}
              >
                Riprova con la tua email
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full py-3 rounded-xl text-sm font-medium"
                style={{ background: "#f3f4f6", color: "#374151" }}
              >
                Torna alla home
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer legale */}
      <p className="mt-8 text-xs text-center" style={{ color: "#9ca3af", maxWidth: "400px", lineHeight: "1.6" }}>
        Ai sensi del Regolamento UE 2016/679 (GDPR), hai il diritto di opporti al trattamento dei tuoi dati personali per finalità di marketing diretto in qualsiasi momento.
      </p>
    </div>
  );
}
