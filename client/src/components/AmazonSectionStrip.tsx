import { Star } from "lucide-react";
import { trpc } from "@/lib/trpc";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";

export default function AmazonSectionStrip() {
  const { data: deals } = trpc.amazonDeals.getDealsWithImage.useQuery(
    { limit: 6 },
    { staleTime: 1000 * 60 * 30 }
  );
  const trackClick = trpc.amazonDeals.trackClick.useMutation();

  if (!deals || deals.length === 0) return null;
  const validDeals = deals.filter(d => d.imageUrl && d.imageUrl.startsWith("http"));
  if (validDeals.length === 0) return null;

  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const rotated = [
    ...validDeals.slice(dayOfYear % validDeals.length),
    ...validDeals.slice(0, dayOfYear % validDeals.length),
  ];
  const shown = rotated.slice(0, Math.min(4, rotated.length));

  return (
    <div className="max-w-[1280px] mx-auto px-4 my-8">
      <div
        style={{
          borderTop: "2px solid #1a1a1a",
          borderBottom: "1px solid #e5e5ea",
          paddingTop: "8px",
          paddingBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <span
            style={{
              fontFamily: SF,
              fontSize: "10px",
              fontWeight: 700,
              color: "#1a1a1a",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Offerte Amazon del Giorno
          </span>
          <span
            style={{
              fontFamily: SF,
              fontSize: "8px",
              color: "#aeaeb2",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Sponsorizzato
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${shown.length}, 1fr)`,
            gap: "12px",
          }}
        >
          {shown.map(deal => (
            <a
              key={deal.id}
              href={deal.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={() => trackClick.mutate({ id: deal.id })}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "#fff",
                border: "1px solid #e5e5ea",
                borderRadius: "10px",
                padding: "12px 10px",
                textDecoration: "none",
                textAlign: "center",
                transition: "border-color 0.15s",
              }}
            >
              <div style={{ width: "64px", height: "64px", marginBottom: "8px" }}>
                <img
                  src={deal.imageUrl!}
                  alt={deal.title}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </div>
              <p
                style={{
                  fontFamily: SF,
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#1d1d1f",
                  lineHeight: 1.3,
                  marginBottom: "4px",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {deal.title}
              </p>
              {deal.price && deal.price !== "..." && (
                <p
                  style={{
                    fontFamily: SF,
                    fontSize: "13px",
                    fontWeight: 800,
                    color: "#ff9900",
                    marginBottom: "2px",
                  }}
                >
                  {deal.price}
                </p>
              )}
              {deal.rating && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                    justifyContent: "center",
                    marginBottom: "6px",
                  }}
                >
                  <Star size={9} fill="#ff9900" color="#ff9900" />
                  <span style={{ fontFamily: SF, fontSize: "9px", color: "#6e6e73" }}>
                    {deal.rating}
                  </span>
                </div>
              )}
              <div
                style={{
                  background: "#ff9900",
                  borderRadius: "6px",
                  padding: "5px 10px",
                  marginTop: "auto",
                }}
              >
                <span
                  style={{
                    fontFamily: SF,
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#fff",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Vedi su Amazon
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
