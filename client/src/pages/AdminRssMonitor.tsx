/**
 * IDEASMART — Monitor RSS
 * Pagina admin per monitorare la qualità delle fonti RSS,
 * visualizzare le statistiche URL e triggerare lo scraping manuale.
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { useLocation } from "wouter";

type Section = "ai" | "music" | "startup" | "all";

const SECTION_COLORS: Record<string, string> = {
  ai: "#1a1a1a",
  music: "#2a2a2a",
  startup: "#2a2a2a",
};

const SECTION_LABELS: Record<string, string> = {
  ai: "AI4Business",
  music: "ITsMusic",
  startup: "Startup News",
};

// Fonti RSS certificate (per visualizzazione)
const RSS_SOURCES = {
  ai: [
    { name: "TechCrunch AI", url: "https://techcrunch.com", lang: "EN", priority: 1 },
    { name: "Wired", url: "https://www.wired.com", lang: "EN", priority: 1 },
    { name: "VentureBeat AI", url: "https://venturebeat.com", lang: "EN", priority: 1 },
    { name: "MIT Technology Review", url: "https://www.technologyreview.com", lang: "EN", priority: 1 },
    { name: "The Verge AI", url: "https://www.theverge.com", lang: "EN", priority: 1 },
    { name: "Reuters Technology", url: "https://www.reuters.com", lang: "EN", priority: 1 },
    { name: "AI News", url: "https://www.artificialintelligence-news.com", lang: "EN", priority: 1 },
    { name: "ZDNet", url: "https://www.zdnet.com", lang: "EN", priority: 2 },
    { name: "Ars Technica", url: "https://arstechnica.com", lang: "EN", priority: 2 },
    { name: "Il Sole 24 Ore Tecnologia", url: "https://www.ilsole24ore.com", lang: "IT", priority: 1 },
    { name: "Agenda Digitale", url: "https://www.agendadigitale.eu", lang: "IT", priority: 1 },
    { name: "Wired Italia", url: "https://www.wired.it", lang: "IT", priority: 1 },
    { name: "Corriere Innovazione", url: "https://www.corriere.it", lang: "IT", priority: 2 },
    { name: "Tom's Hardware Italia", url: "https://www.tomshw.it", lang: "IT", priority: 2 },
    { name: "Punto Informatico", url: "https://www.punto-informatico.it", lang: "IT", priority: 2 },
    { name: "Digital4Biz", url: "https://www.digital4.biz", lang: "IT", priority: 2 },
  ],
  music: [
    { name: "Billboard", url: "https://www.billboard.com", lang: "EN", priority: 1 },
    { name: "Rolling Stone", url: "https://www.rollingstone.com", lang: "EN", priority: 1 },
    { name: "NME", url: "https://www.nme.com", lang: "EN", priority: 1 },
    { name: "Pitchfork", url: "https://pitchfork.com", lang: "EN", priority: 1 },
    { name: "Music Business Worldwide", url: "https://www.musicbusinessworldwide.com", lang: "EN", priority: 1 },
    { name: "Variety Music", url: "https://variety.com", lang: "EN", priority: 2 },
    { name: "Consequence of Sound", url: "https://consequence.net", lang: "EN", priority: 2 },
    { name: "Rockol", url: "https://www.rockol.it", lang: "IT", priority: 1 },
    { name: "Rolling Stone Italia", url: "https://www.rollingstone.it", lang: "IT", priority: 1 },
    { name: "Soundsblog", url: "https://www.soundsblog.it", lang: "IT", priority: 2 },
    { name: "Rumore", url: "https://www.rumoremag.com", lang: "IT", priority: 2 },
    { name: "Sentireascoltare", url: "https://www.sentireascoltare.com", lang: "IT", priority: 2 },
    { name: "All Music Italia", url: "https://www.allmusicitalia.it", lang: "IT", priority: 2 },
    { name: "Loud and Clear", url: "https://loudandclearreviews.com", lang: "EN", priority: 3 },
  ],
  startup: [
    { name: "TechCrunch Startups", url: "https://techcrunch.com", lang: "EN", priority: 1 },
    { name: "Sifted", url: "https://sifted.eu", lang: "EN", priority: 1 },
    { name: "Crunchbase News", url: "https://news.crunchbase.com", lang: "EN", priority: 1 },
    { name: "VentureBeat", url: "https://venturebeat.com", lang: "EN", priority: 1 },
    { name: "EU-Startups", url: "https://www.eu-startups.com", lang: "EN", priority: 1 },
    { name: "Forbes Entrepreneurs", url: "https://www.forbes.com", lang: "EN", priority: 2 },
    { name: "Wired Startup", url: "https://www.wired.com", lang: "EN", priority: 2 },
    { name: "Startup Italia", url: "https://www.startupitalia.eu", lang: "IT", priority: 1 },
    { name: "Il Sole 24 Ore Startup", url: "https://www.ilsole24ore.com", lang: "IT", priority: 1 },
    { name: "Corriere Economia", url: "https://www.corriere.it", lang: "IT", priority: 2 },
    { name: "Repubblica Economia", url: "https://www.repubblica.it", lang: "IT", priority: 2 },
    { name: "Startup Business", url: "https://www.startupbusiness.it", lang: "IT", priority: 1 },
    { name: "Ninja Marketing", url: "https://www.ninjamarketing.it", lang: "IT", priority: 2 },
    { name: "Economyup", url: "https://www.economyup.it", lang: "IT", priority: 1 },
  ],
};

export default function AdminRssMonitor() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [activeSection, setActiveSection] = useState<"ai" | "music" | "startup">("ai");
  const [scrapingSection, setScrapingSection] = useState<Section | null>(null);
  const [fixingUrls, setFixingUrls] = useState<Section | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  // Statistiche notizie nel DB
  const statsQuery = trpc.adminTools.newsStats.useQuery(undefined, {
    enabled: user?.role === "admin",
    refetchInterval: 30_000,
  });

  // Trigger scraping RSS
  const triggerScrapingMutation = trpc.adminTools.triggerRssScraping.useMutation({
    onSuccess: (data) => {
      setScrapingSection(null);
      setLastAction(`✅ ${data.message}`);
      toast.success(data.message);
      setTimeout(() => statsQuery.refetch(), 5000);
    },
    onError: (err) => {
      setScrapingSection(null);
      toast.error("Errore: " + err.message);
    },
  });

  // Fix URL nel DB
  const fixUrlsMutation = trpc.adminTools.fixSourceUrls.useMutation({
    onSuccess: (data) => {
      setFixingUrls(null);
      setLastAction(`✅ ${data.message} (${data.alreadyOk} già ok, ${data.failed} falliti)`);
      toast.success(data.message);
      statsQuery.refetch();
    },
    onError: (err) => {
      setFixingUrls(null);
      toast.error("Errore fix URL: " + err.message);
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f0f0f" }}>
        <div className="w-8 h-8 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f0f0f" }}>
        <div className="text-center">
          <p className="text-white/60 mb-4">Accesso riservato agli amministratori.</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-lg text-sm font-bold"
            style={{ background: "#1a1a1a", color: "#0f0f0f" }}
          >
            Torna alla Home
          </button>
        </div>
      </div>
    );
  }

  const stats = statsQuery.data;
  const sources = RSS_SOURCES[activeSection];
  const sectionColor = SECTION_COLORS[activeSection];

  return (
    <div className="min-h-screen" style={{ background: "#0f0f0f", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
      {/* Header */}
      <div className="border-b border-white/8" style={{ background: "#060a14" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/admin")} className="text-white/40 hover:text-white transition-colors text-sm">
              ← Admin
            </button>
            <span className="text-white/20">/</span>
            <span className="text-sm font-bold" style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
              📡 Monitor RSS
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-white/40">{user.name ?? user.email}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Titolo */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
            Monitor Qualità Fonti RSS
          </h1>
          <p className="text-white/50 text-sm">
            Monitora le fonti certificate, verifica lo stato dei sourceUrl nel DB e avvia scraping manuale per ogni sezione.
          </p>
        </div>

        {/* Action result banner */}
        {lastAction && (
          <div className="mb-6 p-4 rounded-xl border border-[#1a1a1a]/30" style={{ background: "rgba(0,229,200,0.06)" }}>
            <p className="text-sm font-medium" style={{ color: "#1a1a1a" }}>{lastAction}</p>
          </div>
        )}

        {/* Stats per sezione */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {(["ai", "music", "startup"] as const).map((sec) => {
            const s = stats?.[sec];
            const total = s?.total ?? 0;
            const ok = s?.homepageUrls ?? 0;
            const bad = s?.specificUrls ?? 0;
            const missing = s?.missingUrls ?? 0;
            const pct = total > 0 ? Math.round((ok / total) * 100) : 0;
            const color = SECTION_COLORS[sec];

            return (
              <div
                key={sec}
                className="rounded-2xl border p-6 cursor-pointer transition-all"
                style={{
                  background: activeSection === sec ? `rgba(${sec === "ai" ? "0,229,200" : sec === "music" ? "139,92,246" : "255,85,0"},0.08)` : "rgba(255,255,255,0.02)",
                  borderColor: activeSection === sec ? color : "rgba(255,255,255,0.08)",
                }}
                onClick={() => setActiveSection(sec)}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>{SECTION_LABELS[sec]}</span>
                  <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ background: `${color}20`, color }}>
                    {statsQuery.isLoading ? "..." : `${pct}% ok`}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 rounded-full mb-4 overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: pct >= 90 ? "#22c55e" : pct >= 70 ? "#f59e0b" : "#ef4444" }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-black text-white">{statsQuery.isLoading ? "–" : ok}</div>
                    <div className="text-xs text-white/40">Homepage OK</div>
                  </div>
                  <div>
                    <div className="text-lg font-black" style={{ color: bad > 0 ? "#f59e0b" : "rgba(255,255,255,0.3)" }}>{statsQuery.isLoading ? "–" : bad}</div>
                    <div className="text-xs text-white/40">URL specifici</div>
                  </div>
                  <div>
                    <div className="text-lg font-black" style={{ color: missing > 0 ? "#ef4444" : "rgba(255,255,255,0.3)" }}>{statsQuery.isLoading ? "–" : missing}</div>
                    <div className="text-xs text-white/40">Mancanti</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Azioni rapide */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {/* Scraping per sezione */}
          {(["ai", "music", "startup"] as const).map((sec) => (
            <button
              key={sec}
              disabled={scrapingSection !== null}
              onClick={() => {
                setScrapingSection(sec);
                triggerScrapingMutation.mutate({ section: sec });
              }}
              className="rounded-xl p-4 text-left border transition-all disabled:opacity-50"
              style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}
            >
              <div className="text-lg mb-1">
                {scrapingSection === sec ? "⏳" : sec === "ai" ? "🤖" : sec === "music" ? "🎸" : "🚀"}
              </div>
              <div className="text-sm font-bold text-white">{scrapingSection === sec ? "Scraping..." : `Scraping ${SECTION_LABELS[sec]}`}</div>
              <div className="text-xs text-white/40 mt-1">Aggiorna notizie da RSS</div>
            </button>
          ))}

          {/* Fix URL tutti */}
          <button
            disabled={fixingUrls !== null}
            onClick={() => {
              setFixingUrls("all");
              fixUrlsMutation.mutate({ section: "all" });
            }}
            className="rounded-xl p-4 text-left border transition-all disabled:opacity-50"
            style={{ background: "rgba(255,85,0,0.05)", borderColor: "rgba(255,85,0,0.2)" }}
          >
            <div className="text-lg mb-1">{fixingUrls === "all" ? "⏳" : "🔧"}</div>
            <div className="text-sm font-bold text-white">{fixingUrls === "all" ? "Fix in corso..." : "Fix URL (tutto il DB)"}</div>
            <div className="text-xs text-white/40 mt-1">Corregge URL non-homepage</div>
          </button>
        </div>

        {/* Fonti certificate per sezione attiva */}
        <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
          {/* Tab sezione */}
          <div className="flex border-b border-white/8">
            {(["ai", "music", "startup"] as const).map((sec) => (
              <button
                key={sec}
                onClick={() => setActiveSection(sec)}
                className="flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all"
                style={{
                  color: activeSection === sec ? SECTION_COLORS[sec] : "rgba(255,255,255,0.3)",
                  borderBottom: activeSection === sec ? `2px solid ${SECTION_COLORS[sec]}` : "2px solid transparent",
                  background: activeSection === sec ? `rgba(${sec === "ai" ? "0,229,200" : sec === "music" ? "139,92,246" : "255,85,0"},0.05)` : "transparent",
                }}
              >
                {SECTION_LABELS[sec]}
              </button>
            ))}
          </div>

          {/* Intestazione tabella */}
          <div className="grid grid-cols-12 gap-2 px-6 py-3 border-b border-white/5">
            <div className="col-span-5 text-xs text-white/30 uppercase tracking-wider">Fonte</div>
            <div className="col-span-3 text-xs text-white/30 uppercase tracking-wider">Homepage</div>
            <div className="col-span-2 text-xs text-white/30 uppercase tracking-wider">Lingua</div>
            <div className="col-span-2 text-xs text-white/30 uppercase tracking-wider">Priorità</div>
          </div>

          {/* Righe fonti */}
          {sources.map((source, i) => (
            <div
              key={i}
              className="grid grid-cols-12 gap-2 px-6 py-4 border-b border-white/5 hover:bg-white/2 transition-colors items-center"
            >
              <div className="col-span-5">
                <span className="text-sm font-semibold text-white">{source.name}</span>
              </div>
              <div className="col-span-3">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs transition-colors truncate block"
                  style={{ color: sectionColor }}
                  onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
                >
                  {source.url.replace("https://", "")}
                </a>
              </div>
              <div className="col-span-2">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: source.lang === "IT" ? "rgba(0,229,200,0.15)" : "rgba(255,255,255,0.08)",
                    color: source.lang === "IT" ? "#1a1a1a" : "rgba(255,255,255,0.5)",
                  }}
                >
                  {source.lang}
                </span>
              </div>
              <div className="col-span-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3].map((p) => (
                    <div
                      key={p}
                      className="w-2 h-2 rounded-full"
                      style={{ background: p <= (4 - source.priority) ? sectionColor : "rgba(255,255,255,0.1)" }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Footer con totali */}
          <div className="px-6 py-4 flex items-center justify-between">
            <span className="text-xs text-white/30">
              {sources.length} fonti certificate · {sources.filter(s => s.lang === "IT").length} italiane · {sources.filter(s => s.lang === "EN").length} internazionali
            </span>
            <span className="text-xs text-white/30">
              Aggiornamento automatico ogni giorno alle {activeSection === "ai" ? "00:00" : activeSection === "music" ? "00:30" : "01:00"} CET
            </span>
          </div>
        </div>

        {/* Legenda */}
        <div className="mt-6 p-4 rounded-xl border border-white/5" style={{ background: "rgba(255,255,255,0.01)" }}>
          <p className="text-xs text-white/30 leading-relaxed">
            <strong className="text-white/50">Come funziona l'audit:</strong> Ad ogni aggiornamento RSS, il sistema verifica ogni sourceUrl con una richiesta HTTP reale. Se l'URL risponde con 404 o non è raggiungibile, viene automaticamente sostituito con la homepage del dominio. Se il dominio non è in whitelist, viene usata la fonte di fallback della sezione. Il fix manuale "Fix URL (tutto il DB)" corregge tutte le notizie esistenti in batch.
          </p>
        </div>
      </div>
    </div>
  );
}
