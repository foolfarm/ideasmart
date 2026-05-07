/**
 * Pagina /abbonamenti — Base Alpha+
 * Mostra: banner benvenuto post-checkout, stato abbonamento attivo,
 *         dettagli piano, prossimo rinnovo, storico fatture, sezione upgrade/downgrade.
 * Design: coerente con il magazine ProofPress (bianco/nero/oro #c9a227)
 */
import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import LeftSidebar from "@/components/LeftSidebar";

// ─── Piani disponibili (mirror di baseAlphaProducts.ts) ──────────────────────
const PLANS = [
  {
    id: "weekly",
    name: "Weekly Brief",
    badge: "ENTRY",
    priceLabel: "€199",
    priceMonthly: 19900,
    highlight: false,
    features: [
      "1 settore verticale",
      "Report settimanale certificato PPV",
      "Top 10 segnali pre-pubblici",
      "Trend analysis + Key takeaway",
      "Archivio 3 mesi",
    ],
  },
  {
    id: "monthly",
    name: "Monthly Intelligence",
    badge: "MOST POPULAR",
    priceLabel: "€299",
    priceMonthly: 29900,
    highlight: true,
    features: [
      "2 settori verticali",
      "Report mensile certificato PPV",
      "Analisi pre-pubblica 4.000+ fonti",
      "Mappa attori & deal flow",
      "Outlook strategico 90 giorni",
      "Archivio 12 mesi",
      "1 call di briefing mensile",
    ],
  },
  {
    id: "quarterly",
    name: "Quarterly Deep Dive",
    badge: "PREMIUM",
    priceLabel: "€499",
    priceMonthly: 49900,
    highlight: false,
    features: [
      "Settori verticali illimitati",
      "Report trimestrale certificato PPV",
      "Ricerca pre-pubblica dedicata",
      "Benchmark competitivo personalizzato",
      "Scenari strategici + raccomandazioni",
      "Archivio completo",
      "Sessioni di briefing dedicate",
      "Accesso diretto al team di analisti",
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatEur(cents: number, currency = "EUR"): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: "ATTIVO", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    trialing: { label: "TRIAL", cls: "bg-blue-100 text-blue-800 border-blue-200" },
    past_due: { label: "PAGAMENTO IN RITARDO", cls: "bg-amber-100 text-amber-800 border-amber-200" },
    cancelled: { label: "CANCELLATO", cls: "bg-red-100 text-red-800 border-red-200" },
    incomplete: { label: "INCOMPLETO", cls: "bg-zinc-100 text-zinc-600 border-zinc-200" },
    paid: { label: "PAGATA", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    open: { label: "APERTA", cls: "bg-amber-100 text-amber-800 border-amber-200" },
    void: { label: "ANNULLATA", cls: "bg-zinc-100 text-zinc-500 border-zinc-200" },
    uncollectible: { label: "IRRECUPERABILE", cls: "bg-red-100 text-red-800 border-red-200" },
  };
  const cfg = map[status] ?? { label: status.toUpperCase(), cls: "bg-zinc-100 text-zinc-600 border-zinc-200" };
  return (
    <span className={`text-[9px] font-black tracking-[0.2em] uppercase px-2 py-0.5 border rounded ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ─── Banner benvenuto post-checkout ──────────────────────────────────────────
function WelcomeBanner({ planName, onDismiss }: { planName: string; onDismiss: () => void }) {
  return (
    <div className="relative mb-8 border-2 border-[#c9a227] bg-[#fdf8ec] p-6 overflow-hidden">
      {/* Decorazione angolo */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#c9a227]/10 rounded-bl-full" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black tracking-[0.25em] uppercase text-[#c9a227] mb-1">
              Benvenuto in Base Alpha+
            </p>
            <h2 className="text-xl font-black text-[#111] mb-2">
              Abbonamento attivato con successo
            </h2>
            <p className="text-sm text-zinc-600 max-w-lg">
              Il tuo piano <strong className="text-[#111]">{planName}</strong> è ora attivo.
              Riceverai una email di conferma con tutti i dettagli. Puoi gestire il tuo abbonamento
              in qualsiasi momento da questa pagina.
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-zinc-400 hover:text-zinc-600 transition-colors p-1"
            aria-label="Chiudi"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <span className="text-[#c9a227] font-black">✓</span>
            Pagamento confermato
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <span className="text-[#c9a227] font-black">✓</span>
            Accesso immediato
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <span className="text-[#c9a227] font-black">✓</span>
            Email di conferma in arrivo
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Email lookup (per utenti non loggati) ───────────────────────────────────
function EmailLookup({ onSearch }: { onSearch: (email: string) => void }) {
  const [email, setEmail] = useState("");
  return (
    <div className="max-w-md mx-auto mt-16 px-6">
      <div className="border-2 border-zinc-200 p-8">
        <p className="text-[10px] font-black tracking-[0.25em] uppercase text-[#c9a227] mb-2">
          Accesso abbonamento
        </p>
        <h2 className="text-2xl font-black text-[#111] mb-2">Verifica il tuo abbonamento</h2>
        <p className="text-sm text-zinc-500 mb-6">
          Inserisci l'email usata al momento dell'acquisto per visualizzare lo stato del tuo abbonamento Base Alpha+.
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && email && onSearch(email)}
            placeholder="email@esempio.it"
            className="flex-1 border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:border-[#111]"
          />
          <button
            onClick={() => email && onSearch(email)}
            className="bg-[#111] text-white px-4 py-2 text-xs font-black tracking-wider uppercase hover:bg-zinc-800 transition-colors"
          >
            CERCA
          </button>
        </div>
        <p className="text-xs text-zinc-400 mt-4">
          Non hai ancora un abbonamento?{" "}
          <Link href="/base-alpha" className="text-[#c9a227] font-bold hover:underline">
            Scopri Base Alpha+
          </Link>
        </p>
      </div>
    </div>
  );
}

// ─── Subscription Card ────────────────────────────────────────────────────────
function SubscriptionCard({
  sub,
  onPortal,
  portalLoading,
}: {
  sub: NonNullable<ReturnType<typeof useSubscription>["data"]>;
  onPortal: () => void;
  portalLoading: boolean;
}) {
  const isActive = sub.status === "active" || sub.status === "trialing";

  return (
    <div className={`border-2 ${isActive ? "border-[#c9a227]" : "border-zinc-300"} p-6 mb-8`}>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-[10px] font-black tracking-[0.25em] uppercase text-[#c9a227] mb-1">
            Il tuo piano
          </p>
          <h2 className="text-2xl font-black text-[#111]">Base Alpha+ {sub.planName}</h2>
          <p className="text-sm text-zinc-500 mt-1">
            {formatEur(sub.priceMonthly, sub.currency)} / mese
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={sub.status} />
          {sub.cancelAtPeriodEnd && (
            <span className="text-[9px] font-bold tracking-wider uppercase text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              Non si rinnova
            </span>
          )}
        </div>
      </div>

      {/* Dettagli */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-zinc-50 p-3">
          <p className="text-[9px] font-black tracking-widest uppercase text-zinc-400 mb-1">Piano</p>
          <p className="text-sm font-bold text-[#111]">{sub.planName}</p>
        </div>
        <div className="bg-zinc-50 p-3">
          <p className="text-[9px] font-black tracking-widest uppercase text-zinc-400 mb-1">Stato</p>
          <p className="text-sm font-bold text-[#111] capitalize">{sub.status}</p>
        </div>
        <div className="bg-zinc-50 p-3">
          <p className="text-[9px] font-black tracking-widest uppercase text-zinc-400 mb-1">Periodo attivo</p>
          <p className="text-sm font-bold text-[#111]">{formatDate(sub.currentPeriodStart)}</p>
        </div>
        <div className="bg-zinc-50 p-3">
          <p className="text-[9px] font-black tracking-widest uppercase text-zinc-400 mb-1">
            {sub.cancelAtPeriodEnd ? "Scade il" : "Prossimo rinnovo"}
          </p>
          <p className={`text-sm font-bold ${sub.cancelAtPeriodEnd ? "text-amber-600" : "text-[#111]"}`}>
            {formatDate(sub.currentPeriodEnd)}
          </p>
        </div>
      </div>

      {/* Features */}
      {sub.planFeatures.length > 0 && (
        <div className="mb-6">
          <p className="text-[9px] font-black tracking-widest uppercase text-zinc-400 mb-3">Incluso nel piano</p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
            {sub.planFeatures.map((f: string) => (
              <li key={f} className="flex items-start gap-2 text-sm text-zinc-700">
                <span className="text-[#c9a227] font-black flex-shrink-0 mt-0.5">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-zinc-100">
        <button
          onClick={onPortal}
          disabled={portalLoading}
          className="bg-[#111] text-white px-5 py-2.5 text-xs font-black tracking-wider uppercase hover:bg-zinc-800 transition-colors disabled:opacity-60"
        >
          {portalLoading ? "CARICAMENTO..." : "GESTISCI ABBONAMENTO"}
        </button>
        <Link
          href="/base-alpha"
          className="border border-zinc-300 text-zinc-700 px-5 py-2.5 text-xs font-black tracking-wider uppercase hover:border-zinc-600 transition-colors"
        >
          SCOPRI I PIANI
        </Link>
      </div>
    </div>
  );
}

// ─── Sezione Upgrade / Downgrade ─────────────────────────────────────────────
function UpgradeSection({
  currentPlanId,
  onPortal,
  portalLoading,
}: {
  currentPlanId: string;
  onPortal: () => void;
  portalLoading: boolean;
}) {
  const otherPlans = PLANS.filter((p) => p.id !== currentPlanId);
  const currentPlanIndex = PLANS.findIndex((p) => p.id === currentPlanId);

  return (
    <div className="mt-10">
      <div className="mb-5">
        <p className="text-[10px] font-black tracking-[0.25em] uppercase text-[#c9a227] mb-0.5">
          Cambia piano
        </p>
        <h3 className="text-xl font-black text-[#111]">Upgrade o Downgrade</h3>
        <p className="text-sm text-zinc-500 mt-1">
          Passa a un piano diverso in qualsiasi momento. Il cambio è immediato e il costo viene
          calcolato proporzionalmente al periodo rimanente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {otherPlans.map((plan) => {
          const planIndex = PLANS.findIndex((p) => p.id === plan.id);
          const isUpgrade = planIndex > currentPlanIndex;
          return (
            <div
              key={plan.id}
              className={`border p-5 relative ${plan.highlight ? "border-[#c9a227]" : "border-zinc-200"} hover:border-zinc-400 transition-colors`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-4">
                  <span className="bg-[#c9a227] text-black text-[9px] font-black tracking-widest uppercase px-2 py-0.5">
                    {plan.badge}
                  </span>
                </div>
              )}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 ${isUpgrade ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
                      {isUpgrade ? "UPGRADE" : "DOWNGRADE"}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-[#111]">{plan.name}</h4>
                  <p className="text-lg font-black text-[#111] mt-0.5">
                    {plan.priceLabel}
                    <span className="text-xs font-normal text-zinc-400">/mese</span>
                  </p>
                </div>
              </div>
              <ul className="space-y-1 mb-4">
                {plan.features.slice(0, 4).map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-zinc-600">
                    <span className="text-[#c9a227] font-black flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
                {plan.features.length > 4 && (
                  <li className="text-xs text-zinc-400 pl-4">+{plan.features.length - 4} altri benefici</li>
                )}
              </ul>
              <button
                onClick={onPortal}
                disabled={portalLoading}
                className={`w-full py-2 text-xs font-black tracking-wider uppercase transition-colors disabled:opacity-60 ${
                  isUpgrade
                    ? "bg-[#c9a227] text-black hover:bg-[#b8911f]"
                    : "border border-zinc-300 text-zinc-600 hover:border-zinc-500"
                }`}
              >
                {portalLoading ? "CARICAMENTO..." : isUpgrade ? `PASSA A ${plan.name.toUpperCase()}` : `CAMBIA A ${plan.name.toUpperCase()}`}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-zinc-400 mt-4">
        Il cambio piano avviene tramite il portale Stripe. Potrai confermare o annullare prima di procedere.
      </p>
    </div>
  );
}

// ─── Invoices Table ───────────────────────────────────────────────────────────
function InvoicesTable({ invoices }: { invoices: InvoiceItem[] }) {
  if (invoices.length === 0) {
    return (
      <div className="border border-zinc-200 p-8 text-center">
        <p className="text-sm text-zinc-400">Nessuna fattura disponibile.</p>
      </div>
    );
  }

  return (
    <div className="border border-zinc-200 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-zinc-50 border-b border-zinc-200">
            <th className="text-left px-4 py-3 text-[9px] font-black tracking-[0.2em] uppercase text-zinc-500">Fattura</th>
            <th className="text-left px-4 py-3 text-[9px] font-black tracking-[0.2em] uppercase text-zinc-500">Data</th>
            <th className="text-left px-4 py-3 text-[9px] font-black tracking-[0.2em] uppercase text-zinc-500">Periodo</th>
            <th className="text-right px-4 py-3 text-[9px] font-black tracking-[0.2em] uppercase text-zinc-500">Importo</th>
            <th className="text-center px-4 py-3 text-[9px] font-black tracking-[0.2em] uppercase text-zinc-500">Stato</th>
            <th className="text-center px-4 py-3 text-[9px] font-black tracking-[0.2em] uppercase text-zinc-500">PDF</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv, i) => (
            <tr key={inv.id} className={`border-b border-zinc-100 hover:bg-zinc-50 transition-colors ${i % 2 === 0 ? "" : "bg-zinc-50/40"}`}>
              <td className="px-4 py-3 font-mono text-xs text-zinc-600">
                {inv.number ?? inv.id.slice(-8).toUpperCase()}
              </td>
              <td className="px-4 py-3 text-zinc-700">{formatDate(inv.created)}</td>
              <td className="px-4 py-3 text-zinc-500 text-xs">
                {inv.periodStart && inv.periodEnd
                  ? `${formatDate(inv.periodStart)} — ${formatDate(inv.periodEnd)}`
                  : "—"}
              </td>
              <td className="px-4 py-3 text-right font-bold text-[#111]">
                {formatEur(inv.amountPaid || inv.amountDue, inv.currency)}
              </td>
              <td className="px-4 py-3 text-center">
                <StatusBadge status={inv.status ?? "open"} />
              </td>
              <td className="px-4 py-3 text-center">
                {inv.pdfUrl ? (
                  <a
                    href={inv.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#c9a227] hover:text-[#b8911f] font-bold text-xs transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    PDF
                  </a>
                ) : (
                  <span className="text-zinc-300 text-xs">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
type InvoiceItem = {
  id: string;
  number: string | null;
  status: string | null;
  amountPaid: number;
  amountDue: number;
  currency: string;
  created: Date;
  periodStart: Date | null;
  periodEnd: Date | null;
  pdfUrl: string | null;
  hostedUrl: string | null;
  description: string | null;
};

// ─── Custom hooks ─────────────────────────────────────────────────────────────
function useSubscription(email?: string) {
  return trpc.subscriptions.getMySubscription.useQuery(
    email ? { email } : undefined,
    { retry: false }
  );
}

function useInvoices(email?: string) {
  return trpc.subscriptions.getMyInvoices.useQuery(
    email ? { email } : undefined,
    { retry: false }
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Abbonamenti() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [lookupEmail, setLookupEmail] = useState<string | undefined>(undefined);
  const [portalLoading, setPortalLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomePlanName, setWelcomePlanName] = useState("");

  // Rileva ?checkout=success dal query string
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      const planId = params.get("plan") ?? "";
      const plan = PLANS.find((p) => p.id === planId);
      setWelcomePlanName(plan?.name ?? "Base Alpha+");
      setShowWelcome(true);
      // Pulisci l'URL senza ricaricare la pagina
      window.history.replaceState({}, "", "/abbonamenti");
    }
  }, [location]);

  const searchEmail = isAuthenticated ? undefined : lookupEmail;

  const { data: sub, isLoading: subLoading } = useSubscription(searchEmail);
  const { data: invoices, isLoading: invLoading } = useInvoices(searchEmail);

  const createPortal = trpc.subscriptions.createPortalSession.useMutation({
    retry: false,
    onSuccess: (data) => {
      setPortalLoading(false);
      if (data.portalUrl) {
        window.location.href = data.portalUrl;
      }
    },
    onError: (err) => {
      setPortalLoading(false);
      toast.error(err.message || "Impossibile aprire il portale. Riprova.");
    },
  });

  const handlePortal = () => {
    setPortalLoading(true);
    createPortal.mutate({
      origin: window.location.origin,
      email: searchEmail,
    });
  };

  const showLookup = !isAuthenticated && !lookupEmail;
  const isLoading = subLoading || invLoading;

  return (
    <>
      <SEOHead
        title="I miei abbonamenti — Base Alpha+ | ProofPress"
        description="Gestisci il tuo abbonamento Base Alpha+: stato, prossimo rinnovo e storico fatture."
      />
      <div className="min-h-screen bg-white font-sans">
        <Navbar />
        <div className="flex">
          <LeftSidebar />
          <main className="flex-1 min-w-0 px-6 md:px-10 py-10 max-w-4xl">

            {/* Header */}
            <div className="mb-8 pb-6 border-b border-zinc-200">
              <p className="text-[10px] font-black tracking-[0.25em] uppercase text-[#c9a227] mb-1">
                Base Alpha+
              </p>
              <h1 className="text-3xl md:text-4xl font-black text-[#111]">
                I miei abbonamenti
              </h1>
              {isAuthenticated && user && (
                <p className="text-sm text-zinc-500 mt-1">
                  Account: <span className="font-semibold text-zinc-700">{user.email ?? user.name}</span>
                </p>
              )}
            </div>

            {/* Banner benvenuto post-checkout */}
            {showWelcome && (
              <WelcomeBanner
                planName={welcomePlanName}
                onDismiss={() => setShowWelcome(false)}
              />
            )}

            {/* Lookup email (non loggati) */}
            {showLookup && <EmailLookup onSearch={setLookupEmail} />}

            {/* Loading */}
            {!showLookup && isLoading && (
              <div className="flex items-center gap-3 py-16 justify-center">
                <div className="w-5 h-5 border-2 border-[#c9a227] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-zinc-500">Caricamento in corso...</span>
              </div>
            )}

            {/* Nessun abbonamento */}
            {!showLookup && !isLoading && !sub && (
              <div className="border-2 border-zinc-200 p-10 text-center max-w-lg mx-auto mt-8">
                <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-black text-[#111] mb-2">Nessun abbonamento trovato</h3>
                <p className="text-sm text-zinc-500 mb-6">
                  {lookupEmail
                    ? `Nessun abbonamento associato a ${lookupEmail}.`
                    : "Non hai ancora un abbonamento Base Alpha+ attivo."}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/base-alpha"
                    className="bg-[#c9a227] text-black px-6 py-2.5 text-xs font-black tracking-wider uppercase hover:bg-[#b8911f] transition-colors"
                  >
                    ABBONATI ORA
                  </Link>
                  {lookupEmail && (
                    <button
                      onClick={() => setLookupEmail(undefined)}
                      className="border border-zinc-300 text-zinc-600 px-6 py-2.5 text-xs font-black tracking-wider uppercase hover:border-zinc-600 transition-colors"
                    >
                      PROVA ALTRA EMAIL
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Abbonamento attivo */}
            {!showLookup && !isLoading && sub && (
              <>
                <SubscriptionCard sub={sub} onPortal={handlePortal} portalLoading={portalLoading} />

                {/* Sezione Upgrade / Downgrade */}
                {(sub.status === "active" || sub.status === "trialing") && (
                  <UpgradeSection
                    currentPlanId={sub.planId}
                    onPortal={handlePortal}
                    portalLoading={portalLoading}
                  />
                )}

                {/* Storico fatture */}
                <div className="mt-10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[10px] font-black tracking-[0.25em] uppercase text-[#c9a227] mb-0.5">
                        Storico
                      </p>
                      <h3 className="text-xl font-black text-[#111]">Fatture</h3>
                    </div>
                    {invoices && invoices.length > 0 && (
                      <span className="text-xs text-zinc-400 font-semibold">
                        {invoices.length} fattur{invoices.length === 1 ? "a" : "e"}
                      </span>
                    )}
                  </div>
                  <InvoicesTable invoices={(invoices ?? []) as InvoiceItem[]} />
                </div>

                {/* Info supporto */}
                <div className="mt-10 border border-zinc-100 bg-zinc-50 p-5">
                  <p className="text-xs font-bold text-zinc-600 mb-1">Hai bisogno di assistenza?</p>
                  <p className="text-xs text-zinc-500">
                    Per modifiche al piano, rimborsi o problemi di fatturazione, scrivi a{" "}
                    <a href="mailto:info@proofpress.ai" className="text-[#c9a227] font-bold hover:underline">
                      info@proofpress.ai
                    </a>{" "}
                    oppure usa il pulsante "Gestisci Abbonamento" per accedere al portale Stripe.
                  </p>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
