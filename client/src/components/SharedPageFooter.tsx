/**
 * SharedPageFooter — Footer semplificato
 * Contenuto: © anno · AI · Startup · Venture Capital | ProofPress Magazine è parte del gruppo AxiomX LLC · Privacy Policy
 */
import { Link } from "wouter";

export default function SharedPageFooter() {
  const year = new Date().getFullYear();
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

  return (
    <div className="mt-12 border-t border-[#1d1d1f]">
      <div className="py-4 flex flex-col sm:flex-row items-center justify-between gap-2 flex-wrap">
        <p
          className="text-[11px] text-[#1a1a1a]/40"
          style={{ fontFamily: SF }}
        >
          {`© ${year} Proof Press · AI · Startup · Venture Capital`}
        </p>
        <p
          className="text-[11px] text-[#1a1a1a]/40"
          style={{ fontFamily: SF }}
        >
          ProofPress Magazine è parte del gruppo{" "}
          <span className="font-semibold text-[#1a1a1a]/55">AxiomX LLC</span>
          {" · "}
          <Link href="/privacy">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
