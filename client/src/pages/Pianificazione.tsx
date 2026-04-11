import { useState } from "react";

// ─── Dati ────────────────────────────────────────────────────────────────────

const DAYS = [
  {
    name: "Sabato",
    date: "Sab 12 apr",
    newsletters: [
      { time: "10:00", type: "preview", badge: "Preview", title: '"Il meglio di ProofPress"', dest: "ac@acinelli.com", note: "Approvazione prima dell'invio massivo" },
      { time: "10:30", type: "prompt", badge: "Massivo", title: "Prompt Collection 2026", dest: "Tutti gli iscritti", note: "Promo — 39€ · promptcollection2026.com" },
      { time: "12:00", type: "sabato", badge: "Massivo", title: '"Il meglio di ProofPress"', dest: "Tutti gli iscritti", note: "Editoriale del sabato — approfondimento" },
    ],
  },
  {
    name: "Domenica",
    date: "Dom 13 apr",
    newsletters: [
      { time: "15:00", type: "business", badge: "Massivo", title: "ProofPress Business", dest: "Tutti gli iscritti", note: "Promo spazi pubblicitari B2B" },
    ],
  },
  {
    name: "Lunedì",
    date: "Lun 14 apr",
    newsletters: [
      { time: "08:30", type: "preview", badge: "Preview", title: "Preview Daily + Preview Prompt Collection", dest: "ac@acinelli.com", note: "Approvazione prima degli invii massivi" },
      { time: "10:30", type: "prompt", badge: "Massivo", title: "Prompt Collection 2026", dest: "Tutti gli iscritti", note: "Promo — 39€" },
      { time: "11:00", type: "daily", badge: "Daily", title: "Proof Press Daily — Newsletter Unificata", dest: "Tutti gli iscritti", note: "AI + Startup + DEALROOM + Research" },
    ],
  },
  {
    name: "Martedì",
    date: "Mar 15 apr",
    newsletters: [
      { time: "15:00", type: "business", badge: "Massivo", title: "ProofPress Business", dest: "Tutti gli iscritti", note: "Promo spazi pubblicitari B2B" },
    ],
  },
  {
    name: "Mercoledì",
    date: "Mer 16 apr",
    newsletters: [
      { time: "08:30", type: "preview", badge: "Preview", title: "Preview Daily + Preview Prompt Collection", dest: "ac@acinelli.com", note: "Approvazione prima degli invii massivi" },
      { time: "10:30", type: "prompt", badge: "Massivo", title: "Prompt Collection 2026", dest: "Tutti gli iscritti", note: "Promo — 39€" },
      { time: "11:00", type: "daily", badge: "Daily", title: "Proof Press Daily — Newsletter Unificata", dest: "Tutti gli iscritti", note: "AI + Startup + DEALROOM + Research" },
    ],
  },
  {
    name: "Giovedì",
    date: "Gio 17 apr",
    newsletters: [
      { time: "10:30", type: "prompt", badge: "Massivo", title: "Prompt Collection 2026", dest: "Tutti gli iscritti", note: "Promo — 39€" },
    ],
  },
  {
    name: "Venerdì",
    date: "Ven 18 apr",
    newsletters: [
      { time: "08:30", type: "preview", badge: "Preview", title: "Preview Daily + Preview Prompt Collection", dest: "ac@acinelli.com", note: "Approvazione prima degli invii massivi" },
      { time: "10:30", type: "prompt", badge: "Massivo", title: "Prompt Collection 2026", dest: "Tutti gli iscritti", note: "Promo — 39€" },
      { time: "11:00", type: "daily", badge: "Daily", title: "Proof Press Daily — Newsletter Unificata", dest: "Tutti gli iscritti", note: "AI + Startup + DEALROOM + Research" },
      { time: "15:00", type: "business", badge: "Massivo", title: "ProofPress Business", dest: "Tutti gli iscritti", note: "Promo spazi pubblicitari B2B" },
      { time: "18:00", type: "pub", badge: "Promo", title: "Pubblicità su ProofPress", dest: "Tutti gli iscritti", note: "Top Placement · Mid · Native Content" },
    ],
  },
];

const LINKEDIN_SLOTS = [
  { time: "10:00", type: "Post MATTINO — AI News", content: "Notizia AI del giorno con analisi editoriale" },
  { time: "12:30", type: "2° Editoriale AI — Ricerche di Mercato", content: "Analisi settoriale AI di alto livello" },
  { time: "14:30", type: "Post RICERCHE — Proof Press Research", content: "Ricerca AI/Startup/VC del giorno" },
  { time: "16:00", type: "2° RICERCHE — Proof Press Research", content: "Secondo report di ricerca del giorno" },
  { time: "18:00", type: "Startup News Sera — Round & Exit", content: "Round di investimento, exit, startup italiane ed europee" },
];

const RECAP_NL = [
  { label: "Proof Press Daily", days: "Lun / Mer / Ven", time: "11:00" },
  { label: "Preview Daily", days: "Lun / Mer / Ven", time: "08:30" },
  { label: '"Il meglio di ProofPress"', days: "Sabato", time: "12:00" },
  { label: "Preview Sabato", days: "Sabato", time: "10:00" },
  { label: "Prompt Collection 2026", days: "Lun / Mer / Gio / Sab", time: "10:30" },
  { label: "ProofPress Business", days: "Dom / Mar / Ven / Sab", time: "15:00" },
  { label: "Pubblicità su ProofPress", days: "Lun / Mer / Ven", time: "18:00" },
];

const RECAP_LI = [
  { label: "Post MATTINO — AI News", days: "Ogni giorno", time: "10:00" },
  { label: "2° Editoriale AI", days: "Ogni giorno", time: "12:30" },
  { label: "Post RICERCHE", days: "Ogni giorno", time: "14:30" },
  { label: "2° RICERCHE", days: "Ogni giorno", time: "16:00" },
  { label: "Startup News Sera", days: "Ogni giorno", time: "18:00" },
];

const RECAP_SYS = [
  { label: "Morning Health Report", days: "Ogni giorno", time: "08:00" },
  { label: "Verifica LinkedIn", days: "Ogni giorno", time: "09:30" },
  { label: "Verifica notizie AI/Startup", days: "Ogni giorno", time: "07:00" },
  { label: "Daily Metrics Report", days: "Ogni giorno", time: "18:00" },
  { label: "Scraping RSS + Editoriali", days: "Lun / Mer / Ven", time: "00:00" },
  { label: "Research (10 ricerche)", days: "Lun / Mer / Ven", time: "06:00" },
];

// ─── Stili per tipo card newsletter ─────────────────────────────────────────
const cardStyles: Record<string, { border: string; bg: string; badgeBg: string; badgeText: string }> = {
  preview:  { border: "border-l-amber-400",  bg: "bg-amber-50",  badgeBg: "bg-amber-100", badgeText: "text-amber-800" },
  daily:    { border: "border-l-blue-500",   bg: "bg-blue-50",   badgeBg: "bg-blue-100",  badgeText: "text-blue-800" },
  sabato:   { border: "border-l-violet-500", bg: "bg-violet-50", badgeBg: "bg-green-100", badgeText: "text-green-800" },
  prompt:   { border: "border-l-teal-500",   bg: "bg-teal-50",   badgeBg: "bg-green-100", badgeText: "text-green-800" },
  business: { border: "border-l-orange-500", bg: "bg-orange-50", badgeBg: "bg-green-100", badgeText: "text-green-800" },
  pub:      { border: "border-l-indigo-500", bg: "bg-indigo-50", badgeBg: "bg-pink-100",  badgeText: "text-pink-800" },
};

// ─── Componenti ───────────────────────────────────────────────────────────────

function NewsletterCard({ item }: { item: typeof DAYS[0]["newsletters"][0] }) {
  const s = cardStyles[item.type] ?? cardStyles.daily;
  return (
    <div className={`flex gap-3 px-4 py-3 border-b border-slate-100 border-l-4 ${s.border} ${s.bg}`}>
      {/* Orario */}
      <div className="min-w-[46px] text-center">
        <div className="text-[15px] font-black text-orange-500 leading-tight">{item.time}</div>
        <div className="text-[9px] text-slate-400 uppercase tracking-wide">CET</div>
      </div>
      {/* Corpo */}
      <div className="flex-1 min-w-0">
        <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide mb-1 ${s.badgeBg} ${s.badgeText}`}>
          {item.badge}
        </span>
        <div className="text-[13px] font-semibold text-slate-800 leading-snug">{item.title}</div>
        <div className="text-[11px] text-slate-500 mt-0.5">{item.dest}</div>
        <div className="text-[10px] text-slate-400 italic mt-0.5">{item.note}</div>
      </div>
    </div>
  );
}

function DaySection({ day }: { day: typeof DAYS[0] }) {
  return (
    <div className="mb-5">
      {/* Header giorno */}
      <div className="flex items-center justify-between bg-[#0a1628] text-white px-4 py-2.5 rounded-t-xl">
        <span className="text-[13px] font-bold">🗓 {day.name}</span>
        <span className="bg-teal-400 text-[#0a1628] text-[10px] font-bold px-2.5 py-0.5 rounded-full">{day.date}</span>
      </div>
      {/* Cards */}
      <div className="rounded-b-xl overflow-hidden shadow-sm">
        {day.newsletters.map((item, i) => (
          <NewsletterCard key={i} item={item} />
        ))}
      </div>
    </div>
  );
}

function LinkedInDaySection({ day }: { day: typeof DAYS[0] }) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between bg-[#0d1b2a] text-white px-4 py-2.5 rounded-t-xl">
        <span className="text-[13px] font-bold">🗓 {day.name}</span>
        <span className="bg-teal-400 text-[#0a1628] text-[10px] font-bold px-2.5 py-0.5 rounded-full">{day.date}</span>
      </div>
      <div className="rounded-b-xl overflow-hidden shadow-sm">
        {LINKEDIN_SLOTS.map((slot, i) => (
          <div key={i} className={`flex gap-3 px-4 py-3 border-b border-slate-100 border-l-4 border-l-[#0077b5] ${i % 2 === 0 ? "bg-white" : "bg-[#f0f7fc]"}`}>
            <div className="min-w-[46px] text-center">
              <div className="text-[15px] font-black text-[#0077b5] leading-tight">{slot.time}</div>
              <div className="text-[9px] text-slate-400 uppercase tracking-wide">CET</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-slate-800 leading-snug">{slot.type}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{slot.content}</div>
              <div className="text-[10px] font-semibold text-[#0077b5] mt-0.5">→ proofpress.ai</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecapRow({ label, days, time }: { label: string; days: string; time: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-[12px] font-medium text-slate-700 flex-1 pr-2">{label}</span>
      <div className="text-right shrink-0">
        <div className="text-[10px] text-slate-400">{days}</div>
        <div className="text-[14px] font-black text-orange-500">{time}</div>
      </div>
    </div>
  );
}

// ─── Pagina principale ────────────────────────────────────────────────────────

export default function Pianificazione() {
  const [tab, setTab] = useState<"newsletter" | "linkedin" | "riepilogo">("newsletter");

  return (
    <div className="min-h-screen bg-slate-100 pb-16">
      {/* Header sticky */}
      <div className="sticky top-0 z-50 bg-[#0a1628] shadow-lg">
        <div className="px-4 pt-4 pb-3 text-center">
          <h1 className="text-white text-[17px] font-bold tracking-tight">📋 ProofPress — Pianificazione</h1>
          <p className="text-teal-400 text-[10px] font-semibold uppercase tracking-widest mt-0.5">Newsletter & LinkedIn · Orari CET</p>
        </div>
        {/* Tab bar */}
        <div className="flex border-t border-white/10">
          {(["newsletter", "linkedin", "riepilogo"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-[11px] font-semibold uppercase tracking-wide transition-all border-b-2 ${
                tab === t
                  ? "text-teal-400 border-teal-400"
                  : "text-white/40 border-transparent"
              }`}
            >
              {t === "newsletter" ? "📧 Newsletter" : t === "linkedin" ? "💼 LinkedIn" : "📊 Riepilogo"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-5">

        {/* ── TAB: NEWSLETTER ── */}
        {tab === "newsletter" && (
          <div>
            {DAYS.map((day) => (
              <DaySection key={day.name} day={day} />
            ))}
          </div>
        )}

        {/* ── TAB: LINKEDIN ── */}
        {tab === "linkedin" && (
          <div>
            <div className="bg-[#0077b5] text-white rounded-xl px-4 py-3 mb-5 text-[12px] font-semibold">
              💼 5 post al giorno · Ogni giorno (lun–dom) · CTA: → proofpress.ai
            </div>
            {DAYS.map((day) => (
              <LinkedInDaySection key={day.name} day={day} />
            ))}
          </div>
        )}

        {/* ── TAB: RIEPILOGO ── */}
        {tab === "riepilogo" && (
          <div className="space-y-5">
            {/* Newsletter */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-[#0a1628] text-white px-4 py-3 text-[13px] font-bold">
                📧 Newsletter — Riepilogo settimanale
              </div>
              <div className="px-4 py-2">
                {RECAP_NL.map((r, i) => <RecapRow key={i} {...r} />)}
              </div>
            </div>

            {/* LinkedIn */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-[#0077b5] text-white px-4 py-3 text-[13px] font-bold">
                💼 LinkedIn Andrea — Slot giornalieri
              </div>
              <div className="px-4 py-2">
                {RECAP_LI.map((r, i) => <RecapRow key={i} {...r} />)}
              </div>
            </div>

            {/* Sistema */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-[#0f2040] text-white px-4 py-3 text-[13px] font-bold">
                ⚙️ Automazioni di sistema
              </div>
              <div className="px-4 py-2">
                {RECAP_SYS.map((r, i) => <RecapRow key={i} {...r} />)}
              </div>
            </div>

            <p className="text-center text-[11px] text-slate-400 pb-4">
              Tutti gli orari in <strong>CET</strong> (ora italiana) ·{" "}
              <a href="https://proofpress.ai" className="text-teal-500 font-semibold">proofpress.ai</a>
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
