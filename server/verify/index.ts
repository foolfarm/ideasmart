/**
 * ProofPress Verify SaaS — Barrel Export
 *
 * Punto di ingresso unico per il modulo B2B Verify.
 * Importa da qui in routers.ts per mantenere l'isolamento.
 */
export { verifyOrgRouter } from "./orgRouter";
export { verifyApiKeyRouter } from "./apiKeyRouter";
export { verifyUsageRouter } from "./usageRouter";
export { validateApiKey } from "./apiKeyRouter";
export { incrementArticleUsage } from "./usageRouter";
