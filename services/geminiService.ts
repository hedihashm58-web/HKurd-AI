
import { GoogleGenAI, GenerateContentResponse, Type, Modality, Content } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";

export const generateKurdishVideo = async (
  prompt: string, 
  config: { resolution: '720p' | '1080p', aspectRatio: '16:9' | '9:16' },
  onStatusUpdate: (status: string, progress: number) => void
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const enhancedPrompt = `
    Hyper-realistic cinematic footage, 8k resolution, professional lighting, 
    highly detailed textures, realistic Kurdish cultural elements. 
    Description: ${prompt}
  `;

  onStatusUpdate('ڤیدیۆکە لە دروستکردندایە - دەستپێکردنی پڕۆسێس...', 5);
  
  let operation;
  try {
    operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: enhancedPrompt,
      config: {
        numberOfVideos: 1,
        resolution: config.resolution,
        aspectRatio: config.aspectRatio
      }
    });
  } catch (error: any) {
    console.error("Initiation error:", error);
    throw error;
  }

  onStatusUpdate('ڤیدیۆکە لە دروستکردندایە - ڕێندەرکردنی سینەمایی...', 15);

  let lastProgress = 15;
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    try {
      operation = await ai.operations.getVideosOperation({ operation: operation });
      const currentProgress = operation.metadata?.progressPercentage || lastProgress;
      lastProgress = Math.max(lastProgress, currentProgress);
      
      if (lastProgress < 40) onStatusUpdate('ڤیدیۆکە لە دروستکردندایە - داڕشتنی دیمەنەکان...', lastProgress);
      else if (lastProgress < 75) onStatusUpdate('ڤیدیۆکە لە دروستکردندایە - جێگیرکردنی ڕووناکی و وردەکاری...', lastProgress);
      else onStatusUpdate('ئامادەکردنی فایلی کۆتایی بۆ نیشاندان...', 98);
    } catch (pollError) {
      console.warn("Polling error, retrying...", pollError);
    }
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed at final stage");
  
  onStatusUpdate('لۆدکردنی ڤیدیۆ لە سێرڤەرەوە...', 99);

  const response = await fetch(`${downloadLink}&key=${process.env.GEMINI_API_KEY}`);
  if (!response.ok) throw new Error("Failed to download generated video");
  
  const blob = await response.blob();
  const videoBlobUrl = URL.createObjectURL(blob);
  
  onStatusUpdate('تەواو بوو!', 100);
  return videoBlobUrl;
};

export const generateKurdishArt = async (
  prompt: string, 
  style: string = 'Photorealistic', 
  quality: '1K' | '2K' = '1K',
  base64Image?: string | null,
  mimeType: string = 'image/jpeg'
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const modelToUse = quality === '2K' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
  
  const finalPrompt = base64Image 
    ? `Maintain the core identity of the person/object in this image but transform the scene into a ${style} masterpiece. ${prompt}. High resolution, cinematic lighting.`
    : `A ${style} professional artwork showing ${prompt}. 8k resolution, highly detailed, Kurdish aesthetic.`;

  const contents: any = { parts: [{ text: finalPrompt }] };
  if (base64Image) {
    contents.parts.unshift({ 
      inlineData: { 
        data: base64Image.includes(',') ? base64Image.split(',')[1] : base64Image, 
        mimeType 
      } 
    });
  }

  const response = await ai.models.generateContent({
    model: modelToUse,
    contents,
    config: { 
      imageConfig: { 
        aspectRatio: "1:1",
        ...(quality === '2K' ? { imageSize: '2K' } : {}) 
      } 
    }
  });

  const candidate = response.candidates?.[0];
  if (candidate?.content?.parts) {
    for (const part of candidate.content.parts) {
      if (part.inlineData?.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  throw new Error("No image was returned from the API");
};

export const getLandmarks = async (city: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `باسی مێژوو و تەواوی شوێنەوارە گەشتیاری و مێژووییە گرنگەکانی شاری ${city} و دەوروبەری بکە...`,
    config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { cityNarrative: { type: Type.STRING }, landmarks: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, category: { type: Type.STRING }, description: { type: Type.STRING }, imageQuery: { type: Type.STRING } }, required: ["name", "category", "description", "imageQuery"] } } }, required: ["cityNarrative", "landmarks"] } }
  });
  return JSON.parse(response.text || '{}');
};

export const analyzeHealthImageStream = async (base64Image: string | null, mimeType: string, userQuestion: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const parts: any[] = [{ text: `تۆ KurdAI Medicalیت... پرسیار: ${userQuestion}` }];
  if (base64Image) parts.unshift({ inlineData: { data: base64Image.split(',')[1], mimeType } });
  return await ai.models.generateContentStream({ model: 'gemini-3-flash-preview', contents: { parts } });
};

export const analyzeMathStream = async (query: string, base64Image: string | null, mimeType: string = 'image/jpeg') => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const parts: any[] = [{ text: query }];
  if (base64Image) parts.unshift({ inlineData: { data: base64Image.split(',')[1], mimeType } });
  return await ai.models.generateContentStream({ model: 'gemini-3-pro-preview', contents: { parts } });
};

export const translateKurdishStream = async (text: string, source: string, target: string, tone: string, base64Image?: string | null, mimeType: string = 'image/jpeg') => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `Translate to ${target} in ${tone} tone: ${text || "Translate this image"}`;
  const parts: any[] = [{ text: prompt }];
  if (base64Image) parts.unshift({ inlineData: { data: base64Image.split(',')[1], mimeType } });
  return await ai.models.generateContentStream({ model: 'gemini-3-flash-preview', contents: [{ parts }] });
};

export const chatWithKurdAIStream = async (message: string, history: any[] = [], imageBase64?: string | null, mimeType: string = 'image/jpeg') => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const contents: Content[] = history.map(h => ({
    role: h.role,
    parts: [{ text: h.text }]
  }));

  const userParts: any[] = [{ text: message }];
  if (imageBase64) {
    userParts.push({
      inlineData: {
        data: imageBase64.split(',')[1],
        mimeType
      }
    });
  }

  contents.push({ role: 'user', parts: userParts });

  return await ai.models.generateContentStream({
    model: 'gemini-3-flash-preview',
    contents,
    config: {
      systemInstruction: SYSTEM_PROMPT
    }
  });
};
