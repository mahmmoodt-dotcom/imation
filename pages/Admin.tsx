
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { translations } from '../translations';
import { AdminProducts } from './AdminProducts';
import { AdminCategories } from './AdminCategories';
import { AdminSettings } from './AdminSettings';

export const Admin: React.FC = () => {
  const { 
    products, categories, orders, lang, isLoggedIn, login, logout 
  } = useApp();
  const t = translations;

  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'categories' | 'settings'>('dashboard');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !passwordInput) return;
    setIsSubmitting(true);
    setLoginError(false);
    const success = await login(passwordInput);
    if (!success) setLoginError(true);
    setIsSubmitting(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl border dark:border-gray-800">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-brand lowercase tracking-tighter mb-2">imation</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t.login[lang]}</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <input
              type="password"
              className={`w-full p-4 rounded-2xl border bg-white dark:bg-gray-800 dark:text-white outline-none focus:ring-2 ${loginError ? 'border-red-500' : 'dark:border-gray-700'}`}
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              placeholder="••••••••"
              autoFocus
            />
            {loginError && <p className="text-xs text-red-500 font-bold">{t.invalid_login[lang]}</p>}
            <button type="submit" disabled={isSubmitting} className="w-full bg-brand text-white py-4 rounded-2xl font-black shadow-lg">
              {isSubmitting ? '...' : t.login[lang]}
            </button>
          </form>
          <div className="mt-6 text-center">
             <a href="/" className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-brand transition-colors">Return to Store</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold dark:text-white">{t.admin_dashboard[lang]}</h2>
          <a href="/" className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-[10px] font-black uppercase text-gray-500 hover:bg-brand hover:text-white transition-all">View Store</a>
        </div>
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
          {(['dashboard', 'products', 'categories', 'settings'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-brand text-white shadow-lg' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
              {tab === 'dashboard' ? t.dashboard[lang] : t[`manage_${tab}` as keyof typeof t][lang]}
            </button>
          ))}
          <button onClick={logout} className="px-5 py-2 text-red-500 font-bold rounded-xl transition-all">Logout</button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-in fade-in duration-500">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border dark:border-gray-800 shadow-sm">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">{t.total_products[lang]}</p>
            <p className="text-4xl font-black dark:text-white tracking-tighter">{products.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border dark:border-gray-800 shadow-sm">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">{t.total_orders[lang]}</p>
            <p className="text-4xl font-black dark:text-white tracking-tighter">{orders.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border dark:border-gray-800 shadow-sm border-l-4 border-l-brand">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">{t.total_revenue[lang]}</p>
            <p className="text-4xl font-black dark:text-white tracking-tighter">${orders.reduce((acc, o) => acc + o.total, 0).toFixed(0)}</p>
          </div>
        </div>
      )}

      {activeTab === 'products' && <AdminProducts />}
      {activeTab === 'categories' && <AdminCategories />}
      {activeTab === 'settings' && <AdminSettings />}
    </div>
  );
};
