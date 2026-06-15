
import React, { useState, useEffect, useRef } from 'react';
import { getLandmarks } from '../services/geminiService';

const REGIONS = [
  { id: 'Erbil', label: 'هەولێر', type: 'prov', catchy: 'هەولێر؛ پایتەختی مێژوویی و ئاوەدانی.' },
  { id: 'Sulaymaniyah', label: 'سلێمانی', type: 'prov', catchy: 'سلێمانی؛ مەڵبەندی ڕۆشنبیری و هونەر.' },
  { id: 'Duhok', label: 'دهۆک', type: 'prov', catchy: 'دهۆک؛ بووکی کوردستان و دەروازەی چیاکان.' },
  { id: 'Kirkuk', label: 'کەرکووک', type: 'prov', catchy: 'کەرکووک؛ شاری بابەگوڕگوڕ و قەڵای دێرین.' },
  { id: 'Halabja', label: 'هەڵەبجە', type: 'prov', catchy: 'هەڵەبجە؛ پایتەختی ئاشتی و سروشتی هەورامان.' },
  { id: 'Zakho', label: 'زاخۆ', type: 'admin', catchy: 'زاخۆ؛ شاری پردی دەلال و دەروازەی کوردستان.' },
  { id: 'Akre', label: 'ئاکرێ', type: 'admin', catchy: 'ئاکرێ؛ پایتەختی نەورۆز و شاری خانووە پلەپلەکان.' },
  { id: 'Soran', label: 'سۆران', type: 'admin', catchy: 'سۆران؛ دەروازەی ناوچە شاخاوییە بەرزەکان.' },
  { id: 'Garmian', label: 'گەرمیان', type: 'admin', catchy: 'گەرمیان؛ هێمای خۆڕاگری و گەرمەی مێژوو.' },
  { id: 'Raparin', label: 'ڕاپەڕین', type: 'admin', catchy: 'ڕاپەڕین؛ دەروازەی ڕاپەڕینە مەزنەکە.' },
];

const MASTER_ASSETS: Record<string, string> = {
  'Erbil': 'https://images.unsplash.com/photo-1644342352822-5f606821262d?q=80&w=2000&auto=format&fit=crop',
  'Sulaymaniyah': 'https://images.unsplash.com/photo-1628163539063-8828b0303b71?q=80&w=2000&auto=format&fit=crop', 
  'Duhok': 'https://images.unsplash.com/photo-1548685913-fe6574346a23?q=80&w=2500&auto=format&fit=crop',
  'Kirkuk': 'https://images.unsplash.com/photo-1621252327702-0aa0e698165e?q=80&w=2000&auto=format&fit=crop',
  'Halabja': 'https://images.unsplash.com/photo-1601058497548-f247dfe349d6?q=80&w=2000&auto=format&fit=crop',
  'Zakho': 'https://images.unsplash.com/photo-1601058497103-0524adb6900a?q=80&w=2000&auto=format&fit=crop',
  'Akre': 'https://images.unsplash.com/photo-1534067783941-51c9c23eeaec?q=80&w=2000&auto=format&fit=crop',
  'Soran': 'https://images.unsplash.com/photo-1542662565-7e4b66bae529?q=80&w=2000&auto=format&fit=crop',
  'Garmian': 'https://images.unsplash.com/photo-1444491741275-3747c53c99b4?q=80&w=2000&auto=format&fit=crop',
  'Raparin': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2000&auto=format&fit=crop'
};

interface ExtendedLandmark {
  name: string;
  category: string;
  description: string;
  imageQuery: string;
  directUrl?: string; 
}

const optimizeUrl = (url: string, width: number = 800) => {
  if (url && url.includes('unsplash.com')) {
    try {
      const u = new URL(url);
      u.searchParams.set('w', width.toString());
      u.searchParams.set('q', '75');
      u.searchParams.set('auto', 'format');
      u.searchParams.set('fit', 'crop');
      return u.toString();
    } catch (e) {
      return url;
    }
  }
  return url;
};

const LandmarkCard: React.FC<{ 
  landmark: ExtendedLandmark; 
  onClick: () => void 
}> = ({ landmark, onClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  const thumbUrl = landmark.directUrl 
    ? optimizeUrl(landmark.directUrl, 800)
    : `https://images.unsplash.com/featured/?${encodeURIComponent(landmark.imageQuery)},nature,architecture&w=800&q=70&auto=format&fit=crop`;

  return (
    <div 
      onClick={onClick} 
      className="group relative h-[600px] lg:h-[650px] rounded-[4rem] lg:rounded-[5rem] overflow-hidden border border-white/5 bg-[#0a0a0c] cursor-pointer hover:border-yellow-500/50 transition-all duration-700 shadow-2xl"
    >
      {!isLoaded && (
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-white/[0.02] via-white/[0.08] to-white/[0.02] animate-shimmer bg-[length:200%_100%]"></div>
      )}
      
      <img 
        src={thumbUrl} 
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
        decoding="async"
        className={`absolute inset-0 w-full h-full object-cover brightness-[0.5] group-hover:brightness-[0.7] group-hover:scale-110 transition-all duration-[1.5s] ${isLoaded ? 'opacity-100' : 'opacity-0'}`} 
        alt={landmark.name} 
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
      
      <div className="absolute inset-x-10 bottom-14 lg:inset-x-12 lg:bottom-16 text-right space-y-6 z-10">
        <span className="inline-block px-5 py-2 bg-yellow-500 text-black rounded-full font-black text-[8px] lg:text-[9px] uppercase tracking-widest">{landmark.category}</span>
        <h3 className="text-3xl lg:text-5xl font-black text-white font-['Noto_Sans_Arabic'] group-hover:text-yellow-500 transition-colors leading-tight">{landmark.name}</h3>
        <div className="h-1 w-0 group-hover:w-full bg-yellow-500 transition-all duration-700 rounded-full"></div>
      </div>
    </div>
  );
};

const STATIC_REGIONS_DATA: Record<string, any> = {
  'هەولێر': {
    cityNarrative: "هەولێر، دڵ و پایتەختی هەرێمی کوردستان، یەکێکە لە درەوشاوەترین و کۆنترین شارەکانی جیهان کە تا ئێستا ژیانی تێدا بەردەوامە. مێژووی ئەم شارە بۆ زیاتر لە ٦ هەزار ساڵ بەر لە زایین دەگەڕێتەوە. هەولێر تێکەڵەیەکی بێوێنەیە لە شکۆی مێژووی دێرین و تەلارسازی مۆدێرنی سەدەی بیست و یەک. قەڵای هەولێر، کە دەکەوێتە ناوەڕاستی شارەکە، نەک هەر نیشانەی شارەکەیە، بەڵکو هێمای خۆڕاگری و مێژووی دوورودرێژی گەلی کوردە.",
    landmarks: [
      { name: "قەڵای هەولێر", category: "شوێنەواری جیهانی (UNESCO)", description: "ئەم قەڵایە لەسەر گردێکی دەستکرد بە بەرزی ٣٢ مەتر دروستکراوە و یەکێکە لە کۆنترین شوێنە نیشتەجێبووەکانی جیهان کە مرۆڤ تا ئێستا تێیدا ماوەتەوە. قەڵاکە خاوەن زیاتر لە ٥٠٠ خانووی مێژووییە و بە کووچە و کۆڵانە تەنگ و دڵڕفێنەکانی دەناسرێتەوە. لە ساڵی ٢٠١٤ وەک شوێنەوارێکی جیهانی لە یونسکۆ تۆمار کرا.", imageQuery: "Erbil Citadel Castle Heritage" },
      { name: "پارکی سامي عبدالرحمن", category: "سروشتی و کات بەسەربردن", description: "گەورەترین پارکی شارستانییە لە ڕۆژهەڵاتی ناوەڕاست کە لەسەر ڕووبەری سەدان دۆنم زەوی دروستکراوە. ئەم پارکە پێشتر مەیدانێکی سەربازی بووە و ئێستا گۆڕدراوە بۆ بەهەشتێکی سەوز کە هەزاران جۆر دار و گوڵی تێدایە، لەگەڵ دەریاچەیەکی دەستکرد و یاریگای وەرزشی.", imageQuery: "Sami Abdulrahman Park Erbil Green" },
      { name: "منارەی چۆلی", category: "مێژوویی و ئایینی", description: "شوێنەوارێکی مێژوویی سەرنجڕاکێشە کە مێژووەکەی دەگەڕێتەوە بۆ سەردەمی سوڵتان موزەفەرەدین (١١٩٠-١٢٣٢ زاینی). بەرزییەکەی نزیکەی ٣٦ مەترە و بە نەخش و نیگارە جوانەکانی خشت و کاشییەکەی ناسراوە، کە گوزارشت لە هونەری بیناسازی ئیسلامی ئەو سەردەمە دەکات.", imageQuery: "Choli Minaret Erbil Architecture" },
      { name: "بازاڕی قەیسەری", category: "کولتووری و بازرگانی", description: "بازاڕێکی دێرین و مێژووییە لە بەرامبەر قەڵای هەولێر کە مێژووەکەی بۆ چەندین سەدە بەر لە ئێستا دەگەڕێتەوە. ئەم بازاڕە بە بنمیچە کەوانەییەکانی و دیمەنە ڕەسەنەکەی، ناوەندێکی سەرەکییە بۆ کڕینی جلوبەرگی کوردی، شیرینی وەک مەنەولسەما، و بەهاراتە ڕەسەنەکان.", imageQuery: "Erbil Qaysari Market Bazaar" },
      { name: "ئیمپایەر وۆڵد", category: "مۆدێرن و ئابووری", description: "ناوەندێکی بازرگانی و نیشتەجێبوونی پێشکەوتووە کە هێمای گەشەسەندنی خێرای هەولێرە. ئەم ناوچەیە بە تەلارسازییە مۆدێرنەکەی و هۆتێلە پێنج ئەستێرەییەکان و ناوەندە بازرگانییە جیهانییەکانی، شێوازێکی جیاواز و پێشکەوتوو بە شارەکە دەبەخشێت.", imageQuery: "Erbil Skyline Empire World" },
      { name: "مۆزەخانەی قوماشی کوردی", category: "کولتووری", description: "دەکەوێتە ناو یەکێک لە خانووە مێژووییەکانی ناو قەڵا. ئەم مۆزەخانەیە گەنجینەیەکی گەورەی فەرش، قوماش، و جلوبەرگی ڕەسەنی کوردی و ناوچە جیاوازەکانی کوردستان لەخۆ دەگرێت، کە مێژووی هەزاران ساڵەی چنین و ڕەنگکردن دەگێڕێتەوە.", imageQuery: "Kurdish Textile Museum Erbil" },
      { name: "مۆزەخانەی شارستانی هەولێر", category: "مێژوویی", description: "یەکێکە لە دەوڵەمەندترین مۆزەخانەکانی ناوچەکە کە چەندین پارچەی شوێنەواری دێرینی تێدایە کە مێژووەکەیان بۆ سەردەمی سۆمەری، ئاشووری، و بابلی دەگەڕێتەوە، کە لە پشکنینە شوێنەوارییەکانی دەوروبەری هەولێر دۆزراونەتەوە.", imageQuery: "Erbil Civilization Museum" }
    ]
  },
  'سلێمانی': {
    cityNarrative: "سلێمانی، پایتەختی ڕۆشنبیریی کوردستان و مەڵبەندی ئەدەب و داهێنانە. ئەم شارە لە ساڵی ١٧٨٤ لەلایەن ئیبراهیم پاشای بابانەوە وەک پایتەختی میرنشینی بابان بونیاد نراوە. سلێمانی شارێکە کە هەمیشە لانکەی شۆڕش و نوێگەری بووە. بە دەورەدرانی بە چیاکانی گۆیژە و ئەزمەڕ، دیمەنێکی سروشتی و ئارام بە شارەکە بەخشراوە کە تێیدا خەڵک بە میواندۆستی و ڕۆشنبیرییە بەرزەکەیان ناسراون.",
    landmarks: [
      { name: "مۆزەخانەی ئەمنە سوورەکە", category: "مێژوویی و نیشتمانی", description: "ئەم شوێنە پێشتر زیندان و ناوەندێکی ئەشکەنجەدانی ڕژێمی پێشوو بووە و ئێستا گۆڕدراوە بۆ مۆزەخانەیەکی گەورە. تێیدا مێژووی قوربانیدانی گەلی کورد، هۆڵی ئاوێنەکان (بۆ قوربانیانی ئەنفال)، و مێژووی ڕزگاریخوازی کورد بە شێوەیەکی کاریگەر پیشان دەدرێت.", imageQuery: "Amna Suraka Museum Sulaymaniyah" },
      { name: "چیای گۆیژە", category: "سروشتی و گەشتیاری", description: "هێمای شاری سلێمانییە. بەرزاییەکی سەرنجڕاکێشە کە دیمەنی تەواوی شار و دەوروبەری لە ژێر پێدایە. گەشتیاران ڕووی تێدەکەن بۆ بینینی خۆرئاوابوون و بەسەربردنی کاتێکی فێنک لە چێشتخانە و پارکە بەرزەکانی بناری چیاکە.", imageQuery: "Goizha Mountain Sulaymaniyah View" },
      { name: "پارکی ئازادی", category: "سروشتی و کات بەسەربردن", description: "پارکێکی گەورە و ئاوەدان لە جەرگەی شاری سلێمانی کە چەندین باخچەی گوڵ، یاریگای وەرزشی، و شوێنی دانیشتنی خێزانی تێدایە. ئەم پارکە شوێنی حەوانەوەی ڕۆژانەی دانیشتوانی شارەکەیە و دیمەنێکی سەوزی بێوێنەی بە دڵی شار بەخشیوە.", imageQuery: "Azadi Park Sulaymaniyah Greenery" },
      { name: "سەرچنار", category: "سروشتی و گەشتیاری", description: "هاوینەهەوارێکی مێژوویی و کۆنە لە سلێمانی کە بە سەرچاوەی ئاوە سازگارەکەی و دارستانە چڕەکانی سنۆبەر و چنار ناسراوە. ئەم ناوچەیە چەندین ڕێستۆرانت و هۆتێل و شوێنی کات بەسەربردنی تێدایە و فێنکترین ناوچەی شارە لە وەرزی هاویندا.", imageQuery: "Sarchinar Forest Sulaymaniyah" },
      { name: "مۆزەخانەی سلێمانی", category: "شوێنەواری", description: "دووەم گەورەترین مۆزەخانەیە لە عێراق کە کۆمەڵەیەکی دەگمەن لە پارچە شوێنەوارییەکانی سەردەمی بەردین تا سەردەمی ئیسلامی تێدا دەپارێزرێت. ئەم مۆزەخانەیە گەواهیدەری شارستانییەتە دێرینەکانی ناوچەی شارەزوور و دەوروبەریەتی.", imageQuery: "Sulaymaniyah Museum Artifacts" },
      { name: "چاڤی لاند", category: "گەشتیاری و یاری", description: "ناوەندێکی گەورەی گەشتیارییە کە تێیدا تەلەفریکێکی مۆدێرن گەشتیاران دەگوازێتەوە بۆ لوتکەی چیاکان. هەروەها خاوەن گەورەترین شاری یاری و نافورەی موزیکی و شوێنی نیشتەجێبوونی گەشتیارییە.", imageQuery: "Chavy Land Teleferic Sulaymaniyah" },
      { name: "شەقامی سالم (سەهۆڵەکە)", category: "کولتووری و کۆمەڵایەتی", description: "درێژترین و قەرەباڵغترین شەقامی شارە کە بە ناوەندی ژیانی شەوانەی سلێمانی دادەنرێت. ئەم شەقامە بە کتێبخانەکان، قاوەخانەکان، و خواردنە سەر جادەکان ناسراوە و مەڵبەندی کۆبوونەوەی گەنجان و ڕۆشنبیرانە.", imageQuery: "Sulaymaniyah Street Life Salem" }
    ]
  },
  'دهۆک': {
    cityNarrative: "دهۆک، بووکی کوردستان و شاری چیا سەرکەشەکان. ئەم شارە بە دیمەنە سروشتییە بێوێنەکانی و مێژووە دێرینەکەی دەناسرێتەوە کە تێیدا شارستانییەتی بادینان و ئیمپراتۆرییەتە کۆنەکان ڕەنگیان داوەتەوە. دهۆک دەروازەیەکی گرنگی هەرێمی کوردستانە بۆ جیهانی دەرەوە و خاوەن خەڵکێکی میواندۆست و کەشوهەوایەکی پاک و فێنکە کە هەموو گەشتیارێک سەرسام دەکات.",
    landmarks: [
      { name: "بنداوی دهۆک", category: "سروشتی و گەشتیاری", description: "دیمەنێکی سیحری لە تێکەڵبوونی ئاو و چیا. ئەم شوێنە نەک تەنها بۆ کشتوکاڵ، بەڵکو مەڵبەندێکی گرنگی گەشتیاری و پشوودانی دانیشتوانی شارەکەیە کە دیمەنێکی پانۆرامای بێوێنەی هەیە.", imageQuery: "Duhok Dam Lake Mountains" },
      { name: "ئامێدی (شارە بەرزەکە)", category: "شوێنەواری و مێژوویی", description: "یەکێک لە دەگمەنترین شارۆچکەکانی جیهان کە لەسەر لووتکەی شاخێکی دەستکردی سروشتی دروستکراوە. مێژووەکەی بۆ هەزاران ساڵ بەر لە ئێستا دەگەڕێتەوە و بە دەروازە مێژووییەکان و بیناسازییە کۆنەکەی ناسراوە.", imageQuery: "Amedi City Kurdistan Hill" },
      { name: "هاوینەهەواری زاويتە", category: "سروشتی", description: "دارستانە چڕەکانی سنۆبەر و کەشوهەوا فێنکەکەی، زاویتەی کردووە بە یەکێک لە ناوچە هەرە دڵڕفێنەکانی پارێزگای دهۆک کە گەشتیاران لە سەرانسەری عێراقەوە ڕووی تێدەکەن بۆ پشوو.", imageQuery: "Zawita Forest Pine Duhok" },
      { name: "ئەشکەوتی چارستین", category: "مێژوویی و ئایینی", description: "شوێنەوارێکی ئایینی دێرینی زەردەشتییەکانە کە لە ناو چیاکانی دهۆک هەڵکەنراوە و گوزارشت لە ڕەسەنایەتی و مێژووی ئایینە دێرینەکانی ناوچەکە دەکات.", imageQuery: "Charsteen Cave Duhok Historical" },
      { name: "پانۆرامای دهۆک", category: "گەشتیاری", description: "بەرزترین خاڵی شار کە تێیدا تەواوی دهۆک لە ژێر پێیەکاندایە. شوێنێکی ناوازەیە بۆ وێنەگرتن و بینینی دیمەنی شار لە شەودا کە بە ڕووناکییە گەشەکانی دەدرەوشێتەوە.", imageQuery: "Duhok Panorama Cityscape Night" },
      { name: "چیای گارا", category: "سروشتی", description: "بەرزترین کێوی ناوچەکە کە لە زستاندا بە سپییاتی بەفر دەپۆشرێت و لە هاویندا فێنکایی دەبەخشێتە گەشتیاران. شوێنێکی گونجاوە بۆ شاخەوانی و گەشتی زستانە.", imageQuery: "Gara Mountain Snow Duhok" },
      { name: "هاوینەهەواری ئینیشکێ", category: "سروشتی و گەشتیاری", description: "ئەشکەوتێکی گەورە و ئاوێکی زۆر سارد کە تێیدا ڕێستۆرانتێکی گەشتیاری بێوێنە دروستکراوە لە ناو دڵی کێودا، دیمەنێکی سروشتی و فێنکاییەکی بێوێنە بە گەشتیار دەبەخشێت.", imageQuery: "Inishke Cave Duhok Nature" }
    ]
  },
  'کەرکووک': {
    cityNarrative: "کەرکووک، شاری بابەگوڕگوڕ و پێکەوەژیانی نەتەوەکان، یەکێکە لە دەوڵەمەندترین و مێژووییترین شارەکانی ڕۆژهەڵاتی ناوەڕاست. ئەم شارە بە قەڵا مێژووییەکەی و سەرچاوە دەوڵەمەندەکانی نەوت ناسراوە. کەرکووک شارێکە کە مێژووی چەندین شارستانییەتی وەک سۆمەری، بابلی و ئاشووری لە باوەش گرتووە و هێمایەکی گەورەی خۆڕاگری و ڕەسەنایەتییە.",
    landmarks: [
      { name: "قەڵای کەرکووک", category: "مێژوویی و شوێنەواری", description: "قەڵایەکی مێژوویی دێرینە کە دەکەوێتە ناوەڕاستی شارەکە و مێژووەکەی بۆ زیاتر لە ٣ هەزار ساڵ دەگەڕێتەوە. ئەم قەڵایە خاوەن چەندین شوێنەواری وەک کەنیسە، مزگەوت و مەرقەدی پێغەمبەر دانیالە و هێمای شارستانییەتی شارەکەیە.", imageQuery: "Kirkuk Citadel Fortress History" },
      { name: "بابەگوڕگوڕ", category: "سروشتی و مێژوویی", description: "شوێنی ئاگرە هەمیشەییەکە کە چەندین هەزار ساڵە بەبێ وەستان دەسووتێت. ئەم دیاردە سروشتییە بەهۆی دزەکردنی غازی سروشتییەوەیە و لە مێژوودا وەک شوێنێکی پیرۆز و سەیری سەیر کراوە.", imageQuery: "Baba Gurgur Eternal Fire Kirkuk" },
      { name: "بازاڕی قەیسەری کەرکووک", category: "کولتووری و مێژوویی", description: "بازاڕێکی مێژوویی و ئاوەدانە کە دەکەوێتە بناری قەڵا. ئەم بازاڕە بە تەلارسازییە تایبەتەکەی و بنمیچە کەوانەییەکانی، ناوەندێکی سەرەکییە بۆ کڕین و فرۆشتنی کەلوپەلی ڕەسەن و کاری دەستی.", imageQuery: "Kirkuk Qaysari Market Bazaar" },
      { name: "کەنیسەی مریەمی عەزرا", category: "مێژوویی و ئایینی", description: "یەکێکە لە کۆنترین و جوانترین کەنیسەکانی شارەکە کە مێژووەکەی بۆ سەدان ساڵ بەر لە ئێستا دەگەڕێتەوە و هێمای پێکەوەژیانی ئایینی و نەتەوەییە لە شاری کەرکووک.", imageQuery: "Kirkuk Ancient Church Architecture" }
    ]
  },
  'هەڵەبجە': {
    cityNarrative: "هەڵەبجە، پایتەختی ئاشتی و سیمبولی قوربانی و خۆڕاگری. ئەم شارە کە دەکەوێتە داوێنی زنجیرە چیاکانی هەورامان، خاوەن سروشتێکی دڵڕفێن و مێژوویەکی پڕ لە سەروەرییە. هەڵەبجە نەک تەنها بە تراژیدیای کیمیابارانەکەی دەناسرێتەوە، بەڵکو مەڵبەندێکی گرنگی ئەدەب و عیرفان و سروشتی کوێستانییە کە هەموو گەشتیارێک سەرسام دەکات.",
    landmarks: [
      { name: "مۆنۆمێنتی هەڵەبجە", category: "مێژوویی و نیشتمانی", description: "یادگاری و گەواهیدەری قوربانیانی کارەساتی کیمیابارانی ساڵی ١٩٨٨ـە. مۆزەخانەکە وەسفی تراژیدیاکە و مێژووی شارەکە دەکات و هێمایەکی جیهانییە بۆ داواکردنی ئاشتی و دادپەروەری.", imageQuery: "Halabja Monument Peace Memorial" },
      { name: "هاوینەهەواری ئەحمەد ئاوا", category: "سروشتی و گەشتیاری", description: "یەکێکە لە جوانترین و پڕ ئاوترین ناوچەکانی کوردستان کە تێیدا تافەیەکی بەرز و سەرنجڕاکێش هەیە. سروشتی سەوز و ئاوی سارد و فێنک، ئەم شوێنەی کردووە بە قیبلەی گەشتیاران لە وەرزی هاویندا.", imageQuery: "Ahmed Awa Waterfall Kurdistan" },
      { name: "بیارە و تەوێڵە", category: "کولتووری و مێژوویی", description: "دوو شارۆچکەی دێرینی هەورامانن کە بە خانووە پلەپلەکان و تەلارسازییە بەردینەکەیان ناسراون. مەڵبەندێکی گرنگی عیرفان و خانەقا مێژووییەکانن و سروشتێکی بێوێنەیان هەیە.", imageQuery: "Byara Tawela Village Hawraman" },
      { name: "سەرچاوەی زەڵم", category: "سروشتی", description: "سەرچاوەیەکی ئاوی گەورە و سازگارە کە لە ناو دڵی چیاکانی هەورامانەوە هەڵدەقوڵێت. ئاوەکەی هێندە ساردە کە لە هاویندا هەست بە فێنکاییەکی زۆر دەکرێت و دەوروبەرەکەی پڕە لە باخی میوە.", imageQuery: "Zalm River Halabja Nature" }
    ]
  },
  'زاخۆ': {
    cityNarrative: "زاخۆ، شاری پردی دەلال و دەروازەی باکووری کوردستان. ئەم شارە مێژووییە لەسەر ڕووباری خابوور بونیاد نراوە و یەکێکە لە شارە هەرە دێرینەکانی ناوچەی بادینان. زاخۆ بە بازاڕە گەرمەکانی، میواندۆستی خەڵکەکەی، و سروشتە دەوڵەمەندەکەی دەناسرێتەوە کە تێیدا مێژوو و بازرگانی و سروشت پێکەوە تێکەڵ بوون.",
    landmarks: [
      { name: "پردی دەلال", category: "مێژوویی و شوێنەواری", description: "پردێکی بەردینی مێژووییە کە مێژووەکەی بۆ سەردەمی ڕۆمانییەکان یان عەباسییەکان دەگەڕێتەوە. بەرزییەکەی ١٦ مەترە و بەبێ بەکارهێنانی چیمەنتۆ و تەنها بە تاشەبەرد و قسڵ دروستکراوە. هێمای ناسنامەی شاری زاخۆیە.", imageQuery: "Delal Bridge Zakho Historical" },
      { name: "ڕووباری خابوور", category: "سروشتی", description: "ڕووبارێکی گەورە و پڕ ئاوە کە بە ناو جەرگەی شاری زاخۆدا دەڕوات. دیمەنێکی جوان و ژینگەییەکی فێنک بە شارەکە دەبەخشێت و کەنارەکانی کراون بە ناوچەی گەشتیاری و پشوودان.", imageQuery: "Khabur River Zakho Landscape" },
      { name: "تافەی شەرانێ", category: "سروشتی و گەشتیاری", description: "تافەیەکی دڵڕفێن لە ناوچەیەکی شاخاویدا لە نزیک زاخۆ. ئاوەکەی لە بناری چیاکانەوە دێت و شوێنێکی زۆر فێنک و ئارامە بۆ گەشتیاران کە دەیانەوێت لە جەنجاڵی شار دوور بکەونەوە.", imageQuery: "Sherane Waterfall Zakho Nature" }
    ]
  },
  'ئاکرێ': {
    cityNarrative: "ئاکرێ، پایتەختی نەورۆز و شاری خانووە پلەپلەکان. ئەم شارە بە یەکێک لە جوانترین و ناوازەترین شارەکانی کوردستان دادەنرێت بەهۆی ئەوەی لەسەر سێ چیای بەرز و بە شێوەی ستوونی دروستکراوە. ئاکرێ بە مەشخەڵە گەشەکانی لە شەوی نەورۆزدا ناوبانگی جیهانی پەیدا کردووە و مێژوویەکی دێرینی هەیە کە بۆ سەردەمی میرنشینە کوردییەکان دەگەڕێتەوە.",
    landmarks: [
      { name: "سێپا (تافەی ئاکرێ)", category: "سروشتی و گەشتیاری", description: "تافەیەکی بەرز و جوانە لە ناو دڵی شاردا کە دیمەنێکی بێوێنە دەبەخشێت. ئاوەکەی لە نێوان چیاکانەوە دێتە خوارەوە و دەوروبەرەکەی پڕە لە ڕێستۆرانت و شوێنی گەشتیاری.", imageQuery: "Sipa Waterfall Akre Nature" },
      { name: "قەڵای ئاکرێ", category: "مێژوویی", description: "شوێنەوارێکی مێژووییە کە لەسەر لووتکەی یەکێک لە چیاکانی شارەکە دروستکراوە. مێژووەکەی بۆ سەردەمی پێش زایین و دواتر میرنشینی بادینان دەگەڕێتەوە و دیمەنێکی پانۆرامای شارەکە پیشان دەدات.", imageQuery: "Acre Citadel Hill Kurdistan" },
      { name: "کێوی نەورۆز", category: "کولتووری", description: "ئەو کێوەیە کە هەموو ساڵێک هەزاران گەنج بە مەشخەڵی ئاگرەوە سەردەکەون بۆ پیرۆزکردنی جەژنی نەورۆز. دیمەنی ئاگری سەر کێوەکە لە شەودا یەکێکە لە جوانترین دیمەنە کولتوورییەکانی جیهان.", imageQuery: "Akre Nawroz Fire Celebration" }
    ]
  },
  'سۆران': {
    cityNarrative: "سۆران، دەروازەی چیا بەرزەکان و هاوینەهەوارە هەرە ناودارەکانی کوردستان. ئەم ناوچەیە کە دەکەوێتە باکووری هەولێر، بەرزترین لووتکە چیاکانی کوردستان و عێراقی تێدایە وەک هەڵگورد. سۆران مەڵبەندی تافە و گەلی و دۆڵە قووڵەکانە و لە هەموو وەرزەکاندا جوانییەکی تایبەتی هەیە، لە بەفری زستان تا سەوزی و فێنکایی هاوین.",
    landmarks: [
      { name: "گەلی عەلی بەگ", category: "سروشتی و مێژوویی", description: "ناودارترین تافەی کوردستانە کە درێژییەکەی نزیکەی ١٢ کیلۆمەترە لە نێوان دوو چیای بەرزدا. وێنەی ئەم تافەیە لەسەر دراوی عێراقی دانراوە و هێمایەکی گەورەی گەشتیارییە.", imageQuery: "Gali Ali Bag Waterfall Soran" },
      { name: "هاوینەهەواری بێخاڵ", category: "سروشتی", description: "تافەیەکی پان و پڕ ئاوە کە لە ناو دڵی بەردەکانەوە دێتە دەرەوە. بەهۆی ساردی ئاوەکەی و فێنکایی کەشەکەی، یەکێکە لە قەرەباڵغترین شوێنە گەشتیارییەکانی ناوچەکە لە وەرزی گەرمادا.", imageQuery: "Bekhal Waterfall Kurdistan Nature" },
      { name: "چیای کۆرەک", category: "گەشتیاری و کات بەسەربردن", description: "چیایەکی بەرزە کە تەلەفریکێکی مۆدێرنی تێدایە و گەشتیاران دەگەیەنێتە لووتکە. لەوێ هاوینەهەوارێکی پێشکەوتوو، یاریگای زستانە، و چێشتخانەی ناوازە هەن کە دیمەنێکی جیهانییان هەیە.", imageQuery: "Korek Mountain Resort Teleferic" },
      { name: "گەلی ڕەواندز", category: "سروشتی و سینەمایی", description: "دۆڵێکی قووڵ و بێوێنەیە کە ڕێگایەکی پێچاوپێچ و سەرنجڕاکێشی تێدایە. دیمەنەکان هێندە گەورە و قووڵن کە وەک تابلۆیەکی هونەری دەردەکەون و هەموو بینەرێک سەرسام دەکەن.", imageQuery: "Rawanduz Canyon Landscape" }
    ]
  },
  'گەرمیان': {
    cityNarrative: "گەرمیان، ناوچەی مێژووی دێرین و هێمای خۆڕاگری. ئەم ناوچەیە کە شارەکانی کەلار و کفری و چەمچەماڵ لەخۆ دەگرێت، خاوەن کەشوهەوایەکی گەرم و خەڵکێکی زۆر میواندۆستە. گەرمیان مێژوویەکی درێژی هەیە لە تێکۆشان و لانکەی چەندین میرنشین و هۆزی گەورەی کورد بووە و خاوەن چەندین قەڵا و شوێنەواری مێژوویی گرنگە.",
    landmarks: [
      { name: "قەڵای شێروانە", category: "مێژوویی و شوێنەواری", description: "قەڵایەکی جوان و ناوازەیە لە شاری کەلار کە مێژووەکەی بۆ سەردەمی محەمەد پاشای جاف (سەدەی ١٩) دەگەڕێتەوە. لەسەر گردێکی مێژوویی دروستکراوە و بە شێوازی بیناسازییە تایبەتەکەی و کتێبخانە و مۆزەخانە ناوخۆییەکەی ناسراوە.", imageQuery: "Sherwana Castle Kalar History" },
      { name: "ڕووباری سیروان", category: "سروشتی", description: "ڕووبارێکی گەورە و ستراتیژییە کە بە ناو دەشتی گەرمیاندا دەڕوات. دیمەنێکی سەوز و جوان بە ناوچەکە دەبەخشێت و سەرچاوەیەکی سەرەکی ژیان و کشتوکاڵە لە ناوچەکەدا.", imageQuery: "Sirwan River Kurdistan Landscape" },
      { name: "مۆنیومێنتی ئەنفال", category: "مێژوویی و نیشتمانی", description: "یادگاری قوربانیانی شاڵاوە دڕندانەکانی ئەنفالە لە چەمچەماڵ. شوێنێکە بۆ بەرزڕاگرتنی یادی شەهیدان و گێڕانەوەی مێژووی چەوسانەوەی گەلی کورد بۆ نەوەکانی داهاتوو.", imageQuery: "Anfal Monument Kurdistan Memorial" }
    ]
  },
  'ڕاپەڕین': {
    cityNarrative: "ڕاپەڕین، ناوچەی شۆڕش و ڕاپەڕینە مەزنەکەی ساڵی ١٩٩١. ئەم ناوچەیە کە شارەکانی ڕانیە و قەڵادزێ و دەوروبەری لەخۆ دەگرێت، خاوەن سروشتێکی زۆر دەوڵەمەندە بە دەریاچەی دوکان و دەشتی بیتوێن. ڕاپەڕین مەڵبەندی ئازایەتی و قوربانیدانە و هەمیشە لانکەی خەباتی ڕزگاریخوازی کورد بووە.",
    landmarks: [
      { name: "دەشتی بیتوێن", category: "سروشتی و کشتوکاڵی", description: "یەکێکە لە بەپیتترین و پان و پۆڕترین دەشتەکانی کوردستان کە بە سەوزی و دیمەنە جوانەکانی ناسراوە. لە وەرزی بەهاردا دەبێتە تابلۆیەکی ڕەنگاوڕەنگ و شوێنێکی زۆر گونجاوە بۆ گەشت و سەیران.", imageQuery: "Bitwen Plain Kurdistan Greenery" },
      { name: "کێوەڕەش", category: "سروشتی و گەشتیاری", description: "چیایەکی سەرنجڕاکێش لە ڕانیە کە دیمەنێکی پانۆرامای شار و دەریاچەی دوکان پیشان دەدات. شوێنێکی دڵخوازە بۆ شاخەوانان و ئەوانەی ئارەزووی بینینی دیمەنی سروشتی لە بەرزاییەوە دەکەن.", imageQuery: "Kewa Rash Mountain Rania" },
      { name: "دەربەندی ڕانیە", category: "سروشتی و گەشتیاری", description: "ناوچەیەکی گەشتیاری ئاوییە لەسەر زێی بچووک و نزیک دەریاچەی دوکان. بە ماسییە کێوییە بەتامەکانی و گەشتی بەلەم و دیمەنە شاخاوییەکان ناوبانگی دەرکردووە.", imageQuery: "Rania Darband Water Lake" }
    ]
  }
};

interface LandmarkExplorerProps {
  onCityChange?: (imageUrl: string) => void;
}

const LandmarkExplorer: React.FC<LandmarkExplorerProps> = ({ onCityChange }) => {
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]);
  const [cityNarrative, setCityNarrative] = useState('');
  const [landmarks, setLandmarks] = useState<ExtendedLandmark[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeBackground, setActiveBackground] = useState<string>(MASTER_ASSETS[REGIONS[0].id]);
  const [detailedLandmark, setDetailedLandmark] = useState<ExtendedLandmark | null>(null);
  
  const cache = useRef<Record<string, { cityNarrative: string, landmarks: ExtendedLandmark[] }>>({});

  const fetchLandmarks = async (regionLabel: string) => {
    const foundRegion = REGIONS.find(r => r.label === regionLabel);
    if (foundRegion) {
      setSelectedRegion(foundRegion);
      const cityImg = MASTER_ASSETS[foundRegion.id] || MASTER_ASSETS['Erbil'];
      setActiveBackground(cityImg);
      if (onCityChange) onCityChange(cityImg);
    }

    if (cache.current[regionLabel]) {
      setCityNarrative(cache.current[regionLabel].cityNarrative);
      setLandmarks(cache.current[regionLabel].landmarks);
      return;
    }

    if (STATIC_REGIONS_DATA[regionLabel]) {
      const data = STATIC_REGIONS_DATA[regionLabel];
      setCityNarrative(data.cityNarrative);
      setLandmarks(data.landmarks);
      cache.current[regionLabel] = data;
      return;
    }

    setLoading(true);
    try {
      const data = await getLandmarks(regionLabel);
      cache.current[regionLabel] = data;
      setCityNarrative(data.cityNarrative);
      setLandmarks(data.landmarks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLandmarks(selectedRegion.label);
  }, []);

  return (
    <div className="space-y-20 animate-in fade-in duration-700 pb-20" dir="rtl">
      {/* Region Selector */}
      <div className="flex flex-col items-center gap-8">
        <div className="flex flex-wrap justify-center gap-3 px-4 max-w-6xl">
          {REGIONS.map(region => (
            <button
              key={region.id}
              onClick={() => fetchLandmarks(region.label)}
              className={`px-8 py-4 rounded-[1.5rem] font-black text-xs whitespace-nowrap transition-all border ${
                selectedRegion.label === region.label 
                ? 'bg-yellow-500 text-black border-yellow-400 shadow-2xl scale-105' 
                : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
              } font-['Noto_Sans_Arabic']`}
            >
              {region.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Header */}
      <div className="relative h-[500px] lg:h-[750px] w-full rounded-[4rem] lg:rounded-[6rem] overflow-hidden border border-white/10 shadow-3xl group">
        <img 
          src={optimizeUrl(activeBackground, 1600)} 
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover brightness-[0.4] transition-transform duration-[3s] group-hover:scale-110" 
          alt={selectedRegion.label} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-10">
           <span className="text-yellow-500 font-black text-[10px] uppercase tracking-[0.8em] mb-6 font-['Noto_Sans_Arabic']">کوردستان دەگەڕێین</span>
           <h2 className="text-7xl lg:text-[12rem] font-black text-white font-['Noto_Sans_Arabic'] leading-none tracking-tighter drop-shadow-3xl">
             {selectedRegion.label}
           </h2>
           <p className="text-white/80 font-black text-lg lg:text-3xl mt-10 max-w-4xl font-['Noto_Sans_Arabic'] leading-relaxed">
             {selectedRegion.catchy}
           </p>
        </div>
      </div>

      {/* Narrative Section */}
      <div className="max-w-6xl mx-auto px-6">
        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-4 bg-white/5 rounded-full w-3/4"></div>
            <div className="h-4 bg-white/5 rounded-full w-full"></div>
            <div className="h-4 bg-white/5 rounded-full w-2/3"></div>
          </div>
        ) : cityNarrative && (
          <div className="p-16 lg:p-24 bg-white/[0.02] border border-white/[0.05] rounded-[5rem] shadow-2xl backdrop-blur-xl">
             <p className="text-slate-200 text-2xl lg:text-4xl leading-[2.4] font-medium font-['Noto_Sans_Arabic'] text-justify opacity-90 first-letter:text-6xl first-letter:text-yellow-500">
               {cityNarrative}
             </p>
          </div>
        )}
      </div>

      {/* Landmarks Grid */}
      <div className="space-y-20">
        <div className="text-center space-y-4">
           <h3 className="text-5xl lg:text-7xl font-black text-white font-['Noto_Sans_Arabic']">ناوچە گەشتیارییەکان</h3>
           <div className="h-1.5 w-32 bg-yellow-500 rounded-full mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12 px-6">
          {landmarks.map((landmark, idx) => (
            <LandmarkCard 
              key={idx} 
              landmark={landmark} 
              onClick={() => setDetailedLandmark(landmark)} 
            />
          ))}
        </div>
      </div>

      {/* Modal for Details */}
      {detailedLandmark && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500" onClick={() => setDetailedLandmark(null)}>
          <div className="relative w-full max-w-6xl bg-[#080808] border border-white/10 rounded-[5rem] overflow-hidden flex flex-col lg:flex-row h-full lg:h-[85vh] shadow-[0_0_100px_rgba(0,0,0,1)]" onClick={e => e.stopPropagation()}>
            <div className="lg:w-1/2 relative h-1/2 lg:h-full bg-black/40">
               <img src={optimizeUrl(detailedLandmark.directUrl || `https://images.unsplash.com/featured/?${encodeURIComponent(detailedLandmark.imageQuery)},nature,architecture`, 1200)} className="w-full h-full object-cover" alt={detailedLandmark.name} />
               <button onClick={() => setDetailedLandmark(null)} className="absolute top-10 left-10 w-16 h-16 bg-white text-black rounded-full font-black flex items-center justify-center shadow-2xl hover:bg-yellow-500 transition-colors z-20">✕</button>
            </div>
            <div className="lg:w-1/2 p-16 lg:p-24 overflow-y-auto text-right space-y-12">
              <div className="space-y-6">
                 <span className="text-yellow-500 font-black text-[11px] uppercase tracking-[0.5em]">{detailedLandmark.category}</span>
                 <h2 className="text-6xl lg:text-8xl font-black text-white font-['Noto_Sans_Arabic'] leading-tight">{detailedLandmark.name}</h2>
              </div>
              <div className="h-px w-full bg-white/10"></div>
              <p className="text-slate-300 text-2xl lg:text-4xl leading-relaxed font-medium font-['Noto_Sans_Arabic'] text-justify">
                {detailedLandmark.description}
              </p>
              <div className="pt-12">
                 <button onClick={() => setDetailedLandmark(null)} className="w-full py-8 bg-white/5 border border-white/10 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all font-['Noto_Sans_Arabic']">گەڕانەوە بۆ پێڕست</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default LandmarkExplorer;
