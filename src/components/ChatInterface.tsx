import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { chatWithKurdAIStream } from '../services/geminiService';
import Sidebar from './Sidebar';
import { auth, db } from '../firebase';
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

  const handleSelectChat = async (chatId: string) => {
    setCurrentChatId(chatId);
    setIsSidebarOpen(false);
    setMessages([]); 

    const user = auth.currentUser;
    if (!user?.email) return;

    try {
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

    // ١. خەزنکردنی پرسیارەکە لە باکگراوند (بۆ ئەوەی پڕۆژەکە خێرا بێت)
    const saveUserMessageToDB = async () => {
      if (user?.email) {
        try {
          if (!activeChatId) {
            const newChatRef = doc(collection(db, 'users', user.email, 'chats'));
            activeChatId = newChatRef.id;
            setCurrentChatId(activeChatId);

            const chatTitle = currentInput.length > 30 ? currentInput.substring(0, 30) + '...' : currentInput;
            await setDoc(newChatRef, { title: chatTitle, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
          } else {
            const chatRef = doc(db, 'users', user.email, 'chats', activeChatId);
            await updateDoc(chatRef, { updatedAt: serverTimestamp() });
          }
          await addDoc(collection(db, 'users', user.email, 'chats', activeChatId, 'messages'), {
            role: 'user', text: currentInput, timestamp: serverTimestamp()
          });
        } catch (e) {
          console.error("کێشە لە خەزنکردنی پرسیارەکەدا", e);
        }
      }
    };
    saveUserMessageToDB();

    // ٢. ناردنی مێژووەکە بە شێوازێکی ئۆپتیمایز کراو
    try {
      const rawHistory = messages.filter((m, idx) => !(idx === 0 && m.role === 'model')); 
      let formattedHistory: {role: string, text: string}[] = [];
      
      let lastRole: string | null = null;
      for (const msg of rawHistory) {
        if (msg.role !== lastRole && msg.text.trim() !== "") {
          const truncatedText = msg.text.length > 600 ? msg.text.substring(0, 600) + '... (کورتکرایەوە)' : msg.text;
          formattedHistory.push({ role: msg.role, text: truncatedText });
          lastRole = msg.role;
        }
      }

      if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === 'user') {
        formattedHistory.pop();
      }

      formattedHistory = formattedHistory.slice(-4);
      if (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
        formattedHistory.shift(); 
      }

      const result = await chatWithKurdAIStream(currentInput, formattedHistory);
      
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

      // ٣. خەزنکردنی وەڵامەکە لە باکگراوند
      if (user?.email && activeChatId) {
        addDoc(collection(db, 'users', user.email, 'chats', activeChatId, 'messages'), {
          role: 'model', text: fullText, timestamp: serverTimestamp()
        }).catch(e => console.error("کێشە لە خەزنکردنی وەڵامەکە", e));
      }

    } catch (error: any) {
      console.error("هەڵە لە چاتدا:", error);
      
      // لێرەدا کۆدە نوێیەکە هەڵە ڕاستەقینەکەمان لەسەر شاشە پێ دەڵێت
      const actualError = error?.message || error?.toString() || "هەڵەیەکی نەزانراو";
      
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: `ببورە، کێشەیەک لە پەیوەندیکردن بە سێرڤەرەوە هەیە. تکایە ئەم کێشەیە بنوسە بۆ پشتگیری:\n\n❌ ${actualError}`, 
        timestamp: new Date() 
      }]);
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
        onSelectChat={handleSelectChat}
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