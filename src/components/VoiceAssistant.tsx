import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, getDocs, query } from 'firebase/firestore';
import { KURDISH_COLORS } from '../constants';

interface MenuItem {
  name_ku: string;
  name_ar: string;
  price_ku: string;
  price_ar: string;
  image: string;
  category: 'food' | 'drink' | 'dessert';
}

interface Restaurant {
  id: string;
  name_ku: string;
  name_ar: string;
  logo: string;
  cover: string;
  menu: MenuItem[];
}

const initialRestaurantsData: Restaurant[] = [
  {
    id: "res_1",
    name_ku: "ڕێستۆرانتی تەپەی دووپشک",
    name_ar: "مطعم تلة العقرب",
    logo: "🦂",
    cover: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000",
    menu: [
      { name_ku: "کبابی sۆران (شیش)", name_ar: "كباب سوران (شيش)", price_ku: "٧,٠٠٠ دینار", price_ar: "٧,٠٠٠ دينار", image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?q=80&w=400", category: "food" },
      { name_ku: "شاوەرمەی گۆشت", name_ar: "شاورما لحم", price_ku: "٥,٠٠٠ دینار", price_ar: "٥,٠٠٠ دينار", image: "https://images.unsplash.com/photo-1633345066578-79774d7db400?q=80&w=400", category: "food" },
      { name_ku: "پیتزای مۆزارێلا", name_ar: "بيتزا موزاريللا", price_ku: "٨,٥٠٠ دینار", price_ar: "٨,٥٠٠ دينار", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400", category: "food" },
      { name_ku: "فینگەر پەتاتە", name_ar: "بطاطا مقلية", price_ku: "٢,٥٠٠ دینار", price_ar: "٢,٥٠٠ دينار", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=400", category: "food" },
      { name_ku: "چای سلێمانی", name_ar: "شاي السليمانية", price_ku: "١,٠٠٠ دینار", price_ar: "١,٠٠٠ دينار", image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=400", category: "drink" }
    ]
  },
  {
    id: "res_2",
    name_ku: "داون تاون فاست فوود",
    name_ar: "داون تاون فاست فود",
    logo: "🍔",
    cover: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1000",
    menu: [
      { name_ku: "برگەری شاهانە (دۆبڵ)", name_ar: "برجر ملوكي (دبل)", price_ku: "٨,٥٠٠ دینار", price_ar: "٨,٥٠٠ دينار", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400", category: "food" },
      { name_ku: "برگەری مریشک", name_ar: "برجر دجاج", price_ku: "٦,٠٠٠ دینار", price_ar: "٦,٠٠٠ دينار", image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?q=80&w=400", category: "food" },
      { name_ku: "پەتاتەی بەپەنیر", name_ar: "بطاطا بالجبن", price_ku: "٣,٥٠٠ دینار", price_ar: "٣,٥٠٠ دينار", image: "https://images.unsplash.com/photo-1585109649139-366815a0d713?q=80&w=400", category: "food" },
      { name_ku: "پێپسی سارد", name_ar: "ببسي بارد", price_ku: "١,٠٠٠ دینار", price_ar: "١,٠٠٠ دينار", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400", category: "drink" }
    ]
  }
];

interface VoiceAssistantProps {
  language: 'ku' | 'ar';
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ language }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurantsData);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [selectedFoodItem, setSelectedFoodItem] = useState<MenuItem | null>(null);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [foodQuantity, setFoodQuantity] = useState<number>(1);
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('');
  const [noteText, setNoteText] = useState('');

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    fetchLiveRestaurants();
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = language === 'ku' ? 'ku-IQ' : 'ar-IQ'; 
      rec.interimResults = false;

      rec.onstart = () => {
        setIsActive(true);
        setStatus(language === 'ku' ? '🎙️ گوێم لێتە، تێبینی یان گۆڕانکاری بڵێ...' : '🎙️ أنا أستمع إليك، قل ملاحظاتك...');
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setNoteText(transcript);
        setStatus(language === 'ku' ? `✅ وەرگیرا: "${transcript}"` : `✅ تم الفهم: "${transcript}"`);
      };

      rec.onerror = () => {
        setStatus(language === 'ku' ? '❌ هەڵەیەک لە مایکرۆفۆندا هەیە' : '❌ حدث خطأ في المايكروفون');
        setIsActive(false);
      };

      rec.onadd = () => {
        setIsActive(false);
      };

      recognitionRef.current = rec;
    }
  }, [language]);

  const fetchLiveRestaurants = async () => {
    try {
      const snapshot = await getDocs(query(collection(db, 'restaurants')));
      const loaded: Restaurant[] = [];
      snapshot.forEach((doc) => {
        loaded.push({ id: doc.id, ...doc.data() } as Restaurant);
      });
      setRestaurants([...initialRestaurantsData, ...loaded]);
    } catch (e) {
      setRestaurants(initialRestaurantsData);
    }
  };

  const handleCitySearch = restaurants.filter(res => {
    const name = language === 'ku' ? res.name_ku : res.name_ar;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const startVoiceOrder = () => {
    if (recognitionRef.current) {
      setNoteText('');
      recognitionRef.current.start();
    } else {
      alert(language === 'ku' ? "سیستەمی دەنگی لەسەر ئەم ئامێرە پشتگیری ناکرێت" : "النظام الصوتي غير مدعوم على هذا الجهاز");
    }
  };

  const stopVoiceOrder = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const confirmOrder = async () => {
    if (!selectedFoodItem || !selectedRestaurant) return;
    try {
      await addDoc(collection(db, 'food_orders'), {
        restaurantName: selectedRestaurant.name_ku,
        foodName: selectedFoodItem.name_ku,
        quantity: foodQuantity,
        voiceNoteText: noteText || "بێ تێبینی دەنگی",
        status: "new",
        timestamp: new Date().toISOString()
      });
      alert(language === 'ku' ? `🎉 داواکارییەکەت بۆ (${foodQuantity}) دانە بە سەرکەوتوویی بۆ ڕێستۆرانت نێردرا!` : `🎉 تم إرسال طلبك لـ (${foodQuantity}) وجبات إلى المطعم بنجاح!`);
      setSelectedFoodItem(null);
      setNoteText('');
      setIsActive(false);
    } catch (e) {
      alert("Error saving order");
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 animate-in fade-in duration-700 pb-20 px-2 sm:px-4 text-right" dir="rtl">
      
      {!selectedRestaurant ? (
        <>
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black text-white">🎙️ {language === 'ku' ? 'داواکاری دەنگی ' : 'الطلب '}<span className="text-yellow-500">{language === 'ku' ? 'ڕێستۆرانتەکان' : 'الصوتي للمطاعم'}</span></h2>
            <div className="max-w-md mx-auto pt-2">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'ku' ? '🔎 گەڕان بەدوای ڕێستۆرانت...' : '🔎 البحث عن مطعم...'} 
                className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl py-3.5 px-6 text-sm text-slate-200 outline-none focus:border-yellow-500/50 transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {handleCitySearch.map((res) => (
              <div 
                key={res.id} 
                onClick={() => { setSelectedRestaurant(res); setFoodQuantity(1); }}
                className="group rounded-3xl border border-slate-800 bg-[#050507] hover:border-yellow-500/50 cursor-pointer flex flex-col overflow-hidden transition-all duration-300 shadow-xl"
              >
                <div className="h-44 w-full overflow-hidden relative">
                  <img src={res.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 right-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl shadow-lg">{res.logo}</div>
                    <h3 className="text-base font-black text-white">{language === 'ku' ? res.name_ku : res.name_ar}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="flex justify-between items-center bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60 flex-wrap gap-4">
            <button onClick={() => setSelectedRestaurant(null)} className="text-indigo-400 font-black flex items-center gap-2 hover:translate-x-2 transition-transform text-xs sm:text-sm">
              ← {language === 'ku' ? 'گەڕانەوە بۆ ڕێستۆرانتەکان' : 'العودة للمطاعم'}
            </button>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>{selectedRestaurant.logo}</span>
              <span>{language === 'ku' ? selectedRestaurant.name_ku : selectedRestaurant.name_ar}</span>
            </h2>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 border-r-2 border-yellow-500 pr-2">{language === 'ku' ? '🍔 مێنیووی خواردن (کلیک بکە بۆ داواکردن)' : '🍔 قائمة المأكولات (اضغط للطلب)'}</h4>
            
            <div className="flex flex-wrap justify-start items-center gap-6 sm:gap-8 bg-slate-950/20 p-6 rounded-[2.5rem] border border-slate-800/40">
              {selectedRestaurant.menu.map((food, index) => (
                <div 
                  key={index}
                  onClick={() => { setSelectedFoodItem(food); setFoodQuantity(1); setNoteText(''); setStatus(''); setIsActive(false); }}
                  className="w-28 sm:w-36 flex flex-col items-center text-center cursor-pointer group"
                >
                  <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-slate-800 group-hover:border-yellow-500 transition-all shadow-lg relative bg-slate-900 mb-3">
                    <img src={food.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-yellow-500 transition-colors leading-tight min-h-[32px] flex items-center justify-center">
                    {language === 'ku' ? food.name_ku : food.name_ar}
                  </h4>
                  <span className="text-[11px] font-black text-slate-400 mt-1">{language === 'ku' ? food.price_ku : food.price_ar}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedFoodItem && (
        <div className="fixed inset-0 z-[350] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setSelectedFoodItem(null)}></div>
          
          <div className="relative bg-[#09090b] border border-slate-800 w-full max-w-md rounded-[3rem] p-6 sm:p-8 shadow-2xl text-right animate-in zoom-in-95 duration-300 space-y-6 mt-16">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white">{language === 'ku' ? selectedFoodItem.name_ku : selectedFoodItem.name_ar}</h3>
              <button onClick={() => setSelectedFoodItem(null)} className="w-8 h-8 rounded-xl bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center font-bold">✕</button>
            </div>

            <div className="flex flex-col items-center gap-4 py-2">
              <div className="w-24 h-24 rounded-full overflow-hidden border border-slate-700 shadow-md">
                <img src={selectedFoodItem.image} alt="" className="w-full h-full object-cover" />
              </div>
              <span className="text-yellow-500 font-black text-base">{language === 'ku' ? selectedFoodItem.price_ku : selectedFoodItem.price_ar}</span>
            </div>

            <div className="space-y-2.5 text-center">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">{language === 'ku' ? 'ژمارەی دانەکان دیاری بکە:' : 'حدد الكمية المطلوبة:'}</label>
              <div className="flex justify-center items-center gap-5 max-w-[180px] mx-auto bg-slate-950 p-1.5 rounded-full border border-slate-800/80">
                <button type="button" onClick={() => setFoodQuantity(q => q + 1)} className="w-9 h-9 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-black flex items-center justify-center text-sm active:scale-90 transition-transform">＋</button>
                <span className="text-white font-black text-base w-6 select-none">{foodQuantity}</span>
                <button type="button" onClick={() => setFoodQuantity(q => q > 1 ? q - 1 : 1)} className="w-9 h-9 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-black flex items-center justify-center text-sm active:scale-90 transition-transform">－</button>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-3">
              {isActive ? (
                <div className="space-y-2">
                  <div className="flex justify-center gap-1.5 h-6 items-center">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="w-1 bg-red-500 h-full rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
                    ))}
                  </div>
                  <p className="text-red-500 text-[11px] font-black animate-pulse">{status}</p>
                  <button type="button" onClick={stopVoiceOrder} className="text-xs text-white bg-red-600 px-3 py-1 rounded-lg font-bold mt-1">{language === 'ku' ? 'وەستاندن' : 'إيقاف'}</button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button type="button" onClick={startVoiceOrder} className="px-4 py-2.5 bg-yellow-500/10 border border-yellow-500/30 hover:border-yellow-500 rounded-xl transition-all text-[11px] font-black text-yellow-500 flex items-center gap-1.5 mx-auto active:scale-95">
                    🎙️ {language === 'ku' ? 'زیادکردنی تێبینی بە دەنگ (بێ کلیل)' : 'إضافة ملاحظة بالصوت'}
                  </button>
                  {noteText && (
                    <p className="text-xs text-slate-300 bg-black/40 p-2 rounded-lg border border-slate-900 text-center italic">
                      "{noteText}"
                    </p>
                  )}
                </div>
              )}
            </div>

            <button 
              type="button" 
              onClick={confirmOrder}
              className="w-full py-4 bg-yellow-500 hover:bg-yellow-600 text-black font-black text-xs rounded-xl shadow-xl transition-all text-center"
            >
              🚀 {language === 'ku' ? `ناردنی داواکاری بۆ ڕێستۆرانت (${foodQuantity} دانە)` : `إرسال الطلب للمطعم (${foodQuantity} وجبة)`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;