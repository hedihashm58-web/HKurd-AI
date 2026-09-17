/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { View } from '../types';
import { auth, db } from '../firebase';
import { collection, getDocs, query, orderBy, limit, onSnapshot, doc, getDoc } from 'firebase/firestore';

interface LayoutProps {
  children: React.ReactNode;
  activeView: View;
  onViewChange: (view: View) => void;
  backgroundImage?: string;
  language: 'ku' | 'ar';
  setLanguage: React.Dispatch<React.SetStateAction<'ku' | 'ar'>>;
  theme?: 'dark' | 'light';
  setTheme?: React.Dispatch<React.SetStateAction<'dark' | 'light'>>;
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
  const [phoneNumber, setPhoneNumber] = useState('');
  const paymentMethod = 'fastpay';

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

        <div className="mb-6 text-right animate-in fade-in duration-200">
          <label className="block text-[11px] font-bold text-slate-400 mb-2 mr-1">
            {language === 'ku' ? 'ژمارەی مۆبایلی فاستپەی (FastPay)' : 'رقم هاتف فاستبي (FastPay)'}
          </label>
          <input 
            type="tel" 
            placeholder="07500000000" 
            value={phoneNumber} 
            onChange={(e) => setPhoneNumber(e.target.value)} 
            className="w-full bg-zinc-900/60 border border-zinc-850 rounded-xl px-4 py-2.5 text-white text-center focus:outline-none focus:border-amber-500 text-xs font-mono tracking-wider" 
          />
        </div>

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
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

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
            <div 
              onClick={() => handleCopyCode(displayCode)}
              className="bg-gradient-to-b from-slate-950/60 to-slate-950/80 border border-amber-500/15 hover:border-amber-500/30 rounded-2xl py-3 px-4 text-center mb-4 relative overflow-hidden shadow-inner cursor-pointer transition-colors group/code"
            >
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
              <p className="text-amber-500/60 text-[9px] mb-1.5 font-bold tracking-wider uppercase flex items-center justify-center gap-1">
                <span>{language === 'ku' ? "کۆدی چوونەژوورەوەی تایبەت" : "رمز الدخول الخاص"}</span>
                <span className="text-[9px] text-amber-500/40 group-hover/code:text-amber-400 transition-colors">
                  {isCopied ? "✓" : "📋"}
                </span>
              </p>
              <p className="font-mono text-amber-400 text-sm tracking-widest font-black select-all flex items-center justify-center gap-1.5">
                <span>{displayCode}</span>
              </p>
              {isCopied && (
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center text-[10px] font-black text-amber-400 animate-in fade-in duration-200">
                  {language === 'ku' ? "کۆپی کرا! ✨" : "تم النسخ! ✨"}
                </div>
              )}
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

const getViewMeta = (view: View, lang: 'ku' | 'ar') => {
  switch (view) {
    case View.CHAT:
      return { title: lang === 'ku' ? 'گفتوگۆی ژیر' : 'محادثة ذكية', icon: '💬' };
    case View.TRANSLATE:
      return { title: lang === 'ku' ? 'وەرگێڕانی زیرەک' : 'الترجمة الذكية', icon: '🌍' };
    case View.KURDISH_GRAMMAR:
      return { title: lang === 'ku' ? 'ڕاستکردنەوەی نووسین' : 'التدقيق اللغوي', icon: '✍️' };
    case View.DOCUMENT_SUMMARIZER:
      return { title: lang === 'ku' ? 'فایلی پی دی ئێف' : 'ملخص الملفات', icon: '📄' };
    case View.WEB_SUMMARIZER:
      return { title: lang === 'ku' ? 'کورتکەرەوەی وێب' : 'ملخص المواقع', icon: '🌐' };
    case 'kids_ai':
      return { title: lang === 'ku' ? 'جیهانی منداڵان' : 'عالم الأطفال', icon: '🧸' };
    case View.KURDISH_FLASHCARD:
      return { title: lang === 'ku' ? 'وشەی کوردی پەتی' : 'فلاش كارد اللغة', icon: '🧠' };
    case View.PERSONALITIES:
      return { title: lang === 'ku' ? 'کەسایەتییەکانی کورد' : 'شخصيات كوردية', icon: '👑' };
    case View.OCR:
      return { title: lang === 'ku' ? 'دەرهێنانی دەق لە وێنە' : 'استخراج النص من الصورة', icon: '📸' };
    case View.PARAPHRASE:
      return { title: lang === 'ku' ? 'داڕشتنەوەی ئەکادیمی' : 'إعادة الصياغة الأكاديمية', icon: '🎓' };
    case View.GRADUATION_RESEARCH:
      return { title: lang === 'ku' ? 'توێژینەوەی دەرچوون' : 'بحوث التخرج', icon: '📚' };
    case View.EXAM_MAKER:
      return { title: lang === 'ku' ? 'دروستکەری تاقیکردنەوە' : 'صانع الاختبارات', icon: '📝' };
    case View.BRAIN_TRAINER:
      return { title: lang === 'ku' ? 'فێرکردنی مێشک' : 'تدريب الذكاء', icon: '⚡' };
    case View.EXPLORE:
      return { title: lang === 'ku' ? 'نەخشەی کوردستان' : 'خارطة كوردستان', icon: '🗺️' };
    default:
      return { title: '', icon: '' };
  }
};

const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange, backgroundImage, language, setLanguage, theme = 'dark', setTheme }) => {
  const [isVoiceComingSoonOpen, setIsVoiceComingSoonOpen] = useState(false);
  const [isPremiumOffersOpen, setIsPremiumOffersOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationListOpen, setIsNotificationListOpen] = useState(false);

  const isHome = activeView === View.HOME;
  const viewMeta = getViewMeta(activeView, language);

  return (
    <div className="min-h-[100dvh] flex flex-col relative overflow-hidden bg-[#020617] text-slate-200 touch-manipulation transition-colors duration-200" dir="rtl">
      {/* 👑 نەرمکردنی باکگراوند بێ بەکارهێنانی فلتەری قورس کە مۆبایل گەرم بکات */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-15 hidden sm:block">
        {backgroundImage && <img src={backgroundImage} alt="Context" className="w-full h-full object-cover blur-[20px] scale-110" />}
      </div>

      {/* 🧭 هێدەری زیرەک و ڕاقی */}
      <header className="glass-header sticky top-2 z-50 px-3 sm:px-6 lg:px-10 py-2.5 sm:py-3 mx-2 lg:mx-6 rounded-2xl sm:rounded-3xl border border-white/[0.06] bg-slate-900/70 backdrop-blur-xl shadow-2xl transition-all duration-300">
        
        {!isHome ? (
          /* 🌟 کاتێک خزمەتگوزارییەک کراوەتەوە: تەنها دوگمەی بچووکی گەڕانەوە + ناوی خزمەتگوزاری لە ناوەڕاستدا */
          <div className="flex items-center justify-between w-full relative">
            {/* دوگمەی بچووک و جوانی گەڕانەوە لە لای ڕاست */}
            <button 
              onClick={() => onViewChange(View.HOME)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] active:bg-white/[0.15] text-amber-400 hover:text-amber-300 border border-white/[0.08] hover:border-amber-500/30 flex items-center justify-center transition-all active:scale-95 shadow-sm cursor-pointer group shrink-0"
              title={language === 'ku' ? 'گەڕانەوە بۆ پەڕەی سەرەکی' : 'الرجوع للمنصة الرئيسية'}
            >
              <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* ناوی خزمەتگوزاری بە ڕەنگی گۆڵدی شاهانە و بێ ئایکۆن لە ناوەڕاستدا */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center pointer-events-none">
              <h2 className="text-sm sm:text-base md:text-lg font-black tracking-wide whitespace-nowrap bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(245,158,11,0.25)]">
                {viewMeta.title}
              </h2>
            </div>

            {/* بۆشایی هاوسەنگکەر لە لای چەپ تاوەکو ناونیشانەکە بە تەواوی لە سەنتەر بێت */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 pointer-events-none"></div>
          </div>
        ) : (
          /* 🏠 کاتێک لە پەڕەی سەرەکیدایت (Home): لۆگۆ و ناوی بەرنامە لە ڕاست + دوگمەکان لە چەپ */
          <div className="flex justify-between items-center w-full">
            {/* لای ڕاست: لۆگۆ و ناوی ڕەسەنی KurdAI PRO */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 group cursor-pointer" onClick={() => onViewChange(View.HOME)}>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-slate-300 dark:border-slate-700/80 flex items-center justify-center bg-slate-100 dark:bg-slate-950/60 shadow-md group-hover:border-amber-500/40 transition-colors">
                <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col text-right">
                <h1 className={`kurdai-brand-text text-sm sm:text-base lg:text-lg font-black tracking-tight leading-none transition-colors ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}>
                  KurdAI <span className="text-amber-500 italic text-[9px] sm:text-xs ml-0.5 font-bold">PRO</span>
                </h1>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                  <p className="text-[7px] sm:text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {language === 'ku' ? 'کورد زیندووە' : 'كوردستان حيّة'}
                  </p>
                </div>
              </div>
            </div>

            {/* لای چەپ: دوگمە ڕاقی و مۆدێرنەکان */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* ☀️ / 🌙 دوگمەی گۆڕینی مۆدی ڕووناک و تاریک */}
              <button 
                type="button" 
                onClick={() => setTheme && setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer group ${
                  theme === 'light'
                    ? 'bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 hover:text-amber-600'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-amber-400'
                }`}
                title={theme === 'dark' ? (language === 'ku' ? 'گۆڕین بۆ مۆدی ڕووناک ☀️' : 'تفعيل الوضع النهاري ☀️') : (language === 'ku' ? 'گۆڕین بۆ مۆدی تاریک 🌙' : 'تفعيل الوضع الليلي 🌙')}
              >
                {theme === 'dark' ? (
                  /* Sun icon for switching to light */
                  <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-amber-400 group-hover:rotate-45 group-hover:scale-110 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  /* Moon icon for switching to dark */
                  <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-indigo-600 group-hover:-rotate-12 group-hover:scale-110 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* دوگمەی نۆتیفیکەیشن */}
              <button 
                onClick={() => setIsNotificationListOpen(true)}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer group ${
                  theme === 'light'
                    ? 'bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 hover:text-amber-600'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-amber-400'
                }`}
                title={language === 'ku' ? 'ئاگادارییەکان' : 'الإشعارات'}
              >
                <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-slate-600 dark:text-zinc-300 group-hover:text-amber-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>

              {/* دوگمەی گۆڕینی زمان */}
              <button 
                type="button" 
                onClick={() => setLanguage(prev => prev === 'ku' ? 'ar' : 'ku')} 
                className={`h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-xl sm:rounded-2xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer group ${
                  theme === 'light'
                    ? 'bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-200'
                }`}
                title="گۆڕینی زمان / تغيير اللغة"
              >
                <svg className="w-4 h-4 text-slate-500 dark:text-zinc-400 group-hover:text-amber-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <span className="font-mono text-xs font-black text-amber-600 dark:text-amber-400">
                  {language === 'ku' ? 'AR' : 'KU'}
                </span>
              </button>
              
              {/* دوگمەی پرۆفایل */}
              <button 
                onClick={() => setIsProfileOpen(true)} 
                className={`h-9 sm:h-10 px-3 sm:px-3.5 rounded-xl sm:rounded-2xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer group ${
                  theme === 'light'
                    ? 'bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 text-amber-700'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-300'
                }`}
                title={language === 'ku' ? 'پرۆفایلی بەکارهێنەر' : 'الملف الشخصي'}
              >
                <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:rotate-90 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="hidden sm:inline text-xs font-bold text-slate-800 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                  {language === 'ku' ? 'پرۆفایل' : 'الحساب'}
                </span>
              </button>
            </div>
          </div>
        )}

      </header>

      {/* 📱 ناوەڕۆکی پەڕەکان بێ بۆشایی زیادە */}
      <main className="flex-1 container mx-auto max-w-[1500px] px-2 sm:px-4 pt-1 sm:pt-2 pb-6 relative z-10">
        {children}
      </main>
      
      <VoiceComingSoonModal isOpen={isVoiceComingSoonOpen} onClose={() => setIsVoiceComingSoonOpen(false)} />
      <PremiumOffersModal isOpen={isPremiumOffersOpen} onClose={() => setIsPremiumOffersOpen(false)} language={language} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} language={language} />
      <NotificationListModal isOpen={isNotificationListOpen} onClose={() => setIsNotificationListOpen(false)} language={language} />
    </div>
  );
};

export default Layout;