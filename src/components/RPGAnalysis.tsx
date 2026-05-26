import React, { useMemo, useState } from 'react';
import { useRPGStore, StatType } from '../store/useRPGStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, subDays, startOfWeek, startOfMonth, startOfYear, isAfter } from 'date-fns';

export function RPGAnalysis() {
  const history = useRPGStore(state => state.history);
  const templates = useRPGStore(state => state.activityTemplates);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');

  const chartData = useMemo(() => {
    const now = new Date();
    let startDate = now;

    if (timeRange === 'day') startDate = subDays(now, 1);
    else if (timeRange === 'week') startDate = startOfWeek(now);
    else if (timeRange === 'month') startDate = startOfMonth(now);
    else if (timeRange === 'year') startDate = startOfYear(now);

    const filteredHistory = history.filter(h => isAfter(new Date(h.timestamp), startDate));

    // Stats aggregation
    const statsCount: Record<string, number> = { STR: 0, INT: 0, AGI: 0, END: 0, CHA: 0, WIS: 0 };
    
    // Activity count aggregation
    const activityCountMap = new Map<string, number>();

    filteredHistory.forEach(log => {
      const template = templates.find(t => t.id === log.activityTemplateId);
      if (template) {
        template.stats.forEach(stat => {
          if (statsCount[stat] !== undefined) statsCount[stat]++;
        });
        
        activityCountMap.set(template.name, (activityCountMap.get(template.name) || 0) + 1);
      }
    });

    const statsData = Object.keys(statsCount).map(key => ({
      name: key,
      value: statsCount[key]
    }));

    const activityData = Array.from(activityCountMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // top 5 activities

    return { statsData, activityData };
  }, [history, templates, timeRange]);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <span className="text-sm font-semibold text-slate-500 uppercase tracking-tight">Quest Analysis</span>
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="text-xs px-2 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded outline-none cursor-pointer"
        >
          <option value="day">Last 24h</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <div className="flex-1 grid grid-rows-2 gap-6">
        <div className="w-full h-full flex flex-col">
          <span className="text-xs font-bold text-slate-400 uppercase mb-2">Stats Gained</span>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.statsData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="w-full h-full flex flex-col border-t border-slate-100 pt-4">
          <span className="text-xs font-bold text-slate-400 uppercase mb-2">Top Activities</span>
          {chartData.activityData.length > 0 ? (
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {chartData.activityData.map((act, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-slate-700 truncate pr-4">{act.name}</span>
                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded shrink-0">{act.count}x</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
              No data for this period
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
