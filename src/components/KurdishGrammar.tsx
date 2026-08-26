/* eslint-disable */
// @ts-nocheck
import React, { useState, useRef } from 'react';
import { auth } from '../firebase';

interface KurdishGrammarProps {
  language: 'ku' | 'ar';
}

const KurdishGrammar: React.FC<KurdishGrammarProps> = ({ language }) => {
  const [text, setText] = useState('');
  const [correctedText, setCorrectedText] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [errorCount, setErrorCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleFixGrammar = async () => {
    if (!text.trim() || loading) return;

    setLoading(true);
    setError(null);
    setCorrectedText(null);
    setExplanation(null);
    setErrorCount(null);

    try {
      const userEmail = auth.currentUser?.email || "guest_user";
      
      const response = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/kurdish-grammar', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: text.trim(), 
          email: userEmail
        }), 
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.detail && data.detail.includes("LIMIT_EXCEEDED_GRAMMAR")) {
          throw new Error("LIMIT_EXCEEDED_GRAMMAR");
        }
        throw new Error(data.detail || "سێرڤەر وەڵامی نەدایەوە.");
      }

      try {
        const parsedData = jsonCleanAndParse(data.response);
        if (parsedData && parsedData.corrected) {
          setCorrectedText(parsedData.corrected);
          setExplanation(parsedData.explanation || null);
          setErrorCount(parsedData.error_count ?? null);
        } else {
          setCorrectedText(data.response);
        }
      } catch (jsonErr) {
        if (typeof data.response === 'string' && data.response.trim().startsWith('{')) {
          try {
            const fixedJson = JSON.parse(data.response.trim());
            setCorrectedText(fixedJson.corrected);
            setExplanation(fixedJson.explanation || null);
            setErrorCount(fixedJson.error_count ?? null);
          } catch (e) {
            setCorrectedText(data.response);
          }
        } else {
          setCorrectedText(data.response);
        }
      }

    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("LIMIT_EXCEEDED_GRAMMAR") || err.message?.includes("تەواو بوو")) {
        setError(
          language === 'ku' 
            ? "⚠️ لێمیتی پشکنینی خۆڕایی ڕێنووس تەواو بوو! تکایە بەشداری پاکێجەکان بکە." 
            : "⚠️ انتهت فترة التجربة المجانية لمصحح القواعد! يرجى الاشتراك للاستمرار."
        );
      } else {
        setError(language === 'ku' ? "ببوورە، خەتایەک لە پەیوەندیکردن بە سێرڤەر ڕوویدا." : "عذراً، حدث خطأ في الخادم.");
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

  const copyToClipboard = () => {
    if (!correctedText) return;
    navigator.clipboard.writeText(correctedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pasteFromClipboard = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) setText(clip);
    } catch (e) {
      console.error(e);
    }
  };

  // خوێندنەوەی دەقی ڕاستکراوە بە دەنگی دەماریی کوردی
  const handlePlayAudio = async () => {
    if (!correctedText) return;
    if (isPlayingAudio && audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
      return;
    }

    try {
      setIsPlayingAudio(true);
      const res = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: correctedText.slice(0, 400) })
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

  // نەخشەی جیاوازی لاینەکان
  const renderDiff = () => {
    if (!text || !correctedText) return null;

    const originalWords = text.trim().split(/\s+/);
    const correctedWords = correctedText.trim().split(/\s+/);

    return (
      <div className="flex flex-wrap gap-x-2 gap-y-2.5 text-right justify-start leading-relaxed select-text font-medium text-xs sm:text-sm w-full" dir="rtl">
        {correctedWords.map((word, idx) => {
          const existsInOriginal = originalWords.includes(word);
          const originalWord = originalWords[idx] || "";

          if (!existsInOriginal && word !== originalWord) {
            return (
              <span key={idx} className="inline-flex flex-col items-center px-2 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 shadow-sm animate-in fade-in duration-200">
                <span className="text-emerald-300 font-bold">{word}</span>
                {originalWord && !correctedWords.includes(originalWord) && (
                  <span className="text-[10px] line-through text-red-400/80 font-mono mt-0.5">
                    {originalWord}
                  </span>
                )}
              </span>
            );
          }
          
          return <span key={idx} className="text-zinc-200 py-1">{word}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-4 space-y-4 sm:space-y-6 animate-in fade-in duration-500 pb-24" dir="rtl">
      
      {/* 🧭 سەرپەڕە */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-emerald-950/40 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-800/80 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3 text-right">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xl sm:text-2xl shadow-[0_0_20px_rgba(16,185,129,0.2)] shrink-0">
            ✍️
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>ڕێنووس و ڕاستکردنەوەی زمانی کوردی</span>
              <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-bold uppercase">
                Grammar Pro
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-400">پشکنینی ووردی پیتەکان (ڵ/ڕ/ڤ/ۆ/ێ)، پێشگر، پاشگر، خاڵبەندی و ڕێساکانی ئەکادیمیای کوردی</p>
          </div>
        </div>
      </div>

      {/* 🌟 بۆکسی سەرەکی: دەقی سەرەکی و دەقی چاککراو */}
      <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] border border-slate-800/90 shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-slate-800/80">
          
          {/* بەشی لای ڕاست: دەقی بەکارهێنەر */}
          <div className="flex flex-col justify-between p-3.5 sm:p-5 relative">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/40 text-xs">
              <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                <span>📝</span>
                <span>دەقی سەرەکی (پڕ لە هەڵەی ڕێنووس)</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono font-bold">
                {text.length} پیت
              </span>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="دەقە کوردییەکەت لێرە بنووسە یان کۆپی بکە تا بە تەواوی ڕێنووس و خاڵبەندییەکەی بۆت چاک بکرێت..."
              className="w-full flex-1 bg-transparent text-white text-sm sm:text-base focus:outline-none resize-none placeholder-zinc-500 leading-relaxed text-right font-medium min-h-[140px] sm:min-h-[220px]"
              maxLength={5000}
            />

            <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-800/40 text-xs">
              <div className="flex items-center gap-1.5">
                {text ? (
                  <button
                    onClick={() => { setText(''); setCorrectedText(null); setExplanation(null); }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-zinc-400 hover:text-white transition-all text-[11px] font-bold"
                  >
                    ✕ پاککردنەوە
                  </button>
                ) : (
                  <button
                    onClick={pasteFromClipboard}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-zinc-300 hover:text-white transition-all text-[11px] font-bold active:scale-95"
                  >
                    📋 پێوەنووساندن
                  </button>
                )}
              </div>

              <button
                onClick={handleFixGrammar}
                disabled={!text.trim() || loading}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-lg active:scale-95 ${
                  text.trim() && !loading
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/25 cursor-pointer'
                    : 'bg-zinc-800/60 text-zinc-600 border border-zinc-800 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>خەریکی پشکنینە...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>پشکنین و ڕاستکردنەوە</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* بەشی لای چەپ: دەقی ڕاستکراوە */}
          <div className="flex flex-col justify-between p-3.5 sm:p-5 bg-slate-950/40 relative">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/40 text-xs">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <span>✨</span>
                <span>دەقی ڕاستکراوەی ئەکادیمی</span>
              </span>
              <span className="text-[10px] text-emerald-400/80 font-mono font-bold">
                {loading ? "خەریکی کارە..." : correctedText ? "تەواو بوو ✓" : ""}
              </span>
            </div>

            <div className="flex-1 min-h-[140px] sm:min-h-[220px] overflow-y-auto">
              {loading ? (
                <div className="space-y-3 pt-4 animate-pulse">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>KurdAI خەریکی پشکنینی پیتەکان و خاڵبەندییە...</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gradient-to-r from-emerald-500/20 via-teal-500/30 to-emerald-500/20 rounded-full"></div>
                    <div className="h-3 bg-slate-800/60 rounded-full w-4/5"></div>
                    <div className="h-3 bg-slate-850/50 rounded-full w-2/3"></div>
                  </div>
                </div>
              ) : correctedText ? (
                <div className="text-emerald-100 text-sm sm:text-base leading-relaxed whitespace-pre-wrap text-right font-medium animate-in fade-in duration-300 select-text">
                  {correctedText}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-10 text-zinc-600">
                  <span className="text-3xl mb-1 opacity-30">✨</span>
                  <p className="text-xs font-medium">دەقی بێ هەڵە و ستاندارد لێرەدا پیشان دەدرێت</p>
                </div>
              )}
            </div>

            {correctedText && !loading && (
              <div className="pt-3 mt-1 border-t border-slate-800/40 flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-zinc-100 hover:text-white rounded-xl text-xs font-black transition-all flex items-center gap-1 shadow-md active:scale-95 border border-slate-700"
                  >
                    <span>{copied ? "✓" : "📋"}</span>
                    <span>{copied ? "کۆپی کرا" : "کۆپیکردن"}</span>
                  </button>

                  <button
                    onClick={handlePlayAudio}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border ${
                      isPlayingAudio
                        ? 'bg-red-950/60 border-red-500/40 text-red-300 animate-pulse'
                        : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-zinc-300'
                    }`}
                  >
                    <span>{isPlayingAudio ? "⏹️" : "🎙️"}</span>
                    <span>{isPlayingAudio ? "وەستاندن" : "گوێگرتن"}</span>
                  </button>
                </div>

                <button
                  onClick={handleFixGrammar}
                  className="px-2.5 py-1 text-emerald-400 hover:text-emerald-300 text-xs font-bold transition-all flex items-center gap-1"
                >
                  <span>🔄</span>
                  <span>دووبارە پشکنین</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-950/60 border border-red-500/30 rounded-2xl text-red-300 text-xs font-bold text-center animate-in fade-in duration-200">
          {error}
        </div>
      )}

      {/* 🔍 نەخشەی جیاوازی پیت و وشەکان (Diff Map) */}
      {correctedText && !loading && (
        <div className="w-full bg-slate-900/60 backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] p-4 sm:p-5 border border-slate-800/80 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-3">
          <div className="flex items-center justify-between text-xs border-b border-slate-800/60 pb-2">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <span>🔍</span>
              <span>نەخشەی بەراوردکاری (سەوز: ڕاستکراوە / سووری هێڵدار: هەڵەی بنەڕەتی)</span>
            </span>
          </div>
          <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl w-full">
            {renderDiff()}
          </div>
        </div>
      )}

      {/* 💡 ڕوونکردنەوە و تێبینییە زمانەوانییەکان */}
      {explanation && !loading && (
        <div className="w-full bg-slate-900/60 backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] p-4 sm:p-5 border border-slate-800/80 shadow-2xl animate-in zoom-in-95 duration-200 space-y-2">
          <span className="text-xs font-bold text-emerald-400 block text-right flex items-center gap-1.5">
            <span>💡</span>
            <span>تێبینی و ڕێساکانی چاککردنەوە لەلایەن KurdAI:</span>
          </span>
          <div className="p-3.5 bg-slate-950/80 border border-slate-800/60 rounded-xl text-right text-zinc-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
            {explanation}
          </div>
        </div>
      )}

    </div>
  );
};

export default KurdishGrammar;