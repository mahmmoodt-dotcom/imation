
import React, { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { translations } from '../translations';

interface ProductDetailsProps {
  productId: string;
  onOpenProduct: (id: string) => void;
  onGoBack: () => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ productId, onOpenProduct, onGoBack }) => {
  const { products, categories, lang, addToCart } = useApp();
  const t = translations;

  const product = useMemo(() => products.find(p => p.id === productId), [products, productId]);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter(p => p.category === product.category && p.id !== product.id && p.availability)
      .slice(0, 4);
  }, [products, product]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center reveal">
        <h2 className="text-2xl font-bold dark:text-white">Product not found</h2>
        <button onClick={onGoBack} className="mt-4 text-brand font-bold hover:underline">Back to Shop</button>
      </div>
    );
  }

  const category = categories.find(c => c.id === product.category);
  const effectivePrice = product.price - (product.discount || 0);
  const displayImages = product.images && product.images.length > 0 ? product.images : ['https://via.placeholder.com/800x600?text=No+Image'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8 font-medium reveal">
        <button onClick={() => onGoBack()} className="hover:text-brand transition-colors">{t.shop[lang]}</button>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 rtl:rotate-180" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
        <span className="text-gray-500 dark:text-gray-300 truncate">{product.name[lang]}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start mb-24">
        <div className="space-y-4 reveal">
          <div 
            className={`bg-white dark:bg-gray-900 rounded-[3rem] overflow-hidden border dark:border-gray-800 shadow-xl cursor-zoom-in transition-all duration-500 relative ${isZoomed ? 'fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4' : 'aspect-square flex items-center justify-center'}`}
            onClick={() => setIsZoomed(!isZoomed)}
          >
            <img 
              src={displayImages[activeImageIdx]} 
              alt={product.name[lang]} 
              className={`object-contain transition-transform duration-700 ${!isZoomed ? 'h-full w-full p-8 hover:scale-105' : 'max-h-full max-w-full'}`}
            />
            {(product.discount || 0) > 0 && (
              <div className="absolute top-8 right-8 bg-red-600 text-white font-black px-4 py-2 rounded-full shadow-xl">
                -${product.discount} OFF
              </div>
            )}
          </div>
          
          {displayImages.length > 1 && (
            <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
              {displayImages.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${activeImageIdx === idx ? 'border-brand scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8 reveal">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-brand/10 text-brand px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                {category?.name[lang]}
              </span>
              {!product.availability && <span className="bg-gray-600 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">{t.unavailable[lang]}</span>}
            </div>
            <h1 className="text-4xl md:text-5xl font-black dark:text-white leading-tight mb-4 tracking-tighter">
              {product.name[lang]}
            </h1>
            <div className="flex items-baseline gap-4">
              {(product.discount || 0) > 0 ? (
                <>
                  <span className="text-4xl font-black text-red-600 tracking-tighter">${effectivePrice.toFixed(0)}</span>
                  <span className="text-xl text-gray-400 line-through font-medium tracking-tighter">${product.price}</span>
                </>
              ) : (
                <span className="text-4xl font-black text-brand tracking-tighter">${product.price}</span>
              )}
            </div>
          </div>

          <div className="space-y-4">
             <h3 className="text-lg font-bold dark:text-white border-b-2 border-brand/20 inline-block pb-1">{t.description[lang]}</h3>
             <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg font-medium whitespace-pre-wrap">
               {product.description[lang]}
             </p>
          </div>

          {product.specs && product.specs.length > 0 && (
            <div className="space-y-4 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border dark:border-gray-800">
               <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest">{t.specifications[lang]}</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {product.specs.map((spec, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-bold dark:text-gray-200">
                      <div className="w-1.5 h-1.5 bg-brand rounded-full"></div>
                      {spec}
                    </div>
                  ))}
               </div>
            </div>
          )}

          {product.availability && (
            <div className="pt-4 reveal">
              <button 
                onClick={() => addToCart(product.id)}
                className="w-full md:w-auto px-12 py-5 bg-brand text-white rounded-[2rem] font-black text-xl hover:bg-brand-hover shadow-2xl shadow-brand/20 transition-all transform active:scale-95 flex items-center justify-center gap-4"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {t.add_to_cart[lang]}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
