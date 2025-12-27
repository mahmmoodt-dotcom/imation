import React from 'react';
import { useApp } from '../store/AppContext';
import { translations } from '../translations';

export const Wishlist: React.FC<{ onOpenProduct: (id: string) => void }> = ({ onOpenProduct }) => {
  const { wishlist, products, lang, toggleWishlist, addToCart } = useApp();
  const t = translations;

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-black text-brand mb-4 lowercase tracking-tighter">{t.wishlist[lang]}</h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Items you've saved for later.</p>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-300 mb-6">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
             </svg>
          </div>
          <p className="text-gray-400 font-black uppercase tracking-widest text-sm">{t.empty_wishlist[lang]}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistProducts.map(product => {
            const effectivePrice = product.price - (product.discount || 0);
            return (
              <div 
                key={product.id}
                onClick={() => onOpenProduct(product.id)}
                className="bg-white dark:bg-gray-900 p-5 rounded-[2.5rem] shadow-sm border dark:border-gray-800 hover:shadow-xl transition-all group cursor-pointer flex flex-col relative"
              >
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                  className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-sm border dark:border-gray-700 text-brand"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>

                <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-gray-50 dark:bg-gray-800 p-4">
                  <img src={product.images[0]} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110" />
                </div>
                
                <h4 className="font-black dark:text-white mb-1 line-clamp-1">{product.name[lang]}</h4>
                <p className="text-xs font-black text-brand mb-4">${effectivePrice.toFixed(0)}</p>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); addToCart(product.id); }}
                  className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white py-3 rounded-2xl font-black text-xs uppercase hover:bg-brand dark:hover:bg-brand dark:hover:text-white transition-all shadow-md active:scale-95"
                >
                  {t.add_to_cart[lang]}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};