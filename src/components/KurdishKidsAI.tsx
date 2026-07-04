/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';

interface KidsAIProps {
  language: 'ku' | 'ar';
}

// 👑 بانکی جێگیر، ماناڕاست و بێخەتای ١٥٠ وشەی کوردی بۆ منداڵان
const WORD_GAMES = [
  // 👨‍👩‍👧‍👦 خێزان و کەسەکان
  { word: "دایک", hint: "فریشتە میهرەبان و دڵسۆزەکەی ژیانمان 👩‍🍼" },
  { word: "باوک", hint: "پشت و پەنا و پارێزەری گەورەی تەواوی خێزان 👨‍👦" },
  { word: "مام", hint: "برایی باوکی شیرین و پشتیوانی گەورەمان 👨‍💼" },
  { word: "خاڵ", hint: "برایی میهرەبانی دایکم کە زۆر خۆشەویستە 👨‍🌾" },
  { word: "پور", hint: "خوشکی ئازیزی دایک یان باوکی دڵسۆزمان 👩‍💼" },
  { word: "خوشک", hint: "هاوڕێی هەرە دڵسۆز و شیرینی ماڵەکەمان 👧" },
  { word: "برا", hint: "هاوشانی یارییە بەجۆشەکانت لە ژوورەوە 🧑‍🤝‍🧑" },
  { word: "باپیر", hint: "چیرۆکخوێنە دێرین و پڕ لە ئەزموونەکەی خێزان 👴" },
  { word: "داپیر", hint: "نەرم و میهرەبان کە هەمیشە ئامێزی گەرمە 👵" },
  { word: "ئامۆزا", hint: "منداڵی مامی ئازیز کە پێکەوە یاری دەکەین 🧑" },
  { word: "خاڵۆزا", hint: "منداڵی خاڵی دڵسۆز لە کاتی جەژن و سەردان 🧑" },
  { word: "پورزا", hint: "منداڵی پووری شیرین و هاوڕێی گەشتەکان 👧" },
  { word: "برازا", hint: "منداڵی برای ئازیز کە یەکجار نازدارە 👶" },
  { word: "خوشکەزا", hint: "منداڵی خوشکی خۆشەویست و چاوگەش 👶" },
  { word: "منداڵ", hint: "گوڵی گەشاوە و بێتاوانی ناو تەواوی جیهان 👶" },
  { word: "هاوڕێ", hint: "کەسێکی ئازیز کە پێکەوە کات بەسەر دەبەن 🧑‍🤝‍🧑" },
  { word: "دراوسێ", hint: "هاوسێی نزیکی خانوەکەمان بۆ یارمەتیدانی یەکدی 🏠" },
  { word: "مامۆستا", hint: "ڕێپیشاندەر و فێرکەری دڵسۆزی منداڵان 👩‍🏫" },
  { word: "قوتابی", hint: "منداڵێکی ژیر کە هەمیشە خەریکی خوێندنە 🧑‍🎓" },
  { word: "جوتیار", hint: "ڕێنیشاندەری خاک و چێنەری گەنم و میوەکان 👨‍🌾" },
  { word: "شوان", hint: "پارێزەر و پاسەوانی مەڕەکان لە سەر چیا 🐑" },
  { word: "پزیشک", hint: "نەهێڵەری ئازار و چارەسەرکەری نەخۆشەکان 🩺" },
  { word: "ئەندازیار", hint: "نەخشەکێش و دروستکەری خانووە بەرزەکان 👷" },
  { word: "شۆفێر", hint: "ئەو کەسە هۆشمەندەی کە ئۆتۆمبێل دەهاژوێت 👨‍✈️" },
  { word: "فڕۆکەوان", hint: "کاپتنی قارەمانی ناو fڕۆکەی ئاسمان 👨‍✈️" },
  { word: "منداڵان", hint: "گوڵی گەشاوە و بێتاوەکانی ناو نیشتمان 👶" },
  { word: "کۆرپە", hint: "ساوای یەکجار بچووکی ناو بێشەکەی دایکم 👶" },
  { word: "باپیرە", hint: "نازناوێکی تری باپیری ئازیزی خێزانمان 👴" },
  { word: "داپیرە", hint: "نازناوێکی تری داپیری میهرەبان و گەورەمان 👵" },
  { word: "مامۆژم", hint: "هاوسەری مامی خۆشەویست و ئازیزمان 👩‍💼" },

  // ☀️ نیشتمان، کلتوور و شارەکان
  { word: "کوردستان", hint: "نیشتمانە جوان و دڵگیرەکەمان ☀️" },
  { word: "ئاڵا", hint: "هێمای پیرۆزی و سەرفرازی گەلەکەمان ☀️" },
  { word: "پێشمەرگە", hint: "پارێزەر و پاسەوانی قارەمانی خاکەکەمان 🛡️" },
  { word: "نەورۆز", hint: "جەژنی نەتەوەیی و سەری ساڵی کوردی 🔥" },
  { word: "قەڵا", hint: "شوێنەوارە دێرین و مێژووییەکەی شاری هەولێر 🏰" },
  { word: "سلێمانی", hint: "پایتەختی ڕۆشنبیری و شاری شاعیرە ناودارەکان 🏰" },
  { word: "هەولێر", hint: "شاری دێرینی قەڵا و منارەی گەشاوە 🏰" },
  { word: "دهۆک", hint: "شاری چیای بەرز و کانییە فێنکەکان 🏔️" },
  { word: "کەرکووک", hint: "دڵی کوردستان و شاری باباگوڕگوڕی هەمیشە داگیرساو 🔥" },
  { word: "حەلەبجە", hint: "شاری هێمای مەزلوومیەت و گوڵە نێرگزەکان 🌼" },
  { word: "زاخۆ", hint: "شاری پردی دەلال و دەڤەری قارەمانان 🌉" },
  { word: "ڕانیە", hint: "دەروازەی ڕاپەڕینە مەزنەکەی گەلی کورد ☀️" },
  { word: "کۆیە", hint: "شاری زانست و هونەر و مێژووی پڕ لە شانازی 📜" },
  { word: "ئامێدی", hint: "شارۆچکە شوێنەوارییە بەرزەکەی سەر لوتکەی چیا ⛰️" },
  { word: "مەهاباد", hint: "شارێکی دێرین و مێژوویی پڕ لە شانازی 🏔️" },
  { word: "قامیشلۆ", hint: "شاری ڕەسەن و سەرکەشی ڕۆژاوای جوانی نیشتمان ☀️" },
  { word: "snە", hint: "ناوەندی کلتوور و گۆرانی و ڕەسەنایەتی کوردەواری 🎵" },
  { word: "جامانە", hint: "پۆشاکی پیرۆزی سەر و ملی پیاوانی کورد 🧣" },
  { word: "کەوا", hint: "بەشێکی سەرەکی لە جلی کوردی ناسکی کچان 👗" },
  { word: "پشتوێن", hint: "شەدە و پشتێنەی جلی کوردی ڕەسەنی خۆمان 🎗️" },
  { word: "چۆپی", hint: "شایی و ڕەشبەڵەکی خۆشی کلتووری کوردی 🎵" },
  { word: "نێرگز", hint: "گوڵە زەرد و بۆنخۆشەکەی وەرزی بەهاری کوردستان 🌼" },
  { word: "ئازادی", hint: "خۆشترین و بەرزترین هێمای ژیان بۆ مرۆڤ 🕊️" },
  { word: "نیشتمان", hint: "باوەشی گەرم و خاکی پیرۆزی باوانمان 🌍" },
  { word: "شۆڕش", hint: "ڕاپەڕین و تێکۆشان بۆ گەیشتن بە ئازادی ☀️" },
  { word: "شەهید", hint: "ئەو قارەمانەی خاکی بۆ پاراستووین 🕊️" },
  { word: "خاک", hint: "نیشتمان و نیشتەجێبوونی باو و باپیرانمان 🌍" },
  { word: "ساز", hint: "ئامرازێکی مۆسیقای ڕەسەنی کلتوورەکەمان 🪕" },
  { word: "شمشاڵ", hint: "ئامرازێکی فووتێکراوی دێرینی شوانەکانی کورد 🎺" },
  { word: "دەف", hint: "ئامرازێکی لێدانی ڕۆحی ناو بۆنە کلتوورییەکان 🥁" },

  // 🦁 ئاژەڵەکان و باڵندەکان
  { word: "پشیلە", hint: "ئاژەڵێکی ماڵی بچووک و یەکجار شیرین 🐱" },
  { word: "شێر", hint: "پاشای بەهێزی دارستان و ئاژەڵە کێوییەکان 🦁" },
  { word: "پڵنگ", hint: "ئاژەڵێکی کێوی یەکجار خێرا و بەهێز 🐆" },
  { word: "ئەسپ", hint: "ئاژەڵێکی ڕەسەن و دڵسۆز بۆ سوارچاکی 🐴" },
  { word: "ورچ", hint: "ئاژەڵێکی گەورەی ناو دارستانەکانی کوردستان 🐻" },
  { word: "ڕێوی", hint: "ئاژەڵێکی زیرەک و فێڵباز لە چیرۆکەکاندا 🦊" },
  { word: "ئاسک", hint: "گیاندارێکی چاوگەش و جوانی ناو سروشت 🦌" },
  { word: "گورگ", hint: "ئاژەڵێکی کێوی کە شەوانە بە کۆمەڵ دەگەڕێت 🐺" },
  { word: "سەگ", hint: "هاوڕێیەکی دڵسۆز و پاسەوانێکی بە ئەمەک 🐶" },
  { word: "کەروێشک", hint: "ئاژەڵێکی گوێدریژ کە زۆر حەزی لە گێزەرە 🐰" },
  { word: "مانگا", hint: "ئاژەڵێکی گەورە کە سەرچاوەی سەرەکی شیرە 🐄" },
  { word: "مەیموون", hint: "ئاژەڵێکی زیرەک و بەزمخۆش کە حەزی لە مۆزە 🐒" },
  { word: "فیل", hint: "گەورەترین ئاژەڵی وشکانی کە خرتوومی هەیە 🐘" },
  { word: "زەڕافە", hint: "باڵابەرزترین ئاژەڵی سەر زەوی بە ملە درێژەکەی 🦒" },
  { word: "سمۆرە", hint: "سمۆرەی دارستان کە خەریکی کۆکردنەوەی بەڕووە 🐿️" },
  { word: "کوندەپەپوو", hint: "باڵندەی هۆشمەندی شەو کە لە سەر دار دەنیشێت 🦉" },
  { word: "جووچکە", hint: "منداڵی بچووکی مریشک کە زۆر نازدارە 🐥" },
  { word: "بێچوو", hint: "bێچوووی بچووکی ئاژەڵە کێوییەکانی دارستان 🐱" },
  { word: "مایین", hint: "ئەسپی مێینەی ڕەسەنی کلتووری خۆمان 🐴" },
  { word: "مریشک", hint: "باڵندەیەکی ماڵی کە هێلکەمان بۆ دادەنێت 🐓" },
  { word: "قاز", hint: "باڵندەیەکی ئاوی گەورە کە حەزی لە مەلەکردنە 🦆" },
  { word: "قەلەڕەش", hint: "باڵندەیەکی ڕەشی زیرەک کە تەمەنی زۆر درێژە 🐦" },
  { word: "بلبل", hint: "باڵندەیەکی دەنگخۆش کە بەیانیان دەخوێنێت 🐤" },
  { word: "کیسەڵ", hint: "زیندەوەرێکی قاوغداری هێواش و لەسەرخۆ 🐢" },
  { word: "ماسی", hint: "زیندەوەرێکی ئاوی جوان کە مەلە دەکات 🐟" },
  { word: "بۆق", hint: "زیندەوەرێکی سەوز کە لە ناو ئاودا دەقورێنێت 🐸" },
  { word: "وشتر", hint: "گیانداری بیابان کە بەرگەی تینووێتی دەگرێت 🐪" },
  { word: "مێروولە", hint: "زیندەوەرێکی یەکجار بچووک و تێکۆشەر 🐜" },
  { word: "هەنگ", hint: "مێروویەکی بەسوود کە هەنگوینمان پێدەدات 🐝" },
  { word: "نەهەنگ", hint: "گەورەترین زیندەوەری ناو دەریای قووڵ 🐋" },

  // 🧸 کایە، کەرەستە و قوتابخانە
  { word: "بووکەڵە", hint: "یارییەکی خۆش و نەرمی کچانی منداڵ 🧸" },
  { word: "تۆپ", hint: "کەرەستەیەکی خڕ بۆ یاری تۆپی پێ لەگەڵ هاوڕێکان ⚽" },
  { word: "فڕۆکە", hint: "یارییەکی فڕیو کە منداڵان زۆر حەزیان لێیە ✈️" },
  { word: "پاسکیل", hint: "کەرەستەیەکی دوو چەرخی خۆش بۆ وەرزش و یاری 🚲" },
  { word: "کارتۆن", hint: "فلیمە جووڵاوە ڕەنگاوڕەنگەکانی سەر شاشە 🎬" },
  { word: "قەڵەم", hint: "کەرەستەیەکی سەرەکی بۆ نووسینی پیت و وشەکان ✏️" },
  { word: "دەفتەر", hint: "لاپەڕەی کۆکراوە بۆ نووسینی وانەکانی قوتابخانە 📖" },
  { word: "کتێب", hint: "سەرچاوەی گەورەی زانیاری و چیرۆکە شیرینەکان 📚" },
  { word: "جانتا", hint: "کەرەستەیەک بۆ هەڵگرتنی کتێب و قەڵەمەکانت 🎒" },
  { word: "مۆسیقا", hint: "دەنگێکی خۆش و ئارامکەرەوە بۆ مێشکی منداڵ 🎵" },
  { word: "دیاری", hint: "شتێکی خۆش کە لە ڕۆژی لەدایکبووندا پێشکەش دەکرێت 🎁" },
  { word: "چیرۆک", hint: "بەسەرهاتی پەروەردەیی کە شەوانە دایک دەیخوێنێتەوە 📖" },
  { word: "مەتەڵ", hint: "پرسیارێکی زیرەکانە بۆ تاقیکردنەوەی مێشکت 🧩" },
  { word: "باڵۆن", hint: "کەرەستەی فووتێکراوی ڕەنگاوڕەنگی یاری منداڵ 🎈" },
  { word: "کۆلارە", hint: "کاغەزی فڕیوی دەستی منداڵانە لە ناو ئاسمان 🪁" },
  { word: "مەقەس", hint: "کەرەستەیەکی بڕین بۆ دروستکردنی شێوەی کاغەزی ✂️" },
  { word: "پۆل", hint: "ژووری فێربوون و کۆبوونەوەی هاوڕێکان لە قوتابخانە 🏫" },
  { word: "مێز", hint: "کەرەستەیەکی دارین بۆ دانانی دەفتەرەکەت 🪑" },
  { word: "کورسی", hint: "شوێنی دانیشتنی ئارام بۆ گۆیگرتن لە وانەکان 🪑" },
  { word: "سەعات", hint: "ئامێری نیشاندانی کات بۆ قوتابخانە ⏰" },
  { word: "گڵۆپ", hint: "سەرچاوەی ڕووناککردنەوەی ژووری خوێندن 💡" },
  { word: "دەرگا", hint: "دەروازەی چوونە ژوورەوە بۆ ناو ماڵی ئارام 🚪" },
  { word: "پەنجەرە", hint: "شوێنی بینینی دیمەنی دەرەوە 🪟" },
  { word: "sندوق", hint: "بۆکسی دارین بۆ شاردنەوەی یارییەکانت 📦" },
  { word: "کلیل", hint: "کەرەستەیەکی بچووک بۆ کردنەوەی قفڵەکان 🔑" },
  { word: "پەت", hint: "حەبڵێکی درێژ بۆ یاری پەتپەتێنی کچان 🪢" },
  { word: "دەرزی", hint: "کەرەستەیەکی تیژ بۆ دوورینی جلوبەرگ 🪡" },
  { word: "داو", hint: "دەزووی ڕەنگاوڕەنگ بۆ دوورینی جلوبەرگەکان 🧵" },
  { word: "تەباشیر", hint: "بەردی ڕەنگاوڕەنگ بۆ نووسین لەسەر تەختە 🖍️" },
  { word: "وانە", hint: "مەشق و زانیارییەکانی ناو پۆلی قوتابخانە 📝" },

  // 🍏 میوەکان و ژینگە
  { word: "سێو", hint: "میوەیەکی خڕی سوور یان سەوز کە زۆر بەسوودە 🍎" },
  { word: "مۆز", hint: "میوەیەکی درێژی زەرد و شیرین کە وزەمان پێدەدات 🍌" },
  { word: "هەنار", hint: "میوەیەکی پڕ لە دەنکە سوورە درەوشاوەکانی کوردستان 🍎" },
  { word: "ترێ", hint: "میوەیەکی هێشوویی شیرین و بەتام 🍇" },
  { word: "شووتی", hint: "میوەیەکی گەورەی سەوز کە ناوەکەی سوور و ئاودارە 🍉" },
  { word: "هەنجیر", hint: "میوەیەکی کلتووری زۆر شیرین و بەتام 🍓" },
  { word: "شیر", hint: "خواردنەوەیەکی سپی تەندروست بۆ بەهێزبوونی ئێسک 🥛" },
  { word: "هەنگوین", hint: "شیرینی سروشتی سەر مێز کە هەنگ دروستی دەکات 🍯" },
  { word: "نان", hint: "سەرچاوەی سەرەکی خواردنی سەر مێزی کوردەواری 🫓" },
  { word: "پەنیر", hint: "خواردنی بەیانیانی منداڵان لەگەڵ چای شیرین 🧀" },
  { word: "هێلکە", hint: "خۆراکێکی پڕ لە پرۆتین بۆ گەشەکردنی جەستەت 🥚" },
  { word: "شۆربا", hint: "خواردنێکی گەرمی بەتام بۆ کاتی زستان و سەرما 🍲" },
  { word: "باران", hint: "دڵۆپە ئاوە بەپیتەکانی ئاسمان لە وەرزی زستاندا 🌧️" },
  { word: "بەفر", hint: "دەنکە سپییە جوانەکانی زستان کە چیا سپی دەکات ❄️" },
  { word: "خۆر", hint: "گەورەترین ئەستێرە کە گەرمی دەدات بە زەوی ☀️" },
  { word: "هەور", hint: "تەم و مژی سپی سەر ئاسمان کە باران دروست دەکات ☁️" },
  { word: "باخچە", hint: "شوێنی پیاسە و یاری منداڵان لە ناو شاردا 🏡" },
  { word: "درەخت", hint: "ڕووەکێکی گەورە کە سێبەر و ئۆکسجینمان پێدەدات 🌳" },
  { word: "گوڵ", hint: "ڕووەکێکی بۆنخۆش و جوان کە سروشت دەڕازێنێتەوە 🌹" },
  { word: "پەلکەزێڕینە", hint: "کەوانە ڕەنگاوڕەنگەکەی دوای باران لە ناو ئاسمان 🌈" },
  { word: "پێكەنین", hint: "نیشانەی دڵخۆشی و شادی سەر ڕوخساری تۆ 😊" },
  { word: "تاڤگە", hint: "ئاوی بەخوڕ کە لە سەر شاخە بەرزەکانەوە دێتە خوارێ 🌊" },
  { word: "چیا", hint: "چیا سەرکەش و بەرزەکانی نیشتمانە جوانەکەمان ⛰️" },
  { word: "ئەشکەوت", hint: "شوێنی دێرینی ژیانی مرۆڤە سەرەتاییەکان لە شاخ 🕳️" },
  { word: "ڕووبار", hint: "ئاوێکی بەخوڕ و زۆر کە بە ناو دۆڵەکاندا دەڕوات 🏞️" },
  { word: "کانی", hint: "سەرچاوەی ئاوی پاک و سارد لە دلێ چیاکانەوە 💧" },
  { word: "مژ", hint: "تەم و دووکەڵی ساردی بەیانیانی زستان 🌫️" },
  { word: "بەهار", hint: "وەرزی سەوزبوونی زەوی و هاتنی گوڵەکان 🌱" },
  { word: "هاوین", hint: "وەرزی پشووی گەورەی قوتابخانە و گەشت 🏖️" },
  { word: "زستان", hint: "وەرزی بارینی بەفر و بارانی خۆش 🌨️" }
].sort(() => Math.random() - 0.5);

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

  const initWordGame = (index: number) => {
    if (index >= WORD_GAMES.length) return;
    const game = WORD_GAMES[index];
    const letters = game.word.replace(/\s+/g, '').split('');
    const mixed = [...letters].sort(() => Math.random() - 0.5);
    setShuffledLetters(mixed);
    setSelectedLetters([]);
    setGameSuccess(false);
    setWordGameIndex(index);
  };

  useEffect(() => {
    if (mode === 'games') {
      initWordGame(0);
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
    }
  };

  const handleRevealAnswer = () => {
    const correctWordClean = WORD_GAMES[wordGameIndex].word.replace(/\s+/g, '');
    setSelectedLetters(correctWordClean.split(''));
    setShuffledLetters([]);
    setGameSuccess(true);
  };

  const resetCurrentWordGame = () => {
    initWordGame(wordGameIndex);
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
        setError("⚠️ لێمیتی نامەکانی ئەمڕۆت تەواو بوو! بۆ گفتوگۆی بێسنوور، ببە بە ئەندامی Premium.");
      } else {
        setError("ببوورە کێشەیەک ڕوویدا، دووبارە تاقیکەرەوە.");
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
        <button onClick={() => { setMode('story'); setResponse(null); setNamesList([]); }} className={`py-2.5 rounded-2xl font-black text-xs transition-all border ${mode === 'story' ? 'bg-pink-600/20 border-pink-500 text-pink-400 shadow-lg' : 'bg-zinc-900/40 border-zinc-800 text-zinc-400'}`}>چیرۆک📚</button>
        <button onClick={() => { setMode('riddle'); setResponse(null); setNamesList([]); }} className={`py-2.5 rounded-2xl font-black text-xs transition-all border ${mode === 'riddle' ? 'bg-amber-600/20 border-amber-500 text-amber-400 shadow-lg' : 'bg-zinc-900/40 border-zinc-800 text-zinc-400'}`}>مەتەڵ🧩</button>
        <button onClick={() => { setMode('ask'); setResponse(null); setNamesList([]); }} className={`py-2.5 rounded-2xl font-black text-xs transition-all border ${mode === 'ask' ? 'bg-cyan-600/20 border-cyan-500 text-cyan-400 shadow-lg' : 'bg-zinc-900/40 border-zinc-800 text-zinc-400'}`}>پرسیار🤔</button>
        <button onClick={() => { setMode('names'); setResponse(null); setNamesList([]); }} className={`py-2.5 rounded-2xl font-black text-xs transition-all border ${mode === 'names' ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-lg' : 'bg-zinc-900/40 border-zinc-800 text-zinc-400'}`}>ناوەکان👶🏻</button>
        <button onClick={() => { setMode('games'); setResponse(null); setNamesList([]); }} className={`py-2.5 rounded-2xl font-black text-xs transition-all border col-span-2 sm:col-span-1 ${mode === 'games' ? 'bg-purple-600/20 border-purple-500 text-purple-400 shadow-lg' : 'bg-zinc-900/40 border-zinc-800 text-zinc-400'}`}>کایەی وشە🎮</button>
      </div>

      {/* 👑 مۆدی سەرەکی فۆرمی چات / نووسینی چیرۆک، مەتەڵ و پرسیارکردن (گەراندرایەوە) */}
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
            onClick={handleKidsRequest}
            disabled={loading || (mode === 'ask' && !input.trim())}
            className={`w-full py-3 text-zinc-950 font-black text-xs rounded-xl transition-all shadow-md ${mode === 'story' ? 'bg-pink-400' : mode === 'riddle' ? 'bg-amber-400' : 'bg-cyan-400'}`}
          >
            {loading ? '🔮 خەریکی بیرکردنەوەم...' : 'ڕەوانەکردن'}
          </button>
        </div>
      )}

      {/* مۆدی کایەی وشەسازی */}
      {mode === 'games' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="bg-[#0e0e12] border border-zinc-800 p-6 rounded-3xl text-center space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
              <span className="text-[10px] font-black text-purple-400 font-mono bg-purple-500/5 border border-purple-500/10 px-2 py-0.5 rounded-md">
                قۆناغی: {wordGameIndex + 1} / {WORD_GAMES.length}
              </span>
              <span className="text-xs font-black text-zinc-300 font-['Noto_Sans_Arabic']">✍️ کایەی پیتە تێکەڵەکان</span>
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
                    {selectedLetters.join('')}
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
                  key={idx} 
                  onClick={() => selectLetter(char, idx)} 
                  className="w-11 h-11 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-purple-500/40 text-zinc-200 font-black text-base rounded-xl transition-all active:scale-90 shadow-md"
                >
                  {char}
                </button>
              ))}
            </div>

            <div className="flex gap-3 pt-3 justify-center items-center border-t border-zinc-900/60">
              <button 
                onClick={resetCurrentWordGame} 
                className="px-4 py-2 bg-zinc-950 text-zinc-500 hover:text-zinc-300 border border-zinc-800 text-[10px] font-black rounded-xl transition-all active:scale-95"
              >
                🔄 سڕینەوە و دەستپێکردنەوە
              </button>
              
              {wordGameIndex < WORD_GAMES.length - 1 && gameSuccess && (
                <button 
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
                🎉 ئافەرین ژیرەکەم! وشەکەت بە تەواوی و ڕاستی دروستکرد!
              </div>
            )}
          </div>
        </div>
      )}

      {/* مۆدی ناوەکان */}
      {mode === 'names' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="bg-[#0e0e12] border border-zinc-800 p-4 rounded-3xl space-y-2">
            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-wider pr-1">✨ چ جۆرە ناوێکت دەوێت؟</label>
            <input type="text" value={nameDescription} onChange={(e) => setNameDescription(e.target.value)} placeholder="وەسفی ناوەکە لێرە بنووسە..." className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 focus:outline-none text-right" />
          </div>

          <div className="bg-[#0e0e12] border border-zinc-800 p-3 rounded-3xl flex justify-center gap-3">
            <button onClick={() => setGenderFilter('girl')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${genderMode === 'girl' ? 'bg-pink-500/20 border-pink-500 text-pink-400 shadow-md' : 'bg-zinc-950 text-zinc-400 border-zinc-800'}`}>منداڵی کچ🎀</button>
            <button onClick={() => setGenderFilter('boy')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${genderMode === 'boy' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-md' : 'bg-zinc-950 text-zinc-400 border-zinc-800'}`}>منداڵی کوڕ💙</button>
          </div>

          {namesList.length === 0 && !loading && (
            <button onClick={fetchKurdishNames} className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs rounded-xl shadow-lg border border-emerald-400/20">گەڕان بۆ ناوی منداڵ🔍</button>
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
            <button onClick={fetchKurdishNames} className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 border border-amber-400/20">دووبارە گەڕان بۆ ناوی نوێ🔄</button>
          )}
        </div>
      )}

      {/* بۆکسی گشتی نیشاندانی وەڵامەکانی چیرۆک، مەتەڵ و پرسیارکردن */}
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