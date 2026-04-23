/**
 * ProofPress Verify — Tab aggiuntive Dashboard
 * TabWhatIsVerify  → Cos'è ProofPress Verify (tecnologia, pipeline, livelli, output)
 * TabEasyStart     → Easy Start (onboarding guidato in 5 passi)
 * TabEditor        → Scrivi & Pubblica (editor giornalista con output certificato)
 */
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  Shield, Hash, Database, CheckCircle, Copy, ExternalLink,
  FileText, Zap, Lock, Globe, BarChart3, Key, BookOpen,
  Sparkles, Clock, Search, Layers, Brain,
  PenLine, Send, RefreshCw, Link2, Loader2,
} from "lucide-react";

const SF = "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif";

// ─── TAB: Cos'è ProofPress Verify ────────────────────────────────────────────
export function TabWhatIsVerify() {
  const PIPELINE_STEPS = [
    {
      n: "01", icon: FileText, color: "#3b82f6", title: "Submission",
      what: "L'articolo viene inviato tramite API REST (URL o testo) con la tua chiave API.",
      output: "Ricezione confermata + timestamp ISO 8601 di ingestion",
      guarantee: "Prova di ricezione con timestamp immutabile",
    },
    {
      n: "02", icon: Hash, color: "#8b5cf6", title: "Fingerprinting SHA-256",
      what: "Il sistema calcola l'hash crittografico SHA-256 dell'intero contenuto. Qualsiasi modifica — anche un singolo carattere — produce un hash completamente diverso.",
      output: "Hash SHA-256 a 64 caratteri esadecimali univoco per quel contenuto",
      guarantee: "Integrità del contenuto: prova difendibile che quel testo, a quel momento, diceva esattamente quello",
    },
    {
      n: "03", icon: Brain, color: "#ec4899", title: "Claim Extraction (LLM)",
      what: "Un agente AI estrae automaticamente tutte le affermazioni fattuali verificabili: numeri, date, citazioni, dati statistici, attribuzioni.",
      output: "Lista strutturata di claim con tipo, soggetto e fonte dichiarata",
      guarantee: "Trasparenza metodologica: ogni claim è tracciato e verificabile individualmente",
    },
    {
      n: "04", icon: Search, color: "#f59e0b", title: "Corroborazione Multi-fonte",
      what: "Ogni claim viene verificato su più livelli: motori di ricerca semantici, fonti editoriali indicizzate, dataset pubblici e statistiche ufficiali. Il sistema assegna un peso alla qualità e alla coerenza delle fonti trovate.",
      output: "Score di corroborazione per claim [0–100] con fonti citate",
      guarantee: "Verificabilità indipendente: chiunque può ripercorrere le fonti usate",
    },
    {
      n: "05", icon: BarChart3, color: "#10b981", title: "Scoring Pesato",
      what: "Il sistema calcola il TrustScore aggregato applicando pesi differenziati per tipo di claim, qualità delle fonti e coerenza interna. L'algoritmo è documentato e auditabile.",
      output: "TrustScore numerico [0–100] + TrustGrade (A/B/C/D/F)",
      guarantee: "Metodologia trasparente e riproducibile",
    },
    {
      n: "06", icon: Lock, color: "#6366f1", title: "Sigillatura Crittografica",
      what: "Il Verification Report completo viene serializzato in JSON e sigillato con un secondo hash SHA-256. Nessuna modifica è possibile senza invalidare il sigillo.",
      output: "Report JSON firmato + hash del report separato dall'hash del contenuto",
      guarantee: "Integrità del report: il processo di verifica stesso è inalterabile",
    },
    {
      n: "07", icon: Database, color: "#00897b", title: "IPFS Anchoring",
      what: "Il report sigillato viene caricato su IPFS tramite il servizio di pinning Pinata. Il CID (Content Identifier) è derivato dal contenuto: lo stesso report produce sempre lo stesso CID.",
      output: "CID IPFS + URL gateway pubblico accessibile da qualsiasi browser",
      guarantee: "Persistenza e decentralizzazione: il certificato esiste indipendentemente da ProofPress",
    },
  ];

  const GRADES = [
    {
      grade: "A", range: "85–100", label: "Eccellente", color: "#16a34a", bg: "#f0fdf4",
      desc: "Tutte le affermazioni fattuali sono corroborate da fonti primarie certificate. Zero claim non verificati. Adatto per comunicati regolatori, disclosure CSRD, bilanci di sostenibilità.",
    },
    {
      grade: "B", range: "70–84", label: "Affidabile", color: "#2563eb", bg: "#eff6ff",
      desc: "La maggioranza dei claim è verificata. Alcune affermazioni secondarie non dispongono di corroborazione diretta ma sono coerenti con il contesto. Standard giornalistico professionale.",
    },
    {
      grade: "C", range: "55–69", label: "Accettabile", color: "#ca8a04", bg: "#fefce8",
      desc: "Presenza di claim non verificati o parzialmente contraddetti. Richiede revisione editoriale prima della pubblicazione ufficiale.",
    },
    {
      grade: "D", range: "40–54", label: "Problematico", color: "#ea580c", bg: "#fff7ed",
      desc: "Claim significativi non supportati o contraddetti da fonti affidabili. Non raccomandato per pubblicazione senza revisione sostanziale.",
    },
    {
      grade: "F", range: "0–39", label: "Non verificato", color: "#dc2626", bg: "#fef2f2",
      desc: "Contenuto con affermazioni false o non verificabili. Potenziale disinformazione. Pubblicazione sconsigliata.",
    },
  ];

  const OUTPUTS = [
    { icon: Hash, title: "Hash SHA-256", desc: "Impronta digitale univoca del contenuto. Prova crittografica che quel testo, a quel timestamp, diceva esattamente quello." },
    { icon: BarChart3, title: "TrustScore + TrustGrade", desc: "Punteggio numerico [0–100] e lettera (A–F) che sintetizzano l'affidabilità in un formato leggibile da umani e macchine." },
    { icon: FileText, title: "Verification Report JSON", desc: "Report strutturato con lista claim, fonti usate, score per claim, metodologia applicata. Esportabile, integrabile in qualsiasi sistema." },
    { icon: Database, title: "Certificato IPFS", desc: "CID permanente su rete decentralizzata. Il certificato esiste indipendentemente da ProofPress e può essere verificato da chiunque." },
    { icon: Globe, title: "Pagina pubblica verificabile", desc: "URL pubblico su proofpress.ai/verify/<hash> accessibile a lettori, regolatori, revisori. Mostra il report in formato human-readable." },
    { icon: Lock, title: "Audit trail regolatorio", desc: "Sequenza immutabile di eventi (submission, hash, verifica, report, IPFS) utile per audit interni, assurance ESG e compliance editoriale." },
  ];

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #1a1a2e 100%)" }}>
        <div className="px-8 py-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-[#00e5c8]/20 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#00e5c8]" />
            </div>
            <span className="text-[#00e5c8] text-xs font-bold uppercase tracking-widest">ProofPress Verify</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: SF }}>
            Il protocollo di certificazione agentica per l'informazione
          </h2>
          <p className="text-white/70 text-base leading-relaxed max-w-2xl">
            ProofPress Verify è un sistema AI multi-agente che analizza ogni contenuto editoriale, misura la corroborazione fattuale su 4 livelli di fonti, genera un Verification Report strutturato e lo ancora su IPFS con un hash crittografico immutabile. Non è un fact-checker manuale: è un'infrastruttura di assurance industrializzata.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            {["SHA-256 Fingerprinting", "LLM Claim Extraction", "Corroborazione multi-fonte", "IPFS Anchoring", "Audit trail regolatorio"].map(t => (
              <span key={t} className="text-xs px-3 py-1 rounded-full border border-[#00e5c8]/30 text-[#00e5c8]/80">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline */}
      <div>
        <h3 className="text-lg font-bold text-[#1d1d1f] mb-1" style={{ fontFamily: SF }}>Come funziona: la pipeline in 7 step</h3>
        <p className="text-sm text-[#6e6e73] mb-6">Ogni articolo percorre questa sequenza deterministica. Ogni step produce un output verificabile.</p>
        <div className="space-y-3">
          {PIPELINE_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.n} className="flex gap-4 p-5 rounded-xl border border-[#e5e5e5] bg-white hover:border-[#d0d0d0] transition-colors">
                <div className="flex-shrink-0 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: step.color + "15" }}>
                    <Icon className="w-5 h-5" style={{ color: step.color }} />
                  </div>
                  <span className="text-[10px] font-bold text-[#c7c7cc]">{step.n}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-[#1d1d1f] mb-1">{step.title}</h4>
                  <p className="text-xs text-[#6e6e73] leading-relaxed mb-2">{step.what}</p>
                  <div className="mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868b]">Output → </span>
                    <span className="text-[11px] text-[#1d1d1f]">{step.output}</span>
                  </div>
                  <div className="flex items-start gap-1">
                    <CheckCircle className="w-3 h-3 text-[#00897b] flex-shrink-0 mt-0.5" />
                    <span className="text-[11px] text-[#00897b] font-medium">{step.guarantee}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Livelli TrustGrade */}
      <div>
        <h3 className="text-lg font-bold text-[#1d1d1f] mb-1" style={{ fontFamily: SF }}>I livelli di certificazione TrustGrade</h3>
        <p className="text-sm text-[#6e6e73] mb-6">Il TrustGrade sintetizza il TrustScore in 5 livelli con implicazioni operative precise.</p>
        <div className="space-y-3">
          {GRADES.map(g => (
            <div key={g.grade} className="flex gap-4 p-4 rounded-xl border border-[#e5e5e5]" style={{ backgroundColor: g.bg }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border bg-white"
                style={{ borderColor: g.color + "40" }}>
                <span className="text-xl font-black" style={{ color: g.color }}>{g.grade}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold" style={{ color: g.color }}>{g.label}</span>
                  <span className="text-xs text-[#86868b]">TrustScore {g.range}</span>
                </div>
                <p className="text-xs text-[#6e6e73] leading-relaxed">{g.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Output */}
      <div>
        <h3 className="text-lg font-bold text-[#1d1d1f] mb-1" style={{ fontFamily: SF }}>Cosa ottieni per ogni articolo certificato</h3>
        <p className="text-sm text-[#6e6e73] mb-6">Ogni verifica produce 6 output distinti, ognuno con un utilizzo specifico.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {OUTPUTS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-3 p-4 rounded-xl border border-[#e5e5e5] bg-white">
              <div className="w-9 h-9 bg-[#f5f5f7] rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-[#1d1d1f]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1d1d1f] mb-0.5">{title}</p>
                <p className="text-xs text-[#6e6e73] leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
       </div>

      {/* Caso d'uso CSRD */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1.5px solid #e5e5e5" }}>
        <div className="px-6 py-4 flex items-center gap-3" style={{ background: "#f0fdf4", borderBottom: "1px solid #bbf7d0" }}>
          <div className="w-8 h-8 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M9 12l2 2 4-4"/><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div>
            <p className="text-sm font-black text-green-800" style={{ fontFamily: SF }}>Caso d'uso: CSRD / Non-Financial Disclosure</p>
            <p className="text-xs text-green-700">Come ProofPress Verify si applica alla verifica di claim ESG in un bilancio di sostenibilità</p>
          </div>
        </div>
        <div className="p-6 bg-white">
          <p className="text-sm text-[#3d3d3d] mb-5 leading-relaxed">
            Con l'entrata in vigore della <strong>CSRD (Corporate Sustainability Reporting Directive)</strong> e degli standard ESRS, le aziende quotate devono produrre centinaia di claim non-finanziari verificabili — emissioni, supply chain, diversity, sicurezza. Ogni claim deve essere difendibile in caso di contestazione da parte di autorità di vigilanza o in sede di assurance.
          </p>
          <p className="text-xs font-black uppercase tracking-widest text-[#6e6e73] mb-3">Esempio di claim estratto da un bilancio di sostenibilità</p>
          <div className="rounded-xl p-4 mb-5" style={{ background: "#f5f5f7", border: "1px solid #e5e5e5" }}>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#1d1d1f] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[9px] font-black text-white">C1</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1d1d1f] mb-1">"L'azienda ha ridotto le emissioni di CO₂ del 30% rispetto al 2022, raggiungendo 42.000 tonnellate di CO₂eq nel 2024."</p>
                <p className="text-[11px] text-[#6e6e73]">Tipo: statistica · Entità: emissioni CO₂, anno 2024 · Verificabile: sì</p>
              </div>
            </div>
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-[#6e6e73] mb-3">Cosa produce ProofPress Verify su questo claim</p>
          <div className="space-y-3 mb-5">
            {[
              { step: "1", label: "Hash SHA-256 al momento della pubblicazione", desc: "Prova crittografica che il claim, a quel timestamp, diceva esattamente questo — difendibile in caso di contestazione Consob o class action su comunicati price-sensitive.", ok: true },
              { step: "2", label: "Corroborazione multi-fonte", desc: "Il sistema cerca fonti primarie (report istituzionali, database pubblici, comunicati ufficiali) che confermino o contraddicano il dato. Restituisce confidence score e lista delle fonti analizzate.", ok: true },
              { step: "3", label: "Binding crittografico autore-contenuto", desc: "Il report sigilla autore, contenuto e timestamp in un unico hash immutabile archiviato su IPFS — audit trail regolatorio nativo, allineato AI Act e DSA.", ok: true },
              { step: "4", label: "TrustGrade del documento", desc: "Il documento riceve un Grade (A–F) che sintetizza la qualità della certificazione crittografica. Grade A = tutti i criteri soddisfatti, adatto per disclosure regolatori.", ok: true },
            ].map(({ step, label, desc, ok }) => (
              <div key={step} className="flex gap-3 p-4 rounded-xl" style={{ background: ok ? "#f0fdf4" : "#fef2f2", border: `1px solid ${ok ? "#bbf7d0" : "#fecaca"}` }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: ok ? "#16a34a" : "#dc2626" }}>
                  <span className="text-[9px] font-black text-white">{step}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-0.5" style={{ color: ok ? "#15803d" : "#b91c1c", fontFamily: SF }}>{label}</p>
                  <p className="text-xs leading-relaxed" style={{ color: ok ? "#166534" : "#991b1b" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-4" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
            <p className="text-xs font-black text-blue-800 mb-1" style={{ fontFamily: SF }}>Impatto operativo per un team di Audit & Assurance</p>
            <p className="text-xs text-blue-700 leading-relaxed">
              Un engagement CSRD su una FTSE MIB richiede la verifica manuale di 200–500 claim non-finanziari. Con ProofPress Verify, ogni claim viene processato in 4–8 secondi con audit trail crittografico nativo. Il revisore non viene sostituito — ottiene un motore per <strong>industrializzare l'assurance</strong> sui non-financial statement, riducendo il tempo di verifica e aumentando la difendibilità del report finale.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
// ─── TAB: Easy Start ─────────────────────────────────────────────────────────
export function TabEasyStart({ apiKeys }: { apiKeys: { keyPrefix: string }[] }) {
  const exampleKey = apiKeys?.[0]?.keyPrefix ?? "ppv_live_xxxx...";
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  function copyCode(step: number, code: string) {
    navigator.clipboard.writeText(code);
    setCopiedStep(step);
    setTimeout(() => setCopiedStep(null), 2000);
  }

  const STEPS = [
    {
      n: 1, icon: Key, color: "#3b82f6",
      title: "Ottieni la tua API Key",
      desc: "Vai alla tab API Keys e crea una nuova chiave. Salvala subito: viene mostrata una sola volta.",
      code: null as string | null,
      tip: "La chiave ha formato ppv_live_... — non condividerla mai pubblicamente.",
    },
    {
      n: 2, icon: Send, color: "#8b5cf6",
      title: "Invia il tuo primo articolo",
      desc: "Usa l'endpoint REST con l'URL dell'articolo o il testo diretto. Ricevi TrustScore e hash in risposta.",
      code: `curl -X POST https://proofpress.ai/api/verify/article \\\n  -H "Authorization: Bearer ${exampleKey}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"url": "https://tuosito.com/articolo"}'`,
      tip: "Puoi anche inviare il testo diretto con il campo 'content' invece di 'url'.",
    },
    {
      n: 3, icon: BarChart3, color: "#ec4899",
      title: "Leggi il TrustGrade",
      desc: "La risposta include TrustScore [0–100], TrustGrade (A–F) e il link al Verification Report pubblico.",
      code: `{\n  "trustScore": 87,\n  "trustGrade": "A",\n  "verifyHash": "sha256:abc123...",\n  "reportUrl": "https://proofpress.ai/verify/abc123..."\n}`,
      tip: "TrustGrade A o B = pronto per pubblicazione. C o inferiore = richiede revisione.",
    },
    {
      n: 4, icon: Globe, color: "#10b981",
      title: "Linka il report pubblico",
      desc: "Ogni articolo verificato ha una pagina pubblica accessibile tramite l'URL del report. Aggiungila come link 'Verificato con ProofPress' accanto all'articolo.",
      code: `<a href="https://proofpress.ai/verify/HASH" target="_blank"\n   rel="noopener noreferrer">\n  Verificato con ProofPress Verify\n</a>`,
      tip: "Sostituisci HASH con il verifyHash restituito dalla risposta API.",
    },
    {
      n: 5, icon: Database, color: "#00897b",
      title: "Il certificato è su IPFS",
      desc: "Entro 60 secondi dalla verifica, il report viene ancorato su IPFS. Il CID è permanente e verificabile da chiunque, per sempre.",
      code: `# Verifica il CID su qualsiasi gateway IPFS pubblico\ncurl https://ipfs.io/ipfs/<CID>\n# oppure\ncurl https://gateway.pinata.cloud/ipfs/<CID>`,
      tip: "Il certificato esiste indipendentemente da ProofPress. Non può essere rimosso.",
    },
  ];

  const INTEGRATIONS = [
    { name: "REST API", desc: "Integra ProofPress Verify in qualsiasi CMS o workflow editoriale tramite chiamate HTTP standard.", status: "Disponibile", color: "#1d1d1f" },
    { name: "WordPress", desc: "Plugin in sviluppo — integrazione nativa con l'editor Gutenberg.", status: "In roadmap", color: "#21759b" },
    { name: "Ghost CMS", desc: "Integrazione via webhook in roadmap — verifica automatica alla pubblicazione.", status: "In roadmap", color: "#15171a" },
    { name: "Zapier / Make", desc: "Connettore no-code in roadmap — trigger su nuova pubblicazione.", status: "In roadmap", color: "#ff4a00" },
  ];

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-[#f59e0b]" />
          <h3 className="text-lg font-bold text-[#1d1d1f]" style={{ fontFamily: SF }}>Easy Start — Operativo in 5 minuti</h3>
        </div>
        <p className="text-sm text-[#6e6e73]">Segui questi 5 passi per integrare ProofPress Verify nel tuo workflow editoriale.</p>
      </div>

      <div className="space-y-4">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.n} className="rounded-xl border border-[#e5e5e5] bg-white overflow-hidden">
              <div className="flex items-start gap-4 p-5">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: step.color + "15" }}>
                    <Icon className="w-5 h-5" style={{ color: step.color }} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-[#c7c7cc] uppercase tracking-widest">Passo {step.n}</span>
                  <h4 className="text-sm font-bold text-[#1d1d1f] mb-1 mt-0.5">{step.title}</h4>
                  <p className="text-xs text-[#6e6e73] leading-relaxed mb-3">{step.desc}</p>
                  {step.code && (
                    <div className="relative">
                      <pre className="bg-[#f5f5f7] rounded-xl p-4 text-xs font-mono text-[#1d1d1f] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                        {step.code}
                      </pre>
                      <Button variant="ghost" size="sm"
                        className="absolute top-2 right-2 h-6 px-2 text-xs"
                        onClick={() => copyCode(step.n, step.code!)}>
                        {copiedStep === step.n
                          ? <><CheckCircle className="w-3 h-3 text-green-600 mr-1" />Copiato</>
                          : <><Copy className="w-3 h-3 mr-1" />Copia</>}
                      </Button>
                    </div>
                  )}
                  <div className="flex items-start gap-1 mt-2">
                    <Sparkles className="w-3 h-3 text-[#f59e0b] flex-shrink-0 mt-0.5" />
                    <span className="text-[11px] text-[#6e6e73]">{step.tip}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <h3 className="text-base font-bold text-[#1d1d1f] mb-1" style={{ fontFamily: SF }}>Integrazioni disponibili</h3>
        <p className="text-sm text-[#6e6e73] mb-4">Connetti ProofPress Verify al tuo CMS preferito.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {INTEGRATIONS.map(({ name, desc, status, color }) => (
            <div key={name} className="flex items-start gap-3 p-4 rounded-xl border border-[#e5e5e5] bg-white">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + "15" }}>
                <Layers className="w-4 h-4" style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#1d1d1f]">{name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    status === "Disponibile" ? "bg-green-50 text-green-700" :
                    status === "Beta" ? "bg-blue-50 text-blue-700" :
                    "bg-gray-50 text-gray-500"
                  }`}>{status}</span>
                </div>
                <p className="text-xs text-[#86868b] mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Card className="border-[#e5e5e5] bg-[#f9f9f9]">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-[#6e6e73] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#1d1d1f] mb-1">Hai bisogno di aiuto?</p>
              <p className="text-xs text-[#6e6e73] mb-3">
                Per supporto e documentazione tecnica scrivi a{" "}
                <span className="font-mono">verify@proofpress.ai</span>.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="border-[#e5e5e5] text-xs" asChild>
                  <a href="https://proofpress.ai/methodology/v1" target="_blank" rel="noopener noreferrer">
                    Metodologia <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </Button>
                <Button size="sm" variant="outline" className="border-[#e5e5e5] text-xs" asChild>
                  <a href="mailto:verify@proofpress.ai">Contatta il supporto</a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── TAB: Scrivi & Pubblica ───────────────────────────────────────────────────
const SECTION_LABELS: Record<string, string> = {
  ai: "AI & Tech", music: "Music", startup: "Startup", finance: "Finance",
  health: "Health", sport: "Sport", luxury: "Luxury", news: "News",
  motori: "Motori", tennis: "Tennis", basket: "Basket", gossip: "Gossip",
  cybersecurity: "Cybersecurity", sondaggi: "Sondaggi", dealroom: "Dealroom",
};

type SectionValue = "ai" | "music" | "startup" | "finance" | "health" | "sport" | "luxury" | "news" | "motori" | "tennis" | "basket" | "gossip" | "cybersecurity" | "sondaggi" | "dealroom";

type PublishResult = {
  articleId: number;
  verifyHash: string;
  verifyUrl: string;
  message: string;
};

export function TabEditor() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [authorName, setAuthorName] = useState(user?.name ?? "");
  const [sourceUrl, setSourceUrl] = useState("");
  const [section, setSection] = useState<SectionValue>("ai");
  const [result, setResult] = useState<PublishResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const publishMutation = trpc.verifyClient.publishArticle.useMutation({
    onSuccess: (data) => {
      setResult(data);
      toast.success("Articolo inviato. Certificazione in elaborazione…");
    },
    onError: (err) => {
      toast.error("Errore: " + err.message);
    },
  });

  function handleSubmit() {
    if (!title.trim() || title.length < 5) { toast.error("Il titolo deve avere almeno 5 caratteri."); return; }
    if (!body.trim() || body.length < 50) { toast.error("Il corpo dell'articolo deve avere almeno 50 caratteri."); return; }
    if (!authorName.trim()) { toast.error("Inserisci il nome dell'autore."); return; }
    publishMutation.mutate({
      title: title.trim(),
      body: body.trim(),
      authorName: authorName.trim(),
      sourceUrl: sourceUrl.trim() || undefined,
      section,
    });
  }

  function copyText(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  function reset() {
    setTitle(""); setBody(""); setSourceUrl(""); setSection("ai"); setResult(null);
  }

  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <PenLine className="w-5 h-5 text-[#1d1d1f]" />
          <h3 className="text-lg font-bold text-[#1d1d1f]" style={{ fontFamily: SF }}>Scrivi &amp; Prova Verify</h3>
        </div>
        <p className="text-sm text-[#6e6e73]">
          Scrivi un testo, invialo e vedi in prima persona cosa produce la pipeline ProofPress Verify: hash SHA-256,
          TrustGrade e link alla pagina pubblica del report. Usa questa area per capire come funziona la certificazione
          prima di integrarla nel tuo workflow editoriale.
        </p>
      </div>

      {result ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-4 rounded-xl bg-green-50 border border-green-200">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800">Articolo inviato con successo</p>
              <p className="text-xs text-green-700 mt-0.5">{result.message}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-[#e5e5e5]">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-[#86868b] flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5" /> Hash SHA-256
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-[#1d1d1f] break-all flex-1">{result.verifyHash}</code>
                  <Button variant="ghost" size="sm" className="flex-shrink-0" onClick={() => copyText("hash", result.verifyHash)}>
                    {copied === "hash" ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-[11px] text-[#86868b] mt-2">Impronta digitale univoca del contenuto.</p>
              </CardContent>
            </Card>

            <Card className="border-[#e5e5e5]">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-[#86868b] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> ID Articolo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-[#1d1d1f]">#{result.articleId}</p>
                <p className="text-[11px] text-[#86868b] mt-2">Identificatore univoco nel database ProofPress.</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-[#e5e5e5]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-[#86868b] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> URL Verifica Pubblica
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <a href={result.verifyUrl} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-[#00897b] hover:underline font-mono flex-1 break-all">
                  {result.verifyUrl}
                </a>
                <div className="flex gap-1 flex-shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => copyText("url", result.verifyUrl)}>
                    {copied === "url" ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={result.verifyUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
              <p className="text-[11px] text-[#86868b] mt-2">
                Pagina pubblica con Verification Report completo. Condividila con lettori, redattori e revisori.
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#e5e5e5]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-[#86868b] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Stato pipeline certificazione
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { label: "Submission ricevuta", done: true },
                  { label: "Fingerprinting SHA-256", done: true },
                  { label: "Claim extraction (LLM)", done: false, active: true },
                  { label: "Corroborazione multi-fonte", done: false },
                  { label: "TrustScore & TrustGrade", done: false },
                  { label: "Sigillatura report", done: false },
                  { label: "IPFS Anchoring", done: false },
                ].map(({ label, done, active }) => (
                  <div key={label} className="flex items-center gap-2">
                    {done
                      ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      : active
                        ? <div className="w-4 h-4 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                        : <div className="w-4 h-4 rounded-full border-2 border-[#e5e5e5] flex-shrink-0" />}
                    <span className={`text-xs ${done ? "text-[#1d1d1f] font-medium" : active ? "text-[#1d1d1f]" : "text-[#c7c7cc]"}`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-[#86868b] mt-3">
                La certificazione completa richiede 30–60 secondi. Aggiorna la tab Verifiche per vedere il risultato.
              </p>
            </CardContent>
          </Card>

          <Button variant="outline" className="border-[#e5e5e5]" onClick={reset}>
            <RefreshCw className="w-4 h-4 mr-2" /> Scrivi un nuovo articolo
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="art-title" className="text-sm font-medium text-[#1d1d1f]">
              Titolo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="art-title"
              placeholder="Inserisci il titolo dell'articolo…"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="text-base border-[#e5e5e5] focus:border-[#1d1d1f]"
              maxLength={500}
            />
            <p className="text-[11px] text-[#86868b]">{title.length}/500 caratteri</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="art-body" className="text-sm font-medium text-[#1d1d1f]">
              Testo articolo <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="art-body"
              placeholder="Scrivi il testo completo dell'articolo. Minimo 50 caratteri. Più il testo è completo, più accurata sarà la verifica dei claim fattuali…"
              value={body}
              onChange={e => setBody(e.target.value)}
              className="w-full min-h-[280px] p-3 text-sm border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#1d1d1f] resize-y font-sans leading-relaxed text-[#1d1d1f] placeholder:text-[#c7c7cc] bg-white"
            />
            <div className="flex justify-between">
              <p className="text-[11px] text-[#86868b]">{wordCount} parole · {body.length} caratteri</p>
              {body.length < 50 && body.length > 0 && (
                <p className="text-[11px] text-amber-600">Minimo 50 caratteri richiesti</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="art-author" className="text-sm font-medium text-[#1d1d1f]">
                Nome autore <span className="text-red-500">*</span>
              </Label>
              <Input
                id="art-author"
                placeholder="Nome Cognome"
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                className="border-[#e5e5e5]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="art-section" className="text-sm font-medium text-[#1d1d1f]">Sezione</Label>
              <select
                id="art-section"
                value={section}
                onChange={e => setSection(e.target.value as SectionValue)}
                className="w-full h-10 px-3 text-sm border border-[#e5e5e5] rounded-md focus:outline-none focus:border-[#1d1d1f] bg-white text-[#1d1d1f]"
              >
                {Object.entries(SECTION_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="art-url" className="text-sm font-medium text-[#1d1d1f]">
              URL sorgente{" "}
              <span className="text-[#86868b] font-normal text-xs">(opzionale)</span>
            </Label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
              <Input
                id="art-url"
                placeholder="https://tuosito.com/articolo-originale"
                value={sourceUrl}
                onChange={e => setSourceUrl(e.target.value)}
                className="pl-9 border-[#e5e5e5]"
              />
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-[#f5f5f7] border border-[#e5e5e5]">
            <Shield className="w-5 h-5 text-[#6e6e73] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[#1d1d1f] mb-1">Cosa succede dopo l'invio</p>
              <p className="text-xs text-[#6e6e73] leading-relaxed">
                Il sistema calcola immediatamente l'hash SHA-256 del contenuto. In background avvia la pipeline di verifica
                (30–60 sec): estrazione claim, corroborazione multi-fonte, TrustScore, sigillatura e IPFS anchoring.
                L'articolo viene inviato alla redazione ProofPress per revisione editoriale prima della pubblicazione.
              </p>
            </div>
          </div>

          <Button
            className="w-full bg-[#1d1d1f] text-white hover:bg-[#333] h-12 text-sm font-semibold"
            onClick={handleSubmit}
            disabled={publishMutation.isPending}
          >
            {publishMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Invio in corso…
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Invia e prova ProofPress Verify
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── TAB: Post Pubblicati ─────────────────────────────────────────────────────
const GRADE_COLORS_MAP: Record<string, { bg: string; text: string; bar: string }> = {
  A: { bg: "#f0fdf4", text: "#16a34a", bar: "#22c55e" },
  B: { bg: "#eff6ff", text: "#2563eb", bar: "#3b82f6" },
  C: { bg: "#fefce8", text: "#ca8a04", bar: "#eab308" },
  D: { bg: "#fff7ed", text: "#ea580c", bar: "#f97316" },
  F: { bg: "#fef2f2", text: "#dc2626", bar: "#ef4444" },
};

function GradePill({ grade }: { grade: string | null }) {
  if (!grade) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[#f5f5f7] text-[#86868b] border border-[#e5e5e5]">
        <div className="w-1.5 h-1.5 rounded-full bg-[#c7c7cc] animate-pulse" />
        In elaborazione
      </span>
    );
  }
  const c = GRADE_COLORS_MAP[grade] ?? { bg: "#f5f5f7", text: "#1d1d1f", bar: "#1d1d1f" };
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border"
      style={{ backgroundColor: c.bg, color: c.text, borderColor: c.text + "30" }}>
      {grade}
    </span>
  );
}

export function TabMyPosts() {
  const [page, setPage] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const PAGE = 10;

  const { data, isLoading, refetch } = trpc.verifyClient.myPosts.useQuery(
    { limit: PAGE, offset: page * PAGE },
    { staleTime: 15_000 }
  );

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE);

  // Polling automatico ogni 15 secondi se ci sono articoli con TrustGrade null (pipeline in corso)
  const hasPending = rows.some(r => !r.trustGrade);
  useEffect(() => {
    if (!hasPending) return;
    const interval = setInterval(() => {
      refetch();
    }, 15_000);
    return () => clearInterval(interval);
  }, [hasPending, refetch]);

  function copyHash(hash: string) {
    navigator.clipboard.writeText(hash);
    setCopied(hash);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-[#1d1d1f]" />
            <h3 className="text-lg font-bold text-[#1d1d1f]" style={{ fontFamily: SF }}>Post Pubblicati</h3>
          </div>
          <p className="text-sm text-[#6e6e73]">
            Tutti gli articoli inviati tramite "Scrivi &amp; Prova Verify". Per ogni articolo trovi hash SHA-256, TrustGrade e link al report pubblico.
          </p>
        </div>
        <Button variant="outline" size="sm" className="border-[#e5e5e5] text-xs" onClick={() => refetch()}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Aggiorna
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-[#f5f5f7] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 bg-[#f5f5f7] rounded-2xl flex items-center justify-center mb-4">
            <PenLine className="w-6 h-6 text-[#c7c7cc]" />
          </div>
          <p className="text-sm font-semibold text-[#1d1d1f] mb-1">Nessun articolo ancora</p>
          <p className="text-xs text-[#86868b] max-w-xs">
            Usa la tab "Scrivi &amp; Prova Verify" per inviare il tuo primo articolo e vedere il TrustGrade assegnato dalla pipeline.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {rows.map((row) => {
              const verifyUrl = `https://proofpress.ai/verify/${row.verifyHash}`;
              const shortHash = row.verifyHash ? row.verifyHash.slice(0, 12) + "…" : "—";
              const dateStr = row.publishedAt
                ? new Date(row.publishedAt).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" })
                : "—";

              return (
                <div key={row.id} className="flex gap-4 p-4 rounded-xl border border-[#e5e5e5] bg-white hover:border-[#d0d0d0] transition-colors">
                  {/* Grade */}
                  <div className="flex-shrink-0 pt-0.5">
                    <GradePill grade={row.trustGrade ?? null} />
                  </div>

                  {/* Contenuto */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-[#1d1d1f] leading-snug line-clamp-2">{row.title}</h4>
                      <div className="flex gap-1.5 flex-shrink-0 items-center">
                        {/* Indicatore pipeline in corso */}
                        {!row.trustGrade && (
                          <span className="flex items-center gap-1 text-[10px] text-[#f59e0b] font-medium">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            In elaborazione
                          </span>
                        )}
                        {/* Link al report pubblico (solo se ha hash) */}
                        {row.verifyHash && (
                          <Link href={`/verify/${row.verifyHash}`}>
                            <button
                              className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg bg-[#f5f5f7] hover:bg-[#e5e5e5] transition-colors text-[#1d1d1f]"
                              title="Vai al report completo">
                              <ExternalLink className="w-3 h-3" />
                              Report
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>

                    {row.summary && (
                      <p className="text-xs text-[#86868b] mt-1 line-clamp-1">{row.summary}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      {/* Hash */}
                      <button
                        onClick={() => copyHash(row.verifyHash ?? "")}
                        className="flex items-center gap-1 text-[11px] font-mono text-[#6e6e73] hover:text-[#1d1d1f] transition-colors"
                        title="Copia hash SHA-256 completo"
                      >
                        <Hash className="w-3 h-3" />
                        {shortHash}
                        {copied === row.verifyHash
                          ? <CheckCircle className="w-3 h-3 text-green-600" />
                          : <Copy className="w-3 h-3 opacity-50" />}
                      </button>

                      {/* IPFS — apre la pagina report /verify/:cid */}
                      {row.ipfsCid && (
                        <Link href={`/verify/${row.ipfsCid}`}>
                          <span className="flex items-center gap-1 text-[11px] text-[#00897b] hover:underline cursor-pointer">
                            <Database className="w-3 h-3" />
                            IPFS
                          </span>
                        </Link>
                      )}

                      {/* TrustScore */}
                      {row.trustScore !== null && row.trustScore !== undefined && (
                        <span className="text-[11px] text-[#6e6e73]">
                          Score: <span className="font-semibold text-[#1d1d1f]">{row.trustScore}</span>/100
                        </span>
                      )}

                      {/* Sezione */}
                      {row.section && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#f5f5f7] text-[#6e6e73] uppercase tracking-wider">
                          {row.section}
                        </span>
                      )}

                      {/* Data */}
                      <span className="text-[11px] text-[#c7c7cc] ml-auto">{dateStr}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Paginazione */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-[#86868b]">
                {page * PAGE + 1}–{Math.min((page + 1) * PAGE, total)} di {total} articoli
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-[#e5e5e5] text-xs"
                  disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                  ← Precedente
                </Button>
                <Button variant="outline" size="sm" className="border-[#e5e5e5] text-xs"
                  disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                  Successivo →
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
