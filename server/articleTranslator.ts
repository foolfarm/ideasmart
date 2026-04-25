/**
 * articleTranslator.ts
 * Traduzione automatica IT→EN degli articoli di daily_editorial usando Claude.
 * Usa invokeLLM (helper interno) per massima compatibilità con il provider configurato.
 */

import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { dailyEditorial } from "../drizzle/schema";
import { isNull, eq } from "drizzle-orm";

interface TranslationResult {
  titleEn: string;
  subtitleEn: string | null;
  bodyEn: string;
}

/**
 * Traduce un singolo articolo IT→EN usando Claude.
 * Mantiene il tono giornalistico, i termini tecnici e la struttura del testo.
 */
export async function translateArticle(
  title: string,
  subtitle: string | null,
  body: string
): Promise<TranslationResult> {
  const prompt = `You are a professional Italian-to-English translator specializing in technology journalism and AI business news. 
Translate the following Italian article into fluent, professional English suitable for a tech business magazine.

Rules:
- Preserve the journalistic tone and style
- Keep technical terms (AI, GDPR, etc.) as-is or use the standard English equivalent
- Preserve formatting (paragraphs, line breaks)
- Do NOT add commentary or change the meaning
- Return ONLY a JSON object with keys: titleEn, subtitleEn (null if no subtitle), bodyEn

TITLE: ${title}
SUBTITLE: ${subtitle ?? ""}
BODY:
${body}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "article_translation",
        strict: true,
        schema: {
          type: "object",
          properties: {
            titleEn: { type: "string" },
            subtitleEn: { type: ["string", "null"] },
            bodyEn: { type: "string" },
          },
          required: ["titleEn", "subtitleEn", "bodyEn"],
          additionalProperties: false,
        },
      },
    },
  });

  // Extract JSON from response
  const rawContent = response.choices?.[0]?.message?.content ?? "";
  const text = (typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent)).trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in Claude response");
  }

  const parsed = JSON.parse(jsonMatch[0]) as TranslationResult;

  return {
    titleEn: parsed.titleEn || title,
    subtitleEn: parsed.subtitleEn || null,
    bodyEn: parsed.bodyEn || body,
  };
}

/**
 * Traduce un singolo record daily_editorial per ID e salva nel DB.
 */
export async function translateAndSaveArticle(articleId: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) throw new Error("DB not available");

    const [article] = await db
      .select()
      .from(dailyEditorial)
      .where(eq(dailyEditorial.id, articleId))
      .limit(1);

    if (!article) {
      console.warn(`[Translator] Article ${articleId} not found`);
      return false;
    }

    if (article.titleEn) {
      console.log(`[Translator] Article ${articleId} already translated, skipping`);
      return true;
    }

    const translation = await translateArticle(
      article.title,
      article.subtitle ?? null,
      article.body
    );

    await db
      .update(dailyEditorial)
      .set({
        titleEn: translation.titleEn,
        subtitleEn: translation.subtitleEn ?? undefined,
        bodyEn: translation.bodyEn,
        translatedAt: new Date(),
      })
      .where(eq(dailyEditorial.id, articleId));

    console.log(`[Translator] ✓ Article ${articleId} translated: "${translation.titleEn.substring(0, 60)}..."`);
    return true;
  } catch (err) {
    console.error(`[Translator] ✗ Failed to translate article ${articleId}:`, err);
    return false;
  }
}

/**
 * Traduce tutti gli articoli non ancora tradotti (titleEn IS NULL).
 * Processo batch con rate limiting per evitare di saturare l'API.
 */
export async function translatePendingArticles(limit = 20): Promise<{ success: number; failed: number }> {
  const db = await getDb();
  if (!db) return { success: 0, failed: 0 };

  const pending = await db
    .select({ id: dailyEditorial.id })
    .from(dailyEditorial)
    .where(isNull(dailyEditorial.titleEn))
    .limit(limit);

  console.log(`[Translator] Found ${pending.length} articles to translate`);

  let success = 0;
  let failed = 0;

  for (const { id } of pending) {
    const ok = await translateAndSaveArticle(id);
    if (ok) success++;
    else failed++;
    // Rate limiting: 300ms tra una chiamata e l'altra
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`[Translator] Batch complete: ${success} translated, ${failed} failed`);
  return { success, failed };
}
