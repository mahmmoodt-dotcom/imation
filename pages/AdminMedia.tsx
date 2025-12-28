import React, { useState, useRef } from 'react';
import { useApp } from '../store/AppContext';

export const AdminMedia: React.FC = () => {
  const { lang } = useApp();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate Type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        alert("Invalid format! Only JPG, PNG and WebP are allowed.");
        return;
      }
      // Validate Size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("File too large! Maximum size is 2MB.");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadedUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();
      setUploadedUrl(data.url);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err: any) {
      alert(err.message || "Error uploading image. Please check your connection.");
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (url: string) => {
    const fullUrl = window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    alert("URL copied to clipboard!");
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-[3rem] border dark:border-gray-800 shadow-2xl overflow-hidden glass">
          <div className="p-8 md:p-14 space-y-10">
            
            <header className="flex items-center gap-5 border-b dark:border-gray-800 pb-8">
               <div className="w-14 h-14 bg-brand/10 text-brand rounded-[1.2rem] flex items-center justify-center shadow-inner">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
               </div>
               <div>
                 <h2 className="text-3xl font-black dark:text-white tracking-tighter">Asset Depot</h2>
                 <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Local Server Storage • JPG/PNG/WebP • 2MB</p>
               </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Left Column: Upload Controls */}
              <div className="space-y-8">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`aspect-square rounded-[2.5rem] border-4 border-dashed cursor-pointer flex flex-col items-center justify-center gap-5 transition-all group relative overflow-hidden ${previewUrl ? 'border-brand' : 'border-gray-100 dark:border-gray-800 hover:border-brand/40 bg-gray-50 dark:bg-gray-800/50'}`}
                >
                  {previewUrl ? (
                    <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <svg className="h-8 w-8 text-gray-300 group-hover:text-brand transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="font-black text-xs uppercase tracking-[0.15em] dark:text-white">Choose Content</p>
                        <p className="text-[9px] text-gray-400 font-bold mt-2">Maximum file weight: 2MB</p>
                      </div>
                    </>
                  )}
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/jpeg,image/png,image/webp" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                </div>

                <button 
                  disabled={!selectedFile || isUploading}
                  onClick={handleUpload}
                  className="w-full bg-brand text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-brand/20 hover:bg-brand-hover hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 disabled:translate-y-0"
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center gap-3">
                       <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                       <span>Transferring...</span>
                    </div>
                  ) : 'Upload to Cloud'}
                </button>
              </div>

              {/* Right Column: Results & History */}
              <div className="flex flex-col justify-center space-y-8">
                 {!uploadedUrl && !selectedFile && (
                   <div className="text-center p-12 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[2.5rem] text-gray-400/50">
                     <svg className="h-16 w-16 mx-auto mb-6 opacity-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                     <p className="text-[10px] font-black uppercase tracking-[0.2em]">Deployment area inactive</p>
                   </div>
                 )}

                 {uploadedUrl && (
                   <div className="space-y-6 animate-in zoom-in duration-500">
                      <div className="p-5 bg-green-500/10 dark:bg-green-500/5 border border-green-500/20 rounded-2xl flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                           <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <span className="text-[11px] font-black uppercase text-green-600 dark:text-green-500 tracking-widest">Asset Ready for Use</span>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-800/80 p-6 rounded-[2rem] border dark:border-gray-700 space-y-4">
                         <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest block px-1">Resource Address</label>
                         <div className="flex gap-3">
                           <input 
                             readOnly 
                             value={uploadedUrl} 
                             className="flex-1 bg-white dark:bg-gray-900 border dark:border-gray-700 p-4 rounded-xl text-xs font-mono text-gray-600 dark:text-gray-300 outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                           />
                           <button 
                             onClick={() => copyToClipboard(uploadedUrl)}
                             className="bg-brand text-white p-4 rounded-xl hover:bg-brand-hover active:scale-90 transition-all shadow-lg shadow-brand/20"
                             title="Copy to Clipboard"
                           >
                             <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                             </svg>
                           </button>
                         </div>
                      </div>

                      <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-[2.5rem] overflow-hidden border dark:border-gray-700 shadow-inner group relative">
                        <img src={uploadedUrl} className="w-full h-full object-contain p-4 transition-transform group-hover:scale-105" alt="Live Preview" />
                        <div className="absolute inset-0 bg-brand/5 pointer-events-none"></div>
                      </div>
                   </div>
                 )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};