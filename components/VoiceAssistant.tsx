
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { KURDISH_COLORS } from '../constants';

// Helper to decode base64 to Uint8Array
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to encode Uint8Array to base64
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Audio decoding for raw PCM streams
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

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
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const transcriptScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTo({ top: transcriptScrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [transcripts, currentInput, currentOutput]);

  const startSession = async () => {
    try {
      setTranscripts([]);
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('پەیوەندی ڕاستەوخۆ چالاکە');
            setIsActive(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const data = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(data.length);
              for (let i = 0; i < data.length; i++) int16[i] = data[i] * 32768;
              const pcmBytes = new Uint8Array(int16.buffer);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ 
                  media: { data: encode(pcmBytes), mimeType: 'audio/pcm;rate=16000' } 
                });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            // Process Audio Stream
            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && audioContextRef.current) {
              const buffer = await decodeAudioData(decode(audioData), audioContextRef.current, 24000, 1);
              const source = audioContextRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(audioContextRef.current.destination);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
            }

            // Real-time Professional Transcription
            if (msg.serverContent?.inputTranscription) {
              setCurrentInput(prev => prev + msg.serverContent!.inputTranscription!.text);
            }
            if (msg.serverContent?.outputTranscription) {
              setCurrentOutput(prev => prev + msg.serverContent!.outputTranscription!.text);
            }
            
            if (msg.serverContent?.turnComplete) {
              const newEntries: TranscriptEntry[] = [];
              if (currentInput.trim()) newEntries.push({ role: 'user', text: currentInput, timestamp: new Date() });
              if (currentOutput.trim()) newEntries.push({ role: 'model', text: currentOutput, timestamp: new Date() });

              setTranscripts(prev => [...prev, ...newEntries]);
              setCurrentInput('');
              setCurrentOutput('');
            }

            if (msg.serverContent?.interrupted) {
              for (const source of sourcesRef.current.values()) source.stop();
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            setIsActive(false);
            setStatus('سیستەم وەستێنرا');
          },
          onerror: (e) => {
            console.error('Session error:', e);
            setStatus('هەڵەیەک لە پەیوەندی دروست بوو');
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `
            تۆ KurdAI Proیت، پێشکەوتووترین ژیریی دەستکردی دەنگی بۆ هەرێمی کوردستان.
            ئەرکی تۆ: وەڵامدانەوەی بەکارهێنەرە بە زمانی کوردیی سۆرانیی زۆر باڵا، ئەکادیمی، و فەرمی.
            یاساکان:
            ١. کوردییەکی پەتی بەکاربهێنە؛ لە وشەی بیانی (عەرەبی، فارسی، ئینگلیزی) دووربکەوەرەوە مەگەر زۆر پێویست بێت.
            ٢. وا بدوێ وەک بێژەرێکی فەرمیی هەواڵ یان مامۆستایەکی زمانی کوردی.
            ٣. وەڵامەکانت با ورد و زانستی بن، بەڵام بە شێوازێکی سەرنجڕاکێش.
            ٤. ڕێز و شکۆ لە گفتوگۆکەدا بپارێزە.
            ٥. هەرچی دەڵێیت، دڵنیابەرەوە کە بە نووسینیش بە وردی دەردەکەوێت.
          `,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('هەڵەی مایکرۆفۆن یان کلیلی API');
    }
  };

  const stopSession = () => {
    sessionRef.current?.close();
    setIsActive(false);
    setStatus('ئامادەیە بۆ گفتوگۆ');
    for (const source of sourcesRef.current.values()) source.stop();
    sourcesRef.current.clear();
  };

  return (
    <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 items-stretch min-h-[78vh]" dir="rtl">
      {/* Visual Command Center - Left side */}
      <div className="lg:col-span-5 glass-panel rounded-[4rem] p-12 flex flex-col items-center justify-between relative overflow-hidden bg-gradient-to-b from-white/[0.02] to-transparent border border-white/5 shadow-3xl">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent"></div>
        
        <div className="w-full flex justify-between items-center mb-10">
           <div className="flex gap-1.5">
              <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-slate-700'}`}></div>
              <div className="w-2 h-2 rounded-full bg-slate-700"></div>
           </div>
           <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] font-['Noto_Sans_Arabic']">KurdAI Neural Core V2.5</span>
        </div>

        <div className="relative group flex-1 flex items-center justify-center">
          <div 
            className={`w-72 h-72 lg:w-96 lg:h-96 rounded-full flex items-center justify-center transition-all duration-1000 relative ${
              isActive ? 'scale-105 shadow-[0_0_150px_rgba(234,179,8,0.15)]' : 'shadow-2xl grayscale opacity-40'
            }`}
          >
            {/* Layers of the Neural Orb */}
            <div className={`absolute inset-0 rounded-full blur-[80px] opacity-20 transition-colors duration-1000 ${isActive ? 'bg-yellow-500' : 'bg-slate-800'}`}></div>
            <div className="absolute inset-0 rounded-full border border-white/5 animate-pulse"></div>
            
            <div className="w-full h-full rounded-full border-4 border-white/5 flex items-center justify-center overflow-hidden bg-black/60 backdrop-blur-3xl relative z-10">
               {isActive ? (
                 <div className="flex gap-2 items-center justify-center h-40 w-full px-12">
                    {[...Array(15)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-1.5 bg-yellow-500 rounded-full animate-wave" 
                        style={{ 
                          height: '30%',
                          animation: `wave 0.6s ease-in-out infinite alternate ${i * 0.05}s`,
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
                className="w-full bg-red-600 text-white py-7 rounded-[2.5rem] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-red-700 transition-all animate-pulse font-['Noto_Sans_Arabic'] text-xs"
              >
                کۆتاییهێنان بە پەیوەندی
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Professional Transcript Hub - Right side */}
      <div className="lg:col-span-7 glass-panel rounded-[4rem] flex flex-col overflow-hidden border border-white/5 bg-black/40 shadow-inner">
        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02] backdrop-blur-xl">
           <div className="flex flex-col text-right">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] font-['Noto_Sans_Arabic']">ناوەندی نووسینی هاوکات</span>
              <span className="text-[8px] font-bold text-yellow-500/50 uppercase tracking-widest font-mono">LIVE_ACADEMIC_TRANSCRIPTION</span>
           </div>
           <div className="flex gap-4">
              <button 
                onClick={() => setTranscripts([])}
                className="text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-red-500 transition-colors font-['Noto_Sans_Arabic']"
              >
                سڕینەوەی تۆمار
              </button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar" ref={transcriptScrollRef}>
           {transcripts.length === 0 && !currentInput && !currentOutput && (
             <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-10">
                <div className="text-8xl">📜</div>
                <div className="space-y-2">
                  <p className="text-sm font-black font-['Noto_Sans_Arabic'] uppercase tracking-[0.4em]">تۆماری گفتوگۆکە لێرە دەردەکەوێت</p>
                  <p className="text-[10px] font-bold">بۆ دەستپێکردن، دوگمەی چالاککردن دابگرە</p>
                </div>
             </div>
           )}
           
           {transcripts.map((t, i) => (
             <div key={i} className={`flex flex-col ${t.role === 'user' ? 'items-start' : 'items-end'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                <div className="flex items-center gap-3 mb-3 px-4">
                   <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest font-mono">
                      {t.timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                   </span>
                   <span className={`text-[9px] font-black uppercase tracking-widest font-['Noto_Sans_Arabic'] ${t.role === 'user' ? 'text-slate-500' : 'text-yellow-500'}`}>
                      {t.role === 'user' ? 'بەکاربهێنەر' : 'KurdAI Pro'}
                   </span>
                </div>
                <div className={`relative group max-w-[90%] p-8 rounded-[2.5rem] text-xl font-medium font-['Noto_Sans_Arabic'] leading-relaxed shadow-xl ${
                  t.role === 'user' 
                  ? 'bg-white/[0.03] text-slate-300 border border-white/5 rounded-tr-sm' 
                  : 'bg-yellow-500/[0.03] text-yellow-500 border border-yellow-500/10 rounded-tl-sm'
                }`}>
                  {t.text}
                  {t.role === 'model' && (
                    <button 
                      onClick={() => navigator.clipboard.writeText(t.text)}
                      className="absolute -bottom-4 -left-4 w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all hover:bg-yellow-500 hover:text-black"
                      title="کۆپیکردنی دەق"
                    >
                      📋
                    </button>
                  )}
                </div>
             </div>
           ))}

           {currentInput && (
             <div className="flex flex-col items-start animate-pulse opacity-50">
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2 px-4">بەکاربهێنەر دووێت...</span>
                <div className="max-w-[90%] p-8 rounded-[2.5rem] bg-white/[0.02] text-slate-500 border border-white/5 font-['Noto_Sans_Arabic'] text-xl rounded-tr-sm">
                  {currentInput}
                </div>
             </div>
           )}

           {currentOutput && (
             <div className="flex flex-col items-end animate-pulse">
                <span className="text-[8px] font-black text-yellow-500/50 uppercase tracking-widest mb-2 px-4">KurdAI وەلام دەداتەوە...</span>
                <div className="max-w-[90%] p-8 rounded-[2.5rem] bg-yellow-500/[0.02] text-yellow-600 border border-yellow-500/5 font-['Noto_Sans_Arabic'] text-xl rounded-tl-sm">
                  {currentOutput}
                </div>
             </div>
           )}
        </div>

        <div className="p-10 bg-black/60 border-t border-white/5 text-center space-y-4">
           <div className="flex justify-center gap-1 opacity-20">
              {[...Array(5)].map((_, i) => <div key={i} className="w-1 h-1 rounded-full bg-white"></div>)}
           </div>
           <p className="text-[10px] font-black text-slate-500 font-['Noto_Sans_Arabic'] uppercase tracking-[0.4em] leading-loose">
             ئەم گفتوگۆیە بە زمانی کوردییەکی باڵا و فەرمی ڕێکخراوە <br/> 
             <span className="text-[8px] opacity-50">ENCRYPTED END-TO-END NEURAL TRANSCRIPTION</span>
           </p>
        </div>
      </div>

      <style>{`
        @keyframes wave {
          from { height: 15%; transform: scaleY(0.6); opacity: 0.3; }
          to { height: 90%; transform: scaleY(1.3); opacity: 1; }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(234, 179, 8, 0.2);
        }
      `}</style>
    </div>
  );
};

export default VoiceAssistant;
