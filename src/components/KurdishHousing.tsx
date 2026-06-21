import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, getDocs, query, doc, updateDoc, deleteDoc } from 'firebase/firestore';

interface HousingProject {
  id?: string;
  name: string;
  city: string;
  location: string;
  coverImage: string;
  mapLink?: string; 
  phone: string;
  whatsapp: string;
  services: string[];
  units: {
    type: string;
    zone?: string;
    price: string;
    installments: string;
    details: string;
    unitImages: string[];
  }[];
}

const KurdishHousing: React.FC = () => {
  const [projects, setProjects] = useState<HousingProject[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<HousingProject | null>(null);
  const [activeUnitIndex, setActiveUnitIndex] = useState<number>(-1);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  // 👑 ناسنامەی ئەدمین
  const isAdmin = auth.currentUser?.email === 'hedikurdaipro@admin.com';
  const [showAdminPanel, setShowAdminPanel] = useState<boolean>(false);
  
  // 📝 دۆخی دەستکاریکردن
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // 🔘 تابی فۆرمی ئەدمین (0 بۆ شوقە، 1 بۆ ڤێلا)
  const [adminFormTab, setAdminFormTab] = useState<number>(0);

  // 📝 Gۆڕاوەکانی فۆرمی ئەدمین
  const [newName, setNewName] = useState('');
  const [newCity, setNewCity] = useState('erbil');
  const [newLocation, setNewLocation] = useState('');
  const [newMapLink, setNewMapLink] = useState(''); 
  const [newPhone, setNewPhone] = useState('');
  const [newWhatsapp, setNewWhatsapp] = useState('');
  const [servicesStr, setServicesStr] = useState('');
  
  // 📸 وێنە بارکراوەکان
  const [singleCoverImage, setSingleCoverImage] = useState<string>('');
  const [aptImages, setAptImages] = useState<string[]>([]);
  const [villaImages, setVillaImages] = useState<string[]>([]);

  // زانیاری شوقە
  const [aptZone, setAptZone] = useState('');
  const [aptPrice, setAptPrice] = useState('');
  const [aptInstallments, setAptInstallments] = useState('');
  const [aptDetails, setAptDetails] = useState('');

  // زانیاری ڤێلا
  const [villaZone, setVillaZone] = useState('');
  const [villaPrice, setVillaPrice] = useState('');
  const [villaInstallments, setVillaInstallments] = useState('');
  const [villaDetails, setVillaDetails] = useState('');

  // 👑 گۆڕاوەکانی فۆرمی کڕین (Leads Form) بۆ کڕیاران
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientNote, setClientPhoneNote] = useState('');
  const [submittingLead, setSubmittingLead] = useState<boolean>(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoadingData(true);
    try {
      const q = query(collection(db, 'housing_projects'));
      const querySnapshot = await getDocs(q);
      const loaded: HousingProject[] = [];
      querySnapshot.forEach((doc) => {
        loaded.push({ id: doc.id, ...doc.data() } as HousingProject);
      });
      setProjects(loaded);
    } catch (e) {
      console.error("هەڵە لە هێنانەوەی داتا:", e);
    } finally {
      setLoadingData(false);
    }
  };

  const handleMultipleFiles = (e: React.ChangeEvent<HTMLInputElement>, setImages: React.Dispatch<React.SetStateAction<string[]>>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const base64Promises = fileArray.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.readAsDataURL(file);
        });
      });
      Promise.all(base64Promises).then((results) => {
        setImages((prev) => [...prev, ...results].slice(0, 5));
      });
    }
  };

  const handleSingleFile = (e: React.ChangeEvent<HTMLInputElement>, setImage: React.Dispatch<React.SetStateAction<string>>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeUploadedImage = (indexToRemove: number, setImages: React.Dispatch<React.SetStateAction<string[]>>) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const formatGoogleMapLink = (input: string) => {
    let cleanLink = input.trim();
    if (cleanLink.includes('src=')) {
      const match = cleanLink.match(/src="([^"]+)"/);
      cleanLink = match ? match[1] : cleanLink;
    }
    if (cleanLink.includes('google.com/maps') && !cleanLink.includes('embed')) {
      cleanLink = cleanLink.replace('/maps/place/', '/maps/embed/v1/place?q=');
    }
    return cleanLink;
  };

  const startEditing = (project: HousingProject) => {
    if (!project.id) return;
    setEditingProjectId(project.id);
    setNewName(project.name);
    setNewCity(project.city);
    setNewLocation(project.location);
    setNewMapLink(project.mapLink || '');
    setNewPhone(project.phone);
    setNewWhatsapp(project.whatsapp);
    setServicesStr(project.services.join(', '));
    setSingleCoverImage(project.coverImage);

    const apt = project.units.find(u => u.type.includes('شوقە'));
    const villa = project.units.find(u => u.type.includes('ڤێلا'));

    if (apt) {
      setAptZone(apt.zone || '');
      setAptPrice(apt.price); setAptInstallments(apt.installments); setAptDetails(apt.details); setAptImages(apt.unitImages);
    } else {
      setAptZone(''); setAptPrice(''); setAptInstallments(''); setAptDetails(''); setAptImages([]);
    }

    if (villa) {
      setVillaZone(villa.zone || '');
      setVillaPrice(villa.price); setVillaInstallments(villa.installments); setVillaDetails(villa.details); setVillaImages(villa.unitImages);
    } else {
      setVillaZone(''); setVillaPrice(''); setVillaInstallments(''); setVillaDetails(''); setVillaImages([]);
    }

    setShowAdminPanel(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProject = async (projectId: string | undefined) => {
    if (!projectId) return;
    const confirmDelete = window.confirm("⚠️ دڵنیای لە سڕینەوەی تەواوەتی ئەم پڕۆژەیە؟");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'housing_projects', projectId));
      alert("🗑️ پڕۆژەکە بە سەرکەوتوویی سڕایەوە!");
      setSelectedProject(null);
      fetchProjects();
    } catch (err) {
      alert("هەڵەیەک ڕوویدا لە کاتی سڕینەوەدا");
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newLocation) return alert("تکایە ناو و ناونیشانی گشتی پڕبکەرەوە");
    if (!singleCoverImage) return alert("تکایە وێنەی کەڤەر بار بکە");

    const unitsList = [];
    if (aptPrice || aptDetails || aptImages.length > 0) {
      unitsList.push({
        type: 'شوقەکان (Apartments)', zone: aptZone, price: aptPrice, installments: aptInstallments, details: aptDetails, unitImages: aptImages
      });
    }
    if (villaPrice || villaDetails || villaImages.length > 0) {
      unitsList.push({
        type: 'ڤێلاکان (Villas)', zone: villaZone, price: villaPrice, installments: villaInstallments, details: villaDetails, unitImages: villaImages
      });
    }

    if (unitsList.length === 0) return alert("تکایە زانیاری لانی کەم یەکەیەک پڕبکەرەوە");

    const projectData: HousingProject = {
      name: newName,
      city: newCity,
      location: newLocation,
      mapLink: formatGoogleMapLink(newMapLink), 
      phone: newPhone,
      whatsapp: newWhatsapp,
      coverImage: singleCoverImage,
      services: servicesStr.split(',').map(s => s.trim()).filter(s => s !== ''),
      units: unitsList
    };

    try {
      if (editingProjectId) {
        await updateDoc(doc(db, 'housing_projects', editingProjectId), projectData as any);
        alert("🎉 زانیارییەکانی پڕۆژەکە نوێکرانەوە!");
      } else {
        await addDoc(collection(db, 'housing_projects'), projectData);
        alert("🎉 پڕۆژە نوێیەکە بڵاوکرایەوە!");
      }

      setShowAdminPanel(false);
      setEditingProjectId(null);
      setNewName(''); setNewLocation(''); setNewMapLink(''); setNewPhone(''); setNewWhatsapp(''); setServicesStr('');
      setSingleCoverImage(''); setAptImages([]); setVillaImages([]);
      setAptZone(''); setAptPrice(''); setAptInstallments(''); setAptDetails('');
      setVillaZone(''); setVillaPrice(''); setVillaInstallments(''); setVillaDetails('');
      setSelectedProject(null);
      
      fetchProjects();
    } catch (err) {
      alert("هەڵەیەک ڕوویدا لە کاتی پاشکەوتکردندا");
    }
  };

  const handleClientSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) return alert("تکایە ناو و ژمارەی مۆبایلەکەت بنووسە");
    if (!selectedProject) return;

    setSubmittingLead(true);
    try {
      await addDoc(collection(db, 'housing_leads'), {
        projectName: selectedProject.name,
        clientName: clientName,
        clientPhone: clientPhone,
        clientNote: clientNote,
        timestamp: new Date().toISOString()
      });
      alert(`🎉 کاک ${clientName} گیان، داواکارییەکەت نێردرا بۆ ڕوانین! بەم زووانە پەیوەندیت پێوە دەکەین.`);
      setClientName(''); setClientPhone(''); setClientPhoneNote('');
    } catch (err) {
      alert("کێشەیەک ڕوویدا لە ناردنی داواکارییەکەدا");
    } finally {
      setSubmittingLead(false);
    }
  };

  const filteredProjects = projects.filter(project => selectedCity === 'all' || project.city === selectedCity);

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20 px-2 sm:px-4" dir="rtl">
      
      {/* دوگمەی ئەدمین */}
      {isAdmin && (
        <div className="flex justify-center">
          <button 
            onClick={() => { setShowAdminPanel(!showAdminPanel); if(showAdminPanel) { setEditingProjectId(null); } }} 
            className="px-6 py-3 bg-indigo-600 text-white font-black rounded-xl text-xs shadow-md border border-indigo-500 transition-all"
          >
            {showAdminPanel ? '⚙️ داخستنی پانێڵ' : '➕ داخڵکردنی پڕۆژە و وێنە بە مۆبایل'}
          </button>
        </div>
      )}

      {/* ⚙️ فۆرمی ئەدمین */}
      {showAdminPanel && isAdmin && (
        <form onSubmit={handleSaveProject} className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-5 max-w-2xl mx-auto text-right animate-in slide-in-from-top-4">
          <h3 className="text-yellow-500 font-black text-sm border-b border-slate-800 pb-2">
            {editingProjectId ? '📝 دەستکاریکردنی زانیارییەکانی پڕۆژە' : '🏢 زانیارییە گشتییەکانی پڕۆژە'}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="ناوی پڕۆژە" value={newName} onChange={e=>setNewName(e.target.value)} className="p-3 rounded-xl bg-black text-white text-sm border border-slate-800 focus:outline-none" />
            <select value={newCity} onChange={e=>setNewCity(e.target.value)} className="p-3 rounded-xl bg-black text-white text-sm border border-slate-800 focus:outline-none">
              <option value="erbil">هەولێر</option>
              <option value="sulaymaniyah">سلێمانی</option>
              <option value="duhok">دهۆک</option>
            </select>
            <input type="text" placeholder="ناونیشانی ورد" value={newLocation} onChange={e=>setNewLocation(e.target.value)} className="p-3 rounded-xl bg-black text-white text-sm border border-slate-800" />
            <input type="text" placeholder="کۆد یان لینکی Google Maps" value={newMapLink} onChange={e=>setNewMapLink(e.target.value)} className="p-3 rounded-xl bg-black text-white text-sm border border-slate-800" />
            <input type="text" placeholder="ژمارەی تەلەفۆن" value={newPhone} onChange={e=>setNewPhone(e.target.value)} className="p-3 rounded-xl bg-black text-white text-sm border border-slate-800" />
            <input type="text" placeholder="ژمارەی وەتسئەپ" value={newWhatsapp} onChange={e=>setNewWhatsapp(e.target.value)} className="p-3 rounded-xl bg-black text-white text-sm border border-slate-800" />
            <input type="text" placeholder="خزمەتگوزارییەکان (بە کۆما)" value={servicesStr} onChange={e=>setServicesStr(e.target.value)} className="p-3 rounded-xl bg-black text-white text-sm border border-slate-800" />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 block">🖼️ بارکردنی وێنەی کەڤەر:</label>
            <input type="file" accept="image/*" onChange={(e) => handleSingleFile(e, setSingleCoverImage)} className="text-xs text-slate-400 block w-full file:py-2 file:px-4 file:rounded-full file:bg-yellow-500 cursor-pointer" />
            {singleCoverImage && (
              <div className="relative w-24 h-16 mt-1 group overflow-hidden rounded-lg border border-slate-700">
                <img src={singleCoverImage} className="w-full h-full object-cover" alt="Preview" />
                <button type="button" onClick={() => setSingleCoverImage('')} className="absolute inset-0 bg-black/60 flex items-center justify-center text-red-500 text-xs font-black opacity-0 group-hover:opacity-100 transition-opacity">لابردن ✕</button>
              </div>
            )}
          </div>

          <div className="space-y-2 border-t border-slate-800/60 pt-4">
            <div className="flex gap-2 bg-black p-1 rounded-xl border border-slate-800">
              <button type="button" onClick={() => setAdminFormTab(0)} className={`flex-1 py-2.5 text-xs font-black rounded-lg transition-all ${adminFormTab === 0 ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>🏢 شوقەکان</button>
              <button type="button" onClick={() => setAdminFormTab(1)} className={`flex-1 py-2.5 text-xs font-black rounded-lg transition-all ${adminFormTab === 1 ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>🏡 ڤێلاکان</button>
            </div>
          </div>

          {adminFormTab === 0 && (
            <div className="p-4 bg-indigo-950/20 border border-indigo-500/10 rounded-2xl space-y-4">
              <h4 className="text-indigo-400 font-black text-xs">زانیاری شوقەکان:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="زۆنی شوقەکان (بۆ نموونە: زۆنی A)" value={aptZone} onChange={e=>setAptZone(e.target.value)} className="p-3 rounded-xl bg-black text-white text-xs border border-slate-800 sm:col-span-2" />
                <input type="text" placeholder="نرخ" value={aptPrice} onChange={e=>setAptPrice(e.target.value)} className="p-3 rounded-xl bg-black text-white text-xs border border-slate-800" />
                <input type="text" placeholder="قیست" value={aptInstallments} onChange={e=>setAptInstallments(e.target.value)} className="p-3 rounded-xl bg-black text-white text-xs border border-slate-800" />
                <input type="text" placeholder="وەسف" value={aptDetails} onChange={e=>setAptDetails(e.target.value)} className="p-3 rounded-xl bg-black text-white text-xs border border-slate-800" />
                <div className="space-y-1">
                  <input type="file" multiple accept="image/*" onChange={(e) => handleMultipleFiles(e, setAptImages)} className="text-xs text-slate-400 file:py-1.5 cursor-pointer" />
                  <div className="flex gap-1.5 flex-wrap pt-1">
                    {aptImages.map((img, i) => (
                      <div key={i} className="relative w-10 h-10 group overflow-hidden rounded-md border border-slate-800">
                        <img src={img} className="w-full h-full object-cover" alt="Preview" />
                        <button type="button" onClick={() => removeUploadedImage(i, setAptImages)} className="absolute inset-0 bg-black/80 flex items-center justify-center text-[10px] text-red-500 font-black opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {adminFormTab === 1 && (
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/10 rounded-2xl space-y-4">
              <h4 className="text-emerald-400 font-black text-xs">زانیاری ڤێلاکان:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="زۆنی ڤێلاکان (بۆ نموونە: زۆنی شاهانە)" value={villaZone} onChange={e=>setVillaZone(e.target.value)} className="p-3 rounded-xl bg-black text-white text-xs border border-slate-800 sm:col-span-2" />
                <input type="text" placeholder="نرخ" value={villaPrice} onChange={e=>setVillaPrice(e.target.value)} className="p-3 rounded-xl bg-black text-white text-xs border border-slate-800" />
                <input type="text" placeholder="قیست" value={villaInstallments} onChange={e=>setVillaInstallments(e.target.value)} className="p-3 rounded-xl bg-black text-white text-xs border border-slate-800" />
                <input type="text" placeholder="وەسف" value={villaDetails} onChange={e=>setVillaDetails(e.target.value)} className="p-3 rounded-xl bg-black text-white text-xs border border-slate-800" />
                <div className="space-y-1">
                  <input type="file" multiple accept="image/*" onChange={(e) => handleMultipleFiles(e, setVillaImages)} className="text-xs text-slate-400 file:py-1.5 cursor-pointer" />
                  <div className="flex gap-1.5 flex-wrap pt-1">
                    {villaImages.map((img, i) => (
                      <div key={i} className="relative w-10 h-10 group overflow-hidden rounded-md border border-slate-800">
                        <img src={img} className="w-full h-full object-cover" alt="Preview" />
                        <button type="button" onClick={() => removeUploadedImage(i, setVillaImages)} className="absolute inset-0 bg-black/80 flex items-center justify-center text-[10px] text-red-500 font-black opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="w-full py-4 bg-yellow-500 text-black font-black text-sm rounded-xl shadow-lg mt-4">
            {editingProjectId ? '🔄 نوێکردنەوەی پڕۆژە' : '🚀 بڵاوکردنەوەی گشتی'}
          </button>
        </form>
      )}

      {/* پێڕستی گشتی پڕۆژەکان */}
      {!selectedProject ? (
        <>
          <div className="text-center space-y-4">
            <h2 className="text-4xl lg:text-6xl font-black text-white">پڕۆژەکانی <span className="text-yellow-500">نیشتەجێبوون</span></h2>
            <p className="text-slate-500 font-bold tracking-widest text-[10px]">ڕێبەری گشتی نرخ و قیستەکانی کوردستان</p>
          </div>

          <div className="flex justify-center gap-2 max-w-lg mx-auto bg-slate-950/40 p-1.5 rounded-2xl border border-slate-800">
            <button onClick={() => setSelectedCity('all')} className={`flex-1 py-2.5 text-xs font-bold rounded-xl ${selectedCity === 'all' ? 'bg-yellow-500 text-black shadow-md' : 'text-slate-400'}`}>هەمووی</button>
            <button onClick={() => setSelectedCity('erbil')} className={`flex-1 py-2.5 text-xs font-bold rounded-xl ${selectedCity === 'erbil' ? 'bg-yellow-500 text-black shadow-md' : 'text-slate-400'}`}>🏰 هەولێر</button>
            <button onClick={() => setSelectedCity('sulaymaniyah')} className={`flex-1 py-2.5 text-xs font-bold rounded-xl ${selectedCity === 'sulaymaniyah' ? 'bg-yellow-500 text-black shadow-md' : 'text-slate-400'}`}>🌲 سلێمانی</button>
            <button onClick={() => setSelectedCity('duhok')} className={`flex-1 py-2.5 text-xs font-bold rounded-xl ${selectedCity === 'duhok' ? 'bg-yellow-500 text-black shadow-md' : 'text-slate-400'}`}>🍇 دهۆک</button>
          </div>

          {loadingData ? (
            <div className="text-center text-slate-500 text-xs animate-pulse">خەریکی هێنانەوەی پڕۆژەکان...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, idx) => (
                <div key={idx} onClick={() => { setSelectedProject(project); setActiveUnitIndex(-1); setCurrentImageIndex(0); }} className="group rounded-3xl border border-slate-800 bg-[#050507] hover:border-yellow-500/50 cursor-pointer flex flex-col overflow-hidden transition-all duration-300">
                  <div className="h-52 w-full overflow-hidden relative">
                    <img src={project.coverImage || 'https://via.placeholder.com/600'} alt={project.name} className="w-full h-full object-cover" />
                    <div className="absolute top-4 right-4 bg-black/60 px-3 py-1 rounded-full text-[10px] font-bold text-yellow-500 border border-yellow-500/20">
                      {project.city === 'erbil' ? 'هەولێر' : project.city === 'sulaymaniyah' ? 'سلێمانی' : 'دهۆک'}
                    </div>
                  </div>
                  <div className="p-6 text-right">
                    <h3 className="text-lg font-black text-white mb-2">{project.name}</h3>
                    <p className="text-slate-400 text-xs mb-4">📍 {project.location}</p>
                    <span className="text-yellow-500 text-xs font-bold">بینینی زانیاری تەواو ←</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* لاپەڕەی ناوەوەی پڕۆژەکە */
        <div className="flex-1 flex flex-col bg-[#050507] rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="p-6 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
            <div className="flex flex-col text-right">
              <h2 className="text-xl sm:text-2xl font-black text-white">{selectedProject.name}</h2>
              <span className="text-slate-400 text-xs mt-1">📍 {selectedProject.location}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {isAdmin && (
                <>
                  <button onClick={() => startEditing(selectedProject)} className="px-3.5 py-2 bg-indigo-600 text-white font-black text-xs rounded-xl transition-all">📝 دەستکاری</button>
                  <button onClick={() => handleDeleteProject(selectedProject.id)} className="px-3.5 py-2 bg-red-600 text-white font-black text-xs rounded-xl transition-all">🗑️ سڕینەوە</button>
                </>
              )}
              <button onClick={() => setSelectedProject(null)} className="w-10 h-10 bg-slate-800 hover:bg-yellow-500 text-white rounded-xl flex items-center justify-center font-bold">✕</button>
            </div>
          </div>

          <div className="p-5 sm:p-10 flex flex-col lg:flex-row gap-8 items-start border-b border-slate-900">
            <div className="w-full lg:w-[400px] aspect-video sm:aspect-square shrink-0 rounded-2xl overflow-hidden border border-slate-800 relative bg-black select-none">
              <img src={activeUnitIndex === -1 ? selectedProject.coverImage : (selectedProject.units[activeUnitIndex]?.unitImages[currentImageIndex] || 'https://via.placeholder.com/600')} alt="Gallery" className="w-full h-full object-cover" />
              
              {activeUnitIndex !== -1 && selectedProject.units[activeUnitIndex]?.unitImages.length > 1 && (
                <>
                  <button onClick={() => setCurrentImageIndex((prev) => (prev - 1 + selectedProject.units[activeUnitIndex].unitImages.length) % selectedProject.units[activeUnitIndex].unitImages.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center font-bold">‹</button>
                  <button onClick={() => setCurrentImageIndex((prev) => (prev + 1) % selectedProject.units[activeUnitIndex].unitImages.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center font-bold">›</button>
                </>
              )}
            </div>

            <div className="flex-1 text-right w-full space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-2">جۆری یەکەی نیشتەجێبوون دیاری بکە:</label>
                <div className="flex gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {selectedProject.units.map((unit, index) => (
                    <button key={index} onClick={() => { setActiveUnitIndex(index); setCurrentImageIndex(0); }} className={`flex-1 py-3 text-xs font-black rounded-lg ${activeUnitIndex === index ? 'bg-yellow-500 text-black' : 'text-slate-400'}`}>
                      {unit.type}
                    </button>
                  ))}
                </div>
              </div>

              {activeUnitIndex === -1 ? (
                <div className="bg-white/[0.01] p-6 rounded-2xl border border-white/5 text-center py-6 space-y-4">
                  <p className="text-slate-300 text-sm font-black">کلیک لەسەر تابی شوقە یان ڤێلا بکە بۆ بینینی نرخەکان.</p>
                  
                  {selectedProject.mapLink && selectedProject.mapLink.trim() !== "" && (
                    <div className="w-full h-48 sm:h-56 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative bg-slate-950">
                      <iframe src={selectedProject.mapLink} width="100%" height="100%" style={{ border: 0 }} allowFullScreen={true} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {selectedProject.units[activeUnitIndex]?.zone && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-xl flex items-center justify-between text-right animate-in fade-in">
                      <span className="text-slate-400 text-xs font-bold">📍 زۆن یان شوێنی یەکە:</span>
                      <span className="text-yellow-500 text-sm font-black">✨ {selectedProject.units[activeUnitIndex].zone}</span>
                    </div>
                  )}

                  <div className="bg-white/[0.01] p-5 rounded-2xl border border-white/5 space-y-2">
                    <h4 className="text-yellow-500 font-black text-xs">💰 نرخەکانی کڕین:</h4>
                    <p className="text-slate-200 text-sm font-bold">{selectedProject.units[activeUnitIndex]?.price}</p>
                    <p className="text-slate-400 text-xs">{selectedProject.units[activeUnitIndex]?.details}</p>
                  </div>
                  <div className="bg-white/[0.01] p-5 rounded-2xl border border-white/5 space-y-2">
                    <h4 className="text-yellow-500 font-black text-xs">📅 شێوازی قیستەکان:</h4>
                    <p className="text-slate-200 text-sm">{selectedProject.units[activeUnitIndex]?.installments}</p>
                  </div>
                </>
              )}

              <div className="bg-white/[0.01] p-5 rounded-2xl border border-white/5 space-y-3">
                <h4 className="text-yellow-500 font-black text-xs">✨ خزمەتگوزارییەکانی کۆمەڵگەکە:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 text-xs">
                  {selectedProject.services.map((service, index) => (
                    <div key={index} className="flex items-center gap-2 justify-start"><span className="text-yellow-500">✓</span><span>{service}</span></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 👑 🛠️ لێرەدا کێشەی فۆرمی لۆدبوونی ڕوانین چارەسەر کرا بە کڵاسی جێگیر تا دوگمەکە بە تەواوی دەرکەوێت */}
          <div className="p-6 sm:p-10 bg-slate-950/40 border-b border-slate-900 text-right space-y-4">
            <div className="border-l-4 border-yellow-500 pr-3">
              <h3 className="text-lg font-black text-white">🤝 دەتەوێت ئەم یەکەیە بکڕیت؟</h3>
              <p className="text-slate-400 text-xs mt-1">زانیارییەکانت بنووسە؛ تیمی یاسایی و ڕاوێژکاری KurdAI Pro بۆ کڕینی باشترین شوقە/ڤێلا بە کەمترین نرخ یاوەرکارت دەبێت.</p>
            </div>

            <form onSubmit={handleClientSubmitLead} className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <input 
                type="text" 
                placeholder="ناوی سیانیت" 
                value={clientName}
                onChange={e=>setClientName(e.target.value)}
                className="p-3 rounded-xl bg-black text-white text-xs border border-slate-800 focus:outline-none focus:border-yellow-500/50" 
              />
              <input 
                type="tel" 
                placeholder="ژمارەی مۆبایل (ڕاست و دروست)" 
                value={clientPhone}
                onChange={e=>setClientPhone(e.target.value)}
                className="p-3 rounded-xl bg-black text-white text-xs border border-slate-800 focus:outline-none focus:border-yellow-500/50" 
              />
              <input 
                type="text" 
                placeholder="تێبینییەکەت (بۆ نموونە: کاتی پەیوەندی)" 
                value={clientNote}
                onChange={e=>setClientPhoneNote(e.target.value)}
                className="p-3 rounded-xl bg-black text-white text-xs border border-slate-800 focus:outline-none focus:border-yellow-500/50" 
              />
              
              {/* 👑 نوێکردنەوەی کۆتایی دوگمەکە: بە پاشبنەمای زەردی ڕووناک (bg-yellow-500) و تێکستی ڕەشی تۆکمە تا بە جوانی شاشەکە بگرێت */}
              <button 
                type="submit" 
                disabled={submittingLead}
                className="w-full block col-span-1 sm:col-span-3 py-4 bg-yellow-500 hover:bg-yellow-600 text-black font-black text-xs rounded-xl shadow-2xl transition-all disabled:opacity-50 text-center"
              >
                {submittingLead ? 'خەریکی ناردنی زانیارییە...' : '📩 داواکردنی ڕاوێژکاری کڕین لە KurdAI Pro'}
              </button>
            </form>
          </div>

          <div className="p-6 bg-slate-950/20 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              <a href={`tel:${selectedProject.phone}`} className="flex-1 sm:flex-none px-6 py-3 bg-white text-black font-black text-sm rounded-xl text-center">📞 تەلەفۆن</a>
              <a href={`https://wa.me/${selectedProject.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none px-6 py-3 bg-emerald-600 text-white font-black text-sm rounded-xl text-center">💬 وەتسئەپ</a>
            </div>
            <button onClick={() => setSelectedProject(null)} className="w-full sm:w-auto px-8 py-3 bg-slate-800 text-white text-sm font-bold rounded-xl border border-slate-700">گەڕانەوە</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KurdishHousing;