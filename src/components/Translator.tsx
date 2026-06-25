/* eslint-disable */
// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const Translator: React.FC = () => {
  const [text, setText] = useState('');
  const [targetLang, setTargetLang] = useState('Sorani Kurdish');
  const [sourceLang, setSourceLang] = useState('English');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
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
          setResult(docSnap.data().translatedText);
          setLoading(false);
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
    <div className="max-w-4xl mx-auto px-3 py-4 space-y-4 animate-in fade-in duration-500 pb-20" dir="rtl">
      
      <div className="text-center space-y-0.5 pt-1">
        <h2 className="text-xl sm:text-2xl font-black text-white font-['Noto_Sans_Arabic'] tracking-tight">
          وەرگێڕی <span className="text-yellow-500">خێرا</span>
        </h2>
        <p className="text-[10px] text-slate-500">وەرگێڕانی خێرا و گشتی بەهۆی ژیری دەستکرد</p>
      </div>

      <div className="glass-panel rounded-xl border border-zinc-800/80 overflow-hidden bg-[#050507] shadow-xl">
        
        {/* 🌐 هێڵی هەڵبژاردنی زمانەکان: هەمیشە لە یەک ڕیزدایە (حەلی مۆبایل) */}
        <div className="bg-white/[0.01] border-b border-zinc-900/80 p-3 flex items-center justify-between gap-2">
          
          {/* زمانی سەرەکی */}
          <div className="flex-1 min-w-0">
            <select 
              value={sourceLang} 
              onChange={(e) => setSourceLang(e.target.value)} 
              className="bg-zinc-900/40 border border-zinc-800/60 text-white text-xs px-2.5 py-2 rounded-lg w-full cursor-pointer focus:outline-none focus:border-yellow-500 font-medium truncate"
            >
              {languages.map(l => <option key={l.id} value={l.id} className="bg-[#050507] text-white text-xs">{l.icon} {l.label}</option>)}
            </select>
          </div>

          {/* دوگمەی گۆڕینەوەی زمانەکان بە ناسکی لە ناوەڕاست */}
          <button 
            onClick={swapLanguages} 
            className="w-8 h-8 bg-zinc-900/60 border border-zinc-800/60 text-yellow-500 rounded-lg hover:bg-yellow-500 hover:text-black flex items-center justify-center transition-all shrink-0 text-xs font-bold active:scale-95 shadow-sm"
          >
            ⇄
          </button>

          {/* زمانی مەبەست */}
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
          
          {/* بۆکسی داخڵکردنی دەق */}
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

          {/* بۆکسی پیشاندانی ئەنجام */}
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
    </div>
  );
};

export default Translator;