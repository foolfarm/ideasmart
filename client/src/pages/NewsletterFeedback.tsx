/**
 * NewsletterFeedback.tsx — Feedback Newsletter
 * Pagina pubblica per raccogliere feedback sulla newsletter
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import SharedPageHeader from "@/components/SharedPageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, ThumbsUp, Smile, Meh, ThumbsDown } from "lucide-react";
import { useSearch } from "wouter";

const RATINGS = [
  { value: "great" as const, label: "Ottima!", icon: ThumbsUp, color: "#00a896" },
  { value: "good" as const, label: "Buona", icon: Smile, color: "#3b82f6" },
  { value: "meh" as const, label: "Così così", icon: Meh, color: "#f59e0b" },
  { value: "bad" as const, label: "Da migliorare", icon: ThumbsDown, color: "#ef4444" },
];

export default function NewsletterFeedback() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const dateParam = params.get("date") || undefined;

  const [submitted, setSubmitted] = useState(false);
  const [selectedRating, setSelectedRating] = useState<"great" | "good" | "meh" | "bad" | null>(null);
  const [comment, setComment] = useState("");

  const submitMutation = trpc.newsletterFeedback.submit.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  const handleSubmit = () => {
    if (!selectedRating) return;
    submitMutation.mutate({
      rating: selectedRating,
      comment: comment || undefined,
      newsletterDate: dateParam,
    });
  };

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <SharedPageHeader />

      <div className="max-w-lg mx-auto px-4 py-16 pt-28">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#0a0f1e] mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Come ti è sembrata la newsletter?
          </h1>
          <p className="text-[#4b5563]">
            Il tuo feedback ci aiuta a migliorare ogni edizione.
          </p>
        </div>

        {submitted ? (
          <div className="bg-white rounded-2xl border border-[#e5e7eb] p-10 text-center">
            <div className="w-16 h-16 bg-[#00e5c8]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-[#00a896]" />
            </div>
            <h2 className="text-2xl font-bold text-[#0a0f1e] mb-3">Grazie per il feedback!</h2>
            <p className="text-[#4b5563]">
              Lo leggeremo con attenzione per migliorare le prossime edizioni.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#e5e7eb] p-8 space-y-6">
            {/* Rating buttons */}
            <div className="grid grid-cols-2 gap-3">
              {RATINGS.map((r) => {
                const Icon = r.icon;
                const isSelected = selectedRating === r.value;
                return (
                  <button
                    key={r.value}
                    onClick={() => setSelectedRating(r.value)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-current bg-current/5"
                        : "border-[#e5e7eb] hover:border-[#d1d5db]"
                    }`}
                    style={isSelected ? { borderColor: r.color, color: r.color } : {}}
                  >
                    <Icon className="w-5 h-5" style={{ color: r.color }} />
                    <span className="font-semibold text-sm" style={isSelected ? { color: r.color } : { color: "#374151" }}>
                      {r.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Optional comment */}
            <div>
              <label className="block text-sm font-semibold text-[#0a0f1e] mb-2">
                Vuoi aggiungere un commento? (opzionale)
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Cosa ti è piaciuto? Cosa miglioreresti?"
                rows={3}
                maxLength={2000}
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!selectedRating || submitMutation.isPending}
              className="w-full h-12 bg-[#0a0f1e] hover:bg-[#1a1f3e] text-white font-semibold"
            >
              {submitMutation.isPending ? "Invio..." : "Invia feedback"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
