import { ResponseFormatJSONSchema } from "openai/resources";
import { ReccomendationPromptResponseType } from "./ReccomendationPrompt.js";

export const generateRecommendationAnalyzerPrompt = (
    query: string,
    data: {
        llm: string,
        data: ReccomendationPromptResponseType
    }[],
    userProduct: string,
) => {
    const reccomendations: string[] = []
    data.forEach(llmdata => {
        llmdata.data.results.forEach(result => {
            reccomendations.push(`[${llmdata.llm}] Rank ${result.rank}: ${result.name} — ${result.reason} | Vibe: ${result.product_vibe} | Keywords: ${result.keywords.join(", ")}`)
        })
    })
    return `
    You are an e-commerce AI visibility analyst.
    
    Query: "${query}"
    Target product: "${userProduct}"
    
    Here are AI model recommendations:
    ${reccomendations.join("\n")}
    
    Return STRICT JSON with:
    
    1. visibility:
       - For each LLM, return:
         { llm: "...", rank: number | null }
    
    2. primary_purchase_driver:
       - dominant buying intent
       - confidence (0–1)
    
    3. key_drivers:
       - top repeated benefits / keywords
    
    4. positioning_gap:
       - market_focus
       - product_focus
       - gap
    
    5. competitor_dominance:
       - top 2 competitors + frequency + reason
    
    6. problems:
       - specific issues
    
    7. recommendations:
       - actionable fixes
    
    8. improved_bullets:
       - 3 better bullets
    
    Constraints:
    - Do NOT repeat rankings in text
    - Be concise
    - Use data from inputs
    - problems: max 3 items
    - recommendations: max 3 items
    - do not repeat the same idea across sections
    - each point must be unique
    - keep each bullet under 10 words
    
    Return JSON only.
    `;
};

export const RecommendationAnalyzerSchema: ResponseFormatJSONSchema = {
    type: "json_schema",
    json_schema: {
        name: "recommendation_analyzer",
        schema: {
            type: "object",
            properties: {
                visibility: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            llm: { type: "string" },
                            rank: { type: ["number", "null"] }
                        },
                        required: ["llm", "rank"]
                    }
                },
                primary_purchase_driver: {
                    type: "object",
                    properties: {
                        driver: { type: "string" },
                        confidence: { type: "number" }
                    },
                    required: ["driver", "confidence"]
                },
                key_drivers: {
                    type: "array",
                    items: { type: "string" }
                },
                positioning_gap: {
                    type: "object",
                    properties: {
                        market_focus: { type: "string" },
                        product_focus: { type: "string" },
                        gap: { type: "string" }
                    },
                    required: ["market_focus", "product_focus", "gap"]
                },
                competitor_dominance: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            name: { type: "string" },
                            frequency: { type: "number" },
                            reason: { type: "string" }
                        },
                        required: ["name", "frequency", "reason"]
                    }
                },
                problems: {
                    type: "array",
                    items: { type: "string" }
                },
                recommendations: {
                    type: "array",
                    items: { type: "string" }
                },
                improved_bullets: {
                    type: "array",
                    items: { type: "string" }
                }
            },
            required: [
                "visibility",
                "primary_purchase_driver",
                "key_drivers",
                "positioning_gap",
                "competitor_dominance",
                "problems",
                "recommendations",
                "improved_bullets"
            ]
        }
    }
};

export type RecommendationAnalyzerResponseType = {
    visibility: {
        llm: string;
        rank: number | null;
    }[];
    visibility_score: number;
    primary_purchase_driver: {
        driver: string;
        confidence: number;
    };

    key_drivers: string[];

    positioning_gap: {
        market_focus: string;
        product_focus: string;
        gap: string;
    };

    competitor_dominance: {
        name: string;
        frequency: number;
        reason: string;
    }[];

    problems: string[];

    recommendations: string[];

    improved_bullets: string[];
};