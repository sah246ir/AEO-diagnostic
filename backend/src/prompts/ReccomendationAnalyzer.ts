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
- Use ONLY the information present in the recommendations above
- Do NOT invent features, capabilities, or claims
- Every point must be grounded in patterns from the data
- Be specific. Avoid generic phrases like "improve AI", "enhance performance", "better UX"
- Write in simple, clear language a non-technical user understands

---

Return STRICT JSON with:

1. visibility:
   - For each LLM:
     { llm: "...", rank: number | null }

---

2. primary_purchase_driver:
   - ONE short phrase describing the most repeated buying reason
   - must be derived from repeated patterns in reasons/keywords
   - confidence (0–1 based on frequency across models)

---

3. key_drivers:
   - 3–5 most repeated concrete phrases from:
     - keywords
     - reasons
   - must match actual language from inputs (no abstraction)

---

4. positioning_gap:
   - market_focus: what top-ranked products emphasize (based on patterns)
   - product_focus: how the target product is described in inputs
   - gap: EXACT difference between the two (clear and concrete)

---

5. competitor_dominance:
   - top 2 competitors
   - frequency (how many models mention them)
   - reason:
     - must reference specific advantages visible in input
     - explain what they do better than the target product

---

6. problems:
   - max 3 items
   - each must:
     - be specific
     - reference a missing feature, positioning issue, or weakness
     - avoid generic language

   ❌ Bad: "needs better AI"
   ✅ Good: "lacks enterprise workflow automation"

---

7. recommendations:
   - max 3 items
   - each must:
     - directly fix a problem listed above
     - be concrete and actionable
     - avoid vague verbs like "improve", "enhance", "optimize"

   ❌ Bad: "improve integrations"
   ✅ Good: "add native integration with major CRM tools, build a landing page around it and publish case studies in customer service blogs"

---

8. improved_bullets:
   - exactly 3 bullets
   - each bullet:
     - under 10 words
     - benefit-driven
     - based on key drivers
     - NOT generic marketing language

   ❌ Bad: "boost productivity"
   ✅ Good: "AI routing reduces ticket handling time"

---

Constraints:
- Do NOT repeat the same idea across sections
- Do NOT restate rankings in text
- Use concrete, observable patterns only
- No generic or filler language
- Keep everything concise and specific

Return JSON only.
`;
};

export const RecommendationAnalyzerSchema: ResponseFormatJSONSchema = {
    type: "json_schema",
    json_schema: {
        name: "recommendation_analyzer",
        strict: true,
        schema: {
            type: "object",
            additionalProperties: false,
            properties: {
                visibility: {
                    type: "array",
                    items: {
                        type: "object",
                        additionalProperties: false,
                        properties: {
                            llm: { type: "string" },
                            rank: { type: ["number", "null"] }
                        },
                        required: ["llm", "rank"]
                    }
                },
                primary_purchase_driver: {
                    type: "object",
                    additionalProperties: false,
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
                    additionalProperties: false,
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
                        additionalProperties: false,
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