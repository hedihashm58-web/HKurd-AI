/* eslint-disable */
// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { auth } from '../firebase';

const HealthAssistant: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const resultRef = useRef<HTMLDivElement>(null);

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

      // 📷 پاککردنەوەی داتای وێنەکە لە پێشگری Base64 ئەگەر بوونی هەبێت
      let base64Clean = null;
      if (image) {
        base64Clean = image.split(',')[1];
      }

      // 🚀 لۆجیکی ڕاستکراوە: ناردنی دەق + وێنە بۆ سێرڤەری KurdAI
      const response = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/chat', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: healthPrompt,
          email: userEmail,
          image: base64Clean, // داتای وێنەکە بۆ سێرڤەر نێردرا
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
      setResult(error.message || "ببورە، هەڵەیەک لە کاتی شیکارکردنی زانیارییە تەندروستییەکان ڕوویدا.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 md:space-y-12 animate-in fade-in duration-700 pb-20 px-2 sm:px-4" dir="rtl">
      <div className="text-center space-y-4">
        <h2 className="text-4xl lg:text-6xl font-black text-white font-['Noto_Sans_Arabic'] tracking-tighter">ژیریی <span className="text-red-500">تەندروستی</span></h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] font-['Noto_Sans_Arabic']">شیکاریی وردی پشکنین و نیشانە پزیشکییەکان بە ژیریی KurdAI</p>
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
                <span className="text-xl sm:text-2xl">{image ? '✅' : '📷'}</span>
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
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-600 uppercase tracking-widest font-['Noto_Sans_Arabic']">هیچ وێنەیەک دیاری نەکراوە</p>
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
    </div>
  );
};

export default HealthAssistant;