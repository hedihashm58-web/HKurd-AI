import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "../constants";

// وەرگرتنی کلیلەکە لە .env
const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// هەم مۆدێلی سەرەکی و هەم جێگرەوەکەمان کرد بە زنجیرەی ٢.٥
const PRIMARY_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-2.5-pro';

// ١. چاتی سەرەکی کوردی بە شێوازی ستریم (لەگەڵ مۆدێلی جێگرەوەی ٢.٥)
export const chatWithKurdAIStream = async (message: string, history: any[] = [], imageBase64?: string | null, mimeType: string = 'image/jpeg') => {
  
  let rawHistory = history.map(h => ({ role: h.role === 'model' ? 'model' : 'user', parts: [{ text: h.text }] }));
  let safeHistory: any[] = [];
  let nextExpectedRole = 'user';

  for (const msg of rawHistory) {
    if (msg.role === nextExpectedRole && msg.parts[0].text.trim() !== "") {
      safeHistory.push(msg);
      nextExpectedRole = nextExpectedRole === 'user' ? 'model' : 'user';
    }
  }

  if (safeHistory.length > 0 && safeHistory[safeHistory.length - 1].role === 'user') {
    safeHistory.pop();
  }

  const userParts: any[] = [{ text: message }];
  if (imageBase64) {
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    userParts.push({ inlineData: { data: base64Data, mimeType } });
  }

  try {
    const model = genAI.getGenerativeModel({ model: PRIMARY_MODEL, systemInstruction: SYSTEM_PROMPT });
    const chat = model.startChat({ history: safeHistory });
    return await chat.sendMessageStream(userParts);
  } catch (error) {
    console.warn("⚠️ مۆدێلی ٢.٥ فلاش وەڵامی نەدا، گۆڕدرا بۆ مۆدێلی ٢.٥ پرۆ...");
    try {
      const fallbackModel = genAI.getGenerativeModel({ model: FALLBACK_MODEL, systemInstruction: SYSTEM_PROMPT });
      const fallbackChat = fallbackModel.startChat({ history: safeHistory });
      return await fallbackChat.sendMessageStream(userParts);
    } catch (fallbackError) {
      throw fallbackError;
    }
  }
};

// ٢. دروستکردنی ئارت و وێنە (پڕۆمپت)
export const generateKurdishArt = async (prompt: string, style: string = 'Photorealistic') => {
  try {
    const model = genAI.getGenerativeModel({ model: PRIMARY_MODEL });
    const result = await model.generateContent(`A ${style} professional artwork showing ${prompt}.`);
    return result.response.text();
  } catch (error) {
    const model = genAI.getGenerativeModel({ model: FALLBACK_MODEL });
    const result = await model.generateContent(`A ${style} professional artwork showing ${prompt}.`);
    return result.response.text();
  }
};

// ٣. شیکاری ماتماتیکی (Math Analyzer)
export const analyzeMathStream = async (problemDescription: string, imageBase64?: string | null, mimeType: string = 'image/jpeg') => {
  const parts: any[] = [{ text: `تکایە ئەم کێشە ماتماتیکییە شیکار بکە و هەنگاو بە هەنگاو بە زمانی کوردی ڕوونی بکەرەوە:\n${problemDescription}` }];
  if (imageBase64) {
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    parts.push({ inlineData: { data: base64Data, mimeType } });
  }

  try {
    const model = genAI.getGenerativeModel({ model: PRIMARY_MODEL });
    return await model.generateContentStream(parts);
  } catch (error) {
    const model = genAI.getGenerativeModel({ model: FALLBACK_MODEL });
    return await model.generateContentStream(parts);
  }
};

// ٤. وەرگێڕانی کوردی (Translator)
export const translateKurdishStream = async (text: string, sourceLang: string, targetLanguage: string, tone: string, imageBase64?: string | null, mimeType: string = 'image/jpeg') => {
  let promptText = `ئەم دەقە وەربگێڕە لە زمانی (${sourceLang}) بۆ زمانی (${targetLanguage}). پێویستە تۆنی وەرگێڕانەکە بە شێوازی (${tone}) بێت.\n`;
  if (text.trim()) promptText += `دەقەکە ئەمەیە:\n"${text}"`;
  else promptText += `تکایە ئەو دەقە وەربگێڕە کە لە وێنەکەدا دەردەکەوێت.`;

  const parts: any[] = [{ text: promptText }];
  if (imageBase64) {
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    parts.push({ inlineData: { data: base64Data, mimeType } });
  }

  try {
    const model = genAI.getGenerativeModel({ model: PRIMARY_MODEL });
    return await model.generateContentStream(parts);
  } catch (error) {
    const model = genAI.getGenerativeModel({ model: FALLBACK_MODEL });
    return await model.generateContentStream(parts);
  }
};

// ٥. زانیاری شوێنەوارەکانی کوردستان (Landmark Explorer)
export const getLandmarks = async (cityName: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: PRIMARY_MODEL });
    const result = await model.generateContent(`زانیاری مێژوویی و گەشتیاری و ناساندنی تەواو بۆ شاری (${cityName}) لە کوردستان بە زمانی کوردی پێشکەش بکە.`);
    return result.response.text();
  } catch (error) {
    const model = genAI.getGenerativeModel({ model: FALLBACK_MODEL });
    const result = await model.generateContent(`زانیاری مێژوویی و گەشتیاری و ناساندنی تەواو بۆ شاری (${cityName}) لە کوردستان بە زمانی کوردی پێشکەش بکە.`);
    return result.response.text();
  }
};

// ٦. یاریدەدەری تەندروستی (Health Assistant)
export const analyzeHealthImageStream = async (prompt: string, imageBase64?: string | null, mimeType: string = 'image/jpeg') => {
  const enforcedPrompt = `تکایە وەڵامی ئەم پرسیارە یان شیکاری ئەم وێنە پزیشکییە تەنها بە زمانی کوردی (سۆرانی) بدەرەوە و زاراوە پزیشکییەکان بە سادەیی ڕوون بکەرەوە:\n\n${prompt}`;
  const parts: any[] = [{ text: enforcedPrompt }];
  if (imageBase64) {
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    parts.push({ inlineData: { data: base64Data, mimeType } });
  }

  try {
    const model = genAI.getGenerativeModel({ model: PRIMARY_MODEL });
    return await model.generateContentStream(parts);
  } catch (error) {
    const model = genAI.getGenerativeModel({ model: FALLBACK_MODEL });
    return await model.generateContentStream(parts);
  }
};

// ٧. دروستکردنی سیناریۆی ڤیدیۆ (Video Studio)
export const generateKurdishVideo = async (prompt: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: PRIMARY_MODEL });
    const result = await model.generateContent(`بۆ ئەم وەسفەی خوارەوە، سیناریۆ (Script) و دیمەن بە دیمەنی ڕیکلامی بە زمانی کوردی شاهانە دروست بکە بۆ ئەوەی بیدەم بە ئای ئەی دروستکردنی ڤیدیۆ:\n"${prompt}"`);
    return result.response.text();
  } catch (error) {
    const model = genAI.getGenerativeModel({ model: FALLBACK_MODEL });
    const result = await model.generateContent(`بۆ ئەم وەسفەی خوارەوە, سیناریۆ (Script) و دیمەن بە دیمەنی ڕیکلامی بە زمانی کوردی شاهانە دروست بکە بۆ ئەوەی بیدەم بە ئای ئەی دروستکردنی ڤیدیۆ:\n"${prompt}"`);
    return result.response.text();
  }
};