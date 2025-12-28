import React, { useState, useRef } from 'react';
import { useApp } from '../store/AppContext';
import { translations } from '../translations';
import { Product } from '../types';

export const AdminProducts: React.FC = () => {
  const { products, categories, lang, updateProduct, addProduct, bulkDeleteProducts, bulkUpdateDiscountAmount, bulkUpdateAvailability } = useApp();
  const t = translations;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [discountInput, setDiscountInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');

  const productImgRef = useRef<HTMLInputElement>(null);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = (filteredProducts: Product[]) => {
    if (selectedIds.length === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p.id));
    }
  };

  const handleBulkAction = async (action: 'delete' | 'availability' | 'discount') => {
    if (!selectedIds.length) return;
    setIsSubmitting(true);
    if (action === 'delete') {
      if (confirm(`Delete ${selectedIds.length} products?`)) await bulkDeleteProducts(selectedIds);
    } else if (action === 'availability') {
      await bulkUpdateAvailability(selectedIds, false);
    } else if (action === 'discount') {
      const amt = parseFloat(discountInput);
      if (!isNaN(amt)) await bulkUpdateDiscountAmount(selectedIds, amt);
    }
    setSelectedIds([]);
    setIsSubmitting(false);
  };

  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    setIsSubmitting(true);
    const success = editingProduct.id ? await updateProduct(editingProduct) : await addProduct(editingProduct);
    if (success) {
      setEditingProduct(null);
    } else {
      alert('Failed to save product. Ensure files are under 2MB and max 3 images.');
    }
    setIsSubmitting(false);
  };

  const handleImgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const existing = editingProduct.images?.length || 0;
    const staged = editingProduct.files?.length || 0;
    if (existing + staged + files.length > 3) return alert('Max 3 images allowed');
    
    // Preview Logic for UX
    const newFiles = [...(editingProduct.files || []), ...files];
    setEditingProduct({ ...editingProduct, files: newFiles });
  };

  const filtered = products.filter(p => {
    const name = p.name[lang] || p.name['en'] || '';
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = catFilter === 'all' || p.category === catFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-900 p-6 rounded-[2rem] border dark:border-gray-800 shadow-sm">
        <div className="flex flex-1 gap-4 w-full">
          <input className="flex-1 p-3 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="p-3 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name[lang]}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
           <button disabled={!selectedIds.length} onClick={() => handleBulkAction('delete')} className="p-3 bg-red-600 text-white rounded-xl disabled:opacity-50 font-bold text-xs uppercase transition-colors hover:bg-red-700">Delete</button>
           <button 
             onClick={() => setEditingProduct({ name: { en: '', ckb: '', ar: '' }, description: { en: '', ckb: '', ar: '' }, price: 0, discount: 0, availability: true, images: [], files: [], category: categories[0]?.id || '' })}
             className="px-6 py-3 bg-brand text-white rounded-xl font-black text-xs uppercase transition-all hover:bg-brand-hover shadow-lg shadow-brand/20"
           >
             Add Product
           </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-[2rem] border dark:border-gray-800 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-800 text-[10px] font-black uppercase text-gray-400">
            <tr>
              <th className="p-4"><input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={() => toggleSelectAll(filtered)} className="accent-brand" /></th>
              <th className="p-4">Product</th>
              <th className="p-4">Price / Discount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-800">
            {filtered.map(p => (
              <tr key={p.id} className={`${selectedIds.includes(p.id) ? 'bg-brand/5' : ''} hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors`}>
                <td className="p-4"><input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} className="accent-brand" /></td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={p.images[0] || 'https://via.placeholder.com/100'} className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-gray-800" />
                    <span className="font-bold dark:text-white truncate max-w-[150px]">{p.name[lang]}</span>
                  </div>
                </td>
                <td className="p-4">
                  <p className="font-black dark:text-white">${p.price}</p>
                  {p.discount > 0 && <p className="text-[10px] text-red-500 font-bold">-${p.discount} OFF</p>}
                </td>
                <td className="p-4"><span className={`text-[10px] font-black px-2 py-1 rounded-full ${p.availability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.availability ? 'IN STOCK' : 'OUT'}</span></td>
                <td className="p-4"><button onClick={() => setEditingProduct(p)} className="text-brand font-black text-xs uppercase underline hover:text-brand-hover">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingProduct && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl border dark:border-gray-800">
            <button onClick={() => setEditingProduct(null)} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors"><svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
            <h3 className="text-2xl font-black mb-6 dark:text-white tracking-tighter">Product Configuration</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['en', 'ckb', 'ar'] as const).map(l => (
                  <div key={l}>
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1.5 block">Name ({l})</label>
                    <input className="w-full p-3 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-brand/20 outline-none" value={editingProduct.name[l]} onChange={e => setEditingProduct({...editingProduct, name: {...editingProduct.name, [l]: e.target.value}})} />
                  </div>
                ))}
              </div>

              {(['en', 'ckb', 'ar'] as const).map(l => (
                <div key={l}>
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1.5 block">Description ({l})</label>
                  <textarea rows={2} className="w-full p-3 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-brand/20 outline-none" value={editingProduct.description[l]} onChange={e => setEditingProduct({...editingProduct, description: {...editingProduct.description, [l]: e.target.value}})} />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1.5 block">Price ($)</label>
                  <input type="number" className="w-full p-3 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-brand/20 outline-none" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1.5 block">Discount ($)</label>
                  <input type="number" className="w-full p-3 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-brand/20 outline-none" value={editingProduct.discount} onChange={e => setEditingProduct({...editingProduct, discount: parseFloat(e.target.value)})} />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1.5 block">Category</label>
                <select className="w-full p-3 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white text-sm outline-none cursor-pointer" value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name[lang]}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1.5 block">Gallery (Max 3 Images - 2MB Limit)</label>
                <div className="grid grid-cols-4 gap-3">
                   {editingProduct.images?.map((img: string, i: number) => (
                     <div key={i} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden border dark:border-gray-700 relative group">
                       <img src={img} className="w-full h-full object-cover" />
                       <button onClick={() => setEditingProduct({...editingProduct, images: editingProduct.images.filter((_:any, idx:number) => idx !== i)})} className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold text-[10px] uppercase">Remove</button>
                     </div>
                   ))}
                   {editingProduct.files?.map((file: File, i: number) => (
                     <div key={`staged-${i}`} className="aspect-square bg-blue-50 dark:bg-blue-900/20 rounded-2xl overflow-hidden border-2 border-dashed border-blue-300 flex items-center justify-center relative">
                        <span className="text-[8px] font-black uppercase text-blue-500">Staged</span>
                     </div>
                   ))}
                   {(editingProduct.images?.length || 0) + (editingProduct.files?.length || 0) < 3 && (
                     <button onClick={() => productImgRef.current?.click()} className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex items-center justify-center text-gray-400 hover:text-brand hover:border-brand transition-all">+</button>
                   )}
                </div>
                <input ref={productImgRef} type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImgUpload} />
              </div>

              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <input type="checkbox" id="avail-check" checked={editingProduct.availability} onChange={e => setEditingProduct({...editingProduct, availability: e.target.checked})} className="accent-brand" />
                <label htmlFor="avail-check" className="text-xs font-black uppercase dark:text-white cursor-pointer select-none">Mark as In-Stock</label>
              </div>
            </div>

            <div className="mt-10 flex gap-4">
              <button onClick={handleSaveProduct} disabled={isSubmitting} className="flex-2 bg-brand text-white py-4 px-10 rounded-2xl font-black shadow-xl shadow-brand/20 hover:bg-brand-hover transition-all disabled:opacity-50">{isSubmitting ? 'Syncing...' : 'Push Changes'}</button>
              <button onClick={() => setEditingProduct(null)} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-500 py-4 rounded-2xl font-black transition-colors hover:bg-gray-200 dark:hover:bg-gray-700">Dismiss</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};