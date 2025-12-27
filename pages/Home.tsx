import React from 'react';
import { useApp } from '../store/AppContext';
import { translations } from '../translations';
import { Product, Language } from '../types';

interface ProductCardProps {
  product: Product;
  lang: Language;
  onOpenProduct: (productId: string) => void;
  addToCart: (productId: string) => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, lang, onOpenProduct, addToCart, toggleWishlist, isWishlisted }) => {
  const effectivePrice = product.price - (product.discount || 0);
  return (
    <div 
      onClick={() => onOpenProduct(product.id)}
      className="bg-white dark:bg-gray-900 p-3 md:p-5 rounded-[2.5rem] shadow-sm border dark:border-gray-800 hover:shadow-xl transition-all group cursor-pointer flex flex-col h-full reveal relative overflow-hidden"
    >
      <button 
        onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
        className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-sm border dark:border-gray-700 text-gray-400 hover:text-brand transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isWishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
          <path className={isWishlisted ? 'text-brand' : ''} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      <div className="aspect-square rounded-2xl overflow-hidden mb-3 relative bg-gray-50 dark:bg-gray-800 flex items-center justify-center p-3">
        <img 
          src={product.images[0]} 
          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" 
          alt={product.name[lang]} 
        />
        {product.discount > 0 && (
          <div className="absolute bottom-2 left-2 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-lg shadow-lg">
            -${product.discount}
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1 px-1">
        <h4 className="font-black text-[13px] md:text-base mb-0.5 dark:text-white line-clamp-1 tracking-tight">{product.name[lang]}</h4>
        <p className="text-gray-400 dark:text-gray-500 text-[10px] line-clamp-1 mb-3 font-medium">
          {product.description[lang]}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2 border-t dark:border-gray-800">
          <span className="text-sm md:text-lg font-black text-brand tracking-tighter">${effectivePrice.toFixed(0)}</span>
          <button 
            onClick={(e) => { e.stopPropagation(); addToCart(product.id); }}
            className="bg-brand text-white p-2 rounded-xl transition-all shadow-md hover:scale-110"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export const Home: React.FC<{ onShopNow: (categoryId?: string) => void, onOpenProduct: (productId: string) => void }> = ({ onShopNow, onOpenProduct }) => {
  const { lang, products, categories, settings, addToCart, wishlist, toggleWishlist } = useApp();
  const t = translations;

  const latest = [...products].reverse().slice(0, 8);
  const bestSellers = products.slice(0, 4);

  return (
    <div className="space-y-24 pb-16 overflow-hidden">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 mt-8 reveal">
        <div className="rounded-[4rem] bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-950 p-8 md:p-20 flex flex-col md:flex-row items-center gap-12 min-h-[600px] border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-brand/5 dark:bg-brand/10 skew-x-12 transform origin-top-right -translate-y-24"></div>
          
          <div className="flex-1 space-y-8 relative z-10 text-center md:text-start">
            <span className="inline-block bg-brand/10 text-brand px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest animate-pulse">
              Innovation & Motion
            </span>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white leading-[1] tracking-tighter">
              {settings.aboutText[lang].split('.')[0]}.
            </h2>
            <p className="text-lg text-gray-500 font-medium max-w-xl">
              Discover the latest in high-end hardware, custom cooling, and professional workstations. Engineered for performance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button 
                onClick={() => onShopNow()}
                className="bg-brand text-white px-10 py-5 rounded-3xl font-black text-xl shadow-2xl shadow-brand/30 hover:bg-brand-hover hover:-translate-y-1 active:scale-95 transition-all"
              >
                {t.shop[lang]}
              </button>
              <button 
                onClick={() => onShopNow(categories[0]?.id)}
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border dark:border-gray-700 px-10 py-5 rounded-3xl font-black text-xl hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all"
              >
                {t.best_sellers[lang]}
              </button>
            </div>
          </div>

          <div className="flex-1 w-full flex justify-center items-center relative z-10 animate-fade-in-up">
            <div className="relative">
              <div className="absolute inset-0 bg-brand/20 blur-[120px] rounded-full scale-150"></div>
              <img 
                src={settings.homeFeatureImage || settings.floatingHeroImage} 
                alt="Feature Banner" 
                className="max-w-full h-auto object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.25)] animate-float"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 reveal">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-4xl font-black dark:text-white lowercase tracking-tighter">{t.categories[lang]}</h2>
            <div className="h-1.5 w-12 bg-brand rounded-full mt-2"></div>
          </div>
          <button onClick={() => onShopNow()} className="text-brand font-black text-sm uppercase tracking-widest hover:underline decoration-2">View All</button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.slice(0, 4).map((cat) => (
            <div 
              key={cat.id}
              onClick={() => onShopNow(cat.id)}
              className="group relative h-64 md:h-80 rounded-[3rem] overflow-hidden shadow-lg border-4 border-white dark:border-gray-900 cursor-pointer"
            >
              <img src={cat.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={cat.name[lang]} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-8">
                <h3 className="text-xl font-black text-white mb-1">{cat.name[lang]}</h3>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Explore Category</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Best Sellers (Horizontal Strip) */}
      <section className="bg-gray-100 dark:bg-gray-900/50 py-24 reveal">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black dark:text-white lowercase tracking-tighter">{t.best_sellers[lang]}</h2>
            <p className="text-gray-500 font-medium">Most loved hardware by our community.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                lang={lang} 
                onOpenProduct={onOpenProduct} 
                addToCart={addToCart}
                toggleWishlist={toggleWishlist}
                isWishlisted={wishlist.includes(product.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Recent Arrivals */}
      <section className="max-w-7xl mx-auto px-4 reveal">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-4xl font-black dark:text-white lowercase tracking-tighter">{t.recent_activity[lang]}</h2>
            <div className="h-1.5 w-12 bg-brand rounded-full mt-2"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {latest.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              lang={lang} 
              onOpenProduct={onOpenProduct} 
              addToCart={addToCart}
              toggleWishlist={toggleWishlist}
              isWishlisted={wishlist.includes(product.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};