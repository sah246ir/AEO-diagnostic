import { ResponseFormatJSONSchema } from "openai/resources";
import { ReccomendationPromptResponseType } from "./ReccomendationPrompt.js";

export const generateRecommendationAnalyzerPrompt = (
    query: string,
    data: {
        llm:string,
        data: ReccomendationPromptResponseType
    }[]   ,
    userProduct: string,
  ) => {
    const reccomendations: string[] = []
    data.forEach(llmdata=>{
        llmdata.data.results.forEach(result=>{
            reccomendations.push(`[${llmdata.llm}] Rank ${result.rank}: ${result.name} — ${result.reason} | Vibe: ${result.product_vibe} | Keywords: ${result.keywords.join(", ")}`)
        })
    })
    return `
  You are an AI visibility analyst.
  
  A user wants to know how their product "${userProduct}" ranks across AI models for the query: "${query}".
  
  Here are the top recommendations returned by each AI model:
  ${reccomendations.join("\n")}
  
  Your task:
  1. Check if "${userProduct}" appears in any of the results above.
  2. For each LLM, state whether the product was found, and if yes, its rank and reasoning.
  3. Identify what the top-ranking competitors are doing differently — what keywords, vibes, or positioning they own that "${userProduct}" does not.
  4. Give a short, specific recommendation (2-3 sentences) on what "${userProduct}" should do to rank higher in AI-generated answers.
  5. Calculate a visibility_score as a number from 0 to 100:
   - Start at 0
   - For each LLM where the product is found: add (100 / total number of LLMs)
   - If found and ranked #1: add 10 bonus points
   - If found and ranked #2: add 5 bonus points
   - Cap at 100
   - Example: found in 2 of 3 LLMs, one at rank 1 → (66.6 + 10) = 76s
  
  Return raw JSON only. No markdown, no backticks, no explanation.
  
  {
    "visibility": [
      { "llm": "...", "found": true/false, "rank": 1 or null, "reason": "..." }
    ],
    "visibility_score": 0,
    "competitor_insights": [
      { "name": "...", "edge": "what they do better" }
    ],
    "recommendation": "..."
  }
    `;
  };

export const RecommendationAnalyzerSchema:ResponseFormatJSONSchema = {
    type: "json_schema",
    json_schema: {
        name: "recommendation_analyzer",
        schema: {
            type: "object",
            properties: {
                visibility: { type: "array", items: { type: "object", properties: { llm: { type: "string" }, found: { type: "boolean" }, rank: { type: "number" }, reason: { type: "string" } } } },
                visibility_score: { type: "number" },
                competitor_insights: { type: "array", items: { type: "object", properties: { name: { type: "string" }, edge: { type: "string" } } } },
                recommendation: { type: "string" }
            }
        }
    }
}

export type RecommendationAnalyzerResponseType = {
    visibility: { llm: string; found: boolean; rank: number | null; reason: string }[];
    visibility_score: number;
    competitor_insights: { name: string; edge: string }[];
    recommendation: string;
}