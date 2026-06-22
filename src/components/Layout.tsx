import React, { useState } from 'react';
import { View } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: View;
  onViewChange: (view: View) => void;
  backgroundImage?: string;
  language: 'ku' | 'ar';
  setLanguage: React.Dispatch<React.SetStateAction<'ku' | 'ar'>>;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange, backgroundImage, language, setLanguage }) => {
  const [isVaultOpen, setIsVaultOpen] = useState(false);

  // لیستی خزمەتگوزارییەکان بە پێڕستی نوێوە
  const navItems = [
    { 
      id: View.CHAT, 
      label: language === 'ku' ? 'خزمەتگوزاری گفتوگۆ' : 'خدمة المحادثة', 
      icon: '🏛️', 
      desc: language === 'ku' ? 'ژیریی شیکاری و ڕاوێژکاری ئەکادیمی' : 'الذكاء التحليلي والاستشاري الأكاديمي', 
      meta: 'Consultation AI' 
    },
    { 
      id: View.EXPLORE, 
      label: language === 'ku' ? 'نەخشەی کوردستان' : 'خارطة كوردستان', 
      icon: '🗺️', 
      desc: language === 'ku' ? 'گەڕان بەدوای پارێزگاکان و شوێنەوارەکان' : 'استكشاف المحافظات والمعالم التاريخية', 
      meta: 'Spatial AI' 
    },
    { 
      id: View.PERSONALITIES, 
      label: language === 'ku' ? 'کەسایەتییەکانی کورد' : 'شخصيات كوردية', 
      icon: '👥', 
      desc: language === 'ku' ? 'ئاشنابوون بە مێژوو و کەسایەتییە ناودارەکان' : 'التعرف على التاريخ والشخصيات الشهيرة', 
      meta: 'Historical AI' 
    }, 
    { 
      id: View.MATH, 
      label: language === 'ku' ? 'خزمەتگوزاری زانستی' : 'الخدمة العلمية', 
      icon: '📐', 
      desc: language === 'ku' ? 'شیکاریی داتا و هاوکێشە ئاڵۆزەکان' : 'تحليل البيانات والمعادلات المعقدة', 
      meta: 'Analytical AI' 
    },
    { 
      id: View.TRANSLATE, 
      label: language === 'ku' ? 'خزمەتگوزاری زمان' : 'خدمة اللغة الترجمة', 
      icon: '📜', 
      desc: language === 'ku' ? 'وەرگێڕانی فەرمی و پسپۆڕی دیالەکتەکان' : 'الترجمة الرسمية والمتخصصة اللهجات', 
      meta: 'Linguistic AI' 
    },
    { 
      id: View.HEALTH, 
      label: language === 'ku' ? 'خزمەتگوزاری تەندروستی' : 'الخدمة الصحية', 
      icon: '🩺', 
      desc: language === 'ku' ? 'شیکاریی نیشانەکان و زانیاریی دەرمان' : 'تحليل الأعراض ومعلومات الأدوية', 
      meta: 'Medical AI' 
    },
    { 
      id: View.ART, 
      label: language === 'ku' ? 'خزمەتگوزاری داهێنان' : 'خدمة الإبداع الفني', 
      icon: '🎨', 
      desc: language === 'ku' ? 'بەرهەمهێنانی بینراوی کوالیتی بەرز' : 'إنتاج البصريات عالية الجودة', 
      meta: 'Creative AI' 
    },
    { 
      id: View.VIDEO, 
      label: language === 'ku' ? 'پڕۆژەکانی نیشتەجێبوون' : 'المشاريع السكنية', 
      icon: '🏢', 
      desc: language === 'ku' ? 'ڕێبەری گشتی نرخ، قیست و خزمەتگوزاری سیتییەکان' : 'الدليل العام للأسعار، الأقساط وخدمات المجمعات', 
      meta: 'Kurdistan Housing' 
    },
    { 
      id: View.VOICE, 
      label: language === 'ku' ? 'خزمەتگوزاری دەنگی' : 'الخدمة الصوتية', 
      icon: '🔊', 
      desc: language === 'ku' ? 'پەیوەندی دەنگیی ڕاستەوخۆ و پارێزراو' : 'الاتصال الصوتي المباشر والآمن', 
      meta: 'Audio AI' 
    },
  ];

  const handleToolSelect = (id: View) => {
    onViewChange(id);
    setIsVaultOpen(false);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col relative overflow-hidden bg-[#020617] text-slate-200 touch-manipulation" dir="rtl">
      {/* Immersive Background Effect */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 transition-opacity duration-1000">
        {backgroundImage && (
          <img 
            src={backgroundImage} 
            alt="Context" 
            className="w-full h-full object-cover blur-[80px] scale-150"
          />
        )}
      </div>

      {/* Institutional Top Border */}
      <div className="h-1 flex fixed top-0 left-0 right-0 z-[100]">
        <div className="flex-1 bg-red-700"></div>
        <div className="flex-1 bg-slate-100"></div>
        <div className="flex-1 bg-green-800"></div>
      </div>

      <header className="glass-header sticky top-1 z-50 px-4 lg:px-12 py-5 flex justify-between items-center border-b border-white/[0.02] mx-2 lg:mx-6 mt-2 rounded-[2.5rem] shadow-2xl bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-3 lg:gap-6 group cursor-pointer" onClick={() => onViewChange(View.CHAT)}>
          <div className="w-11 h-11 lg:w-14 lg:h-14 rounded-full overflow-hidden border border-slate-700 flex items-center justify-center bg-slate-950/50">
             <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>

          <div className="flex flex-col text-right">
            <h1 className="text-xl lg:text-3xl font-black text-white tracking-tight leading-none">
              KurdAI <span className="text-yellow-500 italic text-xs lg:text-sm ml-1">PRO</span>
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">
                {language === 'ku' ? 'کورد زیندووە' : 'كوردستان حيّة'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            type="button"
            onClick={() => setLanguage(prev => prev === 'ku' ? 'ar' : 'ku')}
            className="px-3.5 py-2.5 bg-slate-950/50 border border-slate-800 hover:border-yellow-500/40 rounded-xl transition-all text-xs font-black text-yellow-500 flex items-center gap-1.5 shadow-md active:scale-95"
          >
            <span>🌐</span>
            <span>{language === 'ku' ? 'العربية' : 'کوردی'}</span>
          </button>

          <button
            onClick={() => setIsVaultOpen(true)}
            className="group flex items-center gap-3 lg:gap-8 px-4 lg:px-10 py-2.5 lg:py-4 bg-slate-800/50 border border-slate-700 rounded-2xl hover:bg-slate-700/60 active:bg-slate-700 transition-all shadow-xl active:scale-[0.98]"
          >
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-black text-white tracking-widest">
                {language === 'ku' ? 'خزمەتگوزارییەکان' : 'الخدمات الذكية'}
              </span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Portal</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-lg">
              ⚡
            </div>
          </button>
        </div>
      </header>

      {/* Service Hub Overlay */}
      {isVaultOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 lg:p-12 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setIsVaultOpen(false)}></div>
          
          <div className="relative w-full max-w-6xl animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">
            <div className="text-center mb-8 sm:mb-12 shrink-0">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                {language === 'ku' ? 'خزمەتگوزارییەکان ' : 'الخدمات ' }
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-indigo-400 to-emerald-400">
                  {language === 'ku' ? 'زیرەکەکان' : 'الذكية'}
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 overflow-y-auto px-2 pb-6 shrink">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleToolSelect(item.id)}
                  className="group relative p-6 bg-slate-900/80 border border-slate-800 rounded-3xl text-right transition-all hover:bg-slate-800 active:bg-slate-700 flex flex-col justify-between h-56 sm:h-64"
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.meta}</span>
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl">
                      {item.icon}
                    </div>
                  </div>
                  <div className="mt-auto pt-4 border-t border-slate-800/50">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-100 mb-2">{item.label}</h3>
                    <p className="text-slate-400 text-xs font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="shrink-0 mt-6 pt-4 text-center">
              <button
                onClick={() => setIsVaultOpen(false)}
                className="mx-auto px-12 py-4 border border-slate-700 rounded-full text-slate-400 font-bold text-xs hover:text-white active:bg-slate-800 transition-all"
              >
                {language === 'ku' ? 'داخستنی پێڕست' : 'إغلاق القائمة'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* بەشی سەرەکی ناوەڕۆک */}
      <main className="flex-1 container mx-auto max-w-[1500px] p-4 lg:p-8 relative z-10">
        {children}
      </main>
    </div>
  );
};

export default Layout;