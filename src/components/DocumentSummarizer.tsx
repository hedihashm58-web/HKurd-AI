/* eslint-disable */
// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { auth } from '../firebase';

interface DocumentSummarizerProps {
  language: 'ku' | 'ar';
}

interface SummaryHistoryItem {
  id: string;
  fileName: string;
  summaryResult: string;
  timestamp: string;
}

const DocumentSummarizer: React.FC<DocumentSummarizerProps> = ({ language }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SummaryHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false); 
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      
      if (file.type !== "application/pdf") {
        setError(language === 'ku' ? "⚠️ تکایە تەنها فایلی PDF لۆد بکە!" : "⚠️ يرجى تحميل ملف PDF فقط!");
        setSelectedFile(null);
        return;
      }
      
      const maxSizeBytes = 10 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        setError(language === 'ku' ? "⚠️ قەبارەی ئەم فایلە زۆر گەورەیە! تکایە فایلی کەمتر لە ١٠ مێگابایت لۆد بکە." : "⚠️ حجم الملف كبير جداً! يرجى تحميل ملف أقل من 10 ميجابايت.");
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
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
      saveToHistory(selectedFile.name, resultText);
    } catch (err: any) {
      console.error(err);
      if (err.message.includes("LIMIT_EXCEEDED_PDF_TRIAL") || err.message.includes("تەواو بوو")) {
        setError(language === 'ku' ? "⚠️ لێمیتی خۆڕایی کورتکردنەوەی PDF تەواو بوو! تکایە بۆ بەکارهێنانی بێسنوور بەشداری ئۆفەرەکان بکە." : "⚠️ انتهت فترة التجربة المجانية لتلخيص الملفات! يرجى الاشتراك في العروض للاستمرار.");
      } else {
        setError(err.message || (language === 'ku' ? "ببوورە، کێشەیەک لە کورتکردنەوەی فایلی PDFەکەدا هەبوو." : "عذراً, حدث خطأ أثناء تلخيص ملف الـ PDF."));
      }
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = (fileName: string, summaryResult: string) => {
    setHistory((prevHistory) => {
      const filtered = prevHistory.filter(item => item.fileName !== fileName);
      const newItems = [
        { id: Date.now().toString(), fileName, summaryResult, timestamp: new Date().toLocaleDateString('ku-IQ') },
        ...filtered
      ].slice(0, 5);
      
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
    setSelectedFile({ name: item.fileName, size: 0, type: "application/pdf" } as File);
    setIsHistoryOpen(false);
  };

  const copyToClipboard = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20 px-3" dir="rtl">
      
      {/* 👑 لێرەدا فڵێکس ڕێکخرایەوە بۆ ڕێگری لە تێکەڵبوونی دوگمەکە و دەقەکە لەسەر مۆبایل */}
      <div className="flex flex-col sm:flex-row-reverse sm:justify-between sm:items-center w-full border-b border-zinc-900 pb-4 gap-4">
        <div className="flex justify-start sm:justify-end shrink-0">
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="px-4 py-2.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 hover:border-emerald-500/30 text-zinc-300 rounded-xl transition-all text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95"
          >
            <span>📜</span>
            <span>مێژووی کورتکراوەکان</span>
            {history.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center font-mono">
                {history.length}
              </span>
            )}
          </button>
        </div>

        <div className="text-right space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-black text-white font-['Noto_Sans_Arabic'] tracking-tight leading-tight">
            {language === 'ku' ? 'کورتکەرەوەی هۆشمەندی ' : 'ملخص الـ '}<span className="text-emerald-400">PDF</span>
          </h2>
          <p className="text-zinc-500 text-xs font-['Noto_Sans_Arabic'] leading-relaxed">
            {language === 'ku' ? 'فایلی PDF لۆد بکە و پوختەکەی لە چەند بەشێکی دەوڵەمەنددا بە کوردییەکی پاراو وەرگرە' : 'قم بتحميل ملف PDF واحصل على الملخص في نقاط أساسية وموجزة باللغة الكوردية'}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-bold text-center animate-in fade-in duration-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start w-full">
        
        <form onSubmit={handleSummarize} className="flex flex-col space-y-4 w-full bg-[#0e0e12]/90 border border-zinc-800 p-6 rounded-3xl shadow-xl min-h-[250px] justify-between">
          <div className="flex flex-col space-y-3 items-center justify-center border-2 border-dashed border-zinc-800 hover:border-emerald-500/40 rounded-2xl p-6 transition-all bg-zinc-950/20 cursor-pointer h-40 relative group"
               onClick={() => fileInputRef.current?.click()}>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              className="hidden"
            />
            
            <span className="text-3xl group-hover:scale-110 transition-transform">📄</span>
            {selectedFile ? (
              <div className="text-center space-y-1">
                <p className="text-emerald-400 text-xs font-bold truncate max-w-[200px]">{selectedFile.name}</p>
                {selectedFile.size > 0 && (
                  <p className="text-[10px] text-zinc-500 font-mono">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                )}
              </div>
            ) : (
              <div className="text-center space-y-1">
                <p className="text-zinc-300 text-xs font-bold">{language === 'ku' ? 'کلیک بکە بۆ هەڵبژاردنی فایلی PDF' : 'اضغط لاختيار ملف PDF'}</p>
                <p className="text-[10px] text-zinc-600">PDF (Max 10MB)</p>
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading || !selectedFile}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-20 uppercase tracking-wider"
          >
            {loading ? '⏳ خەریکی خوێندنەوە و شیکاری لاپەڕەکانی PDFەکە دەکات...' : '🔹 دەستپێکردنی کورتکردنەوە'}
          </button>
        </form>

        <div className="flex flex-col space-y-2 w-full">
          <label className="text-[10px] font-black text-emerald-400 uppercase tracking-wider pr-1">✨ پوختە و شیکاری گشتی فایلەکە:</label>
          <div className="p-5 rounded-3xl bg-[#0b0b0e]/90 border border-zinc-800 shadow-xl min-h-[250px] flex flex-col justify-between relative">
            <div className="text-zinc-200 text-sm leading-relaxed text-right min-h-[170px] whitespace-pre-wrap font-medium pb-8 select-text overflow-y-auto max-h-80">
              {loading ? (
                <span className="text-zinc-600 italic animate-pulse">KurdAI Pro بە قووڵی خەریکی دۆزینەوەی کرۆکی زانیارییەکانی ناو فایلی PDFەکەیە...</span>
              ) : summary ? (
                <span className="text-zinc-200">{summary}</span>
              ) : (
                <span className="text-zinc-700 italic text-xs">دوای لۆدکردنی فایلەکە، کورتەی تەواوی کتێب یان ڕاپۆرتەکە لێرە بە شێوازێکی بەش بە بەش ڕیز دەبێت.</span>
              )}
            </div>
            
            {summary && !loading && (
              <button
                onClick={copyToClipboard}
                className="absolute bottom-3 left-3 px-3 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-bold text-zinc-400 rounded-lg transition-all shadow-md"
              >
                {copied ? "✓ کۆپی کرا" : "📋 کۆپی کورتە"}
              </button>
            )}
          </div>
        </div>

      </div>

      {isHistoryOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setIsHistoryOpen(false)}></div>
          
          <div className="relative bg-[#0b0b0e] border border-zinc-800 rounded-2xl max-w-lg w-full p-5 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[75vh]">
            
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3 mb-3 shrink-0">
              <button 
                onClick={() => setIsHistoryOpen(false)}
                className="w-7 h-7 bg-zinc-900 text-zinc-400 hover:text-white rounded-full flex items-center justify-center text-xs border border-zinc-800 transition-all"
              >
                ✕
              </button>
              <span className="text-sm font-black text-white">📜 مێژووی کورتکردنەوەی فایلی PDF</span>
            </div>

            <div className="overflow-y-auto space-y-2.5 flex-1 pr-1 pl-1">
              {history.length === 0 ? (
                <div className="text-center py-12 text-zinc-600 text-xs italic">
                  هیچ مێژوویەکی کورتکردنەوە لەم ئامێرەدا پاشەکەوت نەکراوە.
                </div>
              ) : (
                history.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => handleLoadHistoryItem(item)}
                    className="p-3 bg-zinc-900/40 border border-zinc-800/60 hover:border-emerald-500/30 rounded-xl cursor-pointer transition-all flex flex-col text-right group space-y-1.5 active:scale-[0.99]"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-zinc-500 font-mono bg-zinc-950 px-2 py-0.5 rounded-md border border-zinc-900">
                        {item.timestamp}
                      </span>
                      <p className="text-zinc-200 text-xs font-bold truncate max-w-[70%] group-hover:text-emerald-400 transition-colors">
                        📄 {item.fileName}
                      </p>
                    </div>
                    <p className="text-zinc-500 text-[11px] truncate border-t border-zinc-900/60 pt-1.5 italic">
                      {item.summaryResult}
                    </p>
                  </div>
                ))
              )}
            </div>

            {history.length > 0 && (
              <div className="border-t border-zinc-900 pt-3 mt-3 flex justify-center shrink-0">
                <button 
                  onClick={clearHistory} 
                  className="w-full py-2 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black rounded-xl transition-all active:scale-95"
                >
                  🗑️ سڕینەوەی گشتی مێژوو
                </button>
              </div>
            )}
            
          </div>
        </div>
      )}

    </div>
  );
};

export default DocumentSummarizer;