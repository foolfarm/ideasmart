/**
 * SharedPageHeader — Testata condivisa identica alla Home
 * Usato da: tutte le pagine interne
 * Struttura: data + tagline + badge IPFS | ProofPress (grande) + manchette | sottotitolo verde
 */
import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useSiteAuth } from "@/hooks/useSiteAuth";
import { User, LogOut, Settings, Star } from "lucide-react";
import BannerRotator from "@/components/BannerRotator";
import { trpc } from "@/lib/trpc";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
const SF_DISPLAY = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";

function formatDateIT(date: Date): string {
  return date.toLocaleDateString("it-IT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function Divider({ thick = false }: { thick?: boolean }) {
  return <div className={`w-full ${thick ? "border-t-2" : "border-t"} border-[#1d1d1f]`} />;
}

// ─── USER PROFILE DROPDOWN ──────────────────────────────────────────────────
function UserProfileDropdown({ user, logout }: { user: { username?: string | null } | null; logout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
        <Link href="/abbonamenti">
          <span
            className="flex items-center gap-2 px-3 py-2.5 text-[11px] font-semibold hover:bg-[#fdf8ec] transition-colors cursor-pointer"
            style={{ fontFamily: SF, color: "#c9a227" }}
            onClick={() => setOpen(false)}
          >
            <Star size={14} strokeWidth={2} />
            I miei abbonamenti
          </span>
        </Link>
        <button
          onClick={() => { setOpen(false); logout(); }}
          className="flex items-center gap-2 px-3 py-2.5 text-[11px] font-medium text-[#6e6e73] hover:bg-[#f5f5f7] transition-colors w-full text-left"
          style={{ fontFamily: SF }}
        >
          <LogOut size={14} strokeWidth={2} />
          Esci
        </button>
      </div>
    </div>
  );
}

// ─── LOGO CENTRALE (riusabile per desktop e mobile) ─────────────────────────
function ProofPressLogo() {
  return (
    <Link href="/">
      <div className="cursor-pointer hover:opacity-80 transition-opacity">
        <div style={{ display: "inline-flex", alignItems: "flex-start", justifyContent: "center", position: "relative" }}>
          <h1
            className="font-black tracking-tight text-[#1a1a1a] inline"
            style={{ fontFamily: SF_DISPLAY, fontSize: "clamp(28px, 7vw, 88px)", letterSpacing: "-0.02em", lineHeight: 1 }}
          >
            ProofPress
          </h1>
          <span
            className="font-bold tracking-widest text-[#1a1a1a]/50"
            style={{ fontFamily: SF, fontSize: "clamp(8px, 1vw, 14px)", letterSpacing: "0.15em", textTransform: "uppercase", lineHeight: 1, marginTop: "0.3em", marginLeft: "0.4em" }}
          >
            Magazine
          </span>
        </div>
      </div>
    </Link>
  );
}

function ProofPressSubtitle() {
  return (
    <div className="hidden sm:block mt-2 text-[#1a1a1a]/60 font-semibold" style={{ fontFamily: SF, lineHeight: 1.5 }}>
      <div className="uppercase tracking-[0.15em] md:tracking-[0.2em]" style={{ fontSize: "clamp(9px, 1.1vw, 13px)" }}>
        IL TUO PUNTO DI RIFERIMENTO PER INNOVAZIONE, AI, STARTUP, VENTURE
      </div>
      <div className="uppercase tracking-[0.08em] font-bold" style={{ fontSize: "clamp(7px, 0.82vw, 10px)", marginTop: "3px", color: "#00b894" }}>
        INFORMAZIONE 100% VERIFICATA CON PROOFPRESS VERIFY TECHNOLOGY
      </div>
    </div>
  );
}

export default function SharedPageHeader() {
  const today = new Date();
  const { user, isLoading, isAuthenticated, logout } = useSiteAuth();
  const { data: ipfsCountData } = trpc.news.getIPFSCount.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const ipfsCount = ipfsCountData?.count ?? 0;

  return (
    <header
      className="max-w-[1280px] mx-auto px-4 pt-5 pb-0"
      style={{ fontFamily: SF }}
    >
      {/* Riga data + tagline + auth */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          
          <span className="text-[11px] text-[#1a1a1a]/50 uppercase tracking-widest">
            {formatDateIT(today)}
          </span>
        </div>
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
                    className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 bg-[#1d1d1f] text-white cursor-pointer hover:bg-[#3a3a3c] transition-colors"
                    style={{ borderRadius: "980px" }}
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

      {/* Logo centrale con manchette ai lati — identico alla Home */}
      <div className="py-2 sm:py-4">

        {/* Tagline e badge IPFS rimossi */}

        {/* Desktop XL: manchette sinistra | logo | manchette destra */}
        <div className="hidden xl:grid xl:grid-cols-[170px_1fr_170px] items-center gap-4">
          <div className="flex justify-center items-center">
            <BannerRotator slot="left" width={160} height={160} site="it" />
          </div>
          <div className="text-center">
            <ProofPressLogo />
            <ProofPressSubtitle />
          </div>
          <div className="flex justify-center items-center">
            <BannerRotator slot="right" width={160} height={160} site="it" />
          </div>
        </div>

        {/* Mobile / tablet: solo logo centrato */}
        <div className="xl:hidden text-center">
          <ProofPressLogo />
          <ProofPressSubtitle />
        </div>

      </div>

      <Divider thick />
    </header>
  );
}
