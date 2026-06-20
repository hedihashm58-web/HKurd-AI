import React from 'react';

interface LandingPageProps {
  onStartChat: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartChat }) => {
  return (
    <div className="min-h-screen bg-[#030303] text-white flex flex-col justify-between relative overflow-hidden select-none" dir="rtl">
      {/* ڕووناکی و تەمومژی زێڕینی شاهانە لە باکگراوند */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_center,rgba(212,175,55,0.08)_0,transparent_50%)] z-0" />
      <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-yellow-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* هێدەر / لۆگۆ بە ستایلی گۆڵد */}
      <header className="container mx-auto px-4 md:px-6 py-4 md:py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2 md:gap-3">
          {/* لۆگۆی خڕی براندی ڕوانین */}
          <img 
            src="/logo.png.jpg" 
            alt="Rwanin Logo" 
            className="w-9 h-9 md:w-11 md:h-11 rounded-full object-cover ml-2 md:ml-3 shadow-lg shadow-amber-500/20 border border-amber-300/30 transition-transform duration-300 hover:scale-105" 
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          
          {/* ناوی KurdAI Pro لەناو کارتێکی زێڕینی تاریکدا */}
          <div className="px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-amber-500/5 border border-amber-500/10 backdrop-blur-sm shadow-inner">
            <span className="font-black text-sm md:text-lg tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-100">
              KurdAI Pro
            </span>
          </div>
        </div>
        
        <div className="text-[10px] md:text-sm font-bold text-amber-400 border border-amber-500/30 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-amber-950/20 backdrop-blur-md tracking-widest uppercase">
          کورد زیندووە
        </div>
      </header>

      {/* بەشی سەرەکی - Hero Section */}
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12 flex flex-col items-center text-center my-auto relative z-10 max-w-4xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/5 border border-amber-500/20 text-amber-300 text-[11px] md:text-sm font-extrabold mb-6 md:shadow-sm">
          <span> بەخێربێیت بۆ یەکەمین ژیریی دەستکردی کوردی</span>
        </div>

        {/* ناونیشانی درەوشاوەی زێڕین */}
        <h1 className="text-3xl md:text-6xl font-black leading-tight md:leading-snug mb-6 md:mb-8 tracking-tight text-white">
          هێزی ژیریی دەستکرد لەژێر کۆنتڕۆڵی <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-100 drop-shadow-[0_2px_10px_rgba(212,175,55,0.15)]">
            زمانی شیرینی کوردیدا 
          </span>
        </h1>

        <p className="text-slate-300 text-sm md:text-lg max-w-2xl leading-relaxed mb-10 font-medium px-2 md:px-4 opacity-90">
          سەکۆی <span className="text-amber-400 font-bold">KurdAI Pro</span> نەوەیەکی نوێی ژیریی دەستکردە کە بە وردی و شارەزاییەکی قووڵەوە پەرەی پێدراوە، بۆ ئەوەی ببێتە ڕاوێژکار و یارمەتیدەر و هاوڕێی هەمیشەیی خێزان و پیشەوەرانی کوردستان.
        </p>

        {/* 👑 دوگمەی نوێکراوە: ئێستا باکگراوندەکەی خاوێن و تاریکە، تەنها دێد و دەقەکەی زێڕینی لۆکسن لەگەڵ ڕووناکی کز */}
        <button
          onClick={onStartChat}
          className="group relative px-10 py-4 rounded-xl md:rounded-2xl bg-[#09090b] font-black text-sm md:text-base tracking-wider overflow-hidden transition-all duration-300 border border-amber-500/30 hover:border-amber-400 shadow-lg hover:shadow-amber-500/5 active:scale-98"
        >
          {/* ئەنیمەیشنی درەوشانەوەی نەرم لە کاتی هۆڤەردا */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <span className="relative z-10 flex items-center gap-2 justify-center bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-100 group-hover:from-white group-hover:to-amber-200 transition-colors">
            دەستپێکردنی گفتوگۆی شاهانە
            <span className="text-amber-400 group-hover:translate-x-[-4px] transition-transform duration-300 text-sm"></span>
          </span>
        </button>

        {/* کارتەکان */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 w-full mt-16 md:mt-24 px-1 md:px-0">
          
          <div className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-[#09090b] border border-amber-500/10 text-right backdrop-blur-md hover:border-amber-500/40 transition-all duration-300 group">
            <div className="w-9 h-9 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-amber-500/5 flex items-center justify-center text-base md:text-xl mb-3 md:mb-4 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-black transition-all">
              🗺️
            </div>
            <h4 className="font-bold text-sm md:text-lg mb-1 md:mb-2 text-amber-300">ڕێبەری نەخشە</h4>
            <p className="text-slate-400 text-[11px] md:text-sm leading-relaxed font-medium line-clamp-3 md:line-clamp-none">
              گەشتێک بەناو شار و سروشتی کوردستاندا، ناساندنی سەرجەم شار و گەڕەک و شوێنە گەشتیاریەکان بە زانیاری ناوازەوە.
            </p>
          </div>

          <div className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-[#09090b] border border-amber-500/10 text-right backdrop-blur-md hover:border-amber-500/40 transition-all duration-300 group">
            <div className="w-9 h-9 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-amber-500/5 flex items-center justify-center text-base md:text-xl mb-3 md:mb-4 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-black transition-all">
              👥
            </div>
            <h4 className="font-bold text-sm md:text-lg mb-1 md:mb-2 text-amber-300">کەسایەتییەکانی کورد</h4>
            <p className="text-slate-400 text-[11px] md:text-sm leading-relaxed font-medium line-clamp-3 md:line-clamp-none">
              ناسینی شاعیران و سەرکردە کاریگەرەکانی گەلی کورد کە داهێنەربوون لە مێژوودا.
            </p>
          </div>

          <div className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-[#09090b] border border-amber-500/10 text-right backdrop-blur-md hover:border-amber-500/40 transition-all duration-300 group">
            <div className="w-9 h-9 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-amber-500/5 flex items-center justify-center text-base md:text-xl mb-3 md:mb-4 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-black transition-all">
              ⚜️
            </div>
            <h4 className="font-bold text-sm md:text-lg mb-1 md:mb-2 text-amber-300">زمان و فێربوون</h4>
            <p className="text-slate-400 text-[11px] md:text-sm leading-relaxed font-medium line-clamp-3 md:line-clamp-none">
              توانایەکی بێهاوتا لە وەرگێڕانی دەقەکان, داڕشتنی گوتار و وەڵامدانەوەی پرسیارە زانستییەکان بە کوردی.
            </p>
          </div>

          <div className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-[#09090b] border border-amber-500/10 text-right backdrop-blur-md hover:border-amber-500/40 transition-all duration-300 group">
            <div className="w-9 h-9 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-amber-500/5 flex items-center justify-center text-base md:text-xl mb-3 md:mb-4 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-black transition-all">
              👑
            </div>
            <h4 className="font-bold text-sm md:text-lg mb-1 md:mb-2 text-amber-300">داهێنان و کار</h4>
            <p className="text-slate-400 text-[11px] md:text-sm leading-relaxed font-medium line-clamp-3 md:line-clamp-none">
              هاوکاریت دەکات لە بیرۆکەدانان بۆ پڕۆژەکان، نووسین و لێکدانەوەی هاوکێشە بیرکاری و ئەندازیارییەکان.
            </p>
          </div>

        </div>
      </main>

      {/* فووتەر */}
      <footer className="container mx-auto px-6 py-4 text-center text-amber-500/40 text-[10px] md:text-xs relative z-10 border-t border-amber-500/5 font-medium tracking-wide">
        پەرەپێدراوە لەلایەن هێدی بۆ کوردستان • مافی کۆپیکردن پارێزراوە بۆ ڕوانین © {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default LandingPage;