/* eslint-disable */
// @ts-nocheck
import React, { useState } from 'react';
import { auth } from '../firebase';

interface KurdishGrammarProps {
  language: 'ku' | 'ar';
}

const KurdishGrammar: React.FC<KurdishGrammarProps> = ({ language }) => {
  const [text, setText] = useState('');
  const [correctedText, setCorrectedText] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFixGrammar = async () => {
    if (!text.trim() || loading) return;

    setLoading(true);
    setError(null);
    setCorrectedText(null);
    setExplanation(null);

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

      // 👑 لۆجیکی نوێی و زۆر دەقیق بۆ پارسکردنی جەیسۆن تەنانەت ئەگەر کێشەی تێدابێت
      try {
        const parsedData = jsonCleanAndParse(data.response);
        if (parsedData && parsedData.corrected) {
          setCorrectedText(parsedData.corrected);
          setExplanation(parsedData.explanation || null);
        } else {
          setCorrectedText(data.response);
        }
      } catch (jsonErr) {
        // ئەگەر باکئێندەکە ڕاستەوخۆ تێکستی ناردبوو بەبێ ئۆبجێکت
        if (typeof data.response === 'string' && data.response.trim().startsWith('{')) {
          try {
            const fixedJson = JSON.parse(data.response.trim());
            setCorrectedText(fixedJson.corrected);
            setExplanation(fixedJson.explanation || null);
          } catch (e) {
            setCorrectedText(data.response);
          }
        } else {
          setCorrectedText(data.response);
        }
      }

    } catch (err: any) {
      console.error(err);
      if (err.message.includes("LIMIT_EXCEEDED_GRAMMAR") || err.message.includes("تەواو بوو")) {
        setError(
          language === 'ku' 
            ? "⚠️ لێمیتی ٣ پشکنینی خۆڕایی ڕێنووس تەواو بوو! بۆ بەکارهێنانی بێسنوور تکایە بەشداری ئۆفەرەکان بکە." 
            : "⚠️ انتهت فترة التجربة المجانية لمصحح القواعد! يرجى الاشتراك في العروض للاستمرار."
        );
      } else {
        setError(language === 'ku' ? "ببوورر، هەڵەیەک لە کاتی ڕاستکردنەوەی دەقەکەدا ڕوویدا." : "عذراً، حدث خطأ أثناء تصحيح النص.");
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

  // 👑 لۆجیکی جیاکردنەوە و بەراوردکاری زۆر ورد بۆ ئەوەی وشەکان تێکەڵ نەبن
  const renderDiff = () => {
    if (!text || !correctedText) return null;

    const originalWords = text.trim().split(/\s+/);
    const correctedWords = correctedText.trim().split(/\s+/);

    return (
      <div className="flex flex-wrap gap-x-2 gap-y-3 text-right justify-start leading-relaxed select-text font-medium text-sm w-full" dir="rtl">
        {correctedWords.map((word, idx) => {
          // دۆزینەوەی ئیندێکسی وشەکە لە دەقی کۆندا بۆ بەراوردکاری پۆڵایین
          const existsInOriginal = originalWords.includes(word);
          const originalWord = originalWords[idx] || "";

          if (!existsInOriginal && word !== originalWord) {
            return (
              <span key={idx} className="inline-flex flex-col items-center px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 shadow-sm animate-in fade-in duration-200">
                <span className="text-emerald-400 font-bold">{word}</span>
                {originalWord && !correctedWords.includes(originalWord) && (
                  <span className="text-[10px] line-through text-red-400/70 font-mono mt-0.5">
                    {originalWord}
                  </span>
                )}
              </span>
            );
          }
          
          return <span key={idx} className="text-zinc-300 py-1">{word}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20 px-3" dir="rtl">
      
      <div className="text-center space-y-1.5 pt-2">
        <h2 className="text-2xl sm:text-3xl font-black text-white font-['Noto_Sans_Arabic'] tracking-tight">
          {language === 'ku' ? 'ڕێنووس و زمانەوانی ' : 'مصحح '}<span className="text-emerald-400">{language === 'ku' ? 'کوردی' : 'اللغة الكوردية'}</span>
        </h2>
        <p className="text-zinc-500 text-xs font-['Noto_Sans_Arabic']">
          {language === 'ku' ? 'خەتاکانی نووسین و ڕێنووسی کوردی بە ژیریی دەستکرد ڕاست بکەرەوە' : 'تصحّيح الأخطاء الإملائية والقواعدية للغة الكوردية'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start w-full">
        
        <div className="flex flex-col space-y-2 w-full">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider pr-1">✍️ دەقی بنەڕەتی (خاوەن خەتا):</label>
          <div className="p-4 rounded-2xl bg-[#0e0e12]/90 border border-zinc-800 focus-within:border-emerald-500/40 shadow-xl min-h-[180px] flex flex-col justify-between">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={language === 'ku' ? "دەقە کوردییەکە لێرە بنووسە یان کۆپی بکە..." : "أدخل النص الكوردي هنا..."}
              className="w-full bg-transparent text-zinc-100 text-sm focus:outline-none h-32 resize-none text-right placeholder:text-zinc-600 leading-relaxed font-medium"
            />
            <div className="text-[9px] font-bold text-zinc-600 text-left pt-2 border-t border-zinc-900/60 font-mono">
              Characters: {text.length}
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-2 w-full">
          <label className="text-[10px] font-black text-emerald-500 uppercase tracking-wider pr-1">✨ دەقی ڕاستکراوە و خاوێن:</label>
          <div className="p-4 rounded-2xl bg-[#0b0b0e]/90 border border-zinc-800 shadow-xl min-h-[180px] flex flex-col justify-between relative">
            <div className="text-zinc-200 text-sm leading-relaxed text-right min-h-[120px] whitespace-pre-wrap font-medium">
              {loading ? (
                <span className="text-zinc-600 italic animate-pulse">{language === 'ku' ? 'KurdAI خەریکی پشکنینی پیت بە پیتی دەقەکەیە...' : 'جاري التدقيق...'}</span>
              ) : correctedText ? (
                <span className="select-text text-emerald-300">{correctedText}</span>
              ) : (
                <span className="text-zinc-700 italic text-xs">{language === 'ku' ? 'دوای داگرتنی دوگمەکە، دەقە بێخەتاکە لێرە پیشان دەدرێت.' : 'سيظهر النص المصحح هنا.'}</span>
              )}
            </div>
            
            {correctedText && !loading && (
              <button
                onClick={() => { navigator.clipboard.writeText(correctedText); alert("کۆپی کرا! ✓"); }}
                className="absolute bottom-3 left-3 px-3 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-bold text-zinc-400 rounded-lg transition-all"
              >
                📋 کۆپی بکە
              </button>
            )}
          </div>
        </div>

      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center animate-in fade-in duration-200">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleFixGrammar}
        disabled={loading || !text.trim()}
        className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs rounded-xl transition-all shadow-xl active:scale-[0.98] disabled:opacity-20 uppercase tracking-wider"
      >
        {loading ? 'خەریکی چاککردنی زمانەوانییە...' : 'پشکنین و ڕاستکردنەوەی دەق'}
      </button>

      {correctedText && !loading && (
        <div className="w-full bg-[#0d0d11]/90 rounded-2xl p-5 border border-zinc-800/80 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-3">
          <span className="text-[10px] font-black text-yellow-500 block text-right uppercase tracking-wider">🔍 نەخشەی جیاوازی لاینەکان (سەوز: ڕاستکراوە / خەتی سوور: هەڵەی کۆن):</span>
          <div className="p-4 bg-zinc-950/40 border border-zinc-800/40 rounded-xl w-full">
            {renderDiff()}
          </div>
        </div>
      )}

      {explanation && !loading && (
        <div className="w-full bg-[#0d0d11]/90 rounded-2xl p-5 border border-zinc-800/60 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col space-y-2">
          <span className="text-[10px] font-black text-emerald-400 block text-right uppercase tracking-wider">💡 گۆڕانکاری و تێبینییە زمانەوانییەکان:</span>
          <div className="p-3.5 bg-zinc-900/30 border border-zinc-800/40 rounded-xl text-right text-zinc-400 text-xs leading-relaxed text-justify">
            {explanation}
          </div>
        </div>
      )}

    </div>
  );
};

export default KurdishGrammar;