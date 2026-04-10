/**
 * SharedPageFooter — Footer condiviso identico alla Home
 * Usato da: /research, /ai, /startup, /chi-siamo e tutte le pagine interne
 */
import { Link } from "wouter";

function Divider({ thick = false }: { thick?: boolean }) {
  return <div className={`w-full ${thick ? "border-t-[3px]" : "border-t"} border-[#1a1a1a]`} />;
}

const LinkedInIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

export default function SharedPageFooter() {
  const year = new Date().getFullYear();
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

  return (
    <>
      {/* Footer principale */}
      <div className="mt-12">
        <Divider thick />
        <div className="py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p
            className="text-[11px] text-[#1a1a1a]/40"
            style={{ fontFamily: SF }}
          >
            {`© ${year} Proof Press · AI · Startup · Venture Capital`}
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-end">
            {/* LinkedIn ProofPress */}
            <a
              href="https://www.linkedin.com/company/proofpress/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] font-bold hover:text-[#0077b5] transition-colors"
              style={{ color: "#1a1a1a", fontFamily: SF }}
            >
              <LinkedInIcon />
              LinkedIn
            </a>
            {[
              { href: "/ai",        label: "AI NEWS",        color: "#1a1a1a" },
              { href: "/startup",   label: "STARTUP NEWS",   color: "#2a2a2a" },
              { href: "/research",  label: "RICERCHE",       color: "#1a1a1a" },
              { href: "/chi-siamo", label: "Chi Siamo",      color: "#1a1a1a" },
              { href: "/privacy",   label: "Privacy Policy", color: "#1a1a1a" }
            ].map(item => (
              <Link key={item.href} href={item.href}>
                <span
                  className="text-[10px] hover:underline cursor-pointer font-bold"
                  style={{ color: item.color, fontFamily: SF }}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
