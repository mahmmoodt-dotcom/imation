
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { translations } from '../translations';

export const AdminSettings: React.FC = () => {
  const { settings, updateAboutSettings, updateHomeFeatureImage, updateAboutImage } = useApp();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleHomeFeatureFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) updateHomeFeatureImage(file);
  };

  const handleAboutFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) updateAboutImage(file);
  };

  const handleSave = async () => {
    await updateAboutSettings(localSettings);
    alert("Settings updated successfully");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      {/* Visual Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border dark:border-gray-800 shadow-sm space-y-6">
          <h3 className="text-xl font-black dark:text-white">Hero Feature Image (PNG)</h3>
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 dark:bg-gray-800 rounded-3xl overflow-hidden flex items-center justify-center border-4 border-dashed border-gray-200 dark:border-gray-700">
              {settings.homeFeatureImage ? (
                <img src={settings.homeFeatureImage} className="w-full h-full object-contain p-4" alt="Hero" />
              ) : (
                <span className="text-gray-400 font-bold uppercase text-xs">No Image</span>
              )}
            </div>
            <input type="file" accept="image/png" onChange={handleHomeFeatureFileChange} className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-brand/10 file:text-brand" />
          </div>
        </section>

        <section className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border dark:border-gray-800 shadow-sm space-y-6">
          <h3 className="text-xl font-black dark:text-white">About Us Page Image</h3>
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 dark:bg-gray-800 rounded-3xl overflow-hidden flex items-center justify-center border-4 border-dashed border-gray-200 dark:border-gray-700">
              {settings.aboutImage ? (
                <img src={settings.aboutImage} className="w-full h-full object-cover" alt="About" />
              ) : (
                <span className="text-gray-400 font-bold uppercase text-xs">No Image</span>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleAboutFileChange} className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-brand/10 file:text-brand" />
          </div>
        </section>
      </div>

      {/* Text & Social Settings */}
      <section className="bg-white dark:bg-gray-900 p-8 md:p-12 rounded-[3rem] border dark:border-gray-800 shadow-sm space-y-10">
        <h3 className="text-2xl font-black dark:text-white flex items-center gap-3">
          <span className="w-8 h-1.5 bg-brand rounded-full"></span>
          Store Configuration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-brand">About Translations</h4>
            {(['en', 'ckb', 'ar'] as const).map(l => (
              <div key={l}>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Story ({l})</label>
                <textarea 
                  className="w-full p-4 rounded-2xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white min-h-[120px] text-sm font-medium focus:ring-2 focus:ring-brand/20 transition-all"
                  value={localSettings.aboutText[l]}
                  onChange={e => setLocalSettings({...localSettings, aboutText: {...localSettings.aboutText, [l]: e.target.value}})}
                />
              </div>
            ))}
            
            <div className="pt-4">
              <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Google Maps Embed URL</label>
              <textarea 
                className="w-full p-4 rounded-2xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white min-h-[100px] text-[11px] font-mono focus:ring-2 focus:ring-brand/20 transition-all"
                value={localSettings.mapEmbed}
                placeholder="Paste only the 'src' value from the Google Maps iframe share code"
                onChange={e => setLocalSettings({...localSettings, mapEmbed: e.target.value})}
              />
              <p className="mt-2 text-[9px] text-gray-400 font-bold uppercase">Go to Google Maps > Share > Embed a map > Copy ONLY the URL inside src="..."</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-brand">Contact Numbers</h4>
              <div className="space-y-3">
                <input 
                  placeholder="Primary Phone"
                  className="w-full p-4 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white text-sm font-bold"
                  value={localSettings.phones[0]}
                  onChange={e => setLocalSettings({...localSettings, phones: [e.target.value, localSettings.phones[1]]})}
                />
                <input 
                  placeholder="Secondary Phone (Optional)"
                  className="w-full p-4 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white text-sm font-bold"
                  value={localSettings.phones[1] || ''}
                  onChange={e => setLocalSettings({...localSettings, phones: [localSettings.phones[0], e.target.value]})}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-brand">Social Links</h4>
              <div className="space-y-3">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-black uppercase">FB</span>
                  <input 
                    placeholder="Facebook Profile URL"
                    className="w-full pl-12 p-4 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white text-sm"
                    value={localSettings.socials.facebook}
                    onChange={e => setLocalSettings({...localSettings, socials: {...localSettings.socials, facebook: e.target.value}})}
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-black uppercase">IG</span>
                  <input 
                    placeholder="Instagram Profile URL"
                    className="w-full pl-12 p-4 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white text-sm"
                    value={localSettings.socials.instagram}
                    onChange={e => setLocalSettings({...localSettings, socials: {...localSettings.socials, instagram: e.target.value}})}
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-black uppercase">TK</span>
                  <input 
                    placeholder="TikTok Profile URL"
                    className="w-full pl-12 p-4 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white text-sm"
                    value={localSettings.socials.tiktok}
                    onChange={e => setLocalSettings({...localSettings, socials: {...localSettings.socials, tiktok: e.target.value}})}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t dark:border-gray-800 flex justify-end">
          <button 
            onClick={handleSave} 
            className="group bg-brand text-white px-16 py-5 rounded-2xl font-black shadow-xl shadow-brand/20 hover:bg-brand-hover hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-3"
          >
            <span>Save All Changes</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </section>
    </div>
  );
};
