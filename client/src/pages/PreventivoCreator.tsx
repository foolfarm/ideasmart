/**
 * ProofPress — Wizard Preventivo Creator
 * Form multi-step per qualificare i clienti ProofPress Creator
 * Route: /preventivo-creator
 *
 * Step 1: Tipo di progetto editoriale
 * Step 2: Settori e fonti
 * Step 3: Tecnologia (Verify + LLM)
 * Step 4: Frequenza e contatti
 * Step 5: Conferma
 */

import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, ArrowRight, ArrowLeft, Newspaper, Mail, Building2, Rocket, HelpCircle, Shield, Zap, Cpu, Clock, Globe, BarChart3 } from "lucide-react";

// ── Tipi ────────────────────────────────────────────────────────────────────
type ProjectType = "giornale_settoriale" | "newsletter_aziendale" | "blog_aziendale" | "media_startup" | "altro";
type SectorType = "mono" | "multi";
type SourcesCount = "fino_a_10" | "10_50" | "50_100" | "oltre_100";
type LlmType = "incluso" | "proprio";
type LlmQuality = "base" | "medio" | "top";
type PublishFrequency = "giornaliera" | "settimanale" | "mensile";

interface WizardData {
  // Step 1
  projectType: ProjectType | null;
  // Step 2
  sectorType: SectorType | null;
  sectors: string[];
  sourcesCount: SourcesCount | null;
  // Step 3
  includeVerify: boolean;
  llmType: LlmType | null;
  llmQuality: LlmQuality | null;
  // Step 4
  publishFrequency: PublishFrequency | null;
  contactName: string;
  contactEmail: string;
  contactCompany: string;
  contactPhone: string;
  notes: string;
}

const INITIAL_DATA: WizardData = {
  projectType: null,
  sectorType: null,
  sectors: [],
  sourcesCount: null,
  includeVerify: false,
  llmType: null,
  llmQuality: null,
  publishFrequency: null,
  contactName: "",
  contactEmail: "",
  contactCompany: "",
  contactPhone: "",
  notes: "",
};

// ── Opzioni ──────────────────────────────────────────────────────────────────
const PROJECT_TYPES: { value: ProjectType; label: string; desc: string; icon: React.ReactNode }[] = [
  { value: "giornale_settoriale", label: "Giornale Settoriale", desc: "Testata verticale su un settore specifico (AI, finanza, salute, ecc.)", icon: <Newspaper className="w-5 h-5" /> },
  { value: "newsletter_aziendale", label: "Newsletter Aziendale", desc: "Newsletter periodica per clienti, partner o stakeholder aziendali", icon: <Mail className="w-5 h-5" /> },
  { value: "blog_aziendale", label: "Blog Aziendale", desc: "Content hub per posizionamento SEO e thought leadership", icon: <Building2 className="w-5 h-5" /> },
  { value: "media_startup", label: "Media Startup", desc: "Progetto editoriale con modello di business (abbonamenti, pubblicità)", icon: <Rocket className="w-5 h-5" /> },
  { value: "altro", label: "Altro", desc: "Progetto personalizzato o non classificabile nelle categorie precedenti", icon: <HelpCircle className="w-5 h-5" /> },
];

const SECTOR_OPTIONS = [
  "Intelligenza Artificiale", "Startup & Venture Capital", "Finanza & Mercati",
  "Tecnologia & Innovazione", "Salute & Biotech", "Energia & Sostenibilità",
  "Diritto & Compliance", "Marketing & Comunicazione", "Retail & E-commerce",
  "Manifattura & Industria", "Immobiliare", "Sport & Lifestyle",
  "Cultura & Intrattenimento", "Pubblica Amministrazione", "Altro",
];

const SOURCES_OPTIONS: { value: SourcesCount; label: string; desc: string }[] = [
  { value: "fino_a_10", label: "Fino a 10 fonti", desc: "Nicchia verticale, focus ristretto" },
  { value: "10_50", label: "10–50 fonti", desc: "Copertura settoriale standard" },
  { value: "50_100", label: "50–100 fonti", desc: "Copertura ampia multi-fonte" },
  { value: "oltre_100", label: "Oltre 100 fonti", desc: "Monitoraggio completo del mercato" },
];

const LLM_QUALITY_OPTIONS: { value: LlmQuality; label: string; desc: string; price: string }[] = [
  { value: "base", label: "Base", desc: "GPT-4o Mini o equivalente — ottimo per contenuti standard", price: "Costo LLM ridotto" },
  { value: "medio", label: "Medio", desc: "GPT-4o o Claude 3.5 Sonnet — bilanciato qualità/costo", price: "Costo LLM standard" },
  { value: "top", label: "Top", desc: "Claude 3.7 Sonnet o o3 — massima qualità editoriale", price: "Costo LLM premium" },
];

const FREQUENCY_OPTIONS: { value: PublishFrequency; label: string; desc: string; icon: React.ReactNode }[] = [
  { value: "giornaliera", label: "Giornaliera", desc: "1–15 articoli al giorno, newsletter mattutina", icon: <Clock className="w-5 h-5" /> },
  { value: "settimanale", label: "Settimanale", desc: "3–10 articoli a settimana, digest settimanale", icon: <BarChart3 className="w-5 h-5" /> },
  { value: "mensile", label: "Mensile", desc: "Report mensile approfondito, newsletter mensile", icon: <Globe className="w-5 h-5" /> },
];

// ── Componenti UI ────────────────────────────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
              i < current
                ? "bg-[#1a1a1a] text-white"
                : i === current
                ? "bg-[#c0392b] text-white"
                : "bg-[#1a1a1a]/10 text-[#1a1a1a]/40"
            }`}
          >
            {i < current ? <CheckCircle className="w-4 h-4" /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`h-[2px] w-8 transition-all ${i < current ? "bg-[#1a1a1a]" : "bg-[#1a1a1a]/10"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function SelectCard<T extends string>({
  value,
  selected,
  onSelect,
  label,
  desc,
  icon,
}: {
  value: T;
  selected: boolean;
  onSelect: (v: T) => void;
  label: string;
  desc: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${
        selected
          ? "border-[#c0392b] bg-[#c0392b]/5"
          : "border-[#1a1a1a]/10 bg-white hover:border-[#1a1a1a]/25"
      }`}
    >
      {icon && (
        <div className={`mt-0.5 flex-shrink-0 ${selected ? "text-[#c0392b]" : "text-[#1a1a1a]/40"}`}>
          {icon}
        </div>
      )}
      <div>
        <div className={`text-[14px] font-bold ${selected ? "text-[#c0392b]" : "text-[#1a1a1a]"}`}>{label}</div>
        <div className="text-[12px] text-[#1a1a1a]/55 mt-0.5 leading-relaxed">{desc}</div>
      </div>
      {selected && (
        <div className="ml-auto flex-shrink-0">
          <CheckCircle className="w-5 h-5 text-[#c0392b]" />
        </div>
      )}
    </button>
  );
}

// ── Step 1: Tipo di progetto ─────────────────────────────────────────────────
function Step1({ data, onChange }: { data: WizardData; onChange: (d: Partial<WizardData>) => void }) {
  return (
    <div>
      <h2 className="text-[26px] font-black mb-2 tracking-[-0.01em]">Che tipo di progetto hai in mente?</h2>
      <p className="text-[14px] text-[#1a1a1a]/55 mb-6">Scegli il formato editoriale più vicino alla tua idea. Potrai personalizzarlo in seguito.</p>
      <div className="space-y-3">
        {PROJECT_TYPES.map((pt) => (
          <SelectCard
            key={pt.value}
            value={pt.value}
            selected={data.projectType === pt.value}
            onSelect={(v) => onChange({ projectType: v })}
            label={pt.label}
            desc={pt.desc}
            icon={pt.icon}
          />
        ))}
      </div>
    </div>
  );
}

// ── Step 2: Settori e fonti ──────────────────────────────────────────────────
function Step2({ data, onChange }: { data: WizardData; onChange: (d: Partial<WizardData>) => void }) {
  const toggleSector = (s: string) => {
    const current = data.sectors;
    if (current.includes(s)) {
      onChange({ sectors: current.filter((x) => x !== s) });
    } else {
      onChange({ sectors: [...current, s] });
    }
  };

  return (
    <div>
      <h2 className="text-[26px] font-black mb-2 tracking-[-0.01em]">Settori e copertura delle fonti</h2>
      <p className="text-[14px] text-[#1a1a1a]/55 mb-6">Seleziona i settori che vuoi coprire e il numero di fonti da monitorare.</p>

      {/* Mono o multi-settore */}
      <div className="mb-6">
        <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#1a1a1a]/50 mb-3">Copertura settoriale</div>
        <div className="grid grid-cols-2 gap-3">
          <SelectCard
            value="mono"
            selected={data.sectorType === "mono"}
            onSelect={(v) => onChange({ sectorType: v })}
            label="Mono-settore"
            desc="Focus verticale su un unico settore"
          />
          <SelectCard
            value="multi"
            selected={data.sectorType === "multi"}
            onSelect={(v) => onChange({ sectorType: v })}
            label="Multi-settore"
            desc="Copertura orizzontale su più settori"
          />
        </div>
      </div>

      {/* Settori */}
      <div className="mb-6">
        <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#1a1a1a]/50 mb-3">
          Settori di interesse {data.sectors.length > 0 && <span className="text-[#c0392b]">({data.sectors.length} selezionati)</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          {SECTOR_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSector(s)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all ${
                data.sectors.includes(s)
                  ? "bg-[#c0392b] text-white border-[#c0392b]"
                  : "bg-white text-[#1a1a1a]/70 border-[#1a1a1a]/15 hover:border-[#1a1a1a]/30"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Numero fonti */}
      <div>
        <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#1a1a1a]/50 mb-3">Numero di fonti da monitorare</div>
        <div className="grid grid-cols-2 gap-3">
          {SOURCES_OPTIONS.map((opt) => (
            <SelectCard
              key={opt.value}
              value={opt.value}
              selected={data.sourcesCount === opt.value}
              onSelect={(v) => onChange({ sourcesCount: v })}
              label={opt.label}
              desc={opt.desc}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Step 3: Tecnologia ───────────────────────────────────────────────────────
function Step3({ data, onChange }: { data: WizardData; onChange: (d: Partial<WizardData>) => void }) {
  return (
    <div>
      <h2 className="text-[26px] font-black mb-2 tracking-[-0.01em]">Configurazione tecnologica</h2>
      <p className="text-[14px] text-[#1a1a1a]/55 mb-6">Scegli le opzioni tecnologiche che meglio si adattano al tuo progetto e al tuo budget.</p>

      {/* ProofPress Verify */}
      <div className="mb-6">
        <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#1a1a1a]/50 mb-3">ProofPress Verify</div>
        <div className="grid grid-cols-2 gap-3">
          <SelectCard
            value="true"
            selected={data.includeVerify === true}
            onSelect={() => onChange({ includeVerify: true })}
            label="Includi Verify"
            desc="Ogni articolo certificato con hash IPFS e trust score"
            icon={<Shield className="w-5 h-5" />}
          />
          <SelectCard
            value="false"
            selected={data.includeVerify === false}
            onSelect={() => onChange({ includeVerify: false })}
            label="Senza Verify"
            desc="Solo generazione e pubblicazione dei contenuti"
            icon={<Zap className="w-5 h-5" />}
          />
        </div>
        {data.includeVerify && (
          <div className="mt-3 p-3 bg-[#c0392b]/5 border border-[#c0392b]/20 rounded-lg text-[12px] text-[#c0392b]">
            ProofPress Verify certifica ogni articolo con un hash SHA-256 ancorato su IPFS. Il lettore può verificare l'autenticità del contenuto in qualsiasi momento.
          </div>
        )}
      </div>

      {/* LLM: proprio o incluso */}
      <div className="mb-6">
        <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#1a1a1a]/50 mb-3">Modello LLM</div>
        <div className="grid grid-cols-2 gap-3">
          <SelectCard
            value="incluso"
            selected={data.llmType === "incluso"}
            onSelect={(v) => onChange({ llmType: v })}
            label="LLM incluso"
            desc="Usiamo noi il modello AI — costo LLM incluso nel canone"
            icon={<Cpu className="w-5 h-5" />}
          />
          <SelectCard
            value="proprio"
            selected={data.llmType === "proprio"}
            onSelect={(v) => onChange({ llmType: v })}
            label="LLM proprio"
            desc="Usi le tue API key (OpenAI, Anthropic, ecc.) — massimo controllo"
            icon={<Zap className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* Qualità LLM */}
      <div>
        <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#1a1a1a]/50 mb-3">Qualità del modello</div>
        <div className="space-y-3">
          {LLM_QUALITY_OPTIONS.map((opt) => (
            <SelectCard
              key={opt.value}
              value={opt.value}
              selected={data.llmQuality === opt.value}
              onSelect={(v) => onChange({ llmQuality: v })}
              label={opt.label}
              desc={`${opt.desc} — ${opt.price}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Step 4: Frequenza e contatti ─────────────────────────────────────────────
function Step4({ data, onChange }: { data: WizardData; onChange: (d: Partial<WizardData>) => void }) {
  return (
    <div>
      <h2 className="text-[26px] font-black mb-2 tracking-[-0.01em]">Frequenza e dati di contatto</h2>
      <p className="text-[14px] text-[#1a1a1a]/55 mb-6">Indica con quale cadenza vuoi pubblicare e lascia i tuoi recapiti per ricevere il preventivo.</p>

      {/* Frequenza */}
      <div className="mb-6">
        <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#1a1a1a]/50 mb-3">Frequenza di pubblicazione</div>
        <div className="space-y-3">
          {FREQUENCY_OPTIONS.map((opt) => (
            <SelectCard
              key={opt.value}
              value={opt.value}
              selected={data.publishFrequency === opt.value}
              onSelect={(v) => onChange({ publishFrequency: v })}
              label={opt.label}
              desc={opt.desc}
              icon={opt.icon}
            />
          ))}
        </div>
      </div>

      {/* Dati di contatto */}
      <div className="space-y-4">
        <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#1a1a1a]/50 mb-1">I tuoi dati</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-medium text-[#1a1a1a]/70 mb-1.5">Nome e cognome *</label>
            <Input
              value={data.contactName}
              onChange={(e) => onChange({ contactName: e.target.value })}
              placeholder="Mario Rossi"
              className="text-[14px]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#1a1a1a]/70 mb-1.5">Email *</label>
            <Input
              type="email"
              value={data.contactEmail}
              onChange={(e) => onChange({ contactEmail: e.target.value })}
              placeholder="mario@azienda.it"
              className="text-[14px]"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-medium text-[#1a1a1a]/70 mb-1.5">Azienda / Testata</label>
            <Input
              value={data.contactCompany}
              onChange={(e) => onChange({ contactCompany: e.target.value })}
              placeholder="Nome azienda (opzionale)"
              className="text-[14px]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#1a1a1a]/70 mb-1.5">Telefono</label>
            <Input
              value={data.contactPhone}
              onChange={(e) => onChange({ contactPhone: e.target.value })}
              placeholder="+39 (opzionale)"
              className="text-[14px]"
            />
          </div>
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#1a1a1a]/70 mb-1.5">Note aggiuntive</label>
          <Textarea
            value={data.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            placeholder="Descrivi il tuo progetto, eventuali esigenze specifiche o domande..."
            rows={3}
            className="text-[14px] resize-none"
          />
        </div>
      </div>
    </div>
  );
}

// ── Step 5: Riepilogo ────────────────────────────────────────────────────────
function Step5({ data }: { data: WizardData }) {
  const projectLabel = PROJECT_TYPES.find((p) => p.value === data.projectType)?.label ?? data.projectType;
  const freqLabel = FREQUENCY_OPTIONS.find((f) => f.value === data.publishFrequency)?.label ?? data.publishFrequency;
  const sourcesLabel = SOURCES_OPTIONS.find((s) => s.value === data.sourcesCount)?.label ?? data.sourcesCount;
  const llmQualityLabel = LLM_QUALITY_OPTIONS.find((l) => l.value === data.llmQuality)?.label ?? data.llmQuality;

  const rows = [
    { label: "Tipo progetto", value: projectLabel },
    { label: "Settori", value: data.sectors.length > 0 ? data.sectors.join(", ") : "—" },
    { label: "Copertura", value: data.sectorType === "mono" ? "Mono-settore" : "Multi-settore" },
    { label: "Fonti", value: sourcesLabel },
    { label: "ProofPress Verify", value: data.includeVerify ? "Incluso" : "Non incluso" },
    { label: "LLM", value: data.llmType === "incluso" ? `Incluso — Qualità ${llmQualityLabel}` : `Proprio — Qualità ${llmQualityLabel}` },
    { label: "Frequenza", value: freqLabel },
    { label: "Contatto", value: `${data.contactName} — ${data.contactEmail}` },
    ...(data.contactCompany ? [{ label: "Azienda", value: data.contactCompany }] : []),
  ];

  return (
    <div>
      <h2 className="text-[26px] font-black mb-2 tracking-[-0.01em]">Riepilogo della tua richiesta</h2>
      <p className="text-[14px] text-[#1a1a1a]/55 mb-6">Verifica i dettagli prima di inviare. Riceverai un preventivo personalizzato entro 24 ore.</p>
      <div className="bg-white border border-[#1a1a1a]/10 rounded-xl overflow-hidden">
        {rows.map((row, i) => (
          <div key={i} className={`flex gap-4 px-5 py-3 ${i % 2 === 0 ? "bg-white" : "bg-[#faf9f7]"}`}>
            <div className="text-[12px] text-[#1a1a1a]/50 w-36 flex-shrink-0 pt-0.5">{row.label}</div>
            <div className="text-[13px] text-[#1a1a1a] font-medium leading-relaxed">{row.value}</div>
          </div>
        ))}
      </div>
      {data.notes && (
        <div className="mt-4 p-4 bg-[#faf9f7] border border-[#1a1a1a]/10 rounded-xl">
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#1a1a1a]/40 mb-1">Note</div>
          <div className="text-[13px] text-[#1a1a1a]/70 leading-relaxed">{data.notes}</div>
        </div>
      )}
      <div className="mt-6 p-4 bg-[#c0392b]/5 border border-[#c0392b]/20 rounded-xl text-[13px] text-[#c0392b]">
        Inviando questa richiesta, il team ProofPress riceverà una notifica immediata e ti contatterà entro 24 ore con un preventivo personalizzato.
      </div>
    </div>
  );
}

// ── Pagina principale ────────────────────────────────────────────────────────
export default function PreventivoCreator() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(INITIAL_DATA);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitMutation = trpc.creatorQuotes.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (err) => {
      setError(err.message || "Errore durante l'invio. Riprova o scrivi a info@proofpress.ai");
    },
  });

  const TOTAL_STEPS = 5;

  const updateData = (partial: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  // Validazione per ogni step
  const canProceed = (): boolean => {
    switch (step) {
      case 0: return data.projectType !== null;
      case 1: return data.sectorType !== null && data.sectors.length > 0 && data.sourcesCount !== null;
      case 2: return data.llmType !== null && data.llmQuality !== null;
      case 3: return (
        data.publishFrequency !== null &&
        data.contactName.trim().length >= 2 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)
      );
      case 4: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleSubmit = () => {
    if (!data.projectType || !data.sectorType || !data.sourcesCount || !data.llmType || !data.llmQuality || !data.publishFrequency) return;
    setError(null);
    submitMutation.mutate({
      projectType: data.projectType,
      sectorType: data.sectorType,
      sectors: data.sectors,
      sourcesCount: data.sourcesCount,
      includeVerify: data.includeVerify,
      llmType: data.llmType,
      llmQuality: data.llmQuality,
      publishFrequency: data.publishFrequency,
      contactName: data.contactName.trim(),
      contactEmail: data.contactEmail.trim(),
      contactCompany: data.contactCompany.trim() || undefined,
      contactPhone: data.contactPhone.trim() || undefined,
      notes: data.notes.trim() || undefined,
    });
  };

  const STEP_LABELS = ["Progetto", "Settori", "Tecnologia", "Contatti", "Riepilogo"];

  // ── Schermata di successo ───────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#faf9f7] text-[#1a1a1a] flex items-center justify-center px-6" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
        <div className="max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-[#c0392b]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-[#c0392b]" />
          </div>
          <h1 className="text-[32px] font-black mb-3 tracking-[-0.01em]">Preventivo ricevuto!</h1>
          <p className="text-[15px] text-[#1a1a1a]/60 leading-relaxed mb-8">
            Ciao <strong>{data.contactName}</strong>, abbiamo ricevuto la tua richiesta. Il team ProofPress ti contatterà entro <strong>24 ore</strong> all'indirizzo <strong>{data.contactEmail}</strong> con una proposta personalizzata.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button className="bg-[#1a1a1a] hover:bg-[#333] text-white font-bold px-8 py-3">
                Torna a ProofPress
              </Button>
            </Link>
            <Link href="/offerta/creator">
              <Button variant="outline" className="border-[#1a1a1a]/20 font-bold px-8 py-3">
                Scopri l'offerta Creator
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] text-[#1a1a1a]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
      {/* NAV */}
      <div className="border-b border-[#1a1a1a]/8 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]/50 hover:text-[#1a1a1a] transition-colors">
            ← ProofPress
          </Link>
          <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#1a1a1a]/40">
            Preventivo Creator
          </div>
          <Link href="/offerta/creator" className="text-[11px] font-medium text-[#1a1a1a]/40 hover:text-[#c0392b] transition-colors">
            Offerta →
          </Link>
        </div>
      </div>

      {/* HERO */}
      <div className="max-w-2xl mx-auto px-6 pt-12 pb-4">
        <div className="text-center mb-8">
          <span className="inline-block text-[10px] font-bold tracking-[0.25em] uppercase bg-[#c0392b] text-white px-3 py-1.5 rounded-sm mb-4">
            ProofPress Creator
          </span>
          <h1 className="text-[32px] md:text-[40px] font-black leading-[1.1] tracking-[-0.02em] mb-3">
            Configura la tua testata AI
          </h1>
          <p className="text-[14px] text-[#1a1a1a]/55 leading-relaxed max-w-lg mx-auto">
            Rispondi a 4 domande e ricevi un preventivo personalizzato entro 24 ore. Nessun impegno.
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-1 mb-2">
          {STEP_LABELS.map((label, i) => (
            <div key={i} className="flex-1 text-center">
              <div className={`h-1 rounded-full mb-1 transition-all ${i <= step ? "bg-[#c0392b]" : "bg-[#1a1a1a]/10"}`} />
              <div className={`text-[9px] font-bold uppercase tracking-[0.1em] transition-all ${i === step ? "text-[#c0392b]" : i < step ? "text-[#1a1a1a]/50" : "text-[#1a1a1a]/25"}`}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FORM */}
      <div className="max-w-2xl mx-auto px-6 pb-16">
        <div className="bg-white border border-[#1a1a1a]/10 rounded-2xl p-6 md:p-8 shadow-sm">
          <StepIndicator current={step} total={TOTAL_STEPS} />

          {step === 0 && <Step1 data={data} onChange={updateData} />}
          {step === 1 && <Step2 data={data} onChange={updateData} />}
          {step === 2 && <Step3 data={data} onChange={updateData} />}
          {step === 3 && <Step4 data={data} onChange={updateData} />}
          {step === 4 && <Step5 data={data} />}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-[13px] text-red-600">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#1a1a1a]/8">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={step === 0}
              className="border-[#1a1a1a]/20 font-bold px-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Indietro
            </Button>

            {step < TOTAL_STEPS - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-[#c0392b] hover:bg-[#a93226] text-white font-bold px-8"
              >
                Avanti
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                className="bg-[#c0392b] hover:bg-[#a93226] text-white font-bold px-8"
              >
                {submitMutation.isPending ? "Invio in corso..." : "Invia richiesta"}
                {!submitMutation.isPending && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] text-[#1a1a1a]/35 mt-6">
          Nessun impegno. Preventivo gratuito. Risposta entro 24 ore.{" "}
          <Link href="/privacy" className="underline hover:text-[#1a1a1a]/60">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
