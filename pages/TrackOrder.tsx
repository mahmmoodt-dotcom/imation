
import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { translations } from '../translations';
import { Order } from '../types';

export const TrackOrder: React.FC = () => {
  const { lang, trackOrder, products } = useApp();
  const t = translations;

  const [orderIdInput, setOrderIdInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) setOrderIdInput(id);
  }, []);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setHasSearched(false);
    const order = await trackOrder(orderIdInput.trim(), phoneInput.trim());
    setFoundOrder(order);
    setHasSearched(true);
    setIsSearching(false);
  };

  const getStatusProgress = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 25;
      case 'shipped': return 65;
      case 'delivered': return 100;
      default: return 0;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-brand mb-4 lowercase tracking-tighter">{t.track_order[lang]}</h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Verify your details to track order status.</p>
      </div>

      <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border dark:border-gray-800 shadow-xl mb-12">
        <form onSubmit={handleTrack} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input placeholder="Order ID" className="w-full p-4 rounded-2xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white" value={orderIdInput} onChange={e => setOrderIdInput(e.target.value)} required />
            <input placeholder="Phone" className="w-full p-4 rounded-2xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white" value={phoneInput} onChange={e => setPhoneInput(e.target.value)} required />
          </div>
          <button type="submit" disabled={isSearching} className="w-full bg-brand text-white px-10 py-4 rounded-2xl font-black shadow-lg disabled:opacity-50">
            {isSearching ? '...' : t.track[lang]}
          </button>
        </form>
        {hasSearched && !foundOrder && <div className="mt-8 text-center text-red-500 font-bold">{t.order_not_found[lang]}</div>}
      </div>

      {foundOrder && (
        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border dark:border-gray-800 shadow-xl animate-in zoom-in duration-500">
          <div className="mb-12">
             <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-brand transition-all duration-1000" style={{ width: `${getStatusProgress(foundOrder.status)}%` }}></div>
             </div>
             <div className="flex justify-between mt-4 text-[10px] font-black uppercase text-gray-400">
               <span>{t.pending[lang]}</span>
               <span>{t.shipped[lang]}</span>
               <span>{t.delivered[lang]}</span>
             </div>
          </div>
          <div className="space-y-4">
            {foundOrder.items.map((item, idx) => {
              const product = products.find(p => p.id === item.productId);
              return (
                <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border dark:border-gray-700">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-900 flex items-center justify-center p-1">
                    <img src={product?.images?.[0] || 'https://via.placeholder.com/100'} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold dark:text-white truncate text-sm">{product?.name[lang] || 'Product'}</p>
                    <p className="text-[10px] text-gray-400 font-black">QTY: {item.quantity}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="pt-6 mt-6 border-t dark:border-gray-800 flex justify-between items-center">
             <span className="text-gray-500 font-bold">{t.total[lang]}</span>
             <span className="text-2xl font-black text-brand">${foundOrder.total}</span>
          </div>
        </div>
      )}
    </div>
  );
};
