/* eslint-disable */
// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface HistoryItem {
  id: string;
  text: string;
  result: string;
  sourceLang: string;
  targetLang: string;
  timestamp: string;
}

const LANGUAGES = [
  { id: 'English', label: 'English', short: 'EN', flag: '🇺🇸' },
  { id: 'Sorani Kurdish', label: 'کوردی (سۆرانی)', short: 'سۆرانی', flag: '☀️' },
  { id: 'Kurmanji Kurdish', label: 'Kurmancî (بادینی)', short: 'Kurmancî', flag: '🏔️' },
  { id: 'Arabic', label: 'العربية', short: 'عربي', flag: '🇸🇦' },
  { id: 'Turkish', label: 'Türkçe', short: 'TR', flag: '🇹🇷' },
  { id: 'German', label: 'Deutsch', short: 'DE', flag: '🇩🇪' },
  { id: 'French', label: 'Français', short: 'FR', flag: '🇫🇷' },
  { id: 'Persian', label: 'فارسی', short: 'FA', flag: '🇮🇷' }
];

const Translator: React.FC = () => {
  const [text, setText] = useState('');
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Sorani Kurdish');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('kurdai_translation_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    if (!text.trim()) {
      setResult('');
      setLoading(false);
      return;
    }
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      performTranslation();
    }, 1000);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [text, sourceLang, targetLang]);

  const generateCacheKey = (srcText: string, srcLang: string, trgLang: string) => {
    const safeText = srcText.trim().substring(0, 30).replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_');
    return `${safeText}_${srcLang}_${trgLang}_General`;
  };

  const performTranslation = async () => {
    if (!text.trim()) return;
    setLoading(true);
    const currentInput = text.trim();
    const cacheKey = generateCacheKey(currentInput, sourceLang, targetLang);

    if (db) {
      try {
        const docSnap = await getDoc(doc(db, 'global_translations', cacheKey));
        if (docSnap.exists()) {
          const cachedText = docSnap.data().translatedText;
          setResult(cachedText);
          setLoading(false);
          saveToHistory(currentInput, cachedText, sourceLang, targetLang);
          return;
        }
      } catch (e) {
        console.error("Cache Read Error:", e);
      }
    }

    try {
      const translationPrompt = `تۆ وەرگێڕێکی زمانەوانی زۆر پسپۆڕ و شارەزایت. تکایە ئەم دەقەی خوارەوە بەوپەڕی دیقەت و ڕەوانی لە زمانی (${sourceLang}) وەرگێڕە بۆ سەر زمانی (${targetLang}). تەنها و تەنها دەقی وەرگێڕدراو بنووسە بەبێ هیچ دەقێکی زیادە، پێشەکی یان تێبینی.\n\nدەق:\n${currentInput}`;

      const response = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: translationPrompt,
          email: "guest_user"
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "سێرڤەر وەڵامی نەدایەوە");
      }

      let fullResult = data.response ? data.response.trim() : "هەڵەیەک لە کاتی وەرگێڕاندا ڕوویدا.";
      setResult(fullResult);

      if (fullResult.trim() && !fullResult.startsWith("بۆورە")) {
        saveToHistory(currentInput, fullResult, sourceLang, targetLang);
      }

      if (db && fullResult.trim()) {
        try {
          await setDoc(doc(db, 'global_translations', cacheKey), {
            translatedText: fullResult,
            createdAt: new Date()
          });
        } catch (e) {
          console.error("Save Error:", e);
        }
      }
    } catch (error: any) {
      console.error("Translation Error:", error);
      setResult("ببورە، کێشەیەک لە پەیوەندیکردن بە مێشکی وەرگێڕان ڕوویدا.");
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = (srcText: string, trgText: string, srcLang: string, trgLang: string) => {
    const timeStr = new Date().toLocaleTimeString('ckb', { hour: '2-digit', minute: '2-digit' });
    setHistory((prevHistory) => {
      const filtered = prevHistory.filter(item => item.text.toLowerCase().trim() !== srcText.toLowerCase().trim());
      const newItems = [
        { id: Date.now().toString(), text: srcText, result: trgText, sourceLang: srcLang, targetLang: trgLang, timestamp: timeStr },
        ...filtered
      ].slice(0, 15);
      localStorage.setItem('kurdai_translation_history', JSON.stringify(newItems));
      return newItems;
    });
  };

  const clearHistory = () => {
    localStorage.removeItem('kurdai_translation_history');
    setHistory([]);
  };

  const handleLoadHistory = (item: HistoryItem) => {
    setSourceLang(item.sourceLang);
    setTargetLang(item.targetLang);
    setText(item.text);
    setResult(item.result);
    setIsHistoryOpen(false);
  };

  const swapLanguages = () => {
    setIsSwapping(true);
    setTimeout(() => setIsSwapping(false), 300);
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    if (result) {
      const prev = result;
      setResult("");
      setText(prev);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pasteFromClipboard = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) setText(clipText);
    } catch (err) {
      console.error("Paste error:", err);
    }
  };

  const handleSpeakResult = async () => {
    if (isSpeaking) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsSpeaking(false);
      return;
    }

    if (!result) return;
    setIsSpeaking(true);

    try {
      const ttsEndpoints = [
        'http://127.0.0.1:8000/api/tts',
        'https://hedihashm-kurdai-chat-brain.hf.space/api/tts'
      ];

      let audioBlob: Blob | null = null;
      for (const endpoint of ttsEndpoints) {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: result.slice(0, 1000) })
          });
          if (res.ok) {
            audioBlob = await res.blob();
            break;
          }
        } catch (e) {}
      }

      if (audioBlob) {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          audioRef.current = null;
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          audioRef.current = null;
        };

        await audio.play();
        return;
      }
    } catch (e) {
      console.error("TTS error:", e);
    }

    setIsSpeaking(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-4 space-y-3 sm:space-y-5 animate-in fade-in duration-500 pb-20 sm:pb-24" dir="rtl">
      
      {/* 🧭 بەشی سەرەوە: ناونیشانی شیک و دوگمەی مێژوو (Mobile Responsive Header) */}
      <div className="flex justify-between items-center gap-2 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-indigo-950/40 p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-800/80 shadow-xl backdrop-blur-xl">
        
        <div className="flex items-center gap-2.5 sm:gap-3 text-right">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-lg sm:text-xl shadow-[0_0_20px_rgba(99,102,241,0.2)] shrink-0">
            🌐
          </div>
          <div>
            <h2 className="text-sm sm:text-xl font-black text-white tracking-tight flex items-center gap-1.5">
              <span>وەرگێڕی ژییری کوردی</span>
              <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-mono font-bold uppercase">
                AI
              </span>
            </h2>
            <p className="text-[10px] sm:text-xs text-zinc-400 hidden xs:block">وەرگێڕانی وورد و ڕەسەنی کوردی</p>
          </div>
        </div>

        {/* دوگمەی مێژوو */}
        <button
          onClick={() => setIsHistoryOpen(true)}
          className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/40 text-zinc-200 rounded-xl sm:rounded-2xl transition-all text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 shrink-0"
        >
          <span className="text-indigo-400">📜</span>
          <span className="hidden sm:inline">مێژووی وەرگێڕان</span>
          <span className="sm:hidden">مێژوو</span>
          {history.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px] font-black font-mono">
              {history.length}
            </span>
          )}
        </button>
      </div>

      {/* 🌟 پەنجەرەی دووانەی سەرەکی وەرگێڕان (Dual Modern Translation Workspace) */}
      <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl sm:rounded-[2.5rem] border border-slate-800/90 shadow-2xl overflow-hidden">
        
        {/* 🎛️ شریتی کۆنترۆڵی زمانەکان - بۆ مۆبایل و کۆمپیوتەر لە یەک دێڕدا (Single Row Responsive Selector) */}
        <div className="p-2 sm:p-3.5 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between gap-1.5 sm:gap-3">
          
          {/* زمانی سەرچاوە (لە) */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full bg-slate-900 border border-indigo-500/30 text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl cursor-pointer focus:outline-none focus:border-indigo-500 transition-all truncate shadow-inner text-right"
              >
                {LANGUAGES.map(l => (
                  <option key={l.id} value={l.id} className="bg-slate-950 text-white py-1">
                    {l.flag} {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* دوگمەی گۆڕینەوەی زمانەکان (Swap Button) */}
          <button
            onClick={swapLanguages}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-indigo-600/15 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-300 hover:text-white flex items-center justify-center transition-all shrink-0 active:scale-90 shadow-md ${
              isSwapping ? 'rotate-180 scale-90' : 'hover:scale-105'
            }`}
            title="گۆڕینەوەی زمانەکان"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>

          {/* زمانی ئامانج (بۆ) */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full bg-slate-900 border border-emerald-500/30 text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl cursor-pointer focus:outline-none focus:border-emerald-500 transition-all truncate shadow-inner text-right"
              >
                {LANGUAGES.map(l => (
                  <option key={l.id} value={l.id} className="bg-slate-950 text-white py-1">
                    {l.flag} {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

        </div>

        {/* 📝 بەشی دووانەی نووسین و ئەنجامی وەرگێڕان (Responsive Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-slate-800/80">
          
          {/* ⬅️ بۆکسی دەقی سەرەکی بەکارهێنەر */}
          <div className="flex flex-col justify-between p-3.5 sm:p-5 relative group">
            {/* ناونیشانی سەرەوەی بۆکس */}
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800/30 text-[11px] sm:text-xs">
              <span className="font-bold text-indigo-400 flex items-center gap-1">
                <span>{LANGUAGES.find(l => l.id === sourceLang)?.flag}</span>
                <span>لە: {LANGUAGES.find(l => l.id === sourceLang)?.label}</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono font-bold">
                {text.length}/5000
              </span>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`دەقەکەت لێرە بنووسە...`}
              className="w-full flex-1 bg-transparent text-white text-sm sm:text-base focus:outline-none resize-none placeholder-zinc-500 leading-relaxed text-right font-medium min-h-[120px] sm:min-h-[170px]"
              maxLength={5000}
            />

            {/* شریتی خوارەوەی دەقی نووسراو */}
            <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-slate-800/40 text-xs">
              <div className="flex items-center gap-1.5">
                {text ? (
                  <button
                    onClick={() => setText('')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-zinc-400 hover:text-white transition-all text-[11px] font-bold flex items-center gap-1"
                  >
                    <span>✕</span>
                    <span>پاککردنەوە</span>
                  </button>
                ) : (
                  <button
                    onClick={pasteFromClipboard}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-zinc-300 hover:text-white transition-all text-[11px] font-bold flex items-center gap-1 active:scale-95"
                  >
                    <span>📋</span>
                    <span>پێوەنووساندن</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ➡️ بۆکسی ئەنجامی وەرگێڕانی زیرەک */}
          <div className="flex flex-col justify-between p-3.5 sm:p-5 bg-slate-950/40 relative">
            {/* ناونیشانی سەرەوەی بۆکسی ئەنجام */}
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800/30 text-[11px] sm:text-xs">
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <span>{LANGUAGES.find(l => l.id === targetLang)?.flag}</span>
                <span>بۆ: {LANGUAGES.find(l => l.id === targetLang)?.label}</span>
              </span>
              <span className="text-[10px] text-emerald-400/80 font-mono font-bold">
                {loading ? "خەریکی کارە..." : "وەرگێڕدراو ✓"}
              </span>
            </div>

            <div className="flex-1 min-h-[120px] sm:min-h-[170px] overflow-y-auto">
              {loading ? (
                <div className="space-y-3 pt-2 animate-pulse">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                    <span>KurdAI خەریکی وەرگێڕانە...</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gradient-to-r from-indigo-500/20 via-purple-500/30 to-indigo-500/20 rounded-full"></div>
                    <div className="h-3 bg-slate-800/60 rounded-full w-4/5"></div>
                    <div className="h-3 bg-slate-850/50 rounded-full w-2/3"></div>
                  </div>
                </div>
              ) : result ? (
                <div className="text-slate-100 text-sm sm:text-base leading-relaxed whitespace-pre-wrap text-right font-medium animate-in fade-in duration-300">
                  {result}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-6 text-zinc-600">
                  <span className="text-2xl mb-1 opacity-40">✨</span>
                  <p className="text-[11px] sm:text-xs font-medium">ئەنجامی وەرگێڕانەکە لێرە دەردەکەوێت</p>
                </div>
              )}
            </div>

            {/* شریتی خوارەوەی ئەنجام */}
            {result && !loading && (
              <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-slate-800/40 text-xs animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-zinc-200 hover:text-white rounded-lg transition-all text-[11px] font-bold flex items-center gap-1 shadow-sm active:scale-95 border border-slate-700/60"
                  >
                    <span>{copied ? "✓" : "📋"}</span>
                    <span>{copied ? "کۆپی کرا" : "کۆپیکردن"}</span>
                  </button>

                  <button
                    onClick={handleSpeakResult}
                    className={`px-2.5 py-1 rounded-lg transition-all text-[11px] font-bold flex items-center gap-1 active:scale-95 border ${
                      isSpeaking
                        ? 'bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                        : 'bg-indigo-600/15 border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/25'
                    }`}
                  >
                    {isSpeaking ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                        <span>⏹️ وەستاندن</span>
                      </>
                    ) : (
                      <>
                        <span>🔊</span>
                        <span>گوێگرتن</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 📜 مۆداڵی پێشکەوتووی مێژووی وەرگێڕانەکان */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsHistoryOpen(false)}></div>
          
          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4 shrink-0">
              <button 
                onClick={() => setIsHistoryOpen(false)}
                className="w-8 h-8 bg-slate-800 hover:bg-slate-700 text-zinc-400 hover:text-white rounded-full flex items-center justify-center text-xs border border-slate-700 transition-all active:scale-95"
              >
                ✕
              </button>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-white">📜 مێژووی وەرگێڕانەکان</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-mono font-bold">
                  {history.length}
                </span>
              </div>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1 pl-1">
              {history.length === 0 ? (
                <div className="text-center py-16 text-zinc-500 text-xs">
                  هیچ مێژوویەکی وەرگێڕان پاشەکەوت نەکراوە.
                </div>
              ) : (
                history.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => handleLoadHistory(item)}
                    className="p-4 bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/40 rounded-2xl cursor-pointer transition-all flex flex-col text-right group space-y-2 active:scale-[0.99] shadow-sm hover:shadow-indigo-500/5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-zinc-400 font-mono bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800 flex items-center gap-1">
                        <span>{LANGUAGES.find(l => l.id === item.sourceLang)?.flag}</span>
                        <span>➔</span>
                        <span>{LANGUAGES.find(l => l.id === item.targetLang)?.flag}</span>
                      </span>
                      <p className="text-zinc-200 text-xs sm:text-sm font-bold truncate max-w-[70%] group-hover:text-indigo-400 transition-colors">
                        {item.text}
                      </p>
                    </div>
                    <p className="text-zinc-400 text-xs truncate border-t border-slate-800/60 pt-2 font-medium">
                      {item.result}
                    </p>
                  </div>
                ))
              )}
            </div>

            {history.length > 0 && (
              <div className="border-t border-slate-800 pt-4 mt-4 flex justify-center shrink-0">
                <button 
                  onClick={clearHistory} 
                  className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-black rounded-2xl transition-all active:scale-95"
                >
                  🗑️ سڕینەوەی تەواوی مێژوو
                </button>
              </div>
            )}
            
          </div>
        </div>
      )}

    </div>
  );
};

export default Translator;