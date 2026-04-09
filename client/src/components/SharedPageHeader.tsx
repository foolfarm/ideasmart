/**
 * SharedPageHeader — Testata condivisa identica alla Home
 * Usato da: tutte le pagine interne
 * Struttura: data + tagline | IDEASMART (grande) | sottotitolo
 * La navigazione canali è gestita separatamente da SectionNav
 */
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useSiteAuth } from "@/hooks/useSiteAuth";
import { User, LogOut, Settings } from "lucide-react";

function formatDateIT(date: Date): string {
  return date.toLocaleDateString("it-IT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function Divider({ thick = false }: { thick?: boolean }) {
  return <div className={`w-full ${thick ? "border-t-[3px]" : "border-t"} border-[#1a1a1a]`} />;
}

// ─── USER PROFILE DROPDOWN ──────────────────────────────────────────────────
function UserProfileDropdown({ user, logout }: { user: { username?: string | null } | null; logout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-full hover:bg-[#1a1a1a]/8 transition-colors"
        style={{ fontFamily: SF }}
      >
        <div className="w-7 h-7 rounded-full bg-[#1a1a1a] flex items-center justify-center">
          <User size={14} color="#fff" strokeWidth={2.2} />
        </div>
        <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest text-[#1a1a1a] max-w-[100px] truncate">
          {user?.username}
        </span>
      </button>

      {/* Dropdown */}
      <div
        className="absolute right-0 top-full mt-1 bg-white border border-[#1a1a1a]/12 shadow-lg rounded-md overflow-hidden z-[60] transition-all duration-200 origin-top-right"
        style={{
          opacity: open ? 1 : 0,
          transform: open ? "scale(1) translateY(0)" : "scale(0.95) translateY(-4px)",
          pointerEvents: open ? "auto" : "none",
          minWidth: "180px",
        }}
      >
        <div className="px-3 py-2.5 border-b border-[#1a1a1a]/8">
          <p className="text-[11px] font-bold text-[#1a1a1a] truncate" style={{ fontFamily: SF }}>
            {user?.username}
          </p>
        </div>
        <Link href="/account">
          <span
            className="flex items-center gap-2 px-3 py-2.5 text-[11px] font-medium text-[#1a1a1a] hover:bg-[#f5f5f5] transition-colors cursor-pointer"
            style={{ fontFamily: SF }}
            onClick={() => setOpen(false)}
          >
            <Settings size={14} strokeWidth={2} />
            Account
          </span>
        </Link>
        <button
          onClick={() => { setOpen(false); logout(); }}
          className="flex items-center gap-2 px-3 py-2.5 text-[11px] font-medium text-[#dc2626] hover:bg-[#fef2f2] transition-colors w-full text-left"
          style={{ fontFamily: SF }}
        >
          <LogOut size={14} strokeWidth={2} />
          Esci
        </button>
      </div>
    </div>
  );
}

export default function SharedPageHeader() {
  const today = new Date();
  const { user, isLoading, isAuthenticated, logout } = useSiteAuth();

  return (
    <header
      className="max-w-[1280px] mx-auto px-4 pt-5 pb-0"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
    >
      {/* Riga data + tagline + auth */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-[#1a1a1a]/50 uppercase tracking-widest">
          {formatDateIT(today)}
        </span>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-[11px] text-[#1a1a1a]/40 uppercase tracking-widest">
            Prompt · Tools · Workflow · News
          </span>
          {!isLoading && (
            isAuthenticated ? (
              <UserProfileDropdown user={user} logout={logout} />
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/accedi">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:opacity-70 transition-opacity"
                    style={{ color: "#1a1a1a" }}
                  >
                    Accedi
                  </span>
                </Link>
                <Link href="/registrati">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-[#1a1a1a] text-white rounded-sm cursor-pointer hover:bg-[#333] transition-colors"
                  >
                    Registrati
                  </span>
                </Link>
              </div>
            )
          )}
        </div>
      </div>

      <Divider thick />

      {/* Logo centrale con manchette Amazon ai lati */}
      <div className="py-6">
        <div className="flex items-center justify-center gap-4">
          {/* Manchette sinistra — Amazon */}
          <a
            href="https://amzn.to/4s8n0wI"
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="hidden lg:flex flex-shrink-0 w-[160px] flex-col items-center rounded-lg overflow-hidden border border-[#1a1a1a]/8 hover:border-[#e63946]/40 hover:shadow-xl transition-all duration-300 group bg-white p-2"
            aria-label="Cambridge Audio P100 SE su Amazon"
          >
            <span className="text-[9px] uppercase tracking-[0.15em] text-[#e63946] font-bold mb-1">Consigliato</span>
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/amazon_cambridge_audio_p100_fe7baf21.webp"
              alt="Cambridge Audio P100 SE"
              className="w-[100px] h-[100px] object-contain group-hover:scale-105 transition-transform duration-300"
            />
            <span className="text-[10px] text-[#1a1a1a]/70 font-medium text-center leading-tight mt-1">Cambridge Audio<br/>P100 SE</span>
            <span className="text-[8px] text-[#1a1a1a]/40 mt-0.5">Amazon.it</span>
          </a>

          {/* Titolo centrale */}
          <div className="text-center flex-1 min-w-0">
            <Link href="/">
              <h1
                className="font-black tracking-tight text-[#1a1a1a] cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
                  fontSize: "clamp(42px, 7vw, 88px)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                Proof Press
              </h1>
            </Link>
            <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-[#1a1a1a]/50">
              Il tuo sistema operativo sull'AI
            </p>
            <p
              className="mt-1 text-[12px] text-[#1a1a1a]/40 italic"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}
            >
              Non leggere l'AI. Usala. Prompt, tool e ricerche per trasformare l'AI in risultati concreti.
            </p>
            <p className="mt-1.5">
              <span className="text-[10px] uppercase tracking-[0.15em] text-[#1a1a1a]/35" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                Informazione 100% verificata by{" "}
              </span>
              <Link href="/proofpress-verify">
                <span className="text-[10px] uppercase tracking-[0.15em] underline underline-offset-2 cursor-pointer hover:text-[#1a1a1a]/80 transition-colors" style={{ color: "#1a1a1a80", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                  ProofPress Verify Technology
                </span>
              </Link>
            </p>
          </div>

          {/* Manchette destra — Amazon */}
          <a
            href="https://amzn.to/3PYgBXA"
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="hidden lg:flex flex-shrink-0 w-[160px] flex-col items-center rounded-lg overflow-hidden border border-[#1a1a1a]/8 hover:border-[#e63946]/40 hover:shadow-xl transition-all duration-300 group bg-white p-2"
            aria-label="Plaud NotePin S su Amazon"
          >
            <span className="text-[9px] uppercase tracking-[0.15em] text-[#e63946] font-bold mb-1">Consigliato</span>
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/amazon_plaud_notepin_03f935aa.webp"
              alt="Plaud NotePin S"
              className="w-[100px] h-[100px] object-contain group-hover:scale-105 transition-transform duration-300"
            />
            <span className="text-[10px] text-[#1a1a1a]/70 font-medium text-center leading-tight mt-1">Plaud NotePin S<br/>AI Voice Recorder</span>
            <span className="text-[8px] text-[#1a1a1a]/40 mt-0.5">Amazon.it</span>
          </a>
        </div>
      </div>

      <Divider thick />
    </header>
  );
}
