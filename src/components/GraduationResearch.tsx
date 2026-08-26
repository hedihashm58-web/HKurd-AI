/* eslint-disable */
// @ts-nocheck
import React, { useState, useRef } from 'react';
import { auth } from '../firebase';

interface GraduationResearchProps {
  language?: 'ku' | 'ar';
}

const DEPARTMENTS = [
  'کارگێری و ئابووری',
  'کۆمپیوتەر و تەکنەلۆجیای زانیاری (IT / CS)',
  'یاسا و پەیوەندییە نێودەوڵەتییەکان',
  'پزیشکی، دەرمانسازی و پەرستاری',
  'ئەندازیاری (شارستانی، تەلارسازی، نەوت، کارەبا)',
  'زمانی ئینگلیزی و زمانەوانی',
  'کشتوکاڵ و ژینگەپارێزی',
  'زانستە سیاسییەکان و ڕاگەیاندن',
  'پەروەردە و دەروونناسی',
  'بەشەکانی تر...'
];

const GraduationResearch: React.FC<GraduationResearchProps> = ({ language = 'ku' }) => {
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [topicInput, setTopicInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topicInput.trim() || loading) return;

    setLoading(true);
    setResult('');

    const prompt = `تۆ پسپۆڕی باڵای سەرپەرشتیاری پڕۆژەی دەرچوون و تێزی زانکۆیت (University Graduation Research & Thesis Supervisor AI).
تکایە بە پشتبەستن بە ناونیشانی توێژینەوەی: «${topicInput.trim()}» لە کۆلێژ / بەشی: «${department}»، پڕۆژەیەکی دەرچوونی تەواو، ئەکادیمی و پێشکەوتوو ئامادە بکە کە ئەم ٣ بەشە سەرەکییە لەخۆ بگرێت:

━━━━━━━━━━━━━━━━━━━━
📌 بەشی یەکەم: پوختەی توێژینەوە (Abstract)
١. پوختەی زانستی بە زمانی کوردیی پاراو و فەرمی (پێشەکی کورت، کێشەی توێژینەوە، ئامانجەکان، مێتۆدی کار، و دەرەنجامە سەرەکییەکان).
٢. Abstract in Academic English (Exact translation of the abstract with academic terminology).
٣. کلیلەوشەکان (Keywords) بە کوردی و ئینگلیزی.

━━━━━━━━━━━━━━━━━━━━
📐 بەشی دووەم: پلانی تەواوی بەشەکانی توێژینەوە (5-Chapter Thesis Outline)
دابەشکردنی پڕۆژەکە بۆ ٥ فەسڵی زانستی لەگەڵ تەوەر و ناونیشانی وردی ناو هەر بەشێک:
- فەسڵی یەکەم (Chapter 1): چوارچێوەی گشتی (پێشەکی، کێشەی توێژینەوە، گرنگی، ئامانجەکان، پرسیارەکان، میتۆدۆلۆجی).
- فەسڵی دووەم (Chapter 2): لایەنی تیۆری و پێداچوونەوەی ئەدەبیات (Literature Review & Background).
- فەسڵی سێیەم (Chapter 3): چوارچێوەی پڕاکتیکی و شیکاریی داتا (Methodology & Implementation / Case Study).
- فەسڵی چوارەم (Chapter 4): دەرەنجام و گفتوگۆ (Results & Findings & Discussion).
- فەسڵی پێنجەم (Chapter 5): دەرەنجامی کۆتایی و ڕاسپاردەکان (Conclusion & Recommendations).

━━━━━━━━━━━━━━━━━━━━
📚 بەشی سێیەم: سەرچاوە زانستییە پێشنیارکراوەکان (Academic References)
پێشنیارکردنی ٦ بۆ ٨ سەرچاوەی پەڕتووک، توێژینەوە و گۆڤاری زانستیی متمانەپێکراو دەربارەی ئەم بابەتە بە شێوازی فەرمی ستانداردی APA 7th Edition.

تکایە بەوپەڕی دەوڵەمەندی، ڕێکوپێکی، خاڵبەندی و بەبێ کڵێشەی زیادە بینووسە.`;

    try {
      const userEmail = auth.currentUser?.email || "guest_user";
      const response = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          email: userEmail
        }),
      });

      const data = await response.json();
      if (response.ok && data.response) {
        setResult(data.response.trim());
      } else {
        setResult("ببورە، هەڵەیەک لە ئامادەکردنی پڕۆژەی دەرچووندا ڕوویدا. تکایە دووبارە هەوڵ بدەرەوە.");
      }
    } catch (err) {
      console.error(err);
      setResult("پەیوەندی بە سێرڤەرەوە پچڕا.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsText = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kurdai_research_${topicInput.slice(0, 25).replace(/\s+/g, '_')}.txt`;
    link.click();
  };

  // خوێندنەوە بە دەنگی دەماریی کوردی
  const handlePlayAudio = async () => {
    if (!result) return;
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
        body: JSON.stringify({ text: result.slice(0, 400) })
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-cyan-950/40 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-800/80 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3 text-right">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-xl sm:text-2xl shadow-[0_0_20px_rgba(6,182,212,0.2)] shrink-0">
            🎓
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>یاریدەدەری توێژینەوەی دەرچوون (Graduation Research AI)</span>
              <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-mono font-bold uppercase">
                Thesis Builder
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-400">تەنها ناونیشان بنووسە؛ خۆی پوختە (Abstract)، پلانی ٥ فەسڵ و سەرچاوەی APA ئامادە دەکات</p>
          </div>
        </div>
      </div>

      {/* 🌟 شوێنی کارکردن و بەرهەمهێنان */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* بەشی لای ڕاست: داخڵکردنی زانیاری توێژینەوە */}
        <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] border border-slate-800/90 p-4 sm:p-5 shadow-2xl flex flex-col justify-between space-y-4">
          
          <div className="space-y-4">
            
            {/* هەڵبژاردنی بەشی زانکۆ */}
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1.5 flex items-center gap-1">
                <span>🏛️</span>
                <span>کۆلێژ / بەشی زانکۆ:</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 hover:border-cyan-500/50 text-white text-xs sm:text-sm font-bold px-3.5 py-3 rounded-2xl cursor-pointer focus:outline-none focus:border-cyan-500 transition-all shadow-inner"
              >
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d} className="bg-slate-950 text-white py-1">{d}</option>
                ))}
              </select>
            </div>

            {/* ناونیشانی توێژینەوە */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-zinc-300 mb-1.5">
                <span className="flex items-center gap-1">
                  <span>💡</span>
                  <span>ناونیشانی توێژینەوەی دەرچوون:</span>
                </span>
                {topicInput && (
                  <button
                    onClick={() => { setTopicInput(''); setResult(''); }}
                    className="text-red-400 hover:text-red-300 transition-all text-[11px]"
                  >
                    ✕ پاککردنەوە
                  </button>
                )}
              </div>
              <textarea
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="بۆ نموونە: ڕۆڵی زیرەکی دەستکرد لە باشترکردنی بڕیاردانی کارگێڕی لە کۆمپانیاکانی کەرتی تایبەتدا..."
                className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-cyan-500/80 rounded-2xl p-3.5 text-white text-xs sm:text-sm focus:outline-none placeholder-zinc-500 leading-relaxed text-right min-h-[140px] sm:min-h-[180px] font-medium resize-none shadow-inner"
                maxLength={2000}
              />
            </div>

            <div className="p-3.5 bg-slate-950/50 border border-slate-800/80 rounded-2xl text-zinc-400 text-xs leading-relaxed space-y-1">
              <p className="font-bold text-cyan-400 flex items-center gap-1">
                <span>✨</span>
                <span>ئەو بەشانەی بە شێوەی ئۆتۆماتیکی دروست دەکرێن:</span>
              </p>
              <ul className="space-y-0.5 text-[11px] text-zinc-400 pr-3 list-disc">
                <li>پوختەی ئەکادیمی (Abstract) بە زمانی کوردی و ئینگلیزی + Keywords</li>
                <li>پلانی تەواوی بەشەکان (فەسڵەکانی ١ تا ٥ بە ناونیشان و خاڵی ورد)</li>
                <li>لیستی سەرچاوە پێشنیارکراوەکان بە ستانداردی زانستی APA 7th</li>
              </ul>
            </div>

          </div>

          {/* دوگمەی دروستکردنی پڕۆژە */}
          <button
            onClick={handleGenerate}
            disabled={!topicInput.trim() || loading}
            className={`w-full py-4 px-4 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 shadow-lg active:scale-98 cursor-pointer ${
              topicInput.trim() && !loading
                ? 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white shadow-cyan-500/25'
                : 'bg-zinc-800/60 text-zinc-600 border border-zinc-800 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>KurdAI خەریکی ئامادەکردنی پلانی تۆکمەی توێژینەوەکەیە...</span>
              </>
            ) : (
              <>
                <span>🎓</span>
                <span>دروستکردنی پلانی تەواوی توێژینەوە (Abstract, Outline & References)</span>
              </>
            )}
          </button>

        </div>

        {/* بەشی لای چەپ: دەرەنجام و پوختە و پلان */}
        <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] border border-slate-800/90 p-4 sm:p-5 shadow-2xl flex flex-col justify-between space-y-4">
          
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400 border-b border-slate-800/60 pb-2">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span>📄</span>
              <span>پڕۆژە و پلانی ئەکادیمی ئامادەکراو:</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              {result ? `${result.length} پیت` : ''}
            </span>
          </div>

          {/* بۆکسی دەرەنجام */}
          <div className="flex-1 min-h-[260px] sm:min-h-[340px] bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 overflow-y-auto">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3 py-16 text-center">
                <div className="w-10 h-10 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-medium text-cyan-400/90 animate-pulse">KurdAI بە پێی ستانداردەکانی زانکۆ خەریکی داڕشتنی تێزەکەیە...</p>
              </div>
            ) : result ? (
              <div className="text-slate-100 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-right font-medium select-text">
                {result}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-16 text-center text-zinc-600 space-y-2">
                <span className="text-3xl opacity-30">🎓</span>
                <p className="text-xs font-medium">ناونیشانەکە بنووسە و کلیک بکە؛ تەواوی پڕۆژەکە لێرەدا دەردەکەوێت</p>
              </div>
            )}
          </div>

          {/* دوگمەکانی کردار */}
          {result && !loading && (
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={copyToClipboard}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-zinc-100 hover:text-white rounded-xl text-xs font-black transition-all flex items-center gap-1 shadow-md active:scale-95 border border-slate-700 cursor-pointer"
                >
                  <span>{copied ? "✓" : "📋"}</span>
                  <span>{copied ? "کۆپی کرا" : "کۆپیکردن"}</span>
                </button>

                <button
                  onClick={handlePlayAudio}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border cursor-pointer ${
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
                onClick={downloadAsText}
                className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 border border-slate-800 cursor-pointer"
                title="داگرتن وەک فایلی دەق"
              >
                <span>💾</span>
                <span>داگرتن</span>
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default GraduationResearch;
