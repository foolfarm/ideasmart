/**
 * Osservatorio Tech — A cura di Andrea Cinelli
 * Stile identico a /offertacommerciale (PerGiornalisti.tsx)
 * Palette: bianco #ffffff / nero #0a0a0a / rosso #dc2626
 * Layout: LeftSidebar + SharedPageHeader + BreakingNewsTicker + SharedPageFooter
 */
import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import SEOHead from "@/components/SEOHead";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import LeftSidebar from "@/components/LeftSidebar";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import ContactForm from "@/components/ContactForm";

// ─── Design tokens ────────────────────────────────────────────────────────────
const INK = "#0a0a0a";
const PAPER = "#ffffff";
const RED = "#dc2626";
const LINKEDIN_BLUE = "#0077b5";
const PROFILE_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/andrea-cinelli-profile_2084610f.jpeg";
const LINKEDIN_URL = "https://www.linkedin.com/in/andreacinelli/";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Label({ children, color = RED }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="text-[10px] font-bold tracking-[0.18em] uppercase"
      style={{ color }}
    >
      {children}
    </span>
  );
}

function SectionDivider() {
  return <div className="border-t my-8" style={{ borderColor: INK + "20" }} />;
}

function formatDateIT(dateLabel: string): string {
  try {
    const parts = dateLabel.split("-").map(Number);
    let year: number, month: number, day: number;
    if (parts[0] > 31) {
      [year, month, day] = parts;
    } else {
      [day, month, year] = parts;
    }
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return dateLabel;
  }
}

// ─── Componente ArticleCard ───────────────────────────────────────────────────
function ArticleCard({ article }: {
  article: {
    id: number;
    dateLabel: string;
    title: string;
    excerpt: string | null;
    articleUrl: string;
    publication: string;
    imageUrl: string | null;
    tags: string | null;
  }
}) {
  const tags = article.tags ? article.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
  return (
    <article
      className="border-t py-6 grid grid-cols-1 md:grid-cols-4 gap-4 group"
      style={{ borderColor: INK + "15" }}
    >
      {article.imageUrl && (
        <div className="md:col-span-1 h-32 overflow-hidden">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
            loading="lazy"
          />
        </div>
      )}
      <div className={article.imageUrl ? "md:col-span-3" : "md:col-span-4"}>
        <div className="flex items-center gap-3 mb-2">
          <Label color={RED}>{article.publication}</Label>
          <span className="text-[10px] tracking-wider" style={{ color: INK + "60" }}>
            {formatDateIT(article.dateLabel)}
          </span>
        </div>
        <a
          href={article.articleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:opacity-70 transition-opacity"
        >
          <h3
            className="text-base font-bold leading-snug mb-2"
            style={{ color: INK, fontFamily: "'SF Pro Display', 'Inter', sans-serif" }}
          >
            {article.title}
          </h3>
        </a>
        {article.excerpt && (
          <p className="text-sm leading-relaxed mb-3" style={{ color: INK + "80" }}>
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center gap-3 flex-wrap">
          {tags.map(tag => (
            <span
              key={tag}
              className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 border"
              style={{ borderColor: INK + "20", color: INK + "60" }}
            >
              {tag}
            </span>
          ))}
          <a
            href={article.articleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold tracking-wider uppercase ml-auto"
            style={{ color: RED }}
          >
            Leggi →
          </a>
        </div>
      </div>
    </article>
  );
}

// ─── Componente LinkedInPostCard ──────────────────────────────────────────────
function LinkedInPostCard({ post }: {
  post: {
    id: number;
    dateLabel: string;
    title: string | null;
    postText: string;
    section: string;
    imageUrl: string | null;
    linkedinUrl: string | null;
  }
}) {
  const [expanded, setExpanded] = useState(false);
  const paragraphs = post.postText
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(p => p.length > 0 && !p.startsWith("#"));
  const preview = paragraphs.slice(0, 2);
  const rest = paragraphs.slice(2);

  return (
    <article
      className="border-t py-6 grid grid-cols-1 md:grid-cols-4 gap-4"
      style={{ borderColor: INK + "15" }}
    >
      {post.imageUrl && (
        <div className="md:col-span-1 h-32 overflow-hidden">
          <img
            src={post.imageUrl}
            alt={post.title ?? "Post LinkedIn"}
            className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-500"
            loading="lazy"
          />
        </div>
      )}
      <div className={post.imageUrl ? "md:col-span-3" : "md:col-span-4"}>
        <div className="flex items-center gap-3 mb-2">
          <Label color={LINKEDIN_BLUE}>LinkedIn</Label>
          <span className="text-[10px] tracking-wider" style={{ color: INK + "60" }}>
            {formatDateIT(post.dateLabel)}
          </span>
          <span
            className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 border"
            style={{ borderColor: INK + "20", color: INK + "60" }}
          >
            {post.section.toUpperCase()}
          </span>
        </div>
        {post.title && (
          <h3
            className="text-base font-bold leading-snug mb-2"
            style={{ color: INK, fontFamily: "'SF Pro Display', 'Inter', sans-serif" }}
          >
            {post.title}
          </h3>
        )}
        <div className="text-sm leading-relaxed space-y-2" style={{ color: INK + "80" }}>
          {preview.map((p, i) => <p key={i}>{p}</p>)}
          {rest.length > 0 && expanded && rest.map((p, i) => <p key={i}>{p}</p>)}
        </div>
        <div className="flex items-center gap-4 mt-3">
          {rest.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[11px] font-bold tracking-wider uppercase"
              style={{ color: INK + "60" }}
            >
              {expanded ? "Mostra meno ↑" : `Continua a leggere ↓`}
            </button>
          )}
          {post.linkedinUrl && (
            <a
              href={post.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold tracking-wider uppercase ml-auto"
              style={{ color: LINKEDIN_BLUE }}
            >
              Vedi su LinkedIn →
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

// ─── Componente ContactAndreaForm ─────────────────────────────────────────────
function ContactAndreaForm() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [azienda, setAzienda] = useState("");
  const [ruolo, setRuolo] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const mutation = trpc.osservatorio.contactAndrea.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    mutation.mutate({ nome, email, azienda: azienda || undefined, ruolo: ruolo || undefined, messaggio });
  };

  const inputClass = "w-full border-b bg-transparent py-2 text-sm outline-none transition-colors focus:border-black placeholder:text-gray-400";
  const inputStyle = { borderColor: INK + "30", color: INK };

  if (submitted) {
    return (
      <div className="py-8 text-center">
        <div className="text-4xl mb-4">✓</div>
        <p className="font-bold text-lg mb-1" style={{ color: INK }}>Messaggio inviato.</p>
        <p className="text-sm" style={{ color: INK + "70" }}>
          Andrea risponde personalmente. Ti ricontatterà entro 48 ore lavorative.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-[10px] font-bold tracking-[0.15em] uppercase mb-1" style={{ color: INK + "60" }}>
            Nome *
          </label>
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            required
            placeholder="Il tuo nome"
            className={inputClass}
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold tracking-[0.15em] uppercase mb-1" style={{ color: INK + "60" }}>
            Email *
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="La tua email"
            className={inputClass}
            style={inputStyle}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-[10px] font-bold tracking-[0.15em] uppercase mb-1" style={{ color: INK + "60" }}>
            Azienda
          </label>
          <input
            type="text"
            value={azienda}
            onChange={e => setAzienda(e.target.value)}
            placeholder="La tua azienda"
            className={inputClass}
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold tracking-[0.15em] uppercase mb-1" style={{ color: INK + "60" }}>
            Ruolo
          </label>
          <input
            type="text"
            value={ruolo}
            onChange={e => setRuolo(e.target.value)}
            placeholder="Il tuo ruolo"
            className={inputClass}
            style={inputStyle}
          />
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-bold tracking-[0.15em] uppercase mb-1" style={{ color: INK + "60" }}>
          Messaggio *
        </label>
        <textarea
          value={messaggio}
          onChange={e => setMessaggio(e.target.value)}
          required
          rows={4}
          placeholder="Scrivi ad Andrea..."
          className={inputClass + " resize-none"}
          style={inputStyle}
        />
      </div>
      {error && (
        <p className="text-sm" style={{ color: RED }}>{error}</p>
      )}
      <button
        type="submit"
        disabled={mutation.isPending}
        className="px-8 py-3 text-[11px] font-bold tracking-[0.2em] uppercase transition-all"
        style={{
          backgroundColor: mutation.isPending ? INK + "60" : INK,
          color: PAPER,
          cursor: mutation.isPending ? "not-allowed" : "pointer",
        }}
      >
        {mutation.isPending ? "Invio in corso..." : "Invia messaggio →"}
      </button>
      <p className="text-[11px]" style={{ color: INK + "50" }}>
        Il messaggio arriverà direttamente ad Andrea Cinelli — ac@acinelli.com
      </p>
    </form>
  );
}

// ─── Pagina principale ────────────────────────────────────────────────────────
export default function OsservatorioTech() {
  const { data: articles = [], isLoading: loadingArticles } = trpc.osservatorio.getArticles.useQuery({ limit: 20 });
  const { data: linkedinPosts = [], isLoading: loadingPosts } = trpc.osservatorio.getLinkedinPosts.useQuery({ limit: 12 });

  return (
    <div className="min-h-screen" style={{ backgroundColor: PAPER, color: INK }}>
      <SEOHead
        title="Osservatorio Tech — Andrea Cinelli | ProofPress"
        description="Analisi, articoli e post LinkedIn di Andrea Cinelli: imprenditore seriale, AI pioneer, Tech Editor ProofPress. Aggiornato ogni giorno."
      />
      <SharedPageHeader />
      <BreakingNewsTicker />

      <div className="flex min-h-screen">
        {/* LeftSidebar */}
        <LeftSidebar />

        {/* Main content */}
        <main className="flex-1 min-w-0 px-6 md:px-10 py-8 max-w-4xl">

          {/* ── INTRO OSSERVATORIO ───────────────────────────────────────── */}
          <section className="mb-10 pb-8" style={{ borderBottom: `2px solid ${RED}` }}>
            <Label>Osservatorio Tech</Label>
            <h1
              className="text-3xl md:text-4xl font-black leading-tight tracking-tight mt-2 mb-4"
              style={{ color: INK, fontFamily: "'SF Pro Display', 'Inter', sans-serif" }}
            >
              Il punto di vista di chi il digitale<br />
              <span style={{ color: RED }}>lo ha costruito.</span>
            </h1>
            <p className="text-base leading-relaxed max-w-2xl" style={{ color: INK + "80" }}>
              L'Osservatorio Tech è un'area editoriale curata da <strong style={{ color: INK }}>Andrea Cinelli</strong> — imprenditore seriale, AI pioneer e pioniere del digitale italiano. Ogni giorno, analisi e approfondimenti sui temi che contano: innovazione, intelligenza artificiale, startup, venture capital e trasformazione digitale. Un punto di vista qualificato, costruito su 30 anni di execution diretta, non su teoria.
            </p>
          </section>

          {/* ── HERO SECTION ─────────────────────────────────────────────── */}
          <section className="mb-10">
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              {/* Foto + profilo */}
              <div className="md:col-span-1">
                <div className="relative mb-4">
                  <img
                    src={PROFILE_IMG}
                    alt="Andrea Cinelli"
                    className="w-full max-w-[200px] aspect-square object-cover grayscale-[10%]"
                    style={{ filter: "contrast(1.05)" }}
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 max-w-[200px] py-2 px-3"
                    style={{ backgroundColor: INK }}
                  >
                    <p className="text-[10px] font-bold tracking-wider uppercase" style={{ color: PAPER }}>
                      Tech Editor
                    </p>
                    <p className="text-[10px] tracking-wider" style={{ color: PAPER + "cc" }}>
                      ProofPress Magazine
                    </p>
                  </div>
                </div>
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase py-2 px-3 transition-opacity hover:opacity-70"
                  style={{ backgroundColor: LINKEDIN_BLUE, color: PAPER }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  Segui su LinkedIn
                </a>
              </div>

              {/* Bio */}
              <div className="md:col-span-2">
                <h1
                  className="text-3xl md:text-4xl font-black leading-none tracking-tight mb-4"
                  style={{ color: INK, fontFamily: "'SF Pro Display', 'Inter', sans-serif" }}
                >
                  Andrea Cinelli
                </h1>
                <p
                  className="text-xs font-bold tracking-widest uppercase mb-3"
                  style={{ color: RED }}
                >
                  CEO FoolFarm · Tech Editor ProofPress · AI Pioneer
                </p>
                <p className="text-sm leading-relaxed" style={{ color: INK + "80" }}>
                  Co-fondatore di Libero.it (10M+ utenti). 30+ anni di execution nel digitale. Fondatore di 12+ venture AI, 25+ brevetti, 2 exit. Professore di AI al Sole 24 Ore Business School. Keynote speaker internazionale.
                </p>
              </div>
            </div>
          </section>

          <SectionDivider />

          {/* ── ARTICOLI PUBBLICATI ───────────────────────────────────────── */}
          <section className="mb-10" id="articoli">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Label>Archivio</Label>
                <h2
                  className="text-2xl font-black mt-1 leading-none"
                  style={{ color: INK, fontFamily: "'SF Pro Display', 'Inter', sans-serif" }}
                >
                  Articoli Pubblicati
                </h2>
              </div>
              <Link
                href="/"
                className="text-[11px] font-bold tracking-wider uppercase"
                style={{ color: RED }}
              >
                Tutti gli articoli →
              </Link>
            </div>

            {loadingArticles ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="border-t py-6 animate-pulse" style={{ borderColor: INK + "15" }}>
                    <div className="h-3 w-24 mb-2 rounded" style={{ backgroundColor: INK + "15" }} />
                    <div className="h-5 w-3/4 mb-2 rounded" style={{ backgroundColor: INK + "10" }} />
                    <div className="h-3 w-full rounded" style={{ backgroundColor: INK + "08" }} />
                  </div>
                ))}
              </div>
            ) : articles.length === 0 ? (
              <div className="border-t py-12 text-center" style={{ borderColor: INK + "15" }}>
                <p className="text-sm" style={{ color: INK + "50" }}>
                  Gli articoli verranno pubblicati qui non appena disponibili.
                </p>
                <p className="text-[11px] mt-2" style={{ color: INK + "40" }}>
                  Nel frattempo, segui Andrea su{" "}
                  <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" style={{ color: LINKEDIN_BLUE }}>
                    LinkedIn
                  </a>
                </p>
              </div>
            ) : (
              <div>
                {articles.map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </section>

          <SectionDivider />

          {/* ── POST LINKEDIN ─────────────────────────────────────────────── */}
          <section className="mb-10" id="linkedin">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Label color={LINKEDIN_BLUE}>LinkedIn</Label>
                <h2
                  className="text-2xl font-black mt-1 leading-none"
                  style={{ color: INK, fontFamily: "'SF Pro Display', 'Inter', sans-serif" }}
                >
                  Post LinkedIn
                </h2>
              </div>
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold tracking-wider uppercase"
                style={{ color: LINKEDIN_BLUE }}
              >
                Segui su LinkedIn →
              </a>
            </div>

            {loadingPosts ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="border-t py-6 animate-pulse" style={{ borderColor: INK + "15" }}>
                    <div className="h-3 w-20 mb-2 rounded" style={{ backgroundColor: LINKEDIN_BLUE + "30" }} />
                    <div className="h-4 w-2/3 mb-2 rounded" style={{ backgroundColor: INK + "10" }} />
                    <div className="h-3 w-full rounded" style={{ backgroundColor: INK + "08" }} />
                  </div>
                ))}
              </div>
            ) : linkedinPosts.length === 0 ? (
              <div className="border-t py-12 text-center" style={{ borderColor: INK + "15" }}>
                <p className="text-sm" style={{ color: INK + "50" }}>
                  I post LinkedIn verranno sincronizzati automaticamente ogni giorno.
                </p>
              </div>
            ) : (
              <div>
                {linkedinPosts.map(post => (
                  <LinkedInPostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </section>

          <SectionDivider />

          {/* ── TEMI TRATTATI ─────────────────────────────────────────────── */}
          <section className="mb-10">
            <Label>Focus tematici</Label>
            <h2
              className="text-2xl font-black mt-1 mb-6 leading-none"
              style={{ color: INK, fontFamily: "'SF Pro Display', 'Inter', sans-serif" }}
            >
              Di cosa scrive Andrea
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  tag: "AI & Generative AI",
                  desc: "Impatto dell'intelligenza artificiale su prodotti, mercati e modelli di business. Dalle fondamenta tecnologiche alle implicazioni strategiche per il C-level.",
                },
                {
                  tag: "Startup & Venture",
                  desc: "Ecosistema startup italiano ed europeo, deal flow, metriche di crescita e strategie di fundraising. Con il punto di vista di chi ha fondato e ceduto più volte.",
                },
                {
                  tag: "Digital Transformation",
                  desc: "Come le organizzazioni si reinventano nell'era digitale. Casi reali, errori comuni e leve operative per accelerare la trasformazione.",
                },
                {
                  tag: "Giornalismo & Media",
                  desc: "Il futuro dell'informazione nell'era agentica. Modelli editoriali sostenibili, qualità dei contenuti e il ruolo della verifica certificata.",
                },
                {
                  tag: "Leadership & Strategy",
                  desc: "Decisioni ad alto impatto, gestione dell'incertezza e costruzione di team in contesti di discontinuità. Per chi guida, non per chi osserva.",
                },
                {
                  tag: "Innovation & IP",
                  desc: "Brevetti, proprietà intellettuale e vantaggio competitivo nell'economia della conoscenza. 25+ brevetti depositati, inclusa IP fondamentale per SPID.",
                },
              ].map(({ tag, desc }) => (
                <div
                  key={tag}
                  className="border p-4"
                  style={{ borderColor: INK + "15" }}
                >
                  <p
                    className="text-[10px] font-bold tracking-[0.15em] uppercase mb-2"
                    style={{ color: RED }}
                  >
                    {tag}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: INK + "75" }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <SectionDivider />

          {/* ── CONTATTA ANDREA ───────────────────────────────────────────── */}
          <section className="mb-10" id="contatta">
            <Label>Contatti</Label>
            <h2
              className="text-2xl font-black mt-1 mb-2 leading-none"
              style={{ color: INK, fontFamily: "'SF Pro Display', 'Inter', sans-serif" }}
            >
              Vuoi contattare Andrea?
            </h2>
            <p className="text-sm mb-6" style={{ color: INK + "70" }}>
              Per collaborazioni editoriali, keynote, advisory, investimenti o semplicemente per scambiare idee. Andrea risponde personalmente.
            </p>
            <ContactAndreaForm />
          </section>

        </main>
      </div>

      <SharedPageFooter />
    </div>
  );
}
