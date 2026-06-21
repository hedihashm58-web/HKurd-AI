import React, { useState, useEffect, useRef } from 'react';
import { KURDISH_COLORS } from '../constants';

interface TranscriptEntry {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

const VoiceAssistant: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('ئامادەیە بۆ گفتوگۆی دەنگی');
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentOutput, setCurrentOutput] = useState('');
  
  const sessionRef = useRef<any>(null);
  const transcriptScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTo({ top: transcriptScrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [transcripts, currentInput, currentOutput]);

  const startSession = async () => {
    try {
      setTranscripts([]);
      setStatus('پەیوەندی دەنگی چالاک کرا...');
      setIsActive(true);
    } catch (err) {
      console.error(err);
      setStatus('هەڵەی مایکرۆفۆن یان هێڵی ئینتەرنێت');
    }
  };

  const stopSession = () => {
    setIsActive(false);
    setStatus('ئامادەیە بۆ گفتوگۆ');
    setCurrentInput('');
    setCurrentOutput('');
  };

  return (
    <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 items-stretch min-h-[78vh]" dir="rtl">
      <div className="lg:col-span-5 glass-panel rounded-[4rem] p-12 flex flex-col items-center justify-between relative overflow-hidden bg-gradient-to-b from-white/[0.02] to-transparent border border-white/5 shadow-3xl bg-[#050507]">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent"></div>
        
        <div className="w-full flex justify-between items-center mb-10">
           <div className="flex gap-1.5">
              <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-slate-700'}`}></div>
              <div className="w-2 h-2 rounded-full bg-slate-700"></div>
           </div>
           <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] font-['Noto_Sans_Arabic']">KurdAI Neural Core V2.5</span>
        </div>

        <div className="relative group flex-1 flex items-center justify-center">
          <div className={`w-72 h-72 lg:w-96 lg:h-96 rounded-full flex items-center justify-center transition-all duration-1000 relative ${isActive ? 'scale-105 shadow-[0_0_150px_rgba(234,179,8,0.15)]' : 'shadow-2xl grayscale opacity-40'}`}>
            <div className={`absolute inset-0 rounded-full blur-[80px] opacity-20 transition-colors duration-1000 ${isActive ? 'bg-yellow-500' : 'bg-slate-800'}`}></div>
            <div className="absolute inset-0 rounded-full border border-white/5 animate-pulse"></div>
            
            <div className="w-full h-full rounded-full border-4 border-white/5 flex items-center justify-center overflow-hidden bg-black/60 backdrop-blur-3xl relative z-10">
               {isActive ? (
                 <div className="flex gap-2 items-center justify-center h-40 w-full px-12">
                    {[...Array(15)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-1.5 bg-yellow-500 rounded-full" 
                        style={{ 
                          height: '60%',
                          backgroundColor: i % 3 === 0 ? KURDISH_COLORS.red : (i % 3 === 1 ? KURDISH_COLORS.yellow : KURDISH_COLORS.green)
                        }}
                      ></div>
                    ))}
                 </div>
               ) : (
                 <div className="flex flex-col items-center gap-6">
                    <div className="text-8xl opacity-10">🎙️</div>
                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest font-['Noto_Sans_Arabic']">بۆ دەستپێکردن کلیک بکە</div>
                 </div>
               )}
            </div>
          </div>
        </div>

        <div className="text-center space-y-10 w-full z-20 mt-12">
          <div className="space-y-4">
             <h2 className="text-5xl lg:text-6xl font-black text-white font-['Noto_Sans_Arabic'] tracking-tighter">KurdAI <span className="text-yellow-500">دەنگی</span></h2>
             <p className={`text-sm font-black uppercase tracking-[0.3em] transition-colors font-['Noto_Sans_Arabic'] ${isActive ? 'text-yellow-500' : 'text-slate-500'}`}>
                {status}
             </p>
          </div>
          
          <div className="flex flex-col gap-5 w-full max-w-sm mx-auto">
            {!isActive ? (
              <button 
                onClick={startSession}
                className="w-full bg-white text-black py-7 rounded-[2.5rem] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-yellow-500 transition-all active:scale-95 font-['Noto_Sans_Arabic'] text-xs flex items-center justify-center gap-4 group"
              >
                <span>دەستپێکردنی گفتوگۆ</span>
                <span className="text-xl group-hover:rotate-12 transition-transform">⚡</span>
              </button>
            ) : (
              <button 
                onClick={stopSession}
                className="w-full bg-red-600 text-white py-7 rounded-[2.5rem] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-red-700 transition-all font-['Noto_Sans_Arabic'] text-xs"
              >
                کۆتاییهێنان بە پەیوەندی
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-7 glass-panel rounded-[4rem] flex flex-col overflow-hidden border border-white/5 bg-black/40 shadow-inner">
        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02] backdrop-blur-xl">
           <div className="flex flex-col text-right">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] font-['Noto_Sans_Arabic']">ناوەندی نووسینی هاوکات</span>
              <span className="text-[8px] font-bold text-yellow-500/50 uppercase tracking-widest font-mono">LIVE_AUDIO_TRANSCRIPTION</span>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar" ref={transcriptScrollRef}>
           {transcripts.length === 0 && (
             <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-10">
                <div className="text-8xl">📜</div>
                <div className="space-y-2">
                  <p className="text-sm font-black font-['Noto_Sans_Arabic'] uppercase tracking-[0.4em]">تۆماری گفتوگۆکە لێرە دەردەکەوێت</p>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;