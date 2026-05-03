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

const deepseekClient = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com/v1",
  });

export { groqClient, openaiClient, deepseekClient };
