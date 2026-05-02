import { ResponseFormatJSONSchema } from "openai/resources";
import { groqClient } from "../config.js";

export const chatGroq = async (
    prompt: string,
    responseFormat: ResponseFormatJSONSchema
) => {
    const response = await groqClient.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [{ role: "user", content: prompt }],
        response_format: responseFormat,
    });
    return response.choices[0].message.content;
};