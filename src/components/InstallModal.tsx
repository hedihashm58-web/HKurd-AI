
import React from 'react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 lg:p-10 animate-in fade-in duration-300" dir="rtl">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={onClose}></div>
      
      <div className="relative w-full max-w-4xl bg-[#0c0c0e] border border-white/10 rounded-[3rem] overflow-hidden shadow-3xl animate-in zoom-in-95 duration-300">
        <div className="p-10 lg:p-16 space-y-12">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-yellow-500 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-2xl shadow-yellow-500/20">📲</div>
            <h2 className="text-4xl lg:text-5xl font-black text-white font-['Noto_Sans_Arabic']">دابەزاندنی KurdAI Pro</h2>
            <p className="text-slate-400 font-medium font-['Noto_Sans_Arabic']">چۆن بەرنامەکە بخەیتە سەر شاشەی مۆبایلەکەت؟</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* iOS Guide */}
            <div className="p-8 bg-white/[0.03] border border-white/5 rounded-3xl space-y-6">
              <div className="flex items-center gap-4 flex-row-reverse">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl">🍎</div>
                <h3 className="text-xl font-bold text-white font-['Noto_Sans_Arabic']">بۆ iPhone (iOS)</h3>
              </div>
              <ul className="space-y-4 text-right">
                <li className="flex gap-3 flex-row-reverse text-slate-300 font-['Noto_Sans_Arabic'] text-sm">
                  <span className="text-yellow-500 font-bold">١.</span>
                  وێبگەری Safari بکەرەوە.
                </li>
                <li className="flex gap-3 flex-row-reverse text-slate-300 font-['Noto_Sans_Arabic'] text-sm">
                  <span className="text-yellow-500 font-bold">٢.</span>
                  دوگمەی "Share" (نیشانەی تیرەکە) دابگرە.
                </li>
                <li className="flex gap-3 flex-row-reverse text-slate-300 font-['Noto_Sans_Arabic'] text-sm">
                  <span className="text-yellow-500 font-bold">٣.</span>
                  بگەڕێ بۆ خوارەوە و "Add to Home Screen" هەڵبژێرە.
                </li>
              </ul>
            </div>

            {/* Android Guide */}
            <div className="p-8 bg-white/[0.03] border border-white/5 rounded-3xl space-y-6">
              <div className="flex items-center gap-4 flex-row-reverse">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl">🤖</div>
                <h3 className="text-xl font-bold text-white font-['Noto_Sans_Arabic']">بۆ Android</h3>
              </div>
              <ul className="space-y-4 text-right">
                <li className="flex gap-3 flex-row-reverse text-slate-300 font-['Noto_Sans_Arabic'] text-sm">
                  <span className="text-yellow-500 font-bold">١.</span>
                  وێبگەری Chrome بکەرەوە.
                </li>
                <li className="flex gap-3 flex-row-reverse text-slate-300 font-['Noto_Sans_Arabic'] text-sm">
                  <span className="text-yellow-500 font-bold">٢.</span>
                  سێ خاڵەکەی سەرەوە (Menu) دابگرە.
                </li>
                <li className="flex gap-3 flex-row-reverse text-slate-300 font-['Noto_Sans_Arabic'] text-sm">
                  <span className="text-yellow-500 font-bold">٣.</span>
                  کلیک لەسەر "Install App" یان "Add to Home Screen" بکە.
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col items-center gap-6">
             <p className="text-xs text-slate-500 font-medium font-['Noto_Sans_Arabic'] text-center leading-relaxed">
               بە ئەنجامدانی ئەم هەنگاوانە، بەرنامەکە بە شێوەیەکی فەرمی دەکەوێتە ناو مۆبایلەکەت و خێراتر کار دەکات.
             </p>
             <button 
               onClick={onClose}
               className="px-14 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-yellow-500 transition-all font-['Noto_Sans_Arabic']"
             >
               تێگەیشتم
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallModal;
