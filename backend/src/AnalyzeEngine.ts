import { chatGroq } from "./llm/groq.js";
import { generateRecommendationAnalyzerPrompt, RecommendationAnalyzerResponseType, RecommendationAnalyzerSchema } from "./prompts/ReccomendationAnalyzer.js";
import { generateReccomendationPrompt, ReccomendationPromptResponseType, ReccomendationPromptSchema } from "./prompts/ReccomendationPrompt.js";
import { sendSseEvent } from "./sse.js";

const processReccomendation = async (query: string, userProduct: string) => {
    const reccomendations = await Promise.all(
        [
            {name: "groq", chat: chatGroq},
            {name: "gemini", chat: chatGroq},
            {name: "anthropic", chat: chatGroq},
        ].map(async (llm)=>{
            const data = await llm.chat(
                generateReccomendationPrompt(query),
                ReccomendationPromptSchema
            )
            if (data === null) {
                sendSseEvent("llm_error", {message: "Empty LLM response",llm: llm.name })
                throw new Error("Empty LLM response")
            }
            const reccomendationData = JSON.parse(data) as ReccomendationPromptResponseType
            sendSseEvent("llm_complete", {llm: llm.name, data: reccomendationData})
            return {llm: llm.name, data: reccomendationData}
        })
    )
    sendSseEvent("analyze_started", {reccomendations: reccomendations})
    const analyzerData = await chatGroq(
        generateRecommendationAnalyzerPrompt(query, reccomendations, userProduct),
        RecommendationAnalyzerSchema
    )
    if (analyzerData === null) {
        sendSseEvent("analyzer_error", {message: "Empty LLM response"})
        throw new Error("Empty LLM response")
    }
    const analyzerDataParsed = JSON.parse(analyzerData) as RecommendationAnalyzerResponseType
    sendSseEvent("analyze_complete", {data: analyzerDataParsed})
    return JSON.parse(analyzerData) as RecommendationAnalyzerResponseType
}

export { processReccomendation }