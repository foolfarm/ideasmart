/**
 * DEALROOM Scheduler — DEALROOM News by Proof Press
 * Genera contenuti editoriali per la sezione /dealroom: editoriale settimanale sui deal più rilevanti.
 * Focus: round di finanziamento, venture capital, M&A, exit, ecosistema startup italiano ed europeo.
 */
import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { dailyEditorial } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { findEditorialImage } from "./stockImages";

// ─── Genera Editoriale DEALROOM (settimanale, venerdì) ────────────────────────
export async function generateDealroomEditorial(): Promise<void> {
  console.log("[DealroomScheduler] Generating DEALROOM editorial...");
  try {
    const today = new Date().toLocaleDateString("it-IT", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    const dateLabel = new Date().toISOString().split("T")[0];

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Sei il direttore editoriale di DEALROOM by Proof Press, la sezione dedicata ai round di finanziamento, investimenti venture capital, M&A ed exit dell'ecosistema startup. Scrivi editoriali profondi e autorevoli con dati, cifre e analisi concrete. Tono professionale, analitico, da insider del venture capital. Focus prioritario: mercato italiano, poi europeo, poi globale.`,
        },
        {
          role: "user",
          content: `Scrivi l'editoriale settimanale DEALROOM per ${today}.
Analizza i deal, i round di finanziamento e gli investimenti VC più rilevanti della settimana.
Scegli un tema tra: stato del VC italiano, round significativi della settimana, trend di investimento (AI, deeptech, climate, fintech, healthtech), exit e IPO, fondi VC europei, corporate venture capital, angel investing, stato del mercato M&A.
Restituisci JSON:
{
  "title": "Titolo editoriale (max 80 caratteri, incisivo e specifico sui deal)",
  "subtitle": "Sottotitolo (max 120 caratteri, con cifre o nomi di aziende se possibile)",
  "body": "Corpo dell'editoriale (400-600 parole, in italiano, tono autorevole e analitico). Deve includere: 1) Panoramica dei deal della settimana, 2) Analisi di un round o exit significativo, 3) Trend di investimento emergente, 4) Prospettiva sul mercato italiano/europeo. Usa cifre, nomi di fondi e startup reali quando possibile.",
  "keyTrend": "Il trend chiave della settimana (max 50 caratteri, es: 'Serie A AI in crescita del 40%')",
  "authorNote": "Nota del direttore (max 100 caratteri, riflessione sul mercato VC)"
}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "dealroom_editorial",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              subtitle: { type: "string" },
              body: { type: "string" },
              keyTrend: { type: "string" },
              authorNote: { type: "string" },
            },
            required: ["title", "subtitle", "body", "keyTrend", "authorNote"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = JSON.parse(response.choices[0].message.content as string);
    const db = await getDb();
    if (!db) throw new Error("DB not available");

    const imageUrl = await findEditorialImage(content.title, content.keyTrend);

    // Sostituisci l'editoriale precedente della sezione dealroom
    await db.delete(dailyEditorial).where(eq(dailyEditorial.section, 'dealroom'));
    await db.insert(dailyEditorial).values({
      title: content.title,
      subtitle: content.subtitle,
      body: content.body,
      keyTrend: content.keyTrend,
      authorNote: content.authorNote,
      imageUrl,
      section: 'dealroom',
      dateLabel,
    });

    console.log("[DealroomScheduler] ✅ DEALROOM editorial saved:", content.title);
  } catch (err) {
    console.error("[DealroomScheduler] ❌ Error generating DEALROOM editorial:", err);
  }
}
