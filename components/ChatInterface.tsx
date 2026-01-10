
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { chatWithKurdAIStream } from '../services/geminiService';

const FormattedResponse: React.FC<{ text: string }> = ({ text }) => {
  const processLine = (line: string) => {
    let cleanLine = line.trim();
    
    const isHeader = cleanLine.startsWith('#');
    cleanLine = cleanLine.replace(/#+\s*/g, '');
    cleanLine = cleanLine.replace(/\*\*(.*?)\*\*/g, '$1');
    cleanLine = cleanLine.replace(/\*(.*?)\*/g, '$1');
    
    if (isHeader) {
      return (
        <h3 className="text-xl lg:text-2xl font-black text-white mt-10 mb-6 border-r-4 border-yellow-500 pr-5 font-['Noto_Sans_Arabic'] leading-tight">
          {cleanLine}
        </h3>
      );
    }
    
    if (cleanLine.startsWith('-') || cleanLine.startsWith('*')) {
      return (
        <div className="flex items-start gap-4 mb-4 pr-2">
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2.5 flex-shrink-0 shadow-[0_0_8px_rgba(234,179,8,0.5)]"></div>
          <p className="text-slate-200 text-lg leading-relaxed font-['Noto_Sans_Arabic']">
            {cleanLine.substring(1).trim()}
          </p>
        </div>
      );
    }

    if (!cleanLine) return <div className="h-6"></div>;

    return (
      <p className="text-slate-300 text-lg lg:text-xl leading-[1.9] font-['Noto_Sans_Arabic'] mb-6 text-justify opacity-95">
        {cleanLine}
      </p>
    );
  };

  const lines = text.split('\n');
  return (
    <div className="ai-response-container" dir="rtl">
      {lines.map((line, i) => (
        <React.Fragment key={i}>{processLine(line)}</React.Fragment>
      ))}
    </div>
  );
};

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "سڵاو لە جەنابت، من HT AI Pro م. ئامادەم بۆ هەر جۆرە گفتوگۆیەکی زانستی، کولتووری و ڕاوێژکاری. چۆن دەتوانم هاوکاریت بکەم؟", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState('image/jpeg');
  const [isLoading, setIsLoading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ 
        top: scrollRef.current.scrollHeight, 
        behavior: 'smooth' 
      });
    }
  }, [messages, isLoading]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageMimeType(file.type);
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;
    
    const userMsg: Message = { 
      role: 'user', 
      text: input, 
      image: selectedImage || undefined,
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    const currentImage = selectedImage;
    const currentMime = imageMimeType;
    
    setInput('');
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsLoading(true);

    try {
      // Pass history excluding the current user message just added
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const stream = await chatWithKurdAIStream(currentInput, history, currentImage, currentMime);
      
      let fullText = "";
      const assistantMsg: Message = { role: 'model', text: "", timestamp: new Date() };
      setMessages(prev => [...prev, assistantMsg]);

      for await (const chunk of stream) {
        fullText += chunk.text;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].text = fullText;
          return updated;
        });
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "ببورە، هەڵەیەک لە پەیوەندی دروست بوو. تکایە دووبارە هەوڵ بدەرەوە.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[82vh] bg-[#020617]/60 backdrop-blur-3xl rounded-[3.5rem] border border-white/[0.03] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden relative" dir="rtl">
      {/* Decorative background gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-500/5 blur-[120px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -translate-x-1/2 translate-y-1/2"></div>

      <div className="flex-1 overflow-y-auto px-6 lg:px-16 py-12 space-y-12 custom-scrollbar relative z-10" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end animate-in fade-in slide-in-from-bottom-4 duration-700'}`}>
            <div className={`relative px-8 lg:px-12 py-10 rounded-[3rem] max-w-[92%] lg:max-w-[82%] shadow-2xl transition-all duration-500 ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-white to-slate-100 text-black font-bold border border-white shadow-white/5' 
                : 'bg-white/[0.02] border border-white/[0.08] text-white backdrop-blur-xl'
            }`}>
              {msg.role === 'model' && (
                <div className="absolute -top-4 -right-4 w-10 h-10 bg-yellow-500 rounded-2xl flex items-center justify-center text-sm shadow-[0_8px_16px_rgba(234,179,8,0.3)] border border-yellow-400 rotate-12 group-hover:rotate-0 transition-transform">☀️</div>
              )}
              
              {msg.image && (
                <div className="mb-6 rounded-2xl overflow-hidden border border-black/10">
                  <img src={msg.image} alt="User upload" className="max-w-full h-auto max-h-[400px] object-cover" />
                </div>
              )}
              
              <FormattedResponse text={msg.text} />
              <div className={`text-[10px] mt-6 opacity-40 font-mono font-black uppercase tracking-[0.2em] ${msg.role === 'user' ? 'text-black/60' : 'text-slate-500'}`}>
                {msg.timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-end animate-in fade-in duration-300">
            <div className="bg-white/[0.03] border border-white/[0.08] px-10 py-8 rounded-[2.5rem] flex gap-3 items-center">
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce [animation-duration:0.8s]"></div>
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.1s]"></div>
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 lg:p-12 bg-black/40 border-t border-white/[0.04] relative z-20 backdrop-blur-md">
        <div className="max-w-5xl mx-auto space-y-4">
          
          {/* Image Preview Area */}
          {selectedImage && (
            <div className="flex justify-end px-4">
              <div className="relative group animate-in slide-in-from-bottom-2">
                <img src={selectedImage} className="h-24 w-24 object-cover rounded-2xl border-2 border-yellow-500/50 shadow-2xl" alt="Selected" />
                <button 
                  onClick={removeSelectedImage}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] shadow-lg hover:scale-110 transition-transform"
                >✕</button>
              </div>
            </div>
          )}

          <div className="flex gap-4 items-center">
            {/* Hidden File Input */}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`h-16 lg:h-[76px] w-16 lg:w-[76px] rounded-[2rem] flex items-center justify-center text-2xl transition-all border ${
                selectedImage 
                ? 'bg-yellow-500 text-black border-yellow-400' 
                : 'bg-white/[0.02] border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20'
              }`}
              title="بارکردنی وێنە"
            >
              📷
            </button>

            <div className="flex-1 relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="w-full px-10 py-7 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.08] text-white text-right font-['Noto_Sans_Arabic'] text-xl focus:outline-none focus:border-yellow-500/40 focus:bg-white/[0.05] transition-all placeholder:text-slate-600 shadow-inner"
                placeholder="پرسیارەکەت لێرە بنووسە بۆ KurdAI..."
              />
            </div>
            
            <button 
              onClick={handleSend} 
              disabled={(!input.trim() && !selectedImage) || isLoading}
              className="group relative h-16 lg:h-[76px] px-12 bg-gradient-to-br from-yellow-400 to-yellow-600 text-black rounded-[2.5rem] font-black font-['Noto_Sans_Arabic'] text-sm uppercase tracking-widest hover:from-yellow-300 hover:to-yellow-500 hover:scale-[1.03] active:scale-95 transition-all shadow-[0_20px_40px_-10px_rgba(217,119,6,0.3)] disabled:opacity-10 flex items-center justify-center gap-4 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10">{isLoading ? 'پڕۆسێس...' : 'ناردن'}</span>
              <svg 
                className={`w-6 h-6 relative z-10 transition-transform duration-500 ${isLoading ? 'animate-pulse' : 'group-hover:translate-x-[-4px] group-hover:translate-y-[-4px]'}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(234, 179, 8, 0.15);
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;
