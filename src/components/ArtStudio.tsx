/* eslint-disable */
// @ts-nocheck
import React, { useState, useRef } from 'react';
import { auth } from '../firebase';

const ArtStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [userMimeType, setUserMimeType] = useState<string>('image/jpeg');
  const [loading, setLoading] = useState(false);
  const [quality, setQuality] = useState<'1K' | '2K'>('1K');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUserImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUserMimeType(file.type);
      const reader = new FileReader();
      reader.onload = (event) => setUserImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeUserImage = () => {
    setUserImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !userImage) return;
    setLoading(true);
    setError(null);
    setImage(null);

    try {
      const userEmail = auth.currentUser?.email || "guest_user";
      const BACKEND_URL = "https://hedihashm-kurdai-chat-brain.hf.space"; 
      
      let base64Clean = null;
      if (userImage) {
        base64Clean = userImage.split(',')[1];
      }

      const response = await fetch(`${BACKEND_URL}/api/art-studio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `کوالیتی: ${quality}، وەسف: ${prompt}`,
          email: userEmail,
          image: base64Clean,      
          mimeType: userMimeType  
        })
      });

      const data = await response.json();

      if (response.status === 429 || response.status === 403 || (data.detail && data.detail.includes("429")) || (data.detail && data.detail.includes("RESOURCE_EXHAUSTED"))) {
        throw new Error("⚠️ لێمیتی دروستکردنی وێنەی ئەمڕۆت تەواو بووە! تکایە کەمێک چاوەڕوان بە یان ببە بە ئەندامی شاهانە (Premium).");
      }

      if (!response.ok) {
        throw new Error(data.detail || "هەڵەیەک لە سیستەمدا ڕوویدا.");
      }

      if (data.art_response) {
        setImage(data.art_response);
      } else {
        throw new Error("هیچ وەڵامێک لە مۆدێلەکەوە نەگەڕایەوە.");
      }

    } catch (err: any) {
      console.error(err);
      const errMsg = err.message || "";
      if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota")) {
        setError("⚠️ لێمیتی دروستکردنی وێنەی ئەمڕۆت تەواو بووە! تکایە کەمێک چاوەڕوان بە یان ببە بە ئەندامی شاهانە (Premium).");
      } else {
        setError(err.message || "پەیوەندی بە باکێندەوە نەکرا.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto h-auto space-y-4 px-3 flex flex-col justify-start" dir="rtl">
      
      <div className="text-center pt-2">
        <h2 className="text-xl sm:text-2xl font-black text-white font-['Noto_Sans_Arabic'] tracking-tight">ستۆدیۆی <span className="text-amber-400 italic">داهێنان</span></h2>
      </div>

      <div className="flex flex-col gap-3.5 w-full">
        
        <div className="p-4 rounded-2xl bg-[#0e0e12]/90 border border-zinc-800/80 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col relative transition-all duration-300 focus-within:border-amber-500/40">
          
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleUserImageChange} />

          {userImage && (
            <div className="mb-2 relative w-12 h-12 rounded-xl overflow-hidden border border-zinc-800 shadow-md animate-in zoom-in-95 duration-150">
              <img src={userImage} className="w-full h-full object-cover" alt="User upload" />
              <button 
                type="button" 
                onClick={removeUserImage} 
                className="absolute inset-0 bg-black/75 flex items-center justify-center text-white text-[10px] font-black"
              >
                ✕
              </button>
            </div>
          )}

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="چی لە مێشکدایە؟ بە کوردی لێرە بینووسە..."
            className="w-full bg-transparent text-zinc-100 text-sm font-['Noto_Sans_Arabic'] focus:outline-none h-20 sm:h-24 resize-none text-right placeholder:text-zinc-600 leading-relaxed font-medium"
          />

          {/* 👑 ڕێکخستنی نوێی بەشی ئامرازەکان و هێنانی دوگمەی گەڕان/داهێنان بۆ ناو کارتەکە بە ڕەنگێکی تەواو گەش */}
          <div className="flex justify-between items-center pt-3 border-t border-zinc-900/90 mt-2 gap-2">
            
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-all duration-200 active:scale-95 border ${
                  userImage 
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' 
                    : 'border-zinc-800/80 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                📸
              </button>

              <div className="flex gap-1 bg-zinc-950/60 p-0.5 rounded-lg border border-zinc-900 text-[9px] font-bold">
                {['1K', '2K'].map(q => (
                  <button 
                    type="button"
                    key={q} 
                    onClick={() => setQuality(q as any)} 
                    className={`px-2 py-1 rounded-md transition-all duration-150 ${
                      quality === q 
                        ? 'bg-zinc-100 text-zinc-950 font-black' 
                        : 'text-zinc-500'
                    }`}
                  >
                    {q === '1K' ? 'Standard' : 'Pro 2K'}
                  </button>
                ))}
              </div>
            </div>

            {/* 👑 دوگمەی سەرەکی دروستکردن بە ڕەنگی زێڕینی درەوشاوە و دەقی ڕووناک لێرە جێگیر کرا */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || (!prompt.trim() && !userImage)}
              className="px-5 py-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 disabled:from-zinc-900 disabled:to-zinc-900 text-slate-950 disabled:text-zinc-600 font-black text-xs rounded-xl transition-all shadow-md active:scale-[0.98]"
            >
              {loading ? '⏳...' : (userImage ? '✨ گۆڕینی وێنە' : '✨ دروستکردن')}
            </button>

          </div>
        </div>

        {error && (
          <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center animate-in fade-in duration-200">
            {error}
          </div>
        )}

        {image && (
          <div className="w-full bg-[#0d0d11]/90 rounded-2xl p-4 border border-zinc-800/60 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col space-y-2">
            <span className="text-[10px] font-black text-amber-400 block text-right">📜 پڕۆمپتی ئینگلیزی دروستبوو:</span>
            <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-right font-mono text-zinc-200 text-xs leading-relaxed whitespace-pre-wrap select-text max-h-48 overflow-y-auto">
              {image}
            </div>
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => { navigator.clipboard.writeText(image); alert("کۆپی بوو! ✓"); }} 
                className="flex-1 py-1.5 bg-zinc-100 text-zinc-950 rounded-xl font-black text-xs text-center"
              >
                کۆپیکردنی دەق
              </button>
              <button 
                type="button"
                onClick={() => setImage(null)} 
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-800/80 text-zinc-400 rounded-xl font-bold text-xs text-center"
              >
                سڕینەوە
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ArtStudio;