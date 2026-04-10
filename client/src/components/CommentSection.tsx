import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { MessageCircle, Send, ChevronDown, ChevronUp, User } from "lucide-react";
import { toast } from "sonner";

type Section = "ai" | "startup";
type ArticleType = "news" | "editorial" | "startup" | "reportage" | "analysis";

interface CommentSectionProps {
  section: Section;
  articleType: ArticleType;
  articleId: number;
}

export default function CommentSection({ section, articleType, articleId }: CommentSectionProps) {
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");

  const { data: comments = [], refetch } = trpc.comments.getByArticle.useQuery(
    { section, articleType, articleId },
    { enabled: open && !!articleId }
  );

  const addComment = trpc.comments.add.useMutation({
    onSuccess: () => {
      toast.success("Commento pubblicato!");
      setName("");
      setEmail("");
      setContent("");
      setShowForm(false);
      refetch();
    },
    onError: (err) => {
      toast.error("Errore: " + err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    addComment.mutate({
      section,
      articleType,
      articleId,
      authorName: name.trim(),
      authorEmail: email.trim() || undefined,
      content: content.trim(),
    });
  };

  return (
    <div className="mt-3 border-t border-[#1a1a1a]/8 pt-3">
      {/* Toggle commenti */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-[#1a1a1a]/50 hover:text-[#ff5500] transition-colors group"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        <span className="font-medium">
          {open ? "Chiudi commenti" : "Commenta"}
        </span>
        {open ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {/* Lista commenti */}
          {comments.length > 0 && (
            <div className="space-y-2">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="flex gap-2.5 p-3 rounded-lg bg-[#f7f5f0] border border-[#1a1a1a]/6"
                >
                  <div className="w-7 h-7 rounded-full bg-[#ff5500]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-[#ff5500]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-xs font-700 text-[#1a1a1a] font-bold">{c.authorName}</span>
                      <span className="text-[10px] text-[#1a1a1a]/40">
                        {new Date(c.createdAt).toLocaleDateString("it-IT", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-[#1a1a1a]/70 leading-relaxed">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {comments.length === 0 && !showForm && (
            <p className="text-xs text-[#1a1a1a]/35 text-center py-1">
              Nessun commento ancora. Sii il primo.
            </p>
          )}

          {/* Pulsante apri form */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="text-xs font-semibold text-[#ff5500] hover:underline"
            >
              + Lascia un commento
            </button>
          )}

          {/* Form commento */}
          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="p-3 rounded-lg border border-[#1a1a1a]/10 bg-white space-y-2"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Il tuo nome *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="flex-1 text-xs border border-[#1a1a1a]/15 rounded-md px-2.5 py-1.5 bg-[#fafafa] text-[#1a1a1a] placeholder-[#1a1a1a]/35 focus:outline-none focus:border-[#ff5500]/50"
                />
                <input
                  type="email"
                  placeholder="Email (opzionale)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 text-xs border border-[#1a1a1a]/15 rounded-md px-2.5 py-1.5 bg-[#fafafa] text-[#1a1a1a] placeholder-[#1a1a1a]/35 focus:outline-none focus:border-[#ff5500]/50"
                />
              </div>
              <textarea
                placeholder="Scrivi il tuo commento..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={3}
                className="w-full text-xs border border-[#1a1a1a]/15 rounded-md px-2.5 py-1.5 bg-[#fafafa] text-[#1a1a1a] placeholder-[#1a1a1a]/35 focus:outline-none focus:border-[#ff5500]/50 resize-none"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-xs px-3 py-1.5 rounded-md border border-[#1a1a1a]/15 text-[#1a1a1a]/60 hover:bg-[#f0f0f0] transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={addComment.isPending}
                  className="text-xs px-4 py-1.5 rounded-md bg-[#ff5500] hover:bg-[#e04d00] text-white font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3 h-3" />
                  {addComment.isPending ? "Invio..." : "Pubblica"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
