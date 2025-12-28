import React, { useState } from 'react';
import { AppProvider, useApp } from './store/AppContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Cart } from './pages/Cart';
import { Wishlist } from './pages/Wishlist';
import { Admin } from './pages/Admin';
import { AboutContact } from './pages/AboutContact';
import { TrackOrder } from './pages/TrackOrder';
import { ProductDetails } from './pages/ProductDetails';
import { AIAssistant } from './components/AIAssistant';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const { lang, settings, isLoading, t } = useApp();

  const handleShopNow = (categoryId?: string) => {
    setSelectedCategory(categoryId);
    setActiveProductId(null);
    setCurrentPage('shop');
  };

  const handleOpenProduct = (productId: string) => {
    setActiveProductId(productId);
    setCurrentPage('product-details');
    window.scrollTo(0, 0);
  };

  const handlePageChange = (page: string) => {
    if (page !== 'shop' && page !== 'product-details') setSelectedCategory(undefined);
    if (page !== 'product-details') setActiveProductId(null);
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-950 flex items-center justify-center z-[999]">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-8 border-brand/20 border-t-brand rounded-full animate-spin mb-6"></div>
          <h2 className="text-4xl font-black text-brand lowercase tracking-tighter">imation</h2>
          <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] mt-2 animate-pulse">Initializing</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onShopNow={handleShopNow} onOpenProduct={handleOpenProduct} />;
      case 'shop':
        return <Shop initialCategory={selectedCategory} onOpenProduct={handleOpenProduct} />;
      case 'product-details':
        return activeProductId ? (
          <ProductDetails productId={activeProductId} onOpenProduct={handleOpenProduct} onGoBack={() => setCurrentPage('shop')} />
        ) : <Home onShopNow={handleShopNow} onOpenProduct={handleOpenProduct} />;
      case 'about':
        return <AboutContact />;
      case 'track':
        return <TrackOrder />;
      case 'wishlist':
        return <Wishlist onOpenProduct={handleOpenProduct} />;
      case 'cart':
        return <Cart onComplete={() => setCurrentPage('shop')} />;
      case 'admin':
        return <Admin />;
      default:
        return <Home onShopNow={handleShopNow} onOpenProduct={handleOpenProduct} />;
    }
  };

  // Safe fallback for about text
  const aboutText = settings?.aboutText?.[lang] || settings?.aboutText?.['en'] || (lang === 'en' ? 'Welcome to Imation Shop' : 'بەخێربێن بۆ ئیمەیشن شۆپ');

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 dark:bg-gray-950">
      <Navbar currentPage={currentPage} onPageChange={handlePageChange} />
      
      <main className="flex-1">
        {renderPage()}
      </main>

      <AIAssistant />

      <footer className="bg-white dark:bg-gray-900 border-t dark:border-gray-800 pt-12 pb-8 px-4 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 lg:col-span-1">
              <h2 className="text-3xl font-black text-brand mb-4 lowercase tracking-tighter">imation</h2>
              <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed mb-4 font-medium max-w-sm">
                {aboutText}
              </p>
              <div className="flex gap-3">
                 {settings?.socials?.facebook && (
                   <a href={settings.socials.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-400 hover:bg-brand hover:text-white transition-all transform hover:-translate-y-1">
                     <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                   </a>
                 )}
                 {settings?.socials?.instagram && (
                   <a href={settings.socials.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-400 hover:bg-brand hover:text-white transition-all transform hover:-translate-y-1">
                     <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                   </a>
                 )}
              </div>
            </div>

            <div className="col-span-1">
              <h4 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4">
                {lang === 'en' ? 'Quick Links' : lang === 'ckb' ? 'بەستەرە خێراکان' : 'روابط سريعة'}
              </h4>
              <ul className="space-y-3">
                <li><button onClick={() => handlePageChange('home')} className="text-gray-500 dark:text-gray-400 hover:text-brand transition-colors text-xs font-semibold">{t('home')}</button></li>
                <li><button onClick={() => handlePageChange('shop')} className="text-gray-500 dark:text-gray-400 hover:text-brand transition-colors text-xs font-semibold">{t('shop')}</button></li>
                <li><button onClick={() => handlePageChange('wishlist')} className="text-gray-500 dark:text-gray-400 hover:text-brand transition-colors text-xs font-semibold">{t('wishlist')}</button></li>
                <li><button onClick={() => handlePageChange('track')} className="text-gray-500 dark:text-gray-400 hover:text-brand transition-colors text-xs font-semibold">{t('track_order')}</button></li>
              </ul>
            </div>

            <div className="col-span-1">
              <h4 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4">
                {lang === 'en' ? 'Support' : lang === 'ckb' ? 'پشتگیری' : 'الدعم'}
              </h4>
              <ul className="space-y-3">
                <li className="text-gray-500 dark:text-gray-400 text-xs font-semibold flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {settings?.phones?.[0] || 'N/A'}
                </li>
                <li className="text-gray-500 dark:text-gray-400 text-xs font-semibold flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate max-w-[150px]">{settings?.email || 'N/A'}</span>
                </li>
                <li>
                  <button 
                    onClick={() => handlePageChange('admin')}
                    className="flex items-center gap-2 text-gray-400 hover:text-brand transition-colors text-[10px] font-black uppercase tracking-widest mt-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    {t('admin')}
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-6 border-t dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
            <p>© {new Date().getFullYear()} imation. Engineered for Performance.</p>
            <div className="flex gap-4">
               <span className="hover:text-brand cursor-pointer transition-colors">Privacy</span>
               <span className="hover:text-brand cursor-pointer transition-colors">Terms</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;