/* eslint-disable */
// @ts-nocheck
import React, { useState } from 'react';
import { auth } from '../firebase';

interface UserFeedbackProps {
  language: 'ku' | 'ar';
}

const UserFeedback: React.FC<UserFeedbackProps> = ({ language }) => {
  const [type, setType] = useState<'suggestion' | 'bug'>('suggestion');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const userEmail = auth.currentUser?.email || "guest_user";

      const response = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/submit-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          feedbackType: type,
          message: message.trim()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "سێرڤەر وەڵامی نەدایەوە.");
      }

      setSuccess(data.message);
      setMessage('');
    } catch (err: any) {
      console.error(err);
      setError(language === 'ku' ? "ببوورە، کێشەیەک لە ناردندا هەبوو. دووبارە تاقی بکەرەوە." : "عذراً، حدث خطأ أثناء إرسال ملاحظتك.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20 px-3" dir="rtl">
      
      <div className="text-center space-y-1.5 pt-2">
        <h2 className="text-2xl sm:text-3xl font-black text-white font-['Noto_Sans_Arabic'] tracking-tight">
          {language === 'ku' ? 'پەیوەندی و ' : 'الاتصال و '}<span className="text-indigo-400">{language === 'ku' ? 'تێبینییەکان' : 'الملاحظات'}</span>
        </h2>
        <p className="text-zinc-500 text-xs font-['Noto_Sans_Arabic']">
          {language === 'ku' ? 'ڕەخنە، پێشنیار یان هەڵەکانی ئەپەکەمان پێ بڵێ بۆ چاککردنی' : 'شاركنا باقتراحاتك أو الإبلاغ عن المشاكل التقنية'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#0e0e12]/90 border border-zinc-800 p-6 rounded-3xl shadow-2xl space-y-5">
        
        {/* 🔘 دیاریکردنی جۆری پەیام */}
        <div className="flex flex-col space-y-2">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider pr-1">{language === 'ku' ? '💡 جۆری نامە:' : '💡 نوع الرسالة:'}</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('suggestion')}
              className={`py-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                type === 'suggestion' ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-zinc-800 bg-zinc-900/20 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <span>✨</span> {language === 'ku' ? 'پێشنیار و بیرۆکە' : 'اقتراح أو فكرة'}
            </button>
            <button
              type="button"
              onClick={() => setType('bug')}
              className={`py-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                type === 'bug' ? 'border-red-500 bg-red-500/10 text-white' : 'border-zinc-800 bg-zinc-900/20 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <span>⚠️</span> {language === 'ku' ? 'ڕاپۆرتکردنی هەڵە' : 'الإبلاغ عن خطأ'}
            </button>
          </div>
        </div>

        {/* 📝 بۆکسی نووسینی تێبینی */}
        <div className="flex flex-col space-y-2">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider pr-1">{language === 'ku' ? '✍️ ناوەڕۆکی پەیامەکەت بنووسە:' : '✍️ اكتب رسالتك هنا:'}</label>
          <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800 focus-within:border-indigo-500/40">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              placeholder={language === 'ku' ? "تێبینیەکەت یان ئەو هەڵەیەی کە بەدی دەکەیت لێرە بە ڕوونی بنووسە..." : "اكتب ملاحظتك بالتفصيل هنا..."}
              className="w-full bg-transparent text-zinc-100 text-sm focus:outline-none resize-none text-right placeholder:text-zinc-600 leading-relaxed font-medium"
            />
          </div>
        </div>

        {success && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold text-center animate-in zoom-in-95">
            {success}
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center">
            {error}
          </div>
        )}

        {/* 🚀 دوگمەی ناردن */}
        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-xs rounded-xl transition-all shadow-xl active:scale-[0.98] disabled:opacity-20 uppercase tracking-wider"
        >
          {loading ? (language === 'ku' ? 'خەریکی ناردنە...' : 'جاري الإرسال...') : (language === 'ku' ? 'ناردنی تێبینی' : 'إرسال الملاحظة')}
        </button>

      </form>
    </div>
  );
};

export default UserFeedback;