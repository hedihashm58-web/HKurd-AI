/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { auth } from '../firebase';
import confetti from 'canvas-confetti';

interface KidsAIProps {
  language?: 'ku' | 'ar';
}

const WORD_GAMES = [
  { word: "دایک", hint: "فریشتە میهرەبان و دڵسۆزەکەی ژیانمان 👩‍🍼" },
  { word: "کوردستان", hint: "نیشتمانە جوان و دڵگیرەکەمان ☀️" },
  { word: "پشیلە", hint: "ئاژەڵێکی ماڵی بچووک و یەکجار شیرین 🐱" },
  { word: "بووکەڵە", hint: "یارییەکی خۆش و نەرمی کچانی منداڵ 🧸" },
  { word: "سێو", hint: "میوەیەکی خڕی سوور یان سەوز کە زۆر بەسوودە 🍎" },
  { word: "باوک", hint: "پشت و پەنا و پارێزەری گەورەی تەواوی خێزان 👨‍👦" },
  { word: "ئاڵا", hint: "هێمای پیرۆزی و سەرفرازی گەلەکەمان ☀️" },
  { word: "شێر", hint: "پاشای بەهێزی دارستان و ئاژەڵە کێوییەکان 🦁" },
  { word: "تۆپ", hint: "کەرەستەیەکی خڕ بۆ یاری تۆپی پێ لەگەڵ هاوڕێکان ⚽" },
  { word: "مۆز", hint: "میوەیەکی درێژی زەرد و شیرین کە وزەمان پێدەدات 🍌" },
  { word: "مام", hint: "برایی باوکی شیرین و پشتیوانی گەورەمان 👨‍💼" },
  { word: "نەورۆز", hint: "جەژنی نەتەوەیی و سەری ساڵی کوردی 🔥" },
  { word: "پڵنگ", hint: "ئاژەڵێکی کێوی یەکجار خێرا و بەهێز 🐆" },
  { word: "فڕۆکە", hint: "یارییەکی فڕیو کە منداڵان زۆر حەزیان لێیە ✈️" },
  { word: "هەنار", hint: "میوەیەکی پڕ لە دەنکە سوورە درەوشاوەکانی کوردستان 🍎" },
  { word: "خاڵ", hint: "برایی میهرەبانی دایکم کە زۆر خۆشەویستە 👨‍🌾" },
  { word: "قەڵا", hint: "شوێنەوارە دێرین و مێژووییەکەی شاری هەولێر 🏰" },
  { word: "ئەسپ", hint: "ئاژەڵێکی ڕەسەن و دڵسۆز بۆ سوارچاکی 🐴" },
  { word: "پاسکیل", hint: "کەرەستەیەکی دوو چەرخی خۆش بۆ وەرزش و یاری 🚲" },
  { word: "ترێ", hint: "میوەیەکی هێشوویی شیرین و بەتام 🍇" },
  { word: "سلێمانی", hint: "پایتەختی ڕۆشنبیری و شاری شاعیرە ناودارەکان 🏰" },
  { word: "ورچ", hint: "ئاژەڵێکی گەورەی ناو دارستانەکانی کوردستان 🐻" },
  { word: "شووتی", hint: "میوەیەکی گەورەی سەوز کە ناوەکەی سوور و ئاودارە 🍉" },
  { word: "هەولێر", hint: "شاری دێرینی قەڵا و منارەی گەشاوە 🏰" },
  { word: "ڕێوی", hint: "ئاژەڵێکی زیرەک و فێڵباز لە چیرۆکەکاندا 🦊" },
  { word: "قەڵەم", hint: "کەرەستەیەکی سەرەکی بۆ نووسینی پیت و وشەکان ✏️" },
  { word: "برا", hint: "هاوشانی یارییە بەجۆشەکانت لە ژوورەوە 🧑‍🤝‍🧑" },
  { word: "دهۆک", hint: "شاری چیای بەرز و کانییە فێنکەکان 🏔️" },
  { word: "ئاسک", hint: "گیاندارێکی چاوگەش و جوانی ناو سروشت 🦌" },
  { word: "کتێب", hint: "سەرچاوەی گەورەی زانیاری و چیرۆکە شیرینەکان 📚" },
  { word: "کەرکووک", hint: "دڵی کوردستان و شاری باباگوڕگوڕی هەمیشە داگیرساو 🔥" },
  { word: "حەلەبجە", hint: "شاری هێمای مەزلوومیەت و گوڵە نێرگزەکان 🌼" },
  { word: "سەگ", hint: "هاوڕێیەکی دڵسۆز و پاسەوانێکی بە ئەمەک 🐶" },
  { word: "کەروێشک", hint: "ئاژەڵێکی گوێدریژ کە زۆر حەزی لە گێزەرە 🐰" },
  { word: "ڕانیە", hint: "دەروازەی ڕاپەڕینە مەزنەکەی گەلی کورد ☀️" },
  { word: "مەیموون", hint: "ئاژەڵێکی زیرەک و بەزمخۆش کە حەزی لە مۆزە 🐒" },
  { word: "فیل", hint: "گەورەترین ئاژەڵی وشکانی کە خرتوومی هەیە 🐘" },
  { word: "زەڕافە", hint: "باڵابەرزترین ئاژەڵی سەر زەوی بە ملە درێژەکەی 🦒" },
  { word: "کۆلارە", hint: "کاغەزی فڕیوی دەستی منداڵانە لە ناو ئاسمان 🪁" },
  { word: "سمۆرە", hint: "سمۆرەی دارستان کە خەریکی کۆکردنەوەی بەڕووە 🐿️" },
  { word: "خۆر", hint: "گەورەترین ئەستێرە کە گەرمی دەدات بە زەوی ☀️" },
  { word: "پەلکەزێڕینە", hint: "کەوانە ڕەنگاوڕەنگەکەی دوای باران لە ناو ئاسمان 🌈" },
  { word: "تاڤگە", hint: "ئاوی بەخوڕ کە لە سەر شاخە بەرزەکانەوە دێتە خوارێ 🌊" },
  { word: "چیا", hint: "چیا سەرکەش و بەرزەکانی نیشتمانە جوانەکەمان ⛰️" }
];

const STORY_THEMES = [
  { id: 'animals', label: '🐾 ئاژەڵە ژیرەکان', desc: 'چیرۆکی پەروەردەیی ئاژەڵانی کوردستان' },
  { id: 'adventure', label: '⛰️ سەرکێشی لە چیاکان', desc: 'گەشتی منداڵێکی ئازا لە سروشت' },
  { id: 'space', label: '🚀 ئەستێرە و بۆشایی ئاسمان', desc: 'گەشتێک بۆ سەر مانگ و ئەستێرەکان' },
  { id: 'morals', label: '🌟 ڕاستگۆیی و میهرەبانی', desc: 'چیرۆکێکی پڕ لە پەند و ئامۆژگاری' },
];

const KurdishKidsAI: React.FC<KidsAIProps> = ({ language = 'ku' }) => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'story' | 'riddle' | 'ask' | 'names' | 'games'>('story');
  const [selectedStoryTheme, setSelectedStoryTheme] = useState('animals');
  
  // کایەی وشە
  const [wordGameIndex, setWordGameIndex] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);
  const [gameSuccess, setGameSuccess] = useState(false);

  // ناوەکان
  const [namesList, setNamesList] = useState([]);
  const [genderMode, setGenderMode] = useState<'girl' | 'boy'>('girl');
  
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const savedLevel = localStorage.getItem('kurdai_kids_game_level');
    if (savedLevel) {
      setWordGameIndex(parseInt(savedLevel, 10));
    }
  }, []);

  const initWordGame = (index: number) => {
    if (index >= WORD_GAMES.length) return;
    const game = WORD_GAMES[index];
    const letters = game.word.replace(/\s+/g, '').split('');
    const mixed = [...letters].sort(() => Math.random() - 0.5);
    setShuffledLetters(mixed);
    setSelectedLetters([]);
    setGameSuccess(false);
    setWordGameIndex(index);
    localStorage.setItem('kurdai_kids_game_level', index.toString());
  };

  useEffect(() => {
    if (mode === 'games') {
      const savedLevel = localStorage.getItem('kurdai_kids_game_level');
      const levelToLoad = savedLevel ? parseInt(savedLevel, 10) : 0;
      initWordGame(levelToLoad);
    }
  }, [mode]);

  const selectLetter = (letter: string, idx: number) => {
    const newSelected = [...selectedLetters, letter];
    setSelectedLetters(newSelected);
    
    const newShuffled = [...shuffledLetters];
    newShuffled.splice(idx, 1);
    setShuffledLetters(newShuffled);

    const targetWordClean = WORD_GAMES[wordGameIndex].word.replace(/\s+/g, '');
    if (newSelected.join('') === targetWordClean) {
      setGameSuccess(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  const handleRevealAnswer = () => {
    const correctWordClean = WORD_GAMES[wordGameIndex].word.replace(/\s+/g, '');
    setSelectedLetters(correctWordClean.split(''));
    setShuffledLetters([]);
    setGameSuccess(true);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const resetCurrentWordGame = () => {
    initWordGame(wordGameIndex);
  };

  const handleNextWordGame = () => {
    if (wordGameIndex + 1 < WORD_GAMES.length) {
      initWordGame(wordGameIndex + 1);
    } else {
      initWordGame(0);
    }
  };

  const handleKidsRequest = async (themeOverride?: string) => {
    if (mode === 'ask' && !input.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const userEmail = auth.currentUser?.email || "guest_user";
      
      let finalMessage = "";
      if (mode === 'story') {
        const themeObj = STORY_THEMES.find(t => t.id === (themeOverride || selectedStoryTheme)) || STORY_THEMES[0];
        finalMessage = `چیرۆکێکی زۆر خۆش، شیرین و پەروەردەیی بە زمانی کوردی سۆرانی بۆ منداڵان دەربارەی (${themeObj.desc}) بنووسە. ئیمۆجی زۆری تێدا بەکاربهێنە و لە کۆتاییەکەشدا پەندێکی زۆر جوانی لێ دەربهێنە.`;
      } else if (mode === 'riddle') {
        finalMessage = "مەتەڵێکی کوردیی زۆر خۆش و زیرەکانە بۆ منداڵان لێبدە. پرسیارەکە بە ئیمۆجی دابنێ و لە خوارەوەش بە ڕوونی وەڵامەکەی بنووسە.";
      } else {
        finalMessage = `پرسیاری منداڵانە: ${input.trim()} - تکایە بە زمانێکی زۆر ئاسان، شیرین و پڕ لە خۆشەویستی و ئیمۆجی بۆ منداڵێک ڕوونی بکەرەوە.`;
      }

      const res = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/kids-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: finalMessage, email: userEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "سێرڤەر وەڵامی نەدایەوە.");
      }

      setResponse(data.response);
    } catch (err: any) {
      setError(err.message || "ببوورە کێشەیەک ڕوویدا، دووبارە تاقیکەرەوە.");
    } finally {
      setLoading(false);
    }
  };

  const fetchKurdishNames = async (gender?: 'girl' | 'boy') => {
    const targetGender = gender || genderMode;
    setLoading(true);
    setError(null);
    setNamesList([]);
    try {
      const userEmail = auth.currentUser?.email || "guest_user";
      const res = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/kurdish-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gender: targetGender, email: userEmail }),
      });
      const data = await res.json();
      setNamesList(data.names || []);
    } catch (err: any) {
      setError("خەتا لە لۆدکردنی ناوەکان.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlayAudio = async (textToRead: string) => {
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
        body: JSON.stringify({ text: textToRead.slice(0, 400) })
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
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-4 space-y-4 sm:space-y-6 animate-in fade-in duration-500 pb-24 text-right select-none" dir="rtl">
      
      {/* 🧭 سەرپەڕەی شاد و ڕەنگاوڕەنگ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-pink-950/40 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-800/80 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3 text-right">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-xl sm:text-2xl shadow-[0_0_20px_rgba(236,72,153,0.2)] shrink-0 animate-bounce">
            🎈
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>جیهانی منداڵانی KurdAI</span>
              <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30 font-mono font-bold uppercase">
                Kids Pro
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-400">چیرۆکی دەنگی، مەتەڵی فۆلکلۆری، کایەی وشەسازی و وەڵامی پرسیارە ژیرەکان</p>
          </div>
        </div>
      </div>

      {/* 🎛️ تابی بەشەکان */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <button
          type="button"
          onClick={() => { setMode('story'); setResponse(null); setNamesList([]); }}
          className={`py-3 px-2 rounded-2xl font-black text-xs transition-all border flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
            mode === 'story'
              ? 'bg-pink-600 border-pink-400 text-white shadow-[0_0_20px_rgba(236,72,153,0.35)]'
              : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-zinc-400 hover:text-white'
          }`}
        >
          <span>📖</span>
          <span>چیرۆک</span>
        </button>

        <button
          type="button"
          onClick={() => { setMode('riddle'); setResponse(null); setNamesList([]); }}
          className={`py-3 px-2 rounded-2xl font-black text-xs transition-all border flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
            mode === 'riddle'
              ? 'bg-amber-600 border-amber-400 text-white shadow-[0_0_20px_rgba(245,158,11,0.35)]'
              : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-zinc-400 hover:text-white'
          }`}
        >
          <span>🧩</span>
          <span>مەتەڵ</span>
        </button>

        <button
          type="button"
          onClick={() => { setMode('ask'); setResponse(null); setNamesList([]); }}
          className={`py-3 px-2 rounded-2xl font-black text-xs transition-all border flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
            mode === 'ask'
              ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.35)]'
              : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-zinc-400 hover:text-white'
          }`}
        >
          <span>🤔</span>
          <span>پرسیار</span>
        </button>

        <button
          type="button"
          onClick={() => { setMode('names'); setResponse(null); fetchKurdishNames(); }}
          className={`py-3 px-2 rounded-2xl font-black text-xs transition-all border flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
            mode === 'names'
              ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.35)]'
              : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-zinc-400 hover:text-white'
          }`}
        >
          <span>👶</span>
          <span>ناوەکان</span>
        </button>

        <button
          type="button"
          onClick={() => { setMode('games'); setResponse(null); setNamesList([]); }}
          className={`py-3 px-2 rounded-2xl font-black text-xs transition-all border col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
            mode === 'games'
              ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.35)]'
              : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-zinc-400 hover:text-white'
          }`}
        >
          <span>🎮</span>
          <span>کایەی وشە</span>
        </button>
      </div>

      {/* 📖 بەشی چیرۆک */}
      {mode === 'story' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {STORY_THEMES.map(theme => (
              <button
                key={theme.id}
                onClick={() => {
                  setSelectedStoryTheme(theme.id);
                  handleKidsRequest(theme.id);
                }}
                className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between space-y-1 active:scale-95 cursor-pointer ${
                  selectedStoryTheme === theme.id
                    ? 'bg-pink-950/60 border-pink-500/60 text-white shadow-[0_0_20px_rgba(236,72,153,0.25)]'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span className="text-xs font-black">{theme.label}</span>
                <span className="text-[10px] text-zinc-500 leading-tight truncate">{theme.desc}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => handleKidsRequest()}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 hover:from-pink-500 hover:to-rose-400 text-white font-black text-xs sm:text-sm rounded-2xl transition-all shadow-[0_0_30px_rgba(236,72,153,0.35)] active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>خەریکی دروستکردنی چیرۆکێکی پڕ لە پەندە...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>دروستکردنی چیرۆکێکی خۆشی نوێ</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 🧩 بەشی مەتەڵ */}
      {mode === 'riddle' && (
        <button
          onClick={() => handleKidsRequest()}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-yellow-400 text-white font-black text-xs sm:text-sm rounded-2xl transition-all shadow-[0_0_30px_rgba(245,158,11,0.35)] active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>خەریکی دۆزینەوەی مەتەڵێکی زیرەکانەیە...</span>
            </>
          ) : (
            <>
              <span>🧩</span>
              <span>لێدانی مەتەڵێکی نوێ</span>
            </>
          )}
        </button>
      )}

      {/* 🤔 بەشی پرسیار */}
      {mode === 'ask' && (
        <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] border border-slate-800/90 p-4 sm:p-5 shadow-2xl space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <span>💭</span>
              <span>چی لە مێشکتدایە هاوڕێی ژیر؟ لێرە بیپرسە:</span>
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleKidsRequest()}
              placeholder="بۆ نموونە: ئەستێرەکان لە چی دروستکراون؟ یاخود کیسەڵ بۆ هێندە هێواش دەڕوات؟"
              className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-cyan-500/80 rounded-2xl p-4 text-white text-xs sm:text-sm focus:outline-none placeholder-zinc-500 shadow-inner"
            />
          </div>

          <button
            onClick={() => handleKidsRequest()}
            disabled={!input.trim() || loading}
            className={`w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 shadow-lg active:scale-98 cursor-pointer ${
              input.trim() && !loading
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/25'
                : 'bg-zinc-800/60 text-zinc-600 border border-zinc-800 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>KurdAI خەریکی دۆزینەوەی وەڵامێکی شیرینە...</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>وەڵامدانەوە بە شێوازی منداڵانە</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 👶 بەشی ناوی منداڵان */}
      {mode === 'names' && (
        <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] border border-slate-800/90 p-4 sm:p-6 shadow-2xl space-y-5">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => { setGenderMode('girl'); fetchKurdishNames('girl'); }}
              className={`px-6 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 active:scale-95 cursor-pointer border ${
                genderMode === 'girl'
                  ? 'bg-pink-600 border-pink-400 text-white shadow-[0_0_20px_rgba(236,72,153,0.35)]'
                  : 'bg-slate-950 border-slate-800 text-zinc-400'
              }`}
            >
              <span>👧</span>
              <span>ناوی کچان</span>
            </button>

            <button
              onClick={() => { setGenderMode('boy'); fetchKurdishNames('boy'); }}
              className={`px-6 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 active:scale-95 cursor-pointer border ${
                genderMode === 'boy'
                  ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.35)]'
                  : 'bg-slate-950 border-slate-800 text-zinc-400'
              }`}
            >
              <span>👦</span>
              <span>ناوی کوڕان</span>
            </button>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-emerald-400">خەریکی دۆزینەوەی ٨ ناوی نایاب و ڕەسەنی کوردییە...</p>
            </div>
          ) : namesList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in zoom-in-95">
              {namesList.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 rounded-2xl space-y-1 transition-all">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-base text-emerald-300">{item.name}</span>
                    <button
                      onClick={() => copyToClipboard(`${item.name}: ${item.meaning}`)}
                      className="text-zinc-500 hover:text-white text-[11px]"
                    >
                      📋 کۆپی
                    </button>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.meaning}</p>
                </div>
              ))}
            </div>
          ) : null}

          <button
            onClick={() => fetchKurdishNames()}
            disabled={loading}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-zinc-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer"
          >
            🔄 هێنانەوەی ٨ ناوی تر
          </button>
        </div>
      )}

      {/* 🎮 بەشی کایەی وشەسازی */}
      {mode === 'games' && (
        <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] border border-slate-800/90 p-4 sm:p-6 shadow-2xl space-y-5 text-center">
          
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400 border-b border-slate-800/60 pb-3">
            <span className="text-purple-400 flex items-center gap-1">
              <span>🎮</span>
              <span>قۆناغی {wordGameIndex + 1} لە {WORD_GAMES.length}</span>
            </span>
            <button
              onClick={handleRevealAnswer}
              className="text-amber-400 hover:underline text-[11px]"
            >
              💡 ئاشکراکردنی وەڵام
            </button>
          </div>

          {/* هێما و ڕێنمایی وشەکە */}
          <div className="p-4 bg-purple-950/30 border border-purple-500/20 rounded-2xl space-y-1">
            <span className="text-[11px] font-black text-purple-400 uppercase tracking-wider block">ڕێنمایی بۆ دۆزینەوەی وشەکە:</span>
            <p className="text-sm sm:text-base font-bold text-white">
              {WORD_GAMES[wordGameIndex]?.hint}
            </p>
          </div>

          {/* پیتە هەڵبژێردراوەکان */}
          <div className="flex flex-wrap items-center justify-center gap-2 min-h-[60px] p-3 bg-slate-950/80 border border-slate-800 rounded-2xl">
            {selectedLetters.map((l, i) => (
              <span
                key={i}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-purple-600 text-white font-black text-lg sm:text-xl flex items-center justify-center shadow-lg border border-purple-400 animate-in zoom-in"
              >
                {l}
              </span>
            ))}
          </div>

          {/* پیتە تێکەڵکراوەکان */}
          <div className="flex flex-wrap items-center justify-center gap-2 min-h-[60px]">
            {shuffledLetters.map((l, idx) => (
              <button
                key={idx}
                onClick={() => selectLetter(l, idx)}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-800 hover:bg-purple-500/40 text-purple-200 hover:text-white font-black text-lg sm:text-xl border border-slate-700 hover:border-purple-400 active:scale-90 transition-all cursor-pointer shadow-md"
              >
                {l}
              </button>
            ))}
          </div>

          {/* دۆخی سەرکەوتن */}
          {gameSuccess && (
            <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl space-y-3 animate-in zoom-in">
              <p className="text-sm font-black text-emerald-300">
                🎉 ئافەرم قارەمانی ژیر! وشەکەت بە دروستی دۆزییەوە!
              </p>
              <button
                onClick={handleNextWordGame}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                ➡️ قۆناغی داهاتوو
              </button>
            </div>
          )}

          {!gameSuccess && (
            <button
              onClick={resetCurrentWordGame}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-zinc-400 hover:text-white text-xs font-bold rounded-xl transition-all"
            >
              🔄 دووبارە ڕێکخستنەوەی پیتەکان
            </button>
          )}

        </div>
      )}

      {/* 🌟 بۆکسی دەرەنجامی چیرۆک / مەتەڵ / پرسیار */}
      {response && mode !== 'names' && mode !== 'games' && (
        <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] border border-slate-800/90 p-4 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400 border-b border-slate-800/60 pb-2">
            <span className="flex items-center gap-1.5 text-pink-400">
              <span>✨</span>
              <span>وەڵامی KurdAI Kids:</span>
            </span>
          </div>

          <div className="text-slate-100 text-xs sm:text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-medium select-text">
            {response}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => copyToClipboard(response)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-zinc-100 hover:text-white rounded-xl text-xs font-black transition-all flex items-center gap-1 shadow-md active:scale-95 border border-slate-700 cursor-pointer"
              >
                <span>{copied ? "✓" : "📋"}</span>
                <span>{copied ? "کۆپی کرا" : "کۆپیکردن"}</span>
              </button>

              <button
                onClick={() => handlePlayAudio(response)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border cursor-pointer ${
                  isPlayingAudio
                    ? 'bg-red-950/60 border-red-500/40 text-red-300 animate-pulse'
                    : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-zinc-300'
                }`}
              >
                <span>{isPlayingAudio ? "⏹️" : "🎙️"}</span>
                <span>{isPlayingAudio ? "وەستاندن" : "گوێگرتن لە دەنگەکە"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-950/60 border border-red-500/30 rounded-2xl text-red-300 text-xs font-bold text-center animate-in fade-in">
          {error}
        </div>
      )}

    </div>
  );
};

export default KurdishKidsAI;