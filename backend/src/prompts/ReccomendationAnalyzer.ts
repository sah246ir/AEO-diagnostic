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
    
    Your job is to analyze how the target product performs across AI-generated answers.
    
    IMPORTANT:
    Write outputs in simple, clear language. Avoid jargon. Every field should be easy for a non-technical user to understand.
    
    ---
    
    Return STRICT JSON with:
    
    1. visibility:
       - For each LLM:
         { llm: "...", rank: number | null }
    
    ---
    
    2. primary_purchase_driver:
       - dominant buying factor (1 short phrase, plain English)
       - confidence (0–1 based on how often it appears)
    
    ---
    
    3. key_drivers:
       - most repeated benefits or keywords across results
       - short phrases only
    
    ---
    
    4. positioning_gap:
       - market_focus: what top results focus on (simple phrase)
       - product_focus: how the target product is positioned (simple phrase)
       - gap: what the product is missing compared to top results (very clear, no jargon)
    
    ---
    
    5. competitor_dominance:
       - top 2 competitors
       - frequency (how many LLMs mention them)
       - reason: what they do better than the target product (specific and concrete)
    
    ---
    
    6. problems:
       - max 3 items
       - each should clearly explain what is holding the product back
       - simple, direct language (no vague statements)
    
    ---
    
    7. recommendations:
       - max 3 items
       - each should be a clear action to improve visibility
       - specific and practical
    
    ---
    
    8. improved_bullets:
       - exactly 3 bullets
       - each bullet under 10 words
       - benefit-driven and aligned with what buyers care about
    
    ---
    
    Constraints:
    - Do NOT repeat the same idea across sections
    - Do NOT restate rankings in text
    - Keep everything concise
    - Prefer clarity over completeness
    - Every output should feel actionable and easy to understand
    
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