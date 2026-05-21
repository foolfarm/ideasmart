/*
 * ProofPress — PERSONAGGIO DETAIL
 * Layout: hero foto + bio estesa + citazione + stats + link social
 * Design: editoriale StartupItalia — Playfair serif, accent rosso #e63946
 */
import { useParams, Link } from "wouter";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import { trpc } from "@/lib/trpc";
import SEOHead from "@/components/SEOHead";
import RequireAuth from "@/components/RequireAuth";
import { Linkedin, Twitter, Globe, ArrowLeft, Award, TrendingUp, Building2, Users, ExternalLink } from "lucide-react";

const FONT_SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
const FONT_SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif";

const CATEGORY_LABELS: Record<string, string> = {
  founder: "Founder",
  investor: "Investor",
  executive: "Executive",
  researcher: "Ricercatore",
  journalist: "Giornalista",
  other: "Altro",
};

const CATEGORY_COLORS: Record<string, string> = {
  founder: "#e63946",
  investor: "#2563eb",
  executive: "#059669",
  researcher: "#7c3aed",
  journalist: "#d97706",
  other: "#6b7280",
};

const FALLBACK_IMAGES: Record<string, string> = {
  founder: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80",
  investor: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
  executive: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80",
  researcher: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80",
  journalist: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80",
  other: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&q=80",
};

function SkeletonDetail() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-[#f0f0f0] rounded w-1/4 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-10">
        <div className="h-96 bg-[#f0f0f0] rounded-lg" />
        <div className="space-y-4">
          <div className="h-10 bg-[#f0f0f0] rounded w-3/4" />
          <div className="h-5 bg-[#f0f0f0] rounded w-1/2" />
          <div className="h-32 bg-[#f0f0f0] rounded" />
        </div>
      </div>
    </div>
  );
}

export default function PersonaggioDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";

  const { data: p, isLoading, error } = trpc.personaggi.getBySlug.useQuery(
    { slug },
    { enabled: !!slug, retry: false }
  );

  const { data: others } = trpc.personaggi.getAll.useQuery(
    { limit: 4, featured: true },
    { enabled: !!p }
  );

  const imgUrl = p?.imageUrl || FALLBACK_IMAGES[p?.category ?? "founder"] || FALLBACK_IMAGES["founder"];
  const catColor = CATEGORY_COLORS[p?.category ?? "founder"] || "#1a1a1a";
  const catLabel = CATEGORY_LABELS[p?.category ?? "founder"] || p?.category || "";

  return (
    <RequireAuth>
      <>
        {p && (
          <SEOHead
            title={`${p.name} — ${p.role ?? catLabel} | ProofPress Personaggi`}
            description={p.bio ?? `Profilo di ${p.name}, ${p.role ?? ""} ${p.company ? `@ ${p.company}` : ""}`}
            canonical={`https://proofpress.ai/personaggi/${p.slug}`}
            ogImage={p.imageUrl ?? undefined}
            ogSiteName="ProofPress"
          />
        )}
        <div className="min-h-screen" style={{ background: "#ffffff" }}>
          <SharedPageHeader />
          <main className="max-w-[1280px] mx-auto px-4 pb-16 mt-6">

            {/* ── BREADCRUMB ── */}
            <div className="flex items-center gap-2 mb-6">
              <Link href="/personaggi">
                <button className="flex items-center gap-1.5 text-[12px] font-medium text-[#888] hover:text-[#1a1a1a] transition-colors"
                  style={{ fontFamily: FONT_SANS }}>
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Personaggi
                </button>
              </Link>
              {p && (
                <>
                  <span className="text-[#ccc]">/</span>
                  <span className="text-[12px] text-[#1a1a1a] font-medium" style={{ fontFamily: FONT_SANS }}>{p.name}</span>
                </>
              )}
            </div>

            {isLoading && <SkeletonDetail />}

            {error && (
              <div className="py-20 text-center">
                <p className="text-[16px] text-[#888]" style={{ fontFamily: FONT_SANS }}>
                  Personaggio non trovato o non ancora disponibile.
                </p>
                <Link href="/personaggi">
                  <button className="mt-4 px-4 py-2 rounded text-[13px] font-bold"
                    style={{ background: "#1a1a1a", color: "#fff", fontFamily: FONT_SANS }}>
                    Torna ai Personaggi
                  </button>
                </Link>
              </div>
            )}

            {p && (
              <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10">

                {/* ── COLONNA SINISTRA: foto + stats + social ── */}
                <aside>
                  {/* Foto */}
                  <div className="relative overflow-hidden rounded-lg bg-[#f5f5f5] mb-5"
                    style={{ aspectRatio: "3/4" }}>
                    <img src={imgUrl} alt={p.name} loading="eager"
                      className="w-full h-full object-cover object-top" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    {p.isItalian && (
                      <div className="absolute top-3 left-3 text-xl">🇮🇹</div>
                    )}
                    {!p.isItalian && p.country && (
                      <div className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-bold"
                        style={{ background: "#2563eb", color: "#fff", fontFamily: FONT_SANS, borderRadius: "3px" }}>
                        {p.country}
                      </div>
                    )}
                    {p.featured && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                        style={{ background: "#e63946", color: "#fff", fontFamily: FONT_SANS, borderRadius: "3px" }}>
                        In evidenza
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-5">
                    {(p.exits !== null && p.exits > 0) && (
                      <div className="text-center p-3 rounded-lg" style={{ background: "#f8f8f8" }}>
                        <div className="text-[22px] font-black text-[#1a1a1a]"
                          style={{ fontFamily: FONT_SERIF }}>{p.exits}</div>
                        <div className="text-[10px] text-[#888] uppercase tracking-wide"
                          style={{ fontFamily: FONT_SANS }}>Exit</div>
                      </div>
                    )}
                    {(p.companiesCount !== null && p.companiesCount > 0) && (
                      <div className="text-center p-3 rounded-lg" style={{ background: "#f8f8f8" }}>
                        <div className="text-[22px] font-black text-[#1a1a1a]"
                          style={{ fontFamily: FONT_SERIF }}>{p.companiesCount}</div>
                        <div className="text-[10px] text-[#888] uppercase tracking-wide"
                          style={{ fontFamily: FONT_SANS }}>Venture</div>
                      </div>
                    )}
                    {p.fundingRaised && (
                      <div className="text-center p-3 rounded-lg col-span-3" style={{ background: "#f8f8f8" }}>
                        <div className="text-[15px] font-black text-[#1a1a1a]"
                          style={{ fontFamily: FONT_SERIF }}>{p.fundingRaised}</div>
                        <div className="text-[10px] text-[#888] uppercase tracking-wide"
                          style={{ fontFamily: FONT_SANS }}>Funding / AUM</div>
                      </div>
                    )}
                  </div>

                  {/* Social links */}
                  <div className="flex flex-col gap-2">
                    {p.linkedinUrl && (
                      <a href={p.linkedinUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-[13px] transition-opacity hover:opacity-80"
                        style={{ background: "#0077b5", color: "#fff", fontFamily: FONT_SANS }}>
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                        <ExternalLink className="w-3 h-3 ml-auto opacity-60" />
                      </a>
                    )}
                    {p.twitterUrl && (
                      <a href={p.twitterUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-[13px] transition-opacity hover:opacity-80"
                        style={{ background: "#1da1f2", color: "#fff", fontFamily: FONT_SANS }}>
                        <Twitter className="w-4 h-4" />
                        Twitter / X
                        <ExternalLink className="w-3 h-3 ml-auto opacity-60" />
                      </a>
                    )}
                    {p.websiteUrl && (
                      <a href={p.websiteUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-[13px] transition-opacity hover:opacity-80"
                        style={{ background: "#1a1a1a", color: "#fff", fontFamily: FONT_SANS }}>
                        <Globe className="w-4 h-4" />
                        Sito Web
                        <ExternalLink className="w-3 h-3 ml-auto opacity-60" />
                      </a>
                    )}
                  </div>
                </aside>

                {/* ── COLONNA DESTRA: contenuto ── */}
                <article>
                  {/* Categoria */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] px-2.5 py-1"
                      style={{ background: catColor, color: "#fff", fontFamily: FONT_SANS, borderRadius: "3px" }}>
                      {catLabel}
                    </span>
                    {p.company && (
                      <span className="flex items-center gap-1 text-[13px] text-[#666]"
                        style={{ fontFamily: FONT_SANS }}>
                        <Building2 className="w-3.5 h-3.5" />
                        {p.company}
                      </span>
                    )}
                  </div>

                  {/* Nome */}
                  <h1 className="text-[#1a1a1a] mb-1"
                    style={{ fontFamily: FONT_SERIF, fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 800, lineHeight: 1.1 }}>
                    {p.name}
                  </h1>

                  {/* Ruolo */}
                  {p.role && (
                    <p className="text-[16px] text-[#888] font-medium mb-5"
                      style={{ fontFamily: FONT_SANS }}>
                      {p.role}
                    </p>
                  )}

                  {/* Divisore */}
                  <div className="mb-6" style={{ borderTop: "3px solid #1a1a1a" }} />

                  {/* Citazione */}
                  {p.quote && (
                    <blockquote className="mb-8 pl-5 py-2"
                      style={{ borderLeft: `4px solid ${catColor}` }}>
                      <p className="text-[18px] italic text-[#333] leading-relaxed"
                        style={{ fontFamily: FONT_SERIF }}>
                        "{p.quote}"
                      </p>
                      {p.quoteSource && (
                        <cite className="mt-2 block text-[12px] text-[#888] not-italic"
                          style={{ fontFamily: FONT_SANS }}>
                          — {p.quoteSource}
                        </cite>
                      )}
                    </blockquote>
                  )}

                  {/* Bio estesa */}
                  {(p.fullBio || p.bio) && (
                    <div className="mb-8">
                      <h2 className="text-[13px] font-bold uppercase tracking-[0.15em] mb-3"
                        style={{ color: "#1a1a1a", fontFamily: FONT_SANS }}>
                        Profilo
                      </h2>
                      <div className="prose prose-lg max-w-none">
                        {(p.fullBio || p.bio || "").split("\n").map((para, i) => (
                          para.trim() ? (
                            <p key={i} className="text-[15px] text-[#444] leading-relaxed mb-4"
                              style={{ fontFamily: FONT_SANS, lineHeight: 1.75 }}>
                              {para}
                            </p>
                          ) : null
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {p.tags && Array.isArray(p.tags) && p.tags.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-[13px] font-bold uppercase tracking-[0.15em] mb-3"
                        style={{ color: "#1a1a1a", fontFamily: FONT_SANS }}>
                        Aree di Expertise
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {(p.tags as string[]).map((tag) => (
                          <span key={tag}
                            className="px-3 py-1 text-[12px] font-medium rounded-full border"
                            style={{ fontFamily: FONT_SANS, borderColor: "#e0e0e0", color: "#555", background: "#fafafa" }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA condivisione */}
                  <div className="p-5 rounded-lg" style={{ background: "#f8f8f8" }}>
                    <p className="text-[13px] text-[#888] mb-3" style={{ fontFamily: FONT_SANS }}>
                      Hai informazioni aggiornate su questo profilo? Segnalacelo.
                    </p>
                    <a href={`mailto:redazione@proofpress.ai?subject=Aggiornamento profilo: ${p.name}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded text-[12px] font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
                      style={{ background: "#1a1a1a", color: "#fff", fontFamily: FONT_SANS }}>
                      <ExternalLink className="w-3.5 h-3.5" />
                      Segnala un aggiornamento
                    </a>
                  </div>
                </article>
              </div>
            )}

            {/* ── ALTRI PROFILI ── */}
            {others && others.filter(o => o.slug !== slug).length > 0 && (
              <section className="mt-14">
                <div className="flex items-center justify-between mb-5 pb-2"
                  style={{ borderBottom: "3px solid #1a1a1a" }}>
                  <span className="text-[13px] font-bold uppercase tracking-[0.15em]"
                    style={{ color: "#1a1a1a", fontFamily: FONT_SANS }}>
                    Altri Protagonisti
                  </span>
                  <Link href="/personaggi">
                    <span className="text-[12px] font-medium text-[#888] hover:text-[#e63946] transition-colors cursor-pointer"
                      style={{ fontFamily: FONT_SANS }}>
                      Vedi tutti →
                    </span>
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                  {others.filter(o => o.slug !== slug).slice(0, 4).map(o => {
                    const oImg = o.imageUrl || FALLBACK_IMAGES[o.category] || FALLBACK_IMAGES["founder"];
                    const oColor = CATEGORY_COLORS[o.category] || "#1a1a1a";
                    const oLabel = CATEGORY_LABELS[o.category] || o.category;
                    return (
                      <Link key={o.id} href={`/personaggi/${o.slug}`}>
                        <article className="group cursor-pointer">
                          <div className="relative overflow-hidden rounded-lg bg-[#f5f5f5] mb-3"
                            style={{ aspectRatio: "3/4" }}>
                            <img src={oImg} alt={o.name} loading="lazy"
                              className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500" />
                          </div>
                          <span className="inline-block text-[9px] font-bold uppercase tracking-[0.1em] px-1.5 py-0.5 mb-1"
                            style={{ background: oColor, color: "#fff", fontFamily: FONT_SANS, borderRadius: "2px" }}>
                            {oLabel}
                          </span>
                          <h3 className="text-[14px] font-bold text-[#1a1a1a] group-hover:text-[#e63946] transition-colors leading-snug"
                            style={{ fontFamily: FONT_SERIF }}>
                            {o.name}
                          </h3>
                          {o.company && (
                            <p className="text-[11px] text-[#aaa]" style={{ fontFamily: FONT_SANS }}>{o.company}</p>
                          )}
                        </article>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            <SharedPageFooter />
          </main>
        </div>
      </>
    </RequireAuth>
  );
}
