/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, getDocs, query, doc, updateDoc, deleteDoc } from 'firebase/firestore';

interface HousingProject {
  id?: string;
  name_ku: string;
  name_ar: string;
  city: string;
  location_ku: string;
  location_ar: string;
  coverImage: string;
  mapLink?: string; 
  phone: string;
  whatsapp: string;
  services_ku: string[];
  services_ar: string[];
  units: {
    type_ku: string;
    type_ar: string;
    zone_ku?: string;
    zone_ar?: string;
    price_ku: string;
    price_ar: string;
    installments_ku: string;
    installments_ar: string;
    details_ku: string;
    details_ar: string;
    unitImages: string[];
  }[];
}

interface KurdishHousingProps {
  language: 'ku' | 'ar';
}

const KurdishHousing: React.FC<KurdishHousingProps> = ({ language }) => {
  const [projects, setProjects] = useState<HousingProject[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<HousingProject | null>(null);
  const [activeUnitIndex, setActiveUnitIndex] = useState<number>(-1);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  const isAdmin = auth.currentUser?.email === 'hedikurdaipro@admin.com';
  const [showAdminPanel, setShowAdminPanel] = useState<boolean>(false);
  
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [adminFormTab, setAdminFormTab] = useState<number>(0);

  const [newNameKu, setNewNameKu] = useState('');
  const [newNameAr, setNewNameAr] = useState('');
  const [newCity, setNewCity] = useState('erbil');
  const [newLocationKu, setNewLocationKu] = useState('');
  const [newLocationAr, setNewLocationAr] = useState('');
  const [newMapLink, setNewMapLink] = useState(''); 
  const [newPhone, setNewPhone] = useState('');
  const [newWhatsapp, setNewWhatsapp] = useState('');
  const [servicesStrKu, setServicesStrKu] = useState('');
  const [servicesStrAr, setServicesStrAr] = useState('');
  
  const [singleCoverImage, setSingleCoverImage] = useState<string>('');
  const [aptImages, setAptImages] = useState<string[]>([]);
  const [villaImages, setVillaImages] = useState<string[]>([]);

  const [aptZoneKu, setAptZoneKu] = useState('');
  const [aptZoneAr, setAptZoneAr] = useState('');
  const [aptPriceKu, setAptPriceKu] = useState('');
  const [aptPriceAr, setAptPriceAr] = useState('');
  const [aptInstallmentsKu, setAptInstallmentsKu] = useState('');
  const [aptInstallmentsAr, setAptInstallmentsAr] = useState('');
  const [aptDetailsKu, setAptDetailsKu] = useState('');
  const [aptDetailsAr, setAptDetailsAr] = useState('');

  const [villaZoneKu, setVillaZoneKu] = useState('');
  const [villaZoneAr, setVillaZoneAr] = useState('');
  const [villaPriceKu, setVillaPriceKu] = useState('');
  const [villaPriceAr, setVillaPriceAr] = useState('');
  const [villaInstallmentsKu, setVillaInstallmentsKu] = useState('');
  const [villaInstallmentsAr, setVillaInstallmentsAr] = useState('');
  const [villaDetailsKu, setVillaDetailsKu] = useState('');
  const [villaDetailsAr, setVillaDetailsAr] = useState('');

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientNote, setClientNote] = useState('');
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
        const data = doc.data();
        loaded.push({ 
          id: doc.id, 
          name_ku: data.name_ku || data.name || "",
          name_ar: data.name_ar || data.name || "",
          city: data.city || "erbil",
          location_ku: data.location_ku || data.location || "",
          location_ar: data.location_ar || data.location || "",
          coverImage: data.coverImage || "",
          mapLink: data.mapLink || "",
          phone: data.phone || "",
          whatsapp: data.whatsapp || "",
          services_ku: data.services_ku || data.services || [],
          services_ar: data.services_ar || data.services || [],
          units: (data.units || []).map((u: any) => ({
            type_ku: u.type_ku || u.type || "شوقە",
            type_ar: u.type_ar || u.type || "شقة",
            zone_ku: u.zone_ku || u.zone || "",
            zone_ar: u.zone_ar || u.zone || "",
            price_ku: u.price_ku || u.price || "",
            price_ar: u.price_ar || u.price || "",
            installments_ku: u.installments_ku || u.installments || "",
            installments_ar: u.installments_ar || u.installments || "",
            details_ku: u.details_ku || u.details || "",
            details_ar: u.details_ar || u.details || "",
            unitImages: u.unitImages || []
          }))
        } as HousingProject);
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
    setNewNameKu(project.name_ku);
    setNewNameAr(project.name_ar);
    setNewCity(project.city);
    setNewLocationKu(project.location_ku);
    setNewLocationAr(project.location_ar);
    setNewMapLink(project.mapLink || '');
    setNewPhone(project.phone);
    setNewWhatsapp(project.whatsapp);
    setServicesStrKu(project.services_ku.join(', '));
    setServicesStrAr(project.services_ar.join(', '));
    setSingleCoverImage(project.coverImage);

    const apt = project.units.find(u => u.type_ku.includes('شوقە') || u.type_ar.includes('شقة'));
    const villa = project.units.find(u => u.type_ku.includes('ڤێلا') || u.type_ar.includes('فيلا'));

    if (apt) {
      setAptZoneKu(apt.zone_ku || ''); setAptZoneAr(apt.zone_ar || '');
      setAptPriceKu(apt.price_ku); setAptPriceAr(apt.price_ar);
      setAptInstallmentsKu(apt.installments_ku); setAptInstallmentsAr(apt.installments_ar);
      setAptDetailsKu(apt.details_ku); setAptDetailsAr(apt.details_ar); setAptImages(apt.unitImages);
    }
    if (villa) {
      setVillaZoneKu(villa.zone_ku || ''); setVillaZoneAr(villa.zone_ar || '');
      setVillaPriceKu(villa.price_ku); setVillaPriceAr(villa.price_ar);
      setVillaInstallmentsKu(villa.installments_ku); setVillaInstallmentsAr(villa.installments_ar);
      setVillaDetailsKu(villa.details_ku); setVillaDetailsAr(villa.details_ar); setVillaImages(villa.unitImages);
    }
    setShowAdminPanel(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProject = async (projectId: string | undefined) => {
    if (!projectId) return;
    const confirmDelete = window.confirm(language === 'ku' ? "⚠️ دڵنیای لە سڕینەوەی تەواوەتی ئەم پڕۆژەیە؟" : "⚠️ هل أنت متأكد من حذف هذا المشروع نهائياً؟");
    if (!confirmDelete) return;
    try {
      await deleteDoc(doc(db, 'housing_projects', projectId));
      alert(language === 'ku' ? "🗑️ پڕۆژەکە بە سەرکەوتوویی سڕایەوە!" : "🗑️ تم حذف المشروع بنجاح!");
      setSelectedProject(null);
      fetchProjects();
    } catch (err) {
      alert("Error");
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNameKu || !newLocationKu) return alert("Please fill fields");

    const unitsList = [];
    if (aptPriceKu || aptImages.length > 0) {
      unitsList.push({
        type_ku: 'شوقەکان (Apartments)', type_ar: 'الشقق (Apartments)',
        zone_ku: aptZoneKu, zone_ar: aptZoneAr || aptZoneKu,
        price_ku: aptPriceKu, price_ar: aptPriceAr || aptPriceKu,
        installments_ku: aptInstallmentsKu, installments_ar: aptInstallmentsAr || aptInstallmentsKu,
        details_ku: aptDetailsKu, details_ar: aptDetailsAr || aptDetailsKu,
        unitImages: aptImages
      });
    }
    if (villaPriceKu || villaImages.length > 0) {
      unitsList.push({
        type_ku: 'ڤێلاکان (Villas)', type_ar: 'الفلل (Villas)',
        zone_ku: villaZoneKu, zone_ar: villaZoneAr || villaZoneKu,
        price_ku: villaPriceKu, price_ar: villaPriceAr || villaPriceKu,
        installments_ku: villaInstallmentsKu, installments_ar: villaInstallmentsAr || villaInstallmentsKu,
        details_ku: villaDetailsKu, details_ar: villaDetailsAr || villaDetailsKu,
        unitImages: villaImages
      });
    }

    const projectData = {
      name_ku: newNameKu, name_ar: newNameAr || newNameKu,
      city: newCity,
      location_ku: newLocationKu, location_ar: newLocationAr || newLocationKu,
      mapLink: formatGoogleMapLink(newMapLink), 
      phone: newPhone, whatsapp: newWhatsapp,
      coverImage: singleCoverImage,
      services_ku: servicesStrKu.split(',').map(s => s.trim()).filter(s => s !== ''),
      services_ar: (servicesStrAr || servicesStrKu).split(',').map(s => s.trim()).filter(s => s !== ''),
      units: unitsList
    };

    try {
      if (editingProjectId) {
        await updateDoc(doc(db, 'housing_projects', editingProjectId), projectData as any);
      } else {
        await addDoc(collection(db, 'housing_projects'), projectData);
      }
      alert("🎉 Done!");
      setShowAdminPanel(false); setEditingProjectId(null); setSelectedProject(null);
      fetchProjects();
    } catch (err) {
      alert("Error");
    }
  };

  const handleClientSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) return alert("Error");
    if (!selectedProject) return;

    setSubmittingLead(true);
    try {
      await addDoc(collection(db, 'housing_leads'), {
        projectName: selectedProject.name_ku,
        clientName: clientName,
        clientPhone: clientPhone,
        clientNote: clientNote,
        timestamp: new Date().toISOString()
      });
      alert(language === 'ku' ? `🎉 کاک ${clientName} گیان، داواکارییەکەت نێردرا!` : `🎉 سید ${clientName}، تم إرسال طلبك بنجاح!`);
      setClientName(''); setClientPhone(''); setClientNote('');
    } catch (err) {
      alert("Error");
    } finally {
      setSubmittingLead(false);
    }
  };

  const filteredProjects = projects.filter(project => selectedCity === 'all' || project.city === selectedCity);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-16 px-3" dir="rtl">
      
      {isAdmin && (
        <div className="flex justify-center">
          <button type="button" onClick={() => { setShowAdminPanel(!showAdminPanel); if(showAdminPanel) { setEditingProjectId(null); } }} className="px-5 py-2.5 bg-indigo-600 text-white font-black rounded-xl text-xs shadow-md border border-indigo-500 transition-all">
            {showAdminPanel 
              ? (language === 'ku' ? '✕ داخستنی پانێڵ' : '✕ إغلاق اللوحة') 
              : (language === 'ku' ? '➕ داخڵکردنی پڕۆژە' : '➕ إدخال مشروع')}
          </button>
        </div>
      )}

      {showAdminPanel && isAdmin && (
        <form onSubmit={handleSaveProject} className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4 max-w-xl mx-auto text-right">
          <h3 className="text-yellow-500 font-black text-xs border-b border-zinc-800/80 pb-2">
            {language === 'ku' ? '🏢 زانیارییەکانی پڕۆژە' : '🏢 معلومات المشروع العامة'}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" name="projNameKu" placeholder="ناوی پڕۆژە (کوردی)" value={newNameKu} onChange={e=>setNewNameKu(e.target.value)} className="p-2.5 rounded-xl bg-black text-white text-xs border border-zinc-800 outline-none" />
            <input type="text" name="projNameAr" placeholder="اسم المشروع (عربي)" value={newNameAr} onChange={e=>setNewNameAr(e.target.value)} className="p-2.5 rounded-xl bg-black text-white text-xs border border-zinc-800 outline-none" />
            <select name="projCity" value={newCity} onChange={e=>setNewCity(e.target.value)} className="p-2.5 rounded-xl bg-black text-white text-xs border border-zinc-800 outline-none sm:col-span-2">
              <option value="erbil">{language === 'ku' ? 'هەولێر' : 'أربيل'}</option>
              <option value="sulaymaniyah">{language === 'ku' ? 'سلێمانی' : 'السليمانية'}</option>
              <option value="duhok">{language === 'ku' ? 'دهۆک' : 'دهوك'}</option>
            </select>
            <input type="text" name="projLocKu" placeholder="ناونیشانی ورد (کوردی)" value={newLocationKu} onChange={e=>setNewLocationKu(e.target.value)} className="p-2.5 rounded-xl bg-black text-white text-xs border border-zinc-800" />
            <input type="text" name="projLocAr" placeholder="العنوان بالتفصيل (عربي)" value={newLocationAr} onChange={e=>setNewLocationAr(e.target.value)} className="p-2.5 rounded-xl bg-black text-white text-xs border border-zinc-800" />
            <input type="text" name="projMap" placeholder="Google Maps Link" value={newMapLink} onChange={e=>setNewMapLink(e.target.value)} className="p-2.5 rounded-xl bg-black text-white text-xs border border-zinc-800 sm:col-span-2" />
            <input type="text" name="projPhone" placeholder="Phone" value={newPhone} onChange={e=>setNewPhone(e.target.value)} className="p-2.5 rounded-xl bg-black text-white text-xs border border-zinc-800" />
            <input type="text" name="projWA" placeholder="WhatsApp" value={newWhatsapp} onChange={e=>setNewWhatsapp(e.target.value)} className="p-2.5 rounded-xl bg-black text-white text-xs border border-zinc-800" />
            <input type="text" name="projServKu" placeholder="خزمەتگوزاری (کوردی - بە کۆما)" value={servicesStrKu} onChange={e => setServicesStrKu(e.target.value)} className="p-2.5 rounded-xl bg-black text-white text-xs border border-zinc-800" />
            <input type="text" name="projServAr" placeholder="الخدمات (عربي - بالفاصلة)" value={servicesStrAr} onChange={e => setServicesStrAr(e.target.value)} className="p-2.5 rounded-xl bg-black text-white text-xs border border-zinc-800" />
          </div>

          <div className="space-y-1.5">
            <input type="file" name="projCover" accept="image/*" onChange={(e) => handleSingleFile(e, setSingleCoverImage)} className="text-[11px] text-slate-400 cursor-pointer" />
            {singleCoverImage && <img src={singleCoverImage} className="w-20 h-14 object-cover rounded-lg border border-zinc-800" alt="Preview" />}
          </div>

          <div className="flex gap-1.5 bg-black p-0.5 rounded-xl border border-zinc-800">
            <button type="button" onClick={() => setAdminFormTab(0)} className={`flex-1 py-2 text-xs font-bold rounded-lg ${adminFormTab === 0 ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>{language === 'ku' ? '🏢 شوقەکان' : '🏢 الشقق'}</button>
            <button type="button" onClick={() => setAdminFormTab(1)} className={`flex-1 py-2 text-xs font-bold rounded-lg ${adminFormTab === 1 ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}>{language === 'ku' ? '🏡 ڤێلاکان' : '🏡 الفلل'}</button>
          </div>

          {adminFormTab === 0 && (
            <div className="p-3 bg-indigo-950/20 border border-indigo-500/10 rounded-xl space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" name="aptZoneKu" placeholder="زۆن (کوردی)" value={aptZoneKu} onChange={e=>setAptZoneKu(e.target.value)} className="p-2.5 rounded-xl bg-black text-xs border border-zinc-800" />
                <input type="text" name="aptZoneAr" placeholder="المنطقة/الزون (عربي)" value={aptZoneAr} onChange={e=>setAptZoneAr(e.target.value)} className="p-2.5 rounded-xl bg-black text-xs border border-zinc-800" />
                <input type="text" name="aptPriceKu" placeholder="نرخ (کوردی)" value={aptPriceKu} onChange={e=>setAptPriceKu(e.target.value)} className="p-2.5 rounded-xl bg-black text-xs border border-zinc-800" />
                <input type="text" name="aptPriceAr" placeholder="السعر (عربي)" value={aptPriceAr} onChange={e=>setAptPriceAr(e.target.value)} className="p-2.5 rounded-xl bg-black text-xs border border-zinc-800" />
                <input type="text" name="aptInstKu" placeholder="قیست (کوردی)" value={aptInstallmentsKu} onChange={e=>setAptInstallmentsKu(e.target.value)} className="p-2.5 rounded-xl bg-black text-xs border border-zinc-800" />
                <input type="text" name="aptInstAr" placeholder="الأقساط (عربي)" value={aptInstallmentsAr} onChange={e=>setAptInstallmentsAr(e.target.value)} className="p-2.5 rounded-xl bg-black text-xs border border-zinc-800" />
                <textarea name="aptDetailsKu" placeholder="وەسف (کوردی)" value={aptDetailsKu} onChange={e=>setAptDetailsKu(e.target.value)} className="p-2.5 rounded-xl bg-black text-xs border border-zinc-800 h-14 sm:col-span-2" />
                <textarea name="aptDetailsAr" placeholder="الوصف (عربي)" value={aptDetailsAr} onChange={e=>setAptDetailsAr(e.target.value)} className="p-2.5 rounded-xl bg-black text-xs border border-zinc-800 h-14 sm:col-span-2" />
                <input type="file" name="aptFiles" multiple accept="image/*" onChange={(e) => handleMultipleFiles(e, setAptImages)} className="text-[11px] text-slate-400 sm:col-span-2 cursor-pointer" />
              </div>
            </div>
          )}

          {adminFormTab === 1 && (
            <div className="p-3 bg-emerald-950/20 border border-emerald-500/10 rounded-xl space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" name="villaZoneKu" placeholder="زۆنی ڤێلا (کوردی)" value={villaZoneKu} onChange={e=>setVillaZoneKu(e.target.value)} className="p-2.5 rounded-xl bg-black text-xs border border-zinc-800" />
                <input type="text" name="villaZoneAr" placeholder="المنطقة/الزون (عربي)" value={villaZoneAr} onChange={e=>setVillaZoneAr(e.target.value)} className="p-2.5 rounded-xl bg-black text-xs border border-zinc-800" />
                <input type="text" name="villaPriceKu" placeholder="نرخ (کوردی)" value={villaPriceKu} onChange={e=>setVillaPriceKu(e.target.value)} className="p-2.5 rounded-xl bg-black text-xs border border-zinc-800" />
                <input type="text" name="villaPriceAr" placeholder="السعر (عربي)" value={villaPriceAr} onChange={e=>setVillaPriceAr(e.target.value)} className="p-2.5 rounded-xl bg-black text-xs border border-zinc-800" />
                <input type="text" name="villaInstKu" placeholder="قیست (کوردی)" value={villaInstallmentsKu} onChange={e=>setVillaInstallmentsKu(e.target.value)} className="p-2.5 rounded-xl bg-black text-xs border border-zinc-800" />
                <input type="text" name="villaInstAr" placeholder="الأقساط (عربي)" value={villaInstallmentsAr} onChange={e=>setVillaInstallmentsAr(e.target.value)} className="p-2.5 rounded-xl bg-black text-xs border border-zinc-800" />
                <textarea name="villaDetailsKu" placeholder="وەسف (کوردی)" value={villaDetailsKu} onChange={e=>setVillaDetailsKu(e.target.value)} className="p-2.5 rounded-xl bg-black text-xs border border-zinc-800 h-14 sm:col-span-2" />
                <textarea name="villaDetailsAr" placeholder="الوصف (عربي)" value={villaDetailsAr} onChange={e=>setVillaDetailsAr(e.target.value)} className="p-2.5 rounded-xl bg-black text-xs border border-zinc-800 h-14 sm:col-span-2" />
                <input type="file" name="villaFiles" multiple accept="image/*" onChange={(e) => handleMultipleFiles(e, setVillaImages)} className="text-[11px] text-slate-400 sm:col-span-2 cursor-pointer" />
              </div>
            </div>
          )}

          <button type="submit" className="w-full py-3 bg-yellow-500 text-black font-black text-xs rounded-xl">🚀 {language === 'ku' ? 'بڵاوکردنەوەی پڕۆژە' : 'نشر المشروع'}</button>
        </form>
      )}

      {!selectedProject ? (
        <>
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-3xl font-black text-white">
              {language === 'ku' ? 'پڕۆژەکانی ' : 'المشاريع '}<span className="text-yellow-500">{language === 'ku' ? 'نیشتەجێبوون' : 'السكنية'}</span>
            </h2>
            <p className="text-zinc-500 font-bold text-[10px]">
              {language === 'ku' ? 'ڕێبەری گشتی نرخ و قیستەکانی کوردستان' : 'الدليل العام للأسعار والأقساط في كوردستان'}
            </p>
          </div>

          <div className="flex justify-center gap-1 max-w-sm mx-auto bg-zinc-950/40 p-1 rounded-xl border border-zinc-800/80">
            <button type="button" onClick={() => setSelectedCity('all')} className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg ${selectedCity === 'all' ? 'bg-yellow-500 text-black shadow-sm font-black' : 'text-zinc-400'}`}>{language === 'ku' ? 'هەمووی' : 'الكل'}</button>
            <button type="button" onClick={() => setSelectedCity('erbil')} className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg ${selectedCity === 'erbil' ? 'bg-yellow-500 text-black shadow-sm font-black' : 'text-zinc-400'}`}>{language === 'ku' ? ' هەولێر' : ' أربيل'}</button>
            <button type="button" onClick={() => setSelectedCity('sulaymaniyah')} className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg ${selectedCity === 'sulaymaniyah' ? 'bg-yellow-500 text-black shadow-sm font-black' : 'text-zinc-400'}`}>{language === 'ku' ? ' سلێمانی' : ' السليمانية'}</button>
            <button type="button" onClick={() => setSelectedCity('duhok')} className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg ${selectedCity === 'duhok' ? 'bg-yellow-500 text-black shadow-sm font-black' : 'text-zinc-400'}`}>{language === 'ku' ? ' دهۆک' : ' دهوك'}</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project, idx) => (
              <div key={idx} onClick={() => { setSelectedProject(project); setActiveUnitIndex(-1); setCurrentImageIndex(0); }} className="group rounded-2xl border border-zinc-800/80 bg-[#07070a] hover:border-yellow-500/40 cursor-pointer flex flex-col overflow-hidden transition-all duration-300 shadow-md">
                <div className="h-36 sm:h-40 w-full overflow-hidden relative">
                  <img src={project.coverImage} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-4 text-right flex flex-col justify-between flex-1 space-y-1.5">
                  <h3 className="text-sm md:text-base font-black text-zinc-100 group-hover:text-yellow-500 transition-colors truncate">{language === 'ku' ? project.name_ku : project.name_ar}</h3>
                  <p className="text-zinc-400 text-[11px] font-medium truncate">📍 {language === 'ku' ? project.location_ku : project.location_ar}</p>
                  <span className="text-yellow-500 text-[10px] font-bold pt-1 block">{language === 'ku' ? 'بینینی زانیاری تەواو ←' : 'عرض التفاصيل بالكامل ←'}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col bg-[#050507] rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-zinc-800/80 bg-zinc-950/40 flex justify-between items-center">
            <div className="flex flex-col text-right">
              <h2 className="text-base sm:text-xl font-black text-white">{language === 'ku' ? selectedProject.name_ku : selectedProject.name_ar}</h2>
              <span className="text-zinc-400 text-[11px] mt-0.5">📍 {language === 'ku' ? selectedProject.location_ku : selectedProject.location_ar}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {isAdmin && (
                <>
                  <button type="button" onClick={() => startEditing(selectedProject)} className="px-3 py-1.5 bg-indigo-600 text-white font-bold text-[10px] rounded-lg">📝</button>
                  <button type="button" onClick={() => handleDeleteProject(selectedProject.id)} className="px-3 py-1.5 bg-red-600 text-white font-bold text-[10px] rounded-lg">🗑️</button>
                </>
              )}
              <button type="button" onClick={() => setSelectedProject(null)} className="w-8 h-8 bg-zinc-800 hover:bg-yellow-500 text-white rounded-lg flex items-center justify-center font-bold text-sm">✕</button>
            </div>
          </div>

          <div className="p-4 sm:p-8 flex flex-col lg:flex-row gap-5 items-start">
            <div className="w-full lg:w-[320px] aspect-square rounded-xl overflow-hidden border border-zinc-800 relative bg-black select-none shrink-0">
              <img src={activeUnitIndex === -1 ? selectedProject.coverImage : (selectedProject.units[activeUnitIndex]?.unitImages[currentImageIndex] || selectedProject.coverImage)} className="w-full h-full object-cover" alt="" />
              {activeUnitIndex !== -1 && selectedProject.units[activeUnitIndex]?.unitImages.length > 1 && (
                <>
                  <button type="button" onClick={() => setCurrentImageIndex(p => (p - 1 + selectedProject.units[activeUnitIndex].unitImages.length) % selectedProject.units[activeUnitIndex].unitImages.length)} className="absolute left-2 top-1/2 bg-black/60 text-white rounded-full p-1 text-sm">‹</button>
                  <button type="button" onClick={() => setCurrentImageIndex(p => (p + 1) % selectedProject.units[activeUnitIndex].unitImages.length)} className="absolute right-2 top-1/2 bg-black/60 text-white rounded-full p-1 text-sm">›</button>
                </>
              )}
            </div>

            <div className="flex-1 text-right w-full space-y-4">
              <div className="flex gap-1 bg-zinc-950 p-0.5 rounded-xl border border-zinc-900">
                {selectedProject.units.map((unit, index) => (
                  <button type="button" key={index} onClick={() => { setActiveUnitIndex(index); setCurrentImageIndex(0); }} className={`flex-1 py-2 text-[11px] font-black rounded-lg transition-all ${activeUnitIndex === index ? 'bg-yellow-500 text-zinc-950' : 'text-zinc-500'}`}>
                    {language === 'ku' ? unit.type_ku : unit.type_ar}
                  </button>
                ))}
              </div>

              {activeUnitIndex === -1 ? (
                <div className="bg-white/[0.005] p-5 rounded-xl border border-zinc-900 text-center space-y-3">
                  <p className="text-zinc-400 text-xs font-bold">{language === 'ku' ? 'کلیک لەسەر یەکێک لە جۆرەکان بکە بۆ بینینی نرخەکان.' : 'اضغط على أحد الأنواع لعرض الأسعار.'}</p>
                  {selectedProject.mapLink && (
                    <div className="w-full h-44 rounded-xl overflow-hidden border border-zinc-900">
                      <iframe src={selectedProject.mapLink} width="100%" height="100%" style={{ border: 0 }} allowFullScreen={true}></iframe>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="bg-white/[0.005] p-4 rounded-xl border border-zinc-900 space-y-1">
                    <h4 className="text-yellow-500 font-black text-[10px]">💰 {language === 'ku' ? 'نرخ:' : '💰 الأسعار:'}</h4>
                    <p className="text-zinc-100 text-xs font-bold">{language === 'ku' ? selectedProject.units[activeUnitIndex].price_ku : selectedProject.units[activeUnitIndex].price_ar}</p>
                    <p className="text-zinc-400 text-[11px] font-medium">{language === 'ku' ? selectedProject.units[activeUnitIndex].details_ku : selectedProject.units[activeUnitIndex].details_ar}</p>
                  </div>
                  <div className="bg-white/[0.005] p-4 rounded-xl border border-zinc-900 space-y-1">
                    <h4 className="text-yellow-500 font-black text-[10px]">📅 {language === 'ku' ? 'قیستەکان:' : '📅 الأقساط:'}</h4>
                    <p className="text-zinc-200 text-xs font-medium">{language === 'ku' ? selectedProject.units[activeUnitIndex].installments_ku : selectedProject.units[activeUnitIndex].installments_ar}</p>
                  </div>
                </>
              )}

              <div className="bg-white/[0.005] p-4 rounded-xl border border-zinc-900 space-y-2">
                <h4 className="text-yellow-500 font-black text-[10px]">✨ {language === 'ku' ? 'خزمەتگوزارییەکان:' : '✨ الخدمات:'}</h4>
                <div className="grid grid-cols-2 gap-1.5 text-zinc-300 text-[11px] font-medium">
                  {(language === 'ku' ? selectedProject.services_ku : selectedProject.services_ar).map((s, i) => (
                    <div key={i} className="flex items-center gap-1.5 justify-start"><span className="text-yellow-500">✓</span><span>{s}</span></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 bg-zinc-950/40 border-b border-zinc-900 text-right space-y-3">
            <h3 className="text-xs sm:text-sm font-black text-white">{language === 'ku' ? '🤝 دەتەوێت ئەم یەکەیە بکڕیت؟' : '🤝 هل ترغب في شراء هذه الوحدة؟'}</h3>
            <form onSubmit={handleClientSubmitLead} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <input type="text" name="clientName" placeholder={language === 'ku' ? "ناوی سیانیت" : "الاسم الثلاثي"} value={clientName} onChange={e=>setClientName(e.target.value)} className="p-2.5 rounded-xl bg-black text-white text-xs border border-zinc-800 outline-none" />
              <input type="tel" name="clientPhone" placeholder={language === 'ku' ? "ژمارەی مۆبایل" : "رقم الهاتف"} value={clientPhone} onChange={e=>setClientPhone(e.target.value)} className="p-2.5 rounded-xl bg-black text-white text-xs border border-zinc-800 outline-none" />
              <input type="text" name="clientNote" placeholder={language === 'ku' ? "تێبینی" : "ملاحظات إضافية"} value={clientNote} onChange={e=>setClientNote(e.target.value)} className="p-2.5 rounded-xl bg-black text-white text-xs border border-zinc-800 outline-none" />
              <button type="submit" disabled={submittingLead} className="w-full block sm:col-span-3 py-3 bg-yellow-500 text-zinc-950 font-black text-xs rounded-xl shadow-md transition-all">
                {submittingLead ? '...' : (language === 'ku' ? '📩 داواکردنی ڕاوێژکاری کڕین' : '📩 طلب استشارة الشراء')}
              </button>
            </form>
          </div>

          <div className="p-4 bg-zinc-950/20 flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <a href={`tel:${selectedProject.phone}`} className="flex-1 sm:flex-none px-5 py-2.5 bg-white text-zinc-950 font-black text-xs rounded-xl text-center">{language === 'ku' ? '📞 تەلەفۆن' : '📞 اتصالات'}</a>
              <a href={`https://wa.me/${selectedProject.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 text-white font-black text-xs rounded-xl text-center">WhatsApp</a>
            </div>
            <button type="button" onClick={() => setSelectedProject(null)} className="w-full sm:w-auto px-6 py-2.5 bg-zinc-800 text-white text-xs font-bold rounded-xl border border-zinc-800">{language === 'ku' ? 'گەڕانەوە' : 'رجوع'}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KurdishHousing;