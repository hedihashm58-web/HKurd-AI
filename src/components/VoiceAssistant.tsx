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

interface CartItem {
  food: MenuItem;
  quantity: number;
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

interface ParsedAIOrder {
  foodName: string;
  quantity: number;
}

interface VoiceAssistantProps {
  language: 'ku' | 'ar';
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

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ language }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [foodToBuy, setFoodToBuy] = useState<MenuItem | null>(null);
  const [tempQuantity, setTempQuantity] = useState<number>(1);
  const [showCartModal, setShowCartModal] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(false);
  const [noteText, setNoteText] = useState<string>('');
  const [isManualInput, setIsManualInput] = useState<boolean>(false);
  const [isProcessingAI, setIsProcessingAI] = useState<boolean>(false);
  const [debugError, setDebugError] = useState<string>('');

  const isSuperAdmin = auth.currentUser?.email === 'heremheyder@admin.com' || auth.currentUser?.email === 'hedikurdaipro@admin.com';
  const [showAdminForm, setShowAdminForm] = useState<boolean>(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  
  const [newResNameKu, setNewResNameKu] = useState<string>('');
  const [newResNameAr, setNewResNameAr] = useState<string>('');
  const [newOwnerName, setNewOwnerName] = useState<string>('');
  const [newOwnerEmail, setNewOwnerEmail] = useState<string>('');
  const [newOwnerPassword, setNewOwnerPassword] = useState<string>('');
  const [newResLogo, setNewResLogo] = useState<string>('🍽️');
  const [newResCover, setNewResCover] = useState<string>('');

  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const getGeminiApiKey = (): string => {
    const keys = [
      import.meta.env.VITE_GEMINI_API_KEY,
      import.meta.env.VITE_GEMINI_KEY_1,
      import.meta.env.VITE_GEMINI_KEY_2,
      import.meta.env.VITE_GEMINI_KEY_3,
      import.meta.env.VITE_GEMINI_KEY_4
    ].filter(key => !!key);

    if (keys.length === 0) return "";
    const randomIndex = Math.floor(Math.random() * keys.length);
    return keys[randomIndex];
  };

  useEffect(() => {
    fetchLiveRestaurants();
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    };
  }, []);

  const fetchLiveRestaurants = async () => {
    try {
      const snapshot = await getDocs(query(collection(db, 'restaurants')));
      const loaded: Restaurant[] = [];
      snapshot.forEach((docSnap) => {
        loaded.push({ id: docSnap.id, ...docSnap.data() } as Restaurant);
      });
      setRestaurants(loaded.length === 0 ? initialRestaurantsData : loaded);
    } catch (e) {
      setRestaurants(initialRestaurantsData);
    }
  };

  const addToCart = () => {
    if (!foodToBuy) return;
    const existingIndex = cart.findIndex(item => item.food.name_ku === foodToBuy.name_ku);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += tempQuantity;
      setCart(updated);
    } else {
      setCart([...cart, { food: foodToBuy, quantity: tempQuantity }]);
    }
    setFoodToBuy(null);
    setTempQuantity(1);
  };

  const updateCartQuantity = (index: number, amount: number) => {
    const updated = [...cart];
    updated[index].quantity += amount;
    if (updated[index].quantity <= 0) updated.splice(index, 1);
    setCart(updated);
  };

  const removeFromCart = (index: number) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const priceNum = parseInt(item.food.price_ku.replace(/[^0-9]/g, '').replace(/,/g, '')) || 0;
      return total + (priceNum * item.quantity);
    }, 0).toLocaleString();
  };

  const startMainVoiceProcess = async () => {
    setDebugError('');
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      let options: any = {};
      const win = window as any;
      if (win.MediaRecorder && typeof win.MediaRecorder.isTypeSupported === 'function') {
        if (win.MediaRecorder.isTypeSupported('audio/webm')) options = { mimeType: 'audio/webm' };
        else if (win.MediaRecorder.isTypeSupported('audio/mp4')) options = { mimeType: 'audio/mp4' };
      }
      
      const recorder = new win.MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.onstart = () => { setIsActive(true); };
      recorder.ondataavailable = (e: any) => { if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        setIsActive(false);
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        await sendMainAudioToGemini(audioBlob, recorder.mimeType || 'audio/webm');
      };
      recorder.start();
    } catch (err: any) {
      setDebugError("مایک خەتای دا: " + err.message);
    }
  };

  const stopVoiceProcess = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsActive(false);
  };

  const sendMainAudioToGemini = async (blob: Blob, mimeType: string) => {
    const currentKey = getGeminiApiKey();
    if (!currentKey || !selectedRestaurant) return;

    setIsProcessingAI(true);
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
      if (!reader.result) return;
      const base64Audio = (reader.result as string).split(',')[1];
      let cleanedMimeType = mimeType.split(';')[0];
      if (cleanedMimeType === 'audio/mp4' || cleanedMimeType === 'audio/x-m4a') cleanedMimeType = 'audio/aac';

      const availableMenuNames = selectedRestaurant.menu.map(f => f.name_ku).join(', ');

      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${currentKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: `تۆ لێکۆڵەری دەنگی ڕێستۆرانتکانیت. کڕیارەکە داوای خواردن دەکات. ئەمە مێنیوی ڕێستۆرانتەکەیە: [${availableMenuNames}]. گوێ لەم دەنگە بگرە، تەنها ناوی ئەو خواردنانەی کە داوایان دەکات لەگەڵ ژمارەکەیان بە فۆرماتی JSON بەم شێوەیە بگەڕێنەوە: [{"foodName": "ناوی خواردنەکە بە کوردی ڕێک وەک ناوەکەی مێنیو", "quantity": ژمارە}]. ئەگەر خواردنەکە لە مێنیودا نەبوو یان تێنەگەشتی لیستەکە بەتاڵ بکە []. هیچ دەقێکی تر مەنوسە تەنها JSON بگەڕێنەوە.` },
                { inlineData: { mimeType: cleanedMimeType, data: base64Audio } }
              ]
            }]
          })
        });

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
        
        const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedOrders = JSON.parse(jsonString) as ParsedAIOrder[];

        if (Array.isArray(parsedOrders) && parsedOrders.length > 0) {
          const updatedCart = [...cart];
          parsedOrders.forEach((order) => {
            if (order && order.foodName) {
              const foundFood = selectedRestaurant.menu.find(f => f.name_ku.toLowerCase().trim() === order.foodName.toLowerCase().trim());
              if (foundFood) {
                const existingIndex = updatedCart.findIndex(item => item.food.name_ku === foundFood.name_ku);
                if (existingIndex > -1) {
                  updatedCart[existingIndex].quantity += order.quantity;
                } else {
                  updatedCart.push({ food: foundFood, quantity: order.quantity });
                }
              }
            }
          });
          setCart(updatedCart);
          alert("✨ خواردنەکان بە دەنگ خرانە ناو سەبەتەکەتەوە!");
        } else {
          alert("🤖 ژیری دەستکرد نەیتوانی خواردنەکە لە مێنیودا بدۆزێتەوە، تکایە ناوی خواردنەکە ڕوون بڵێ.");
        }
      } catch (error: any) {
        setDebugError("خەتای نێت یان کوۆتا: " + error.message);
      }
      setIsProcessingAI(false);
    };
  };

  const confirmOrder = async () => {
    if (cart.length === 0 || !selectedRestaurant) return;
    try {
      const orderItems = cart.map(item => ({
        foodName: item.food.name_ku,
        quantity: item.quantity,
        price: item.food.price_ku
      }));

      await addDoc(collection(db, 'food_orders'), {
        restaurantId: selectedRestaurant.id,
        restaurantName: selectedRestaurant.name_ku,
        items: orderItems,
        totalPrice: `${calculateTotal()} دینار`,
        voiceNoteText: noteText || "بێ تێبینی کۆتایی",
        status: "new",
        timestamp: new Date().toISOString()
      });

      alert(`🎉 داواکاری وەسڵەکە بە سەرکەوتوویی نێردرا!`);
      setCart([]);
      setNoteText('');
      setShowCartModal(false);
    } catch (e) { alert("خەتا لە ناردنی داواکاری"); }
  };

  const handleCreateOrUpdateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResNameKu || !newOwnerEmail) return;
    try {
      if (editingRestaurant) {
        await updateDoc(doc(db, 'restaurants', editingRestaurant.id), {
          name_ku: newResNameKu,
          name_ar: newResNameAr || newResNameKu,
          logo: newResLogo,
          ownerName: newOwnerName,
          ownerEmail: newOwnerEmail.toLowerCase().trim()
        });
        alert("گۆڕانکارییەکە پاشەکەوت کرا");
      } else {
        if (!newOwnerPassword || newOwnerPassword.length < 6) {
          alert("پاسۆرد کەمتر نەبێت لە ٦ پیت");
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
      setNewResNameKu(''); setNewResNameAr(''); setNewOwnerName(''); setNewOwnerEmail(''); setNewOwnerPassword('');
      setEditingRestaurant(null); setShowAdminForm(false);
      fetchLiveRestaurants();
    } catch (err: any) { alert("خەتا: " + err.message); }
  };

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
          <input type="text" placeholder="🔗 کەڤەر" value={newResCover} onChange={e=>setNewResCover(e.target.value)} className="w-full p-2.5 bg-black text-white text-xs rounded-lg border border-slate-800" dir="ltr" />
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
            {restaurants.filter(res => (language === 'ku' ? res.name_ku : res.name_ar).toLowerCase().includes(searchQuery.toLowerCase())).map((res) => (
              <div key={res.id} onClick={() => { setSelectedRestaurant(res); setCart([]); }} className="rounded-xl border border-slate-900 bg-[#050507] overflow-hidden cursor-pointer flex h-24 items-center p-2 gap-3 hover:border-slate-700 transition-all">
                <img src={res.cover} alt="" className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-black text-white truncate">{language === 'ku' ? res.name_ku : res.name_ar}</h3>
                  <p className="text-[11px] text-slate-500 mt-1">✨ لۆگۆ: {res.logo}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-900">
            <button onClick={() => { setSelectedRestaurant(null); setCart([]); }} className="text-indigo-400 font-bold text-xs">← گەڕانەوە</button>
            <div className="flex items-center gap-3">
              {cart.length > 0 && (
                <button onClick={() => setShowCartModal(true)} className="px-3 py-1.5 bg-yellow-500 text-black font-black text-xs rounded-lg flex items-center gap-1.5">
                  🛒 سەبەتە ({cart.length})
                </button>
              )}
              <h2 className="text-sm font-black text-white">{selectedRestaurant.name_ku}</h2>
            </div>
          </div>

          {/* 🎙️ دیزاینی شاهانە و مۆدێرنی نیۆن بۆ پانێڵی دەنگی لە سەرووی مێنیو */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-black p-6 border border-indigo-500/20 shadow-2xl shadow-indigo-500/5 text-center space-y-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08),transparent_60%)]"></div>
            
            <div className="relative space-y-1">
              <h3 className="text-sm font-black bg-gradient-to-r from-indigo-200 via-slate-100 to-indigo-200 bg-clip-text text-transparent">✨ KurdAI Pro ✨</h3>
              <p className="text-[11px] text-slate-400">بە یەک دەنگ، چەندین خواردن ڕاستەوخۆ بخەرە ناو سەبەتەکەتەوە</p>
            </div>

            <div className="relative flex justify-center pt-2">
              {isActive ? (
                <button 
                  type="button" 
                  onClick={stopVoiceProcess} 
                  className="group relative flex h-14 items-center gap-3 rounded-full bg-red-500 px-6 font-black text-xs text-white shadow-xl shadow-red-500/20 ring-4 ring-red-500/20 transition-all duration-300 hover:scale-105"
                >
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-20 inset-0"></span>
                  <span className="relative flex h-2 w-2 rounded-full bg-white animate-pulse"></span>
                  <span className="relative">🛑 ڕاگرتن و گەڕان...</span>
                </button>
              ) : (
                <button 
                  type="button" 
                  onClick={startMainVoiceProcess} 
                  disabled={isProcessingAI} 
                  className="group relative flex h-14 items-center gap-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-7 font-black text-xs text-white shadow-xl shadow-indigo-600/20 ring-1 ring-white/10 transition-all duration-300 hover:scale-105 hover:shadow-indigo-600/40 disabled:opacity-50"
                >
                  {isProcessingAI ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>🤖 خەریکی شیکردنەوەی دەنگم...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-base group-hover:animate-bounce">🎙️</span>
                      <span>داواکاری خێرا بە دەنگی کوردی</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {debugError && (
              <div className="relative inline-block mx-auto rounded-lg bg-red-500/5 px-3 py-1 border border-red-500/10 text-[10px] text-red-400 max-w-xs truncate">
                ⚠️ {debugError}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {selectedRestaurant.menu?.map((food, index) => (
              <div key={index} onClick={() => { setFoodToBuy(food); setTempQuantity(1); }} className="bg-slate-950 p-2.5 rounded-xl border border-slate-900 flex items-center gap-3 cursor-pointer hover:border-yellow-500/30 transition-all">
                <img src={food.image} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-slate-200 truncate">{language === 'ku' ? food.name_ku : food.name_ar}</h4>
                  <span className="text-[11px] font-bold text-yellow-500 block mt-1">{food.price_ku}</span>
                </div>
                <span className="text-xs text-indigo-400 font-bold bg-indigo-500/5 px-2 py-1 rounded-lg">➕ زیادکردن</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {foodToBuy && (
        <div className="fixed inset-0 z-[350] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setFoodToBuy(null)}></div>
          <div className="relative bg-[#09090b] border border-slate-800 w-full max-w-sm rounded-2xl p-5 space-y-4 text-right">
            <h3 className="text-sm font-black text-white text-center">{foodToBuy.name_ku}</h3>
            <div className="flex justify-center items-center gap-4 bg-slate-950 p-1 rounded-full border border-slate-800 max-w-[140px] mx-auto">
              <button type="button" onClick={() => setTempQuantity(q => q + 1)} className="w-7 h-7 bg-slate-900 text-white rounded-full font-bold text-xs">＋</button>
              <span className="text-white font-bold text-xs">{tempQuantity}</span>
              <button type="button" onClick={() => setTempQuantity(q => q > 1 ? q - 1 : 1)} className="w-7 h-7 bg-slate-900 text-white rounded-full font-bold text-xs">－</button>
            </div>
            <button type="button" onClick={addToCart} className="w-full py-2.5 bg-yellow-500 text-black font-black text-xs rounded-xl">🛒 بخەرە سەبەتەوە</button>
          </div>
        </div>
      )}

      {showCartModal && (
        <div className="fixed inset-0 z-[350] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowCartModal(false)}></div>
          <div className="relative bg-[#09090b] border border-slate-800 w-full max-w-md rounded-2xl p-5 space-y-4 text-right flex flex-col max-h-[85vh]">
            <h3 className="text-base font-black text-white border-b border-slate-800 pb-2 text-center">🧾 وەسڵی داواکاری</h3>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {cart.map((item, index) => (
                <div key={index} className="bg-slate-950 p-3 rounded-xl border border-slate-900 flex justify-between items-center gap-2">
                  <button onClick={() => removeFromCart(index)} className="text-red-500 text-xs hover:bg-red-500/10 p-1 rounded">🗑️</button>
                  <div className="flex items-center gap-2 bg-black border border-slate-800 px-2 py-1 rounded-full">
                    <button onClick={() => updateCartQuantity(index, 1)} className="text-white font-bold text-xs px-1">＋</button>
                    <span className="text-yellow-500 font-bold text-xs px-1">{item.quantity}</span>
                    <button onClick={() => updateCartQuantity(index, -1)} className="text-white font-bold text-xs px-1">－</button>
                  </div>
                  <div className="flex-1 text-right">
                    <h4 className="text-xs font-bold text-white">{item.food.name_ku}</h4>
                    <span className="text-[10px] text-slate-500">{item.food.price_ku}</span>
                  </div>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-sm font-black text-white">
                <span className="text-yellow-500">{calculateTotal()} دینار</span>
                <span>کۆی گشتی وەسڵ:</span>
              </div>
            )}

            <button type="button" onClick={confirmOrder} disabled={cart.length === 0} className="w-full py-2.5 bg-yellow-500 text-black font-black text-xs rounded-xl">🚀 ناردنی داواکاری وەسڵەکە</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;