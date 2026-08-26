/* eslint-disable */
// @ts-nocheck
import React, { useState, useRef } from 'react';
import { auth } from '../firebase';

interface FlashcardProps {
  language?: 'ku' | 'ar';
}

interface CardData {
  word: string;
  meaning_kurdish?: string;
  kurmanji?: string;
  hawrami?: string;
  kelhuri?: string;
  zazaki?: string;
  dialects?: string;
  english: string;
  arabic: string;
  example: string;
  category?: string;
}

const KurdishFlashcard: React.FC<FlashcardProps> = ({ language = 'ku' }) => {
  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleGenerateCard = async () => {
    setLoading(true);
    setError(null);

    try {
      const userEmail = auth.currentUser?.email || "guest_user";

      const response = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/kurdish-flashcard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          category: 'random',
          email: userEmail 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.detail && data.detail.includes("LIMIT_EXCEEDED_FLASHCARD_DAILY")) {
          throw new Error("LIMIT_EXCEEDED_FLASHCARD_DAILY");
        }
        if (data.detail && data.detail.includes("LIMIT_EXCEEDED_FLASHCARD_PREMIUM_DAILY")) {
          throw new Error("LIMIT_EXCEEDED_FLASHCARD_PREMIUM_DAILY");
        }
        throw new Error(data.detail || "سێرڤەر وەڵامی نەدایەوە.");
      }

      const parsedCard = jsonCleanAndParse(data.response);
      setCard(parsedCard);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("LIMIT_EXCEEDED_FLASHCARD_DAILY")) {
        setError("⚠️ لێمیتی ڕۆژانەی فلاشکارتی خۆڕایی تەواو بووە! تکایە بۆ بینینی زیاتر بەشداری پاکێجەکان بکە.");
      } else if (err.message?.includes("LIMIT_EXCEEDED_FLASHCARD_PREMIUM_DAILY")) {
        setError("⚠️ پلانی ١ مانگی ڕێگەت پێدەدات ڕۆژانە ٣ فلاشکارت ببینی. بۆ بینینی بێسنوور پلانەکەت بەرزبکەرەوە!");
      } else {
        setError("ببوورە، کێشەیەک لە لۆدکردنی فلاشکارتەکەدا هەبوو.");
      }
    } finally {
      setLoading(false);
    }
  };

  const jsonCleanAndParse = (rawStr: string) => {
    if (typeof rawStr !== 'string') return rawStr;
    let cleanStr = rawStr.trim();
    if (cleanStr.includes("```json")) {
      cleanStr = cleanStr.split("```json")[1].split("```")[0];
    } else if (cleanStr.includes("```")) {
      cleanStr = cleanStr.split("```")[1].split("```")[0];
    }
    return JSON.parse(cleanStr.trim());
  };

  const copyCardInfo = () => {
    if (!card) return;
    const textToCopy = `✨ وشەی کوردی: ${card.word}\n📖 مانا: ${card.meaning_kurdish || ''}\n⛰️ کرمانجی: ${card.kurmanji || card.word}\n🌺 هەورامی: ${card.hawrami || card.word}\n🏰 کەلهوڕی: ${card.kelhuri || card.word}\n🌊 زازاکی: ${card.zazaki || card.word}\n🇬🇧 ئینگلیزی: ${card.english}\n🇸🇦 عەرەبی: ${card.arabic}\n✍️ نموونە: "${card.example}"`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlayAudio = async () => {
    if (!card) return;
    if (isPlayingAudio && audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
      return;
    }

    try {
      setIsPlayingAudio(true);
      const textToRead = `${card.word}. ${card.meaning_kurdish ? card.meaning_kurdish + '.' : ''} ${card.example}`;
      const res = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToRead.slice(0, 300) })
      });

      if (!res.ok) throw new Error("TTS failed");
      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => setIsPlayingAudio(false);
      audio.play();
    } catch (e) {
      console.error(e);
      setIsPlayingAudio(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-2 sm:py-4 space-y-4 sm:space-y-6 animate-in fade-in duration-500 pb-24" dir="rtl">
      
      {/* 🧭 سەرپەڕە */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-amber-950/40 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-800/80 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3 text-right">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl sm:text-2xl shadow-[0_0_20px_rgba(245,158,11,0.2)] shrink-0">
            📚
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>فەرهەنگ و وشەی پەتی کوردی</span>
              <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono font-bold uppercase">
                Lexicon Pro
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-400">ئاشنابوون بە وشە ڕەسەنەکان و هاوتاکانیان بە زاراوەکانی (کرمانجی، هەورامی، کەلهوڕی و زازاکی)</p>
          </div>
        </div>
      </div>

      {/* 🔮 کارتی سەرەکی فلاشکارت */}
      <div className="w-full bg-slate-900/60 backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] border border-slate-800/90 p-4 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-16 text-center">
            <div className="w-12 h-12 border-3 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-amber-400 animate-pulse">KurdAI خەریکی دۆزینەوەی وشەیەکی ڕەسەن و بەپێزی کوردییە...</p>
              <p className="text-xs text-zinc-500">پشکنینی زاراوەکانی بادینی، هەورامی، کەلهوڕی و زازاکی</p>
            </div>
          </div>
        ) : card ? (
          <div className="space-y-5 animate-in zoom-in-95 duration-300">
            
            {/* 👑 سەرپەڕەی وشەکە */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-gradient-to-r from-amber-500/10 via-slate-950/60 to-amber-500/10 p-5 rounded-2xl border border-amber-500/20 text-center sm:text-right">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-amber-400/80 uppercase tracking-wider block">
                  {card.category ? `پۆل: ${card.category}` : 'وشەی پەتی و ڕەسەن:'}
                </span>
                <h1 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-200 tracking-tight font-['Noto_Sans_Arabic']">
                  {card.word}
                </h1>
                {card.meaning_kurdish && (
                  <p className="text-xs sm:text-sm text-zinc-300 font-medium pt-1">
                    {card.meaning_kurdish}
                  </p>
                )}
              </div>

              {/* دوگمەکانی خێرای لای سەرەوە */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handlePlayAudio}
                  className={`p-2.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm cursor-pointer ${
                    isPlayingAudio
                      ? 'bg-red-950/60 border-red-500/40 text-red-300 animate-pulse'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-zinc-200 hover:text-white'
                  }`}
                  title="گوێگرتن بە دەنگی کوردی"
                >
                  <span>{isPlayingAudio ? "⏹️" : "🎙️"}</span>
                  <span className="hidden sm:inline">{isPlayingAudio ? "وەستاندن" : "گوێگرتن"}</span>
                </button>

                <button
                  onClick={copyCardInfo}
                  className="p-2.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-zinc-200 hover:text-white transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                  title="کۆپیکردنی زانیاریی کارتەکە"
                >
                  <span>{copied ? "✓" : "📋"}</span>
                  <span className="hidden sm:inline">{copied ? "کۆپی کرا" : "کۆپیکردن"}</span>
                </button>
              </div>
            </div>

            {/* ⛰️ زاراوە و شێوەزارەکانی کوردستانی مەزن (Dialect Grid) */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5 pr-1">
                <span>🗣️</span>
                <span>هاوتای وشەکە بە زاراوەکانی تری زمانی کوردی:</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                
                {/* ١. کرمانجی سەروو (بادینی) */}
                <div className="p-3 bg-slate-950/70 border border-slate-800 hover:border-emerald-500/40 rounded-2xl text-right transition-all space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <span>⛰️</span>
                      <span>کرمانجی سەروو (Badînî)</span>
                    </span>
                  </div>
                  <p className="text-sm font-black text-white truncate">
                    {card.kurmanji && card.kurmanji !== '-' ? card.kurmanji : card.word}
                  </p>
                </div>

                {/* ٢. هەورامی (گۆرانی) */}
                <div className="p-3 bg-slate-950/70 border border-slate-800 hover:border-violet-500/40 rounded-2xl text-right transition-all space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-violet-400 flex items-center gap-1">
                      <span>🌺</span>
                      <span>هەورامی (Goranî)</span>
                    </span>
                  </div>
                  <p className="text-sm font-black text-white truncate">
                    {card.hawrami && card.hawrami !== '-' ? card.hawrami : card.word}
                  </p>
                </div>

                {/* ٣. کەلهوڕی / فەیلی / لکی */}
                <div className="p-3 bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 rounded-2xl text-right transition-all space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-cyan-400 flex items-center gap-1">
                      <span>🏰</span>
                      <span>کەلهوڕی / فەیلی (باشوور)</span>
                    </span>
                  </div>
                  <p className="text-sm font-black text-white truncate">
                    {card.kelhuri && card.kelhuri !== '-' ? card.kelhuri : card.word}
                  </p>
                </div>

                {/* ٤. زازاکی / دملکی */}
                <div className="p-3 bg-slate-950/70 border border-slate-800 hover:border-rose-500/40 rounded-2xl text-right transition-all space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-rose-400 flex items-center gap-1">
                      <span>🌊</span>
                      <span>زازاکی (Zazakî / Dimilî)</span>
                    </span>
                  </div>
                  <p className="text-sm font-black text-white truncate">
                    {card.zazaki && card.zazaki !== '-' ? card.zazaki : card.word}
                  </p>
                </div>

              </div>
            </div>

            {/* 🌍 وەرگێڕان بۆ زمانە بیانییەکان */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 🇬🇧 بۆکسی ئینگلیزی */}
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl text-left flex flex-col justify-between space-y-1" dir="ltr">
                <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block text-right">
                  🇬🇧 English Translation:
                </span>
                <p className="text-zinc-100 text-xs sm:text-sm font-bold font-mono leading-relaxed">
                  {card.english}
                </p>
              </div>
              
              {/* 🇸🇦 بۆکسی عەرەبی */}
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl text-right flex flex-col justify-between space-y-1">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                  🇸🇦 المعنى باللغة العربية:
                </span>
                <p className="text-zinc-100 text-xs sm:text-sm font-bold leading-relaxed">
                  {card.arabic}
                </p>
              </div>
            </div>

            {/* ✍️ نموونەی بەکارهێنان لە ڕستەدا */}
            <div className="p-4 bg-gradient-to-r from-amber-950/20 via-slate-950/60 to-amber-950/20 border border-amber-500/20 rounded-2xl text-right space-y-1.5">
              <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <span>✍️</span>
                <span>بەکارهێنان لە ڕستەی نموونەییدا:</span>
              </span>
              <p className="text-zinc-200 text-xs sm:text-sm leading-relaxed font-medium">
                «{card.example}»
              </p>
            </div>

            {/* 🔄 دوگمەی هێنانەوەی وشەیەکی نوێتر پاش هێنانەوەی وشەکە */}
            <button
              onClick={handleGenerateCard}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-black text-sm sm:text-base rounded-2xl transition-all shadow-[0_0_30px_rgba(245,158,11,0.35)] hover:shadow-[0_0_40px_rgba(245,158,11,0.55)] active:scale-98 disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer border border-amber-400/50 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            >
              <span>✨</span>
              <span>گەڕان بە دوای وشەیەکی تری کوردی</span>
            </button>

          </div>
        ) : (
          /* 🌟 شوێنی دەستپێک کاتێک هێشتا گەڕان نەکراوە */
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/15 border-2 border-amber-500/30 flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(245,158,11,0.25)] animate-pulse">
              📚
            </div>
            
            <div className="space-y-2 max-w-md">
              <h3 className="text-lg sm:text-xl font-black text-white">فەرهەنگی وشەی کوردیی پەتی</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed px-2">
                گەنجینەی دەوڵەمەندی وشە ڕەسەنەکانی کوردی لەگەڵ تەواوی هاوتاکانی بە زاراوەکانی کرمانجی، هەورامی، کەلهوڕی و زازاکی.
              </p>
            </div>

            {/* 🌟 دوگمەی گەورە و زۆر ڕوون بە نوسینی سپی و دیار */}
            <button
              onClick={handleGenerateCard}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-black text-sm sm:text-base rounded-2xl transition-all shadow-[0_0_35px_rgba(245,158,11,0.45)] hover:shadow-[0_0_45px_rgba(245,158,11,0.65)] active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer border-2 border-amber-400/80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            >
              <span className="text-lg">✨</span>
              <span>گەڕان بە دوای وشەی پەتی</span>
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-500/30 rounded-xl text-red-300 text-xs font-bold text-center animate-in fade-in">
            {error}
          </div>
        )}

      </div>

    </div>
  );
};

export default KurdishFlashcard;