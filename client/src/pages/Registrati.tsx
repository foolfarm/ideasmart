/**
 * Pagina /registrati — form di registrazione nativa IdeaSmart
 * Raccoglie: username, email, password → invia email di conferma
 */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import SEOHead from "@/components/SEOHead";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
const SF_DISPLAY = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";

function Divider({ thick = false }: { thick?: boolean }) {
  return <div style={{ height: thick ? "2px" : "1px", background: "#1a1a1a", opacity: thick ? 1 : 0.12 }} />;
}

export default function Registrati() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [done, setDone] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const registerMutation = trpc.siteAuth.register.useMutation({
    onSuccess: () => setDone(true),
    onError: (err) => setFieldError(err.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldError(null);
    if (form.password.length < 6) {
      setFieldError("La password deve essere di almeno 6 caratteri.");
      return;
    }
    registerMutation.mutate({
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
      origin: window.location.origin,
    });
  }

  return (
    <>
      <SEOHead
        title="Registrati — Proof Press"
        description="Crea il tuo account gratuito Proof Press e accedi a tutte le analisi su AI, Startup e Venture Capital."
        canonical="https://ideasmart.biz/registrati"
        ogSiteName="Proof Press"
      />
      <div className="min-h-screen" style={{ background: "#ffffff", color: "#1a1a1a" }}>
        <SharedPageHeader />

        <main className="max-w-[480px] mx-auto px-4 py-16">

          {done ? (
            /* ── Conferma inviata ── */
            <div className="text-center py-12">
              <div className="text-5xl mb-6">✉️</div>
              <h1 className="text-2xl font-black mb-4" style={{ fontFamily: SF_DISPLAY, letterSpacing: "-0.02em" }}>
                Controlla la tua email
              </h1>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(26,26,26,0.6)", fontFamily: SF }}>
                Abbiamo inviato un link di conferma a <strong>{form.email}</strong>.<br />
                Clicca il link nell'email per attivare il tuo account e iniziare a leggere.
              </p>
              <p className="text-xs" style={{ color: "rgba(26,26,26,0.4)", fontFamily: SF }}>
                Non trovi l'email? Controlla la cartella spam.
              </p>
            </div>
          ) : (
            /* ── Form registrazione ── */
            <>
              <div className="mb-8">
                <p className="text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: "rgba(26,26,26,0.4)", fontFamily: SF }}>
                  Accesso gratuito
                </p>
                <Divider thick />
                <h1 className="text-3xl font-black mt-4 mb-1" style={{ fontFamily: SF_DISPLAY, letterSpacing: "-0.02em" }}>
                  Crea il tuo account
                </h1>
                <p className="text-sm" style={{ color: "rgba(26,26,26,0.55)", fontFamily: SF }}>
                  Leggi tutte le analisi, ricerche e news su AI, Startup e Venture Capital — gratis.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "rgba(26,26,26,0.5)", fontFamily: SF }}>
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    maxLength={32}
                    placeholder="es. mario_rossi"
                    value={form.username}
                    onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                    className="w-full px-4 py-3 text-sm border border-[#1a1a1a]/20 bg-white focus:outline-none focus:border-[#1a1a1a] transition-colors"
                    style={{ fontFamily: SF }}
                  />
                  <p className="mt-1 text-[10px]" style={{ color: "rgba(26,26,26,0.35)", fontFamily: SF }}>
                    Solo lettere, numeri e underscore (3–32 caratteri)
                  </p>
                </div>

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
                    minLength={6}
                    placeholder="Minimo 6 caratteri"
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
                  disabled={registerMutation.isPending}
                  className="w-full py-3.5 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-50"
                  style={{ background: "#1a1a1a", color: "#ffffff", fontFamily: SF }}
                >
                  {registerMutation.isPending ? "Registrazione in corso..." : "Crea account gratuito →"}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-[#1a1a1a]/10 text-center">
                <p className="text-xs" style={{ color: "rgba(26,26,26,0.45)", fontFamily: SF }}>
                  Hai già un account?{" "}
                  <Link href="/accedi">
                    <span className="underline cursor-pointer hover:opacity-70">Accedi</span>
                  </Link>
                </p>
              </div>

              <p className="mt-4 text-[10px] text-center" style={{ color: "rgba(26,26,26,0.3)", fontFamily: SF }}>
                Registrandoti accetti la{" "}
                <Link href="/privacy">
                  <span className="underline cursor-pointer">Privacy Policy</span>
                </Link>{" "}
                di Proof Press.
              </p>
            </>
          )}
        </main>

        <SharedPageFooter />
      </div>
    </>
  );
}
