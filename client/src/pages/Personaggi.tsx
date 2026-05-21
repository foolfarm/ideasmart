/*
 * ProofPress — PERSONAGGI del Venture Italiano
 * Design: StartupItalia-inspired — card con foto 3:4, titoli Playfair serif
 * Focus: 90% Italia, 10% internazionale — founder, investor, executive
 */
import { useState } from "react";
import { Link } from "wouter";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import { trpc } from "@/lib/trpc";
import SEOHead from "@/components/SEOHead";
import RequireAuth from "@/components/RequireAuth";
import { Linkedin, Twitter, Globe, ExternalLink, Users, TrendingUp, Award, Building2 } from "lucide-react";

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
  founder: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
  investor: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  executive: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
  researcher: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
  journalist: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
  other: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
};

type Personaggio = {
  id: number;
  name: string;
  slug: string;
  role: string | null;
  company: string | null;
  country: string;
  bio: string | null;
  imageUrl: string | null;
  category: string;
  tags: string[] | null;
  fundingRaised: string | null;
  exits: number | null;
  companiesCount: number | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  websiteUrl: string | null;
  quote: string | null;
  featured: boolean | null;
  isItalian: boolean | null;
};

const CATEGORIES = ["all", "founder", "investor", "executive", "researcher", "journalist"];

function PersonaggioCard({ p, large = false }: { p: Personaggio; large?: boolean }) {
  const imgUrl = p.imageUrl || FALLBACK_IMAGES[p.category] || FALLBACK_IMAGES["founder"];
  const catColor = CATEGORY_COLORS[p.category] || "#1a1a1a";
  const catLabel = CATEGORY_LABELS[p.category] || p.category;

  if (large) {
    return (
      <article className="group cursor-pointer">
        <Link href={`/personaggi/${p.slug}`}>
          <div className="relative overflow-hidden rounded-lg bg-[#f5f5f5]" style={{ aspectRatio: "3/2" }}>
            <img src={imgUrl} alt={p.name} loading="eager"
              className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            {p.isItalian && (
              <div className="absolute top-3 left-3 text-lg">🇮🇹</div>
            )}
            {p.featured && (
              <div className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                style={{ background: "#e63946", color: "#fff", fontFamily: FONT_SANS, borderRadius: "3px" }}>
                In evidenza
              </div>
            )}
          </div>
        </Link>
        <div className="mt-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-0.5"
              style={{ background: catColor, color: "#fff", fontFamily: FONT_SANS, borderRadius: "3px" }}>
              {catLabel}
            </span>
            {p.company && (
              <span className="text-[11px] text-[#666]" style={{ fontFamily: FONT_SANS }}>{p.company}</span>
            )}
          </div>
          <Link href={`/personaggi/${p.slug}`}>
            <h2 className="text-[#1a1a1a] hover:text-[#e63946] transition-colors"
              style={{ fontFamily: FONT_SERIF, fontSize: "clamp(22px, 2.5vw, 28px)", fontWeight: 800, lineHeight: 1.2 }}>
              {p.name}
            </h2>
          </Link>
          {p.role && (
            <p className="mt-1 text-[13px] text-[#888] font-medium" style={{ fontFamily: FONT_SANS }}>{p.role}</p>
          )}
          {p.bio && (
            <p className="mt-2 text-[14px] leading-relaxed text-[#555] line-clamp-3"
              style={{ fontFamily: FONT_SANS, lineHeight: 1.65 }}>
              {p.bio}
            </p>
          )}
          {p.quote && (
            <blockquote className="mt-3 pl-3 border-l-2 text-[13px] italic text-[#777] line-clamp-2"
              style={{ borderColor: catColor, fontFamily: FONT_SERIF }}>
              "{p.quote}"
            </blockquote>
          )}
          <div className="flex items-center gap-3 mt-3">
            {p.exits !== null && p.exits > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-[#666]" style={{ fontFamily: FONT_SANS }}>
                <Award className="w-3 h-3" /> {p.exits} exit
              </span>
            )}
            {p.fundingRaised && (
              <span className="flex items-center gap-1 text-[11px] text-[#666]" style={{ fontFamily: FONT_SANS }}>
                <TrendingUp className="w-3 h-3" /> {p.fundingRaised}
              </span>
            )}
            {p.linkedinUrl && (
              <a href={p.linkedinUrl} target="_blank" rel="noopener noreferrer"
                className="text-[#0077b5] hover:opacity-70 transition-opacity">
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {p.twitterUrl && (
              <a href={p.twitterUrl} target="_blank" rel="noopener noreferrer"
                className="text-[#1da1f2] hover:opacity-70 transition-opacity">
                <Twitter className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group cursor-pointer flex gap-4">
      <Link href={`/personaggi/${p.slug}`}>
        <div className="relative overflow-hidden rounded-md bg-[#f5f5f5] shrink-0"
          style={{ width: "80px", height: "80px" }}>
          <img src={imgUrl} alt={p.name} loading="lazy"
            className="w-full h-full object-cover object-top group-hover:scale-[1.05] transition-transform duration-500" />
          {p.isItalian && (
            <div className="absolute bottom-0 right-0 text-[10px] bg-white/80 px-0.5">🇮🇹</div>
          )}
        </div>
      </Link>
      <div className="flex-1 min-w-0">
        <span className="inline-block text-[9px] font-bold uppercase tracking-[0.1em] px-1.5 py-0.5 mb-1"
          style={{ background: catColor, color: "#fff", fontFamily: FONT_SANS, borderRadius: "2px" }}>
          {catLabel}
        </span>
        <Link href={`/personaggi/${p.slug}`}>
          <h3 className="text-[#1a1a1a] hover:text-[#e63946] transition-colors font-bold leading-snug"
            style={{ fontFamily: FONT_SERIF, fontSize: "15px" }}>
            {p.name}
          </h3>
        </Link>
        {p.role && (
          <p className="text-[11px] text-[#888]" style={{ fontFamily: FONT_SANS }}>{p.role}</p>
        )}
        {p.company && (
          <p className="text-[11px] text-[#aaa]" style={{ fontFamily: FONT_SANS }}>{p.company}</p>
        )}
      </div>
    </article>
  );
}

function PersonaggioGridCard({ p }: { p: Personaggio }) {
  const imgUrl = p.imageUrl || FALLBACK_IMAGES[p.category] || FALLBACK_IMAGES["founder"];
  const catColor = CATEGORY_COLORS[p.category] || "#1a1a1a";
  const catLabel = CATEGORY_LABELS[p.category] || p.category;

  return (
    <article className="group cursor-pointer border border-[#f0f0f0] rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/personaggi/${p.slug}`}>
        <div className="relative overflow-hidden bg-[#f5f5f5]" style={{ aspectRatio: "4/3" }}>
          <img src={imgUrl} alt={p.name} loading="lazy"
            className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          {p.isItalian && (
            <div className="absolute top-2 left-2 text-base">🇮🇹</div>
          )}
          {!p.isItalian && (
            <div className="absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5"
              style={{ background: "#2563eb", color: "#fff", fontFamily: FONT_SANS, borderRadius: "2px" }}>
              {p.country}
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <span className="inline-block text-[9px] font-bold uppercase tracking-[0.1em] px-1.5 py-0.5 mb-2"
          style={{ background: catColor, color: "#fff", fontFamily: FONT_SANS, borderRadius: "2px" }}>
          {catLabel}
        </span>
        <Link href={`/personaggi/${p.slug}`}>
          <h3 className="text-[#1a1a1a] hover:text-[#e63946] transition-colors font-bold leading-snug"
            style={{ fontFamily: FONT_SERIF, fontSize: "17px", lineHeight: 1.3 }}>
            {p.name}
          </h3>
        </Link>
        {p.role && (
          <p className="mt-0.5 text-[12px] text-[#888]" style={{ fontFamily: FONT_SANS }}>{p.role}</p>
        )}
        {p.company && (
          <p className="text-[11px] text-[#aaa]" style={{ fontFamily: FONT_SANS }}>{p.company}</p>
        )}
        {p.bio && (
          <p className="mt-2 text-[12px] text-[#666] line-clamp-2" style={{ fontFamily: FONT_SANS, lineHeight: 1.55 }}>
            {p.bio}
          </p>
        )}
        <div className="flex items-center gap-2 mt-3">
          {p.exits !== null && p.exits > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-[#888]" style={{ fontFamily: FONT_SANS }}>
              <Award className="w-3 h-3" /> {p.exits} exit
            </span>
          )}
          {p.fundingRaised && (
            <span className="flex items-center gap-1 text-[10px] text-[#888]" style={{ fontFamily: FONT_SANS }}>
              <TrendingUp className="w-3 h-3" /> {p.fundingRaised}
            </span>
          )}
          <div className="ml-auto flex items-center gap-1.5">
            {p.linkedinUrl && (
              <a href={p.linkedinUrl} target="_blank" rel="noopener noreferrer"
                className="text-[#0077b5] hover:opacity-70 transition-opacity">
                <Linkedin className="w-3.5 h-3.5" />
              </a>
            )}
            {p.twitterUrl && (
              <a href={p.twitterUrl} target="_blank" rel="noopener noreferrer"
                className="text-[#1da1f2] hover:opacity-70 transition-opacity">
                <Twitter className="w-3.5 h-3.5" />
              </a>
            )}
            {p.websiteUrl && (
              <a href={p.websiteUrl} target="_blank" rel="noopener noreferrer"
                className="text-[#666] hover:opacity-70 transition-opacity">
                <Globe className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

// ── Stato vuoto con personaggi placeholder ────────────────────────────────────
const PLACEHOLDER_PERSONAGGI: Personaggio[] = [
  {
    id: 1, name: "Matteo Rizzi", slug: "matteo-rizzi",
    role: "Co-Founder & General Partner", company: "FinTech Stage",
    country: "IT", bio: "Pioniere del fintech europeo, ha co-fondato FinTech Stage e accelerato oltre 200 startup nel settore finanziario. Advisor di fondi VC in 12 paesi.",
    imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
    category: "investor", tags: ["FinTech", "VC", "Europa"],
    fundingRaised: null, exits: 2, companiesCount: 3,
    linkedinUrl: "https://linkedin.com", twitterUrl: null, websiteUrl: null,
    quote: "Il fintech italiano ha tutto per diventare un benchmark europeo.", featured: true, isItalian: true,
  },
  {
    id: 2, name: "Veronica Gentili", slug: "veronica-gentili",
    role: "Founder & CEO", company: "Veronica Gentili Agency",
    country: "IT", bio: "Tra le massime esperte di social media marketing in Italia. Autrice di bestseller, docente universitaria e advisor di brand globali.",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
    category: "founder", tags: ["Social Media", "Marketing", "Formazione"],
    fundingRaised: null, exits: 0, companiesCount: 2,
    linkedinUrl: "https://linkedin.com", twitterUrl: "https://twitter.com", websiteUrl: null,
    quote: "I social media sono lo specchio della società, non solo strumenti di business.", featured: true, isItalian: true,
  },
  {
    id: 3, name: "Luca Ascani", slug: "luca-ascani",
    role: "Co-Founder & CEO", company: "CodeWeek EU",
    country: "IT", bio: "Imprenditore e politico, ha lanciato la European Code Week raggiungendo 10M+ studenti. Pioniere dell'educazione digitale in Europa.",
    imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
    category: "executive", tags: ["EdTech", "Policy", "Europa"],
    fundingRaised: null, exits: 1, companiesCount: 4,
    linkedinUrl: "https://linkedin.com", twitterUrl: null, websiteUrl: null,
    quote: "Programmare è la nuova alfabetizzazione del XXI secolo.", featured: false, isItalian: true,
  },
  {
    id: 4, name: "Gianluca Dettori", slug: "gianluca-dettori",
    role: "Founder & Managing Partner", company: "Primomiglio SGR",
    country: "IT", bio: "Tra i più attivi investitori early-stage in Italia. Ha fondato Primomiglio, fondo VC focalizzato su deep tech e AI. Ex-founder con 2 exit.",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    category: "investor", tags: ["VC", "Deep Tech", "AI"],
    fundingRaised: "€50M AUM", exits: 2, companiesCount: 5,
    linkedinUrl: "https://linkedin.com", twitterUrl: "https://twitter.com", websiteUrl: null,
    quote: "L'Italia ha talento da vendere. Manca ancora la cultura del rischio.", featured: true, isItalian: true,
  },
  {
    id: 5, name: "Federica Paci", slug: "federica-paci",
    role: "Head of AI Research", company: "Nokia Bell Labs",
    country: "IT", bio: "Ricercatrice di fama internazionale in AI e machine learning. Lavora a Nokia Bell Labs dove guida team di ricerca su modelli predittivi e privacy-preserving AI.",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    category: "researcher", tags: ["AI", "ML", "Privacy"],
    fundingRaised: null, exits: 0, companiesCount: 1,
    linkedinUrl: "https://linkedin.com", twitterUrl: null, websiteUrl: null,
    quote: "L'AI responsabile non è un vincolo, è un vantaggio competitivo.", featured: false, isItalian: true,
  },
  {
    id: 6, name: "Massimo Ciaglia", slug: "massimo-ciaglia",
    role: "Founder & CEO", company: "Startupbusiness",
    country: "IT", bio: "Fondatore di Startupbusiness, la principale media company italiana dedicata all'ecosistema startup. Giornalista e osservatore dell'innovazione da oltre 15 anni.",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
    category: "journalist", tags: ["Media", "Startup", "Innovazione"],
    fundingRaised: null, exits: 0, companiesCount: 2,
    linkedinUrl: "https://linkedin.com", twitterUrl: "https://twitter.com", websiteUrl: null,
    quote: "Raccontare le startup è il modo migliore per farle crescere.", featured: false, isItalian: true,
  },
];

export default function Personaggi() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [showOnlyItalian, setShowOnlyItalian] = useState(false);

  const { data: personaggiData, isLoading } = trpc.personaggi.getAll.useQuery({
    limit: 50,
    category: activeCategory !== "all" ? activeCategory : undefined,
    onlyItalian: showOnlyItalian ? true : undefined,
  });

  // Usa placeholder se il database è vuoto
  const displayData = (personaggiData && personaggiData.length > 0)
    ? personaggiData
    : PLACEHOLDER_PERSONAGGI;

  const isEmpty = !isLoading && (!personaggiData || personaggiData.length === 0);

  const heroPersonaggio = displayData[0] ?? null;
  const featuredList = displayData.filter(p => p.featured && p.id !== heroPersonaggio?.id).slice(0, 2);
  const gridItems = displayData.filter(p => !p.featured || (p.id !== heroPersonaggio?.id && !featuredList.find(f => f.id === p.id)));
  const sidebarItems = displayData.slice(0, 6);

  return (
    <RequireAuth>
      <>
        <SEOHead
          title="Personaggi del Venture Italiano — Proof Press"
          description="I protagonisti dell'ecosistema startup e venture capital italiano: founder, investor, executive. 90% Italia, 10% internazionale."
          canonical="https://proofpress.ai/personaggi"
          ogImage="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80"
          ogSiteName="Proof Press"
        />
        <div className="min-h-screen" style={{ background: "#ffffff" }}>
          <SharedPageHeader />
          <main className="max-w-[1280px] mx-auto px-4 pb-16">

            {/* ── FILTRI ── */}
            <div className="mt-6 mb-6 flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="text-[11px] font-bold uppercase tracking-[0.1em] px-3 py-1.5 rounded-full border transition-all"
                    style={{
                      fontFamily: FONT_SANS,
                      background: activeCategory === cat ? "#1a1a1a" : "transparent",
                      color: activeCategory === cat ? "#fff" : "#555",
                      borderColor: activeCategory === cat ? "#1a1a1a" : "#ddd",
                    }}
                  >
                    {cat === "all" ? "Tutti" : CATEGORY_LABELS[cat] || cat}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowOnlyItalian(!showOnlyItalian)}
                className="ml-auto flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] px-3 py-1.5 rounded-full border transition-all"
                style={{
                  fontFamily: FONT_SANS,
                  background: showOnlyItalian ? "#e63946" : "transparent",
                  color: showOnlyItalian ? "#fff" : "#555",
                  borderColor: showOnlyItalian ? "#e63946" : "#ddd",
                }}
              >
                🇮🇹 Solo Italiani
              </button>
            </div>

            {isEmpty && (
              <div className="mb-4 px-4 py-2 rounded text-[12px] text-[#888] border border-[#f0f0f0]"
                style={{ fontFamily: FONT_SANS, background: "#fafafa" }}>
                I profili sono in fase di popolamento. Visualizzazione di anteprima con personaggi di esempio.
              </div>
            )}

            {isLoading ? (
              <div className="py-20 text-center">
                <div className="animate-pulse space-y-6">
                  <div className="h-64 bg-[#f0f0f0] rounded-lg" />
                  <div className="grid grid-cols-3 gap-6">
                    {[1,2,3].map(i => <div key={i} className="h-48 bg-[#f0f0f0] rounded-lg" />)}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* ── HEADER SEZIONE ── */}
                <div className="flex items-center justify-between mb-4 pb-2" style={{ borderBottom: "3px solid #1a1a1a" }}>
                  <h2 className="text-[13px] font-bold uppercase tracking-[0.15em] m-0"
                    style={{ color: "#1a1a1a", fontFamily: FONT_SANS }}>
                    Personaggi del Venture Italiano
                  </h2>
                  <span className="text-[11px] text-[#888]" style={{ fontFamily: FONT_SANS }}>
                    {displayData.length} profili · 90% 🇮🇹
                  </span>
                </div>

                {/* ── HERO + SIDEBAR ── */}
                {heroPersonaggio && (
                  <section className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 mb-10">
                    <PersonaggioCard p={heroPersonaggio} large />
                    <div className="space-y-4">
                      <div className="pb-2 mb-3" style={{ borderBottom: "2px solid #1a1a1a" }}>
                        <span className="text-[11px] font-bold uppercase tracking-[0.15em]"
                          style={{ color: "#1a1a1a", fontFamily: FONT_SANS }}>
                          Protagonisti
                        </span>
                      </div>
                      {sidebarItems.filter(p => p.id !== heroPersonaggio.id).slice(0, 5).map(p => (
                        <PersonaggioCard key={p.id} p={p} />
                      ))}
                    </div>
                  </section>
                )}

                {/* ── GRIGLIA 3 COLONNE ── */}
                {gridItems.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-4 pb-2" style={{ borderBottom: "2px solid #1a1a1a" }}>
                      <span className="text-[12px] font-bold uppercase tracking-[0.15em]"
                        style={{ color: "#1a1a1a", fontFamily: FONT_SANS }}>
                        Tutti i Profili
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {gridItems.map(p => (
                        <PersonaggioGridCard key={p.id} p={p} />
                      ))}
                    </div>
                  </section>
                )}

                {/* ── CALL TO ACTION ── */}
                <section className="mt-12 p-8 rounded-lg text-center" style={{ background: "#f8f8f8" }}>
                  <h3 className="text-[22px] font-bold text-[#1a1a1a] mb-2"
                    style={{ fontFamily: FONT_SERIF }}>
                    Conosci un protagonista del venture italiano?
                  </h3>
                  <p className="text-[14px] text-[#666] mb-4" style={{ fontFamily: FONT_SANS }}>
                    Segnalaci founder, investor ed executive che stanno costruendo il futuro dell'ecosistema italiano.
                  </p>
                  <a href="mailto:redazione@proofpress.ai"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded font-bold text-[13px] uppercase tracking-widest transition-opacity hover:opacity-80"
                    style={{ background: "#1a1a1a", color: "#fff", fontFamily: FONT_SANS }}>
                    <ExternalLink className="w-4 h-4" />
                    Segnala un Personaggio
                  </a>
                </section>
              </>
            )}

            <SharedPageFooter />
          </main>
        </div>
      </>
    </RequireAuth>
  );
}
