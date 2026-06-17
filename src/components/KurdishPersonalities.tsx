import React, { useState } from 'react';

const personalitiesData = [
  {
    id: 1,
    name: 'قازی محەمەد',
    title: 'سەرۆک کۆماری کوردستان',
    category: 'political',
    shortDesc: 'دامەزرێنەری کۆماری کوردستان لە مەهاباد لە ساڵی ١٩٤٦ و سەرکردەیەکی مێژوویی کورد.',
    fullText: `پێشەوا قازی محەمەد یەکێکە لە دیارترین و ناسراوترین سەرکردە نیشتمانی و سیاسییەکانی مێژووی گەلی کورد کە بە دامەزرێنەر و سەرۆکی کۆماری کوردستان لە مەهاباد دەناسرێت ئەو لە بنەماڵەیەکی ناودار و نیشتمانپەروەر و ڕۆشنبیری شاری مەهاباد لەدایکبووە و هەر لە تەمەنی گەنجێتییەوە گرنگییەکی زۆری بە زانست و فێربوونی زمانە جیاوازەکان داوە و وەک کەسایەتییەکی دادپەروەر و زمانزان لە ناوچەکەدا دەرکەوتووە ، قازی محەمەد لە ساڵی هەزار و نۆسەد و چل و شەشدا ڕابەرایەتی ڕاگەیاندنی یەکەمین کۆماری کوردی کرد و وەک سەرۆکی کۆمار سوێندی یاسایی خوارد و لە ماوەی کاتیی دەسەڵاتی کۆماردا گرنگییەکی بێوێنەی بە بواری خوێندن و چاپەمەنی و مافەکانی ژنان دا و پەرچەمی کوردستانی شەکاندەوە بەڵام دوای ڕووخانی کۆمارەکە بەهۆی هێرشی سوپای ئەوکاتی ئێرانەوە پێشەوا قازی محەمەد لە پێناو پاراستنی گیانی خەڵکی شارەکە لە ناوچەکە مایەوە و خۆی بەخت کرد و لە کۆتاییدا لە مێژووی سی و یەکی ئازاری هەزار و نۆسەد و چل و حەوتدا لە گۆڕەپانی چوارچرای شاری مەهاباد لە سێدارە درا و بووە سیمبولی نەمر بۆ خەبات و ئازادیخوازی گەلی کورد

بەداخەوە تەمەنی کۆمارەکە کورت بوو، بەڵام کاریگەرییەکەی لەسەر بیری نەتەوەیی کورد بۆ هەمیشە دەمێنێتەوە.`,
    image: '/personalities/qazi2.jpg', 
    color: 'from-blue-600 to-indigo-600'
  },
  {
    id: 2,
    name: 'مەستوورەی ئەردەڵان',
    title: 'شاعیر و مێژوونووس',
    category: 'literary',
    shortDesc: 'یەکەم ژنە مێژوونووسی ڕۆژهەڵاتی ناوەڕاست و شاعیرێکی گەورەی کورد.',
    fullText: `مەستوورەی ئەردەڵان (ماھ شەرەف خانم) یەکێکە لە درەوشاوەترین و ناودارترین ژنە ڕووناکبیر، شاعیر و مێژوونووسەکانی گەلی کورد و ڕۆژهەڵاتی ناوەڕاست، کە لە ساڵی ١٨٠٥ لە شاری سنەی ئەردەڵان لەدایکبووە. لە سەردەمێکدا کە خوێندن و نووسین زیاتر بۆ پیاوان قۆرخ ببوو، مەستوورە بەهۆی پاڵپشتیی بنەماڵە ئەدیبەکەیەوە توانی ببێتە زمانزانێکی لێهاتوو لە زمانەکانی کوردی، فارسی و عەرەبیدا ، مەستوورە خانم بە یەکەم ژنە مێژوونووس لە ڕۆژهەڵاتی ناوەڕاست دادەنرێت، کە کتێبی بەناوبانگی (مێژووی ئەردەڵان)ی نووسیوە و تێیدا بە وردی باسی میرنشینی ئەردەڵانی کردووە. جگە لە مێژوونووسینی، شاعیرێکی یەکجار بەتوانا بوو و دیوانە شیعرەکەی پڕە لە غەزەلی ناسک و قووڵ. دوای ڕووخانی میرنشینی ئەردەڵان, کۆچی کرد بۆ باشووری کوردستان و لە ساڵی ١٨٤٨ لە شاری سلێمانی کۆچی دوایی کرد و هەر لەوێش نێژرا`,
    image: '/personalities/mastura.jpg',
    color: 'from-pink-600 to-rose-600'
  },
  {
    id: 3,
    name: 'شێرکۆ بێکەس',
    title: 'شاعیری گەورەی کورد',
    category: 'literary',
    shortDesc: 'یەکێک لە شاعیرە هەرە ناسراوەکانی کورد لە سەدەی بیستەمدا و خاوەنی خەڵاتی تۆخۆڵسکی.',
    fullText: `شێرکۆ بێکەس (١٩٤٠ - ٢٠١٣) یەکێکە لە مەزنترین و داهێنەرترین شاعیرانی هاوچەرخی کورد، کە بەهۆی زمانە دەوڵەمەندەکەی و خەیاڵە بێپایانەکەیەوە نازناوی (ئیمپراتۆری شیعر)ی پێبەخشراوە. ئەو لە شاری سلێمانی و لە باوەشی بنەماڵەیەکی ئەدیبدا لەدایکبوو، کە باوکی (فایق بێکەس) شاعیرێکی نیشتمانیی ناسراو بوو ، شێرکۆ بێکەس وەرچەرخانێکی گەورەی لە مێژووی شیعری کوردیدا دروستکرد، کاتێک لە سەرەتای حەفتاکاندا لەگەڵ هاوڕێکانیدا ڕەوتی (ڕوانگە)یان ڕاگەیاند و شێوازی باوی شیعری کلاسیکییان بەرەو نوێگەری و شیعری ئازاد گۆڕی. شیعرەکانی ئەو تەنها گوزارشت لە ئەوین و سروشت ناکەن، بەڵکو دەنگدانەوەی ئازارەکان، شۆڕش، ئەنفال و کیمیابارانی کوردستان بوون لە جیهاندا ئەم ئەدیبە گەورەیەخاوەنی دەیان دیوان و ڕووبارە شیعرە، و بەهۆی لێهاتووییەوە خەڵاتی نێودەوڵەتی (تۆخۆڵسکی) لە سوید پێبەخشرا و بەرهەمەکانی وەرگێڕدراونەتە سەر چەندین زمانی جیهانی. ئەو لە ساڵی ٢٠١٣ لە ستۆکهۆڵم کۆچی دوایی کرد و بەپێی وەسێتی خۆی لە ناو جەرگەی پارکی ئازادیی شاری سلێمانیدا نێژرا تا لە نزیک لێدانی دڵی خەڵکەکەیەوە بێت`,
    image: '/personalities/sherko.jpg',
    color: 'from-emerald-600 to-teal-600'
  },
  {
    id: 4,
    name: 'نالی',
    title: 'دامەزرێنەری قوتابخانەی بابان',
    category: 'literary',
    shortDesc: 'مەلا خدر کوڕی ئەحمەد، ناسراو بە نالی، دامەزرێنەری قوتابخانەی شیعری بابان.',
    fullText: `نالی (خدر کوڕی ئەحمەدی شەوکلێس) (١٨٠٠ - ١٨٥٦) مەزنترین شاعیری کلاسیکی کورد و دامەزرێنەری قوتابخانەی شیعری بابانە، کە بە زمانەوان و داهێنەری سەرەکیی شێوەزاری سۆرانی لە ئەدەبیاتدا دادەنرێت. ئەو لە گوندی خاک و خۆڵ لە ناوچەی شارەزوور لەدایکبوو، و دوای تەواوکردنی خوێندنی ئاینی لە حوجرەکاندا، نازناوی (مەلا خدری شارەزووری) پێبەخشرا ، نالی لە سەردەمی زێڕینی میرنشینی باباندا لە سلێمانی ژیاوە و شیعرەکانی لوتکەی جوانی، قووڵی و ڕەوانبێژین، کە تێیدا فەلسەفە، ئەوین و سۆزی نیشتمانی بە شێوازێکی بێوێنە ئاوێتە کردووە. دوای ڕووخانی میرنشینەکە، نالی ناچار بوو وڵات بەجێبهێڵێت و ڕوو بکاتە شام و دواتریش ئەستەمبوڵ، قەسیدە بەناوبانگەکەی (قوربانی تۆزی ڕێگەت بم) کە لە غەریبیدا بۆ شاری سلێمانی نووسیوە، بە یەکێک لە بەرزترین و پڕسۆزترین نموونەکانی شیعری کوردی دادەنرێت. ئەم شاعیرە هاوشێوەی عاتیفەکەی، غەریبانە لە ئەستەمبوڵ کۆچی دوایی کرد و لە گۆڕستانی ئەبو ئەیوبی ئەنساری نێژرا`,
    image: '/personalities/nali.jpg',
    color: 'from-amber-600 to-orange-600'
  },
  {
    id: 5,
    name: 'جەلال تاڵەبانی',
    title: 'سەرۆککۆماری عێراق',
    category: 'political',
    shortDesc: 'یەکەم سەرۆک کۆماری کورد لە مێژووی دەوڵەتی عێراق',
    fullText: ` (جەلال تاڵەبانی) (١٩٣٣ - ٢٠١٧) کە لە ناو خەڵکدا بە (مام جەلال)دەناسرێت، یەکێکە لە دیارترین، کاریگەرترین و لێهاتووترین سەرکردە سیاسییەکانی مێژووی هاوچەرخی کورد و عێراق. ئەو لە گوندی کلکانی بناری چیای کۆسرەت لەدایکبوو، و هەر لە تەمەنی گەنجێتییەوە تێکەڵ بە خەباتی سیاسی و ڕێکخراوەیی بوو ، مام جەلال لە ساڵی ١٩٧٥دا لەگەڵ کۆمەڵێک هاوڕێی دا کەتایبەت مەند بوون بە خەباتی نوێ، یەکێتیی نیشتمانیی کوردستانیان دامەزراند و ڕابەرایەتی شۆڕشی نوێی گەلی کوردی کرد لە شاخ. ئەو بە کارێزما و لێهاتوویی دیپلۆماسیی خۆی دەناسرایەوە، کە دەیتوانی نەیارە سیاسییەکان لەسەر یەک مێز کۆبکاتەوە، بۆیە بە (سەمامەی ئەمان) یان دەستەبەرکاری ئاشتی و تەبایی دەبرا ناوی ، مێژووییترین وەرچەرخان لە ژیانی سیاسی ئەودا لە ساڵی ٢٠٠٥دا بوو، کاتێک وەک یەکەم سەرۆک کۆماری کورد لە مێژووی دەوڵەتی عێراقدا هەڵبژێردرا، کە ئەمەش پێگەیەکی مەزنی بە کورد بەخشی لە ناوچەکەدا. مام جەلال لە ساڵی ٢٠١٧ لە ئەڵمانیا کۆچی دوایی کرد و لە گردی دەباشانی شاری سلێمانی بە خاک سپێردرا`,
    image: '/personalities/jalal.jpg', 
    color: 'from-emerald-600 to-green-600' 
  },
  {
    id: 6,
    name: 'نەوشیروان مستەفا',
    title: 'ئەندازیاری ڕاپەڕین',
    category: 'political',
    shortDesc: 'سەرپەرشتیاری ڕاستەوخۆی ڕاپەڕینە مەزنەکەی ساڵی ١٩٩١ ی گەلی کورد ',
    fullText: `نەوشیروان مستەفا (١٩٤٤ - ٢٠١٧) یەکێکە لە دیارترین، کاریگەرترین و پڕکێشەترین سەرکردە سیاسی و ڕۆشنبیرەکانی مێژووی هاوچەرخی کوردستان. ئەو لە شاری سلێمانی لەدایکبوو، خوێندنی لە زانکۆی بەغدا و دواتر لە نەمسا لە بواری زانستە سیاسییەکاندا تەواو کرد، بۆیە هەمیشە وەک سەرکردەیەکی خاوەن تیۆری و ستراتیژ دەبینرا ، نەوشیروان مستەفا ڕۆڵێکی سەرەکی و مێژوویی هەبوو لە دامەزراندنی یەکێتیی نیشتمانیی کوردستان و ساڵانێکی درێژ وەک جێگری سکرتێری گشتی و فەرماندەی هێزی پێشمەرگە خەباتی کرد، گەورەترین دەستکەوتی سەربازی و سیاسی ئەو، داڕشتنی نەخشە و سەرپەرشتیکردنی ڕاستەوخۆی ڕاپەڕینە مەزنەکەی ساڵی ١٩٩١ی گەلی کورد بوو. لە ساڵی ٢٠٠٩دا، بەهۆی جیاوازیی دیدگای لەسەر شێوازی بەڕێوەبردن، بزوتنەوەی گۆڕانی وەک یەکەم هێزی ئۆپۆزسیۆنی فەرمی و کاریگەر لە هەرێمی کوردستان دامەزراند ، جگە لە کایەی سیاسی، ئەو نووسەر و مێژوونووس و ڕۆژنامەنووسێکی لێهاتوو بوو کە چەندین کتێبی گرنگی لەسەر مێژووی ئەدەب و ڕامیاری و ڕۆژنامەگەریی کوردی لەپاش خۆی جێهێشت. ئەو لە ساڵی ٢٠١٧ لە شاری سلێمانی کۆچی دوایی کرد و لە گردی زەرگەتە بە خاک سپێردرا`,
    image: '/personalities/nawshirwan.jpg', 
    color: 'from-emerald-600 to-green-600' 
  },
  {
    id: 7,
    name: 'مەسعود بارزانی',
    title: 'سەرۆکی پارتی دیموکراتی کوردستان',
    category: 'political',
    shortDesc: 'یەکەمین سەرۆکی هەرێمی کوردستان ',
    fullText: `مەسعود بارزانی (لەدایکبووی ١٩٤٦) یەکێکە لە دیارترین و کاریگەرترین سەرکردە سیاسییەکانی مێژووی هاوچەرخی کوردستان، کە بۆ ماوەی چەندین دەیە ڕابەرایەتی کایەی سیاسی و سەربازیی گەلی کوردی کردووە. ئەو لە شاری مھاباد (هاوکات لەگەڵ تەمەنی کۆماری کوردستان) لەدایکبوو، و هەر لە تەمەنی گەنجێتییەوە وەک پێشمەرگە و سەرکردە تێکەڵ بە شۆڕشەکانی کوردستان بوو ، مەسعود بارزانی دوای کۆچی دوایی باوکی (مەلا مستەفا بارزانی)، لە ساڵی ١٩٧٩دا وەک سەرۆکی پارتی دیموکراتی کوردستان هەڵبژێردرا و ڕۆڵێکی سەرەکی هەبوو لە ڕێکخستنی شۆڕشی بەرگری و دواتریش سەرپەرشتیکردنی ڕاپەڕینە مەزنەکەی ساڵی ١٩٩١ و دامەزراندنی بەرەی کوردستانی. لە ساڵی ٢٠٠٥دا، وەک یەکەم سەرۆکی هەرێمی کوردستان هەڵبژێردرا و تا ساڵی ٢٠١٧ لەو پۆستەدا مایەوە، کە لەو ماوەیەدا سەرپەرشتی چەندین قۆناغی هەستیاری کرد، لەوانە شەڕی دژ بە تیرۆریستانی داعش و پڕۆسەی ڕیفراندۆمی سەربەخۆیی کوردستان ، جگە لە کارەکتەرە سیاسی و سەربازییەکەی، ئەو خاوەنی زنجیرە کتێبی مێژوویی (بارزانی و بزووتنەوەی ڕزگاریخوازی کورد)ە کە تێیدا قۆناغە جیاوازەکانی خەباتی نەتەوەیی تۆمار کردووە. ئەو ئێستاش وەک سەرۆکی پارتی دیموکراتی کوردستان و مەرجەعێکی سیاسیی گرنگ لە گۆڕەپانەکەدا ماوەتەوە`,
    image: '/personalities/masud.jpg', 
    color: 'from-emerald-600 to-green-600' 
  },
  {
    id: 8,
    name: 'پیرەمێرد',
    title: 'باوکی ڕۆژنامەگەریی',
    category: 'literary',
    shortDesc: ' کاریگەرترین و ناودارترین ڕۆژنامەنووس و ڕوناکبیری گەلی کورد',
    fullText: `پیرەمێرد (تۆفیق مەحموود هەمزە) (١٨٦٧ - ١٩٥٠) شاعیر، نووسەر، ڕۆژنامەنووس و ڕووناکبیرێکی مەزنی گەلی کوردە، کە بە (باوکی ڕۆژنامەگەریی کوردی) و نوێکەرەوەی جەژنی نەتەوەیی نەورۆز دەناسرێت. ئەو لە گەڕەکی گۆیژەی شاری سلێمانی لەدایکبوو، و دوای تەواوکردنی خوێندنی حوجرە، بۆ درێژەدان بە خوێندن و کارکردن چوو بۆ ئەستەمبوڵ و لەوێ بڕوانامەی مافی یاسایی بەدەستهێنا ، پیرەمێرد دوای گەڕانەوەی بۆ سلێمانی، ژیانی خۆی بەتەواوی بەخشی بە دەستپێکردنی شۆڕشێکی ڕۆشنبیری و کۆمەڵایەتی. ئەو سەرپەرشتی چاپخانەی (ژین)ی کرد و ڕۆژنامەی بەناوبانگی (ژین)ی دەرکرد، کە ڕۆڵێکی بێوێنەی هەبوو لە بڵاوکردنەوەی هۆشیاری، خزمەتکردنی زمان و ئەدەبی کوردی، و هاندانی خەڵک بۆ خوێندن. یەکێک لە گەورەترین دەستکەوتەکانی پیرەمێرد، زیندووکردنەوەی جەژنی نەورۆز بوو لەناو خەڵکدا؛ شیکردنەوە و هۆنراوەی پێشوازی لە بەهار و نەورۆز (بەتایبەت هۆنراوەی (ئەم ڕۆژی ساڵی نوێیە نەورۆزە هاتەوە)) کە تا ئێستاش وەک سروودێکی نەتەوەیی لە دڵی هەموو کوردێکدا دەنگ دەداتەوە، بەرهەمی قەڵەمی ئەون. ئەم زانا گەورەیە لە ساڵی ١٩٥٠دا کۆچی دوایی کرد و لە گردی مامەیارەی شاری سلێمانی بە خاک سپێردرا`,
    image: '/personalities/piramerd.jpg',
    color: 'from-amber-600 to-orange-600'
  },
   {
    id: 9,
    name: 'بەختیار عەلی',
    title: 'شاعیر و بیرمەندی هاوچەرخی کورد',
    category: 'literary',
    shortDesc: 'داهێنەرترین و کاریگەرترین ڕۆماننووس',
    fullText: `بەختیار عەلی (لەدایکبووی ١٩٦٠) یەکێکە لە ناسراوترین، داهێنەرترین و کاریگەرترین ڕۆماننووس، شاعیر و بیرمەندانی هاوچەرخی کورد. ئەو لە شاری سلێمانی لەدایکبووە و خوێندنی زانکۆی لە بەشەکانی زانست و زەویناسی لە سلێمانی و هەولێر تەواو کردووە، بەڵام دواتر بەتەواوی خۆی بەخشی بە جیهانی ئەدەب و فەلسەفە ، بەختیار عەلی بە یەکێک لە پێشەنگەکانی قوتابخانەی (ڕیالیزمی جادوویی) لە ئەدەبیاتی کوردیدا دادەنرێت. ڕۆمانە بەناوبانگەکانی وەک (شاری مۆسیقارە سپییەکان، غەزەلنووس و باخەکانی خەیاڵ، دوا هەناری دونیا، و جەمشید خان) وەرچەرخانێکی گەورەیان لە تەکنیکی گێڕانەوە و زمانی ڕۆمانی کوردیدا دروستکرد. بەرهەمەکانی تەنها لە ناوخۆدا نەمامەوە، بەڵکو وەرگێڕدراونەتە سەر چەندین زمانی زیندووی جیهانی وەک (ئەڵمانی، فەرەنسی، ئینگلیزی، و عەرەبی) و بەهۆی چڕی و قووڵیی دەقەکانییەوە، چەندین خەڵاتی ئەدەبی نێودەوڵەتی گرنگی بەدەستهێناوە. ئەو ئێستا لە ئەڵمانیا نیشتەجێیە و بەردەوامە لە نووسین و دەوڵەمەندکردنی کتێبخانەی کوردی`,
    image: '/personalities/baxtyar.jpg',
    color: 'from-amber-600 to-orange-600'
  },
   {
    id: 10,
    name: 'ئیبراهیم ئەحمەد',
    title: 'سەرکردە و ئەدیب',
    category: 'political',
    shortDesc: 'کاریگەرترین سەرکردە سیاسی و یاسایی و ئەدیبەکانی مێژووی هاوچەرخی کوردستان',
    fullText: `ئیبراهیم ئەحمەد (١٩١٤ - ٢٠٠٠) یەکێکە لە دیارترین و کاریگەرترین سەرکردە سیاسی، یاسایی و ئەدیبەکانی مێژووی هاوچەرخی کوردستان. ئەو لە شاری سلێمانی لەدایکبوو، و دوای تەواوکردنی خوێندنی یاسا لە زانکۆی بەغدا، وەک پارێزەرێکی لێهاتوو و بیرمەندێکی ڕادیکاڵ تێکەڵ بە کایەی نیشتمانی بوو ، ئیبراهیم ئەحمەد ڕۆڵێکی مێژوویی و دامەزرێنەری هەبوو لە بزووتنەوەی ڕزگاریخوازی کورددا، ئەو وەک سکرتێری گشتیی پارتی دیموکراتی کوردستان بۆ ساڵانێکی درێژ کاری کرد و دواتر لە ڕووی فیکری و سیاسییەوە بووە قوتابخانەیەک کە کاریگەریی گەورەی لەسەر دروستبوونی چەندین ڕەوتی سیاسی تر هەبوو. جگە لە پێگە سیاسییەکەی، ئەو نووسەر و ڕۆژنامەنووسێکی گەورە بوو؛ بە دەرکردنی گۆڤاری (گەلاوێژ) و نووسینی ڕۆمانی مێژوویی (ژانی گەل)، بنەمایەکی زۆر بەهێزی بۆ ئەدەبیاتی بەرگری و ڕۆژنامەگەریی کوردی داڕشت. ئەو لە ساڵی ٢٠٠٠ لە لەندەن کۆچی دوایی کرد و تەرمەکەی گەڕێندرایەوە بۆ سلێمانی و لە گردی سەلیم بەگ نێژرا`,
    image: '/personalities/ibrahim.jpg',
    color: 'from-amber-600 to-orange-600'
  },
];

const KurdishPersonalities: React.FC = () => {
  const [selectedPerson, setSelectedPerson] = useState<typeof personalitiesData[0] | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredPersonalities = personalitiesData.filter(person => {
    const matchesTab = activeTab === 'all' || person.category === activeTab;
    const query = searchQuery.trim().toLowerCase().replace(/ي/g, 'ی').replace(/ك/g, 'ک');
    const personName = person.name.toLowerCase().replace(/ي/g, 'ی').replace(/ك/g, 'ک');
    const personDesc = person.shortDesc.toLowerCase().replace(/ي/g, 'ی').replace(/ك/g, 'ک');
    const matchesSearch = personName.includes(query) || personDesc.includes(query);
    return matchesTab && matchesSearch;
  });

  return (
    <div className="flex flex-col h-[82vh] bg-slate-900/80 sm:bg-slate-900/50 sm:backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl relative z-10 overflow-hidden" dir="rtl">
      
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth overscroll-contain [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
        
        {!selectedPerson && (
          <div className="mb-6 mt-2 text-center animate-in fade-in slide-in-from-top-4 duration-500">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight mb-2 sm:mb-3">کەسایەتییە ناودارەکانی کورد</h2>
            <p className="text-slate-400 text-xs sm:text-sm md:text-base max-w-xl mx-auto leading-relaxed px-2">
              مێژووی نەتەوەیەک لە ڕێگەی کار و بەرهەمی کەسایەتییەکانییەوە دەخوێندرێتەوە.
            </p>
          </div>
        )}

        {!selectedPerson && (
          <div className="max-w-md mx-auto mb-6">
            <div className="relative mb-4">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="w-full bg-slate-950/40 border border-slate-800/80 rounded-2xl py-3 pr-12 pl-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
                placeholder="...گەڕان بەدوای کەسایەتی "
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex justify-center gap-1 sm:gap-2 bg-slate-950/40 p-1 sm:p-1.5 rounded-2xl border border-slate-800/80">
              <button 
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold rounded-xl transition-colors ${activeTab === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                هەمووی
              </button>
              <button 
                onClick={() => setActiveTab('literary')}
                className={`flex-1 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold rounded-xl transition-colors ${activeTab === 'literary' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                📜 ئەدیبان
              </button>
              <button 
                onClick={() => setActiveTab('political')}
                className={`flex-1 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold rounded-xl transition-colors ${activeTab === 'political' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                👑 سیاسەتمەداران
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 animate-in fade-in duration-300">
          {filteredPersonalities.map((person) => (
            <div 
              key={person.id}
              onClick={() => setSelectedPerson(person)}
              className="group relative overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-800/60 sm:bg-slate-800/40 hover:bg-slate-800/80 hover:border-slate-500 cursor-pointer flex flex-col transition-colors"
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${person.color} opacity-70`}></div>
              
              <div className="p-5 sm:p-6 flex-1 flex flex-col items-center text-center">
                <div className="relative mb-3 sm:mb-4">
                  <img 
                    src={person.image} 
                    alt={person.name}
                    loading="lazy"
                    className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-slate-700 sm:group-hover:scale-105 transition-transform duration-300 shadow-lg"
                  />
                </div>
                
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1">{person.name}</h3>
                <div className="text-indigo-400 text-[10px] sm:text-xs font-bold mb-3 sm:mb-4 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 inline-block">
                  {person.title}
                </div>
                
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed line-clamp-2">
                  {person.shortDesc}
                </p>
              </div>

              <div className="px-5 py-3 sm:px-6 sm:py-4 border-t border-slate-700/50 bg-slate-900/30 sm:group-hover:bg-indigo-500/10 transition-colors duration-300">
                <div className="text-indigo-300 text-xs font-bold flex items-center justify-center gap-2">
                  <span>خوێندنەوەی تەواو</span>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 transform sm:group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </div>
              </div>
            </div>
          ))}

          {filteredPersonalities.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-slate-300 mb-2">هیچ ئەنجامێک نەدۆزرایەوە</h3>
              <p className="text-slate-500 text-sm">بەدوای کەسایەتییەکی تردا بگەڕێ.</p>
            </div>
          )}
        </div>
      </div>

      {selectedPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-[#020617]/90 sm:backdrop-blur-sm"
            onClick={() => setSelectedPerson(null)}
          ></div>
          
          <div className="relative w-full max-w-3xl max-h-[85vh] sm:max-h-[80vh] bg-slate-900 border border-slate-700 rounded-3xl sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            
            <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-900 flex justify-between items-center shrink-0">
              <div className="flex flex-col text-right">
                <h2 className="text-xl sm:text-2xl font-black text-white">{selectedPerson.name}</h2>
                <span className="text-indigo-400 text-[10px] sm:text-xs font-bold mt-1">{selectedPerson.title}</span>
              </div>
              
              <button 
                onClick={() => setSelectedPerson(null)}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-xl flex items-center justify-center border border-slate-700 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-8 flex flex-col md:flex-row gap-5 sm:gap-6 items-center md:items-start scroll-smooth overscroll-contain [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
              
              <div className="w-32 h-32 sm:w-44 sm:h-44 md:w-52 md:h-52 shrink-0 relative">
                <img 
                  src={selectedPerson.image} 
                  alt={selectedPerson.name} 
                  loading="lazy"
                  className="w-full h-full object-cover rounded-2xl border-2 border-slate-700 shadow-md relative z-10"
                />
              </div>

              <div className="flex-1 text-right w-full">
                <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-loose whitespace-pre-wrap font-medium">
                  {selectedPerson.fullText}
                </p>
              </div>

            </div>

            <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-950/40 shrink-0 text-left">
              <button 
                onClick={() => setSelectedPerson(null)}
                className="px-6 py-2.5 sm:px-8 sm:py-3 bg-slate-800 hover:bg-slate-700 text-white text-sm sm:text-base font-bold rounded-xl transition-colors border border-slate-700"
              >
                داخستن
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default KurdishPersonalities;