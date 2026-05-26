import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, Landmark, List, BarChart3, Coins, Plus, ArrowUpRight, ArrowDownRight, Search, X, ChevronRight } from 'lucide-react';
import { useFinanceStore, TransactionCategory } from '../store/useFinanceStore';
import { FinanceAccounts } from './FinanceAccounts';
import { FinanceCategories } from './FinanceCategories';
import { FinanceAnalytics } from './FinanceAnalytics';

export function FinanceManagement() {
  const [activeTab, setActiveTab] = useState<'transactions' | 'accounts' | 'categories' | 'analytics'>('transactions');
  const accounts = useFinanceStore(state => state.accounts);
  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Header & Tabs */}
      <div className="border-b border-slate-100 shrink-0 bg-slate-50/50">
        <div className="px-6 py-4 flex items-center gap-3">
          <Wallet className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Finance Management</h2>
        </div>
        <div className="flex px-4 gap-2 overflow-x-auto hide-scrollbar">
          {[
            { id: 'transactions', label: 'Overview', icon: Coins },
            { id: 'accounts', label: 'Accounts', icon: Landmark },
            { id: 'categories', label: 'Categories', icon: List },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 border-b-2 text-sm font-semibold capitalize transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
        <AnimatePresence mode="wait">
          {activeTab === 'transactions' && <FinanceOverview key="transactions" />}
          {activeTab === 'accounts' && <FinanceAccounts key="accounts" />}
          {activeTab === 'categories' && <FinanceCategories key="categories" />}
          {activeTab === 'analytics' && <FinanceAnalytics key="analytics" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function FinanceOverview() {
  const accounts = useFinanceStore(state => state.accounts);
  const transactions = useFinanceStore(state => state.transactions);
  const categories = useFinanceStore(state => state.categories);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6 h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="text-sm font-semibold text-slate-500 uppercase tracking-tight mb-2">Total Balance</div>
          <div className="text-3xl font-bold tracking-tight text-slate-800">
            Rp {totalBalance.toLocaleString()}
          </div>
        </div>

        {accounts.map(acc => (
          <div key={acc.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-tight truncate pr-2">{acc.name}</span>
              <Landmark className="w-5 h-5 text-indigo-200 shrink-0" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-slate-700">
              Rp {acc.balance.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden min-h-[300px]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <Coins className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Recent Transactions</h2>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {transactions.length > 0 ? (
            <div className="space-y-1">
              {transactions.map(t => {
                const category = categories.find(c => c.id === t.categoryId);
                const account = accounts.find(a => a.id === t.accountId);
                return (
                  <div key={t.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${t.type === 'INCOME' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {t.type === 'INCOME' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-sm mb-0.5">{category?.name || 'Unknown'}</div>
                        <div className="text-xs text-slate-500 flex gap-2">
                          <span className="font-mono">{new Date(t.date).toLocaleDateString()}</span>
                          <span>&bull;</span>
                          <span className="font-medium text-slate-600 truncate max-w-[100px] sm:max-w-none">{account?.name || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`font-bold tracking-tight whitespace-nowrap shrink-0 pl-4 ${t.type === 'INCOME' ? 'text-green-600' : 'text-slate-800'}`}>
                      {t.type === 'INCOME' ? '+' : '-'} Rp {t.amount.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3 pb-8">
              <Coins className="w-8 h-8 opacity-20" />
              <p className="text-sm font-medium">No transactions yet.</p>
            </div>
          )}
        </div>
      </div>

      <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </motion.div>
  );
}

export function AddTransactionModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const categories = useFinanceStore(state => state.categories);
  const accounts = useFinanceStore(state => state.accounts);
  const addTransaction = useFinanceStore(state => state.addTransaction);

  const [step, setStep] = useState(1);
  const [search, setSearch] = useState('');
  
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory | null>(null);
  const [amount, setAmount] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  const filteredCategories = React.useMemo(() => {
    return categories.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'ALL' || c.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [categories, search, typeFilter]);

  const handleClose = () => {
    setStep(1);
    setSearch('');
    setSelectedCategory(null);
    setAmount('');
    setTypeFilter('ALL');
    onClose();
  };

  const handleNextStep1 = (cat: TransactionCategory) => {
    setSelectedCategory(cat);
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (amount && !isNaN(Number(amount))) {
      setStep(3);
    }
  };

  const handleFinish = (accountId: string) => {
    if (selectedCategory && amount && accountId) {
      addTransaction({
        categoryId: selectedCategory.id,
        amount: Number(amount),
        accountId: accountId
      });
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col h-[500px]"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                {step === 1 && 'Select Category'}
                {step === 2 && 'Enter Amount'}
                {step === 3 && 'Select Account'}
              </h2>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3].map(s => (
                  <div key={s} className={`h-1.5 w-8 rounded-full ${step >= s ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                ))}
              </div>
            </div>
            <button onClick={handleClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-hidden relative">
            {/* Step 1: Category */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="absolute inset-0 flex flex-col">
                <div className="p-4 border-b border-slate-100 shrink-0 flex flex-col gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" placeholder="Search activities..." value={search} onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <select 
                    value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                  </select>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  {filteredCategories.map(cat => (
                    <div 
                      key={cat.id} onClick={() => handleNextStep1(cat)}
                      className="flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${cat.type === 'INCOME' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {cat.type === 'INCOME' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <span className="font-medium text-sm text-slate-700">{cat.name}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </div>
                  ))}
                  {filteredCategories.length === 0 && <div className="text-center p-8 text-slate-400 text-sm">No activity found.</div>}
                </div>
              </motion.div>
            )}

            {/* Step 2: Amount */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-50">
                <div className="text-center mb-8 w-full">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4 ${selectedCategory?.type === 'INCOME' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                    {selectedCategory?.type} &bull; {selectedCategory?.name}
                  </div>
                  <h3 className="text-slate-500 font-medium text-sm mb-6">How much?</h3>
                </div>
                
                <div className="flex items-center justify-center text-4xl font-bold text-slate-800 mb-8 border-b-2 border-slate-300 pb-2 w-full focus-within:border-indigo-600 transition-colors">
                  <span className="text-2xl text-slate-400 mr-2">Rp</span>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    autoFocus
                    placeholder="0"
                    className="w-full bg-transparent border-none outline-none p-0 text-center"
                  />
                </div>

                <div className="flex gap-3 w-full mt-auto shrink-0">
                  <button onClick={() => setStep(1)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm">Back</button>
                  <button onClick={handleNextStep2} disabled={!amount || Number(amount) <= 0} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm shadow-sm active:scale-95">Next Step</button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Account */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="absolute inset-0 flex flex-col">
                <div className="p-6 pb-2 shrink-0">
                  <div className="bg-slate-50 p-4 rounded-xl flex justify-between items-center mb-4 border border-slate-200">
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-0.5">Amount to log</div>
                      <div className="font-bold text-slate-800 tracking-tight">Rp {Number(amount).toLocaleString()}</div>
                    </div>
                    <div className="bg-white px-2 py-1 rounded shadow-sm border border-slate-100 text-[10px] font-bold text-slate-600">
                      {selectedCategory?.name}
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-tight mb-2">Select Account</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto px-6 space-y-3 pb-6">
                  {accounts.map(acc => (
                    <div 
                      key={acc.id} onClick={() => handleFinish(acc.id)}
                      className="flex justify-between items-center p-4 rounded-xl cursor-pointer bg-white border border-slate-200 hover:border-indigo-600 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 rounded-full flex items-center justify-center transition-colors shrink-0">
                          <Landmark className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm truncate">{acc.name}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">Balance: Rp {acc.balance.toLocaleString()}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors shrink-0" />
                    </div>
                  ))}
                  
                  <div className="pt-4 mt-auto">
                    <button onClick={() => setStep(2)} className="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">Back</button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
