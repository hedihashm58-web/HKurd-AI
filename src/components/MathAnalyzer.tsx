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
      // دروستکردنی پڕۆمپتی زانستی بۆ مۆدێلی باکێند
      const mathPrompt = `تۆ زانایەکی پسپۆڕیت لە بواری بیرکاری، فیزیا و کیمیا. تکایە بە وردی و هەنگاو بە هەنگاو شیکاری بۆ ئەم کێشە زانستییە بکە بە زمانی کوردی.\n\nپرسیار:\n${query}`;

      const response = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/chat', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: mathPrompt,
          email: userEmail
        }), 
      });

      const data = await response.json();

      if (response.status === 403) {
        throw new Error("⚠️ لێمیتی نامەکانی ئەمڕۆت تەواو بووە! بۆ بەردەوامبوون ببە بە ئەندامی Premium.");
      }

      if (!response.ok) {
        throw new Error(data.detail || "سێرڤەر وەڵامی نەدایەوە");
      }

      setResult(data.response || "هیچ شیکارییەک وەرنەگیرا.");
    } catch (error: any) {
      console.error(error);
      setResult(error.message || "ببورە، هەڵەیەک لە کاتی شیکارکردن ڕوویدا. تکایە دووبارە هەوڵ بدەرەوە.");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 text-right" dir="rtl">
      <div className="text-center space-y-4">
        <h2 className="text-4xl lg:text-6xl font-black text-white font-['Noto_Sans_Arabic']">شیکارکەری <span className="text-yellow-500">زانستی</span></h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] font-['Noto_Sans_Arabic']">شیکاریی ورد بۆ بیرکاری، فیزیا و کیمیا بە وێنە و دەق</p>
      </div>

      <div className="glass-panel p-8 lg:p-12 rounded-[3.5rem] border border-white/5 shadow-3xl space-y-10 bg-[#050507]">
        <div className="space-y-6">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] font-['Noto_Sans_Arabic'] px-4">...وەسفی کێشەکە یان هاوکێشەکە</label>
          <textarea 
            value={query} 
            onChange={e => setQuery(e.target.value)}
            className="w-full h-40 bg-white/[0.02] p-8 rounded-[2rem] text-white text-xl border border-white/10 font-['Noto_Sans_Arabic'] focus:border-yellow-500/30 outline-none transition-all resize-none shadow-inner"
            placeholder="لێرە دەتوانیت پرسیارەکە بنووسیت یان وێنەیەک بار بکەیت..."
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-center">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 w-full lg:w-auto py-6 bg-white/[0.03] border border-white/10 rounded-[2rem] flex flex-col items-center justify-center gap-3 hover:bg-white/[0.05] transition-all group"
          >
            <div className="text-3xl group-hover:scale-110 transition-transform">📸</div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-['Noto_Sans_Arabic']">وێنەگرتن یان بارکردنی وێنە</span>
          </button>

          {image && (
            <div className="relative w-full lg:w-48 aspect-square rounded-[2rem] overflow-hidden border-2 border-yellow-500/30 group">
              <img src={image} className="w-full h-full object-cover" alt="Preview" />
              <button 
                onClick={removeImage}
                className="absolute top-2 left-2 w-8 h-8 bg-black/60 backdrop-blur-md rounded-full text-white text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <button 
          onClick={handleAnalyze} 
          disabled={loading || (!query.trim() && !image)}
          className="w-full py-8 bg-yellow-500 text-black rounded-[2.5rem] font-black text-lg uppercase tracking-[0.2em] font-['Noto_Sans_Arabic'] shadow-2xl shadow-yellow-500/10 hover:bg-yellow-400 disabled:opacity-20 transition-all active:scale-[0.98] flex items-center justify-center gap-4"
        >
          {loading ? (
            <>
              <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
              <span>خەریکی شیکارکردنە...</span>
            </>
          ) : (
            <>
              <span>دەستپێکردنی شیکار</span>
              <span className="text-2xl">📐</span>
            </>
          )}
        </button>

        {result && (
          <div className="mt-12 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="p-1 text-[10px] font-black text-yellow-500 uppercase tracking-[0.5em] font-['Noto_Sans_Arabic'] mb-4 px-4">ئەنجامی شیکارکردن</div>
            <div className="p-10 lg:p-14 bg-black/40 rounded-[3rem] border border-white/5 text-slate-200 font-['Noto_Sans_Arabic'] leading-[2] text-lg lg:text-xl text-justify whitespace-pre-wrap shadow-inner backdrop-blur-xl">
              {result}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto p-10 bg-yellow-500/5 border border-yellow-500/10 rounded-[3rem] flex gap-8 items-center flex-row-reverse">
        <div className="text-4xl">🔬</div>
        <div className="text-right space-y-2">
           <h4 className="text-yellow-500 font-black text-xs uppercase tracking-widest font-['Noto_Sans_Arabic']">تایبەتمەندی بیرکردنەوەی قووڵ</h4>
           <p className="text-[11px] text-slate-500 font-medium leading-relaxed font-['Noto_Sans_Arabic']">
             ئەم سیستەمە مۆدێلی KurdAI Pro بەکاردەهێنێت بۆ ئەوەی بە قووڵی بیر لە کێشە زانستییەکان بکاتەوە و وردترین وەڵامت بداتەوە.
           </p>
        </div>
      </div>
    </div>
  );
};

export default MathAnalyzer;