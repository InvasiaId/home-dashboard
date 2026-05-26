import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, CheckCircle, XCircle, ListTodo, BarChart3, Settings2, Plus, Trash2, PenSquare, Flame } from 'lucide-react';
import { useHabitStore } from '../store/useHabitStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, subDays, startOfDay, eachDayOfInterval, parseISO, isSameDay, isBefore } from 'date-fns';

export function BadHabitManagement() {
  const [activeTab, setActiveTab] = useState<'today' | 'manage' | 'analytics'>('today');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="border-b border-slate-100 shrink-0 bg-slate-50/50">
        <div className="px-6 py-4 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Bad Habit Management</h2>
        </div>
        <div className="flex px-4 gap-2 overflow-x-auto hide-scrollbar">
          {[
            { id: 'today', label: 'Today Tracker', icon: ListTodo },
            { id: 'manage', label: 'Manage Habits', icon: Settings2 },
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
          {activeTab === 'today' && <TodayTracker key="today" />}
          {activeTab === 'manage' && <ManageHabits key="manage" />}
          {activeTab === 'analytics' && <HabitAnalytics key="analytics" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TodayTracker() {
  const habits = useHabitStore(state => state.habits);
  const logs = useHabitStore(state => state.logs);
  const toggleDailyLog = useHabitStore(state => state.toggleDailyLog);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
        <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-2">Daily Check-in</h3>
        <p className="text-sm text-slate-500 mb-4 tracking-wide">
          {format(new Date(), 'EEEE, MMMM do, yyyy')}
        </p>
        <p className="text-sm font-medium text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 inline-block text-left relative overflow-hidden group">
          <span className="relative z-10">Mark the habits you successfully <strong className="text-indigo-600 uppercase tracking-widest text-xs ml-0.5">avoided</strong> today.</span>
        </p>
      </div>

      <div className="grid gap-3">
        {habits.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
            No bad habits added yet. Go to Manage Habits to add some!
          </div>
        ) : (
          habits.map(habit => {
            const isSuccess = logs.find(l => l.habitId === habit.id && l.date === todayStr)?.success ?? false;
            return (
              <div 
                key={habit.id}
                onClick={() => toggleDailyLog(habit.id, todayStr, !isSuccess)}
                className={`p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                  isSuccess 
                    ? 'bg-green-50 border-green-500 shadow-sm scale-[1.01]' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border-2 transition-colors ${
                    isSuccess ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 text-transparent'
                  }`}>
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm ${isSuccess ? 'text-green-800' : 'text-slate-800'}`}>{habit.name}</h4>
                    {isSuccess && <div className="text-xs text-green-600 font-medium mt-0.5">Successfully Avoided</div>}
                  </div>
                </div>
                {isSuccess ? (
                  <Flame className="w-5 h-5 text-orange-500 drop-shadow-sm" />
                ) : (
                  <XCircle className="w-5 h-5 text-slate-300" />
                )}
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}

function ManageHabits() {
  const habits = useHabitStore(state => state.habits);
  const addHabit = useHabitStore(state => state.addHabit);
  const updateHabit = useHabitStore(state => state.updateHabit);
  const deleteHabit = useHabitStore(state => state.deleteHabit);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    if (editingId) {
      updateHabit(editingId, name);
    } else {
      addHabit(name);
    }
    setIsAdding(false);
    setEditingId(null);
    setName('');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-800">Your Bad Habits</h3>
          <p className="text-xs text-slate-500">Track and eliminate these behaviors.</p>
        </div>
        {!isAdding && !editingId && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Habit
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Habit Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Smoking, Biting nails..."
              autoFocus
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button 
              onClick={() => { setIsAdding(false); setEditingId(null); setName(''); }} 
              className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              disabled={!name.trim()}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              Save Habit
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {habits.map(habit => (
          <div key={habit.id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center hover:border-slate-300 transition-colors group">
            <h4 className="font-bold text-slate-800 text-sm">{habit.name}</h4>
            <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => { setEditingId(habit.id); setName(habit.name); setIsAdding(false); }} 
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
              >
                <PenSquare className="w-4 h-4" />
              </button>
              <button 
                onClick={() => deleteHabit(habit.id)} 
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {habits.length === 0 && <div className="text-center py-6 text-slate-400 text-sm">No bad habits to manage!</div>}
      </div>
    </motion.div>
  );
}

function HabitAnalytics() {
  const habits = useHabitStore(state => state.habits);
  const logs = useHabitStore(state => state.logs);

  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'all'>('week');
  const [habitFilter, setHabitFilter] = useState<string>('ALL');

  const analytics = useMemo(() => {
    const now = startOfDay(new Date());
    let startDate = now;

    if (timeRange === 'week') startDate = subDays(now, 6);
    else if (timeRange === 'month') startDate = subDays(now, 29);
    else if (timeRange === 'year') startDate = subDays(now, 364);
    else if (timeRange === 'all') {
      startDate = habits.length > 0 
        ? habits.reduce((earliest, h) => isBefore(parseISO(h.createdAt), earliest) ? parseISO(h.createdAt) : earliest, now)
        : now;
    }

    const filteredHabits = habitFilter === 'ALL' ? habits : habits.filter(h => h.id === habitFilter);
    const interval = eachDayOfInterval({ start: startDate, end: now });
    
    let totalSuccess = 0;
    let totalPossible = 0;

    const chartData = interval.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      let dailySuccess = 0;
      let dailyPossible = 0;

      filteredHabits.forEach(habit => {
        const createdAt = startOfDay(parseISO(habit.createdAt));
        if (isBefore(createdAt, date) || isSameDay(createdAt, date)) {
          dailyPossible++;
          const log = logs.find(l => l.habitId === habit.id && l.date === dateStr);
          if (log && log.success) {
            dailySuccess++;
          }
        }
      });

      totalSuccess += dailySuccess;
      totalPossible += dailyPossible;

      return {
        date: format(date, timeRange === 'year' || timeRange === 'all' ? 'MMM yyyy' : 'MMM dd'),
        successCount: dailySuccess,
        totalCount: dailyPossible,
        fullDate: dateStr
      };
    });

    let groupedChartData = chartData;
    if (timeRange === 'year' || timeRange === 'all') {
       const monthlyMap = new Map<string, { date: string, successCount: number, totalCount: number, fullDate: string }>();
       chartData.forEach(d => {
          const monthYear = format(parseISO(d.fullDate), 'MMM yyyy');
          if (!monthlyMap.has(monthYear)) {
             monthlyMap.set(monthYear, { date: monthYear, successCount: 0, totalCount: 0, fullDate: d.fullDate });
          }
          const item = monthlyMap.get(monthYear)!;
          item.successCount += d.successCount;
          item.totalCount += d.totalCount;
       });
       groupedChartData = Array.from(monthlyMap.values());
    }

    const overallSuccessRate = totalPossible === 0 ? 0 : Math.round((totalSuccess / totalPossible) * 100);

    return {
      chartData: groupedChartData,
      overallSuccessRate,
      totalSuccess,
      totalPossible
    };

  }, [habits, logs, timeRange, habitFilter]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-500" />
          Progress Filters
        </h3>
        <div className="flex gap-2 w-full sm:w-auto">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="flex-1 sm:flex-none text-xs px-3 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg outline-none cursor-pointer font-medium"
          >
            <option value="week">Past 7 Days</option>
            <option value="month">Past 30 Days</option>
            <option value="year">Past Year</option>
            <option value="all">All Time</option>
          </select>
          <select 
            value={habitFilter} 
            onChange={(e) => setHabitFilter(e.target.value as any)}
            className="flex-1 sm:flex-none text-xs px-3 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg outline-none cursor-pointer font-medium truncate max-w-[150px]"
          >
            <option value="ALL">All Habits</option>
            {habits.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
            <div className="text-lg font-bold">{analytics.overallSuccessRate}%</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">Overall Success</div>
            <div className="text-sm text-slate-600">{analytics.totalSuccess} / {analytics.totalPossible} days</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center shrink-0">
             <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800 tracking-tight">{analytics.totalSuccess}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">Days Avoided</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center shrink-0">
             <XCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800 tracking-tight">{analytics.totalPossible - analytics.totalSuccess}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">Days Failed</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[350px] flex flex-col">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-6">Success Over Time</h3>
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
                  formatter={(value: number, name: string) => [value, name === 'successCount' ? 'Successful Avoidances' : name]}
                />
                <Bar dataKey="successCount" fill="#10b981" radius={[4, 4, 0, 0]} name="successCount" maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-slate-400">No data available for this range.</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
