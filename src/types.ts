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
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  } catch (e) {
    console.error("Error stopping female voice:", e);
  }
};

// 👩‍🦰 فەنکشنی دەستکاریکردنی فۆنەتیکی کوردی بۆ ئەوەی بزوێنەرەکان بە کوردییەکی ڕەوان بیخوێننەوە
export const normalizeKurdishForNaturalTTS = (text: string): string => {
  if (!text) return '';
  return text
    // لابردنی هێما و نیشانە نەخوازراوەکان
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`.*?`/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[\*\#\_\[\]\(\)\{\}\<\>\=\+\-\\\/\|\~]/g, ' ')
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, ' ')
    // پیتە تایبەتەکانی کوردی کە سێرڤەرەکان لێیان دەوەستن یان نایخوێننەوە
    .replace(/ڵ/g, 'ل')
    .replace(/ڕ/g, 'ر')
    .replace(/ێ/g, 'ي')
    .replace(/ۆ/g, 'و')
    .replace(/ڤ/g, 'ف')
    .replace(/پ/g, 'ب')
    .replace(/چ/g, 'تش')
    .replace(/ژ/g, 'ج')
    .replace(/گ/g, 'ك')
    .replace(/ە/g, 'ه')
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
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      activeVoiceAudioContext = ctx;

      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      activeVoiceSourceNode = source;

      // 👩‍🦰 ڕێکخستنی خێرایی و تۆن بە شێوەیەکی لەسەرخۆ و ڕەوان
      source.playbackRate.value = 1.12;

      // ١. فلتەری لابردنی تۆنی ئەستووری پیاوانە بە نەرمی (Smooth Highpass)
      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 140;

      // ٢. ڕووناککردنەوەی دەنگدانەوەی وشە کوردییەکان (Vocal Articulation Band)
      const peaking = ctx.createBiquadFilter();
      peaking.type = 'peaking';
      peaking.frequency.value = 2400;
      peaking.Q.value = 0.8;
      peaking.gain.value = 2.5;

      // ٣. بریقەداری و ڕوونی هاوشێوەی ستۆدیۆ (Highshelf Clarity)
      const highshelf = ctx.createBiquadFilter();
      highshelf.type = 'highshelf';
      highshelf.frequency.value = 7000;
      highshelf.gain.value = 1.8;

      const gainNode = ctx.createGain();
      gainNode.gain.value = 1.2;

      source.connect(highpass);
      highpass.connect(peaking);
      peaking.connect(highshelf);
      highshelf.connect(gainNode);
      gainNode.connect(ctx.destination);

      source.onended = () => {
        stopKurdishFemaleVoice();
        onEnded();
      };

      source.start(0);
      return;
    }
  } catch (err) {
    console.warn("Web Audio female synthesis error, falling to HTMLAudioElement:", err);
  }

  // ئەگەر وێب ئەودیۆ کارینەکرد
  try {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    activeStandardAudio = audio;
    (audio as any).preservesPitch = false;
    audio.playbackRate = 1.12;

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

  const cleanText = normalizeKurdishForNaturalTTS(text).slice(0, 600);
  const rawClean = text.replace(/```[\s\S]*?```/g, '').replace(/[#*`_]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 600);

  // ١. هەوڵدان بۆ وەرگرتنی دەنگ لە سێرڤەری سەرەکی
  try {
    const res = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: cleanText || rawClean })
    });

    if (res.ok) {
      const blob = await res.blob();
      if (blob && blob.size > 200) {
        await playKurdishFemaleVoice(blob, onEnded, onError);
        return;
      }
    }
  } catch (e) {
    console.warn("Primary Kurdish TTS failed, trying direct neural female stream:", e);
  }

  // ٢. ئەگەر سێرڤەر وەڵامی نەدایەوە، ستریمی دەماریی فۆنەتیک دەخوێنێتەوە
  try {
    const backupUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText || rawClean)}&tl=ar&client=tw-ob`;
    const res = await fetch(backupUrl);
    if (res.ok) {
      const blob = await res.blob();
      if (blob && blob.size > 200) {
        await playKurdishFemaleVoice(blob, onEnded, onError);
        return;
      }
    }
  } catch (e) {
    console.warn("Secondary stream failed, using Web Speech API female voice:", e);
  }

  // ٣. سیستەمی خۆماڵی لەناو وێبگەڕدا (Browser Native Speech Synthesis)
  try {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(cleanText || rawClean);
      utterance.pitch = 1.25;
      utterance.rate = 0.92;

      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v => 
        (v.lang.startsWith('ar') || v.lang.startsWith('fa') || v.lang.startsWith('ku')) &&
        (/female|salma|zariyah|fatima|laila|maryam|sara|zeina|hoda|rana|sana|noura|reem|mouna|amal|iman|damayanti/i.test(v.name))
      ) || voices.find(v => v.lang.startsWith('ar') || v.lang.startsWith('fa') || v.lang.startsWith('ku'));

      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      utterance.onend = () => onEnded();
      utterance.onerror = () => onError();

      window.speechSynthesis.speak(utterance);
      return;
    }
  } catch (err) {
    console.error("All female TTS attempts failed:", err);
  }

  onError();
};