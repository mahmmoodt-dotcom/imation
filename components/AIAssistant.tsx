
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { getHardwareAdvice } from '../services/gemini';

export const AIAssistant: React.FC = () => {
  const { products, lang } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    const aiResponse = await getHardwareAdvice(userMsg, products, lang);
    
    setMessages(prev => [...prev, { role: 'ai', text: aiResponse || '' }]);
    setIsTyping(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[60] w-14 h-14 bg-brand text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <span className="absolute right-16 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border dark:border-gray-700">
          Ask AI Advisor
        </span>
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[60] w-[350px] sm:w-[400px] h-[500px] bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border dark:border-gray-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-6 bg-brand text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-tight">AI Advisor</h3>
                <p className="text-[10px] opacity-70 font-bold uppercase">Online & Expert</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform p-1">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 no-scrollbar bg-gray-50/50 dark:bg-gray-900/50">
            {messages.length === 0 && (
              <div className="text-center py-10 opacity-40">
                <p className="text-xs font-black uppercase tracking-widest">Ask me anything about our hardware!</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium ${
                  m.role === 'user' 
                    ? 'bg-brand text-white rounded-tr-none' 
                    : 'bg-white dark:bg-gray-800 dark:text-white shadow-sm border dark:border-gray-700 rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl rounded-tl-none shadow-sm border dark:border-gray-700">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white dark:bg-gray-900 border-t dark:border-gray-800">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="What computer should I buy for..." 
                className="flex-1 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/20 outline-none dark:text-white"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                className="bg-brand text-white p-3 rounded-2xl hover:bg-brand-hover transition-colors shadow-lg"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
