import React, { useState, useRef } from 'react';
import { useApp } from '../store/AppContext';

export const AdminSettings: React.FC = () => {
  const { settings, updateAboutSettings, updateHomeFeatureImage, updateAboutImage, t, lang } = useApp();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isUploading, setIsUploading] = useState<{ [key: string]: boolean }>({});

  const logoRef = useRef<HTMLInputElement>(null);
  const heroRef = useRef<HTMLInputElement>(null);
  const aboutRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'hero' | 'about') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File is too large! Maximum allowed is 2MB.");
      return;
    }

    setIsUploading(prev => ({ ...prev, [type]: true }));

    try {
      if (type === 'logo') {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch('/api/admin/settings/logo', {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          setLocalSettings(prev => ({ ...prev, mainLogo: data.url }));
        }
      } else if (type === 'hero') {
        await updateHomeFeatureImage(file);
      } else if (type === 'about') {
        await updateAboutImage(file);
      }
    } catch (err) {
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSaveText = async () => {
    await updateAboutSettings(localSettings);
    alert("Text settings updated successfully.");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      
      {/* Branding & Media Section */}
      <section className="bg-white dark:bg-gray-900 p-8 md:p-12 rounded-[3rem] border dark:border-gray-800 shadow-sm space-y-10">
        <h3 className="text-2xl font-black dark:text-white flex items-center gap-3">
          <span className="w-8 h-1.5 bg-brand rounded-full"></span>
          Branding & Assets
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo Upload */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block">Store Logo</label>
            <div className="aspect-video bg-gray-50 dark:bg-gray-800 rounded-3xl overflow-hidden flex items-center justify-center border-4 border-dashed border-gray-200 dark:border-gray-700 relative group">
              {localSettings.mainLogo || settings.mainLogo ? (
                <img src={localSettings.mainLogo || settings.mainLogo} className="max-w-[80%] max-h-[80%] object-contain" alt="Logo" />
              ) : (
                <span className="text-gray-400 font-bold text-xs">No Logo</span>
              )}
              {isUploading.logo && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm rounded-2xl">
                   <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <input ref={logoRef} type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} className="hidden" />
            <button 
              onClick={() => logoRef.current?.click()}
              className="w-full bg-brand text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand/20 hover:bg-brand-hover transition-all"
            >
              Upload Logo
            </button>
          </div>

          {/* Hero Feature Upload */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block">Hero Image (PNG)</label>
            <div className="aspect-video bg-gray-50 dark:bg-gray-800 rounded-3xl overflow-hidden flex items-center justify-center border-4 border-dashed border-gray-200 dark:border-gray-700 relative">
              {settings.homeFeatureImage ? (
                <img src={settings.homeFeatureImage} className="w-full h-full object-contain p-2" alt="Hero" />
              ) : (
                <span className="text-gray-400 font-bold text-xs">No Image</span>
              )}
              {isUploading.hero && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm rounded-2xl">
                   <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <input ref={heroRef} type="file" accept="image/png" onChange={(e) => handleFileUpload(e, 'hero')} className="hidden" />
            <button 
              onClick={() => heroRef.current?.click()}
              className="w-full bg-gray-900 dark:bg-gray-700 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-black transition-all"
            >
              Upload Hero
            </button>
          </div>

          {/* About Image Upload */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block">About Page Banner</label>
            <div className="aspect-video bg-gray-50 dark:bg-gray-800 rounded-3xl overflow-hidden flex items-center justify-center border-4 border-dashed border-gray-200 dark:border-gray-700 relative">
              {settings.aboutImage ? (
                <img src={settings.aboutImage} className="w-full h-full object-cover" alt="About" />
              ) : (
                <span className="text-gray-400 font-bold text-xs">No Image</span>
              )}
              {isUploading.about && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm rounded-2xl">
                   <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <input ref={aboutRef} type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'about')} className="hidden" />
            <button 
              onClick={() => aboutRef.current?.click()}
              className="w-full bg-gray-900 dark:bg-gray-700 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-black transition-all"
            >
              Upload Banner
            </button>
          </div>
        </div>
      </section>

      {/* Configuration Form */}
      <section className="bg-white dark:bg-gray-900 p-8 md:p-12 rounded-[3rem] border dark:border-gray-800 shadow-sm space-y-10">
        <h3 className="text-2xl font-black dark:text-white flex items-center gap-3">
          <span className="w-8 h-1.5 bg-brand rounded-full"></span>
          Store Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-brand">Multilingual Story</h4>
            {(['en', 'ckb', 'ar'] as const).map(l => (
              <div key={l}>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">About ({l})</label>
                <textarea 
                  className="w-full p-4 rounded-2xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white min-h-[100px] text-sm font-medium focus:ring-2 focus:ring-brand/20 outline-none"
                  value={localSettings.aboutText[l]}
                  onChange={e => setLocalSettings({...localSettings, aboutText: {...localSettings.aboutText, [l]: e.target.value}})}
                />
              </div>
            ))}
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-brand">Contact Details</h4>
              <input 
                placeholder="Primary Phone"
                className="w-full p-4 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white text-sm font-bold outline-none focus:ring-2 focus:ring-brand/20"
                value={localSettings.phones[0]}
                onChange={e => setLocalSettings({...localSettings, phones: [e.target.value, localSettings.phones[1] || '']})}
              />
              <input 
                placeholder="Email Address"
                className="w-full p-4 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white text-sm font-bold outline-none focus:ring-2 focus:ring-brand/20"
                value={localSettings.email}
                onChange={e => setLocalSettings({...localSettings, email: e.target.value})}
              />
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-brand">Social Networks</h4>
              <div className="grid grid-cols-2 gap-3">
                <input 
                  placeholder="Instagram"
                  className="p-4 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white text-xs font-bold outline-none"
                  value={localSettings.socials.instagram}
                  onChange={e => setLocalSettings({...localSettings, socials: {...localSettings.socials, instagram: e.target.value}})}
                />
                <input 
                  placeholder="Facebook"
                  className="p-4 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white text-xs font-bold outline-none"
                  value={localSettings.socials.facebook}
                  onChange={e => setLocalSettings({...localSettings, socials: {...localSettings.socials, facebook: e.target.value}})}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t dark:border-gray-800 flex justify-end">
          <button 
            onClick={handleSaveText} 
            className="bg-brand text-white px-16 py-5 rounded-2xl font-black shadow-xl shadow-brand/20 hover:bg-brand-hover hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-3"
          >
            <span>Confirm Configuration</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </button>
        </div>
      </section>
    </div>
  );
};