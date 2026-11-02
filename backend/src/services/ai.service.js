import axios from "axios";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || "qwen/qwen3-coder";
const AI_TIMEOUT_MS = 45_000;

export const generateWithAI = async (
  prompt,
  { systemPrompt, maxTokens = 3000, temperature = 0.2 } = {}
) => {
  if (!process.env.OPENROUTER_API_KEY) {
    const error = new Error("AI service is not configured.");
    error.code = "AI_NOT_CONFIGURED";
    throw error;
  }

  if (typeof prompt !== "string" || !prompt.trim()) {
    throw new TypeError("A non-empty AI prompt is required.");
  }

  try {
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: DEFAULT_MODEL,
        messages: [
          ...(systemPrompt
            ? [{ role: "system", content: systemPrompt }]
            : []),
          { role: "user", content: prompt },
        ],
        temperature,
        max_tokens: maxTokens,
      },
      {
        timeout: AI_TIMEOUT_MS,
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5173",
          "X-Title": "DevConnect",
        },
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      const error = new Error("AI provider returned an empty response.");
      error.code = "AI_EMPTY_RESPONSE";
      throw error;
    }

    return content.trim();
  } catch (error) {
    // Never log provider response bodies or credentials.
    console.error("AI provider request failed:", {
      status: error.response?.status,
      code: error.code,
      message: error.message,
    });

    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      const timeoutError = new Error("The AI request timed out.");
      timeoutError.code = "AI_TIMEOUT";
      throw timeoutError;
    }

    if (error.code === "AI_NOT_CONFIGURED" || error.code === "AI_EMPTY_RESPONSE") {
      throw error;
    }

    const providerError = new Error("The AI provider could not complete the request.");
    providerError.code = "AI_PROVIDER_ERROR";
    throw providerError;
  }
};

export const parseAIJson = (content) => {
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("AI returned an empty response.");
  }

  const cleaned = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
      } catch {
        // Fall through to the stable validation error below.
      }
    }
    throw new Error("AI returned invalid JSON.");
  }
};
