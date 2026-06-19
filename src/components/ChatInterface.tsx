import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import Sidebar from './Sidebar';
import { auth, db } from '../firebase';
import { collection, addDoc, doc, setDoc, updateDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth'; // 🚪 هێنانە ناوەوەی فەنکشنی چوونەدەرەوە

const ChatInterface: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null); // 📋 بۆ کۆنتڕۆڵکردنی دۆخی کۆپیکردن
  const [isDarkMode, setIsDarkMode] = useState(true); // 🌙☀️ ستەیت بۆ مۆدی تاریک و ڕووناک
  
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

  // 🧹 🔄 فەنکشنی پاککردنەوەی شاشەی چاتی ئێستا[cite: 3]
  const handleClearCurrentChat = () => {
    if (messages.length <= 1) return; // ئەگەر چاتەکە پێشتر پاک بوو، پێویست بە هیچی تر ناکات[cite: 3]
    if (window.confirm("دڵنیای دەتەوێت شاشەی چاتی ئێستا پاک بکەیتەوە؟")) { //[cite: 3]
      setMessages([defaultMessage]); //[cite: 3]
    }
  };

  // 📋 ⚡ فەنکشنی کۆپیکردنی دەق بۆ ناو میمۆری ئامێرەکە[cite: 3]
  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text); //[cite: 3]
      setCopiedIndex(index); //[cite: 3]
      setTimeout(() => setCopiedIndex(null), 2000); // دوای ٢ چرکە ئایکۆنەکە دەگەڕێتەوە دۆخی ئاسایی[cite: 3]
    } catch (err) {
      console.error("هەڵە لە کاتی کۆپیکردندا:", err); //[cite: 3]
    }
  };

  // 🚪 🏃‍♂️ فەنکشنی چوونەدەرەوە لە ئەژمار (Logout)[cite: 3]
  const handleLogout = async () => {
    if (window.confirm("دڵنیای دەتەوێت لە ئەژمارەکەت بێیتە دەرەوە؟")) { //[cite: 3]
      try {
        await signOut(auth); //[cite: 3]
      } catch (error) {
        console.error("هەڵە لە کاتی چوونەدەرەوە:", error); //[cite: 3]
        alert("کێشەیەک لە چوونەدەرەوەدا ڕوویدا!"); //[cite: 3]
      }
    }
  };

  const handleSelectChat = async (chatId: string) => { //[cite: 3]
    setCurrentChatId(chatId); //[cite: 3]
    setIsSidebarOpen(false); //[cite: 3]
    setMessages([]); //[cite: 3]

    const user = auth.currentUser; //[cite: 3]
    if (!user?.email) return; //[cite: 3]

    try {
      const q = query( //[cite: 3]
        collection(db, 'users', user.email, 'chats', chatId, 'messages'), //[cite: 3]
        orderBy('timestamp', 'asc') //[cite: 3]
      );
      const querySnapshot = await getDocs(q); //[cite: 3]

      if (!querySnapshot.empty) { //[cite: 3]
        const loadedMessages = querySnapshot.docs.map(doc => ({ //[cite: 3]
          role: doc.data().role as 'user' | 'model', //[cite: 3]
          text: doc.data().text, //[cite: 3]
          timestamp: doc.data().timestamp?.toDate() || new Date() //[cite: 3]
        }));
        setMessages(loadedMessages); //[cite: 3]
      } else {
        setMessages([defaultMessage]); //[cite: 3]
      }
    } catch (error) {
      console.error("هەڵە لە هێنانەوەی نامەکان:", error); //[cite: 3]
    }
  };

  const handleSend = async () => { //[cite: 3]
    if (!input.trim() || isLoading) return; //[cite: 3]
    
    const currentInput = input; //[cite: 3]
    const userMsg: Message = { role: 'user', text: currentInput, timestamp: new Date() }; //[cite: 3]
    
    setMessages(prev => [...prev, userMsg]); //[cite: 3]
    setInput(''); //[cite: 3]
    setIsLoading(true); //[cite: 3]

    const user = auth.currentUser; //[cite: 3]
    let activeChatId = currentChatId; //[cite: 3]

    const saveUserMessageToDB = async () => { //[cite: 3]
      if (user?.email) { //[cite: 3]
        try {
          if (!activeChatId) { //[cite: 3]
            const newChatRef = doc(collection(db, 'users', user.email, 'chats')); //[cite: 3]
            activeChatId = newChatRef.id; //[cite: 3]
            setCurrentChatId(activeChatId); //[cite: 3]

            const chatTitle = currentInput.length > 30 ? currentInput.substring(0, 30) + '...' : currentInput; //[cite: 3]
            await setDoc(newChatRef, { title: chatTitle, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }); //[cite: 3]
          } else {
            const chatRef = doc(db, 'users', user.email, 'chats', activeChatId); //[cite: 3]
            await updateDoc(chatRef, { updatedAt: serverTimestamp() }); //[cite: 3]
          }
          await addDoc(collection(db, 'users', user.email, 'chats', activeChatId, 'messages'), { //[cite: 3]
            role: 'user', text: currentInput, timestamp: serverTimestamp() //[cite: 3]
          });
        } catch (e) {
          console.error("کێشە لە خەزنکردنی پرسیارەکەدا", e); //[cite: 3]
        }
      }
    };
    saveUserMessageToDB(); //[cite: 3]

    try {
      const response = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/chat', { //[cite: 3]
        method: 'POST', //[cite: 3]
        headers: { //[cite: 3]
          'Content-Type': 'application/json', //[cite: 3]
        },
        body: JSON.stringify({ message: currentInput }), //[cite: 3]
      });

      if (!response.ok) { //[cite: 3]
        throw new Error(`سێرڤەری مێشک وەڵامی نەدایەوە: ${response.status}`); //[cite: 3]
      }

      const data = await response.json(); //[cite: 3]
      const aiAnswer = data.answer; //[cite: 3]

      setMessages(prev => [...prev, { role: 'model', text: aiAnswer, timestamp: new Date() }]); //[cite: 3]
      console.log("سەرچاوەی وەڵامی مێشکەکە:", data.source); //[cite: 3]

      if (user?.email && activeChatId) { //[cite: 3]
        addDoc(collection(db, 'users', user.email, 'chats', activeChatId, 'messages'), { //[cite: 3]
          role: 'model', text: aiAnswer, timestamp: serverTimestamp() //[cite: 3]
        }).catch(e => console.error("کێشە لە خەزنکردنی وەڵامەکە لە فایەربەیس", e)); //[cite: 3]
      }

    } catch (error: any) { //[cite: 3]
      console.error("هەڵە لە چاتدا:", error); //[cite: 3]
      const actualError = error?.message || error?.toString() || "هەڵەیەکی نەزانراو"; //[cite: 3]
      
      setMessages(prev => [...prev, {  //[cite: 3]
        role: 'model', 
        text: `ببورە، کێشەیەک لە پەیوەندیکردن بە مێشکی سەرەکییەوە هەیە. دڵنیا بەرەوە سێرڤەری مێشک هەمیشەییەکەت چالاکە.\n\n❌ ${actualError}`, 
        timestamp: new Date() 
      }]);
    } finally {
      setIsLoading(false); //[cite: 3]
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
      
      {/* 🌟 گۆڕینی داینامیکی پاشبنەما و بۆردەر بەپێی مۆدەکە */}
      <div className={`flex flex-col h-[82vh] backdrop-blur-2xl rounded-3xl border p-4 md:p-6 shadow-2xl relative z-10 transition-all duration-300 ${
        isDarkMode 
          ? 'bg-slate-900/50 border-slate-800 text-white' 
          : 'bg-white/80 border-slate-200 text-slate-900'
      }`} dir="rtl">
        
        {/* 🔝 بەشی سەرەوەی چاتەکە (Header) */}
        <div className={`flex justify-between items-center mb-4 border-b pb-3 transition-colors ${
          isDarkMode ? 'border-slate-800/80' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            {/* ☀️🌙 دوگمەی نوێی گۆڕینی ڕوونمایی (Toggle Theme) */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-sm border ${
                isDarkMode 
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                  : 'bg-amber-50 border-amber-200 text-amber-500 hover:bg-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              }`}
              title={isDarkMode ? "گۆڕین بۆ مۆدی ڕووناک" : "گۆڕین بۆ مۆدی تاریک"}
            >
              <span className="text-lg leading-none">{isDarkMode ? '☀️' : '🌙'}</span>
            </button>
            <h3 className={`font-bold text-sm tracking-wide ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
              KurdAI Chat
            </h3>
          </div>
          
          {/* 🔘 دوگمەکانی لای ڕاست (چوونەدەرەوە، پاککردنەوە، مێژوو)[cite: 3] */}
          <div className="flex items-center gap-2">
            {/* 🚪 دوگمەی چوونەدەرەوە (Logout)[cite: 3] */}
            <button 
              onClick={handleLogout} //[cite: 3]
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 border shadow-md ${ //[cite: 3]
                isDarkMode 
                  ? 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-400' 
                  : 'bg-red-50 hover:bg-red-100 border-red-200 text-red-500'
              }`}
              title="چوونەدەرەوە لە ئەژمار" //[cite: 3]
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /> {/*[cite: 3] */}
              </svg>
            </button>

            {/* 🧹 دوگمەی نوێی پاککردنەوەی شاشەی چاتی ئێستا (Clear)[cite: 3] */}
            <button 
              onClick={handleClearCurrentChat} //[cite: 3]
              disabled={messages.length <= 1} //[cite: 3]
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 border shadow-md disabled:opacity-30 disabled:cursor-not-allowed ${ //[cite: 3]
                isDarkMode 
                  ? 'bg-slate-800/50 hover:bg-slate-700 border-slate-700 text-slate-300 disabled:hover:bg-slate-800/50' 
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600 disabled:hover:bg-slate-100'
              }`}
              title="پاککردنەوەی شاشەی ئێستا" //[cite: 3]
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /> {/*[cite: 3] */}
              </svg>
            </button>

            {/* 📜 دوگمەی مێژووی چات[cite: 3] */}
            <button 
              onClick={() => setIsSidebarOpen(true)} //[cite: 3]
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 border shadow-md ${ //[cite: 3]
                isDarkMode 
                  ? 'bg-slate-800/50 hover:bg-slate-700 border-slate-700 text-slate-300' 
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600'
              }`}
              title="مێژووی چاتەکان" //[cite: 3]
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /> {/*[cite: 3] */}
              </svg>
            </button>
          </div>
        </div>

        {/* 💬 شوێنی نامەکان[cite: 3] */}
        <div 
          className="flex-1 overflow-y-auto space-y-6 px-2 pb-4 scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full" 
          ref={scrollRef} //[cite: 3]
        >
          {messages.map((msg, idx) => ( //[cite: 3]
            <div 
              key={idx} //[cite: 3]
              className={`flex w-full flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`} //[cite: 3]
            >
              <div 
                className={`max-w-[85%] md:max-w-[75%] p-4 shadow-md relative transition-colors ${ //[cite: 3]
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-3xl rounded-bl-sm' 
                    : isDarkMode 
                      ? 'bg-slate-800 border border-slate-700 text-slate-200 rounded-3xl rounded-br-sm'
                      : 'bg-slate-100 border border-slate-200 text-slate-800 rounded-3xl rounded-br-sm'
                }`}
              >
                <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p> {/*[cite: 3] */}
                
                {/* 📋 دوگمەی کۆپی خێرا لە خوارەوەی دەقەکە[cite: 3] */}
                <div className={`flex justify-end mt-2 pt-1.5 border-t ${
                  msg.role === 'user' ? 'border-white/10' : isDarkMode ? 'border-slate-700/50' : 'border-slate-200/80'
                }`}>
                  <button
                    onClick={() => handleCopy(msg.text, idx)} //[cite: 3]
                    className={`text-[11px] font-medium flex items-center gap-1 transition-colors ${ //[cite: 3]
                      msg.role === 'user' 
                        ? 'text-indigo-200 hover:text-white' 
                        : isDarkMode 
                          ? 'text-slate-400 hover:text-indigo-400'
                          : 'text-slate-500 hover:text-indigo-600'
                    }`}
                    title="کۆپیکردنی دەق" //[cite: 3]
                  >
                    {copiedIndex === idx ? ( //[cite: 3]
                      <>
                        <span>کۆپی کرا!</span> {/*[cite: 3] */}
                        <span className="text-emerald-400 font-bold">✓</span> {/*[cite: 3] */}
                      </>
                    ) : (
                      <>
                        <span>کۆپیکردن</span> {/*[cite: 3] */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /> {/*[cite: 3] */}
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 📥 بۆکسی نامە ناردن و دێڕی ڕێنمایی ئەمنی[cite: 3] */}
        <div className={`pt-4 mt-2 border-t bg-transparent flex flex-col gap-2 transition-colors ${
          isDarkMode ? 'border-slate-800/80' : 'border-slate-200'
        }`}>
          <div className={`flex items-center gap-2 border rounded-full p-1.5 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all shadow-inner ${
            isDarkMode ? 'bg-slate-950/80 border-slate-700' : 'bg-slate-50 border-slate-300'
          }`}>
            <input 
              value={input} //[cite: 3]
              onChange={(e) => setInput(e.target.value)} //[cite: 3]
              onKeyDown={(e) => e.key === 'Enter' && handleSend()} //[cite: 3]
              className={`flex-1 bg-transparent px-4 py-2 focus:outline-none text-sm md:text-base ${
                isDarkMode ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
              }`}
              placeholder="پرسیارەکەت لێرە بنووسە..." //[cite: 3]
              disabled={isLoading} //[cite: 3]
            />
            <button 
              onClick={handleSend} //[cite: 3]
              disabled={!input.trim() || isLoading} //[cite: 3]
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-full transition-all flex items-center justify-center font-medium shadow-md" //[cite: 3]
            >
              {isLoading ? '...' : 'ناردن'} {/*[cite: 3] */}
            </button>
          </div>
          
          {/* 🛡️ دێڕی تێبینی ئەمنی پاراستنی زانیاری بەکارهێنەر[cite: 3] */}
          <p className={`text-[11px] md:text-xs text-center px-4 leading-normal select-none ${
            isDarkMode ? 'text-slate-500' : 'text-slate-400'
          }`}>
            ⚠️ تکایە زانیاریی کەسیی زۆر تایبەت یان پاسوۆرد لێرە مەنووسە. {/*[cite: 3] */}
          </p>
        </div>

      </div>
    </>
  );
};

export default ChatInterface;