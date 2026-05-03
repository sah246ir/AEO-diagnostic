import { chatGroq } from "./llm/groq.js";
import { chatOpenai } from "./llm/openai.js";
import {
    generateRecommendationAnalyzerPrompt,
    RecommendationAnalyzerResponseType,
    RecommendationAnalyzerSchema,
} from "./prompts/ReccomendationAnalyzer.js";
import {
    generateReccomendationPrompt,
    ReccomendationPromptResponseType,
    ReccomendationPromptSchema,
} from "./prompts/ReccomendationPrompt.js";
import { sendSseEvent } from "./sse.js";

const getRankScore = (rank: number | null) => {
    if (rank === 1) return 1.0;
    if (rank === 2) return 0.8;
    if (rank === 3) return 0.6;
    if (rank === 4 || rank === 5) return 0.4;
    return 0;
};

type RecPayload = { llm: string; data: ReccomendationPromptResponseType };

async function runRecommendationProvider(
    llm: string,
    fetchRaw: () => Promise<string | null>,
): Promise<RecPayload> {
    try {
        const raw = await fetchRaw();
        if (raw === null || !raw.trim()) {
            sendSseEvent("llm_error", { llm, message: "Empty LLM response" });
            return { llm, data: { results: [] } };
        }
        const data = JSON.parse(raw) as ReccomendationPromptResponseType;
        sendSseEvent("llm_result", { llm, data });
        return { llm, data };
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        sendSseEvent("llm_error", { llm, message });
        return { llm, data: { results: [] } };
    }
}

function parseAnalyzerJson(raw: string | null): RecommendationAnalyzerResponseType | null {
    if (raw == null || !raw.trim()) return null;
    try {
        return JSON.parse(raw) as RecommendationAnalyzerResponseType;
    } catch {
        return null;
    }
}

const processReccomendation = async (query: string, userProduct: string) => {
    const prompt = generateReccomendationPrompt(query);
    const schema = ReccomendationPromptSchema;

    const reccomendations = await Promise.all([
        runRecommendationProvider("groq", () => chatGroq(prompt, schema, "openai/gpt-oss-120b")),
        runRecommendationProvider("openai", () => chatOpenai(prompt, schema, "gpt-4o-mini")),
    ]);

    const forAnalyzer = reccomendations.filter((r) => r.data.results.length > 0);
    if (forAnalyzer.length === 0) {
        sendSseEvent("analyze_error", { message: "No recommendation models returned usable data" });
        return;
    }

    let analyzerRaw: string | null = null;
    try {
        analyzerRaw = await chatOpenai(
            generateRecommendationAnalyzerPrompt(query, forAnalyzer, userProduct),
            RecommendationAnalyzerSchema,
            "gpt-4o",
        );
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        sendSseEvent("analyzer_error", { message });
        return;
    }

    const analyzerDataParsed = parseAnalyzerJson(analyzerRaw);
    if (!analyzerDataParsed) {
        sendSseEvent("analyzer_error", { message: "Empty or invalid analyzer JSON" });
        return;
    }

    const visCount = Math.max(1, analyzerDataParsed.visibility.length);
    const visibilityScore =
        (analyzerDataParsed.visibility.reduce((sum, m) => sum + getRankScore(m.rank ?? null), 0) / visCount) * 100;
    analyzerDataParsed.visibility_score = visibilityScore;
    sendSseEvent("analyzer_result", analyzerDataParsed);
    return analyzerDataParsed;
};

export { processReccomendation };
