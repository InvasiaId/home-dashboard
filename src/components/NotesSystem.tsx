import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StickyNote, Search, Trash2, PenSquare, X, Filter } from 'lucide-react';
import { useNotesStore, Note } from '../store/useNotesStore';
import { isAfter, startOfDay, subDays, subMonths, subYears } from 'date-fns';

export function NotesSystem() {
  const notes = useNotesStore(state => state.notes);
  const deleteNote = useNotesStore(state => state.deleteNote);
  const updateNote = useNotesStore(state => state.updateNote);
  
  const [search, setSearch] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [timeFilter, setTimeFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR'>('ALL');

  const filteredNotes = notes.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
      n.content.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;
    if (timeFilter === 'ALL') return true;

    const noteDate = new Date(n.updatedAt);
    const now = new Date();

    if (timeFilter === 'TODAY') return isAfter(noteDate, startOfDay(now));
    if (timeFilter === 'WEEK') return isAfter(noteDate, subDays(now, 7));
    if (timeFilter === 'MONTH') return isAfter(noteDate, subMonths(now, 1));
    if (timeFilter === 'YEAR') return isAfter(noteDate, subYears(now, 1));

    return true;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden relative">
      <div className="border-b border-slate-100 shrink-0 bg-slate-50/50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StickyNote className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Notes System</h2>
          </div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-slate-200/50 px-3 py-1.5 rounded-lg flex items-center gap-2">
            Shortcut
            <span className="flex border border-slate-300 rounded shadow-sm overflow-hidden bg-white">
              <kbd className="px-1.5 py-0.5 border-r border-slate-200 font-mono text-[9px] text-slate-600">CTRL</kbd>
              <kbd className="px-1.5 py-0.5 font-mono text-[9px] text-slate-600">K</kbd>
            </span>
          </div>
        </div>
        <div className="px-6 pb-4 flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search wild ideas..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="relative shrink-0 w-40 sm:w-48">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={timeFilter}
              onChange={e => setTimeFilter(e.target.value as any)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none truncate"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="WEEK">Last 7 Days</option>
              <option value="MONTH">Last 30 Days</option>
              <option value="YEAR">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredNotes.map(note => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }} 
                key={note.id} 
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                <div className="flex justify-between items-start mb-2 gap-4">
                  <h3 className="font-bold text-slate-800 text-sm line-clamp-2 break-words">{note.title || 'Untitled Note'}</h3>
                  <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => setEditingNote(note)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-md transition-colors">
                      <PenSquare className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteNote(note.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-md transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-600 whitespace-pre-wrap flex-1 break-words">{note.content}</p>
                <div className="mt-4 pt-3 border-t border-slate-100/60 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                  <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                  <span>{new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {filteredNotes.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
             <StickyNote className="w-8 h-8 opacity-20" />
             <p className="text-sm font-medium">No ideas found. Let your mind wander!</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {editingNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-sm font-bold text-slate-800 tracking-tight">Edit Note</h2>
                <button onClick={() => setEditingNote(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 flex flex-col gap-4">
                 <div>
                    <input 
                      type="text" 
                      value={editingNote.title} 
                      onChange={e => setEditingNote({...editingNote, title: e.target.value})}
                      placeholder="Title..."
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                 </div>
                 <div>
                    <textarea 
                      value={editingNote.content} 
                      onChange={e => setEditingNote({...editingNote, content: e.target.value})}
                      placeholder="Describe your wild idea..."
                      rows={6}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                 </div>
                 <div className="flex justify-end gap-3 pt-2">
                   <button 
                      onClick={() => setEditingNote(null)}
                      className="px-5 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                   >
                     Cancel
                   </button>
                   <button 
                      onClick={() => {
                        updateNote(editingNote.id, editingNote.title, editingNote.content);
                        setEditingNote(null);
                      }}
                      className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors text-sm shadow-sm"
                   >
                     Save Changes
                   </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
