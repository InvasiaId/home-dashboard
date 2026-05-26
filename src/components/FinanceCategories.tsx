import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { useFinanceStore, TransactionType } from '../store/useFinanceStore';
import { List, PenSquare, Trash2, Plus, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';

export function FinanceCategories() {
  const categories = useFinanceStore(state => state.categories);
  const addCategory = useFinanceStore(state => state.addCategory);
  const updateCategory = useFinanceStore(state => state.updateCategory);
  const deleteCategory = useFinanceStore(state => state.deleteCategory);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('EXPENSE');

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setName('');
    setType('EXPENSE');
  };

  const handleEdit = (cat: { id: string; name: string; type: TransactionType }) => {
    setEditingId(cat.id);
    setName(cat.name);
    setType(cat.type);
    setIsAdding(false);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    
    if (editingId) {
      updateCategory(editingId, name, type);
    } else {
      addCategory(name, type);
    }
    resetForm();
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === 'ALL' || c.type === filterType;
      return matchSearch && matchType;
    });
  }, [categories, search, filterType]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="font-bold text-slate-800">Manage Categories</h3>
          <p className="text-xs text-slate-500">Configure transaction categories.</p>
        </div>
        {!isAdding && !editingId && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            New Category
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Category Name</label>
              <input 
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g., Groceries"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Type</label>
              <select 
                value={type} onChange={e => setType(e.target.value as TransactionType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer font-medium"
              >
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={resetForm} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
            <button 
              onClick={handleSave} disabled={!name.trim()}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              Save Category
            </button>
          </div>
        </div>
      )}

      {!isAdding && !editingId && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <select 
            value={filterType} onChange={e => setFilterType(e.target.value as any)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer font-medium text-slate-600 w-[140px]"
          >
            <option value="ALL">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
        </div>
      )}

      <div className="grid gap-2">
        {filteredCategories.map(cat => (
          <div key={cat.id} className="bg-white p-3 px-4 rounded-xl border border-slate-200 flex justify-between items-center hover:border-slate-300 transition-colors group">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${cat.type === 'INCOME' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {cat.type === 'INCOME' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-0.5">{cat.name}</h4>
                <div className={`text-[10px] font-bold tracking-widest uppercase ${cat.type === 'INCOME' ? 'text-green-500' : 'text-slate-400'}`}>{cat.type}</div>
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(cat)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">
                <PenSquare className="w-4 h-4" />
              </button>
              <button onClick={() => deleteCategory(cat.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {filteredCategories.length === 0 && <div className="text-center py-6 text-slate-400 text-sm">No categories found.</div>}
      </div>
    </motion.div>
  );
}
