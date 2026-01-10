
import React, { useState, useRef } from 'react';
import { analyzeHealthImageStream } from '../services/geminiService';

const HealthAssistant: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const stream = await analyzeHealthImageStream(image, mimeType, question);
      let fullResult = "";
      for await (const chunk of stream) {
        fullResult += chunk.text;
        setResult(fullResult);
      }
    } catch (error) {
      console.error(error);
      setResult("ببورە، هەڵەیەک لە کاتی شیکارکردنی زانیارییە تەندروستییەکان ڕوویدا.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20" dir="rtl">
      {/* Professional Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl lg:text-6xl font-black text-white font-['Noto_Sans_Arabic'] tracking-tighter">ژیریی <span className="text-red-500">تەندروستی</span></h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] font-['Noto_Sans_Arabic']">شیکاریی وردی پشکنین و نیشانە پزیشکییەکان بە ژیریی KurdAI</p>
      </div>

      <div className="glass-panel p-8 lg:p-14 rounded-[4rem] border border-white/5 shadow-3xl space-y-10 relative overflow-hidden bg-[#050507]">
        <div className="absolute top-0 left-0 w-64 h-64 bg-red-500/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Input Section */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] font-['Noto_Sans_Arabic'] px-4">وەسفی نیشانەکان یان پرسیارەکەت</label>
              <textarea 
                value={question} 
                onChange={e => setQuestion(e.target.value)}
                className="w-full h-48 bg-white/[0.02] p-8 rounded-[2.5rem] text-white text-xl border border-white/5 font-['Noto_Sans_Arabic'] focus:border-red-500/30 outline-none transition-all resize-none shadow-inner placeholder:opacity-20"
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
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 py-6 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${
                  image ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 bg-white/[0.02] hover:bg-white/5'
                }`}
              >
                <span className="text-2xl">{image ? '✅' : '📷'}</span>
                <span className="text-[9px] font-black font-['Noto_Sans_Arabic'] uppercase tracking-widest text-slate-500">بارکردنی وێنەی پشکنین یان نیشانە</span>
              </button>

              <button 
                onClick={handleAnalyze} 
                disabled={loading || (!question.trim() && !image)}
                className="flex-[1.5] py-6 bg-red-600 text-white rounded-[2rem] font-black text-lg uppercase tracking-[0.2em] font-['Noto_Sans_Arabic'] shadow-2xl shadow-red-600/20 hover:bg-red-500 disabled:opacity-20 transition-all active:scale-95"
              >
                {loading ? 'خەریکی پشکنینە...' : 'دەستپێکردنی پشکنین'}
              </button>
            </div>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className={`flex-1 rounded-[3rem] border-2 border-dashed border-white/5 bg-white/[0.01] flex items-center justify-center relative overflow-hidden group ${!image && 'opacity-30'}`}>
              {image ? (
                <>
                  <img src={image} className="w-full h-full object-cover" alt="Medical Reference" />
                  <button 
                    onClick={removeImage}
                    className="absolute top-4 left-4 w-10 h-10 bg-black/60 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                  >✕</button>
                </>
              ) : (
                <div className="text-center space-y-4 p-10">
                  <div className="text-6xl opacity-10">🩺</div>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest font-['Noto_Sans_Arabic']">هیچ وێنەیەک دیاری نەکراوە</p>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-yellow-500/5 border border-yellow-500/10 rounded-3xl flex gap-4 items-center">
               <span className="text-2xl">⚠️</span>
               <p className="text-[9px] font-bold text-yellow-600/80 leading-relaxed font-['Noto_Sans_Arabic']">
                 تێبینی: ئەم ئەنجامانە تەنها بۆ زانیاری گشتین و جێگەی ڕاوێژی ڕاستەوخۆی پزیشکی پسپۆڕ ناگرنەوە.
               </p>
            </div>
          </div>
        </div>

        {/* Result Area */}
        {result && (
          <div className="mt-12 p-10 lg:p-16 bg-black/40 rounded-[3.5rem] border border-white/5 animate-in fade-in slide-in-from-top-6 duration-700 shadow-inner relative">
            <div className="absolute top-8 right-8 text-[9px] font-black text-red-500 uppercase tracking-[0.4em] font-['Noto_Sans_Arabic']">ئەنجامی شیکاریی پزیشکی</div>
            <div className="text-slate-200 font-['Noto_Sans_Arabic'] leading-[2.2] text-xl lg:text-2xl text-justify whitespace-pre-wrap pt-6">
              {result}
            </div>
          </div>
        )}
      </div>

      {/* Trust Badges */}
      <div className="flex flex-wrap justify-center gap-10 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs">🔬</div>
            <span className="text-[9px] font-black uppercase tracking-widest text-white">Advanced Lab Analysis</span>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs">🧬</div>
            <span className="text-[9px] font-black uppercase tracking-widest text-white">Genetic Insight Core</span>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs">🛡️</div>
            <span className="text-[9px] font-black uppercase tracking-widest text-white">Secure Medical Privacy</span>
         </div>
      </div>
    </div>
  );
};

export default HealthAssistant;
