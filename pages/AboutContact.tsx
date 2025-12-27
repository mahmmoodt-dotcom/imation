
import React from 'react';
import { useApp } from '../store/AppContext';
import { translations } from '../translations';

export const AboutContact: React.FC = () => {
  const { settings, lang } = useApp();
  const t = translations;

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        {/* Left Side: About Text, Contact & Socials */}
        <div className="space-y-16">
          {/* About Section Text */}
          <section className="reveal">
            <h2 className="text-5xl font-black text-brand mb-6 lowercase tracking-tighter">
              {t.about[lang]}
            </h2>
            <div className="h-2 w-20 bg-brand rounded-full mb-12"></div>
            
            <div className="space-y-6">
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                {settings.aboutText[lang]}
              </p>
            </div>
          </section>

          {/* Contact Us Section - Matching Screenshot */}
          <section className="space-y-10 bg-gray-50/50 dark:bg-gray-900/50 p-10 rounded-[3.5rem] border border-gray-100 dark:border-gray-800 shadow-sm reveal">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-4">
               <span className="w-10 h-1.5 bg-brand rounded-full"></span>
               {t.contact[lang]}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              {/* Phones */}
              <div className="flex items-start gap-5">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm text-brand border border-gray-50 dark:border-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-black text-gray-400 text-[10px] uppercase tracking-widest mb-1.5">{t.phone[lang]}</h4>
                  <div className="flex flex-col gap-1">
                    {settings.phones.map((phone, idx) => phone && (
                      <a key={idx} href={`tel:${phone}`} className="text-lg font-black dark:text-white hover:text-brand transition-colors">
                        {phone}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-5">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm text-brand border border-gray-50 dark:border-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-black text-gray-400 text-[10px] uppercase tracking-widest mb-1.5">{t.email[lang]}</h4>
                  <a href={`mailto:${settings.email}`} className="text-lg font-black dark:text-white hover:text-brand transition-colors break-all">
                    {settings.email}
                  </a>
                </div>
              </div>
            </div>
            
            {/* Address */}
            <div className="pt-8 border-t dark:border-gray-800 flex items-start gap-5">
               <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm text-brand border border-gray-50 dark:border-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-black text-gray-400 text-[10px] uppercase tracking-widest mb-1.5">{t.address[lang]}</h4>
                <p className="text-lg font-black dark:text-white">{settings.address}</p>
              </div>
            </div>
          </section>

          {/* Social Media - Follow Us */}
          <section className="space-y-8 reveal">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-4">
               <span className="w-10 h-1.5 bg-brand rounded-full"></span>
               {lang === 'en' ? 'Follow Us' : lang === 'ckb' ? 'فۆڵۆمان بکەن' : 'تابعنا'}
            </h3>
            <div className="flex flex-wrap gap-5">
              {settings.socials.instagram && (
                <a href={settings.socials.instagram} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all flex items-center justify-center text-pink-600 border dark:border-gray-800 group">
                  <svg className="h-7 w-7 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              )}
              {settings.socials.tiktok && (
                <a href={settings.socials.tiktok} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all flex items-center justify-center text-black dark:text-white border dark:border-gray-800 group">
                  <svg className="h-7 w-7 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 448 512"><path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17h.03a122.18 122.18 0 0 0 108.48 104.48V209.91z"/></svg>
                </a>
              )}
              {settings.socials.facebook && (
                <a href={settings.socials.facebook} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all flex items-center justify-center text-blue-600 border dark:border-gray-800 group">
                  <svg className="h-7 w-7 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              )}
            </div>
          </section>
        </div>

        {/* Right Side: Media Stack (Image top, Map below) - Sticky for scroll effect */}
        <div className="space-y-12 lg:sticky lg:top-24 reveal">
          {/* Shop Image */}
          <div className="w-full">
            <div className="group relative rounded-[3.5rem] overflow-hidden shadow-2xl border-8 border-white dark:border-gray-900 ring-1 ring-gray-100 dark:ring-gray-800">
              {settings.aboutImage ? (
                <img 
                  src={settings.aboutImage} 
                  alt="Our Premium Showroom" 
                  className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-105" 
                />
              ) : (
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest">
                   No Image Uploaded
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            </div>
          </div>

          {/* Site's Google Map View */}
          <div className="w-full">
            <div className="h-[400px] md:h-[500px] w-full rounded-[3.5rem] overflow-hidden shadow-2xl border-8 border-white dark:border-gray-900 ring-1 ring-gray-100 dark:ring-gray-800 bg-gray-50 dark:bg-gray-800">
              {settings.mapEmbed ? (
                <iframe 
                  src={settings.mapEmbed}
                  className="w-full h-full border-0 grayscale dark:invert dark:hue-rotate-180 hover:grayscale-0 dark:hover:invert-0 dark:hover:hue-rotate-0 transition-all duration-700"
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Shop Location"
                ></iframe>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                   </svg>
                   <span className="font-black text-xs uppercase tracking-widest">Map location not set</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
