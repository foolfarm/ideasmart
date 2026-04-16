/**
 * ProofPress Verify — Corroborator TypeScript
 *
 * Step 3: Corroboration multi-source
 *   - DuckDuckGo HTML search (gratuito, no API key)
 *   - Google Fact Check Tools API (gratuito, 10.000 req/giorno)
 *
 * Step 4: Stance detection via Claude Haiku (temperature=0)
 *
 * Credibility scoring basato su dominio (semplificato rispetto al dataset MBFC):
 *   - Tier 1 (9-10): reuters.com, apnews.com, bbc.com, corriere.it, sole24ore.com
 *   - Tier 2 (7-8): theguardian.com, nytimes.com, repubblica.it, ansa.it
 *   - Tier 3 (5-6): altri media noti
 *   - Default (4): sorgente sconosciuta
 */

import Anthropic from "@anthropic-ai/sdk";
import type { Claim, CorroborationResult, EvidenceItem, FactCheckHit, StanceType } from "./verifyEngine.js";

// ── Config ────────────────────────────────────────────────────────────────────

const DDGO_SEARCH_URL = "https://html.duckduckgo.com/html/";
const GOOGLE_FACTCHECK_URL = "https://factchecktools.googleapis.com/v1alpha1/claims:search";
const MAX_SOURCES_PER_CLAIM = 3;
const STANCE_MAX_TOKENS = 50;

// Credibility tiers (score 0-10)
const CREDIBILITY_MAP: Record<string, number> = {
  "reuters.com": 9.5,
  "apnews.com": 9.5,
  "bbc.com": 9.0,
  "bbc.co.uk": 9.0,
  "corriere.it": 8.5,
  "sole24ore.com": 8.5,
  "ilsole24ore.com": 8.5,
  "ansa.it": 8.5,
  "theguardian.com": 8.0,
  "nytimes.com": 8.0,
  "repubblica.it": 8.0,
  "stampa.it": 7.5,
  "lastampa.it": 7.5,
  "wired.it": 7.5,
  "wired.com": 7.5,
  "techcrunch.com": 7.0,
  "bloomberg.com": 8.0,
  "ft.com": 8.5,
  "economist.com": 8.5,
  "nature.com": 9.0,
  "science.org": 9.0,
  "pubmed.ncbi.nlm.nih.gov": 9.5,
};

function getDomainCredibility(domain: string): number {
  // Cerca corrispondenza esatta o parziale
  for (const [key, score] of Object.entries(CREDIBILITY_MAP)) {
    if (domain.includes(key) || key.includes(domain)) return score;
  }
  return 4.0; // default per sorgenti sconosciute
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

// ── DuckDuckGo search ─────────────────────────────────────────────────────────

interface SearchResult {
  url: string;
  title: string;
  snippet: string;
}

async function searchDuckDuckGo(query: string, maxResults = MAX_SOURCES_PER_CLAIM): Promise<SearchResult[]> {
  try {
    const params = new URLSearchParams({ q: query, kl: "it-it" });
    const response = await fetch(DDGO_SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "ProofPressVerify/1.0 (https://proofpress.ai/verify; verification@proofpress.ai)",
        "Accept": "text/html",
      },
      body: params.toString(),
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) return [];

    const html = await response.text();
    const results: SearchResult[] = [];

    // Parsing HTML semplice con regex (no DOM parser lato server)
    const resultRegex = /<a[^>]+class="result__a"[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/g;
    const snippetRegex = /<a[^>]+class="result__snippet"[^>]*>([^<]*)<\/a>/g;

    const links: Array<{ url: string; title: string }> = [];
    let match;
    while ((match = resultRegex.exec(html)) !== null) {
      let url = match[1];
      const title = match[2].trim();
      // DuckDuckGo wraps URLs — estrai URL reale
      if (url.includes("uddg=")) {
        try {
          const parsed = new URL("https://duckduckgo.com" + url);
          url = decodeURIComponent(parsed.searchParams.get("uddg") ?? url);
        } catch {
          // usa url originale
        }
      }
      if (url.startsWith("http")) links.push({ url, title });
    }

    const snippets: string[] = [];
    while ((match = snippetRegex.exec(html)) !== null) {
      snippets.push(match[1].trim());
    }

    for (let i = 0; i < Math.min(links.length, maxResults); i++) {
      results.push({
        url: links[i].url,
        title: links[i].title,
        snippet: snippets[i] ?? "",
      });
    }

    return results;
  } catch (err) {
    console.warn(`[Corroborator] DuckDuckGo search error:`, err);
    return [];
  }
}

// ── Google Fact Check Tools API ───────────────────────────────────────────────

async function searchGoogleFactCheck(
  claimText: string,
  claimId: string
): Promise<FactCheckHit[]> {
  const apiKey = process.env.GOOGLE_FACTCHECK_API_KEY;
  if (!apiKey) return []; // graceful degradation se non configurato

  try {
    const url = new URL(GOOGLE_FACTCHECK_URL);
    url.searchParams.set("query", claimText.substring(0, 200));
    url.searchParams.set("key", apiKey);
    url.searchParams.set("languageCode", "it");
    url.searchParams.set("pageSize", "3");

    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) return [];

    const data = await response.json() as {
      claims?: Array<{
        claimReview?: Array<{
          publisher?: { name?: string; site?: string };
          url?: string;
          textualRating?: string;
          reviewDate?: string;
        }>;
      }>;
    };

    const hits: FactCheckHit[] = [];
    for (const claim of data.claims ?? []) {
      for (const review of claim.claimReview ?? []) {
        hits.push({
          claim_id: claimId,
          publisher: review.publisher?.name ?? review.publisher?.site ?? "Unknown",
          rating: review.textualRating ?? "Unknown",
          url: review.url ?? "",
          checked_at: review.reviewDate ?? new Date().toISOString(),
        });
      }
    }

    return hits;
  } catch (err) {
    console.warn(`[Corroborator] Google Fact Check error:`, err);
    return [];
  }
}

// ── Stance detection via Claude Haiku ────────────────────────────────────────

let _anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!_anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY non configurato");
    _anthropicClient = new Anthropic({ apiKey });
  }
  return _anthropicClient;
}

async function detectStance(claimText: string, snippet: string): Promise<StanceType> {
  if (!snippet || snippet.trim().length < 20) return "unrelated";
  if (!process.env.ANTHROPIC_API_KEY) return "neutral";

  try {
    const client = getAnthropicClient();
    const prompt = `Does this snippet CONFIRM, CONTRADICT, or is NEUTRAL/UNRELATED to the claim?

CLAIM: "${claimText}"
SNIPPET: "${snippet.substring(0, 300)}"

Reply with exactly one word: confirms | contradicts | neutral | unrelated`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: STANCE_MAX_TOKENS,
      temperature: 0,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text"
      ? response.content[0].text.toLowerCase().trim()
      : "neutral";

    if (text.includes("confirms")) return "confirms";
    if (text.includes("contradicts")) return "contradicts";
    if (text.includes("unrelated")) return "unrelated";
    return "neutral";
  } catch {
    return "neutral";
  }
}

// ── Corroboration principale ──────────────────────────────────────────────────

function determineStatus(
  sourcesChecked: number,
  sourcesConfirming: number,
  sourcesContradicting: number
): import("./verifyEngine.js").ClaimStatus {
  if (sourcesChecked === 0) return "UNVERIFIED";
  const ratio = sourcesConfirming / sourcesChecked;
  if (sourcesContradicting > sourcesConfirming) return "CONTESTED";
  if (ratio >= 0.7) return "CORROBORATED";
  if (ratio >= 0.3) return "PARTIALLY_CORROBORATED";
  return "UNVERIFIED";
}

export async function corroborateClaims(claims: Claim[]): Promise<{
  results: CorroborationResult[];
  factcheckHits: FactCheckHit[];
}> {
  const results: CorroborationResult[] = [];
  const allFactcheckHits: FactCheckHit[] = [];

  for (const claim of claims) {
    const evidence: EvidenceItem[] = [];
    let sourcesChecked = 0;
    let sourcesConfirming = 0;
    let sourcesContradicting = 0;
    let sourcesNeutral = 0;
    let totalCredibility = 0;

    // Ricerca DuckDuckGo
    const searchResults = await searchDuckDuckGo(
      `${claim.text} ${claim.entities.slice(0, 2).join(" ")}`,
      MAX_SOURCES_PER_CLAIM
    );

    // Fact Check Google (in parallelo con DDGo)
    const factcheckHits = await searchGoogleFactCheck(claim.text, claim.claim_id);
    allFactcheckHits.push(...factcheckHits);

    // Analisi stance per ogni risultato DDGo
    for (const result of searchResults) {
      const domain = extractDomain(result.url);
      const credibility = getDomainCredibility(domain);
      const stance = await detectStance(claim.text, result.snippet);

      evidence.push({
        url: result.url,
        domain,
        credibility,
        stance,
        publisher: domain,
        snippet: result.snippet,
      });

      sourcesChecked++;
      totalCredibility += credibility;

      if (stance === "confirms") sourcesConfirming++;
      else if (stance === "contradicts") sourcesContradicting++;
      else sourcesNeutral++;
    }

    // Aggiungi hit da Google Fact Check come evidence aggiuntiva
    for (const hit of factcheckHits) {
      if (hit.url) {
        const domain = extractDomain(hit.url);
        const credibility = getDomainCredibility(domain);
        // Rating positivi: "True", "Mostly True", "Vero", ecc.
        const positiveRatings = ["true", "mostly true", "vero", "corretto", "accurate"];
        const negativeRatings = ["false", "mostly false", "falso", "errato", "inaccurate", "misleading"];
        const ratingLower = hit.rating.toLowerCase();
        const stance: StanceType = positiveRatings.some(r => ratingLower.includes(r))
          ? "confirms"
          : negativeRatings.some(r => ratingLower.includes(r))
          ? "contradicts"
          : "neutral";

        evidence.push({
          url: hit.url,
          domain,
          credibility,
          stance,
          publisher: hit.publisher,
          snippet: `Fact-check rating: ${hit.rating}`,
        });

        sourcesChecked++;
        totalCredibility += credibility;
        if (stance === "confirms") sourcesConfirming++;
        else if (stance === "contradicts") sourcesContradicting++;
        else sourcesNeutral++;
      }
    }

    const avgCredibility = sourcesChecked > 0 ? totalCredibility / sourcesChecked : 0;

    // Independence score: penalizza se tutte le sorgenti sono dello stesso dominio
    const uniqueDomains = new Set(evidence.map(e => e.domain)).size;
    const independenceScore = sourcesChecked > 0
      ? Math.min(1.0, uniqueDomains / sourcesChecked)
      : 0;

    const confidence = sourcesChecked > 0
      ? Math.min(1.0, sourcesChecked / MAX_SOURCES_PER_CLAIM)
      : 0;

    results.push({
      claim_id: claim.claim_id,
      sources_checked: sourcesChecked,
      sources_confirming: sourcesConfirming,
      sources_contradicting: sourcesContradicting,
      sources_neutral: sourcesNeutral,
      avg_credibility: Math.round(avgCredibility * 100) / 100,
      independence_score: Math.round(independenceScore * 100) / 100,
      evidence,
      confidence: Math.round(confidence * 100) / 100,
      status: determineStatus(sourcesChecked, sourcesConfirming, sourcesContradicting),
    });
  }

  return { results, factcheckHits: allFactcheckHits };
}
