import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DeedType = 'GOOD' | 'BAD';

export interface DeedCategory {
  id: string;
  name: string;
  type: DeedType;
}

export interface DeedLog {
  id: string;
  categoryId: string;
  count: number;
  date: string; // YYYY-MM-DD
}

interface DeedsStore {
  categories: DeedCategory[];
  logs: DeedLog[];
  addCategory: (name: string, type: DeedType) => void;
  updateCategory: (id: string, name: string, type: DeedType) => void;
  deleteCategory: (id: string) => void;
  logDeeds: (date: string, selections: { categoryId: string; count: number }[]) => void;
}

const defaultCategories: DeedCategory[] = [
  { id: 'dg1', name: 'Membantu orang lain', type: 'GOOD' },
  { id: 'dg2', name: 'Sedekah', type: 'GOOD' },
  { id: 'dg3', name: 'Sholat tepat waktu', type: 'GOOD' },
  { id: 'dg4', name: 'Membaca buku bermanfaat', type: 'GOOD' },
  { id: 'db1', name: 'Berbohong', type: 'BAD' },
  { id: 'db2', name: 'Bergosip', type: 'BAD' },
  { id: 'db3', name: 'Marah berlebihan', type: 'BAD' },
  { id: 'db4', name: 'Membuang waktu percuma', type: 'BAD' },
];

export const useDeedsStore = create<DeedsStore>()(
  persist(
    (set) => ({
      categories: defaultCategories,
      logs: [],
      addCategory: (name, type) => set(state => ({
        categories: [...state.categories, { id: crypto.randomUUID(), name, type }]
      })),
      updateCategory: (id, name, type) => set(state => ({
        categories: state.categories.map(c => c.id === id ? { ...c, name, type } : c)
      })),
      deleteCategory: (id) => set(state => ({
        categories: state.categories.filter(c => c.id !== id),
        logs: state.logs.filter(l => l.categoryId !== id)
      })),
      logDeeds: (date, selections) => set(state => {
        const newLogs = [...state.logs];
        
        for (const { categoryId, count } of selections) {
          if (count <= 0) continue;
          
          const existingIndex = newLogs.findIndex(l => l.date === date && l.categoryId === categoryId);
          if (existingIndex >= 0) {
            newLogs[existingIndex] = { ...newLogs[existingIndex], count: newLogs[existingIndex].count + count };
          } else {
            newLogs.push({
              id: crypto.randomUUID(),
              categoryId,
              count,
              date
            });
          }
        }
        
        return { logs: newLogs };
      })
    }),
    {
      name: 'deeds-storage'
    }
  )
);
