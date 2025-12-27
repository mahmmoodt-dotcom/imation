import React from 'react';
import { useApp } from '../store/AppContext';
import { LanguageSwitcher } from './LanguageSwitcher';

interface NavbarProps {
  onPageChange: (page: string) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onPageChange, currentPage }) => {
  const { lang, cart, wishlist, theme, toggleTheme, settings, t } = useApp();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const NavButtons = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      <button 
        onClick={() => onPageChange('home')}
        className={`${isMobile ? 'text-[11px]' : 'text-sm'} font-bold uppercase tracking-wider ${currentPage === 'home' ? 'text-brand' : 'text-gray-500 dark:text-gray-400'} hover:text-brand transition-colors whitespace-nowrap`}
      >
        {t('home')}
      </button>
      <button 
        onClick={() => onPageChange('shop')}
        className={`${isMobile ? 'text-[11px]' : 'text-sm'} font-bold uppercase tracking-wider ${currentPage === 'shop' || currentPage === 'product-details' ? 'text-brand' : 'text-gray-500 dark:text-gray-400'} hover:text-brand transition-colors whitespace-nowrap`}
      >
        {t('shop')}
      </button>
      <button 
        onClick={() => onPageChange('track')}
        className={`${isMobile ? 'text-[11px]' : 'text-sm'} font-bold uppercase tracking-wider ${currentPage === 'track' ? 'text-brand' : 'text-gray-500 dark:text-gray-400'} hover:text-brand transition-colors whitespace-nowrap`}
      >
        {t('track_order')}
      </button>
      <button 
        onClick={() => onPageChange('about')}
        className={`${isMobile ? 'text-[11px]' : 'text-sm'} font-bold uppercase tracking-wider ${currentPage === 'about' ? 'text-brand' : 'text-gray-500 dark:text-gray-400'} hover:text-brand transition-colors whitespace-nowrap`}
      >
        {t('about')}
      </button>
    </>
  );

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b dark:border-gray-800 sticky top-0 z-50 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <div 
              onClick={() => onPageChange('home')}
              className="cursor-pointer flex items-center h-full group overflow-hidden"
            >
              {settings?.mainLogo ? (
                <div className="animate-fade-in-up">
                  <img 
                    src={settings.mainLogo} 
                    alt="Shop Logo" 
                    className="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-110"
                  />
                </div>
              ) : (
                <h1 className="text-3xl font-black text-brand tracking-tighter lowercase select-none animate-fade-in-up">
                  imation
                </h1>
              )}
            </div>
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-6 rtl:space-x-reverse">
              <NavButtons />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            
            <button 
              onClick={toggleTheme}
              className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-brand transition-colors rounded-xl bg-gray-50 dark:bg-gray-800"
              title="Toggle Theme"
            >
              {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.071 16.071l.707.707M7.929 7.929l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              )}
            </button>

            <button 
              onClick={() => onPageChange('wishlist')}
              className={`relative p-2.5 transition-colors rounded-xl bg-gray-50 dark:bg-gray-800 ${currentPage === 'wishlist' ? 'text-brand' : 'text-gray-500 dark:text-gray-400 hover:text-brand'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={currentPage === 'wishlist' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button 
              onClick={() => onPageChange('cart')}
              className={`relative p-2.5 transition-colors rounded-xl bg-gray-50 dark:bg-gray-800 ${currentPage === 'cart' ? 'text-brand' : 'text-gray-500 dark:text-gray-400 hover:text-brand'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - Pages Section */}
      <div className="md:hidden border-t dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 overflow-x-auto no-scrollbar">
        <div className="flex px-4 py-3 gap-6 items-center">
          <NavButtons isMobile />
        </div>
      </div>
    </nav>
  );
};