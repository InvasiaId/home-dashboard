import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { useFinanceStore } from '../store/useFinanceStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell, PieChart, Pie } from 'recharts';
import { subDays, startOfWeek, startOfMonth, startOfYear, isAfter } from 'date-fns';
import { TrendingUp, TrendingDown, Layers, Landmark } from 'lucide-react';

export function FinanceAnalytics() {
  const transactions = useFinanceStore(state => state.transactions);
  const categories = useFinanceStore(state => state.categories);
  const accounts = useFinanceStore(state => state.accounts);

  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [accountFilter, setAccountFilter] = useState<'ALL' | string>('ALL');

  const analytics = useMemo(() => {
    const now = new Date();
    let startDate = now;

    if (timeRange === 'day') startDate = subDays(now, 1);
    else if (timeRange === 'week') startDate = startOfWeek(now);
    else if (timeRange === 'month') startDate = startOfMonth(now);
    else if (timeRange === 'year') startDate = startOfYear(now);

    const filtered = transactions.filter(t => {
      const matchDate = isAfter(new Date(t.date), startDate);
      const matchType = typeFilter === 'ALL' || t.type === typeFilter;
      const matchAccount = accountFilter === 'ALL' || t.accountId === accountFilter;
      return matchDate && matchType && matchAccount;
    });

    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    const categoryMap = new Map<string, number>();

    filtered.forEach(t => {
      if (t.type === 'INCOME') {
        totalIncome += t.amount;
        incomeCount++;
      } else {
        totalExpense += t.amount;
        expenseCount++;
      }

      const catName = categories.find(c => c.id === t.categoryId)?.name || 'Unknown';
      categoryMap.set(catName, (categoryMap.get(catName) || 0) + t.amount);
    });

    const categoryData = Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Grouping for Comparison Chart (Day/Week/Month/Year logic is simplified here)
    // For a real app, you might group by day of week or month. Here we just show aggregate.
    const comparisonData = [
      { name: 'Income', value: totalIncome, fill: '#10b981' },
      { name: 'Expense', value: totalExpense, fill: '#ef4444' }
    ];

    return { totalIncome, totalExpense, incomeCount, expenseCount, categoryData, comparisonData, filteredLength: filtered.length };
  }, [transactions, categories, timeRange, typeFilter, accountFilter]);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#14b8a6', '#0ea5e9'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2 lg:mb-0">
          <Layers className="w-4 h-4 text-indigo-500" />
          Finance Analytics Filter
        </h3>
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <select 
            value={timeRange} onChange={(e) => setTimeRange(e.target.value as any)}
            className="flex-1 lg:flex-none text-xs px-3 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg outline-none"
          >
            <option value="day">Last 24h</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <select 
            value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)}
            className="flex-1 lg:flex-none text-xs px-3 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
          <select 
            value={accountFilter} onChange={(e) => setAccountFilter(e.target.value)}
            className="flex-1 lg:flex-none text-xs px-3 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg outline-none"
          >
            <option value="ALL">All Accounts</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-xl font-bold text-slate-800 tracking-tight truncate">Rp {analytics.totalIncome.toLocaleString()}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">{analytics.incomeCount} Income Txns</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-xl font-bold text-slate-800 tracking-tight truncate">Rp {analytics.totalExpense.toLocaleString()}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">{analytics.expenseCount} Expense Txns</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Comparison Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[350px] flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-6">Income vs Expense</h3>
          <div className="flex-1 w-full min-h-0">
            {analytics.filteredLength > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.comparisonData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }} 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} 
                    formatter={(value: number) => [`Rp ${value.toLocaleString()}`, 'Amount']}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {analytics.comparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-slate-400">No data for selected filters.</div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[350px] flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-6">Transaction Breakdown</h3>
          <div className="flex-1 w-full min-h-0">
            {analytics.categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {analytics.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                    formatter={(value: number) => [`Rp ${value.toLocaleString()}`, 'Amount']}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-slate-400">No data for selected filters.</div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
