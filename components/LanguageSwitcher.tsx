
import React from 'react';
import { useApp } from '../store/AppContext';
import { Language } from '../types';

export const LanguageSwitcher: React.FC = () => {
  const { lang, setLang } = useApp();

  const langs: { id: Language; label: string }[] = [
    { id: 'en', label: 'English' },
    { id: 'ckb', label: 'کوردی' },
    { id: 'ar', label: 'العربية' }
  ];

  return (
    <div className="flex space-x-2 rtl:space-x-reverse">
      {langs.map((l) => (
        <button
          key={l.id}
          onClick={() => setLang(l.id)}
          className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
            lang === l.id 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
};
