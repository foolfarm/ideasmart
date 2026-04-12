/**
 * Script di pubblicazione programmata del post Deloitte Tech Trends 2026
 * Pubblicazione: 13 aprile 2026 alle 9:30 CET
 */
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
const LINKEDIN_AUTHOR_URN = process.env.LINKEDIN_AUTHOR_URN;

if (!LINKEDIN_ACCESS_TOKEN || !LINKEDIN_AUTHOR_URN) {
  console.error("[Deloitte Post] Credenziali LinkedIn mancanti");
  process.exit(1);
}

// Leggi il testo del post approvato
const postText = fs.readFileSync(
  path.join(__dirname, "scheduled-post-deloitte.txt"),
  "utf-8"
).trim();

console.log("[Deloitte Post] Pubblicazione post su LinkedIn...");
console.log("[Deloitte Post] Caratteri:", postText.length);

const payload = {
  author: LINKEDIN_AUTHOR_URN,
  lifecycleState: "PUBLISHED",
  specificContent: {
    "com.linkedin.ugc.ShareContent": {
      shareCommentary: {
        text: postText,
      },
      shareMediaCategory: "NONE",
    },
  },
  visibility: {
    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
  },
};

const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
    "X-Restli-Protocol-Version": "2.0.0",
  },
  body: JSON.stringify(payload),
});

if (!response.ok) {
  const errorText = await response.text();
  console.error("[Deloitte Post] Errore LinkedIn API:", response.status, errorText);
  process.exit(1);
}

const result = await response.json();
const postId = result.id || result["id"] || "unknown";
const linkedinUrl = `https://www.linkedin.com/feed/update/${postId}/`;

console.log("[Deloitte Post] Post pubblicato con successo!");
console.log("[Deloitte Post] ID:", postId);
console.log("[Deloitte Post] URL:", linkedinUrl);
