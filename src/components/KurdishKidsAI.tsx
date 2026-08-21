/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import confetti from 'canvas-confetti';

interface KidsAIProps {
  language: 'ku' | 'ar';
}

// 👑 کایەی ٢٠٠ وشەی ڕەسەن بە شێوازی تێکەڵکردنی مژارەکان (خێزان ⬅️ نیشتمان ⬅️ ئاژەڵ ⬅️ قوتابخانە ⬅️ میوە)
const WORD_GAMES = [
  // ✨ قۆناغی ١ تا ١٠
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

  // ✨ قۆناغی ١١ تا ٢٠
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

  // ✨ قۆناغی ٢١ تا ٣٠
  { word: "پور", hint: "خوشکی ئازیزی دایک یان باوکی دڵسۆزمان 👩‍💼" },
  { word: "سلێمانی", hint: "پایتەختی ڕۆشنبیری و شاری شاعیرە ناودارەکان 🏰" },
  { word: "ورچ", hint: "ئاژەڵێکی گەورەی ناو دارستانەکانی کوردستان 🐻" },
  { word: "کارتۆن", hint: "فلیمە جووڵاوە ڕەنگاوڕەنگەکانی سەر شاشە 🎬" },
  { word: "شووتی", hint: "میوەیەکی گەورەی سەوز کە ناوەکەی سوور و ئاودارە 🍉" },
  { word: "خوشک", hint: "هاوڕێی هەرە دڵسۆز و شیرینی ماڵەکەمان 👧" },
  { word: "هەولێر", hint: "شاری دێرینی قەڵا و منارەی گەشاوە 🏰" },
  { word: "ڕێوی", hint: "ئاژەڵێکی زیرەک و فێڵباز لە چیرۆکەکاندا 🦊" },
  { word: "قەڵەم", hint: "کەرەستەیەکی سەرەکی بۆ نووسینی پیت و وشەکان ✏️" },
  { word: "هەنجیر", hint: "میوەیەکی کلتووری زۆر شیرین و بەتام 🍓" },

  // ✨ قۆناغی ٣١ تا ٤٠
  { word: "برا", hint: "هاوشانی یارییە بەجۆشەکانت لە ژوورەوە 🧑‍🤝‍🧑" },
  { word: "دهۆک", hint: "شاری چیای بەرز و کانییە فێنکەکان 🏔️" },
  { word: "ئاسک", hint: "گیاندارێکی چاوگەش و جوانی ناو سروشت 🦌" },
  { word: "دەفتەر", hint: "لاپەڕەی کۆکراوە بۆ نووسینی وانەکانی قوتابخانە 📖" },
  { word: "شیر", hint: "خواردنەوەیەکی سپی تەندروست بۆ بەهێزبوونی ئێسک 🥛" },
  { word: "باپیر", hint: "چیرۆکخوێنە دێرین و پڕ لە ئەزموونەکەی خێزان 👴" },
  { word: "کەرکووک", hint: "دڵی کوردستان و شاری باباگوڕگوڕی هەمیشە داگیرساو 🔥" },
  { word: "گورگ", hint: "ئاژەڵێکی کێوی کە شەوانە بە کۆمەڵ دەگەڕێت 🐺" },
  { word: "کتێب", hint: "سەرچاوەی گەورەی زانیاری و چیرۆکە شیرینەکان 📚" },
  { word: "هەنگوین", hint: "شیرینی سروشتی سەر مێز کە هەنگ دروستی دەکات 🍯" },

  // ✨ قۆناغی ٤١ تا ٥٠
  { word: "داپیر", hint: "نەرم و میهرەبان کە هەمیشە ئامێزی گەرمە 👵" },
  { word: "حەلەبجە", hint: "شاری هێمای مەزلوومیەت و گوڵە نێرگزەکان 🌼" },
  { word: "سەگ", hint: "هاوڕێیەکی دڵسۆز و پاسەوانێکی بە ئەمەک 🐶" },
  { word: "جانتا", hint: "کەرەستەیەک بۆ هەڵگرتنی کتێب و قەڵەمەکانت 🎒" },
  { word: "نان", hint: "سەرچاوەی سەرەکی خواردنی سەر مێزی کوردەواری 🫓" },
  { word: "ئامۆزا", hint: "منداڵی مامی ئازیز کە پێکەوە یاری دەکەین 🧑" },
  { word: "زاخۆ", hint: "شاری پردی دەلال و دەڤەری قارەمانان 🌉" },
  { word: "کەروێشک", hint: "ئاژەڵێکی گوێدریژ کە زۆر حەزی لە گێزەرە 🐰" },
  { word: "مۆسیقا", hint: "دەنگێکی خۆش و ئارامکەرەوە بۆ مێشکی منداڵ 🎵" },
  { word: "پەنیر", hint: "خواردنی بەیانیانی منداڵان لەگەڵ چای شیرین 🧀" },

  // ✨ قۆناغی ٥١ تا ٦٠
  { word: "خاڵۆزا", hint: "منداڵی خاڵی دڵسۆز لە کاتی جەژن و سەردان 🧑" },
  { word: "ڕانیە", hint: "دەروازەی ڕاپەڕینە مەزنەکەی گەلی کورد ☀️" },
  { word: "مانگا", hint: "ئاژەڵێکی گەورە کە سەرچاوەی سەرەکی شیرە 🐄" },
  { word: "دیاری", hint: "شتێکی خۆش کە لە ڕۆژی لەدایکبووندا پێشکەش دەکرێت 🎁" },
  { word: "هێلکە", hint: "خۆراکێکی پڕ لە پرۆتین بۆ گەشەکردنی جەستەت 🥚" },
  { word: "پورزا", hint: "منداڵی پووری شیرین و هاوڕێی گەشتەکان 👧" },
  { word: "کۆیە", hint: "شاری زانست و هونەر و مێژووی پڕ لە شانازی 📜" },
  { word: "مەیموون", hint: "ئاژەڵێکی زیرەک و بەزمخۆش کە حەزی لە مۆزە 🐒" },
  { word: "چیرۆک", hint: "بەسەرهاتی پەروەردەیی کە دایک دەیخوێنێتەوە 📖" },
  { word: "شۆربا", hint: "خواردنێکی گەرمی بەتام بۆ کاتی زستان و سەرما 🍲" },

  // ✨ قۆناغی ٦١ تا ٧٠
  { word: "برازا", hint: "منداڵی برای ئازیز کە یەکجار نازدارە 👶" },
  { word: "ئامێدی", hint: "شارۆچکە شوێنەوارییە بەرزەکەی سەر لوتکەی چیا ⛰️" },
  { word: "فیل", hint: "گەورەترین ئاژەڵی وشکانی کە خرتوومی هەیە 🐘" },
  { word: "باڵۆن", hint: "کەرەستەی فووتێکراوی ڕەنگاوڕەنگی یاری منداڵ 🎈" },
  { word: "باران", hint: "دڵۆپە ئاوە بەپیتەکانی ئاسمان لە وەرزی زستاندا 🌧️" },
  { word: "خوشکەزا", hint: "منداڵی خوشکی خۆشەویست و چاوگەش 👶" },
  { word: "مەهاباد", hint: "شارێکی دێرین و مێژوویی پڕ لە شانازی 🏔️" },
  { word: "زەڕافە", hint: "باڵابەرزترین ئاژەڵی سەر زەوی بە ملە درێژەکەی 🦒" },
  { word: "کۆلارە", hint: "کاغەزی فڕیوی دەستی منداڵانە لە ناو ئاسمان 🪁" },
  { word: "بەفر", hint: "دەنکە سپییە جوانەکانی زستان کە چیا سپی دەکات ❄️" },

  // ✨ قۆناغی ٧١ تا ٨٠
  { word: "منداڵ", hint: "گوڵی گەشاوە و بێتاوانی ناو تەواوی جیهان 👶" },
  { word: "قامیشلۆ", hint: "شاری ڕەسەن و سەرکەشی ڕۆژاوای جوانی نیشتمان ☀️" },
  { word: "سمۆرە", hint: "سمۆرەی دارستان کە خەریکی کۆکردنەوەی بەڕووە 🐿️" },
  { word: "مەقەس", hint: "کەرەستەیەکی بڕین بۆ دروستکردنی شێوەی کاغەزی ✂️" },
  { word: "خۆر", hint: "گەورەترین ئەستێرە کە گەرمی دەدات بە زەوی ☀️" },
  { word: "هاوڕێ", hint: "کەسێکی ئازیز کە پێکەوە کات بەسەر دەبەن 🧑‍🤝‍🧑" },
  { word: "سنە", hint: "ناوەندی کلتوور و ڕەسەنایەتی کوردەواری 🎵" },
  { word: "کوندەپەپوو", hint: "باڵندەی هۆشمەندی شەو کە لە سەر دار دەنیشێت 🦉" },
  { word: "پۆل", hint: "ژووری فێربوون و کۆبوونەوەی هاوڕێکان لە قوتابخانە 🏫" },
  { word: "هەور", hint: "تەم و مژی سپی سەر ئاسمان کە باران دروست دەکات ☁️" },

  // ✨ قۆناغی ٨١ تا ٩٠
  { word: "دراوسێ", hint: "هاوسێی نزیکی خانوەکەمان بۆ یارمەتیدانی یەکدی 🏠" },
  { word: "جامانە", hint: "پۆشاکی پیرۆزی سەر و ملی پیاوانی کورد 🧣" },
  { word: "جووچکە", hint: "منداڵی بچووکی مریشک کە زۆر نازدارە 🐥" },
  { word: "مێز", hint: "کەرەستەیەکی دارین بۆ دانانی دەفتەرەکەت 🪑" },
  { word: "باخچە", hint: "شوێنی پیاسە و یاری منداڵان لە ناو شاردا 🏡" },
  { word: "مامۆستا", hint: "ڕێپیشاندەر و فێرکەری دڵسۆزی منداڵان 👩‍🏫" },
  { word: "کەوا", hint: "بەشێکی سەرەکی لە جلی کوردی ناسکی کچان 👗" },
  { word: "بێچوو", hint: "بێچووی بچووکی ئاژەڵە کێوییەکانی دارستان 🐱" },
  { word: "کورسی", hint: "شوێنی دانیشتنی ئارام بۆ گۆیگرتن لە وانەکان 🪑" },
  { word: "درەخت", hint: "ڕووەکێکی گەورە کە سێبەر و ئۆکسجینمان پێدەدات 🌳" },

  // ✨ قۆناغی ٩١ تا ١٠٠
  { word: "قوتابی", hint: "منداڵێکی ژیر کە هەمیشە خەریکی خوێندنە 🧑‍🎓" },
  { word: "پشتوێن", hint: "شەدە و پشتێنەی جلی کوردی ڕەسەنی خۆمان 🎗️" },
  { word: "مریشک", hint: "باڵندەیەکی ماڵی کە هێلکەمان بۆ دادەنێت 🐓" },
  { word: "سەعات", hint: "ئامێری نیشاندانی کات بۆ قوتابخانە ⏰" },
  { word: "گوڵ", hint: "ڕووەکێکی بۆنخۆش و جوان کە سروشت دەڕازێنێتەوە 🌹" },
  { word: "جوتیار", hint: "ڕێنیشاندەری خاک و چێنەری گەنم و میوەکان 👨‍🌾" },
  { word: "چۆپی", hint: "شایی و ڕەشبەڵەکی خۆشی کلتووری کوردی 🎵" },
  { word: "قاز", hint: "باڵندەیەکی ئاوی گەورە کە حەزی لە مەلەکردنە 🦆" },
  { word: "گڵۆپ", hint: "سەرچاوەی ڕووناککردنەوەی ژووری خوێندن 💡" },
  { word: "پەلکەزێڕینە", hint: "کەوانە ڕەنگاوڕەنگەکەی دوای باران لە ناو ئاسمان 🌈" },

  // ✨ قۆناغی ١٠١ تا ١١٠
  { word: "شوان", hint: "پارێزەر و پاسەوانی مەڕەکان لە سەر چیا 🐑" },
  { word: "نێرگز", hint: "گوڵە زەرد و بۆنخۆشەکەی وەرزی بەهاری کوردستان 🌼" },
  { word: "قەلەڕەش", hint: "باڵندەیەکی ڕەشی زیرەک کە تەمەنی زۆر درێژە 🐦" },
  { word: "دەرگا", hint: "دەروازەی چوونە ژوورەوە بۆ ناو ماڵی ئارام 🚪" },
  { word: "پێكەنین", hint: "نیشانەی دڵخۆشی و شادی سەر ڕوخساری تۆ 😊" },
  { word: "پزیشک", hint: "چارەسەرکەری نەخۆشییەکان و نەهێڵەری ئازار 🩺" },
  { word: "نیشتمان", hint: "باوەشی گەرم و خاکی پیرۆزی باوانمان 🌍" },
  { word: "بلبل", hint: "باڵندەیەکی دەنگخۆش کە بەیانیان دەخوێنێت 🐤" },
  { word: "پەنجەرە", hint: "شوێنی بینینی دیمەنی دەرەوە 🪟" },
  { word: "تاڤگە", hint: "ئاوی بەخوڕ کە لە سەر شاخە بەرزەکانەوە دێتە خوارێ 🌊" },

  // ✨ قۆناغی ١١١ تا ١٢٠
  { word: "ئەندازیار", hint: "نەخشەکێش و دروستکەری خانووە بەرزەکان 👷" },
  { word: "شۆڕش", hint: "ڕاپەڕین و تێکۆشان بۆ گەیشتن بە ئازادی ☀️" },
  { word: "کیسەڵ", hint: "زیندەوەرێکی قاوغداری هێواش و لەسەرخۆ 🐢" },
  { word: "سندوق", hint: "بۆکسی دارین بۆ شاردنەوەی یارییەکانت 📦" },
  { word: "چیا", hint: "چیا سەرکەش و بەرزەکانی نیشتمانە جوانەکەمان ⛰️" },
  { word: "شۆفێر", hint: "ئەو کەسە هۆشمەندەی کە ئۆتۆمبێل دەهاژوێت 👨‍✈️" },
  { word: "خاک", hint: "نیشتمان و نیشtەجێبوونی باو و باپیرانمان 🌍" },
  { word: "ماسی", hint: "زیندەوەرێکی ئاوی جوان کە مەلە دەکات 🐟" },
  { word: "کلیل", hint: "کەرەستەیەکی بچووک بۆ کردنەوەی قفڵەکان 🔑" },
  { word: "ئەشکەوت", hint: "شوێنی دێرینی ژیانی مرۆڤە سەرەتاییەکان لە شاخ 🕳️" },

  // ✨ قۆناغی ١٢١ تا ١٣٠
  { word: "فڕۆکەوان", hint: "کاپتنی قارەمانی ناو فڕۆکەی ئاسمان 👨‍✈️" },
  { word: "منارە", hint: "شوێنەوارە بەرزەکەی تەنیشت بازاڕی هەولێر 🏰" },
  { word: "بۆق", hint: "زیندەوەرێکی سەوز کە لە ناو ئاودا دەقورێنێت 🐸" },
  { word: "پەت", hint: "حەbڵێکی درێژ بۆ یاری پەتپەتێنی کچان 🪢" },
  { word: "ڕووبار", hint: "ئاوێکی بەخوڕ و زۆر کە بە ناو دۆڵەکاندا دەڕوات 🏞️" },
  { word: "کۆرپە", hint: "ساوای یەکجار بچووکی ناو بێشەکەی دایکم 👶" },
  { word: "ڕاپەڕین", hint: "ڕۆژی ڕزگاربوونی مەزنی شارەکانی کوردستان ☀️" },
  { word: "وشتر", hint: "گیانداری بیابان کە بەرگەی تینووێتی دەگرێت 🐪" },
  { word: "دەرزی", hint: "کەرەستەیەکی تیژ بۆ دوورینی جلوبەرگ 🪡" },
  { word: "کانی", hint: "سەرچاوەی ئاوی پاک و سارد لە دڵێ چیاکانەوە 💧" },

  // ✨ قۆناغی ١٣١ تا ١٤٠
  { word: "بێشە", hint: "لانکەی دارینی دێرینی منداڵانی کورد 🪵" },
  { word: "کۆچەر", hint: "شێوازی ژیانی دێرینی گواستنەوە بۆ کوێستان 🏕️" },
  { word: "مێروولە", hint: "زیندەوەرێکی یەکجار بچووک و تێکۆشەر 🐜" },
  { word: "داو", hint: "دەزووی ڕەنگاوڕەنگ بۆ دوورینی جلوبەرگەکان 🧵" },
  { word: "مژ", hint: "تەم و دووکەڵی ساردی بەیانیانی زستان 🌫️" },
  { word: "دادە", hint: "خوشکی گەورە و ڕێزدار لە ناو خێزاندا 👩" },
  { word: "کوێستان", hint: "ناوچە فێنک و سەوزەکانی هاوینی چیاکانمان 🏔️" },
  { word: "هەنگ", hint: "مێروویەکی بەسوود کە هەنگوینمان پێدەدات 🐝" },
  { word: "تەباشیر", hint: "بەردی ڕەنگاوڕەنگ بۆ نووسین لەسەر تەختە 🖍️" },
  { word: "بەهار", hint: "وەرزی سەوزبوونی زەوی و هاتنی گوڵەکان 🌱" },

  // ✨ قۆناغی ١٤١ تا ١٥٠
  { word: "کاکە", hint: "برایی گەورە و پاسەوانی بچووکەکان 👦" },
  { word: "گەرمیان", hint: "دەڤەرێکی گەرم و پڕ لە قارەمانی نیشتمان 🔥" },
  { word: "نەهەنگ", hint: "گەورەترین زیندەوەری ناو دەریای قووڵ 🐋" },
  { word: "وانە", hint: "مەشق و زانیارییەکانی ناو پۆلی قوتابخانە 📝" },
  { word: "هاوین", hint: "وەرزی پشووی گەورەی قوتابخانە و گەشت 🏖️" },
  { word: "مامۆژم", hint: "هاوسەری مامی خۆشەویست و ئازیزمان 👩‍💼" },
  { word: "هەورامان", hint: "ناوچەیەکی پڕ لە سروشتی جوان و تەلارسازی ⛰️" },
  { word: "دۆلفین", hint: "ماسییەکی یەکجار زیرەک و دۆستی مرۆڤەکان 🐬" },
  { word: "کۆمپیوتەر", hint: "ئامێری زیرەک بۆ فێربوونی وانە و کێشانی وێنە 💻" },
  { word: "زستان", hint: "وەرزی بارینی بەفر و بارانی خۆش 🌨️" },

  // ✨ قۆناغی ١٥١ تا ١٦٠
  { word: "خاڵۆژن", hint: "هاوسەری خاڵی بەڕێز و خۆشەویستمان 👩" },
  { word: "شێروانە", hint: "قەڵا دێرینەکەی گەرمیانی گەش و ئازیزمان 🏰" },
  { word: "بەرخ", hint: "بێچووی بچووک و نەرمی مەڕی شیرین 🐑" },
  { word: "ڕەنگ", hint: "ماددەی جیاواز بۆ جوانکردنی وێنەکانت 🎨" },
  { word: "گوێز", hint: "بەرهەمە ڕەقە بەسوودەکەی دارە بەرزەکانی هەورامان 🫘" },
  { word: "باجە", hint: "نازناوێکی شیرینی کلتووری بۆ پووری ئازیز 👵" },
  { word: "کلتوور", hint: "دابونەریت و ڕەسەنایەتی نەتەوەی خۆمان 📜" },
  { word: "کەرکەدەن", hint: "ئاژەڵێکی گەورە کە قۆچێکی هەیە لەسەر لوتی 🦏" },
  { word: "کراس", hint: "جلی درێژ و ڕەنگاوڕەنگی کلتووری کچان 👑" },
  { word: "بادەم", hint: "دەنکە سپییە بچووک و بەتامەکانی ناو قاوغ 🥜" },

  // ✨ قۆناغی ١٦١ تا ١٧٠
  { word: "نەوە", hint: "منداڵی منداڵەکان کە داپیر زۆر نازی دەگرێت 👶" },
  { word: "سەربەخۆیی", hint: "ئاواتی مەزن و هەمیشەیی گەلەکەمان 👑" },
  { word: "مێشولە", hint: "مێروویەکی بچووک کە بە دەوری ڕووناکیدا دەفڕێت 🪰" },
  { word: "ملوانکە", hint: "مرواری ڕەنگاوڕەنگی دەوری ملی کچان 📿" },
  { word: "گێزەر", hint: "سەوزەیەکی پرتەقاڵی بەسوود بۆ هێزی چاوەکانت 🥕" },
  { word: "تاتە", hint: "نازناوێکی دێرین و ڕەسەنی باوک لە کوردستان 👨" },
  { word: "فۆلکلۆر", hint: "گۆرانی و مەتەڵە دێرینەکانی باوانمان 🎵" },
  { word: "پەپوولە", hint: "گیاندارێکی باڵداری ڕەنگاوڕەنگ لە ناو باخچەدا 🦋" },
  { word: "گوێارە", hint: "زێڕ و زیوی ناسکی هەڵواسراوی گوێی کچۆڵە 💎" },
  { word: "تەماتە", hint: "سەوزەیەکی سوور و ئاودار بۆ ناو زەڵاتە 🍅" },

  // ✨ قۆناغی ١٧١ تا ١٨٠
  { word: "خزم", hint: "تەواوی کەس و کار و ناسراوەکانی دەوروبەرمان 🧑‍🤝‍🧑" },
  { word: "هەولێری", hint: "شیرینییەکی خۆش و لۆکاڵی شاری قەڵا 🍬" },
  { word: "شەبەرەک", hint: "پەپوولەی تاریکی شەو کە حەزی لە گڵۆپە 🦋" },
  { word: "ئەڵقە", hint: "بازنەی بچووکی پەنجەی دایکی میهرەبان 💍" },
  { word: "خەیار", hint: "سەوزەیەکی سەوز و فێنکی کاتی هاوین 🥒" },
  { word: "بەنەفش", hint: "ناوێکی ناسکی کوردی بۆ کچانی چاوگەش 👧" },
  { word: "زۆڕنا", hint: "ئامرازی فووتێکراوی تیژی تەنیشت دەهۆڵ 🎺" },
  { word: "کۆتر", hint: "باڵندەیەکی سپی و نازدار کە هێمای ئاشتییە 🕊️" },
  { word: "وەرزش", hint: "غاردان و جووڵە بۆ تەندروستی جەستەت 🏃" },
  { word: "پەتاتە", hint: "خۆراکێکی زەوینی کلتووری کە زۆر بەسوودە 🥔" },

  // ✨ قۆناغی ١٨١ تا ٢٠٠
  { word: "میدیا", hint: "ناوێکی مێژوویی و دێرینی کلتووری کوردی 👑" },
  { word: "دەهۆڵ", hint: "ئامرازی گەورەی دەنگی شایی و جەژنەکان 🥁" },
  { word: "هەڵۆ", hint: "باڵندەی بەرزەفڕی سەر چیا سەرکەشەکان 🦅" },
  { word: "مەلە", hint: "کایەی خۆشی ناو ئاوی کانی و حەوزی هاوین 🏊" },
  { word: "پیاز", hint: "سەوزەیەکی تیژ بەڵام پڕ لە سوود بۆ جەستە 🧅" },
  { word: "خانزاد", hint: "شاژنە قارەمانەکەی میرنشینی سۆران 👑" },
  { word: "کڵاش", hint: "پێڵاوی سپی و چنراوی هاوینی هەورامان 👟" },
  { word: "کەو", hint: "باڵندەی فۆلکلۆری و ناو چیرۆکە ڕەسەنەکان 🐦" },
  { word: "خەڵات", hint: "جام و مێدالیای سەرکوتنی یاریزانە ژیرەکە 🏆" },
  { word: "پورتەقاڵ", hint: "میوەیەکی زستانەی پڕ لە ڤیتامین سی 🍊" },
  { word: "پاسەوان", hint: "کەسی دڵسۆز بۆ پاراستنی قوتابخانە و باخچە 🛡️" },
  { word: "پێشمەرگە", hint: "پارێزەر و پاسەوانی قارەمانی خاکەکەمان 🛡️" },
  { word: "مەڕ", hint: "ئاژەڵێکی ماڵی بەسوود خاوەن خوری و شیری تەندروست 🐑" },
  { word: "سۆپا", hint: "ئامێری گەرمکردنەوەی ژوورەکان لە زستاندا 🔥" },
  { word: "کاڵەک", hint: "میوەیەکی زەرد و بۆنخۆشی بێستانەکانی هاوین 🍈" },
  { word: "قەڵغان", hint: "ئامرازی بەرگری قارەمانەکانی ناو چیرۆکەکان 🛡️" },
  { word: "سروود", hint: "گۆرانی نیشتمانی و شیرینی بەیانیانی قوتابخانە 🎵" },
  { word: "بزن", hint: "گیاندارێکی چست بۆ بازدان لە سەر تاشەبەردەکان 🐐" },
  { word: "ماڵەوە", hint: "شوێنی پشوودان و کۆبوونەوەی ئارامی خێزان 🏠" },
  { word: "دۆ", hint: "خوادرنەوەی سپی و ساردی هاوین لەگەڵ نان 🥛" }
];

const KurdishKidsAI: React.FC<KidsAIProps> = ({ language }) => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'story' | 'riddle' | 'ask' | 'names' | 'games'>('story');
  
  const [wordGameIndex, setWordGameIndex] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [shuffledLetters, setShuffledLetters] = useState([]);
  const [gameSuccess, setGameSuccess] = useState(false);

  const [namesList, setNamesList] = useState([]); 
  const [genderMode, setGenderFilter] = useState<'girl' | 'boy'>('girl'); 
  const [nameDescription, setNameDescription] = useState(''); 
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 💾 ١. لۆدکردنی قۆناغی پاشەکەوتکراوی کۆتایی منداڵەکە لە مێشکی مۆبایلەکەدا
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
    
    // 💾 ٢. جێگیرکردنی قۆناغی نوێ بۆ ئەوەی ئەگەر ئەپەکەی داخست ون نەبێت
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
      // 🎉 ٣. لێدانی بارانی کاغەز (Confetti) بۆ دڵخۆشکردنی زیاتری منداڵەکە
      confetti({
        particleCount: 100,
        spread: 70,
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
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const resetCurrentWordGame = () => {
    initWordGame(wordGameIndex);
  };

  // 👑 لۆجیکی جادوویی نوێ بۆ گەڕانەوەی تەواو بۆ سەرەتا (قۆناغی ١)
  const handleResetToFirstLevel = () => {
    if (window.confirm("⚠️ دڵنیای دەتەوێت کایەکە خاوێن بکەیتەوە و بگەڕێیتەوە بۆ قۆناغی یەکەم؟")) {
      localStorage.removeItem('kurdai_kids_game_level');
      initWordGame(0);
    }
  };

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
        setError("⚠️ لێمیتی نامەکانی ئەمڕۆت تەواو بوو! بۆ گفتوگۆیی بێسنوور، ببە بە ئەندامی Premium.");
      } else {
        setError(err.message || "ببوورە کێشەیەک ڕوویدا، دووبارە تاقیکەرەوە.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchKurdishNames = async () => {
    setLoading(true);
    setError(null);
    setNamesList([]);
    try {
      const userEmail = auth.currentUser?.email || "guest_user";
      const res = await fetch('https://hedihashm-kurdai-chat-brain.hf.space/api/kurdish-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gender: genderMode, email: userEmail }),
      });
      const data = await res.json();
      setNamesList(data.names || []);
    } catch (err: any) {
      setError("خەتا لە لۆدکردنی ناوەکان.");
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
        <p className="text-zinc-400 text-xs">چیرۆک، مەتەڵ، ناوە نیشتمانییەکان و کایەی وشەسازی هۆشمەند</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <button type="button" onClick={() => { setMode('story'); setResponse(null); setNamesList([]); }} className={`py-2.5 rounded-2xl font-black text-xs transition-all border ${mode === 'story' ? 'bg-pink-600/20 border-pink-500 text-pink-400 shadow-lg' : 'bg-zinc-900/40 border-zinc-800 text-zinc-400'}`}>چیرۆک📚</button>
        <button type="button" onClick={() => { setMode('riddle'); setResponse(null); setNamesList([]); }} className={`py-2.5 rounded-2xl font-black text-xs transition-all border ${mode === 'riddle' ? 'bg-amber-600/20 border-amber-500 text-amber-400 shadow-lg' : 'bg-zinc-900/40 border-zinc-800 text-zinc-400'}`}>مەتەڵ🧩</button>
        <button type="button" onClick={() => { setMode('ask'); setResponse(null); setNamesList([]); }} className={`py-2.5 rounded-2xl font-black text-xs transition-all border ${mode === 'ask' ? 'bg-cyan-600/20 border-cyan-500 text-cyan-400 shadow-lg' : 'bg-zinc-900/40 border-zinc-800 text-zinc-400'}`}>پرسیار🤔</button>
        <button type="button" onClick={() => { setMode('names'); setResponse(null); setNamesList([]); }} className={`py-2.5 rounded-2xl font-black text-xs transition-all border ${mode === 'names' ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-lg' : 'bg-zinc-900/40 border-zinc-800 text-zinc-400'}`}>ناوەکان👶🏻</button>
        <button type="button" onClick={() => { setMode('games'); setResponse(null); setNamesList([]); }} className={`py-2.5 rounded-2xl font-black text-xs transition-all border col-span-2 sm:col-span-1 ${mode === 'games' ? 'bg-purple-600/20 border-purple-500 text-purple-400 shadow-lg' : 'bg-zinc-900/40 border-zinc-800 text-zinc-400'}`}>کایەی وشە🎮</button>
      </div>

      {mode !== 'names' && mode !== 'games' && (
        <div className="bg-[#0e0e12] border border-zinc-800 p-5 rounded-3xl shadow-xl space-y-4 animate-in fade-in duration-300">
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
            type="button"
            onClick={handleKidsRequest}
            disabled={loading || (mode === 'ask' && !input.trim())}
            className={`w-full py-3 text-zinc-950 font-black text-xs rounded-xl transition-all shadow-md ${mode === 'story' ? 'bg-pink-400' : mode === 'riddle' ? 'bg-amber-400' : 'bg-cyan-400'}`}
          >
            {loading ? '🔮 خەریکی بیرکردنەوەم...' : 'ڕەوانەکردن'}
          </button>
        </div>
      )}

      {mode === 'games' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="bg-[#0e0e12] border border-zinc-800 p-6 rounded-3xl text-center space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
              <span className="text-[10px] font-black text-purple-400 font-mono bg-purple-500/5 border border-purple-500/10 px-2 py-0.5 rounded-md">
                قۆناغی: {wordGameIndex + 1} / {WORD_GAMES.length}
              </span>
              <span className="text-xs font-black text-zinc-300 font-['Noto_Sans_Arabic']">کایەی پیتە تێکەڵەکان✨</span>
            </div>

            <span className="text-sm font-black text-zinc-200 block bg-zinc-950/40 py-2 px-4 rounded-xl border border-zinc-900/80 leading-relaxed text-right" dir="rtl">
              {WORD_GAMES[wordGameIndex].hint}
            </span>
            
            <div className="flex justify-center gap-3 items-center">
              <button 
                type="button"
                onClick={handleRevealAnswer}
                className="w-11 h-11 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-xl flex items-center justify-center transition-all active:scale-90 shadow-md"
              >
                💡
              </button>
              
              <div className="flex-1 flex justify-center min-h-[48px] bg-zinc-950 p-2.5 rounded-2xl border border-zinc-900 shadow-inner overflow-hidden">
                {gameSuccess ? (
                  <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-lg tracking-wider px-6 py-1.5 rounded-xl border border-amber-300/30 shadow-md flex items-center justify-center animate-in zoom-in-95 duration-300">
                    {WORD_GAMES[wordGameIndex].word}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    {selectedLetters.map((char, i) => (
                      <span key={i} className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-black text-base flex items-center justify-center rounded-xl shadow-md border border-purple-400/20 animate-in zoom-in-95">
                        {char}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center gap-2 flex-wrap pt-1">
              {shuffledLetters.map((char, idx) => (
                <button 
                  type="button"
                  key={idx} 
                  onClick={() => selectLetter(char, idx)} 
                  className="w-11 h-11 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-purple-500/40 text-zinc-200 font-black text-base rounded-xl transition-all active:scale-90 shadow-md"
                >
                  {char}
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-3 justify-center items-center border-t border-zinc-900/60 flex-wrap">
              <button 
                type="button"
                onClick={resetCurrentWordGame} 
                className="px-3.5 py-2 bg-zinc-950 text-zinc-500 hover:text-zinc-300 border border-zinc-800 text-[10px] font-black rounded-xl transition-all active:scale-95"
              >
                سڕینەوە و دەستپێکردنەوە🔄
              </button>
              
              <button 
                type="button"
                onClick={handleResetToFirstLevel} 
                className="px-3.5 py-2 bg-red-950/10 text-red-400/80 hover:text-red-400 border border-red-900/20 hover:border-red-900/40 text-[10px] font-black rounded-xl transition-all active:scale-95"
              >
                چوونەوە سەرەتا↩️ (قۆناغی ١)
              </button>
              
              {wordGameIndex < WORD_GAMES.length - 1 && gameSuccess && (
                <button 
                  type="button"
                  onClick={() => initWordGame(wordGameIndex + 1)} 
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-[10px] rounded-xl transition-all shadow-md animate-bounce border border-emerald-400/20 flex items-center gap-1"
                >
                  <span>قۆناغی داهاتوو</span>
                  <span>➡️</span>
                </button>
              )}
            </div>

            {gameSuccess && (
              <div className="text-emerald-400 text-sm font-black animate-pulse mt-3 bg-emerald-500/5 border border-emerald-500/10 py-2 rounded-xl">
                ئافەرین ڕۆڵەکەم 🥰 وشەکەت بە تەواوی و دروستی دروست کرد✨
              </div>
            )}
          </div>
        </div>
      )}

      {mode === 'names' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="bg-[#0e0e12] border border-zinc-800 p-4 rounded-3xl space-y-2">
            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-wider pr-1">✨ چ جۆرە ناوێکت دەوێت?</label>
            <input type="text" value={nameDescription} onChange={(e) => setNameDescription(e.target.value)} placeholder="وەسفی ناوەکە لێرە بنووسە..." className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 focus:outline-none text-right" />
          </div>

          <div className="bg-[#0e0e12] border border-zinc-800 p-3 rounded-3xl flex justify-center gap-3">
            <button type="button" onClick={() => setGenderFilter('girl')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${genderMode === 'girl' ? 'bg-pink-500/20 border-pink-500 text-pink-400 shadow-md' : 'bg-zinc-950 text-zinc-400 border-zinc-800'}`}>منداڵی کچ🎀</button>
            <button type="button" onClick={() => setGenderFilter('boy')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${genderMode === 'boy' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-md' : 'bg-zinc-950 text-zinc-400 border-zinc-800'}`}>منداڵی کوڕ💙</button>
          </div>

          {namesList.length === 0 && !loading && (
            <button type="button" onClick={fetchKurdishNames} className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs rounded-xl shadow-lg border border-emerald-400/20">گەڕان بۆ ناوی منداڵ🔍</button>
          )}

          {loading && (
            <div className="p-6 rounded-3xl bg-[#0b0b0e] border border-zinc-800 text-center animate-pulse">
              <span className="text-zinc-500 italic text-xs block">🧸 خەریکی گەڕانم...</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {namesList.map((item, index) => (
              <div key={index} className={`bg-gradient-to-br from-zinc-900/50 to-zinc-950 p-4 rounded-2xl shadow-md text-right relative overflow-hidden border ${genderMode === 'girl' ? 'border-pink-500/10' : 'border-cyan-500/10'}`}>
                <span className={`absolute top-2 left-3 text-[9px] font-black px-2 py-0.5 rounded-md ${genderMode === 'girl' ? 'bg-pink-500/5 text-pink-400' : 'bg-cyan-500/5 text-cyan-400'}`}>{genderMode === 'girl' ? 'کچ' : 'کوڕ'}</span>
                <h4 className={`text-sm font-black mb-1 ${genderMode === 'girl' ? 'text-pink-400' : 'text-cyan-400'}`}>{item.name}</h4>
                <p className="text-zinc-400 text-xs leading-relaxed">{item.meaning}</p>
              </div>
            ))}
          </div>

          {namesList.length > 0 && !loading && (
            <button type="button" onClick={fetchKurdishNames} className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 border border-amber-400/20">دووبارە گەڕان بۆ ناوی نوێ🔄</button>
          )}
        </div>
      )}

      {mode !== 'names' && mode !== 'games' && (response || loading) && (
        <div className="p-6 rounded-3xl bg-[#0b0b0e] border border-zinc-800 shadow-2xl min-h-[150px] flex flex-col justify-center animate-in fade-in duration-300">
          <div className="text-zinc-100 text-sm leading-[2] text-right whitespace-pre-wrap font-medium">
            {loading ? <span className="text-zinc-500 italic animate-pulse block text-center">🧸 KurdAI خەریکی نووسینە...</span> : <span>{response}</span>}
          </div>
        </div>
      )}

      {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center">{error}</div>}
    </div>
  );
};

export default KurdishKidsAI;