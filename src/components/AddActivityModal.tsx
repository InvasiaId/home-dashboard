import React, { useState, useMemo } from 'react';
import { useRPGStore, ActivityTemplate, StatType } from '../store/useRPGStore';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, CheckCircle2, Circle } from 'lucide-react';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const statColors: Record<StatType, string> = {
  STR: 'bg-red-100 text-red-700 border-red-200',
  INT: 'bg-blue-100 text-blue-700 border-blue-200',
  AGI: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  END: 'bg-green-100 text-green-700 border-green-200',
  CHA: 'bg-pink-100 text-pink-700 border-pink-200',
  WIS: 'bg-purple-100 text-purple-700 border-purple-200',
};

export function AddActivityModal({ isOpen, onClose }: AddActivityModalProps) {
  const templates = useRPGStore((state) => state.activityTemplates);
  const completeActivities = useRPGStore((state) => state.completeActivities);
  
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => 
      t.name.toLowerCase().includes(search.toLowerCase()) || 
      t.stats.some(s => s.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, templates]);

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSave = () => {
    if (selectedIds.size > 0) {
      completeActivities(Array.from(selectedIds));
      setSelectedIds(new Set());
      setSearch('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]"
        >
          <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Log Daily Activity</h2>
              <p className="text-xs text-slate-500 mt-0.5">Select the tasks you completed today.</p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search activities or stat (e.g., 'STR')..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {filteredTemplates.length > 0 ? filteredTemplates.map(template => {
                const isSelected = selectedIds.has(template.id);
                return (
                  <div 
                    key={template.id}
                    onClick={() => toggleSelect(template.id)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${isSelected ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-transparent hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300" />
                      )}
                      <div>
                        <div className={`font-medium text-sm ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{template.name}</div>
                        <div className="flex gap-1.5 mt-1.5">
                          {template.stats.map(stat => (
                            <span key={stat} className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${statColors[stat]}`}>
                              +{stat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="p-8 text-center text-sm text-slate-500">
                  No activities found.
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <span className="text-sm font-medium text-slate-500">
              {selectedIds.size} selected
            </span>
            <button 
              onClick={handleSave}
              disabled={selectedIds.size === 0}
              className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-indigo-700 hover:shadow disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              Add Stats & Save
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
