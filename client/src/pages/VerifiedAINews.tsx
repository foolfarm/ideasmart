/**
 * VERIFIED AI NEWS — Notizie filtrate da AI News, Startup News, Dealroom, Ricerche
 */
import ChannelPage from "@/components/ChannelPage";
import { Newspaper } from "lucide-react";

export default function VerifiedAINews() {
  return (
    <ChannelPage
      slug="verified-ai-news"
      title="Verified AI News"
      subtitle="Solo notizie verificate. Zero rumore."
      description="Le notizie AI che contano davvero, filtrate da 40+ fonti e verificate dalla nostra redazione AI. Include: AI News, Startup News, Dealroom e Ricerche."
      icon={<Newspaper className="w-6 h-6" />}
      categories={["ai-news", "startup", "dealroom", "ricerche", "open-source"]}
    />
  );
}
