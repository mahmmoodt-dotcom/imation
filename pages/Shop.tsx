
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { translations } from '../translations';

interface ShopProps {
  initialCategory?: string;
  onOpenProduct: (productId: string) => void;
}

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

export const Shop: React.FC<ShopProps> = ({ initialCategory = 'all', onOpenProduct }) => {
  const { products, categories, lang, addToCart } = useApp();
  const t = translations;

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [maxPrice, setMaxPrice] = useState(100000); 
  const [onlySale, setOnlySale] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('default');

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const name = p.name[lang] || p.name['en'] || '';
      const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const effectivePrice = p.price - (p.discount || 0);
      return matchesSearch && matchesCategory && effectivePrice <= maxPrice && (onlySale ? p.discount > 0 : true);
    });

    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => (a.price - a.discount) - (b.price - b.discount)); break;
      case 'price-desc': result.sort((a, b) => (b.price - b.discount) - (a.price - a.discount)); break;
      case 'name-asc': result.sort((a, b) => a.name[lang].localeCompare(b.name[lang])); break;
      case 'name-desc': result.sort((a, b) => b.name[lang].localeCompare(a.name[lang])); break;
    }
    return result;
  }, [products, search, selectedCategory, maxPrice, onlySale, sortBy, lang]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-64 space-y-8">
        <div>
          <h3 className="text-lg font-bold mb-4 dark:text-white uppercase tracking-tighter">{t.categories[lang]}</h3>
          <div className="flex md:flex-col overflow-x-auto no-scrollbar gap-2 pb-2">
            <button onClick={() => setSelectedCategory('all')} className={`whitespace-nowrap px-4 py-3 rounded-2xl transition-all font-black text-xs uppercase ${selectedCategory === 'all' ? 'bg-brand text-white' : 'text-gray-400 bg-white dark:bg-gray-900 border dark:border-gray-800'}`}>
              {t.all_categories[lang]}
            </button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`whitespace-nowrap px-4 py-3 rounded-2xl transition-all font-black text-xs uppercase ${selectedCategory === cat.id ? 'bg-brand text-white' : 'text-gray-400 bg-white dark:bg-gray-900 border dark:border-gray-800'}`}>
                {cat.name[lang]}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <main className="flex-1 space-y-6">
        <div className="relative group">
          <input type="text" placeholder={t.search[lang]} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-3xl border dark:border-gray-800 bg-white dark:bg-gray-900 focus:ring-4 focus:ring-brand/10 outline-none transition-all shadow-sm" />
          <svg className="h-6 w-6 absolute left-4 top-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-24 text-gray-400 font-bold">No items found.</div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
            {filteredProducts.map(product => (
              <div key={product.id} onClick={() => onOpenProduct(product.id)} className="bg-white dark:bg-gray-900 p-2 md:p-4 rounded-[2.5rem] shadow-sm border dark:border-gray-800 flex flex-col group relative reveal">
                <div className="aspect-square rounded-[2rem] overflow-hidden mb-3 bg-gray-50 dark:bg-gray-800 flex items-center justify-center p-4">
                  <img src={product.images[0] || 'https://via.placeholder.com/600'} alt={product.name[lang]} className="w-full h-full object-contain transition-transform group-hover:scale-105" />
                </div>
                <div className="flex-1 flex flex-col px-1.5 pb-2">
                  <h4 className="font-black text-[13px] md:text-xl mb-0.5 dark:text-white line-clamp-1 tracking-tight">{product.name[lang]}</h4>
                  <p className="text-gray-400 dark:text-gray-500 text-[9px] md:text-xs mb-3 line-clamp-1 font-medium">{product.description[lang]}</p>
                  <div className="flex items-center justify-between mt-auto pt-3 border-t dark:border-gray-800">
                    <span className="text-base md:text-2xl font-black text-brand tracking-tighter">${(product.price - product.discount).toFixed(0)}</span>
                    <button onClick={(e) => { e.stopPropagation(); addToCart(product.id); }} className="bg-brand text-white w-9 h-9 md:w-12 md:h-12 rounded-full hover:scale-110 active:scale-90 transition-all shadow-lg flex items-center justify-center">
                      <svg className="h-4 w-4 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
