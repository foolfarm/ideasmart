/**
 * AUTOMATE WITH AI — Casi d'uso reali e workflow
 */
import ChannelPage from "@/components/ChannelPage";
import { Zap } from "lucide-react";

export default function AutomateWithAI() {
  return (
    <ChannelPage
      slug="automate-with-ai"
      title="Automate with AI"
      subtitle="Workflow reali. Step-by-step. Pronti da replicare."
      description="Automazioni AI testate e documentate: da email a report, da meeting a task, da social a analytics. Ogni workflow include strumenti, passaggi e tempo stimato."
      icon={<Zap className="w-6 h-6" />}
      categories={["email", "social", "documenti", "meeting", "analytics", "vendite"]}
    />
  );
}
