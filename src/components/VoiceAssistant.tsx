import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, getDocs, query, doc, deleteDoc, updateDoc } from 'firebase/firestore';

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
  ownerName?: string;
  ownerEmail?: string;
  menu: MenuItem[];
}

const initialRestaurantsData: Restaurant[] = [
  {
    id: "res_1",
    name_ku: "ڕێستۆرانتی تەپەی دووپشک",
    name_ar: "مطعم تلة العقرب",
    logo: "🦂",
    cover: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000",
    ownerEmail: "scorpion@restaurant.com",
    ownerName: "خاوەنی دووپشک",
    menu: [
      { name_ku: "کبابی سۆران (شیش)", name_ar: "كباب سوران (شيش)", price_ku: "٧,٠٠٠ دینار", price_ar: "٧,٠٠٠ دينار", image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?q=80&w=400", category: "food" }
    ]
  }
];

interface VoiceAssistantProps {
  language: 'ku' | 'ar';
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ language }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [selectedFoodItem, setSelectedFoodItem] = useState<MenuItem | null>(null);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [foodQuantity, setFoodQuantity] = useState<number>(1);
  const [isActive, setIsActive] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isManualInput, setIsManualInput] = useState(false); // ✍️ بۆ نووسینی دەستی ئەگەر مایکەکە دەقی دروست نەکرد

  const isSuperAdmin = auth.currentUser?.email === 'heremheyder@admin.com' || auth.currentUser?.email === 'hedikurdaipro@admin.com';
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  
  const [newResNameKu, setNewResNameKu] = useState('');
  const [newResNameAr, setNewResNameAr] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newOwnerPassword, setNewOwnerPassword] = useState('');
  const [newResLogo, setNewResLogo] = useState('🍽️');
  const [newResCover, setNewResCover] = useState('');

  const recognitionRef = useRef<any>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  useEffect(() => {
    fetchLiveRestaurants();

    // 🚀 سیستەمی یەکەم: هەوڵدان بۆ چالاککردنی Speech to Text ی فەرمی وێبگەڕ
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = language === 'ku' ? 'ku-IQ' : 'ar-IQ';
      
      rec.onstart = () => { setIsActive(true); };
      rec.onresult = (e: any) => { 
        const resultText = e.results[0][0].transcript;
        setNoteText(resultText); 
        setIsActive(false); 
      };
      rec.onerror = () => { setIsActive(false); };
      rec.onend = () => { setIsActive(false); };
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

      if (loaded.length === 0) {
        setRestaurants(initialRestaurantsData);
      } else {
        setRestaurants(loaded);
      }
    } catch (e) {
      setRestaurants(initialRestaurantsData);
    }
  };

  // 🎙️ سیستەمی دووەم: ئەگەر وێبگەڕ پشتگیری نەبوو، وەک میدیا دەنگەکە تۆمار دەکات
  const startVoiceProcess = async () => {
    setNoteText('');
    setIsManualInput(false);

    // ئەگەر وێبگەڕەکە پشتگیری گۆڕینی ڕاستەوخۆی دەنگی دەکرد
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        return;
      } catch (e) { console.log("SpeechRecognition working fallback"); }
    }

    // ئەگەر پشتگیری نەکرد، وەک فایل تۆماری دەکات و ڕێگا بە نووسینی دەستیش دەدات
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      
      recorder.onstart = () => { setIsActive(true); };
      recorder.ondataavailable = () => {
        setNoteText("تێبینی دەنگی تۆمارکراو 🎙️");
        setIsManualInput(true); // ✍️ کردنەوەی بەشی دەستکاری بۆ ئەوەی بنووسێت
      };
      recorder.onstop = () => { setIsActive(false); };
      recorder.start();
    } catch (err) {
      setIsManualInput(true);
      alert("⚠️ مۆڵەتی مایک نەدراوە! دەتوانیت تێبینییەکە بە دەستی بنووسیت.");
    }
  };

  const stopVoiceProcess = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e){}
    }
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleCreateOrUpdateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResNameKu || !newOwnerEmail) return;

    try {
      if (editingRestaurant) {
        const ref = doc(db, 'restaurants', editingRestaurant.id);
        await updateDoc(ref, {
          name_ku: newResNameKu,
          name_ar: newResNameAr || newResNameKu,
          logo: newResLogo,
          ownerName: newOwnerName,
          ownerEmail: newOwnerEmail.toLowerCase().trim()
        });
        alert("گۆڕانکارییەکە پاشەکەوت کرا");
      } else {
        if (!newOwnerPassword || newOwnerPassword.length < 6) {
          alert("تکایە پاسۆرد لە ٦ پیت کەمتر نەبێت");
          return;
        }
        await createUserWithEmailAndPassword(auth, newOwnerEmail.toLowerCase().trim(), newOwnerPassword);
        await addDoc(collection(db, 'restaurants'), {
          name_ku: newResNameKu,
          name_ar: newResNameAr || newResNameKu,
          logo: newResLogo,
          cover: newResCover || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000",
          ownerName: newOwnerName,
          ownerEmail: newOwnerEmail.toLowerCase().trim(),
          temporaryPassword: newOwnerPassword,
          menu: []
        });
        alert("ڕێستۆرانت دروستکرا");
      }
      setNewResNameKu(''); setNewResNameAr(''); setNewOwnerName(''); setNewOwnerEmail(''); setNewOwnerPassword(''); setNewResCover('');
      setEditingRestaurant(null); setShowAdminForm(false);
      fetchLiveRestaurants();
    } catch (err: any) {
      alert("خەتا: " + err.message);
    }
  };

  const handleDeleteRestaurant = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("دڵنیای لە سڕینەوە؟")) return;
    try {
      await deleteDoc(doc(db, 'restaurants', id));
      fetchLiveRestaurants();
    } catch (err) { alert("خەتا"); }
  };

  const handleStartEdit = (res: Restaurant, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingRestaurant(res);
    setNewResNameKu(res.name_ku);
    setNewResNameAr(res.name_ar);
    setNewResLogo(res.logo);
    setNewOwnerName(res.ownerName || '');
    setNewOwnerEmail(res.ownerEmail || '');
    setShowAdminForm(true);
  };

  const confirmOrder = async () => {
    if (!selectedFoodItem || !selectedRestaurant) return;
    try {
      await addDoc(collection(db, 'food_orders'), {
        restaurantId: selectedRestaurant.id,
        restaurantName: selectedRestaurant.name_ku,
        foodName: selectedFoodItem.name_ku,
        quantity: foodQuantity,
        voiceNoteText: noteText || "بێ تێبینی",
        status: "new",
        timestamp: new Date().toISOString()
      });
      alert(`🎉 داواکاری بە سەرکەوتوویی نێردرا!`);
      setSelectedFoodItem(null);
      setNoteText('');
      setIsManualInput(false);
    } catch (e) { 
      alert("خەتا لە ناردنی داواکاری"); 
    }
  };

  const handleCitySearch = restaurants.filter(res => 
    (language === 'ku' ? res.name_ku : res.name_ar).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500 pb-20 px-4 text-right" dir="rtl">
      
      {isSuperAdmin && (
        <div className="text-center">
          <button type="button" onClick={() => { setShowAdminForm(!showAdminForm); setEditingRestaurant(null); }} className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs">
            {showAdminForm ? '✕ داخستنی پانێڵ' : '➕ زیادکردنی ڕێستۆرانت'}
          </button>
        </div>
      )}

      {showAdminForm && isSuperAdmin && (
        <form onSubmit={handleCreateOrUpdateRestaurant} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 max-w-xl mx-auto w-full">
          <input type="text" placeholder="ناوی کوردی" value={newResNameKu} onChange={e=>setNewResNameKu(e.target.value)} className="w-full p-2.5 bg-black text-white text-xs rounded-lg border border-slate-800" />
          <input type="text" placeholder="ئیمەیڵ" value={newOwnerEmail} onChange={e=>setNewOwnerEmail(e.target.value)} className="w-full p-2.5 bg-black text-white text-xs rounded-lg border border-slate-800" />
          {!editingRestaurant && <input type="text" placeholder="پاسۆرد" value={newOwnerPassword} onChange={e=>setNewOwnerPassword(e.target.value)} className="w-full p-2.5 bg-black text-white text-xs rounded-lg border border-slate-800" />}
          <input type="text" placeholder="🔗 لینکی وێنەی کەڤەر" value={newResCover} onChange={e=>setNewResCover(e.target.value)} className="w-full p-2.5 bg-black text-white text-xs rounded-lg border border-slate-800" dir="ltr" />
          <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-lg">🚀 پاشەکەوت</button>
        </form>
      )}

      {!selectedRestaurant ? (
        <>
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-black text-white">🎙️ داواکاری دەنگی <span className="text-yellow-500">ڕێستۆرانتەکان</span></h2>
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="🔎 گەڕان..." className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-slate-200 text-right" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {handleCitySearch.map((res) => (
              <div key={res.id} onClick={() => { setSelectedRestaurant(res); setFoodQuantity(1); }} className="rounded-xl border border-slate-900 bg-[#050507] overflow-hidden cursor-pointer flex h-24 items-center p-2 gap-3 hover:border-slate-700 transition-all">
                <img src={res.cover} alt="" className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-black text-white truncate">{language === 'ku' ? res.name_ku : res.name_ar}</h3>
                  <p className="text-[11px] text-slate-500 mt-1">✨ لۆگۆ: {res.logo}</p>
                </div>
                {isSuperAdmin && (
                  <div className="flex flex-col gap-1">
                    <button onClick={(e) => handleStartEdit(res, e)} className="px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded text-[10px]">📝</button>
                    <button onClick={(e) => handleDeleteRestaurant(res.id, e)} className="px-2 py-1 bg-red-500/10 text-red-500 rounded text-[10px]">🗑️</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-900">
            <button onClick={() => setSelectedRestaurant(null)} className="text-indigo-400 font-bold text-xs">← گەڕانەوە</button>
            <h2 className="text-sm font-black text-white">{selectedRestaurant.name_ku}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedRestaurant.menu?.map((food, index) => (
              <div 
                key={index} 
                onClick={() => { setSelectedFoodItem(food); setFoodQuantity(1); }} 
                className="bg-slate-950 p-2.5 rounded-xl border border-slate-900 flex items-center gap-3 cursor-pointer hover:border-yellow-500/30 transition-all"
              >
                <img src={food.image} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-slate-200 truncate">{language === 'ku' ? food.name_ku : food.name_ar}</h4>
                  <span className="text-[11px] font-bold text-yellow-500 block mt-1">{food.price_ku}</span>
                </div>
                <span className="text-xs text-indigo-400 font-bold bg-indigo-500/5 px-2 py-1 rounded-lg">🛒 داواکردن</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedFoodItem && (
        <div className="fixed inset-0 z-[350] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setSelectedFoodItem(null)}></div>
          <div className="relative bg-[#09090b] border border-slate-800 w-full max-w-sm rounded-2xl p-5 space-y-4 text-right">
            <h3 className="text-sm font-black text-white text-center">{selectedFoodItem.name_ku}</h3>
            <div className="flex justify-center items-center gap-4 bg-slate-950 p-1 rounded-full border border-slate-800 max-w-[140px] mx-auto">
              <button type="button" onClick={() => setFoodQuantity(q => q + 1)} className="w-7 h-7 bg-slate-900 text-white rounded-full font-bold text-xs">＋</button>
              <span className="text-white font-bold text-xs">{foodQuantity}</span>
              <button type="button" onClick={() => setFoodQuantity(q => q > 1 ? q - 1 : 1)} className="w-7 h-7 bg-slate-900 text-white rounded-full font-bold text-xs">－</button>
            </div>
            
            <div className="bg-slate-950 p-3 rounded-xl text-center space-y-2">
              {isActive ? (
                <button type="button" onClick={stopVoiceProcess} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-[11px] font-black animate-pulse">
                  ⏹️ ڕاگرتنی تۆمارکردن
                </button>
              ) : (
                <button type="button" onClick={startVoiceProcess} className="px-3 py-1.5 bg-yellow-500/10 text-yellow-500 rounded-lg text-[11px] font-black">
                  🎙️ تێبینی دەنگی (کوردی / عەرەبی)
                </button>
              )}
              
              {/* ✍️ ڕێگەدان بە نووسین یان دەستکاری تێبینی دەنگی */}
              {(noteText || isManualInput) && (
                <input 
                  type="text" 
                  value={noteText} 
                  onChange={(e) => { setNoteText(e.target.value); setIsManualInput(true); }}
                  placeholder="تێبینی لێرە بنووسە یان دەستکاری بکە..." 
                  className="w-full p-2 bg-black text-white border border-slate-800 rounded-lg text-xs text-right mt-2 outline-none focus:border-yellow-500"
                />
              )}
            </div>
            <button type="button" onClick={confirmOrder} className="w-full py-2.5 bg-yellow-500 text-black font-black text-xs rounded-xl">🚀 ناردنی داواکاری</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;