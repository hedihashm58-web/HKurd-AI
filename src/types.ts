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
    const arrayBuffer = await audioBlob.arrayBuffer();
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) throw new Error("No Web Audio");

    const ctx = new AudioCtx();
    activeVoiceAudioContext = ctx;

    const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);
    const source = ctx.createBufferSource();
    source.buffer = decodedBuffer;

    // 👩‍🦰 بەرزکردنەوەی پەیڕەوی دەنگ بۆ ئاستی دەنگی ئافرەت (Female Vocal Pitch)
    // 1.15x بەرزکردنەوەیەکی زۆر هاوسەنگە کە دەنگەکە لە پیاوەوە دەگۆڕێت بۆ ئافرەت بێ ئەوەی ڕۆبۆتی یان خێرا بێت
    source.playbackRate.value = 1.15;

    // فلتەری نەرمکردنەوەی شەپۆلی دەنگ (Formant Shaping for Female Tone)
    const femaleHighPass = ctx.createBiquadFilter();
    femaleHighPass.type = 'highpass';
    femaleHighPass.frequency.value = 160; // لابردنی زلی پیاوانە

    const femalePresence = ctx.createBiquadFilter();
    femalePresence.type = 'peaking';
    femalePresence.frequency.value = 2400; // بەرزکردنەوەی لەرەلەری دەنگی مێینە
    femalePresence.Q.value = 0.8;
    femalePresence.gain.value = 3.5;

    source.connect(femaleHighPass);
    femaleHighPass.connect(femalePresence);
    femalePresence.connect(ctx.destination);

    activeVoiceSourceNode = source;

    source.onended = () => {
      activeVoiceSourceNode = null;
      onEnded();
    };

    source.start(0);
  } catch (err) {
    try {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      activeStandardAudio = audio;
      audio.playbackRate = 1.14;
      (audio as any).preservesPitch = false;

      audio.onended = () => {
        activeStandardAudio = null;
        onEnded();
      };
      audio.onerror = () => {
        activeStandardAudio = null;
        onError();
      };
      await audio.play();
    } catch (e) {
      onError();
    }
  }
};