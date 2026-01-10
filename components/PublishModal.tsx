
import React from 'react';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PublishModal: React.FC<PublishModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 lg:p-10 animate-in fade-in duration-300" dir="rtl">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={onClose}></div>
      
      <div className="relative w-full max-w-5xl bg-[#0c0c0e] border border-white/10 rounded-[4rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="p-10 lg:p-20 space-y-16">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-[2rem] mx-auto flex items-center justify-center text-5xl shadow-2xl shadow-yellow-500/20 rotate-12">🚀</div>
            <div className="space-y-2">
              <h2 className="text-4xl lg:text-6xl font-black text-white font-['Noto_Sans_Arabic'] tracking-tight">بڵاوکردنەوەی <span className="text-yellow-500">پڕۆژە</span></h2>
              <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px] font-['Noto_Sans_Arabic']">ڕێبەری گواستنەوەی ئەپ بۆ جیهانی دەرەوە</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Step 1: Web Hosting */}
            <div className="group p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-8 hover:bg-white/[0.04] transition-all">
              <div className="flex items-center gap-6 flex-row-reverse">
                <div className="w-16 h-16 rounded-2xl bg-blue-600/10 text-blue-500 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">🌐</div>
                <div className="text-right">
                  <h3 className="text-2xl font-black text-white font-['Noto_Sans_Arabic']">بڵاوکردنەوە لە وێب</h3>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Web Deployment</span>
                </div>
              </div>
              <p className="text-slate-400 font-medium font-['Noto_Sans_Arabic'] text-sm leading-relaxed text-justify">
                بۆ ئەوەی ئەپەکەت لەسەر ئینتەرنێت بەردەست بێت، پێویستە لەسەر پلاتفۆرمێکی هۆستینگ وەک (Vercel) یان (Netlify) دایبنێیت. ئەمە ڕێگە دەدات هەرکەسێک لە ڕێگەی لینکێکەوە دەستی پێ بگات.
              </p>
              <div className="pt-4 flex gap-2 justify-end">
                <span className="px-4 py-1.5 bg-white/5 rounded-full text-[9px] font-bold text-slate-400 uppercase tracking-widest border border-white/5">SSL Secure</span>
                <span className="px-4 py-1.5 bg-white/5 rounded-full text-[9px] font-bold text-slate-400 uppercase tracking-widest border border-white/5">CDN Fast</span>
              </div>
            </div>

            {/* Step 2: App Stores */}
            <div className="group p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-8 hover:bg-white/[0.04] transition-all">
              <div className="flex items-center gap-6 flex-row-reverse">
                <div className="w-16 h-16 rounded-2xl bg-green-600/10 text-green-500 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">📱</div>
                <div className="text-right">
                  <h3 className="text-2xl font-black text-white font-['Noto_Sans_Arabic']">کۆگاکانی ئەپ</h3>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Mobile App Stores</span>
                </div>
              </div>
              <p className="text-slate-400 font-medium font-['Noto_Sans_Arabic'] text-sm leading-relaxed text-justify">
                بۆ ئەوەی ئەپەکەت لە App Store یان Google Play دابنێیت، دەتوانیت تەکنەلۆژیای (PWA) بەکاربهێنیت یان ئەپەکە "Wrap" بکەیت بۆ ئەوەی وەک ئەپێکی ڕەسەن (Native) مامەڵەی لەگەڵ بکرێت.
              </p>
              <div className="pt-4 flex gap-2 justify-end">
                <span className="px-4 py-1.5 bg-white/5 rounded-full text-[9px] font-bold text-slate-400 uppercase tracking-widest border border-white/5">PWA Ready</span>
                <span className="px-4 py-1.5 bg-white/5 rounded-full text-[9px] font-bold text-slate-400 uppercase tracking-widest border border-white/5">Native Wrapper</span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-10 border-t border-white/5 flex flex-col items-center gap-10">
            <div className="max-w-2xl text-center space-y-4">
               <h4 className="text-yellow-500 font-black text-xs uppercase tracking-widest font-['Noto_Sans_Arabic']">ئامادەی بۆ دەستپێکردن؟</h4>
               <p className="text-slate-500 font-medium font-['Noto_Sans_Arabic'] text-xs leading-relaxed">
                 هەنگاوی داهاتوو بریتییە لە جێگیرکردنی کۆدەکە و پەیوەستکردنی بە دۆمەینێکی تایبەتەوە. تیمەکەمان دەتوانێت هاوکاریت بکات لە هەموو قۆناغەکانی بڵاوکردنەوەدا.
               </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button 
                onClick={onClose}
                className="px-20 py-6 bg-yellow-500 text-black rounded-3xl font-black text-xs uppercase tracking-[0.3em] hover:bg-yellow-400 transition-all shadow-2xl shadow-yellow-500/20 font-['Noto_Sans_Arabic']"
              >
                تێگەیشتم
              </button>
              <button 
                onClick={() => window.open('https://vercel.com', '_blank')}
                className="px-20 py-6 bg-white/5 border border-white/10 text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] hover:bg-white/10 transition-all font-['Noto_Sans_Arabic']"
              >
                زیاتر بخوێنەرەوە
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishModal;
