import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import Sidebar from './Sidebar';
import { auth, db } from '../firebase';
import { collection, addDoc, doc, setDoc, updateDoc, getDocs, getDoc, query, orderBy, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'fastpay' | 'fib' | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#121214] border border-zinc-800 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl">
        
        {/* 👑 لۆگۆی شاهانەی گۆڵد */}
        <div className="mb-4 pt-2">
          <h2 className="text-3xl font-black tracking-wider bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent font-mono select-none drop-shadow-[0_2px_10px_rgba(245,158,11,0.15)]">
            KurdAI Pro
          </h2>
        </div>

        <h3 className="text-lg font-bold text-white mb-2">لیمیتی خۆڕایی تەواو بوو!</h3>
        <p className="text-zinc-400 text-xs mb-6">
          بۆ ئەوەی بە بێ سنوور چات بکەیت و هەموو بەشە پێشکەوتووەکانی KurdAI Pro بەکاربهێنیت، ببە بە ئەندامی پریمیم.
        </p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setPaymentMethod('fastpay')}
            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              paymentMethod === 'fastpay' ? 'border-red-500 bg-red-500/10 text-white' : 'border-zinc-800 bg-zinc-900/50 text-zinc-400'
            }`}
          >
            <span className="text-xs font-bold">FastPay</span>
          </button>
          <button
            onClick={() => setPaymentMethod('fib')}
            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              paymentMethod === 'fib' ? 'border-cyan-500 bg-cyan-500/10 text-white' : 'border-zinc-800 bg-zinc-900/50 text-zinc-400'
            }`}
          >
            <span className="text-xs font-bold">FIB</span>
          </button>
        </div>
        {paymentMethod && (
          <div className="space-y-2 mb-6 text-right">
            <label className="text-xs text-zinc-400 block">
              {paymentMethod === 'fastpay' ? 'ژمارەی ئەکاونتی فاستپەی' : 'ژمارەی ئەکاونتی FIB'}
            </label>
            <input
              type="tel"
              placeholder="07700000000"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-center focus:outline-none focus:border-amber-500"
            />
          </div>
        )}
        
        {/* 👑 بەشی دوگمە دڵڕفێن و نوێیەکان */}
        <div className="space-y-3 mt-2">
          <button
            disabled={!paymentMethod || phoneNumber.length < 10}
            className="w-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 disabled:from-zinc-800 disabled:to-zinc-800 text-zinc-950 disabled:text-zinc-500 font-extrabold py-3 rounded-xl transition-all duration-300 text-sm shadow-[0_4px_20px_rgba(245,158,11,0.15)] disabled:shadow-none active:scale-[0.98]"
          >
            پشڕاستکردنەوە و پارەدان
          </button>
          
          <button 
            onClick={onClose} 
            className="w-full bg-zinc-900/30 hover:bg-zinc-900/80 border border-zinc-800/60 hover:border-zinc-700/80 text-zinc-400 hover:text-zinc-200 font-medium py-2.5 rounded-xl transition-all duration-200 text-xs active:scale-[0.98]"
          >
            دەوەستم تا ٢٤ کاتژمێری تر 
          </button>
        </div>
      </div>
    </div>
  );
};

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#121214] border border-emerald-500/30 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
          <span className="text-2xl text-emerald-400">🎉</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">پیرۆزە! تۆ بوویت بە پریمیم</h3>
        <p className="text-zinc-400 text-xs mb-6 leading-relaxed">
          بەشداریەکەت بە سەرکەوتوویی چالاککرا. بۆ ماوەی <span className="text-emerald-400 font-bold">یەک مانگ</span> دەتوانیت بە بێسنووری و بەرزترین خێرا KurdAI Pro بەکاربهێنیت. سوپاس بۆ پشتگیرییەکەت!
        </p>
        <button onClick={onClose} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition-all text-sm">
          دەستپێکردنی ئەزمוونی نوێ
        </button>
      </div>
    </div>
  );
};

const ChatInterface: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  
  const [msgCountInMinute, setMsgCountInMinute] = useState<number>(0);
  const [minuteStartTime, setMinuteStartTime] = useState<number>(Date.now());

  const defaultMessage: Message = { 
    role: 'model', 
    text: "سڵاو! من KurdAI Pro م، پێشکەوتووترین سیستەمی ژیریی دەستکرد کە لە لایەن (هێدی)ـەوە پەرەی پێدراوە، چۆن دەتوانم هاوکاریت بکەم؟", 
    timestamp: new Date() 
  };

  const [messages, setMessages] = useState<Message[]>([defaultMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user?.email) return;

    const unsubscribe = onSnapshot(doc(db, 'users', user.email), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.isPremium === true) {
          setIsPremiumModalOpen((wasOpen) => {
            if (wasOpen) {
              setIsSuccessModalOpen(true);
            }
            return false;
          });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    handleNewChat();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

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

  const generateCacheKey = (srcText: string) => {
    return srcText.trim().toLowerCase().replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_').substring(0, 50);
  };

  const handleSend = async () => { 
    if (!input.trim() || isLoading) return; 

    if (messages.length >= 11) { 
      setIsPremiumModalOpen(true);
      return;
    }

    const currentTime = Date.now();
    
    if (currentTime - minuteStartTime >= 60000) {
      setMinuteStartTime(currentTime);
      setMsgCountInMinute(1);
    } else {
      if (msgCountInMinute >= 3) {
        alert("⚠️ لێمیتی ناردنی خێرا! تۆ ناتوانیت لە ١ خولەکدا زیاتر لە ٣ نامە بنێریت. تکایە کەمێک بوەستە.");
        return;
      }
      setMsgCountInMinute(prev => prev + 1);
    }
    
    const currentInput = input.trim(); 
    const userMsg: Message = { role: 'user', text: currentInput, timestamp: new Date() }; 
    
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages); 
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

    const cacheKey = generateCacheKey(currentInput);
    if (db) {
      try {
        const cacheSnap = await getDoc(doc(db, 'global_chat_cache', cacheKey));
        if (cacheSnap.exists()) {
          const cachedAnswer = cacheSnap.data().aiResponse;
          setIsLoading(false);
          setMessages(prev => [...prev, { role: 'model', text: cachedAnswer, timestamp: new Date() }]);
          
          if (user?.email && activeChatId) { 
            await addDoc(collection(db, 'users', user.email, 'chats', activeChatId, 'messages'), { 
              role: 'model', text: cachedAnswer, timestamp: serverTimestamp() 
            }); 
          }
          return;
        }
      } catch (e) {
        console.error("کێشە لە خوێندنەوەی کاش:", e);
      }
    }

    let conversationHistory = `تۆ KurdAI Pro یت. پێشکەوتووترین ژیریی دەستکردی نیشتمانی بۆ هەرێمی کوردستان کە تەنها لە لایەن (هێدی)ـەوە پەرەی پێدراوە و دروستکراوە.
ساڵی ئێستا بە تەواوی بریتییە لە ٢٠٢٦. هەمیشە وەڵامەکانت لەسەر بنەمای ئەوە بن کە ئێستا لە ناو ساڵی ٢٠٢٦ داین.
مۆندیالی تۆپی پێی پیاوان (FIFA World Cup 2026) ڕێک لەم ساڵەدا (٢٠٢٦) لە وڵاتانی ئەمریکا, کەنەدا و مەکسیک بەڕێوە دەچێت و دەستی پێکردووە. هەرگیز نەڵێیت لە داهاتوودا دەستپێدەکات یان لە ساڵی ٢٠٣٦ـە.
ئەگەر پرسیارت لێکرا کێ تۆی دروست کردووە, بە شانازییەوە بڵێ من لەلایەن (هێدی)ـەوە دروستکراوم. وەڵامەکانت هەمیشە زۆر پوخت, کورت و ڕاستەوخۆ بن بەبێ نوسینی زۆر.\n\n`;
    
    const lastFewMessages = updatedMessages.slice(-6);
    
    lastFewMessages.forEach(msg => {
      if (msg.role === 'user') {
        conversationHistory += `بەکارهێنەر: ${msg.text}\n`;
      } else {
        conversationHistory += `مۆدێل: ${msg.text}\n`;
      }
    });

    try {
      const response = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/chat', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: conversationHistory.trim(),
          email: user?.email || "guest_user"
        }), 
      });

      const data = await response.json();

      if (response.status === 403) {
        throw new Error("LIMIT_EXCEEDED_CHAT");
      } else if (response.status === 400) {
        throw new Error("داواکارییەکەت ڕەتکرایەوە! دەقەکەت وشەی نەشیاوی تێدایە.");
      }

      if (!response.ok) {
        throw new Error(data.detail || `سێرڤەری مێشک وەڵامی نەدایەوە: ${response.status}`);
      }

      setIsLoading(false);

      let aiAnswer = data.response ? data.response : "هیچ وەڵامێک لە مۆدێلەکەوە نەگەڕایەوە.";
      setMessages(prev => [...prev, { role: 'model', text: aiAnswer, timestamp: new Date() }]);

      if (db && aiAnswer.trim()) {
        try {
          await setDoc(doc(db, 'global_chat_cache', cacheKey), {
            userQuery: currentInput,
            aiResponse: aiAnswer,
            createdAt: serverTimestamp()
          });
        } catch (e) {
          console.error("کێشە لە خەزنکردنی کاش:", e);
        }
      }

      if (user?.email && activeChatId) { 
        await addDoc(collection(db, 'users', user.email, 'chats', activeChatId, 'messages'), { 
          role: 'model', text: aiAnswer, timestamp: serverTimestamp() 
        }); 
      }
    } catch (error: any) { 
      setIsLoading(false); 
      
      let errorMessage = "⚠️ لێمیتی نامەکانی ئەمڕۆت تەواو بووە! بۆ بەردەوامبوون ببە بە ئەندامی Premium.";
      
      if (error.message === "داواکارییەکەت ڕەتکرایەوە! دەقەکەت وشەی نەشیاوی تێدایە.") {
        errorMessage = `❌ ${error.message}`;
      }

      setMessages(prev => [...prev, {
        role: 'model',
        text: errorMessage,
        timestamp: new Date()
      }]);
      
      setIsPremiumModalOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
              <svg xmlns="http://www.w3.org/2000/xl" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
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
            <div key={idx} className={`flex w-full flex-col ${msg.role === 'user' ? 'items-start' : 'items-end'}`}>
              {msg.text && (
                <div className={`max-w-[85%] p-4 shadow-md rounded-3xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : isDarkMode ? 'bg-slate-800 text-slate-200 rounded-tl-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}>
                  <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap text-right">{msg.text}</p>
                  <div className="flex justify-end mt-2 pt-1.5 border-t border-white/10">
                    <button onClick={() => handleCopy(msg.text, idx)} className="text-[11px] font-medium">{copiedIndex === idx ? "کۆپی کرا! ✓" : "کۆپیکردن 📋"}</button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex w-full flex-col items-end animate-pulse">
              <div className={`w-[150px] p-4 rounded-3xl rounded-tl-sm flex flex-col gap-2 ${isDarkMode ? 'bg-slate-800/60' : 'bg-slate-100'}`}>
                <div className={`h-2.5 w-3/4 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
                <div className={`h-2.5 w-1/2 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
              </div>
            </div>
          )}
        </div>

        <div className={`pt-4 mt-2 border-t flex flex-col gap-2 ${isDarkMode ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <div className={`flex items-end gap-2 border rounded-[2rem] p-2 ${isDarkMode ? 'bg-slate-950/80 border-slate-700' : 'bg-slate-50 border-slate-300'}`}>
            <textarea 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={handleKeyDown} 
              rows={1}
              className={`flex-1 bg-transparent px-4 py-2 focus:outline-none text-sm md:text-base resize-none max-h-32 min-h-[40px] leading-relaxed ${isDarkMode ? 'text-white' : 'text-slate-900'}`} 
              placeholder="پرسیارەکەت لێرە بنووسە..." 
              disabled={isLoading} 
            />
            <button onClick={handleSend} disabled={!input.trim() || isLoading} className="bg-indigo-600 text-white px-6 py-2.5 rounded-full shadow-md shrink-0 mb-0.5">{isLoading ? '...' : 'ناردن'}</button>
          </div>
          <p className="text-[11px] text-center text-slate-500 font-medium mt-1">
            ⚠️ تکایە هیچ جۆرە زانیارییەکی کەسیی متمانەپێکراو یان پاسۆردی هەژمارەکانت لێرەدا مەنووسە.
          </p>
        </div>
      </div>

      <PremiumModal 
        isOpen={isPremiumModalOpen} 
        onClose={() => setIsPremiumModalOpen(false)} 
      />

      <SuccessModal 
        isOpen={isSuccessModalOpen} 
        onClose={() => setIsSuccessModalOpen(false)} 
      />
    </>
  );
};
export default ChatInterface;