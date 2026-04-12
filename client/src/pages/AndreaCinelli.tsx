/**
 * Pagina autore — Andrea Cinelli
 * Tech Expert
 * Layout: editoriale bianco-carta con foto profilo, bio, archivio post LinkedIn e CTA contatto
 */
import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import SEOHead from "@/components/SEOHead";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import LeftSidebar from "@/components/LeftSidebar";

const INK = "#0f0f0f";
const ACCENT = "#1a1a1a";
const PAPER = "#ffffff";
const LINKEDIN_BLUE = "#0077b5";

const PROFILE_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/andrea-cinelli-profile_2084610f.jpeg";

const SECTION_COLORS: Record<string, { accent: string; label: string }> = {
  ai:      { accent: "#1a1a1a", label: "AI NEWS" },
  startup: { accent: "#2a2a2a", label: "STARTUP NEWS" }
};

function formatDateIT(dateLabel: string): string {
  try {
    const [year, month, day] = dateLabel.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return dateLabel;
  }
}

function PostCard({ post }: {
  post: {
    id: number;
    dateLabel: string;
    title: string | null;
    postText: string;
    section: string;
    imageUrl: string | null;
    linkedinUrl: string | null;
    hashtags: string | null;
  }
}) {
  const [expanded, setExpanded] = useState(false);
  const paragraphs = post.postText
    .split(/\n{2}/)
    .map(p => p.trim())
    .filter(p => p.length > 0 && !p.startsWith("#"));

  const preview = paragraphs.slice(0, 2);
  const rest = paragraphs.slice(2);
  const sec = SECTION_COLORS[post.section] ?? { accent: "#1a1a1a", label: post.section };

  return (
    <article
      className="border-t py-6 grid grid-cols-1 md:grid-cols-4 gap-4"
      style={{ borderColor: INK + "15" }}
    >
      {/* Immagine */}
      {post.imageUrl && (
        <div className="md:col-span-1 h-36 overflow-hidden rounded">
          <img
            src={post.imageUrl}
            alt={post.title ?? "Editoriale"}
            className="w-full h-full object-cover grayscale-[10%] hover:grayscale-0 transition-all duration-500"
            loading="lazy"
          />
        </div>
      )}

      {/* Contenuto */}
      <div className={post.imageUrl ? "md:col-span-3" : "md:col-span-4"}>
        {/* Meta */}
        <div className="flex items-center gap-3 mb-2">
          <span
            className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm"
            style={{ color: sec.accent, background: sec.accent + "15", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
          >
            {sec.label}
          </span>
          <span
            className="text-[10px]"
            style={{ color: INK + "50", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
          >
            {formatDateIT(post.dateLabel)}
          </span>
        </div>

        {/* Titolo */}
        {post.title && (
          <h3
            className="text-lg font-bold leading-snug mb-3"
            style={{ color: INK, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
          >
            {post.title}
          </h3>
        )}

        {/* Corpo */}
        <div className="space-y-2">
          {preview.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed" style={{ color: INK + "cc", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
              {p}
            </p>
          ))}
          {expanded && rest.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed" style={{ color: INK + "cc", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
              {p}
            </p>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center gap-4">
          {rest.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[10px] font-bold uppercase tracking-widest hover:underline"
              style={{ color: ACCENT, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
            >
              {expanded ? "Mostra meno ↑" : "Leggi tutto ↓"}
            </button>
          )}
          {post.linkedinUrl && (
            <a
              href={post.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-bold uppercase tracking-widest hover:underline"
              style={{ color: LINKEDIN_BLUE, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
            >
              Vedi su LinkedIn →
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function EditorialeCard({ item }: {
  item: {
    id: number;
    dateLabel: string;
    title: string;
    subtitle: string | null;
    keyTrend: string | null;
    section: string;
    imageUrl: string | null;
    authorNote: string | null;
  }
}) {
  const sec = SECTION_COLORS[item.section] ?? { accent: "#1a1a1a", label: item.section.toUpperCase() };
  return (
    <article className="border-t py-6 grid grid-cols-1 md:grid-cols-4 gap-4" style={{ borderColor: INK + "15" }}>
      {item.imageUrl && (
        <div className="md:col-span-1 h-36 overflow-hidden rounded">
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover grayscale-[10%] hover:grayscale-0 transition-all duration-500" loading="lazy" />
        </div>
      )}
      <div className={item.imageUrl ? "md:col-span-3" : "md:col-span-4"}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm" style={{ color: sec.accent, background: sec.accent + "15", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>{sec.label}</span>
          <span className="text-[10px]" style={{ color: INK + "50", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>{formatDateIT(item.dateLabel)}</span>
          {item.keyTrend && (
            <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: "#f0f0f0", color: INK + "80", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>{item.keyTrend}</span>
          )}
        </div>
        <Link href={`/ai/editoriale/${item.id}`}>
          <h3 className="text-lg font-bold leading-snug mb-2 hover:underline cursor-pointer" style={{ color: INK, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>{item.title}</h3>
        </Link>
        {item.subtitle && (
          <p className="text-sm leading-relaxed mb-2" style={{ color: INK + "80", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>{item.subtitle}</p>
        )}
        {item.authorNote && (
          <p className="text-xs italic" style={{ color: INK + "60", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>— {item.authorNote}</p>
        )}
        <div className="mt-3">
          <Link href={`/ai/editoriale/${item.id}`}>
            <span className="text-[10px] font-bold uppercase tracking-widest hover:underline" style={{ color: ACCENT, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>Leggi l'editoriale completo →</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function AndreaCinelli() {
  const { data: posts, isLoading } = trpc.news.getAuthorPosts.useQuery(
    { limit: 30 },
    { staleTime: 1000 * 60 * 30, refetchOnWindowFocus: false }
  );
  const { data: editorials, isLoading: editorialsLoading } = trpc.editorial.getAll.useQuery(
    { limit: 60 },
    { staleTime: 1000 * 60 * 30, refetchOnWindowFocus: false }
  );
  const [activeTab, setActiveTab] = useState<"editoriali" | "post">("editoriali");
  const totalPosts = posts?.length ?? 0;
  const aiPosts = posts?.filter(p => p.section === "ai").length ?? 0;
  const startupPosts = posts?.filter(p => p.section === "startup").length ?? 0;

  return (
    <>
      <SEOHead
        title="Andrea Cinelli — Tech Expert"
        description="Editoriali quotidiani su AI, Startup e Venture Capital. Tech Expert e fondatore di Proof Press."
      />
    <div className="flex" style={{ background: PAPER, minHeight: "100vh" }}>
      <LeftSidebar />
      <div className="flex-1 min-w-0">
      <SharedPageHeader />

      {/* ── Hero autore ──────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Foto */}
          <div className="md:col-span-1 flex flex-col items-center md:items-start gap-4">
            <div className="relative">
              <img
                src={PROFILE_IMG}
                alt="Andrea Cinelli"
                className="w-40 h-40 rounded-full object-cover object-top shadow-lg border-4"
                style={{ borderColor: ACCENT }}
              />
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: ACCENT }}
              >
                <span className="text-[8px] font-bold text-white">✓</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-xl font-bold" style={{ color: INK, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', serif" }}>{totalPosts}</p>
                <p className="text-[9px] uppercase tracking-widest" style={{ color: INK + "60", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>Editoriali</p>
              </div>
              <div>
                <p className="text-xl font-bold" style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', serif" }}>{aiPosts}</p>
                <p className="text-[9px] uppercase tracking-widest" style={{ color: INK + "60", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>AI</p>
              </div>
              <div>
                <p className="text-xl font-bold" style={{ color: "#2a2a2a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', serif" }}>{startupPosts}</p>
                <p className="text-[9px] uppercase tracking-widest" style={{ color: INK + "60", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>Startup</p>
              </div>
            </div>

            {/* Social links */}
            <div className="flex flex-col gap-2 w-full">
              <a
                href="https://www.linkedin.com/in/cinellia/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: LINKEDIN_BLUE, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Seguimi su LinkedIn
              </a>
              <a
                href="mailto:ac@acinelli.com"
                className="flex items-center gap-2 px-4 py-2 rounded text-sm font-bold border transition-colors hover:bg-gray-50"
                style={{ color: INK, borderColor: INK + "30", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contattami
              </a>
            </div>
          </div>

          {/* Bio */}
          <div className="md:col-span-2">
            <div className="mb-2">
              <span
                className="text-[10px] font-bold uppercase tracking-[0.3em]"
                style={{ color: ACCENT, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              >
                Proof Press
              </span>
            </div>
            <h1
              className="text-3xl md:text-4xl font-bold leading-tight mb-1"
              style={{ color: INK, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
            >
              Andrea Cinelli
            </h1>
            <p
              className="text-base mb-5"
              style={{ color: INK + "70", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", letterSpacing: "0.05em" }}
            >
              Tech Expert
            </p>

            <div className="space-y-3" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
              <p className="text-sm leading-relaxed" style={{ color: INK + "cc" }}>
                Imprenditore seriale con oltre 30 anni di esperienza nella costruzione di prodotti digitali, aziende AI-native e piattaforme tecnologiche su larga scala tra Europa e Stati Uniti.
              </p>
              <p className="text-sm leading-relaxed" style={{ color: INK + "cc" }}>
                Opera all'intersezione tra strategia, tecnologia, execution e capitale, con un focus su disruption, AI transformation e reinvenzione dei modelli di business. È advisor di CEO, board e fondi di investimento in fasi critiche di crescita, turnaround e trasformazione.
              </p>
              <p className="text-sm leading-relaxed" style={{ color: INK + "cc" }}>
                Dopo un'esperienza iniziale nella Silicon Valley negli anni '90, è stato co-fondatore di <strong>Libero.it</strong> (oltre 10 milioni di utenti) all'interno del gruppo Infostrada–Olivetti. Ha ricoperto ruoli chiave nel mondo Telco, tra cui Head of Mobile VAS GPM in <strong>Vodafone Global</strong> a Düsseldorf, ed è stato tra i pionieri europei dei servizi mobili in Omnitel–Vodafone e Wind Orascom, oltre che co-fondatore di <strong>Alice</strong> in Telecom Italia.
              </p>
              <p className="text-sm leading-relaxed" style={{ color: INK + "cc" }}>
                È fondatore di oltre 12 iniziative imprenditoriali in ambito AI (voice, biometria, cybersecurity, generative AI), con diversi exit all'attivo, e angel investor in più di 10 startup. È autore di oltre 25 brevetti, tra cui tecnologie alla base del sistema di identità digitale italiano <strong>SPID</strong>.
              </p>
              <p className="text-sm leading-relaxed" style={{ color: INK + "cc" }}>
                Ha fondato uno dei principali AI Venture Studio europei e una piattaforma di venture capital e venture building negli Stati Uniti. È membro dell'Advisory Board di <strong>Deloitte Central Mediterranean</strong>, docente di AI presso <strong>Il Sole 24 Ore Business School</strong> e keynote speaker internazionale, autore di oltre 30 pubblicazioni su AI e innovazione.
              </p>
              <p className="text-sm leading-relaxed" style={{ color: INK + "cc" }}>
                Co-fondatore di <strong>Proof Press</strong>, la prima piattaforma italiana di analisi quotidiane su AI, startup e venture capital, basata su <strong>ProofPress</strong>: una tecnologia proprietaria che integra AI e Web3 per certificare le fonti e garantire contenuti verificati, rilevanti e affidabili.
              </p>
              <p className="text-sm leading-relaxed" style={{ color: INK + "cc" }}>
                Con Proof Press ha costruito uno strumento pensato per chi prende decisioni: un'unica fonte ad alto valore che aggrega ogni giorno ricerche, notizie e analisi editoriali per supportare imprenditori, investitori e manager con insight concreti e azionabili.
              </p>
            </div>

            {/* Quote */}
            <blockquote
              className="mt-5 pl-4 border-l-4 italic text-sm leading-relaxed"
              style={{ borderColor: ACCENT, color: INK + "80", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
            >
              "AI is not a tool to adopt — it is a force that reshapes products, power and industries."
            </blockquote>
          </div>
        </div>
      </div>

      {/* ── Divisore con Tab ───────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="w-full border-t-4" style={{ borderColor: INK }} />
        <div className="py-3 flex items-center gap-6">
          <button
            onClick={() => setActiveTab("editoriali")}
            className="text-[11px] font-bold uppercase tracking-[0.25em] pb-1 transition-colors"
            style={{ color: activeTab === "editoriali" ? INK : INK + "40", borderBottom: activeTab === "editoriali" ? `2px solid ${INK}` : "2px solid transparent", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
          >
            Archivio Editoriali
          </button>
          <button
            onClick={() => setActiveTab("post")}
            className="text-[11px] font-bold uppercase tracking-[0.25em] pb-1 transition-colors"
            style={{ color: activeTab === "post" ? INK : INK + "40", borderBottom: activeTab === "post" ? `2px solid ${INK}` : "2px solid transparent", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
          >
            Post LinkedIn
          </button>
          <div className="flex-1 border-t" style={{ borderColor: INK + "20" }} />
          <span className="text-[10px] uppercase tracking-widest" style={{ color: INK + "50", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
            {activeTab === "editoriali" ? `${editorials?.length ?? 0} editoriali` : `${posts?.length ?? 0} post`}
          </span>
        </div>
      </div>

      {/* ── Lista contenuti ───────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        {/* Tab Editoriali */}
        {activeTab === "editoriali" && (
          <>
            {editorialsLoading && (
              <div className="space-y-6 py-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="border-t pt-6 animate-pulse" style={{ borderColor: INK + "15" }}>
                    <div className="h-3 rounded w-24 mb-2" style={{ background: INK + "15" }} />
                    <div className="h-5 rounded w-2/3 mb-3" style={{ background: INK + "20" }} />
                    <div className="space-y-2">
                      <div className="h-3 rounded w-full" style={{ background: INK + "10" }} />
                      <div className="h-3 rounded w-5/6" style={{ background: INK + "10" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!editorialsLoading && (!editorials || editorials.length === 0) && (
              <div className="py-12 text-center">
                <p className="text-sm" style={{ color: INK + "60", fontFamily: "'Source Serif 4', serif" }}>Nessun editoriale disponibile al momento.</p>
              </div>
            )}
            {!editorialsLoading && editorials && editorials.map(item => (
              <EditorialeCard key={item.id} item={item} />
            ))}
          </>
        )}
        {/* Tab Post LinkedIn */}
        {activeTab === "post" && (
          <>
            {isLoading && (
              <div className="space-y-6 py-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="border-t pt-6 animate-pulse" style={{ borderColor: INK + "15" }}>
                    <div className="h-3 rounded w-24 mb-2" style={{ background: INK + "15" }} />
                    <div className="h-5 rounded w-2/3 mb-3" style={{ background: INK + "20" }} />
                  </div>
                ))}
              </div>
            )}
            {!isLoading && (!posts || posts.length === 0) && (
              <div className="py-12 text-center">
                <p className="text-sm" style={{ color: INK + "60", fontFamily: "'Source Serif 4', serif" }}>Nessun post disponibile al momento.</p>
              </div>
            )}
            {!isLoading && posts && posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </>
        )}

        {/* CTA finale */}
        {!isLoading && posts && posts.length > 0 && (
          <div
            className="mt-10 p-6 rounded border text-center"
            style={{ borderColor: ACCENT + "40", background: ACCENT + "08" }}
          >
            <p
              className="text-sm font-bold mb-1"
              style={{ color: INK, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', serif" }}
            >
              Vuoi ricevere ogni mattina l'editoriale di Andrea Cinelli?
            </p>
            <p className="text-xs mb-4" style={{ color: INK + "70", fontFamily: "'Source Serif 4', serif" }}>
              Seguilo su LinkedIn per non perdere nessun aggiornamento su AI, Startup e Venture Capital.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://www.linkedin.com/in/cinellia/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 rounded text-sm font-bold text-white"
                style={{ background: LINKEDIN_BLUE, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              >
                Seguimi su LinkedIn
              </a>
              <Link
                href="/"
                className="px-6 py-2 rounded text-sm font-bold border"
                style={{ color: INK, borderColor: INK + "30", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              >
                ← Torna alla Home
              </Link>
            </div>
          </div>
        )}
      </div>
      <SharedPageFooter />
      </div>
    </div>
    </>
  );
}
