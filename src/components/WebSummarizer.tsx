/* eslint-disable */
// @ts-nocheck
import React, { useState, useRef } from 'react';
import { auth } from '../firebase';

interface WebSummarizerProps {
  language: 'ku' | 'ar';
}

const WebSummarizer: React.FC<WebSummarizerProps> = ({ language }) => {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = async () => {
    if (!url.trim() || loading) return;
    
    // 🔗 پشکنینی سەرەتایی بۆ لێنکەکە تا دڵنیابین لێنکی ڕاستەقینەیە
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError(
        language === 'ku' 
          ? "⚠️ تکایە لێنکێکی فەرمی دابنێ کە بە http:// یان https:// دەستپێبکات." 
          : "⚠️ يرجى إدخال رابط رسمي يبدأ بـ http:// أو https://"
      );
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const userEmail = auth.currentUser?.email || "guest_user";
      
      // 🚀 ناردنی ڕاستەوخۆی لێنکەکە بۆ باکێندەکەت (باکێند خۆی پشکنینی لێمیت دەکات و پڕۆمپتی بۆ ڕێکدەخات)
      const response = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/chat', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: url.trim(), // لێنکەکە بە ڕووتی دەنێرین تا باکێند وەک وێب کورتکەرەوە بیناسێتەوە
          email: userEmail
        }), 
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.detail && data.detail.includes("LIMIT_EXCEEDED_WEB_TRIAL")) {
          throw new Error("LIMIT_EXCEEDED_WEB_TRIAL");
        }
        throw new Error(data.detail || (language === 'ku' ? "سێرڤەر وەڵامی نەدایەوە." : "لم يتم الرد من السيرفر."));
      }

      setResult(data.response || (language === 'ku' ? "هیچ زانیارییەک وەرنەگیرا." : "لم يتم العثور على معلومات."));

    } catch (err: any) {
      console.error(err);
      if (err.message.includes("LIMIT_EXCEEDED_WEB_TRIAL") || err.message.includes("تەواو بوو")) {
        setError(
          language === 'ku'
            ? "⚠️ لێمیتی خۆڕایی کورتکەرەوەی وێب تەواو بوو! بۆ بەکارهێنانی بێسنوور تکایە بەشداری ئۆفەرەکان (Premium) بکە."
            : "⚠️ انتهت فترة التجربة المجانية لتلخيص المواقع! يرجى الاشتراك في العروض للاستمرار."
        );
      } else {
        setError(
          err.message || 
          (language === 'ku' 
            ? "ببورا، هەڵەیەک لە کاتی پەیوەندیکردن بە مێشکی کورتکەرەوەدا ڕوویدا." 
            : "عذراً، حدث خطأ أثناء الاتصال بنظام التلخيص.")
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20 px-3" dir="rtl">
      
      {/* 👑 سەر دێڕی ناسک و مۆدێرن */}
      <div className="text-center space-y-1.5 pt-2">
        <h2 className="text-2xl sm:text-3xl font-black text-white font-['Noto_Sans_Arabic'] tracking-tight">
          {language === 'ku' ? 'کورتکەرەوەی ' : 'ملخص '}<span className="text-yellow-500">{language === 'ku' ? 'وێب و بەستەر' : 'المواقع والروابط'}</span>
        </h2>
        <p className="text-zinc-500 text-xs font-['Noto_Sans_Arabic']">
          {language === 'ku' ? 'خوێندنەوە و کورتکردنەوەی ماڵپەڕەکان ' : 'قراءة وتلخيص محتوى المواقع '}
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full">
        
        {/* 💎 کارتی داڵێکردنی لێنک (Cyber-Glass UI) */}
        <div className="p-5 rounded-2xl bg-[#0e0e12]/90 border border-zinc-800/80 shadow-[0_10px_35px_rgba(0,0,0,0.6)] flex flex-col relative transition-all duration-300 focus-within:border-yellow-500/40">
          
          <textarea
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={language === 'ku' ? "لێنکی بابەتەکە یان لاپەڕەی ماڵپەڕەکە لێرە دابنێ..." : "أدخل رابط المقال أو موقع الويب هنا..."}
            className="w-full bg-transparent text-zinc-100 text-sm font-['Noto_Sans_Arabic'] focus:outline-none h-20 sm:h-24 resize-none text-right placeholder:text-zinc-600 leading-relaxed font-medium"
          />

          {/* 🛠️ هێڵی خوارەوەی کارتەکە */}
          <div className="flex justify-between items-center pt-3 border-t border-zinc-900/90 mt-2">
            <span className="text-base select-none pl-1">🔗</span>
            <div className="text-[10px] font-black text-zinc-600 font-mono tracking-widest">KurdAI WebReader v1.0</div>
          </div>
        </div>

        {/* ⚠️ پیشاندانی خەتاکان */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center animate-in fade-in duration-200">
            {error}
          </div>
        )}

        {/* 🚀 دوگمەی دەستپێکردنی کارەکە */}
        <button
          type="button"
          onClick={handleSummarize}
          disabled={loading || !url.trim()}
          className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-black text-xs rounded-xl transition-all shadow-xl active:scale-[0.98] disabled:opacity-20 font-['Noto_Sans_Arabic'] uppercase tracking-wider"
        >
          {loading 
            ? (language === 'ku' ? 'خەریکی خوێندنەوە و کورتکردنەوەیە...' : 'جاري القراءة والتلخيص...') 
            : (language === 'ku' ? 'دەستپێکردنی کورتکردنەوە' : 'بدء التلخيص الذكي')}
        </button>

        {/* 📝 پانێڵی پیشاندانی ئەنجام */}
        {result && (
          <div className="w-full bg-[#0d0d11]/90 rounded-2xl p-5 border border-zinc-800/60 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col space-y-2.5">
            <span className="text-[10px] font-black text-yellow-500 block text-right uppercase tracking-wider">
              {language === 'ku' ? '📝 کورتەی پوختی بابەتەکە:' : '📝 ملخص المحتوى المركّز:'}
            </span>
            <div className="p-4 bg-zinc-900/40 border border-zinc-800/60 rounded-xl text-right font-['Noto_Sans_Arabic'] text-zinc-200 text-sm leading-[1.9] whitespace-pre-wrap select-text max-h-60 overflow-y-auto shadow-inner text-justify">
              {result}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default WebSummarizer;