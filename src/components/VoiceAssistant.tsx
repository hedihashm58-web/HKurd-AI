import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
// 🔐 هاوردەکردنی نەخشەی فەرمی فایربەیس بۆ دروستکردنی حیسابی لۆگین
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
  },
  {
    id: "res_2",
    name_ku: "داون تاون فاست فوود",
    name_ar: "داون تاون فاست فود",
    logo: "🍔",
    cover: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1000",
    ownerEmail: "downtown@restaurant.com",
    ownerName: "خاوەنی داون تاون",
    menu: [
      { name_ku: "برگەری شاهانە (دۆبڵ)", name_ar: "برجر ملوكي (دبل)", price_ku: "٨,٥٠٠ دینار", price_ar: "٨,٥٠٠ دينار", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400", category: "food" }
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
  const [status, setStatus] = useState('');
  const [noteText, setNoteText] = useState('');

  // 👑 لۆجیکی سوپەر ئادمین
  const isSuperAdmin = auth.currentUser?.email === 'heremheyder@admin.com' || auth.currentUser?.email === 'hedikurdaipro@admin.com';
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  
  const [newResNameKu, setNewResNameKu] = useState('');
  const [newResNameAr, setNewResNameAr] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newOwnerPassword, setNewOwnerPassword] = useState('');
  const [newResLogo, setNewResLogo] = useState('🍽️');

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    fetchLiveRestaurants();
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = language === 'ku' ? 'ku-IQ' : 'ar-IQ';
      rec.onstart = () => { 
        setIsActive(true); 
        setStatus(language === 'ku' ? '🎙️ گوێم لێتە، تێبینی بڵێ...' : '🎙️ أنا أستمع إليك...'); 
      };
      rec.onresult = (e: any) => { 
        setNoteText(e.results[0][0].transcript); 
        setIsActive(false); 
      };
      rec.onerror = () => setIsActive(false);
      rec.onend = () => setIsActive(false);
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

  const handleCreateOrUpdateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResNameKu || !newOwnerEmail) return;

    try {
      if (editingRestaurant) {
        // 📝 دەستکاریکردنی زانیاری لە Firestore
        const ref = doc(db, 'restaurants', editingRestaurant.id);
        await updateDoc(ref, {
          name_ku: newResNameKu,
          name_ar: newResNameAr || newResNameKu,
          logo: newResLogo,
          ownerName: newOwnerName,
          ownerEmail: newOwnerEmail.toLowerCase().trim()
        });
        alert("گۆڕانکارییەکە بە سەرکەوتوویی پاشەکەوت کرا");
      } else {
        // ➕ ١. دروستکردنی حیسابی لۆگین لە Firebase Auth بۆ ئەوەی حیسابەکە کار بکات
        if (!newOwnerPassword || newOwnerPassword.length < 6) {
          alert("تکایە پاسۆردێک بنووسە کە لە ٦ پیت کەمتر نباشێت");
          return;
        }
        
        await createUserWithEmailAndPassword(auth, newOwnerEmail.toLowerCase().trim(), newOwnerPassword);

        // ➕ ٢. تۆمارکردنی زانیارییەکان لە ناو داتابەیسی Firestore
        await addDoc(collection(db, 'restaurants'), {
          name_ku: newResNameKu,
          name_ar: newResNameAr || newResNameKu,
          logo: newResLogo,
          cover: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000",
          ownerName: newOwnerName,
          ownerEmail: newOwnerEmail.toLowerCase().trim(),
          temporaryPassword: newOwnerPassword,
          menu: []
        });
        
        alert("🎉 ڕێستۆرانت و حیسابی داخڵبوونی خاوەنەکە بە سەرکەوتوویی دروستکرا!");
      }
      setNewResNameKu(''); setNewResNameAr(''); setNewOwnerName(''); setNewOwnerEmail(''); setNewOwnerPassword('');
      setEditingRestaurant(null); setShowAdminForm(false);
      fetchLiveRestaurants();
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        alert("❌ ئەم ئیمەیڵە پێشتر حیسابی بۆ دروستکراوە!");
      } else {
        alert("خەتایەک لە کاتی دروستکردنی حیساب ڕوویدا: " + err.message);
      }
    }
  };

  const handleDeleteRestaurant = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("دڵنیای لە سڕینەوەی ئەم ڕێستۆرانتە؟")) return;

    try {
      await deleteDoc(doc(db, 'restaurants', id));
      alert("ڕێستۆرانتەکە سڕدراوە");
      fetchLiveRestaurants();
    } catch (err) {
      alert("خەتا لە کاتی سڕینەوە");
    }
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
        voiceNoteText: noteText || "بێ تێبینی دەنگی",
        status: "new",
        timestamp: new Date().toISOString()
      });
      alert(language === 'ku' ? `🎉 داواکاری نێردرا بۆ ڕێستۆرانت!` : `🎉 تم إرسال الطلب!`);
      setSelectedFoodItem(null);
      setNoteText('');
    } catch (e) {
      alert("Error saving order");
    }
  };

  const handleCitySearch = restaurants.filter(res => 
    (language === 'ku' ? res.name_ku : res.name_ar).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 animate-in fade-in duration-700 pb-20 px-2 sm:px-4 text-right" dir="rtl">
      
      {isSuperAdmin && (
        <div className="text-center">
          <button type="button" onClick={() => { setShowAdminForm(!showAdminForm); setEditingRestaurant(null); }} className="px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl text-xs shadow-lg">
            {showAdminForm ? '✕ داخستنی پانێڵ' : '➕ زیادکردنی ڕێستۆرانتی نوێ'}
          </button>
        </div>
      )}

      {showAdminForm && isSuperAdmin && (
        <form onSubmit={handleCreateOrUpdateRestaurant} className="bg-slate-950 p-6 rounded-[2.5rem] border border-slate-800 space-y-4 max-w-2xl mx-auto w-full shadow-2xl">
          <h3 className="text-sm font-black text-yellow-500">{editingRestaurant ? '📝 دەستکاریکردنی ڕێستۆرانت' : '📋 زیادکردنی ڕێستۆرانت'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input type="text" placeholder="ناوی ڕێستۆرانت (کوردی)" value={newResNameKu} onChange={e=>setNewResNameKu(e.target.value)} className="p-3 bg-black text-white text-xs rounded-xl border border-slate-800 outline-none" />
            <input type="text" placeholder="اسم المطعم (عربي)" value={newResNameAr} onChange={e=>setNewResNameAr(e.target.value)} className="p-3 bg-black text-white text-xs rounded-xl border border-slate-800 outline-none" />
            <input type="text" placeholder="ئیمۆجی لۆگۆ (🍕)" value={newResLogo} onChange={e=>setNewResLogo(e.target.value)} className="p-3 bg-black text-white text-xs rounded-xl border border-slate-800 outline-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input type="text" placeholder="ناوی خاوەن" value={newOwnerName} onChange={e=>setNewOwnerName(e.target.value)} className="p-3 bg-black text-white text-xs rounded-xl border border-slate-800 outline-none" />
            <input type="email" placeholder="ئیمەیڵ" value={newOwnerEmail} onChange={e=>setNewOwnerEmail(e.target.value)} className="p-3 bg-black text-white text-xs rounded-xl border border-slate-800 outline-none" />
            {!editingRestaurant && <input type="text" placeholder="پاسۆرد" value={newOwnerPassword} onChange={e=>setNewOwnerPassword(e.target.value)} className="p-3 bg-black text-white text-xs rounded-xl border border-slate-800 outline-none" />}
          </div>
          <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-md">
            {editingRestaurant ? '💾 پاشەکەوتکردنی گۆڕانکارییەکان' : '🚀 دروستکردنی ڕێستۆرانت'}
          </button>
        </form>
      )}

      {!selectedRestaurant ? (
        <>
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-black text-white">🎙️ داواکاری دەنگی <span className="text-yellow-500">ڕێستۆرانتەکان</span></h2>
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="🔎 گەڕان..." className="w-full max-w-md bg-slate-950/60 border border-slate-800 rounded-2xl py-3 px-6 text-sm text-slate-200 text-right" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {handleCitySearch.map((res) => (
              <div key={res.id} onClick={() => { setSelectedRestaurant(res); setFoodQuantity(1); }} className="group rounded-3xl border border-slate-800 bg-[#050507] overflow-hidden cursor-pointer shadow-xl relative">
                <div className="h-44 w-full relative">
                  <img src={res.cover} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 right-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl">{res.logo}</div>
                    <h3 className="text-base font-black text-white">{language === 'ku' ? res.name_ku : res.name_ar}</h3>
                  </div>
                </div>
                {isSuperAdmin && (
                  <div className="p-3 bg-slate-950 flex gap-2 border-t border-slate-900">
                    <button onClick={(e) => handleStartEdit(res, e)} className="flex-1 py-1.5 bg-yellow-500/10 text-yellow-500 rounded-lg text-[10px] font-bold">📝 دەستکاری</button>
                    <button onClick={(e) => handleDeleteRestaurant(res.id, e)} className="flex-1 py-1.5 bg-red-500/10 text-red-500 rounded-lg text-[10px] font-bold">🗑️ سڕینەوە</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="flex justify-between items-center bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60">
            <button onClick={() => setSelectedRestaurant(null)} className="text-indigo-400 font-black text-xs">← گەڕانەوە</button>
            <h2 className="text-xl font-black text-white flex items-center gap-2"><span>{selectedRestaurant.logo}</span><span>{selectedRestaurant.name_ku}</span></h2>
          </div>
          <div className="flex flex-wrap gap-6 bg-slate-950/20 p-6 rounded-[2.5rem] border border-slate-800/40">
            {selectedRestaurant.menu?.map((food, index) => (
              <div key={index} onClick={() => { setSelectedFoodItem(food); setFoodQuantity(1); }} className="w-28 sm:w-36 flex flex-col items-center cursor-pointer group">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-800 mb-3"><img src={food.image} alt="" className="w-full h-full object-cover" /></div>
                <h4 className="text-xs font-bold text-slate-200">{language === 'ku' ? food.name_ku : food.name_ar}</h4>
                <span className="text-[11px] font-black text-slate-400 mt-1">{food.price_ku}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedFoodItem && (
        <div className="fixed inset-0 z-[350] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setSelectedFoodItem(null)}></div>
          <div className="relative bg-[#09090b] border border-slate-800 w-full max-w-md rounded-[3rem] p-6 space-y-6 text-right">
            <h3 className="text-lg font-black text-white text-center">{selectedFoodItem.name_ku}</h3>
            <div className="flex justify-center items-center gap-5 max-w-[180px] mx-auto bg-slate-950 p-1.5 rounded-full border border-slate-800">
              <button type="button" onClick={() => setFoodQuantity(q => q + 1)} className="w-9 h-9 bg-slate-900 text-white rounded-full">＋</button>
              <span className="text-white font-black">{foodQuantity}</span>
              <button type="button" onClick={() => setFoodQuantity(q => q > 1 ? q - 1 : 1)} className="w-9 h-9 bg-slate-900 text-white rounded-full">－</button>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl text-center">
              {isActive ? <p className="text-red-500 animate-pulse">🎙️ گوێم لێتە...</p> : <button type="button" onClick={() => { if (recognitionRef.current) recognitionRef.current.start(); }} className="px-4 py-2 bg-yellow-500/10 text-yellow-500 rounded-xl text-xs font-black">🎙️ تێبینی دەنگی</button>}
              {noteText && <p className="text-xs text-slate-300 mt-2">"{noteText}"</p>}
            </div>
            <button type="button" onClick={confirmOrder} className="w-full py-4 bg-yellow-500 text-black font-black text-xs rounded-xl shadow-lg">🚀 ناردنی داواکاری</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;