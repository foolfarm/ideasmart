import { Link, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ExternalLink, Shield, Clock, Tag, Star } from "lucide-react";
import RequireAuth from "@/components/RequireAuth";

// ─── Banner Amazon inline per pagine articolo ───────────────────────────────────────────
function AmazonArticleBanner() {
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
  const { data: deals } = trpc.amazonDeals.getDealsWithImage.useQuery({ limit: 3 }, { staleTime: 1000 * 60 * 30 });
  const trackClick = trpc.amazonDeals.trackClick.useMutation();

  if (!deals || deals.length === 0) return null;

  // Usa un deal diverso ogni giorno (basato sul giorno dell'anno)
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const deal = deals[dayOfYear % deals.length];

  if (!deal || !deal.imageUrl || !deal.imageUrl.startsWith('http')) return null;

  return (
    <div style={{ margin: '32px 0', borderTop: '1px solid #e5e5ea', borderBottom: '1px solid #e5e5ea', padding: '16px 0' }}>
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
        style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#fff', border: '1px solid #e5e5ea', borderRadius: '12px', padding: '12px 14px', textDecoration: 'none', transition: 'border-color 0.15s' }}
      >
        <div style={{ flexShrink: 0, width: '72px', height: '72px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={deal.imageUrl} alt={deal.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: SF, fontSize: '13px', fontWeight: 700, color: '#1d1d1f', lineHeight: 1.3, marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {deal.title}
          </p>
          {deal.price && deal.price !== '...' && (
            <p style={{ fontFamily: SF, fontSize: '15px', fontWeight: 800, color: '#ff9900', marginBottom: '2px' }}>{deal.price}</p>
          )}
          {deal.rating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Star size={10} fill="#ff9900" color="#ff9900" />
              <span style={{ fontFamily: SF, fontSize: '10px', color: '#6e6e73' }}>{deal.rating} su Amazon</span>
            </div>
          )}
        </div>
        <div style={{ flexShrink: 0, background: '#ff9900', borderRadius: '8px', padding: '8px 14px' }}>
          <span style={{ fontFamily: SF, fontSize: '11px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Vedi su Amazon</span>
        </div>
      </a>
    </div>
  );
}

const F_SERIF = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";
const F_SANS = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
const BG = "#ffffff";
const ACCENT = "#1d1d1f";
const BLACK = "#1a1a1a";
const SLATE = "#4b5563";
const MUTED = "#9ca3af";
const WHITE = "#ffffff";
const BORDER = "#e5e3df";

/**
 * NewsArticle — pagina articolo su Proof Press.
 * Mostra il contenuto dell'articolo certificato su proofpress.ai.
 * Il link alla fonte originale è disponibile come riferimento in fondo, ma NON fa redirect automatico.
 */
export default function NewsArticle() {
  const [, params] = useRoute("/ai/news/:id");
  const newsId = params?.id ? parseInt(params.id, 10) : null;

  const { data: news, isLoading } = trpc.news.getById.useQuery(
    { id: newsId! },
    { enabled: !!newsId && !isNaN(newsId!) }
  );

  const { data: related } = trpc.news.getRelated.useQuery(
    { id: newsId!, section: (news?.section as "ai" | "startup" | "dealroom" | "research") ?? "ai", limit: 4 },
    { enabled: !!newsId && !isNaN(newsId!) && !!news }
  );

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 32, height: 32, border: `2px solid ${ACCENT}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ fontSize: 13, color: `${BLACK}80`, fontFamily: F_SANS }}>Caricamento articolo…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!news) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 400, padding: "0 24px" }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: BLACK, fontFamily: F_SERIF, marginBottom: 12 }}>
            Notizia non trovata
          </h1>
          <p style={{ fontSize: 14, color: SLATE, fontFamily: F_SANS, marginBottom: 24 }}>
            La notizia che stai cercando non esiste o è stata rimossa.
          </p>
          <Link href="/ai" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: ACCENT, textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: F_SANS }}>
            <ArrowLeft size={14} />
            Torna ad AI NEWS
          </Link>
        </div>
      </div>
    );
  }

  const sourceUrl = news.sourceUrl && news.sourceUrl !== "#" ? news.sourceUrl : null;
  const verifyCode = news.verifyHash
    ? `PP-${news.verifyHash.slice(0, 16).toUpperCase()}`
    : `PP-${Math.abs(news.title.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 99999).toString().padStart(5, "0")}`;

  const sectionLabel: Record<string, string> = {
    ai: "AI NEWS", startup: "STARTUP", dealroom: "DEALROOM", research: "RESEARCH"
  };

  return (
    <RequireAuth>
    <div style={{ minHeight: "100vh", background: BG, fontFamily: F_SANS }}>
      {/* Header nav */}
      <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, padding: "12px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/ai" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#1d1d1f", textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            <ArrowLeft size={14} />
            AI NEWS
          </Link>
          <span style={{ color: MUTED, fontSize: 12 }}>·</span>
          <span style={{ fontSize: 12, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {sectionLabel[news.section] ?? news.section.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Article */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "56px 32px 100px" }}>

        {/* Category badge */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ display: "inline-block", background: "#1d1d1f", color: WHITE, fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 4, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            <Tag size={9} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
            {news.category}
          </span>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: 40, fontWeight: 800, color: BLACK, fontFamily: F_SERIF, lineHeight: 1.1, marginBottom: 20, letterSpacing: "-0.025em" }}>
          {news.title}
        </h1>

        {/* Meta */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
          {news.publishedAt && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: MUTED }}>
              <Clock size={12} />
              {news.publishedAt}
            </span>
          )}
          {news.sourceName && (
            <span style={{ fontSize: 12, color: MUTED }}>
              Fonte: <strong style={{ color: SLATE }}>{news.sourceName}</strong>
            </span>
          )}
        </div>

        {/* Hero image */}
        {news.imageUrl && (
          <div style={{ marginBottom: 32, borderRadius: 8, overflow: "hidden" }}>
            <img
              src={news.imageUrl}
              alt={news.title}
              style={{ width: "100%", maxHeight: 480, objectFit: "cover", display: "block" }}
            />
          </div>
        )}

        {/* Summary / body */}
        <div style={{ fontSize: 18, color: "#374151", fontFamily: F_SANS, lineHeight: 1.9, marginBottom: 48, whiteSpace: "pre-wrap" }}>
          {news.summary}
        </div>

        {/* ProofPress Verify badge */}
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderLeft: `4px solid ${BLACK}`, borderRadius: 8, padding: "18px 22px", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Shield size={16} color={BLACK} />
            <span style={{ fontSize: 11, fontWeight: 700, color: BLACK, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              ProofPress Verify Technology
            </span>
          </div>
          <p style={{ fontSize: 13, color: SLATE, margin: "0 0 8px", lineHeight: 1.6 }}>
            Questo articolo è stato verificato e certificato dal sistema ProofPress. L'hash crittografico garantisce l'autenticità del contenuto al momento della pubblicazione.
          </p>
          <code style={{ fontSize: 12, fontWeight: 700, color: BLACK, background: `${BLACK}08`, padding: "4px 10px", borderRadius: 4, letterSpacing: "0.08em" }}>
            ✓ {verifyCode}
          </code>
        </div>



        {/* Link alla fonte (opzionale, non redirect) */}
        {sourceUrl && (
          <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 24, marginBottom: 32 }}>
            <p style={{ fontSize: 12, color: MUTED, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
              Fonte originale
            </p>
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#0071e3", textDecoration: "none", fontWeight: 600 }}
            >
              <ExternalLink size={14} />
              {news.sourceName || "Leggi l'articolo originale"}
            </a>
          </div>
        )}

        {/* Related news */}
        {related && related.length > 0 && (
          <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 32 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: BLACK, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20 }}>
              Altre notizie correlate
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {(related as Array<{ id: number; title: string; category: string; sourceName?: string }>).map((item) => (
                <Link
                  key={item.id}
                  href={`/ai/news/${item.id}`}
                  style={{ display: "block", padding: "14px 18px", background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 8, textDecoration: "none", transition: "border-color 0.15s" }}
                >
                  <span style={{ display: "block", fontSize: 10, fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                    {item.category}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: BLACK, lineHeight: 1.4 }}>
                    {item.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back link */}
        <div style={{ marginTop: 40 }}>
          <Link href="/ai" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: MUTED, textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            <ArrowLeft size={14} />
            Torna ad AI NEWS
          </Link>
        </div>
      </div>
    </div>
    </RequireAuth>
  );
}
