import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Settings, Download, Upload, User, UserCircle, Trash2  } from 'lucide-react';
import { useProfileStore } from '../store/useProfileStore';

export function SettingsMenu() {
  const { name, avatarUrl, updateProfile } = useProfileStore();
  const [localName, setLocalName] = useState(name);
  const [localAvatar, setLocalAvatar] = useState(avatarUrl);

  const handleSaveProfile = () => {
    updateProfile(localName, localAvatar);
    alert('Profile saved!');
  };

  const handleExport = () => {
    const data: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
       const key = localStorage.key(i);
       if (key) {
         data[key] = localStorage.getItem(key) || '';
       }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devdash-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (window.confirm('Importing data will overwrite your current progress. Are you sure?')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          localStorage.clear();
          Object.keys(data).forEach(key => {
             localStorage.setItem(key, data[key]);
          });
          alert('Data imported! Reloading...');
          window.location.reload();
        } catch (error) {
          alert('Failed to parse file.');
        }
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  const handleReset = () => {
    if (window.confirm('⚠️ WARNING: This will permanently delete ALL your data and reset DevDash to its initial state. Are you absolutely sure?')) {
      if (window.confirm('Please confirm one more time. This action CANNOT be undone!')) {
        localStorage.clear();
        alert('All data has been reset! Reloading...');
        window.location.reload();
      }
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="border-b border-slate-100 shrink-0 bg-slate-50/50">
        <div className="px-6 py-4 flex items-center gap-3">
          <Settings className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">System Settings</h2>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
        <div className="max-w-2xl gap-6 flex flex-col">
           {/* Profile Setting */}
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2 text-indigo-700">
               <UserCircle className="w-5 h-5" /> Profile Settings
             </h3>
             <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Display Name</label>
                  <input type="text" value={localName} onChange={e => setLocalName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Your Name" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Avatar URL</label>
                  <input type="text" value={localAvatar} onChange={e => setLocalAvatar(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="https://..." />
                </div>
                <div className="flex items-center gap-4 mt-2">
                   <div className="w-12 h-12 rounded-full bg-slate-200 border border-slate-300 overflow-hidden shrink-0">
                     <img src={localAvatar} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fallback')} />
                   </div>
                   <button onClick={handleSaveProfile} className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
                     Save Profile
                   </button>
                </div>
             </div>
             
           </motion.div>

           {/* Backup & Restore */}
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2 text-indigo-700">
                Data Management
             </h3>
             <p className="text-sm text-slate-500 mb-6">Backup all your DevDash data to a JSON file or restore from a previous backup.</p>
             <div className="flex flex-col sm:flex-row items-center gap-4">
                <button onClick={handleExport} className="w-full sm:w-auto px-5 py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 transition-colors flex items-center justify-center gap-2">
                   <Download className="w-4 h-4" />
                   Export Backup
                </button>
                <label className="w-full sm:w-auto px-5 py-3 bg-white text-slate-700 border border-slate-200 font-bold rounded-lg hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-center gap-2">
                   <Upload className="w-4 h-4" />
                   Import Backup
                   <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                </label>
             </div>
              <div className="mt-8 pt-6 border-t border-slate-100">
               <h4 className="text-xs font-bold text-red-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                 Danger Zone
               </h4>
               <p className="text-sm text-slate-500 mb-4">Permanently delete all your data and reset the application to its default state. This action cannot be undone.</p>
               <button onClick={handleReset} className="w-full sm:w-auto px-5 py-3 bg-red-50 text-red-600 font-bold border border-red-100 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Erase All Data
               </button>
             </div>
           </motion.div>
        </div>
      </div>
    </div>
  );
}
