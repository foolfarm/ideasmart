import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  FileText,
  Gauge,
  LockKeyhole,
  Mail,
  MousePointerClick,
  PauseCircle,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  UserMinus,
} from "lucide-react";
import AdminHeader from "@/components/AdminHeader";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

const colors = {
  ink: "#111111",
  graphite: "#202124",
  paper: "#f7f4ef",
  panel: "#ffffff",
  muted: "#6b6a67",
  line: "#e8e3dc",
  red: "#d94f3d",
  redSoft: "#fff0ed",
  green: "#16826d",
  greenSoft: "#e9f7f2",
  amber: "#a85f00",
  amberSoft: "#fff6df",
};

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tone = "ink",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  detail: string;
  tone?: "ink" | "green" | "red" | "amber";
}) {
  const palette = {
    ink: { color: colors.ink, background: "#f1eeea" },
    green: { color: colors.green, background: colors.greenSoft },
    red: { color: colors.red, background: colors.redSoft },
    amber: { color: colors.amber, background: colors.amberSoft },
  }[tone];

  return (
    <div className="rounded-2xl border p-5" style={{ background: colors.panel, borderColor: colors.line }}>
      <div className="mb-5 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: palette.background }}>
          <Icon size={18} style={{ color: palette.color }} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: colors.muted }}>
          Live
        </span>
      </div>
      <div className="text-3xl font-black tracking-[-0.04em] tabular-nums" style={{ color: palette.color }}>
        {value}
      </div>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em]" style={{ color: colors.ink }}>
        {label}
      </p>
      <p className="mt-2 text-xs leading-5" style={{ color: colors.muted }}>
        {detail}
      </p>
    </div>
  );
}

function StatusLine({ ok, label, description }: { ok: boolean; label: string; description: string }) {
  return (
    <div className="flex gap-3 border-b py-4 last:border-b-0" style={{ borderColor: colors.line }}>
      <div className="mt-0.5">
        {ok ? <CheckCircle2 size={17} style={{ color: colors.green }} /> : <CircleAlert size={17} style={{ color: colors.red }} />}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold" style={{ color: colors.ink }}>{label}</p>
        <p className="mt-1 text-xs leading-5" style={{ color: colors.muted }}>{description}</p>
      </div>
    </div>
  );
}

function fmtDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}

export default function NewsletterHub() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [testEmail, setTestEmail] = useState("");

  useEffect(() => {
    if (user?.email && !testEmail) setTestEmail(user.email);
  }, [user?.email, testEmail]);

  const enabled = user?.role === "admin";
  const statusQuery = trpc.newsletterControl.getOperationalStatus.useQuery(undefined, { enabled });
  const creditsQuery = trpc.adminTools.getSendgridCredits.useQuery(undefined, { enabled, staleTime: 1000 * 60 * 15 });
  const performanceQuery = trpc.adminTools.getSendgridSummary.useQuery(
    { days: 30 },
    { enabled, staleTime: 1000 * 60 * 15 }
  );
  const campaignsQuery = trpc.admin.getNewsletterCampaignStats.useQuery(undefined, { enabled });
  const subscribersQuery = trpc.admin.getSubscribersWithTracking.useQuery(undefined, { enabled });

  const testMutation = trpc.admin.sendUnifiedTestToEmail.useMutation({
    onSuccess: (result) => {
      if (result.success) toast.success(`Test inviato a ${testEmail}`);
      else toast.error(result.error ?? "Il test non è stato inviato");
    },
    onError: (error) => toast.error(error.message),
  });

  const previewMutation = trpc.admin.sendUnifiedPreview.useMutation({
    onSuccess: (result) => {
      if (result.success) toast.success("Preview inviata alla redazione");
      else toast.error(result.error ?? "La preview non è stata inviata");
    },
    onError: (error) => toast.error(error.message),
  });

  const hubStatus = statusQuery.data;
  const credits = creditsQuery.data;
  const performance = performanceQuery.data;
  const campaigns = campaignsQuery.data ?? [];
  const subscribers = subscribersQuery.data ?? [];

  const audience = useMemo(() => {
    const active = subscribers.filter((subscriber) => subscriber.status === "active");
    const unsubscribed = subscribers.filter((subscriber) => subscriber.status === "unsubscribed");
    const engaged = active.filter((subscriber) => (subscriber.totalOpened ?? 0) > 0);
    return {
      active: active.length,
      unsubscribed: unsubscribed.length,
      engaged: engaged.length,
      engagementRate: active.length > 0 ? Math.round((engaged.length / active.length) * 100) : 0,
    };
  }, [subscribers]);

  const recentCampaigns = useMemo(
    () => [...campaigns].reverse().slice(0, 5),
    [campaigns]
  );

  const refresh = () => {
    statusQuery.refetch();
    creditsQuery.refetch();
    performanceQuery.refetch();
    campaignsQuery.refetch();
    subscribersQuery.refetch();
  };

  if (loading) {
    return <div className="min-h-screen" style={{ background: colors.paper }} />;
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center px-5" style={{ background: colors.paper, fontFamily: FONT }}>
        <div className="max-w-md rounded-3xl border p-8 text-center" style={{ background: colors.panel, borderColor: colors.line }}>
          <LockKeyhole className="mx-auto mb-4" size={24} style={{ color: colors.red }} />
          <h1 className="text-xl font-black" style={{ color: colors.ink }}>Accesso riservato</h1>
          <p className="mt-3 text-sm leading-6" style={{ color: colors.muted }}>
            Il centro operativo newsletter contiene dati personali e strumenti di invio. È accessibile solo agli amministratori autorizzati.
          </p>
          <button onClick={() => navigate("/")} className="mt-6 rounded-xl px-4 py-2.5 text-sm font-bold" style={{ color: "#fff", background: colors.ink }}>
            Torna a ProofPress
          </button>
        </div>
      </div>
    );
  }

  const isLoading = statusQuery.isLoading || subscribersQuery.isLoading;
  const providerReady = credits?.success ?? hubStatus?.sendGridConfigured ?? false;
  const automationsPaused = hubStatus?.automationsPaused ?? true;
  const openRate = performance?.success ? performance.openRate : 0;
  const clickRate = performance?.success ? performance.clickRate : 0;

  return (
    <div className="min-h-screen" style={{ background: colors.paper, color: colors.ink, fontFamily: FONT }}>
      <AdminHeader title="Centro Newsletter" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[28px] border" style={{ borderColor: colors.ink, background: colors.ink }}>
          <div className="grid gap-8 px-6 py-8 md:grid-cols-[1.4fr_0.6fr] md:px-10 md:py-10">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5" style={{ borderColor: "rgba(255,255,255,0.18)", color: "#fff" }}>
                <Mail size={13} style={{ color: "#ff8e7f" }} />
                <span className="text-[10px] font-bold uppercase tracking-[0.16em]">Newsletter Operating System</span>
              </div>
              <h1 className="max-w-3xl text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">
                Governa le newsletter.<br />Non lasciare che partano da sole.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-6" style={{ color: "rgba(255,255,255,0.68)" }}>
                Una control room per audience, deliverability, contenuti e approvazioni. Le automazioni rimangono sospese: ogni messaggio esce solo da un’azione manuale verificabile.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/admin/newsletter-performance")}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold transition-transform active:scale-[0.98]"
                  style={{ color: colors.ink }}
                >
                  Apri analytics <ArrowRight size={15} />
                </button>
                <button
                  onClick={refresh}
                  className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-transform active:scale-[0.98]"
                  style={{ color: "#fff", borderColor: "rgba(255,255,255,0.22)" }}
                >
                  <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} /> Aggiorna dati
                </button>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border p-5" style={{ borderColor: "rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)" }}>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "rgba(255,255,255,0.52)" }}>Modalità operativa</p>
                <div className="mt-3 flex items-center gap-2">
                  <PauseCircle size={22} style={{ color: "#ff8e7f" }} />
                  <p className="text-xl font-black text-white">Manuale con approvazione</p>
                </div>
                <p className="mt-3 text-xs leading-5" style={{ color: "rgba(255,255,255,0.65)" }}>
                  Nessun cron, catch-up o invio ricorrente può attivarsi dal sito.
                </p>
              </div>
              <div className="mt-8 border-t pt-4" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: "rgba(255,255,255,0.56)" }}>Audience attiva</span>
                  <strong className="text-white tabular-nums">{(hubStatus?.activeSubscribers ?? audience.active).toLocaleString("it-IT")}</strong>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span style={{ color: "rgba(255,255,255,0.56)" }}>Provider delivery</span>
                  <strong style={{ color: providerReady ? "#91e4c7" : "#ff8e7f" }}>{providerReady ? "Configurato" : "Da verificare"}</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={Users} label="Audience attiva" value={(hubStatus?.activeSubscribers ?? audience.active).toLocaleString("it-IT")} detail="Destinatari attualmente eleggibili" tone="ink" />
          <MetricCard icon={Activity} label="Lettori ingaggiati" value={`${audience.engagementRate}%`} detail={`${audience.engaged.toLocaleString("it-IT")} contatti con almeno un’apertura`} tone="green" />
          <MetricCard icon={Gauge} label="Open rate 30 gg" value={performance?.success ? `${openRate}%` : "—"} detail="Dato aggregato del provider email" tone="amber" />
          <MetricCard icon={MousePointerClick} label="Click rate 30 gg" value={performance?.success ? `${clickRate}%` : "—"} detail="Indicatore di rilevanza dei contenuti" tone="red" />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border p-6" style={{ background: colors.panel, borderColor: colors.line }}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles size={18} style={{ color: colors.red }} />
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: colors.red }}>Campaign desk</p>
                </div>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.035em]">Prepara. Testa. Approva.</h2>
                <p className="mt-2 max-w-xl text-sm leading-6" style={{ color: colors.muted }}>
                  Il template unificato ProofPress è già collegato a contenuti editoriali, tracking aperture e disiscrizione individuale. Il portale abilita test e preview; non invia mai in massa in automatico.
                </p>
              </div>
              <span className="rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: colors.red, background: colors.redSoft }}>
                Invio massivo bloccato
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border p-4" style={{ borderColor: colors.line, background: "#fcfbf9" }}>
                <FileText size={18} style={{ color: colors.ink }} />
                <p className="mt-4 text-sm font-bold">1. Template</p>
                <p className="mt-1 text-xs leading-5" style={{ color: colors.muted }}>BUONGIORNO by PROOFPRESS: news, startup, dealroom, research e sponsor.</p>
              </div>
              <div className="rounded-2xl border p-4" style={{ borderColor: colors.line, background: "#fcfbf9" }}>
                <ShieldCheck size={18} style={{ color: colors.green }} />
                <p className="mt-4 text-sm font-bold">2. Test e controllo</p>
                <p className="mt-1 text-xs leading-5" style={{ color: colors.muted }}>Invio a un indirizzo definito o preview alla redazione prima di ogni decisione.</p>
              </div>
              <div className="rounded-2xl border p-4" style={{ borderColor: colors.line, background: "#fcfbf9" }}>
                <LockKeyhole size={18} style={{ color: colors.red }} />
                <p className="mt-4 text-sm font-bold">3. Approvazione</p>
                <p className="mt-1 text-xs leading-5" style={{ color: colors.muted }}>L’eventuale diffusione alla lista richiede un’autorizzazione esplicita e separata.</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border p-5" style={{ borderColor: colors.line, background: colors.paper }}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0 flex-1">
                  <label className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: colors.muted }}>Indirizzo per il test</label>
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(event) => setTestEmail(event.target.value)}
                    placeholder="nome@azienda.it"
                    className="mt-2 w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none transition-shadow focus:ring-2"
                    style={{ borderColor: colors.line, color: colors.ink, boxShadow: "none" }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      if (!/^\S+@\S+\.\S+$/.test(testEmail)) {
                        toast.error("Inserisci un indirizzo email valido");
                        return;
                      }
                      testMutation.mutate({ toEmail: testEmail });
                    }}
                    disabled={testMutation.isPending || !providerReady}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
                    style={{ color: "#fff", background: colors.ink }}
                  >
                    <Send size={15} /> {testMutation.isPending ? "Invio test…" : "Invia test"}
                  </button>
                  <button
                    onClick={() => previewMutation.mutate()}
                    disabled={previewMutation.isPending || !providerReady}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
                    style={{ color: colors.ink, borderColor: colors.ink, background: "transparent" }}
                  >
                    <Mail size={15} /> {previewMutation.isPending ? "Invio…" : "Preview redazione"}
                  </button>
                </div>
              </div>
              <p className="mt-3 text-[11px] leading-5" style={{ color: colors.muted }}>
                Il test invia una singola email al destinatario indicato. La preview usa la casella editoriale configurata. Nessuna di queste azioni raggiunge la mailing list completa.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border p-6" style={{ background: colors.panel, borderColor: colors.line }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: colors.red }}>Delivery readiness</p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.035em]">Stato operativo</h2>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: colors.greenSoft }}>
                <ShieldCheck size={19} style={{ color: colors.green }} />
              </div>
            </div>
            <div className="mt-5">
              <StatusLine ok={automationsPaused} label="Automazioni sospese" description="Cron, catch-up e attività ricorrenti risultano bloccati. Il sito resta online." />
              <StatusLine ok={providerReady} label="Canale SendGrid" description={providerReady ? "Provider disponibile per test e invii manuali autorizzati." : "Verificare la chiave e la configurazione del provider prima di inviare."} />
              <StatusLine ok={Boolean(hubStatus?.unsubscribeProtection)} label="Tutela destinatari" description="Disiscrizione individuale e header List-Unsubscribe inclusi nel flusso newsletter." />
              <StatusLine ok={Boolean(hubStatus?.trackingAvailable)} label="Misurazione" description="Storico campagne, aperture e dati aggregati sono disponibili nella control room." />
            </div>
            <div className="mt-5 rounded-2xl p-4" style={{ background: colors.amberSoft }}>
              <div className="flex gap-3">
                <CircleAlert className="mt-0.5 shrink-0" size={16} style={{ color: colors.amber }} />
                <p className="text-xs leading-5" style={{ color: "#725217" }}>
                  La diffusione alla lista è una decisione editoriale e reputazionale. Questo portale non presenta un pulsante “invia a tutti”: l’abilitazione richiede un passaggio esplicito separato.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border overflow-hidden" style={{ background: colors.panel, borderColor: colors.line }}>
            <div className="flex items-center justify-between border-b px-6 py-5" style={{ borderColor: colors.line }}>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: colors.red }}>Campaign intelligence</p>
                <h2 className="mt-1 text-xl font-black tracking-[-0.03em]">Storico campagne</h2>
              </div>
              <button onClick={() => navigate("/admin/newsletter-performance")} className="inline-flex items-center gap-1 text-xs font-bold" style={{ color: colors.red }}>
                Tutti i dati <ChevronRight size={14} />
              </button>
            </div>
            {recentCampaigns.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Clock3 className="mx-auto mb-3" size={20} style={{ color: colors.muted }} />
                <p className="text-sm font-bold">Nessuna campagna registrata</p>
                <p className="mt-1 text-xs" style={{ color: colors.muted }}>Lo storico apparirà dopo il primo invio manuale autorizzato.</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: colors.line }}>
                {recentCampaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: colors.redSoft }}>
                      <Mail size={15} style={{ color: colors.red }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold" title={campaign.subject}>{campaign.subject}</p>
                      <p className="mt-1 text-xs" style={{ color: colors.muted }}>{fmtDate(campaign.sentAt)}</p>
                    </div>
                    <div className="hidden text-right sm:block">
                      <p className="text-sm font-black tabular-nums">{(campaign.recipientCount ?? 0).toLocaleString("it-IT")}</p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.08em]" style={{ color: colors.muted }}>inviati</p>
                    </div>
                    <div className="hidden min-w-12 text-right md:block">
                      <p className="text-sm font-black tabular-nums" style={{ color: colors.green }}>{campaign.openRate}%</p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.08em]" style={{ color: colors.muted }}>open</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border p-6" style={{ background: colors.panel, borderColor: colors.line }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: colors.red }}>Audience governance</p>
                <h2 className="mt-1 text-xl font-black tracking-[-0.03em]">La lista è un asset, non un contatore.</h2>
              </div>
              <Users size={20} style={{ color: colors.red }} />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-2xl p-4" style={{ background: colors.paper }}>
                <p className="text-xl font-black tabular-nums">{audience.active.toLocaleString("it-IT")}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: colors.muted }}>Attivi</p>
              </div>
              <div className="rounded-2xl p-4" style={{ background: colors.paper }}>
                <p className="text-xl font-black tabular-nums">{audience.engaged.toLocaleString("it-IT")}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: colors.muted }}>Ingaggiati</p>
              </div>
              <div className="rounded-2xl p-4" style={{ background: colors.paper }}>
                <p className="text-xl font-black tabular-nums">{audience.unsubscribed.toLocaleString("it-IT")}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: colors.muted }}>Disiscritti</p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between rounded-2xl border px-4 py-3" style={{ borderColor: colors.line }}>
              <div className="flex items-center gap-2">
                <BarChart3 size={16} style={{ color: colors.ink }} />
                <span className="text-xs font-bold">Segmentazione e tracking</span>
              </div>
              <button onClick={() => navigate("/admin/newsletter-performance")} className="text-xs font-bold" style={{ color: colors.red }}>Gestisci →</button>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-2xl border px-4 py-3" style={{ borderColor: colors.line }}>
              <div className="flex items-center gap-2">
                <UserMinus size={16} style={{ color: colors.ink }} />
                <span className="text-xs font-bold">Privacy e disiscrizioni</span>
              </div>
              <button onClick={() => navigate("/admin/newsletter-performance")} className="text-xs font-bold" style={{ color: colors.red }}>Verifica →</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
