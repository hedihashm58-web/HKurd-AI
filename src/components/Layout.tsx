import React, { useState } from 'react';
import { View } from '../types';
// 👑 هاوردەکردنی فایربەیس بۆ ناسینەوەی ئیمەیڵی ئادمین
import { auth } from '../firebase';

interface LayoutProps {
  children: React.ReactNode;
  activeView: View;
  onViewChange: (view: View) => void;
  backgroundImage?: string;
  language: 'ku' | 'ar';
  setLanguage: React.Dispatch<React.SetStateAction<'ku' | 'ar'>>;
}

interface VoiceComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoiceComingSoonModal: React.FC<VoiceComingSoonModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[300] p-4" dir="rtl">
      <div className="bg-[#121214] border border-zinc-800 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl relative animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/30 animate-pulse">
          <span className="text-2xl text-amber-400">🎙️</span>
        </div>
        <div className="mb-2">
          <h2 className="text-2xl font-black tracking-wider bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent font-mono select-none">
            KurdAI Audio
          </h2>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">بەم زوانە چالاک دەکرێت!</h3>
        <p className="text-zinc-400 text-xs mb-6 leading-relaxed px-2">
          ئەم بەشە لە ئێستادا لە ژێر پەرەپێداندایە. بەم زوانە دەتوانیت بە پێشکەوتووترین سیستەمی ژیریی دەستکردی دەنگی، کارەکانت تەنها لە ڕێگەی ئاخاوتنەوە ئەنجام بدەیت.
        </p>
        <button onClick={onClose} className="w-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-zinc-950 font-extrabold py-2.5 rounded-xl transition-all text-sm active:scale-[0.98]">
           چاوەڕوانم
        </button>
      </div>
    </div>
  );
};

interface PremiumOffersModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'ku' | 'ar';
}

const SUBSCRIPTION_PLANS = [
  { id: '1_month', name: '١ مانگ', price: '٥,٠٠٠', desc: '٣ وێنە لە ڕۆژێکدا 🎨' },
  { id: '3_months', name: '٣ مانگ', price: '١٢,٠٠٠', desc: '٥ وێنە لە ڕۆژێکدا 🔥' },
  { id: '6_months', name: '٦ مانگ', price: '٢٥,٠٠٠', desc: '٧ وێنە لە ڕۆژێکدا 🚀' },
  { id: '1_year', name: '١ ساڵ', price: '٥٠,٠٠٠', desc: '١٠ وێنە لە ڕۆژێکدا 👑' },
];

const PremiumOffersModal: React.FC<PremiumOffersModalProps> = ({ isOpen, onClose, language }) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('3_months');
  const [paymentMethod, setPaymentMethod] = useState<'fastpay' | 'fib' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[300] p-4">
      <div className="bg-[#121215] border border-zinc-800 rounded-2xl max-w-xl w-full p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200">
        
        <h3 className="text-xl font-extrabold text-zinc-100 mb-1">
          {language === 'ku' ? 'خزمەتگوزاری پریمیم' : 'الخدمة المميزة'}
        </h3>
        <p className="text-zinc-300 text-xs mb-6">
          {language === 'ku' ? 'پلانێک هەڵبژێره بۆ چالاککردنی خزمەتگوزاری داهێنانی وێنە:' : 'اختر خطة لتفعيل خدمة إنتاج الصور:'}
        </p>

        <div className="grid grid-cols-2 gap-2.5 mb-6" dir="rtl">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`p-3.5 rounded-xl border text-right cursor-pointer transition-all duration-150 ${
                  isSelected 
                    ? 'border-amber-500 bg-amber-500/5 text-white' 
                    : 'border-zinc-800/80 bg-zinc-900/30 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-xs font-bold text-zinc-100">{plan.name}</h4>
                  <span className="text-[11px] font-black text-amber-400">{plan.price} د.ع</span>
                </div>
                <p className="text-[10px] text-zinc-300 font-medium">{plan.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setPaymentMethod('fastpay')}
            className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
              paymentMethod === 'fastpay' ? 'border-red-500 bg-red-500/10 text-white' : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700'
            }`}
          >
            FastPay
          </button>
          <button
            onClick={() => setPaymentMethod('fib')}
            className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
              paymentMethod === 'fib' ? 'border-cyan-500 bg-cyan-500/10 text-white' : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700'
            }`}
          >
            FIB Bank
          </button>
        </div>

        {paymentMethod && (
          <div className="mb-6 text-right animate-in fade-in duration-200">
            <input
              type="tel"
              placeholder="07700000000"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white text-center focus:outline-none focus:border-amber-500 text-xs font-mono tracking-wider"
            />
          </div>
        )}

        <div className="space-y-2 max-w-xs mx-auto">
          <button
            disabled={!paymentMethod || phoneNumber.length < 10}
            onClick={() => { alert("⏱️ داواکارییەکەت ناردرا، دوای پشکنین ئەکاونتەکەت کارا دەبێت."); onClose(); }}
            className="w-full bg-gradient-to-r from-amber-400 to-amber-500 disabled:from-zinc-800 disabled:to-zinc-800 text-zinc-950 disabled:text-zinc-500 font-black py-2.5 rounded-xl transition-all text-xs active:scale-[0.98]"
          >
            {language === 'ku' ? 'پشڕاستکردنەوە و ناردن' : 'تأكيد الدفع'}
          </button>
          <button onClick={onClose} className="w-full bg-zinc-900/20 hover:bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 font-bold py-2 rounded-xl transition-all text-[11px] block text-center">
            {language === 'ku' ? 'گەڕانەوە' : 'إلغاء'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange, backgroundImage, language, setLanguage }) => {
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isVoiceComingSoonOpen, setIsVoiceComingSoonOpen] = useState(false);
  const [isPremiumOffersOpen, setIsPremiumOffersOpen] = useState(false);

  const navItems = [
    { id: View.CHAT, label: language === 'ku' ? 'خزمەتگوزاری گفتوگۆ' : 'خدمة المحادثة', icon: '🏛️', desc: language === 'ku' ? 'ژیریی شیکاری و ڕاوێژکاری ئەکادیمی' : 'الذكاء التحليلي والاستشاري الأكاديمي', meta: 'Consultation AI' },
    { id: View.EXPLORE, label: language === 'ku' ? 'نەخشەی کوردستان' : 'خارطة كوردستان', icon: '🗺️', desc: language === 'ku' ? 'گەڕان بەدوای پارێزگاکان و شوێنەوارەکان' : 'استكشاف المحافظات والمعالم التاريخية', meta: 'Spatial AI' },
    { id: View.PERSONALITIES, label: language === 'ku' ? 'کەسایەتییەکانی کورد' : 'شخصيات كوردية', icon: '👥', desc: language === 'ku' ? 'ئاشنابوون بە مێژوو و کەسایەتییە ناودارەکان' : 'التعرف على التاريخ والشخصيات الشهيرة', meta: 'Historical AI' }, 
    { id: View.MATH, label: language === 'ku' ? 'خزمەتگوزاری زانستی' : 'الخدمة العلمية', icon: '📐', desc: language === 'ku' ? 'شیکاریی داتا و هاوکێشە ئاڵۆزەکان' : 'تحليل البيانات والمعادلات المعقدة', meta: 'Analytical AI' },
    { id: View.TRANSLATE, label: language === 'ku' ? 'خزمەتگوزاری زمان' : 'خدمة اللغة الترجمة', icon: '📜', desc: language === 'ku' ? 'وەرگێڕانی فەرمی و پسپۆڕی دیالەکتەکان' : 'الترجمة الرسمية والمتخصصة اللهجات', meta: 'Linguistic AI' },
    { id: View.HEALTH, label: language === 'ku' ? 'خزمەتگوزاری تەندروستی' : 'الخدمة الصحية', icon: '🩺', desc: language === 'ku' ? 'شیکاریی نیشانەکان و زانیاریی دەرمان' : 'تحليل الأعراض ومعلومات الأدوية', meta: 'Medical AI' },
    { id: View.ART, label: language === 'ku' ? 'خزمەتگوزاری داهێنان' : 'خدمة الإبداع الفني', icon: '🎨', desc: language === 'ku' ? 'بەرهەمهێنانی بینراوی کوالیتی بەرز' : 'إنتاج البصريات عالية الجودة', meta: 'Creative AI' },
    { id: View.VIDEO, label: language === 'ku' ? 'پڕۆژەکانی نیشتەجێبوون' : 'المشاريع السكنية', icon: '🏢', desc: language === 'ku' ? 'ڕێبەری گشتی نرخ، قیست و خزمەتگوزاری سیتییەکان' : 'الدليل العام للأسعار، الأقساط وخدمات المجمعات', meta: 'Kurdistan Housing' },
    { id: View.VOICE, label: language === 'ku' ? 'خزمەتگوزاری دەنگی' : 'الخدمة الصوتية', icon: '🔊', desc: language === 'ku' ? 'پەیوەندی دەنگیی ڕاستەوخۆ و پارێزراو' : 'الاتصال الصوتي المباشر والآمن', meta: 'Audio AI' },
  ];

  const handleToolSelect = (id: View) => {
    // 👑 هێنانی ئیمەیڵی بەکارهێنەری ئێستا و پشکنینی ئادمین
    const userEmail = auth.currentUser?.email?.toLowerCase().trim();
    const isAdmin = userEmail === "hedihashm58@gmail.com";

    if (id === View.VOICE) {
      setIsVoiceComingSoonOpen(true);
      return;
    }
    
    // 🎨 ئەگەر کلیک لە داهێنان کرا و بەکارهێنەرەکە خۆت نەبوویت (ئادمین نەبوو)، ئۆفەرەکان پیشان دەدات
    if (id === View.ART && !isAdmin) {
      setIsPremiumOffersOpen(true);
      return;
    }
    
    onViewChange(id);
    setIsVaultOpen(false);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col relative overflow-hidden bg-[#020617] text-slate-200 touch-manipulation" dir="rtl">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 transition-opacity duration-1000">
        {backgroundImage && (
          <img src={backgroundImage} alt="Context" className="w-full h-full object-cover blur-[80px] scale-150" />
        )}
      </div>

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
              <button onClick={() => setIsVaultOpen(false)} className="mx-auto px-12 py-4 border border-slate-700 rounded-full text-slate-400 font-bold text-xs hover:text-white active:bg-slate-800 transition-all">
                {language === 'ku' ? 'داخستنی پێڕست' : 'إغلاق القائمة'}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 container mx-auto max-w-[1500px] p-4 lg:p-8 relative z-10">
        {children}
      </main>

      <VoiceComingSoonModal isOpen={isVoiceComingSoonOpen} onClose={() => setIsVoiceComingSoonOpen(false)} />
      <PremiumOffersModal isOpen={isPremiumOffersOpen} onClose={() => setIsPremiumOffersOpen(false)} language={language} />
    </div>
  );
};

export default Layout;