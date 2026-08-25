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
  { id: '3_months', name: '٣ مانگ', price: '١٢,٠٠٠', desc: '٥ وێنە لە ڕۆژێکدا 🔥' },
  { id: '6_months', name: '٦ مانگ', price: '٢٥,٠٠٠', desc: '٧ وێنە لە ڕۆژێکدا 🚀' },
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[500] p-4">
      <div className="bg-[#131722] border border-zinc-800 rounded-[2.5rem] max-w-xl w-full p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200">
        <h3 className="text-xl font-black bg-gradient-to-r from-zinc-100 via-amber-200 to-yellow-400 bg-clip-text text-transparent mb-1">پۆلێنی ئەندامێتی پریمیم</h3>
        <p className="text-zinc-400 text-xs mb-6">بۆ لادانی لێمیتی چات و چالاککردنی خزمەتگوزاری وێنە، پلانێک هەڵبژێره:</p>
        <div className="grid grid-cols-2 gap-2.5 mb-6" dir="rtl">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`p-3.5 rounded-2xl border text-right cursor-pointer transition-all duration-150 ${isSelected ? 'border-amber-500 bg-amber-500/10 text-white shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-zinc-800/80 bg-slate-900/40 text-zinc-300 hover:border-zinc-700'}`}
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
          <button onClick={() => setPaymentMethod('fastpay')} className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${paymentMethod === 'fastpay' ? 'border-red-500/40 bg-red-500/10 text-white' : 'border-zinc-800 bg-slate-900/40 text-zinc-400 hover:border-zinc-700'}`}>FastPay</button>
          <button onClick={() => setPaymentMethod('fib')} className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${paymentMethod === 'fib' ? 'border-cyan-500/40 bg-cyan-500/10 text-white' : 'border-zinc-800 bg-slate-900/40 text-zinc-400 hover:border-zinc-700'}`}>FIB Bank</button>
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

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoiceModal: React.FC<VoiceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#121214] border border-zinc-800 rounded-3xl max-w-md w-full p-6 text-center shadow-2xl">
        <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/30 animate-pulse"><span className="text-2xl text-amber-400">🎙️</span></div>
        <div className="mb-2"><h2 className="text-2xl font-black tracking-wider bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent font-mono select-none">KurdAI Voice</h2></div>
        <h3 className="text-lg font-bold text-white mb-2">بەم زوانە چالاک دەکرێت!</h3>
        <p className="text-zinc-400 text-xs mb-6">دەتوانیت لە ڕێگەی دەنگەوە ڕاستەوخۆ قسە لەگەڵ KurdAI بکەیت.</p>
        <button onClick={onClose} className="w-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-zinc-950 font-extrabold py-2.5 rounded-xl transition-all text-sm">چاوەڕوانم</button>
      </div>
    </div>
  );
};

// 🌟 نووسینەوەی دەقی مۆدێل بە تەواوی ئازاد و کراوە وەک جیمینای (بەبێ چوارچێوەی کارت و بۆکس)
const GeminiResponseContent: React.FC<{ text: string; isLatest?: boolean }> = ({ text, isLatest }) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  useEffect(() => {
    // ئەگەر نامە نوێیەکە بێت و پیتەکانی زۆر نەبن، بە شێوازی تایپکردنی خێرا پیشانی دەدات
    if (isLatest && text && text.length > 5 && text.length < 3000) {
      setIsTyping(true);
      let currentIndex = 0;
      setDisplayText('');
      
      const speed = Math.max(8, Math.min(20, Math.floor(1200 / text.length)));
      const step = text.length > 500 ? 4 : text.length > 200 ? 2 : 1;

      const interval = setInterval(() => {
        currentIndex += step;
        if (currentIndex >= text.length) {
          setDisplayText(text);
          setIsTyping(false);
          clearInterval(interval);
        } else {
          setDisplayText(text.slice(0, currentIndex));
        }
      }, speed);

      return () => clearInterval(interval);
    } else {
      setDisplayText(text);
      setIsTyping(false);
    }
  }, [text, isLatest]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(code);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const contentToRender = isTyping ? displayText : text;
  const parts = contentToRender.split(/(```[\s\S]*?```)/g);

  return (
    <div className="text-zinc-100 text-sm sm:text-base leading-relaxed text-right font-['Noto_Sans_Arabic',sans-serif] space-y-3 select-text">
      {parts.map((part, idx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trim().split('\n');
          const language = lines[0].trim().match(/^[a-zA-Z0-9_-]+$/) ? lines[0].trim() : '';
          const codeContent = language ? lines.slice(1).join('\n') : lines.join('\n');

          return (
            <div key={idx} className="my-4 rounded-2xl overflow-hidden border border-zinc-800 bg-[#0d1117] shadow-xl" dir="ltr">
              <div className="flex justify-between items-center px-4 py-2 bg-[#161b22] border-b border-zinc-800 text-xs text-zinc-400">
                <span className="font-mono text-amber-400 font-bold uppercase">{language || 'Code'}</span>
                <button
                  onClick={() => copyCode(codeContent)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all text-[11px] flex items-center gap-1 border border-zinc-700/60 active:scale-95"
                >
                  {copiedSnippet === codeContent ? '✓ کۆپی کرا' : '📋 کۆپیکردنی کۆد'}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono text-emerald-300 leading-relaxed scrollbar-thin scrollbar-thumb-zinc-800">
                <code>{codeContent}</code>
              </pre>
            </div>
          );
        }

        // دەقی ئاسایی - لێرەدا دەقەکان بە شێوەیەکی کراوە و بێ هیچ چوارچێوەیەک ڕێندەر دەبن
        return (
          <div key={idx} className="whitespace-pre-wrap leading-relaxed space-y-2 font-normal text-zinc-200">
            {part}
            {isTyping && idx === parts.length - 1 && (
              <span className="inline-block w-2 h-4 bg-amber-400 mr-1 animate-pulse align-middle"></span>
            )}
          </div>
        );
      })}
    </div>
  );
};

const ChatInterface: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [likesState, setLikesState] = useState<Record<number, 'like' | 'dislike' | null>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isUserPremium, setIsUserPremium] = useState<boolean>(true); 
  const [msgCountInMinute, setMsgCountInMinute] = useState<number>(0);
  const [minuteStartTime, setMinuteStartTime] = useState<number>(Date.now());

  const defaultMessage: Message = { 
    role: 'model', 
    text: "سڵاو! من KurdAI Pro م، پێشکەوتووترین سیستەمی ژیریی دەستکردی نیشتمانی بۆ زمانی شیرینی کوردی. چۆن دەتوانم لە گفتوگۆ، نووسینی کاری ڕیکلامی و سۆشیاڵ میدیا، زانست، بیرۆکەکانت یان شیکارکردنی وێنە هاوکاریت بکەم؟ ✨", 
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
        return;
      }
      if (docSnap.exists()) {
        const data = docSnap.data();
        setIsUserPremium(data.isPremium === true);
      } else {
        setIsUserPremium(false);
      }
    });
    return () => unsubscribe();
  }, [auth.currentUser?.email]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleNewChat = () => {
    setMessages([defaultMessage]);
    setCurrentChatId(null); 
    setIsSidebarOpen(false);
    setInput('');
    setSelectedImage(null);
  };

  const handleClearCurrentChat = () => {
    if (messages.length <= 1) return;
    if (window.confirm("دڵنیای دەتەوێت گفتوگۆکە پاک بکەیتەوە؟")) {
      setMessages([defaultMessage]);
    }
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

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingAudioRef = useRef<boolean>(false);

  const stopSpeaking = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    isPlayingAudioRef.current = false;
    setSpeakingIndex(null);
  };

  const soraniToPhoneticSpeech = (text: string): string => {
    const charMap: Record<string, string> = {
      'ئا': 'aa', 'ئە': 'a', 'ئۆ': 'o', 'ئێ': 'e', 'ئـ': '', 'ئ': '',
      'ا': 'a', 'آ': 'a', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ط': 't',
      'ج': 'j', 'چ': 'ch', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'z',
      'ر': 'r', 'ڕ': 'rr', 'ز': 'z', 'ژ': 'zh', 'س': 's', 'ص': 's',
      'ث': 's', 'ش': 'sh', 'ض': 'z', 'ظ': 'z', 'ع': 'a',
      'غ': 'gh', 'ف': 'f', 'ڤ': 'v', 'ق': 'q', 'ک': 'k', 'ك': 'k',
      'گ': 'g', 'ل': 'l', 'ڵ': 'll', 'م': 'm', 'ن': 'n',
      'و': 'w', 'ۆ': 'o', 'ه': 'h', 'ھ': 'h', 'ە': 'a',
      'ی': 'y', 'ێ': 'e', 'ى': 'y', 'ي': 'y',
      '؟': '?', '،': ',', '؛': ';'
    };

    let result = '';
    let i = 0;
    while (i < text.length) {
      const twoChars = text.slice(i, i + 2);
      if (twoChars === 'وو') {
        result += 'oo';
        i += 2;
        continue;
      } else if (twoChars === 'ەی') {
        result += 'ay';
        i += 2;
        continue;
      } else if (twoChars === 'یی') {
        result += 'ee';
        i += 2;
        continue;
      }
      const ch = text[i];
      result += charMap[ch] !== undefined ? charMap[ch] : ch;
      i++;
    }
    return result;
  };

  const prepareKurdishForNaturalVoice = (rawText: string): string => {
    return rawText
      .replace(/```[\s\S]*?```/g, '') // لابردنی بلۆکی کۆد
      .replace(/`.*?`/g, '') // لابردنی کۆدی ناو دێڕ
      .replace(/https?:\/\/\S+/g, '') // لابردنی لینکەکان
      .replace(/[#*`_~>\[\]\(\)\{\}\|=+\-\\]/g, ' ') // لابردنی هێماکانی مارکداون
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // لابردنی ئیمۆجی
      .replace(/\s+/g, ' ')
      .trim();
  };

  const handleSpeak = async (rawText: string, index: number) => {
    if (speakingIndex === index) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      isPlayingAudioRef.current = false;
      setSpeakingIndex(null);
      return;
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const cleanText = prepareKurdishForNaturalVoice(rawText);
    if (!cleanText) return;

    setSpeakingIndex(index);
    isPlayingAudioRef.current = true;

    try {
      // 👑 ناردن بۆ بزوێنەری دەنگی دەماریی کوردی (Neural Kurdish TTS Engine)
      const ttsEndpoints = [
        'http://127.0.0.1:8000/api/tts',
        'https://hedihashm-kurdai-chat-brain.hf.space/api/tts'
      ];

      let audioBlob: Blob | null = null;

      for (const endpoint of ttsEndpoints) {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: cleanText.slice(0, 1500) })
          });
          if (res.ok) {
            audioBlob = await res.blob();
            break;
          }
        } catch (e) {
          // ئەگەر یەکەمیان سەرنەکەوت، دەچێتە سەر دووەمیان
        }
      }

      if (audioBlob && isPlayingAudioRef.current) {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioPlayerRef.current = audio;

        audio.onended = () => {
          setSpeakingIndex(null);
          isPlayingAudioRef.current = false;
          audioPlayerRef.current = null;
        };

        audio.onerror = () => {
          setSpeakingIndex(null);
          isPlayingAudioRef.current = false;
          audioPlayerRef.current = null;
        };

        await audio.play();
        return;
      }
    } catch (err) {
      console.error("Neural TTS playback error:", err);
    }

    setSpeakingIndex(null);
    isPlayingAudioRef.current = false;
  };

  const handleLikeToggle = (index: number, type: 'like' | 'dislike') => {
    setLikesState(prev => ({
      ...prev,
      [index]: prev[index] === type ? null : type
    }));
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
          image: doc.data().image || undefined,
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

  const handleSend = async (overridePrompt?: string) => { 
    const promptToSend = (overridePrompt || input).trim();
    if (!promptToSend || isLoading) return; 

    const user = auth.currentUser;
    const isAdmin = user?.email?.toLowerCase().trim() === "hedihashm58@gmail.com";

    const currentTime = Date.now();
    if (currentTime - minuteStartTime >= 60000) {
      setMinuteStartTime(currentTime);
      setMsgCountInMinute(1);
    } else {
      if (!isAdmin && msgCountInMinute >= 4) {
        alert("⚠️ لێمیتی ناردنی خێرا! تۆ ناتوانیت لە ١ خولەکدا زیاتر لە ٤ نامە بنێریت. تکایە کەمێک بوەستە.");
        return;
      }
      setMsgCountInMinute(prev => prev + 1);
    }
    
    const currentInput = promptToSend; 
    const imgToSave = selectedImage;
    const userMsg: Message = { role: 'user', text: currentInput, image: imgToSave || undefined, timestamp: new Date() }; 
    const updatedMessages = [...messages, userMsg];
    
    setMessages(updatedMessages); 
    setInput(''); 
    setSelectedImage(null);
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
          await addDoc(collection(db, 'users', user.email, 'chats', activeChatId, 'messages'), { 
            role: 'user', 
            text: currentInput, 
            image: imgToSave || null,
            timestamp: serverTimestamp() 
          });
        } catch (e) {
          console.error(e); 
        }
      }
    };
    
    await saveUserMessageToDB(); 

    let imageBase64: string | null = null;
    let mimeType = "image/jpeg";
    if (imgToSave) {
      const parts = imgToSave.split(",");
      if (parts.length > 1) {
        imageBase64 = parts[1];
        const mimeMatch = parts[0].match(/data:(.*?);/);
        if (mimeMatch) {
          mimeType = mimeMatch[1];
        }
      }
    }

    if (db && !imgToSave) {
      try {
        const cacheKey = generateCacheKey(currentInput);
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
تۆ سیستەمێکی تەواو زیرەک و لێهاتووی؛ بە شێوەیەکی خۆکارانە لە مەبەست و داواکاریی بەکارهێنەر تێدەگەیت:
- ئەگەر داوای کاری ڕیکلامی، پۆستی فرۆشتن یان سۆشیاڵ میدیای کرد: ڕاستەوخۆ پۆستێکی زۆر سەرنجڕاکێش بە شێوازی مارکێتینگی مۆدێرن، لەگەڵ هۆک (Hook)ی سەرنجڕاکێش، ئیمۆجی و هاستاگی بەهێزی کوردی بۆ دابڕێژە.
- ئەگەر داوای سیناریۆی ڤیدیۆیی ڕیکلامی کرد: سیناریۆ و وەسفی دیمەن بە دیمەن بە شێوازی پرۆفێشناڵ بنووسە.
- ئەگەر پرسیاری بیرکاری، هاوکێشە، زانستی یان کۆدی کرد: بە وردی و هەنگاو بە هەنگاو شیکاری بکە.
- ئەگەر پرسیاری تەندروستی، پزیشکی، دەروونی یان گشتی بوو: بە شێوازێکی زانستی و هۆشیارانە بە زمانی کوردیی پاراو وەڵام بدەرەوە.
- لە هەموو بوارەکانی تردا وەک هاوڕێ و ڕاوێژکارێکی ژیر و نیشتمانی وەڵام بدەرەوە.
ساڵی ئێستا بە تەواوی بریتییە لە ٢٠٢٦. هەمیشە وەڵامەکانت لەسەر بنەمای ئەوە بن کە ئێستا لە ناو ساڵی ٢٠٢٦ داین.\n\n`;
    
    const lastFewMessages = updatedMessages.slice(-6);
    lastFewMessages.forEach(msg => { conversationHistory += `${msg.role === 'user' ? 'بەکارهێنەر' : 'مۆدێل'}: ${msg.text}\n`; });

    try {
      const response = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/chat', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: conversationHistory.trim(), 
          email: user?.email || "guest_user",
          image: imageBase64,
          mimeType: mimeType
        }), 
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
      let errorMessage = error.message || "خەتایەک ڕوویدا. تکایە دووبارە هەوڵ بدەرەوە.";
      
      if (error.message.includes("LIMIT_EXCEEDED_CHAT")) {
        errorMessage = "⚠️ لێمیتی نامەکانی ئەمڕۆت تەواو بووە! بۆ بەردەوامبوون ببە بە ئەندامی Premium.";
        setIsPremiumModalOpen(true);
      }
      
      setMessages(prev => [...prev, { role: 'model', text: errorMessage, timestamp: new Date() }]);
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
      
      {/* 👑 تەواوی پەڕەکە بە شێوەیەکی فراوان و بێ چوارچێوە (Frameless Google Gemini UI) */}
      <div className="min-h-[85vh] flex flex-col justify-between w-full max-w-4xl mx-auto px-2 sm:px-4 text-white relative" dir="rtl">
        
        {/* شریتی سەرەوەی مۆدێل بە ستایلی زۆر سادە و کراوە */}
        <div className="flex justify-between items-center py-2 mb-4 border-b border-white/[0.04]">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="px-3 py-1.5 rounded-full bg-slate-900/60 hover:bg-slate-800 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>☰</span>
              <span>مێژووی چاتەکان</span>
            </button>

            <button
              onClick={handleNewChat}
              className="px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold transition-all flex items-center gap-1"
            >
              <span>+</span>
              <span>چاتی نوێ</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold text-zinc-200">KurdAI 2.5 Flash</span>
            </div>

            <button 
              onClick={handleClearCurrentChat}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-900/80 transition-all text-xs"
              title="سڕینەوەی چات"
            >
              🗑️
            </button>
          </div>
        </div>

        {/* 💬 بەشی سەرەکی نامەکان - کراوە و لەسەر پەڕەی سەرەکی ڕاستەوخۆ دەنووسرێت */}
        <div className="flex-1 space-y-8 pt-4 pb-32">
          {/* پیشاندانی نامەکان بە تەواوی ئازاد وەک جیمینای */}
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const isLatestAi = !isUser && idx === messages.length - 1;

            return (
              <div key={idx} className="space-y-2 animate-in fade-in duration-300">
                {isUser ? (
                  /* 👤 نامەی بەکارهێنەر: تەنها وەک کپسولێکی شیک لە لای ڕاست دادەنیشێت */
                  <div className="flex justify-start">
                    <div className="bg-[#1e2330] border border-zinc-800/80 text-white rounded-[1.75rem] px-5 py-3.5 max-w-[85%] sm:max-w-[75%] shadow-md text-sm sm:text-base leading-relaxed text-right">
                      {msg.image && (
                        <div className="mb-3 max-w-full overflow-hidden rounded-2xl border border-zinc-700/60">
                          <img src={msg.image} alt="Attachment" className="max-h-60 object-cover w-full" />
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                ) : (
                  /* ✨ نامەی مۆدێلی KurdAI Pro: بە تەواوی کراوە و بێ چوارچێوە لەسەر پەڕەکە */
                  <div className="pt-1 pb-4 text-right space-y-3">
                    {/* دەقی وەڵامەکە بە بێ هیچ بۆکسێک و بە نووسینەوەی زیندوو */}
                    <div>
                      <GeminiResponseContent text={msg.text} isLatest={isLatestAi} />
                      
                      {/* شریتی دوگمەکانی کۆپی و فیدباک بە شێوازی کراوە لە خوارەوە */}
                      <div className="flex items-center gap-3 mt-4 pt-2 text-xs text-zinc-400">
                        <button 
                          onClick={() => handleCopy(msg.text, idx)}
                          className="px-2.5 py-1 rounded-lg hover:bg-zinc-800 hover:text-white transition-all flex items-center gap-1 border border-transparent hover:border-zinc-700"
                        >
                          <span>{copiedIndex === idx ? "✓ کۆپی کرا" : "📋 کۆپی"}</span>
                        </button>

                        {/* دوگمەی خوێندنەوە و وەستاندنی دەنگ */}
                        <button 
                          onClick={() => handleSpeak(msg.text, idx)}
                          className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 text-xs ${
                            speakingIndex === idx 
                              ? 'text-red-400 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)] font-black' 
                              : 'text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent hover:border-zinc-700'
                          }`}
                          title={speakingIndex === idx ? "وەستاندنی دەنگ" : "خوێندنەوەی دەقی وەڵام بە کوردی"}
                        >
                          {speakingIndex === idx ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                              <span className="font-bold text-red-300">⏹️ وەستاندن</span>
                            </>
                          ) : (
                            <>
                              <span>🔊</span>
                              <span>خوێندنەوەی دەنگ</span>
                            </>
                          )}
                        </button>

                        <button 
                          onClick={() => handleLikeToggle(idx, 'like')}
                          className={`p-1.5 rounded-lg hover:bg-zinc-800 transition-all ${likesState[idx] === 'like' ? 'text-emerald-400 bg-emerald-500/10' : 'hover:text-white'}`}
                        >
                          👍
                        </button>

                        <button 
                          onClick={() => handleLikeToggle(idx, 'dislike')}
                          className={`p-1.5 rounded-lg hover:bg-zinc-800 transition-all ${likesState[idx] === 'dislike' ? 'text-red-400 bg-red-500/10' : 'hover:text-white'}`}
                        >
                          👎
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* دۆخی بیرکردنەوە / لۆدینگی جیمینای بە نووسینەوەی بریسکەدار */}
          {isLoading && (
            <div className="pt-2 text-right space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-amber-400 p-[1.5px] animate-spin">
                  <div className="w-full h-full bg-[#0d1117] rounded-full flex items-center justify-center text-xs">
                    ✨
                  </div>
                </div>
                <span className="text-xs font-black text-amber-400 animate-pulse">KurdAI بیردەکاتەوە و دەنووسێت...</span>
              </div>
              
              <div className="pr-9 space-y-2 max-w-md">
                <div className="h-3 bg-gradient-to-r from-indigo-500/20 via-purple-500/30 to-amber-500/20 rounded-full animate-pulse"></div>
                <div className="h-3 bg-zinc-800/60 rounded-full w-2/3 animate-pulse"></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 🌟 شریتی سەرئاوکەوتووی خوارەوە (Gemini Floating Pill Input) */}
        <div className="fixed bottom-3 sm:bottom-6 left-0 right-0 z-30 px-3 sm:px-4 pointer-events-none">
          <div className="max-w-3xl mx-auto pointer-events-auto space-y-2">
            
            {/* پێشبینینی وێنەی هەڵبژێردراو */}
            {selectedImage && (
              <div className="relative inline-block rounded-2xl border border-zinc-700 bg-slate-950 p-1.5 shadow-2xl mb-1 animate-in zoom-in-95">
                <img src={selectedImage} alt="Preview" className="w-16 h-16 object-cover rounded-xl" />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-md hover:bg-red-600 active:scale-95"
                >
                  ✕
                </button>
              </div>
            )}

            {/* کپسولی سەرئاوکەوتووی بنەڕەتی جیمینای */}
            <div className="bg-[#181d28]/95 backdrop-blur-2xl border border-zinc-700/60 hover:border-zinc-600 rounded-[2.25rem] p-2 sm:p-2.5 shadow-[0_15px_50px_rgba(0,0,0,0.7)] flex items-end gap-2 transition-all focus-within:border-indigo-500/60 focus-within:shadow-[0_0_30px_rgba(99,102,241,0.2)]">
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
              
              {/* هاوپێچکردنی وێنە */}
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-full bg-slate-900/70 text-zinc-400 hover:text-white hover:bg-slate-800 border border-zinc-800 transition-all active:scale-95 shrink-0 mb-0.5"
                title="هاوپێچکردنی وێنە"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
              </button>

              {/* خانەی دەق */}
              <textarea 
                ref={textareaRef}
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={handleKeyDown} 
                rows={1}
                className="flex-1 bg-transparent px-2 py-2 focus:outline-none text-sm sm:text-base resize-none max-h-36 min-h-[38px] leading-relaxed text-white placeholder:text-zinc-500"
                placeholder="پرسیارێک لێرە بنووسە..." 
                disabled={isLoading} 
              />
              
              {/* دوگمەی ناردن بە دیزاینی مۆدێرن و شیک */}
              <button 
                onClick={() => handleSend()} 
                disabled={isLoading || (!input.trim() && !selectedImage)} 
                className={`p-2.5 rounded-full transition-all flex items-center justify-center shrink-0 mb-0.5 active:scale-95 shadow-md ${
                  input.trim().length > 0 || selectedImage
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.35)] hover:scale-105 cursor-pointer'
                    : 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed border border-zinc-800/40'
                }`}
                title="ناردن"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <svg className="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                )}
              </button>
            </div>

            <p className="text-[10px] text-center text-zinc-500 font-medium tracking-wide">
              KurdAI Pro ڕەنگە هەڵە بکات، تکایە زانیارییە هەستیارەکان پشتڕاست بکەرەوە.
            </p>

          </div>
        </div>

      </div>

      <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} />
      <VoiceModal isOpen={isVoiceModalOpen} onClose={() => setIsVoiceModalOpen(false)} />
    </>
  );
};

export default ChatInterface;