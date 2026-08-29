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

interface KidsQuizQuestion {
  question: string;
  category: string;
  categoryEmoji: string;
  imageUrl: string;
  options: string[];
  correctIndex: number;
  funFact: string;
}

// 🌟 ٥٠ پرسیاری زۆر دەوڵەمەند، زانستی و فۆتۆگرافی بۆ منداڵانی کوردستان
const KIDS_QUIZ_DATA: KidsQuizQuestion[] = [
  {
    question: "پاشای دارستان و بەهێزترین ئاژەڵ لە وێنەکەدا ناوی چییە؟",
    category: "ئاژەڵەکان",
    categoryEmoji: "🦁",
    imageUrl: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=700&q=80",
    options: ["شێر 🦁", "ڕێوی 🦊", "کەروێشک 🐰", "سمۆرە 🐿️"],
    correctIndex: 0,
    funFact: "شێر بەهۆی ئازایەتی و دەنگە بەرزەکەیەوە پێی دەوترێت پاشای دارستان!"
  },
  {
    question: "ئاڵای پیرۆزی کوردستان لە چەند ڕەنگ پێکهاتووە؟",
    category: "نیشتمان",
    categoryEmoji: "☀️",
    imageUrl: "/kurdish_flag.jpg",
    options: ["٢ ڕەنگ", "٤ ڕەنگ (سوور، سپی، سەوز، زەرد)", "٦ ڕەنگ", "١ ڕەنگ"],
    correctIndex: 1,
    funFact: "ئاڵای پیرۆزی کوردستان لە ٤ ڕەنگ پێکهاتووە: سوور، سپی، سەوز لەگەڵ خۆرە زەردە ٢١ تیشکەکەی ناوەڕاستی!"
  },
  {
    question: "ئەم میوە بەتام و پڕ لە سوودەی لە وێنەکەدا دەبینرێت ناوی چییە؟",
    category: "میوە بەسوودەکان",
    categoryEmoji: "🍇",
    imageUrl: "/kids_pomegranate.jpg",
    options: ["مۆز 🍌", "سێو 🍏", "هەنار", "پرتەقاڵ 🍊"],
    correctIndex: 2,
    funFact: "هەنار یەکێکە لە بەناوبانگترین و بەسوودترین میوەکانی کوردستان کە دەنکە سوورە بەتامەکانی پڕن لە ڤیتامین!"
  },
  {
    question: "دەنگی ئەم پشیلە شیرینە چۆنە کاتێک میهرەبان دەبێت؟",
    category: "دەنگی ئاژەڵان",
    categoryEmoji: "🐱",
    imageUrl: "/kids_cat.jpg",
    options: ["هاو هاو 🐶", "میاو میاو 🐱", "قاع قاع 🦆", "حیلە حیلە 🐴"],
    correctIndex: 1,
    funFact: "پشیلە کاتێک داوای خۆشەویستی یان شیر دەکات بە نەرمی دەڵێت میاو!"
  },
  {
    question: "کام لەم ئاژەڵانە خرتوومێکی درێژی هەیە و گەورەترین ئاژەڵی وشکانییە؟",
    category: "ئاژەڵەکان",
    categoryEmoji: "🐘",
    imageUrl: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=700&q=80",
    options: ["مەیموون 🐒", "گورگ 🐺", "فیل 🐘", "ورچ 🐻"],
    correctIndex: 2,
    funFact: "فیلەکان بە خرتوومە درێژەکەیان ئاو دەخۆنەوە و لقە دار و خواردن هەڵدەگرن!"
  },
  {
    question: "پەلکەزێڕینەی ٧ ڕەنگ دوای چی لە ئاسماندا بە جوانی دەردەکەوێت؟",
    category: "سروشت",
    categoryEmoji: "🌈",
    imageUrl: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=700&q=80",
    options: ["دوای بارانبارین و کاتی خۆرهەڵاتن 🌧️", "لە کاتی شەوی تاریک 🌑", "لە ناو ژووردا 🚪", "لە وەرزی زستاندا بە تەنیا ❄️"],
    correctIndex: 0,
    funFact: "تیشکی خۆر کاتێک بە ناو دڵۆپە بارانەکاندا تێدەپەڕێت، ٧ ڕەنگی جوان لە ئاسمان دروست دەکات!"
  },
  {
    question: "ئەم قەڵا دێرین و مێژووییە لە ناوەندی کام شاری کوردستانە؟",
    category: "شار و شوێنەوار",
    categoryEmoji: "🏰",
    imageUrl: "/erbil.jpg",
    options: ["سلێمانی", "هەولێر", "دهۆک", "هەڵەبجە"],
    correctIndex: 1,
    funFact: "قەڵای هەولێر یەکێکە لە کۆنترین قەڵا مێژووییەکانی هەموو جیهان کە ژیانی تێدا بەردەوام بووە!"
  },
  {
    question: "کامیان کەرەستەیەکی سەرەکییە بۆ وێنەکێشان و ڕەنگکردنی تابلۆکان؟",
    category: "هونەر و قوتابخانە",
    categoryEmoji: "🎨",
    imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=700&q=80",
    options: ["پێڵاو 👟", "تۆپ ⚽", "بۆیەی ڕەنگاوڕەنگ و فڵچە 🎨", "سەعات ⏰"],
    correctIndex: 2,
    funFact: "بە ڕەنگەکانی زەرد و شین و سوور دەتوانیت هەموو ڕەنگە جوانەکانی دنیا دروست بکەیت!"
  },
  {
    question: "خۆری گەورە لە ئاسماندا چ خزمەتێک بە ئێمە و زەوی دەکات؟",
    category: "زانستی گەردوون",
    categoryEmoji: "☀️",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=700&q=80",
    options: ["ڕووناکی و گەرمی پێدەبەخشێت ☀️", "بەفر دەبارێنێت ❄️", "شەو دروست دەکات 🌙", "ئاوی لێ دەڕژێت 🌊"],
    correctIndex: 0,
    funFact: "بێ خۆر هیچ ڕووەک و دارێک گەورە نابێت و زەوی سارد و تاریک دەبوو!"
  },
  {
    question: "هەنگ لە ناو شانەکەی خۆیدا چییەکی زۆر بەتام و شیرین دروست دەکات؟",
    category: "مێرووە بەسوودەکان",
    categoryEmoji: "🐝",
    imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=700&q=80",
    options: ["هەنگوین 🍯", "ئاو 💧", "شەکر 🍬", "شیر 🥛"],
    correctIndex: 0,
    funFact: "هەنگ بە فڕین بەسەر هەزاران گوڵدا هەنگوینی بەسوود بۆ تەندروستیمان ئامادە دەکات!"
  },
  {
    question: "کام لەم ئاژەڵانە زۆر حەزی لە گێزەرە و گوێیە درێژەکانی دەجوڵێنێت؟",
    category: "ئاژەڵە شیرینەکان",
    categoryEmoji: "🐰",
    imageUrl: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=700&q=80",
    options: ["کەروێشک 🐰", "ڕێوی 🦊", "کیسەڵ 🐢", "شێر 🦁"],
    correctIndex: 0,
    funFact: "کەروێشک زۆر خێرا ڕادەکات و زۆر حەزی لە سەوزە و گێزەری تازەیە!"
  },
  {
    question: "پێش خواردنی ژەمەکان دەبێت چی بکەین بۆ پاراستنی تەندروستیمان؟",
    category: "تەندروستی و پاکوخاوێنی",
    categoryEmoji: "🧼",
    imageUrl: "https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=700&q=80",
    options: ["دەستەکانمان بە ئاو و سابوون بشۆین 🧼", "یەکسەر ڕابکەین بۆ دەرەوە 🏃", "پێڵاو لەپێ بکەین 👟", "بخەوین 😴"],
    correctIndex: 0,
    funFact: "شوشتنی دەستەکان میکرۆبەکان لەناو دەبات و هەمیشە تەندروست و بەهێزت دەهێڵێتەوە!"
  },
  {
    question: "لە جەژنی نەورۆزدا چ هێمایەکی سەرکەوتن لەسەر چیاکان دادەگیرسێنرێت؟",
    category: "جەژن و کلتوور",
    categoryEmoji: "🔥",
    imageUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=700&q=80",
    options: ["ئاگر و مەشخەڵی نەورۆز 🔥", "گڵۆپی سەیارە 🚗", "یاری کۆمپیوتەر 🎮", "سەهۆڵ 🧊"],
    correctIndex: 0,
    funFact: "ئاگری نەورۆز هێمای هاتنی بەهار و سەرکەوتن و سەرفرازیی گەلی کوردە!"
  },
  {
    question: "باڵندە جوانەکان لە وێنەکەدا بە چی لە ئاسماندا بە ئازادی دەفڕن؟",
    category: "باڵندەکان",
    categoryEmoji: "🕊️",
    imageUrl: "https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=700&q=80",
    options: ["بە باڵەکانیان 🕊️", "بە قاچەکانیان 🦶", "بە کلکیان 🐾", "بە گوێچکەیان 👂"],
    correctIndex: 0,
    funFact: "پەڕ و باڵی باڵندەکان سووک و بەهێزن کە یارمەتییان دەدات بە ئاسانی بفڕن!"
  },
  {
    question: "کامیان گەورەترین میوەی وەرزی هاوینە کە ناوەکەی سوورە و زۆر ئاودارە؟",
    category: "میوەکان",
    categoryEmoji: "🍉",
    imageUrl: "https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?auto=format&fit=crop&w=700&q=80",
    options: ["شووتی 🍉", "قۆخ 🍑", "توتفەرەنگی 🍓", "گێلاس 🍒"],
    correctIndex: 0,
    funFact: "شووتی لە وەرزی گەرمای هاویندا لەشی مرۆڤ فێنک و تێر ئاو دەکاتەوە!"
  },
  {
    question: "ئەم ئاژەڵە ڕەسەن و بەوەفایەی سوارچاکی ناوی چییە؟",
    category: "ئاژەڵە ڕەسەنەکان",
    categoryEmoji: "🐴",
    imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=700&q=80",
    options: ["ئەسپ 🐴", "مانگا 🐄", "بزن 🐐", "کەر 🫏"],
    correctIndex: 0,
    funFact: "ئەسپی کوردی یەکێکە لە بەهێزترین و خێراترین ئەسپە ڕەسەنەکانی دنیا!"
  },
  {
    question: "پایتەختی ڕۆشنبیری و شاری چیای گۆیژە لە کوردستان ناوی چییە؟",
    category: "شارەکانی کوردستان",
    categoryEmoji: "🏰",
    imageUrl: "/slemani.jpg",
    options: ["سلێمانی", "هەولێر", "دهۆک", "کەرکووک"],
    correctIndex: 0,
    funFact: "سلێمانی شاری شاعیران و هونەرمەندانی گەورەی کوردە و هەوایەکی یەکجار پاک و فێنکی هەیە!"
  },
  {
    question: "ئەم میوە خڕ و سوورە شیرینەی کە ڕۆژانە دەیخۆین ناوی چییە؟",
    category: "میوەکان",
    categoryEmoji: "🍎",
    imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=700&q=80",
    options: ["سێو 🍎", "مۆز 🍌", "خەیار 🥒", "پیاز 🧅"],
    correctIndex: 0,
    funFact: "خواردنی یەک سێو لە ڕۆژێکدا تەندروستیت دەپارێزێت و وزەت پێدەبەخشێت!"
  },
  {
    question: "مانگی گەشاوە لە شەودا لە کوێ بە درەوشاوەیی دەبینرێت؟",
    category: "زانستی گەردوون",
    categoryEmoji: "🌙",
    imageUrl: "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?auto=format&fit=crop&w=700&q=80",
    options: ["لە ناو ئاسمانی شەودا 🌙", "لە ژێر زەوی 🕳️", "لە ناو ئاودا 🌊", "لە ناو ماڵ 🏠"],
    correctIndex: 0,
    funFact: "مانگ تیشکی خۆر وەردەگرێت و لە شەودا ڕووناکییەکی نەرم بە زەوی دەبەخشێت!"
  },
  {
    question: "ئەم سمۆرە شیرینەی دارستان خەریکی کۆکردنەوەی چییە؟",
    category: "ئاژەڵە بچووکەکان",
    categoryEmoji: "🐿️",
    imageUrl: "https://images.unsplash.com/photo-1507666405895-422eee7d517f?auto=format&fit=crop&w=700&q=80",
    options: ["بەڕوو و گوێز 🌰", "گۆشت 🥩", "پیتزا 🍕", "شیرینی 🍬"],
    correctIndex: 0,
    funFact: "سمۆرەکان بەڕووەکان لە ژێر زەویدا دەشارنەوە کە دواتر دەبنە درەختی گەورەی دارستان!"
  },
  {
    question: "مەیموونە زیرەکەکان زۆر حەزیان لە خواردنی چ میوەیەکی درێژی زەردە؟",
    category: "میوە و ئاژەڵان",
    categoryEmoji: "🍌",
    imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=700&q=80",
    options: ["مۆز 🍌", "شووتی 🍉", "پەتاتە 🥔", "سیر 🧄"],
    correctIndex: 0,
    funFact: "مۆز پڕە لە پۆتاسیۆم و یارمەتی ماسولکەکان دەدات بەهێز و چالاک بن!"
  },
  {
    question: "ئەم هاوڕێ بەوەفایەی مرۆڤ کاتێک دڵخۆشە کلکی دەجوڵێنێت ناوی چییە؟",
    category: "ئاژەڵە ماڵییەکان",
    categoryEmoji: "🐶",
    imageUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=700&q=80",
    options: ["سەگ 🐶", "گورگ 🐺", "شێر 🦁", "ورچ 🐻"],
    correctIndex: 0,
    funFact: "سەگەکان هەستێکی یەکجار بەهێزی بۆنکردنیان هەیە و زۆر پارێزەری مرۆڤن!"
  },
  {
    question: "شاری دڵگیری چیای بەرز و کانییە فێنکەکان لە بادینان ناوی چییە؟",
    category: "شارەکانی کوردستان",
    categoryEmoji: "🏔️",
    imageUrl: "/duhok.jpg",
    options: ["دهۆک", "کەرکووک", "بەغدا", "بەسرە"],
    correctIndex: 0,
    funFact: "دهۆک شاری سروشتی جوان و گەشتیارییە و شوێنی شوێنەوارە دێرینەکانی کوردستانە!"
  },
  {
    question: "ڕۆژانە پێش خەوتن بۆ پاراستنی ددانەکانمان دەبێت چی بەکاربهێنین؟",
    category: "تەندروستی و پاکوخاوێنی",
    categoryEmoji: "🪥",
    imageUrl: "https://images.unsplash.com/photo-1559591937-e1032b4b45ef?auto=format&fit=crop&w=700&q=80",
    options: ["فڵچەی ددان و هەویری مسواک 🪥", "شیرینی زۆر 🍭", "چەکوش 🔨", "قەڵەم ✏️"],
    correctIndex: 0,
    funFact: "شوشتنی ددانەکان بۆ ماوەی ٢ خولەک دەیانپارێزێت لە کلۆربوون و ددانەکانت سپی دەهێڵێتەوە!"
  },
  {
    question: "ئەم میوە هێشووییە شیرینەی کە لە باخەکانی کوردستاندا پێدەگات ناوی چییە؟",
    category: "میوە بەتامەکان",
    categoryEmoji: "🍇",
    imageUrl: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=700&q=80",
    options: ["ترێ 🍇", "زەیتوون 🫒", "هەنجیر 🫐", "سێو 🍎"],
    correctIndex: 0,
    funFact: "ترێی کوردستان یەکێکە لە شیرینترین ترێیەکانی دنیا کە مێوژ و دۆشاوی بەتامی لێ دروست دەکرێت!"
  },
  {
    question: "کامیان کەرەستەیەکی سەرەکییە بۆ یاری وەرزشیی تۆپی پێ لە یاریگادا؟",
    category: "وەرزش و یاری",
    categoryEmoji: "⚽",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=700&q=80",
    options: ["تۆپ ⚽", "تەلەفزیۆن 📺", "تەلەفۆن 📱", "سەرین 🛏️"],
    correctIndex: 0,
    funFact: "وەرزش و تۆپی پێ دڵ و ماسولکەکانت بەهێز دەکات و هەمیشە چالاکت دەهێڵێتەوە!"
  },
  {
    question: "ئەم کەرەستە دوو تایەیە چییە کە بە پێ لێدەخوڕرێت بۆ وەرزش و گەشت؟",
    category: "وەرزش و یاری",
    categoryEmoji: "🚲",
    imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=700&q=80",
    options: ["پاسکیل 🚲", "سەیارە 🚗", "شەمەندەفەر 🚆", "فڕۆکە ✈️"],
    correctIndex: 0,
    funFact: "پاسکیلسواری هاوسەنگی جەستە فێر دەکات و ژینگە بە پاکی دەهێڵێتەوە چونکە دووکەڵی نییە!"
  },
  {
    question: "ئەم گیاندارە باڵ نەخشینە جوانەی بەسەر گوڵەکاندا دەفڕێت چییە؟",
    category: "باڵندە و مێروو",
    categoryEmoji: "🦋",
    imageUrl: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=700&q=80",
    options: ["پەپوولە 🦋", "مێش 🪰", "پشکۆلە 🪲", "مرواری 🦪"],
    correctIndex: 0,
    funFact: "پەپوولە لە کرمۆکەیەکی بچووکەوە دەبێتە جوانترین گیانداری باڵداری ناو سروشت!"
  },
  {
    question: "ئەم ئاژەڵە قەبارە گەورەیەی ناو دارستان کە حەزی لە ماسی و هەنگوینە چییە؟",
    category: "ئاژەڵە کێوییەکان",
    categoryEmoji: "🐻",
    imageUrl: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=700&q=80",
    options: ["ورچ 🐻", "کەروێشک 🐰", "پشیلە 🐱", "سمۆرە 🐿️"],
    correctIndex: 0,
    funFact: "ورچەکان لە وەرزی زستاندا دەچنە ناو ئەشکەوتەکان و خەوی زستانە دەکەن تا بەهار!"
  },
  {
    question: "شاری هێمای خۆڕاگری و گوڵە نێرگزەکانی کوردستان ناوی چییە؟",
    category: "شارەکانی کوردستان",
    categoryEmoji: "🌼",
    imageUrl: "/halabja.jpg",
    options: ["هەڵەبجە", "بەغدا", "موسڵ", "قاهیرە"],
    correctIndex: 0,
    funFact: "هەڵەبجە شاری مەزڵوومیەت و هێمای ئاشتییە لە هەموو جیهاندا!"
  },
  {
    question: "سەرچاوەی گەورەی زانست، فێربوون و چیرۆکە شیرینەکان لە ناو چیدایە؟",
    category: "فێربوون و زانست",
    categoryEmoji: "📚",
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=700&q=80",
    options: ["کتێب 📚", "تۆپ ⚽", "پێڵاو 👟", "تەباغ 🍳"],
    correctIndex: 0,
    funFact: "خوێندنەوەی کتێب مێشکت گەشە پێدەدات و دەتباتە ناو دنیای داهێنان و سەرکەوتن!"
  },
  {
    question: "ئەم ئامرازە گەورەیەی کە سەرنشینان لە ئاسماندا دەگوازێتەوە چییە؟",
    category: "ئامرازەکانی گواستنەوە",
    categoryEmoji: "✈️",
    imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=700&q=80",
    options: ["فڕۆکە ✈️", "پاسکیل 🚲", "ئۆتۆمبێل 🚗", "پاپۆڕ 🚢"],
    correctIndex: 0,
    funFact: "فڕۆکەکان لە بەرزایی چەندین هەزار مەتردا زۆر خێراتر لە هەموو ئامرازەکانی تر دەفڕن!"
  },
  {
    question: "ئەم ئاژەڵە لەسەرخۆیەی کە قەڵغانێکی ڕەق لەسەر پشتیەتی ناوی چییە؟",
    category: "ئاژەڵە شیرینەکان",
    categoryEmoji: "🐢",
    imageUrl: "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=700&q=80",
    options: ["کیسەڵ 🐢", "ڕێوی 🦊", "کەروێشک 🐰", "شێر 🦁"],
    correctIndex: 0,
    funFact: "کیسەڵەکان دەتوانن زیاتر لە ١٠٠ ساڵ بە ئارامی و تەندروستی لەسەر زەوی بژین!"
  },
  {
    question: "ئەم میوە سوورە بەتامەی کە خاڵە وردەکانی لەسەرە ناوی چییە؟",
    category: "میوەکان",
    categoryEmoji: "🍓",
    imageUrl: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=700&q=80",
    options: ["توتفەرەنگی (شلیک) 🍓", "مۆز 🍌", "سێو 🍏", "پرتەقاڵ 🍊"],
    correctIndex: 0,
    funFact: "توتفەرەنگی تەنها میوەیە کە دەنکەکانی لەسەر ڕووی دەرەوەی میوەکەیە نەک لە ناوی!"
  },
  {
    question: "ئەستێرە درەوشاوەکان لە کەی ئاسمان بە جوانی ڕووناک دەکەنەوە؟",
    category: "زانستی گەردوون",
    categoryEmoji: "✨",
    imageUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=700&q=80",
    options: ["لە شەوی تاریک و ساماڵدا ✨", "لە ناو نیوەڕۆ ☀️", "لە ناو ژووری داخراو 🚪", "لە ژێر زەوی 🕳️"],
    correctIndex: 0,
    funFact: "هەر ئەستێرەیەک کە لە ئاسماندا دەیبینیت خۆرێکی گەورەیە کە ملیۆنان کیلۆمەتر لێمانەوە دوورە!"
  },
  {
    question: "باڵابەرزترین ئاژەڵی سەر زەوی بە ملە درێژەکەی ناوی چییە؟",
    category: "ئاژەڵە باڵابەرزەکان",
    categoryEmoji: "🦒",
    imageUrl: "https://images.unsplash.com/photo-1538099130811-745e64318258?auto=format&fit=crop&w=700&q=80",
    options: ["زەڕافە 🦒", "مەیموون 🐒", "گورگ 🐺", "سەگ 🐶"],
    correctIndex: 0,
    funFact: "زەڕافە بەهۆی ملە درێژەکەیەوە دەتوانێت بە ئاسانی گەڵای لوتکەی بەرزترین دارەکان بخوات!"
  },
  {
    question: "لە وەرزی زستاندا چ دیاردەیەکی سپی و جوان چیاکانی کوردستان دادەپۆشێت؟",
    category: "کەشوهەوا و وەرزەکان",
    categoryEmoji: "❄️",
    imageUrl: "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=700&q=80",
    options: ["بەفر ❄️", "بارانی بەخوڕ 🌧️", "تیشکی گەرم ☀️", "تۆزوخۆڵ 🌪️"],
    correctIndex: 0,
    funFact: "بەفری سەر چیاکانی کوردستان لە بەهاردا دەتوێتەوە و دەبێتە ئاوی پاکی کانی و ڕووبارەکان!"
  },
  {
    question: "ئەم ئاژەڵە زرنگ و زیرەکەی ناو چیرۆکە فۆلکلۆرییەکان چییە؟",
    category: "ئاژەڵە فێڵبازەکان",
    categoryEmoji: "🦊",
    imageUrl: "https://images.unsplash.com/photo-1516934024742-b461fba47600?auto=format&fit=crop&w=700&q=80",
    options: ["ڕێوی 🦊", "کەر 🫏", "مانگا 🐄", "سمۆرە 🐿️"],
    correctIndex: 0,
    funFact: "ڕێوی هەستێکی یەکجار تیژی بیستن و بینینی هەیە بۆ دۆزینەوەی خواردن لە شەودا!"
  },
  {
    question: "ئەم کەرەستە ڕەنگاوڕەنگەی بە دەزووی دەستی منداڵان لە ناو باڵادا دەفڕێت چییە؟",
    category: "یارییەکانی منداڵان",
    categoryEmoji: "🪁",
    imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=700&q=80",
    options: ["کۆلارە 🪁", "پاسکیل 🚲", "تۆپ ⚽", "قەڵەم ✏️"],
    correctIndex: 0,
    funFact: "فڕینی کۆلارە لە وەرزی نەورۆز و بەهاردا یەکێکە لە خۆشترین یارییە فۆلکلۆرییەکانی منداڵانی کورد!"
  },
  {
    question: "ئەم ئاژەڵە بەزمخۆشەی لەسەر دارەکان بازدەدات و حەزی لە مۆزە چییە؟",
    category: "ئاژەڵە زیرەکەکان",
    categoryEmoji: "🐒",
    imageUrl: "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=700&q=80",
    options: ["مەیموون 🐒", "پڵنگ 🐆", "گورگ 🐺", "ئاسک 🦌"],
    correctIndex: 0,
    funFact: "مەیموونەکان دەستیان زۆر بەهێزە و دەتوانن وەک مرۆڤ شتەکان بە پەنجەکانیان بگرن!"
  },
  {
    question: "ئاوی بەخوڕی ناو شاخەکانی کوردستان کە لە بەرزاییەوە دێتە خوارێ چی پێ دەوترێت؟",
    category: "سروشتی کوردستان",
    categoryEmoji: "🌊",
    imageUrl: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=700&q=80",
    options: ["تاڤگە (وەک گەلی عەلی بەگ) 🌊", "بیابان 🏜️", "ئاگر 🔥", "پرد 🌉"],
    correctIndex: 0,
    funFact: "تاڤگەی گەلی عەلی بەگ یەکێکە لە جوانترین تاڤگەکانی هەموو ڕۆژهەڵاتی ناوەڕاست!"
  },
  {
    question: "ئەم گیاندارە زیرەک و دۆستانەیەی ناو دەریاکان ناوی چییە؟",
    category: "ئاژەڵانی دەریا",
    categoryEmoji: "🐬",
    imageUrl: "https://images.unsplash.com/photo-1570481662006-a3a1374699e8?auto=format&fit=crop&w=700&q=80",
    options: ["دۆلفین 🐬", "مار 🐍", "شێر 🦁", "ڕێوی 🦊"],
    correctIndex: 0,
    funFact: "دۆلفینەکان زۆر میهرەبانن و حەزیان لە یاری و هاوڕێیەتییە لەگەڵ مرۆڤدا!"
  },
  {
    question: "نانە خۆش و بەتامی سەر سفرەکانمان لە دانەوێڵەی چی دروست دەکرێت؟",
    category: "خواردن و کشتوکاڵ",
    categoryEmoji: "🌾",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80",
    options: ["گەنم 🌾", "دار 🌲", "بەرد 🪨", "ئاسن ⚙️"],
    correctIndex: 0,
    funFact: "کوردستان دێرینترین خاکی جیهانە کە مرۆڤ گەنمی تێدا چاندووە و نانی لێ دروستکردووە!"
  },
  {
    question: "ئەم کەشتییە بەهێزەی بەرەو ئەستێرە و بۆشایی ئاسمان هەڵدەفڕێت چییە؟",
    category: "زانست و گەردوون",
    categoryEmoji: "🚀",
    imageUrl: "https://images.unsplash.com/photo-1517976487502-570a256a4eb8?auto=format&fit=crop&w=700&q=80",
    options: ["کەشتی بۆشایی (ڕۆکێت) 🚀", "پاسکیل 🚲", "سەیارە 🚗", "تۆپ ⚽"],
    correctIndex: 0,
    funFact: "کەشتی بۆشایی بە خێراییەکی زۆر زیاتر لە دەنگ بەرز دەبێتەوە تا بگاتە مانگ و ئەستێرەکان!"
  },
  {
    question: "شەوانە پێش کاتژمێر چەند باشە منداڵان بخەون بۆ ئەوەی گەشەیەکی تەندروست بکەن؟",
    category: "تەندروستی و گەشە",
    categoryEmoji: "😴",
    imageUrl: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=700&q=80",
    options: ["زوو لە نێوان کاتژمێر ٨ تا ٩ی شەو 😴", "کاتژمێر ٤ی بەیانی 🌙", "هەر نەخەون ❌", "کاتی نیوەڕۆ ☀️"],
    correctIndex: 0,
    funFact: "هۆرمۆنی باڵابەرزبوون و گەشەی مێشک لە کاتی خەوی قووڵی سەرەتای شەودا کار دەکات!"
  },
  {
    question: "ئەم گوڵە زەردە گەورەیەی کە هەمیشە ڕووی لە تیشکی خۆرە چییە؟",
    category: "گوڵ و ڕووەک",
    categoryEmoji: "🌻",
    imageUrl: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=700&q=80",
    options: ["گوڵەبەڕۆژە 🌻", "کاکتوس 🌵", "سێو 🍎", "داربەڕوو 🌳"],
    correctIndex: 0,
    funFact: "گوڵەبەڕۆژە بە ڕۆژدا لەگەڵ جوڵەی خۆر سەرەکەی دەسوڕێنێت بۆ وەرگرتنی زیاتری تیشک!"
  },
  {
    question: "بۆ بەهێزبوونی ماسولکە و ئێسکەکانمان، ڕۆژانە پێویستە چی بکەین؟",
    category: "وەرزش و تەندروستی",
    categoryEmoji: "🏃",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80",
    options: ["وەرزش و ڕاکردن و یاریی بەسوود 🏃", "هەموو ڕۆژ لەسەر جێگە بمێنینەوە 🛌", "شیرینی زۆر بخۆین 🍫", "دابنیشین 🪑"],
    correctIndex: 0,
    funFact: "وەرزش مێشکت تیژ دەکات و دەبێتە هۆی ئەوەی لە وانەکانتدا نمرەی بەرز بەدەست بهێنیت!"
  },
  {
    question: "ئەم ئامرازە چییە کە کاتمان پێ دەڵێت بۆ ئەوەی لە کاتی خۆیدا کارەکانمان بکەین؟",
    category: "ئامرازەکان",
    categoryEmoji: "⏰",
    imageUrl: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=700&q=80",
    options: ["سەعات و کاتژمێر ⏰", "پێڵاو 👟", "تۆپ ⚽", "پەرداخ 🥛"],
    correctIndex: 0,
    funFact: "ڕێکخستنی کات کلیلی سەرکەوتنی هەموو مرۆڤە زیرەک و داهێنەرەکانی جیهانە!"
  },
  {
    question: "کاتێک هاوڕێیەکمان یان دایک و باوکمان پێویستیان بە یارمەتی بوو، دەبێت چی بکەین؟",
    category: "ڕەوشت و میهرەبانی",
    categoryEmoji: "🤝",
    imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=700&q=80",
    options: ["بە خۆشحاڵییەوە یارمەتییان بدەین 🤝", "ڕابکەین و پشتگوێیان بخەین ❌", "پێبکەنین 😶", "قسە نەکەین 🤐"],
    correctIndex: 0,
    funFact: "میهرەبانی و دەستباربوونی کەسانی تر جوانی و گەورەیی دڵت دەردەخات!"
  },
  {
    question: "چیا سەرکەش و بەرزەکانی کوردستان هێمای چی ڕەنگینن لە مێژووماندا؟",
    category: "نیشتمانی کوردستان",
    categoryEmoji: "⛰️",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=700&q=80",
    options: ["هێمای ئازادی و سەرفرازی و پارێزگاریی کورد ⛰️", "هێمای ساردی ❄️", "هێمای تاریکی 🌑", "هێمای خەوتن 😴"],
    correctIndex: 0,
    funFact: "چیاکانی کوردستان هەمیشە باشترین پەناگە و هێمای پارێزەری گەلی کورد بوون بە درێژایی مێژوو!"
  }
];

const KurdishKidsAI: React.FC<KidsAIProps> = ({ language = 'ku' }) => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'quiz' | 'story' | 'games' | 'riddle' | 'ask' | 'names'>('quiz');
  
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

    const savedQIndex = localStorage.getItem('kurdai_kids_quiz_index');
    if (savedQIndex) {
      const parsed = parseInt(savedQIndex, 10);
      if (!isNaN(parsed) && parsed < KIDS_QUIZ_DATA.length) {
        setQuizIndex(parsed);
      }
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
      const nextIdx = quizIndex + 1;
      setQuizIndex(nextIdx);
      localStorage.setItem('kurdai_kids_quiz_index', nextIdx.toString());
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
    localStorage.setItem('kurdai_kids_quiz_index', '0');
    setQuizSelectedOption(null);
    setQuizAnswered(false);
    setQuizIsCorrect(false);
    setQuizFinished(false);
  };

  const handleKidsRequest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    let finalPrompt = "";
    if (mode === 'story') {
      finalPrompt = "تکایە چیرۆکێکی ئەفسوناوی، پەروەردەیی، زۆر شیرین و خەیاڵیی کوردی بۆ منداڵان بنووسە بە دەستەواژەی خۆش و جوان کە پڕ بێت لە پەندی میهرەبانی، هاوڕێیەتی، و ئازایەتی.";
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
      
      {/* 🧭 سەرپەڕەی شاد و ئارام */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-pink-950/40 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-800/80 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3 text-right">
          <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 p-0.5 shadow-[0_0_20px_rgba(245,158,11,0.25)] shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl sm:text-2xl">
              🧸
            </div>
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>جیهانی منداڵانی KurdAI</span>
              <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30 font-mono font-bold uppercase">
                Kids Pro
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-400">تاقیکردنەوەی ژیری (٥٠ قۆناغ)، کایەی ئەستێرەکان، چیرۆکی دەنگی و مەتەڵی فۆلکلۆری</p>
          </div>
        </div>

        {/* باجی ئەستێرەکان لە سەرەوە */}
        <div className="flex items-center gap-2 self-end sm:self-auto bg-slate-950/70 border border-amber-500/40 px-3.5 py-1.5 rounded-2xl shadow-lg">
          <span className="text-base">⭐</span>
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

      {/* 🏆 بەشی تاقیکردنەوەی ژیری و ئەستێرەکان (Kids Smart Quiz & Star Collector - 50 Questions) */}
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
                  <span className="text-xs font-mono font-bold text-zinc-300 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
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

              {/* 🎨 وێنەی ڕاستەقینەی پرسیارەکە */}
              <div className="py-2 space-y-3">
                <div className="relative w-full max-w-sm h-48 sm:h-56 mx-auto rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.2)] bg-slate-950">
                  <img 
                    src={currentQuiz.imageUrl} 
                    alt={currentQuiz.category}
                    className="w-full h-full object-cover rounded-[22px] transition-transform duration-300 hover:scale-105"
                    loading="eager"
                    onError={(e) => {
                      e.currentTarget.src = "/baby.webp";
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-amber-500/30 text-xs font-bold text-amber-300 flex items-center gap-1">
                    <span>{currentQuiz.categoryEmoji}</span>
                    <span>{currentQuiz.category}</span>
                  </div>
                </div>

                <h3 className="text-base sm:text-xl font-black text-white leading-relaxed px-2">
                  {currentQuiz.question}
                </h3>
              </div>

              {/* ٤ بژاردەی وەڵامدانەوە */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {currentQuiz.options.map((opt, idx) => {
                  let btnClass = "bg-slate-950/90 hover:bg-slate-800 border-slate-800 text-zinc-100";

                  if (quizAnswered) {
                    if (idx === currentQuiz.correctIndex) {
                      btnClass = "bg-emerald-950 border-emerald-400 text-emerald-200 font-black shadow-[0_0_25px_rgba(16,185,129,0.5)] scale-[1.02]";
                    } else if (idx === quizSelectedOption) {
                      btnClass = "bg-red-950 border-red-500 text-red-300";
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
                        <span className="text-emerald-400 text-lg">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* پەیامی سەرکەوتن یان ڕوونکردنەوەی زانستی */}
              {quizAnswered && (
                <div className="p-4 rounded-2xl border bg-slate-950/90 border-slate-800 text-right animate-in zoom-in-95 space-y-1.5">
                  <p className="text-xs sm:text-sm font-black">
                    {quizIsCorrect 
                      ? '🎉 ئافەرم قارەمانی ژیر! وەڵامەکەت تەواوە (+١ ئەستێرە ⭐)' 
                      : '❤️ وەڵامە دروستەکە دیاری کرا، لە پرسیاری دواتر سەرکەوتوو دەبیت!'}
                  </p>
                  <p className="text-[11px] sm:text-xs text-zinc-300 leading-relaxed font-medium">
                    💡 <strong>زانیاری شیرین:</strong> {currentQuiz.funFact}
                  </p>
                </div>
              )}

              {/* ➡️ دوگمەی پرسیاری داهاتوو (هەمیشە زەق و دیارە) */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleNextQuizQuestion}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-2xl text-xs sm:text-sm shadow-[0_0_25px_rgba(16,185,129,0.35)] active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{quizAnswered ? "➡️ پرسیاری داهاتوو" : "تێپەڕاندن بۆ پرسیاری داهاتوو ➡️"}</span>
                </button>
              </div>

            </div>
          ) : (
            /* 🏆 شاشەی بردنەوە و کۆتایی تاقیکردنەوەکە */
            <div className="bg-slate-900/90 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-10 text-center space-y-5 shadow-2xl animate-in zoom-in">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-600 flex items-center justify-center text-5xl shadow-[0_0_40px_rgba(245,158,11,0.5)]">
                🏆
              </div>

              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-100">
                  🎉 دەستەکانت خۆش بێت قارەمانی گەورەی کوردستان!
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 font-medium">
                  تۆ هەموو ٥٠ قۆناغەکانی ئەم تاقیکردنەوەیەیت بە سەرکەوتوویی و بە نایابی تەواو کرد و بوویتە خاوەنی کۆمەڵێک ئەستێرەی درەوشاوە!
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

      {/* 📖 بەشی چیرۆک (خۆکارانە چیرۆک دروست دەکات بێ چوار دوگمە) */}
      {mode === 'story' && (
        <div className="space-y-4">
          <button
            onClick={() => handleKidsRequest()}
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 hover:from-pink-500 hover:to-rose-400 text-white font-black text-xs sm:text-base rounded-3xl transition-all shadow-[0_0_35px_rgba(236,72,153,0.35)] active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>خەریکی دروستکردنی چیرۆکێکی ئەفسوناوی نوێیە...</span>
              </>
            ) : (
              <>
                <span className="text-lg">✨</span>
                <span>دروستکردنی چیرۆکێکی ئەفسوناوی نوێ بۆ منداڵان</span>
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