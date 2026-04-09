/**
 * PROMPT AI — 10 prompt al giorno, divisi per business, studio, marketing
 */
import ChannelPage from "@/components/ChannelPage";
import { Copy } from "lucide-react";

export default function CopyPasteAI() {
  return (
    <ChannelPage
      slug="copy-paste-ai"
      title="Prompt AI"
      subtitle="10 prompt al giorno. Copia, incolla, ottieni risultati."
      description="Prompt professionali pronti all'uso per business, studio e marketing. Copia e incolla in ChatGPT, Claude o Gemini per risultati immediati."
      icon={<Copy className="w-6 h-6" />}
      categories={["business", "studio", "marketing", "produttività", "creatività"]}
      showPrompt={true}
      ctaTitle="L'AI che usi ogni giorno potrebbe fare 10 volte di più."
      ctaDescription="99 prompt selezionati da professionisti reali — per manager, founder, marketer e consulenti. Libreria ricercabile + PDF incluso. Pagamento unico €39, accesso permanente."
      ctaLink="https://ideasmart.forum"
      ctaLabel="🔓 Accedi subito per €39 →"
    />
  );
}
