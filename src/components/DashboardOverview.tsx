import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Swords, Wallet, Activity, ShieldAlert, Briefcase, BookOpen, Scale, ArrowRight, Plus, CheckCircle } from 'lucide-react';
import { useRPGStore } from '../store/useRPGStore';
import { useFinanceStore } from '../store/useFinanceStore';
import { useHabitStore } from '../store/useHabitStore';
import { useProjectStore } from '../store/useProjectStore';
import { useProfileStore } from '../store/useProfileStore';

// Modals
import { AddActivityModal } from './AddActivityModal';
import { AddTransactionModal } from './FinanceManagement';
import { RecordDeedsModal } from './DeedsManagement';

export function DashboardOverview({ setCurrentView }: { setCurrentView: (view: any) => void }) {
  const { stats, getTodayActivities } = useRPGStore();
  const todayTasks = getTodayActivities();
  const { name, avatarUrl } = useProfileStore();
  
  const accounts = useFinanceStore(state => state.accounts);
  const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);

  const habits = useHabitStore(state => state.habits);
  const projects = useProjectStore(state => state.projects);
  const updateProgress = useProjectStore(state => state.updateProgress);
  const completeProject = useProjectStore(state => state.completeProject);

  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isFinanceOpen, setIsFinanceOpen] = useState(false);
  const [isDeedsOpen, setIsDeedsOpen] = useState(false);
  
  const [localProgress, setLocalProgress] = useState<Record<string, number>>({});
  const [showCompleteModal, setShowCompleteModal] = useState<string | null>(null);
  const [projectLink, setProjectLink] = useState('');

  const calculateLevel = (xp: number) => Math.floor(Math.sqrt(xp));
  const totalXP = Object.values(stats).reduce((acc, val) => acc + val, 0);
  const currentLevel = calculateLevel(totalXP);
  const currentLevelXP = Math.pow(currentLevel, 2);
  const nextLevelXP = Math.pow(currentLevel + 1, 2);
  const progressToNextLevel = ((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  const handleSliderChange = (id: string, value: number) => {
    setLocalProgress(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveProgress = (id: string, currentSavedProgress: number) => {
    const newVal = localProgress[id];
    if (newVal === undefined || newVal === currentSavedProgress) return;
    
    if (newVal === 100) {
      setShowCompleteModal(id);
    } else {
      updateProgress(id, newVal);
      setLocalProgress(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const confirmComplete = () => {
    if (showCompleteModal) {
      completeProject(showCompleteModal, projectLink.trim() || undefined);
      setShowCompleteModal(null);
      setProjectLink('');
      setLocalProgress(prev => {
        const next = { ...prev };
        delete next[showCompleteModal];
        return next;
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner (Level/Progress) */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="col-span-1 lg:col-span-2 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-xl shadow-lg border border-indigo-900/50 p-8 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          <Swords className="w-32 h-32" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="w-24 h-24 rounded-2xl bg-indigo-500/20 border-2 border-indigo-500/50 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fallback')} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight mb-1">{name} (Lv.{currentLevel})</h2>
            <p className="text-indigo-200 mb-4 font-medium tracking-wide">Next level in {nextLevelXP - totalXP} XP</p>
            <div className="w-full bg-indigo-950/50 rounded-full h-3 border border-indigo-900 overflow-hidden">
              <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${progressToNextLevel}%` }}></div>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
             <div className="bg-indigo-950/50 px-5 py-3 rounded-xl border border-indigo-800/50 flex-1 md:flex-none text-center flex flex-col justify-center">
                <div className="text-xs font-semibold text-indigo-300 uppercase tracking-widest mb-1">Total Balance</div>
                <div className="text-xl font-bold text-green-400">Rp {totalBalance.toLocaleString()}</div>
             </div>
          </div>
        </div>
      </motion.div>

      {/* Grid: 3 columns layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Today's Tasks & Habits */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow p-6">
           <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center justify-between">
              Hari Ini
              <button 
                onClick={() => setCurrentView('tasks')}
                className="text-indigo-600 hover:bg-indigo-50 p-1 rounded-md transition-colors"
                title="Go to Tasks"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
           </h3>
           <div className="flex-1 flex flex-col gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="text-2xl font-bold text-indigo-600">{todayTasks.length}</div>
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Aktivitas Selesai</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="text-2xl font-bold text-slate-800">{habits.length}</div>
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Habit Sedang Diawasi</div>
              </div>
           </div>
        </motion.div>

        {/* Stats Summary */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow p-6">
           <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center justify-between">
              Status Karakter
              <button 
                onClick={() => setCurrentView('tasks')}
                className="text-indigo-600 hover:bg-indigo-50 p-1 rounded-md transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
           </h3>
           <div className="grid grid-cols-2 gap-3 flex-1">
              {Object.entries(stats).map(([stat, val]) => (
                 <div key={stat} className="bg-slate-50 border border-slate-100 rounded-lg p-3 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-600">{stat}</span>
                    <span className="text-sm font-semibold text-indigo-600">Lv {calculateLevel(val as number)}</span>
                 </div>
              ))}
           </div>
        </motion.div>

        {/* Active Projects */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }} className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow p-6">
           <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center justify-between">
              Project Aktif
              <button 
                onClick={() => setCurrentView('projects')}
                className="text-indigo-600 hover:bg-indigo-50 p-1 rounded-md transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
           </h3>
           <div className="flex-1 overflow-y-auto max-h-48 space-y-3">
              {projects.filter(p => p.status === 'ACTIVE').map(project => {
                 const currentVal = localProgress[project.id] !== undefined ? localProgress[project.id] : project.progress;
                 const hasUnsavedChanges = localProgress[project.id] !== undefined && localProgress[project.id] !== project.progress;

                 return (
                  <div key={project.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100 shadow-sm">
                    <div className="font-semibold text-sm text-slate-800 truncate">{project.name}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <input 
                        type="range" 
                        min="0" max="100" 
                        value={currentVal} 
                        onChange={(e) => handleSliderChange(project.id, parseInt(e.target.value))}
                        className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <span className="text-xs font-semibold text-indigo-600 w-8 text-right">{currentVal}%</span>
                      {hasUnsavedChanges && (
                        <button 
                          onClick={() => handleSaveProgress(project.id, project.progress)}
                          className="px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded hover:bg-slate-900 transition-colors shrink-0"
                        >
                          Save
                        </button>
                      )}
                    </div>
                  </div>
                 );
              })}
              {projects.filter(p => p.status === 'ACTIVE').length === 0 && (
                 <div className="text-xs text-slate-400 text-center py-4 italic">Belum ada project aktif.</div>
              )}
           </div>
        </motion.div>

      </div>

      {/* Quick Add Shortcuts */}
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mt-4">Jalan Pintas</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Activity', icon: Swords, action: () => setIsActivityOpen(true), color: 'text-rose-500', bg: 'bg-rose-50', border: 'hover:border-rose-200' },
          { label: 'Project', icon: Briefcase, action: () => setCurrentView('projects'), color: 'text-amber-500', bg: 'bg-amber-50', border: 'hover:border-amber-200' },
          { label: 'Finance', icon: Wallet, action: () => setIsFinanceOpen(true), color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'hover:border-emerald-200' },
          { label: 'Knowledge', icon: BookOpen, action: () => setCurrentView('knowledge'), color: 'text-blue-500', bg: 'bg-blue-50', border: 'hover:border-blue-200' },
          { label: 'Deeds', icon: Scale, action: () => setIsDeedsOpen(true), color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'hover:border-indigo-200' },
          { label: 'Habit', icon: ShieldAlert, action: () => setCurrentView('habits'), color: 'text-purple-500', bg: 'bg-purple-50', border: 'hover:border-purple-200' },
        ].map(shortcut => (
          <button 
            key={shortcut.label}
            onClick={shortcut.action}
            className={`bg-white border text-sm border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all hover:shadow-md ${shortcut.border}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${shortcut.bg} ${shortcut.color}`}>
              <Plus className="w-5 h-5 absolute opacity-0 hover:opacity-100 transition-opacity" />
              <shortcut.icon className="w-5 h-5 group-hover:opacity-0 transition-opacity" />
            </div>
            <span className="font-semibold text-slate-700">{shortcut.label}</span>
          </button>
        ))}
      </div>

      <AddActivityModal isOpen={isActivityOpen} onClose={() => setIsActivityOpen(false)} />
      <AddTransactionModal isOpen={isFinanceOpen} onClose={() => setIsFinanceOpen(false)} />
      <RecordDeedsModal isOpen={isDeedsOpen} onClose={() => setIsDeedsOpen(false)} />

      {/* Completion Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full relative">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-center text-slate-800 mb-2">Project Completed?</h3>
            <p className="text-sm text-center text-slate-500 mb-4">
              You marked this project as 100%. Are you sure it's fully completed? You will receive a reward!
            </p>
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Project Link (Optional)</label>
              <input 
                type="url" 
                value={projectLink}
                onChange={e => setProjectLink(e.target.value)}
                placeholder="https://my-project.com"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowCompleteModal(null)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 font-bold text-sm rounded-lg hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button onClick={confirmComplete} className="flex-1 px-4 py-2 bg-green-600 text-white font-bold text-sm rounded-lg hover:bg-green-700 transition-colors">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
