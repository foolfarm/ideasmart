/**
 * Pagina /verifica-email — verifica il token ricevuto via email
 * Legge ?token=... dall'URL e chiama trpc.siteAuth.verifyEmail
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
const SF_DISPLAY = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";

export default function VerificaEmail() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";

  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [username, setUsername] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const verifyMutation = trpc.siteAuth.verifyEmail.useMutation({
    onSuccess: (data) => {
      setUsername(data.username);
      setStatus("ok");
    },
    onError: (err) => {
      setErrorMsg(err.message);
      setStatus("error");
    },
  });

  useEffect(() => {
    if (!token) {
      setErrorMsg("Token mancante. Usa il link che ti abbiamo inviato via email.");
      setStatus("error");
      return;
    }
    verifyMutation.mutate({ token });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen" style={{ background: "#faf8f3", color: "#1a1a1a" }}>
      <SharedPageHeader />

      <main className="max-w-[480px] mx-auto px-4 py-20 text-center">
        {status === "loading" && (
          <>
            <div className="w-8 h-8 border-2 border-[#1a1a1a]/20 border-t-[#1a1a1a] rounded-full animate-spin mx-auto mb-6" />
            <p className="text-sm" style={{ color: "rgba(26,26,26,0.5)", fontFamily: SF }}>
              Verifica in corso…
            </p>
          </>
        )}

        {status === "ok" && (
          <>
            <div className="text-5xl mb-6">✅</div>
            <h1 className="text-2xl font-black mb-3" style={{ fontFamily: SF_DISPLAY, letterSpacing: "-0.02em" }}>
              Email confermata!
            </h1>
            <p className="text-sm mb-8" style={{ color: "rgba(26,26,26,0.6)", fontFamily: SF }}>
              Benvenuto, <strong>{username}</strong>. Il tuo account è attivo.<br />
              Puoi ora accedere a tutte le analisi, ricerche e news di Proof Press.
            </p>
            <Link href="/accedi">
              <button
                className="px-8 py-3.5 text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
                style={{ background: "#1a1a1a", color: "#ffffff", fontFamily: SF }}
              >
                Accedi ora →
              </button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-5xl mb-6">⚠️</div>
            <h1 className="text-2xl font-black mb-3" style={{ fontFamily: SF_DISPLAY, letterSpacing: "-0.02em" }}>
              Link non valido
            </h1>
            <p className="text-sm mb-8" style={{ color: "rgba(26,26,26,0.6)", fontFamily: SF }}>
              {errorMsg}
            </p>
            <Link href="/registrati">
              <button
                className="px-8 py-3.5 text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
                style={{ background: "#1a1a1a", color: "#ffffff", fontFamily: SF }}
              >
                Registrati di nuovo →
              </button>
            </Link>
          </>
        )}
      </main>

      <SharedPageFooter />
    </div>
  );
}
