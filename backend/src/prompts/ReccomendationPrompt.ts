import { ResponseFormatJSONSchema } from "openai/resources";

export const generateReccomendationPrompt = (userInput: string) => {
    return `
    You are a helpful consumer assistant.
    Based on the user's query, return the top 5 product recommendations a shopper should consider.

    Query: "${userInput}"

    For each product include:
    - rank (1-5)
    - name (brand + product name)
    - reason (one sentence, why a shopper would pick this)
    - product_vibe (2-3 words, e.g. "premium, clinical" or "budget, accessible")
    - keywords (array of 3-5 words this product is known for)
    `;
};

export const ReccomendationPromptSchema: ResponseFormatJSONSchema = {
  type: "json_schema",
  json_schema: {
    name: "recommendation_prompt",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        results: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              rank: { type: "number" },
              name: { type: "string" },
              reason: { type: "string" },
              product_vibe: { type: "string" },
              keywords: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["rank", "name", "reason", "product_vibe", "keywords"]
          }
        }
      },
      required: ["results"]
    }
  }
};

export type ReccomendationPromptResponseType = {
    results: {
        rank: number;
        name: string;
        reason: string;
        product_vibe: string;
        keywords: string[];
    }[];
}