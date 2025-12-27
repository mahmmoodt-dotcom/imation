import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category, CartItem, Order, Language, ShopSettings } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '../constants';

type Theme = 'light' | 'dark';
const API_BASE = '/api';

const DEFAULT_SETTINGS: ShopSettings = {
  aboutText: { en: 'Premium computing solutions.', ckb: 'چارەسەری کۆمپیوتەری بەهێز.', ar: 'حلول الحوسبة الراقية.' },
  aboutImage: '',
  phones: [''],
  email: '',
  address: '',
  mapEmbed: '',
  floatingHeroImage: '',
  homeFeatureImage: '',
  mainLogo: '', 
  brandLogos: [],
  socials: { whatsapp: '', instagram: '', facebook: '', tiktok: '' }
};

interface AppContextType {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  orders: Order[];
  settings: ShopSettings;
  lang: Language;
  theme: Theme;
  isLoggedIn: boolean;
  isLoading: boolean;
  setLang: (lang: Language) => void;
  toggleTheme: () => void;
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  addOrder: (order: any) => Promise<Order | null>;
  trackOrder: (id: string, phone: string) => Promise<Order | null>;
  updateProduct: (product: Product) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<void>;
  addProduct: (product: any) => Promise<boolean>;
  bulkDeleteProducts: (ids: string[]) => Promise<void>;
  bulkUpdateDiscountAmount: (ids: string[], discountAmount: number) => Promise<void>;
  bulkUpdateAvailability: (ids: string[], availability: boolean) => Promise<void>;
  updateCategory: (category: any) => Promise<boolean>;
  addCategory: (category: any) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<{ success: boolean; error?: string }>;
  updateOrderStatus: (orderId: string, status: Order['status'], driver?: string) => Promise<void>;
  updateOrder: (order: Order) => Promise<void>;
  updateSettings: (settings: ShopSettings) => Promise<void>;
  updateAboutSettings: (settings: Partial<ShopSettings>) => Promise<void>;
  updateHomeFeatureImage: (file: File) => Promise<void>;
  updateAboutImage: (file: File) => Promise<void>;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  refreshProducts: () => Promise<void>;
  refreshCategories: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<ShopSettings>(DEFAULT_SETTINGS);
  const [lang, setLangState] = useState<Language>(() => (localStorage.getItem('lang') as Language) || 'en');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('adminToken'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('lang', lang);
    localStorage.setItem('theme', theme);
    document.documentElement.dir = (lang === 'ar' || lang === 'ckb') ? 'rtl' : 'ltr';
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [cart, lang, theme]);

  const safeFetchJson = async (url: string, options?: RequestInit) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) return { isError: true, status: response.status };
      return await response.json();
    } catch (e: any) {
      return { isError: true, error: e.message };
    }
  };

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
  });

  const refreshProducts = async () => {
    const pData = await safeFetchJson(`${API_BASE}/products`);
    if (Array.isArray(pData)) setProducts(pData);
  };

  const refreshCategories = async () => {
    const cData = await safeFetchJson(`${API_BASE}/categories`);
    if (Array.isArray(cData)) setCategories(cData);
  };

  const refreshOrders = async () => {
    if (!isLoggedIn) return;
    const oData = await safeFetchJson(`${API_BASE}/admin/orders`, { headers: getAuthHeaders() });
    if (Array.isArray(oData)) setOrders(oData);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([refreshProducts(), refreshCategories()]);
      const sData = await safeFetchJson(`${API_BASE}/settings`);
      if (sData && !sData.isError) setSettings(sData);
      if (isLoggedIn) await refreshOrders();
      setIsLoading(false);
    };
    fetchData();
  }, [isLoggedIn]);

  const login = async (password: string) => {
    const data = await safeFetchJson(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (data && data.token) {
      localStorage.setItem('adminToken', data.token);
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
    setOrders([]);
  };

  const addToCart = (pId: string) => {
    const prod = products.find(p => p.id === pId);
    if (!prod || !prod.availability) return;
    setCart(prev => {
      const exists = prev.find(i => i.productId === pId);
      if (exists) return prev.map(i => i.productId === pId ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { productId: pId, quantity: 1, priceAtPurchase: prod.price - (prod.discount || 0) }];
    });
  };

  const removeFromCart = (productId: string) => setCart(prev => prev.filter(item => item.productId !== productId));
  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(productId); return; }
    setCart(prev => prev.map(item => item.productId === productId ? { ...item, quantity } : item));
  };
  const clearCart = () => setCart([]);

  const addOrder = async (orderData: any) => {
    const response = await safeFetchJson(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...orderData, lang })
    });
    if (response && !response.isError) {
      setCart([]);
      return response;
    }
    return null;
  };

  const trackOrder = async (id: string, phone: string) => {
    const data = await safeFetchJson(`${API_BASE}/orders/track?id=${id}&phone=${phone}`);
    if (data && !data.isError) return data;
    return null;
  };

  const addProduct = async (p: any) => {
    const formData = new FormData();
    formData.append('name_en', p.name.en); formData.append('name_ku', p.name.ckb); formData.append('name_ar', p.name.ar);
    formData.append('description_en', p.description.en); formData.append('description_ku', p.description.ckb); formData.append('description_ar', p.description.ar);
    formData.append('price', p.price.toString()); formData.append('discount', (p.discount || 0).toString());
    formData.append('category_id', p.category || ''); formData.append('availability', p.availability ? 'true' : 'false');
    if (p.files) p.files.forEach((file: File) => formData.append('images', file));
    const res = await fetch(`${API_BASE}/admin/products`, { method: 'POST', headers: getAuthHeaders(), body: formData });
    if (res.ok) { await refreshProducts(); return true; }
    return false;
  };

  const updateProduct = async (p: any) => {
    const formData = new FormData();
    formData.append('name_en', p.name.en); formData.append('name_ku', p.name.ckb); formData.append('name_ar', p.name.ar);
    formData.append('description_en', p.description.en); formData.append('description_ku', p.description.ckb); formData.append('description_ar', p.description.ar);
    formData.append('price', p.price.toString()); formData.append('discount', (p.discount || 0).toString());
    formData.append('category_id', p.category || ''); formData.append('availability', p.availability ? 'true' : 'false');
    formData.append('existingImages', JSON.stringify(p.images || []));
    if (p.files) p.files.forEach((file: File) => formData.append('images', file));
    const res = await fetch(`${API_BASE}/products/${p.id}`, { method: 'PUT', headers: getAuthHeaders(), body: formData });
    if (res.ok) { await refreshProducts(); return true; }
    return false;
  };

  const deleteProduct = async (id: string) => { await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE', headers: getAuthHeaders() }); await refreshProducts(); };
  const bulkDeleteProducts = async (ids: string[]) => { await safeFetchJson(`${API_BASE}/admin/products/bulk`, { method: 'DELETE', headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) }); await refreshProducts(); };
  const bulkUpdateDiscountAmount = async (ids: string[], discount: number) => { await safeFetchJson(`${API_BASE}/admin/products/bulk/discount`, { method: 'PUT', headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ ids, discount }) }); await refreshProducts(); };
  const bulkUpdateAvailability = async (ids: string[], availability: boolean) => { await safeFetchJson(`${API_BASE}/admin/products/bulk/availability`, { method: 'PUT', headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ ids, availability }) }); await refreshProducts(); };
  const addCategory = async (cat: any) => { const f = new FormData(); f.append('name_en', cat.name.en); f.append('name_ku', cat.name.ckb); f.append('name_ar', cat.name.ar); if (cat.file) f.append('image', cat.file); const res = await fetch(`${API_BASE}/admin/categories`, { method: 'POST', headers: getAuthHeaders(), body: f }); if (res.ok) { await refreshCategories(); return true; } return false; };
  const updateCategory = async (cat: any) => { const f = new FormData(); f.append('name_en', cat.name.en); f.append('name_ku', cat.name.ckb); f.append('name_ar', cat.name.ar); if (cat.file) f.append('image', cat.file); const res = await fetch(`${API_BASE}/admin/categories/${cat.id}`, { method: 'PUT', headers: getAuthHeaders(), body: f }); if (res.ok) { await refreshCategories(); return true; } return false; };
  const deleteCategory = async (id: string) => { const res = await safeFetchJson(`${API_BASE}/admin/categories/${id}`, { method: 'DELETE', headers: getAuthHeaders() }); if (res && res.success) { await refreshCategories(); return { success: true }; } return { success: false }; };
  const updateOrderStatus = async (oId: string, s: any, d?: string) => { await safeFetchJson(`${API_BASE}/orders/${oId}`, { method: 'PUT', headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ status: s, shipping_driver: d }) }); await refreshOrders(); };
  const updateOrder = async (u: Order) => { await safeFetchJson(`${API_BASE}/orders/${u.id}`, { method: 'PUT', headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(u) }); await refreshOrders(); };
  const updateSettings = async (s: ShopSettings) => { await safeFetchJson(`${API_BASE}/settings`, { method: 'PUT', headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(s) }); setSettings(s); };
  const updateAboutSettings = async (s: Partial<ShopSettings>) => { await safeFetchJson(`${API_BASE}/settings`, { method: 'PUT', headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ ...settings, ...s }) }); setSettings(prev => ({ ...prev, ...s })); };
  const updateHomeFeatureImage = async (file: File) => { const f = new FormData(); f.append('image', file); const res = await fetch(`${API_BASE}/admin/settings/home_feature_image`, { method: 'PUT', headers: getAuthHeaders(), body: f }); if (res.ok) { const d = await res.json(); setSettings(prev => ({ ...prev, homeFeatureImage: d.image })); } };
  const updateAboutImage = async (file: File) => { const f = new FormData(); f.append('image', file); const res = await fetch(`${API_BASE}/admin/settings/about_image`, { method: 'PUT', headers: getAuthHeaders(), body: f }); if (res.ok) { const d = await res.json(); setSettings(prev => ({ ...prev, aboutImage: d.image })); } };

  return (
    <AppContext.Provider value={{
      products, categories, cart, orders, settings, lang, theme, isLoggedIn, isLoading,
      setLang: setLangState, toggleTheme: () => setTheme(t => t === 'light' ? 'dark' : 'light'),
      addToCart, removeFromCart, updateCartQuantity, clearCart,
      addOrder, trackOrder, updateProduct, deleteProduct, addProduct, bulkDeleteProducts, bulkUpdateDiscountAmount, bulkUpdateAvailability,
      updateCategory, addCategory, deleteCategory, updateOrderStatus, updateOrder, updateSettings, updateAboutSettings, updateHomeFeatureImage, updateAboutImage,
      login, logout, refreshProducts, refreshCategories
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const c = useContext(AppContext);
  if (!c) throw new Error("useApp error");
  return c;
};