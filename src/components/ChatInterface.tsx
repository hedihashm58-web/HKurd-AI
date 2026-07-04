/* eslint-disable */
// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import Sidebar from './Sidebar';
import { auth, db } from '../firebase';
import { collection, addDoc, doc, setDoc, getDoc, updateDoc, getDocs, orderBy, serverTimestamp, onSnapshot, query } from 'firebase/firestore';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUBSCRIPTION_PLANS = [
  { id: '1_month', name: '١ مانگ', price: '٥,٠٠٠', desc: '٣ وێنە لە ڕۆژێکدا 🎨' },
  { id: '3_months', name: '٣ مانگ', price: '١٢,٠٠0', desc: '٥ وێنە لە ڕۆژێکدا 🔥' },
  { id: '6_months', name: '٦ مانگ', price: '٢٥,٠٠0', desc: '٧ وێنە لە ڕۆژێکدا 🚀' },
  { id: '1_year', name: '١ ساڵ', price: '٥٠,٠٠٠', desc: '١٠ وێنە لە ڕۆژێکدا 👑' },
];

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('3_months');
  const [paymentMethod, setPaymentMethod] = useState<'fastpay' | 'fib' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handlePaymentSubmit = async () => {
    if (!paymentMethod || phoneNumber.length < 10) return;
    setIsSubmitting(true);
    try {
      alert("⏱️ داواکارییەکەت وەرگیرا، دوای پشکنینی بانک ئەکاونتەکەت پریمیم دەبێت.");
      onClose();
    } catch (error) {
      console.error(error);
      alert("❌ کێشەیەک لە پڕۆسەی پارەداندا ڕوویدا.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-[500] p-4">
      <div className="bg-[#0f172a]/90 border border-zinc-800/80 rounded-[2.5rem] max-w-xl w-full p-6 text-center shadow-2xl backdrop-blur-md animate-in zoom-in-95 duration-200">
        <h3 className="text-xl font-black bg-gradient-to-r from-zinc-100 via-amber-200 to-yellow-400 bg-clip-text text-transparent mb-1">پۆلێنی ئەندامێتی پریمیم</h3>
        <p className="text-zinc-400 text-xs mb-6">بۆ لادانی لێمیتی چات و چالاککردنی خزمەتگوزاری وێنە، پلانێک هەڵبژێره:</p>
        <div className="grid grid-cols-2 gap-2.5 mb-6" dir="rtl">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`p-3.5 rounded-2xl border text-right cursor-pointer transition-all duration-150 ${isSelected ? 'border-amber-500 bg-amber-500/5 text-white shadow-[0_0_15px_rgba(245,158,11,0.05)]' : 'border-zinc-800/50 bg-slate-950/40 text-zinc-300 hover:border-zinc-700'}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-xs font-bold text-zinc-100">{plan.name}</h4>
                  <span className="text-[11px] font-black text-amber-400">{plan.price} د.ع</span>
                </div>
                <p className="text-[10px] text-zinc-400 font-medium">{plan.desc}</p>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button onClick={() => setPaymentMethod('fastpay')} className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${paymentMethod === 'fastpay' ? 'border-red-500/30 bg-red-500/10 text-white' : 'border-zinc-800/60 bg-slate-950/40 text-zinc-400 hover:border-zinc-700'}`}>FastPay</button>
          <button onClick={() => setPaymentMethod('fib')} className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${paymentMethod === 'fib' ? 'border-cyan-500/30 bg-cyan-500/10 text-white' : 'border-zinc-800/60 bg-slate-950/40 text-zinc-400 hover:border-zinc-700'}`}>FIB Bank</button>
        </div>
        {paymentMethod && (
          <div className="mb-6 text-right animate-in fade-in duration-200">
            <input type="tel" placeholder="07700000000" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full bg-slate-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-center focus:outline-none focus:border-amber-500 text-xs font-mono tracking-wider" />
          </div>
        )}
        <div className="space-y-2 max-w-xs mx-auto">
          <button disabled={!paymentMethod || phoneNumber.length < 10 || isSubmitting} onClick={handlePaymentSubmit} className="w-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 disabled:from-zinc-900 disabled:to-zinc-900 text-slate-950 disabled:text-zinc-600 font-black py-2.5 rounded-xl transition-all text-xs shadow-lg">
            {isSubmitting ? 'لە پڕۆسەدایە...' : 'پشڕاستکردنەوە و ناردن'}
          </button>
          <button onClick={onClose} className="w-full bg-slate-950 text-zinc-400 hover:text-zinc-200 font-bold py-2 rounded-xl transition-all text-xs border border-zinc-900">گەڕانەوە</button>
        </div>
      </div>
    </div>
  );
};

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPremium: boolean;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, isPremium }) => {
  if (!isOpen) return null;

  const handleLogout = async () => {
    if (window.confirm("دڵنیای دەتەوێت لە هەژمارەکەت بچیتە دەرەوە؟")) {
      await auth.signOut();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-[600] p-4 select-none animate-in fade-in duration-200" dir="rtl">
      <div className="bg-slate-900/40 border border-zinc-800/60 rounded-[2.5rem] max-w-sm w-full p-6 text-center shadow-[0_0_50px_rgba(245,158,11,0.02)] relative overflow-hidden backdrop-blur-md animate-in zoom-in-95 duration-300 pt-8">
        
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-12 h-12 bg-slate-950 border border-zinc-800 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </div>

        <div className="space-y-4 relative z-10">
          <div className="bg-slate-950/90 border border-zinc-800/80 rounded-2xl py-3 px-4 text-center shadow-lg">
            <p className="font-mono text-zinc-200 text-xs tracking-wide select-all break-all">
              {auth.currentUser?.email || "user@kurdai.pro"}
            </p>
          </div>

          <div className="bg-slate-950/40 border border-zinc-800/40 rounded-2xl py-3.5 px-4 flex justify-between items-center">
            <span className="text-zinc-400 text-xs font-black">دۆخی هەژمار:</span>
            {isPremium ? (
              <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
                پلانی تایبەت
              </span>
            ) : (
              <span className="text-xs font-black text-amber-400 bg-amber-500/5 px-3 py-1.5 rounded-xl border border-amber-500/20">
                پلانی ئاسایی
              </span>
            )}
          </div>

          <button 
            onClick={handleLogout}
            className="w-full bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 font-black py-3 rounded-2xl transition-all text-xs border border-red-500/20 hover:border-red-500/30 active:scale-[0.98]"
          >
            چوونەدەرەوە له هەژمار
          </button>

          <button 
            onClick={onClose}
            className="w-full bg-slate-950 hover:bg-slate-900 text-zinc-400 hover:text-zinc-200 font-extrabold py-3 rounded-2xl transition-all text-xs border border-zinc-800/80 active:scale-[0.98]"
          >
            داخستن
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
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30"><span className="text-2xl text-emerald-400">🎉</span></div>
        <h3 className="text-xl font-bold text-white mb-2">پیرۆزە! تۆ بوویت بە پریمیم</h3>
        <p className="text-zinc-400 text-xs mb-6 leading-relaxed">بەشداریەکەت بە سەرکەوتوویی چالاککرا. سوپاس بۆ پشتگیرییەکەت!</p>
        <button onClick={onClose} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition-all text-sm">دەستپێکردنی ئەزموونی نوێ</button>
      </div>
    </div>
  );
};

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoiceModal: React.FC<VoiceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#121214] border border-zinc-800 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl">
        <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/30 animate-pulse"><span className="text-2xl text-amber-400">🎙️</span></div>
        <div className="mb-2"><h2 className="text-2xl font-black tracking-wider bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent font-mono select-none">KurdAI Voice</h2></div>
        <h3 className="text-lg font-bold text-white mb-2">بەم زوانە چالاک دەکرێت!</h3>
        <button onClick={onClose} className="w-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-zinc-950 font-extrabold py-2.5 rounded-xl transition-all text-sm">چاوەڕوانم</button>
      </div>
    </div>
  );
};

interface VerificationModalProps {
  isOpen: boolean;
  email: string;
  onVerified: () => void;
}

const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, email, onVerified }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSendCode = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setMessage(data.message || "کۆدەکە بە سەرکەوتوویی ناردرا.");
    } catch (e) {
      setMessage("❌ کێشەیەک لە ناردنی کۆدەکەدا هەیە.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length < 6) return;
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      const data = await res.json();
      if (res.ok) {
        alert("🎉 هەژمارەکەت بە سەرکەوتوویی چالاککرا!");
        onVerified();
      } else {
        setMessage(data.detail || "❌ کۆدی داخڵکراو هەڵەیە.");
      }
    } catch (e) {
      setMessage("❌ خەتایەک لە پشکنینی کۆدەکەدا ڕوویدا.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-[500] p-4 select-none" dir="rtl">
      <div className="bg-slate-900/60 border border-amber-500/20 rounded-[2.5rem] max-w-sm w-full p-6 text-center shadow-[0_0_50px_rgba(245,158,11,0.1)] relative overflow-hidden backdrop-blur-md animate-in zoom-in-95 duration-300 pt-8">
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <h2 className="text-xl font-black bg-gradient-to-r from-zinc-100 via-amber-200 to-yellow-400 bg-clip-text text-transparent mb-2 tracking-tight">
          چالاککردنی سیستەم
        </h2>
        
        <p className="text-zinc-400 text-[11px] leading-relaxed mb-6 px-3">
          کۆدی سەلماندنی نیشتمانی دەنێردرێت بۆ ناونیشانی ئیمەیڵی هێژا:
          <span className="block font-mono text-amber-400/90 font-bold mt-1 text-xs select-all bg-amber-500/5 py-1 px-2 rounded-xl border border-amber-500/10 tracking-wide break-all">
            {email}
          </span>
        </p>

        <div className="space-y-4 relative z-10">
          <button 
            onClick={handleSendCode} 
            disabled={loading}
            className="w-full bg-slate-950/80 hover:bg-slate-900 text-zinc-300 hover:text-white font-extrabold py-2.5 rounded-2xl transition-all text-xs border border-zinc-800/80 hover:border-amber-500/30 shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? '🔔 لە پڕۆسەدایە...' : 'ناردنی کۆدی چالاککردن'}</span>
            {!loading && <span className="text-xs">🚀</span>}
          </button>

          <div className="relative">
            <input 
              type="text" 
              maxLength={6}
              placeholder="••••••" 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-slate-950/90 border border-zinc-800/80 rounded-2xl px-4 py-3 text-white text-center font-mono tracking-[0.4em] font-black text-xl focus:outline-none focus:border-amber-500"
            />
          </div>

          <button 
            onClick={handleVerifyCode}
            disabled={loading || code.length < 6}
            className="w-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 disabled:from-zinc-900 disabled:to-zinc-900 text-slate-950 disabled:text-zinc-600 font-black py-3 rounded-2xl transition-all text-xs shadow-lg shadow-amber-500/10 active:scale-[0.97]"
          >
            {loading ? 'پشکنینی داتا...' : 'پشڕاستکردنەوە و چوونەژوورەوە ⚡'}
          </button>

          {message && <p className="text-[11px] font-bold text-zinc-300 mt-2 bg-slate-950/60 py-2 px-3 rounded-xl border border-zinc-800/60">{message}</p>}
        </div>
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
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false); 
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); 
  
  const [isUserPremium, setIsUserPremium] = useState<boolean>(true); 
  const [msgCountInMinute, setMsgCountInMinute] = useState<number>(0);
  const [minuteStartTime, setMinuteStartTime] = useState<number>(Date.now());

  const defaultMessage: Message = { 
    role: 'model', 
    text: "سڵاو! من KurdAI Pro م، پێشکەوتووترین سیستەمی ژیریی دەستکردی نیشتمانی کە لە لایەن (هێدی)ـەوە پەرەم پێدراوە، چۆن دەتوانم هاوکاریت بکەم؟", 
    timestamp: new Date() 
  };

  const [messages, setMessages] = useState<Message[]>([defaultMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user?.email) return;

    handleNewChat();

    const unsubscribe = onSnapshot(doc(db, 'users', user.email), (docSnap) => {
      const isAdmin = user.email?.toLowerCase().trim() === "hedihashm58@gmail.com";
      if (isAdmin) {
        setIsUserPremium(true);
        setIsVerificationModalOpen(false);
        return;
      }
      if (docSnap.exists()) {
        const data = docSnap.data();
        setIsUserPremium(data.isPremium === true);
        if (data.isEmailVerified === false) {
          setIsVerificationModalOpen(true);
        } else {
          setIsVerificationModalOpen(false);
        }
      } else {
        setIsUserPremium(false);
        setIsVerificationModalOpen(true);
      }
    });

    return () => unsubscribe();
  }, [auth.currentUser?.email]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const isMobile = window.innerWidth <= 768;
      messagesEndRef.current.scrollIntoView({ 
        behavior: isMobile ? 'auto' : 'smooth' 
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleNewChat = () => {
    setMessages([defaultMessage]);
    setCurrentChatId(null); 
    setIsSidebarOpen(false);
  };

  const handleClearCurrentChat = () => {
    if (messages.length <= 1) return;
    if (window.confirm("دڵنیای دەتەوێت شاشەی چاتی ئێستا پاک بکەیتەوە؟")) setMessages([defaultMessage]);
  };

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text); 
      setCopiedIndex(index); 
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error(err); 
    }
  };

  const handleSelectChat = async (chatId: string) => { 
    setCurrentChatId(chatId); 
    setIsSidebarOpen(false); 
    setMessages([]); 
    const user = auth.currentUser; 
    if (!user?.email) return; 

    try {
      const q = query(collection(db, 'users', user.email, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'));
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
      console.error(error); 
    }
  };

  const generateCacheKey = (srcText: string) => {
    return srcText.trim().toLowerCase().replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_').substring(0, 50);
  };

  const handleSend = async () => { 
    if (!input.trim() || isLoading) return; 

    const user = auth.currentUser;
    const isAdmin = user?.email?.toLowerCase().trim() === "hedihashm58@gmail.com";

    const currentTime = Date.now();
    if (currentTime - minuteStartTime >= 60000) {
      setMinuteStartTime(currentTime);
      setMsgCountInMinute(1);
    } else {
      if (!isAdmin && msgCountInMinute >= 3) {
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
          await addDoc(collection(db, 'users', user.email, 'chats', activeChatId, 'messages'), { role: 'user', text: currentInput, timestamp: serverTimestamp() });
        } catch (e) {
          console.error(e); 
        }
      }
    };
    
    await saveUserMessageToDB(); 

    const cacheKey = generateCacheKey(currentInput);
    if (db) {
      try {
        const cacheSnap = await getDoc(doc(db, 'global_chat_cache', cacheKey));
        if (cacheSnap && cacheSnap.exists()) {
          const cachedAnswer = cacheSnap.data().aiResponse;
          setIsLoading(false);
          setMessages(prev => [...prev, { role: 'model', text: cachedAnswer, timestamp: new Date() }]);
          if (user?.email && activeChatId) await addDoc(collection(db, 'users', user.email, 'chats', activeChatId, 'messages'), { role: 'model', text: cachedAnswer, timestamp: serverTimestamp() });
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }

    let conversationHistory = `تۆ KurdAI Pro یت. پێشکەوتووترین ژیریی دەستکردی نیشتمانی بۆ هەرێمی کوردستان کە تەنها لە لایەن (هێدی)ـەوە پەرەی پێدراوە و دروستکراوە.
ساڵی ئێستا بە تەواوی بریتییە لە ٢٠٢٦. هەمیشە وەڵامەکانت لەسەر بنەمای ئەوە بن کە ئێستا لە ناو ساڵی ٢٠٢٦ داین.\n\n`;
    
    const lastFewMessages = updatedMessages.slice(-6);
    lastFewMessages.forEach(msg => { conversationHistory += `${msg.role === 'user' ? 'بەکارهێنەر' : 'مۆدێل'}: ${msg.text}\n`; });

    try {
      const response = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/chat', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: conversationHistory.trim(), email: user?.email || "guest_user" }), 
      });
      const data = await response.json();
      if (response.status === 403 && !isAdmin) throw new Error("LIMIT_EXCEEDED_CHAT");
      else if (response.status === 400) throw new Error("داواکارییەکەت ڕەتکرایەوە! دەقەکەت وشەی نەشیاوی تێدایە.");
      if (!response.ok) throw new Error(data.detail || "سێرڤەر وەڵامی نەدایەوە");

      setIsLoading(false);
      let aiAnswer = data.response ? data.response : "هیچ وەڵامێک نەگەڕایەوە.";
      setMessages(prev => [...prev, { role: 'model', text: aiAnswer, timestamp: new Date() }]);

      if (db && aiAnswer.trim()) {
        try {
          await setDoc(doc(db, 'global_chat_cache', cacheKey), { userQuery: currentInput, aiResponse: aiAnswer, createdAt: serverTimestamp() });
        } catch (e) {
          console.error(e);
        }
      }
      if (user?.email && activeChatId) await addDoc(collection(db, 'users', user.email, 'chats', activeChatId, 'messages'), { role: 'model', text: aiAnswer, timestamp: serverTimestamp() });
    } catch (error: any) { 
      setIsLoading(false); 
      let errorMessage = "⚠️ لێمیتی نامەکانی ئەمڕۆت تەواو بووە! بۆ بەردەوامبوون ببە بە ئەندامی Premium.";
      if (error.message.includes("❌") || error.message.includes("ڕەتکرایەوە")) errorMessage = error.message;
      
      setMessages(prev => [...prev, { role: 'model', text: errorMessage, timestamp: new Date() }]);
      if (!error.message.includes("❌")) {
        setIsPremiumModalOpen(true);
      }
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
      
      <div className={`flex flex-col h-full min-h-[75vh] backdrop-blur-md rounded-3xl border p-4 md:p-6 shadow-2xl relative z-10 transition-all ${isDarkMode ? 'bg-slate-900/50 border-slate-800 text-white' : 'bg-white/80 border-slate-200 text-slate-900'}`} dir="rtl">
        <div className={`flex justify-between items-center mb-4 border-b pb-3 ${isDarkMode ? 'border-slate-800/80' : 'border-slate-200'}`}>
          
          {/* 👑 لێرەدا ئایکۆنی پیاوەکە سڕدراوەتەوە و ناونیشانی تایبەت بە پڕۆژەکە هێنراوەتە ئەم شوێنە */}
          <div className="flex items-center gap-2">
            <h3 className="font-black text-sm tracking-wide text-white">KurdAI Chat</h3>
            <span className="text-yellow-500 italic text-[10px] font-black"></span>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isDarkMode ? 'bg-slate-800/50 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>{isDarkMode ? '☀️' : '🌙'}</button>
            <button onClick={handleClearCurrentChat} className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isDarkMode ? 'bg-slate-800/50 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
            <button onClick={() => setIsSidebarOpen(true)} className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isDarkMode ? 'bg-slate-800/50 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
              <svg xmlns="http://www.w3.org/2000/xl" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 px-2 pb-2 scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }}>
          {messages.map((msg, idx) => ( 
            <div key={idx} className={`flex w-full flex-col ${msg.role === 'user' ? 'items-start' : 'items-end'}`}>
              {msg.text && (
                <div className={`max-w-[85%] p-3.5 shadow-md rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : isDarkMode ? 'bg-slate-800 text-slate-200 rounded-tl-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-right">{msg.text}</p>
                  <div className="flex justify-end mt-2 pt-1 border-t border-white/10">
                    <button onClick={() => handleCopy(msg.text, idx)} className="text-[10px] opacity-60 hover:opacity-100">{copiedIndex === idx ? "کۆپی کرا! ✓" : "کۆپی 📋"}</button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex w-full flex-col items-end animate-pulse">
              <div className={`w-[130px] p-4 rounded-2xl rounded-tl-sm flex flex-col gap-2 ${isDarkMode ? 'bg-slate-800/60' : 'bg-slate-100'}`}>
                <div className={`h-2 w-3/4 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
                <div className={`h-2 w-1/2 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className={`pt-3 mt-1 border-t flex flex-col gap-1.5 shrink-0 ${isDarkMode ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <div className={`flex items-end gap-2 border rounded-[2rem] p-1.5 ${isDarkMode ? 'bg-slate-950/80 border-slate-700' : 'bg-slate-50 border-slate-300'}`}>
            <textarea 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={handleKeyDown} 
              rows={1}
              className={`flex-1 bg-transparent px-3 py-1.5 focus:outline-none text-sm resize-none max-h-24 min-h-[36px] leading-relaxed ${isDarkMode ? 'text-white' : 'text-slate-900'}`} 
              placeholder="پرسیارەکەت لێرە بنووسە..." 
              disabled={isLoading} 
            />
            
            <button 
              type="button"
              onClick={() => setIsVoiceModalOpen(true)}
              className={`p-2 rounded-full shadow-md transition-all flex items-center justify-center shrink-0 mb-0.5 active:scale-95 ${isDarkMode ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' : 'bg-slate-200 text-amber-600 hover:bg-slate-300'}`}
            >
              🎙️
            </button>

            <button onClick={handleSend} disabled={!input.trim() || isLoading} className="bg-indigo-600 text-white px-5 py-2 rounded-full shadow-md shrink-0 mb-0.5 text-xs font-bold">{isLoading ? '...' : 'ناردن'}</button>
          </div>
        </div>
      </div>

      <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} />
      <SuccessModal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} />
      <VoiceModal isOpen={isVoiceModalOpen} onClose={() => setIsVoiceModalOpen(false)} />
      
      <VerificationModal 
        isOpen={isVerificationModalOpen} 
        email={auth.currentUser?.email || ""} 
        onVerified={() => setIsVerificationModalOpen(false)} 
      />

      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        isPremium={isUserPremium}
      />
    </>
  );
};

export default ChatInterface;