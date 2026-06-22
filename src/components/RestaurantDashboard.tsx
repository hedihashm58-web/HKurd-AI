import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, updateDoc, orderBy, where } from 'firebase/firestore';

interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  foodName: string;
  quantity: number;
  voiceNoteText: string;
  status: 'new' | 'preparing' | 'completed';
  timestamp: string;
}

const initialRestaurantsData = [
  { id: "res_1", name_ku: "ڕێستۆرانتی تەپەی دووپشک", adminEmail: "🦂hedi@restaurant.com" },
  { id: "res_2", name_ku: "داون تاون فاست فوود", adminEmail: "🍔hedi@restaurant.com" }
];

interface DashboardProps {
  adminEmail: string;
  language: 'ku' | 'ar';
}

const RestaurantDashboard: React.FC<DashboardProps> = ({ adminEmail, language }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const restaurant = initialRestaurantsData.find(r => r.adminEmail === adminEmail);
    
    if (restaurant) {
      setRestaurantName(restaurant.name_ku);
      
      const q = query(
        collection(db, 'food_orders'), 
        where('restaurantId', '==', restaurant.id), 
        orderBy('timestamp', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const loadedOrders: Order[] = [];
        let hasNewOrder = false;

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.status === 'new') {
            hasNewOrder = true;
          }
          loadedOrders.push({ id: doc.id, ...data } as Order);
        });

        setOrders(loadedOrders);
        setLoading(false);

        if (hasNewOrder) {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-84.wav');
          audio.play().catch(e => console.log("Audio deferred"));
        }
      });

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [adminEmail, language]);

  const handleUpdateStatus = async (orderId: string, newStatus: 'preparing' | 'completed') => {
    try {
      const orderRef = doc(db, 'food_orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
    } catch (e) {
      alert("Error updating order");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-black p-10 rounded-[3rem] border border-slate-900 text-center">
        <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!restaurantName) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-black p-10 rounded-[3rem] border border-slate-900 text-center space-y-4">
        <span className="text-7xl">🚫</span>
        <h2 className="text-3xl font-black text-white">{language === 'ku' ? 'ڕێستۆرانت نەدۆزرایەوە!' : 'المطعم غير موجود!'}</h2>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest max-w-sm">
          تۆ ڕێپێدراو نیت بۆ بینینی هیچ داشبۆردێک.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 px-4 text-right" dir="rtl">
      <div className="text-center space-y-2 border-b border-slate-900 pb-6">
        <h2 className="text-3xl font-black text-white">📊 داشبۆردی لایڤی <span className="text-yellow-500">{restaurantName}</span></h2>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">تۆ لەژێر ئیمەیڵی {adminEmail} لۆگین بوویت</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.length === 0 ? (
          <div className="col-span-full text-center text-slate-600 text-xs py-12 italic">هیچ داواکارییەک لەم ساتەدا نییە...</div>
        ) : (
          orders.map((order) => (
            <div 
              key={order.id} 
              className={`rounded-3xl border p-6 space-y-4 transition-all bg-[#050507] ${
                order.status === 'new' ? 'border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.05)]' :
                order.status === 'preparing' ? 'border-yellow-500/30' : 'border-slate-800 opacity-60'
              }`}
            >
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <span className="text-[10px] font-mono text-slate-500">{new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                  order.status === 'new' ? 'bg-red-500/10 text-red-500' :
                  order.status === 'preparing' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-slate-800 text-slate-400'
                }`}>
                  {order.status === 'new' ? '🆕 نوێ' : order.status === 'preparing' ? '👨‍🍳 خەریکی ئامادەکردن' : '✅ تەواوبووە'}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-black text-white">{order.foodName} <span className="text-yellow-500">× {order.quantity}</span></h3>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-900">
                <span className="text-[10px] font-black text-slate-500 block mb-1">🎙️ دەقی داواکاری دەنگی:</span>
                <p className="text-xs text-slate-300 italic">"{order.voiceNoteText}"</p>
              </div>

              <div className="flex gap-2 pt-2">
                {order.status === 'new' && (
                  <button 
                    onClick={() => handleUpdateStatus(order.id, 'preparing')}
                    className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black font-black text-xs rounded-xl transition-all"
                  >
                    👨‍🍳 دەستپێکردنی ئامادەکردن
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button 
                    onClick={() => handleUpdateStatus(order.id, 'completed')}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition-all"
                  >
                    ✅ داواکاری ئامادەیە
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RestaurantDashboard;