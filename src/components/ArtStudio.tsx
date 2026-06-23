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
  const [selectedStyle, setSelectedStyle] = useState('Photorealistic');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const styles = [
    { id: 'Photorealistic', label: 'واقیعی', icon: '📸' },
    { id: 'Cinematic', label: 'سینەمایی', icon: '🎬' },
    { id: 'Oil Painting', label: 'زەیتی', icon: '🎨' },
    { id: 'Digital Art', label: 'دیجیتاڵ', icon: '💻' }
  ];

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
      
      // 📷 جیاکردنەوەی داتای وێنەکە لە پێشگری Base64 ئەگەر بەکارهێنەر وێنەی دانابوو
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
          prompt: `مۆدێل و ستایل: ${selectedStyle}، کوالیتی: ${quality}، وەسف: ${prompt}`,
          email: userEmail,
          image: base64Clean,      // 🚀 ڕاستکردنەوە: داتای وێنەکە نێردرا
          mimeType: userMimeType  // 🚀 جۆری وێنەکە نێردرا
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
    <div className="max-w-6xl mx-auto space-y-10 md:space-y-16 pb-20 px-2 sm:px-4" dir="rtl">
      <div className="text-center space-y-4 md:space-y-6">
        <div className="flex items-center justify-center gap-2 md:gap-4">
           <div className="h-[1px] w-8 sm:w-12 bg-white/10"></div>
           <span className="text-[9px] sm:text-[10px] font-black text-amber-400 uppercase tracking-[0.4em] sm:tracking-[0.8em] font-['Noto_Sans_Arabic']">KurdAI CREATIVE ENGINE</span>
           <div className="h-[1px] w-8 sm:w-12 bg-white/10"></div>
        </div>
        <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white font-['Noto_Sans_Arabic'] tracking-tighter">ستۆدیۆی <span className="text-amber-400 italic">داهێنان</span></h2>
        <p className="text-slate-500 font-bold uppercase tracking-wider sm:tracking-[0.4em] text-[9px] sm:text-[10px] font-['Noto_Sans_Arabic']">بەرهەمهێنانی تابلۆ و گۆڕینی وێنە بە ژیریی دەستکردی پروو</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
        <div className="glass-panel p-6 sm:p-10 lg:p-14 rounded-3xl sm:rounded-[4rem] space-y-8 md:space-y-10 bg-[#050507] border border-white/5 shadow-3xl flex flex-col">
          
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] sm:tracking-[0.5em] font-['Noto_Sans_Arabic'] px-2">وێنەی بنەڕەتی (ئارەزوومەندانە)</label>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleUserImageChange} 
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-full sm:flex-1 h-24 sm:h-32 rounded-2xl sm:rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 ${userImage ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
              >
                <span className="text-2xl sm:text-3xl">{userImage ? '✅' : '📤'}</span>
                <span className="text-[9px] font-black font-['Noto_Sans_Arabic'] uppercase tracking-widest text-slate-500">
                  {userImage ? 'وێنە بارکرا' : 'بارکردنی وێنەی خۆت'}
                </span>
              </button>
              
              {userImage && (
                <div className="relative w-full sm:w-32 h-32 rounded-2xl sm:rounded-[2rem] overflow-hidden border border-white/10 group shrink-0">
                  <img src={userImage} className="w-full h-full object-cover" alt="User upload" />
                  <button 
                    type="button"
                    onClick={removeUserImage}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity text-xs"
                  >
                    سڕینەوە
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] sm:tracking-[0.5em] font-['Noto_Sans_Arabic'] px-2">وەسفی تابلۆ یان گۆڕانکاری</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={userImage ? "بنووسە دەتەوێت وێنەکەت چۆن بگۆڕێت... (بۆ نموونە: بیکە بە کارەکتەرێکی مێژوویی)" : "باسی ئەو وێنەیە بکە کە دەتەوێت دروستی بکەیت..."}
              className="w-full p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] bg-white/[0.02] border border-white/10 text-base sm:text-xl font-['Noto_Sans_Arabic'] focus:outline-none focus:border-amber-500 h-36 sm:h-40 resize-none text-right placeholder:opacity-20 transition-all leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {styles.map(style => (
              <button 
                type="button"
                key={style.id} 
                onClick={() => setSelectedStyle(style.id)} 
                className={`p-3 sm:p-4 rounded-2xl sm:rounded-3xl border transition-all text-center flex flex-col items-center justify-center ${selectedStyle === style.id ? 'bg-amber-500 text-black border-amber-500' : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'}`}
              >
                <span className="text-xl sm:text-2xl block mb-1 sm:mb-2">{style.icon}</span>
                <span className="text-[9px] sm:text-[10px] font-black font-['Noto_Sans_Arabic']">{style.label}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-2 p-1.5 bg-white/5 rounded-xl sm:rounded-[1.8rem]">
            {['1K', '2K'].map(q => (
              <button 
                type="button"
                key={q} 
                onClick={() => setQuality(q as any)} 
                className={`flex-1 py-3 rounded-lg sm:rounded-[1.4rem] font-black text-[9px] sm:text-[10px] uppercase transition-all ${quality === q ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}
              >
                {q === '1K' ? 'Standard' : 'Ultra (Pro)'}
              </button>
            ))}
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-black text-center animate-in shake leading-relaxed">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || (!prompt.trim() && !userImage)}
            className="w-full py-5 sm:py-7 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-black font-black text-lg sm:text-xl uppercase tracking-widest sm:tracking-[0.4em] rounded-2xl sm:rounded-[2.5rem] shadow-2xl font-['Noto_Sans_Arabic'] disabled:opacity-20 transition-all active:scale-95 mt-auto"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3 text-sm sm:text-base">
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                <span>خەریکی داڕشتنی بیرۆکەکەیە لە KurdAI Pro...</span>
              </div>
            ) : (userImage ? 'گۆڕینی وێنە' : 'دایبڕێژە بە KurdAI Pro')}
          </button>
        </div>

        <div className="flex items-center justify-center min-h-[300px] sm:min-h-[500px] w-full">
          {image ? (
            <div className="w-full bg-[#050505] rounded-3xl sm:rounded-[4rem] p-6 sm:p-8 border border-white/10 shadow-3xl animate-in zoom-in duration-500 flex flex-col justify-between h-full space-y-6">
              <div className="space-y-4">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block text-right">📜 پڕۆمپتی داهێنراوی ئینگلیزی بۆ وێنە:</span>
                <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/[0.02] border border-white/5 text-right font-mono text-slate-300 text-xs sm:text-sm leading-relaxed medals-code whitespace-pre-wrap select-text selection:bg-amber-500 selection:text-black">
                  {image}
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => { navigator.clipboard.writeText(image); alert("پڕۆمپتەکە کۆپی بوو! دەتوانیت لە Midjourney یان هەر شوێنێکی تر دایبنێیت."); }} 
                  className="flex-1 py-3.5 sm:py-4 bg-white text-black rounded-xl sm:rounded-2xl font-black text-[10px] uppercase tracking-widest font-['Noto_Sans_Arabic'] hover:bg-amber-500 transition-all text-center"
                >
                  کۆپیکردنی دەق
                </button>
                <button 
                  type="button"
                  onClick={() => setImage(null)} 
                  className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white/5 border border-white/10 text-white rounded-xl sm:rounded-2xl font-black text-[10px] uppercase transition-all text-center"
                >
                  سڕینەوە
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full aspect-square rounded-3xl sm:rounded-[4rem] bg-white/[0.01] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-slate-800 p-8 sm:p-20 group">
              <div className="text-7xl sm:text-[12rem] mb-6 sm:mb-10 opacity-5 transition-all duration-1000">🎨</div>
              <div className="text-center space-y-2 sm:space-y-4">
                <p className="text-[10px] sm:text-[12px] font-black uppercase tracking-widest sm:tracking-[0.6em] opacity-30 text-white font-['Noto_Sans_Arabic'] leading-loose">
                  {loading ? 'KurdAI Pro خەریکی شیکارییە...' : 'ئامادەیە بۆ لێکدانەوەی داهێنان'}
                </p>
                {!loading && <p className="text-[8px] sm:text-[9px] font-bold text-slate-700 font-['Noto_Sans_Arabic']">وەسفەکەت بنووسە تا پڕۆمپتی پێشکەوتووت بۆ دابڕێژێت</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtStudio;