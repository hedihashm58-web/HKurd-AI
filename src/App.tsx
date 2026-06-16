import React, { useState } from 'react';
import Layout from './components/Layout';
import ChatInterface from './components/ChatInterface';
import LandmarkExplorer from './components/LandmarkExplorer';

// هێنانی پێکهاتە (کۆمپۆنێنتە)کانی تر - تکایە دڵنیابە لە ناوەکانیان
import ArtInterface from './components/ArtStudio';
import VideoInterface from './components/VideoStudio';
import MathInterface from './components/MathAnalyzer';
import TranslateInterface from './components/Translator';
import VoiceInterface from './components/VoiceAssistant';
import HealthInterface from './components/HealthAssistant';

import { View } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.CHAT);
  const [bgImage, setBgImage] = useState<string | undefined>('https://images.unsplash.com/photo-1644342352822-5f606821262d?q=80&w=2000&auto=format&fit=crop');

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
      default: return <ChatInterface />;
    }
  };

  return (
    <Layout activeView={activeView} onViewChange={setActiveView} backgroundImage={bgImage}>
      {renderView()}
    </Layout>
  );
};

export default App;