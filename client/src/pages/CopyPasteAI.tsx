/**
 * COPY & PASTE AI — 10 prompt al giorno, divisi per business, studio, marketing
 */
import ChannelPage from "@/components/ChannelPage";
import { Copy } from "lucide-react";

export default function CopyPasteAI() {
  return (
    <ChannelPage
      slug="copy-paste-ai"
      title="Copy & Paste AI"
      subtitle="10 prompt al giorno. Copia, incolla, ottieni risultati."
      description="Prompt professionali pronti all'uso per business, studio e marketing. Copia e incolla in ChatGPT, Claude o Gemini per risultati immediati."
      icon={<Copy className="w-6 h-6" />}
      categories={["business", "studio", "marketing", "produttività", "creatività"]}
      showPrompt={true}
      ctaTitle="Vuoi tutti i 99 prompt premium?"
      ctaDescription="La Collezione dei Migliori Prompt 2026: framework multi-paragrafo con ruolo, contesto, istruzioni e formato di output."
      ctaLink="https://ideasmart.forum"
      ctaLabel="Scopri la collezione — €39"
    />
  );
}
