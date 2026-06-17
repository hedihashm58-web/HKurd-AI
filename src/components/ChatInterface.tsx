import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { chatWithKurdAIStream } from '../services/geminiService';
import Sidebar from './Sidebar';
import { auth, db } from '../firebase';
// هێنانی getDocs بۆ خوێندنەوەی نامە کۆنەکان
import { collection, addDoc, doc, setDoc, updateDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';

const ChatInterface: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  
  const defaultMessage: Message = { 
    role: 'model', 
    text: "سڵاوێکی گەرمت لێ بێت!\n\nمن KurdAI م، پێشکەوتووترین و وردترین سیستەمی ژیریی نیشتمانی بۆ هەرێمی کوردستان.کە لە لایەن (هێدی-ڕوانین) پەرەم پێ دراوە، چۆن دەتوانم هاوکاریت بکەم؟", 
    timestamp: new Date() 
  };

  const [messages, setMessages] = useState<Message[]>([defaultMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    handleNewChat();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleNewChat = () => {
    setMessages([defaultMessage]);
    setCurrentChatId(null); 
    setIsSidebarOpen(false);
  };

  // فەرمانی نوێ: کاتێک کلیک لە چاتێکی پێشوو دەکەیت لە لیستەکە
  const handleSelectChat = async (chatId: string) => {
    setCurrentChatId(chatId);
    setIsSidebarOpen(false); // داخستنی لیستەکە
    setMessages([]); // خاوێنکردنەوەی کاتی شاشەکە

    const user = auth.currentUser;
    if (!user?.email) return;

    try {
      // چوونە ناو ژوورە تایبەتەکە و هێنانەوەی نامەکان بە ڕیز
      const q = query(
        collection(db, 'users', user.email, 'chats', chatId, 'messages'),
        orderBy('timestamp', 'asc')
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const loadedMessages = querySnapshot.docs.map(doc => ({
          role: doc.data().role as 'user' | 'model',
          text: doc.data().text,
          timestamp: doc.data().timestamp?.toDate() || new Date()
        }));
        setMessages(loadedMessages);
      } else {
        setMessages([defaultMessage]);
      }
    } catch (error) {
      console.error("هەڵە لە هێنانەوەی نامەکان:", error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const currentInput = input;
    const userMsg: Message = { role: 'user', text: currentInput, timestamp: new Date() };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const user = auth.currentUser;
    let activeChatId = currentChatId;

    if (user?.email) {
      try {
        if (!activeChatId) {
          const newChatRef = doc(collection(db, 'users', user.email, 'chats'));
          activeChatId = newChatRef.id;
          setCurrentChatId(activeChatId);

          const chatTitle = currentInput.length > 30 ? currentInput.substring(0, 30) + '...' : currentInput;
          
          await setDoc(newChatRef, {
            title: chatTitle,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } else {
          const chatRef = doc(db, 'users', user.email, 'chats', activeChatId);
          await updateDoc(chatRef, {
            updatedAt: serverTimestamp()
          });
        }

        await addDoc(collection(db, 'users', user.email, 'chats', activeChatId, 'messages'), {
          role: 'user',
          text: currentInput,
          timestamp: serverTimestamp()
        });
      } catch (e) {
        console.error("کێشە لە خەزنکردنی پرسیارەکەدا", e);
      }
    }

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const result = await chatWithKurdAIStream(currentInput, history);
      
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

      if (user?.email && activeChatId) {
        await addDoc(collection(db, 'users', user.email, 'chats', activeChatId, 'messages'), {
          role: 'model',
          text: fullText,
          timestamp: serverTimestamp()
        });
      }

    } catch (error) {
      console.error("هەڵە لە چاتدا:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onNewChat={handleNewChat} 
        onSelectChat={handleSelectChat} // بەستنەوەی فەرمانەکە
      />
      
      <div className="flex flex-col h-[82vh] bg-slate-900/50 backdrop-blur-2xl rounded-3xl border border-slate-800 p-4 md:p-6 shadow-2xl relative z-10" dir="rtl">
        
        <div className="flex justify-between items-center mb-4 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <span className="text-xl leading-none -mt-1">☀️</span>
            </div>
            <h3 className="text-slate-200 font-bold text-sm tracking-wide">KurdAI Chat</h3>
          </div>
          
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 rounded-xl bg-slate-800/50 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all active:scale-95 border border-slate-700 shadow-md"
            title="مێژووی چاتەکان"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div 
          className="flex-1 overflow-y-auto space-y-6 px-2 pb-4 scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full" 
          ref={scrollRef}
        >
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
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
    </>
  );
};

export default ChatInterface;