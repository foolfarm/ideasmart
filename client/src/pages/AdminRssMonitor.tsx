/**
 * IDEASMART — Monitor RSS
 * Stile Apple monocromatico con AdminHeader condiviso
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { useLocation } from "wouter";
import AdminHeader from "@/components/AdminHeader";

type Section = "ai" | "startup" | "dealroom" | "all";

const C = {
  bg: "#f5f5f7",
  white: "#ffffff",
  black: "#1d1d1f",
  mid: "#6e6e73",
  light: "#aeaeb2",
  border: "#e5e5ea",
  font: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
};

const SECTION_LABELS: Record<string, string> = {
  ai: "AI NEWS",
  startup: "STARTUP NEWS",
  dealroom: "DEALROOM",
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
    { name: "Digital4Biz", url: "https://www.digital4.biz", lang: "IT", priority: 2 }
  ],
  startup: [
    { name: "TechCrunch Startups", url: "https://techcrunch.com", lang: "EN", priority: 1 },
    { name: "Sifted", url: "https://sifted.eu", lang: "EN", priority: 1 },
    { name: "Crunchbase News", url: "https://news.crunchbase.com", lang: "EN", priority: 1 },
    { name: "VentureBeat", url: "https://venturebeat.com", lang: "EN", priority: 1 },
    { name: "EU-Startups", url: "https://www.eu-startups.com", lang: "EN", priority: 1 },
    { name: "Forbes Entrepreneurs", url: "https://www.forbes.com", lang: "EN", priority: 2 },
    { name: "Wired Startup", url: "https://www.wired.com", lang: "EN", priority: 2 },
    { name: "StartupItalia", url: "https://www.startupitalia.eu", lang: "IT", priority: 1 },
    { name: "Il Sole 24 Ore Startup", url: "https://www.ilsole24ore.com", lang: "IT", priority: 1 },
    { name: "Corriere Innovazione", url: "https://www.corriere.it", lang: "IT", priority: 2 },
    { name: "Repubblica Economia", url: "https://www.repubblica.it", lang: "IT", priority: 2 },
    { name: "Startup Business", url: "https://www.startupbusiness.it", lang: "IT", priority: 1 },
    { name: "Ninja Marketing", url: "https://www.ninjamarketing.it", lang: "IT", priority: 2 },
    { name: "EconomyUp", url: "https://www.economyup.it", lang: "IT", priority: 1 },
    { name: "ScaleUp Italy", url: "https://scaleupitaly.com", lang: "IT", priority: 2 },
    { name: "Econopoly (Il Sole 24 Ore)", url: "https://www.econopoly.ilsole24ore.com", lang: "IT", priority: 2 },
    { name: "Forbes Italia", url: "https://forbes.it", lang: "IT", priority: 1 },
    { name: "Agenda Digitale Startup", url: "https://www.agendadigitale.eu", lang: "IT", priority: 2 },
    { name: "Il Post Startup", url: "https://www.ilpost.it", lang: "IT", priority: 2 },
    { name: "HuffPost Innovazione", url: "https://www.huffingtonpost.it", lang: "IT", priority: 2 },
    { name: "Open Online", url: "https://www.open.online", lang: "IT", priority: 2 },
    { name: "Panorama Economia", url: "https://www.panorama.it", lang: "IT", priority: 2 },
    { name: "Milano Investment", url: "https://milanoinvestment.com", lang: "IT", priority: 2 },
  ],
  dealroom: [
    { name: "Dealroom.co", url: "https://dealroom.co", lang: "EN", priority: 1 },
    { name: "Crunchbase News", url: "https://news.crunchbase.com", lang: "EN", priority: 1 },
    { name: "PitchBook", url: "https://pitchbook.com", lang: "EN", priority: 1 },
    { name: "Sifted", url: "https://sifted.eu", lang: "EN", priority: 1 },
    { name: "TechCrunch Funding", url: "https://techcrunch.com", lang: "EN", priority: 1 },
    { name: "BeBeez", url: "https://bebeez.it", lang: "IT", priority: 1 },
    { name: "Startup Italia Funding", url: "https://www.startupitalia.eu", lang: "IT", priority: 1 },
    { name: "Il Sole 24 Ore Finanza", url: "https://www.ilsole24ore.com", lang: "IT", priority: 1 }
  ]
};

export default function AdminRssMonitor() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [activeSection, setActiveSection] = useState<Section>("ai");
  const [scrapingSection, setScrapingSection] = useState<Section | null>(null);
  const [fixingUrls, setFixingUrls] = useState<Section | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const statsQuery = trpc.adminTools.newsStats.useQuery(undefined, {
    enabled: user?.role === "admin",
    refetchInterval: 30_000
  });

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
    }
  });

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
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: C.black }} />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <div className="text-center">
          <p className="text-sm mb-4" style={{ color: C.mid, fontFamily: C.font }}>Accesso riservato agli amministratori.</p>
          <button onClick={() => navigate("/")} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: C.black, color: "#fff" }}>
            Torna alla Home
          </button>
        </div>
      </div>
    );
  }

  const stats = statsQuery.data;
  const sources = (RSS_SOURCES as Record<string, typeof RSS_SOURCES.ai>)[activeSection] || [];

  return (
    <div className="min-h-screen" style={{ background: C.bg, fontFamily: C.font }}>
      <AdminHeader title="Monitor RSS" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Titolo */}
        <div className="mb-6">
          <h1 className="text-xl font-bold mb-1" style={{ color: C.black }}>Monitor Qualità Fonti RSS</h1>
          <p className="text-sm" style={{ color: C.mid }}>
            Monitora le fonti certificate, verifica lo stato dei sourceUrl nel DB e avvia scraping manuale per ogni sezione.
          </p>
        </div>

        {/* Action result banner */}
        {lastAction && (
          <div className="mb-5 p-3 rounded-xl border" style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}>
            <p className="text-sm font-medium" style={{ color: "#166534" }}>{lastAction}</p>
          </div>
        )}

        {/* Stats per sezione */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {(["ai", "startup", "dealroom"] as const).map((sec) => {
            const s = stats?.[sec];
            const total = s?.total ?? 0;
            const ok = s?.homepageUrls ?? 0;
            const bad = s?.specificUrls ?? 0;
            const missing = s?.missingUrls ?? 0;
            const pct = total > 0 ? Math.round((ok / total) * 100) : 0;

            return (
              <div
                key={sec}
                className="rounded-2xl border p-5 cursor-pointer transition-all"
                style={{
                  background: activeSection === sec ? "#f0f0f5" : C.white,
                  borderColor: activeSection === sec ? C.black : C.border,
                }}
                onClick={() => setActiveSection(sec)}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.black }}>{SECTION_LABELS[sec]}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "#f0f0f5", color: C.mid }}>
                    {statsQuery.isLoading ? "..." : `${pct}% ok`}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 rounded-full mb-4 overflow-hidden" style={{ background: C.border }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: pct >= 90 ? "#22c55e" : pct >= 70 ? "#f59e0b" : "#ef4444" }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-black" style={{ color: C.black }}>{statsQuery.isLoading ? "–" : ok}</div>
                    <div className="text-xs" style={{ color: C.mid }}>Homepage OK</div>
                  </div>
                  <div>
                    <div className="text-lg font-black" style={{ color: bad > 0 ? "#f59e0b" : C.light }}>{statsQuery.isLoading ? "–" : bad}</div>
                    <div className="text-xs" style={{ color: C.mid }}>URL specifici</div>
                  </div>
                  <div>
                    <div className="text-lg font-black" style={{ color: missing > 0 ? "#ef4444" : C.light }}>{statsQuery.isLoading ? "–" : missing}</div>
                    <div className="text-xs" style={{ color: C.mid }}>Mancanti</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Azioni rapide */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {(["ai", "startup", "dealroom"] as const).map((sec) => (
            <button
              key={sec}
              disabled={scrapingSection !== null}
              onClick={() => {
                setScrapingSection(sec);
                triggerScrapingMutation.mutate({ section: sec });
              }}
              className="rounded-xl p-4 text-left border transition-all disabled:opacity-50 hover:bg-[#f0f0f5]"
              style={{ background: C.white, borderColor: C.border }}
            >
              <div className="text-sm font-semibold mb-1" style={{ color: C.black }}>
                {scrapingSection === sec ? "⏳ Scraping..." : `Scraping ${SECTION_LABELS[sec]}`}
              </div>
              <div className="text-xs" style={{ color: C.mid }}>Aggiorna notizie da RSS</div>
            </button>
          ))}

          <button
            disabled={fixingUrls !== null}
            onClick={() => {
              setFixingUrls("all");
              fixUrlsMutation.mutate({ section: "all" });
            }}
            className="rounded-xl p-4 text-left border transition-all disabled:opacity-50 hover:bg-[#fff5f0]"
            style={{ background: "#fff8f5", borderColor: "#ffd0b8" }}
          >
            <div className="text-sm font-semibold mb-1" style={{ color: C.black }}>
              {fixingUrls === "all" ? "⏳ Fix in corso..." : "🔧 Fix URL (tutto il DB)"}
            </div>
            <div className="text-xs" style={{ color: C.mid }}>Corregge URL non-homepage</div>
          </button>
        </div>

        {/* Fonti certificate per sezione attiva */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: C.white, borderColor: C.border }}>
          {/* Tab sezione */}
          <div className="flex border-b" style={{ borderColor: C.border }}>
            {(["ai", "startup", "dealroom"] as const).map((sec) => (
              <button
                key={sec}
                onClick={() => setActiveSection(sec)}
                className="flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all"
                style={{
                  color: activeSection === sec ? C.black : C.mid,
                  borderBottom: activeSection === sec ? `2px solid ${C.black}` : "2px solid transparent",
                  background: activeSection === sec ? "#f5f5f7" : "transparent",
                }}
              >
                {SECTION_LABELS[sec]}
              </button>
            ))}
          </div>

          {/* Intestazione tabella */}
          <div className="grid grid-cols-12 gap-2 px-6 py-3 border-b" style={{ borderColor: C.border, background: "#f9f9fb" }}>
            <div className="col-span-5 text-xs font-semibold uppercase tracking-wider" style={{ color: C.light }}>Fonte</div>
            <div className="col-span-3 text-xs font-semibold uppercase tracking-wider" style={{ color: C.light }}>Homepage</div>
            <div className="col-span-2 text-xs font-semibold uppercase tracking-wider" style={{ color: C.light }}>Lingua</div>
            <div className="col-span-2 text-xs font-semibold uppercase tracking-wider" style={{ color: C.light }}>Priorità</div>
          </div>

          {/* Righe fonti */}
          {sources.map((source: any, i: number) => (
            <div
              key={i}
              className="grid grid-cols-12 gap-2 px-6 py-3.5 border-b hover:bg-[#f9f9fb] transition-colors items-center"
              style={{ borderColor: C.border }}
            >
              <div className="col-span-5">
                <span className="text-sm font-medium" style={{ color: C.black }}>{source.name}</span>
              </div>
              <div className="col-span-3">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs transition-colors truncate block hover:underline"
                  style={{ color: "#007aff" }}
                >
                  {source.url.replace("https://", "")}
                </a>
              </div>
              <div className="col-span-2">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: source.lang === "IT" ? "#e8f5e9" : "#f0f0f5",
                    color: source.lang === "IT" ? "#2e7d32" : C.mid,
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
                      style={{ background: p <= (4 - source.priority) ? C.black : C.border }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Footer con totali */}
          <div className="px-6 py-4 flex items-center justify-between" style={{ background: "#f9f9fb" }}>
            <span className="text-xs" style={{ color: C.light }}>
              {sources.length} fonti · {sources.filter((s: any) => s.lang === "IT").length} italiane · {sources.filter((s: any) => s.lang === "EN").length} internazionali
            </span>
            <span className="text-xs" style={{ color: C.light }}>
              Aggiornamento automatico ogni giorno alle {activeSection === "ai" ? "00:00" : activeSection === "dealroom" ? "01:30" : "01:00"} CET
            </span>
          </div>
        </div>

        {/* Legenda */}
        <div className="mt-5 p-4 rounded-xl border" style={{ background: "#f9f9fb", borderColor: C.border }}>
          <p className="text-xs leading-relaxed" style={{ color: C.mid }}>
            <strong style={{ color: C.black }}>Come funziona l'audit:</strong> Ad ogni aggiornamento RSS, il sistema verifica ogni sourceUrl con una richiesta HTTP reale. Se l'URL risponde con 404 o non è raggiungibile, viene automaticamente sostituito con la homepage del dominio. Il fix manuale "Fix URL (tutto il DB)" corregge tutte le notizie esistenti in batch.
          </p>
        </div>
      </div>
    </div>
  );
}
