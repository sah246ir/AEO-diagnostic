import { ResponseFormatJSONSchema } from "openai/resources";
import { anthropicClient, geminiClient, groqClient } from "../config.js";
import { generateReccomendationPrompt, ReccomendationPromptSchema } from "../prompts/ReccomendationPrompt.js";

export const chatAnthropic = async (
    prompt: string,
    responseFormat: ResponseFormatJSONSchema,
    model = "claude-haiku-4-5",
) => {
    const response = await anthropicClient.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }], 
        response_format: responseFormat,
    });
    console.log(response.choices[0]?.message?.content);
    return response.choices[0]?.message?.content ?? null; 
}; 

chatAnthropic(generateReccomendationPrompt("best ai platform to resolve customer support tickets"), ReccomendationPromptSchema, "claude-haiku-4-5");