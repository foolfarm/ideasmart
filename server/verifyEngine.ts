/**
 * ProofPress Verify Engine — TypeScript port del microservizio Python
 *
 * Pipeline 4-step (integrata nell'infrastruttura ideasmart esistente):
 *   Step 1: SHA-256 hashing (già in verify.ts — riusato)
 *   Step 2: Claim extraction via Claude Haiku (ANTHROPIC_API_KEY da env)
 *   Step 3: Corroboration via DuckDuckGo + Google Fact Check (in corroborator.ts)
 *   Step 4: Trust scoring (formula pesata identica al Python)
 *
 * Il sealing IPFS via Pinata è già implementato in pinata.ts — viene chiamato
 * dopo il trust scoring per aggiornare il VerificationReport con i dati del pipeline.
 *
 * Budget: ~$0.003/articolo (Claude Haiku, ~500-1500 parole)
 * Latenza: 5-15s per articolo (claim extraction + corroboration)
 */

import Anthropic from "@anthropic-ai/sdk";

// ── Tipi ──────────────────────────────────────────────────────────────────────

export type ClaimType = "factual_event" | "statistic" | "quote" | "attribution" | "causal";
export type ClaimStatus = "CORROBORATED" | "PARTIALLY_CORROBORATED" | "UNVERIFIED" | "CONTESTED" | "FALSE";
export type TrustGrade = "A" | "B" | "C" | "D" | "F";
export type StanceType = "confirms" | "contradicts" | "neutral" | "unrelated";

export interface Claim {
  claim_id: string;
  text: string;
  type: ClaimType;
  entities: string[];
  verifiable: boolean;
}

export interface EvidenceItem {
  url: string;
  domain: string;
  credibility: number; // 0-10
  stance: StanceType;
  publisher: string;
  snippet?: string;
}

export interface CorroborationResult {
  claim_id: string;
  sources_checked: number;
  sources_confirming: number;
  sources_contradicting: number;
  sources_neutral: number;
  avg_credibility: number;
  independence_score: number;
  evidence: EvidenceItem[];
  confidence: number;
  status: ClaimStatus;
}

export interface FactCheckHit {
  claim_id: string;
  publisher: string;
  rating: string;
  url: string;
  checked_at: string;
}

export interface TrustScore {
  overall: number;
  grade: TrustGrade;
  methodology_url: string;
}

export interface FullVerificationReport {
  report_version: string;
  report_id: string;
  generated_at: string;
  article: {
    title: string;
    language: string;
    word_count: number;
    content_hash_sha256: string;
    url?: string | null;
  };
  claims: Claim[];
  corroboration: CorroborationResult[];
  factcheck_hits: FactCheckHit[];
  trust_score: TrustScore;
  processing_time_seconds: number;
}

// ── Config ────────────────────────────────────────────────────────────────────

const CLAUDE_MODEL = "claude-haiku-4-5-20251001";
const CLAIM_MAX_TOKENS = 2000;
const MAX_CLAIMS = 8; // limite per contenere i costi
const MAX_RETRIES = 3;

// ── Anthropic client ──────────────────────────────────────────────────────────

let _anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!_anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY non configurato");
    _anthropicClient = new Anthropic({ apiKey });
  }
  return _anthropicClient;
}

// ── Step 2: Claim Extraction ──────────────────────────────────────────────────

const CLAIM_EXTRACTION_PROMPT = `You are a claim extraction system for journalism verification.
Given the article below, extract ONLY verifiable factual claims:
- events that happened (who/what/when/where)
- statistics and numerical data
- direct or indirect quotes
- attributions (X said Y, X did Z)
- causal relations claimed as fact

EXCLUDE:
- opinions, judgments, subjective assessments
- predictions about future events
- rhetorical questions
- vague qualitative descriptions

Return a JSON array (max ${MAX_CLAIMS} claims) with this schema:
[
  {
    "claim_id": "c1",
    "text": "exact claim text",
    "type": "factual_event|statistic|quote|attribution|causal",
    "entities": ["entity1", "entity2"],
    "verifiable": true
  }
]
Return ONLY the JSON array, no explanation.`;

async function extractClaimsWithRetry(
  title: string,
  summary: string,
  attempt = 1
): Promise<Claim[]> {
  try {
    const client = getAnthropicClient();
    const articleText = `TITLE: ${title}\n\nCONTENT: ${summary}`;

    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: CLAIM_MAX_TOKENS,
      temperature: 0,
      messages: [
        { role: "user", content: `${CLAIM_EXTRACTION_PROMPT}\n\nARTICLE:\n${articleText}` },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") return [];

    // Estrai JSON dall'output (può avere testo prima/dopo)
    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const claims = JSON.parse(jsonMatch[0]) as Claim[];
    return claims.filter((c) => c.verifiable !== false).slice(0, MAX_CLAIMS);
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      const delay = Math.pow(2, attempt) * 1000; // exponential backoff: 2s, 4s
      await new Promise((r) => setTimeout(r, delay));
      return extractClaimsWithRetry(title, summary, attempt + 1);
    }
    console.error(`[VerifyEngine] Claim extraction failed after ${MAX_RETRIES} attempts:`, err);
    return [];
  }
}

// ── Step 4: Trust Scoring ─────────────────────────────────────────────────────

function computeGrade(score: number): TrustGrade {
  if (score >= 0.85) return "A";
  if (score >= 0.70) return "B";
  if (score >= 0.55) return "C";
  if (score >= 0.40) return "D";
  return "F";
}

export function computeTrustScore(corroborationResults: CorroborationResult[]): TrustScore {
  if (corroborationResults.length === 0) {
    return {
      overall: 0.55,
      grade: "C",
      methodology_url: "https://proofpress.ai/methodology/v1",
    };
  }

  const totalChecked = corroborationResults.reduce((s, r) => s + r.sources_checked, 0);
  const totalConfirming = corroborationResults.reduce((s, r) => s + r.sources_confirming, 0);
  const corroborationRatio = totalChecked > 0 ? totalConfirming / totalChecked : 0;

  const weightedCredSum = corroborationResults.reduce(
    (s, r) => s + r.avg_credibility * r.sources_checked,
    0
  );
  const avgCredibility = totalChecked > 0 ? weightedCredSum / totalChecked : 5.0;

  const avgIndependence =
    corroborationResults.reduce((s, r) => s + r.independence_score, 0) /
    corroborationResults.length;

  // Formula: 0.55 * corroboration + 0.30 * (credibility/10) + 0.15 * independence
  const raw =
    0.55 * corroborationRatio +
    0.30 * (avgCredibility / 10.0) +
    0.15 * avgIndependence;

  const overall = Math.round(Math.max(0, Math.min(1, raw)) * 1000) / 1000;

  return {
    overall,
    grade: computeGrade(overall),
    methodology_url: "https://proofpress.ai/methodology/v1",
  };
}

// ── Pipeline principale ───────────────────────────────────────────────────────

export async function runVerifyPipeline(params: {
  articleId: number;
  title: string;
  summary: string;
  sourceUrl?: string | null;
  verifyHash: string;
  corroborationFn: (claims: Claim[]) => Promise<{
    results: CorroborationResult[];
    factcheckHits: FactCheckHit[];
  }>;
}): Promise<FullVerificationReport> {
  const startTime = Date.now();
  const { title, summary, sourceUrl, verifyHash, corroborationFn } = params;

  // Step 2: Estrai claim
  const claims = await extractClaimsWithRetry(title, summary);

  // Step 3: Corrobora (delegato a corroborator.ts)
  const { results: corroboration, factcheckHits } = await corroborationFn(claims);

  // Step 4: Trust score
  const trustScore = computeTrustScore(corroboration);

  const report: FullVerificationReport = {
    report_version: "1.0.0",
    report_id: `pp-${verifyHash.substring(0, 16)}`,
    generated_at: new Date().toISOString(),
    article: {
      title,
      language: "it",
      word_count: summary.split(/\s+/).length,
      content_hash_sha256: verifyHash,
      url: sourceUrl ?? null,
    },
    claims,
    corroboration,
    factcheck_hits: factcheckHits,
    trust_score: trustScore,
    processing_time_seconds: (Date.now() - startTime) / 1000,
  };

  return report;
}
