import dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const groqClient = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const geminiClient = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
}); 
export const anthropicClient = new OpenAI({
    apiKey: process.env.ANTHROPIC_API_KEY,
    baseURL: "https://api.anthropic.com/v1",
}); 

export { groqClient, openaiClient, geminiClient };
