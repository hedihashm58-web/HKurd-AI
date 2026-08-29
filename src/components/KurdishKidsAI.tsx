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

interface KidsQuizQuestion {
  question: string;
  category: string;
  categoryEmoji: string;
  icon: string;
  options: string[];
  correctIndex: number;
  funFact: string;
}

const KIDS_QUIZ_DATA: KidsQuizQuestion[] = [
  {
    question: "پاشای دارستان و بەهێزترین ئاژەڵ ناوی چییە؟",
    category: "ئاژەڵەکان",
    categoryEmoji: "🦁",
    icon: "👑",
    options: ["شێر 🦁", "ڕێوی 🦊", "کەروێشک 🐰", "سمۆرە 🐿️"],
    correctIndex: 0,
    funFact: "شێر بەهۆی ئازایەتی و دەنگە بەرزەکەیەوە پێی دەوترێت پاشای دارستان!"
  },
  {
    question: "ئاڵای پیرۆزی کوردستان لە چەند ڕەنگی سەرەکی پێکهاتووە؟",
    category: "نیشتمان",
    categoryEmoji: "☀️",
    icon: "🇹🇯",
    options: ["٢ ڕەنگ", "٣ ڕەنگ (سوور، سپی، سەوز)", "٥ ڕەنگ", "١ ڕەنگ"],
    correctIndex: 1,
    funFact: "ئاڵای کوردستان لە ڕەنگەکانی سوور، سپی و سەوز پێکهاتووە لەگەڵ خۆرە ٢١ تیشکە زێڕینەکەی ناوەڕاستی!"
  },
  {
    question: "کام لەم میوانە لە ناوەڕاستدا دەنکە سوورە شیرینەکانی هەیە؟",
    category: "میوەکان",
    categoryEmoji: "🍎",
    icon: "🍇",
    options: ["مۆز 🍌", "سێو 🍏", "هەنار 🍎", "پرتەقاڵ 🍊"],
    correctIndex: 2,
    funFact: "هەنار یەکێکە لە بەناوبانگترین و بەسوودترین میوەکانی کوردستان!"
  },
  {
    question: "دەنگی پشیلەی شیرین چۆنە کاتێک میهرەبان دەبێت؟",
    category: "دەنگی ئاژەڵان",
    categoryEmoji: "🐱",
    icon: "🐾",
    options: ["هاو هاو 🐶", "میاو میاو 🐱", "قاع قاع 🦆", "حیلە حیلە 🐴"],
    correctIndex: 1,
    funFact: "پشیلە کاتێک داوای خۆشەویستی یان شیر دەکات بە نەرمی دەڵێت میاو!"
  },
  {
    question: "کام لەم ئاژەڵانە خرتوومێکی درێژی هەیە و گەورەترین ئاژەڵی وشکانییە؟",
    category: "ئاژەڵەکان",
    categoryEmoji: "🐘",
    icon: "🌍",
    options: ["مەیموون 🐒", "گورگ 🐺", "فیل 🐘", "ورچ 🐻"],
    correctIndex: 2,
    funFact: "فیلەکان بە خرتوومە درێژەکەیان ئاو دەخۆنەوە و لقە دار و خواردن هەڵدەگرن!"
  },
  {
    question: "پەلکەزێڕینەی ٧ ڕەنگ دوای چی لە ئاسماندا دەردەکەوێت؟",
    category: "سروشت",
    categoryEmoji: "🌈",
    icon: "🌧️",
    options: ["دوای بارانبارین و کاتی خۆرهەڵاتن 🌧️", "لە کاتی شەوی تاریک 🌑", "لە ناو ژووردا 🚪", "لە وەرزی زستاندا بە تەنیا ❄️"],
    correctIndex: 0,
    funFact: "تیشکی خۆر کاتێک بە ناو دڵۆپە بارانەکاندا تێدەپەڕێت، ٧ ڕەنگی جوان لە ئاسمان دروست دەکات!"
  },
  {
    question: "قەڵای دێرین و مێژوویی لە ناوەندی کام شاری کوردستانە؟",
    category: "شار و شوێنەوار",
    categoryEmoji: "🏰",
    icon: "🏛️",
    options: ["سلێمانی", "هەولێر", "دهۆک", "هەڵەبجە"],
    correctIndex: 1,
    funFact: "قەڵای هەولێر یەکێکە لە کۆنترین قەڵا مێژووییەکانی هەموو جیهان!"
  },
  {
    question: "کامیان کەرەستەیەکی سەرەکییە بۆ وێنەکێشان و ڕەنگکردنی تابلۆکان؟",
    category: "هونەر و قوتابخانە",
    categoryEmoji: "🎨",
    icon: "✏️",
    options: ["پێڵاو 👟", "تۆپ ⚽", "بۆیەی ڕەنگاوڕەنگ و فڵچە 🎨", "سەعات ⏰"],
    correctIndex: 2,
    funFact: "بە ڕەنگەکانی زەرد و شین و سوور دەتوانیت هەموو ڕەنگە جوانەکانی دنیا بەدەست بهێنیت!"
  },
  {
    question: "خۆری گەورە لە ئاسماندا چ خزمەتێک بە ئێمە و زەوی دەکات؟",
    category: "زانستی گەردوون",
    categoryEmoji: "☀️",
    icon: "✨",
    options: ["ڕووناکی و گەرمی پێدەبەخشێت ☀️", "بەفر دەبارێنێت ❄️", "شەو دروست دەکات 🌙", "ئاوی لێ دەڕژێت 🌊"],
    correctIndex: 0,
    funFact: "بێ خۆر هیچ ڕووەک و دارێک گەورە نابێت و زەوی سارد و تاریک دەبوو!"
  },
  {
    question: "هەنگ لە ناو شانەکەی خۆیدا چییەکی زۆر بەتام و شیرین دروست دەکات؟",
    category: "مێرووە بەسوودەکان",
    categoryEmoji: "🐝",
    icon: "🍯",
    options: ["هەنگوین 🍯", "ئاو 💧", "شەکر 🍬", "شیر 🥛"],
    correctIndex: 0,
    funFact: "هەنگ بە فڕین بەسەر هەزاران گوڵدا هەنگوینی بەسوود بۆ تەندروستیمان ئامادە دەکات!"
  },
  {
    question: "کام لەم ئاژەڵانە زۆر حەزی لە گێزەرە و گوێیە درێژەکانی دەجوڵێنێت؟",
    category: "ئاژەڵە شیرینەکان",
    categoryEmoji: "🐰",
    icon: "🥕",
    options: ["کەروێشک 🐰", "ڕێوی 🦊", "کیسەڵ 🐢", "شێر 🦁"],
    correctIndex: 0,
    funFact: "کەروێشک زۆر خێرا ڕادەکات و زۆر حەزی لە سەوزە و گێزەری تازەیە!"
  },
  {
    question: "پێش خواردنی ژەمەکان دەبێت چی بکەین بۆ پاراستنی تەندروستیمان؟",
    category: "تەندروستی و پاکوخاوێنی",
    categoryEmoji: "🧼",
    icon: "✨",
    options: ["دەستەکانمان بە ئاو و سابوون بشۆین 🧼", "یەکسەر ڕابکەین بۆ دەرەوە 🏃", "پێڵاو لەپێ بکەین 👟", "بخەوین 😴"],
    correctIndex: 0,
    funFact: "شوشتنی دەستەکان میکرۆبەکان لەناو دەبات و هەمیشە تەندروست و بەهێزت دەهێڵێتەوە!"
  },
  {
    question: "لە جەژنی نەورۆزدا چ هێمایەکی سەرکەوتن لەسەر چیاکان دادەگیرسێنرێت؟",
    category: "جەژن و کلتوور",
    categoryEmoji: "🔥",
    icon: "🏔️",
    options: ["ئاگر و مەشخەڵی نەورۆز 🔥", "گڵۆپی سەیارە 🚗", "یاری کۆمپیوتەر 🎮", "سەهۆڵ 🧊"],
    correctIndex: 0,
    funFact: "ئاگری نەورۆز هێمای هاتنی بەهار و سەرکەوتن و سەرفرازیی گەلی کوردە!"
  },
  {
    question: "باڵندە جوانەکان بە چی لە ئاسماندا بە ئازادی دەفڕن؟",
    category: "باڵندەکان",
    categoryEmoji: "🦅",
    icon: "🕊️",
    options: ["بە باڵەکانیان 🕊️", "بە قاچەکانیان 🦶", "بە کلکیان 🐾", "بە گوێچکەیان 👂"],
    correctIndex: 0,
    funFact: "پەڕ و باڵی باڵندەکان سووک و بەهێزن کە یارمەتییان دەدات بە ئاسانی بفڕن!"
  },
  {
    question: "کامیان گەورەترین میوەی وەرزی هاوینە کە ناوەکەی سوور و زۆر ئاودارە؟",
    category: "میوەکان",
    categoryEmoji: "🍉",
    icon: "☀️",
    options: ["شووتی 🍉", "قۆخ 🍑", "توتفەرەنگی 🍓", "گێلاس 🍒"],
    correctIndex: 0,
    funFact: "شووتی لە وەرزی گەرمای هاویندا لەشی مرۆڤ فێنک و تێر ئاو دەکاتەوە!"
  }
];

const KurdishKidsAI: React.FC<KidsAIProps> = ({ language = 'ku' }) => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'story' | 'riddle' | 'ask' | 'names' | 'games' | 'quiz'>('story');
  const [selectedStoryTheme, setSelectedStoryTheme] = useState('animals');
  
  // کایەی وشە
  const [wordGameIndex, setWordGameIndex] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);
  const [gameSuccess, setGameSuccess] = useState(false);

  // 🏆 تاقیکردنەوەی ژیری و ئەستێرەکان (Kids Smart Quiz)
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizStars, setQuizStars] = useState(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizIsCorrect, setQuizIsCorrect] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

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

    const savedStars = localStorage.getItem('kurdai_kids_quiz_stars');
    if (savedStars) {
      setQuizStars(parseInt(savedStars, 10));
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
    const nextIdx = (wordGameIndex + 1) % WORD_GAMES.length;
    initWordGame(nextIdx);
  };

  // 🏆 لۆجیکی تاقیکردنەوەی ژیری و ئەستێرەکان
  const handleQuizAnswer = (optionIdx: number) => {
    if (quizAnswered) return;
    const currentQ = KIDS_QUIZ_DATA[quizIndex];
    setQuizSelectedOption(optionIdx);
    setQuizAnswered(true);

    if (optionIdx === currentQ.correctIndex) {
      setQuizIsCorrect(true);
      const newScore = quizStars + 1;
      setQuizStars(newScore);
      localStorage.setItem('kurdai_kids_quiz_stars', newScore.toString());
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      setQuizIsCorrect(false);
    }
  };

  const handleNextQuizQuestion = () => {
    if (quizIndex + 1 < KIDS_QUIZ_DATA.length) {
      setQuizIndex(prev => prev + 1);
      setQuizSelectedOption(null);
      setQuizAnswered(false);
      setQuizIsCorrect(false);
    } else {
      setQuizFinished(true);
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 }
      });
    }
  };

  const handleRestartQuiz = () => {
    setQuizIndex(0);
    setQuizSelectedOption(null);
    setQuizAnswered(false);
    setQuizIsCorrect(false);
    setQuizFinished(false);
  };

  const handleKidsRequest = async (overridePrompt?: string) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    let finalPrompt = "";
    if (mode === 'story') {
      const theme = STORY_THEMES.find(t => t.id === (overridePrompt || selectedStoryTheme));
      finalPrompt = `تکایە چیرۆکێکی پەروەردەیی، شیرین و خەیاڵیی کوردی بۆ منداڵان لەسەر بابەتی (${theme?.label || "ئاژەڵانی کوردستان"}) بنووسە. با پڕ بێت لە وشەی خۆش و پەندی میهرەبانی و ئازایەتی.`;
    } else if (mode === 'riddle') {
      finalPrompt = "مەتەڵێکی کوردیی فۆلکلۆری و شیرین بۆ منداڵان لەگەڵ وەڵام و ڕوونکردنەوەکەی بنووسە.";
    } else if (mode === 'ask') {
      if (!input.trim()) {
        setError("تکایە پرسیارەکەت بنووسە.");
        setLoading(false);
        return;
      }
      finalPrompt = `بە شێوازێکی زۆر سادە، خۆش و پەروەردەیی بۆ منداڵان وەڵامی ئەم پرسیارە بدەرەوە: ${input}`;
    }

    try {
      const userEmail = auth.currentUser?.email || "guest_user";
      const res = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/kids-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: finalPrompt, email: userEmail }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Error");
      setResponse(data.response || "وەڵامێک نەدۆزرایەوە.");
    } catch (err: any) {
      setError("خەتایەک لە پەیوەندی بە سێرڤەرەوە ڕوویدا.");
    } finally {
      setLoading(false);
    }
  };

  const fetchKurdishNames = async (gender?: 'girl' | 'boy') => {
    const targetGender = gender || genderMode;
    setGenderMode(targetGender);
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

  const currentQuiz = KIDS_QUIZ_DATA[quizIndex];

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
            <p className="text-[11px] sm:text-xs text-zinc-400">تاقیکردنەوەی ژیری، کایەی ئەستێرەکان، چیرۆکی دەنگی و مەتەڵی فۆلکلۆری</p>
          </div>
        </div>

        {/* باجی ئەستێرەکان لە سەرەوە */}
        <div className="flex items-center gap-2 self-end sm:self-auto bg-slate-950/70 border border-amber-500/40 px-3 py-1.5 rounded-2xl shadow-lg">
          <span className="text-base animate-pulse">⭐</span>
          <span className="text-xs font-black text-amber-300 font-mono">
            {quizStars} ئەستێرە
          </span>
        </div>
      </div>

      {/* 🎛️ تابی بەشەکان (٦ تابی سەرەکی) */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        <button
          type="button"
          onClick={() => { setMode('quiz'); setResponse(null); setNamesList([]); }}
          className={`py-3 px-2 rounded-2xl font-black text-xs transition-all border flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
            mode === 'quiz'
              ? 'bg-amber-500 border-amber-300 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
              : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-zinc-400 hover:text-white'
          }`}
        >
          <span>🏆</span>
          <span>تاقیکردنەوەی ژیری</span>
        </button>

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
          onClick={() => { setMode('games'); setResponse(null); setNamesList([]); }}
          className={`py-3 px-2 rounded-2xl font-black text-xs transition-all border flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
            mode === 'games'
              ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.35)]'
              : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-zinc-400 hover:text-white'
          }`}
        >
          <span>🎮</span>
          <span>کایەی وشە</span>
        </button>

        <button
          type="button"
          onClick={() => { setMode('riddle'); setResponse(null); setNamesList([]); }}
          className={`py-3 px-2 rounded-2xl font-black text-xs transition-all border flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
            mode === 'riddle'
              ? 'bg-orange-600 border-orange-400 text-white shadow-[0_0_20px_rgba(234,88,12,0.35)]'
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
      </div>

      {/* 🏆 بەشی تاقیکردنەوەی ژیری و ئەستێرەکان (Kids Smart Quiz & Star Collector) */}
      {mode === 'quiz' && (
        <div className="space-y-4">
          
          {!quizFinished ? (
            <div className="bg-slate-900/80 backdrop-blur-2xl border-2 border-amber-500/30 rounded-3xl p-4 sm:p-7 space-y-5 shadow-[0_0_40px_rgba(245,158,11,0.15)] text-center relative overflow-hidden animate-in zoom-in-95">
              
              {/* باڕی سەرەوەی پرسیارەکە */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 flex items-center gap-1">
                  <span>{currentQuiz.categoryEmoji}</span>
                  <span>{currentQuiz.category}</span>
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-zinc-400">
                    پرسیاری {quizIndex + 1} لە {KIDS_QUIZ_DATA.length}
                  </span>
                  
                  <button
                    type="button"
                    onClick={() => handlePlayAudio(currentQuiz.question)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-amber-500/20 text-amber-400 border border-slate-700 active:scale-90 transition-all cursor-pointer"
                    title="گوێگرتن لە پرسیارەکە بە دەنگ"
                  >
                    🎙️
                  </button>
                </div>
              </div>

              {/* دەقی پرسیار لەگەڵ ئایکۆنی ڕەنگاوڕەنگ */}
              <div className="py-3 space-y-2">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-400/20 to-yellow-500/10 border border-amber-500/30 flex items-center justify-center text-3xl shadow-inner animate-pulse">
                  {currentQuiz.icon}
                </div>
                <h3 className="text-base sm:text-xl font-black text-white leading-relaxed px-2">
                  {currentQuiz.question}
                </h3>
              </div>

              {/* ٤ بژاردەی وەڵامدانەوە */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {currentQuiz.options.map((opt, idx) => {
                  let btnClass = "bg-slate-950/80 hover:bg-slate-800 border-slate-800 text-zinc-200";

                  if (quizAnswered) {
                    if (idx === currentQuiz.correctIndex) {
                      btnClass = "bg-emerald-950/80 border-emerald-400 text-emerald-200 font-black shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-[1.02]";
                    } else if (idx === quizSelectedOption) {
                      btnClass = "bg-red-950/80 border-red-500 text-red-300";
                    } else {
                      btnClass = "opacity-40 bg-slate-950 border-slate-900 text-zinc-500";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={quizAnswered}
                      onClick={() => handleQuizAnswer(idx)}
                      className={`p-4 rounded-2xl border-2 font-black text-xs sm:text-sm transition-all duration-200 flex items-center justify-between active:scale-95 cursor-pointer shadow-md ${btnClass}`}
                    >
                      <span>{opt}</span>
                      {quizAnswered && idx === currentQuiz.correctIndex && (
                        <span className="text-emerald-400 text-base">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* پەیامی سەرکەوتن یان ڕوونکردنەوەی زانستی */}
              {quizAnswered && (
                <div className="space-y-4 pt-3 animate-in zoom-in-95">
                  <div className={`p-4 rounded-2xl border ${
                    quizIsCorrect 
                      ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200' 
                      : 'bg-rose-950/70 border-rose-500/50 text-rose-200'
                  }`}>
                    <p className="text-xs sm:text-sm font-black mb-1">
                      {quizIsCorrect 
                        ? '🎉 ئافەرم قارەمانی ژیر! وەڵامەکەت ڕاستە (+١ ئەستێرە ⭐)' 
                        : '❤️ وەڵامە دروستەکە ئەمە بوو، هیچ کێشە نییە هەوڵی زیاتر بدە!'}
                    </p>
                    <p className="text-[11px] text-zinc-300 leading-relaxed font-medium">
                      💡 <strong>زانیاری شیرین:</strong> {currentQuiz.funFact}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextQuizQuestion}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-2xl text-xs sm:text-sm shadow-xl active:scale-98 transition-all cursor-pointer"
                  >
                    ➡️ پرسیاری داهاتوو
                  </button>
                </div>
              )}

            </div>
          ) : (
            /* 🏆 شاشەی بردنەوە و کۆتایی تاقیکردنەوەکە */
            <div className="bg-slate-900/90 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-10 text-center space-y-5 shadow-2xl animate-in zoom-in">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-600 flex items-center justify-center text-5xl shadow-[0_0_40px_rgba(245,158,11,0.5)] animate-bounce">
                🏆
              </div>

              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-100">
                  🎉 دەستەکانت خۆش بێت قارەمانی کوردستان!
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 font-medium">
                  تۆ هەموو قۆناغەکانی ئەم تاقیکردنەوەیەیت بە سەرکەوتوویی تەواو کرد و بوویتە خاوەنی کۆمەڵێک ئەستێرەی درەوشاوە!
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 inline-block px-8">
                <span className="text-amber-400 font-black text-lg sm:text-xl font-mono">
                  ⭐ کۆی ئەستێرەکانت: {quizStars} ئەستێرە
                </span>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleRestartQuiz}
                  className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-xs sm:text-sm shadow-xl active:scale-95 transition-all cursor-pointer"
                >
                  🔄 دووبارە یاریپێکردنەوە و کۆکردنەوەی ئەستێرەی نوێ
                </button>
              </div>
            </div>
          )}

        </div>
      )}

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
        <div className="space-y-4">
          <button
            onClick={() => handleKidsRequest()}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-xs sm:text-sm rounded-2xl transition-all shadow-xl active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>خەریکی دۆزینەوەی مەتەڵێکی شیرینە...</span>
              </>
            ) : (
              <>
                <span>🧩</span>
                <span>هێنانی مەتەڵێکی کوردیی نوێ</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 🤔 بەشی پرسیار */}
      {mode === 'ask' && (
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="پرسیارەکەت بنووسە (بۆ نموونە: بۆچی باڵندە دەفڕێت؟)"
              className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl py-3.5 pr-4 pl-12 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 transition-all shadow-inner"
            />
          </div>

          <button
            onClick={() => handleKidsRequest()}
            disabled={loading || !input.trim()}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs sm:text-sm rounded-2xl transition-all shadow-xl active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>وەڵامدانەوەی پرسیارەکە...</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>وەڵامم بدەرەوە بە شێوازی منداڵانە</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 👶 بەشی ناوە کوردییەکان */}
      {mode === 'names' && (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => fetchKurdishNames('girl')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                genderMode === 'girl'
                  ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30'
                  : 'bg-slate-900 text-zinc-400 border border-slate-800'
              }`}
            >
              👧 ناوی کچان
            </button>
            <button
              onClick={() => fetchKurdishNames('boy')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                genderMode === 'boy'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-900 text-zinc-400 border border-slate-800'
              }`}
            >
              👦 ناوی کوڕان
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-zinc-400 space-y-2">
              <span className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin inline-block"></span>
              <p className="text-xs">خەریکی کۆکردنەوەی ناوە جوانەکانە...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
              {namesList.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-emerald-300">{item.name}</h4>
                    <p className="text-[11px] text-zinc-400 pt-0.5">{item.meaning}</p>
                  </div>
                  <button
                    onClick={() => handlePlayAudio(`${item.name}. ${item.meaning}`)}
                    className="p-2 rounded-xl bg-slate-800 text-zinc-300 hover:text-white"
                  >
                    🎙️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 🎮 بەشی کایەی وشەسازی */}
      {mode === 'games' && (
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-purple-500/30 rounded-3xl p-5 sm:p-8 space-y-6 text-center shadow-2xl animate-in zoom-in-95">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
              قۆناغی {wordGameIndex + 1} لە {WORD_GAMES.length}
            </span>
            <button
              onClick={handleRevealAnswer}
              className="text-xs font-bold text-zinc-400 hover:text-purple-300 transition-colors"
            >
              💡 پیشاندانی وەڵام
            </button>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-zinc-400">شارەزایی و ژیری:</span>
            <p className="text-sm sm:text-base font-black text-white">
              {WORD_GAMES[wordGameIndex]?.hint}
            </p>
          </div>

          {/* پیتە هەڵبژێردراوەکان */}
          <div className="flex items-center justify-center gap-2 min-h-[50px]">
            {selectedLetters.map((l, idx) => (
              <span
                key={idx}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-600/30 border border-purple-500 text-white font-black text-lg sm:text-xl flex items-center justify-center shadow-lg"
              >
                {l}
              </span>
            ))}
          </div>

          {/* پیتە تێکەڵەکان بۆ کلیک کردن */}
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
      {response && mode !== 'names' && mode !== 'games' && mode !== 'quiz' && (
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