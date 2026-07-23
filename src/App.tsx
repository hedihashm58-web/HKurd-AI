/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, onSnapshot, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { getMessaging, getToken } from "firebase/messaging"; 

import Layout from './components/Layout';
import HomeDashboard from './components/HomeDashboard'; 
import ChatInterface from './components/ChatInterface';
import LandmarkExplorer from './components/LandmarkExplorer';
import Login from './components/Login';
import LandingPage from './components/LandingPage';

import ArtInterface from './components/ArtStudio';
import MathInterface from './components/MathAnalyzer'; 
import TranslateInterface from './components/Translator';
import HealthInterface from './components/HealthAssistant';
import KurdishPersonalities from './components/KurdishPersonalities';
import WebSummarizer from './components/WebSummarizer'; 
import KurdishGrammar from './components/KurdishGrammar'; 
import UserFeedback from './components/UserFeedback'; 

import SocialHook from './components/SocialHook';
import KurdishFlashcard from './components/KurdishFlashcard';
import DocumentSummarizer from './components/DocumentSummarizer';
import KurdishKidsAI from './components/KurdishKidsAI';

import { View } from './types';

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
      setMessage(data.message || "کۆدەکە ناردرا. تکایە سەیری نامەکانت بکە.");
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
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[500] p-4 select-none" dir="rtl">
      <div className="bg-slate-900/80 border border-amber-500/20 rounded-[2.5rem] max-w-sm w-full p-6 text-center shadow-[0_0_40px_rgba(245,158,11,0.08)] relative overflow-hidden backdrop-blur-md animate-in zoom-in-95 duration-200 pt-8">
        
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

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
            className="w-full bg-slate-950/80 hover:bg-slate-900 text-zinc-300 hover:text-white font-extrabold py-2.5 rounded-2xl transition-all text-xs border border-zinc-800/80 hover:border-amber-500/30 shadow-md active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
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
              className="w-full bg-slate-950/90 border border-zinc-800/80 rounded-2xl px-4 py-3 text-white text-center font-mono tracking-[0.4em] font-black text-xl focus:outline-none focus:border-amber-500 focus:shadow-[0_0_15px_rgba(245,158,11,0.15)] placeholder:text-zinc-700 transition-all"
            />
          </div>

          <button 
            onClick={handleVerifyCode}
            disabled={loading || code.length < 6}
            className="w-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 disabled:from-zinc-900 disabled:to-zinc-900 text-slate-950 disabled:text-zinc-600 font-black py-3 rounded-2xl transition-all text-xs shadow-lg shadow-amber-500/10 active:scale-[0.97]"
          >
            {loading ? 'پشکنینی داتا...' : 'پشڕاستکردنەوە و چوونەژوورەوە ⚡'}
          </button>

          {message && (
            <div className="text-[11px] font-bold text-zinc-300 mt-2 bg-slate-950/60 py-2 px-3 rounded-xl border border-zinc-800/60 animate-in fade-in duration-200">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.HOME);
  // 👑 لایتی سەرەکی و قەبارەی وێنەکە ئۆپتیمایز کرا بۆ مۆبایل تاوەکو کێشی زۆر کەم بێتەوە
  const [bgImage, setBgImage] = useState<string | undefined>('https://images.unsplash.com/photo-1644342352822-5f606821262d?q=70&w=800&auto=format&fit=crop');
  
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [language, setLanguage] = useState<'ku' | 'ar'>('ku');
  
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(true);
  const [hasSeenLanding, setHasSeenLanding] = useState<boolean>(false);

  const requestNotificationPermission = async (email: string) => {
    try {
      if (!('Notification' in window)) return;
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const messaging = getMessaging();
        const currentToken = await getToken(messaging, { vapidKey: 'D6OgH5ATuXByEmEseL3udyEE4yudcey3CpAVEU_06aE' });
        if (currentToken) {
          await setDoc(doc(db, "users", email), { fcmToken: currentToken }, { merge: true });
        }
      }
    } catch (error) {
      console.error("خەتایەک لە نۆتیفیکەیشندا هەیە:", error);
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        let emailClean = user.email.toLowerCase().trim();
        
        if (emailClean.startsWith("code_") && emailClean.endsWith("@kurdai.pro")) {
          const code = emailClean.replace("code_", "").replace("@kurdai.pro", "");
          try {
            const codeDoc = await getDoc(doc(db, "login_codes", code));
            if (codeDoc.exists()) {
              emailClean = codeDoc.data().email.toLowerCase().trim();
            }
          } catch (e) {
            console.error("Error fetching email from code:", e);
          }
        }
        
        setUserEmail(emailClean);

        requestNotificationPermission(emailClean);



        const userDocRef = doc(db, 'users', emailClean);
        const unsubscribeSnapshot = onSnapshot(userDocRef, async (docSnap) => {


          if (docSnap.exists()) {
            const data = docSnap.data();
            setIsEmailVerified(true);
            setHasSeenLanding(data.landingSeen === true);
          } else {
            setIsEmailVerified(true);
            setHasSeenLanding(false);
            await setDoc(userDocRef, {
              email: emailClean,
              isEmailVerified: true,
              isPremium: false,
              landingSeen: false,
              createdAt: new Date().toISOString()
            }, { merge: true });
          }
          setIsCheckingAuth(false);
        }, (error) => {
          console.error("Firestore error:", error);
          setIsCheckingAuth(false);
        });
        return () => unsubscribeSnapshot();
      } else {
        setUserEmail(null);
        setIsEmailVerified(true);
        setHasSeenLanding(false);
        setActiveView(View.HOME); 
        setIsCheckingAuth(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const handleStartChat = async () => {
    if (userEmail) {
      try {
        const cleanEmail = userEmail.toLowerCase().trim();
        const userDocRef = doc(db, 'users', cleanEmail);
        await setDoc(userDocRef, { landingSeen: true }, { merge: true });
        
        let code = localStorage.getItem('loginCode_' + cleanEmail);
        if (!code) {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            code = docSnap.data().loginCode;
          }
        }

        if (code && !localStorage.getItem('hasSeenCode_' + cleanEmail)) {
          alert(`پیرۆزە! هەژمارەکەت بە سەرکەوتوویی تۆمارکرا.\nکۆدی چوونەژوورەوەی تایبەتی تۆ: ${code}\n\nتکایە ئەم کۆدە کۆپی بکە و بیپارێزە! لەکاتی گەڕانەوە یان سڕینەوەی داتای بەرنامەکەدا، دەتوانیت تەنها بەم کۆدە بێیتە ژوورەوە.`);
          localStorage.setItem('hasSeenCode_' + cleanEmail, 'true');
        }
        
        setHasSeenLanding(true); 
      } catch (e) {
        console.error("Error saving landing status:", e);
      }
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#030303]" dir="rtl">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!userEmail) {
    return <Login onLoginSuccess={(email) => setUserEmail(email)} />;
  }

  if (!isEmailVerified) {
    return (
      <VerificationModal 
        isOpen={true} 
        email={userEmail} 
        onVerified={() => setIsEmailVerified(true)} 
      />
    );
  }

  if (!hasSeenLanding) {
    return <LandingPage onStartChat={handleStartChat} />;
  }

  return (
    <Layout 
      activeView={activeView} 
      onViewChange={setActiveView} 
      backgroundImage={bgImage}
      language={language}
      setLanguage={setLanguage}
    >
      {renderView()}
    </Layout>
  );

  function renderView() {
    switch (activeView) {
      case View.HOME: return <HomeDashboard onViewChange={setActiveView} language={language} />; 
      case View.CHAT: return <ChatInterface />;
      case View.EXPLORE: return <LandmarkExplorer onCityChange={(url: string) => setBgImage(url)} language={language} />;
      case View.ART: return <ArtInterface />;
      case View.MATH: return <MathInterface />; 
      case View.TRANSLATE: return <TranslateInterface />;
      case View.HEALTH: return <HealthInterface />;
      case View.PERSONALITIES: return <KurdishPersonalities language={language} />;
      
      case 'web_summarizer' as View: return <WebSummarizer language={language} />;
      case 'kurdish_grammar' as View: return <KurdishGrammar language={language} />;
      
      case 'social_hook' as View: return <SocialHook language={language} />;
      case 'kurdish_flashcard' as View: return <KurdishFlashcard language={language} />;
      case 'document_summarizer' as View: return <DocumentSummarizer language={language} />;
      case 'kids_ai' as View: return <KurdishKidsAI language={language} />;
      
      case 'user_feedback' as View: return <UserFeedback language={language} />;
      
      default: return <HomeDashboard onViewChange={setActiveView} language={language} />;
    }
  }
};

export default App;