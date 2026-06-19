import React, { useState, useRef, useEffect } from 'react';
import { translateKurdishStream } from '../services/geminiService';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const Translator: React.FC = () => {
  const [text, setText] = useState('');
  const [targetLang, setTargetLang] = useState('Sorani Kurdish');
  const [sourceLang, setSourceLang] = useState('English');
  const [selectedTone, setSelectedTone] = useState('Formal');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const tones = [
    { id: 'Formal', label: 'فەرمی', icon: '👔' },
    { id: 'Academic', label: 'ئەکادیمی', icon: '🎓' },
    { id: 'Literary', label: 'ئەدەبی', icon: '✍️' },
    { id: 'General', label: 'گشتی', icon: '💬' }
  ];

  useEffect(() => {
    if (!text.trim() && !image) {
      setResult('');
      setLoading(false);
      return;
    }

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      performTranslation();
    }, 600); 

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [text, sourceLang, targetLang, selectedTone, image]);

  const generateCacheKey = (srcText: string, srcLang: string, trgLang: string, tone: string) => {
    const cleanedText = srcText
      .trim()
      .toLowerCase()
      .replace(/ي/g, 'ی')
      .replace(/ك/g, 'ک')
      .replace(/[.#$[\]]/g, '_'); 

    const shortText = cleanedText.length > 50 ? cleanedText.substring(0, 50) + "_" + cleanedText.length : cleanedText;
    
    return `${shortText}__[${srcLang}]_[${trgLang}]_[${tone}]`;
  };

  const performTranslation = async () => {
    setLoading(true);
    setResult("");
    
    const cacheKey = generateCacheKey(text, sourceLang, targetLang, selectedTone);

    if (!image) {
      try {
        const docRef = doc(db, 'global_translations', cacheKey);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setResult(docSnap.data().translatedText);
          setLoading(false);
          return;
        }
      } catch (cacheError) {
        console.error("Firebase Cache Read Error:", cacheError);
      }
    }

    try {
      const response = await translateKurdishStream(text, sourceLang, targetLang, selectedTone, image, mimeType);
      
      let fullResult = "";
      for await (const chunk of response.stream) {
        fullResult += chunk.text();
        setResult(fullResult);
      }

      if (!image && fullResult.trim()) {
        try {
          const docRef = doc(db, 'global_translations', cacheKey);
          await setDoc(docRef, {
            originalText: text,
            sourceLanguage: sourceLang,
            targetLanguage: targetLang,
            tone: selectedTone,
            translatedText: fullResult,
            createdAt: new Date()
          });
        } catch (saveError) {
          console.error("Firebase Cache Save Error:", saveError);
        }
      }
    } catch (error) {
      console.error(error);
      setResult("هەڵەیەک ڕوویدا...");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const swapLanguages = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    if (result) {
      const prevResult = result;
      setResult("");
      setText(prevResult);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20" dir="rtl">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-4">
           <div className="h-[1px] w-12 bg-white/10"></div>
           <span className="text-[9px] font-black text-yellow-500 uppercase tracking-[0.8em] font-['Noto_Sans_Arabic']">KurdAI Linguistic V3.5</span>
           <div className="h-[1px] w-12 bg-white/10"></div>
        </div>
        <h2 className="text-5xl lg:text-7xl font-black text-white font-['Noto_Sans_Arabic'] tracking-tighter">وەرگێڕی <span className="text-yellow-500">خێرا</span></h2>
        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] font-['Noto_Sans_Arabic']">وەرگێڕانی تەنها دەق بەبێ چاوەڕوانی - ژیریی KurdAI</p>
      </div>

      <div className="glass-panel p-2 rounded-[4rem] border border-white/5 shadow-3xl overflow-hidden bg-[#050507]">
        <div className="bg-white/[0.02] border-b border-white/5 p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex-1 w-full space-y-3">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-right block px-4 font-['Noto_Sans_Arabic']">لە زمانی</span>
            <select 
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="bg-white/5 border border-white/10 text-white px-8 py-6 rounded-[2.5rem] w-full font-['Noto_Sans_Arabic'] appearance-none focus:border-yellow-500/50 outline-none transition-all shadow-inner text-lg cursor-pointer"
            >
              {languages.map(l => (
                <option key={l.id} value={l.id} className="bg-[#0f172a]">{l.icon} {l.label}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={swapLanguages}
            className="w-16 h-16 bg-white/5 border border-white/10 text-yellow-500 rounded-full flex items-center justify-center text-2xl hover:bg-yellow-500 hover:text-black transition-all active:scale-90 shadow-2xl"
          >
            ⇄
          </button>

          <div className="flex-1 w-full space-y-3">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-right block px-4 font-['Noto_Sans_Arabic']">بۆ زمانی</span>
            <select 
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="bg-white/5 border border-white/10 text-white px-8 py-6 rounded-[2.5rem] w-full font-['Noto_Sans_Arabic'] appearance-none focus:border-yellow-500/50 outline-none transition-all shadow-inner text-lg cursor-pointer"
            >
              {languages.map(l => (
                <option key={l.id} value={l.id} className="bg-[#0f172a]">{l.icon} {l.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="px-8 lg:px-12 py-6 bg-white/[0.01] border-b border-white/5 flex flex-wrap justify-center gap-4">
           {tones.map(tone => (
             <button
              key={tone.id}
              onClick={() => setSelectedTone(tone.id)}
              className={`px-8 py-3 rounded-2xl flex items-center gap-3 transition-all border ${
                selectedTone === tone.id 
                ? 'bg-yellow-500 text-black border-yellow-400 font-black' 
                : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/10'
              } text-[10px] uppercase tracking-widest font-['Noto_Sans_Arabic']`}
             >
               <span>{tone.icon}</span>
               <span>{tone.label}</span>
             </button>
           ))}
        </div>

        <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-white/5">
          <div className="p-10 lg:p-16 space-y-8 bg-black/20">
             <div className="flex justify-between items-center px-4">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-['Noto_Sans_Arabic']">دەقی سەرەکی</span>
                <div className="flex gap-2">
                   <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                   />
                   <button 
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-3 rounded-xl border transition-all ${image ? 'bg-yellow-500 text-black border-yellow-400' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                    title="وەرگێڕانی وێنە"
                   >
                     📸
                   </button>
                </div>
             </div>
             
             <div className="relative group">
               <textarea 
                className="w-full h-[450px] bg-transparent text-white text-xl lg:text-4xl font-medium text-right focus:outline-none font-['Noto_Sans_Arabic'] resize-none placeholder:opacity-10 leading-[1.8] custom-scrollbar" 
                placeholder="دەقەکە لێرە بنووسە..."
                value={text}
                onChange={e => setText(e.target.value)}
              />
              
              {image && (
                <div className="absolute top-0 right-0 w-48 h-48 rounded-[2rem] border-2 border-yellow-500 shadow-2xl overflow-hidden animate-in zoom-in-95 group">
                   <img src={image} className="w-full h-full object-cover brightness-50 group-hover:brightness-100 transition-all" alt="Preview" />
                   <button 
                    onClick={removeImage}
                    className="absolute top-3 left-3 w-8 h-8 bg-black/60 backdrop-blur-md rounded-full text-white text-xs flex items-center justify-center hover:bg-red-600"
                   >✕</button>
                </div>
              )}
             </div>
          </div>

          <div className="p-10 lg:p-16 bg-white/[0.01] space-y-8 relative">
            <div className="flex justify-between items-center px-4">
                <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest font-['Noto_Sans_Arabic']">ئەنجامی وەرگێڕان</span>
                {loading && (
                   <div className="flex gap-1.5 items-center">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-[8px] font-black text-yellow-500 uppercase tracking-widest animate-pulse">وەرگێڕانی خێرا...</span>
                   </div>
                )}
            </div>

            <div className={`w-full h-[450px] text-yellow-500 text-xl lg:text-4xl font-medium text-right overflow-y-auto font-['Noto_Sans_Arabic'] custom-scrollbar leading-[1.8] ${loading && !result ? 'opacity-20' : ''}`}>
              {result || (loading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-6 opacity-30">
                   <div className="flex gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                   </div>
                   <span className="text-sm font-black uppercase tracking-widest">سیستەم ئامادەیە...</span>
                </div>
              ) : <span className="opacity-5">وەرگێڕانی تەنها دەق لێرە دەبێت...</span>) }
            </div>
            
            {result && (
              <div className="flex justify-end gap-3 pt-8 border-t border-white/5">
                 <button 
                   onClick={() => navigator.clipboard.writeText(result)}
                   className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white text-black transition-all text-[11px] font-black font-['Noto_Sans_Arabic'] uppercase tracking-widest"
                 >
                   📋 کۆپیکردن
                 </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Translator;