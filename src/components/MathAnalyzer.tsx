/* eslint-disable */
// @ts-nocheck
import React, { useState, useRef } from 'react';
import { auth } from '../firebase';

const MathAnalyzer: React.FC = () => {
  const [query, setQuery] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      // 📷 جیاکردنەوەی داتای وێنەکە لە پێشگری Base64 ئەگەر بوونی هەبێت
      let base64Clean = null;
      if (image) {
        base64Clean = image.split(',')[1];
      }

      // 🚀 ڕاستکردنەوە: ناردنی پەیام + داتای وێنە و جۆرەکەی بۆ باکێند
      const response = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/chat', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: mathPrompt,
          email: userEmail,
          image: base64Clean, // داتای وێنەکە نێردرا
          mimeType: mimeType  // جۆری وێنەکە نێردرا
        }), 
      });

      const data = await response.json();

      if (response.status === 403) {
        throw new Error("⚠️ لێمیتی نامەکانی ئەمڕۆت تەواو بووە! بۆ بەردەوامبوون ببە بە ئەندامی Premium.");
      }

      if (!response.ok) {
        throw new Error(data.detail || "سێرڤەر وەڵامی نەدایەوە");
      }

      setResult(data.response || "هیچ زانیارییەک وەرنەگیرا.");

    } catch (error: any) {
      console.error(error);
      setResult(error.message || "ببورا، هەڵەیەک لە کاتی لێکدانەوەی پرسیارە زانستییەکەدا ڕوویدا.");
    } window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    setLoading(false);
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20 px-2 sm:px-4" dir="rtl">
      <div className="text-center space-y-4">
        <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white font-['Noto_Sans_Arabic'] tracking-tighter">شیکەرەوەی <span className="text-yellow-500">زانستی</span></h2>
        <p className="text-slate-500 font-bold uppercase tracking-wider sm:tracking-[0.4em] text-[9px] sm:text-[10px] font-['Noto_Sans_Arabic']">شیکارکردنی هاوکێشەکان بە هێزی KurdAI Pro</p>
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
                placeholder="هاوکێشەکە لێرە بنووسە یان وێنەکەی باربکە و بنووسە (ئەمەم بۆ شیکار بکە)..."
                className="w-full h-40 sm:h-48 p-6 sm:p-8 bg-white/[0.02] border border-white/10 rounded-2xl sm:rounded-[2.5rem] text-white text-base sm:text-xl font-['Noto_Sans_Arabic'] focus:outline-none focus:border-yellow-500/40 resize-none placeholder:opacity-20 transition-all leading-relaxed"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                className="hidden" 
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-full sm:flex-1 py-4 sm:py-6 rounded-2xl sm:rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${image ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-white/10 bg-white/[0.02] hover:bg-white/5'}`}
              >
                <span className="text-xl sm:text-2xl">{image ? '✅' : '📷'}</span>
                <span className="text-[9px] font-black font-['Noto_Sans_Arabic'] uppercase tracking-widest text-slate-500">
                  {image ? 'وێنەکە وەرگیرا' : 'بارکردنی وێنەی هاوکێشە'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading || (!query.trim() && !image)}
                className="w-full sm:flex-[1.5] py-4 sm:py-6 bg-yellow-500 text-black rounded-2xl sm:rounded-3xl font-black text-base sm:text-lg uppercase tracking-widest sm:tracking-[0.2em] font-['Noto_Sans_Arabic'] shadow-2xl shadow-yellow-500/10 hover:bg-yellow-400 disabled:opacity-20 transition-all active:scale-95"
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
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-600 uppercase tracking-widest font-['Noto_Sans_Arabic']">هیچ وێنەیەک بار نەکراوە</p>
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
    </div>
  );
};

export default MathAnalyzer;