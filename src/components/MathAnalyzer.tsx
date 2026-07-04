/* eslint-disable */
// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { auth } from '../firebase';

interface MathHistoryItem {
  id: string;
  query: string;
  image: string | null;
  result: string;
  timestamp: string;
}

const MathAnalyzer: React.FC = () => {
  const [query, setQuery] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<MathHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 👑 لۆدکردنی مێژووی شیکارییە زانستییەکان لە لۆکاڵ ستۆرێجەوە
  useEffect(() => {
    const savedHistory = localStorage.getItem('kurdai_math_analysis_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Error parsing math history:", e);
      }
    }
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        setImage(readerEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if ((!query.trim() && !image) || loading) return;
    setLoading(true);
    setResult("");
    
    try {
      const userEmail = auth.currentUser?.email || "guest_user";
      
      const promptText = query.trim() !== "" ? query : "تکایە شیکاری بۆ ئەم هاوکێشە یان پرسیارە زانستییە بکە.";
      const mathPrompt = `تۆ زانایەکی پسپۆڕیت لە بواری بیرکاری، فیزیا و کیمیا. وەک پرۆفیسۆرێک بە زمانی کوردیی فەرمی و زۆر ڕوون و کورت وەڵامی ئەم پرسیارە زانستییە بدەرەوە. ئەگەر وێنەیەک هاوپێچە (کە دەکرێت هاوکێشە، دیاگرام یان ڕستەیەکی زانستی بێت)، بە وردی سەیری بکە و شیکاری بکە. وەڵامەکەت زۆر درێژ نەبێت و ڕاستەوخۆ بچێتە سەر چارەسەر.\n\nپرسیار:\n${promptText}`;

      let base64Clean = null;
      if (image) {
        base64Clean = image.split(',')[1];
      }

      const response = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/chat', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: mathPrompt,
          email: userEmail,
          image: base64Clean, 
          mimeType: mimeType  
        }), 
      });

      const data = await response.json();

      if (response.status === 403) {
        throw new Error("⚠️ لێمیتی نامەکانی ئەمڕۆت تەواو بووە! بۆ بەکارهێنانی بێسنوور ببە بە ئەندامی Premium.");
      }

      if (!response.ok) {
        throw new Error(data.detail || "سێرڤەر وەڵامی نەدایەوە");
      }

      const responseText = data.response || "هیچ وەڵامێک نەگەڕایەوە.";
      setResult(responseText);
      
      // 👑 پاشەکەوتکردنی ئەنجامەکە بۆ مێژوو
      saveToHistory(query.trim() || "شیکاری وێنەی هاوپێچ", image, responseText);

    } catch (error: any) {
      console.error(error);
      setResult(error.message || "ببورا، هەڵەیەک لە کاتی لێکدانەوەی پرسیارە زانستییەکەدا ڕوویدا.");
    } window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    setLoading(false);
  };

  // 👑 پاشەکەوتکردنی داتاکان بۆ لۆکاڵ ستۆرێج
  const saveToHistory = (queryText: string, imgData: string | null, analysisResult: string) => {
    setHistory((prevHistory) => {
      const filtered = prevHistory.filter(item => item.query !== queryText || item.result !== analysisResult);
      const newItems = [
        { id: Date.now().toString(), query: queryText, image: imgData, result: analysisResult, timestamp: new Date().toLocaleDateString('ku-IQ') },
        ...filtered
      ].slice(0, 5);
      
      localStorage.setItem('kurdai_math_analysis_history', JSON.stringify(newItems));
      return newItems;
    });
  };

  const clearHistory = () => {
    localStorage.removeItem('kurdai_math_analysis_history');
    setHistory([]);
  };

  const handleLoadHistoryItem = (item: MathHistoryItem) => {
    setQuery(item.query === "شیکاری وێنەی هاوپێچ" ? "" : item.query);
    setImage(item.image);
    setResult(item.result);
    setIsHistoryOpen(false);
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700 pb-20 px-2 sm:px-4" dir="rtl">
      
      {/* 👑 هێدەرێکی یەکجار شیک و دژە تێکچوون لەسەر مۆبایل */}
      <div className="flex flex-col sm:flex-row-reverse sm:justify-between sm:items-center w-full border-b border-white/5 pb-4 gap-4">
        <div className="flex justify-start sm:justify-end shrink-0">
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="px-4 py-2.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 hover:border-yellow-500/30 text-zinc-300 rounded-xl transition-all text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95"
          >
            <span>📜</span>
            <span>مێژووی شیکارییەکان</span>
            {history.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-yellow-500 text-zinc-950 text-[10px] font-black flex items-center justify-center font-mono">
                {history.length}
              </span>
            )}
          </button>
        </div>

        <div className="text-right space-y-2">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-['Noto_Sans_Arabic'] tracking-tighter leading-tight">
            شیکەرەوەی <span className="text-yellow-500">زانستی</span>
          </h2>
          <p className="text-slate-500 font-bold text-xs font-['Noto_Sans_Arabic'] leading-relaxed">
            شیکارکردنی هاوکێشە ئاڵۆزەکانی بیرکاری، فیزیا و کیمیا بە هێزی KurdAI Pro
          </p>
        </div>
      </div>

      <div className="glass-panel p-6 sm:p-10 lg:p-16 rounded-[2.5rem] sm:rounded-[4rem] border border-white/5 bg-[#050507] shadow-3xl space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-500/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] sm:tracking-[0.5em] font-['Noto_Sans_Arabic'] px-2">پڕۆمپت یان پرسیارەکە بنووسە</label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="هاوکێشەکە لێرە بنووسە یان وێنەکەی باربکە..."
                className="w-full h-40 sm:h-48 p-6 sm:p-8 bg-white/[0.02] border border-white/10 rounded-2xl sm:rounded-[2.5rem] text-white text-base sm:text-xl font-['Noto_Sans_Arabic'] focus:outline-none focus:border-yellow-500/40 resize-none placeholder:opacity-20 transition-all leading-relaxed"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-full sm:w-auto px-6 py-4 rounded-xl border border-dashed transition-all flex items-center justify-center gap-2 ${image ? 'border-yellow-500/50 bg-yellow-500/5 text-yellow-500' : 'border-white/10 bg-white/[0.02] hover:bg-white/5 text-slate-400'}`}
              >
                <span className="text-lg">{image ? '✅' : '📸'}</span>
                <span className="text-xs font-bold font-['Noto_Sans_Arabic']">
                  {image ? 'وێنەکە وەرگیرا' : 'بارکردنی وێنە'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading || (!query.trim() && !image)}
                className="w-full sm:flex-1 py-4 bg-yellow-500 text-black rounded-xl font-black text-sm uppercase font-['Noto_Sans_Arabic'] shadow-2xl shadow-yellow-500/10 hover:bg-yellow-400 disabled:opacity-20 transition-all active:scale-95"
              >
                {loading ? 'خەریکی لێکدانەوەیە...' : 'دەستپێکردنی شیکار'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-4 w-full justify-between">
            <div className={`w-full aspect-video sm:aspect-square lg:flex-1 rounded-2xl sm:rounded-[3rem] border-2 border-dashed border-white/5 bg-white/[0.01] flex items-center justify-center relative overflow-hidden group ${!image && 'opacity-30'}`}>
              {image ? (
                <>
                  <img src={image} className="w-full h-full object-cover" alt="Formula reference" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-3 left-3 w-8 h-8 bg-black/60 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
                  >✕</button>
                </>
              ) : (
                <div className="text-center space-y-3 p-6">
                  <div className="text-4xl sm:text-5xl opacity-10">🔬</div>
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-600 uppercase tracking-widest font-['Noto_Sans_Arabic']">%هیچ وێنەیەک بار نەکراوە</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl flex gap-3 items-center">
              <span className="text-xl">🔬</span>
              <div className="text-right space-y-0.5">
                <h4 className="text-yellow-500 font-black text-[10px] uppercase tracking-widest font-['Noto_Sans_Arabic']">سیستەمی شیکاریی زانستی</h4>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 font-['Noto_Sans_Arabic']">KurdAI Pro دەتوانێت هاوکێشە ئاڵۆزەکان قۆناغ بە قۆناغ ڕوون بکاتەوە.</p>
              </div>
            </div>
          </div>
        </div>

        {result && (
          <div className="mt-12 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="p-1 text-[10px] font-black text-yellow-500 uppercase tracking-[0.5em] font-['Noto_Sans_Arabic'] mb-4 px-4">ئەنجامی شیکارکردن</div>
            <div className="p-8 sm:p-12 bg-black/40 rounded-2xl sm:rounded-[3.5rem] border border-white/5 text-slate-200 font-['Noto_Sans_Arabic'] leading-[2.2] text-sm sm:text-xl text-justify whitespace-pre-wrap shadow-inner backdrop-blur-xl">
              {result}
            </div>
          </div>
        )}
      </div>

      {/* 👑 مۆداڵی پۆڵایینی مێژوو ڕێک وەک وێب کورتکەرەوە و PDF کورتکەرەوە */}
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
              <span className="text-sm font-black text-white">📜 مێژووی شیکارییە زانستییەکان</span>
            </div>

            <div className="overflow-y-auto space-y-2.5 flex-1 pr-1 pl-1">
              {history.length === 0 ? (
                <div className="text-center py-12 text-zinc-600 text-xs italic">
                  هیچ مێژوویەکی شیکاری لەم ئامێرەدا پاشەکەوت نەکراوە.
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
                        🔬 {item.query}
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

export default MathAnalyzer;