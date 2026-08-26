/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { auth } from '../firebase';

interface WebSummarizerProps {
  language?: 'ku' | 'ar';
}

interface WebHistoryItem {
  id: string;
  url: string;
  mode: string;
  summaryResult: string;
  timestamp: string;
}

const MODES = [
  { id: 'highlights', label: '🌐 کورتەی گشتی و تەوەرەکان', desc: 'شیکاری و کورتکردنەوەی وتار و پەڕەکانی ماڵپەڕ' },
  { id: 'news', label: '📰 هەواڵ و ڕووداوەکان', desc: 'دەرهێنانی ناونیشان، کات، شوێن، سەرچاوە و پوختەی هەواڵەکە' },
  { id: 'facts', label: '🔍 داتا، ئامار و ڕاستییەکان', desc: 'دەرهێنانی تەواوی ژمارە، ئامار، ڕاستی و ناوی کەسایەتییەکان' },
  { id: 'quick', label: '⚡ کورتەی ٣ خاڵی خێرا', desc: 'کورتکردنەوەی زۆر خێرا لە تەنها ٣ خاڵی بەهێزدا' },
];

const WebSummarizer: React.FC<WebSummarizerProps> = ({ language = 'ku' }) => {
  const [url, setUrl] = useState('');
  const [selectedMode, setSelectedMode] = useState('highlights');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<WebHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('kurdai_web_summary_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Error parsing web summary history:", e);
      }
    }
  }, []);

  const handleSummarize = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim() || loading) return;

    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
      setUrl(cleanUrl);
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const userEmail = auth.currentUser?.email || "guest_user";
      
      const response = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/summarize-web', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: cleanUrl,
          mode: selectedMode,
          email: userEmail
        }), 
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.detail && data.detail.includes("LIMIT_EXCEEDED_WEB_TRIAL")) {
          throw new Error("LIMIT_EXCEEDED_WEB_TRIAL");
        }
        throw new Error(data.detail || "سێرڤەر وەڵامی نەدایەوە.");
      }

      const responseText = data.response || "هیچ زانیارییەک لەم بەستەرەدا وەرنەگیرا.";
      setResult(responseText);
      saveToHistory(cleanUrl, selectedMode, responseText);

    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("LIMIT_EXCEEDED_WEB_TRIAL") || err.message?.includes("تەواو بوو")) {
        setError("⚠️ لێمیتی بەکارهێنانی کورتکەرەوەی وێبی ئەم مانگەت تەواو بوو! تکایە بۆ بەکارهێنانی بێسنوور پلانەکەت بەرز بکەرەوە.");
      } else {
        setError(err.message || "ببوورە، هەڵەیەک لە کاتی پەیوەندیکردن بە ماڵپەڕەکەدا ڕوویدا.");
      }
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = (webUrl: string, mode: string, summaryResult: string) => {
    setHistory((prevHistory) => {
      const filtered = prevHistory.filter(item => item.url !== webUrl || item.mode !== mode);
      const newItems = [
        { 
          id: Date.now().toString(), 
          url: webUrl, 
          mode, 
          summaryResult, 
          timestamp: new Date().toLocaleDateString('ku-IQ') 
        },
        ...filtered
      ].slice(0, 10);
      
      localStorage.setItem('kurdai_web_summary_history', JSON.stringify(newItems));
      return newItems;
    });
  };

  const clearHistory = () => {
    localStorage.removeItem('kurdai_web_summary_history');
    setHistory([]);
  };

  const handleLoadHistoryItem = (item: WebHistoryItem) => {
    setResult(item.summaryResult);
    setUrl(item.url);
    setSelectedMode(item.mode || 'highlights');
    setIsHistoryOpen(false);
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pasteFromClipboard = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) setUrl(clip);
    } catch (e) {
      console.error(e);
    }
  };

  const downloadAsText = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
    const fileUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = `kurdai_web_summary_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
  };

  // خوێندنەوە بە دەنگی دەماریی کوردی
  const handlePlayAudio = async () => {
    if (!result) return;
    if (isPlayingAudio && audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
      return;
    }

    try {
      setIsPlayingAudio(true);
      const res = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: result.slice(0, 500) })
      });

      if (!res.ok) throw new Error("TTS failed");
      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => setIsPlayingAudio(false);
      audio.play();
    } catch (e) {
      console.error(e);
      setIsPlayingAudio(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-4 space-y-4 sm:space-y-6 animate-in fade-in duration-500 pb-24" dir="rtl">
      
      {/* 🧭 سەرپەڕە */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-amber-950/40 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-800/80 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3 text-right">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl sm:text-2xl shadow-[0_0_20px_rgba(245,158,11,0.2)] shrink-0">
            🌐
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>کورتکەرەوە و شیکارکەری وێب</span>
              <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono font-bold uppercase">
                Web AI
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-400">خوێندنەوە، پشکنین و پوختەکردنی وتار و هەواڵی ماڵپەڕەکان بە زمانی کوردیی سۆرانی</p>
          </div>
        </div>

        {/* دوگمەی مێژوو */}
        <button
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          className="px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-zinc-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 self-end sm:self-auto active:scale-95"
        >
          <span>📜</span>
          <span>مێژووی بەستەرەکان ({history.length})</span>
        </button>
      </div>

      {/* 🎛️ شێوازەکانی شیکاری */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => setSelectedMode(m.id)}
            className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between space-y-1 active:scale-95 ${
              selectedMode === m.id
                ? 'bg-amber-950/60 border-amber-500/60 text-white shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="text-xs font-black">{m.label}</span>
            <span className="text-[10px] text-zinc-500 leading-tight truncate">{m.desc}</span>
          </button>
        ))}
      </div>

      {/* 🌟 شوێنی سەرەکی: داخڵکردنی بەستەر و پیشاندانی کورتە */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* 🔗 بەشی لای ڕاست: بەستەری ماڵپەڕ */}
        <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] border border-slate-800/90 p-4 sm:p-5 shadow-2xl flex flex-col justify-between space-y-4">
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-400 border-b border-slate-800/60 pb-2">
              <span>بەستەری ماڵپەڕ یان وتارەکە (URL):</span>
              {url && (
                <button
                  onClick={() => { setUrl(''); setResult(null); }}
                  className="text-red-400 hover:text-red-300 transition-all text-[11px]"
                >
                  ✕ پاککردنەوە
                </button>
              )}
            </div>

            {/* بۆکسی نووسینی لینک */}
            <div className="space-y-2">
              <div className="flex gap-2 items-center">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/article..."
                  className="flex-1 bg-slate-950/90 border border-slate-700/80 focus:border-amber-500/80 rounded-2xl p-3.5 text-white text-xs sm:text-sm focus:outline-none font-mono text-left shadow-inner"
                  dir="ltr"
                />
                <button
                  onClick={pasteFromClipboard}
                  type="button"
                  className="px-3 sm:px-3.5 py-3.5 bg-slate-800 hover:bg-slate-700 text-zinc-200 hover:text-white rounded-2xl text-xs font-bold transition-all border border-slate-700 shrink-0 flex items-center gap-1 active:scale-95 shadow-md cursor-pointer"
                  title="پێوەنووساندنی بەستەر"
                >
                  <span>📋</span>
                  <span className="hidden sm:inline">پێوەنووساندن</span>
                </button>
              </div>

              {url && (
                <div className="flex items-center justify-between text-[11px] text-zinc-400 bg-slate-950/50 p-2 rounded-xl border border-slate-800/60">
                  <span className="truncate max-w-[240px] font-mono">{url}</span>
                  <a
                    href={url.startsWith('http') ? url : `https://${url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:underline shrink-0 font-bold flex items-center gap-0.5"
                  >
                    <span>کردنەوەی وێبسایت</span>
                    <span>↗</span>
                  </a>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-xl text-zinc-400 text-[11px] leading-relaxed space-y-1">
              <p className="font-bold text-zinc-300 flex items-center gap-1">
                <span>💡</span>
                <span>ماڵپەڕە پشتیوانیکراوەکان:</span>
              </p>
              <p>تەواوی ماڵپەڕە هەواڵییە کوردی و جیهانییەکان (ڕووداو، کەی ئێن ئێن، بی بی سی، ویکیپیدیا، وێبلاگەکان، مێدیۆم و تەواوی سەرچاوەکانی تر).</p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-500/30 rounded-xl text-red-300 text-xs font-bold text-center animate-in fade-in">
              {error}
            </div>
          )}

          {/* دوگمەی کورتکردنەوە */}
          <button
            onClick={handleSummarize}
            disabled={!url.trim() || loading}
            className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 shadow-lg active:scale-98 ${
              url.trim() && !loading
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/25 cursor-pointer'
                : 'bg-zinc-800/60 text-zinc-600 border border-zinc-800 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>KurdAI خەریکی خوێندنەوەی وێبسایتەکەیە...</span>
              </>
            ) : (
              <>
                <span>⚡</span>
                <span>خوێندنەوە و کورتکردنەوەی ماڵپەڕ</span>
              </>
            )}
          </button>
        </div>

        {/* 📝 بەشی لای چەپ: پوختە و شیکاری */}
        <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] border border-slate-800/90 p-4 sm:p-5 shadow-2xl flex flex-col justify-between space-y-4">
          
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400 border-b border-slate-800/60 pb-2">
            <span className="flex items-center gap-1.5 text-amber-400">
              <span>✨</span>
              <span>کورتەی ماڵپەڕ بە زمانی کوردی:</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              {result ? `${result.length} پیت` : ''}
            </span>
          </div>

          {/* بۆکسی پیشاندانی کورتە */}
          <div className="flex-1 min-h-[220px] sm:min-h-[280px] bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 overflow-y-auto">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3 py-12 text-center">
                <div className="w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-medium text-amber-400/90 animate-pulse">KurdAI بە شێوەی لایڤ دەچێتە ناو وێبسایتەکە و دەیخوێنێتەوە...</p>
              </div>
            ) : result ? (
              <div className="text-slate-100 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-right font-medium select-text">
                {result}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-16 text-center text-zinc-600 space-y-2">
                <span className="text-3xl opacity-30">🌐</span>
                <p className="text-xs font-medium">پاش داگرتنی دوگمەکە، کورتەی تەواوی ماڵپەڕەکە لێرە پیشان دەدرێت</p>
              </div>
            )}
          </div>

          {/* دوگمەکانی کردار */}
          {result && !loading && (
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-zinc-100 hover:text-white rounded-xl text-xs font-black transition-all flex items-center gap-1 shadow-md active:scale-95 border border-slate-700"
                >
                  <span>{copied ? "✓" : "📋"}</span>
                  <span>{copied ? "کۆپی کرا" : "کۆپیکردن"}</span>
                </button>

                <button
                  onClick={handlePlayAudio}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border ${
                    isPlayingAudio
                      ? 'bg-red-950/60 border-red-500/40 text-red-300 animate-pulse'
                      : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-zinc-300'
                  }`}
                >
                  <span>{isPlayingAudio ? "⏹️" : "🎙️"}</span>
                  <span>{isPlayingAudio ? "وەستاندن" : "گوێگرتن"}</span>
                </button>
              </div>

              <button
                onClick={downloadAsText}
                className="px-3 py-2 bg-slate-950 hover:bg-slate-800 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 border border-slate-800"
                title="داگرتن وەک فایلی دەق"
              >
                <span>💾</span>
                <span>داگرتن</span>
              </button>
            </div>
          )}

        </div>

      </div>

      {/* 📜 مۆداڵی مێژووی بەستەرەکان */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <span>📜</span>
                <span>مێژووی بەستەرە کورتکراوەکان</span>
              </h3>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-zinc-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1">
              {history.length === 0 ? (
                <p className="text-center py-8 text-xs text-zinc-500">هیچ مێژوویەک پاشەکەوت نەکراوە.</p>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleLoadHistoryItem(item)}
                    className="p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800/80 rounded-xl cursor-pointer transition-all space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-300 truncate max-w-[200px] font-mono">{item.url}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{item.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {item.summaryResult}
                    </p>
                  </div>
                ))
              )}
            </div>

            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="w-full py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 text-xs font-bold rounded-xl transition-all"
              >
                🗑️ سڕینەوەی هەموو مێژوو
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default WebSummarizer;