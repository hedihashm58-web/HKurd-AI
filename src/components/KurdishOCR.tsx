/* eslint-disable */
// @ts-nocheck
import React, { useState, useRef } from 'react';

interface KurdishOCRProps {
  language?: 'ku' | 'ar';
}

const KurdishOCR: React.FC<KurdishOCRProps> = ({ language = 'ku' }) => {
  const [image, setImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setExtractedText('');
      };
      reader.readAsDataURL(file);
    }
  };

  const processOCR = async () => {
    if (!image) return;
    setLoading(true);
    setExtractedText('');

    try {
      const base64Data = image.split(',')[1];
      const prompt = `تۆ پێشکەوتووترین سیستەمی ناسینەوە و دەرهێنانی دەقیت لە وێنە (Kurdish Optical Character Recognition - OCR). 
تکایە بە ووردی تەواوی ئەو دەق، نوسراو، ژمارە و ناوانەی لەم وێنەیەدا هەن بە شێوازێکی زۆر ڕێکوپێک دەربهێنە.
- ئەگەر دەقەکە کوردی (سۆرانی، بادینی)، عەرەبی، ئینگلیزی یان هەر زمانێک بوو، بە تەواوی وەک خۆی بینووسەوە.
- ڕیزبەندی دێڕەکان، خاڵبەندی، و بڕگەکانی دەقەکە وەک وێنەکە ڕێکبخە.
- تەنها دەقی دەرهێنراو لە وێنەکە بینووسە بەبێ هیچ دەقی پێشەکی، سەرنج یان تێبینی.`;

      const response = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          image: base64Data,
          email: "ocr_user"
        }),
      });

      const data = await response.json();
      if (response.ok && data.response) {
        setExtractedText(data.response.trim());
      } else {
        setExtractedText("ببورە، نەتوانرا دەق لەم وێنەیەدا دەربهێنرێت. تکایە وێنەیەکی ڕوونتر دابنێ.");
      }
    } catch (err) {
      console.error(err);
      setExtractedText("خەتایەک لە پەیوەندیکردن بە سێرڤەر ڕوویدا. تکایە دووبارە هەوڵ بدەرەوە.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-4 space-y-4 sm:space-y-6 animate-in fade-in duration-500 pb-24" dir="rtl">
      
      {/* 🧭 بەشی سەرەوە: ناونیشان و ڕوونکردنەوە */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-emerald-950/40 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-800/80 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3 text-right">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xl sm:text-2xl shadow-[0_0_20px_rgba(16,185,129,0.2)] shrink-0">
            📸
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>دەرهێنانی دەق لە وێنە (Kurdish OCR)</span>
              <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-bold uppercase">
                AI Vision
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-400">دەرهێنانی دەقی کوردی، کتێب، پەڕاو و وەرەقە لە وێنە بە زیرەکی دەستکرد</p>
          </div>
        </div>
      </div>

      {/* 🌟 شوێنی سەرەکی OCR: بەشی بارکردن و بەشی دەق */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* 📷 بەشی لای ڕاست: بارکردنی وێنە و پێشبینین */}
        <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] border border-slate-800/90 p-4 sm:p-5 shadow-2xl flex flex-col justify-between space-y-4">
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageSelect} 
            accept="image/*" 
            className="hidden" 
          />
          <input 
            type="file" 
            ref={cameraInputRef} 
            onChange={handleImageSelect} 
            accept="image/*" 
            capture="environment" 
            className="hidden" 
          />

          {image ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950/80 flex items-center justify-center max-h-[320px] sm:max-h-[380px] group shadow-inner">
              <img src={image} alt="Selected" className="w-full h-full object-contain max-h-[320px] sm:max-h-[380px]" />
              
              {/* سکانەری ئەنیمەیشنکراوی لەیزەری لە کاتی خوێندنەوەدا */}
              {loading && (
                <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none flex flex-col justify-between">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_rgba(52,211,153,1)] animate-bounce duration-1000"></div>
                </div>
              )}

              {/* دوگمەی سڕینەوە و گۆڕینی وێنە */}
              <div className="absolute top-3 left-3 flex items-center gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold shadow-lg"
                >
                  گۆڕین
                </button>
                <button 
                  onClick={() => { setImage(null); setExtractedText(''); }}
                  className="w-7 h-7 rounded-xl bg-red-500/80 hover:bg-red-600 text-white flex items-center justify-center text-xs font-bold shadow-lg"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700/80 hover:border-emerald-500/60 bg-slate-950/40 hover:bg-slate-950/70 rounded-2xl sm:rounded-[1.75rem] p-6 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[240px] sm:min-h-[300px] group"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                📄
              </div>
              <h3 className="text-sm sm:text-base font-black text-white mb-1">وێنەیەک لێرە دابنێ یان کلیک بکە</h3>
              <p className="text-xs text-zinc-400 max-w-xs mb-4">وێنەی لاپەڕەی کتێب، نوسراو، تابلۆ یان وەرەقە دابنێ بۆ دەرهێنانی دەقەکەی</p>
              
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-bold text-zinc-300">
                  PNG, JPG, WebP
                </span>
              </div>
            </div>
          )}

          {/* دوگمەی دەستپێکردنی سکان */}
          <div className="pt-2 border-t border-slate-800/60">
            <button
              onClick={processOCR}
              disabled={!image || loading}
              className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                image && !loading
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/25 cursor-pointer'
                  : 'bg-zinc-800/60 text-zinc-600 border border-zinc-800 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>خەریکی دەرهێنانە...</span>
                </>
              ) : (
                <>
                  <span>⚡</span>
                  <span>دەرهێنانی دەق لە وێنەکە</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* 📝 بەشی لای چەپ: دەقی دەرهێنراو و دوگمەی کۆپیکردن */}
        <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] border border-slate-800/90 p-4 sm:p-5 shadow-2xl flex flex-col justify-between space-y-3">
          
          {/* ناونیشانی دەق و ژمارەی پیتەکان */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <span>📝</span>
              <span>دەقی دەرهێنراو</span>
            </span>

            {extractedText && (
              <span className="text-[10px] font-mono text-zinc-500">
                {extractedText.length} پیت
              </span>
            )}
          </div>

          {/* شوێنی نیشاندانی دەق */}
          <div className="flex-1 min-h-[220px] sm:min-h-[280px]">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center space-y-3">
                <div className="w-10 h-10 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-emerald-400 animate-pulse">KurdAI بە ووردی دەقەکانی وێنەکە دەخوێنێتەوە...</p>
              </div>
            ) : extractedText ? (
              <textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                className="w-full h-full min-h-[220px] sm:min-h-[280px] bg-slate-950/50 border border-slate-800/80 rounded-2xl p-3.5 text-white text-sm sm:text-base leading-relaxed focus:outline-none focus:border-emerald-500/50 resize-none font-medium"
                placeholder="دەقی دەرهێنراو لێرەدا دەردەکەوێت و دەتوانیت دەستکاریشی بکەیت..."
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-16 text-center text-zinc-600">
                <span className="text-3xl mb-2 opacity-30">🔍</span>
                <p className="text-xs font-medium">وێنەیەک دیاریبکە و کلیک لەسەر «دەرهێنانی دەق» بکە</p>
              </div>
            )}
          </div>

          {/* تەنها دوگمەی کۆپیکردن */}
          {extractedText && !loading && (
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-end">
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-zinc-100 hover:text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md active:scale-95 border border-slate-700"
              >
                <span>{copied ? "✓" : "📋"}</span>
                <span>{copied ? "کۆپی کرا" : "کۆپیکردن"}</span>
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default KurdishOCR;
