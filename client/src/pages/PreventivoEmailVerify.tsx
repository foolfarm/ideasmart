/**
 * ProofPress — Wizard Preventivo Email Verify
 * Route: /preventivo-email-verify
 *
 * Step 1: Piattaforma email e dimensione lista
 * Step 2: Volume e integrazione
 * Step 3: Dati di contatto
 * Step 4: Riepilogo e invio
 */

import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, ArrowRight, ArrowLeft, Mail, Code2, LayoutDashboard, Globe, Users } from "lucide-react";

type EmailPlatform = "sendgrid" | "mailchimp" | "hubspot" | "altro" | "non_so";
type ListSize = "fino_a_1000" | "1000_10000" | "10000_100000" | "oltre_100000";
type VolumePerMonth = "fino_a_100" | "100_1000" | "1000_10000" | "oltre_10000";
type IntegrationMode = "api" | "dashboard" | "entrambi";

interface WizardData {
  sectors: string[];
  emailPlatform: EmailPlatform | null;
  listSize: ListSize | null;
  volumePerMonth: VolumePerMonth | null;
  integrationMode: IntegrationMode | null;
  contactName: string;
  contactEmail: string;
  contactCompany: string;
  contactPhone: string;
  notes: string;
}

const INITIAL_DATA: WizardData = {
  sectors: [],
  emailPlatform: null,
  listSize: null,
  volumePerMonth: null,
  integrationMode: null,
  contactName: "",
  contactEmail: "",
  contactCompany: "",
  contactPhone: "",
  notes: "",
};

const SECTOR_OPTIONS = [
  "Intelligenza Artificiale", "Startup & Venture Capital", "Finanza & Mercati",
  "Tecnologia & Innovazione", "Salute & Biotech", "Energia & Sostenibilità",
  "Diritto & Compliance", "Marketing & Comunicazione", "Retail & E-commerce",
  "Manifattura & Industria", "Immobiliare", "Sport & Lifestyle",
  "Cultura & Intrattenimento", "Pubblica Amministrazione", "Altro",
];

const PLATFORM_OPTIONS: { value: EmailPlatform; label: string; desc: string }[] = [
  { value: "sendgrid", label: "SendGrid", desc: "Twilio SendGrid — API-first email delivery" },
  { value: "mailchimp", label: "Mailchimp", desc: "Intuit Mailchimp — marketing automation" },
  { value: "hubspot", label: "HubSpot", desc: "HubSpot Marketing Hub — CRM integrato" },
  { value: "altro", label: "Altra piattaforma", desc: "ActiveCampaign, Klaviyo, Brevo, Salesforce, ecc." },
  { value: "non_so", label: "Non so ancora", desc: "Valutiamo insieme la soluzione più adatta" },
];

const LIST_SIZE_OPTIONS: { value: ListSize; label: string; desc: string }[] = [
  { value: "fino_a_1000", label: "Fino a 1.000 contatti", desc: "Newsletter di nicchia o early-stage" },
  { value: "1000_10000", label: "1.000–10.000 contatti", desc: "Lista media in crescita" },
  { value: "10000_100000", label: "10.000–100.000 contatti", desc: "Lista consolidata, scala media" },
  { value: "oltre_100000", label: "Oltre 100.000 contatti", desc: "Enterprise o media company" },
];

const VOLUME_OPTIONS: { value: VolumePerMonth; label: string; desc: string }[] = [
  { value: "fino_a_100", label: "Fino a 100 email/mese", desc: "Invii occasionali o pilota" },
  { value: "100_1000", label: "100–1.000/mese", desc: "Newsletter settimanale standard" },
  { value: "1000_10000", label: "1.000–10.000/mese", desc: "Campagne frequenti o giornaliere" },
  { value: "oltre_10000", label: "Oltre 10.000/mese", desc: "Scala enterprise, invii massivi" },
];

const INTEGRATION_OPTIONS: { value: IntegrationMode; label: string; desc: string; icon: React.ReactNode }[] = [
  { value: "api", label: "API REST", desc: "Integrazione diretta con la tua piattaforma email via API", icon: <Code2 className="w-5 h-5" /> },
  { value: "dashboard", label: "Dashboard Web", desc: "Carica e verifica le email manualmente dall'interfaccia", icon: <LayoutDashboard className="w-5 h-5" /> },
  { value: "entrambi", label: "API + Dashboard", desc: "Flessibilità massima: accesso completo a entrambe le modalità", icon: <Globe className="w-5 h-5" /> },
];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${i < current ? "bg-[#1a1a1a] text-white" : i === current ? "bg-[#7c3aed] text-white" : "bg-[#1a1a1a]/10 text-[#1a1a1a]/40"}`}>
            {i < current ? <CheckCircle className="w-4 h-4" /> : i + 1}
          </div>
          {i < total - 1 && <div className={`h-[2px] w-8 transition-all ${i < current ? "bg-[#1a1a1a]" : "bg-[#1a1a1a]/10"}`} />}
        </div>
      ))}
    </div>
  );
}

function SelectCard<T extends string>({ value, selected, onSelect, label, desc, icon }: { value: T; selected: boolean; onSelect: (v: T) => void; label: string; desc: string; icon?: React.ReactNode }) {
  return (
    <button type="button" onClick={() => onSelect(value)} className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${selected ? "border-[#7c3aed] bg-[#7c3aed]/5" : "border-[#1a1a1a]/10 bg-white hover:border-[#1a1a1a]/25"}`}>
      {icon && <div className={`mt-0.5 flex-shrink-0 ${selected ? "text-[#7c3aed]" : "text-[#1a1a1a]/40"}`}>{icon}</div>}
      <div>
        <div className={`text-[14px] font-bold ${selected ? "text-[#7c3aed]" : "text-[#1a1a1a]"}`}>{label}</div>
        <div className="text-[12px] text-[#1a1a1a]/55 mt-0.5 leading-relaxed">{desc}</div>
      </div>
      {selected && <div className="ml-auto flex-shrink-0"><CheckCircle className="w-5 h-5 text-[#7c3aed]" /></div>}
    </button>
  );
}

export default function PreventivoEmailVerify() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(INITIAL_DATA);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitMutation = trpc.verifyQuotes.submit.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (err) => setError(err.message || "Errore durante l'invio. Riprova o scrivi a info@proofpress.ai"),
  });

  const TOTAL_STEPS = 4;
  const STEP_LABELS = ["Piattaforma", "Volume", "Contatti", "Riepilogo"];
  const update = (partial: Partial<WizardData>) => setData((prev) => ({ ...prev, ...partial }));

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return data.emailPlatform !== null && data.listSize !== null;
      case 1: return data.volumePerMonth !== null && data.integrationMode !== null;
      case 2: return data.contactName.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail);
      case 3: return true;
      default: return false;
    }
  };

  const handleSubmit = () => {
    if (!data.emailPlatform || !data.listSize || !data.volumePerMonth || !data.integrationMode) return;
    setError(null);
    submitMutation.mutate({
      productType: "email_verify",
      volumePerMonth: data.volumePerMonth,
      integrationMode: data.integrationMode,
      sectors: data.sectors.length > 0 ? data.sectors : ["Generale"],
      emailPlatform: data.emailPlatform,
      listSize: data.listSize,
      contactName: data.contactName.trim(),
      contactEmail: data.contactEmail.trim(),
      contactCompany: data.contactCompany.trim() || undefined,
      contactPhone: data.contactPhone.trim() || undefined,
      notes: data.notes.trim() || undefined,
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f5f0ff] text-[#1a1a1a] flex items-center justify-center px-6" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
        <div className="max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-[#7c3aed]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-[#7c3aed]" />
          </div>
          <h1 className="text-[32px] font-black mb-3 tracking-[-0.01em]">Preventivo ricevuto!</h1>
          <p className="text-[15px] text-[#1a1a1a]/60 leading-relaxed mb-8">Ciao <strong>{data.contactName}</strong>, abbiamo ricevuto la tua richiesta per <strong>Email Verify</strong>. Ti contatteremo entro <strong>24 ore</strong> all'indirizzo <strong>{data.contactEmail}</strong>.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/"><Button className="bg-[#1a1a1a] hover:bg-[#333] text-white font-bold px-8 py-3">Torna a ProofPress</Button></Link>
            <Link href="/verify-email"><Button variant="outline" className="border-[#1a1a1a]/20 font-bold px-8 py-3">Scopri Email Verify</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  const platformLabel = PLATFORM_OPTIONS.find((p) => p.value === data.emailPlatform)?.label ?? data.emailPlatform;
  const listSizeLabel = LIST_SIZE_OPTIONS.find((l) => l.value === data.listSize)?.label ?? data.listSize;
  const volumeLabel = VOLUME_OPTIONS.find((v) => v.value === data.volumePerMonth)?.label ?? data.volumePerMonth;
  const integrationLabel = INTEGRATION_OPTIONS.find((i) => i.value === data.integrationMode)?.label ?? data.integrationMode;

  return (
    <div className="min-h-screen bg-[#f5f0ff] text-[#1a1a1a]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
      {/* NAV */}
      <div className="border-b border-[#1a1a1a]/8 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]/50 hover:text-[#1a1a1a] transition-colors">← ProofPress</Link>
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.12em] uppercase text-[#7c3aed]">
            <Mail className="w-3.5 h-3.5" /> Email Verify
          </div>
          <Link href="/verify-email" className="text-[11px] font-medium text-[#1a1a1a]/40 hover:text-[#7c3aed] transition-colors">Scopri →</Link>
        </div>
      </div>

      {/* HERO */}
      <div className="max-w-2xl mx-auto px-6 pt-12 pb-4">
        <div className="text-center mb-8">
          <span className="inline-block text-[10px] font-bold tracking-[0.25em] uppercase bg-[#7c3aed] text-white px-3 py-1.5 rounded-sm mb-4">ProofPress Email Verify</span>
          <h1 className="text-[32px] md:text-[40px] font-black leading-[1.1] tracking-[-0.02em] mb-3">Verifica ogni email.<br />Deliverability garantita.</h1>
          <p className="text-[14px] text-[#1a1a1a]/55 leading-relaxed max-w-lg mx-auto">Configura il tuo piano Email Verify e ricevi un preventivo personalizzato entro 24 ore.</p>
        </div>
        <div className="flex items-center gap-1 mb-2">
          {STEP_LABELS.map((label, i) => (
            <div key={i} className="flex-1 text-center">
              <div className={`h-1 rounded-full mb-1 transition-all ${i <= step ? "bg-[#7c3aed]" : "bg-[#1a1a1a]/10"}`} />
              <div className={`text-[9px] font-bold uppercase tracking-[0.1em] transition-all ${i === step ? "text-[#7c3aed]" : i < step ? "text-[#1a1a1a]/50" : "text-[#1a1a1a]/25"}`}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FORM */}
      <div className="max-w-2xl mx-auto px-6 pb-16">
        <div className="bg-white border border-[#1a1a1a]/10 rounded-2xl p-6 md:p-8 shadow-sm">
          <StepIndicator current={step} total={TOTAL_STEPS} />

          {/* Step 0: Piattaforma e lista */}
          {step === 0 && (
            <div>
              <h2 className="text-[24px] font-black mb-2 tracking-[-0.01em]">Piattaforma email e dimensione lista</h2>
              <p className="text-[14px] text-[#1a1a1a]/55 mb-6">Indica la tua piattaforma di invio email e la dimensione della tua lista contatti.</p>
              <div className="mb-6">
                <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#1a1a1a]/50 mb-3">Piattaforma email</div>
                <div className="space-y-3">
                  {PLATFORM_OPTIONS.map((opt) => <SelectCard key={opt.value} value={opt.value} selected={data.emailPlatform === opt.value} onSelect={(v) => update({ emailPlatform: v })} label={opt.label} desc={opt.desc} />)}
                </div>
              </div>
              <div>
                <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#1a1a1a]/50 mb-3">Dimensione lista</div>
                <div className="grid grid-cols-2 gap-3">
                  {LIST_SIZE_OPTIONS.map((opt) => <SelectCard key={opt.value} value={opt.value} selected={data.listSize === opt.value} onSelect={(v) => update({ listSize: v })} label={opt.label} desc={opt.desc} icon={<Users className="w-5 h-5" />} />)}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Volume e integrazione */}
          {step === 1 && (
            <div>
              <h2 className="text-[24px] font-black mb-2 tracking-[-0.01em]">Volume e modalità di integrazione</h2>
              <p className="text-[14px] text-[#1a1a1a]/55 mb-6">Indica quante email verifichi al mese e come preferisci accedere al servizio.</p>
              <div className="mb-6">
                <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#1a1a1a]/50 mb-3">Email verificate al mese</div>
                <div className="space-y-3">
                  {VOLUME_OPTIONS.map((opt) => <SelectCard key={opt.value} value={opt.value} selected={data.volumePerMonth === opt.value} onSelect={(v) => update({ volumePerMonth: v })} label={opt.label} desc={opt.desc} />)}
                </div>
              </div>
              <div>
                <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#1a1a1a]/50 mb-3">Modalità di integrazione</div>
                <div className="space-y-3">
                  {INTEGRATION_OPTIONS.map((opt) => <SelectCard key={opt.value} value={opt.value} selected={data.integrationMode === opt.value} onSelect={(v) => update({ integrationMode: v })} label={opt.label} desc={opt.desc} icon={opt.icon} />)}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contatti */}
          {step === 2 && (
            <div>
              <h2 className="text-[24px] font-black mb-2 tracking-[-0.01em]">I tuoi dati di contatto</h2>
              <p className="text-[14px] text-[#1a1a1a]/55 mb-6">Lascia i tuoi recapiti per ricevere il preventivo personalizzato.</p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-[12px] font-medium text-[#1a1a1a]/70 mb-1.5">Nome e cognome *</label><Input value={data.contactName} onChange={(e) => update({ contactName: e.target.value })} placeholder="Mario Rossi" className="text-[14px]" /></div>
                  <div><label className="block text-[12px] font-medium text-[#1a1a1a]/70 mb-1.5">Email *</label><Input type="email" value={data.contactEmail} onChange={(e) => update({ contactEmail: e.target.value })} placeholder="mario@azienda.it" className="text-[14px]" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-[12px] font-medium text-[#1a1a1a]/70 mb-1.5">Azienda</label><Input value={data.contactCompany} onChange={(e) => update({ contactCompany: e.target.value })} placeholder="Nome azienda (opzionale)" className="text-[14px]" /></div>
                  <div><label className="block text-[12px] font-medium text-[#1a1a1a]/70 mb-1.5">Telefono</label><Input value={data.contactPhone} onChange={(e) => update({ contactPhone: e.target.value })} placeholder="+39 (opzionale)" className="text-[14px]" /></div>
                </div>
                <div><label className="block text-[12px] font-medium text-[#1a1a1a]/70 mb-1.5">Note aggiuntive</label><Textarea value={data.notes} onChange={(e) => update({ notes: e.target.value })} placeholder="Descrivi il tuo caso d'uso specifico..." rows={3} className="text-[14px] resize-none" /></div>
              </div>
            </div>
          )}

          {/* Step 3: Riepilogo */}
          {step === 3 && (
            <div>
              <h2 className="text-[24px] font-black mb-2 tracking-[-0.01em]">Riepilogo della tua richiesta</h2>
              <p className="text-[14px] text-[#1a1a1a]/55 mb-6">Verifica i dettagli prima di inviare. Riceverai un preventivo entro 24 ore.</p>
              <div className="bg-white border border-[#1a1a1a]/10 rounded-xl overflow-hidden">
                {[
                  { label: "Prodotto", value: "Email Verify" },
                  { label: "Piattaforma", value: platformLabel ?? "—" },
                  { label: "Dimensione lista", value: listSizeLabel ?? "—" },
                  { label: "Volume/mese", value: volumeLabel ?? "—" },
                  { label: "Integrazione", value: integrationLabel ?? "—" },
                  { label: "Contatto", value: `${data.contactName} — ${data.contactEmail}` },
                  ...(data.contactCompany ? [{ label: "Azienda", value: data.contactCompany }] : []),
                ].map((row, i) => (
                  <div key={i} className={`flex gap-4 px-5 py-3 ${i % 2 === 0 ? "bg-white" : "bg-[#f5f0ff]"}`}>
                    <div className="text-[12px] text-[#1a1a1a]/50 w-36 flex-shrink-0 pt-0.5">{row.label}</div>
                    <div className="text-[13px] text-[#1a1a1a] font-medium leading-relaxed">{row.value}</div>
                  </div>
                ))}
              </div>
              {data.notes && <div className="mt-4 p-4 bg-[#f5f0ff] border border-[#1a1a1a]/10 rounded-xl"><div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#1a1a1a]/40 mb-1">Note</div><div className="text-[13px] text-[#1a1a1a]/70 leading-relaxed">{data.notes}</div></div>}
              <div className="mt-6 p-4 bg-[#7c3aed]/5 border border-[#7c3aed]/20 rounded-xl text-[13px] text-[#7c3aed]">Inviando questa richiesta, il team ProofPress ti contatterà entro 24 ore con un preventivo personalizzato per Email Verify.</div>
            </div>
          )}

          {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-[13px] text-red-600">{error}</div>}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#1a1a1a]/8">
            <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 0} className="border-[#1a1a1a]/20 font-bold px-6"><ArrowLeft className="w-4 h-4 mr-2" />Indietro</Button>
            {step < TOTAL_STEPS - 1 ? (
              <Button type="button" onClick={() => setStep((s) => s + 1)} disabled={!canProceed()} className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold px-8">Avanti<ArrowRight className="w-4 h-4 ml-2" /></Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={submitMutation.isPending} className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold px-8">{submitMutation.isPending ? "Invio in corso..." : "Invia richiesta"}{!submitMutation.isPending && <ArrowRight className="w-4 h-4 ml-2" />}</Button>
            )}
          </div>
        </div>
        <p className="text-center text-[11px] text-[#1a1a1a]/35 mt-6">Nessun impegno. Preventivo gratuito. Risposta entro 24 ore. <Link href="/privacy" className="underline hover:text-[#1a1a1a]/60">Privacy Policy</Link></p>
      </div>
    </div>
  );
}
