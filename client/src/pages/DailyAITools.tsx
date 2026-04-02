/**
 * AI TOOLS — 1-3 tool al giorno con spiegazioni
 */
import ChannelPage from "@/components/ChannelPage";
import { Wrench } from "lucide-react";

export default function DailyAITools() {
  return (
    <ChannelPage
      slug="daily-ai-tools"
      title="AI Tools"
      subtitle="1-3 tool al giorno. Spiegati, testati, confrontati."
      description="Ogni giorno selezioniamo i migliori strumenti AI: cosa fanno, quando usarli, alternative gratuite e a pagamento. Solo tool che abbiamo testato."
      icon={<Wrench className="w-6 h-6" />}
      categories={["produttività", "scrittura", "immagini", "video", "coding", "analytics", "automazione"]}
    />
  );
}
