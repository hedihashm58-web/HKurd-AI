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

  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');
  const [editingFoodIndex, setEditingFoodIndex] = useState<number | null>(null);
  
  const [foodNameKu, setFoodNameKu] = useState('');
  const [foodNameAr, setFoodNameAr] = useState('');
  const [foodPriceKu, setFoodPriceKu] = useState('');
  const [foodImage, setFoodImage] = useState('');
  const [foodCategory, setFoodCategory] = useState<'food' | 'drink' | 'dessert'>('food');

  useEffect(() => {
    if (!adminEmail) return;

    const qRes = query(
      collection(db, 'restaurants'), 
      where('ownerEmail', '==', adminEmail.toLowerCase().trim())
    );
    
    const unsubscribeRes = onSnapshot(qRes, (snapshot) => {
      if (!snapshot.empty) {
        const resDoc = snapshot.docs[0];
        const resData = { id: resDoc.id, ...resDoc.data() };
        setCurrentRestaurant(resData);

        // 🚀 لادانی `orderBy` بۆ ئەوەی لە فایربەیس گیر نەکات و تێک نەچێت
        const qOrders = query(
          collection(db, 'food_orders'), 
          where('restaurantId', '==', resDoc.id)
        );
        
        const unsubscribeOrders = onSnapshot(qOrders, (orderSnapshot) => {
          const loadedOrders: Order[] = [];
          let hasNewOrder = false;
          
          orderSnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.status === 'new') hasNewOrder = true;
            loadedOrders.push({ id: doc.id, ...data } as Order);
          });
          
          // 🚀 ڕیزکردنی داواکارییەکان لێرە دەکرێت بەبێ کێشە
          loadedOrders.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          
          setOrders(loadedOrders);
          setLoading(false);

          if (hasNewOrder) {
            new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-84.wav').play().catch(() => {});
          }
        }, (error) => {
          console.error("Orders Error:", error);
          setLoading(false);
        });

        return () => unsubscribeOrders();
      } else {
        setCurrentRestaurant(null);
        setLoading(false);
      }
    }, (error) => {
      console.error("Restaurant Error:", error);
      setLoading(false);
    });

    return () => unsubscribeRes();
  }, [adminEmail]);

  const handleUpdateStatus = async (orderId: string, newStatus: 'preparing' | 'completed') => {
    try {
      await updateDoc(doc(db, 'food_orders', orderId), { status: newStatus });
    } catch (e) { alert("Error updating order"); }
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

    if (editingFoodIndex !== null) {
      updatedMenu[editingFoodIndex] = newFoodItem;
    } else {
      updatedMenu.push(newFoodItem);
    }

    try {
      await updateDoc(doc(db, 'restaurants', currentRestaurant.id), { menu: updatedMenu });
      alert("خواردنەکە بە سەرکەوتوویی بۆ مێنیووەکەت زیندەکرا!");
      setFoodNameKu(''); setFoodNameAr(''); setFoodPriceKu(''); setFoodImage('');
      setEditingFoodIndex(null);
    } catch (err) { alert("خەتا لە پاشەکەوتکردنی مێنیوو"); }
  };

  const handleDeleteMenuItem = async (indexToDelete: number) => {
    if (!window.confirm("دڵنیای لە سڕینەوەی ئەم خواردنە لە مێنیوو؟")) return;
    const updatedMenu = currentRestaurant.menu.filter((_: any, index: number) => index !== indexToDelete);
    try {
      await updateDoc(doc(db, 'restaurants', currentRestaurant.id), { menu: updatedMenu });
      alert("خوادرنەکە سڕدراوە");
    } catch (err) { alert("خەتا لە کاتی سڕینەوە"); }
  };

  const handleStartEditFood = (food: MenuItem, index: number) => {
    setEditingFoodIndex(index);
    setFoodNameKu(food.name_ku);
    setFoodNameAr(food.name_ar);
    setFoodPriceKu(food.price_ku.replace(/[^\d]/g, ''));
    setFoodImage(food.image);
    setFoodCategory(food.category);
  };

  if (loading) return <div className="min-h-[70vh] flex items-center justify-center bg-black"><div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div></div>;
  
  if (!currentRestaurant) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-black text-white text-center space-y-4 rounded-[3rem] border border-slate-900 p-6">
        <span className="text-6xl">🚫</span>
        <h2 className="text-2xl font-black">ڕێستۆرانتەکەت نەدۆزرایەوە!</h2>
        <p className="text-slate-500 text-xs max-w-sm">ئەم ئیمەیڵە ({adminEmail}) هێشتا بە هیچ ڕێستۆرانتێکەوە نەبەستراوەتەوە لە داتابەیسەکەدا.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 px-4 text-right" dir="rtl">
      
      <div className="text-center space-y-4 border-b border-slate-900 pb-6 pt-6">
        <h2 className="text-3xl font-black text-white">📊 داشبۆردی تایبەتی <span className="text-yellow-500">{currentRestaurant.name_ku}</span></h2>
        <div className="flex justify-center gap-2 max-w-sm mx-auto bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button onClick={() => setActiveTab('orders')} className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'orders' ? 'bg-yellow-500 text-black' : 'text-slate-400'}`}>📥 داواکارییەکان ({orders.length})</button>
          <button onClick={() => setActiveTab('menu')} className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'menu' ? 'bg-yellow-500 text-black' : 'text-slate-400'}`}>🍔 بەڕێوەبردنی مێنیوو</button>
        </div>
      </div>

      {activeTab === 'orders' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.length === 0 ? (
            <div className="col-span-full text-center text-slate-600 text-xs py-12 italic">هیچ داواکارییەک لەم ساتەدا نییە...</div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className={`rounded-3xl border p-6 space-y-4 bg-[#050507] ${order.status === 'new' ? 'border-red-500/30 shadow-lg' : 'border-slate-800'}`}>
                <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                  <span className="text-[10px] text-slate-500">{new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${order.status === 'new' ? 'bg-red-500/10 text-red-500' : 'bg-slate-800 text-slate-400'}`}>{order.status === 'new' ? '🆕 نوێ' : '👨‍🍳 خەریکی ئامادەکردن'}</span>
                </div>
                <h3 className="text-base font-black text-white">{order.foodName} <span className="text-yellow-500">× {order.quantity}</span></h3>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-900"><p className="text-xs text-slate-300 italic">" {order.voiceNoteText} "</p></div>
                <div className="flex gap-2 pt-2">
                  {order.status === 'new' && <button onClick={() => handleUpdateStatus(order.id, 'preparing')} className="w-full py-2 bg-yellow-500 text-black font-black text-xs rounded-xl">👨‍🍳 دەستپێکردن</button>}
                  {order.status === 'preparing' && <button onClick={() => handleUpdateStatus(order.id, 'completed')} className="w-full py-2 bg-emerald-600 text-white font-black text-xs rounded-xl">✅ ئامادەیە</button>}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'menu' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <form onSubmit={handleSaveMenuItem} className="bg-slate-950 p-6 rounded-[2rem] border border-slate-800 space-y-4 max-w-xl mx-auto w-full">
            <h3 className="text-xs font-black text-yellow-500">{editingFoodIndex !== null ? '📝 دەستکاریکردنی خواردن' : '➕ زیادکردنی خواردنی نوێ بۆ مێنیوو'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="text" placeholder="ناوی خواردن (کوردی)" value={foodNameKu} onChange={e=>setFoodNameKu(e.target.value)} className="p-3 bg-black text-white text-xs rounded-xl border border-slate-800 outline-none focus:border-yellow-500" />
              <input type="text" placeholder="اسم الوجبة (عربي)" value={foodNameAr} onChange={e=>setFoodNameAr(e.target.value)} className="p-3 bg-black text-white text-xs rounded-xl border border-slate-800 outline-none focus:border-yellow-500" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input type="text" placeholder="نرخ (بۆ نموونە: 5000)" value={foodPriceKu} onChange={e=>setFoodPriceKu(e.target.value)} className="p-3 bg-black text-white text-xs rounded-xl border border-slate-800 outline-none" />
              <input type="text" placeholder="لینکی وێنە" value={foodImage} onChange={e=>setFoodImage(e.target.value)} className="p-3 bg-black text-white text-xs rounded-xl border border-slate-800 outline-none" />
              <select value={foodCategory} onChange={e=>setFoodCategory(e.target.value as any)} className="p-3 bg-black text-white text-xs rounded-xl border border-slate-800">
                <option value="food">🍔 خواردن</option>
                <option value="drink">🥤 خواردنەوە</option>
                <option value="dessert">🍰 شیرینی</option>
              </select>
            </div>
            <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-md">
              {editingFoodIndex !== null ? '💾 پاشەکەوتکردنی گۆڕانکاری خواردن' : '🚀 زیندەکردنی خواردن بۆ مێنیوو'}
            </button>
          </form>

          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 border-r-2 border-indigo-500 pr-2">🍔 مێنیووی ئێستای ڕێستۆرانتەکەت:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {currentRestaurant.menu?.length === 0 ? (
                <p className="col-span-full text-slate-600 text-xs italic text-center py-6">مێنیووەکەت چۆڵە! خواردن زیاد بکە.</p>
              ) : (
                currentRestaurant.menu?.map((food: MenuItem, index: number) => (
                  <div key={index} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-2 relative group">
                    <div className="w-16 h-16 rounded-full overflow-hidden mx-auto border border-slate-800"><img src={food.image} alt="" className="w-full h-full object-cover" /></div>
                    <h4 className="text-xs font-bold text-white truncate">{food.name_ku}</h4>
                    <p className="text-[11px] font-black text-yellow-500">{food.price_ku}</p>
                    <div className="flex gap-1 pt-1 border-t border-slate-900">
                      <button type="button" onClick={() => handleStartEditFood(food, index)} className="flex-1 py-1 bg-yellow-500/10 text-yellow-500 rounded-md text-[10px] font-bold">📝</button>
                      <button type="button" onClick={() => handleDeleteMenuItem(index)} className="flex-1 py-1 bg-red-500/10 text-red-500 rounded-md text-[10px] font-bold">🗑️</button>
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