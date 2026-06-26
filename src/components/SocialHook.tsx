/* eslint-disable */
// @ts-nocheck
import React, { useState } from 'react';
import { auth } from '../firebase';

interface SocialHookProps {
  language: 'ku' | 'ar';
}

const SocialHook: React.FC<SocialHookProps> = ({ language }) => {
  const [idea, setIdea] = useState('');
  const [generatedPost, setGeneratedPost] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim() || loading) return;

    setLoading(true);
    setError(null);
    setGeneratedPost(null);

    try {
      const userEmail = auth.currentUser?.email || "guest_user";

      const response = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/social-hook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: idea.trim(),
          email: userEmail
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "سێرڤەر وەڵامی نەدایەوە.");
      }

      setGeneratedPost(data.response);
    } catch (err: any) {
      console.error(err);
      setError(language === 'ku' ? "ببوورە، کێشەیەک لە بەرهەمهێنانی پۆستەکەدا هەبوو." : "عذراً، حدث خطأ أثناء إنشاء المنشور.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedPost) return;
    navigator.clipboard.writeText(generatedPost);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20 px-3" dir="rtl">
      
      <div className="text-center space-y-1.5 pt-2">
        <h2 className="text-2xl sm:text-3xl font-black text-white font-['Noto_Sans_Arabic'] tracking-tight">
          {language === 'ku' ? 'داڕشتنی پۆستی ' : 'صانع منشورات '}<span className="text-indigo-400">{language === 'ku' ? 'سۆشیاڵ میدیا' : 'التواصل الاجتماعي'}</span>
        </h2>
        <p className="text-zinc-500 text-xs font-['Noto_Sans_Arabic']">
          {language === 'ku' ? 'تەنها بیرۆکەکەت بنووسە و پۆستێکی شاهانە لەگەڵ هۆک و ئیمۆجی و هاستاگ وەرگرە' : 'اكتب فكرتك واحصل على منشور احترافي متكامل'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start w-full">
        
        {/* 📥 بۆکسی نووسینی بیرۆکەی سەرەتایی */}
        <form onSubmit={handleGeneratePost} className="flex flex-col space-y-4 w-full bg-[#0e0e12]/90 border border-zinc-800 p-5 rounded-3xl shadow-xl min-h-[220px] justify-between">
          <div className="flex flex-col space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider pr-1">💡 بیرۆکەی پۆستەکەت لێرە بنووسە:</label>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              required
              rows={4}
              placeholder={language === 'ku' ? "بۆ نموونە: کردنەوەی خولی نوێی فێربوونی گرافیک دیزاین لە هەولێر بە داشکاندنی ٥٠٪ یان پۆستێکی سەرنجڕاکێش لەسەر گرنگی وەرزش..." : "اكتب فكرة المنشور هنا..."}
              className="w-full bg-transparent text-zinc-100 text-sm focus:outline-none resize-none text-right placeholder:text-zinc-600 leading-relaxed font-medium"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !idea.trim()}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-xs rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-20 uppercase tracking-wider"
          >
            {loading ? 'خەریکی داهێنانی دەقە...' : '✨ دروستکردنی پۆست'}
          </button>
        </form>

        {/* 📤 بۆکسی پیشاندانی ئەنجام */}
        <div className="flex flex-col space-y-2 w-full">
          <label className="text-[10px] font-black text-indigo-400 uppercase tracking-wider pr-1">📱 دەقی نووسراو بۆ کۆپی کردن:</label>
          <div className="p-5 rounded-3xl bg-[#0b0b0e]/90 border border-zinc-800 shadow-xl min-h-[220px] flex flex-col justify-between relative">
            <div className="text-zinc-200 text-sm leading-relaxed text-right min-h-[140px] whitespace-pre-wrap font-medium pb-8 select-text">
              {loading ? (
                <span className="text-zinc-600 italic animate-pulse">KurdAI Pro خەریکی داڕشتنی باشترین کۆپی ڕایتی پۆستەکەیە...</span>
              ) : generatedPost ? (
                <span className="text-zinc-100">{generatedPost}</span>
              ) : (
                <span className="text-zinc-700 italic text-xs">دوای داگرتنی دوگمەکە پۆستی ڕیکلامیی ئامادەکراو لێرە دەردەکەوێت.</span>
              )}
            </div>
            
            {generatedPost && !loading && (
              <button
                onClick={copyToClipboard}
                className="absolute bottom-3 left-3 px-3 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-bold text-zinc-400 rounded-lg transition-all shadow-md"
              >
                {copied ? "✓ کۆپی کرا" : "📋 کۆپی پۆست"}
              </button>
            )}
          </div>
        </div>

      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center">
          {error}
        </div>
      )}

    </div>
  );
};

export default SocialHook;