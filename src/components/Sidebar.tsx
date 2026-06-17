import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

// دروستکردنی جۆرێک بۆ ناسینەوەی چاتەکان
interface ChatSession {
  id: string;
  title: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void; // فەرمانی نوێ بۆ کردنەوەی چاتە کۆنەکان
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onNewChat, onSelectChat }) => {
  const [chats, setChats] = useState<ChatSession[]>([]);

  // هێنانەوەی لیستی چاتەکان لە فایەربەیس بە شێوەی ڕاستەوخۆ
  useEffect(() => {
    const user = auth.currentUser;
    if (!user?.email) return;

    // ڕیزکردنی ژوورەکان بەپێی کاتی نوێبوونەوەیان (نوێترین لە سەرەوەیە)
    const q = query(
      collection(db, 'users', user.email, 'chats'),
      orderBy('updatedAt', 'desc')
    );

    // onSnapshot وا دەکات هەر کاتێک چاتێکی نوێ دروست بوو، ڕاستەوخۆ بێتە ناو لیستەکەوە بەبێ ڕیفرێش
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title || 'چاتی نوێ...',
      }));
      setChats(chatList);
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-[#020617]/80 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-300"
          onClick={onClose}
        ></div>
      )}

      <div 
        className={`fixed top-0 right-0 h-[100dvh] w-72 bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.5)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`} 
        dir="rtl"
      >
        
        <div className="p-5 border-b border-slate-800/50 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-200 tracking-tight">مێژووی چاتەکان</h2>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-700 active:scale-95 transition-all"
          >
            ✕
          </button>
        </div>

        <div className="p-4">
          <button 
            onClick={onNewChat} 
            className="w-full py-3.5 bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20 active:scale-95"
          >
            <span className="text-xl leading-none mb-1">+</span> چاتی نوێ
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <div className="text-xs text-slate-500 font-bold mb-3 px-2">چاتەکانی پێشوو</div>
          
          {chats.length === 0 ? (
            <div className="text-center text-slate-500 text-sm py-4">هیچ چاتێک نییە</div>
          ) : (
            chats.map(chat => (
              <div 
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className="w-full p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-right text-slate-300 hover:bg-slate-700 cursor-pointer transition-colors"
              >
                <div className="text-sm font-bold truncate">{chat.title}</div>
                <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  کۆتا گفتوگۆ
                </div>
              </div>
            ))
          )}

        </div>
      </div>
    </>
  );
};

export default Sidebar;