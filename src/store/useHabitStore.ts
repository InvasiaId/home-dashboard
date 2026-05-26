import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Habit {
  id: string;
  name: string;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD format
  success: boolean;
}

interface HabitStore {
  habits: Habit[];
  logs: HabitLog[];
  addHabit: (name: string) => void;
  updateHabit: (id: string, name: string) => void;
  deleteHabit: (id: string) => void;
  toggleDailyLog: (habitId: string, date: string, success: boolean) => void;
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set) => ({
      habits: [],
      logs: [],
      addHabit: (name) => set(state => ({
        habits: [...state.habits, { id: crypto.randomUUID(), name, createdAt: new Date().toISOString() }]
      })),
      updateHabit: (id, name) => set(state => ({
        habits: state.habits.map(h => h.id === id ? { ...h, name } : h)
      })),
      deleteHabit: (id) => set(state => ({
        habits: state.habits.filter(h => h.id !== id),
        logs: state.logs.filter(l => l.habitId !== id)
      })),
      toggleDailyLog: (habitId, date, success) => set(state => {
        const existingLogIndex = state.logs.findIndex(l => l.habitId === habitId && l.date === date);
        if (existingLogIndex >= 0) {
          const newLogs = [...state.logs];
          newLogs[existingLogIndex].success = success;
          return { logs: newLogs };
        } else {
          return {
            logs: [...state.logs, { id: crypto.randomUUID(), habitId, date, success }]
          };
        }
      })
    }),
    {
      name: 'habit-storage'
    }
  )
);
