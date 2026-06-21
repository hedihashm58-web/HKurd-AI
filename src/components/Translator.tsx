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
    { id: 'Sorani Kurdish', label: 'کوردی (سۆرانی)', icon: '☀️' },
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
      // 🧠 دروستکردنی پڕۆمپتێکی تایبەت بۆ وەرگێڕان بۆ ئەوەی مۆدێلی باکێند تەنها دەقی وەرگێڕدراو بنووسێت
      const translationPrompt = `تۆ وەرگێڕێکی زمانەوانی پسپۆڕیت. تکایە ئەم دەقەی خوارەوە لە زمانی (${sourceLang}) وەرگێڕە بۆ سەر زمانی (${targetLang}). تەنها و تەنها دەقی وەرگێڕدراو بنووسە بەبێ هیچ دەقێکی زیادە یان تێبینی.\n\nدەق:\n${currentInput}`;

      const response = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/chat', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: translationPrompt,
          email: "guest_user" // وەرگێڕان بە شێوەی گشتی بێ لێمیت کار دەکات
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
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-12 space-y-6 md:space-y-10 animate-in fade-in duration-700 pb-24" dir="rtl">
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white font-['Noto_Sans_Arabic'] tracking-tighter">
          وەرگێڕی <span className="text-yellow-500">خێرا</span>
        </h2>
        <p className="text-xs md:text-sm text-slate-400">وەرگێڕانی خێرا و گشتی بەهۆی ژیری دەستکرد</p>
      </div>

      <div className="glass-panel rounded-2xl md:rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden bg-[#050507] backdrop-blur-md">
        <div className="bg-white/[0.02] border-b border-white/5 p-4 md:p-6 lg:p-8 flex items-center justify-between gap-2 md:gap-6">
          <div className="flex-1">
            <select 
              value={sourceLang} 
              onChange={(e) => setSourceLang(e.target.value)} 
              className="bg-white/5 border border-white/10 text-white text-xs md:text-base px-3 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl w-full cursor-pointer focus:outline-none focus:border-yellow-500 transition-all"
            >
              {languages.map(l => <option key={l.id} value={l.id} className="bg-[#050507] text-white text-xs md:text-base">{l.icon} {l.label}</option>)}
            </select>
          </div>

          <button 
            onClick={swapLanguages} 
            className="w-10 h-10 md:w-12 md:h-12 bg-white/5 border border-white/10 text-yellow-500 rounded-full hover:bg-yellow-500 hover:text-black flex items-center justify-center transition-all duration-300 font-bold shrink-0 text-sm md:text-base"
            aria-label="گۆڕینەوەی زمانەکان"
          >
            ⇄
          </button>

          <div className="flex-1">
            <select 
              value={targetLang} 
              onChange={(e) => setTargetLang(e.target.value)} 
              className="bg-white/5 border border-white/10 text-white text-xs md:text-base px-3 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl w-full cursor-pointer focus:outline-none focus:border-yellow-500 transition-all"
            >
              {languages.map(l => <option key={l.id} value={l.id} className="bg-[#050507] text-white text-xs md:text-base">{l.icon} {l.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-white/5">
          <div className="relative flex flex-col h-[200px] md:h-[280px] lg:h-[380px]">
            <textarea 
              className="p-4 md:p-8 w-full h-full bg-transparent text-white text-sm md:text-lg lg:text-2xl focus:outline-none resize-none placeholder-slate-500 text-right" 
              placeholder="دەقەکە لێرە بنووسە..." 
              value={text} 
              onChange={e => setText(e.target.value)}
            />
            {text && (
              <button 
                onClick={() => setText('')} 
                className="absolute top-2 left-2 p-1.5 md:p-2 text-slate-400 hover:text-white text-xs md:text-sm bg-white/5 hover:bg-white/10 rounded-full transition-all"
                title="پاککردنەوە"
              >
                ✕
              </button>
            )}
          </div>

          <div className="relative p-4 md:p-8 text-yellow-500 text-sm md:text-lg lg:text-2xl overflow-y-auto h-[200px] md:h-[280px] lg:h-[380px] whitespace-pre-wrap bg-white/[0.01] text-right">
            {loading ? (
              <div className="flex items-center gap-2 text-slate-400 text-xs md:text-base justify-end">
                <span className="animate-pulse">⏳ وەرگێڕانی گشتی بە ئەی ئای...</span>
              </div>
            ) : (
              result || <span className="text-slate-500 text-xs md:text-base">ئەنجامی وەرگێڕانەکە لێرە دەردەکەوێت...</span>
            )}
            
            {result && !loading && (
              <button 
                onClick={copyToClipboard} 
                className="absolute bottom-2 left-2 px-3 py-1.5 text-[10px] md:text-xs bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg flex items-center gap-1.5 transition-all border border-white/5 font-semibold"
              >
                {copied ? "✓ کۆپی کرا" : "📋 کۆپی بکە"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Translator;