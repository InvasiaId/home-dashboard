import React from 'react';
import { useRPGStore, StatType } from '../store/useRPGStore';
import { motion } from 'motion/react';
import { Dumbbell, Brain, Zap, Shield, HeartHandshake, Eye } from 'lucide-react';

const statIcons: Record<StatType, React.ReactNode> = {
  STR: <Dumbbell className="w-4 h-4 text-red-500" />,
  INT: <Brain className="w-4 h-4 text-blue-500" />,
  AGI: <Zap className="w-4 h-4 text-yellow-500" />,
  END: <Shield className="w-4 h-4 text-green-500" />,
  CHA: <HeartHandshake className="w-4 h-4 text-pink-500" />,
  WIS: <Eye className="w-4 h-4 text-purple-500" />,
};

const statColors: Record<StatType, string> = {
  STR: 'bg-red-500',
  INT: 'bg-blue-500',
  AGI: 'bg-yellow-500',
  END: 'bg-green-500',
  CHA: 'bg-pink-500',
  WIS: 'bg-purple-500',
};

const statLabels: Record<StatType, string> = {
  STR: 'Strength',
  INT: 'Intelligence',
  AGI: 'Agility',
  END: 'Endurance',
  CHA: 'Charisma',
  WIS: 'Wisdom',
};

export function RPGStats() {
  const stats = useRPGStore((state) => state.stats);

  const calculateLevel = (points: number) => Math.floor(points / 5) + 1;
  const calculateProgress = (points: number) => (points % 5) * 20;

  const totalPoints = Object.values(stats).reduce((a,b)=>a+b, 0);
    const overallLevel = Math.floor(totalPoints / 30) + 1;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow h-full">
      <div className="flex justify-between items-start mb-6">
        <span className="text-sm font-semibold text-slate-500 uppercase tracking-tight">Character Stats</span>
        <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded font-medium border border-indigo-100">Level {overallLevel}</span>
      </div>
      
      <div className="flex-1 flex flex-col gap-4">
        {(['STR', 'INT', 'AGI', 'END', 'CHA', 'WIS'] as StatType[]).map((key) => {
          const value = stats[key] || 0;
          const level = calculateLevel(value);
          const progress = calculateProgress(value);
          
          return (
            <div key={key}>
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                  {statIcons[key]}
                  <span className="text-xs font-bold text-slate-700 tracking-tight">{statLabels[key]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">LVL {level}</span>
                  <span className="text-xs font-medium text-slate-600 w-4 text-right">{value}</span>
                </div>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${progress}%` }} 
                  transition={{ duration: 1, type: "spring" }}
                  className={`h-full rounded-full ${statColors[key]}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
