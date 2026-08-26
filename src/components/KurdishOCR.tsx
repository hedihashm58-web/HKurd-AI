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

  // 📷 ئۆپتیمایزکردن و گونجاندنی قەبارەی وێنە بۆ ناسینەوەی خێرا و سەد لە سەد بێ کێشە
  const optimizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 2048; // کوالیتی بەرز بۆ پاراستنی دەقی وورد
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.92));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const optimized = await optimizeImage(file);
        setImage(optimized);
        setExtractedText('');
      } catch (err) {
        console.error("Image loading error:", err);
      }
    }
  };

  const processOCR = async () => {
    if (!image) return;
    setLoading(true);
    setExtractedText('');

    try {
      const base64Data = image.split(',')[1];
      
      // بانگکردنی ڕاوتی فەرمی و تایبەتی OCR
      const response = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64Data,
          mimeType: 'image/jpeg',
          email: "ocr_user"
        }),
      });

      const data = await response.json();
      if (response.ok && (data.text || data.response)) {
        setExtractedText((data.text || data.response).trim());
      } else {
        // فۆڵبەک بۆ چات ئەگەر ڕاوتی تایبەت لەکاربوو
        const fbRes = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: "تەنها و تەنها دەقی ناو ئەم وێنەیە بە شێوازی دەقی خاو (Raw Text) وەک خۆی بنووسەوە بەبێ هیچ پێشەکی، وتە، یان ڕوونکردنەوەیەک.",
            image: base64Data,
            email: "ocr_user"
          }),
        });
        const fbData = await fbRes.json();
        if (fbRes.ok && fbData.response) {
          setExtractedText(fbData.response.trim());
        } else {
          setExtractedText("ببورە، نەتوانرا دەق لەم وێنەیەدا دەربهێنرێت. تکایە وێنەیەکی ڕوونتر دابنێ.");
        }
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
            <p className="text-[11px] sm:text-xs text-zinc-400">دەرهێنانی تەواوی دەقی کوردی، پەڕاو، کتێب و دەستنووس بە ووردیی سەد لە سەد</p>
          </div>
        </div>
      </div>

      {/* 🌟 شوێنی سەرەکی OCR: بەشی بارکردن و بەشی دەق */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* 📷 بەشی لای ڕاست: بارکردنی وێنە و پێشبینین */}
        <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] border border-slate-800/90 p-4 sm:p-5 shadow-2xl flex flex-col justify-between space-y-4">
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-400 border-b border-slate-800/60 pb-2">
              <span>وێنەی بەڵگەنامە / دەقەکە:</span>
              {image && (
                <button
                  onClick={() => { setImage(null); setExtractedText(''); }}
                  className="text-red-400 hover:text-red-300 transition-all text-[11px]"
                >
                  ✕ سڕینەوەی وێنە
                </button>
              )}
            </div>

            {/* بۆکسی وێنە */}
            <div 
              onClick={() => !image && fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center transition-all min-h-[220px] sm:min-h-[280px] overflow-hidden ${
                image 
                  ? 'border-emerald-500/40 bg-slate-950/60' 
                  : 'border-slate-700 hover:border-emerald-500/60 bg-slate-950/30 cursor-pointer hover:bg-slate-900/40'
              }`}
            >
              {image ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img 
                    src={image} 
                    alt="Uploaded preview" 
                    className="max-h-[260px] sm:max-h-[300px] w-auto object-contain rounded-xl shadow-lg"
                  />
                  {loading && (
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-bold text-emerald-400 animate-pulse">خەریکی دەرهێنانی وشە بە وشەی دەقەکەیە...</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-3 py-6">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl shadow-inner">
                    📁
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-white mb-1">وێنەی دەق یان کتێبەکە لێرە دابنێ</p>
                    <p className="text-[11px] text-zinc-500">کلیک بکە بۆ هەڵبژاردن یان ڕاکێشانی وێنە</p>
                  </div>
                </div>
              )}
            </div>

            {/* Input ە شاراوەکان */}
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
          </div>

          {/* دوگمەی سەرەکی پرۆسێسکردن */}
          <button
            onClick={processOCR}
            disabled={!image || loading}
            className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 shadow-lg active:scale-98 ${
              image && !loading
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/25 cursor-pointer'
                : 'bg-zinc-800/60 text-zinc-600 border border-zinc-800 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>خەریکی دەرهێنانی دەقە...</span>
              </>
            ) : (
              <>
                <span>⚡</span>
                <span>دەرهێنانی دەق لە وێنەکە</span>
              </>
            )}
          </button>
        </div>

        {/* 📝 بەشی لای چەپ: دەقی دەرهێنراو */}
        <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] border border-slate-800/90 p-4 sm:p-5 shadow-2xl flex flex-col justify-between space-y-4">
          
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400 border-b border-slate-800/60 pb-2">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span>📄</span>
              <span>دەقی دەرهێنراو لە وێنەکە:</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              {extractedText ? `${extractedText.length} پیت` : ''}
            </span>
          </div>

          {/* بۆکسی پیشاندانی دەق */}
          <div className="flex-1 min-h-[220px] sm:min-h-[280px] bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 overflow-y-auto">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3 py-12 text-center">
                <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-medium text-emerald-400/80">KurdAI بە ووردی پیت بە پیتی وێنەکە دەخوێنێتەوە...</p>
              </div>
            ) : extractedText ? (
              <div className="text-slate-100 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-right font-medium select-text">
                {extractedText}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center text-zinc-600 space-y-2">
                <span className="text-3xl opacity-30">✍️</span>
                <p className="text-xs font-medium">پاش دەرهێنان، تەواوی دەقەکە ڕاستەوخۆ لێرەدا دەردەکەوێت</p>
              </div>
            )}
          </div>

          {/* دوگمەی کۆپیکردن */}
          {extractedText && !loading && (
            <button
              onClick={copyToClipboard}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-zinc-100 hover:text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md active:scale-98 border border-slate-700"
            >
              <span>{copied ? "✓" : "📋"}</span>
              <span>{copied ? "کۆپی کرا لە کلیپبۆرد" : "کۆپیکردنی دەقەکە"}</span>
            </button>
          )}

        </div>

      </div>

    </div>
  );
};

export default KurdishOCR;
