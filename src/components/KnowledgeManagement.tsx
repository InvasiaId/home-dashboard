import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Plus, Trash2, Search } from 'lucide-react';
import { format, parseISO, isAfter, subDays, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { useKnowledgeStore } from '../store/useKnowledgeStore';
import { useRPGStore } from '../store/useRPGStore';

export function KnowledgeManagement() {
  const knowledges = useKnowledgeStore(state => state.knowledges);
  const addKnowledge = useKnowledgeStore(state => state.addKnowledge);
  const deleteKnowledge = useKnowledgeStore(state => state.deleteKnowledge);
  const addStat = useRPGStore(state => state.addStat);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [search, setSearch] = useState('');
  const [timeRange, setTimeRange] = useState<'all' | 'day' | 'week' | 'month' | 'year'>('all');

  const handleSave = () => {
    if (!title.trim() || !description.trim()) return;

    addKnowledge(title, description);
    addStat('INT', 1);

    setTitle('');
    setDescription('');
  };

  const filteredKnowledges = knowledges
    .filter(k => k.title.toLowerCase().includes(search.toLowerCase()) || k.description.toLowerCase().includes(search.toLowerCase()))
    .filter(k => {
      if (timeRange === 'all') return true;
      const date = parseISO(k.date);
      const now = new Date();
      if (timeRange === 'day') return isAfter(date, subDays(now, 1));
      if (timeRange === 'week') return isAfter(date, startOfWeek(now));
      if (timeRange === 'month') return isAfter(date, startOfMonth(now));
      if (timeRange === 'year') return isAfter(date, startOfYear(now));
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden relative">
      <div className="border-b border-slate-100 shrink-0 bg-slate-50/50">
        <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Knowledge Management</h2>
              <p className="text-xs text-slate-500 font-medium">Add insight = +1 Intelligence</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
        <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-8 items-start h-full pb-8">
          {/* Input Form */}
          <div className="w-full lg:w-96 shrink-0 bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-0">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6">Tambah Insight Baru</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Judul Topik / Insight</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Misal: Atomic Habits..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Deskripsi / Catatan</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Catatan detail..."
                  rows={6}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>
              <button 
                onClick={handleSave}
                disabled={!title.trim() || !description.trim()}
                className="w-full px-4 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 mt-4"
              >
                <Plus className="w-4 h-4" />
                Simpan & +1 Intelligence
              </button>
            </div>
          </div>

          {/* Cards List */}
          <div className="flex-1 w-full min-w-0">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Cari insight..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                />
              </div>
              <select
                 value={timeRange}
                 onChange={e => setTimeRange(e.target.value as any)}
                 className="shrink-0 text-sm font-medium text-slate-600 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                 <option value="all">Semua Waktu</option>
                 <option value="day">Hari Ini</option>
                 <option value="week">Minggu Ini</option>
                 <option value="month">Bulan Ini</option>
                 <option value="year">Tahun Ini</option>
              </select>
              <div className="hidden sm:block shrink-0 text-sm font-medium text-slate-500 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
                Total: <span className="font-bold text-slate-800">{filteredKnowledges.length}</span> insight
              </div>
            </div>

            <div className="grid gap-4">
              <AnimatePresence>
                {filteredKnowledges.map(item => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 sm:items-start group hover:border-indigo-200 transition-colors"
                  >
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h4 className="font-bold text-slate-800 break-words">{item.title}</h4>
                        <span className="text-xs font-semibold text-slate-400 whitespace-nowrap bg-slate-100 px-2 py-1 rounded-md">
                          {format(parseISO(item.date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{item.description}</p>
                    </div>
                    <button 
                      onClick={() => deleteKnowledge(item.id)}
                      className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all self-end sm:self-start shrink-0"
                      title="Hapus Insight"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {filteredKnowledges.length === 0 && (
                <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-xl bg-white/50">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-sm font-bold text-slate-700 mb-1">Belum ada insight</h3>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto">Catat pengetahuan baru yang kamu dapatkan hari ini untuk menambah intelligence.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
