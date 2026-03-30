import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Bell, BellOff, Newspaper, Lightbulb, Rocket, BarChart2, FileText, Check, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Link } from "wouter";

// Palette colori IDEASMART
const C = {
  navy: "#0f0f0f",
  cyan: "#1a1a1a",
  orange: "#2a2a2a",
  slate: "#1a2035",
  muted: "#8892a4",
};

const CATEGORIES = [
  "AI & Fintech", "AI & Salute", "AI & Industria", "AI & Compliance",
  "AI Generativa", "AI & Startup", "AI & Investimenti", "AI & Lavoro"
];

const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Giornaliera", desc: "Un digest ogni mattina" },
  { value: "weekly", label: "Settimanale", desc: "Un riepilogo ogni lunedì" },
  { value: "realtime", label: "In tempo reale", desc: "Appena il contenuto è disponibile" }
] as const;

export default function NotificationPreferences() {
  // Leggi il token dalla URL (?token=...)
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") ?? "";

  const { data: prefs, isLoading } = trpc.notifications.getByToken.useQuery(
    { token },
    { enabled: token.length > 10 }
  );

  const updateMutation = trpc.notifications.updateByToken.useMutation({
    onSuccess: () => {
      toast.success("Preferenze salvate!", { description: "Le tue preferenze di notifica sono state aggiornate." });
    },
    onError: (err) => {
      toast.error("Errore", { description: err.message });
    },
  });

  // Stato locale delle preferenze
  const [notifyNews, setNotifyNews] = useState(true);
  const [notifyEditorial, setNotifyEditorial] = useState(true);
  const [notifyStartup, setNotifyStartup] = useState(true);
  const [notifyReportage, setNotifyReportage] = useState(false);
  const [notifyMarket, setNotifyMarket] = useState(false);
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "realtime">("daily");
  const [categories, setCategories] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);

  // Popola lo stato quando arrivano i dati
  useEffect(() => {
    if (prefs) {
      setNotifyNews(prefs.notifyNews);
      setNotifyEditorial(prefs.notifyEditorial);
      setNotifyStartup(prefs.notifyStartup);
      setNotifyReportage(prefs.notifyReportage);
      setNotifyMarket(prefs.notifyMarket);
      setFrequency(prefs.frequency as "daily" | "weekly" | "realtime");
      setCategories(prefs.categories ?? []);
      setIsActive(prefs.isActive);
    }
  }, [prefs]);

  const toggleCategory = (cat: string) => {
    setCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = () => {
    if (!token) return;
    updateMutation.mutate({
      token,
      notifyNews,
      notifyEditorial,
      notifyStartup,
      notifyReportage,
      notifyMarket,
      frequency,
      categories,
      isActive,
    });
  };

  const handleUnsubscribeAll = () => {
    if (!token) return;
    updateMutation.mutate({ token, isActive: false });
    setIsActive(false);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.navy }}>
        <div className="text-center p-8">
          <BellOff className="w-16 h-16 mx-auto mb-4" style={{ color: C.muted }} />
          <h2 className="text-2xl font-bold text-white mb-2">Link non valido</h2>
          <p style={{ color: C.muted }}>Il link per la gestione delle preferenze non è valido o è scaduto.</p>
          <Link href="/">
            <Button className="mt-6" style={{ background: C.cyan, color: C.navy }}>
              Torna alla Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.navy }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: C.cyan }} />
      </div>
    );
  }

  if (!prefs) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.navy }}>
        <div className="text-center p-8">
          <BellOff className="w-16 h-16 mx-auto mb-4" style={{ color: C.muted }} />
          <h2 className="text-2xl font-bold text-white mb-2">Preferenze non trovate</h2>
          <p style={{ color: C.muted }}>Non abbiamo trovato preferenze associate a questo link.</p>
          <Link href="/">
            <Button className="mt-6" style={{ background: C.cyan, color: C.navy }}>
              Torna alla Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.navy }}>
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link href="/">
            <button className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity" style={{ color: C.muted }}>
              <ArrowLeft className="w-4 h-4" />
              Torna alla Home
            </button>
          </Link>
          <div className="flex-1" />
          <span className="text-xs font-mono font-bold tracking-widest" style={{ color: C.cyan }}>IDEASMART</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Titolo */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${C.cyan}20` }}>
              <Bell className="w-5 h-5" style={{ color: C.cyan }} />
            </div>
            <h1 className="text-2xl font-bold text-white">Le tue preferenze di notifica</h1>
          </div>
          <p style={{ color: C.muted }}>
            Personalizza cosa vuoi ricevere e con quale frequenza. Email: <span className="text-white font-medium">{prefs.email}</span>
          </p>
        </div>

        {/* Stato iscrizione */}
        {!isActive && (
          <div className="mb-6 p-4 rounded-xl border border-orange-500/30 bg-orange-500/10">
            <p className="text-orange-400 text-sm font-medium">
              Le notifiche sono attualmente disattivate. Riattivale per ricevere aggiornamenti.
            </p>
            <Button
              className="mt-3 text-sm"
              size="sm"
              style={{ background: C.cyan, color: C.navy }}
              onClick={() => {
                setIsActive(true);
                updateMutation.mutate({ token, isActive: true });
              }}
            >
              Riattiva notifiche
            </Button>
          </div>
        )}

        {/* Sezione: Contenuti */}
        <div className="mb-8 p-6 rounded-2xl border border-white/10" style={{ background: C.slate }}>
          <h2 className="text-lg font-bold text-white mb-1">Contenuti</h2>
          <p className="text-sm mb-6" style={{ color: C.muted }}>Scegli quali sezioni vuoi ricevere</p>

          <div className="space-y-4">
            {[
              { icon: Newspaper, label: "News AI giornaliere", desc: "Le 20 notizie AI più importanti del giorno", value: notifyNews, setter: setNotifyNews },
              { icon: Lightbulb, label: "Editoriale", desc: "L'analisi editoriale quotidiana sui trend AI", value: notifyEditorial, setter: setNotifyEditorial },
              { icon: Rocket, label: "Startup del Giorno", desc: "Una startup AI emergente analizzata ogni giorno", value: notifyStartup, setter: setNotifyStartup },
              { icon: FileText, label: "Reportage settimanale", desc: "4 reportage approfonditi su startup AI italiane ogni lunedì", value: notifyReportage, setter: setNotifyReportage },
              { icon: BarChart2, label: "Analisi di mercato", desc: "Sintesi delle analisi da CB Insights, Sifted e altri", value: notifyMarket, setter: setNotifyMarket }
            ].map(({ icon: Icon, label, desc, value, setter }) => (
              <div key={label} className="flex items-center justify-between gap-4 py-3 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 flex-shrink-0" style={{ color: C.cyan }} />
                  <div>
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="text-xs" style={{ color: C.muted }}>{desc}</p>
                  </div>
                </div>
                <Switch
                  checked={value}
                  onCheckedChange={setter}
                  disabled={!isActive}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Sezione: Frequenza */}
        <div className="mb-8 p-6 rounded-2xl border border-white/10" style={{ background: C.slate }}>
          <h2 className="text-lg font-bold text-white mb-1">Frequenza</h2>
          <p className="text-sm mb-6" style={{ color: C.muted }}>Con quale cadenza vuoi ricevere le notifiche</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {FREQUENCY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => isActive && setFrequency(opt.value)}
                disabled={!isActive}
                className="p-4 rounded-xl border text-left transition-all"
                style={{
                  borderColor: frequency === opt.value ? C.cyan : "rgba(255,255,255,0.1)",
                  background: frequency === opt.value ? `${C.cyan}15` : "transparent",
                  opacity: isActive ? 1 : 0.5,
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-white">{opt.label}</span>
                  {frequency === opt.value && <Check className="w-4 h-4" style={{ color: C.cyan }} />}
                </div>
                <p className="text-xs" style={{ color: C.muted }}>{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Sezione: Categorie */}
        <div className="mb-8 p-6 rounded-2xl border border-white/10" style={{ background: C.slate }}>
          <h2 className="text-lg font-bold text-white mb-1">Categorie di interesse</h2>
          <p className="text-sm mb-6" style={{ color: C.muted }}>Seleziona le aree AI che ti interessano di più</p>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => isActive && toggleCategory(cat)}
                disabled={!isActive}
                className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                style={{
                  background: categories.includes(cat) ? C.cyan : "rgba(255,255,255,0.08)",
                  color: categories.includes(cat) ? C.navy : C.muted,
                  opacity: isActive ? 1 : 0.5,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Azioni */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            className="flex-1 font-bold"
            style={{ background: C.cyan, color: C.navy }}
            onClick={handleSave}
            disabled={updateMutation.isPending || !isActive}
          >
            {updateMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvataggio...</>
            ) : (
              <><Check className="w-4 h-4 mr-2" /> Salva preferenze</>
            )}
          </Button>

          {isActive && (
            <Button
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              onClick={handleUnsubscribeAll}
              disabled={updateMutation.isPending}
            >
              <BellOff className="w-4 h-4 mr-2" />
              Disattiva tutte
            </Button>
          )}
        </div>

        <p className="text-xs text-center mt-6" style={{ color: C.muted }}>
          Puoi modificare queste preferenze in qualsiasi momento tramite il link nelle email che ricevi.
        </p>
      </div>
    </div>
  );
}
