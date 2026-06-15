import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "../constants";

// وەرگرتنی کلیلەکە لە .env
const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// دانانی مۆدێلەکە لەسەر ئەوەی خۆت داوات کردووە
const MODEL_NAME = 'gemini-1.5-flash';

// ١. چاتی سەرەکی کوردی بە شێوازی ستریم
export const chatWithKurdAIStream = async (message: string, history: any[] = [], imageBase64?: string | null, mimeType: string = 'image/jpeg') => {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME, systemInstruction: SYSTEM_PROMPT });
  
  // پاککردنەوە و ڕێکخستنی مێژووەکە بە شێوەیەکی زۆر توند بۆ ئەوەی گووگڵ کێشە دروست نەکات
  let rawHistory = history.map(h => ({ role: h.role === 'model' ? 'model' : 'user', parts: [{ text: h.text }] }));
  let safeHistory: any[] = [];
  let nextExpectedRole = 'user';

  for (const msg of rawHistory) {
    if (msg.role === nextExpectedRole && msg.parts[0].text.trim() !== "") {
      safeHistory.push(msg);
      nextExpectedRole = nextExpectedRole === 'user' ? 'model' : 'user';
    }
  }

  // ئەگەر کۆتا نامە هی بەکارهێنەر بوو و وەڵام نەدرابووەوە، لای دەبەین بۆ ئەوەی مێژووەکە تێک نەچێت
  if (safeHistory.length > 0 && safeHistory[safeHistory.length - 1].role === 'user') {
    safeHistory.pop();
  }

  const chat = model.startChat({ history: safeHistory });
  
  const userParts: any[] = [{ text: message }];
  if (imageBase64) {
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    userParts.push({ inlineData: { data: base64Data, mimeType } });
  }
  
  return await chat.sendMessageStream(userParts);
};

// ٢. دروستکردنی ئارت و وێنە (پڕۆمپت)
export const generateKurdishArt = async (prompt: string, style: string = 'Photorealistic') => {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const result = await model.generateContent(`A ${style} professional artwork showing ${prompt}.`);
  return result.response.text();
};

// ٣. شیکاری ماتماتیکی (Math Analyzer)
export const analyzeMathStream = async (problemDescription: string, imageBase64?: string | null, mimeType: string = 'image/jpeg') => {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const parts: any[] = [{ text: `تکایە ئەم کێشە ماتماتیکییە شیکار بکە و هەنگاو بە هەنگاو بە زمانی کوردی ڕوونی بکەرەوە:\n${problemDescription}` }];
  
  // ئەگەر بەکارهێنەر وێنەی کێشە بیرکارییەکەی ناردبوو
  if (imageBase64) {
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    parts.push({ inlineData: { data: base64Data, mimeType } });
  }
  
  const result = await model.generateContentStream(parts);
  return result;
};

// ٤. وەرگێڕانی کوردی (Translator)
export const translateKurdishStream = async (text: string, sourceLang: string, targetLanguage: string, tone: string, imageBase64?: string | null, mimeType: string = 'image/jpeg') => {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  
  let promptText = `ئەم دەقە وەربگێڕە لە زمانی (${sourceLang}) بۆ زمانی (${targetLanguage}). پێویستە تۆنی وەرگێڕانەکە بە شێوازی (${tone}) بێت.\n`;
  if (text.trim()) promptText += `دەقەکە ئەمەیە:\n"${text}"`;
  else promptText += `تکایە ئەو دەقە وەربگێڕە کە لە وێنەکەدا دەردەکەوێت.`;

  const parts: any[] = [{ text: promptText }];
  
  if (imageBase64) {
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    parts.push({ inlineData: { data: base64Data, mimeType } });
  }

  const result = await model.generateContentStream(parts);
  return result;
};

// ٥. زانیاری شوێنەوارەکانی کوردستان (Landmark Explorer)
export const getLandmarks = async (cityName: string) => {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const result = await model.generateContent(`زانیاری مێژوویی و گەشتیاری و ناساندنی تەواو بۆ شاری (${cityName}) لە کوردستان بە زمانی کوردی پێشکەش بکە.`);
  return result.response.text();
};

// ٦. یاریدەدەری تەندروستی (Health Assistant)
export const analyzeHealthImageStream = async (prompt: string, imageBase64?: string | null, mimeType: string = 'image/jpeg') => {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  
  // لێرەدا بە توندی ناچاری دەکەین کە تەنها بە کوردی وەڵام بداتەوە
  const enforcedPrompt = `تکایە وەڵامی ئەم پرسیارە یان شیکاری ئەم وێنە پزیشکییە تەنها بە زمانی کوردی (سۆرانی) بدەرەوە و زاراوە پزیشکییەکان بە سادەیی ڕوون بکەرەوە:\n\n${prompt}`;
  
  const parts: any[] = [{ text: enforcedPrompt }];
  
  if (imageBase64) {
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    parts.push({ inlineData: { data: base64Data, mimeType } });
  }
  
  const result = await model.generateContentStream(parts);
  return result;
};

// ٧. دروستکردنی سیناریۆی ڤیدیۆ (Video Studio)
export const generateKurdishVideo = async (prompt: string) => {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const result = await model.generateContent(`بۆ ئەم وەسفەی خوارەوە، سیناریۆ (Script) و دیمەن بە دیمەنی ڕیکلامی بە زمانی کوردی شاهانە دروست بکە بۆ ئەوەی بیدەم بە ئای ئەی دروستکردنی ڤیدیۆ:\n"${prompt}"`);
  return result.response.text();
};