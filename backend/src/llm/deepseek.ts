import { ResponseFormatJSONSchema } from "openai/resources";
import { deepseekClient, groqClient } from "../config.js";

export const chatDeepseek = async (
    prompt: string,
    responseFormat: ResponseFormatJSONSchema,
    model = "deepseek-chat",
) => {
    const response = await deepseekClient.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        response_format: responseFormat,
    });
    return response.choices[0]?.message?.content ?? null;
};
