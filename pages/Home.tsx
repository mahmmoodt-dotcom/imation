
import React from 'react';
import { useApp } from '../store/AppContext';
import { translations } from '../translations';
import { Product, Language } from '../types';

// Fix for key prop error: Defined ProductCard outside and used React.FC with proper props interface.
// This ensures 'key' is handled correctly by React and TypeScript.
interface ProductCardProps {
  product: Product;
  lang: Language;
  onOpenProduct: (productId: string) => void;
  addToCart: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, lang, onOpenProduct, addToCart }) => {
  const effectivePrice = product.price - (product.discount || 0);
  return (
    <div 
      onClick={() => onOpenProduct(product.id)}
      className="bg-white dark:bg-gray-900 p-3 md:p-5 rounded-[2rem] shadow-sm border dark:border-gray-800 hover:shadow-xl transition-all group cursor-pointer flex flex-col h-full reveal"
    >
      <div className="aspect-square rounded-2xl overflow-hidden mb-3 relative bg-gray-50 dark:bg-gray-800 flex items-center justify-center p-3">
        <img 
          src={product.images[0]} 
          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" 
          alt={product.name[lang]} 
        />
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
            className="bg-brand text-white p-2 rounded-xl transition-all shadow-md"
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
  const { lang, products, categories, settings, addToCart } = useApp();
  const t = translations;

  const featured = [...products].reverse().slice(0, 8);
  const discountedProducts = products.filter(p => p.discount > 0).slice(0, 8);

  return (
    <div className="space-y-12 pb-16 overflow-hidden">
      <section className="max-w-7xl mx-auto px-4 mt-8 reveal">
        <div className="rounded-[3rem] bg-gradient-to-br from-blue-50/50 via-white/50 to-transparent dark:from-blue-900/10 dark:via-gray-900/50 p-8 md:p-20 flex flex-col md:flex-row items-center gap-12 min-h-[500px] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden text-center md:text-start">
          <div className="flex-1 w-full flex justify-center items-center order-2 md:order-1 animate-fade-in-up">
            <img 
              src={settings.homeFeatureImage || settings.floatingHeroImage} 
              alt="Feature Banner" 
              className="max-w-full h-auto object-contain drop-shadow-2xl animate-float"
            />
          </div>
          <div className="flex-1 space-y-6 order-1 md:order-2">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-[1.1] tracking-tight">
              {settings.aboutText[lang].split('.')[0]}.
            </h2>
            <button 
              onClick={() => onShopNow()}
              className="inline-flex items-center justify-center gap-4 bg-brand text-white px-8 py-4 rounded-2xl font-black text-xl shadow-xl shadow-brand/20 hover:bg-brand-hover active:scale-95 transition-all"
            >
              {t.shop[lang]}
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 reveal">
        <h2 className="text-3xl font-black dark:text-white lowercase tracking-tighter mb-8">{t.categories[lang]}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.slice(0, 8).map((cat) => (
            <div 
              key={cat.id}
              onClick={() => onShopNow(cat.id)}
              className="group relative h-40 md:h-56 rounded-[2rem] overflow-hidden shadow-lg border dark:border-gray-800 cursor-pointer"
            >
              <img src={cat.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={cat.name[lang]} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-5">
                <h3 className="text-sm md:text-lg font-black text-white">{cat.name[lang]}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 reveal">
        <h2 className="text-3xl font-black dark:text-white lowercase tracking-tighter mb-8">{t.recent_activity[lang]}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {featured.map(product => (
            <ProductCard key={product.id} product={product} lang={lang} onOpenProduct={onOpenProduct} addToCart={addToCart} />
          ))}
        </div>
      </section>

      {discountedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 reveal">
          <h2 className="text-3xl font-black dark:text-white lowercase tracking-tighter mb-8">{t.discounts[lang]}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {discountedProducts.map(p => (
              <ProductCard key={p.id} product={p} lang={lang} onOpenProduct={onOpenProduct} addToCart={addToCart} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
