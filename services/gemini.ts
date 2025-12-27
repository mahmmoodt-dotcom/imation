
import { GoogleGenAI } from "@google/genai";
import { Product, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getHardwareAdvice = async (
  query: string,
  products: Product[],
  lang: Language
) => {
  const productList = products
    .filter(p => p.availability)
    .map(p => `- ${p.name[lang] || p.name.en}: $${p.price - (p.discount || 0)} (${p.description[lang] || p.description.en})`)
    .join('\n');

  const systemInstruction = `
    You are an expert hardware specialist for "Imation Computer Shop". 
    Help the user find the best product from our inventory.
    Be professional, concise, and helpful.
    Current Inventory:
    ${productList}

    If the user's need matches a product, recommend it. If not exactly matched, suggest the closest alternative.
    Always respond in the language the user used (${lang}).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return lang === 'en' 
      ? "I'm having trouble connecting to my knowledge base. Please try again later!" 
      : "ببورە، کێشەیەک لە پەیوەندی دروست بوو. تکایە دواتر تاقی بکەرەوە.";
  }
};
