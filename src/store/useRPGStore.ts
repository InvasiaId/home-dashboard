import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type StatType = 'STR' | 'INT' | 'AGI' | 'END' | 'CHA' | 'WIS';

export interface ActivityTemplate {
  id: string;
  name: string;
  stats: StatType[];
}

export interface ActivityHistory {
  id: string;
  activityTemplateId: string;
  timestamp: string;
}

interface RPGStore {
  stats: Record<StatType, number>;
  activityTemplates: ActivityTemplate[];
  history: ActivityHistory[];
  completeActivities: (activityIds: string[]) => void;
  getTodayActivities: () => ActivityHistory[];
  getStats: () => Record<StatType, number>;
  addTemplate: (template: Omit<ActivityTemplate, 'id'>) => void;
  updateTemplate: (id: string, template: Omit<ActivityTemplate, 'id'>) => void;
  deleteTemplate: (id: string) => void;
  addStat: (stat: StatType, amount: number) => void;
}

const defaultTemplates: ActivityTemplate[] = [
  { id: '1', name: 'Berolahraga (Angkat Beban)', stats: ['STR', 'END'] },
  { id: '2', name: 'Lari / Jogging', stats: ['AGI', 'END'] },
  { id: '3', name: 'Belajar Skill Baru', stats: ['INT'] },
  { id: '4', name: 'Beribadah', stats: ['WIS'] },
  { id: '5', name: 'Membaca Buku', stats: ['INT'] },
  { id: '6', name: 'Networking / Sosialisasi', stats: ['CHA'] },
  { id: '7', name: 'Membersihkan Rumah', stats: ['END', 'AGI'] },
  { id: '8', name: 'Deep Work / Fokus', stats: ['INT', 'END'] },
];

const initialStats: Record<StatType, number> = {
  STR: 0,
  INT: 0,
  AGI: 0,
  END: 0,
  CHA: 0,
  WIS: 0,
};

export const useRPGStore = create<RPGStore>()(
  persist(
    (set, get) => ({
      stats: initialStats,
      activityTemplates: defaultTemplates,
      history: [],
      completeActivities: (activityIds: string[]) => {
        set((state) => {
          const newHistory = [...state.history];
          const newStats = { ...state.stats };
          
          activityIds.forEach((id) => {
            const template = state.activityTemplates.find(t => t.id === id);
            if (template) {
              newHistory.push({
                id: crypto.randomUUID(),
                activityTemplateId: id,
                timestamp: new Date().toISOString(),
              });
              
              template.stats.forEach(stat => {
                newStats[stat] += 1;
              });
            }
          });
          
          return { history: newHistory, stats: newStats };
        });
      },
      getTodayActivities: () => {
        const { history } = get();
        const today = new Date().setHours(0, 0, 0, 0);
        return history.filter(h => new Date(h.timestamp).setHours(0, 0, 0, 0) === today).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      },
      getStats: () => {
        return get().stats;
      },
      addTemplate: (template) => set(state => ({
        activityTemplates: [...state.activityTemplates, { ...template, id: crypto.randomUUID() }]
      })),
      updateTemplate: (id, template) => set(state => ({
        activityTemplates: state.activityTemplates.map(t => t.id === id ? { ...t, ...template } : t)
      })),
      deleteTemplate: (id) => set(state => ({
        activityTemplates: state.activityTemplates.filter(t => t.id !== id)
      })),
      addStat: (stat, amount) => set((state) => ({
        stats: {
          ...state.stats,
          [stat]: state.stats[stat] + amount
        }
      }))
    }),
    {
      name: 'rpg-storage',
    }
  )
);
