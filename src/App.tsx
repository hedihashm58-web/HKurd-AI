import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

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

import { View } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.CHAT);
  const [bgImage, setBgImage] = useState<string | undefined>('https://images.unsplash.com/photo-1644342352822-5f606821262d?q=80&w=2000&auto=format&fit=crop');
  
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  const [language, setLanguage] = useState<'ku' | 'ar'>('ku');
  
  const [hasStarted, setHasStarted] = useState<boolean>(() => {
    return localStorage.getItem('kurdai_landing_started') === 'true';
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        const emailClean = user.email.toLowerCase().trim();
        setUserEmail(emailClean);
        
        // ئەگەر خاوەن ڕێستۆرانت بوو، ڕاستەوخۆ دەچێتە داشبۆردەکە
        if (emailClean.endsWith('@restaurant.com')) {
          setActiveView(View.RESTAURANT_DASHBOARD);
        }
      } else {
        setUserEmail(null);
        setActiveView(View.CHAT);
      }
      setIsCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStartChat = () => {
    localStorage.setItem('kurdai_landing_started', 'true');
    setHasStarted(true);
  };

  const isRestaurantAdmin = userEmail?.endsWith('@restaurant.com');

  if (isCheckingAuth) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#020617]" dir="rtl">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!userEmail) {
    return <Login onLoginSuccess={(email) => setUserEmail(email)} />;
  }

  if (!hasStarted) {
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
      default: return <ChatInterface />;
    }
  }
};

export default App;