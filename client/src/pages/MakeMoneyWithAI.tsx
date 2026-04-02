/**
 * FARE SOLDI — Side hustle e strategie di monetizzazione
 */
import ChannelPage from "@/components/ChannelPage";
import { DollarSign } from "lucide-react";

export default function MakeMoneyWithAI() {
  return (
    <ChannelPage
      slug="make-money-with-ai"
      title="Fare Soldi"
      subtitle="Strategie concrete per monetizzare l'AI. Oggi."
      description="Side hustle, freelancing, SaaS e consulenza: opportunità reali per guadagnare con l'intelligenza artificiale, con numeri, strumenti e casi studio."
      icon={<DollarSign className="w-6 h-6" />}
      categories={["freelancing", "saas", "consulenza", "content", "automazione", "e-commerce"]}
    />
  );
}
