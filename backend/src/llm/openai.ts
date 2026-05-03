import { ResponseFormatJSONSchema } from "openai/resources";
import { openaiClient } from "../config.js";

export const chatOpenai = async (
    prompt: string,
    responseFormat: ResponseFormatJSONSchema,
    model = "gpt-4o-mini",
) => {
    const response = await openaiClient.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        response_format: responseFormat,
    });
    return response.choices[0]?.message?.content ?? null;
};
