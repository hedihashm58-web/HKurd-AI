export enum View {
  HOME = 'home', // 👈 لێرەدا زیادکرا بۆ دیزاینە نوێیەکە
  CHAT = 'chat',
  EXPLORE = 'explore',
  TRANSLATE = 'translate',
  PERSONALITIES = 'personalities',
  SOCIAL_HOOK = 'social_hook',
  KURDISH_FLASHCARD = 'kurdish_flashcard',
  DOCUMENT_SUMMARIZER = 'document_summarizer',
  WEB_SUMMARIZER = 'web_summarizer',
  KURDISH_GRAMMAR = 'kurdish_grammar',
  OCR = 'ocr',
  PARAPHRASE = 'paraphrase',
  GRADUATION_RESEARCH = 'graduation_research',
  BRAIN_TRAINER = 'brain_trainer',
  EXAM_MAKER = 'exam_maker',
  USER_FEEDBACK = 'user_feedback'
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string;
  timestamp: Date;
}

// 👑 دەنگی دەماریی مێینەی شاهانەی کوردی (Royal Kurdish Neural Female Voice)
let activeStandardAudio: HTMLAudioElement | null = null;

export const stopKurdishFemaleVoice = () => {
  try {
    if (activeStandardAudio) {
      activeStandardAudio.pause();
      activeStandardAudio.currentTime = 0;
      activeStandardAudio = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  } catch (e) {
    console.error("Error stopping female voice:", e);
  }
};

// 👑 خاوێنکردنەوە و ڕێکخستنی دەقی کوردی سۆرانی بۆ خوێندنەوەی پاراو و شاهانە
export const cleanKurdishTextForTTS = (text: string): string => {
  if (!text) return '';
  return text
    // ١. ڕێکخستنی جۆرەکانی کیبۆرد بۆ یونیکۆدی دروستی کوردی
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ھ/g, 'ه')
    // ٢. لابردنی بلۆکی کۆد و کۆدی ناو دێڕ
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`.*?`/g, ' ')
    // لابردنی لینکەکان
    .replace(/https?:\/\/\S+/g, ' ')
    // لابردنی هێماکانی مارکداون و خاڵبەندی بێسوود
    .replace(/[\*\#\_\[\]\(\)\{\}\<\>\=\+\-\\\/\|\~]/g, ' ')
    // لابردنی ئیمۆجییەکان
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, ' ')
    // ٣. ڕێکخستنی وشە لێکدراوەکان بۆ تەڵەفوزی زۆر ڕوون لە زمانی کوردیدا
    .replace(/\bدەستخۆش\b/g, 'دەست خۆش')
    .replace(/\bدەستتخۆش\b/g, 'دەستت خۆش')
    .replace(/\bڕۆژباش\b/g, 'ڕۆژ باش')
    .replace(/\bشەوباش\b/g, 'شەو باش')
    .replace(/\bبەیانیباش\b/g, 'بەیانی باش')
    .replace(/\bسەرکەوتووبیت\b/g, 'سەرکەوتوو بیت')
    .replace(/\bسەرکەوتووبن\b/g, 'سەرکەوتوو بن')
    .replace(/\bخۆشحاڵم\b/g, 'خۆش حاڵم')
    .replace(/\bهەروەها\b/g, 'هەر وەها')
    .replace(/\bلێرەدا\b/g, 'لێرە دا')
    // دەربڕینی ڕوونی ناوە تەکنیکی و براندەکان بە کوردی
    .replace(/\bKurdAI Pro\b/gi, 'کورد ئەی ئای پرۆ')
    .replace(/\bKurdAI\b/gi, 'کورد ئەی ئای')
    .replace(/\bAI\b/g, 'ئەی ئای')
    .replace(/\bPDF\b/gi, 'پی دی ئێف')
    .replace(/\bOCR\b/gi, 'ئۆ سی ئاڕ')
    .replace(/\bGPT\b/gi, 'جی پی تی')
    .replace(/\bAPI\b/gi, 'ئەی پی ئای')
    .replace(/[\r\n]+/g, ' . ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const playKurdishFemaleVoice = async (
  audioBlob: Blob,
  onEnded: () => void,
  onError: () => void
): Promise<void> => {
  stopKurdishFemaleVoice();

  try {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.playbackRate = 1.05; // ⚡ خوێندنەوەی کەمێک خێراتر و پاراو وەک داواکرا
    activeStandardAudio = audio;

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      if (activeStandardAudio === audio) {
        activeStandardAudio = null;
      }
      onEnded();
    };

    audio.onerror = (e) => {
      URL.revokeObjectURL(audioUrl);
      if (activeStandardAudio === audio) {
        activeStandardAudio = null;
      }
      console.error("Audio playback error:", e);
      onError();
    };

    await audio.play();
  } catch (err) {
    console.error("Audio playback error:", err);
    onError();
  }
};

// 👑 کەشی مێمۆری لەسەر ئاستی کلاینت بۆ وەڵامدانەوەی دەستبەجێ بەبێ چاوەڕوانی (0ms)
const audioBlobCache = new Map<string, Blob>();

export const clearKurdishVoiceCache = () => {
  audioBlobCache.clear();
};

export const fetchAndPlayKurdishFemaleVoice = async (
  text: string,
  onStart: () => void,
  onEnded: () => void,
  onError: () => void
): Promise<void> => {
  stopKurdishFemaleVoice();

  if (!text || !text.trim()) {
    onError();
    return;
  }

  const cleanText = cleanKurdishTextForTTS(text);
  if (!cleanText) {
    onError();
    return;
  }

  // ئەگەر دەنگەکە پێشتر دروستکرابێت و لە کەشدا بێت، ڕاستەوخۆ بە 0 میلی چرکە لێی دەدات
  if (audioBlobCache.has(cleanText)) {
    const cachedBlob = audioBlobCache.get(cleanText)!;
    onStart();
    await playKurdishFemaleVoice(cachedBlob, onEnded, onError);
    return;
  }

  // بۆ وەڵامدانەوەی زۆر خێرا: دەرهێنانی ڕستەی سەرەتایی سروشتی تا نزیکەی ٢٠٠ پیت
  let speechText = cleanText;
  if (cleanText.length > 220) {
    const match = cleanText.slice(0, 240).match(/^([\s\S]{50,220}?)(?:[.!\n؟]|\s|$)/);
    if (match && match[1].trim().length > 25) {
      speechText = match[1].trim();
    } else {
      speechText = cleanText.slice(0, 200).trim();
    }
  }

  // ١. هەوڵدان لەگەڵ سێرڤەری سەرەکی بە دەنگی کوردیی سۆرانی (sorani_986 / Dilara)
  const endpoints = [
    'https://hedihashm-kurdai-chat-brain.hf.space/api/tts',
    '/api/tts',
    'http://localhost:8000/api/tts'
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: speechText })
      });

      if (res.ok) {
        const blob = await res.blob();
        if (blob && blob.size > 200) {
          if (audioBlobCache.size > 80) {
            const firstKey = audioBlobCache.keys().next().value;
            if (firstKey) audioBlobCache.delete(firstKey);
          }
          audioBlobCache.set(cleanText, blob);
          onStart();
          await playKurdishFemaleVoice(blob, onEnded, onError);
          return;
        }
      }
    } catch (e) {
      // بەردەوامبە بۆ سێرڤەری دواتر ئەگەر لە ئۆفلاین یان هێواش بوو
    }
  }

  // ٢. سیستەمی جێگرەوەی وێبگەڕ (Web Speech API) بە دەنگی مێینەی نەرم و لەسەرخۆ
  try {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.pitch = 1.0;
      utterance.rate = 1.08;

      const voices = window.speechSynthesis.getVoices();
      // گەڕان بە دوای دەنگی کوردی، پاشان فارسی/ئاریایی مێینە
      const femaleVoice = voices.find(v => 
        (v.lang.startsWith('ku') || v.lang.startsWith('ckb') || v.lang.startsWith('kmr'))
      ) || voices.find(v => 
        (v.lang.startsWith('fa') || v.lang.startsWith('ar')) &&
        (/dilara|female|woman|salma|zariyah|fatima|laila|maryam|sara|zeina|hoda|rana|sana|noura|reem|mouna|amal|iman/i.test(v.name))
      ) || voices.find(v => v.lang.startsWith('fa') || v.lang.startsWith('ar'));

      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      utterance.onend = () => onEnded();
      utterance.onerror = () => onError();

      onStart();
      window.speechSynthesis.speak(utterance);
      return;
    }
  } catch (err) {
    console.error("Browser TTS fallback failed:", err);
  }

  onError();
};