/**
 * PuntoDelGiorno — Sezione editoriale Home
 * Mostra il post del mattino di Andrea Cinelli come colonna editoriale di qualità
 * Stile: prima pagina di giornale — sfondo carta, bordo verde, font leggibili
 */
import { trpc } from "@/lib/trpc";

const INK = "#1a1a1a";
const ACCENT = "#1a1a1a";
const PAPER = "#faf8f3";

function formatDateIT(dateLabel: string): string {
  try {
    const [year, month, day] = dateLabel.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("it-IT", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  } catch {
    return dateLabel;
  }
}

type PostItem = {
  id: number;
  dateLabel: string;
  slot: string;
  postText: string;
  linkedinUrl: string | null;
  title: string | null;
  section: string;
  imageUrl: string | null;
  hashtags: string | null;
  createdAt: Date;
};

export default function PuntoDelGiorno() {
  const { data: posts, isLoading } = trpc.news.getPuntoDelGiornoAll.useQuery(undefined, {
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false
  });

  if (!isLoading && (!posts || posts.length === 0)) return null;

  const post = posts?.find(p => p.slot === "morning") ?? posts?.[0];
  const dateLabel = post?.dateLabel ?? "";

  // Parsing paragrafi
  const paragraphs = post?.postText
    ? post.postText.split(/\n{2}/).map(p => p.trim()).filter(p => p.length > 0)
    : [];
  const hashtagLine = paragraphs.findIndex(p => p.startsWith("#") || p.match(/^[📊🔗]/));
  const bodyParagraphs = hashtagLine > 0 ? paragraphs.slice(0, hashtagLine) : paragraphs;

  const sectionLabel = post?.section === "ai" ? "AI NEWS"
    : post?.section === "startup" ? "STARTUP NEWS"
    : post?.section ?? "";

  const sectionColor = post?.section === "ai" ? "#1a1a1a"
    : post?.section === "startup" ? "#2a2a2a"
    : ACCENT;

  return (
    <section>
      {/* ── Header sezione ── */}
      <div className="border-t-[3px]" style={{ borderColor: ACCENT }} />
      <div className="py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-[3px] w-6" style={{ background: ACCENT }} />
          <span
            className="text-[11px] font-bold uppercase tracking-[0.25em]"
            style={{ color: ACCENT, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
          >
            Punto del Giorno
          </span>
        </div>
        {dateLabel && (
          <span
            className="text-[10px] uppercase tracking-widest"
            style={{ color: INK + "55", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
          >
            {formatDateIT(dateLabel)}
          </span>
        )}
      </div>

      {/* ── Corpo editoriale ── */}
      {isLoading && !post ? (
        <div className="animate-pulse border-l-4 pl-6 py-6" style={{ borderColor: ACCENT, background: PAPER }}>
          <div className="h-5 rounded w-2/3 mb-3" style={{ background: INK + "15" }} />
          <div className="space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-3 rounded" style={{ background: INK + "10", width: i === 4 ? "55%" : "100%" }} />
            ))}
          </div>
        </div>
      ) : post ? (
        <div
          className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-0 border-l-4"
          style={{ borderColor: ACCENT, background: PAPER }}
        >
          {/* Colonna sinistra: immagine + firma */}
          <div className="flex flex-col">
            {post.imageUrl && (
              <div className="overflow-hidden" style={{ height: "220px" }}>
                <img
                  src={post.imageUrl}
                  alt={post.title ?? "Punto del Giorno"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
            {/* Firma autore */}
            <div className="p-5 border-t" style={{ borderColor: INK + "12" }}>
              <div className="flex items-center gap-3 mb-3">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/andrea-cinelli-profile_2084610f.jpeg"
                  alt="Andrea Cinelli"
                  className="w-12 h-12 rounded-full object-cover object-top border-2 flex-shrink-0"
                  style={{ borderColor: ACCENT }}
                />
                <div>
                  <p
                    className="font-bold leading-tight"
                    style={{ color: INK, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif", fontSize: "15px" }}
                  >
                    Andrea Cinelli
                  </p>
                  <p
                    className="text-[11px] mt-0.5 leading-snug"
                    style={{ color: INK + "60", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                  >
                    Tech Expert
                  </p>
                  <a
                    href="https://www.linkedin.com/in/andreacinelli"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold uppercase tracking-widest hover:underline mt-1 inline-block"
                    style={{ color: "#0077b5", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                  >
                    Seguimi su LinkedIn →
                  </a>
                </div>
              </div>
              {/* Badge slot + sezione */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border"
                  style={{ color: "#00b89a", borderColor: "#00b89a40", background: "#00b89a08", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                >
                  10:30
                </span>
                {sectionLabel && (
                  <span
                    className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: sectionColor, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                  >
                    {sectionLabel}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Colonna destra: testo editoriale */}
          <div className="p-6 md:p-8 border-l" style={{ borderColor: INK + "10" }}>
            {/* Titolo */}
            {post.title && (
              <h2
                className="font-bold leading-tight mb-5"
                style={{
                  color: INK,
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
                  fontSize: "clamp(22px, 2.5vw, 28px)",
                  lineHeight: 1.2
                }}
              >
                {post.title}
              </h2>
            )}

            {/* Corpo — tutti i paragrafi */}
            <div className="space-y-4">
              {bodyParagraphs.map((para, i) => (
                <p
                  key={i}
                  style={{
                    color: INK + "cc",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif",
                    fontSize: "16px",
                    lineHeight: 1.75
                  }}
                >
                  {para}
                </p>
              ))}
            </div>

            {/* Footer: link LinkedIn */}
            {post.linkedinUrl && (
              <div className="mt-6 pt-4 border-t flex items-center justify-between" style={{ borderColor: INK + "12" }}>
                <p
                  className="text-[11px]"
                  style={{ color: INK + "40", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                >
                  Pubblicato su LinkedIn · {new Date(post.createdAt).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                </p>
                <a
                  href={post.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold uppercase tracking-widest hover:underline"
                  style={{ color: "#0077b5", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                >
                  Leggi su LinkedIn →
                </a>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
