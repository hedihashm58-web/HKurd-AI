
import React, { useState } from 'react';
import Layout from './components/Layout';
import ChatInterface from './components/ChatInterface';
import ArtStudio from './components/ArtStudio';
import VideoStudio from './components/VideoStudio';
import MathAnalyzer from './components/MathAnalyzer';
import Translator from './components/Translator';
import VoiceAssistant from './components/VoiceAssistant';
import HealthAssistant from './components/HealthAssistant';
import LandmarkExplorer from './components/LandmarkExplorer';
import { View } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.CHAT);
  const [bgImage, setBgImage] = useState<string | undefined>('https://images.unsplash.com/photo-1644342352822-5f606821262d?q=80&w=2000&auto=format&fit=crop');

  const renderView = () => {
    switch (activeView) {
      case View.CHAT:
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-2 font-['Noto_Sans_Arabic']">لەگەڵ KurdAI گفتوگۆ بکە</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs font-['Noto_Sans_Arabic']">هاوکاری زیرەکت بۆ زانیارییە کولتووری و گشتییەکان</p>
            </div>
            <ChatInterface />
          </div>
        );
      case View.EXPLORE:
        return <LandmarkExplorer onCityChange={(url) => setBgImage(url)} />;
      case View.MATH:
        return <MathAnalyzer />;
      case View.TRANSLATE:
        return <Translator />;
      case View.ART:
        return <ArtStudio />;
      case View.VIDEO:
        return <VideoStudio />;
      case View.VOICE:
        return <VoiceAssistant />;
      case View.HEALTH:
        return <HealthAssistant />;
      default:
        return <ChatInterface />;
    }
  };

  const handleViewChange = (view: View) => {
    setActiveView(view);
  };

  return (
    <Layout activeView={activeView} onViewChange={handleViewChange} backgroundImage={bgImage}>
      {renderView()}
    </Layout>
  );
};

export default App;
