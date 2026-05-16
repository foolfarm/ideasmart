/**
 * Pagina /abbonamenti
 * Mostra TUTTI gli abbonamenti attivi dell'utente: Base Alpha+ e ProofPress Creator.
 * Consente la cancellazione (fine periodo) direttamente da questa pagina.
 * Mostra lo storico fatture unificato da Stripe.
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  CheckCircle2, XCircle, AlertTriangle, Clock, Download,
  ExternalLink, RefreshCw, CreditCard, ChevronDown, ChevronUp,
  Star, Zap, Shield, ArrowRight, X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import SharedPageHeader from "@/components/SharedPageHeader";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(d: Date | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
}
function formatAmount(cents: number, currency: string): string {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency }).format(cents / 100);
}
function statusLabel(status: string, cancelAtPeriodEnd: boolean) {
  if (cancelAtPeriodEnd) return { label: "Cancellazione programmata", color: "text-orange-400", bg: "bg-orange-400/10", icon: <Clock className="w-3 h-3" /> };
  switch (status) {
    case "active": return { label: "Attivo", color: "text-emerald-400", bg: "bg-emerald-400/10", icon: <CheckCircle2 className="w-3 h-3" /> };
    case "past_due": return { label: "Pagamento in ritardo", color: "text-red-400", bg: "bg-red-400/10", icon: <AlertTriangle className="w-3 h-3" /> };
    case "cancelled": return { label: "Cancellato", color: "text-gray-400", bg: "bg-gray-400/10", icon: <XCircle className="w-3 h-3" /> };
    case "trialing": return { label: "Periodo di prova", color: "text-cyan-400", bg: "bg-cyan-400/10", icon: <Star className="w-3 h-3" /> };
    default: return { label: status, color: "text-gray-400", bg: "bg-gray-400/10", icon: <Clock className="w-3 h-3" /> };
  }
}
function productLabel(product: "base_alpha" | "creator") {
  return product === "creator"
    ? { name: "ProofPress Creator", color: "text-cyan-400", bg: "bg-cyan-400/10" }
    : { name: "Base Alpha+", color: "text-orange-400", bg: "bg-orange-400/10" };
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Subscription = {
  id: number;
  product: "base_alpha" | "creator";
  planId: string;
  planName: string;
  planBadge: string;
  planFeatures: string[];
  priceMonthly: number;
  currency: string;
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
  customerEmail: string;
  customerName: string | null;
  createdAt: Date;
};

// ─── Subscription Card ────────────────────────────────────────────────────────
function SubscriptionCard({
  sub,
  onCancel,
  cancelling,
}: {
  sub: Subscription;
  onCancel: (sub: Subscription) => void;
  cancelling: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const st = statusLabel(sub.status, sub.cancelAtPeriodEnd);
  const prod = productLabel(sub.product);
  const isActive = sub.status === "active" || sub.status === "trialing";
  const isCancelled = sub.status === "cancelled";

  return (
    <div className={`rounded-2xl border transition-all ${
      isCancelled ? "border-white/5 opacity-60" : "border-white/10 hover:border-white/20"
    } bg-white/3 overflow-hidden`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${prod.bg} ${prod.color}`}>
                {prod.name}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${st.bg} ${st.color} flex items-center gap-1`}>
                {st.icon} {st.label}
              </span>
            </div>
            <h3 className="text-white font-bold text-lg leading-tight">{sub.planName}</h3>
            <p className="text-white/40 text-sm mt-0.5">{sub.customerEmail}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-black text-white">
              {formatAmount(sub.priceMonthly, sub.currency)}
            </div>
            <div className="text-white/40 text-xs">/mese</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-white/40 text-xs mb-0.5">Inizio periodo</p>
            <p className="text-white text-sm font-medium">{formatDate(sub.currentPeriodStart)}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-white/40 text-xs mb-0.5">
              {sub.cancelAtPeriodEnd ? "Scade il" : "Prossimo rinnovo"}
            </p>
            <p className={`text-sm font-medium ${sub.cancelAtPeriodEnd ? "text-orange-400" : "text-white"}`}>
              {formatDate(sub.currentPeriodEnd)}
            </p>
          </div>
        </div>

        {sub.cancelAtPeriodEnd && (
          <div className="mt-3 flex items-start gap-2 bg-orange-400/10 border border-orange-400/20 rounded-xl p-3">
            <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
            <p className="text-orange-300 text-sm">
              L'abbonamento non si rinnoverà. Accesso garantito fino al {formatDate(sub.currentPeriodEnd)}.
            </p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {expanded ? "Nascondi dettagli" : "Vedi dettagli piano"}
          </button>

          {isActive && !sub.cancelAtPeriodEnd && sub.stripeSubscriptionId && (
            <button
              onClick={() => onCancel(sub)}
              disabled={cancelling}
              className="ml-auto flex items-center gap-1.5 text-sm text-red-400/70 hover:text-red-400 transition-colors disabled:opacity-40"
            >
              {cancelling ? <RefreshCw className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
              Cancella abbonamento
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-white/5 px-5 pb-5 pt-4">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Incluso nel piano</p>
          <ul className="space-y-2">
            {sub.planFeatures.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Cancel Modal ─────────────────────────────────────────────────────────────
function CancelModal({
  sub,
  onConfirm,
  onClose,
  loading,
}: {
  sub: Subscription;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0d1220] border border-white/10 rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-400/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <h2 className="text-white font-bold text-lg">Cancella abbonamento</h2>
        </div>
        <p className="text-white/60 text-sm mb-2">
          Stai per cancellare <strong className="text-white">{sub.planName}</strong>.
        </p>
        <p className="text-white/60 text-sm mb-6">
          L'abbonamento rimarrà attivo fino al <strong className="text-white">{formatDate(sub.currentPeriodEnd)}</strong>, dopodiché non verrà rinnovato.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all text-sm font-medium"
          >
            Mantieni abbonamento
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
            Conferma cancellazione
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="text-center py-16 px-6">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
        <CreditCard className="w-8 h-8 text-white/20" />
      </div>
      <h3 className="text-white font-bold text-xl mb-2">Nessun abbonamento attivo</h3>
      <p className="text-white/40 text-sm max-w-sm mx-auto mb-6">
        Non hai ancora nessun abbonamento. Scegli il piano più adatto alle tue esigenze.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href="/base-alpha"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 hover:bg-orange-500/30 transition-all text-sm font-medium"
        >
          <Zap className="w-4 h-4" /> Base Alpha+
        </a>
        <a
          href="/offertacommerciale"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 transition-all text-sm font-medium"
        >
          <Star className="w-4 h-4" /> ProofPress Creator
        </a>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Abbonamenti() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [lookupEmail, setLookupEmail] = useState("");
  const [searchEmail, setSearchEmail] = useState<string | undefined>(undefined);
  const [portalLoading, setPortalLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomePlanName, setWelcomePlanName] = useState("");
  const [cancelTarget, setCancelTarget] = useState<Subscription | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [showInvoices, setShowInvoices] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      const planId = params.get("plan") ?? "";
      setWelcomePlanName(planId || "il tuo piano");
      setShowWelcome(true);
      window.history.replaceState({}, "", "/abbonamenti");
    }
  }, [location]);

  const queryEmail = isAuthenticated ? undefined : (searchEmail || undefined);

  const { data: subscriptions = [], isLoading: subsLoading, refetch: refetchSubs } =
    trpc.subscriptions.getMySubscriptions.useQuery(
      queryEmail ? { email: queryEmail } : undefined,
      { retry: false, enabled: isAuthenticated || !!queryEmail }
    );

  const { data: invoices = [], isLoading: invLoading } =
    trpc.subscriptions.getMyInvoices.useQuery(
      queryEmail ? { email: queryEmail } : undefined,
      { retry: false, enabled: showInvoices && (isAuthenticated || !!queryEmail) }
    );

  const cancelMutation = trpc.subscriptions.cancelSubscription.useMutation({
    retry: false,
    onSuccess: (data) => {
      setCancellingId(null);
      setCancelTarget(null);
      toast.success(data.message ?? "Abbonamento programmato per la cancellazione.");
      refetchSubs();
    },
    onError: (err) => {
      setCancellingId(null);
      toast.error(err.message ?? "Errore durante la cancellazione.");
    },
  });

  const createPortal = trpc.subscriptions.createPortalSession.useMutation({
    retry: false,
    onSuccess: (data) => {
      setPortalLoading(false);
      if (data.portalUrl) window.open(data.portalUrl, "_blank");
    },
    onError: (err) => {
      setPortalLoading(false);
      toast.error(err.message ?? "Impossibile aprire il portale.");
    },
  });

  function handleCancel(sub: Subscription) {
    setCancelTarget(sub);
  }

  function confirmCancel() {
    if (!cancelTarget?.stripeSubscriptionId) return;
    setCancellingId(cancelTarget.id);
    cancelMutation.mutate({
      stripeSubscriptionId: cancelTarget.stripeSubscriptionId,
      product: cancelTarget.product,
      email: queryEmail,
    });
  }

  function handlePortal() {
    setPortalLoading(true);
    createPortal.mutate({ origin: window.location.origin, email: queryEmail });
  }

  const activeCount = subscriptions.filter(s => s.status === "active" || s.status === "trialing").length;
  const hasSubscriptions = subscriptions.length > 0;

  return (
    <div className="min-h-screen bg-[#060b14] text-white">
      <Navbar />
      <div className="flex">
        
        <div className="flex-1 min-w-0">
          <SharedPageHeader />
          <main className="max-w-3xl mx-auto px-4 py-10">

            {/* Welcome Banner */}
            {showWelcome && (
              <div className="mb-8 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-400/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-white font-bold text-lg mb-1">Benvenuto! Abbonamento attivato.</h2>
                  <p className="text-white/60 text-sm">
                    Il tuo accesso a <strong className="text-white">{welcomePlanName}</strong> è ora attivo. Puoi gestire il tuo abbonamento da questa pagina in qualsiasi momento.
                  </p>
                </div>
                <button onClick={() => setShowWelcome(false)} className="text-white/30 hover:text-white/60 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-black text-white mb-2">I miei abbonamenti</h1>
              <p className="text-white/40 text-sm">
                Gestisci i tuoi piani attivi, visualizza le fatture e cancella in qualsiasi momento.
              </p>
            </div>

            {/* Email lookup (non loggato) */}
            {!isAuthenticated && (
              <div className="mb-8 rounded-2xl border border-white/10 bg-white/3 p-5">
                <p className="text-white/60 text-sm mb-3">
                  <Shield className="w-4 h-4 inline mr-1.5 text-cyan-400" />
                  Inserisci l'email usata durante l'acquisto per visualizzare i tuoi abbonamenti.
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={lookupEmail}
                    onChange={(e) => setLookupEmail(e.target.value)}
                    placeholder="tua@email.com"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-cyan-500/50"
                    onKeyDown={(e) => e.key === "Enter" && setSearchEmail(lookupEmail)}
                  />
                  <button
                    onClick={() => setSearchEmail(lookupEmail)}
                    className="px-4 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 transition-all text-sm font-medium"
                  >
                    Cerca
                  </button>
                </div>
              </div>
            )}

            {/* Loading */}
            {subsLoading && (
              <div className="flex items-center justify-center py-16">
                <RefreshCw className="w-6 h-6 text-white/30 animate-spin" />
              </div>
            )}

            {/* Subscriptions */}
            {!subsLoading && (
              <>
                {hasSubscriptions ? (
                  <>
                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="bg-white/3 border border-white/8 rounded-xl p-4 text-center">
                        <div className="text-2xl font-black text-white">{subscriptions.length}</div>
                        <div className="text-white/40 text-xs mt-0.5">Abbonamenti totali</div>
                      </div>
                      <div className="bg-white/3 border border-white/8 rounded-xl p-4 text-center">
                        <div className="text-2xl font-black text-emerald-400">{activeCount}</div>
                        <div className="text-white/40 text-xs mt-0.5">Attivi</div>
                      </div>
                      <div className="bg-white/3 border border-white/8 rounded-xl p-4 text-center">
                        <div className="text-2xl font-black text-white">
                          {formatAmount(
                            subscriptions.filter(s => s.status === "active").reduce((acc, s) => acc + s.priceMonthly, 0),
                            "EUR"
                          )}
                        </div>
                        <div className="text-white/40 text-xs mt-0.5">Spesa mensile</div>
                      </div>
                    </div>

                    {/* Cards */}
                    <div className="space-y-4 mb-6">
                      {subscriptions.map((sub) => (
                        <SubscriptionCard
                          key={`${sub.product}-${sub.id}`}
                          sub={sub}
                          onCancel={handleCancel}
                          cancelling={cancellingId === sub.id}
                        />
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 mb-8">
                      <button
                        onClick={handlePortal}
                        disabled={portalLoading}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all text-sm font-medium"
                      >
                        {portalLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                        Gestisci metodo di pagamento
                        <ExternalLink className="w-3 h-3 opacity-50" />
                      </button>
                      <button
                        onClick={() => setShowInvoices(!showInvoices)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all text-sm font-medium"
                      >
                        <Download className="w-4 h-4" />
                        {showInvoices ? "Nascondi fatture" : "Visualizza fatture"}
                      </button>
                    </div>

                    {/* Invoices */}
                    {showInvoices && (
                      <div className="mb-8">
                        <h2 className="text-white font-bold text-lg mb-4">Storico fatture</h2>
                        {invLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <RefreshCw className="w-5 h-5 text-white/30 animate-spin" />
                          </div>
                        ) : invoices.length === 0 ? (
                          <p className="text-white/40 text-sm py-4">Nessuna fattura disponibile.</p>
                        ) : (
                          <div className="rounded-2xl border border-white/10 overflow-hidden">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-white/5">
                                  <th className="text-left px-4 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Data</th>
                                  <th className="text-left px-4 py-3 text-white/40 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Descrizione</th>
                                  <th className="text-right px-4 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Importo</th>
                                  <th className="text-center px-4 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Stato</th>
                                  <th className="px-4 py-3"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {invoices.map((inv, i) => (
                                  <tr key={inv.id} className={`${i < invoices.length - 1 ? "border-b border-white/5" : ""} hover:bg-white/2 transition-colors`}>
                                    <td className="px-4 py-3 text-white/70">{formatDate(inv.created)}</td>
                                    <td className="px-4 py-3 text-white/50 hidden sm:table-cell truncate max-w-[180px]">
                                      {inv.description ?? inv.number ?? "—"}
                                    </td>
                                    <td className="px-4 py-3 text-right text-white font-medium">
                                      {formatAmount(inv.amountPaid || inv.amountDue, inv.currency)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        inv.status === "paid" ? "bg-emerald-400/10 text-emerald-400" :
                                        inv.status === "open" ? "bg-orange-400/10 text-orange-400" :
                                        "bg-gray-400/10 text-gray-400"
                                      }`}>
                                        {inv.status === "paid" ? "Pagata" : inv.status === "open" ? "Aperta" : inv.status ?? "—"}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      {inv.pdfUrl && (
                                        <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 text-cyan-400/70 hover:text-cyan-400 transition-colors text-xs">
                                          <Download className="w-3 h-3" /> PDF
                                        </a>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  (isAuthenticated || searchEmail) && <EmptyState />
                )}
              </>
            )}

            {/* Upgrade CTA */}
            {hasSubscriptions && activeCount > 0 && (
              <div className="rounded-2xl border border-white/8 bg-gradient-to-br from-white/3 to-white/1 p-6">
                <h3 className="text-white font-bold text-base mb-1">Vuoi aggiungere un altro prodotto?</h3>
                <p className="text-white/40 text-sm mb-4">
                  Combina Base Alpha+ con ProofPress Creator per una copertura completa: intelligence strategica + redazione AI-native.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a href="/base-alpha" className="inline-flex items-center gap-1.5 text-sm text-orange-400 hover:text-orange-300 transition-colors">
                    <ArrowRight className="w-4 h-4" /> Scopri Base Alpha+
                  </a>
                  <a href="/offertacommerciale" className="inline-flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                    <ArrowRight className="w-4 h-4" /> Scopri ProofPress Creator
                  </a>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* Cancel Modal */}
      {cancelTarget && (
        <CancelModal
          sub={cancelTarget}
          onConfirm={confirmCancel}
          onClose={() => setCancelTarget(null)}
          loading={cancellingId === cancelTarget.id}
        />
      )}
    </div>
  );
}
