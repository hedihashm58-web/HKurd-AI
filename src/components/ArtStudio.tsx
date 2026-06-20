import React, { useState, useRef } from 'react';

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
      // 🔗 💡 بەستنەوەی ڕاستەوخۆ بە ئیندپۆینتی باکێندەکەت لەسەر Hugging Face
      // تەنها لەجیاتی ئەم لینکەی خوارەوە، لینکی ڕاستەقینەی باکێندەکەی خۆت دابنێ
      const BACKEND_URL = "https://your-huggingface-spaces-link.hf.space"; 
      
      const response = await fetch(`${BACKEND_URL}/api/art-studio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `مۆدێل و ستایل: ${selectedStyle}، کوالیتی: ${quality}، وەسف: ${prompt}`
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // ئەگەر باکێندەکە وشەی نەشیاوی دۆزییەوە یان کێشەیەک هەبوو، نامەی هەڵەکە لێرەدا نیشان دەدات
        throw new Error(data.detail || "هەڵەیەک لە سیستەمدا ڕوویدا.");
      }

      // وەرگرتنی پڕۆمپت و دەقی داهێنراوی وێنە لە مۆدێلی Gemini 2.5 Pro
      if (data.art_response) {
        // لێرەدا دەتوانیت دەقەکە بخەیتە ناو تەمپڵێت یان ڕاستەوخۆ وەک دەقی داهێنان پیشانی بدەیت
        // تێبینی: چونکە مۆدێلی جمینای دەق دەگەڕێنێتەوە، لێرەدا وەک نموونە دەقەکە لە ناو شاشەی وێنەکە جێگیر دەکەین
        setImage(data.art_response);
      } else {
        throw new Error("هیچ وەڵامێک لە مۆدێلەکەوە نەگەڕایەوە.");
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "پەیوەندی بە باکێندەوە نەکرا. دڵنیابەرەوە لە ڕەنبوونی باکێندەکەت لە Hugging Face.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-20" dir="rtl">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-4">
           <div className="h-[1px] w-12 bg-white/10"></div>
           <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.8em] font-['Noto_Sans_Arabic']">KurdAI CREATIVE ENGINE</span>
           <div className="h-[1px] w-12 bg-white/10"></div>
        </div>
        <h2 className="text-5xl lg:text-7xl font-black text-white font-['Noto_Sans_Arabic'] tracking-tighter">ستۆدیۆی <span className="text-amber-400 italic">داهێنان</span></h2>
        <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px] font-['Noto_Sans_Arabic']">بەرهەمهێنانی تابلۆ و گۆڕینی وێنە بە ژیریی دەستکردی پروو</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-stretch">
        <div className="glass-panel p-10 lg:p-14 rounded-[4rem] space-y-10 bg-[#050507] border border-white/5 shadow-3xl flex flex-col">
          
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] font-['Noto_Sans_Arabic'] px-4">وێنەی بنەڕەتی (ئارەزوومەندانە)</label>
            <div className="flex gap-4 items-center">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleUserImageChange} 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 h-32 rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 ${userImage ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
              >
                <span className="text-3xl">{userImage ? '✅' : '📤'}</span>
                <span className="text-[9px] font-black font-['Noto_Sans_Arabic'] uppercase tracking-widest text-slate-500">
                  {userImage ? 'وێنە بارکرا' : 'بارکردنی وێنەی خۆت'}
                </span>
              </button>
              
              {userImage && (
                <div className="relative w-32 h-32 rounded-[2rem] overflow-hidden border border-white/10 group">
                  <img src={userImage} className="w-full h-full object-cover" alt="User upload" />
                  <button 
                    onClick={removeUserImage}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                  >
                    سڕینەوە
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] font-['Noto_Sans_Arabic'] px-4">وەسفی تابلۆ یان گۆڕانکاری</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={userImage ? "بنووسە دەتەوێت وێنەکەت چۆن بگۆڕێت... (بۆ نموونە: بیکە بە کارەکتەرێکی مێژوویی)" : "باسی ئەو وێنەیە بکە کە دەتەوێت دروستی بکەیت..."}
              className="w-full p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/10 text-xl font-['Noto_Sans_Arabic'] focus:outline-none focus:border-amber-500 h-40 resize-none text-right placeholder:opacity-20 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {styles.map(style => (
              <button 
                key={style.id} 
                onClick={() => setSelectedStyle(style.id)} 
                className={`p-4 rounded-3xl border transition-all ${selectedStyle === style.id ? 'bg-amber-500 text-black border-amber-500' : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'}`}
              >
                <span className="text-2xl block mb-2">{style.icon}</span>
                <span className="text-[9px] font-black font-['Noto_Sans_Arabic']">{style.label}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-4 p-2 bg-white/5 rounded-[1.8rem]">
            {['1K', '2K'].map(q => (
              <button 
                key={q} 
                onClick={() => setQuality(q as any)} 
                className={`flex-1 py-4 rounded-[1.4rem] font-black text-[10px] uppercase transition-all ${quality === q ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}
              >
                {q === '1K' ? 'Standard' : 'Ultra (Pro)'}
              </button>
            ))}
          </div>

          {error && (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold text-center animate-in shake">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || (!prompt.trim() && !userImage)}
            className="w-full py-8 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-black font-black text-xl uppercase tracking-[0.4em] rounded-[2.5rem] shadow-2xl font-['Noto_Sans_Arabic'] disabled:opacity-20 transition-all active:scale-95"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-4">
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                <span>خەریکی داڕشتنی بیرۆکەکەیە لە Gemini Pro...</span>
              </div>
            ) : (userImage ? 'گۆڕینی وێنە' : 'دایبڕێژە بە Gemini Pro')}
          </button>
        </div>

        {/* لای چەپ: پیشاندانی دەق و ئەنجامی داهێنانەکەت */}
        <div className="flex items-center justify-center min-h-[500px]">
          {image ? (
            <div className="w-full bg-[#050505] rounded-[4rem] p-8 border border-white/10 shadow-3xl animate-in zoom-in duration-500 flex flex-col justify-between h-full">
              <div className="space-y-4">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">📜 پڕۆمپتی داهێنراوی ئینگلیزی بۆ وێنە:</span>
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 text-right font-mono text-slate-300 text-sm leading-relaxed whitespace-pre-wrap select-text selection:bg-amber-500 selection:text-black">
                  {image}
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button 
                  onClick={() => { navigator.clipboard.writeText(image); alert("پڕۆمپتەکە کۆپی بوو! دەتوانیت لە Midjourney یان هەر شوێنێکی تر دایبنێیت."); }} 
                  className="flex-1 py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest font-['Noto_Sans_Arabic'] hover:bg-amber-500 transition-all"
                >
                  کۆپیکردنی دەق
                </button>
                <button 
                  onClick={() => setImage(null)} 
                  className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase transition-all"
                >
                  سڕینەوە
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full aspect-square rounded-[4rem] bg-white/[0.01] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-slate-800 p-20 group">
              <div className={`text-[12rem] mb-10 opacity-5 transition-all duration-1000 ${loading ? 'animate-pulse scale-110 opacity-10' : 'group-hover:opacity-10 grayscale group-hover:grayscale-0'}`}>🎨</div>
              <div className="text-center space-y-4">
                <p className="text-[12px] font-black uppercase tracking-[0.6em] opacity-30 text-white font-['Noto_Sans_Arabic'] leading-loose">
                  {loading ? 'Gemini Pro خەریکی شیکارییە...' : 'ئامادەیە بۆ لێکدانەوەی داهێنان'}
                </p>
                {!loading && <p className="text-[9px] font-bold text-slate-700 font-['Noto_Sans_Arabic']">وەسفەکەت بنووسە تا پڕۆمپتی پێشکەوتووت بۆ دابڕێژێت</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtStudio;