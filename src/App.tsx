/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { getMessaging, getToken } from "firebase/messaging"; // 👈 هاوردەکردنی مێتۆدەکانی نۆتیفیکەیشن

import Layout from './components/Layout';
import HomeDashboard from './components/HomeDashboard'; 
import ChatInterface from './components/ChatInterface';
import LandmarkExplorer from './components/LandmarkExplorer';
import Login from './components/Login';
import LandingPage from './components/LandingPage';

import ArtInterface from './components/ArtStudio';
import VideoInterface from './components/KurdishHousing';
import MathInterface from './components/MathAnalyzer'; 
import TranslateInterface from './components/Translator';
import VoiceInterface from './components/VoiceAssistant'; 
import HealthInterface from './components/HealthAssistant';
import KurdishPersonalities from './components/KurdishPersonalities';
import RestaurantDashboard from './components/RestaurantDashboard'; 
import WebSummarizer from './components/WebSummarizer'; 
import KurdishGrammar from './components/KurdishGrammar'; 
import UserFeedback from './components/UserFeedback'; 

import SocialHook from './components/SocialHook';
import KurdishFlashcard from './components/KurdishFlashcard';
import DocumentSummarizer from './components/DocumentSummarizer';
import KurdishKidsAI from './components/KurdishKidsAI';

import { View } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.HOME);
  const [bgImage, setBgImage] = useState<string | undefined>('https://images.unsplash.com/photo-1644342352822-5f606821262d?q=80&w=2000&auto=format&fit=crop');
  
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [language, setLanguage] = useState<'ku' | 'ar'>('ku');
  
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [hasSeenLanding, setHasSeenLanding] = useState<boolean>(false);

  // 🔔 فەنکشنی تایبەت بە داواکردنی مۆڵەت و خەزنکردنی تۆکنی فایربەیس
  const requestNotificationPermission = async (email: string) => {
    try {
      if (!('Notification' in window)) return;
      
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const messaging = getMessaging();
        // ⚠️ کلیلە گشتییەکەی کۆنسۆڵی فایربەیسەکەت لێرە دابنێ (VAPID Key)
        const currentToken = await getToken(messaging, { vapidKey: 'D6OgH5ATuXByEmEseL3udyEE4yudcey3CpAVEU_06aE' });
        
        if (currentToken) {
          // تۆکنەکە لە داتابەیس دەبەستینەوە بە ئیمەیڵی یوزەرەکەوە
          await updateDoc(doc(db, "users", email), {
            fcmToken: currentToken
          });
        }
      }
    } catch (error) {
      console.error("خەتایەک لە نۆتیفیکەیشندا هەیە:", error);
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        const emailClean = user.email.toLowerCase().trim();
        setUserEmail(emailClean);

        // 🔔 هەر کاتێک بەکارهێنەر بە سەرکەوتوویی لە ئەپەکە بوو، مۆڵەتی لێ وەردەگرین
        requestNotificationPermission(emailClean);

        if (emailClean.endsWith('@restaurant.com')) {
          setActiveView(View.RESTAURANT_DASHBOARD);
        }

        const userDocRef = doc(db, 'users', emailClean);
        const unsubscribeSnapshot = onSnapshot(userDocRef, async (docSnap) => {
          const isAdmin = emailClean === "hedihashm58@gmail.com";
          
          if (isAdmin) {
            setIsEmailVerified(true);
            setHasSeenLanding(true); 
            setIsCheckingAuth(false);
            return;
          }

          if (docSnap.exists()) {
            const data = docSnap.data();
            setIsEmailVerified(data.isEmailVerified === true);
            setHasSeenLanding(data.landingSeen === true);
          } else {
            setIsEmailVerified(false);
            setHasSeenLanding(false);
            await setDoc(userDocRef, {
              email: emailClean,
              isEmailVerified: false,
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
        setIsEmailVerified(false);
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
        const userDocRef = doc(db, 'users', userEmail);
        await setDoc(userDocRef, { landingSeen: true }, { merge: true });
        setHasSeenLanding(true); 
      } catch (e) {
        console.error("Error saving landing status:", e);
      }
    }
  };

  const isRestaurantAdmin = userEmail?.endsWith('@restaurant.com');

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
    if (isRestaurantAdmin && userEmail) {
      return <RestaurantDashboard adminEmail={userEmail} language={language} />;
    }

    switch (activeView) {
      case View.HOME: return <HomeDashboard onViewChange={setActiveView} language={language} />; 
      case View.CHAT: return <ChatInterface />;
      case View.EXPLORE: return <LandmarkExplorer onCityChange={(url: string) => setBgImage(url)} language={language} />;
      case View.ART: return <ArtInterface />;
      case View.VIDEO: return <VideoInterface language={language} />; 
      case View.MATH: return <MathInterface />; 
      case View.TRANSLATE: return <TranslateInterface />;
      case View.VOICE: return <VoiceInterface language={language} />; 
      case View.HEALTH: return <HealthInterface />;
      case View.PERSONALITIES: return <KurdishPersonalities language={language} />;
      case View.RESTAURANT_DASHBOARD: return <RestaurantDashboard adminEmail={userEmail || ''} language={language} />;
      
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