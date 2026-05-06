/**
 * AmazonDealBanner — Componente riutilizzabile per spazi pubblicitari Amazon
 * Varianti: "sidebar" (verticale, 300px), "inline" (orizzontale, full-width),
 *           "strip" (banner sottile), "card" (card prodotto)
 * Rotazione: round-robin giornaliera automatica sui deal attivi
 */
import { trpc } from "@/lib/trpc";
import { ShoppingCart, Star, ExternalLink, Tag } from "lucide-react";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

type BannerVariant = "sidebar" | "inline" | "strip" | "card";

interface AmazonDealBannerProps {
  variant?: BannerVariant;
  offset?: number;       // Offset nella rotazione (0 = deal del giorno, 1 = secondo, ecc.)
  className?: string;
}

export default function AmazonDealBanner({
  variant = "sidebar",
  offset = 0,
  className = "",
}: AmazonDealBannerProps) {
  const { data: allDeals, isLoading } = trpc.amazonDeals.getDealsWithImage.useQuery(
    { limit: 12 },
    { staleTime: 1000 * 60 * 60 }
  );
  const trackClick = trpc.amazonDeals.trackClick.useMutation({ retry: false, onError: () => {} });

  // Solo deal con immagine valida per manchette e sidebar
  const deals = allDeals?.filter(d => d.imageUrl && d.imageUrl.startsWith('http')) ?? [];
  const deal = deals.length > 0 ? deals[offset % deals.length] : null;

  // ── LOADING ────────────────────────────────────────────────────────────────
  if (isLoading) {
    if (variant === "strip") {
      return (
        <div className={`w-full h-12 bg-[#f5f5f7] border border-[#e5e5ea] rounded-lg animate-pulse ${className}`} />
      );
    }
    return (
      <div className={`bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl animate-pulse ${className}`}
        style={{ height: variant === "sidebar" ? "280px" : "120px" }} />
    );
  }

  // ── NO DEAL (nessun deal con immagine: non mostrare nulla) ────────────────────────────────────────────
  if (!deal) return null;

  const handleClick = () => trackClick.mutate({ id: deal.id });

  // ── STRIP VARIANT (banner sottile full-width) ──────────────────────────────
  if (variant === "strip") {
    return (
      <div className={`w-full ${className}`}>
        <a
          href={deal.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleClick}
          className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-[#fff8ee] to-[#fff3e0] border border-[#ff9900]/30 rounded-lg hover:border-[#ff9900] transition-colors group"
          style={{ textDecoration: 'none' }}
        >
          <Tag size={14} color="#ff9900" strokeWidth={2} className="flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span style={{ fontFamily: SF, fontSize: '12px', fontWeight: 700, color: '#1d1d1f' }}>
              Offerta Amazon:{" "}
            </span>
            <span style={{ fontFamily: SF, fontSize: '12px', color: '#3a3a3c' }} className="truncate">
              {deal.title}
            </span>
          </div>
          {deal.price && deal.price !== '...' && (
            <span style={{ fontFamily: SF, fontSize: '13px', fontWeight: 800, color: '#ff9900', flexShrink: 0 }}>
              {deal.price}
            </span>
          )}
          <ExternalLink size={12} color="#ff9900" strokeWidth={2} className="flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
        </a>
        <p style={{ fontFamily: SF, fontSize: '9px', color: '#aeaeb2', textAlign: 'right', marginTop: '2px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Sponsorizzato · Amazon
        </p>
      </div>
    );
  }

  // ── INLINE VARIANT (orizzontale, per inserimento tra articoli) ─────────────
  if (variant === "inline") {
    return (
      <div className={`w-full ${className}`}>
        <a
          href={deal.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleClick}
          className="flex gap-4 p-4 border border-[#e5e5ea] rounded-xl bg-white hover:border-[#ff9900] transition-colors group"
          style={{ textDecoration: 'none' }}
        >
          {deal.imageUrl ? (
            <div className="flex-shrink-0 rounded-lg overflow-hidden border border-[#f0f0f0]" style={{ width: '80px', height: '80px', background: '#fff' }}>
              <img src={deal.imageUrl} alt={deal.title}
                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
            </div>
          ) : (
            <div className="flex-shrink-0 rounded-lg bg-[#f5f5f7] flex items-center justify-center" style={{ width: '80px', height: '80px' }}>
              <ShoppingCart size={24} color="#aeaeb2" strokeWidth={1.5} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span style={{ fontFamily: SF, fontSize: '9px', fontWeight: 700, color: '#ff9900', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Amazon Deal
              </span>
              {deal.category && (
                <span style={{ fontFamily: SF, fontSize: '9px', color: '#aeaeb2', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {deal.category}
                </span>
              )}
            </div>
            <p style={{ fontFamily: SF, fontSize: '14px', fontWeight: 700, color: '#1d1d1f', lineHeight: 1.3 }} className="line-clamp-2">
              {deal.title}
            </p>
            <div className="flex items-center gap-3 mt-2">
              {deal.price && deal.price !== '...' && (
                <span style={{ fontFamily: SF, fontSize: '16px', fontWeight: 800, color: '#ff9900' }}>{deal.price}</span>
              )}
              {deal.rating && (
                <div className="flex items-center gap-1">
                  <Star size={11} fill="#ff9900" color="#ff9900" />
                  <span style={{ fontFamily: SF, fontSize: '11px', color: '#6e6e73' }}>{deal.rating}</span>
                  {deal.reviewCount && (
                    <span style={{ fontFamily: SF, fontSize: '11px', color: '#aeaeb2' }}>({deal.reviewCount})</span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 flex items-center">
            <div className="px-4 py-2 bg-[#ff9900] group-hover:bg-[#e68900] transition-colors rounded-lg">
              <span style={{ fontFamily: SF, fontSize: '12px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
                Vedi su Amazon
              </span>
            </div>
          </div>
        </a>
        <p style={{ fontFamily: SF, fontSize: '9px', color: '#aeaeb2', textAlign: 'right', marginTop: '2px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Sponsorizzato · Amazon
        </p>
      </div>
    );
  }

  // ── CARD VARIANT (card prodotto compatta) ──────────────────────────────────
  if (variant === "card") {
    return (
      <div className={`${className}`}>
        <a
          href={deal.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleClick}
          className="block border border-[#e5e5ea] rounded-xl bg-white hover:border-[#ff9900] hover:shadow-md transition-all group overflow-hidden"
          style={{ textDecoration: 'none' }}
        >
          {deal.imageUrl ? (
            <div className="w-full bg-white" style={{ height: '160px' }}>
              <img src={deal.imageUrl} alt={deal.title}
                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '12px' }} />
            </div>
          ) : (
            <div className="w-full bg-[#f5f5f7] flex items-center justify-center" style={{ height: '120px' }}>
              <ShoppingCart size={32} color="#aeaeb2" strokeWidth={1.5} />
            </div>
          )}
          <div className="p-3 border-t border-[#f0f0f0]">
            <p style={{ fontFamily: SF, fontSize: '12px', fontWeight: 700, color: '#1d1d1f', lineHeight: 1.3 }} className="line-clamp-2 mb-2">
              {deal.title}
            </p>
            {deal.price && deal.price !== '...' && (
              <p style={{ fontFamily: SF, fontSize: '15px', fontWeight: 800, color: '#ff9900' }}>{deal.price}</p>
            )}
            {deal.rating && (
              <div className="flex items-center gap-1 mt-1">
                <Star size={10} fill="#ff9900" color="#ff9900" />
                <span style={{ fontFamily: SF, fontSize: '10px', color: '#6e6e73' }}>{deal.rating}</span>
              </div>
            )}
          </div>
          <div className="px-3 py-2 bg-[#ff9900] group-hover:bg-[#e68900] transition-colors">
            <p style={{ fontFamily: SF, fontSize: '11px', fontWeight: 700, color: '#fff', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Vedi su Amazon
            </p>
          </div>
        </a>
        <p style={{ fontFamily: SF, fontSize: '9px', color: '#aeaeb2', textAlign: 'center', marginTop: '3px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Sponsorizzato
        </p>
      </div>
    );
  }

  // ── SIDEBAR VARIANT (default — verticale 300px) ────────────────────────────
  return (
    <div className={`${className}`}>
      <div className="border-t-2 border-[#1d1d1f] mb-3">
        <p style={{ fontFamily: SF, fontSize: '10px', fontWeight: 800, color: '#1d1d1f', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '6px' }}>
          Amazon Deal
        </p>
      </div>
      <a
        href={deal.affiliateUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={handleClick}
        className="block border border-[#e5e5ea] rounded-xl bg-white hover:border-[#ff9900] hover:shadow-sm transition-all group overflow-hidden"
        style={{ textDecoration: 'none' }}
      >
        {deal.imageUrl ? (
          <div className="w-full bg-white" style={{ height: '180px' }}>
            <img src={deal.imageUrl} alt={deal.title}
              style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px' }} />
          </div>
        ) : (
          <div className="w-full bg-[#f5f5f7] flex items-center justify-center" style={{ height: '140px' }}>
            <ShoppingCart size={36} color="#aeaeb2" strokeWidth={1.5} />
          </div>
        )}
        <div className="p-3 border-t border-[#f0f0f0]">
          {deal.category && (
            <p style={{ fontFamily: SF, fontSize: '9px', fontWeight: 700, color: '#ff9900', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
              {deal.category}
            </p>
          )}
          <p style={{ fontFamily: SF, fontSize: '13px', fontWeight: 700, color: '#1d1d1f', lineHeight: 1.35 }} className="line-clamp-3 mb-2">
            {deal.title}
          </p>
          {deal.price && deal.price !== '...' && (
            <p style={{ fontFamily: SF, fontSize: '17px', fontWeight: 800, color: '#ff9900' }}>{deal.price}</p>
          )}
          {deal.rating && (
            <div className="flex items-center gap-1 mt-1.5">
              <Star size={11} fill="#ff9900" color="#ff9900" />
              <span style={{ fontFamily: SF, fontSize: '11px', color: '#6e6e73' }}>{deal.rating}</span>
              {deal.reviewCount && (
                <span style={{ fontFamily: SF, fontSize: '10px', color: '#aeaeb2' }}>({deal.reviewCount})</span>
              )}
            </div>
          )}
        </div>
        <div className="px-3 py-2.5 bg-[#ff9900] group-hover:bg-[#e68900] transition-colors">
          <p style={{ fontFamily: SF, fontSize: '12px', fontWeight: 700, color: '#fff', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Vedi su Amazon →
          </p>
        </div>
      </a>
      <p style={{ fontFamily: SF, fontSize: '9px', color: '#aeaeb2', textAlign: 'center', marginTop: '4px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        Sponsorizzato · Amazon
      </p>
    </div>
  );
}
