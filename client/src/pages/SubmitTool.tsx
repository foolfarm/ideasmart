/**
 * SubmitTool.tsx — Proponi il tuo AI Tool
 * Form pubblico per proporre il proprio tool AI per la newsletter IdeaSmart
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Rocket, Sparkles } from "lucide-react";

export default function SubmitTool() {
  const [submitted, setSubmitted] = useState(false);
  const [toolName, setToolName] = useState("");
  const [toolUrl, setToolUrl] = useState("");
  const [description, setDescription] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");
  const [submitterName, setSubmitterName] = useState("");

  const submitMutation = trpc.toolSubmissions.submit.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate({
      toolName,
      toolUrl,
      description: description || undefined,
      submitterEmail: submitterEmail || undefined,
      submitterName: submitterName || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-16 pt-28">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00e5c8]/10 text-[#00a896] text-sm font-semibold mb-6">
            <Rocket className="w-4 h-4" />
            AI TOOLS OF THE DAY
          </div>
          <h1 className="text-4xl font-bold text-[#0a0f1e] mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Proponi il tuo AI Tool
          </h1>
          <p className="text-lg text-[#4b5563] leading-relaxed max-w-lg mx-auto">
            Invia il tuo strumento AI e potrai essere presente nella prossima edizione della newsletter <strong>IDEASMART</strong>, letta da oltre 1.800 professionisti del settore.
          </p>
        </div>

        {submitted ? (
          <div className="bg-white rounded-2xl border border-[#e5e7eb] p-10 text-center">
            <div className="w-16 h-16 bg-[#00e5c8]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-[#00a896]" />
            </div>
            <h2 className="text-2xl font-bold text-[#0a0f1e] mb-3">Tool inviato con successo!</h2>
            <p className="text-[#4b5563] leading-relaxed">
              Il nostro team editoriale valuterà il tuo tool. Se approvato, apparirà nella sezione <strong>"AI Tools of the Day"</strong> della prossima newsletter.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#e5e7eb] p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#0a0f1e] mb-2">
                Nome del Tool <span className="text-red-500">*</span>
              </label>
              <Input
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
                placeholder="es. MyAITool"
                required
                className="h-12"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0a0f1e] mb-2">
                URL del Tool <span className="text-red-500">*</span>
              </label>
              <Input
                type="url"
                value={toolUrl}
                onChange={(e) => setToolUrl(e.target.value)}
                placeholder="https://myaitool.com"
                required
                className="h-12"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0a0f1e] mb-2">
                Descrizione breve
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Cosa fa il tuo tool? In 1-2 frasi..."
                rows={3}
                maxLength={1000}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#0a0f1e] mb-2">
                  Il tuo nome
                </label>
                <Input
                  value={submitterName}
                  onChange={(e) => setSubmitterName(e.target.value)}
                  placeholder="Mario Rossi"
                  className="h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0a0f1e] mb-2">
                  La tua email
                </label>
                <Input
                  type="email"
                  value={submitterEmail}
                  onChange={(e) => setSubmitterEmail(e.target.value)}
                  placeholder="mario@example.com"
                  className="h-12"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitMutation.isPending || !toolName || !toolUrl}
              className="w-full h-12 bg-[#0a0f1e] hover:bg-[#1a1f3e] text-white font-semibold text-base"
            >
              {submitMutation.isPending ? "Invio in corso..." : "Proponi il tuo Tool"}
            </Button>

            {submitMutation.isError && (
              <p className="text-red-500 text-sm text-center">
                Errore nell'invio. Riprova.
              </p>
            )}

            <div className="flex items-start gap-3 pt-2 text-sm text-[#6b7280]">
              <Sparkles className="w-4 h-4 mt-0.5 text-[#00e5c8] shrink-0" />
              <p>
                I tool vengono valutati dal team editoriale e inseriti nella newsletter del giorno successivo. La selezione è gratuita.
              </p>
            </div>
          </form>
        )}

        {/* Advertising CTA */}
        <div className="mt-8 bg-white rounded-2xl border border-[#e5e7eb] p-6 text-center">
          <p className="text-[#4b5563] text-sm mb-2">
            Vuoi una posizione in evidenza nella newsletter?
          </p>
          <a
            href="mailto:info@ideasmart.biz?subject=Pubblicità%20Newsletter%20IdeaSmart"
            className="text-[#00a896] font-semibold text-sm hover:underline"
          >
            Pubblicizza su IdeaSmart Newsletter →
          </a>
        </div>
      </div>
    </div>
  );
}
