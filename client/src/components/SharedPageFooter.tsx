/**
 * SharedPageFooter — Footer condiviso identico alla Home
 * Usato da: /research, /ai, /startup, /chi-siamo e tutte le pagine interne
 */
import { Link } from "wouter";

function Divider({ thick = false }: { thick?: boolean }) {
  return <div className={`w-full ${thick ? "border-t-[3px]" : "border-t"} border-[#1a1a1a]`} />;
}

export default function SharedPageFooter() {
  const year = new Date().getFullYear();

  return (
    <>
      {/* Strip pre-footer Intelligence */}
      <div
        className="mt-10 py-5 px-6 flex flex-col sm:flex-row items-center justify-between gap-3"
        style={{
          background: "#0f0f0f",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <p
          className="text-[13px] text-center sm:text-left"
          style={{
            color: "rgba(255,255,255,0.75)",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
          }}
        >
          CEO, founder, investitori: il tuo briefing settimanale personalizzato è a un click.
        </p>
        <Link href="/intelligence">
          <span
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 font-bold text-[11px] uppercase tracking-widest transition-all hover:opacity-90 border cursor-pointer"
            style={{
              borderColor: "rgba(255,255,255,0.4)",
              color: "#ffffff",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
              whiteSpace: "nowrap",
            }}
          >
            Attiva Intelligence →
          </span>
        </Link>
      </div>

      {/* Footer principale */}
      <div className="mt-12">
        <Divider thick />
        <div className="py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p
            className="text-[11px] text-[#1a1a1a]/40"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
          >
            {`© ${year} IdeaSmart · AI · Startup · Venture Capital`}
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-end">
            {[
              { href: "/ai",           label: "AI NEWS",   color: "#1a1a1a" },
              { href: "/startup",      label: "STARTUP NEWS",  color: "#2a2a2a" },
              { href: "/research",     label: "RICERCHE",      color: "#1a1a1a" },
              { href: "/chi-siamo",    label: "Chi Siamo",     color: "#1a1a1a" },
              { href: "/intelligence", label: "Intelligence",  color: "#1a1a1a" },
              { href: "/privacy",      label: "Privacy Policy",color: "#1a1a1a" }
            ].map(item => (
              <Link key={item.href} href={item.href}>
                <span
                  className="text-[10px] hover:underline cursor-pointer font-bold"
                  style={{
                    color: item.color,
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
                  }}
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
