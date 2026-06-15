import React, { useState } from 'react';
import { View } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: View;
  onViewChange: (view: View) => void;
  backgroundImage?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange, backgroundImage }) => {
  const [isVaultOpen, setIsVaultOpen] = useState(false);

  const navItems = [
    { id: View.CHAT, label: 'خزمەتگوزاری گفتوگۆ', icon: '🏛️', desc: 'ژیریی شیکاری و ڕاوێژکاری ئەکادیمی', meta: 'Consultation AI' },
    { id: View.EXPLORE, label: 'نەخشەی کوردستان', icon: '🗺️', desc: 'گەڕان بەدوای پارێزگاکان و شوێنەوارەکان', meta: 'Spatial AI' },
    { id: View.MATH, label: 'خزمەتگوزاری زانستی', icon: '📐', desc: 'شیکاریی داتا و هاوکێشە ئاڵۆزەکان', meta: 'Analytical AI' },
    { id: View.TRANSLATE, label: 'خزمەتگوزاری زمان', icon: '📜', desc: 'وەرگێڕانی فەرمی و پسپۆڕی دیالەکتەکان', meta: 'Linguistic AI' },
    { id: View.HEALTH, label: 'خزمەتگوزاری تەندروستی', icon: '🩺', desc: 'شیکاریی نیشانەکان و زانیاریی دەرمان', meta: 'Medical AI' },
    { id: View.ART, label: 'خزمەتگوزاری داهێنان', icon: '🎨', desc: 'بەرهەمهێنانی بینراوی کوالیتی بەرز', meta: 'Creative AI' },
    { id: View.VIDEO, label: 'خزمەتگوزاری ڤیدیۆ', icon: '🎥', desc: 'ڕێندەرکردنی ڤیدیۆی سینەمایی و فەرمی', meta: 'Multimedia AI' },
    { id: View.VOICE, label: 'خزمەتگوزاری دەنگی', icon: '🔊', desc: 'پەیوەندی دەنگیی ڕاستەوخۆ و پارێزراو', meta: 'Audio AI' },
  ];

  const handleToolSelect = (id: View) => {
    onViewChange(id);
    setIsVaultOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#020617] text-slate-200" dir="rtl">
      {/* Immersive Background Effect */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 transition-opacity duration-1000">
        {backgroundImage && (
          <img 
            src={backgroundImage} 
            alt="Context" 
            className="w-full h-full object-cover blur-[120px] scale-150"
          />
        )}
      </div>

      {/* Institutional Top Border */}
      <div className="h-1 flex fixed top-0 left-0 right-0 z-[100]">
        <div className="flex-1 bg-red-700"></div>
        <div className="flex-1 bg-slate-100"></div>
        <div className="flex-1 bg-green-800"></div>
      </div>

      <header className="glass-header sticky top-1 z-50 px-6 lg:px-12 py-6 flex justify-between items-center border-b border-white/[0.02] mx-2 lg:mx-6 mt-2 rounded-[2.5rem] shadow-2xl bg-slate-900/60 backdrop-blur-xl">
        <div className="flex items-center gap-4 lg:gap-6 group cursor-pointer" onClick={() => onViewChange(View.CHAT)}>
          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl sun-emblem flex items-center justify-center text-2xl lg:text-3xl transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(234,179,8,0.5)] group-hover:rotate-12 bg-yellow-500/10 border border-yellow-500/20">
            ☀️
          </div>
          <div className="flex flex-col text-right">
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-none font-['Noto_Sans_Arabic']">
              KurdAI <span className="text-yellow-500 italic text-sm ml-1">PRO</span>
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 status-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] font-['Noto_Sans_Arabic']">سێرڤەر کارایە | نیشتمانی</p>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <button
            onClick={() => setIsVaultOpen(true)}
            className="group flex items-center gap-4 lg:gap-8 px-6 lg:px-10 py-3 lg:py-4 bg-slate-800/50 border border-slate-700 rounded-2xl hover:bg-slate-700/60 hover:border-indigo-500/40 transition-all shadow-xl active:scale-95"
          >
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-black text-white font-['Noto_Sans_Arabic'] tracking-widest">خزمەتگوزارییەکان</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono">Universal Portal</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
              ⚡
            </div>
          </button>
        </div>
      </header>

      {/* Service Hub Overlay (The Vault) */}
      {isVaultOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 lg:p-12 animate-in fade-in duration-300">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl" onClick={() => setIsVaultOpen(false)}></div>
          
          <div className="relative w-full max-w-6xl animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">
            
            {/* Header part of the overlay - قەبارەی دەقەکە لێرەدا بچووک کراوەتەوە */}
            <div className="text-center mb-8 sm:mb-12 shrink-0">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-['Noto_Sans_Arabic']">
                خزمەتگوزارییەکان <span className="text-transparent bg-clip-text bg-gradient-to-l from-indigo-400 to-emerald-400">زیرەکەکان</span>
              </h2>
              <div className="h-1 w-16 bg-gradient-to-r from-transparent via-indigo-500 to-transparent mx-auto mt-4 rounded-full"></div>
            </div>

            {/* The Grid of Services with Custom Thin Scrollbar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 overflow-y-auto px-2 pb-6 shrink scroll-smooth [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-600">
              {navItems.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => handleToolSelect(item.id)}
                  className="group relative p-6 bg-slate-900/60 border border-slate-800 rounded-3xl text-right transition-all hover:bg-slate-800 hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] flex flex-col justify-between h-56 sm:h-64 overflow-hidden"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="text-[10px] font-black text-slate-500 group-hover:text-indigo-400 uppercase tracking-widest font-mono transition-colors">{item.meta}</span>
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/30 transition-all duration-300">
                      {item.icon}
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-800/50 group-hover:border-indigo-500/20 transition-colors">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-100 mb-2 font-['Noto_Sans_Arabic'] group-hover:text-indigo-300 transition-colors">{item.label}</h3>
                    <p className="text-slate-400 text-xs font-medium font-['Noto_Sans_Arabic'] leading-relaxed">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Close button area */}
            <div className="shrink-0 mt-6 pt-4 text-center">
              <button
                onClick={() => setIsVaultOpen(false)}
                className="mx-auto px-12 py-4 border border-slate-700 rounded-full text-slate-400 font-bold text-xs hover:text-white hover:bg-slate-800 hover:border-slate-500 transition-all font-['Noto_Sans_Arabic'] shadow-lg"
              >
                داخستنی پێڕست
              </button>
            </div>

          </div>
        </div>
      )}

      <main className="flex-1 container mx-auto max-w-[1500px] p-4 lg:p-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {children}
      </main>

      {/* Production Footer Section */}
      <footer className="relative z-10 bg-black/50 border-t border-white/[0.04] py-16 px-10 mt-24 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start text-center md:text-right">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl sun-emblem flex items-center justify-center text-lg">☀️</div>
              <span className="text-2xl font-black text-white font-['Noto_Sans_Arabic'] tracking-tight">KurdAI Pro</span>
            </div>
            <p className="text-slate-500 text-xs font-medium font-['Noto_Sans_Arabic'] leading-relaxed max-w-sm">
              گەورەترین پلاتفۆرمی نیشتمانی بۆ گەشەپێدانی تواناکانی مرۆیی و زانیارییە کولتوورییەکان لە ڕێگەی ژیریی دەستکردەوە. هەموو مافەکان پارێزراون بۆ گەشەپێدەر.
            </p>
          </div>

          <div className="flex gap-20">
            <div className="flex flex-col items-center md:items-end">
              <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-4 font-['Noto_Sans_Arabic']">گەشەپێدەر</span>
              <span className="text-base font-bold text-white font-['Noto_Sans_Arabic'] tracking-wide">هێدی هاشم فەتاح</span>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 font-['Noto_Sans_Arabic']">وەشان</span>
              <span className="text-base font-mono font-bold text-white">V3.5.0-PRO</span>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-4">
             <div className="flex gap-5">
                <span className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl hover:bg-white/10 cursor-pointer transition-all border border-white/5" title="Security">🛡️</span>
                <span className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl hover:bg-white/10 cursor-pointer transition-all border border-white/5" title="Privacy">⚖️</span>
                <span className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl hover:bg-white/10 cursor-pointer transition-all border border-white/5" title="Network">🌐</span>
             </div>
             <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em] font-['Noto_Sans_Arabic']">Kurdistan AI Research Lab</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/[0.02] text-center">
           <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.8em]">Powered by Gemini 3 Neural Engines & VEO 3.1 Multimedia</p>
        </div>
      </footer>

      {/* Mobile Service Bar */}
      <div className="lg:hidden fixed bottom-6 left-0 right-0 z-50 flex justify-center px-6">
        <button
          onClick={() => setIsVaultOpen(true)}
          className="w-full max-w-sm py-4 bg-slate-900 border border-slate-700 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center justify-center gap-4 active:scale-95 transition-all"
        >
          <span className="text-sm font-bold text-white font-['Noto_Sans_Arabic']">پێڕستی خزمەتگوزارییەکان</span>
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg">⚡</div>
        </button>
      </div>
    </div>
  );
};

export default Layout;