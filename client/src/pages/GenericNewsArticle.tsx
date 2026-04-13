import { useEffect } from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Star } from "lucide-react";
import RequireAuth from "@/components/RequireAuth";

// ─── Banner Amazon compatto per pagine articolo generiche ───────────────────────────────────────────
function AmazonArticleBanner() {
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
  const { data: deals } = trpc.amazonDeals.getDealsWithImage.useQuery({ limit: 3 }, { staleTime: 1000 * 60 * 30 });
  const trackClick = trpc.amazonDeals.trackClick.useMutation();

  if (!deals || deals.length === 0) return null;

  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const deal = deals[dayOfYear % deals.length];

  if (!deal || !deal.imageUrl || !deal.imageUrl.startsWith('http')) return null;

  return (
    <div style={{ margin: '24px 0', borderTop: '1px solid #e5e5ea', borderBottom: '1px solid #e5e5ea', padding: '14px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ fontFamily: SF, fontSize: '9px', fontWeight: 700, color: '#ff9900', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Offerta Amazon</span>
        <div style={{ flex: 1, height: '1px', background: '#e5e5ea' }} />
        <span style={{ fontFamily: SF, fontSize: '8px', color: '#aeaeb2', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sponsorizzato</span>
      </div>
      <a
        href={deal.affiliateUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={() => trackClick.mutate({ id: deal.id })}
        style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', border: '1px solid #e5e5ea', borderRadius: '10px', padding: '10px 12px', textDecoration: 'none' }}
      >
        <div style={{ flexShrink: 0, width: '56px', height: '56px' }}>
          <img src={deal.imageUrl} alt={deal.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: SF, fontSize: '12px', fontWeight: 700, color: '#1d1d1f', lineHeight: 1.3, marginBottom: '3px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {deal.title}
          </p>
          {deal.price && deal.price !== '...' && (
            <p style={{ fontFamily: SF, fontSize: '13px', fontWeight: 800, color: '#ff9900' }}>{deal.price}</p>
          )}
        </div>
        <div style={{ flexShrink: 0, background: '#ff9900', borderRadius: '7px', padding: '7px 12px' }}>
          <span style={{ fontFamily: SF, fontSize: '10px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Vedi</span>
        </div>
      </a>
    </div>
  );
}

/**
 * GenericNewsArticle — pagina articolo generica per tutti i canali.
 * Riceve l'id dalla URL /:section/news/:id, carica la notizia dal DB
 * e reindirizza automaticamente alla fonte originale.
 * Questo garantisce traffico interno su Proof Press prima del redirect esterno.
 */
export default function GenericNewsArticle() {
  const [, params] = useRoute("/:section/news/:id");
  const section = params?.section ?? "";
  const newsId = params?.id ? parseInt(params.id, 10) : null;

  const { data: news, isLoading } = trpc.news.getById.useQuery(
    { id: newsId! },
    { enabled: !!newsId && !isNaN(newsId!) }
  );

  useEffect(() => {
    if (news?.sourceUrl && news.sourceUrl !== "#") {
      // Piccolo delay per permettere al browser di registrare la visita
      const timer = setTimeout(() => {
        window.location.href = news.sourceUrl!;
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [news]);

  // Mappa sezione → label e percorso di ritorno
  const sectionLabels: Record<string, { label: string; path: string }> = {
    ai: { label: "AI NEWS", path: "/ai" },
    startup: { label: "STARTUP NEWS", path: "/startup" },
    health: { label: "Health & Biotech", path: "/health" }
  };

  const sectionInfo = sectionLabels[section] ?? { label: "Proof Press", path: "/" };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#0a7ea4] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p
            className="text-sm text-[#1a1a1a]/50"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
          >
            Apertura articolo…
          </p>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <h1
            className="text-2xl font-bold text-[#1a1a1a] mb-3"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
          >
            Notizia non trovata
          </h1>
          <p
            className="text-sm text-[#1a1a1a]/60 mb-6"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}
          >
            La notizia che stai cercando non esiste o è stata rimossa.
          </p>
          <Link
            href={sectionInfo.path}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
            style={{ color: "#0a7ea4", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Torna a {sectionInfo.label}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <RequireAuth>
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="w-8 h-8 border-2 border-[#0a7ea4] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <p
          className="text-xs uppercase tracking-widest text-[#1a1a1a]/40 mb-3"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
        >
          {news.category}
        </p>
        <h1
          className="text-xl font-bold text-[#1a1a1a] mb-3 leading-tight"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
        >
          {news.title}
        </h1>
        <p
          className="text-sm text-[#1a1a1a]/60 mb-6"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}
        >
          Apertura articolo su {news.sourceName ?? "fonte originale"}…
        </p>
        {/* ── AMAZON DEAL BANNER ── */}
        <AmazonArticleBanner />

        <Link
          href={sectionInfo.path}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
          style={{ color: "#0a7ea4", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Torna a {sectionInfo.label}
        </Link>
      </div>
    </div>
    </RequireAuth>
  );
}
