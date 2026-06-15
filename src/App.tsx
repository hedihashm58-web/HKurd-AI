import React, { useState } from 'react';
import Layout from './components/Layout';
import ChatInterface from './components/ChatInterface';
import LandmarkExplorer from './components/LandmarkExplorer';
import { View } from './types';

// پێناسەی تایپ بۆ ئەو کۆمپۆنێنتەی onCityChange وەردەگرێت
interface LandmarkExplorerProps {
  onCityChange: (url: string) => void;
}

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.CHAT);
  const [bgImage, setBgImage] = useState<string | undefined>('https://images.unsplash.com/photo-1644342352822-5f606821262d?q=80&w=2000&auto=format&fit=crop');

  const renderView = () => {
    switch (activeView) {
      case View.CHAT: return <ChatInterface />;
      case View.EXPLORE: return <LandmarkExplorer onCityChange={(url: string) => setBgImage(url)} />;
      // پڕۆژەکانی تریش لێرە زیاد بکە...
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