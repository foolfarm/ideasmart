/**
 * SharedPageFooter — Footer con BannerRotator + testo AxiomX
 * Struttura: BannerRotator 720×190 → divisore → testo AxiomX · Privacy · Trust Score
 */
import { Link } from "wouter";
import BannerRotator from "@/components/BannerRotator";

export default function SharedPageFooter() {
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

  return (
    <div className="mt-12">
      <div className="flex justify-center mb-6">
        <BannerRotator slot="horizontal" width={720} height={190} site="it" />
      </div>
      <div className="border-t border-[#e5e5ea]">
        <div className="py-4 flex items-center justify-center gap-3">
          <p
            className="text-[11px] text-[#1a1a1a]/40"
            style={{ fontFamily: SF }}
          >
            ProofPress Magazine è parte del gruppo{" "}
            <span className="font-semibold text-[#1a1a1a]/55">AxiomX</span>
            {" · "}
            <Link href="/privacy">
              <span className="hover:underline cursor-pointer">Privacy</span>
            </Link>
            {" · "}
            <Link href="/trust-score">
              <span className="hover:underline cursor-pointer">Trust Score</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
