/* eslint-disable */
// @ts-nocheck
import React, { useState } from 'react';
import { auth } from '../firebase';

interface KidsAIProps {
  language: 'ku' | 'ar';
}

const KurdishKidsAI: React.FC<KidsAIProps> = ({ language }) => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'story' | 'riddle' | 'ask' | 'names'>('story');
  const [namesList, setNamesList] = useState([]); 
  const [genderMode, setGenderFilter] = useState<'girl' | 'boy'>('girl'); 
  const [nameDescription, setNameDescription] = useState(''); 
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
      
      let finalMessage = "";
      if (mode === 'story') {
        finalMessage = "[MODE: STORY] چیرۆکێکی کوردی زۆر خۆش و پەروەردەیی بۆ منداڵان باس بکە کە ئامۆژگاری تێدابێت.";
      } else if (mode === 'riddle') {
        finalMessage = "[MODE: RIDDLE] مەتەڵێکی کوردی فۆلکلۆری خۆش لێبکە و لە خوارەوەش بە شاراوەیی وەڵامەکەی بنووسە.";
      } else {
        finalMessage = `[MODE: ASK] پرسیاری منداڵانە: ${input.trim()}`;
      }

      const res = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/kids-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: finalMessage, email: userEmail }),
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
        setError("⚠️ لێمیتی نامەکانی ئەمڕۆت تەواو بوو! بۆ گفتوگۆی بێسنوور، ببە بە ئەندامی Premium.");
      } else {
        setError("ببوورە کێشەیەک ڕوویدا، دووبارە تاقیکەرەوە.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 👑 لۆجیکی داینامیکی و بێ خەتای گەڕانی ناوەکان هاوتەریب لەگەڵ مۆدێلی نوێی باکئێندەکەت
  const fetchKurdishNames = async () => {
    setLoading(true);
    setError(null);
    setNamesList([]);

    try {
      const userEmail = auth.currentUser?.email || "guest_user";
      
      // دروستکردنی داواکاری گونجاو لەگەڵ وەسفەکە بۆ ناردن بۆ باکئێند
      const res = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/kurdish-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          gender: genderMode, 
          email: userEmail
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error("خەتا لە هێنانی ناوەکان.");
      
      setNamesList(data.names || []);
    } catch (err: any) {
      setError("ببوورە، ناتوانرێت ناوەکان لۆد بکرێت. دووبارە تاقیکەرەوە.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 px-3 text-right" dir="rtl">
      
      <div className="text-center space-y-2 pt-2">
        <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-amber-400 to-cyan-400 tracking-tight">
          جیهانی منداڵان 🧸🎈
        </h2>
        <p className="text-zinc-400 text-xs">جیهانی چیرۆک، مەتەڵ، و دۆزینەوەی زیرەکی ناوی منداڵان بەپێی وەسف و ئارەزوو</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => { setMode('story'); setResponse(null); setError(null); setNamesList([]); }}
          className={`py-3 rounded-2xl font-black text-xs transition-all border ${mode === 'story' ? 'bg-pink-600/20 border-pink-500 text-pink-400 shadow-lg' : 'bg-zinc-900/40 border-zinc-800 text-zinc-400'}`}
        >
          چیرۆک📚
        </button>
        <button
          onClick={() => { setMode('riddle'); setResponse(null); setError(null); setNamesList([]); }}
          className={`py-3 rounded-2xl font-black text-xs transition-all border ${mode === 'riddle' ? 'bg-amber-600/20 border-amber-500 text-amber-400 shadow-lg' : 'bg-zinc-900/40 border-zinc-800 text-zinc-400'}`}
        >
          مەتەڵی کوردی🧩
        </button>
        <button
          onClick={() => { setMode('ask'); setResponse(null); setError(null); setNamesList([]); }}
          className={`py-3 rounded-2xl font-black text-xs transition-all border ${mode === 'ask' ? 'bg-cyan-600/20 border-cyan-500 text-cyan-400 shadow-lg' : 'bg-zinc-900/40 border-zinc-800 text-zinc-400'}`}
        >
          پرسیارکردن🤔
        </button>
        <button
          onClick={() => { setMode('names'); setResponse(null); setError(null); setNamesList([]); }}
          className={`py-3 rounded-2xl font-black text-xs transition-all border ${mode === 'names' ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-lg' : 'bg-zinc-900/40 border-zinc-800 text-zinc-400'}`}
        >
          ناوی منداڵان👶🏻
        </button>
      </div>

      {mode !== 'names' ? (
        <div className="bg-[#0e0e12] border border-zinc-800 p-5 rounded-3xl shadow-xl space-y-4">
          {mode === 'ask' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-cyan-400 uppercase tracking-wider pr-1">💭 چی لە مێشککدا هەیە؟ لێرە بیپرسه:</label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="بۆ نموونە: مانگ بۆچی دەدرەوشێتەوە؟"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 focus:outline-none focus:border-cyan-500 text-right"
              />
            </div>
          )}

          <button
            onClick={handleKidsRequest}
            disabled={loading || (mode === 'ask' && !input.trim())}
            className={`w-full py-3 text-zinc-950 font-black text-xs rounded-xl transition-all shadow-md ${mode === 'story' ? 'bg-pink-400' : mode === 'riddle' ? 'bg-amber-400' : 'bg-cyan-400'}`}
          >
            {loading ? '🔮 خەریکی بیرکردنەوەم...' : 'ڕەوانەکردن'}
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-300">
          
          <div className="bg-[#0e0e12] border border-zinc-800 p-4 rounded-3xl space-y-2">
            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-wider pr-1">
              ✨ چ جۆرە ناوێکت دەوێت؟ (بۆ نموونە: کورت و مۆدێرن بێت، یان بە پیتی 'ئـ' دەستپێبکات):
            </label>
            <input
              type="text"
              value={nameDescription}
              onChange={(e) => setNameDescription(e.target.value)}
              placeholder="وەسفی ناوەکە لێرە بنووسە (ئارەزوومەندانە)..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 text-right leading-relaxed"
            />
          </div>

          <div className="bg-[#0e0e12] border border-zinc-800 p-3 rounded-3xl flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setGenderFilter('girl')}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${genderMode === 'girl' ? 'bg-pink-500/20 border-pink-500 text-pink-400 shadow-md' : 'bg-zinc-950 text-zinc-400 border-zinc-800'}`}
            >
              منداڵی کچ🎀
            </button>
            <button
              type="button"
              onClick={() => setGenderFilter('boy')}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${genderMode === 'boy' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-md' : 'bg-zinc-950 text-zinc-400 border-zinc-800'}`}
            >
              منداڵی کوڕ💙
            </button>
          </div>

          {/* 👑 لێرەدا دوگمەی گەڕانی سەرەکی سپی و گەشاوە کرا تا بە ڕوونی لەسەر پاشبنەمای تاریک دیار بێت */}
          {namesList.length === 0 && !loading && (
            <button
              type="button"
              onClick={fetchKurdishNames}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs rounded-xl shadow-lg transition-all active:scale-[0.98] border border-emerald-400/20"
            >
              گەڕان بۆ ناوی منداڵ🔍
            </button>
          )}

          {loading && (
            <div className="p-6 rounded-3xl bg-[#0b0b0e] border border-zinc-800 text-center animate-pulse">
              <span className="text-zinc-500 italic text-xs block">🧸 KurdAI خەریکی دۆزینەوەی ناوازەترین ناوەکانە بەپێی وەسفەکەت...</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {namesList.map((item, index) => (
              <div 
                key={index} 
                className={`bg-gradient-to-br from-zinc-900/50 to-zinc-950 p-4 rounded-2xl shadow-md text-right relative overflow-hidden border animate-in fade-in zoom-in-95 duration-200 ${genderMode === 'girl' ? 'border-pink-500/10' : 'border-cyan-500/10'}`}
              >
                <span className={`absolute top-2 left-3 text-[9px] font-black px-2 py-0.5 rounded-md ${genderMode === 'girl' ? 'bg-pink-500/5 text-pink-400' : 'bg-cyan-500/5 text-cyan-400'}`}>
                  {genderMode === 'girl' ? 'کچ' : 'کوڕ'}
                </span>
                <h4 className={`text-sm font-black mb-1 ${genderMode === 'girl' ? 'text-pink-400' : 'text-cyan-400'}`}>{item.name}</h4>
                <p className="text-zinc-400 text-xs leading-relaxed">{item.meaning}</p>
              </div>
            ))}
          </div>

          {/* 👑 لێرەدا دوگمەی دووبارە گەڕانیش بە تەواوی درەوشاوە جێگیر کرا */}
          {namesList.length > 0 && !loading && (
            <button
              type="button"
              onClick={fetchKurdishNames}
              className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white font-black text-xs rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 border border-amber-400/20"
            >
              <span>دووبارە گەڕان بۆ ناوی نوێ🔄</span>
            </button>
          )}
        </div>
      )}

      {mode !== 'names' && (response || loading) && (
        <div className="p-6 rounded-3xl bg-[#0b0b0e] border border-zinc-800 shadow-2xl min-h-[150px] flex flex-col justify-center">
          <div className="text-zinc-100 text-sm leading-[2] text-right whitespace-pre-wrap font-medium">
            {loading ? (
              <span className="text-zinc-500 italic animate-pulse block text-center">🧸 KurdAI خەریکی نووسینە...</span>
            ) : (
              <span>{response}</span>
            )}
          </div>
        </div>
      )}

      {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center">{error}</div>}
    </div>
  );
};

export default KurdishKidsAI;