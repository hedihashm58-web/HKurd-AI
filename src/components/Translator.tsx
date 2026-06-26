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
}

const Translator: React.FC = () => {
  const [text, setText] = useState('');
  const [targetLang, setTargetLang] = useState('Sorani Kurdish');
  const [sourceLang, setSourceLang] = useState('English');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false); // 📜 کۆنترۆڵکردنی کردنەوەی مۆداڵی مێژوو
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const languages = [
    { id: 'English', label: 'English', icon: '🇺🇸' },
    { id: 'Sorani Kurdish', label: 'کوردی', icon: '☀️' },
    { id: 'Kurmanji Kurdish', label: 'Kurmancî', icon: '🏔️' },
    { id: 'Arabic', label: 'العربية', icon: '🇸🇦' },
    { id: 'Turkish', label: 'Türkçe', icon: '🇹🇷' },
    { id: 'German', label: 'Deutsch', icon: '🇩🇪' },
    { id: 'French', label: 'Français', icon: '🇫🇷' },
    { id: 'Persian', label: 'فارسی', icon: '🇮🇷' }
  ];

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
    debounceTimerRef.current = setTimeout(() => { performTranslation(); }, 1500); 
    return () => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); };
  }, [text, sourceLang, targetLang]);

  const generateCacheKey = (srcText: string, srcLang: string, trgLang: string) => {
    const safeText = srcText.trim().substring(0, 30).replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_');
    return `${safeText}_${srcLang}_${trgLang}_General`;
  };

  const performTranslation = async () => {
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
      const translationPrompt = `تۆ وەرگێڕێکی زمانەوانی پسپۆڕیت. تکایە ئەم دەقەی خوارەوە لە زمانی (${sourceLang}) وەرگێڕە بۆ سەر زمانی (${targetLang}). تەنها و تەنها دەقی وەرگێڕدراو بنووسە بەبێ هیچ دەقێکی زیادە یان تێبینی.\n\nدەق:\n${currentInput}`;

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
      setResult("بۆورە، هەڵەیەک لە کاتی پەیوەندیکردن بە مێشکی وەرگێڕان ڕوویدا.");
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = (srcText: string, trgText: string, srcLang: string, trgLang: string) => {
    setHistory((prevHistory) => {
      const filtered = prevHistory.filter(item => item.text.toLowerCase().trim() !== srcText.toLowerCase().trim());
      const newItems = [
        { id: Date.now().toString(), text: srcText, result: trgText, sourceLang: srcLang, targetLang: trgLang },
        ...filtered
      ].slice(0, 10); // زیادکردنی لێمیتی مێژوو بۆ ١٠ دانە مادام بوو بە مۆداڵ
      
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
    setIsHistoryOpen(false); // داخستنی مۆداڵ دوای هەڵبژاردن
  };

  const swapLanguages = () => {
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
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 py-4 space-y-5 animate-in fade-in duration-500 pb-20 relative" dir="rtl">
      
      {/* 🧭 بەشی سەرەوە: ناونیشان و دوگمەی لای ڕاستی مێژوو */}
      <div className="flex justify-between items-center w-full border-b border-zinc-900 pb-3">
        {/* دوگمەی ڕاستی مێژوو */}
        <button
          onClick={() => setIsHistoryOpen(true)}
          className="px-3 py-2 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 hover:border-yellow-500/30 text-zinc-300 rounded-xl transition-all text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95"
        >
          <span>📜</span>
          <span>مێژووی وەرگێڕان</span>
          {history.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-yellow-500 text-zinc-950 text-[10px] font-black flex items-center justify-center font-mono">
              {history.length}
            </span>
          )}
        </button>

        {/* ناونیشانی سەرەکی لە ناوەڕاست و لای چەپ */}
        <div className="text-right space-y-0.5">
          <h2 className="text-xl sm:text-2xl font-black text-white font-['Noto_Sans_Arabic'] tracking-tight">
            وەرگێڕی <span className="text-yellow-500">خێرا</span>
          </h2>
          <p className="text-[10px] text-slate-500">وەرگێڕانی خێرا و گشتی KurdAI Pro</p>
        </div>
      </div>

      <div className="glass-panel rounded-xl border border-zinc-800/80 overflow-hidden bg-[#050507] shadow-xl">
        
        {/* 🌐 هێڵی هەڵبژاردنی زمانەکان */}
        <div className="bg-white/[0.01] border-b border-zinc-900/80 p-3 flex items-center justify-between gap-2">
          
          <div className="flex-1 min-w-0">
            <select 
              value={sourceLang} 
              onChange={(e) => setSourceLang(e.target.value)} 
              className="bg-zinc-900/40 border border-zinc-800/60 text-white text-xs px-2.5 py-2 rounded-lg w-full cursor-pointer focus:outline-none focus:border-yellow-500 font-medium truncate"
            >
              {languages.map(l => <option key={l.id} value={l.id} className="bg-[#050507] text-white text-xs">{l.icon} {l.label}</option>)}
            </select>
          </div>

          <button 
            onClick={swapLanguages} 
            className="w-8 h-8 bg-zinc-900/60 border border-zinc-800/60 text-yellow-500 rounded-lg hover:bg-yellow-500 hover:text-black flex items-center justify-center transition-all shrink-0 text-xs font-bold active:scale-95 shadow-sm"
          >
            ⇄
          </button>

          <div className="flex-1 min-w-0">
            <select 
              value={targetLang} 
              onChange={(e) => setTargetLang(e.target.value)} 
              className="bg-zinc-900/40 border border-zinc-800/60 text-white text-xs px-2.5 py-2 rounded-lg w-full cursor-pointer focus:outline-none focus:border-yellow-500 font-medium truncate"
            >
              {languages.map(l => <option key={l.id} value={l.id} className="bg-[#050507] text-white text-xs">{l.icon} {l.label}</option>)}
            </select>
          </div>
          
        </div>

        {/* بەشی نووسین و وەرگێڕان */}
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-zinc-900/80">
          
          <div className="relative flex flex-col h-40 sm:h-52">
            <textarea 
              className="p-4 w-full h-full bg-transparent text-white text-sm focus:outline-none resize-none placeholder-zinc-600 text-right leading-relaxed" 
              placeholder="دەقەکە لێرە بنووسە..." 
              value={text} 
              onChange={e => setText(e.target.value)}
            />
            {text && (
              <button 
                onClick={() => setText('')} 
                className="absolute top-2 left-2 p-1 text-slate-500 hover:text-white text-[10px] bg-zinc-900/40 rounded-full transition-all"
              >
                ✕
              </button>
            )}
          </div>

          <div className="relative p-4 text-yellow-500 text-sm overflow-y-auto h-40 sm:h-52 whitespace-pre-wrap bg-white/[0.005] text-right leading-relaxed">
            {loading ? (
              <div className="flex items-center gap-1.5 text-slate-500 text-xs justify-end animate-pulse">
                <span>⏳ خەریکی وەرگێڕانە...</span>
              </div>
            ) : (
              result || <span className="text-zinc-600 text-xs">ئەنجامی وەرگێڕانەکە لێرە دەردەکەوێت...</span>
            )}
            
            {result && !loading && (
              <button 
                onClick={copyToClipboard} 
                className="absolute bottom-2 left-2 px-2.5 py-1 text-[10px] bg-zinc-900/80 hover:bg-zinc-100 hover:text-zinc-950 text-slate-300 rounded-md flex items-center gap-1 transition-all border border-zinc-800/80 font-bold shadow-md"
              >
                {copied ? "✓ کۆپی کرا" : "📋 کۆپی"}
              </button>
            )}
          </div>

        </div>
      </div>

      {/* 👑 مۆداڵی پێشکەوتووی لای ڕاست بۆ مێژووی وەرگێڕانەکان (History Popup Modal) */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* بەکگراوندی ڕەش و تەڵخ */}
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setIsHistoryOpen(false)}></div>
          
          {/* ناوەڕۆکی پەنجەرەکە */}
          <div className="relative bg-[#0b0b0e] border border-zinc-800 rounded-2xl max-w-lg w-full p-5 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[75vh]">
            
            {/* سەردێڕی مۆداڵەکە */}
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3 mb-3 shrink-0">
              <button 
                onClick={() => setIsHistoryOpen(false)}
                className="w-7 h-7 bg-zinc-900 text-zinc-400 hover:text-white rounded-full flex items-center justify-center text-xs border border-zinc-800 transition-all"
              >
                ✕
              </button>
              <span className="text-sm font-black text-white">📜 مێژووی دوایین وەرگێڕانەکان</span>
            </div>

            {/* لیستی وەرگێڕانەکان */}
            <div className="overflow-y-auto space-y-2.5 flex-1 pr-1 pl-1">
              {history.length === 0 ? (
                <div className="text-center py-12 text-zinc-600 text-xs italic">
                  هیچ مێژوویەکی کۆن لەم ئامێرەدا پاشەکەوت نەکراوە.
                </div>
              ) : (
                history.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => handleLoadHistory(item)}
                    className="p-3 bg-zinc-900/40 border border-zinc-800/60 hover:border-yellow-500/30 rounded-xl cursor-pointer transition-all flex flex-col text-right group space-y-1.5 active:scale-[0.99]"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-zinc-500 font-mono bg-zinc-950 px-2 py-0.5 rounded-md border border-zinc-900">
                        {languages.find(l => l.id === item.sourceLang)?.icon} ➔ {languages.find(l => l.id === item.targetLang)?.icon}
                      </span>
                      <p className="text-zinc-200 text-xs font-bold truncate max-w-[70%] group-hover:text-yellow-500 transition-colors">
                        {item.text}
                      </p>
                    </div>
                    <p className="text-zinc-500 text-[11px] truncate border-t border-zinc-900/60 pt-1.5 italic">
                      {item.result}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* ژێرپەڕەی مۆداڵ و دوگمەی پاککردنەوە */}
            {history.length > 0 && (
              <div className="border-t border-zinc-900 pt-3 mt-3 flex justify-center shrink-0">
                <button 
                  onClick={clearHistory} 
                  className="w-full py-2 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black rounded-xl transition-all active:scale-95"
                >
                  🗑️ سڕینەوەی گشتی مێژوو
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