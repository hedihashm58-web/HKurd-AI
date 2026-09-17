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

// 👩‍🦰 دەنگی دەماریی مێینەی کوردی (Neural Kurdish Female Voice)
let activeVoiceAudioContext: any = null;
let activeVoiceSourceNode: any = null;
let activeStandardAudio: HTMLAudioElement | null = null;

export const stopKurdishFemaleVoice = () => {
  try {
    if (activeVoiceSourceNode) {
      activeVoiceSourceNode.stop();
      activeVoiceSourceNode.disconnect();
      activeVoiceSourceNode = null;
    }
    if (activeVoiceAudioContext && activeVoiceAudioContext.state !== 'closed') {
      activeVoiceAudioContext.close();
      activeVoiceAudioContext = null;
    }
    if (activeStandardAudio) {
      activeStandardAudio.pause();
      activeStandardAudio = null;
    }
  } catch (e) {
    console.error("Error stopping female voice:", e);
  }
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
    activeStandardAudio = audio;
    audio.playbackRate = 1.0;

    audio.onended = () => {
      activeStandardAudio = null;
      onEnded();
    };

    audio.onerror = () => {
      activeStandardAudio = null;
      onError();
    };

    await audio.play();
  } catch (err) {
    console.error("Audio playback error:", err);
    onError();
  }
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

  onStart();

  const cleanText = text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`.*?`/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[#*`_~>\[\]\(\)\{\}\|=+\-\\]/g, ' ')
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 600);

  // 1. هەوڵدان بۆ وەرگرتنی دەنگ لە بزوێنەری دەماریی تایبەت
  try {
    const res = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: cleanText })
    });

    if (res.ok) {
      const blob = await res.blob();
      if (blob && blob.size > 200) {
        await playKurdishFemaleVoice(blob, onEnded, onError);
        return;
      }
    }
  } catch (e) {
    console.warn("Primary Kurdish TTS failed, falling back to secondary engine:", e);
  }

  // 2. ئەگەر سێرڤەر خاو یان لۆد بوو، بزوێنەری دەرەکی زۆر ڕەوان و سروشتی بەکاردێت
  try {
    const backupUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=ar&client=tw-ob`;
    const audio = new Audio(backupUrl);
    activeStandardAudio = audio;
    audio.playbackRate = 0.95;

    audio.onended = () => {
      activeStandardAudio = null;
      onEnded();
    };

    audio.onerror = () => {
      activeStandardAudio = null;
      onError();
    };

    await audio.play();
  } catch (err) {
    console.error("All Kurdish Female Voice engines failed:", err);
    onError();
  }
};