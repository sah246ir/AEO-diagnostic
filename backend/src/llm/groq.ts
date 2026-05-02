import { ResponseFormatJSONSchema } from "openai/resources";
import { groqClient } from "../config.js";

export const chatGroq = async (
    prompt: string,
    responseFormat: ResponseFormatJSONSchema,
    model = "llama-3.3-70b-versatile",
) => {
    const response = await groqClient.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        response_format: responseFormat,
    });
    return response.choices[0].message.content;
};