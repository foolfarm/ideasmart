/**
 * ProofPress Verify Client — Integrazione con API esterna proofpressverify.com
 *
 * Questo modulo sostituisce il verifyEngine interno (che usava Claude Haiku
 * per l'estrazione dei claim) con la chiamata all'API esterna certificata.
 *
 * API endpoint: POST https://proofpressverify.com/api/v1/verify
 * Autenticazione: Bearer ppv_...
 *
 * Struttura risposta:
 *   {
 *     cached: bool,
 *     hash: string (SHA-256),
 *     document_id: number,
 *     ipfs_cid: string,
 *     ipfs_url: string,
 *     trust_grade: "A"|"B"|"C"|"D"|"F",
 *     trust_score: number (0-1),
 *     report: {
 *       report_version, report_id, product_type, generated_at,
 *       article: { title, language, word_count, content_hash_sha256, url },
 *       claims: [], corroboration: [], factcheck_hits: [],
 *       factcheck_count, factcheck_sources,
 *       trust_score: { overall, grade, methodology_url },
 *       processing_time_seconds
 *     }
 *   }
 */

const PPV_API_BASE = "https://proofpressverify.com/api/v1";
const PPV_API_KEY = process.env.PPV_API_KEY ?? "ppv_9aabe475925174e346d4ed1ad548085e";
const PPV_TIMEOUT_MS = 30_000; // 30 secondi (l'API impiega 3-8s per articolo)

// ── Tipi risposta API ─────────────────────────────────────────────────────────

export interface PpvArticleInfo {
  title: string;
  language: string;
  word_count: number;
  content_hash_sha256: string;
  url?: string;
}

export interface PpvTrustScore {
  overall: number;
  grade: "A" | "B" | "C" | "D" | "F";
  methodology_url: string;
}

export interface PpvReport {
  report_version: string;
  report_id: string;
  product_type: string;
  generated_at: string;
  article: PpvArticleInfo;
  claims: unknown[];
  corroboration: unknown[];
  factcheck_hits: unknown[];
  factcheck_count: number;
  factcheck_sources: string[];
  trust_score: PpvTrustScore;
  processing_time_seconds: number;
}

export interface PpvVerifyResponse {
  cached: boolean;
  hash: string;
  document_id: number;
  ipfs_cid: string;
  ipfs_url: string;
  trust_grade: "A" | "B" | "C" | "D" | "F";
  trust_score: number;
  report: PpvReport;
}

// ── Client principale ─────────────────────────────────────────────────────────

/**
 * Certifica un articolo tramite l'API esterna ProofPress Verify.
 * Restituisce il report completo con hash, IPFS CID, trust score e grade.
 *
 * @param params.title - Titolo dell'articolo
 * @param params.content - Testo completo o sommario dell'articolo
 * @param params.sourceUrl - URL sorgente dell'articolo (opzionale)
 * @param params.productType - Tipo di prodotto (default: "news_verify")
 * @returns PpvVerifyResponse | null (null in caso di errore non critico)
 */
export async function certifyWithPpv(params: {
  title: string;
  content: string;
  sourceUrl?: string | null;
  productType?: "news_verify" | "info_verify" | "email_verify";
}): Promise<PpvVerifyResponse | null> {
  const { title, content, sourceUrl, productType = "news_verify" } = params;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PPV_TIMEOUT_MS);

  try {
    const body = {
      product_type: productType,
      title,
      content,
      ...(sourceUrl ? { source_url: sourceUrl } : {}),
    };

    const response = await fetch(`${PPV_API_BASE}/verify`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PPV_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error(`[PpvClient] API error ${response.status}: ${errText.substring(0, 200)}`);
      return null;
    }

    const data = await response.json() as PpvVerifyResponse;

    // Normalizza trust_score: l'API a volte restituisce 55 invece di 0.55
    if (data.trust_score > 1) {
      data.trust_score = data.trust_score / 100;
    }

    console.log(
      `[PpvClient] ✅ Certificato: ${title.substring(0, 50)} | ` +
      `grade=${data.trust_grade} score=${data.trust_score.toFixed(2)} | ` +
      `cached=${data.cached} | doc_id=${data.document_id} | ` +
      `ipfs=${data.ipfs_cid.substring(0, 20)}…`
    );

    return data;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError") {
      console.warn(`[PpvClient] ⏱ Timeout (${PPV_TIMEOUT_MS / 1000}s) per: ${title.substring(0, 50)}`);
    } else {
      console.error(`[PpvClient] Errore inatteso:`, err);
    }
    return null;
  }
}

/**
 * Verifica lo stato dell'API ProofPress Verify.
 * Restituisce true se l'API è operativa.
 */
export async function checkPpvStatus(): Promise<{
  operational: boolean;
  version?: string;
  products?: string[];
}> {
  try {
    const response = await fetch(`${PPV_API_BASE}/status`, {
      headers: { "Authorization": `Bearer ${PPV_API_KEY}` },
    });
    if (!response.ok) return { operational: false };
    const data = await response.json() as { status: string; version: string; products: string[] };
    return {
      operational: data.status === "operational",
      version: data.version,
      products: data.products,
    };
  } catch {
    return { operational: false };
  }
}
