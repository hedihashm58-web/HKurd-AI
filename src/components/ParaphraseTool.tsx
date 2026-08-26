/* eslint-disable */
// @ts-nocheck
import React, { useState, useRef } from 'react';
import { auth } from '../firebase';

interface ParaphraseToolProps {
  language?: 'ku' | 'ar';
}

const ParaphraseTool: React.FC<ParaphraseToolProps> = ({ language = 'ku' }) => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleParaphrase = async () => {
    if (!inputText.trim() || loading) return;
    setLoading(true);
    setError(null);
    setOutputText('');

    try {
      const userEmail = auth.currentUser?.email || "guest_user";

      const response = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/academic-humanize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText.trim(),
          email: userEmail
        }),
      });

      const data = await response.json();
      if (response.ok && data.response) {
        setOutputText(data.response.trim());
      } else {
        setError(data.detail || "ببورە، هەڵەیەک لە کاتی داڕشتنەوەی مرۆڤانەدا ڕوویدا.");
      }
    } catch (err) {
      console.error(err);
      setError("پەیوەندی بە سێرڤەری زیرەکی دەستکردەوە پچڕا.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pasteFromClipboard = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) setInputText(clipText);
    } catch (err) {
      console.error(err);
    }
  };

  // خوێندنەوە بە دەنگی دەماریی کوردی
  const handlePlayAudio = async () => {
    if (!outputText) return;
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
        body: JSON.stringify({ text: outputText.slice(0, 400) })
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
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-4 space-y-4 sm:space-y-6 animate-in fade-in duration-500 pb-24" dir="rtl">
      
      {/* 🧭 سەرپەڕە */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-purple-950/40 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-800/80 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3 text-right">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xl sm:text-2xl shadow-[0_0_20px_rgba(168,85,247,0.2)] shrink-0">
            ✍️
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>داڕشتنەوەی ئەکادیمی و مرۆڤاندنی دەق (Humanizer)</span>
              <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 font-mono font-bold uppercase">
                Anti-AI
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-400">داڕشتنەوە بە شێوازی ١٠٠٪ مرۆڤانە بۆ تێپەڕاندنی سیستەمەکانی پشکنینی AI و Turnitin لە زانکۆکان</p>
          </div>
        </div>

        {/* باجەکانی دەستکەوت */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 font-mono">
            🛡️ 0% AI Detected
          </span>
          <span className="px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-300 text-[10px] font-bold border border-purple-500/30 font-mono">
            ✨ 100% Human
          </span>
        </div>
      </div>

      {/* 🌟 بۆکسی دووانەی دەقی سەرەکی و دەقی مرۆڤێنراو */}
      <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] border border-slate-800/90 shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-slate-800/80">
          
          {/* دەقی سەرەکی (پێش دەستکاری) */}
          <div className="flex flex-col justify-between p-3.5 sm:p-5 relative">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/40 text-xs">
              <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                <span>📄</span>
                <span>دەقی سەرەکی (پێش داڕشتنەوە)</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono font-bold">
                {inputText.length} پیت
              </span>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="دەقی ڕاپۆرت، توێژینەوە، مەلزەمە یان وتارەکەت لێرە بنووسە یان پێوەی بنووسێنە تا بە تەواوی مرۆڤانە دابڕێژرێتەوە کە هیچ بەرنامەیەک پێی نەزانێت بە AI نووسراوە..."
              className="w-full flex-1 bg-transparent text-white text-sm sm:text-base focus:outline-none resize-none placeholder-zinc-500 leading-relaxed text-right font-medium min-h-[160px] sm:min-h-[240px]"
              maxLength={8000}
            />

            <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-800/40 text-xs">
              <div className="flex items-center gap-1.5">
                {inputText ? (
                  <button
                    onClick={() => { setInputText(''); setOutputText(''); }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-zinc-400 hover:text-white transition-all text-[11px] font-bold"
                  >
                    ✕ پاککردنەوە
                  </button>
                ) : (
                  <button
                    onClick={pasteFromClipboard}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-zinc-300 hover:text-white transition-all text-[11px] font-bold active:scale-95 cursor-pointer"
                  >
                    📋 پێوەنووساندن
                  </button>
                )}
              </div>

              <button
                onClick={handleParaphrase}
                disabled={!inputText.trim() || loading}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-lg active:scale-95 ${
                  inputText.trim() && !loading
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/25 cursor-pointer'
                    : 'bg-zinc-800/60 text-zinc-600 border border-zinc-800 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>خەریکی مرۆڤاندنە...</span>
                  </>
                ) : (
                  <>
                    <span>⚡</span>
                    <span>داڕشتنەوەی مرۆڤانە (Bypass AI)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* دەقی مرۆڤێنراوی ئەکادیمی */}
          <div className="flex flex-col justify-between p-3.5 sm:p-5 bg-slate-950/40 relative">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/40 text-xs">
              <span className="font-bold text-purple-400 flex items-center gap-1.5">
                <span>✨</span>
                <span>دەقی داڕێژراوەی مرۆڤانە (100% Human)</span>
              </span>
              <span className="text-[10px] text-purple-400/80 font-mono font-bold">
                {loading ? "خەریکی کارە..." : outputText ? "تەواو بوو ✓" : ""}
              </span>
            </div>

            <div className="flex-1 min-h-[160px] sm:min-h-[240px] overflow-y-auto">
              {loading ? (
                <div className="space-y-3 pt-4 animate-pulse">
                  <div className="flex items-center gap-2 text-purple-400 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></span>
                    <span>KurdAI خەریکی تێکشکاندنی کڵێشەکانی AI و بەخشینی ڕۆحی مرۆڤانەیە...</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gradient-to-r from-purple-500/20 via-pink-500/30 to-purple-500/20 rounded-full"></div>
                    <div className="h-3 bg-slate-800/60 rounded-full w-4/5"></div>
                    <div className="h-3 bg-slate-850/50 rounded-full w-2/3"></div>
                  </div>
                </div>
              ) : outputText ? (
                <div className="text-purple-100 text-sm sm:text-base leading-relaxed whitespace-pre-wrap text-right font-medium animate-in fade-in duration-300 select-text">
                  {outputText}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-10 text-zinc-600">
                  <span className="text-3xl mb-1 opacity-30">🛡️</span>
                  <p className="text-xs font-medium">دەقی داڕێژراوەی سەد لە سەد مرۆڤانە لێرەدا دەردەکەوێت</p>
                </div>
              )}
            </div>

            {outputText && !loading && (
              <div className="pt-3 mt-1 border-t border-slate-800/40 flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-zinc-100 hover:text-white rounded-xl text-xs font-black transition-all flex items-center gap-1 shadow-md active:scale-95 border border-slate-700 cursor-pointer"
                  >
                    <span>{copied ? "✓" : "📋"}</span>
                    <span>{copied ? "کۆپی کرا" : "کۆپیکردن"}</span>
                  </button>

                  <button
                    onClick={handlePlayAudio}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border cursor-pointer ${
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
                  onClick={handleParaphrase}
                  className="px-2.5 py-1 text-purple-400 hover:text-purple-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>🔄</span>
                  <span>دووبارە داڕشتنەوە</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-950/60 border border-red-500/30 rounded-2xl text-red-300 text-xs font-bold text-center animate-in fade-in">
          {error}
        </div>
      )}

      {/* 💡 ڕێنمایی ئەکادیمی بۆ خوێندکاران */}
      <div className="p-4 bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/70 text-zinc-400 text-xs leading-relaxed space-y-1.5 text-right">
        <p className="font-bold text-zinc-300 flex items-center gap-1.5">
          <span>🎓</span>
          <span>چۆن لە زانکۆ و پەیمانگا لە پشکنینی Turnitin و AI سەردەکەوێت؟</span>
        </p>
        <p className="text-[11px] sm:text-xs text-zinc-400">
          سیستەمی KurdAI لە ڕێگەی گۆڕینی هاوسەنگی و درێژی ڕستەکان (Burstiness)، تێکشکاندنی قاڵبە کڵێشەییەکان و بەکارهێنانی وشەسازی مرۆڤانەی زانستی دەقەکە دادەڕێژێتەوە، بەبێ ئەوەی دەستکاری مانا و بیرۆکە بنەڕەتییەکان بکات.
        </p>
      </div>

    </div>
  );
};

export default ParaphraseTool;
