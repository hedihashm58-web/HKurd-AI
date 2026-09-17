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

      // 👩‍🦰 بەرزکردنەوەی تۆنی دەنگ بۆ دەنگی سروشتیی و ڕەوانی ئافرەت (Female Vocal Formants & Pitch)
      source.playbackRate.value = 1.22;

      // ١. فلتەری لابردنی تۆنی ئەستووری پیاوانە (Highpass Filter)
      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 175;

      // ٢. بەرزکردنەوەی دەنگدانەوەی مێینە (Female Formant Resonance)
      const peaking = ctx.createBiquadFilter();
      peaking.type = 'peaking';
      peaking.frequency.value = 2900;
      peaking.Q.value = 1.1;
      peaking.gain.value = 4.0;

      // ٣. ڕووناککردنی دەنگ وەک ستۆدیۆ (Highshelf Clarity)
      const highshelf = ctx.createBiquadFilter();
      highshelf.type = 'highshelf';
      highshelf.frequency.value = 6000;
      highshelf.gain.value = 2.5;

      const gainNode = ctx.createGain();
      gainNode.gain.value = 1.15;

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

  // ئەگەر Web Audio کارینەکرد لەسەر مۆبایلە کۆنەکان
  try {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    activeStandardAudio = audio;
    (audio as any).preservesPitch = false;
    audio.playbackRate = 1.22;

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

  // ١. هەوڵدان بۆ وەرگرتنی دەنگ لە سێرڤەری سەرەکی
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
    console.warn("Primary Kurdish TTS failed, trying direct neural female stream:", e);
  }

  // ٢. ئەگەر سێرڤەر وەڵامی نەدایەوە، ستریمی دەماریی ڕاستەوخۆ دەخوێنێتەوە بە دەنگی ئافرەت
  try {
    const backupUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=ar&client=tw-ob`;
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

  // ٣. سیستەمی خۆماڵی بێنتەرنێت لەناو وێبگەڕدا (Browser Native Female Speech Synthesis)
  try {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.pitch = 1.35; // بەرزکردنەوەی تۆن بۆ ئافرەت
      utterance.rate = 0.95;

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