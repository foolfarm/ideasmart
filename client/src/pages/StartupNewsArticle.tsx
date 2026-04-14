import { useEffect } from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ExternalLink, Star } from "lucide-react";
import RequireAuth from "@/components/RequireAuth";
import { HPFSquare, HPFLeaderboard, HPFMobileBanner } from "@/components/HPFAd";

// ─── Banner Amazon compatto per pagine articolo ───────────────────────────────────────────
function AmazonArticleBanner() {
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
  const { data: deals } = trpc.amazonDeals.getDealsWithImage.useQuery({ limit: 3 }, { staleTime: 1000 * 60 * 30 });
  const trackClick = trpc.amazonDeals.trackClick.useMutation();

  if (!deals || deals.length === 0) return null;

  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const deal = deals[dayOfYear % deals.length];

  if (!deal || !deal.imageUrl || !deal.imageUrl.startsWith('http')) return null;

  return (
    <div style={{ margin: '24px auto', maxWidth: '400px', borderTop: '1px solid #e5e5ea', borderBottom: '1px solid #e5e5ea', padding: '14px 0' }}>
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
        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
          <p style={{ fontFamily: SF, fontSize: '12px', fontWeight: 700, color: '#1d1d1f', lineHeight: 1.3, marginBottom: '3px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {deal.title}
          </p>
          {deal.price && deal.price !== '...' && (
            <p style={{ fontFamily: SF, fontSize: '13px', fontWeight: 800, color: '#ff9900' }}>{deal.price}</p>
          )}
          {deal.rating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Star size={10} fill="#ff9900" color="#ff9900" />
              <span style={{ fontFamily: SF, fontSize: '10px', color: '#6e6e73' }}>{deal.rating}</span>
            </div>
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
 * StartupNewsArticle — redirect automatico alla fonte originale.
 * Non mostra una pagina intermedia: appena caricato il sourceUrl,
 * reindirizza l'utente direttamente all'articolo originale.
 */
export default function StartupNewsArticle() {
  const [, params] = useRoute("/startup/news/:id");
  const newsId = params?.id ? parseInt(params.id, 10) : null;

  const { data: news, isLoading } = trpc.news.getById.useQuery(
    { id: newsId! },
    { enabled: !!newsId && !isNaN(newsId!) }
  );

  useEffect(() => {
    if (news?.sourceUrl && news.sourceUrl !== "#") {
      window.location.href = news.sourceUrl;
    }
  }, [news]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#2a2a2a] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#1a1a1a]/50" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
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
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-3"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
            Notizia non trovata
          </h1>
          <p className="text-sm text-[#1a1a1a]/60 mb-6"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
            La notizia che stai cercando non esiste o è stata rimossa.
          </p>
          <Link href="/startup" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
            style={{ color: "#2a2a2a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
            <ArrowLeft className="w-4 h-4" />
            Torna a STARTUP NEWS
          </Link>
        </div>
      </div>
    );
  }

  const sourceUrl = news.sourceUrl && news.sourceUrl !== "#" ? news.sourceUrl : null;

  return (
    <RequireAuth>
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
      <div className="text-center max-w-lg px-4">
        <div className="w-8 h-8 border-2 border-[#2a2a2a] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <h2 className="text-xl font-bold text-[#1a1a1a] mb-2"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
          {news.title}
        </h2>
        <p className="text-sm text-[#1a1a1a]/60 mb-6"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
          Reindirizzamento all'articolo originale…
        </p>
        {sourceUrl ? (
          <a href={sourceUrl}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
            style={{ color: "#2a2a2a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
            <ExternalLink className="w-4 h-4" />
            Apri articolo su {news.sourceName || "fonte originale"}
          </a>
        ) : (
          <Link href="/startup" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
            style={{ color: "#2a2a2a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
            <ArrowLeft className="w-4 h-4" />
            Torna a STARTUP NEWS
          </Link>
        )}
        {/* ── HPF Square 300x250 ── */}
        <div className="my-4 flex justify-center">
          <HPFSquare />
        </div>

        {/* ── HPF Leaderboard 728x90 (desktop) ── */}
        <div className="hidden sm:flex justify-center my-6">
          <HPFLeaderboard />
        </div>

        {/* ── HPF Mobile Banner 320x50 (mobile) ── */}
        <div className="flex sm:hidden justify-center my-3">
          <HPFMobileBanner />
        </div>

        {/* ── HPF Square 300x250 secondo ── */}
        <div className="mt-8 mb-4 flex justify-center">
          <HPFSquare />
        </div>

        <div className="mt-4">
          <Link href="/startup" className="text-xs text-[#1a1a1a]/40 hover:text-[#1a1a1a]/70 transition-colors"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
            ← Torna alla sezione Startup
          </Link>
        </div>
      </div>
    </div>
    </RequireAuth>
  );
}
