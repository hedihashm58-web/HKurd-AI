
import React, { useState, useEffect } from 'react';
import { generateKurdishVideo } from '../services/geminiService';

const VideoStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [config, setConfig] = useState<{ resolution: '720p' | '1080p', aspectRatio: '16:9' | '9:16' }>({
    resolution: '1080p',
    aspectRatio: '16:9'
  });

  useEffect(() => {
    return () => { if (videoUrl?.startsWith('blob:')) URL.revokeObjectURL(videoUrl); };
  }, [videoUrl]);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setVideoUrl(null);
    setProgress(0);
    setStatus('پشکنینی کلیلی API...');

    try {
      // Mandatory API Key Selection for Veo models
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          setStatus('تکایە کلیلێکی API پارەدار هەڵبژێرە...');
          await window.aistudio.openSelectKey();
        }
      }

      setStatus('ڤیدیۆکە لە دروستکردندایە...');
      const url = await generateKurdishVideo(prompt, config, (s, p) => {
        setStatus(s);
        setProgress(p);
      });
      setVideoUrl(url);
    } catch (error: any) {
      console.error("Video Generation Error:", error);
      
      const errorMessage = typeof error === 'string' ? error : (error.message || JSON.stringify(error));
      
      // Handle "Requested entity was not found" (404) or "Permission Denied" (403)
      if (errorMessage.includes("403") || errorMessage.includes("PERMISSION_DENIED") || errorMessage.includes("permission")) {
        setStatus("هەڵەی دەسەڵات: ئەم کلیلە مۆڵەتی بەکارهێنانی مۆدێلی Pro ی نییە. دڵنیابەرەوە کە پڕۆژەکەت Billing ی بۆ چالاک کراوە.");
        if (window.aistudio) await window.aistudio.openSelectKey();
      } else if (errorMessage.includes("Requested entity was not found") || errorMessage.includes("404") || errorMessage.includes("NOT_FOUND")) {
        setStatus("هەڵە: ئەم مۆدێلە لەم پڕۆژەیەدا بەردەست نییە. تکایە کلیلێکی تر هەڵبژێرە.");
        if (window.aistudio) await window.aistudio.openSelectKey();
      } else {
        setStatus("ببورە، هەڵەیەک ڕوویدا. دڵنیابەرەوە لە هەڵبژاردنی کلیلی دروست و هەبوونی باڵانس لە پڕۆژەکەتدا.");
      }
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20" dir="rtl">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-4">
           <div className="h-[1px] w-16 bg-white/10"></div>
           <span className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.8em] font-['Noto_Sans_Arabic']">VEO 3.1 PRO ENGINE</span>
           <div className="h-[1px] w-16 bg-white/10"></div>
        </div>
        <h2 className="text-5xl lg:text-7xl font-black text-white font-['Noto_Sans_Arabic'] tracking-tighter">ستۆدیۆی <span className="text-yellow-500 italic">ڤیدیۆی سینەمایی</span></h2>
        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] font-['Noto_Sans_Arabic']">بەرهەمهێنانی ڤیدیۆی واقیعی 4K بە ژیریی دەستکرد</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-8">
          <div className="glass-panel p-10 lg:p-14 rounded-[4rem] border border-white/5 space-y-10 relative overflow-hidden bg-[#050507] shadow-3xl">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] font-['Noto_Sans_Arabic'] px-4">وەسفی دیمەن</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="باسی ڤیدیۆکە بکە... (بۆ نموونە: دیمەنێکی ئاسمانی لە قەڵای هەولێر)"
                className="w-full p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/10 text-xl font-medium focus:outline-none focus:border-yellow-500 h-56 resize-none transition-all text-right font-['Noto_Sans_Arabic']"
              />
            </div>

            <div className="space-y-8">
               <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setConfig({...config, resolution: '1080p'})} className={`py-4 rounded-2xl font-black text-[10px] transition-all ${config.resolution === '1080p' ? 'bg-white text-black' : 'bg-white/5 text-slate-500'}`}>1080p Ultra</button>
                  <button onClick={() => setConfig({...config, resolution: '720p'})} className={`py-4 rounded-2xl font-black text-[10px] transition-all ${config.resolution === '720p' ? 'bg-white text-black' : 'bg-white/5 text-slate-500'}`}>720p Fast</button>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setConfig({...config, aspectRatio: '16:9'})} className={`py-4 rounded-2xl font-black text-[10px] transition-all ${config.aspectRatio === '16:9' ? 'bg-yellow-500 text-black' : 'bg-white/5 text-slate-500'}`}>16:9 (Landscape)</button>
                  <button onClick={() => setConfig({...config, aspectRatio: '9:16'})} className={`py-4 rounded-2xl font-black text-[10px] transition-all ${config.aspectRatio === '9:16' ? 'bg-yellow-500 text-black' : 'bg-white/5 text-slate-500'}`}>9:16 (Portrait)</button>
               </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full py-8 bg-yellow-500 text-black font-black text-xl uppercase tracking-[0.4em] rounded-[2.5rem] hover:bg-yellow-400 transition-all shadow-2xl font-['Noto_Sans_Arabic'] disabled:opacity-20 active:scale-95"
            >
              {loading ? 'خەریکی ڕێندەرکردنە...' : 'دەستپێکردنی ڕێندەری ڤیدیۆ'}
            </button>

            {loading && (
              <div className="space-y-4 animate-in slide-in-from-top-4">
                <div className="flex justify-between items-end">
                   <p className="text-[11px] font-black text-yellow-500 font-['Noto_Sans_Arabic']">{status}</p>
                   <span className="text-xl font-black text-white font-mono">{progress}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-yellow-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            )}

            <div className="p-6 bg-yellow-500/5 border border-yellow-500/10 rounded-3xl text-center">
              <p className="text-[10px] font-bold text-slate-500 font-['Noto_Sans_Arabic'] leading-relaxed">
                بۆ کارکردنی ڤیدیۆ و خزمەتگوزاری Pro، پێویستە کلیلی API پارەدارت هەبێت. <br/>
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-yellow-500 underline">لینکی چالاککردنی پارەدان (Billing)</a>
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 flex items-center justify-center">
          {videoUrl ? (
            <div className="w-full bg-black rounded-[4rem] overflow-hidden border border-white/10 shadow-3xl animate-in zoom-in">
              <video src={videoUrl} controls autoPlay loop className="w-full object-cover" />
            </div>
          ) : (
            <div className="w-full aspect-video rounded-[4rem] bg-white/[0.01] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-slate-800">
              <div className={`text-[10rem] opacity-5 transition-all ${loading ? 'animate-pulse' : ''}`}>🎬</div>
              <p className="text-[12px] font-black uppercase tracking-[0.6em] opacity-30 text-white font-['Noto_Sans_Arabic']">
                {loading ? 'خەریکی دروستکردنی ڤیدیۆکەیە...' : 'ئامادەیە بۆ ڕێندەر'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoStudio;
