/* eslint-disable */
// @ts-nocheck
import React, { useState } from 'react';

interface LandingPageProps {
  onStartChat: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartChat }) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const features = [
    {
      icon: "💬",
      title: "گفتوگۆی ژیر (Chat AI)",
      desc: "وەڵامدانەوەی زیرەکانە بۆ پرسیارەکان، بەرهەمهێنانی کۆد و زانیاری بە کوردی",
      badge: "دەنگی و دەقی",
      color: "from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-300"
    },
    {
      icon: "🎓",
      title: "توێژینەوە و داڕشتنەوە",
      desc: "دروستکردنی پلانی توێژینەوە، پوختەی ئەکادیمی و مرۆڤاندنی دەق دژی AI",
      badge: "ئەکادیمی",
      color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300"
    },
    {
      icon: "📝",
      title: "دروستکەری تاقیکردنەوە",
      desc: "داڕشتنی پرسیاری MCQ، بۆشایی و ڕاست/هەڵە لەسەر مەلزەمە بۆ مامۆستایان",
      badge: "تاقیکردنەوە",
      color: "from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-300"
    },
    {
      icon: "📚",
      title: "فەرهەنگ و وشەی پەتی",
      desc: "گەڕان بەدوای وشەی ڕەسەنی کوردی و هاوواتاکانی لە هەموو شێوەزارەکاندا",
      badge: "زمانناسی",
      color: "from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-300"
    },
    {
      icon: "👑",
      title: "تەلاری کەسایەتییەکان",
      desc: "ئەرشیفی شکۆمەندی مێژوو و ژیاننامەی نەمرانی کورد بە دەنگ و دەق",
      badge: "مێژووی نەتەوەیی",
      color: "from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-300"
    },
    {
      icon: "🖼️",
      title: "پشکنەری وێنە و PDF (OCR)",
      desc: "دەرهێنانی دەقی کوردی لە وێنە، خوێندنەوە و کورتکردنەوەی کتێب و فایل",
      badge: "پشکنەری زیرەک",
      color: "from-cyan-500/20 to-sky-500/10 border-cyan-500/30 text-cyan-300"
    }
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col justify-center items-center relative overflow-hidden select-none p-3 sm:p-6 font-['Noto_Sans_Arabic']" dir="rtl">
      
      {/* 🌌 تیشک و پاشبنەمای نیشتمانی */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* 💎 کارتی سەرەکی پێشوازی */}
      <div className="w-full max-w-lg bg-slate-900/70 border border-slate-800/90 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden relative z-10 flex flex-col justify-between backdrop-blur-2xl transition-all duration-300">
        
        {/* 🟥 سەرپەڕەی کارتەکە */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950/80 via-slate-900/60 to-amber-950/30 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3 text-right">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 p-0.5 shadow-[0_0_20px_rgba(245,158,11,0.3)] shrink-0 flex items-center justify-center">
              <img 
                src="/logo.jpg" 
                alt="KurdAI Logo" 
                className="w-full h-full object-cover rounded-[14px]"
                onError={(e) => {
                  e.currentTarget.src = "/logo.png.jpg";
                }}
              />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-1.5">
                <span>KurdAI Pro</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
                  v2.0
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400 font-medium">
                {currentSlide === 0 ? "پێشوازی و بەخێرهاتن" : "ناسینی خزمەتگوزارییەکان"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-400 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
            <span>{currentSlide + 1}</span>
            <span className="text-zinc-600">/</span>
            <span>2</span>
          </div>
        </div>

        {/* 📜 جەستەی ناوەڕۆک (سڵایدی ١ یان ٢) */}
        <div className="p-5 sm:p-7 flex-1 flex flex-col justify-center">
          
          {/* 🌟 سڵایدی ١: پێشوازی و ناساندنی گشتی */}
          {currentSlide === 0 && (
            <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-300 py-2">
              
              {/* وێنەی درەوشاوەی لۆگۆ بە فڕەیمی شاهانە */}
              <div className="relative inline-block mx-auto">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-1 bg-gradient-to-tr from-red-600 via-amber-500 to-emerald-500 shadow-[0_0_40px_rgba(245,158,11,0.25)] animate-pulse">
                  <div className="w-full h-full bg-slate-950 rounded-[22px] overflow-hidden p-0.5 flex items-center justify-center">
                    <img 
                      src="/logo.jpg" 
                      alt="KurdAI Flag" 
                      className="w-full h-full object-cover rounded-[20px]"
                      onError={(e) => {
                        e.currentTarget.src = "/logo.png.jpg";
                      }}
                    />
                  </div>
                </div>
                <span className="absolute -bottom-2 right-1/2 translate-x-1/2 text-xs font-black bg-slate-900 border border-amber-500/40 text-amber-300 px-3 py-0.5 rounded-full shadow-lg">
                  ☀️ Kurdistan AI
                </span>
              </div>

              {/* ناونیشان و دەقی پێشوازی */}
              <div className="space-y-3">
                <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-yellow-300 tracking-tight">
                  بەخێربێیت بۆ لوتکەی ژیری 👑
                </h1>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium max-w-md mx-auto">
                  پێشکەوتووترین سیستەمی نیشتمانیی ژیریی دەستکرد لە کوردستان. <span className="text-amber-300 font-bold">KurdAI Pro</span> بۆ وەڵامدانەوە، فێربوون، توێژینەوەی زانستی و ئاسانکاریی تەواوی کارەکانت بە زمانی دایک ئامادەکراوە.
                </p>
              </div>

              {/* باجە سەرەکییەکان */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-right">
                <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/80 text-center space-y-1">
                  <span className="text-base block">⚡</span>
                  <span className="text-[11px] font-bold text-zinc-200 block">زۆر خێرا</span>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/80 text-center space-y-1">
                  <span className="text-base block">🇹🇯</span>
                  <span className="text-[11px] font-bold text-zinc-200 block">زمانی کوردی</span>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/80 text-center space-y-1">
                  <span className="text-base block">🎓</span>
                  <span className="text-[11px] font-bold text-zinc-200 block">ئەکادیمی و زیرەک</span>
                </div>
              </div>

            </div>
          )}

          {/* 🌟 سڵایدی ٢: ئاشنابوون بە خزمەتگوزارییەکان */}
          {currentSlide === 1 && (
            <div className="space-y-3.5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-right space-y-1 pb-1">
                <h3 className="text-base sm:text-lg font-black text-white">
                  توانا و بەشە سەرەکییەکان 🌟
                </h3>
                <p className="text-[11px] sm:text-xs text-zinc-400 font-medium">
                  هەموو ئەوەی پێویستتە لە یەک پلاتفۆرمی یەکگرتوودا کۆکراوەتەوە:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                {features.map((item, idx) => (
                  <div 
                    key={idx}
                    className={`p-3 rounded-2xl bg-gradient-to-br ${item.color} border transition-all text-right flex flex-col justify-between space-y-1.5`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-950/60 border border-slate-800 text-zinc-300">
                        {item.badge}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white">{item.title}</h4>
                      <p className="text-[10px] text-zinc-300 leading-snug pt-0.5 font-medium">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* 📊 ژێردەر و دوگمەکانی پەڕینەوە */}
        <div className="p-5 sm:p-6 border-t border-slate-800/80 bg-slate-950/70 flex flex-col gap-3">
          
          {/* هێڵی پەیجینەیشن (Dots) */}
          <div className="flex items-center justify-center gap-2">
            {[0, 1].map((index) => (
              <div
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentSlide === index ? 'w-8 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'w-2 bg-slate-800 hover:bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* دوگمەکان */}
          <div className="flex items-center gap-2 pt-1">
            {currentSlide === 0 ? (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentSlide(1)}
                  className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-2xl text-xs sm:text-sm transition-all shadow-lg active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>ناسینی خزمەتگوزارییەکان</span>
                  <span>←</span>
                </button>

                <button
                  type="button"
                  onClick={onStartChat}
                  className="px-4 py-3.5 bg-slate-900 hover:bg-slate-800 text-zinc-400 hover:text-white font-bold rounded-2xl text-xs transition-all border border-slate-800 active:scale-98 cursor-pointer"
                  title="تێپەڕاندنی ڕاستەوخۆ بۆ چات"
                >
                  تێپەڕاندن ⚡
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onStartChat}
                  className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>🚀</span>
                  <span>دەستپێکردنی کاربەرنامە</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentSlide(0)}
                  className="px-4 py-3.5 bg-slate-900 hover:bg-slate-800 text-zinc-300 hover:text-white font-bold rounded-2xl text-xs transition-all border border-slate-800 active:scale-98 cursor-pointer"
                >
                  → پێشوو
                </button>
              </>
            )}
          </div>

        </div>

      </div>

      {/* مافی پارێزراوە */}
      <div className="mt-4 text-[10px] text-zinc-600 font-medium tracking-wide relative z-10 text-center">
        پەرەپێدراوە بۆ کوردستان • هەموو مافەکانی پارێزراوە © {new Date().getFullYear()}
      </div>

    </div>
  );
};

export default LandingPage;