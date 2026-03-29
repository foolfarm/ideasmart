import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type ChannelKey = 'ai' | 'startup' | 'finance' | 'health' | 'sport' | 'luxury' | 'music' | 'dealroom';

const CHANNELS: { key: ChannelKey; label: string; subtitle: string; day: string; color: string; icon: string }[] = [
  { key: 'ai',       label: 'AI News',             subtitle: 'Intelligenza artificiale per il business italiano',  day: 'Lunedì',    color: '#1a1a1a', icon: '🤖' },
  { key: 'startup',  label: 'Startup News',        subtitle: 'Le startup italiane più promettenti',                day: 'Mercoledì', color: '#2a2a2a', icon: '🚀' },
  { key: 'dealroom', label: 'DEALROOM News',       subtitle: 'Round, funding, VC e deal dell\'ecosistema startup', day: 'Venerdì',   color: '#1a4a2e', icon: '💰' },
  { key: 'finance',  label: 'Finance & Markets',   subtitle: 'Mercati, finanza e investimenti',                   day: 'Mercoledì', color: '#1a56db', icon: '📈' },
  { key: 'sport',    label: 'Sport & Business',    subtitle: 'Sport, management e business dello sport',          day: 'Giovedì',   color: '#059669', icon: '⚽' },
  { key: 'music',    label: 'ITsMusic',            subtitle: 'Musica, tecnologia e industria musicale',           day: 'Venerdì',   color: '#2a2a2a', icon: '🎵' },
  { key: 'luxury',   label: 'Lifestyle & Luxury',  subtitle: 'Lusso, lifestyle e luxury economy',                 day: 'Sabato',    color: '#2a2a2a', icon: '💎' },
  { key: 'health',   label: 'Health & Biotech',    subtitle: 'Salute, biotech e innovazione medica',              day: 'Domenica',  color: '#2a2a2a', icon: '🏥' },
];

export default function ChannelPreferences() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [selected, setSelected] = useState<ChannelKey[]>([]);
  const [saved, setSaved] = useState(false);

  // Leggi il token dalla query string
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    setToken(t);
  }, []);

  // Carica le preferenze esistenti
  const prefsQuery = trpc.newsletter.getChannelPreferences.useQuery(
    { token: token ?? "" },
    { enabled: !!token }
  );

  useEffect(() => {
    if (prefsQuery.data?.channels) {
      setSelected(prefsQuery.data.channels as ChannelKey[]);
    }
  }, [prefsQuery.data]);

  const updateMutation = trpc.newsletter.updateChannelPreferences.useMutation({
    onSuccess: () => {
      setSaved(true);
      toast.success("Preferenze aggiornate! Riceverai solo le newsletter dei canali scelti.");
    },
    onError: (err) => {
      toast.error("Errore: " + err.message);
    },
  });

  const toggleChannel = (key: ChannelKey) => {
    setSelected(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
    setSaved(false);
  };

  const handleSave = () => {
    if (!token) {
      toast.error("Link non valido. Usa il link ricevuto nell'email.");
      return;
    }
    if (selected.length === 0) {
      toast.error("Seleziona almeno un canale.");
      return;
    }
    updateMutation.mutate({ token, channels: selected });
  };

  const handleSelectAll = () => {
    setSelected(CHANNELS.map(c => c.key));
    setSaved(false);
  };

  // Stato: nessun token
  if (!token) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f0e8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
        <div style={{ maxWidth: 480, padding: "48px 32px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#0a1628", marginBottom: 12 }}>Link non valido</h1>
          <p style={{ fontSize: 15, color: "#4b5563", lineHeight: 1.7, marginBottom: 24 }}>
            Usa il link "Gestisci preferenze" presente nel footer delle email IDEASMART per accedere a questa pagina.
          </p>
          <a href="/" style={{ display: "inline-block", background: "#1a1a1a", color: "#fff", padding: "12px 28px", borderRadius: 8, textDecoration: "none", fontFamily: "sans-serif", fontWeight: 700, fontSize: 14 }}>
            Torna alla Home →
          </a>
        </div>
      </div>
    );
  }

  // Stato: caricamento
  if (prefsQuery.isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f0e8", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", fontFamily: "Georgia, serif" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #1a1a1a", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#4b5563", fontSize: 15 }}>Caricamento preferenze...</p>
        </div>
      </div>
    );
  }

  // Stato: token non trovato
  if (prefsQuery.data === null) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f0e8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
        <div style={{ maxWidth: 480, padding: "48px 32px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#0a1628", marginBottom: 12 }}>Token non trovato</h1>
          <p style={{ fontSize: 15, color: "#4b5563", lineHeight: 1.7, marginBottom: 24 }}>
            Il link potrebbe essere scaduto o non valido. Iscriviti nuovamente per ricevere un nuovo link.
          </p>
          <a href="/" style={{ display: "inline-block", background: "#1a1a1a", color: "#fff", padding: "12px 28px", borderRadius: 8, textDecoration: "none", fontFamily: "sans-serif", fontWeight: 700, fontSize: 14 }}>
            Torna alla Home →
          </a>
        </div>
      </div>
    );
  }

  const sub = prefsQuery.data;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f0e8", fontFamily: "Georgia, serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .channel-card { transition: all 0.18s ease; cursor: pointer; }
        .channel-card:hover { transform: translateY(-2px); }
      `}</style>

      {/* Header */}
      <div style={{ background: "#0a1628", padding: "0" }}>
        {/* Top bar */}
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "10px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#1a1a1a", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "sans-serif" }}>IDEASMART</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif" }}>
            {new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).toUpperCase()}
          </span>
        </div>
        {/* Masthead */}
        <div style={{ padding: "32px 24px 28px", textAlign: "center" }}>
          <a href="/" style={{ textDecoration: "none" }}>
            <h1 style={{ fontSize: 48, fontWeight: 900, color: "#fff", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
              IDEA<span style={{ color: "#1a1a1a" }}>SMART</span>
            </h1>
          </a>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", letterSpacing: "0.2em", textTransform: "uppercase", margin: 0, fontFamily: "sans-serif" }}>
            LA PRIMA TESTATA GIORNALISTICA HUMANLESS
          </p>
        </div>
        {/* Double rule */}
        <div style={{ borderTop: "2px solid #1a1a1a", borderBottom: "1px solid rgba(0,180,160,0.3)", margin: "0 24px 0" }} />
      </div>

      {/* Content */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Intro */}
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "#1a1a1a", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: 12 }}>
            ◆ PREFERENZE NEWSLETTER
          </p>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: "#0a1628", margin: "0 0 12px", lineHeight: 1.2 }}>
            Scegli i tuoi canali
          </h2>
          <p style={{ fontSize: 15, color: "#4b5563", lineHeight: 1.7, margin: "0 0 8px", fontFamily: "sans-serif" }}>
            {sub?.name ? `Ciao ${sub.name}, seleziona` : "Seleziona"} i canali tematici che vuoi ricevere.
            Ogni canale viene inviato una volta a settimana nel giorno indicato.
          </p>
          <p style={{ fontSize: 13, color: "#9ca3af", fontFamily: "sans-serif" }}>
            Email: <strong style={{ color: "#0a1628" }}>{sub?.email}</strong>
          </p>
        </div>

        {/* Select All */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 13, color: "#4b5563", fontFamily: "sans-serif" }}>
            {selected.length} di {CHANNELS.length} canali selezionati
          </span>
          <button
            onClick={handleSelectAll}
            style={{ fontSize: 12, color: "#1a1a1a", background: "none", border: "1px solid #1a1a1a", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontFamily: "sans-serif", fontWeight: 600 }}
          >
            Seleziona tutti
          </button>
        </div>

        {/* Channel cards */}
        <div style={{ display: "grid", gap: 12, marginBottom: 32 }}>
          {CHANNELS.map(ch => {
            const isActive = selected.includes(ch.key);
            return (
              <div
                key={ch.key}
                className="channel-card"
                onClick={() => toggleChannel(ch.key)}
                style={{
                  background: isActive ? "#fff" : "#ede8de",
                  border: `2px solid ${isActive ? ch.color : "transparent"}`,
                  borderRadius: 12,
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  boxShadow: isActive ? `0 2px 12px ${ch.color}22` : "none",
                }}
              >
                {/* Icon */}
                <div style={{ fontSize: 28, flexShrink: 0 }}>{ch.icon}</div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#0a1628" }}>{ch.label}</span>
                    <span style={{ fontSize: 10, color: ch.color, background: `${ch.color}18`, borderRadius: 4, padding: "2px 8px", fontFamily: "sans-serif", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", flexShrink: 0 }}>
                      {ch.day}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "#6b7280", margin: 0, fontFamily: "sans-serif" }}>{ch.subtitle}</p>
                </div>

                {/* Toggle */}
                <div style={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  background: isActive ? ch.color : "#d1d5db",
                  position: "relative",
                  flexShrink: 0,
                  transition: "background 0.2s",
                }}>
                  <div style={{
                    position: "absolute",
                    top: 3,
                    left: isActive ? 23 : 3,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "#fff",
                    transition: "left 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Save button */}
        <div style={{ textAlign: "center" }}>
          {saved ? (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#ecfdf5", border: "1px solid #059669", borderRadius: 10, padding: "14px 28px" }}>
              <span style={{ fontSize: 18 }}>✓</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#059669", fontFamily: "sans-serif" }}>Preferenze salvate!</span>
            </div>
          ) : (
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending || selected.length === 0}
              style={{
                background: selected.length === 0 ? "#d1d5db" : "#0a1628",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "14px 40px",
                fontSize: 15,
                fontWeight: 700,
                cursor: selected.length === 0 ? "not-allowed" : "pointer",
                fontFamily: "sans-serif",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                transition: "background 0.2s",
              }}
            >
              {updateMutation.isPending ? (
                <>
                  <div style={{ width: 16, height: 16, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  Salvataggio...
                </>
              ) : (
                `Salva preferenze (${selected.length} canali) →`
              )}
            </button>
          )}

          <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 16, fontFamily: "sans-serif" }}>
            Puoi modificare le tue preferenze in qualsiasi momento usando il link nel footer delle email.
          </p>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid #d8d0c0", margin: "40px 0 32px" }} />

        {/* Footer links */}
        <div style={{ textAlign: "center" }}>
          <a href="/" style={{ fontSize: 13, color: "#1a1a1a", textDecoration: "none", fontFamily: "sans-serif", marginRight: 24 }}>
            ← Torna alla Home
          </a>
          <a
            href={`/unsubscribe?token=${token}`}
            style={{ fontSize: 13, color: "#2a2a2a", textDecoration: "underline", fontFamily: "sans-serif" }}
          >
            Annulla iscrizione
          </a>
        </div>
      </div>
    </div>
  );
}
