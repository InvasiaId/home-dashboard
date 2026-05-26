import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, CheckCircle, Gift, Plus, Calendar, AlertCircle, ExternalLink, BarChart3, Clock, Trophy } from 'lucide-react';
import { useProjectStore, Difficulty } from '../store/useProjectStore';
import { subDays, startOfWeek, startOfMonth, startOfYear, isAfter } from 'date-fns';

export function ProjectManagement() {
  const [activeTab, setActiveTab] = useState<'projects' | 'portfolio' | 'rewards' | 'analysis'>('projects');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Header & Tabs */}
      <div className="border-b border-slate-100 shrink-0 bg-slate-50/50">
        <div className="px-6 py-4 flex items-center gap-3">
          <Briefcase className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Project Management</h2>
        </div>
        <div className="flex px-4 gap-2">
          {['projects', 'portfolio', 'rewards', 'analysis'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 border-b-2 text-sm font-semibold capitalize transition-all ${
                activeTab === tab 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
        <AnimatePresence mode="wait">
          {activeTab === 'projects' && <ActiveProjects key="projects" />}
          {activeTab === 'portfolio' && <Portfolio key="portfolio" />}
          {activeTab === 'rewards' && <Rewards key="rewards" />}
          {activeTab === 'analysis' && <ProjectAnalysis key="analysis" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ActiveProjects() {
  const projects = useProjectStore(state => state.projects).filter(p => p.status === 'ACTIVE');
  const addProject = useProjectStore(state => state.addProject);
  const updateProgress = useProjectStore(state => state.updateProgress);
  const completeProject = useProjectStore(state => state.completeProject);
  
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
  
  const [localProgress, setLocalProgress] = useState<Record<string, number>>({});
  const [showCompleteModal, setShowCompleteModal] = useState<string | null>(null);
  const [projectLink, setProjectLink] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      addProject(name, difficulty);
      setName('');
      setDifficulty('EASY');
    }
  };

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
      // Remove from local to indicate sync
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
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
      {/* Create Form */}
      <form onSubmit={handleAdd} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full relative">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Project Name</label>
          <input 
            type="text" 
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g., Build Portfolio Website"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            required
          />
        </div>
        <div className="w-full md:w-48 relative">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Difficulty</label>
          <select 
            value={difficulty}
            onChange={e => setDifficulty(e.target.value as Difficulty)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-medium cursor-pointer"
          >
            <option value="EASY">Easy</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
        <button type="submit" className="w-full md:w-auto px-6 py-2 bg-indigo-600 text-white font-bold text-sm rounded-lg hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap">
          Add Project
        </button>
      </form>

      {/* Project List */}
      <div className="grid gap-4">
        {projects.map(project => {
          const currentVal = localProgress[project.id] !== undefined ? localProgress[project.id] : project.progress;
          const hasUnsavedChanges = localProgress[project.id] !== undefined && localProgress[project.id] !== project.progress;

          return (
            <div key={project.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-800">{project.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${project.difficulty === 'EASY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {project.difficulty}
                    </span>
                  </div>
                </div>
                <span className="text-xl font-bold text-slate-300">{currentVal}%</span>
              </div>
              
              <div className="flex gap-4 items-center mt-6">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={currentVal}
                  onChange={(e) => handleSliderChange(project.id, parseInt(e.target.value))}
                  className="flex-1 accent-indigo-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
                {hasUnsavedChanges && (
                  <button 
                    onClick={() => handleSaveProgress(project.id, project.progress)}
                    className="px-4 py-1.5 bg-slate-800 text-white text-xs font-bold rounded hover:bg-slate-900 transition-colors shrink-0"
                  >
                    Save
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {projects.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-sm bg-white rounded-xl border border-dashed border-slate-300">
            No active projects. Start a new one!
          </div>
        )}
      </div>

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
              <button 
                onClick={() => {
                  setShowCompleteModal(null);
                  setProjectLink('');
                }}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmComplete}
                className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700"
              >
                Yes, Complete it!
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function Portfolio() {
  const projects = useProjectStore(state => state.projects).filter(p => p.status === 'COMPLETED');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-4 lg:grid-cols-2">
      {projects.map(project => (
        <div key={project.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-slate-700">{project.name}</h3>
              <div className="flex items-center gap-2 mt-1.5 mb-3">
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${project.difficulty === 'EASY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {project.difficulty}
                </span>
                <span className="text-[10px] text-slate-400">
                  Completed on {new Date(project.completedAt!).toLocaleDateString()}
                </span>
              </div>
              
              {project.link && (
                <a 
                  href={project.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Live Preview
                </a>
              )}
            </div>
            <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
          </div>
        </div>
      ))}
      {projects.length === 0 && (
        <div className="col-span-full text-center py-10 text-slate-400 text-sm">
          No completed projects yet. Finish a project to build your portfolio!
        </div>
      )}
    </motion.div>
  );
}

function Rewards() {
  const rewards = useProjectStore(state => state.rewards);
  const claimReward = useProjectStore(state => state.claimReward);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {rewards.map(reward => (
        <div key={reward.id} className={`bg-white p-5 rounded-xl border shadow-sm transition-all relative overflow-hidden ${reward.isClaimed ? 'border-slate-200 opacity-60' : 'border-indigo-200 border-2 shadow-indigo-100'}`}>
          {/* Background decor */}
          {!reward.isClaimed && (
            <Gift className="absolute -right-4 -bottom-4 w-24 h-24 text-indigo-50 opacity-50" />
          )}

          <div className="relative">
            <div className="flex justify-between items-start mb-3">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${reward.difficulty === 'EASY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {reward.difficulty} REWARD
              </span>
              <input 
                type="checkbox" 
                checked={reward.isClaimed}
                onChange={() => claimReward(reward.id)}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>
            <h3 className="font-bold text-slate-800 text-sm mb-1">{reward.description}</h3>
            <p className="text-xs text-slate-500 mb-3">From: <span className="font-medium text-slate-600">{reward.projectName}</span></p>
            
            <div className="text-[10px] text-slate-400 font-mono">
              Earned: {new Date(reward.earnedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
      {rewards.length === 0 && (
        <div className="col-span-full text-center py-10 text-slate-400 text-sm bg-white rounded-xl border border-dashed border-slate-300">
          No rewards yet. Complete projects to earn checkout tokens!
        </div>
      )}
    </motion.div>
  );
}

function ProjectAnalysis() {
  const projects = useProjectStore(state => state.projects);
  const rewards = useProjectStore(state => state.rewards);

  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [difficultyFilter, setDifficultyFilter] = useState<'ALL' | 'EASY' | 'HARD'>('ALL');

  const stats = React.useMemo(() => {
    const now = new Date();
    let startDate = now;

    if (timeRange === 'day') startDate = subDays(now, 1);
    else if (timeRange === 'week') startDate = startOfWeek(now);
    else if (timeRange === 'month') startDate = startOfMonth(now);
    else if (timeRange === 'year') startDate = startOfYear(now);

    const filteredProjects = projects.filter(p => difficultyFilter === 'ALL' || p.difficulty === difficultyFilter);
    const filteredRewards = rewards.filter(r => difficultyFilter === 'ALL' || r.difficulty === difficultyFilter);

    return {
      activeProjects: filteredProjects.filter(p => p.status === 'ACTIVE' && isAfter(new Date(p.createdAt), startDate)).length,
      completedProjects: filteredProjects.filter(p => p.status === 'COMPLETED' && p.completedAt && isAfter(new Date(p.completedAt), startDate)).length,
      unclaimedRewards: filteredRewards.filter(r => !r.isClaimed && isAfter(new Date(r.earnedAt), startDate)).length,
      claimedRewards: filteredRewards.filter(r => r.isClaimed && isAfter(new Date(r.earnedAt), startDate)).length,
    };
  }, [projects, rewards, timeRange, difficultyFilter]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-500" />
          Filter Analytics
        </h3>
        <div className="flex gap-2 w-full sm:w-auto">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="flex-1 sm:flex-none text-xs px-3 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg outline-none cursor-pointer font-medium"
          >
            <option value="day">Last 24h</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <select 
            value={difficultyFilter} 
            onChange={(e) => setDifficultyFilter(e.target.value as any)}
            className="flex-1 sm:flex-none text-xs px-3 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg outline-none cursor-pointer font-medium"
          >
            <option value="ALL">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800 tracking-tight">{stats.activeProjects}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">Projects Pending</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800 tracking-tight">{stats.completedProjects}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">Projects Completed</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center shrink-0">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800 tracking-tight">{stats.unclaimedRewards}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">Rewards Pending</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800 tracking-tight">{stats.claimedRewards}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">Rewards Claimed</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
