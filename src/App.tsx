import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

import Layout from './components/Layout';
import ChatInterface from './components/ChatInterface';
import LandmarkExplorer from './components/LandmarkExplorer';
import Login from './components/Login';

import ArtInterface from './components/ArtStudio';
import VideoInterface from './components/VideoStudio';
import MathInterface from './components/MathAnalyzer';
import TranslateInterface from './components/Translator';
import VoiceInterface from './components/VoiceAssistant';
import HealthInterface from './components/HealthAssistant';
import KurdishPersonalities from './components/KurdishPersonalities'; // زیادکراوە

import { View } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.CHAT);
  const [bgImage, setBgImage] = useState<string | undefined>('https://images.unsplash.com/photo-1644342352822-5f606821262d?q=80&w=2000&auto=format&fit=crop');
  
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        setUserEmail(null);
      }
      setIsCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const renderView = () => {
    switch (activeView) {
      case View.CHAT: return <ChatInterface />;
      case View.EXPLORE: return <LandmarkExplorer onCityChange={(url: string) => setBgImage(url)} />;
      case View.ART: return <ArtInterface />;
      case View.VIDEO: return <VideoInterface />;
      case View.MATH: return <MathInterface />;
      case View.TRANSLATE: return <TranslateInterface />;
      case View.VOICE: return <VoiceInterface />;
      case View.HEALTH: return <HealthInterface />;
      case View.PERSONALITIES: return <KurdishPersonalities />; // زیادکراوە
      default: return <ChatInterface />;
    }
  };

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

  return (
    <Layout activeView={activeView} onViewChange={setActiveView} backgroundImage={bgImage}>
      {renderView()}
    </Layout>
  );
};

export default App;