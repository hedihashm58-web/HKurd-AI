/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

import Layout from './components/Layout';
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

import { View } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.CHAT);
  const [bgImage, setBgImage] = useState<string | undefined>('https://images.unsplash.com/photo-1644342352822-5f606821262d?q=80&w=2000&auto=format&fit=crop');
  
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [language, setLanguage] = useState<'ku' | 'ar'>('ku');
  
  // 🧭 ئەم دوو ستەیتە بۆ پشکنینی دۆخی بەکارهێنەرن لە ڕێگەی فایربەیسەوە
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [showLanding, setShowLanding] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        const emailClean = user.email.toLowerCase().trim();
        setUserEmail(emailClean);

        if (emailClean.endsWith('@restaurant.com')) {
          setActiveView(View.RESTAURANT_DASHBOARD);
        }

        // 🔍 بەستنەوەی لایڤ بە داتابەیستی فایربەیس بۆ پشکنینی کاتی OTP و دۆخی یوزەر
        const userDocRef = doc(db, 'users', emailClean);
        const unsubscribeSnapshot = onSnapshot(userDocRef, async (docSnap) => {
          const isAdmin = emailClean === "hedihashm58@gmail.com";
          
          if (isAdmin) {
            setIsEmailVerified(true);
            setShowLanding(false);
            return;
          }

          if (docSnap.exists()) {
            const data = docSnap.data();
            const verified = data.isEmailVerified === true;
            setIsEmailVerified(verified);

            // 👑 لۆجیکی سەرەکی: ئەگەر یوزەرەکە تازە سەلماندنی کۆدی تەواو کردبێت و لاندینگی نەبینیبێت
            if (verified && data.landingSeen !== true) {
              setShowLanding(true);
            } else {
              setShowLanding(false);
            }
          } else {
            // ئەگەر دۆکیۆمێنتی نەبوو، دروستی دەکەین وەک یوزەرێکی نوێی نەسەلمێنراو
            setIsEmailVerified(false);
            setShowLanding(false);
            await setDoc(userDocRef, {
              email: emailClean,
              isEmailVerified: false,
              isPremium: false,
              landingSeen: false,
              createdAt: new Date().toISOString()
            }, { merge: true });
          }
        });

        return () => unsubscribeSnapshot();
      } else {
        setUserEmail(null);
        setIsEmailVerified(false);
        setShowLanding(false);
        setActiveView(View.CHAT);
      }
      setIsCheckingAuth(false);
    });

    return () => unsubscribeAuth();
  }, []);

  const handleStartChat = async () => {
    // کاتێک لەسەر دوگمەی لاندینگ پەیج کلیک دەکات، لە فایربەیس تۆماری دەکەین کە بینیویەتی تا جاری داهاتوو باز بدات
    if (userEmail) {
      try {
        const userDocRef = doc(db, 'users', userEmail);
        await setDoc(userDocRef, { landingSeen: true }, { merge: true });
      } catch (e) {
        console.error("Error updating landingSeen status:", e);
      }
    }
    setShowLanding(false);
  };

  const isRestaurantAdmin = userEmail?.endsWith('@restaurant.com');

  if (isCheckingAuth) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#020617]" dir="rtl">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 🔒 ستێپی ١: ئەگەر لۆگین نەبوو، دەچێتە لاپەڕەی لۆگین
  if (!userEmail) {
    return <Login onLoginSuccess={(email) => setUserEmail(email)} />;
  }

  // 🔒 ستێپی ٢: ئەگەر لۆگین بووبێت بەڵام هێشتا کۆدی سەلماندنی (OTP) داخل نەکردبێت، دەیبەینە چات بۆ ئەوەی شاشەی پشکنینی کۆدەکەی بۆ بکرێتەوە
  if (!isEmailVerified) {
    return (
      <Layout 
        activeView={View.CHAT} 
        onViewChange={setActiveView} 
        backgroundImage={bgImage}
        language={language}
        setLanguage={setLanguage}
      >
        <ChatInterface />
      </Layout>
    );
  }

  // 👑 ستێپی ٣: ڕێک دوای ئەوەی لە ناو چاتدا کۆدەکەی بە سەرکەوتوویی داخل کرد و `isEmailVerified` بوو بە True، ئینجا لاندینگ پەیجی پێشوازی پیشان دەدرێت!
  if (showLanding) {
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
      
      case 'user_feedback' as View: return <UserFeedback language={language} />;
      
      default: return <ChatInterface />;
    }
  }
};

export default App;