/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';

interface FlashcardProps {
  language: 'ku' | 'ar';
}

interface CardData {
  word: string;
  english: string;
  arabic: string;
  dialects: string;
  example: string;
}

const KurdishFlashcard: React.FC<FlashcardProps> = ({ language }) => {
  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateCard = async () => {
    setLoading(true);
    setError(null);

    try {
      const userEmail = auth.currentUser?.email || "guest_user";

      const response = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/kurdish-flashcard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        // 📥 خوێندنەوەی خەتاکانی لێمیتی ڕۆژانەی فلاشکارت لە باکێندەوە
        if (data.detail && data.detail.includes("LIMIT_EXCEEDED_FLASHCARD_DAILY")) {
          throw new Error("LIMIT_EXCEEDED_FLASHCARD_DAILY");
        }
        if (data.detail && data.detail.includes("LIMIT_EXCEEDED_FLASHCARD_PREMIUM_DAILY")) {
          throw new Error("LIMIT_EXCEEDED_FLASHCARD_PREMIUM_DAILY");
        }
        throw new Error(data.detail || "سێرڤەر وەڵامی نەدایەوە.");
      }

      const parsedCard = jsonCleanAndParse(data.response);
      setCard(parsedCard);
    } catch (err: any) {
      console.error(err);
      if (err.message.includes("LIMIT_EXCEEDED_FLASHCARD_DAILY")) {
        setError(
          language === 'ku' 
            ? "⚠️ لێمیتی ڕۆژانەی فلاشکارتی خۆڕایی تۆ تەواو بووە! (ڕۆژانە ١ وشە). بۆ بینینی زیاتر تکایە بەشداری ئۆفەرەکان بکە." 
            : "⚠️ انتهت فترة التجربة المجانية اليومية للفلاش كارد! (١ كلمة يومياً). يرجى الاشتراك في العروض للاستمرار."
        );
      } else if (err.message.includes("LIMIT_EXCEEDED_FLASHCARD_PREMIUM_DAILY")) {
        setError(
          language === 'ku' 
            ? "⚠️ پلانی ١ مانگی ڕێگەت پێدەدات ڕۆژانە ٣ فلاشکارت ببینی. بۆ بینینی بێسنوور پلانەکەت بەرزبکەرەوە!" 
            : "⚠️ الباقة الشهرية تتيح لك ٣ فلاش كارد يومياً فقط. لفتح الليميت بالكامل يرجى ترقية الاشتراك!"
        );
      } else {
        setError(language === 'ku' ? "ببوورە، کێشەیەک لە لۆدکردنی فلاشکارتەکەدا هەبوو." : "عذراً، حدث خطأ أثناء تحميل الفلاش كارد.");
      }
    } finally {
      setLoading(false);
    }
  };

  const jsonCleanAndParse = (rawStr: string) => {
    let cleanStr = rawStr.trim();
    if (cleanStr.includes("```json")) {
      cleanStr = cleanStr.split("```json")[1].split("```")[0];
    } else if (cleanStr.includes("```")) {
      cleanStr = cleanStr.split("```")[1].split("```")[0];
    }
    return JSON.parse(cleanStr.trim());
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20 px-3" dir="rtl">
      
      <div className="text-center space-y-1.5 pt-2">
        <h2 className="text-2xl sm:text-3xl font-black text-white font-['Noto_Sans_Arabic'] tracking-tight">
          {language === 'ku' ? 'فلاشکارتی وشە و ' : 'فلاش كارد '}<span className="text-yellow-500">{language === 'ku' ? 'زاراوەکان' : 'المصطلحات الكوردية'}</span>
        </h2>
        <p className="text-zinc-500 text-xs font-['Noto_Sans_Arabic']">
          {language === 'ku' ? 'ئاشنابوون بە وشە دەگمەنەکان، هاوتاکانیان بە زاراوە جیاوازەکان و وەرگێڕانیان' : 'اكتشف الكلمات الكوردية النادرة، لهجاتها وترجمتها الاحترافية'}
        </p>
      </div>

      {/* 🔮 کارتی سەرەکی پیشاندانی زانیارییەکان */}
      <div className="w-full bg-[#0e0e12]/90 border border-zinc-800 p-6 rounded-3xl shadow-2xl relative min-h-[280px] flex flex-col justify-between overflow-hidden">
        
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3 py-12">
            <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-zinc-500 text-xs italic animate-pulse">KurdAI خەریکی گەڕانە بەدوای وشەیەکی گرانبەها...</span>
          </div>
        ) : card ? (
          <div className="space-y-5 animate-in zoom-in-95 duration-200">
            
            {/* وشەی سەرەکی */}
            <div className="text-center pb-3 border-b border-zinc-900">
              <span className="text-xs text-zinc-500 block mb-1">وشەی هەڵبژێردراو:</span>
              <h1 className="text-3xl font-black text-yellow-500 tracking-wide">{card.word}</h1>
            </div>

            {/* زاراوەکانی تر و هاوتاکان */}
            {card.dialects && (
              <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl flex flex-col gap-1 text-right">
                <span className="text-[10px] font-black text-zinc-500 uppercase">🗣️ بە دیالێکتەکانی تر (کرمانجی / هەورامی...):</span>
                <p className="text-zinc-300 text-xs font-semibold leading-relaxed">{card.dialects}</p>
              </div>
            )}

            {/* وەرگێڕان بۆ زمانەکانی تر */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 🇺🇸 بۆکسی ئینگلیزی */}
              <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl text-left flex flex-col justify-between" dir="ltr">
                <span className="text-[10px] font-black text-zinc-500 uppercase block text-right">🇺🇸 English:</span>
                <p className="text-zinc-100 text-xs font-bold font-mono mt-1 whitespace-pre-wrap leading-relaxed">{card.english}</p>
              </div>
              
              {/* 🇸🇦 بۆکسی عەرەبی */}
              <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl text-right flex flex-col justify-between">
                <span className="text-[10px] font-black text-zinc-500 uppercase block">🇸🇦 العربية:</span>
                <p className="text-zinc-100 text-xs font-bold mt-1 leading-relaxed">{card.arabic}</p>
              </div>
            </div>

            {/* نموونە لە ڕستەدا */}
            <div className="p-3.5 bg-yellow-500/5 border border-yellow-500/10 rounded-xl text-right">
              <span className="text-[10px] font-black text-yellow-500 uppercase block mb-1">✍️ بەکارهێنان لە ڕستەدا:</span>
              <p className="text-zinc-300 text-xs leading-relaxed font-medium italic">"{card.example}"</p>
            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
            <span className="text-4xl mb-3">🧠</span>
            <p className="text-zinc-600 text-xs italic">کلیل لەسەر دوگمەی خوارەوە بکە بۆ هێنانەوەی یەکەم کارت.</p>
          </div>
        )}

      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center animate-in fade-in duration-200">
          {error}
        </div>
      )}

      {/* 🚀 دوگمەی بەرهەمهێنان */}
      <button
        onClick={handleGenerateCard}
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 hover:from-yellow-500 hover:to-amber-600 text-zinc-950 font-black text-sm rounded-2xl transition-all duration-200 shadow-[0_0_25px_rgba(245,158,11,0.25)] hover:shadow-[0_0_35px_rgba(245,158,11,0.45)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-20 uppercase tracking-wider flex items-center justify-center gap-2 border border-yellow-400/30"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
            <span>خەریکی گەڕانە...</span>
          </>
        ) : (
          <>
            <span className="text-base">🧠</span>
            <span>وشەیەکی نوێ بەرهەم بهێنە</span>
          </>
        )}
      </button>

    </div>
  );
};

export default KurdishFlashcard;