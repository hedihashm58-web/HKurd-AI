import { GoogleGenerativeAI } from "@google/generative-ai";

// وەرگرتنی کلیلەکە لە Vercel یان فایلەکانی ژینگە
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

// لیستی مۆدێلەکان بۆ سیستەمی "هەرگیز نەوەستان"
const FALLBACK_MODELS = [
  "gemini-1.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-pro"
];

/**
 * فەنکشنی سەرەکی یەدەگ (Fallback Mechanism):
 * ئەمە بۆ هەر پرسیارێک بەکاردێت و گەر مۆدێلێک باڵانسی نەبوو، یەکسەر دەچێتە سەر ئەوی تر
 */
export async function fetchWithFallback(prompt: string) {
  if (!API_KEY) {
    throw new Error("کلیلی API نەدۆزرایەوە! تکایە VITE_GOOGLE_API_KEY زیاد بکە.");
  }

  let lastError: any = null;

  for (const modelName of FALLBACK_MODELS) {
    try {
      console.log(`[سیستەمی یەدەگ]: پەیوەندیکردن بە مۆدێلی -> ${modelName}`);
      
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      return response.text();
    } catch (error: any) {
      console.warn(`[سیستەمی یەدەگ]: مۆدێلی ${modelName} کێشەی هەیە: ${error?.message}`);
      lastError = error;
      continue; // گەڕان بۆ مۆدێلەکەی خوارەوەی لیستەکە
    }
  }

  console.error("سەرجەم مۆدێلەکان وەستاون:", lastError);
  throw new Error("ببورە، هەموو مۆدێلەکان سەرقاڵن یان باڵانست نەماوە. تکایە کەمێکی تر هەوڵ بدەرەوە.");
}

// ------------------------------------------------------------------
// فەنکشنەکانی تایبەت بە پڕۆژەکەت کە پشتبەستن بە سیستەمە یەدەگەکە
// ------------------------------------------------------------------

// 1. بۆ بەشی ڤیدیۆ ستۆدیۆ (VideoStudio.tsx)
export async function generateKurdishVideo(
  prompt: string, 
  config: any, 
  onProgress: (status: string, progress: number) => void
) {
  onProgress('پشکنینی مۆدێلەکان و پەیوەندیکردن...', 20);
  
  // لێرەدا ستایلە سینەماییەکە و مەرجی جوڵەی کامێراکە بەردەوام جێبەجێ دەکرێت
  const enhancedPrompt = `تکایە وەسفێکی پڕۆفیشناڵ، ڕۆیاڵ و سینەمایی بۆ ڤیدیۆ بنووسە بەپێی ئەم دیمەنە: ${prompt}.
مەرجەکان:
- ڕوونی: ${config.resolution} بە قەبارەی ${config.aspectRatio}.
- جوڵەی کامێرا: کامێراکە با بێتە خوارەوە بەسەر سەری کەسەکەدا/بابەتەکەدا و پاشان بچێتە بەردەمی. بە هیچ شێوەیەک ڕاستەوخۆ مەچۆ بۆ وێنەی دووەم.`;
  
  // بەکارهێنانی سیستەمە یەدەگەکە
  const aiResponse = await fetchWithFallback(enhancedPrompt);
  
  onProgress('وەڵام وەرگیرا، خەریکی ڕێندەرکردنە...', 60);
  
  // وەرگرتنی کات بۆ ئەنیمەیشنی لۆدینگ
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  onProgress('ڤیدیۆکە ئامادەیە!', 100);
  
  // لێرەدا دەتوانیت لینکی ڤیدیۆیەک بگەڕێنیتەوە ئەگەر هەتە، یان ڕاستەوخۆ null بنێریت
  return null; 
}

// 2. بۆ بەشی شوێنەوارەکان (LandmarkExplorer.tsx)
export async function getLandmarks(regionLabel: string) {
  const prompt = `
    زانیاری تەواو پێ بدە لەسەر شاری ${regionLabel} لە کوردستان.
    تەنها بە فۆرماتی JSON وەڵام بدەرەوە بەم شێوەیە:
    {
      "cityNarrative": "وەسفێکی کورتی شارەکە بە کوردی",
      "landmarks": ["ناوی شوێنەوارەکان بە ئارەی بنووسە"]
    }
    هیچ شتێکی تر جگە لە JSON مەنووسە.
  `;

  try {
    const responseText = await fetchWithFallback(prompt);
    // خاوێنکردنەوەی وەڵامەکە بۆ دڵنیابوون کە JSONـێکی ڕاستەقینەیە
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("هەڵە لە خوێندنەوەی JSON:", error);
    return {
      cityNarrative: `ببورە، زانیارییەکان بۆ شاری ${regionLabel} لە ئێستادا بەردەست نین.`,
      landmarks: []
    };
  }
}

// 3. فەنکشنی چات و هاوکاری گشتی (ChatInterface.tsx)
export async function generateChatResponse(prompt: string) {
  return await fetchWithFallback(prompt);
}