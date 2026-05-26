import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lightbulb } from 'lucide-react';
import { useNotesStore } from '../store/useNotesStore';

export function QuickNoteModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  const addNote = useNotesStore(state => state.addNote);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow cmd or ctrl + k
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSave = () => {
    if (title.trim() || content.trim()) {
      addNote(title, content);
      setIsOpen(false);
      setTitle('');
      setContent('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 10 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
          >
            <div className="px-6 py-4 flex justify-between items-center bg-slate-800 text-white">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <h2 className="text-sm font-bold tracking-wide">Quick Note</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
               <div>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)}
                    autoFocus
                    placeholder="Note Title..."
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-slate-800"
                  />
               </div>
               <div>
                  <textarea 
                    value={content} 
                    onChange={e => setContent(e.target.value)}
                    placeholder="Jot down your wild idea..."
                    rows={5}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-800 resize-none"
                  />
               </div>
               <div className="flex justify-end gap-3 pt-2">
                 <button 
                    onClick={() => setIsOpen(false)}
                    className="px-5 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                    onClick={handleSave}
                    disabled={!title.trim() && !content.trim()}
                    className="px-6 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 transition-colors text-sm shadow-sm disabled:opacity-50"
                 >
                   Save Note
                 </button>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
