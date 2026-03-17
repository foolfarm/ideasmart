import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type ChannelKey = 'ai' | 'startup' | 'finance' | 'health' | 'sport' | 'luxury' | 'music' | 'news' | 'motori' | 'tennis' | 'basket';

const CHANNEL_META: Record<ChannelKey, { label: string; day: string; color: string }> = {
  ai:      { label: 'AI',      day: 'Lun', color: '#00b4a0' },
  startup: { label: 'Startup', day: 'Mar', color: '#e84f00' },
  finance: { label: 'Finance', day: 'Mer', color: '#1a56db' },
  sport:   { label: 'Sport',   day: 'Gio', color: '#059669' },
  music:   { label: 'Music',   day: 'Ven', color: '#7c3aed' },
  luxury:  { label: 'Luxury',  day: 'Sab', color: '#b45309' },
  health:  { label: 'Health',  day: 'Dom', color: '#dc2626' },
  news:    { label: 'News',    day: 'Lun', color: '#c0392b' },
  motori:  { label: 'Motori',  day: 'Mar', color: '#e67e22' },
  tennis:  { label: 'Tennis',  day: 'Mer', color: '#27ae60' },
  basket:  { label: 'Basket',  day: 'Gio', color: '#8e44ad' },
};

const ALL_CHANNELS: ChannelKey[] = ['ai', 'startup', 'finance', 'health', 'sport', 'luxury', 'music', 'news', 'motori', 'tennis', 'basket'];

interface Props {
  /** Canale pre-selezionato (pagina corrente) */
  defaultChannel: ChannelKey;
  /** Colore accent della pagina corrente */
  accentColor: string;
  /** Font family per testi */
  fontBody?: string;
  fontMono?: string;
}

export default function NewsletterSubscribeForm({
  defaultChannel,
  accentColor,
  fontBody = "'Source Serif 4', Georgia, serif",
  fontMono = "'Space Mono', monospace",
}: Props) {
  const [email, setEmail] = useState("");
  const [showChannels, setShowChannels] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<ChannelKey[]>([defaultChannel]);
  const [subscribed, setSubscribed] = useState(false);

  const subscribeMutation = trpc.newsletter.subscribeWithChannels.useMutation({
    onSuccess: () => {
      setSubscribed(true);
      toast.success("Iscrizione confermata! Controlla la tua email.");
    },
    onError: (err) => {
      toast.error("Errore: " + err.message);
    },
  });

  const toggleChannel = (key: ChannelKey) => {
    setSelectedChannels(prev =>
      prev.includes(key)
        ? prev.length > 1 ? prev.filter(k => k !== key) : prev // almeno 1
        : [...prev, key]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subscribeMutation.mutate({ email, channels: selectedChannels });
  };

  if (subscribed) {
    return (
      <div className="p-4 rounded-sm text-center" style={{ background: `${accentColor}18` }}>
        <p className="font-bold text-sm" style={{ color: accentColor, fontFamily: fontMono }}>
          ✓ Iscrizione confermata!
        </p>
        <p className="text-xs mt-1 text-[#1a1a2e]/60" style={{ fontFamily: fontBody }}>
          Riceverai {selectedChannels.length === 1 ? "il canale" : `${selectedChannels.length} canali`} scelti.
          Controlla la tua email.
        </p>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="La tua email"
          required
          className="flex-1 px-3 py-2 text-sm border border-[#1a1a2e]/20 bg-white text-[#1a1a2e] focus:outline-none focus:border-current"
          style={{ fontFamily: fontBody }}
        />
        <button
          type="submit"
          disabled={subscribeMutation.isPending}
          className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-80 disabled:opacity-50"
          style={{ background: accentColor, fontFamily: fontMono }}
        >
          {subscribeMutation.isPending ? "..." : "Iscriviti"}
        </button>
      </form>

      {/* Toggle selezione canali */}
      <button
        type="button"
        onClick={() => setShowChannels(v => !v)}
        className="text-xs underline cursor-pointer"
        style={{ color: `${accentColor}`, fontFamily: fontMono, background: "none", border: "none", padding: 0 }}
      >
        {showChannels ? "▲ Nascondi canali" : `▼ Scegli canali (${selectedChannels.length} selezionati)`}
      </button>

      {showChannels && (
        <div className="mt-3 flex flex-wrap gap-2">
          {ALL_CHANNELS.map(ch => {
            const meta = CHANNEL_META[ch];
            const active = selectedChannels.includes(ch);
            return (
              <button
                key={ch}
                type="button"
                onClick={() => toggleChannel(ch)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                style={{
                  fontFamily: fontMono,
                  background: active ? meta.color : "transparent",
                  color: active ? "#fff" : meta.color,
                  border: `1.5px solid ${meta.color}`,
                  opacity: active ? 1 : 0.6,
                }}
              >
                <span>{meta.label}</span>
                <span style={{ opacity: 0.7, fontSize: 10 }}>{meta.day}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
