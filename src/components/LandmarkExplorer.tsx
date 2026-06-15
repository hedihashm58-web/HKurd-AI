import React, { useState } from 'react';

// داتاکەمان لێرە ڕێک دەخەین
const citiesData = {
  slemani: {
    name: "سلێمانی",
    description: "شاری هەڵم و قوربانی، بە پایتەختی ڕۆشنبیری ناسراوە.",
    image: "/slemani.jpg",
    neighborhoods: [
      { name: "سەرچنار", info: "ناوچەیەکی گەشتیاری و دڵگیرە ، دەکەوێتەڕۆژاوای شار جاران بەهۆی لکەمی کەرەستەی هاتووچۆوە و کەمی دانیشتوانی شار ، سەرچنار جیابوو لە بەشەکانی تری لێمانیئەزانرا لەکویوە بۆکوێ دەستپیک و کۆتاییەتی ، بەڵام ئەمڕۆ سەرچنار تێکەڵ بە شار بووە و لە دەوریا چەندین گەڕەکی تر درووست بوون وەک: شەهیدانی سەرچنار و گردی سەرچنار" },
      { name: "چوارباخ", info: "گەرەکی چوارباخ، ئەم گەرەکە کەوتۆتە پشت باڵاخانەکانی «سلێمانی پاڵاس و قەیوان تاوەر»ەوە، سەرووی گەرەکی سەرشەقام بەلای باکوری رۆژئاوایدا، گەڕەکێکی زۆر گەورە نییە. لەدوای ھەریەک لەم گەرەکانە بنیات نراوە: مەڵکەندی، کانی ئاسکان، گۆیژە، سابونکەران، دەرگەزێن، شێخان، جولەکان، سەرشەقام. ناوەکەشی لەوەوە ھاتووە، کە پێشتر لەساڵی «١٨٤٠»دا چوار باخی سەوزو ئاوداری لێبووە، کە پڕ بووە لە میوەھاتی ھەمەجۆرەی وەک: قەیسی، ھەنارو قۆخ، سێوو ھەرمێ و ترێ... کە ئەحمەد پاشای بابان دروستیکردوون، بەڵام دوای وێرانبوونی باخەکان شوێنەکانیان کران بە خانوو. ناونرا گەرەکی چوارباخ. یاخود زۆر رێی تێ ئەچێت و من ئەمەش بەراستتر ئەزانم کە ئەحمەد پاشای بابان وەک سەرسامی خۆی، بیرۆکەی دروستکردنی ئەم چوار باخ و گەڕەکەی لە چوارباخی شاری سنەوە وەرگرتبێت، چونکە لەشاری سنەی رۆژھەڵاتی کوردستانیش گەڕەکێک بەھەمان ناو ھەیە، کە یەکێکە لە کۆنترین گەڕەکەکانی شاری سنەو مێژووی بنیاتنانی لە مێژووی دروستبوونی گەڕەکی چوارباخی سلێمانی کۆنترەو دەگەڕێتەوە بۆ سەردەمانی حکومەتی قاجاڕ و حوکمڕانی خەسرەوخانی ئەردەڵان." },
      { name: " سەرشەقام", info: "گەڕەکی سەرشەقام یەکێکە لە گەڕەکە زۆر کۆن و دێرینەکانی سلێمانی ، کاتی خۆی کەوتۆتە بەشی خوارەوەی سلیمانی لە ئیستادا کەوتۆتە ناو جەرگەی شارەوە" },
      { name: "کارێزە وشک", info: "گەڕەکێکی گەورە و ئاوەدانە" },
      { name: "بەکرەجۆ", info: "دەروازەی ڕۆژئاوای شارەکەیە" },
      { name: "مەڵكەندی", info: "لەدوای هاتنی بابانییەكان لە قەڵاچوالانەوە بۆ سلێمانی ، گوندێكی بچووك هەبووە، ئەم گوندە جۆرربەردێكی زۆر پتەوی دەبێت بۆ دروستكردنی بینا ، خەڵكی ئەم گوندە بەپیاو و ژنەوە جۆرەدەفرێكی دەمكراوەیان دروست دەكرد لە قوڕێكی سور ومەیلەو زەردی پاك و بێژراو ، پاشان دەیانفرۆشت و بژێوی ژیانیان لەسەر ئەم كارەبوو ،پێیان دەوت مەركانە یان مەڵكەنی ، جالەسەر ئەم مەڵكەنییە نەخش و نیگاری جوانیان دروست دەكرد ، لەدوای هاتنی بابانییەكان و دروستكردنی شاری سلێمانی، قافڵەی بازرگانەكان بەتایبەت توركەكان ئەم دەفرە(مەڵكەنی) یان لەگەڵ خۆیان دەبردەوە بۆ ئەستەنبوڵ، ئیتر دەفری مەڵكەنی بەناوبانگ بوو ، كارگەیەكی بچووكیان دروستكرد بەناوی كارگەی مەڵكەنی و گوندەكەشیان كردە گەڕەك و ناویان نا مەڵكەنی، لەسەر هەندێ زار پێیان دەوت مەڵكەندی ، لەئێستادا كوپەڵە ی مەڵكەندی نەماوە بەڵام گەڕەكی مەڵكەندی وەك خۆی ماوە و سیمایەكی دێرینی بەخشیوە بە سلێمانی" }
    ]
  },
  hawler: {
    name: "هەولێر",
    description: "پایتەختی هەرێمی کوردستان، خاوەن قەڵایەکی مێژوویی دێرین.",
    image: "/hawler.jpg",
    neighborhoods: [
      { name: "عەنکاوە", info: "ناوچەیەکی نێودەوڵەتی و گەشتیاری" },
      { name: "ئیسکان", info: "لە گەڕەکە زیندووەکانی ناوەڕاستی شارە" },
      { name: "باداوە", info: "ناوچەیەکی فراوان و بازرگانی" }
    ]
  }
};

interface LandmarkExplorerProps {
  onCityChange: (url: string) => void;
}

const LandmarkExplorer: React.FC<LandmarkExplorerProps> = ({ onCityChange }) => {
  const [selectedCity, setSelectedCity] = useState<keyof typeof citiesData | null>(null);

  const handleCityClick = (cityKey: keyof typeof citiesData) => {
    setSelectedCity(cityKey);
    onCityChange(citiesData[cityKey].image);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto text-right" dir="rtl">
      {!selectedCity ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(citiesData).map(([key, city]) => (
            <button 
              key={key}
              onClick={() => handleCityClick(key as keyof typeof citiesData)}
              className="bg-slate-900/60 p-6 rounded-3xl border border-slate-700 hover:border-indigo-500 transition-all text-right group shadow-lg"
            >
              <h3 className="text-2xl font-black text-white mb-2">{city.name}</h3>
              <p className="text-slate-400 text-sm line-clamp-2">{city.description}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/80 p-6 md:p-8 rounded-3xl border border-slate-700 animate-in fade-in zoom-in duration-300">
          <button onClick={() => setSelectedCity(null)} className="text-indigo-400 mb-6 font-black flex items-center gap-2 hover:translate-x-2 transition-transform">
            ← گەڕانەوە بۆ شارەکان
          </button>
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <h2 className="text-4xl font-black text-white mb-4">{citiesData[selectedCity].name}</h2>
              <p className="text-slate-300 leading-relaxed text-lg">{citiesData[selectedCity].description}</p>
            </div>
            <img src={citiesData[selectedCity].image} alt={citiesData[selectedCity].name} className="w-full md:w-1/2 h-64 object-cover rounded-2xl shadow-2xl" />
          </div>
          
          <div className="mt-10">
            <h4 className="text-white font-black text-xl mb-6 border-r-4 border-indigo-500 pr-4">گەڕەکەکانی شار</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {citiesData[selectedCity].neighborhoods.map((n, i) => (
                <div key={i} className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 hover:bg-slate-700 transition-all">
                  <h5 className="text-indigo-400 font-bold mb-1">{n.name}</h5>
                  <p className="text-slate-500 text-xs">{n.info}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandmarkExplorer;