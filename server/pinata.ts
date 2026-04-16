/**
 * PINATA IPFS — Modulo di pinning per ProofPress Verify
 *
 * Ogni articolo certificato viene ancorato su IPFS via Pinata.
 * Il Verification Report (JSON strutturato) viene pinnato come file JSON,
 * restituendo un CID immutabile che certifica il contenuto in modo trustless.
 *
 * Documentazione: https://docs.pinata.cloud/quickstart
 */

const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs";

export interface VerificationReport {
  /** Versione del protocollo ProofPress Verify */
  protocol: "ProofPress-Verify-v1";
  /** Timestamp ISO 8601 del pinning */
  pinnedAt: string;
  /** Hash SHA-256 dell'articolo (certifica il contenuto) */
  verifyHash: string;
  /** Metadati dell'articolo */
  article: {
    id: number;
    title: string;
    summary: string;
    section: string;
    sourceName?: string | null;
    sourceUrl?: string | null;
    publishedAt?: string | null;
    category: string;
    weekLabel: string;
  };
  /** Firma del sistema ProofPress */
  issuer: "ProofPress Magazine — proofpress.ai";
  /** Nota legale */
  disclaimer: "Questo report è generato automaticamente da ProofPress Verify. Il CID IPFS garantisce l'immutabilità del contenuto certificato.";
}

/**
 * Pinna un Verification Report su IPFS via Pinata.
 * Restituisce il CID e l'URL del gateway pubblico.
 */
export async function pinVerificationReport(
  report: Omit<VerificationReport, "protocol" | "pinnedAt" | "issuer" | "disclaimer">
): Promise<{ cid: string; ipfsUrl: string }> {
  if (!PINATA_JWT) {
    throw new Error("PINATA_JWT non configurato");
  }

  const fullReport: VerificationReport = {
    protocol: "ProofPress-Verify-v1",
    pinnedAt: new Date().toISOString(),
    issuer: "ProofPress Magazine — proofpress.ai",
    disclaimer:
      "Questo report è generato automaticamente da ProofPress Verify. Il CID IPFS garantisce l'immutabilità del contenuto certificato.",
    ...report,
  };

  // Crea il blob JSON da pinnare
  const jsonContent = JSON.stringify(fullReport, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });

  // Nome file: proofpress-verify-<prime 16 char hash>.json
  const shortHash = report.verifyHash.substring(0, 16).toUpperCase();
  const fileName = `proofpress-verify-${shortHash}.json`;

  // FormData per l'upload su Pinata
  const formData = new FormData();
  formData.append("file", blob, fileName);

  // Metadata Pinata: nome e keyvalues per ricerca
  const metadata = JSON.stringify({
    name: `ProofPress Verify — ${report.article.title.substring(0, 80)}`,
    keyvalues: {
      verifyHash: report.verifyHash,
      articleId: String(report.article.id),
      section: report.article.section,
      protocol: "ProofPress-Verify-v1",
    },
  });
  formData.append("pinataMetadata", metadata);

  // Opzioni: pin in entrambe le regioni (FRA1 + NYC1)
  const options = JSON.stringify({
    cidVersion: 1,
  });
  formData.append("pinataOptions", options);

  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pinata API error ${response.status}: ${errorText}`);
  }

  const result = await response.json() as { IpfsHash: string; PinSize: number; Timestamp: string };
  const cid = result.IpfsHash;
  const ipfsUrl = `${PINATA_GATEWAY}/${cid}`;

  return { cid, ipfsUrl };
}

/**
 * Recupera un Verification Report da IPFS tramite CID.
 * Utile per la verifica trustless lato client.
 */
export async function fetchVerificationReport(cid: string): Promise<VerificationReport | null> {
  try {
    const url = `${PINATA_GATEWAY}/${cid}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return null;
    return await res.json() as VerificationReport;
  } catch {
    return null;
  }
}
