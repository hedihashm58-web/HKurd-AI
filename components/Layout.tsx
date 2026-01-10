
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
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#010409] text-slate-200" dir="rtl">
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

      <header className="glass-header sticky top-1 z-50 px-6 lg:px-12 py-6 flex justify-between items-center border-b border-white/[0.02] mx-2 lg:mx-6 mt-2 rounded-[2.5rem] shadow-2xl">
        <div className="flex items-center gap-4 lg:gap-6 group cursor-pointer" onClick={() => onViewChange(View.CHAT)}>
          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl sun-emblem flex items-center justify-center text-2xl lg:text-3xl transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(234,179,8,0.5)] group-hover:rotate-12">
            ☀️
          </div>
          <div className="flex flex-col text-right">
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-none font-['Noto_Sans_Arabic']">
              KurdAI <span className="text-yellow-500 italic text-sm ml-1">PRO</span>
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 status-pulse"></div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] font-['Noto_Sans_Arabic']">سێرڤەر کارایە | نیشتمانی</p>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <button
            onClick={() => setIsVaultOpen(true)}
            className="group flex items-center gap-4 lg:gap-8 px-6 lg:px-10 py-3 lg:py-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl hover:bg-white/[0.06] hover:border-yellow-500/40 transition-all shadow-xl active:scale-95"
          >
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-black text-white font-['Noto_Sans_Arabic'] uppercase tracking-widest">خزمەتگوزارییەکان</span>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest font-['Noto_Sans_Arabic']">Universal Portal</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl group-hover:bg-yellow-500 group-hover:text-black transition-all duration-300">
              ⚡
            </div>
          </button>
        </div>
      </header>

      {/* Service Hub Overlay */}
      {isVaultOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 lg:p-20 animate-in fade-in duration-500">
          <div className="absolute inset-0 bg-[#010409]/98 backdrop-blur-3xl" onClick={() => setIsVaultOpen(false)}></div>
          
          <div className="relative w-full max-w-7xl animate-in zoom-in-95 duration-500">
            <div className="text-center mb-20 space-y-6">
              <div className="text-[10px] font-black text-yellow-500 uppercase tracking-[1em] font-['Noto_Sans_Arabic']">داهاتوویەکی زیرەکتر</div>
              <h2 className="text-5xl lg:text-8xl font-black text-white tracking-tighter font-['Noto_Sans_Arabic']">خزمەتگوزارییە <span className="text-yellow-500">زیرەکەکان</span></h2>
              <div className="h-0.5 w-48 bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent mx-auto mt-8"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-4 max-h-[65vh] overflow-y-auto custom-scrollbar">
              {navItems.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => handleToolSelect(item.id)}
                  className={`group relative p-8 bg-white/[0.01] border border-white/[0.05] rounded-[2.5rem] text-right transition-all hover:bg-white/[0.04] hover:border-yellow-500/30 shadow-2xl flex flex-col justify-between h-64 lg:h-80 overflow-hidden`}
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <div className="flex justify-between items-start">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl group-hover:scale-110 group-hover:text-yellow-500 transition-all duration-500">
                      {item.icon}
                    </div>
                    <span className="text-[9px] font-black text-slate-600 group-hover:text-yellow-500 uppercase tracking-widest font-mono">{item.meta}</span>
                  </div>

                  <div>
                    <h3 className="text-xl lg:text-2xl font-black text-white mb-3 font-['Noto_Sans_Arabic'] group-hover:text-yellow-500 transition-colors">{item.label}</h3>
                    <p className="text-slate-500 text-[11px] font-medium font-['Noto_Sans_Arabic'] leading-relaxed opacity-80">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsVaultOpen(false)}
              className="mt-16 mx-auto block px-20 py-5 border border-white/[0.1] rounded-full text-slate-500 font-black text-[10px] uppercase tracking-[0.6em] hover:text-white hover:border-white/30 transition-all font-['Noto_Sans_Arabic'] bg-white/[0.02]"
            >
              داخستنی پێڕست
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 container mx-auto max-w-[1500px] p-6 lg:p-16 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
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

      {/* Mobile Service Bar - Enhanced for Production */}
      <div className="lg:hidden fixed bottom-10 left-0 right-0 z-50 flex justify-center px-8">
        <button
          onClick={() => setIsVaultOpen(true)}
          className="w-full max-w-sm py-5 bg-[#0a0a0c]/90 border border-white/10 rounded-[2rem] shadow-[0_25px_60px_rgba(0,0,0,0.8)] flex items-center justify-center gap-4 active:scale-95 transition-all backdrop-blur-3xl"
        >
          <span className="text-[11px] font-black text-white uppercase tracking-widest font-['Noto_Sans_Arabic']">پێڕستی خزمەتگوزارییەکان</span>
          <div className="w-9 h-9 rounded-xl bg-yellow-500 text-black flex items-center justify-center text-xl shadow-lg">⚡</div>
        </button>
      </div>
    </div>
  );
};

export default Layout;
