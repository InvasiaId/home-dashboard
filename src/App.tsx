/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LayoutDashboard, Settings, Activity, Swords, Briefcase, Wallet, StickyNote, ShieldAlert, Scale } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RPGStats } from './components/RPGStats';
import { DailyActivityLog } from './components/DailyActivityLog';
import { ActivityManager } from './components/ActivityManager';
import { RPGAnalysis } from './components/RPGAnalysis';
import { ProjectManagement } from './components/ProjectManagement';
import { FinanceManagement } from './components/FinanceManagement';
import { NotesSystem } from './components/NotesSystem';
import { QuickNoteModal } from './components/QuickNoteModal';
import { BadHabitManagement } from './components/BadHabitManagement';
import { DeedsManagement } from './components/DeedsManagement';
import { KnowledgeManagement } from './components/KnowledgeManagement';
import { DashboardOverview } from './components/DashboardOverview';
import { BookOpen, Bell } from 'lucide-react';

import { SettingsMenu } from './components/SettingsMenu';
import { useProfileStore } from './store/useProfileStore';
import { useDeedsStore } from './store/useDeedsStore';
import { format } from 'date-fns';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'tasks' | 'projects' | 'finance' | 'notes' | 'habits' | 'deeds' | 'knowledge' | 'settings'>('dashboard');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { name, avatarUrl } = useProfileStore();

  const logs = useDeedsStore(state => state.logs);
  const categories = useDeedsStore(state => state.categories);

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLogs = logs.filter(l => l.date === today);
  
  let todayGood = 0;
  let todayBad = 0;
  todayLogs.forEach(log => {
     const cat = categories.find(c => c.id === log.categoryId);
     if (cat?.type === 'GOOD') todayGood += log.count;
     if (cat?.type === 'BAD') todayBad += log.count;
  });

  const alerts = [];
  if (todayBad > todayGood) {
      alerts.push("Perhatian! Hari ini amalan burukmu lebih banyak dari amalan baik. Jangan lupa berbuat baik hari ini!");
  }

  return (
    <div className="w-full h-screen bg-slate-50 flex font-sans overflow-hidden text-slate-900">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shrink-0">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">{name.charAt(0)}</div>
            <span className="font-semibold text-lg tracking-tight">DevDash v1.0</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <div 
            onClick={() => setCurrentView('dashboard')}
            className={`${currentView === 'dashboard' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'} px-4 py-2.5 rounded-md font-medium text-sm flex items-center gap-3 cursor-pointer transition-colors`}
          >
            <LayoutDashboard className={`w-4 h-4 ${currentView === 'dashboard' ? 'text-indigo-600' : ''}`} />
            Dashboard Overview
          </div>
          <div 
            onClick={() => setCurrentView('tasks')}
            className={`${currentView === 'tasks' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'} px-4 py-2.5 rounded-md font-medium text-sm flex items-center gap-3 cursor-pointer transition-colors`}
          >
            <Swords className={`w-4 h-4 ${currentView === 'tasks' ? 'text-indigo-600' : ''}`} />
            Daily Quests
          </div>
          <div 
            onClick={() => setCurrentView('projects')}
            className={`${currentView === 'projects' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'} px-4 py-2.5 rounded-md font-medium text-sm flex items-center gap-3 cursor-pointer transition-colors`}
          >
            <Briefcase className={`w-4 h-4 ${currentView === 'projects' ? 'text-indigo-600' : ''}`} />
            Project Management
          </div>
          <div 
            onClick={() => setCurrentView('finance')}
            className={`${currentView === 'finance' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'} px-4 py-2.5 rounded-md font-medium text-sm flex items-center gap-3 cursor-pointer transition-colors`}
          >
            <Wallet className={`w-4 h-4 ${currentView === 'finance' ? 'text-indigo-600' : ''}`} />
            Finance Management
          </div>
          <div 
            onClick={() => setCurrentView('notes')}
            className={`${currentView === 'notes' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'} px-4 py-2.5 rounded-md font-medium text-sm flex items-center gap-3 cursor-pointer transition-colors`}
          >
            <StickyNote className={`w-4 h-4 ${currentView === 'notes' ? 'text-indigo-600' : ''}`} />
            Notes System
          </div>
          <div 
            onClick={() => setCurrentView('habits')}
            className={`${currentView === 'habits' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'} px-4 py-2.5 rounded-md font-medium text-sm flex items-center gap-3 cursor-pointer transition-colors`}
          >
            <ShieldAlert className={`w-4 h-4 ${currentView === 'habits' ? 'text-indigo-600' : ''}`} />
            Bad Habits Management
          </div>
          <div 
            onClick={() => setCurrentView('deeds')}
            className={`${currentView === 'deeds' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'} px-4 py-2.5 rounded-md font-medium text-sm flex items-center gap-3 cursor-pointer transition-colors`}
          >
            <Scale className={`w-4 h-4 ${currentView === 'deeds' ? 'text-indigo-600' : ''}`} />
            Deeds Management
          </div>
          <div 
            onClick={() => setCurrentView('knowledge')}
            className={`${currentView === 'knowledge' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'} px-4 py-2.5 rounded-md font-medium text-sm flex items-center gap-3 cursor-pointer transition-colors`}
          >
            <BookOpen className={`w-4 h-4 ${currentView === 'knowledge' ? 'text-indigo-600' : ''}`} />
            Knowledge Management
          </div>
          <div 
            onClick={() => setCurrentView('settings')}
            className={`${currentView === 'settings' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'} px-4 py-2.5 rounded-md font-medium text-sm flex items-center gap-3 cursor-pointer transition-colors`}
          >
            <Settings className={`w-4 h-4 ${currentView === 'settings' ? 'text-indigo-600' : ''}`} />
            System Settings
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 relative">
          <h1 className="text-xl font-semibold tracking-tight">Personal Workspace</h1>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
            >
              <Bell className="w-5 h-5" />
              {alerts.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              )}
            </button>
            <span className="font-semibold text-sm">{name}</span>
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center">
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fallback')} />
            </div>
          </div>
          
          {/* Notification Dropdown */}
          <AnimatePresence>
             {isNotifOpen && (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="absolute top-full right-8 mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50"
               >
                 <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 font-bold text-sm text-slate-800 flex justify-between items-center">
                   Notifications
                   <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs">{alerts.length}</span>
                 </div>
                 <div className="max-h-64 overflow-y-auto">
                    {alerts.length > 0 ? (
                      alerts.map((alert, i) => (
                         <div key={i} className="p-4 border-b border-slate-100 text-sm text-slate-700 bg-red-50/50 flex gap-3 items-start">
                           <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                           <p className="leading-relaxed">{alert}</p>
                         </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-400 text-sm">
                         Belum ada notifikasi.
                      </div>
                    )}
                 </div>
               </motion.div>
             )}
          </AnimatePresence>
        </header>

        {/* Dashboard Widgets Grid */}
        <section className={`p-8 flex-1 overflow-y-auto ${currentView === 'projects' || currentView === 'finance' || currentView === 'notes' || currentView === 'habits' || currentView === 'deeds' || currentView === 'knowledge' || currentView === 'dashboard' ? 'block items-stretch' : 'grid gap-6'} ${currentView === 'tasks' ? 'grid-cols-1 lg:grid-cols-2' : ''}`}>
          
          {currentView === 'dashboard' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <DashboardOverview setCurrentView={setCurrentView} />
            </motion.div>
          )}

          {currentView === 'tasks' && (
            <>
              {/* Stat Card: Character Stats */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <RPGStats />
              </motion.div>

              {/* Stat Card: Daily Quests */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
                <DailyActivityLog />
              </motion.div>

              {/* Stat Card: Manage Activities */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
                <ActivityManager />
              </motion.div>

              {/* Stat Card: Analysis */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}>
                <RPGAnalysis />
              </motion.div>
            </>
          )}

          {currentView === 'projects' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="h-full">
              <ProjectManagement />
            </motion.div>
          )}

          {currentView === 'finance' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="h-full">
              <FinanceManagement />
            </motion.div>
          )}

          {currentView === 'notes' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="h-full">
              <NotesSystem />
            </motion.div>
          )}

          {currentView === 'habits' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="h-full">
              <BadHabitManagement />
            </motion.div>
          )}

          {currentView === 'deeds' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="h-full">
              <DeedsManagement />
            </motion.div>
          )}

          {currentView === 'knowledge' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="h-full">
              <KnowledgeManagement />
            </motion.div>
          )}

          {currentView === 'settings' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="h-full">
              <SettingsMenu />
            </motion.div>
          )}

        </section>
      </main>

      {/* Global Modals */}
      <QuickNoteModal />
    </div>
  );
}
