/**
 * BannerRotator — Manchette pubblicitarie dinamiche ProofPress
 * - Weighted random selection (peso 1-10)
 * - Fade transition configurabile
 * - Tracking impression + click via tRPC
 * - Fallback su banner statici se DB vuoto
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";

interface BannerItem {
  id: number;
  name: string;
  imageUrl: string;
  clickUrl: string;
  weight: number;
}

interface BannerRotatorProps {
  slot: "left" | "right" | "sidebar";
  width?: number;
  height?: number;
  className?: string;
  /** Banner statici di fallback se il DB è vuoto */
  fallbackBanners?: Array<{ imageUrl: string; clickUrl: string; name: string }>;
}

// ── Weighted random pick ──────────────────────────────────────────────────────
function weightedPick<T extends { weight: number }>(items: T[]): T | null {
  if (!items.length) return null;
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) return item;
  }
  return items[items.length - 1];
}

export default function BannerRotator({
  slot,
  width = 300,
  height = 250,
  className = "",
  fallbackBanners = [],
}: BannerRotatorProps) {
  const { data: manchetteData } = trpc.banners.getManchette.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minuti
    refetchOnWindowFocus: false,
  });

  const trackImpression = trpc.banners.trackImpression.useMutation();
  const trackClick = trpc.banners.trackClick.useMutation();

  const [currentBanner, setCurrentBanner] = useState<BannerItem | null>(null);
  const [visible, setVisible] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackedIds = useRef<Set<number>>(new Set());

  const bannerList: BannerItem[] = manchetteData
    ? (slot === "left" ? manchetteData.left : slot === "right" ? manchetteData.right : (manchetteData as { sidebar?: BannerItem[] }).sidebar ?? [])
    : [];

  const rotationMs = manchetteData?.settings?.rotationIntervalMs ?? 15000;
  const transitionMs = manchetteData?.settings?.transitionDurationMs ?? 400;

  // Scegli il prossimo banner (diverso dall'attuale se possibile)
  const pickNext = useCallback((): BannerItem | null => {
    if (!bannerList.length) return null;
    if (bannerList.length === 1) return bannerList[0];
    const candidates = currentBanner
      ? bannerList.filter((b) => b.id !== currentBanner.id)
      : bannerList;
    return weightedPick(candidates.length ? candidates : bannerList);
  }, [bannerList, currentBanner]);

  // Traccia impression (una sola volta per banner per sessione)
  const trackImpressionOnce = useCallback(
    (banner: BannerItem) => {
      if (trackedIds.current.has(banner.id)) return;
      trackedIds.current.add(banner.id);
      trackImpression.mutate({
        bannerId: banner.id,
        slot,
        userAgent: navigator.userAgent,
      });
    },
    [slot, trackImpression]
  );

  // Inizializza il primo banner
  useEffect(() => {
    if (!bannerList.length) return;
    const first = weightedPick(bannerList);
    if (first) {
      setCurrentBanner(first);
      trackImpressionOnce(first);
    }
  }, [bannerList.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Rotazione automatica
  useEffect(() => {
    if (!bannerList.length || bannerList.length < 2) return;

    intervalRef.current = setInterval(() => {
      // Fade out
      setVisible(false);
      setTimeout(() => {
        const next = pickNext();
        if (next) {
          setCurrentBanner(next);
          trackImpressionOnce(next);
        }
        // Fade in
        setVisible(true);
      }, transitionMs);
    }, rotationMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [bannerList.length, rotationMs, transitionMs, pickNext, trackImpressionOnce]);

  // Click handler
  const handleClick = useCallback(() => {
    if (!currentBanner) return;
    trackClick.mutate({
      bannerId: currentBanner.id,
      slot,
      referrer: window.location.href,
    });
  }, [currentBanner, slot, trackClick]);

  // ── Fallback: nessun banner nel DB ─────────────────────────────────────────
  if (!bannerList.length && fallbackBanners.length > 0) {
    const fb = fallbackBanners[0];
    return (
      <div className={`flex flex-col items-center gap-1 ${className}`}>
        <a href={fb.clickUrl} target="_blank" rel="noopener noreferrer">
          <img
            src={fb.imageUrl}
            alt={fb.name}
            width={width}
            height={height}
            className="rounded object-cover"
            style={{ width, height }}
          />
        </a>
        <p className="text-[9px] text-gray-400 uppercase tracking-widest">Pubblicità</p>
      </div>
    );
  }

  // ── Nessun banner disponibile ──────────────────────────────────────────────
  if (!currentBanner) return null;

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <a
        href={currentBanner.clickUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        title={currentBanner.name}
        style={{ display: "block", width, height }}
      >
        <img
          src={currentBanner.imageUrl}
          alt={currentBanner.name}
          width={width}
          height={height}
          className="rounded object-cover"
          style={{
            width,
            height,
            opacity: visible ? 1 : 0,
            transition: `opacity ${transitionMs}ms ease-in-out`,
          }}
        />
      </a>
      <p className="text-[9px] text-gray-400 uppercase tracking-widest">Pubblicità</p>
    </div>
  );
}
