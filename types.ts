export type Language = 'en' | 'ckb' | 'ar';

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: { [key in Language]: string };
  description: { [key in Language]: string };
  price: number;
  discount: number; 
  category: string; 
  images: string[]; 
  availability: boolean; 
  specs: string[];
  reviews?: Review[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: { [key in Language]: string };
  description: { [key in Language]: string };
  image: string;
  productCount?: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
  priceAtPurchase: number;
}

export interface Order {
  id: string;
  invoiceNumber: string;
  customerName: string;
  address: string;
  phone: string;
  secondaryPhone?: string;
  city: string;
  items: CartItem[];
  total: number;
  date: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  lang: Language;
  shippingDriver?: string;
  createdAt: string;
}

export interface ShopSettings {
  aboutText: { [key in Language]: string };
  aboutImage: string;
  phones: string[];
  email: string;
  address: string;
  mapEmbed: string;
  floatingHeroImage: string;
  homeFeatureImage: string; 
  mainLogo: string;
  brandLogos: string[];
  socials: {
    whatsapp: string;
    instagram: string;
    facebook: string;
    tiktok: string;
  };
}

export interface TranslationDictionary {
  [key: string]: { [key in Language]: string };
}