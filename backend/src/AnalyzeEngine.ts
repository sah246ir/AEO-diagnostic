import { chatGroq } from "./llm/groq.js";
import { generateRecommendationAnalyzerPrompt, RecommendationAnalyzerResponseType, RecommendationAnalyzerSchema } from "./prompts/ReccomendationAnalyzer.js";
import { generateReccomendationPrompt, ReccomendationPromptResponseType, ReccomendationPromptSchema } from "./prompts/ReccomendationPrompt.js";
import { sendSseEvent } from "./sse.js";

const getRankScore = (rank: number | null) => {
    if (rank === 1) return 1.0
    if (rank === 2) return 0.8
    if (rank === 3) return 0.6
    if (rank === 4 || rank === 5) return 0.4
    return 0
  }
const LLM_RUNNERS = [
    { llm: "llama-3.3", groqModel: "llama-3.3-70b-versatile" },
    { llm: "mixtral-8x7b", groqModel: "mixtral-8x7b-32768" },
    { llm: "gemma-2", groqModel: "gemma2-9b-it" },
] as const

const processReccomendation = async (query: string, userProduct: string) => {
    const reccomendations = await Promise.all(
        LLM_RUNNERS.map(async ({ llm, groqModel }) => {
            const data = await chatGroq(
                generateReccomendationPrompt(query),
                ReccomendationPromptSchema,
                groqModel,
            )
            if (data === null) {
                sendSseEvent("llm_error", { llm, message: "Empty LLM response" })
                throw new Error(`Empty LLM response (${llm})`)
            }
            const reccomendationData = JSON.parse(data) as ReccomendationPromptResponseType
            sendSseEvent("llm_result", { llm, data: reccomendationData })
            return { llm, data: reccomendationData }
        }),
    )

    const analyzerData = await chatGroq(
        generateRecommendationAnalyzerPrompt(query, reccomendations, userProduct),
        RecommendationAnalyzerSchema,
        "llama-3.3-70b-versatile",
    )
    if (analyzerData === null) {
        sendSseEvent("analyzer_error", { message: "Empty LLM response" })
        throw new Error("Empty LLM response (analyzer)")
    }
    const analyzerDataParsed = JSON.parse(analyzerData) as RecommendationAnalyzerResponseType
    const visibilityScore = (analyzerDataParsed.visibility.reduce((sum, m) => sum + getRankScore(m.rank ?? null), 0) / LLM_RUNNERS.length) * 100
    analyzerDataParsed.visibility_score = visibilityScore
    sendSseEvent("analyzer_result", analyzerDataParsed)
    return analyzerDataParsed
}

export { processReccomendation }
