import React, { useState } from 'react';

// ١. داتابەیسی پڕۆژە نیشتەجێبوونەکان (دەتوانیت دواتر پڕۆژەی تریش لێرە زیاد بکەیت)
const housingData = [
  {
    id: 1,
    name: 'کۆمەڵگەی نیشتەجێبوونی شاری پزیشکان',
    city: 'sulaymaniyah',
    location: 'سلێمانی - ڕێگەی سەرەکی ڕاپەڕین',
    price: 'دەستپێدەکات لە $65,000 تا $140,000 (بەپێی ڕووبەر)',
    installments: 'پێشەکی ٢٠٪ - مابقیەکەی بە قیستی درێژخایەنی مانگانە (٥ بۆ ١٠ ساڵ)',
    services: ['حەوزی مەلەوانی و جیم', 'سیستەمی غازی مەرکەزی', 'پاسەوانی ٢٤ کاتژمێر', 'باخچە و قوتابخانە'],
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=600&auto=format&fit=crop',
    phone: '07701234567',
    whatsapp: '9647701234567'
  },
  {
    id: 2,
    name: 'ئیمپایەر وۆڕڵد (Empire World)',
    city: 'erbil',
    location: 'هەولێر - شەقامی ١٠٠ مەتری',
    price: 'دەستپێدەکات لە $120,000 تا $350,000',
    installments: '٣٠٪ پێشەکی - قیستی گونجاو لەگەڵ قۆناغەکانی تەواوبوونی پڕۆژەکە',
    services: ['سیستەمی ساردکردنەوەی مەرکەزی', 'کۆمەڵگەی بازرگانی', 'حەوز و یانەی وەرزشی', 'کارەبای بەردەوام ٢٤ کاتژمێر'],
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600&auto=format&fit=crop',
    phone: '07501234567',
    whatsapp: '9647501234567'
  },
  {
    id: 3,
    name: 'کۆمەڵگەی نیشتەجێبوونی قەیوان سیتی',
    city: 'sulaymaniyah',
    location: 'سلێمانی - ناوچەی قەیوان',
    price: 'دەستپێدەکات لە $70,000 تا $160,000',
    installments: 'قیستی مانگانەی گونجاو لە دوای وەرگرتنی کلیل',
    services: ['قوتابخانەی نێودەوڵەتی', 'مارکێت و سێنتەری بازرگانی', 'سیستەمی پێشکەوتووی ئاوەڕۆ', 'باخچەی گەورە'],
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop',
    phone: '07709876543',
    whatsapp: '9647709876543'
  },
  {
    id: 4,
    name: 'دریم سیتی (Dream City)',
    city: 'erbil',
    location: 'هەولێر - نزیک فڕۆکەخانە',
    price: 'دەستپێدەکات لە $150,000 تا $500,000 (ڤێلا و شوقە)',
    installments: 'نەختینە (کاش) یان بە پێشەکی بەرز و قیستی کورتخایەن',
    services: ['کوالێتی یەکجار بەرزی بیناسازی', 'کامێرای چاودێری هەمیشەیی', 'ناوەندی تەندروستی تایبەت', 'قوتابخانە و دایەنگە'],
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=600&auto=format&fit=crop',
    phone: '07509876543',
    whatsapp: '9647509876543'
  }
];

const VideoStudio: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<typeof housingData[0] | null>(null);

  // فلتەرکردنی پڕۆژەکان بەپێی شار
  const filteredProjects = housingData.filter(project => {
    return selectedCity === 'all' || project.city === selectedCity;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20" dir="rtl">
      
      {/* ئەگەر هیچ پڕۆژەیەک دیاری نەکرا بوو، لیستی گشتی پیشان بدە */}
      {!selectedProject ? (
        <>
          {/* Header */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl lg:text-6xl font-black text-white font-['Noto_Sans_Arabic']">پڕۆژەکانی <span className="text-yellow-500">نیشتەجێبوون</span></h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] font-['Noto_Sans_Arabic']">ڕێبەری گشتی نرخ، قیست و خزمەتگوزاری کۆمەڵگە نیشتەجێبووەکانی کوردستان</p>
          </div>

          {/* دوگمەکانی فلتەری شار */}
          <div className="flex justify-center gap-3 max-w-md mx-auto bg-slate-950/40 p-1.5 rounded-2xl border border-slate-800/80">
            <button 
              onClick={() => setSelectedCity('all')}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${selectedCity === 'all' ? 'bg-yellow-500 text-black shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              هەمووی
            </button>
            <button 
              onClick={() => setSelectedCity('erbil')}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${selectedCity === 'erbil' ? 'bg-yellow-500 text-black shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              🏰 هەولێر
            </button>
            <button 
              onClick={() => setSelectedCity('sulaymaniyah')}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${selectedCity === 'sulaymaniyah' ? 'bg-yellow-500 text-black shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              🌲 سلێمانی
            </button>
          </div>

          {/* ڕیزکردنی پڕۆژەکان لە شاشەکەدا */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div 
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-[#050507] hover:border-yellow-500/50 cursor-pointer flex flex-col transition-all duration-300 shadow-xl"
              >
                {/* وێنەی پڕۆژەکە */}
                <div className="h-56 w-full overflow-hidden relative">
                  <img src={project.image} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-yellow-500 border border-yellow-500/20">
                    {project.city === 'erbil' ? 'هەولێر' : 'سلێمانی'}
                  </div>
                </div>

                {/* ناوەڕۆکی کارتەکە */}
                <div className="p-6 flex-1 flex flex-col justify-between text-right">
                  <div>
                    <h3 className="text-lg font-black text-white mb-2 group-hover:text-yellow-500 transition-colors">{project.name}</h3>
                    <p className="text-slate-400 text-xs mb-4 flex items-center gap-1.5 justify-start">
                      <span>📍</span> {project.location}
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-yellow-500 text-xs font-bold">بینینی زانیاری تەواو ←</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* لاپەڕەی ناوەوەی پڕۆژەکە (کاتێک کلیک لەسەر پڕۆژەیەک دەکرێت) */
        <div className="flex-1 flex flex-col bg-[#050507] rounded-[3rem] border border-slate-800 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
          
          {/* بەشی سەرەوەی پۆپئەپەکە */}
          <div className="p-6 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center gap-4">
            <div className="flex flex-col text-right">
              <h2 className="text-xl sm:text-2xl font-black text-white">{selectedProject.name}</h2>
              <span className="text-slate-400 text-xs mt-1">📍 {selectedProject.location}</span>
            </div>
            <button 
              onClick={() => setSelectedProject(null)}
              className="w-10 h-10 bg-slate-800 hover:bg-yellow-500 hover:text-black text-white rounded-xl flex items-center justify-center border border-slate-700 transition-all shrink-0 font-bold"
            >
              ✕
            </button>
          </div>

          {/* بەشی زانیارییەکان */}
          <div className="p-6 sm:p-10 flex flex-col lg:flex-row gap-8 items-start">
            {/* وێنەی گەورە لە لای ڕاست */}
            <div className="w-full lg:w-[450px] aspect-video sm:aspect-square shrink-0 rounded-2xl overflow-hidden border border-slate-800 shadow-md">
              <img src={selectedProject.image} alt={selectedProject.name} className="w-full h-full object-cover" />
            </div>

            {/* زانیاری کورت و درێژ لە لای چەپ */}
            <div className="flex-1 text-right w-full space-y-6">
              
              {/* نرخ */}
              <div className="bg-white/[0.01] p-5 rounded-2xl border border-white/5 space-y-2">
                <h4 className="text-yellow-500 font-black text-sm">💰 نرخەکانی کڕین:</h4>
                <p className="text-slate-200 text-sm md:text-base leading-relaxed">{selectedProject.price}</p>
              </div>

              {/* قیست */}
              <div className="bg-white/[0.01] p-5 rounded-2xl border border-white/5 space-y-2">
                <h4 className="text-yellow-500 font-black text-sm">📅 شێوازی قیستەکان:</h4>
                <p className="text-slate-200 text-sm md:text-base leading-relaxed">{selectedProject.installments}</p>
              </div>

              {/* خزمەتگوزارییەکان */}
              <div className="bg-white/[0.01] p-5 rounded-2xl border border-white/5 space-y-3">
                <h4 className="text-yellow-500 font-black text-sm">✨ خزمەتگوزارییەکانی کۆمەڵگەکە:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 text-sm">
                  {selectedProject.services.map((service, index) => (
                    <div key={index} className="flex items-center gap-2 justify-start">
                      <span className="text-yellow-500">✓</span>
                      <span>{service}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* بەشی دوگمەکانی پەیوەندی لە خوارەوە */}
          <div className="p-6 border-t border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row gap-4 justify-between items-center">
            
            {/* دوگمەکانی پەیوەندی ڕاستەوخۆ */}
            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              {/* دوگمەی تەلەفۆن */}
              <a 
                href={`tel:${selectedProject.phone}`}
                className="flex-1 sm:flex-none px-6 py-3 bg-white text-black font-black text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-500 transition-all shadow-md"
              >
                📞 تەلەفۆن بکە
              </a>
              {/* دوگمەی وەتسئەپ */}
              <a 
                href={`https://wa.me/${selectedProject.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-6 py-3 bg-emerald-600 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-md"
              >
                💬 نامەی وەتسئەپ
              </a>
            </div>

            {/* دوگمەی گەڕانەوە */}
            <button 
              onClick={() => setSelectedProject(null)}
              className="w-full sm:w-auto px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-all border border-slate-700"
            >
              گەڕانەوە بۆ پێڕست
            </button>
            
          </div>
        </div>
      )}

    </div>
  );
};

export default VideoStudio;