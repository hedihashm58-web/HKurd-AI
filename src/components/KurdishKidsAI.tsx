/* eslint-disable */
// @ts-nocheck
import React, { useState } from 'react';
import { auth } from '../firebase';

interface KidsAIProps {
  language: 'ku' | 'ar';
}

const KurdishKidsAI: React.FC<KidsAIProps> = ({ language }) => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'story' | 'riddle' | 'ask'>('story');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleKidsRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'ask' && !input.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const userEmail = auth.currentUser?.email || "guest_user";
      const finalMessage = mode === 'story' ? "چیرۆکێکی خۆشم بۆ باس بکە" : mode === 'riddle' ? "مەتەڵێکی خۆشم لێبکە" : input.trim();

      const res = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/kids-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: finalMessage, email: userEmail, mode: mode }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.detail && data.detail.includes("LIMIT_EXCEEDED_CHAT")) {
          throw new Error("LIMIT_EXCEEDED_CHAT");
        }
        throw new Error(data.detail || "سێرڤەر وەڵامی نەدایەوە.");
      }

      setResponse(data.response);
    } catch (err: any) {
      if (err.message.includes("LIMIT_EXCEEDED_CHAT")) {
        setError("⚠️ لێمیتی نامەکانی ئەمڕۆت تەواو بوو! بۆ گفتوگۆی بێسنوور، ببە بە پریمیم.");
      } else {
        setError("ببوورە کێشەیەک ڕوویدا، دووبارە تاقیکەرەوە.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 px-3 text-right" dir="rtl">
      
      {/* 🎈 سەردێڕی شاد و منداڵانە */}
      <div className="text-center space-y-2 pt-2">
        <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-amber-400 to-cyan-400 tracking-tight">
          جیهانی منداڵان 🧸🎈
        </h2>
        <p className="text-zinc-400 text-xs">جیهانی چیرۆک، مەتەڵ و وەڵامە شیرینەکان بۆ منداڵانی کوردستان</p>
      </div>

      {/* 🕹️ دوگمەکانی دیاریکردنی جۆری یاری/مۆد */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => { setMode('story'); setResponse(null); setError(null); }}
          className={`py-3 rounded-2xl font-black text-xs transition-all border ${mode === 'story' ? 'bg-pink-600/20 border-pink-500 text-pink-400 shadow-lg shadow-pink-500/10' : 'bg-zinc-900/40 border-zinc-800 text-zinc-400'}`}
        >
          📚 گێڕانەوەی چیرۆک
        </button>
        <button
          onClick={() => { setMode('riddle'); setResponse(null); setError(null); }}
          className={`py-3 rounded-2xl font-black text-xs transition-all border ${mode === 'riddle' ? 'bg-amber-600/20 border-amber-500 text-amber-400 shadow-lg shadow-amber-500/10' : 'bg-zinc-900/40 border-zinc-800 text-zinc-400'}`}
        >
          🧩 مەتەڵی کوردی
        </button>
        <button
          onClick={() => { setMode('ask'); setResponse(null); setError(null); }}
          className={`py-3 rounded-2xl font-black text-xs transition-all border ${mode === 'ask' ? 'bg-cyan-600/20 border-cyan-500 text-cyan-400 shadow-lg shadow-cyan-500/10' : 'bg-zinc-900/40 border-zinc-800 text-zinc-400'}`}
        >
          🤔 پرسیارکردن
        </button>
      </div>

      {/* 📥 بەشی داخڵکردنی پرسیار (تەنها کاتێک چالاکە کە مۆدی پرسیار بێت) */}
      <div className="bg-[#0e0e12] border border-zinc-800 p-5 rounded-3xl shadow-xl space-y-4">
        {mode === 'ask' && (
          <div className="space-y-2">
            <label className="text-[10px] font-black text-cyan-400 uppercase tracking-wider pr-1">💭 چی لە مێشککدا هەیە؟ لێرە بیپرسه:</label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="بۆ نموونە: بۆچی ئاسمان شینە؟ یان مانگ بۆچی دەدرەوشێتەوە؟"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 focus:outline-none focus:border-cyan-500 text-right leading-relaxed"
            />
          </div>
        )}

        <button
          onClick={handleKidsRequest}
          disabled={loading || (mode === 'ask' && !input.trim())}
          className={`w-full py-3 text-zinc-950 font-black text-xs rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-20 ${mode === 'story' ? 'bg-pink-400 hover:bg-pink-500' : mode === 'riddle' ? 'bg-amber-400 hover:bg-amber-500' : 'bg-cyan-400 hover:bg-cyan-500'}`}
        >
          {loading ? '🔮 خەریکی بیرکردنەوەم...' : mode === 'story' ? '✨ دروستکردنی چیرۆک' : mode === 'riddle' ? '✨ هێنانەوەی مەتەڵ' : '✨ وەڵامم بدەرەوە'}
        </button>
      </div>

      {/* 📤 بۆکسی پیشاندانی ئەنجام */}
      {(response || loading) && (
        <div className="p-6 rounded-3xl bg-[#0b0b0e] border border-zinc-800 shadow-2xl min-h-[150px] flex flex-col justify-center relative overflow-hidden">
          <div className="text-zinc-100 text-sm leading-[2] text-right whitespace-pre-wrap font-medium pb-2">
            {loading ? (
              <span className="text-zinc-500 italic animate-pulse block text-center">🧸 KurdAI خەریکی نووسینی جوانترین دەقە بۆ تۆ...</span>
            ) : (
              <span>{response}</span>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center">
          {error}
        </div>
      )}

    </div>
  );
};

export default KurdishKidsAI;