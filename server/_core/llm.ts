/**
 * LLM helper — supporta due provider:
 *
 *  1. Anthropic Claude  (provider primario)
 *     Attivato quando ANTHROPIC_API_KEY è configurata.
 *     Modello default: claude-sonnet-4-5 (bilanciamento qualità/costo ottimale).
 *
 *  2. Manus Forge API   (fallback)
 *     Usato automaticamente se ANTHROPIC_API_KEY non è presente.
 *     Compatibile OpenAI — nessuna modifica necessaria al codice chiamante.
 *
 * L'interfaccia pubblica `invokeLLM()` è identica in entrambi i casi:
 * il resto del codebase non deve essere modificato per cambiare provider.
 */

import Anthropic from "@anthropic-ai/sdk";
import { ENV } from "./env";

// ─── Tipi pubblici (invariati rispetto alla versione precedente) ──────────────

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

export type FileContent = {
  type: "file_url";
  file_url: {
    url: string;
    mime_type?: "audio/mpeg" | "audio/wav" | "application/pdf" | "audio/mp4" | "video/mp4";
  };
};

export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type Tool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = {
  type: "function";
  function: {
    name: string;
  };
};

export type ToolChoice =
  | ToolChoicePrimitive
  | ToolChoiceByName
  | ToolChoiceExplicit;

export type InvokeParams = {
  messages: Message[];
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | Array<TextContent | ImageContent | FileContent>;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export type OutputSchema = JsonSchema;

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: JsonSchema };

// ─── Helpers interni ─────────────────────────────────────────────────────────

const ensureArray = (
  value: MessageContent | MessageContent[]
): MessageContent[] => (Array.isArray(value) ? value : [value]);

const normalizeContentPart = (
  part: MessageContent
): TextContent | ImageContent | FileContent => {
  if (typeof part === "string") return { type: "text", text: part };
  if (part.type === "text") return part;
  if (part.type === "image_url") return part;
  if (part.type === "file_url") return part;
  throw new Error("Unsupported message content part");
};

const normalizeMessage = (message: Message) => {
  const { role, name, tool_call_id } = message;

  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content)
      .map(part => (typeof part === "string" ? part : JSON.stringify(part)))
      .join("\n");
    return { role, name, tool_call_id, content };
  }

  const contentParts = ensureArray(message.content).map(normalizeContentPart);

  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return { role, name, content: contentParts[0].text };
  }

  return { role, name, content: contentParts };
};

const normalizeToolChoice = (
  toolChoice: ToolChoice | undefined,
  tools: Tool[] | undefined
): "none" | "auto" | ToolChoiceExplicit | undefined => {
  if (!toolChoice) return undefined;
  if (toolChoice === "none" || toolChoice === "auto") return toolChoice;

  if (toolChoice === "required") {
    if (!tools || tools.length === 0)
      throw new Error("tool_choice 'required' was provided but no tools were configured");
    if (tools.length > 1)
      throw new Error("tool_choice 'required' needs a single tool or specify the tool name explicitly");
    return { type: "function", function: { name: tools[0].function.name } };
  }

  if ("name" in toolChoice) return { type: "function", function: { name: toolChoice.name } };
  return toolChoice;
};

const normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema,
}: {
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
}):
  | { type: "json_schema"; json_schema: JsonSchema }
  | { type: "text" }
  | { type: "json_object" }
  | undefined => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (explicitFormat.type === "json_schema" && !explicitFormat.json_schema?.schema)
      throw new Error("responseFormat json_schema requires a defined schema object");
    return explicitFormat;
  }

  const schema = outputSchema || output_schema;
  if (!schema) return undefined;
  if (!schema.name || !schema.schema) throw new Error("outputSchema requires both name and schema");

  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...(typeof schema.strict === "boolean" ? { strict: schema.strict } : {}),
    },
  };
};

// ─── Provider: Anthropic Claude ──────────────────────────────────────────────

const CLAUDE_MODEL = "claude-sonnet-4-5";
const CLAUDE_HAIKU_MODEL = "claude-3-haiku-20240307"; // Modello veloce ed economico per classificazione/summarizzazione
const CLAUDE_MAX_TOKENS = 8192;

/**
 * Stile editoriale Andrea Cinelli — iniettato come prefisso in ogni system prompt.
 * Garantisce che tutti i contenuti generati riflettano il registro executive,
 * data-driven e orientato all'execution dell'autore.
 */
const ANDREA_CINELLI_STYLE = `
Scrivi con uno stile "Andrea Cinelli": autorevole, data-driven e orientato all'execution.
Parti sempre da evidenze concrete (numeri, trend, ricerche affidabili) e costruisci una tesi chiara e difendibile, evitando opinioni non supportate.
Usa frasi brevi, linguaggio semplice ma preciso, con un registro executive: ogni parola deve creare valore.
Trasforma i dati in insight strategici evidenziando implicazioni di business, rischi e opportunità, e collegandoli a modelli operativi e leve di crescita.
Integra esempi reali, use case e riferimenti a mercato o industry per rendere il contenuto immediatamente applicabile.
Mantieni un tono da builder e decision maker, non da consulente teorico: orienta sempre verso azione, impatto e scalabilità.
Chiudi con un takeaway netto che sintetizzi la direzione da prendere — senza etichette come "Takeaway" o "In sintesi", scrivi direttamente la conclusione in forma di affermazione forte rivolta al lettore.
Obiettivo: guidare decisioni, non solo informare.

REGOLE DI FORMATTAZIONE ASSOLUTE (non derogabili):
- NON usare mai asterischi (*) o doppi asterischi (**) per il grassetto o qualsiasi altra formattazione.
- NON usare mai underscore (_) per il corsivo.
- NON usare mai simboli Markdown di nessun tipo: niente #, niente >, niente -, niente backtick.
- Scrivi testo puro, come un essere umano che digita su LinkedIn o in un articolo di giornale.
- Per enfatizzare un concetto, usa la struttura della frase, non la formattazione tipografica.
- Il testo deve sembrare scritto da una persona, non da un sistema AI.
`.trim();

/**
 * Converte i messaggi nel formato Anthropic.
 * - Il messaggio "system" viene estratto e passato come parametro separato.
 * - I messaggi "user" e "assistant" vengono mappati direttamente.
 * - I contenuti multimodali (image_url) vengono convertiti nel formato Anthropic.
 */
function toAnthropicMessages(messages: Message[]): {
  system: string | undefined;
  messages: Anthropic.MessageParam[];
} {
  let system: string | undefined;
  const anthropicMessages: Anthropic.MessageParam[] = [];

  for (const msg of messages) {
    if (msg.role === "system") {
      // Anthropic vuole il system prompt come parametro separato
      const parts = ensureArray(msg.content);
      system = parts
        .map(p => (typeof p === "string" ? p : p.type === "text" ? p.text : ""))
        .join("\n");
      continue;
    }

    if (msg.role === "user" || msg.role === "assistant") {
      const parts = ensureArray(msg.content);

      // Contenuto semplice testuale
      if (parts.length === 1 && (typeof parts[0] === "string" || parts[0].type === "text")) {
        const text = typeof parts[0] === "string" ? parts[0] : (parts[0] as TextContent).text;
        anthropicMessages.push({ role: msg.role, content: text });
        continue;
      }

      // Contenuto multimodale
      const anthropicContent: Anthropic.ContentBlockParam[] = [];
      for (const part of parts) {
        if (typeof part === "string") {
          anthropicContent.push({ type: "text", text: part });
        } else if (part.type === "text") {
          anthropicContent.push({ type: "text", text: part.text });
        } else if (part.type === "image_url") {
          // Anthropic supporta URL diretti come source type "url"
          anthropicContent.push({
            type: "image",
            source: {
              type: "url",
              url: part.image_url.url,
            },
          } as Anthropic.ImageBlockParam);
        }
        // file_url non supportato da Anthropic — ignorato con warning
      }
      anthropicMessages.push({ role: msg.role, content: anthropicContent });
    }
    // tool/function messages: ignorati (non usati nel codebase attuale)
  }

  return { system, messages: anthropicMessages };
}

async function invokeClaude(params: InvokeParams): Promise<InvokeResult> {
  const client = new Anthropic({ apiKey: ENV.anthropicApiKey });

  const {
    messages,
    outputSchema,
    output_schema,
    responseFormat,
    response_format,
  } = params;

  const maxTokens = params.maxTokens || params.max_tokens || CLAUDE_MAX_TOKENS;
  const { system, messages: anthropicMessages } = toAnthropicMessages(messages);

  // Gestione JSON strutturato: se richiesto, aggiungiamo istruzione nel system prompt
  const normalizedFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema,
  });

  // Inietta lo stile Andrea Cinelli come prefisso del system prompt.
  // Se il chiamante ha già un system prompt, lo stile viene preposto — così
  // le istruzioni specifiche del task mantengono la precedenza ma il registro
  // editoriale è sempre garantito.
  let systemPrompt = system
    ? `${ANDREA_CINELLI_STYLE}\n\n${system}`
    : ANDREA_CINELLI_STYLE;

  if (normalizedFormat?.type === "json_schema" || normalizedFormat?.type === "json_object") {
    const schemaHint =
      normalizedFormat.type === "json_schema"
        ? `\n\nRispondi ESCLUSIVAMENTE con un oggetto JSON valido che rispetti questo schema:\n${JSON.stringify((normalizedFormat as { type: "json_schema"; json_schema: JsonSchema }).json_schema.schema, null, 2)}\nNon aggiungere testo prima o dopo il JSON.`
        : "\n\nRispondi ESCLUSIVAMENTE con un oggetto JSON valido. Non aggiungere testo prima o dopo il JSON.";
    systemPrompt = (systemPrompt ?? "") + schemaHint;
  }

  const requestParams: Anthropic.MessageCreateParamsNonStreaming = {
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    messages: anthropicMessages,
    ...(systemPrompt ? { system: systemPrompt } : {}),
  };

  const response = await client.messages.create(requestParams);

  // Estrai il testo dalla risposta
  const textContent = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map(b => b.text)
    .join("");

  // Normalizza in formato OpenAI-compatibile (InvokeResult)
  return {
    id: response.id,
    created: Math.floor(Date.now() / 1000),
    model: response.model,
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: textContent,
        },
        finish_reason: response.stop_reason ?? null,
      },
    ],
    usage: {
      prompt_tokens: response.usage.input_tokens,
      completion_tokens: response.usage.output_tokens,
      total_tokens: response.usage.input_tokens + response.usage.output_tokens,
    },
  };
}

// ─── Provider: Manus Forge (fallback OpenAI-compatible) ──────────────────────

const resolveForgeApiUrl = () =>
  ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0
    ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`
    : "https://forge.manus.im/v1/chat/completions";

async function invokeForge(params: InvokeParams): Promise<InvokeResult> {
  if (!ENV.forgeApiKey) throw new Error("Nessun provider LLM configurato: imposta ANTHROPIC_API_KEY o BUILT_IN_FORGE_API_KEY");

  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format,
  } = params;

  const payload: Record<string, unknown> = {
    model: "gemini-2.5-flash",
    messages: messages.map(normalizeMessage),
  };

  if (tools && tools.length > 0) payload.tools = tools;

  const normalizedToolChoice = normalizeToolChoice(toolChoice || tool_choice, tools);
  if (normalizedToolChoice) payload.tool_choice = normalizedToolChoice;

  payload.max_tokens = 32768;
  payload.thinking = { budget_tokens: 128 };

  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema,
  });
  if (normalizedResponseFormat) payload.response_format = normalizedResponseFormat;

  const response = await fetch(resolveForgeApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.forgeApiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM invoke failed: ${response.status} ${response.statusText} – ${errorText}`);
  }

  return (await response.json()) as InvokeResult;
}

// ─── Entry point pubblico ─────────────────────────────────────────────────────

/**
 * Chiama il provider LLM configurato.
 *
 * Priorità:
 *  1. Anthropic Claude  → se ANTHROPIC_API_KEY è impostata
 *  2. Manus Forge API   → fallback automatico
 *
 * L'interfaccia di input/output è identica indipendentemente dal provider.
 */
/**
 * Rimuove i backtick markdown (```json ... ```) che Claude a volte aggiunge
 * attorno alle risposte JSON. Usare prima di JSON.parse su qualsiasi risposta LLM.
 *
 * @example
 *   const raw = response.choices[0].message.content;
 *   const parsed = JSON.parse(stripJsonBackticks(raw));
 */
export function stripJsonBackticks(raw: unknown): string {
  const str = typeof raw === "string" ? raw : JSON.stringify(raw ?? "{}");
  return str.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
}

/**
 * Rimuove qualsiasi formattazione Markdown dal testo prima della pubblicazione su LinkedIn.
 * LinkedIn non interpreta il Markdown: asterischi, underscore e altri simboli
 * vengono mostrati letteralmente, rendendo il testo non professionale.
 *
 * Applica questa funzione a QUALSIASI testo generato da LLM prima di pubblicarlo su LinkedIn.
 */
export function sanitizeForLinkedIn(text: string): string {
  return text
    // Rimuove grassetto: **testo** o __testo__
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    // Rimuove corsivo: *testo* o _testo_
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    // Rimuove intestazioni Markdown: # ## ###
    .replace(/^#{1,6}\s+/gm, "")
    // Rimuove blockquote: > testo
    .replace(/^>\s+/gm, "")
    // Rimuove backtick inline: `codice`
    .replace(/`(.+?)`/g, "$1")
    // Rimuove blocchi di codice: ```...```
    .replace(/```[\s\S]*?```/g, "")
    // Rimuove trattini come bullet list: - item
    .replace(/^[\-\*]\s+/gm, "\u2022 ")
    // Normalizza spazi multipli
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/**
 * Provider veloce ed economico — usa Claude Haiku invece di Sonnet.
 * Ideale per operazioni di classificazione, summarizzazione breve e tagging
 * dove la qualità editoriale non è critica ma il volume è alto.
 *
 * Se ANTHROPIC_API_KEY non è configurata, usa il fallback Forge come invokeLLM.
 */
export async function invokeLLMFast(params: InvokeParams): Promise<InvokeResult> {
  if (ENV.anthropicApiKey && ENV.anthropicApiKey.trim().length > 0) {
    console.log(`[LLM] Provider: Anthropic Claude Haiku (fast/cheap)`);
    // Usa Haiku sovrascrivendo il modello nell'invocazione Claude
    const client = new Anthropic({ apiKey: ENV.anthropicApiKey });
    const { messages, outputSchema, output_schema, responseFormat, response_format } = params;
    const maxTokens = params.maxTokens || params.max_tokens || 4096;
    const { system, messages: anthropicMessages } = toAnthropicMessages(messages);
    const normalizedFormat = normalizeResponseFormat({ responseFormat, response_format, outputSchema, output_schema });
    const systemWithStyle = system ? `${ANDREA_CINELLI_STYLE}\n\n${system}` : ANDREA_CINELLI_STYLE;
    let systemWithJson = systemWithStyle;
    if (normalizedFormat?.type === "json_schema") {
      const schemaStr = JSON.stringify(normalizedFormat.json_schema?.schema ?? {}, null, 2);
      systemWithJson = `${systemWithStyle}\n\nRispondi SEMPRE con un oggetto JSON valido che rispetti questo schema:\n${schemaStr}\n\nNon aggiungere testo prima o dopo il JSON.`;
    }
    const response = await client.messages.create({
      model: CLAUDE_HAIKU_MODEL,
      max_tokens: maxTokens,
      ...(systemWithJson ? { system: systemWithJson } : {}),
      messages: anthropicMessages,
    });
    const textBlock = response.content.find(b => b.type === "text");
    const text = textBlock?.type === "text" ? textBlock.text : "";
    return {
      id: response.id,
      created: Math.floor(Date.now() / 1000),
      model: CLAUDE_HAIKU_MODEL,
      choices: [{ index: 0, message: { role: "assistant" as const, content: text }, finish_reason: response.stop_reason ?? null }],
      usage: { prompt_tokens: response.usage.input_tokens, completion_tokens: response.usage.output_tokens, total_tokens: response.usage.input_tokens + response.usage.output_tokens },
    };
  }
  return invokeForge(params);
}

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  if (ENV.anthropicApiKey && ENV.anthropicApiKey.trim().length > 0) {
    console.log(`[LLM] Provider: Anthropic Claude (${CLAUDE_MODEL})`);
    return invokeClaude(params);
  }

  console.log("[LLM] Provider: Manus Forge API (fallback — configura ANTHROPIC_API_KEY per usare Claude)");
  return invokeForge(params);
}
