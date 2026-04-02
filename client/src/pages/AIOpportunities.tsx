/**
 * AI INVEST — Trend startup per investitori e founder
 */
import ChannelPage from "@/components/ChannelPage";
import { TrendingUp } from "lucide-react";

export default function AIOpportunities() {
  return (
    <ChannelPage
      slug="ai-opportunities"
      title="AI Invest"
      subtitle="Dove investire. Cosa costruire. Come entrare."
      description="Trend emergenti, startup da seguire, mercati in crescita e opportunità di investimento nel mondo AI. Per founder, investitori e professionisti."
      icon={<TrendingUp className="w-6 h-6" />}
      categories={["investimenti", "startup", "mercati", "trend", "funding"]}
    />
  );
}
