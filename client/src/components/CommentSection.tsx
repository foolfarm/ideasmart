import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { MessageCircle, Send, User } from "lucide-react";
import { toast } from "sonner";

type Section = "ai" | "music";
type ArticleType = "news" | "editorial" | "startup" | "reportage" | "analysis";

interface CommentSectionProps {
  section: Section;
  articleType: ArticleType;
  articleId: number;
  accentColor?: string; // es. "cyan" per AI, "purple" per Music
}

export default function CommentSection({
  section,
  articleType,
  articleId,
  accentColor = "cyan",
}: CommentSectionProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: comments = [], refetch } = trpc.comments.getByArticle.useQuery(
    { section, articleType, articleId },
    { enabled: !!articleId }
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

  const accent =
    accentColor === "purple"
      ? { border: "border-purple-500/30", text: "text-purple-400", bg: "bg-purple-500/10", btn: "bg-purple-600 hover:bg-purple-500" }
      : { border: "border-cyan-500/30", text: "text-cyan-400", bg: "bg-cyan-500/10", btn: "bg-cyan-600 hover:bg-cyan-500" };

  return (
    <div className={`mt-6 pt-6 border-t ${accent.border}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageCircle className={`w-4 h-4 ${accent.text}`} />
          <span className={`text-sm font-semibold ${accent.text}`}>
            {comments.length} {comments.length === 1 ? "commento" : "commenti"}
          </span>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className={`text-xs px-3 py-1.5 rounded-lg ${accent.btn} text-white font-medium transition-colors`}
          >
            Lascia un commento
          </button>
        )}
      </div>

      {/* Form commento */}
      {showForm && (
        <form onSubmit={handleSubmit} className={`mb-5 p-4 rounded-xl border ${accent.border} ${accent.bg}`}>
          <div className="flex gap-3 mb-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Il tuo nome *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/30"
              />
            </div>
            <div className="flex-1">
              <input
                type="email"
                placeholder="Email (opzionale)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/30"
              />
            </div>
          </div>
          <textarea
            placeholder="Scrivi il tuo commento..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/30 resize-none mb-3"
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={addComment.isPending}
              className={`text-xs px-4 py-1.5 rounded-lg ${accent.btn} text-white font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50`}
            >
              <Send className="w-3 h-3" />
              {addComment.isPending ? "Invio..." : "Pubblica"}
            </button>
          </div>
        </form>
      )}

      {/* Lista commenti */}
      {comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className={`p-3 rounded-xl border ${accent.border} bg-white/3`}>
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-6 h-6 rounded-full ${accent.bg} flex items-center justify-center`}>
                  <User className={`w-3 h-3 ${accent.text}`} />
                </div>
                <span className="text-sm font-semibold text-white/90">{c.authorName}</span>
                <span className="text-xs text-white/40 ml-auto">
                  {new Date(c.createdAt).toLocaleDateString("it-IT", { day: "numeric", month: "short" })}
                </span>
              </div>
              <p className="text-sm text-white/70 leading-relaxed pl-8">{c.content}</p>
            </div>
          ))}
        </div>
      )}

      {comments.length === 0 && !showForm && (
        <p className="text-xs text-white/30 text-center py-2">
          Sii il primo a commentare questo articolo.
        </p>
      )}
    </div>
  );
}
