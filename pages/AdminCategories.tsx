
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { translations } from '../translations';

export const AdminCategories: React.FC = () => {
  const { categories, lang, addCategory, updateCategory, deleteCategory } = useApp();
  const t = translations;

  const [editing, setEditing] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = editing.id ? await updateCategory(editing) : await addCategory(editing);
    if (success) setEditing(null);
    else alert("Failed to save category");
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this category?")) return;
    const result = await deleteCategory(id);
    if (!result.success) alert(result.error);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-6 rounded-[2rem] border dark:border-gray-800 shadow-sm">
        <h3 className="text-xl font-black dark:text-white">Categories</h3>
        <button 
          onClick={() => setEditing({ name: { en: '', ckb: '', ar: '' }, description: { en: '', ckb: '', ar: '' } })}
          className="bg-brand text-white px-6 py-2 rounded-xl font-black text-sm"
        >
          Add New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border dark:border-gray-800 shadow-sm flex flex-col gap-4">
            <img src={cat.image} className="w-full h-32 object-cover rounded-2xl" />
            <h4 className="text-lg font-black dark:text-white">{cat.name[lang]}</h4>
            <div className="mt-auto flex gap-2">
              <button onClick={() => setEditing(cat)} className="flex-1 bg-gray-100 dark:bg-gray-800 py-2 rounded-xl font-bold">Edit</button>
              <button onClick={() => handleDelete(cat.id)} className="flex-1 bg-red-50 text-red-500 py-2 rounded-xl font-bold">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] w-full max-w-lg space-y-6">
            <h4 className="text-2xl font-black dark:text-white">{editing.id ? 'Edit' : 'Add'} Category</h4>
            
            <div className="space-y-4">
              {(['en', 'ckb', 'ar'] as const).map(l => (
                <div key={l}>
                  <label className="text-[10px] font-black uppercase text-gray-400">Name ({l})</label>
                  <input 
                    required 
                    className="w-full p-4 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white"
                    value={editing.name[l]}
                    onChange={e => setEditing({...editing, name: {...editing.name, [l]: e.target.value}})}
                  />
                </div>
              ))}
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400">Image</label>
                <input 
                  type="file" 
                  className="w-full p-2" 
                  onChange={e => setEditing({...editing, file: e.target.files?.[0]})}
                  required={!editing.id}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button type="submit" disabled={isSubmitting} className="flex-1 bg-brand text-white py-4 rounded-xl font-black">Save</button>
              <button type="button" onClick={() => setEditing(null)} className="flex-1 bg-gray-100 dark:bg-gray-800 py-4 rounded-xl font-black">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
