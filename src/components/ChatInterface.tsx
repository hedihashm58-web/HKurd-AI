import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import Sidebar from './Sidebar';
import { auth, db } from '../firebase';
import { collection, addDoc, doc, setDoc, updateDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

const ChatInterface: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const defaultMessage: Message = { 
    role: 'model', 
    text: "سڵاوێکی گەرمت لێ بێت!\n\nمن KurdAI Pro م، پێشکەوتووترین و وردترین سیستەمی ژیریی نیشتمانی بۆ هەرێمی کوردستان کە لە لایەن (هێدی) پەرەم پێ دراوە. چۆن دەتوانم هاوکاریت بکەم؟", 
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

  const handleClearCurrentChat = () => {
    if (messages.length <= 1) return;
    if (window.confirm("دڵنیای دەتەوێت شاشەی چاتی ئێستا پاک بکەیتەوە؟")) { 
      setMessages([defaultMessage]); 
    }
  };

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text); 
      setCopiedIndex(index); 
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("هەڵە لە کاتی کۆپیکردندا:", err); 
    }
  };

  const handleLogout = async () => {
    if (window.confirm("دڵنیای دەتەوێت لە ئەژمارەکەت بێیتە دەرەوە؟")) { 
      try {
        await signOut(auth); 
      } catch (error) {
        console.error("هەڵە لە کاتی چوونەدەرەوە:", error); 
        alert("کێشەیەک لە چوونەدەرەوەدا ڕوویدا!"); 
      }
    }
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
    
    await saveUserMessageToDB(); 

    setMessages(prev => [...prev, { role: 'model', text: '', timestamp: new Date() }]);

    try {
      const response = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/chat', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput }), 
      });

      if (!response.ok) throw new Error(`سێرڤەری مێشک وەڵامی نەدایەوە: ${response.status}`); 

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let aiAnswer = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          aiAnswer += decoder.decode(value, { stream: true });
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].text = aiAnswer;
            return newMessages;
          });
        }
      }

      if (user?.email && activeChatId) { 
        await addDoc(collection(db, 'users', user.email, 'chats', activeChatId, 'messages'), { 
          role: 'model', text: aiAnswer, timestamp: serverTimestamp() 
        }); 
      }
    } catch (error: any) { 
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].text = `❌ کێشەیەک لە پەیوەندیکردن بە مێشکی سەرەکییەوە هەیە: ${error.message}`;
        return newMessages;
      });
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onNewChat={handleNewChat} onSelectChat={handleSelectChat} />
      <div className={`flex flex-col h-[82vh] backdrop-blur-2xl rounded-3xl border p-4 md:p-6 shadow-2xl relative z-10 transition-all ${isDarkMode ? 'bg-slate-900/50 border-slate-800 text-white' : 'bg-white/80 border-slate-200 text-slate-900'}`} dir="rtl">
        <div className={`flex justify-between items-center mb-4 border-b pb-3 ${isDarkMode ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-9 h-9 rounded-xl flex items-center justify-center border ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-amber-50 border-amber-200'}`}>
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <h3 className="font-bold text-sm tracking-wide">KurdAI Chat</h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleLogout} className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isDarkMode ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-500'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
            <button onClick={handleClearCurrentChat} className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isDarkMode ? 'bg-slate-800/50 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
            <button onClick={() => setIsSidebarOpen(true)} className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isDarkMode ? 'bg-slate-800/50 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 px-2 pb-4 scroll-smooth" ref={scrollRef}>
          {messages.map((msg, idx) => ( 
            <div key={idx} className={`flex w-full flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] p-4 shadow-md rounded-3xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-bl-sm' : isDarkMode ? 'bg-slate-800 text-slate-200 rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-br-sm'}`}>
                <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                <div className="flex justify-end mt-2 pt-1.5 border-t border-white/10">
                  <button onClick={() => handleCopy(msg.text, idx)} className="text-[11px] font-medium">{copiedIndex === idx ? "کۆپی کرا! ✓" : "کۆپیکردن 📋"}</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={`pt-4 mt-2 border-t flex flex-col gap-2 ${isDarkMode ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <div className={`flex items-center gap-2 border rounded-full p-1.5 ${isDarkMode ? 'bg-slate-950/80 border-slate-700' : 'bg-slate-50 border-slate-300'}`}>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} className={`flex-1 bg-transparent px-4 py-2 focus:outline-none text-sm md:text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`} placeholder="پرسیارەکەت لێرە بنووسە..." disabled={isLoading} />
            <button onClick={handleSend} disabled={!input.trim() || isLoading} className="bg-indigo-600 text-white px-6 py-2.5 rounded-full shadow-md">{isLoading ? '...' : 'ناردن'}</button>
          </div>
        </div>
      </div>
    </>
  );
};
export default ChatInterface;