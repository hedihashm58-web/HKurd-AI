import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { chatWithKurdAIStream } from '../services/geminiService';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "سڵاوێکی گەرمت لێ بێت!\n\nمن KurdAI م، پێشکەوتووترین و وردترین سیستەمی ژیریی نیشتمانی بۆ هەرێمی کوردستان.کە لە لایەن (هێدی-ڕوانین) پەرەم پێ دراوە، چۆن دەتوانم هاوکاریت بکەم؟", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg: Message = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const result = await chatWithKurdAIStream(input, history);
      
      let fullText = "";
      setMessages(prev => [...prev, { role: 'model', text: "", timestamp: new Date() }]);

      for await (const chunk of result.stream) {
        fullText += chunk.text();
        setMessages(prev => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          updated[lastIndex] = { ...updated[lastIndex], text: fullText };
          return updated;
        });
      }
    } catch (error) {
      console.error("هەڵە لە چاتدا:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[82vh] bg-slate-900/50 backdrop-blur-2xl rounded-3xl border border-slate-800 p-4 md:p-6 shadow-2xl relative z-10" dir="rtl">
      
      {/* ناوچەی نامەکان */}
      {/* تێبینی: بەکارهێنانی کلاسەکانی سکڕۆڵ بۆ شاردنەوەی سکڕۆڵە ناشرینەکەی ویندۆز */}
      <div 
        className="flex-1 overflow-y-auto space-y-6 px-2 pb-4 scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full" 
        ref={scrollRef}
      >
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            // لە RTL دا: justify-end دەیباتە چەپ (بۆ بەکارهێنەر)، justify-start دەیباتە ڕاست (بۆ مۆدێل)
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] md:max-w-[75%] p-4 shadow-md ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-3xl rounded-bl-sm' 
                  : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-3xl rounded-br-sm'
              }`}
            >
              <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ناوچەی نووسین و ناردن (بۆکسێکی یەکگرتوو) */}
      <div className="pt-4 mt-2 border-t border-slate-800/80 bg-transparent">
        <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-700 rounded-full p-1.5 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all shadow-inner">
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-transparent text-white px-4 py-2 focus:outline-none text-sm md:text-base placeholder-slate-500"
            placeholder="پرسیارەکەت لێرە بنووسە..."
            disabled={isLoading}
          />
          <button 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-full transition-all flex items-center justify-center font-medium shadow-md"
          >
            {isLoading ? '...' : 'ناردن'}
          </button>
        </div>
      </div>

    </div>
  );
};

export default ChatInterface;