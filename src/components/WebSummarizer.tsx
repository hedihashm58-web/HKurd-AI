/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';

interface WebSummarizerProps {
  language: 'ku' | 'ar';
}

interface WebHistoryItem {
  id: string;
  url: string;
  summaryResult: string;
  timestamp: string;
}

const WebSummarizer: React.FC<WebSummarizerProps> = ({ language }) => {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<WebHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // 👑 لۆدکردنی مێژووی کورتکراوەکانی وێب لە لۆکاڵ ستۆرێجەوە
  useEffect(() => {
    const savedHistory = localStorage.getItem('kurdai_web_summary_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Error parsing web summary history:", e);
      }
    }
  }, []);

  const handleSummarize = async () => {
    if (!url.trim() || loading) return;
    
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
      
      const response = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/chat', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: url.trim(), 
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

      const responseText = data.response || (language === 'ku' ? "هیچ زانیارییەک وەرنەگیرا." : "لم يتم العثور على معلومات.");
      setResult(responseText);
      saveToHistory(url.trim(), responseText);

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

  // 👑 پاشەکەوتکردنی بەستەری کورتکراوە بۆ ناو لۆکاڵ ستۆرێج
  const saveToHistory = (webUrl: string, summaryResult: string) => {
    setHistory((prevHistory) => {
      const filtered = prevHistory.filter(item => item.url !== webUrl);
      const newItems = [
        { id: Date.now().toString(), url: webUrl, summaryResult, timestamp: new Date().toLocaleDateString('ku-IQ') },
        ...filtered
      ].slice(0, 5);
      
      localStorage.setItem('kurdai_web_summary_history', JSON.stringify(newItems));
      return newItems;
    });
  };

  const clearHistory = () => {
    localStorage.removeItem('kurdai_web_summary_history');
    setHistory([]);
  };

  const handleLoadHistoryItem = (item: WebHistoryItem) => {
    setResult(item.summaryResult);
    setUrl(item.url);
    setIsHistoryOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20 px-3" dir="rtl">
      
      {/* 👑 هێدەرێکی یەکجار شیک و دژە تێکچوون لەسەر مۆبایل */}
      <div className="flex flex-col sm:flex-row-reverse sm:justify-between sm:items-center w-full border-b border-zinc-900 pb-4 gap-4">
        <div className="flex justify-start sm:justify-end shrink-0">
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="px-4 py-2.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 hover:border-yellow-500/30 text-zinc-300 rounded-xl transition-all text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95"
          >
            <span>📜</span>
            <span>مێژووی بەستەرەکان</span>
            {history.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-yellow-500 text-zinc-950 text-[10px] font-black flex items-center justify-center font-mono">
                {history.length}
              </span>
            )}
          </button>
        </div>

        <div className="text-right space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-black text-white font-['Noto_Sans_Arabic'] tracking-tight leading-tight">
            {language === 'ku' ? 'کورتکەرەوەی ' : 'ملخص '}<span className="text-yellow-500">{language === 'ku' ? 'وێب و بەستەر' : 'المواقع والروابط'}</span>
          </h2>
          <p className="text-zinc-500 text-xs font-['Noto_Sans_Arabic'] leading-relaxed">
            {language === 'ku' ? 'خوێندنەوە و کورتکردنەوەی داینامیکی ماڵپەڕەکان بە زمانی کوردی پاراو' : 'قراءة وتلخيص محتوى المواقع '}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start w-full">
        
        {/* 📥 کارتی داڵێکردنی لێنک */}
        <div className="p-5 rounded-3xl bg-[#0e0e12]/90 border border-zinc-800/80 shadow-xl flex flex-col justify-between min-h-[220px] transition-all duration-300 focus-within:border-yellow-500/40">
          <textarea
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={language === 'ku' ? "لێنکی بابەتەکە یان لاپەڕەی ماڵپەڕەکە لێرە دابنێ..." : "أدخل رابط المقال أو موقع الويب هنا..."}
            className="w-full bg-transparent text-zinc-100 text-sm font-['Noto_Sans_Arabic'] focus:outline-none h-24 resize-none text-right placeholder:text-zinc-600 leading-relaxed font-medium"
          />

          <div className="flex justify-between items-center pt-3 border-t border-zinc-900/90 mt-2 shrink-0">
            <span className="text-base select-none pl-1">🔗</span>
            <div className="text-[10px] font-black text-zinc-600 font-mono tracking-widest">KurdAI WebReader v1.0</div>
          </div>
        </div>

        {/* 📤 بۆکسی پیشاندانی ئەنجام */}
        <div className="flex flex-col space-y-2 w-full">
          <label className="text-[10px] font-black text-yellow-500 uppercase tracking-wider pr-1">✨ کورتەی پوختی بابەتەکە:</label>
          <div className="p-5 rounded-3xl bg-[#0b0b0e]/90 border border-zinc-800 shadow-xl min-h-[220px] flex flex-col justify-between relative">
            <div className="text-zinc-200 text-sm leading-[1.9] text-right min-h-[140px] whitespace-pre-wrap font-medium pb-4 select-text overflow-y-auto max-h-80 text-justify">
              {loading ? (
                <span className="text-zinc-600 italic animate-pulse">{language === 'ku' ? 'KurdAI خەریکی خوێندنەوە و کورتکردنەوەیە...' : 'جاري التدقيق...'}</span>
              ) : result ? (
                <span className="text-zinc-200">{result}</span>
              ) : (
                <span className="text-zinc-700 italic text-xs">{language === 'ku' ? 'دوای داگرتنی دوگمەکە، کورتەی تەواوی بەستەرەکە لێرە پیشان دەدرێت.' : 'سيظهر النص المصحح هنا.'}</span>
              )}
            </div>
          </div>
        </div>

      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center animate-in fade-in duration-200">
          {error}
        </div>
      )}

      {/* 🚀 دوگمەی ناردن */}
      <button
        type="button"
        onClick={handleSummarize}
        disabled={loading || !url.trim()}
        className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-black text-xs rounded-xl transition-all shadow-xl active:scale-[0.98] disabled:opacity-20 font-['Noto_Sans_Arabic'] uppercase tracking-wider"
      >
        {loading 
          ? (language === 'ku' ? 'خەریکی خوێندنەوە و کورتکردنەوەیە...' : 'جاري القراءة والتلخيص...') 
          : (language === 'ku' ? 'دەستپێکردنی کورتکردنەوە' : 'بدء التلخيص الذكي')}
      </button>

      {/* 👑 مۆداڵی مێژووی پۆڵایین بۆ پیشاندانی داتاکان بە خێرایی */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setIsHistoryOpen(false)}></div>
          
          <div className="relative bg-[#0b0b0e] border border-zinc-800 rounded-2xl max-w-lg w-full p-5 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[75vh]">
            
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3 mb-3 shrink-0">
              <button 
                onClick={() => setIsHistoryOpen(false)}
                className="w-7 h-7 bg-zinc-900 text-zinc-400 hover:text-white rounded-full flex items-center justify-center text-xs border border-zinc-800 transition-all"
              >
                ✕
              </button>
              <span className="text-sm font-black text-white">📜 مێژووی کورتکردنەوەی ماڵپەڕەکان</span>
            </div>

            <div className="overflow-y-auto space-y-2.5 flex-1 pr-1 pl-1">
              {history.length === 0 ? (
                <div className="text-center py-12 text-zinc-600 text-xs italic">
                  هیچ مێژوویەکی کورتکردنەوە لەم ئامێرەدا پاشەکەوت نەکراوە.
                </div>
              ) : (
                history.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => handleLoadHistoryItem(item)}
                    className="p-3 bg-zinc-900/40 border border-zinc-800/60 hover:border-yellow-500/30 rounded-xl cursor-pointer transition-all flex flex-col text-right group space-y-1.5 active:scale-[0.99]"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-zinc-500 font-mono bg-zinc-950 px-2 py-0.5 rounded-md border border-zinc-900">
                        {item.timestamp}
                      </span>
                      <p className="text-zinc-200 text-xs font-bold truncate max-w-[70%] group-hover:text-yellow-500 transition-colors">
                        🔗 {item.url}
                      </p>
                    </div>
                    <p className="text-zinc-500 text-[11px] truncate border-t border-zinc-900/60 pt-1.5 italic">
                      {item.summaryResult}
                    </p>
                  </div>
                ))
              )}
            </div>

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

export default WebSummarizer;