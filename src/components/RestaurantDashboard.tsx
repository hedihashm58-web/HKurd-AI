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
  const [audioReady, setAudioReady] = useState(false); // 🔔 بۆ دەربازبوون لە بلۆکی کرۆم

  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');
  const [editingFoodIndex, setEditingFoodIndex] = useState<number | null>(null);
  
  const [foodNameKu, setFoodNameKu] = useState('');
  const [foodNameAr, setFoodNameAr] = useState('');
  const [foodPriceKu, setFoodPriceKu] = useState('');
  const [foodImage, setFoodImage] = useState('');
  const [foodCategory, setFoodCategory] = useState<'food' | 'drink' | 'dessert'>('food');

  useEffect(() => {
    if (!adminEmail) return;

    const qRes = query(collection(db, 'restaurants'), where('ownerEmail', '==', adminEmail.toLowerCase().trim()));
    
    const unsubscribeRes = onSnapshot(qRes, (snapshot) => {
      if (!snapshot.empty) {
        const resDoc = snapshot.docs[0];
        setCurrentRestaurant({ id: resDoc.id, ...resDoc.data() });

        const qOrders = query(collection(db, 'food_orders'), where('restaurantId', '==', resDoc.id));
        const unsubscribeOrders = onSnapshot(qOrders, (orderSnapshot) => {
          const loadedOrders: Order[] = [];
          let hasNewOrder = false;
          
          orderSnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.status === 'new') hasNewOrder = true;
            loadedOrders.push({ id: doc.id, ...data } as Order);
          });
          
          loadedOrders.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setOrders(loadedOrders);
          setLoading(false);

          // 🔔 لێدانی دەنگەکە بە بەکارهێنانی لینکی فەرمی پارێزراو
          if (hasNewOrder) {
            const audio = new Audio('https://notificationsounds.com/storage/sounds/file-sounds-1150-pristine.mpjs'); // لینکێکی نوێ و جێگیر
            audio.play().catch((err) => console.log("Autoplay blocked, waiting for click"));
          }
        });

        return () => unsubscribeOrders();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribeRes();
  }, [adminEmail]);

  const handleUpdateStatus = async (orderId: string, newStatus: 'preparing' | 'completed') => {
    try { await updateDoc(doc(db, 'food_orders', orderId), { status: newStatus }); } catch (e) {}
  };

  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodNameKu || !foodPriceKu || !currentRestaurant) return;

    const newFoodItem: MenuItem = {
      name_ku: foodNameKu,
      name_ar: foodNameAr || foodNameKu,
      price_ku: foodPriceKu + " دینار",
      price_ar: foodPriceKu + " دينار",
      image: foodImage || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400",
      category: foodCategory
    };

    let updatedMenu = [...(currentRestaurant.menu || [])];
    if (editingFoodIndex !== null) { updatedMenu[editingFoodIndex] = newFoodItem; } 
    else { updatedMenu.push(newFoodItem); }

    try {
      await updateDoc(doc(db, 'restaurants', currentRestaurant.id), { menu: updatedMenu });
      setFoodNameKu(''); setFoodNameAr(''); setFoodPriceKu(''); setFoodImage('');
      setEditingFoodIndex(null);
      alert("مێنیوو نوێکرایەوە!");
    } catch (err) {}
  };

  const handleDeleteMenuItem = async (indexToDelete: number) => {
    if (!window.confirm("دڵنیای لە سڕینەوە؟")) return;
    const updatedMenu = currentRestaurant.menu.filter((_: any, index: number) => index !== indexToDelete);
    try { await updateDoc(doc(db, 'restaurants', currentRestaurant.id), { menu: updatedMenu }); } catch (err) {}
  };

  const handleStartEditFood = (food: MenuItem, index: number) => {
    setEditingFoodIndex(index);
    setFoodNameKu(food.name_ku);
    setFoodNameAr(food.name_ar);
    setFoodPriceKu(food.price_ku.replace(/[^\d]/g, ''));
    setFoodImage(food.image);
    setFoodCategory(food.category);
  };

  if (loading) return <div className="min-h-[70vh] flex items-center justify-center bg-black"><div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20 px-4 text-right" dir="rtl" onClick={() => setAudioReady(true)}>
      
      {/* 🔔 نامەی ئاگادارکردنەوە بۆ دەربازبوون لە بلۆکی دەنگی وێبگەڕ */}
      {!audioReady && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-xl text-center text-xs text-yellow-500 animate-pulse">
          👉 تکایە یەک کلیک لەسەر شاشەکە بکە بۆ ئەوەی دەنگی زەنگی داواکارییە نوێیەکان چالاک بێت.
        </div>
      )}

      <div className="text-center space-y-3 border-b border-slate-900 pb-4 pt-4">
        <h2 className="text-xl font-black text-white">📊 بەڕێوەبردنی <span className="text-yellow-500">{currentRestaurant.name_ku}</span></h2>
        <div className="flex justify-center gap-2 max-w-xs mx-auto bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button onClick={() => setActiveTab('orders')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${activeTab === 'orders' ? 'bg-yellow-500 text-black' : 'text-slate-400'}`}>📥 داواکاری ({orders.length})</button>
          <button onClick={() => setActiveTab('menu')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${activeTab === 'menu' ? 'bg-yellow-500 text-black' : 'text-slate-400'}`}>🍔 مێنیوو</button>
        </div>
      </div>

      {activeTab === 'orders' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.length === 0 ? (
            <div className="col-span-full text-center text-slate-600 text-xs py-12 italic">هیچ داواکارییەک لەم ساتەدا نییە...</div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="rounded-xl border border-slate-900 p-4 bg-[#050507] space-y-2">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500">{new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  <span className={`px-2 py-0.5 rounded font-bold ${order.status === 'new' ? 'bg-red-500/10 text-red-500' : 'bg-slate-800 text-slate-400'}`}>{order.status === 'new' ? 'نوێ' : 'ئامادەکردن'}</span>
                </div>
                <h3 className="text-xs font-black text-white">{order.foodName} <span className="text-yellow-500">× {order.quantity}</span></h3>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800"><p className="text-[11px] text-slate-300 italic">" {order.voiceNoteText} "</p></div>
                <div className="flex gap-2 pt-1">
                  {order.status === 'new' && <button onClick={() => handleUpdateStatus(order.id, 'preparing')} className="w-full py-1.5 bg-yellow-500 text-black font-bold text-xs rounded-lg">👨‍🍳 دەستپێکردن</button>}
                  {order.status === 'preparing' && <button onClick={() => handleUpdateStatus(order.id, 'completed')} className="w-full py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-lg">✅ تەواو</button>}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'menu' && (
        <div className="space-y-6">
          <form onSubmit={handleSaveMenuItem} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 max-w-md mx-auto w-full">
            <h3 className="text-xs font-black text-yellow-500">{editingFoodIndex !== null ? '📝 دەستکاریکردنی خواردن' : '➕ زیادکردنی خواردنی نوێ بۆ مێنیوو'}</h3>
            <input type="text" placeholder="ناوی خواردن (کوردی)" value={foodNameKu} onChange={e=>setFoodNameKu(e.target.value)} className="w-full p-2 bg-black text-white text-xs rounded-lg border border-slate-800 outline-none" />
            <input type="text" placeholder="اسم الوجبة (عربي)" value={foodNameAr} onChange={e=>setFoodNameAr(e.target.value)} className="w-full p-2 bg-black text-white text-xs rounded-lg border border-slate-800 outline-none" />
            <input type="text" placeholder="نرخ (بۆ نموونە: 5000)" value={foodPriceKu} onChange={e=>setFoodPriceKu(e.target.value)} className="w-full p-2 bg-black text-white text-xs rounded-lg border border-slate-800 outline-none" />
            <input type="text" placeholder="🔗 لینکی وێنە" value={foodImage} onChange={e=>setFoodImage(e.target.value)} className="w-full p-2 bg-black text-white text-xs rounded-lg border border-slate-800 outline-none" dir="ltr" />
            <select value={foodCategory} onChange={e=>setFoodCategory(e.target.value as any)} className="w-full p-2 bg-black text-white text-xs rounded-lg border border-slate-800 outline-none">
              <option value="food">🍔 خواردن</option>
              <option value="drink">🥤 خواردنەوە</option>
              <option value="dessert">🍰 شیرینی</option>
            </select>
            <button type="submit" className="w-full py-2 bg-indigo-600 text-white font-bold text-xs rounded-lg shadow-md">
              {editingFoodIndex !== null ? '💾 پاشەکەوتکردنی گۆڕانکاری' : '🚀 زیندەکردنی بۆ مێنیوو'}
            </button>
          </form>

          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 border-r-2 border-indigo-500 pr-2">🍔 مێنیووی ئێستای ڕێستۆرانتەکەت:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {currentRestaurant.menu?.length === 0 ? (
                <p className="col-span-full text-slate-600 text-xs italic text-center py-4">مێنیووەکەت چۆڵە! خواردن زیاد بکە.</p>
              ) : (
                currentRestaurant.menu?.map((food: MenuItem, index: number) => (
                  <div key={index} className="bg-slate-950 p-2 rounded-xl border border-slate-900 flex items-center gap-3 relative">
                    <img src={food.image} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{food.name_ku}</h4>
                      <p className="text-[11px] font-black text-yellow-500 mt-0.5">{food.price_ku}</p>
                    </div>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => handleStartEditFood(food, index)} className="p-1 bg-yellow-500/10 text-yellow-500 rounded text-[10px]">📝</button>
                      <button type="button" onClick={() => handleDeleteMenuItem(index)} className="p-1 bg-red-500/10 text-red-500 rounded text-[10px]">🗑️</button>
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