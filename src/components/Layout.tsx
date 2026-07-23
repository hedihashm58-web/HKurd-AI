/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { View } from '../types';
import { auth, db } from '../firebase';
import { collection, getDocs, query, orderBy, limit, onSnapshot, doc, getDoc } from 'firebase/firestore';
import UserFeedback from './UserFeedback'; // 👈 هاوردەکردنی بەشی تێبینی بە دروستی

interface LayoutProps {
  children: React.ReactNode;
  activeView: View;
  onViewChange: (view: View) => void;
  backgroundImage?: string;
  language: 'ku' | 'ar';
  setLanguage: React.Dispatch<React.SetStateAction<'ku' | 'ar'>>;
}

// 🔔 مۆدێلی ئاگادارییەکان
interface NotificationListModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'ku' | 'ar';
}

const NotificationListModal: React.FC<NotificationListModalProps> = ({ isOpen, onClose, language }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return; 

    const q = query(collection(db, "global_notifications"), orderBy("createdAt", "desc"), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setNotifications(list);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[300] p-4" dir="rtl">
      <div className="bg-[#0f172a] border border-zinc-800 rounded-3xl max-w-sm w-full p-5 text-center shadow-2xl animate-in zoom-in-95 duration-200">
        <h3 className="text-sm font-black text-white mb-4 flex items-center gap-1.5 justify-center">
          <span>📢</span> {language === 'ku' ? 'ئاگاداری و نامەکان' : 'الإشعارات'}
        </h3>

        <div className="space-y-2 max-h-[50vh] overflow-y-auto mb-4 pr-1">
          {loading ? (
            <p className="text-xs text-zinc-500 py-4 animate-pulse">لە لۆدبووندایە...</p>
          ) : notifications.length === 0 ? (
            <p className="text-xs text-zinc-500 py-6">{language === 'ku' ? 'هیچ ئاگادارییەک نییە.' : 'لا توجد إشعارات حالياً.'}</p>
          ) : (
            notifications.map((notif) => (
              <div key={notif.id} className="bg-slate-900/60 border border-zinc-800/80 rounded-xl p-3 text-right">
                <h4 className="text-xs font-black text-amber-400 mb-1">{notif.title}</h4>
                <p className="text-[11px] text-zinc-300 leading-relaxed">{notif.body}</p>
              </div>
            ))
          )}
        </div>

        <button 
          onClick={onClose} 
          className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 font-bold py-2 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 active:scale-95 border border-zinc-800/50 shadow-md"
        >
          <span>⚡</span>
          <span>{language === 'ku' ? 'گەڕانەوە' : 'العودة'}</span>
        </button>
      </div>
    </div>
  );
};

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
  { id: '1_year', name: '١ ساڵ', price: '٥٠,٠٠0', desc: '١٠ وێنە لە ڕۆژێکدا 👑' },
];

const PremiumOffersModal: React.FC<PremiumOffersModalProps> = ({ isOpen, onClose, language }) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('3_months');
  const [paymentMethod, setPaymentMethod] = useState<'fastpay' | 'asiapay' | null>(null);
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
                  isSelected ? 'border-amber-500 bg-amber-500/5 text-white' : 'border-zinc-800/80 bg-zinc-900/30 text-zinc-300 hover:border-zinc-700'
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
          <button onClick={() => setPaymentMethod('fastpay')} className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${paymentMethod === 'fastpay' ? 'border-red-500 bg-red-500/10 text-white' : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700'}`}>FastPay</button>
          <button onClick={() => setPaymentMethod('asiapay')} className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${paymentMethod === 'asiapay' ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700'}`}>AsiaPay</button>
        </div>

        {paymentMethod && (
          <div className="mb-6 text-right animate-in fade-in duration-200">
            <input type="tel" placeholder="07700000000" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white text-center focus:outline-none focus:border-amber-500 text-xs font-mono tracking-wider" />
          </div>
        )}

        <div className="space-y-2 max-w-xs mx-auto">
          <button disabled={!paymentMethod || phoneNumber.length < 10} onClick={() => { alert("⏱️ داواکارییەکەت ناردرا، دوای پشکنین ئەکاونتەکەت کارا دەبێت."); onClose(); }} className="w-full bg-gradient-to-r from-amber-400 to-amber-500 disabled:from-zinc-800 disabled:to-zinc-800 text-zinc-950 disabled:text-zinc-500 font-black py-2.5 rounded-xl transition-all text-xs active:scale-[0.98]">{language === 'ku' ? 'پشڕاستکردنەوە و ناردن' : 'تأكيد الدفع'}</button>
          <button onClick={onClose} className="w-full bg-zinc-900/20 hover:bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 font-bold py-2 rounded-xl transition-all text-[11px] block text-center">{language === 'ku' ? 'گەڕانەوە' : 'إلغاء'}</button>
        </div>
      </div>
    </div>
  );
};

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'ku' | 'ar';
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, language }) => {
  if (!isOpen) return null;
  const user = auth.currentUser;
  const emailClean = user?.email?.toLowerCase().trim() || "";
  const [displayEmail, setDisplayEmail] = useState(emailClean);

  useEffect(() => {
    if (emailClean.startsWith("code_") && emailClean.endsWith("@kurdai.pro")) {
      const code = emailClean.replace("code_", "").replace("@kurdai.pro", "");
      getDoc(doc(db, "login_codes", code)).then((codeDoc) => {
        if (codeDoc.exists()) {
          setDisplayEmail(codeDoc.data().email.toLowerCase().trim());
        }
      }).catch(err => {
        console.error("Error loading email in profile:", err);
      });
    } else {
      setDisplayEmail(emailClean);
    }
  }, [emailClean]);

  const isAdmin = displayEmail === "hedihashm58@gmail.com";

  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [isSendingNotif, setIsSendingNotif] = useState(false);

  const handleLogoutClick = async () => {
    if (window.confirm(language === 'ku' ? "دڵنیای دەتەوێت لە ئەژمارەکەت بێیتە دەرەوە؟" : "هل أنت متأكد من تسجيل الخروج؟")) {
      try {
        await auth.signOut();
        window.location.reload();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleSendPushNotification = async () => {
    if (!notifTitle.trim() || !notifBody.trim()) return;
    setIsSendingNotif(true);

    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const tokens = [];
      querySnapshot.forEach((doc) => {
        if (doc.data().fcmToken) tokens.push(doc.data().fcmToken);
      });

      if (tokens.length === 0) {
        alert("⚠️ هیچ بەکارهێنەرێک تۆکنی نۆتیفیکەیشنی چالاک نییە.");
        setIsSendingNotif(false);
        return;
      }

      const response = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: notifTitle,
          body: notifBody,
          tokens: tokens
        }),
      });

      if (response.ok) {
        alert("🎉 نۆتیفیکەیشنەکە بە سەرکەوتوویی بۆ سەر شاشەی تەواوی بەکارهێنەران ناردرا!");
        setNotifTitle('');
        setNotifBody('');
      } else {
        alert("❌ کێشەیەک لە سێرڤەردا هەیە.");
      }
    } catch (error) {
      console.error(error);
      alert("❌ خەتایەک لە ناردندا ڕوویدا.");
    } finally {
      setIsSendingNotif(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-[600] p-4 select-none animate-in fade-in duration-200" dir="rtl">
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-[2.5rem] max-w-sm w-full p-8 text-center shadow-[0_0_50px_rgba(99,102,241,0.06)] relative overflow-hidden backdrop-blur-2xl animate-in zoom-in-95 duration-300 pt-10">
        
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-slate-950 border border-slate-800/80 shadow-[0_0_20px_rgba(99,102,241,0.1)] group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-amber-500/5 to-yellow-500/5 rounded-full animate-pulse"></div>
          <svg className="w-8 h-8 text-indigo-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </div>
        
        {isAdmin && (
          <h3 className="text-[10px] font-black text-amber-500 mb-2 tracking-widest uppercase">
            {language === 'ku' ? "بەرێوبەری پڕۆژە 👑" : "مدير النظام 👑"}
          </h3>
        )}
        
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl py-3 px-4 text-center mb-4">
          <p className="text-[9px] text-slate-500 font-bold mb-1 tracking-wider uppercase">{language === 'ku' ? 'ناونیشانی هەژمار' : 'عنوان الحساب'}</p>
          <p className="font-mono text-zinc-200 text-xs tracking-wide select-all break-all font-bold">
            {displayEmail || "guest@kurdai.pro"}
          </p>
        </div>

        {(() => {
          let displayCode = localStorage.getItem('loginCode_' + emailClean) || "";
          if (user?.email?.startsWith("code_") && user?.email?.endsWith("@kurdai.pro")) {
            displayCode = user.email.replace("code_", "").replace("@kurdai.pro", "");
          }
          if (!displayCode) return null;
          return (
            <div className="bg-gradient-to-b from-slate-950/60 to-slate-950/80 border border-amber-500/15 rounded-2xl py-3 px-4 text-center mb-4 relative overflow-hidden shadow-inner">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
              <p className="text-amber-500/60 text-[9px] mb-1.5 font-bold tracking-wider uppercase">{language === 'ku' ? "کۆدی چوونەژوورەوەی تایبەت" : "رمز الدخول الخاص"}</p>
              <p className="font-mono text-amber-400 text-sm tracking-widest font-black select-all">
                {displayCode}
              </p>
            </div>
          );
        })()}

        {isAdmin && (
          <div className="bg-slate-950/60 border border-amber-500/20 rounded-2xl p-4 mb-4 text-right animate-in fade-in duration-300">
            <h4 className="text-xs font-black text-amber-400 mb-3 flex items-center gap-1.5">🔔 ناردنی ڕاگەیاندنی بەپەلە (Push)</h4>
            <div className="space-y-2.5">
              <input 
                type="text" 
                placeholder="ناونیشانی نامەکە..." 
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
              />
              <textarea 
                placeholder="دەقی نامەکە لێرە بنووسە..." 
                value={notifBody}
                onChange={(e) => setNotifBody(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500 resize-none transition-colors"
              />
              <button 
                onClick={handleSendPushNotification}
                disabled={isSendingNotif || !notifTitle.trim() || !notifBody.trim()}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-500 disabled:from-zinc-800 disabled:to-zinc-800 text-slate-950 disabled:text-zinc-500 text-[11px] font-black py-2.5 rounded-xl transition-all active:scale-[0.98]"
              >
                {isSendingNotif ? 'لە پڕۆسەی ناردندایە...' : 'بڵاوکردنەوە بۆ هەمووان 🚀'}
              </button>
            </div>
          </div>
        )}

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl py-3.5 px-4 flex justify-between items-center mb-6">
          <span className="text-slate-400 text-xs font-bold">{language === 'ku' ? 'دۆخی هەژمار:' : 'حالة الحساب:'}</span>
          <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-full border tracking-wide ${isAdmin ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' : 'text-amber-400 bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)]'}`}>
            {isAdmin ? "پریمیم پڵەس 👑" : "پلانی ئاسایی ⚪"}
          </span>
        </div>

        <div className="space-y-3">
          <button 
            onClick={handleLogoutClick} 
            className="w-full bg-red-500/10 hover:bg-red-500/15 active:bg-red-500/20 text-red-400 hover:text-red-300 font-black py-3 rounded-2xl transition-all text-xs border border-red-500/20 hover:border-red-500/30 shadow-md flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            <span>{language === 'ku' ? 'چوونەدەرەوە لە هەژمار' : 'تسجيل الخروج'}</span>
          </button>
          <button 
            onClick={onClose} 
            className="w-full bg-slate-950 hover:bg-slate-900/80 text-slate-400 hover:text-slate-200 font-bold py-3 rounded-2xl transition-all text-xs border border-slate-800/80 active:scale-[0.98]"
          >
            {language === 'ku' ? 'داخستن' : 'إغلاق'}
          </button>
        </div>
      </div>
    </div>
  );
};

// 👑 مۆدێلی تێبینی لۆکاڵی شیک بۆ کاتێک کلیک لەسەر دوگمە نوێیەکەی سەرەوە دەکرێت
interface LocalFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'ku' | 'ar';
}

const LocalFeedbackModal: React.FC<LocalFeedbackModalProps> = ({ isOpen, onClose, language }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xl flex items-center justify-center z-[400] p-4">
      <div className="bg-[#0f172a] border border-zinc-800 rounded-[2rem] max-w-lg w-full p-2 relative shadow-2xl animate-in zoom-in-95 duration-200">
        <UserFeedback language={language} />
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 bg-slate-950 hover:bg-slate-900 text-zinc-400 hover:text-white px-3 py-1 rounded-xl border border-zinc-800 text-[10px] font-bold transition-all"
        >
          {language === 'ku' ? 'داخستن' : 'إغلاق'}
        </button>
      </div>
    </div>
  );
};

const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange, backgroundImage, language, setLanguage }) => {
  const [isVoiceComingSoonOpen, setIsVoiceComingSoonOpen] = useState(false);
  const [isPremiumOffersOpen, setIsPremiumOffersOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationListOpen, setIsNotificationListOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false); // 👑 ستەیتی نوێ بۆ بەشی تێبینی

  return (
    <div className="min-h-[100dvh] flex flex-col relative overflow-hidden bg-[#020617] text-slate-200 touch-manipulation" dir="rtl">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 transition-opacity duration-1000">
        {backgroundImage && <img src={backgroundImage} alt="Context" className="w-full h-full object-cover blur-[35px] scale-125 transform translate-z-0 will-change-transform" />}
      </div>

      <header className="glass-header sticky top-1 z-50 px-3 sm:px-4 lg:px-12 py-3 flex justify-between items-center border-b border-white/[0.02] mx-2 lg:mx-6 mt-2 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-6 group cursor-pointer" onClick={() => onViewChange(View.HOME)}>
          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full overflow-hidden border border-slate-700 flex items-center justify-center bg-slate-950/50"><img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" /></div>
          <div className="flex flex-col text-right">
            <h1 className="text-sm sm:text-lg lg:text-2xl font-black text-white tracking-tight leading-none">KurdAI <span className="text-yellow-500 italic text-[9px] lg:text-xs ml-0.5">PRO</span></h1>
            <div className="flex items-center gap-1 mt-0.5"><div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div><p className="text-[6px] sm:text-[7px] font-black text-slate-400 uppercase tracking-wider">{language === 'ku' ? 'کورد زیندووە' : 'كوردستان حيّة'}</p></div>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* 👑 دوگمەیەکی بچوکی نوێ و شاهانە بۆ ناردنی تێبینی لە تەنیشت نۆتیفیکەیشن */}
          <button 
            onClick={() => setIsFeedbackOpen(true)}
            className="group flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-slate-800/40 border border-slate-800 rounded-xl hover:bg-slate-700/50 hover:border-slate-700 active:bg-slate-700 transition-all shadow-md active:scale-[0.97]"
            title={language === 'ku' ? 'ناردنی تێبینی و پێشنیار' : 'إرسال ملاحظة'}
          >
            <div className="text-zinc-300 group-hover:text-amber-400 transition-colors text-xs sm:text-sm">
              ✍️
            </div>
          </button>

          <button 
            onClick={() => setIsNotificationListOpen(true)}
            className="group flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-slate-800/40 border border-slate-800 rounded-xl hover:bg-slate-700/50 hover:border-slate-700 active:bg-slate-700 transition-all shadow-md active:scale-[0.97]"
          >
            <div className="text-zinc-300 group-hover:text-white transition-colors text-xs sm:text-sm group-hover:animate-bounce">
              🔔
            </div>
          </button>

          <button 
            type="button" 
            onClick={() => setLanguage(prev => prev === 'ku' ? 'ar' : 'ku')} 
            className="px-2.5 sm:px-3 h-8 sm:h-9 bg-slate-800/40 border border-slate-800 hover:border-slate-700 rounded-xl transition-all text-[10px] sm:text-[11px] font-bold text-zinc-300 hover:text-white flex items-center gap-1 shadow-sm active:scale-95"
          >
            <span>🌐</span>
            <span>{language === 'ku' ? 'AR' : 'KU'}</span>
          </button>
          
          <button 
            onClick={() => setIsProfileOpen(true)} 
            className="group flex items-center gap-1 px-2 sm:px-3 h-8 sm:h-9 bg-slate-800/40 border border-slate-800 rounded-xl hover:bg-slate-700/50 hover:border-slate-700 active:bg-slate-700 transition-all shadow-md active:scale-[0.97]"
          >
            <span className="hidden sm:inline text-[11px] font-bold text-zinc-300 group-hover:text-white transition-colors">
              {language === 'ku' ? 'پرۆفایل' : 'الحساب'}
            </span>
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-lg text-zinc-400 group-hover:text-white flex items-center justify-center text-[10px] sm:text-xs transition-transform duration-300">
              ⚙️
            </div>
          </button>
        </div>
      </header>

      <main className="flex-1 container mx-auto max-w-[1500px] px-4 pt-2 pb-6 relative z-10">
        {activeView !== View.HOME && (
          <div className="w-full max-w-5xl mx-auto mb-2 flex justify-start animate-in fade-in slide-in-from-top-1 duration-200">
            <button 
              onClick={() => onViewChange(View.HOME)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-xl text-[11px] font-bold text-slate-300 transition-all active:scale-95 hover:border-slate-700 shadow-md"
            >
              <span className="text-xs">⚡</span>
              <span>{language === 'ku' ? 'گەڕانەوە' : 'العودة للمنصة الرئيسية'}</span>
            </button>
          </div>
        )}
        {children}
      </main>
      
      <VoiceComingSoonModal isOpen={isVoiceComingSoonOpen} onClose={() => setIsVoiceComingSoonOpen(false)} />
      <PremiumOffersModal isOpen={isPremiumOffersOpen} onClose={() => setIsPremiumOffersOpen(false)} language={language} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} language={language} />
      <NotificationListModal isOpen={isNotificationListOpen} onClose={() => setIsNotificationListOpen(false)} language={language} />
      
      {/* 👑 مۆدێلی نوێی لۆکاڵی تێبینی لێرەدا ڕێندەر دەبێت */}
      <LocalFeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} language={language} />
    </div>
  );
};

export default Layout;