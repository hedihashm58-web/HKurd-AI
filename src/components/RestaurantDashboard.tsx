/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, updateDoc, where } from 'firebase/firestore';

interface MenuItem {
  name_ku: string;
  name_ar: string;
  price_ku: string;
  price_ar: string;
  image: string;
  category: 'food' | 'drink' | 'dessert';
}

interface Order {
  id: string;
  restaurantId: string;
  foodName: string;
  quantity: number;
  voiceNoteText: string;
  status: 'new' | 'preparing' | 'completed';
  timestamp: string;
}

interface DashboardProps {
  adminEmail: string;
  language: 'ku' | 'ar';
}

const RestaurantDashboard: React.FC<DashboardProps> = ({ adminEmail, language }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentRestaurant, setCurrentRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [audioReady, setAudioReady] = useState(false);

  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');
  const [editingFoodIndex, setEditingFoodIndex] = useState<number | null>(null);
  
  // 🏢 ستەیتەکانی فۆڕمی مێنوو
  const [foodNameKu, setFoodNameKu] = useState('');
  const [foodNameAr, setFoodNameAr] = useState('');
  const [foodPriceKu, setFoodPriceKu] = useState('');
  const [foodPriceAr, setFoodPriceAr] = useState('');
  const [foodCategory, setFoodCategory] = useState<'food' | 'drink' | 'dessert'>('food');
  const [foodImage, setFoodImage] = useState<string>('');
  const [foodMimeType, setFoodMimeType] = useState<string>('image/jpeg'); // 🚀 ڕاستکردنەوە: دروستکردنی ستەیتی پێویست بۆ MimeType

  // ١. هێنانەوەی زانیارییەکانی ڕێستۆرانت بەپێی ئیمەیڵی ئەدمین
  useEffect(() => {
    if (!adminEmail) return;

    const q = query(collection(db, 'restaurants'), where('adminEmail', '==', adminEmail));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const restDoc = snapshot.docs[0];
        setCurrentRestaurant({ id: restDoc.id, ...restDoc.data() });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [adminEmail]);

  // ٢. هێنانەوەی داواکارییەکان (Orders) بە شێوازی لایڤ کاتێک ڕێستۆرانتەکە دۆزرایەوە
  useEffect(() => {
    if (!currentRestaurant?.id) return;

    const q = query(collection(db, 'restaurant_orders'), where('restaurantId', '==', currentRestaurant.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedOrders: Order[] = [];
      snapshot.forEach((doc) => {
        loadedOrders.push({ id: doc.id, ...doc.data() } as Order);
      });
      // ڕێکخستن بەپێی کات (نوێترین لە سەرەوە)
      loadedOrders.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setOrders(loadedOrders);
    });

    return () => unsubscribe();
  }, [currentRestaurant?.id]);

  // ٣. سیستەمی خوێندنەوەی دەقی تێبینی دەنگی (Text to Speech) بۆ ئەدمین
  const speakText = (text: string) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'ku' ? 'ku-CKB' : 'ar-IQ'; 
    utterance.volume = 1.0;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // ٤. گۆڕینی دۆخی داواکارییەکان لە لایەن ئەدمینەوە
  const handleUpdateStatus = async (orderId: string, newStatus: 'preparing' | 'completed') => {
    try {
      await updateDoc(doc(db, 'restaurant_orders', orderId), { status: newStatus });
    } catch (error) {
      console.error("خەتا لە گۆڕینی دۆخی داواکاری:", error);
    }
  };

  // ٥. لۆجیکی بارکردنی وێنەی خواردن لە مۆبایلەوە بە فۆرماتی Base64
  const handleFoodImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFoodMimeType(file.type); // 🚀 ئێستا بە بێ کێشە کار دەکات
      const reader = new FileReader();
      reader.onload = (event) => {
        setFoodImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ٦. دەستپێکردنی قۆناغی دەستکاریکردنی خواردنێک لە مێنوو
  const handleStartEditFood = (food: MenuItem, index: number) => {
    setEditingFoodIndex(index);
    setFoodNameKu(food.name_ku);
    setFoodNameAr(food.name_ar);
    setFoodPriceKu(food.price_ku);
    setFoodPriceAr(food.price_ar);
    setFoodCategory(food.category);
    setFoodImage(food.image);
  };

  // ٧. پاشەکەوتکردنی خواردنی نوێ یان نوێکردنەوەی خواردنی کۆن
  const handleSaveFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant?.id || !foodNameKu || !foodPriceKu) return;

    let updatedMenu = currentRestaurant.menu ? [...currentRestaurant.menu] : [];

    const foodData: MenuItem = {
      name_ku: foodNameKu,
      name_ar: foodNameAr || foodNameKu,
      price_ku: foodPriceKu,
      price_ar: foodPriceAr || foodPriceKu,
      image: foodImage || 'https://via.placeholder.com/100',
      category: foodCategory
    };

    if (editingFoodIndex !== null) {
      // حاڵەتی دەستکاری
      updatedMenu[editingFoodIndex] = foodData;
    } else {
      // حاڵەتی زیادکردنی نوێ
      updatedMenu.push(foodData);
    }

    try {
      await updateDoc(doc(db, 'restaurants', currentRestaurant.id), { menu: updatedMenu });
      alert(language === 'ku' ? "🎉 مێنووەکە بە سەرکەوتوویی نوێکرایەوە!" : "🎉 تم تحديث المنيو بنجاح!");
      
      // پاککردنەوەی فۆڕمەکە
      setEditingFoodIndex(null);
      setFoodNameKu(''); setFoodNameAr('');
      setFoodPriceKu(''); setFoodPriceAr('');
      setFoodImage('');
    } catch (error) {
      console.error("خەتا لە پاشەکەوتکردنی مێنوو:", error);
    }
  };

  // ٨. سڕینەوەی خواردنێک لە مێنووی ڕێستۆرانتەکەتدا
  const handleDeleteMenuItem = async (indexToRemove: number) => {
    if (!currentRestaurant?.id) return;
    const confirmDelete = window.confirm(language === 'ku' ? "⚠️ دڵنیای لە سڕینەوەی ئەم خواردنە لە مێنوو؟" : "⚠️ هل أنت متأكد من حذف هذه الوجبة؟");
    if (!confirmDelete) return;

    const updatedMenu = currentRestaurant.menu.filter((_, idx) => idx !== indexToRemove);

    try {
      await updateDoc(doc(db, 'restaurants', currentRestaurant.id), { menu: updatedMenu });
    } catch (error) {
      console.error("خەتا لە سڕینەوەی خواردن:", error);
    }
  };

  if (loading) {
    return <div className="text-center py-20 font-black text-slate-500 text-xs tracking-widest animate-pulse">KurdAI RESTAURANT DASHBOARD LOADING...</div>;
  }

  if (!currentRestaurant) {
    return (
      <div className="text-center py-20 max-w-md mx-auto space-y-4 px-4" dir="rtl">
        <div className="text-4xl">⚠️</div>
        <h3 className="text-xl font-black text-white font-['Noto_Sans_Arabic']">هیچ ڕێستۆرانتێک نەدۆزرایەوە</h3>
        <p className="text-slate-500 text-xs leading-relaxed font-['Noto_Sans_Arabic']">
          ئەم ئەژمارە وەک ئەدمینی هیچ چێشتخانەیەک لە داتابەیسی KurdAI Pro جێگیر نەکراوە. تکایە دڵنیابەوە لە ئیمەیڵەکەت.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-2 sm:px-4" dir="rtl">
      
      {/* هێدەری دەشبۆرد */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-900/40 p-6 rounded-3xl border border-slate-800 gap-4">
        <div className="text-right space-y-1">
          <h2 className="text-xl sm:text-3xl font-black text-white font-['Noto_Sans_Arabic']">{language === 'ku' ? currentRestaurant.name_ku : currentRestaurant.name_ar}</h2>
          <p className="text-slate-400 text-xs font-medium font-['Noto_Sans_Arabic']">📍 {language === 'ku' ? currentRestaurant.location_ku : currentRestaurant.location_ar} • پانێڵی بەڕێوەبردنی لایڤ</p>
        </div>
        <div className="flex gap-2 bg-black/40 p-1 rounded-xl border border-slate-800 shrink-0">
          <button type="button" onClick={() => setActiveTab('orders')} className={`px-4 py-2 text-xs font-black rounded-lg transition-all ${activeTab === 'orders' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            📥 {language === 'ku' ? 'داواکارییەکان' : 'الطلبات'} ({orders.length})
          </button>
          <button type="button" onClick={() => setActiveTab('menu')} className={`px-4 py-2 text-xs font-black rounded-lg transition-all ${activeTab === 'menu' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            🍔 {language === 'ku' ? 'ڕێکخستنی مێنوو' : 'تعديل المنيو'}
          </button>
        </div>
      </div>

      {activeTab === 'orders' ? (
        /* ================= 📥 تابی داواکارییەکان ================= */
        <div className="space-y-4">
          <div className="text-right px-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-['Noto_Sans_Arabic']">لیستی داواکارییە لایڤەکان (Real-time Feed)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className={`p-5 rounded-2xl border bg-[#050507] transition-all relative overflow-hidden flex flex-col justify-between h-52 ${
                  order.status === 'new' ? 'border-red-500/30 shadow-lg shadow-red-500/[0.02]' :
                  order.status === 'preparing' ? 'border-yellow-500/30 shadow-lg shadow-yellow-500/[0.02]' : 'border-white/5 opacity-40'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-slate-600">ID: {order.id.substring(0, 6)}</span>
                    <span className={`text-[10px] font-black font-['Noto_Sans_Arabic'] px-2 py-0.5 rounded-full ${
                      order.status === 'new' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      order.status === 'preparing' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {order.status === 'new' ? (language === 'ku' ? 'نوێ 🆕' : 'جديد') :
                       order.status === 'preparing' ? (language === 'ku' ? 'خەریکە ئامادە دەبێت 🍳' : 'قيد التحضير') : (language === 'ku' ? 'تەواو بوو ✓' : 'مكتمل')}
                    </span>
                  </div>

                  <div className="text-right">
                    <h3 className="text-lg font-black text-white font-['Noto_Sans_Arabic']">
                      {order.foodName} <span className="text-indigo-400 font-mono text-sm">×{order.quantity}</span>
                    </h3>
                    <p className="text-slate-400 text-xs mt-1 bg-white/[0.02] p-2.5 rounded-xl border border-white/5 italic font-medium leading-relaxed truncate">
                      🗣️ "{order.voiceNoteText || (language === 'ku' ? 'داواکاری بێ دەق' : 'طلب بدون نص')}"
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 border-t border-white/5 pt-3 mt-2">
                  <button 
                    type="button"
                    onClick={() => speakText(order.voiceNoteText)} 
                    className="px-3 bg-white/5 border border-white/10 rounded-xl text-xs hover:bg-white/10 transition-all active:scale-95"
                    title="گوێگرتن لە دەق"
                  >
                    🔊
                  </button>
                  
                  {order.status === 'new' && (
                    <button type="button" onClick={() => handleUpdateStatus(order.id, 'preparing')} className="flex-1 py-2 bg-yellow-500 text-black font-black text-xs rounded-xl shadow-md transition-all active:scale-95 font-['Noto_Sans_Arabic']">
                      {language === 'ku' ? 'دەستپێکردنی ئامادەکردن 🍳' : 'بدء التحضير'}
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button type="button" onClick={() => handleUpdateStatus(order.id, 'completed')} className="flex-1 py-2 bg-emerald-600 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 font-['Noto_Sans_Arabic']">
                      {language === 'ku' ? 'تەواوبوو و ڕادەستکرا ✓' : 'إكمال الطلب وتمليمه'}
                    </button>
                  )}
                  {order.status === 'completed' && (
                    <div className="w-full text-center text-slate-600 text-xs font-bold py-2 font-['Noto_Sans_Arabic']">
                      {language === 'ku' ? 'هەڵگیراوە و کۆتایی پێهاتووە' : 'تم تسليم الطلب بنجاح'}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {orders.length === 0 && (
              <div className="col-span-full text-center py-12 bg-white/[0.01] border border-dashed border-white/5 rounded-2xl text-slate-500 font-bold text-xs font-['Noto_Sans_Arabic']">
                {language === 'ku' ? 'هیچ داواکارییەک لەم ساتەدا بوونی نییە...' : 'لا توجد طلبات في الوقت الحالي...'}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ================= 🍔 تابی بەڕێوەبردنی مێنوو ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* فۆرمی زیادکردن و دەستکاری خواردن */}
          <form onSubmit={handleSaveFood} className="lg:col-span-4 bg-slate-900/20 border border-slate-800 p-5 rounded-2xl space-y-4 text-right">
            <h3 className="text-yellow-500 font-black text-xs uppercase tracking-widest border-b border-white/5 pb-2 font-['Noto_Sans_Arabic']">
              {editingFoodIndex !== null ? (language === 'ku' ? '📝 دەستکاریکردنی خواردن' : '📝 تعديل الوجبة') : (language === 'ku' ? '➕ زیادکردنی خواردنی نوێ' : '➕ إضافة وجبة جديدة')}
            </h3>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase font-['Noto_Sans_Arabic']">ناوی خواردن (کوردی)</label>
              <input type="text" required value={foodNameKu} onChange={e=>setFoodNameKu(e.target.value)} placeholder="بۆ نموونە: کباب، پیتزا" className="w-full bg-black/60 border border-slate-800 text-white rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500 font-['Noto_Sans_Arabic']" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase font-['Noto_Sans_Arabic']">اسم الوجبة (عربي)</label>
              <input type="text" value={foodNameAr} onChange={e=>setFoodNameAr(e.target.value)} placeholder="مثال: كباب، بيتزا" className="w-full bg-black/60 border border-slate-800 text-white rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500 font-['Noto_Sans_Arabic']" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase font-['Noto_Sans_Arabic']">نرخ (کوردی)</label>
                <input type="text" required value={foodPriceKu} onChange={e=>setFoodPriceKu(e.target.value)} placeholder="6,000 دینار" className="w-full bg-black/60 border border-slate-800 text-white rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500 font-['Noto_Sans_Arabic']" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase font-['Noto_Sans_Arabic']">السعر (عربي)</label>
                <input type="text" value={foodPriceAr} onChange={e=>setFoodPriceAr(e.target.value)} placeholder="6,000 دينار" className="w-full bg-black/60 border border-slate-800 text-white rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500 font-['Noto_Sans_Arabic']" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase font-['Noto_Sans_Arabic']">پۆلێنکردن</label>
              <select value={foodCategory} onChange={e=>setFoodCategory(e.target.value as any)} className="w-full bg-black/60 border border-slate-800 text-white rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500 font-['Noto_Sans_Arabic']">
                <option value="food">🍔 {language === 'ku' ? 'خواردنی سەرەکی' : 'وجبة رئيسية'}</option>
                <option value="drink">🍹 {language === 'ku' ? 'خواردنەوەکان' : 'مشروبات'}</option>
                <option value="dessert">🍰 {language === 'ku' ? 'شیرینی و سووکەژەم' : 'حلويات'}</option>
              </select>
            </div>

            <div className="space-y-2 pt-1">
              <label className="text-[10px] font-black text-slate-500 uppercase font-['Noto_Sans_Arabic'] block">وێنەی خواردن</label>
              <input type="file" accept="image/*" onChange={handleFoodImageChange} className="text-[11px] text-slate-400 file:bg-white/5 file:border-0 file:p-1.5 file:rounded-lg file:text-white cursor-pointer" />
              {foodImage && <img src={foodImage} className="w-20 h-20 object-cover rounded-lg border border-slate-800 mt-2" alt="Preview" />}
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-md font-['Noto_Sans_Arabic']">
                🚀 {editingFoodIndex !== null ? (language === 'ku' ? 'پاشەکەوتکردن' : 'حفظ التعديل') : (language === 'ku' ? 'زیادکردنی بابەت' : 'إضافة للقمائمة')}
              </button>
              {editingFoodIndex !== null && (
                <button type="button" onClick={() => { setEditingFoodIndex(null); setFoodNameKu(''); setFoodNameAr(''); setFoodPriceKu(''); setFoodPriceAr(''); setFoodImage(''); }} className="px-4 py-3 bg-white/5 border border-white/10 text-slate-300 rounded-xl text-xs font-bold font-['Noto_Sans_Arabic']">
                  {language === 'ku' ? 'پاشگەزبوونەوە' : 'إلغاء'}
                </button>
              )}
            </div>
          </form>

          {/* نیشاندانی لیستی مێنوو لای چەپ */}
          <div className="lg:col-span-8 space-y-4 text-right">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-['Noto_Sans_Arabic'] px-2">مێنووی ئێستای ڕێستۆرانتەکەت</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {currentRestaurant.menu?.length === 0 ? (
                <p className="col-span-full text-slate-600 text-xs italic text-center py-4 font-['Noto_Sans_Arabic']">مێنیووەکەت چۆڵە! خواردن زیاد بکە.</p>
              ) : (
                currentRestaurant.menu?.map((food: MenuItem, index: number) => (
                  <div key={index} className="bg-slate-950 p-3 rounded-2xl border border-slate-900 flex items-center gap-3 relative group">
                    <img src={food.image} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-white/5" />
                    <div className="flex-1 min-w-0 text-right">
                      <h4 className="text-xs font-bold text-white truncate font-['Noto_Sans_Arabic']">{language === 'ku' ? food.name_ku : food.name_ar}</h4>
                      <p className="text-[11px] font-black text-yellow-500 mt-0.5 font-mono">{language === 'ku' ? food.price_ku : food.price_ar}</p>
                      <span className="text-[9px] text-slate-500 bg-white/[0.02] px-1.5 py-0.5 rounded border border-white/5 mt-1 inline-block font-['Noto_Sans_Arabic']">
                        {food.category === 'food' ? (language === 'ku' ? '🍔 خواردن' : 'وجبة') :
                         food.category === 'drink' ? (language === 'ku' ? '🍹 خواردنەوە' : 'مشروب') : (language === 'ku' ? '🍰 شیرینی' : 'حلويات')}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button type="button" onClick={() => handleStartEditFood(food, index)} className="p-1.5 bg-yellow-500/10 text-yellow-500 rounded-lg text-xs" title="دەستکاری">📝</button>
                      <button type="button" onClick={() => handleDeleteMenuItem(index)} className="p-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs" title="سڕینەوە">🗑️</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default RestaurantDashboard;