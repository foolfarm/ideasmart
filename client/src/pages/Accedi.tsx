/**
 * Pagina /accedi — form di login nativo IdeaSmart
 */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import SEOHead from "@/components/SEOHead";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
const SF_DISPLAY = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";

function Divider({ thick = false }: { thick?: boolean }) {
  return <div style={{ height: thick ? "2px" : "1px", background: "#1a1a1a", opacity: thick ? 1 : 0.12 }} />;
}

export default function Accedi() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldError, setFieldError] = useState<string | null>(null);

  // Leggi il returnTo dall'URL se presente
  const params = new URLSearchParams(window.location.search);
  const returnTo = params.get("returnTo") || "/";

  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldError(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: form.email.trim(), password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFieldError(data.error || "Errore durante il login.");
      } else {
        // Forza un reload completo per aggiornare lo stato auth
        window.location.href = returnTo;
      }
    } catch {
      setFieldError("Errore di rete. Riprova.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <SEOHead
        title="Accedi — Proof Press"
        description="Accedi al tuo account Proof Press per leggere tutte le analisi su AI, Startup e Venture Capital."
        canonical="https://ideasmart.biz/accedi"
        ogSiteName="Proof Press"
      />
      <div className="min-h-screen" style={{ background: "#faf8f3", color: "#1a1a1a" }}>
        <SharedPageHeader />

        <main className="max-w-[480px] mx-auto px-4 py-16">
          <div className="mb-8">
            <p className="text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: "rgba(26,26,26,0.4)", fontFamily: SF }}>
              Area riservata
            </p>
            <Divider thick />
            <h1 className="text-3xl font-black mt-4 mb-1" style={{ fontFamily: SF_DISPLAY, letterSpacing: "-0.02em" }}>
              Accedi
            </h1>
            <p className="text-sm" style={{ color: "rgba(26,26,26,0.55)", fontFamily: SF }}>
              Inserisci email e password per accedere a tutte le analisi e ricerche.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "rgba(26,26,26,0.5)", fontFamily: SF }}>
                Email
              </label>
              <input
                type="email"
                required
                placeholder="la-tua@email.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-4 py-3 text-sm border border-[#1a1a1a]/20 bg-white focus:outline-none focus:border-[#1a1a1a] transition-colors"
                style={{ fontFamily: SF }}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "rgba(26,26,26,0.5)", fontFamily: SF }}>
                Password
              </label>
              <input
                type="password"
                required
                placeholder="La tua password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full px-4 py-3 text-sm border border-[#1a1a1a]/20 bg-white focus:outline-none focus:border-[#1a1a1a] transition-colors"
                style={{ fontFamily: SF }}
              />
            </div>

            {/* Errore */}
            {fieldError && (
              <div className="px-4 py-3 text-sm border border-[#1a1a1a]/30 bg-[#1a1a1a]/5" style={{ fontFamily: SF }}>
                {fieldError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: "#1a1a1a", color: "#ffffff", fontFamily: SF }}
            >
              {isLoading ? "Accesso in corso..." : "Accedi →"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#1a1a1a]/10 text-center">
            <p className="text-xs" style={{ color: "rgba(26,26,26,0.45)", fontFamily: SF }}>
              Non hai ancora un account?{" "}
              <Link href="/registrati">
                <span className="underline cursor-pointer hover:opacity-70">Registrati gratis</span>
              </Link>
            </p>
          </div>
        </main>

        <SharedPageFooter />
      </div>
    </>
  );
}
