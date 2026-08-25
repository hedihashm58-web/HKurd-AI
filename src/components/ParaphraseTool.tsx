/* eslint-disable */
// @ts-nocheck
import React, { useState } from 'react';

interface ParaphraseToolProps {
  language?: 'ku' | 'ar';
}

const TONES = [
  { id: 'academic', label: '🎓 ئەکادیمی و فەرمی', prompt: 'دەقەکە بە شێوازێکی زانستی، ئەکادیمی و فەرمی دابڕێژەرەوە کە شیاوی توێژینەوە و ڕاپۆرتی زانکۆ بێت.' },
  { id: 'anti_plagiarism', label: '🔄 دژە-لەبەرگرتنەوە (Plagiarism)', prompt: 'دەقەکە بە وشەسازی و ستراکچەری نوێ دابڕێژەرەوە تا واتا سەرەکییەکەی وەک خۆی بمێنێت بەڵام لە سیستەمەکانی دزینی ئەدەبی وەک نووسراوێکی نوێ بناسرێت.' },
  { id: 'simple', label: '⚡ سادە و ڕوون', prompt: 'دەقەکە بە زمانێکی زۆر ئاسان، سادە و ڕوون دابڕێژەرەوە تا بۆ هەموو کەس شیاوی تێگەیشتن بێت.' },
  { id: 'short', label: '✂️ کورت و پوخت', prompt: 'دەقەکە بە شێوەیەکی کورت، خێرا و پوخت دابڕێژەرەوە بەبێ وشەی زیادە.' },
  { id: 'expand', label: '📖 فراوان و دەوڵەمەند', prompt: 'دەقەکە بە ڕوونکردنەوە، نموونە و دەستەواژەی ئەکادیمی فراوانتر بکە و دەوڵەمەندی بکە.' }
];

const ParaphraseTool: React.FC<ParaphraseToolProps> = ({ language = 'ku' }) => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [selectedTone, setSelectedTone] = useState('academic');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleParaphrase = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setOutputText('');

    const currentToneObj = TONES.find(t => t.id === selectedTone) || TONES[0];

    try {
      const prompt = `تۆ پسپۆڕی داڕشتنەوەی دەق و ڕێپەرەفرەیزی زمانەوانیت (Academic Paraphrasing & Rewriting AI).
ڕێنمایی جێبەجێکردن: ${currentToneObj.prompt}

تکایە ئەم دەقەی خوارەوە بەوپەڕی ووردی و بە زمانی دەقە سەرەکییەکە (ئەگەر کوردی، ئینگلیزی، یان عەرەبی بوو) دابڕێژەرەوە.
تەنها و تەنها دەقی داڕێژراوەی نوێ بنووسە بەبێ هیچ پێشەکی، تێبینی یان سەردێڕی زیادە.

دەقی سەرەکی:
${inputText.trim()}`;

      const response = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          email: "paraphrase_user"
        }),
      });

      const data = await response.json();
      if (response.ok && data.response) {
        setOutputText(data.response.trim());
      } else {
        setOutputText("ببورە، هەڵەیەک لە کاتی داڕشتنەوەدا ڕوویدا. تکایە دووبارە هەوڵ بدەرەوە.");
      }
    } catch (err) {
      console.error(err);
      setOutputText("پەیوەندی بە سێرڤەری زیرەکی دەستکردەوە پچڕا.");
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

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-4 space-y-3 sm:space-y-5 animate-in fade-in duration-500 pb-24" dir="rtl">
      
      {/* 🧭 سەرپەڕە */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-purple-950/40 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-800/80 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3 text-right">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xl sm:text-2xl shadow-[0_0_20px_rgba(168,85,247,0.2)] shrink-0">
            ✍️
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>داڕشتنەوە و ڕێپەرەفرەیزی ئەکادیمی (Paraphrase)</span>
              <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 font-mono font-bold uppercase">
                Academic AI
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-400">داڕشتنەوەی دەقی ڕاپۆرت و توێژینەوە بە شێوازی ئەکادیمی و دژە-لەبەرگرتنەوە (Anti-Plagiarism)</p>
          </div>
        </div>
      </div>

      {/* 🎛️ شێوازەکانی داڕشتنەوە (Tone Selector Chips) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {TONES.map(t => (
          <button
            key={t.id}
            onClick={() => setSelectedTone(t.id)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 border ${
              selectedTone === t.id
                ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)]'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 🌟 بۆکسی دووانەی پێش و پاش داڕشتنەوە */}
      <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] border border-slate-800/90 shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-slate-800/80">
          
          {/* دەقی سەرەکی (پێش دەستکاری) */}
          <div className="flex flex-col justify-between p-3.5 sm:p-5 relative">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/30 text-xs">
              <span className="font-bold text-zinc-300 flex items-center gap-1">
                <span>📄</span>
                <span>دەقی سەرەکی خوێندکار</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono font-bold">
                {inputText.length} پیت
              </span>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="دەقی ڕاپۆرت، پەرەگراف یان وتارەکەت لێرە بنووسە یان پێوەی بنووسێنە تا بە شێوازی ئەکادیمی دابڕێژرێتەوە..."
              className="w-full flex-1 bg-transparent text-white text-sm sm:text-base focus:outline-none resize-none placeholder-zinc-500 leading-relaxed text-right font-medium min-h-[140px] sm:min-h-[220px]"
              maxLength={6000}
            />

            <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-800/40 text-xs">
              <div className="flex items-center gap-1.5">
                {inputText ? (
                  <button
                    onClick={() => setInputText('')}
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
                onClick={handleParaphrase}
                disabled={!inputText.trim() || loading}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-lg active:scale-95 ${
                  inputText.trim() && !loading
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/25 cursor-pointer'
                    : 'bg-zinc-800/60 text-zinc-600 border border-zinc-800 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>خەریکی داڕشتنەوەیە...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>داڕشتنەوەی دەق</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* دەقی داڕێژراوی نوێ (پاش دەستکاری) */}
          <div className="flex flex-col justify-between p-3.5 sm:p-5 bg-slate-950/40 relative">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/30 text-xs">
              <span className="font-bold text-purple-400 flex items-center gap-1">
                <span>✨</span>
                <span>دەقی داڕێژراوی ئەکادیمی</span>
              </span>
              <span className="text-[10px] text-purple-400/80 font-mono font-bold">
                {loading ? "خەریکی کارە..." : outputText ? "تەواو بوو ✓" : ""}
              </span>
            </div>

            <div className="flex-1 min-h-[140px] sm:min-h-[220px] overflow-y-auto">
              {loading ? (
                <div className="space-y-3 pt-4 animate-pulse">
                  <div className="flex items-center gap-2 text-purple-400 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></span>
                    <span>KurdAI خەریکی هەڵبژاردنی وشەی ئەکادیمییە...</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gradient-to-r from-purple-500/20 via-pink-500/30 to-purple-500/20 rounded-full"></div>
                    <div className="h-3 bg-slate-800/60 rounded-full w-4/5"></div>
                    <div className="h-3 bg-slate-850/50 rounded-full w-2/3"></div>
                  </div>
                </div>
              ) : outputText ? (
                <div className="text-slate-100 text-sm sm:text-base leading-relaxed whitespace-pre-wrap text-right font-medium animate-in fade-in duration-300">
                  {outputText}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-10 text-zinc-600">
                  <span className="text-3xl mb-1 opacity-30">✍️</span>
                  <p className="text-xs font-medium">دەقی داڕێژراوی بێ هەڵە و ئەکادیمی لێرە دەردەکەوێت</p>
                </div>
              )}
            </div>

            {outputText && !loading && (
              <div className="pt-3 mt-1 border-t border-slate-800/40 flex items-center justify-between text-xs">
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-zinc-100 hover:text-white rounded-xl text-xs font-black transition-all flex items-center gap-1 shadow-md active:scale-95 border border-slate-700"
                >
                  <span>{copied ? "✓" : "📋"}</span>
                  <span>{copied ? "کۆپی کرا" : "کۆپیکردنی دەق"}</span>
                </button>

                <button
                  onClick={handleParaphrase}
                  className="px-2.5 py-1 text-purple-400 hover:text-purple-300 text-xs font-bold transition-all flex items-center gap-1"
                >
                  <span>🔄</span>
                  <span>داڕشتنەوەی سەرلەنوێ</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};

export default ParaphraseTool;
