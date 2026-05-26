import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scale, Plus, Search, X, Check, ArrowRight, Minus, ListTodo, Settings2, BarChart3, Filter, PenSquare, Trash2 } from 'lucide-react';
import { useDeedsStore, DeedCategory, DeedType } from '../store/useDeedsStore';
import { format, subDays, startOfDay, eachDayOfInterval, parseISO, isSameDay, isBefore } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { DeedsScale3D } from './DeedsScale3D';

export function DeedsManagement() {
  const [activeTab, setActiveTab] = useState<'today' | 'manage' | 'analytics'>('today');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden relative">
      <div className="border-b border-slate-100 shrink-0 bg-slate-50/50">
        <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Amalan Management</h2>
              <p className="text-xs text-slate-500 font-medium">{format(new Date(), 'EEEE, MMMM do, yyyy')}</p>
            </div>
          </div>
        </div>
        <div className="flex px-4 gap-2 overflow-x-auto hide-scrollbar">
          {[
            { id: 'today', label: 'Today Tracker', icon: ListTodo },
            { id: 'manage', label: 'Manage Amalan', icon: Settings2 },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'today' | 'manage' | 'analytics')}
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
          {activeTab === 'today' && <TodayDeedsTracker key="today" />}
          {activeTab === 'manage' && <ManageDeeds key="manage" />}
          {activeTab === 'analytics' && <DeedsAnalytics key="analytics" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TodayDeedsTracker() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const logs = useDeedsStore(state => state.logs);
  const categories = useDeedsStore(state => state.categories);
  
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  
  const todayLogs = useMemo(() => logs.filter(l => l.date === todayStr), [logs, todayStr]);

  const { goodCount, badCount, todayGoodLogs, todayBadLogs } = useMemo(() => {
    let good = 0;
    let bad = 0;
    const goodLogs: any[] = [];
    const badLogs: any[] = [];

    todayLogs.forEach(log => {
      const category = categories.find(c => c.id === log.categoryId);
      if (category) {
        if (category.type === 'GOOD') {
          good += log.count;
          goodLogs.push({ ...log, category });
        } else {
          bad += log.count;
          badLogs.push({ ...log, category });
        }
      }
    });

    return { 
      goodCount: good, 
      badCount: bad, 
      todayGoodLogs: goodLogs.sort((a, b) => b.count - a.count), 
      todayBadLogs: badLogs.sort((a, b) => b.count - a.count) 
    };
  }, [todayLogs, categories]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col lg:flex-row gap-8 h-full">
      {/* Libra Scale Section */}
      <div className="flex-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[400px]">
        <div className="flex justify-between items-center mb-4 z-10 relative">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Timbangan Amal 3D</h3>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors text-xs shadow-sm flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            Catat Amalan
          </button>
        </div>
        
        <div className="flex-1 -mx-6 -mb-6 relative rounded-b-xl overflow-hidden bg-slate-100/50 border-t border-slate-100">
           <DeedsScale3D goodCount={goodCount} badCount={badCount} />
        </div>
      </div>

      {/* Logs Section */}
      <div className="flex-[1.5] flex flex-col gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex-1">
          <h3 className="text-sm font-bold text-green-800 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Amalan Baik Hari Ini
          </h3>
          {todayGoodLogs.length > 0 ? (
            <div className="space-y-3">
              {todayGoodLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-green-50/50 rounded-lg border border-green-100">
                  <span className="text-sm font-medium text-slate-700">{log.category.name}</span>
                  <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded-md">{log.count}x</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">Belum ada amalan baik hari ini...</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex-1">
          <h3 className="text-sm font-bold text-red-800 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            Amalan Buruk Hari Ini
          </h3>
          {todayBadLogs.length > 0 ? (
            <div className="space-y-3">
              {todayBadLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-red-50/50 rounded-lg border border-red-100">
                  <span className="text-sm font-medium text-slate-700">{log.category.name}</span>
                  <span className="text-xs font-bold bg-red-100 text-red-800 px-2 py-1 rounded-md">{log.count}x</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">Alhamdulillah, tidak ada amalan buruk...</p>
          )}
        </div>
      </div>

      <RecordDeedsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </motion.div>
  );
}

function ManageDeeds() {
  const categories = useDeedsStore(state => state.categories);
  const addCategory = useDeedsStore(state => state.addCategory);
  const updateCategory = useDeedsStore(state => state.updateCategory);
  const deleteCategory = useDeedsStore(state => state.deleteCategory);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<DeedType>('GOOD');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'GOOD' | 'BAD'>('ALL');

  const filteredCategories = categories.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'ALL' || c.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleSave = () => {
    if (!name.trim()) return;
    if (editingId) {
      updateCategory(editingId, name, type);
    } else {
      addCategory(name, type);
    }
    setIsAdding(false);
    setEditingId(null);
    setName('');
    setType('GOOD');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-slate-800">Manajemen Amalan</h3>
          <p className="text-xs text-slate-500">Kelola daftar amalan baik dan buruk.</p>
        </div>
        {!isAdding && !editingId && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Amalan
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
             <div className="flex-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Nama Amalan</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  placeholder="Misal: Sedekah..."
                  autoFocus
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
             </div>
             <div className="w-full md:w-48 shrink-0">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Jenis</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as DeedType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                >
                  <option value="GOOD">Amalan Baik</option>
                  <option value="BAD">Amalan Buruk</option>
                </select>
             </div>
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <button 
              onClick={() => { setIsAdding(false); setEditingId(null); setName(''); }} 
              className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button 
              onClick={handleSave} 
              disabled={!name.trim()}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              Simpan
            </button>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Cari amalan..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>
        <div className="relative shrink-0 w-full sm:w-40">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as any)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none"
          >
            <option value="ALL">Semua</option>
            <option value="GOOD">Amalan Baik</option>
            <option value="BAD">Amalan Buruk</option>
          </select>
        </div>
      </div>

      <div className="grid gap-3">
        {filteredCategories.map(cat => (
          <div key={cat.id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center hover:border-slate-300 transition-colors group shadow-sm">
            <div className="flex items-center gap-3">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${cat.type === 'GOOD' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                 {cat.type === 'GOOD' ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
               </div>
               <h4 className="font-bold text-slate-800 text-sm">{cat.name}</h4>
            </div>
            <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => { setEditingId(cat.id); setName(cat.name); setType(cat.type); setIsAdding(false); }} 
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                title="Edit"
              >
                <PenSquare className="w-4 h-4" />
              </button>
              <button 
                onClick={() => deleteCategory(cat.id)} 
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Hapus"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {filteredCategories.length === 0 && <div className="text-center py-8 text-slate-400 text-sm">Tidak ada amalan ditemukan.</div>}
      </div>
    </motion.div>
  );
}

function DeedsAnalytics() {
  const categories = useDeedsStore(state => state.categories);
  const logs = useDeedsStore(state => state.logs);

  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'all'>('week');

  const analytics = useMemo(() => {
    const now = startOfDay(new Date());
    let startDate = now;

    if (timeRange === 'week') startDate = subDays(now, 6);
    else if (timeRange === 'month') startDate = subDays(now, 29);
    else if (timeRange === 'year') startDate = subDays(now, 364);
    else if (timeRange === 'all') {
      startDate = logs.length > 0 
        ? logs.reduce((earliest, l) => isBefore(parseISO(l.date), earliest) ? parseISO(l.date) : earliest, now)
        : now;
    }

    const interval = eachDayOfInterval({ start: startDate, end: now });
    
    let totalGood = 0;
    let totalBad = 0;

    const chartData = interval.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      let dailyGood = 0;
      let dailyBad = 0;

      logs.filter(l => l.date === dateStr).forEach(log => {
        const cat = categories.find(c => c.id === log.categoryId);
        if (cat) {
          if (cat.type === 'GOOD') {
            dailyGood += log.count;
            totalGood += log.count;
          } else {
            dailyBad += log.count;
            totalBad += log.count;
          }
        }
      });

      return {
        date: format(date, timeRange === 'year' || timeRange === 'all' ? 'MMM yyyy' : 'MMM dd'),
        goodCount: dailyGood,
        badCount: dailyBad,
        fullDate: dateStr
      };
    });

    let groupedChartData = chartData;
    if (timeRange === 'year' || timeRange === 'all') {
       const monthlyMap = new Map<string, { date: string, goodCount: number, badCount: number, fullDate: string }>();
       chartData.forEach(d => {
          const monthYear = format(parseISO(d.fullDate), 'MMM yyyy');
          if (!monthlyMap.has(monthYear)) {
             monthlyMap.set(monthYear, { date: monthYear, goodCount: 0, badCount: 0, fullDate: d.fullDate });
          }
          const item = monthlyMap.get(monthYear)!;
          item.goodCount += d.goodCount;
          item.badCount += d.badCount;
       });
       groupedChartData = Array.from(monthlyMap.values());
    }

    return {
      chartData: groupedChartData,
      totalGood,
      totalBad
    };

  }, [categories, logs, timeRange]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-500" />
          Progress & Analitik
        </h3>
        <div className="flex gap-2 w-full sm:w-auto">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="flex-1 sm:flex-none text-xs px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg outline-none cursor-pointer font-medium"
          >
            <option value="week">Past 7 Days</option>
            <option value="month">Past 30 Days</option>
            <option value="year">Past Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center shrink-0">
             <Plus className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800 tracking-tight">{analytics.totalGood}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">Total Amalan Baik</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center shrink-0">
             <Minus className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800 tracking-tight">{analytics.totalBad}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">Total Amalan Buruk</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-6">Analitik Amalan</h3>
        <div className="flex-1 w-full min-h-0">
          {analytics.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }} 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} 
                />
                <Bar dataKey="goodCount" fill="#22c55e" radius={[4, 4, 0, 0]} name="Amalan Baik" maxBarSize={40} stackId="a" />
                <Bar dataKey="badCount" fill="#ef4444" radius={[4, 4, 0, 0]} name="Amalan Buruk" maxBarSize={40} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-slate-400">Tidak ada data untuk rentang waktu ini.</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function RecordDeedsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const categories = useDeedsStore(state => state.categories);
  const logDeeds = useDeedsStore(state => state.logDeeds);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'GOOD' | 'BAD'>('ALL');
  
  // Local state to track selections before saving
  const [selections, setSelections] = useState<Record<string, number>>({});

  const handleIncrement = (categoryId: string) => {
    setSelections(prev => ({
      ...prev,
      [categoryId]: (prev[categoryId] || 0) + 1
    }));
  };

  const handleDecrement = (categoryId: string) => {
    setSelections(prev => {
      const current = prev[categoryId] || 0;
      if (current <= 0) return prev;
      return {
        ...prev,
        [categoryId]: current - 1
      };
    });
  };

  const handleSave = () => {
    const changes = Object.entries(selections)
      .map(([categoryId, count]) => ({ categoryId, count: count as number }))
      .filter(item => item.count > 0);
    
    if (changes.length > 0) {
      logDeeds(format(new Date(), 'yyyy-MM-dd'), changes);
    }
    
    setSelections({});
    onClose();
  };

  const filteredCategories = categories.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'ALL' || c.type === typeFilter;
    return matchSearch && matchType;
  });
  
  const totalSelected = Object.values(selections).reduce((a, b) => (a as number) + (b as number), 0) as number;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 10 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <h2 className="text-base font-bold text-slate-800 tracking-tight">Catat Aktivitas Hari Ini</h2>
              <button onClick={() => { onClose(); setSelections({}); }} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 border-b border-slate-100 shrink-0 flex gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Cari aktivitas..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
              <div className="relative shrink-0 w-32 sm:w-40">
                <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value as any)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none"
                >
                  <option value="ALL">Semua</option>
                  <option value="GOOD">Amalan Baik</option>
                  <option value="BAD">Amalan Buruk</option>
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                {(typeFilter === 'ALL' || typeFilter === 'GOOD') && (
                  <>
                    <div className="col-span-full mb-2"><h3 className="text-xs font-bold text-green-700 uppercase tracking-widest px-2">Amalan Baik</h3></div>
                    {filteredCategories.filter(c => c.type === 'GOOD').map(cat => (
                      <div key={cat.id} className="bg-white border text-sm border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-sm hover:border-green-300 transition-colors">
                        <span className="font-medium text-slate-700 pr-2 truncate" title={cat.name}>{cat.name}</span>
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg shrink-0">
                          <button onClick={() => handleDecrement(cat.id)} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-l-lg transition-colors">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-bold w-4 text-center text-slate-800 select-none">{selections[cat.id] || 0}</span>
                          <button onClick={() => handleIncrement(cat.id)} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-r-lg transition-colors">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
                
                {(typeFilter === 'ALL' || typeFilter === 'BAD') && (
                  <>
                    <div className="col-span-full mt-4 mb-2"><h3 className="text-xs font-bold text-red-700 uppercase tracking-widest px-2">Amalan Buruk</h3></div>
                    {filteredCategories.filter(c => c.type === 'BAD').map(cat => (
                      <div key={cat.id} className="bg-white border text-sm border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-sm hover:border-red-300 transition-colors">
                        <span className="font-medium text-slate-700 pr-2 truncate" title={cat.name}>{cat.name}</span>
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg shrink-0">
                          <button onClick={() => handleDecrement(cat.id)} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-l-lg transition-colors">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-bold w-4 text-center text-slate-800 select-none">{selections[cat.id] || 0}</span>
                          <button onClick={() => handleIncrement(cat.id)} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-r-lg transition-colors">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex justify-between items-center shrink-0">
              <span className="text-sm font-medium text-slate-500">
                {totalSelected} aktivitas dipilih
              </span>
              <button 
                onClick={handleSave}
                disabled={totalSelected === 0}
                className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Simpan <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
