/* eslint-disable */
// @ts-nocheck
import React, { useState } from 'react';

interface LandingPageProps {
  onStartChat: () => void;
}

interface ServiceCard {
  title: string;
  icon: string;
  normal: string;
  premium: string;
  color: string;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartChat }) => {
  const [currentSlide, setCurrentStep] = useState(0);

  // 👑 لیستی تەواوی ١٤ خزمەتگوزارییەکە بە جیاکاری وردی ئاسایی و پریمیم
  const allServices: ServiceCard[] = [
    // سڵایدی ١: چات، زمان و ڕێنووس
    { title: "خزمەتگوزاری گفتوگۆ (Chat AI)", icon: "🏛️", normal: "١٠ نامە لە ڕۆژێکدا ⏳", premium: "بێ سنوور + خێراتر 👑", color: "from-amber-400 to-yellow-500" },
    { title: "خزمەتگوزاری زمان", icon: "🗣️", normal: "ئاسایی و ستاندارد 🌟", premium: "پێشکەوتوو و بێ لێمیت 🔥", color: "from-blue-400 to-indigo-500" },
    { title: "ڕێنووسی کوردی (Grammar)", icon: "✨", normal: "تەنها ٣ پشکنین (بۆ هەمیشە) 🔒", premium: "بە تەواوی فڕی و بێ سنوور 🚀", color: "from-rose-400 to-red-500" },
    
    // سڵایدی ٢: کورتکردنەوە و شیکاری
    { title: "کورتکەرەوەی فایل (PDF)", icon: "📘", normal: "تەنها ٢ فایل (بۆ هەمیشە) 🔒", premium: "پلانی مانگانە: ١٥ فایل 🗓️ | پلانەکانی تر: بێسنوور 👑", color: "from-emerald-400 to-teal-500" },
    { title: "کورتکەرەوەی وێب (لینک)", icon: "🔗", normal: "تەنها ٣ لینک (بۆ هەمیشە) ⏳", premium: "پلانی مانگانە: ١٥ لینک 🗓️ | پلانەکانی تر: بێسنوور 🚀", color: "from-yellow-400 to-amber-500" },
    { title: "خزمەتگوزاری زانستی", icon: "🎯", normal: "کۆنتڕۆڵکراو بە لێمیتی چات 🧬", premium: "بەرزترین کوالێتی و بێ سنوور 👑", color: "from-cyan-400 to-blue-500" },
    
    // سڵایدی ٣: بازرگانی، داهێنان و فلاشکارت
    { title: "داڕشتنی پۆست (Social)", icon: "✍️", normal: "تەنها ٥ پۆست (بۆ هەمیشە) 📱", premium: "پلانی مانگانە: ١٥ پۆست 🗓️ | پلانەکانی تر: بێسنوور 🔥", color: "from-indigo-400 to-purple-500" },
    { title: "خزمەتگوزاری داهێنان (Art)", icon: "🎨", normal: "داخراوە بۆ یوزەری ئاسایی 🔒", premium: "دروستکردنی وێنەی ڕۆژانە بەپێی جۆری پلانەکە 🎨", color: "from-orange-400 to-amber-500" },
    { title: "فلاشکارتی زمان", icon: "🧠", normal: "١ فلاشکارت لە ڕۆژێکدا ⏳", premium: "پلانی مانگانە: ٣ دانە لە ڕۆژێکدا 📆 | پلانەکانی تر: بێسنوور 👑", color: "from-purple-400 to-pink-500" },

    // سڵایدی ٤: کلتور و منداڵان
    { title: "خزمەتگوزاری کەسایەتییەکان", icon: "👥", normal: "بە تەواوی فڕی و کراوەیە ✨", premium: "بە تەواوی فڕی و کراوەیە ✨", color: "from-amber-400 to-yellow-600" },
    { title: "ژیریی منداڵان 🧸", icon: "🧸", normal: "کۆنتڕۆڵکراو بە لێمیتی چات 🎈", premium: "١ مانگ: لێمیتی ڕۆژانە ⏳ | پلانەکانی تر: بێسنوور 👑", color: "from-pink-400 to-rose-500" },

    // سڵایدی ٥: داهاتوو، نەخشە و پشتیوانی
    { title: "نەخشەی کوردستان", icon: "🗺️", normal: "کراوەیە بۆ گەڕان لە شوێنەوارەکان 🗺️", premium: "کراوەیە بۆ گەڕان لە شوێنەوارەکان 🗺️", color: "from-teal-400 to-emerald-600" },
    { title: "تێبینی و ڕاپۆرت", icon: "📥", normal: "بێ لێمیتە (ناردنی پێشنیارەکان) 📥", premium: "بێ لێمیتە (ناردنی پێشنیارەکان) 📥", color: "from-red-400 to-rose-500" },
    { title: "خزمەتگوزاری دەنگی (بەم زوانە)", icon: "🎙️", normal: "ناچالاکە 🔒", premium: "بەم زوانە بۆ پریمیم چالاک دەکرێت! 🎙️", color: "from-indigo-400 to-cyan-500" }
  ];

  const slidesData = [
    { title: "بەخێربێیت بۆ KurdAI Pro 👑", desc: "پێشکەوتووترین کاربەرنامەی نیشتمانیی ژیریی دەستکرد لە کوردستان.", services: [] },
    { title: "چات، زمان و ڕێنووس 🗣️", desc: "سەرەتای گەشتەکە لەگەڵ مێشکی کوردیی KurdAI Pro.", services: allServices.slice(0, 3) },
    { title: "شیکاری، کورتکردنەوە و زانست 📘", desc: "ئامرازە زیرەکەکان بۆ خێراکردنی خوێندنەوە و توێژینەوە.", services: allServices.slice(3, 6) },
    { title: "مارکێتینگ، داهێنان و فلاشکارت 🎨", desc: "پەرەپێدانی بزنس و فێربوونی زمان بە شێوازی مۆدێرن.", services: allServices.slice(6, 9) },
    { title: "کلتور و ژیریی منداڵان 🧸", desc: "جاهانی تایبەتی پەروەردەی منداڵان و ناسنامەی نیشتمانی.", services: allServices.slice(9, 11) },
    { title: "پشتیوانی، نەخشە و داهاتووی دەنگی 🎙️", desc: "نوێکارییە بەردەوامەکان و گەڕان بەناو شوێنەوارەکان.", services: allServices.slice(11, 14) }
  ];

  const activeSlide = slidesData[currentSlide];
  const isLastStep = currentSlide === slidesData.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onStartChat();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white flex flex-col justify-center items-center relative overflow-hidden select-none p-4" dir="rtl">
      {/* 🌌 تەمومژی شاهانە لە باکگراونددا */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.04)_0,transparent_60%)] z-0" />
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-amber-500/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-yellow-600/5 rounded-full blur-[130px] pointer-events-none" />

      {/* 💎 کارتی سەرەکی پێشوازی */}
      <div className="w-full max-w-md bg-[#0d0d11] border border-zinc-800/80 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden relative z-10 flex flex-col justify-between min-h-[640px] transition-all duration-300">
        
        {/* 🟥 هێدەری کارتەکە */}
        <div className="p-6 bg-gradient-to-b from-amber-600/15 to-amber-950/5 border-b border-zinc-900/60 relative overflow-hidden flex justify-between items-center min-h-[120px]">
          <div className="space-y-1 max-w-[75%] text-right">
            <h2 className="text-base font-black text-white font-['Noto_Sans_Arabic'] tracking-tight">
              {activeSlide.title}
            </h2>
            <p className="text-zinc-500 text-[11px] font-medium leading-relaxed">
              {activeSlide.desc}
            </p>
          </div>

          {/* 🔘 لۆگۆی فەرمی بەرنامەکەت بە شێوازی بازنەیی (خڕ) */}
          <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 shrink-0 overflow-hidden shadow-xl">
            <img 
              src="/logo.png.jpg" 
              alt="Logo" 
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML = "<div className='text-amber-400 font-black text-xs'>AI</div>";
              }}
            />
          </div>
        </div>

        {/* 📜 ناوەڕۆک */}
        <div className="p-5 flex-1 flex flex-col justify-center space-y-3.5">
          
          {/* ئەگەر لاپەڕەی یەکەم بوو (پێشوازی و بەخێرهاتن) */}
          {currentSlide === 0 && (
            <div className="text-center py-6 space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="w-24 h-24 mx-auto rounded-full bg-zinc-950 border border-zinc-900 flex items-center justify-center p-1 shadow-2xl relative group overflow-hidden">
                <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-xl opacity-70" />
                <img 
                  src="/logo.png.jpg" 
                  alt="KurdAI Pro Welcome" 
                  className="w-full h-full object-cover rounded-full relative z-10 border border-zinc-800/80 shadow-inner"
                />
              </div>
              <div className="space-y-2.5">
                <h1 className="text-2xl font-black bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-100 text-transparent">بەخێربێیت بۆ لوتکەی ژیری 👑</h1>
                <p className="text-zinc-400 text-xs leading-[1.8] font-medium max-w-sm mx-auto">
                  سوپاس بۆ چالاککردنی ئەکاونتەکەت لە سیستەمی نیشتمانیی <span className="text-amber-400 font-bold">KurdAI Pro</span>. تکایە سڵایدەکانی دواتر تەماشا بکە تا بە تەواوی ئاشنای لێمیت و خزمەتگوزارییەکان بیت پێش چوونە ژوورەوە.
                </p>
              </div>
            </div>
          )}

          {/* ئەگەر لاپەڕەکانی تری خزمەتگوزاری بوو */}
          {currentSlide > 0 && activeSlide.services.map((service, idx) => (
            <div 
              key={idx} 
              className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/70 hover:border-zinc-700/80 transition-all duration-150 flex flex-col space-y-2.5 text-right animate-in slide-in-from-right-4 duration-300"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${service.color} bg-opacity-10 flex items-center justify-center text-xs shadow-inner shrink-0`}>
                  {service.icon}
                </div>
                <span className="text-xs font-black text-zinc-100">{service.title}</span>
              </div>

              <div className="grid grid-cols-1 gap-1.5 border-t border-zinc-900/80 pt-2 text-[11px] font-medium">
                <div className="flex items-center gap-1 text-zinc-400">
                  <span className="text-zinc-600 text-[9px]">⚪</span>
                  <span><strong>ئاسایی:</strong> {service.normal}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  <span className="text-amber-600 text-[9px]">👑</span>
                  <span><strong>پریمیم:</strong> {service.premium}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 📊 فووتەری کارتەکە - خاڵەکانی Pagination و دوگمەی ڕێڕەو (RTL) */}
        <div className="p-6 border-t border-zinc-900/80 flex flex-col items-center gap-4 bg-zinc-950/20">
          
          <div className="flex flex-row-reverse items-center gap-1.5">
            {slidesData.map((_, index) => (
              <div
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${currentSlide === index ? 'w-5 bg-amber-500' : 'w-1.5 bg-zinc-700 hover:bg-zinc-600'}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className={`w-full py-3.5 rounded-xl font-black text-xs tracking-wider transition-all duration-200 border transform active:scale-[0.98] ${isLastStep ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-zinc-950 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'bg-zinc-900 hover:bg-zinc-800 text-amber-400 border-zinc-800 hover:border-zinc-700'}`}
          >
            {isLastStep ? "تەواو و دەستپێکردنی کاربەرنامە 🚀" : "دواتر ←"}
          </button>
        </div>

      </div>

      <div className="mt-4 text-[10px] text-zinc-600 font-medium tracking-wide relative z-10">
        پەرەپێدراوە بۆ کوردستان • مافی پارێزراوە © {new Date().getFullYear()}
      </div>
    </div>
  );
};

export default LandingPage;