/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

interface BrainTrainerProps {
  language?: 'ku' | 'ar';
}

interface KnowledgeItem {
  id: string;
  topic: string;
  content: string;
  tags: string[];
  source: string;
  createdAt: string;
}

const BrainTrainer: React.FC<BrainTrainerProps> = ({ language = 'ku' }) => {
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [source, setSource] = useState('ئەدمین (هێدی)');
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'add' | 'list'>('add');

  const currentUserEmail = auth.currentUser?.email?.toLowerCase().trim();
  const isAdmin = currentUserEmail === 'hedihashm58@gmail.com' || currentUserEmail === 'hedikurdaipro@admin.com';

  // گوێگرتن لە داتابەیسی کۆگای زانیاری
  useEffect(() => {
    try {
      const q = query(collection(db, 'kurdish_knowledge_base'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const items: KnowledgeItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as KnowledgeItem);
        });
        setKnowledgeList(items);
      }, (err) => {
        console.error("Firestore Listen Error:", err);
      });
      return () => unsubscribe();
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleLearn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !content.trim()) {
      setErrorMsg('تکایە ناونیشان و ناوەڕۆکی زانیارییەکە بە تەواوی بنووسە.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const tagsArray = tagsInput
        .split(/[,،\s]+/)
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 1);

      // دڵنیابوون لەوەی وشەکانی ناونیشانیش دەچنە ناو تاگەکان بۆ گەڕانی خێرا
      topic.split(/\s+/).forEach(w => {
        const clean = w.trim().toLowerCase();
        if (clean.length > 2 && !tagsArray.includes(clean)) {
          tagsArray.push(clean);
        }
      });

      const cleanDocId = topic.trim().replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_').slice(0, 60);

      const knowledgeData = {
        topic: topic.trim(),
        content: content.trim(),
        tags: tagsArray,
        source: source.trim() || 'ئەدمین',
        addedBy: currentUserEmail || 'hedihashm58@gmail.com',
        createdAt: new Date().toISOString()
      };

      // ١. پاشەکەوتکردن لە Firestore
      await setDoc(doc(db, 'kurdish_knowledge_base', cleanDocId), knowledgeData);

      // ٢. ناردن بۆ سێرڤەری مێشک
      try {
        await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/knowledge/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(knowledgeData)
        });
      } catch (apiErr) {
        console.warn("Backend API sync notice:", apiErr);
      }

      setSuccessMsg(`🎉 زانیاری دەربارەی (${topic.trim()}) بە سەرکەوتوویی فێری مێشکی KurdAI کرا!`);
      setTopic('');
      setContent('');
      setTagsInput('');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error(err);
      setErrorMsg('خەتایەک لە پاشەکەوتکردنی زانیارییەکە ڕوویدا: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, itemTopic: string) => {
    if (!window.confirm(`دڵنیایت لە سڕینەوەی (${itemTopic}) لە مێشکی KurdAI؟`)) return;
    try {
      await deleteDoc(doc(db, 'kurdish_knowledge_base', id));
    } catch (err) {
      alert("خەتا لە سڕینەوە: " + err.message);
    }
  };

  const filteredKnowledge = knowledgeList.filter(item => 
    item.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-2 sm:py-4 space-y-4 sm:space-y-6 animate-in fade-in duration-500 pb-24" dir="rtl">
      
      {/* 🧭 سەرپەڕە */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-emerald-950/40 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-800/80 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3 text-right">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xl sm:text-2xl shadow-[0_0_20px_rgba(16,185,129,0.2)] shrink-0">
            🧠
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>فێرکردنی مێشکی KurdAI (Brain Knowledge Studio)</span>
              <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-bold uppercase">
                Admin Exclusive
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-400">فێرکردنی وشەی نوێ، زانیاری مێژوویی، زانستی، فەرهەنگ و ڕێساکانی کوردی بە مێشکی ژیر</p>
          </div>
        </div>

        {/* تابی گۆڕین */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800 self-end sm:self-auto">
          <button
            onClick={() => setActiveTab('add')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'add' ? 'bg-emerald-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            ✍️ فێرکردنی نوێ
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'list' ? 'bg-emerald-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>📚 فێربووەکان</span>
            <span className="bg-emerald-950 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
              {knowledgeList.length}
            </span>
          </button>
        </div>
      </div>

      {/* ⚠️ ئاگاداری ئەگەر ئەدمین نەبوو */}
      {!isAdmin && (
        <div className="bg-amber-950/40 border border-amber-500/40 p-4 rounded-2xl text-amber-200 text-xs flex items-center gap-2">
          <span>⚠️</span>
          <span>تێبینی: تۆ بە هەژماری سەرەکی ئەدمین (hedihashm58@gmail.com) نەهاتوویە ژوورەوە، بەڵام دەتوانیت زانیاری پێشنیار بکەیت.</span>
        </div>
      )}

      {/* ✍️ تابی یەکەم: فێرکردنی زانیاری نوێ */}
      {activeTab === 'add' && (
        <form onSubmit={handleLearn} className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] border border-slate-800/90 p-4 sm:p-6 shadow-2xl space-y-4">
          
          {successMsg && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 rounded-xl text-xs font-bold animate-in fade-in flex items-center gap-2">
              <span>✓</span>
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-950/80 border border-red-500/60 text-red-200 rounded-xl text-xs font-bold animate-in fade-in flex items-center gap-2">
              <span>✕</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                ناونیشان / وشە / بابەت: <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="بۆ نموونە: قەڵای دێرینی هەولێر، واتای وشەی 'ڕامان'..."
                className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                سەرچاوە / نوسەر:
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="بۆ نموونە: فەرهەنگی خاڵ، ئەکادیمیای کوردی، هێدی..."
                className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1.5">
              زانیاری و ڕوونکردنەوەی ووردی بابەتەکە (Knowledge Content): <span className="text-emerald-400">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="تەواوی ڕوونکردنەوە، مێژوو، واتا، یاسا، یان زانیارییە ووردەکەی بە زمانی کوردی لێرە بنووسە..."
              className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl p-3.5 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500 min-h-[140px] sm:min-h-[180px] leading-relaxed resize-none font-medium"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1.5">
              کلیلەوشە و تاگەکان (Tags - بە فاریزە یان بۆشایی لێکیان جیا بکەرەوە):
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="هەولێر, قەڵا, شوێنەوار, مێژوو, کەلەپوور"
              className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500 font-mono"
            />
            <p className="text-[10px] text-zinc-500 mt-1">تاگەکان یارمەتی مێشکی KurdAI دەدەن لە کاتی هەر پرسیارێکی پەیوەندیدار دەستبەجێ ئەم زانیارییە بخوێنێتەوە.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 shadow-lg active:scale-98 ${
              loading 
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/25 cursor-pointer'
            }`}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>خەریکی تۆمارکردن لە مێشکی KurdAI...</span>
              </>
            ) : (
              <>
                <span>🧠</span>
                <span>فێری مێشکی KurdAI بکە</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* 📚 تابی دووەم: بینینی زانیارییە فێربووەکان */}
      {activeTab === 'list' && (
        <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] border border-slate-800/90 p-4 sm:p-6 shadow-2xl space-y-4">
          
          <div className="flex items-center justify-between gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 گەڕان لەناو زانیارییە فێربووەکاندا..."
              className="flex-1 bg-slate-950/90 border border-slate-700/80 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
            <span className="text-xs font-bold text-emerald-400 shrink-0 font-mono">
              {filteredKnowledge.length} بابەت
            </span>
          </div>

          {filteredKnowledge.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 space-y-2">
              <span className="text-3xl">📚</span>
              <p className="text-xs">هیچ زانیارییەک نەدۆزرایەوە.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredKnowledge.map((item) => (
                <div key={item.id} className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2 hover:border-slate-700 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-emerald-300 flex items-center gap-1.5">
                        <span>🔹</span>
                        <span>{item.topic}</span>
                      </h4>
                      <span className="text-[10px] text-zinc-500 font-mono">سەرچاوە: {item.source || 'ئەدمین'}</span>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(item.id, item.topic)}
                        className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900 border border-red-800/60 text-red-300 rounded-lg text-[11px] font-bold transition-all active:scale-95"
                      >
                        🗑️ سڕینەوە
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap font-medium">
                    {item.content}
                  </p>

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.tags.map((t, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-zinc-400 font-mono">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default BrainTrainer;
