import React, { useState, useEffect, useRef } from 'react';
import { getLandmarks } from '../services/geminiService';

// پێناسەی تایپ بۆ ئەو کۆمپۆنێنتەی کە onCityChange وەردەگرێت
interface LandmarkExplorerProps {
  onCityChange: (url: string) => void;
}

const REGIONS = [
  { id: 'Erbil', label: 'هەولێر', type: 'prov', catchy: 'هەولێر؛ پایتەختی مێژوویی و ئاوەدانی.' },
  { id: 'Sulaymaniyah', label: 'سلێمانی', type: 'prov', catchy: 'سلێمانی؛ مەڵبەندی ڕۆشنبیری و هونەر.' },
  { id: 'Duhok', label: 'دهۆک', type: 'prov', catchy: 'دهۆک؛ بووکی کوردستان و دەروازەی چیاکان.' },
  { id: 'Kirkuk', label: 'کەرکووک', type: 'prov', catchy: 'کەرکووک؛ شاری بابەگوڕگوڕ و قەڵای دێرین.' },
  { id: 'Halabja', label: 'هەڵەبجە', type: 'prov', catchy: 'هەڵەبجە؛ پایتەختی ئاشتی و سروشتی هەورامان.' },
];

const MASTER_ASSETS: Record<string, string> = {
  'Erbil': 'https://images.unsplash.com/photo-1644342352822-5f606821262d?q=80&w=2000&auto=format&fit=crop',
  'Sulaymaniyah': 'https://images.unsplash.com/photo-1628163539063-8828b0303b71?q=80&w=2000&auto=format&fit=crop', 
  'Duhok': 'https://images.unsplash.com/photo-1548685913-fe6574346a23?q=80&w=2500&auto=format&fit=crop',
  'Kirkuk': 'https://images.unsplash.com/photo-1621252327702-0aa0e698165e?q=80&w=2000&auto=format&fit=crop',
  'Halabja': 'https://images.unsplash.com/photo-1601058497548-f247dfe349d6?q=80&w=2000&auto=format&fit=crop',
};

const optimizeUrl = (url: string, width: number = 800) => {
  if (url && url.includes('unsplash.com')) {
    try {
      const u = new URL(url);
      u.searchParams.set('w', width.toString());
      u.searchParams.set('q', '75');
      return u.toString();
    } catch (e) { return url; }
  }
  return url;
};

const LandmarkExplorer: React.FC<LandmarkExplorerProps> = ({ onCityChange }) => {
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]);
  const [cityNarrative, setCityNarrative] = useState('');
  const [landmarks, setLandmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeBackground, setActiveBackground] = useState<string>(MASTER_ASSETS[REGIONS[0].id]);
  
  const cache = useRef<Record<string, any>>({});

  const fetchLandmarks = async (regionLabel: string) => {
    const foundRegion = REGIONS.find(r => r.label === regionLabel);
    if (foundRegion) {
      setSelectedRegion(foundRegion);
      const cityImg = MASTER_ASSETS[foundRegion.id] || MASTER_ASSETS['Erbil'];
      setActiveBackground(cityImg);
      // لێرەدا بانگی فەنکشنەکە دەکەین
      if (onCityChange) onCityChange(cityImg);
    }

    if (cache.current[regionLabel]) {
      setCityNarrative(cache.current[regionLabel].cityNarrative);
      setLandmarks(cache.current[regionLabel].landmarks);
      return;
    }

    setLoading(true);
    try {
      const rawData = await getLandmarks(regionLabel);
      const data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
      cache.current[regionLabel] = data;
      setCityNarrative(data.cityNarrative);
      setLandmarks(data.landmarks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLandmarks(selectedRegion.label);
  }, []);

  return (
    <div className="space-y-20 pb-20" dir="rtl">
      {/* Region Selector */}
      <div className="flex justify-center gap-3">
        {REGIONS.map(region => (
          <button
            key={region.id}
            onClick={() => fetchLandmarks(region.label)}
            className={`px-6 py-2 rounded-full ${selectedRegion.id === region.id ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white'}`}
          >
            {region.label}
          </button>
        ))}
      </div>

      {/* Hero Image */}
      <div className="relative h-[400px] w-full rounded-3xl overflow-hidden">
        <img src={optimizeUrl(activeBackground, 1200)} className="w-full h-full object-cover" alt="Region" />
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto text-white">
        <p className="text-xl leading-loose">{cityNarrative}</p>
      </div>
    </div>
  );
};

export default LandmarkExplorer;