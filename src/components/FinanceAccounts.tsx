import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Landmark, PenSquare, Trash2, Plus } from 'lucide-react';

export function FinanceAccounts() {
  const accounts = useFinanceStore(state => state.accounts);
  const addAccount = useFinanceStore(state => state.addAccount);
  const updateAccount = useFinanceStore(state => state.updateAccount);
  const deleteAccount = useFinanceStore(state => state.deleteAccount);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setName('');
    setBalance('');
  };

  const handleEdit = (acc: { id: string; name: string; balance: number }) => {
    setEditingId(acc.id);
    setName(acc.name);
    setBalance(acc.balance.toString());
    setIsAdding(false);
  };

  const handleSave = () => {
    if (!name.trim() || balance === '') return;
    
    if (editingId) {
      updateAccount(editingId, name, Number(balance));
    } else {
      addAccount(name, Number(balance));
    }
    resetForm();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-800">Manage Accounts</h3>
          <p className="text-xs text-slate-500">Add or edit your bank accounts and wallets.</p>
        </div>
        {!isAdding && !editingId && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            New Account
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Account Name</label>
              <input 
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g., Bank BCA"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Current Balance</label>
              <input 
                type="number" value={balance} onChange={e => setBalance(e.target.value)}
                placeholder="e.g., 500000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={resetForm} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
            <button 
              onClick={handleSave} disabled={!name.trim() || balance === ''}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              Save Account
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {accounts.map(acc => (
          <div key={acc.id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center hover:border-slate-300 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center shrink-0">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-0.5">{acc.name}</h4>
                <div className="text-xs text-slate-500 font-mono">Rp {acc.balance.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(acc)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">
                <PenSquare className="w-4 h-4" />
              </button>
              <button onClick={() => deleteAccount(acc.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {accounts.length === 0 && <div className="text-center py-6 text-slate-400 text-sm">No accounts configured.</div>}
      </div>
    </motion.div>
  );
}
