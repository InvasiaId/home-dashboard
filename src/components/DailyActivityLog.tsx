import React, { useState, useMemo } from 'react';
import { useRPGStore, StatType } from '../store/useRPGStore';
import { Swords, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { AddActivityModal } from './AddActivityModal';

const statColors: Record<StatType, string> = {
  STR: 'bg-red-50 text-red-600',
  INT: 'bg-blue-50 text-blue-600',
  AGI: 'bg-yellow-50 text-yellow-600',
  END: 'bg-green-50 text-green-600',
  CHA: 'bg-pink-50 text-pink-600',
  WIS: 'bg-purple-50 text-purple-600',
};

export function DailyActivityLog() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const history = useRPGStore(state => state.history);
  const templates = useRPGStore(state => state.activityTemplates);
  
  const todayLogs = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    return history
      .filter(h => new Date(h.timestamp).setHours(0, 0, 0, 0) === today)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [history]);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow h-full relative">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-500 uppercase tracking-tight">Today's Quests</span>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Log
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 -mr-2">
        {todayLogs.length > 0 ? (
          <ul className="space-y-4">
            {todayLogs.map((log, index) => {
              const template = templates.find(t => t.id === log.activityTemplateId);
              if (!template) return null;
              
              const timeString = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <motion.li 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={log.id} 
                  className="flex gap-4 items-start relative group"
                >
                  <div className="flex flex-col items-center mt-1">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 ring-4 ring-indigo-50"></div>
                    {index !== todayLogs.length - 1 && <div className="w-px h-full bg-slate-100 mt-2"></div>}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-sm font-bold text-slate-800">{template.name}</span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{timeString}</span>
                    </div>
                    <div className="flex gap-1.5 mt-1.5">
                      {template.stats.map(stat => (
                        <span key={stat} className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest ${statColors[stat]}`}>
                          +{stat}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 pb-8">
            <Swords className="w-8 h-8 opacity-20" />
            <p className="text-sm font-medium">No quests completed today.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg"
            >
              Start First Quest
            </button>
          </div>
        )}
      </div>

      <AddActivityModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
