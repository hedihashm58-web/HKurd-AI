/* eslint-disable */
// @ts-nocheck
import React, { useState, useRef } from 'react';
import { auth } from '../firebase';

interface ExamMakerProps {
  language?: 'ku' | 'ar';
}

const ExamMaker: React.FC<ExamMakerProps> = ({ language = 'ku' }) => {
  const [inputText, setInputText] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [includeMCQ, setIncludeMCQ] = useState<boolean>(true);
  const [includeBlanks, setIncludeBlanks] = useState<boolean>(true);
  const [includeTrueFalse, setIncludeTrueFalse] = useState<boolean>(true);
  const [includeShortAnswer, setIncludeShortAnswer] = useState<boolean>(true);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState<'all' | 'student' | 'teacher'>('all');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleGenerateExam = async () => {
    if (!inputText.trim()) {
      alert(language === 'ku' ? "تکایە سەرەتا بابەت یان دەقی مەلزەمەکە دابنێ!" : "الرجاء إدخال نص الموضوع أو الملزمة أولاً!");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const email = auth.currentUser?.email || "anonymous@kurdai.com";
      const res = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/exam-maker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText.trim(),
          difficulty,
          question_count: questionCount,
          include_mcq: includeMCQ,
          include_blanks: includeBlanks,
          include_true_false: includeTrueFalse,
          include_short_answer: includeShortAnswer,
          email
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Error generating exam");

      setResult(data.response || "");
    } catch (err: any) {
      alert(err.message || (language === 'ku' ? "کێشەیەک ڕوویدا لە دروستکردنی پرسیارەکان." : "حدث خطأ أثناء إنشاء الأسئلة."));
    } finally {
      setLoading(false);
    }
  };

  // جیاکردنەوەی بەشی پرسیارەکان لە کلیلی وەڵامەکان بۆ بەکارهێنانی مامۆستا و قوتابی
  const getExamParts = () => {
    if (!result) return { studentText: '', teacherText: '', fullText: '' };
    
    const keyMarker = "🔑 **کلیلی وەڵامە نموونەییەکان";
    if (result.includes(keyMarker)) {
      const parts = result.split(keyMarker);
      return {
        studentText: parts[0].trim(),
        teacherText: (keyMarker + parts[1]).trim(),
        fullText: result
      };
    }

    return {
      studentText: result,
      teacherText: result,
      fullText: result
    };
  };

  const { studentText, teacherText, fullText } = getExamParts();

  const getDisplayedContent = () => {
    if (activeViewTab === 'student') return studentText;
    if (activeViewTab === 'teacher') return teacherText;
    return fullText;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (filename: string, text: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.txt`;
    link.click();
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const content = activeViewTab === 'teacher' ? teacherText : studentText;
    
    printWindow.document.write(`
      <html dir="rtl" lang="ku">
        <head>
          <title>پرسیارەکانی تاقیکردنەوە - KurdAI Exam</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; line-height: 1.8; color: #000; font-size: 14pt; }
            h1, h2, h3 { text-align: center; color: #1e293b; }
            pre { white-space: pre-wrap; font-family: inherit; }
            .header-box { border: 2px solid #334155; padding: 15px; border-radius: 8px; margin-bottom: 25px; }
          </style>
        </head>
        <body>
          <pre>${content}</pre>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePlayAudio = async () => {
    if (isPlayingAudio && audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
      return;
    }

    try {
      setIsPlayingAudio(true);
      const textToRead = getDisplayedContent().slice(0, 450);
      const res = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToRead })
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
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-4 space-y-4 sm:space-y-6 animate-in fade-in duration-500 pb-28" dir="rtl">
      
      {/* 🧭 سەرپەڕەی دروستکەری پرسیار */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 p-4 sm:p-6 border border-emerald-500/30 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3 text-right">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 p-0.5 shadow-[0_0_25px_rgba(16,185,129,0.3)] shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl sm:text-3xl">
                📝
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-teal-200 to-white">
                  {language === 'ku' ? 'دروستکەری پرسیاری تاقیکردنەوە' : 'صانع أسئلة الاختبارات الذكي'}
                </h1>
                <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold uppercase">
                  Exam Pro AI
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 pt-0.5 font-medium">
                {language === 'ku'
                  ? 'داڕشتنی پرسیاری ستاندارد (هەڵبژاردن، بۆشایی، ڕاست و هەڵە) ڕاستەوخۆ لە دەقی مەلزەمە'
                  : 'توليد أسئلة أكاديمية واختبارات قياسية مباشرة من نصوص الملازم والمناهج'}
              </p>
            </div>
          </div>

          <div className="self-end sm:self-auto shrink-0">
            <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              🎓 تایبەت بە مامۆستا و خوێندکاران
            </span>
          </div>
        </div>
      </div>

      {/* 📥 بەشی داخڵکردنی بابەت و مەلزەمە */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl text-right">
        
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-black text-zinc-200 flex items-center gap-1.5">
            <span>📖</span>
            <span>دەقی بابەت، وتار یان مەلزەمەکە لەم بۆکسەدا دابنێ:</span>
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={language === 'ku' 
              ? "دەقی وانەکە، پاراگراف یان مەلزەمەکەت لێرەدا پەیست (Paste) بکە... زیرەکی دەستکرد تەنها لەم زانیارییانە پرسیار دروست دەکات."
              : "ألصق نص الدرس أو الملزمة هنا... سيقوم الذكاء الاصطناعي بإنشاء الأسئلة من هذه المعلومات فقط."}
            className="w-full h-44 sm:h-52 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/80 transition-all leading-relaxed"
          />
        </div>

        {/* ⚙️ هەڵبژاردنەکانی تاقیکردنەوە */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          
          {/* ئاستی قورسی */}
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-zinc-300 block">🎯 ئاستی تاقیکردنەوە:</span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'easy', label: 'ئاسان' },
                { id: 'medium', label: 'ناوەند' },
                { id: 'hard', label: 'پێشکەوتوو' }
              ].map(lvl => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setDifficulty(lvl.id as any)}
                  className={`py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    difficulty === lvl.id
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                      : 'bg-slate-900 text-zinc-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* ژمارەی پرسیارەکان */}
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-zinc-300 block">🔢 کۆی ژمارەی پرسیار:</span>
            <div className="grid grid-cols-4 gap-1.5">
              {[5, 10, 15, 20].map(cnt => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setQuestionCount(cnt)}
                  className={`py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    questionCount === cnt
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                      : 'bg-slate-900 text-zinc-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>

          {/* جۆری پرسیارەکان */}
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 space-y-2 sm:col-span-2 lg:col-span-1">
            <span className="text-xs font-bold text-zinc-300 block">📌 جۆری پرسیارەکان:</span>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-zinc-300">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={includeMCQ} onChange={e => setIncludeMCQ(e.target.checked)} className="accent-emerald-500 rounded" />
                <span>هەڵبژاردن (MCQ)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={includeBlanks} onChange={e => setIncludeBlanks(e.target.checked)} className="accent-emerald-500 rounded" />
                <span>بۆشاییەکان</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={includeTrueFalse} onChange={e => setIncludeTrueFalse(e.target.checked)} className="accent-emerald-500 rounded" />
                <span>ڕاست یان هەڵە</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={includeShortAnswer} onChange={e => setIncludeShortAnswer(e.target.checked)} className="accent-emerald-500 rounded" />
                <span>پرسیاری شیکاری</span>
              </label>
            </div>
          </div>

        </div>

        {/* دوگمەی دروستکردن */}
        <button
          type="button"
          onClick={handleGenerateExam}
          disabled={loading || !inputText.trim()}
          className={`w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer ${
            loading || !inputText.trim()
              ? 'bg-slate-800 text-zinc-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20 active:scale-[0.99]'
          }`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              <span>خەریکی شیکردنەوەی دەق و داڕشتنی پرسیارەکانە...</span>
            </>
          ) : (
            <>
              <span>🚀</span>
              <span>دروستکردنی پرسیارەکانی تاقیکردنەوە</span>
            </>
          )}
        </button>

      </div>

      {/* 📄 ئەنجامی پرسیارەکان */}
      {result && (
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-emerald-500/30 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
          
          {/* باڕی ئامراز و تابی بینین */}
          <div className="p-3.5 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
            
            {/* تابەکانی بینین */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveViewTab('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeViewTab === 'all'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                📑 تەواوی پەڕەکە
              </button>
              <button
                type="button"
                onClick={() => setActiveViewTab('student')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeViewTab === 'student'
                    ? 'bg-blue-600 text-white font-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                🎓 فۆرمی قوتابیان (بێ وەڵام)
              </button>
              <button
                type="button"
                onClick={() => setActiveViewTab('teacher')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeViewTab === 'teacher'
                    ? 'bg-purple-600 text-white font-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                🔑 کلیلی وەڵامەکان (مامۆستا)
              </button>
            </div>

            {/* دوگمەکانی کۆپی، چاپ و داگرتن */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePlayAudio}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border shadow-sm cursor-pointer ${
                  isPlayingAudio
                    ? 'bg-red-950/80 border-red-500/60 text-red-300 animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-zinc-200 hover:text-white'
                }`}
                title="خوێندنەوەی پرسیارەکان بە دەنگ"
              >
                <span>{isPlayingAudio ? "⏹️" : "🎙️"}</span>
                <span className="hidden sm:inline">{isPlayingAudio ? "وەستاندن" : "دەنگ"}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-md cursor-pointer"
                title="چاپکردنی پەڕەی تاقیکردنەوە"
              >
                <span>🖨️</span>
                <span>چاپکردن / PDF</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopy(getDisplayedContent())}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-zinc-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 border border-slate-700 cursor-pointer"
                title="کۆپیکردنی دەق"
              >
                <span>{copied ? "✓" : "📋"}</span>
                <span>{copied ? "کۆپی کرا" : "کۆپی"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownload('kurdai_exam_paper', getDisplayedContent())}
                className="px-3 py-2 bg-slate-950 hover:bg-slate-800 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 border border-slate-800 cursor-pointer"
                title="داگرتن وەک فایلی دەق"
              >
                <span>💾</span>
                <span className="hidden sm:inline">داگرتن</span>
              </button>
            </div>

          </div>

          {/* پەڕەی نوسراوی تاقیکردنەوەکە */}
          <div className="p-5 sm:p-8">
            <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-inner">
              <pre className="text-zinc-100 text-xs sm:text-sm sm:text-base leading-loose whitespace-pre-wrap text-justify font-sans select-text">
                {getDisplayedContent()}
              </pre>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default ExamMaker;
