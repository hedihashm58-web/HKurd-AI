/* eslint-disable */
// @ts-nocheck
import React, { useState } from 'react';

interface GraduationResearchProps {
  language?: 'ku' | 'ar';
}

const RESEARCH_TOOLS = [
  { id: 'titles', label: '💡 ناونیشانی توێژینەوە', desc: 'پێشنیارکردنی ٥ بۆ ١٠ ناونیشانی زانستی و بەهێز بۆ پڕۆژەی دەرچوون' },
  { id: 'abstract', label: '📝 پوختەی توێژینەوە (Abstract)', desc: 'نووسینی پوختەی ئەکادیمی بە کوردی و ئینگلیزی لەگەڵ کلیلەوشەکان' },
  { id: 'outline', label: '📐 پلانی بەشەکانی توێژینەوە (Outline)', desc: 'دابەشکردنی توێژینەوەکە بۆ بەشەکانی (Chapter 1 تا 5) بە تەواوی تەوەرەکان' },
  { id: 'citations', label: '📚 ڕێکخستنی سەرچاوە (APA Citations)', desc: 'ڕێکخستنی سەرچاوەی پەڕتووک و ماڵپەڕ و گۆڤارەکان بە شێوازی فەرمی APA 7th' }
];

const DEPARTMENTS = [
  'کۆمپیوتەر و تەکنەلۆجیای زانیاری (IT / CS)',
  'یاسا و پەیوەندییە نێودەوڵەتییەکان',
  'پزیشکی، دەرمانسازی و پەرستاری',
  'ئەندازیاری (شارستانی، تەلارسازی، نەوت، کارەبا)',
  'کارگێڕی کار و ژمێریاری و ئابووری',
  'زمانی ئینگلیزی و زمانەوانی',
  'کشتوکاڵ و ژینگەپارێزی',
  'زانستە سیاسییەکان و ڕاگەیاندن',
  'پەروەردە و دەروونناسی',
  'بەشەکانی تر...'
];

const GraduationResearch: React.FC<GraduationResearchProps> = ({ language = 'ku' }) => {
  const [activeTool, setActiveTool] = useState('titles');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [topicInput, setTopicInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topicInput.trim()) return;
    setLoading(true);
    setResult('');

    let prompt = '';
    if (activeTool === 'titles') {
      prompt = `تۆ پسپۆڕی سەرپەرشتیاری توێژینەوەی زانکۆیت. تکایە ٧ ناونیشانی زۆر بەهێز، مۆدێرن و نوێ بۆ پڕۆژەی دەرچوونی بەشی (${department}) پێشنیار بکە دەربارەی ئەم تەوەرە: (${topicInput.trim()}).
بۆ هەر ناونیشانێک بە کوردی و ئینگلیزی بینووسە لەگەڵ ڕوونکردنەوەیەکی یەک دێڕی دەربارەی گرنگی بابەتەکە.`;
    } else if (activeTool === 'abstract') {
      prompt = `تکایە پوختەیەکی ئەکادیمی و پرۆفێشناڵ (Abstract) بۆ توێژینەوەی دەرچوون دەربارەی بابەتی (${topicInput.trim()}) لە بەشی (${department}) بنووسە.
پێویستە بە دوو زمان بێت:
١. پوختە بە زمانی کوردیی فەرمی
٢. Abstract بە زمانی ئینگلیزی (English)
لەگەڵ ٥ کلیلەوشەی سەرەکی (Keywords).`;
    } else if (activeTool === 'outline') {
      prompt = `تکایە پلان و پێکهاتەی تەواوی بەشەکانی (Research Outline & Chapters Proposal) بۆ پڕۆژەی دەرچوونی زانکۆ دەربارەی (${topicInput.trim()}) لە بەشی (${department}) دابڕێژە.
دابەشی بکە بۆ:
- Chapter 1: Introduction (Problem statement, Significance, Objectives, Methodology)
- Chapter 2: Literature Review & Background
- Chapter 3: Implementation / Practical Framework / Data Analysis
- Chapter 4: Results & Findings
- Chapter 5: Conclusion & Recommendations`;
    } else if (activeTool === 'citations') {
      prompt = `تکایە ئەم سەرچاوە و زانیارییانەی خوارەوە بە ستانداردی فەرمی و زانستی APA (APA 7th Edition) و Harvard ڕێکبخە و فۆرماتی بکە بۆ لیستی سەرچاوەکانی توێژینەوەی زانکۆ:\n\n${topicInput.trim()}`;
    }

    try {
      const response = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          email: "graduation_research_user"
        }),
      });

      const data = await response.json();
      if (response.ok && data.response) {
        setResult(data.response.trim());
      } else {
        setResult("ببورە، هەڵەیەک لە ئامادەکردنی توێژینەوەکەدا ڕوویدا.");
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
                University Pro
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-400">ئامادەکاری ناونیشان، پوختە (Abstract)، پلانی بەشەکان و سەرچاوەی پڕۆژەی دەرچوون</p>
          </div>
        </div>
      </div>

      {/* 🎛️ تابی ئامرازەکانی توێژینەوە */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {RESEARCH_TOOLS.map(t => (
          <button
            key={t.id}
            onClick={() => { setActiveTool(t.id); setResult(''); }}
            className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between space-y-1 active:scale-95 ${
              activeTool === t.id
                ? 'bg-cyan-950/60 border-cyan-500/60 text-white shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="text-xs font-black">{t.label}</span>
            <span className="text-[10px] text-zinc-500 leading-tight truncate">{t.desc}</span>
          </button>
        ))}
      </div>

      {/* 🌟 شوێنی کارکردن و بەرهەمهێنان */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* بەشی داخڵکردنی زانیاری */}
        <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] border border-slate-800/90 p-4 sm:p-5 shadow-2xl flex flex-col justify-between space-y-4">
          
          <div className="space-y-3">
            {/* هەڵبژاردنی بەشی زانکۆ */}
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1.5">بەش / کۆلێژ:</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 hover:border-cyan-500/50 text-white text-xs sm:text-sm font-bold px-3 py-2.5 rounded-xl cursor-pointer focus:outline-none focus:border-cyan-500 transition-all"
              >
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d} className="bg-slate-950 text-white py-1">{d}</option>
                ))}
              </select>
            </div>

            {/* بابەتی توێژینەوە */}
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                {activeTool === 'titles' && 'کلیلەوشە یان حەزەکەت بۆ بابەتەکە:'}
                {activeTool === 'abstract' && 'ناونیشانی تەواوی توێژینەوەکەت:'}
                {activeTool === 'outline' && 'ناونیشانی پەسەندکراوی توێژینەوەکەت:'}
                {activeTool === 'citations' && 'ناونیشانی کتێب، نوسەر، لینک یان زانیاری سەرچاوەکە:'}
              </label>
              <textarea
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder={
                  activeTool === 'titles' ? 'بۆ نموونە: زیرەکی دەستکرد لە دەستنیشانکردنی نەخۆشییەکان...' :
                  activeTool === 'abstract' ? 'بۆ نموونە: کاریگەری تۆڕە کۆمەڵایەتییەکان لەسەر ڕەفتاری کڕیار لە شاری هەولێر...' :
                  activeTool === 'outline' ? 'بۆ نموونە: دیزاین و جێبەجێکردنی سیستەمی هۆشمەندی بەڕێوەبردنی نەخۆشخانە...' :
                  'بۆ نموونە: کتێبی Artificial Intelligence نووسینی Stuart Russell ساڵی 2020...'
                }
                className="w-full bg-slate-950/80 border border-slate-700/80 hover:border-cyan-500/50 rounded-xl p-3 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500 min-h-[140px] sm:min-h-[180px] resize-none font-medium leading-relaxed"
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!topicInput.trim() || loading}
            className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
              topicInput.trim() && !loading
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/25 cursor-pointer'
                : 'bg-zinc-800/60 text-zinc-600 border border-zinc-800 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>خەریکی ئامادەکردنی توێژینەوەیە...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>ئامادەکردنی توێژینەوە</span>
              </>
            )}
          </button>
        </div>

        {/* بەشی دەرەنجام */}
        <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] border border-slate-800/90 p-4 sm:p-5 shadow-2xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-xs">
            <span className="font-bold text-cyan-400 flex items-center gap-1">
              <span>🎓</span>
              <span>ئەنجامی ئەکادیمی KurdAI</span>
            </span>
            <span className="text-[10px] text-cyan-400/80 font-mono font-bold">
              {loading ? "خەریکی کارە..." : result ? "تەواو بوو ✓" : ""}
            </span>
          </div>

          <div className="flex-1 min-h-[220px] sm:min-h-[280px] overflow-y-auto">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center space-y-3">
                <div className="w-10 h-10 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-cyan-400 animate-pulse">KurdAI بە وردی توێژینەوەکەت بە پێوەری زانستی دادەڕێژێت...</p>
              </div>
            ) : result ? (
              <div className="text-slate-100 text-sm sm:text-base leading-relaxed whitespace-pre-wrap text-right font-medium animate-in fade-in duration-300">
                {result}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-16 text-center text-zinc-600">
                <span className="text-3xl mb-2 opacity-30">🎓</span>
                <p className="text-xs font-medium">زانیارییەکان بنووسە تا ئەنجامی ئەکادیمی توێژینەوەکەت لێرە دەربکەوێت</p>
              </div>
            )}
          </div>

          {result && !loading && (
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-end">
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-zinc-100 hover:text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md active:scale-95 border border-slate-700"
              >
                <span>{copied ? "✓" : "📋"}</span>
                <span>{copied ? "کۆپی کرا" : "کۆپیکردنی ئەنجام"}</span>
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default GraduationResearch;
