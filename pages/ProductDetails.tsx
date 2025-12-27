import React, { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { translations } from '../translations';
import { Product, Language } from '../types';

interface ProductDetailsProps {
  productId: string;
  onOpenProduct: (id: string) => void;
  onGoBack: () => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ productId, onOpenProduct, onGoBack }) => {
  const { products, categories, lang, addToCart, wishlist, toggleWishlist } = useApp();
  const t = translations;

  const product = useMemo(() => products.find(p => p.id === productId), [products, productId]);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const isWishlisted = wishlist.includes(productId);

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

  // Mock reviews if not present
  const reviews = product.reviews || [
    { id: '1', userName: 'Ahmed K.', rating: 5, comment: 'Exceptional performance. Exceeded expectations!', date: '2025-05-12' },
    { id: '2', userName: 'Sara M.', rating: 4, comment: 'Great quality but cooling could be quieter.', date: '2025-06-01' }
  ];

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
        {/* Gallery */}
        <div className="space-y-4 reveal">
          <div 
            className={`bg-white dark:bg-gray-900 rounded-[3rem] overflow-hidden border dark:border-gray-800 shadow-xl cursor-zoom-in transition-all duration-500 relative ${isZoomed ? 'fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4' : 'aspect-square flex items-center justify-center'}`}
            onClick={() => setIsZoomed(!isZoomed)}
          >
            <img 
              src={displayImages[activeImageIdx]} 
              alt={product.name[lang]} 
              className={`object-contain transition-transform duration-700 ${!isZoomed ? 'h-full w-full p-8 hover:scale-105' : 'max-h-full max-w-full'}`}
            />
            <div className="absolute top-8 left-8 flex flex-col gap-2">
               {(product.discount || 0) > 0 && (
                <div className="bg-red-600 text-white font-black px-4 py-2 rounded-2xl shadow-xl text-xs uppercase">
                  -${product.discount} OFF
                </div>
               )}
               <div className="bg-brand text-white px-4 py-2 rounded-2xl shadow-xl text-[10px] font-black uppercase tracking-widest">
                  Official Store
               </div>
            </div>
            
            <button 
              onClick={(e) => { e.stopPropagation(); toggleWishlist(productId); }}
              className="absolute top-8 right-8 w-14 h-14 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-xl border dark:border-gray-700 text-gray-400 hover:text-brand transition-all active:scale-90"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isWishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path className={isWishlisted ? 'text-brand' : ''} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
          
          {displayImages.length > 1 && (
            <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
              {displayImages.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-24 h-24 rounded-3xl overflow-hidden border-4 shrink-0 transition-all ${activeImageIdx === idx ? 'border-brand scale-105 shadow-lg' : 'border-white dark:border-gray-900 opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-10 reveal">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="bg-brand/10 text-brand px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                {category?.name[lang]}
              </span>
              {!product.availability && <span className="bg-gray-600 text-white px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">{t.unavailable[lang]}</span>}
              <div className="flex items-center gap-1 text-yellow-400">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                <span className="text-xs font-black dark:text-white">4.8 (24)</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black dark:text-white leading-[1] mb-4 tracking-tighter">
              {product.name[lang]}
            </h1>
            
            <div className="flex items-baseline gap-4">
              {(product.discount || 0) > 0 ? (
                <>
                  <span className="text-5xl font-black text-brand tracking-tighter">${effectivePrice.toFixed(0)}</span>
                  <span className="text-2xl text-gray-400 line-through font-medium tracking-tighter">${product.price}</span>
                </>
              ) : (
                <span className="text-5xl font-black text-brand tracking-tighter">${product.price}</span>
              )}
            </div>
          </div>

          <div className="space-y-4">
             <h3 className="text-lg font-black dark:text-white border-b-4 border-brand/20 inline-block pb-1 lowercase tracking-tight">{t.description[lang]}</h3>
             <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg font-medium whitespace-pre-wrap">
               {product.description[lang]}
             </p>
          </div>

          {/* Specs Table */}
          {product.specs && product.specs.length > 0 && (
            <div className="space-y-6">
               <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest">{t.specifications[lang]}</h3>
               <div className="bg-gray-50 dark:bg-gray-900 rounded-[2.5rem] border dark:border-gray-800 p-8">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                    {product.specs.map((spec, i) => (
                      <div key={i} className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Detail 0{i+1}</span>
                        <div className="flex items-center gap-3 text-sm font-bold dark:text-gray-200">
                          <div className="w-2 h-2 bg-brand rounded-full"></div>
                          {spec}
                        </div>
                      </div>
                    ))}
                 </div>
               </div>
            </div>
          )}

          {product.availability ? (
            <div className="pt-6 reveal flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => addToCart(product.id)}
                className="flex-1 px-12 py-6 bg-brand text-white rounded-[2.5rem] font-black text-xl hover:bg-brand-hover shadow-2xl shadow-brand/30 transition-all transform active:scale-95 flex items-center justify-center gap-4"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {t.add_to_cart[lang]}
              </button>
            </div>
          ) : (
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-[2.5rem] text-center text-gray-400 font-black uppercase tracking-widest border border-dashed border-gray-300 dark:border-gray-700">
               {t.unavailable[lang]}
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <section className="reveal mt-32 border-t dark:border-gray-800 pt-24 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
          <div className="text-center md:text-start">
            <h2 className="text-4xl font-black dark:text-white lowercase tracking-tighter">{t.reviews[lang]}</h2>
            <div className="flex items-center justify-center md:justify-start gap-1 text-yellow-400 mt-2">
              {[1,2,3,4,5].map(s => <svg key={s} className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3-.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
              <span className="text-gray-500 font-bold ml-2">4.8 out of 5</span>
            </div>
          </div>
          <button className="bg-white dark:bg-gray-900 border-2 border-brand text-brand px-10 py-4 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-brand hover:text-white transition-all shadow-lg">
            {t.write_review[lang]}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {reviews.map(review => (
             <div key={review.id} className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] shadow-sm border dark:border-gray-800 space-y-4 hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black dark:text-white text-lg">{review.userName}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Verified Purchase • {review.date}</p>
                  </div>
                  <div className="flex text-yellow-400">
                    {Array.from({length: review.rating}).map((_, i) => <svg key={i} className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3-.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed italic">
                  "{review.comment}"
                </p>
             </div>
           ))}
        </div>
      </section>
    </div>
  );
};