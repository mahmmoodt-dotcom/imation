
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { translations } from '../translations';
import { IRAQI_CITIES } from '../constants';
import { Order, CartItem, Product } from '../types';

export const Cart: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { cart, products, lang, updateCartQuantity, removeFromCart, addOrder, settings } = useApp();
  const t = translations;

  const [checkoutMode, setCheckoutMode] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    address: '', 
    phone: '', 
    secondaryPhone: '', 
    cityId: '' 
  });

  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    secondaryPhone: '',
    address: '',
    cityId: ''
  });

  const cartItems = cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    return { ...item, product };
  }).filter(item => item.product);

  const total = cartItems.reduce((sum, item) => {
    // Use fixed 'discount' amount instead of 'discountPercentage'
    const effectivePrice = item.product ? item.product.price - (item.product.discount || 0) : 0;
    return sum + effectivePrice * item.quantity;
  }, 0);

  const validateField = (name: string, value: string) => {
    let error = '';
    switch (name) {
      case 'name':
        const nameRegex = /^[\u0600-\u06FF\u0750-\u077Fa-zA-Z\s]+$/;
        if (!value.trim()) {
          error = lang === 'en' ? 'Full name is required' : 'ناوی تەواو پێویستە';
        } else if (!nameRegex.test(value)) {
          error = lang === 'en' ? 'Letters and spaces only' : 'تەنها پیت و بۆشایی';
        }
        break;
      case 'phone':
        const phoneRegex = /^07\d{9}$/;
        if (!value) {
          error = lang === 'en' ? 'Phone is required' : 'مۆبایل پێویستە';
        } else if (!phoneRegex.test(value)) {
          error = lang === 'en' ? '07XXXXXXXXX required' : '٠٧XXXXXXXXX پێویستە';
        }
        break;
      case 'address':
        if (!value.trim()) error = lang === 'en' ? 'Address required' : 'ناونیشان پێویستە';
        break;
      case 'cityId':
        if (!value) error = lang === 'en' ? 'Select city' : 'شار هەڵبژێرە';
        break;
    }
    return error;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let processedValue = value;
    if (name === 'phone' || name === 'secondaryPhone') {
      processedValue = value.replace(/\D/g, '').slice(0, 11);
    }
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    const error = validateField(name, processedValue);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = {
      name: validateField('name', formData.name),
      phone: validateField('phone', formData.phone),
      secondaryPhone: '',
      address: validateField('address', formData.address),
      cityId: validateField('cityId', formData.cityId),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(err => err !== '')) return;

    const cityObj = IRAQI_CITIES.find(c => c.id === formData.cityId);
    const order = await addOrder({
      customerName: formData.name,
      address: formData.address,
      phone: formData.phone,
      secondaryPhone: formData.secondaryPhone,
      city: cityObj ? cityObj.name[lang] : formData.cityId,
      items: cart,
      total
    });
    setLastOrder(order);
  };

  const handleNotifyWhatsApp = () => {
    if (!lastOrder) return;
    const shopPhone = settings.phones[0] || '9647700000000';
    const msg = `New Order from imation!
Order ID: ${lastOrder.id}
Customer: ${lastOrder.customerName}
Phone: ${lastOrder.phone}
Total: $${lastOrder.total.toFixed(0)}
Items: ${lastOrder.items.length}
Tracking: ${window.location.origin}/track?id=${lastOrder.id}`;
    window.open(`https://wa.me/${shopPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleDownloadReceipt = () => {
    if (!lastOrder) return;
    const trackingUrl = `${window.location.origin}/track?id=${lastOrder.id}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(trackingUrl)}`;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const rtl = (lastOrder.lang === 'ar' || lastOrder.lang === 'ckb') ? 'rtl' : 'ltr';

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${lastOrder.invoiceNumber}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #111; direction: ${rtl}; line-height: 1.5; }
            .receipt-card { border: 1px solid #eee; padding: 40px; border-radius: 20px; max-width: 800px; margin: auto; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e31b23; padding-bottom: 20px; margin-bottom: 30px; }
            .shop-logo h1 { color: #e31b23; margin: 0; font-size: 36px; font-weight: 900; letter-spacing: -2px; }
            .invoice-meta { text-align: ${rtl === 'rtl' ? 'left' : 'right'}; font-size: 14px; }
            .info-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { text-align: ${rtl === 'rtl' ? 'right' : 'left'}; padding: 12px; background: #fafafa; border-bottom: 2px solid #eee; font-size: 12px; text-transform: uppercase; color: #888; }
            td { padding: 12px; border-bottom: 1px solid #f5f5f5; font-size: 14px; }
            .total-box { background: #111; color: #fff; padding: 20px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; margin-top: 20px; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #eee; padding-top: 20px; }
            .qr-box { text-align: center; }
            .qr-box img { width: 100px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body onload="window.print()">
          <div class="receipt-card">
            <div class="header">
              <div class="shop-logo"><h1>imation</h1><p style="font-size:12px;color:#666">${settings.address}</p></div>
              <div class="invoice-meta">
                <p><strong>INVOICE:</strong> ${lastOrder.invoiceNumber}</p>
                <p><strong>DATE:</strong> ${new Date(lastOrder.date).toLocaleDateString()}</p>
              </div>
            </div>
            <div class="info-grid">
              <div><h4 style="margin:0 0 10px 0;text-transform:uppercase;color:#888;font-size:10px">BILL TO</h4><p><strong>${lastOrder.customerName}</strong></p><p>${lastOrder.phone}</p><p>${lastOrder.city}, ${lastOrder.address}</p></div>
              <div style="text-align:${rtl === 'rtl' ? 'left' : 'right'}"><h4 style="margin:0 0 10px 0;text-transform:uppercase;color:#888;font-size:10px">ORDER INFO</h4><p><strong>ID:</strong> ${lastOrder.id}</p><p><strong>Status:</strong> Pending Confirmation</p></div>
            </div>
            <table>
              <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th></tr></thead>
              <tbody>
                ${lastOrder.items.map(item => {
                  const p = products.find(pr => pr.id === item.productId);
                  // Use fixed 'discount' amount instead of 'discountPercentage'
                  const price = p ? p.price - (p.discount || 0) : 0;
                  return `<tr><td>${p?.name[lastOrder.lang]}</td><td style="text-align:center">${item.quantity}</td><td style="text-align:right">$${price.toFixed(0)}</td></tr>`;
                }).join('')}
              </tbody>
            </table>
            <div class="total-box"><span style="font-weight:900;font-size:12px">TOTAL AMOUNT</span><span style="font-size:24px;font-weight:900">$${lastOrder.total.toFixed(0)}</span></div>
            <div class="footer">
              <div style="font-size:10px;color:#888"><p>Payment: Cash on Delivery</p><p>Thank you for shopping at imation Computer Shop!</p></div>
              <div class="qr-box"><img src="${qrCodeUrl}"/><p style="font-size:8px;margin-top:5px;font-weight:bold">SCAN TO TRACK</p></div>
            </div>
          </div>
          <div class="no-print" style="text-align:center;margin-top:20px"><button onclick="window.print()" style="background:#e31b23;color:#fff;border:0;padding:12px 24px;border-radius:12px;font-weight:900;cursor:pointer">Save PDF</button></div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (lastOrder) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center animate-in fade-in zoom-in duration-700">
        <div className="mb-8 inline-flex items-center justify-center w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-4xl font-black mb-4 dark:text-white lowercase tracking-tighter">{t.thank_you[lang]}</h2>
        <p className="text-gray-500 mb-10">{t.order_placed_msg[lang]}</p>
        <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border dark:border-gray-800 shadow-xl mb-12 flex flex-col md:flex-row items-center justify-between gap-8 text-start">
          <div className="space-y-4">
             <div><span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{t.order_id[lang]}</span><p className="text-2xl font-mono font-black text-brand">{lastOrder.id}</p></div>
             <div><span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{t.invoice_no[lang]}</span><p className="text-xl font-bold dark:text-white">{lastOrder.invoiceNumber}</p></div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-3xl border dark:border-gray-700"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`${window.location.origin}/track?id=${lastOrder.id}`)}`} alt="QR" className="w-24 h-24" /></div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={handleDownloadReceipt} className="flex-1 sm:flex-none bg-brand text-white px-10 py-5 rounded-2xl font-black shadow-xl shadow-brand/20 hover:scale-105 transition-all flex items-center justify-center gap-2">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            Download Invoice
          </button>
          <button onClick={handleNotifyWhatsApp} className="flex-1 sm:flex-none bg-green-500 text-white px-10 py-5 rounded-2xl font-black shadow-xl shadow-green-500/20 hover:scale-105 transition-all flex items-center justify-center gap-2">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Notify via WhatsApp
          </button>
        </div>
        <button onClick={onComplete} className="mt-12 text-gray-500 hover:text-brand font-bold transition-colors">{lang === 'en' ? 'Back to Shop' : 'گەڕانەوە بۆ فرۆشگا'}</button>
      </div>
    );
  }

  if (cart.length === 0) return (
    <div className="max-w-2xl mx-auto py-20 text-center">
      <div className="mb-6 inline-block p-6 bg-brand/10 rounded-full text-brand"><svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg></div>
      <h2 className="text-2xl font-bold mb-4 dark:text-white">{t.empty_cart[lang]}</h2>
      <button onClick={onComplete} className="text-brand hover:underline font-semibold">{t.shop[lang]}</button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-8 dark:text-white">{checkoutMode ? t.checkout[lang] : t.cart[lang]}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {checkoutMode ? (
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border dark:border-gray-800 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t.full_name[lang]}</label>
                <input required name="name" className={`w-full p-4 rounded-2xl border dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-brand/20 outline-none dark:text-white transition-all ${errors.name ? 'border-red-500' : ''}`} value={formData.name} onChange={handleInputChange} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t.phone[lang]}</label>
                  <input required name="phone" maxLength={11} className={`w-full p-4 rounded-2xl border dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-brand/20 outline-none dark:text-white transition-all ${errors.phone ? 'border-red-500' : ''}`} value={formData.phone} onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t.secondary_phone[lang]} (opt)</label>
                  <input name="secondaryPhone" maxLength={11} className="w-full p-4 rounded-2xl border dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-brand/20 outline-none dark:text-white transition-all" value={formData.secondaryPhone} onChange={handleInputChange} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t.city[lang]}</label>
                <select required name="cityId" className="w-full p-4 rounded-2xl border dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-brand/20 outline-none dark:text-white transition-all cursor-pointer" value={formData.cityId} onChange={handleInputChange}>
                  <option value="">{t.select_city[lang]}</option>
                  {IRAQI_CITIES.map(city => <option key={city.id} value={city.id}>{city.name[lang]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t.address[lang]}</label>
                <textarea required name="address" rows={3} className="w-full p-4 rounded-2xl border dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-brand/20 outline-none dark:text-white transition-all" value={formData.address} onChange={handleInputChange} />
              </div>
              <button type="submit" className="w-full bg-brand text-white py-5 rounded-2xl font-black text-lg hover:bg-brand-hover shadow-xl shadow-brand/20 transition-all active:scale-[0.98]">{t.place_order[lang]}</button>
            </form>
          ) : (
            <div className="space-y-4">
              {cartItems.map(item => {
                // Use fixed 'discount' amount instead of 'discountPercentage'
                const effectivePrice = item.product ? item.product.price - (item.product.discount || 0) : 0;
                return (
                  <div key={item.productId} className="flex gap-4 p-5 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border dark:border-gray-800 items-center transition-all hover:border-brand/20">
                    <img src={item.product?.images[0]} alt={item.product?.name[lang]} className="w-20 h-20 rounded-2xl object-cover bg-gray-50 dark:bg-gray-800" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold dark:text-white truncate">{item.product?.name[lang]}</h4>
                      <p className="text-brand font-black text-lg">${effectivePrice.toFixed(0)}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-1.5 rounded-xl">
                      <button onClick={() => updateCartQuantity(item.productId, item.quantity - 1)} className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-gray-500 shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg></button>
                      <span className="w-6 text-center font-black dark:text-white">{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(item.productId, item.quantity + 1)} className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-gray-500 shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg></button>
                    </div>
                    <button onClick={() => removeFromCart(item.productId)} className="p-2.5 text-gray-400 hover:text-red-500 transition-all"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="h-fit space-y-6">
          <div className="bg-gray-900 dark:bg-black text-white p-8 rounded-3xl shadow-2xl border dark:border-gray-800">
            <h3 className="text-xl font-black mb-6 tracking-tight">Order Summary</h3>
            <div className="space-y-4 pb-6 border-b border-gray-700/50">
              <div className="flex justify-between text-gray-400 font-medium"><span>Subtotal</span><span>${total.toFixed(0)}</span></div>
              <div className="flex justify-between text-gray-400 font-medium"><span>Shipping</span><span className="text-green-500 font-bold uppercase tracking-wider text-xs bg-green-500/10 px-2 py-1 rounded-lg">FREE</span></div>
            </div>
            <div className="flex justify-between items-center py-6">
              <span className="text-xl font-bold">{t.total[lang]}</span>
              <span className="text-3xl font-black text-brand">${total.toFixed(0)}</span>
            </div>
            {!checkoutMode && <button onClick={() => setCheckoutMode(true)} className="w-full bg-brand py-5 rounded-2xl font-black text-lg hover:bg-brand-hover shadow-xl shadow-brand/20 transition-all active:scale-95">{t.checkout[lang]}</button>}
          </div>
        </div>
      </div>
    </div>
  );
};
