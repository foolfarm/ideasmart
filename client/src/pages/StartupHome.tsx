/*
 * IDEASMART — Startup News
 * Design: White (#fafafa) + Slate (#1a1f2e) + Green (#16a34a) + Orange (#e84f00)
 * Typography: Space Grotesk (display) + DM Sans (body) + JetBrains Mono (mono)
 * Layout: Asymmetric editorial with numbered sections
 */
import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import AdUnit from "@/components/AdUnit";
import CommentSection from "@/components/CommentSection";
import SocialShare from "@/components/SocialShare";
import SEOHead from "@/components/SEOHead";

// ─── Brand Colors ─────────────────────────────────────────────────────────────
const C = {
  green: "#16a34a",
  greenLight: "#dcfce7",
  orange: "#e84f00",
  orangeLight: "#fff2ec",
  blue: "#1a56db",
  blueLight: "#eff4ff",
  navy: "#1a1f2e",
  slate: "#374151",
  muted: "#6b7280",
  border: "#d1d5db",
  surface1: "#f8f9fc",
  surface2: "#f1f3f8",
};

// ─── News color palette ───────────────────────────────────────────────────────
const NEWS_COLORS = [
  { color: C.green, bg: C.greenLight },
  { color: C.orange, bg: C.orangeLight },
  { color: C.blue, bg: C.blueLight },
  { color: "#7c3aed", bg: "#f3e8ff" },
  { color: "#0891b2", bg: "#e0f2fe" },
  { color: "#b45309", bg: "#fef3c7" },
];

// ─── Cookie Preferences Link ──────────────────────────────────────────────────
function CookiePreferencesLink() {
  const { resetConsent } = useCookieConsent();
  return (
    <button
      onClick={resetConsent}
      className="text-sm transition-colors bg-transparent border-none p-0 cursor-pointer"
      style={{ color: C.muted, fontFamily: "'DM Sans', sans-serif" }}
      onMouseEnter={e => (e.currentTarget.style.color = C.green)}
      onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
    >
      Gestisci preferenze cookie
    </button>
  );
}

// ─── FadeUp animation ─────────────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ number, category, categoryColor, title, titleColor }: {
  number: string; category: string; categoryColor: string; title: string; titleColor?: string;
}) {
  return (
    <div className="mb-8 sm:mb-10">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-bold tracking-widest" style={{ color: C.muted, fontFamily: "'JetBrains Mono', monospace" }}>{number}</span>
        <span className="h-px flex-1" style={{ background: C.border }} />
        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: categoryColor, fontFamily: "'JetBrains Mono', monospace" }}>{category}</span>
      </div>
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight" style={{ color: titleColor || C.navy, fontFamily: "'Space Grotesk', sans-serif" }}>
        {title}
      </h2>
    </div>
  );
}

// ─── NewsGrid Component ───────────────────────────────────────────────────────
function NewsGrid() {
  const { data: newsData, isLoading } = trpc.news.getLatest.useQuery({ limit: 20, section: 'startup' });
  const items = newsData ?? [];
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="news-card p-5 animate-pulse" style={{ height: '120px' }}>
            <div className="h-3 rounded mb-3" style={{ background: C.surface2, width: "40%" }} />
            <div className="h-4 rounded mb-2" style={{ background: C.surface2, width: "90%" }} />
            <div className="h-3 rounded" style={{ background: C.surface2, width: "70%" }} />
          </div>
        ))}
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="text-center py-16" style={{ color: C.muted }}>
        <p className="text-lg font-semibold mb-2">Notizie in aggiornamento...</p>
        <p className="text-sm">I contenuti verranno caricati a breve.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {items.slice(0, 20).map((item, i) => {
        const colorSet = NEWS_COLORS[i % NEWS_COLORS.length];
        const num = String(i + 1).padStart(2, "0");
        return (
          <FadeUp key={item.id} delay={i * 0.03}>
            <div className="news-card group">
              <div className="flex flex-col sm:flex-row gap-0">
                {/* Immagine */}
                <a
                  href={`/startup/news/${item.id}`}
                  className="flex-shrink-0 w-full sm:w-44 relative overflow-hidden rounded-t-xl sm:rounded-t-none sm:rounded-l-xl"
                  style={{ height: "180px", minHeight: "180px" }}
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      style={{ position: "absolute", inset: 0 }}
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${colorSet.bg} 0%, ${colorSet.color}20 100%)`, position: "absolute", inset: 0 }}
                    >
                      <span className="text-4xl font-black opacity-30" style={{ color: colorSet.color, fontFamily: "'Space Grotesk', sans-serif" }}>{num}</span>
                    </div>
                  )}
                </a>
                {/* Contenuto */}
                <div className="flex-1 p-5 sm:p-6 flex flex-col min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="editorial-tag flex-shrink-0" style={{ color: C.muted }}>{num}</span>
                    <span
                      className="inline-block px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0"
                      style={{ background: colorSet.bg, color: colorSet.color }}
                    >
                      {item.category}
                    </span>
                  </div>
                  <a href={`/startup/news/${item.id}`} className="flex-1">
                    <h3
                      className="text-lg sm:text-xl font-bold leading-snug mb-2 transition-colors"
                      style={{ color: C.navy, fontFamily: "'Space Grotesk', sans-serif" }}
                      onMouseEnter={e => (e.currentTarget.style.color = C.green)}
                      onMouseLeave={e => (e.currentTarget.style.color = C.navy)}
                    >
                      {item.title}
                    </h3>
                    <p className="text-base leading-relaxed line-clamp-3" style={{ color: C.slate, fontFamily: "'DM Sans', sans-serif" }}>
                      {item.summary}
                    </p>
                  </a>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: C.border }}>
                    <span className="text-sm font-medium" style={{ color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>{item.sourceName}</span>
                    <SocialShare
                      title={item.title + ' — via Startup News by IDEASMART'}
                      url={item.sourceUrl || undefined}
                      accentColor="green"
                      compact
                    />
                  </div>
                  <CommentSection
                    section="startup"
                    articleType="news"
                    articleId={item.id}
                    accentColor="green"
                  />
                </div>
              </div>
            </div>
          </FadeUp>
        );
      })}
    </div>
  );
}

// ─── Daily Editorial Section ──────────────────────────────────────────────────
function DailyEditorialSection() {
  const { data: editorial, isLoading } = trpc.editorial.getLatest.useQuery({ section: 'startup' });
  const { data: reportageItems } = trpc.reportage.getLatestWeek.useQuery({ section: 'startup' });
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 rounded mb-4" style={{ background: C.surface2, width: "60%" }} />
        <div className="h-4 rounded mb-2" style={{ background: C.surface2 }} />
        <div className="h-4 rounded mb-2" style={{ background: C.surface2, width: "80%" }} />
      </div>
    );
  }
  if (!editorial) {
    return (
      <div className="text-center py-12" style={{ color: C.muted }}>
        <p className="text-base">Editoriale in preparazione...</p>
      </div>
    );
  }
  return (
    <FadeUp>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Editoriale principale */}
        <div className="lg:col-span-2">
          {editorial.imageUrl && (
            <div className="relative overflow-hidden rounded-2xl mb-6" style={{ height: "280px" }}>
              <img src={editorial.imageUrl} alt={editorial.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(26,31,46,0.7) 0%, transparent 60%)" }} />
              <div className="absolute bottom-4 left-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: C.green, color: "#fff" }}>
                  {editorial.keyTrend}
                </span>
              </div>
            </div>
          )}
          <h3 className="text-2xl sm:text-3xl font-black mb-3 leading-tight" style={{ color: C.navy, fontFamily: "'Space Grotesk', sans-serif" }}>
            {editorial.title}
          </h3>
          {editorial.subtitle && (
            <p className="text-lg font-semibold mb-4" style={{ color: C.green, fontFamily: "'DM Sans', sans-serif" }}>
              {editorial.subtitle}
            </p>
          )}
          <div className="prose prose-slate max-w-none">
            {editorial.body.split('\n').map((para, i) => (
              para.trim() && (
                <p key={i} className="text-base leading-relaxed mb-4" style={{ color: C.slate, fontFamily: "'DM Sans', sans-serif" }}>
                  {para}
                </p>
              )
            ))}
          </div>
          {editorial.authorNote && (
            <p className="text-sm italic mt-4 pt-4 border-t" style={{ color: C.muted, borderColor: C.border, fontFamily: "'DM Sans', sans-serif" }}>
              — {editorial.authorNote}
            </p>
          )}
        </div>
        {/* Sidebar reportage */}
        <div>
          <p className="editorial-tag mb-4" style={{ color: C.muted }}>Reportage della settimana</p>
          <div className="flex flex-col gap-3">
            {(reportageItems && reportageItems.length > 0 ? reportageItems : []).map((r, i) => (
              <FadeUp key={r.id} delay={i * 0.08}>
                <div className="p-4 rounded-xl border" style={{ borderColor: C.border, background: "#fff" }}>
                  <span className="text-xs font-bold tracking-widest" style={{ color: C.green, fontFamily: "'JetBrains Mono', monospace" }}>
                    0{i + 1}
                  </span>
                  <h4 className="text-base font-bold mt-1 leading-snug" style={{ color: C.navy, fontFamily: "'Space Grotesk', sans-serif" }}>
                    {r.startupName}
                  </h4>
                  <p className="text-sm mt-1 line-clamp-2" style={{ color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>
                    {r.headline}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </div>
    </FadeUp>
  );
}

// ─── Startup della Settimana Section ─────────────────────────────────────────
function StartupOfWeekSection() {
  const { data: startup, isLoading } = trpc.startupOfDay.getLatest.useQuery({ section: 'startup' });
  if (isLoading) {
    return (
      <div className="animate-pulse rounded-2xl p-8" style={{ background: C.surface1 }}>
        <div className="h-8 rounded mb-4" style={{ background: C.surface2, width: "50%" }} />
        <div className="h-4 rounded mb-2" style={{ background: C.surface2 }} />
        <div className="h-4 rounded" style={{ background: C.surface2, width: "70%" }} />
      </div>
    );
  }
  if (!startup) {
    return (
      <div className="text-center py-12" style={{ color: C.muted }}>
        <p className="text-base">Startup della settimana in selezione...</p>
      </div>
    );
  }
  return (
    <FadeUp>
      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: C.border }}>
        <div className="grid lg:grid-cols-2">
          {/* Immagine */}
          {startup.imageUrl && (
            <div className="relative overflow-hidden" style={{ minHeight: "320px" }}>
              <img src={startup.imageUrl} alt={startup.name} className="w-full h-full object-cover absolute inset-0" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(22,163,74,0.3) 0%, transparent 60%)" }} />
            </div>
          )}
          {/* Contenuto */}
          <div className="p-8 lg:p-10" style={{ background: "#fff" }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: C.greenLight, color: C.green }}>
                {startup.category}
              </span>
              {startup.country && (
                <span className="text-xs font-medium" style={{ color: C.muted }}>📍 {startup.country}</span>
              )}
            </div>
            <h3 className="text-2xl sm:text-3xl font-black mb-2" style={{ color: C.navy, fontFamily: "'Space Grotesk', sans-serif" }}>
              {startup.name}
            </h3>
            <p className="text-lg font-semibold mb-4" style={{ color: C.green, fontFamily: "'DM Sans', sans-serif" }}>
              {startup.tagline}
            </p>
            <p className="text-base leading-relaxed mb-6" style={{ color: C.slate, fontFamily: "'DM Sans', sans-serif" }}>
              {startup.description}
            </p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {startup.foundedYear && (
                <div className="text-center p-3 rounded-xl" style={{ background: C.surface1 }}>
                  <p className="text-lg font-black" style={{ color: C.green, fontFamily: "'Space Grotesk', sans-serif" }}>{startup.foundedYear}</p>
                  <p className="text-xs" style={{ color: C.muted }}>Fondata</p>
                </div>
              )}
              {startup.funding && (
                <div className="text-center p-3 rounded-xl" style={{ background: C.surface1 }}>
                  <p className="text-sm font-black" style={{ color: C.navy, fontFamily: "'Space Grotesk', sans-serif" }}>{startup.funding}</p>
                  <p className="text-xs" style={{ color: C.muted }}>Funding</p>
                </div>
              )}
              {startup.aiScore !== null && (
                <div className="text-center p-3 rounded-xl" style={{ background: C.surface1 }}>
                  <p className="text-lg font-black" style={{ color: C.orange, fontFamily: "'Space Grotesk', sans-serif" }}>{startup.aiScore}</p>
                  <p className="text-xs" style={{ color: C.muted }}>Score</p>
                </div>
              )}
            </div>
            <blockquote className="border-l-4 pl-4 mb-6" style={{ borderColor: C.green }}>
              <p className="text-base italic" style={{ color: C.slate, fontFamily: "'DM Sans', sans-serif" }}>
                {startup.whyToday}
              </p>
            </blockquote>
            {startup.websiteUrl && (
              <a
                href={startup.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all"
                style={{ background: C.green, color: "#fff" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#15803d")}
                onMouseLeave={e => (e.currentTarget.style.background = C.green)}
              >
                Visita il sito →
              </a>
            )}
          </div>
        </div>
      </div>
    </FadeUp>
  );
}

// ─── Weekly Reportage Section ─────────────────────────────────────────────────
function WeeklyReportageSection() {
  const { data: reportageItems, isLoading } = trpc.reportage.getLatestWeek.useQuery({ section: 'startup' });
  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl p-6" style={{ background: C.surface1, height: "200px" }} />
        ))}
      </div>
    );
  }
  if (!reportageItems || reportageItems.length === 0) {
    return (
      <div className="text-center py-12" style={{ color: C.muted }}>
        <p className="text-base">Reportage in preparazione...</p>
      </div>
    );
  }
  return (
    <div className="grid sm:grid-cols-2 gap-6">
      {reportageItems.map((r, i) => {
        const colorSet = NEWS_COLORS[i % NEWS_COLORS.length];
        return (
          <FadeUp key={r.id} delay={i * 0.1}>
            <div className="rounded-2xl overflow-hidden border h-full" style={{ borderColor: C.border }}>
              {r.imageUrl && (
                <div className="relative overflow-hidden" style={{ height: "180px" }}>
                  <img src={r.imageUrl} alt={r.startupName} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(26,31,46,0.6) 0%, transparent 60%)" }} />
                  <div className="absolute bottom-3 left-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: colorSet.color, color: "#fff" }}>
                      {r.category}
                    </span>
                  </div>
                </div>
              )}
              <div className="p-6" style={{ background: "#fff" }}>
                <span className="text-xs font-bold tracking-widest" style={{ color: colorSet.color, fontFamily: "'JetBrains Mono', monospace" }}>
                  {r.sectionNumber} — {r.startupName}
                </span>
                <h4 className="text-lg font-black mt-2 mb-2 leading-snug" style={{ color: C.navy, fontFamily: "'Space Grotesk', sans-serif" }}>
                  {r.headline}
                </h4>
                {r.subheadline && (
                  <p className="text-sm mb-3" style={{ color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>{r.subheadline}</p>
                )}
                <p className="text-sm leading-relaxed line-clamp-4" style={{ color: C.slate, fontFamily: "'DM Sans', sans-serif" }}>
                  {r.bodyText}
                </p>
                {r.quote && (
                  <blockquote className="border-l-4 pl-3 mt-4" style={{ borderColor: colorSet.color }}>
                    <p className="text-sm italic line-clamp-2" style={{ color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>
                      {r.quote}
                    </p>
                  </blockquote>
                )}
                {/* Stats */}
                {(r.stat1Value || r.stat2Value || r.stat3Value) && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {r.stat1Value && (
                      <div className="text-center p-2 rounded-lg" style={{ background: C.surface1 }}>
                        <p className="text-sm font-black" style={{ color: colorSet.color }}>{r.stat1Value}</p>
                        <p className="text-xs" style={{ color: C.muted }}>{r.stat1Label}</p>
                      </div>
                    )}
                    {r.stat2Value && (
                      <div className="text-center p-2 rounded-lg" style={{ background: C.surface1 }}>
                        <p className="text-sm font-black" style={{ color: colorSet.color }}>{r.stat2Value}</p>
                        <p className="text-xs" style={{ color: C.muted }}>{r.stat2Label}</p>
                      </div>
                    )}
                    {r.stat3Value && (
                      <div className="text-center p-2 rounded-lg" style={{ background: C.surface1 }}>
                        <p className="text-sm font-black" style={{ color: colorSet.color }}>{r.stat3Value}</p>
                        <p className="text-xs" style={{ color: C.muted }}>{r.stat3Label}</p>
                      </div>
                    )}
                  </div>
                )}
                {r.websiteUrl && (
                  <a
                    href={r.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 text-sm font-semibold transition-colors"
                    style={{ color: colorSet.color }}
                    onMouseEnter={e => (e.currentTarget.style.color = C.navy)}
                    onMouseLeave={e => (e.currentTarget.style.color = colorSet.color)}
                  >
                    {r.ctaLabel || 'Scopri di più'} →
                  </a>
                )}
              </div>
            </div>
          </FadeUp>
        );
      })}
    </div>
  );
}

// ─── Market Analysis Section ──────────────────────────────────────────────────
function MarketAnalysisSection() {
  const { data: analyses, isLoading } = trpc.marketAnalysis.getLatest.useQuery({ section: 'startup' });
  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl p-6" style={{ background: C.surface1, height: "200px" }} />
        ))}
      </div>
    );
  }
  if (!analyses || analyses.length === 0) {
    return (
      <div className="text-center py-12" style={{ color: C.muted }}>
        <p className="text-base">Analisi di mercato in preparazione...</p>
      </div>
    );
  }
  return (
    <div className="grid sm:grid-cols-2 gap-6">
      {analyses.map((a, i) => {
        const colorSet = NEWS_COLORS[i % NEWS_COLORS.length];
        return (
          <FadeUp key={a.id} delay={i * 0.1}>
            <div className="rounded-2xl p-6 border h-full" style={{ borderColor: C.border, background: "#fff" }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: colorSet.bg, color: colorSet.color }}>
                  {a.category}
                </span>
                <span className="text-xs" style={{ color: C.muted, fontFamily: "'JetBrains Mono', monospace" }}>{a.source}</span>
              </div>
              <h4 className="text-lg font-black mb-2 leading-snug" style={{ color: C.navy, fontFamily: "'Space Grotesk', sans-serif" }}>
                {a.title}
              </h4>
              {a.subtitle && (
                <p className="text-sm mb-3" style={{ color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>{a.subtitle}</p>
              )}
              <p className="text-sm leading-relaxed mb-4 line-clamp-4" style={{ color: C.slate, fontFamily: "'DM Sans', sans-serif" }}>
                {a.summary}
              </p>
              {/* Key insight */}
              {a.keyInsight && (
                <div className="p-3 rounded-xl mb-4" style={{ background: colorSet.bg }}>
                  <p className="text-sm font-semibold" style={{ color: colorSet.color, fontFamily: "'DM Sans', sans-serif" }}>
                    💡 {a.keyInsight}
                  </p>
                </div>
              )}
              {/* Data points */}
              <div className="grid grid-cols-3 gap-2">
                {[a.dataPoint1, a.dataPoint2, a.dataPoint3].filter(Boolean).map((dp, j) => (
                  <div key={j} className="p-2 rounded-lg text-center" style={{ background: C.surface1 }}>
                    <p className="text-xs font-semibold" style={{ color: C.navy, fontFamily: "'JetBrains Mono', monospace" }}>{dp}</p>
                  </div>
                ))}
              </div>
              {/* Market size + growth */}
              {(a.marketSize || a.growthRate) && (
                <div className="flex gap-4 mt-4 pt-4 border-t" style={{ borderColor: C.border }}>
                  {a.marketSize && (
                    <div>
                      <p className="text-xs" style={{ color: C.muted }}>Market size</p>
                      <p className="text-sm font-bold" style={{ color: C.navy }}>{a.marketSize}</p>
                    </div>
                  )}
                  {a.growthRate && (
                    <div>
                      <p className="text-xs" style={{ color: C.muted }}>Crescita</p>
                      <p className="text-sm font-bold" style={{ color: C.green }}>{a.growthRate}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </FadeUp>
        );
      })}
    </div>
  );
}

// ─── Newsletter Section ───────────────────────────────────────────────────────
function NewsletterSection() {
  const { data: reportageItems } = trpc.reportage.getLatestWeek.useQuery({ section: 'startup' });
  const { data: activeSubscriberCount } = trpc.newsletter.getActiveCount.useQuery();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Iscrizione confermata! Benvenuto in Startup News.");
    },
    onError: (err) => {
      toast.error(err.message || "Errore durante l'iscrizione.");
    },
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subscribeMutation.mutate({ email });
  };
  const realCount = activeSubscriberCount ?? 5400;
  const displayCount = realCount >= 1000
    ? `${(realCount / 1000).toFixed(1).replace('.0', '')}k`
    : realCount.toString();
  return (
    <FadeUp>
      <div className="rounded-2xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${C.navy} 0%, #0f172a 100%)` }}>
        <div className="p-8 sm:p-12 lg:p-16">
          <div className="max-w-2xl mx-auto text-center">
            <span className="inline-block px-4 py-2 rounded-full text-xs font-bold mb-6" style={{ background: `${C.green}20`, color: C.green, fontFamily: "'JetBrains Mono', monospace" }}>
              📬 STARTUP NEWS NEWSLETTER
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mb-4 text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Resta aggiornato sull'ecosistema startup
            </h2>
            <p className="text-base mb-8" style={{ color: "#94a3b8", fontFamily: "'DM Sans', sans-serif" }}>
              Ogni settimana: le 20 notizie startup più importanti, la startup della settimana, reportage e analisi di mercato.
              Unisciti a <strong style={{ color: "#fff" }}>{displayCount}+ professionisti</strong> che leggono IDEASMART.
            </p>
            {submitted ? (
              <div className="p-6 rounded-xl" style={{ background: `${C.green}20`, border: `1px solid ${C.green}40` }}>
                <p className="text-lg font-bold text-white">✅ Iscrizione confermata!</p>
                <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Riceverai la prossima newsletter lunedì alle 10:00.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="La tua email"
                  required
                  className="flex-1 px-4 py-3 rounded-xl text-base outline-none"
                  style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}
                />
                <button
                  type="submit"
                  disabled={subscribeMutation.isPending}
                  className="px-6 py-3 rounded-xl text-sm font-bold transition-all"
                  style={{ background: C.green, color: "#fff", fontFamily: "'Space Grotesk', sans-serif" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#15803d")}
                  onMouseLeave={e => (e.currentTarget.style.background = C.green)}
                >
                  {subscribeMutation.isPending ? "..." : "Iscriviti →"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </FadeUp>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StartupHome() {
  const { data: reportageItems } = trpc.reportage.getLatestWeek.useQuery({ section: 'startup' });

  const seoStructuredData = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "name": "Startup News by IDEASMART",
    "url": "https://www.ideasmart.ai/startup",
    "description": "Le 20 notizie startup più importanti ogni giorno. Startup della settimana, reportage e analisi di mercato sull'ecosistema startup italiano e internazionale.",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.ideasmart.ai/favicon.ico"
    },
    "publisher": {
      "@type": "Organization",
      "name": "IDEASMART",
      "url": "https://www.ideasmart.ai"
    },
    "sameAs": ["https://www.ideasmart.ai"]
  };

  return (
    <div className="min-h-screen" style={{ background: "#fafafa" }}>
      <SEOHead
        title="Startup News — Le 20 notizie startup più importanti ogni giorno"
        description="Startup News by IDEASMART: le 20 notizie startup più importanti ogni giorno. Startup della settimana, reportage e analisi di mercato sull'ecosistema startup italiano e internazionale."
        keywords="startup italiane, startup news, startup funding, venture capital, unicorni, fintech, healthtech, deeptech, ecosistema startup, startup della settimana, analisi mercato startup"
        canonical="https://www.ideasmart.ai/startup"
        ogSiteName="Startup News by IDEASMART"
        ogType="website"
        robots="index, follow"
        structuredData={seoStructuredData}
      />
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden" style={{ background: "#ffffff" }}>
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, #ffffff 0%, #f0fdf4 60%, #fafafa 100%)` }} />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 lg:pt-28 pb-14 sm:pb-20">
          <FadeUp>
            {/* Badge */}
            <div className="inline-flex flex-wrap items-center gap-2 mb-6 sm:mb-8 px-3 sm:px-4 py-2 rounded-full border" style={{ borderColor: `${C.green}40`, background: `${C.green}12` }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.green }} />
              <span className="editorial-tag" style={{ color: C.green }}>
                Osservatorio sull'Ecosistema Startup
              </span>
              <span className="editorial-tag hidden sm:inline" style={{ color: C.muted }}>Aggiornato ogni giorno — {new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span className="editorial-tag sm:hidden" style={{ color: C.muted }}>{new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            {/* Main title */}
            <h1
              className="text-4xl sm:text-6xl lg:text-8xl font-black leading-none tracking-tight mb-2 sm:mb-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: C.navy }}
            >
              Startup <span style={{ color: C.green }}>News</span>
            </h1>
            <p
              className="text-base sm:text-lg lg:text-xl font-semibold tracking-wide mb-6 sm:mb-8"
              style={{ fontFamily: "'DM Sans', sans-serif", color: C.muted }}
            >
              by <span style={{ color: C.navy, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>IDEA<span style={{ color: C.green }}>SMART</span></span>
            </p>
            {/* Description */}
            <p className="text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl mb-8 sm:mb-10" style={{ fontFamily: "'DM Sans', sans-serif", color: C.slate }}>
              <strong style={{ color: C.navy }}>IDEASMART</strong> monitora ogni giorno l'ecosistema startup italiano e internazionale.
              Round di finanziamento, nuovi unicorni, acquisizioni, IPO, trend di settore:
              tutto quello che devi sapere per restare aggiornato sul mondo delle startup.
            </p>
            {/* Stats */}
            <div className="flex flex-wrap gap-6 sm:gap-8 mb-10">
              {[
                { value: new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }).toUpperCase(), label: new Date().toLocaleDateString('it-IT', { year: 'numeric' }) },
                { value: "20+", label: "News al giorno" },
                { value: "100%", label: "Ecosystem-driven" },
              ].map((s) => (
                <div key={s.label} className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black" style={{ color: C.green, fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</span>
                  <span className="text-sm sm:text-base" style={{ color: C.muted }}>{s.label}</span>
                </div>
              ))}
            </div>
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <a
                href="#news"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-base font-bold transition-all"
                style={{ background: C.green, color: "#fff" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#15803d")}
                onMouseLeave={e => (e.currentTarget.style.background = C.green)}
              >
                Leggi le ultime news ↓
              </a>
              <a
                href="#newsletter"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-base font-bold border transition-all"
                style={{ borderColor: C.border, color: C.navy, background: "transparent" }}
                onMouseEnter={e => { e.currentTarget.style.background = C.surface1; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                Abbonati alla newsletter →
              </a>
            </div>
          </FadeUp>
          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <span className="text-xs tracking-widest" style={{ color: C.muted, fontFamily: "'JetBrains Mono', monospace" }}>SCORRI</span>
            <div className="w-px h-8" style={{ background: `linear-gradient(to bottom, ${C.green}, transparent)` }} />
          </div>
        </div>
      </section>

      {/* ── TICKER ────────────────────────────────────────────────────────── */}
      <div className="border-y py-3 overflow-hidden" style={{ borderColor: C.border, background: "#fff" }}>
        <div className="flex items-center gap-4 px-4">
          <span className="flex-shrink-0 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.green }} />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: C.green, fontFamily: "'JetBrains Mono', monospace" }}>
              ◆ ULTIME NEWS STARTUP
            </span>
            <span className="text-xs font-bold tracking-widest uppercase ml-2" style={{ color: C.muted, fontFamily: "'JetBrains Mono', monospace" }}>
              AGGIORNATO OGNI GIORNO
            </span>
          </span>
          <span className="flex-1 h-px" style={{ background: C.border }} />
          <span className="flex-shrink-0 text-xs font-bold tracking-widest uppercase" style={{ color: C.muted, fontFamily: "'JetBrains Mono', monospace" }}>
            SELEZIONE EDITORIALE IDEASMART
          </span>
        </div>
      </div>

      {/* ── SEZIONE 01 — NEWS ─────────────────────────────────────────────── */}
      <section id="news" className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            number="01"
            category="STARTUP NEWS"
            categoryColor={C.green}
            title="Le 20 notizie startup più significative della settimana"
          />
          <p className="text-lg leading-relaxed mb-10 max-w-2xl" style={{ color: C.slate, fontFamily: "'DM Sans', sans-serif" }}>
            La selezione editoriale di IDEASMART sui fatti che stanno ridefinendo l'ecosistema startup globale.
          </p>
          <NewsGrid />
        </div>
      </section>

      {/* ── AD UNIT 1 ─────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <AdUnit slot="startup-mid-1" />
      </div>

      {/* ── SEZIONE 02 — EDITORIALE ───────────────────────────────────────── */}
      <section className="py-16 sm:py-20 lg:py-24 border-t" style={{ borderColor: C.border, background: "#fff" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            number="02"
            category="EDITORIALE"
            categoryColor={C.green}
            title="L'analisi della redazione"
          />
          <DailyEditorialSection />
        </div>
      </section>

      {/* ── SEZIONE 03 — STARTUP DELLA SETTIMANA ─────────────────────────── */}
      <section className="py-16 sm:py-20 lg:py-24 border-t" style={{ borderColor: C.border }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            number="03"
            category="STARTUP DELLA SETTIMANA"
            categoryColor={C.green}
            title="La startup che ha fatto la differenza"
          />
          <StartupOfWeekSection />
        </div>
      </section>

      {/* ── AD UNIT 2 ─────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <AdUnit slot="startup-mid-2" />
      </div>

      {/* ── SEZIONE 04 — REPORTAGE ────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 lg:py-24 border-t" style={{ borderColor: C.border, background: "#fff" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            number="04"
            category="REPORTAGE"
            categoryColor={C.green}
            title="Approfondimenti sulle startup della settimana"
          />
          <WeeklyReportageSection />
        </div>
      </section>

      {/* ── SEZIONE 05 — ANALISI DI MERCATO ──────────────────────────────── */}
      <section className="py-16 sm:py-20 lg:py-24 border-t" style={{ borderColor: C.border }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            number="05"
            category="ANALISI DI MERCATO"
            categoryColor={C.green}
            title="I trend che guidano gli investimenti"
          />
          <MarketAnalysisSection />
        </div>
      </section>

      {/* ── AD UNIT 3 ─────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <AdUnit slot="startup-bottom" />
      </div>

      {/* ── SEZIONE 06 — NEWSLETTER ───────────────────────────────────────── */}
      <section id="newsletter" className="py-16 sm:py-20 lg:py-24 border-t" style={{ borderColor: C.border, background: "#fff" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <NewsletterSection />
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="border-t" style={{ borderColor: C.border, background: C.surface1 }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="text-2xl font-black mb-2" style={{ color: C.navy, fontFamily: "'Space Grotesk', sans-serif" }}>
                IDEA<span style={{ color: C.green }}>SMART</span>
              </div>
              <p className="editorial-tag mb-4" style={{ color: C.muted }}>Startup di Tecnologia &amp; Innovazione</p>
              <p className="text-base leading-relaxed" style={{ color: C.slate, fontFamily: "'DM Sans', sans-serif" }}>
                L'Osservatorio sull'Ecosistema Startup. Ogni giorno monitoriamo le startup più promettenti
                a livello italiano e internazionale.
              </p>
            </div>
            {/* Reportage della settimana */}
            <div>
              <p className="editorial-tag mb-4" style={{ color: C.muted }}>Reportage della settimana</p>
              <div className="space-y-2">
                {(reportageItems && reportageItems.length > 0 ? reportageItems : [
                  { position: 1, startupName: "Reportage 01", websiteUrl: "#" },
                  { position: 2, startupName: "Reportage 02", websiteUrl: "#" },
                  { position: 3, startupName: "Reportage 03", websiteUrl: "#" },
                  { position: 4, startupName: "Reportage 04", websiteUrl: "#" },
                ]).map((s: { position: number; startupName: string; websiteUrl: string | null }) => (
                  <a
                    key={s.position}
                    href={s.websiteUrl && s.websiteUrl !== "#" ? s.websiteUrl : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-base transition-colors"
                    style={{ color: C.slate, fontFamily: "'DM Sans', sans-serif" }}
                    onMouseEnter={e => (e.currentTarget.style.color = C.navy)}
                    onMouseLeave={e => (e.currentTarget.style.color = C.slate)}
                  >
                    {s.startupName} →
                  </a>
                ))}
              </div>
            </div>
            {/* Contatti */}
            <div>
              <p className="editorial-tag mb-4" style={{ color: C.muted }}>Contatti</p>
              <a
                href="mailto:info@ideasmart.ai?subject=Startup News IDEASMART"
                className="block text-base transition-colors mb-2"
                style={{ color: C.slate, fontFamily: "'DM Sans', sans-serif" }}
                onMouseEnter={e => (e.currentTarget.style.color = C.navy)}
                onMouseLeave={e => (e.currentTarget.style.color = C.slate)}
              >
                info@ideasmart.ai
              </a>
              <a
                href="/advertise"
                className="block text-base transition-colors"
                style={{ color: C.green, fontFamily: "'DM Sans', sans-serif" }}
                onMouseEnter={e => (e.currentTarget.style.color = C.navy)}
                onMouseLeave={e => (e.currentTarget.style.color = C.green)}
              >
                Advertising →
              </a>
            </div>
          </div>
          <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: C.border }}>
            <p className="text-sm" style={{ color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>
              © 2026 IDEASMART — Startup di Tecnologia &amp; Innovazione. Tutti i diritti riservati.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="/privacy"
                className="text-sm transition-colors"
                style={{ color: C.muted, fontFamily: "'DM Sans', sans-serif" }}
                onMouseEnter={e => (e.currentTarget.style.color = C.green)}
                onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
              >
                Privacy Policy &amp; Disclaimer
              </a>
              <span style={{ color: C.border }}>·</span>
              <CookiePreferencesLink />
              <span style={{ color: C.border }}>·</span>
              <p className="text-sm" style={{ color: C.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                Startup News · Aggiornato il {new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
