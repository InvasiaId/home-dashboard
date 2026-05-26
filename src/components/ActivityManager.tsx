import React, { useState } from 'react';
import { useRPGStore, ActivityTemplate, StatType } from '../store/useRPGStore';
import { motion } from 'motion/react';
import { PenSquare, Trash2, Plus, X, Search } from 'lucide-react';

export function ActivityManager() {
  const templates = useRPGStore(state => state.activityTemplates);
  const addTemplate = useRPGStore(state => state.addTemplate);
  const updateTemplate = useRPGStore(state => state.updateTemplate);
  const deleteTemplate = useRPGStore(state => state.deleteTemplate);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [stats, setStats] = useState<StatType[]>([]);
  const [search, setSearch] = useState('');
  const [filterStat, setFilterStat] = useState<StatType | 'ALL'>('ALL');

  const allStats: StatType[] = ['STR', 'INT', 'AGI', 'END', 'CHA', 'WIS'];

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setName('');
    setStats([]);
  };

  const handleEdit = (t: ActivityTemplate) => {
    setEditingId(t.id);
    setName(t.name);
    setStats([...t.stats]);
    setIsAdding(false);
  };

  const handleSave = () => {
    if (!name.trim() || stats.length === 0) return;
    
    if (editingId) {
      updateTemplate(editingId, { name, stats });
    } else {
      addTemplate({ name, stats });
    }
    resetForm();
  };

  const toggleStat = (stat: StatType) => {
    setStats(prev => 
      prev.includes(stat) ? prev.filter(s => s !== stat) : [...prev, stat]
    );
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchesStat = filterStat === 'ALL' || t.stats.includes(filterStat as StatType);
    return matchesSearch && matchesStat;
  });

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full relative">
      <div className="flex justify-between items-start mb-6 shrink-0">
        <span className="text-sm font-semibold text-slate-500 uppercase tracking-tight">Manage Activities</span>
        {!isAdding && !editingId && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </button>
        )}
      </div>

      {(isAdding || editingId) ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col"
        >
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Activity Name</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Belajar React"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
          </div>
          
          <div className="mb-4 flex-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Affected Stats</label>
            <div className="flex flex-wrap gap-2">
              {allStats.map(stat => {
                const isSelected = stats.includes(stat);
                return (
                  <button
                    key={stat}
                    onClick={() => toggleStat(stat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${isSelected ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                  >
                    {stat}
                  </button>
                );
              })}
            </div>
            {stats.length === 0 && <p className="text-xs text-red-500 mt-2">Select at least one stat</p>}
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-slate-100 shrink-0">
            <button 
              onClick={resetForm}
              className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={!name.trim() || stats.length === 0}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-all"
            >
              Save Activity
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          <div className="flex gap-2 mb-4 shrink-0">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
              />
            </div>
            <select
              value={filterStat}
              onChange={(e) => setFilterStat(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer font-medium"
            >
              <option value="ALL">All Stats</option>
              {allStats.map(stat => (
                <option key={stat} value={stat}>{stat}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-2">
            {filteredTemplates.map(t => (
              <div key={t.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors">
                <div>
                  <div className="text-sm font-medium text-slate-800">{t.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{t.stats.join(', ')}</div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(t)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">
                    <PenSquare className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteTemplate(t.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {filteredTemplates.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-4">No activities found.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
