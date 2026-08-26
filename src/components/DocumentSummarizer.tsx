/* eslint-disable */
// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { auth } from '../firebase';

interface DocumentSummarizerProps {
  language?: 'ku' | 'ar';
}

interface SummaryHistoryItem {
  id: string;
  fileName: string;
  mode: string;
  summaryResult: string;
  timestamp: string;
}

const MODES = [
  { id: 'executive', label: '📑 کورتەی گشتی و خاڵەکان', desc: 'پوختەی تەواوی بەڵگەنامەکە بە شێوازی خاڵبەندی و تەوەرە سەرەکییەکان' },
  { id: 'study', label: '🎓 تێبینی ئەکادیمی (زانکۆ)', desc: 'بۆ خوێندکاران: دەرهێنانی پێناسە، چەمک و دەرەنجامەکانی مەلزەمە و کتێب' },
  { id: 'qa', label: '❓ پرسیار و وەڵامی گرنگ', desc: 'ئامادەکردنی پرسیارە گرنگەکانی تاقیکردنەوە لەگەڵ وەڵامە وردەکانیان' },
  { id: 'quick', label: '⚡ کورتەی ١ خولەکی', desc: 'پوختەیەکی زۆر خێرا لە کەمتر لە ٢٠٠ وشەدا' },
];

const DocumentSummarizer: React.FC<DocumentSummarizerProps> = ({ language = 'ku' }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedMode, setSelectedMode] = useState<string>('executive');
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SummaryHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('kurdai_pdf_summary_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Error parsing summary history:", e);
      }
    }
  }, []);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        const cleanBase64 = base64String.split(',')[1];
        resolve(cleanBase64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith('.pdf')) {
        setError("⚠️ تکایە تەنها فایلی فەرمی PDF دابنێ!");
        setSelectedFile(null);
        return;
      }
      
      const maxSizeBytes = 20 * 1024 * 1024; // 20 MB
      if (file.size > maxSizeBytes) {
        setError("⚠️ قەبارەی ئەم فایلە لە ٢٠ مێگابایت زیاترە! تکایە فایلێکی گونجاو هەڵبژێرە.");
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setError(null);
      setSummary(null);
    }
  };

  const handleSummarize = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedFile || loading) return;

    setLoading(true);
    setError(null);
    setSummary(null);

    try {
      const userEmail = auth.currentUser?.email || "guest_user";
      const base64Data = await convertFileToBase64(selectedFile);

      const response = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/summarize-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfBase64: base64Data,
          mode: selectedMode,
          email: userEmail
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.detail && data.detail.includes("LIMIT_EXCEEDED_PDF_TRIAL")) {
          throw new Error("LIMIT_EXCEEDED_PDF_TRIAL");
        }
        throw new Error(data.detail || "سێرڤەر وەڵامی نەدایەوە.");
      }

      const resultText = data.response;
      setSummary(resultText);
      saveToHistory(selectedFile.name, selectedMode, resultText);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("LIMIT_EXCEEDED_PDF_TRIAL") || err.message?.includes("تەواو بوو")) {
        setError("⚠️ لێمیتی فایلی ئەم مانگەت تەواو بوو! تکایە بۆ بەکارهێنانی بێسنوور پلانەکەت بەرز بکەرەوە.");
      } else {
        setError(err.message || "ببوورە، کێشەیەک لە کورتکردنەوەی فایلی PDFەکەدا هەبوو.");
      }
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = (fileName: string, mode: string, summaryResult: string) => {
    setHistory((prevHistory) => {
      const filtered = prevHistory.filter(item => item.fileName !== fileName || item.mode !== mode);
      const newItems = [
        { 
          id: Date.now().toString(), 
          fileName, 
          mode, 
          summaryResult, 
          timestamp: new Date().toLocaleDateString('ku-IQ') 
        },
        ...filtered
      ].slice(0, 10);
      
      localStorage.setItem('kurdai_pdf_summary_history', JSON.stringify(newItems));
      return newItems;
    });
  };

  const clearHistory = () => {
    localStorage.removeItem('kurdai_pdf_summary_history');
    setHistory([]);
  };

  const handleLoadHistoryItem = (item: SummaryHistoryItem) => {
    setSummary(item.summaryResult);
    setSelectedMode(item.mode || 'executive');
    setSelectedFile({ name: item.fileName, size: 0, type: "application/pdf" } as File);
    setIsHistoryOpen(false);
  };

  const copyToClipboard = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsText = () => {
    if (!summary) return;
    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kurdai_summary_${selectedFile?.name?.replace('.pdf', '') || 'doc'}.txt`;
    link.click();
  };

  // خوێندنەوە بە دەنگی دەماریی پیاو
  const handlePlayAudio = async () => {
    if (!summary) return;
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
        body: JSON.stringify({ text: summary.slice(0, 500) })
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-4 space-y-4 sm:space-y-6 animate-in fade-in duration-500 pb-24" dir="rtl">
      
      {/* 🧭 سەرپەڕە */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-rose-950/40 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-800/80 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3 text-right">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-xl sm:text-2xl shadow-[0_0_20px_rgba(244,63,94,0.2)] shrink-0">
            📑
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>شیکاری و کورتکەرەوەی PDF</span>
              <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono font-bold uppercase">
                Doc AI
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-400">کورتکردنەوەی کتێب، توێژینەوە، مەلزەمە و پەڕاوی PDF بە کوردیی سۆرانیی ڕەوان</p>
          </div>
        </div>

        {/* دوگمەی مێژووی کورتکراوەکان */}
        <button
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          className="px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-zinc-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 self-end sm:self-auto active:scale-95"
        >
          <span>📜</span>
          <span>مێژووی فایلەکان ({history.length})</span>
        </button>
      </div>

      {/* 🎛️ شێوازەکانی شیکاری (Analysis Mode Selector Chips) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => setSelectedMode(m.id)}
            className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between space-y-1 active:scale-95 ${
              selectedMode === m.id
                ? 'bg-rose-950/60 border-rose-500/60 text-white shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="text-xs font-black">{m.label}</span>
            <span className="text-[10px] text-zinc-500 leading-tight truncate">{m.desc}</span>
          </button>
        ))}
      </div>

      {/* 🌟 شوێنی سەرەکی: بارکردن و دەرەنجام */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* 📄 بەشی لای ڕاست: بارکردنی فایلی PDF */}
        <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] border border-slate-800/90 p-4 sm:p-5 shadow-2xl flex flex-col justify-between space-y-4">
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-400 border-b border-slate-800/60 pb-2">
              <span>فایلی هەڵبژێردراو:</span>
              {selectedFile && (
                <button
                  onClick={() => { setSelectedFile(null); setSummary(null); }}
                  className="text-red-400 hover:text-red-300 transition-all text-[11px]"
                >
                  ✕ سڕینەوەی فایل
                </button>
              )}
            </div>

            {/* بۆکسی فایل */}
            <div
              onClick={() => !selectedFile && fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center transition-all min-h-[220px] sm:min-h-[280px] overflow-hidden ${
                selectedFile 
                  ? 'border-rose-500/40 bg-slate-950/60' 
                  : 'border-slate-700 hover:border-rose-500/60 bg-slate-950/30 cursor-pointer hover:bg-slate-900/40'
              }`}
            >
              {selectedFile ? (
                <div className="text-center space-y-3 p-4">
                  <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto text-3xl shadow-lg">
                    📑
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-black text-white max-w-[260px] truncate mx-auto">
                      {selectedFile.name}
                    </p>
                    {selectedFile.size > 0 && (
                      <p className="text-[11px] text-zinc-400 font-mono">
                        قەبارە: {formatFileSize(selectedFile.size)}
                      </p>
                    )}
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30 font-mono mt-1">
                      PDF Document
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-3 py-6">
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-2xl shadow-inner">
                    📁
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-white mb-1">فایلی PDFی مەلزەمە یان کتێبەکە دابنێ</p>
                    <p className="text-[11px] text-zinc-500">کلیک بکە یان فایلەکە ڕابکێشە بۆ ناو ئەم بۆکسە</p>
                  </div>
                  <span className="text-[10px] text-zinc-600 font-mono block">تا قەبارەی ٢٠ مێگابایت</span>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf"
                className="hidden"
              />
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
            disabled={!selectedFile || loading}
            className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 shadow-lg active:scale-98 ${
              selectedFile && !loading
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/25 cursor-pointer'
                : 'bg-zinc-800/60 text-zinc-600 border border-zinc-800 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>KurdAI خەریکی خوێندنەوە و شیکارییە...</span>
              </>
            ) : (
              <>
                <span>⚡</span>
                <span>شیکاری و کورتکردنەوەی PDF</span>
              </>
            )}
          </button>
        </div>

        {/* 📝 بەشی لای چەپ: پوختە و دەرەنجام */}
        <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] border border-slate-800/90 p-4 sm:p-5 shadow-2xl flex flex-col justify-between space-y-4">
          
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400 border-b border-slate-800/60 pb-2">
            <span className="flex items-center gap-1.5 text-rose-400">
              <span>✨</span>
              <span>کورتەی بەرهەمهێنراوی KurdAI:</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              {summary ? `${summary.length} پیت` : ''}
            </span>
          </div>

          {/* بۆکسی پیشاندانی کورتە */}
          <div className="flex-1 min-h-[220px] sm:min-h-[280px] bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 overflow-y-auto">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3 py-12 text-center">
                <div className="w-10 h-10 border-3 border-rose-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-medium text-rose-400/90 animate-pulse">KurdAI بە ووردی پەڕە بە پەڕە شیکاری فایلەکە دەکات...</p>
              </div>
            ) : summary ? (
              <div className="text-slate-100 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-right font-medium select-text">
                {summary}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-16 text-center text-zinc-600 space-y-2">
                <span className="text-3xl opacity-30">📑</span>
                <p className="text-xs font-medium">پاش کورتکردنەوە، تەواوی پوختە و خاڵە گرنگەکان لێرەدا دەردەکەون</p>
              </div>
            )}
          </div>

          {/* دوگمەکانی کردار */}
          {summary && !loading && (
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

      {/* 📜 مۆداڵی مێژووی کورتکراوەکان */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <span>📜</span>
                <span>مێژووی کورتکراوەکانی پێشوو</span>
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
                      <span className="font-bold text-rose-300 truncate max-w-[200px]">{item.fileName}</span>
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

export default DocumentSummarizer;