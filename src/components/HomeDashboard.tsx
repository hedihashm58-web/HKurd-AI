/* eslint-disable */
// @ts-nocheck
import React from 'react';
import { View } from '../types';

interface HomeDashboardProps {
  onViewChange: (view: View) => void;
  language: 'ku' | 'ar';
}

const HomeDashboard: React.FC<HomeDashboardProps> = ({ onViewChange, language }) => {
   
  const dashboardItems = [
    { 
      id: View.CHAT, 
      label: language === 'ku' ? 'گفتوگۆی ژییر' : 'محادثة ذكية', 
      image: 'chat.png'
    },
    { 
      id: View.TRANSLATE, 
      label: language === 'ku' ? 'وەرگێڕانی زیرەک' : 'الترجمة الذكية', 
      image: 'translate.png'
    },
    { 
      id: 'kurdish_grammar', 
      label: language === 'ku' ? 'ڕاستکردنەوەی نووسین' : 'التدقيق اللغوي', 
      image: 'gramar.png'
    },
    { 
      id: 'document_summarizer', 
      label: language === 'ku' ? 'فایلی پی دی ئێف' : 'ملخص الملفات', 
      image: 'pdf.png'
    },
    { 
      id: 'web_summarizer', 
      label: language === 'ku' ? 'کورتکەرەوەی وێب' : 'ملخص المواقع', 
      image: 'web.png'
    },
    { 
      id: 'kids_ai', 
      label: language === 'ku' ? 'جیهانی منداڵان' : 'عالم الأطفال', 
      image: 'baby.png'
    },
    { 
      id: View.ART, 
      label: language === 'ku' ? 'داهێنان و وێنە' : 'توليد الصور', 
      image: 'dahenan.png'
    },
    { 
      id: 'social_hook', 
      label: language === 'ku' ? 'کاری ڕیکلامی' : 'صانع الإعلانات', 
      image: 'post.png'
    },
    { 
      id: 'kurdish_flashcard', 
      label: language === 'ku' ? 'وشەی کوردی پەتی' : 'فلاش كارد اللغة', 
      image: 'mind.png'
    },
    { 
      id: View.PERSONALITIES, 
      label: language === 'ku' ? 'کەسایەتییەکانی کورد' : 'شخصيات كوردية', 
      image: 'syasi.png'
    },
    { 
      id: View.EXPLORE, 
      label: language === 'ku' ? 'نەخشەی کوردستان' : 'خارطة كوردستان', 
      image: 'kurdstan1.png'
    },
    { 
      id: View.MATH, 
      label: language === 'ku' ? 'یاریدەدەری زانستی' : 'المساعد العلمي', 
      image: 'math.png'
    },
    { 
      id: View.HEALTH, 
      label: language === 'ku' ? 'یاریدەدەری تەندروستی' : 'المساعد الصحي', 
      image: 'doctor.png'
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-2 pt-2 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {dashboardItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as View)}
            className="group relative overflow-hidden rounded-2xl border border-slate-800/80 h-32 flex flex-col justify-end transition-all duration-300 hover:scale-[1.02] hover:border-slate-700 active:scale-[0.98] shadow-lg bg-slate-950"
          >
            {/* 👑 وێنە ئەسڵییەکەت وەک باکگراوند لێرە ڕێندەر دەبێت */}
            <img 
              src={item.image} 
              alt={item.label}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 pointer-events-none z-0"
            />
            
            {/* 👑 داپۆشینی ڕەش (Gradient Overlay) بۆ تێکەڵبوونی نازداری وێنەکە و زەقبوونی نووسینەکان */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/60 to-slate-950/90 group-hover:from-slate-950/10 group-hover:via-slate-950/50 group-hover:to-slate-950/80 transition-all z-10"></div>
            
            {/* 👑 ناونیشانە کوردی/عەرەبییەکە لە خوارەوە بە شێوازێکی یەکجار خاوێن */}
            <div className="p-4 relative z-20 w-full text-right">
              <h3 className="text-xs sm:text-sm font-black text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] group-hover:text-amber-400 transition-colors">
                {item.label}
              </h3>
              <div className="w-3 h-0.5 bg-white/40 rounded-full mt-1.5 group-hover:w-7 group-hover:bg-amber-400 transition-all duration-300"></div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomeDashboard;