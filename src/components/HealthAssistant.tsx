/* eslint-disable */
// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { auth } from '../firebase';

interface HealthHistoryItem {
  id: string;
  question: string;
  image: string | null;
  result: string;
  timestamp: string;
}

const HealthAssistant: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HealthHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const resultRef = useRef<HTMLDivElement>(null);

  // 👑 لۆدکردنی مێژووی شیکارییە تەندروستییەکان لە لۆکاڵ ستۆرێجەوە
  useEffect(() => {
    const savedHistory = localStorage.getItem('kurdai_health_analysis_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Error parsing health history:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [result]);

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

  const handleAnalyze = async () => {
    if ((!image && !question.trim()) || loading) return;
    setLoading(true);
    setResult("");
    
    try {
      const userEmail = auth.currentUser?.email || "guest_user";
      const promptText = question.trim() !== "" ? question : "تکایە شیکاری بۆ ئەم زانیارییە یان پشکنینە پزیشکییە بکە.";
      
      const healthPrompt = `تۆ ڕاوێژکارێکی زیرەکی بواری تەندروستیت. وەک پسپۆڕێک وەڵامی ئەم پرسیارە تەندروستییە بدەرەوە بە زمانی کوردیی فەرمی. ئەگەر وێنەیەک هاوپێچە، بە وردی سەیری بکە و شیکاری بکە. وەڵامەکەت زۆر کورت، پوخت و ڕاستەوخۆ بێت بەبێ درێژدادڕی.\n\nپرسیار:\n${promptText}`;

      let base64Clean = null;
      if (image) {
        base64Clean = image.split(',')[1];
      }

      const response = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/chat', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: healthPrompt,
          email: userEmail,
          image: base64Clean, 
          mimeType: mimeType  
        }), 
      });

      const data = await response.json();

      if (response.status === 403) {
        throw new Error("⚠️ لێمیتی نامەکانی ئەمڕۆت تەواو بووە! بۆ بەردەوامبوون ببە بە ئەندامی Premium.");
      }

      if (!response.ok) {
        throw new Error(data.detail || "سێرڤەر وەڵامی نەدایەوە");
      }

      const responseText = data.response || "هیچ زانیارییەک وەرنەگیرا.";
      setResult(responseText);
      
      // 👑 پاشەکەوتکردنی ئەنجام بۆ لۆکاڵ ستۆرێج
      saveToHistory(question.trim() || "شیکاری نیشانە یان پشکنینی پاشکۆ", image, responseText);

    } catch (error: any) {
      console.error(error);
      setResult(error.message || "ببورە، هەڵەیەک لە کاتی شیکارکردنی زانیارییە تەندروستییەکان ڕوویدا.");
    } finally {
      setLoading(false);
    }
  };

  // 👑 پاشەکەوتکردنی داتاکان بۆ لۆکاڵ ستۆرێج
  const saveToHistory = (queryText: string, imgData: string | null, analysisResult: string) => {
    setHistory((prevHistory) => {
      const filtered = prevHistory.filter(item => item.question !== queryText || item.result !== analysisResult);
      const newItems = [
        { id: Date.now().toString(), question: queryText, image: imgData, result: analysisResult, timestamp: new Date().toLocaleDateString('ku-IQ') },
        ...filtered
      ].slice(0, 5);
      
      localStorage.setItem('kurdai_health_analysis_history', JSON.stringify(newItems));
      return newItems;
    });
  };

  const clearHistory = () => {
    localStorage.removeItem('kurdai_health_analysis_history');
    setHistory([]);
  };

  const handleLoadHistoryItem = (item: HealthHistoryItem) => {
    setQuestion(item.question === "شیکاری نیشانە یان پشکنینی پاشکۆ" ? "" : item.question);
    setImage(item.image);
    setResult(item.result);
    setIsHistoryOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-700 pb-20 px-2 sm:px-4" dir="rtl">
      
      {/* 👑 هێدەرێکی یەکجار شیک و دژە تێکچوون لەسەر مۆبایل */}
      <div className="flex flex-col sm:flex-row-reverse sm:justify-between sm:items-center w-full border-b border-white/5 pb-4 gap-4">
        <div className="flex justify-start sm:justify-end shrink-0">
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="px-4 py-2.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 hover:border-red-500/30 text-zinc-300 rounded-xl transition-all text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95"
          >
            <span>📜</span>
            <span>مێژووی ڕاوێژەکان</span>
            {history.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center font-mono">
                {history.length}
              </span>
            )}
          </button>
        </div>

        <div className="text-right space-y-2">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-['Noto_Sans_Arabic'] tracking-tighter leading-tight">
            ژیریی <span className="text-red-500">تەندروستی</span>
          </h2>
          <p className="text-slate-500 font-bold text-xs font-['Noto_Sans_Arabic'] leading-relaxed">
            شیکاریی وردی پشکنین و نیشانە پزیشکییەکان بە ژیریی KurdAI Pro
          </p>
        </div>
      </div>

      <div className="glass-panel p-5 sm:p-8 lg:p-14 rounded-2xl sm:rounded-[4rem] border border-white/5 shadow-3xl space-y-8 relative overflow-hidden bg-[#050507]">
        <div className="absolute top-0 left-0 w-64 h-64 bg-red-500/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] sm:tracking-[0.5em] font-['Noto_Sans_Arabic'] px-2">وەسفی نیشانەکان یان پرسیارەکەت</label>
              <textarea 
                value={question} 
                onChange={e => setQuestion(e.target.value)}
                className="w-full h-40 sm:h-48 bg-white/[0.02] p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] text-white text-base sm:text-xl border border-white/10 font-['Noto_Sans_Arabic'] focus:border-red-500/30 outline-none transition-all resize-none shadow-inner placeholder:opacity-20 leading-relaxed"
                placeholder="بۆ نموونە: ئەنجامی ئەم پشکنینەم بۆ ڕوون بکەرەوە، یان باسی ئازارەکەت بکە..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 py-4 sm:py-6 rounded-2xl sm:rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${
                  image ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 bg-white/[0.02] hover:bg-white/5'
                }`}
              >
                <span className="text-xl sm:text-2xl">{image ? '✅' : '📸'}</span>
                <span className="text-[9px] font-black font-['Noto_Sans_Arabic'] uppercase tracking-widest text-slate-500">بارکردنی وێنەی پشکنین یان نیشانە</span>
              </button>

              <button 
                type="button"
                onClick={handleAnalyze} 
                disabled={loading || (!question.trim() && !image)}
                className="flex-[1.5] py-4 sm:py-6 bg-red-600 text-white rounded-2xl sm:rounded-[2rem] font-black text-base sm:text-lg uppercase tracking-widest sm:tracking-[0.2em] font-['Noto_Sans_Arabic'] shadow-2xl shadow-red-600/20 hover:bg-red-500 disabled:opacity-20 transition-all active:scale-95"
              >
                {loading ? 'خەریکی پشکنینە...' : 'دەستپێکردنی پشکنین'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-4 w-full">
            <div className={`w-full aspect-video sm:aspect-square lg:flex-1 rounded-2xl sm:rounded-[3rem] border-2 border-dashed border-white/5 bg-white/[0.01] flex items-center justify-center relative overflow-hidden group ${!image && 'opacity-30'}`}>
              {image ? (
                <>
                  <img src={image} className="w-full h-full object-cover" alt="Medical Reference" />
                  <button 
                    type="button"
                    onClick={removeImage}
                    className="absolute top-3 left-3 w-8 h-8 bg-black/60 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
                  >✕</button>
                </>
              ) : (
                <div className="text-center space-y-3 p-6">
                  <div className="text-4xl sm:text-5xl opacity-10">🩺</div>
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-600 uppercase tracking-widest font-['Noto_Sans_Arabic']">%هیچ وێنەیەک دیاری نەکراوە</p>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl flex gap-3 items-center">
               <span className="text-xl">⚠️</span>
               <p className="text-[9px] sm:text-[10px] font-bold text-yellow-600/80 leading-relaxed font-['Noto_Sans_Arabic'] text-right">
                 تێبینی: ئەم ئەنجامانە تەنها بۆ زانیاری گشتین و جێگەی ڕاوێژی ڕاستەوخۆیی پزیشکی پسپۆڕ ناگرنەوە.
               </p>
            </div>
          </div>
        </div>

        {result && (
          <div 
            ref={resultRef}
            className="mt-8 p-6 sm:p-10 lg:p-16 bg-black/40 rounded-2xl sm:rounded-[3.5rem] border border-white/5 animate-in fade-in slide-in-from-top-6 duration-700 shadow-inner relative"
          >
            <div className="absolute top-4 sm:top-8 right-4 sm:right-8 text-[9px] font-black text-red-500 uppercase tracking-[0.4em] font-['Noto_Sans_Arabic']">ئەنجامی شیکاریی پزیشکی</div>
            <div className="text-slate-200 font-['Noto_Sans_Arabic'] leading-relaxed sm:leading-[2.2] text-sm sm:text-xl lg:text-2xl text-justify whitespace-pre-wrap pt-6">
              {result}
            </div>
          </div>
        )}
      </div>

      {/* 👑 مۆداڵی مێژووی ڕاوێژە پزیشکییەکان */}
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
              <span className="text-sm font-black text-white">📜 مێژووی ڕاوێژە پزیشکییەکان</span>
            </div>

            <div className="overflow-y-auto space-y-2.5 flex-1 pr-1 pl-1">
              {history.length === 0 ? (
                <div className="text-center py-12 text-zinc-600 text-xs italic">
                  هیچ مێژوویەکی پشکنین لەم ئامێرەدا پاشەکەوت نەکراوە.
                </div>
              ) : (
                history.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => handleLoadHistoryItem(item)}
                    className="p-3 bg-zinc-900/40 border border-zinc-800/60 hover:border-red-500/30 rounded-xl cursor-pointer transition-all flex flex-col text-right group space-y-1.5 active:scale-[0.99]"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-zinc-500 font-mono bg-zinc-950 px-2 py-0.5 rounded-md border border-zinc-900">
                        {item.timestamp}
                      </span>
                      <p className="text-zinc-200 text-xs font-bold truncate max-w-[70%] group-hover:text-red-400 transition-colors">
                        🩺 {item.question}
                      </p>
                    </div>
                    <p className="text-zinc-500 text-[11px] truncate border-t border-zinc-900/60 pt-1.5 italic">
                      {item.result}
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

export default HealthAssistant;